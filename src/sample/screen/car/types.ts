export type VehicleFuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'EV' | 'LPG';

export interface Vehicle {
  vehicle_id: string;
  owner_user_id: string;
  shared_ledger_id?: string;
  nickname: string;
  plate_number: string; // 마스킹 렌더링 지원 (예: 12가 34**)
  manufacturer: string;
  model_name: string;
  model_year: number;
  fuel_type: VehicleFuelType;
  current_odometer_km: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type VehicleLogType = 'FUEL' | 'INSPECTION' | 'REPAIR' | 'WASH' | 'INSURANCE' | 'PARKING';

export type PaymentMethodType = 'CREDIT_CARD' | 'CHECK_CARD' | 'CASH' | 'TRANSFER' | 'LOCAL_PAY' | 'OTHER';

export interface VehicleLogMeta {
  // FUEL
  unit_price?: number;
  volume_liters?: number;
  is_full_tank?: boolean;
  calc_efficiency_km_per_l?: number;
  // INSPECTION / REPAIR
  parts_replaced?: string[];
  warranty_until?: string;
  // WASH
  wash_type?: 'SELF' | 'AUTOMATIC' | 'HAND' | 'DETAILING';
  // INSURANCE
  insurance_company?: string;
  policy_start_date?: string;
  policy_end_date?: string;
  emergency_tel?: string;
  // PARKING
  parking_zone?: string; // 예: 지하 3층 G-12 기둥
  is_monthly_pass?: boolean;
  exit_time?: string;
  // 기타 공통
  photo_proof_url?: string;
}

export interface VehicleLog {
  log_id: string;
  vehicle_id: string;
  user_id: string;
  log_type: VehicleLogType;
  occurred_at: string; // YYYY-MM-DD
  odometer_km?: number;
  amount: number;
  payment_method: PaymentMethodType;
  vendor_name: string;
  summary: string;
  detail_memo?: string;
  meta: VehicleLogMeta;
  linked_expense_id?: string; // SCR-LED-01 1:1 매핑 ID (이중계상 차단)
  sync_to_day?: boolean; // 모아데이 캘린더 등록 여부 (사용자 설정 대상만 반영)
  is_duplicate_suspected?: boolean; // 지출일자+수단+금액 동일 의심 플래그
  linked_primary_source_id?: string; // 다른 지출이 원본인 경우 해당 원본 ID (사본 표시용)
  linked_replica_entries?: {
    source_type: 'LEDGER_EXPENSE' | 'CARD_STATEMENT' | 'CAR_LOG';
    source_id: string;
    source_title: string;
    description: string;
  }[]; // 이 건이 원본이고 연결된 사본 지출 목록
  created_at: string;
}

export type MaintenanceFsmStatus = 'SAFE' | 'CHECK_SOON' | 'IMMINENT' | 'URGENT' | 'OVERDUE';

export interface VehicleMaintenanceRule {
  rule_id: string;
  vehicle_id: string;
  rule_type: 'ENGINE_OIL' | 'AIR_FILTER' | 'TIRE_ROTATION' | 'LEGAL_INSPECTION' | 'INSURANCE_RENEWAL' | 'PARKING_PASS';
  title: string;
  interval_months?: number;
  interval_km?: number;
  last_done_date?: string;
  last_done_odometer_km?: number;
  next_due_date?: string;
  next_due_odometer_km?: number;
  sync_to_routine: boolean;
  sync_to_day: boolean; // 사용자 설정에서 허용한 대상만 모아데이에 투영
  is_active: boolean;
}

export type CarFilterTab = 'ALL' | 'FUEL' | 'INSPECTION' | 'REPAIR' | 'WASH' | 'INSURANCE' | 'PARKING';

// 지출일자 + 결제수단 + 금액 기준 중복 의심 후보 모델 (원자성 유지 & 수동 정리 프로세스용)
export interface DuplicateExpenseCandidate {
  candidate_id: string;
  occurred_date: string;
  payment_method: PaymentMethodType;
  amount: number;
  entries: {
    source_type: 'LEDGER_EXPENSE' | 'CARD_STATEMENT' | 'CAR_LOG';
    source_id: string;
    source_title: string;
    description: string;
    created_at: string;
    is_primary?: boolean;
    primary_source_id?: string;
  }[];
  is_resolved: boolean;
  resolution_type?: 'MERGE_TO_CAR' | 'KEEP_SEPARATE' | 'DISMISS';
  primary_entry_id?: string; // 원본으로 지정된 항목의 source_id
}

// 사용자 설정 내 모아부릉 연동 설정 모델
export interface CarUserSettings {
  sync_to_day_targets: ('INSURANCE' | 'LEGAL_INSPECTION' | 'CONSUMABLES' | 'PARKING_PASS')[];
  auto_reconcile_duplicates: boolean;
  privacy_mask_plate_number: boolean;
}
