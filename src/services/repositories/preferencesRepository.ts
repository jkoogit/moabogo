// ============================================================================
// src/services/repositories/preferencesRepository.ts
// 사용자 설정·계좌·시스템 거버넌스 풀 통합 Repository 추상화
// - 화면/컴포넌트가 localStorage 목업 풀을 직접 참조하지 않고 단일 계약으로 접근
// ============================================================================

import {
  CarPreferencesState,
  CommonServicePreferences,
  OfflineSyncPreferences,
  loadCarPreferences,
  saveCarPreferences,
  loadDayDisplaySettings,
  saveDayDisplaySettings,
  loadOfflineSyncPreferences,
  saveOfflineSyncPreferences,
  loadCommonServicePreferences,
  saveCommonServicePreferences,
  loadRoutineExtendedPreferences,
  saveRoutineExtendedPreferences,
  RoutineExtendedPreferences,
} from '../../sample/data/servicePreferencesPool';
import {
  UserBankAccount,
  loadUserBankAccounts,
  saveUserBankAccounts,
} from '../../sample/data/accountStorePool';
import {
  SystemAuthSecurityConfig,
  SystemNotificationMatrix,
  SystemRetentionPolicy,
  loadAuthSecurityConfig,
  loadNotificationMatrix,
  loadRetentionPolicy,
} from '../../sample/data/systemGovernancePool';
import { DisplaySettings } from '../../sample/screen/day/types';

export const preferencesRepository = {
  getCarPreferences: (): CarPreferencesState => loadCarPreferences(),
  saveCarPreferences: (next: CarPreferencesState): void => saveCarPreferences(next),

  getDayDisplaySettings: (): DisplaySettings => loadDayDisplaySettings(),
  saveDayDisplaySettings: (next: DisplaySettings): void => saveDayDisplaySettings(next),

  getRoutineExtendedPreferences: (): RoutineExtendedPreferences =>
    loadRoutineExtendedPreferences(),
  saveRoutineExtendedPreferences: (next: RoutineExtendedPreferences): void =>
    saveRoutineExtendedPreferences(next),

  getOfflineSyncPreferences: (): OfflineSyncPreferences => loadOfflineSyncPreferences(),
  saveOfflineSyncPreferences: (next: OfflineSyncPreferences): void =>
    saveOfflineSyncPreferences(next),

  getCommonServicePreferences: (): CommonServicePreferences => loadCommonServicePreferences(),
  saveCommonServicePreferences: (next: CommonServicePreferences): void =>
    saveCommonServicePreferences(next),

  getUserBankAccounts: (userId?: string): UserBankAccount[] => loadUserBankAccounts(userId),
  saveUserBankAccounts: (accounts: UserBankAccount[], userId?: string): void =>
    saveUserBankAccounts(accounts, userId),

  getAuthSecurityConfig: (): SystemAuthSecurityConfig => loadAuthSecurityConfig(),
  getNotificationMatrix: (): SystemNotificationMatrix => loadNotificationMatrix(),
  getRetentionPolicy: (): SystemRetentionPolicy => loadRetentionPolicy(),
};
