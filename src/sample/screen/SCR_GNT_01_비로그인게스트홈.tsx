import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmInp01,
  ElmSld03,
  ElmRng01,
  ElmCmb01,
  ElmToast01,
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
  ChevronDown,
  Share2,
  Coffee,
  Store,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Link,
  CheckSquare,
  Bookmark,
  Settings,
  Trash2,
  Camera,
  Download,
  SlidersHorizontal,
  Dices,
  HelpCircle,
} from 'lucide-react';
import {
  SYSTEM_STORE_POOL,
  loadUserStorePreference,
  LADDER_ROLE_PRESETS,
  ROULETTE_PRESETS,
  RoulettePreset,
  RoulettePresetItem,
  StorePreset,
  StoreMenuItem,
} from '../data/systemStorePool';
import {
  generateLadderResultCardBlob,
  generateRouletteResultCardBlob,
  generateSettlementResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
  shareImageBlob,
} from '../utils/gameResultCardCanvas';

// Character avatar presets
interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  bgLight: string;
  weight: number; // for weighted games (default 1)
  isSent?: boolean; // for settlement
  claimedBy?: string; // 클라이언트 탭/사용자 식별자 (점유자)
  selectedMenu?: StoreMenuItem; // 선택한 음료/메뉴
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

const ROULETTE_ICONS = [
  '🍱', '🍲', '🍛', '🍜', '🍔', '🍕', '🥗', '🍢', '☕', '🍦', '🍰', '🧹', '♻️', '📝', '💡', '🎯', '👑', '💸', '🏃', '🎤', '💖', '🍀', '💀', '🎁',
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
];

const TARGET_ICONS = [
  '🎁', '💨', '☕', '🍰', '🏃', '🧹', '✨', '🍜', '🍫', '🏪', '🥇', '💀', '💸', '👑', '🍔', '🍕', '🍻', '🥤', '🎯', '🍀', '💡', '📝', '⚽', '🎤',
];

export interface RouletteSliceItem {
  id: string;
  name: string;
  avatar: string;
  weight: number;
}

export interface GoalPresetItem {
  id: string;
  text: string;
  icon: string;
}

export const DEFAULT_GOAL_PRESETS: GoalPresetItem[] = [
  { id: 'gp_1', text: '당첨', icon: '🎁' },
  { id: 'gp_2', text: '통과', icon: '💨' },
  { id: 'gp_3', text: '커피 쏘기', icon: '☕' },
  { id: 'gp_4', text: '디저트 쏘기', icon: '🍰' },
  { id: 'gp_5', text: '픽업 당번', icon: '🏃' },
  { id: 'gp_6', text: '자리 정리', icon: '🧹' },
  { id: 'gp_7', text: '면제', icon: '✨' },
  { id: 'gp_8', text: '점심 쏘기', icon: '🍜' },
  { id: 'gp_9', text: '간식 쏘기', icon: '🍫' },
  { id: 'gp_10', text: '편의점 쏘기', icon: '🏪' },
  { id: 'gp_11', text: '1등', icon: '🥇' },
  { id: 'gp_12', text: '꼴찌', icon: '💀' },
];

const LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS = 'moabogo_ladder_goal_presets_v1';

export function loadUserGoalPresets(): GoalPresetItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load ladder goal presets:', e);
  }
  return DEFAULT_GOAL_PRESETS;
}

export function saveUserGoalPresets(presets: GoalPresetItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save ladder goal presets:', e);
  }
}

// 하위 호환성 유지용 별칭
const POPULAR_GOAL_PRESETS = DEFAULT_GOAL_PRESETS;

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
  // 1-B. [인스턴트 사다리 게임룸 & 매장 메뉴 연동] 상태 관리
  // ---------------------------------------------------------------------------
  const [currentTabId] = useState<string>(() => 'tab_' + Math.random().toString(36).slice(2, 9));
  const [myNickname, setMyNickname] = useState<string>('나 (게스트)');
  const [isRoomMode, setIsRoomMode] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [isMasterView, setIsMasterView] = useState<boolean>(true); // 마스터 시점 vs 참가자 시점 시뮬레이터
  const [roomCopyToast, setRoomCopyToast] = useState<boolean>(false);
  const [copiedResultText, setCopiedResultText] = useState<boolean>(false);
  const [invalidRoomNotice, setInvalidRoomNotice] = useState<string | null>(null);

  // 연동 매장 및 메뉴판 모달 상태 (초기값: 매장선택 없음 null)
  const [userStorePref] = useState(() => loadUserStorePreference());
  const [selectedStore, setSelectedStore] = useState<StorePreset | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [selectingTargetMemberId, setSelectingTargetMemberId] = useState<string | null>(null);
  const [menuModalCategory, setMenuModalCategory] = useState<string>('전체');

  // 사다리 목표 프리셋 목록 상태 (사용자 설정 & localStorage 영속화)
  const [goalPresets, setGoalPresets] = useState<GoalPresetItem[]>(() => loadUserGoalPresets());
  const [isGoalPresetsModalOpen, setIsGoalPresetsModalOpen] = useState<boolean>(false);
  const [newPresetText, setNewPresetText] = useState<string>('');
  const [newPresetIcon, setNewPresetIcon] = useState<string>('🎁');

  const handleAddGoalPreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPresetText.trim();
    if (!trimmed) return;
    if (goalPresets.some((p) => p.text === trimmed)) {
      alert('이미 동일한 이름의 목표가 등록되어 있습니다.');
      return;
    }
    const next = [...goalPresets, { id: 'gp_' + Date.now(), text: trimmed, icon: newPresetIcon }];
    setGoalPresets(next);
    saveUserGoalPresets(next);
    setNewPresetText('');
  };

  const handleDeleteGoalPreset = (id: string) => {
    if (goalPresets.length <= 1) {
      alert('최소 1개 이상의 목표가 필요합니다.');
      return;
    }
    const next = goalPresets.filter((p) => p.id !== id);
    setGoalPresets(next);
    saveUserGoalPresets(next);
  };

  const handleResetGoalPresets = () => {
    setGoalPresets(DEFAULT_GOAL_PRESETS);
    saveUserGoalPresets(DEFAULT_GOAL_PRESETS);
  };

  // 사다리 개별 기둥 목표 편집 레이어 팝업 모달 상태 (모바일 가로 전폭 지원)
  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
  const [tempGoalText, setTempGoalText] = useState<string>('');
  const [tempGoalIcon, setTempGoalIcon] = useState<string>('🎁');
  const [isGoalIconPickerOpen, setIsGoalIconPickerOpen] = useState<boolean>(false);

  const handleOpenGoalModal = (idx: number) => {
    const currentGoal = ladderGoals[idx] || { text: `목표 ${idx + 1}`, icon: '🎁' };
    setEditingGoalIdx(idx);
    setTempGoalText(currentGoal.text);
    setTempGoalIcon(currentGoal.icon);
    setIsGoalIconPickerOpen(false);
  };

  const handleConfirmGoal = () => {
    if (editingGoalIdx === null) return;
    const trimmed = tempGoalText.trim();
    const finalText = trimmed || `목표 ${editingGoalIdx + 1}`;
    setLadderGoals((prev) =>
      prev.map((g, i) =>
        i === editingGoalIdx
          ? { text: finalText, icon: tempGoalIcon }
          : g
      )
    );
    setEditingGoalIdx(null);
    setIsGoalIconPickerOpen(false);
  };

  // 2.1 매장 선택 팝업 모달 상태
  const [isStoreSelectModalOpen, setIsStoreSelectModalOpen] = useState<boolean>(false);
  const [storeSelectTab, setStoreSelectTab] = useState<'MY' | 'ALL'>('MY');

  // 2.2 롱프레스 풀텍스트 확인 툴팁 상태 및 Ref
  const [menuTooltip, setMenuTooltip] = useState<{
    memberId: string;
    menu: StoreMenuItem;
    x: number;
    y: number;
  } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  // 모바일 터치 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    if (!menuTooltip) return;
    const handleClose = () => setMenuTooltip(null);
    window.addEventListener('touchstart', handleClose);
    return () => window.removeEventListener('touchstart', handleClose);
  }, [menuTooltip]);

  // 매장 선택 적용 핸들러
  const handleSelectStore = (store: StorePreset) => {
    setSelectedStore(store);
    setIsStoreSelectModalOpen(false);
    // 매장 변경 시 이전 매장의 선택 메뉴 초기화
    setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined })));
  };

  // URL ?room= 파라미터 감지 및 인스턴트 룸 자동 진입
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        if (room.startsWith('ladder_')) {
          setIsRoomMode(true);
          setRoomCode(room);
          setGameType('LADDER');
        } else {
          setInvalidRoomNotice(`공유된 게임을 찾을 수 없습니다. (유효하지 않은 링크 키: ${room})`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 방 생성 핸들러
  const handleCreateRoom = () => {
    const newCode = 'ladder_' + Math.random().toString(36).slice(2, 8);
    setRoomCode(newCode);
    setIsRoomMode(true);
    setIsMasterView(true);
    setInvalidRoomNotice(null);
    try {
      const newUrl = `${window.location.pathname}?room=${newCode}`;
      window.history.pushState({ room: newCode }, '', newUrl);
    } catch (e) {
      console.error(e);
    }
  };


  // 방 나가기 / 개인 모드 복귀 핸들러
  const handleExitRoom = () => {
    setIsRoomMode(false);
    setRoomCode('');
    setIsMasterView(true);
    setInvalidRoomNotice(null);
    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch (e) {
      console.error(e);
    }
  };

  // 초대 링크 복사 핸들러 (실제 서비스 도메인: moabogo.com, dev.moabogo.com 등 배포 환경에 자동 정합)
  const handleCopyInviteLink = () => {
    const origin = window.location.origin;
    const storeTitle = selectedStore ? selectedStore.name : '팀';
    const fullUrl = `${origin}${window.location.pathname}?room=${roomCode}`;
    const text = `[모아보고] ☕ ${storeTitle} 사다리게임에 초대되었습니다!\n지금 접속해서 원하는 메뉴를 고르고 자리를 찜하세요!\n👉 참여 링크: ${fullUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      setRoomCopyToast(true);
      setTimeout(() => setRoomCopyToast(false), 3000);
    });
  };

  // 자리 찜하기(점유/해제) 토글 핸들러
  const handleToggleClaim = (memberId: string) => {
    setMembers((prev) => {
      return prev.map((m) => {
        if (m.id === memberId) {
          if (m.claimedBy === currentTabId) {
            // 점유 해제
            const idx = prev.indexOf(m);
            const defaultPreset = PRESET_CHARACTERS[idx % PRESET_CHARACTERS.length];
            return {
              ...m,
              claimedBy: undefined,
              name: `참가자${idx + 1}`,
              avatar: defaultPreset.avatar,
              selectedMenu: undefined,
            };
          } else {
            // 점유
            return {
              ...m,
              claimedBy: currentTabId,
              name: myNickname,
              avatar: '😎',
            };
          }
        } else if (m.claimedBy === currentTabId) {
          // 1인 1자리: 기존 기둥은 자동 해제
          const idx = prev.indexOf(m);
          const defaultPreset = PRESET_CHARACTERS[idx % PRESET_CHARACTERS.length];
          return {
            ...m,
            claimedBy: undefined,
            name: `참가자${idx + 1}`,
            avatar: defaultPreset.avatar,
          };
        }
        return m;
      });
    });
  };

  // 메뉴 선택 모달 열기 핸들러 (매장 미선택 시 매장 선택 모달 선행 유도)
  const handleOpenMenuModalForMember = (memberId: string) => {
    if (!selectedStore) {
      setSelectingTargetMemberId(memberId);
      setStoreSelectTab('MY');
      setIsStoreSelectModalOpen(true);
      return;
    }
    setSelectingTargetMemberId(memberId);
    setMenuModalCategory('전체');
    setIsMenuModalOpen(true);
  };

  // 메뉴 선택 완료 핸들러
  const handleSelectMenuForMember = (menu: StoreMenuItem) => {
    if (selectingTargetMemberId) {
      setMembers((prev) =>
        prev.map((m) => (m.id === selectingTargetMemberId ? { ...m, selectedMenu: menu } : m))
      );
    }
    setIsMenuModalOpen(false);
    setSelectingTargetMemberId(null);
  };

  // ---------------------------------------------------------------------------
  // 1. 공통 참가자 상태 관리
  // ---------------------------------------------------------------------------
  const [memberCount, setMemberCount] = useState<number>(6);
  const [members, setMembers] = useState<Participant[]>(() => {
    return Array.from({ length: 6 }).map((_, i) => {
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
    });
  });

  // 인원수 변경 동기화 (최소 2명, 최대 20명 통일)
  const handleUpdateMemberCount = (newCount: number) => {
    const validCount = Math.max(2, Math.min(20, newCount));
    setMemberCount(validCount);
    setMembers((prev) => {
      if (prev.length < validCount) {
        const added = Array.from({ length: validCount - prev.length }).map((_, idx) => {
          const i = prev.length + idx;
          const preset = PRESET_CHARACTERS[i % PRESET_CHARACTERS.length];
          return {
            id: `m_${Date.now()}_${i}`,
            name: `참가자${i + 1}`,
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
  // 2. [정산] 상태 및 가중치(차등) 정산 로직
  // ---------------------------------------------------------------------------
  const [amount, setAmount] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [useSplitWeight, setUseSplitWeight] = useState<boolean>(false);

  // 하단 플로팅 토스트/스낵바 상태 (ElmToast01 연동)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const showToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // 정산 가중치 업데이트 함수 (0배: 면제 ~ 10배, 0.5단위 증감)
  const updateSplitMemberWeight = (id: string, delta: number, isAbsolute = false) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentW = m.weight !== undefined ? m.weight : 1;
        const target = isAbsolute ? delta : Math.round((currentW + delta) * 10) / 10;
        return { ...m, weight: Math.max(0, Math.min(10, target)) };
      })
    );
  };

  const settlementSummary = useMemo(() => {
    const total = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    const count = members.length;
    if (count === 0 || total === 0) {
      return {
        perPerson: 0,
        baseUnitAmount: 0,
        remainder: 0,
        total: 0,
        totalWeight: 0,
        memberShares: {} as Record<string, { amount: number; weight: number; ratio: number }>,
      };
    }

    if (!useSplitWeight) {
      const perPerson = Math.floor(total / count / 100) * 100; // 100원 단위 절사
      const remainder = total - perPerson * count;
      const memberShares: Record<string, { amount: number; weight: number; ratio: number }> = {};
      members.forEach((m) => {
        memberShares[m.id] = { amount: perPerson, weight: 1, ratio: 1 / count };
      });
      return { perPerson, baseUnitAmount: perPerson, remainder, total, totalWeight: count, memberShares };
    }

    // 가중치 정산 모드: 총 가중치 합산 (음수 방어, 0 허용)
    const rawTotalWeight = members.reduce((sum, m) => sum + Math.max(0, m.weight ?? 1), 0);
    const totalWeight = Math.round(rawTotalWeight * 10) / 10;

    if (totalWeight <= 0) {
      const perPerson = Math.floor(total / count / 100) * 100;
      const remainder = total - perPerson * count;
      const memberShares: Record<string, { amount: number; weight: number; ratio: number }> = {};
      members.forEach((m) => {
        memberShares[m.id] = { amount: perPerson, weight: 1, ratio: 1 / count };
      });
      return { perPerson, baseUnitAmount: perPerson, remainder, total, totalWeight: count, memberShares };
    }

    // 1배당 기준 금액 (100원 절사)
    const baseUnitAmount = Math.floor((total / totalWeight) / 100) * 100;

    let allocatedTotal = 0;
    const memberShares: Record<string, { amount: number; weight: number; ratio: number }> = {};

    members.forEach((m) => {
      const w = Math.max(0, m.weight ?? 1);
      const ratio = w / totalWeight;
      // 100원 단위 절사
      const mAmount = Math.floor((total * ratio) / 100) * 100;
      memberShares[m.id] = { amount: mAmount, weight: w, ratio };
      allocatedTotal += mAmount;
    });

    const remainder = total - allocatedTotal;

    return {
      perPerson: baseUnitAmount,
      baseUnitAmount,
      remainder,
      total,
      totalWeight,
      memberShares,
    };
  }, [amount, members, useSplitWeight]);

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
      // 1. 수평 스크롤 필요성 검사: 한 화면에 다 보이는 경우 화면 스크롤 허용
      const canScroll = el.scrollWidth > el.clientWidth + 2;
      if (!canScroll) return;

      const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (rawDelta === 0) return;

      const isAtStart = el.scrollLeft <= 2;
      const isAtEnd = el.scrollLeft >= Math.floor(el.scrollWidth - el.clientWidth) - 2;

      // 2. 첫/끝 아이템 도달 시 화면 상하 스크롤 이벤트 통과
      if ((isAtStart && rawDelta < 0) || (isAtEnd && rawDelta > 0)) {
        return;
      }

      // 3. 중간 슬라이드 구간에서는 화면 스크롤 차단 및 수평 스크롤 수행
      e.preventDefault();
      e.stopPropagation();
      const multiplier = e.deltaMode === 1 ? 24 : 1;
      el.scrollLeft += rawDelta * multiplier;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
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
    let text = '';
    if (!useSplitWeight) {
      text = `[모아보고 정산]\n총 금액: ${settlementSummary.total.toLocaleString()}원 (${members.length}명)\n1인당 송금액: ${settlementSummary.perPerson.toLocaleString()}원\n\n함께 정산해요!`;
    } else {
      text = `[모아보고 가중치 차등 정산]\n총 결제 금액: ${settlementSummary.total.toLocaleString()}원 (${members.length}명 참여, 총 ${settlementSummary.totalWeight}배)\n기준 1배당: ₩${settlementSummary.baseUnitAmount.toLocaleString()}원\n\n👥 참가자별 송금 금액:\n`;
      members.forEach((m) => {
        const share = settlementSummary.memberShares[m.id];
        const amt = share ? share.amount : 0;
        const w = share ? share.weight : 1;
        text += `• ${m.name}: ${amt.toLocaleString()}원 (${w === 0 ? '면제' : `${w}배`})\n`;
      });
      if (settlementSummary.remainder > 0) {
        text += `\n(자투리 ${settlementSummary.remainder.toLocaleString()}원 제외)\n`;
      }
      text += `\n함께 정산해요!`;
    }
    navigator.clipboard?.writeText(text);
    showToast('정산 결과 텍스트가 클립보드에 복사되었습니다.');
  };

  const [copiedSettlementImage, setCopiedSettlementImage] = useState<boolean>(false);
  const [isGeneratingSettlementCard, setIsGeneratingSettlementCard] = useState<boolean>(false);

  // 정산 결과 카드 이미지 복사 (Ctrl+V)
  const handleCopySettlementImageCard = async () => {
    setIsGeneratingSettlementCard(true);
    try {
      const blob = await generateSettlementResultCardBlob({
        title: useSplitWeight ? '가중치 차등 정산 결과서' : '모아보고 스마트 정산 결과서',
        totalAmount: settlementSummary.total,
        totalCount: members.length,
        perPerson: useSplitWeight ? settlementSummary.baseUnitAmount : settlementSummary.perPerson,
        isWeighted: useSplitWeight,
        totalWeight: settlementSummary.totalWeight,
        baseUnitAmount: settlementSummary.baseUnitAmount,
        remainder: settlementSummary.remainder,
        members: members.map((m) => {
          const share = settlementSummary.memberShares[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            amount: share ? share.amount : settlementSummary.perPerson,
            weight: share ? share.weight : 1,
            isSent: m.isSent,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });

      const res = await copyBlobToClipboard(blob);
      if (res.success) {
        showToast('정산 결과 카드 이미지가 클립보드에 복사되었습니다.');
      } else {
        downloadBlobAsFile(blob, `moabogo_settlement_${Date.now()}.png`);
        showToast('클립보드 권한으로 인해 이미지 파일로 저장되었습니다.', 'info');
      }
    } catch (e) {
      console.error('Failed to generate settlement card:', e);
      showToast('카드 이미지 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingSettlementCard(false);
    }
  };

  // 정산 결과 이미지 파일 다운로드
  const handleDownloadSettlementImageCard = async () => {
    setIsGeneratingSettlementCard(true);
    try {
      const blob = await generateSettlementResultCardBlob({
        title: useSplitWeight ? '가중치 차등 정산 결과서' : '모아보고 스마트 정산 결과서',
        totalAmount: settlementSummary.total,
        totalCount: members.length,
        perPerson: useSplitWeight ? settlementSummary.baseUnitAmount : settlementSummary.perPerson,
        isWeighted: useSplitWeight,
        totalWeight: settlementSummary.totalWeight,
        baseUnitAmount: settlementSummary.baseUnitAmount,
        remainder: settlementSummary.remainder,
        members: members.map((m) => {
          const share = settlementSummary.memberShares[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            amount: share ? share.amount : settlementSummary.perPerson,
            weight: share ? share.weight : 1,
            isSent: m.isSent,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      downloadBlobAsFile(blob, `moabogo_settlement_${Date.now()}.png`);
      showToast('정산 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download settlement card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingSettlementCard(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. [사다리타기] 상태 및 로직 (하나씩 순차 이동 애니메이션 & 동기화 좌표)
  // ---------------------------------------------------------------------------
  const [useLadderWeight, setUseLadderWeight] = useState<boolean>(false);
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [ladderGoals, setLadderGoals] = useState<{ text: string; icon: string }[]>(() =>
    generateDefaultLadderGoals(6, 1)
  );
  const [ladderResult, setLadderResult] = useState<{
    [memberId: string]: { goalIndex: number; text: string; icon: string; isWinner: boolean };
  } | null>(null);
  const [savedLadderResult, setSavedLadderResult] = useState<{
    [memberId: string]: { goalIndex: number; text: string; icon: string; isWinner: boolean };
  } | null>(null);
  const [isStoreHelpOpen, setIsStoreHelpOpen] = useState<boolean>(false);
  const [memberNameTooltip, setMemberNameTooltip] = useState<{ id: string; name: string; x: number; y: number } | null>(null);


  // 사다리 결과 기반 주문 취합서 및 카톡 텍스트 자동 계산
  const orderSummaryData = useMemo(() => {
    if (!ladderResult) return null;

    // 결제 당첨자 찾기 (isWinner === true 인 참가자)
    const payerEntry = Object.entries(ladderResult).find(([, res]) => res.isWinner);
    const payerMember = payerEntry ? members.find((m) => m.id === payerEntry[0]) : null;

    // 메뉴 주문 수량 및 금액 집계
    const menuCounts: { [name: string]: { count: number; unitPrice: number; subtotal: number } } = {};
    let totalAmount = 0;
    let totalCount = 0;

    members.forEach((m) => {
      const menu = m.selectedMenu;
      const menuName = menu ? menu.name : '기본 아메리카노 (선택안함)';
      const price = menu ? menu.price : 4500;

      if (!menuCounts[menuName]) {
        menuCounts[menuName] = { count: 0, unitPrice: price, subtotal: 0 };
      }
      menuCounts[menuName].count += 1;
      menuCounts[menuName].subtotal += price;
      totalAmount += price;
      totalCount += 1;
    });

    // 카톡 전송용 포맷 텍스트 생성
    const dateStr = new Date().toISOString().slice(0, 10);
    const itemsText = Object.entries(menuCounts)
      .map(([name, item], i) => ` ${i + 1}. ${name} x ${item.count}잔 - ${item.subtotal.toLocaleString()}원`)
      .join('\n');

    const participantMenuText = members
      .map((m, i) => ` • ${m.name}: ${m.selectedMenu ? m.selectedMenu.name : '아메리카노(기본)'}`)
      .join('\n');

    const storeLabel = selectedStore ? selectedStore.name : '사다리';
    const kakaoText = `[모아보고 사다리 결과 - ${storeLabel}]\n📅 ${dateStr} | 총 ${members.length}명 참여\n\n🏆 당첨 결과:\n• 💳 오늘 결제: ${payerMember ? payerMember.name : '결제 당첨자'} (축하합니다! 🎉)\n\n☕ 주문 내역 요약 (총 ${totalCount}잔 / ${totalAmount.toLocaleString()}원):\n${itemsText}\n\n👥 각자 선택한 메뉴:\n${participantMenuText}`;

    return {
      payerMember,
      menuCounts,
      totalAmount,
      totalCount,
      kakaoText,
    };
  }, [ladderResult, members, selectedStore]);

  // 일반 사다리 및 매장 주문 전체를 아우르는 통합 공유 텍스트
  const ladderGeneralShareText = useMemo(() => {
    if (!ladderResult) return '';
    if (selectedStore && orderSummaryData?.kakaoText) {
      return orderSummaryData.kakaoText;
    }
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const winnerMembers = members.filter((m) => ladderResult[m.id]?.isWinner);
    const otherMembers = members.filter((m) => !ladderResult[m.id]?.isWinner);

    let text = `[모아보고 사다리타기 최종 결과]\n📅 일시: ${dateStr} | 참여 ${members.length}명\n\n`;
    if (winnerMembers.length > 0) {
      text += `🎉 당첨자 명단 (${winnerMembers.length}명):\n`;
      winnerMembers.forEach((m) => {
        const res = ladderResult[m.id];
        text += `• ${m.name}: ${res.icon} ${res.text}\n`;
      });
      text += '\n';
    }
    if (otherMembers.length > 0) {
      text += `🍀 통과 및 일반 결과 (${otherMembers.length}명):\n`;
      otherMembers.forEach((m) => {
        const res = ladderResult[m.id];
        text += `• ${m.name}: ${res.icon} ${res.text}\n`;
      });
    }
    text += `\n스마트 가계부 & 모임 정산 • 모아보고`;
    return text;
  }, [ladderResult, members, selectedStore, orderSummaryData]);

  // 사다리 결과 카드 이미지 복사 및 다운로드 상태
  const [copiedLadderImage, setCopiedLadderImage] = useState<boolean>(false);
  const [isGeneratingLadderCard, setIsGeneratingLadderCard] = useState<boolean>(false);

  const handleCopyLadderImageCard = async () => {
    if (!ladderResult) return;
    setIsGeneratingLadderCard(true);
    try {
      const participants = members.map((m) => {
        const res = ladderResult[m.id];
        return {
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          goalText: res ? res.text : '',
          goalIcon: res ? res.icon : '',
          isWinner: !!res?.isWinner,
          orderItemName: selectedStore ? m.selectedMenu?.name : undefined,
          orderItemPrice: selectedStore ? m.selectedMenu?.price : undefined,
        };
      });

      const blob = await generateLadderResultCardBlob({
        title: selectedStore ? `${selectedStore.name} 주문 사다리타기` : '당첨자 & 결과 매칭',
        storeName: selectedStore?.name,
        totalAmount: selectedStore ? orderSummaryData?.totalAmount : undefined,
        totalCount: selectedStore ? orderSummaryData?.totalCount : undefined,
        participants,
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
      setIsGeneratingLadderCard(false);
    }
  };

  const handleDownloadLadderImageCard = async () => {
    if (!ladderResult) return;
    setIsGeneratingLadderCard(true);
    try {
      const participants = members.map((m) => {
        const res = ladderResult[m.id];
        return {
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          goalText: res ? res.text : '',
          goalIcon: res ? res.icon : '',
          isWinner: !!res?.isWinner,
          orderItemName: selectedStore ? m.selectedMenu?.name : undefined,
          orderItemPrice: selectedStore ? m.selectedMenu?.price : undefined,
        };
      });

      const blob = await generateLadderResultCardBlob({
        title: selectedStore ? `${selectedStore.name} 주문 사다리타기` : '당첨자 & 결과 매칭',
        storeName: selectedStore?.name,
        totalAmount: selectedStore ? orderSummaryData?.totalAmount : undefined,
        totalCount: selectedStore ? orderSummaryData?.totalCount : undefined,
        participants,
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });

      downloadBlobAsFile(blob, `moabogo_ladder_${Date.now()}.png`);
      showToast('사다리 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download ladder card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingLadderCard(false);
    }
  };

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

  // 가중치 업데이트 함수 (음수 허용: -5 ~ +10, 한 명을 마이너스하면 상대적으로 타인 비율 상승)
  const updateMemberWeight = (id: string, delta: number, isAbsolute = false) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentW = m.weight !== undefined ? m.weight : 1;
        const target = isAbsolute ? delta : currentW + delta;
        return { ...m, weight: Math.max(-5, Math.min(10, target)) };
      })
    );
  };

  // 가중치 일괄 균등 초기화 핸들러 (모든 참가자 1로 리셋)
  const handleResetWeights = () => {
    setMembers((prev) => prev.map((m) => ({ ...m, weight: 1 })));
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
      const isPass = finalGoal.text.includes('통과') || finalGoal.text.includes('면제') || finalGoal.icon === '💨' || finalGoal.icon === '❌';
      const isWinner = !isPass && (
        finalGoal.text.includes('선택') ||
        finalGoal.text.includes('당첨') ||
        finalGoal.text.includes('쏘기') ||
        finalGoal.text.includes('당번') ||
        finalGoal.text.includes('1등') ||
        finalGoal.text.includes('꼴찌') ||
        finalGoal.icon === '🎁' ||
        finalGoal.icon === '☕' ||
        finalGoal.icon === '👑' ||
        finalGoal.icon === '💸'
      );
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
    setSavedLadderResult(results);
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
        setSavedLadderResult(results);
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
              setSavedLadderResult(results);
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
  // ---------------------------------------------------------------------------
  // 4. [룰렛] 전면 개편 상태 및 로직 (기본 5개 프리셋, 커스텀 프리셋 저장, 재실행, 2x 카드 이미지 복사)
  // ---------------------------------------------------------------------------
  const DEFAULT_FIVE_ITEMS_PRESET: RoulettePreset = {
    id: 'preset_default_6',
    category: 'CUSTOM',
    title: '🎯 기본 룰렛',
    description: '주제 없이 기본 세팅된 항목 1~6 룰렛 프리셋',
    icon: '🎯',
    items: [
      { id: 'def_1', name: '항목1', icon: '1️⃣', weight: 1 },
      { id: 'def_2', name: '항목2', icon: '2️⃣', weight: 1 },
      { id: 'def_3', name: '항목3', icon: '3️⃣', weight: 1 },
      { id: 'def_4', name: '항목4', icon: '4️⃣', weight: 1 },
      { id: 'def_5', name: '항목5', icon: '5️⃣', weight: 1 },
      { id: 'def_6', name: '항목6', icon: '6️⃣', weight: 1 },
    ],
  };

  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState<boolean>(false);
  const [isRouletteHelpOpen, setIsRouletteHelpOpen] = useState<boolean>(false);
  const [editingItemIconId, setEditingItemIconId] = useState<string | null>(null);
  const [savedPresetToast, setSavedPresetToast] = useState<boolean>(false);

  // 5. 프리셋 저장 인앱 모달 상태 (window.prompt 배제)
  const [isPresetSaveModalOpen, setIsPresetSaveModalOpen] = useState<boolean>(false);
  const [presetSaveInputTitle, setPresetSaveInputTitle] = useState<string>('');

  const [customRoulettePresets, setCustomRoulettePresets] = useState<RoulettePreset[]>(() => {
    try {
      const saved = localStorage.getItem('moabogo_custom_roulette_presets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 6. 프리셋 순서 영속화 및 드래그 앤 드롭 상태
  const [reorderablePresetIds, setReorderablePresetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('moabogo_roulette_presets_order');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['preset_default_5', ...ROULETTE_PRESETS.map((p) => p.id)];
  });
  const [draggedPresetId, setDraggedPresetId] = useState<string | null>(null);
  const [dragTargetPresetId, setDragTargetPresetId] = useState<string | null>(null);
  const [dragDropSide, setDragDropSide] = useState<'left' | 'right'>('left');

  // 추천 및 커스텀 프리셋 통합 목록 (순서 변경 지원)
  const orderedPresets = useMemo(() => {
    const map = new Map<string, RoulettePreset>();
    map.set(DEFAULT_FIVE_ITEMS_PRESET.id, DEFAULT_FIVE_ITEMS_PRESET);
    ROULETTE_PRESETS.forEach((p) => map.set(p.id, p));
    customRoulettePresets.forEach((p) => map.set(p.id, p));

    const result: RoulettePreset[] = [];
    const visited = new Set<string>();

    reorderablePresetIds.forEach((id) => {
      const found = map.get(id);
      if (found) {
        result.push(found);
        visited.add(id);
      }
    });

    map.forEach((p, id) => {
      if (!visited.has(id)) {
        result.push(p);
      }
    });

    return result;
  }, [reorderablePresetIds, customRoulettePresets]);

  // 프리셋 드래그 순서 변경 핸들러 (위치 표시 및 영속화)
  const handleReorderPresets = (sourceId: string | null, targetId: string, side: 'left' | 'right') => {
    if (!sourceId || sourceId === targetId) return;
    setReorderablePresetIds((prev) => {
      const currentList = [...orderedPresets.map((p) => p.id)];
      const fromIdx = currentList.indexOf(sourceId);
      const toIdx = currentList.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      currentList.splice(fromIdx, 1);
      const insertIdx = side === 'left' ? currentList.indexOf(targetId) : currentList.indexOf(targetId) + 1;
      currentList.splice(insertIdx, 0, sourceId);

      try {
        localStorage.setItem('moabogo_roulette_presets_order', JSON.stringify(currentList));
      } catch {}

      return currentList;
    });
  };

  const [roulettePresetTitle, setRoulettePresetTitle] = useState<string>('🎯 기본 룰렛');
  const [rouletteItems, setRouletteItems] = useState<RouletteSliceItem[]>(() => [
    { id: 'def_1', name: '항목1', avatar: '1️⃣', weight: 1 },
    { id: 'def_2', name: '항목2', avatar: '2️⃣', weight: 1 },
    { id: 'def_3', name: '항목3', avatar: '3️⃣', weight: 1 },
    { id: 'def_4', name: '항목4', avatar: '4️⃣', weight: 1 },
    { id: 'def_5', name: '항목5', avatar: '5️⃣', weight: 1 },
    { id: 'def_6', name: '항목6', avatar: '6️⃣', weight: 1 },
  ]);
  const [newRouletteName, setNewRouletteName] = useState<string>('');
  const [newRouletteIcon, setNewRouletteIcon] = useState<string>('🎯');
  const [selectedRouletteWinner, setSelectedRouletteWinner] = useState<RouletteSliceItem | null>(null);

  const [useRouletteWeight, setUseRouletteWeight] = useState<boolean>(false);
  const [rouletteRotation, setRouletteRotation] = useState<number>(0);
  const [rouletteTransitionDuration, setRouletteTransitionDuration] = useState<number>(3500);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedTagger, setSelectedTagger] = useState<Participant | null>(null);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  // [중복제거 튜닝 1] 당첨자 제외 모드 & 제외된 항목 보관함
  const [excludeWinnerMode, setExcludeWinnerMode] = useState<boolean>(false);
  const [excludedWinners, setExcludedWinners] = useState<Participant[]>([]);
  const [excludedRouletteItems, setExcludedRouletteItems] = useState<RouletteSliceItem[]>([]);

  // 룰렛 결과 복사 및 이미지 생성 상태
  const [copiedRouletteText, setCopiedRouletteText] = useState<boolean>(false);
  const [copiedRouletteImage, setCopiedRouletteImage] = useState<boolean>(false);
  const [isGeneratingRouletteCard, setIsGeneratingRouletteCard] = useState<boolean>(false);

  // 4. 게임별 초기화 핸들러
  // 4.1 정산 게임 초기화 (금액 0원, 인원 6명 참가자1~6 초기화)
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
    setCopiedNotice(false);
  };

  // 4.2 사다리 게임 초기화
  const handleResetLadderGame = () => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
    nextStepActionRef.current = null;

    setWinnerCount(1);
    setLadderResult(null);
    setSavedLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    setIsArrivalPaused(false);
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setLadderGoals(generateDefaultLadderGoals(members.length, 1));
    setLadderSpeed(1.0);
    setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined, weight: 1 })));
  };

  // 4.3 룰렛 게임 초기화 (기본 6개 항목1~6 초기화)
  const handleResetRouletteGame = () => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    setRoulettePresetTitle(DEFAULT_FIVE_ITEMS_PRESET.title);
    setRouletteItems(
      DEFAULT_FIVE_ITEMS_PRESET.items.map((it) => ({
        id: it.id,
        name: it.name,
        avatar: it.icon || '🎯',
        weight: it.weight || 1,
      }))
    );
    setSelectedRouletteWinner(null);
    setSelectedTagger(null);
    setExcludedWinners([]);
    setExcludedRouletteItems([]);
    setRouletteRotation(0);
    setIsSpinning(false);
  };

  // 프리셋 적용 핸들러
  const handleApplyRoulettePreset = (preset: RoulettePreset) => {
    setRoulettePresetTitle(preset.title);
    setRouletteItems(
      preset.items.map((it) => ({
        id: it.id,
        name: it.name,
        avatar: it.icon || '🎯',
        weight: it.weight || 1,
      }))
    );
    setSelectedRouletteWinner(null);
    setSelectedTagger(null);
    setExcludedRouletteItems([]);
  };

  // 현재 참여 멤버로 룰렛 채우기
  const handleApplyMembersToRoulette = () => {
    setRoulettePresetTitle(`👥 참여 멤버 1인 독박 추첨 (${members.length}명)`);
    setRouletteItems(
      members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        weight: m.weight || 1,
      }))
    );
    setSelectedRouletteWinner(null);
    setSelectedTagger(null);
    setExcludedRouletteItems([]);
  };

  // 새 룰렛 항목 추가
  const handleAddRouletteItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newRouletteName.trim();
    if (!trimmed) return;
    const newItem: RouletteSliceItem = {
      id: 'r_custom_' + Date.now(),
      name: trimmed,
      avatar: newRouletteIcon,
      weight: 1,
    };
    setRouletteItems((prev) => [...prev, newItem]);
    setNewRouletteName('');
  };

  // 룰렛 항목 수 변경 동기화 (최소 2명, 최대 20명 통일)
  const handleUpdateRouletteItemCount = (newCount: number) => {
    const validCount = Math.max(2, Math.min(20, newCount));
    setRouletteItems((prev) => {
      if (prev.length < validCount) {
        const added = Array.from({ length: validCount - prev.length }).map((_, idx) => {
          const nextIdx = prev.length + idx + 1;
          const presetChar = PRESET_CHARACTERS[(nextIdx - 1) % PRESET_CHARACTERS.length];
          return {
            id: 'r_item_' + Date.now() + '_' + idx,
            name: `항목${nextIdx}`,
            avatar: presetChar?.avatar || '🎯',
            weight: 1,
          };
        });
        return [...prev, ...added];
      } else {
        return prev.slice(0, validCount);
      }
    });
    setSelectedRouletteWinner(null);
  };

  // 룰렛 참가 항목 수 원클릭 증감 인디케이터 핸들러 (2~20명 제한)
  const handleDecreaseRouletteItemCount = () => {
    if (rouletteItems.length <= 2) return;
    handleUpdateRouletteItemCount(rouletteItems.length - 1);
  };

  const handleIncreaseRouletteItemCount = () => {
    if (rouletteItems.length >= 20) return;
    handleUpdateRouletteItemCount(rouletteItems.length + 1);
  };

  // 5. 내 프리셋 저장 모달 열기
  const handleOpenPresetSaveModal = () => {
    const rawTitle = roulettePresetTitle
      .replace(/^[^\s]+\s*/, '')
      .replace(/\s*\(\d+.*?\)$/, '')
      .trim() || '내 룰렛 프리셋';
    setPresetSaveInputTitle(rawTitle);
    setIsPresetSaveModalOpen(true);
  };

  // 5. 내 프리셋 저장 확정 핸들러 (인앱 모달 입력)
  const handleConfirmSavePreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = presetSaveInputTitle.trim();
    if (!trimmed) return;

    const newPreset: RoulettePreset = {
      id: 'custom_' + Date.now(),
      category: 'CUSTOM',
      title: `⭐ ${trimmed}`,
      description: '사용자 저장 커스텀 룰렛 프리셋',
      icon: rouletteItems[0]?.avatar || '🎯',
      items: rouletteItems.map((it) => ({
        id: it.id,
        name: it.name,
        icon: it.avatar,
        weight: it.weight || 1,
      })),
    };

    const updated = [newPreset, ...customRoulettePresets.filter((p) => p.title !== newPreset.title)];
    setCustomRoulettePresets(updated);
    try {
      localStorage.setItem('moabogo_custom_roulette_presets', JSON.stringify(updated));
      const nextOrder = [newPreset.id, ...reorderablePresetIds.filter((id) => id !== newPreset.id)];
      setReorderablePresetIds(nextOrder);
      localStorage.setItem('moabogo_roulette_presets_order', JSON.stringify(nextOrder));
      setIsPresetSaveModalOpen(false);
      setSavedPresetToast(true);
      setTimeout(() => setSavedPresetToast(false), 2500);
    } catch {}
  };

  // 내 프리셋 삭제 핸들러
  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customRoulettePresets.filter((p) => p.id !== presetId);
    setCustomRoulettePresets(updated);
    try {
      localStorage.setItem('moabogo_custom_roulette_presets', JSON.stringify(updated));
    } catch {}
  };

  // 룰렛 항목 삭제
  const handleDeleteRouletteItem = (id: string) => {
    if (rouletteItems.length <= 2) {
      alert('룰렛은 최소 2개 이상의 항목이 필요합니다.');
      return;
    }
    setRouletteItems((prev) => prev.filter((it) => it.id !== id));
  };

  // 룰렛 항목 가중치 조절
  const handleUpdateRouletteItemWeight = (id: string, delta: number) => {
    setRouletteItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const next = Math.max(1, Math.min(10, (it.weight || 1) + delta));
        return { ...it, weight: next };
      })
    );
  };

  // 룰렛 항목 이름 변경
  const handleUpdateRouletteItemName = (id: string, newName: string) => {
    setRouletteItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, name: newName } : it))
    );
  };

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
    if (excludedRouletteItems.length > 0) {
      setRouletteItems((prev) => [...prev, ...excludedRouletteItems]);
      setExcludedRouletteItems([]);
    }
    if (excludedWinners.length > 0) {
      setMembers((prev) => [...prev, ...excludedWinners]);
      setMemberCount((prev) => prev + excludedWinners.length);
      setExcludedWinners([]);
    }
    setSelectedTagger(null);
    setSelectedRouletteWinner(null);
  };

  const totalRouletteWeight = useMemo(() => {
    return rouletteItems.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0);
  }, [rouletteItems]);

  const rouletteSlices = useMemo(() => {
    let currentAngle = 0;
    const slices = rouletteItems.map((item) => {
      const weight = Math.max(1, item.weight || 1);
      const angle = (weight / Math.max(1, totalRouletteWeight)) * 360;
      const slice = {
        item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        angle,
      };
      currentAngle += angle;
      return slice;
    });
    return slices;
  }, [rouletteItems, totalRouletteWeight]);

  // [휠 튜닝 & 중복제거] 룰렛 회전 코어 함수 (중앙 허브 즉시 재실행 forceRestart 지원)
  const handleSpinRoulette = (skip = false, overrideChosen?: RouletteSliceItem, forceRestart = false) => {
    if (rouletteItems.length === 0) return;
    if (isSpinning && !forceRestart) return;

    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }

    setSelectedRouletteWinner(null);
    setSelectedTagger(null);

    let chosen = overrideChosen || rouletteItems[0];
    if (!overrideChosen) {
      let rand = Math.random() * totalRouletteWeight;
      for (const item of rouletteItems) {
        const w = Math.max(1, item.weight || 1);
        if (rand <= w) {
          chosen = item;
          break;
        }
        rand -= w;
      }
    }

    if (skip) {
      setIsSpinning(true);
      setRouletteTransitionDuration(400);
      const chosenSlice = rouletteSlices.find((s) => s.item.id === chosen.id);
      const sliceMidAngle = chosenSlice ? (chosenSlice.startAngle + chosenSlice.endAngle) / 2 : 180;
      
      const targetBase = 270 - sliceMidAngle;
      const currentNorm = ((rouletteRotation % 360) + 360) % 360;
      let diff = targetBase - currentNorm;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      
      const nextRotation = rouletteRotation + diff;
      setRouletteRotation(nextRotation);

      spinTimerRef.current = setTimeout(() => {
        setIsSpinning(false);
        setSelectedRouletteWinner(chosen);
        const matchedMember = members.find((m) => m.id === chosen.id || m.name === chosen.name);
        if (matchedMember) setSelectedTagger(matchedMember);

        if (excludeWinnerMode && rouletteItems.length > 2) {
          setExcludedRouletteItems((prev) => [...prev, chosen]);
          setRouletteItems((prev) => prev.filter((it) => it.id !== chosen.id));
        }
      }, 400);
      return;
    }

    setIsSpinning(true);
    setRouletteTransitionDuration(3600);
    const chosenSlice = rouletteSlices.find((s) => s.item.id === chosen.id);
    const sliceMidAngle = chosenSlice ? (chosenSlice.startAngle + chosenSlice.endAngle) / 2 : 180;
    const targetDeg = 360 * 7 + (270 - sliceMidAngle);

    setRouletteRotation((prev) => prev + targetDeg);

    spinTimerRef.current = setTimeout(() => {
      setIsSpinning(false);
      setSelectedRouletteWinner(chosen);
      const matchedMember = members.find((m) => m.id === chosen.id || m.name === chosen.name);
      if (matchedMember) setSelectedTagger(matchedMember);

      if (excludeWinnerMode && rouletteItems.length > 2) {
        setExcludedRouletteItems((prev) => [...prev, chosen]);
        setRouletteItems((prev) => prev.filter((it) => it.id !== chosen.id));
      }
    }, 3600);
  };

  // 룰렛 결과 텍스트 복사 (카톡 형식)
  const handleCopyRouletteText = () => {
    if (!selectedRouletteWinner) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    let text = `[모아보고 룰렛 추첨 결과]\n`;
    text += `📅 일시: ${dateStr}\n`;
    text += `📌 주제: ${roulettePresetTitle}\n\n`;
    text += `🎯 오늘의 당첨: ${selectedRouletteWinner.avatar} ${selectedRouletteWinner.name} (축하합니다! 🎉)\n\n`;
    text += `📋 전체 후보 항목:\n`;
    rouletteItems.forEach((it) => {
      const pct = Math.round((Math.max(1, it.weight || 1) / totalRouletteWeight) * 100);
      text += `• ${it.avatar} ${it.name} (${pct}%)\n`;
    });
    text += `\n스마트 가계부 & 모임 정산 • 모아보고`;

    navigator.clipboard?.writeText(text).then(() => {
      showToast('룰렛 결과 텍스트가 클립보드에 복사되었습니다.');
    });
  };

  // 룰렛 결과 카드 이미지 복사 (Ctrl+V)
  const handleCopyRouletteImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingRouletteCard(true);
    try {
      const candidates = rouletteItems.map((it) => ({
        name: it.name,
        avatar: it.avatar,
        weight: it.weight || 1,
        pct: Math.round((Math.max(1, it.weight || 1) / totalRouletteWeight) * 100),
      }));

      const blob = await generateRouletteResultCardBlob({
        title: '룰렛 추첨 결과',
        presetTitle: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        candidates,
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });

      const res = await copyBlobToClipboard(blob);
      if (res.success) {
        showToast('룰렛 결과 카드 이미지가 클립보드에 복사되었습니다.');
      } else {
        downloadBlobAsFile(blob, `moabogo_roulette_${Date.now()}.png`);
        showToast('클립보드 권한으로 인해 이미지 파일로 저장되었습니다.', 'info');
      }
    } catch (e) {
      console.error('Failed to generate roulette card:', e);
      showToast('카드 이미지 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingRouletteCard(false);
    }
  };

  // 룰렛 결과 이미지 파일 다운로드
  const handleDownloadRouletteImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingRouletteCard(true);
    try {
      const candidates = rouletteItems.map((it) => ({
        name: it.name,
        avatar: it.avatar,
        weight: it.weight || 1,
        pct: Math.round((Math.max(1, it.weight || 1) / totalRouletteWeight) * 100),
      }));

      const blob = await generateRouletteResultCardBlob({
        title: '룰렛 추첨 결과',
        presetTitle: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        candidates,
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });

      downloadBlobAsFile(blob, `moabogo_roulette_${Date.now()}.png`);
      showToast('룰렛 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download roulette card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingRouletteCard(false);
    }
  };

  // [중복제거 튜닝 3] 당첨자 수동 제외 후 즉시 다음 룰렛 돌리기
  const handleExcludeWinnerAndSpinAgain = () => {
    const winner = selectedRouletteWinner;
    if (!winner) return;
    if (rouletteItems.length <= 2) {
      alert('룰렛 최소 참여 항목은 2개입니다. 더 이상 제외할 수 없습니다.');
      return;
    }
    const remaining = rouletteItems.filter((it) => it.id !== winner.id);
    setExcludedRouletteItems((prev) => [...prev, winner]);
    setRouletteItems(remaining);
    setSelectedRouletteWinner(null);
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
                즐겨보고
              </h2>
              <p className={`text-xs mt-0.5 ${resolvedTheme === 'dawn' ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                원하는 게임 탭을 선택하고 인원수와 옵션을 설정해 보세요.
              </p>
            </div>
          </div>

          {/* 고주목도 세그먼트 탭 (텍스트 분리 줄바꿈 차단 & 탭 요소 단위 통합 반응형 레이아웃) */}
          <div
            className={`grid grid-cols-3 sm:inline-flex items-center p-1 sm:p-1.5 rounded-2xl border shadow-inner w-full sm:w-auto shrink-0 gap-1 sm:gap-1.5 ${
              resolvedTheme === 'dawn' ? 'bg-[#d5e7f9] border-[#aed2f8]' : isDark ? 'bg-[#151518] border-[#27272a]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setGameType('SPLIT')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap min-w-0 ${
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
            </button>
            <button
              type="button"
              onClick={() => setGameType('LADDER')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap min-w-0 ${
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
            </button>
            <button
              type="button"
              onClick={() => setGameType('ROULETTE')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap min-w-0 ${
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
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              설정 항목: {gameType === 'ROULETTE' ? `${rouletteItems.length}개` : `${memberCount}명`}
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

                      {/* 우측 금액 초기화 버튼 */}
                      <div className="flex items-center gap-2 shrink-0">
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

                {/* 정산 인원수 (ElmRng01 표준화) - 금액 옆 1:1 나란히 배치 & 인원수 옆 가중치 스위치 */}
                <div className="space-y-2">
                  <ElmRng01
                    label="인원수"
                    labelExtra={
                      <label
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer select-none border border-slate-200 dark:border-zinc-700 hover:border-indigo-400 transition-colors"
                        title="참가자별 차등 가중치 정산 모드 토글"
                      >
                        <span className="text-[11px] text-slate-700 dark:text-zinc-300">가중치</span>
                        <input
                          type="checkbox"
                          checked={useSplitWeight}
                          onChange={(e) => setUseSplitWeight(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          role="switch"
                          aria-checked={useSplitWeight}
                          className={`w-6 h-3.5 rounded-full transition-colors relative ${
                            useSplitWeight ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-600'
                          }`}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                              useSplitWeight ? 'translate-x-2.5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </label>
                    }
                    value={memberCount}
                    min={2}
                    max={20}
                    step={1}
                    unit="명"
                    onChange={(val) => handleUpdateMemberCount(val)}
                    colorScheme="indigo"
                  />

                  {/* 가중치 모드일 때 안내 툴바 & 일괄 초기화 */}
                  {useSplitWeight && (
                    <div className="flex items-center justify-between text-[11px] pt-1 px-1 flex-wrap gap-2">
                      <span className="font-bold text-slate-500 dark:text-zinc-400">
                        💡 참가자별 가중치 배율 (0: 면제, 0.5: 절반, 1: 기본, 1.5: 음주, 2배 이상):
                      </span>
                      <button
                        type="button"
                        onClick={() => setMembers((prev) => prev.map((m) => ({ ...m, weight: 1 })))}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                      >
                        모두 1배(기본)로 초기화
                      </button>
                    </div>
                  )}

                  {/* 배정된 캐릭터 아바타 및 가중치 스텝퍼 */}
                  <div className="flex items-center gap-2 flex-wrap pt-1.5 max-h-48 overflow-y-auto pr-1">
                    {members.map((m) => {
                      const w = m.weight ?? 1;
                      return (
                        <div
                          key={m.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border shadow-2xs transition-all ${m.bgLight} ${m.color}`}
                        >
                          <span className="text-sm select-none">{m.avatar}</span>
                          <input
                            type="text"
                            lang="ko"
                            value={m.name}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                            className="w-16 bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-indigo-500"
                          />
                          {useSplitWeight && (
                            <div className="flex items-center gap-1 pl-1.5 border-l border-current/20 select-none">
                              <button
                                type="button"
                                onClick={() => updateSplitMemberWeight(m.id, -0.5)}
                                disabled={w <= 0}
                                className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25 cursor-pointer font-black text-xs"
                                title="가중치 0.5배 감소"
                              >
                                -
                              </button>
                              <span className={`text-[11px] font-black min-w-[30px] text-center font-mono ${w === 0 ? 'text-slate-400' : ''}`}>
                                {w === 0 ? '면제' : `${w}배`}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateSplitMemberWeight(m.id, 0.5)}
                                disabled={w >= 10}
                                className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25 cursor-pointer font-black text-xs"
                                title="가중치 0.5배 증가"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                        {useSplitWeight ? '가중치 차등 정산 결과' : '스마트 정산 결과'}
                      </span>
                      {useSplitWeight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          총 가중치 합계: {settlementSummary.totalWeight}배
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {useSplitWeight ? '기준 1배당' : '1인당'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold">
                        ₩{useSplitWeight ? settlementSummary.baseUnitAmount.toLocaleString() : settlementSummary.perPerson.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">원</span>
                      {settlementSummary.remainder > 0 && (
                        <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          (자투리 {settlementSummary.remainder.toLocaleString()}원 제외)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. 정산 결과복사 액션 바 (텍스트, 카드 이미지 복사, 이미지 저장) */}
                  {/* 2. 정산 결과복사 액션 바 (텍스트 제거, 아이콘 전용 버튼화) */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0">
                      결과복사:
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* 1. 카톡/텍스트 복사 버튼 (아이콘 전용) */}
                      <button
                        type="button"
                        onClick={handleCopySettlementText}
                        className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                        title="카톡 송금 요청 텍스트 복사"
                        aria-label="결과 텍스트 복사"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* 2. 카드 이미지 복사 (아이콘 전용, Ctrl+V) */}
                      <button
                        type="button"
                        onClick={handleCopySettlementImageCard}
                        disabled={isGeneratingSettlementCard}
                        className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                        title="카드 이미지 복사 (Ctrl+V)"
                        aria-label="카드 이미지 복사"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      {/* 3. 이미지 다운로드 (아이콘 전용) */}
                      <button
                        type="button"
                        onClick={handleDownloadSettlementImageCard}
                        disabled={isGeneratingSettlementCard}
                        className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                        title="카드 이미지 파일 저장 (다운로드)"
                        aria-label="카드 이미지 저장"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 참가자별 송금 체크 인터랙티브 카드 그리드 */}
                <div>
                  <p className="text-xs font-bold mb-2.5 text-slate-400">
                    참가자별 송금 확인 (클릭하여 완료 토글):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {members.map((m) => {
                      const share = settlementSummary.memberShares[m.id];
                      const memberAmount = share ? share.amount : settlementSummary.perPerson;
                      const memberWeight = share ? share.weight : 1;
                      const isExempt = useSplitWeight && memberWeight === 0;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleSentStatus(m.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
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
                            <span className="text-lg p-1.5 rounded-lg bg-black/20 shrink-0">{m.avatar}</span>
                            <div className="truncate min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={`text-xs font-bold truncate ${m.isSent ? 'line-through text-slate-500' : ''}`}>
                                  {m.name}
                                </p>
                                {useSplitWeight && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                      isExempt
                                        ? 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                    }`}
                                  >
                                    {isExempt ? '면제' : `${memberWeight}배`}
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs font-semibold mt-0.5 ${isExempt ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300 font-mono font-bold'}`}>
                                ₩{memberAmount.toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          <span className={`p-1 rounded-full text-xs shrink-0 ${m.isSent ? 'bg-emerald-600 text-white' : 'bg-black/20 text-slate-500'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              사다리타기 (인스턴트 공유방, 자리 점유 토글, 매장 메뉴 연동, 역할 분리)
              ----------------------------------------------------------------- */}
          {gameType === 'LADDER' && (
            <div className="space-y-6">
              {/* 잘못된 링크키 경고 배너 */}
              {invalidRoomNotice && (
                <aside className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>{invalidRoomNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExitRoom}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    새 게임 시작하기
                  </button>
                </aside>
              )}

              {/* 1. 인스턴트 실시간 공유방 헤더 & 연동 매장 배너 */}
              <div
                className={`p-4 rounded-2xl border space-y-4 transition-all ${
                  isRoomMode
                    ? 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                    : resolvedTheme === 'dawn'
                    ? 'bg-[#f0f7ff] border-[#bfdbfe]'
                    : isDark
                    ? 'bg-[#1a1a1e] border-[#27272a]'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {!isRoomMode ? (
                  // 방 생성 전 인트로 배너: 한 줄로 표시 후 매장 선택 시 게임공유, ? 는 맨 뒤
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {selectedStore ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setStoreSelectTab('MY');
                              setIsStoreSelectModalOpen(true);
                            }}
                            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-800 shadow-2xs"
                            title="클릭하여 이번 사다리 게임에 적용할 매장 변경"
                          >
                            <Store className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            <span>🏪 {selectedStore.name}</span>
                            <ChevronDown className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-300 stroke-[2.5] shrink-0 ml-0.5" />
                          </button>

                          {/* 1.1: 메뉴판 버튼 */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectingTargetMemberId(null);
                              setIsMenuModalOpen(true);
                            }}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 hover:border-emerald-500 cursor-pointer shadow-2xs"
                          >
                            <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                            <span>메뉴판 ({selectedStore.menus.length}종)</span>
                          </button>

                          {/* 1.1: 매장닫기 버튼 (메뉴판 뒤로 배치) */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStore(null);
                              setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined })));
                            }}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-600 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs shrink-0"
                            title="매장 닫기"
                            aria-label="매장 닫기"
                          >
                            <X className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>

                        {/* 1.2: 매장 선택 시: 게임공유, ? 는 맨 뒤(우측) 정렬 */}
                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          <button
                            type="button"
                            onClick={handleCreateRoom}
                            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>게임공유</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsStoreHelpOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                            title="사다리 및 매장 연동 주문서 안내"
                            aria-label="사다리 및 매장 연동 주문서 안내"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      /* 매장 미선택 시: [+ 매장 선택]은 좌측, [게임공유], [?]는 우측(ml-auto) 정렬 */
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setStoreSelectTab('MY');
                              setIsStoreSelectModalOpen(true);
                            }}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                            title="매장을 선택하면 메뉴 취합 및 주문서가 연동됩니다"
                          >
                            <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>+ 매장 선택</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          <button
                            type="button"
                            onClick={handleCreateRoom}
                            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>게임공유</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsStoreHelpOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                            title="사다리 및 매장 연동 주문서 안내"
                            aria-label="사다리 및 매장 연동 주문서 안내"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // 실시간 공유방 활성화 상태
                  <div className="space-y-3.5">
                    <div className="flex flex-col gap-3 border-b border-indigo-200/60 dark:border-indigo-900/40 pb-3">
                      {/* 상단 행: 방 코드 & 초대링크 복사 + 게임공유 끄기 버튼 + 안내 버튼 */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center gap-1 shadow-xs">
                            <span>방 코드: {roomCode}</span>
                          </span>
                        </div>

                        {/* 초대 링크 복사 & 게임공유 끄기 버튼 & 안내 버튼 */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyInviteLink}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                            title="초대 링크를 복사합니다"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{roomCopyToast ? '✓ 초대링크 복사완료!' : '초대링크 복사'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleExitRoom}
                            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
                            title="게임공유를 끄고 혼자하기 모드로 복귀합니다"
                          >
                            게임공유 끄기
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsStoreHelpOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                            title="사다리 및 매장 연동 주문서 안내"
                            aria-label="사다리 및 매장 연동 주문서 안내"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 하단 행: 매장 선택 / 취소 / 메뉴판 */}
                      <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                        {selectedStore ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setStoreSelectTab('MY');
                                setIsStoreSelectModalOpen(true);
                              }}
                              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 cursor-pointer shadow-2xs transition-all"
                              title="클릭하여 이번 사다리에 사용할 단골 매장 변경"
                            >
                              <Store className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{selectedStore.name}</span>
                              <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5] ml-0.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectingTargetMemberId(null);
                                setIsMenuModalOpen(true);
                              }}
                              className="min-h-[36px] px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 cursor-pointer"
                            >
                              📋 메뉴판 ({selectedStore.menus.length}종)
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStore(null);
                                setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined })));
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-600 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs shrink-0"
                              title="매장 닫기"
                              aria-label="매장 닫기"
                            >
                              <X className="w-4 h-4 text-rose-500" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setStoreSelectTab('MY');
                                setIsStoreSelectModalOpen(true);
                              }}
                              className="min-h-[36px] px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 cursor-pointer shadow-2xs transition-all"
                              title="매장을 선택하면 메뉴 취합이 가능합니다"
                            >
                              <Store className="w-3.5 h-3.5 text-indigo-600" />
                              <span>+ 매장 선택</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 뷰 전환 시뮬레이터 툴바 (마스터 vs 참가자 시점) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#131B2E] border border-indigo-100 dark:border-indigo-950 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-zinc-300">내 시점 전환:</span>
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-700 p-0.5 bg-slate-100 dark:bg-zinc-900">
                          <button
                            type="button"
                            onClick={() => setIsMasterView(true)}
                            className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              isMasterView
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                            }`}
                          >
                            👑 방장 (마스터) 모드
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsMasterView(false)}
                            className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              !isMasterView
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                            }`}
                          >
                            👤 참가자 (게스트) 모드
                          </button>
                        </div>
                      </div>

                      {/* 내 닉네임 인라인 수정 */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">내 닉네임:</span>
                        <input
                          type="text"
                          value={myNickname}
                          onChange={(e) => setMyNickname(e.target.value)}
                          className="min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 w-32"
                          placeholder="내 이름 입력"
                        />
                      </div>
                    </div>

                    {/* 참가자 대기방 (Lobby) 카드 스트립 */}
                    <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="font-bold whitespace-nowrap shrink-0">
                          👥 참가자 대기방 ({members.filter((m) => m.claimedBy).length + 1}명 접속 중)
                        </span>
                        <span className="text-[10px] sm:text-[11px] whitespace-normal sm:whitespace-nowrap break-keep leading-tight">
                          * 비로그인 참가자는 [내 자리 찜하기]로 원하는 기둥을 점유할 수 있습니다.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 현재 내 아바타 (하이라이트) */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-500 text-indigo-900 dark:text-indigo-200 text-xs font-bold shadow-2xs whitespace-nowrap shrink-0">
                          <span className="text-base">😎</span>
                          <span>{myNickname}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-semibold">
                            YOU
                          </span>
                        </div>

                        {/* 다른 점유자들 */}
                        {members
                          .filter((m) => m.claimedBy && m.claimedBy !== currentTabId)
                          .map((m) => (
                            <div
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium whitespace-nowrap shrink-0"
                            >
                              <span>{m.avatar}</span>
                              <span>{m.name}</span>
                              {m.selectedMenu && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                  ({m.selectedMenu.name})
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 게임 설정 패널 (마스터만 조작 가능) */}
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  resolvedTheme === 'dawn' ? 'bg-[#f0f7ff] border-[#bfdbfe]' : isDark ? 'bg-[#1a1a1e] border-[#27272a]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {/* 4. 참여자 안내문구 복구 (방장 전용 조작 권한 안내) */}
                {isRoomMode && !isMasterView && (
                  <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <span className="font-medium">
                        방장님이 참가 인원 수({memberCount}명)와 당첨 인원 수({winnerCount}명)를 설정하고 있습니다.
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full shrink-0">
                      조작 권한: 방장 전용
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 인원수 / 설정 항목 (ElmRng01 표준화) */}
                    <ElmRng01
                      label="설정 항목"
                      value={memberCount}
                      min={2}
                      max={20}
                      step={1}
                      unit="명"
                      disabled={isRoomMode && !isMasterView}
                      onChange={(val) => handleUpdateMemberCount(val)}
                      colorScheme="indigo"
                    />

                    {/* 선택 인원수 (ElmRng01 표준화) */}
                    <ElmRng01
                      label="선택 인원수"
                      value={winnerCount}
                      min={1}
                      max={Math.max(1, memberCount - 1)}
                      step={1}
                      unit="명"
                      disabled={isRoomMode && !isMasterView}
                      onChange={(val) => setWinnerCount(val)}
                      colorScheme="rose"
                    />
                  </div>
                </div>

                {/* 가중치 설정 & 이름수정 */}
                <div
                  className={`pt-2 border-t ${
                    resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-slate-200/80'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer select-text">
                    <input
                      type="checkbox"
                      checked={useLadderWeight}
                      onChange={(e) => setUseLadderWeight(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm cursor-pointer"
                    />
                    <span className="text-xs font-bold select-text cursor-pointer">확률 가중치 설정</span>
                  </label>

                  {useLadderWeight && (
                    <div
                      className={`mt-3 p-3 rounded-lg border space-y-2.5 ${
                        resolvedTheme === 'dawn' ? 'bg-white border-[#bfdbfe]' : isDark ? 'bg-[#151518] border-[#27272a]' : 'bg-white border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 select-text">
                        <span className="font-semibold select-text">참가자 가중치 증감</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-indigo-400 font-semibold select-text">가중치 비율</span>
                          <button
                            type="button"
                            onClick={handleResetWeights}
                            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="모든 참가자 가중치 균등 초기화 (1:1 리셋)"
                            aria-label="가중치 초기화"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {members.map((m) => {
                          const minW = Math.min(...members.map((x) => (x.weight !== undefined ? x.weight : 1)));
                          const baseOffset = minW <= 0 ? (1 - minW) : 0;
                          const currentW = m.weight !== undefined ? m.weight : 1;
                          const effW = currentW + baseOffset;
                          const totalEffW = members.reduce((s, x) => s + ((x.weight !== undefined ? x.weight : 1) + baseOffset), 0);
                          const pct = totalEffW > 0 ? Math.round((effW / totalEffW) * 100) : 0;
                          return (
                            <div
                              key={m.id}
                              className="flex items-center justify-between p-2 rounded-lg border gap-2 bg-black/10 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700/80"
                            >
                              {/* 4. 이름변경 input 제거, 말줄임 & 롱프레스 전체텍스트 확인 */}
                              <div
                                className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer select-text"
                                title={`${m.name} (길게 누르거나 탭하면 전체 이름 확인)`}
                                onTouchStart={(e) => {
                                  const touch = e.touches[0];
                                  const x = touch.clientX;
                                  const y = touch.clientY;
                                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                  longPressTimerRef.current = setTimeout(() => {
                                    navigator.vibrate?.(40);
                                    setMemberNameTooltip({ id: m.id, name: m.name, x, y });
                                  }, 400);
                                }}
                                onTouchEnd={() => {
                                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                }}
                                onClick={() => {
                                  setMemberNameTooltip((prev) => (prev?.id === m.id ? null : { id: m.id, name: m.name, x: 0, y: 0 }));
                                }}
                              >
                                <span className="text-base shrink-0">{m.avatar}</span>
                                <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[110px] text-slate-800 dark:text-zinc-200 select-text">
                                  {m.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateMemberWeight(m.id, -1)}
                                  disabled={currentW <= -5}
                                  className="w-6 h-6 rounded border flex items-center justify-center disabled:opacity-30 bg-black/5 dark:bg-zinc-700/60 hover:bg-black/10 cursor-pointer text-slate-700 dark:text-zinc-200"
                                  title="가중치 감소 (음수 허용 시 다른 사람 당첨 비율 상승)"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className={`text-xs font-bold w-6 text-center select-text ${currentW < 0 ? 'text-rose-500 font-extrabold' : ''}`}>
                                  {currentW}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateMemberWeight(m.id, 1)}
                                  disabled={currentW >= 10}
                                  className="w-6 h-6 rounded border flex items-center justify-center disabled:opacity-30 bg-black/5 dark:bg-zinc-700/60 hover:bg-black/10 cursor-pointer text-slate-700 dark:text-zinc-200"
                                  title="가중치 증가"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-extrabold text-indigo-400 w-9 text-right select-text">
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
                      className={`flex flex-col items-start py-2 px-2 shrink-0 ${
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
                          const isMyClaim = m.claimedBy === currentTabId;
                          const isOtherClaim = m.claimedBy && !isMyClaim;

                          return (
                            <div
                              key={m.id}
                              className="flex flex-col items-center shrink-0"
                              style={{ width: `${LADDER_COL_WIDTH}px` }}
                            >
                              {/* 인스턴트 공유방: 자리 찜하기 토글 버튼 */}
                              {isRoomMode && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleClaim(m.id)}
                                  className={`min-h-[24px] px-1.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all border mb-0.5 select-text ${
                                    isMyClaim
                                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                      : isOtherClaim
                                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-500 border-transparent cursor-not-allowed'
                                      : 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
                                  }`}
                                  title={isMyClaim ? '클릭 시 내 자리 점유 해제' : isOtherClaim ? '다른 참가자가 점유 중입니다' : '이 자리를 내 자리로 찜합니다'}
                                  disabled={Boolean(isOtherClaim)}
                                >
                                  {isMyClaim ? '✓ 찜해제' : isOtherClaim ? '선점됨' : '📌 찜하기'}
                                </button>
                              )}

                              {/* 아바타 + 이름: 홀짝 살짝 위아래 지그재그 (고정 높이 컨테이너로 감싸서 아래 메뉴명/번호 높이에 영향 없음) */}
                              <div className="h-[74px] flex flex-col justify-end items-center">
                                <div className={`flex flex-col items-center gap-0.5 transition-transform duration-200 ${isOdd ? 'translate-y-1.5' : '-translate-y-1.5'}`}>
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm border-2 overflow-hidden relative ${
                                      m.bgLight
                                    } ${isMyClaim ? 'ring-2 ring-indigo-500 scale-105' : ''} ${
                                      isCurrentActive ? 'scale-125 ring-4 ring-indigo-500 animate-pulse' : ''
                                    }`}
                                  >
                                    {selectedStore && m.selectedMenu?.imageUrl ? (
                                      <>
                                        <img
                                          src={m.selectedMenu.imageUrl}
                                          alt={m.selectedMenu.name}
                                          className="w-full h-full object-cover"
                                        />
                                        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-white/90 dark:bg-zinc-900/90 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-2xs border border-slate-200 dark:border-zinc-700 pointer-events-none">
                                          {m.avatar}
                                        </span>
                                      </>
                                    ) : (
                                      m.avatar
                                    )}
                                  </div>

                                  {/* 3. 폭 맞추고 텍스트는 줄바꿈 지원 textarea */}
                                  <textarea
                                    rows={1}
                                    lang="ko"
                                    value={m.name}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                                    className="text-[11px] font-bold text-center w-[76px] bg-transparent outline-none resize-none overflow-hidden leading-tight break-words py-0 border-b border-transparent focus:border-indigo-500 min-h-[18px] max-h-[30px] select-text"
                                  />
                                </div>
                              </div>

                              {/* 선택한 메뉴 칩 or 메뉴 고르기 버튼 (매장 선택 시 모든 기둥에서 완벽하게 동일한 높이 h-7 슬롯) */}
                              {selectedStore && (
                                <div className="h-7 flex items-center justify-center relative mt-0.5 mb-1">
                                  {m.selectedMenu ? (
                                    <button
                                      type="button"
                                      onTouchStart={(e) => {
                                        isLongPressTriggeredRef.current = false;
                                        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                        const touch = e.touches[0];
                                        const clientX = touch.clientX;
                                        const clientY = touch.clientY;
                                        longPressTimerRef.current = setTimeout(() => {
                                          isLongPressTriggeredRef.current = true;
                                          navigator.vibrate?.(40);
                                          setMenuTooltip({
                                            memberId: m.id,
                                            menu: m.selectedMenu!,
                                            x: clientX,
                                            y: clientY,
                                          });
                                        }, 450);
                                      }}
                                      onTouchEnd={() => {
                                        if (longPressTimerRef.current) {
                                          clearTimeout(longPressTimerRef.current);
                                          longPressTimerRef.current = null;
                                        }
                                        if (!isLongPressTriggeredRef.current) {
                                          handleOpenMenuModalForMember(m.id);
                                        }
                                      }}
                                      onTouchMove={() => {
                                        if (longPressTimerRef.current) {
                                          clearTimeout(longPressTimerRef.current);
                                          longPressTimerRef.current = null;
                                        }
                                      }}
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setMenuTooltip({
                                          memberId: m.id,
                                          menu: m.selectedMenu!,
                                          x: rect.left + rect.width / 2,
                                          y: rect.top,
                                        });
                                      }}
                                      onMouseLeave={() => {
                                        setMenuTooltip(null);
                                      }}
                                      onClick={() => {
                                        if (!isLongPressTriggeredRef.current) {
                                          handleOpenMenuModalForMember(m.id);
                                        }
                                      }}
                                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 truncate max-w-[80px] hover:border-emerald-500 cursor-pointer block select-text active:scale-95 transition-all shadow-2xs"
                                      title="클릭: 메뉴 변경 | 길게 누름(롱프레스): 풀텍스트 확인"
                                    >
                                      {m.selectedMenu.name}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMenuModalForMember(m.id)}
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 cursor-pointer shadow-2xs transition-colors select-text"
                                    >
                                      +메뉴선택
                                    </button>
                                  )}
                                </div>
                              )}
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

                      {/* 3. 하단 대상 목표 (클릭 시 전폭 레이어 팝업으로 펼쳐져 입력창+목록 선택) */}
                      <div
                        className="flex items-start pt-2 pb-4 relative min-h-[76px]"
                        style={{ width: `${members.length * LADDER_COL_WIDTH}px` }}
                      >
                        {ladderGoals.slice(0, members.length).map((goal, idx) => {
                          const isOdd = idx % 2 === 1;
                          const landedMember = revealedGoalCols[idx];

                          return (
                            <div
                              key={`goal_${idx}`}
                              className={`flex flex-col items-center shrink-0 transition-transform duration-200 ${
                                isOdd ? 'translate-y-2' : '-translate-y-1'
                              }`}
                              style={{ width: `${LADDER_COL_WIDTH}px` }}
                            >
                              {/* 도착자 실시간 뱃지 */}
                              {landedMember && (
                                <div
                                  className={`mb-1 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-xs animate-in zoom-in-95 duration-150 select-text ${
                                    landedMember.isWinner
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                                      : 'bg-indigo-600 text-white'
                                  }`}
                                >
                                  <span>{landedMember.avatar}</span>
                                  <span className="truncate max-w-[45px] select-text">{landedMember.memberName}</span>
                                </div>
                              )}

                              {/* 목표 카드 버튼 (클릭 시 전폭 레이어 팝업 오픈) */}
                              <button
                                type="button"
                                onClick={() => handleOpenGoalModal(idx)}
                                className={`w-[76px] py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-center transition-all group cursor-pointer shadow-2xs select-text ${
                                  landedMember
                                    ? landedMember.isWinner
                                      ? 'ring-2 ring-rose-500 scale-105 bg-rose-50/90 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700'
                                      : 'ring-2 ring-indigo-500 scale-105 bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700'
                                    : resolvedTheme === 'dawn'
                                    ? 'bg-white hover:bg-blue-50/80 border-[#bfdbfe] text-blue-900 active:scale-95'
                                    : isDark
                                    ? 'bg-[#151518] hover:bg-[#1f1f24] border-[#27272a] text-zinc-100 active:scale-95'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 active:scale-95'
                                }`}
                                title={`${idx + 1}번 목표 수정 (클릭하여 변경)`}
                              >
                                <span className="text-lg leading-none transition-transform group-hover:scale-110">
                                  {goal.icon}
                                </span>
                                <div className="flex items-center justify-center gap-0.5 w-full px-0.5">
                                  <span className="text-[11px] font-bold truncate max-w-[54px] leading-tight select-text">
                                    {goal.text}
                                  </span>
                                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                                </div>
                              </button>
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

                  {/* 사다리 목표 프리셋 목록 관리 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsGoalPresetsModalOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer ${
                      resolvedTheme === 'dawn'
                        ? 'bg-white border-blue-200 text-blue-900 hover:border-indigo-400'
                        : isDark
                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 hover:border-indigo-400'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400'
                    }`}
                    title="사다리 목표 선택 목록 관리 (추가/삭제/아이콘 설정)"
                  >
                    <Settings className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="whitespace-nowrap">목표 목록 관리</span>
                  </button>

                  {isRoomMode && !isMasterView ? (
                    <div className="flex items-center justify-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold gap-2 animate-pulse">
                      <span>👑</span>
                      <span>방장님이 사다리를 시작하기를 기다리고 있습니다... (자리를 찜하고 메뉴를 선택해주세요)</span>
                    </div>
                  ) : (
                    <>
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
                      {savedLadderResult && !ladderResult && !isLadderTracing && (
                        <button
                          type="button"
                          onClick={() => setLadderResult(savedLadderResult)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 animate-in fade-in"
                          title="이전에 완료된 사다리 최종 결과를 다시 확인합니다"
                        >
                          <Trophy className="w-4 h-4 shrink-0 text-amber-300" />
                          <span className="whitespace-nowrap">최종결과</span>
                        </button>
                      )}
                    </>
                  )}
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

                {/* 사다리 결과 오버레이 (반투명 백드롭 + 명확한 모달 카드 테두리 + 우상단 닫기버튼) */}
                {ladderResult && (
                  <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
                    <div
                      className={`relative w-full max-w-2xl max-h-[92%] overflow-y-auto rounded-3xl p-5 sm:p-6 border-2 shadow-2xl flex flex-col items-center text-center transition-all ${
                        resolvedTheme === 'dawn'
                          ? 'bg-[#f0f7ff] border-[#8ec0f5] text-[#0d2746]'
                          : isDark
                          ? 'bg-[#14151a] border-zinc-700 text-white shadow-black/80'
                          : 'bg-white border-indigo-300 text-slate-900 shadow-xl'
                      }`}
                    >
                      {/* 2. 우상단 닫기 버튼 */}
                      <button
                        type="button"
                        onClick={() => setLadderResult(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs z-10"
                        title="결과 닫기"
                        aria-label="결과 닫기"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="text-center space-y-1.5 mb-4 pr-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-extrabold border border-amber-500/30">
                          <Trophy className="w-4 h-4" />
                          <span>사다리타기 최종 결과</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold">
                          당첨자 & 결과 매칭
                        </h3>
                      </div>

                      {/* 2. 사다리 실행완료 화면 팝업: 가로 목록 및 너비 초과 시 줄바꿈 (1열 당첨자 / 2열 나머지) */}
                      <div className="w-full max-w-xl max-h-64 sm:max-h-72 overflow-y-auto space-y-4 px-1 py-1">
                        {(() => {
                          const winnerMembers = members.filter((m) => ladderResult[m.id]?.isWinner);
                          const otherMembers = members.filter((m) => !ladderResult[m.id]?.isWinner);

                          return (
                            <>
                              {/* 1열: 상단 당첨 이름표시된 아이콘 목록 */}
                              {winnerMembers.length > 0 && (
                                <div className="space-y-1.5 text-left">
                                  <div className="flex items-center justify-between px-1 flex-wrap gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                        🎉 당첨자 명단
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                        {winnerMembers.length}명
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">당첨 대상</span>
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
                                  <div className="flex items-center justify-between px-1 flex-wrap gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        🍀 나머지 참가자
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold">
                                        {otherMembers.length}명
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">통과 대상</span>
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

                      {/* 1.2, 1.4 매장 연동 시에만 간결하게 노출되는 주문 취합표 (요소 간 줄바꿈 유연 배치) */}
                      {selectedStore && orderSummaryData && (
                        <div className="w-full max-w-xl p-3.5 mt-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-left space-y-2.5">
                          {/* 1.2 주문 취합 내역서 헤더 & 총액 */}
                          <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Coffee className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                📋 {selectedStore.name} 주문 취합 내역
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              총 {orderSummaryData.totalCount}잔 • {orderSummaryData.totalAmount.toLocaleString()}원
                            </span>
                          </div>

                          {/* 1.4 & 2.3 메뉴별 수량 집계: 요소 간 유연한 줄바꿈 */}
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {Object.entries(orderSummaryData.menuCounts).map(([name, item]) => (
                              <div
                                key={name}
                                className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-zinc-800/60 gap-1 sm:gap-2"
                              >
                                <span className="text-slate-700 dark:text-zinc-300 font-medium break-words leading-tight">
                                  {name}
                                </span>
                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {item.count}잔
                                  </span>
                                  <span className="text-slate-500 font-mono">
                                    {item.subtotal.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 결과 복사 아이콘 버튼 바 (줄바꿈 시 '결과 복사:' 뒤에서 줄바꿈되고 버튼들은 한 줄로 나열) */}
                      <div className="w-full max-w-xl mt-3 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0 max-sm:w-full max-sm:text-center">
                          결과 복사:
                        </span>

                        <div className="flex items-center justify-center gap-2 shrink-0">
                          {/* 1. 텍스트 복사 아이콘 버튼 */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(ladderGeneralShareText).then(() => {
                                showToast('사다리 결과 텍스트가 클립보드에 복사되었습니다.');
                              });
                            }}
                            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                            title={selectedStore ? '주문서 및 결과 텍스트 복사' : '결과 텍스트 복사'}
                            aria-label="결과 텍스트 복사"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* 2. 카드 이미지 복사 (Ctrl+V) 아이콘 버튼 */}
                          <button
                            type="button"
                            onClick={handleCopyLadderImageCard}
                            disabled={isGeneratingLadderCard}
                            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                            title={copiedLadderImage ? '✓ 카드 이미지 복사됨!' : '카드 이미지 복사 (Ctrl+V)'}
                            aria-label="카드 이미지 복사"
                          >
                            <Camera className="w-4 h-4" />
                          </button>

                          {/* 3. 이미지 다운로드 아이콘 버튼 */}
                          <button
                            type="button"
                            onClick={handleDownloadLadderImageCard}
                            disabled={isGeneratingLadderCard}
                            className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                            title="카드 이미지 파일 저장 (다운로드)"
                            aria-label="카드 이미지 저장"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 4. 액션 아이콘 버튼 바: 새 사다리 재추첨(확대된 반복원 + 선명한 주사위), 동일 사다리(삼각형두개), 결과 닫기(X) 나란히 */}
                      <div className="mt-4 flex items-center justify-center gap-3">
                        {/* 새 사다리로 재추첨 (키운 반복원 + 확실하게 식별되는 주사위 아이콘) */}
                        <button
                          type="button"
                          onClick={handlePlayAgain}
                          className="h-11 px-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                          title="새 사다리로 재추첨"
                          aria-label="새 사다리로 재추첨"
                        >
                          <RotateCcw className="w-5 h-5 stroke-[2.2] text-indigo-100" />
                          <Dices className="w-5 h-5 stroke-[2.2] text-white" />
                        </button>

                        {/* 동일 사다리 다시 타기 (삼각형 두개 아이콘 - FastForward) */}
                        <button
                          type="button"
                          onClick={() => handlePlayLadder(false, ladderRungs)}
                          className="w-11 h-11 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                          title="동일 사다리 다시 타기"
                          aria-label="동일 사다리 다시 타기"
                        >
                          <FastForward className="w-5 h-5" />
                        </button>

                        {/* 결과 닫기 (X 아이콘) */}
                        <button
                          type="button"
                          onClick={() => setLadderResult(null)}
                          className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-600 dark:text-zinc-300 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 border border-slate-200 dark:border-zinc-700"
                          title="결과 닫기"
                          aria-label="결과 닫기"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Store Menu Board Modal (사다리 화면 내 매장 전체 메뉴판 및 선택 레이어) */}
          {isMenuModalOpen && selectedStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
                {/* Modal Header */}
                <div
                  className="p-4 sm:p-5 text-white flex items-center justify-between gap-3 shrink-0"
                  style={{ backgroundColor: selectedStore.themeColor || '#006241' }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-bold">{selectedStore.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                        전체 {selectedStore.menus.length}종
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-0.5">
                      {selectedStore.locationMemo} • {selectedStore.partnerBrand}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedStore.naverBookingUrl && (
                      <a
                        href={selectedStore.naverBookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                        title="네이버 주문/예약 페이지 열기"
                        aria-label="네이버 주문"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuModalOpen(false);
                        setSelectingTargetMemberId(null);
                      }}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm cursor-pointer transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle / Mode Notice */}
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    {selectingTargetMemberId
                      ? `👉 [${members.find((m) => m.id === selectingTargetMemberId)?.name || '참가자'}] 님의 메뉴를 아래에서 선택해주세요.`
                      : '📋 매장 전체 메뉴판 열람 모드입니다. (사다리 기둥의 [+메뉴선택]을 누르면 즉시 배정됩니다)'}
                  </span>
                </div>

                {/* Category Filter Chips */}
                <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0B0F17]/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuModalCategory('전체')}
                    className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      menuModalCategory === '전체'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    전체 ({selectedStore.menus.length})
                  </button>
                  {selectedStore.menuCategories.map((cat) => {
                    const count = selectedStore.menus.filter((m) => m.categoryName === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setMenuModalCategory(cat)}
                        className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          menuModalCategory === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Menu List Scrollable Area */}
                <div className="p-4 overflow-y-auto space-y-2 flex-1 overscroll-contain">
                  {selectedStore.menus
                    .filter((m) => menuModalCategory === '전체' || m.categoryName === menuModalCategory)
                    .map((menu) => (
                      <div
                        key={menu.id}
                        onClick={() => {
                          if (selectingTargetMemberId) {
                            handleSelectMenuForMember(menu);
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          selectingTargetMemberId
                            ? 'cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 active:scale-[0.99]'
                            : ''
                        } bg-slate-50 dark:bg-[#0B0F17] border-slate-200/80 dark:border-zinc-800`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {menu.imageUrl ? (
                            <img
                              src={menu.imageUrl}
                              alt={menu.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-xl border border-slate-200/50 dark:border-zinc-700/50">
                              🍽️
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                                {menu.name}
                              </span>
                              {menu.badge && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    menu.badge === 'BEST'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  }`}
                                >
                                  {menu.badge}
                                </span>
                              )}
                              {menu.temperature && (
                                <span className="text-[10px] text-slate-400">
                                  [{menu.temperature}]
                                </span>
                              )}
                            </div>
                            {menu.description && (
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                {menu.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {menu.price.toLocaleString()}원
                          </span>
                          {selectingTargetMemberId && (
                            <span className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-2xs">
                              선택
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuModalOpen(false);
                      setSelectingTargetMemberId(null);
                    }}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              2.1 사다리 연동 매장 선택 팝업 모달 (단골 매장 즐겨찾기 연동)
              ----------------------------------------------------------------- */}
          {isStoreSelectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                        사다리 연동 매장 선택
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        이번 사다리 게임에 적용할 매장을 선택하세요. 참가자들이 해당 매장의 메뉴를 고르게 됩니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStoreSelectModalOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Switch: 내 단골 매장 vs 전체 매장 */}
                <div className="px-4 pt-3 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStoreSelectTab('MY')}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      storeSelectTab === 'MY'
                        ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                    }`}
                  >
                    <span>⭐ 내 단골 매장 ({userStorePref.myStoreIds.length}개)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreSelectTab('ALL')}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      storeSelectTab === 'ALL'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                    }`}
                  >
                    <span>🌐 전체 매장 둘러보기 ({SYSTEM_STORE_POOL.length}개)</span>
                  </button>
                </div>

                {/* Store Cards List */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                  {(() => {
                    const targetStores =
                      storeSelectTab === 'MY'
                        ? SYSTEM_STORE_POOL.filter((s) => userStorePref.myStoreIds.includes(s.id))
                        : SYSTEM_STORE_POOL;

                    if (targetStores.length === 0) {
                      return (
                        <div className="py-12 text-center space-y-3">
                          <Store className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            등록된 단골 매장이 없습니다.
                          </p>
                          <button
                            type="button"
                            onClick={() => setStoreSelectTab('ALL')}
                            className="min-h-[38px] px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                          >
                            전체 매장에서 고르기
                          </button>
                        </div>
                      );
                    }

                    return targetStores.map((store) => {
                      const isCurrent = selectedStore?.id === store.id;
                      const isFavorited = userStorePref.myStoreIds.includes(store.id);

                      return (
                        <div
                          key={store.id}
                          onClick={() => handleSelectStore(store)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                              : 'border-slate-200 dark:border-zinc-700 hover:border-emerald-400 bg-white dark:bg-[#172239]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                              style={{ backgroundColor: store.themeColor || '#006241' }}
                            >
                              <Store className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                  {store.name}
                                </span>
                                {isFavorited && (
                                  <span className="text-[10px] text-amber-500 font-bold">⭐</span>
                                )}
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                                    현재 선택됨
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                {store.partnerBrand || store.categoryLabel} • 메뉴 {store.menus.length}종
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                📍 {store.locationMemo}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                              isCurrent
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {isCurrent ? '선택중' : '매장선택'}
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {selectedStore && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStore(null);
                          setMembers((prev) => prev.map((m) => ({ ...m, selectedMenu: undefined })));
                          setIsStoreSelectModalOpen(false);
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors flex items-center gap-1"
                        title="선택된 매장을 취소하고 기본 사다리로 돌아갑니다"
                      >
                        <X className="w-3.5 h-3.5 text-rose-500" />
                        <span>매장 선택 취소 (해제)</span>
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      💡 사용자 설정에서 즐겨찾기 관리 가능
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStoreSelectModalOpen(false)}
                    className="min-h-[40px] px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              2.1.B 매장 연동 및 사다리 주문서 취합 안내 레이어 팝업
              ----------------------------------------------------------------- */}
          {isStoreHelpOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsStoreHelpOpen(false)}
            >
              <div
                className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 text-lg">
                      ☕
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                        매장 연동 & 사다리 주문서 안내
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        단순 사다리 타기 또는 음료 주문서 자동 연동
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStoreHelpOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="닫기"
                    aria-label="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 sm:p-5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                  <p className="font-semibold text-slate-800 dark:text-zinc-100">
                    단순 사다리 타기 또는 매장을 연동하여 음료 내기 및 주문서 취합을 함께 진행해보세요!
                  </p>
                  <div className="space-y-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">1.</span>
                      <span><strong>+ 매장 선택</strong>을 눌러 자주 가는 카페나 식당 메뉴판을 사다리에 연결합니다.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">2.</span>
                      <span>참가자별로 원하는 음료를 지정하거나 카카오톡 공유 링크로 동료들이 직접 선택할 수 있습니다.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">3.</span>
                      <span>사다리 완료 시 당첨 결제자가 지정되고, 총 잔수와 금액이 정리된 <strong>주문서</strong>를 카톡으로 원클릭 복사합니다.</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStoreHelpOpen(false)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              2.5 사다리 목표 설정 전폭 레이어 팝업 모달 (모바일 가로 100% 바텀시트 / 상단 아이콘선택 + 첫항목 입력필드 + 프리셋목록)
              ----------------------------------------------------------------- */}
          {editingGoalIdx !== null && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => {
                setEditingGoalIdx(null);
                setIsGoalIconPickerOpen(false);
              }}
            >
              <div
                className="w-full sm:max-w-md bg-white dark:bg-[#131B2E] rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 모바일 상단 바텀시트 핸들 */}
                <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden" />

                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 text-lg">
                      🎯
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                        {editingGoalIdx + 1}번 기둥 목표 설정
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        직접 타이핑하거나 아래 추천 프리셋을 탭하여 설정하세요.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoalIdx(null);
                      setIsGoalIconPickerOpen(false);
                    }}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                  {/* [요구사항 5-1] 입력필드 아이콘을 누르면 바로 위에 표시되는 아이콘 그리드 선택기 */}
                  {isGoalIconPickerOpen && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-indigo-200 dark:border-indigo-800 animate-in zoom-in-95 duration-150 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          🎯 목표 대표 아이콘 선택
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsGoalIconPickerOpen(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                        >
                          닫기
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {TARGET_ICONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => {
                              setTempGoalIcon(ic);
                              setIsGoalIconPickerOpen(false);
                            }}
                            className={`min-h-[36px] flex items-center justify-center rounded-lg text-lg transition-transform active:scale-90 ${
                              tempGoalIcon === ic
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 ring-2 ring-indigo-500 scale-110'
                                : 'hover:bg-slate-200 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60'
                            }`}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* [요구사항 5-2] 첫 항목은 편집 가능한 입력창 + 확인 버튼 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>목표 내용 직접 입력</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        아이콘 탭 시 상단 변경
                      </span>
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-900/60 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      {/* 아이콘 버튼 (누르면 위에 아이콘 선택기 펼침) */}
                      <button
                        type="button"
                        onClick={() => setIsGoalIconPickerOpen(!isGoalIconPickerOpen)}
                        className="min-h-[40px] px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center gap-1 hover:border-indigo-400 transition-colors shrink-0 shadow-2xs cursor-pointer"
                        title="아이콘 변경 (클릭 시 위쪽에 아이콘 그리드 노출)"
                      >
                        <span className="text-xl leading-none">{tempGoalIcon}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isGoalIconPickerOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                      </button>

                      {/* 텍스트 입력창 (상시 클리어 X) */}
                      <div className="relative flex-1 min-w-0 flex items-center">
                        <input
                          type="text"
                          value={tempGoalText}
                          onChange={(e) => setTempGoalText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConfirmGoal();
                            }
                          }}
                          placeholder="목표 내용 입력 (예: 커피 쏘기, 통과 등)"
                          className="w-full min-h-[40px] px-2.5 pr-8 text-xs font-bold bg-transparent text-slate-900 dark:text-zinc-100 outline-none placeholder:text-slate-400"
                        />
                        {tempGoalText && (
                          <button
                            type="button"
                            onClick={() => setTempGoalText('')}
                            className="absolute right-1 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700"
                            title="내용 지우기"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 확인 버튼 */}
                      <button
                        type="button"
                        onClick={handleConfirmGoal}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
                      >
                        확인
                      </button>
                    </div>
                  </div>

                  {/* [요구사항 5-3] 목록을 선택하면 입력창에 선택되고 동기화되는 프리셋 목록 */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        자주 쓰는 목표 프리셋 (탭하여 선택)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsGoalPresetsModalOpen(true)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>프리셋 관리</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {goalPresets.map((preset) => {
                        const isSelected = tempGoalText === preset.text && tempGoalIcon === preset.icon;
                        return (
                          <button
                            key={preset.id || preset.text}
                            type="button"
                            onClick={() => {
                              setTempGoalText(preset.text);
                              setTempGoalIcon(preset.icon);
                            }}
                            className={`min-h-[42px] px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/30'
                                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span className="text-lg leading-none shrink-0">{preset.icon}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate flex-1 min-w-0">
                              {preset.text}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between text-xs shrink-0">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    💡 텍스트 편집 후 [확인]을 누르면 사다리에 즉시 적용됩니다.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoalIdx(null);
                      setIsGoalIconPickerOpen(false);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              3. 사다리 목표 프리셋 목록 관리 모달 (사용자 설정 & localStorage 영속화)
              ----------------------------------------------------------------- */}
          {isGoalPresetsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                        사다리 목표 선택 목록 관리
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        사다리 하단 목표 선택 목록에 노출될 목표 항목을 직접 추가, 삭제, 관리합니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGoalPresetsModalOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Add New Goal Form */}
                <form
                  onSubmit={handleAddGoalPreset}
                  className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 shrink-0 space-y-2.5"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                    + 새 목표 항목 추가
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Icon Select */}
                    <select
                      value={newPresetIcon}
                      onChange={(e) => setNewPresetIcon(e.target.value)}
                      className="text-base rounded-xl px-2 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 cursor-pointer shrink-0 min-h-[40px]"
                      title="목표 아이콘 선택"
                    >
                      {TARGET_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={newPresetText}
                      onChange={(e) => setNewPresetText(e.target.value)}
                      placeholder="목표명 입력 (예: 커피 쏘기, 설거지 당번)"
                      className="flex-1 min-w-0 min-h-[40px] px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                    />

                    {/* Add Button */}
                    <button
                      type="submit"
                      disabled={!newPresetText.trim()}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      + 추가
                    </button>
                  </div>
                </form>

                {/* Presets List */}
                <div className="p-4 overflow-y-auto space-y-2 flex-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                    <span className="font-bold">현재 등록된 목표 ({goalPresets.length}개)</span>
                    <span className="text-[11px]">* 사다리 하단 목표 선택창에 즉시 반영됩니다.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goalPresets.map((preset) => (
                      <div
                        key={preset.id || preset.text}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#172239] flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0">
                            {preset.icon}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                            {preset.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteGoalPreset(preset.id)}
                          className="min-h-[32px] min-w-[32px] rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="목표 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={handleResetGoalPresets}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-semibold hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    기본값 복원
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGoalPresetsModalOpen(false)}
                    className="min-h-[38px] px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    저장 완료
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              5. 룰렛 항목 & 퀵 프리셋 관리 전폭 레이어 모달
              ----------------------------------------------------------------- */}
          {isRouletteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-xl max-h-[88vh] bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100">
                        룰렛 항목 & 퀵 프리셋 관리
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        룰렛에 회전될 항목과 당첨 확률(가중치 1~10)을 자유롭게 구성합니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRouletteModalOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 2.1 추천 프리셋 불러오기 (ElmSld03 슬라이드드래그휠 + 롱프레스/드래그 순서변경) */}
                <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      📌 추천 프리셋 불러오기:
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyMembersToRoulette}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>👥</span>
                      <span>현재 참여 멤버 전원 ({members.length}명) 반영</span>
                    </button>
                  </div>
                  <ElmSld03
                    showNavButtons={true}
                    stepWidth={180}
                    className="w-full"
                    innerClassName="flex items-center gap-2 py-1 px-0.5"
                  >
                    {orderedPresets.map((preset) => {
                      const isCurrent = roulettePresetTitle === preset.title;
                      const isDefault = preset.id === DEFAULT_FIVE_ITEMS_PRESET.id;
                      const isCustom = preset.id.startsWith('custom_');
                      const isDragTarget = dragTargetPresetId === preset.id && draggedPresetId !== preset.id;

                      const displayName = isDefault
                        ? '기본 룰렛'
                        : preset.title.replace(/^[^\s]+\s*/, '');

                      return (
                        <div
                          key={preset.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', preset.id);
                            setDraggedPresetId(preset.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const side = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
                            setDragTargetPresetId(preset.id);
                            setDragDropSide(side);
                          }}
                          onDragLeave={() => {
                            if (dragTargetPresetId === preset.id) setDragTargetPresetId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleReorderPresets(draggedPresetId, preset.id, dragDropSide);
                            setDraggedPresetId(null);
                            setDragTargetPresetId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedPresetId(null);
                            setDragTargetPresetId(null);
                          }}
                          onClick={() => handleApplyRoulettePreset(preset)}
                          className={`relative p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-[150px] max-w-[200px] select-none ${
                            isDragTarget
                              ? dragDropSide === 'left'
                                ? 'border-l-4 border-l-indigo-600 ring-2 ring-indigo-500 scale-102'
                                : 'border-r-4 border-r-indigo-600 ring-2 ring-indigo-500 scale-102'
                              : ''
                          } ${
                            isCurrent
                              ? isCustom
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : isCustom
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:border-amber-400 text-slate-800 dark:text-zinc-200'
                              : isDefault
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 text-indigo-900 dark:text-indigo-200'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-indigo-400 text-slate-800 dark:text-zinc-200'
                          }`}
                          title="클릭하여 적용"
                        >
                          <span className="text-lg shrink-0">{preset.icon}</span>
                          <div className="min-w-0 flex-1 truncate">
                            <p className="text-xs font-bold truncate">{displayName}</p>
                            <p
                              className={`text-[10px] truncate ${
                                isCurrent
                                  ? 'text-white/80'
                                  : isCustom
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {preset.items.length}개 항목{isCustom ? ' (내 프리셋)' : ''}
                            </p>
                          </div>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 shrink-0"
                              title="프리셋 삭제"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </ElmSld03>
                </div>

                {/* Add New Item Form */}
                <form
                  onSubmit={handleAddRouletteItem}
                  className="p-3.5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#131B2E] shrink-0 space-y-1.5"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                    + 새 룰렛 항목 추가
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={newRouletteIcon}
                      onChange={(e) => setNewRouletteIcon(e.target.value)}
                      className="text-base rounded-xl px-2 py-2 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 cursor-pointer shrink-0 min-h-[40px]"
                      title="항목 아이콘 선택"
                    >
                      {ROULETTE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={newRouletteName}
                      onChange={(e) => setNewRouletteName(e.target.value)}
                      placeholder="항목명 입력 (예: 제육볶음, 설거지 당번)"
                      className="flex-1 min-w-0 min-h-[40px] px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                    />

                    <button
                      type="submit"
                      disabled={!newRouletteName.trim()}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      + 추가
                    </button>
                  </div>
                </form>

                {/* 1. 스크롤 영역 개선: 아래 타이틀은 고정하고 카드목록만 스크롤 처리 (스크롤 중에도 건수 상시 확인) */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 shrink-0">
                  <span className="font-bold text-slate-700 dark:text-zinc-200">
                    현재 룰렛 항목 (<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{rouletteItems.length}</span>개)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">* 가중치(1~10)에 따라 확률이 자동 계산됩니다.</span>
                </div>

                {/* 카드목록 독립 스크롤 영역 */}
                <div className="p-4 overflow-y-auto space-y-1.5 flex-1 overscroll-contain">
                  {rouletteItems.map((item) => {
                    const pct = Math.round((Math.max(1, item.weight || 1) / totalRouletteWeight) * 100);
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#172239] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shadow-2xs"
                      >
                        {/* 항목 아이콘(클릭 시 변경 가능) & 이름 편집 영역 */}
                        <div className="flex items-center gap-2 min-w-[140px] flex-1">
                          <button
                            type="button"
                            onClick={() => setEditingItemIconId(item.id)}
                            className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-105 shrink-0 transition-all cursor-pointer border border-transparent hover:border-indigo-400 flex items-center justify-center min-w-[36px] min-h-[36px]"
                            title="아이콘 변경 (클릭하여 원하는 아이콘 선택)"
                          >
                            {item.avatar}
                          </button>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateRouletteItemName(item.id, e.target.value)}
                            placeholder="항목 또는 참가자 이름"
                            className="flex-1 min-w-[100px] px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200/80 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-indigo-500 bg-transparent text-slate-800 dark:text-zinc-200 outline-none"
                          />
                        </div>

                        {/* Weight Stepper & Percentage: 가로가 좁으면 이름 다음 줄로 자연스럽게 줄바꿈 */}
                        <div className="flex items-center justify-end gap-1.5 shrink-0 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateRouletteItemWeight(item.id, -1)}
                            disabled={(item.weight || 1) <= 1}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 flex items-center justify-center cursor-pointer text-slate-700 dark:text-zinc-200"
                            title="가중치 감소"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-xs font-extrabold w-4 text-center text-slate-800 dark:text-zinc-200">
                            {item.weight || 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpdateRouletteItemWeight(item.id, 1)}
                            disabled={(item.weight || 1) >= 10}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 flex items-center justify-center cursor-pointer text-slate-700 dark:text-zinc-200"
                            title="가중치 증가"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-10 text-right">
                            {pct}%
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteRouletteItem(item.id)}
                            disabled={rouletteItems.length <= 2}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer ml-1"
                            title="항목 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal Footer (설정완료 옆에 설정저장 버튼 추가) */}
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between shrink-0 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                      총 가중치 합계: <span className="text-indigo-600 font-extrabold">{totalRouletteWeight}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenPresetSaveModal}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="현재 구성을 나만의 커스텀 프리셋으로 저장합니다"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{savedPresetToast ? '✓ 프리셋 저장됨!' : '프리셋 저장'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRouletteModalOpen(false)}
                      className="min-h-[40px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                    >
                      ✓ 설정 완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5.1 룰렛 게임 이용 안내 레이어 팝업 (? 아이콘 클릭 시) */}
          {isRouletteHelpOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setIsRouletteHelpOpen(false)}
            >
              <div
                className="w-full max-w-sm bg-white dark:bg-[#131B2E] rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 shadow-2xl p-4 sm:p-5 text-left space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      룰렛 게임 이용 안내
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRouletteHelpOpen(false)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                  퀵 프리셋을 누르거나 [항목 & 프리셋 설정]에서 나만의 룰렛을 자유롭게 꾸며보세요.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                  <p>• <strong>직접 수정</strong>: 룰렛 상단 칩을 클릭하여 항목명을 바로 수정할 수 있습니다.</p>
                  <p>• <strong>인원 조절</strong>: 상단 [+] / [-] 스텝퍼로 1초 만에 항목 수를 변경합니다.</p>
                  <p>• <strong>중심 원 재실행</strong>: 룰렛 중앙 원을 누르면 회전 중에도 즉시 다시 회전합니다.</p>
                  <p>• <strong>프리셋 저장</strong>: 설정 팝업에서 [설정저장]을 누르면 내 프리셋으로 영구 보관됩니다.</p>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRouletteHelpOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5.2 룰렛 항목 아이콘 변경 전용 팝오버 */}
          {editingItemIconId && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in"
              onClick={() => setEditingItemIconId(null)}
            >
              <div
                className="w-full max-w-xs p-4 rounded-2xl bg-white dark:bg-[#1a1a1e] border-2 border-indigo-500 shadow-2xl text-left space-y-3 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>항목 아이콘 선택</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingItemIconId(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {ROULETTE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => {
                        setRouletteItems((prev) =>
                          prev.map((it) => (it.id === editingItemIconId ? { ...it, avatar: ic } : it))
                        );
                        setEditingItemIconId(null);
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-110 flex items-center justify-center text-lg transition-all cursor-pointer border border-transparent hover:border-indigo-400"
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. 룰렛 프리셋 저장 전용 인앱 모달 (window.prompt 배제) */}
          {isPresetSaveModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setIsPresetSaveModalOpen(false)}
            >
              <div
                className="w-full max-w-sm bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-indigo-500 shadow-2xl p-5 text-left space-y-4 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                        룰렛 프리셋 저장
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        현재 {rouletteItems.length}개 항목 구성을 내 프리셋으로 저장합니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPresetSaveModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleConfirmSavePreset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                      프리셋 이름
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={presetSaveInputTitle}
                      onChange={(e) => setPresetSaveInputTitle(e.target.value)}
                      placeholder="예: 회식 당번 룰렛, 저녁 메뉴"
                      className="w-full min-h-[42px] px-3.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* 저장될 항목 미리보기 */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      저장 대상 항목 ({rouletteItems.length}개):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                      {rouletteItems.map((it) => (
                        <span
                          key={it.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-[11px] font-bold text-slate-700 dark:text-zinc-300"
                        >
                          <span>{it.avatar}</span>
                          <span className="truncate max-w-[80px]">{it.name}</span>
                          <span className="text-[9px] text-indigo-500 font-mono">x{it.weight || 1}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPresetSaveModalOpen(false)}
                      className="min-h-[38px] px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!presetSaveInputTitle.trim()}
                      className="min-h-[38px] px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-sm"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              2.2 롱프레스(모바일) & 호버(PC) 메뉴 풀텍스트 팝오버 툴팁
              ----------------------------------------------------------------- */}
          {menuTooltip && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in"
              onClick={() => setMenuTooltip(null)}
            >
              <div
                className="w-full max-w-xs p-4 rounded-2xl bg-white dark:bg-[#1a1a1e] border-2 border-emerald-500 shadow-2xl text-left space-y-3 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {menuTooltip.menu.categoryName}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 leading-snug">
                      ☕ {menuTooltip.menu.name}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuTooltip(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-zinc-400">메뉴 가격</span>
                  <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                    {menuTooltip.menu.price.toLocaleString()}원
                  </span>
                </div>

                {menuTooltip.menu.description && (
                  <p className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 leading-relaxed">
                    {menuTooltip.menu.description}
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>롱프레스 확인 완료</span>
                  <button
                    type="button"
                    onClick={() => {
                      const memberId = menuTooltip.memberId;
                      setMenuTooltip(null);
                      handleOpenMenuModalForMember(memberId);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                  >
                    메뉴 변경하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              2.3 참가자 이름 롱프레스 & 탭 풀텍스트 팝오버
              ----------------------------------------------------------------- */}
          {memberNameTooltip && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in"
              onClick={() => setMemberNameTooltip(null)}
            >
              <div
                className="w-full max-w-xs p-4 rounded-2xl bg-white dark:bg-[#1a1a1e] border-2 border-indigo-500 shadow-2xl text-left space-y-2.5 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    👥 참가자 전체 이름 확인
                  </span>
                  <button
                    type="button"
                    onClick={() => setMemberNameTooltip(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 break-words select-text px-1 py-1 bg-slate-50 dark:bg-zinc-900/60 rounded-xl">
                  {memberNameTooltip.name}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setMemberNameTooltip(null)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              4. 룰렛 (ROULETTE) 전면 개편 (퀵 프리셋, 고화질 캔버스, 2x 이미지 복사, 전폭 모달)
              ----------------------------------------------------------------- */}
          {gameType === 'ROULETTE' && (
            <div className="space-y-6">
              {/* 상단 프리셋 및 설정 헤더 바 */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  resolvedTheme === 'dawn'
                    ? 'bg-[#f0f7ff] border-[#bfdbfe]'
                    : isDark
                    ? 'bg-[#1a1a1e] border-[#27272a]'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {/* 상단 룰렛 주제 헤더 */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      현재 룰렛 주제:
                    </span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {roulettePresetTitle}
                    </span>
                    {excludedRouletteItems.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        {excludedRouletteItems.length}개 항목 제외 중
                      </span>
                    )}
                    {/* 안내문구 ? 아이콘으로 레이어팝업 적용 */}
                    <button
                      type="button"
                      onClick={() => setIsRouletteHelpOpen(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="룰렛 이용 안내 (클릭하여 확인)"
                      aria-label="룰렛 이용 안내"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 룰렛 항목 인디케이터 (사다리 인원수와 동일한 ElmRng01 적용, 2~20개) */}
                <div className="w-full">
                  <ElmRng01
                    label="설정 항목"
                    value={rouletteItems.length}
                    min={2}
                    max={20}
                    step={1}
                    unit="개"
                    onChange={(val) => handleUpdateRouletteItemCount(val)}
                    colorScheme="indigo"
                  />
                </div>

                {/* 항목 조정요소 줄바꿔서 표시 고정 */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                      항목 조정:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      개별 명칭 및 가중치 세부 설정
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRouletteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>항목 & 프리셋 설정</span>
                  </button>
                </div>

                {/* 2.1 퀵 프리셋 원터치 칩 목록 (ElmSld03 슬라이드드래그휠) */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                      📌 추천 프리셋:
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyMembersToRoulette}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>👥</span>
                      <span>참여 멤버 ({members.length}명) 반영</span>
                    </button>
                  </div>
                  <ElmSld03
                    showNavButtons={true}
                    stepWidth={160}
                    className="w-full"
                    innerClassName="flex items-center gap-1.5 py-1 px-0.5"
                  >
                    {orderedPresets.map((preset) => {
                      const isCurrent = roulettePresetTitle === preset.title;
                      const isDefault = preset.id === DEFAULT_FIVE_ITEMS_PRESET.id;
                      const isCustom = preset.id.startsWith('custom_');
                      const isDragTarget = dragTargetPresetId === preset.id && draggedPresetId !== preset.id;

                      const displayName = isDefault
                        ? '기본 룰렛'
                        : preset.title.replace(/^[^\s]+\s*/, '');

                      return (
                        <div
                          key={preset.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', preset.id);
                            setDraggedPresetId(preset.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const side = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
                            setDragTargetPresetId(preset.id);
                            setDragDropSide(side);
                          }}
                          onDragLeave={() => {
                            if (dragTargetPresetId === preset.id) setDragTargetPresetId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleReorderPresets(draggedPresetId, preset.id, dragDropSide);
                            setDraggedPresetId(null);
                            setDragTargetPresetId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedPresetId(null);
                            setDragTargetPresetId(null);
                          }}
                          onClick={() => handleApplyRoulettePreset(preset)}
                          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border select-none ${
                            isDragTarget
                              ? dragDropSide === 'left'
                                ? 'border-l-4 border-l-indigo-600 ring-2 ring-indigo-500 scale-102'
                                : 'border-r-4 border-r-indigo-600 ring-2 ring-indigo-500 scale-102'
                              : ''
                          } ${
                            isCurrent
                              ? isCustom
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : isCustom
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60 hover:border-amber-400'
                              : isDefault
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400'
                              : 'bg-white dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                          }`}
                          title="클릭하여 적용"
                        >
                          <span className="text-base">{preset.icon}</span>
                          <span>{displayName}</span>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 text-current ml-0.5"
                              title="프리셋 삭제"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </ElmSld03>
                </div>

                {/* 룰렛 옵션 체크박스 */}
                <div
                  className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    resolvedTheme === 'dawn' ? 'border-[#bfdbfe]' : isDark ? 'border-[#27272a]' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-text">
                      <input
                        type="checkbox"
                        checked={excludeWinnerMode}
                        onChange={(e) => setExcludeWinnerMode(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                      />
                      <span className="font-bold text-rose-600 dark:text-rose-400 select-text cursor-pointer">
                        당첨 항목 자동 제외 모드 (중복 당첨 방지)
                      </span>
                    </label>
                  </div>

                  {excludedRouletteItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreExcludedWinners}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>제외된 {excludedRouletteItems.length}개 항목 전체 복원</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 룰렛 캔버스 & 인터랙션 휠 */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border-2 flex flex-col items-center space-y-6 transition-all ${
                  resolvedTheme === 'dawn'
                    ? 'bg-white border-[#bfdbfe] shadow-md shadow-blue-50'
                    : isDark
                    ? 'bg-[#1a1a1e] border-[#27272a] shadow-md shadow-black/40'
                    : 'bg-white border-indigo-100 shadow-lg shadow-indigo-50/50'
                }`}
              >
                {/* 5. 룰렛 상단 칩 목록: 항목명 직접 인라인 수정 가능하도록 개선 */}
                <div className="w-full flex flex-wrap items-center justify-center gap-2 py-1 max-w-xl">
                  {rouletteItems.map((item, idx) => {
                    const isWinner = selectedRouletteWinner?.id === item.id;
                    const pct = Math.round((Math.max(1, item.weight || 1) / totalRouletteWeight) * 100);
                    const colors = [
                      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
                      'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
                      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
                      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
                    ];
                    const colorCls = colors[idx % colors.length];

                    return (
                      <div
                        key={item.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                          isWinner
                            ? 'bg-rose-600 text-white border-rose-600 scale-105 ring-4 ring-rose-400/40 shadow-md font-black'
                            : colorCls
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingItemIconId(item.id)}
                          className="hover:scale-125 transition-transform cursor-pointer shrink-0"
                          title="아이콘 변경"
                        >
                          {item.avatar}
                        </button>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateRouletteItemName(item.id, e.target.value)}
                          placeholder={`항목${idx + 1}`}
                          className="bg-transparent border-b border-transparent hover:border-current focus:border-current outline-none text-xs font-bold w-20 sm:w-28 px-0.5 text-center transition-colors truncate"
                          title="클릭하여 항목명 바로 수정"
                        />
                        <span className="text-[10px] opacity-75 font-mono shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* 룰렛 휠 본체 & 고정 인디케이터 핀 */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none my-2">
                  {/* 상단 핀 인디케이터 (틱 튕김 애니메이션) */}
                  <div
                    className={`absolute -top-4 z-30 filter drop-shadow-md transition-transform ${
                      isSpinning ? 'animate-bounce scale-110' : ''
                    }`}
                  >
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs mx-auto -mt-6 border border-rose-600" />
                  </div>

                  {/* 룰렛 회전 SVG 휠 */}
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

                      const midAngle = (slice.startAngle + slice.endAngle) / 2;
                      const midRad = (midAngle * Math.PI) / 180;
                      const textX = 64 * Math.cos(midRad);
                      const textY = 64 * Math.sin(midRad);

                      const colors = [
                        '#6366f1', '#ec4899', '#f59e0b', '#10b981',
                        '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e',
                      ];
                      const fill = colors[i % colors.length];

                      return (
                        <g key={slice.item.id}>
                          <path
                            d={pathData}
                            fill={fill}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            className="transition-colors"
                          />
                          {/* 슬라이스 텍스트 및 이모지 */}
                          <text
                            x={textX}
                            y={textY}
                            fill="#ffffff"
                            fontSize={slice.angle < 30 ? '11' : '13'}
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          >
                            {slice.item.avatar} {slice.angle >= 35 ? slice.item.name.slice(0, 5) : ''}
                          </text>
                        </g>
                      );
                    })}

                    {/* 4. 룰렛 중심 원: 즉시 재실행 버튼 (회전 중에도 즉시 재실행 가능) */}
                    <g
                      onClick={() => handleSpinRoulette(false, undefined, true)}
                      className="cursor-pointer group select-none"
                      role="button"
                      aria-label="룰렛 즉시 재실행 (다시 돌리기)"
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="25"
                        fill="#0f172a"
                        stroke="#ffffff"
                        strokeWidth="3"
                        className="transition-transform group-hover:scale-105 active:scale-95"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#f43f5e"
                        className="transition-colors group-hover:fill-rose-500"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="select-none pointer-events-none font-sans"
                      >
                        다시
                      </text>
                    </g>
                  </svg>
                </div>

                {/* 컨트롤 버튼 그룹 (5. 중복된 항목/가중치 편집 버튼 삭제 완료) */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleSpinRoulette(false)}
                    disabled={isSpinning || rouletteItems.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                  >
                    <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? '룰렛 회전 중...' : '🎯 룰렛 돌리기'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSpinRoulette(true)}
                    disabled={isSpinning || rouletteItems.length === 0}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 font-bold text-xs transition-all cursor-pointer"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>즉시 결과</span>
                  </button>
                </div>
              </div>

              {/* 당첨자 결과 카드 & 텍스트/이미지 복사 인터랙션 */}
              {selectedRouletteWinner && (
                <div
                  id="roulette-winner-card"
                  className={`p-6 rounded-3xl border-2 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                    resolvedTheme === 'dawn'
                      ? 'bg-white border-rose-300 text-rose-950 shadow-rose-100/60'
                      : isDark
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200 shadow-rose-950/20'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-indigo-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl inline-block p-3 rounded-3xl bg-white dark:bg-black/40 shadow-sm border border-rose-200 dark:border-rose-800/60">
                    {selectedRouletteWinner.avatar}
                  </span>

                  <div className="space-y-1">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                      당첨 확정
                    </span>
                    <h3 className="text-lg sm:text-xl font-black mt-2">
                      🎯 오늘의 룰렛 당첨: [{selectedRouletteWinner.name}]!
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      축하합니다! 오늘의 주인공으로 공정하게 선정되었습니다.
                    </p>
                  </div>

                  {/* 결과 공유 & 이미지 복사 바 (텍스트 제거, 아이콘 전용 버튼화) */}
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 shrink-0">
                      결과복사:
                    </span>
                    {/* 카톡 텍스트 복사 (아이콘 전용) */}
                    <button
                      type="button"
                      onClick={handleCopyRouletteText}
                      className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                      title="카카오톡 메신저 공유용 텍스트 복사"
                      aria-label="결과 텍스트 복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* 카드 이미지 복사 (아이콘 전용, Ctrl+V) */}
                    <button
                      type="button"
                      onClick={handleCopyRouletteImageCard}
                      disabled={isGeneratingRouletteCard}
                      className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                      title="고해상도 카드 이미지 복사 (Ctrl+V)"
                      aria-label="카드 이미지 복사"
                    >
                      <Camera className="w-4 h-4" />
                    </button>

                    {/* 이미지 파일 다운로드 (아이콘 전용) */}
                    <button
                      type="button"
                      onClick={handleDownloadRouletteImageCard}
                      disabled={isGeneratingRouletteCard}
                      className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                      title="PNG 이미지 파일로 다운로드"
                      aria-label="카드 이미지 저장"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 하단 당첨자 제외 후 다음 룰렛 돌리기 & 다시 돌리기 */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
                    <button
                      type="button"
                      onClick={handleExcludeWinnerAndSpinAgain}
                      disabled={rouletteItems.length <= 2}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40"
                    >
                      <span>🎯</span>
                      <span>이 항목 제외하기 ({rouletteItems.length - 1}개 남음)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpinRoulette(false)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
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

      {/* 화면 하단 플로팅 상태 피드백 토스트 레이어 (ElmToast01) */}
      <ElmToast01
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
