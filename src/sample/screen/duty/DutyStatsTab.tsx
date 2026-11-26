import React from 'react';
import { BarChart3, Trophy, X } from 'lucide-react';
import {
  DutyStatsPeriod,
  DutyStatsDataPoint,
  MemberContributionRank,
} from '../../../types';

interface DutyStatsTabProps {
  statsPeriod: DutyStatsPeriod;
  setStatsPeriod: (period: DutyStatsPeriod) => void;
  selectedStatPoint: DutyStatsDataPoint | null;
  setSelectedStatPoint: (dp: DutyStatsDataPoint | null) => void;
  statsResult: DutyStatsDataPoint[];
  memberRanks: MemberContributionRank[];
  kpis: {
    overallRate: number;
    currentStreak: number;
  };
}

export const DutyStatsTab: React.FC<DutyStatsTabProps> = ({
  statsPeriod,
  setStatsPeriod,
  selectedStatPoint,
  setSelectedStatPoint,
  statsResult,
  memberRanks,
  kpis,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Period Selector & Quick KPIs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as DutyStatsPeriod[]).map((p) => {
            const pLabel = {
              DAILY: '일별 통계',
              WEEKLY: '주간 통계',
              MONTHLY: '월간 통계',
            }[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setStatsPeriod(p);
                  setSelectedStatPoint(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statsPeriod === p
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {pLabel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>
            목표 완수율: <strong className="font-mono text-emerald-600">{kpis.overallRate}%</strong>
          </span>
          <span>
            최장 연속 완수: <strong className="font-mono text-amber-500">{kpis.currentStreak}회</strong>
          </span>
        </div>
      </div>

      {/* Interactive Chart & Contribution Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>주기별 완수율 추이 (막대를 클릭하여 기간 상세 조회)</span>
            </h4>
            {selectedStatPoint && (
              <button
                type="button"
                onClick={() => setSelectedStatPoint(null)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                전체 랭킹 복귀 [✕]
              </button>
            )}
          </div>

          <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-zinc-800">
            {statsResult.map((dp, idx) => {
              const barHeight = Math.max(8, Math.min(100, dp.completion_rate));
              const isSelected = selectedStatPoint?.label === dp.label;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (selectedStatPoint?.label === dp.label) {
                      setSelectedStatPoint(null);
                    } else {
                      setSelectedStatPoint(dp);
                    }
                  }}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                  title={`${dp.label}: 완수율 ${dp.completion_rate}% (클릭 시 우측 상세 노출)`}
                >
                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                      isSelected
                        ? 'bg-amber-500 ring-2 ring-amber-400 scale-105 shadow-md'
                        : dp.completion_rate >= 80
                        ? 'bg-indigo-600 hover:bg-indigo-500'
                        : 'bg-indigo-400/80 dark:bg-indigo-700 hover:bg-indigo-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono truncate max-w-full ${
                      isSelected ? 'font-bold text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {dp.label.slice(-3)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 막대 그래프를 클릭하면 해당 기간의 세부 실적 분석으로 우측 화면이 전환됩니다.</span>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
          {selectedStatPoint ? (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <div>
                  <span className="text-[10px] text-amber-600 font-bold block">선택 기간 상세 현황</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {selectedStatPoint.label}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStatPoint(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                  <span className="text-[10px] text-slate-400 block">계획 과업</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">
                    {selectedStatPoint.total_scheduled}건
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                  <span className="text-[10px] text-emerald-600 block">완수 건수</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedStatPoint.completed_count}건 ({selectedStatPoint.completion_rate}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50">
                  <span className="text-[10px] text-amber-600 block">대신수행</span>
                  <span className="font-bold font-mono text-amber-600">
                    {selectedStatPoint.substitute_count}건
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                  <span className="text-[10px] text-slate-400 block">미완수</span>
                  <span className="font-bold font-mono text-slate-600 dark:text-zinc-400">
                    {selectedStatPoint.uncompleted_count}건
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                해당 기간 동안 가족·모임 구성원들이 책임감 있게 역할을 완수하였습니다. 상단의 [전체 랭킹 복귀]를 누르면 누적 랭킹으로 돌아갑니다.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>구성원 기여도 랭킹</span>
                </h4>
                <span className="text-[10px] text-slate-400">누적 기준</span>
              </div>

              <div className="space-y-2">
                {memberRanks.map((member, idx) => (
                  <div
                    key={member.participant_id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          완수 {member.completed_count}회 • 달성률 {member.completion_rate}% • 스트릭{' '}
                          {member.streak_days}일
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {member.score}점
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
