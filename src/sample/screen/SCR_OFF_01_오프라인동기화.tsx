import React, { useState, useEffect } from 'react';
import {
  ElmTyp01,
  ElmOff01,
  ElmStt01,
  ElmCnt01,
} from '../elements/Tokens';
import {
  Wifi,
  WifiOff,
  Database,
  ShieldAlert,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  OfflineQueueItem,
  OFFLINE_QUEUE_CHANGED_EVENT,
} from '../data/offlineQueueStore';
import {
  OFFLINE_SESSION_CHANGED_EVENT,
  OfflineAuthSession,
} from '../data/offlineSessionStore';
import { offlineRepository, preferencesRepository } from '../../services/repositories';
import { buildIdempotencyKey } from '../shared/securityGuards';
import { OfflineSessionTokenCard } from './auth/OfflineSessionTokenCard';

export interface SCR_OFF_01Props {
  isOffline?: boolean;
  onToggleOffline?: () => void;
  onGoLogin?: () => void;
}

export const SCR_OFF_01_오프라인동기화: React.FC<SCR_OFF_01Props> = ({
  isOffline: externalIsOffline,
  onToggleOffline,
  onGoLogin,
}) => {
  const [internalOffline, setInternalOffline] = useState(true);
  const isOffline = externalIsOffline !== undefined ? externalIsOffline : internalOffline;

  const [showStaleModal, setShowStaleModal] = useState(false);
  const [staleConflictItem, setStaleConflictItem] = useState<OfflineQueueItem | null>(null);
  const [pendingQueue, setPendingQueue] = useState<OfflineQueueItem[]>(() =>
    offlineRepository.getQueue()
  );
  const [cachedSession, setCachedSession] = useState<OfflineAuthSession | null>(() =>
    offlineRepository.getSession()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPolicy, setSyncPolicy] = useState(() =>
    preferencesRepository.getOfflineSyncPreferences().defaultConflictPolicy
  );
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const refreshQueue = () => {
    setPendingQueue(offlineRepository.getQueue());
  };

  useEffect(() => {
    refreshQueue();
    void offlineRepository.hydrateQueue().then((items) => setPendingQueue(items));
    void offlineRepository.hydrateSession().then((sess) => setCachedSession(sess));
    const handleQueueChange = () => {
      refreshQueue();
    };
    const handleSessionChange = () => {
      setCachedSession(offlineRepository.getSession());
    };
    window.addEventListener(OFFLINE_QUEUE_CHANGED_EVENT, handleQueueChange);
    window.addEventListener(OFFLINE_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      window.removeEventListener(OFFLINE_QUEUE_CHANGED_EVENT, handleQueueChange);
      window.removeEventListener(OFFLINE_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, []);

  const handleToggleMode = () => {
    if (onToggleOffline) {
      onToggleOffline();
    } else {
      setInternalOffline((prev) => !prev);
    }
  };

  const handleReconnectAndSync = async () => {
    if (onToggleOffline && isOffline) {
      onToggleOffline();
    } else {
      setInternalOffline(false);
    }

    setIsSyncing(true);
    try {
      const currentPolicy =
        preferencesRepository.getOfflineSyncPreferences().defaultConflictPolicy;
      setSyncPolicy(currentPolicy);
      const result = await offlineRepository.syncNow({ conflictPolicy: currentPolicy });
      setPendingQueue(result.items);

      if (result.conflictCount > 0) {
        const conflict = result.items.find((i) => i.status === 'STALE_CONFLICT');
        setStaleConflictItem(conflict || null);
        setShowStaleModal(true);
        showToast(
          `⚠️ ${result.syncedCount}건 동기화 완료, ${result.conflictCount}건 LWW 충돌(Stale) 감지!`
        );
      } else {
        const modeTag = result.usedOfflineFallback ? '로컬 폴백' : '서버 API 멱등 검증';
        showToast(
          `✓ ${modeTag} 동기화 완료: ${result.syncedCount}건 반영 (멱등 재시도 ${result.replayedCount}건)`
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 모아게임 사다리 결제 오프라인 지출 모의 적재 핸들러
  const handleAddGameExpenseMock = () => {
    const nonce = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const idempKey = buildIdempotencyKey('game-exp', ['led-group-01', 32000, nonce]);
    const newItem = offlineRepository.enqueueItem({
      idempotencyKey: idempKey,
      type: 'LEDGER_EXPENSE',
      operationType: 'CREATE',
      entityId: `tx-game-${nonce}`,
      title: '모아게임 사다리 결제 (PLUS CAFE)',
      amount: 32000,
      ledgerName: '우리집 가계부 (가족 공유)',
      payerName: '구본영(호스트/나)',
      category: '식비/간식',
      memo: '오프라인 상태에서 모아게임 사다리 당첨 후 가계부 기안',
      clientVersion: 1,
      clientUpdatedAtMs: Date.now(),
    });
    refreshQueue();
    showToast(
      `✓ 모아게임 지출 (₩32,000원)이 멱등키(${newItem.idempotencyKey})와 함께 IndexedDB 큐에 적재되었습니다.`
    );
  };

  const handleResetQueue = () => {
    offlineRepository.clearQueue();
    refreshQueue();
    showToast('오프라인 동기화 대기열이 초기화되었습니다.');
  };

  const pendingItemsCount = pendingQueue.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Section 1: Sticky Offline Indicator (Flat Peer 1) */}
      <ElmOff01 isOffline={isOffline} pendingCount={pendingItemsCount} />

      {/* Section 2: Header (Flat Peer 2) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <ElmTyp01
            title="오프라인 PWA 대응 및 동기화/Stale 검증"
            badge="SCR-OFF-01"
            subtitle="모아게임 지출 기안 ➔ 오프라인 큐 적재 ➔ 온라인 재연결 멱등성 보장 동기화"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAddGameExpenseMock}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
            title="모아게임 오프라인 지출 기안 시뮬레이션 적재"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>게임 지출 큐 적재</span>
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={isOffline ? handleReconnectAndSync : handleToggleMode}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap active:scale-95 disabled:opacity-60 ${
              isOffline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isOffline ? <Wifi className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
            <span>
              {isSyncing
                ? '동기화 진행중...'
                : isOffline
                ? '온라인으로 재연결 (동기화 검증)'
                : '오프라인 모드 시뮬레이션'}
            </span>
          </button>
        </div>
      </section>

      {/* 피드백 알림 배너 */}
      {feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            aria-label="알림 닫기"
            className="text-indigo-500 hover:text-indigo-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 2-1: IndexedDB 오프라인 세션 토큰 유지 상태 뷰어 */}
      <section className="rounded-2xl bg-white dark:bg-[#131B2E] shadow-xs">
        <OfflineSessionTokenCard
          mode="VIEWER"
          isOffline={isOffline}
          cachedSession={cachedSession}
          onExtendSession={() => {
            const updated = offlineRepository.extendSession();
            setCachedSession(updated);
            showToast('✓ 오프라인 세션 유효기간이 7일 연장되었습니다.');
          }}
          onReissueSession={() => {
            const issued = offlineRepository.issueSession({
              email: 'jkok2j2m@gmail.com',
              nickname: '구본영(호스트)',
              provider: 'EMAIL',
            });
            setCachedSession(issued);
            showToast(`✓ 오프라인 세션(${issued.maskedToken})이 발급되었습니다.`);
          }}
          onRevokeSession={() => {
            offlineRepository.revokeSession();
            setCachedSession(null);
            showToast('오프라인 세션 토큰이 폐기되었습니다.');
          }}
          onGoLogin={onGoLogin}
        />
      </section>

      {/* Section 3: Status Box & Queue List (Flat Peer 3) */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              오프라인 로컬 저장소 (IndexedDB / LocalQueue) 대기열
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ElmCnt01 count={`${pendingItemsCount}건 대기중`} />
            <button
              type="button"
              onClick={handleResetQueue}
              aria-label="대기열 초기화"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-rose-500 text-xs transition-colors cursor-pointer"
              title="대기열 초기화"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-600 dark:text-zinc-300">대기 중인 오프라인 작업이 없습니다.</p>
            <p>모아게임에서 오프라인 지출을 등록하거나 상단 [게임 지출 큐 적재] 버튼을 눌러보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {pendingQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-[#1a233a] text-xs transition-colors min-h-[44px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{item.title}</span>
                    <ElmStt01
                      type={
                        item.status === 'PENDING'
                          ? 'AMBER'
                          : item.status === 'SYNCED'
                          ? 'EMERALD'
                          : 'PURPLE'
                      }
                      label={
                        item.status === 'PENDING'
                          ? '⏳ Sync Pending'
                          : item.status === 'SYNCED'
                          ? '✓ Synced'
                          : '⚠️ Stale Conflict'
                      }
                    />
                    {item.ledgerName && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {item.ledgerName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span>
                      {item.operationType || 'CREATE'} v{item.clientVersion || 1}
                      {item.serverVersion ? ` ↔ Srv v${item.serverVersion}` : ''}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      멱등키: {item.idempotencyKey}
                    </span>
                    {item.memo && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">{item.memo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono font-bold text-slate-900 dark:text-zinc-100 text-sm shrink-0">
                  {item.amount > 0 ? `₩${item.amount.toLocaleString()}원` : '사진 첨부 데이터'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Stale Invalidation Warning Modal (PRD Requirement - Flat Peer 4) */}
      {showStaleModal && (
        <aside className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131B2E] border border-amber-400 dark:border-amber-600 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>오프라인 재연결 충돌 감지 (Stale Invalidation)</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                  "네트워크 연결 후 확인 결과 이미 변경/삭제된 내역입니다"
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                  정책: {syncPolicy === 'AUTO_OVERWRITE' ? '자동 덮어쓰기' : '수동 확인 우선'}
                </span>
              </div>
              <p className="leading-relaxed">
                오프라인 상태에서 로컬 IndexedDB에 보관 중이던 항목{' '}
                <strong className="font-mono text-amber-900 dark:text-amber-100">
                  [{staleConflictItem?.title || '생수 지출'}]
                </strong>
                (로컬 v{staleConflictItem?.clientVersion || 1})이 서버 최신 버전(v
                {staleConflictItem?.serverVersion || 2})과 충돌했습니다.
              </p>
              {staleConflictItem?.conflictReason && (
                <p className="text-[11px] font-mono text-amber-800 dark:text-amber-300">
                  상세: {staleConflictItem.conflictReason}
                </p>
              )}
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                🛡️ 정합성 가드레일: 서버 최신 상태를 보존하고 로컬 내역을 폐기하거나, 로컬 내용으로 LWW 덮어쓰기를 명시 선택할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={async () => {
                  if (staleConflictItem) {
                    const updated = await offlineRepository.resolveConflict(
                      staleConflictItem.id,
                      'OVERWRITE'
                    );
                    setPendingQueue(updated);
                  }
                  setShowStaleModal(false);
                  showToast('✓ LWW 로컬 우선 덮어쓰기로 서버 원장이 최신화되었습니다.');
                }}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 cursor-pointer transition-all"
              >
                로컬 내용으로 덮어쓰기 (LWW)
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (staleConflictItem) {
                    const updated = await offlineRepository.resolveConflict(
                      staleConflictItem.id,
                      'DISCARD'
                    );
                    setPendingQueue(updated);
                  }
                  setShowStaleModal(false);
                  showToast('✓ 충돌 항목이 안전하게 무효화되고 서버 최신 상태가 유지되었습니다.');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white shadow-sm cursor-pointer transition-all"
              >
                서버 최신 유지 및 폐기
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
