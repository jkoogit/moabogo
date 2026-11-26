// ============================================================================
// src/services/repositories/offlineRepository.ts
// 오프라인 동기화 큐(IndexedDB) 및 오프라인 인증 세션 Repository 추상화
// ============================================================================

import {
  addOfflineQueueItem,
  clearOfflineQueue,
  getOfflineQueue,
  getPendingCount,
  hydrateOfflineQueueFromIDB,
  OfflineQueueItem,
} from '../../sample/data/offlineQueueStore';
import {
  extendOfflineSession,
  getCachedOfflineSession,
  hydrateOfflineSessionFromIDB,
  issueOfflineSession,
  OfflineAuthProvider,
  OfflineAuthSession,
  revokeOfflineSession,
} from '../../sample/data/offlineSessionStore';
import { OfflineSyncPreferences } from '../../sample/data/servicePreferencesPool';
import { resolveSyncConflict, runOfflineSync, SyncExecutionSummary } from '../syncEngine';

export const offlineRepository = {
  getQueue: (): OfflineQueueItem[] => getOfflineQueue(),
  hydrateQueue: (): Promise<OfflineQueueItem[]> => hydrateOfflineQueueFromIDB(),
  enqueueItem: (
    data: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
  ): OfflineQueueItem => addOfflineQueueItem(data),
  clearQueue: (): void => clearOfflineQueue(),
  getPendingCount: (): number => getPendingCount(),

  syncNow: (options?: {
    conflictPolicy?: OfflineSyncPreferences['defaultConflictPolicy'];
    forceOfflineFallback?: boolean;
  }): Promise<SyncExecutionSummary> => runOfflineSync(options),

  resolveConflict: (itemId: string, action: 'OVERWRITE' | 'DISCARD'): Promise<OfflineQueueItem[]> =>
    resolveSyncConflict(itemId, action),

  getSession: (): OfflineAuthSession | null => getCachedOfflineSession(),
  hydrateSession: (): Promise<OfflineAuthSession | null> => hydrateOfflineSessionFromIDB(),
  issueSession: (params: {
    email: string;
    nickname?: string;
    provider: OfflineAuthProvider;
  }): OfflineAuthSession => issueOfflineSession(params),
  extendSession: (): OfflineAuthSession | null => extendOfflineSession(),
  revokeSession: (): void => revokeOfflineSession(),
};
