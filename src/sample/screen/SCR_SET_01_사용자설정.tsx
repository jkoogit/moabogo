import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ElmTyp01, ElmSld03 } from '../elements/Tokens';
import { DuplicateExpenseReconcileModal } from './car/DuplicateExpenseReconcileModal';
import { INITIAL_DUPLICATE_CANDIDATES } from './car/carMockData';
import {
  loadFinancialCompliance,
  loadNotificationMatrix,
  loadSystemNotices,
} from '../data/systemGovernancePool';
import {
  CarPreferencesState,
  CommonServicePreferences,
  OfflineSyncPreferences,
  loadCarPreferences,
  saveCarPreferences,
  loadDayDisplaySettings,
  saveDayDisplaySettings,
  DAY_SETTINGS_UPDATED_EVENT,
  loadOfflineSyncPreferences,
  saveOfflineSyncPreferences,
  loadCommonServicePreferences,
  saveCommonServicePreferences,
} from '../data/servicePreferencesPool';
import { DisplaySettings } from './day/types';
import { CarSettingsPanel } from './settings/CarSettingsPanel';
import { DaySettingsPanel } from './settings/DaySettingsPanel';
import { OfflineSettingsPanel } from './settings/OfflineSettingsPanel';
import {
  ThemeSettingsTab,
  RoutineSettingsTab,
  PrioritySettingsTab,
} from './settings/ThemeRoutinePriorityTabs';
import { NotifySettingsTab, OcrSettingsTab } from './settings/NotifyOcrTabs';
import { LayoutSettingsTab } from './settings/LayoutSettingsTab';
import { MyAccountSettingsTab } from './settings/MyAccountSettingsTab';
import { ExternalAccountTab } from './settings/ExternalAccountTab';
import { StorePresetTab } from './settings/StorePresetTab';

const SETTINGS_TABS = [
  { id: 'THEME', label: '화면 테마' },
  { id: 'CAR', label: '모아부릉(차량)' },
  { id: 'DAY', label: '모아데이(일정)' },
  { id: 'ROUTINE', label: '모아루틴' },
  { id: 'OFFLINE', label: '오프라인·세션' },
  { id: 'LAYOUT', label: '화면배치·공통' },
  { id: 'NOTIFY', label: '알림설정' },
  { id: 'STORE', label: '게임프리셋' },
  { id: 'EXT_ACCOUNT', label: '거래계좌' },
  { id: 'PRIORITY', label: '우선순위' },
  { id: 'ACCOUNT', label: '송금계좌(내 계좌)' },
  { id: 'OCR', label: 'OCR 키' },
] as const;

export const SCR_SET_01_사용자설정: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('THEME');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 모아부릉·모아데이·오프라인·공통 SSOT 설정
  const [carPrefs, setCarPrefs] = useState<CarPreferencesState>(() => loadCarPreferences());
  const [daySettings, setDaySettings] = useState<DisplaySettings>(() => loadDayDisplaySettings());
  const [offlinePrefs, setOfflinePrefs] = useState<OfflineSyncPreferences>(() =>
    loadOfflineSyncPreferences()
  );
  const [commonPrefs, setCommonPrefs] = useState<CommonServicePreferences>(() =>
    loadCommonServicePreferences()
  );
  const [isCarReconcileModalOpen, setIsCarReconcileModalOpen] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState(INITIAL_DUPLICATE_CANDIDATES);

  // 시스템 전역 거버넌스 정책 연동 (SSOT: systemGovernancePool)
  const [financialCompliance] = useState(() => loadFinancialCompliance());
  const [sysNotifyMatrix] = useState(() => loadNotificationMatrix());
  const [activeSystemNotices] = useState(() => loadSystemNotices().filter((n) => n.isEnabled));
  const [showNoticeBanner, setShowNoticeBanner] = useState<boolean>(true);

  useEffect(() => {
    const syncDay = () => setDaySettings(loadDayDisplaySettings());
    window.addEventListener(DAY_SETTINGS_UPDATED_EVENT, syncDay);
    return () => window.removeEventListener(DAY_SETTINGS_UPDATED_EVENT, syncDay);
  }, []);

  const showQuickToast = (msg?: string) => {
    setToastMessage(
      msg || '✓ 사용자 맞춤 설정이 브라우저 로컬 스토리지에 안전하게 저장되었습니다.'
    );
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleUpdateCarPrefs = (next: CarPreferencesState) => {
    setCarPrefs(next);
    saveCarPreferences(next);
  };

  const handleUpdateDaySettings = (patch: Partial<DisplaySettings>) => {
    setDaySettings((prev) => {
      const updated = { ...prev, ...patch };
      saveDayDisplaySettings(updated);
      return updated;
    });
    showQuickToast();
  };

  const handleUpdateOfflinePrefs = (next: OfflineSyncPreferences) => {
    setOfflinePrefs(next);
    saveOfflineSyncPreferences(next);
  };

  const handleUpdateCommonPrefs = (next: CommonServicePreferences) => {
    setCommonPrefs(next);
    saveCommonServicePreferences(next);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Section 1: Header */}
      <section className="border-b border-slate-200 dark:border-zinc-800 pb-3">
        <ElmTyp01
          title="사용자 맞춤 설정"
          badge="SCR-SET-01"
          subtitle="대시보드 위젯 배치 • 화면 테마 • 단골 매장 • 거래계좌 • 알림 • OCR 키 중앙 집중 제어"
        />
      </section>

      {/* In-app Toast */}
      {toastMessage && (
        <aside className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-600 dark:text-emerald-400"
          >
            ✕
          </button>
        </aside>
      )}

      {/* 플랫폼 전역 공지 배너 연동 */}
      {activeSystemNotices.length > 0 && showNoticeBanner && (
        <aside className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-zinc-100 text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white">
                  플랫폼 긴급 공지
                </span>
                <span>{activeSystemNotices[0].title}</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                {activeSystemNotices[0].content}
              </p>
              {activeSystemNotices[0].hasButton && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
                    {activeSystemNotices[0].buttonText}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNoticeBanner(false)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
            title="공지 닫기"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 2: Settings Tabs with ElmSld03 */}
      <section className="w-full min-w-0">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center min-w-max border-b border-slate-200 dark:border-zinc-800">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] px-5 py-3 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t" />
                  )}
                </button>
              );
            })}
          </div>
        </ElmSld03>
      </section>

      {/* Section 3: Tab Content Panels */}
      {activeTab === 'THEME' && <ThemeSettingsTab />}

      {activeTab === 'CAR' && (
        <CarSettingsPanel
          carPrefs={carPrefs}
          onUpdateCarPrefs={handleUpdateCarPrefs}
          duplicateCandidates={duplicateCandidates}
          onOpenReconcileModal={() => setIsCarReconcileModalOpen(true)}
          onNotify={showQuickToast}
        />
      )}

      {activeTab === 'DAY' && (
        <DaySettingsPanel
          daySettings={daySettings}
          onUpdateDaySettings={handleUpdateDaySettings}
          carSyncCount={carPrefs.settings.sync_to_day_targets.length}
        />
      )}

      {activeTab === 'OFFLINE' && (
        <OfflineSettingsPanel
          offlinePrefs={offlinePrefs}
          onUpdateOfflinePrefs={handleUpdateOfflinePrefs}
          onNotify={showQuickToast}
        />
      )}

      {activeTab === 'ROUTINE' && <RoutineSettingsTab onNotify={showQuickToast} />}

      {activeTab === 'STORE' && <StorePresetTab onNotify={showQuickToast} />}

      {activeTab === 'EXT_ACCOUNT' && <ExternalAccountTab />}

      {activeTab === 'LAYOUT' && (
        <LayoutSettingsTab
          commonPrefs={commonPrefs}
          onUpdateCommonPrefs={handleUpdateCommonPrefs}
          onNotify={showQuickToast}
        />
      )}

      {activeTab === 'PRIORITY' && <PrioritySettingsTab />}

      {activeTab === 'NOTIFY' && (
        <NotifySettingsTab
          sysNotifyMatrix={sysNotifyMatrix}
          commonPrefs={commonPrefs}
          onUpdateCommonPrefs={handleUpdateCommonPrefs}
        />
      )}

      {activeTab === 'ACCOUNT' && (
        <MyAccountSettingsTab financialCompliance={financialCompliance} />
      )}

      {activeTab === 'OCR' && <OcrSettingsTab onNotify={showQuickToast} />}

      {/* 모아부릉 중복지출 정리 모달 */}
      <DuplicateExpenseReconcileModal
        isOpen={isCarReconcileModalOpen}
        onClose={() => setIsCarReconcileModalOpen(false)}
        duplicates={duplicateCandidates}
        onResolveDuplicate={(candidateId, resolution, primaryEntryId) => {
          setDuplicateCandidates((prev) =>
            prev.map((d) =>
              d.candidate_id === candidateId
                ? {
                    ...d,
                    is_resolved: true,
                    resolution_type: resolution,
                    primary_entry_id: primaryEntryId,
                  }
                : d
            )
          );
        }}
        isDark={theme === 'dark' || theme === 'dawn'}
      />
    </div>
  );
};
