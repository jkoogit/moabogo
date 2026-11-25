import React from 'react';
import {
  ArrowRight,
  KeyRound,
  LogIn,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { OfflineAuthSession } from '../../data/offlineSessionStore';

interface OfflineSessionTokenCardProps {
  mode: 'LOGIN' | 'VIEWER';
  isOffline: boolean;
  cachedSession: OfflineAuthSession | null;
  pendingQueueCount?: number;
  onOfflineLogin?: () => void;
  onExtendSession?: () => void;
  onReissueSession?: () => void;
  onRevokeSession: () => void;
  onOpenOfflineViewer?: () => void;
  onGoLogin?: () => void;
}

/**
 * IndexedDB 오프라인 세션 토큰 상태 & 제어 공용 카드
 * - SCR_AUT_02(로그인) 및 SCR_OFF_01(오프라인 동기화 뷰어) 공용 사용
 */
export const OfflineSessionTokenCard: React.FC<OfflineSessionTokenCardProps> = ({
  mode,
  isOffline,
  cachedSession,
  pendingQueueCount = 0,
  onOfflineLogin,
  onExtendSession,
  onReissueSession,
  onRevokeSession,
  onOpenOfflineViewer,
  onGoLogin,
}) => {
  const isViewer = mode === 'VIEWER';

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border space-y-2.5 text-xs ${
        isOffline && !isViewer
          ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
          : 'bg-slate-50/80 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
          <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>IndexedDB 오프라인 인증 세션</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
            cachedSession
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
          }`}
        >
          {cachedSession ? '토큰 유지중 ✓' : '캐시 없음'}
        </span>
      </div>

      {cachedSession ? (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between gap-2 flex-wrap text-slate-600 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold truncate">
                {isViewer ? `${cachedSession.nickname} (${cachedSession.email})` : cachedSession.email}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold whitespace-nowrap shrink-0">
                {cachedSession.provider}
              </span>
            </div>
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
              {cachedSession.maskedToken}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-400">
            <span>만료: {cachedSession.expiresAt}</span>
            {!isViewer && (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                오프라인 대기열 {pendingQueueCount}건
              </span>
            )}
          </div>

          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
            {onOfflineLogin && (
              <button
                type="button"
                onClick={onOfflineLogin}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>캐시 세션 즉시 진입</span>
              </button>
            )}

            {onExtendSession && (
              <button
                type="button"
                onClick={onExtendSession}
                className="min-h-[44px] px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>7일 연장</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRevokeSession}
              aria-label="오프라인 세션 폐기"
              title="오프라인 세션 토큰 폐기"
              className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-800 whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {isViewer && <span className="text-xs font-bold">세션 폐기</span>}
            </button>

            {onGoLogin && (
              <button
                type="button"
                onClick={onGoLogin}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-500 dark:text-zinc-400">
          <span>저장된 토큰이 없습니다. 로그인 시 자동 발급됩니다.</span>
          <div className="flex items-center gap-1.5">
            {onReissueSession && !isOffline && (
              <button
                type="button"
                onClick={onReissueSession}
                className="min-h-[40px] px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 shrink-0" />
                <span>토큰 발급</span>
              </button>
            )}
            {onGoLogin && (
              <button
                type="button"
                onClick={onGoLogin}
                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold whitespace-nowrap cursor-pointer"
              >
                로그인 화면
              </button>
            )}
          </div>
        </div>
      )}

      {onOpenOfflineViewer && (
        <button
          type="button"
          onClick={onOpenOfflineViewer}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:border-indigo-400 flex items-center justify-between gap-2 cursor-pointer"
        >
          <span className="truncate">동기화 대기열 & Stale 안내 뷰어 (SCR-OFF-01)</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
        </button>
      )}
    </div>
  );
};
