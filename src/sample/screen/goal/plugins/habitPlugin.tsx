import React from 'react';
import { Activity, Flame, Users } from 'lucide-react';
import { GoalItem } from '../../../data/goal-mock-data';
import { GoalMetricPlugin } from './pluginContract';

// ============================================================================
// src/sample/screen/goal/plugins/habitPlugin.tsx
// 생활습관 · 운동 (HABIT) 목표 플러그인
// ============================================================================

export const habitPlugin: GoalMetricPlugin = {
  category: 'HABIT',
  label: '생활습관',
  optionLabel: '🏃 생활습관 · 운동 (1만보 걷기, 홈트, 모닝루틴 등)',
  comboLabel: '🏃 생활습관 · 운동',
  defaultUnit: '보',
  defaultTargetValue: 10000,
  sliderConfig: {
    min: 3000,
    max: 25000,
    step: 500,
    label: '일일 습관 인정 기준치',
  },
  badgeColorClass:
    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  enabled: true,

  calculateProgressRate: (goal: GoalItem, nextCurrentTotal: number, overrideTargetValue?: number) => {
    const baseTarget = overrideTargetValue || goal.targetValue || 10000;
    const denominator = Math.max(1, baseTarget * Math.max(1, goal.companions.length));
    return Math.min(100, Math.round((nextCurrentTotal / denominator) * 100));
  },

  renderMetricBadge: (goal: GoalItem) => {
    const completedCount = goal.companions.filter((c) => c.status === 'COMPLETED').length;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 whitespace-nowrap">
        <Activity className="w-3 h-3 shrink-0" />
        <span>
          습관 인증 {completedCount}/{goal.companions.length}명
        </span>
      </span>
    );
  },

  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => {
    const completedCount = goal.companions.filter((c) => c.status === 'COMPLETED').length;
    const totalCount = Math.max(1, goal.companions.length);
    const completionRatio = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
              생활습관 · 운동 플러그인 리포트
            </span>
            <span className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 block">
              1일 인정 기준 <strong>{currentThreshold.toLocaleString()} {goal.unit}</strong> • 동행원
              오늘 완수율 {completionRatio}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>
            달성 {completedCount} / {goal.companions.length}명
          </span>
        </div>
      </div>
    );
  },
};
