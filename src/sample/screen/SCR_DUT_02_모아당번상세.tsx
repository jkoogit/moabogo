import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmBsh01,
  ElmTxt01,
  ElmToast01,
  ElmHlp01,
  ElmSld03,
} from '../elements/Tokens';
import {
  Sparkles,
  Camera,
  CheckCircle,
  Clock,
  RotateCcw,
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
  Copy,
  ThumbsUp,
  Award,
  BarChart3,
  TrendingUp,
  Flame,
  Trophy,
  Medal,
  Settings2,
  ArrowUpRight,
  PieChart,
  Info,
  FileText,
  Printer,
  Download,
  CreditCard,
  ArrowDownRight,
  Handshake,
  CheckCircle2,
  AlertCircle,
  Share2,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Filter,
  Edit3,
  HelpCircle,
} from 'lucide-react';
import {
  MoaDuty,
  DutyCategory,
  DutyParticipant,
  DutyExecutionLog,
  DutyRotationPolicy,
  DutyCycleConfig,
  DutyApprovalPolicy,
  DutyDurationType,
  DutySubstituteRequest,
  DutyStatsPeriod,
  DutyStatsDataPoint,
  MemberContributionRank,
  SubstituteSettlementItem,
  SubstituteNettingPair,
  DutyComprehensiveReport,
} from '../../types';
import {
  INITIAL_DUTIES,
  INITIAL_DUTY_CATEGORIES,
  INITIAL_DUTY_LOGS,
  INITIAL_SUBSTITUTE_SETTLEMENTS,
  calculateNextAssignee,
  calculateDutyStats,
  calculateMemberRanks,
  calculateDutyKPIs,
  calculateSubstituteNetting,
  generateDutyComprehensiveReport,
} from '../dutyStore';
import { formatKoreanCycleDays, getRotationPolicyLabel } from './SCR_DUT_01_모아당번관리';

interface SCR_DUT_02_Props {
  dutyId?: string;
  onBack?: () => void;
  onNavigateToManagement?: () => void;
  onOpenQuickRegister?: () => void;
}

export const SCR_DUT_02_모아당번상세: React.FC<SCR_DUT_02_Props> = ({
  dutyId = 'duty-01',
  onBack,
  onNavigateToManagement,
  onOpenQuickRegister,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  // 1. Store states
  const [duties, setDuties] = useState<MoaDuty[]>(INITIAL_DUTIES);
  const [currentDutyId, setCurrentDutyId] = useState<string>(dutyId);
  const [logs, setLogs] = useState<DutyExecutionLog[]>(INITIAL_DUTY_LOGS);
  const [settlements, setSettlements] = useState<SubstituteSettlementItem[]>(INITIAL_SUBSTITUTE_SETTLEMENTS);

  // Active Duty
  const duty = useMemo(() => {
    return duties.find((d) => d.duty_id === currentDutyId) || duties[0];
  }, [duties, currentDutyId]);

  // Member Recruitment State (모집 중 vs 초대 동결)
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(true);

  // Settlement Cycle (정산 기준 주기: 주간, 월간, 일간)
  const [settlementCycle, setSettlementCycle] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY'>('WEEKLY');

  // 2. Navigation Tabs inside Detail: EXECUTION | STATS | SUBSTITUTE | LOGS | MEMBERS
  const [activeTab, setActiveTab] = useState<'EXECUTION' | 'STATS' | 'SUBSTITUTE' | 'LOGS' | 'MEMBERS'>('EXECUTION');

  // Subtab for MEMBERS tab: ASSIGNEES vs VIEWERS
  const [memberSubTab, setMemberSubTab] = useState<'ASSIGNEES' | 'VIEWERS'>('ASSIGNEES');

  // 3. Stats & Ranking States
  const [statsPeriod, setStatsPeriod] = useState<DutyStatsPeriod>('WEEKLY');
  const [selectedStatPoint, setSelectedStatPoint] = useState<DutyStatsDataPoint | null>(null);

  // 4. Logs Filtering State: Selected Member Filter
  const [selectedLogMemberName, setSelectedLogMemberName] = useState<string>('ALL');

  // 5. Modals
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showStateGuideModal, setShowStateGuideModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<DutyComprehensiveReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // 6. Edit Duty Form States
  const [editFormTitle, setEditFormTitle] = useState('');
  const [editFormDesc, setEditFormDesc] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('cat-clean');
  const [editFormRotationPolicy, setEditFormRotationPolicy] = useState<DutyRotationPolicy>('AGE_WEIGHTED');
  const [editFormApprovalPolicy, setEditFormApprovalPolicy] = useState<DutyApprovalPolicy>('PEER_3_APPROVAL');
  const [editFormSettlementCycle, setEditFormSettlementCycle] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY'>('WEEKLY');
  const [editFormCycleDays, setEditFormCycleDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [editFormProgressStatus, setEditFormProgressStatus] = useState<MoaDuty['progress_status']>('ASSIGNED');
  const [editFormSettlementStatus, setEditFormSettlementStatus] = useState<MoaDuty['settlement_status']>('UNSETTLED');
  const [editFormEvaluationStatus, setEditFormEvaluationStatus] = useState<MoaDuty['evaluation_status']>('UNVERIFIED');
  const [descPreviewMode, setDescPreviewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');

  const handleOpenEditModal = () => {
    setEditFormTitle(duty.duty_title);
    setEditFormDesc(duty.duty_description || '');
    setEditFormCategory(duty.category_id);
    setEditFormRotationPolicy(duty.rotation_policy);
    setEditFormApprovalPolicy(duty.approval_policy);
    setEditFormSettlementCycle(settlementCycle);
    setEditFormCycleDays(duty.cycle_config?.days_of_week || ['MON', 'WED', 'FRI']);
    setEditFormProgressStatus(duty.progress_status);
    setEditFormSettlementStatus(duty.settlement_status);
    setEditFormEvaluationStatus(duty.evaluation_status);
    setDescPreviewMode('EDIT');
    setEditModalOpen(true);
  };

  const handleSaveDutyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormTitle.trim()) {
      showToast('당번 명칭을 입력해주세요.');
      return;
    }
    const catObj = INITIAL_DUTY_CATEGORIES.find((c) => c.category_id === editFormCategory);

    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? {
              ...d,
              duty_title: editFormTitle.trim(),
              duty_description: editFormDesc.trim(),
              category_id: editFormCategory,
              category_name: catObj?.name || d.category_name,
              rotation_policy: editFormRotationPolicy,
              approval_policy: editFormApprovalPolicy,
              cycle_config: {
                ...d.cycle_config,
                days_of_week: editFormCycleDays as any,
                target_count_per_cycle: editFormCycleDays.length,
              },
              progress_status: editFormProgressStatus,
              settlement_status: editFormSettlementStatus,
              evaluation_status: editFormEvaluationStatus,
            }
          : d
      )
    );
    setSettlementCycle(editFormSettlementCycle);
    setEditModalOpen(false);
    showToast(`✓ 당번 "${editFormTitle}" 정보가 성공적으로 수정되었습니다.`);
  };

  // Proof Form State
  const [proofImage, setProofImage] = useState<string>(
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'
  );
  const [proofMemo, setProofMemo] = useState<string>('');

  // Substitute Form State
  const [subReason, setSubReason] = useState<string>('');
  const [subReward, setSubReward] = useState<number>(3000);
  const [subTargetType, setSubTargetType] = useState<'OPEN' | 'DIRECT'>('OPEN');
  const [selectedSubTargetMemberIds, setSelectedSubTargetMemberIds] = useState<string[]>([]);

  // Stats Calculations
  const statsResult = useMemo(() => {
    return calculateDutyStats(statsPeriod, duties, logs);
  }, [statsPeriod, duties, logs]);

  const memberRanks = useMemo(() => {
    return calculateMemberRanks(duties, logs);
  }, [duties, logs]);

  const kpis = useMemo(() => {
    return calculateDutyKPIs(duties, logs);
  }, [duties, logs]);

  const nettingPairs = useMemo(() => {
    return calculateSubstituteNetting(settlements);
  }, [settlements]);

  // Predict Next Assignee
  const nextAssignee = useMemo(() => {
    return calculateNextAssignee(duty.rotation_policy, duty.participants, duty.current_assigned_participant_id);
  }, [duty]);

  // Short URL for Invite Link
  const shortInviteUrl = useMemo(() => {
    const code = duty.duty_id.replace('duty-', 'd-');
    return `https://moabogo.app/i/${code}`;
  }, [duty.duty_id]);

  // -------------------------------------------------------------
  // Handlers: Lifecycle 3-State Transition
  // -------------------------------------------------------------
  const handleUpdateProgressStatus = (newStatus: MoaDuty['progress_status']) => {
    setDuties((prev) =>
      prev.map((d) => (d.duty_id === duty.duty_id ? { ...d, progress_status: newStatus } : d))
    );
    showToast(`진행 상태가 "${newStatus}"(으)로 갱신되었습니다.`);
  };

  const handleUpdateSettlementStatus = (newStatus: MoaDuty['settlement_status']) => {
    setDuties((prev) =>
      prev.map((d) => (d.duty_id === duty.duty_id ? { ...d, settlement_status: newStatus } : d))
    );
    showToast(`정산 상태가 "${newStatus}"(으)로 갱신되었습니다.`);
  };

  const handleUpdateEvaluationStatus = (newStatus: MoaDuty['evaluation_status']) => {
    setDuties((prev) =>
      prev.map((d) => (d.duty_id === duty.duty_id ? { ...d, evaluation_status: newStatus } : d))
    );
    showToast(`평가 상태가 "${newStatus}"(으)로 갱신되었습니다.`);
  };

  // Proof Submission
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofMemo.trim()) {
      showToast('완수 확인 메모를 작성해주세요.');
      return;
    }

    const isAutoApproved = duty.approval_policy === 'SELF_CONFIRM' || duty.approval_policy === 'NO_APPROVAL';

    const newLog: DutyExecutionLog = {
      log_id: `log-${Date.now().toString().slice(-4)}`,
      duty_id: duty.duty_id,
      duty_title: duty.duty_title,
      executed_by_name: duty.current_assigned_name,
      executed_by_id: duty.current_assigned_participant_id,
      is_substitute: false,
      proof_image_url: proofImage,
      memo: proofMemo.trim(),
      submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      evaluation_status: isAutoApproved ? 'AUTO_APPROVED' : 'UNVERIFIED',
      approvals_count: 1,
      approvals_required: duty.approval_policy === 'PEER_3_APPROVAL' ? 3 : 1,
      approved_by_list: ['구본영(호스트)'],
    };

    setLogs((prev) => [newLog, ...prev]);
    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? {
              ...d,
              progress_status: 'SUBMITTED',
              evaluation_status: isAutoApproved ? 'AUTO_APPROVED' : 'UNVERIFIED',
              completed_count: d.completed_count + 1,
            }
          : d
      )
    );

    setProofModalOpen(false);
    setProofMemo('');
    showToast('✓ 완수 인증 사진 및 일지가 성공적으로 등록되었습니다.');
  };

  // Direct Peer Approval (Renamed to clear Korean: 당번 완료 승인)
  const handleApproveDuty = () => {
    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? {
              ...d,
              evaluation_status: 'AUTO_APPROVED',
              progress_status: 'SUBMITTED',
            }
          : d
      )
    );
    showToast('✓ 당번 완료 승인 투표 완료! 과업이 공식 완수 처리되었습니다.');
  };

  // Request Substitute
  const handleSubmitSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (subTargetType === 'DIRECT' && selectedSubTargetMemberIds.length === 0) {
      showToast('대신수행을 요청할 대상 구성원을 최소 1명 이상 선택해주세요.');
      return;
    }

    const newRequest: DutySubstituteRequest = {
      request_id: `sub-${Date.now().toString().slice(-4)}`,
      duty_id: duty.duty_id,
      requester_id: duty.current_assigned_participant_id || 'p-1',
      requester_name: duty.current_assigned_name,
      target_type: subTargetType === 'DIRECT' ? 'SPECIFIC' : 'OPEN',
      status: 'PENDING',
      benefit_type: 'ALLOWANCE_MONEY',
      allowance_amount: subReward,
      memo: subReason.trim() || '개인 일정으로 인한 대신수행 요청',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? {
              ...d,
              active_substitute_request: newRequest,
            }
          : d
      )
    );

    setSubstituteModalOpen(false);
    setSubReason('');
    setSelectedSubTargetMemberIds([]);
    showToast('✓ 대신수행 요청이 등록되었습니다. 지정 구성원에게 알림이 전송됩니다.');
  };

  // Member Management Actions
  const handleRemoveMember = (participantId: string, memberName: string) => {
    if (duty.participants.length <= 1) {
      showToast('최소 1명 이상의 수행원이 유지되어야 합니다.');
      return;
    }
    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? {
              ...d,
              participants: d.participants.filter((p) => p.participant_id !== participantId),
            }
          : d
      )
    );
    showToast(`✓ "${memberName}" 님이 향후 당번 순환 배정에서 제외(해제)되었습니다.`);
  };

  // Generate Comprehensive Report
  const handleOpenReportModal = () => {
    const report = generateDutyComprehensiveReport(
      duties,
      logs,
      settlements,
      '2026-10-01 ~ 2026-10-31 (10월 결산)'
    );
    setGeneratedReport(report);
    setReportModalOpen(true);
  };

  // Copy Short Invite Link
  const handleCopyShortLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shortInviteUrl);
      showToast('✓ 단축 초대 링크가 클립보드에 복사되었습니다.');
    }
  };

  // Markdown Renderer Helper
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <p className="text-slate-400 italic">등록된 완수 가이드가 없습니다.</p>;
    }
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
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

  // Filtered Logs by Member
  const filteredLogs = useMemo(() => {
    const dutyLogs = logs.filter((l) => l.duty_id === duty.duty_id);
    if (selectedLogMemberName === 'ALL') return dutyLogs;
    return dutyLogs.filter((l) => l.executed_by_name.includes(selectedLogMemberName));
  }, [logs, duty.duty_id, selectedLogMemberName]);

  // Unique Members in Duty Logs for Master-Detail List
  const logMembersSummary = useMemo(() => {
    const map = new Map<string, number>();
    logs.filter((l) => l.duty_id === duty.duty_id).forEach((l) => {
      map.set(l.executed_by_name, (map.get(l.executed_by_name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [logs, duty.duty_id]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header Section (Clean: Duty dropdown removed, Invite & Recruitment toggle added) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBack || onNavigateToManagement}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
            title="모아당번 관리 목록으로 돌아가기"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <ElmTyp01
            title="모아당번 상세"
            badge="SCR-DUT-02"
            subtitle="역할 수행 인증·승인, 대신수행 상계정산 및 기여도 통계 • 함께 완성하는 책임 생활"
          />
        </div>

        {/* Header Right: Invite Link Button & Recruitment State Toggle */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Recruitment Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsRecruitmentOpen(!isRecruitmentOpen);
              showToast(isRecruitmentOpen ? '멤버 모집이 동결되었습니다. 신규 초대가 제한됩니다.' : '멤버 모집이 개시되었습니다.');
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isRecruitmentOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
            }`}
            title="마스터 권한: 신규 참여자 모집 상태 변경"
          >
            {isRecruitmentOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isRecruitmentOpen ? '모집 진행중' : '모집 동결'}</span>
          </button>

          {/* Edit Duty Button */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="당번 과업 속성, 정책 및 상태 수정"
          >
            <Edit3 className="w-4 h-4" />
            <span>당번 정보 수정</span>
          </button>

          {/* Invite Link Button */}
          <button
            type="button"
            onClick={() => setInviteLinkModalOpen(true)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="초대 링크 생성"
          >
            <Share2 className="w-4 h-4" />
            <span>초대 링크 생성</span>
          </button>
        </div>
      </section>

      {/* 2. Duty Profile & Orthogonal 3-State Lifecycle Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            {/* High Readability Korean Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                {duty.category_name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>{formatKoreanCycleDays(duty.cycle_config.days_of_week)}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60">
                {getRotationPolicyLabel(duty.rotation_policy)}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              {duty.duty_title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              {duty.duty_description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setProofModalOpen(true)}
              className="flex-1 md:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>완수 인증 제출</span>
            </button>
            <button
              type="button"
              onClick={() => setSubstituteModalOpen(true)}
              className="flex-1 md:flex-none min-h-[44px] px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>대신수행 요청</span>
            </button>
          </div>
        </div>

        {/* Orthogonal 3-State Info Dashboard (정보 제공 뷰어) */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. 진행 상태 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">① 진행 상태</span>
                  <button
                    type="button"
                    onClick={() => setShowStateGuideModal(true)}
                    className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                    title="직교 3상태머신 설명 레이어 팝업 열기"
                  >
                    ?
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">담당: {duty.current_assigned_name}</span>
              </div>
              <div className="flex items-center gap-2">
                {duty.progress_status === 'COMPLETED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>완수 마감 (COMPLETED)</span>
                  </span>
                ) : duty.progress_status === 'SUBMITTED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>인증 제출됨 (SUBMITTED)</span>
                  </span>
                ) : duty.progress_status === 'IN_PROGRESS' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
                    <Flame className="w-4 h-4 text-blue-600" />
                    <span>수행 진행중 (IN_PROGRESS)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>할당/대기 (ASSIGNED)</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2. 정산 기준 & 상태 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">② 정산 기준 & 상태</span>
                <select
                  aria-label="정산 기준 주기 선택"
                  value={settlementCycle}
                  onChange={(e) => {
                    const val = e.target.value as 'WEEKLY' | 'MONTHLY' | 'DAILY';
                    setSettlementCycle(val);
                    showToast(`정산 기준 주기가 "${val === 'WEEKLY' ? '주간정산' : val === 'MONTHLY' ? '월간정산' : '일간정산'}"(으)로 변경되었습니다.`);
                  }}
                  className="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="WEEKLY">주간정산 (WEEKLY)</option>
                  <option value="MONTHLY">월간정산 (MONTHLY)</option>
                  <option value="DAILY">일간정산 (DAILY)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {duty.settlement_status === 'SETTLED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5 shadow-2xs">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    <span>정산 완료 (SETTLED)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>미정산 (UNSETTLED)</span>
                  </span>
                )}
              </div>
            </div>

            {/* 3. 평가 검증 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">③ 평가 검증</span>
                <span className="text-[11px] text-slate-400 font-mono">정책: {duty.approval_policy}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div>
                  {duty.evaluation_status === 'AUTO_APPROVED' ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>자동 승인 완료</span>
                    </span>
                  ) : duty.evaluation_status === 'MANUAL_CONFIRMED' ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>상호 승인 완료</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span>미검증 (UNVERIFIED)</span>
                    </span>
                  )}
                </div>
                {duty.evaluation_status === 'UNVERIFIED' && (
                  <button
                    type="button"
                    onClick={handleApproveDuty}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>✓ 피어 승인</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation Bar (Now with 5 tabs including MEMBERS wrapped in ElmSld03 Slide Drag Wheel) */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
        <ElmSld03 showNavButtons={false} className="w-full" innerClassName="items-center gap-1.5 pb-0.5 flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('EXECUTION')}
            className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'EXECUTION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>당번 수행 및 인증</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'STATS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>실시간 통계 & 랭킹</span>
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
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>대신수행 & 상계정산</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'LOGS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>실적·인증 이력</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              {logs.filter((l) => l.duty_id === duty.duty_id).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEMBERS')}
            className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'MEMBERS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>구성원 정보 & 관리</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
              {duty.participants.length}
            </span>
          </button>
        </ElmSld03>
      </div>

      {/* 4. Tab 1: Execution & Proof View */}
      {activeTab === 'EXECUTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Current Assignee & Next Prediction Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 dark:text-zinc-200">현재 담당 수행원</span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">순번 1위</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                  {duty.current_assigned_name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {duty.current_assigned_name}
                  </h4>
                  <p className="text-xs text-slate-500">마감 예정일: {duty.next_due_date || '오늘'}</p>
                </div>
              </div>

              {/* Next Rotation Prediction */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>다음 순환 예측 배정자</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">자동 계산</span>
                </div>
                {nextAssignee ? (
                  <>
                    <div className="font-bold text-slate-800 dark:text-zinc-200">
                      {nextAssignee.name}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {duty.rotation_policy === 'AGE_WEIGHTED' ? `연령 가중치 ${nextAssignee.weight || 1}배 우선 배정` : '순차 순환 규칙 적용'}
                    </p>
                  </>
                ) : (
                  <div className="text-slate-400">배정 가능한 인원이 없습니다.</div>
                )}
              </div>

              {/* Quick Action Button (Clear Korean Terminology) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApproveDuty}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>당번 완료 승인 투표 (2/3명 찬성)</span>
                </button>
              </div>
            </div>

            {/* Participants Summary Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>참가자 배정 순서 및 가중치</span>
              </h4>
              <div className="space-y-1.5">
                {duty.participants.map((p, idx) => (
                  <div
                    key={p.participant_id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>가중치 {p.weight || 1}배</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        [{p.role === 'ASSIGNEE' ? '수행원' : '응원단'}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist & Completion Criteria Card (Markdown format rendering) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>완수 체크리스트 및 수행 가이드</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">가이드라인</span>
              </div>

              {/* Rendered Markdown Guide */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60">
                {renderMarkdown(duty.duty_description || '')}
              </div>

              {/* Latest Proof Showcase */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  최근 제출된 인증 내역
                </h5>
                {logs.filter((l) => l.duty_id === duty.duty_id).slice(0, 1).map((log) => (
                  <div
                    key={log.log_id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                  >
                    {log.proof_image_url && (
                      <img
                        src={log.proof_image_url}
                        alt="인증"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                      />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {log.executed_by_name} 완수
                        </span>
                        <span className="text-[10px] text-slate-400">{log.submitted_at}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px]">"{log.memo}"</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>당번 승인 완료 ({log.approvals_count}/{log.approvals_required || 1}인)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Stats & Ranking View (Bar click highlights details on the right card) */}
      {activeTab === 'STATS' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Period Selector & Quick KPIs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-1.5">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as DutyStatsPeriod[]).map((p) => {
                const pLabel = {
                  DAILY: '일별 통계',
                  WEEKLY: '주간 통계',
                  MONTHLY: '월간 통계',
                }[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setStatsPeriod(p);
                      setSelectedStatPoint(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statsPeriod === p
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>목표 완수율: <strong className="font-mono text-emerald-600">{kpis.overallRate}%</strong></span>
              <span>최장 연속 완수: <strong className="font-mono text-amber-500">{kpis.currentStreak}회</strong></span>
            </div>
          </div>

          {/* Interactive Chart & Contribution Ranking Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Trend Chart (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>주기별 완수율 추이 (막대를 클릭하여 기간 상세 조회)</span>
                </h4>
                {selectedStatPoint && (
                  <button
                    type="button"
                    onClick={() => setSelectedStatPoint(null)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    전체 랭킹 복귀 [✕]
                  </button>
                )}
              </div>

              {/* Simple SVG Bar Chart */}
              <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-zinc-800">
                {statsResult.map((dp, idx) => {
                  const barHeight = Math.max(8, Math.min(100, dp.completion_rate));
                  const isSelected = selectedStatPoint?.label === dp.label;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (selectedStatPoint?.label === dp.label) {
                          setSelectedStatPoint(null);
                        } else {
                          setSelectedStatPoint(dp);
                        }
                      }}
                      className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                      title={`${dp.label}: 완수율 ${dp.completion_rate}% (클릭 시 우측 상세 노출)`}
                    >
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                          isSelected
                            ? 'bg-amber-500 ring-2 ring-amber-400 scale-105 shadow-md'
                            : dp.completion_rate >= 80
                            ? 'bg-indigo-600 hover:bg-indigo-500'
                            : 'bg-indigo-400/80 dark:bg-indigo-700 hover:bg-indigo-500'
                        }`}
                      />
                      <span className={`text-[10px] font-mono truncate max-w-full ${isSelected ? 'font-bold text-amber-600' : 'text-slate-400'}`}>
                        {dp.label.slice(-3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>💡 막대 그래프를 클릭하면 해당 기간의 세부 실적 분석으로 우측 화면이 전환됩니다.</span>
              </div>
            </div>

            {/* Right: Member Contribution Ranking or Selected Period Detail (Item 8.1) */}
            <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
              {selectedStatPoint ? (
                /* Period Specific Details */
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <div>
                      <span className="text-[10px] text-amber-600 font-bold block">선택 기간 상세 현황</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{selectedStatPoint.label}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStatPoint(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                      <span className="text-[10px] text-slate-400 block">계획 과업</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">
                        {selectedStatPoint.total_scheduled}건
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                      <span className="text-[10px] text-emerald-600 block">완수 건수</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {selectedStatPoint.completed_count}건 ({selectedStatPoint.completion_rate}%)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50">
                      <span className="text-[10px] text-amber-600 block">대신수행</span>
                      <span className="font-bold font-mono text-amber-600">
                        {selectedStatPoint.substitute_count}건
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                      <span className="text-[10px] text-slate-400 block">미완수</span>
                      <span className="font-bold font-mono text-slate-600 dark:text-zinc-400">
                        {selectedStatPoint.uncompleted_count}건
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    해당 기간 동안 가족·모임 구성원들이 책임감 있게 역할을 완수하였습니다. 상단의 [전체 랭킹 복귀]를 누르면 누적 랭킹으로 돌아갑니다.
                  </p>
                </div>
              ) : (
                /* Full Cumulative Ranking */
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>구성원 기여도 랭킹</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">누적 기준</span>
                  </div>

                  <div className="space-y-2">
                    {memberRanks.map((member, idx) => (
                      <div
                        key={member.participant_id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-zinc-200">{member.name}</div>
                            <div className="text-[10px] text-slate-400">완수 {member.completed_count}회 • 달성률 {member.completion_rate}% • 스트릭 {member.streak_days}일</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {member.score}점
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Substitute & Netting View */}
      {activeTab === 'SUBSTITUTE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Handshake className="w-4 h-4 text-emerald-500" />
                <span>대신수행 상계정산(Netting) 엔진</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                구성원 간 대신수행 보상 머니를 1:1로 맞비교 상계하여 최종 차액만 정산합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenReportModal}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>종합 정산 보고서 발행</span>
            </button>
          </div>

          {/* Netting Pairs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nettingPairs.map((pair, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span>1:1 상계 정산</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {pair.from_name} ➔ {pair.to_name}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-xs flex items-center justify-between">
                  <span className="text-slate-500">대신수행 누적 ({pair.help_count}건)</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    총액 ₩{pair.gross_amount.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">
                      최종 차액 정산액
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {pair.from_name} ➔ {pair.to_name} 송금 대상
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₩{pair.netted_amount.toLocaleString()} {pair.is_cleared && '(상계 완료)'}
                    </span>
                    {!pair.is_cleared && pair.netted_amount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`✓ [${pair.from_name} ➔ ${pair.to_name}] ₩${pair.netted_amount.toLocaleString()}원 상계 정산이 완료되었습니다.`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        원클릭 상계 완료
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Logs History View (Item 16: Master-Detail 2-column layout) */}
      {activeTab === 'LOGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Member Master Filter (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>담당자별 이력 조회</span>
            </h4>

            <div className="space-y-1">
              {/* All Members Option */}
              <button
                type="button"
                onClick={() => setSelectedLogMemberName('ALL')}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedLogMemberName === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <span>전체 담당자 실적 보기</span>
                <span className="font-mono text-[10px]">
                  {logs.filter((l) => l.duty_id === duty.duty_id).length}건
                </span>
              </button>

              {/* Individual Members List */}
              {logMembersSummary.map(({ name, count }) => {
                const isSelected = selectedLogMemberName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedLogMemberName(name)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-indigo-600'
                      }`}>
                        {name.slice(0, 1)}
                      </div>
                      <span>{name}</span>
                    </div>
                    <span className="font-mono text-[10px]">{count}건</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Execution Logs Detail List (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 text-sm">
                해당 담당자의 등록된 완수 인증 이력이 없습니다.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.log_id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {log.proof_image_url ? (
                      <img
                        src={log.proof_image_url}
                        alt="인증"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0 text-xl">
                        📝
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                          {log.executed_by_name}
                        </span>
                        {log.is_substitute && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold">
                            대신수행
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{log.submitted_at}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                        "{log.memo}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>당번 승인 완료</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. Tab 5: 구성원 정보 & 관리 (Item 15 & Item 14.2 Lifecycle Support) */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          {/* Member Subtabs & Immutability Notice (Item 3: Replaced with ElmHlp01 popup) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMemberSubTab('ASSIGNEES')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberSubTab === 'ASSIGNEES'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>당번 수행원 ({duty.participants.filter((p) => p.role === 'ASSIGNEE').length}명)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberSubTab('VIEWERS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberSubTab === 'VIEWERS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>관람·응원단 ({duty.participants.filter((p) => p.role === 'VIEWER').length}명)</span>
                </button>

                {/* 3. 구성원 정보 & 관리 > 운영 안내 문구 ? 아이콘 레이어팝업으로 대체 (ELM-HLP-01) */}
                <ElmHlp01
                  title="당번 구성원 운영 및 불변 스냅샷 안내"
                  badge="운영 원칙"
                  tooltip="구성원 운영 안내 보기"
                  align="left"
                  width="sm:w-88"
                >
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                      <span className="text-sm">🔒</span>
                      <span>불변 스냅샷(Immutable Snapshot) 원칙</span>
                    </div>
                    <p>
                      이미 완료 및 정산된 과거 실적과 회계 이력은 <strong>불변 스냅샷</strong>으로 안전하게 보존되며 소급 변경되지 않습니다.
                    </p>
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <span>✨</span>
                        <span>미래 큐 자동 반영</span>
                      </div>
                      <p>
                        진행 도중 신규 참여자가 수용되거나 탈퇴·해제되는 경우, <strong>향후(미래) 회차의 배정 순환 큐</strong>에만 즉시 반영되어 운영 연속성을 유지합니다.
                      </p>
                    </div>
                  </div>
                </ElmHlp01>
              </div>

              <button
                type="button"
                onClick={() => setInviteLinkModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>새 구성원 초대</span>
              </button>
            </div>
          </div>

          {/* Members Table / List */}
          <div className="space-y-2">
            {duty.participants
              .filter((p) => (memberSubTab === 'ASSIGNEES' ? p.role === 'ASSIGNEE' : p.role === 'VIEWER'))
              .map((member, idx) => (
                <div
                  key={member.participant_id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{member.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                          순번 #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                          활동중
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        초대 수락: 2026-10-24 18:30 • 배정 가중치: {member.weight || 1}배 • 다음 배정: {duty.next_due_date || '오늘'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.participant_id, member.name)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>멤버 해제</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 9. Modal: 인증 사진 첨부 및 완수 제출 */}
      <ElmBsh01
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="당번 수행 인증 제출"
        badge="사진 인증"
      >
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              인증 사진 URL (또는 촬영 프리뷰)
            </label>
            <ElmInp01
              value={proofImage}
              onChange={setProofImage}
              placeholder="사진 이미지 링크 입력..."
            />
            {proofImage && (
              <img
                src={proofImage}
                alt="미리보기"
                className="w-full h-36 object-cover rounded-xl mt-2 border border-slate-200 dark:border-zinc-700"
              />
            )}
          </div>

          <ElmTxt01
            label="완수 확인 메모 및 특이사항"
            value={proofMemo}
            onChange={setProofMemo}
            placeholder="예: 거실 및 복도 소독 걸레질 완료했습니다. 다음 당번 분은 먼지통 필터 교체 필요합니다!"
            rows={3}
            maxLength={200}
            helperText="구성원 피어가 확인 후 즉시 승인할 수 있도록 간략한 완수 메모를 남겨주세요."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setProofModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              인증 제출 완료
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 10. Modal: 대신수행 요청 등록 (Item 3: Multi-select candidates when DIRECT chosen) */}
      <ElmBsh01
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
        title="당번 대신수행 요청"
        badge="상계 보상"
      >
        <form onSubmit={handleSubmitSubstitute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              요청 대상 범위
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubTargetType('OPEN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  subTargetType === 'OPEN'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                전체 오픈 요청 (선착순)
              </button>
              <button
                type="button"
                onClick={() => setSubTargetType('DIRECT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  subTargetType === 'DIRECT'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                지정 요청 (구성원 선택)
              </button>
            </div>
          </div>

          {/* Item 3: Direct Target Candidate Multi-Select List */}
          {subTargetType === 'DIRECT' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                대신수행을 요청할 구성원 선택 (복수 선택 가능)
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {duty.participants
                  .filter((p) => p.name !== duty.current_assigned_name && p.role === 'ASSIGNEE')
                  .map((candidate) => {
                    const isChecked = selectedSubTargetMemberIds.includes(candidate.participant_id);
                    return (
                      <div
                        key={candidate.participant_id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSubTargetMemberIds(selectedSubTargetMemberIds.filter((id) => id !== candidate.participant_id));
                          } else {
                            setSelectedSubTargetMemberIds([...selectedSubTargetMemberIds, candidate.participant_id]);
                          }
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          <span className="font-semibold">{candidate.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">가중치 {candidate.weight || 1}배</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              대신수행 보상금액 (모아머니 / 용돈)
            </label>
            <input
              type="number"
              value={subReward}
              onChange={(e) => setSubReward(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-mono"
            />
          </div>

          <ElmTxt01
            label="대신수행 요청 사유"
            value={subReason}
            onChange={setSubReason}
            placeholder="예: 이번 주말 야근 및 출장으로 인해 대신수행 부탁드립니다. 다음 주 화요일 제가 대신 수행하겠습니다!"
            rows={3}
            maxLength={200}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setSubstituteModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              대신수행 요청 발송
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 11. Modal: 종합 정산 보고서 */}
      <ElmBsh01
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="대신수행 종합 정산 보고서"
        badge="PDF 리포트"
        maxWidth="max-w-2xl"
      >
        {generatedReport && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                  {generatedReport.period_label}
                </h4>
                <p className="text-[11px] text-slate-500">보고서 번호: {generatedReport.report_id}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">발행일시</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                  {generatedReport.generated_at}
                </span>
              </div>
            </div>

            {/* Summary KPI row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                <span className="text-[10px] text-slate-400 block">총 수행 건수</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-zinc-200">
                  {generatedReport.total_substitute_count}건
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                <span className="text-[10px] text-slate-400 block">총 정산 완료액</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-zinc-200">
                  ₩{generatedReport.total_settled_amount.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
                <span className="text-[10px] text-emerald-600 block">미정산 잔여액</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₩{generatedReport.unsettled_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Report Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  showToast('✓ 보고서 PDF 저장이 완료되었습니다.');
                  setReportModalOpen(false);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>PDF 다운로드</span>
              </button>
            </div>
          </div>
        )}
      </ElmBsh01>

      {/* 12. Modal: 초대 링크 생성 (Item 12: Clean short URL & title) */}
      <ElmBsh01
        isOpen={inviteLinkModalOpen}
        onClose={() => setInviteLinkModalOpen(false)}
        title="초대 링크 생성"
        badge="간편 단축 링크"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            고유 단축 링크를 복사하여 메신저(카카오톡, 문자)로 전달하세요. 상대방이 접속하면 모아보고 로그인 후 바로 <strong>[{duty.duty_title}]</strong> 참여 수락 팝업이 표시됩니다.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate select-all">
              {shortInviteUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyShortLink}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>링크 복사</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
            <div className="font-bold text-indigo-900 dark:text-indigo-300">운영 가이드</div>
            <p>신규 참여자가 수락 시 [구성원 정보 & 관리] 탭에 등록되며, 다음 회차 순환 큐부터 공평하게 배정됩니다.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setInviteLinkModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* 13. Modal: 모아당번 정보 수정 (등록 팝업 규격 일원화 적용) */}
      <ElmBsh01
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="모아당번 정보 수정"
        badge="SCR-DUT-02 수정"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveDutyEdit} className="space-y-4">
          {/* 과업 명칭 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              당번 명칭 *
            </label>
            <input
              type="text"
              value={editFormTitle}
              onChange={(e) => setEditFormTitle(e.target.value)}
              placeholder="예: 거실 청소기 및 물걸레 밀기"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          {/* 카테고리 & 정산 기준 주기 2단 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                카테고리 분류
              </label>
              <select
                value={editFormCategory}
                onChange={(e) => setEditFormCategory(e.target.value)}
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {INITIAL_DUTY_CATEGORIES.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                정산 기준 주기
              </label>
              <select
                value={editFormSettlementCycle}
                onChange={(e) => setEditFormSettlementCycle(e.target.value as any)}
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="WEEKLY">주간 정산 (WEEKLY)</option>
                <option value="MONTHLY">월간 정산 (MONTHLY)</option>
                <option value="DAILY">일간 정산 (DAILY)</option>
              </select>
            </div>
          </div>

          {/* 순환 배정 및 완수 승인 정책 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                순환 배정 정책
              </label>
              <select
                value={editFormRotationPolicy}
                onChange={(e) => setEditFormRotationPolicy(e.target.value as any)}
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="AGE_WEIGHTED">연령 가중 순환 배정</option>
                <option value="ROUND_ROBIN">순차 순환 배정</option>
                <option value="RANDOM">랜덤 추첨 배정</option>
                <option value="FREE_PICK">자율 신청 배정</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                완수 승인 정책
              </label>
              <select
                value={editFormApprovalPolicy}
                onChange={(e) => setEditFormApprovalPolicy(e.target.value as any)}
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PEER_3_APPROVAL">피어 3인 교차 승인</option>
                <option value="ADMIN_APPROVAL">모임 관리자 승인</option>
                <option value="SELF_CONFIRM">수행자 자율 확인 (즉시완수)</option>
                <option value="NO_APPROVAL">무검증 자율 마감</option>
              </select>
            </div>
          </div>

          {/* 수행 요일 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              정기 수행 요일 선택
            </label>
            <div className="grid grid-cols-7 gap-1">
              {[
                { key: 'MON', label: '월' },
                { key: 'TUE', label: '화' },
                { key: 'WED', label: '수' },
                { key: 'THU', label: '목' },
                { key: 'FRI', label: '금' },
                { key: 'SAT', label: '토' },
                { key: 'SUN', label: '일' },
              ].map((day) => {
                const isSelected = editFormCycleDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (editFormCycleDays.length > 1) {
                          setEditFormCycleDays(editFormCycleDays.filter((d) => d !== day.key));
                        } else {
                          showToast('최소 1개 이상의 수행 요일을 지정해야 합니다.');
                        }
                      } else {
                        setEditFormCycleDays([...editFormCycleDays, day.key]);
                      }
                    }}
                    className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 직교 3상태머신 현황 및 수동 조정 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 space-y-2.5 text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px]">
              직교 3상태머신 상태값 조정 (마스터 권한)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">① 진행 상태</label>
                <select
                  value={editFormProgressStatus}
                  onChange={(e) => setEditFormProgressStatus(e.target.value as any)}
                  className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <option value="ASSIGNED">할당됨 (대기)</option>
                  <option value="IN_PROGRESS">수행 진행중</option>
                  <option value="SUBMITTED">인증 제출됨</option>
                  <option value="COMPLETED">과업 완수마감</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">② 정산 상태</label>
                <select
                  value={editFormSettlementStatus}
                  onChange={(e) => setEditFormSettlementStatus(e.target.value as any)}
                  className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <option value="UNSETTLED">미정산</option>
                  <option value="SETTLED">정산 완료</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">③ 검증 상태</label>
                <select
                  value={editFormEvaluationStatus}
                  onChange={(e) => setEditFormEvaluationStatus(e.target.value as any)}
                  className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <option value="UNVERIFIED">미검증</option>
                  <option value="AUTO_APPROVED">자동 승인</option>
                  <option value="MANUAL_CONFIRMED">상호 승인</option>
                </select>
              </div>
            </div>
          </div>

          {/* 완수 기준 설명 (마크다운 편집 / 미리보기 탭) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                완수 기준 및 수행 가이드 (마크다운 지원)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('EDIT')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                    descPreviewMode === 'EDIT'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  편집
                </button>
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('PREVIEW')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                    descPreviewMode === 'PREVIEW'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  미리보기
                </button>
              </div>
            </div>

            {descPreviewMode === 'EDIT' ? (
              <textarea
                value={editFormDesc}
                onChange={(e) => setEditFormDesc(e.target.value)}
                placeholder="완수 기준 및 체크리스트를 마크다운 형식으로 작성하세요."
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            ) : (
              <div className="min-h-[104px] p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40">
                {renderMarkdown(editFormDesc)}
              </div>
            )}
          </div>

          {/* Form Submit & Cancel Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>수정사항 저장</span>
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 14. Modal: 직교 3상태머신 설명 레이어 팝업 */}
      <ElmBsh01
        isOpen={showStateGuideModal}
        onClose={() => setShowStateGuideModal(false)}
        title="모아당번 직교 3상태머신 가이드"
        badge="도메인 규칙"
        maxWidth="max-w-md"
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1.5">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>직교 3상태머신(Orthogonal 3-State Machine)이란?</span>
            </h4>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
              모아당번의 3개 상태축(진행, 정산, 검증)은 상호 간섭이나 종속 없이 독립적으로 전이되는 모아보고의 핵심 도메인 거버넌스 규칙입니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">① 진행 상태 (Progress Status)</span>
              <p className="text-slate-500 text-[11px]">
                <strong>ASSIGNED(할당)</strong> ➔ <strong>IN_PROGRESS(수행중)</strong> ➔ <strong>SUBMITTED(제출됨)</strong> ➔ <strong>COMPLETED(완수)</strong>
                <br />과업 수행 담당자의 실제 이행 주기를 추적합니다.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">② 정산 상태 (Settlement Status)</span>
              <p className="text-slate-500 text-[11px]">
                <strong>UNSETTLED(미정산)</strong> ➔ <strong>SETTLED(정산완료)</strong>
                <br />주간/월간/일간 기준 주기에 따라 보상금 및 대신수행 채권·채무 상계를 처리합니다.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">③ 평가 검증 상태 (Evaluation Status)</span>
              <p className="text-slate-500 text-[11px]">
                <strong>UNVERIFIED(미검증)</strong> ➔ <strong>AUTO_APPROVED(자동승인)</strong> / <strong>MANUAL_CONFIRMED(상호승인)</strong>
                <br />정책에 따라 피어 다자간 투표 또는 관리자 확인을 거쳐 인증의 신뢰성을 보증합니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowStateGuideModal(false)}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              확인
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* Toast Feedback */}
      <ElmToast01
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
