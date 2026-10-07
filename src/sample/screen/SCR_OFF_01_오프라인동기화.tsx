import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmOff01,
  ElmStt01,
  ElmCnt01,
  ElmFlt01,
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
} from 'lucide-react';

export const SCR_OFF_01_오프라인동기화: React.FC = () => {
  const [isOffline, setIsOffline] = useState(true);
  const [showStaleModal, setShowStaleModal] = useState(false);
  const [pendingQueue, setPendingQueue] = useState([
    {
      id: 'q1',
      title: '현금 지출: 편의점 생수 (오프라인 수동입력)',
      amount: 1800,
      timestamp: '2026-10-06 18:40',
      status: 'PENDING',
    },
    {
      id: 'q2',
      title: '모아당번 수행 사진 (오프라인 캐시)',
      amount: 0,
      timestamp: '2026-10-06 18:45',
      status: 'PENDING',
    },
  ]);

  const handleReconnect = () => {
    setIsOffline(false);
    // Simulate detecting a conflict / stale item
    setTimeout(() => {
      setShowStaleModal(true);
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Sticky Offline Banner */}
      <ElmOff01 isOffline={isOffline} pendingCount={pendingQueue.length} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
              SCR-OFF-01
            </span>
            <ElmTyp01
              title="오프라인 PWA 대응 및 동기화/Stale 검증"
              subtitle="오프라인 빠른등록 ➔ 온라인 재연결 Stale 무효화 가드레일"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isOffline ? handleReconnect() : setIsOffline(true))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isOffline
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {isOffline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{isOffline ? '온라인으로 재연결 (동기화 검증)' : '오프라인 모드 시뮬레이션'}</span>
        </button>
      </div>

      {/* Status Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              오프라인 로컬 저장소 (IndexedDB) 대기열
            </h3>
          </div>
          <ElmCnt01 count={`${pendingQueue.length}건 대기중`} />
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {pendingQueue.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.title}</span>
                  <ElmStt01 type="AMBER" label="⏳ Sync Pending" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{item.timestamp}</span>
              </div>
              <div className="text-right font-mono font-bold text-slate-900">
                {item.amount > 0 ? `₩${item.amount.toLocaleString()}원` : '사진 첨부 데이터'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stale Invalidation Warning Modal (PRD Requirement) */}
      {showStaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-amber-400 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>오프라인 재연결 충돌 감지 (Stale Invalidation)</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold text-amber-800 text-sm">
                "네트워크 연결 후 확인 결과 이미 변경/삭제된 내역입니다"
              </div>
              <p className="leading-relaxed">
                오프라인 상태에서 로컬 캐시에 보관 중이던 내역 중 일부가, 다른 구성원에 의해 서버에서 이미 삭제되었음을 확인하였습니다.
              </p>
              <p className="text-[11px] text-amber-700 font-medium">
                🛡️ 정합성 가드레일: 서버 데이터 손상을 방지하기 위해 로컬 덮어쓰기를 취소하고 서버 최신 상태를 유지합니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStaleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
              >
                확인 및 서버 최신상태 갱신
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
