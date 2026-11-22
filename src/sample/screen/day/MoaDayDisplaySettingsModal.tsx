// ==========================================
// src/sample/screen/day/MoaDayDisplaySettingsModal.tsx
// 계층적 2단계 표시 및 PWA 수집 설정 모달 (전체 토글 & 헤더 고정 스크롤)
// ==========================================

import React from 'react';
import { X, Settings2, Check, CheckSquare, Square } from 'lucide-react';
import { DisplaySettings } from './types';

interface MoaDayDisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onUpdateSettings: (newSettings: Partial<DisplaySettings>) => void;
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

export const MoaDayDisplaySettingsModal: React.FC<MoaDayDisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  // Level 1 전체 켜기 / 끄기 토글
  const isAllLevel1On = LEVEL1_KEYS.every((k) => !!settings[k]);
  const handleToggleAllLevel1 = () => {
    const nextVal = !isAllLevel1On;
    const patch: Partial<DisplaySettings> = {};
    LEVEL1_KEYS.forEach((k) => {
      (patch as any)[k] = nextVal;
    });
    onUpdateSettings(patch);
  };

  // Level 2 전체 켜기 / 끄기 토글
  const isAllLevel2On = LEVEL2_KEYS.every((k) => !!settings[k]);
  const handleToggleAllLevel2 = () => {
    const nextVal = !isAllLevel2On;
    const patch: Partial<DisplaySettings> = {};
    LEVEL2_KEYS.forEach((k) => {
      (patch as any)[k] = nextVal;
    });
    onUpdateSettings(patch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] border-t border-slate-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* 드래그 핸들 (고정) */}
        <div className="pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto hover:bg-slate-400 transition-colors" />
        </div>

        {/* 상단 헤더 영역 (고정 - 타이틀 & 닫기 버튼) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Settings2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
              모아데이 표시 및 수집 설정
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              계층적 설정
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 바디 영역 (독립 세로 스크롤 영역) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-xs text-slate-800 dark:text-zinc-200">
          {/* Level 1: 서비스 마스터 토글 (전체 체크 토글버튼 추가 - 요구사항 2-a) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Level 1. 4대 서비스 마스터 수집 설정 (상단 퀵필터 연동)
              </h4>
              <button
                type="button"
                onClick={handleToggleAllLevel1}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
              >
                {isAllLevel1On ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>전체</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              여기서 비활성화된 서비스는 상단 퀵필터 칩에서도 완전히 숨겨져 깔끔하게 정리됩니다.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'masterLedger', label: '가계부 (결제/급여)', desc: '지출 및 수입 일정' },
                { key: 'masterDuty', label: '모아당번', desc: '담당 과업 및 대신수행' },
                { key: 'masterGoal', label: '모아목표', desc: 'D-Day 및 마일스톤' },
                { key: 'masterRoutine', label: '모아루틴', desc: '약복용 및 세금신고' },
                { key: 'masterDiary', label: '스마트 일기', desc: '일상 다이어리 & 기분' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={(e) => onUpdateSettings({ [item.key]: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <span className="font-bold block">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Level 2: 개별 항목 상세 토글 (전체 체크 토글버튼 추가 - 요구사항 2-b) */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Level 2. 서비스별 세부 항목 표시 설정
              </h4>
              <button
                type="button"
                onClick={handleToggleAllLevel2}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
              >
                {isAllLevel2On ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>전체</span>
              </button>
            </div>
            <div className="space-y-3">
              {/* 가계부 세부 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1.5">가계부 항목</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'itemBilling', label: '카드 결제일' },
                    { key: 'itemFixedExpense', label: '정기 고정지출' },
                    { key: 'itemSalary', label: '급여 입금일' },
                  ].map((sub) => (
                    <label key={sub.key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!settings.masterLedger}
                        checked={(settings as any)[sub.key]}
                        onChange={(e) => onUpdateSettings({ [sub.key]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className={!settings.masterLedger ? 'text-slate-400' : ''}>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 당번 세부 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 block mb-1.5">당번 항목</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'itemMyDuty', label: '내 담당 당번' },
                    { key: 'itemAllDuty', label: '그룹 전체 당번' },
                    { key: 'itemSubstitute', label: '대신수행 요청일' },
                  ].map((sub) => (
                    <label key={sub.key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!settings.masterDuty}
                        checked={(settings as any)[sub.key]}
                        onChange={(e) => onUpdateSettings({ [sub.key]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className={!settings.masterDuty ? 'text-slate-400' : ''}>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 목표 세부 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-teal-600 dark:text-teal-400 block mb-1.5">목표 항목</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'itemGoalDeadline', label: '목표 만기일' },
                    { key: 'itemGoalMilestone', label: '중간 마일스톤' },
                  ].map((sub) => (
                    <label key={sub.key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!settings.masterGoal}
                        checked={(settings as any)[sub.key]}
                        onChange={(e) => onUpdateSettings({ [sub.key]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className={!settings.masterGoal ? 'text-slate-400' : ''}>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 루틴 세부 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1.5">루틴 항목</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'itemRoutineMedicine', label: '약 복용 루틴' },
                    { key: 'itemRoutineTax', label: '정기 세무/신고' },
                  ].map((sub) => (
                    <label key={sub.key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!settings.masterRoutine}
                        checked={(settings as any)[sub.key]}
                        onChange={(e) => onUpdateSettings({ [sub.key]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className={!settings.masterRoutine ? 'text-slate-400' : ''}>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 과거의 오늘 보기 년도 지정 (0~5년) */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              과거의 오늘 회고 표시 년도 지정 (0~5개년)
            </h4>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => onUpdateSettings({ pastYearsCount: y })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    settings.pastYearsCount === y
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {y === 0 ? '숨김 (0년)' : `${y}년 전`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {settings.pastYearsCount === 0
                ? '과거의 오늘 회고 영역을 달력 상단에서 완전히 숨깁니다.'
                : `현재 날짜 기준 최대 ${settings.pastYearsCount}개년 전 동일 일자의 일기/소비 내역을 함께 표시합니다.`}
            </p>
          </div>

          {/* PWA 모바일 리소스 수집 대상 설정 */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
              PWA 모바일 기기 리소스 자동 수집 대상
            </h4>
            <div className="space-y-2">
              {[
                { key: 'collectImages', label: '📷 사진/이미지 파일 (EXIF 촬영일자 자동 파싱)' },
                { key: 'collectAudio', label: '🎙️ 통화녹음 & 음성파일 (파일명 날짜/상대방 추출)' },
                { key: 'collectDocs', label: '📁 다운로드 폴더 영수증 및 문서 파일' },
              ].map((r) => (
                <label key={r.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings as any)[r.key]}
                    onChange={(e) => onUpdateSettings({ [r.key]: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 (고정) */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>설정 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};
