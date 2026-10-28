import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Copy,
  Camera,
  Download,
  Dices,
  FastForward,
  Store,
  Minus,
  Plus,
  Trophy,
} from 'lucide-react';
import { ElmRng01 } from '../../../sample/elements/Tokens';
import { Participant, loadUserGoalPresets } from '../types';
import {
  LadderGoal,
  LadderResultMap,
  LadderRevealedGoalCols,
  ArrivalPopupData,
  LADDER_COL_WIDTH,
  LADDER_SPEED_OPTIONS,
} from './types';
import {
  generateDefaultLadderGoals,
  generateLadderRungs,
  computeLadderPaths,
  formatLadderResultText,
  formatStoreOrderText,
} from './ladderEngine';
import { LadderViewerSvg } from './LadderViewerSvg';
import {
  LadderGoalModal,
  LadderArrivalModal,
  StoreMenuSelectModal,
  LadderResultModal,
  getStoreMenuEmoji,
} from './LadderModals';
import { StorePreset, StoreMenuItem } from '../../../sample/data/systemStorePool';
import {
  generateLadderResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
} from '../../../sample/utils/gameResultCardCanvas';

export interface LadderGameZoneProps {
  members: Participant[];
  setMembers: React.Dispatch<React.SetStateAction<Participant[]>>;
  selectedStore: StorePreset | null;
  setSelectedStore: (store: StorePreset | null) => void;
  winnerCount: number;
  setWinnerCount: React.Dispatch<React.SetStateAction<number>>;
  ladderGoals: LadderGoal[];
  setLadderGoals: React.Dispatch<React.SetStateAction<LadderGoal[]>>;
  currentTabId: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderGameZone: React.FC<LadderGameZoneProps> = ({
  members,
  setMembers,
  selectedStore,
  setSelectedStore,
  winnerCount,
  setWinnerCount,
  ladderGoals,
  setLadderGoals,
  currentTabId,
  showToast,
  resolvedTheme,
  isDark,
}) => {
  const [ladderSeed, setLadderSeed] = useState<number>(() => Math.floor(Math.random() * 9999) + 1);
  const [ladderSpeed, setLadderSpeed] = useState<number>(1.0);
  const [isLadderTracing, setIsLadderTracing] = useState<boolean>(false);
  const [activeTracingMemberIndex, setActiveTracingMemberIndex] = useState<number | null>(null);
  const [currentTracerPosition, setCurrentTracerPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentTracedTrail, setCurrentTracedTrail] = useState<{ x: number; y: number }[]>([]);
  const [revealedGoals, setRevealedGoals] = useState<Record<string, boolean>>({});
  const [revealedGoalCols, setRevealedGoalCols] = useState<LadderRevealedGoalCols>({});
  const [ladderResult, setLadderResult] = useState<LadderResultMap | null>(null);
  const [arrivalPopup, setArrivalPopup] = useState<ArrivalPopupData | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [useLadderWeight, setUseLadderWeight] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoalCol, setEditingGoalCol] = useState<number>(0);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [storeModalMemberId, setStoreModalMemberId] = useState<string>('');
  const [storeModalMode, setStoreModalMode] = useState<'STORE_ONLY' | 'MEMBER_MENU'>('STORE_ONLY');

  const ladderSliderRef = useRef<HTMLDivElement>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 참여인원, 당첨인원, 가중치 변경 감지 키
  const membersWeightsKey = useMemo(() => {
    return members.map((m) => `${m.id}:${m.weight || 1}`).join(',');
  }, [members]);

  // 사다리 가로줄 동적 생성
  const ladderRungs = useMemo(() => {
    return generateLadderRungs(members.length, ladderSeed);
  }, [members.length, ladderSeed]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  // 인원수 및 당첨수 동기화
  useEffect(() => {
    const needed = members.length;
    const safeWinners = Math.max(1, Math.min(needed - 1, winnerCount));
    setLadderGoals(generateDefaultLadderGoals(needed, safeWinners));
    if (winnerCount >= needed) {
      setWinnerCount(Math.max(1, needed - 1));
    }
  }, [members.length, winnerCount, setWinnerCount, setLadderGoals]);

  // 참여인원, 당첨인원, 가중치 변경 시 기존 게임결과 및 상태 자동 초기화
  useEffect(() => {
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    setIsResultModalOpen(false);
  }, [members.length, winnerCount, membersWeightsKey]);

  // 슬라이드드래그휠: 가로 마우스 휠 변환 및 배경 전파 차단
  useEffect(() => {
    const el = ladderSliderRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const canScroll = el.scrollWidth > el.clientWidth + 2;
      if (!canScroll) return;
      const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (rawDelta === 0) return;
      const isAtStart = el.scrollLeft <= 2;
      const isAtEnd = el.scrollLeft >= Math.floor(el.scrollWidth - el.clientWidth) - 2;
      if ((isAtStart && rawDelta < 0) || (isAtEnd && rawDelta > 0)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += rawDelta * 1.2;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 마우스/터치 드래그 스크롤 핸들러
  const isDraggingLadderRef = useRef<boolean>(false);
  const ladderStartXRef = useRef<number>(0);
  const ladderScrollLeftRef = useRef<number>(0);

  const handleLadderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    isDraggingLadderRef.current = true;
    if (ladderSliderRef.current) {
      ladderStartXRef.current = e.pageX - ladderSliderRef.current.offsetLeft;
      ladderScrollLeftRef.current = ladderSliderRef.current.scrollLeft;
    }
  };

  const handleLadderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingLadderRef.current || !ladderSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - ladderSliderRef.current.offsetLeft;
    const walk = (x - ladderStartXRef.current) * 1.5;
    ladderSliderRef.current.scrollLeft = ladderScrollLeftRef.current - walk;
  };

  const handleLadderMouseUpOrLeave = () => {
    isDraggingLadderRef.current = false;
  };

  const handleUpdateMemberWeight = (memberId: string, delta: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const current = m.weight || 1;
        const next = Math.max(0.5, Math.min(5, Math.round((current + delta) * 10) / 10));
        return { ...m, weight: next };
      })
    );
  };

  const handleReshuffleRungs = () => {
    if (isLadderTracing) return;
    setLadderSeed((prev) => prev + 1);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    showToast('🎲 사다리 가로줄이 무작위로 재배치되었습니다!', 'info');
  };

  const handleShuffleGoals = () => {
    if (isLadderTracing) return;
    setLadderGoals((prev) => [...prev].sort(() => Math.random() - 0.5));
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    showToast('🎯 목표 위치가 무작위로 재배치되었습니다!', 'info');
  };

  const handleSkipToResult = () => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setArrivalPopup(null);

    const { results } = computeLadderPaths(members, ladderGoals, ladderRungs);
    setLadderResult(results);
    setIsResultModalOpen(true);

    const revGoals: Record<string, boolean> = {};
    const revCols: LadderRevealedGoalCols = {};
    members.forEach((m) => {
      revGoals[m.id] = true;
      const res = results[m.id];
      if (res) {
        revCols[res.goalIndex] = {
          memberName: m.name,
          avatar: m.avatar,
          isWinner: res.isWinner,
        };
      }
    });
    setRevealedGoals(revGoals);
    setRevealedGoalCols(revCols);
  };

  const handlePlayLadder = (skipTrace = false) => {
    if (skipTrace) {
      handleSkipToResult();
      return;
    }

    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

    setArrivalPopup(null);
    const { results, paths } = computeLadderPaths(members, ladderGoals, ladderRungs);
    setIsLadderTracing(true);
    setLadderResult(null);
    setCurrentTracedTrail([]);
    setRevealedGoals({});
    setRevealedGoalCols({});

    const animateMember = (idx: number) => {
      if (idx >= members.length) {
        setIsLadderTracing(false);
        setActiveTracingMemberIndex(null);
        setCurrentTracerPosition(null);
        setCurrentTracedTrail([]);
        setLadderResult(results);
        return;
      }

      const currentMember = members[idx];
      setActiveTracingMemberIndex(idx);

      if (ladderSliderRef.current) {
        const el = ladderSliderRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          const startX = idx * LADDER_COL_WIDTH + LADDER_COL_WIDTH / 2;
          const targetScroll = Math.max(0, Math.min(maxScroll, startX - el.clientWidth / 2));
          el.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
      }

      const memberPoints = paths[currentMember.id] || [];
      const startPt = memberPoints[0] || null;
      // 이전 마커와 선을 완전히 끊고 새 주자의 최상단 시작점에서 정밀 출발
      setCurrentTracerPosition(startPt);
      setCurrentTracedTrail(startPt ? [startPt] : []);
      const trailHistory: { x: number; y: number }[] = startPt ? [startPt] : [];
      let stepIdx = 1;

      const speedInterval =
        LADDER_SPEED_OPTIONS.find((s) => s.value === ladderSpeed)?.interval || 20;

      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = setInterval(() => {
        if (stepIdx < memberPoints.length) {
          const pt = memberPoints[stepIdx];
          setCurrentTracerPosition(pt);
          trailHistory.push(pt);
          setCurrentTracedTrail([...trailHistory]);
          stepIdx++;
        } else {
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }

          // 골인 지점에 안착
          const finalPt = memberPoints[memberPoints.length - 1] || null;
          setCurrentTracerPosition(finalPt);

          setRevealedGoals((prev) => ({ ...prev, [currentMember.id]: true }));
          const currentResult = results[currentMember.id];
          if (currentResult) {
            setRevealedGoalCols((prev) => ({
              ...prev,
              [currentResult.goalIndex]: {
                memberName: currentMember.name,
                avatar: currentMember.avatar,
                isWinner: currentResult.isWinner,
              },
            }));
          }

          const nextIdx = idx + 1;
          const isLast = nextIdx >= members.length;
          const nextMember = !isLast ? members[nextIdx] : undefined;

          setArrivalPopup({
            member: currentMember,
            result: currentResult,
            memberIndex: idx,
            totalMembers: members.length,
            nextMemberName: nextMember?.name,
          });
        }
      }, speedInterval);
    };

    animateMember(0);
  };

  const handleProceedAfterArrival = () => {
    if (!arrivalPopup) return;
    const nextIdx = arrivalPopup.memberIndex + 1;
    const isLast = nextIdx >= members.length;
    setArrivalPopup(null);
    // 골인 후 다음 주자 출발 전 이전 마커와 트레일을 완전히 끊음!
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);

    if (isLast) {
      setIsLadderTracing(false);
      setActiveTracingMemberIndex(null);
      setCurrentTracerPosition(null);
      const { results } = computeLadderPaths(members, ladderGoals, ladderRungs);
      setLadderResult(results);
      setIsResultModalOpen(true);
    } else {
      const { results, paths } = computeLadderPaths(members, ladderGoals, ladderRungs);
      const nextMember = members[nextIdx];
      setActiveTracingMemberIndex(nextIdx);

      if (ladderSliderRef.current) {
        const el = ladderSliderRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          const startX = nextIdx * LADDER_COL_WIDTH + LADDER_COL_WIDTH / 2;
          const targetScroll = Math.max(0, Math.min(maxScroll, startX - el.clientWidth / 2));
          el.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
      }

      const memberPoints = paths[nextMember.id] || [];
      const startPt = memberPoints[0] || null;
      // 다음 주자의 사다리 최상단 시작점에서 정밀 출발
      setCurrentTracerPosition(startPt);
      setCurrentTracedTrail(startPt ? [startPt] : []);
      const trailHistory: { x: number; y: number }[] = startPt ? [startPt] : [];
      let stepIdx = 1;

      const speedInterval =
        LADDER_SPEED_OPTIONS.find((s) => s.value === ladderSpeed)?.interval || 20;

      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = setInterval(() => {
        if (stepIdx < memberPoints.length) {
          const pt = memberPoints[stepIdx];
          setCurrentTracerPosition(pt);
          trailHistory.push(pt);
          setCurrentTracedTrail([...trailHistory]);
          stepIdx++;
        } else {
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }

          // 골인 지점에 안착
          const finalPt = memberPoints[memberPoints.length - 1] || null;
          setCurrentTracerPosition(finalPt);

          setRevealedGoals((prev) => ({ ...prev, [nextMember.id]: true }));
          const res = results[nextMember.id];
          if (res) {
            setRevealedGoalCols((prev) => ({
              ...prev,
              [res.goalIndex]: {
                memberName: nextMember.name,
                avatar: nextMember.avatar,
                isWinner: res.isWinner,
              },
            }));
          }

          const afterNextIdx = nextIdx + 1;
          const isAfterLast = afterNextIdx >= members.length;
          const afterNextMember = !isAfterLast ? members[afterNextIdx] : undefined;

          setArrivalPopup({
            member: nextMember,
            result: res,
            memberIndex: nextIdx,
            totalMembers: members.length,
            nextMemberName: afterNextMember?.name,
          });
        }
      }, speedInterval);
    }
  };

  const handleGoalColClick = (colIdx: number) => {
    if (isLadderTracing) return;
    setEditingGoalCol(colIdx);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (colIdx: number, newGoal: LadderGoal) => {
    setLadderGoals((prev) =>
      prev.map((g, idx) => (idx === colIdx ? newGoal : g))
    );
    showToast(`${colIdx + 1}번 기둥 목표가 '${newGoal.text}'(으)로 변경되었습니다.`);
  };

  const handleOpenStoreMenuPicker = (memberId: string) => {
    setStoreModalMemberId(memberId);
    setStoreModalMode('MEMBER_MENU');
    setIsStoreModalOpen(true);
  };

  const handleSelectMenuForMember = (memberId: string, item: StoreMenuItem) => {
    const menuEmoji = getStoreMenuEmoji(item);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              selectedMenu: item,
              avatar: menuEmoji, // 선택된 메뉴 아이콘을 참가자 이미지에 교체
            }
          : m
      )
    );
    showToast(`'${item.name}' 메뉴가 선택되어 참가자 아이콘이 교체되었습니다.`);
  };

  const handleToggleClaimSeat = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const isMySeat = m.claimedBy === currentTabId;
        return {
          ...m,
          claimedBy: isMySeat ? undefined : currentTabId,
        };
      })
    );
  };

  const handleCopyText = () => {
    if (!ladderResult) return;
    const text = selectedStore
      ? formatStoreOrderText(ladderResult, members, selectedStore)
      : formatLadderResultText(ladderResult, members, null);
    navigator.clipboard?.writeText(text);
    showToast('사다리 결과 텍스트가 클립보드에 복사되었습니다.');
  };

  const handleCopyImageCard = async () => {
    if (!ladderResult) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateLadderResultCardBlob({
        title: selectedStore ? `${selectedStore.name} 주문 사다리` : '사다리타기 결과서',
        totalCount: members.length,
        participants: members.map((m) => {
          const res = ladderResult[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            goalText: res?.text || '대기',
            goalIcon: res?.icon || '❓',
            isWinner: res?.isWinner || false,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      const res = await copyBlobToClipboard(blob);
      if (res.success) {
        showToast('사다리 결과 카드 이미지가 클립보드에 복사되었습니다.');
      } else {
        downloadBlobAsFile(blob, `moabogo_ladder_${Date.now()}.png`);
        showToast('클립보드 권한으로 인해 이미지 파일로 저장되었습니다.', 'info');
      }
    } catch (e) {
      console.error('Failed to generate ladder card:', e);
      showToast('카드 이미지 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleDownloadImageCard = async () => {
    if (!ladderResult) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateLadderResultCardBlob({
        title: selectedStore ? `${selectedStore.name} 주문 사다리` : '사다리타기 결과서',
        totalCount: members.length,
        participants: members.map((m) => {
          const res = ladderResult[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            goalText: res?.text || '대기',
            goalIcon: res?.icon || '❓',
            isWinner: res?.isWinner || false,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      downloadBlobAsFile(blob, `moabogo_ladder_${Date.now()}.png`);
      showToast('사다리 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download ladder card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 카페/매장 연동 바 */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe]'
            : isDark
            ? 'bg-[#1a1a1e] border-[#27272a]'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <span>{selectedStore ? selectedStore.name : '매장 연동 사다리타기'}</span>
              {selectedStore && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold">
                  주문서 자동 생성
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">
              {selectedStore
                ? `${selectedStore.category} 메뉴가 연동되어 결제 당첨자 주문서가 산출됩니다.`
                : '카페/음료 매장을 선택하면 각자 메뉴를 고르고 결제자를 사다리로 정할 수 있습니다.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setStoreModalMemberId(members[0]?.id || '');
            setStoreModalMode('STORE_ONLY');
            setIsStoreModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-all cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>{selectedStore ? '매장 변경 / 해제' : '매장 메뉴 연동하기'}</span>
        </button>
      </div>

      {/* 사다리 컨트롤러 및 설정 패널 */}
      <div
        className={`p-4 rounded-2xl border space-y-4 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe]'
            : isDark
            ? 'bg-[#1a1a1e] border-[#27272a]'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        {/* 당첨 인원 슬라이더 & 가중치 모드 토글 */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              당첨 인원수
            </span>
            <button
              type="button"
              onClick={() => setUseLadderWeight((prev) => !prev)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                useLadderWeight
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                  : resolvedTheme === 'dawn'
                  ? 'bg-white/80 border-[#bfdbfe] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{useLadderWeight ? '가중치 ON' : '가중치 OFF'}</span>
            </button>
          </div>
          <ElmRng01
            label=""
            value={winnerCount}
            min={1}
            max={Math.max(1, members.length - 1)}
            step={1}
            unit="명"
            onChange={(val) => setWinnerCount(val)}
            colorScheme="indigo"
          />
        </div>

        {/* 퀵 액션 버튼 바: 속도 조절(모바일 줄바꿈 방지 슬라이드), 주사위 재배치, 셔플 */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5 shrink min-w-0 max-w-full">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 shrink-0">속도:</span>
            {LADDER_SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLadderSpeed(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  ladderSpeed === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReshuffleRungs}
              disabled={isLadderTracing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5 text-indigo-500" />
              <span>가로줄 섞기</span>
            </button>

            <button
              type="button"
              onClick={handleShuffleGoals}
              disabled={isLadderTracing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>목표 섞기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 사다리 메인 뷰어 존 */}
      <div
        className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-5 ${
          resolvedTheme === 'dawn'
            ? 'bg-white/80 border-[#bfdbfe]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* 참가자 헤더 칩 (상단 출발점) - 슬라이드드래그휠 복원 */}
        <div
          ref={ladderSliderRef}
          onMouseDown={handleLadderMouseDown}
          onMouseMove={handleLadderMouseMove}
          onMouseUp={handleLadderMouseUpOrLeave}
          onMouseLeave={handleLadderMouseUpOrLeave}
          className="w-full overflow-x-auto no-scrollbar scroll-smooth py-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div
            className="flex items-start select-none"
            style={{ width: members.length * LADDER_COL_WIDTH }}
          >
            {members.map((m, idx) => {
              const isClaimedByMe = m.claimedBy === currentTabId;
              const isClaimedByOther = m.claimedBy && !isClaimedByMe;
              const isOdd = idx % 2 === 1;
              return (
                <div
                  key={m.id}
                  style={{ width: LADDER_COL_WIDTH }}
                  className={`flex flex-col items-center justify-start shrink-0 px-1 transition-all ${
                    isOdd ? 'pt-7' : 'pt-0'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleClaimSeat(m.id)}
                    className={`w-full p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isClaimedByMe
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-2 ring-indigo-400'
                        : isClaimedByOther
                        ? 'border-slate-300 dark:border-zinc-700 bg-slate-100/60 dark:bg-zinc-800/40 opacity-75'
                        : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-300'
                    }`}
                    title={isClaimedByMe ? '내 자리 (클릭 시 점유 해제)' : '자리 찜하기'}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 shadow-2xs">
                      {m.selectedMenu?.imageUrl ? (
                        <img
                          src={m.selectedMenu.imageUrl}
                          alt={m.selectedMenu.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const span = document.createElement('span');
                              span.className = 'text-xl';
                              span.innerText = m.avatar || '☕';
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xl">{m.avatar}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold truncate max-w-full text-center">
                      {m.name}
                    </span>
                    {isClaimedByMe && (
                      <span className="text-[9px] font-black px-1 rounded bg-indigo-600 text-white">
                        내 자리
                      </span>
                    )}
                  </button>

                  {/* 사다리 가중치 조절 컨트롤 */}
                  {useLadderWeight && (
                    <div
                      className="mt-1 flex items-center justify-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateMemberWeight(m.id, -0.5)}
                        className="p-1 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform"
                        title="가중치 0.5 감소"
                        aria-label="0.5 감소"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-12 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/90 border border-slate-200/90 dark:border-zinc-700 text-[10px] font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 tabular-nums inline-block shadow-2xs select-none">
                        {(m.weight || 1).toFixed(1)}x
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateMemberWeight(m.id, 0.5)}
                        className="p-1 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform"
                        title="가중치 0.5 증가"
                        aria-label="0.5 증가"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* 매장 메뉴 선택 버튼 */}
                  {selectedStore && (
                    <button
                      type="button"
                      onClick={() => handleOpenStoreMenuPicker(m.id)}
                      className="mt-1 px-1.5 py-0.5 rounded text-[10px] border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 truncate max-w-full font-medium"
                    >
                      {m.selectedMenu ? m.selectedMenu.name : '+ 메뉴 선택'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 사다리 SVG 및 하단 목표 */}
          <div className="pt-2">
            <LadderViewerSvg
              members={members}
              ladderGoals={ladderGoals}
              ladderRungs={ladderRungs}
              ladderResult={ladderResult}
              revealedGoals={revealedGoals}
              revealedGoalCols={revealedGoalCols}
              isLadderTracing={isLadderTracing}
              activeTracingMemberIndex={activeTracingMemberIndex}
              currentTracerPosition={currentTracerPosition}
              currentTracedTrail={currentTracedTrail}
              onGoalColClick={handleGoalColClick}
              resolvedTheme={resolvedTheme}
              isDark={isDark}
            />
          </div>
        </div>

        {/* 메인 실행 버튼 바 (모바일 버튼 텍스트 줄바꿈 방지 및 요소 단위 줄바꿈) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-lg">
          <button
            type="button"
            onClick={() => handlePlayLadder(false)}
            disabled={isLadderTracing}
            className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer whitespace-nowrap min-w-0"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="whitespace-nowrap">{isLadderTracing ? '사다리 타는 중...' : '사다리 타기'}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayLadder(true)}
            className={`py-3 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              resolvedTheme === 'dawn'
                ? 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200'
                : isDark
                ? 'bg-[#27272a] border-[#3f3f46] text-slate-200 hover:bg-[#323238]'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FastForward className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">즉시 결과</span>
          </button>

          {ladderResult && (
            <button
              type="button"
              onClick={() => setIsResultModalOpen(true)}
              className="py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="whitespace-nowrap">결과 팝업 보기</span>
            </button>
          )}
        </div>

        {/* 사다리 최종 결과 및 공유 카드 */}
        {ladderResult && (
          <div
            className={`w-full max-w-lg p-5 rounded-2xl border flex flex-col gap-4 animate-in zoom-in-95 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#f0f7ff] border-[#bfdbfe]'
                : isDark
                ? 'bg-[#18181b] border-[#27272a]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>사다리타기 최종 매칭 결과</span>
              </h4>
              <span className="text-[11px] text-slate-400">{members.length}명 전원 완료</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((m) => {
                const res = ladderResult[m.id];
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      res?.isWinner
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-bold'
                        : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{m.avatar}</span>
                    <div className="truncate min-w-0">
                      <p className="text-xs font-bold truncate">{m.name}</p>
                      <p className="text-[11px] flex items-center gap-1 mt-0.5">
                        <span>{res?.icon}</span>
                        <span className="truncate">{res?.text}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 결과 복사 타이틀 및 3건의 아이콘 */}
            <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                결과 복사:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center"
                  title="사다리 결과 텍스트 복사"
                >
                  <Copy className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyImageCard}
                  disabled={isGeneratingCard}
                  className="p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40"
                  title="사다리 결과 카드 이미지 복사"
                >
                  <Camera className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadImageCard}
                  disabled={isGeneratingCard}
                  className="p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40"
                  title="사다리 결과 카드 이미지 파일 저장"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 목표 수정 모달 */}
      <LadderGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        colIndex={editingGoalCol}
        currentGoal={ladderGoals[editingGoalCol] || { text: '통과', icon: '💨' }}
        onSaveGoal={handleSaveGoal}
        presetGoals={loadUserGoalPresets()}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 도착 팝업 모달 */}
      <LadderArrivalModal
        arrivalData={arrivalPopup}
        onProceed={handleProceedAfterArrival}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 매장 메뉴 선택 모달 */}
      <StoreMenuSelectModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
        members={members}
        currentMemberId={storeModalMemberId}
        onSelectMenuForMember={handleSelectMenuForMember}
        mode={storeModalMode}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 사다리 최종 결과 전폭 팝업 모달 */}
      <LadderResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        members={members}
        results={ladderResult}
        selectedStore={selectedStore}
        onCopyText={handleCopyText}
        onCopyImageCard={handleCopyImageCard}
        onDownloadImageCard={handleDownloadImageCard}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />
    </div>
  );
};
