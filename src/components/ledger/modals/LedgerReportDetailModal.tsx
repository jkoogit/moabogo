import React from 'react';
import { X, DownloadCloud } from 'lucide-react';
import type { AnalysisReportSnapshot } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerReportDetailModalProps {
  report: AnalysisReportSnapshot | null;
  onClose: () => void;
  onExportPdf?: (report: AnalysisReportSnapshot) => void;
}

export const LedgerReportDetailModal: React.FC<LedgerReportDetailModalProps> = ({
  report,
  onClose,
  onExportPdf,
}) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black border border-purple-200 dark:border-purple-800 font-mono">
                {report.version}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {report.id}
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {report.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 결산 핵심 지표 4분할 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
            <span className="text-[10px] text-slate-400 block font-bold">당시 총 수입</span>
            <span className="font-mono font-black text-emerald-600 text-sm">
              +₩{report.totalIncome.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
            <span className="text-[10px] text-slate-400 block font-bold">당시 순수 지출</span>
            <span className="font-mono font-black text-rose-600 text-sm">
              -₩{report.totalExpense.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
            <span className="text-[10px] text-slate-400 block font-bold">당시 순수지</span>
            <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
              +₩{report.netSavings.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
            <span className="text-[10px] text-slate-400 block font-bold">카드 청구액</span>
            <span className="font-mono font-black text-amber-600 text-sm">
              ₩{report.cardBilledTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 집계 기간 및 검증 상태 */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 dark:text-purple-200">
              집계 범위: {report.period}
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              발행시각: {report.createdAt}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-purple-200/60 dark:border-purple-800/60">
            <span className="text-slate-600 dark:text-zinc-300">
              원장 거래 건수: <strong>{report.txCount}건 전수 집계</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
              ✓ 골든소스 SSOT 대사 무결성 검증 통과
            </span>
          </div>
        </div>

        {/* 요약 노트 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
            스냅샷 저장 시점 분석 요약 노트:
          </span>
          <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
            {report.summaryNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <button
            type="button"
            onClick={() => onExportPdf?.(report)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-zinc-200"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-purple-600" />
            <span>PDF 내보내기</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
