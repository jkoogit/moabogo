// ============================================================================
// src/sample/screen/routine/plugins/pluginContract.tsx
// 모아루틴 차별기능 플러그인 표준 계약(Strategy Registry) 및 공용 UI 헬퍼
// ============================================================================

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  RoutineCategory,
  RoutineItem,
  ROUTINE_CATEGORY_META,
  RoutineAttachmentItem,
  RoutineUploadedFile,
  OcrFieldReviewMap,
  MedicineDrugItem,
  CardStatementItem,
  MvnoOcrStepKey,
} from '../types';

export interface RoutineCreateDraft {
  // 공통 첨부 · OCR 자동완성 메타
  autoTitle: string;
  autoSubtitle: string;
  attachments: RoutineAttachmentItem[];
  ocrReviewMap: OcrFieldReviewMap;
  // 약복용 (약봉지 OCR 기반 다중 약품)
  hospitalOrBrand: string;
  pharmacyName: string;
  prescribedDate: string;
  prescribedDays: string;
  receiptTotalAmount: string;
  totalPills: string;
  slotPreset: '2_TIMES' | '3_TIMES' | '4_TIMES';
  drugs: MedicineDrugItem[];
  // 알뜰폰 (번호이동 캡처 OCR 자동완성 연동)
  networkType: 'SKT망' | 'KT망' | 'LGU+망';
  carrierName: string;
  planName: string;
  dataCallSpec: string;
  promoMonthlyFee: string;
  normalMonthlyFee: string;
  promoMonths: string;
  openedDate: string;
  promoEndDate: string;
  usimType: 'USIM' | 'eSIM';
  usimSerial: string;
  autoPayMethod: string;
  benefitMemo: string;
  ocrAutofilled: boolean;
  // 세금계산서 (홈택스 영수증 OCR 기반)
  targetYearMonth: string;
  deadlineDate: string;
  initialClientName: string;
  initialBizNo: string;
  initialRepresentative: string;
  initialClientEmail: string;
  initialWrittenDate: string;
  initialItemName: string;
  initialClaimType: '청구' | '영수';
  initialSupplyAmount: string;
  initialVatAmount: string;
  // 급여·카드 정산 (카드명세서 OCR 기반)
  settlementYearMonth: string;
  sourceBankName: string;
  sourceAccountNo: string;
  dueDate: string;
  settlementMemo: string;
  initialCardName: string;
  initialCardBank: string;
  initialCardAmount: string;
  initialRepaidAmount: string;
  cards: CardStatementItem[];
}

export const INITIAL_CREATE_DRAFT: RoutineCreateDraft = {
  autoTitle: '',
  autoSubtitle: '',
  attachments: [],
  ocrReviewMap: {},
  hospitalOrBrand: '',
  pharmacyName: '',
  prescribedDate: '2026-11-23',
  prescribedDays: '14',
  receiptTotalAmount: '',
  totalPills: '30',
  slotPreset: '2_TIMES',
  drugs: [],
  networkType: 'SKT망',
  carrierName: 'SK 7mobile',
  planName: '',
  dataCallSpec: '11GB+일2GB+3Mbps · 무제한',
  promoMonthlyFee: '14900',
  normalMonthlyFee: '33900',
  promoMonths: '7',
  openedDate: '2026-11-23',
  promoEndDate: '2027-06-23',
  usimType: 'USIM',
  usimSerial: '',
  autoPayMethod: '신한카드 자동납부',
  benefitMemo: '',
  ocrAutofilled: false,
  targetYearMonth: '2026-11',
  deadlineDate: '2026-12-10',
  initialClientName: '',
  initialBizNo: '',
  initialRepresentative: '',
  initialClientEmail: '',
  initialWrittenDate: '2026-11-23',
  initialItemName: '',
  initialClaimType: '청구',
  initialSupplyAmount: '1500000',
  initialVatAmount: '150000',
  settlementYearMonth: '2026-11',
  sourceBankName: '우리은행 급여통장',
  sourceAccountNo: '1002-****-8812',
  dueDate: '2026-11-23',
  settlementMemo: '',
  initialCardName: '',
  initialCardBank: '우리은행',
  initialCardAmount: '650000',
  initialRepaidAmount: '0',
  cards: [],
};

export type UpdateDraftFn = <K extends keyof RoutineCreateDraft>(
  key: K,
  value: RoutineCreateDraft[K]
) => void;

export interface CreateFieldsHelpers {
  updateField: UpdateDraftFn;
  patchDraft: (partial: Partial<RoutineCreateDraft>) => void;
  toggleFieldConfirm: (fieldKey: string) => void;
  confirmAllFields: () => void;
  removeAttachment: (attachmentId: string) => void;
}

export interface RoutineCardActionHandlers {
  onOpenDetail: (routineId: string) => void;
  onToggleMedicineSlot: (routineId: string, slotId: string) => void;
  onRefillMedicine: (routineId: string) => void;
  onToggleMvnoChecklist: (routineId: string, stepId: string) => void;
  onCaptureMvnoOcrStep: (routineId: string, stepKey: MvnoOcrStepKey) => void;
  onCompleteMvnoRenewal: (routineId: string) => void;
  onToggleTaxClient: (routineId: string, clientId: string) => void;
  onToggleCardPayment: (routineId: string, cardId: string) => void;
  onToggleOcrItemConfirm: (routineId: string, itemId: string) => void;
  onConfirmAllOcrItems: (routineId: string) => void;
  onAttachOcrFiles: (routineId: string, files: RoutineUploadedFile[]) => void;
  onPublishCardTransfer: (routineId: string) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToLedger?: () => void;
  onCloseDetail?: () => void;
}

export interface RoutineListSummary {
  statusText: string;
  statusClass: string;
  metricText: string;
  quickActionLabel: string;
  onQuickAction: () => void;
}

export interface RoutinePlugin<T extends RoutineItem = RoutineItem> {
  category: T['category'];
  enabled: boolean; // Feature Flag — 설정만으로 차별기능 ON/OFF 제어
  meta: (typeof ROUTINE_CATEGORY_META)[RoutineCategory];
  renderIcon: (className?: string) => React.ReactNode;
  renderCard: (item: T, handlers: RoutineCardActionHandlers) => React.ReactNode;
  getListSummary: (item: T, handlers: RoutineCardActionHandlers) => RoutineListSummary;
  renderCreateFields: (draft: RoutineCreateDraft, helpers: CreateFieldsHelpers) => React.ReactNode;
  renderDetailContent: (item: T, handlers: RoutineCardActionHandlers) => React.ReactNode;
  isUrgent: (item: T) => boolean;
}

/**
 * 16x16 컴팩트 '?' 플로팅 도움말 툴팁 (리팩토링 표준지침 원칙 5)
 */
export const RoutineHelpTooltip: React.FC<{ content: string }> = ({ content }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="도움말 보기"
        className="w-5 h-5 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 w-60 p-2.5 rounded-lg bg-slate-900 dark:bg-zinc-800 text-white text-[11px] leading-relaxed border border-slate-700 dark:border-zinc-700 shadow-lg"
        >
          {content}
        </div>
      )}
    </div>
  );
};
