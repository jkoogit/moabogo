import React from 'react';
import { ArrowDown, ArrowUp, BookOpen, RotateCcw, UserCheck } from 'lucide-react';
import { ElmSwt01 } from '../../elements/Tokens';
import {
  CommonServicePreferences,
  DEFAULT_EXPENSE_CATEGORY_ORDER,
} from '../../data/servicePreferencesPool';

interface CommonServicePanelProps {
  commonPrefs: CommonServicePreferences;
  onUpdateCommonPrefs: (prefs: CommonServicePreferences) => void;
  onNotify: (msg: string) => void;
}

const LEDGER_CHOICES = [
  { id: 'led-1', label: '우리집 생활비 가계부 (가족 공유)' },
  { id: 'led-2', label: '내 개인 메인 가계부 (기본)' },
  { id: 'led-3', label: '데이트/커플 공동 통장' },
];

export const CommonServicePanel: React.FC<CommonServicePanelProps> = ({
  commonPrefs,
  onUpdateCommonPrefs,
  onNotify,
}) => {
  const moveCategory = (idx: number, dir: 'UP' | 'DOWN') => {
    const target = dir === 'UP' ? idx - 1 : idx + 1;
    if (target < 0 || target >= commonPrefs.expenseCategoryOrder.length) return;
    const next = [...commonPrefs.expenseCategoryOrder];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onUpdateCommonPrefs({ ...commonPrefs, expenseCategoryOrder: next });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. 가계부(SCR-LED-01 / SCR-QCK-01) 기본 귀속 및 카테고리 순서 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>가계부 기본 귀속 & 지출 카테고리 순서 (LED)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              빠른등록(SCR-QCK-01) 및 가계부 기장 시 기본 선택될 장부와 카테고리 노출 순서를 지정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateCommonPrefs({
                ...commonPrefs,
                expenseCategoryOrder: [...DEFAULT_EXPENSE_CATEGORY_ORDER],
              });
              onNotify('지출 카테고리 순서가 기본값으로 초기화되었습니다.');
            }}
            className="min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>초기화</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
            빠른등록 기본 귀속 가계부
          </label>
          <select
            value={commonPrefs.defaultLedgerId}
            onChange={(e) => {
              onUpdateCommonPrefs({ ...commonPrefs, defaultLedgerId: e.target.value });
              onNotify('기본 귀속 가계부가 변경되었습니다.');
            }}
            className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-xs font-bold"
          >
            {LEDGER_CHOICES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
            기본 지출 카테고리 노출 순서
          </span>
          <div className="space-y-1.5">
            {commonPrefs.expenseCategoryOrder.map((cat, idx) => (
              <div
                key={cat}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{cat}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveCategory(idx, 'UP')}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === commonPrefs.expenseCategoryOrder.length - 1}
                    onClick={() => moveCategory(idx, 'DOWN')}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 마이페이지(SCR-MYP-01) 프로필 공개 & 대표계좌 퀵복사 연동 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>마이페이지 프로필 · 대표계좌 퀵복사 연동 (MYP)</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            SCR-MYP-01 및 대시보드 마이페이지 위젯의 계좌 노출과 모임원 공개 범위를 설정합니다.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F]">
          <ElmSwt01
            checked={commonPrefs.mypageQuickAccountCopy}
            onChange={(checked) => {
              onUpdateCommonPrefs({ ...commonPrefs, mypageQuickAccountCopy: checked });
              onNotify(checked ? '대표계좌 퀵복사 노출이 활성화되었습니다.' : '대표계좌 퀵복사를 숨깁니다.');
            }}
            label="대시보드·마이페이지 대표 송금계좌 퀵복사 노출"
            description="정산 및 모임원 송금 안내 시 대표 계좌번호 원터치 복사 버튼을 표시합니다."
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
            모임 구성원 대상 프로필·활동 공개 범위
          </span>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'PUBLIC_GROUP' as const, title: '같은 모임 구성원에게 전체 활동 공개', desc: '당번·목표 스트릭과 프로필 배지를 함께 공유' },
              { id: 'SUMMARY_ONLY' as const, title: '달성률 요약만 공개', desc: '상세 이력은 숨기고 달성 수치 요약만 공유' },
              { id: 'PRIVATE' as const, title: '비공개 (나만 보기)', desc: '닉네임 외 모든 활동 지표를 비공개로 유지' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onUpdateCommonPrefs({ ...commonPrefs, mypageProfileVisibility: opt.id });
                  onNotify(`프로필 공개 범위가 '${opt.title}'로 저장되었습니다.`);
                }}
                className={`min-h-[44px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  commonPrefs.mypageProfileVisibility === opt.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-[#0E131F]'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                  {opt.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
