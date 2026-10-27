import React, { useState, useEffect } from 'react';
import { Palette, X, Book } from 'lucide-react';
import { ElmInp01, ElmSel01 } from '../../../sample/elements/Tokens';

export type LedgerDesignStyle = 'LEATHER' | 'HARDCOVER' | 'KRAFT' | 'FABRIC' | 'SLATE' | 'VINTAGE_BURGUNDY';

export const COVER_COLOR_PRESETS = [
  { name: '클래식 블루', color: '#3a7bbd' },
  { name: '포레스트 그린', color: '#5f8430' },
  { name: '어텀 앰버', color: '#e5a622' },
  { name: '브릭 레드', color: '#b73c26' },
  { name: '로열 버건디', color: '#9e242f' },
  { name: '슬레이트 차콜', color: '#475569' },
  { name: '바이올렛 퍼플', color: '#7c3aed' },
  { name: '피치 코랄', color: '#f97316' },
];

export function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * (percent / 100))));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export interface LedgerEditCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialDesignStyle: LedgerDesignStyle;
  initialColor: string;
  onSave: (data: { title: string; designStyle: LedgerDesignStyle; color: string }) => void;
}

export const LedgerEditCoverModal: React.FC<LedgerEditCoverModalProps> = ({
  isOpen,
  onClose,
  initialTitle,
  initialDesignStyle,
  initialColor,
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [designStyle, setDesignStyle] = useState<LedgerDesignStyle>(initialDesignStyle);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDesignStyle(initialDesignStyle);
      setColor(initialColor);
    }
  }, [isOpen, initialTitle, initialDesignStyle, initialColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, designStyle, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              북커버 디자인 및 색상 변경
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 실시간 북커버 미니 프리뷰 */}
        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400">
            실시간 북커버 미리보기
          </span>
          <div
            className="w-52 h-14 rounded-xl shadow-md border-2 flex items-center justify-between px-3 text-white font-extrabold text-xs transition-all"
            style={{
              backgroundColor: color,
              borderColor: adjustBrightness(color, -25),
              boxShadow: `0 4px 14px ${color}40`,
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Book className="w-4 h-4 shrink-0 text-white" />
              <span className="truncate">{title || '장부 타이틀'}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/25 shrink-0">
              {designStyle}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <ElmInp01
            label="장부 타이틀"
            value={title}
            onChange={setTitle}
            placeholder="장부 이름을 입력하세요"
          />

          <ElmSel01
            label="북커버 질감 및 디자인 스타일"
            value={designStyle}
            onChange={(v) => setDesignStyle(v as LedgerDesignStyle)}
            options={[
              { value: 'LEATHER', label: '🌿 에메랄드 가죽 질감' },
              { value: 'HARDCOVER', label: '📘 클래식 하드커버 양장' },
              { value: 'KRAFT', label: '📙 따뜻한 크라프트지' },
              { value: 'FABRIC', label: '🔮 바이올렛 패브릭' },
              { value: 'SLATE', label: '⚙️ 슬레이트 차콜 바인더' },
              { value: 'VINTAGE_BURGUNDY', label: '🍷 빈티지 버건디 양장' },
            ]}
          />

          {/* 색상 선택 영역: 프리셋 칩 + 컬러 피커 */}
          <div className="space-y-2">
            <label className="font-bold text-stone-700 dark:text-zinc-300 block">
              북커버 시그니처 색상 지정
            </label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLOR_PRESETS.map((p) => {
                const isSelected = color === p.color;
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setColor(p.color)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white dark:bg-zinc-800 shadow-xs font-black scale-102'
                        : 'border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 hover:bg-stone-100'
                    }`}
                    title={p.name}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 직접 색상 선택 (Color Picker) */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  title="원하는 색상 직접 선택"
                />
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-zinc-300">
                  {color.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                * 팔레트 또는 컬러 피커로 원하는 색상을 지정할 수 있습니다.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              북커버 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
