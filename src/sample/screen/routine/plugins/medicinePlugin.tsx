// ============================================================================
// src/sample/screen/routine/plugins/medicinePlugin.tsx
// 1. 약복용 루틴 차별기능 플러그인 (약봉지 이미지 OCR 5종 자동세팅 · 터치확인 · 시점별 복용)
// ============================================================================

import React from 'react';
import {
  Pill,
  Check,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { ElmInp01, ElmSel01, ElmSld03 } from '../../../elements/Tokens';
import {
  OcrConfirmBadge,
  OcrFieldShell,
  RoutineAttachmentDropBar,
  OcrFieldReviewMap,
  RoutineUploadedFile,
} from '../../../shared/routineOcrFields';
import {
  MedicineRoutine,
  MedicineDrugItem,
  MedicineSlotLabel,
  ROUTINE_CATEGORY_META,
  ROUTINE_TODAY_ISO,
} from '../types';
import {
  RoutinePlugin,
  RoutineHelpTooltip,
  RoutineCreateDraft,
  CreateFieldsHelpers,
} from './pluginContract';

const meta = ROUTINE_CATEGORY_META.HEALTH_MEDICINE;

function mapFrequencyToSlots(freq: number): MedicineSlotLabel[] {
  if (freq >= 4) return ['아침', '점심', '저녁', '취침전'];
  if (freq === 3) return ['아침', '점심', '저녁'];
  if (freq === 2) return ['아침', '저녁'];
  return ['점심'];
}

function buildSamplePharmacyBagDrugs(days: number): MedicineDrugItem[] {
  const safeDays = Math.max(1, days || 14);
  return [
    {
      drugId: `drug-${Date.now()}-1`,
      drugName: '케이캡정 50mg',
      effectCategory: '위식도역류질환약',
      dosePerTake: 1,
      dailyFrequency: 2,
      prescribedDays: safeDays,
      totalQty: 1 * 2 * safeDays,
      remainingQty: 1 * 2 * safeDays,
      unitLabel: '정',
      slotLabels: ['아침', '저녁'],
      storageNote: '실온보관',
      cautionTags: ['카페인X'],
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      drugId: `drug-${Date.now()}-2`,
      drugName: '데놀정',
      effectCategory: '소화성궤양용제',
      dosePerTake: 1,
      dailyFrequency: 4,
      prescribedDays: safeDays,
      totalQty: 1 * 4 * safeDays,
      remainingQty: 1 * 4 * safeDays,
      unitLabel: '정',
      slotLabels: ['아침', '점심', '저녁', '취침전'],
      storageNote: '실온보관',
      cautionTags: ['습기주의'],
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      drugId: `drug-${Date.now()}-3`,
      drugName: '후라시닐정',
      effectCategory: '항원충제',
      dosePerTake: 2,
      dailyFrequency: 3,
      prescribedDays: safeDays,
      totalQty: 2 * 3 * safeDays,
      remainingQty: 2 * 3 * safeDays,
      unitLabel: '정',
      slotLabels: ['아침', '점심', '저녁'],
      storageNote: '차광보관',
      cautionTags: ['졸림주의', '운전주의'],
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      drugId: `drug-${Date.now()}-4`,
      drugName: '테라싸이클린캡슐 250mg',
      effectCategory: '세균감염증 치료제',
      dosePerTake: 2,
      dailyFrequency: 4,
      prescribedDays: safeDays,
      totalQty: 2 * 4 * safeDays,
      remainingQty: 2 * 4 * safeDays,
      unitLabel: '캡슐',
      slotLabels: ['아침', '점심', '저녁', '취침전'],
      storageNote: '차광보관',
      cautionTags: ['위장장애주의'],
      ocrReview: 'AUTO_UNCONFIRMED',
    },
    {
      drugId: `drug-${Date.now()}-5`,
      drugName: '비)비오플250캡슐',
      effectCategory: '정장제',
      dosePerTake: 1,
      dailyFrequency: 2,
      prescribedDays: safeDays,
      totalQty: 1 * 2 * safeDays,
      remainingQty: 1 * 2 * safeDays,
      unitLabel: '캡슐',
      slotLabels: ['아침', '저녁'],
      storageNote: '실온보관',
      cautionTags: ['카페인X', '습기주의'],
      ocrReview: 'AUTO_UNCONFIRMED',
    },
  ];
}

const MedicineCreateFields: React.FC<{
  draft: RoutineCreateDraft;
  helpers: CreateFieldsHelpers;
}> = ({ draft, helpers }) => {
  const applyDrugBagOcr = (files?: RoutineUploadedFile[]) => {
    const days = 14;
    const sampleDrugs = buildSamplePharmacyBagDrugs(days);
    const totalPills = sampleDrugs.reduce((sum, d) => sum + d.totalQty, 0);
    const sourceFiles: RoutineUploadedFile[] =
      files && files.length > 0
        ? files
        : [
            {
              fileName: '산들약국_약봉지.jpg',
              previewUrl: '/assets/aistudio/____d327bb33.jpg',
              isImage: true,
            },
          ];
    const newAttachments = sourceFiles.map((file, idx) => ({
      attachmentId: `att-med-${Date.now()}-${idx}`,
      fileName: file.fileName,
      uploadedAt: ROUTINE_TODAY_ISO,
      ocrSummary: '약봉지 OCR · 5종 약품 · 1일 4회 14일분 · 수납 32,300원',
      previewUrl: file.previewUrl,
      isImageOcr: file.isImage,
    }));

    const nextReviewMap: OcrFieldReviewMap = {
      ...draft.ocrReviewMap,
      hospitalOrBrand: 'AUTO_UNCONFIRMED',
      pharmacyName: 'AUTO_UNCONFIRMED',
      prescribedDate: 'AUTO_UNCONFIRMED',
      prescribedDays: 'AUTO_UNCONFIRMED',
      receiptTotalAmount: 'AUTO_UNCONFIRMED',
      slotPreset: 'AUTO_UNCONFIRMED',
    };
    sampleDrugs.forEach((d) => {
      nextReviewMap[`drug:${d.drugId}`] = 'AUTO_UNCONFIRMED';
    });

    helpers.patchDraft({
      autoTitle: '구의베스트내과 14일 복약 (5종 약봉지 OCR)',
      autoSubtitle: '산들약국 조제 · 아침·점심·저녁·취침전 1일 4회 · 수납 32,300원',
      hospitalOrBrand: '구의베스트내과의원',
      pharmacyName: '산들약국',
      prescribedDate: ROUTINE_TODAY_ISO,
      prescribedDays: String(days),
      receiptTotalAmount: '32300',
      totalPills: String(totalPills),
      slotPreset: '4_TIMES',
      drugs: draft.drugs.length > 0 ? [...draft.drugs, ...sampleDrugs] : sampleDrugs,
      attachments: [...draft.attachments, ...newAttachments],
      ocrReviewMap: nextReviewMap,
    });
  };

  const updateDrugRow = (drugId: string, patch: Partial<MedicineDrugItem>) => {
    const days = Math.max(1, Number(draft.prescribedDays) || 14);
    const nextDrugs = draft.drugs.map((d) => {
      if (d.drugId !== drugId) return d;
      const merged = { ...d, ...patch };
      const freq = Math.max(1, Math.min(4, merged.dailyFrequency));
      const dose = Math.max(1, merged.dosePerTake);
      const totalQty = dose * freq * days;
      return {
        ...merged,
        dailyFrequency: freq,
        dosePerTake: dose,
        prescribedDays: days,
        totalQty,
        remainingQty: totalQty,
        slotLabels: mapFrequencyToSlots(freq),
        ocrReview: 'EDITED' as const,
      };
    });
    const nextTotal = nextDrugs.reduce((sum, d) => sum + d.totalQty, 0);
    helpers.patchDraft({
      drugs: nextDrugs,
      totalPills: String(nextTotal),
      ocrReviewMap: { ...draft.ocrReviewMap, [`drug:${drugId}`]: 'EDITED' },
    });
  };

  const toggleDrugConfirm = (drugId: string) => {
    const nextDrugs = draft.drugs.map((d) => {
      if (d.drugId !== drugId) return d;
      const nextState: 'CONFIRMED' | 'AUTO_UNCONFIRMED' =
        d.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
      return { ...d, ocrReview: nextState };
    });
    const target = nextDrugs.find((d) => d.drugId === drugId);
    helpers.patchDraft({
      drugs: nextDrugs,
      ocrReviewMap: {
        ...draft.ocrReviewMap,
        [`drug:${drugId}`]: target?.ocrReview || 'CONFIRMED',
      },
    });
  };

  const addEmptyDrug = () => {
    const days = Math.max(1, Number(draft.prescribedDays) || 14);
    const newDrug: MedicineDrugItem = {
      drugId: `drug-${Date.now()}`,
      drugName: '',
      effectCategory: '처방약',
      dosePerTake: 1,
      dailyFrequency: 2,
      prescribedDays: days,
      totalQty: 2 * days,
      remainingQty: 2 * days,
      unitLabel: '정',
      slotLabels: ['아침', '저녁'],
      ocrReview: 'EDITED',
    };
    helpers.patchDraft({ drugs: [...draft.drugs, newDrug] });
  };

  const removeDrug = (drugId: string) => {
    const nextDrugs = draft.drugs.filter((d) => d.drugId !== drugId);
    const nextMap = { ...draft.ocrReviewMap };
    delete nextMap[`drug:${drugId}`];
    helpers.patchDraft({
      drugs: nextDrugs,
      totalPills: String(nextDrugs.reduce((sum, d) => sum + d.totalQty, 0) || Number(draft.totalPills) || 30),
      ocrReviewMap: nextMap,
    });
  };

  const handleConfirmAll = () => {
    helpers.confirmAllFields();
    if (draft.drugs.length > 0) {
      helpers.patchDraft({
        drugs: draft.drugs.map((d) => ({
          ...d,
          ocrReview: d.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : d.ocrReview,
        })),
      });
    }
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
      <RoutineAttachmentDropBar
        title="약봉지 이미지 첨부 OCR 자동 세팅"
        description="약봉지(약제비 영수증·복약안내) 사진만 첨부하면 처방병원, 조제약국, 투약일수, 수납총액 및 다중 약품(1회량×횟수×일수)이 자동 입력됩니다. 미리보기 아이콘으로 원본을 확대 확인하고 자동입력 배지를 터치하세요."
        uploadButtonLabel="약봉지 이미지 첨부"
        sampleButtonLabel="산들약국 5종 약봉지 예시 적용"
        accentTone="emerald"
        attachments={draft.attachments}
        reviewMap={draft.ocrReviewMap}
        onFilesUploaded={(files) => applyDrugBagOcr(files)}
        onSampleApply={() => applyDrugBagOcr()}
        onConfirmAll={handleConfirmAll}
        onRemoveAttachment={helpers.removeAttachment}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OcrFieldShell
          label="발행기관 (병원)"
          reviewState={draft.ocrReviewMap.hospitalOrBrand}
          onToggleConfirm={() => helpers.toggleFieldConfirm('hospitalOrBrand')}
        >
          <ElmInp01
            value={draft.hospitalOrBrand}
            onChange={(v) => helpers.updateField('hospitalOrBrand', v)}
            placeholder="예: 구의베스트내과의원"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="조제약국"
          reviewState={draft.ocrReviewMap.pharmacyName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('pharmacyName')}
        >
          <ElmInp01
            value={draft.pharmacyName}
            onChange={(v) => helpers.updateField('pharmacyName', v)}
            placeholder="예: 산들약국"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="조제일자"
          reviewState={draft.ocrReviewMap.prescribedDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('prescribedDate')}
        >
          <ElmInp01
            type="date"
            value={draft.prescribedDate}
            onChange={(v) => helpers.updateField('prescribedDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="투약일수 (일)"
          reviewState={draft.ocrReviewMap.prescribedDays}
          onToggleConfirm={() => helpers.toggleFieldConfirm('prescribedDays')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.prescribedDays}
            onChange={(v) => helpers.updateField('prescribedDays', v)}
            placeholder="14"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="수납총액 (원, 선택)"
          reviewState={draft.ocrReviewMap.receiptTotalAmount}
          onToggleConfirm={() => helpers.toggleFieldConfirm('receiptTotalAmount')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.receiptTotalAmount}
            onChange={(v) => helpers.updateField('receiptTotalAmount', v)}
            placeholder="32300"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="1일 복용 타임라인"
          reviewState={draft.ocrReviewMap.slotPreset}
          onToggleConfirm={() => helpers.toggleFieldConfirm('slotPreset')}
        >
          <ElmSel01
            value={draft.slotPreset}
            onChange={(v) =>
              helpers.updateField('slotPreset', v as '2_TIMES' | '3_TIMES' | '4_TIMES')
            }
            options={[
              { value: '2_TIMES', label: '1일 2회 (아침 · 저녁)' },
              { value: '3_TIMES', label: '1일 3회 (아침 · 점심 · 저녁)' },
              { value: '4_TIMES', label: '1일 4회 (아침 · 점심 · 저녁 · 취침전)' },
            ]}
          />
        </OcrFieldShell>
      </div>

      {/* OCR 추출 다중 약품 목록 (직접 수정 · 터치 확인 · 하단 추가 동선) */}
      <div className="space-y-2 pt-1">
        {/* 타이틀 영역 DIV */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            처방 약품 목록 ({draft.drugs.length}종 · 총 {draft.totalPills}정/캡슐)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 whitespace-nowrap">
            하단에서 추가·작성
          </span>
        </div>

        {/* 컨텐츠 영역 DIV */}
        <div className="space-y-2">
          {draft.drugs.length > 0 && (
            <div className="space-y-2">
              {draft.drugs.map((drug) => (
                <div
                  key={drug.drugId}
                  className={`p-2.5 rounded-lg border space-y-2 ${
                    drug.ocrReview === 'AUTO_UNCONFIRMED'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800'
                      : 'bg-slate-50/70 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {drug.slotLabels.join('·')}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        총 {drug.totalQty}{drug.unitLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <OcrConfirmBadge
                        state={drug.ocrReview}
                        onToggleConfirm={() => toggleDrugConfirm(drug.drugId)}
                        compact
                      />
                      <button
                        type="button"
                        onClick={() => removeDrug(drug.drugId)}
                        aria-label="약품 삭제"
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <ElmInp01
                        value={drug.drugName}
                        onChange={(v) => updateDrugRow(drug.drugId, { drugName: v })}
                        placeholder="약품명"
                      />
                    </div>
                    <div className="col-span-3">
                      <ElmInp01
                        type="number"
                        inputMode="numeric"
                        value={String(drug.dosePerTake)}
                        onChange={(v) => updateDrugRow(drug.drugId, { dosePerTake: Number(v) || 1 })}
                        placeholder="1회량"
                      />
                    </div>
                    <div className="col-span-3">
                      <ElmInp01
                        type="number"
                        inputMode="numeric"
                        value={String(drug.dailyFrequency)}
                        onChange={(v) => updateDrugRow(drug.drugId, { dailyFrequency: Number(v) || 1 })}
                        placeholder="1일횟수"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 약품 목록 하단 배치: 클릭 시 바로 위에 새 행이 추가되어 자연스러운 작성 동선 확보 */}
          <button
            type="button"
            onClick={addEmptyDrug}
            className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            약품 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export const medicinePlugin: RoutinePlugin<MedicineRoutine> = {
  category: 'HEALTH_MEDICINE',
  enabled: true,
  meta,
  renderIcon: (className = 'w-4 h-4') => <Pill className={className} />,

  isUrgent: (item) => item.remainingPills <= 5,

  getListSummary: (item, handlers) => {
    const taken = item.slots.filter((s) => s.taken).length;
    const nextUntaken = item.slots.find((s) => !s.taken);
    return {
      statusText: `오늘 ${taken}/${item.slots.length}`,
      statusClass:
        taken === item.slots.length
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400',
      metricText: `${item.drugs?.length || 1}종 · 잔여 ${item.remainingPills}정`,
      quickActionLabel: nextUntaken ? `${nextUntaken.label} 복용체크` : '상세보기',
      onQuickAction: () =>
        nextUntaken
          ? handlers.onToggleMedicineSlot(item.id, nextUntaken.slotId)
          : handlers.onOpenDetail(item.id),
    };
  },

  renderCard: (item, handlers) => {
    const takenCount = item.slots.filter((s) => s.taken).length;
    const totalSlots = item.slots.length;
    const remainPct = Math.max(
      0,
      Math.min(100, Math.round((item.remainingPills / Math.max(1, item.totalPills)) * 100))
    );
    const isLowStock = item.remainingPills <= 5;
    const drugs = item.drugs ?? [];
    const unconfirmedDrugs = drugs.filter((d) => d.ocrReview === 'AUTO_UNCONFIRMED').length;

    return (
      <article
        onClick={() => handlers.onOpenDetail(item.id)}
        className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 min-w-0">
              <Pill className={`w-4 h-4 shrink-0 ${meta.accentText}`} />
              <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>{meta.label}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">
                {item.hospitalOrBrand}
                {item.pharmacyName ? ` (${item.pharmacyName})` : ''}
              </span>
              <RoutineHelpTooltip content={meta.tooltip} />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-xs tabular-nums">
              {unconfirmedDrugs > 0 && (
                <OcrConfirmBadge
                  state="AUTO_UNCONFIRMED"
                  onToggleConfirm={() => handlers.onConfirmAllOcrItems(item.id)}
                  compact
                />
              )}
              <span className="font-semibold text-slate-700 dark:text-zinc-200 whitespace-nowrap">
                오늘 {takenCount}/{totalSlots}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {drugs.length > 0
                  ? `${drugs.length}종 조합 · ${item.prescribedDays || 14}일분${
                      item.receiptTotalAmount ? ` · 수납 ${item.receiptTotalAmount.toLocaleString()}원` : ''
                    }`
                  : item.ocrSummaryText}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        </div>

        {/* 시점별 복용 체크 (아침/점심/저녁/취침전) */}
        <div className={`grid gap-2 ${item.slots.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {item.slots.map((slot) => (
            <button
              key={slot.slotId}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlers.onToggleMedicineSlot(item.id, slot.slotId);
              }}
              className={`min-h-[44px] px-2.5 py-2 rounded-lg border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
                slot.taken
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50/80 dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-bold leading-none whitespace-nowrap">
                  {slot.label}
                  <span className="ml-1 text-[10px] font-mono opacity-75">{slot.pillsPerDose}알</span>
                </div>
                <div className="text-[10px] opacity-75 mt-1 font-mono tabular-nums whitespace-nowrap">
                  {slot.taken && slot.takenAt ? `${slot.takenAt} 완료` : slot.scheduledTime}
                </div>
              </div>
              <span
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                  slot.taken
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-transparent'
                }`}
              >
                <Check className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>

        {/* 약봉지 OCR 다중 약품 슬라이드 (개별 터치 확인 지원) */}
        {drugs.length > 0 && (
          <ElmSld03
            showNavButtons={false}
            className="min-w-0"
            innerClassName="flex items-center gap-1.5 pb-0.5"
          >
            {drugs.map((drug) => (
              <div
                key={drug.drugId}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[11px] shrink-0"
              >
                <span className="font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                  {drug.drugName}
                </span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                  {drug.dosePerTake}×{drug.dailyFrequency}회
                </span>
                <OcrConfirmBadge
                  state={drug.ocrReview}
                  onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, drug.drugId)}
                  compact
                />
              </div>
            ))}
          </ElmSld03>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              {isLowStock && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span className="whitespace-nowrap">
                잔여 <strong className="font-mono tabular-nums text-slate-900 dark:text-zinc-100">{item.remainingPills}</strong> / {item.totalPills}알
              </span>
            </div>
            {isLowStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onRefillMedicine(item.id);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                +30알 보충
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                {item.completionDate ? `완료예정 ${item.completionDate}` : `연속 ${item.streakDays}일째`}
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${remainPct}%` }}
            />
          </div>
        </div>
      </article>
    );
  },

  renderCreateFields: (draft, helpers) => (
    <MedicineCreateFields draft={draft} helpers={helpers} />
  ),

  renderDetailContent: (item, handlers) => {
    const drugs = item.drugs ?? [];
    const detailReviewMap: OcrFieldReviewMap = {};
    drugs.forEach((d) => {
      if (d.ocrReview) detailReviewMap[d.drugId] = d.ocrReview;
    });

    return (
      <div className="space-y-4">
        {/* 약봉지 추가 첨부 OCR 바 */}
        <RoutineAttachmentDropBar
          title="약봉지 추가 첨부 및 자동입력 확인"
          description="추가 처방 약봉지 이미지를 첨부하면 기존 약품 목록을 유지하면서 새 처방 약품이 자동 추가됩니다."
          uploadButtonLabel="약봉지 추가 첨부"
          sampleButtonLabel="추가 처방약 OCR 테스트"
          accentTone="emerald"
          attachments={item.attachments ?? []}
          reviewMap={detailReviewMap}
          onFilesUploaded={(files) => handlers.onAttachOcrFiles(item.id, files)}
          onSampleApply={() =>
            handlers.onAttachOcrFiles(item.id, [
              {
                fileName: '추가처방_약봉지.jpg',
                previewUrl: '/assets/aistudio/____d327bb33.jpg',
                isImage: true,
              },
            ])
          }
          onConfirmAll={() => handlers.onConfirmAllOcrItems(item.id)}
        />

        {/* 조제 메타 요약 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">발행병원 · 약국</div>
            <div className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
              {item.hospitalOrBrand}
            </div>
            {item.pharmacyName && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">{item.pharmacyName}</div>
            )}
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">조제일 · 투약일수</div>
            <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {item.prescribedDate}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">
              {item.prescribedDays || 14}일분
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">복용완료 예정</div>
            <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {item.completionDate || '-'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">약제비 수납총액</div>
            <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {item.receiptTotalAmount ? `${item.receiptTotalAmount.toLocaleString()}원` : '-'}
            </div>
          </div>
        </div>

        {/* 처방 약품별 상세 현황 (터치 확인 배지 포함) */}
        {drugs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
              <span>처방 약품 상세 ({drugs.length}종)</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">
                자동등록 배지 터치 시 확인 완료 처리
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {drugs.map((drug) => (
                <div
                  key={drug.drugId}
                  className="px-3.5 py-2.5 bg-white dark:bg-zinc-900/40 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {drug.drugName}
                      </span>
                      <span className="ml-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        {drug.effectCategory}
                      </span>
                    </div>
                    <OcrConfirmBadge
                      state={drug.ocrReview}
                      onToggleConfirm={() => handlers.onToggleOcrItemConfirm(item.id, drug.drugId)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="font-mono tabular-nums">
                      1회 {drug.dosePerTake}{drug.unitLabel} × 1일 {drug.dailyFrequency}회 ({drug.slotLabels.join('·')})
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                      잔여 {drug.remainingQty} / {drug.totalQty}{drug.unitLabel}
                    </span>
                  </div>
                  {(drug.storageNote || (drug.cautionTags && drug.cautionTags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {drug.storageNote && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-300">
                          {drug.storageNote}
                        </span>
                      )}
                      {drug.cautionTags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-[10px] font-semibold text-rose-700 dark:text-rose-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오늘 복용 타임라인 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
            <span>오늘 시점별 복용 타임라인</span>
            <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              잔여 {item.remainingPills} / {item.totalPills}알
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {item.slots.map((slot) => (
              <button
                key={slot.slotId}
                type="button"
                onClick={() => handlers.onToggleMedicineSlot(item.id, slot.slotId)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {slot.label} · {slot.timingRule}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums mt-0.5">
                    예정 {slot.scheduledTime} · 1회 {slot.pillsPerDose}알
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                    slot.taken
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {slot.taken ? slot.takenAt || '완료' : '복용 체크'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handlers.onRefillMedicine(item.id)}
          className="w-full min-h-[42px] rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:bg-emerald-100/70 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          처방전 재등록 (+30알 보충)
        </button>
      </div>
    );
  },
};
