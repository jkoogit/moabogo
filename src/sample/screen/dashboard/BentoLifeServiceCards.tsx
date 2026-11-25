import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Flame,
  History,
  Repeat,
} from 'lucide-react';
import { ThemeMode } from '../../../context/ThemeContext';
import { ElmSld03 } from '../../elements/Tokens';
import { INITIAL_ROUTINES } from '../routine/routineMockData';
import {
  loadRoutinePluginSettings,
  ROUTINE_PLUGIN_SETTINGS_EVENT,
  RoutinePluginSettings,
} from '../routine/plugins/pluginSettings';
import { ROUTINE_CATEGORY_META, RoutineCategory } from '../routine/types';
import {
  BentoCardHeader,
  getBentoBorderClass,
  getBentoSubCardClass,
  getBentoSurfaceClass,
} from './BentoCardShell';

interface DayScheduleSummary {
  id: string;
  source: '가계부' | '모아당번' | '모아목표' | '모아루틴';
  title: string;
  dateText: string;
  dDayBadge: string;
  badgeClass: string;
}

const DAY_SCHEDULE_ITEMS: DayScheduleSummary[] = [
  {
    id: 'day-1',
    source: '가계부',
    title: '삼성카드 & 가족 공과금 자동이체 마감',
    dateText: '오늘 17:00',
    dDayBadge: 'D-DAY',
    badgeClass:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'day-2',
    source: '모아당번',
    title: '거실 청소기 & 분리수거 (구본영 순번)',
    dateText: '오늘 20:00',
    dDayBadge: '오늘',
    badgeClass:
      'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'day-3',
    source: '모아루틴',
    title: '알뜰폰 2026-2차 프로모션 만료 점검',
    dateText: '11.28 (토)',
    dDayBadge: 'D-3',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'day-4',
    source: '모아목표',
    title: '가족 1만보 건강 챌린지 4주차 정산',
    dateText: '11.30 (월)',
    dDayBadge: 'D-5',
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
];

/** MODULE: 📅 모아데이 전역 일정 & 스마트 다이어리 벤토 카드 (2-Col) */
export const DayBentoCard: React.FC<{
  resolvedTheme: ThemeMode;
  orderStyle: React.CSSProperties;
  onNavigate?: (screenId: string) => void;
}> = ({ resolvedTheme, orderStyle, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('전체');

  const filteredItems = useMemo(() => {
    if (sourceFilter === '전체') return DAY_SCHEDULE_ITEMS;
    return DAY_SCHEDULE_ITEMS.filter((item) => item.source === sourceFilter);
  }, [sourceFilter]);

  return (
    <section
      style={orderStyle}
      className={`md:col-span-2 lg:col-span-2 p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${getBentoSurfaceClass(
        resolvedTheme
      )}`}
    >
      <div>
        <BentoCardHeader
          resolvedTheme={resolvedTheme}
          icon={<Calendar className="w-4 h-4" />}
          iconBgClass="bg-indigo-500/10 text-indigo-500"
          title="모아데이 전역 일정"
          countBadge={`(${DAY_SCHEDULE_ITEMS.length}건 예정)`}
          subtitle="4대 서비스 일정 허브 · 스마트 다이어리 · N년 전 오늘 회고"
          screenBadge="SCR-DAY-01"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
        />

        {isExpanded && (
          <div className="space-y-3">
            <ElmSld03 showNavButtons={false} stepWidth={110} innerClassName="flex items-center gap-1.5">
              {['전체', '가계부', '모아당번', '모아목표', '모아루틴'].map((tab) => {
                const active = sourceFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourceFilter(tab);
                    }}
                    className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </ElmSld03>

            <div className="space-y-2">
              {filteredItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${getBentoSubCardClass(
                    resolvedTheme
                  )}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 ${item.badgeClass}`}
                    >
                      {item.source}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">
                      {item.dateText}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold whitespace-nowrap">
                      {item.dDayBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${getBentoSubCardClass(
                resolvedTheme
              )}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <History className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] text-slate-600 dark:text-zinc-300 truncate">
                  <strong className="text-amber-600 dark:text-amber-400">1년 전 오늘:</strong> 제주
                  가족여행 회비 1/N 정산 완료 & 사진 12장 기록
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                2025.11.25
              </span>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${getBentoBorderClass(
            resolvedTheme
          )}`}
        >
          <span className="text-[11px] text-slate-400 truncate">월간·주간·일간·아젠다 4대 뷰</span>
          <button
            type="button"
            onClick={() => onNavigate?.('SCR-DAY-01')}
            className="min-h-[44px] px-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>모아데이 캘린더 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};

/** MODULE: 🔁 모아루틴 타임라인 & 스트릭 벤토 카드 (2-Col, SCR_SET_01 플러그인 ON/OFF 연동) */
export const RoutineBentoCard: React.FC<{
  resolvedTheme: ThemeMode;
  orderStyle: React.CSSProperties;
  onNavigate?: (screenId: string) => void;
  onNotify?: (msg: string) => void;
}> = ({ resolvedTheme, orderStyle, onNavigate, onNotify }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [pluginSettings, setPluginSettings] = useState<RoutinePluginSettings>(() =>
    loadRoutinePluginSettings()
  );
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const syncPlugins = () => setPluginSettings(loadRoutinePluginSettings());
    window.addEventListener(ROUTINE_PLUGIN_SETTINGS_EVENT, syncPlugins);
    return () => window.removeEventListener(ROUTINE_PLUGIN_SETTINGS_EVENT, syncPlugins);
  }, []);

  const enabledRoutines = useMemo(
    () =>
      INITIAL_ROUTINES.filter(
        (r) => pluginSettings[r.category as RoutineCategory] ?? true
      ),
    [pluginSettings]
  );

  const maxStreak = useMemo(
    () => enabledRoutines.reduce((acc, item) => Math.max(acc, item.streakDays || 0), 0),
    [enabledRoutines]
  );

  const handleToggleRoutine = (id: string, title: string) => {
    setCheckedIds((prev) => {
      const nextVal = !prev[id];
      onNotify?.(
        nextVal ? `✓ [${title}] 오늘 루틴 수행 완료!` : `[${title}] 체크를 해제했습니다.`
      );
      return { ...prev, [id]: nextVal };
    });
  };

  return (
    <section
      style={orderStyle}
      className={`md:col-span-2 lg:col-span-2 p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-emerald-400/50 ${getBentoSurfaceClass(
        resolvedTheme
      )}`}
    >
      <div>
        <BentoCardHeader
          resolvedTheme={resolvedTheme}
          icon={<Repeat className="w-4 h-4" />}
          iconBgClass="bg-emerald-500/10 text-emerald-500"
          title="모아루틴 타임라인"
          countBadge={`(${enabledRoutines.length}개 활성)`}
          subtitle="약복용 · 알뜰폰 환승 · 세금계산서 · 카드정산 TRANSFER 연동"
          screenBadge="SCR-ROU-01"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
        />

        {isExpanded && (
          <div className="space-y-3">
            {/* 미니 스트릭 잔디 & 연속 달성 배지 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 flex-wrap ${getBentoSubCardClass(
                resolvedTheme
              )}`}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 whitespace-nowrap">
                  최고 연속 {maxStreak}일 스트릭
                </span>
              </div>
              <div className="flex items-center gap-1" aria-label="최근 12일 스트릭 잔디">
                {[1, 1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2].map((lvl, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-xs ${
                      lvl === 2
                        ? 'bg-emerald-500'
                        : lvl === 1
                        ? 'bg-emerald-300 dark:bg-emerald-800'
                        : 'bg-slate-200 dark:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {enabledRoutines.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs text-slate-500 text-center">
                활성화된 모아루틴 플러그인이 없습니다. 설정(SCR-SET-01)에서 켤 수 있습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {enabledRoutines.slice(0, 3).map((routine) => {
                  const meta = ROUTINE_CATEGORY_META[routine.category];
                  const isDone = !!checkedIds[routine.id];
                  return (
                    <div
                      key={routine.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${getBentoSubCardClass(
                        resolvedTheme
                      )}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 ${meta.accentBg} ${meta.accentText} ${meta.accentBorder}`}
                        >
                          {meta.shortLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-bold truncate ${
                              isDone
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {routine.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {routine.subtitle}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRoutine(routine.id, routine.title)}
                        className={`min-h-[38px] px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-emerald-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{isDone ? '완료됨' : '체크인'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${getBentoBorderClass(
            resolvedTheme
          )}`}
        >
          <span className="text-[11px] text-slate-400 truncate">
            설정 플러그인 ON/OFF 실시간 동기화
          </span>
          <button
            type="button"
            onClick={() => onNavigate?.('SCR-ROU-01')}
            className="min-h-[44px] px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>모아루틴 허브 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
