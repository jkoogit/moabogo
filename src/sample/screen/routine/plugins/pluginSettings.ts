// ============================================================================
// src/sample/screen/routine/plugins/pluginSettings.ts
// 모아루틴 4대 플러그인 동적 ON/OFF 설정 (SSOT & LocalStorage 영속화)
// ============================================================================

import { RoutineCategory } from '../types';

export interface RoutinePluginSettings {
  HEALTH_MEDICINE: boolean;
  LIFE_PHONE: boolean;
  BIZ_TAX: boolean;
  FINANCE_CARD_SETTLE: boolean;
}

export const DEFAULT_ROUTINE_PLUGIN_SETTINGS: RoutinePluginSettings = {
  HEALTH_MEDICINE: true,
  LIFE_PHONE: true,
  BIZ_TAX: true,
  FINANCE_CARD_SETTLE: true,
};

export const ROUTINE_PLUGIN_SETTINGS_KEY = 'moabogo_routine_plugin_settings_v1';
export const ROUTINE_PLUGIN_SETTINGS_EVENT = 'moabogo_routine_plugin_settings_changed';

export function loadRoutinePluginSettings(): RoutinePluginSettings {
  try {
    const raw = localStorage.getItem(ROUTINE_PLUGIN_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_ROUTINE_PLUGIN_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      HEALTH_MEDICINE: parsed.HEALTH_MEDICINE ?? true,
      LIFE_PHONE: parsed.LIFE_PHONE ?? true,
      BIZ_TAX: parsed.BIZ_TAX ?? true,
      FINANCE_CARD_SETTLE: parsed.FINANCE_CARD_SETTLE ?? true,
    };
  } catch {
    return { ...DEFAULT_ROUTINE_PLUGIN_SETTINGS };
  }
}

export function saveRoutinePluginSettings(settings: RoutinePluginSettings): void {
  try {
    localStorage.setItem(ROUTINE_PLUGIN_SETTINGS_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(ROUTINE_PLUGIN_SETTINGS_EVENT, { detail: settings })
      );
    }
  } catch (err) {
    console.error('Failed to save routine plugin settings:', err);
  }
}

export function isPluginCategoryEnabled(
  category: RoutineCategory,
  settings?: RoutinePluginSettings
): boolean {
  const current = settings || loadRoutinePluginSettings();
  return current[category] ?? true;
}
