// ============================================================================
// 모아보고 오프라인 동기화 큐 저장소 (Offline Queue Store)
// SSOT: IndexedDB / LocalStorage 기반 멱등키(idempotency_key) 보장 큐
// 지원: 모아게임 지출 기안, 오프라인 영수증 등록, 당번 인증의 원자적 일괄 동기화
// ============================================================================

export interface OfflineQueueItem {
  id: string;
  idempotencyKey: string;
  type: 'LEDGER_EXPENSE' | 'DUTY_RECORD' | 'GOAL_RECORD' | 'GENERAL';
  title: string;
  amount: number;
  ledgerName?: string;
  payerName?: string;
  category?: string;
  memo?: string;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'STALE_CONFLICT';
  retryCount: number;
}

const STORAGE_KEY = 'moabogo_offline_queue';

// 기본 시뮬레이션 초기 큐
const INITIAL_QUEUE_ITEMS: OfflineQueueItem[] = [
  {
    id: 'q-seed-1',
    idempotencyKey: 'idemp_seed_exp_001',
    type: 'LEDGER_EXPENSE',
    title: '현금 지출: 편의점 생수 (오프라인 수동입력)',
    amount: 1800,
    ledgerName: '내 개인 가계부 (기본)',
    payerName: '구본영(나)',
    category: '식비/간식',
    memo: '통신 불량 상태에서 수동 현금 기장',
    timestamp: '2026-10-06 18:40',
    status: 'PENDING',
    retryCount: 0,
  },
  {
    id: 'q-seed-2',
    idempotencyKey: 'idemp_seed_dut_002',
    type: 'DUTY_RECORD',
    title: '모아당번 수행 사진 (오프라인 캐시)',
    amount: 0,
    ledgerName: '우리집 가계부 (가족 공유)',
    payerName: '구본영 팀장',
    category: '당번인증',
    memo: '지하 주차장 분리수거 사진 임시 캐시',
    timestamp: '2026-10-06 18:45',
    status: 'PENDING',
    retryCount: 0,
  },
];

function notifyQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('moabogo:offline-queue-changed'));
  }
}

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return INITIAL_QUEUE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUEUE_ITEMS));
      return INITIAL_QUEUE_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('getOfflineQueue error:', err);
    return INITIAL_QUEUE_ITEMS;
  }
}

export function addOfflineQueueItem(
  data: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
): OfflineQueueItem {
  const current = getOfflineQueue();
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newItem: OfflineQueueItem = {
    ...data,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp,
    status: 'PENDING',
    retryCount: 0,
  };

  const next = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notifyQueueChange();
  } catch (err) {
    console.error('addOfflineQueueItem error:', err);
  }
  return newItem;
}

export function syncOfflineQueue(): {
  syncedCount: number;
  conflictCount: number;
  items: OfflineQueueItem[];
} {
  const current = getOfflineQueue();
  let syncedCount = 0;
  let conflictCount = 0;

  const next = current.map((item) => {
    if (item.status === 'PENDING') {
      // seed-1 항목은 Stale 충돌 시뮬레이션을 위해 STALE_CONFLICT로 처리
      if (item.id === 'q-seed-1') {
        conflictCount++;
        return { ...item, status: 'STALE_CONFLICT' as const, retryCount: item.retryCount + 1 };
      }
      syncedCount++;
      return { ...item, status: 'SYNCED' as const };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notifyQueueChange();
  } catch (err) {
    console.error('syncOfflineQueue error:', err);
  }

  return { syncedCount, conflictCount, items: next };
}

export function resolveOfflineConflict(id: string, action: 'OVERWRITE' | 'DISCARD'): void {
  const current = getOfflineQueue();
  let next: OfflineQueueItem[];

  if (action === 'DISCARD') {
    next = current.filter((item) => item.id !== id);
  } else {
    next = current.map((item) =>
      item.id === id ? { ...item, status: 'SYNCED' as const } : item
    );
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notifyQueueChange();
  } catch (err) {
    console.error('resolveOfflineConflict error:', err);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyQueueChange();
  } catch (err) {
    console.error('clearOfflineQueue error:', err);
  }
}

export function getPendingCount(): number {
  const list = getOfflineQueue();
  return list.filter((i) => i.status === 'PENDING').length;
}
