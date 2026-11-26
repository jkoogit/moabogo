import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RefreshCw,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  ModuleConfig,
  DashboardModuleId,
  DashboardPreset,
  DEFAULT_MODULES,
  PRESET_LABELS,
  loadDashboardModules,
  saveDashboardModules,
  applyDashboardPreset,
} from '../../data/dashboardConfigPool';
import { CommonServicePreferences } from '../../data/servicePreferencesPool';
import { CommonServicePanel } from './CommonServicePanel';

interface LayoutSettingsTabProps {
  commonPrefs: CommonServicePreferences;
  onUpdateCommonPrefs: (next: CommonServicePreferences) => void;
  onNotify: (msg?: string) => void;
}

export const LayoutSettingsTab: React.FC<LayoutSettingsTabProps> = ({
  commonPrefs,
  onUpdateCommonPrefs,
  onNotify,
}) => {
  const [dashboardModules, setDashboardModules] = useState<ModuleConfig[]>(() =>
    loadDashboardModules()
  );
  const [selectedPreset, setSelectedPreset] = useState<DashboardPreset>('DEFAULT');
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<ModuleConfig>(() => {
    const mods = loadDashboardModules();
    return mods[0] || DEFAULT_MODULES[0];
  });

  const handleToggleModule = (id: DashboardModuleId) => {
    setDashboardModules((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
      saveDashboardModules(updated);
      const nextPreview = updated.find((m) => m.id === selectedPreviewModule.id);
      if (nextPreview) setSelectedPreviewModule(nextPreview);
      return updated;
    });
  };

  const handleMoveModule = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashboardModules.length) return;

    setDashboardModules((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      saveDashboardModules(updated);
      return updated;
    });
  };

  const handleApplyPreset = (preset: DashboardPreset) => {
    setSelectedPreset(preset);
    const updated = applyDashboardPreset(preset, dashboardModules);
    setDashboardModules(updated);
    saveDashboardModules(updated);
    onNotify();
  };

  return (
    <section className="space-y-5">
      {/* 1. 추천 프리셋 퀵 선택 바 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>대시보드 추천 배치 프리셋</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              라이프스타일에 맞게 위젯 순서를 원클릭으로 최적화합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleApplyPreset('DEFAULT')}
            className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="기본값으로 되돌리기"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(['DEFAULT', 'FINANCE_FIRST', 'LIFE_FIRST', 'QUICK_GAME'] as DashboardPreset[]).map(
            (presetKey) => {
              const info = PRESET_LABELS[presetKey];
              const isSelected = selectedPreset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handleApplyPreset(presetKey)}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-50/50 dark:bg-[#0E131F]/50 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {info.title}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {info.desc}
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 2. 위젯 순서 및 On/Off 중앙 제어 + 썸네일 미리보기 2-패널 (반응형) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 좌측 패널: 위젯 목록 및 순서 조정 / 활성화 토글 (7열) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
              위젯 노출 순서 및 표시 설정 ({dashboardModules.filter((m) => m.enabled).length}/
              {dashboardModules.length}개 표시)
            </span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              ↑↓ 화살표로 순서 이동
            </span>
          </div>

          <div className="space-y-2">
            {dashboardModules.map((module, idx) => {
              const isSelected = selectedPreviewModule.id === module.id;
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedPreviewModule(module)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                      : 'border-slate-200/90 dark:border-zinc-800 bg-slate-50/30 dark:bg-[#111726]/40 hover:bg-slate-50 dark:hover:bg-[#162035]'
                  }`}
                >
                  {/* Left: Drag Index + Title & Category */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[11px] font-black flex items-center justify-center text-slate-600 dark:text-zinc-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {module.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                          {module.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 max-w-[220px] sm:max-w-[280px]">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions (Move Up/Down + Toggle Switch) */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveModule(idx, 'UP')}
                      className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="위로 이동"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === dashboardModules.length - 1}
                      onClick={() => handleMoveModule(idx, 'DOWN')}
                      className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="아래로 이동"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleModule(module.id)}
                      className={`min-h-[34px] px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        module.enabled
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {module.enabled ? '표시' : '숨김'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 패널: 선택된 위젯의 썸네일 / 샘플 시각화 미리보기 카드 (5열) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>위젯 미리보기 뷰어</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {selectedPreviewModule.category}
              </span>
            </div>

            {/* 위젯 샘플 비주얼 썸네일 카드 */}
            <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0B0F17] dark:to-indigo-950/20 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                  {selectedPreviewModule.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedPreviewModule.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {selectedPreviewModule.enabled ? '● 현재 활성' : '○ 숨김 상태'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300">
                {selectedPreviewModule.description}
              </p>

              {/* 상세 기능 특징 목록 */}
              {selectedPreviewModule.detailFeatures && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                    주요 기능 구성
                  </span>
                  {selectedPreviewModule.detailFeatures.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 동기화 상태 배너 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>✓ 변경 사항은 로그인 메인 대시보드에 즉시 실시간 동기화됩니다.</span>
          </div>
        </div>
      </div>

      {/* 3. 전 서비스 공통: 가계부 기본 귀속/카테고리 & 마이페이지 노출 설정 */}
      <CommonServicePanel
        commonPrefs={commonPrefs}
        onUpdateCommonPrefs={onUpdateCommonPrefs}
        onNotify={onNotify}
      />
    </section>
  );
};
