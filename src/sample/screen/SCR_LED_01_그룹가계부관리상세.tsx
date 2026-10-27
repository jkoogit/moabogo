import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmFlt01,
  ElmCnt01,
  ElmBsh01,
  ElmChk01,
  ElmTip01,
  ElmSld03,
  ElmHlp01,
} from '../elements/Tokens';
import {
  Wallet,
  Users,
  Plus,
  Copy,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Book,
  BookOpen,
  CheckCircle2,
  Check,
  AlertTriangle,
  Tag,
  Receipt,
  UserPlus,
  UserX,
  Sparkles,
  HelpCircle,
  X,
  ShieldCheck,
  Bookmark,
  GripVertical,
  GripHorizontal,
  SlidersHorizontal,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  FileText,
  Coins,
  PiggyBank,
  Clock,
  CreditCard,
  Layers,
  FileSearch,
  Database,
  HardDrive,
  Zap,
  RefreshCw,
  Archive,
  FolderArchive,
  FileCheck,
  Eye,
  DownloadCloud,
  Building2,
  Calendar,
  Upload,
  AlertCircle,
  Filter,
  CheckSquare,
  Paperclip,
  PieChart,
  Bell,
  ExternalLink,
  FileSpreadsheet,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  FolderOpen,
  FileBarChart,
  Palette,
  Camera,
  LayoutGrid,
  List,
  Trash2,
} from 'lucide-react';

import {
  LedgerProofReconcileModal,
  LedgerReportDetailModal,
  LedgerDomainPrinciplesModal,
  LedgerMemberManageModal,
  LedgerNewTransactionModal,
  LedgerFixedIncomeModal,
  LedgerStatementEditModal,
  LedgerBankImportModal,
  LedgerNewLedgerModal,
  LedgerEditCoverModal,
} from "../../components/ledger/modals";

// ============================================================================
// 도메인 타입 정의 (회계 프로세스, 전역 원자 지출 SSOT & 멀티 증빙)
// ============================================================================
export type LedgerType = 'PERSONAL' | 'GROUP' | 'INSTANCE';
export type LedgerPeriodType = 'LONG_TERM' | 'SHORT_TERM';
export type LedgerSubType = 'STANDARD' | 'POCKET_MONEY';
export type LedgerClosingStatus = 'OPEN' | 'CLOSED' | 'SETTLED';
export type LedgerRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';

// 2대 대메뉴 대축: 1. 장부작성(수입·지출) / 2. 분석(현황·보고서)
export type MainAxisTab = 'WRITE' | 'ANALYSIS';
export type WriteSubTab = 'EXPENSE' | 'INCOME';
export type DeckTab = 'EXPENSE' | 'INCOME' | 'ANALYTICS';
export type ExpenseSubTab = 'GENERAL' | 'STATEMENT';
export type IncomeSubTab = 'LIST' | 'FIXED';
export type AnalysisSubTab = 'STATUS' | 'REPORT';

// 보고서 스냅샷 이력 관리 타입
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

// 유동정보 서류철 인덱스 슬라이드 배너 아이템
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

// N개 무제한 멀티 증빙 자료 아이템 (수집방법별 세부 속성 확장)
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
  isArchived?: boolean; // 30일 경과 tarball 압축 아카이브 여부 (운영비 0원)
  // [태스크 0009 신규] 수집 방법별 확장 상세 속성
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
  // 2.5 책별 고유 디자인 (가죽, 하드커버, 크라프트, 패브릭 등 다양한 텍스처/디자인)
  designStyle: 'LEATHER' | 'HARDCOVER' | 'KRAFT' | 'FABRIC' | 'SLATE' | 'VINTAGE_BURGUNDY';
  customCoverColor?: string; // 사용자 지정 북커버 색상 (Hex 코드)
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
  // [태스크 0008-02] 원자 지출 SSOT 대사 상태 및 N개 멀티 증빙
  reconciliationStatus?: 'CONFIRMED' | 'PENDING' | 'DISPUTED';
  proofs?: ExpenseProofItem[];
  statementDiscount?: number; // 카드사 청구할인 혜택
  statementCardName?: string; // 대사된 카드명
  // [태스크 0009 신규] 지출원장 단방향 참조 및 타서비스 관계 링크
  expenseRecordId?: string; // 단방향 기준정보 식별자 (원장은 장부를 모름)
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

// 10월 6대 카드사 명세서 요약 인터페이스
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

// [태스크 0009 신규] 명세서 등록 및 수집 리뷰 인터페이스
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

// [태스크 0009 신규] 고정수입 설정 인터페이스
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

// [태스크 0009 신규] 통장 거래내역 첨부 및 파싱 인터페이스
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

// [태스크 0009 신규] 일간 집계 인터페이스
export interface DailyAggregationItem {
  date: string;
  dayNum: number;
  dayOfWeek: string;
  totalIncome: number;
  totalExpense: number;
  txCount: number;
  notableItems: string[];
}

interface SCR_LED_01_Props {
  onBack?: () => void;
}


// ============================================================================
// 사용자 제공 일러스트레이션(image.png) 기반: 카툰 북 스택 오브젝트 (CartoonStackedBookObject)
// - 카드 박스가 아닌, 두꺼운 먹선 테두리와 빈티지 원색 커버를 가진 실물 책 그림
// - 윗면(Top Edge) + 펼쳐진 페이지 종이 단면(Page Block) + 둥근 척추 책등(Rounded Spine)
// - 책등에 선명한 가로 장부 타이틀, 권수(VOL), 잔액 실링, 모임 멤버 수 배지 인쇄
// - 스택 최상단 책 위에는 클래식 동글이 안경(Vintage Reading Glasses) 오브젝트 얹힘
// - 책 선택 시 쓱 앞으로 당겨지는 3D 슬라이드 + 리본 펄럭임 효과
// 북커버 추천 시그니처 색상 프리셋
export const COVER_COLOR_PRESETS = [
  { name: '클래식 블루', color: '#3a7bbd' },
  { name: '포레스트 그린', color: '#5f8430' },
  { name: '어텀 앰버', color: '#e5a622' },
  { name: '브릭 레드', color: '#b73c26' },
  { name: '로열 버건디', color: '#9e242f' },
  { name: '슬레이트 차콜', color: '#475569' },
  { name: '바이올렛 퍼플', color: '#7c3aed' },
  { name: '피치 코랄', color: '#f97316' },
];

// 지출 등록 영수증 OCR 원클릭 샘플 프리셋
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

interface CartoonBookObjectProps {
  book: LedgerBook;
  idx: number; // 0 = 맨 위 책, total-1 = 맨 아래 책
  total: number;
  thicknessScale: number; // 1.0x ~ 2.0x (전체 장부 금액 기준 상대적 두께, 최고 잔액은 2.0배)
  isSelected: boolean;
  onSelect: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * (percent / 100))));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const CartoonStackedBookObject: React.FC<CartoonBookObjectProps> = ({
  book,
  idx,
  total,
  thicknessScale = 1.0,
  isSelected,
  onSelect,
  isDragging = false,
  isDragOver = false,
}) => {
  // [요구사항 1] 사용자 지정 커스텀 색상 지원 및 5가지 시그니처 카툰 북 테마
  const theme = (() => {
    if (book.customCoverColor) {
      const base = book.customCoverColor;
      return {
        id: `cartoon-custom-${book.id}`,
        coverTop: adjustBrightness(base, 24),
        coverSpine: base,
        coverBottom: adjustBrightness(base, -28),
        pageColor: '#fdfbf2',
        pageLine: '#cfc6b0',
        ribbon: '#fbbf24',
        accent: adjustBrightness(base, 36),
        labelBg: '#ffffff',
        labelBorder: adjustBrightness(base, -40),
        labelText: adjustBrightness(base, -60),
        badgeBg: adjustBrightness(base, -20),
        badgeText: '#ffffff',
        cornerDeco: '#fbbf24',
        spinePattern: (book.designStyle === 'HARDCOVER' ? 'STRIPE' : book.designStyle === 'LEATHER' ? 'BAND' : book.designStyle === 'SLATE' ? 'DOTS' : 'CHEVRON') as any,
      };
    }
    switch (book.designStyle) {
      case 'HARDCOVER':
        return {
          id: `cartoon-blue-${book.id}`,
          coverTop: '#6ba3d6',
          coverSpine: '#3a7bbd',
          coverBottom: '#275b94',
          pageColor: '#fbf7ee',
          pageLine: '#cfc6b0',
          ribbon: '#f59e0b',
          accent: '#93c5fd',
          labelBg: '#ffffff',
          labelBorder: '#1e40af',
          labelText: '#1e3a8a',
          badgeBg: '#1e3a8a',
          badgeText: '#ffffff',
          cornerDeco: '#fbbf24',
          spinePattern: 'STRIPE',
        };
      case 'LEATHER':
        return {
          id: `cartoon-green-${book.id}`,
          coverTop: '#84a953',
          coverSpine: '#5f8430',
          coverBottom: '#425f1e',
          pageColor: '#faf6ea',
          pageLine: '#c9be9f',
          ribbon: '#ef4444',
          accent: '#86efac',
          labelBg: '#fefce8',
          labelBorder: '#166534',
          labelText: '#14532d',
          badgeBg: '#15803d',
          badgeText: '#ffffff',
          cornerDeco: '#fbbf24',
          spinePattern: 'BAND',
        };
      case 'KRAFT':
        return {
          id: `cartoon-yellow-${book.id}`,
          coverTop: '#f6c344',
          coverSpine: '#e5a622',
          coverBottom: '#b7790b',
          pageColor: '#fdfbf2',
          pageLine: '#d5cca7',
          ribbon: '#3b82f6',
          accent: '#fef08a',
          labelBg: '#ffffff',
          labelBorder: '#b45309',
          labelText: '#78350f',
          badgeBg: '#b45309',
          badgeText: '#ffffff',
          cornerDeco: '#78350f',
          spinePattern: 'CHEVRON',
        };
      case 'FABRIC':
        return {
          id: `cartoon-brick-${book.id}`,
          coverTop: '#d75841',
          coverSpine: '#b73c26',
          coverBottom: '#8f2916',
          pageColor: '#faf3e3',
          pageLine: '#cfbea0',
          ribbon: '#10b981',
          accent: '#fca5a5',
          labelBg: '#fff7ed',
          labelBorder: '#991b1b',
          labelText: '#7f1d1d',
          badgeBg: '#991b1b',
          badgeText: '#ffffff',
          cornerDeco: '#fef08a',
          spinePattern: 'BAND',
        };
      case 'SLATE':
        return {
          id: `cartoon-slate-${book.id}`,
          coverTop: '#64748b',
          coverSpine: '#475569',
          coverBottom: '#334155',
          pageColor: '#f8fafc',
          pageLine: '#cbd5e1',
          ribbon: '#f97316',
          accent: '#94a3b8',
          labelBg: '#ffffff',
          labelBorder: '#334155',
          labelText: '#1e293b',
          badgeBg: '#334155',
          badgeText: '#ffffff',
          cornerDeco: '#cbd5e1',
          spinePattern: 'DOTS',
        };
      case 'VINTAGE_BURGUNDY':
      default:
        return {
          id: `cartoon-burgundy-${book.id}`,
          coverTop: '#be3944',
          coverSpine: '#9e242f',
          coverBottom: '#74151e',
          pageColor: '#faf4e4',
          pageLine: '#cfbf9f',
          ribbon: '#fbbf24',
          accent: '#fca5a5',
          labelBg: '#fff1f2',
          labelBorder: '#881337',
          labelText: '#881337',
          badgeBg: '#881337',
          badgeText: '#ffffff',
          cornerDeco: '#fbbf24',
          spinePattern: 'GOLD_EMBOSS',
        };
    }
  })();

  // 손으로 쌓아 올린 듯한 자연스러운 미세 오프셋 및 회전
  const stackOffsets = [
    { x: -5, rot: -0.5 },
    { x: 6, rot: 0.6 },
    { x: -3, rot: -0.3 },
    { x: 4, rot: 0.4 },
    { x: 0, rot: 0.0 },
  ];
  const offset = stackOffsets[idx % stackOffsets.length];

  // 1. [요구사항 1] 금액에 따른 상대적 두께 스케일 반영 (최고 금액 = 2.0배)
  // 기본 높이 54px * thicknessScale (1.0x ~ 2.0x) -> 54px ~ 108px
  const bookHeight = Math.round(54 * thicknessScale);
  const svgHeight = Math.round(76 * thicknessScale);

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer relative w-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        height: `${bookHeight}px`,
        transform: isDragging
          ? 'scale(1.02) translateY(-2px)'
          : isSelected
          ? 'translateX(-10px) scale(1.015)'
          : `translateX(${offset.x}px) rotate(${offset.rot}deg)`,
      }}
      title={`"${book.title}" 가계부 선택 (두께: ${thicknessScale.toFixed(2)}배, 잔액: ${book.balance.toLocaleString()}원)`}
    >
      <svg
        viewBox={`0 0 760 ${svgHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`spine-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.coverTop} />
            <stop offset="35%" stopColor={theme.coverSpine} />
            <stop offset="100%" stopColor={theme.coverBottom} />
          </linearGradient>

          <linearGradient id={`pages-${theme.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ded3b8" />
            <stop offset="30%" stopColor={theme.pageColor} />
            <stop offset="90%" stopColor={theme.pageColor} />
            <stop offset="100%" stopColor="#cfc1a0" />
          </linearGradient>

          <filter id={`shadow-${theme.id}`} x="-6%" y="-10%" width="112%" height="150%">
            <feDropShadow
              dx="0"
              dy={isSelected ? 8 : 4}
              stdDeviation={isSelected ? 6 : 2.5}
              floodColor="#1e1b18"
              floodOpacity={isSelected ? 0.45 : 0.28}
            />
          </filter>
        </defs>

        {/* A. 묵직한 카툰 드롭 섀도우 */}
        <ellipse
          cx="380"
          cy={svgHeight - 10}
          rx="360"
          ry="6"
          fill="#1e170f"
          opacity={isSelected ? 0.4 : idx === total - 1 ? 0.3 : 0.12}
        />

        {/* B. 늘어지는 실크 책갈피 리본 (Bookmark Ribbon) */}
        <g filter={`url(#shadow-${theme.id})`}>
          <path
            d={
              isSelected
                ? `M 88,38 C 88,${svgHeight - 16} 98,${svgHeight - 8} 94,${svgHeight + 12} L 84,${svgHeight + 6} L 74,${svgHeight + 14} C 76,${svgHeight - 6} 74,${svgHeight - 20} 74,38 Z`
                : `M 86,40 C 86,${svgHeight - 22} 92,${svgHeight - 16} 90,${svgHeight - 2} L 82,${svgHeight - 7} L 74,${svgHeight - 1} C 76,${svgHeight - 16} 74,${svgHeight - 26} 74,40 Z`
            }
            fill={theme.ribbon}
            stroke="#1e1b18"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* 책갈피 금사 자수선 */}
          <line
            x1="81"
            y1="40"
            x2="81"
            y2={isSelected ? svgHeight + 5 : svgHeight - 6}
            stroke="#fef08a"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
        </g>

        {/* C. 실물 양장본 본체: 두꺼운 먹선 테두리 + 볼록한 책등 + 종이 단면 */}
        <g filter={`url(#shadow-${theme.id})`}>
          {/* 1) 우측 종이 단면 블록 (Page Block) */}
          <path
            d={`M 660,14 L 734,14 C 740,14 744,18 744,24 L 744,${svgHeight - 24} C 744,${svgHeight - 18} 740,${svgHeight - 14} 734,${svgHeight - 14} L 660,${svgHeight - 14} Z`}
            fill={`url(#pages-${theme.id})`}
            stroke="#1e1b18"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* 종이 단면의 섬세한 책장 결 선 (Paper Page Grooves) */}
          {Array.from({ length: Math.max(5, Math.round(5 * thicknessScale)) }).map((_, lineIdx, arr) => {
            const lineY = Math.round(22 + (lineIdx / Math.max(1, arr.length - 1)) * (svgHeight - 44));
            return (
              <line
                key={`page-line-${lineIdx}`}
                x1="664"
                y1={lineY}
                x2="736"
                y2={lineY}
                stroke={theme.pageLine}
                strokeWidth="1.2"
              />
            );
          })}

          {/* 2) 둥근 책등 메인 실루엣 (Spine Main Block) */}
          <path
            d={`M 28,12 C 16,12 12,${Math.round(svgHeight * 0.3)} 12,${Math.round(svgHeight / 2)} C 12,${Math.round(svgHeight * 0.7)} 16,${svgHeight - 12} 28,${svgHeight - 12} L 672,${svgHeight - 12} C 676,${svgHeight - 12} 680,${svgHeight - 16} 680,${svgHeight - 20} L 680,20 C 680,16 676,12 672,12 Z`}
            fill={`url(#spine-${theme.id})`}
            stroke="#1e1b18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />

          {/* 3) 상단 양장본 덮개 테두리 림 (Upper Hardcover Rim Highlight) */}
          <path
            d={`M 26,12 L 672,12 C 675,12 678,14 678,16 L 678,18 C 678,16 674,14 671,14 L 27,14 C 18,14 15,22 14,34 C 14,24 18,12 26,12 Z`}
            fill="rgba(255, 255, 255, 0.42)"
          />

          {/* 4) 하단 양장본 덮개 그림자 림 (Lower Hardcover Rim Shadow) */}
          <path
            d={`M 27,${svgHeight - 14} L 672,${svgHeight - 14} C 675,${svgHeight - 14} 678,${svgHeight - 13} 678,${svgHeight - 12} L 28,${svgHeight - 12} C 17,${svgHeight - 12} 14,${svgHeight - 22} 14,${svgHeight - 34} C 14,${svgHeight - 22} 17,${svgHeight - 14} 27,${svgHeight - 14} Z`}
            fill="rgba(0, 0, 0, 0.4)"
          />

          {/* 5) 책등 왼쪽 끝 장식 헤드밴드 캡 (Headband Cloth Cap) */}
          <path
            d={`M 24,14 C 18,16 16,24 16,${Math.round(svgHeight / 2)} C 16,${svgHeight - 24} 18,${svgHeight - 16} 24,${svgHeight - 14} L 32,${svgHeight - 14} C 28,${svgHeight - 18} 26,${svgHeight - 26} 26,${Math.round(svgHeight / 2)} C 26,26 28,18 32,14 Z`}
            fill={theme.cornerDeco}
            stroke="#1e1b18"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 6) 볼록한 척추 입체 리브 밴드 4줄 (Raised Spine Bands) */}
          {[70, 210, 520, 640].map((rx, rIdx) => (
            <g key={`rib-${rIdx}`}>
              <rect
                x={rx}
                y="12"
                width="14"
                height={svgHeight - 24}
                rx="3"
                fill="rgba(0, 0, 0, 0.25)"
                stroke="#1e1b18"
                strokeWidth="2.2"
              />
              <line
                x1={rx + 7}
                y1="14"
                x2={rx + 7}
                y2={svgHeight - 14}
                stroke={theme.cornerDeco}
                strokeWidth="2.5"
              />
            </g>
          ))}

          {/* 8) 책등 우측 실링 엠블럼 (우측 원형 금박 실링 왁스/인장) */}
          <g transform={`translate(560, ${Math.round((svgHeight - 30) / 2)})`}>
            <circle cx="15" cy="15" r="14" fill={theme.badgeBg} stroke="#1e1b18" strokeWidth="2.4" />
            <circle cx="15" cy="15" r="11" fill="none" stroke={theme.cornerDeco} strokeWidth="1" strokeDasharray="2 2" />
            <text x="15" y="19" textAnchor="middle" fill={theme.badgeText} fontSize="9" fontWeight="900" fontFamily="sans-serif">
              {book.type === 'PERSONAL' ? '개인' : book.type === 'GROUP' ? '장기' : '단기'}
            </text>
          </g>
        </g>

        {/* E. 활성화 인디케이터 (책이 당겨져 있을 때 왼쪽 북마크 깃발) */}
        {isSelected && (
          <g transform={`translate(0, ${Math.round((svgHeight - 28) / 2)})`}>
            <rect x="-8" y="0" width="18" height="28" rx="4" fill="#ef4444" stroke="#1e1b18" strokeWidth="2.2" />
            <polygon points="1,9 7,14 1,19" fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* 7) 레퍼런스 스타일: 책등 중앙 양피지 타이틀 카르투슈 (표준 HTML absolute 오버레이로 SVG 변형 행렬에 왜곡되지 않고 글자 폰트 종횡비 100% 원형 유지) */}
      <div className="absolute inset-y-0 left-[14%] right-[22%] sm:left-[15%] sm:right-[24%] flex items-center pointer-events-none z-10">
        <div
          className="w-full flex items-center gap-1.5 px-2.5 py-1 rounded-md border-[2.2px] border-[#1e1b18] shadow-xs select-none min-w-0"
          style={{
            backgroundColor: theme.labelBg,
            maxHeight: `${Math.min(bookHeight - 12, 38)}px`,
            outline: `1px dashed ${theme.labelBorder}`,
            outlineOffset: '-3px',
          }}
        >
          {/* 유형 뱃지 (개인 / 장기 / 단기) */}
          <span
            className={`text-[9.5px] sm:text-[10px] font-black font-sans px-1.5 py-0.5 rounded border border-[#1e1b18] text-white shrink-0 shadow-2xs leading-none select-none ${
              book.type === 'PERSONAL'
                ? 'bg-indigo-600'
                : book.type === 'GROUP'
                ? 'bg-emerald-600'
                : 'bg-amber-600'
            }`}
          >
            {book.type === 'PERSONAL' ? '개인' : book.type === 'GROUP' ? '장기' : '단기'}
          </span>

          {/* 타이틀: 말줄임표 처리, 화면 너비에 상관없이 폰트 100% 원형 비율 유지 */}
          <span
            className="font-black text-[12px] sm:text-[13px] tracking-tight truncate drop-shadow-xs block min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis select-none"
            style={{ color: theme.labelText }}
            title={`장부명: ${book.title}`}
          >
            {book.title}
          </span>
        </div>
      </div>

      {/* 열람중 & 책갈피 배지 */}
      {isSelected && (
        <div className="absolute right-[3%] sm:right-[4%] inset-y-0 flex items-center pointer-events-none z-20">
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 border-2 border-stone-900 text-[8.5px] sm:text-[9.5px] font-black shadow-xs select-none animate-pulse">
            <Bookmark className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-stone-900 stroke-[2.5]" />
            <span className="hidden xs:inline">열람중</span>
          </span>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 2026년 10월 6대 카드사 실제 청구 데이터셋 (SSOT 기준 원장)
// - 우리, 국민, 농협, 현대, 삼성, BC바로카드
// - 총 청구: 6,029,542원 / 11월 소멸 예정 할부: -604,083원 / 리볼빙: 690,942원
// ============================================================================
export const OCTOBER_CARD_STATEMENTS: CardStatementSummary[] = [
  {
    cardCode: 'WOORI',
    cardName: '우리카드',
    cardAlias: '(V280) 다둥이행복카드',
    logoColor: 'from-blue-600 to-indigo-700',
    paymentDate: '2026.10.20',
    account: '우리은행 100*******157',
    totalBilled: 3665304,
    lumpSum: 3307888,
    installment: 357416,
    fees: 0,
    benefitDiscount: 26100,
    notableItems: [
      '탑(Top)명문보습학원 580,000원 + 480,000원 (106만 원 집중)',
      '4대사회보험 302,671원 (15.2만 + 15.0만)',
      '신한라이프/KB손보/AIA 등 보험료 300,825원',
      '도깨비 식자재 마트 8건 (약 12만 원 장보기)',
      '건강보험_엘카드 204,083원 (3/3회차 최종 완납!)',
      '대원체육관 153,333원 (3/2회차, 잔여 1회)',
    ],
    installmentAlert: '🎉 건강보험(20.4만 원) 3/3회차 완납으로 11월 청구 소멸!',
  },
  {
    cardCode: 'KB',
    cardName: 'KB국민카드',
    cardAlias: 'T-Premium KB국민 / 쿠팡 와우',
    logoColor: 'from-amber-500 to-yellow-600',
    paymentDate: '2026.10.23',
    account: '국민은행 435001-***-422',
    totalBilled: 701208,
    lumpSum: 0,
    installment: 10266,
    revolving: 690942,
    fees: 0,
    benefitDiscount: 299,
    notableItems: [
      '일부결제금액이월약정(리볼빙) 약정비율 100% (당월 전액 청구 690,942원)',
      'KB아파트관리비 355,140원 (공과금 정기결제)',
      '예스코 도시가스 34,620원 (자동납부)',
      '쿠팡(쿠페이) 8건 합산 약 301,182원',
      '쿠팡 할부 10,266원 (3/2회차, 잔여 1회)',
    ],
    installmentAlert: '⚠️ 리볼빙 수수료율 연 14.1% 활성 상태 - 100% 완납 유지 필수',
  },
  {
    cardCode: 'NH',
    cardName: 'NH농협카드',
    cardAlias: '조경국(W457)라이트 카드',
    logoColor: 'from-emerald-600 to-green-700',
    paymentDate: '2026.10.23',
    account: '우리은행 100********57',
    totalBilled: 562660,
    lumpSum: 472730,
    installment: 88890,
    fees: 1040,
    benefitDiscount: 1797,
    notableItems: [
      'SKT 통신요금 자동이체 114,340원',
      '메리츠화재해상보험 9건 합산 249,860원',
      '에스케이텔레콤 24개월 중 14회차 19,500원 (수수료 1,040원, 잔여 10회)',
      '네이버페이 6개월 중 5회차 68,350원 (잔여 1회)',
      'LG U+ 통신 1,110원',
    ],
    installmentAlert: '네이버페이(6.8만 원) 다음 달 6/6회차 완납 예정',
  },
  {
    cardCode: 'HYUNDAI',
    cardName: '현대카드',
    cardAlias: '본인 네이버 현대카드',
    logoColor: 'from-slate-800 to-zinc-950',
    paymentDate: '2026.10.20',
    account: '우리은행 계좌',
    totalBilled: 560450,
    lumpSum: 150450,
    installment: 400000,
    fees: 10000,
    benefitDiscount: 0,
    notableItems: [
      '밝은미소이치과의원 400,000원 (총 120만 원 중 3/3회차 최종 완납!)',
      '연회비 청구 10,000원 (네이버 현대카드 본인)',
      '콩팥전문 외식 57,000원',
      '토스페이먼츠(비바리퍼블리카) 2건 56,600원',
      '네이버플러스 멤버십 4,900원, GS25 3,000원',
    ],
    installmentAlert: '🎉 치과 3/3회차 완납! 11월부터 무려 40만 원 청구 소멸!',
  },
  {
    cardCode: 'SAMSUNG',
    cardName: '삼성카드',
    cardAlias: '국민행복 삼성카드 V2',
    logoColor: 'from-blue-700 to-sky-800',
    paymentDate: '2026.10.19',
    account: '우리은행 1002-2**',
    totalBilled: 499100,
    lumpSum: 0,
    installment: 499100,
    fees: 0,
    benefitDiscount: 20448,
    notableItems: [
      '전액 무이자 할부 3건으로 구성 (일시불 0원)',
      'DB손해보험 90,700원 (5개월 중 2회차, 잔여 3회)',
      '(주)딴지그룹 345,500원 (3개월 중 2회차, 잔여 1회)',
      '(주)딴지그룹 62,900원 (3개월 중 1회차, 잔여 2회)',
    ],
    installmentAlert: '딴지그룹(34.5만 원) 11월 3/3회차 완납 예정',
  },
  {
    cardCode: 'BC',
    cardName: 'BC 바로카드',
    cardAlias: 'BC 바로 K-패스 (후불교통)',
    logoColor: 'from-rose-600 to-red-700',
    paymentDate: '2026.10월 정산',
    account: '후불교통 자동결제',
    totalBilled: 40820,
    lumpSum: 63000,
    installment: 0,
    fees: 0,
    benefitDiscount: 22180,
    notableItems: [
      '9월 매일 대중교통 후불 이용액 63,000원 (1,550원 + 환승 200원)',
      'K-패스 정부/지자체 환급금 -22,180원 자동 차감 상계',
      '최종 실교통비 청구 40,820원',
    ],
    installmentAlert: '대중교통 혜택 환급금 22,180원 차감 적용 완료',
  },
];

/**
 * [태스크 0011-01 / 이벤트 전파 차단] 브라우저 기본 스크롤 전파 차단 및 수평 휠 변환 훅
 * 브라우저의 기본 Passive Event Listener 메커니즘을 해결하기 위해 DOM 레벨에서 직접
 * { passive: false } 로 리스너를 바인딩하여 e.preventDefault()와 e.stopPropagation()을
 * 100% 무조건 보장하고, 윈도우/배경이 덜컹거리며 수직 스크롤되는 현상을 원천 방어합니다.
 */
function useNonPassiveHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // 휠 이벤트가 수직(deltaY) 또는 수평(deltaX)으로 발생했을 때
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta !== 0) {
        // 배경(Window / Document / Main Container)으로의 스크롤 전파 및 브라우저 기본 수직 스크롤 100% 차단
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft += delta;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return ref;
}

export const SCR_LED_01_그룹가계부관리상세: React.FC<SCR_LED_01_Props> = ({ onBack }) => {
  // [슬라이드드래그휠 전파 차단 3대 Ref]
  const bookshelfFilterBarRef = useNonPassiveHorizontalScroll<HTMLDivElement>(); // CSS Selector 1
  const mainAxisSwitchBarRef = useNonPassiveHorizontalScroll<HTMLDivElement>();  // CSS Selector 2
  const secondaryToolsBarRef = useNonPassiveHorizontalScroll<HTMLDivElement>();  // CSS Selector 3

  // --------------------------------------------------------------------------
  // 1. 가로 형태의 쌓여있는 가계부 책꽂이 데이터셋 (각 책마다 고유 디자인 적용)
  // --------------------------------------------------------------------------
  const [ledgers, setLedgers] = useState<LedgerBook[]>([
    {
      id: 'led-group-01',
      title: '우리 4인 가족 행복 가계부',
      type: 'GROUP',
      periodType: 'LONG_TERM',
      subType: 'STANDARD',
      closingStatus: 'OPEN',
      description: '정식 회원 전용 · 공동 생활비 및 공과금 분담',
      balance: 4850000,
      currency: 'KRW',
      designStyle: 'LEATHER', // 딥 에메랄드 프리미엄 가죽 바인더 룩
      colorTheme: {
        bg: 'from-emerald-900/10 via-emerald-800/5 to-transparent',
        border: 'border-emerald-600/40',
        spineGrad: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-emerald-100',
        labelBg: 'bg-emerald-950/80 border border-emerald-500/40',
        labelText: 'text-emerald-300',
        bookmarkColor: 'bg-emerald-500 text-white',
        accent: 'text-emerald-600 dark:text-emerald-400',
      },
      membersCount: 4,
      createdAt: '2026-01-10',
      settlementCycle: '매월 말일 결산',
    },
    {
      id: 'led-personal-01',
      title: '구본영 개인 자산·투자 가계부',
      type: 'PERSONAL',
      periodType: 'LONG_TERM',
      subType: 'STANDARD',
      closingStatus: 'OPEN',
      description: '단독 소유 · 개인 취미, 자기계발 및 비상금 운용',
      balance: 1820000,
      currency: 'KRW',
      designStyle: 'HARDCOVER', // 미드나잇 블루 모던 하드커버 룩
      colorTheme: {
        bg: 'from-indigo-900/10 via-indigo-800/5 to-transparent',
        border: 'border-indigo-600/40',
        spineGrad: 'bg-gradient-to-r from-indigo-800 via-blue-900 to-indigo-950 text-indigo-100',
        labelBg: 'bg-indigo-950/80 border border-indigo-500/40',
        labelText: 'text-indigo-300',
        bookmarkColor: 'bg-indigo-500 text-white',
        accent: 'text-indigo-600 dark:text-indigo-400',
      },
      membersCount: 1,
      createdAt: '2025-11-01',
      settlementCycle: '매월 25일 급여일',
    },
    {
      id: 'led-pocket-01',
      title: '자녀 민우의 첫 용돈기입장',
      type: 'PERSONAL',
      periodType: 'LONG_TERM',
      subType: 'POCKET_MONEY',
      closingStatus: 'OPEN',
      budgetCap: 150000,
      spentAmount: 82000,
      resetCycle: 'MONTHLY',
      description: '자녀 용돈 지출 통제 · 월 15만 원 한도 및 일자별 소비 기록',
      balance: 68000,
      currency: 'KRW',
      designStyle: 'KRAFT', // 따뜻한 크라프트지 바인더
      colorTheme: {
        bg: 'from-amber-900/10 via-amber-800/5 to-transparent',
        border: 'border-amber-500/40',
        spineGrad: 'bg-gradient-to-r from-amber-600 via-yellow-700 to-amber-900 text-yellow-100',
        labelBg: 'bg-yellow-950/80 border border-yellow-500/40',
        labelText: 'text-yellow-300',
        bookmarkColor: 'bg-yellow-500 text-stone-900',
        accent: 'text-yellow-600 dark:text-yellow-400',
      },
      membersCount: 2,
      createdAt: '2026-03-01',
      settlementCycle: '매월 1일 용돈 리셋',
    },
    {
      id: 'led-instance-01',
      title: '2026 동창회 강릉 펜션 모임',
      type: 'INSTANCE',
      periodType: 'SHORT_TERM',
      subType: 'STANDARD',
      closingStatus: 'CLOSED',
      allowReopen: true,
      closedAt: '2026-10-05',
      description: '단기 모임 인스턴스 · 미가입 게스트 허용 & 정산 마감 보관',
      balance: 420000,
      currency: 'KRW',
      designStyle: 'KRAFT', // 따뜻한 크라프트지 & 빈티지 바인더 룩
      colorTheme: {
        bg: 'from-amber-900/10 via-amber-800/5 to-transparent',
        border: 'border-amber-600/40',
        spineGrad: 'bg-gradient-to-r from-amber-800 via-orange-900 to-amber-950 text-amber-100',
        labelBg: 'bg-amber-950/80 border border-amber-500/40',
        labelText: 'text-amber-300',
        bookmarkColor: 'bg-amber-500 text-white',
        accent: 'text-amber-600 dark:text-amber-400',
      },
      membersCount: 6,
      createdAt: '2026-10-01',
      settlementCycle: '정산 마감 완료 (영수증 보관)',
    },
    {
      id: 'led-fabric-01',
      title: '주말 러닝 크루 회비 장부',
      type: 'INSTANCE',
      periodType: 'LONG_TERM',
      subType: 'STANDARD',
      closingStatus: 'OPEN',
      description: '정기 러닝 번개 모임 · 음료비 및 마라톤 참가비 정산',
      balance: 185000,
      currency: 'KRW',
      designStyle: 'FABRIC', // 포근한 바이올렛 린넨 패브릭 바인더 룩
      colorTheme: {
        bg: 'from-purple-900/10 via-fuchsia-800/5 to-transparent',
        border: 'border-purple-600/40',
        spineGrad: 'bg-gradient-to-r from-purple-800 via-fuchsia-900 to-purple-950 text-purple-100',
        labelBg: 'bg-purple-950/80 border border-purple-500/40',
        labelText: 'text-purple-300',
        bookmarkColor: 'bg-purple-500 text-white',
        accent: 'text-purple-600 dark:text-purple-400',
      },
      membersCount: 5,
      createdAt: '2026-09-15',
      settlementCycle: '매월 15일 회비 결산',
    },
    {
      id: 'led-slate-01',
      title: '비상금 & 재테크 투자 일지',
      type: 'PERSONAL',
      periodType: 'LONG_TERM',
      subType: 'STANDARD',
      closingStatus: 'OPEN',
      description: '단독 운용 · 비상금 통장 및 배당 재투자 내역 분리 관리',
      balance: 12500000,
      currency: 'KRW',
      designStyle: 'SLATE', // 매트 슬레이트 & 실버 리벳 미니멀 바인더 룩
      colorTheme: {
        bg: 'from-slate-900/15 via-zinc-800/5 to-transparent',
        border: 'border-slate-500/40',
        spineGrad: 'bg-gradient-to-r from-slate-700 via-zinc-800 to-slate-950 text-slate-100',
        labelBg: 'bg-slate-950/80 border border-slate-500/40',
        labelText: 'text-slate-300',
        bookmarkColor: 'bg-slate-500 text-white',
        accent: 'text-slate-600 dark:text-slate-400',
      },
      membersCount: 1,
      createdAt: '2025-08-01',
      settlementCycle: '분기별 투자 결산',
    },
    {
      id: 'led-vintage-01',
      title: '2026 유럽 가족 배낭여행 경비록',
      type: 'INSTANCE',
      periodType: 'SHORT_TERM',
      subType: 'STANDARD',
      closingStatus: 'SETTLED',
      allowReopen: false,
      closedAt: '2026-08-10',
      description: '클래식 빈티지 양장본 · 여행 경비 외화 환전 및 정산 마감 완료',
      balance: 3420000,
      currency: 'KRW',
      designStyle: 'VINTAGE_BURGUNDY', // 클래식 버건디 골드 엠보싱 빈티지 양장본
      colorTheme: {
        bg: 'from-rose-950/20 via-amber-950/10 to-transparent',
        border: 'border-amber-700/50',
        spineGrad: 'bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 text-amber-200',
        labelBg: 'bg-amber-100/95 dark:bg-amber-950/90 border border-amber-600/60 shadow-xs',
        labelText: 'text-amber-950 dark:text-amber-200',
        bookmarkColor: 'bg-amber-500 text-amber-950',
        accent: 'text-amber-600 dark:text-amber-400',
      },
      membersCount: 4,
      createdAt: '2026-07-20',
      settlementCycle: '최종 결산 완료',
    },
  ]);

  const [activeLedgerId, setActiveLedgerId] = useState<string>('led-group-01');
  const currentLedger = useMemo(
    () => ledgers.find((l) => l.id === activeLedgerId) || ledgers[0],
    [ledgers, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 1-1. 전체 장부 기준 최대 금액 및 두께 비율 계산 (전체 장부 기준 상대적 두께)
  // --------------------------------------------------------------------------
  const overallMaxBalance = useMemo(() => {
    if (ledgers.length === 0) return 1;
    return Math.max(...ledgers.map((l) => Math.abs(l.balance)), 1);
  }, [ledgers]);

  // 상대 금액에 따른 두께 스케일: 최대 금액 장부는 정확히 2.0배(2배 두께), 최소/0원은 1.0배
  const getThicknessScale = (balance: number, maxBal: number) => {
    if (maxBal <= 0) return 1.0;
    const ratio = Math.max(0, Math.min(1, Math.abs(balance) / maxBal));
    return 1.0 + ratio * 1.0;
  };

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 1-2. 상단 뱃지 선택에 따른 장부 유형 필터 상태 (전체/개인/장기/단기 다중 필터)
  // --------------------------------------------------------------------------
  const [selectedTypes, setSelectedTypes] = useState<Record<LedgerType, boolean>>({
    PERSONAL: true,
    GROUP: true,
    INSTANCE: true,
  });

  const isAllSelected = selectedTypes.PERSONAL && selectedTypes.GROUP && selectedTypes.INSTANCE;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedTypes({
        PERSONAL: false,
        GROUP: false,
        INSTANCE: false,
      });
    } else {
      setSelectedTypes({
        PERSONAL: true,
        GROUP: true,
        INSTANCE: true,
      });
    }
  };

  const handleToggleType = (type: LedgerType) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const countByType = useMemo(
    () => ({
      ALL: ledgers.length,
      GROUP: ledgers.filter((l) => l.type === 'GROUP').length,
      PERSONAL: ledgers.filter((l) => l.type === 'PERSONAL').length,
      INSTANCE: ledgers.filter((l) => l.type === 'INSTANCE').length,
    }),
    [ledgers]
  );

  // 활성 뱃지에 해당하는 장부만 노출 (비활성은 숨김)
  const visibleLedgers = useMemo(() => {
    return ledgers.filter((l) => selectedTypes[l.type]);
  }, [ledgers, selectedTypes]);

  // --------------------------------------------------------------------------
  // 1-3. 책장 열기/닫기 토글 상태 (닫으면 현재 선택된 장부 1권만 표시)
  // --------------------------------------------------------------------------
  const [isBookshelfOpen, setIsBookshelfOpen] = useState<boolean>(true);

  // 실제로 책장에 표시할 장부 목록 (책장이 닫히면 선택된 장부만 표시)
  const displayedLedgers = useMemo(() => {
    if (isBookshelfOpen) {
      return visibleLedgers;
    }
    const currentBook = visibleLedgers.find((b) => b.id === activeLedgerId) || currentLedger;
    return [currentBook];
  }, [isBookshelfOpen, visibleLedgers, activeLedgerId, currentLedger]);

  // --------------------------------------------------------------------------
  // 2. 책꽂이 스택 스크롤 및 왼쪽 독립 핸들 기반 드래그 앤 드롭 순서 변경 (2.2, 2.3)
  // --------------------------------------------------------------------------
  const bookStackRef = useRef<HTMLDivElement>(null);

  // 드래그 앤 드롭 상태 (마우스 & 터치 공통)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 모바일 터치 드래그 추적용 Ref
  const touchDragRef = useRef<{
    startIndex: number;
    currentIndex: number;
  } | null>(null);

  // 순서 재배치 코어 함수 (필터링 중에도 안전하게 전체 장부 내 순서 매핑)
  const handleReorderBooks = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= visibleLedgers.length || toIdx >= visibleLedgers.length) return;
    const sourceBook = visibleLedgers[fromIdx];
    const targetBook = visibleLedgers[toIdx];
    if (!sourceBook || !targetBook) return;

    setLedgers((prev) => {
      const updated = [...prev];
      const realFrom = updated.findIndex((b) => b.id === sourceBook.id);
      const realTo = updated.findIndex((b) => b.id === targetBook.id);
      if (realFrom === -1 || realTo === -1) return prev;
      const [moved] = updated.splice(realFrom, 1);
      updated.splice(realTo, 0, moved);
      return updated;
    });
    setNoticeMessage(`✓ 장부 순서가 변경되었습니다. ("${sourceBook.title}")`);
  };

  // 데스크톱 HTML5 Drag & Drop
  const handleDragStart = (idx: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setDraggedIndex(idx);
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    const sourceIdx = draggedIndex !== null ? draggedIndex : Number(e.dataTransfer.getData('text/plain'));
    if (!isNaN(sourceIdx) && sourceIdx !== idx) {
      handleReorderBooks(sourceIdx, idx);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 모바일/태블릿 터치 드래그 지원
  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchDragRef.current = { startIndex: idx, currentIndex: idx };
    setDraggedIndex(idx);
    setDragOverIndex(idx);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const bookEl = elem?.closest('[data-book-index]');
    if (bookEl) {
      const targetIdx = Number(bookEl.getAttribute('data-book-index'));
      if (!isNaN(targetIdx) && targetIdx !== touchDragRef.current.currentIndex) {
        touchDragRef.current.currentIndex = targetIdx;
        setDragOverIndex(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchDragRef.current) {
      const { startIndex, currentIndex } = touchDragRef.current;
      if (startIndex !== currentIndex && startIndex >= 0 && currentIndex >= 0) {
        handleReorderBooks(startIndex, currentIndex);
      }
      touchDragRef.current = null;
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleScrollBooks = (dir: 'UP' | 'DOWN') => {
    if (!bookStackRef.current) return;
    const offset = dir === 'UP' ? -90 : 90;
    bookStackRef.current.scrollBy({ top: offset, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // 3. 현재 로그인 사용자 역할 시뮬레이터 (선택된 가계부 종속)
  // --------------------------------------------------------------------------
  const [currentUserRole, setCurrentUserRole] = useState<LedgerRole>('OWNER');

  // --------------------------------------------------------------------------
  // 4. 구성원 데이터 (선택된 가계부 종속)
  // --------------------------------------------------------------------------
  const [membersMap, setMembersMap] = useState<Record<string, LedgerMember[]>>({
    'led-group-01': [
      { id: 'm1', name: '구본영(호스트/나)', role: 'OWNER', isGuest: false, joinedAt: '2026-01-10', avatar: '👨‍💼' },
      { id: 'm2', name: '김은지(배우자)', role: 'ADMIN', isGuest: false, joinedAt: '2026-01-10', avatar: '👩‍💼' },
      { id: 'm3', name: '구민우(자녀)', role: 'MEMBER', isGuest: false, joinedAt: '2026-01-15', avatar: '👦' },
      { id: 'm4', name: '시어머니(어르신)', role: 'VIEWER', isGuest: false, joinedAt: '2026-02-01', avatar: '👵' },
    ],
    'led-personal-01': [
      { id: 'm1', name: '구본영(단독소유)', role: 'OWNER', isGuest: false, joinedAt: '2025-11-01', avatar: '👨‍💼' },
    ],
    'led-instance-01': [
      { id: 'm1', name: '구본영(모임총무)', role: 'OWNER', isGuest: false, joinedAt: '2026-10-01', avatar: '👨‍💼' },
      { id: 'm5', name: '박준혁(회원)', role: 'MEMBER', isGuest: false, joinedAt: '2026-10-01', avatar: '🧑' },
      { id: 'g1', name: '게스트 정현우', role: 'GUEST', isGuest: true, guestId: 'gst_9841', joinedAt: '2026-10-02', avatar: '🐱' },
      { id: 'g2', name: '게스트 이수민', role: 'GUEST', isGuest: true, guestId: 'gst_9842', joinedAt: '2026-10-02', avatar: '🐶' },
      { id: 'g3', name: '게스트 최영진', role: 'GUEST', isGuest: true, guestId: 'gst_9843', joinedAt: '2026-10-03', avatar: '🦊' },
      { id: 'g4', name: '게스트 강민석', role: 'VIEWER', isGuest: true, guestId: 'gst_9844', joinedAt: '2026-10-03', avatar: '🐼' },
    ],
    'led-fabric-01': [
      { id: 'm1', name: '구본영(크루장/나)', role: 'OWNER', isGuest: false, joinedAt: '2026-09-15', avatar: '🏃‍♂️' },
      { id: 'm6', name: '이진호(페이서)', role: 'ADMIN', isGuest: false, joinedAt: '2026-09-15', avatar: '🏃‍♀️' },
      { id: 'm7', name: '김나래(회원)', role: 'MEMBER', isGuest: false, joinedAt: '2026-09-20', avatar: '🧘' },
      { id: 'g5', name: '게스트 최도현', role: 'GUEST', isGuest: true, guestId: 'gst_3811', joinedAt: '2026-10-01', avatar: '🚴' },
      { id: 'g6', name: '게스트 신예원', role: 'VIEWER', isGuest: true, guestId: 'gst_3812', joinedAt: '2026-10-02', avatar: '🏊' },
    ],
    'led-slate-01': [
      { id: 'm1', name: '구본영(단독소유)', role: 'OWNER', isGuest: false, joinedAt: '2025-08-01', avatar: '👨‍💼' },
    ],
    'led-pocket-01': [
      { id: 'm1', name: '구본영(보호자/나)', role: 'OWNER', isGuest: false, joinedAt: '2026-03-01', avatar: '👨‍💼' },
      { id: 'm3', name: '구민우(자녀)', role: 'MEMBER', isGuest: false, joinedAt: '2026-03-01', avatar: '👦' },
    ],
  });

  const currentMembers = useMemo(
    () => membersMap[activeLedgerId] || [],
    [membersMap, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 5. 거래 내역 데이터 (금전 3대 원칙)
  // --------------------------------------------------------------------------
  const [transactionsMap, setTransactionsMap] = useState<Record<string, LedgerTransaction[]>>({
    'led-group-01': [
      {
        id: 'tx-g-01',
        ledgerId: 'led-group-01',
        title: '이마트 양재점 (주말 가족 장보기)',
        type: 'EXPENSE',
        amount: 148500,
        category: '식료품/마트',
        date: '2026-10-10',
        payerName: '김은지(배우자)',
        isAssetTransfer: false,
        tagNames: ['가족식비', '정기지출'],
        note: '공동 식자재 구매',
      },
      {
        id: 'tx-g-02',
        ledgerId: 'led-group-01',
        title: '구민우 자녀 계좌 용돈 이체 (자산이동)',
        type: 'TRANSFER',
        amount: 50000,
        category: '가족 내부 이동',
        date: '2026-10-08',
        payerName: '구본영(호스트)',
        isAssetTransfer: true,
        relatedTransferId: 'tx-pk-04',
        tagNames: ['자산이동', '용돈지급', '1:1페어링'],
        note: '민우 용돈기입장(Tx-PK-04)과 1:1 자기참조 맞물림 (생활비 왜곡 방지)',
      },
      {
        id: 'tx-g-03',
        ledgerId: 'led-group-01',
        title: 'KB아파트관리비 및 예스코 도시가스 (정기공과금)',
        type: 'EXPENSE',
        amount: 389760,
        category: '주거/통신',
        date: '2026-09-22',
        payerName: 'KB국민카드',
        isAssetTransfer: false,
        tagNames: ['고정지출', '공과금', '명세서확정'],
        reconciliationStatus: 'CONFIRMED',
        statementCardName: 'KB국민카드',
        proofs: [
          {
            id: 'prf-g3-1',
            type: 'MANUAL',
            title: '구본영 고정비 메모 등록',
            amount: 389760,
            date: '2026-09-20 09:00',
            source: '모아보고 정기알림',
          },
          {
            id: 'prf-g3-2',
            type: 'STATEMENT_LINE',
            title: 'KB국민카드 10월 명세서 (자동납부 확정)',
            amount: 389760,
            date: '2026-09-22',
            source: 'KB국민카드 10월 이용대금명세서',
            details: ['KB아파트관리비-26년08월분 355,140원', '예스코-자동납부 34,620원', '리볼빙 약정비율 100% 당월 전액청구 확정'],
          },
        ],
      },
      {
        id: 'tx-g-06',
        ledgerId: 'led-group-01',
        title: '탑(Top)명문보습학원 (자녀 교육비 2건)',
        type: 'EXPENSE',
        amount: 1060000,
        category: '교육/학원',
        date: '2026-10-05',
        payerName: '우리카드(다둥이)',
        isAssetTransfer: false,
        tagNames: ['고정지출', '교육비', '명세서확정'],
        reconciliationStatus: 'CONFIRMED',
        statementCardName: '우리카드',
        statementDiscount: 20000,
        proofs: [
          {
            id: 'prf-g6-1',
            type: 'RECEIPT_OCR',
            title: '학원 결제 영수증 촬영',
            amount: 1080000,
            date: '2026-10-05 16:30',
            source: 'EasyOCR 스캐너',
            details: ['탑명문보습학원 중등수학 580,000원', '탑명문보습학원 중등영어 500,000원'],
          },
          {
            id: 'prf-g6-2',
            type: 'SMS_NOTIFICATION',
            title: '우리카드 승인 알림톡',
            amount: 1060000,
            date: '2026-10-05 16:31',
            source: '카카오 알림톡',
          },
          {
            id: 'prf-g6-3',
            type: 'STATEMENT_LINE',
            title: '우리카드 10월 명세서 최종 확정',
            amount: 1060000,
            date: '2026-10-12',
            source: '우리카드 10월 이용대금명세서',
            details: ['다둥이카드 학원 청구할인 -20,000원 적용', '순 결제금액 1,060,000원 확정', 'TOP 포인트 2,500P 적립'],
          },
        ],
      },
      {
        id: 'tx-g-04',
        ledgerId: 'led-group-01',
        title: '가족 외식: 강남 삼겹살 (본영 대납 건)',
        type: 'EXPENSE',
        amount: 120000,
        category: '외식/식음료',
        date: '2026-10-04',
        payerName: '구본영(호스트)',
        isAssetTransfer: false,
        tagNames: ['대납', '정산요청'],
        note: '개인 카드로 가족 식대 선결제 (모임 가계부에 대납 등록)',
        reconciliationStatus: 'PENDING',
        proofs: [
          {
            id: 'prf-g4-1',
            type: 'RECEIPT_OCR',
            title: '식당 테이블 종이 영수증',
            amount: 120000,
            date: '2026-10-04 20:15',
            source: '종이 영수증 사진 (대기중)',
            details: ['삼겹살 4인분 68,000원', '목살 2인분 34,000원', '된장찌개/공기밥 18,000원'],
          },
        ],
      },
      {
        id: 'tx-g-05',
        ledgerId: 'led-group-01',
        title: '10월 공동 생활비 이체 입금',
        type: 'INCOME',
        amount: 2500000,
        category: '생활비입금',
        date: '2026-10-01',
        payerName: '김은지 / 구본영',
        isAssetTransfer: false,
        tagNames: ['정기입금'],
      },
    ],
    'led-personal-01': [
      {
        id: 'tx-p-01',
        ledgerId: 'led-personal-01',
        title: '스타벅스 강남 R점 (개인 커피 & 베이커리)',
        type: 'EXPENSE',
        amount: 7200,
        category: '식음료/카페',
        date: '2026-10-11',
        payerName: '구본영',
        isAssetTransfer: false,
        tagNames: ['개인지출', '명세서확정'],
        reconciliationStatus: 'CONFIRMED',
        statementCardName: '우리카드 (다둥이)',
        statementDiscount: 1000,
        expenseRecordId: 'atx-exp-20261011-0091',
        crossServiceLinks: {
          dutyId: 'd-02',
          dutyTitle: '회의실 다과 준비 (당번 대납)',
          goalId: 'g-01',
          goalTitle: '비상금 500만원 모으기 (절약 지출)',
          guestId: 'gst_9128',
          guestEventName: '2026 동창회 모임 (1/N 분할 대납)',
          transferPairId: 'tx-g-02',
        },
        proofs: [
          {
            id: 'prf-p1-1',
            type: 'MANUAL',
            title: '구본영 모아보고 앱 수기 등록',
            amount: 8200,
            date: '2026-10-11 14:30',
            source: '모아보고 빠른등록',
            details: ['작성자: 구본영(나)', '사유: 오후 팀 미팅 전 개인 음료 구매', '메모: 개인컵 텀블러 지참'],
          },
          {
            id: 'prf-p1-2',
            type: 'RECEIPT_OCR',
            title: '전자 영수증 OCR 촬영 (품목 파싱)',
            amount: 8200,
            date: '2026-10-11 14:32',
            source: '스타벅스 e-영수증',
            businessNumber: '201-81-29182',
            ceoName: '이진우',
            supplyAmount: 7455,
            taxAmount: 745,
            cashReceiptNo: '010-****-9182',
            itemsList: [
              { name: '아메리카노 T', qty: 1, unitPrice: 4500, totalPrice: 4500 },
              { name: '바닐라 라떼 G', qty: 1, unitPrice: 5500, totalPrice: 5500 },
              { name: '개인컵 친환경 할인', qty: 1, unitPrice: -1800, totalPrice: -1800 },
            ],
            details: ['스타벅스 강남R점', '아메리카노 T 4,500원', '바닐라 라떼 G 5,500원', '개인컵 할인 -1,800원'],
          },
          {
            id: 'prf-p1-3',
            type: 'SMS_NOTIFICATION',
            title: '우리카드 결제 승인 문자 (SMS)',
            amount: 8200,
            date: '2026-10-11 14:32',
            source: '카드사 승인 전문',
            approvalNo: '83921028',
            cardName: '우리카드(9182)',
            details: ['우리카드 승인 8,200원', '일시불', '스타벅스강남R점'],
          },
          {
            id: 'prf-p1-4',
            type: 'STATEMENT_LINE',
            title: '10월 이용대금명세서 최종 확정 (Golden Record)',
            amount: 7200,
            date: '2026-10-12',
            source: '우리카드 10월 명세서',
            cardName: '우리카드 (다둥이행복)',
            approvalNo: '83921028',
            installmentMonths: '일시불',
            statementDiscount: 1000,
            paymentDueDate: '2026-10-23',
            paymentAccount: '우리은행 (1002-***-918231)',
            details: ['카페 청구할인 -1,000원 자동 보정', '실제 통장 출금액 7,200원 확정', '우리카드 TOP 36P 적립'],
          },
        ],
      },
      {
        id: 'tx-p-04',
        ledgerId: 'led-personal-01',
        title: '밝은미소이치과의원 치과 치료비 (3/3회차 완납)',
        type: 'EXPENSE',
        amount: 400000,
        category: '의료/건강',
        date: '2026-07-15',
        payerName: '네이버 현대카드',
        isAssetTransfer: false,
        tagNames: ['할부지출', '3/3회차완납', '11월소멸'],
        reconciliationStatus: 'CONFIRMED',
        statementCardName: '현대카드',
        proofs: [
          {
            id: 'prf-p4-1',
            type: 'MANUAL',
            title: '치과 무이자 3개월 할부 약정',
            amount: 1200000,
            date: '2026-07-15',
            source: '병원 수납처',
          },
          {
            id: 'prf-p4-2',
            type: 'STATEMENT_LINE',
            title: '현대카드 10월 명세서 (최종 3/3회차)',
            amount: 400000,
            date: '2026-10-09',
            source: '현대카드 10월 이용대금명세서',
            details: ['원금 1,200,000원 중 당월 400,000원 청구', '할부 수수료 0원 (무이자)', '🎉 이번 10월로 전액 완납되어 11월 청구 소멸!'],
          },
        ],
      },
      {
        id: 'tx-p-02',
        ledgerId: 'led-personal-01',
        title: 'CMA 비상금 계좌로 이체 (자산이동)',
        type: 'TRANSFER',
        amount: 200000,
        category: '자산 내부 이동',
        date: '2026-10-06',
        payerName: '구본영',
        isAssetTransfer: true,
        relatedTransferId: 'rel-cma-002',
        tagNames: ['자산이동', '저축'],
      },
      {
        id: 'tx-p-03',
        ledgerId: 'led-personal-01',
        title: '프로그래밍 서적 구매 (교보문고)',
        type: 'EXPENSE',
        amount: 38000,
        category: '교육/도서',
        date: '2026-10-03',
        payerName: '구본영',
        isAssetTransfer: false,
        tagNames: ['자기계발'],
      },
    ],
    'led-pocket-01': [
      {
        id: 'tx-pk-01',
        ledgerId: 'led-pocket-01',
        title: 'GS25 편의점 (포켓몬 빵 & 초코우유)',
        type: 'EXPENSE',
        amount: 4500,
        category: '간식/음료',
        date: '2026-10-12',
        payerName: '구민우',
        isAssetTransfer: false,
        tagNames: ['간식', '개인지출'],
      },
      {
        id: 'tx-pk-02',
        ledgerId: 'led-pocket-01',
        title: '알라딘 중고서점 (학습만화 구매)',
        type: 'EXPENSE',
        amount: 14500,
        category: '도서/문구',
        date: '2026-10-10',
        payerName: '구민우',
        isAssetTransfer: false,
        tagNames: ['도서'],
      },
      {
        id: 'tx-pk-03',
        ledgerId: 'led-pocket-01',
        title: '친구 생일 선물 (학용품 세트)',
        type: 'EXPENSE',
        amount: 18000,
        category: '선물/용돈',
        date: '2026-10-09',
        payerName: '구민우',
        isAssetTransfer: false,
        tagNames: ['선물'],
      },
      {
        id: 'tx-pk-04',
        ledgerId: 'led-pocket-01',
        title: '부모 가계부에서 10월 용돈 수령 (자산이동)',
        type: 'TRANSFER',
        amount: 50000,
        category: '용돈이체/자산이동',
        date: '2026-10-08',
        payerName: '구본영(부모)',
        isAssetTransfer: true,
        relatedTransferId: 'tx-g-02',
        tagNames: ['자산이동', '용돈지급', '1:1페어링'],
        note: '가족 가계부 출금(Tx-G-02)과 1:1 맞물림 연결',
      },
    ],
    'led-instance-01': [
      {
        id: 'tx-i-01',
        ledgerId: 'led-instance-01',
        title: '강릉 오션뷰 펜션 2박 예약금',
        type: 'EXPENSE',
        amount: 540000,
        category: '숙박/여행',
        date: '2026-10-02',
        payerName: '구본영(모임총무)',
        isAssetTransfer: false,
        tagNames: ['모임지출', '1/N정산대상'],
      },
      {
        id: 'tx-i-02',
        ledgerId: 'led-instance-01',
        title: '바베큐 숯불 및 장보기 (게스트 정현우 대납)',
        type: 'EXPENSE',
        amount: 350000,
        category: '식료품/장보기',
        date: '2026-10-03',
        payerName: '게스트 정현우',
        isAssetTransfer: false,
        tagNames: ['게스트대납', '정산요청'],
        note: '정식 회원가입 이전 임시 guest_id 귀속',
      },
    ],
  });

  const currentTransactions = useMemo(
    () => transactionsMap[activeLedgerId] || [],
    [transactionsMap, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 6. 검색 및 필터 상태
  // --------------------------------------------------------------------------
  const [searchWord, setSearchWord] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [excludeAssetTransfer, setExcludeAssetTransfer] = useState(false);
  // [요구사항 3] 가로너비 초과로 뭉개짐 방지: 카드형 그리드 보기 / 리스트 보기 뷰 모드
  const [txViewMode, setTxViewMode] = useState<'CARD' | 'LIST'>('CARD');
  // 특화 관리 서브시트 상태 (카드명세서 / 고정수입)
  const [activeSpecialSheet, setActiveSpecialSheet] = useState<'NONE' | 'STATEMENT' | 'FIXED_INCOME'>('NONE');

  const filteredTransactions = useMemo(() => {
    return currentTransactions.filter((tx) => {
      // 1. 거래 유형 필터 (지출 / 수입 / 자산이동)
      if (txTypeFilter === 'EXPENSE' && (tx.type !== 'EXPENSE' || tx.isAssetTransfer)) return false;
      if (txTypeFilter === 'INCOME' && (tx.type !== 'INCOME' || tx.isAssetTransfer)) return false;
      if (txTypeFilter === 'TRANSFER' && !tx.isAssetTransfer) return false;

      // 2. 자산이동 분리 표시 옵션 (체크 시 전체 보기에서 자산이동 제외)
      if (excludeAssetTransfer && tx.isAssetTransfer && txTypeFilter === 'ALL') {
        return false;
      }

      // 3. 검색어 필터 (제목, 결제자, 메모, 태그)
      if (searchWord.trim()) {
        const query = searchWord.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchPayer = tx.payerName.toLowerCase().includes(query);
        const matchNote = tx.note?.toLowerCase().includes(query);
        const matchTag = tx.tagNames.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchPayer && !matchNote && !matchTag) return false;
      }

      // 4. 카테고리 필터
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [currentTransactions, txTypeFilter, excludeAssetTransfer, searchWord, categoryFilter]);

  // [요구사항 4] 장부에 등록된 장부의 거래내역에 실제로 존재하는 카테고리만 동적 추출
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    currentTransactions.forEach((tx) => {
      if (tx.category && tx.category.trim()) {
        set.add(tx.category.trim());
      }
    });
    return Array.from(set);
  }, [currentTransactions]);

  // 카테고리 필터가 현재 장부에 없는 카테고리일 경우 ALL로 자동 초기화
  useEffect(() => {
    if (categoryFilter !== 'ALL' && !availableCategories.includes(categoryFilter)) {
      setCategoryFilter('ALL');
    }
  }, [activeLedgerId, availableCategories, categoryFilter]);

  // 통계 집계
  const stats = useMemo(() => {
    let income = 0;
    let pureExpense = 0;
    let assetTransfer = 0;
    let reimbursement = 0;

    currentTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        income += tx.amount;
      } else if (tx.type === 'TRANSFER' || tx.isAssetTransfer) {
        assetTransfer += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        pureExpense += tx.amount;
      }

      if (tx.tagNames.includes('대납') || tx.tagNames.includes('정산요청') || tx.tagNames.includes('게스트대납')) {
        reimbursement += tx.amount;
      }
    });

    return { income, pureExpense, assetTransfer, reimbursement };
  }, [currentTransactions]);

  // 2대 대메뉴 대축: 1. 장부작성(수입·지출) / 2. 분석(현황·보고서)
  const [mainAxisTab, setMainAxisTab] = useState<MainAxisTab>('WRITE');
  const [writeSubTab, setWriteSubTab] = useState<WriteSubTab>('EXPENSE');
  const [expenseSubTab, setExpenseSubTab] = useState<ExpenseSubTab>('GENERAL');
  const [incomeSubTab, setIncomeSubTab] = useState<IncomeSubTab>('LIST');
  const [analysisSubTab, setAnalysisSubTab] = useState<AnalysisSubTab>('STATUS');

  // 호환용 레거시 덱 탭 (기존 핸들러 및 모달 동기화)
  const activeDeckTab = mainAxisTab === 'ANALYSIS' ? 'ANALYTICS' : writeSubTab;
  const setActiveDeckTab = (tab: DeckTab) => {
    if (tab === 'ANALYTICS') {
      setMainAxisTab('ANALYSIS');
    } else {
      setMainAxisTab('WRITE');
      setWriteSubTab(tab);
    }
  };

  // 3.2.2 분석 보고서 이력 및 재수집 상태
  const [isRecollecting, setIsRecollecting] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<AnalysisReportSnapshot | null>(null);
  const [reportViewMode, setReportViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [analysisReports, setAnalysisReports] = useState<AnalysisReportSnapshot[]>([
    {
      id: 'rep-202610-02',
      version: 'v2.1 (정기결산)',
      title: '2026년 10월 2차 정기 결산 보고서',
      period: '2026.10.01 ~ 2026.10.13',
      createdAt: '2026-10-13 18:30',
      totalIncome: 2577000,
      totalExpense: 1444690,
      netSavings: 1132310,
      cardBilledTotal: 6029542,
      txCount: 16,
      summaryNotes: [
        '월 중순 지출 안정화: 순수 생활비 144.4만 원 집계 완료 (자산이동 45만 원 분리)',
        '신한/현대/우리 6대 카드사 실제 청구 602.9만 원 SSOT 대사 정합성 100% 확보',
        '11월 건강보험/치과 할부 완납 도래 세이빙 경보(-60.4만 원 절감 예정)',
      ],
      status: 'VERIFIED',
    },
    {
      id: 'rep-202610-01',
      version: 'v1.0 (중간분석)',
      title: '2026년 10월 1차 중간 분석 보고서',
      period: '2026.10.01 ~ 2026.10.07',
      createdAt: '2026-10-07 21:00',
      totalIncome: 2500000,
      totalExpense: 1251000,
      netSavings: 1249000,
      cardBilledTotal: 5890000,
      txCount: 9,
      summaryNotes: [
        '급여 입금 후 강릉 여행 숙소 및 바베큐 초기 지출 집중',
        'TRANSFER 비상금 20만 원 분리로 생활비 왜곡 방지 준수',
      ],
      status: 'VERIFIED',
    },
    {
      id: 'rep-202609-final',
      version: 'v1.0 (월말마감)',
      title: '2026년 9월 최종 결산 보고서',
      period: '2026.09.01 ~ 2026.09.30',
      createdAt: '2026-09-30 23:59',
      totalIncome: 3950000,
      totalExpense: 2840000,
      netSavings: 1110000,
      cardBilledTotal: 5120000,
      txCount: 42,
      summaryNotes: [
        '9월 목표 예산 300만 원 대비 16만 원 세이빙 달성',
        '모임 가계부 1/N 정산 100% 회수 완료 및 무결성 보증',
      ],
      status: 'VERIFIED',
    },
  ]);

  // 분석 데이터 재수집 & 새 보고서 스냅샷 생성
  const handleRecollectAndCreateReport = () => {
    setIsRecollecting(true);
    setTimeout(() => {
      setIsRecollecting(false);
      const newSnapshot: AnalysisReportSnapshot = {
        id: `rep-snapshot-${Date.now()}`,
        version: `v${(analysisReports.length + 1) * 0.5 + 1.0} (최신재수집)`,
        title: `2026년 10월 재수집 결산 분석 보고서 (스냅샷)`,
        period: '2026.10.01 ~ 2026.10.13 (실시간)',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        totalIncome: stats.income,
        totalExpense: stats.pureExpense,
        netSavings: stats.income - stats.pureExpense,
        cardBilledTotal: 6029542,
        txCount: currentTransactions.length,
        summaryNotes: [
          `재수집 시점 총 잔액: ₩${currentLedger.balance.toLocaleString()}원`,
          `당월 순수 지출: ₩${stats.pureExpense.toLocaleString()}원 / 수입: ₩${stats.income.toLocaleString()}원`,
          '6대 카드사 실제 청구 골든 소스 SSOT 대사 정합성 100% 검증',
          '모아보고 3대 원칙(단일 귀속, TRANSFER 1:1 페어링, 태깅 분리) 전산 감사 통과',
        ],
        status: 'VERIFIED',
      };
      setAnalysisReports((prev) => [newSnapshot, ...prev]);
      setNoticeMessage('✓ 최신 수입/지출 원장 및 6대 카드사 명세 데이터를 전수 재수집하여 새 분석 보고서 스냅샷이 생성되었습니다.');
      setIsDirtyAggregation(false);
    }, 700);
  };

  const [receiptOcrModalOpen, setReceiptOcrModalOpen] = useState(false);
  const [receiptOcrSimulating, setReceiptOcrSimulating] = useState(false);
  const [reaggregateSuccessMsg, setReaggregateSuccessMsg] = useState<string | null>(null);

  // [시나리오 2.1.3] 단일 지출 3대 뷰 모드 수직 3단 상세조회 상태
  const [selectedTxForProofs, setSelectedTxForProofs] = useState<LedgerTransaction | null>(null);
  const [detailProofFilter, setDetailProofFilter] = useState<'ALL' | 'STATEMENT' | 'RECEIPT'>('ALL');
  const [selectedProofItemId, setSelectedProofItemId] = useState<string | null>(null);
  const [selectedProofImageModal, setSelectedProofImageModal] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
    merchant?: string;
    amount?: number;
  } | null>(null);
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);
  const [expandedCardCode, setExpandedCardCode] = useState<string | null>('WOORI');

  // [설계정책 반영] 원본 이미지 온디맨드 해제 및 브라우저 다운로드 핸들러
  const handleDownloadOriginalProof = (title: string, merchant?: string) => {
    setDownloadingOriginal(true);
    setNoticeMessage(`"${title}" 원본 이미지를 압축 아카이브에서 안전하게 해제하여 다운로드합니다...`);
    setTimeout(() => {
      setDownloadingOriginal(false);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, 1000, 1400);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 4;
          ctx.strokeRect(20, 20, 960, 1360);

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText('모아보고 전자증빙 공증 원본', 50, 100);
          ctx.font = '18px sans-serif';
          ctx.fillStyle = '#475569';
          ctx.fillText(`증빙 항목: ${title}`, 50, 150);
          ctx.fillText(`가맹점: ${merchant || '스타벅스 강남점'}`, 50, 185);
          ctx.fillText(`추출 일시: ${new Date().toLocaleString()}`, 50, 220);
          ctx.fillText('보안 규약: SSOT 타임스탬프 단일 진실원천 검증 완료', 50, 255);

          // 영수증 데코레이션 선
          ctx.beginPath();
          ctx.setLineDash([8, 6]);
          ctx.moveTo(50, 290);
          ctx.lineTo(950, 290);
          ctx.strokeStyle = '#94a3b8';
          ctx.stroke();

          ctx.font = '22px monospace';
          ctx.fillStyle = '#0284c7';
          ctx.fillText('[ORIGINAL RECEIPT PROOF ARCHIVE]', 50, 340);
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `moabogo_proof_${title.replace(/[\s\/]/g, '_')}.png`;
        a.click();
      } catch (err) {
        console.error('Download error:', err);
      }
      setNoticeMessage(`✓ "${title}" 고해상도 원본 이미지가 성공적으로 다운로드되었습니다.`);
    }, 600);
  };

  // [시나리오 2.1.1 & 2.1.2] 카드명세서 등록/OCR검토/인라인보정/조건조회 상태
  const [statementIntakeReviews, setStatementIntakeReviews] = useState<CardStatementIntakeReview[]>([
    {
      id: 'rev-sh-01',
      cardName: '신한카드 (Mr.Life)',
      statementMonth: '2026-10',
      totalBilled: 1420000,
      txCount: 28,
      installmentCount: 3,
      lumpSumCount: 25,
      needsReview: true,
      rawFileName: '신한카드_202610_명세서.pdf',
      lines: [
        { id: 'sl-1', date: '2026-10-04', merchant: '이마트 역삼점', amount: 84200, installment: '일시불', approvalNo: '9182310', discount: 0, isFixedExpense: false },
        { id: 'sl-2', date: '2026-10-05', merchant: 'SKT 통신요금', amount: 65000, installment: '일시불', approvalNo: '9182311', discount: 5000, isFixedExpense: true, fixedExpenseType: '통신비' },
        { id: 'sl-3', date: '2026-10-08', merchant: 'LG전자 가전 렌탈', amount: 39900, installment: '일시불', approvalNo: '9182312', discount: 0, isFixedExpense: true, fixedExpenseType: '렌탈비' },
        { id: 'sl-4', date: '2026-10-10', merchant: '쿠팡 로켓와우', amount: 4990, installment: '일시불', approvalNo: '9182313', discount: 0, isFixedExpense: true, fixedExpenseType: '구독' },
      ],
    },
    {
      id: 'rev-hd-01',
      cardName: '현대카드 M Edition',
      statementMonth: '2026-10',
      totalBilled: 1680000,
      txCount: 34,
      installmentCount: 4,
      lumpSumCount: 30,
      needsReview: false,
      rawFileName: '현대카드_이용대금명세서_202610.html',
      lines: [
        { id: 'sl-h1', date: '2026-07-15', merchant: '밝은미소이치과의원', amount: 400000, installment: '3/3회차(완납)', approvalNo: '381920', discount: 0 },
        { id: 'sl-h2', date: '2026-10-02', merchant: '주유소 GS칼텍스', amount: 75000, installment: '일시불', approvalNo: '381921', discount: 2000 },
      ],
    },
  ]);
  const [statementEditModalOpen, setStatementEditModalOpen] = useState(false);
  const [activeEditingStatement, setActiveEditingStatement] = useState<CardStatementIntakeReview | null>(null);
  const [statementFilterCard, setStatementFilterCard] = useState('ALL');
  const [statementFilterInstallment, setStatementFilterInstallment] = useState('ALL');
  const [statementFilterFixed, setStatementFilterFixed] = useState('ALL');
  const [statementSearchKeyword, setStatementSearchKeyword] = useState('');
  const [isSimulatingOcrUpload, setIsSimulatingOcrUpload] = useState(false);
  const [bankTypeFilter, setBankTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [bankSearchKeyword, setBankSearchKeyword] = useState('');

  const filteredStatementLines = useMemo(() => {
    const allLines = statementIntakeReviews.flatMap((rev) =>
      rev.lines.map((l) => ({ ...l, cardName: rev.cardName }))
    );
    return allLines.filter((line) => {
      if (statementFilterCard !== 'ALL' && !line.cardName.includes(statementFilterCard)) return false;
      if (statementFilterInstallment === 'LUMP' && line.installment !== '일시불') return false;
      if (statementFilterInstallment === 'INSTALLMENT' && line.installment === '일시불') return false;
      if (statementFilterFixed === 'FIXED' && !line.isFixedExpense) return false;
      if (statementFilterFixed === 'VARIABLE' && line.isFixedExpense) return false;
      if (statementSearchKeyword) {
        const q = statementSearchKeyword.toLowerCase();
        if (!line.merchant.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [statementIntakeReviews, statementFilterCard, statementFilterInstallment, statementFilterFixed, statementSearchKeyword]);

  // [시나리오 2.3] 수입 관리 (고정수입 & 통장 거래내역 일괄수집)
  const [fixedIncomeRules, setFixedIncomeRules] = useState<FixedIncomeRule[]>([
    {
      id: 'fix-1',
      name: '삼성전자 급여',
      amount: 3800000,
      dayOfMonth: 25,
      category: '급여',
      targetLedgerTitle: '내 개인 가계부 (기본)',
      targetLedgerId: 'led-personal-01',
      notifyEnabled: true,
      account: '우리은행 (1002-***-918231)',
    },
    {
      id: 'fix-2',
      name: '분기 배당금 수입',
      amount: 185000,
      dayOfMonth: 20,
      category: '배당금',
      targetLedgerTitle: '내 개인 가계부 (기본)',
      targetLedgerId: 'led-personal-01',
      notifyEnabled: true,
      account: '신한투자증권 CMA (281-**-1029)',
    },
    {
      id: 'fix-3',
      name: 'CMA 비상금 금융이자',
      amount: 42000,
      dayOfMonth: 10,
      category: '이자',
      targetLedgerTitle: '우리집 가계부 (가족 공유)',
      targetLedgerId: 'led-group-01',
      notifyEnabled: false,
      account: '미래에셋 CMA (301-**-9281)',
    },
  ]);
  const [fixedIncomeModalOpen, setFixedIncomeModalOpen] = useState(false);
  const [bankImportModalOpen, setBankImportModalOpen] = useState(false);
  const [manualIncomeModalOpen, setManualIncomeModalOpen] = useState(false);

  // 등록 계좌 풀 및 미등록 계좌 감지 상태
  const [registeredBankAccounts, setRegisteredBankAccounts] = useState<string[]>([
    '토스뱅크 1000-82-918231 (생활비 통장)',
    '우리은행 1002-***-918231 (주거래 계좌)',
  ]);
  const [unregisteredAccounts, setUnregisteredAccounts] = useState<
    Array<{ bankName: string; accountNo: string; count: number }>
  >([]);

  // 통장 거래내역 파싱 샘플 (미등록 계좌 감지 지원)
  const [bankParsedItems, setBankParsedItems] = useState<BankStatementImportItem[]>([
    { id: 'bp-1', date: '2026-10-01', bankName: '토스뱅크', accountNoMasked: '1000-82-918231', description: '토스머니 환급 입금', depositAmount: 150000, withdrawAmount: 0, inferredType: 'INCOME', targetCategory: '기타수입', selected: true },
    { id: 'bp-2', date: '2026-10-04', bankName: '토스뱅크', accountNoMasked: '1000-82-918231', description: '체크카드 출금 (마켓컬리)', depositAmount: 0, withdrawAmount: 42800, inferredType: 'EXPENSE', targetCategory: '식음료/장보기', selected: true },
    { id: 'bp-3', date: '2026-10-06', bankName: '토스뱅크', accountNoMasked: '1000-82-918231', description: 'CMA 계좌로 송금', depositAmount: 0, withdrawAmount: 200000, inferredType: 'TRANSFER', targetCategory: '자산이동', selected: true },
    { id: 'bp-4', date: '2026-10-10', bankName: '토스뱅크', accountNoMasked: '1000-82-918231', description: '중고거래 당근 정산 입금', depositAmount: 35000, withdrawAmount: 0, inferredType: 'INCOME', targetCategory: '부수입', selected: true },
  ]);
  const [bankSelectedPeriod, setBankSelectedPeriod] = useState<'MONTH' | 'CUSTOM'>('MONTH');
  const [bankCustomRange, setBankCustomRange] = useState('2026.10.01 ~ 2026.10.31');
  const [detectedAutoAccount, setDetectedAutoAccount] = useState<string | null>('토스뱅크 1000-82-918231 (생활비 통장)');

  const filteredBankItems = useMemo(() => {
    return bankParsedItems.filter((item) => {
      if (bankTypeFilter !== 'ALL' && item.inferredType !== bankTypeFilter) return false;
      if (bankSearchKeyword) {
        const q = bankSearchKeyword.toLowerCase();
        if (!item.description.toLowerCase().includes(q) && !item.bankName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bankParsedItems, bankTypeFilter, bankSearchKeyword]);

  // 신규 고정수입 등록 폼
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [newFixedDay, setNewFixedDay] = useState('25');
  const [newFixedCategory, setNewFixedCategory] = useState<'급여' | '배당금' | '이자' | '임대료' | '기타'>('급여');
  const [newFixedTargetLedger, setNewFixedTargetLedger] = useState('내 개인 가계부 (기본)');
  const [newFixedAccount, setNewFixedAccount] = useState('우리은행 (1002-***-918231)');
  const [newFixedNotify, setNewFixedNotify] = useState(true);

  // 수기 수입 폼
  const [manualIncomeAmount, setManualIncomeAmount] = useState('');
  const [manualIncomeTitle, setManualIncomeTitle] = useState('');
  const [manualIncomeCategory, setManualIncomeCategory] = useState('급여');
  const [manualIncomeDate, setManualIncomeDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualIncomeAccount, setManualIncomeAccount] = useState('우리은행 주거래계좌');

  // [시나리오 2.4] 장부분석 (다차원 기간분석 / 재집계 플래그 / 일간 집계)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [isDirtyAggregation, setIsDirtyAggregation] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedDailyItem, setSelectedDailyItem] = useState<DailyAggregationItem | null>(null);

  // 일간 집계 (10월 일별 타임라인 그리드)
  const dailyAggregations: DailyAggregationItem[] = useMemo(() => [
    { date: '2026-10-01', dayNum: 1, dayOfWeek: '목', totalIncome: 2500000, totalExpense: 48000, txCount: 3, notableItems: ['공동생활비 입금', '마트 생필품'] },
    { date: '2026-10-02', dayNum: 2, dayOfWeek: '금', totalIncome: 0, totalExpense: 540000, txCount: 1, notableItems: ['강릉 펜션 예약금'] },
    { date: '2026-10-03', dayNum: 3, dayOfWeek: '토', totalIncome: 0, totalExpense: 388000, txCount: 2, notableItems: ['바베큐 장보기', '교보문고 서적'] },
    { date: '2026-10-04', dayNum: 4, dayOfWeek: '일', totalIncome: 0, totalExpense: 120000, txCount: 1, notableItems: ['가족 외식 삼겹살'] },
    { date: '2026-10-05', dayNum: 5, dayOfWeek: '월', totalIncome: 0, totalExpense: 65000, txCount: 1, notableItems: ['SKT 통신요금'] },
    { date: '2026-10-06', dayNum: 6, dayOfWeek: '화', totalIncome: 0, totalExpense: 200000, txCount: 1, notableItems: ['CMA 비상금 이체(자산이동)'] },
    { date: '2026-10-07', dayNum: 7, dayOfWeek: '수', totalIncome: 0, totalExpense: 0, txCount: 0, notableItems: [] },
    { date: '2026-10-08', dayNum: 8, dayOfWeek: '목', totalIncome: 0, totalExpense: 89900, txCount: 2, notableItems: ['자녀 용돈 이체', 'LG 가전 렌탈'] },
    { date: '2026-10-09', dayNum: 9, dayOfWeek: '금', totalIncome: 0, totalExpense: 18000, txCount: 1, notableItems: ['친구 생일 선물'] },
    { date: '2026-10-10', dayNum: 10, dayOfWeek: '토', totalIncome: 77000, totalExpense: 19490, txCount: 3, notableItems: ['CMA 이자 입금', '당근 정산', '중고서점'] },
    { date: '2026-10-11', dayNum: 11, dayOfWeek: '일', totalIncome: 0, totalExpense: 7200, txCount: 1, notableItems: ['스타벅스 커피(청구할인)'] },
    { date: '2026-10-12', dayNum: 12, dayOfWeek: '월', totalIncome: 0, totalExpense: 4500, txCount: 1, notableItems: ['편의점 간식'] },
    { date: '2026-10-13', dayNum: 13, dayOfWeek: '화', totalIncome: 0, totalExpense: 0, txCount: 0, notableItems: [] },
  ], []);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newLedgerModalOpen, setNewLedgerModalOpen] = useState(false);
  const [newTxModalOpen, setNewTxModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormAmount, setRuleFormAmount] = useState('');
  const [ruleFormDay, setRuleFormDay] = useState('25');
  const [ruleFormCategory, setRuleFormCategory] = useState<'급여' | '배당금' | '이자' | '임대료' | '기타'>('급여');
  const [ruleFormLedger, setRuleFormLedger] = useState('');
  const [ruleFormAccount, setRuleFormAccount] = useState('');
  const [ruleFormNotify, setRuleFormNotify] = useState(true);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [viewClosingStatement, setViewClosingStatement] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // 새 장부 생성 폼 상태
  const [newLedgerTitle, setNewLedgerTitle] = useState('');
  const [newLedgerType, setNewLedgerType] = useState<LedgerType>('PERSONAL');
  const [newLedgerPeriodType, setNewLedgerPeriodType] = useState<LedgerPeriodType>('LONG_TERM');
  const [newLedgerSubType, setNewLedgerSubType] = useState<LedgerSubType>('STANDARD');
  const [newLedgerBudgetCap, setNewLedgerBudgetCap] = useState('150000');
  const [newLedgerResetCycle, setNewLedgerResetCycle] = useState<'MONTHLY' | 'WEEKLY' | 'NONE'>('MONTHLY');
  const [newLedgerAllowReopen, setNewLedgerAllowReopen] = useState(true);
  const [newLedgerDesignStyle, setNewLedgerDesignStyle] = useState<'LEATHER' | 'HARDCOVER' | 'KRAFT' | 'FABRIC' | 'SLATE' | 'VINTAGE_BURGUNDY'>('KRAFT');
  const [newLedgerCustomColor, setNewLedgerCustomColor] = useState('#e5a622');
  const [newLedgerInitialBalance, setNewLedgerInitialBalance] = useState('0');

  // 북커버 및 색상 변경 모달 상태 (기존 장부 커버 수정 기능)
  const [editCoverModalOpen, setEditCoverModalOpen] = useState(false);
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [editCoverTitle, setEditCoverTitle] = useState('');
  const [editCoverDesignStyle, setEditCoverDesignStyle] = useState<'LEATHER' | 'HARDCOVER' | 'KRAFT' | 'FABRIC' | 'SLATE' | 'VINTAGE_BURGUNDY'>('KRAFT');
  const [editCoverColor, setEditCoverColor] = useState('#3a7bbd');

  // 참여자 추가 폼
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<LedgerRole>('MEMBER');
  const [isNewMemberGuest, setIsNewMemberGuest] = useState(false);

  // 새 거래 등록 폼 (도메인 격리: 지출, 수입, 자산이동 전용 속성 분리)
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [newTxCategory, setNewTxCategory] = useState('식음료/외식');
  const [newTxIsAssetTransfer, setNewTxIsAssetTransfer] = useState(false);
  const [newTxTags, setNewTxTags] = useState('');

  // 1) 지출 전용 독립 속성 및 상단 영수증 OCR 상태
  const [expensePayMethod, setExpensePayMethod] = useState<'신용카드' | '체크카드' | '현금' | '계좌이체' | '페이결제'>('신용카드');
  const [expenseCard, setExpenseCard] = useState('우리카드');
  const [expenseInstallment, setExpenseInstallment] = useState('일시불');
  const [expenseCategory, setExpenseCategory] = useState('식음료/외식');
  const [expenseAttachProof, setExpenseAttachProof] = useState(true);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrScanResult, setOcrScanResult] = useState<typeof SAMPLE_RECEIPTS[0] | null>(null);

  // 2) 수입 전용 독립 속성
  const [incomeSource, setIncomeSource] = useState('급여/상여');
  const [incomeAccount, setIncomeAccount] = useState('국민 주거래 급여통장');
  const [incomeIsFixedRule, setIncomeIsFixedRule] = useState(false);

  // 3) 자산이동 전용 독립 속성 (모아보고 금전관리 원칙: 1:1 페어링 및 생활비 집계 제외)
  const [transferFrom, setTransferFrom] = useState('개인 가계부 (국민 주거래)');
  const [transferTo, setTransferTo] = useState('가족 모임 가계부 (신한)');
  const [transferReason, setTransferReason] = useState('가족 생활비 분담');

  // 북커버 수정 모달 열기 핸들러
  const handleOpenEditCover = (ledgerToEdit: LedgerBook) => {
    setEditingLedgerId(ledgerToEdit.id);
    setEditCoverTitle(ledgerToEdit.title);
    setEditCoverDesignStyle(ledgerToEdit.designStyle);
    setEditCoverColor(ledgerToEdit.customCoverColor || '#3a7bbd');
    setEditCoverModalOpen(true);
  };

  // 북커버 수정 저장 핸들러
  const handleSaveEditCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedgerId) return;

    setLedgers((prev) =>
      prev.map((l) => {
        if (l.id !== editingLedgerId) return l;
        return {
          ...l,
          title: editCoverTitle.trim() || l.title,
          designStyle: editCoverDesignStyle,
          customCoverColor: editCoverColor,
        };
      })
    );
    setNoticeMessage(`✓ 장부 "${editCoverTitle.trim()}"의 북커버 디자인 및 색상이 변경되었습니다.`);
    setEditCoverModalOpen(false);
  };

  // 지출 등록 폼 상단 영수증 OCR 원클릭 샘플 적용 핸들러
  const handleApplyOcrSample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOcrScanResult(sample);
      setNewTxTitle(sample.merchant);
      setNewTxAmount(String(sample.amount));
      setExpenseCategory(sample.category);
      setExpenseCard(sample.cardName);
      setExpensePayMethod('신용카드');
      setExpenseInstallment('일시불');
      setExpenseAttachProof(true);
      setNewTxTags(`영수증인식, ${sample.category}`);
      setNoticeMessage(`✓ 영수증 OCR 분석 완료: "${sample.merchant}" (${sample.amountStr}) 정보가 자동 매핑되었습니다.`);
    }, 400);
  };

  // 지출 등록 폼 영수증 파일 업로드 시뮬레이션
  const handleSimulateOcrUpload = (fileName: string) => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      const generatedSample = {
        id: `rc-custom-${Date.now()}`,
        icon: '🧾',
        merchant: '현대백화점 판교점',
        amount: 38500,
        amountStr: '38,500원',
        category: '쇼핑/생활',
        cardName: '현대카드',
        itemSummary: '생활잡화 및 베이커리 구매',
        fileName,
      };
      setOcrScanResult(generatedSample);
      setNewTxTitle(generatedSample.merchant);
      setNewTxAmount(String(generatedSample.amount));
      setExpenseCategory(generatedSample.category);
      setExpenseCard(generatedSample.cardName);
      setExpensePayMethod('신용카드');
      setExpenseAttachProof(true);
      setNewTxTags(`영수증인식, ${generatedSample.category}`);
      setNoticeMessage(`✓ 영수증 파일 "${fileName}" OCR 분석 완료: 가맹점 및 결제금액이 자동 입력되었습니다.`);
    }, 450);
  };

  // 권한 체크
  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  const isLedgerClosed = currentLedger.closingStatus !== 'OPEN';
  const canAddTransaction = currentUserRole !== 'VIEWER' && !isLedgerClosed;

  // 장부 재오픈(Reopen) 핸들러
  const handleToggleReopen = () => {
    if (!canManageMembers) {
      setNoticeMessage('[권한 제한] 장부 마감 해제 및 재오픈은 소유자(방장)만 가능합니다.');
      return;
    }
    const nextStatus: LedgerClosingStatus = currentLedger.closingStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === currentLedger.id
          ? {
              ...l,
              closingStatus: nextStatus,
              closedAt: nextStatus === 'CLOSED' ? new Date().toISOString().slice(0, 10) : undefined,
            }
          : l
      )
    );
    setNoticeMessage(
      nextStatus === 'OPEN'
        ? `✓ "${currentLedger.title}" 장부가 재오픈되었습니다. 이제 신규 거래를 입력할 수 있습니다.`
        : `✓ "${currentLedger.title}" 장부가 마감(Read-Only) 보관되었습니다.`
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (!canManageMembers) {
      setNoticeMessage('[권한 제한] 참여자 관리는 소유자 또는 관리자만 가능합니다.');
      return;
    }

    if (currentLedger.type === 'GROUP' && isNewMemberGuest) {
      setNoticeMessage(
        '[안내] 정규 가족 가계부는 정식 가입 회원만 참여할 수 있습니다. (모임 가계부는 게스트 허용)'
      );
      return;
    }

    const newM: LedgerMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      isGuest: isNewMemberGuest,
      guestId: isNewMemberGuest ? `gst_${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      joinedAt: new Date().toISOString().slice(0, 10),
      avatar: isNewMemberGuest ? '🎭' : '🧑‍💻',
    };

    setMembersMap((prev) => ({
      ...prev,
      [activeLedgerId]: [...(prev[activeLedgerId] || []), newM],
    }));

    setLedgers((prev) =>
      prev.map((l) =>
        l.id === activeLedgerId ? { ...l, membersCount: l.membersCount + 1 } : l
      )
    );

    setNewMemberName('');
    setIsNewMemberGuest(false);
    setNoticeMessage(`✓ 새 참여자 "${newM.name}"이(가) 등록되었습니다.`);
  };

  const handleRoleChange = (memberId: string, targetRole: LedgerRole) => {
    if (!canManageMembers) {
      setNoticeMessage('[권한 제한] 권한 변경은 소유자 또는 관리자만 수행할 수 있습니다.');
      return;
    }
    setMembersMap((prev) => ({
      ...prev,
      [activeLedgerId]: prev[activeLedgerId].map((m) =>
        m.id === memberId ? { ...m, role: targetRole } : m
      ),
    }));
    setNoticeMessage(`✓ 참여자 권한이 변경되었습니다.`);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!canManageMembers) {
      setNoticeMessage('[권한 제한] 참여자 내보내기는 소유자 또는 관리자만 가능합니다.');
      return;
    }
    setMembersMap((prev) => ({
      ...prev,
      [activeLedgerId]: prev[activeLedgerId].filter((m) => m.id !== memberId),
    }));
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === activeLedgerId ? { ...l, membersCount: Math.max(1, l.membersCount - 1) } : l
      )
    );
    setNoticeMessage(`✓ 참여자 "${memberName}"을(를) 가계부에서 제외했습니다.`);
  };

  const handleAddMemberDirect = (memberData: { name: string; role: LedgerRole; isGuest: boolean }) => {
    const newM = {
      id: `m-${Date.now()}`,
      name: memberData.name,
      role: memberData.role,
      isGuest: memberData.isGuest,
      guestId: memberData.isGuest ? `gst_${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      joinedAt: new Date().toISOString().slice(0, 10),
      avatar: memberData.isGuest ? '🎭' : '🧑‍💻',
    };
    setMembersMap((prev) => ({
      ...prev,
      [activeLedgerId]: [...(prev[activeLedgerId] || []), newM],
    }));
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === activeLedgerId ? { ...l, membersCount: l.membersCount + 1 } : l
      )
    );
    setNoticeMessage(`✓ 새 참여자 "${newM.name}"이(가) 등록되었습니다.`);
  };

  const handleSaveRuleDirect = (rule: FixedIncomeRule) => {
    setFixedIncomeRules((prev) => {
      const exists = prev.some((r) => r.id === rule.id);
      if (exists) {
        return prev.map((r) => (r.id === rule.id ? rule : r));
      }
      return [...prev, rule];
    });
    setNoticeMessage(`✓ 고정수입 규칙 "${rule.name}"이(가) 저장되었습니다.`);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle.trim() || !newTxAmount) return;

    if (!canAddTransaction) {
      setNoticeMessage('[권한 제한] 조회 전용(VIEWER) 권한은 거래 내역을 등록할 수 없습니다.');
      return;
    }

    const amt = parseInt(newTxAmount.replace(/[^0-9]/g, '') || '0', 10);
    const parsedTags = newTxTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isTransfer = newTxType === 'TRANSFER' || newTxIsAssetTransfer;

    // 도메인 유형별 전용 속성 조립
    let finalCategory = newTxCategory;
    let finalNote = '';
    let finalProofs: ExpenseProofItem[] | undefined = undefined;
    let finalCardName: string | undefined = undefined;

    if (newTxType === 'EXPENSE') {
      finalCategory = expenseCategory;
      finalCardName = expenseCard;
      finalNote = `[${expensePayMethod}] ${expenseCard}${expenseInstallment !== '일시불' ? ` (${expenseInstallment})` : ''}`;
      if (expenseAttachProof) {
        finalProofs = [
          {
            id: `prf-${Date.now()}`,
            type: ocrScanResult ? 'RECEIPT_OCR' : 'MANUAL',
            title: ocrScanResult ? `${ocrScanResult.merchant} 전자 영수증 촬영본` : `${newTxTitle.trim()} 영수증/결제증빙`,
            amount: amt,
            date: new Date().toISOString().slice(0, 10),
            source: ocrScanResult ? `EasyOCR 스캐너 (${ocrScanResult.fileName})` : `${expensePayMethod} (${expenseCard})`,
            details: [
              `상호명: ${ocrScanResult?.merchant || newTxTitle.trim()}`,
              `결제수단: ${expensePayMethod}`,
              `카드사: ${expenseCard}`,
              `할부: ${expenseInstallment}`,
              ocrScanResult ? `영수증 파일: ${ocrScanResult.fileName}` : '모바일 영수증 촬영 증빙',
            ],
            rawFileName: ocrScanResult?.fileName || 'receipt_capture.jpg',
            businessNumber: '201-81-21515',
            ceoName: '강희석',
            supplyAmount: Math.round(amt / 1.1),
            taxAmount: Math.round(amt - amt / 1.1),
          },
        ];
      }
    } else if (newTxType === 'INCOME') {
      finalCategory = incomeSource;
      finalNote = `[입금계좌] ${incomeAccount}`;

      // 고정수입 규칙 동시 등록 옵션
      if (incomeIsFixedRule) {
        const mappedCategory: '급여' | '배당금' | '이자' | '임대료' | '기타' =
          incomeSource.includes('급여') ? '급여' : incomeSource.includes('이자') ? '이자' : '기타';
        setFixedIncomeRules((prev) => [
          ...prev,
          {
            id: `fix-${Date.now()}`,
            name: newTxTitle.trim(),
            amount: amt,
            dayOfMonth: new Date().getDate(),
            category: mappedCategory,
            targetLedgerTitle: currentLedger.title,
            targetLedgerId: currentLedger.id,
            notifyEnabled: true,
            account: incomeAccount,
          },
        ]);
      }
    } else if (newTxType === 'TRANSFER') {
      finalCategory = '자산이동';
      finalNote = `[자산이동] ${transferFrom} ➔ ${transferTo} (${transferReason})`;
    }

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      ledgerId: activeLedgerId,
      title: newTxTitle.trim(),
      type: newTxType,
      amount: amt,
      category: finalCategory,
      date: new Date().toISOString().slice(0, 10),
      payerName: '구본영(나)',
      note: finalNote,
      statementCardName: finalCardName,
      isAssetTransfer: isTransfer,
      relatedTransferId: isTransfer ? `rel-${Date.now()}` : undefined,
      reconciliationStatus: newTxType === 'EXPENSE' ? 'PENDING' : 'CONFIRMED',
      proofs: finalProofs,
      tagNames:
        parsedTags.length > 0
          ? parsedTags
          : isTransfer
          ? ['자산이동', transferReason]
          : newTxType === 'EXPENSE'
          ? ['지출', expensePayMethod]
          : ['수입', incomeSource],
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [activeLedgerId]: [newTx, ...(prev[activeLedgerId] || [])],
    }));

    setNewTxTitle('');
    setNewTxAmount('');
    setNewTxTags('');
    setNewTxModalOpen(false);
    setNoticeMessage(
      `✓ "${currentLedger.title}"에 ${newTxType === 'EXPENSE' ? '지출' : newTxType === 'INCOME' ? '수입' : '자산이동'} 내역(₩${amt.toLocaleString()})이 성공적으로 기록되었습니다.`
    );
  };

  // 고정수입 규칙 추가/수정/삭제 핸들러
  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleFormName('');
    setRuleFormAmount('');
    setRuleFormDay('25');
    setRuleFormCategory('급여');
    setRuleFormLedger(currentLedger.title);
    setRuleFormAccount('KB국민 주거래 급여통장');
    setRuleFormNotify(true);
    setIsRuleFormOpen(true);
  };

  const handleOpenEditRule = (rule: FixedIncomeRule) => {
    setEditingRuleId(rule.id);
    setRuleFormName(rule.name);
    setRuleFormAmount(rule.amount.toString());
    setRuleFormDay(rule.dayOfMonth.toString());
    setRuleFormCategory(rule.category);
    setRuleFormLedger(rule.targetLedgerTitle);
    setRuleFormAccount(rule.account);
    setRuleFormNotify(rule.notifyEnabled);
    setIsRuleFormOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormName.trim() || !ruleFormAmount) return;
    const amt = parseInt(ruleFormAmount.replace(/[^0-9]/g, '') || '0', 10);
    const day = parseInt(ruleFormDay.replace(/[^0-9]/g, '') || '25', 10);

    if (editingRuleId) {
      setFixedIncomeRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                name: ruleFormName.trim(),
                amount: amt,
                dayOfMonth: Math.min(31, Math.max(1, day)),
                category: ruleFormCategory,
                targetLedgerTitle: ruleFormLedger.trim() || currentLedger.title,
                targetLedgerId: r.targetLedgerId || activeLedgerId,
                account: ruleFormAccount.trim() || '주거래 통장',
                notifyEnabled: ruleFormNotify,
              }
            : r
        )
      );
      setNoticeMessage(`✓ 고정수입 규칙 "${ruleFormName.trim()}"이(가) 수정되었습니다.`);
    } else {
      const newRule: FixedIncomeRule = {
        id: `fix-${Date.now()}`,
        name: ruleFormName.trim(),
        amount: amt,
        dayOfMonth: Math.min(31, Math.max(1, day)),
        category: ruleFormCategory,
        targetLedgerTitle: ruleFormLedger.trim() || currentLedger.title,
        targetLedgerId: activeLedgerId,
        account: ruleFormAccount.trim() || '주거래 통장',
        notifyEnabled: ruleFormNotify,
      };
      setFixedIncomeRules((prev) => [...prev, newRule]);
      setNoticeMessage(`✓ 새 고정수입 규칙 "${ruleFormName.trim()}"이(가) 추가되었습니다.`);
    }
    setIsRuleFormOpen(false);
    setEditingRuleId(null);
  };

  const handleDeleteRule = (ruleId: string, ruleName: string) => {
    setFixedIncomeRules((prev) => prev.filter((r) => r.id !== ruleId));
    setNoticeMessage(`✓ 고정수입 규칙 "${ruleName}"이(가) 삭제되었습니다.`);
  };

  // 카드명세서 등록정보 및 승인라인 보정 핸들러
  const handleSaveEditedStatement = () => {
    if (!activeEditingStatement) return;
    setStatementIntakeReviews((prev) =>
      prev.map((r) => (r.id === activeEditingStatement.id ? activeEditingStatement : r))
    );
    setStatementEditModalOpen(false);
    setNoticeMessage(
      `✓ [${activeEditingStatement.cardName}] (${activeEditingStatement.statementMonth}) 명세서 등록정보 및 승인라인 보정이 저장되었습니다.`
    );
  };

  const handleAddStatementLine = () => {
    if (!activeEditingStatement) return;
    const newLine = {
      id: `sl-new-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      merchant: '새 가맹점',
      amount: 15000,
      installment: '일시불',
      approvalNo: Math.floor(100000 + Math.random() * 900000).toString(),
      discount: 0,
      isFixedExpense: false,
    };
    setActiveEditingStatement({
      ...activeEditingStatement,
      lines: [newLine, ...activeEditingStatement.lines],
      txCount: activeEditingStatement.txCount + 1,
      totalBilled: activeEditingStatement.totalBilled + 15000,
      lumpSumCount: activeEditingStatement.lumpSumCount + 1,
    });
  };

  const handleDeleteStatementLine = (lineId: string) => {
    if (!activeEditingStatement) return;
    const targetLine = activeEditingStatement.lines.find((l) => l.id === lineId);
    const updatedLines = activeEditingStatement.lines.filter((l) => l.id !== lineId);
    setActiveEditingStatement({
      ...activeEditingStatement,
      lines: updatedLines,
      txCount: Math.max(0, activeEditingStatement.txCount - 1),
      totalBilled: Math.max(0, activeEditingStatement.totalBilled - (targetLine?.amount || 0)),
    });
  };

  // 통장 거래내역 일괄등록 대사 핸들러
  const handleToggleSelectAllBankItems = (checked: boolean) => {
    setBankParsedItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleToggleBankItemSelect = (id: string) => {
    setBankParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleChangeBankItemType = (
    id: string,
    newType: 'INCOME' | 'EXPENSE' | 'TRANSFER',
    defaultCategory?: string
  ) => {
    setBankParsedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              inferredType: newType,
              targetCategory:
                defaultCategory ||
                (newType === 'INCOME' ? '기타수입' : newType === 'TRANSFER' ? '자산이동' : '기타지출'),
            }
          : item
      )
    );
  };

  // [태스크 0011-01] 엑셀 통장 거래내역 파싱 시뮬레이션 (중복 제거 & 미등록 계좌 감지)
  const handleSimulateBankUpload = () => {
    // 엑셀에서 추출된 샘플 내역 (신한은행, 국민은행, 카카오뱅크 및 중복 후보 포함)
    const rawBatch: BankStatementImportItem[] = [
      {
        id: `bp-sim-1`,
        date: '2026-10-15',
        bankName: '국민은행',
        accountNoMasked: '928102-01-***921',
        description: '외주 프로젝트 1차 정산금 입금',
        depositAmount: 1800000,
        withdrawAmount: 0,
        inferredType: 'INCOME',
        targetCategory: '부수입',
        selected: true,
      },
      {
        id: `bp-sim-2`,
        date: '2026-10-16',
        bankName: '국민은행',
        accountNoMasked: '928102-01-***921',
        description: '서버 호스팅 클라우드 비용 출금',
        depositAmount: 0,
        withdrawAmount: 55000,
        inferredType: 'EXPENSE',
        targetCategory: '통신/IT',
        selected: true,
      },
      {
        id: `bp-sim-3`,
        date: '2026-10-16',
        bankName: '카카오뱅크',
        accountNoMasked: '3333-01-***821',
        description: 'CMA 비상금 적립 (계좌이체)',
        depositAmount: 0,
        withdrawAmount: 300000,
        inferredType: 'TRANSFER',
        targetCategory: '자산이동',
        selected: true,
      },
      {
        id: `bp-sim-4`,
        date: '2026-10-10',
        bankName: '토스뱅크',
        accountNoMasked: '1000-82-918231',
        description: '중고거래 당근 정산 입금', // 기존 bp-4와 동일한 중복 데이터 테스트용
        depositAmount: 35000,
        withdrawAmount: 0,
        inferredType: 'INCOME',
        targetCategory: '부수입',
        selected: true,
      },
    ];

    setBankParsedItems((prev) => {
      // 1. 중복 데이터 단일화 (Deduplication): 일자 + 적요 + 금액 + 계좌번호 기준 1건으로 통합
      const existingKeySet = new Set(
        prev.map(
          (item) =>
            `${item.date}_${item.description.trim()}_${item.depositAmount}_${item.withdrawAmount}_${item.accountNoMasked}`
        )
      );

      const uniqueNewItems: BankStatementImportItem[] = [];
      let duplicateCount = 0;

      rawBatch.forEach((candidate, idx) => {
        const key = `${candidate.date}_${candidate.description.trim()}_${candidate.depositAmount}_${candidate.withdrawAmount}_${candidate.accountNoMasked}`;
        if (!existingKeySet.has(key)) {
          existingKeySet.add(key);
          uniqueNewItems.push({
            ...candidate,
            id: `bp-sim-${Date.now()}-${idx}`,
          });
        } else {
          duplicateCount += 1;
        }
      });

      // 2. 미등록 계좌 자동 감지 (Auto-Discovery)
      const allActiveAccounts = [
        ...prev.map((i) => ({ bankName: i.bankName, accountNo: i.accountNoMasked })),
        ...uniqueNewItems.map((i) => ({ bankName: i.bankName, accountNo: i.accountNoMasked })),
      ];

      const unregisteredMap = new Map<string, { bankName: string; accountNo: string; count: number }>();
      allActiveAccounts.forEach((acc) => {
        const isRegistered = registeredBankAccounts.some(
          (reg) => reg.includes(acc.accountNo) || (reg.includes(acc.bankName) && reg.includes(acc.accountNo.slice(0, 4)))
        );
        if (!isRegistered) {
          const key = `${acc.bankName}_${acc.accountNo}`;
          const current = unregisteredMap.get(key) || { bankName: acc.bankName, accountNo: acc.accountNo, count: 0 };
          current.count += 1;
          unregisteredMap.set(key, current);
        }
      });

      setUnregisteredAccounts(Array.from(unregisteredMap.values()));

      if (duplicateCount > 0) {
        setNoticeMessage(
          `✓ 엑셀 파싱 완료: 중복 내역 ${duplicateCount}건은 단일 통합되었으며, 신규 ${uniqueNewItems.length}건이 반영되었습니다.`
        );
      } else {
        setNoticeMessage(
          `✓ 엑셀 통장 거래내역 ${uniqueNewItems.length}건이 성공적으로 파싱되어 목록에 추가되었습니다.`
        );
      }

      return [...uniqueNewItems, ...prev];
    });
  };

  // [태스크 0011-01] 미등록 계좌를 가계부 신규 보조 계좌로 즉시 등록
  const handleRegisterNewAccount = (bankName: string, accountNo: string) => {
    const newAccountLabel = `${bankName} ${accountNo} (등록 보조계좌)`;
    setRegisteredBankAccounts((prev) => [...prev, newAccountLabel]);
    setUnregisteredAccounts((prev) => prev.filter((a) => a.accountNo !== accountNo));
    setNoticeMessage(`✓ [${newAccountLabel}]가 현재 가계부의 신규 보조 계좌로 정식 등록되었습니다.`);
  };

  // [태스크 0011-01] 미등록 계좌 내역을 대표 계좌로 귀속 매핑
  const handleMapToPrimaryAccount = (oldAccountNo: string) => {
    const primaryAccount = registeredBankAccounts[0] || '토스뱅크 1000-82-918231 (생활비 통장)';
    setBankParsedItems((prev) =>
      prev.map((item) =>
        item.accountNoMasked === oldAccountNo
          ? {
              ...item,
              accountNoMasked: '1000-82-918231',
              bankName: '토스뱅크',
              description: `[대리귀속] ${item.description}`,
            }
          : item
      )
    );
    setUnregisteredAccounts((prev) => prev.filter((a) => a.accountNo !== oldAccountNo));
    setNoticeMessage(`✓ 해당 계좌의 거래내역이 가계부 대표 계좌 [${primaryAccount}]로 귀속 매핑되었습니다.`);
  };

  // [태스크 0011-01] 파싱 항목 인라인/OCR 보정 핸들러
  const handleUpdateBankItem = (
    id: string,
    field: 'description' | 'targetCategory' | 'inferredType',
    value: string
  ) => {
    setBankParsedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'description') return { ...item, description: value };
        if (field === 'targetCategory') return { ...item, targetCategory: value };
        if (field === 'inferredType') {
          const newType = value as 'INCOME' | 'EXPENSE' | 'TRANSFER';
          return {
            ...item,
            inferredType: newType,
            targetCategory:
              newType === 'INCOME' ? '기타수입' : newType === 'TRANSFER' ? '자산이동' : '기타지출',
          };
        }
        return item;
      })
    );
  };

  const handleBatchImportBankTransactions = () => {
    const selectedItems = bankParsedItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setNoticeMessage('⚠️ 일괄 등록할 통장 거래내역을 1건 이상 선택해주세요.');
      return;
    }

    const newEntries: LedgerTransaction[] = selectedItems.map((item, idx) => {
      const isIncome = item.inferredType === 'INCOME';
      const isTransfer = item.inferredType === 'TRANSFER';
      const amt = isIncome ? item.depositAmount : item.withdrawAmount;
      return {
        id: `tx-bank-${Date.now()}-${idx}`,
        ledgerId: activeLedgerId,
        expenseRecordId: `atx-bank-${Date.now().toString().slice(-4)}-${idx}`,
        title: item.description,
        type: item.inferredType,
        amount: amt,
        category: item.targetCategory || (isIncome ? '기타수입' : isTransfer ? '자산이동' : '기타지출'),
        date: item.date,
        payerName: '구본영(나)',
        note: `통장 일괄등록 (${item.bankName} ${item.accountNoMasked})`,
        isAssetTransfer: isTransfer,
        relatedTransferId: isTransfer ? `rel-${Date.now()}-${idx}` : undefined,
        reconciliationStatus: 'CONFIRMED',
        proofs: [
          {
            id: `prf-b-${Date.now()}-${idx}`,
            type: 'STATEMENT_LINE',
            title: `${item.bankName} 통장 거래내역 확정`,
            amount: amt,
            date: item.date,
            source: `${item.bankName} 계좌 거래내역`,
            paymentAccount: `${item.bankName} (${item.accountNoMasked})`,
            details: [`거래적요: ${item.description}`, `일괄등록 자동 대사 완료`],
          },
        ],
        tagNames: ['통장일괄등록', item.bankName, isTransfer ? '자산이동' : isIncome ? '수입' : '지출'],
      };
    });

    setTransactionsMap((prev) => ({
      ...prev,
      [activeLedgerId]: [...newEntries, ...(prev[activeLedgerId] || [])],
    }));

    setBankImportModalOpen(false);
    setNoticeMessage(
      `✓ 통장 거래내역 ${selectedItems.length}건이 "${currentLedger.title}" 원장(SSOT)에 성공적으로 일괄 등록되었습니다.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 landscape:p-3 space-y-4 sm:space-y-5 landscape:space-y-3 bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ==================================================================== */}
      {/* 1. 표준 상단 헤더 (Section 1 Header: ElmTyp01 & SCR-LED-01 뱃지) */}
      {/* ==================================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3.5 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <ElmTyp01
            title="통합 장부 · 지출내역 종합관리"
            badge="SCR-LED-01"
            subtitle="장부 책장 & 3대 뷰(타임라인/카테고리/캘린더) & SSOT 원장 관리"
            className="min-w-0"
          />
        </div>

        {/* 상단 퀵 액션 */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setNewLedgerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95"
            title="새 장부 개설하기"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>새 장부 개설</span>
          </button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. 가계부 책꽂이: 사용자 이미지 기반 카툰 북 스택 (그림처럼 차곡차곡 쌓인 책 더미) */}
      {/* ==================================================================== */}
      <div className="relative pt-0 pb-2 sm:pt-0 sm:pb-3 landscape:py-1 px-1 sm:px-4">
        {/* 상단 장부책장 반응형 헤더 (1행: 타이틀 + 우측 컨트롤러 / 2행: 장부구분 필터 슬라이더) */}
        <div className="space-y-2 pb-2 mb-1.5 border-b border-stone-200 dark:border-stone-800">
          {/* 1행: 타이틀 및 우측 제어 컨트롤러 ([+ 새 장부] [건수] [책장 열기/닫기] [▲▼ 방향]) */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* 타이틀 */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 font-sans tracking-tight">
                장부책장
              </span>
            </div>

            {/* 통합 우측 제어 컨트롤러 */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* 새 장부 등록 버튼 */}
              <button
                type="button"
                onClick={() => setNewLedgerModalOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs cursor-pointer select-none whitespace-nowrap active:scale-95"
                title="새 장부 개설하기"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>새 장부</span>
              </button>

              {/* 건수 뱃지 */}
              <span
                className="text-[11px] sm:text-xs font-mono px-2 sm:px-2.5 py-1 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-black shadow-2xs whitespace-nowrap"
                title="현재 노출된 장부 건수 / 전체 건수"
              >
                {(() => {
                  const totalCount = ledgers.length;
                  const currentDisplayedCount = isBookshelfOpen ? visibleLedgers.length : 1;
                  return currentDisplayedCount === totalCount ? `${totalCount}건` : `${currentDisplayedCount}/${totalCount}건`;
                })()}
              </span>

              {/* 책장 열기 / 닫기 버튼 */}
              <button
                type="button"
                onClick={() => setIsBookshelfOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all shadow-2xs cursor-pointer select-none whitespace-nowrap active:scale-95"
                title={isBookshelfOpen ? "책장을 닫고 선택한 장부만 표시합니다" : "책장을 열어 전체 장부를 표시합니다"}
              >
                {isBookshelfOpen ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                    <span className="hidden xs:inline sm:inline">책장 </span><span>닫기</span>
                  </>
                ) : (
                  <>
                    <Book className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 stroke-[2.2]" />
                    <span className="hidden xs:inline sm:inline">책장 </span><span>열기</span>
                  </>
                )}
              </button>

              {/* 방향 이동 버튼 */}
              {isBookshelfOpen && visibleLedgers.length > 1 && (
                <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-300 dark:border-stone-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleScrollBooks('UP')}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                    title="스택 위로 스크롤"
                  >
                    <ChevronUp className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollBooks('DOWN')}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                    title="스택 아래로 스크롤"
                  >
                    <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2행: 장부구분(전체, 개인, 장기, 단기) 필터 (ElmSld03 공통 슬라이드드래그휠 전파차단 토큰 적용) */}
          <div className="w-full flex items-center justify-start">
            <ElmSld03
              showNavButtons={false}
              className="w-full"
              innerClassName="items-center justify-start gap-1.5 py-0.5"
            >
              {/* 전체 뱃지 */}
              <button
                type="button"
                onClick={handleToggleAll}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border select-none ${
                  isAllSelected
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 ring-2 ring-stone-900/30 shadow-xs font-black'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="모든 장부 유형 선택/해제"
              >
                <span>전체</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isAllSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {countByType.ALL}
                </span>
              </button>

              {/* 개인 뱃지 */}
              <button
                type="button"
                onClick={() => handleToggleType('PERSONAL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border select-none ${
                  selectedTypes.PERSONAL
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-600/30 shadow-xs font-black'
                    : 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 dark:text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-90'
                }`}
                title="개인 장부 노출/숨김 토글"
              >
                <span>개인</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedTypes.PERSONAL
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {countByType.PERSONAL}
                </span>
              </button>

              {/* 장기 뱃지 */}
              <button
                type="button"
                onClick={() => handleToggleType('GROUP')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border select-none ${
                  selectedTypes.GROUP
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30 shadow-xs font-black'
                    : 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 dark:text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-90'
                }`}
                title="장기 모임 장부 노출/숨김 토글"
              >
                <span>장기</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedTypes.GROUP
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {countByType.GROUP}
                </span>
              </button>

              {/* 단기 뱃지 */}
              <button
                type="button"
                onClick={() => handleToggleType('INSTANCE')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border select-none ${
                  selectedTypes.INSTANCE
                    ? 'bg-amber-600 text-white ring-2 ring-amber-600/30 shadow-xs font-black'
                    : 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 dark:text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-90'
                }`}
                title="단기 모임 장부 노출/숨김 토글"
              >
                <span>단기</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedTypes.INSTANCE
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {countByType.INSTANCE}
                </span>
              </button>
            </ElmSld03>
          </div>
        </div>

        {/* 2-1. 순수 일러스트레이션 책 더미 뷰포트 (배경 없이 책 그림들이 차곡차곡 포개져 쌓임) */}
        <div className="relative pt-6 pb-4 px-1 sm:px-4">
          {/* 세로 스크롤 컨테이너 (많은 책이 쌓여도 매끄럽게 탐색) */}
          <div
            ref={bookStackRef}
            className="max-h-[480px] landscape:max-h-[290px] overflow-y-auto pl-1 pr-1 sm:px-3 pt-3 pb-5 landscape:pt-2 landscape:pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {displayedLedgers.length === 0 ? (
              <div className="py-12 text-center text-stone-500 dark:text-stone-400 font-bold text-sm bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                선택한 구분의 장부가 없습니다.
              </div>
            ) : (
              displayedLedgers.map((book, idx) => {
                // [요구사항 1] 보이는 장부가 아닌 '전체 장부(ledgers)' 기준의 두께 비율 계산 (최고 금액은 2배 두께)
                const thickness = getThicknessScale(book.balance, overallMaxBalance);
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

                return (
                  <div
                    key={book.id}
                    data-book-index={idx}
                    onDragOver={(e) => isBookshelfOpen && handleDragOver(idx, e)}
                    onDragLeave={() => {
                      if (dragOverIndex === idx) setDragOverIndex(null);
                    }}
                    onDrop={(e) => isBookshelfOpen && handleDrop(idx, e)}
                    className={`relative select-none group/row transition-all duration-200 ease-out flex items-center gap-2 sm:gap-3 ${
                      idx > 0 ? '-mt-[28px] xs:-mt-[30px] sm:-mt-[22px]' : ''
                    } ${isDragging ? 'opacity-55 scale-[1.01] z-50' : ''} ${
                      isDragOver ? 'ring-2 ring-amber-400 ring-offset-2 z-40 rounded-xl' : ''
                    }`}
                    style={{
                      zIndex: isDragging ? 60 : book.id === activeLedgerId ? 50 : displayedLedgers.length - idx + 10,
                    }}
                  >
                    {/* [요구사항 4] 책 순서변경 핸들 (책장이 열려있을 때만 순서변경 핸들 활성화, 닫혀있을 때는 선택 표시) */}
                    {isBookshelfOpen ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(idx, e)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(idx, e)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={(e) => e.stopPropagation()}
                        className={`shrink-0 w-8.5 sm:w-10 rounded-xl border-2 border-stone-800 dark:border-stone-700 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-amber-950/60 shadow-xs flex flex-col items-center justify-center gap-0.5 cursor-grab active:cursor-grabbing select-none transition-all ${
                          isDragging ? 'bg-amber-400 ring-2 ring-stone-900 scale-105 shadow-md' : ''
                        }`}
                        style={{
                          height: `${Math.round(40 * Math.min(1.4, thickness))}px`,
                          minHeight: '38px',
                          maxHeight: '62px',
                        }}
                        title={`[${book.title}] 왼쪽 핸들을 위아래로 드래그하여 순서 변경`}
                      >
                        <GripHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-900 dark:text-stone-200 stroke-[2.5]" />
                        <span className="text-[8.5px] sm:text-[9.5px] font-black font-mono text-stone-800 dark:text-stone-300 leading-none">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="shrink-0 w-8.5 sm:w-10 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs flex flex-col items-center justify-center gap-0.5 select-none"
                        style={{
                          height: `${Math.round(40 * Math.min(1.4, thickness))}px`,
                          minHeight: '38px',
                          maxHeight: '62px',
                        }}
                        title="현재 선택된 장부"
                      >
                        <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/40" />
                        <span className="text-[8px] font-black text-indigo-700 dark:text-indigo-300">선택</span>
                      </div>
                    )}

                    {/* 책 이미지 본체 (CartoonStackedBookObject) */}
                    <div className="flex-1 min-w-0">
                      <CartoonStackedBookObject
                        book={book}
                        idx={idx}
                        total={displayedLedgers.length}
                        thicknessScale={thickness}
                        isSelected={book.id === activeLedgerId}
                        isDragging={isDragging}
                        isDragOver={isDragOver}
                        onSelect={() => {
                          setActiveLedgerId(book.id);
                          setNoticeMessage(`✓ "${book.title}" 가계부로 전환되었습니다.`);
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 2-2. 책 더미 바닥의 자연스러운 접촉 타원 그림자 */}
          <div className="relative mx-auto max-w-[680px] -mt-1 pointer-events-none">
            <div className="h-4 bg-gradient-to-r from-transparent via-stone-900/30 dark:via-black/50 to-transparent blur-sm rounded-full" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. [1번 개선] 선택된 가계부의 속성 바 (책꽂이 아래로 자연스럽게 정렬) */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 3. 선택된 가계부의 회계 속성 바 (단장기, 성격, 마감 상태 & 권한) */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-2xs">
        {/* 좌측: 현재 선택된 장부 명칭 & 결산 주기 & 회계 분류 뱃지 */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {currentLedger.title}
            </span>
            {/* 기간 뱃지 */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                currentLedger.periodType === 'SHORT_TERM'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                  : 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200'
              }`}
            >
              {currentLedger.periodType === 'SHORT_TERM' ? '단기 정산형' : '장기 연속형'}
            </span>
            {/* 성격 뱃지 */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                currentLedger.subType === 'POCKET_MONEY'
                  ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/60 dark:text-yellow-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              {currentLedger.subType === 'POCKET_MONEY' ? '용돈기입장' : '일반 가계부'}
            </span>
            {/* 마감 상태 뱃지 */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                currentLedger.closingStatus === 'OPEN'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : currentLedger.closingStatus === 'SETTLED'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
              }`}
            >
              {currentLedger.closingStatus === 'OPEN' ? (
                <>
                  <Unlock className="w-3 h-3" /> 진행중 (OPEN)
                </>
              ) : currentLedger.closingStatus === 'SETTLED' ? (
                <>
                  <Lock className="w-3 h-3" /> 정산완료 (SETTLED)
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> 마감보관 (CLOSED)
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {currentLedger.description} · <span className="font-semibold text-slate-700 dark:text-zinc-300">{currentLedger.settlementCycle}</span>
          </p>
        </div>

        {/* 우측: 내 권한 시뮬레이터 & 마감 재오픈 토글 & 참여자 관리 버튼 & 커버색상 (태블릿/모바일 줄바꿈 허용) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* 마감 재오픈 토글 버튼 (방장 권한) */}
          {currentLedger.allowReopen && canManageMembers && (
            <button
              type="button"
              onClick={handleToggleReopen}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all ${
                currentLedger.closingStatus === 'OPEN'
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
              }`}
              title="장부 마감 상태를 전환합니다"
            >
              {currentLedger.closingStatus === 'OPEN' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>장부 마감하기</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>장부 재오픈</span>
                </>
              )}
            </button>
          )}

          {/* [우선순위 그룹] 내 권한(소유자) & 사용자관리 묶음 (줄바꿈 허용으로 구역 이탈 원천 차단) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* 내 권한 시뮬레이터 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs text-xs shrink-0">
              <span className="text-slate-400 font-medium text-[11px]">내 권한:</span>
              <select
                value={currentUserRole}
                onChange={(e) => {
                  setCurrentUserRole(e.target.value as LedgerRole);
                  setNoticeMessage(`내 권한이 [${e.target.value}] 역할로 전환되었습니다.`);
                }}
                className="bg-transparent font-extrabold text-indigo-600 dark:text-indigo-400 text-xs focus:outline-hidden cursor-pointer"
                title="현재 가계부의 권한 전환 시뮬레이션"
              >
                <option value="OWNER">👑 소유자 (OWNER)</option>
                <option value="ADMIN">🛡️ 관리자 (ADMIN)</option>
                <option value="MEMBER">👤 멤버 (MEMBER)</option>
                <option value="VIEWER">👁️ 조회전용 (VIEWER)</option>
                <option value="GUEST">🎭 게스트 (GUEST)</option>
              </select>
            </div>

            {/* 1. 사용자 관리 버튼 */}
            <button
              type="button"
              onClick={() => setMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold shadow-2xs cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="장부 참여 멤버 및 권한 관리"
            >
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>사용자 관리 ({currentMembers.length}명)</span>
            </button>
          </div>

          {/* 2. 커버색상 버튼 (줄바꿈 시 소유자·사용자관리 다음선으로 유연하게 배치) */}
          <button
            type="button"
            onClick={() => handleOpenEditCover(currentLedger)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold shadow-2xs cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="현재 선택된 장부의 북커버 디자인 및 시그니처 색상 변경"
          >
            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>커버색상</span>
          </button>
        </div>
      </div>

      {/* 3-1. [단기 장부 마감 모드] 정산 마감 보관(Read-Only) 배너 & 최종 결산 영수증 토글 */}
      {isLedgerClosed && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold text-xs sm:text-sm">
                  정산 및 회계 마감 보관 (Read-Only) 원장
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {currentLedger.closedAt && `마감일: ${currentLedger.closedAt} · `}
                  본 장부는 정산이 완료되어 신규 거래 입력이 잠금되었습니다. 최종 결산 영수증을 확인하세요.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewClosingStatement(!viewClosingStatement)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{viewClosingStatement ? '결산서 접기' : '최종 결산 영수증 보기'}</span>
            </button>
          </div>

          {/* 최종 결산 영수증 뷰어 (펼침 시) */}
          {viewClosingStatement && (
            <div className="mt-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 text-slate-800 dark:text-zinc-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="font-black text-xs sm:text-sm flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  최종 결산 보고서 (Closing Statement)
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  STAMP: MOABOGO-AUDIT-CERTIFIED
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">총 지출 정산액</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    ₩{stats.pureExpense.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">회비/자산이동</span>
                  <span className="font-mono font-black text-purple-600 text-sm">
                    ₩{stats.assetTransfer.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">대납 및 차액정산</span>
                  <span className="font-mono font-black text-amber-600 text-sm">
                    ₩{stats.reimbursement.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">참여 인원</span>
                  <span className="font-mono font-black text-indigo-600 text-sm">
                    {currentMembers.length}명 전원 완료
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * 모임 인스턴스 정산 규칙에 따라 모든 참가자의 1/N 분담금 및 차액 송금이 완료되었습니다. 정규 회원 및 게스트 데이터는 보관 규정에 따라 무결성이 보증됩니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3-2. [용돈기입장 모드] 한도 소진율 및 예산 차감 게이지 카드 */}
      {currentLedger.subType === 'POCKET_MONEY' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-amber-600" />
              <div>
                <span className="font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  용돈 한도 및 실시간 소진율 모니터링
                </span>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  월간 지정 한도 내에서 지출을 통제하며, 부모 가계부에서 TRANSFER 1:1 페어링으로 충전됩니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100">
                소진율 {Math.round(((currentLedger.spentAmount || 0) / (currentLedger.budgetCap || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden p-0.5 border border-stone-300 dark:border-stone-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((currentLedger.spentAmount || 0) / (currentLedger.budgetCap || 1)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <span>누적 지출: ₩{(currentLedger.spentAmount || 0).toLocaleString()}</span>
              <span>월 한도: ₩{(currentLedger.budgetCap || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">용돈 한도</span>
              <span className="font-mono font-black text-stone-900 dark:text-white">
                ₩{(currentLedger.budgetCap || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">사용 금액</span>
              <span className="font-mono font-black text-rose-600">
                ₩{(currentLedger.spentAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">남은 용돈</span>
              <span className="font-mono font-black text-emerald-600">
                ₩{(currentLedger.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. [2.1 고정정보] (총잔액, 수입합계, 지출합계) + [2.2 유동정보 서류철 인덱스 슬라이드 배너] */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        {/* 2.1 고정정보: 3대 핵심 회계 지표 (총 잔액, 수입 합계, 지출 합계) - 항상 표시 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* 고정 1: 총 잔액 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                {currentLedger.subType === 'POCKET_MONEY' ? '현재 잔여 용돈' : '가계부 총 잔액'}
              </span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              ₩{currentLedger.balance.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-emerald-600 font-semibold truncate flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>단일 귀속 계좌 연동 중</span>
            </div>
          </div>

          {/* 고정 2: 수입 합계 금액 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                수입 합계 금액
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +₩{stats.income.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-slate-500 font-medium truncate flex items-center justify-between">
              <span>고정 {fixedIncomeRules.length}건 + 통장/일반</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">입금 확정</span>
            </div>
          </div>

          {/* 고정 3: 지출 합계 금액 (부드러운 분홍 테마 적용) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-400">
                지출 합계 금액
              </span>
              <TrendingDown className="w-4 h-4 text-pink-500" />
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-pink-600 dark:text-pink-400">
              -₩{stats.pureExpense.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-slate-500 font-medium truncate flex items-center justify-between">
              <span>자산이동 제외 순수 소비</span>
              <span className="text-[10px] font-mono font-bold text-pink-500">
                {filteredTransactions.filter((t) => t.type === 'EXPENSE').length}건 집계
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. 거래 내역 리스트 & 새 거래 등록 메인 액션 */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        {/* ==================================================================== */}
        {/* [시안 B] 3대 대메뉴 덱 탭 헤더: [지출(일반/명세)] · [수입(고정/통장)] · [분석(일간/명세Bento)] */}
        {/* ==================================================================== */}
        {/* ==================================================================== */}
        {/* 2대 대메뉴 대축: [1. ✍️ 장부작성 (수입·지출)] · [2. 📊 분석 (현황·보고서)] */}
        {/* ==================================================================== */}
        <div className="space-y-3.5 border-b border-slate-100 dark:border-zinc-800 pb-4">
          {/* Level 1: 2대 대축 (장부작성 vs 분석) 스위치 & Level 2 툴바 */}
          <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2.5 sm:gap-3">
            <ElmSld03
              showNavButtons={false}
              className="w-full 2xl:w-auto"
              innerClassName="items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-zinc-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700/80 shrink-0 max-w-full py-1.5 flex-nowrap"
            >
              {/* 축 1: 장부작성 */}
              <button
                type="button"
                onClick={() => {
                  setMainAxisTab('WRITE');
                  setActiveDeckTab(writeSubTab);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  mainAxisTab === 'WRITE'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>장부작성 (수입·지출)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold shrink-0">
                  {currentTransactions.length}건
                </span>
              </button>

              {/* 축 2: 분석 */}
              <button
                type="button"
                onClick={() => {
                  setMainAxisTab('ANALYSIS');
                  setActiveDeckTab('ANALYTICS');
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  mainAxisTab === 'ANALYSIS'
                    ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs border border-purple-100 dark:border-purple-900/50'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PieChart className="w-4 h-4 text-purple-500 shrink-0" />
                <span>분석 (현황·보고서)</span>
                {isDirtyAggregation && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse shrink-0">
                    재집계 필요
                  </span>
                )}
              </button>
            </ElmSld03>

            {/* Level 2 툴바 & 특화 도구 (가로넓이 초과 시 앞의 장부작성, 분석 버튼 다음줄로 [카드명세서대사, 고정수입관리, 통장내역일괄등록, ?] 한줄 버튼 표시 배치) */}
            {mainAxisTab === 'WRITE' ? (
              <ElmSld03
                showNavButtons={false}
                className="w-full 2xl:w-auto"
                innerClassName="justify-start 2xl:justify-end py-1 flex-nowrap"
              >
                {/* 특화 도구 1: 카드명세서 대사 서브시트 토글 */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveSpecialSheet((prev) => (prev === 'STATEMENT' ? 'NONE' : 'STATEMENT'))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    activeSpecialSheet === 'STATEMENT'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>카드명세서 대사</span>
                  {statementIntakeReviews.some((r) => r.needsReview) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="수집 검토 필요 건 존재" />
                  )}
                </button>

                {/* 특화 도구 2: 고정수입 관리 독립 팝업 오픈 (요구사항 3) */}
                <button
                  type="button"
                  onClick={() => setFixedIncomeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>고정수입 관리</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono">
                    {fixedIncomeRules.length}건
                  </span>
                </button>

                {/* 특화 도구 3: 통장 엑셀 일괄등록 모달 오픈 */}
                <button
                  type="button"
                  onClick={() => setBankImportModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>통장내역 일괄등록</span>
                </button>

                {/* [ELM-HLP-01] 반응형 기능안내 [?] 팝업레이어 토큰 적용 */}
                <ElmHlp01
                  title="통합 시계열 원장 (Cash Flow) 안내"
                  buttonText="원장 안내"
                  tooltip="시계열 통합 원장 및 3대 원칙 안내보기"
                  colorScheme="indigo"
                  align="right"
                >
                  <p className="text-[11px] leading-relaxed">
                    수입과 지출, 자산이동의 모든 입출금 흐름을 하나의 시간 순서대로 파악할 수 있는 단일 진실 공급원(SSOT)입니다.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141720] text-[10.5px] space-y-1 font-medium border border-slate-100 dark:border-[#1e2029]">
                    <div className="flex items-start gap-1">
                      <span className="text-pink-600 dark:text-pink-400 font-bold shrink-0">① 지출:</span>
                      <span>모임/개인 배타적 귀속 원칙 준수</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">② 수입:</span>
                      <span>확정 입금 및 정기 고정수입 자동 집계</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">③ 자산이동:</span>
                      <span>생활비 왜곡 방지를 위해 순수 지출에서 배타적 제외</span>
                    </div>
                  </div>
                </ElmHlp01>
              </ElmSld03>
            ) : (
              <ElmSld03
                showNavButtons={false}
                className="w-full 2xl:w-auto"
                innerClassName="justify-start 2xl:justify-end py-1 flex-nowrap"
              >
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisSubTab('STATUS');
                      setActiveDeckTab('ANALYTICS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      analysisSubTab === 'STATUS'
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5 text-purple-500" />
                    <span>현황 (타임라인)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisSubTab('REPORT');
                      setActiveDeckTab('ANALYTICS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      analysisSubTab === 'REPORT'
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    <span>보고서 (이력)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                      {analysisReports.length}건
                    </span>
                  </button>
                </div>
              </ElmSld03>
            )}
          </div>

          {mainAxisTab === 'ANALYSIS' && analysisSubTab === 'STATUS' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <ElmSld03
                showNavButtons={false}
                className="w-full sm:w-auto"
                innerClassName="items-center gap-2 py-0.5 flex-nowrap"
              >
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 shrink-0 whitespace-nowrap">
                  현황 집계 기간:
                </span>
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs shrink-0">
                  {(['MONTH', 'QUARTER', 'YEAR'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setAnalyticsPeriod(period)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        analyticsPeriod === period
                          ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                      }`}
                    >
                      {period === 'MONTH' ? '월간 (10월)' : period === 'QUARTER' ? '분기 (4Q)' : '연간 (2026)'}
                    </button>
                  ))}
                </div>
              </ElmSld03>

              {isDirtyAggregation && (
                <button
                  type="button"
                  onClick={() => {
                    setRecalculating(true);
                    setTimeout(() => {
                      setRecalculating(false);
                      setIsDirtyAggregation(false);
                      setNoticeMessage('✓ 2026년 10월 장부 최신 통계로 재집계가 완료되었습니다.');
                    }, 600);
                  }}
                  disabled={recalculating}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50 shrink-0 whitespace-nowrap"
                  title="과거 데이터 변동에 따른 온디맨드 경량 재집계"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  <span>{recalculating ? '집계 중...' : '재집계 실행'}</span>
                </button>
              )}
            </div>
          )}

          {mainAxisTab === 'ANALYSIS' && analysisSubTab === 'REPORT' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <div className="text-xs text-slate-600 dark:text-zinc-400">
                <strong>보고서 관리:</strong> 분석 처리 결과의 스냅샷 이력을 관리하고 최신 원장 데이터로 재수집을 수행합니다.
              </div>
              <button
                type="button"
                onClick={handleRecollectAndCreateReport}
                disabled={isRecollecting}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0 whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecollecting ? 'animate-spin' : ''}`} />
                <span>{isRecollecting ? '데이터 재수집 중...' : '🔄 최신 데이터 재수집 & 새 보고서 생성'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 1. [장부작성 (통합 시계열 원장 - Cash Flow Timeline)] */}
        {/* ==================================================================== */}
        {mainAxisTab === 'WRITE' && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* 특화 서브시트 1: 카드명세서 일괄 대사 및 수집 관리 패널 (토글 시 슬라이드 노출) */}
            {activeSpecialSheet === 'STATEMENT' && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-300 dark:border-indigo-800 shadow-md space-y-5 animate-in slide-in-from-top-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        카드 이용대금 명세서 첨부 등록
                      </h4>

                      {/* [ELM-HLP-01] 카드지출내역 관리 안내 */}
                      <ElmHlp01
                        title="카드지출내역 관리 안내"
                        tooltip="카드지출내역 및 명세서 대사 안내"
                        colorScheme="indigo"
                        headerIcon={CreditCard}
                        align="left"
                      >
                        <p className="text-[11px] leading-relaxed">
                          카드지출내역은 <strong>통합 시계열 원장(SSOT)</strong>의 한 구분정보를 카드사 명세서를 통해 일괄 등록하면서, 6대 카드사 청구서 대사 및 분할납부 관리를 지원하는 <strong>지출내역의 부분정보</strong>입니다.
                        </p>
                      </ElmHlp01>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSpecialSheet('NONE')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>패널 닫기</span>
                  </button>
                </div>

                {/* 명세서 파일 선택 및 OCR 분석 버튼 영역 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                        카드명세서 일괄등록
                      </span>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        청구 명세서 파일 첨부 및 OCR 분석
                      </h5>

                      {/* [ELM-HLP-01] 명세서 첨부 및 OCR 파싱 안내 */}
                      <ElmHlp01
                        title="명세서 첨부 및 OCR 파싱 안내"
                        tooltip="명세서 첨부 및 OCR 파싱 안내"
                        colorScheme="indigo"
                        headerIcon={CreditCard}
                        align="left"
                        width="sm:w-80"
                      >
                        <p className="text-[11px] leading-relaxed">
                          카드사별 규격에 구애받지 않고 청구 명세서 파일(이미지, PDF, HTML)을 첨부하면 OCR과 파싱 엔진이 자동으로 승인 일자, 가맹점, 금액, 할부 정보를 추출합니다.
                        </p>
                      </ElmHlp01>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSimulatingOcrUpload(true);
                        setTimeout(() => {
                          setIsSimulatingOcrUpload(false);
                          setNoticeMessage('✓ 우리카드 10월 청구명세서 파싱 완료: 총 38건 중 검토 필요 1건이 수집 리뷰 목록에 추가되었습니다.');
                        }, 800);
                      }}
                      disabled={isSimulatingOcrUpload}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Upload className={`w-3.5 h-3.5 ${isSimulatingOcrUpload ? 'animate-bounce' : ''}`} />
                      <span>{isSimulatingOcrUpload ? '명세서 분석 중...' : '명세서 파일 선택 및 OCR 분석'}</span>
                    </button>
                  </div>

                  {/* 수집 리뷰 요약 목록 */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                      수집 리뷰 요약 목록 (OCR 보정 및 원장 반영 대기 현황)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {statementIntakeReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                {rev.cardName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                {rev.statementMonth}
                              </span>
                            </div>
                            {rev.needsReview ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>OCR 보정 필요</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>수집 완료</span>
                              </span>
                            )}
                          </div>

                          {/* [요구사항 2.3] 월 결제금액, 건수, 할부 등 요소 기준 flex-wrap 줄바꿈 지원 */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 shrink-0">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">청구월</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                                {rev.statementMonth}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 shrink-0">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">결제금액</span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                ₩{rev.totalBilled.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 shrink-0">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">결제건수</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                                {rev.txCount}건
                              </span>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 shrink-0">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">일시불/할부</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                                {rev.lumpSumCount} / {rev.installmentCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-[10.5px] text-slate-400 font-mono truncate max-w-full sm:max-w-xs shrink-0">
                              첨부: {rev.rawFileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEditingStatement(JSON.parse(JSON.stringify(rev)));
                                setStatementEditModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 whitespace-nowrap shrink-0"
                            >
                              등록정보 편집 및 보정 ➔
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* [요구사항 2.4 & 2.5] 명세서 등록정보 간소화 및 검색결과 타이틀 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      명세서 등록정보
                    </h5>

                    {/* [ELM-HLP-01] 명세서 등록정보 필터 안내 */}
                    <ElmHlp01
                      title="명세서 등록정보 안내"
                      tooltip="명세서 등록정보 필터 안내"
                      colorScheme="indigo"
                      headerIcon={FileSearch}
                      align="left"
                      width="sm:w-80"
                    >
                      <p className="text-[11px] leading-relaxed">
                        수집된 각 카드사의 청구 승인 라인을 카드사, 할부 구분, 고정비 유형, 가맹점별로 다차원 검색하고 대사 현황을 조회할 수 있습니다.
                      </p>
                    </ElmHlp01>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">카드사 선택</span>
                      <select
                        value={statementFilterCard}
                        onChange={(e) => setStatementFilterCard(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-hidden"
                      >
                        <option value="ALL">전체 카드사</option>
                        <option value="신한">신한카드</option>
                        <option value="현대">현대카드</option>
                        <option value="우리">우리카드</option>
                        <option value="국민">KB국민카드</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">할부 여부</span>
                      <select
                        value={statementFilterInstallment}
                        onChange={(e) => setStatementFilterInstallment(e.target.value as any)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-hidden"
                      >
                        <option value="ALL">전체 구분</option>
                        <option value="LUMP">일시불만</option>
                        <option value="INSTALLMENT">할부만</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">비용 유형</span>
                      <select
                        value={statementFilterFixed}
                        onChange={(e) => setStatementFilterFixed(e.target.value as any)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-hidden"
                      >
                        <option value="ALL">전체 비용</option>
                        <option value="FIXED">고정비만</option>
                        <option value="VARIABLE">변동비만</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">가맹점 / 이용자</span>
                      <input
                        type="text"
                        value={statementSearchKeyword}
                        onChange={(e) => setStatementSearchKeyword(e.target.value)}
                        placeholder="검색어 입력..."
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 검색결과 타이틀 및 명세서 승인라인 테이블 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
                          명세서 세부 내역
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                          {filteredStatementLines.length}건
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                      {filteredStatementLines.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium">
                          조건에 해당하는 명세서 승인 내역이 없습니다.
                        </div>
                      ) : (
                        filteredStatementLines.map((line) => (
                          <div
                            key={line.id}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors flex flex-wrap items-center justify-between gap-2.5"
                          >
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                                {line.date}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] whitespace-nowrap border border-indigo-100 dark:border-indigo-900">
                                {line.cardName}
                              </span>
                              <strong className="text-slate-800 dark:text-zinc-200 whitespace-nowrap text-xs">
                                {line.merchant}
                              </strong>
                              {line.installment && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                                  {line.installment}
                                </span>
                              )}
                              {line.isFixedExpense && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold whitespace-nowrap">
                                  고정비
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                ₩{line.amount.toLocaleString()}
                              </span>
                              {line.discount > 0 && (
                                <span className="text-[10px] text-emerald-600 font-bold whitespace-nowrap">
                                  (-₩{line.discount.toLocaleString()} 할인)
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 통합 장부작성 툴바: 검색 + [카드보기 | 목록보기] + [+ 새 거래 등록] */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="w-full sm:w-72">
                <ElmInp04
                  value={searchWord}
                  onChange={setSearchWord}
                  placeholder="가맹점, 입출금자, 태그 검색..."
                />
              </div>

              <div className="flex items-center gap-2">
                {/* [요구사항 3] 카드보기 / 목록보기 뷰 모드 전환 토글 (가로너비 초과 뭉개짐 방지) */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setTxViewMode('CARD')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      txViewMode === 'CARD'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                    title="카드형 그리드 보기 (너비 초과 시 자연스러운 줄바꿈)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>카드보기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxViewMode('LIST')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      txViewMode === 'LIST'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                    title="테이블 목록보기"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>목록보기</span>
                  </button>
                </div>

                {/* [요구사항 6 & 7] 새 거래 등록 메인 액션 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    if (isLedgerClosed) {
                      setNoticeMessage('[마감 제한] 정산 및 회계가 마감된 장부에는 신규 거래를 등록할 수 없습니다.');
                      return;
                    }
                    if (!canAddTransaction) {
                      setNoticeMessage('[권한 제한] 조회 전용(VIEWER) 권한은 거래를 추가할 수 없습니다.');
                      return;
                    }
                    if (txTypeFilter === 'INCOME') {
                      setNewTxType('INCOME');
                      setNewTxIsAssetTransfer(false);
                    } else if (txTypeFilter === 'TRANSFER') {
                      setNewTxType('TRANSFER');
                      setNewTxIsAssetTransfer(true);
                    } else {
                      setNewTxType('EXPENSE');
                      setNewTxIsAssetTransfer(false);
                    }
                    setOcrScanResult(null);
                    setNewTxModalOpen(true);
                  }}
                  disabled={!canAddTransaction}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0 ${
                    canAddTransaction
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer shadow-indigo-600/20'
                      : 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isLedgerClosed ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>마감됨 (입력 잠금)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>새 거래 등록</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 통합 필터 바: 거래 유형 퀵 필터 세그먼트 + 동적 카테고리 필터 + 자산이동 분리 옵션 */}
            <div className="space-y-2.5 border-y border-slate-100 dark:border-zinc-800/80 py-3">
              {/* 1행: 거래 유형 퀵 필터 세그먼트 칩 */}
              <ElmSld03
                showNavButtons={false}
                className="w-full"
                innerClassName="items-center gap-1.5 sm:gap-2 pb-0.5 flex-nowrap"
              >
                <button
                  type="button"
                  onClick={() => setTxTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    txTypeFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>전체</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    txTypeFilter === 'ALL' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}>
                    {currentTransactions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxTypeFilter('EXPENSE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    txTypeFilter === 'EXPENSE'
                      ? 'bg-pink-600 text-white shadow-xs font-black'
                      : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-950/70 border border-pink-200 dark:border-pink-900/60'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>지출</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    txTypeFilter === 'EXPENSE' ? 'bg-pink-700 text-pink-100' : 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
                  }`}>
                    {currentTransactions.filter((t) => t.type === 'EXPENSE' && !t.isAssetTransfer).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxTypeFilter('INCOME')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    txTypeFilter === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>수입</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    txTypeFilter === 'INCOME' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {currentTransactions.filter((t) => t.type === 'INCOME' && !t.isAssetTransfer).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxTypeFilter('TRANSFER')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    txTypeFilter === 'TRANSFER'
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/70 border border-purple-200 dark:border-purple-900/60'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>자산이동</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    txTypeFilter === 'TRANSFER' ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  }`}>
                    {currentTransactions.filter((t) => t.isAssetTransfer || t.type === 'TRANSFER').length}
                  </span>
                </button>
              </ElmSld03>

              {/* 2행: 동적 카테고리 필터 + 자산이동 분리 체크박스 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100/80 dark:border-zinc-800/60">
                <ElmSld03
                  showNavButtons={false}
                  className="flex-1 min-w-0"
                  innerClassName="items-center gap-1.5 py-0.5 flex-nowrap"
                >
                  <ElmFlt01
                    label="전체 카테고리"
                    selected={categoryFilter === 'ALL'}
                    onClick={() => setCategoryFilter('ALL')}
                  />
                  {availableCategories.map((cat) => (
                    <ElmFlt01
                      key={cat}
                      label={cat}
                      selected={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                    />
                  ))}
                </ElmSld03>

                <label
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 cursor-pointer select-none shrink-0"
                  title="생활비 지출 집계에서 자산이동 내역을 분리합니다"
                >
                  <input
                    type="checkbox"
                    checked={excludeAssetTransfer}
                    onChange={(e) => setExcludeAssetTransfer(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                  />
                  <span>자산이동</span>
                </label>
              </div>
            </div>

            {/* [요구사항 3] 가로너비 초과 뭉개짐 방지: 카드형 그리드 뷰 (CARD) vs 테이블 목록 뷰 (LIST) 분기 */}
            {txViewMode === 'CARD' ? (
              filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium border border-slate-200 dark:border-zinc-800 rounded-2xl">
                  조건에 해당하는 거래 내역이 없습니다.
                </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTxForProofs(tx)}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-700/60 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-3 relative"
                        >
                          {/* 카드 상단: 아이콘 + 일자 + 카테고리 뱃지 */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                  tx.isAssetTransfer
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300'
                                    : tx.type === 'EXPENSE'
                                    ? 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-300'
                                    : tx.type === 'INCOME'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300'
                                }`}
                              >
                                {tx.isAssetTransfer ? (
                                  <ArrowRightLeft className="w-4 h-4" />
                                ) : tx.type === 'EXPENSE' ? (
                                  <TrendingDown className="w-4 h-4" />
                                ) : tx.type === 'INCOME' ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <ArrowRightLeft className="w-4 h-4" />
                                )}
                              </div>
                              <span className="font-mono text-xs text-slate-400">{tx.date}</span>
                            </div>

                            {tx.category && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 font-bold shrink-0">
                                {tx.category}
                              </span>
                            )}
                          </div>

                          {/* 카드 중단: 제목 & 금액 */}
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                              {tx.title}
                            </h4>
                            <div
                              className={`font-mono font-black text-lg ${
                                tx.isAssetTransfer
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : tx.type === 'EXPENSE'
                                  ? 'text-pink-600 dark:text-pink-400'
                                  : tx.type === 'INCOME'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : '↔'}₩{tx.amount.toLocaleString()}
                            </div>
                          </div>

                          {/* 결제자 및 명세서 카드 정보 */}
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                            <span>결제: <strong className="text-slate-700 dark:text-zinc-200">{tx.payerName}</strong></span>
                            {tx.statementCardName && (
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                                {tx.statementCardName}
                              </span>
                            )}
                          </div>

                          {/* 뱃지 및 상태 (자산이동, 명세서 대사, 증빙) - 자연스러운 줄바꿈 flex-wrap */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {tx.isAssetTransfer && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                <ArrowRightLeft className="w-2.5 h-2.5" />
                                <span>자산이동</span>
                              </span>
                            )}

                            {tx.reconciliationStatus === 'CONFIRMED' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>대사 확정</span>
                              </span>
                            )}

                            {tx.reconciliationStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>대사 대기</span>
                              </span>
                            )}

                            {tx.proofs && tx.proofs.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                                <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                <span>증빙 {tx.proofs.length}건</span>
                              </span>
                            )}

                            {tx.tagNames.map((tag) => (
                              <span
                                key={tag}
                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  tag.includes('대납') || tag.includes('정산')
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* 카드 하단 링크 */}
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>상세 및 영수증 확인</span>
                            <span className="text-pink-600 dark:text-pink-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>거래상세</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* 지출내역 목록 테이블 (클릭 시 단일 지출 3단 상세조회 모달 연결) */
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      조건에 해당하는 지출 내역이 없습니다.
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTxForProofs(tx)}
                        className="p-3.5 sm:p-4 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4"
                      >
                        {/* 상단/좌측: 아이콘 + 제목 + 메타데이터 + 뱃지 (모바일 가로깨짐 방지 및 줄바꿈 지원) */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          {/* 거래 유형 아이콘 */}
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0 ${
                              tx.isAssetTransfer
                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300'
                                : tx.type === 'EXPENSE'
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300'
                                : tx.type === 'INCOME'
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300'
                            }`}
                          >
                            {tx.isAssetTransfer ? (
                              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : tx.type === 'EXPENSE' ? (
                              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : tx.type === 'INCOME' ? (
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </div>

                          {/* 텍스트 및 속성 정보 영역 */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            {/* [요구사항 4] 1행: 항목명 + 모바일 전용 금액 (모바일에서 넘침 없이 우측 끝 정렬) */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {tx.title}
                              </span>

                              {/* 모바일 전용 금액 표시 (sm:hidden) */}
                              <div className="sm:hidden text-right shrink-0">
                                <span
                                  className={`font-mono font-black text-sm block ${
                                    tx.isAssetTransfer
                                      ? 'text-purple-600 dark:text-purple-400'
                                      : tx.type === 'EXPENSE'
                                      ? 'text-pink-600 dark:text-pink-400'
                                      : tx.type === 'INCOME'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-indigo-600 dark:text-indigo-400'
                                  }`}
                                >
                                  {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : '↔'}₩
                                  {tx.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* [요구사항 4] 2행: 속성별 줄바꿈 1 (일자, 결제자, 카테고리/결제수단, 메모) */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                              <span className="font-mono text-slate-400">{tx.date}</span>
                              <span>•</span>
                              <span>
                                결제: <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{tx.payerName}</strong>
                              </span>
                              {tx.category && (
                                <>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-600 dark:text-zinc-300 font-medium">
                                    {tx.category}
                                  </span>
                                </>
                              )}
                              {tx.statementCardName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600 dark:text-zinc-300 text-[10px]">
                                    {tx.statementCardName}
                                  </span>
                                </>
                              )}
                              {tx.note && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-xs">
                                    {tx.note}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* [요구사항 4] 3행: 속성별 줄바꿈 2 (대사 상태 뱃지, 증빙 연결, 자산이동, 태그) */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {tx.isAssetTransfer && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                  <span>자산이동 (생활비제외)</span>
                                  {tx.relatedTransferId && (
                                    <span className="text-[9px] font-mono text-purple-500 dark:text-purple-400">
                                      · 1:1 페어링
                                    </span>
                                  )}
                                </span>
                              )}

                              {tx.reconciliationStatus === 'CONFIRMED' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>명세서 대사 확정</span>
                                  {tx.statementDiscount && tx.statementDiscount > 0 && (
                                    <span className="text-emerald-700 dark:text-emerald-300 font-extrabold font-mono ml-0.5">
                                      -₩{tx.statementDiscount.toLocaleString()} 할인
                                    </span>
                                  )}
                                </span>
                              )}

                              {tx.reconciliationStatus === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>영수증 선등록 (명세서 대사 대기)</span>
                                </span>
                              )}

                              {tx.proofs && tx.proofs.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                                  <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                  <span>수집방법 {tx.proofs.length}건 연결</span>
                                </span>
                              )}

                              {/* 태그 목록 */}
                              {tx.tagNames.map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                    tag.includes('대납') || tag.includes('정산')
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                  }`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* [요구사항 4] 데스크톱 금액 표시 영역: 속성별 줄바꿈 (금액, 카테고리, 상세링크) */}
                        <div className="hidden sm:flex flex-col items-end justify-center shrink-0 text-right space-y-0.5">
                          <div
                            className={`font-mono font-black text-base lg:text-lg ${
                              tx.isAssetTransfer
                                ? 'text-purple-600 dark:text-purple-400'
                                : tx.type === 'EXPENSE'
                                ? 'text-pink-600 dark:text-pink-400'
                                : tx.type === 'INCOME'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : '↔'} ₩
                            {tx.amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                            <span className="font-semibold text-slate-600 dark:text-zinc-400">{tx.category}</span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                              지출상세 조회 ➔
                            </span>
                          </div>
                        </div>

                        {/* 모바일 전용 상세조회 링크 줄바꿈 */}
                        <div className="sm:hidden flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/60 text-[10px] text-slate-400">
                          <span>클릭하여 멀티 증빙·카드 대사 확인</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                            <span>거래상세</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        {/* ==================================================================== */}
        {/* 2. [분석 탭 (ANALYTICS: 3.2.1 현황 & 3.2.2 보고서)] */}
        {/* ==================================================================== */}
        {mainAxisTab === 'ANALYSIS' && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* 3.2.1 현황 분석 (수입/지출 기준 일간집계 & 6대 카드사 골든소스 SSOT 대사) */}
            {analysisSubTab === 'STATUS' && (
              <div className="space-y-6">
            {/* 2.4.2 스마트 재집계 엔진 알림 (Dirty Checksum) */}
            {isDirtyAggregation && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-100">
                      수입·지출 데이터 변동 감지 (재집계 필요 상태)
                    </h5>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      최근 거래 등록 및 통장 수집으로 집계 체크섬이 변경되었습니다. 실시간 연산 과부하를 막기 위해 온디맨드로 최신 통계를 재집계합니다.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRecalculating(true);
                    setTimeout(() => {
                      setRecalculating(false);
                      setIsDirtyAggregation(false);
                      setNoticeMessage('✓ 2026년 10월 장부 최신 통계로 재집계가 완료되었습니다.');
                    }, 600);
                  }}
                  disabled={recalculating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  <span>{recalculating ? '집계 처리 중...' : '지금 최신 데이터로 재집계 실행'}</span>
                </button>
              </div>
            )}

            {/* [시나리오 2.4.3] 장부 대상 총 분석자료: 일간 집계 (Daily Aggregation 피드) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px]">
                      시나리오 2.4.3
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      10월 일간 집계 타임라인 (Daily Aggregation Feed)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    건별 연산 부담을 줄이고 캐시 무결성을 유지하기 위해 일자별 수입/지출 총합과 주요 특이사항을 일간 집계 배치로 제공합니다.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-slate-400">
                  집계 범위: 2026.10.01 ~ 2026.10.13 ({dailyAggregations.length}일간)
                </span>
              </div>

              {/* 일간 집계 타임라인 테이블 */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 grid grid-cols-12 gap-2">
                  <div className="col-span-2">날짜 (요일)</div>
                  <div className="col-span-2 text-right">수입 합계 (+)</div>
                  <div className="col-span-2 text-right">지출 합계 (-)</div>
                  <div className="col-span-2 text-right">순수지 (Net)</div>
                  <div className="col-span-1 text-center">건수</div>
                  <div className="col-span-3">주요 발생 특이사항</div>
                </div>

                {dailyAggregations.map((day) => {
                  const net = day.totalIncome - day.totalExpense;
                  return (
                    <div
                      key={day.date}
                      className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 text-xs transition-colors"
                    >
                      <div className="col-span-2 font-mono font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span>{day.date} ({day.dayOfWeek})</span>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-emerald-600">
                        {day.totalIncome > 0 ? `+₩${day.totalIncome.toLocaleString()}` : '-'}
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-rose-600">
                        {day.totalExpense > 0 ? `-₩${day.totalExpense.toLocaleString()}` : '-'}
                      </div>

                      <div className={`col-span-2 text-right font-mono font-bold ${
                        net > 0 ? 'text-emerald-600' : net < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {net !== 0 ? `₩${net.toLocaleString()}` : '0원'}
                      </div>

                      <div className="col-span-1 text-center font-mono text-slate-500">
                        {day.txCount}건
                      </div>

                      <div className="col-span-3 flex flex-wrap items-center gap-1 min-w-0">
                        {day.notableItems.length === 0 ? (
                          <span className="text-slate-300 dark:text-zinc-600 text-[10.5px]">무지출 데이</span>
                        ) : (
                          day.notableItems.map((note, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate max-w-[140px]"
                            >
                              {note}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10월 6대 카드사 명세서 분석 Bento 그리드 (신뢰도 100% 골든 소스 SSOT 대사) */}
            <div className="space-y-5">
            {/* Bento 상단 총괄 헤더 카드 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-zinc-950 text-white shadow-xl border border-indigo-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-400/30">
                      신뢰도 100% 골든 소스 (SSOT)
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      2026년 10월 6대 카드사 실제 청구 전수 집계
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    10월 총 카드 청구액{' '}
                    <span className="text-amber-400 font-mono">₩6,029,542</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-right">
                    <span className="text-[10px] text-slate-300 block">청구할인/캐시백 혜택</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                      -₩70,824 절감
                    </span>
                  </div>
                </div>
              </div>

              {/* 지출 구조 분해 칩 바 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block">일시불 (당월소비)</span>
                  <div className="font-mono font-bold text-slate-200">
                    ₩3,994,068 <span className="text-[10px] text-indigo-300 font-normal">(66.2%)</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block">할부 청구액</span>
                  <div className="font-mono font-bold text-amber-300">
                    ₩1,266,672 <span className="text-[10px] text-amber-400/80 font-normal">(21.0%)</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block">리볼빙 (약정 100%)</span>
                  <div className="font-mono font-bold text-sky-300">
                    ₩690,942 <span className="text-[10px] text-sky-400/80 font-normal">(11.5%)</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block">금융수수료/연회비</span>
                  <div className="font-mono font-bold text-rose-300">
                    ₩11,040 <span className="text-[10px] text-rose-400/80 font-normal">(0.2%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 그리드 핵심 분석 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bento 1: 11월 도래 완납 세이빙 경보 (Saving Sentinel) */}
              <div className="md:col-span-2 p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🎉
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                        11월 도래 할부 완납 세이빙 경보 (Saving Sentinel)
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        10월 최종회차 납부로 11월부터 청구가 완전히 사라지는 고정비
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-black font-mono">
                    -₩604,083원 절감!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        우리카드: 건강보험_엘카드
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        3/3회차 최종 완납
                      </span>
                    </div>
                    <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₩204,083 <span className="text-[11px] text-slate-400 font-normal">/월 소멸</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
                      공과금 분할납부 3회차 만기로 11월부터 계좌 출금액 20.4만 원 영구 감소.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        현대카드: 밝은미소이치과의원
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        3/3회차 최종 완납
                      </span>
                    </div>
                    <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₩400,000 <span className="text-[11px] text-slate-400 font-normal">/월 소멸</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
                      총 120만 원 치과 진료비 분납 완료! 11월 현대카드 청구 부담 71% 급감.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/50 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    💡 <strong>차월 추가 완납 예정</strong>: 삼성카드 딴지그룹(34.5만 원 3/3회차) + 농협 네이버페이(6.8만 원 6/6회차)
                  </span>
                  <span className="font-mono font-bold text-xs">총 41.3만 원 추가 완납 대기</span>
                </div>
              </div>

              {/* Bento 2: 리볼빙 및 고위험 수수료 방어 (Risk Sentinel) */}
              <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                      리볼빙 & 수수료 누수 방어
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      이자 누수 위험 선제적 차단 상태
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">KB국민 리볼빙 약정</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        약정비율 100%
                      </span>
                    </div>
                    <div className="text-sm font-mono font-extrabold text-amber-600 dark:text-amber-400">
                      ₩690,942 <span className="text-[10px] text-slate-400 font-normal">(당월 전액청구)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                      * 리볼빙 수수료율 <strong>연 14.1%</strong> 활성 상태이나, 약정비율 100% 설정으로 이월이자 <strong>0원 완벽 방어</strong> 중.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">금융 수수료 실청구액</span>
                      <span className="font-mono font-bold text-rose-600">₩11,040</span>
                    </div>
                    <ul className="text-[10.5px] text-slate-500 dark:text-zinc-400 space-y-0.5 list-disc list-inside">
                      <li>현대카드 네이버 본인 연회비: 10,000원</li>
                      <li>NH농협 SKT 단말기 할부수수료: 1,040원 (연 5.9%)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 3: 고정비 & 정기결제 구조 (Fixed Expense Radar) */}
            <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    📡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-100">
                      10월 고정비 & 정기결제 레이더 (Fixed Expense Radar)
                    </h4>
                    <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                      자동이체 및 정기결제로 빠져나간 필수 고정비 전수 분석
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block">고정비 합계 (총 지출의 32.1%)</span>
                  <span className="text-base sm:text-lg font-black font-mono text-indigo-950 dark:text-white">
                    ₩1,933,767원
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400">보습학원 (교육비)</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">₩1,060,000</div>
                  <span className="text-[9.5px] text-indigo-600">우리카드 (2건)</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400">KB아파트관리비</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">₩355,140</div>
                  <span className="text-[9.5px] text-indigo-600">KB국민 (자동납부)</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400">4대 사회보험</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">₩302,671</div>
                  <span className="text-[9.5px] text-indigo-600">우리카드 (2건)</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400">정기 보험료 (보장)</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">₩300,825</div>
                  <span className="text-[9.5px] text-indigo-600">우리카드 (다둥이)</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400">통신/도시가스/K패스</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">₩218,200</div>
                  <span className="text-[9.5px] text-indigo-600">농협·국민·BC바로</span>
                </div>
              </div>
            </div>

            {/* Bento 4: 6대 카드사별 세부 명세서 아코디언 피드 (Card Statements Feed) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    6대 카드사별 확정 명세서 세부 내역 및 결제 계좌
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">카드명을 클릭하여 상세 승인 내역 확인</span>
              </div>

              {/* 카드사 탭 선택 버튼 */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {OCTOBER_CARD_STATEMENTS.map((card) => {
                  const isSelected = expandedCardCode === card.cardCode;
                  return (
                    <button
                      key={card.cardCode}
                      type="button"
                      onClick={() => setExpandedCardCode(isSelected ? null : card.cardCode)}
                      className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102 dark:bg-zinc-800 dark:border-indigo-500'
                          : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black truncate">{card.cardName}</span>
                        {card.fees > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="수수료 발생" />
                        )}
                      </div>
                      <div className="font-mono font-extrabold text-xs">
                        ₩{(card.totalBilled / 10000).toFixed(0)}만 원
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 선택된 카드사 세부 명세서 상세 패널 */}
              {OCTOBER_CARD_STATEMENTS.filter((c) => c.cardCode === expandedCardCode).map((card) => (
                <div
                  key={card.cardCode}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 animate-in fade-in-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white break-keep">
                          {card.cardName} {card.cardAlias}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold whitespace-nowrap">
                          결제일: {card.paymentDate}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono break-keep">
                        <span className="text-slate-500 font-sans font-medium text-[11px] shrink-0">출금계좌:</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#141720] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#1e2029] whitespace-nowrap">
                          {card.account}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">당월 최종 청구금액</span>
                      <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        ₩{card.totalBilled.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* 세부 구성 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                      <span className="text-[10.5px] text-slate-400 block">일시불</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        ₩{card.lumpSum.toLocaleString()}원
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                      <span className="text-[10.5px] text-slate-400 block">할부</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₩{card.installment.toLocaleString()}원
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                      <span className="text-[10.5px] text-slate-400 block">리볼빙 / 수수료</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {card.revolving ? `₩${card.revolving.toLocaleString()} (리볼빙)` : `₩${card.fees.toLocaleString()} (수수료)`}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                      <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 block">청구할인 혜택</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        -₩{card.benefitDiscount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {card.installmentAlert && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium">{card.installmentAlert}</span>
                    </div>
                  )}

                  {/* 주요 승인 항목 리스트 */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                      주요 승인 내역 및 대사 연결 타겟
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                      {card.notableItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-slate-800 dark:text-zinc-200 font-medium truncate">
                              {item}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 border border-emerald-200 dark:border-emerald-800">
                            대사 연계 완료
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bento 5: 영수증-명세서 다중 증빙 대사 엔진 & 무비용 스토리지 상태 카드 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base">
                      영수증-명세서 대사 수렴 엔진 & 무비용 스토리지 (Zero-Cost Storage Tiering)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      카드명세서 단일진실원천(SSOT) 확정 및 30일 경과 증빙 tarball 온디맨드 압축 해제
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                    ✓ 홈서버 2GB RAM OOM 방어 가동중
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>전역 원자 지출 불변 원장 (SSOT)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    실제 결제 사건은 시스템 전체에 1건만 불변 기록됩니다. 장부에서 삭제되더라도 즉시 영구 파기되지 않고 <code className="text-amber-400 font-mono">UNALLOCATED</code> 상태로 보존됩니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>미아 데이터(Orphan) 수명주기</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    어떤 장부에도 귀속되지 않은 미아 데이터는 <strong>90일 TTL 유예 기간</strong> 동안 안전하게 보존된 후 가비지 컬렉션(GC) 스케줄러를 통해 자동 정리됩니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>운영비 0원 온디맨드 스토리지</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    30일 초과 과거 증빙은 <code className="text-sky-300 font-mono">proofs_2026_09.tar.gz</code> 압축 패킹되어 용량을 92% 절감하고, 사용자 조회 시에만 임시 메모리에 일시 해제 후 즉시 파기합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
            </div>
          )}

          {/* 3.2.2 보고서 : 분석처리결과 이력정보를 관리하는 기능 (재수집, 이력관리) */}
          {analysisSubTab === 'REPORT' && (
            <div className="space-y-6 animate-in fade-in-50">
              {/* 3.2.2 보고서 안내 배너 & 재수집/내보내기 액션 헤더 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px]">
                        분석 보고서
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        가계부 분석 결과 이력관리 및 온디맨드 재수집 엔진
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      수입·지출 원장 및 6대 카드사 명세서 대사 결과를 스냅샷으로 영구 보존하며, 원장 데이터 변동 시 온디맨드로 최신 데이터를 재수집하여 신규 버전을 발행합니다.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRecollectAndCreateReport}
                      disabled={isRecollecting}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRecollecting ? 'animate-spin' : ''}`} />
                      <span>{isRecollecting ? '데이터 재수집 중...' : '🔄 최신 데이터 재수집 실행'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNoticeMessage('✓ 전체 분석 보고서 이력이 CSV/Excel 파일로 다운로드되었습니다.');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-purple-600" />
                      <span>보고서 내보내기</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 최신 활성 스냅샷 요약 카드 (Summary Bento) */}
              <div className="p-5 rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-zinc-950 text-white shadow-xl border border-purple-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-black border border-purple-400/30">
                        LATEST ACTIVE SNAPSHOT
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {analysisReports[0]?.title}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mt-1">
                      버전 {analysisReports[0]?.version} · 집계기간 {analysisReports[0]?.period}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>무결성 감사 인증완료</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">당시 총 수입</span>
                    <div className="font-mono text-base font-extrabold text-emerald-400">
                      +₩{analysisReports[0]?.totalIncome.toLocaleString()}원
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">당시 순수 지출</span>
                    <div className="font-mono text-base font-extrabold text-rose-400">
                      -₩{analysisReports[0]?.totalExpense.toLocaleString()}원
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">순수지 (Net Savings)</span>
                    <div className="font-mono text-base font-extrabold text-purple-300">
                      +₩{analysisReports[0]?.netSavings.toLocaleString()}원
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">6대 카드사 청구합계</span>
                    <div className="font-mono text-base font-extrabold text-amber-300">
                      ₩{analysisReports[0]?.cardBilledTotal.toLocaleString()}원
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10.5px] font-bold text-slate-400 block">핵심 분석 요약</span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {analysisReports[0]?.summaryNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 보고서 스냅샷 이력 관리 목록 (History Management Table & Cards) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>분석 보고서 스냅샷 이력 ({analysisReports.length}회차)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      재수집 시점마다 과거 보고서가 영구 보존되어 결산 변경 추이를 상시 대조할 수 있습니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                      총 {analysisReports.length}개 버전
                    </span>

                    {/* 카드보기 / 목록보기 아이콘 토글 컨트롤러 (모바일에서는 카드보기만 단독 표시) */}
                    <div className="hidden sm:flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setReportViewMode('CARD')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          reportViewMode === 'CARD'
                            ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                        title="카드형 그리드 보기"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportViewMode('LIST')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          reportViewMode === 'LIST'
                            ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                        title="테이블 목록형 보기"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 모바일 화면용 카드 전용 뱃지 */}
                    <div className="sm:hidden px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" />
                      <span>카드보기</span>
                    </div>
                  </div>
                </div>

                {/* 1. 모바일이거나 reportViewMode === 'CARD'일 때: 카드형 그리드 뷰어 */}
                <div className={`${reportViewMode === 'CARD' ? 'block' : 'block sm:hidden'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysisReports.map((rep, idx) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-purple-300 dark:hover:border-purple-800/80 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px]">
                                {rep.version}
                              </span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                  최신
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rep.createdAt}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                            {rep.title}
                          </h5>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 block">
                            집계기간: {rep.period}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-400 font-medium">총 수입</span>
                            <span className="font-mono font-bold text-emerald-600">
                              +₩{rep.totalIncome.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-400 font-medium">순수 지출</span>
                            <span className="font-mono font-bold text-rose-600">
                              -₩{rep.totalExpense.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">순수지(Net)</span>
                            <span className="font-mono font-black text-purple-600 dark:text-purple-400">
                              +₩{rep.netSavings.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[11px] font-mono text-slate-400">
                            원장 {rep.txCount}건 · 카드 ₩{(rep.cardBilledTotal / 10000).toFixed(0)}만
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedReportDetail(rep)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                          >
                            상세 열람
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. 데스크톱에서 reportViewMode === 'LIST'일 때: 테이블 목록 뷰어 */}
                <div className={`${reportViewMode === 'LIST' ? 'hidden sm:block' : 'hidden'}`}>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 grid grid-cols-12 gap-2">
                      <div className="col-span-3">버전 / 보고서명</div>
                      <div className="col-span-2">집계 기간</div>
                      <div className="col-span-2 text-right">총 수입 / 순수 지출</div>
                      <div className="col-span-2 text-right">순수지 (Net)</div>
                      <div className="col-span-1 text-center">원장 건수</div>
                      <div className="col-span-2 text-center">관리 액션</div>
                    </div>

                    {analysisReports.map((rep, idx) => (
                      <div
                        key={rep.id}
                        className="p-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 text-xs transition-colors"
                      >
                        <div className="col-span-3 space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px]">
                              {rep.version}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                최신
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {rep.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            발행: {rep.createdAt}
                          </span>
                        </div>

                        <div className="col-span-2 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                          {rep.period}
                        </div>

                        <div className="col-span-2 text-right space-y-0.5">
                          <span className="font-mono font-bold text-emerald-600 block">
                            +₩{rep.totalIncome.toLocaleString()}
                          </span>
                          <span className="font-mono font-bold text-rose-600 block">
                            -₩{rep.totalExpense.toLocaleString()}
                          </span>
                        </div>

                        <div className="col-span-2 text-right">
                          <span className="font-mono font-black text-purple-600 dark:text-purple-400 block">
                            +₩{rep.netSavings.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            카드: ₩{(rep.cardBilledTotal / 10000).toFixed(0)}만
                          </span>
                        </div>

                        <div className="col-span-1 text-center font-mono text-slate-500 font-bold">
                          {rep.txCount}건
                        </div>

                        <div className="col-span-2 flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReportDetail(rep)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                          >
                            상세 열람
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* ==================================================================== */}
      {/* 8대 핵심 독립 모달 레이어 (src/components/ledger/modals/ 모듈화) */}
      {/* ==================================================================== */}
      {/* 1. Bento 멀티증빙 원자 대사 및 고해상도 라이트박스 뷰어 모달 */}
      <LedgerProofReconcileModal
        selectedTx={selectedTxForProofs}
        onClose={() => {
          setSelectedTxForProofs(null);
          setSelectedProofItemId(null);
        }}
        currentLedger={currentLedger}
        onCopyNotice={setNoticeMessage}
      />

      {/* 2. [3.2.2 보고서] 분석 스냅샷 상세 열람 모달 */}
      <LedgerReportDetailModal
        report={selectedReportDetail}
        onClose={() => setSelectedReportDetail(null)}
        onExportPdf={(rep) => {
          setNoticeMessage(`✓ [${rep.version}] 보고서가 PDF/인쇄 형식으로 변환되었습니다.`);
        }}
      />

      {/* 3. 모아보고 금전관리 3대 원칙 안내 레이어 모달 */}
      <LedgerDomainPrinciplesModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      {/* 4. 참여자 관리 및 RBAC 권한 설정 바텀시트 / 모달 */}
      <LedgerMemberManageModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        currentLedger={currentLedger}
        members={currentMembers}
        canManageMembers={canManageMembers}
        onRoleChange={handleRoleChange}
        onRemoveMember={handleRemoveMember}
        onAddMember={handleAddMemberDirect}
      />

      {/* 5. 새 거래(수입/지출/자산이동) 등록 모달 */}
      <LedgerNewTransactionModal
        isOpen={newTxModalOpen}
        onClose={() => setNewTxModalOpen(false)}
        currentLedger={currentLedger}
        initialType={newTxType}
        onAddTransaction={(tx) => {
          setTransactionsMap((prev) => ({
            ...prev,
            [activeLedgerId]: [tx, ...(prev[activeLedgerId] || [])],
          }));
          setNoticeMessage(
            `✓ "${currentLedger.title}"에 ${tx.type === "EXPENSE" ? "지출" : tx.type === "INCOME" ? "수입" : "자산이동"} 내역(₩${tx.amount.toLocaleString()})이 성공적으로 기록되었습니다.`
          );
        }}
        onAddFixedIncomeRule={(rule) => {
          setFixedIncomeRules((prev) => [...prev, rule]);
        }}
        onNotice={setNoticeMessage}
      />

      {/* 6. 고정수입 관리 & 자동 입금 규칙 전용 독립 팝업 모달 */}
      <LedgerFixedIncomeModal
        isOpen={fixedIncomeModalOpen}
        rules={fixedIncomeRules}
        onClose={() => setFixedIncomeModalOpen(false)}
        currentLedgerTitle={currentLedger.title}
        currentLedgerId={currentLedger.id}
        onSaveRule={handleSaveRuleDirect}
        onDeleteRule={handleDeleteRule}
        onToggleNotify={(ruleId) => {
          setFixedIncomeRules((prev) =>
            prev.map((r) => (r.id === ruleId ? { ...r, notifyEnabled: !r.notifyEnabled } : r))
          );
          setNoticeMessage("✓ 고정수입 알림 상태가 변경되었습니다.");
        }}
        onCopyNotice={setNoticeMessage}
      />

      {/* 7. 카드 이용대금 명세서 등록정보 편집 및 보정 모달 */}
      <LedgerStatementEditModal
        isOpen={statementEditModalOpen}
        statement={activeEditingStatement}
        onClose={() => setStatementEditModalOpen(false)}
        onSave={(updated) => {
          setStatementIntakeReviews((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          setActiveEditingStatement(null);
          setStatementEditModalOpen(false);
          setNoticeMessage(`✓ [${updated.cardName}] 명세서 보정 정보가 안전하게 저장되었습니다.`);
        }}
      />

      {/* 8. 통장 거래내역 일괄등록 및 대사 관리 팝업 모달 */}
      <LedgerBankImportModal
        isOpen={bankImportModalOpen}
        onClose={() => setBankImportModalOpen(false)}
        bankParsedItems={bankParsedItems}
        registeredBankAccounts={registeredBankAccounts}
        detectedAutoAccount={detectedAutoAccount}
        unregisteredAccounts={unregisteredAccounts}
        onSimulateBankUpload={handleSimulateBankUpload}
        onSyncRefresh={() => setNoticeMessage("✓ 최신 계좌 거래내역을 성공적으로 동기화하였습니다.")}
        onRegisterNewAccount={handleRegisterNewAccount}
        onMapToPrimaryAccount={handleMapToPrimaryAccount}
        onToggleSelectAll={() => {
          const allSelected = bankParsedItems.length > 0 && bankParsedItems.every((i) => i.selected);
          handleToggleSelectAllBankItems(!allSelected);
        }}
        onToggleSelectItem={handleToggleBankItemSelect}
        onUpdateBankItem={(id, field, value) => {
          handleUpdateBankItem(id, field, value);
        }}
        onBatchImport={handleBatchImportBankTransactions}
      />

      {/* 9. 새 장부 개설 모달 (회계 프로세스 & 디자인 설정) */}
      <LedgerNewLedgerModal
        isOpen={newLedgerModalOpen}
        onClose={() => setNewLedgerModalOpen(false)}
        onCreateLedger={(newBook) => {
          setLedgers((prev) => [newBook, ...prev]);
          setActiveLedgerId(newBook.id);
          setMembersMap((prev) => ({
            ...prev,
            [newBook.id]: [
              {
                id: `m-${Date.now()}`,
                name: "구본영(호스트/나)",
                role: "OWNER",
                isGuest: false,
                joinedAt: new Date().toISOString().slice(0, 10),
                avatar: "👨‍💼",
              },
            ],
          }));
          setTransactionsMap((prev) => ({
            ...prev,
            [newBook.id]: [],
          }));
          setNoticeMessage(`✓ 새 장부 "${newBook.title}"이(가) 책꽂이에 등록되었습니다.`);
        }}
      />

      {/* 10. 북커버 및 색상 변경 모달 */}
      <LedgerEditCoverModal
        isOpen={editCoverModalOpen}
        onClose={() => setEditCoverModalOpen(false)}
        initialTitle={editCoverTitle}
        initialDesignStyle={editCoverDesignStyle}
        initialColor={editCoverColor}
        onSave={({ title, designStyle, color }) => {
          setLedgers((prev) =>
            prev.map((book) =>
              book.id === editingLedgerId
                ? {
                    ...book,
                    title,
                    designStyle,
                    customCoverColor: color,
                  }
                : book
            )
          );
          setEditCoverModalOpen(false);
          setNoticeMessage(`✓ 장부 북커버 디자인이 성공적으로 업데이트되었습니다.`);
        }}
      />
    </div>
  );
};