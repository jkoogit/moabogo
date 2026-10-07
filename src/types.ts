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

export interface MoaDuty {
  duty_id: string;
  ledger_id: string;
  duty_title: string;
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
