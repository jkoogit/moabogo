import React from 'react';
import { Wallet, PiggyBank, ArrowLeftRight } from 'lucide-react';
import { GoalItem } from '../../../data/goal-mock-data';
import { GoalMetricPlugin } from './pluginContract';

// ============================================================================
// src/sample/screen/goal/plugins/financePlugin.tsx
// 정기적금 · 자산 (FINANCE) 및 소비절약 · 생활 (SAVING) 플러그인
// - 금전관리 3대 원칙 준수: 자산 이동(TRANSFER) 기반 가계부 단일 귀속 배지 제공
// ============================================================================

export const financePlugin: GoalMetricPlugin = {
  category: 'FINANCE',
  label: '재무저축',
  optionLabel: '💰 정기적금 · 자산 (목돈 모으기, 주간 저축 등)',
  comboLabel: '💰 정기적금 · 자산',
  defaultUnit: '원',
  defaultTargetValue: 10000000,
  sliderConfig: {
    min: 100000,
    max: 20000000,
    step: 100000,
    label: '목표 저축 기준 금액',
  },
  badgeColorClass:
    'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  enabled: true,

  calculateProgressRate: (goal: GoalItem, nextCurrentTotal: number, overrideTargetValue?: number) => {
    const baseTarget = Math.max(1, overrideTargetValue || goal.targetValue || 1000000);
    return Math.min(100, Math.round((nextCurrentTotal / baseTarget) * 100));
  },

  renderMetricBadge: (goal: GoalItem) => {
    const remaining = Math.max(0, goal.targetValue - goal.currentTotal);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70 whitespace-nowrap">
        <Wallet className="w-3 h-3 shrink-0" />
        <span>잔여 {remaining.toLocaleString()}원</span>
      </span>
    );
  },

  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => {
    const remaining = Math.max(0, currentThreshold - goal.currentTotal);
    return (
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-amber-950 dark:text-amber-200 block">
              정기적금 · 자산 목표 플러그인 (TRANSFER 연동)
            </span>
            <span className="text-[11px] text-amber-800/90 dark:text-amber-300/80 block">
              누적 저축 <strong>₩{goal.currentTotal.toLocaleString()}</strong> • 목표까지 잔여{' '}
              <strong>₩{remaining.toLocaleString()}</strong>
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 whitespace-nowrap">
          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          <span>이중계상 차단(TRANSFER)</span>
        </span>
      </div>
    );
  },
};

export const savingPlugin: GoalMetricPlugin = {
  category: 'SAVING',
  label: '소비절약',
  optionLabel: '🎯 소비절약 · 생활 (외식비 줄이기, 배달 금지 등)',
  comboLabel: '🎯 소비절약 · 생활',
  defaultUnit: '원',
  defaultTargetValue: 300000,
  sliderConfig: {
    min: 10000,
    max: 3000000,
    step: 10000,
    label: '월간 목표 절약 예산 한도',
  },
  badgeColorClass:
    'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  enabled: true,

  calculateProgressRate: (goal: GoalItem, nextCurrentTotal: number, overrideTargetValue?: number) => {
    const baseTarget = Math.max(1, overrideTargetValue || goal.targetValue || 300000);
    return Math.min(100, Math.round((nextCurrentTotal / baseTarget) * 100));
  },

  renderMetricBadge: (goal: GoalItem) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/70 whitespace-nowrap">
      <PiggyBank className="w-3 h-3 shrink-0" />
      <span>절약 {goal.currentTotal.toLocaleString()} {goal.unit}</span>
    </span>
  ),

  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => {
    const remaining = Math.max(0, currentThreshold - goal.currentTotal);
    return (
      <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-rose-950 dark:text-rose-200 block">
              소비절약 · 무지출 챌린지 플러그인
            </span>
            <span className="text-[11px] text-rose-800/90 dark:text-rose-300/80 block">
              절약 목표 한도 <strong>{currentThreshold.toLocaleString()} {goal.unit}</strong> • 남은
              절약 목표 {remaining.toLocaleString()} {goal.unit}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 whitespace-nowrap">
          <span>절약 달성률 {goal.progressRate}%</span>
        </span>
      </div>
    );
  },
};
