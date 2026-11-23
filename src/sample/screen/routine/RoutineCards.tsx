// ============================================================================
// src/sample/screen/routine/RoutineCards.tsx
// 모아루틴 카드·리스트 셸 렌더러 (Strategy Registry 위임 — OCP/SRP 완결)
// ============================================================================

import React from 'react';
import { RoutineItem } from './types';
import { getRoutinePlugin } from './plugins/registry';
import { RoutineCardActionHandlers } from './plugins/pluginContract';

export type { RoutineCardActionHandlers } from './plugins/pluginContract';
export { RoutineHelpTooltip } from './plugins/pluginContract';

/**
 * 카드 뷰 디스패처: 카테고리별 등록된 플러그인에 렌더링 완전 위임
 */
export const RoutineCardRenderer: React.FC<{
  item: RoutineItem;
  handlers: RoutineCardActionHandlers;
}> = ({ item, handlers }) => {
  const plugin = getRoutinePlugin(item.category);
  if (!plugin || !plugin.enabled) return null;
  return <>{plugin.renderCard(item, handlers)}</>;
};

/**
 * 컴팩트 리스트 뷰 행 렌더러: 플러그인 getListSummary 결과로 표준 1행 구성
 */
export const RoutineListRow: React.FC<{
  item: RoutineItem;
  handlers: RoutineCardActionHandlers;
}> = ({ item, handlers }) => {
  const plugin = getRoutinePlugin(item.category);
  if (!plugin || !plugin.enabled) return null;

  const { meta } = plugin;
  const summary = plugin.getListSummary(item, handlers);

  return (
    <div
      onClick={() => handlers.onOpenDetail(item.id)}
      className="px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.accentBg} ${meta.accentText}`}
        >
          {plugin.renderIcon('w-4 h-4')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>
              {meta.shortLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{meta.cycleBadge}</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
            {item.title}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
        <div className="text-right tabular-nums">
          <div className={`text-xs font-bold whitespace-nowrap ${summary.statusClass}`}>
            {summary.statusText}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono whitespace-nowrap">
            {summary.metricText}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            summary.onQuickAction();
          }}
          className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          {summary.quickActionLabel}
        </button>
      </div>
    </div>
  );
};
