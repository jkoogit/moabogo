import React from 'react';
import { BookOpen, Bookmark, GraduationCap } from 'lucide-react';
import { GoalItem } from '../../../data/goal-mock-data';
import { GoalMetricPlugin } from './pluginContract';

// ============================================================================
// src/sample/screen/goal/plugins/studyBookPlugin.tsx
// 자격증 · 학습 (STUDY) 및 도서 · 문화 (BOOK) 플러그인
// ============================================================================

export const studyPlugin: GoalMetricPlugin = {
  category: 'STUDY',
  label: '자격증학습',
  optionLabel: '📚 자격증 · 학습 (기사 자격증, 코딩, 어학 등)',
  comboLabel: '📚 자격증 · 학습',
  defaultUnit: '시간',
  defaultTargetValue: 100,
  sliderConfig: {
    min: 10,
    max: 500,
    step: 5,
    label: '누적 목표 학습 시간',
  },
  badgeColorClass:
    'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  enabled: true,

  calculateProgressRate: (goal: GoalItem, nextCurrentTotal: number, overrideTargetValue?: number) => {
    const baseTarget = Math.max(1, overrideTargetValue || goal.targetValue || 100);
    return Math.min(100, Math.round((nextCurrentTotal / baseTarget) * 100));
  },

  renderMetricBadge: (goal: GoalItem) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 whitespace-nowrap">
      <BookOpen className="w-3 h-3 shrink-0" />
      <span>
        누적 {goal.currentTotal}/{goal.targetValue} {goal.unit}
      </span>
    </span>
  ),

  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => {
    const remaining = Math.max(0, currentThreshold - goal.currentTotal);
    return (
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
              자격증 · 집중 학습 플러그인 트래커
            </span>
            <span className="text-[11px] text-indigo-800/90 dark:text-indigo-300/80 block">
              누적 학습량 <strong>{goal.currentTotal.toLocaleString()} {goal.unit}</strong> • 완주까지{' '}
              <strong>{remaining.toLocaleString()} {goal.unit}</strong> 남음
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
          <span>인증 {goal.records.length}회 기록</span>
        </span>
      </div>
    );
  },
};

export const bookPlugin: GoalMetricPlugin = {
  category: 'BOOK',
  label: '도서문화',
  optionLabel: '📖 도서 · 문화 (월 2권 완독, 전시회, 서평 등)',
  comboLabel: '📖 도서 · 문화',
  defaultUnit: '권',
  defaultTargetValue: 6,
  sliderConfig: {
    min: 1,
    max: 50,
    step: 1,
    label: '목표 완독 권수',
  },
  badgeColorClass:
    'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  enabled: true,

  calculateProgressRate: (goal: GoalItem, nextCurrentTotal: number, overrideTargetValue?: number) => {
    const baseTarget = Math.max(1, overrideTargetValue || goal.targetValue || 6);
    return Math.min(100, Math.round((nextCurrentTotal / baseTarget) * 100));
  },

  renderMetricBadge: (goal: GoalItem) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/70 whitespace-nowrap">
      <Bookmark className="w-3 h-3 shrink-0" />
      <span>
        완독 {goal.currentTotal}/{goal.targetValue} {goal.unit}
      </span>
    </span>
  ),

  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => {
    const remaining = Math.max(0, currentThreshold - goal.currentTotal);
    return (
      <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-purple-950 dark:text-purple-200 block">
              도서 · 문화 서평 챌린지 플러그인
            </span>
            <span className="text-[11px] text-purple-800/90 dark:text-purple-300/80 block">
              완독 현황 <strong>{goal.currentTotal} {goal.unit}</strong> / 목표{' '}
              <strong>{currentThreshold} {goal.unit}</strong> (잔여 {remaining} {goal.unit})
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 whitespace-nowrap">
          <span>서평 피드 {goal.records.length}건</span>
        </span>
      </div>
    );
  },
};
