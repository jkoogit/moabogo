import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeMode } from '../../../context/ThemeContext';

export function getBentoSurfaceClass(resolvedTheme: ThemeMode): string {
  if (resolvedTheme === 'dawn') return 'bg-[#0d1838] border-[#1e3a6d]';
  if (resolvedTheme === 'dark') return 'bg-[#18181b] border-[#27272a]';
  return 'bg-white border-slate-200';
}

export function getBentoSubCardClass(resolvedTheme: ThemeMode): string {
  if (resolvedTheme === 'dawn') return 'border-[#1e3a6d] bg-[#101e42]/50';
  if (resolvedTheme === 'dark') return 'border-zinc-800 bg-zinc-900/50';
  return 'border-slate-200/80 bg-slate-50/70';
}

export function getBentoBorderClass(resolvedTheme: ThemeMode): string {
  if (resolvedTheme === 'dawn') return 'border-[#1e3a6d]';
  if (resolvedTheme === 'dark') return 'border-zinc-800';
  return 'border-slate-100';
}

interface BentoCardHeaderProps {
  resolvedTheme: ThemeMode;
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  countBadge?: string;
  subtitle: string;
  screenBadge: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  extraAction?: React.ReactNode;
}

export const BentoCardHeader: React.FC<BentoCardHeaderProps> = ({
  resolvedTheme,
  icon,
  iconBgClass,
  title,
  countBadge,
  subtitle,
  screenBadge,
  isExpanded,
  onToggleExpand,
  extraAction,
}) => (
  <div className="flex items-start justify-between gap-2 flex-wrap mb-3.5">
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <span className={`p-1.5 rounded-lg shrink-0 ${iconBgClass}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
          <span className="whitespace-nowrap">{title}</span>
          {countBadge && (
            <span className="text-[11px] font-normal text-slate-400 whitespace-nowrap">
              {countBadge}
            </span>
          )}
        </h3>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>
      </div>
    </div>

    <div className="flex items-center gap-1.5 ml-auto shrink-0">
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 whitespace-nowrap">
        {screenBadge}
      </span>
      {extraAction}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-label={`${title} ${isExpanded ? '접기' : '펼치기'}`}
        className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 shadow-2xs ${
          resolvedTheme === 'dawn'
            ? 'bg-[#101e42] border-[#1e3a6d] text-slate-300 hover:text-white hover:border-indigo-400'
            : resolvedTheme === 'dark'
            ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
        }`}
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  </div>
);
