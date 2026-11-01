// ============================================================================
// 모아보고 거래계좌 하네스 스토어 풀 (External / Transaction Account Store Pool)
// SSOT: docs/04.데이터 / SCR-SET-01, SCR-QCK-01, SCR-LED-01 공유
// 도메인 원칙:
// - 복잡한 기업 거래처 대신 실생활 '거래계좌' 단위로 슬림화 관리
// - ELM-TRE-02 계층형 트리(상위/하위 뎁스) 기반 분류 체계
// - 계좌 용도 3단계: 기본 상속(Default Fallback) ➔ 개별 재정의(Override) ➔ 미사용(Kill-Switch)
// ============================================================================

import type { TreeNodeItem } from '../elements/Tokens';

// 1. 서비스별 계좌 용도 타입
export type AccountServiceType =
  | 'DEFAULT'     // 모든 서비스 기본 계좌 (단일 계좌 시 자동 상속)
  | 'ALLOWANCE'   // 용돈 수령/지급 전용
  | 'GOAL_CHEER'  // 모아목표 응원/송금 전용
  | 'LIVING'      // 가계부 생활비 결제/이체
  | 'MEETING';    // 모임/동호회 회비 정산

export const SERVICE_PURPOSE_LABELS: Record<AccountServiceType, { label: string; icon: string; desc: string }> = {
  DEFAULT: { label: '기본계좌', icon: '⭐', desc: '모든 서비스 기본 자동 적용' },
  ALLOWANCE: { label: '용돈송금', icon: '💰', desc: '가계부 용돈 수령/지급' },
  GOAL_CHEER: { label: '목표응원', icon: '🔥', desc: '모아목표 응원 송금' },
  LIVING: { label: '생활결제', icon: '🛒', desc: '생활비 및 장보기 결제' },
  MEETING: { label: '모임회비', icon: '👥', desc: '회비 및 1/N 정산' },
};

// 2. 거래계좌 엔티티 (슬림 4대 정보: 예금주/상호, 금융정보, 용도, 메모)
export interface ExternalTransactionAccount {
  id: string;
  folderId: string;             // 소속 트리 노드 ID (root 또는 하위 노드)
  accountHolder: string;        // 예금주 / 상호 (단일화 필수 필드)
  bankName: string;             // 은행명 (선택)
  accountNo: string;            // 계좌번호 (선택: Zero-Friction)
  depositor?: string;           // 예금주명 (선택: 계좌명칭/상호와 실 예금주가 다를 경우 지원)
  isDefault: boolean;           // 기본 계좌 여부 (미지정 서비스 자동 상속)
  assignedPurposes: AccountServiceType[]; // 적용된 용도 목록
  disabledServices: AccountServiceType[]; // '미사용' 킬스위치 서비스 목록 (예: ['GOAL_CHEER'])
  memo?: string;                // 메모/특이사항 (자동이체일 등)
  usageCount: number;           // 기장 빈도 (1초 자동완성 우선순위)
  lastUsedAt?: string;          // 최근 사용 일시
  createdAt: string;            // 등록일시
}

// ----------------------------------------------------------------------------
// 초기 계층형 트리 노드 Mock 데이터 (ELM-TRE-02 호환)
// ----------------------------------------------------------------------------
export const INITIAL_ACCOUNT_TREE_NODES: TreeNodeItem[] = [
  {
    id: 'root',
    name: '전체',
    icon: '📁',
    parentId: null,
    children: [
      {
        id: 'fld-edu',
        name: '교육/학원',
        icon: '🏫',
        parentId: 'root',
        children: [
          { id: 'fld-edu-math', name: '수학/과학', icon: '📐', parentId: 'fld-edu' },
          { id: 'fld-edu-lang', name: '어학/교습', icon: '🔤', parentId: 'fld-edu' },
        ],
      },
      {
        id: 'fld-living',
        name: '생활/마트',
        icon: '🛒',
        parentId: 'root',
      },
      {
        id: 'fld-health',
        name: '의료/건강',
        icon: '🏥',
        parentId: 'root',
      },
      {
        id: 'fld-club',
        name: '모임/회비',
        icon: '👥',
        parentId: 'root',
      },
      {
        id: 'fld-food',
        name: '단골/식음료',
        icon: '☕',
        parentId: 'root',
      },
      {
        id: 'fld-etc',
        name: '기타/비회원',
        icon: '🏢',
        parentId: 'root',
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// 초기 슬림 거래계좌 샘플 데이터
// ----------------------------------------------------------------------------
export const INITIAL_SLIM_ACCOUNTS: ExternalTransactionAccount[] = [
  {
    id: 'ext-acc-01',
    folderId: 'fld-edu-math',
    accountHolder: '대치 미래수학학원',
    bankName: '국민은행',
    accountNo: '123-45-678901',
    isDefault: false,
    assignedPurposes: ['ALLOWANCE'],
    disabledServices: [],
    memo: '매월 25일 자동이체 (원비 45만원)',
    usageCount: 15,
    lastUsedAt: '2026-10-25',
    createdAt: '2026-01-10',
  },
  {
    id: 'ext-acc-02',
    folderId: 'fld-edu-lang',
    accountHolder: '줄리아드 영어교습소',
    bankName: '신한은행',
    accountNo: '110-222-334455',
    isDefault: false,
    assignedPurposes: ['ALLOWANCE'],
    disabledServices: [],
    memo: '파닉스 교재비 포함',
    usageCount: 11,
    lastUsedAt: '2026-10-20',
    createdAt: '2026-02-12',
  },
  {
    id: 'ext-acc-03',
    folderId: 'fld-living',
    accountHolder: '(주)이마트 역삼점',
    bankName: '카카오뱅크',
    accountNo: '3333-01-2233445',
    isDefault: true,
    assignedPurposes: ['DEFAULT', 'LIVING'],
    disabledServices: [],
    memo: '주말 가족 식료품 장보기 (기본 생활비 출금)',
    usageCount: 29,
    lastUsedAt: '2026-10-31',
    createdAt: '2026-01-05',
  },
  {
    id: 'ext-acc-04',
    folderId: 'fld-health',
    accountHolder: '서울정형외과의원',
    bankName: '하나은행',
    accountNo: '202-910-112233',
    isDefault: false,
    assignedPurposes: ['LIVING'],
    disabledServices: ['GOAL_CHEER'], // 목표응원 미사용 킬스위치
    memo: '도수치료 실손청구 영수증 보관',
    usageCount: 7,
    lastUsedAt: '2026-10-18',
    createdAt: '2026-03-01',
  },
  {
    id: 'ext-acc-05',
    folderId: 'fld-club',
    accountHolder: '주말 러닝크루 (이총무)',
    bankName: '토스뱅크',
    accountNo: '1000-7788-9900',
    isDefault: false,
    assignedPurposes: ['MEETING'],
    disabledServices: [],
    memo: '분기별 회비 30,000원 납부',
    usageCount: 9,
    lastUsedAt: '2026-10-01',
    createdAt: '2026-01-20',
  },
  {
    id: 'ext-acc-06',
    folderId: 'fld-food',
    accountHolder: '동네 단골 반찬가게',
    bankName: 'NH농협',
    accountNo: '302-4455-6677-88',
    isDefault: false,
    assignedPurposes: ['LIVING'],
    disabledServices: [],
    memo: '반찬 4팩 만원 현금영수증 요청',
    usageCount: 18,
    lastUsedAt: '2026-10-28',
    createdAt: '2026-02-01',
  },
  {
    id: 'ext-acc-07',
    folderId: 'fld-food',
    accountHolder: '스타벅스 강남R점',
    bankName: '',
    accountNo: '',
    isDefault: false,
    assignedPurposes: ['LIVING'],
    disabledServices: ['GOAL_CHEER'],
    memo: '모바일 사이렌오더 간편결제 (Zero-Friction 계좌 미등록)',
    usageCount: 36,
    lastUsedAt: '2026-11-01',
    createdAt: '2026-01-02',
  },
  {
    id: 'ext-acc-08',
    folderId: 'fld-etc',
    accountHolder: '당근 중고거래 이체',
    bankName: '',
    accountNo: '',
    isDefault: false,
    assignedPurposes: ['DEFAULT'],
    disabledServices: [],
    memo: '동네 비회원 중고거래 정산',
    usageCount: 10,
    lastUsedAt: '2026-10-29',
    createdAt: '2026-03-15',
  },
];

// ----------------------------------------------------------------------------
// LocalStorage 키 상수
// ----------------------------------------------------------------------------
const STORAGE_KEY_TREE_NODES = 'moabogo_account_tree_nodes_v2';
const STORAGE_KEY_ACCOUNTS = 'moabogo_external_accounts_v2';

// ----------------------------------------------------------------------------
// 스토리지 조회 및 저장 헬퍼
// ----------------------------------------------------------------------------

export function loadAccountTreeNodes(): TreeNodeItem[] {
  if (typeof window === 'undefined') return INITIAL_ACCOUNT_TREE_NODES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TREE_NODES);
    let parsed: TreeNodeItem[] = raw ? JSON.parse(raw) : INITIAL_ACCOUNT_TREE_NODES;

    // 루트 노드 명칭 '전체' 무조건 강제 보정 (테스트 오염 방어)
    const sanitizeRoot = (items: TreeNodeItem[]) => {
      items.forEach((item) => {
        if (item.id === 'root') item.name = '전체';
        if (item.children) sanitizeRoot(item.children);
      });
    };
    sanitizeRoot(parsed);
    saveAccountTreeNodes(parsed);
    return parsed;
  } catch {
    return INITIAL_ACCOUNT_TREE_NODES;
  }
}

export function saveAccountTreeNodes(nodes: TreeNodeItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TREE_NODES, JSON.stringify(nodes));
  } catch (err) {
    console.error('Failed to save account tree nodes:', err);
  }
}

export function loadExternalAccounts(): ExternalTransactionAccount[] {
  if (typeof window === 'undefined') return INITIAL_SLIM_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_SLIM_ACCOUNTS));
      return INITIAL_SLIM_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SLIM_ACCOUNTS;
  }
}

export function saveExternalAccounts(accounts: ExternalTransactionAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save external accounts:', err);
  }
}

// ----------------------------------------------------------------------------
// 트리 노드별 소속 계좌 수 재귀 계산 헬퍼
// ----------------------------------------------------------------------------
export function attachCountsToTree(nodes: TreeNodeItem[], accounts: ExternalTransactionAccount[]): TreeNodeItem[] {
  return nodes.map((node) => {
    let count = 0;
    if (node.id === 'root') {
      count = accounts.length;
    } else {
      // 해당 노드 및 모든 하위 자식 노드에 속한 계좌 집계
      const getAllChildIds = (item: TreeNodeItem): string[] => {
        let ids = [item.id];
        if (item.children) {
          item.children.forEach((c) => {
            ids = ids.concat(getAllChildIds(c));
          });
        }
        return ids;
      };
      const scopeIds = new Set(getAllChildIds(node));
      count = accounts.filter((a) => scopeIds.has(a.folderId)).length;
    }

    const updatedChildren = node.children ? attachCountsToTree(node.children, accounts) : undefined;
    return {
      ...node,
      count,
      children: updatedChildren,
    };
  });
}

// ----------------------------------------------------------------------------
// 트리 노드 CRUD & DnD 이동 헬퍼
// ----------------------------------------------------------------------------

export function addTreeNode(parentId: string, name: string, icon = '📁'): TreeNodeItem[] {
  const tree = loadAccountTreeNodes();
  const newNode: TreeNodeItem = {
    id: `node-${Date.now()}`,
    name,
    icon,
    parentId,
    children: [],
  };

  const insertRecursive = (items: TreeNodeItem[]): boolean => {
    for (const item of items) {
      if (item.id === parentId) {
        item.children = item.children ? [...item.children, newNode] : [newNode];
        return true;
      }
      if (item.children && insertRecursive(item.children)) {
        return true;
      }
    }
    return false;
  };

  insertRecursive(tree);
  saveAccountTreeNodes(tree);
  return tree;
}

export function updateTreeNode(nodeId: string, newName: string): TreeNodeItem[] {
  if (nodeId === 'root') return loadAccountTreeNodes(); // 루트 노드 이름 변경 불가
  const tree = loadAccountTreeNodes();

  const updateRecursive = (items: TreeNodeItem[]): boolean => {
    for (const item of items) {
      if (item.id === nodeId) {
        item.name = newName;
        return true;
      }
      if (item.children && updateRecursive(item.children)) {
        return true;
      }
    }
    return false;
  };

  updateRecursive(tree);
  saveAccountTreeNodes(tree);
  return tree;
}

export function deleteTreeNode(nodeId: string): { success: boolean; reason?: string } {
  if (nodeId === 'root') return { success: false, reason: '루트 노드는 삭제할 수 없습니다.' };

  const tree = loadAccountTreeNodes();
  const accounts = loadExternalAccounts();

  // 2.6.6 하위 노드나 하위 노드 내 컨텐츠(계좌) 존재 시 삭제 제한
  const hasAccounts = accounts.some((a) => a.folderId === nodeId);
  if (hasAccounts) {
    return { success: false, reason: '소속된 거래계좌가 존재하여 삭제할 수 없습니다. 먼저 계좌를 다른 폴더로 이동해주세요.' };
  }

  let foundNode: TreeNodeItem | null = null;
  const findNode = (items: TreeNodeItem[]) => {
    for (const item of items) {
      if (item.id === nodeId) {
        foundNode = item;
        return;
      }
      if (item.children) findNode(item.children);
    }
  };
  findNode(tree);

  if (foundNode && (foundNode as TreeNodeItem).children && (foundNode as TreeNodeItem).children!.length > 0) {
    return { success: false, reason: '하위 폴더가 존재하여 삭제할 수 없습니다. 하위 폴더를 먼저 정리해주세요.' };
  }

  // 삭제 수행
  const removeRecursive = (items: TreeNodeItem[]): TreeNodeItem[] => {
    return items
      .filter((item) => item.id !== nodeId)
      .map((item) => ({
        ...item,
        children: item.children ? removeRecursive(item.children) : undefined,
      }));
  };

  const nextTree = removeRecursive(tree);
  saveAccountTreeNodes(nextTree);
  return { success: true };
}

export function moveTreeNode(
  draggedId: string,
  targetId: string,
  position: 'inside' | 'before' | 'after'
): TreeNodeItem[] {
  if (draggedId === targetId || draggedId === 'root') return loadAccountTreeNodes();

  const tree = loadAccountTreeNodes();
  let draggedNode: TreeNodeItem | null = null;

  // 1. 드래그 노드 추출 및 분리
  const removeRecursive = (items: TreeNodeItem[]): TreeNodeItem[] => {
    return items
      .filter((item) => {
        if (item.id === draggedId) {
          draggedNode = item;
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? removeRecursive(item.children) : undefined,
      }));
  };

  let nextTree = removeRecursive(tree);
  if (!draggedNode) return tree;

  // 2. 타겟 위치에 삽입
  const insertRecursive = (items: TreeNodeItem[]): TreeNodeItem[] => {
    const result: TreeNodeItem[] = [];
    for (const item of items) {
      if (item.id === targetId) {
        if (position === 'before') {
          draggedNode!.parentId = item.parentId || 'root';
          result.push(draggedNode!);
          result.push(item);
        } else if (position === 'after') {
          draggedNode!.parentId = item.parentId || 'root';
          result.push(item);
          result.push(draggedNode!);
        } else {
          // inside
          draggedNode!.parentId = item.id;
          item.children = item.children ? [...item.children, draggedNode!] : [draggedNode!];
          result.push(item);
        }
      } else {
        if (item.children) {
          item.children = insertRecursive(item.children);
        }
        result.push(item);
      }
    }
    return result;
  };

  nextTree = insertRecursive(nextTree);
  saveAccountTreeNodes(nextTree);
  return nextTree;
}

// ----------------------------------------------------------------------------
// 거래계좌 검색 및 Fallback/Kill-Switch 조회 헬퍼
// ----------------------------------------------------------------------------

export function searchExternalAccounts(query: string, folderId = 'root'): ExternalTransactionAccount[] {
  const accounts = loadExternalAccounts();
  const trimmed = query.trim().toLowerCase();

  // 폴더 스코프 필터링 (root는 전체)
  let scoped = accounts;
  if (folderId !== 'root') {
    const tree = loadAccountTreeNodes();
    const getAllScopeIds = (items: TreeNodeItem[], target: string): string[] => {
      for (const item of items) {
        if (item.id === target) {
          const ids = [item.id];
          const collect = (c: TreeNodeItem) => {
            ids.push(c.id);
            if (c.children) c.children.forEach(collect);
          };
          if (item.children) item.children.forEach(collect);
          return ids;
        }
        if (item.children) {
          const res = getAllScopeIds(item.children, target);
          if (res.length > 0) return res;
        }
      }
      return [target];
    };
    const allowedFolderIds = new Set(getAllScopeIds(tree, folderId));
    scoped = accounts.filter((a) => allowedFolderIds.has(a.folderId));
  }

  if (!trimmed) {
    return [...scoped].sort((a, b) => b.usageCount - a.usageCount);
  }

  return scoped
    .filter(
      (acc) =>
        acc.accountHolder.toLowerCase().includes(trimmed) ||
        acc.bankName.toLowerCase().includes(trimmed) ||
        acc.accountNo.includes(trimmed) ||
        (acc.depositor && acc.depositor.toLowerCase().includes(trimmed)) ||
        (acc.memo && acc.memo.toLowerCase().includes(trimmed))
    )
    .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * 💡 핵심 Fallback 및 미사용 킬스위치 조회:
 * - 서비스(service)에 대해 전용 지정 계좌가 있으면 그 계좌 반환
 * - 전용 계좌가 없으면 기본 계좌(isDefault) 반환 (Fallback)
 * - 만약 해당 서비스가 disabledServices에 포함되어 있다면 null 반환 (Kill-Switch: 화면 버튼 숨김)
 */
export function getServiceActiveAccount(
  service: AccountServiceType
): { account: ExternalTransactionAccount | null; isKillSwitched: boolean } {
  const accounts = loadExternalAccounts();

  // 1. 미사용 킬스위치 확인 (하나라도 기본/해당 서비스 계좌에서 미사용 처리되어 있는지)
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0] || null;
  const targetAccount = accounts.find((a) => a.assignedPurposes.includes(service));

  const effective = targetAccount || defaultAccount;
  if (!effective) return { account: null, isKillSwitched: false };

  if (effective.disabledServices.includes(service)) {
    return { account: null, isKillSwitched: true };
  }

  return { account: effective, isKillSwitched: false };
}

export function addExternalAccount(
  data: Omit<ExternalTransactionAccount, 'id' | 'createdAt' | 'usageCount'>
): ExternalTransactionAccount {
  const accounts = loadExternalAccounts();
  const newAccount: ExternalTransactionAccount = {
    ...data,
    id: `ext-acc-${Date.now()}`,
    usageCount: 1,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  // 만약 새 계좌가 기본 계좌로 지정되면 기존 계좌들의 isDefault는 해제
  let updated = [newAccount, ...accounts];
  if (newAccount.isDefault) {
    updated = updated.map((a) => (a.id === newAccount.id ? a : { ...a, isDefault: false }));
  }

  saveExternalAccounts(updated);
  return newAccount;
}

export function updateExternalAccount(updatedAcc: ExternalTransactionAccount): void {
  const accounts = loadExternalAccounts();
  let next = accounts.map((acc) => (acc.id === updatedAcc.id ? updatedAcc : acc));
  if (updatedAcc.isDefault) {
    next = next.map((a) => (a.id === updatedAcc.id ? a : { ...a, isDefault: false }));
  }
  saveExternalAccounts(next);
}

export function deleteExternalAccount(id: string): void {
  const accounts = loadExternalAccounts();
  const next = accounts.filter((acc) => acc.id !== id);
  saveExternalAccounts(next);
}

export function recordAccountUsage(accountId: string): void {
  const accounts = loadExternalAccounts();
  const next = accounts.map((acc) =>
    acc.id === accountId
      ? {
          ...acc,
          usageCount: acc.usageCount + 1,
          lastUsedAt: new Date().toISOString().slice(0, 10),
        }
      : acc
  );
  saveExternalAccounts(next);
}

export function maskExternalAccountNo(accountNo: string): string {
  if (!accountNo) return '';
  const clean = accountNo.replace(/\s+/g, '');
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  return `${start}-****-${end}`;
}
