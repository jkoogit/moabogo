import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  scopeLabel?: string;
  variant?: 'root' | 'screen';
  onReset?: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * 전역 및 화면 단위 런타임 오류 격리 가드레일 (AGENTS.md 정책 7.3)
 * - 구버전 로컬스토리지 충돌 또는 렌더 예외 시 흰 화면 대신 즉시 복구 UI 제공
 */
export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(
      `[AppErrorBoundary:${this.props.scopeLabel || 'App'}] Unhandled render error:`,
      error,
      errorInfo
    );
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  private handleResetLocalCache = (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith('moabogo')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      }
    } catch (err) {
      console.error('[AppErrorBoundary] Failed to clear localStorage:', err);
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isRoot = this.props.variant === 'root';
    return (
      <div
        className={`w-full flex items-center justify-center p-4 ${
          isRoot ? 'min-h-screen bg-slate-950 text-slate-100' : 'py-12'
        }`}
      >
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 p-6 shadow-xl space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold">
              {this.props.scopeLabel
                ? `${this.props.scopeLabel} 표시 중 오류가 발생했습니다`
                : '화면 표시 중 일시적인 오류가 발생했습니다'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              이전 브라우저 캐시나 일시적 상태 불일치로 렌더링이 중단되었습니다. 다시 시도하거나 로컬 캐시를 초기화해 복구할 수 있습니다.
            </p>
            {this.state.error?.message && (
              <p className="mt-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800/90 text-[11px] font-mono text-rose-600 dark:text-rose-300 break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleRetry}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>다시 시도</span>
            </button>
            <button
              type="button"
              onClick={this.handleResetLocalCache}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>로컬 캐시 초기화 후 복구</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
