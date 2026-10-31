import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Ledger } from '../../types';
import {
  ElmTyp01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmSld03,
  ElmFab01,
  ElmSel02,
} from '../elements/Tokens';
import {
  Wallet,
  Sparkles,
  Coins,
  Gamepad2,
  Plus,
  Camera,
  ArrowRight,
  Settings,
  Search,
  Check,
  Target,
  Send,
  Pin,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  Eye,
  EyeOff,
  Bell,
  Clock,
  UserCheck,
  AlertCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Shuffle,
  Users,
  CheckCircle2,
  X,
  Play,
  LayoutGrid,
  List,
  Copy,
  Share2,
  Calendar,
  CreditCard,
  Flame,
} from 'lucide-react';
import { getMemberAllowanceAccount, maskAccountNo } from '../data/accountStorePool';
import { SCR_QCK_01_빠른머니등록 } from './SCR_QCK_01_빠른머니등록';
import { SCR_QCK_02_빠른수행등록 } from './SCR_QCK_02_빠른수행등록';
import { NewLedgerModal } from '../../components/NewLedgerModal';

// ============================================================================
// Types & Module Identifiers (AGENTS.md & PRD UC-04 사양 준수)
// ============================================================================
export type DashboardModuleId =
  | 'bookshelf' // 📚 가계부 책꽂이 (Bookshelf & Deck - 카드/리스트 듀얼 뷰)
  | 'inbound_radar' // 💰 요청된 머니 (따뜻한 웜 앰버 골드 톤 & 송금 딥링크 마감)
  | 'financial_brief' // 💳 종합 자산 & 순수 생활비 현황 (자산이체 분리집계)
  | 'duty_widget' // ⚡ 모아당번 (직교 3상태머신 & 원클릭 승인/인증)
  | 'goal_widget' // 🎯 모아목표 (동행원/관람원 & 오늘 체크인)
  | 'quick_game' // 🎮 게임·정산 퀵런처 (로그인 사용자 맞춤 프리셋 관리)
  | 'activity_feed'; // ⏱️ 서비스 전체 최근 활동 이력 (통합 타임라인)

export type DashboardPreset =
  | 'DEFAULT' // 밸런스 균형형
  | 'FINANCE_FIRST' // 가계부·자산 집중형
  | 'LIFE_FIRST' // 일상·당번 집중형
  | 'QUICK_GAME'; // 게임·정산 중심형

export interface ModuleConfig {
  id: DashboardModuleId;
  enabled: boolean;
  title: string;
  category: '가계부' | '요청머니' | '일상' | '게임' | '활동이력';
  description: string;
}

export interface InboundRequestItem {
  id: string;
  requester_name: string;
  requester_role: string;
  requester_avatar: string;
  amount: number;
  title: string;
  category: string;
  requested_at: string;
  priority: 'URGENT' | 'NORMAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  memo?: string;
  auto_deduct_allowance: boolean;
  bank_name?: string;
  account_number?: string;
}

export interface ExtendedLedgerInfo {
  ledger: Ledger;
  budget_total: number;
  spent_amount: number;
  total_asset: number;
  income_amount: number;
  asset_transfer_amount: number;
  tx_count: number;
  last_item: string;
  is_pinned: boolean;
  accent_color: 'indigo' | 'emerald' | 'amber' | 'purple';
}

export interface GamePreset {
  id: string;
  type: 'LADDER' | 'ROULETTE' | 'SPLIT';
  title: string;
  participants: string[];
  options: string[];
  description: string;
}

export interface ActivityItem {
  id: string;
  service: '가계부' | '요청머니' | '모아당번' | '모아목표' | '게임정산';
  title: string;
  detail: string;
  timestamp: string;
  badgeType: 'INDIGO' | 'EMERALD' | 'AMBER' | 'PURPLE' | 'ROSE';
  amount?: number;
}

const DEFAULT_MODULES: ModuleConfig[] = [
  {
    id: 'bookshelf',
    enabled: true,
    title: '가계부 책꽂이 (Bookshelf)',
    category: '가계부',
    description: '관리 중인 개인/그룹/인스턴스 가계부 덱 및 카드/목록 전환',
  },
  {
    id: 'inbound_radar',
    enabled: true,
    title: '요청된 머니 (Inbound Money)',
    category: '요청머니',
    description: '도착한 모임 정산 및 용돈 지급 요청 모니터링 & 간편 송금',
  },
  {
    id: 'financial_brief',
    enabled: true,
    title: '가계부 금융 & 순수 생활비 브리핑',
    category: '가계부',
    description: '현재 활성 가계부의 순수 생활비(자산이동 분리) 및 예산 소진율',
  },
  {
    id: 'duty_widget',
    enabled: true,
    title: '모아당번 일상 위젯',
    category: '일상',
    description: '직교 3상태머신 기반 당번 과업 및 대신수행 즉시 승인',
  },
  {
    id: 'goal_widget',
    enabled: true,
    title: '모아목표 일상 위젯',
    category: '일상',
    description: '동행원/관람원 챌린지 및 오늘 걸음수/저축 1초 체크인',
  },
  {
    id: 'quick_game',
    enabled: true,
    title: '게임·정산 즉시실행 퀵런처',
    category: '게임',
    description: '로그인 사용자 전용 프리셋(사다리/룰렛) 원클릭 즉시 플레이',
  },
  {
    id: 'activity_feed',
    enabled: true,
    title: '활동이력',
    category: '활동이력',
    description: '가계부·머니·당번·목표·게임 실시간 통합 타임라인 피드',
  },
];

const PRESET_ORDER_MAP: Record<DashboardPreset, DashboardModuleId[]> = {
  DEFAULT: [
    'bookshelf',
    'inbound_radar',
    'financial_brief',
    'duty_widget',
    'goal_widget',
    'quick_game',
    'activity_feed',
  ],
  FINANCE_FIRST: [
    'bookshelf',
    'financial_brief',
    'inbound_radar',
    'activity_feed',
    'duty_widget',
    'goal_widget',
    'quick_game',
  ],
  LIFE_FIRST: [
    'duty_widget',
    'goal_widget',
    'inbound_radar',
    'bookshelf',
    'financial_brief',
    'quick_game',
    'activity_feed',
  ],
  QUICK_GAME: [
    'quick_game',
    'activity_feed',
    'inbound_radar',
    'bookshelf',
    'financial_brief',
    'duty_widget',
    'goal_widget',
  ],
};

const STORAGE_KEY = 'moabogo_dashboard_config_v3';

// ============================================================================
// Component
// ============================================================================
export const SCR_DSH_01_로그인메인대시보드: React.FC<{
  onNavigate?: (screenId: string) => void;
  onOpenCommand?: () => void;
  activeLedger?: Ledger;
  onSelectLedger?: (ledger: Ledger) => void;
  ledgers?: Ledger[];
}> = ({
  onNavigate,
  onOpenCommand,
  activeLedger,
  onSelectLedger,
  ledgers = [
    {
      ledger_id: 'led-group-01',
      owner_id: 'u-1001-koo',
      ledger_name: '우리집 가계부 (가족 공유)',
      ledger_type: 'GROUP',
      is_instance: false,
      role: 'OWNER',
      created_at: '2026-01-03',
    },
    {
      ledger_id: 'led-personal-01',
      owner_id: 'u-1001-koo',
      ledger_name: '내 개인 가계부 (기본)',
      ledger_type: 'PERSONAL',
      is_instance: false,
      role: 'OWNER',
      created_at: '2026-01-01',
    },
    {
      ledger_id: 'led-instance-01',
      owner_id: 'u-1001-koo',
      ledger_name: '2026 상반기 동창 모임 (인스턴스)',
      ledger_type: 'GROUP',
      is_instance: true,
      role: 'OWNER',
      created_at: '2026-03-01',
    },
  ],
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  // 1. 대시보드 개인화 모듈 및 프리셋 상태 (localStorage 영속화)
  const [currentPreset, setCurrentPreset] = useState<DashboardPreset>('DEFAULT');
  const [modules, setModules] = useState<ModuleConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.modules)) return parsed.modules;
      }
    } catch {
      // ignore
    }
    return DEFAULT_MODULES;
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [bookshelfViewMode, setBookshelfViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [isBookshelfExpanded, setIsBookshelfExpanded] = useState<boolean>(true);
  const [isInboundExpanded, setIsInboundExpanded] = useState<boolean>(true);
  const [isFinancialExpanded, setIsFinancialExpanded] = useState<boolean>(true);
  const [isDutyExpanded, setIsDutyExpanded] = useState<boolean>(true);
  const [isGoalExpanded, setIsGoalExpanded] = useState<boolean>(true);
  const [isGameExpanded, setIsGameExpanded] = useState<boolean>(true);
  const [isActivityExpanded, setIsActivityExpanded] = useState<boolean>(true);

  // 2. 장부 책꽂이 확장 상태
  const [extendedLedgers, setExtendedLedgers] = useState<ExtendedLedgerInfo[]>([
    {
      ledger: ledgers[0] || {
        ledger_id: 'led-group-01',
        owner_id: 'u-1001-koo',
        ledger_name: '우리집 가계부 (가족 공유)',
        ledger_type: 'GROUP',
        is_instance: false,
        role: 'OWNER',
        created_at: '2026-01-03',
      },
      budget_total: 2800000,
      spent_amount: 1940000,
      total_asset: 14500000,
      income_amount: 5200000,
      asset_transfer_amount: 1200000,
      tx_count: 42,
      last_item: '이마트 장보기 (₩148,000)',
      is_pinned: true,
      accent_color: 'indigo',
    },
    {
      ledger: ledgers[1] || {
        ledger_id: 'led-personal-01',
        owner_id: 'u-1001-koo',
        ledger_name: '내 개인 가계부 (기본)',
        ledger_type: 'PERSONAL',
        is_instance: false,
        role: 'OWNER',
        created_at: '2026-01-01',
      },
      budget_total: 900000,
      spent_amount: 430000,
      total_asset: 8200000,
      income_amount: 1500000,
      asset_transfer_amount: 350000,
      tx_count: 18,
      last_item: '스타벅스 커피 (₩5,000)',
      is_pinned: false,
      accent_color: 'emerald',
    },
    {
      ledger: ledgers[2] || {
        ledger_id: 'led-instance-01',
        owner_id: 'u-1001-koo',
        ledger_name: '2026 상반기 동창 모임 (인스턴스)',
        ledger_type: 'GROUP',
        is_instance: true,
        role: 'OWNER',
        created_at: '2026-03-01',
      },
      budget_total: 600000,
      spent_amount: 390000,
      total_asset: 210000,
      income_amount: 600000,
      asset_transfer_amount: 0,
      tx_count: 6,
      last_item: '펜션 예약금 1/N 정산',
      is_pinned: false,
      accent_color: 'purple',
    },
  ]);

  // 현재 활성 가계부 ID
  const [currentLedgerId, setCurrentLedgerId] = useState<string>(
    activeLedger?.ledger_id || ledgers[0]?.ledger_id || 'led-group-01'
  );

  const activeLedgerData =
    extendedLedgers.find((l) => l.ledger.ledger_id === currentLedgerId) || extendedLedgers[0];

  // 3. 요청된 머니 (인바운드) 상태 - 따뜻한 웜 앰버 골드 테마 적용
  const [inboundRequests, setInboundRequests] = useState<InboundRequestItem[]>([
    {
      id: 'req-01',
      requester_name: '구민우 (자녀)',
      requester_role: 'MEMBER',
      requester_avatar: '👦',
      amount: 30000,
      title: '새 학기 참고서 및 문구류 구입',
      category: '용돈청구',
      requested_at: '오늘 14:20',
      priority: 'URGENT',
      status: 'PENDING',
      memo: '수학 문제집 2권 구입했어요 영수증 첨부합니다!',
      auto_deduct_allowance: true,
      bank_name: '토스뱅크',
      account_number: '1000-2415-8891',
    },
    {
      id: 'req-02',
      requester_name: '김은지 (배우자)',
      requester_role: 'MEMBER',
      requester_avatar: '👩',
      amount: 45000,
      title: '주말 가족 캠핑 장보기 대납 정산',
      category: '가계부정산',
      requested_at: '어제 19:10',
      priority: 'NORMAL',
      status: 'PENDING',
      memo: '하나로마트에서 고기랑 채소 구매했어요.',
      auto_deduct_allowance: false,
      bank_name: '카카오뱅크',
      account_number: '3333-01-9284712',
    },
  ]);

  // 신규 정산/머니 요청 모달 상태
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState<boolean>(false);
  const [newRequestForm, setNewRequestForm] = useState({
    requester_name: '박준혁 (동창)',
    amount: '25000',
    title: '회식 1/N 식대 분할 정산',
    category: '모임정산',
    memo: '삼겹살 회식 1/N 요청입니다.',
    auto_deduct_allowance: false,
    bank_name: '토스뱅크',
    account_number: '1002-394-118274',
  });

  // 승인 후 송금 딥링크 & 계좌 안내 모달 상태
  const [remittanceModalData, setRemittanceModalData] = useState<{
    open: boolean;
    item?: InboundRequestItem;
    isBatch?: boolean;
    batchItems?: InboundRequestItem[];
  }>({ open: false });

  // 수취 계좌 미등록 시 인라인 직접 입력 상태
  const [manualBankName, setManualBankName] = useState<string>('토스뱅크');
  const [manualAccountNo, setManualAccountNo] = useState<string>('');

  // 송금 마감 모달 내 거절 사유 토글 및 입력 상태
  const [isRejectSectionOpen, setIsRejectSectionOpen] = useState<boolean>(false);
  const [rejectReasonText, setRejectReasonText] = useState<string>('');

  // 4. 모아당번 위젯 상태 (직교 3상태머신)
  const [dutyList, setDutyList] = useState([
    {
      id: 'duty-01',
      title: '화장실 청소 & 수건 교체',
      assigneeName: '구본영 (나)',
      assigneeAvatar: '👨',
      progressStatus: 'ASSIGNED',
      settlementStatus: 'UNSETTLED',
      evaluationStatus: 'UNVERIFIED',
      dueDate: '오늘 21:00',
      substituteRequested: false,
      isApproved: false,
    },
    {
      id: 'duty-02',
      title: '저녁 설거지 & 싱크대 정리',
      assigneeName: '구민우 (자녀)',
      assigneeAvatar: '👦',
      progressStatus: 'IN_PROGRESS',
      settlementStatus: 'UNSETTLED',
      evaluationStatus: 'UNVERIFIED',
      dueDate: '오늘 20:30',
      substituteRequested: true,
      substituteReason: '내일 시험공부로 인해 대신수행 요청',
      isApproved: false,
    },
    {
      id: 'duty-03',
      title: '재활용 분리수거 배출',
      assigneeName: '김은지 (배우자)',
      assigneeAvatar: '👩',
      progressStatus: 'ENDED',
      settlementStatus: 'SETTLED',
      evaluationStatus: 'AUTO_APPROVED',
      dueDate: '어제 완료',
      substituteRequested: false,
      isApproved: true,
    },
  ]);

  // 5. 모아목표 일상 위젯 상태
  const [familyGoalSteps, setFamilyGoalSteps] = useState<number>(8420);
  const [savingsAmount, setSavingsAmount] = useState<number>(3100000);

  // 6. 게임·정산 로그인 맞춤 프리셋 상태 & 관리 모달
  const [gamePresets, setGamePresets] = useState<GamePreset[]>([
    {
      id: 'pre-01',
      type: 'LADDER',
      title: '우리 4인 가족 사다리',
      participants: ['구본영 (나)', '김은지 (배우자)', '구민우 (자녀)', '박준혁 (동창)'],
      options: ['커피 쏘기 ☕', '밥 사기 🍚', '설거지 당번 🧹', '통과! 🎉'],
      description: '주말 가족 벌칙 내기 전용 프리셋',
    },
    {
      id: 'pre-02',
      type: 'ROULETTE',
      title: '개발팀 점심 메뉴 룰렛',
      participants: ['팀 전체'],
      options: ['김치찌개', '수제돈까스', '신선샐러드', '따뜻한국밥', '수제버거', '알리오올리오'],
      description: '선택 장애 방지 점심 룰렛',
    },
    {
      id: 'pre-03',
      type: 'SPLIT',
      title: '동창회 1/N 간편 정산',
      participants: ['본영', '준혁', '영식', '민호', '수진'],
      options: ['균등 분할', '절사 단위: 100원'],
      description: '5인 모임 정산 템플릿',
    },
  ]);

  const [isGamePresetModalOpen, setIsGamePresetModalOpen] = useState<boolean>(false);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<GamePreset>(gamePresets[0]);

  // 퀵 실행 결과 모달
  const [quickLadderResult, setQuickLadderResult] = useState<{
    open: boolean;
    winner?: string;
    action?: string;
    isRolling?: boolean;
  }>({ open: false });

  const [quickRouletteResult, setQuickRouletteResult] = useState<{
    open: boolean;
    menu?: string;
    isSpinning?: boolean;
  }>({ open: false });

  // 7. 활동이력 피드 (Activity Feed) - 20건 풀 데이터 및 뷰 모드·건수 설정·페이징 상태
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([
    {
      id: 'act-01',
      service: '가계부',
      title: '이마트 장보기 지출 기장',
      detail: '우리집 가계부 • 식비 카테고리 ₩148,000 결제 반영',
      timestamp: '10분 전',
      badgeType: 'INDIGO',
      amount: 148000,
    },
    {
      id: 'act-02',
      service: '요청머니',
      title: '구민우(자녀) 참고서 청구 접수',
      detail: '₩30,000 용돈 청구 도착 (대기 중)',
      timestamp: '35분 전',
      badgeType: 'AMBER',
      amount: 30000,
    },
    {
      id: 'act-03',
      service: '모아당번',
      title: '김은지 재활용 분리수거 완료',
      detail: '과업 자동 승인 완료 (is_fulfilled = TRUE)',
      timestamp: '2시간 전',
      badgeType: 'EMERALD',
    },
    {
      id: 'act-04',
      service: '모아목표',
      title: '가족 1만보 걷기 챌린지',
      detail: '김은지 3,200보 추가 인증 (전체 84% 달성)',
      timestamp: '3시간 전',
      badgeType: 'PURPLE',
    },
    {
      id: 'act-05',
      service: '게임정산',
      title: '동창회 펜션 사다리타기 종료',
      detail: '당첨자: 박준혁 (커피 쏘기 ☕)',
      timestamp: '어제 19:40',
      badgeType: 'ROSE',
    },
    {
      id: 'act-06',
      service: '가계부',
      title: '주유소 유류비 카드 결제',
      detail: '개인 가계부 • 교통/차량 ₩75,000 결제 반영',
      timestamp: '어제 18:20',
      badgeType: 'INDIGO',
      amount: 75000,
    },
    {
      id: 'act-07',
      service: '요청머니',
      title: '김은지 캠핑장 대납 정산 승인',
      detail: '₩45,000 송금 완료 처리',
      timestamp: '어제 15:10',
      badgeType: 'AMBER',
      amount: 45000,
    },
    {
      id: 'act-08',
      service: '모아당번',
      title: '구민우 저녁 설거지 과업 완료',
      detail: '부모 확인 후 완료 인증 완료',
      timestamp: '어제 20:50',
      badgeType: 'EMERALD',
    },
    {
      id: 'act-09',
      service: '모아목표',
      title: '가족 여름휴가 적금 목표',
      detail: '월 ₩200,000 자동 저축 달성',
      timestamp: '2일 전',
      badgeType: 'PURPLE',
      amount: 200000,
    },
    {
      id: 'act-10',
      service: '게임정산',
      title: '점심 메뉴 룰렛 돌리기 완료',
      detail: '선택 결과: 신선 샐러드 & 샌드위치 🥗',
      timestamp: '2일 전 12:30',
      badgeType: 'ROSE',
    },
    {
      id: 'act-11',
      service: '가계부',
      title: '넷플릭스 정기 구독료 결제',
      detail: '고정지출 ₩17,000 자동 기장',
      timestamp: '3일 전',
      badgeType: 'INDIGO',
      amount: 17000,
    },
    {
      id: 'act-12',
      service: '요청머니',
      title: '박준혁 회식 1/N 정산 요청 승인',
      detail: '₩25,000 계좌 송금 완료',
      timestamp: '3일 전',
      badgeType: 'AMBER',
      amount: 25000,
    },
    {
      id: 'act-13',
      service: '모아당번',
      title: '구본영 화장실 청소 & 수건 교체 완료',
      detail: '주간 정기 당번 수행 인증 완료',
      timestamp: '3일 전',
      badgeType: 'EMERALD',
    },
    {
      id: 'act-14',
      service: '모아목표',
      title: '한 달 15권 독서 챌린지',
      detail: "도서 '돈의 속성' 완독 기록 완료 📚",
      timestamp: '4일 전',
      badgeType: 'PURPLE',
    },
    {
      id: 'act-15',
      service: '게임정산',
      title: '우리 4인 가족 사다리타기 종료',
      detail: '설거지 당첨자: 구본영 🧽',
      timestamp: '4일 전',
      badgeType: 'ROSE',
    },
    {
      id: 'act-16',
      service: '가계부',
      title: '스타벅스 커피 쿠폰 차감',
      detail: '카페/간식 ₩9,200 결제 반영',
      timestamp: '5일 전',
      badgeType: 'INDIGO',
      amount: 9200,
    },
    {
      id: 'act-17',
      service: '요청머니',
      title: '구민우 학원 교재비 청구 접수',
      detail: '₩52,000 청구 접수 (승인 완료)',
      timestamp: '5일 전',
      badgeType: 'AMBER',
      amount: 52000,
    },
    {
      id: 'act-18',
      service: '모아당번',
      title: '베란다 화분 물주기 당번 완료',
      detail: '김은지 수행 완료 인증 완료 🌱',
      timestamp: '6일 전',
      badgeType: 'EMERALD',
    },
    {
      id: 'act-19',
      service: '모아목표',
      title: '비상금 500만원 모으기',
      detail: '80% 달성 축하 뱃지 획득 🏆',
      timestamp: '6일 전',
      badgeType: 'PURPLE',
    },
    {
      id: 'act-20',
      service: '게임정산',
      title: '주말 디저트 룰렛 돌리기 완료',
      detail: '선택 결과: 와플 & 아메리카노 🧇',
      timestamp: '7일 전',
      badgeType: 'ROSE',
    },
  ]);

  // 활동이력 보기 모드 ('CARD' | 'LIST')
  const [activityViewMode, setActivityViewMode] = useState<'CARD' | 'LIST'>('LIST');
  // 최근 건수 설정 (5, 10, 20)
  const [activityLimit, setActivityLimit] = useState<5 | 10 | 20>(5);
  // 페이징 현재 페이지
  const [activityPage, setActivityPage] = useState<number>(1);

  // 건수 변경 시 페이지를 1로 리셋
  const handleChangeActivityLimit = (limit: 5 | 10 | 20) => {
    setActivityLimit(limit);
    setActivityPage(1);
  };

  // 8. 빠른 모달 상태
  const [activeQuickModal, setActiveQuickModal] = useState<'MONEY' | 'DUTY' | null>(null);
  const [isNewLedgerOpen, setIsNewLedgerOpen] = useState<boolean>(false);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  // 알림 토스트
  const showToast = (msg: string) => {
    setQuickNotice(msg);
    setTimeout(() => setQuickNotice(null), 3500);
  };

  // 가계부 핀 토글
  const togglePin = (ledgerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExtendedLedgers((prev) =>
      prev.map((item) =>
        item.ledger.ledger_id === ledgerId
          ? { ...item, is_pinned: !item.is_pinned }
          : item
      )
    );
  };

  // 요청된 머니 단건 승인 -> 송금 딥링크 모달 오픈
  const handleInitiateApproveInbound = (item: InboundRequestItem) => {
    // 수취 계좌가 비어있으면 하네스 풀에서 대표계좌 조회
    const allowance = getMemberAllowanceAccount('led-group-01', item.requester_name);
    if (allowance.hasAccount && allowance.account && allowance.account.accountNo) {
      setManualBankName(allowance.account.bankName);
      setManualAccountNo(allowance.account.accountNo);
    } else {
      setManualBankName(item.bank_name || '토스뱅크');
      setManualAccountNo(item.account_number || '');
    }

    setRemittanceModalData({
      open: true,
      item,
      isBatch: false,
    });
  };

  // 요청된 머니 전체 일괄 승인 -> 송금 딥링크 모달 오픈
  const handleInitiateApproveAll = () => {
    const pendingList = inboundRequests.filter((r) => r.status === 'PENDING');
    if (pendingList.length === 0) return;
    setRemittanceModalData({
      open: true,
      isBatch: true,
      batchItems: pendingList,
    });
  };

  // 2.1 이체없이 종료처리 (현금전달 등 이체 없이 완료 마감)
  const handleFinishWithoutRemittance = () => {
    if (remittanceModalData.isBatch) {
      setInboundRequests((prev) =>
        prev.map((req) => (req.status === 'PENDING' ? { ...req, status: 'APPROVED' } : req))
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: '대기 중인 요청 머니 일괄 현금 정산 및 마감',
          detail: `${remittanceModalData.batchItems?.length || 0}건 계좌 이체 없이 직접 현금 전달로 완료`,
          timestamp: '방금 전',
          badgeType: 'AMBER',
        },
        ...prev,
      ]);
      showToast('✓ 모든 요청 건을 계좌 이체 없이 직접 정산 완료하고 종료했습니다.');
    } else if (remittanceModalData.item) {
      const itm = remittanceModalData.item;
      setInboundRequests((prev) =>
        prev.map((req) => (req.id === itm.id ? { ...req, status: 'APPROVED' } : req))
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: `[${itm.requester_name}] ${itm.title} 현금 정산 마감`,
          detail: `₩${itm.amount.toLocaleString()} 계좌 이체 없이 직접 현금 전달 완료`,
          timestamp: '방금 전',
          badgeType: 'AMBER',
          amount: itm.amount,
        },
        ...prev,
      ]);
      showToast(`✓ [${itm.requester_name}] ₩${itm.amount.toLocaleString()} 현금 전달 처리 후 마감되었습니다.`);
    }
    setRemittanceModalData({ open: false });
    setIsRejectSectionOpen(false);
    setRejectReasonText('');
  };

  // 송금 링크 확인 후 최종 승인 완료 마감
  const handleFinalizeRemittance = () => {
    if (remittanceModalData.isBatch) {
      setInboundRequests((prev) =>
        prev.map((req) => (req.status === 'PENDING' ? { ...req, status: 'APPROVED' } : req))
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: '대기 중인 요청 머니 일괄 승인 및 송금 마감',
          detail: `${remittanceModalData.batchItems?.length || 0}건 송금 딥링크 연동 완료`,
          timestamp: '방금 전',
          badgeType: 'EMERALD',
        },
        ...prev,
      ]);
      showToast('✓ 모든 요청 머니의 승인 및 송금 마감이 완료되었습니다.');
    } else if (remittanceModalData.item) {
      const itm = remittanceModalData.item;
      setInboundRequests((prev) =>
        prev.map((req) => (req.id === itm.id ? { ...req, status: 'APPROVED' } : req))
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: `[${itm.requester_name}] ${itm.title} 송금 마감`,
          detail: `₩${itm.amount.toLocaleString()} 송금 처리 완료`,
          timestamp: '방금 전',
          badgeType: 'EMERALD',
          amount: itm.amount,
        },
        ...prev,
      ]);
      showToast(`✓ [${itm.requester_name}] ₩${itm.amount.toLocaleString()} 송금 및 승인 마감 완료!`);
    }
    setRemittanceModalData({ open: false });
    setIsRejectSectionOpen(false);
    setRejectReasonText('');
  };

  // 거절 메시지와 함께 요청 마감 (거절마감)
  const handleFinalizeRejectRemittance = () => {
    const reason = rejectReasonText.trim() || '관리자 검토에 따른 거절';
    if (remittanceModalData.isBatch) {
      setInboundRequests((prev) =>
        prev.map((req) =>
          req.status === 'PENDING'
            ? { ...req, status: 'REJECTED', memo: req.memo ? `${req.memo} (거절사유: ${reason})` : `거절사유: ${reason}` }
            : req
        )
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: '대기 중인 요청 머니 일괄 거절 마감',
          detail: `${remittanceModalData.batchItems?.length || 0}건 반려 처리 (${reason})`,
          timestamp: '방금 전',
          badgeType: 'ROSE',
        },
        ...prev,
      ]);
      showToast('요청 머니가 거절마감되었습니다.');
    } else if (remittanceModalData.item) {
      const itm = remittanceModalData.item;
      setInboundRequests((prev) =>
        prev.map((req) =>
          req.id === itm.id
            ? { ...req, status: 'REJECTED', memo: req.memo ? `${req.memo} (거절사유: ${reason})` : `거절사유: ${reason}` }
            : req
        )
      );
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '요청머니',
          title: `[${itm.requester_name}] ${itm.title} 거절 마감`,
          detail: `거절 사유: ${reason}`,
          timestamp: '방금 전',
          badgeType: 'ROSE',
        },
        ...prev,
      ]);
      showToast(`✓ [${itm.requester_name}] 님의 요청을 거절마감했습니다.`);
    }
    setRemittanceModalData({ open: false });
    setIsRejectSectionOpen(false);
    setRejectReasonText('');
  };

  // 요청된 머니 보류
  const handleRejectInbound = (id: string) => {
    setInboundRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'REJECTED' } : req))
    );
    showToast('요청을 보류 처리했습니다.');
  };

  // 신규 요청 제출
  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(newRequestForm.amount.replace(/[^0-9]/g, '') || '0', 10);
    if (amt <= 0 || !newRequestForm.title.trim()) return;

    const newItem: InboundRequestItem = {
      id: `req-${Date.now()}`,
      requester_name: newRequestForm.requester_name,
      requester_role: 'MEMBER',
      requester_avatar: '🙋',
      amount: amt,
      title: newRequestForm.title.trim(),
      category: newRequestForm.category,
      requested_at: '방금 전',
      priority: 'NORMAL',
      status: 'PENDING',
      memo: newRequestForm.memo,
      auto_deduct_allowance: newRequestForm.auto_deduct_allowance,
      bank_name: newRequestForm.bank_name,
      account_number: newRequestForm.account_number,
    };

    setInboundRequests((prev) => [newItem, ...prev]);
    setActivityFeed((prev) => [
      {
        id: `act-${Date.now()}`,
        service: '요청머니',
        title: `새 정산·머니 요청 등록: ${newItem.title}`,
        detail: `[${newItem.requester_name}] ₩${newItem.amount.toLocaleString()} 등록됨`,
        timestamp: '방금 전',
        badgeType: 'AMBER',
        amount: newItem.amount,
      },
      ...prev,
    ]);
    setIsNewRequestModalOpen(false);
    showToast(`✓ 새로운 정산·머니 요청이 목록에 등록되었습니다.`);
  };

  // 당번 대신수행 승인
  const handleApproveDutySubstitute = (dutyId: string) => {
    setDutyList((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              isApproved: true,
              substituteRequested: false,
              evaluationStatus: 'MANUAL_CONFIRMED',
            }
          : d
      )
    );
    showToast('✓ 자녀의 대신수행 요청을 승인했습니다.');
  };

  // 내 당번 즉시 인증/완료
  const handleCompleteMyDuty = (dutyId: string) => {
    setDutyList((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              progressStatus: 'ENDED',
              settlementStatus: 'SETTLED',
              evaluationStatus: 'AUTO_APPROVED',
            }
          : d
      )
    );
    setActivityFeed((prev) => [
      {
        id: `act-${Date.now()}`,
        service: '모아당번',
        title: '화장실 청소 & 수건 교체 완료',
        detail: '구본영 수행 완료 (is_fulfilled = TRUE)',
        timestamp: '방금 전',
        badgeType: 'EMERALD',
      },
      ...prev,
    ]);
    showToast('✓ 오늘 화장실 청소 과업을 완료 처리했습니다!');
  };

  // 목표 1만보 오늘 체크인
  const handleCheckinSteps = () => {
    setFamilyGoalSteps(10000);
    setActivityFeed((prev) => [
      {
        id: `act-${Date.now()}`,
        service: '모아목표',
        title: '가족 1만보 걷기 100% 달성!',
        detail: '구본영 오늘 걸음수 체크인 완료 (10,000보 완주)',
        timestamp: '방금 전',
        badgeType: 'PURPLE',
      },
      ...prev,
    ]);
    showToast('🎉 오늘 10,000보 걸음수 달성 체크인 완료! 동행원 3명 모두 완료했습니다.');
  };

  // 저축 기록 +10만
  const handleAddSavings = () => {
    setSavingsAmount((prev) => prev + 100000);
    showToast('✓ 비상금 목표에 ₩100,000 저축 기록을 반영했습니다.');
  };

  // 퀵 사다리 실행
  const runQuickLadder = () => {
    setQuickLadderResult({ open: true, isRolling: true });
    setTimeout(() => {
      const candidates = selectedQuickPreset.participants.length > 0 ? selectedQuickPreset.participants : ['구본영 (나)', '김은지 (배우자)', '구민우 (자녀)', '박준혁 (동창)'];
      const actions = selectedQuickPreset.options.length > 0 ? selectedQuickPreset.options : ['커피 쏘기 ☕', '밥 사기 🍚', '정리 당번 🧹', '통과! 🎉'];
      const pickedIdx = Math.floor(Math.random() * candidates.length);
      const winner = candidates[pickedIdx];
      const action = actions[pickedIdx % actions.length];
      setQuickLadderResult({
        open: true,
        winner,
        action,
        isRolling: false,
      });
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '게임정산',
          title: `사다리타기 플레이 완료`,
          detail: `당첨자: ${winner} (${action})`,
          timestamp: '방금 전',
          badgeType: 'ROSE',
        },
        ...prev,
      ]);
    }, 1200);
  };

  // 퀵 룰렛 실행
  const runQuickRoulette = () => {
    setQuickRouletteResult({ open: true, isSpinning: true });
    setTimeout(() => {
      const menus = ['김치찌개', '수제돈까스', '신선샐러드', '따뜻한국밥', '수제버거', '알리오올리오'];
      const picked = menus[Math.floor(Math.random() * menus.length)];
      setQuickRouletteResult({
        open: true,
        menu: picked,
        isSpinning: false,
      });
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          service: '게임정산',
          title: `점심 메뉴 룰렛 완료`,
          detail: `선택 메뉴: ${picked}`,
          timestamp: '방금 전',
          badgeType: 'ROSE',
        },
        ...prev,
      ]);
    }, 1400);
  };

  // 프리셋 적용
  const applyPreset = (preset: DashboardPreset) => {
    setCurrentPreset(preset);
    const order = PRESET_ORDER_MAP[preset];
    setModules((prev) => {
      const copy = [...prev];
      copy.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      return copy;
    });
    showToast(`✓ [${preset}] 대시보드 배치 프리셋이 적용되었습니다.`);
  };

  // 모듈 On/Off 토글
  const toggleModule = (id: DashboardModuleId) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // 모듈 순서 이동
  const moveModule = (idx: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;
    const copy = [...modules];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setModules(copy);
  };

  // 모듈 사용 가능 여부 확인
  const isEnabled = (id: DashboardModuleId) => {
    return modules.find((m) => m.id === id)?.enabled ?? true;
  };

  // 대기 중인 요청 머니 집계
  const pendingInbounds = inboundRequests.filter((r) => r.status === 'PENDING');
  const totalPendingInboundAmount = pendingInbounds.reduce((sum, r) => sum + r.amount, 0);

  // 핀 고정된 가계부 우선 정렬
  const sortedLedgers = [...extendedLedgers].sort((a, b) => {
    if (a.is_pinned === b.is_pinned) return 0;
    return a.is_pinned ? -1 : 1;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ===================================================================
          Top Header & Action Bar (SCR-LED-01 기준 상단 여백 축소 및 타이틀 정돈)
          =================================================================== */}
      <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <ElmTyp01
            title="메인 대시보드"
            subtitle={`${activeLedgerData.ledger.ledger_name} • 맞춤 적응형 벤토 허브`}
            className="min-w-0"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold border border-slate-200 dark:border-zinc-700 shrink-0 opacity-70">
            SCR-DSH-01
          </span>
        </div>

        {/* 툴바 액션: 검색, 맞춤설정, 환경설정 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenCommand && (
            <button
              type="button"
              onClick={onOpenCommand}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-indigo-400 cursor-pointer shadow-2xs"
              title="검색 및 명령어 바 열기 (⌘K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">검색 / 명령</span>
              <kbd className="hidden sm:inline font-mono text-[10px] px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">
                ⌘K
              </kbd>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 cursor-pointer text-xs font-semibold shadow-2xs"
            title="대시보드 위젯 On/Off 및 배치 커스터마이징"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">맞춤 설정</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('SCR-SET-01')}
            className="p-2 rounded-xl border transition-colors bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shadow-2xs shrink-0"
            title="사용자 환경설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 인라인 알림 배너 (Toast) */}
      {quickNotice && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{quickNotice}</span>
          </div>
          <button
            onClick={() => setQuickNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================================
          MODULE 1: 📚 가계부 책꽂이 (Bookshelf & Deck - 카드/리스트 듀얼 뷰)
          =================================================================== */}
      {isEnabled('bookshelf') && (
        <section
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-colors ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* 책꽂이 헤더 & 듀얼 뷰어 토글 아이콘 */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  장부 책꽂이
                  <span className="text-[11px] font-normal text-slate-400">
                    ({extendedLedgers.length}권 관리 중)
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  선택 시 대시보드 금융 데이터가 즉시 전환되며, 장부 관리에서 복귀 가능합니다
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto self-end sm:self-auto shrink-0">
              {/* 카드 / 목록 뷰어 전환 아이콘 버튼 (요청 3번) */}
              <div
                className={`flex items-center p-0.5 rounded-lg border ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#101e42] border-[#1e3a6d]'
                    : isDark
                    ? 'bg-zinc-800/80 border-zinc-700'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setBookshelfViewMode('GRID')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    bookshelfViewMode === 'GRID'
                      ? resolvedTheme === 'dawn'
                        ? 'bg-[#1b2b54] text-indigo-300 shadow-2xs font-bold'
                        : isDark
                        ? 'bg-zinc-700 text-indigo-400 shadow-2xs font-bold'
                        : 'bg-white text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="카드 뷰어"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBookshelfViewMode('LIST')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    bookshelfViewMode === 'LIST'
                      ? resolvedTheme === 'dawn'
                        ? 'bg-[#1b2b54] text-indigo-300 shadow-2xs font-bold'
                        : isDark
                        ? 'bg-zinc-700 text-indigo-400 shadow-2xs font-bold'
                        : 'bg-white text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="목록 뷰어"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 새 가계부 버튼 */}
              <button
                type="button"
                onClick={() => setIsNewLedgerOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border shadow-2xs ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#1b2b54] text-indigo-300 border-[#2a437e] hover:bg-[#233768]'
                    : isDark
                    ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800 hover:bg-indigo-900/60'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 가계부</span>
              </button>

              {/* 표준 아코디언 토글 버튼 */}
              <button
                type="button"
                onClick={() => setIsBookshelfExpanded((prev) => !prev)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                    : isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title={isBookshelfExpanded ? '책꽂이 접기' : '책꽂이 펼치기'}
              >
                {isBookshelfExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isBookshelfExpanded && (
            <>
              {/* 3.1 카드 뷰어 (GRID Mode) */}
              {bookshelfViewMode === 'GRID' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sortedLedgers.map((item) => {
                    const isCurrent = item.ledger.ledger_id === currentLedgerId;
                    const spendRate = Math.min(
                      100,
                      Math.round((item.spent_amount / item.budget_total) * 100)
                    );

                    return (
                      <div
                        key={item.ledger.ledger_id}
                        onClick={() => {
                          setCurrentLedgerId(item.ledger.ledger_id);
                          if (onSelectLedger) onSelectLedger(item.ledger);
                        }}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                          isCurrent
                            ? resolvedTheme === 'dawn'
                              ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-xs'
                              : isDark
                              ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                            : resolvedTheme === 'dawn'
                            ? 'border-[#1e3a6d] bg-[#101e42]/60 hover:border-indigo-400'
                            : isDark
                            ? 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-400'
                        }`}
                      >
                        {/* 카드 상단 배지 & 핀 고정 */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                item.ledger.ledger_type === 'GROUP'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              }`}
                            >
                              {item.ledger.is_instance
                                ? '인스턴스 정산'
                                : item.ledger.ledger_type === 'GROUP'
                                ? '가족/그룹'
                                : '개인장부'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-600 text-white">
                                열람 중 📖
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => togglePin(item.ledger.ledger_id, e)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              item.is_pinned
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-slate-300 dark:text-zinc-600 hover:text-slate-500'
                            }`}
                            title={item.is_pinned ? '즐겨찾기 고정 해제' : '상단 고정 핀'}
                          >
                            <Pin className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        {/* 가계부 명 및 최근 활동 */}
                        <div className="mt-2.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.ledger.ledger_name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            최근: {item.last_item} ({item.tx_count}건 기록)
                          </p>
                        </div>

                        {/* 지출액 & 소진 게이지 */}
                        <div className={`mt-3 pt-2.5 border-t ${
                          resolvedTheme === 'dawn'
                            ? 'border-[#1e3a6d]'
                            : isDark
                            ? 'border-zinc-800'
                            : 'border-slate-200/80'
                        }`}>
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-[11px] text-slate-400">당월 지출</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              ₩{item.spent_amount.toLocaleString()}
                            </span>
                          </div>
                          <div className={`mt-1.5 w-full h-1.5 rounded-full overflow-hidden ${
                            resolvedTheme === 'dawn'
                              ? 'bg-[#1b2b54]'
                              : isDark
                              ? 'bg-zinc-800'
                              : 'bg-slate-200'
                          }`}>
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                spendRate > 80
                                    ? 'bg-rose-500'
                                    : spendRate > 50
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${spendRate}%` }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                            <span>예산 {spendRate}% 소진</span>
                            <span>잔여 ₩{(item.budget_total - item.spent_amount).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* 빠른 액션 링크 (호버/포커스 시) */}
                        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                          resolvedTheme === 'dawn'
                            ? 'border-[#1e3a6d]'
                            : isDark
                            ? 'border-zinc-800'
                            : 'border-slate-100'
                        }`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveQuickModal('MONEY');
                            }}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                          >
                            + 머니등록
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) onNavigate('SCR-LED-01');
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
                            title="장부 관리 상세로 이동 (상단 < 아이콘으로 언제든 복구 가능)"
                          >
                            장부 관리 →
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 2. 가계부 생성 카드는 홀수로 공간이 남을 때만 표시 (요청 2번) */}
                  {sortedLedgers.length % 2 !== 0 && (
                    <div
                      onClick={() => setIsNewLedgerOpen(true)}
                      className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-colors group min-h-[160px] ${
                        resolvedTheme === 'dawn'
                          ? 'border-[#1e3a6d] bg-[#101e42]/40 hover:border-indigo-400'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-900/40 hover:border-indigo-500'
                          : 'border-slate-300 bg-slate-50/30 hover:border-indigo-500'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                        새 가계부 추가
                      </span>
                      <span className="text-[10px] text-slate-400">
                        1인 다중 가계부 생성
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 3.2 목록 뷰어 (LIST Mode - 요청 3번) */}
              {bookshelfViewMode === 'LIST' && (
                <div className={`overflow-x-auto rounded-xl border ${
                  resolvedTheme === 'dawn'
                    ? 'border-[#1e3a6d]'
                    : isDark
                    ? 'border-zinc-800'
                    : 'border-slate-200'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold text-slate-500 dark:text-zinc-400 ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42] border-[#1e3a6d]'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">핀</th>
                        <th className="py-2.5 px-3">가계부 구분</th>
                        <th className="py-2.5 px-3">가계부 명 / 최근 내역</th>
                        <th className="py-2.5 px-3 text-right">당월 지출</th>
                        <th className="py-2.5 px-3 text-center">소진율</th>
                        <th className="py-2.5 px-3 text-right">잔여 예산</th>
                        <th className="py-2.5 px-3 text-center">작업</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      resolvedTheme === 'dawn'
                        ? 'divide-[#1e3a6d]'
                        : isDark
                        ? 'divide-zinc-800'
                        : 'divide-slate-100'
                    }`}>
                      {sortedLedgers.map((item) => {
                        const isCurrent = item.ledger.ledger_id === currentLedgerId;
                        const spendRate = Math.min(
                          100,
                          Math.round((item.spent_amount / item.budget_total) * 100)
                        );

                        return (
                          <tr
                            key={item.ledger.ledger_id}
                            onClick={() => {
                              setCurrentLedgerId(item.ledger.ledger_id);
                              if (onSelectLedger) onSelectLedger(item.ledger);
                            }}
                            className={`transition-colors cursor-pointer ${
                              isCurrent
                                ? resolvedTheme === 'dawn'
                                  ? 'bg-indigo-950/40 font-semibold'
                                  : isDark
                                  ? 'bg-indigo-950/30 font-semibold'
                                  : 'bg-indigo-50/50 font-semibold'
                                : resolvedTheme === 'dawn'
                                ? 'hover:bg-[#101e42]/60'
                                : isDark
                                ? 'hover:bg-zinc-850/60'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={(e) => togglePin(item.ledger.ledger_id, e)}
                                className="cursor-pointer"
                              >
                                <Pin
                                  className={`w-3.5 h-3.5 ${
                                    item.is_pinned
                                      ? 'text-amber-500 fill-current'
                                      : 'text-slate-300 dark:text-zinc-600'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                  item.ledger.ledger_type === 'GROUP'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                }`}
                              >
                                {item.ledger.is_instance
                                  ? '인스턴스'
                                  : item.ledger.ledger_type === 'GROUP'
                                  ? '가족/그룹'
                                  : '개인'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {item.ledger.ledger_name}
                                {isCurrent && (
                                  <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-indigo-600 text-white font-black">
                                    열람 중
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {item.last_item}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                              ₩{item.spent_amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  spendRate > 80
                                    ? 'text-rose-500'
                                    : spendRate > 50
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                                }`}
                              >
                                {spendRate}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                              ₩{(item.budget_total - item.spent_amount).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigate) onNavigate('SCR-LED-01');
                                }}
                                className="px-2 py-1 text-[11px] rounded bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                              >
                                관리
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ===================================================================
          MODULE 2: 💰 요청된 머니 (Inbound Money) - 웜 앰버 골드 톤 & 송금 마감
          =================================================================== */}
      {isEnabled('inbound_radar') && (
        <section
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-colors ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col gap-2.5 mb-3.5">
            {/* 첫 번째 행: 좌측 타이틀 영역 + 우측 [+ 정산·머니 요청 버튼(줄바꿈 제한) + 토글버튼] */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Coins className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>요청된 머니</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      ({inboundRequests.length}건 등록됨)
                    </span>
                    {pendingInbounds.length > 0 && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                    도착한 모임 정산 및 용돈 지급 요청을 확인하고 송금 링크로 마감합니다
                  </p>
                </div>
              </div>

              {/* 첫줄 우측: [+ 정산·머니 요청 버튼] + [상세 관리 이동] + [토글버튼] */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                    resolvedTheme === 'dawn'
                      ? 'border-amber-700/80 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40'
                      : isDark
                      ? 'border-amber-700/80 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50'
                      : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">+ 정산·머니 요청</span>
                </button>

                {/* 모아머니 상세 관리 화면 (SCR-MON-01) 딥링크 이동 */}
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('SCR-MON-01')}
                  className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d] bg-[#101e42] text-amber-300 hover:text-white'
                      : isDark
                      ? 'border-zinc-700 bg-zinc-800 text-amber-300 hover:text-white'
                      : 'border-slate-200 bg-white text-amber-700 hover:bg-slate-50'
                  }`}
                  title="모아머니 통합 이동관리 화면으로 이동"
                >
                  <span className="whitespace-nowrap">상세 관리</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                {/* 표준 아코디언 토글 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsInboundExpanded(!isInboundExpanded)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                    resolvedTheme === 'dawn'
                      ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                      : isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={isInboundExpanded ? '요청된 머니 접기' : '요청된 머니 펼치기'}
                >
                  {isInboundExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 모바일 화면용 설명 텍스트 (줄바꿈 표시) */}
            <p className="text-[11px] text-slate-400 sm:hidden">
              도착한 모임 정산 및 용돈 지급 요청을 확인하고 송금 링크로 마감합니다
            </p>

            {/* 두 번째 행: 우측정렬 [대기 건수/금액 뱃지] + [전체 일괄 승인 & 송금 버튼] - 토글 대상 편입 */}
            {isInboundExpanded && (
              <div className="flex items-center justify-end gap-2 flex-wrap animate-in fade-in-50 duration-150">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    pendingInbounds.length > 0
                      ? resolvedTheme === 'dawn'
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-800'
                        : isDark
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                      : resolvedTheme === 'dawn'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                      : isDark
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  {pendingInbounds.length > 0
                    ? `대기 ${pendingInbounds.length}건 (₩${totalPendingInboundAmount.toLocaleString()})`
                    : '✓ 모두 해결됨'}
                </span>

                {pendingInbounds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleInitiateApproveAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs"
                  >
                    전체 일괄 승인 & 송금
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 요청 목록 (웜 앰버 골드 톤) - 접힘/펼침 제어 */}
          {isInboundExpanded && (
            <>
              {pendingInbounds.length === 0 ? (
            <div className={`p-6 rounded-xl border border-dashed text-center space-y-1 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#101e42]/40 border-[#1e3a6d]'
                : isDark
                ? 'bg-zinc-900/40 border-zinc-800'
                : 'bg-slate-50/50 border-slate-200'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                도착한 요청 머니가 모두 해결되었습니다!
              </p>
              <p className="text-[11px] text-slate-400">
                자녀 용돈 청구 및 모임 정산 요청이 접수되면 실시간으로 안내합니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingInbounds.map((req) => (
                <div
                  key={req.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all hover:border-amber-400 ${
                    resolvedTheme === 'dawn'
                      ? 'border-amber-900/60 bg-amber-950/20'
                      : isDark
                      ? 'border-amber-900/60 bg-amber-950/15'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {req.requester_avatar}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {req.requester_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                        {req.requested_at}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {req.title}
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-300">
                          ₩{req.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {req.auto_deduct_allowance ? '용돈 차감 연동' : '1/N 분할청구'}
                        </span>
                      </div>
                      {req.memo && (
                        <p className={`text-[10px] mt-1 p-1.5 rounded-md border ${
                          resolvedTheme === 'dawn'
                            ? 'bg-[#101e42]/80 border-amber-900/40 text-zinc-300'
                            : isDark
                            ? 'bg-zinc-900/80 border-amber-900/40 text-zinc-300'
                            : 'bg-white/80 border-amber-100 text-slate-600'
                        }`}>
                          "{req.memo}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between gap-1.5 ${
                    resolvedTheme === 'dawn'
                      ? 'border-amber-900/40'
                      : isDark
                      ? 'border-amber-900/40'
                      : 'border-amber-100'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleRejectInbound(req.id)}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      보류
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInitiateApproveInbound(req)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>승인 및 송금 마감</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
      )}

      {/* ===================================================================
          BENTO GRID: 3-Col / 4-Col Adaptive Auto-Reflow Layout
          =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* =================================================================
            MODULE 3: 💳 종합 자산 & 순수 생활비 현황 (2-Col Span)
            ================================================================= */}
        {isEnabled('financial_brief') && (
          <div
            className={`lg:col-span-2 p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      순수 생활비
                      <span className="text-[11px] font-normal text-slate-400">
                        ({activeLedgerData.ledger.ledger_name})
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      계좌 간 단순 이동(TRANSFER) 분리 및 당월 순수 소비 현황
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto self-end sm:self-auto shrink-0">
                  <ElmStt01 type="EMERALD" label="정상 예산 집계" />
                  {/* 표준 아코디언 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsFinancialExpanded(!isFinancialExpanded)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                        : isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isFinancialExpanded ? '생활비 브리핑 접기' : '생활비 브리핑 펼치기'}
                  >
                    {isFinancialExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isFinancialExpanded && (
                <>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-3xl font-black tracking-tight font-mono text-slate-900 dark:text-white">
                        ₩{activeLedgerData.spent_amount.toLocaleString()}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        당월 예산 ₩{activeLedgerData.budget_total.toLocaleString()} 중{' '}
                        <strong className="text-emerald-500 font-mono">
                          {Math.round(
                            (activeLedgerData.spent_amount / activeLedgerData.budget_total) * 100
                          )}
                          %
                        </strong>{' '}
                        소진 (19일 잔여)
                      </p>
                      {/* 예산 소진율 게이지 */}
                      <div className={`mt-2.5 w-full h-2 rounded-full overflow-hidden ${
                        resolvedTheme === 'dawn'
                          ? 'bg-[#1b2b54]'
                          : isDark
                          ? 'bg-zinc-800'
                          : 'bg-slate-100'
                      }`}>
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (activeLedgerData.spent_amount / activeLedgerData.budget_total) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 통계 분리 보장 안내 박스 */}
                    <div className={`p-3 rounded-xl border space-y-2 text-xs ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42]/60 border-[#1e3a6d]'
                        : isDark
                        ? 'bg-zinc-900/60 border-zinc-800'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500 dark:text-zinc-400">총 자산 잔액</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                          ₩{activeLedgerData.total_asset.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500 dark:text-zinc-400">순수 당월 수입</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          +₩{activeLedgerData.income_amount.toLocaleString()}
                        </span>
                      </div>
                      {/* 자산이체 분리 안내 */}
                      <div className={`pt-1.5 border-t space-y-0.5 ${
                        resolvedTheme === 'dawn'
                          ? 'border-[#1e3a6d]'
                          : isDark
                          ? 'border-zinc-800'
                          : 'border-slate-200'
                      }`}>
                        <div className="flex justify-between items-baseline font-medium">
                          <span className="text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                            자산이체(용돈·저축 등)
                          </span>
                          <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-400">
                            ₩{activeLedgerData.asset_transfer_amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          * 계좌 간 단순 이동(TRANSFER)으로 순수 생활비 지출 통계에서 안전하게 분리 제외됨
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d]'
                      : isDark
                      ? 'border-zinc-800'
                      : 'border-slate-100'
                  }`}>
                    <span className="text-[11px] text-slate-400">
                      1:1 TRANSFER 페어링 연결 보장
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('SCR-LED-01')}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>장부 관리 상세</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            MODULE 4: ⚡ 모아당번 일상 위젯 (1-Col Span)
            ================================================================= */}
        {isEnabled('duty_widget') && (
          <div
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      모아당번
                      <span className="text-[11px] font-normal text-slate-400">
                        (3과업 진행)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      직교 3상태머신 기반 당번 과업 및 대신수행 즉시 승인
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto self-end sm:self-auto shrink-0">
                  <ElmStt01 type="INDIGO" label="직교 3상태" />
                  {/* 표준 아코디언 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsDutyExpanded(!isDutyExpanded)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                        : isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isDutyExpanded ? '모아당번 접기' : '모아당번 펼치기'}
                  >
                    {isDutyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isDutyExpanded && (
                <>
                  {/* 과업 목록 */}
                  <div className="mt-3 space-y-2.5">
                    {dutyList.slice(0, 2).map((duty) => (
                      <div
                        key={duty.id}
                        className={`p-2.5 rounded-xl border space-y-1.5 text-xs ${
                          resolvedTheme === 'dawn'
                            ? 'border-[#1e3a6d] bg-[#101e42]/50'
                            : isDark
                            ? 'border-zinc-800 bg-zinc-900/50'
                            : 'border-slate-100 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {duty.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {duty.dueDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1">
                            <span>{duty.assigneeAvatar}</span>
                            <span className="text-slate-600 dark:text-zinc-400">
                              {duty.assigneeName}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              duty.progressStatus === 'ENDED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                            }`}
                          >
                            {duty.progressStatus === 'ENDED' ? '수행완료' : '진행중'}
                          </span>
                        </div>

                        {duty.substituteRequested && !duty.isApproved && (
                          <div className={`pt-1.5 border-t flex items-center justify-between text-[11px] ${
                            resolvedTheme === 'dawn'
                              ? 'border-[#1e3a6d]'
                              : isDark
                              ? 'border-zinc-800'
                              : 'border-slate-200'
                          }`}>
                            <span className="text-purple-600 dark:text-purple-400 font-bold truncate">
                              대신수행 요청됨
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApproveDutySubstitute(duty.id)}
                              className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              승인
                            </button>
                          </div>
                        )}

                        {duty.id === 'duty-01' && duty.progressStatus === 'ASSIGNED' && (
                          <div className={`pt-1.5 border-t flex items-center justify-end ${
                            resolvedTheme === 'dawn'
                              ? 'border-[#1e3a6d]'
                              : isDark
                              ? 'border-zinc-800'
                              : 'border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleCompleteMyDuty(duty.id)}
                              className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              오늘 완료 인증 ✓
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d]'
                      : isDark
                      ? 'border-zinc-800'
                      : 'border-slate-100'
                  }`}>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('SCR-DUT-01')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>당번 관리 상세</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <ElmCnt01 count="3과업 진행" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            MODULE 5: 🎯 모아목표 일상 위젯 (1-Col Span)
            ================================================================= */}
        {isEnabled('goal_widget') && (
          <div
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <Target className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      모아목표
                      <span className="text-[11px] font-normal text-slate-400">
                        (동행 3명)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      동행원/관람원 챌린지 및 오늘 걸음수/저축 1초 체크인
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto self-end sm:self-auto shrink-0">
                  <ElmStt01 type="INDIGO" label="2개 진행" />
                  {/* 표준 아코디언 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsGoalExpanded(!isGoalExpanded)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                        : isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isGoalExpanded ? '모아목표 접기' : '모아목표 펼치기'}
                  >
                    {isGoalExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isGoalExpanded && (
                <>
                  <div className="mt-3 space-y-3">
                    {/* 목표 1: 1만보 걷기 */}
                    <div className={`p-2.5 rounded-xl border text-xs ${
                      resolvedTheme === 'dawn'
                        ? 'border-[#1e3a6d] bg-[#101e42]/50'
                        : isDark
                        ? 'border-zinc-800 bg-zinc-900/50'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          가족 1만보 걷기 챌린지
                        </span>
                        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                          {Math.round((familyGoalSteps / 10000) * 100)}%
                        </span>
                      </div>
                      <div className={`mt-1.5 w-full h-1.5 rounded-full overflow-hidden ${
                        resolvedTheme === 'dawn'
                          ? 'bg-[#1b2b54]'
                          : isDark
                          ? 'bg-zinc-800'
                          : 'bg-slate-200'
                      }`}>
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (familyGoalSteps / 10000) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <div className="flex items-center -space-x-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
                            구
                          </span>
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                            김
                          </span>
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                            민
                          </span>
                        </div>
                        {familyGoalSteps < 10000 ? (
                          <button
                            type="button"
                            onClick={handleCheckinSteps}
                            className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                          >
                            오늘 체크인 👣
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-bold text-[10px]">
                            ✓ 전원 달성
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 목표 2: 비상금 모으기 */}
                    <div className={`p-2.5 rounded-xl border text-xs ${
                      resolvedTheme === 'dawn'
                        ? 'border-[#1e3a6d] bg-[#101e42]/50'
                        : isDark
                        ? 'border-zinc-800 bg-zinc-900/50'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          비상금 500만원 모으기
                        </span>
                        <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold shrink-0">
                          {Math.round((savingsAmount / 5000000) * 100)}%
                        </span>
                      </div>
                      <div className={`mt-1.5 w-full h-1.5 rounded-full overflow-hidden ${
                        resolvedTheme === 'dawn'
                          ? 'bg-[#1b2b54]'
                          : isDark
                          ? 'bg-zinc-800'
                          : 'bg-slate-200'
                      }`}>
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (savingsAmount / 5000000) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-400">
                          누적 ₩{savingsAmount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={handleAddSavings}
                          className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          저축 +10만 💰
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d]'
                      : isDark
                      ? 'border-zinc-800'
                      : 'border-slate-100'
                  }`}>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('SCR-GOL-01')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>목표 관리 상세</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <ElmCnt01 count="2개 진행" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            MODULE 6: 🎮 게임·정산 퀵런처 (2-Col Span - 로그인 전용 프리셋 관리)
            ================================================================= */}
        {isEnabled('quick_game') && (
          <div
            className={`lg:col-span-2 p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-purple-400/50 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      게임·정산 퀵런처
                      <span className="text-[11px] font-normal text-slate-400">
                        ({gamePresets.length}개 프리셋)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      로그인 회원 전용: 자주 쓰는 멤버·벌칙 옵션 원클릭 즉시 플레이
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto self-end sm:self-auto shrink-0">
                  {/* 프리셋 관리 모달 트리거 (요청 7번) */}
                  <button
                    type="button"
                    onClick={() => setIsGamePresetModalOpen(true)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                      resolvedTheme === 'dawn'
                        ? 'border-purple-700/80 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40'
                        : isDark
                        ? 'border-purple-700/80 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                        : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    ⚙️ 프리셋 관리 ({gamePresets.length})
                  </button>
                  {/* 표준 아코디언 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsGameExpanded(!isGameExpanded)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                        : isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isGameExpanded ? '게임 퀵런처 접기' : '게임 퀵런처 펼치기'}
                  >
                    {isGameExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isGameExpanded && (
                <>
                  {/* 프리셋 카드 그리드 */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 프리셋 1: 사다리타기 */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                  resolvedTheme === 'dawn'
                    ? 'border-[#1e3a6d] bg-[#101e42]/50'
                    : isDark
                    ? 'border-zinc-800 bg-zinc-900/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                        🪜 {gamePresets[0]?.title || '우리 4인 가족 사다리'}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold shrink-0">
                        {gamePresets[0]?.participants.length || 4}인 프리셋
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {gamePresets[0]?.description || '주말 가족 벌칙 내기 전용'}
                    </p>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between gap-1 ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d]'
                      : isDark
                      ? 'border-zinc-800'
                      : 'border-slate-200/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setIsGamePresetModalOpen(true)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
                    >
                      옵션 수정
                    </button>
                    <button
                      type="button"
                      onClick={runQuickLadder}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>바로 플레이</span>
                    </button>
                  </div>
                </div>

                {/* 프리셋 2: 점심 메뉴 룰렛 */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                  resolvedTheme === 'dawn'
                    ? 'border-[#1e3a6d] bg-[#101e42]/50'
                    : isDark
                    ? 'border-zinc-800 bg-zinc-900/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                        🎯 {gamePresets[1]?.title || '점심 메뉴 룰렛'}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold shrink-0">
                        {gamePresets[1]?.options.length || 6}개 메뉴
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {gamePresets[1]?.description || '선택 장애 방지 점심 룰렛'}
                    </p>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between gap-1 ${
                    resolvedTheme === 'dawn'
                      ? 'border-[#1e3a6d]'
                      : isDark
                      ? 'border-zinc-800'
                      : 'border-slate-200/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setIsGamePresetModalOpen(true)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
                    >
                      메뉴 변경
                    </button>
                    <button
                      type="button"
                      onClick={runQuickRoulette}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>룰렛 돌리기</span>
                    </button>
                  </div>
                </div>
              </div>

            <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
              resolvedTheme === 'dawn'
                ? 'border-[#1e3a6d]'
                : isDark
                ? 'border-zinc-800'
                : 'border-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('SCR-GNT-01')}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                title="게스트홈 전체 플레이 존으로 이동"
              >
                <span>게스트홈 전체 게임센터 열기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-400">맞춤 프리셋 영속 보존됨</span>
            </div>
          </>
        )}
        </div>
      </div>
    )}
  </div>

      {/* ===================================================================
          MODULE 7: ⏱️ 활동이력 (Activity Feed - 요청 3번: 목록/카드 뷰어, 5/10/20건, 페이징/5줄 스크롤)
          =================================================================== */}
      {isEnabled('activity_feed') && (() => {
        const effectiveFeed = activityFeed.slice(0, activityLimit);
        const PAGE_SIZE = 5;
        const totalPages = Math.ceil(effectiveFeed.length / PAGE_SIZE);
        const safePage = Math.min(activityPage, Math.max(1, totalPages));
        const currentPageFeed = effectiveFeed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

        return (
          <section
            className={`p-5 rounded-2xl border shadow-xs space-y-3.5 transition-colors ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* 상단 헤더: 타이틀, 5/10/20건 선택 세그먼트, 카드/목록 뷰어 토글 */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
              resolvedTheme === 'dawn'
                ? 'border-[#1e3a6d]'
                : isDark
                ? 'border-zinc-800'
                : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>활동이력</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      (최근 {effectiveFeed.length}건)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    가계부·요청머니·당번·목표·게임 실시간 통합 타임라인 피드
                  </p>
                </div>
              </div>

              {/* 우측 컨트롤러: 건수 선택 (5, 10, 20) + 보기 모드 (목록 / 카드) + 아코디언 토글 */}
              <div className="flex items-center gap-2 ml-auto self-end sm:self-auto flex-wrap shrink-0">
                {/* 1. 최근 건수 설정 (5, 10, 20) */}
                <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#101e42] border-[#1e3a6d]'
                    : isDark
                    ? 'bg-zinc-800/80 border-zinc-700'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-medium text-slate-400 px-1.5 hidden xs:inline">
                    표시:
                  </span>
                  {([5, 10, 20] as const).map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => handleChangeActivityLimit(limit)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        activityLimit === limit
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={`최근 ${limit}건 표시`}
                    >
                      {limit}건
                    </button>
                  ))}
                </div>

                {/* 2. 목록 / 카드 보기모드 아이콘 토글 */}
                <div className={`flex items-center p-0.5 rounded-lg border ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#101e42] border-[#1e3a6d]'
                    : isDark
                    ? 'bg-zinc-800/80 border-zinc-700'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setActivityViewMode('LIST')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      activityViewMode === 'LIST'
                        ? resolvedTheme === 'dawn'
                          ? 'bg-[#1b2b54] text-indigo-300 shadow-2xs font-bold'
                          : isDark
                          ? 'bg-zinc-700 text-indigo-400 shadow-2xs'
                          : 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                    }`}
                    title="목록 뷰어"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityViewMode('CARD')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      activityViewMode === 'CARD'
                        ? resolvedTheme === 'dawn'
                          ? 'bg-[#1b2b54] text-indigo-300 shadow-2xs font-bold'
                          : isDark
                          ? 'bg-zinc-700 text-indigo-400 shadow-2xs'
                          : 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                    }`}
                    title="카드 뷰어"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 표준 아코디언 토글 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
                    resolvedTheme === 'dawn'
                      ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
                      : isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={isActivityExpanded ? '활동이력 접기' : '활동이력 펼치기'}
                >
                  {isActivityExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isActivityExpanded && (
              <>
                {/* 3. 본문 뷰어 컨테이너: 5줄 넘어가면 스크롤 적용 (max-h-[380px] overflow-y-auto) */}
            <div className="max-h-[380px] overflow-y-auto pr-1">
              {activityViewMode === 'LIST' ? (
                /* 3-A. 목록 뷰어 */
                <div className="space-y-1.5">
                  {currentPageFeed.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                        resolvedTheme === 'dawn'
                          ? 'border-[#1e3a6d] bg-[#101e42]/50 hover:bg-[#152756]/70'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/70'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.badgeType === 'INDIGO'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                              : item.badgeType === 'EMERALD'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : item.badgeType === 'AMBER'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                              : item.badgeType === 'PURPLE'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {item.service}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {item.detail}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                        {item.amount ? (
                          <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                            ₩{item.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">인증완료</span>
                        )}
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 3-B. 카드 뷰어 */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {currentPageFeed.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 hover:border-indigo-400 ${
                        resolvedTheme === 'dawn'
                          ? 'border-[#1e3a6d] bg-[#101e42]/50'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-900/50'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.badgeType === 'INDIGO'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                                : item.badgeType === 'EMERALD'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : item.badgeType === 'AMBER'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                : item.badgeType === 'PURPLE'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {item.service}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-snug">
                          {item.detail}
                        </p>
                      </div>

                      <div className={`pt-2 border-t flex items-center justify-between ${
                        resolvedTheme === 'dawn'
                          ? 'border-[#1e3a6d]'
                          : isDark
                          ? 'border-zinc-800'
                          : 'border-slate-200/80'
                      }`}>
                        <span className="text-[10px] text-slate-400">활동 내역</span>
                        {item.amount ? (
                          <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                            ₩{item.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ 완료됨
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. 페이징 컨트롤 바 (5줄 초과 또는 페이지 분할 시 동작) */}
            {totalPages > 1 && (
              <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${
                resolvedTheme === 'dawn'
                  ? 'border-[#1e3a6d]'
                  : isDark
                  ? 'border-zinc-800'
                  : 'border-slate-100'
              }`}>
                <span className="text-[11px] text-slate-400">
                  {safePage} / {totalPages} 페이지 (총 {effectiveFeed.length}건)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                    disabled={safePage === 1}
                    className={`px-2 py-1 rounded-lg border text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors ${
                      resolvedTheme === 'dawn'
                        ? 'border-[#1e3a6d] hover:bg-[#101e42] text-slate-300'
                        : isDark
                        ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActivityPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safePage === p
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : resolvedTheme === 'dawn'
                          ? 'border border-[#1e3a6d] hover:bg-[#101e42] text-slate-300'
                          : isDark
                          ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActivityPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safePage === totalPages}
                    className={`px-2 py-1 rounded-lg border text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors ${
                      resolvedTheme === 'dawn'
                        ? 'border-[#1e3a6d] hover:bg-[#101e42] text-slate-300'
                        : isDark
                        ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </section>
        );
      })()}

      {/* ===================================================================
          MODALS & DRAWERS
          =================================================================== */}

      {/* 1. 대시보드 커스터마이징 모달 */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  대시보드 위젯 및 배치 커스터마이징
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 프리셋 버튼 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                라이프스타일 원클릭 프리셋
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'DEFAULT', label: '균형형' },
                  { id: 'FINANCE_FIRST', label: '가계부 집중' },
                  { id: 'LIFE_FIRST', label: '일상·당번' },
                  { id: 'QUICK_GAME', label: '게임·정산' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id as DashboardPreset)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentPreset === p.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 모듈별 On/Off & 정렬 리스트 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                위젯 On/Off 및 노출 순서
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/50"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleModule(m.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          m.enabled
                            ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
                            : 'text-slate-300 dark:text-zinc-600'
                        }`}
                      >
                        {m.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {m.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{m.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveModule(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveModule(idx, 'DOWN')}
                        disabled={idx === modules.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModules(DEFAULT_MODULES);
                  setCurrentPreset('DEFAULT');
                  localStorage.removeItem(STORAGE_KEY);
                  showToast('대시보드 배치를 기본값으로 초기화했습니다.');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ preset: currentPreset, modules })
                  );
                  setIsCustomizeOpen(false);
                  showToast('대시보드 맞춤 설정이 영속 저장되었습니다.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                저장 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 신규 정산·머니 요청 등록 모달 (요청 5번) */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  새 정산·머니 요청 등록
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  요청 대상자
                </label>
                <input
                  type="text"
                  value={newRequestForm.requester_name}
                  onChange={(e) =>
                    setNewRequestForm({ ...newRequestForm, requester_name: e.target.value })
                  }
                  required
                  placeholder="예: 구민우 (자녀), 김은지 (배우자)"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  요청 제목
                </label>
                <input
                  type="text"
                  value={newRequestForm.title}
                  onChange={(e) =>
                    setNewRequestForm({ ...newRequestForm, title: e.target.value })
                  }
                  required
                  placeholder="예: 점심 식대 1/N 정산 요청, 문제집 구입"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  내용 및 상세 사유
                </label>
                <textarea
                  rows={2}
                  value={newRequestForm.memo}
                  onChange={(e) =>
                    setNewRequestForm({ ...newRequestForm, memo: e.target.value })
                  }
                  placeholder="추가 전달사항이나 사용 사유, 영수증 메모"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    요청 금액 (원)
                  </label>
                  <input
                    type="number"
                    value={newRequestForm.amount}
                    onChange={(e) =>
                      setNewRequestForm({ ...newRequestForm, amount: e.target.value })
                    }
                    required
                    placeholder="25000"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    카테고리
                  </label>
                  <select
                    value={newRequestForm.category}
                    onChange={(e) =>
                      setNewRequestForm({ ...newRequestForm, category: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-amber-500 font-medium cursor-pointer"
                  >
                    <option value="모임정산">모임 정산 (1/N)</option>
                    <option value="용돈청구">용돈 청구</option>
                    <option value="가계부대납">가계부 대납 정산</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  수취 계좌 정보 (송금 딥링크용)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    value={newRequestForm.bank_name}
                    onChange={(e) =>
                      setNewRequestForm({ ...newRequestForm, bank_name: e.target.value })
                    }
                    placeholder="은행명 (토스/카뱅)"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newRequestForm.account_number}
                    onChange={(e) =>
                      setNewRequestForm({ ...newRequestForm, account_number: e.target.value })
                    }
                    placeholder="계좌번호"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-3 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs"
                >
                  요청 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. 승인 후 송금 딥링크 & 계좌 안내 모달 (요청 6번) */}
      {remittanceModalData.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  송금 처리
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRemittanceModalData({ open: false })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                  {remittanceModalData.isBatch ? '일괄 승인 대상' : '승인 요청 건'}
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {remittanceModalData.isBatch
                    ? `${remittanceModalData.batchItems?.length}건 일괄 승인`
                    : remittanceModalData.item?.title}
                </div>
                <div className="font-mono text-lg font-black text-amber-700 dark:text-amber-300">
                  ₩
                  {remittanceModalData.isBatch
                    ? remittanceModalData.batchItems
                        ?.reduce((s, x) => s + x.amount, 0)
                        .toLocaleString()
                    : remittanceModalData.item?.amount.toLocaleString()}
                  원
                </div>
                {!remittanceModalData.isBatch && (
                  <>
                    {remittanceModalData.item?.account_number || manualAccountNo ? (
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px]">
                        <span className="text-slate-600 dark:text-zinc-400 font-mono">
                          수취 계좌: {remittanceModalData.item?.bank_name || manualBankName}{' '}
                          {maskAccountNo(remittanceModalData.item?.account_number || manualAccountNo)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const accStr = `${remittanceModalData.item?.bank_name || manualBankName} ${
                              remittanceModalData.item?.account_number || manualAccountNo
                            }`;
                            navigator.clipboard?.writeText(accStr);
                            showToast('계좌번호가 클립보드에 복사되었습니다.');
                          }}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 space-y-2">
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                          ⚠️ 수취 계좌 직접 입력
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          요청자의 등록된 계좌가 없습니다. 송금할 계좌를 직접 입력하거나 현금으로 전달할 수 있습니다.
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          <input
                            type="text"
                            value={manualBankName}
                            onChange={(e) => setManualBankName(e.target.value)}
                            placeholder="은행명"
                            className="col-span-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={manualAccountNo}
                            onChange={(e) => setManualAccountNo(e.target.value)}
                            placeholder="계좌번호 (- 없이 가능)"
                            className="col-span-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 송금 딥링크 액션 버튼 (토스, 카카오페이) */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  앱으로 간편 송금 실행
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`supertoss://send?bank=${encodeURIComponent(
                      remittanceModalData.item?.bank_name || manualBankName
                    )}&accountNo=${encodeURIComponent(
                      remittanceModalData.item?.account_number || manualAccountNo
                    )}&amount=${
                      remittanceModalData.isBatch
                        ? remittanceModalData.batchItems?.reduce((s, x) => s + x.amount, 0)
                        : remittanceModalData.item?.amount || 0
                    }`}
                    onClick={() => showToast('토스 송금 앱으로 연결을 시도합니다.')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <span>토스 송금</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => showToast('카카오페이 송금 안내를 확인했습니다.')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>카카오페이 송금</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 이체/승인 버튼 다음 위치: 닫기 / 이체없이 종료 / 송금마감 */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemittanceModalData({ open: false })}
                className="min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              >
                닫기
              </button>
              {/* 2.1 이체없이 종료처리 (현금전달) */}
              <button
                type="button"
                onClick={handleFinishWithoutRemittance}
                title="실제 계좌 이체 없이 현금으로 직접 정산하고 완료 마감합니다."
                className="min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer shadow-2xs"
              >
                이체없이 종료 (현금전달) 💵
              </button>
              <button
                type="button"
                onClick={handleFinalizeRemittance}
                className="min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white cursor-pointer shadow-xs transition-all"
              >
                송금마감 ✓
              </button>
            </div>

            {/* 이체/승인 버튼 다음 위치: 구분선과 함께 '거절마감' 토글 영역 */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
              <button
                type="button"
                onClick={() => setIsRejectSectionOpen(!isRejectSectionOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
              >
                <span className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>거절마감</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isRejectSectionOpen ? 'rotate-180 text-rose-600 dark:text-rose-400' : ''
                  }`}
                />
              </button>

              {isRejectSectionOpen && (
                <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2.5 animate-in fade-in zoom-in-95">
                  {/* 거절 사유 선택 필터 드롭다운 목록 (ELM-SEL-02) */}
                  <ElmSel02
                    value={rejectReasonText}
                    onChange={(val) => setRejectReasonText(val)}
                    options={[
                      { value: '이번 달 용돈 한도 초과', label: '이번 달 용돈 한도 초과', subtext: '지출 예산 한도 초과' },
                      { value: '영수증/증빙 첨부 필요', label: '영수증/증빙 첨부 필요', subtext: '구매 내역 증빙 요망' },
                      { value: '중복 청구 확인 필요', label: '중복 청구 확인 필요', subtext: '동일 거래 내역 재검토' },
                      { value: '추후 정산 협의 요망', label: '추후 정산 협의 요망', subtext: '모임원 간 대면 협의' },
                      { value: '상세 사유 기재 요망', label: '상세 사유 기재 요망', subtext: '사용 목적 불명확' },
                    ]}
                    placeholder="거절 사유 검색 또는 목록 선택 (ELM-SEL-02)..."
                    className="text-xs"
                  />
                  <textarea
                    rows={2}
                    value={rejectReasonText}
                    onChange={(e) => setRejectReasonText(e.target.value)}
                    placeholder="직접 거절 사유를 입력하거나 위 목록에서 선택하세요"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-rose-500 font-medium"
                  />
                  <div className="flex items-center justify-between pt-1">
                    {/* 왼쪽 정렬: 초기화 아이콘 버튼 */}
                    <button
                      type="button"
                      onClick={() => setRejectReasonText('')}
                      disabled={!rejectReasonText}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        rejectReasonText
                          ? 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 shadow-2xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-transparent text-slate-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                      title="거절 사유 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* 오른쪽 정렬: 거절마감 버튼 */}
                    <button
                      type="button"
                      onClick={handleFinalizeRejectRemittance}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white cursor-pointer shadow-xs transition-all"
                    >
                      거절마감
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. 로그인 전용 게임 프리셋 관리 모달 (요청 7번) */}
      {isGamePresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  로그인 사용자 맞춤 게임 프리셋 관리
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGamePresetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500 dark:text-zinc-400">
                로그인 사용자는 인원과 벌칙 설정을 매번 다시 입력할 필요 없이 맞춤 프리셋으로 저장하여 1초 만에 실행할 수 있습니다.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {gamePresets.map((pre) => (
                  <div
                    key={pre.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850/50 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pre.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold">
                          {pre.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                        멤버: {pre.participants.join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        옵션: {pre.options.join(' / ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQuickPreset(pre);
                          setIsGamePresetModalOpen(false);
                          showToast(`[${pre.title}] 프리셋이 대시보드 퀵런처에 적용되었습니다.`);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
                      >
                        선택
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsGamePresetModalOpen(false);
                  if (onNavigate) onNavigate('SCR-GNT-01');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
              >
                게스트홈 게임센터 전체 열기 →
              </button>
              <button
                type="button"
                onClick={() => setIsGamePresetModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 퀵 사다리 결과 모달 */}
      {quickLadderResult.open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuickLadderResult({ open: false })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border-2 border-purple-400 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              🪜 퀵 사다리 결과 매칭
            </h3>
            {quickLadderResult.isRolling ? (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500 animate-pulse">
                  사다리 그래프 이동 중...
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <div className="text-3xl">🎉</div>
                <div className="text-base font-black text-purple-600 dark:text-purple-400">
                  당첨: {quickLadderResult.winner}
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                  결과: {quickLadderResult.action}
                </div>
              </div>
            )}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={runQuickLadder}
                disabled={quickLadderResult.isRolling}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
              >
                다시 타기
              </button>
              <button
                type="button"
                onClick={() => setQuickLadderResult({ open: false })}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 퀵 룰렛 결과 모달 */}
      {quickRouletteResult.open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuickRouletteResult({ open: false })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-400 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              🎯 점심 메뉴 룰렛 결과
            </h3>
            {quickRouletteResult.isSpinning ? (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500 animate-pulse">
                  룰렛을 힘차게 돌리는 중...
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <div className="text-3xl">🍲</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  오늘의 추천: {quickRouletteResult.menu}
                </div>
                <p className="text-xs text-slate-500">
                  고민 끝! 맛있는 점심 식사하세요.
                </p>
              </div>
            )}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={runQuickRoulette}
                disabled={quickRouletteResult.isSpinning}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                다시 돌리기
              </button>
              <button
                type="button"
                onClick={() => setQuickRouletteResult({ open: false })}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 머니등록 모달 (단일 레이어 & 전파 차단) */}
      {activeQuickModal === 'MONEY' && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActiveQuickModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-2xl my-auto animate-in zoom-in-95"
          >
            <SCR_QCK_01_빠른머니등록
              onClose={() => setActiveQuickModal(null)}
              onSuccess={() => {
                setActiveQuickModal(null);
                showToast('✓ 머니 지출이 성공적으로 기록되었습니다!');
              }}
            />
          </div>
        </div>
      )}

      {/* 8. 수행등록 모달 (단일 레이어 & 전파 차단) */}
      {activeQuickModal === 'DUTY' && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActiveQuickModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-2xl my-auto animate-in zoom-in-95"
          >
            <SCR_QCK_02_빠른수행등록
              onClose={() => setActiveQuickModal(null)}
              onSuccess={() => {
                setActiveQuickModal(null);
                showToast('✓ 당번 과업 수행 및 사진 인증이 완료되었습니다!');
              }}
            />
          </div>
        </div>
      )}

      {/* 9. 새 가계부 생성 모달 */}
      <NewLedgerModal
        isOpen={isNewLedgerOpen}
        onClose={() => setIsNewLedgerOpen(false)}
        onCreated={(newLedger) => {
          setIsNewLedgerOpen(false);
          setExtendedLedgers((prev) => [
            ...prev,
            {
              ledger: newLedger,
              budget_total: 1000000,
              spent_amount: 0,
              total_asset: 0,
              income_amount: 0,
              asset_transfer_amount: 0,
              tx_count: 0,
              last_item: '가계부 개설 완료',
              is_pinned: false,
              accent_color: 'indigo',
            },
          ]);
          showToast(`✓ [${newLedger.ledger_name}] 가계부가 책꽂이에 등록되었습니다.`);
        }}
      />
    </div>
  );
};
