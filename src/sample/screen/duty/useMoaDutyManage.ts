import React, { useState, useMemo } from 'react';
import { CategoryTreeNode } from '../../elements/Tokens';
import {
  MoaDuty,
  DutyCategory,
  DutyRotationPolicy,
  DutyApprovalPolicy,
} from '../../../types';
import {
  INITIAL_DUTIES,
  INITIAL_DUTY_CATEGORIES,
  INITIAL_INVITATIONS,
  DutyInvitation,
} from '../../dutyStore';

export type DutyManageTab = 'ALL' | 'MY' | 'SUBSTITUTE' | 'INVITATION';
export type DutySortOption = 'DUE_DATE' | 'TITLE' | 'COMPLETED';

export interface LedgerMemberCandidate {
  id: string;
  name: string;
  ledgerName: string;
  relation: string;
}

export interface DutyFormParticipant {
  name: string;
  role: 'ASSIGNEE' | 'VIEWER';
  weight?: number;
}

export const AVAILABLE_LEDGER_MEMBERS: LedgerMemberCandidate[] = [
  { id: 'u-1', name: '구본영(호스트)', ledgerName: '우리집 가계부', relation: '본인' },
  { id: 'u-2', name: '이지은(배우자)', ledgerName: '우리집 가계부', relation: '배우자' },
  { id: 'u-3', name: '구민우(자녀)', ledgerName: '우리집 가계부', relation: '자녀' },
  { id: 'u-4', name: '정현우(동창)', ledgerName: '동창회 모임', relation: '모임원' },
  { id: 'u-5', name: '김선영(총무)', ledgerName: '동창회 모임', relation: '총무' },
  { id: 'u-6', name: '박서준(게스트)', ledgerName: '동창회 모임', relation: '임시게스트' },
];

export function useMoaDutyManage() {
  const [duties, setDuties] = useState<MoaDuty[]>(INITIAL_DUTIES);
  const [categories] = useState<DutyCategory[]>(INITIAL_DUTY_CATEGORIES);
  const [invitations, setInvitations] = useState<DutyInvitation[]>(INITIAL_INVITATIONS);

  const [activeTab, setActiveTab] = useState<DutyManageTab>('ALL');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<DutySortOption>('DUE_DATE');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [descPreviewMode, setDescPreviewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [formCategory, setFormCategory] = useState('cat-clean');
  const [formRotationPolicy, setFormRotationPolicy] = useState<DutyRotationPolicy>('AGE_WEIGHTED');
  const [formApprovalPolicy, setFormApprovalPolicy] = useState<DutyApprovalPolicy>('PEER_3_APPROVAL');
  const [formSettlementCycle, setFormSettlementCycle] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY'>('WEEKLY');
  const [formCycleDays, setFormCycleDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [formParticipants, setFormParticipants] = useState<DutyFormParticipant[]>([
    { name: '구본영(호스트)', role: 'ASSIGNEE', weight: 1 },
    { name: '이지은(배우자)', role: 'ASSIGNEE', weight: 1 },
    { name: '구민우(자녀)', role: 'ASSIGNEE', weight: 2 },
  ]);

  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState<'ASSIGNEE' | 'VIEWER'>('ASSIGNEE');

  const showToast = (msg: string) => setToastMessage(msg);

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

  const filteredDuties = useMemo(() => {
    return duties
      .filter((duty) => {
        if (activeTab === 'MY') {
          const isMyDuty =
            duty.current_assigned_participant_id === 'p-1' ||
            duty.current_assigned_name.includes('구본영');
          if (!isMyDuty) return false;
        } else if (activeTab === 'SUBSTITUTE') {
          if (!duty.active_substitute_request || duty.active_substitute_request.status !== 'PENDING') {
            return false;
          }
        }

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

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = duty.duty_title.toLowerCase().includes(q);
          const matchDesc = (duty.duty_description || '').toLowerCase().includes(q);
          const matchAssignee = duty.current_assigned_name.toLowerCase().includes(q);
          const matchCategoryName = duty.category_name.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchAssignee && !matchCategoryName) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'TITLE') return a.duty_title.localeCompare(b.duty_title);
        if (sortBy === 'COMPLETED') return b.completed_count - a.completed_count;
        return (a.next_due_date || '').localeCompare(b.next_due_date || '');
      });
  }, [duties, activeTab, selectedCategoryIds, searchQuery, sortBy]);

  const totalDutiesCount = duties.length;
  const myDutiesCount = duties.filter((d) => d.current_assigned_name.includes('구본영')).length;
  const substituteRequestsCount = duties.filter(
    (d) => d.active_substitute_request?.status === 'PENDING'
  ).length;
  const pendingInvitationsCount = invitations.filter((i) => i.status === 'PENDING').length;

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
    showToast(
      `✓ "${member.name}" 님이 ${selectedMemberRole === 'ASSIGNEE' ? '당번 수행원' : '관람·응원단'}으로 추가되었습니다.`
    );
  };

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
        days_of_week: formCycleDays as ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[],
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

  const resetAllFilters = () => {
    setSelectedCategoryIds([]);
    setSearchQuery('');
    setActiveTab('ALL');
  };

  return {
    categories,
    invitations,
    activeTab,
    setActiveTab,
    selectedCategoryIds,
    setSelectedCategoryIds,
    isCategoryCollapsed,
    setIsCategoryCollapsed,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    createModalOpen,
    setCreateModalOpen,
    memberSelectModalOpen,
    setMemberSelectModalOpen,
    toastMessage,
    setToastMessage,
    formTitle,
    setFormTitle,
    formDesc,
    setFormDesc,
    descPreviewMode,
    setDescPreviewMode,
    formCategory,
    setFormCategory,
    formRotationPolicy,
    setFormRotationPolicy,
    formApprovalPolicy,
    setFormApprovalPolicy,
    formSettlementCycle,
    setFormSettlementCycle,
    formCycleDays,
    setFormCycleDays,
    formParticipants,
    setFormParticipants,
    memberSearchQuery,
    setMemberSearchQuery,
    selectedMemberRole,
    setSelectedMemberRole,
    categoryTreeData,
    filteredDuties,
    totalDutiesCount,
    myDutiesCount,
    substituteRequestsCount,
    pendingInvitationsCount,
    handleAcceptInvitation,
    handleRejectInvitation,
    handleAddMemberToForm,
    handleCreateDuty,
    resetAllFilters,
  };
}
