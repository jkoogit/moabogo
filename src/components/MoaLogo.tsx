import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Layers } from 'lucide-react';

export const MoaLogo: React.FC<{
  className?: string;
  showTag?: boolean;
}> = ({ className = '', showTag = true }) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Icon Badge - Theme Aware Semantic Styling */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all ${
          resolvedTheme === 'dawn'
            ? 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/25 ring-1 ring-sky-400/30'
            : resolvedTheme === 'dark'
            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm ring-1 ring-zinc-600/30'
            : 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20'
        }`}
      >
        <Layers className="w-4 h-4" />
      </div>

      {/* Typography Identity */}
      <div className="flex items-center gap-1.5">
        <span
          className={`font-black text-base tracking-tight transition-colors ${
            resolvedTheme === 'dawn'
              ? 'bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent'
              : resolvedTheme === 'dark'
              ? 'text-zinc-100 font-extrabold tracking-tight'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent font-extrabold'
          }`}
        >
          모아보고
        </span>

        {showTag && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border transition-colors ${
              resolvedTheme === 'dawn'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                : resolvedTheme === 'dark'
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
            }`}
          >
            MoaBogo
          </span>
        )}
      </div>
    </div>
  );
};
