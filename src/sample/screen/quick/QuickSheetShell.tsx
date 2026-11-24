import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { ElmBsh01 } from '../../elements/Tokens';

interface QuickSheetShellProps {
  /** 'sheet'이면 ElmBsh01 고정 3분할 바텀시트, 'standalone'이면 독립 화면 3분할 카드 */
  variant: 'sheet' | 'standalone';
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge: string;
  headerExtra?: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * SCR_QCK_01 / SCR_QCK_02 공용 고정 3분할 팝업/화면 셸
 * - sheet 모드: ElmBsh01(드래그 핸들 고정 헤더 + 단독 세로 스크롤 본문 + 고정 하단 푸터)
 * - standalone 모드: 동일 3분할 카드 레이아웃으로 드로어 단독 진입 대응
 */
export const QuickSheetShell: React.FC<QuickSheetShellProps> = ({
  variant,
  isOpen,
  onClose,
  title,
  badge,
  headerExtra,
  footer,
  children,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  if (variant === 'sheet') {
    return (
      <ElmBsh01
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        badge={badge}
        maxWidth="max-w-xl"
        footer={footer}
      >
        <div className="space-y-4">
          {headerExtra && <div className="flex items-center justify-end">{headerExtra}</div>}
          {children}
        </div>
      </ElmBsh01>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div
        className={`w-full max-w-xl mx-auto rounded-2xl border shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)] transition-colors ${
          resolvedTheme === 'dawn'
            ? 'bg-[#0d1838] border-[#1e3a6d] text-[#f0f6fc]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f6]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight whitespace-nowrap">
              {title}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 whitespace-nowrap shrink-0">
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {headerExtra}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. 단독 세로 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>

        {/* 3. 고정 하단 푸터 */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-50/60 dark:bg-zinc-900/80">
          {footer}
        </div>
      </div>
    </div>
  );
};
