// ==========================================
// src/sample/screen/day/MoaDayDisplaySettingsModal.tsx
// 계층적 2단계 표시 및 PWA 수집 설정 바텀시트
// ==========================================

import React from 'react';
import { ElmBsh01 } from '../../elements/Tokens';
import { DisplaySettings } from './types';

interface MoaDayDisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onUpdateSettings: (newSettings: Partial<DisplaySettings>) => void;
}

export const MoaDayDisplaySettingsModal: React.FC<MoaDayDisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={onClose}
      title="모아데이 표시 및 수집 설정"
      badge="계층적 설정"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 pt-2 pb-6 text-xs text-slate-800 dark:text-zinc-200">
        {/* Level 1: 서비스 마스터 토글 */}
        <div>
          <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Level 1. 4대 서비스 마스터 수집 설정
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'masterLedger', label: '가계부 (결제/급여)', desc: '지출 및 수입 일정' },
              { key: 'masterDuty', label: '모아당번', desc: '담당 과업 및 대신수행' },
              { key: 'masterGoal', label: '모아목표', desc: 'D-Day 및 마일스톤' },
              { key: 'masterRoutine', label: '모아루틴', desc: '약복용 및 세금신고' },
            ].map((item) => (
              <label
                key={item.key}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60"
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

        {/* Level 2: 개별 항목 상세 토글 (마스터 ON 시 종속) */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Level 2. 서비스별 세부 항목 표시 설정
          </h4>
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
          </div>
        </div>

        {/* 과거의 오늘 보기 년도 지정 (0~5년) */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            과거의 오늘 회고 표시 년도 지정
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
              ? '과거의 오늘 회고 영역을 달력 하단에서 숨깁니다.'
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
    </ElmBsh01>
  );
};
