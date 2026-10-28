import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Play,
  RotateCcw,
  Copy,
  Camera,
  Download,
  HelpCircle,
  Plus,
  Minus,
  Trophy,
} from 'lucide-react';
import { ElmRng01, ElmSld03 } from '../../../sample/elements/Tokens';
import { Participant, RouletteSliceItem } from '../types';
import { DEFAULT_FIVE_ITEMS_PRESET } from './types';
import {
  calculateRouletteSlices,
  pickRandomRouletteItem,
  calculateTargetRotation,
  formatRouletteResultText,
} from './rouletteEngine';
import { RouletteWheelSvg } from './RouletteWheelSvg';
import {
  RouletteHelpModal,
  RouletteItemSettingModal,
  RouletteIconPickerModal,
  RouletteResultModal,
} from './RouletteModals';
import {
  ROULETTE_PRESETS,
  RoulettePreset,
  RoulettePresetItem,
} from '../../../sample/data/systemStorePool';
import {
  generateRouletteResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
} from '../../../sample/utils/gameResultCardCanvas';

export interface RouletteGameZoneProps {
  members: Participant[];
  roulettePresetTitle: string;
  setRoulettePresetTitle: (title: string) => void;
  rouletteItems: RouletteSliceItem[];
  setRouletteItems: React.Dispatch<React.SetStateAction<RouletteSliceItem[]>>;
  selectedRouletteWinner: RouletteSliceItem | null;
  setSelectedRouletteWinner: (w: RouletteSliceItem | null) => void;
  useRouletteWeight: boolean;
  setUseRouletteWeight: React.Dispatch<React.SetStateAction<boolean>>;
  excludeWinnerMode: boolean;
  setExcludeWinnerMode: React.Dispatch<React.SetStateAction<boolean>>;
  excludedWinners: Participant[];
  setExcludedWinners: React.Dispatch<React.SetStateAction<Participant[]>>;
  excludedRouletteItems: RouletteSliceItem[];
  setExcludedRouletteItems: React.Dispatch<React.SetStateAction<RouletteSliceItem[]>>;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const RouletteGameZone: React.FC<RouletteGameZoneProps> = ({
  members,
  roulettePresetTitle,
  setRoulettePresetTitle,
  rouletteItems,
  setRouletteItems,
  selectedRouletteWinner,
  setSelectedRouletteWinner,
  useRouletteWeight,
  setUseRouletteWeight,
  excludeWinnerMode,
  setExcludeWinnerMode,
  excludedRouletteItems,
  setExcludedRouletteItems,
  showToast,
  resolvedTheme,
  isDark,
}) => {
  const [rouletteRotation, setRouletteRotation] = useState<number>(0);
  const [rouletteTransitionDuration, setRouletteTransitionDuration] = useState<number>(3500);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState<boolean>(false);
  const [iconPickerTargetId, setIconPickerTargetId] = useState<string | null>(null);

  // New item form in modal
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemIcon, setNewItemIcon] = useState<string>('🎯');

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpinChosenRef = useRef<RouletteSliceItem | null>(null);

  const totalRouletteWeight = useMemo(() => {
    return rouletteItems.reduce((acc, it) => acc + Math.max(1, it.weight || 1), 0);
  }, [rouletteItems]);

  const rouletteSlices = useMemo(() => {
    return calculateRouletteSlices(rouletteItems, totalRouletteWeight);
  }, [rouletteItems, totalRouletteWeight]);

  const handleUpdateRouletteItemCount = (count: number) => {
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRouletteItems((prev) => {
      const diff = count - prev.length;
      if (diff === 0) return prev;
      if (diff > 0) {
        const added = Array.from({ length: diff }, (_, i) => {
          const idx = prev.length + i + 1;
          return {
            id: `item_${Date.now()}_${idx}`,
            name: `항목${idx}`,
            avatar: '🎯',
            weight: 1,
          };
        });
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const handleUpdateItemName = (id: string, name: string) => {
    setRouletteItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, name } : it))
    );
  };

  const handleUpdateItemWeight = (id: string, delta: number) => {
    setRouletteItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const current = it.weight || 1;
        const next = Math.max(1, Math.min(10, current + delta));
        return { ...it, weight: next };
      })
    );
  };

  const handleSpinRoulette = (skip = false, overrideChosen?: RouletteSliceItem, forceRestart = false) => {
    if (rouletteItems.length === 0) return;

    if (isSpinning && skip) {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
        spinTimerRef.current = null;
      }
      const chosen = currentSpinChosenRef.current || overrideChosen || rouletteItems[0];
      const { nextRotation, duration } = calculateTargetRotation(chosen, rouletteSlices, rouletteRotation, true);
      setRouletteTransitionDuration(duration);
      setRouletteRotation(nextRotation);
      setIsSpinning(false);
      setSelectedRouletteWinner(chosen);
      setIsResultModalOpen(true);
      if (excludeWinnerMode && rouletteItems.length > 2) {
        setExcludedRouletteItems((prev) => [...prev, chosen]);
        setRouletteItems((prev) => prev.filter((it) => it.id !== chosen.id));
      }
      return;
    }

    if (isSpinning && !forceRestart) return;

    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }

    setSelectedRouletteWinner(null);
    const chosen = overrideChosen || pickRandomRouletteItem(rouletteItems, totalRouletteWeight);
    currentSpinChosenRef.current = chosen;

    const { nextRotation, duration } = calculateTargetRotation(chosen, rouletteSlices, rouletteRotation, skip);
    setIsSpinning(true);
    setRouletteTransitionDuration(duration);
    setRouletteRotation(nextRotation);

    spinTimerRef.current = setTimeout(() => {
      setIsSpinning(false);
      setSelectedRouletteWinner(chosen);
      setIsResultModalOpen(true);
      if (excludeWinnerMode && rouletteItems.length > 2) {
        setExcludedRouletteItems((prev) => [...prev, chosen]);
        setRouletteItems((prev) => prev.filter((it) => it.id !== chosen.id));
      }
    }, duration);
  };

  const handleApplyMembersToRoulette = () => {
    if (members.length < 2) {
      showToast('참여 멤버가 2명 이상이어야 합니다.', 'warning');
      return;
    }
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRoulettePresetTitle('👥 참여 멤버 룰렛');
    setRouletteItems(
      members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        weight: Math.max(1, m.weight || 1),
      }))
    );
    showToast(`참여 멤버 ${members.length}명이 룰렛 항목에 반영되었습니다.`);
  };

  const handleSelectPreset = (preset: RoulettePreset) => {
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRoulettePresetTitle(preset.title);
    setRouletteItems(
      preset.items.map((it: RoulettePresetItem) => ({
        id: it.id,
        name: it.name,
        avatar: it.icon || '🎯',
        weight: it.weight || 1,
      }))
    );
    showToast(`'${preset.title}' 프리셋이 적용되었습니다.`);
  };

  const handleCopyText = () => {
    if (!selectedRouletteWinner) return;
    const text = formatRouletteResultText(selectedRouletteWinner, roulettePresetTitle, rouletteItems);
    navigator.clipboard?.writeText(text);
    showToast('룰렛 결과 텍스트가 클립보드에 복사되었습니다.');
  };

  const handleCopyImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateRouletteResultCardBlob({
        title: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        presetTitle: roulettePresetTitle,
        candidates: rouletteItems.map((it) => {
          const w = Math.max(1, it.weight || 1);
          return {
            name: it.name,
            avatar: it.avatar,
            weight: w,
            pct: Math.round((w / Math.max(1, totalRouletteWeight)) * 100),
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      const res = await copyBlobToClipboard(blob);
      if (res.success) {
        showToast('룰렛 결과 카드 이미지가 클립보드에 복사되었습니다.');
      } else {
        downloadBlobAsFile(blob, `moabogo_roulette_${Date.now()}.png`);
        showToast('클립보드 권한으로 인해 이미지 파일로 저장되었습니다.', 'info');
      }
    } catch (e) {
      console.error('Failed to generate roulette card:', e);
      showToast('카드 이미지 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleDownloadImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateRouletteResultCardBlob({
        title: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        presetTitle: roulettePresetTitle,
        candidates: rouletteItems.map((it) => {
          const w = Math.max(1, it.weight || 1);
          return {
            name: it.name,
            avatar: it.avatar,
            weight: w,
            pct: Math.round((w / Math.max(1, totalRouletteWeight)) * 100),
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      downloadBlobAsFile(blob, `moabogo_roulette_${Date.now()}.png`);
      showToast('룰렛 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download roulette card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleOpenIconPicker = (itemId: string) => {
    setIconPickerTargetId(itemId);
    setIsIconPickerOpen(true);
  };

  const handleSelectIcon = (icon: string) => {
    if (iconPickerTargetId === 'new_item') {
      setNewItemIcon(icon);
    } else if (iconPickerTargetId) {
      setRouletteItems((prev) =>
        prev.map((it) => (it.id === iconPickerTargetId ? { ...it, avatar: icon } : it))
      );
    }
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || rouletteItems.length >= 20) return;
    const item: RouletteSliceItem = {
      id: `item_custom_${Date.now()}`,
      name: newItemName.trim(),
      avatar: newItemIcon,
      weight: 1,
    };
    setRouletteItems((prev) => [...prev, item]);
    setNewItemName('');
  };

  const handleInstantResultInModal = () => {
    const chosen = pickRandomRouletteItem(rouletteItems, totalRouletteWeight);
    const { nextRotation } = calculateTargetRotation(chosen, rouletteSlices, rouletteRotation, true);
    setRouletteTransitionDuration(0);
    setRouletteRotation(nextRotation);
    setSelectedRouletteWinner(chosen);
    showToast(`즉시 결과: '${chosen.name}'(이)가 당첨되었습니다!`);
    if (excludeWinnerMode && rouletteItems.length > 2) {
      setExcludedRouletteItems((prev) => [...prev, chosen]);
      setRouletteItems((prev) => prev.filter((it) => it.id !== chosen.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 프리셋 및 설정 헤더 바 */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe]'
            : isDark
            ? 'bg-[#1a1a1e] border-[#27272a]'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              현재 룰렛 주제:
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              {roulettePresetTitle}
            </span>
            {excludedRouletteItems.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {excludedRouletteItems.length}개 항목 제외 중
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              title="룰렛 이용 안내"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 룰렛 항목 인디케이터 & 가중치 모드 토글 */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              설정 항목
            </span>
            <button
              type="button"
              onClick={() => setUseRouletteWeight((prev) => !prev)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                useRouletteWeight
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                  : resolvedTheme === 'dawn'
                  ? 'bg-white/80 border-[#bfdbfe] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{useRouletteWeight ? '⚡ 가중치 모드 ON' : '👥 균등 모드'}</span>
            </button>
          </div>
          <ElmRng01
            label=""
            value={rouletteItems.length}
            min={2}
            max={20}
            step={1}
            unit="개"
            onChange={(val: number) => handleUpdateRouletteItemCount(val)}
            colorScheme="indigo"
          />
        </div>

        {/* 항목 조정 & 프리셋 설정 버튼 */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">항목 조정:</span>
            <span className="text-[11px] text-slate-400">개별 명칭 및 가중치 세부 설정</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>항목 & 프리셋 설정</span>
          </button>
        </div>

        {/* 추천 프리셋 원터치 슬라이드 */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              📌 추천 프리셋:
            </span>
            <button
              type="button"
              onClick={handleApplyMembersToRoulette}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>👥</span>
              <span>참여 멤버 ({members.length}명) 반영</span>
            </button>
          </div>
          <ElmSld03
            showNavButtons={true}
            stepWidth={160}
            className="w-full"
            innerClassName="flex items-center gap-1.5 py-1 px-0.5"
          >
            {[DEFAULT_FIVE_ITEMS_PRESET, ...ROULETTE_PRESETS].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  roulettePresetTitle === preset.title
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : resolvedTheme === 'dawn'
                    ? 'bg-white border-[#bfdbfe] text-[#0d2746] hover:bg-blue-50'
                    : isDark
                    ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{preset.icon || '🎯'}</span>
                <span>{preset.title.replace(/^[^\s]+\s*/, '')}</span>
              </button>
            ))}
          </ElmSld03>
        </div>
      </div>

      {/* 룰렛 메인 인터랙션 존 (휠 + 항목 칩 + 컨트롤러) */}
      <div
        className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-6 ${
          resolvedTheme === 'dawn'
            ? 'bg-white/80 border-[#bfdbfe]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* 상단 인라인 슬라이스 칩들 */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
          {rouletteItems.map((item, idx) => {
            const weight = Math.max(1, item.weight || 1);
            const pct = Math.round((weight / Math.max(1, totalRouletteWeight)) * 100);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
                  resolvedTheme === 'dawn'
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                    : isDark
                    ? 'bg-[#242429] border-[#34343a] text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleOpenIconPicker(item.id)}
                  className="hover:scale-125 transition-transform cursor-pointer shrink-0"
                  title="아이콘 변경"
                >
                  {item.avatar}
                </button>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                  placeholder={`항목${idx + 1}`}
                  className="bg-transparent border-b border-transparent hover:border-current focus:border-current outline-none text-xs font-bold w-16 sm:w-20 px-0.5 text-center transition-colors truncate"
                  title="클릭하여 항목명 바로 수정"
                />
                <span className="text-[10px] opacity-60 font-mono shrink-0">{pct}%</span>
                {/* 룰렛 가중치 인라인 조절 컨트롤 */}
                {useRouletteWeight && (
                  <div className="flex items-center gap-0.5 ml-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemWeight(item.id, -1)}
                      className="p-0.5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform"
                      title="가중치 1 감소"
                      aria-label="1 감소"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-8 py-0.2 rounded bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 text-[10px] font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 tabular-nums select-none">
                      {weight}x
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemWeight(item.id, 1)}
                      className="p-0.5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform"
                      title="가중치 1 증가"
                      aria-label="1 증가"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 룰렛 휠 본체 (SVG) */}
        <RouletteWheelSvg
          slices={rouletteSlices}
          rotation={rouletteRotation}
          duration={rouletteTransitionDuration}
          isSpinning={isSpinning}
          onCenterClick={() => handleSpinRoulette(false, undefined, true)}
        />

        {/* 룰렛 메인 컨트롤 버튼 바 (모바일 줄바꿈 방지 및 요소 단위 줄바꿈, 재실행 및 회전중 텍스트 제거) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-lg">
          <button
            type="button"
            onClick={() => handleSpinRoulette(false, undefined, true)}
            className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-0"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="whitespace-nowrap">룰렛 돌리기</span>
          </button>

          <button
            type="button"
            onClick={() => handleSpinRoulette(true)}
            className={`py-3 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              resolvedTheme === 'dawn'
                ? 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200'
                : isDark
                ? 'bg-[#27272a] border-[#3f3f46] text-slate-200 hover:bg-[#323238]'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="whitespace-nowrap">⚡ 즉시 결과</span>
          </button>

          {selectedRouletteWinner && (
            <button
              type="button"
              onClick={() => setIsResultModalOpen(true)}
              className="py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="whitespace-nowrap">결과 팝업 보기</span>
            </button>
          )}
        </div>

        {/* 당첨 결과 알림 카드 */}
        {selectedRouletteWinner && (
          <div
            className={`w-full max-w-md p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 ${
              resolvedTheme === 'dawn'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950'
                : isDark
                ? 'bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-700/60 text-amber-200'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold">당첨을 축하합니다!</span>
            </div>
            <div className="text-xl sm:text-2xl font-black flex items-center gap-2 tracking-tight">
              <span className="text-3xl">{selectedRouletteWinner.avatar}</span>
              <span>{selectedRouletteWinner.name}</span>
            </div>

            {/* 결과 공유 3대 액션 */}
            <div className="flex items-center gap-2 w-full pt-1">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>텍스트 복사</span>
              </button>
              <button
                type="button"
                onClick={handleCopyImageCard}
                disabled={isGeneratingCard}
                className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 font-bold text-xs shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
                title="룰렛 카드 이미지 복사"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownloadImageCard}
                disabled={isGeneratingCard}
                className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 font-bold text-xs shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
                title="룰렛 카드 이미지 파일 저장"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 도움말 모달 */}
      <RouletteHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 세부 항목 및 가중치 관리 모달 */}
      <RouletteItemSettingModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        items={rouletteItems}
        setItems={setRouletteItems}
        useWeight={useRouletteWeight}
        setUseWeight={setUseRouletteWeight}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemIcon={newItemIcon}
        setNewItemIcon={setNewItemIcon}
        onAddItem={handleAddNewItem}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
        onSelectIconTrigger={handleOpenIconPicker}
      />

      {/* 이모지 선택 모달 */}
      <RouletteIconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIcon}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 룰렛 최종 결과 전폭 팝업 모달 */}
      <RouletteResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        winner={selectedRouletteWinner}
        presetTitle={roulettePresetTitle}
        items={rouletteItems}
        onSpinAgain={() => handleSpinRoulette(false, undefined, true)}
        onInstantResult={handleInstantResultInModal}
        onCopyText={handleCopyText}
        onCopyImageCard={handleCopyImageCard}
        onDownloadImageCard={handleDownloadImageCard}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />
    </div>
  );
};
