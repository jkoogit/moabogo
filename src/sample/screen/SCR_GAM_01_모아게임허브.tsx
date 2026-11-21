import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ElmRng01, ElmSld03, ElmToast01 } from '../elements/Tokens';
import {
  Gamepad2,
  Wallet,
  Sparkles,
  Coins,
  Users,
  Settings,
  Store,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  Participant,
  PRESET_CHARACTERS,
  RouletteSliceItem,
  SettlementGameZone,
  calculateSettlementSummary,
  RouletteGameZone,
  LadderGameZone,
  LadderGoal,
  generateDefaultLadderGoals,
} from '../../components/game';
import { LadderResultModal } from '../../components/game/ladder/LadderModals';
import {
  formatLadderResultText,
  formatStoreOrderText,
  getStoreMenuEmoji,
} from '../../components/game/ladder/ladderEngine';
import { LadderResultMap } from '../../components/game/ladder/types';
import { formatRouletteResultText } from '../../components/game/roulette/rouletteEngine';
import {
  StorePreset,
  getSystemStorePool,
} from '../data/systemStorePool';
import {
  GOAL_CELEBRATION_PRESET_ITEMS,
  GOAL_PENALTY_PRESET_ITEMS,
} from '../data/goal-mock-data';
import { addOfflineQueueItem } from '../data/offlineQueueStore';

// ============================================================================
// Types & Group Mock Data (가계부 / 당번 모임 연동)
// ============================================================================
export interface MemberGroup {
  id: string;
  name: string;
  type: 'LEDGER' | 'DUTY' | 'MANUAL' | 'GOAL';
  badge: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
}

const DEFAULT_MEMBER_GROUPS: MemberGroup[] = [
  {
    id: 'grp-fam',
    name: '우리집 가계부 (가족 공유)',
    type: 'LEDGER',
    badge: '가족 가계부',
    members: [
      { id: 'm-1', name: '구본영(호스트/나)', avatar: '👨‍💼', role: '방장' },
      { id: 'm-2', name: '김은지(배우자)', avatar: '👩‍💼', role: '공동관리자' },
      { id: 'm-3', name: '구민우(자녀)', avatar: '👦', role: '구성원' },
      { id: 'm-4', name: '시어머니(어르신)', avatar: '👵', role: '열람원' },
    ],
  },
  {
    id: 'grp-alumni',
    name: '2026 동창회 모임',
    type: 'LEDGER',
    badge: '모임 가계부',
    members: [
      { id: 'm-1', name: '구본영(나)', avatar: '👨‍💼', role: '총무' },
      { id: 'm-5', name: '박지훈', avatar: '🧑‍💻', role: '회원' },
      { id: 'm-6', name: '이민호', avatar: '👨‍🎨', role: '회원' },
      { id: 'm-7', name: '최수진', avatar: '👩‍🔬', role: '회원' },
      { id: 'm-8', name: '정태양', avatar: '🏃', role: '회원' },
      { id: 'm-9', name: '윤서아', avatar: '🎨', role: '회원' },
    ],
  },
  {
    id: 'grp-dev',
    name: '개발팀 티타임 (모아당번)',
    type: 'DUTY',
    badge: '당번 그룹',
    members: [
      { id: 'm-1', name: '구본영 팀장', avatar: '👨‍💼', role: '팀장' },
      { id: 'm-10', name: '김철수 선임', avatar: '🧑‍💻', role: '선임연구원' },
      { id: 'm-11', name: '이영희 연구원', avatar: '👩‍💻', role: '책임연구원' },
      { id: 'm-12', name: '박개발 주임', avatar: '👨‍💻', role: '연구원' },
    ],
  },
];

export interface SCR_GAM_01Props {
  onBack?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToLedger?: () => void;
  onNavigateToDuty?: () => void;
  onNavigateToGoal?: (goalId?: string) => void;
  initialGameType?: 'SPLIT' | 'LADDER' | 'ROULETTE';
  initialGroupId?: string;
  initialPresetType?: 'CELEBRATION' | 'PENALTY';
  isOffline?: boolean;
}

export const SCR_GAM_01_모아게임허브: React.FC<SCR_GAM_01Props> = ({
  onNavigateToSettings,
  onNavigateToGoal,
  initialGameType,
  initialGroupId,
  initialPresetType,
  isOffline = false,
}) => {
  const { resolvedTheme, isDark } = useTheme();

  // 1. 서브탭 상태 ('SPLIT' | 'LADDER' | 'ROULETTE') - 탭 전환 시에도 모임/참가자 데이터 보존
  const [gameType, setGameType] = useState<'SPLIT' | 'LADDER' | 'ROULETTE'>(
    initialGameType || 'SPLIT'
  );

  // 2. 모임 그룹 상태 (기본값: initialGroupId || 'manual')
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || 'manual'
  );

  // 3. 수동설정 인원수 상태 관리 (2 ~ 12명 기본, 5명씩 확장)
  const [memberCount, setMemberCount] = useState<number>(4);
  const [maxMemberLimit, setMaxMemberLimit] = useState<number>(12);

  // 4. 토스트 알림 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  }, []);

  // 5. 매장 및 메뉴 데이터 풀 (PLUS CAFE 45층 35종 연동)
  const [stores] = useState<StorePreset[]>(() => getSystemStorePool());
  const [selectedStore, setSelectedStore] = useState<StorePreset | null>(() => stores[0] || null);

  // 6. 공통 참가자 상태 (기본: 4명 수동설정)
  const [members, setMembers] = useState<Participant[]>(() =>
    Array.from({ length: 4 }).map((_, i) => {
      const presetChar = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
      return {
        id: `m_${i + 1}`,
        name: `참가자${i + 1}`,
        avatar: presetChar.avatar,
        color: presetChar.color,
        bgLight: presetChar.bgLight,
        weight: 10,
        isSent: false,
      };
    })
  );

  // 7. 룰렛(ROULETTE) 전용 상태 (모든 항목 기본 weight 10으로 완전 통일)
  const [roulettePresetTitle, setRoulettePresetTitle] = useState<string>(() => {
    if (initialPresetType === 'CELEBRATION') {
      return '🎯 목표 달성 축하 리워드 추첨';
    }
    if (initialPresetType === 'PENALTY') {
      return '⚡ 미달성 벌칙 추첨';
    }
    return '오늘의 모아당번 추첨';
  });

  const [rouletteItems, setRouletteItems] = useState<RouletteSliceItem[]>(() => {
    if (initialPresetType === 'CELEBRATION') {
      return GOAL_CELEBRATION_PRESET_ITEMS.map((item, idx) => ({
        id: `celeb-${idx}`,
        name: item,
        avatar: '🎁',
        weight: 10,
      }));
    }
    if (initialPresetType === 'PENALTY') {
      return GOAL_PENALTY_PRESET_ITEMS.map((item, idx) => ({
        id: `pen-${idx}`,
        name: item,
        avatar: '⚡',
        weight: 10,
      }));
    }
    return Array.from({ length: 4 }).map((_, i) => {
      const presetChar = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
      return {
        id: `m_${i + 1}`,
        name: `참가자${i + 1}`,
        avatar: presetChar.avatar,
        weight: 10,
      };
    });
  });

  // 8. 사다리(LADDER) 전용 상태
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [ladderGoals, setLadderGoals] = useState<LadderGoal[]>(() =>
    generateDefaultLadderGoals(4, 1)
  );
  const [ladderResults, setLadderResults] = useState<LadderResultMap | null>(null);
  const [isLadderResultOpen, setIsLadderResultOpen] = useState<boolean>(false);

  // 9. 수동설정 시 인원수 슬라이더 변경 핸들러
  const handleUpdateMemberCount = (count: number) => {
    setMemberCount(count);
    setMembers((prev) => {
      const diff = count - prev.length;
      if (diff === 0) return prev;
      let nextMembers: Participant[];
      if (diff > 0) {
        const added: Participant[] = Array.from({ length: diff }).map((_, i) => {
          const idx = prev.length + i + 1;
          const presetChar = PRESET_CHARACTERS[(idx - 1) % PRESET_CHARACTERS.length];
          return {
            id: `m_${idx}_${Date.now()}`,
            name: `참가자${idx}`,
            avatar: presetChar.avatar,
            color: presetChar.color,
            bgLight: presetChar.bgLight,
            weight: 10,
            isSent: false,
          };
        });
        nextMembers = [...prev, ...added];
      } else {
        nextMembers = prev.slice(0, count);
      }

      // 사다리 목표수 및 룰렛 아이템도 동기화 (weight 10 통일)
      setLadderGoals(generateDefaultLadderGoals(count, Math.min(winnerCount, Math.max(1, count - 1))));
      setRouletteItems(
        nextMembers.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          weight: 10,
        }))
      );

      return nextMembers;
    });
  };

  // 10. 참여인원 불러오기 핸들러 (모임 선택 시 또는 버튼 클릭 시)
  const handleImportMembers = () => {
    if (selectedGroupId === 'manual') {
      showToast('참여모임이 [수동설정] 상태입니다. 아래 슬라이더로 인원을 직접 설정하세요.', 'info');
      return;
    }

    const targetGroup = DEFAULT_MEMBER_GROUPS.find((g) => g.id === selectedGroupId);
    if (!targetGroup) return;

    const newMembers: Participant[] = targetGroup.members.map((m, idx) => {
      const presetChar = PRESET_CHARACTERS[idx % PRESET_CHARACTERS.length];
      return {
        id: `imported-${m.id}-${Date.now()}`,
        name: m.name,
        avatar: m.avatar || presetChar.avatar,
        color: presetChar.color,
        bgLight: presetChar.bgLight,
        weight: 10,
        isSent: false,
      };
    });

    setMembers(newMembers);
    setMemberCount(newMembers.length);

    // 사다리 목표 및 룰렛 아이템 동기화 (weight 10 통일)
    setLadderGoals(generateDefaultLadderGoals(newMembers.length, Math.min(winnerCount, Math.max(1, newMembers.length - 1))));
    setRouletteItems(
      newMembers.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        weight: 10,
      }))
    );

    showToast(`'${targetGroup.name}' 참여인원 ${newMembers.length}명을 성공적으로 불러왔습니다!`, 'success');
  };

  // 모임 선택기 변경 시 자동 동기화
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    if (groupId === 'manual') {
      showToast('수동설정 모드로 전환되었습니다. 인원수와 참가자를 자유롭게 편집하세요.', 'info');
      return;
    }
    const targetGroup = DEFAULT_MEMBER_GROUPS.find((g) => g.id === groupId);
    if (!targetGroup) return;

    const newMembers: Participant[] = targetGroup.members.map((m, idx) => {
      const presetChar = PRESET_CHARACTERS[idx % PRESET_CHARACTERS.length];
      return {
        id: `imported-${m.id}-${Date.now()}`,
        name: m.name,
        avatar: m.avatar || presetChar.avatar,
        color: presetChar.color,
        bgLight: presetChar.bgLight,
        weight: 10,
        isSent: false,
      };
    });

    setMembers(newMembers);
    setMemberCount(newMembers.length);
    setLadderGoals(generateDefaultLadderGoals(newMembers.length, Math.min(winnerCount, Math.max(1, newMembers.length - 1))));

    // 목표 그룹인 경우 축하 템플릿 자동 설정
    if (targetGroup.type === 'GOAL' && initialPresetType === 'CELEBRATION') {
      setRoulettePresetTitle(`${targetGroup.name.replace('[🎯목표] ', '')} 달성 축하 추첨`);
      setRouletteItems(
        GOAL_CELEBRATION_PRESET_ITEMS.map((item, idx) => ({
          id: `celeb-${idx}`,
          name: item,
          avatar: '🎁',
          weight: 10,
        }))
      );
    } else {
      setRouletteItems(
        newMembers.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          weight: 10,
        }))
      );
    }

    showToast(`'${targetGroup.name}' (${newMembers.length}명) 참여인원이 실시간 연동되었습니다.`, 'success');
  };

  // 딥링크 또는 전달된 파라미터가 있을 시 초기화 동기화
  useEffect(() => {
    if (initialGameType) {
      setGameType(initialGameType);
    }
    if (initialGroupId && initialGroupId !== 'manual') {
      handleSelectGroup(initialGroupId);
    }
  }, [initialGameType, initialGroupId]);

  // 11. 정산(SPLIT) 전용 상태
  const [splitAmount, setSplitAmount] = useState<string>('48000');
  const [useSplitWeight, setUseSplitWeight] = useState<boolean>(false);
  const settlementSummary = useMemo(
    () => calculateSettlementSummary(splitAmount, members, useSplitWeight),
    [splitAmount, members, useSplitWeight]
  );

  const updateSplitMemberWeight = (id: string, delta: number, isAbsolute = false) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentWeight = typeof m.weight === 'number' ? m.weight : 1;
        const newWeight = isAbsolute ? delta : Math.max(0, Math.min(10, currentWeight + delta));
        return { ...m, weight: newWeight };
      })
    );
  };

  const toggleSentStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSent: !m.isSent } : m))
    );
  };

  const handleAdjustAmount = (delta: number) => {
    const current = parseInt(splitAmount.replace(/,/g, ''), 10) || 0;
    const next = Math.max(0, current + delta);
    setSplitAmount(next.toString());
  };

  // 12. 룰렛(ROULETTE) 세부 상태
  const [selectedRouletteWinner, setSelectedRouletteWinner] = useState<RouletteSliceItem | null>(null);
  const [useRouletteWeight, setUseRouletteWeight] = useState<boolean>(false);
  const [excludeWinnerMode, setExcludeWinnerMode] = useState<boolean>(false);
  const [excludedWinners, setExcludedWinners] = useState<Participant[]>([]);
  const [excludedRouletteItems, setExcludedRouletteItems] = useState<RouletteSliceItem[]>([]);

  // 13. 가계부 지출 등록 기안 모달 상태
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [ledgerExpenseData, setLedgerExpenseData] = useState<{
    targetLedgerName: string;
    payerName: string;
    amount: number;
    title: string;
    category: string;
    memo: string;
  }>({
    targetLedgerName: '우리집 가계부 (가족 공유)',
    payerName: '구본영(호스트/나)',
    amount: 48000,
    title: '모아게임 결제 지출',
    category: '식비/간식',
    memo: '모아게임 당첨 지출 기안',
  });

  // 14. 모아당번 배정 기안 모달 상태
  const [isDutyModalOpen, setIsDutyModalOpen] = useState<boolean>(false);
  const [dutyAssignData, setDutyAssignData] = useState<{
    dutyTitle: string;
    assigneeName: string;
    assigneeAvatar: string;
    dueDate: string;
    category: string;
  }>({
    dutyTitle: '오늘의 커피 픽업 당번',
    assigneeName: '구본영 팀장',
    assigneeAvatar: '👨‍💼',
    dueDate: new Date().toISOString().slice(0, 10),
    category: '티타임/음료',
  });

  // 사다리 결과 가계부 기안 핸들러
  const handleOpenLadderExpense = () => {
    const winners = members.filter((m) => ladderResults && ladderResults[m.id]?.isWinner);
    const primaryWinner = winners[0] || members[0];
    const totalAmount = selectedStore
      ? members.reduce((sum, m) => sum + (m.selectedMenu?.price || 0), 0)
      : parseInt(splitAmount.replace(/,/g, ''), 10) || 30000;

    const groupName =
      selectedGroupId === 'manual'
        ? '모임 가계부'
        : DEFAULT_MEMBER_GROUPS.find((g) => g.id === selectedGroupId)?.name || '모임 가계부';

    setLedgerExpenseData({
      targetLedgerName: groupName,
      payerName: primaryWinner ? primaryWinner.name : '구본영(호스트/나)',
      amount: totalAmount,
      title: `${selectedStore ? selectedStore.name : '모아게임'} 사다리 결제`,
      category: '식비/간식',
      memo: `사다리타기 결과 ${winners.map((w) => w.name).join(', ')} 당첨 지출`,
    });
    setIsLadderResultOpen(false);
    setIsLedgerModalOpen(true);
  };

  // 정산 결과 가계부 기안 핸들러
  const handleOpenSplitExpense = () => {
    const total = parseInt(splitAmount.replace(/,/g, ''), 10) || 0;
    const groupName =
      selectedGroupId === 'manual'
        ? '모임 가계부'
        : DEFAULT_MEMBER_GROUPS.find((g) => g.id === selectedGroupId)?.name || '모임 가계부';

    setLedgerExpenseData({
      targetLedgerName: groupName,
      payerName: members[0]?.name || '구본영(호스트/나)',
      amount: total,
      title: `${groupName} 1/N 모아정산`,
      category: '식비/간식',
      memo: `총 ${members.length}명 정산 완료 (1인당 ₩${settlementSummary.perPerson.toLocaleString()}원)`,
    });
    setIsLedgerModalOpen(true);
  };

  // 룰렛 결과 당번 배정 핸들러
  const handleOpenDutyAssign = () => {
    if (!selectedRouletteWinner) return;
    setDutyAssignData({
      dutyTitle: selectedRouletteWinner.name.includes('당번')
        ? selectedRouletteWinner.name
        : `${selectedRouletteWinner.name} 당번`,
      assigneeName: selectedRouletteWinner.name,
      assigneeAvatar: selectedRouletteWinner.avatar,
      dueDate: new Date().toISOString().slice(0, 10),
      category: '라이프/협업',
    });
    setIsDutyModalOpen(true);
  };

  // 가계부 지출 기안 완료 핸들러 (오프라인 큐 무손실 보존 지원)
  const handleConfirmLedgerExpense = () => {
    setIsLedgerModalOpen(false);
    const isAppCurrentlyOffline =
      isOffline || (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isAppCurrentlyOffline) {
      const idempKey = `idemp_game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      addOfflineQueueItem({
        idempotencyKey: idempKey,
        type: 'LEDGER_EXPENSE',
        title: ledgerExpenseData.title,
        amount: ledgerExpenseData.amount,
        ledgerName: ledgerExpenseData.targetLedgerName,
        payerName: ledgerExpenseData.payerName,
        category: ledgerExpenseData.category,
        memo: ledgerExpenseData.memo,
      });
      showToast(
        `[오프라인 큐 보존] ₩${ledgerExpenseData.amount.toLocaleString()}원이 멱등키(${idempKey})와 함께 오프라인 동기화 큐에 안전하게 적재되었습니다.`,
        'warning'
      );
    } else {
      showToast(
        `[${ledgerExpenseData.targetLedgerName}]에 ₩${ledgerExpenseData.amount.toLocaleString()}원 지출이 성공적으로 등록되었습니다!`,
        'success'
      );
    }
  };

  // 당번 배정 완료 핸들러
  const handleConfirmDutyAssign = () => {
    setIsDutyModalOpen(false);
    showToast(
      `[${dutyAssignData.assigneeName}]님에게 '${dutyAssignData.dutyTitle}' 과업이 성공적으로 배정되었습니다!`,
      'success'
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 animate-in fade-in duration-200">
      {/* 1. 상단 브레드크럼 & 타이틀 헤더 (요청 6: '대시보드로 복귀' 버튼 제거 완료) */}
      <div className="pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>홈</span>
          <span>&gt;</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">모아게임 허브</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Gamepad2 className="w-6 h-6" />
          </span>
          <span>모아게임 (MoaGame)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            회원 전용
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          가계부·당번 모임원을 원터치로 불러와 1/N 정산, 사다리타기, 룰렛을 즐기고 결과를 모임에 즉시 기안하세요.
        </p>
      </div>

      {/* 2. [요청 1-a] 3대 서브탭 네비게이션 헤더 (로그인 모아게임 탭, 슬라이드드래그휠 ElmSld03 적용, 줄바꿈 완전 방지) */}
      <ElmSld03
        showNavButtons={false}
        className="rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs p-1"
        innerClassName="gap-2 items-center min-w-full flex-nowrap"
      >
        <button
          type="button"
          onClick={() => setGameType('SPLIT')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap flex-nowrap ${
            gameType === 'SPLIT'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap shrink-0">🧾 모아정산</span>
        </button>

        <button
          type="button"
          onClick={() => setGameType('LADDER')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap flex-nowrap ${
            gameType === 'LADDER'
              ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="text-base leading-none shrink-0">🪜</span>
          <span className="whitespace-nowrap shrink-0">사다리타기</span>
        </button>

        <button
          type="button"
          onClick={() => setGameType('ROULETTE')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap flex-nowrap ${
            gameType === 'ROULETTE'
              ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="whitespace-nowrap shrink-0">🎯 룰렛돌리기</span>
        </button>
      </ElmSld03>

      {/* 3. [요청 1-a] 모아게임 탭 다음에 표시되는 상단 개인화 컨트롤 바 */}
      <div
        className={`p-4 rounded-2xl border shadow-xs transition-all space-y-3 ${
          resolvedTheme === 'dawn'
            ? 'bg-[#0d1838] border-[#1e3a6d]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 좌측: [요청 2] 참여모임 선택기 (기본값 '수동설정' 탑재) & [요청 5] '참여인원 불러오기' & [요청 4] '⚙️' 아이콘 버튼 */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>참여 모임:</span>
            </span>

            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={(e) => handleSelectGroup(e.target.value)}
                className={`h-9 pl-3 pr-8 text-xs font-bold rounded-xl border appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white hover:border-zinc-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                {/* [요청 2-a] 기본 선택목록: 수동설정 */}
                <option value="manual">[수동설정] 직접 입력 및 커스텀</option>
                {DEFAULT_MEMBER_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    [{g.badge}] {g.name} ({g.members.length}명)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* [요청 4-a] 게임 프리셋 관리: 아이콘만 표시 */}
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className={`w-9 h-9 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                  resolvedTheme === 'dawn'
                    ? 'border-purple-700/80 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40'
                    : isDark
                    ? 'border-purple-700/80 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                    : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
                title="게임 프리셋 관리 (사용자설정 이동)"
                aria-label="게임 프리셋 관리"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 우측: [요청 3] 사다리(LADDER) 탭 전용 슬라이드드래그휠(ElmSld03) 적용된 단골 매장 퀵칩 바 */}
          {gameType === 'LADDER' && (
            <div className="flex items-center gap-2 min-w-0 flex-1 lg:max-w-xl">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>단골 매장:</span>
              </span>

              {/* [요청 3-a] ElmSld03 마우스 드래그 및 휠 수평 스크롤 연동 */}
              <ElmSld03
                showNavButtons={false}
                className="flex-1 min-w-0"
                innerClassName="gap-1.5 py-0.5 items-center"
              >
                {stores.map((st) => {
                  const isSelected = selectedStore?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(st);
                        showToast(`단골 매장 '${st.name}'(총 ${st.menus?.length || 0}종 메뉴)이 선택되었습니다.`, 'info');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 text-left ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : isDark
                          ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base shrink-0">☕</span>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold">{st.name}</span>
                        {st.categoryLabel && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-normal mt-0.5">
                            {st.categoryLabel} ({st.menus?.length || 0}종)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </ElmSld03>
            </div>
          )}
        </div>

        {/* [요청 7] 로그인 사다리/정산 화면 참가자 인원 설정 속성: 참여모임 '수동설정' 선택 시 표시하여 설정 가능하도록 처리 */}
        {selectedGroupId === 'manual' && gameType !== 'ROULETTE' && (
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in duration-150">
            <ElmRng01
              label="참여 인원수"
              value={memberCount}
              min={2}
              max={maxMemberLimit}
              step={1}
              unit="명"
              onChange={(val) => handleUpdateMemberCount(val)}
              onAddThreshold={() => {
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
      </div>

      {/* 4. 탭별 메인 컨텐츠 영역 */}
      <div className="space-y-4">
        {/* 탭 1: 모아정산 (SPLIT) */}
        {gameType === 'SPLIT' && (
          <div className="space-y-4">
            <SettlementGameZone
              members={members}
              setMembers={setMembers}
              amount={splitAmount}
              setAmount={setSplitAmount}
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

            {/* 정산 완료 ➔ 모임 가계부 지출 등록 원터치 기안 배너 */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
                resolvedTheme === 'dawn'
                  ? 'bg-indigo-950/30 border-indigo-800 text-indigo-200'
                  : isDark
                  ? 'bg-indigo-950/20 border-indigo-900 text-indigo-300'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 text-xl">
                  💳
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">
                    정산 결과를 모임 가계부에 즉시 지출로 기안하시겠습니까?
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    총 ₩{parseInt(splitAmount.replace(/,/g, ''), 10).toLocaleString()}원을 [{selectedGroupId === 'manual' ? '모임 가계부' : DEFAULT_MEMBER_GROUPS.find(g => g.id === selectedGroupId)?.name}] 지출 장부에 1-Click 등록합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenSplitExpense}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>모임 가계부에 지출 등록하기</span>
              </button>
            </div>
          </div>
        )}

        {/* 탭 2: 사다리타기 (LADDER) */}
        {gameType === 'LADDER' && (
          <div className="space-y-4">
            <LadderGameZone
              members={members}
              setMembers={setMembers}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              winnerCount={winnerCount}
              setWinnerCount={setWinnerCount}
              ladderGoals={ladderGoals}
              setLadderGoals={setLadderGoals}
              currentTabId="hub_ladder_tab"
              showToast={showToast}
              resolvedTheme={resolvedTheme}
              isDark={isDark}
            />

            {/* 사다리 결과 모달 */}
            <LadderResultModal
              isOpen={isLadderResultOpen}
              onClose={() => setIsLadderResultOpen(false)}
              members={members}
              results={ladderResults}
              selectedStore={selectedStore}
              onCopyText={() => {
                if (ladderResults) {
                  const txt = formatLadderResultText(ladderResults, members, selectedStore);
                  navigator.clipboard.writeText(txt);
                  showToast('사다리타기 결과 텍스트가 클립보드에 복사되었습니다.', 'success');
                }
              }}
              onCopyImageCard={() => {
                showToast('결과 카드 이미지가 클립보드에 복사되었습니다.', 'success');
              }}
              onDownloadImageCard={() => {
                showToast('결과 카드 이미지를 다운로드했습니다.', 'success');
              }}
              resolvedTheme={resolvedTheme}
              isDark={isDark}
              onRegisterToLedger={handleOpenLadderExpense}
            />
          </div>
        )}

        {/* 탭 3: 룰렛돌리기 (ROULETTE) */}
        {gameType === 'ROULETTE' && (
          <div className="space-y-4">
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
              currentTabId="hub_roulette_tab"
              showToast={showToast}
              resolvedTheme={resolvedTheme}
              isDark={isDark}
              isItemCountDisabled={selectedGroupId !== 'manual'}
              onAssignToDuty={handleOpenDutyAssign}
            />
          </div>
        )}
      </div>

      {/* 5. 가계부 지출 등록 기안 모달 (GameToLedgerExpenseModal) */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d] text-white'
                : isDark
                ? 'bg-[#18181b] border-[#27272a] text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-lg">
                  💳
                </span>
                <div>
                  <h3 className="text-sm font-bold">모임 가계부 지출 기안</h3>
                  <p className="text-[11px] text-slate-400">
                    게임 결과 결제 내역을 가계부에 단일 귀속합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  귀속 가계부 (단일 귀속성 원칙)
                </label>
                <input
                  type="text"
                  value={ledgerExpenseData.targetLedgerName}
                  disabled
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 font-bold opacity-80"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    결제자 (당첨자)
                  </label>
                  <input
                    type="text"
                    value={ledgerExpenseData.payerName}
                    onChange={(e) =>
                      setLedgerExpenseData({ ...ledgerExpenseData, payerName: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={ledgerExpenseData.category}
                    onChange={(e) =>
                      setLedgerExpenseData({ ...ledgerExpenseData, category: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  결제 총액 (₩)
                </label>
                <input
                  type="number"
                  value={ledgerExpenseData.amount}
                  onChange={(e) =>
                    setLedgerExpenseData({
                      ...ledgerExpenseData,
                      amount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 font-black font-mono text-indigo-600 dark:text-indigo-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  거래 내용 & 메모
                </label>
                <input
                  type="text"
                  value={ledgerExpenseData.memo}
                  onChange={(e) =>
                    setLedgerExpenseData({ ...ledgerExpenseData, memo: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmLedgerExpense}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                가계부 지출 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 모아당번 배정 기안 모달 (GameToDutyAssignModal) */}
      {isDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 ${
              resolvedTheme === 'dawn'
                ? 'bg-[#0d1838] border-[#1e3a6d] text-white'
                : isDark
                ? 'bg-[#18181b] border-[#27272a] text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500 text-lg">
                  🧹
                </span>
                <div>
                  <h3 className="text-sm font-bold">모아당번 과업 원터치 배정</h3>
                  <p className="text-[11px] text-slate-400">
                    룰렛 당첨 항목을 당번 시스템에 즉시 등록합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDutyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  당번 과업명
                </label>
                <input
                  type="text"
                  value={dutyAssignData.dutyTitle}
                  onChange={(e) =>
                    setDutyAssignData({ ...dutyAssignData, dutyTitle: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    배정 대상자
                  </label>
                  <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 font-bold">
                    <span>{dutyAssignData.assigneeAvatar}</span>
                    <span>{dutyAssignData.assigneeName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    마감 기한
                  </label>
                  <input
                    type="date"
                    value={dutyAssignData.dueDate}
                    onChange={(e) =>
                      setDutyAssignData({ ...dutyAssignData, dueDate: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={dutyAssignData.category}
                  onChange={(e) =>
                    setDutyAssignData({ ...dutyAssignData, category: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsDutyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDutyAssign}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                당번 배정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 하단 글로벌 토스트 */}
      <ElmToast01
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
