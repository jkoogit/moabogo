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
} from 'lucide-react';

// ============================================================================
// 도메인 타입 정의
// ============================================================================
export type LedgerType = 'PERSONAL' | 'GROUP' | 'INSTANCE';
export type LedgerRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';

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


export const SCR_LED_01_그룹가계부관리상세: React.FC<SCR_LED_01_Props> = ({ onBack }) => {
  // --------------------------------------------------------------------------
  // 1. 가로 형태의 쌓여있는 가계부 책꽂이 데이터셋 (각 책마다 고유 디자인 적용)
  // --------------------------------------------------------------------------
  const [ledgers, setLedgers] = useState<LedgerBook[]>([
    {
      id: 'led-group-01',
      title: '우리 4인 가족 생활비 장부',
      type: 'GROUP',
      description: '장기 모임 장부 · 정식 가족 구성원 생활비 및 공과금 분담',
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
      title: '구본영 개인 급여·용돈 장부',
      type: 'PERSONAL',
      description: '개인 장부 · 단독 소유 · 급여, 자기계발 및 비상금 운용',
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
      id: 'led-instance-01',
      title: '2026 동창회 강릉 펜션 모임',
      type: 'INSTANCE',
      description: '단기 모임 장부 · 미가입 게스트 허용 & 여행 정산 후 소멸',
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
      settlementCycle: '여행 종료 시 정산',
    },
    {
      id: 'led-fabric-01',
      title: '주말 러닝 크루 정기 회비',
      type: 'GROUP',
      description: '장기 모임 장부 · 정기 러닝 번개 모임 · 음료비 및 마라톤 참가비 정산',
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
      description: '개인 장부 · 단독 운용 · 비상금 통장 및 배당 재투자 내역 분리 관리',
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
      description: '단기 모임 장부 · 클래식 빈티지 양장본 · 여행 경비 외화 환전 및 정산',
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
      settlementCycle: '여행 정산 완료',
    },
  ]);

  const [activeLedgerId, setActiveLedgerId] = useState<string>('led-group-01');
  const currentLedger = useMemo(
    () => ledgers.find((l) => l.id === activeLedgerId) || ledgers[0],
    [ledgers, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 1-1. [요구사항 1] 전체 장부 기준 최대 금액 및 두께 비율 계산 (보이는 장부 아닌 전체 장부 기준!)
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
  // 1-2. 장부구분(개인, 장기, 단기) 뱃지 다중 활성/비활성 필터 (기본값: 모두 선택)
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
        relatedTransferId: 'rel-tx-transfer-901',
        tagNames: ['자산이동', '용돈지급'],
        note: '가계부 내 자금 이동 (생활비 지출 왜곡 방지)',
      },
      {
        id: 'tx-g-03',
        ledgerId: 'led-group-01',
        title: '관리비 및 도시가스 자동이체',
        type: 'EXPENSE',
        amount: 284000,
        category: '주거/통신',
        date: '2026-10-05',
        payerName: '공동계좌',
        isAssetTransfer: false,
        tagNames: ['고정지출', '공과금'],
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
        title: '스타벅스 강남 R점 (개인 커피)',
        type: 'EXPENSE',
        amount: 7200,
        category: '식음료/카페',
        date: '2026-10-11',
        payerName: '구본영',
        isAssetTransfer: false,
        tagNames: ['개인지출'],
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

  // --------------------------------------------------------------------------
  // 7. 모달 상태
  // --------------------------------------------------------------------------
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newLedgerModalOpen, setNewLedgerModalOpen] = useState(false);
  const [newTxModalOpen, setNewTxModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

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
  const canAddTransaction = currentUserRole !== 'VIEWER';

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
      <div className="p-4 sm:p-4.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        {/* 좌측: 현재 선택된 장부 명칭 & 결산 주기 & 책갈피 */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Bookmark className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {currentLedger.title}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
              currentLedger.type === 'PERSONAL'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                : currentLedger.type === 'GROUP'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
            }`}>
              {currentLedger.type === 'PERSONAL' ? '개인' : currentLedger.type === 'GROUP' ? '장기 모임' : '단기 모임'}
            </span>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
              {currentLedger.settlementCycle}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {currentLedger.description}
          </p>
        </div>

        {/* 우측: 선택된 장부의 내 권한 시뮬레이터 & 참여자 관리 버튼 (흐름 일치 1.0) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
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
            <span>가계부 참여자 ({currentMembers.length}명)</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. 선택된 가계부 요약 벤토 통계 바 */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 통계 1: 총 잔액 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">가계부 총 잔액</span>
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
            <span className="text-xs font-bold">당월 순수 생활비</span>
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
            생활비 왜곡 방지 분리
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
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              거래 내역 관리
            </span>
            <ElmCnt01 count={filteredTransactions.length} label="총" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <ElmInp04
                value={searchWord}
                onChange={setSearchWord}
                placeholder="가맹점, 입출금자 검색..."
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!canAddTransaction) {
                  setNoticeMessage('[권한 제한] 조회 전용(VIEWER) 권한은 거래를 추가할 수 없습니다.');
                  return;
                }
                setNewTxModalOpen(true);
              }}
              disabled={!canAddTransaction}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                canAddTransaction
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>새 거래 등록</span>
            </button>
          </div>
        </div>

        {/* 카테고리 필터 바 */}
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
            <span>자산이동 분리 표시</span>
          </label>
        </div>

        {/* 거래 항목 테이블 리스트 */}
        <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              조건에 해당하는 거래 내역이 없습니다.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
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
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </span>

                      {tx.isAssetTransfer && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800">
                          자산이동 (생활비제외)
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
                  <span className="text-[10px] text-slate-400">{tx.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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

              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-1">
                <div className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>TRANSFER 단일 연결 (생활비 왜곡 차단)</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  가족 구성원 간 용돈 지급이나 계좌 간 자금 이동은 <strong>순수 생활비 지출 통계에서 자동으로 제외</strong>되며, 1:1 자기참조 페어링으로 관리됩니다.
                </p>
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

      {/* 새 가계부 만들기 안내 모달 */}
      {newLedgerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95">
            <BookOpen className="w-10 h-10 text-indigo-600 mx-auto" />
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              새 가계부 만들기 안내
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              새 가계부 개설은 <strong>대시보드 상단 조직 관리</strong> 및 <strong>새 가계부 모달(NewLedgerModal)</strong>에서 단일 귀속성 검증을 거쳐 생성됩니다.
            </p>
            <button
              type="button"
              onClick={() => setNewLedgerModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
