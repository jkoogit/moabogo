// ============================================================================
// src/sample/screen/routine/types.ts
// 모아루틴(SCR-ROU-01) 도메인 타입, 5단계 긴급도 FSM 및 PII 마스킹 유틸리티
// ============================================================================

import {
  OcrFieldReviewMap,
  OcrReviewState,
  RoutineAttachmentItem,
  RoutineUploadedFile,
} from '../../shared/routineOcrFields';

export type { OcrFieldReviewMap, OcrReviewState, RoutineAttachmentItem, RoutineUploadedFile };

export type RoutineCategory =
  | 'HEALTH_MEDICINE'
  | 'LIFE_PHONE'
  | 'BIZ_TAX'
  | 'FINANCE_CARD_SETTLE';

export type RoutineFilterCategory = 'ALL' | RoutineCategory;

export type RoutineViewMode = 'CARD' | 'LIST';

/**
 * 5단계 루틴 긴급도 유한 상태 머신 (RoutineUrgencyFSM)
 * - NORMAL   : D-31 이상 여유
 * - NOTICE   : D-15 ~ D-30 사전 인지
 * - IMMINENT : D-5 ~ D-14 임박
 * - URGENT   : D-0 ~ D-4 긴급 집행 필요
 * - OVERDUE  : 기한 초과 (D+N)
 */
export type RoutineUrgencyState =
  | 'NORMAL'
  | 'NOTICE'
  | 'IMMINENT'
  | 'URGENT'
  | 'OVERDUE';

export interface UrgencyFSMResult {
  state: RoutineUrgencyState;
  dDay: number;
  dDayText: string;
  label: string;
  toneClass: string;
}

export const ROUTINE_CATEGORY_META: Record<
  RoutineCategory,
  {
    label: string;
    shortLabel: string;
    cycleBadge: string;
    tooltip: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
  }
> = {
  HEALTH_MEDICINE: {
    label: '약복용 루틴',
    shortLabel: '약복용',
    cycleBadge: '매일 · 약봉지 OCR',
    tooltip: '약봉지 이미지 첨부로 다중 약품·1일 횟수·보유수량·복용기간을 자동 세팅하고 시점별로 복용 체크합니다',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    accentBorder: 'border-emerald-200 dark:border-emerald-800/70',
  },
  LIFE_PHONE: {
    label: '알뜰폰 환승',
    shortLabel: '알뜰폰',
    cycleBadge: '6~7개월 주기',
    tooltip: '프로모션 할인 종료 전 위약금 없는 최적 번호이동 구간을 D-Day로 추적하고 캡처 OCR로 자동 등록합니다',
    accentText: 'text-sky-700 dark:text-sky-400',
    accentBg: 'bg-sky-50 dark:bg-sky-950/50',
    accentBorder: 'border-sky-200 dark:border-sky-800/70',
  },
  BIZ_TAX: {
    label: '세금계산서 발급',
    shortLabel: '세금계산서',
    cycleBadge: '매월 10일 마감',
    tooltip: '세금계산서 영수증 이미지 첨부만으로 거래처·품목·공급가액·세액을 자동 세팅하고 10일 마감을 방어합니다',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/50',
    accentBorder: 'border-amber-200 dark:border-amber-800/70',
  },
  FINANCE_CARD_SETTLE: {
    label: '급여·카드 정산',
    shortLabel: '급여·카드정산',
    cycleBadge: '매월 급여일',
    tooltip: '카드명세서 첨부로 카드사별 결제금액·상환/잔액·은행별 합산을 자동 세팅하고 토스·카톡 이체 및 TRANSFER로 연동합니다',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    accentBorder: 'border-indigo-200 dark:border-indigo-800/70',
  },
};

export const ROUTINE_TODAY_ISO = '2026-11-23';

export function calculateDDay(targetDateIso: string, baseDateIso: string = ROUTINE_TODAY_ISO): number {
  const base = new Date(`${baseDateIso}T00:00:00`);
  const target = new Date(`${targetDateIso}T00:00:00`);
  const diffMs = target.getTime() - base.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function evaluateUrgencyFSM(targetDateIso: string, baseDateIso: string = ROUTINE_TODAY_ISO): UrgencyFSMResult {
  const dDay = calculateDDay(targetDateIso, baseDateIso);
  const dDayText = dDay === 0 ? 'D-Day' : dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`;

  if (dDay < 0) {
    return {
      state: 'OVERDUE',
      dDay,
      dDayText,
      label: '기한초과',
      toneClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    };
  }
  if (dDay <= 4) {
    return {
      state: 'URGENT',
      dDay,
      dDayText,
      label: '긴급',
      toneClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    };
  }
  if (dDay <= 14) {
    return {
      state: 'IMMINENT',
      dDay,
      dDayText,
      label: '임박',
      toneClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    };
  }
  if (dDay <= 30) {
    return {
      state: 'NOTICE',
      dDay,
      dDayText,
      label: '사전안내',
      toneClass: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    };
  }
  return {
    state: 'NORMAL',
    dDay,
    dDayText,
    label: '여유',
    toneClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  };
}

// --- PII 마스킹 유틸리티 (공통 보안 가드레일 SSOT 위임) ---
export {
  maskAccountNumber,
  maskBusinessNumber,
  maskPhoneNumber,
  maskUsimSerial,
} from '../../shared/securityGuards';

// ============================================================================
// 4대 루틴 개별 엔티티 정의
// ============================================================================

export interface BaseRoutineItem {
  id: string;
  category: RoutineCategory;
  title: string;
  subtitle: string;
  isActive: boolean;
  streakDays: number;
  updatedAt: string;
  attachments?: RoutineAttachmentItem[];
  ocrReviewMap?: OcrFieldReviewMap;
}

export type MedicineSlotLabel = '아침' | '점심' | '저녁' | '취침전';

export interface MedicineDrugItem {
  drugId: string;
  drugName: string; // 예: "케이캡정 50mg"
  effectCategory: string; // 예: "위식도역류질환약"
  dosePerTake: number; // 1회 투약량 (1, 2...)
  dailyFrequency: number; // 1일 횟수 (2, 3, 4...)
  prescribedDays: number; // 투약일수 (14일)
  totalQty: number; // 최초 총 수량 (투약량*횟수*일수)
  remainingQty: number; // 잔여 수량
  unitLabel: '정' | '캡슐' | '포';
  slotLabels: MedicineSlotLabel[]; // 아침/점심/저녁/취침전 조합
  storageNote?: string; // 실온보관 / 차광보관
  cautionTags?: string[]; // 예: ["카페인X", "졸림주의"]
  ocrReview?: OcrReviewState;
}

export interface MedicineTimeSlot {
  slotId: string;
  label: MedicineSlotLabel;
  scheduledTime: string; // e.g., "08:30"
  timingRule: string; // e.g., "식직후 / 취침전 30분"
  pillsPerDose: number; // 해당 시점 총 복용 알약 수
  taken: boolean;
  takenAt?: string;
}

export interface MedicineRoutine extends BaseRoutineItem {
  category: 'HEALTH_MEDICINE';
  hospitalOrBrand: string; // 발행기관 (예: 구의베스트내과의원)
  pharmacyName?: string; // 조제약국 (예: 산들약국)
  prescribedDate: string; // 조제일자 (예: 2026-11-05)
  completionDate?: string; // 복용완료예정일 (예: 2026-11-19)
  prescribedDays?: number; // 투약일수 (예: 14)
  receiptTotalAmount?: number; // 총수납금액 (예: 32,300원)
  hasPrescriptionOcr: boolean;
  ocrSummaryText: string;
  totalPills: number;
  remainingPills: number;
  drugs: MedicineDrugItem[];
  slots: MedicineTimeSlot[];
}

export interface MvnoChecklistStep {
  stepId: string;
  label: string;
  done: boolean;
}

export type MvnoOcrStepKey = 'STEP_1_PLAN' | 'STEP_2_APPLY' | 'STEP_3_USIM' | 'STEP_4_OPEN';

export interface MvnoOcrCaptureStep {
  stepKey: MvnoOcrStepKey;
  stepNo: 1 | 2 | 3 | 4;
  label: string;
  captureHint: string;
  captured: boolean;
  capturedAt?: string;
  extractedSummary?: string;
  ocrReview?: OcrReviewState;
}

export type MvnoLineMode = 'MNP_PROMO' | 'LONG_TERM_CONTRACT';
export type MvnoRoundLineStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'MAINTAINED';

export interface MvnoRoundLineEntry {
  lineId: string;
  ownerName: string; // 본인, 배우자, 어머니 등 (1인 다번호 허용)
  lineAlias: string; // e.g. "본인 메인", "본인 업무용"
  phoneNumberMasked: string;
  lineMode: MvnoLineMode; // 단기 번호이동 vs 장기 약정 점검용
  roundStatus: MvnoRoundLineStatus;
  skipReason?: string; // 차수 생략 시 사유
  networkType: 'SKT망' | 'KT망' | 'LGU+망';
  carrierName: string;
  planName: string;
  dataCallSpec: string;
  promoMonthlyFee: number;
  normalMonthlyFee: number;
  promoMonths: number;
  openedDate: string;
  mnpRestrictionEndDate: string;
  promoEndDate: string;
  penaltyFreeDate?: string;
  // 장기 약정 정보 (lineMode === 'LONG_TERM_CONTRACT')
  contractInfo?: {
    contractType: 'SELECTIVE_DISCOUNT' | 'DEVICE_SUBSIDY';
    contractMonths: number; // e.g. 24
    contractStartDate: string;
    contractEndDate: string;
    bundleMemo?: string;
  };
  // USIM / eSIM 관리
  usimType: 'USIM' | 'eSIM';
  usimSerialMasked?: string; // 실물 USIM 유심번호 (마스킹 저장)
  autoPayMethod: string;
  benefitMemo?: string;
  ocrCaptureSteps?: MvnoOcrCaptureStep[];
  checklist?: MvnoChecklistStep[];
}

export interface MvnoRoundGroup {
  roundId: string; // "2026-R2"
  year: number; // 2026
  roundNo: number; // 2 (표시: "2026-2차")
  maxLineCount: number; // 차수 관리 최대 회선 정원 (e.g. 5)
  lines: MvnoRoundLineEntry[];
}

export interface MvnoRoutine extends BaseRoutineItem {
  category: 'LIFE_PHONE';
  lineOwner: string;
  phoneNumberMasked: string;
  networkType: 'SKT망' | 'KT망' | 'LGU+망';
  carrierName: string;
  planName: string;
  dataCallSpec: string;
  promoMonthlyFee: number;
  normalMonthlyFee: number;
  promoMonths: number;
  openedDate: string;
  mnpRestrictionEndDate: string;
  promoEndDate: string;
  penaltyFreeDate: string;
  usimType: 'USIM' | 'eSIM';
  usimSerialMasked?: string;
  autoPayMethod: string;
  benefitMemo?: string;
  recommendedCarrierHint: string;
  ocrCaptureSteps: MvnoOcrCaptureStep[];
  checklist: MvnoChecklistStep[];
  // [0047] 다인·다회선 및 년도-차수 관리 확장
  roundGroup?: MvnoRoundGroup;
  activeLineId?: string;
}

export interface TaxClientItem {
  clientId: string;
  companyName: string;
  bizNo: string;
  representativeName?: string; // 성명(대표자)
  email?: string;
  writtenDate?: string; // 작성일자
  itemName?: string; // 품목명 (예: 시스템개발용역료)
  claimType?: '청구' | '영수';
  supplyAmount: number;
  vatAmount: number;
  status: 'PENDING' | 'ISSUED';
  issuedAt?: string;
  ocrReview?: OcrReviewState;
}

export interface TaxInvoiceRoutine extends BaseRoutineItem {
  category: 'BIZ_TAX';
  targetYearMonth: string; // e.g. "2026-10"
  deadlineDate: string; // e.g. "2026-11-10"
  hometaxSyncReady: boolean;
  clients: TaxClientItem[];
}

export interface CardStatementItem {
  cardId: string;
  cardName: string; // 예: 우리, 삼성, 농협, 현대, 국민, 비씨, 국민.보험, 우리.청약
  itemCategory?: 'CARD' | 'FIXED'; // 카드대금 vs 고정정산(보험·청약·IRP)
  targetBank: string; // 결제은행 (은행별 합산 분리 기준)
  targetAccountNo: string;
  paymentDay: number; // 결제일 (예: 23)
  depositDate?: string; // 입금일 (예: 2026-11-13)
  amount: number; // 결제금액
  repaidAmount: number; // 상환금액 (남은결제금액 = amount - repaidAmount)
  prepaidMemo?: string; // 선결제 메모
  syncSource?: 'LEDGER' | 'OCR' | 'MANUAL';
  status: 'PENDING' | 'TRANSFERRED';
  transferredAt?: string;
  ocrReview?: OcrReviewState;
}

export interface CardSettlementRoutine extends BaseRoutineItem {
  category: 'FINANCE_CARD_SETTLE';
  settlementYearMonth: string; // e.g. "2026-11"
  dueDate: string; // 급여일/입금일 (예: 2026-11-13)
  sourceBankName: string;
  sourceAccountNo: string;
  settlementMemo?: string; // 결제일 23일, 농협선결제 수수료 확인, 보험·청약 메모
  isTransferredToLedger: boolean;
  idempotencyKey?: string;
  cards: CardStatementItem[];
}

export type RoutineItem =
  | MedicineRoutine
  | MvnoRoutine
  | TaxInvoiceRoutine
  | CardSettlementRoutine;

export interface CreateRoutinePayload {
  category: RoutineCategory;
  title: string;
  subtitle: string;
  attachments?: RoutineAttachmentItem[];
  ocrReviewMap?: OcrFieldReviewMap;
  // Medicine (약봉지 OCR 기반 다중 약품)
  hospitalOrBrand?: string;
  pharmacyName?: string;
  prescribedDate?: string;
  prescribedDays?: number;
  receiptTotalAmount?: number;
  totalPills?: number;
  slotPreset?: '2_TIMES' | '3_TIMES' | '4_TIMES';
  drugs?: MedicineDrugItem[];
  // MVNO
  networkType?: 'SKT망' | 'KT망' | 'LGU+망';
  carrierName?: string;
  planName?: string;
  dataCallSpec?: string;
  promoMonthlyFee?: number;
  normalMonthlyFee?: number;
  promoMonths?: number;
  openedDate?: string;
  promoEndDate?: string;
  usimType?: 'USIM' | 'eSIM';
  usimSerial?: string;
  autoPayMethod?: string;
  benefitMemo?: string;
  ocrAutofilled?: boolean;
  // Tax (세금계산서 OCR 기반)
  targetYearMonth?: string;
  deadlineDate?: string;
  initialClientName?: string;
  initialBizNo?: string;
  initialRepresentative?: string;
  initialClientEmail?: string;
  initialWrittenDate?: string;
  initialItemName?: string;
  initialClaimType?: '청구' | '영수';
  initialSupplyAmount?: number;
  initialVatAmount?: number;
  // Card Settlement (카드명세서 OCR 기반 다중 카드/고정정산)
  settlementYearMonth?: string;
  sourceBankName?: string;
  sourceAccountNo?: string;
  dueDate?: string;
  settlementMemo?: string;
  initialCardName?: string;
  initialCardBank?: string;
  initialCardAmount?: number;
  initialRepaidAmount?: number;
  cards?: CardStatementItem[];
}
