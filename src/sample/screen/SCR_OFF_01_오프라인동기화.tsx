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
  Clock,
  RotateCw,
  AlertOctagon,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldAlert,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  OfflineQueueItem,
  getOfflineQueue,
  addOfflineQueueItem,
  syncOfflineQueue,
  resolveOfflineConflict,
  clearOfflineQueue,
} from '../data/offlineQueueStore';

export interface SCR_OFF_01Props {
  isOffline?: boolean;
  onToggleOffline?: () => void;
}

export const SCR_OFF_01_오프라인동기화: React.FC<SCR_OFF_01Props> = ({
  isOffline: externalIsOffline,
  onToggleOffline,
}) => {
  const [internalOffline, setInternalOffline] = useState(true);
  const isOffline = externalIsOffline !== undefined ? externalIsOffline : internalOffline;

  const [showStaleModal, setShowStaleModal] = useState(false);
  const [staleConflictItem, setStaleConflictItem] = useState<OfflineQueueItem | null>(null);
  const [pendingQueue, setPendingQueue] = useState<OfflineQueueItem[]>(() => getOfflineQueue());
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const refreshQueue = () => {
    setPendingQueue(getOfflineQueue());
  };

  useEffect(() => {
    refreshQueue();
    const handleQueueChange = () => {
      refreshQueue();
    };
    window.addEventListener('moabogo:offline-queue-changed', handleQueueChange);
    return () => {
      window.removeEventListener('moabogo:offline-queue-changed', handleQueueChange);
    };
  }, []);

  const handleToggleMode = () => {
    if (onToggleOffline) {
      onToggleOffline();
    } else {
      setInternalOffline((prev) => !prev);
    }
  };

  const handleReconnectAndSync = () => {
    if (onToggleOffline && isOffline) {
      onToggleOffline();
    } else {
      setInternalOffline(false);
    }

    const result = syncOfflineQueue();
    refreshQueue();

    if (result.conflictCount > 0) {
      const conflict = result.items.find((i) => i.status === 'STALE_CONFLICT');
      setStaleConflictItem(conflict || null);
      setShowStaleModal(true);
      showToast(`⚠️ 오프라인 대기열 ${result.syncedCount}건 동기화 완료, ${result.conflictCount}건 충돌(Stale) 감지!`);
    } else {
      showToast(`✓ 온라인 재연결 완료: ${result.syncedCount}건의 오프라인 데이터가 무손실 원자적 동기화되었습니다.`);
    }
  };

  // 모아게임 사다리 결제 오프라인 지출 모의 적재 핸들러
  const handleAddGameExpenseMock = () => {
    const idempKey = `idemp_game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newItem = addOfflineQueueItem({
      idempotencyKey: idempKey,
      type: 'LEDGER_EXPENSE',
      title: '모아게임 사다리 결제 (PLUS CAFE)',
      amount: 32000,
      ledgerName: '우리집 가계부 (가족 공유)',
      payerName: '구본영(호스트/나)',
      category: '식비/간식',
      memo: '오프라인 상태에서 모아게임 사다리 당첨 후 가계부 기안',
    });
    refreshQueue();
    showToast(`✓ 모아게임 지출 (₩32,000원)이 멱등키(${newItem.idempotencyKey})와 함께 오프라인 큐에 적재되었습니다.`);
  };

  const handleResetQueue = () => {
    clearOfflineQueue();
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
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
            title="모아게임 오프라인 지출 기안 시뮬레이션 적재"
          >
            <Plus className="w-4 h-4" />
            <span>게임 지출 큐 적재</span>
          </button>

          <button
            type="button"
            onClick={isOffline ? handleReconnectAndSync : handleToggleMode}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 active:scale-95 ${
              isOffline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isOffline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOffline ? '온라인으로 재연결 (동기화 검증)' : '오프라인 모드 시뮬레이션'}</span>
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
            className="text-indigo-500 hover:text-indigo-700 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 3: Status Box & Queue List (Flat Peer 3) */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              오프라인 로컬 저장소 (IndexedDB / LocalQueue) 대기열
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ElmCnt01 count={`${pendingItemsCount}건 대기중`} />
            <button
              type="button"
              onClick={handleResetQueue}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-rose-500 text-xs transition-colors cursor-pointer"
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
              <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                "네트워크 연결 후 확인 결과 이미 변경/삭제된 내역입니다"
              </div>
              <p className="leading-relaxed">
                오프라인 상태에서 로컬 캐시에 보관 중이던 항목{' '}
                <strong className="font-mono text-amber-900 dark:text-amber-100">
                  [{staleConflictItem?.title || '생수 지출'}]
                </strong>
                이 다른 구성원에 의해 서버에서 이미 대사되었음을 확인하였습니다.
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                🛡️ 정합성 가드레일: 서버 데이터 훼손을 방지하기 위해 로컬 덮어쓰기를 취소하고 서버 최신 원장 상태를 보존합니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (staleConflictItem) {
                    resolveOfflineConflict(staleConflictItem.id, 'DISCARD');
                    refreshQueue();
                  }
                  setShowStaleModal(false);
                  showToast('✓ 충돌 항목이 안전하게 무효화되고 서버 최신 상태가 유지되었습니다.');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white shadow-sm cursor-pointer transition-all"
              >
                확인 및 서버 최신상태 갱신
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
