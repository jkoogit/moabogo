import React, { useEffect, useState } from 'react';
import { CloudOff, KeyRound, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { ElmRad01 } from '../../elements/Tokens';
import { OfflineSyncPreferences } from '../../data/servicePreferencesPool';
import {
  OfflineAuthSession,
  getCachedOfflineSession,
  hydrateOfflineSessionFromIDB,
  revokeOfflineSession,
  OFFLINE_SESSION_CHANGED_EVENT,
} from '../../data/offlineSessionStore';
import { getOfflineQueue, OfflineQueueItem } from '../../data/offlineQueueStore';

interface OfflineSettingsPanelProps {
  offlinePrefs: OfflineSyncPreferences;
  onUpdateOfflinePrefs: (prefs: OfflineSyncPreferences) => void;
  onNotify: (msg: string) => void;
}

export const OfflineSettingsPanel: React.FC<OfflineSettingsPanelProps> = ({
  offlinePrefs,
  onUpdateOfflinePrefs,
  onNotify,
}) => {
  const [session, setSession] = useState<OfflineAuthSession | null>(() => getCachedOfflineSession());
  const [queueItems, setQueueItems] = useState<OfflineQueueItem[]>(() => getOfflineQueue());

  useEffect(() => {
    let mounted = true;
    hydrateOfflineSessionFromIDB().then((res) => {
      if (mounted) setSession(res);
    });
    const onSessionChange = () => setSession(getCachedOfflineSession());
    const onQueueChange = () => setQueueItems(getOfflineQueue());

    window.addEventListener(OFFLINE_SESSION_CHANGED_EVENT, onSessionChange);
    window.addEventListener('moabogo:offline-queue-changed', onQueueChange);
    return () => {
      mounted = false;
      window.removeEventListener(OFFLINE_SESSION_CHANGED_EVENT, onSessionChange);
      window.removeEventListener('moabogo:offline-queue-changed', onQueueChange);
    };
  }, []);

  const handleRevokeSession = async () => {
    await revokeOfflineSession();
    setSession(null);
    onNotify('현재 기기의 IndexedDB 오프라인 자동 로그인 세션이 안전하게 폐기되었습니다.');
  };

  const pendingCount = queueItems.filter((q) => q.status === 'PENDING').length;
  const conflictCount = queueItems.filter((q) => q.status === 'STALE_CONFLICT').length;

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>오프라인 동기화 정책 & 기기 세션 관리 (SCR-OFF-01 · SCR-AUT-02)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            네트워크 단절 복구 시 멱등키 기반 자동 동기화 주기, LWW 충돌 기본 정책 및 기기 세션을 제어합니다.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 whitespace-nowrap">
            대기 {pendingCount}건
          </span>
          {conflictCount > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
              충돌 {conflictCount}건
            </span>
          )}
        </div>
      </div>

      {/* 1. 자동 동기화 주기 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>온라인 복구 시 자동 동기화 주기</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { val: 0 as const, label: '즉시 재전송 (0초)' },
            { val: 30 as const, label: '30초 주기 (권장)' },
            { val: 60 as const, label: '1분 주기' },
            { val: 300 as const, label: '5분 절전 주기' },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => {
                onUpdateOfflinePrefs({ ...offlinePrefs, autoSyncIntervalSec: opt.val });
                onNotify(`오프라인 동기화 주기가 '${opt.label}'로 설정되었습니다.`);
              }}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                offlinePrefs.autoSyncIntervalSec === opt.val
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. LWW 충돌 기본 해결 정책 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>LWW (Last-Write-Wins) 충돌 발생 시 기본 처리 정책</span>
        </div>
        <div className="space-y-2.5">
          <ElmRad01
            selected={offlinePrefs.defaultConflictPolicy === 'MANUAL_CONFIRM'}
            onSelect={() => {
              onUpdateOfflinePrefs({ ...offlinePrefs, defaultConflictPolicy: 'MANUAL_CONFIRM' });
              onNotify('충돌 시 사용자 확인 모달을 우선 노출합니다.');
            }}
            label="수동 확인 우선 (SCR-OFF-01 충돌 해결 모달에서 덮어쓰기/폐기 직접 선택 — 권장)"
          />
          <ElmRad01
            selected={offlinePrefs.defaultConflictPolicy === 'AUTO_OVERWRITE'}
            onSelect={() => {
              onUpdateOfflinePrefs({ ...offlinePrefs, defaultConflictPolicy: 'AUTO_OVERWRITE' });
              onNotify('충돌 시 로컬 작성 내용을 기준으로 자동 병합하도록 설정했습니다.');
            }}
            label="로컬 우선 자동 덮어쓰기 (최신 클라이언트 멱등키 기준으로 서버 자동 갱신)"
          />
        </div>
      </div>

      {/* 3. 기기별 IndexedDB 오프라인 세션 원장 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>현재 기기 오프라인 자동 로그인 세션 (IndexedDB)</span>
        </div>

        {session && session.isActive ? (
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-[#131B2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  ACTIVE
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {session.nickname} ({session.provider})
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 break-all">
                토큰: {session.maskedToken} · ID: {session.sessionId}
              </div>
              <div className="text-[11px] text-slate-400">
                발급: {session.issuedAt} · 만료: {session.expiresAt}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRevokeSession}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>세션 즉시 폐기</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400">
            현재 기기에 활성화된 IndexedDB 오프라인 세션이 없습니다. (로그인 화면 `SCR-AUT-02`에서 오프라인 세션 유지를 활성화할 수 있습니다.)
          </div>
        )}
      </div>
    </section>
  );
};
