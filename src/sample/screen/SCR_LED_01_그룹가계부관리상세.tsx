import React, { useState, useMemo, useRef } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmBsh01,
  ElmChk01,
} from '../elements/Tokens';
import {
  Wallet,
  Users,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Calendar,
  Layers,
  ChevronLeft,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Tag,
  Share2,
  Coins,
  Receipt,
  UserPlus,
  Crown,
  Shield,
  Eye,
  UserX,
  Filter,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// 도메인 타입 정의 (모아보고 금전관리 3대 원칙 & RBAC 권한 매트릭스)
// ============================================================================
export type LedgerType = 'PERSONAL' | 'GROUP' | 'INSTANCE';
export type LedgerRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';

export interface LedgerMember {
  id: string;
  name: string;
  role: LedgerRole;
  isGuest: boolean;
  guestId?: string; // 게스트 소멸성: 임시 guest_id
  joinedAt: string;
  avatar: string;
}

export interface LedgerBook {
  id: string;
  title: string;
  type: LedgerType;
  description: string;
  balance: number;
  monthlyExpense: number;
  assetTransferAmount: number; // 생활비 통계 왜곡 방지용 자산이동 금액
  reimbursementAmount: number; // 대납/정산 태깅 금액
  currency: string;
  colorTheme: {
    bg: string;
    border: string;
    badge: string;
    spine: string;
    accent: string;
  };
  membersCount: number;
  createdAt: string;
  settlementCycle?: string; // 결산 주기
  isSettled?: boolean;
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
  isAssetTransfer: boolean; // 금전 원칙 ②: TRANSFER 자산이동 분리
  relatedTransferId?: string; // 1:1 자기참조 페어링
  tagNames: string[]; // 금전 원칙 ③: 태깅 분리 (대납, 정산요청 등)
  note?: string;
}

interface SCR_LED_01_Props {
  onBack?: () => void;
}

// ============================================================================
// 메인 컴포넌트: SCR_LED_01_그룹가계부관리상세
// ============================================================================
export const SCR_LED_01_그룹가계부관리상세: React.FC<SCR_LED_01_Props> = ({ onBack }) => {
  // --------------------------------------------------------------------------
  // 1. 가계부 책꽂이 데이터셋 (개인, 가족 그룹, 모임 인스턴스)
  // --------------------------------------------------------------------------
  const [ledgers, setLedgers] = useState<LedgerBook[]>([
    {
      id: 'led-group-01',
      title: '우리 4인 가족 행복 가계부',
      type: 'GROUP',
      description: '정식 회원 필수 · 공동 생활비 및 공과금 투명 분담',
      balance: 4850000,
      monthlyExpense: 2340000,
      assetTransferAmount: 500000,
      reimbursementAmount: 120000,
      currency: 'KRW',
      colorTheme: {
        bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        spine: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
        accent: 'text-emerald-600 dark:text-emerald-400',
      },
      membersCount: 4,
      createdAt: '2026-01-10',
      settlementCycle: '매월 말일 결산',
    },
    {
      id: 'led-personal-01',
      title: '구본영 개인 자산·용돈 가계부',
      type: 'PERSONAL',
      description: '단독 귀속 · 개인 취미, 자기계발 및 비상금 운용',
      balance: 1820000,
      monthlyExpense: 680000,
      assetTransferAmount: 200000,
      reimbursementAmount: 0,
      currency: 'KRW',
      colorTheme: {
        bg: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
        border: 'border-indigo-500/30',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
        spine: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white',
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
      description: '인스턴스 모임 · 미가입 게스트 유연 허용 & 정산 후 소멸',
      balance: 420000,
      monthlyExpense: 890000,
      assetTransferAmount: 0,
      reimbursementAmount: 350000,
      currency: 'KRW',
      colorTheme: {
        bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
        border: 'border-amber-500/30',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        spine: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
        accent: 'text-amber-600 dark:text-amber-400',
      },
      membersCount: 6,
      createdAt: '2026-10-01',
      settlementCycle: '여행 종료 시 즉시정산',
    },
  ]);

  const [activeLedgerId, setActiveLedgerId] = useState<string>('led-group-01');
  const currentLedger = useMemo(
    () => ledgers.find((l) => l.id === activeLedgerId) || ledgers[0],
    [ledgers, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 2. 현재 로그인 사용자 RBAC 역할 시뮬레이터 (개발/검토용 권한 스위처)
  // --------------------------------------------------------------------------
  const [currentUserRole, setCurrentUserRole] = useState<LedgerRole>('OWNER');

  // --------------------------------------------------------------------------
  // 3. 구성원 데이터 (가계부별 분리)
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
  });

  const currentMembers = useMemo(
    () => membersMap[activeLedgerId] || [],
    [membersMap, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 4. 거래 내역 데이터 (금전 원칙: 단일 귀속, 자산이동 분리, 태깅 분리)
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
        isAssetTransfer: true, // 생활비 제외
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
        tagNames: ['대납', '정산요청'], // 태깅 분리로 이중계상 차단
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
        isAssetTransfer: true, // 생활비 제외
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
        tagNames: ['게스트대납', '정산요청'], // 게스트 대납 태깅
        note: '정식 회원가입 이전 임시 guest_id 귀속',
      },
    ],
  });

  const currentTransactions = useMemo(
    () => transactionsMap[activeLedgerId] || [],
    [transactionsMap, activeLedgerId]
  );

  // --------------------------------------------------------------------------
  // 5. 필터 및 검색 상태
  // --------------------------------------------------------------------------
  const [searchWord, setSearchWord] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [excludeAssetTransfer, setExcludeAssetTransfer] = useState(true); // 기본적으로 생활비 통계 왜곡 방지
  const [tagFilter, setTagFilter] = useState<string>('ALL');

  // 필터링된 거래 목록
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
      if (excludeAssetTransfer && tx.isAssetTransfer && categoryFilter !== '자산이동') {
        // 자산이동 분리 모드에서는 자산이동 탭을 누르지 않는 한 기본 목록에서 시각적 분리
      }
      if (tagFilter !== 'ALL' && !tx.tagNames.includes(tagFilter)) {
        return false;
      }
      return true;
    });
  }, [currentTransactions, searchWord, categoryFilter, excludeAssetTransfer, tagFilter]);

  // 통계 집계 (금전관리 3대 원칙 적용)
  const stats = useMemo(() => {
    let income = 0;
    let pureExpense = 0;
    let assetTransfer = 0;
    let reimbursement = 0;

    currentTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        income += tx.amount;
      } else if (tx.type === 'TRANSFER' || tx.isAssetTransfer) {
        assetTransfer += tx.amount; // 자산이동 순수 합산
      } else if (tx.type === 'EXPENSE') {
        pureExpense += tx.amount; // 순수 생활비
      }

      if (tx.tagNames.includes('대납') || tx.tagNames.includes('정산요청') || tx.tagNames.includes('게스트대납')) {
        reimbursement += tx.amount;
      }
    });

    return { income, pureExpense, assetTransfer, reimbursement };
  }, [currentTransactions]);

  // --------------------------------------------------------------------------
  // 6. 모달 및 폼 상태
  // --------------------------------------------------------------------------
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newLedgerModalOpen, setNewLedgerModalOpen] = useState(false);
  const [newTxModalOpen, setNewTxModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // 구성원 추가 폼
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

  // --------------------------------------------------------------------------
  // 7. 가드레일 핸들러: RBAC 권한 체크
  // --------------------------------------------------------------------------
  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  const canEditLedger = currentUserRole === 'OWNER';
  const canAddTransaction = currentUserRole !== 'VIEWER';

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (!canManageMembers) {
      setNoticeMessage('[RBAC 접근제어] 구성원 관리 및 초대는 OWNER 또는 ADMIN 권한만 가능합니다.');
      return;
    }

    // 그룹 가계부 게스트 차단 가드레일
    if (currentLedger.type === 'GROUP' && isNewMemberGuest) {
      setNoticeMessage(
        '[도메인 가드레일] 정규 가족 그룹 가계부는 정식 가입 회원만 참여할 수 있습니다. (모임 인스턴스는 게스트 허용)'
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

    // 책꽂이 카운트 갱신
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === activeLedgerId ? { ...l, membersCount: l.membersCount + 1 } : l
      )
    );

    setNewMemberName('');
    setIsNewMemberGuest(false);
    setNoticeMessage(`✓ 새 구성원 "${newM.name}" (${newM.role})이(가) 등록되었습니다.`);
  };

  const handleRoleChange = (memberId: string, targetRole: LedgerRole) => {
    if (!canManageMembers) {
      setNoticeMessage('[RBAC 가드레일] 역할 변경은 OWNER 또는 ADMIN만 수행할 수 있습니다.');
      return;
    }
    setMembersMap((prev) => ({
      ...prev,
      [activeLedgerId]: prev[activeLedgerId].map((m) =>
        m.id === memberId ? { ...m, role: targetRole } : m
      ),
    }));
    setNoticeMessage(`✓ 구성원의 권한이 ${targetRole}(으)로 성공적으로 변경되었습니다.`);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!canManageMembers) {
      setNoticeMessage('[RBAC 가드레일] 구성원 내보내기는 OWNER 또는 ADMIN만 가능합니다.');
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
    setNoticeMessage(`✓ 구성원 "${memberName}"을(를) 가계부에서 제외했습니다.`);
  };

  // 새 거래 등록 핸들러 (금전 원칙 반영)
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle.trim() || !newTxAmount) return;

    if (!canAddTransaction) {
      setNoticeMessage('[RBAC 가드레일] VIEWER(조회 전용) 권한은 거래 내역을 작성할 수 없습니다.');
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
      `✓ [단일 귀속성 보장] "${currentLedger.title}"에 거래 내역(₩${amt.toLocaleString()})이 배타적으로 안전하게 기록되었습니다.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ==================================================================== */}
      {/* 1. 상단 네비게이션 & 헤더 & RBAC 시뮬레이터 배너 */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-indigo-400 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
              title="대시보드로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-800">
                SCR-LED-01
              </span>
              <ElmTyp01
                title="가계부 관리 및 구성원 RBAC 상세"
                subtitle="금전 3원칙(단일귀속·자산이동분리·태깅분리) & 5단계 RBAC 매트릭스"
              />
            </div>
          </div>
        </div>

        {/* 상단 우측: 권한 시뮬레이터 & 빠른 액션 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 나의 현재 권한 시뮬레이터 뱃지 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium text-[11px]">내 권한:</span>
            <select
              value={currentUserRole}
              onChange={(e) => {
                setCurrentUserRole(e.target.value as LedgerRole);
                setNoticeMessage(`내 권한이 [${e.target.value}] 역할로 전환되었습니다.`);
              }}
              className="bg-transparent font-extrabold text-indigo-600 dark:text-indigo-400 text-xs focus:outline-hidden cursor-pointer"
              title="RBAC 권한 전환 시뮬레이션"
            >
              <option value="OWNER">👑 OWNER (총괄소유자)</option>
              <option value="ADMIN">🛡️ ADMIN (관리자)</option>
              <option value="MEMBER">👤 MEMBER (일반멤버)</option>
              <option value="VIEWER">👁️ VIEWER (조회전용)</option>
              <option value="GUEST">🎭 GUEST (임시게스트)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold shadow-2xs cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>구성원 관리 ({currentMembers.length}명)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!canAddTransaction) {
                setNoticeMessage('[권한제한] VIEWER 권한은 거래를 추가할 수 없습니다.');
                return;
              }
              setNewTxModalOpen(true);
            }}
            disabled={!canAddTransaction}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm cursor-pointer transition-all ${
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

      {/* 알림 메시지 배너 */}
      {noticeMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. 가계부 책꽂이 (Bookshelf Switcher) 인터랙션 섹션 */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              가계부 책꽂이 (Bookshelf)
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              책을 클릭하여 가계부를 즉시 전환합니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewLedgerModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>가계부 새로 만들기</span>
          </button>
        </div>

        {/* 3D 책등 룩앤필 가계부 랙 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {ledgers.map((b) => {
            const isSelected = b.id === activeLedgerId;
            return (
              <div
                key={b.id}
                onClick={() => {
                  setActiveLedgerId(b.id);
                  setNoticeMessage(`✓ 가계부를 "${b.title}"(으)로 전환했습니다.`);
                }}
                className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected
                    ? `${b.colorTheme.border} bg-gradient-to-br ${b.colorTheme.bg} ring-2 ring-indigo-500/20`
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/50'
                }`}
              >
                {/* 책등 컬러 포인트 바 */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-2.5 ${b.colorTheme.spine}`}
                />

                <div className="pl-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        b.type === 'GROUP'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : b.type === 'PERSONAL'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}
                    >
                      {b.type === 'GROUP'
                        ? '그룹 · 회원필수'
                        : b.type === 'PERSONAL'
                        ? '개인 · 단독귀속'
                        : '인스턴스 · 게스트허용'}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>선택됨</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {b.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block font-medium">현재 잔액</span>
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                      ₩{b.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pl-3 pt-4 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{b.membersCount}명 참여</span>
                  </span>
                  <span className="text-[10px] font-medium">{b.settlementCycle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 모아보고 금전관리 3대 원칙 가드레일 배너 */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-slate-900/5 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-zinc-900/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h5 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
            모아보고 금전관리 3대 원칙 시스템 가드레일
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 원칙 1: 단일 귀속성 */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100">
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-[10px] font-mono">
                1
              </span>
              <span>단일 귀속성 (Single Attribution)</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              모든 거래는 개인 가계부 또는 모임 가계부 중 단 하나에만 배타적으로 귀속되며 상호 중복 합산되지 않습니다.
            </p>
          </div>

          {/* 원칙 2: TRANSFER 자산이동 분리 */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-purple-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100">
              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>TRANSFER 단일 연결</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              가계부/자산 간 이동은 순수 생활비 집계에서 완벽 제외되며 1:1 자기참조 페어링으로 왜곡을 차단합니다.
            </p>
          </div>

          {/* 원칙 3: 태깅 분리 */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100">
              <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-[10px] font-mono">
                3
              </span>
              <span>태깅 분리 (Tagging Separation)</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              개인 지출의 모임 대납이나 1/N 정산 표시는 메타데이터 태깅으로 분리하여 이중계상을 원천 방지합니다.
            </p>
          </div>
        </div>

        {/* 게스트 소멸성 안내 바 */}
        {currentLedger.type === 'INSTANCE' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>게스트 소멸성(Transient) 원칙 적용 중:</strong> 미가입 게스트는 임시 식별자(
              <span className="font-mono text-amber-700 dark:text-amber-300">guest_id</span>)로만 활동하며, 회원가입 시 기존 내역이 자동 소급 결합되지 않고 당사자 명시적 승인으로만 매핑됩니다.
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. 통계 벤토 요약 바 (금전 원칙 반영: 순수 생활비 vs 자산이동 분리) */}
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
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>단일 귀속 계좌 연동 중</span>
          </div>
        </div>

        {/* 통계 2: 당월 순수 생활비 지출 (자산이동 제외) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">당월 순수 생활비</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-rose-600">
            ₩{stats.pureExpense.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
            자산이동 제외 순수 소비
          </div>
        </div>

        {/* 통계 3: 자산이동 합계 (생활비 왜곡 차단) */}
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
            통계 왜곡 방지 격리 (원칙 ②)
          </div>
        </div>

        {/* 통계 4: 대납 / 정산 태깅 합계 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">대납·정산 태깅</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-lg sm:text-xl font-extrabold text-amber-600">
            ₩{stats.reimbursement.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-600 font-medium">
            이중계상 차단 (원칙 ③)
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. 거래 내역 리스트 & 카테고리/태그 필터 */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        {/* 리스트 헤더 & 검색 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              거래 내역 관리
            </span>
            <ElmCnt01 count={filteredTransactions.length} label="총" />
          </div>

          <div className="w-full sm:w-80">
            <ElmInp04
              value={searchWord}
              onChange={setSearchWord}
              placeholder="가맹점, 입출금자, 메모 검색..."
            />
          </div>
        </div>

        {/* 필터 바: 카테고리 칩 + 자산이동 분리 토글 + 태그 칩 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 dark:border-zinc-800/80 py-3">
          {/* 카테고리 칩 */}
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
              onClick={() => setCategoryFilter(currentLedger.type === 'GROUP' ? '가족 내부 이동' : '자산 내부 이동')}
            />
          </div>

          {/* 금전원칙 ②: 자산이동 분리 토글 스위치 */}
          <div className="flex items-center gap-2">
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
                {/* 좌측: 아이콘 + 제목 + 태그 + 결제자 */}
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

                      {/* 자산이동 분리 배지 */}
                      {tx.isAssetTransfer && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800">
                          자산이동 (생활비제외)
                        </span>
                      )}

                      {/* 태그 목록 (태깅 분리 원칙) */}
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

                {/* 우측: 금액 & 단일 귀속 확인 */}
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
                  <span className="text-[10px] text-slate-400">
                    {tx.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. 구성원 RBAC 관리 바텀시트 / 모달 */}
      {/* ==================================================================== */}
      <ElmBsh01
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={`가계부 구성원 RBAC 관리 (${currentMembers.length}명)`}
      >
        <div className="space-y-5 pb-6">
          {/* 가계부 정책 안내 */}
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
                  : '게스트 허용 (인스턴스)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {currentLedger.type === 'GROUP'
                ? '가족 그룹 가계부는 데이터 정합성을 위해 정식 가입 회원만 참여할 수 있습니다.'
                : currentLedger.type === 'PERSONAL'
                ? '개인 가계부는 단독 소유로 외부 구성원을 추가할 수 없습니다.'
                : '동창/모임 인스턴스 가계부는 미가입 게스트(guest_id) 참여를 허용하며 정산 후 데이터가 소멸됩니다.'}
            </p>
          </div>

          {/* 구성원 리스트 with RBAC 권한 매트릭스 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              참여 구성원 목록 & 역할 변경
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

                  {/* 역할 선택 드롭다운 (RBAC 제어) */}
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
                      <option value="OWNER">👑 OWNER</option>
                      <option value="ADMIN">🛡️ ADMIN</option>
                      <option value="MEMBER">👤 MEMBER</option>
                      <option value="VIEWER">👁️ VIEWER</option>
                      <option value="GUEST">🎭 GUEST</option>
                    </select>

                    {/* 내보내기 버튼 */}
                    {canManageMembers && m.role !== 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="구성원 내보내기"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새 구성원 초대 폼 */}
          {currentLedger.type !== 'PERSONAL' && (
            <form onSubmit={handleAddMember} className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>새 구성원 초대 (가드레일 검증)</span>
              </h5>

              <ElmInp01
                label="구성원 이름 / 닉네임"
                value={newMemberName}
                onChange={setNewMemberName}
                placeholder="예: 홍길동 (이메일 또는 닉네임)"
              />

              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="부여할 권한 (RBAC)"
                  value={newMemberRole}
                  onChange={(val) => setNewMemberRole(val as LedgerRole)}
                  options={[
                    { value: 'ADMIN', label: '🛡️ ADMIN (관리자)' },
                    { value: 'MEMBER', label: '👤 MEMBER (일반멤버)' },
                    { value: 'VIEWER', label: '👁️ VIEWER (조회전용)' },
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
                      * 그룹 가계부는 게스트 추가 불가
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
                  구성원 초대하기
                </button>
              </div>
            </form>
          )}
        </div>
      </ElmBsh01>

      {/* ==================================================================== */}
      {/* 7. 새 거래 등록 모달 (금전관리 3대 원칙 보장) */}
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

              {/* 금전원칙 ②: TRANSFER 자산이동 체크박스 */}
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

              {/* 금전원칙 ③: 태그 분리 */}
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
                  단일 귀속 가계부에 기록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 새 가계부 생성 모달 안내 */}
      {newLedgerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
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
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
