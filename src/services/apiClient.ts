// ============================================================================
// src/services/apiClient.ts
// 모아보고 표준 HTTP API 클라이언트 (인터셉터 · 타임아웃 · 케이스 변환 · 오프라인 확장)
// ============================================================================

import { getCachedOfflineSession } from '../sample/data/offlineSessionStore';
import { toCamelCase, toSnakeCase } from './caseTransform';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

/**
 * 표준화된 API 계층 예외 클래스 (409 충돌, 401 인증, 524/타임아웃, 네트워크 단절 식별)
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;
  public readonly isConflict: boolean;

  constructor(opts: ApiErrorOptions) {
    super(opts.message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.isNetworkError = Boolean(opts.isNetworkError);
    this.isTimeout = Boolean(opts.isTimeout);
    this.isConflict = opts.status === 409;
  }
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  idempotencyKey?: string;
  /** true(기본)일 때 요청 바디/쿼리 키를 snake_case로 직렬화 */
  transformRequest?: boolean;
  /** true(기본)일 때 응답 JSON 키를 camelCase로 역직렬화 */
  transformResponse?: boolean;
  skipAuth?: boolean;
}

export interface OfflineMutationEnvelope {
  url: string;
  method: HttpMethod;
  body: unknown;
  idempotencyKey?: string;
}

export type OfflineMutationHook = (envelope: OfflineMutationEnvelope) => Promise<void> | void;

interface ApiClientRuntimeConfig {
  baseUrl: string;
  defaultTimeoutMs: number;
  offlineMutationHook: OfflineMutationHook | null;
}

const runtimeConfig: ApiClientRuntimeConfig = {
  baseUrl: '',
  defaultTimeoutMs: 15000, // Cloudflare Tunnel 100s 타임아웃 선제 방어용 표준 상한
  offlineMutationHook: null,
};

export function configureApiClient(partial: Partial<ApiClientRuntimeConfig>): void {
  Object.assign(runtimeConfig, partial);
}

export function registerOfflineMutationHook(hook: OfflineMutationHook | null): void {
  runtimeConfig.offlineMutationHook = hook;
}

function buildRequestUrl(
  path: string,
  params?: ApiRequestOptions['params'],
  transformParams: boolean = true
): string {
  const base = runtimeConfig.baseUrl
    ? `${runtimeConfig.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
    : path;

  if (!params) return base;
  const searchParams = new URLSearchParams();
  const normalized = transformParams
    ? toSnakeCase<Record<string, unknown>>(params)
    : (params as Record<string, unknown>);

  for (const [k, v] of Object.entries(normalized)) {
    if (v !== undefined && v !== null) {
      searchParams.append(k, String(v));
    }
  }
  const qs = searchParams.toString();
  if (!qs) return base;
  return base.includes('?') ? `${base}&${qs}` : `${base}?${qs}`;
}

function resolveRequestHeaders(options: ApiRequestOptions, isFormData: boolean): Headers {
  const headers = new Headers(options.headers);
  headers.set('X-Client-Platform', 'WEB_APP');

  if (!isFormData && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.idempotencyKey) {
    headers.set('X-Idempotency-Key', options.idempotencyKey);
  }
  if (!options.skipAuth && !headers.has('Authorization')) {
    try {
      const session = getCachedOfflineSession();
      if (session?.isActive && session.sessionId) {
        headers.set('Authorization', `Bearer ${session.sessionId}`);
        headers.set('X-User-Id', session.userId);
      }
    } catch {
      // 인증 세션 미존재 시 비로그인 게스트 요청으로 통과
    }
  }
  return headers;
}

function composeAbortSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal
): { signal: AbortSignal; cleanup: () => void; isTimedOut: () => boolean } {
  const controller = new AbortController();
  let timedOut = false;

  const timer = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort(new Error('REQUEST_TIMEOUT'));
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      onExternalAbort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    isTimedOut: () => timedOut,
    cleanup: () => {
      globalThis.clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    },
  };
}

async function parseJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function executeRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method: HttpMethod = options.method || 'GET';
  const transformReq = options.transformRequest !== false;
  const transformRes = options.transformResponse !== false;
  const timeoutMs = options.timeoutMs ?? runtimeConfig.defaultTimeoutMs;
  const url = buildRequestUrl(path, options.params, transformReq);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = resolveRequestHeaders(options, isFormData);

  const preparedBody =
    options.body === undefined
      ? undefined
      : isFormData
      ? (options.body as FormData)
      : JSON.stringify(transformReq ? toSnakeCase(options.body) : options.body);

  const { signal, cleanup, isTimedOut } = composeAbortSignal(timeoutMs, options.signal);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : preparedBody,
      signal,
    });

    const rawPayload = await parseJsonSafely(res);
    const payload = transformRes ? toCamelCase<Record<string, unknown>>(rawPayload) : rawPayload;

    if (!res.ok) {
      const errObj = (payload && typeof payload === 'object' ? payload : {}) as Record<
        string,
        unknown
      >;
      const serverMessage =
        (typeof errObj.message === 'string' && errObj.message) ||
        (typeof errObj.error === 'string' && errObj.error) ||
        `HTTP ${res.status} 요청 처리 중 오류가 발생했습니다.`;
      const serverCode =
        (typeof errObj.warning === 'string' && errObj.warning) ||
        (typeof errObj.code === 'string' && errObj.code) ||
        `HTTP_${res.status}`;

      throw new ApiError({
        status: res.status,
        code: serverCode,
        message: serverMessage,
        details: payload,
        isTimeout: res.status === 524 || res.status === 504,
      });
    }

    return payload as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    const timedOut = isTimedOut();
    if (
      !timedOut &&
      method !== 'GET' &&
      runtimeConfig.offlineMutationHook &&
      (typeof navigator === 'undefined' || !navigator.onLine || err instanceof TypeError)
    ) {
      await runtimeConfig.offlineMutationHook({
        url,
        method,
        body: options.body,
        idempotencyKey: options.idempotencyKey,
      });
    }

    throw new ApiError({
      status: timedOut ? 504 : 0,
      code: timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      message: timedOut
        ? '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        : '네트워크 연결이 불안정하거나 서버에 접속할 수 없습니다.',
      details: err,
      isNetworkError: !timedOut,
      isTimeout: timedOut,
    });
  } finally {
    cleanup();
  }
}

export const apiClient = {
  request: executeRequest,
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    executeRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    executeRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    executeRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    executeRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    executeRequest<T>(path, { ...options, method: 'DELETE' }),
};
