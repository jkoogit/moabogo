import React from 'react';
import { Calendar, CheckSquare, History, Smartphone, Square } from 'lucide-react';
import { DisplaySettings } from '../day/types';

interface DaySettingsPanelProps {
  daySettings: DisplaySettings;
  onUpdateDaySettings: (patch: Partial<DisplaySettings>) => void;
  carSyncCount: number;
}

const LEVEL1_KEYS: (keyof DisplaySettings)[] = [
  'masterLedger',
  'masterDuty',
  'masterGoal',
  'masterRoutine',
  'masterDiary',
];

const LEVEL2_KEYS: (keyof DisplaySettings)[] = [
  'itemBilling',
  'itemFixedExpense',
  'itemSalary',
  'itemMyDuty',
  'itemAllDuty',
  'itemSubstitute',
  'itemGoalDeadline',
  'itemGoalMilestone',
  'itemRoutineMedicine',
  'itemRoutineTax',
];

export const DaySettingsPanel: React.FC<DaySettingsPanelProps> = ({
  daySettings,
  onUpdateDaySettings,
  carSyncCount,
}) => {
  const isAllLevel1On = LEVEL1_KEYS.every((k) => Boolean(daySettings[k]));
  const isAllLevel2On = LEVEL2_KEYS.every((k) => Boolean(daySettings[k]));

  const toggleAll = (keys: (keyof DisplaySettings)[], currentlyAllOn: boolean) => {
    const nextVal = !currentlyAllOn;
    const patch: Partial<DisplaySettings> = {};
    keys.forEach((k) => {
      (patch as Record<string, boolean>)[k] = nextVal;
    });
    onUpdateDaySettings(patch);
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>모아데이(SCR-DAY-01) 2계층 일정 투영 · 과거의 오늘 · PWA 수집 통합 설정</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            모아데이 캘린더 표시 설정(`moabogo_day_settings_v2`)과 실시간 양방향 동기화됩니다.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 whitespace-nowrap self-start sm:self-center">
          모아부릉 투영 {carSyncCount}종 활성
        </span>
      </div>

      {/* 1. 과거의 오늘 회고 년수 (0~5년) */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/15 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
          <History className="w-4 h-4 shrink-0" />
          <span>과거의 오늘 회고 표시 년도 지정 (0~5개년)</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => onUpdateDaySettings({ pastYearsCount: yr })}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                daySettings.pastYearsCount === yr
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {yr === 0 ? '숨김 (0년)' : `${yr}년 전`}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          {daySettings.pastYearsCount === 0
            ? '과거의 오늘 회고 캐러셀을 달력 상단에서 숨깁니다.'
            : `오늘 기준 최대 ${daySettings.pastYearsCount}개년 전 동일 날짜의 일기·소비 요약을 표시합니다.`}
        </p>
      </div>

      {/* 2. PWA 모바일 리소스 자동 수집 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>PWA 모바일 기기 리소스 자동 수집 대상</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {[
            { key: 'collectImages' as const, label: '📷 사진/이미지 (EXIF 촬영일 파싱)' },
            { key: 'collectAudio' as const, label: '🎙️ 통화녹음·오디오 (날짜/상대 추출)' },
            { key: 'collectDocs' as const, label: '📁 다운로드 폴더 영수증·문서' },
          ].map((item) => (
            <label
              key={item.key}
              className="min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean(daySettings[item.key])}
                onChange={(e) => onUpdateDaySettings({ [item.key]: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Level 1 서비스 마스터 투영 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            Level 1. 서비스 마스터 투영 설정 (상단 퀵필터 연동)
          </span>
          <button
            type="button"
            onClick={() => toggleAll(LEVEL1_KEYS, isAllLevel1On)}
            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            {isAllLevel1On ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>전체 토글</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            { key: 'masterLedger' as const, label: '가계부', desc: '결제/고정비/급여' },
            { key: 'masterDuty' as const, label: '모아당번', desc: '순번/대신수행' },
            { key: 'masterGoal' as const, label: '모아목표', desc: '만기/마일스톤' },
            { key: 'masterRoutine' as const, label: '모아루틴', desc: '약복용/세무' },
            { key: 'masterDiary' as const, label: '스마트 일기', desc: '다이어리/기분' },
          ].map((item) => (
            <label
              key={item.key}
              className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] flex items-start gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean(daySettings[item.key])}
                onChange={(e) => onUpdateDaySettings({ [item.key]: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block">{item.label}</span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Level 2 세부 항목 투영 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            Level 2. 서비스별 세부 항목 캘린더 투영 설정
          </span>
          <button
            type="button"
            onClick={() => toggleAll(LEVEL2_KEYS, isAllLevel2On)}
            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            {isAllLevel2On ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>전체 토글</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          {[
            {
              group: '가계부 항목',
              enabled: daySettings.masterLedger,
              items: [
                { key: 'itemBilling' as const, label: '카드 결제일' },
                { key: 'itemFixedExpense' as const, label: '정기 고정지출' },
                { key: 'itemSalary' as const, label: '급여 입금일' },
              ],
            },
            {
              group: '당번 항목',
              enabled: daySettings.masterDuty,
              items: [
                { key: 'itemMyDuty' as const, label: '내 담당 당번' },
                { key: 'itemAllDuty' as const, label: '그룹 전체 당번' },
                { key: 'itemSubstitute' as const, label: '대신수행 요청일' },
              ],
            },
            {
              group: '목표 항목',
              enabled: daySettings.masterGoal,
              items: [
                { key: 'itemGoalDeadline' as const, label: '목표 만기일' },
                { key: 'itemGoalMilestone' as const, label: '중간 마일스톤' },
              ],
            },
            {
              group: '루틴 항목',
              enabled: daySettings.masterRoutine,
              items: [
                { key: 'itemRoutineMedicine' as const, label: '약 복용 루틴' },
                { key: 'itemRoutineTax' as const, label: '정기 세무/신고' },
              ],
            },
          ].map((sec) => (
            <div
              key={sec.group}
              className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-2"
            >
              <span className="font-bold text-slate-700 dark:text-zinc-200 block">{sec.group}</span>
              <div className="flex flex-wrap gap-3">
                {sec.items.map((sub) => (
                  <label key={sub.key} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!sec.enabled}
                      checked={Boolean(daySettings[sub.key])}
                      onChange={(e) => onUpdateDaySettings({ [sub.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className={!sec.enabled ? 'text-slate-400' : ''}>{sub.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
