import React from 'react';
import { Ledger, User } from '../types';
import {
  Wallet,
  Users,
  Search,
  Wifi,
  WifiOff,
  ChevronDown,
  Layers,
  KeyRound,
  Plus,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  ledgers: Ledger[];
  activeLedger: Ledger | null;
  onSelectLedger: (ledger: Ledger) => void;
  currentUser: User | null;
  isOffline: boolean;
  onToggleOffline: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenCommand: () => void;
  onOpenNewTx: () => void;
  onOpenOCR: () => void;
  onOpenSettings: () => void;
  onOpenNewLedger: () => void;
  onOpenSampleGallery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ledgers,
  activeLedger,
  onSelectLedger,
  currentUser,
  isOffline,
  onToggleOffline,
  isDarkMode,
  onToggleTheme,
  onOpenCommand,
  onOpenNewTx,
  onOpenOCR,
  onOpenSettings,
  onOpenNewLedger,
  onOpenSampleGallery,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-800 bg-slate-900/90 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Ledger Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  모아보고
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MoaBogo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                스마트 가계부 & 모임 생활 지원
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Ledger Organization Switcher (LETO Style) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all bg-slate-800/80 border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white"
            >
              {activeLedger?.ledger_type === 'PERSONAL' ? (
                <Wallet className="w-4 h-4 text-emerald-400" />
              ) : (
                <Users className="w-4 h-4 text-blue-400" />
              )}
              <span className="max-w-[140px] truncate text-left">
                {activeLedger?.ledger_name || '가계부 선택'}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
                {activeLedger?.is_instance ? '인스턴스' : activeLedger?.ledger_type === 'PERSONAL' ? '개인' : '그룹'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-2xl border z-50 p-2 bg-slate-800 border-slate-700 text-slate-200">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    내 가계부 목록 (RBAC 분리)
                  </div>
                  <div className="mt-1 space-y-1">
                    {ledgers.map((ledger) => (
                      <button
                        key={ledger.ledger_id}
                        onClick={() => {
                          onSelectLedger(ledger);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          activeLedger?.ledger_id === ledger.ledger_id
                            ? 'bg-blue-600 text-white font-medium'
                            : 'hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {ledger.ledger_type === 'PERSONAL' ? (
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span className="truncate">{ledger.ledger_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-slate-300">
                            {ledger.role || 'OWNER'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/80">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenNewLedger();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 rounded hover:bg-slate-700/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> 새 그룹/인스턴스 가계부 생성
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 text-xs transition-all w-64 justify-between"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>빠른 검색 & 명령 실행...</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Design Policy Sample Gallery Switcher Button */}
          {onOpenSampleGallery && (
            <button
              onClick={onOpenSampleGallery}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40 transition-all shadow-xs"
              title="docs/03.디자인 정책 샘플 화면 갤러리 열기"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">디자인 정책 샘플 (14종)</span>
            </button>
          )}

          {/* Offline Toggle Simulator (PWA requirement) */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? '현재 오프라인 모드 (클릭하여 온라인 전환)' : '현재 온라인 모드 (클릭하여 오프라인 시뮬레이션)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">오프라인 PWA</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">온라인</span>
              </>
            )}
          </button>

          {/* Quick OCR Scanner */}
          <button
            onClick={onOpenOCR}
            disabled={isOffline}
            title={isOffline ? '오프라인 상태에서는 OCR 업로드가 차단됩니다' : '영수증 2단계 OCR'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isOffline
                ? 'opacity-40 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-600/20'
            }`}
          >
            <span className="text-xs">📸</span>
            <span className="hidden sm:inline">영수증 OCR</span>
          </button>

          {/* Quick Transaction Entry */}
          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">내역 입력</span>
          </button>

          {/* Theme Selector (주간 / 야간 / 시스템) */}
          <ThemeToggle />

          {/* OCR Key & Settings */}
          <button
            onClick={onOpenSettings}
            title="사용자 2차 OCR Key 및 설정"
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
