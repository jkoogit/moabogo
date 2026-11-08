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
  const [generatedReport, setGeneratedReport] = useState<DutyComprehensiveReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
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

        {/* Orthogonal 3-State Interactive Controller with Settlement Cycle */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 1. 진행 상태 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="font-semibold">① 진행 상태</span>
              <span className="font-mono text-[10px]">{duty.progress_status}</span>
            </div>
            <div className="flex items-center gap-1">
              {(['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateProgressStatus(st)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    duty.progress_status === st
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ASSIGNED' ? '할당됨' : st === 'IN_PROGRESS' ? '수행중' : '제출됨'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 정산 상태 및 기준 주기 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="font-semibold">② 정산 기준 & 상태</span>
              <button
                type="button"
                onClick={() => {
                  const nextCycle = settlementCycle === 'WEEKLY' ? 'MONTHLY' : settlementCycle === 'MONTHLY' ? 'DAILY' : 'WEEKLY';
                  setSettlementCycle(nextCycle);
                  showToast(`정산 기준 주기가 "${nextCycle === 'WEEKLY' ? '주간정산' : nextCycle === 'MONTHLY' ? '월간정산' : '일간정산'}"(으)로 변경되었습니다.`);
                }}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                title="정산 주기 변경"
              >
                {settlementCycle === 'WEEKLY' ? '주간정산' : settlementCycle === 'MONTHLY' ? '월간정산' : '일간정산'} (수정)
              </button>
            </div>
            <div className="flex items-center gap-1">
              {(['UNSETTLED', 'SETTLED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateSettlementStatus(st)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    duty.settlement_status === st
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'UNSETTLED' ? '미정산' : '정산완료'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 평가 검증 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="font-semibold">③ 평가 검증</span>
              <span className="font-mono text-[10px]">{duty.evaluation_status}</span>
            </div>
            <div className="flex items-center gap-1">
              {(['UNVERIFIED', 'AUTO_APPROVED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateEvaluationStatus(st)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    duty.evaluation_status === st
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'UNVERIFIED' ? '미검증' : '승인완료'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation Bar (Now with 5 tabs including MEMBERS wrapped in ElmSld03 Slide Drag Wheel) */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab('EXECUTION')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
          </div>
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

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">
                      최종 차액 정산액
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {pair.from_name} 송금 대상
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₩{pair.netted_amount.toLocaleString()} {pair.is_cleared && '(상계 완료)'}
                  </span>
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

      {/* Toast Feedback */}
      <ElmToast01
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
