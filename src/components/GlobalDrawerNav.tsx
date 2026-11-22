import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  Sparkles,
  Coins,
  Gamepad2,
  Settings,
  WifiOff,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  LogOut,
  Camera,
  Layers,
  ChevronRightSquare,
  HelpCircle,
  ExternalLink,
  Laptop,
  Calendar,
} from 'lucide-react';
import { MoaLogo } from './MoaLogo';

export interface GlobalDrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: string;
  onSelectScreen: (screenId: string) => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  activeLedgerName?: string;
}

interface CategoryMenu {
  id: string;
  title: string;
  badge?: string;
  screens: {
    id: string;
    code: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    badge?: string;
    isHighlight?: boolean;
  }[];
}

export const GlobalDrawerNav: React.FC<GlobalDrawerNavProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onSelectScreen,
  isLoggedIn,
  onToggleLogin,
  activeLedgerName = '우리집 가계부 (가족 공유)',
}) => {
  // 5대 카테고리 접힘/펼침 상태 (기본은 전체 펼침)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Drawer가 열려 있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const categories: CategoryMenu[] = [
    {
      id: 'finance',
      title: '핵심 금융 서비스',
      badge: 'FINANCE',
      screens: [
        {
          id: 'SCR-LED-01',
          code: 'SCR-LED-01',
          title: '가계부 관리 상세',
          desc: '카드대사, 거래내역, 통계 분석 3대 탭',
          icon: <Wallet className="w-4 h-4 text-sky-500" />,
        },
        {
          id: 'SCR-MON-01',
          code: 'SCR-MON-01',
          title: '모아머니 이동관리',
          desc: '정산 요구 머니 & 송금 요청 실시간 레이더',
          icon: <Coins className="w-4 h-4 text-amber-500" />,
        },
      ],
    },
    {
      id: 'life',
      title: '라이프 협업 서비스',
      badge: 'LIFE',
      screens: [
        {
          id: 'SCR-DAY-01',
          code: 'SCR-DAY-01',
          title: '모아데이 (MoaDay)',
          desc: '전역 일정 허브 & PWA 스마트 다이어리',
          icon: <Calendar className="w-4 h-4 text-indigo-500" />,
          badge: 'NEW',
          isHighlight: true,
        },
        {
          id: 'SCR-GAM-01',
          code: 'SCR-GAM-01',
          title: '모아게임 허브',
          desc: '1/N 정산, 사다리타기, 룰렛돌리기 3대 게임',
          icon: <Gamepad2 className="w-4 h-4 text-emerald-500" />,
        },
        {
          id: 'SCR-DUT-01',
          code: 'SCR-DUT-01',
          title: '모아당번 관리',
          desc: '일상 당번 과업 목록 및 카테고리 설정',
          icon: <Sparkles className="w-4 h-4 text-purple-500" />,
        },
        {
          id: 'SCR-GOL-01',
          code: 'SCR-GOL-01',
          title: '모아목표 관리',
          desc: '저축 및 습관 챌린지 탐색과 생성',
          icon: <ChevronRightSquare className="w-4 h-4 text-teal-500" />,
        },
      ],
    },
    {
      id: 'quick',
      title: '빠른 등록 & 입력',
      badge: 'QUICK',
      screens: [
        {
          id: 'SCR-QCK-01',
          code: 'SCR-QCK-01',
          title: '빠른 머니등록 (영수증 OCR)',
          desc: '카메라 촬영 및 AI 영수증 자동 인식',
          icon: <Camera className="w-4 h-4 text-rose-500" />,
        },
        {
          id: 'SCR-QCK-02',
          code: 'SCR-QCK-02',
          title: '빠른 수행등록 (사진인증)',
          desc: '당번 과업 완료 사진 인증 및 즉시 전송',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
        },
      ],
    },
    {
      id: 'system',
      title: '시스템 & 환경설정',
      badge: 'SYSTEM',
      screens: [
        {
          id: 'SCR-SET-01',
          code: 'SCR-SET-01',
          title: '사용자 맞춤 설정',
          desc: '대시보드 위젯배치, 알림, OCR 키, 거래계좌',
          icon: <Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />,
        },
        {
          id: 'SCR-OFF-01',
          code: 'SCR-OFF-01',
          title: '오프라인 동기화',
          desc: 'PWA IndexedDB 큐 검증 및 Stale 경고 대사',
          icon: <WifiOff className="w-4 h-4 text-amber-500" />,
        },
        {
          id: 'SCR-SYS-01',
          code: 'SCR-SYS-01',
          title: '시스템 운영관리 (BKL-SYS-01)',
          desc: '독립 백오피스 관제: DB풀, 메모리, OCR 큐',
          icon: <ShieldCheck className="w-4 h-4 text-red-500" />,
          badge: 'ADMIN',
        },
        {
          id: 'SCR-SMP-01',
          code: 'SCR-SMP-01',
          title: '토큰 규격 쇼케이스',
          desc: '14종 모아보고 공통 UI 디자인 토큰 명세',
          icon: <Layers className="w-4 h-4 text-violet-500" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* 2. Slide-out Navigation Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-full max-w-[320px] sm:max-w-[360px] bg-white dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 shadow-2xl flex flex-col border-r border-slate-200 dark:border-zinc-800 transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="서비스 전체 내비게이션 메뉴"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#131B2E]/60 shrink-0">
          <div className="flex items-center gap-2">
            <MoaLogo
              onClick={() => {
                onSelectScreen(isLoggedIn ? 'SCR-DSH-01' : 'SCR-GNT-01');
                onClose();
              }}
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-extrabold">
              전체 메뉴
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="메뉴 닫기 (ESC)"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session Profile & Mode Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isLoggedIn ? 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                {isLoggedIn ? '구본영 님 (회원 모드)' : '게스트 사용자 (비회원)'}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleLogin}
              className={`min-h-[36px] px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                isLoggedIn
                  ? 'bg-white/80 dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
                  : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              }`}
              title="클릭하여 회원 로그인 / 게스트 전환"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인</span>
                </>
              )}
            </button>
          </div>

          {/* Active Ledger context preview */}
          {isLoggedIn && (
            <div className="text-[11px] text-slate-600 dark:text-zinc-400 bg-white/60 dark:bg-[#131B2E]/60 px-2.5 py-1.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500 font-semibold">활성 장부:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[170px]">
                {activeLedgerName}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Categories List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 focus:outline-none">
          {categories.map((cat) => {
            const isCollapsed = !!collapsedCategories[cat.id];
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111726] overflow-hidden shadow-2xs"
              >
                {/* Category Header (Accordion Toggle) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-[#131B2E]/40 hover:bg-slate-100/70 dark:hover:bg-[#162035] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 tracking-tight">
                      {cat.title}
                    </span>
                    {cat.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Category Screen Items */}
                {!isCollapsed && (
                  <div className="p-1.5 space-y-1 border-t border-slate-100 dark:border-zinc-800/60">
                    {cat.screens.map((screen) => {
                      const isActive = currentScreen === screen.id;
                      return (
                        <button
                          key={screen.id}
                          type="button"
                          onClick={() => {
                            onSelectScreen(screen.id);
                            onClose();
                          }}
                          className={`w-full min-h-[44px] p-2.5 rounded-xl flex items-start gap-3 transition-all cursor-pointer text-left relative ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-zinc-800/70 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                            }`}
                          >
                            {screen.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`text-xs truncate ${
                                  isActive ? 'text-white font-extrabold' : 'font-bold'
                                }`}
                              >
                                {screen.title}
                              </span>
                              {screen.badge && (
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                                  }`}
                                >
                                  {screen.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] mt-0.5 line-clamp-1 ${
                                isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-zinc-500'
                              }`}
                            >
                              {screen.desc}
                            </p>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white absolute right-2.5 top-1/2 -translate-y-1/2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Drawer Footer: Quick Help & Version Tag */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-[#131B2E]/90 shrink-0 text-center">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 px-1">
            <span className="font-semibold">모아보고 (MoaBogo)</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">v2.2-0038</span>
          </div>
        </div>
      </aside>
    </>
  );
};
