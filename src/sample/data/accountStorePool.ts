// ============================================================================
// 모아보고 공통 계좌 저장소 풀 (Account Store Pool)
// SSOT: docs/04.데이터 / SCR-SET-01, SCR-LED-01, SCR-GOL-02, SCR-DSH-01 공유
// ============================================================================

export type AccountServicePurpose =
  | 'GOAL_ALLOWANCE' // 목표 달성 보상 및 용돈
  | 'LEDGER_LIVING'  // 가계부 생활비 지출/수입
  | 'SETTLE_MONEY'   // 모아머니 정산 및 회비
  | 'GENERAL';       // 일반 예비 계좌

export interface UserBankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNo: string;
  accountHolder: string;
  alias: string;
  isDefault: boolean;
  assignedPurposes: AccountServicePurpose[];
  createdAt: string;
}

export interface RepresentativeAccountInfo {
  bankName: string;
  accountNo: string;
  accountHolder: string;
  isUserLinked?: boolean;
  userAccountId?: string;
}

export interface LedgerAllowanceMember {
  ledgerId: string;
  memberId: string;
  memberName: string;
  isAllowanceTarget: boolean;
  paymentMethod: 'ACCOUNT' | 'CASH'; // 계좌송금 vs 현금수기지급
  representativeAccount?: RepresentativeAccountInfo;
  memo?: string;
}

// ----------------------------------------------------------------------------
// 초기 Mock 데이터
// ----------------------------------------------------------------------------

export const INITIAL_USER_ACCOUNTS: UserBankAccount[] = [
  {
    id: 'acc-koo-01',
    userId: 'u-1001-koo',
    bankName: '카카오뱅크',
    accountNo: '3333-01-9988776',
    accountHolder: '구본영',
    alias: '생활비 주거래 통장',
    isDefault: true,
    assignedPurposes: ['LEDGER_LIVING', 'SETTLE_MONEY'],
    createdAt: '2026-01-10',
  },
  {
    id: 'acc-koo-02',
    userId: 'u-1001-koo',
    bankName: '토스뱅크',
    accountNo: '1000-2233-4455',
    accountHolder: '구본영',
    alias: '목표 보상·비상금 통장',
    isDefault: false,
    assignedPurposes: ['GOAL_ALLOWANCE'],
    createdAt: '2026-02-15',
  },
  {
    id: 'acc-lee-01',
    userId: 'u-1002-lee',
    bankName: '신한은행',
    accountNo: '110-334-556677',
    accountHolder: '이지은',
    alias: '급여 통장',
    isDefault: true,
    assignedPurposes: ['LEDGER_LIVING'],
    createdAt: '2026-01-15',
  },
  {
    id: 'acc-minwoo-01',
    userId: 'u-1003-minwoo',
    bankName: '토스뱅크',
    accountNo: '1000-8821-3942',
    accountHolder: '구민우',
    alias: '민우 토스유스 용돈계좌',
    isDefault: true,
    assignedPurposes: ['GOAL_ALLOWANCE'],
    createdAt: '2026-03-01',
  },
  // 참고: 구서연(u-1004-seoyeon)은 등록 계좌 없음 (현금 수령 테스트 케이스)
];

export const INITIAL_LEDGER_ALLOWANCE_MEMBERS: LedgerAllowanceMember[] = [
  {
    ledgerId: 'led-group-01',
    memberId: 'm-koo',
    memberName: '구본영(나)',
    isAllowanceTarget: false,
    paymentMethod: 'ACCOUNT',
  },
  {
    ledgerId: 'led-group-01',
    memberId: 'm-lee',
    memberName: '이지은(배우자)',
    isAllowanceTarget: false,
    paymentMethod: 'ACCOUNT',
  },
  {
    ledgerId: 'led-group-01',
    memberId: 'c3', // 모아목표 동행원 ID와 매핑
    memberName: '구민우(자녀)',
    isAllowanceTarget: true,
    paymentMethod: 'ACCOUNT',
    representativeAccount: {
      bankName: '토스뱅크',
      accountNo: '1000-8821-3942',
      accountHolder: '구민우',
      isUserLinked: true,
      userAccountId: 'acc-minwoo-01',
    },
    memo: '매주 일요일 목표 달성 시 이체',
  },
  {
    ledgerId: 'led-group-01',
    memberId: 'c4',
    memberName: '구서연(자녀)',
    isAllowanceTarget: true,
    paymentMethod: 'CASH',
    memo: '스마트폰 미사용 - 현금 직접 지급',
  },
];

// ----------------------------------------------------------------------------
// LocalStorage 영속화 및 조회 헬퍼
// ----------------------------------------------------------------------------

const USER_ACCOUNTS_STORAGE_KEY = 'moabogo_user_bank_accounts_v1';
const LEDGER_MEMBERS_STORAGE_KEY = 'moabogo_ledger_allowance_members_v1';

export const loadUserBankAccounts = (userId: string = 'u-1001-koo'): UserBankAccount[] => {
  if (typeof window === 'undefined') return INITIAL_USER_ACCOUNTS.filter((a) => a.userId === userId);
  try {
    const raw = localStorage.getItem(USER_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
      return INITIAL_USER_ACCOUNTS.filter((a) => a.userId === userId);
    }
    const parsed: UserBankAccount[] = JSON.parse(raw);
    return parsed.filter((a) => a.userId === userId);
  } catch (e) {
    console.error('Failed to load user bank accounts from localStorage:', e);
    return INITIAL_USER_ACCOUNTS.filter((a) => a.userId === userId);
  }
};

export const saveUserBankAccounts = (accounts: UserBankAccount[], userId: string = 'u-1001-koo'): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(USER_ACCOUNTS_STORAGE_KEY);
    const existing: UserBankAccount[] = raw ? JSON.parse(raw) : INITIAL_USER_ACCOUNTS;
    const filtered = existing.filter((a) => a.userId !== userId);
    const updated = [...filtered, ...accounts];
    localStorage.setItem(USER_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save user bank accounts to localStorage:', e);
  }
};

export const loadAllUserBankAccounts = (): UserBankAccount[] => {
  if (typeof window === 'undefined') return INITIAL_USER_ACCOUNTS;
  try {
    const raw = localStorage.getItem(USER_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
      return INITIAL_USER_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USER_ACCOUNTS;
  }
};

export const loadLedgerAllowanceMembers = (ledgerId: string = 'led-group-01'): LedgerAllowanceMember[] => {
  if (typeof window === 'undefined') return INITIAL_LEDGER_ALLOWANCE_MEMBERS.filter((m) => m.ledgerId === ledgerId);
  try {
    const raw = localStorage.getItem(LEDGER_MEMBERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEDGER_MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_LEDGER_ALLOWANCE_MEMBERS));
      return INITIAL_LEDGER_ALLOWANCE_MEMBERS.filter((m) => m.ledgerId === ledgerId);
    }
    const parsed: LedgerAllowanceMember[] = JSON.parse(raw);
    return parsed.filter((m) => m.ledgerId === ledgerId);
  } catch (e) {
    console.error('Failed to load ledger allowance members from localStorage:', e);
    return INITIAL_LEDGER_ALLOWANCE_MEMBERS.filter((m) => m.ledgerId === ledgerId);
  }
};

export const saveLedgerAllowanceMembers = (ledgerId: string, members: LedgerAllowanceMember[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LEDGER_MEMBERS_STORAGE_KEY);
    const existing: LedgerAllowanceMember[] = raw ? JSON.parse(raw) : INITIAL_LEDGER_ALLOWANCE_MEMBERS;
    const filtered = existing.filter((m) => m.ledgerId !== ledgerId);
    const updated = [...filtered, ...members];
    localStorage.setItem(LEDGER_MEMBERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save ledger allowance members to localStorage:', e);
  }
};

/**
 * 특정 구성원(자녀 등)의 대표 계좌 조회 헬퍼
 */
export const getMemberAllowanceAccount = (
  ledgerId: string,
  memberIdOrName: string
): {
  hasAccount: boolean;
  account?: RepresentativeAccountInfo;
  paymentMethod: 'ACCOUNT' | 'CASH';
  isAllowanceTarget: boolean;
} => {
  const members = loadLedgerAllowanceMembers(ledgerId);
  const found = members.find(
    (m) =>
      m.memberId === memberIdOrName ||
      m.memberName === memberIdOrName ||
      m.memberName.includes(memberIdOrName) ||
      memberIdOrName.includes(m.memberName.replace(/\(.*\)/, ''))
  );

  if (!found || !found.isAllowanceTarget) {
    return { hasAccount: false, paymentMethod: 'CASH', isAllowanceTarget: false };
  }

  if (found.paymentMethod === 'ACCOUNT' && found.representativeAccount && found.representativeAccount.accountNo) {
    return {
      hasAccount: true,
      account: found.representativeAccount,
      paymentMethod: 'ACCOUNT',
      isAllowanceTarget: true,
    };
  }

  return {
    hasAccount: false,
    paymentMethod: found.paymentMethod,
    isAllowanceTarget: true,
  };
};

/**
 * 로그인 사용자의 기본 대표계좌 조회 헬퍼
 */
export const getCurrentUserDefaultAccount = (userId: string = 'u-1001-koo'): UserBankAccount | null => {
  const accounts = loadUserBankAccounts(userId);
  if (accounts.length === 0) return null;
  return accounts.find((a) => a.isDefault) || accounts[0];
};

/**
 * 계좌번호 마스킹 (프라이버시 보호)
 * 예: 3333-01-9988776 -> 3333-01-***8776
 */
export const maskAccountNo = (accountNo: string): string => {
  if (!accountNo) return '';
  const cleaned = accountNo.trim();
  if (cleaned.length <= 6) return cleaned;
  const start = cleaned.slice(0, Math.min(8, Math.floor(cleaned.length / 2)));
  const end = cleaned.slice(-4);
  return `${start}***${end}`;
};
