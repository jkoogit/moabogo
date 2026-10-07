import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Sparkles, Monitor, ChevronDown } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: Array<{
    mode: ThemeMode;
    label: string;
    subtext: string;
    icon: React.ReactNode;
    colorDot: string;
  }> = [
    {
      mode: 'light',
      label: '주간 (라이트)',
      subtext: '클린 화이트',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
      colorDot: 'bg-white border border-slate-300',
    },
    {
      mode: 'dark',
      label: '야간 (다크)',
      subtext: '딥 그레이',
      icon: <Moon className="w-3.5 h-3.5 text-zinc-300 shrink-0" />,
      colorDot: 'bg-zinc-800 border border-zinc-600',
    },
    {
      mode: 'dawn',
      label: '여명 (블루)',
      subtext: '미드나잇 청색',
      icon: <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
      colorDot: 'bg-blue-900 border border-sky-500',
    },
    {
      mode: 'system',
      label: '시스템 설정',
      subtext: '기기 OS 자동 동기화',
      icon: <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
      colorDot: 'bg-slate-500',
    },
  ];

  const currentOption = options.find((o) => o.mode === theme) || options[1];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
          resolvedTheme === 'dawn'
            ? 'bg-blue-950/80 hover:bg-blue-900 text-sky-200 border-blue-800 hover:border-blue-700'
            : resolvedTheme === 'dark'
            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
        title={`현재 테마: ${currentOption.label} (${currentOption.subtext})`}
      >
        {currentOption.icon}
        <span className="hidden sm:inline font-medium">{currentOption.label.split(' ')[0]}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-1.5 w-44 rounded-xl border shadow-2xl z-50 py-1 text-xs transition-all animate-in fade-in slide-in-from-top-1 ${
            resolvedTheme === 'dawn'
              ? 'bg-slate-900 border-blue-900 text-slate-200 divide-y divide-blue-950/80'
              : resolvedTheme === 'dark'
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200 divide-y divide-zinc-800'
              : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50 divide-y divide-slate-100'
          }`}
        >
          <div className="py-1">
            {options.map((opt) => {
              const active = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => {
                    setTheme(opt.mode);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                    active
                      ? resolvedTheme === 'dawn'
                        ? 'bg-blue-900/40 text-sky-300 font-bold'
                        : resolvedTheme === 'dark'
                        ? 'bg-zinc-800 text-zinc-100 font-bold'
                        : 'bg-indigo-50 text-indigo-700 font-bold'
                      : resolvedTheme === 'dawn'
                      ? 'hover:bg-blue-950 text-slate-300'
                      : resolvedTheme === 'dark'
                      ? 'hover:bg-zinc-800 text-zinc-300'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.colorDot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{opt.label}</span>
                      </div>
                      <span className="text-[10px] opacity-70 block truncate">{opt.subtext}</span>
                    </div>
                  </div>
                  {active && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        resolvedTheme === 'dawn'
                          ? 'bg-sky-400'
                          : resolvedTheme === 'dark'
                          ? 'bg-zinc-300'
                          : 'bg-indigo-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
