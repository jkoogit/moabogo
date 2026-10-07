import React from 'react';
import { AlertOctagon, X, RefreshCw, ShieldAlert } from 'lucide-react';

interface OfflineStaleWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  staleItemName?: string;
  onSyncFresh: () => void;
}

export const OfflineStaleWarningModal: React.FC<OfflineStaleWarningModalProps> = ({
  isOpen,
  onClose,
  staleItemName = '스타벅스 강남점 결제건',
  onSyncFresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-600/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>오프라인 재연결 충돌 감지 (Stale Invalidation)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="font-bold text-amber-300 text-sm">
            "네트워크 연결 후 확인 결과 이미 변경/삭제된 내역입니다"
          </div>
          <p className="leading-relaxed text-amber-200/90">
            오프라인 상태에서 로컬 캐시(IndexedDB)에 보관 중이던 내역 (<strong>{staleItemName}</strong>)이 서버와 재연결 과정에서 이미 타 구성원에 의해 수정되거나 삭제된 것으로 확인되었습니다.
          </p>
          <div className="pt-1 text-[11px] text-amber-300/80 font-medium">
            🛡️ <strong>가드레일 정책:</strong> 데이터 정합성 보호를 위해 로컬 변경 사항의 서버 덮어쓰기(Overwrite)를 즉시 취소하고 무효화(Cancel) 처리했습니다.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
          >
            확인 및 닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onSyncFresh();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>최신 서버 상태로 새로고침</span>
          </button>
        </div>
      </div>
    </div>
  );
};
