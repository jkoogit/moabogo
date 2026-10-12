import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Ledger } from '../../types';
import {
  ElmTyp01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmSld03,
  ElmFab01,
  ElmPrf01,
  ElmBsh01,
} from '../elements/Tokens';
import {
  Wallet,
  TrendingUp,
  Sparkles,
  Coins,
  Gamepad2,
  Plus,
  Camera,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Handshake,
  Settings,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  CreditCard,
  Target,
  Send,
} from 'lucide-react';
import { SCR_QCK_01_빠른머니등록 } from './SCR_QCK_01_빠른머니등록';
import { SCR_QCK_02_빠른수행등록 } from './SCR_QCK_02_빠른수행등록';

export const SCR_DSH_01_로그인메인대시보드: React.FC<{
  onNavigate?: (screenId: string) => void;
  onOpenCommand?: () => void;
  activeLedger?: Ledger;
  onSelectLedger?: (ledger: Ledger) => void;
  ledgers?: Ledger[];
}> = ({
  onNavigate,
  onOpenCommand,
  activeLedger,
  onSelectLedger,
  ledgers = [
    { ledger_id: 'led-1', owner_id: 'user-1', ledger_name: '우리집 가계부 (가족 공유)', ledger_type: 'GROUP', is_instance: false, role: 'OWNER', created_at: '2026-01-01' },
    { ledger_id: 'led-2', owner_id: 'user-1', ledger_name: '내 개인 가계부 (기본)', ledger_type: 'PERSONAL', is_instance: false, role: 'OWNER', created_at: '2026-01-01' },
    { ledger_id: 'led-3', owner_id: 'user-2', ledger_name: '2026 상반기 동창 모임 (인스턴스)', ledger_type: 'GROUP', is_instance: true, role: 'MEMBER', created_at: '2026-03-01' },
  ],
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  const [currentLedgerId, setCurrentLedgerId] = useState<string>(activeLedger?.ledger_id || ledgers[0]?.ledger_id || 'led-1');
  const currentLedger = ledgers.find((l) => l.ledger_id === currentLedgerId) || ledgers[0];

  // 인터랙티브 데모 액션 상태
  const [isDutyApproved, setIsDutyApproved] = useState<boolean>(false);
  const [isMoneyApproved, setIsMoneyApproved] = useState<boolean>(false);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  // 빠른 등록 모달 오버레이 상태
  const [activeQuickModal, setActiveQuickModal] = useState<'MONEY' | 'DUTY' | null>(null);

  const handleApproveDuty = () => {
    setIsDutyApproved(true);
    setQuickNotice('✓ 구민우 자녀의 대신수행 요청을 승인했습니다.');
    setTimeout(() => setQuickNotice(null), 3000);
  };

  const handleApproveMoney = () => {
    setIsMoneyApproved(true);
    setQuickNotice('✓ 문제집 구입 자금(₩30,000)을 지급 승인하고 용돈에서 자동 차감 예약했습니다.');
    setTimeout(() => setQuickNotice(null), 3500);
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen transition-colors ${
        resolvedTheme === 'dawn'
          ? 'bg-[#070d1e] text-[#f0f6fc]'
          : isDark
          ? 'bg-[#121215] text-[#f4f4f6]'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Screen Meta Header & Global Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 shrink-0">
            SCR-DSH-01
          </span>
          <ElmTyp01
            title="메인 대시보드"
            subtitle={`${currentLedger.ledger_name} • 맞춤형 Bento Grid Hub`}
          />
        </div>

        {/* Quick Action Pills & ⌘K Search Trigger */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border text-xs font-semibold transition-colors bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-indigo-400 cursor-pointer whitespace-nowrap"
              title="커맨드 바 열기"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>검색 / 명령</span>
              <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">⌘K</kbd>
            </button>
          )}

          <button
            onClick={() => setActiveQuickModal('MONEY')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>빠른 머니등록</span>
          </button>

          <button
            onClick={() => setActiveQuickModal('DUTY')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>빠른 수행등록</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('SCR-SET-01')}
            className="p-2 sm:p-1.5 rounded-xl border transition-colors bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shrink-0"
            title="사용자 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 인라인 인터랙션 피드백 배너 */}
      {quickNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-in fade-in duration-200">
          <span>{quickNotice}</span>
          <button
            onClick={() => setQuickNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Multi-Ledger Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap shrink-0">가계부 전환:</span>
        {ledgers.map((l) => (
          <ElmFlt01
            key={l.ledger_id}
            label={l.ledger_name}
            selected={currentLedgerId === l.ledger_id}
            onClick={() => {
              setCurrentLedgerId(l.ledger_id);
              if (onSelectLedger) onSelectLedger(l);
            }}
          />
        ))}
      </div>

      {/* 3. 맞춤형 4-Column Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ===================================================================
            Card 1 [Hero 2-Col Span]: 가계부 종합 자산 & 순수 생활비 현황
            =================================================================== */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                  순수 생활비 (자산이동 분리 집계)
                </span>
              </div>
              <ElmStt01 type="EMERALD" label="정상 예산 집계" />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-3xl font-black tracking-tight font-mono text-slate-900 dark:text-white">
                  ₩1,248,000
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  당월 예산 ₩2,400,000 중 <strong className="text-emerald-500 font-mono">52%</strong> 소진 (19일 잔여)
                </p>
                {/* 예산 소진율 게이지 */}
                <div className="mt-2.5 w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '52%' }} />
                </div>
              </div>

              {/* 통계 분리 보장 안내 박스 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500 dark:text-zinc-400">총 자산 잔액</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">₩24,850,000</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500 dark:text-zinc-400">순수 당월 수입</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">+₩3,450,000</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-slate-200 dark:border-zinc-700">
                  <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                    자산이체(용돈 등)
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">₩200,000 (분리됨)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate && onNavigate('SCR-LED-01')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>가계부 내역 상세 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ElmCnt01 count="18건 기록" />
          </div>
        </div>

        {/* ===================================================================
            Card 2: 모아목표 (동행원 & 관람원)
            =================================================================== */}
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-indigo-400/50 ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Target className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">모아목표</span>
              </div>
              <ElmStt01 type="INDIGO" label="동행 3명" />
            </div>

            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900 dark:text-white break-keep">
                가족 1만보 걷기 챌린지
              </div>
              <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex justify-between gap-2 flex-wrap">
                <span>진행률 70%</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">동행 2명 완료</span>
              </p>

              {/* 참가자 아바타 스택 */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] text-slate-400">동행원 현황:</span>
                <div className="flex items-center -space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">구</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">최</span>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">민</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => setActiveQuickModal('DUTY')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>오늘 인증하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('SCR-GOL-01')}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              목표 관리 →
            </button>
          </div>
        </div>

        {/* ===================================================================
            Card 3: 모아당번 (대신수행 승인 인터랙션)
            =================================================================== */}
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-amber-400/50 ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">모아당번</span>
              </div>
              <ElmStt01 type="AMBER" label={isDutyApproved ? '승인 완료' : '대신요청 1건'} />
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white">거실 청소기 & 분리수거</div>
              <p className="text-xs text-slate-400">담당: 구민우(자녀) • 시험 기간</p>

              {/* 대신수행 알림 박스 */}
              <div className={`p-2.5 rounded-xl border text-xs transition-colors ${
                isDutyApproved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              }`}>
                {isDutyApproved ? (
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>대신수행이 승인되었습니다.</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold block">대신수행 요청 도착:</span>
                    <span className="text-[11px] opacity-90">"시험 기간이라 대신 부탁드립니다!"</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            {!isDutyApproved ? (
              <button
                type="button"
                onClick={handleApproveDuty}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
              >
                대신수행 즉시 승인
              </button>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate('SCR-DUT-01')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>당번 관리 상세</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <ElmCnt01 count="3과업 진행" />
          </div>
        </div>

        {/* ===================================================================
            Card 4: 모아머니 (요구머니 지급 & 토스 딥링크 모의)
            =================================================================== */}
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-purple-400/50 ${
            resolvedTheme === 'dawn'
              ? 'bg-[#0d1838] border-[#1e3a6d]'
              : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-purple-500/10 text-purple-500">
                  <Coins className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">모아머니 (자금요청)</span>
              </div>
              <ElmStt01 type="PURPLE" label={isMoneyApproved ? '지급 완료' : '요구 1건 대기'} />
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white">문제집 구입 긴급 요청</div>
              <div className="font-mono font-bold text-lg text-purple-600 dark:text-purple-400">₩30,000원</div>
              <p className="text-[11px] text-slate-400">
                {isMoneyApproved ? '✓ 용돈 차감 예약됨 (이중합산 차단)' : '지급 시 용돈 자동 차감 & 토스 딥링크 지원'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-1 flex-wrap">
            {!isMoneyApproved ? (
              <button
                type="button"
                onClick={handleApproveMoney}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
              >
                지급 승인
              </button>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate('SCR-MON-01')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>머니 이동 관리</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <ElmCnt01 count="2건 대기" />
          </div>
        </div>
      </div>

      {/* 4. ElmSld03 기반 슬라이드 트랙: 독립 이벤트 정산 & 활동 내역 */}
      <section
        className={`p-5 rounded-2xl border shadow-xs space-y-3 transition-colors ${
          resolvedTheme === 'dawn'
            ? 'bg-[#0d1838] border-[#1e3a6d]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              독립 이벤트 정산 & 모임 활동
            </h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('SCR-EVT-01')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            새 정산/사다리 실행 →
          </button>
        </div>

        {/* 최신 ElmSld03 적용 (자석 스냅 없이 휠/드래그 즉각 반영) */}
        <ElmSld03 showNavButtons={true} stepWidth={260}>
          <div
            onClick={() => onNavigate && onNavigate('SCR-EVT-01')}
            className="min-w-[250px] p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850 hover:border-indigo-400 transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-zinc-100">주말 글램핑 1/N 정산</span>
                <ElmStt01 type="EMERALD" label="정산 완료" />
              </div>
              <p className="text-xs text-slate-400 mt-2">총 4인 분할 (게스트 2명 포함)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between text-xs font-mono">
              <span className="text-slate-400">1인당</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">₩39,000</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('SCR-GNT-01')}
            className="min-w-[250px] p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850 hover:border-indigo-400 transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-zinc-100">동창회 펜션 사다리타기</span>
                <ElmStt01 type="INDIGO" label="게임 기록" />
              </div>
              <p className="text-xs text-slate-400 mt-2">당첨자: 박준혁 (커피 쏘기)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between text-xs font-mono">
              <span className="text-slate-400">참여자</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">6명</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('SCR-GNT-01')}
            className="min-w-[250px] p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850 hover:border-indigo-400 transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-zinc-100">회식 장소 술래잡기</span>
                <ElmStt01 type="PURPLE" label="룰렛 완료" />
              </div>
              <p className="text-xs text-slate-400 mt-2">술래: 최영식 (예약 완료)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between text-xs font-mono">
              <span className="text-slate-400">참여자</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">8명</span>
            </div>
          </div>
        </ElmSld03>
      </section>

      {/* 5. 우측 하단 ELM-FAB-01 스피드 다이얼 */}
      <ElmFab01
        onOcrClick={() => setActiveQuickModal('MONEY')}
        onQuickExpenseClick={() => setActiveQuickModal('MONEY')}
        onQuickDutyClick={() => setActiveQuickModal('DUTY')}
      />

      {/* 6. 빠른 머니등록 플로팅 모달 오버레이 */}
      {activeQuickModal === 'MONEY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <SCR_QCK_01_빠른머니등록
              onClose={() => setActiveQuickModal(null)}
              onSuccess={() => {
                setQuickNotice('✓ 빠른 머니 등록이 완료되었습니다.');
                setTimeout(() => setQuickNotice(null), 3000);
              }}
            />
          </div>
        </div>
      )}

      {/* 7. 빠른 수행등록 플로팅 모달 오버레이 */}
      {activeQuickModal === 'DUTY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <SCR_QCK_02_빠른수행등록
              onClose={() => setActiveQuickModal(null)}
              onSuccess={() => {
                setQuickNotice('✓ 빠른 수행 등록이 성공적으로 완료되었습니다.');
                setTimeout(() => setQuickNotice(null), 3000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
