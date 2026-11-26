// ============================================================================
// src/services/syncEngine.ts
// 오프라인-우선(Offline-First) IndexedDB 동기화 엔진
// - apiClient 오프라인 Mutation 자동 큐잉 (멱등키 보장)
// - 백엔드 /api/v1/sync/batch 연동 & LWW(Last-Write-Wins) 충돌 해결 프로토콜
// - OfflineSyncPreferences(autoSyncIntervalSec, defaultConflictPolicy) 실시간 반영
// ============================================================================

import { apiClient, registerOfflineMutationHook } from './apiClient';
import {
  addOfflineQueueItem,
  getOfflineQueue,
  hydrateOfflineQueueFromIDB,
  OfflineQueueItem,
  replaceOfflineQueue,
  resolveOfflineConflict,
  syncOfflineQueue,
} from '../sample/data/offlineQueueStore';
import {
  loadOfflineSyncPreferences,
  OFFLINE_PREFS_UPDATED_EVENT,
  OfflineSyncPreferences,
} from '../sample/data/servicePreferencesPool';
import { buildIdempotencyKey } from '../sample/shared/securityGuards';

export interface SyncBatchItemResultDto {
  id: string;
  idempotencyKey: string;
  status: 'SYNCED' | 'STALE_CONFLICT';
  idempotentReplay?: boolean;
  conflictResolution?: 'AUTO_OVERWRITE' | 'MANUAL_OVERWRITE';
  serverVersion: number;
  serverUpdatedAtMs: number;
  conflictReason?: string;
}

export interface SyncBatchResponseDto {
  syncedCount: number;
  conflictCount: number;
  results: SyncBatchItemResultDto[];
}

export interface SyncExecutionSummary {
  syncedCount: number;
  conflictCount: number;
  replayedCount: number;
  usedOfflineFallback: boolean;
  appliedPolicy: OfflineSyncPreferences['defaultConflictPolicy'];
  items: OfflineQueueItem[];
}

let isSyncInFlight = false;

function inferQueueTypeFromUrl(url: string): OfflineQueueItem['type'] {
  if (url.includes('/ledgers') || url.includes('/transactions')) return 'LEDGER_EXPENSE';
  if (url.includes('/duties')) return 'DUTY_RECORD';
  if (url.includes('/goals')) return 'GOAL_RECORD';
  return 'GENERAL';
}

function inferOperationFromMethod(method: string): OfflineQueueItem['operationType'] {
  switch (method.toUpperCase()) {
    case 'DELETE':
      return 'DELETE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    default:
      return 'CREATE';
  }
}

function buildQueueTitleFromEnvelope(url: string, method: string, body: unknown): string {
  const rec = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const label =
    (typeof rec.merchantName === 'string' && rec.merchantName) ||
    (typeof rec.ledgerName === 'string' && rec.ledgerName) ||
    (typeof rec.eventTitle === 'string' && rec.eventTitle) ||
    (typeof rec.title === 'string' && rec.title);
  if (label) return `[오프라인 ${method}] ${label}`;
  return `[오프라인 ${method}] ${url}`;
}

/**
 * 대기 중(PENDING) 큐 항목을 백엔드 멱등키·LWW 배치 API로 동기화
 */
export async function runOfflineSync(options?: {
  conflictPolicy?: OfflineSyncPreferences['defaultConflictPolicy'];
  forceOfflineFallback?: boolean;
}): Promise<SyncExecutionSummary> {
  const prefs = loadOfflineSyncPreferences();
  const policy = options?.conflictPolicy ?? prefs.defaultConflictPolicy;
  const currentItems = await hydrateOfflineQueueFromIDB();
  const pendingItems = currentItems.filter((item) => item.status === 'PENDING');

  if (pendingItems.length === 0 || isSyncInFlight) {
    return {
      syncedCount: 0,
      conflictCount: currentItems.filter((i) => i.status === 'STALE_CONFLICT').length,
      replayedCount: 0,
      usedOfflineFallback: false,
      appliedPolicy: policy,
      items: currentItems,
    };
  }

  if (options?.forceOfflineFallback) {
    const fallback = syncOfflineQueue();
    return {
      ...fallback,
      replayedCount: 0,
      usedOfflineFallback: true,
      appliedPolicy: policy,
    };
  }

  isSyncInFlight = true;
  try {
    const response = await apiClient.post<SyncBatchResponseDto>('/api/v1/sync/batch', {
      conflictPolicy: policy,
      items: pendingItems.map((item) => ({
        id: item.id,
        idempotencyKey: item.idempotencyKey,
        type: item.type,
        operationType: item.operationType || 'CREATE',
        entityId: item.entityId || item.id,
        title: item.title,
        amount: item.amount,
        ledgerName: item.ledgerName,
        category: item.category,
        memo: item.memo,
        clientVersion: item.clientVersion || 1,
        clientUpdatedAtMs: item.clientUpdatedAtMs || Date.now(),
        forceOverwrite: policy === 'AUTO_OVERWRITE' && item.status === 'PENDING',
      })),
    });

    const resultById = new Map(response.results.map((r) => [r.id, r]));
    let replayedCount = 0;

    const updatedItems = currentItems.map((item) => {
      const matched = resultById.get(item.id);
      if (!matched) return item;
      if (matched.idempotentReplay) replayedCount += 1;

      if (matched.status === 'STALE_CONFLICT') {
        return {
          ...item,
          status: 'STALE_CONFLICT' as const,
          serverVersion: matched.serverVersion,
          serverUpdatedAtMs: matched.serverUpdatedAtMs,
          conflictReason: matched.conflictReason,
          retryCount: item.retryCount + 1,
        };
      }

      return {
        ...item,
        status: 'SYNCED' as const,
        serverVersion: matched.serverVersion,
        serverUpdatedAtMs: matched.serverUpdatedAtMs,
        conflictResolution: matched.conflictResolution,
      };
    });

    const persisted = replaceOfflineQueue(updatedItems);
    return {
      syncedCount: response.syncedCount,
      conflictCount: response.conflictCount,
      replayedCount,
      usedOfflineFallback: false,
      appliedPolicy: policy,
      items: persisted,
    };
  } catch {
    // 네트워크 미연결 또는 홈서버 재기동 시 로컬 폴백으로 무중단 동작
    const fallback = syncOfflineQueue();
    return {
      ...fallback,
      replayedCount: 0,
      usedOfflineFallback: true,
      appliedPolicy: policy,
    };
  } finally {
    isSyncInFlight = false;
  }
}

/**
 * Stale 충돌 항목 LWW 해결 (로컬 덮어쓰기 OVERWRITE vs 서버 유지·로컬 폐기 DISCARD)
 */
export async function resolveSyncConflict(
  itemId: string,
  action: 'OVERWRITE' | 'DISCARD'
): Promise<OfflineQueueItem[]> {
  const current = getOfflineQueue();
  const target = current.find((i) => i.id === itemId);

  if (target) {
    try {
      await apiClient.post('/api/v1/sync/resolve', {
        id: target.id,
        idempotencyKey: target.idempotencyKey,
        entityId: target.entityId || target.id,
        action,
        summaryTitle: target.title,
      });
    } catch {
      // 오프라인 상태에서도 로컬 큐 충돌 정리 보장
    }
  }

  resolveOfflineConflict(itemId, action);
  return getOfflineQueue();
}

/**
 * 전역 오프라인 동기화 엔진 초기화
 * - apiClient 오프라인 Mutation 훅 등록
 * - 브라우저 online 복구 이벤트 및 설정 주기(autoSyncIntervalSec) 스케줄링
 */
export function initSyncEngine(): () => void {
  registerOfflineMutationHook((envelope) => {
    if (envelope.url.includes('/api/v1/sync/')) return;
    const bodyObj = (envelope.body && typeof envelope.body === 'object' ? envelope.body : {}) as Record<
      string,
      unknown
    >;
    const key =
      envelope.idempotencyKey ||
      buildIdempotencyKey('api', [
        envelope.method,
        envelope.url,
        JSON.stringify(envelope.body || {}),
      ]);

    addOfflineQueueItem({
      idempotencyKey: key,
      type: inferQueueTypeFromUrl(envelope.url),
      operationType: inferOperationFromMethod(envelope.method),
      title: buildQueueTitleFromEnvelope(envelope.url, envelope.method, envelope.body),
      amount: typeof bodyObj.amount === 'number' ? bodyObj.amount : 0,
      category: typeof bodyObj.categoryName === 'string' ? bodyObj.categoryName : undefined,
      memo: typeof bodyObj.note === 'string' ? bodyObj.note : '네트워크 단절로 오프라인 큐에 자동 보관됨',
      requestUrl: envelope.url,
      requestMethod: envelope.method,
      payload: envelope.body,
      clientVersion: 1,
      clientUpdatedAtMs: Date.now(),
    });
  });

  if (typeof window === 'undefined') {
    return () => registerOfflineMutationHook(null);
  }

  void hydrateOfflineQueueFromIDB();

  let intervalHandle: number | null = null;

  const scheduleAutoSync = () => {
    if (intervalHandle !== null) {
      window.clearInterval(intervalHandle);
      intervalHandle = null;
    }
    const { autoSyncIntervalSec } = loadOfflineSyncPreferences();
    if (autoSyncIntervalSec > 0) {
      intervalHandle = window.setInterval(() => {
        if (navigator.onLine && getOfflineQueue().some((i) => i.status === 'PENDING')) {
          void runOfflineSync();
        }
      }, autoSyncIntervalSec * 1000);
    }
  };

  const handleOnline = () => {
    if (getOfflineQueue().some((i) => i.status === 'PENDING')) {
      void runOfflineSync();
    }
  };

  scheduleAutoSync();
  window.addEventListener('online', handleOnline);
  window.addEventListener(OFFLINE_PREFS_UPDATED_EVENT, scheduleAutoSync);

  return () => {
    registerOfflineMutationHook(null);
    if (intervalHandle !== null) {
      window.clearInterval(intervalHandle);
    }
    window.removeEventListener('online', handleOnline);
    window.removeEventListener(OFFLINE_PREFS_UPDATED_EVENT, scheduleAutoSync);
  };
}
