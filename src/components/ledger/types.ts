// ============================================================================
// src/components/ledger/types.ts
// 통합 가계부(SCR-LED-01) 및 모달 공유 도메인 타입/프리셋 (순환 참조 방지 SSOT)
// ============================================================================

export type LedgerType = 'PERSONAL' | 'GROUP' | 'INSTANCE';
export type LedgerPeriodType = 'LONG_TERM' | 'SHORT_TERM';
export type LedgerSubType = 'STANDARD' | 'POCKET_MONEY';
export type LedgerClosingStatus = 'OPEN' | 'CLOSED' | 'SETTLED';
export type LedgerRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';

export type MainAxisTab = 'WRITE' | 'ANALYSIS';
export type WriteSubTab = 'EXPENSE' | 'INCOME';
export type DeckTab = 'EXPENSE' | 'INCOME' | 'ANALYTICS';
export type ExpenseSubTab = 'GENERAL' | 'STATEMENT';
export type IncomeSubTab = 'LIST' | 'FIXED';
export type AnalysisSubTab = 'STATUS' | 'REPORT';

export interface AnalysisReportSnapshot {
  id: string;
  version: string;
  title: string;
  period: string;
  createdAt: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  cardBilledTotal: number;
  txCount: number;
  summaryNotes: string[];
  status: 'VERIFIED' | 'NEEDS_RECOLLECT';
}

export interface DynamicBannerItem {
  id: string;
  tabLabel: string;
  title: string;
  amount: number;
  badge: string;
  badgeColor: string;
  description: string;
  icon: string;
  details: {
    label: string;
    value: string;
  }[];
  note: string;
}

export interface ExpenseProofItem {
  id: string;
  type: 'MANUAL' | 'RECEIPT_OCR' | 'SMS_NOTIFICATION' | 'STATEMENT_LINE';
  title: string;
  amount: number;
  date: string;
  source: string;
  thumbnailUrl?: string;
  receiptImageUrl?: string;
  merchant?: string;
  details?: string[];
  isArchived?: boolean;
  cardName?: string;
  approvalNo?: string;
  installmentMonths?: string;
  statementDiscount?: number;
  paymentDueDate?: string;
  paymentAccount?: string;
  businessNumber?: string;
  ceoName?: string;
  taxAmount?: number;
  supplyAmount?: number;
  cashReceiptNo?: string;
  rawFileName?: string;
  itemsList?: Array<{ name: string; qty: number; unitPrice: number; totalPrice: number }>;
}

export interface LedgerMember {
  id: string;
  name: string;
  role: LedgerRole;
  isGuest: boolean;
  guestId?: string;
  joinedAt: string;
  avatar: string;
}

export interface LedgerBook {
  id: string;
  title: string;
  type: LedgerType;
  periodType: LedgerPeriodType;
  subType: LedgerSubType;
  closingStatus: LedgerClosingStatus;
  budgetCap?: number;
  spentAmount?: number;
  resetCycle?: 'MONTHLY' | 'WEEKLY' | 'NONE';
  allowReopen?: boolean;
  closedAt?: string;
  closedBy?: string;
  description: string;
  balance: number;
  currency: string;
  designStyle: 'LEATHER' | 'HARDCOVER' | 'KRAFT' | 'FABRIC' | 'SLATE' | 'VINTAGE_BURGUNDY';
  customCoverColor?: string;
  colorTheme: {
    bg: string;
    border: string;
    spineGrad: string;
    labelBg: string;
    labelText: string;
    bookmarkColor: string;
    accent: string;
  };
  membersCount: number;
  createdAt: string;
  settlementCycle?: string;
}

export interface LedgerTransaction {
  id: string;
  ledgerId: string;
  title: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  category: string;
  date: string;
  payerName: string;
  isAssetTransfer: boolean;
  relatedTransferId?: string;
  tagNames: string[];
  note?: string;
  reconciliationStatus?: 'CONFIRMED' | 'PENDING' | 'DISPUTED';
  proofs?: ExpenseProofItem[];
  statementDiscount?: number;
  statementCardName?: string;
  expenseRecordId?: string;
  crossServiceLinks?: {
    dutyId?: string;
    dutyTitle?: string;
    goalId?: string;
    goalTitle?: string;
    guestId?: string;
    guestEventName?: string;
    transferPairId?: string;
  };
}

export interface CardStatementSummary {
  cardCode: string;
  cardName: string;
  cardAlias: string;
  logoColor: string;
  paymentDate: string;
  account: string;
  totalBilled: number;
  lumpSum: number;
  installment: number;
  revolving?: number;
  fees: number;
  benefitDiscount: number;
  notableItems: string[];
  installmentAlert?: string;
}

export interface CardStatementIntakeReview {
  id: string;
  cardName: string;
  statementMonth: string;
  totalBilled: number;
  txCount: number;
  installmentCount: number;
  lumpSumCount: number;
  needsReview: boolean;
  rawFileName: string;
  lines: Array<{
    id: string;
    date: string;
    merchant: string;
    amount: number;
    installment: string;
    approvalNo: string;
    discount: number;
    isFixedExpense?: boolean;
    fixedExpenseType?: string;
  }>;
}

export interface FixedIncomeRule {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: '급여' | '배당금' | '이자' | '임대료' | '기타';
  targetLedgerTitle: string;
  targetLedgerId: string;
  notifyEnabled: boolean;
  account: string;
}

export interface BankStatementImportItem {
  id: string;
  date: string;
  bankName: string;
  accountNoMasked: string;
  description: string;
  depositAmount: number;
  withdrawAmount: number;
  inferredType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  targetCategory: string;
  selected: boolean;
}

export interface DailyAggregationItem {
  date: string;
  dayNum: number;
  dayOfWeek: string;
  totalIncome: number;
  totalExpense: number;
  txCount: number;
  notableItems: string[];
}

export const SAMPLE_RECEIPTS = [
  {
    id: 'rc-1',
    icon: '🛒',
    merchant: '이마트 역삼점',
    amount: 46500,
    amountStr: '46,500원',
    category: '식료품/마트',
    cardName: '현대카드',
    itemSummary: '신선식품 및 생필품 장보기',
    fileName: 'emart_receipt_20261014.jpg',
  },
  {
    id: 'rc-2',
    icon: '☕',
    merchant: '스타벅스 강남R점',
    amount: 12400,
    amountStr: '12,400원',
    category: '외식/식음료',
    cardName: '우리카드',
    itemSummary: '아메리카노 2잔 & 베이글',
    fileName: 'starbucks_receipt.png',
  },
  {
    id: 'rc-3',
    icon: '⛽',
    merchant: 'GS칼텍스 삼화주유소',
    amount: 50000,
    amountStr: '50,000원',
    category: '교통/차량',
    cardName: '신한카드',
    itemSummary: '휘발유 50,000원 주유',
    fileName: 'gs_gas_receipt.jpg',
  },
  {
    id: 'rc-4',
    icon: '🥐',
    merchant: '파리바게뜨 판교점',
    amount: 18200,
    amountStr: '18,200원',
    category: '외식/식음료',
    cardName: 'KB국민카드',
    itemSummary: '식빵, 샌드위치 간식',
    fileName: 'paris_baguette_rec.png',
  },
];
