// ==========================================
// src/sample/screen/day/MoaDayDocViewerModal.tsx
// 문서 미리보기 및 다운로드 모달
// ==========================================

import React from 'react';
import { File, X, Download } from 'lucide-react';

interface MoaDayDocViewerModalProps {
  viewingDoc: { name: string; size: string } | null;
  onClose: () => void;
  onDownload: () => void;
}

export const MoaDayDocViewerModal: React.FC<MoaDayDocViewerModalProps> = ({
  viewingDoc,
  onClose,
  onDownload,
}) => {
  if (!viewingDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
              {viewingDoc.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-48 rounded-xl bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-4 text-center">
          <File className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            미리보기가 지원되는 문서입니다. ({viewingDoc.size})
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            PWA 웹 브라우저 뷰어를 통해 안전하게 열람되었습니다.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold"
          >
            닫기
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};
