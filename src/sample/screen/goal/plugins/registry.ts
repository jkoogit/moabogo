import { GoalCategory } from '../../../data/goal-mock-data';
import { GoalMetricPlugin } from './pluginContract';
import { habitPlugin } from './habitPlugin';
import { financePlugin, savingPlugin } from './financePlugin';
import { studyPlugin, bookPlugin } from './studyBookPlugin';

// ============================================================================
// src/sample/screen/goal/plugins/registry.ts
// 모아목표 플러그인 레지스트리 (SSOT)
// - 신규 목표 유형 추가 시 이 레지스트리에만 등록하면 SCR_GOL_01/02에 자동 반영
// ============================================================================

export const GOAL_PLUGINS: GoalMetricPlugin[] = [
  habitPlugin,
  financePlugin,
  studyPlugin,
  bookPlugin,
  savingPlugin,
];

const PLUGIN_MAP = new Map<GoalCategory, GoalMetricPlugin>(
  GOAL_PLUGINS.map((plugin) => [plugin.category, plugin])
);

export function getEnabledGoalPlugins(): GoalMetricPlugin[] {
  return GOAL_PLUGINS.filter((p) => p.enabled);
}

export function getGoalPlugin(category: GoalCategory | string): GoalMetricPlugin {
  return PLUGIN_MAP.get(category as GoalCategory) || habitPlugin;
}

export function getGoalCategoryOptions(): Array<{ value: GoalCategory; label: string }> {
  return getEnabledGoalPlugins().map((plugin) => ({
    value: plugin.category,
    label: plugin.optionLabel,
  }));
}

export function getGoalComboOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'ALL', label: '전체 목표' },
    ...getEnabledGoalPlugins().map((plugin) => ({
      value: plugin.category,
      label: plugin.comboLabel,
    })),
  ];
}
