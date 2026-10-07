import React, { useState } from 'react';
import { useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { ElmNav01, ElmOff01 } from './sample/elements/Tokens';
import { MoaLogo } from './components/MoaLogo';

// Sample Screens (All 13 screens with standard design token implementation)
import { SCR_SMP_01_공통컴포넌트쇼케이스 } from './sample/screen/SCR_SMP_01_공통컴포넌트쇼케이스';
import { SCR_GNT_01_비로그인게스트홈 } from './sample/screen/SCR_GNT_01_비로그인게스트홈';
import { SCR_AUT_01_회원가입 } from './sample/screen/SCR_AUT_01_회원가입';
import { SCR_AUT_02_로그인오프라인세션 } from './sample/screen/SCR_AUT_02_로그인오프라인세션';
import { SCR_DSH_01_로그인메인대시보드 } from './sample/screen/SCR_DSH_01_로그인메인대시보드';
import { SCR_LED_01_그룹가계부관리상세 } from './sample/screen/SCR_LED_01_그룹가계부관리상세';
import { SCR_GOL_01_모아목표상세 } from './sample/screen/SCR_GOL_01_모아목표상세';
import { SCR_DUT_01_모아당번상세 } from './sample/screen/SCR_DUT_01_모아당번상세';
import { SCR_MON_01_모아머니이동관리 } from './sample/screen/SCR_MON_01_모아머니이동관리';
import { SCR_QCK_01_빠른머니등록 } from './sample/screen/SCR_QCK_01_빠른머니등록';
import { SCR_QCK_02_빠른수행등록 } from './sample/screen/SCR_QCK_02_빠른수행등록';
import { SCR_SET_01_사용자설정 } from './sample/screen/SCR_SET_01_사용자설정';
import { SCR_OFF_01_오프라인동기화 } from './sample/screen/SCR_OFF_01_오프라인동기화';

import {
  Layers,
  Wallet,
  Sparkles,
  Coins,
  Settings,
  Gamepad2,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Camera,
  CheckCircle,
  WifiOff,
  Wifi,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
} from 'lucide-react';

export default function App() {
  const { resolvedTheme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<string>('SCR-DSH-01');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [deviceView, setDeviceView] = useState<'FULL' | 'TABLET' | 'MOBILE'>('FULL');

  // Screen Registry Definition
  const screens = [
    {
      id: 'SCR-DSH-01',
      name: '메인 대시보드 (Bento Grid)',
      category: '핵심 서비스',
      comp: <SCR_DSH_01_로그인메인대시보드 onNavigate={(id) => setCurrentScreen(id)} />,
    },
    {
      id: 'SCR-LED-01',
      name: '가계부 관리 상세 (그룹/개인)',
      category: '핵심 서비스',
      comp: <SCR_LED_01_그룹가계부관리상세 />,
    },
    {
      id: 'SCR-DUT-01',
      name: '모아당번 상세 (할당/인증/승인)',
      category: '라이프 서비스',
      comp: <SCR_DUT_01_모아당번상세 />,
    },
    {
      id: 'SCR-GOL-01',
      name: '모아목표 상세 (동행원 vs 관람원)',
      category: '라이프 서비스',
      comp: <SCR_GOL_01_모아목표상세 />,
    },
    {
      id: 'SCR-MON-01',
      name: '모아머니 이동관리 (요구/요청머니)',
      category: '라이프 서비스',
      comp: <SCR_MON_01_모아머니이동관리 />,
    },
    {
      id: 'SCR-QCK-01',
      name: '빠른 머니등록 (영수증 & OCR)',
      category: '빠른 입력',
      comp: <SCR_QCK_01_빠른머니등록 />,
    },
    {
      id: 'SCR-QCK-02',
      name: '빠른 수행등록 (사진인증 & 당번)',
      category: '빠른 입력',
      comp: <SCR_QCK_02_빠른수행등록 />,
    },
    {
      id: 'SCR-GNT-01',
      name: '비로그인 게스트 홈 (1/N & 게임)',
      category: '회원 / 게스트',
      comp: (
        <SCR_GNT_01_비로그인게스트홈
          onGoLogin={() => setCurrentScreen('SCR-AUT-02')}
          onGoSignup={() => setCurrentScreen('SCR-AUT-01')}
        />
      ),
    },
    {
      id: 'SCR-AUT-02',
      name: '로그인 & 오프라인 세션',
      category: '회원 / 게스트',
      comp: (
        <SCR_AUT_02_로그인오프라인세션
          onGoSignup={() => setCurrentScreen('SCR-AUT-01')}
          onSuccessLogin={() => setCurrentScreen('SCR-DSH-01')}
        />
      ),
    },
    {
      id: 'SCR-AUT-01',
      name: '회원가입 (3초 가입/Zero-Onboarding)',
      category: '회원 / 게스트',
      comp: (
        <SCR_AUT_01_회원가입
          onGoLogin={() => setCurrentScreen('SCR-AUT-02')}
          onSuccessSignup={() => setCurrentScreen('SCR-DSH-01')}
        />
      ),
    },
    {
      id: 'SCR-SET-01',
      name: '사용자 맞춤 설정 (테마/배치/계좌)',
      category: '시스템 관리',
      comp: <SCR_SET_01_사용자설정 />,
    },
    {
      id: 'SCR-OFF-01',
      name: '오프라인 PWA 동기화 & Stale 검증',
      category: '시스템 관리',
      comp: <SCR_OFF_01_오프라인동기화 />,
    },
    {
      id: 'SCR-SMP-01',
      name: '14종 공통 토큰 규격 쇼케이스',
      category: '디자인 표준 (docs/03)',
      comp: <SCR_SMP_01_공통컴포넌트쇼케이스 />,
    },
  ];

  const currentScreenObj = screens.find((s) => s.id === currentScreen) || screens[0];

  // Mobile Bottom Navigation Bar Items (Standard 4 items)
  const navItems = [
    { id: 'SCR-DSH-01', label: '대시보드', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'SCR-LED-01', label: '가계부', icon: <Wallet className="w-5 h-5" /> },
    { id: 'SCR-DUT-01', label: '모아당번', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'SCR-MON-01', label: '모아머니', icon: <Coins className="w-5 h-5" /> },
    { id: 'SCR-SET-01', label: '설정', icon: <Settings className="w-5 h-5" /> },
  ];

  const isDawn = resolvedTheme === 'dawn';
  const isDark = resolvedTheme === 'dark' || isDawn;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDawn
          ? 'bg-[#070d1e] text-[#f0f6fc]'
          : isDark
          ? 'bg-[#121214] text-[#f4f4f6]'
          : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* 1. Offline Indicator Banner */}
      <ElmOff01 isOffline={isOffline} pendingCount={isOffline ? 2 : 0} />

      {/* 2. Unified Header Navigation */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
          isDawn
            ? 'border-[#1e3a6d] bg-[#0a142c]/90 text-[#f0f6fc]'
            : isDark
            ? 'border-[#27272a] bg-[#141416]/90 text-[#f4f4f6]'
            : 'border-slate-200 bg-white/90 text-slate-900 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <MoaLogo />

          {/* Center: Global Screen Selector (13 Screens) */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-2">
            <div className="relative">
              <select
                value={currentScreen}
                onChange={(e) => setCurrentScreen(e.target.value)}
                className={`w-full h-8 pl-3 pr-8 text-xs font-bold rounded-lg appearance-none cursor-pointer border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.id}] {s.name} ({s.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Right: Device View Simulation, Offline Toggle & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Viewport Simulation Mode Pills (Desktop / Tablet / Mobile) */}
            <div
              className={`hidden md:flex items-center p-0.5 rounded-lg border text-xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setDeviceView('FULL')}
                className={`p-1.5 rounded transition-colors ${
                  deviceView === 'FULL'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="전체 풀화면 모드"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('TABLET')}
                className={`p-1.5 rounded transition-colors ${
                  deviceView === 'TABLET'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="태블릿 모드 (860px 뷰포트)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('MOBILE')}
                className={`p-1.5 rounded transition-colors ${
                  deviceView === 'MOBILE'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="모바일 Spacious 모드 (420px 뷰포트)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? '클릭하여 온라인으로 복귀' : '클릭하여 오프라인 PWA 시뮬레이션'}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isOffline
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            </button>

            {/* Theme Toggle Button (Light / Dark / System) */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 3. Main Screen Viewport Container */}
      <main className="flex-1 flex items-start justify-center p-0 sm:p-4 overflow-y-auto pb-20 sm:pb-8">
        <div
          className={`w-full transition-all duration-300 ${
            deviceView === 'FULL'
              ? 'max-w-7xl'
              : deviceView === 'TABLET'
              ? 'max-w-[860px] rounded-2xl shadow-xl border overflow-hidden my-4 ' +
                (isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')
              : 'max-w-[420px] rounded-3xl shadow-2xl border-2 overflow-hidden my-4 ' +
                (isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white')
          }`}
        >
          {deviceView !== 'FULL' && (
            <div
              className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span className="font-mono font-semibold">
                {deviceView === 'TABLET' ? 'Tablet View (768px~1024px)' : 'Mobile Spacious (420px)'}
              </span>
              <span className="text-[10px] text-indigo-500 font-bold">100% 수직 중앙 정렬</span>
            </div>
          )}

          {/* Active Screen Component */}
          <div className="w-full">{currentScreenObj.comp}</div>

          {/* If inside Mobile Frame Simulation (420px), show fixed footer nav inside phone screen */}
          {deviceView === 'MOBILE' && (
            <div className="sticky bottom-0 z-30 w-full">
              <ElmNav01
                activeItem={currentScreen}
                onSelect={(screenId) => setCurrentScreen(screenId)}
                items={navItems}
              />
            </div>
          )}
        </div>
      </main>

      {/* 4. Global Mobile Bottom Navigation (Visible on actual Mobile devices / FULL & TABLET viewports) */}
      {deviceView !== 'MOBILE' && (
        <ElmNav01
          activeItem={currentScreen}
          onSelect={(screenId) => setCurrentScreen(screenId)}
          items={navItems}
          className="fixed inset-x-0 bottom-0 z-40 max-w-lg mx-auto sm:hidden"
        />
      )}
    </div>
  );
}
