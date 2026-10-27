import React from 'react';
import { X, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
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
