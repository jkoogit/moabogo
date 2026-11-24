import React from 'react';
import {
  Camera,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import {
  ElmHlp01,
  ElmInp01,
  ElmSel01,
  ElmSld03,
  ElmSwt01,
} from '../elements/Tokens';
import { QuickSheetShell } from './quick/QuickSheetShell';
import { QuickOfflineBanner, QuickSuccessBanner } from './quick/QuickFeedbackBanners';
import { OcrStagePreviewCard } from './quick/OcrStagePreviewCard';
import { useQuickMoneyEntry } from './quick/useQuickMoneyEntry';
import {
  LEDGER_OPTIONS,
  QUICK_MEMBER_PRESETS,
  QUICK_MONEY_TAGS,
} from './quick/quickEntryData';

export interface SCR_QCK_01_Props {
  isOpen?: boolean;
  variant?: 'sheet' | 'standalone';
  isOffline?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const SCR_QCK_01_빠른머니등록: React.FC<SCR_QCK_01_Props> = ({
  isOpen,
  variant,
  isOffline = false,
  onClose,
  onSuccess,
}) => {
  const resolvedVariant: 'sheet' | 'standalone' =
    variant ?? (isOpen !== undefined ? 'sheet' : 'standalone');
  const resolvedOpen = isOpen ?? true;

  const q = useQuickMoneyEntry(isOffline, onSuccess);

  const footerContent = (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 min-w-0">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
            q.isAssetTransfer
              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
          }`}
        >
          {q.isAssetTransfer ? 'TRANSFER 분리' : `${q.selectedLedgerMeta.badge} 귀속`}
        </span>
        <span className="truncate font-mono">₩{(Number(q.amount) || 0).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={() => q.handleSubmitForm()}
          disabled={q.isScanning || !q.merchant.trim()}
          className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isOffline ? '오프라인 큐 임시저장' : '가계부에 빠른 등록'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <QuickSheetShell
      variant={resolvedVariant}
      isOpen={resolvedOpen}
      onClose={onClose ?? (() => {})}
      title="빠른 머니등록"
      badge="SCR-QCK-01"
      headerExtra={
        <ElmHlp01
          title="금전관리 3대 원칙 & 2단계 OCR 안내"
          badge="SSOT"
          colorScheme="indigo"
          align="right"
        >
          <ul className="space-y-1.5 text-[11px] leading-relaxed">
            <li>• <strong>단일 귀속성</strong>: 거래는 개인/가족/모임 가계부 중 1곳에만 귀속됩니다.</li>
            <li>• <strong>TRANSFER 분리</strong>: 이체·대여·용돈 이동은 생활비 지출 통계에서 자동 제외됩니다.</li>
            <li>• <strong>태깅 분리</strong>: 대납·정산 여부는 메타데이터 태그로 안전하게 구분합니다.</li>
          </ul>
        </ElmHlp01>
      }
      footer={footerContent}
    >
      {isOffline && (
        <QuickOfflineBanner message="오프라인 상태입니다. 등록 내역은 멱등키와 함께 IndexedDB 대기열에 안전 보관됩니다." />
      )}

      {q.submitSuccess && (
        <QuickSuccessBanner
          title={
            q.submitSuccess.queuedOffline
              ? '오프라인 동기화 대기열에 저장되었습니다!'
              : '빠른 머니등록이 완료되었습니다!'
          }
          description={`[${q.submitSuccess.type}] ${q.submitSuccess.merchant} (₩${q.submitSuccess.amount}원) · ${
            q.isAssetTransfer ? 'TRANSFER 자산이동 분리' : '순수 생활비 반영'
          }`}
          idempotencyKey={q.submitSuccess.idempotencyKey}
          continueLabel="새 내역 계속 등록"
          accentColor="emerald"
          onContinue={() => q.setSubmitSuccess(null)}
          onClose={onClose}
        />
      )}

      {/* 1. 등록 유형 스위처 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => q.handleModeChange('RECEIPT_EXPENSE')}
          className={`min-h-[54px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
            q.entryType === 'RECEIPT_EXPENSE'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap">
            <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>영수증 지출</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            2단계 OCR 자동 추출
          </span>
        </button>

        <button
          type="button"
          onClick={() => q.handleModeChange('TRANSFER_PAYMENT')}
          className={`min-h-[54px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
            q.entryType === 'TRANSFER_PAYMENT'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20'
              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap">
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>이체 지급</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            송금 캡처 · TRANSFER 연동
          </span>
        </button>
      </div>

      {/* 2. 2단계 OCR 스캔 & 미리보기 */}
      <OcrStagePreviewCard
        fileInputRef={q.fileInputRef}
        isScanning={q.isScanning}
        ocrStage={q.ocrStage}
        previewImageUrl={q.previewImageUrl}
        ocrConfidence={q.ocrConfidence}
        paidAt={q.paidAt}
        merchant={q.merchant}
        amount={q.amount}
        ocrRawLines={q.ocrRawLines}
        isPreviewExpanded={q.isPreviewExpanded}
        onToggleExpand={() => q.setIsPreviewExpanded((prev) => !prev)}
        onFileUpload={q.handleFileUpload}
        onSelectPreset={q.runMockOcrStage}
        onClearPreview={q.handleClearOcrPreview}
      />

      {/* 3. 3단 기장 폼 */}
      <form onSubmit={q.handleSubmitForm} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ElmInp01 label="가맹점 / 수신처" value={q.merchant} onChange={q.setMerchant} />
          <ElmInp01 label="금액 (원)" type="number" value={q.amount} onChange={q.setAmount} />
        </div>

        <div className="space-y-1.5">
          <ElmSel01
            label="1단 · 귀속 가계부 (단일 원장 SSOT)"
            value={q.targetLedger}
            onChange={(val) => q.setTargetLedger(val as 'PERSONAL' | 'GROUP' | 'INSTANCE')}
            options={LEDGER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{q.selectedLedgerMeta.attributionNote}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <ElmInp01 label="2단 · 지출자 (결제자)" value={q.payer} onChange={q.setPayer} />
            <ElmSld03 showNavButtons={false} stepWidth={100} innerClassName="flex items-center gap-1.5">
              {QUICK_MEMBER_PRESETS.slice(0, 3).map((member) => (
                <button
                  key={`payer-${member}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    q.setPayer(member);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 cursor-pointer ${
                    q.payer === member
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {member}
                </button>
              ))}
            </ElmSld03>
          </div>

          <div className="space-y-1.5">
            <ElmInp01 label="3단 · 소비자 (실사용 대상)" value={q.consumer} onChange={q.setConsumer} />
            <ElmSld03 showNavButtons={false} stepWidth={100} innerClassName="flex items-center gap-1.5">
              {QUICK_MEMBER_PRESETS.map((member) => (
                <button
                  key={`consumer-${member}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    q.setConsumer(member);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 cursor-pointer ${
                    q.consumer === member
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-700 dark:text-purple-300'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {member}
                </button>
              ))}
            </ElmSld03>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>대납·정산 분류 태그</span>
            </span>
            <span className="text-[10px] text-slate-400">이중계상 차단 메타데이터</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_MONEY_TAGS.map((tag) => {
              const active = q.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => q.handleToggleTag(tag)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-1.5">
          <ElmSwt01
            checked={q.isAssetTransfer}
            onChange={q.setIsAssetTransfer}
            label="TRANSFER 자산 이동 처리 (생활비 통계 제외)"
            description="가계부·계좌 간 이동 및 용돈/대여는 1:1 자기참조 페어링(related_transfer_id)으로 처리됩니다."
            className="[&_span]:dark:text-zinc-200"
          />
          {q.isAssetTransfer && (
            <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
              ✓ is_asset_transfer = true · 순수 소비 집계에서 배제됨
            </div>
          )}
        </div>
      </form>
    </QuickSheetShell>
  );
};
