// ============================================================================
// src/sample/screen/routine/plugins/cardSettlePlugin.tsx
// 4. 급여·카드 일괄 정산 루틴 플러그인 (명세서 OCR 자동세팅 · 은행별 분리합산 · 토스/카톡 이체 · TRANSFER)
// ============================================================================

import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  ArrowRightLeft,
  ExternalLink,
  ChevronRight,
  Building2,
  Send,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react';
import { ElmInp01 } from '../../../elements/Tokens';
import {
  maskAccountNumber,
  buildSafeTossTransferUrl,
} from '../../../shared/securityGuards';
import {
  OcrConfirmBadge,
  OcrFieldShell,
  RoutineAttachmentDropBar,
  OcrFieldReviewMap,
  RoutineUploadedFile,
} from '../../../shared/routineOcrFields';
import {
  CardSettlementRoutine,
  CardStatementItem,
  ROUTINE_CATEGORY_META,
  ROUTINE_TODAY_ISO,
  evaluateUrgencyFSM,
} from '../types';
import {
  RoutinePlugin,
  RoutineHelpTooltip,
  RoutineCreateDraft,
  CreateFieldsHelpers,
  RoutineCardActionHandlers,
} from './pluginContract';

const meta = ROUTINE_CATEGORY_META.FINANCE_CARD_SETTLE;

function buildSampleStatementCards(): CardStatementItem[] {
  const ts = Date.now();
  return [
    {
      cardId: `card-${ts}-woori`,
      cardName: '우리카드',
      itemCategory: 'CARD',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 2825598,
      repaidAmount: 2825598,
      syncSource: 'OCR',
      status: 'TRANSFERRED',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-samsung`,
      cardName: '삼성카드',
      itemCategory: 'CARD',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 761900,
      repaidAmount: 0,
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-nh`,
      cardName: '농협카드',
      itemCategory: 'CARD',
      targetBank: '농협은행',
      targetAccountNo: '302-****-7741',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 552277,
      repaidAmount: 0,
      prepaidMemo: '선결제 수수료 확인',
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-hyundai`,
      cardName: '현대카드',
      itemCategory: 'CARD',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 547860,
      repaidAmount: 0,
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-kb`,
      cardName: '국민카드',
      itemCategory: 'CARD',
      targetBank: '국민은행',
      targetAccountNo: '4512-****-0912',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 457436,
      repaidAmount: 0,
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-bc`,
      cardName: '비씨카드',
      itemCategory: 'CARD',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 48700,
      repaidAmount: 25950,
      prepaidMemo: '선결제 25,950원 반영',
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-ins`,
      cardName: '국민.보험 (건강+연금)',
      itemCategory: 'FIXED',
      targetBank: '국민은행',
      targetAccountNo: '4512-****-0912',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 318720,
      repaidAmount: 0,
      prepaidMemo: '건강 169,480 + 연금 149,240',
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      cardId: `card-${ts}-sav`,
      cardName: '우리.청약 + IRP',
      itemCategory: 'FIXED',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: '2026-11-13',
      amount: 190000,
      repaidAmount: 0,
      prepaidMemo: '청약 10+2+2 + IRP 5만원',
      syncSource: 'OCR',
      status: 'PENDING',
      ocrReview: 'AUTO_UNCONFIRMED',
    },
  ];
}

function getRemainingAmount(card: CardStatementItem): number {
  return Math.max(0, card.amount - (card.repaidAmount || 0));
}

const CardSettleCreateFields: React.FC<{
  draft: RoutineCreateDraft;
  helpers: CreateFieldsHelpers;
}> = ({ draft, helpers }) => {
  const applyStatementOcr = (files?: RoutineUploadedFile[]) => {
    const sampleCards = buildSampleStatementCards();
    const sourceFiles: RoutineUploadedFile[] =
      files && files.length > 0
        ? files
        : [
            {
              fileName: '우리카드_2611명세서.jpg',
              previewUrl: '/assets/aistudio/_______4247a5f7.jpg',
              isImage: true,
            },
            {
              fileName: '카드대금_2611_13_정산표.jpg',
              previewUrl: '/assets/aistudio/______5f18cb80.jpg',
              isImage: true,
            },
          ];
    const newAttachments = sourceFiles.map((file, idx) => ({
      attachmentId: `att-card-${Date.now()}-${idx}`,
      fileName: file.fileName,
      uploadedAt: ROUTINE_TODAY_ISO,
      ocrSummary: '카드 6사 + 고정지출 2건 · 결제금액/상환/결제은행 자동추출',
      previewUrl: file.previewUrl,
      isImageOcr: file.isImage,
    }));

    const nextMap: OcrFieldReviewMap = {
      ...draft.ocrReviewMap,
      settlementYearMonth: 'AUTO_UNCONFIRMED',
      dueDate: 'AUTO_UNCONFIRMED',
      sourceBankName: 'AUTO_UNCONFIRMED',
      settlementMemo: 'AUTO_UNCONFIRMED',
    };
    sampleCards.forEach((c) => {
      nextMap[`card:${c.cardId}`] = 'AUTO_UNCONFIRMED';
    });

    helpers.patchDraft({
      autoTitle: '2026년 11월 급여·카드대금 정산 (2611.13)',
      autoSubtitle: '카드명세서 OCR 자동등록 · 6대 카드 + 보험·청약 은행별 분리 정산',
      settlementYearMonth: '2026-11',
      dueDate: '2026-11-13',
      sourceBankName: '우리은행 급여통장',
      settlementMemo:
        '결제일: 23일 (모든카드) · 농협선결제 수수료 확인 · 건강+연금 318,720 · 우리청약+IRP 190,000',
      cards: draft.cards.length > 0 ? [...draft.cards, ...sampleCards] : sampleCards,
      attachments: [...draft.attachments, ...newAttachments],
      ocrReviewMap: nextMap,
    });
  };

  const updateCardRow = (cardId: string, patch: Partial<CardStatementItem>) => {
    const nextCards = draft.cards.map((c) => {
      if (c.cardId !== cardId) return c;
      const merged = { ...c, ...patch, ocrReview: 'EDITED' as const };
      const rem = Math.max(0, merged.amount - (merged.repaidAmount || 0));
      return { ...merged, status: rem === 0 && merged.amount > 0 ? ('TRANSFERRED' as const) : ('PENDING' as const) };
    });
    helpers.patchDraft({
      cards: nextCards,
      ocrReviewMap: { ...draft.ocrReviewMap, [`card:${cardId}`]: 'EDITED' },
    });
  };

  const toggleCardConfirm = (cardId: string) => {
    const nextCards = draft.cards.map((c) => {
      if (c.cardId !== cardId) return c;
      const nextState: 'CONFIRMED' | 'AUTO_UNCONFIRMED' =
        c.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
      return { ...c, ocrReview: nextState };
    });
    const target = nextCards.find((c) => c.cardId === cardId);
    helpers.patchDraft({
      cards: nextCards,
      ocrReviewMap: {
        ...draft.ocrReviewMap,
        [`card:${cardId}`]: target?.ocrReview || 'CONFIRMED',
      },
    });
  };

  const addEmptyCard = () => {
    const newCard: CardStatementItem = {
      cardId: `card-${Date.now()}`,
      cardName: '',
      itemCategory: 'CARD',
      targetBank: '우리은행',
      targetAccountNo: '1002-****-1120',
      paymentDay: 23,
      depositDate: draft.dueDate || '2026-11-13',
      amount: 0,
      repaidAmount: 0,
      syncSource: 'MANUAL',
      status: 'PENDING',
      ocrReview: 'EDITED',
    };
    helpers.patchDraft({ cards: [...draft.cards, newCard] });
  };

  const removeCard = (cardId: string) => {
    const nextCards = draft.cards.filter((c) => c.cardId !== cardId);
    const nextMap = { ...draft.ocrReviewMap };
    delete nextMap[`card:${cardId}`];
    helpers.patchDraft({ cards: nextCards, ocrReviewMap: nextMap });
  };

  const handleConfirmAll = () => {
    helpers.confirmAllFields();
    if (draft.cards.length > 0) {
      helpers.patchDraft({
        cards: draft.cards.map((c) => ({
          ...c,
          ocrReview: c.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : c.ocrReview,
        })),
      });
    }
  };

  const totalBill = draft.cards.reduce((s, c) => s + c.amount, 0);
  const totalRem = draft.cards.reduce((s, c) => s + getRemainingAmount(c), 0);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
      <RoutineAttachmentDropBar
        title="카드명세서 이미지 첨부 OCR 자동 세팅"
        description="카드사별 명세서 이미지를 첨부하면 결제은행, 결제금액, 상환금액, 남은결제금액 및 고정정산(보험·청약)이 자동 세팅됩니다. 각 항목은 수정 및 터치 확인이 가능합니다."
        uploadButtonLabel="카드명세서 첨부"
        sampleButtonLabel="카드대금 2611.13 예시 적용"
        accentTone="indigo"
        attachments={draft.attachments}
        reviewMap={draft.ocrReviewMap}
        onFilesUploaded={(files) => applyStatementOcr(files)}
        onSampleApply={() => applyStatementOcr()}
        onConfirmAll={handleConfirmAll}
        onRemoveAttachment={helpers.removeAttachment}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OcrFieldShell
          label="정산 년월"
          reviewState={draft.ocrReviewMap.settlementYearMonth}
          onToggleConfirm={() => helpers.toggleFieldConfirm('settlementYearMonth')}
        >
          <ElmInp01
            value={draft.settlementYearMonth}
            onChange={(v) => helpers.updateField('settlementYearMonth', v)}
            placeholder="2026-11"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="입금일 (급여일)"
          reviewState={draft.ocrReviewMap.dueDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('dueDate')}
        >
          <ElmInp01
            type="date"
            value={draft.dueDate}
            onChange={(v) => helpers.updateField('dueDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="출금 급여계좌명"
          reviewState={draft.ocrReviewMap.sourceBankName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('sourceBankName')}
          className="sm:col-span-2"
        >
          <ElmInp01
            value={draft.sourceBankName}
            onChange={(v) => helpers.updateField('sourceBankName', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="정산 · 선결제 메모"
          reviewState={draft.ocrReviewMap.settlementMemo}
          onToggleConfirm={() => helpers.toggleFieldConfirm('settlementMemo')}
          className="sm:col-span-2"
        >
          <ElmInp01
            value={draft.settlementMemo}
            onChange={(v) => helpers.updateField('settlementMemo', v)}
            placeholder="예: 결제일 23일, 농협선결제 수수료 확인"
          />
        </OcrFieldShell>
      </div>

      {/* 카드/고정정산 다중 항목 (OCR 자동등록 또는 수동 추가) */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 tabular-nums">
            정산 항목 ({draft.cards.length}건 · 총 {totalBill.toLocaleString()}원 · 잔액 {totalRem.toLocaleString()}원)
          </span>
          <button
            type="button"
            onClick={addEmptyCard}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            카드사 추가
          </button>
        </div>

        {draft.cards.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ElmInp01
              label="청구 카드사명"
              value={draft.initialCardName}
              onChange={(v) => helpers.updateField('initialCardName', v)}
              placeholder="예: 우리카드"
            />
            <ElmInp01
              label="결제은행"
              value={draft.initialCardBank}
              onChange={(v) => helpers.updateField('initialCardBank', v)}
              placeholder="예: 우리은행"
            />
            <ElmInp01
              label="결제금액 (원)"
              type="number"
              inputMode="numeric"
              value={draft.initialCardAmount}
              onChange={(v) => helpers.updateField('initialCardAmount', v)}
            />
            <ElmInp01
              label="상환금액 (선결제, 원)"
              type="number"
              inputMode="numeric"
              value={draft.initialRepaidAmount}
              onChange={(v) => helpers.updateField('initialRepaidAmount', v)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {draft.cards.map((card) => {
              const rem = getRemainingAmount(card);
              return (
                <div
                  key={card.cardId}
                  className={`p-2.5 rounded-lg border space-y-2 ${
                    card.ocrReview === 'AUTO_UNCONFIRMED'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800'
                      : 'bg-slate-50/70 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                        {card.itemCategory === 'FIXED' ? '고정정산' : '카드대금'}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-zinc-300">
                        남은결제 {rem.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <OcrConfirmBadge
                        state={card.ocrReview}
                        onToggleConfirm={() => toggleCardConfirm(card.cardId)}
                        compact
                      />
                      <button
                        type="button"
                        onClick={() => removeCard(card.cardId)}
                        aria-label="항목 삭제"
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <ElmInp01
                        value={card.cardName}
                        onChange={(v) => updateCardRow(card.cardId, { cardName: v })}
                        placeholder="카드사"
                      />
                    </div>
                    <div className="col-span-3">
                      <ElmInp01
                        value={card.targetBank}
                        onChange={(v) => updateCardRow(card.cardId, { targetBank: v })}
                        placeholder="결제은행"
                      />
                    </div>
                    <div className="col-span-3">
                      <ElmInp01
                        type="number"
                        inputMode="numeric"
                        value={String(card.amount)}
                        onChange={(v) => updateCardRow(card.cardId, { amount: Math.max(0, Number(v) || 0) })}
                        placeholder="결제금액"
                      />
                    </div>
                    <div className="col-span-2">
                      <ElmInp01
                        type="number"
                        inputMode="numeric"
                        value={String(card.repaidAmount)}
                        onChange={(v) =>
                          updateCardRow(card.cardId, { repaidAmount: Math.max(0, Number(v) || 0) })
                        }
                        placeholder="상환"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const CardSettleDetailView: React.FC<{
  item: CardSettlementRoutine;
  handlers: RoutineCardActionHandlers;
}> = ({ item, handlers }) => {
  const [groupByBank, setGroupByBank] = useState(false);

  const totalAmount = item.cards.reduce((sum, c) => sum + c.amount, 0);
  const totalRepaid = item.cards.reduce((sum, c) => sum + (c.repaidAmount || 0), 0);
  const totalRemaining = Math.max(0, totalAmount - totalRepaid);

  const detailReviewMap: OcrFieldReviewMap = {};
  item.cards.forEach((c) => {
    if (c.ocrReview) detailReviewMap[c.cardId] = c.ocrReview;
  });

  // 결제은행별 분리 합산 그룹 계산
  const bankGroups = Array.from(
    item.cards.reduce((acc, card) => {
      const key = card.targetBank;
      const prev = acc.get(key) || {
        bankName: key,
        accountNo: card.targetAccountNo,
        totalAmount: 0,
        remainingAmount: 0,
        items: [] as CardStatementItem[],
      };
      prev.totalAmount += card.amount;
      prev.remainingAmount += getRemainingAmount(card);
      prev.items.push(card);
      acc.set(key, prev);
      return acc;
    }, new Map<string, { bankName: string; accountNo: string; totalAmount: number; remainingAmount: number; items: CardStatementItem[] }>())
  ).map(([, value]) => value);

  const handleCopyKakaoText = (label: string, bank: string, account: string, amount: number) => {
    const text = `[모아보고 ${item.settlementYearMonth} 정산] ${label} · ${bank} ${maskAccountNumber(
      account
    )} · ${amount.toLocaleString()}원 입금 요청`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
    handlers.onNotify(`카톡 공유용 이체 안내가 복사되었습니다 (${amount.toLocaleString()}원)`, 'info');
  };

  const handleTossDeepLink = (bank: string, account: string, amount: number) => {
    const res = buildSafeTossTransferUrl(bank, account, amount);
    if (!res.valid || !res.sanitizedUrl) {
      handlers.onNotify(res.reason || '안전한 토스 송금 링크를 생성할 수 없습니다.', 'error');
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(res.sanitizedUrl).catch(() => undefined);
    }
    handlers.onNotify(
      `토스 안전 송금 URL 생성·복사 완료 (${bank} ${amount.toLocaleString()}원)`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* 카드명세서 추가 첨부 OCR 바 */}
      <RoutineAttachmentDropBar
        title="카드명세서 추가 첨부 및 자동입력 확인"
        description="미등록 카드명세서 이미지를 추가 첨부하면 기존 정산 항목을 유지하면서 카드사·결제은행·금액이 자동 추가됩니다."
        uploadButtonLabel="명세서 추가 첨부"
        sampleButtonLabel="추가 명세서 OCR 테스트"
        accentTone="indigo"
        attachments={item.attachments ?? []}
        reviewMap={detailReviewMap}
        onFilesUploaded={(files) => handlers.onAttachOcrFiles(item.id, files)}
        onSampleApply={() =>
          handlers.onAttachOcrFiles(item.id, [
            {
              fileName: '신한카드_2611명세서.jpg',
              previewUrl: '/assets/aistudio/_______4247a5f7.jpg',
              isImage: true,
            },
          ])
        }
        onConfirmAll={() => handlers.onConfirmAllOcrItems(item.id)}
      />

      {/* 핵심 3지표 요약 (지출금액합 · 상환금액 · 남은결제금액) */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs">
        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">결제금액 합계</div>
          <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
            {totalAmount.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">상환 완료</div>
          <div className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalRepaid.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">남은결제금액</div>
          <div className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {totalRemaining.toLocaleString()}원
          </div>
        </div>
      </div>

      {item.settlementMemo && (
        <div className="p-3 rounded-lg bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
          {item.settlementMemo}
        </div>
      )}

      {/* 항목별 vs 결제은행별 분리 합산 스위처 */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
          정산 내역 ({item.cards.length}건)
        </span>
        <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 dark:bg-zinc-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setGroupByBank(false)}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              !groupByBank
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            카드·고정 항목별
          </button>
          <button
            type="button"
            onClick={() => setGroupByBank(true)}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              groupByBank
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            결제은행별 합산
          </button>
        </div>
      </div>

      {!groupByBank ? (
        <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {item.cards.map((card) => {
            const rem = getRemainingAmount(card);
            const isDone = card.status === 'TRANSFERRED';
            return (
              <div
                key={card.cardId}
                className="px-3.5 py-3 bg-white dark:bg-zinc-900/40 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handlers.onToggleCardPayment(item.id, card.cardId)}
                      aria-label="이체 완료 체크"
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-zinc-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {card.cardName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                          {card.targetBank}
                        </span>
                        <OcrConfirmBadge
                          state={card.ocrReview}
                          onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, card.cardId)}
                          compact
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums mt-0.5">
                        {maskAccountNumber(card.targetAccountNo)} · 결제 {card.amount.toLocaleString()}원 · 상환 {card.repaidAmount.toLocaleString()}원
                      </div>
                      {card.prepaidMemo && (
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {card.prepaidMemo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                      잔액 {rem.toLocaleString()}원
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isDone ? '이체완료' : '이체대기'}
                    </div>
                  </div>
                </div>

                {rem > 0 && (
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTossDeepLink(card.targetBank, card.targetAccountNo, rem)}
                      className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      토스 송금
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyKakaoText(card.cardName, card.targetBank, card.targetAccountNo, rem)
                      }
                      className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      카톡 복사
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2.5">
          {bankGroups.map((group) => (
            <div
              key={group.bankName}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-zinc-100">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{group.bankName}</span>
                  <span className="font-mono text-[11px] font-normal text-slate-500">
                    {maskAccountNumber(group.accountNo)}
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                  입금필요 {group.remainingAmount.toLocaleString()}원
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                포함 항목: {group.items.map((i) => `${i.cardName}(${getRemainingAmount(i).toLocaleString()})`).join(' · ')}
              </div>
              {group.remainingAmount > 0 && (
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleTossDeepLink(group.bankName, group.accountNo, group.remainingAmount)
                    }
                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    은행 합산 토스 송금
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyKakaoText(
                        `${group.bankName} 합산`,
                        group.bankName,
                        group.accountNo,
                        group.remainingAmount
                      )
                    }
                    className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    카톡 복사
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 가계부 TRANSFER 단방향 브릿지 실행 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handlers.onPublishCardTransfer(item.id)}
          className="w-full min-h-[42px] px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {item.isTransferredToLedger ? 'TRANSFER 기장 완료 (재동기화)' : '가계부 TRANSFER 자동 기장'}
        </button>

        {handlers.onNavigateToLedger && (
          <button
            type="button"
            onClick={() => {
              handlers.onCloseDetail?.();
              handlers.onNavigateToLedger?.();
            }}
            className="w-full min-h-[42px] px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            가계부 자산이동 내역 확인
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const cardSettlePlugin: RoutinePlugin<CardSettlementRoutine> = {
  category: 'FINANCE_CARD_SETTLE',
  enabled: true,
  meta,
  renderIcon: (className = 'w-4 h-4') => <CreditCard className={className} />,

  isUrgent: (item) => {
    const fsm = evaluateUrgencyFSM(item.dueDate);
    const hasPending = item.cards.some((c) => c.status === 'PENDING');
    return hasPending && (fsm.state === 'URGENT' || fsm.state === 'OVERDUE');
  },

  getListSummary: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.dueDate);
    const totalRemaining = item.cards.reduce((s, c) => s + getRemainingAmount(c), 0);
    const done = item.cards.filter((c) => c.status === 'TRANSFERRED').length;
    return {
      statusText: `${fsm.dDayText} · ${done}/${item.cards.length}`,
      statusClass:
        done === item.cards.length
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-indigo-600 dark:text-indigo-400',
      metricText: `잔액 ${totalRemaining.toLocaleString()}원`,
      quickActionLabel: '정산확인',
      onQuickAction: () => handlers.onOpenDetail(item.id),
    };
  },

  renderCard: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.dueDate);
    const totalAmount = item.cards.reduce((sum, c) => sum + c.amount, 0);
    const totalRepaid = item.cards.reduce((sum, c) => sum + (c.repaidAmount || 0), 0);
    const totalRemaining = Math.max(0, totalAmount - totalRepaid);
    const completedCount = item.cards.filter((c) => c.status === 'TRANSFERRED').length;

    return (
      <article
        onClick={() => handlers.onOpenDetail(item.id)}
        className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 min-w-0">
              <CreditCard className={`w-4 h-4 shrink-0 ${meta.accentText}`} />
              <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>{meta.label}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{item.sourceBankName}</span>
              <RoutineHelpTooltip content={meta.tooltip} />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border whitespace-nowrap tabular-nums shrink-0 ${fsm.toneClass}`}
            >
              {fsm.dDayText} · {completedCount}/{item.cards.length} 완료
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-mono tabular-nums truncate">
                결제 {totalAmount.toLocaleString()}원 · 상환 {totalRepaid.toLocaleString()}원 · 잔액 {totalRemaining.toLocaleString()}원
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {item.cards.slice(0, 5).map((card) => {
            const isDone = card.status === 'TRANSFERRED';
            const rem = getRemainingAmount(card);
            return (
              <div
                key={card.cardId}
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onToggleCardPayment(item.id, card.cardId);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handlers.onToggleCardPayment(item.id, card.cardId);
                  }
                }}
                className="w-full min-h-[44px] py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 rounded-md px-1 -mx-1 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isDone ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {card.cardName}
                      </span>
                      <OcrConfirmBadge
                        state={card.ocrReview}
                        onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, card.cardId)}
                        compact
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums truncate">
                      {card.targetBank} · 매월 {card.paymentDay}일
                      {card.prepaidMemo ? ` · ${card.prepaidMemo}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                    {rem > 0 ? `${rem.toLocaleString()}원` : '0원'}
                  </div>
                  <div
                    className={`text-[10px] font-semibold whitespace-nowrap ${
                      isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {isDone ? '상환완료' : '잔여결제'}
                  </div>
                </div>
              </div>
            );
          })}
          {item.cards.length > 5 && (
            <div className="pt-2 text-[11px] text-slate-500 dark:text-zinc-400 text-center">
              외 {item.cards.length - 5}건 더보기 (결제은행별 합산 · 토스/카톡 이체)
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="whitespace-nowrap">
              남은결제 <strong className="text-slate-900 dark:text-zinc-100">{totalRemaining.toLocaleString()}원</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onOpenDetail(item.id);
            }}
            className="min-h-[34px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            은행별 합산 · 토스/TRANSFER
          </button>
        </div>
      </article>
    );
  },

  renderCreateFields: (draft, helpers) => (
    <CardSettleCreateFields draft={draft} helpers={helpers} />
  ),

  renderDetailContent: (item, handlers) => (
    <CardSettleDetailView item={item} handlers={handlers} />
  ),
};
