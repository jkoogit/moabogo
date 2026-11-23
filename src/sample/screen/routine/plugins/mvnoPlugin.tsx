// ============================================================================
// src/sample/screen/routine/plugins/mvnoPlugin.tsx
// 2. 알뜰폰 환승 루틴 차별기능 플러그인 (5단계 D-Day FSM, 번호이동 4단계 캡처 OCR · 터치확인)
// ============================================================================

import React from 'react';
import {
  Smartphone,
  Clock,
  Check,
  ChevronRight,
  Camera,
  ShieldCheck,
  CreditCard,
  Gift,
} from 'lucide-react';
import { ElmInp01, ElmSel01 } from '../../../elements/Tokens';
import {
  OcrConfirmBadge,
  OcrFieldShell,
  RoutineAttachmentDropBar,
  RoutineUploadedFile,
} from '../../../shared/routineOcrFields';
import {
  MvnoRoutine,
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

const meta = ROUTINE_CATEGORY_META.LIFE_PHONE;

const MvnoCreateFields: React.FC<{
  draft: RoutineCreateDraft;
  helpers: CreateFieldsHelpers;
}> = ({ draft, helpers }) => {
  const applyMvnoOcr = (files?: RoutineUploadedFile[]) => {
    const sourceFiles: RoutineUploadedFile[] =
      files && files.length > 0
        ? files
        : [
            {
              fileName: 'SK7mobile_번호이동_캡처.png',
              isImage: true,
            },
          ];
    const newAttachments = sourceFiles.map((file, idx) => ({
      attachmentId: `att-mvno-${Date.now()}-${idx}`,
      fileName: file.fileName,
      uploadedAt: ROUTINE_TODAY_ISO,
      ocrSummary: 'SK 7mobile · SKT망 7개월 특가 14,900원 · USIM 번호 자동인식',
      previewUrl: file.previewUrl,
      isImageOcr: file.isImage,
    }));

    helpers.patchDraft({
      autoTitle: 'SK 7mobile 번호이동 (7개월 특가)',
      autoSubtitle: 'SKT망 · 번호이동 화면 캡처 OCR 자동완성',
      networkType: 'SKT망',
      carrierName: 'SK 7mobile',
      planName: 'LTE 유심 11GB+ (7개월 특가)',
      dataCallSpec: '11GB+일2GB+3Mbps · 무제한',
      promoMonthlyFee: '14900',
      normalMonthlyFee: '33900',
      promoMonths: '7',
      openedDate: ROUTINE_TODAY_ISO,
      promoEndDate: '2027-06-23',
      usimType: 'USIM',
      usimSerial: '8982051900244410',
      autoPayMethod: '신한카드 자동납부',
      benefitMemo: '네이버페이 2만원 (3개월 유지 조건)',
      ocrAutofilled: true,
      attachments: [...draft.attachments, ...newAttachments],
      ocrReviewMap: {
        ...draft.ocrReviewMap,
        networkType: 'AUTO_UNCONFIRMED',
        carrierName: 'AUTO_UNCONFIRMED',
        planName: 'AUTO_UNCONFIRMED',
        promoMonthlyFee: 'AUTO_UNCONFIRMED',
        normalMonthlyFee: 'AUTO_UNCONFIRMED',
        promoMonths: 'AUTO_UNCONFIRMED',
        openedDate: 'AUTO_UNCONFIRMED',
        promoEndDate: 'AUTO_UNCONFIRMED',
        usimSerial: 'AUTO_UNCONFIRMED',
        autoPayMethod: 'AUTO_UNCONFIRMED',
        benefitMemo: 'AUTO_UNCONFIRMED',
      },
    });
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
      <RoutineAttachmentDropBar
        title="번호이동 화면 캡처 OCR 자동 세팅"
        description="요금제 선택·신청완료·유심 바코드·개통 화면 캡처를 첨부하면 통신망, 특가 기간, 유심번호, 자동납부, 사은품 유지조건이 자동 세팅됩니다."
        uploadButtonLabel="캡처 이미지 첨부"
        sampleButtonLabel="SK 7mobile 예시 적용"
        accentTone="sky"
        attachments={draft.attachments}
        reviewMap={draft.ocrReviewMap}
        onFilesUploaded={(files) => applyMvnoOcr(files)}
        onSampleApply={() => applyMvnoOcr()}
        onConfirmAll={helpers.confirmAllFields}
        onRemoveAttachment={helpers.removeAttachment}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OcrFieldShell
          label="통신망"
          reviewState={draft.ocrReviewMap.networkType}
          onToggleConfirm={() => helpers.toggleFieldConfirm('networkType')}
        >
          <ElmSel01
            value={draft.networkType}
            onChange={(v) => helpers.updateField('networkType', v as 'SKT망' | 'KT망' | 'LGU+망')}
            options={[
              { value: 'SKT망', label: 'SKT망' },
              { value: 'KT망', label: 'KT망' },
              { value: 'LGU+망', label: 'LGU+망' },
            ]}
          />
        </OcrFieldShell>

        <OcrFieldShell label="유심 유형">
          <ElmSel01
            value={draft.usimType}
            onChange={(v) => helpers.updateField('usimType', v as 'USIM' | 'eSIM')}
            options={[
              { value: 'USIM', label: '실물 USIM' },
              { value: 'eSIM', label: 'eSIM (QR 개통)' },
            ]}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="알뜰폰 통신사"
          reviewState={draft.ocrReviewMap.carrierName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('carrierName')}
        >
          <ElmInp01
            value={draft.carrierName}
            onChange={(v) => helpers.updateField('carrierName', v)}
            placeholder="예: SK 7mobile"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="요금제명"
          reviewState={draft.ocrReviewMap.planName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('planName')}
        >
          <ElmInp01
            value={draft.planName}
            onChange={(v) => helpers.updateField('planName', v)}
            placeholder="예: LTE 유심 11GB+ (7개월 특가)"
          />
        </OcrFieldShell>

        {draft.usimType === 'USIM' && (
          <OcrFieldShell
            label="실물 USIM 일련번호 (저장 시 마스킹)"
            reviewState={draft.ocrReviewMap.usimSerial}
            onToggleConfirm={() => helpers.toggleFieldConfirm('usimSerial')}
            className="sm:col-span-2"
          >
            <ElmInp01
              value={draft.usimSerial}
              onChange={(v) => helpers.updateField('usimSerial', v)}
              placeholder="예: 8982051900244410"
            />
          </OcrFieldShell>
        )}

        <OcrFieldShell
          label="프로모션 월요금 (원)"
          reviewState={draft.ocrReviewMap.promoMonthlyFee}
          onToggleConfirm={() => helpers.toggleFieldConfirm('promoMonthlyFee')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.promoMonthlyFee}
            onChange={(v) => helpers.updateField('promoMonthlyFee', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="만료 후 정상 월요금 (원)"
          reviewState={draft.ocrReviewMap.normalMonthlyFee}
          onToggleConfirm={() => helpers.toggleFieldConfirm('normalMonthlyFee')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.normalMonthlyFee}
            onChange={(v) => helpers.updateField('normalMonthlyFee', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="개통일 (90일 제한 기준)"
          reviewState={draft.ocrReviewMap.openedDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('openedDate')}
        >
          <ElmInp01
            type="date"
            value={draft.openedDate}
            onChange={(v) => helpers.updateField('openedDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="프로모션 만료 예정일"
          reviewState={draft.ocrReviewMap.promoEndDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('promoEndDate')}
        >
          <ElmInp01
            type="date"
            value={draft.promoEndDate}
            onChange={(v) => helpers.updateField('promoEndDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="자동납부 결제수단"
          reviewState={draft.ocrReviewMap.autoPayMethod}
          onToggleConfirm={() => helpers.toggleFieldConfirm('autoPayMethod')}
        >
          <ElmInp01
            value={draft.autoPayMethod}
            onChange={(v) => helpers.updateField('autoPayMethod', v)}
            placeholder="예: 신한카드 자동납부"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="사은품 · 유지조건 메모"
          reviewState={draft.ocrReviewMap.benefitMemo}
          onToggleConfirm={() => helpers.toggleFieldConfirm('benefitMemo')}
        >
          <ElmInp01
            value={draft.benefitMemo}
            onChange={(v) => helpers.updateField('benefitMemo', v)}
            placeholder="예: 네이버페이 2만원 (3개월 유지)"
          />
        </OcrFieldShell>
      </div>
    </div>
  );
};

export const mvnoPlugin: RoutinePlugin<MvnoRoutine> = {
  category: 'LIFE_PHONE',
  enabled: true,
  meta,
  renderIcon: (className = 'w-4 h-4') => <Smartphone className={className} />,

  isUrgent: (item) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    return fsm.state === 'URGENT' || fsm.state === 'OVERDUE' || fsm.state === 'IMMINENT';
  },

  getListSummary: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const ocrDone = (item.ocrCaptureSteps ?? []).filter((s) => s.captured).length;
    const ocrTotal = (item.ocrCaptureSteps ?? []).length || 4;
    return {
      statusText: `${fsm.dDayText} · OCR ${ocrDone}/${ocrTotal}`,
      statusClass:
        fsm.state === 'URGENT' || fsm.state === 'OVERDUE'
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-sky-600 dark:text-sky-400',
      metricText: `${item.networkType} · 월 ${item.promoMonthlyFee.toLocaleString()}원`,
      quickActionLabel: '환승갱신',
      onQuickAction: () => handlers.onCompleteMvnoRenewal(item.id),
    };
  },

  renderCard: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const monthlySave = Math.max(0, item.normalMonthlyFee - item.promoMonthlyFee);
    const doneSteps = item.checklist.filter((s) => s.done).length;
    const ocrSteps = item.ocrCaptureSteps ?? [];
    const ocrCapturedCount = ocrSteps.filter((s) => s.captured).length;

    return (
      <article
        onClick={() => handlers.onOpenDetail(item.id)}
        className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 min-w-0">
              <Smartphone className={`w-4 h-4 shrink-0 ${meta.accentText}`} />
              <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>
                {item.networkType}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700 dark:text-zinc-200 truncate">
                {item.carrierName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] whitespace-nowrap">{item.usimType}</span>
              <RoutineHelpTooltip content={meta.tooltip} />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border whitespace-nowrap tabular-nums shrink-0 ${fsm.toneClass}`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              {fsm.dDayText} · {fsm.label}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {item.planName} · {item.dataCallSpec}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-200/80 dark:divide-zinc-800 py-2.5 px-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 text-xs">
          <div className="pr-3">
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              현재 특가 ({item.promoMonths}개월)
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono tabular-nums mt-0.5">
              {item.promoMonthlyFee.toLocaleString()}원
            </div>
          </div>
          <div className="pl-3">
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              만료 후 정상 요금
            </div>
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-0.5">
              {item.normalMonthlyFee.toLocaleString()}원
              <span className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 ml-1">
                (+{monthlySave.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            개통 {item.openedDate} · 90일해제 {item.mnpRestrictionEndDate}
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {item.autoPayMethod}
          </span>
          {item.benefitMemo && (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 truncate max-w-full">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.benefitMemo}</span>
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              번호이동 캡처 OCR 수집
            </span>
            <span className="font-mono tabular-nums font-semibold text-sky-600 dark:text-sky-400">
              {ocrCapturedCount}/{ocrSteps.length} 단계
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {ocrSteps.map((step) => (
              <button
                key={step.stepKey}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onCaptureMvnoOcrStep(item.id, step.stepKey);
                }}
                title={step.captured ? step.extractedSummary : `${step.label} 캡처 OCR 수집`}
                className={`min-h-[34px] px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                  step.captured
                    ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-zinc-900 border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-300'
                }`}
              >
                {step.captured ? (
                  <Check className="w-3 h-3 shrink-0" />
                ) : (
                  <Camera className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate">
                  {step.stepNo}.{step.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
            만료일 {item.promoEndDate} · 체크 {doneSteps}/{item.checklist.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onCompleteMvnoRenewal(item.id);
            }}
            className="min-h-[34px] px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            환승 완료 · 주기갱신
          </button>
        </div>
      </article>
    );
  },

  renderCreateFields: (draft, helpers) => <MvnoCreateFields draft={draft} helpers={helpers} />,

  renderDetailContent: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const yearlySave = Math.max(0, item.normalMonthlyFee - item.promoMonthlyFee) * 12;
    const ocrSteps = item.ocrCaptureSteps ?? [];
    const ocrCapturedCount = ocrSteps.filter((s) => s.captured).length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs">
          <div>
            <div className="text-slate-500 dark:text-zinc-400">통신망 · 통신사 · 유심</div>
            <div className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {item.networkType} · {item.carrierName} ({item.usimType})
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-zinc-400">만료 상태 (FSM)</div>
            <div className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-0.5">
              {fsm.dDayText} ({fsm.label})
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-zinc-400">회선 · 데이터 스펙</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
              {item.lineOwner} ({item.phoneNumberMasked})
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {item.dataCallSpec}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-zinc-400">연간 방어 절감액</div>
            <div className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              연 {yearlySave.toLocaleString()}원
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums mt-0.5">
              월 {item.promoMonthlyFee.toLocaleString()}원 → {item.normalMonthlyFee.toLocaleString()}원
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-zinc-400">개통일 / 90일 제한해제</div>
            <div className="font-mono tabular-nums font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
              {item.openedDate} / {item.mnpRestrictionEndDate}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-zinc-400">자동납부 · 유심 일련번호</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
              {item.autoPayMethod}
            </div>
            {item.usimSerialMasked && (
              <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                USIM {item.usimSerialMasked}
              </div>
            )}
          </div>
        </div>

        {/* 번호이동 단계별 화면 캡처 OCR 수집 관리 (터치 확인 배지 포함) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
            <span className="inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              번호이동 단계별 화면 캡처 OCR 수집
            </span>
            <span className="font-mono tabular-nums text-sky-600 dark:text-sky-400">
              {ocrCapturedCount}/{ocrSteps.length} 완료
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {ocrSteps.map((step) => (
              <div
                key={step.stepKey}
                className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                      STEP {step.stepNo}
                    </span>
                    <span>{step.label}</span>
                    <OcrConfirmBadge
                      state={step.ocrReview}
                      onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, step.stepKey)}
                      compact
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    {step.captured && step.extractedSummary
                      ? step.extractedSummary
                      : step.captureHint}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlers.onCaptureMvnoOcrStep(item.id, step.stepKey)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    step.captured
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {step.captured ? '재수집' : '캡처 OCR'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handlers.onCompleteMvnoRenewal(item.id)}
          className="w-full min-h-[42px] rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
        >
          번호이동 완료 처리 (+{item.promoMonths}개월 만료일 갱신)
        </button>
      </div>
    );
  },
};
