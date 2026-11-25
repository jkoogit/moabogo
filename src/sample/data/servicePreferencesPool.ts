// ============================================================================
// src/sample/data/servicePreferencesPool.ts
// 모아부릉·모아데이·모아루틴·오프라인·전서비스 공통 사용자설정 SSOT 풀
// DB 매핑: user_service_preferences (service_code = 'CAR'|'DAY'|'ROUTINE'|'OFFLINE'|'LEDGER')
// ============================================================================

import { Vehicle, CarUserSettings, VehicleMaintenanceRule } from '../screen/car/types';
import { INITIAL_VEHICLES, INITIAL_CAR_SETTINGS } from '../screen/car/carMockData';
import { DEFAULT_DISPLAY_SETTINGS, DisplaySettings } from '../screen/day/types';

/* -------------------------------------------------------------------------
   1. 모아부릉 (CAR) 차량 목록, 프라이버시, 모아데이 투영, 소모품 주기 프리셋
   ------------------------------------------------------------------------- */
export interface CarMaintenanceDefaultPreset {
  ruleType: VehicleMaintenanceRule['rule_type'];
  label: string;
  intervalMonths?: number;
  intervalKm?: number;
  alertDaysBefore: number;
}

export interface CarPreferencesState {
  vehicles: Vehicle[];
  settings: CarUserSettings;
  maintenancePresets: CarMaintenanceDefaultPreset[];
}

export const DEFAULT_CAR_MAINTENANCE_PRESETS: CarMaintenanceDefaultPreset[] = [
  { ruleType: 'ENGINE_OIL', label: '엔진오일 & 필터 세트', intervalMonths: 6, intervalKm: 10000, alertDaysBefore: 14 },
  { ruleType: 'AIR_FILTER', label: '에어컨/캐빈 필터', intervalMonths: 6, intervalKm: 10000, alertDaysBefore: 14 },
  { ruleType: 'TIRE_ROTATION', label: '타이어 위치교환', intervalMonths: 12, intervalKm: 15000, alertDaysBefore: 14 },
  { ruleType: 'LEGAL_INSPECTION', label: '정기종합검사', intervalMonths: 24, alertDaysBefore: 30 },
  { ruleType: 'INSURANCE_RENEWAL', label: '자동차보험 갱신', intervalMonths: 12, alertDaysBefore: 30 },
  { ruleType: 'PARKING_PASS', label: '월 정기주차권 갱신', intervalMonths: 1, alertDaysBefore: 3 },
];

export const CAR_PREFS_STORAGE_KEY = 'moabogo_car_preferences_v1';
export const CAR_PREFS_UPDATED_EVENT = 'moabogo_car_preferences_updated';

export function maskPlateNumber(plateNumber: string, shouldMask: boolean): string {
  if (!shouldMask || !plateNumber) return plateNumber;
  const trimmed = plateNumber.trim();
  if (trimmed.length <= 2) return '**';
  return `${trimmed.slice(0, -2)}**`;
}

export function loadCarPreferences(): CarPreferencesState {
  const fallback: CarPreferencesState = {
    vehicles: INITIAL_VEHICLES,
    settings: INITIAL_CAR_SETTINGS,
    maintenancePresets: DEFAULT_CAR_MAINTENANCE_PRESETS,
  };
  try {
    const raw = localStorage.getItem(CAR_PREFS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      vehicles: Array.isArray(parsed?.vehicles) && parsed.vehicles.length > 0 ? parsed.vehicles : INITIAL_VEHICLES,
      settings: {
        ...INITIAL_CAR_SETTINGS,
        ...(parsed?.settings || {}),
      },
      maintenancePresets:
        Array.isArray(parsed?.maintenancePresets) && parsed.maintenancePresets.length > 0
          ? parsed.maintenancePresets
          : DEFAULT_CAR_MAINTENANCE_PRESETS,
    };
  } catch {
    return fallback;
  }
}

export function saveCarPreferences(next: CarPreferencesState): void {
  try {
    localStorage.setItem(CAR_PREFS_STORAGE_KEY, JSON.stringify(next));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CAR_PREFS_UPDATED_EVENT, { detail: next }));
    }
  } catch (err) {
    console.error('Failed to save car preferences:', err);
  }
}

/* -------------------------------------------------------------------------
   2. 모아데이 (DAY) 표시·수집 설정 양방향 SSOT (moabogo_day_settings_v2)
   ------------------------------------------------------------------------- */
export const DAY_SETTINGS_STORAGE_KEY = 'moabogo_day_settings_v2';
export const DAY_SETTINGS_UPDATED_EVENT = 'moabogo_day_settings_updated';

export function loadDayDisplaySettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(DAY_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DISPLAY_SETTINGS };
    return { ...DEFAULT_DISPLAY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DISPLAY_SETTINGS };
  }
}

export function saveDayDisplaySettings(settings: DisplaySettings): void {
  try {
    localStorage.setItem(DAY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DAY_SETTINGS_UPDATED_EVENT, { detail: settings }));
    }
  } catch (err) {
    console.error('Failed to save day display settings:', err);
  }
}

/* -------------------------------------------------------------------------
   3. 모아루틴 (ROUTINE) 운영 세부 기본값
   ------------------------------------------------------------------------- */
export interface RoutineExtendedPreferences {
  defaultBriefingTime: string;
  streakGraceDays: 0 | 1 | 2;
  mvnoDefaultMaxLines: number;
  taxReminderDaysBefore: 1 | 3 | 5 | 7;
}

export const DEFAULT_ROUTINE_EXTENDED_PREFS: RoutineExtendedPreferences = {
  defaultBriefingTime: '08:30',
  streakGraceDays: 0,
  mvnoDefaultMaxLines: 5,
  taxReminderDaysBefore: 3,
};

export const ROUTINE_EXTENDED_STORAGE_KEY = 'moabogo_routine_extended_prefs_v1';
export const ROUTINE_EXTENDED_UPDATED_EVENT = 'moabogo_routine_extended_prefs_updated';

export function loadRoutineExtendedPreferences(): RoutineExtendedPreferences {
  try {
    const raw = localStorage.getItem(ROUTINE_EXTENDED_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ROUTINE_EXTENDED_PREFS };
    return { ...DEFAULT_ROUTINE_EXTENDED_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ROUTINE_EXTENDED_PREFS };
  }
}

export function saveRoutineExtendedPreferences(prefs: RoutineExtendedPreferences): void {
  try {
    localStorage.setItem(ROUTINE_EXTENDED_STORAGE_KEY, JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ROUTINE_EXTENDED_UPDATED_EVENT, { detail: prefs }));
    }
  } catch (err) {
    console.error('Failed to save routine extended preferences:', err);
  }
}

/* -------------------------------------------------------------------------
   4. 오프라인·세션 (OFFLINE) 동기화 및 충돌 정책
   ------------------------------------------------------------------------- */
export interface OfflineSyncPreferences {
  autoSyncIntervalSec: 0 | 30 | 60 | 300;
  defaultConflictPolicy: 'MANUAL_CONFIRM' | 'AUTO_OVERWRITE';
}

export const DEFAULT_OFFLINE_SYNC_PREFS: OfflineSyncPreferences = {
  autoSyncIntervalSec: 30,
  defaultConflictPolicy: 'MANUAL_CONFIRM',
};

export const OFFLINE_PREFS_STORAGE_KEY = 'moabogo_offline_prefs_v1';
export const OFFLINE_PREFS_UPDATED_EVENT = 'moabogo_offline_prefs_updated';

export function loadOfflineSyncPreferences(): OfflineSyncPreferences {
  try {
    const raw = localStorage.getItem(OFFLINE_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_OFFLINE_SYNC_PREFS };
    return { ...DEFAULT_OFFLINE_SYNC_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_OFFLINE_SYNC_PREFS };
  }
}

export function saveOfflineSyncPreferences(prefs: OfflineSyncPreferences): void {
  try {
    localStorage.setItem(OFFLINE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OFFLINE_PREFS_UPDATED_EVENT, { detail: prefs }));
    }
  } catch (err) {
    console.error('Failed to save offline sync preferences:', err);
  }
}

/* -------------------------------------------------------------------------
   5. 전 서비스 공통 (LEDGER · MYP · 전 서비스 개인 알림)
   ------------------------------------------------------------------------- */
export interface CommonServicePreferences {
  defaultLedgerId: string;
  expenseCategoryOrder: string[];
  mypageQuickAccountCopy: boolean;
  mypageProfileVisibility: 'PUBLIC_GROUP' | 'SUMMARY_ONLY' | 'PRIVATE';
  notifyCar: boolean;
  notifyDay: boolean;
  notifyRoutine: boolean;
}

export const DEFAULT_EXPENSE_CATEGORY_ORDER: string[] = [
  '식비 & 장보기',
  '카페 & 디저트',
  '교통 & 주유',
  '주거 & 통신',
  '쇼핑 & 생활용품',
  '문화 & 여가',
];

export const DEFAULT_COMMON_SERVICE_PREFS: CommonServicePreferences = {
  defaultLedgerId: 'led-1',
  expenseCategoryOrder: [...DEFAULT_EXPENSE_CATEGORY_ORDER],
  mypageQuickAccountCopy: true,
  mypageProfileVisibility: 'PUBLIC_GROUP',
  notifyCar: true,
  notifyDay: true,
  notifyRoutine: true,
};

export const COMMON_PREFS_STORAGE_KEY = 'moabogo_common_service_prefs_v1';
export const COMMON_PREFS_UPDATED_EVENT = 'moabogo_common_service_prefs_updated';

export function loadCommonServicePreferences(): CommonServicePreferences {
  try {
    const raw = localStorage.getItem(COMMON_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COMMON_SERVICE_PREFS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMMON_SERVICE_PREFS,
      ...parsed,
      expenseCategoryOrder:
        Array.isArray(parsed?.expenseCategoryOrder) && parsed.expenseCategoryOrder.length > 0
          ? parsed.expenseCategoryOrder
          : [...DEFAULT_EXPENSE_CATEGORY_ORDER],
    };
  } catch {
    return { ...DEFAULT_COMMON_SERVICE_PREFS };
  }
}

export function saveCommonServicePreferences(prefs: CommonServicePreferences): void {
  try {
    localStorage.setItem(COMMON_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COMMON_PREFS_UPDATED_EVENT, { detail: prefs }));
    }
  } catch (err) {
    console.error('Failed to save common service preferences:', err);
  }
}
