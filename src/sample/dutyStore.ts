import {
  MoaDuty,
  DutyCategory,
  DutyParticipant,
  DutyExecutionLog,
  DutySubstituteRequest,
  DutyRotationPolicy,
  DutyCycleConfig,
  DutyApprovalPolicy,
  DutyDurationType,
  DutyStatsPeriod,
  DutyStatsDataPoint,
  MemberContributionRank,
} from '../types';

export const INITIAL_DUTY_CATEGORIES: DutyCategory[] = [
  { category_id: 'cat-clean', name: '청소 및 정리', icon: '🧹', is_system: true, mission_type: 'DUTY' },
  { category_id: 'cat-kitchen', name: '주방 및 식사', icon: '🍽️', is_system: true, mission_type: 'DUTY' },
  { category_id: 'cat-recycle', name: '분리수거 및 배출', icon: '♻️', is_system: true, mission_type: 'DUTY' },
  { category_id: 'cat-finance', name: '재정 및 회계', icon: '💰', is_system: true, mission_type: 'DUTY' },
  { category_id: 'cat-life', name: '생활 돌봄 (반려/화분)', icon: '🪴', is_system: true, mission_type: 'DUTY' },
  { category_id: 'cat-health', name: '운동 및 건강', icon: '🏃', is_system: true, mission_type: 'GOAL' },
  { category_id: 'cat-study', name: '독서 및 학습', icon: '📚', is_system: true, mission_type: 'GOAL' },
];

export interface DutyInvitation {
  invitation_id: string;
  duty_title: string;
  category_name: string;
  inviter_name: string;
  role: 'ASSIGNEE' | 'VIEWER';
  mission_type: 'DUTY' | 'GOAL';
  cycle_label: string;
  invited_at: string;
  invite_link: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export const INITIAL_INVITATIONS: DutyInvitation[] = [
  {
    invitation_id: 'inv-1',
    duty_title: '주말 아침 러닝 5km 완주',
    category_name: '운동 및 건강',
    inviter_name: '정현우(동창)',
    role: 'VIEWER',
    mission_type: 'GOAL',
    cycle_label: '매주 토요일 (주 1회)',
    invited_at: '2026-10-25 09:20',
    invite_link: 'https://moabogo.app/join/inv-1',
    status: 'PENDING',
  },
  {
    invitation_id: 'inv-2',
    duty_title: '연구실 세미나실 저녁 마감 & 소등',
    category_name: '청소 및 정리',
    inviter_name: '김연구원',
    role: 'ASSIGNEE',
    mission_type: 'DUTY',
    cycle_label: '격주 수요일 (격주 1회)',
    invited_at: '2026-10-24 18:30',
    invite_link: 'https://moabogo.app/join/inv-2',
    status: 'PENDING',
  },
];

export const INITIAL_DUTY_LOGS: DutyExecutionLog[] = [
  {
    log_id: 'log-01',
    duty_id: 'duty-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    executed_by_name: '이지은(배우자)',
    executed_by_id: 'u-2',
    is_substitute: true,
    substitute_for_name: '구민우(자녀)',
    proof_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    memo: '자녀 시험기간 대신수행 완수. 거실 및 복도 소독 완료!',
    submitted_at: '2026-10-26 10:15',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '피어 3인 자동승인',
    approved_at: '2026-10-26 10:30',
    approvals_count: 3,
    approvals_required: 3,
    approved_by_list: ['구본영(호스트)', '정현우(동창)', '이지은(배우자)'],
  },
  {
    log_id: 'log-02',
    duty_id: 'duty-02',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: false,
    proof_image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    memo: '대형 재활용 박스 정리 및 음식물 종량제 봉투 배출 완료했습니다.',
    submitted_at: '2026-10-25 20:45',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-25 21:00',
    approvals_count: 1,
    approvals_required: 1,
    approved_by_list: ['구본영(호스트)'],
  },
  {
    log_id: 'log-03',
    duty_id: 'duty-04',
    duty_title: '베란다 화분 물주기 & 통풍 환기',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: false,
    memo: '올리브나무와 몬스테라 흠뻑 물주기 완료',
    submitted_at: '2026-10-24 09:30',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '자율 확인 완료',
    approved_at: '2026-10-24 09:30',
    approvals_count: 1,
    approvals_required: 1,
  },
  {
    log_id: 'log-04',
    duty_id: 'duty-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    executed_by_name: '이지은(배우자)',
    executed_by_id: 'u-2',
    is_substitute: false,
    memo: '거실, 주방 바닥 물걸레 청소 완료',
    submitted_at: '2026-10-23 14:20',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-23 15:00',
    approvals_count: 3,
    approvals_required: 3,
  },
  {
    log_id: 'log-05',
    duty_id: 'duty-02',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: true,
    substitute_for_name: '이지은(배우자)',
    memo: '야근하는 배우자 대신 분리배출 완료',
    submitted_at: '2026-10-21 21:10',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '피어 승인',
    approved_at: '2026-10-21 21:30',
    approvals_count: 2,
    approvals_required: 1,
  },
  {
    log_id: 'log-06',
    duty_id: 'duty-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    executed_by_name: '구민우(자녀)',
    executed_by_id: 'u-3',
    is_substitute: false,
    memo: '제 방이랑 거실 청소기 직접 다 돌렸어요!',
    submitted_at: '2026-10-20 17:40',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '부모 확인 승인',
    approved_at: '2026-10-20 18:00',
    approvals_count: 3,
    approvals_required: 3,
  },
  {
    log_id: 'log-07',
    duty_id: 'duty-02',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: false,
    memo: '재활용 분리수거 완료',
    submitted_at: '2026-10-18 20:00',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-18 20:30',
    approvals_count: 1,
    approvals_required: 1,
  },
  {
    log_id: 'log-08',
    duty_id: 'duty-04',
    duty_title: '베란다 화분 물주기 & 통풍 환기',
    executed_by_name: '이지은(배우자)',
    executed_by_id: 'u-2',
    is_substitute: false,
    memo: '통풍 환기 및 잎 닦아주기',
    submitted_at: '2026-10-17 11:00',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '자율 확인 완료',
    approved_at: '2026-10-17 11:00',
    approvals_count: 1,
    approvals_required: 1,
  },
  {
    log_id: 'log-09',
    duty_id: 'duty-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: true,
    substitute_for_name: '구민우(자녀)',
    memo: '자녀 학원 시험 주간 대신 수행',
    submitted_at: '2026-10-16 19:30',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-16 20:00',
    approvals_count: 3,
    approvals_required: 3,
  },
  {
    log_id: 'log-10',
    duty_id: 'duty-02',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    executed_by_name: '이지은(배우자)',
    executed_by_id: 'u-2',
    is_substitute: false,
    memo: '분리수거 및 박스 테이프 제거 완료',
    submitted_at: '2026-10-11 20:30',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-11 21:00',
    approvals_count: 1,
    approvals_required: 1,
  },
  {
    log_id: 'log-11',
    duty_id: 'duty-04',
    duty_title: '베란다 화분 물주기 & 통풍 환기',
    executed_by_name: '구본영(호스트)',
    executed_by_id: 'u-1',
    is_substitute: false,
    memo: '주말 물주기 완료',
    submitted_at: '2026-10-10 10:15',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '자율 확인 완료',
    approved_at: '2026-10-10 10:15',
    approvals_count: 1,
    approvals_required: 1,
  },
  {
    log_id: 'log-12',
    duty_id: 'duty-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    executed_by_name: '이지은(배우자)',
    executed_by_id: 'u-2',
    is_substitute: false,
    memo: '가을 대청소 완료',
    submitted_at: '2026-10-06 15:00',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '관리자 승인',
    approved_at: '2026-10-06 15:30',
    approvals_count: 3,
    approvals_required: 3,
  },
  {
    log_id: 'log-13',
    duty_id: 'duty-02',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    executed_by_name: '구민우(자녀)',
    executed_by_id: 'u-3',
    is_substitute: false,
    memo: '아빠랑 같이 분리수거 다 버렸어요!',
    submitted_at: '2026-10-04 19:40',
    evaluation_status: 'AUTO_APPROVED',
    approved_by_name: '부모 확인 승인',
    approved_at: '2026-10-04 20:00',
    approvals_count: 2,
    approvals_required: 1,
  },
];

export const INITIAL_DUTIES: MoaDuty[] = [
  {
    duty_id: 'duty-01',
    ledger_id: 'led-1',
    category_id: 'cat-clean',
    category_name: '청소 및 정리',
    mission_type: 'DUTY',
    duty_title: '거실 청소기 및 물걸레 밀기',
    duty_description: '거실 전체 청소기 흡입 후 무선 물걸레로 꼼꼼히 닦기',
    sub_category: '실내청소',
    rotation_policy: 'AGE_WEIGHTED',
    cycle_config: {
      cycle_type: 'WEEKLY',
      days_of_week: ['TUE', 'THU', 'SAT'],
      target_count_per_cycle: 3,
    },
    approval_policy: 'PEER_3_APPROVAL',
    duration_type: 'INDEFINITE',
    completed_count: 14,
    can_substitute: true,
    participants: [
      {
        participant_id: 'p-1',
        user_id: 'u-1',
        name: '구본영(호스트)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 0,
        invitation_status: 'ACCEPTED',
        birth_date: '1988-05-12',
        weight: 1,
      },
      {
        participant_id: 'p-2',
        user_id: 'u-2',
        name: '이지은(배우자)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 1,
        invitation_status: 'ACCEPTED',
        birth_date: '1990-08-20',
        weight: 1,
      },
      {
        participant_id: 'p-3',
        user_id: 'u-3',
        name: '구민우(자녀)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 2,
        invitation_status: 'ACCEPTED',
        birth_date: '2016-03-14',
        weight: 2,
      },
      {
        participant_id: 'p-4',
        name: '정현우(동창)',
        role: 'VIEWER',
        is_guest: false,
        order_index: 3,
        invitation_status: 'ACCEPTED',
      },
    ],
    current_assigned_participant_id: 'p-3',
    current_assigned_name: '구민우(자녀)',
    next_due_date: '2026-10-27',
    progress_status: 'SUBMITTED',
    settlement_status: 'UNSETTLED',
    evaluation_status: 'UNVERIFIED',
    active_substitute_request: {
      request_id: 'sub-01',
      duty_id: 'duty-01',
      requester_id: 'p-3',
      requester_name: '구민우(자녀)',
      target_type: 'OPEN',
      status: 'PENDING',
      benefit_type: 'ALLOWANCE_MONEY',
      allowance_amount: 5000,
      auto_create_expense: true,
      payment_link_url: 'https://qr.kakaopay.com/281006093849',
      memo: '중간고사 학원 특강으로 시간 부족! 대신 해주시면 용돈 5천원 바로 보내드려요 😭',
      created_at: '2026-10-26 08:30',
    },
    assigned_user_id: 'u-3',
    assigned_name: '구민우(자녀)',
    is_guest: false,
    approval_required: true,
    status: 'ASSIGNED',
    created_at: '2026-09-01',
  },
  {
    duty_id: 'duty-02',
    ledger_id: 'led-1',
    category_id: 'cat-recycle',
    category_name: '분리수거 및 배출',
    mission_type: 'DUTY',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    duty_description: '일요일 저녁 8시 전 재활용 분리장 배출 및 음식물통 비우기',
    sub_category: '재활용',
    rotation_policy: 'NAME_ASC',
    cycle_config: {
      cycle_type: 'WEEKLY',
      days_of_week: ['SUN'],
      target_count_per_cycle: 1,
    },
    approval_policy: 'ADMIN_APPROVAL',
    duration_type: 'INDEFINITE',
    completed_count: 22,
    can_substitute: true,
    participants: [
      {
        participant_id: 'p-1',
        user_id: 'u-1',
        name: '구본영(호스트)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 0,
        invitation_status: 'ACCEPTED',
        birth_date: '1988-05-12',
      },
      {
        participant_id: 'p-2',
        user_id: 'u-2',
        name: '이지은(배우자)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 1,
        invitation_status: 'ACCEPTED',
        birth_date: '1990-08-20',
      },
    ],
    current_assigned_participant_id: 'p-1',
    current_assigned_name: '구본영(호스트)',
    next_due_date: '2026-11-01',
    progress_status: 'COMPLETED',
    settlement_status: 'SETTLED',
    evaluation_status: 'AUTO_APPROVED',
    assigned_user_id: 'u-1',
    assigned_name: '구본영(호스트)',
    is_guest: false,
    approval_required: true,
    status: 'COMPLETED',
    proof_image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&auto=format&fit=crop&q=60',
    created_at: '2026-08-15',
  },
  {
    duty_id: 'duty-03',
    ledger_id: 'led-3',
    category_id: 'cat-kitchen',
    category_name: '주방 및 식사',
    mission_type: 'DUTY',
    duty_title: '동창회 펜션 식기 설거지 & 주방 정리',
    duty_description: '바베큐 파티 후 불판 및 식기 온수 세척, 식탁 행주 닦기',
    sub_category: '설거지',
    rotation_policy: 'RANDOM',
    cycle_config: {
      cycle_type: 'DAILY',
      target_count_per_cycle: 1,
    },
    approval_policy: 'SELF_CONFIRM',
    duration_type: 'TARGET_COUNT',
    duration_target_count: 3,
    completed_count: 1,
    can_substitute: true,
    participants: [
      {
        participant_id: 'p-10',
        name: '게스트 정현우',
        role: 'ASSIGNEE',
        is_guest: true,
        order_index: 0,
        invitation_status: 'ACCEPTED',
      },
      {
        participant_id: 'p-11',
        name: '게스트 박지민',
        role: 'ASSIGNEE',
        is_guest: true,
        order_index: 1,
        invitation_status: 'ACCEPTED',
      },
      {
        participant_id: 'p-12',
        name: '구본영(호스트)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 2,
        invitation_status: 'ACCEPTED',
      },
    ],
    current_assigned_participant_id: 'p-10',
    current_assigned_name: '게스트 정현우',
    next_due_date: '2026-10-27',
    progress_status: 'IN_PROGRESS',
    settlement_status: 'UNSETTLED',
    evaluation_status: 'UNVERIFIED',
    assigned_name: '게스트 정현우',
    is_guest: true,
    approval_required: false,
    status: 'ASSIGNED',
    created_at: '2026-10-25',
  },
  {
    duty_id: 'duty-04',
    ledger_id: 'led-1',
    category_id: 'cat-life',
    category_name: '생활 돌봄 (반려/화분)',
    mission_type: 'DUTY',
    duty_title: '베란다 화분 물주기 & 통풍 환기',
    duty_description: '올리브나무와 몬스테라 흙 상태 확인 후 흠뻑 물주기',
    sub_category: '화분관리',
    rotation_policy: 'BIRTH_DATE',
    cycle_config: {
      cycle_type: 'BIWEEKLY',
      days_of_week: ['WED', 'SAT'],
      target_count_per_cycle: 2,
    },
    approval_policy: 'NO_APPROVAL',
    duration_type: 'INDEFINITE',
    completed_count: 8,
    can_substitute: false,
    participants: [
      {
        participant_id: 'p-1',
        user_id: 'u-1',
        name: '구본영(호스트)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 0,
        invitation_status: 'ACCEPTED',
        birth_date: '1988-05-12',
      },
      {
        participant_id: 'p-2',
        user_id: 'u-2',
        name: '이지은(배우자)',
        role: 'ASSIGNEE',
        is_guest: false,
        order_index: 1,
        invitation_status: 'ACCEPTED',
        birth_date: '1990-08-20',
      },
    ],
    current_assigned_participant_id: 'p-2',
    current_assigned_name: '이지은(배우자)',
    next_due_date: '2026-10-28',
    progress_status: 'ASSIGNED',
    settlement_status: 'UNSETTLED',
    evaluation_status: 'UNVERIFIED',
    assigned_user_id: 'u-2',
    assigned_name: '이지은(배우자)',
    is_guest: false,
    approval_required: false,
    status: 'ASSIGNED',
    created_at: '2026-09-10',
  },
];

// 순환 정책에 따른 다음 담당자 결정 알고리즘
export function calculateNextAssignee(
  policy: DutyRotationPolicy,
  participants: DutyParticipant[],
  currentParticipantId?: string
): DutyParticipant | null {
  const assignees = participants.filter((p) => p.role === 'ASSIGNEE');
  if (assignees.length === 0) return null;
  if (assignees.length === 1) return assignees[0];

  switch (policy) {
    case 'RANDOM': {
      const candidates = assignees.filter((p) => p.participant_id !== currentParticipantId);
      const pool = candidates.length > 0 ? candidates : assignees;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx];
    }
    case 'NAME_ASC': {
      const sorted = [...assignees].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      const currIdx = sorted.findIndex((p) => p.participant_id === currentParticipantId);
      return sorted[(currIdx + 1) % sorted.length];
    }
    case 'BIRTH_DATE': {
      const sorted = [...assignees].sort((a, b) => {
        const bdA = a.birth_date || '9999-99-99';
        const bdB = b.birth_date || '9999-99-99';
        return bdA.localeCompare(bdB);
      });
      const currIdx = sorted.findIndex((p) => p.participant_id === currentParticipantId);
      return sorted[(currIdx + 1) % sorted.length];
    }
    case 'AGE_WEIGHTED': {
      // 가중치가 높은 인원(예: 자녀 교육 가중치 등)이 더 자주 배정되는 알고리즘
      const weightedPool: DutyParticipant[] = [];
      assignees.forEach((p) => {
        const w = Math.max(1, p.weight || 1);
        for (let i = 0; i < w; i++) {
          weightedPool.push(p);
        }
      });
      const candidates = weightedPool.filter((p) => p.participant_id !== currentParticipantId);
      const pool = candidates.length > 0 ? candidates : weightedPool;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx];
    }
  }
}

// -------------------------------------------------------------
// 실시간 통계 차트 및 기여도 랭킹 산출 엔진 (모아당번 8번)
// -------------------------------------------------------------

// 일별, 주별, 월별 완수율 통계 산출
export function calculateDutyStats(
  period: DutyStatsPeriod,
  _duties: MoaDuty[],
  logs: DutyExecutionLog[]
): DutyStatsDataPoint[] {
  // 기준일: 2026-10-26
  if (period === 'DAILY') {
    // 최근 7일 (10/20 ~ 10/26)
    const days = [
      { date: '2026-10-20', label: '10/20(일)', scheduled: 2 },
      { date: '2026-10-21', label: '10/21(월)', scheduled: 2 },
      { date: '2026-10-22', label: '10/22(화)', scheduled: 1 },
      { date: '2026-10-23', label: '10/23(수)', scheduled: 3 },
      { date: '2026-10-24', label: '10/24(목)', scheduled: 2 },
      { date: '2026-10-25', label: '10/25(금)', scheduled: 3 },
      { date: '2026-10-26', label: '10/26(오늘)', scheduled: 3 },
    ];

    return days.map((d) => {
      const dayLogs = logs.filter((l) => l.submitted_at.startsWith(d.date));
      const completed = dayLogs.length;
      const sub = dayLogs.filter((l) => l.is_substitute).length;
      const total = Math.max(d.scheduled, completed);
      const uncompleted = Math.max(0, total - completed);
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        label: d.label,
        date_start: d.date,
        total_scheduled: total,
        completed_count: completed,
        substitute_count: sub,
        uncompleted_count: uncompleted,
        completion_rate: rate,
      };
    });
  }

  if (period === 'WEEKLY') {
    // 최근 6주 (9월 3주 ~ 10월 4주)
    const weeks = [
      { label: '9월 3주', scheduled: 8, completed: 7, sub: 1, uncomp: 1, rate: 88 },
      { label: '9월 4주', scheduled: 9, completed: 8, sub: 2, uncomp: 1, rate: 89 },
      { label: '10월 1주', scheduled: 10, completed: 9, sub: 1, uncomp: 1, rate: 90 },
      { label: '10월 2주', scheduled: 11, completed: 10, sub: 2, uncomp: 1, rate: 91 },
      { label: '10월 3주', scheduled: 12, completed: 11, sub: 3, uncomp: 1, rate: 92 },
      { label: '10월 4주 (이번주)', scheduled: 10, completed: 8, sub: 2, uncomp: 2, rate: 80 },
    ];
    return weeks.map((w) => ({
      label: w.label,
      total_scheduled: w.scheduled,
      completed_count: w.completed,
      substitute_count: w.sub,
      uncompleted_count: w.uncomp,
      completion_rate: w.rate,
    }));
  }

  // MONTHLY: 최근 5개월 (6월 ~ 10월)
  const months = [
    { label: '6월', scheduled: 32, completed: 28, sub: 4, uncomp: 4, rate: 88 },
    { label: '7월', scheduled: 38, completed: 35, sub: 5, uncomp: 3, rate: 92 },
    { label: '8월', scheduled: 42, completed: 39, sub: 6, uncomp: 3, rate: 93 },
    { label: '9월', scheduled: 45, completed: 42, sub: 7, uncomp: 3, rate: 93 },
    { label: '10월 (진행중)', scheduled: 40, completed: 36, sub: 8, uncomp: 4, rate: 90 },
  ];
  return months.map((m) => ({
    label: m.label,
    total_scheduled: m.scheduled,
    completed_count: m.completed,
    substitute_count: m.sub,
    uncompleted_count: m.uncomp,
    completion_rate: m.rate,
  }));
}

// 구성원별 기여도 랭킹 산출 (가산점 가중치 반영)
export function calculateMemberRanks(
  duties: MoaDuty[],
  logs: DutyExecutionLog[]
): MemberContributionRank[] {
  // 모든 고유 참여자 추출
  const memberMap = new Map<string, {
    name: string;
    role: 'ASSIGNEE' | 'VIEWER';
    is_guest: boolean;
    completed: number;
    helpGiven: number;
    helpReceived: number;
  }>();

  // 당번에 등록된 참여자 우선 초기화
  duties.forEach((duty) => {
    duty.participants.forEach((p) => {
      if (!memberMap.has(p.name)) {
        memberMap.set(p.name, {
          name: p.name,
          role: p.role,
          is_guest: p.is_guest,
          completed: 0,
          helpGiven: 0,
          helpReceived: 0,
        });
      }
    });
  });

  // 로그를 기반으로 완수 및 품앗이 건수 집계
  logs.forEach((log) => {
    const execName = log.executed_by_name;
    if (!memberMap.has(execName)) {
      memberMap.set(execName, {
        name: execName,
        role: 'ASSIGNEE',
        is_guest: false,
        completed: 0,
        helpGiven: 0,
        helpReceived: 0,
      });
    }
    const mem = memberMap.get(execName)!;
    mem.completed += 1;

    if (log.is_substitute) {
      mem.helpGiven += 1;
      if (log.substitute_for_name && memberMap.has(log.substitute_for_name)) {
        memberMap.get(log.substitute_for_name)!.helpReceived += 1;
      }
    }
  });

  // 점수 계산 및 랭킹 정렬
  // 공식: 완수(10점) + 대신수행 기여(15점) - 대신수행 요청(5점)
  const list = Array.from(memberMap.values())
    .filter((m) => m.role === 'ASSIGNEE')
    .map((m, idx) => {
      const score = m.completed * 10 + m.helpGiven * 15 - m.helpReceived * 5;
      const totalAttempted = m.completed + m.helpReceived;
      const rate = totalAttempted > 0 ? Math.min(100, Math.round((m.completed / totalAttempted) * 100)) : 100;
      // 스트릭 산출 (기본값 제공 및 활동량 비례)
      const streak = Math.max(1, Math.min(14, m.completed * 2));

      return {
        participant_id: `rank-${idx}`,
        name: m.name,
        role: m.role,
        is_guest: m.is_guest,
        completed_count: m.completed,
        completion_rate: rate,
        help_given_count: m.helpGiven,
        help_received_count: m.helpReceived,
        streak_days: streak,
        score: Math.max(0, score),
        rank: 1,
        badge: 'MEMBER' as const,
      };
    });

  // 점수 내림차순 정렬
  list.sort((a, b) => b.score - a.score);

  // 순위 및 배지 부여
  return list.map((item, index) => {
    const rank = index + 1;
    let badge: 'GOLD' | 'SILVER' | 'BRONZE' | 'MEMBER' = 'MEMBER';
    if (rank === 1) badge = 'GOLD';
    else if (rank === 2) badge = 'SILVER';
    else if (rank === 3) badge = 'BRONZE';

    return {
      ...item,
      rank,
      badge,
    };
  });
}

// 전체 KPI 요약 메트릭 산출
export function calculateDutyKPIs(_duties: MoaDuty[], logs: DutyExecutionLog[]) {
  const totalCompleted = logs.length;
  const substituteCount = logs.filter((l) => l.is_substitute).length;
  // 전체 완수율 (평균 92%)
  const overallRate = totalCompleted > 0 ? 92 : 0;
  // 현재 연속 달성 스트릭
  const currentStreak = 12;

  return {
    totalCompleted,
    substituteCount,
    overallRate,
    currentStreak,
  };
}

