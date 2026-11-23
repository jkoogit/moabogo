// ============================================================================
// src/sample/screen/routine/RoutineModals.tsx
// 모아루틴 ElmBsh01 고정 3분할 등록·상세 모달 셸 (Strategy Plugin Registry 위임)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { ElmBsh01, ElmInp01, ElmSld03 } from '../../elements/Tokens';
import { RoutineCategory, RoutineItem, CreateRoutinePayload } from './types';
import { getEnabledRoutinePlugins, getRoutinePlugin } from './plugins/registry';
import {
  INITIAL_CREATE_DRAFT,
  RoutineCreateDraft,
  CreateFieldsHelpers,
  RoutineCardActionHandlers,
} from './plugins/pluginContract';

// ============================================================================
// 1. 신규 루틴 등록 모달 (ElmBsh01 고정 3분할)
// ============================================================================
export const RoutineCreateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoutinePayload) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const enabledPlugins = getEnabledRoutinePlugins();
  const [category, setCategory] = useState<RoutineCategory>('HEALTH_MEDICINE');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [draft, setDraft] = useState<RoutineCreateDraft>(INITIAL_CREATE_DRAFT);

  const activePlugin = getRoutinePlugin(category);

  // 어느 유형이든 파일첨부 OCR로 autoTitle/autoSubtitle이 생성되면 비어있는 제목/메모에 자동 세팅
  useEffect(() => {
    if (!draft.autoTitle && !draft.autoSubtitle) return;
    if (draft.autoTitle && !title.trim()) {
      setTitle(draft.autoTitle);
    }
    if (draft.autoSubtitle && !subtitle.trim()) {
      setSubtitle(draft.autoSubtitle);
    }
    setDraft((prev) => ({ ...prev, autoTitle: '', autoSubtitle: '' }));
  }, [draft.autoTitle, draft.autoSubtitle, title, subtitle]);

  const helpers: CreateFieldsHelpers = useMemo(
    () => ({
      updateField: (key, value) => {
        setDraft((prev) => {
          const fieldKey = String(key);
          const hasReview = Boolean(prev.ocrReviewMap[fieldKey]);
          return {
            ...prev,
            [key]: value,
            ocrReviewMap: hasReview
              ? { ...prev.ocrReviewMap, [fieldKey]: 'EDITED' }
              : prev.ocrReviewMap,
          };
        });
      },
      patchDraft: (partial) => {
        setDraft((prev) => ({ ...prev, ...partial }));
      },
      toggleFieldConfirm: (fieldKey) => {
        setDraft((prev) => {
          const current = prev.ocrReviewMap[fieldKey];
          if (!current) return prev;
          const next = current === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
          return {
            ...prev,
            ocrReviewMap: { ...prev.ocrReviewMap, [fieldKey]: next },
          };
        });
      },
      confirmAllFields: () => {
        setDraft((prev) => {
          const nextMap = { ...prev.ocrReviewMap };
          Object.keys(nextMap).forEach((k) => {
            if (nextMap[k] === 'AUTO_UNCONFIRMED') {
              nextMap[k] = 'CONFIRMED';
            }
          });
          return { ...prev, ocrReviewMap: nextMap };
        });
      },
      removeAttachment: (attachmentId) => {
        setDraft((prev) => ({
          ...prev,
          attachments: prev.attachments.filter((a) => a.attachmentId !== attachmentId),
        }));
      },
    }),
    []
  );

  const handleResetAndClose = () => {
    setTitle('');
    setSubtitle('');
    setDraft(INITIAL_CREATE_DRAFT);
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      category,
      title,
      subtitle,
      attachments: draft.attachments,
      ocrReviewMap: draft.ocrReviewMap,
      // Medicine
      hospitalOrBrand: draft.hospitalOrBrand,
      pharmacyName: draft.pharmacyName,
      prescribedDate: draft.prescribedDate,
      prescribedDays: Number(draft.prescribedDays) || 14,
      receiptTotalAmount: Number(draft.receiptTotalAmount) || undefined,
      totalPills: Number(draft.totalPills) || 30,
      slotPreset: draft.slotPreset,
      drugs: draft.drugs,
      // MVNO
      networkType: draft.networkType,
      carrierName: draft.carrierName,
      planName: draft.planName,
      dataCallSpec: draft.dataCallSpec,
      promoMonthlyFee: Number(draft.promoMonthlyFee) || 0,
      normalMonthlyFee: Number(draft.normalMonthlyFee) || 0,
      promoMonths: Number(draft.promoMonths) || 7,
      openedDate: draft.openedDate,
      promoEndDate: draft.promoEndDate,
      usimType: draft.usimType,
      usimSerial: draft.usimSerial,
      autoPayMethod: draft.autoPayMethod,
      benefitMemo: draft.benefitMemo,
      ocrAutofilled: draft.ocrAutofilled,
      // Tax
      targetYearMonth: draft.targetYearMonth,
      deadlineDate: draft.deadlineDate,
      initialClientName: draft.initialClientName,
      initialBizNo: draft.initialBizNo,
      initialRepresentative: draft.initialRepresentative,
      initialClientEmail: draft.initialClientEmail,
      initialWrittenDate: draft.initialWrittenDate,
      initialItemName: draft.initialItemName,
      initialClaimType: draft.initialClaimType,
      initialSupplyAmount: Number(draft.initialSupplyAmount) || 0,
      initialVatAmount: Number(draft.initialVatAmount) || 0,
      // Card Settlement
      settlementYearMonth: draft.settlementYearMonth,
      sourceBankName: draft.sourceBankName,
      sourceAccountNo: draft.sourceAccountNo,
      dueDate: draft.dueDate,
      settlementMemo: draft.settlementMemo,
      initialCardName: draft.initialCardName,
      initialCardBank: draft.initialCardBank,
      initialCardAmount: Number(draft.initialCardAmount) || 0,
      initialRepaidAmount: Number(draft.initialRepaidAmount) || 0,
      cards: draft.cards,
    });
    setTitle('');
    setSubtitle('');
    setDraft(INITIAL_CREATE_DRAFT);
  };

  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="새 루틴 등록"
      badge="SCR-ROU-01"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 whitespace-nowrap cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!title.trim()}
            onClick={handleSave}
            className="min-h-[42px] px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            루틴 저장
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 활성 플러그인 기반 카테고리 선택 (타이틀 DIV / 컨텐츠 DIV 분리 + ElmSld03 슬라이드드래그휠) */}
        <div className="space-y-2">
          {/* 타이틀 영역 DIV */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
              루틴 유형 선택
            </label>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums whitespace-nowrap">
              {enabledPlugins.length}종 · 드래그/휠
            </span>
          </div>

          {/* 컨텐츠 영역 DIV (슬라이드드래그휠 적용) */}
          <div className="min-w-0">
            <ElmSld03
              showNavButtons={false}
              stepWidth={160}
              className="min-w-0"
              innerClassName="flex items-stretch gap-2 pb-0.5"
            >
              {enabledPlugins.map((plugin) => {
                const active = category === plugin.category;
                return (
                  <button
                    key={plugin.category}
                    type="button"
                    onClick={() => {
                      setCategory(plugin.category);
                      setTitle('');
                      setSubtitle('');
                      setDraft(INITIAL_CREATE_DRAFT);
                    }}
                    className={`min-h-[44px] min-w-[144px] shrink-0 self-stretch px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold whitespace-nowrap">{plugin.meta.label}</div>
                    <div className="text-[11px] opacity-75 truncate mt-0.5 whitespace-nowrap">
                      {plugin.meta.cycleBadge}
                    </div>
                  </button>
                );
              })}
            </ElmSld03>
          </div>
        </div>

        {/* 공통 기본 입력 필드 */}
        <ElmInp01
          label="루틴 제목 *"
          value={title}
          onChange={setTitle}
          placeholder="파일 첨부 시 자동 세팅되며 직접 수정 가능합니다"
        />
        <ElmInp01
          label="간단 메모 (선택)"
          value={subtitle}
          onChange={setSubtitle}
          placeholder="예: 약봉지·명세서·영수증 이미지 첨부만으로 자동 입력"
        />

        {/* 플러그인별 차별화 입력 필드 및 OCR 자동세팅 위임 */}
        {activePlugin?.renderCreateFields(draft, helpers)}
      </div>
    </ElmBsh01>
  );
};

// ============================================================================
// 2. 루틴 상세 뷰어 모달 (ElmBsh01 고정 3분할)
// ============================================================================
export const RoutineDetailModal: React.FC<{
  routine: RoutineItem | null;
  onClose: () => void;
  onDelete: (routineId: string) => void;
  handlers: RoutineCardActionHandlers;
}> = ({ routine, onClose, onDelete, handlers }) => {
  if (!routine) return null;
  const plugin = getRoutinePlugin(routine.category);
  if (!plugin) return null;

  const { meta } = plugin;

  return (
    <ElmBsh01
      isOpen={!!routine}
      onClose={onClose}
      title={routine.title}
      badge={meta.shortLabel}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onDelete(routine.id)}
            className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            루틴 삭제
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            닫기
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
          <span className={`font-semibold ${meta.accentText}`}>{meta.label}</span>
          <span aria-hidden="true">·</span>
          <span>{meta.cycleBadge}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">연속 {routine.streakDays}회/일 달성</span>
        </div>

        {/* 플러그인별 차별화 상세 콘텐츠 위임 */}
        {plugin.renderDetailContent(routine, { ...handlers, onCloseDetail: onClose })}
      </div>
    </ElmBsh01>
  );
};
