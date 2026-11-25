import React from 'react';
import { ArrowDown, ArrowUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ElmBsh01, ElmSwt01 } from '../../elements/Tokens';
import {
  DashboardModuleId,
  DashboardPreset,
  ModuleConfig,
  PRESET_LABELS,
} from '../../data/dashboardConfigPool';

interface DashboardCustomizeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleConfig[];
  currentPreset: DashboardPreset;
  onApplyPreset: (preset: DashboardPreset) => void;
  onToggleModule: (id: DashboardModuleId) => void;
  onToggleAll: (checked: boolean) => void;
  onMoveModule: (idx: number, direction: 'UP' | 'DOWN') => void;
  onResetDefault: () => void;
  onSave: () => void;
}

/**
 * SCR_DSH_01 개인화 위젯 배치/숨김 스위처 (ElmBsh01 고정 3분할 바텀시트)
 * - 추천 프리셋 4종 원클릭 적용
 * - 11대 벤토 위젯 On/Off 스위치 및 ▲/▼ 순서 실시간 이동
 */
export const DashboardCustomizeSheet: React.FC<DashboardCustomizeSheetProps> = ({
  isOpen,
  onClose,
  modules,
  currentPreset,
  onApplyPreset,
  onToggleModule,
  onToggleAll,
  onMoveModule,
  onResetDefault,
  onSave,
}) => {
  const allEnabled = modules.length > 0 && modules.every((m) => m.enabled);
  const enabledCount = modules.filter((m) => m.enabled).length;

  const footer = (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap">
        활성 위젯 {enabledCount}/{modules.length}개 · SCR-SET-01 동기화
      </span>
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer whitespace-nowrap transition-colors"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={onSave}
          className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs whitespace-nowrap transition-colors"
        >
          저장 완료
        </button>
      </div>
    </div>
  );

  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={onClose}
      title="대시보드 위젯 배치 & 숨김 설정"
      badge="SCR-DSH-01"
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4">
        {/* 1. 추천 프리셋 4종 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>추천 배치 프리셋</span>
            </span>
            <button
              type="button"
              onClick={onResetDefault}
              className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
              title="대시보드 배치 기본값 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>초기화</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['DEFAULT', 'FINANCE_FIRST', 'LIFE_FIRST', 'QUICK_GAME'] as DashboardPreset[]).map(
              (presetKey) => {
                const isSelected = currentPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => onApplyPreset(presetKey)}
                    className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    {PRESET_LABELS[presetKey].title}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* 2. 상세 위젯 스위처 및 순서 이동 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <ElmSwt01
              checked={allEnabled}
              onChange={onToggleAll}
              label="전체 위젯 일괄 표시/숨김"
              className="[&_span]:dark:text-zinc-200"
            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              ▲/▼ 버튼으로 그리드 순서 즉시 재배치
            </span>
          </div>

          <div className="space-y-2">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                  m.enabled
                    ? 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                    : 'border-slate-200/60 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-black text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {m.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 whitespace-nowrap shrink-0">
                        {m.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.description}</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onMoveModule(idx, 'UP')}
                    disabled={idx === 0}
                    aria-label={`${m.title} 위로 이동`}
                    className="min-h-[40px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveModule(idx, 'DOWN')}
                    disabled={idx === modules.length - 1}
                    aria-label={`${m.title} 아래로 이동`}
                    className="min-h-[40px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <ElmSwt01
                    checked={m.enabled}
                    onChange={() => onToggleModule(m.id)}
                    className="pl-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ElmBsh01>
  );
};
