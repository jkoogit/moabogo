// ============================================================================
// src/services/repositories/repositoryContract.ts
// 도메인 Repository 계층 공통 계약 및 오프라인 폴백 판별 헬퍼
// ============================================================================

import { ApiError } from '../apiClient';

export type DataSourceMode = 'API_WITH_LOCAL_FALLBACK' | 'API_ONLY' | 'LOCAL_ONLY';

export interface RepositoryContext {
  mode?: DataSourceMode;
  isOffline?: boolean;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

/**
 * 네트워크 단절·타임아웃·명시적 오프라인 모드 여부 판별 (409 충돌 등 비즈니스 오류는 폴백 제외)
 */
export function shouldUseOfflineFallback(err: unknown, ctx?: RepositoryContext): boolean {
  if (ctx?.mode === 'API_ONLY') return false;
  if (ctx?.isOffline || ctx?.mode === 'LOCAL_ONLY') return true;
  if (err instanceof ApiError) {
    return err.isNetworkError || err.isTimeout || err.status >= 500;
  }
  return false;
}
