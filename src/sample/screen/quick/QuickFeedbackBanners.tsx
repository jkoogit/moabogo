import React from 'react';
import { CheckCircle2, WifiOff } from 'lucide-react';

export const QuickOfflineBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
    <WifiOff className="w-4 h-4 shrink-0" />
    <span className="font-semibold break-keep">{message}</span>
  </div>
);

export const QuickSuccessBanner: React.FC<{
  title: string;
  description: string;
  idempotencyKey: string;
  continueLabel: string;
  accentColor?: 'emerald' | 'purple';
  onContinue: () => void;
  onClose?: () => void;
}> = ({
  title,
  description,
  idempotencyKey,
  continueLabel,
  accentColor = 'emerald',
  onContinue,
  onClose,
}) => {
  const isPurple = accentColor === 'purple';
  return (
    <div
      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
        isPurple
          ? 'bg-purple-500/10 border-purple-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}
    >
      <CheckCircle2
        className={`w-5 h-5 shrink-0 mt-0.5 ${
          isPurple ? 'text-purple-500' : 'text-emerald-500'
        }`}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <h4
          className={`text-xs font-bold ${
            isPurple
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-zinc-300 break-keep">{description}</p>
        <p className="text-[10px] font-mono text-slate-400 truncate">
          idempotency_key: {idempotencyKey}
        </p>
        <div className="pt-1.5 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onContinue}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              isPurple
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {continueLabel}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
