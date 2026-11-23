// ============================================================================
// src/sample/screen/routine/plugins/registry.ts
// 모아루틴 차별기능 전략 레지스트리 (SSOT)
// - 신규 루틴 추가 시 이 파일에 1줄 등록만으로 카드/리스트/등록/상세/KPI 자동 연동
// ============================================================================

import { RoutineCategory, RoutineItem } from '../types';
import { RoutinePlugin } from './pluginContract';
import { medicinePlugin } from './medicinePlugin';
import { mvnoPlugin } from './mvnoPlugin';
import { taxInvoicePlugin } from './taxInvoicePlugin';
import { cardSettlePlugin } from './cardSettlePlugin';

const PLUGIN_LIST: Array<RoutinePlugin<any>> = [
  medicinePlugin,
  mvnoPlugin,
  taxInvoicePlugin,
  cardSettlePlugin,
];

export const ROUTINE_PLUGIN_MAP: Record<RoutineCategory, RoutinePlugin<any>> = {
  HEALTH_MEDICINE: medicinePlugin,
  LIFE_PHONE: mvnoPlugin,
  BIZ_TAX: taxInvoicePlugin,
  FINANCE_CARD_SETTLE: cardSettlePlugin,
};

export function getRoutinePlugin(category: RoutineCategory): RoutinePlugin<any> {
  return ROUTINE_PLUGIN_MAP[category];
}

export function getEnabledRoutinePlugins(): Array<RoutinePlugin<any>> {
  return PLUGIN_LIST.filter((plugin) => plugin.enabled);
}

export function isRoutineItemUrgent(item: RoutineItem): boolean {
  const plugin = getRoutinePlugin(item.category);
  return plugin ? plugin.isUrgent(item) : false;
}
