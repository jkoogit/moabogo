import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp04,
  ElmSel01,
  ElmBsh01,
  ElmTre02,
  CategoryTreeNode,
  ElmTxt01,
  ElmToast01,
  ElmSld03,
} from '../elements/Tokens';
import {
  Sparkles,
  Users,
  Eye,
  Plus,
  ArrowRightLeft,
  Calendar,
  ShieldCheck,
  Coins,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Flame,
  Search,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Filter,
  FileText,
  EyeIcon,
  Edit3,
} from 'lucide-react';
import {
  MoaDuty,
  DutyCategory,
  DutyParticipant,
  DutyExecutionLog,
  DutyRotationPolicy,
  DutyApprovalPolicy,
  SubstituteSettlementItem,
} from '../../types';
import {
  INITIAL_DUTIES,
  INITIAL_DUTY_CATEGORIES,
  INITIAL_INVITATIONS,
  INITIAL_DUTY_LOGS,
  INITIAL_SUBSTITUTE_SETTLEMENTS,
  calculateNextAssignee,
  DutyInvitation,
} from '../dutyStore';

interface SCR_DUT_01_Props {
  onBack?: () => void;
  onNavigateToDetail?: (dutyId: string) => void;
  onOpenQuickRegister?: () => void;
  onNavigateToGoal?: () => void;
}

// -------------------------------------------------------------
// Helper: 한국어 주기 및 배정 정책 포맷터
// -------------------------------------------------------------
export const formatKoreanCycleDays = (days?: string[]) => {
  if (!days || days.length === 0) return '상시 정기 수행';
  if (days.length === 7) return '매일 (주 7회)';
  const dayMap: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };
  const korDays = days.map((d) => dayMap[d] || d).join('·');
  return `매주 ${korDays} (주 ${days.length}회)`;
};

export const getRotationPolicyLabel = (policy: string) => {
  switch (policy) {
    case 'AGE_WEIGHTED':
      return '연령 가중 순환 배정';
    case 'ROUND_ROBIN':
      return '순차 순환 배정';
    case 'RANDOM':
    case 'RANDOM_ROULETTE':
      return '랜덤 추첨 배정';
    case 'FREE_PICK':
      return '자율 신청 배정';
    default:
      return '순환 배정';
  }
};

export const SCR_DUT_01_모아당번관리: React.FC<SCR_DUT_01_Props> = ({
  onBack,
  onNavigateToDetail,
  onOpenQuickRegister,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  // 1. Data Store States
  const [duties, setDuties] = useState<MoaDuty[]>(INITIAL_DUTIES);
  const [categories] = useState<DutyCategory[]>(INITIAL_DUTY_CATEGORIES);
  const [invitations, setInvitations] = useState<DutyInvitation[]>(INITIAL_INVITATIONS);

  // 2. Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'SUBSTITUTE' | 'INVITATION'>('ALL');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'DUE_DATE' | 'TITLE' | 'COMPLETED'>('DUE_DATE');

  // 3. Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // 4. Form States for New Duty
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [descPreviewMode, setDescPreviewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [formCategory, setFormCategory] = useState('cat-clean');
  const [formRotationPolicy, setFormRotationPolicy] = useState<DutyRotationPolicy>('AGE_WEIGHTED');
  const [formApprovalPolicy, setFormApprovalPolicy] = useState<DutyApprovalPolicy>('PEER_3_APPROVAL');
  const [formSettlementCycle, setFormSettlementCycle] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY'>('WEEKLY');
  const [formCycleDays, setFormCycleDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [formParticipants, setFormParticipants] = useState<Array<{ name: string; role: 'ASSIGNEE' | 'VIEWER'; weight?: number }>>([
    { name: '구본영(호스트)', role: 'ASSIGNEE', weight: 1 },
    { name: '이지은(배우자)', role: 'ASSIGNEE', weight: 1 },
    { name: '구민우(자녀)', role: 'ASSIGNEE', weight: 2 },
  ]);

  // Secure Member Select Search in Modal
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState<'ASSIGNEE' | 'VIEWER'>('ASSIGNEE');

  // Pre-approved Ledger Members pool (Zero-leakage security)
  const availableLedgerMembers = [
    { id: 'u-1', name: '구본영(호스트)', ledgerName: '우리집 가계부', relation: '본인' },
    { id: 'u-2', name: '이지은(배우자)', ledgerName: '우리집 가계부', relation: '배우자' },
    { id: 'u-3', name: '구민우(자녀)', ledgerName: '우리집 가계부', relation: '자녀' },
    { id: 'u-4', name: '정현우(동창)', ledgerName: '동창회 모임', relation: '모임원' },
    { id: 'u-5', name: '김선영(총무)', ledgerName: '동창회 모임', relation: '총무' },
    { id: 'u-6', name: '박서준(게스트)', ledgerName: '동창회 모임', relation: '임시게스트' },
  ];

  // Build Category Tree for ELM-TRE-02 with subcategories & item count
  const categoryTreeData: CategoryTreeNode[] = useMemo(() => {
    return [
      {
        id: 'cat-clean',
        name: '청소 및 정리',
        icon: '🧹',
        count: duties.filter((d) => d.category_id === 'cat-clean').length,
        children: [
          { id: 'sub-clean-living', name: '거실 및 실내청소', count: 2 },
          { id: 'sub-clean-laundry', name: '세탁 및 침구정리', count: 1 },
        ],
      },
      {
        id: 'cat-kitchen',
        name: '주방 및 식사',
        icon: '🍽️',
        count: duties.filter((d) => d.category_id === 'cat-kitchen').length,
        children: [
          { id: 'sub-kitchen-dish', name: '식기세척 및 설거지', count: 1 },
          { id: 'sub-kitchen-fridge', name: '냉장고 소독정리', count: 0 },
        ],
      },
      {
        id: 'cat-recycle',
        name: '분리수거 및 배출',
        icon: '♻️',
        count: duties.filter((d) => d.category_id === 'cat-recycle').length,
        children: [
          { id: 'sub-recycle-box', name: '박스 및 플라스틱', count: 1 },
          { id: 'sub-recycle-food', name: '음식물 쓰레기 배출', count: 1 },
        ],
      },
      {
        id: 'cat-finance',
        name: '재정 및 회계',
        icon: '💰',
        count: duties.filter((d) => d.category_id === 'cat-finance').length,
        children: [
          { id: 'sub-fin-ledger', name: '가계부 주간 마감', count: 1 },
          { id: 'sub-fin-utility', name: '공과금 대사 및 납부', count: 0 },
        ],
      },
      {
        id: 'cat-life',
        name: '생활 돌봄',
        icon: '🪴',
        count: duties.filter((d) => d.category_id === 'cat-life').length,
        children: [
          { id: 'sub-life-plant', name: '반려화분 물주기', count: 1 },
          { id: 'sub-life-med', name: '가족 영양제 챙기기', count: 0 },
        ],
      },
    ];
  }, [duties]);

  // Filtered Duties based on Tab, Category Tree multi-select, and Search Query
  const filteredDuties = useMemo(() => {
    return duties.filter((duty) => {
      // 1. Tab filtering
      if (activeTab === 'MY') {
        const isMyDuty = duty.current_assigned_participant_id === 'p-1' || duty.current_assigned_name.includes('구본영');
        if (!isMyDuty) return false;
      } else if (activeTab === 'SUBSTITUTE') {
        if (!duty.active_substitute_request || duty.active_substitute_request.status !== 'PENDING') {
          return false;
        }
      }

      // 2. Category Tree Multi-selection filtering (OR condition for selected ids)
      if (selectedCategoryIds.length > 0) {
        const matchCategory = selectedCategoryIds.some((catId) => {
          if (duty.category_id === catId) return true;
          if (catId.startsWith('sub-clean') && duty.category_id === 'cat-clean') return true;
          if (catId.startsWith('sub-kitchen') && duty.category_id === 'cat-kitchen') return true;
          if (catId.startsWith('sub-recycle') && duty.category_id === 'cat-recycle') return true;
          if (catId.startsWith('sub-fin') && duty.category_id === 'cat-finance') return true;
          if (catId.startsWith('sub-life') && duty.category_id === 'cat-life') return true;
          return false;
        });
        if (!matchCategory) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = duty.duty_title.toLowerCase().includes(q);
        const matchDesc = (duty.duty_description || '').toLowerCase().includes(q);
        const matchAssignee = duty.current_assigned_name.toLowerCase().includes(q);
        const matchCategoryName = duty.category_name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAssignee && !matchCategoryName) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'TITLE') return a.duty_title.localeCompare(b.duty_title);
      if (sortBy === 'COMPLETED') return b.completed_count - a.completed_count;
      return (a.next_due_date || '').localeCompare(b.next_due_date || '');
    });
  }, [duties, activeTab, selectedCategoryIds, searchQuery, sortBy]);

  // Counts for tabs
  const totalDutiesCount = duties.length;
  const myDutiesCount = duties.filter((d) => d.current_assigned_name.includes('구본영')).length;
  const substituteRequestsCount = duties.filter((d) => d.active_substitute_request?.status === 'PENDING').length;
  const pendingInvitationsCount = invitations.filter((i) => i.status === 'PENDING').length;

  // Handle Invitation Accept/Reject
  const handleAcceptInvitation = (invId: string) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.invitation_id === invId ? { ...inv, status: 'ACCEPTED' } : inv))
    );
    showToast('✓ 당번 초대를 수락하였습니다. 나의 담당 당번에 등록되었습니다.');
  };

  const handleRejectInvitation = (invId: string) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.invitation_id === invId ? { ...inv, status: 'REJECTED' } : inv))
    );
    showToast('당번 초대를 정중히 거절하였습니다.');
  };

  // Add Member to New Duty Form
  const handleAddMemberToForm = (member: { name: string; relation: string }) => {
    if (formParticipants.some((p) => p.name === member.name)) {
      showToast('이미 참가자 목록에 포함되어 있는 구성원입니다.');
      return;
    }
    setFormParticipants((prev) => [
      ...prev,
      {
        name: member.name,
        role: selectedMemberRole,
        weight: selectedMemberRole === 'ASSIGNEE' ? 1 : undefined,
      },
    ]);
    setMemberSelectModalOpen(false);
    showToast(`✓ "${member.name}" 님이 ${selectedMemberRole === 'ASSIGNEE' ? '당번 수행원' : '관람·응원단'}으로 추가되었습니다.`);
  };

  // Create Duty Submit
  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('당번 명칭을 입력해주세요.');
      return;
    }

    const catObj = categories.find((c) => c.category_id === formCategory);
    const newId = `duty-${Date.now().toString().slice(-4)}`;

    const newDuty: MoaDuty = {
      duty_id: newId,
      ledger_id: 'led-1',
      category_id: formCategory,
      category_name: catObj?.name || '생활 당번',
      mission_type: 'DUTY',
      duty_title: formTitle.trim(),
      duty_description: formDesc.trim() || '가족/모임 생활 수칙에 따라 완수 후 인증 제출합니다.',
      sub_category: '일반과업',
      rotation_policy: formRotationPolicy,
      cycle_config: {
        cycle_type: 'WEEKLY',
        days_of_week: formCycleDays as any,
        target_count_per_cycle: formCycleDays.length,
      },
      approval_policy: formApprovalPolicy,
      duration_type: 'INDEFINITE',
      completed_count: 0,
      can_substitute: true,
      participants: formParticipants.map((p, idx) => ({
        participant_id: `p-${idx + 1}`,
        name: p.name,
        role: p.role,
        is_guest: false,
        order_index: idx,
        invitation_status: 'ACCEPTED',
        weight: p.weight,
      })),
      current_assigned_participant_id: 'p-1',
      current_assigned_name: formParticipants[0]?.name || '구본영(호스트)',
      assigned_name: formParticipants[0]?.name || '구본영(호스트)',
      is_guest: false,
      approval_required: formApprovalPolicy !== 'NO_APPROVAL',
      status: 'ASSIGNED',
      created_at: new Date().toISOString(),
      next_due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      progress_status: 'ASSIGNED',
      settlement_status: 'UNSETTLED',
      evaluation_status: 'UNVERIFIED',
    };

    setDuties((prev) => [newDuty, ...prev]);
    setCreateModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    showToast(`✓ 새 당번 "${newDuty.duty_title}"이(가) 등록되었습니다.`);
  };

  // Helper: Markdown Preview Renderer
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <p className="text-slate-400 italic">입력된 완수 기준이 없습니다.</p>;
    }
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          if (trimmed.startsWith('### ')) {
            return <h5 key={idx} className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-1.5">{trimmed.slice(4)}</h5>;
          }
          if (trimmed.startsWith('## ')) {
            return <h4 key={idx} className="font-bold text-slate-900 dark:text-zinc-100 text-sm mt-2">{trimmed.slice(3)}</h4>;
          }
          if (trimmed.startsWith('- [ ] ')) {
            return (
              <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 pl-1">
                <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-zinc-600 inline-block shrink-0" />
                <span>{trimmed.slice(6)}</span>
              </div>
            );
          }
          if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
            return (
              <div key={idx} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 pl-1 font-medium">
                <Check className="w-3.5 h-3.5 inline-block shrink-0" />
                <span className="line-through text-slate-400">{trimmed.slice(6)}</span>
              </div>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{trimmed.slice(2)}</span>
              </div>
            );
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header Section (Clean: No redundant buttons or external service links) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="메인 대시보드로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <ElmTyp01
            title="모아당번 관리"
            badge="SCR-DUT-01"
            subtitle="가족·모임 정기 역할 분담 및 카테고리별 당번 관리 • 함께 완성하는 생활 과업"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 당번 등록</span>
          </button>
        </div>
      </section>

      {/* 2. Main Body: Left Category Tree + Right Content Area (Direct access without redundant KPI bento) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Category Tree (ELM-TRE-02) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3.5">
          <ElmTre02
            title="당번 카테고리 분류"
            data={categoryTreeData}
            selectedIds={selectedCategoryIds}
            onSelect={(newIds: string[]) => setSelectedCategoryIds(newIds)}
            totalCount={totalDutiesCount}
            isCollapsed={isCategoryCollapsed}
            onToggleCollapse={() => setIsCategoryCollapsed((prev) => !prev)}
          />
        </aside>

        {/* Right Column: Search, Tabs, and Duty Cards */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Search Bar & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-[#121215] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex-1">
              <ElmInp04
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="당번 과업명, 담당자 이름, 카테고리 검색..."
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="DUE_DATE">마감기한 순</option>
                <option value="TITLE">과업 명칭순</option>
                <option value="COMPLETED">누적 완수순</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs (div1 with ElmSld03 Slide Drag Wheel) */}
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
            <ElmSld03 showNavButtons={false} className="w-full" innerClassName="items-center gap-1.5 pb-0.5 flex-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>전체 당번</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {totalDutiesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MY')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'MY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>내 담당 당번</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'MY' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {myDutiesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('SUBSTITUTE')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'SUBSTITUTE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>대신수행 요청</span>
                {substituteRequestsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'SUBSTITUTE' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                    {substituteRequestsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('INVITATION')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'INVITATION'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>초대함</span>
                {pendingInvitationsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'INVITATION' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'}`}>
                    {pendingInvitationsCount}
                  </span>
                )}
              </button>
            </ElmSld03>
          </div>

          {/* Tab Content: Invitations View */}
          {activeTab === 'INVITATION' ? (
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-sm">
                  도착한 당번 초대장이 없습니다.
                </div>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv.invitation_id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {inv.category_name}
                        </span>
                        <span className="text-xs text-slate-400">초대일: {inv.invited_at}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{inv.duty_title}</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        초대자: <strong className="text-slate-700 dark:text-zinc-200">{inv.inviter_name}</strong> • 배정 역할:{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {inv.role === 'ASSIGNEE' ? '당번 수행원' : '관람·응원단'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {inv.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRejectInvitation(inv.invitation_id)}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            거절
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptInvitation(inv.invitation_id)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                          >
                            수락하고 참여
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            inv.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {inv.status === 'ACCEPTED' ? '✓ 수락 완료' : '거절됨'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Duty Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {filteredDuties.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    🔍
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">조회된 당번 과업이 없습니다</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    검색 조건 또는 카테고리 필터를 변경하거나, 상단의 [+ 새 당번 등록] 버튼으로 새로운 생활 역할을 시작해보세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryIds([]);
                      setSearchQuery('');
                      setActiveTab('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    필터 전체 초기화
                  </button>
                </div>
              ) : (
                filteredDuties.map((duty) => {
                  const isSubmitted = duty.progress_status === 'SUBMITTED';
                  const isApproved = duty.evaluation_status === 'AUTO_APPROVED' || duty.evaluation_status === 'MANUAL_CONFIRMED';
                  const hasSubRequest = duty.active_substitute_request && duty.active_substitute_request.status === 'PENDING';

                  return (
                    <div
                      key={duty.duty_id}
                      onClick={() => onNavigateToDetail && onNavigateToDetail(duty.duty_id)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                    >
                      {/* Card Top: Category, Days, Rotation, Settlement cycle */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                            {duty.category_name}
                          </span>
                          {/* Korean Rotation Policy */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700">
                            {getRotationPolicyLabel(duty.rotation_policy)}
                          </span>
                        </div>

                        {/* Orthogonal 3-State Badges */}
                        <div className="flex items-center gap-1">
                          {isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>승인완료</span>
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>인증 제출됨</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              수행 대기
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Title & Description */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {duty.duty_title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {duty.duty_description}
                        </p>
                      </div>

                      {/* Cycle Schedule Banner (High readability Korean badge) */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{formatKoreanCycleDays(duty.cycle_config.days_of_week)}</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                          누적 완수 {duty.completed_count}회
                        </span>
                      </div>

                      {/* Substitute Request Alert Banner */}
                      {hasSubRequest && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                            <span>대신수행 요청 중</span>
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                            보상 ₩{duty.active_substitute_request?.allowance_amount?.toLocaleString() || '3,000'}
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Assignee Info & Next Due */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                            {duty.current_assigned_name.slice(0, 1)}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {duty.current_assigned_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                          <span>마감: {duty.next_due_date || '오늘'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Modal: 새 당번 등록 (다줄 textarea 및 Markdown 미리보기) */}
      <ElmBsh01
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="새 모아당번 등록"
        badge="SCR-DUT-01"
      >
        <form onSubmit={handleCreateDuty} className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              카테고리 분류
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 당번 명칭 (다줄 지원 textarea) */}
          <ElmTxt01
            label="당번 과업 명칭"
            value={formTitle}
            onChange={setFormTitle}
            placeholder="예: 거실 청소기 및 물걸레 밀기, 주말 분리배출"
            rows={2}
            maxLength={60}
          />

          {/* 상세 완수 기준 및 주의사항 (편집 / MD 미리보기 탭) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                상세 완수 기준 및 수행 가이드 (마크다운 지원)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('EDIT')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    descPreviewMode === 'EDIT'
                      ? 'bg-white dark:bg-zinc-700 font-bold text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>편집</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('PREVIEW')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    descPreviewMode === 'PREVIEW'
                      ? 'bg-white dark:bg-zinc-700 font-bold text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <EyeIcon className="w-3 h-3" />
                  <span>미리보기</span>
                </button>
              </div>
            </div>

            {descPreviewMode === 'EDIT' ? (
              <ElmTxt01
                value={formDesc}
                onChange={setFormDesc}
                placeholder="예:&#10;- [ ] 거실 소파 밑과 복도까지 물걸레 밀기&#10;- [ ] 먼지 배출통 비우기&#10;**주의사항**: 주 3회 정기 수행 완료 후 사진 인증 첨부 필수."
                rows={4}
                maxLength={400}
                helperText="불릿(- ), 체크박스(- [ ]), 볼드(**텍스트**) 등 마크다운 서식이 적용됩니다."
              />
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/50 min-h-[100px]">
                {renderMarkdown(formDesc)}
              </div>
            )}
          </div>

          {/* 순환 주기 및 요일 선택 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              수행 요일 선택 (주기)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                const dayLabel: Record<string, string> = {
                  MON: '월',
                  TUE: '화',
                  WED: '수',
                  THU: '목',
                  FRI: '금',
                  SAT: '토',
                  SUN: '일',
                };
                const isSelected = formCycleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormCycleDays(formCycleDays.filter((d) => d !== day));
                      } else {
                        setFormCycleDays([...formCycleDays, day]);
                      }
                    }}
                    className={`min-h-[36px] min-w-[36px] px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {dayLabel[day]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 순환 배정 정책 & 정산 기준 주기 & 승인 정책 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                순환 배정 정책
              </label>
              <select
                value={formRotationPolicy}
                onChange={(e) => setFormRotationPolicy(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="AGE_WEIGHTED">연령 가중치 순환</option>
                <option value="ROUND_ROBIN">순차 순환 (Round Robin)</option>
                <option value="RANDOM_ROULETTE">랜덤 룰렛 추첨</option>
                <option value="FREE_PICK">자율 신청 배정</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                정산 기준 주기
              </label>
              <select
                value={formSettlementCycle}
                onChange={(e) => setFormSettlementCycle(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="WEEKLY">주간 정산 (매주 일요일)</option>
                <option value="MONTHLY">월간 정산 (말일 결산)</option>
                <option value="DAILY">일간 즉시 정산</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                완료 승인 방식
              </label>
              <select
                value={formApprovalPolicy}
                onChange={(e) => setFormApprovalPolicy(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="PEER_3_APPROVAL">구성원 3인 승인</option>
                <option value="SELF_CONFIRM">자율 즉시 승인</option>
                <option value="ADMIN_APPROVAL">관리자 단독 승인</option>
              </select>
            </div>
          </div>

          {/* 보안 참가자 / 관람자 선택 영역 */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>참가자 & 관람원 목록 ({formParticipants.length}명)</span>
              </span>
              <button
                type="button"
                onClick={() => setMemberSelectModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>가계부 구성원 선택</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {formParticipants.map((p, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                    [{p.role === 'ASSIGNEE' ? '수행원' : '관람원'}]
                  </span>
                  {formParticipants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormParticipants(formParticipants.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              새 당번 등록 완료
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 4. Modal: 가계부 구성원 보안 선택 팝업 (개인정보 보호 & Equals 검색) */}
      <ElmBsh01
        isOpen={memberSelectModalOpen}
        onClose={() => setMemberSelectModalOpen(false)}
        title="가계부 구성원 안전 선택"
        badge="보안 인증"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            개인정보 보호를 위해 불특정 전체 가입자 대신, 사용자가 소속된 가계부 인증 구성원만을 안전하게 검색하여 추가합니다.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ElmInp04
                value={memberSearchQuery}
                onChange={setMemberSearchQuery}
                placeholder="이름 또는 관계 정확 검색 (예: 배우자, 자녀)..."
              />
            </div>
            <select
              value={selectedMemberRole}
              onChange={(e) => setSelectedMemberRole(e.target.value as any)}
              className="h-10 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
            >
              <option value="ASSIGNEE">당번 수행원</option>
              <option value="VIEWER">관람·응원단</option>
            </select>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableLedgerMembers
              .filter((m) => {
                if (!memberSearchQuery.trim()) return true;
                const q = memberSearchQuery.toLowerCase();
                return m.name.toLowerCase().includes(q) || m.relation.toLowerCase().includes(q);
              })
              .map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-zinc-100">{member.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      소속: {member.ledgerName} • 관계: {member.relation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMemberToForm(member)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              ))}
          </div>
        </div>
      </ElmBsh01>

      {/* Toast Notification */}
      <ElmToast01
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
