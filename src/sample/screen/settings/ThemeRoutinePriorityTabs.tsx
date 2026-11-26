import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Monitor } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { ElmSwt01, ElmRad01 } from '../../elements/Tokens';
import {
  loadRoutinePluginSettings,
  saveRoutinePluginSettings,
  RoutinePluginSettings,
} from '../routine/plugins/pluginSettings';
import {
  RoutineExtendedPreferences,
  loadRoutineExtendedPreferences,
  saveRoutineExtendedPreferences,
} from '../../data/servicePreferencesPool';

interface NotifyCallbackProps {
  onNotify: (msg?: string) => void;
}

/* ============================================================================
   1. 화면 테마 탭 (주간 / 야간 / 여명 / 시스템)
   ============================================================================ */
export const ThemeSettingsTab: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
          화면 디스플레이 테마 (주간 • 야간 • 여명 • 시스템)
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          선호하는 색상 팔레트와 기기 기본 설정을 실시간으로 선택 및 적용할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Light Mode Card */}
        <div
          onClick={() => setTheme('light')}
          className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            theme === 'light'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
              : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">
                  주간 (라이트)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">화이트 테마</span>
              </div>
            </div>
            {theme === 'light' && (
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            밝은 주간 환경 및 문서 검토에 적합한 클린 화이트
          </p>
        </div>

        {/* 2. Dark Mode Card (Gray) */}
        <div
          onClick={() => setTheme('dark')}
          className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            theme === 'dark'
              ? 'border-zinc-400 bg-zinc-800/40 shadow-sm'
              : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-700">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">
                  야간 (다크)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">딥 잉크 블랙 테마</span>
              </div>
            </div>
            {theme === 'dark' && (
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            OLED 친화적인 딥 잉크 블랙(#0B0F17 / #131B2E) 배경
          </p>
        </div>

        {/* 3. Dawn Mode Card (Blue) */}
        <div
          onClick={() => setTheme('dawn')}
          className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            theme === 'dawn'
              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm'
              : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">
                  여명 (블루)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">오션 스카이 블루</span>
              </div>
            </div>
            {theme === 'dawn' && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            산뜻하고 시원한 오션 스카이 블루(#edf4fc / #2563eb) 컬러웨이
          </p>
        </div>

        {/* 4. System Auto Card */}
        <div
          onClick={() => setTheme('system')}
          className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            theme === 'system'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
              : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">
                  시스템 연동
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">기기 OS 자동</span>
              </div>
            </div>
            {theme === 'system' && (
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            운영체제(OS)의 다크/라이트 모드 설정에 자동 동기화
          </p>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   2. 모아루틴 4대 플러그인 ON/OFF 및 세부 운영 기본값 탭
   ============================================================================ */
export const RoutineSettingsTab: React.FC<NotifyCallbackProps> = ({ onNotify }) => {
  const [routineSettings, setRoutineSettings] = useState<RoutinePluginSettings>(() =>
    loadRoutinePluginSettings()
  );
  const [routineExtPrefs, setRoutineExtPrefs] = useState<RoutineExtendedPreferences>(() =>
    loadRoutineExtendedPreferences()
  );

  const handleToggleRoutinePlugin = (key: keyof RoutinePluginSettings) => {
    setRoutineSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveRoutinePluginSettings(updated);
      onNotify();
      return updated;
    });
  };

  const handleUpdateRoutineExtPrefs = (next: RoutineExtendedPreferences) => {
    setRoutineExtPrefs(next);
    saveRoutineExtendedPreferences(next);
    onNotify();
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            모아루틴 플러그인 동적 활성화 (ON/OFF)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            사용하지 않는 라이프·금융 루틴을 비활성화하면, 모아루틴 허브(SCR-ROU-01) 탭과 카드 목록에서 깔끔하게 숨겨집니다.
          </p>
        </div>
        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
          ✓ 변경 시 즉시 로컬스토리지 영속화 및 화면 반영
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. 약복용 루틴 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                💊 약복용 루틴
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  매일 · 약봉지 OCR
                </span>
              </span>
              <ElmSwt01
                checked={routineSettings.HEALTH_MEDICINE}
                onChange={() => handleToggleRoutinePlugin('HEALTH_MEDICINE')}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              처방전 및 약봉투 사진 OCR 첨부로 다중 약품, 아침·점심·저녁 시점별 복약 타임라인 및 보유수량 소진일(D-Day)을 자동 계산합니다.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
            <span>연동 도메인: 헬스케어 · 복약 스케줄러</span>
          </div>
        </div>

        {/* 2. 알뜰폰 환승 루틴 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                📱 알뜰폰 환승 루틴
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  6~7개월 특가 · 다회선 관리
                </span>
              </span>
              <ElmSwt01
                checked={routineSettings.LIFE_PHONE}
                onChange={() => handleToggleRoutinePlugin('LIFE_PHONE')}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              6~7개월 프로모션 할인 종료 D-Day 추적, 가족 다인·다회선 및 2026-차수 정원 관리, 24개월 약정 유지 점검, 실물 USIM(ICCID) 관리를 지원합니다.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
            <span>연동 도메인: 통신비 최적화 · 실물 USIM 보안</span>
          </div>
        </div>

        {/* 3. 세금계산서 발급 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                📑 전자세금계산서 발급
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  매월 10일 마감
                </span>
              </span>
              <ElmSwt01
                checked={routineSettings.BIZ_TAX}
                onChange={() => handleToggleRoutinePlugin('BIZ_TAX')}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              개인사업자 매월 10일 의무 발급 집중 리마인더 및 국세청 전자세금계산서 이미지 OCR 자동등록과 거래처 매칭을 집행합니다.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
            <span>연동 도메인: 개인사업자 세무 · 홈택스 매칭</span>
          </div>
        </div>

        {/* 4. 급여·카드 일괄 정산 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                💳 급여·카드 일괄 정산 집행
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  월간 급여일 · TRANSFER
                </span>
              </span>
              <ElmSwt01
                checked={routineSettings.FINANCE_CARD_SETTLE}
                onChange={() => handleToggleRoutinePlugin('FINANCE_CARD_SETTLE')}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              급여일 카드사별 청구서 대사, 토스 송금 딥링크 집행 및 완료 시 가계부 자산이동(TRANSFER, 이중계상 원천 차단)으로 자동 기장합니다.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
            <span>연동 도메인: 가계부 자산이동(TRANSFER) · 토스 1-Click</span>
          </div>
        </div>
      </div>

      {/* 루틴 운영 세부 기본값 설정 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
          모아루틴 운영 세부 기본값 (브리핑 · 스트릭 · 알뜰폰 · 세금계산서)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block">
              기본 루틴 브리핑 시각
            </label>
            <input
              type="time"
              value={routineExtPrefs.defaultBriefingTime}
              onChange={(e) =>
                handleUpdateRoutineExtPrefs({
                  ...routineExtPrefs,
                  defaultBriefingTime: e.target.value,
                })
              }
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block">
              스트릭 초기화 유예 일수
            </label>
            <select
              value={routineExtPrefs.streakGraceDays}
              onChange={(e) =>
                handleUpdateRoutineExtPrefs({
                  ...routineExtPrefs,
                  streakGraceDays: Number(e.target.value) as 0 | 1 | 2,
                })
              }
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] font-bold"
            >
              <option value={0}>유예 없음 (당일 미완료 시 초기화)</option>
              <option value={1}>1일 유예 (D+1 보충 허용)</option>
              <option value={2}>2일 유예 (주말 포함 유연 관리)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block">
              알뜰폰 차수 기본 최대 정원
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={routineExtPrefs.mvnoDefaultMaxLines}
              onChange={(e) =>
                handleUpdateRoutineExtPrefs({
                  ...routineExtPrefs,
                  mvnoDefaultMaxLines: Math.max(1, Math.min(20, Number(e.target.value) || 5)),
                })
              }
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block">
              세금계산서 10일 마감 사전알림
            </label>
            <select
              value={routineExtPrefs.taxReminderDaysBefore}
              onChange={(e) =>
                handleUpdateRoutineExtPrefs({
                  ...routineExtPrefs,
                  taxReminderDaysBefore: Number(e.target.value) as 1 | 3 | 5 | 7,
                })
              }
              className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] font-bold"
            >
              <option value={1}>마감 1일 전 (매월 9일)</option>
              <option value={3}>마감 3일 전 (매월 7일)</option>
              <option value={5}>마감 5일 전 (매월 5일)</option>
              <option value={7}>마감 7일 전 (매월 3일)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   3. 빠른수행 우선순위 탭
   ============================================================================ */
export const PrioritySettingsTab: React.FC = () => {
  const [quickPriorityMode, setQuickPriorityMode] = useState<'ALL' | 'TOP_ONE'>('TOP_ONE');

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
        빠른수행 위젯 우선순위 노출 정책
      </h3>
      <div className="space-y-3">
        <ElmRad01
          selected={quickPriorityMode === 'TOP_ONE'}
          onSelect={() => setQuickPriorityMode('TOP_ONE')}
          label="최우선 1건 단독 노출 (당일 가장 마감이 임박한 과업)"
        />
        <ElmRad01
          selected={quickPriorityMode === 'ALL'}
          onSelect={() => setQuickPriorityMode('ALL')}
          label="설정별 전체 항목 카드 목록 노출 (당번, 목표 모두 펼쳐보기)"
        />
      </div>
    </section>
  );
};
