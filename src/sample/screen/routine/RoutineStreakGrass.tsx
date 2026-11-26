// ============================================================================
// src/sample/screen/routine/RoutineStreakGrass.tsx
// 모아루틴(SCR-ROU-01) 주기 적응형 루틴 트래커 (Adaptive Routine Rhythm Engine)
// - [전체 / 약복용]: 최근 12주 일간 잔디 매트릭스 (오늘 예정 기준 동적 산정)
// - [세금계산서 / 카드정산]: 연간 12개월 월별 마감 블록 (Monthly 12-Month Blocks)
// - [알뜰폰 환승]: 연도-차수별 타임라인 프로그레스 & 24개월 약정 점검 (Round Timeline)
// - 360px 모바일 반응형 & 툴팁 지원
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  CalendarDays,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
  Smartphone,
  FileCheck2,
  CreditCard,
  Pill,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ROUTINE_TODAY_ISO, RoutineItem, RoutineFilterCategory } from './types';

export interface RoutineStreakGrassProps {
  routines: RoutineItem[];
  selectedCategory?: RoutineFilterCategory;
  className?: string;
}

interface DayGrassCell {
  dateIso: string;
  dayOfWeek: number; // 0=일 ~ 6=토
  monthLabel?: string;
  totalTasks: number;
  completedTasks: number;
  rate: number; // 0 ~ 100
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
}

const WEEKS_COUNT = 12; // 12주 = 84일
const DAYS_COUNT = WEEKS_COUNT * 7;

function getGrassLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
  if (rate <= 0) return 0;
  if (rate < 35) return 1;
  if (rate < 70) return 2;
  if (rate < 100) return 3;
  return 4;
}

const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200/60 dark:border-zinc-700/60',
  1: 'bg-emerald-200/80 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/80',
  2: 'bg-emerald-300 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-700',
  3: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500',
  4: 'bg-emerald-500 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-300 ring-1 ring-emerald-400/40',
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 12개월 월별 마감 데이터
interface MonthMilestone {
  month: number; // 1 ~ 12
  monthLabel: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING';
  completedDate?: string;
  detailText: string;
}

export const RoutineStreakGrass: React.FC<RoutineStreakGrassProps> = ({
  routines,
  selectedCategory = 'ALL',
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<DayGrassCell | null>(null);

  // --------------------------------------------------------------------------
  // [A] 일간 잔디 데이터 (전체 루틴 또는 약복용 선택 시)
  // --------------------------------------------------------------------------
  const { weeks, dailyStats } = useMemo(() => {
    const baseDate = new Date(`${ROUTINE_TODAY_ISO}T00:00:00`);
    const totalDays = DAYS_COUNT;
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    if (routines.length === 0) {
      const emptyCells: DayGrassCell[] = [];
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateIso = d.toISOString().slice(0, 10);
        emptyCells.push({
          dateIso,
          dayOfWeek: d.getDay(),
          monthLabel: d.getDate() === 1 ? `${d.getMonth() + 1}월` : undefined,
          totalTasks: 0,
          completedTasks: 0,
          rate: 0,
          level: 0,
          isToday: dateIso === ROUTINE_TODAY_ISO,
        });
      }
      const groupedEmptyWeeks: DayGrassCell[][] = [];
      for (let w = 0; w < WEEKS_COUNT; w++) {
        groupedEmptyWeeks.push(emptyCells.slice(w * 7, (w + 1) * 7));
      }
      return {
        weeks: groupedEmptyWeeks,
        dailyStats: {
          streakDays: 0,
          weeklyRate: 0,
          monthlyRate: 0,
          totalActive: 0,
        },
      };
    }

    const activeCount = routines.length;

    // 오늘 예정 루틴 기준 완수 계산
    const todayCompletedCount = routines.filter((r) => {
      if (r.category === 'HEALTH_MEDICINE') {
        return r.slots.every((s) => s.taken);
      }
      if (r.category === 'LIFE_PHONE') {
        return r.checklist.every((c) => c.done);
      }
      if (r.category === 'BIZ_TAX') {
        return r.clients.every((c) => c.status === 'ISSUED');
      }
      if (r.category === 'FINANCE_CARD_SETTLE') {
        return r.isTransferredToLedger || r.cards.every((c) => c.status === 'TRANSFERRED');
      }
      return false;
    }).length;

    const cells: DayGrassCell[] = [];
    let currentStreak = 0;
    let completedPast7Days = 0;
    let completedPast30Days = 0;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateIso = d.toISOString().slice(0, 10);
      const isToday = dateIso === ROUTINE_TODAY_ISO;
      const dayOfWeek = d.getDay();

      let completed = 0;
      if (isToday) {
        completed = todayCompletedCount;
      } else {
        const hash = (d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate()) % 100;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (hash > 85) {
          completed = activeCount;
        } else if (hash > 60) {
          completed = Math.max(1, Math.round(activeCount * 0.75));
        } else if (hash > 30) {
          completed = Math.max(1, Math.round(activeCount * 0.5));
        } else if (isWeekend && hash > 15) {
          completed = 1;
        } else {
          completed = 0;
        }
      }

      const rate = Math.min(100, Math.round((completed / activeCount) * 100));
      const level = getGrassLevel(rate);

      const daysFromToday = Math.round((baseDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysFromToday >= 0 && daysFromToday < 7) {
        completedPast7Days += rate;
      }
      if (daysFromToday >= 0 && daysFromToday < 30) {
        completedPast30Days += rate;
      }

      if (rate >= 50) {
        currentStreak++;
      } else if (daysFromToday > 0) {
        currentStreak = 0;
      }

      cells.push({
        dateIso,
        dayOfWeek,
        monthLabel: d.getDate() === 1 ? `${d.getMonth() + 1}월` : undefined,
        totalTasks: activeCount,
        completedTasks: completed,
        rate,
        level,
        isToday,
      });
    }

    const groupedWeeks: DayGrassCell[][] = [];
    for (let w = 0; w < WEEKS_COUNT; w++) {
      groupedWeeks.push(cells.slice(w * 7, (w + 1) * 7));
    }

    return {
      weeks: groupedWeeks,
      dailyStats: {
        streakDays: currentStreak > 0 ? currentStreak : 12,
        weeklyRate: Math.round(completedPast7Days / 7),
        monthlyRate: Math.round(completedPast30Days / 30),
        totalActive: activeCount,
      },
    };
  }, [routines]);

  // --------------------------------------------------------------------------
  // [B] 12개월 월별 마감 데이터 (세금계산서 또는 급여카드정산 선택 시)
  // --------------------------------------------------------------------------
  const monthlyMilestones = useMemo<MonthMilestone[]>(() => {
    const isTax = selectedCategory === 'BIZ_TAX';
    const currentMonth = 11; // 2026년 11월 기준

    return Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      if (month < currentMonth) {
        return {
          month,
          monthLabel: `${month}월`,
          status: 'COMPLETED',
          completedDate: isTax ? `2026-${String(month).padStart(2, '0')}-09` : `2026-${String(month).padStart(2, '0')}-13`,
          detailText: isTax ? '의무발급 100% 완료' : '급여정산 및 TRANSFER 완료',
        };
      }
      if (month === currentMonth) {
        return {
          month,
          monthLabel: `${month}월`,
          status: 'IN_PROGRESS',
          detailText: isTax ? '12/10 마감 진행중 (D-17)' : '11/23 정산 진행중',
        };
      }
      return {
        month,
        monthLabel: `${month}월`,
        status: 'WAITING',
        detailText: '차기 마감 대기',
      };
    });
  }, [selectedCategory]);

  // --------------------------------------------------------------------------
  // [C] 알뜰폰 환승 연도-차수 타임라인 데이터
  // --------------------------------------------------------------------------
  const mvnoTimelineRounds = useMemo(() => [
    {
      roundKey: '2025-2',
      title: '2025년 2차 번호이동',
      periodText: '2025.10 ~ 2026.05',
      status: 'COMPLETED' as const,
      lineSummary: '4회선 특가 완료 (월 68,000원 절감)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      roundKey: '2026-1',
      title: '2026년 1차 번호이동',
      periodText: '2026.04 ~ 2026.11',
      status: 'COMPLETED' as const,
      lineSummary: '4회선 환승 완료 (월 76,000원 절감)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      roundKey: '2026-2',
      title: '2026년 2차 번호이동 배치 (현재 진행)',
      periodText: '2026.11 ~ 2027.06',
      status: 'IN_PROGRESS' as const,
      lineSummary: '정원 5회선 (환승진행 1 · 유지 1 · 생략 1 · 완료 1)',
      badgeClass: 'bg-sky-500 text-white shadow-xs',
    },
    {
      roundKey: 'LONG_TERM',
      title: '24개월 약정 유지 점검 회선',
      periodText: '2025.10 ~ 2027.10 (만료 11개월 전)',
      status: 'MAINTAINED' as const,
      lineSummary: '배우자 KT 5G 베이직 (선택약정 25% + 인터넷 결합)',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
  ], []);

  // --------------------------------------------------------------------------
  // 렌더링 분기: 세금계산서 or 카드정산 -> 12개월 월별 마감 블록 뷰
  // --------------------------------------------------------------------------
  if (selectedCategory === 'BIZ_TAX' || selectedCategory === 'FINANCE_CARD_SETTLE') {
    const isTax = selectedCategory === 'BIZ_TAX';
    return (
      <div className={`bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 ${className}`}>
        {/* 상단 통계 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isTax
                ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400'
                : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400'
            }`}>
              {isTax ? <FileCheck2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  {isTax ? '세금계산서 월별 의무 마감 트래커' : '급여·카드정산 월간 집행 트래커'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-xs">
                  <Trophy className="w-3 h-3 fill-white" />
                  연간 마감 준수율 100% (10/10월 완료)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isTax
                  ? '매월 10일 의무 마감 준수 여부를 1~12월 블록으로 추적하여 가산세를 원천 방어합니다'
                  : '매월 급여일 카드 대금 정산 및 TRANSFER 자산이동 실행 이력을 월별로 추적합니다'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              {isTax ? '가산세 0원 방어' : '연체 0건 완결'}
            </span>
          </div>
        </div>

        {/* 12개월 월별 마감 타일 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {monthlyMilestones.map((m) => (
            <div
              key={m.month}
              className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between min-h-[72px] transition-all ${
                m.status === 'COMPLETED'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200'
                  : m.status === 'IN_PROGRESS'
                  ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30'
                  : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{m.monthLabel}</span>
                {m.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : m.status === 'IN_PROGRESS' ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    진행중
                  </span>
                ) : (
                  <span className="text-[10px] font-normal">대기</span>
                )}
              </div>
              <div className="text-[10px] truncate leading-tight mt-1 opacity-90">
                {m.detailText}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 렌더링 분기: 알뜰폰 환승 -> 연도-차수 타임라인 프로그레스 뷰
  // --------------------------------------------------------------------------
  if (selectedCategory === 'LIFE_PHONE') {
    return (
      <div className={`bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 ${className}`}>
        {/* 상단 통계 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  알뜰폰 환승 연도-차수 타임라인 트래커
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-600 text-white shadow-xs">
                  <ShieldCheck className="w-3 h-3 fill-white" />
                  연 924,000원 통신비 절감중
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                6~7개월 특가 만료 D-Day와 가족 다회선 차수(정원 5회선) 및 24개월 약정 유지 회선을 일괄 추적합니다
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
              다음 번호이동 만료: D-10 임박
            </span>
          </div>
        </div>

        {/* 연도-차수 타임라인 카드 묶음 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {mvnoTimelineRounds.map((rnd) => (
            <div
              key={rnd.roundKey}
              className={`p-3 rounded-xl border text-xs flex flex-col justify-between min-h-[92px] ${
                rnd.status === 'IN_PROGRESS'
                  ? 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/30'
                  : rnd.status === 'MAINTAINED'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">
                  {rnd.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${rnd.badgeClass}`}>
                  {rnd.status === 'IN_PROGRESS' ? '진행중' : rnd.status === 'MAINTAINED' ? '24개월유지' : '완료'}
                </span>
              </div>

              <div className="space-y-1 mt-2">
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  {rnd.periodText}
                </div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 truncate">
                  {rnd.lineSummary}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // [기본] 전체 루틴 또는 약복용 선택 시: 일간 7행 x 12열 잔디 매트릭스 렌더링
  // --------------------------------------------------------------------------
  return (
    <div
      className={`bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
    >
      {/* 1. 상단 통계 헤더 (스트릭 + 주간/월간 달성률) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {selectedCategory === 'HEALTH_MEDICINE' ? (
              <Pill className="w-4 h-4" />
            ) : (
              <Flame className="w-4 h-4 fill-emerald-500/20" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {selectedCategory === 'HEALTH_MEDICINE'
                  ? '일일 복약 순응도 스트릭 잔디'
                  : '루틴 스트릭 잔디 (오늘 예정 루틴 기준)'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-xs">
                <Flame className="w-3 h-3 fill-white" />
                {dailyStats.streakDays}일 연속 완수
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {selectedCategory === 'HEALTH_MEDICINE'
                ? '처방전·약봉지 OCR 기반 아침/점심/저녁/취침전 복약 순응도를 잔디로 추적합니다'
                : '오늘 예정된(Due Today) 라이프·금융 루틴 완수율을 12주(84일) 매트릭스로 시각화합니다'}
            </p>
          </div>
        </div>

        {/* KPI 배지 묶음 */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/70 dark:border-zinc-700/60">
            <CalendarDays className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-slate-500 dark:text-zinc-400">주간 달성률:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {dailyStats.weeklyRate}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/70 dark:border-zinc-700/60">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-500 dark:text-zinc-400">월간 달성률:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {dailyStats.monthlyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. 7행 x 12열 잔디 매트릭스 그리드 (360px 가로스크롤 지원) */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700">
          <div className="min-w-[420px] inline-block">
            {/* 월별 라벨 라인 */}
            <div className="flex items-center pl-7 text-[10px] text-slate-400 dark:text-zinc-500 mb-1 gap-1">
              {weeks.map((week, wIdx) => {
                const monthEntry = week.find((c) => c.monthLabel);
                return (
                  <div
                    key={`month-${wIdx}`}
                    className="w-5 text-center font-medium truncate"
                  >
                    {monthEntry?.monthLabel || (wIdx % 4 === 0 ? `${wIdx + 1}주` : '')}
                  </div>
                );
              })}
            </div>

            {/* 본문 매트릭스 (7행) */}
            <div className="flex gap-1.5">
              {/* 요일 라벨 (일/월/화/수/목/금/토) */}
              <div className="flex flex-col gap-1 pr-1 text-[10px] text-slate-400 dark:text-zinc-500 font-medium select-none justify-between h-[112px]">
                {DAY_LABELS.map((lbl, idx) => (
                  <span
                    key={lbl}
                    className={`leading-none h-3.5 flex items-center ${
                      idx === 0
                        ? 'text-rose-400'
                        : idx === 6
                        ? 'text-sky-400'
                        : ''
                    }`}
                  >
                    {idx % 2 === 1 || idx === 0 ? lbl : ''}
                  </span>
                ))}
              </div>

              {/* 12주 컬럼 매트릭스 */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={`col-${wIdx}`} className="flex flex-col gap-1">
                    {week.map((cell) => (
                      <button
                        type="button"
                        key={cell.dateIso}
                        onClick={() => setHoveredCell(cell)}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-3.5 h-3.5 rounded-[3px] border transition-all ${
                          LEVEL_COLORS[cell.level]
                        } ${
                          cell.isToday
                            ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-1 dark:ring-offset-[#131926]'
                            : ''
                        } hover:scale-125 focus:outline-none`}
                        title={`${cell.dateIso}: 완수율 ${cell.rate}% (${cell.completedTasks}/${cell.totalTasks}개)`}
                        aria-label={`${cell.dateIso} 루틴 완수율 ${cell.rate}%`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 인터랙티브 툴팁/호버 안내 바 */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            {hoveredCell ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-200">
                <span
                  className={`w-2.5 h-2.5 rounded-xs border ${
                    LEVEL_COLORS[hoveredCell.level]
                  }`}
                />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {hoveredCell.dateIso}
                </span>
                {hoveredCell.isToday && (
                  <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                    오늘
                  </span>
                )}
                <span>
                  · 완수율 {hoveredCell.rate}% ({hoveredCell.completedTasks}/
                  {hoveredCell.totalTasks}개 완수)
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 dark:text-zinc-500">
                <Info className="w-3.5 h-3.5" /> 잔디 셀에 마우스를 올리거나 터치하면 일별 완수 현황을 확인합니다
              </span>
            )}
          </div>

          {/* 잔디 레벨 범례 (Less -> More) */}
          <div className="flex items-center gap-1 text-[11px] select-none">
            <span className="text-slate-400 dark:text-zinc-500 mr-0.5">Less</span>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <span
                key={lvl}
                className={`w-3 h-3 rounded-[2px] border ${LEVEL_COLORS[lvl]}`}
                title={`레벨 ${lvl}`}
              />
            ))}
            <span className="text-slate-400 dark:text-zinc-500 ml-0.5">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
