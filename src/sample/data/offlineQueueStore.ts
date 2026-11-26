// ============================================================================
// 모아보고 오프라인 동기화 큐 저장소 (IndexedDB + LocalStorage 미러 폴백)
// SSOT: IndexedDB(moabogo_sync_db) 기반 멱등키(idempotency_key) 및 LWW 버전 메타 보장 큐
// 지원: 모아게임 지출 기안, 오프라인 영수증/당번 등록, apiClient 오프라인 Mutation 일괄 동기화
// ============================================================================

export type OfflineQueueEntityType = 'LEDGER_EXPENSE' | 'DUTY_RECORD' | 'GOAL_RECORD' | 'GENERAL';
export type OfflineQueueOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type OfflineQueueStatus = 'PENDING' | 'SYNCED' | 'STALE_CONFLICT';
export type OfflineConflictResolution = 'MANUAL_OVERWRITE' | 'AUTO_OVERWRITE' | 'DISCARDED';

export interface OfflineQueueItem {
  id: string;
  idempotencyKey: string;
  type: OfflineQueueEntityType;
  operationType?: OfflineQueueOperationType;
  entityId?: string;
  title: string;
  amount: number;
  ledgerName?: string;
  payerName?: string;
  category?: string;
  memo?: string;
  timestamp: string;
  clientVersion?: number;
  clientUpdatedAtMs?: number;
  serverVersion?: number;
  serverUpdatedAtMs?: number;
  conflictReason?: string;
  conflictResolution?: OfflineConflictResolution;
  requestUrl?: string;
  requestMethod?: string;
  payload?: unknown;
  status: OfflineQueueStatus;
  retryCount: number;
}

const IDB_NAME = 'moabogo_sync_db';
const IDB_VERSION = 1;
const IDB_STORE = 'offline_sync_queue';
const IDB_RECORD_KEY = 'queue_items';
const STORAGE_KEY = 'moabogo_offline_queue';
export const OFFLINE_QUEUE_CHANGED_EVENT = 'moabogo:offline-queue-changed';

// 기본 시뮬레이션 초기 큐 (LWW Stale 충돌 검증용 v1 시드 포함)
const INITIAL_QUEUE_ITEMS: OfflineQueueItem[] = [
  {
    id: 'q-seed-1',
    idempotencyKey: 'idemp_seed_exp_001',
    type: 'LEDGER_EXPENSE',
    operationType: 'UPDATE',
    entityId: 'tx-seed-conflict',
    title: '현금 지출: 편의점 생수 (오프라인 수동입력)',
    amount: 1800,
    ledgerName: '내 개인 가계부 (기본)',
    payerName: '구본영(나)',
    category: '식비/간식',
    memo: '통신 불량 상태에서 수동 현금 기장',
    timestamp: '2026-10-06 18:40',
    clientVersion: 1,
    clientUpdatedAtMs: 1791312000000,
    status: 'PENDING',
    retryCount: 0,
  },
  {
    id: 'q-seed-2',
    idempotencyKey: 'idemp_seed_dut_002',
    type: 'DUTY_RECORD',
    operationType: 'CREATE',
    entityId: 'duty-seed-002',
    title: '모아당번 수행 사진 (오프라인 캐시)',
    amount: 0,
    ledgerName: '우리집 가계부 (가족 공유)',
    payerName: '구본영 팀장',
    category: '당번인증',
    memo: '지하 주차장 분리수거 사진 임시 캐시',
    timestamp: '2026-10-06 18:45',
    clientVersion: 1,
    clientUpdatedAtMs: 1791312300000,
    status: 'PENDING',
    retryCount: 0,
  },
];

function notifyQueueChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OFFLINE_QUEUE_CHANGED_EVENT));
  }
}

function normalizeQueueItem(raw: Partial<OfflineQueueItem>): OfflineQueueItem {
  return {
    id: raw.id || `q-${Date.now()}`,
    idempotencyKey: raw.idempotencyKey || `idemp_${Date.now()}`,
    type: raw.type || 'GENERAL',
    operationType: raw.operationType || 'CREATE',
    entityId: raw.entityId,
    title: raw.title || '오프라인 대기 작업',
    amount: typeof raw.amount === 'number' ? raw.amount : 0,
    ledgerName: raw.ledgerName,
    payerName: raw.payerName,
    category: raw.category,
    memo: raw.memo,
    timestamp: raw.timestamp || formatNowTimestamp(),
    clientVersion: typeof raw.clientVersion === 'number' ? raw.clientVersion : 1,
    clientUpdatedAtMs:
      typeof raw.clientUpdatedAtMs === 'number' ? raw.clientUpdatedAtMs : Date.now(),
    serverVersion: raw.serverVersion,
    serverUpdatedAtMs: raw.serverUpdatedAtMs,
    conflictReason: raw.conflictReason,
    conflictResolution: raw.conflictResolution,
    requestUrl: raw.requestUrl,
    requestMethod: raw.requestMethod,
    payload: raw.payload,
    status: raw.status || 'PENDING',
    retryCount: typeof raw.retryCount === 'number' ? raw.retryCount : 0,
  };
}

function formatNowTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
}

function openSyncDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeQueueToIDB(items: OfflineQueueItem[]): Promise<void> {
  const db = await openSyncDatabase();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(items, IDB_RECORD_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    db.close();
  }
}

function writeMirrorToLocalStorage(items: OfflineQueueItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('writeMirrorToLocalStorage error:', err);
  }
}

export function replaceOfflineQueue(items: OfflineQueueItem[]): OfflineQueueItem[] {
  const normalized = items.map(normalizeQueueItem);
  writeMirrorToLocalStorage(normalized);
  void writeQueueToIDB(normalized);
  notifyQueueChange();
  return normalized;
}

export async function hydrateOfflineQueueFromIDB(): Promise<OfflineQueueItem[]> {
  const db = await openSyncDatabase();
  if (!db) return getOfflineQueue();

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_RECORD_KEY);
      req.onsuccess = () => {
        db.close();
        const result = req.result as OfflineQueueItem[] | undefined;
        if (Array.isArray(result)) {
          const normalized = result.map(normalizeQueueItem);
          writeMirrorToLocalStorage(normalized);
          resolve(normalized);
        } else {
          const cached = getOfflineQueue();
          void writeQueueToIDB(cached);
          resolve(cached);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(getOfflineQueue());
      };
    } catch {
      db.close();
      resolve(getOfflineQueue());
    }
  });
}

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return INITIAL_QUEUE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeMirrorToLocalStorage(INITIAL_QUEUE_ITEMS);
      void writeQueueToIDB(INITIAL_QUEUE_ITEMS);
      return INITIAL_QUEUE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_QUEUE_ITEMS;
    return parsed.map(normalizeQueueItem);
  } catch (err) {
    console.error('getOfflineQueue error:', err);
    return INITIAL_QUEUE_ITEMS;
  }
}

export function addOfflineQueueItem(
  data: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
): OfflineQueueItem {
  const current = getOfflineQueue();
  // 클라이언트 멱등성 보장: 동일 idempotencyKey 항목 중복 적재 차단
  const existing = current.find((item) => item.idempotencyKey === data.idempotencyKey);
  if (existing) {
    return existing;
  }

  const newItem = normalizeQueueItem({
    ...data,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: formatNowTimestamp(),
    clientVersion: data.clientVersion ?? 1,
    clientUpdatedAtMs: data.clientUpdatedAtMs ?? Date.now(),
    status: 'PENDING',
    retryCount: 0,
  });

  const next = [newItem, ...current];
  replaceOfflineQueue(next);
  return newItem;
}

/**
 * 오프라인 로컬 폴백 동기화 (서버 미연결 시 테스트/시뮬레이션용)
 */
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
      if (item.id === 'q-seed-1') {
        conflictCount++;
        return {
          ...item,
          status: 'STALE_CONFLICT' as const,
          serverVersion: (item.clientVersion || 1) + 1,
          serverUpdatedAtMs: Date.now(),
          conflictReason: '다른 기기에서 동일 가계부 내역이 이미 대사/수정되었습니다.',
          retryCount: item.retryCount + 1,
        };
      }
      syncedCount++;
      return { ...item, status: 'SYNCED' as const };
    }
    return item;
  });

  replaceOfflineQueue(next);
  return { syncedCount, conflictCount, items: next };
}

export function resolveOfflineConflict(id: string, action: 'OVERWRITE' | 'DISCARD'): void {
  const current = getOfflineQueue();
  const next =
    action === 'DISCARD'
      ? current.filter((item) => item.id !== id)
      : current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'SYNCED' as const,
                clientVersion: Math.max((item.clientVersion || 1) + 1, (item.serverVersion || 1) + 1),
                conflictResolution: 'MANUAL_OVERWRITE' as const,
              }
            : item
        );

  replaceOfflineQueue(next);
}

export function clearOfflineQueue(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    void writeQueueToIDB([]);
    notifyQueueChange();
  } catch (err) {
    console.error('clearOfflineQueue error:', err);
  }
}

export function getPendingCount(): number {
  const list = getOfflineQueue();
  return list.filter((i) => i.status === 'PENDING').length;
}
