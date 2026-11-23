// ============================================================================
// src/sample/screen/routine/plugins/taxInvoicePlugin.tsx
// 3. 개인사업자 세금계산서 발급 루틴 차별기능 플러그인 (세금계산서 영수증 OCR 자동세팅 · 터치확인)
// ============================================================================

import React from 'react';
import { FileSpreadsheet, Check, Building2, ChevronRight } from 'lucide-react';
import { ElmInp01, ElmSel01 } from '../../../elements/Tokens';
import { maskBusinessNumber } from '../../../shared/securityGuards';
import {
  OcrConfirmBadge,
  OcrFieldShell,
  RoutineAttachmentDropBar,
  OcrFieldReviewMap,
  RoutineUploadedFile,
} from '../../../shared/routineOcrFields';
import {
  TaxInvoiceRoutine,
  ROUTINE_CATEGORY_META,
  ROUTINE_TODAY_ISO,
  evaluateUrgencyFSM,
} from '../types';
import {
  RoutinePlugin,
  RoutineHelpTooltip,
  RoutineCreateDraft,
  CreateFieldsHelpers,
} from './pluginContract';

const meta = ROUTINE_CATEGORY_META.BIZ_TAX;

const TaxCreateFields: React.FC<{
  draft: RoutineCreateDraft;
  helpers: CreateFieldsHelpers;
}> = ({ draft, helpers }) => {
  const applyTaxReceiptOcr = (files?: RoutineUploadedFile[]) => {
    const sourceFiles: RoutineUploadedFile[] =
      files && files.length > 0
        ? files
        : [
            {
              fileName: '홈택스_세금계산서_네스트온오프_261030.png',
              previewUrl: '/assets/aistudio/image_c6f5dfc2.png',
              isImage: true,
            },
          ];
    const newAttachments = sourceFiles.map((file, idx) => ({
      attachmentId: `att-tax-${Date.now()}-${idx}`,
      fileName: file.fileName,
      uploadedAt: ROUTINE_TODAY_ISO,
      ocrSummary: '주식회사 네스트온오프 · 시스템개발용역료 · 합계 8,030,000원 (청구)',
      previewUrl: file.previewUrl,
      isImageOcr: file.isImage,
    }));

    helpers.patchDraft({
      autoTitle: '2026년 10월분 전자세금계산서 (네스트온오프 외)',
      autoSubtitle: '세금계산서 영수증 OCR 자동등록 · 품목 시스템개발용역료 (청구)',
      targetYearMonth: '2026-10',
      deadlineDate: '2026-11-10',
      initialClientName: '주식회사 네스트온오프',
      initialBizNo: '117-81-64539',
      initialRepresentative: '최선대',
      initialClientEmail: 'nest@nestonoff.co.kr',
      initialWrittenDate: '2026-10-30',
      initialItemName: '시스템개발용역료',
      initialClaimType: '청구',
      initialSupplyAmount: '7300000',
      initialVatAmount: '730000',
      attachments: [...draft.attachments, ...newAttachments],
      ocrReviewMap: {
        ...draft.ocrReviewMap,
        initialClientName: 'AUTO_UNCONFIRMED',
        initialBizNo: 'AUTO_UNCONFIRMED',
        initialRepresentative: 'AUTO_UNCONFIRMED',
        initialClientEmail: 'AUTO_UNCONFIRMED',
        initialWrittenDate: 'AUTO_UNCONFIRMED',
        initialItemName: 'AUTO_UNCONFIRMED',
        initialClaimType: 'AUTO_UNCONFIRMED',
        initialSupplyAmount: 'AUTO_UNCONFIRMED',
        initialVatAmount: 'AUTO_UNCONFIRMED',
        deadlineDate: 'AUTO_UNCONFIRMED',
      },
    });
  };

  const supplyNum = Math.max(0, Number(draft.initialSupplyAmount) || 0);
  const vatNum = Math.max(0, Number(draft.initialVatAmount) || 0);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
      <RoutineAttachmentDropBar
        title="세금계산서 영수증 이미지 첨부 OCR 자동 세팅"
        description="홈택스 전자세금계산서 발행영수증 이미지를 첨부하면 공급받는자 상호, 사업자번호, 대표자, 이메일, 작성일자, 품목, 공급가액, 세액 및 청구/영수 구분이 자동 입력됩니다."
        uploadButtonLabel="세금계산서 이미지 첨부"
        sampleButtonLabel="홈택스 영수증 예시 적용"
        accentTone="amber"
        attachments={draft.attachments}
        reviewMap={draft.ocrReviewMap}
        onFilesUploaded={(files) => applyTaxReceiptOcr(files)}
        onSampleApply={() => applyTaxReceiptOcr()}
        onConfirmAll={helpers.confirmAllFields}
        onRemoveAttachment={helpers.removeAttachment}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OcrFieldShell
          label="공급받는자 상호"
          reviewState={draft.ocrReviewMap.initialClientName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialClientName')}
        >
          <ElmInp01
            value={draft.initialClientName}
            onChange={(v) => helpers.updateField('initialClientName', v)}
            placeholder="예: 주식회사 네스트온오프"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="사업자등록번호 (저장 시 자동 마스킹)"
          reviewState={draft.ocrReviewMap.initialBizNo}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialBizNo')}
        >
          <ElmInp01
            value={draft.initialBizNo}
            onChange={(v) => helpers.updateField('initialBizNo', v)}
            placeholder="예: 117-81-64539"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="대표자 성명"
          reviewState={draft.ocrReviewMap.initialRepresentative}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialRepresentative')}
        >
          <ElmInp01
            value={draft.initialRepresentative}
            onChange={(v) => helpers.updateField('initialRepresentative', v)}
            placeholder="예: 최선대"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="수신 이메일"
          reviewState={draft.ocrReviewMap.initialClientEmail}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialClientEmail')}
        >
          <ElmInp01
            value={draft.initialClientEmail}
            onChange={(v) => helpers.updateField('initialClientEmail', v)}
            placeholder="예: nest@nestonoff.co.kr"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="품목명"
          reviewState={draft.ocrReviewMap.initialItemName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialItemName')}
        >
          <ElmInp01
            value={draft.initialItemName}
            onChange={(v) => helpers.updateField('initialItemName', v)}
            placeholder="예: 시스템개발용역료"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="청구 / 영수 구분"
          reviewState={draft.ocrReviewMap.initialClaimType}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialClaimType')}
        >
          <ElmSel01
            value={draft.initialClaimType}
            onChange={(v) => helpers.updateField('initialClaimType', v as '청구' | '영수')}
            options={[
              { value: '청구', label: '이 금액을 청구함 (청구)' },
              { value: '영수', label: '이 금액을 영수함 (영수)' },
            ]}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="공급가액 (원)"
          reviewState={draft.ocrReviewMap.initialSupplyAmount}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialSupplyAmount')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.initialSupplyAmount}
            onChange={(v) => {
              const nextSupply = Math.max(0, Number(v) || 0);
              helpers.patchDraft({
                initialSupplyAmount: v,
                initialVatAmount: String(Math.round(nextSupply * 0.1)),
                ocrReviewMap: {
                  ...draft.ocrReviewMap,
                  ...(draft.ocrReviewMap.initialSupplyAmount
                    ? { initialSupplyAmount: 'EDITED' as const }
                    : {}),
                  ...(draft.ocrReviewMap.initialVatAmount
                    ? { initialVatAmount: 'EDITED' as const }
                    : {}),
                },
              });
            }}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="부가세액 (원, 10% 자동산정)"
          reviewState={draft.ocrReviewMap.initialVatAmount}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialVatAmount')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.initialVatAmount}
            onChange={(v) => helpers.updateField('initialVatAmount', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="작성일자"
          reviewState={draft.ocrReviewMap.initialWrittenDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('initialWrittenDate')}
        >
          <ElmInp01
            type="date"
            value={draft.initialWrittenDate}
            onChange={(v) => helpers.updateField('initialWrittenDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="발급 마감일 (익월 10일)"
          reviewState={draft.ocrReviewMap.deadlineDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('deadlineDate')}
        >
          <ElmInp01
            type="date"
            value={draft.deadlineDate}
            onChange={(v) => helpers.updateField('deadlineDate', v)}
          />
        </OcrFieldShell>
      </div>

      {/* 합계금액 자동 검증 바 */}
      <div className="px-3 py-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 flex items-center justify-between text-xs">
        <span className="font-semibold text-amber-900 dark:text-amber-200">
          합계금액 ({draft.initialClaimType})
        </span>
        <span className="font-mono tabular-nums font-bold text-amber-900 dark:text-amber-100">
          {(supplyNum + vatNum).toLocaleString()}원
        </span>
      </div>
    </div>
  );
};

export const taxInvoicePlugin: RoutinePlugin<TaxInvoiceRoutine> = {
  category: 'BIZ_TAX',
  enabled: true,
  meta,
  renderIcon: (className = 'w-4 h-4') => <FileSpreadsheet className={className} />,

  isUrgent: (item) => {
    const fsm = evaluateUrgencyFSM(item.deadlineDate);
    const hasPending = item.clients.some((c) => c.status === 'PENDING');
    return hasPending && (fsm.state === 'URGENT' || fsm.state === 'OVERDUE' || fsm.state === 'IMMINENT');
  },

  getListSummary: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.deadlineDate);
    const issued = item.clients.filter((c) => c.status === 'ISSUED').length;
    const nextPending = item.clients.find((c) => c.status === 'PENDING');
    return {
      statusText: `${fsm.dDayText} · ${issued}/${item.clients.length}`,
      statusClass:
        issued === item.clients.length
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400',
      metricText: `${item.clients.length}개 거래처`,
      quickActionLabel: nextPending ? '다음 발급체크' : '상세보기',
      onQuickAction: () =>
        nextPending
          ? handlers.onToggleTaxClient(item.id, nextPending.clientId)
          : handlers.onOpenDetail(item.id),
    };
  },

  renderCard: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.deadlineDate);
    const issuedCount = item.clients.filter((c) => c.status === 'ISSUED').length;
    const totalSupply = item.clients.reduce((acc, c) => acc + c.supplyAmount, 0);
    const totalVat = item.clients.reduce((acc, c) => acc + c.vatAmount, 0);

    return (
      <article
        onClick={() => handlers.onOpenDetail(item.id)}
        className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 min-w-0">
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${meta.accentText}`} />
              <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>{meta.label}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums whitespace-nowrap">{item.targetYearMonth} 귀속</span>
              <RoutineHelpTooltip content={meta.tooltip} />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border whitespace-nowrap tabular-nums shrink-0 ${fsm.toneClass}`}
            >
              {fsm.dDayText} · {issuedCount}/{item.clients.length} 완료
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums truncate">
                공급가액 {totalSupply.toLocaleString()}원 · 부가세 {totalVat.toLocaleString()}원
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {item.clients.map((client) => {
            const isIssued = client.status === 'ISSUED';
            return (
              <div
                key={client.clientId}
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onToggleTaxClient(item.id, client.clientId);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handlers.onToggleTaxClient(item.id, client.clientId);
                  }
                }}
                className="w-full min-h-[48px] py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 rounded-md px-1 -mx-1 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isIssued
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isIssued ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {client.companyName}
                      </span>
                      {client.claimType && (
                        <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                          {client.claimType}
                        </span>
                      )}
                      <OcrConfirmBadge
                        state={client.ocrReview}
                        onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, client.clientId)}
                        compact
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums truncate">
                      {maskBusinessNumber(client.bizNo)}
                      {client.itemName ? ` · ${client.itemName}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                    {(client.supplyAmount + client.vatAmount).toLocaleString()}원
                  </div>
                  <div
                    className={`text-[10px] font-semibold whitespace-nowrap ${
                      isIssued ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isIssued ? '발급완료' : '발급대기'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5" />
            마감일 {item.deadlineDate}
          </span>
          <span className="font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
            {issuedCount === item.clients.length
              ? '당월 전건 발급 완료'
              : `미발급 ${item.clients.length - issuedCount}건 남음`}
          </span>
        </div>
      </article>
    );
  },

  renderCreateFields: (draft, helpers) => <TaxCreateFields draft={draft} helpers={helpers} />,

  renderDetailContent: (item, handlers) => {
    const detailReviewMap: OcrFieldReviewMap = {};
    item.clients.forEach((c) => {
      if (c.ocrReview) detailReviewMap[c.clientId] = c.ocrReview;
    });

    return (
      <div className="space-y-4">
        <RoutineAttachmentDropBar
          title="세금계산서 영수증 추가 첨부 (OCR 자동입력)"
          description="홈택스 발행영수증을 추가 첨부하면 기존 거래처를 유지하면서 새 거래처·품목·금액이 자동 추가됩니다."
          uploadButtonLabel="세금계산서 추가 첨부"
          sampleButtonLabel="추가 영수증 OCR 테스트"
          accentTone="amber"
          attachments={item.attachments ?? []}
          reviewMap={detailReviewMap}
          onFilesUploaded={(files) => handlers.onAttachOcrFiles(item.id, files)}
          onSampleApply={() =>
            handlers.onAttachOcrFiles(item.id, [
              {
                fileName: '추가_세금계산서_영수증.png',
                previewUrl: '/assets/aistudio/image_c6f5dfc2.png',
                isImage: true,
              },
            ])
          }
          onConfirmAll={() => handlers.onConfirmAllOcrItems(item.id)}
        />

        <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {item.clients.map((c) => (
            <div
              key={c.clientId}
              className="px-3.5 py-3 bg-white dark:bg-zinc-900/40 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {c.companyName}
                  </span>
                  {c.claimType && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-600 dark:text-zinc-300">
                      {c.claimType}
                    </span>
                  )}
                  <OcrConfirmBadge
                    state={c.ocrReview}
                    onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, c.clientId)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handlers.onToggleTaxClient(item.id, c.clientId)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    c.status === 'ISSUED'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {c.status === 'ISSUED' ? '발급완료' : '발급체크'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                <div className="font-mono tabular-nums">
                  사업자 {maskBusinessNumber(c.bizNo)}
                  {c.representativeName ? ` · 대표 ${c.representativeName}` : ''}
                </div>
                <div className="text-right font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100">
                  합계 {(c.supplyAmount + c.vatAmount).toLocaleString()}원
                </div>
                <div className="truncate">
                  품목 {c.itemName || '용역료'}
                  {c.writtenDate ? ` · 작성 ${c.writtenDate}` : ''}
                </div>
                <div className="text-right font-mono tabular-nums">
                  공급 {c.supplyAmount.toLocaleString()} + VAT {c.vatAmount.toLocaleString()}
                </div>
                {c.email && (
                  <div className="col-span-2 text-slate-500 dark:text-zinc-500 truncate">
                    수신 이메일: {c.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
