import React from 'react';
import { X, Plus, Trash2, SlidersHorizontal, RotateCcw, Copy, Camera, Download, Sparkles } from 'lucide-react';
import { RouletteSliceItem, ROULETTE_ICONS } from '../types';

export interface RouletteHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const RouletteHelpModal: React.FC<RouletteHelpModalProps> = ({
  isOpen,
  onClose,
  resolvedTheme,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>🎯</span>
            <span>행운의 룰렛 이용 안내</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            • <strong>항목 즉시 수정</strong>: 룰렛 상단 칩의 텍스트나 이모지를 클릭하면 이름을 바로 바꿀 수 있습니다.
          </p>
          <p>
            • <strong>중앙 허브 버튼</strong>: 회전 중에도 룰렛 중앙의 <code>SPIN / RESTART</code> 버튼을 누르면 언제든 즉시 다시 회전합니다.
          </p>
          <p>
            • <strong>즉시 결과 (SKIP)</strong>: 결과가 급할 때는 <strong>'즉시 결과'</strong> 버튼을 눌러 회전 대기 없이 당첨 결과를 확정할 수 있습니다.
          </p>
          <p>
            • <strong>당첨자 제외 모드</strong>: 연속 추첨 시 이미 당첨된 항목을 자동으로 제외하고 다음 후보들로 룰렛을 계속 돌릴 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};

export interface RouletteItemSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RouletteSliceItem[];
  setItems: React.Dispatch<React.SetStateAction<RouletteSliceItem[]>>;
  useWeight: boolean;
  setUseWeight: React.Dispatch<React.SetStateAction<boolean>>;
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemIcon: string;
  setNewItemIcon: (icon: string) => void;
  onAddItem: () => void;
  resolvedTheme: string;
  isDark: boolean;
  onSelectIconTrigger: (itemId: string) => void;
}

export const RouletteItemSettingModal: React.FC<RouletteItemSettingModalProps> = ({
  isOpen,
  onClose,
  items,
  setItems,
  newItemName,
  setNewItemName,
  newItemIcon,
  onAddItem,
  resolvedTheme,
  isDark,
  onSelectIconTrigger,
}) => {
  if (!isOpen) return null;

  const handleUpdateItemWeight = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const nextW = Math.max(1, Math.min(10, (it.weight || 1) + delta));
        return { ...it, weight: nextW };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-md max-h-[85vh] p-5 rounded-2xl border shadow-2xl flex flex-col gap-4 overflow-hidden ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold">룰렛 항목 및 가중치 관리</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 새 항목 추가 폼 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectIconTrigger('new_item')}
            className="p-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-base shrink-0 bg-slate-50 dark:bg-zinc-800 hover:scale-105 transition-transform"
            title="새 항목 아이콘 변경"
          >
            {newItemIcon}
          </button>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddItem();
            }}
            placeholder="추가할 항목명 입력..."
            className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={onAddItem}
            disabled={!newItemName.trim() || items.length >= 20}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 disabled:opacity-40 cursor-pointer"
            title="항목 추가"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 항목 목록 스크롤 뷰 */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {items.map((it) => (
            <div
              key={it.id}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 bg-white/60 dark:bg-zinc-900/40"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectIconTrigger(it.id)}
                  className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-sm hover:scale-110 transition-transform shrink-0"
                >
                  {it.avatar}
                </button>
                <span className="text-xs font-bold truncate">{it.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdateItemWeight(it.id, -1)}
                  className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-xs font-bold font-mono px-1">{it.weight || 1}x</span>
                <button
                  type="button"
                  onClick={() => handleUpdateItemWeight(it.id, 1)}
                  className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200"
                >
                  +
                </button>
                {items.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
        >
          설정 완료
        </button>
      </div>
    </div>
  );
};

export interface RouletteIconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const RouletteIconPickerModal: React.FC<RouletteIconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  resolvedTheme,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-xs p-5 rounded-2xl border shadow-2xl space-y-3 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe] text-[#0d2746]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold">룰렛 아이콘 선택</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto no-scrollbar py-1">
          {ROULETTE_ICONS.map((icon, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectIcon(icon);
                onClose();
              }}
              className="p-2 rounded-xl text-lg hover:bg-indigo-100 dark:hover:bg-zinc-800 transition-transform hover:scale-125 cursor-pointer flex items-center justify-center"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   행운의 룰렛 최종 결과 정보 팝업 레이어 (RouletteResultModal)
   ========================================================================= */
export interface RouletteResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: RouletteSliceItem | null;
  presetTitle: string;
  items: RouletteSliceItem[];
  onSpinAgain: () => void;
  onInstantResult: () => void;
  onCopyText: () => void;
  onCopyImageCard: () => void;
  onDownloadImageCard: () => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const RouletteResultModal: React.FC<RouletteResultModalProps> = ({
  isOpen,
  onClose,
  winner,
  presetTitle,
  items,
  onSpinAgain,
  onInstantResult,
  onCopyText,
  onCopyImageCard,
  onDownloadImageCard,
  resolvedTheme,
  isDark,
}) => {
  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl flex flex-col gap-4 text-center overflow-hidden animate-in zoom-in-95 ${
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
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-lg">
              🎯
            </span>
            <div className="text-left">
              <h3 className="text-sm sm:text-base font-bold">룰렛 추첨 결과</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {presetTitle}
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

        {/* 당첨 결과 대형 하이라이트 카드 */}
        <div
          className={`py-6 px-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${
            resolvedTheme === 'dawn'
              ? 'bg-gradient-to-b from-indigo-50 to-blue-100/60 border-blue-300'
              : isDark
              ? 'bg-gradient-to-b from-indigo-950/60 to-purple-950/40 border-indigo-800'
              : 'bg-gradient-to-b from-indigo-50/80 to-purple-50/50 border-indigo-200'
          }`}
        >
          <span className="text-5xl animate-bounce">{winner.avatar}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
            🎉 최종 당첨!
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {winner.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            당첨을 축하합니다! 오늘의 주인공입니다.
          </p>
        </div>

        {/* 후보군 요약 */}
        <div className="text-left space-y-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400">전체 후보 ({items.length}개):</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-1">
            {items.map((it) => (
              <span
                key={it.id}
                className={`px-2 py-1 rounded-lg text-[11px] border flex items-center gap-1 ${
                  it.id === winner.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>{it.avatar}</span>
                <span>{it.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 액션 버튼 바 */}
        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>재실행</span>
          </button>

          <button
            type="button"
            onClick={onInstantResult}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              resolvedTheme === 'dawn'
                ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200/80'
                : isDark
                ? 'bg-amber-950/40 border-amber-800 text-amber-300 hover:bg-amber-900/60'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="모달 내에서 즉시 새로운 당첨자 재추첨"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>즉시결과</span>
          </button>

          <button
            type="button"
            onClick={onCopyText}
            className={`p-2.5 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            title="결과 카드 이미지 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
