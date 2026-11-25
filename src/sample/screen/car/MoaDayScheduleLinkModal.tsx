import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Link2, Clock, Sparkles } from 'lucide-react';
import { MoaDayScheduleCandidate } from './types';

interface MoaDayScheduleLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: MoaDayScheduleCandidate | null;
  onConfirmLink: (schedule: MoaDayScheduleCandidate, markCompleted: boolean) => void;
  onSkipLink?: () => void;
  isDark?: boolean;
}

export const MoaDayScheduleLinkModal: React.FC<MoaDayScheduleLinkModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onConfirmLink,
  onSkipLink,
  isDark = false,
}) => {
  const [markCompleted, setMarkCompleted] = useState<boolean>(true);

  if (!isOpen || !candidate) return null;

  const handleSkip = () => {
    if (onSkipLink) {
      onSkipLink();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">모아데이 계획 상호 연결</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                선택하신 일자에 계획된 모아데이 일정이 발견되었습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 본문 */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>계획과 실적의 상호 연결 (MoaDay ↔ MoaCar)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              이력 등록 시 해당 일자의 모아데이 캘린더 계획을 상호 연결하여, 캘린더와 차량 이력 양쪽에서 완수 여부와 지출 실적을 함께 추적할 수 있습니다.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                모아데이 계획 일정
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {candidate.date}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {candidate.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="mark_completed"
              checked={markCompleted}
              onChange={(e) => setMarkCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="mark_completed" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              연결 시 해당 모아데이 일정을 <strong>[완료]</strong> 상태로 자동 갱신
            </label>
          </div>
        </div>

        {/* 3. 고정 푸터 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            연결 안 함
          </button>
          <button
            type="button"
            onClick={() => onConfirmLink(candidate, markCompleted)}
            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span>상호 연결하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
