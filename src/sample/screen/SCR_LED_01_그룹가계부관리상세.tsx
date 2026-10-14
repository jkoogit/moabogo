import React, { useState, useMemo, useRef } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmFlt01,
  ElmCnt01,
  ElmBsh01,
  ElmChk01,
} from '../elements/Tokens';
import {
  Wallet,
  Users,
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  ChevronLeft,
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
} from 'lucide-react';

// ============================================================================
// 도메인 타입 정의 (회계 프로세스, 전역 원자 지출 SSOT & 멀티 증빙)
// ============================================================================
export type LedgerType = 'PERSONAL' | 'GROUP' | 'INSTANCE';
export type LedgerPeriodType = 'LONG_TERM' | 'SHORT_TERM';
export type LedgerSubType = 'STANDARD' | 'POCKET_MONEY';
export type LedgerClosingStatus = 'OPEN' | 'CLOSED' | 'SETTLED';
export type LedgerRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';

// 3대 대메뉴 덱 탭 (시안 B: 지출 / 수입 / 분석)
export type DeckTab = 'EXPENSE' | 'INCOME' | 'ANALYTICS';
export type ExpenseSubTab = 'GENERAL' | 'STATEMENT';

// N개 무제한 멀티 증빙 자료 아이템 (수집방법별 세부 속성 확장)
export interface ExpenseProofItem {
  id: string;
  type: 'MANUAL' | 'RECEIPT_OCR' | 'SMS_NOTIFICATION' | 'STATEMENT_LINE';
  title: string;
  amount: number;
  date: string;
  source: string;
  thumbnailUrl?: string;
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
// - 각 책의 상하 위치를 바로 바꿀 수 있는 브라스 스위치 버튼 내장
// ============================================================================
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
  // 사용자가 공유한 이미지의 5가지 시그니처 카툰 북 테마
  const theme = (() => {
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

export const SCR_LED_01_그룹가계부관리상세: React.FC<SCR_LED_01_Props> = ({ onBack }) => {
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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [excludeAssetTransfer, setExcludeAssetTransfer] = useState(true);

  const filteredTransactions = useMemo(() => {
    return currentTransactions.filter((tx) => {
      if (searchWord.trim()) {
        const query = searchWord.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchPayer = tx.payerName.toLowerCase().includes(query);
        const matchNote = tx.note?.toLowerCase().includes(query);
        if (!matchTitle && !matchPayer && !matchNote) return false;
      }
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [currentTransactions, searchWord, categoryFilter]);

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

  // 3대 덱 탭 (시안 B: 지출 / 수입 / 분석)
  const [activeDeckTab, setActiveDeckTab] = useState<DeckTab>('EXPENSE');
  const [expenseSubTab, setExpenseSubTab] = useState<ExpenseSubTab>('GENERAL');
  const [receiptOcrModalOpen, setReceiptOcrModalOpen] = useState(false);
  const [receiptOcrSimulating, setReceiptOcrSimulating] = useState(false);
  const [reaggregateSuccessMsg, setReaggregateSuccessMsg] = useState<string | null>(null);

  // [시나리오 2.1.3] 단일 지출 3대 뷰 모드 수직 3단 상세조회 상태
  const [selectedTxForProofs, setSelectedTxForProofs] = useState<LedgerTransaction | null>(null);
  const [detailProofFilter, setDetailProofFilter] = useState<'ALL' | 'STATEMENT' | 'RECEIPT'>('ALL');
  const [selectedProofItemId, setSelectedProofItemId] = useState<string | null>(null);
  const [decompressSimulating, setDecompressSimulating] = useState(false);
  const [decompressSuccessMsg, setDecompressSuccessMsg] = useState<string | null>(null);
  const [streamPurgePolicy, setStreamPurgePolicy] = useState<'INSTANT' | '1_DAY' | '30_DAYS'>('INSTANT');
  const [expandedCardCode, setExpandedCardCode] = useState<string | null>('WOORI');

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
  const [newLedgerInitialBalance, setNewLedgerInitialBalance] = useState('0');

  // 참여자 추가 폼
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<LedgerRole>('MEMBER');
  const [isNewMemberGuest, setIsNewMemberGuest] = useState(false);

  // 새 거래 등록 폼
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [newTxCategory, setNewTxCategory] = useState('식음료/외식');
  const [newTxIsAssetTransfer, setNewTxIsAssetTransfer] = useState(false);
  const [newTxTags, setNewTxTags] = useState('');

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

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      ledgerId: activeLedgerId,
      title: newTxTitle.trim(),
      type: newTxType,
      amount: amt,
      category: newTxCategory,
      date: new Date().toISOString().slice(0, 10),
      payerName: '구본영(나)',
      isAssetTransfer: isTransfer,
      relatedTransferId: isTransfer ? `rel-${Date.now()}` : undefined,
      tagNames: parsedTags.length > 0 ? parsedTags : isTransfer ? ['자산이동'] : ['일반지출'],
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
      `✓ "${currentLedger.title}"에 거래 내역(₩${amt.toLocaleString()})이 기록되었습니다.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 landscape:p-3 space-y-5 sm:space-y-6 landscape:space-y-4 bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ==================================================================== */}
      {/* 2. 가계부 책꽂이: 사용자 이미지 기반 카툰 북 스택 (그림처럼 차곡차곡 쌓인 책 더미) */}
      {/* ==================================================================== */}
      <div className="relative py-2 sm:py-6 landscape:py-1 px-1 sm:px-4">
        {/* 상단 장부책장 3단 헤더: 좌측(타이틀), 중앙(장부구분 필터), 우측(건수 + 책장닫기 버튼) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-2 border-b border-stone-200 dark:border-stone-800">
          {/* 1단(좌측): 장부책장 타이틀 */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 font-sans tracking-tight">
              장부책장
            </span>
          </div>

          {/* 2단(가운데): 장부구분(개인, 장기, 단기) 뱃지 활성/비활성 다중 필터 (가운데 정렬) */}
          <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none]">
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
              title="개인 가계부 노출/숨김 토글"
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
              title="장기 모임 가계부 노출/숨김 토글"
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
              title="단기 모임 가계부 노출/숨김 토글"
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
          </div>

          {/* 3단(우측): 건수 뱃지 + 책장 닫기/열기 버튼 (가장 우측) + 퀵 탐색 핸들 */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* 건수: 책장닫기 버튼 앞에 배치 (전체 표시인 경우 X건, 차이가 있는 경우 Y건 / X건) */}
            <span
              className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-black shadow-2xs whitespace-nowrap"
              title="현재 노출된 장부 건수 / 전체 건수"
            >
              {(() => {
                const totalCount = ledgers.length;
                const currentDisplayedCount = isBookshelfOpen ? visibleLedgers.length : 1;
                if (currentDisplayedCount === totalCount) {
                  return `${totalCount}건`;
                }
                return `${currentDisplayedCount}건 / ${totalCount}건`;
              })()}
            </span>

            {/* 책장 열기 / 닫기 토글 버튼 (가장 우측 배치) */}
            <button
              type="button"
              onClick={() => setIsBookshelfOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all shadow-2xs cursor-pointer select-none whitespace-nowrap"
              title={isBookshelfOpen ? "책장을 닫고 선택한 장부만 표시합니다" : "책장을 열어 전체 장부를 표시합니다"}
            >
              {isBookshelfOpen ? (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                  <span>책장 닫기</span>
                </>
              ) : (
                <>
                  <Book className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 stroke-[2.2]" />
                  <span>책장 열기</span>
                </>
              )}
            </button>

            {/* 우측 퀵 탐색 핸들 (장부 2권 이상 탐색 편의) */}
            {isBookshelfOpen && visibleLedgers.length > 1 && (
              <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-300 dark:border-stone-700 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleScrollBooks('UP')}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                  title="스택 위로 스크롤"
                >
                  <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollBooks('DOWN')}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                  title="스택 아래로 스크롤"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            )}
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
      <div className="p-4 sm:p-4.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
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

        {/* 우측: 내 권한 시뮬레이터 & 마감 재오픈 토글 & 참여자 관리 버튼 */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
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

          {/* 내 권한 시뮬레이터 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs text-xs">
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

          {/* 참여자 관리 버튼 */}
          <button
            type="button"
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold shadow-2xs cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>참여자 ({currentMembers.length}명)</span>
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
      {/* 4. 선택된 가계부 요약 벤토 통계 바 */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 통계 1: 총 잔액 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">
              {currentLedger.subType === 'POCKET_MONEY' ? '현재 잔여 용돈' : '가계부 총 잔액'}
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            ₩{currentLedger.balance.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold truncate">
            단일 귀속 계좌 연동 중
          </div>
        </div>

        {/* 통계 2: 당월 순수 생활비 지출 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">
              {currentLedger.subType === 'POCKET_MONEY' ? '실제 용돈 지출' : '당월 순수 생활비'}
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-rose-600">
            ₩{stats.pureExpense.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            자산이동 제외 순수 소비
          </div>
        </div>

        {/* 통계 3: 자산이동 합계 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-950/60 bg-purple-50/20 dark:bg-purple-950/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              자산 이동 합계
            </span>
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-purple-700 dark:text-purple-300">
            ₩{stats.assetTransfer.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            생활비 왜곡 방지 분리 (1:1 페어링)
          </div>
        </div>

        {/* 통계 4: 대납 / 정산 태깅 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">대납·정산 태깅</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-amber-600">
            ₩{stats.reimbursement.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-600 font-medium">
            이중계상 방지 태그
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700/80 overflow-x-auto [scrollbar-width:none]">
            {/* 1. 지출 탭 */}
            <button
              type="button"
              onClick={() => setActiveDeckTab('EXPENSE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeDeckTab === 'EXPENSE'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>지출 (Expense)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold">
                {filteredTransactions.filter((t) => t.type === 'EXPENSE').length}건
              </span>
            </button>

            {/* 2. 수입 탭 */}
            <button
              type="button"
              onClick={() => setActiveDeckTab('INCOME')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeDeckTab === 'INCOME'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-100 dark:border-emerald-900/50'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>수입 (Income)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                고정 {fixedIncomeRules.length}건
              </span>
            </button>

            {/* 3. 분석 탭 */}
            <button
              type="button"
              onClick={() => setActiveDeckTab('ANALYTICS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeDeckTab === 'ANALYTICS'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs border border-purple-100 dark:border-purple-900/50'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4 text-purple-500" />
              <span>분석 (Analytics)</span>
              {isDirtyAggregation && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse">
                  재집계 필요
                </span>
              )}
            </button>
          </div>

          {/* 우측 탭별 보조 스위치 및 액션 */}
          {activeDeckTab === 'EXPENSE' && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/40 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setExpenseSubTab('GENERAL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  expenseSubTab === 'GENERAL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                일반지출 (원장·영수증)
              </button>
              <button
                type="button"
                onClick={() => setExpenseSubTab('STATEMENT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  expenseSubTab === 'STATEMENT'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>명세서지출 (카드사 청구)</span>
                {statementIntakeReviews.some((r) => r.needsReview) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="수집 검토 필요 건 존재" />
                )}
              </button>
            </div>
          )}

          {activeDeckTab === 'INCOME' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setManualIncomeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>일반수입 등록</span>
              </button>
              <button
                type="button"
                onClick={() => setFixedIncomeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>고정수입 설정</span>
              </button>
              <button
                type="button"
                onClick={() => setBankImportModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>통장내역 일괄등록</span>
              </button>
            </div>
          )}

          {activeDeckTab === 'ANALYTICS' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs">
                {(['MONTH', 'QUARTER', 'YEAR'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setAnalyticsPeriod(period)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      analyticsPeriod === period
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                    }`}
                  >
                    {period === 'MONTH' ? '월간 (10월)' : period === 'QUARTER' ? '분기 (4Q)' : '연간 (2026)'}
                  </button>
                ))}
              </div>

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
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                  title="과거 데이터 변동에 따른 온디맨드 경량 재집계"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  <span>{recalculating ? '집계 중...' : '재집계 실행'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 1. [지출 탭 (EXPENSE)] */}
        {/* ==================================================================== */}
        {activeDeckTab === 'EXPENSE' && (
          <div className="space-y-5 animate-in fade-in-50">
            {/* 서브탭 1-1: 일반지출 (원장 거래 목록 & 영수증 등록) */}
            {expenseSubTab === 'GENERAL' && (
              <div className="space-y-4">
                {/* 상단 검색 및 액션 바 */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="w-full sm:w-72">
                    <ElmInp04
                      value={searchWord}
                      onChange={setSearchWord}
                      placeholder="가맹점, 입출금자, 태그 검색..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* [시나리오 2.2.1] 영수증 촬영/OCR 등록 버튼 */}
                    <button
                      type="button"
                      onClick={() => setReceiptOcrModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      title="영수증 사진 촬영/첨부 및 OCR 파싱 보정"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>영수증 촬영/OCR 등록</span>
                    </button>

                    {/* [시나리오 2.2.1] 수기 지출 등록 버튼 */}
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
                        setNewTxModalOpen(true);
                      }}
                      disabled={!canAddTransaction}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0 ${
                        canAddTransaction
                          ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer'
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
                          <Plus className="w-4 h-4" />
                          <span>새 지출 등록</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 카테고리 필터 & 자산이동 분리 옵션 바 */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 dark:border-zinc-800/80 py-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    <ElmFlt01
                      label="전체"
                      selected={categoryFilter === 'ALL'}
                      onClick={() => setCategoryFilter('ALL')}
                    />
                    <ElmFlt01
                      label="식료품/마트"
                      selected={categoryFilter === '식료품/마트'}
                      onClick={() => setCategoryFilter('식료품/마트')}
                    />
                    <ElmFlt01
                      label="외식/식음료"
                      selected={categoryFilter === '외식/식음료'}
                      onClick={() => setCategoryFilter('외식/식음료')}
                    />
                    <ElmFlt01
                      label="주거/통신"
                      selected={categoryFilter === '주거/통신'}
                      onClick={() => setCategoryFilter('주거/통신')}
                    />
                    <ElmFlt01
                      label="자산이동"
                      selected={categoryFilter === '가족 내부 이동' || categoryFilter === '자산 내부 이동'}
                      onClick={() =>
                        setCategoryFilter(
                          currentLedger.type === 'GROUP' ? '가족 내부 이동' : '자산 내부 이동'
                        )
                      }
                    />
                  </div>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={excludeAssetTransfer}
                      onChange={(e) => setExcludeAssetTransfer(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>자산이동 분리 표시 (생활비 왜곡 차단)</span>
                  </label>
                </div>

                {/* 지출내역 목록 테이블 (클릭 시 단일 지출 3단 상세조회 모달 연결) */}
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
                        className="p-4 flex items-center justify-between gap-4 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
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
                              <ArrowRightLeft className="w-5 h-5" />
                            ) : tx.type === 'EXPENSE' ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : tx.type === 'INCOME' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <ArrowRightLeft className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {tx.title}
                              </span>

                              {tx.isAssetTransfer && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                  <span>자산이동 (생활비제외)</span>
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

                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{tx.date}</span>
                              <span>•</span>
                              <span>결제: {tx.payerName}</span>
                              {tx.note && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500 dark:text-zinc-400 truncate max-w-xs">
                                    {tx.note}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* 대사 상태 뱃지 & 수집 증빙 체인 안내 */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-extrabold text-sm sm:text-base ${
                              tx.isAssetTransfer
                                ? 'text-purple-600 dark:text-purple-400'
                                : tx.type === 'EXPENSE'
                                ? 'text-rose-600 dark:text-rose-400'
                                : tx.type === 'INCOME'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : '↔'} ₩
                            {tx.amount.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline block mt-0.5">
                            지출상세 조회 ➔
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 서브탭 1-2: 명세서지출 (카드사 청구명세서 파일 등록 및 수집리뷰/조회) */}
            {expenseSubTab === 'STATEMENT' && (
              <div className="space-y-6">
                {/* [시나리오 2.1.1] 명세서 등록 및 파일 첨부 영역 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                          시나리오 2.1.1
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          카드 이용대금 명세서 첨부 등록 (카드사 구분 무관 지원)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                        카드사별 규격에 구애받지 않고 청구 명세서 파일(이미지, PDF, HTML)을 첨부하면 OCR과 AI 파싱 엔진이 자동으로 승인 라인을 추출합니다.
                      </p>
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

                  {/* 수집 리뷰 요약 목록 (Intake Review Summary) */}
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

                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60">
                              <span className="text-[10px] text-slate-400 block">월 결제금액</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                                ₩{rev.totalBilled.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60">
                              <span className="text-[10px] text-slate-400 block">결제 건수</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                                {rev.txCount}건
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60">
                              <span className="text-[10px] text-slate-400 block">일시불 / 할부</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                                {rev.lumpSumCount} / {rev.installmentCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10.5px] text-slate-400 font-mono truncate max-w-xs">
                              첨부: {rev.rawFileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEditingStatement(rev);
                                setStatementEditModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                            >
                              등록정보 편집 및 보정 ➔
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* [시나리오 2.1.2] 명세서 등록정보 조건별 다차원 검색 및 조회 */}
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        명세서 등록정보 다차원 조회
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      카드사, 할부 여부, 고정비 구분 및 결제일 조건별 검색
                    </span>
                  </div>

                  {/* 다차원 필터 바 */}
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
                        onChange={(e) => setStatementFilterInstallment(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-hidden"
                      >
                        <option value="ALL">전체 (일시불/할부)</option>
                        <option value="LUMP_SUM">일시불만</option>
                        <option value="INSTALLMENT">할부만</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">고정비 여부</span>
                      <select
                        value={statementFilterFixed}
                        onChange={(e) => setStatementFilterFixed(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-hidden"
                      >
                        <option value="ALL">전체 지출</option>
                        <option value="FIXED_ONLY">고정비만 (통신/렌탈/구독)</option>
                        <option value="VARIABLE_ONLY">변동비만</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold mb-1">가맹점 / 승인번호</span>
                      <input
                        type="text"
                        value={statementSearchKeyword}
                        onChange={(e) => setStatementSearchKeyword(e.target.value)}
                        placeholder="검색어 입력..."
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 명세서 지출 라인 테이블 */}
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 grid grid-cols-12 gap-2">
                      <div className="col-span-2">결제일 / 카드사</div>
                      <div className="col-span-4">가맹점명 및 승인정보</div>
                      <div className="col-span-2 text-center">할부회차</div>
                      <div className="col-span-2 text-center">고정비 분류</div>
                      <div className="col-span-2 text-right">청구금액</div>
                    </div>

                    {statementIntakeReviews.flatMap((rev) =>
                      rev.lines.map((line) => (
                        <div
                          key={line.id}
                          onClick={() => {
                            const matchingTx = currentTransactions.find((t) => t.title.includes(line.merchant)) || {
                              id: `tx-stmt-${line.id}`,
                              ledgerId: currentLedger.id,
                              title: line.merchant,
                              type: 'EXPENSE',
                              amount: line.amount,
                              category: line.isFixedExpense ? (line.fixedExpenseType || '고정비') : '쇼핑/생활',
                              date: line.date,
                              payerName: '구본영',
                              isAssetTransfer: false,
                              tagNames: line.isFixedExpense ? ['고정비', rev.cardName] : [rev.cardName],
                              reconciliationStatus: 'CONFIRMED',
                              statementDiscount: line.discount,
                              statementCardName: rev.cardName,
                              expenseRecordId: `atx-${line.approvalNo}`,
                              proofs: [
                                {
                                  id: `proof-${line.id}`,
                                  type: 'STATEMENT_LINE',
                                  title: `${rev.cardName} 10월 승인 명세`,
                                  amount: line.amount,
                                  date: line.date,
                                  source: rev.rawFileName,
                                  cardName: rev.cardName,
                                  approvalNo: line.approvalNo,
                                  installmentMonths: line.installment,
                                  statementDiscount: line.discount,
                                  paymentDueDate: '2026-10-23',
                                  details: [`청구할인 -₩${line.discount.toLocaleString()}원 상계 반영`, '단일진실원천(SSOT) 대사 완료'],
                                },
                              ],
                            };
                            setSelectedTxForProofs(matchingTx as LedgerTransaction);
                          }}
                          className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-indigo-50/50 dark:hover:bg-zinc-800/40 text-xs transition-colors cursor-pointer"
                        >
                          <div className="col-span-2 space-y-0.5">
                            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 block">
                              {line.date}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {rev.cardName}
                            </span>
                          </div>

                          <div className="col-span-4 min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {line.merchant}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              승인번호: {line.approvalNo}
                            </span>
                          </div>

                          <div className="col-span-2 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-[10.5px]">
                              {line.installment}
                            </span>
                          </div>

                          <div className="col-span-2 text-center">
                            {line.isFixedExpense ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                                📌 {line.fixedExpenseType || '고정비'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10.5px]">변동 생활비</span>
                            )}
                          </div>

                          <div className="col-span-2 text-right">
                            <span className="font-mono font-black text-rose-600 block">
                              ₩{line.amount.toLocaleString()}원
                            </span>
                            {line.discount > 0 && (
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                -₩{line.discount.toLocaleString()} 할인
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. [수입 탭 (INCOME)] */}
        {/* ==================================================================== */}
        {activeDeckTab === 'INCOME' && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* 2.3.1 고정수입 설정 (급여, 배당, 이자 등 & 알림/대상지정) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                      시나리오 2.3.1
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      고정수입 등록 및 자동 귀속 설정 (급여, 배당금, 금융이자)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    반복 발생하는 고정 수입을 등록하면 입금 예정일 알림과 함께 지정한 대상 가계부로 자동 배타적 귀속됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFixedIncomeModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 고정수입 규칙 추가</span>
                </button>
              </div>

              {/* 등록된 고정수입 규칙 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {fixedIncomeRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {rule.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {rule.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        매월 {rule.dayOfMonth}일
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">정기 입금 예정액</span>
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                        +₩{rule.amount.toLocaleString()}원
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">지정 장부:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[140px]">
                          {rule.targetLedgerTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">입금 계좌:</span>
                        <span className="font-mono text-slate-700 dark:text-zinc-300 truncate max-w-[140px]">
                          {rule.account}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">장부 등록 알림:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFixedIncomeRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id ? { ...r, notifyEnabled: !r.notifyEnabled } : r
                              )
                            );
                            setNoticeMessage(
                              `✓ "${rule.name}" 알림이 ${!rule.notifyEnabled ? '활성화' : '해제'}되었습니다.`
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            rule.notifyEnabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'
                          }`}
                        >
                          {rule.notifyEnabled ? '🔔 알림 켜짐' : '🔕 알림 꺼짐'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2.3.2 통장 거래내역 첨부 및 수입/지출 일괄정리 (미등록 계좌 감지) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                      시나리오 2.3.2
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      통장 거래내역 첨부 및 수입·지출 일괄 정리
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    여러 은행 통장 엑셀/CSV를 동시에 첨부하고, 수집 기간(당월 또는 기간지정 10.01~10.31) 내 거래를 자동 분류합니다.
                  </p>
                </div>

                {/* 수집 기간 설정 컨트롤 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setBankSelectedPeriod('MONTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        bankSelectedPeriod === 'MONTH'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      당월 (10월)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankSelectedPeriod('CUSTOM')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        bankSelectedPeriod === 'CUSTOM'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      기간 지정
                    </button>
                  </div>
                  {bankSelectedPeriod === 'CUSTOM' && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                      {bankCustomRange}
                    </span>
                  )}
                </div>
              </div>

              {/* 미등록 계좌 자동 수집 안내 배너 */}
              {detectedAutoAccount && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>신규 미등록 계좌 자동 감지:</strong> {detectedAutoAccount} — 통장 첨부 중 발견되어 사용자설정 계좌관리 시스템에 임시 등록되었습니다.
                    </span>
                  </div>
                  <span className="text-[10.5px] font-bold text-amber-800 dark:text-amber-300 underline cursor-pointer shrink-0">
                    계좌 별칭 수정 ➔
                  </span>
                </div>
              )}

              {/* 파싱된 통장 거래내역 테이블 */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 grid grid-cols-12 gap-2">
                  <div className="col-span-1 text-center">선택</div>
                  <div className="col-span-2">거래일자 / 은행</div>
                  <div className="col-span-3">거래 적요 및 내역</div>
                  <div className="col-span-2 text-right">입금 (+)</div>
                  <div className="col-span-2 text-right">출금 (-)</div>
                  <div className="col-span-2 text-center">유추 유형</div>
                </div>

                {bankParsedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 text-xs"
                  >
                    <div className="col-span-1 text-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => {
                          setBankParsedItems((prev) =>
                            prev.map((b) => (b.id === item.id ? { ...b, selected: e.target.checked } : b))
                          );
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="col-span-2 space-y-0.5">
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 block">
                        {item.date}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {item.bankName}
                      </span>
                    </div>

                    <div className="col-span-3 font-medium text-slate-900 dark:text-white truncate">
                      {item.description}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-emerald-600">
                      {item.depositAmount > 0 ? `+₩${item.depositAmount.toLocaleString()}` : '-'}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-rose-600">
                      {item.withdrawAmount > 0 ? `-₩${item.withdrawAmount.toLocaleString()}` : '-'}
                    </div>

                    <div className="col-span-2 text-center">
                      <select
                        value={item.inferredType}
                        onChange={(e) => {
                          const newType = e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSFER';
                          setBankParsedItems((prev) =>
                            prev.map((b) => (b.id === item.id ? { ...b, inferredType: newType } : b))
                          );
                        }}
                        className={`text-[10.5px] font-bold rounded-lg border px-2 py-1 focus:outline-hidden ${
                          item.inferredType === 'INCOME'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : item.inferredType === 'TRANSFER'
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <option value="INCOME">💰 수입</option>
                        <option value="EXPENSE">💳 지출</option>
                        <option value="TRANSFER">↔️ 자산이동</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* 일괄 등록 실행 바 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  선택된 {bankParsedItems.filter((b) => b.selected).length}건을 현재 가계부(
                  <strong className="text-indigo-600">{currentLedger.title}</strong>)의 원장에 일괄 기록합니다.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const selected = bankParsedItems.filter((b) => b.selected);
                    if (selected.length === 0) return;
                    setNoticeMessage(`✓ 통장 거래내역 ${selected.length}건이 가계부 원장에 일괄 성공적으로 반영되었습니다.`);
                    setIsDirtyAggregation(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>선택 항목 가계부 일괄 반영</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. [분석 탭 (ANALYTICS)] */}
        {/* ==================================================================== */}
        {activeDeckTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-in fade-in-50">
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
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white">
                          {card.cardName} {card.cardAlias}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          결제일: {card.paymentDate}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">출금계좌: {card.account}</span>
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
      </div>

      {/* ==================================================================== */}
      {/* [시나리오 2.1.3] 지출항목 상세정보 조회 (단일 지출 3대 뷰 모드 수직 3단 레이아웃) */}
      {/* ==================================================================== */}
      {selectedTxForProofs && (() => {
        const proofs = selectedTxForProofs.proofs || [];
        const filteredProofs = proofs.filter((p) => {
          if (detailProofFilter === 'STATEMENT') return p.type === 'STATEMENT_LINE' || p.type === 'SMS_NOTIFICATION';
          if (detailProofFilter === 'RECEIPT') return p.type === 'RECEIPT_OCR';
          return true;
        });
        const activeProof = proofs.find((p) => p.id === selectedProofItemId) || filteredProofs[0] || proofs[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
            <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              {/* 모달 윈도우 헤더 */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
                      지출항목 상세정보 조회 · 지출내역
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      원장 SSOT: {selectedTxForProofs.expenseRecordId || `atx-${selectedTxForProofs.id}`}
                    </span>
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                    {selectedTxForProofs.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTxForProofs(null);
                    setSelectedProofItemId(null);
                    setDecompressSuccessMsg(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* ① [상단] 공통 및 필수 항목 헤더 요약 바 (Top) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">최종 대사 확정 금액</span>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
                      <span>₩{selectedTxForProofs.amount.toLocaleString()}원</span>
                      {selectedTxForProofs.statementDiscount && selectedTxForProofs.statementDiscount > 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                          카드사 청구할인 -₩{selectedTxForProofs.statementDiscount.toLocaleString()} 반영됨
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>대사 수렴 상태: {selectedTxForProofs.reconciliationStatus || 'CONFIRMED'}</span>
                    </span>
                  </div>
                </div>

                {/* 필수 메타데이터 4열 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-slate-200 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">승인 및 결제일시</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedTxForProofs.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">표준 카테고리</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedTxForProofs.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">결제자 / 수단</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {selectedTxForProofs.payerName}
                      {selectedTxForProofs.statementCardName ? ` (${selectedTxForProofs.statementCardName})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">단방향 장부 귀속</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {currentLedger.title} (기준참조)
                    </span>
                  </div>
                </div>

                {/* 타서비스 관계정보 표시 및 대상 링크 바 */}
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400 block">
                    🔗 타 서비스 관계정보 및 정산 연계:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedTxForProofs.crossServiceLinks?.dutyId && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>모아당번 연계: {selectedTxForProofs.crossServiceLinks.dutyTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </span>
                    )}

                    {selectedTxForProofs.crossServiceLinks?.goalId && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        <PiggyBank className="w-3.5 h-3.5" />
                        <span>모아목표 연계: {selectedTxForProofs.crossServiceLinks.goalTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </span>
                    )}

                    {selectedTxForProofs.crossServiceLinks?.guestEventName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                        <Coins className="w-3.5 h-3.5" />
                        <span>게스트 정산 연계: {selectedTxForProofs.crossServiceLinks.guestEventName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </span>
                    )}

                    {selectedTxForProofs.isAssetTransfer && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>자산이동 (1:1 페어링 연동됨)</span>
                      </span>
                    )}

                    {selectedTxForProofs.tagNames.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* ② [중간] 수집방법 목록 테이블 (Mid: 3대 뷰 토글 인터랙션) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      수집방법 목록 ({proofs.length}건 접수됨)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      · 아래 행을 클릭하면 하단에 수집별 세부정보가 표시됩니다
                    </span>
                  </div>

                  {/* 3대 뷰 모드 토글 (전체보기 / 명세보기 / 영수보기) */}
                  <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setDetailProofFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        detailProofFilter === 'ALL'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                      }`}
                    >
                      전체보기 ({proofs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailProofFilter('STATEMENT')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        detailProofFilter === 'STATEMENT'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                      }`}
                    >
                      명세보기
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailProofFilter('RECEIPT')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        detailProofFilter === 'RECEIPT'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                      }`}
                    >
                      영수보기
                    </button>
                  </div>
                </div>

                {/* 수집목록 테이블 */}
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredProofs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      해당 수집 보기 조건에 맞는 등록 건이 없습니다.
                    </div>
                  ) : (
                    filteredProofs.map((prf) => {
                      const isSelected = activeProof?.id === prf.id;
                      return (
                        <div
                          key={prf.id}
                          onClick={() => setSelectedProofItemId(prf.id)}
                          className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                              : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                prf.type === 'STATEMENT_LINE'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  : prf.type === 'RECEIPT_OCR'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : prf.type === 'SMS_NOTIFICATION'
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {prf.type === 'STATEMENT_LINE' ? (
                                <CreditCard className="w-4 h-4" />
                              ) : prf.type === 'RECEIPT_OCR' ? (
                                <Receipt className="w-4 h-4" />
                              ) : prf.type === 'SMS_NOTIFICATION' ? (
                                <Bell className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {prf.title}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                                  {prf.type === 'STATEMENT_LINE'
                                    ? '명세서수집'
                                    : prf.type === 'RECEIPT_OCR'
                                    ? '영수증촬영'
                                    : prf.type === 'SMS_NOTIFICATION'
                                    ? '승인문자'
                                    : '수기등록'}
                                </span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[9px] font-black">
                                    선택됨
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {prf.date} • 출처: {prf.source}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white block">
                              ₩{prf.amount.toLocaleString()}원
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              상세보기 클릭 ➔
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* ③ [하단] 선택 수집정보 상세 패널 (Bottom: 잔여 속성 전체 표시) */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeProof && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-indigo-200 dark:border-indigo-900/60 space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        <span>선택된 수집 상세 정보: {activeProof.title}</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      수집출처: {activeProof.source}
                    </span>
                  </div>

                  {/* 1) 명세서 수집 항목인 경우 세부 속성 */}
                  {activeProof.type === 'STATEMENT_LINE' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">카드사 및 카드명</span>
                          <span className="font-black text-slate-800 dark:text-zinc-100">
                            {activeProof.cardName || selectedTxForProofs.statementCardName || '우리카드'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">카드 승인번호</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                            {activeProof.approvalNo || '83921028'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">할부 회차</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-100">
                            {activeProof.installmentMonths || '일시불'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">청구할인 혜택</span>
                          <span className="font-bold text-emerald-600 font-mono">
                            -₩{(activeProof.statementDiscount || selectedTxForProofs.statementDiscount || 1000).toLocaleString()}원
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">결제예정일</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-100">
                            {activeProof.paymentDueDate || '2026년 10월 23일'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                          <span className="text-[10.5px] text-slate-400 block">결제 출금계좌</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {activeProof.paymentAccount || '우리은행 (1002-***-918231)'}
                          </span>
                        </div>
                      </div>

                      {activeProof.details && (
                        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                          <span className="font-bold text-indigo-900 dark:text-indigo-200 text-[11px] block">
                            📌 명세서 매핑 특이사항 및 골든 레코드 메모:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-zinc-300 text-[11px]">
                            {activeProof.details.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2) 영수증 OCR 수집 항목인 경우 세부 속성 */}
                  {activeProof.type === 'RECEIPT_OCR' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">사업자등록번호</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {activeProof.businessNumber || '201-81-29182'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">대표자명 / 상호</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {activeProof.ceoName || '이진우'} (스타벅스)
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">부가세 분리</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            세액 ₩{(activeProof.taxAmount || 745).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">현금영수증 식별</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {activeProof.cashReceiptNo || '010-****-9182'}
                          </span>
                        </div>
                      </div>

                      {/* 세부 파싱 품목 리스트 테이블 */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-2">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          <span>영수증 품목별 단가 및 수량 파싱 내역 (Itemized Lines)</span>
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-zinc-800 text-[10.5px] text-slate-400 font-semibold border-b border-slate-100 dark:border-zinc-700">
                              <tr>
                                <th className="p-2">품목명</th>
                                <th className="p-2 text-center">수량</th>
                                <th className="p-2 text-right">단가</th>
                                <th className="p-2 text-right">금액</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                              {(activeProof.itemsList || [
                                { name: '아메리카노 T', qty: 1, unitPrice: 4500, totalPrice: 4500 },
                                { name: '바닐라 라떼 G', qty: 1, unitPrice: 5500, totalPrice: 5500 },
                                { name: '개인컵 친환경 할인', qty: 1, unitPrice: -1800, totalPrice: -1800 },
                              ]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                                  <td className="p-2 font-medium text-slate-800 dark:text-zinc-200">{item.name}</td>
                                  <td className="p-2 text-center font-mono">{item.qty}</td>
                                  <td className="p-2 text-right font-mono text-slate-500">
                                    ₩{item.unitPrice.toLocaleString()}
                                  </td>
                                  <td className={`p-2 text-right font-mono font-bold ${
                                    item.totalPrice < 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                  }`}>
                                    ₩{item.totalPrice.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3) 수기 / 문자 등록 항목인 경우 */}
                  {(activeProof.type === 'MANUAL' || activeProof.type === 'SMS_NOTIFICATION') && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {activeProof.type === 'MANUAL' ? '수기 등록 상세 메모' : '카드 승인 SMS 전문'}
                        </span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 text-[11px]">
                        {activeProof.details?.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 운영비 0원 온디맨드 스토리지 아카이브 해제 시뮬레이터 */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950 dark:text-indigo-200">
                          <Archive className="w-3.5 h-3.5 text-indigo-600" />
                          <span>운영비 0원 온디맨드 스토리지 (30일 초과 tarball 압축 아카이빙)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-zinc-400 mt-0.5">
                          30일 초과 원본 이미지는 <code className="font-mono text-indigo-700 dark:text-indigo-300">proofs_2026_09.tar.gz</code> 압축 보관되며, 요청 시에만 임시 메모리에 단건 해제됩니다.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDecompressSimulating(true);
                          setTimeout(() => {
                            setDecompressSimulating(false);
                            setDecompressSuccessMsg('✓ tarball 스트림 단건 임시 해제 완료 (고해상도 원본 렌더링됨 • 0초 즉시 파기 정책 적용)');
                          }, 500);
                        }}
                        disabled={decompressSimulating}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {decompressSimulating ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>해제 중...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <DownloadCloud className="w-3 h-3" />
                            <span>원본 압축 해제 체험</span>
                          </span>
                        )}
                      </button>
                    </div>

                    {decompressSuccessMsg && (
                      <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-[10.5px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{decompressSuccessMsg}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 모달 닫기 버튼 */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTxForProofs(null);
                    setSelectedProofItemId(null);
                    setDecompressSuccessMsg(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  지출상세 닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================================================================== */}
      {/* 6. 모아보고 금전관리 3대 원칙 안내 레이어 모달 (물음표 ❓ 클릭 시) */}
      {/* ==================================================================== */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  모아보고 금전관리 3대 원칙
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <div className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span>단일 귀속성 (Single Attribution)</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  모든 거래는 개인 가계부 또는 모임 가계부 중 <strong>단 하나에만 배타적으로 귀속</strong>되며 상호 중복 합산되지 않아 데이터 정합성을 완벽하게 보장합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                <div className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>TRANSFER 1:1 자기참조 페어링 (생활비 왜곡 차단)</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  통장 간 이체, 부모-자녀 간 용돈 지급, 모임 회비 송금은 가계 전체 관점에서 <strong>단순 자산 재배치</strong>이므로, <code className="text-purple-700 dark:text-purple-300 font-mono">is_asset_transfer = true</code>로 생활비 지출 통계에서 원천 분리됩니다.
                </p>
                <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-[10.5px] text-purple-900 dark:text-purple-300 space-y-0.5 border border-purple-200/60 dark:border-purple-800/60">
                  <span className="font-bold">💡 실생활 사례 (부모 ➔ 자녀 용돈 10만 원):</span>
                  <p>부모 가계부 출금(TRANSFER)과 자녀 용돈기입장 입금(TRANSFER)이 <code className="font-mono">related_transfer_id</code>로 1:1 맞물려, 자녀가 편의점(5천 원)을 결제할 때 비로소 가계 소비로 정확히 집계됩니다.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 space-y-1">
                <div className="font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center text-[10px] font-mono">
                    3
                  </span>
                  <span>태깅 분리 (이중계상 방지)</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  개인 지출의 모임 대납이나 1/N 정산 요청은 <strong>메타데이터 태그(#대납, #정산요청)</strong>로 분리하여 한 번 지출된 금액이 중복 청구되는 것을 차단합니다.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>게스트 소멸성 (Transient) 원칙</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  모임 인스턴스 가계부의 미가입 게스트는 임시 식별자로 활동하며, 정규 회원가입 시 기존 내역이 무단 소급 결합되지 않고 당사자의 승인 하에만 안전하게 이관됩니다.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. 참여자 관리 바텀시트 / 모달 */}
      {/* ==================================================================== */}
      <ElmBsh01
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={`가계부 참여자 및 권한 설정 (${currentMembers.length}명)`}
      >
        <div className="space-y-5 pb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                현재 가계부: {currentLedger.title}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  currentLedger.type === 'GROUP'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentLedger.type === 'PERSONAL'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentLedger.type === 'GROUP'
                  ? '정식회원 전용'
                  : currentLedger.type === 'PERSONAL'
                  ? '개인 전용'
                  : '게스트 허용 (모임)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {currentLedger.type === 'GROUP'
                ? '가족 그룹 가계부는 데이터 정합성을 위해 정식 가입 회원만 참여할 수 있습니다.'
                : currentLedger.type === 'PERSONAL'
                ? '개인 가계부는 단독 소유로 외부 참여자를 추가할 수 없습니다.'
                : '동창/모임 가계부는 미가입 게스트 참여를 유연하게 허용하며 모임 종료 시 정산됩니다.'}
            </p>
          </div>

          {/* 참여자 리스트 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              참여자 목록 & 권한 변경
            </h5>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
              {currentMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3 flex items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{m.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">
                          {m.name}
                        </span>
                        {m.isGuest && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            게스트 ({m.guestId})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        참여일: {m.joinedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      disabled={!canManageMembers || m.role === 'OWNER'}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as LedgerRole)}
                      className={`text-[11px] font-bold rounded-lg border px-2 py-1 focus:outline-hidden ${
                        m.role === 'OWNER'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : m.role === 'ADMIN'
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : m.role === 'MEMBER'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : m.role === 'VIEWER'
                          ? 'bg-slate-100 border-slate-300 text-slate-700'
                          : 'bg-orange-50 border-orange-300 text-orange-800'
                      } ${!canManageMembers || m.role === 'OWNER' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                    >
                      <option value="OWNER">👑 소유자 (총괄)</option>
                      <option value="ADMIN">🛡️ 관리자</option>
                      <option value="MEMBER">👤 멤버</option>
                      <option value="VIEWER">👁️ 조회전용</option>
                      <option value="GUEST">🎭 게스트</option>
                    </select>

                    {canManageMembers && m.role !== 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="참여자 내보내기"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새 참여자 초대 */}
          {currentLedger.type !== 'PERSONAL' && (
            <form onSubmit={handleAddMember} className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>새 참여자 초대</span>
              </h5>

              <ElmInp01
                label="이름 / 닉네임"
                value={newMemberName}
                onChange={setNewMemberName}
                placeholder="예: 홍길동 (이메일 또는 닉네임)"
              />

              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="부여할 권한"
                  value={newMemberRole}
                  onChange={(val) => setNewMemberRole(val as LedgerRole)}
                  options={[
                    { value: 'ADMIN', label: '🛡️ 관리자' },
                    { value: 'MEMBER', label: '👤 일반 멤버' },
                    { value: 'VIEWER', label: '👁️ 조회 전용' },
                  ]}
                />

                <div className="flex flex-col justify-end pb-1">
                  <ElmChk01
                    checked={isNewMemberGuest}
                    onChange={setIsNewMemberGuest}
                    label="미가입 게스트로 추가"
                  />
                  {currentLedger.type === 'GROUP' && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-1">
                      * 가족 가계부는 게스트 추가 불가
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={!canManageMembers}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  참여자 초대하기
                </button>
              </div>
            </form>
          )}
        </div>
      </ElmBsh01>

      {/* ==================================================================== */}
      {/* 8. 새 거래 등록 모달 */}
      {/* ==================================================================== */}
      {newTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>새 거래 내역 등록</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                귀속: {currentLedger.title}
              </span>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5">
              <ElmInp01
                label="거래 항목명"
                value={newTxTitle}
                onChange={setNewTxTitle}
                placeholder="예: 주말 이마트 장보기"
              />

              <div className="grid grid-cols-2 gap-3">
                <ElmInp01
                  label="금액 (원)"
                  value={newTxAmount}
                  onChange={setNewTxAmount}
                  placeholder="예: 50000"
                />

                <ElmSel01
                  label="거래 유형"
                  value={newTxType}
                  onChange={(v) => {
                    setNewTxType(v as any);
                    if (v === 'TRANSFER') {
                      setNewTxIsAssetTransfer(true);
                    }
                  }}
                  options={[
                    { value: 'EXPENSE', label: '지출 (-)' },
                    { value: 'INCOME', label: '수입 (+)' },
                    { value: 'TRANSFER', label: '자산이동 (↔)' },
                  ]}
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                <ElmChk01
                  checked={newTxIsAssetTransfer}
                  onChange={setNewTxIsAssetTransfer}
                  label="자산이동으로 분류 (생활비 통계 집계 제외)"
                />
                <p className="text-[10px] text-purple-700 dark:text-purple-300 pl-6">
                  계좌 간 자금 이동이나 자녀 용돈 이체는 순수 생활비 지출 통계에서 자동으로 분리됩니다.
                </p>
              </div>

              <ElmInp01
                label="태그 입력 (쉼표로 구분)"
                value={newTxTags}
                onChange={setNewTxTags}
                placeholder="예: 대납, 정산요청, 가족외식"
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  거래 기록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. 새 장부 개설 모달 (회계 프로세스 & 디자인 설정) */}
      {/* ==================================================================== */}
      {newLedgerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  새 장부 개설 (회계 프로세스 설정)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewLedgerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newLedgerTitle.trim()) return;

                const initBal = parseInt(newLedgerInitialBalance.replace(/[^0-9-]/g, '') || '0', 10);
                const cap = parseInt(newLedgerBudgetCap.replace(/[^0-9]/g, '') || '150000', 10);
                const newId = `led-${Date.now()}`;

                const themeMap = {
                  LEATHER: {
                    bg: 'from-emerald-900/10 via-emerald-800/5 to-transparent',
                    border: 'border-emerald-600/40',
                    spineGrad: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-emerald-100',
                    labelBg: 'bg-emerald-950/80 border border-emerald-500/40',
                    labelText: 'text-emerald-300',
                    bookmarkColor: 'bg-emerald-500 text-white',
                    accent: 'text-emerald-600 dark:text-emerald-400',
                  },
                  HARDCOVER: {
                    bg: 'from-indigo-900/10 via-indigo-800/5 to-transparent',
                    border: 'border-indigo-600/40',
                    spineGrad: 'bg-gradient-to-r from-indigo-800 via-blue-900 to-indigo-950 text-indigo-100',
                    labelBg: 'bg-indigo-950/80 border border-indigo-500/40',
                    labelText: 'text-indigo-300',
                    bookmarkColor: 'bg-indigo-500 text-white',
                    accent: 'text-indigo-600 dark:text-indigo-400',
                  },
                  KRAFT: {
                    bg: 'from-amber-900/10 via-amber-800/5 to-transparent',
                    border: 'border-amber-600/40',
                    spineGrad: 'bg-gradient-to-r from-amber-800 via-orange-900 to-amber-950 text-amber-100',
                    labelBg: 'bg-amber-950/80 border border-amber-500/40',
                    labelText: 'text-amber-300',
                    bookmarkColor: 'bg-amber-500 text-white',
                    accent: 'text-amber-600 dark:text-amber-400',
                  },
                  FABRIC: {
                    bg: 'from-purple-900/10 via-fuchsia-800/5 to-transparent',
                    border: 'border-purple-600/40',
                    spineGrad: 'bg-gradient-to-r from-purple-800 via-fuchsia-900 to-purple-950 text-purple-100',
                    labelBg: 'bg-purple-950/80 border border-purple-500/40',
                    labelText: 'text-purple-300',
                    bookmarkColor: 'bg-purple-500 text-white',
                    accent: 'text-purple-600 dark:text-purple-400',
                  },
                  SLATE: {
                    bg: 'from-slate-900/15 via-zinc-800/5 to-transparent',
                    border: 'border-slate-500/40',
                    spineGrad: 'bg-gradient-to-r from-slate-700 via-zinc-800 to-slate-950 text-slate-100',
                    labelBg: 'bg-slate-950/80 border border-slate-500/40',
                    labelText: 'text-slate-300',
                    bookmarkColor: 'bg-slate-500 text-white',
                    accent: 'text-slate-600 dark:text-slate-400',
                  },
                  VINTAGE_BURGUNDY: {
                    bg: 'from-rose-950/20 via-amber-950/10 to-transparent',
                    border: 'border-amber-700/50',
                    spineGrad: 'bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 text-amber-200',
                    labelBg: 'bg-amber-100/95 dark:bg-amber-950/90 border border-amber-600/60 shadow-xs',
                    labelText: 'text-amber-950 dark:text-amber-200',
                    bookmarkColor: 'bg-amber-500 text-amber-950',
                    accent: 'text-amber-600 dark:text-amber-400',
                  },
                };

                const newBook: LedgerBook = {
                  id: newId,
                  title: newLedgerTitle.trim(),
                  type: newLedgerType,
                  periodType: newLedgerPeriodType,
                  subType: newLedgerSubType,
                  closingStatus: 'OPEN',
                  budgetCap: newLedgerSubType === 'POCKET_MONEY' ? cap : undefined,
                  spentAmount: 0,
                  resetCycle: newLedgerSubType === 'POCKET_MONEY' ? newLedgerResetCycle : undefined,
                  allowReopen: newLedgerPeriodType === 'SHORT_TERM' ? newLedgerAllowReopen : true,
                  description:
                    newLedgerSubType === 'POCKET_MONEY'
                      ? `용돈기입장 · ${newLedgerResetCycle === 'MONTHLY' ? '월' : '주'} 한도 ₩${cap.toLocaleString()}`
                      : newLedgerPeriodType === 'SHORT_TERM'
                      ? '단기 프로젝트 · 정산 중심 일회성 장부'
                      : '일상 가계부 · 연속 시계열 관리',
                  balance: newLedgerSubType === 'POCKET_MONEY' ? cap : initBal,
                  currency: 'KRW',
                  designStyle: newLedgerDesignStyle,
                  colorTheme: themeMap[newLedgerDesignStyle],
                  membersCount: 1,
                  createdAt: new Date().toISOString().slice(0, 10),
                  settlementCycle:
                    newLedgerSubType === 'POCKET_MONEY'
                      ? '주기별 용돈 리셋'
                      : newLedgerPeriodType === 'SHORT_TERM'
                      ? '프로젝트 종료 시 정산'
                      : '매월 말일 결산',
                };

                setLedgers((prev) => [newBook, ...prev]);
                setActiveLedgerId(newBook.id);
                setMembersMap((prev) => ({
                  ...prev,
                  [newId]: [
                    {
                      id: `m-${Date.now()}`,
                      name: '구본영(호스트/나)',
                      role: 'OWNER',
                      isGuest: false,
                      joinedAt: new Date().toISOString().slice(0, 10),
                      avatar: '👨‍💼',
                    },
                  ],
                }));
                setTransactionsMap((prev) => ({
                  ...prev,
                  [newId]: [],
                }));

                setNewLedgerModalOpen(false);
                setNewLedgerTitle('');
                setNoticeMessage(`✓ 새 장부 "${newBook.title}"이(가) 책꽂이에 등록되었습니다.`);
              }}
              className="space-y-3.5 text-xs"
            >
              <ElmInp01
                label="장부 타이틀"
                value={newLedgerTitle}
                onChange={setNewLedgerTitle}
                placeholder="예: 우리집 가계부, 자녀 용돈기입장, 제주도 여행"
              />

              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="귀속 유형"
                  value={newLedgerType}
                  onChange={(v) => setNewLedgerType(v as LedgerType)}
                  options={[
                    { value: 'PERSONAL', label: '👤 개인 가계부' },
                    { value: 'GROUP', label: '👥 모임/가족 가계부' },
                    { value: 'INSTANCE', label: '⚡ 인스턴스 (일회성)' },
                  ]}
                />

                <ElmSel01
                  label="회계 기간 유형"
                  value={newLedgerPeriodType}
                  onChange={(v) => setNewLedgerPeriodType(v as LedgerPeriodType)}
                  options={[
                    { value: 'LONG_TERM', label: '📅 장기 연속형 (일상/누적)' },
                    { value: 'SHORT_TERM', label: '⏱️ 단기 정산형 (정산 후 마감)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="세부 성격"
                  value={newLedgerSubType}
                  onChange={(v) => setNewLedgerSubType(v as LedgerSubType)}
                  options={[
                    { value: 'STANDARD', label: '📖 일반 가계부 (자산/수지)' },
                    { value: 'POCKET_MONEY', label: '🪙 용돈기입장 (한도/소진)' },
                  ]}
                />

                <ElmSel01
                  label="책등 디자인 스타일"
                  value={newLedgerDesignStyle}
                  onChange={(v) => setNewLedgerDesignStyle(v as any)}
                  options={[
                    { value: 'LEATHER', label: '🌿 에메랄드 가죽' },
                    { value: 'HARDCOVER', label: '📘 미드나잇 하드커버' },
                    { value: 'KRAFT', label: '📙 따뜻한 크라프트' },
                    { value: 'FABRIC', label: '🔮 바이올렛 패브릭' },
                    { value: 'SLATE', label: '⚙️ 슬레이트 바인더' },
                    { value: 'VINTAGE_BURGUNDY', label: '🍷 빈티지 버건디 양장' },
                  ]}
                />
              </div>

              {/* 용돈기입장 전용 설정 */}
              {newLedgerSubType === 'POCKET_MONEY' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                    <PiggyBank className="w-4 h-4 text-amber-600" />
                    <span>용돈기입장 특화 설정</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ElmInp01
                      label="한도 예산 (원)"
                      value={newLedgerBudgetCap}
                      onChange={setNewLedgerBudgetCap}
                      placeholder="예: 150000"
                    />
                    <ElmSel01
                      label="리셋 주기"
                      value={newLedgerResetCycle}
                      onChange={(v) => setNewLedgerResetCycle(v as any)}
                      options={[
                        { value: 'MONTHLY', label: '매월 1일 리셋' },
                        { value: 'WEEKLY', label: '매주 월요일 리셋' },
                        { value: 'NONE', label: '수동 관리' },
                      ]}
                    />
                  </div>
                  <p className="text-[10.5px] text-amber-800 dark:text-amber-300">
                    * 부모 가계부에서 용돈을 송금할 때 TRANSFER 1:1 페어링으로 생활비 왜곡 없이 안전하게 충전됩니다.
                  </p>
                </div>
              )}

              {/* 단기 정산형 전용 설정 */}
              {newLedgerPeriodType === 'SHORT_TERM' && (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-1">
                  <ElmChk01
                    checked={newLedgerAllowReopen}
                    onChange={setNewLedgerAllowReopen}
                    label="정산 마감 후에도 방장 재오픈(Reopen) 허용"
                  />
                  <p className="text-[10px] text-orange-700 dark:text-orange-300 pl-6">
                    체크 해제 시 마감 후 수정이 불가한 불변 영구 보관 장부로 잠금됩니다.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewLedgerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  새 장부 책꽂이에 꽂기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};