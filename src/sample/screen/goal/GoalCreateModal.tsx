import React from 'react';
import { Target, X } from 'lucide-react';
import { ElmInp01, ElmSel01, ElmSel02 } from '../../elements/Tokens';
import { getGoalCategoryOptions, getGoalPlugin } from './plugins/registry';

interface GoalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  newCategoryVal: string;
  setNewCategoryVal: (val: string) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newFixedRule: string;
  setNewFixedRule: (val: string) => void;
  newInputRule: string;
  setNewInputRule: (val: string) => void;
  newTargetVal: string;
  setNewTargetVal: (val: string) => void;
  newUnit: string;
  setNewUnit: (val: string) => void;
  newPeriod: string;
  setNewPeriod: (val: string) => void;
}

export const GoalCreateModal: React.FC<GoalCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCategoryVal,
  setNewCategoryVal,
  newTitle,
  setNewTitle,
  newFixedRule,
  setNewFixedRule,
  newInputRule,
  setNewInputRule,
  newTargetVal,
  setNewTargetVal,
  newUnit,
  setNewUnit,
  newPeriod,
  setNewPeriod,
}) => {
  if (!isOpen) return null;

  const categoryOptions = getGoalCategoryOptions();

  const handleCategoryChange = (nextVal: string) => {
    setNewCategoryVal(nextVal);
    const plugin = getGoalPlugin(nextVal);
    setNewUnit(plugin.defaultUnit);
    setNewTargetVal(String(plugin.defaultTargetValue));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">모아목표 등록</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
              목표 유형 선택 (플러그인 자동 바인딩)
            </label>
            <ElmSel02
              value={newCategoryVal}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="시스템 제공 목표 유형을 선택하세요"
            />
          </div>

          <ElmInp01
            label="목표 제목"
            value={newTitle}
            onChange={setNewTitle}
            placeholder="예: 매일 저녁 만보 걷기 챌린지"
          />

          <ElmInp01
            label="📌 고정 항목 (규칙/기준)"
            value={newFixedRule}
            onChange={setNewFixedRule}
            placeholder="예: 일일 최소 10,000보 이상 걸음 수 인정 (만보기 캡처 필수)"
          />

          <ElmInp01
            label="✏️ 입력 항목 (수행 기록 가이드)"
            value={newInputRule}
            onChange={setNewInputRule}
            placeholder="예: 당일 실제 걸음 수(숫자) & 컨디션 메모 & 인증 사진 첨부"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ElmInp01
              label="목표 기준치"
              value={newTargetVal}
              onChange={setNewTargetVal}
              placeholder="10000"
            />
            <ElmInp01
              label="측정 단위"
              value={newUnit}
              onChange={setNewUnit}
              placeholder="보, 원, 권, 시간 등"
            />
            <ElmSel01
              label="실천 기간"
              value={newPeriod}
              onChange={setNewPeriod}
              options={[
                { value: '14', label: '2주 집중 (14일)' },
                { value: '30', label: '한 달 달성 (30일)' },
                { value: '60', label: '두 달 마스터 (60일)' },
                { value: '100', label: '100일 습관형' },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold shadow-md cursor-pointer transition-all"
            >
              목표 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
