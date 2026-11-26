// ============================================================================
// src/hooks/useApi.ts
// 도메인 Repository / apiClient와 화면 컴포넌트를 연결하는 공용 React Hook 계층
// - 언마운트/의존성 변경 시 AbortController 자동 취소 및 ApiError 정규화 지원
// ============================================================================

import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/apiClient';

export interface UseApiQueryOptions<TData> {
  enabled?: boolean;
  initialData?: TData;
}

export interface UseApiQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  error: ApiError | Error | null;
  refetch: () => Promise<TData | undefined>;
}

export function useApiQuery<TData>(
  fetcher: (signal: AbortSignal) => Promise<TData>,
  deps: DependencyList = [],
  options: UseApiQueryOptions<TData> = {}
): UseApiQueryResult<TData> {
  const { enabled = true, initialData } = options;
  const [data, setData] = useState<TData | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const runFetch = useCallback(async (signal?: AbortSignal): Promise<TData | undefined> => {
    const controller = signal ? null : new AbortController();
    const activeSignal = signal || controller!.signal;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(activeSignal);
      if (!activeSignal.aborted) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (!activeSignal.aborted) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
      return undefined;
    } finally {
      if (!activeSignal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    void runFetch(controller.signal);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, runFetch, ...deps]);

  const refetch = useCallback(() => runFetch(), [runFetch]);

  return { data, isLoading, error, refetch };
}

export interface UseApiMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  data: TOutput | undefined;
  isLoading: boolean;
  error: ApiError | Error | null;
  reset: () => void;
}

export function useApiMutation<TInput, TOutput>(
  mutator: (input: TInput, signal: AbortSignal) => Promise<TOutput>
): UseApiMutationResult<TInput, TOutput> {
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const mutatorRef = useRef(mutator);
  mutatorRef.current = mutator;
  const activeControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeControllerRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
  }, []);

  const mutate = useCallback(async (input: TInput): Promise<TOutput> => {
    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutatorRef.current(input, controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
      }
      return result;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      if (!controller.signal.aborted) {
        setError(normalized);
      }
      throw normalized;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  return { mutate, data, isLoading, error, reset };
}
