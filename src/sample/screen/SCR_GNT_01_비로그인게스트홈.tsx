import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmInp01,
  ElmSld03,
} from '../elements/Tokens';
import {
  Gamepad2,
  Users,
  Wallet,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  Coins,
  Check,
  Plus,
  Minus,
  Copy,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Gauge,
  X,
} from 'lucide-react';

// Character avatar presets
interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  bgLight: string;
  weight: number; // for weighted games (default 1)
  isSent?: boolean; // for settlement
}

const PRESET_CHARACTERS = [
  { avatar: '🐱', color: 'text-amber-600 dark:text-amber-400', bgLight: 'bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800' },
  { avatar: '🐶', color: 'text-indigo-600 dark:text-indigo-400', bgLight: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800' },
  { avatar: '🦊', color: 'text-orange-600 dark:text-orange-400', bgLight: 'bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800' },
  { avatar: '🐼', color: 'text-emerald-600 dark:text-emerald-400', bgLight: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' },
  { avatar: '🦁', color: 'text-yellow-600 dark:text-yellow-400', bgLight: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-800' },
  { avatar: '🐻', color: 'text-rose-600 dark:text-rose-400', bgLight: 'bg-rose-100 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800' },
  { avatar: '🐰', color: 'text-pink-600 dark:text-pink-400', bgLight: 'bg-pink-100 border-pink-300 dark:bg-pink-950/40 dark:border-pink-800' },
  { avatar: '🐨', color: 'text-teal-600 dark:text-teal-400', bgLight: 'bg-teal-100 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' },
  { avatar: '🐯', color: 'text-amber-700 dark:text-amber-300', bgLight: 'bg-amber-200 border-amber-400 dark:bg-amber-900/40 dark:border-amber-700' },
  { avatar: '🐧', color: 'text-cyan-600 dark:text-cyan-400', bgLight: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-800' },
  { avatar: '🐵', color: 'text-lime-600 dark:text-lime-400', bgLight: 'bg-lime-100 border-lime-300 dark:bg-lime-950/40 dark:border-lime-800' },
  { avatar: '🐸', color: 'text-green-600 dark:text-green-400', bgLight: 'bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-800' },
];

const TARGET_ICONS = ['🎁', '💨', '☕', '❌', '🍗', '🍜', '🍰', '💸', '👑'];
const LADDER_COL_WIDTH = 84; // 사다리 열 고정 폭 (84px 완벽 통일)

// 목표 기본 텍스트 생성: 선택 1 (🎁), 선택 2 (🎁)... 통과 1 (💨), 통과 2 (💨)... (안전 범위 보장)
const generateDefaultLadderGoals = (total: number, winners: number) => {
  let selectIdx = 1;
  let passIdx = 1;
  const safeWinners = Math.max(1, Math.min(total - 1, winners));
  return Array.from({ length: total }, (_, i) => {
    if (i < safeWinners) {
      return { text: `선택 ${selectIdx++}`, icon: '🎁' };
    } else {
      return { text: `통과 ${passIdx++}`, icon: '💨' };
    }
  });
};

// 기본 사다리 가로줄 동적 생성 함수 (전체 기둥 간격마다 3~4개씩 빈틈없이 완벽 균등 분포 보장 & 행 충돌 0% 보장 알고리즘)
const generateLadderRungs = (cols: number, seed: number) => {
  const rows = 10;
  const rungs: { col: number; row: number }[] = [];

  // 시드 기반 균일 의사 난수 생성기
  let s = (seed * 41 + cols * 67 + 101) % 233280;
  const pseudoRand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // 주사위 시드에 따라 간격별 시작 위상을 무작위로 결정
  const phaseOffset = pseudoRand() > 0.5 ? 1 : 0;

  // 1단계: 모든 인접 기둥 간격(c: 0 ~ cols - 2)에 대해 3~4개의 가로줄을 균등하게 생성
  for (let c = 0; c < cols - 1; c++) {
    const isEvenColGroup = (c + phaseOffset) % 2 === 0;
    const candidateRows = isEvenColGroup ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9];

    const shuffled = [...candidateRows].sort(() => pseudoRand() - 0.5);
    const pickCount = pseudoRand() > 0.35 ? 3 : 4;
    const selected = shuffled.slice(0, pickCount);

    selected.forEach((r) => {
      rungs.push({ col: c, row: r });
    });
  }

  // 2단계: 다채로운 교차를 위해 안전한 빈 슬롯에 무작위 크로스 브릿지 추가 (충돌 검사 필수)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const alreadyHas = rungs.some((item) => item.row === r && item.col === c);
      if (!alreadyHas) {
        const leftHas = rungs.some((item) => item.row === r && item.col === c - 1);
        const rightHas = rungs.some((item) => item.row === r && item.col === c + 1);
        if (!leftHas && !rightHas && pseudoRand() > 0.72) {
          rungs.push({ col: c, row: r });
        }
      }
    }
  }

  return rungs;
};

export const SCR_GNT_01_비로그인게스트홈: React.FC<{
  onGoLogin?: () => void;
  onGoSignup?: () => void;
  onGoSettings?: () => void;
}> = ({ onGoLogin, onGoSignup }) => {
  // 1. 테마 훅 (라이트, 다크, 여명 블루 식별)
  const { resolvedTheme, isDark } = useTheme();

  // 6. 술래잡기 > 룰렛으로 명칭 변경 ('ROULETTE')
  const [gameType, setGameType] = useState<'SPLIT' | 'LADDER' | 'ROULETTE'>('SPLIT');

  // ---------------------------------------------------------------------------
  // 1. 공통 참가자 상태 관리
  // ---------------------------------------------------------------------------
  const [memberCount, setMemberCount] = useState<number>(5);
  const [members, setMembers] = useState<Participant[]>(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const preset = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
      return {
        id: `m_${i + 1}`,
        name: `참가자 ${i + 1}`,
        avatar: preset.avatar,
        color: preset.color,
        bgLight: preset.bgLight,
        weight: 1,
        isSent: false,
      };
    });
  });

  // 인원수 변경 동기화 (최소 2명 이상, 상한 제한 없음)
  const handleUpdateMemberCount = (newCount: number) => {
    const validCount = Math.max(2, newCount);
    setMemberCount(validCount);
    setMembers((prev) => {
      if (prev.length < validCount) {
        const added = Array.from({ length: validCount - prev.length }).map((_, idx) => {
          const i = prev.length + idx;
          const preset = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
          return {
            id: `m_${Date.now()}_${i}`,
            name: `참가자 ${i + 1}`,
            avatar: preset.avatar,
            color: preset.color,
            bgLight: preset.bgLight,
            weight: 1,
            isSent: false,
          };
        });
        return [...prev, ...added];
      } else {
        return prev.slice(0, validCount);
      }
    });
  };

  // 참가자 이름 수정 핸들러
  const handleUpdateMemberName = (id: string, newName: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
  };

  // ---------------------------------------------------------------------------
  // 2. [인원정산] 상태 및 로직
  // ---------------------------------------------------------------------------
  const [amount, setAmount] = useState<string>('84000');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const settlementSummary = useMemo(() => {
    const total = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    const count = members.length;
    if (count === 0 || total === 0) {
      return { perPerson: 0, remainder: 0, total: 0 };
    }
    const perPerson = Math.floor(total / count / 100) * 100; // 100원 단위 절사
    const remainder = total - perPerson * count;
    return { perPerson, remainder, total };
  }, [amount, members.length]);

  const toggleSentStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSent: !m.isSent } : m))
    );
  };

  // 7. 정산 만원 프리셋 슬라이드 드래그/휠 스크롤 Ref & 네이티브 논패시브 휠 리스너 (페이지 스크롤 전파 원천 차단)
  const presetScrollRef = React.useRef<HTMLDivElement>(null);
  const isDraggingPresetRef = React.useRef(false);
  const presetStartXRef = React.useRef(0);
  const presetScrollLeftRef = React.useRef(0);

  useEffect(() => {
    const el = presetScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY !== 0) {
        el.scrollLeft += e.deltaY;
      } else if (e.deltaX !== 0) {
        el.scrollLeft += e.deltaX;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
    };
  }, []);

  const handlePresetMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingPresetRef.current = true;
    if (presetScrollRef.current) {
      presetStartXRef.current = e.pageX - presetScrollRef.current.offsetLeft;
      presetScrollLeftRef.current = presetScrollRef.current.scrollLeft;
    }
  };

  const handlePresetMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPresetRef.current || !presetScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - presetScrollRef.current.offsetLeft;
    const walk = (x - presetStartXRef.current) * 1.5;
    presetScrollRef.current.scrollLeft = presetScrollLeftRef.current - walk;
  };

  const handlePresetMouseUpOrLeave = () => {
    isDraggingPresetRef.current = false;
  };

  const handlePresetTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isDraggingPresetRef.current = true;
    if (presetScrollRef.current && e.touches.length > 0) {
      presetStartXRef.current = e.touches[0].pageX - presetScrollRef.current.offsetLeft;
      presetScrollLeftRef.current = presetScrollRef.current.scrollLeft;
    }
  };

  const handlePresetTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingPresetRef.current || !presetScrollRef.current || e.touches.length === 0) return;
    const x = e.touches[0].pageX - presetScrollRef.current.offsetLeft;
    const walk = (x - presetStartXRef.current) * 1.5;
    presetScrollRef.current.scrollLeft = presetScrollLeftRef.current - walk;
  };

  // 7. 정산 금액 만원/천원 증감 핸들러
  const handleAdjustAmount = (delta: number) => {
    const cur = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    const next = Math.max(0, cur + delta);
    setAmount(next > 0 ? next.toString() : '');
  };

  const handleCopySettlementText = () => {
    const text = `[모아보고 인원정산]\n총 금액: ${settlementSummary.total.toLocaleString()}원 (${members.length}명)\n1인당 송금액: ${settlementSummary.perPerson.toLocaleString()}원\n함께 정산해요!`;
    navigator.clipboard?.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // 3. [사다리타기] 상태 및 로직 (하나씩 순차 이동 애니메이션 & 동기화 좌표)
  // ---------------------------------------------------------------------------
  const [useLadderWeight, setUseLadderWeight] = useState<boolean>(false);
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [ladderGoals, setLadderGoals] = useState<{ text: string; icon: string }[]>(() =>
    generateDefaultLadderGoals(5, 1)
  );
  const [ladderResult, setLadderResult] = useState<{
    [memberId: string]: { goalIndex: number; text: string; icon: string; isWinner: boolean };
  } | null>(null);

  // 4. 하나씩 순차 이동 애니메이션 상태
  const [isLadderTracing, setIsLadderTracing] = useState<boolean>(false);
  const [activeTracingMemberIndex, setActiveTracingMemberIndex] = useState<number | null>(null);
  const [currentTracerPosition, setCurrentTracerPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentTracedTrail, setCurrentTracedTrail] = useState<{ x: number; y: number }[]>([]);
  const [revealedGoals, setRevealedGoals] = useState<{ [memberId: string]: boolean }>({});

  // 3. 사다리 속도 조절 5단계 옵션 (괄호 표기 제거)
  const LADDER_SPEED_OPTIONS = [
    { value: 0.5, label: '0.5x', interval: 40 },
    { value: 0.75, label: '0.75x', interval: 27 },
    { value: 1.0, label: '1.0x', interval: 20 },
    { value: 1.25, label: '1.25x', interval: 16 },
    { value: 1.5, label: '1.5x', interval: 13 },
  ];
  const [ladderSpeed, setLadderSpeed] = useState<number>(1.0);

  // 4. [수치조절 바 휠이벤트] 배경 및 페이지 스크롤 전파 차단 + 값 증감 제어 훅
  const useWheelControl = (onAdjust: (delta: number) => void) => {
    const elRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(onAdjust);
    callbackRef.current = onAdjust;

    useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
          callbackRef.current(1);
        } else if (e.deltaY > 0) {
          callbackRef.current(-1);
        }
      };
      const onStopPropagation = (e: Event) => {
        e.stopPropagation();
      };

      el.addEventListener('wheel', onWheel, { passive: false, capture: true });
      el.addEventListener('pointerdown', onStopPropagation, { capture: true });
      el.addEventListener('pointermove', onStopPropagation, { capture: true });
      el.addEventListener('touchstart', onStopPropagation, { capture: true, passive: true });
      el.addEventListener('touchmove', onStopPropagation, { capture: true, passive: true });
      return () => {
        el.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
        el.removeEventListener('pointerdown', onStopPropagation, { capture: true } as EventListenerOptions);
        el.removeEventListener('pointermove', onStopPropagation, { capture: true } as EventListenerOptions);
        el.removeEventListener('touchstart', onStopPropagation, { capture: true } as EventListenerOptions);
        el.removeEventListener('touchmove', onStopPropagation, { capture: true } as EventListenerOptions);
      };
    }, []);
    return elRef;
  };

  const settleMemberSliderRef = useWheelControl((delta) => {
    handleUpdateMemberCount(memberCount + delta);
  });

  const ladderMemberSliderRef = useWheelControl((delta) => {
    handleUpdateMemberCount(memberCount + delta);
  });

  const ladderWinnerSliderRef = useWheelControl((delta) => {
    setWinnerCount((prev) => Math.max(1, Math.min(memberCount - 1, prev + delta)));
  });

  // 1 & 2 & 3. 발자국 추적용 ElmSld03 Ref 및 목적 도착 1초 팝업 & 일시정지 제어 상태
  const ladderSliderRef = useRef<HTMLDivElement>(null);

  // 4-C. 사다리 카메라 추적: 출발/도착 시 안전 앵커링 (메인 이동은 애니메이션 루프 내 선제 예측 추적)
  const [arrivalPopup, setArrivalPopup] = useState<{
    member: Participant;
    result: { goalIndex: number; text: string; icon: string; isWinner: boolean };
    memberIndex: number;
    totalMembers: number;
    nextMemberName?: string;
  } | null>(null);
  const [isArrivalPaused, setIsArrivalPaused] = useState<boolean>(false);
  const [arrivalCountdown, setArrivalCountdown] = useState<number>(100);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const arrivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrivalIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextStepActionRef = useRef<(() => void) | null>(null);

  // 언마운트 시 사다리 타이머 및 인터벌 정리
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
    };
  }, []);

  // 목표 칸 수 및 당첨인원 실시간 동기화: winnerCount 변경 시 다중 당첨 슬롯(🎁) 즉각 반영
  useEffect(() => {
    const needed = members.length;
    const safeWinners = Math.max(1, Math.min(needed - 1, winnerCount));
    setLadderGoals(generateDefaultLadderGoals(needed, safeWinners));
    if (winnerCount >= needed) {
      setWinnerCount(Math.max(1, needed - 1));
    }
  }, [members.length, winnerCount]);

  // 가중치 업데이트 함수
  const updateMemberWeight = (id: string, delta: number, isAbsolute = false) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentW = m.weight || 1;
        const target = isAbsolute ? delta : currentW + delta;
        return { ...m, weight: Math.max(1, Math.min(10, target)) };
      })
    );
  };

  // 3-1. 사다리 주사위 셔플 시드 및 알림 상태
  const [ladderSeed, setLadderSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);
  const [shuffleNotice, setShuffleNotice] = useState<string | null>(null);
  const [revealedGoalCols, setRevealedGoalCols] = useState<{
    [col: number]: { memberName: string; avatar: string; isWinner: boolean };
  }>({});

  // 기본 사다리 가로줄 동적 생성
  const ladderRungs = useMemo(() => {
    return generateLadderRungs(members.length, ladderSeed);
  }, [members.length, ladderSeed]);

  // 주사위 셔플 (사다리 가로줄 균형 무작위 재배치)
  const handleShuffleLadder = () => {
    if (isLadderTracing) return;
    setIsDiceRolling(true);
    setLadderSeed((prev) => prev + Math.floor(Math.random() * 500000) + 1);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    setShuffleNotice('🎲 주사위를 굴려 모든 사다리 경로가 완벽한 균형으로 새롭게 재배치되었습니다!');
    setTimeout(() => {
      setIsDiceRolling(false);
    }, 450);
    setTimeout(() => {
      setShuffleNotice(null);
    }, 3000);
  };

  // 목표(당첨/통과) 순서 무작위 셔플
  const handleShuffleGoals = () => {
    if (isLadderTracing) return;
    setLadderGoals((prev) => [...prev].sort(() => Math.random() - 0.5));
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    setShuffleNotice('🎯 당첨 및 통과 목표 위치가 무작위로 섞였습니다!');
    setTimeout(() => {
      setShuffleNotice(null);
    }, 2500);
  };

  // 3 & 4. 정확한 X, Y 웨이포인트 경로 계산 및 부드러운 스텝 보간 (LADDER_COL_WIDTH = 84px)
  const computeLadderPaths = (customRungs?: { col: number; row: number }[]) => {
    const cols = members.length;
    const rows = 10;
    const activeRungs = customRungs || ladderRungs;
    const results: { [id: string]: { goalIndex: number; text: string; icon: string; isWinner: boolean } } = {};
    const paths: { [id: string]: { x: number; y: number }[] } = {};

    const colWidth = LADDER_COL_WIDTH;
    const startY = 12;
    const endY = 244;
    const getX = (col: number) => col * colWidth + colWidth / 2;
    const getRungY = (r: number) => 28 + r * 22;

    members.forEach((member, startCol) => {
      let currentCol = startCol;
      const waypoints: { x: number; y: number }[] = [];

      waypoints.push({ x: getX(currentCol), y: startY });

      for (let r = 0; r < rows; r++) {
        const rungY = getRungY(r);
        waypoints.push({ x: getX(currentCol), y: rungY });

        // 오른쪽 다리가 있는가?
        const rightRung = activeRungs.some((item) => item.row === r && item.col === currentCol);
        if (rightRung) {
          currentCol += 1;
          waypoints.push({ x: getX(currentCol), y: rungY });
          continue;
        }

        // 왼쪽 다리가 있는가?
        const leftRung = activeRungs.some((item) => item.row === r && item.col === currentCol - 1);
        if (leftRung) {
          currentCol -= 1;
          waypoints.push({ x: getX(currentCol), y: rungY });
          continue;
        }
      }

      waypoints.push({ x: getX(currentCol), y: endY });

      // 부드러운 선형 보간점 생성 (초당 50프레임 대응 균일 거리 보간)
      const densePoints: { x: number; y: number }[] = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const steps = Math.max(4, Math.round(dist / 6)); // 6px 당 1스텝
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          densePoints.push({
            x: Math.round(p1.x + (p2.x - p1.x) * t),
            y: Math.round(p1.y + (p2.y - p1.y) * t),
          });
        }
      }
      densePoints.push(waypoints[waypoints.length - 1]);
      paths[member.id] = densePoints;

      const finalGoal = ladderGoals[currentCol] || { text: '통과 1', icon: '💨' };
      const isWinner = finalGoal.text.includes('선택') || finalGoal.text.includes('당첨') || finalGoal.icon === '🎁' || finalGoal.icon === '☕';
      results[member.id] = {
        goalIndex: currentCol,
        text: finalGoal.text,
        icon: finalGoal.icon,
        isWinner,
      };
    });

    return { results, paths };
  };

  // 4. 사다리 즉시 생략 및 최종 결과 바로 표시 (사다리 진행 중간 언제든 즉시 종료 지원)
  const handleSkipToResult = () => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (arrivalTimerRef.current) {
      clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = null;
    }
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current);
      arrivalIntervalRef.current = null;
    }
    nextStepActionRef.current = null;

    setArrivalPopup(null);
    setIsArrivalPaused(false);
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);

    const { results } = computeLadderPaths();
    const allRev: { [id: string]: boolean } = {};
    const allGoalCols: { [col: number]: { memberName: string; avatar: string; isWinner: boolean } } = {};
    members.forEach((m) => {
      allRev[m.id] = true;
      if (results[m.id]) {
        allGoalCols[results[m.id].goalIndex] = {
          memberName: m.name,
          avatar: m.avatar,
          isWinner: results[m.id].isWinner,
        };
      }
    });

    setRevealedGoals(allRev);
    setRevealedGoalCols(allGoalCols);
    setLadderResult(results);
  };

  // 기존 호환용 alias
  const handleSkipAllArrivals = handleSkipToResult;

  // 4-B. 사다리 실행 애니메이션: 부드럽게 한 명씩 이동 + 발자국 표시 (게임 실행 시 화면/스크롤 불필요 이동 차단)
  const handlePlayLadder = (skipTrace = false, customRungs?: { col: number; row: number }[]) => {
    if (skipTrace) {
      handleSkipToResult();
      return;
    }

    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (arrivalTimerRef.current) {
      clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = null;
    }
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current);
      arrivalIntervalRef.current = null;
    }
    setArrivalPopup(null);
    setIsArrivalPaused(false);

    const { results, paths } = computeLadderPaths(customRungs);

    setIsLadderTracing(true);
    setLadderResult(null);
    setCurrentTracedTrail([]);
    setRevealedGoals({});
    setRevealedGoalCols({});

    // 한 명씩 순차적으로 사다리 타기
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

      // 출발 참가자 위치로 카메라 가로 스크롤 선제 이동
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
      const trailHistory: { x: number; y: number }[] = [];

      let stepIdx = 0;
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = setInterval(() => {
        if (stepIdx < memberPoints.length) {
          const pt = memberPoints[stepIdx];
          setCurrentTracerPosition(pt);
          trailHistory.push(pt);
          setCurrentTracedTrail([...trailHistory]);

          // 한 템포 앞선 예측형 선제 카메라 추적 (Pre-emptive Lookahead Camera Tracking)
          // 마크가 도착하기 전에 6~8스텝 앞선 미래 경로를 미리 내다보고 화면을 선제적으로 이동
          if (ladderSliderRef.current) {
            const el = ladderSliderRef.current;
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll > 0) {
              const lookaheadIdx = Math.min(memberPoints.length - 1, stepIdx + 7);
              const futureX = memberPoints[lookaheadIdx]?.x ?? pt.x;
              // 이동 방향(좌 또는 우)으로 시야를 35px 더 선제 확보하여 마크가 항상 화면 중심에 안착되도록 리드
              const leadOffset = futureX > pt.x ? 35 : futureX < pt.x ? -35 : 0;
              const targetCenterScroll = futureX + leadOffset - el.clientWidth / 2;
              const clampedScroll = Math.max(0, Math.min(maxScroll, targetCenterScroll));

              // 프레임 틱 단위 신속 보간 (선제적으로 화면을 앞당겨 토큰보다 먼저 뷰포트 확보)
              const diff = clampedScroll - el.scrollLeft;
              if (Math.abs(diff) > 1.5) {
                el.scrollLeft += diff * 0.4;
              }
            }
          }

          stepIdx++;
        } else {
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }
          // 해당 참가자의 목표 결과 공개
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

          const proceedToNext = () => {
            if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
            if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
            setArrivalPopup(null);
            setIsArrivalPaused(false);
            setCurrentTracedTrail([]);
            if (isLast) {
              setIsLadderTracing(false);
              setActiveTracingMemberIndex(null);
              setCurrentTracerPosition(null);
              setLadderResult(results);
            } else {
              animateMember(nextIdx);
            }
          };

          nextStepActionRef.current = proceedToNext;

          // 2. 목적에 도착할 때 마다 목표를 화면에 1초 띄우고 이어서 진행 (일시정지 지원)
          setArrivalPopup({
            member: currentMember,
            result: currentResult,
            memberIndex: idx + 1,
            totalMembers: members.length,
            nextMemberName: !isLast ? members[nextIdx]?.name : undefined,
          });
          setIsArrivalPaused(false);
          setArrivalCountdown(100);

          const startTime = Date.now();
          const duration = 1000;

          arrivalIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
            setArrivalCountdown(remainingPct);
            if (elapsed >= duration) {
              if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
            }
          }, 25);

          arrivalTimerRef.current = setTimeout(() => {
            proceedToNext();
          }, duration);
        }
      }, LADDER_SPEED_OPTIONS.find((s) => s.value === ladderSpeed)?.interval || 20);
    };

    animateMember(0);
  };

  // 2. 다시사다리타기: 배열을 무작위로 새로 재배치한 후 즉시 실행
  const handlePlayAgain = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setLadderSeed(newSeed);
    const newRungs = generateLadderRungs(members.length, newSeed);
    handlePlayLadder(false, newRungs);
  };

  // 3. 목표 표시 팝업 일시정지 / 이어하기 제어 함수
  const handleTogglePauseArrival = () => {
    if (!isArrivalPaused) {
      // 일시정지: 1초 타이머 중지
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
      setIsArrivalPaused(true);
    } else {
      // 이어하기 (계속 진행)
      if (nextStepActionRef.current) {
        nextStepActionRef.current();
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 4. [룰렛] 상태 및 로직
  // ---------------------------------------------------------------------------
  const [useRouletteWeight, setUseRouletteWeight] = useState<boolean>(false);
  const [rouletteRotation, setRouletteRotation] = useState<number>(0);
  const [rouletteTransitionDuration, setRouletteTransitionDuration] = useState<number>(3000);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedTagger, setSelectedTagger] = useState<Participant | null>(null);
  
  // [중복제거 튜닝 1] 당첨자 제외 모드 & 제외된 인원 보관함
  const [excludeWinnerMode, setExcludeWinnerMode] = useState<boolean>(false);
  const [excludedWinners, setExcludedWinners] = useState<Participant[]>([]);

  // [중복제거 튜닝 2] 중복 참가자 이름 감지
  const duplicateNameCount = useMemo(() => {
    const nameMap: Record<string, number> = {};
    members.forEach((m) => {
      const trimmed = m.name.trim();
      nameMap[trimmed] = (nameMap[trimmed] || 0) + 1;
    });
    return Object.values(nameMap).filter((cnt) => cnt > 1).length;
  }, [members]);

  // 중복 참가자 이름 원터치 넘버링 정리
  const handleDeduplicateNames = () => {
    const seen: Record<string, number> = {};
    setMembers((prev) =>
      prev.map((m) => {
        const base = m.name.replace(/\s*\(\d+\)$/, '').trim() || '참가자';
        seen[base] = (seen[base] || 0) + 1;
        const newName = seen[base] > 1 ? `${base} (${seen[base]})` : base;
        return { ...m, name: newName };
      })
    );
  };

  // 제외된 당첨자 복원
  const handleRestoreExcludedWinners = () => {
    if (excludedWinners.length === 0) return;
    setMembers((prev) => [...prev, ...excludedWinners]);
    setMemberCount((prev) => prev + excludedWinners.length);
    setExcludedWinners([]);
    setSelectedTagger(null);
  };

  const totalRouletteWeight = useMemo(() => {
    if (!useRouletteWeight) return members.length;
    return members.reduce((sum, m) => sum + (m.weight || 1), 0);
  }, [members, useRouletteWeight]);

  const rouletteSlices = useMemo(() => {
    let currentAngle = 0;
    const slices = members.map((member) => {
      const weight = useRouletteWeight ? (member.weight || 1) : 1;
      const angle = (weight / Math.max(1, totalRouletteWeight)) * 360;
      const slice = {
        member,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        angle,
      };
      currentAngle += angle;
      return slice;
    });
    return slices;
  }, [members, useRouletteWeight, totalRouletteWeight]);

  // [휠 튜닝 & 중복제거] 룰렛 회전 코어 함수
  const handleSpinRoulette = (skip = false, overrideChosen?: Participant) => {
    if (isSpinning || members.length === 0) return;
    setSelectedTagger(null);

    let chosen = overrideChosen || members[0];
    if (!overrideChosen) {
      let rand = Math.random() * totalRouletteWeight;
      for (const m of members) {
        const w = useRouletteWeight ? (m.weight || 1) : 1;
        if (rand <= w) {
          chosen = m;
          break;
        }
        rand -= w;
      }
    }

    if (skip) {
      setIsSpinning(true);
      setRouletteTransitionDuration(500);
      const chosenSlice = rouletteSlices.find((s) => s.member.id === chosen.id);
      const sliceMidAngle = chosenSlice ? (chosenSlice.startAngle + chosenSlice.endAngle) / 2 : 180;
      
      const targetBase = 270 - sliceMidAngle;
      const currentNorm = ((rouletteRotation % 360) + 360) % 360;
      let diff = targetBase - currentNorm;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      
      const nextRotation = rouletteRotation + diff;
      setRouletteRotation(nextRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setSelectedTagger(chosen);

        // 당첨자 자동 제외 모드가 켜져 있는 경우 (2명 초과 시만 안전 자동 제외)
        if (excludeWinnerMode && members.length > 2) {
          setExcludedWinners((prev) => [...prev, chosen]);
          setMembers((prev) => prev.filter((m) => m.id !== chosen.id));
          setMemberCount((prev) => Math.max(2, prev - 1));
        }
      }, 500);
      return;
    }

    setIsSpinning(true);
    setRouletteTransitionDuration(3000);
    const chosenSlice = rouletteSlices.find((s) => s.member.id === chosen.id);
    const sliceMidAngle = chosenSlice ? (chosenSlice.startAngle + chosenSlice.endAngle) / 2 : 180;
    const targetDeg = 360 * 6 + (270 - sliceMidAngle);

    setRouletteRotation((prev) => prev + targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedTagger(chosen);

      // 당첨자 자동 제외 모드가 켜져 있는 경우 (2명 초과 시만 안전 자동 제외)
      if (excludeWinnerMode && members.length > 2) {
        setExcludedWinners((prev) => [...prev, chosen]);
        setMembers((prev) => prev.filter((m) => m.id !== chosen.id));
        setMemberCount((prev) => Math.max(2, prev - 1));
      }
    }, 3000);
  };


  // [중복제거 튜닝 3] 당첨자 수동 제외 후 즉시 다음 룰렛 돌리기
  const handleExcludeWinnerAndSpinAgain = () => {
    if (!selectedTagger) return;
    const winner = selectedTagger;
    if (members.length <= 2) {
      alert('룰렛 최소 참여 인원은 2명입니다. 더 이상 제외할 수 없습니다.');
      return;
    }
    const remaining = members.filter((m) => m.id !== winner.id);
    setExcludedWinners((prev) => [...prev, winner]);
    setMembers(remaining);
    setMemberCount(remaining.length);
    setSelectedTagger(null);
  };

  // 1. 테마별 배경/텍스트 클래스 매핑 (여명 블루: 은은하고 산뜻한 파스텔 블루 톤)
  const containerThemeClass = resolvedTheme === 'dawn'
    ? 'bg-[#e4effc] text-[#0d2746]'
    : isDark
    ? 'bg-[#121214] text-[#f4f4f5]'
    : 'bg-slate-50 text-slate-900';

  const cardThemeClass = resolvedTheme === 'dawn'
    ? 'bg-[#f0f7ff] border-[#aed2f8] shadow-sm'
    : isDark
    ? 'bg-[#1a1a1e] border-[#27272a]'
    : 'bg-white border-slate-200';

  const groupThemeClass = resolvedTheme === 'dawn'
    ? 'border-[#9bc4f5] bg-[#deecfb]'
    : isDark
    ? 'border-indigo-900/60 bg-[#151518]/80'
    : 'border-indigo-200/90 bg-slate-50/50';

  return (
    <div className={`w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen transition-colors ${containerThemeClass}`}>
      {/* ---------------------------------------------------------------------
          Top Hero Header
          --------------------------------------------------------------------- */}
      <header
        className={`p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border transition-all ${
          resolvedTheme === 'dawn'
            ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 border-blue-400/40 shadow-blue-500/10'
            : 'bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 border-slate-800'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                resolvedTheme === 'dawn'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
              }`}
            >
              SCR-GNT-01 • 게스트 홈
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            모아서 분석하고 한눈에 보고! <span className={resolvedTheme === 'dawn' ? 'text-sky-200' : 'text-indigo-400'}>모아보고</span>
          </h1>
          <p className="text-sm max-w-xl text-slate-200">
            가입 없이도 인원정산과 모임 게임을 즉시 즐기세요. 로그인 시 1인 다중 가계부와 당번·목표·용돈 라이프 서비스를 연동할 수 있습니다.
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
                resolvedTheme === 'dawn' ? 'bg-blue-100 text-blue-700' : isDark ? 'bg-indigo-950/60 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                모임 정산 & 파티 게임
              </h2>
              <p className={`text-xs mt-0.5 ${resolvedTheme === 'dawn' ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                원하는 게임 탭을 선택하고 인원수와 옵션을 설정해 보세요.
              </p>
            </div>
          </div>

          {/* 고주목도 세그먼트 탭 */}
          <div
            className={`flex items-center p-1.5 rounded-2xl border shadow-inner ${
              resolvedTheme === 'dawn' ? 'bg-[#d5e7f9] border-[#aed2f8]' : isDark ? 'bg-[#151518] border-[#27272a]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setGameType('SPLIT')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                gameType === 'SPLIT'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-400 hover:text-white font-semibold'
              }`}
            >
              <span>⚡</span>
              <span>인원정산</span>
            </button>
            <button
              type="button"
              onClick={() => setGameType('LADDER')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                gameType === 'LADDER'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-400 hover:text-white font-semibold'
              }`}
            >
              <span>🪜</span>
              <span>사다리</span>
            </button>
            <button
              type="button"
              onClick={() => setGameType('ROULETTE')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                gameType === 'ROULETTE'
                  ? resolvedTheme === 'dawn'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : resolvedTheme === 'dawn'
                  ? 'text-blue-800 hover:text-blue-950 font-semibold'
                  : 'text-slate-400 hover:text-white font-semibold'
              }`}
            >
              <span>🎯</span>
              <span>룰렛</span>
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
                {gameType === 'SPLIT' && '인원정산 플레이 존'}
                {gameType === 'LADDER' && '사다리타기 플레이 존'}
                {gameType === 'ROULETTE' && '룰렛 플레이 존'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              참여 인원: {memberCount}명
            </span>
          </div>

          {/* -----------------------------------------------------------------
              인원정산
              ----------------------------------------------------------------- */}
          {gameType === 'SPLIT' && (
            <div className="space-y-6">
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border ${
                  resolvedTheme === 'dawn' ? 'bg-[#f0f7ff] border-[#bfdbfe]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {/* 금액 입력 & 만원/천원 증감 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-indigo-400" />
                      <span>총 결제 금액 (원)</span>
                    </label>
                    {amount && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ₩{parseInt(amount.replace(/[^0-9]/g, '') || '0', 10).toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <ElmInp01
                    value={amount}
                    onChange={(val) => setAmount(val.replace(/[^0-9]/g, ''))}
                    placeholder="예: 84000"
                    type="text"
                    inputMode="numeric"
                    lang="ko"
                    onFocus={(e) => e.target.select()}
                  />
                  {/* 만원/천원 증감 퀵 인디케이터 (PC·태블릿·모바일 통일: 1행 인디케이터+초기화 / 2행 만원단위 슬라이드 휠 칩) */}
                  <div className="flex flex-col gap-2 pt-1 w-full overflow-hidden">
                    {/* 1행: 좌측 [+ 만원 -] [+ 천원 -] 인디케이터 & 우측 초기화 버튼 */}
                    <div className="flex items-center justify-between gap-2 w-full shrink-0">
                      {/* 좌측 인디케이터 그룹 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 만원 인디케이터 */}
                        <div
                          className={`inline-flex items-center rounded-lg border overflow-hidden shadow-2xs ${
                            resolvedTheme === 'dawn'
                              ? 'bg-blue-100/80 border-blue-300 text-blue-900'
                              : isDark
                              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(10000)}
                            className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                            title="1만원 증가"
                          >
                            + 만원
                          </button>
                          <div className="w-[1px] h-3.5 bg-current opacity-20" />
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(-10000)}
                            disabled={(parseInt(amount.replace(/[^0-9]/g, '') || '0', 10)) < 10000}
                            className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer"
                            title="1만원 감소"
                          >
                            -
                          </button>
                        </div>
                        {/* 천원 인디케이터 */}
                        <div
                          className={`inline-flex items-center rounded-lg border overflow-hidden shadow-2xs ${
                            resolvedTheme === 'dawn'
                              ? 'bg-sky-100/80 border-sky-300 text-sky-900'
                              : isDark
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                              : 'bg-slate-100 border-slate-300 text-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(1000)}
                            className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                            title="1천원 증가"
                          >
                            + 천원
                          </button>
                          <div className="w-[1px] h-3.5 bg-current opacity-20" />
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(-1000)}
                            disabled={(parseInt(amount.replace(/[^0-9]/g, '') || '0', 10)) < 1000}
                            className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer"
                            title="1천원 감소"
                          >
                            -
                          </button>
                        </div>
                      </div>

                      {/* 우측 초기화 버튼 */}
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setAmount('')}
                          disabled={!amount}
                          className="px-2.5 py-1 text-xs rounded-lg border text-rose-500 border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer font-medium whitespace-nowrap"
                          title="입력 금액 초기화"
                        >
                          초기화
                        </button>
                      </div>
                    </div>

                    {/* 2행: 만원단위 슬라이드드래그휠 영역 (PC·태블릿·모바일 통일 전폭 w-full) */}
                    <div
                      ref={presetScrollRef}
                      onMouseDown={handlePresetMouseDown}
                      onMouseMove={handlePresetMouseMove}
                      onMouseUp={handlePresetMouseUpOrLeave}
                      onMouseLeave={handlePresetMouseUpOrLeave}
                      onTouchStart={handlePresetTouchStart}
                      onTouchMove={handlePresetTouchMove}
                      onTouchEnd={handlePresetMouseUpOrLeave}
                      style={{ touchAction: 'pan-x' }}
                      className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      title="마우스 휠 또는 좌우 드래그로 탐색할 수 있습니다."
                    >
                      {[
                        { label: '1만원', val: 10000 },
                        { label: '2만원', val: 20000 },
                        { label: '3만원', val: 30000 },
                        { label: '5만원', val: 50000 },
                        { label: '7만원', val: 70000 },
                        { label: '8만원', val: 80000 },
                        { label: '10만원', val: 100000 },
                        { label: '20만원', val: 200000 },
                        { label: '30만원', val: 300000 },
                        { label: '50만원', val: 500000 },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleAdjustAmount(chip.val)}
                          className={`shrink-0 px-2.5 py-1 text-xs rounded-lg border font-semibold whitespace-nowrap transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
                            resolvedTheme === 'dawn'
                              ? 'bg-white/90 border-blue-200 text-blue-900 hover:bg-blue-50 hover:border-blue-400'
                              : isDark
                              ? 'bg-zinc-800/90 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-indigo-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                          }`}
                        >
                          +{chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* 정산 인원수 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>정산 인원수 (인원 제한 없음)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="2"
                        value={memberCount}
                        onChange={(e) => handleUpdateMemberCount(Number(e.target.value) || 2)}
                        className={`w-14 text-center py-0.5 px-1 text-xs font-bold rounded-md border ${
                          resolvedTheme === 'dawn'
                            ? 'bg-white border-[#bfdbfe] text-blue-700'
                            : isDark
                            ? 'bg-[#151518] border-[#3f3f46] text-indigo-400'
                            : 'bg-white border-slate-200 text-indigo-600'
                        }`}
                      />
                      <span className="text-xs text-slate-500">명</span>
                    </div>
                  </div>

                  <div
                    ref={settleMemberSliderRef}
                    className="flex items-center gap-2"
                    title="마우스 휠을 굴려 인원수를 조절할 수 있습니다"
                  >
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberCount(memberCount - 1)}
                      disabled={memberCount <= 2}
                      className={`p-2 rounded-lg border disabled:opacity-40 transition-all cursor-pointer ${
                        resolvedTheme === 'dawn'
                          ? 'bg-white border-[#bfdbfe] text-blue-700 hover:bg-blue-50'
                          : isDark
                          ? 'bg-[#27272a] border-[#3f3f46] text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="2"
                      max={Math.max(20, memberCount)}
                      value={memberCount}
                      onChange={(e) => handleUpdateMemberCount(Number(e.target.value))}
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      style={{ touchAction: 'pan-x' }}
                      className="flex-1 accent-indigo-600 cursor-ew-resize"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberCount(memberCount + 1)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        resolvedTheme === 'dawn'
                          ? 'bg-white border-[#bfdbfe] text-blue-700 hover:bg-blue-50'
                          : isDark
                          ? 'bg-[#27272a] border-[#3f3f46] text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 배정된 캐릭터 아바타 */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 max-h-28 overflow-y-auto pr-1">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${m.bgLight} ${m.color}`}
                      >
                        <span>{m.avatar}</span>
                        <input
                          type="text"
                          lang="ko"
                          value={m.name}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                          className="w-16 bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 정산 계산 결과 인터랙티브 뷰 */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  resolvedTheme === 'dawn'
                    ? 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-[#bfdbfe]'
                    : isDark
                    ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#1a1a1e] border-indigo-900/60'
                    : 'bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border-indigo-100'
                }`}
              >
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                    resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-indigo-100/80'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      스마트 정산 결과
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs text-slate-400">1인당</span>
                      <span className="text-2xl sm:text-3xl font-extrabold">
                        ₩{settlementSummary.perPerson.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">원</span>
                      {settlementSummary.remainder > 0 && (
                        <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          (자투리 {settlementSummary.remainder}원 제외)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySettlementText}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
                  >
                    {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotice ? '메시지 복사완료!' : '송금 요청문구 복사'}</span>
                  </button>
                </div>

                {/* 참가자별 송금 체크 인터랙티브 카드 그리드 */}
                <div>
                  <p className="text-xs font-bold mb-2.5 text-slate-400">
                    참가자별 송금 확인 (클릭하여 완료 토글):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSentStatus(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          m.isSent
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                            : resolvedTheme === 'dawn'
                            ? 'bg-white border-[#bfdbfe] hover:border-blue-400 text-slate-800'
                            : isDark
                            ? 'bg-[#1a1a1e] border-[#27272a] hover:border-indigo-400 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg p-1.5 rounded-lg bg-black/20">{m.avatar}</span>
                          <div className="truncate">
                            <p className={`text-xs font-bold ${m.isSent ? 'line-through text-slate-500' : ''}`}>
                              {m.name}
                            </p>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              ₩{settlementSummary.perPerson.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                        <span className={`p-1 rounded-full text-xs ${m.isSent ? 'bg-emerald-600 text-white' : 'bg-black/20 text-slate-500'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              사다리타기 (2. +5인 버튼 제거, 3. 폭 완벽 일치 & 줄바꿈, 4. 부드러운 하나씩 이동)
              ----------------------------------------------------------------- */}
          {gameType === 'LADDER' && (
            <div className="space-y-6">
              {/* 설정 패널 (2. +5인 버튼 제거 완료) */}
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  resolvedTheme === 'dawn' ? 'bg-[#f0f7ff] border-[#bfdbfe]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 참여 인원수 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">참여 인원수 (10인 기본 + 확장가능)</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="2"
                          value={memberCount}
                          onChange={(e) => handleUpdateMemberCount(Number(e.target.value) || 2)}
                          className={`w-14 text-center py-0.5 px-1 text-xs font-bold rounded-md border ${
                            resolvedTheme === 'dawn'
                              ? 'bg-white border-[#bfdbfe] text-blue-700'
                              : isDark
                              ? 'bg-[#151518] border-[#3f3f46] text-indigo-400'
                              : 'bg-white border-slate-200 text-indigo-600'
                          }`}
                        />
                        <span className="text-xs text-indigo-400 font-extrabold">명</span>
                      </div>
                    </div>
                    <div
                      ref={ladderMemberSliderRef}
                      className="flex items-center gap-2"
                      title="마우스 휠을 굴려 참여 인원수를 조절할 수 있습니다"
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateMemberCount(memberCount - 1)}
                        disabled={memberCount <= 2}
                        className="p-2 rounded-lg border disabled:opacity-40 bg-black/20 hover:bg-black/30 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="2"
                        max={Math.max(10, memberCount)}
                        value={memberCount}
                        onChange={(e) => handleUpdateMemberCount(Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ touchAction: 'pan-x' }}
                        className="flex-1 accent-indigo-600 cursor-ew-resize"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateMemberCount(memberCount + 1)}
                        className="p-2 rounded-lg border bg-black/20 hover:bg-black/30 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 선택 인원수 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">선택 인원수</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max={memberCount - 1}
                          value={winnerCount}
                          onChange={(e) => setWinnerCount(Math.max(1, Math.min(memberCount - 1, Number(e.target.value) || 1)))}
                          className={`w-14 text-center py-0.5 px-1 text-xs font-bold rounded-md border ${
                            resolvedTheme === 'dawn'
                              ? 'bg-white border-[#bfdbfe] text-rose-700'
                              : isDark
                              ? 'bg-[#151518] border-[#3f3f46] text-rose-400'
                              : 'bg-white border-slate-200 text-rose-600'
                          }`}
                        />
                        <span className="text-xs text-rose-400 font-extrabold">명</span>
                      </div>
                    </div>
                    <div
                      ref={ladderWinnerSliderRef}
                      className="flex items-center gap-2"
                      title="마우스 휠을 굴려 선택 인원수를 조절할 수 있습니다"
                    >
                      <button
                        type="button"
                        onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
                        disabled={winnerCount <= 1}
                        className="p-2 rounded-lg border disabled:opacity-40 bg-black/20 hover:bg-black/30 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max={Math.max(10, memberCount - 1)}
                        value={winnerCount}
                        onChange={(e) => setWinnerCount(Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ touchAction: 'pan-x' }}
                        className="flex-1 accent-rose-600 cursor-ew-resize"
                      />
                      <button
                        type="button"
                        onClick={() => setWinnerCount(Math.min(memberCount - 1, winnerCount + 1))}
                        disabled={winnerCount >= memberCount - 1}
                        className="p-2 rounded-lg border disabled:opacity-40 bg-black/20 hover:bg-black/30 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 가중치 설정 & 이름수정 */}
                <div
                  className={`pt-2 border-t ${
                    resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-slate-200/80'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useLadderWeight}
                      onChange={(e) => setUseLadderWeight(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm"
                    />
                    <span className="text-xs font-bold">확률 가중치 및 참가자 이름 설정</span>
                  </label>

                  {useLadderWeight && (
                    <div
                      className={`mt-3 p-3 rounded-lg border space-y-2.5 ${
                        resolvedTheme === 'dawn' ? 'bg-white border-[#bfdbfe]' : isDark ? 'bg-[#151518] border-[#27272a]' : 'bg-white border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>참가자 이름 수정 & 가중치 증감</span>
                        <span className="text-indigo-400 font-semibold">가중치 비율</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {members.map((m) => {
                          const totalW = members.reduce((s, x) => s + (x.weight || 1), 0);
                          const pct = Math.round(((m.weight || 1) / totalW) * 100);
                          return (
                            <div
                              key={m.id}
                              className="flex items-center justify-between p-2 rounded-lg border gap-2 bg-black/10"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="text-base">{m.avatar}</span>
                                <input
                                  type="text"
                                  lang="ko"
                                  inputMode="text"
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  value={m.name}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                                  className="w-20 sm:w-24 px-1.5 py-0.5 text-xs font-bold rounded border outline-none bg-transparent"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateMemberWeight(m.id, -1)}
                                  disabled={(m.weight || 1) <= 1}
                                  className="p-1 rounded border disabled:opacity-30 bg-black/20"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{m.weight || 1}</span>
                                <button
                                  type="button"
                                  onClick={() => updateMemberWeight(m.id, 1)}
                                  disabled={(m.weight || 1) >= 10}
                                  className="p-1 rounded border disabled:opacity-30 bg-black/20"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-extrabold text-indigo-400 w-9 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. 사다리 컨텐츠 통합 단일화 & 폭 완벽 일치 (LADDER_COL_WIDTH = 84px) & 텍스트 줄바꿈 */}
              <div
                className={`relative p-4 sm:p-5 rounded-2xl border-2 shadow-inner flex flex-col items-center overflow-hidden ${
                  resolvedTheme === 'dawn' ? 'bg-[#eaf3fd] border-[#aed2f8]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-white border-indigo-100/80'
                }`}
              >
                {/* 3-A. 사다리 제어 & 주사위 셔플 헤더 바 */}
                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3 px-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {shuffleNotice && (
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 break-keep animate-in fade-in">
                        {shuffleNotice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={handleShuffleGoals}
                      disabled={isLadderTracing}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shadow-xs active:scale-95 disabled:opacity-40"
                      title="당첨 및 통과 목표의 순서를 무작위로 재배치합니다"
                    >
                      <span className="text-sm">🎯</span>
                      <span className="whitespace-nowrap">목표 재배치</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleLadder}
                      disabled={isLadderTracing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer shadow-xs active:scale-95 disabled:opacity-40"
                      title="사다리 가로줄을 새로운 무작위 배치로 재배치합니다"
                    >
                      <span
                        className="text-sm inline-block transition-transform duration-500"
                        style={{ transform: isDiceRolling ? 'rotate(360deg)' : 'rotate(0deg)' }}
                      >
                        🎲
                      </span>
                      <span className="whitespace-nowrap">사다리 재배치</span>
                    </button>
                  </div>
                </div>

                {/* 5. 슬라이드 드래그 휠: 선택한 사다리 DIV 영역에만 타겟팅 (발자국 카메라 스크롤 추적) */}
                <div className="w-full">
                  <ElmSld03 showNavButtons={false} stepWidth={LADDER_COL_WIDTH} externalRef={ladderSliderRef} className="w-full cursor-grab active:cursor-grabbing">
                    <div
                      className={`flex flex-col items-start select-none py-2 px-2 shrink-0 ${
                        members.length * LADDER_COL_WIDTH > 480 ? 'mx-0' : 'mx-auto'
                      }`}
                      style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                    >
                      {/* 1. 상단 참가자 아이콘 (폭 84px 고정, 텍스트 줄바꿈 textarea) */}
                      <div
                        className="flex items-end pb-2 pt-2 relative"
                        style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                      >
                        {members.map((m, idx) => {
                          const isOdd = idx % 2 === 1;
                          const isCurrentActive = activeTracingMemberIndex === idx;
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col items-center gap-1 shrink-0 transition-transform ${
                                isOdd ? 'translate-y-3' : 'translate-y-0'
                              }`}
                              style={{ width: `${LADDER_COL_WIDTH}px` }}
                            >
                              <span
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md border-2 ${
                                  m.bgLight
                                } ${isCurrentActive ? 'scale-125 ring-4 ring-indigo-500 animate-pulse' : ''}`}
                              >
                                {m.avatar}
                              </span>
                              {/* 3. 폭 맞추고 텍스트는 줄바꿈 지원 textarea (포커스온 전체선택) */}
                              <textarea
                                rows={2}
                                lang="ko"
                                value={m.name}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                                className="text-[11px] font-bold text-center w-[76px] bg-transparent outline-none resize-none overflow-hidden leading-tight break-words py-0.5 border-b border-transparent focus:border-indigo-500"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* 1-B. 기둥 번호 인디케이터 (1번, 2번...) */}
                      <div
                        className="flex items-center pb-1 pt-1 select-none"
                        style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                      >
                        {members.map((_, col) => (
                          <div
                            key={`col_num_${col}`}
                            className="flex justify-center"
                            style={{ width: `${LADDER_COL_WIDTH}px` }}
                          >
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200/90 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-300/50 dark:border-zinc-700/80">
                              {col + 1}번
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* 2. 중앙 SVG 사다리 선 (기둥 간격 LADDER_COL_WIDTH = 84px 완벽 일치) */}
                      <div
                        className="relative flex justify-center py-2"
                        style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                      >
                        <svg
                          width={members.length * LADDER_COL_WIDTH}
                          height={260}
                          className={`rounded-xl border shadow-inner ${
                            resolvedTheme === 'dawn'
                              ? 'bg-blue-50/70 border-blue-200'
                              : isDark
                              ? 'bg-[#151518] border-[#27272a]'
                              : 'bg-slate-50/80 border-slate-200/70'
                          }`}
                        >
                          {/* 세로 기둥선 및 상하단 캡 */}
                          {members.map((_, col) => {
                            const x = col * LADDER_COL_WIDTH + LADDER_COL_WIDTH / 2;
                            const pillarColor = resolvedTheme === 'dawn' ? '#3b82f6' : isDark ? '#52525b' : '#94a3b8';
                            const capColor = resolvedTheme === 'dawn' ? '#1d4ed8' : isDark ? '#71717a' : '#64748b';

                            return (
                              <g key={`v_${col}`}>
                                <line
                                  x1={x}
                                  y1={12}
                                  x2={x}
                                  y2={244}
                                  stroke={pillarColor}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                                <circle cx={x} cy={12} r="3.5" fill={capColor} />
                                <circle cx={x} cy={244} r="3.5" fill={capColor} />
                              </g>
                            );
                          })}

                          {/* 균등 분포 가로 발판 다리 (양 끝 리벳 결합 도트로 완성도 극대화) */}
                          {ladderRungs.map((rung, i) => {
                            const x1 = rung.col * LADDER_COL_WIDTH + LADDER_COL_WIDTH / 2;
                            const x2 = (rung.col + 1) * LADDER_COL_WIDTH + LADDER_COL_WIDTH / 2;
                            const y = 28 + rung.row * 22;
                            const rungColor = resolvedTheme === 'dawn' ? '#3b82f6' : isDark ? '#818cf8' : '#6366f1';
                            const rivetColor = resolvedTheme === 'dawn' ? '#1d4ed8' : isDark ? '#a5b4fc' : '#4f46e5';

                            return (
                              <g key={`rung_${i}`}>
                                <line
                                  x1={x1}
                                  y1={y}
                                  x2={x2}
                                  y2={y}
                                  stroke={rungColor}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                                <circle cx={x1} cy={y} r="3" fill={rivetColor} stroke="#ffffff" strokeWidth="1" />
                                <circle cx={x2} cy={y} r="3" fill={rivetColor} stroke="#ffffff" strokeWidth="1" />
                              </g>
                            );
                          })}

                          {/* 4. 부드러운 이동 궤적: 잔상 트레일 라인 */}
                          {isLadderTracing && currentTracedTrail.length > 1 && (
                            <polyline
                              points={currentTracedTrail.map((p) => `${p.x},${p.y}`).join(' ')}
                              fill="none"
                              stroke="#ec4899"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.85"
                            />
                          )}

                          {/* 1. 사다리 실행 시 아이콘 이동 발자국 (Footsteps) 추적 표시 */}
                          {isLadderTracing && currentTracedTrail.length > 3 && (
                            <g className="ladder-footsteps">
                              {currentTracedTrail.filter((_, i) => i % 4 === 0).map((pt, fi) => {
                                const isLeft = fi % 2 === 0;
                                return (
                                  <g key={`footstep_${fi}`} transform={`translate(${pt.x + (isLeft ? -4 : 4)}, ${pt.y})`}>
                                    <ellipse
                                      rx="2.6"
                                      ry="3.8"
                                      fill="#f43f5e"
                                      opacity={0.35 + (fi / currentTracedTrail.length) * 0.6}
                                      transform={isLeft ? 'rotate(-12)' : 'rotate(12)'}
                                    />
                                    <circle
                                      cx={isLeft ? -1.2 : 1.2}
                                      cy="-4.2"
                                      r="1.3"
                                      fill="#fb7185"
                                      opacity={0.45 + (fi / currentTracedTrail.length) * 0.55}
                                    />
                                  </g>
                                );
                              })}
                            </g>
                          )}

                          {/* 4. 실시간 이동 궤적: 한 명씩 부드럽게 이동하는 캐릭터 아바타 토큰 */}
                          {isLadderTracing && currentTracerPosition && activeTracingMemberIndex !== null && (
                            <g>
                              <circle
                                cx={currentTracerPosition.x}
                                cy={currentTracerPosition.y}
                                r="18"
                                fill="#ec4899"
                                opacity="0.3"
                                className="animate-ping"
                              />
                              <circle
                                cx={currentTracerPosition.x}
                                cy={currentTracerPosition.y}
                                r="13"
                                fill="#ec4899"
                                stroke="#ffffff"
                                strokeWidth="2.5"
                                className="filter drop-shadow-md"
                              />
                              <text
                                x={currentTracerPosition.x}
                                y={currentTracerPosition.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="12"
                              >
                                {members[activeTracingMemberIndex]?.avatar || '⭐'}
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>

                      {/* 3. 하단 대상 목표 아이콘 (폭 84px 고정 & 줄바꿈 textarea & 도착 참가자 뱃지) */}
                      <div
                        className="flex items-start pt-2 pb-3 relative"
                        style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                      >
                        {ladderGoals.slice(0, members.length).map((goal, idx) => {
                          const isOdd = idx % 2 === 1;
                          const landedMember = revealedGoalCols[idx];

                          return (
                            <div
                              key={`goal_${idx}`}
                              className={`flex flex-col items-center shrink-0 transition-transform ${
                                isOdd ? 'translate-y-3' : 'translate-y-0'
                              }`}
                              style={{ width: `${LADDER_COL_WIDTH}px` }}
                            >
                              {/* 도착자 실시간 뱃지 */}
                              {landedMember && (
                                <div
                                  className={`mb-1 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-xs animate-in zoom-in-95 duration-150 ${
                                    landedMember.isWinner
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                                      : 'bg-indigo-600 text-white'
                                  }`}
                                >
                                  <span>{landedMember.avatar}</span>
                                  <span className="truncate max-w-[45px]">{landedMember.memberName}</span>
                                </div>
                              )}

                              <div
                                className={`flex flex-col items-center gap-1 p-1 rounded-xl border w-[76px] transition-all ${
                                  landedMember
                                    ? landedMember.isWinner
                                      ? 'ring-2 ring-rose-500 scale-105 bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                                      : 'ring-2 ring-indigo-500 scale-105 bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                                    : resolvedTheme === 'dawn'
                                    ? 'bg-white border-[#bfdbfe] text-blue-900'
                                    : isDark
                                    ? 'bg-[#151518] border-[#27272a]'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <select
                                  value={goal.icon}
                                  onChange={(e) => {
                                    const icon = e.target.value;
                                    setLadderGoals((prev) =>
                                      prev.map((g, i) => (i === idx ? { ...g, icon } : g))
                                    );
                                  }}
                                  className="text-base rounded px-0.5 py-0.5 cursor-pointer border bg-transparent"
                                >
                                  {TARGET_ICONS.map((ic) => (
                                    <option key={ic} value={ic}>
                                      {ic}
                                    </option>
                                  ))}
                                </select>

                                {/* 3. 텍스트 줄바꿈 textarea (포커스 시 전체 선택 & 한글 자판) */}
                                <textarea
                                  rows={2}
                                  lang="ko"
                                  inputMode="text"
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  value={goal.text}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    setLadderGoals((prev) =>
                                      prev.map((g, i) => (i === idx ? { ...g, text } : g))
                                    );
                                  }}
                                  className="w-full text-center text-[10px] font-bold rounded px-0.5 py-0.5 border bg-transparent resize-none overflow-hidden break-words leading-tight"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ElmSld03>
                </div>

                {/* 실행 액션: 속도 조절 & 주사위 재배치 & 사다리 타기 vs 건너뛰기 (버튼 레이어 정책: 텍스트 줄바꿈 방지 및 버튼 단위 개행) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4 w-full">
                  {/* 3. 사다리그래프타기 버튼 앞 속도 조절 버튼 (2배 느린 0.5x부터 1.5배 빠른 1.5x까지 5단계 선택) */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold shrink-0 shadow-xs transition-colors ${
                      resolvedTheme === 'dawn'
                        ? 'bg-white border-blue-200 text-blue-900'
                        : isDark
                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <Gauge className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">속도</span>
                    <select
                      value={ladderSpeed}
                      onChange={(e) => setLadderSpeed(Number(e.target.value))}
                      disabled={isLadderTracing}
                      className="bg-transparent font-bold text-xs cursor-pointer focus:outline-hidden pr-0.5"
                    >
                      {LADDER_SPEED_OPTIONS.map((sp) => (
                        <option
                          key={sp.value}
                          value={sp.value}
                          className="text-slate-900 bg-white dark:text-white dark:bg-zinc-800"
                        >
                          {sp.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayLadder(false)}
                    disabled={isLadderTracing}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{isLadderTracing ? '사다리 타는 중...' : '사다리 그래프 타기'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipToResult}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                      isLadderTracing
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400 animate-pulse'
                        : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200'
                    }`}
                    title="사다리 타기 진행을 즉시 중단하고 최종 결과를 바로 확인합니다"
                  >
                    <FastForward className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {isLadderTracing ? '⚡ 즉시 결과 보기 (생략)' : '그래프 타기 생략'}
                    </span>
                  </button>
                </div>

                {/* 2 & 3. 목적에 도착할 때 마다 목표 화면 팝업 노출 (1초 카운트다운 후 자동 진행 & 일시정지 제어) */}
                {arrivalPopup && (
                  <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div
                      className={`w-full max-w-sm rounded-2xl p-5 border-2 shadow-2xl space-y-4 text-center transition-all ${
                        resolvedTheme === 'dawn'
                          ? 'bg-[#f0f7ff] border-[#aed2f8] text-[#0d2746]'
                          : isDark
                          ? 'bg-[#18181b] border-[#27272a] text-white'
                          : 'bg-white border-indigo-200 text-slate-900'
                      }`}
                    >
                      {/* 팝업 헤더 & 순번 인디케이터 */}
                      <div className="flex items-center justify-between border-b pb-2.5 text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <span>🚩</span>
                          <span>{arrivalPopup.memberIndex} / {arrivalPopup.totalMembers}명 도착!</span>
                        </span>
                        <span className={`text-[11px] font-semibold ${isArrivalPaused ? 'text-amber-500' : 'text-slate-400'}`}>
                          {isArrivalPaused ? '⏸️ 일시정지 상태' : '⏱️ 1초 후 자동 진행'}
                        </span>
                      </div>

                      {/* 주인공 및 도착 결과 */}
                      <div className="space-y-3 py-1">
                        <div className="flex items-center justify-center gap-2.5">
                          <span className="text-3xl p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 shadow-xs border">
                            {arrivalPopup.member.avatar}
                          </span>
                          <div className="text-left">
                            <h4 className="text-base font-extrabold leading-tight">
                              {arrivalPopup.member.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              사다리 완주 도착 완료!
                            </p>
                          </div>
                        </div>

                        {/* 도착한 목표 카드 */}
                        <div
                          className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 shadow-sm transition-all ${
                            arrivalPopup.result.isWinner
                              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-200 ring-2 ring-rose-400/30'
                              : resolvedTheme === 'dawn'
                              ? 'bg-blue-50/80 border-blue-200 text-slate-800'
                              : 'bg-slate-50 dark:bg-[#222227] border-slate-200 dark:border-[#2e2e34]'
                          }`}
                        >
                          <span className="text-4xl animate-bounce">
                            {arrivalPopup.result.icon}
                          </span>
                          <span className="text-lg font-black tracking-tight">
                            {arrivalPopup.result.text}
                          </span>
                          {arrivalPopup.result.isWinner ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-extrabold shadow-sm animate-pulse">
                              🎉 축하합니다! 당첨되었습니다!
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              도착 확인
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 1초 카운트다운 게이지 프로그레스 바 */}
                      <div className="space-y-1">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-75 ${
                              isArrivalPaused ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-400'
                            }`}
                            style={{ width: `${isArrivalPaused ? 100 : arrivalCountdown}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {isArrivalPaused
                            ? '⏸️ 일시정지 중입니다. 확인 후 계속 진행을 누르세요.'
                            : arrivalPopup.nextMemberName
                            ? `1초 후 '${arrivalPopup.nextMemberName}'님 차례로 이어집니다`
                            : '1초 후 최종 결과 집계로 이동합니다'}
                        </p>
                      </div>

                      {/* 3. 목표 표시 팝업에 일시정지 / 이어하기 제어 버튼 (버튼레이어 정책: 텍스트 줄바꿈 방지 및 너비 초과 시 버튼 단위 줄바꿈) */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                        <button
                          type="button"
                          onClick={handleTogglePauseArrival}
                          className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md whitespace-nowrap shrink-0 ${
                            isArrivalPaused
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                          }`}
                        >
                          {isArrivalPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span className="whitespace-nowrap">계속 진행 (다음)</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span className="whitespace-nowrap">일시정지</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (nextStepActionRef.current) nextStepActionRef.current();
                          }}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 flex items-center justify-center"
                        >
                          <span className="whitespace-nowrap">즉시 다음</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSkipAllArrivals}
                          className="py-2.5 px-3.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0 flex items-center justify-center gap-1"
                          title="사다리 즉시 종료 및 전체 결과 확인"
                        >
                          <FastForward className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">전체 건너뛰기</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 사다리 결과 오버레이 */}
                {ladderResult && (
                  <div
                    className={`absolute inset-0 z-30 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 ${
                      resolvedTheme === 'dawn'
                        ? 'bg-[#f0f7ff]/95 text-[#0d2746] border border-[#aed2f8]'
                        : isDark
                        ? 'bg-[#121214]/95 text-white'
                        : 'bg-white/95 text-slate-900'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setLadderResult(null)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-2 mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-extrabold border border-amber-500/30">
                        <Trophy className="w-4 h-4" />
                        <span>사다리타기 최종 결과</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold">
                        행운의 당첨자 & 결과 매칭
                      </h3>
                    </div>

                    {/* 2. 사다리 실행완료 화면 팝업: 가로 목록 및 너비 초과 시 줄바꿈 (1열 당첨자 / 2열 나머지) */}
                    <div className="w-full max-w-xl max-h-72 sm:max-h-80 overflow-y-auto space-y-4 px-1 py-1">
                      {(() => {
                        const winnerMembers = members.filter((m) => ladderResult[m.id]?.isWinner);
                        const otherMembers = members.filter((m) => !ladderResult[m.id]?.isWinner);

                        return (
                          <>
                            {/* 1열: 상단 당첨 이름표시된 아이콘 목록 */}
                            {winnerMembers.length > 0 && (
                              <div className="space-y-1.5 text-left">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                      🎉 당첨자 명단
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                      {winnerMembers.length}명
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">당첨 / 벌칙 대상</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {winnerMembers.map((m) => {
                                    const res = ladderResult[m.id];
                                    if (!res) return null;
                                    return (
                                      <div
                                        key={m.id}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/80 text-rose-800 dark:text-rose-200 shadow-xs ring-1 ring-rose-400/30 shrink-0"
                                      >
                                        <span className="text-xl p-1 rounded-lg bg-rose-100 dark:bg-rose-900/50 shadow-xs shrink-0">
                                          {m.avatar}
                                        </span>
                                        <div className="text-left min-w-0">
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs font-black truncate max-w-[90px]">{m.name}</span>
                                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black shrink-0">
                                              당첨
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                                            <span>{res.icon}</span>
                                            <span className="truncate max-w-[100px]">{res.text}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 2열: 나머지 이름표시된 아이콘 목록 */}
                            {otherMembers.length > 0 && (
                              <div className="space-y-1.5 text-left">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      🍀 나머지 참가자
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold">
                                      {otherMembers.length}명
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">통과 / 일반 결과</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {otherMembers.map((m) => {
                                    const res = ladderResult[m.id];
                                    if (!res) return null;
                                    return (
                                      <div
                                        key={m.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-xs transition-all shrink-0 ${
                                          resolvedTheme === 'dawn'
                                            ? 'bg-blue-50/70 border-blue-200 text-slate-700'
                                            : isDark
                                            ? 'bg-white/5 border-white/10 text-slate-200'
                                            : 'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <span className="text-xl p-1 rounded-lg bg-black/5 dark:bg-white/5 shadow-xs shrink-0">
                                          {m.avatar}
                                        </span>
                                        <div className="text-left min-w-0">
                                          <span className="text-xs font-bold truncate max-w-[90px] block text-slate-800 dark:text-slate-200">
                                            {m.name}
                                          </span>
                                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                            <span>{res.icon}</span>
                                            <span className="truncate max-w-[100px]">{res.text}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* 1 & 2. 다시 사다리 타기 (주 액션 전방 배치) 및 결과 닫기 (후방 배치) */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={handlePlayAgain}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">다시 사다리 타기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLadderResult(null)}
                        className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                      >
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">결과 닫기</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              룰렛
              ----------------------------------------------------------------- */}
          {gameType === 'ROULETTE' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  resolvedTheme === 'dawn' ? 'bg-[#f0f7ff] border-[#bfdbfe]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">인원수 설정</span>
                      <span className="text-xs text-indigo-400 font-extrabold">{memberCount}명</span>
                      {excludedWinners.length > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          {excludedWinners.length}명 당첨 제외 중
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      참가자 중 오늘의 당첨자 1명을 공정하게 선정합니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberCount(memberCount - 1)}
                      disabled={memberCount <= 2}
                      className="p-2 rounded-lg border disabled:opacity-40 bg-black/20 hover:bg-black/30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold px-2">{memberCount}명</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateMemberCount(memberCount + 1)}
                      className="p-2 rounded-lg border bg-black/20 hover:bg-black/30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* [중복제거 튜닝] 중복 이름 감지 및 클린업 바 */}
                {duplicateNameCount > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-base">⚠️</span>
                      <span>중복된 참가자 이름이 {duplicateNameCount}건 있습니다.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeduplicateNames}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] transition-all cursor-pointer shadow-xs"
                    >
                      자동 번호 정리
                    </button>
                  </div>
                )}

                {/* 룰렛 옵션: 가중치 설정 & [중복제거 튜닝] 당첨자 제외 모드 */}
                <div
                  className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${
                    resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useRouletteWeight}
                        onChange={(e) => setUseRouletteWeight(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-sm cursor-pointer"
                      />
                      <span className="text-xs font-bold">확률 가중치 설정</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={excludeWinnerMode}
                        onChange={(e) => setExcludeWinnerMode(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                      />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        당첨자 자동 제외 모드 (중복 당첨 방지)
                      </span>
                    </label>
                  </div>

                  {excludedWinners.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreExcludedWinners}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>제외된 {excludedWinners.length}명 전체 복원</span>
                    </button>
                  )}
                </div>

                {useRouletteWeight && (
                  <div
                    className={`mt-2 p-3 rounded-lg border space-y-2.5 ${
                      resolvedTheme === 'dawn' ? 'bg-white border-[#bfdbfe]' : isDark ? 'bg-[#151518] border-[#27272a]' : 'bg-white border-indigo-100'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const pct = Math.round(((m.weight || 1) / totalRouletteWeight) * 100);
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2 rounded-lg border gap-2 bg-black/10"
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="text-base">{m.avatar}</span>
                              <input
                                type="text"
                                lang="ko"
                                inputMode="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                value={m.name}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                                className="w-20 sm:w-28 px-1.5 py-0.5 text-xs font-bold rounded border outline-none bg-transparent"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateMemberWeight(m.id, -1)}
                                disabled={(m.weight || 1) <= 1}
                                className="p-1 rounded border bg-black/20 hover:bg-black/30 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{m.weight || 1}</span>
                              <button
                                type="button"
                                onClick={() => updateMemberWeight(m.id, 1)}
                                disabled={(m.weight || 1) >= 10}
                                className="p-1 rounded border bg-black/20 hover:bg-black/30 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-extrabold text-indigo-400 w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 룰렛 캔버스 */}
              <div
                className={`p-6 rounded-2xl border-2 flex flex-col items-center space-y-5 transition-all ${
                  resolvedTheme === 'dawn' ? 'bg-white border-[#bfdbfe]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-white border-indigo-100'
                }`}
                title="버튼을 눌러 룰렛을 회전시키세요"
              >
                {/* 참가자 영역 및 당첨자 가리키는 화살표 인디케이터 */}
                <div
                  id="roulette-participants-area"
                  className="w-full flex flex-col items-center justify-center space-y-2 py-1 scroll-mt-6"
                >
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {members.map((m) => {
                      const isChosen = selectedTagger?.id === m.id;
                      return (
                        <div key={m.id} className="relative flex flex-col items-center">
                          {isChosen && (
                            <div className="absolute -top-4 z-20 flex flex-col items-center animate-bounce">
                              <span className="text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 rounded-full border border-rose-300 shadow-xs">
                                당첨!
                              </span>
                              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-rose-500" />
                            </div>
                          )}
                          <span
                            id={`roulette-member-${m.id}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all duration-300 ${
                              isChosen
                                ? 'bg-rose-500 text-white border-rose-600 scale-110 ring-4 ring-rose-400/40 shadow-lg mt-1.5 font-black'
                                : `${m.bgLight} ${m.color}`
                            }`}
                          >
                            <span>{m.avatar}</span>
                            <input
                              type="text"
                              lang="ko"
                              value={m.name}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                              className="w-16 sm:w-20 bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-indigo-500 text-center"
                            />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none">
                  {/* [휠 튜닝] 포인터 화살표의 틱 튕김 인터랙션 */}
                  <div className={`absolute -top-3 z-20 text-rose-600 filter drop-shadow transition-transform ${isSpinning ? 'animate-bounce scale-110' : ''}`}>
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-600" />
                  </div>

                  <svg
                    viewBox="-100 -100 200 200"
                    className="w-full h-full rounded-full shadow-2xl transition-transform"
                    style={{
                      transform: `rotate(${rouletteRotation}deg)`,
                      transitionDuration: `${rouletteTransitionDuration}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.12, 0.88, 0.24, 1.0)',
                    }}
                  >
                    {rouletteSlices.map((slice, i) => {
                      const startRad = (slice.startAngle * Math.PI) / 180;
                      const endRad = (slice.endAngle * Math.PI) / 180;
                      const x1 = 100 * Math.cos(startRad);
                      const y1 = 100 * Math.sin(startRad);
                      const x2 = 100 * Math.cos(endRad);
                      const y2 = 100 * Math.sin(endRad);
                      const largeArc = slice.angle > 180 ? 1 : 0;
                      const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      const midRad = ((slice.startAngle + slice.endAngle) / 2 * Math.PI) / 180;
                      const textX = 65 * Math.cos(midRad);
                      const textY = 65 * Math.sin(midRad);

                      const colors = [
                        '#6366f1', '#ec4899', '#f59e0b', '#10b981',
                        '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e',
                      ];
                      const fill = colors[i % colors.length];

                      return (
                        <g key={slice.member.id}>
                          <path d={pathData} fill={fill} stroke="#ffffff" strokeWidth="2" />
                          <text
                            x={textX}
                            y={textY}
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {slice.member.avatar}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
                    <circle cx="0" cy="0" r="6" fill="#f8fafc" />
                  </svg>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleSpinRoulette(false)}
                    disabled={isSpinning}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className={`w-4 h-4 shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span className="whitespace-nowrap">{isSpinning ? '룰렛 회전 중...' : '룰렛 돌리기'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpinRoulette(true)}
                    disabled={isSpinning}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 font-bold text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">즉시 결과</span>
                  </button>
                </div>
              </div>

              {/* 당첨자 결과 카드 & [중복제거 튜닝 3] 원터치 제외 후 다음 룰렛 돌리기 */}
              {selectedTagger && (
                <div
                  id="roulette-winner-card"
                  className={`p-5 rounded-2xl border-2 shadow-md text-center space-y-3 animate-in fade-in ${
                    resolvedTheme === 'dawn'
                      ? 'bg-white border-rose-300 text-rose-900 shadow-rose-100/50'
                      : isDark
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-indigo-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <span className="text-3xl inline-block p-2 rounded-2xl bg-black/10 dark:bg-black/20 shadow-xs">
                    {selectedTagger.avatar}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-extrabold">
                      🎯 오늘의 룰렛 당첨: [{selectedTagger.name}] 님!
                    </h3>
                    <p className="text-xs text-rose-500 font-medium">
                      축하합니다! 오늘의 주인공입니다.
                    </p>
                  </div>

                  {/* 중복 제거 액션 버튼 */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExcludeWinnerAndSpinAgain}
                      disabled={members.length <= 2}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40"
                    >
                      <span>🎯</span>
                      <span>이 당첨자 제외하기 ({members.length - 1}명 남음)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpinRoulette(false)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>다시 돌리기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          4. 회원서비스 안내 : 6. 슬라이드드래그휠(버튼) 적용 & 5. 로그인화면 이동
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

        {/* 6. 슬라이드드래그휠(버튼) 적용 & 5. 클릭 시 로그인 이동 (자석 snap 해제) */}
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
            {/* 5. 로그인 화면으로 이동하는 화살표 CTA */}
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
            {/* 5. 로그인 화면으로 이동하는 화살표 CTA */}
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
            {/* 5. 로그인 화면으로 이동하는 화살표 CTA */}
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
    </div>
  );
};
