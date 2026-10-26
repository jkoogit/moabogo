export interface User {
  user_id: string;
  email: string;
  nickname: string;
  provider: 'KAKAO' | 'TOSS' | 'NAVER' | 'EMAIL';
  provider_id: string;
  personal_ocr_key?: string;
  created_at: string;
}

export interface Ledger {
  ledger_id: string;
  owner_id: string;
  ledger_name: string;
  ledger_type: 'PERSONAL' | 'GROUP';
  is_instance?: boolean;
  role?: 'OWNER' | 'MEMBER' | 'VIEWER';
  created_at: string;
}

export interface Transaction {
  transaction_id: string;
  ledger_id: string;
  user_id: string;
  transaction_type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  merchant_name: string;
  category_name: string;
  transaction_date: string;
  is_asset_transfer: boolean;
  created_at: string;
  note?: string;
}

export interface StandaloneEvent {
  event_id: string;
  created_by: string;
  event_type: 'SETTLEMENT_1_N' | 'LADDER' | 'TAG';
  event_title: string;
  total_amount: number;
  binding_option: 'ASK_AFTER' | 'AUTO_LINK' | 'SKIP';
  has_guests: boolean;
  created_at: string;
  participants: Array<{
    participant_id: string;
    user_id?: string;
    name: string;
    is_guest: boolean;
    amount_due: number;
    is_settled: boolean;
    is_mapped: boolean;
  }>;
}

export type DutyRotationPolicy = 'RANDOM' | 'NAME_ASC' | 'BIRTH_DATE' | 'AGE_WEIGHTED';
export type DutyCycleType = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'BIMONTHLY';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type MonthlyOption = 'FIRST_DAY' | 'LAST_DAY' | 'SPECIFIC_DAY';

export interface DutyCycleConfig {
  cycle_type: DutyCycleType;
  days_of_week?: DayOfWeek[];
  monthly_option?: MonthlyOption;
  specific_day?: number;
  target_count_per_cycle: number;
}

export type DutyApprovalPolicy = 'ADMIN_APPROVAL' | 'PEER_3_APPROVAL' | 'SELF_CONFIRM' | 'NO_APPROVAL';
export type DutyDurationType = 'INDEFINITE' | 'UNTIL_DATE' | 'TARGET_COUNT';
export type DutyParticipantRole = 'ASSIGNEE' | 'VIEWER';

export interface DutyParticipant {
  participant_id: string;
  user_id?: string;
  name: string;
  role: DutyParticipantRole;
  is_guest: boolean;
  order_index: number;
  invitation_status: 'ACCEPTED' | 'PENDING' | 'REJECTED';
  birth_date?: string;
  weight?: number;
}

export interface DutySubstituteRequest {
  request_id: string;
  duty_id: string;
  requester_id: string;
  requester_name: string;
  target_type: 'SPECIFIC' | 'OPEN';
  target_user_id?: string;
  target_user_name?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  benefit_type: 'ALLOWANCE_MONEY' | 'SUBSTITUTE_COUPON' | 'NONE';
  allowance_amount?: number;
  auto_create_expense?: boolean;
  payment_link_url?: string;
  memo?: string;
  created_at: string;
  accepted_by?: string;
  accepted_at?: string;
}

export interface DutyCategory {
  category_id: string;
  name: string;
  icon?: string;
  is_system: boolean;
  mission_type: 'DUTY' | 'GOAL' | 'ALL';
}

export interface DutyExecutionLog {
  log_id: string;
  duty_id: string;
  duty_title: string;
  executed_by_name: string;
  executed_by_id?: string;
  is_substitute: boolean;
  substitute_for_name?: string;
  proof_image_url?: string;
  memo?: string;
  submitted_at: string;
  evaluation_status: 'UNVERIFIED' | 'AUTO_APPROVED' | 'MANUAL_CONFIRMED';
  approved_by_name?: string;
  approved_at?: string;
  approvals_count: number;
  approvals_required: number;
  approved_by_list?: string[];
}

export interface MoaDuty {
  duty_id: string;
  ledger_id: string;
  category_id: string;
  category_name: string;
  mission_type: 'DUTY' | 'GOAL';
  duty_title: string;
  duty_description?: string;
  sub_category: string;
  rotation_policy: DutyRotationPolicy;
  cycle_config: DutyCycleConfig;
  approval_policy: DutyApprovalPolicy;
  duration_type: DutyDurationType;
  duration_end_date?: string;
  duration_target_count?: number;
  completed_count: number;
  can_substitute: boolean;
  participants: DutyParticipant[];

  // 직교 3상태머신
  current_assigned_participant_id?: string;
  current_assigned_name: string;
  next_due_date?: string;
  progress_status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  settlement_status: 'UNSETTLED' | 'SETTLED';
  evaluation_status: 'UNVERIFIED' | 'AUTO_APPROVED' | 'MANUAL_CONFIRMED';
  active_substitute_request?: DutySubstituteRequest;

  // 하위 호환 필드
  assigned_user_id?: string;
  assigned_name: string;
  is_guest: boolean;
  approval_required: boolean;
  status: 'ASSIGNED' | 'ENDED' | 'COMPLETED';
  proof_image_url?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface MoaAllowance {
  allowance_id: string;
  requester_id: string;
  requester_name: string;
  approver_id?: string;
  approver_name?: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED';
  created_at: string;
  paid_at?: string;
  payment_method?: 'KAKAO_PAY' | 'TOSS' | 'NAVER_PAY';
}

export interface MoaLoan {
  loan_id: string;
  lender_id: string;
  lender_name: string;
  borrower_id: string;
  borrower_name: string;
  amount: number;
  remaining_amount: number;
  due_date: string;
  status: 'ACTIVE' | 'PARTIAL_PAID' | 'FULLY_PAID' | 'OVERDUE';
  created_at: string;
  repayments: Array<{ date: string; amount: number; note: string }>;
}
