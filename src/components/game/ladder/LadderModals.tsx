import React, { useState } from 'react';
import { X, Check, Sparkles, Store, ChevronRight, Copy, Camera, Download, Trophy } from 'lucide-react';
import { TARGET_ICONS, GoalPresetItem, Participant } from '../types';
import { ArrivalPopupData, LadderGoal, LadderResultMap } from './types';
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
  mode?: 'STORE_ONLY' | 'MEMBER_MENU';
  resolvedTheme: string;
  isDark: boolean;
}

export const getStoreMenuEmoji = (item: StoreMenuItem): string => {
  if (item.iconName) return item.iconName;
  const cat = item.categoryName || '';
  const name = item.name || '';
  if (name.includes('아메리카노') || name.includes('콜드브루') || cat.includes('커피') || cat.includes('에스프레소')) return '☕';
  if (name.includes('라떼') || name.includes('카푸치노') || name.includes('마끼아또') || name.includes('모카')) return '☕';
  if (name.includes('티') || cat.includes('티') || name.includes('캐모마일') || name.includes('얼그레이')) return '🍵';
  if (name.includes('에이드') || name.includes('주스') || cat.includes('에이드') || cat.includes('주스') || name.includes('스무디') || name.includes('프라페')) return '🍹';
  if (name.includes('샌드위치') || name.includes('토스트') || name.includes('파니니') || cat.includes('샌드위치')) return '🥪';
  if (name.includes('케이크') || name.includes('타르트') || name.includes('마카롱') || cat.includes('디저트') || cat.includes('베이커리')) return '🍰';
  if (name.includes('버거') || cat.includes('버거')) return '🍔';
  if (name.includes('피자')) return '🍕';
  if (name.includes('샐러드')) return '🥗';
  if (name.includes('빙수')) return '🍧';
  return '☕';
};

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

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(isStoreOnly ? 'store' : selectedStore ? 'menu' : 'store');
    }
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

        {/* 탭 버튼: 매장변경/해제(isStoreOnly)로 열린 경우 탭 숨김 (메뉴선택 불필요 및 선택 제한) */}
        {!isStoreOnly && (
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
              내 메뉴 고르기
            </button>
          </div>
        )}

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
                    if (isStoreOnly) {
                      onClose();
                    } else {
                      setActiveTab('menu');
                    }
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
                  {winners.map((w) => `${w.avatar} ${w.name}`).join(', ')}
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
                      {m.weight > 1 && (
                        <span className="text-[9px] px-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                          {m.weight.toFixed(1)}x
                        </span>
                      )}
                    </p>
                    {m.selectedMenu && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate mt-0.5">
                        선택: {m.selectedMenu.name} (₩{m.selectedMenu.price.toLocaleString()}원)
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
        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCopyText}
            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>결과 텍스트 복사</span>
          </button>

          <button
            type="button"
            onClick={onCopyImageCard}
            className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
      </div>
    </div>
  );
};
