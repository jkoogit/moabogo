import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ElmRng01, ElmSld03, ElmToast01 } from '../elements/Tokens';
import {
  Gamepad2,
  Wallet,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  Coins,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  Share2,
  Lock,
  Calendar,
} from 'lucide-react';
import {
  Participant,
  PRESET_CHARACTERS,
  RouletteSliceItem,
  SettlementGameZone,
  calculateSettlementSummary,
  RouletteGameZone,
  DEFAULT_FIVE_ITEMS_PRESET,
  LadderGameZone,
  LadderGoal,
  generateDefaultLadderGoals,
  SharedGameHistoryItem,
  loadTodaySharedGameHistory,
} from '../../components/game';
import { LadderResultModal } from '../../components/game/ladder/LadderModals';
import { RouletteResultModal } from '../../components/game/roulette/RouletteModals';
import { formatLadderResultText, formatStoreOrderText } from '../../components/game/ladder/ladderEngine';
import { formatRouletteResultText } from '../../components/game/roulette/rouletteEngine';
import { StorePreset } from '../data/systemStorePool';

interface GameZoneErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GameZoneErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  GameZoneErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): GameZoneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GameZoneErrorBoundary] Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-center space-y-3 my-4">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
            화면 표시 중 일시적인 오류가 발생했습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            화면 다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SCR_GNT_01_비로그인게스트홈: React.FC<{
  onGoLogin?: () => void;
  onGoSignup?: () => void;
  onGoSettings?: () => void;
}> = ({ onGoLogin, onGoSignup }) => {
  // 1. 테마 훅 (라이트, 다크, 여명 블루 식별)
  const { resolvedTheme, isDark } = useTheme();

  // 게임 탭 선택 상태 ('SPLIT' | 'LADDER' | 'ROULETTE') - URL에 room/game 파라미터 인입 시 사다리/룰렛탭 자동 전환
  const [gameType, setGameType] = useState<'SPLIT' | 'LADDER' | 'ROULETTE'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const gameParam = p.get('game')?.toUpperCase();
      if (gameParam === 'ROULETTE' || gameParam === 'ROU') return 'ROULETTE';
      if (gameParam === 'LADDER' || gameParam === 'LAD') return 'LADDER';
      const roomParam = p.get('room');
      if (roomParam) {
        if (roomParam.startsWith('ROU')) return 'ROULETTE';
        return 'LADDER';
      }
    }
    return 'SPLIT';
  });

  // 클라이언트 탭/점유자 고유 식별자
  const [currentTabId] = useState<string>(() => 'tab_' + Math.random().toString(36).slice(2, 9));

  // 초대 링크를 통해 접속한 게스트 참여자 여부 식별 (동적 상태: 방 종료/이탈 시 개인 모드로 즉시 해제)
  // 🔑 [보안] sessionStorage의 hostToken 유무를 기반으로 참가자(게스트) 여부 판정
  const [isGuestInRoom, setIsGuestInRoom] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const r = new URLSearchParams(window.location.search).get('room');
    if (!r) return false;
    const token = window.sessionStorage.getItem(`moabogo_host_token_${r}`);
    return !token;
  });

  const handleRoomModeChange = useCallback((inRoom: boolean, isHost: boolean) => {
    setIsGuestInRoom(inRoom && !isHost);
  }, []);

  // 🔑 [사다리·룰렛 통합 방 공유] 탭 전환 시 URL의 room 파라미터 보존 및 게임 파라미터 동기화
  const handleSwitchGameTab = (nextType: 'SPLIT' | 'LADDER' | 'ROULETTE') => {
    if (isGuestInRoom) {
      showToast('초대자(방장)만 게임 탭을 변경할 수 있습니다.', 'info');
      return;
    }
    setGameType(nextType);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('game', nextType);
      window.history.replaceState({}, '', url.toString());
    }
    // 방장인 경우 현재 열려있는 채널을 통해 모든 참여자 탭 동기화 브로드캐스트
    if (!isGuestInRoom) {
      if (gameType === 'LADDER' && ladderBroadcastTabRef.current) {
        ladderBroadcastTabRef.current(nextType);
      } else if (gameType === 'ROULETTE' && rouletteBroadcastTabRef.current) {
        rouletteBroadcastTabRef.current(nextType);
      }
    }
  };

  // 하단 플로팅 토스트/스낵바 상태 (ElmToast01 연동, useCallback 고정으로 SSE 채널 재연결 방지)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  }, []);

  // ---------------------------------------------------------------------------
  // 0. 당일 공유 게임 결과 이력 상태 및 자동 갱신 리스너 (LocalStorage SSOT)
  // ---------------------------------------------------------------------------
  const [todayHistory, setTodayHistory] = useState<SharedGameHistoryItem[]>(() =>
    loadTodaySharedGameHistory()
  );
  const [isHistoryAccordionOpen, setIsHistoryAccordionOpen] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SharedGameHistoryItem | null>(null);

  useEffect(() => {
    const refreshHistory = () => {
      const next = loadTodaySharedGameHistory();
      setTodayHistory((prev) => {
        if (
          prev.length === next.length &&
          prev.every((item, idx) => item.id === next[idx]?.id && item.closedAt === next[idx]?.closedAt)
        ) {
          return prev;
        }
        return next;
      });
    };
    window.addEventListener('storage', refreshHistory);
    window.addEventListener('focus', refreshHistory);
    const interval = setInterval(refreshHistory, 2500);
    return () => {
      window.removeEventListener('storage', refreshHistory);
      window.removeEventListener('focus', refreshHistory);
      clearInterval(interval);
    };
  }, []);

  // 상단 헤더 '공유링크 생성' / '참여종료' / '게임 탭 브로드캐스트' 핸들러 레지스트리
  const ladderShareHandlerRef = useRef<(() => void) | null>(null);
  const rouletteShareHandlerRef = useRef<(() => void) | null>(null);
  const ladderLeaveHandlerRef = useRef<(() => void) | null>(null);
  const rouletteLeaveHandlerRef = useRef<(() => void) | null>(null);
  const ladderBroadcastTabRef = useRef<((tab: 'SPLIT' | 'LADDER' | 'ROULETTE') => void) | null>(null);
  const rouletteBroadcastTabRef = useRef<((tab: 'SPLIT' | 'LADDER' | 'ROULETTE') => void) | null>(null);

  const registerLadderShareHandler = useCallback((fn: () => void) => {
    ladderShareHandlerRef.current = fn;
  }, []);
  const registerRouletteShareHandler = useCallback((fn: () => void) => {
    rouletteShareHandlerRef.current = fn;
  }, []);
  const registerLadderLeaveHandler = useCallback((fn: () => void) => {
    ladderLeaveHandlerRef.current = fn;
  }, []);
  const registerRouletteLeaveHandler = useCallback((fn: () => void) => {
    rouletteLeaveHandlerRef.current = fn;
  }, []);
  const registerLadderBroadcastTab = useCallback((fn: (tab: 'SPLIT' | 'LADDER' | 'ROULETTE') => void) => {
    ladderBroadcastTabRef.current = fn;
  }, []);
  const registerRouletteBroadcastTab = useCallback((fn: (tab: 'SPLIT' | 'LADDER' | 'ROULETTE') => void) => {
    rouletteBroadcastTabRef.current = fn;
  }, []);

  const handleRemoteNavigateTab = useCallback((targetTab: 'SPLIT' | 'LADDER' | 'ROULETTE') => {
    setGameType(targetTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('game', targetTab);
      window.history.replaceState({}, '', url.toString());
    }
    showToast(`방장이 ${targetTab === 'ROULETTE' ? '🎯 룰렛' : targetTab === 'LADDER' ? '🪜 사다리' : '정산'} 화면으로 이동하여 화면이 동기화되었습니다.`, 'info');
  }, [showToast]);

  const handleTopShareClick = () => {
    if (gameType === 'LADDER') {
      if (ladderShareHandlerRef.current) {
        ladderShareHandlerRef.current();
      } else {
        showToast('사다리 공유 준비 중입니다.', 'info');
      }
    } else if (gameType === 'ROULETTE') {
      if (rouletteShareHandlerRef.current) {
        rouletteShareHandlerRef.current();
      } else {
        showToast('룰렛 공유 준비 중입니다.', 'info');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 1. 공통 참가자 상태 관리 (2 ~ 12명 기본, 5명씩 확장 가능)
  // ---------------------------------------------------------------------------
  const [maxMemberLimit, setMaxMemberLimit] = useState<number>(12);
  const [memberCount, setMemberCount] = useState<number>(6);
  const [members, setMembers] = useState<Participant[]>(() =>
    Array.from({ length: 6 }).map((_, i) => {
      const preset = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
      return {
        id: `m_${i + 1}`,
        name: `참가자${i + 1}`,
        avatar: preset.avatar,
        color: preset.color,
        bgLight: preset.bgLight,
        weight: 1,
        isSent: false,
      };
    })
  );

  const handleUpdateMemberCount = (count: number) => {
    setMemberCount(count);
    setMembers((prev) => {
      const diff = count - prev.length;
      if (diff === 0) return prev;
      if (diff > 0) {
        const added = Array.from({ length: diff }, (_, i) => {
          const idx = prev.length + i + 1;
          const preset = PRESET_CHARACTERS[(idx - 1) % PRESET_CHARACTERS.length];
          return {
            id: `m_${idx}`,
            name: `참가자${idx}`,
            avatar: preset.avatar,
            color: preset.color,
            bgLight: preset.bgLight,
            weight: 1,
            isSent: false,
          };
        });
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  // 🔑 [항목 2-a: 원격 동기화 시 상위 인원수 슬라이더 값 연동]
  useEffect(() => {
    if (members.length !== memberCount) {
      setMemberCount(members.length);
    }
  }, [members.length, memberCount]);

  // ---------------------------------------------------------------------------
  // 2. [정산] 상태 및 핸들러
  // ---------------------------------------------------------------------------
  const [amount, setAmount] = useState<string>('');
  const [useSplitWeight, setUseSplitWeight] = useState<boolean>(false);

  const updateSplitMemberWeight = (id: string, delta: number, isAbsolute = false) => {
    const total = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    if (total === 0) {
      showToast('정산 금액을 먼저 입력해 주세요.', 'warning');
      return;
    }
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentW = m.weight !== undefined ? m.weight : 1;
        const target = isAbsolute ? delta : Math.round((currentW + delta) * 10) / 10;
        return { ...m, weight: Math.max(0, Math.min(10, target)) };
      })
    );
  };

  const toggleSentStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSent: !m.isSent } : m))
    );
  };

  const handleAdjustAmount = (delta: number) => {
    const cur = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    const next = Math.max(0, cur + delta);
    setAmount(next > 0 ? next.toString() : '');
    if (next === 0) {
      // 금액이 0원이 되면 가중치도 1.0x로 초기화하여 일관성 유지
      setMembers((prev) => prev.map((m) => ({ ...m, weight: 1 })));
    }
  };

  const settlementSummary = useMemo(() => {
    return calculateSettlementSummary(amount, members, useSplitWeight);
  }, [amount, members, useSplitWeight]);

  // ---------------------------------------------------------------------------
  // 3. [사다리타기] 상태 및 핸들러
  // ---------------------------------------------------------------------------
  const [selectedStore, setSelectedStore] = useState<StorePreset | null>(null);
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [ladderGoals, setLadderGoals] = useState<LadderGoal[]>(() =>
    generateDefaultLadderGoals(6, 1)
  );

  // ---------------------------------------------------------------------------
  // 4. [룰렛] 상태 및 핸들러
  // ---------------------------------------------------------------------------
  const [roulettePresetTitle, setRoulettePresetTitle] = useState<string>(
    DEFAULT_FIVE_ITEMS_PRESET.title
  );
  const [rouletteItems, setRouletteItems] = useState<RouletteSliceItem[]>(() =>
    DEFAULT_FIVE_ITEMS_PRESET.items.map((it: { id: string; name: string; icon?: string }) => ({
      id: it.id,
      name: it.name,
      avatar: it.icon || '🎯',
      weight: 1,
    }))
  );
  const [selectedRouletteWinner, setSelectedRouletteWinner] = useState<RouletteSliceItem | null>(null);
  const [useRouletteWeight, setUseRouletteWeight] = useState<boolean>(false);
  const [excludeWinnerMode, setExcludeWinnerMode] = useState<boolean>(false);
  const [excludedWinners, setExcludedWinners] = useState<Participant[]>([]);
  const [excludedRouletteItems, setExcludedRouletteItems] = useState<RouletteSliceItem[]>([]);

  // ---------------------------------------------------------------------------
  // 5. 게임별 초기화 핸들러
  // ---------------------------------------------------------------------------
  const handleResetSplitGame = () => {
    setAmount('');
    setMemberCount(6);
    setUseSplitWeight(false);
    setMembers(
      Array.from({ length: 6 }).map((_, i) => {
        const preset = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
        return {
          id: `m_${i + 1}`,
          name: `참가자${i + 1}`,
          avatar: preset.avatar,
          color: preset.color,
          bgLight: preset.bgLight,
          weight: 1,
          isSent: false,
        };
      })
    );
    showToast('정산 게임이 초기화되었습니다.');
  };

  const handleResetLadderGame = () => {
    setWinnerCount(1);
    setSelectedStore(null);
    setLadderGoals(generateDefaultLadderGoals(members.length, 1));
    setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined, weight: 1 })));
    showToast('사다리 게임이 초기화되었습니다.');
  };

  const handleResetRouletteGame = () => {
    setRoulettePresetTitle(DEFAULT_FIVE_ITEMS_PRESET.title);
    setRouletteItems(
      DEFAULT_FIVE_ITEMS_PRESET.items.map((it: { id: string; name: string; icon?: string }) => ({
        id: it.id,
        name: it.name,
        avatar: it.icon || '🎯',
        weight: 1,
      }))
    );
    setSelectedRouletteWinner(null);
    setExcludedRouletteItems([]);
    setExcludedWinners([]);
    showToast('룰렛 게임이 초기화되었습니다.');
  };

  // 테마별 배경/텍스트 클래스 매핑
  const containerThemeClass =
    resolvedTheme === 'dawn'
      ? 'bg-[#e4effc] text-[#0d2746]'
      : isDark
      ? 'bg-[#121214] text-[#f4f4f5]'
      : 'bg-slate-50 text-slate-900';

  const cardThemeClass =
    resolvedTheme === 'dawn'
      ? 'bg-[#f0f7ff] border-[#aed2f8] shadow-sm'
      : isDark
      ? 'bg-[#1a1a1e] border-[#27272a]'
      : 'bg-white border-slate-200';

  const groupThemeClass =
    resolvedTheme === 'dawn'
      ? 'border-[#9bc4f5] bg-[#deecfb]'
      : isDark
      ? 'border-indigo-900/60 bg-[#151518]/80'
      : 'border-indigo-200/90 bg-slate-50/50';

  return (
    <div
      className={`w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 min-h-screen transition-colors ${containerThemeClass}`}
    >
      {/* ---------------------------------------------------------------------
          Top Hero Header
          --------------------------------------------------------------------- */}
      <header
        className={`p-4 sm:p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all ${
          resolvedTheme === 'dawn'
            ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 border-blue-400/40 shadow-blue-500/10'
            : 'bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 border-slate-800'
        }`}
      >
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center flex-wrap gap-2">
            <span>
              모아서 분석하고 한눈에 보고!{' '}
              <span className={resolvedTheme === 'dawn' ? 'text-sky-200' : 'text-indigo-400'}>
                모아보고
              </span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                resolvedTheme === 'dawn'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
              }`}
            >
              SCR-GNT-01
            </span>
          </h1>
          <p className="text-xs sm:text-sm max-w-xl text-slate-200">
            가입 없이도 인원정산과 모임 게임을 즉시 즐기세요. 로그인 시 1인 다중 장부와 당번·목표·용돈 라이프 서비스를 연동할 수 있습니다.
          </p>
        </div>

        {/* Action CTAs: 로그인 & 무료 회원가입 */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoLogin}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-xs cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>로그인</span>
          </button>
          <button
            type="button"
            onClick={onGoSignup}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all cursor-pointer ${
              resolvedTheme === 'dawn'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>회원가입</span>
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          Main Interactive Section
          --------------------------------------------------------------------- */}
      <section className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-6 transition-colors ${cardThemeClass}`}>
        {/* Game Mode Selector - 고주목도 세그먼트 탭 */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3 ${
            resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl shrink-0 ${
                resolvedTheme === 'dawn'
                  ? 'bg-blue-100 text-blue-700'
                  : isDark
                  ? 'bg-indigo-950/60 text-indigo-400'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">즐겨보고</h2>
              <p
                className={`text-xs mt-0.5 ${
                  resolvedTheme === 'dawn' ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                원하는 게임 탭을 선택하고 인원수와 옵션을 설정해 보세요.
              </p>
            </div>
          </div>

          {/* 고주목도 세그먼트 탭 */}
          <div
            className={`grid grid-cols-3 sm:inline-flex items-center p-1 sm:p-1.5 rounded-2xl border shadow-inner w-full sm:w-auto shrink-0 gap-1 sm:gap-1.5 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#d5e7f9] border-[#aed2f8]'
                : isDark
                ? 'bg-[#151518] border-[#27272a]'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              disabled={isGuestInRoom}
              onClick={() => handleSwitchGameTab('SPLIT')}
              title={isGuestInRoom ? '초대자(방장)만 게임 탭을 변경할 수 있습니다' : '더치페이 탭으로 이동'}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap min-w-0 ${
                isGuestInRoom ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              } ${
                gameType === 'SPLIT'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold'
              }`}
            >
              <span className="shrink-0 text-sm">⚡</span>
              <span className="whitespace-nowrap font-bold">정산</span>
              {isGuestInRoom && gameType !== 'SPLIT' && (
                <Lock className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
              )}
            </button>
            <button
              type="button"
              disabled={isGuestInRoom}
              onClick={() => handleSwitchGameTab('LADDER')}
              title={isGuestInRoom ? '초대자(방장)만 게임 탭을 변경할 수 있습니다' : '사다리 게임 탭으로 이동'}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap min-w-0 ${
                isGuestInRoom ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              } ${
                gameType === 'LADDER'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold'
              }`}
            >
              <span className="shrink-0 text-sm">🪜</span>
              <span className="whitespace-nowrap font-bold">사다리</span>
              {isGuestInRoom && gameType !== 'LADDER' && (
                <Lock className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
              )}
            </button>
            <button
              type="button"
              disabled={isGuestInRoom}
              onClick={() => handleSwitchGameTab('ROULETTE')}
              title={isGuestInRoom ? '초대자(방장)만 게임 탭을 변경할 수 있습니다' : '룰렛 게임 탭으로 이동'}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap min-w-0 ${
                isGuestInRoom ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              } ${
                gameType === 'ROULETTE'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold'
              }`}
            >
              <span className="shrink-0 text-sm">🎯</span>
              <span className="whitespace-nowrap font-bold">룰렛</span>
              {isGuestInRoom && gameType !== 'ROULETTE' && (
                <Lock className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* 2. 게임영역 그룹 컨테이너 (고유 테두리 & 타이틀 글꼴 공식 규격) */}
        <div className={`rounded-2xl border-2 p-4 sm:p-6 shadow-xs space-y-6 relative transition-colors ${groupThemeClass}`}>
          <div
            className={`flex items-center justify-between border-b pb-3.5 ${
              resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-indigo-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl">
                {gameType === 'SPLIT' && '⚡'}
                {gameType === 'LADDER' && '🪜'}
                {gameType === 'ROULETTE' && '🎯'}
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight leading-none flex items-center gap-2">
                <span>
                  {gameType === 'SPLIT' && '정산 플레이 존'}
                  {gameType === 'LADDER' && '사다리 플레이 존'}
                  {gameType === 'ROULETTE' && '룰렛 플레이 존'}
                </span>
                <button
                  type="button"
                  onClick={
                    gameType === 'SPLIT'
                      ? handleResetSplitGame
                      : gameType === 'LADDER'
                      ? handleResetLadderGame
                      : handleResetRouletteGame
                  }
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                  title={`${
                    gameType === 'SPLIT' ? '정산' : gameType === 'LADDER' ? '사다리' : '룰렛'
                  } 게임 초기화`}
                  aria-label="게임 초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {/* 🔑 [요구사항 1: 링크 참가자 모드 [참여종료] 버튼 및 ? 안내 레이어 팝업] */}
                {isGuestInRoom && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (gameType === 'LADDER' && ladderLeaveHandlerRef.current) {
                          ladderLeaveHandlerRef.current();
                          return;
                        }
                        if (gameType === 'ROULETTE' && rouletteLeaveHandlerRef.current) {
                          rouletteLeaveHandlerRef.current();
                          return;
                        }
                        setIsGuestInRoom(false);
                        const url = new URL(window.location.href);
                        url.searchParams.delete('room');
                        url.searchParams.delete('host');
                        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
                      }}
                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      title="실시간 방 공유를 종료하고 현재 설정된 데이터로 로컬 게임을 이어갑니다"
                    >
                      참여종료
                    </button>
                    <div className="relative group">
                      <button
                        type="button"
                        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-600 cursor-help"
                        aria-label="참여종료 안내"
                      >
                        ?
                      </button>
                      <div className="hidden group-hover:block absolute left-0 top-full mt-1.5 w-64 p-2.5 rounded-xl bg-slate-900/95 dark:bg-zinc-800/95 text-white text-[11px] leading-relaxed shadow-xl z-50 pointer-events-none backdrop-blur-xs">
                        현재 실시간 방 공유에 참여 중입니다. <strong className="text-amber-300">[참여종료]</strong>를 누르면 실시간 동기화가 해제되고 혼자서 자유롭게 게임을 이어갈 수 있습니다.
                      </div>
                    </div>
                  </div>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {(gameType === 'LADDER' || gameType === 'ROULETTE') && (
                <button
                  type="button"
                  disabled={isGuestInRoom}
                  onClick={handleTopShareClick}
                  className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-2xs ${
                    isGuestInRoom
                      ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-400'
                      : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-indigo-200/80 dark:border-indigo-800 cursor-pointer active:scale-95'
                  }`}
                  title={isGuestInRoom ? '참가자 모드에서는 공유 링크를 생성할 수 없습니다 (방장 전용)' : '실시간 방 공유 / QR 코드 열기'}
                  aria-label="실시간 방 공유"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs font-semibold text-slate-400">
                설정 항목: {gameType === 'ROULETTE' ? `${rouletteItems.length}개` : `${memberCount}명`}
              </span>
            </div>
          </div>

          {/* 공통 참여 인원 슬라이더 (정산/사다리 시 공유) */}
          {gameType !== 'ROULETTE' && (
            <div className="w-full">
              <ElmRng01
                label={isGuestInRoom ? "참여 인원수 (방장 제어 · 읽기 전용)" : "참여 인원수"}
                value={memberCount}
                min={2}
                max={maxMemberLimit}
                step={1}
                unit="명"
                disabled={isGuestInRoom}
                onChange={(val) => {
                  if (isGuestInRoom) return;
                  handleUpdateMemberCount(val);
                }}
                onAddThreshold={isGuestInRoom ? undefined : () => {
                  setMaxMemberLimit((prev) => {
                    const nextLimit = prev + 5;
                    showToast(`최대 참여 인원이 5명 추가되었습니다. (최대 ${nextLimit}명)`);
                    return nextLimit;
                  });
                }}
                colorScheme="indigo"
              />
            </div>
          )}

          <GameZoneErrorBoundary onReset={() => setGameType('LADDER')}>
            {/* -----------------------------------------------------------------
                1. 인원정산 독립 게임 모듈
                ----------------------------------------------------------------- */}
            {gameType === 'SPLIT' && (
              <SettlementGameZone
                members={members}
                setMembers={setMembers}
                amount={amount}
                setAmount={setAmount}
                useSplitWeight={useSplitWeight}
                setUseSplitWeight={setUseSplitWeight}
                settlementSummary={settlementSummary}
                updateSplitMemberWeight={updateSplitMemberWeight}
                toggleSentStatus={toggleSentStatus}
                handleAdjustAmount={handleAdjustAmount}
                showToast={showToast}
                resolvedTheme={resolvedTheme}
                isDark={isDark}
              />
            )}

            {/* -----------------------------------------------------------------
                2. 사다리타기 독립 게임 모듈
                ----------------------------------------------------------------- */}
            {gameType === 'LADDER' && (
              <LadderGameZone
                members={members}
                setMembers={setMembers}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                winnerCount={winnerCount}
                setWinnerCount={setWinnerCount}
                ladderGoals={ladderGoals}
                setLadderGoals={setLadderGoals}
                currentTabId={currentTabId}
                showToast={showToast}
                resolvedTheme={resolvedTheme}
                isDark={isDark}
                onRegisterShareHandler={registerLadderShareHandler}
                onRegisterLeaveHandler={registerLadderLeaveHandler}
                onRoomModeChange={handleRoomModeChange}
                onNavigateGameTab={handleRemoteNavigateTab}
                onRegisterBroadcastTab={registerLadderBroadcastTab}
              />
            )}

            {/* -----------------------------------------------------------------
                3. 룰렛 독립 게임 모듈
                ----------------------------------------------------------------- */}
            {gameType === 'ROULETTE' && (
              <RouletteGameZone
                members={members}
                roulettePresetTitle={roulettePresetTitle}
                setRoulettePresetTitle={setRoulettePresetTitle}
                rouletteItems={rouletteItems}
                setRouletteItems={setRouletteItems}
                selectedRouletteWinner={selectedRouletteWinner}
                setSelectedRouletteWinner={setSelectedRouletteWinner}
                useRouletteWeight={useRouletteWeight}
                setUseRouletteWeight={setUseRouletteWeight}
                excludeWinnerMode={excludeWinnerMode}
                setExcludeWinnerMode={setExcludeWinnerMode}
                excludedWinners={excludedWinners}
                setExcludedWinners={setExcludedWinners}
                excludedRouletteItems={excludedRouletteItems}
                setExcludedRouletteItems={setExcludedRouletteItems}
                currentTabId={currentTabId}
                showToast={showToast}
                resolvedTheme={resolvedTheme}
                isDark={isDark}
                onRegisterShareHandler={registerRouletteShareHandler}
                onRegisterLeaveHandler={registerRouletteLeaveHandler}
                onRoomModeChange={handleRoomModeChange}
                onNavigateGameTab={handleRemoteNavigateTab}
                onRegisterBroadcastTab={registerRouletteBroadcastTab}
              />
            )}
          </GameZoneErrorBoundary>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          3. 당일 공유 게임 결과 이력 (이력이 1건 이상 존재할 때만 토글 영역 노출)
          --------------------------------------------------------------------- */}
      {todayHistory.length > 0 && (
        <section
          className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
            resolvedTheme === 'dawn'
              ? 'bg-[#f0f7ff] border-[#bfdbfe]'
              : isDark
              ? 'bg-[#18181c] border-[#27272a]'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* 아코디언 헤더 토글 버튼 */}
          <div
            onClick={() => setIsHistoryAccordionOpen((prev) => !prev)}
            className="flex items-center justify-between cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <History className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                    오늘의 공유 게임 이력
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                    {todayHistory.length}건
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-slate-400">
                    (당일 자동 보관)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  오늘 종료된 사다리 및 룰렛 게임의 최종 결과를 언제든지 재조회할 수 있습니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 group-hover:border-indigo-400 transition-all cursor-pointer"
            >
              <span>{isHistoryAccordionOpen ? '접기' : '이력 보기'}</span>
              {isHistoryAccordionOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* 아코디언 펼침 컨텐츠 */}
          {isHistoryAccordionOpen && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 space-y-2.5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {todayHistory.map((item) => {
                  const timeStr = new Date(item.closedAt || item.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isLadder = item.gameType === 'LADDER';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistoryItem(item)}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 hover:shadow-md transition-all cursor-pointer group ${
                        resolvedTheme === 'dawn'
                          ? 'bg-white border-[#bfdbfe] hover:border-blue-400'
                          : isDark
                          ? 'bg-[#202024] border-[#303036] hover:border-indigo-500/60'
                          : 'bg-white border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className="text-base">{isLadder ? '🪜' : '🎯'}</span>
                            <span className="text-slate-800 dark:text-zinc-200">{item.title}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {timeStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                            {item.roomId}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.participantsCount}명 참여
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 line-clamp-2">
                          🏆 {item.winnerSummary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <span>결과 팝업 조회</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ---------------------------------------------------------------------
          4. 회원서비스 안내 : 슬라이드드래그휠(버튼) 적용 & 로그인화면 이동
          --------------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold leading-none">
              모아보고 핵심 회원 서비스 안내
            </h2>
          </div>
        </div>

        <ElmSld03 showNavButtons={true} stepWidth={356} className="w-full">
          {/* 배너 1. 모아금고관리 */}
          <div
            onClick={onGoLogin}
            className={`flex-shrink-0 w-[300px] sm:w-[340px] p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer select-none ${
              resolvedTheme === 'dawn'
                ? 'bg-gradient-to-br from-emerald-100/60 via-[#f0f7ff] to-blue-100/40 border-[#aed2f8] text-[#0d2746]'
                : isDark
                ? 'bg-gradient-to-br from-emerald-950/40 via-[#1a1a1e] to-[#121214] border-emerald-800/60'
                : 'bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white border-emerald-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm inline-block">
                  <Wallet className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/70 dark:border-emerald-800">
                  1인 다중 가계부
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold transition-colors group-hover:text-emerald-500">
                  모아금고관리
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  가계부 & 용돈관리
                </p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                가입 즉시 개인 가계부가 자동 생성되며, 모임/가족 그룹 가계부를 무제한 분리 기장합니다. 가계부 간 자금 이동은 TRANSFER 단일 연결로 투명하게 회계 처리됩니다.
              </p>
            </div>
            <div
              className={`pt-4 border-t mt-4 flex items-center justify-between text-xs font-bold ${
                resolvedTheme === 'dawn' ? 'border-[#cce3fa] text-emerald-700' : isDark ? 'border-[#27272a] text-emerald-400' : 'border-slate-100 text-emerald-700'
              }`}
            >
              <span>로그인하고 바로 이용하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 배너 2. 모아생활 */}
          <div
            onClick={onGoLogin}
            className={`flex-shrink-0 w-[300px] sm:w-[340px] p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer select-none ${
              resolvedTheme === 'dawn'
                ? 'bg-gradient-to-br from-blue-100/70 via-[#f0f7ff] to-indigo-100/40 border-[#aed2f8] text-[#0d2746]'
                : isDark
                ? 'bg-gradient-to-br from-indigo-950/40 via-[#1a1a1e] to-[#121214] border-indigo-800/60'
                : 'bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white border-indigo-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm inline-block">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-indigo-600 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/70 dark:border-indigo-800">
                  라이프 서비스
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold transition-colors group-hover:text-indigo-500">
                  모아생활
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  목표 & 당번 관리
                </p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                모아목표로 단계별 달성률과 인증사진을 공유하고, 모아당번의 직교 3상태머신(진행/인정/평가)을 통해 집안일과 과업을 투명하고 공정하게 분담합니다.
              </p>
            </div>
            <div
              className={`pt-4 border-t mt-4 flex items-center justify-between text-xs font-bold ${
                resolvedTheme === 'dawn' ? 'border-[#cce3fa] text-blue-700' : isDark ? 'border-[#27272a] text-indigo-400' : 'border-slate-100 text-indigo-700'
              }`}
            >
              <span>로그인하고 바로 이용하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 배너 3. 모아머니 */}
          <div
            onClick={onGoLogin}
            className={`flex-shrink-0 w-[300px] sm:w-[340px] p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer select-none ${
              resolvedTheme === 'dawn'
                ? 'bg-gradient-to-br from-amber-100/60 via-[#f0f7ff] to-orange-100/40 border-[#aed2f8] text-[#0d2746]'
                : isDark
                ? 'bg-gradient-to-br from-amber-950/40 via-[#1a1a1e] to-[#121214] border-amber-800/60'
                : 'bg-gradient-to-br from-amber-500/10 via-slate-50 to-white border-amber-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm inline-block">
                  <Coins className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-amber-600 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-950/70 dark:border-amber-800">
                  3초 간편 송금
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold transition-colors group-hover:text-amber-500">
                  모아머니
                </h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  용돈 요구 / 요청
                </p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                긴급 자금 요구머니와 용돈 상환/현물 상환을 기록하는 요청머니를 체계적으로 관리합니다. 카카오페이/토스 딥링크로 3초 만에 원클릭 송금이 가능합니다.
              </p>
            </div>
            <div
              className={`pt-4 border-t mt-4 flex items-center justify-between text-xs font-bold ${
                resolvedTheme === 'dawn' ? 'border-[#cce3fa] text-amber-700' : isDark ? 'border-[#27272a] text-amber-400' : 'border-slate-100 text-amber-700'
              }`}
            >
              <span>로그인하고 바로 이용하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </ElmSld03>
      </section>

      {/* 이력 조회용 사다리 결과 모달 */}
      {selectedHistoryItem?.gameType === 'LADDER' && selectedHistoryItem.data?.ladderResult && (
        <LadderResultModal
          isOpen={true}
          onClose={() => setSelectedHistoryItem(null)}
          members={selectedHistoryItem.data.members || []}
          results={selectedHistoryItem.data.ladderResult}
          selectedStore={selectedHistoryItem.data.selectedStore || null}
          onCopyText={() => {
            const text = selectedHistoryItem.data?.selectedStore
              ? formatStoreOrderText(selectedHistoryItem.data.ladderResult, selectedHistoryItem.data.members || [], selectedHistoryItem.data.selectedStore)
              : formatLadderResultText(selectedHistoryItem.data.ladderResult, selectedHistoryItem.data.members || [], null);
            navigator.clipboard?.writeText(text);
            showToast('📋 사다리 결과 텍스트가 클립보드에 복사되었습니다.');
          }}
          onCopyImageCard={() => {
            showToast('💡 이력 모드에서는 텍스트 복사를 지원합니다.', 'info');
          }}
          onDownloadImageCard={() => {
            showToast('💡 이력 모드에서는 텍스트 복사를 지원합니다.', 'info');
          }}
          resolvedTheme={resolvedTheme}
          isDark={isDark}
        />
      )}

      {/* 이력 조회용 룰렛 결과 모달 */}
      {selectedHistoryItem?.gameType === 'ROULETTE' && selectedHistoryItem.data?.selectedWinner && (
        <RouletteResultModal
          isOpen={true}
          onClose={() => setSelectedHistoryItem(null)}
          winner={selectedHistoryItem.data.selectedWinner}
          presetTitle={selectedHistoryItem.data.roulettePresetTitle || selectedHistoryItem.title}
          items={selectedHistoryItem.data.rouletteItems || []}
          onSpinAgain={() => {
            showToast('💡 마감된 공유 게임의 이력 조회 중입니다.', 'info');
          }}
          onInstantResult={() => {
            showToast('💡 마감된 공유 게임의 이력 조회 중입니다.', 'info');
          }}
          onCopyText={() => {
            const text = formatRouletteResultText(
              selectedHistoryItem.data.selectedWinner,
              selectedHistoryItem.data.roulettePresetTitle || selectedHistoryItem.title,
              selectedHistoryItem.data.rouletteItems || []
            );
            navigator.clipboard?.writeText(text);
            showToast('📋 룰렛 결과 텍스트가 클립보드에 복사되었습니다.');
          }}
          onCopyImageCard={() => {
            showToast('💡 이력 모드에서는 텍스트 복사를 지원합니다.', 'info');
          }}
          onDownloadImageCard={() => {
            showToast('💡 이력 모드에서는 텍스트 복사를 지원합니다.', 'info');
          }}
          resolvedTheme={resolvedTheme}
          isDark={isDark}
        />
      )}

      {/* 화면 하단 플로팅 상태 피드백 토스트 레이어 (ElmToast01 - 3초 자동 닫힘) */}
      <ElmToast01
        message={toastMessage}
        type={toastType}
        duration={3000}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
