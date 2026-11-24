// ============================================================================
// 빠른 등록 (SCR_QCK_01 / SCR_QCK_02) 공통 도메인 타입 · 프리셋 · 상태머신 테이블
// ============================================================================

export type MoneyEntryType = 'RECEIPT_EXPENSE' | 'TRANSFER_PAYMENT';

export interface LedgerOption {
  value: 'PERSONAL' | 'GROUP' | 'INSTANCE';
  label: string;
  badge: string;
  attributionNote: string;
}

export const LEDGER_OPTIONS: LedgerOption[] = [
  {
    value: 'GROUP',
    label: '우리집 가계부 (가족 공유)',
    badge: 'GROUP',
    attributionNote: '가족 공유 원장에 단일 귀속',
  },
  {
    value: 'PERSONAL',
    label: '내 개인 가계부 (기본)',
    badge: 'PERSONAL',
    attributionNote: '개인 원장에 배타적 귀속',
  },
  {
    value: 'INSTANCE',
    label: '2026 동창회 모임 (인스턴스)',
    badge: 'INSTANCE',
    attributionNote: '모임 정산 원장에 분리 귀속',
  },
];

export const QUICK_MEMBER_PRESETS: string[] = [
  '구본영(호스트)',
  '최수진(배우자)',
  '구민우(자녀)',
  '가족 전체',
  '본인(개인)',
];

export const QUICK_MONEY_TAGS: string[] = [
  '#생활비',
  '#모임대납',
  '#정산예정',
  '#고정비',
  '#용돈지급',
];

export interface ReceiptOcrPreset {
  id: string;
  label: string;
  entryType: MoneyEntryType;
  merchant: string;
  amount: string;
  paidAt: string;
  ledger: 'PERSONAL' | 'GROUP' | 'INSTANCE';
  payer: string;
  consumer: string;
  isTransfer: boolean;
  tags: string[];
  confidence: string;
  rawLines: string[];
}

export const RECEIPT_OCR_PRESETS: ReceiptOcrPreset[] = [
  {
    id: 'ocr-starbucks',
    label: '☕ 스타벅스 커피',
    entryType: 'RECEIPT_EXPENSE',
    merchant: '스타벅스 강남R점',
    amount: '11200',
    paidAt: '2026-11-25 08:42',
    ledger: 'PERSONAL',
    payer: '구본영(호스트)',
    consumer: '본인(개인)',
    isTransfer: false,
    tags: ['#생활비'],
    confidence: '98.7%',
    rawLines: ['STARBUCKS GANGNAM-R', '아메리카노 T x2  11,200', '승인일시 2026-11-25 08:42'],
  },
  {
    id: 'ocr-gs25',
    label: '🏪 GS25 편의점 야식',
    entryType: 'RECEIPT_EXPENSE',
    merchant: 'GS25 역삼디오빌점',
    amount: '18500',
    paidAt: '2026-11-24 22:15',
    ledger: 'GROUP',
    payer: '구본영(호스트)',
    consumer: '가족 전체',
    isTransfer: false,
    tags: ['#생활비', '#모임대납'],
    confidence: '97.9%',
    rawLines: ['GS25 역삼디오빌점', '간편식/음료 외 3건 18,500', '카드승인 18,500원'],
  },
  {
    id: 'ocr-toss',
    label: '💸 토스 이체 확인증',
    entryType: 'TRANSFER_PAYMENT',
    merchant: '토스뱅크 8201-*** 이체',
    amount: '50000',
    paidAt: '2026-11-25 09:05',
    ledger: 'GROUP',
    payer: '구본영(호스트)',
    consumer: '구민우(자녀)',
    isTransfer: true,
    tags: ['#용돈지급'],
    confidence: '99.2%',
    rawLines: ['TOSS BANK TRANSFER', '받는분: 구민우(토스뱅크)', '이체금액: 50,000원 완료'],
  },
];

// 오프라인에서도 깨지지 않는 OCR 미리보기 SVG 카드 데이터 URI 생성
export function buildOcrPreviewSvgDataUrl(
  title: string,
  amount: string,
  lines: string[],
  isTransfer: boolean
): string {
  const accent = isTransfer ? '#7c3aed' : '#4f46e5';
  const safeTitle = title.replace(/[<>&"']/g, '');
  const formattedAmt = `₩${Number(amount || 0).toLocaleString()}`;
  const safeLines = lines.slice(0, 3).map((l) => l.replace(/[<>&"']/g, ''));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="190" viewBox="0 0 320 190">
      <rect width="320" height="190" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="0" y="0" width="320" height="38" rx="14" fill="${accent}"/>
      <rect x="0" y="24" width="320" height="14" fill="${accent}"/>
      <text x="16" y="24" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="700">
        ${isTransfer ? 'TRANSFER RECEIPT · OCR VERIFIED' : 'POS RECEIPT · EasyOCR 2-STAGE'}
      </text>
      <text x="16" y="64" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="800">${safeTitle}</text>
      <text x="16" y="88" fill="${accent}" font-family="monospace" font-size="18" font-weight="800">${formattedAmt}</text>
      <line x1="16" y1="102" x2="304" y2="102" stroke="#cbd5e1" stroke-dasharray="4 3"/>
      <text x="16" y="124" fill="#475569" font-family="monospace" font-size="11">${safeLines[0] || ''}</text>
      <text x="16" y="144" fill="#475569" font-family="monospace" font-size="11">${safeLines[1] || ''}</text>
      <text x="16" y="164" fill="#64748b" font-family="monospace" font-size="10">${safeLines[2] || ''}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// 모아당번 직교 3상태머신 (Orthogonal 3-State Machine)
// ============================================================================
export type DutyProgressStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED';
export type DutySettlementStatus = 'UNSETTLED' | 'SETTLED';
export type DutyEvaluationStatus = 'UNVERIFIED' | 'AUTO_APPROVED' | 'MANUAL_CONFIRMED';

export const PROGRESS_STATUS_META: Record<
  DutyProgressStatus,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  PENDING: {
    label: '대기 (PENDING)',
    shortLabel: '대기',
    badgeClass: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
  },
  ASSIGNED: {
    label: '배정됨 (ASSIGNED)',
    shortLabel: '배정',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  IN_PROGRESS: {
    label: '진행중 (IN_PROGRESS)',
    shortLabel: '진행중',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  SUBMITTED: {
    label: '수행제출 (SUBMITTED)',
    shortLabel: '제출완료',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
};

export const SETTLEMENT_STATUS_META: Record<
  DutySettlementStatus,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  UNSETTLED: {
    label: '미정산 (UNSETTLED)',
    shortLabel: '미정산',
    badgeClass: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
  },
  SETTLED: {
    label: '정산완료 (SETTLED)',
    shortLabel: '정산완료',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
};

export const EVALUATION_STATUS_META: Record<
  DutyEvaluationStatus,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  UNVERIFIED: {
    label: '검증대기 (UNVERIFIED)',
    shortLabel: '검증대기',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  AUTO_APPROVED: {
    label: '1초 사진 자동승인 (AUTO_APPROVED)',
    shortLabel: '자동승인',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  MANUAL_CONFIRMED: {
    label: '수동 확인완료 (MANUAL_CONFIRMED)',
    shortLabel: '확인완료',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
};

export interface QuickDutyTaskOption {
  value: string;
  label: string;
  assignee: string;
  rewardAmount: number;
  defaultMemo: string;
}

export const QUICK_DUTY_TASKS: QuickDutyTaskOption[] = [
  {
    value: 'duty-01',
    label: '거실 청소기 및 물걸레 밀기 (오늘 순번)',
    assignee: '구본영(호스트)',
    rewardAmount: 0,
    defaultMemo: '분리수거 및 거실 청소기 1차 완료했습니다!',
  },
  {
    value: 'duty-02',
    label: '주말 분리수거 및 음식물 쓰레기 (용돈 3,000원)',
    assignee: '구민우(자녀)',
    rewardAmount: 3000,
    defaultMemo: '플라스틱·캔 분리수거 및 음식물 배출 완료!',
  },
  {
    value: 'duty-03',
    label: '2026 동창회 모임 숙소 식기 정리',
    assignee: '최수진(배우자)',
    rewardAmount: 5000,
    defaultMemo: '식기 건조 및 싱크대 정리 완료!',
  },
];

export interface QuickGoalTaskOption {
  value: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultIncrement: number;
  dailyTarget: number;
  currentAccum: number;
  totalTarget: number;
  colorScheme: 'indigo' | 'rose' | 'emerald' | 'sky';
  defaultMemo: string;
}

export const QUICK_GOAL_TASKS: QuickGoalTaskOption[] = [
  {
    value: 'goal-01',
    label: '가족 건강 1만보 걷기 챌린지 (동행 3명)',
    unit: '보',
    min: 0,
    max: 20000,
    step: 500,
    defaultIncrement: 10500,
    dailyTarget: 10000,
    currentAccum: 62000,
    totalTarget: 100000,
    colorScheme: 'emerald',
    defaultMemo: '저녁 산책 포함 목표 걸음 수 달성 인증!',
  },
  {
    value: 'goal-02',
    label: '주 3회 독서 서평 작성 챌린지',
    unit: '페이지',
    min: 0,
    max: 300,
    step: 10,
    defaultIncrement: 40,
    dailyTarget: 30,
    currentAccum: 180,
    totalTarget: 300,
    colorScheme: 'indigo',
    defaultMemo: '오늘 독서 분량 완독 및 핵심 메모 기록 완료!',
  },
  {
    value: 'goal-03',
    label: '비상금 매일 모으기 챌린지',
    unit: '원',
    min: 0,
    max: 200000,
    step: 5000,
    defaultIncrement: 30000,
    dailyTarget: 20000,
    currentAccum: 320000,
    totalTarget: 500000,
    colorScheme: 'sky',
    defaultMemo: '주간 저축 목표액 입금 인증!',
  },
];

export interface QuickPhotoPreset {
  id: string;
  label: string;
  taskType: 'DUTY' | 'GOAL';
  url: string;
}

export function buildPhotoProofFallbackSvg(label: string): string {
  const safe = label.replace(/[<>&"']/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
      <rect width="240" height="160" rx="12" fill="#f3e8ff"/>
      <circle cx="120" cy="64" r="24" fill="#9333ea" opacity="0.18"/>
      <text x="120" y="70" text-anchor="middle" fill="#7e22ce" font-family="sans-serif" font-size="22">📸</text>
      <text x="120" y="112" text-anchor="middle" fill="#3b0764" font-family="sans-serif" font-size="12" font-weight="700">${safe}</text>
      <text x="120" y="132" text-anchor="middle" fill="#6b21a8" font-family="monospace" font-size="10">EXIF &amp; 1s Proof Verified</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const QUICK_PHOTO_PRESETS: QuickPhotoPreset[] = [
  {
    id: 'photo-clean',
    label: '🧹 청소/분리수거',
    taskType: 'DUTY',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-walk',
    label: '🏃 1만보 걷기 달성',
    taskType: 'GOAL',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-book',
    label: '📚 독서/학습 노트',
    taskType: 'GOAL',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&auto=format&fit=crop&q=80',
  },
];

export function createIdempotencyKey(prefix: string): string {
  return `idemp_${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
