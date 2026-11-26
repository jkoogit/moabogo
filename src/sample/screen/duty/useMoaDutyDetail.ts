import React, { useState, useMemo } from 'react';
import {
  MoaDuty,
  DutyExecutionLog,
  DutyRotationPolicy,
  DutyApprovalPolicy,
  DutySubstituteRequest,
  DutyStatsPeriod,
  DutyStatsDataPoint,
  SubstituteSettlementItem,
  DutyComprehensiveReport,
} from '../../../types';
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
} from '../../dutyStore';
import { OFFLINE_PROOF_CLEANING } from '../../shared/offlineProofAssets';
import { validateDutyExternalUrl } from './dutyUtils';

export type DutyDetailTab = 'EXECUTION' | 'STATS' | 'SUBSTITUTE' | 'LOGS' | 'MEMBERS';

export function useMoaDutyDetail(dutyId: string = 'duty-01') {
  const [duties, setDuties] = useState<MoaDuty[]>(INITIAL_DUTIES);
  const [currentDutyId] = useState<string>(dutyId);
  const [logs, setLogs] = useState<DutyExecutionLog[]>(INITIAL_DUTY_LOGS);
  const [settlements] = useState<SubstituteSettlementItem[]>(INITIAL_SUBSTITUTE_SETTLEMENTS);

  const duty = useMemo(() => {
    return duties.find((d) => d.duty_id === currentDutyId) || duties[0];
  }, [duties, currentDutyId]);

  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(true);
  const [settlementCycle, setSettlementCycle] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY'>('WEEKLY');
  const [activeTab, setActiveTab] = useState<DutyDetailTab>('EXECUTION');
  const [memberSubTab, setMemberSubTab] = useState<'ASSIGNEES' | 'VIEWERS'>('ASSIGNEES');
  const [statsPeriod, setStatsPeriod] = useState<DutyStatsPeriod>('WEEKLY');
  const [selectedStatPoint, setSelectedStatPoint] = useState<DutyStatsDataPoint | null>(null);
  const [selectedLogMemberName, setSelectedLogMemberName] = useState<string>('ALL');

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showStateGuideModal, setShowStateGuideModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<DutyComprehensiveReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [editFormTitle, setEditFormTitle] = useState('');
  const [editFormDesc, setEditFormDesc] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('cat-clean');
  const [editFormRotationPolicy, setEditFormRotationPolicy] =
    useState<DutyRotationPolicy>('AGE_WEIGHTED');
  const [editFormApprovalPolicy, setEditFormApprovalPolicy] =
    useState<DutyApprovalPolicy>('PEER_3_APPROVAL');
  const [editFormSettlementCycle, setEditFormSettlementCycle] = useState<
    'WEEKLY' | 'MONTHLY' | 'DAILY'
  >('WEEKLY');
  const [editFormCycleDays, setEditFormCycleDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [editFormProgressStatus, setEditFormProgressStatus] =
    useState<MoaDuty['progress_status']>('ASSIGNED');
  const [editFormSettlementStatus, setEditFormSettlementStatus] =
    useState<MoaDuty['settlement_status']>('UNSETTLED');
  const [editFormEvaluationStatus, setEditFormEvaluationStatus] =
    useState<MoaDuty['evaluation_status']>('UNVERIFIED');
  const [descPreviewMode, setDescPreviewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');

  const [proofImage, setProofImage] = useState<string>(OFFLINE_PROOF_CLEANING);
  const [proofMemo, setProofMemo] = useState<string>('');

  const [subReason, setSubReason] = useState<string>('');
  const [subReward, setSubReward] = useState<number>(3000);
  const [subTargetType, setSubTargetType] = useState<'OPEN' | 'DIRECT'>('OPEN');
  const [selectedSubTargetMemberIds, setSelectedSubTargetMemberIds] = useState<string[]>([]);

  const showToast = (msg: string) => setToastMessage(msg);

  const statsResult = useMemo(
    () => calculateDutyStats(statsPeriod, duties, logs),
    [statsPeriod, duties, logs]
  );
  const memberRanks = useMemo(() => calculateMemberRanks(duties, logs), [duties, logs]);
  const kpis = useMemo(() => calculateDutyKPIs(duties, logs), [duties, logs]);
  const nettingPairs = useMemo(() => calculateSubstituteNetting(settlements), [settlements]);
  const nextAssignee = useMemo(
    () =>
      calculateNextAssignee(
        duty.rotation_policy,
        duty.participants,
        duty.current_assigned_participant_id
      ),
    [duty]
  );

  const shortInviteUrl = useMemo(() => {
    const code = duty.duty_id.replace('duty-', 'd-');
    const raw = `https://moabogo.app/i/${code}`;
    const check = validateDutyExternalUrl(raw);
    return check.valid && check.sanitizedUrl ? check.sanitizedUrl : raw;
  }, [duty.duty_id]);

  const dutyLogs = useMemo(
    () => logs.filter((l) => l.duty_id === duty.duty_id),
    [logs, duty.duty_id]
  );

  const filteredLogs = useMemo(() => {
    if (selectedLogMemberName === 'ALL') return dutyLogs;
    return dutyLogs.filter((l) => l.executed_by_name.includes(selectedLogMemberName));
  }, [dutyLogs, selectedLogMemberName]);

  const logMembersSummary = useMemo(() => {
    const map = new Map<string, number>();
    dutyLogs.forEach((l) => {
      map.set(l.executed_by_name, (map.get(l.executed_by_name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [dutyLogs]);

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
                days_of_week: editFormCycleDays as ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[],
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

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofMemo.trim()) {
      showToast('완수 확인 메모를 작성해주세요.');
      return;
    }

    const isAutoApproved =
      duty.approval_policy === 'SELF_CONFIRM' || duty.approval_policy === 'NO_APPROVAL';

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

  const handleApproveDuty = () => {
    setDuties((prev) =>
      prev.map((d) =>
        d.duty_id === duty.duty_id
          ? { ...d, evaluation_status: 'AUTO_APPROVED', progress_status: 'SUBMITTED' }
          : d
      )
    );
    showToast('✓ 당번 완료 승인 투표 완료! 과업이 공식 완수 처리되었습니다.');
  };

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
        d.duty_id === duty.duty_id ? { ...d, active_substitute_request: newRequest } : d
      )
    );

    setSubstituteModalOpen(false);
    setSubReason('');
    setSelectedSubTargetMemberIds([]);
    showToast('✓ 대신수행 요청이 등록되었습니다. 지정 구성원에게 알림이 전송됩니다.');
  };

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

  const handleCopyShortLink = () => {
    const check = validateDutyExternalUrl(shortInviteUrl);
    if (!check.valid || !check.sanitizedUrl) {
      showToast(`⚠️ 보안 검증 실패: ${check.reason || '신뢰할 수 없는 초대 링크입니다.'}`);
      return;
    }
    navigator.clipboard?.writeText(check.sanitizedUrl);
    showToast('✓ 보안 검증된 단축 초대 링크가 클립보드에 복사되었습니다.');
  };

  const handleCopyPaymentLink = (rawUrl?: string) => {
    const check = validateDutyExternalUrl(rawUrl || '');
    if (!check.valid || !check.sanitizedUrl) {
      showToast(`⚠️ 비인가 송금 링크 차단: ${check.reason || '허용되지 않은 도메인입니다.'}`);
      return;
    }
    navigator.clipboard?.writeText(check.sanitizedUrl);
    showToast('✓ 화이트리스트 검증 완료! 안전 송금 링크가 클립보드에 복사되었습니다.');
  };

  return {
    duty,
    dutyLogs,
    filteredLogs,
    logMembersSummary,
    isRecruitmentOpen,
    setIsRecruitmentOpen,
    settlementCycle,
    setSettlementCycle,
    activeTab,
    setActiveTab,
    memberSubTab,
    setMemberSubTab,
    statsPeriod,
    setStatsPeriod,
    selectedStatPoint,
    setSelectedStatPoint,
    selectedLogMemberName,
    setSelectedLogMemberName,
    proofModalOpen,
    setProofModalOpen,
    substituteModalOpen,
    setSubstituteModalOpen,
    reportModalOpen,
    setReportModalOpen,
    inviteLinkModalOpen,
    setInviteLinkModalOpen,
    editModalOpen,
    setEditModalOpen,
    showStateGuideModal,
    setShowStateGuideModal,
    generatedReport,
    toastMessage,
    setToastMessage,
    showToast,
    editFormTitle,
    setEditFormTitle,
    editFormDesc,
    setEditFormDesc,
    editFormCategory,
    setEditFormCategory,
    editFormRotationPolicy,
    setEditFormRotationPolicy,
    editFormApprovalPolicy,
    setEditFormApprovalPolicy,
    editFormSettlementCycle,
    setEditFormSettlementCycle,
    editFormCycleDays,
    setEditFormCycleDays,
    editFormProgressStatus,
    setEditFormProgressStatus,
    editFormSettlementStatus,
    setEditFormSettlementStatus,
    editFormEvaluationStatus,
    setEditFormEvaluationStatus,
    descPreviewMode,
    setDescPreviewMode,
    proofImage,
    setProofImage,
    proofMemo,
    setProofMemo,
    subReason,
    setSubReason,
    subReward,
    setSubReward,
    subTargetType,
    setSubTargetType,
    selectedSubTargetMemberIds,
    setSelectedSubTargetMemberIds,
    statsResult,
    memberRanks,
    kpis,
    nettingPairs,
    nextAssignee,
    shortInviteUrl,
    handleOpenEditModal,
    handleSaveDutyEdit,
    handleSubmitProof,
    handleApproveDuty,
    handleSubmitSubstitute,
    handleRemoveMember,
    handleOpenReportModal,
    handleCopyShortLink,
    handleCopyPaymentLink,
  };
}
