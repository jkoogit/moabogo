import React, { useState } from 'react';
import { X, Check, Sparkles, Store, ChevronRight } from 'lucide-react';
import { TARGET_ICONS, GoalPresetItem, Participant } from '../types';
import { ArrivalPopupData, LadderGoal } from './types';
import { StorePreset, StoreMenuItem, SYSTEM_STORE_POOL } from '../../../sample/data/systemStorePool';

export interface LadderGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  colIndex: number;
  currentGoal: LadderGoal;
  onSaveGoal: (colIdx: number, newGoal: LadderGoal) => void;
  presetGoals: GoalPresetItem[];
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderGoalModal: React.FC<LadderGoalModalProps> = ({
  isOpen,
  onClose,
  colIndex,
  currentGoal,
  onSaveGoal,
  presetGoals,
  resolvedTheme,
  isDark,
}) => {
  const [text, setText] = useState<string>(currentGoal.text);
  const [icon, setIcon] = useState<string>(currentGoal.icon);

  if (!isOpen) return null;

  const handleApply = () => {
    onSaveGoal(colIndex, { text: text.trim() || '목표', icon });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-sm p-5 rounded-2xl border shadow-2xl space-y-4 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold flex items-center gap-1.5">
            <span>🪜 {colIndex + 1}번 기둥 목표 설정</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 현재 목표 미리보기 및 인풋 */}
        <div className="flex items-center gap-2">
          <div className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
            {icon}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="목표 문구 (예: 커피 쏘기)"
            className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold outline-none focus:border-indigo-500"
          />
        </div>

        {/* 퀵 프리셋 버튼들 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            추천 목표 프리셋:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
            {presetGoals.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setText(p.text);
                  setIcon(p.icon);
                }}
                className="px-2.5 py-1 rounded-lg border text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 hover:border-indigo-500 flex items-center gap-1 cursor-pointer"
              >
                <span>{p.icon}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 아이콘 선택 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            아이콘 선택:
          </span>
          <div className="grid grid-cols-6 gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
            {TARGET_ICONS.map((ic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIcon(ic)}
                className={`p-1.5 rounded-lg text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-transform ${
                  icon === ic ? 'ring-2 ring-indigo-500 scale-110 bg-indigo-50 dark:bg-indigo-950/40' : ''
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export interface LadderArrivalModalProps {
  arrivalData: ArrivalPopupData | null;
  onProceed: () => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderArrivalModal: React.FC<LadderArrivalModalProps> = ({
  arrivalData,
  onProceed,
  resolvedTheme,
  isDark,
}) => {
  if (!arrivalData) return null;

  const { member, result, memberIndex, totalMembers, nextMemberName } = arrivalData;
  const isLast = memberIndex + 1 >= totalMembers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl flex flex-col items-center justify-center gap-4 text-center ${
          result.isWinner
            ? 'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/80 dark:to-orange-950/80 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
            : resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.isWinner ? (
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
          ) : (
            <span className="text-xl">🏃</span>
          )}
          <span className="text-xs font-black tracking-wider uppercase">
            {result.isWinner ? '🎉 당첨 확정!' : '결과 도착'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-4xl p-2 rounded-2xl bg-black/5 dark:bg-white/10">
            {member.avatar}
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {memberIndex + 1} / {totalMembers}번 주자
            </p>
            <h4 className="text-lg font-black tracking-tight">{member.name}</h4>
          </div>
        </div>

        <div className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/20 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl">{result.icon}</span>
          <span className="text-base font-black mt-1">{result.text}</span>
        </div>

        <button
          type="button"
          onClick={onProceed}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          {isLast ? '최종 결과 확인하기' : `다음 주자 (${nextMemberName || '계속'}) 출발 ➔`}
        </button>
      </div>
    </div>
  );
};

export interface StoreMenuSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStore: StorePreset | null;
  onSelectStore: (store: StorePreset | null) => void;
  members: Participant[];
  currentMemberId: string;
  onSelectMenuForMember: (memberId: string, item: StoreMenuItem) => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const StoreMenuSelectModal: React.FC<StoreMenuSelectModalProps> = ({
  isOpen,
  onClose,
  selectedStore,
  onSelectStore,
  onSelectMenuForMember,
  currentMemberId,
  resolvedTheme,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'menu'>('store');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg max-h-[85vh] p-5 rounded-2xl border shadow-2xl flex flex-col gap-4 overflow-hidden ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold">카페 & 매장 메뉴 연동</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'store'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            매장 선택
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            disabled={!selectedStore}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
              activeTab === 'menu'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            내 음료 고르기
          </button>
        </div>

        {activeTab === 'store' ? (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                onSelectStore(null);
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                !selectedStore
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-bold">매장 연동 해제 (일반 사다리타기)</p>
                <p className="text-[11px] text-slate-400">메뉴 주문서 없이 목표만으로 진행합니다.</p>
              </div>
              {!selectedStore && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            {SYSTEM_STORE_POOL.map((store: StorePreset) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    onSelectStore(store);
                    setActiveTab('menu');
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{store.category === 'CAFE' ? '☕' : '🍽️'}</span>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <span>{store.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500">
                          {store.category}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">{store.menus.length}개 대표 메뉴</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {selectedStore?.menus.map((item: StoreMenuItem) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectMenuForMember(currentMemberId, item);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold">{item.name}</p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    ₩{item.price.toLocaleString()}원
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  선택
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
