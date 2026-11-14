import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Sparkles, Store, ChevronRight, Copy, Camera, Download, Trophy } from 'lucide-react';
import { TARGET_ICONS, GoalPresetItem, Participant } from '../types';
import { ArrivalPopupData, LadderGoal, LadderResultMap } from './types';
import { StorePreset, StoreMenuItem, SYSTEM_STORE_POOL } from '../../../sample/data/systemStorePool';
import { getStoreMenuEmoji } from './ladderEngine';

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
  onProceed: (targetIdx?: number) => void;
  resolvedTheme: string;
  isDark: boolean;
  isGuest?: boolean;
}

export const LadderArrivalModal: React.FC<LadderArrivalModalProps> = ({
  arrivalData,
  onProceed,
  resolvedTheme,
  isDark,
  isGuest = false,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const onProceedRef = useRef(onProceed);
  onProceedRef.current = onProceed;
  const arrivalDataRef = useRef(arrivalData);
  arrivalDataRef.current = arrivalData;

  useEffect(() => {
    if (!arrivalData) return;
    const initialCountdown = isGuest ? 6 : 3;
    setCountdown(initialCountdown);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const currentArrival = arrivalDataRef.current;
          const nextIdx = currentArrival ? currentArrival.memberIndex + 1 : undefined;
          onProceedRef.current(nextIdx);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [arrivalData, isGuest]);

  if (!arrivalData) return null;

  const { member, result, memberIndex, totalMembers, nextMemberName } = arrivalData;
  const isLast = memberIndex + 1 >= totalMembers;

  const handleManualProceed = () => {
    onProceed(memberIndex + 1);
  };

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

        {isGuest ? (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>
                {isLast
                  ? `방장이 최종 결과를 확인하면 함께 열립니다`
                  : `방장의 진행 신호에 맞춰 함께 출발합니다`}
              </span>
            </div>
            {countdown <= 2 && (
              <button
                type="button"
                onClick={handleManualProceed}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-all border border-slate-300 dark:border-zinc-600"
              >
                신호 지연 시 직접 다음 주자로 넘어가기 ({countdown}초)
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleManualProceed}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            <span>
              {isLast
                ? `최종 결과 확인하기 (${countdown}초 뒤 자동)`
                : `다음 주자 (${nextMemberName || '계속'}) 출발 ➔ (${countdown}초 뒤 자동)`}
            </span>
          </button>
        )}
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
  mode?: 'STORE_ONLY' | 'MEMBER_MENU';
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
  mode = 'STORE_ONLY',
  members,
  resolvedTheme,
  isDark,
}) => {
  const isStoreOnly = mode === 'STORE_ONLY';
  const targetMember = members.find((m) => m.id === currentMemberId);
  const [activeTab, setActiveTab] = useState<'store' | 'menu'>(
    isStoreOnly ? 'store' : selectedStore ? 'menu' : 'store'
  );

  const prevIsOpenRef = React.useRef(false);
  React.useEffect(() => {
    // 팝업이 최초 열릴 때만 초기 탭 결정 (isOpen false -> true 전환 시 1회만 실행)
    if (isOpen && !prevIsOpenRef.current) {
      setActiveTab(isStoreOnly ? 'store' : selectedStore ? 'menu' : 'store');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, isStoreOnly, selectedStore]);

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
            <h3 className="text-sm font-bold">
              {isStoreOnly
                ? '매장 선택 및 연동'
                : targetMember
                ? `${targetMember.name} 메뉴 선택`
                : '매장 메뉴 연동'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 탭 버튼: 매장 변경 / 메뉴 목록 둘러보기 */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            매장 변경
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            disabled={!selectedStore}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            {isStoreOnly ? '메뉴 둘러보기' : '내 메뉴 고르기'}
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
            {selectedStore?.menus.map((item: StoreMenuItem) => {
              const fallbackIcon = getStoreMenuEmoji(item);

              if (isStoreOnly) {
                return (
                  <div
                    key={item.id}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-left flex items-center justify-between gap-3 bg-white dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const span = document.createElement('span');
                                span.className = 'text-xl select-none';
                                span.innerText = fallbackIcon;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xl select-none">{fallbackIcon}</span>
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            ₩{item.price.toLocaleString()}원
                          </span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 shrink-0 select-none">
                      메뉴 참고
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectMenuForMember(currentMemberId, item);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between gap-3 cursor-pointer group hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-700">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const span = document.createElement('span');
                              span.className = 'text-xl select-none';
                              span.innerText = fallbackIcon;
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xl select-none">{fallbackIcon}</span>
                      )}
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          ₩{item.price.toLocaleString()}원
                        </span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    선택
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 하단 고정 푸터: 스크롤 영역 외부로 격리하여 상시 접근성 보장 */}
        <div className="shrink-0 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 truncate">
            {selectedStore ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm shrink-0">
                  {selectedStore.category === 'CAFE' ? '☕' : '🍽️'}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {selectedStore.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-medium shrink-0">
                  {selectedStore.menus.length}개 메뉴
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                연동된 매장 없음 (기본 사다리)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              닫기
            </button>
            {isStoreOnly && (
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>매장 연동 완료</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


/* =========================================================================
   사다리타기 최종 결과 정보 팝업 레이어 (LadderResultModal)
   ========================================================================= */
export interface LadderResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Participant[];
  results: LadderResultMap | null;
  selectedStore: StorePreset | null;
  onCopyText: () => void;
  onCopyImageCard: () => void;
  onDownloadImageCard: () => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderResultModal: React.FC<LadderResultModalProps> = ({
  isOpen,
  onClose,
  members,
  results,
  selectedStore,
  onCopyText,
  onCopyImageCard,
  onDownloadImageCard,
  resolvedTheme,
  isDark,
}) => {
  if (!isOpen || !results) return null;

  const winners = members.filter((m) => results[m.id]?.isWinner);
  const totalAmount = selectedStore
    ? members.reduce((sum, m) => sum + (m.selectedMenu?.price || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg max-h-[90vh] p-5 sm:p-6 rounded-2xl border shadow-2xl flex flex-col gap-4 overflow-hidden ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-lg">
              🏆
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>사다리타기 최종 결과</span>
                {selectedStore && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                    {selectedStore.name} 주문서
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                총 {members.length}명 참여 • 당첨 {winners.length}명
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 당첨자 하이라이트 요약 */}
        {winners.length > 0 && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shrink-0 ${
              resolvedTheme === 'dawn'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : isDark
                ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-xs font-black">오늘의 당첨자</p>
                <p className="text-xs font-semibold mt-0.5">
                  {winners.map((w) => `${w.avatar} ${w.name}${w.selectedMenu ? ` (${getStoreMenuEmoji(w.selectedMenu)} ${w.selectedMenu.name})` : ''}`).join(', ')}
                </p>
              </div>
            </div>
            {totalAmount > 0 && (
              <div className="text-right shrink-0">
                <span className="text-[10px] opacity-75">결제 예상 총액</span>
                <p className="text-sm font-black font-mono">₩{totalAmount.toLocaleString()}원</p>
              </div>
            )}
          </div>
        )}

        {/* 참가자별 결과 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            참가자별 도착 결과 상세:
          </span>
          {members.map((m) => {
            const res = results[m.id];
            const isWinner = res?.isWinner;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isWinner
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg p-1.5 rounded-lg bg-black/5 dark:bg-white/5 shrink-0">
                    {m.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {typeof m.weight === 'number' && m.weight !== 10 && (
                        <span
                          className={`text-[9px] px-1 rounded font-mono ${
                            m.weight <= 0
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {m.weight <= 0 ? '0x 🎈' : `${m.weight}x`}
                        </span>
                      )}
                    </p>
                    {m.selectedMenu && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate mt-0.5 flex items-center gap-1">
                        <span>{getStoreMenuEmoji(m.selectedMenu)}</span>
                        <span>{m.selectedMenu.name}</span>
                        <span className="font-mono opacity-80">(₩{m.selectedMenu.price.toLocaleString()}원)</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      isWinner
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{res?.icon || '❓'}</span>
                    <span>{res?.text || '대기'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3대 결과 공유 액션 버튼 바 */}
        {/* 결과 복사 3대 아이콘 및 팝업 닫기 버튼 */}
        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 mr-1">
              결과 복사:
            </span>
            <button
              type="button"
              onClick={onCopyText}
              className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center cursor-pointer ${
                resolvedTheme === 'dawn'
                  ? 'bg-white border-[#bfdbfe] text-indigo-700 hover:bg-indigo-50'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-indigo-400 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
              }`}
              title="결과 텍스트 클립보드 복사"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCopyImageCard}
              className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center cursor-pointer ${
                resolvedTheme === 'dawn'
                  ? 'bg-white border-[#bfdbfe] text-indigo-700 hover:bg-indigo-50'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-indigo-400 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
              }`}
              title="결과 카드 이미지 클립보드 복사"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDownloadImageCard}
              className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center cursor-pointer ${
                resolvedTheme === 'dawn'
                  ? 'bg-white border-[#bfdbfe] text-emerald-700 hover:bg-emerald-50'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-emerald-400 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-50'
              }`}
              title="결과 카드 이미지 파일 다운로드"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. 실시간 다자간 방 공유 및 크로스 디바이스 QR 코드 모달 (LadderShareModal) */
/* -------------------------------------------------------------------------- */
export interface LadderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  gameTitle?: string;
  shareUrl: string;
  connectedClients: number;
  isHost: boolean;
  isClosed?: boolean;
  initialTab?: 'SHARE' | 'JOIN';
  onCopyUrl: () => void;
  onCopyCode: () => void;
  onLeaveRoom: () => void;
  onCloseRoom?: () => void; // 호스트가 게임을 종료하여 신규 유입 차단
  onJoinRoom?: (code: string) => void; // 방 코드로 새 방 입장
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderShareModal: React.FC<LadderShareModalProps> = ({
  isOpen,
  onClose,
  roomId,
  gameTitle = '사다리 게임',
  shareUrl,
  connectedClients,
  isHost,
  isClosed = false,
  initialTab = 'SHARE',
  onCopyUrl,
  onCopyCode,
  onLeaveRoom,
  onCloseRoom,
  onJoinRoom,
  resolvedTheme,
  isDark,
}) => {
  const [activeTab, setActiveTab] = React.useState<'SHARE' | 'JOIN'>(initialTab);
  const [joinCodeInput, setJoinCodeInput] = React.useState('');
  const [joinError, setJoinError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setJoinCodeInput('');
      setJoinError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleExecuteJoin = () => {
    const trimmed = joinCodeInput.trim().toUpperCase();
    if (!trimmed) {
      setJoinError('초대 방 코드를 입력해주세요.');
      return;
    }
    if (trimmed === roomId) {
      setJoinError('현재 이미 접속 중인 방 코드입니다.');
      return;
    }
    // 🔑 [기존 방 참여 종료 및 인원수 차감] 기존 방이 활성화되어 있다면 즉시 퇴장 처리
    if (roomId) {
      onLeaveRoom();
    }
    setJoinError('');
    onJoinRoom?.(trimmed);
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
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
            <h3 className="text-xs font-bold">
              <span>{gameTitle} 실시간 다자간 공유</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 모드 전환 탭 (공유 게시/관리 vs 방 코드로 참여) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTab('SHARE')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SHARE'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            📢 공유 게시 · 관리
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('JOIN')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'JOIN'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            🔑 방 코드로 참여
          </button>
        </div>

        {activeTab === 'JOIN' ? (
          /* [공유 참여 모드] 방 코드 직접 입력 및 입장 */
          <div className="space-y-3.5 py-1">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                <span>🎯</span>
                <span>실시간 게임 방 참여하기</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
                전달받으신 초대 방 코드(예: <code>LAD_ABC123</code>, <code>ROU_XYZ456</code>)를 입력하시면 즉시 해당 실시간 게임에 접속합니다.
              </p>
            </div>

            {roomId && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>현재 참여 중인 방(<code>{roomId}</code>)에서 자동 퇴장(인원수 차감) 후 새 방으로 입장합니다.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                초대 방 코드
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value);
                    if (joinError) setJoinError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteJoin();
                  }}
                  placeholder="예: LAD_492810 또는 ROU_773912"
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 uppercase"
                />
                <button
                  type="button"
                  onClick={handleExecuteJoin}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  입장하기
                </button>
              </div>
              {joinError && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">
                  {joinError}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-zinc-600 transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          /* [공유 게시/관리 모드] 기존 QR, 방 코드 복사, 링크 복사 */
          <>
            {/* 접속 현황 배지 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <div>
                  <p className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200">
                    {isClosed ? '게임이 종료되어 신규 참여가 마감되었습니다' : isHost ? '내가 방장(Host)으로 운영 중' : '참가자(Guest)로 접속 중'}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                    {isClosed ? '기존 접속자 및 링크는 최종 결과만 열람 가능' : '스마트폰 / 다른 PC 어디서든 실시간 동기화'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{connectedClients}명 연결</span>
              </span>
            </div>

            {/* 6자리 방 코드 카드 */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-center space-y-1">
              <span className="text-[10px] font-semibold text-slate-400">초대 방 코드 (Type-Prefixed)</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {roomId}
                </span>
                <button
                  type="button"
                  onClick={onCopyCode}
                  disabled={isClosed}
                  className="p-1 rounded-md border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-200 hover:bg-slate-100 disabled:opacity-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="방 코드 복사"
                >
                  <Copy className="w-3 h-3 text-indigo-500" />
                  <span>코드 복사</span>
                </button>
              </div>
            </div>

        {/* QR 코드 시각화 안내 영역 */}
        {!isClosed ? (
          <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="p-2 rounded-lg bg-white border border-slate-300 shadow-2xs">
              <svg
                className="w-32 h-32 text-slate-900"
                viewBox="0 0 29 29"
                fill="currentColor"
                shapeRendering="crispEdges"
              >
                <rect x="2" y="2" width="7" height="7" />
                <rect x="3" y="3" width="5" height="5" fill="white" />
                <rect x="4" y="4" width="3" height="3" />
                <rect x="20" y="2" width="7" height="7" />
                <rect x="21" y="3" width="5" height="5" fill="white" />
                <rect x="22" y="4" width="3" height="3" />
                <rect x="2" y="20" width="7" height="7" />
                <rect x="3" y="21" width="5" height="5" fill="white" />
                <rect x="4" y="22" width="3" height="3" />
                <rect x="10" y="4" width="1" height="1" />
                <rect x="12" y="4" width="1" height="1" />
                <rect x="14" y="4" width="1" height="1" />
                <rect x="16" y="4" width="1" height="1" />
                <rect x="18" y="4" width="1" height="1" />
                <rect x="4" y="10" width="1" height="1" />
                <rect x="4" y="12" width="1" height="1" />
                <rect x="4" y="14" width="1" height="1" />
                <rect x="4" y="16" width="1" height="1" />
                <rect x="4" y="18" width="1" height="1" />
                <rect x="10" y="10" width="2" height="2" />
                <rect x="13" y="11" width="1" height="2" />
                <rect x="15" y="10" width="2" height="1" />
                <rect x="11" y="14" width="3" height="1" />
                <rect x="16" y="13" width="2" height="2" />
                <rect x="10" y="17" width="2" height="2" />
                <rect x="13" y="16" width="2" height="1" />
                <rect x="17" y="17" width="1" height="2" />
                <rect x="20" y="10" width="2" height="1" />
                <rect x="23" y="12" width="3" height="1" />
                <rect x="21" y="15" width="2" height="2" />
                <rect x="24" y="18" width="2" height="2" />
                <rect x="10" y="21" width="2" height="2" />
                <rect x="13" y="23" width="3" height="1" />
                <rect x="17" y="22" width="1" height="3" />
                <rect x="20" y="21" width="2" height="2" />
                <rect x="23" y="24" width="3" height="2" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 text-center">
              📷 스마트폰 카메라로 QR 코드를 비추면 즉시 입장합니다
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1">
            <span className="text-xl">🔒</span>
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              게임이 종료되어 신규 참가자 유입이 차단되었습니다
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              초대 링크로 접속하는 사용자는 최종 결과만 확인할 수 있습니다.
            </p>
          </div>
        )}

        {/* 초대 링크 URL 확인 및 복사 인풋 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-500 dark:text-zinc-400">🔗 초대 링크 URL</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              실시간 동기화 지원
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent border-none text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none px-1 truncate select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={onCopyUrl}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>복사</span>
            </button>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 space-y-0.5">
            <p>• <strong>샌드박스 테스트</strong>: 현재 로그인된 브라우저의 <strong>새 탭 또는 다른 일반 창</strong>에서 링크를 열면 즉시 실시간 동기화됩니다.</p>
            <p>• <strong>403 오류 안내</strong>: 시크릿 창(Incognito)이나 비로그인 브라우저는 구글 세션이 없어 403이 발생하므로, 일반 브라우저 창에서 열어주세요.</p>
          </div>
        </div>

        {/* 초대 링크 복사 & 호스트 전용 게임종료/나가기 액션 */}
        <div className="space-y-2">
          {!isClosed ? (
            <button
              type="button"
              onClick={onCopyUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>원클릭 초대 링크 복사하기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCopyUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
              <span>결과 확인용 링크 복사하기</span>
            </button>
          )}

          {isHost && !isClosed && onCloseRoom && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('게임을 종료하시겠습니까? 게임을 종료하면 초대 링크 유입이 차단되고 최종 결과만 보관됩니다.')) {
                  onCloseRoom();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔒 게임 종료 (초대 링크 폐기 및 유입 차단)</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                onLeaveRoom();
                onClose();
              }}
              className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              방 나가기 (로컬 복귀)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-zinc-600 transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  );
};

