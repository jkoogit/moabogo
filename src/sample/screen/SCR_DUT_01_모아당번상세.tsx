import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmBsh01,
  ElmSwt01,
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
  Search,
  Filter,
  Share2,
  Calendar,
  ShieldCheck,
  Coins,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Tag,
  AlertCircle,
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
  DayOfWeek,
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
  INITIAL_INVITATIONS,
  INITIAL_DUTY_LOGS,
  INITIAL_SUBSTITUTE_SETTLEMENTS,
  calculateNextAssignee,
  calculateDutyStats,
  calculateMemberRanks,
  calculateDutyKPIs,
  calculateSubstituteNetting,
  generateDutyComprehensiveReport,
  DutyInvitation,
} from '../dutyStore';

export const SCR_DUT_01_모아당번상세: React.FC<{
  onOpenQuickRegister?: () => void;
  onNavigateToGoal?: () => void;
  onBack?: () => void;
}> = ({ onOpenQuickRegister, onNavigateToGoal, onBack }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  // State Management
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'SUBSTITUTE' | 'INVITATION' | 'LOGS' | 'STATS'>('STATS');
  const [duties, setDuties] = useState<MoaDuty[]>(INITIAL_DUTIES);
  const [categories, setCategories] = useState<DutyCategory[]>(INITIAL_DUTY_CATEGORIES);
  const [invitations, setInvitations] = useState<DutyInvitation[]>(INITIAL_INVITATIONS);
  const [logs, setLogs] = useState<DutyExecutionLog[]>(INITIAL_DUTY_LOGS);
  const [settlements, setSettlements] = useState<SubstituteSettlementItem[]>(INITIAL_SUBSTITUTE_SETTLEMENTS);

  // Stats & Ranking State
  const [statsPeriod, setStatsPeriod] = useState<DutyStatsPeriod>('WEEKLY');
  const [selectedRankMember, setSelectedRankMember] = useState<MemberContributionRank | null>(null);
  const [statsConfigModalOpen, setStatsConfigModalOpen] = useState(false);
  const [statsConfig, setStatsConfig] = useState({
    weekStartsOn: 'MON' as 'MON' | 'SUN',
    targetRateThreshold: 80,
    notifyStreak: true,
  });
  const [hoveredDataPoint, setHoveredDataPoint] = useState<DutyStatsDataPoint | null>(null);

  // 9번 대신수행 정산 및 종합 보고서 모달 상태
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<DutyComprehensiveReport | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedMissionTypeFilter, setSelectedMissionTypeFilter] = useState<'ALL' | 'DUTY' | 'GOAL'>('ALL');

  // Modals & Bottom Sheets
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);

  // Active items for modals
  const [selectedDutyForSub, setSelectedDutyForSub] = useState<MoaDuty | null>(null);
  const [selectedDutyForProof, setSelectedDutyForProof] = useState<MoaDuty | null>(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // Form State: 새 당번 등록
  // -------------------------------------------------------------
  const [formMissionType, setFormMissionType] = useState<'DUTY' | 'GOAL'>('DUTY');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('cat-clean');
  const [formSubCategory, setFormSubCategory] = useState('청소');
  const [formRotationPolicy, setFormRotationPolicy] = useState<DutyRotationPolicy>('RANDOM');
  const [formCycleType, setFormCycleType] = useState<'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('WEEKLY');
  const [formCycleDays, setFormCycleDays] = useState<DayOfWeek[]>(['MON', 'THU']);
  const [formTargetCount, setFormTargetCount] = useState(1);
  const [formApprovalPolicy, setFormApprovalPolicy] = useState<DutyApprovalPolicy>('PEER_3_APPROVAL');
  const [formDurationType, setFormDurationType] = useState<DutyDurationType>('INDEFINITE');
  const [formCanSubstitute, setFormCanSubstitute] = useState(true);
  const [formNewAssigneeName, setFormNewAssigneeName] = useState('');
  const [formParticipants, setFormParticipants] = useState<DutyParticipant[]>([
    {
      participant_id: 'p-me',
      user_id: 'u-1',
      name: '구본영(나/호스트)',
      role: 'ASSIGNEE',
      is_guest: false,
      order_index: 0,
      invitation_status: 'ACCEPTED',
      birth_date: '1988-05-12',
      weight: 1,
    },
    {
      participant_id: 'p-sub1',
      user_id: 'u-2',
      name: '이지은(배우자)',
      role: 'ASSIGNEE',
      is_guest: false,
      order_index: 1,
      invitation_status: 'ACCEPTED',
      birth_date: '1990-08-20',
      weight: 1,
    },
  ]);

  // -------------------------------------------------------------
  // Form State: 새 카테고리 추가
  // -------------------------------------------------------------
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');
  const [newCatMissionType, setNewCatMissionType] = useState<'DUTY' | 'GOAL' | 'ALL'>('DUTY');

  // -------------------------------------------------------------
  // Form State: 대신수행 요청
  // -------------------------------------------------------------
  const [subTargetType, setSubTargetType] = useState<'SPECIFIC' | 'OPEN'>('OPEN');
  const [subTargetPerson, setSubTargetPerson] = useState('이지은(배우자)');
  const [subBenefitType, setSubBenefitType] = useState<'ALLOWANCE_MONEY' | 'SUBSTITUTE_COUPON' | 'NONE'>('ALLOWANCE_MONEY');
  const [subAllowanceAmount, setSubAllowanceAmount] = useState(5000);
  const [subAutoCreateExpense, setSubAutoCreateExpense] = useState(true);
  const [subPaymentLink, setSubPaymentLink] = useState('https://qr.kakaopay.com/sample_transfer_link');
  const [subMemo, setSubMemo] = useState('개인 사정으로 대신 요청합니다. 완료 시 바로 정산해드려요!');

  // -------------------------------------------------------------
  // Form State: 실적/인증 제출
  // -------------------------------------------------------------
  const [proofMemo, setProofMemo] = useState('깔끔하게 완료했습니다!');
  const [proofImg, setProofImg] = useState(
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'
  );

  // -------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------
  // 새 카테고리 등록
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: DutyCategory = {
      category_id: `cat-custom-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon || '📌',
      is_system: false,
      mission_type: newCatMissionType,
    };
    setCategories([...categories, newCat]);
    setFormCategory(newCat.category_id);
    setNewCatName('');
    setCategoryModalOpen(false);
    showToast(`✓ 새 카테고리 [${newCat.name}]가 등록되었습니다.`);
  };

  // 새 당번 등록
  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const catObj = categories.find((c) => c.category_id === formCategory);
    const assignedPerson = formParticipants.find((p) => p.role === 'ASSIGNEE') || formParticipants[0];

    const newDuty: MoaDuty = {
      duty_id: `duty-${Date.now()}`,
      ledger_id: 'led-1',
      category_id: formCategory,
      category_name: catObj?.name || '기타',
      mission_type: formMissionType,
      duty_title: formTitle,
      duty_description: formDesc,
      sub_category: formSubCategory,
      rotation_policy: formRotationPolicy,
      cycle_config: {
        cycle_type: formCycleType,
        days_of_week: formCycleDays,
        target_count_per_cycle: formTargetCount,
      },
      approval_policy: formApprovalPolicy,
      duration_type: formDurationType,
      completed_count: 0,
      can_substitute: formCanSubstitute,
      participants: formParticipants,
      current_assigned_participant_id: assignedPerson?.participant_id,
      current_assigned_name: assignedPerson?.name || '미배정',
      next_due_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      progress_status: 'ASSIGNED',
      settlement_status: 'UNSETTLED',
      evaluation_status: 'UNVERIFIED',
      assigned_name: assignedPerson?.name || '미배정',
      is_guest: assignedPerson?.is_guest || false,
      approval_required: formApprovalPolicy !== 'NO_APPROVAL',
      status: 'ASSIGNED',
      created_at: new Date().toISOString().slice(0, 10),
    };

    setDuties([newDuty, ...duties]);
    setCreateModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    showToast(`✓ [${newDuty.duty_title}] 당번이 성공적으로 등록되었습니다.`);
  };

  // 대신수행 요청 생성
  const handleOpenSubstituteModal = (duty: MoaDuty) => {
    setSelectedDutyForSub(duty);
    setSubTargetType('OPEN');
    setSubBenefitType('ALLOWANCE_MONEY');
    setSubAllowanceAmount(5000);
    setSubAutoCreateExpense(true);
    setSubstituteModalOpen(true);
  };

  const handleSubmitSubstitute = () => {
    if (!selectedDutyForSub) return;

    const subReq: DutySubstituteRequest = {
      request_id: `sub-${Date.now()}`,
      duty_id: selectedDutyForSub.duty_id,
      requester_id: selectedDutyForSub.current_assigned_participant_id || 'p-me',
      requester_name: selectedDutyForSub.current_assigned_name,
      target_type: subTargetType,
      target_user_name: subTargetType === 'SPECIFIC' ? subTargetPerson : '전체 구성원(선착순)',
      status: 'PENDING',
      benefit_type: subBenefitType,
      allowance_amount: subAllowanceAmount,
      auto_create_expense: subAutoCreateExpense,
      payment_link_url: subPaymentLink,
      memo: subMemo,
      created_at: '방금 전',
    };

    setDuties(
      duties.map((d) =>
        d.duty_id === selectedDutyForSub.duty_id
          ? {
              ...d,
              active_substitute_request: subReq,
            }
          : d
      )
    );

    setSubstituteModalOpen(false);
    showToast(
      `✓ [${selectedDutyForSub.duty_title}] 대신수행 요청이 등록되었습니다. ${
        subBenefitType === 'ALLOWANCE_MONEY'
          ? `(보상: ₩${subAllowanceAmount.toLocaleString()}원${subAutoCreateExpense ? ' / 가계부 자동연계' : ''})`
          : ''
      }`
    );
  };

  // 대신수행 수락
  const handleAcceptSubstitute = (duty: MoaDuty) => {
    if (!duty.active_substitute_request) return;

    const acceptorName = '구본영(호스트)';
    const amount = duty.active_substitute_request.allowance_amount || 0;
    const autoExpense = duty.active_substitute_request.auto_create_expense;

    setDuties(
      duties.map((d) => {
        if (d.duty_id === duty.duty_id) {
          return {
            ...d,
            current_assigned_name: `${acceptorName} (대신수행)`,
            active_substitute_request: {
              ...d.active_substitute_request!,
              status: 'ACCEPTED',
              accepted_by: acceptorName,
              accepted_at: '방금 전',
            },
          };
        }
        return d;
      })
    );

    showToast(
      `🎉 [${duty.duty_title}] 대신수행을 수락하였습니다! ${
        autoExpense && amount > 0
          ? `[가계부 지출 ₩${amount.toLocaleString()}원 자동 생성 예약됨]`
          : ''
      }`
    );
  };

  // 실적/인증 제출
  const handleOpenProofModal = (duty: MoaDuty) => {
    setSelectedDutyForProof(duty);
    setProofMemo('과업을 깨끗하게 완료했습니다!');
    setProofModalOpen(true);
  };

  const handleSubmitProof = () => {
    if (!selectedDutyForProof) return;

    const isAutoApprove = selectedDutyForProof.approval_policy === 'NO_APPROVAL' || selectedDutyForProof.approval_policy === 'SELF_CONFIRM';
    const reqApprovals = selectedDutyForProof.approval_policy === 'PEER_3_APPROVAL' ? 3 : 1;

    // 새 실행 로그 생성
    const newLog: DutyExecutionLog = {
      log_id: `log-${Date.now()}`,
      duty_id: selectedDutyForProof.duty_id,
      duty_title: selectedDutyForProof.duty_title,
      executed_by_name: selectedDutyForProof.current_assigned_name,
      is_substitute: !!selectedDutyForProof.active_substitute_request,
      substitute_for_name: selectedDutyForProof.active_substitute_request?.requester_name,
      proof_image_url: proofImg,
      memo: proofMemo,
      submitted_at: '방금 전',
      evaluation_status: isAutoApprove ? 'AUTO_APPROVED' : 'UNVERIFIED',
      approved_by_name: isAutoApprove ? '자동승인' : undefined,
      approvals_count: isAutoApprove ? reqApprovals : 1,
      approvals_required: reqApprovals,
      approved_by_list: ['구본영(호스트)'],
    };

    setLogs([newLog, ...logs]);

    // 순환 정책에 따른 다음 담당자 결정
    const nextPerson = calculateNextAssignee(
      selectedDutyForProof.rotation_policy,
      selectedDutyForProof.participants,
      selectedDutyForProof.current_assigned_participant_id
    );

    setDuties(
      duties.map((d) => {
        if (d.duty_id === selectedDutyForProof.duty_id) {
          return {
            ...d,
            completed_count: d.completed_count + 1,
            progress_status: isAutoApprove ? 'COMPLETED' : 'SUBMITTED',
            settlement_status: isAutoApprove ? 'SETTLED' : 'UNSETTLED',
            evaluation_status: isAutoApprove ? 'AUTO_APPROVED' : 'UNVERIFIED',
            current_assigned_name: nextPerson ? nextPerson.name : d.current_assigned_name,
            current_assigned_participant_id: nextPerson?.participant_id,
            active_substitute_request: undefined, // 요청 종료
            proof_image_url: proofImg,
          };
        }
        return d;
      })
    );

    setProofModalOpen(false);
    showToast(
      isAutoApprove
        ? `✓ 수행 완료 및 자동 승인되었습니다! (다음 순번: ${nextPerson?.name || '미정'})`
        : `✓ 인증 사진이 제출되었습니다. (승인 대기 중 / 다음 순번: ${nextPerson?.name || '미정'})`
    );
  };

  // 피어 승인 (타인 승인 버튼)
  const handleApproveLog = (logId: string) => {
    const currentUserName = '구본영(호스트)';
    setLogs(
      logs.map((log) => {
        if (log.log_id === logId) {
          const list = log.approved_by_list || [];
          if (list.includes(currentUserName)) {
            showToast('이미 승인 완료하신 내역입니다.');
            return log;
          }
          const nextCount = log.approvals_count + 1;
          const isComplete = nextCount >= log.approvals_required;
          return {
            ...log,
            approvals_count: nextCount,
            approved_by_list: [...list, currentUserName],
            evaluation_status: isComplete ? 'MANUAL_CONFIRMED' : 'UNVERIFIED',
            approved_by_name: isComplete ? `${nextCount}인 완료 승인` : log.approved_by_name,
          };
        }
        return log;
      })
    );
    showToast('✓ 당번 수행을 확인 승인하였습니다!');
  };

  // 초대 수락
  const handleAcceptInvite = (invitation: DutyInvitation) => {
    setInvitations(invitations.filter((inv) => inv.invitation_id !== invitation.invitation_id));

    // 새 당번으로 목록에 자동 추가
    const acceptedDuty: MoaDuty = {
      duty_id: `duty-inv-${Date.now()}`,
      ledger_id: 'led-1',
      category_id: 'cat-clean',
      category_name: invitation.category_name,
      mission_type: invitation.mission_type,
      duty_title: invitation.duty_title,
      duty_description: `초대 수락된 미션 (초대자: ${invitation.inviter_name})`,
      sub_category: '모임협업',
      rotation_policy: 'RANDOM',
      cycle_config: {
        cycle_type: 'WEEKLY',
        target_count_per_cycle: 1,
      },
      approval_policy: 'ADMIN_APPROVAL',
      duration_type: 'INDEFINITE',
      completed_count: 0,
      can_substitute: true,
      participants: [
        {
          participant_id: 'p-inviter',
          name: invitation.inviter_name,
          role: 'ASSIGNEE',
          is_guest: false,
          order_index: 0,
          invitation_status: 'ACCEPTED',
        },
        {
          participant_id: 'p-me',
          name: '구본영(나)',
          role: invitation.role,
          is_guest: false,
          order_index: 1,
          invitation_status: 'ACCEPTED',
        },
      ],
      current_assigned_name: invitation.inviter_name,
      progress_status: 'ASSIGNED',
      settlement_status: 'UNSETTLED',
      evaluation_status: 'UNVERIFIED',
      assigned_name: invitation.inviter_name,
      is_guest: false,
      approval_required: true,
      status: 'ASSIGNED',
      created_at: new Date().toISOString().slice(0, 10),
    };

    setDuties([acceptedDuty, ...duties]);
    showToast(`✓ [${invitation.duty_title}] 초대를 수락하여 당번 목록에 편입되었습니다!`);
  };

  // -------------------------------------------------------------
  // Filtered List
  // -------------------------------------------------------------
  const filteredDuties = duties.filter((d) => {
    // 탭 필터
    if (activeTab === 'MY' && !d.current_assigned_name.includes('구본영')) return false;
    if (activeTab === 'SUBSTITUTE' && !d.active_substitute_request) return false;

    // 미션 성격 필터
    if (selectedMissionTypeFilter !== 'ALL' && d.mission_type !== selectedMissionTypeFilter) return false;

    // 카테고리 필터
    if (selectedCategoryFilter !== 'ALL' && d.category_id !== selectedCategoryFilter) return false;

    // 검색어
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.duty_title.toLowerCase().includes(q);
      const matchAssignee = d.current_assigned_name.toLowerCase().includes(q);
      const matchCat = d.category_name.toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee && !matchCat) return false;
    }

    return true;
  });

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-12 space-y-5 transition-colors ${
        resolvedTheme === 'dawn'
          ? 'bg-[#0a1226] text-[#e0e8f8]'
          : isDark
          ? 'bg-[#0f1013] text-[#f4f4f6]'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-zinc-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header Standard (div1 Standard Model) */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                title="메인 대시보드로 돌아가기"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>모아당번 & 목표 라이프사이클</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                    SCR-DUT-01
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                당번(순환분담 협력) & 목표(개인성취 공유) · 직교 3상태머신 · 가계부 연동 대신수행
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => {
                const rep = generateDutyComprehensiveReport(duties, logs, settlements);
                setGeneratedReport(rep);
                setReportModalOpen(true);
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>종합 보고서 발행</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryModalOpen(true)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>카테고리 관리</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>새 당번·목표 등록</span>
            </button>
          </div>
        </div>

        {/* 1. 업무 정의 배너 (당번 vs 목표 가이드) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
                <Users className="w-4 h-4 text-purple-600" />
                <span>모아당번 (Duty / Chore)</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                여럿이 정기적 과업을 완수하여 결과를 함께 만드는 <strong>순환 책임 미션</strong>. 순환정책(랜덤/이름순/생년순/가중치), 직교 3상태머신, 보상형 대신수행 지원.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300 font-semibold border-t border-purple-100 dark:border-purple-900/40 mt-1">
              <span>8번 실시간 통계 & 9번 품앗이 정산</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60">
                SCR-DUT-01
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs space-y-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>모아목표 (Goal / Milestone)</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                개인의 목표를 완수하며 부수적으로 동료와 동행하거나 관람자에게 공개·응원받는 <strong>성취 지향 미션</strong>. 달성도 집계 및 피어 승인 지원.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900/40 mt-1">
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                동행원(수행) vs 관람원(응원)
              </span>
              {onNavigateToGoal ? (
                <button
                  type="button"
                  onClick={onNavigateToGoal}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span>모아목표 화면으로 이동</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] font-mono text-indigo-500">SCR-GOL-01</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Metrics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        {/* Tab Controls (Segmented Control - Buttons Allowed per Frontend Constitution) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800/70 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span>전체 당번</span>
            <span className="ml-1.5 text-[11px] font-mono opacity-70">({duties.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MY')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'MY'
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span>내 담당</span>
            <span className="ml-1.5 text-[11px] font-mono opacity-70">
              ({duties.filter((d) => d.current_assigned_name.includes('구본영')).length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STATS'
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
            <span>실시간 통계 & 랭킹</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
              8번
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUBSTITUTE')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SUBSTITUTE'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-rose-500" />
            <span>대신수행 & 정산</span>
            <span className="ml-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
              9번
            </span>
            <span className="ml-0.5 text-[11px] font-mono text-rose-600 font-black">
              ({duties.filter((d) => !!d.active_substitute_request).length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INVITATION')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'INVITATION'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span>초대함</span>
            {invitations.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                {invitations.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <span>실적·인증 이력</span>
            <span className="ml-1.5 text-[11px] font-mono opacity-70">({logs.length})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="당번명, 담당자, 카테고리 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Zero-Pill Discipline: Interactive Filter Buttons with clear active states) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>카테고리:</span>
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter('ALL')}
          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
          }`}
        >
          전체 보기
        </button>
        {categories.map((c) => (
          <button
            key={c.category_id}
            type="button"
            onClick={() => setSelectedCategoryFilter(c.category_id)}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              selectedCategoryFilter === c.category_id
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
            {!c.is_system && <span className="text-[10px] opacity-70">(사용자)</span>}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB CONTENT: STATS (8번 실시간 통계 차트 및 기여도 랭킹 뷰어) */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'STATS' && (() => {
        const statsData = calculateDutyStats(statsPeriod, duties, logs);
        const memberRanks = calculateMemberRanks(duties, logs);
        const kpis = calculateDutyKPIs(duties, logs);

        // Chart dimensions
        const chartWidth = 600;
        const chartHeight = 200;
        const padX = 50;
        const padY = 25;
        const usableWidth = chartWidth - padX * 2;
        const usableHeight = chartHeight - padY * 2;
        const stepX = statsData.length > 1 ? usableWidth / (statsData.length - 1) : usableWidth / 2;

        // Points for completion rate line
        const linePoints = statsData.map((d, idx) => {
          const x = padX + idx * stepX;
          const y = chartHeight - padY - (d.completion_rate / 100) * usableHeight;
          return { x, y, data: d };
        });
        const pointsString = linePoints.map((p) => `${p.x},${p.y}`).join(' ');

        // Target baseline Y (e.g. 80%)
        const targetBaselineY = chartHeight - padY - (statsConfig.targetRateThreshold / 100) * usableHeight;

        return (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>실시간 당번 완수율 통계 및 기여도 랭킹</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                      모아당번 8번
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  일별·주별·월별 실시간 완수 추이 및 품앗이 기여도 랭킹 뷰어
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {/* Period Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setStatsPeriod('DAILY')}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statsPeriod === 'DAILY'
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    일간 (7일)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsPeriod('WEEKLY')}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statsPeriod === 'WEEKLY'
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    주간 (6주)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsPeriod('MONTHLY')}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statsPeriod === 'MONTHLY'
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    월간 (5개월)
                  </button>
                </div>

                {/* Settings Button */}
                <button
                  type="button"
                  onClick={() => setStatsConfigModalOpen(true)}
                  className="min-h-[36px] px-3 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>통계 설정</span>
                </button>
              </div>
            </div>

            {/* 4 Key Performance Indicator (KPI) Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>종합 완수율</span>
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {kpis.overallRate}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{kpis.overallRate - statsConfig.targetRateThreshold}%p 초과
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, kpis.overallRate)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>총 완수 건수</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {kpis.totalCompleted}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">회 완수</span>
                </div>
                <p className="text-[11px] text-slate-400">피어 3인 및 자율 승인 완료</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>대신수행 품앗이</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {kpis.substituteCount}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">건 지원</span>
                </div>
                <p className="text-[11px] text-rose-500 font-semibold">상호 지원율 23% 기록</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>현재 연속 스트릭</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {kpis.currentStreak}일
                  </span>
                  <span className="text-xs text-amber-500 font-bold">연속 달성 🔥</span>
                </div>
                <p className="text-[11px] text-slate-400">모임 과업 무중단 지속 중</p>
              </div>
            </div>

            {/* Interactive SVG Chart Container */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {statsPeriod === 'DAILY' && '최근 7일 일별 완수율 추이'}
                      {statsPeriod === 'WEEKLY' && '최근 6주 주간 완수율 추이'}
                      {statsPeriod === 'MONTHLY' && '최근 5개월 월간 완수율 추이'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    보라색 막대(완수 건수) · 분홍색 포인트(대신수행) · 인디고 선(완수율 %)
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block" />
                    <span>완수 건수</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                    <span>대신수행</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-indigo-500 inline-block" />
                    <span>완수율(%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t border-dashed border-emerald-500 inline-block" />
                    <span>목표 기준({statsConfig.targetRateThreshold}%)</span>
                  </div>
                </div>
              </div>

              {/* SVG Responsive Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 sm:h-64 select-none"
                >
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0, 25, 50, 75, 100].map((rate) => {
                    const y = chartHeight - padY - (rate / 100) * usableHeight;
                    return (
                      <g key={rate}>
                        <line
                          x1={padX}
                          y1={y}
                          x2={chartWidth - padX}
                          y2={y}
                          stroke="currentColor"
                          className="text-slate-200 dark:text-zinc-800"
                          strokeWidth="1"
                          strokeDasharray={rate === 0 ? 'none' : '3,3'}
                        />
                        <text
                          x={padX - 8}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] fill-slate-400 font-mono"
                        >
                          {rate}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Target Rate Baseline (e.g. 80%) */}
                  <line
                    x1={padX}
                    y1={targetBaselineY}
                    x2={chartWidth - padX}
                    y2={targetBaselineY}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={chartWidth - padX}
                    y={targetBaselineY - 4}
                    textAnchor="end"
                    fill="#10b981"
                    className="text-[9px] font-bold"
                  >
                    목표 {statsConfig.targetRateThreshold}%
                  </text>

                  {/* Bars & Interactive Columns */}
                  {statsData.map((d, idx) => {
                    const x = padX + idx * stepX;
                    const maxVal = Math.max(...statsData.map((item) => item.total_scheduled || 1), 5);
                    const barW = Math.min(28, usableWidth / statsData.length - 8);
                    const schedH = (d.total_scheduled / maxVal) * (usableHeight * 0.7);
                    const compH = (d.completed_count / maxVal) * (usableHeight * 0.7);
                    const subH = (d.substitute_count / maxVal) * (usableHeight * 0.7);
                    const barY = chartHeight - padY;

                    const isHovered = hoveredDataPoint?.label === d.label;

                    return (
                      <g
                        key={d.label}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredDataPoint(d)}
                        onClick={() => setHoveredDataPoint(d)}
                      >
                        {/* Background Bar (Total Scheduled) */}
                        <rect
                          x={x - barW / 2}
                          y={barY - schedH}
                          width={barW}
                          height={schedH}
                          rx={4}
                          className="fill-slate-100 dark:fill-zinc-800 group-hover:fill-slate-200 dark:group-hover:fill-zinc-700 transition-colors"
                        />

                        {/* Completed Bar */}
                        <rect
                          x={x - barW / 2}
                          y={barY - compH}
                          width={barW}
                          height={compH}
                          rx={4}
                          fill="url(#purpleGrad)"
                          className="transition-all duration-300"
                        />

                        {/* Substitute Bar Top Segment */}
                        {d.substitute_count > 0 && (
                          <rect
                            x={x - barW / 2}
                            y={barY - compH}
                            width={barW}
                            height={Math.min(compH, subH)}
                            rx={4}
                            fill="url(#roseGrad)"
                          />
                        )}

                        {/* X-axis Label */}
                        <text
                          x={x}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className={`text-[10px] font-semibold transition-colors ${
                            isHovered
                              ? 'fill-purple-600 dark:fill-purple-400 font-bold'
                              : 'fill-slate-500 dark:fill-zinc-400'
                          }`}
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Completion Rate Trend Polyline */}
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />

                  {/* Trend Data Dots */}
                  {linePoints.map((p, idx) => {
                    const isHovered = hoveredDataPoint?.label === p.data.label;
                    return (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6 : 4}
                          className={`transition-all ${
                            isHovered
                              ? 'fill-white stroke-purple-600 stroke-[3]'
                              : 'fill-indigo-600 stroke-white dark:stroke-zinc-900 stroke-[2]'
                          }`}
                        />
                        <text
                          x={p.x}
                          y={p.y - 8}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-indigo-600 dark:fill-indigo-300"
                        >
                          {p.data.completion_rate}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Active / Hovered Tooltip Card */}
              {hoveredDataPoint && (
                <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-900 dark:text-purple-200">
                      [{hoveredDataPoint.label}] 상세 실적:
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      총 배정 {hoveredDataPoint.total_scheduled}회 중{' '}
                      <strong className="text-purple-600 dark:text-purple-400">
                        {hoveredDataPoint.completed_count}회 완수
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-rose-600 font-semibold">
                      🤝 대신수행: {hoveredDataPoint.substitute_count}건
                    </span>
                    <span className="text-slate-500">
                      미완수: {hoveredDataPoint.uncompleted_count}건
                    </span>
                    <span className="font-mono font-black text-purple-700 dark:text-purple-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      완수율: {hoveredDataPoint.completion_rate}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 구성원별 기여도 랭킹 뷰어 (Member Contribution & Ranking Viewer) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>구성원별 당번 완수 및 품앗이 기여도 랭킹</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                        Top Ranking
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      산정 공식: 완수(10점) + 대신수행 기여(15점) - 대신수행 요청(5점)
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  클릭 시 구성원 상세 활동 로그 확인
                </span>
              </div>

              {/* Ranking Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {memberRanks.map((member) => {
                  const isTop1 = member.rank === 1;
                  const isTop2 = member.rank === 2;
                  const isTop3 = member.rank === 3;

                  return (
                    <div
                      key={member.participant_id}
                      onClick={() => setSelectedRankMember(member)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between space-y-3 ${
                        isTop1
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-400/30'
                          : isTop2
                          ? 'border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40'
                          : isTop3
                          ? 'border-amber-700/30 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Member Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-sm">
                                {member.name.slice(0, 2)}
                              </div>
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                {member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : member.rank === 3 ? '🥉' : member.rank}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {member.name}
                                </h5>
                                {member.is_guest && (
                                  <span className="text-[10px] px-1 rounded-sm bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                                    게스트
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                                <Flame className="w-3 h-3" />
                                <span>{member.streak_days}일 연속 완수</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                              {member.score} pts
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {member.rank === 1 ? 'MVP 호스트' : `${member.rank}위 달성`}
                            </div>
                          </div>
                        </div>

                        {/* Completion Rate Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>완수율</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">
                              {member.completion_rate}% ({member.completed_count}회 완수)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all"
                              style={{ width: `${member.completion_rate}%` }}
                            />
                          </div>
                        </div>

                        {/* Substitute Details (Who helped Whom) */}
                        <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-zinc-800/60 text-[11px] text-slate-600 dark:text-zinc-300 flex items-center justify-between">
                          <span className="text-slate-500">품앗이 기여:</span>
                          <span className="font-medium">
                            <strong className="text-emerald-600">🤝 도움 {member.help_given_count}회</strong>
                            <span className="mx-1 text-slate-300">|</span>
                            <strong className="text-rose-500">🙋 도움받음 {member.help_received_count}회</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>활동 로그 확인</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------- */}
      {/* TAB CONTENT: INVITATION (초대 대기 목록 조회 & 즉시 수락) */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'INVITATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>수신된 당번·목표 초대 목록</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                (수락 시 내 당번 목록으로 편입)
              </span>
            </h3>
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 text-center text-xs text-slate-500 space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-slate-400" />
              <p className="font-semibold">대기 중인 초대가 없습니다.</p>
              <p className="text-[11px] text-slate-400">초대 링크를 전달받으면 이곳에 실시간 노출됩니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv.invitation_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                        <span>{inv.category_name}</span>
                        <span>·</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {inv.mission_type === 'DUTY' ? '모아당번' : '모아목표'}
                        </span>
                        <span>·</span>
                        <span>역할: {inv.role === 'ASSIGNEE' ? '참가자(수행)' : '관람자(응원)'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {inv.duty_title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold border border-amber-200 dark:border-amber-800">
                      초대 대기
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs space-y-1 text-slate-600 dark:text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">초대한 사람:</span>
                      <span className="font-semibold">{inv.inviter_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">주기 규칙:</span>
                      <span>{inv.cycle_label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">초대 시각:</span>
                      <span className="font-mono text-[11px]">{inv.invited_at}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAcceptInvite(inv)}
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>초대 수락 및 당번 편입</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInvitations(invitations.filter((i) => i.invitation_id !== inv.invitation_id));
                        showToast('초대를 거절하였습니다.');
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB CONTENT: LOGS (수행 실적 및 피어 3인 이상 완료 승인) */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>실적 인증 및 완료 승인 감사 로그</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                (타인 3인 이상 승인 정책 지원)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logs.map((log) => {
              const hasApproved = (log.approved_by_list || []).includes('구본영(호스트)');
              const isConfirmed = log.evaluation_status === 'MANUAL_CONFIRMED' || log.evaluation_status === 'AUTO_APPROVED';

              return (
                <div
                  key={log.log_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {log.duty_title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        수행자: <strong>{log.executed_by_name}</strong>
                        {log.is_substitute && (
                          <span className="text-rose-600 dark:text-rose-400 ml-1 font-semibold">
                            (대신수행 for {log.substitute_for_name})
                          </span>
                        )}
                        <span className="mx-1.5">·</span>
                        <span className="font-mono text-[11px]">{log.submitted_at}</span>
                      </p>
                    </div>

                    <div>
                      {isConfirmed ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-mono border border-emerald-200 dark:border-emerald-800">
                          {log.approved_by_name || '완료 승인'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-mono border border-amber-200 dark:border-amber-800">
                          승인 대기 ({log.approvals_count}/{log.approvals_required})
                        </span>
                      )}
                    </div>
                  </div>

                  {log.proof_image_url && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 max-h-48">
                      <img
                        src={log.proof_image_url}
                        alt="인증"
                        className="w-full h-44 object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {log.memo && (
                    <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300">
                      "{log.memo}"
                    </p>
                  )}

                  {/* 승인 진행률 및 승인 버튼 */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500">
                      승인 참여: {(log.approved_by_list || []).join(', ') || '없음'}
                    </div>

                    {!isConfirmed ? (
                      <button
                        type="button"
                        onClick={() => handleApproveLog(log.log_id)}
                        disabled={hasApproved}
                        className={`min-h-[36px] px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          hasApproved
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{hasApproved ? '승인 완료' : '확인 승인하기'}</span>
                      </button>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>검증 완료</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MAIN LIST: ALL / MY / SUBSTITUTE (당번 카드 그리드 & 직교 3상태머신) */}
      {/* ------------------------------------------------------------------- */}
      {(activeTab === 'ALL' || activeTab === 'MY' || activeTab === 'SUBSTITUTE') && (
        <div className="space-y-4">
          {/* --------------------------------------------------------------- */}
          {/* 모아당번 9번: 대신수행 품앗이 정산 내역서 & 1:1 상계(Netting) 대사표 */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'SUBSTITUTE' && (() => {
            const nettingPairs = calculateSubstituteNetting(settlements);
            const unsettledCount = settlements.filter((s) => s.settlement_status === 'UNSETTLED').length;
            const totalUnsettledMoney = settlements
              .filter((s) => s.settlement_status === 'UNSETTLED')
              .reduce((sum, s) => sum + s.amount, 0);

            // Handler to settle a pair
            const handleSettlePair = (pair: SubstituteNettingPair) => {
              setSettlements((prev) =>
                prev.map((item) => {
                  if (item.requester_name === pair.from_name && item.substitute_name === pair.to_name) {
                    return {
                      ...item,
                      settlement_status: 'SETTLED',
                      settled_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    };
                  }
                  return item;
                })
              );
              showToast(`✓ [${pair.from_name} ➔ ${pair.to_name}] ${pair.netted_amount.toLocaleString()}원 품앗이 정산이 완료되었습니다.`);
            };

            // Handler to record personal ledger expense
            const handleAutoRecordExpense = (pair: SubstituteNettingPair) => {
              showToast(`✓ 개인 가계부에 [대신수행보상] 지출 ${pair.netted_amount.toLocaleString()}원이 자동 기록되었습니다. (금전관리 3대 원칙: 단일 귀속성 및 메타 태깅 분리)`);
            };

            return (
              <div className="space-y-4 mb-6">
                {/* Header Banner */}
                <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Handshake className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>대신수행 품앗이 정산 내역서 (Who pays Whom)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                          모아당번 9번
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      상호 간 품앗이 1:1 맞교환 자동 상계(Netting) 대사표 · 개인 가계부 지출 자동연동 (금전관리 3대 원칙)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const rep = generateDutyComprehensiveReport(duties, logs, settlements);
                      setGeneratedReport(rep);
                      setReportModalOpen(true);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>종합 보고서 발행</span>
                  </button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                    <span className="text-xs text-slate-500">총 대신수행 이력</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{settlements.length}</span>
                      <span className="text-xs text-slate-500">건 발생</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                    <span className="text-xs text-rose-500 font-semibold">미정산 송금 대기</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                        {totalUnsettledMoney.toLocaleString()}원
                      </span>
                      <span className="text-xs text-rose-500 font-bold">({unsettledCount}건)</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-1">
                    <span className="text-xs text-slate-500">상호 1:1 맞교환 상계</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {nettingPairs.filter((p) => p.is_cleared).length}쌍
                      </span>
                      <span className="text-xs text-slate-500">완전 상계됨</span>
                    </div>
                  </div>
                </div>

                {/* 1:1 상계 정산 매트릭스 카드 리스트 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                    <span>누가 누구에게 얼마를 정산해야 하는지 (상계 대사 결과)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {nettingPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          pair.is_cleared
                            ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* From -> To */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {pair.from_name}
                              </span>
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">
                                {pair.to_name}
                              </span>
                            </div>

                            {pair.is_cleared ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>완전 상계 (0원)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                                송금 대기
                              </span>
                            )}
                          </div>

                          {/* Calculation details */}
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-xs space-y-1">
                            <div className="flex justify-between text-slate-500">
                              <span>총 채무 합계:</span>
                              <span>{pair.gross_amount.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700 font-bold">
                              <span className="text-slate-700 dark:text-zinc-200">상계 후 최종 정산액:</span>
                              <span className={`font-mono text-sm ${pair.is_cleared ? 'text-emerald-600' : 'text-rose-600 dark:text-rose-400'}`}>
                                {pair.netted_amount.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {!pair.is_cleared && (
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-1.5">
                              {pair.payment_link_url && (
                                <a
                                  href={pair.payment_link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                >
                                  <span>카카오페이 송금</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAutoRecordExpense(pair)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-700 dark:text-zinc-300 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                가계부 지출 연계
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSettlePair(pair)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>정산 완료 처리</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 개별 건별 대사표 (Detail Ledger) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-3">
                  <h5 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>개별 대신수행 발생 및 정산 상세 내역 ({settlements.length}건)</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      개인 가계부 배타적 귀속 원칙 준수
                    </span>
                  </h5>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {settlements.map((item) => (
                      <div
                        key={item.settlement_id}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between text-xs gap-2 flex-wrap"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.duty_title}
                            </span>
                            <span className="text-[10px] px-1 rounded-sm bg-purple-50 dark:bg-purple-950/60 text-purple-600 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            요청: <strong>{item.requester_name}</strong> ➔ 수행: <strong>{item.substitute_name}</strong>
                            {item.memo && ` · ${item.memo}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {item.amount.toLocaleString()}원
                          </span>
                          {item.settlement_status === 'SETTLED' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              정산완료 ({item.settled_at?.slice(5, 10)})
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSettlements((prev) =>
                                  prev.map((s) =>
                                    s.settlement_id === item.settlement_id
                                      ? {
                                          ...s,
                                          settlement_status: 'SETTLED',
                                          settled_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                                        }
                                      : s
                                  )
                                );
                                showToast(`✓ [${item.duty_title}] ${item.amount.toLocaleString()}원 정산이 완료되었습니다.`);
                              }}
                              className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              정산하기
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              총 <strong>{filteredDuties.length}</strong>개의 미션 과업
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">미션 구분:</span>
              <select
                value={selectedMissionTypeFilter}
                onChange={(e) => setSelectedMissionTypeFilter(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              >
                <option value="ALL">전체 (당번 & 목표)</option>
                <option value="DUTY">모아당번만</option>
                <option value="GOAL">모아목표만</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDuties.map((duty) => {
              const isMyTurn = duty.current_assigned_name.includes('구본영');
              const hasSubRequest = !!duty.active_substitute_request;

              return (
                <div
                  key={duty.duty_id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                    isMyTurn
                      ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/15 shadow-sm ring-1 ring-purple-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header: Title & Mission Type */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {duty.mission_type === 'DUTY' ? '🧹 모아당번' : '🎯 모아목표'}
                          </span>
                          <span>·</span>
                          <span>{duty.category_name}</span>
                          <span>·</span>
                          <span>{duty.sub_category}</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-snug">
                          {duty.duty_title}
                        </h3>
                      </div>

                      {/* 상태 뱃지 (Anti-AI slop: clean unboxed styling) */}
                      <div className="text-right shrink-0">
                        {duty.progress_status === 'COMPLETED' ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            완료됨
                          </span>
                        ) : duty.progress_status === 'SUBMITTED' ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            인증 검증중
                          </span>
                        ) : isMyTurn ? (
                          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 animate-pulse">
                            내 순번!
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            진행중
                          </span>
                        )}
                      </div>
                    </div>

                    {duty.duty_description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {duty.duty_description}
                      </p>
                    )}

                    {/* Metadata Specs (Clean typographic layout) */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-xs space-y-1.5 text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">현재 담당 순번:</span>
                        <span className={`font-bold ${isMyTurn ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-zinc-100'}`}>
                          {duty.current_assigned_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">순환 정책:</span>
                        <span className="font-medium">
                          {duty.rotation_policy === 'RANDOM' && '랜덤 추첨'}
                          {duty.rotation_policy === 'NAME_ASC' && '가나다 이름순'}
                          {duty.rotation_policy === 'BIRTH_DATE' && '생년월일순'}
                          {duty.rotation_policy === 'AGE_WEIGHTED' && '가중치 순환'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">주기 / 예정일:</span>
                        <span className="font-mono text-[11px]">
                          {duty.cycle_config.cycle_type === 'DAILY' && '매일'}
                          {duty.cycle_config.cycle_type === 'WEEKLY' && '매주'}
                          {duty.cycle_config.cycle_type === 'BIWEEKLY' && '격주'}
                          {duty.cycle_config.cycle_type === 'MONTHLY' && '매월'}
                          {duty.next_due_date ? ` (${duty.next_due_date})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">완료 승인 방식:</span>
                        <span className="font-medium text-[11px]">
                          {duty.approval_policy === 'ADMIN_APPROVAL' && '관리자 최종 승인'}
                          {duty.approval_policy === 'PEER_3_APPROVAL' && '타인 3인 이상 확인'}
                          {duty.approval_policy === 'SELF_CONFIRM' && '본인 확인 즉시 완료'}
                          {duty.approval_policy === 'NO_APPROVAL' && '승인 생략 (즉시인정)'}
                        </span>
                      </div>
                    </div>

                    {/* 2. 대신수행 요청 활성 상태 카드 */}
                    {hasSubRequest && (
                      <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>대신수행 요청 중</span>
                          </span>
                          <span className="text-[10px] font-mono text-rose-600 bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.5 rounded-sm">
                            {duty.active_substitute_request?.target_type === 'OPEN' ? '선착순 공개' : '특정인 지정'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                          요청자: <strong>{duty.active_substitute_request?.requester_name}</strong>
                          <br />
                          메모: "{duty.active_substitute_request?.memo}"
                        </p>

                        {duty.active_substitute_request?.benefit_type === 'ALLOWANCE_MONEY' && (
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-800 text-[11px] flex items-center justify-between">
                            <span className="text-slate-500">완수 보상 (용돈):</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                              ₩{duty.active_substitute_request.allowance_amount?.toLocaleString()}원
                              {duty.active_substitute_request.auto_create_expense && ' (가계부 자동연계)'}
                            </span>
                          </div>
                        )}

                        {/* 대신수행 수락 버튼 (다른 사람이 수락 가능) */}
                        {duty.active_substitute_request?.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleAcceptSubstitute(duty)}
                            className="w-full min-h-[38px] py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>내가 대신 수행하기 (보상 수령)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 참가자 아바타 바 & 초대 링크 공유 버튼 */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>참가자 {duty.participants.filter((p) => p.role === 'ASSIGNEE').length}명</span>
                        <span>·</span>
                        <span>관람자 {duty.participants.filter((p) => p.role === 'VIEWER').length}명</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedInviteLink(`https://moabogo.app/duty/invite/${duty.duty_id}`);
                          setInviteLinkModalOpen(true);
                        }}
                        className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>초대링크</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProofModal(duty)}
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>수행 인증 제출</span>
                    </button>

                    {duty.can_substitute && !hasSubRequest && (
                      <button
                        type="button"
                        onClick={() => handleOpenSubstituteModal(duty)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        title="대신수행 요청"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>대신요청</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: 새 당번·목표 등록 모달 */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="새 당번 또는 목표 등록"
      >
        <form onSubmit={handleCreateDuty} className="space-y-4 text-xs">
          {/* 미션 성격 선택 */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              미션 성격 구분
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormMissionType('DUTY')}
                className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formMissionType === 'DUTY'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>모아당번 (협력·순환)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">여럿이 역할을 번갈아 완수</p>
              </button>
              <button
                type="button"
                onClick={() => setFormMissionType('GOAL')}
                className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formMissionType === 'GOAL'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>모아목표 (개인성취·공유)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">나의 목표를 관람자에게 공개</p>
              </button>
            </div>
          </div>

          <ElmInp01
            label="당번 / 목표 명칭"
            value={formTitle}
            onChange={setFormTitle}
            placeholder="예: 거실 청소기 및 물걸레 밀기, 주3회 헬스장"
          />

          <ElmInp01
            label="상세 설명 / 완수 기준"
            value={formDesc}
            onChange={setFormDesc}
            placeholder="예: 바닥 먼지 흡입 후 물걸레 빨아서 꼼꼼히 닦기"
          />

          {/* 카테고리 및 세부분류 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
                카테고리 (사용자 관리 가능)
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.icon} {c.name} {!c.is_system ? '(사용자)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
                시스템 세부분류
              </label>
              <select
                value={formSubCategory}
                onChange={(e) => setFormSubCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="청소">실내 청소</option>
                <option value="설거지">주방 / 설거지</option>
                <option value="분리수거">재활용 / 분리수거</option>
                <option value="회계">가계부 / 장부정리</option>
                <option value="돌봄">화분 / 반려동물</option>
                <option value="학습">운동 / 독서</option>
              </select>
            </div>
          </div>

          {/* 순환 정책 & 주기 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
                순환 정책 (배정 규칙)
              </label>
              <select
                value={formRotationPolicy}
                onChange={(e) => setFormRotationPolicy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="RANDOM">랜덤 무작위 추첨</option>
                <option value="NAME_ASC">가나다 이름순</option>
                <option value="BIRTH_DATE">생년월일순</option>
                <option value="AGE_WEIGHTED">나이/기여도 가중치순</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
                주기 (반복 기준)
              </label>
              <select
                value={formCycleType}
                onChange={(e) => setFormCycleType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="DAILY">매일 (Daily)</option>
                <option value="WEEKLY">매주 (Weekly)</option>
                <option value="BIWEEKLY">격주 (Biweekly)</option>
                <option value="MONTHLY">매월 (Monthly)</option>
              </select>
            </div>
          </div>

          {/* 승인 정책 */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              완료 승인 정책 (검증 방식)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormApprovalPolicy('PEER_3_APPROVAL')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  formApprovalPolicy === 'PEER_3_APPROVAL'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>타인 3인 이상 완료 확인</span>
                <span className="block text-[10px] text-slate-400">다자간 상호 검증</span>
              </button>
              <button
                type="button"
                onClick={() => setFormApprovalPolicy('ADMIN_APPROVAL')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  formApprovalPolicy === 'ADMIN_APPROVAL'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>관리자(호스트) 단독 승인</span>
                <span className="block text-[10px] text-slate-400">방장 최종 확인 필수</span>
              </button>
              <button
                type="button"
                onClick={() => setFormApprovalPolicy('SELF_CONFIRM')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  formApprovalPolicy === 'SELF_CONFIRM'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>본인 확인 즉시 승인</span>
                <span className="block text-[10px] text-slate-400">사진 등록 시 본인 승인</span>
              </button>
              <button
                type="button"
                onClick={() => setFormApprovalPolicy('NO_APPROVAL')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  formApprovalPolicy === 'NO_APPROVAL'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>승인 생략 (제출 즉시 완료)</span>
                <span className="block text-[10px] text-slate-400">자율 완수 인정</span>
              </button>
            </div>
          </div>

          {/* 대신수행 허용 스위치 */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-zinc-200">대신수행 허용</span>
              <p className="text-[11px] text-slate-400">사정이 있을 때 타인에게 보상 위임 요청 가능</p>
            </div>
            <ElmSwt01
              checked={formCanSubstitute}
              onChange={setFormCanSubstitute}
              label=""
            />
          </div>

          {/* 초기 참가자 목록 */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              참가자 구성 ({formParticipants.length}명)
            </label>
            <div className="space-y-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/30">
              {formParticipants.map((p, idx) => (
                <div key={p.participant_id} className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    {idx + 1}. {p.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                      {p.role === 'ASSIGNEE' ? '참가자(순환)' : '관람자'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 font-semibold cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm cursor-pointer"
            >
              등록 완료
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: 카테고리 관리 모달 */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="당번 & 목표 카테고리 관리"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            시스템 기본 카테고리와 사용자가 직접 등록한 카테고리를 함께 관리합니다.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((c) => (
              <div
                key={c.category_id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{c.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 font-mono">
                  {c.is_system ? '시스템 기본' : '사용자 정의'}
                </span>
              </div>
            ))}
          </div>

          {/* 새 카테고리 추가 폼 */}
          <div className="p-3 rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 space-y-2">
            <span className="font-bold text-purple-900 dark:text-purple-300">새 카테고리 추가</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="아이콘 (예: 🧹)"
                className="w-16 p-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-center"
              />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="카테고리명 (예: 캠핑 장비 정비)"
                className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shrink-0"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: 대신수행 요청 모달 (가계부 빠른머니/지출 연계 포함!) */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
        title="대신수행 요청 및 보상 설정"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-200">
            <span className="text-slate-400">대상 과업:</span>{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {selectedDutyForSub?.duty_title}
            </strong>
          </div>

          {/* 요청 대상: 특정인 vs 선착순 공개 */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              위임 요청 방식
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubTargetType('OPEN')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                  subTargetType === 'OPEN'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>전체 공개 (선착순 수락)</span>
                <span className="block text-[10px] text-slate-400">모든 구성원이 수락 가능</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTargetType('SPECIFIC')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                  subTargetType === 'SPECIFIC'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>특정인 지명 요청</span>
                <span className="block text-[10px] text-slate-400">지정한 대상자에게 알림</span>
              </button>
            </div>
          </div>

          {subTargetType === 'SPECIFIC' && (
            <ElmInp01
              label="지명할 구성원 이름"
              value={subTargetPerson}
              onChange={setSubTargetPerson}
              placeholder="예: 이지은(배우자)"
            />
          )}

          {/* 보상 베네핏 설정 */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              대신수행 보상 (베네핏) 설정
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubBenefitType('ALLOWANCE_MONEY')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                  subBenefitType === 'ALLOWANCE_MONEY'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>용돈 / 머니 지급</span>
                <span className="block text-[10px] text-slate-400">가계부 빠른머니 자동 연계</span>
              </button>
              <button
                type="button"
                onClick={() => setSubBenefitType('SUBSTITUTE_COUPON')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                  subBenefitType === 'SUBSTITUTE_COUPON'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>대신수행 품앗이 티켓</span>
                <span className="block text-[10px] text-slate-400">다음에 내가 1회 대신 수행</span>
              </button>
            </div>
          </div>

          {subBenefitType === 'ALLOWANCE_MONEY' && (
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 dark:text-purple-300">보상 금액 (원)</span>
                <div className="flex items-center gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setSubAllowanceAmount(Math.max(1000, subAllowanceAmount - 1000))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border text-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-black px-2">₩{subAllowanceAmount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setSubAllowanceAmount(subAllowanceAmount + 1000)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border text-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 가계부 지출 자동 생성 옵션 */}
              <div className="flex items-center justify-between pt-1 border-t border-purple-200 dark:border-purple-800">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">가계부 지출 거래 자동 생성</span>
                  <p className="text-[10px] text-slate-500">대신수행 완료 시 내 개인 가계부에 자동 기록</p>
                </div>
                <ElmSwt01
                  checked={subAutoCreateExpense}
                  onChange={setSubAutoCreateExpense}
                  label=""
                />
              </div>

              <ElmInp01
                label="간편 송금 링크 URL (카카오페이 / 토스)"
                value={subPaymentLink}
                onChange={setSubPaymentLink}
                placeholder="https://qr.kakaopay.com/..."
              />
            </div>
          )}

          <ElmInp01
            label="요청 사유 / 메모"
            value={subMemo}
            onChange={setSubMemo}
            placeholder="예: 시험 기간으로 바빠서 부탁드려요! 간식도 사드릴게요."
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubstituteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmitSubstitute}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
            >
              대신수행 요청 등록
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 4: 수행 인증 및 실적 제출 모달 */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="당번 수행 및 사진 인증 제출"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 space-y-1">
            <div>
              <span className="text-slate-400">과업:</span>{' '}
              <strong className="text-slate-900 dark:text-white font-bold">
                {selectedDutyForProof?.duty_title}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">승인 규칙:</span>{' '}
              <span>
                {selectedDutyForProof?.approval_policy === 'PEER_3_APPROVAL' && '타인 3인 이상 확인 시 자동 완결'}
                {selectedDutyForProof?.approval_policy === 'ADMIN_APPROVAL' && '관리자 최종 승인 필수'}
                {selectedDutyForProof?.approval_policy === 'SELF_CONFIRM' && '본인 확인 즉시 완료'}
                {selectedDutyForProof?.approval_policy === 'NO_APPROVAL' && '승인 생략 (즉시 완결)'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-200 mb-1">
              인증 사진 첨부
            </label>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
              <img src={proofImg} alt="인증" className="w-full h-40 object-cover" />
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setProofImg(
                      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold"
                >
                  사진 교체
                </button>
              </div>
            </div>
          </div>

          <ElmInp01
            label="수행 메모"
            value={proofMemo}
            onChange={setProofMemo}
            placeholder="완료 상태를 간단히 기록해주세요."
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProofModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmitProof}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
            >
              실적 제출 완료
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 5: 초대 링크 생성 및 복사 모달 */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={inviteLinkModalOpen}
        onClose={() => setInviteLinkModalOpen(false)}
        title="당번·목표 참여 초대링크 공유"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            초대 링크를 전달받은 사람은 회원가입 또는 게스트 접속을 통해 당번 미션에 참가할 수 있습니다.
          </p>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between gap-2">
            <span className="font-mono text-purple-600 dark:text-purple-400 truncate">
              {generatedInviteLink}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(generatedInviteLink);
                showToast('✓ 초대 링크가 클립보드에 복사되었습니다.');
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>복사</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>게스트 소멸성(Transient) 원칙 준수</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              미가입 게스트는 임시 식별자로 참여하며, 추후 정식 회원가입 시 본인 동의를 통해 계정에 영구 매핑됩니다.
            </p>
          </div>
        </div>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 6: 구성원 상세 활동 로그 확인 모달 (Rank Member Drill-down) */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={!!selectedRankMember}
        onClose={() => setSelectedRankMember(null)}
        title={selectedRankMember ? `[${selectedRankMember.name}] 당번 및 품앗이 활동 이력` : '활동 이력'}
      >
        {selectedRankMember && (() => {
          const memberLogs = logs.filter(
            (l) =>
              l.executed_by_name === selectedRankMember.name ||
              l.substitute_for_name === selectedRankMember.name
          );

          return (
            <div className="space-y-4 text-xs">
              {/* Member Summary Header */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {selectedRankMember.rank === 1 ? '🥇' : selectedRankMember.rank === 2 ? '🥈' : selectedRankMember.rank === 3 ? '🥉' : '🎖️'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedRankMember.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      종합 기여 {selectedRankMember.score}점 · {selectedRankMember.streak_days}일 연속 완수
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                    완수율 {selectedRankMember.completion_rate}%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold border border-emerald-200 dark:border-emerald-800">
                    🤝 도움 {selectedRankMember.help_given_count}회
                  </span>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                <h5 className="font-bold text-slate-700 dark:text-zinc-300">
                  최근 수행 및 품앗이 기록 ({memberLogs.length}건)
                </h5>

                {memberLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                    아직 등록된 활동 로그가 없습니다.
                  </div>
                ) : (
                  memberLogs.map((log) => {
                    const isHelper = log.executed_by_name === selectedRankMember.name && log.is_substitute;
                    const isHelped = log.substitute_for_name === selectedRankMember.name;

                    return (
                      <div
                        key={log.log_id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {log.duty_title}
                              </span>
                              {isHelper && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-bold border border-rose-200 dark:border-rose-800">
                                  🤝 대신수행 도움제공
                                </span>
                              )}
                              {isHelped && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 font-bold border border-amber-200 dark:border-amber-800">
                                  🙋 대신수행 도움받음
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              수행일시: {log.submitted_at} · 수행자: {log.executed_by_name}
                              {log.substitute_for_name && ` (원담당: ${log.substitute_for_name})`}
                            </p>
                          </div>

                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>승인완료</span>
                          </span>
                        </div>

                        {log.memo && (
                          <p className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300">
                            "{log.memo}"
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRankMember(null)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          );
        })()}
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 7: 당번 통계 및 시스템 설정 모달 (Stats Settings Modal) */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={statsConfigModalOpen}
        onClose={() => setStatsConfigModalOpen(false)}
        title="모아당번 실시간 통계 및 시스템 설정"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            통계 집계 주기 및 목표 완수율 기준선을 개인과 모임의 운영 규칙에 맞게 설정할 수 있습니다.
          </p>

          {/* Setting 1: Week starts on */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block">
              주간 통계 집계 시작 요일
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatsConfig({ ...statsConfig, weekStartsOn: 'MON' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  statsConfig.weekStartsOn === 'MON'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>월요일 시작 (표준)</span>
                {statsConfig.weekStartsOn === 'MON' && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>
              <button
                type="button"
                onClick={() => setStatsConfig({ ...statsConfig, weekStartsOn: 'SUN' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  statsConfig.weekStartsOn === 'SUN'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>일요일 시작</span>
                {statsConfig.weekStartsOn === 'SUN' && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>
            </div>
          </div>

          {/* Setting 2: Target threshold rate */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200">
                목표 완수율 기준선 (차트 기준선 반영)
              </label>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {statsConfig.targetRateThreshold}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[70, 80, 90].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setStatsConfig({ ...statsConfig, targetRateThreshold: rate })}
                  className={`py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    statsConfig.targetRateThreshold === rate
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {rate}% {rate === 80 ? '(권장)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Streak Notification */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800 dark:text-zinc-200">
                연속 달성 스트릭(Streak) 리마인드
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                과업 미완수 위험 시 연속 기록 유지를 위한 알림 발송
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatsConfig({ ...statsConfig, notifyStreak: !statsConfig.notifyStreak })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                statsConfig.notifyStreak ? 'bg-purple-600' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  statsConfig.notifyStreak ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Zero-Hang Engine Info */}
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>실시간 동적 연산 (Zero-Hang Engine)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              모든 일/주/월별 통계 및 기여도 랭킹은 별도의 대기 시간 없이 클라이언트 메모리에서 실시간으로 정밀 산출됩니다.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setStatsConfigModalOpen(false);
                showToast('✓ 통계 설정이 성공적으로 저장되었습니다.');
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
            >
              설정 저장 완료
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 8: 당번 & 목표 종합 활동 보고서 발행 뷰어 (Comprehensive Report) */}
      {/* ------------------------------------------------------------------- */}
      <ElmBsh01
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={generatedReport ? `공식 보고서: ${generatedReport.period_label}` : '종합 활동 보고서'}
      >
        {generatedReport && (
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Report Document Paper Header */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {generatedReport.report_id}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {generatedReport.period_label}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    발행일시: {generatedReport.generated_at} · 모아보고 인증 센터 검증
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>공식 인증 스냅샷</span>
                  </span>
                </div>
              </div>

              {/* 1. 과업 완수 및 품질 감사 매트릭스 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>1. 과업 완수율 및 피어 승인 품질 감사</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-center">
                    <span className="text-[11px] text-slate-400 block">총 관리 과업</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {generatedReport.total_duties_count}개
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-center">
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 block">종합 완수율</span>
                    <strong className="text-sm font-black text-purple-700 dark:text-purple-300">
                      {generatedReport.overall_completion_rate}%
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-center">
                    <span className="text-[11px] text-slate-400 block">총 완수 실적</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {generatedReport.total_completed_logs}건
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-center">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">피어 승인율</span>
                    <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      {generatedReport.peer_approval_rate}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. 대신수행 품앗이 및 상계 대사 내역 */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-rose-500" />
                  <span>2. 대신수행 품앗이 정산 및 상계(Netting) 대사표</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800">
                    <span className="text-[10px] text-slate-400 block">총 품앗이 건수</span>
                    <span className="font-bold">{generatedReport.total_substitute_count}건</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    <span className="text-[10px] block">정산 완료액</span>
                    <span className="font-bold font-mono">{generatedReport.total_settled_amount.toLocaleString()}원</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                    <span className="text-[10px] block">미정산 잔여액</span>
                    <span className="font-bold font-mono">{generatedReport.unsettled_amount.toLocaleString()}원</span>
                  </div>
                </div>

                {/* Netting Pairs Table */}
                <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden mt-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-500 font-semibold">
                      <tr>
                        <th className="p-2">송금 대상 (From ➔ To)</th>
                        <th className="p-2 text-right">총 채무액</th>
                        <th className="p-2 text-right">상계 후 정산액</th>
                        <th className="p-2 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {generatedReport.netting_pairs.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                          <td className="p-2 font-medium">
                            {p.from_name} ➔ <strong className="text-purple-600 dark:text-purple-400">{p.to_name}</strong>
                          </td>
                          <td className="p-2 text-right font-mono text-slate-500">
                            {p.gross_amount.toLocaleString()}원
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-rose-600">
                            {p.netted_amount.toLocaleString()}원
                          </td>
                          <td className="p-2 text-center">
                            {p.is_cleared ? (
                              <span className="text-[10px] font-bold text-emerald-600">상계완료</span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600">송금대기</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. 명예의 전당 및 MVP */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. 구성원 성취 명예의 전당 및 연속 스트릭</span>
                </h4>
                <div className="p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥇</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        최고 기여왕 (MVP): {generatedReport.top_contributor_name}
                      </span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        완수 점수 및 품앗이 지원 가산점 합산 1위 달성
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{generatedReport.longest_streak_days}일 연속 완수</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. 금전관리 3대 원칙 준수 확인 */}
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>공식 회계 및 금전관리 감사 의견</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {generatedReport.summary_memo}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textSummary = `[모아보고 공식 종합 활동 보고서]\n보고서ID: ${generatedReport.report_id}\n기간: ${generatedReport.period_label}\n종합 완수율: ${generatedReport.overall_completion_rate}%\n총 완수 실적: ${generatedReport.total_completed_logs}건\n피어 승인율: ${generatedReport.peer_approval_rate}%\n미정산 잔여액: ${generatedReport.unsettled_amount.toLocaleString()}원\n최고 기여왕: ${generatedReport.top_contributor_name}\n최장 스트릭: ${generatedReport.longest_streak_days}일 연속`;
                    navigator.clipboard?.writeText(textSummary);
                    showToast('✓ 보고서 텍스트 요약이 클립보드에 복사되었습니다.');
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>클립보드 복사</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / PDF 저장</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        )}
      </ElmBsh01>
    </div>
  );
};
