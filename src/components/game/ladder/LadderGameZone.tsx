import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Check,
  Share2,
  LogOut,
  Users,
  Lock,
  Smile,
} from 'lucide-react';
import {
  createLadderSyncChannel,
  LadderChannelHandle,
  LadderSyncMessage,
  LadderSyncState,
  saveRoomSnapshot,
  loadRoomSnapshot,
  generateGameRoomId,
  buildRoomShareUrl,
} from './ladderSyncChannel';
import { ElmRng01 } from '../../../sample/elements/Tokens';
import { Participant, PRESET_CHARACTERS, loadUserGoalPresets, saveSharedGameHistory } from '../types';
import {
  LadderRung,
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
  buildPolylineCurve,
  samplePolylineAtDistance,
  formatLadderResultText,
  formatStoreOrderText,
  getStoreMenuEmoji,
} from './ladderEngine';
import { LadderViewerSvg } from './LadderViewerSvg';
import {
  LadderGoalModal,
  LadderArrivalModal,
  StoreMenuSelectModal,
  LadderResultModal,
  LadderShareModal,
} from './LadderModals';
import { StorePreset, StoreMenuItem } from '../../../sample/data/systemStorePool';
import {
  generateLadderResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
} from '../../../sample/utils/gameResultCardCanvas';

const PRESET_AVATAR_EMOJIS = [
  '☕', '🧋', '🍰', '🍩', '🍕', '🍔', '🍺', '🥤',
  '🦁', '🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🐮',
  '🐷', '🐸', '🦄', '🚀', '⭐', '🎈', '🎉', '🍎',
];

/**
 * 🔑 [한글 IME 중복 입력 방어 & 키 입력 실시간 동기화 컴포넌트]
 * 조합 중일 때는 로컬 유지, 조합 완료 즉시(onCompositionEnd) 및 영문/숫자 타이핑 즉시(onChange) 실시간 전파
 */
const MemberNameInput: React.FC<{
  initialName: string;
  disabled: boolean;
  onCommit: (newName: string) => void;
}> = ({ initialName, disabled, onCommit }) => {
  const [value, setValue] = useState(initialName);
  const isComposingRef = useRef(false);
  const isFocusedRef = useRef(false);

  // 외부(상대방 입력 등)에서 온 변경은 포커스 중이 아닐 때만 동기화
  useEffect(() => {
    if (!isFocusedRef.current) {
      setValue(initialName);
    }
  }, [initialName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setValue(nextVal);
    // 한글 조합 중이 아닌 영문, 숫자, 백스페이스 등은 즉시 실시간 전파
    if (!isComposingRef.current) {
      onCommit(nextVal);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const finalVal = e.currentTarget.value;
    setValue(finalVal);
    // 한글 1글자 조합 완성 즉시 실시간 전파
    onCommit(finalVal);
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    isComposingRef.current = false;
    const trimmed = value.trim();
    if (trimmed && trimmed !== initialName) {
      onCommit(trimmed);
    } else if (!trimmed) {
      setValue(initialName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposingRef.current) {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={handleCompositionEnd}
      onFocus={(e) => {
        isFocusedRef.current = true;
        e.target.select();
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      disabled={disabled}
      maxLength={10}
      className="w-full h-7 px-1 text-[11px] font-bold text-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs truncate select-text disabled:opacity-60"
      placeholder="이름"
      title="참가자 이름 수정 (타이핑 시 실시간 반영)"
    />
  );
};

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
  onRegisterShareHandler?: (handler: () => void) => void;
  onRegisterLeaveHandler?: (handler: () => void) => void;
  onRoomModeChange?: (inRoom: boolean, isHost: boolean) => void;
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
  onRegisterShareHandler,
  onRegisterLeaveHandler,
  onRoomModeChange,
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
  // 🔑 [게스트 아이콘 변경] 참가자 아바타 이모지 피커 모달 상태
  const [avatarPickerMemberId, setAvatarPickerMemberId] = useState<string | null>(null);

  // 실시간 공유 방 상태 및 동기화 채널 핸들
  const [roomId, setRoomId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('room');
    }
    return null;
  });
  // 🔑 [보안] URL query parameter host=1 제거 -> sessionStorage의 hostToken 존재 및 일치 여부로 방장 권한 판정
  const [hostToken, setHostToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const rId = p.get('room');
      if (rId) {
        return window.sessionStorage.getItem(`moabogo_host_token_${rId}`);
      }
    }
    return null;
  });
  const [isRoomHost, setIsRoomHost] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const rId = p.get('room');
      if (rId) {
        return !!window.sessionStorage.getItem(`moabogo_host_token_${rId}`);
      }
    }
    return false;
  });
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isRoomClosed, setIsRoomClosed] = useState<boolean>(false);
  const [isGuestCloseNoticeOpen, setIsGuestCloseNoticeOpen] = useState<boolean>(false);
  const channelRef = useRef<LadderChannelHandle | null>(null);
  const isRoomJoined = !!roomId;
  const isGuest = isRoomJoined && !isRoomHost;
  const membersRef = useRef<Participant[]>(members);
  membersRef.current = members;
  const ladderGoalsRef = useRef<LadderGoal[]>(ladderGoals);
  ladderGoalsRef.current = ladderGoals;
  const ladderSeedRef = useRef<number>(ladderSeed);
  ladderSeedRef.current = ladderSeed;
  const winnerCountRef = useRef<number>(winnerCount);
  winnerCountRef.current = winnerCount;
  const useLadderWeightRef = useRef<boolean>(useLadderWeight);
  useLadderWeightRef.current = useLadderWeight;
  const ladderSpeedRef = useRef<number>(ladderSpeed);
  ladderSpeedRef.current = ladderSpeed;
  const selectedStoreRef = useRef<StorePreset | null>(selectedStore);
  selectedStoreRef.current = selectedStore;
  const ladderResultRef = useRef<LadderResultMap | null>(ladderResult);
  ladderResultRef.current = ladderResult;
  const revealedGoalsRef = useRef<Record<string, boolean>>(revealedGoals);
  revealedGoalsRef.current = revealedGoals;
  const revealedGoalColsRef = useRef<LadderRevealedGoalCols>(revealedGoalCols);
  revealedGoalColsRef.current = revealedGoalCols;

  const isRoomClosedRef = useRef<boolean>(isRoomClosed);
  isRoomClosedRef.current = isRoomClosed;

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const hostTokenRef = useRef<string | null>(hostToken);
  hostTokenRef.current = hostToken;

  const getHostToken = useCallback(() => {
    if (hostTokenRef.current) return hostTokenRef.current;
    if (hostToken) return hostToken;
    if (roomId && typeof window !== 'undefined') {
      return window.sessionStorage.getItem(`moabogo_host_token_${roomId}`);
    }
    return null;
  }, [hostToken, roomId]);

  const arrivalPopupRef = useRef<ArrivalPopupData | null>(arrivalPopup);
  arrivalPopupRef.current = arrivalPopup;

  const handlePlayLadderRef = useRef<(
    skipTrace?: boolean,
    broadcast?: boolean,
    overrideRungs?: LadderRung[],
    overrideGoals?: LadderGoal[],
    overrideMembers?: Participant[],
    overrideSpeed?: number,
    overrideResults?: LadderResultMap,
    overrideRevealedGoals?: Record<string, boolean>,
    overrideRevealedGoalCols?: LadderRevealedGoalCols
  ) => void>(() => { });
  const handleProceedRef = useRef<(
    nextIdx?: number,
    broadcast?: boolean,
    overrideRungs?: LadderRung[],
    overrideGoals?: LadderGoal[],
    overrideMembers?: Participant[],
    overrideSpeed?: number
  ) => void>(() => { });

  const ladderSliderRef = useRef<HTMLDivElement>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const panRafIdRef = useRef<number | null>(null);
  const cameraScrollRef = useRef<number>(0);
  const cameraLookAheadRef = useRef<number>(0);

  const clearTracingTimers = useCallback(() => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (rafIdRef.current !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (panRafIdRef.current !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(panRafIdRef.current);
      panRafIdRef.current = null;
    }
  }, []);

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
      clearTracingTimers();
    };
  }, [clearTracingTimers]);

  // 🔑 [피드백 1: 초대자/참가자 목표 섞기 보존 - 방장/로컬 모드에서 인원수·당첨인원수 변경 시에만 기본 목표 재설정]
  const prevMembersCountRef = useRef<number>(members.length);
  const prevWinnerCountRef = useRef<number>(winnerCount);
  useEffect(() => {
    const needed = members.length;
    const isCountChanged = prevMembersCountRef.current !== needed;
    const isWinnerChanged = prevWinnerCountRef.current !== winnerCount;

    if (isCountChanged || isWinnerChanged) {
      prevMembersCountRef.current = needed;
      prevWinnerCountRef.current = winnerCount;
      if (isGuest) return;
      const safeWinners = Math.max(1, Math.min(needed - 1, winnerCount));
      setLadderGoals(generateDefaultLadderGoals(needed, safeWinners));
      if (winnerCount >= needed) {
        setWinnerCount(Math.max(1, needed - 1));
      }

      // 방장이고 인원수가 변경된 경우 모든 참가자에게 즉시 동기화
      if (isRoomHost && channelRef.current && isCountChanged) {
        channelRef.current.send({ type: 'SYNC_MEMBERS', members }, getHostToken());
      }
    }
  }, [members.length, winnerCount, setWinnerCount, setLadderGoals, isRoomHost, isGuest, members, getHostToken]);

  // 🔑 [항목 2-f: 실제 인원/당첨수/가중치 설정이 변경되었을 때만 초기화하여 즉시결과 및 최종 결과 영구 보존]
  const prevSettingsKeyRef = useRef<string>(`${members.length}:${winnerCount}:${membersWeightsKey}`);
  useEffect(() => {
    const currentKey = `${members.length}:${winnerCount}:${membersWeightsKey}`;
    if (prevSettingsKeyRef.current !== currentKey) {
      prevSettingsKeyRef.current = currentKey;
      // 사다리가 진행 중이거나 최종 결과가 도출된 후 단순히 팝업을 닫는 경우에는 목표 칸 정보를 절대 지우지 않음
      if (!isLadderTracing) {
        setLadderResult(null);
        setRevealedGoals({});
        setRevealedGoalCols({});
        setArrivalPopup(null);
        setIsResultModalOpen(false);
      }
    }
  }, [members.length, winnerCount, membersWeightsKey, isLadderTracing]);

  // 실시간 방 채널 연결 및 메시지 리스너 (BroadcastChannel + LocalStorage Dual Sync)
  useEffect(() => {
    if (!roomId) {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      return;
    }

    const channel = createLadderSyncChannel(roomId, currentTabId, (msg: LadderSyncMessage) => {
      switch (msg.type) {
        case 'SYNC_REQUEST':
          if (isRoomHost) {
            channel.send({
              type: 'SYNC_STATE',
              state: {
                roomId,
                hostTabId: currentTabId,
                members: membersRef.current,
                ladderGoals: ladderGoalsRef.current,
                ladderSeed: ladderSeedRef.current,
                winnerCount: winnerCountRef.current,
                useLadderWeight: useLadderWeightRef.current,
                ladderSpeed: ladderSpeedRef.current,
                selectedStore: selectedStoreRef.current,
                ladderResult: ladderResultRef.current,
                timestamp: Date.now(),
              },
            });
          }
          break;

        case 'SYNC_STATE':
          if (!isRoomHost && msg.state) {
            const nextMembers = msg.state.members || membersRef.current;
            const nextWinnerCount = msg.state.winnerCount ?? winnerCountRef.current;
            const nextWeightsKey = nextMembers.map((m) => `${m.id}:${m.weight || 1}`).join(',');
            prevMembersCountRef.current = nextMembers.length;
            prevWinnerCountRef.current = nextWinnerCount;
            prevSettingsKeyRef.current = `${nextMembers.length}:${nextWinnerCount}:${nextWeightsKey}`;

            membersRef.current = nextMembers;
            ladderGoalsRef.current = msg.state.ladderGoals;
            ladderSeedRef.current = msg.state.ladderSeed;
            winnerCountRef.current = nextWinnerCount;
            useLadderWeightRef.current = msg.state.useLadderWeight;
            ladderSpeedRef.current = msg.state.ladderSpeed;
            selectedStoreRef.current = msg.state.selectedStore;

            setMembers(nextMembers);
            setLadderGoals(msg.state.ladderGoals);
            setLadderSeed(msg.state.ladderSeed);
            setWinnerCount(nextWinnerCount);
            setUseLadderWeight(msg.state.useLadderWeight);
            setLadderSpeed(msg.state.ladderSpeed);
            setSelectedStore(msg.state.selectedStore);
            if (msg.state.ladderResult) {
              ladderResultRef.current = msg.state.ladderResult;
              setLadderResult(msg.state.ladderResult);
              const revGoals: Record<string, boolean> = {};
              const revCols: LadderRevealedGoalCols = {};
              nextMembers.forEach((m) => {
                revGoals[m.id] = true;
                const res = msg.state.ladderResult?.[m.id];
                if (res) {
                  revCols[res.goalIndex] = {
                    memberName: m.name,
                    avatar: m.avatar,
                    isWinner: res.isWinner,
                  };
                }
              });
              revealedGoalsRef.current = revGoals;
              setRevealedGoals(revGoals);
              revealedGoalColsRef.current = revCols;
              setRevealedGoalCols(revCols);
            }
          }
          break;

        case 'SYNC_MEMBERS':
          if (!isRoomHost) {
            prevMembersCountRef.current = msg.members.length;
            const nextWeightsKey = msg.members.map((m) => `${m.id}:${m.weight || 1}`).join(',');
            prevSettingsKeyRef.current = `${msg.members.length}:${winnerCountRef.current}:${nextWeightsKey}`;
            membersRef.current = msg.members;
            setMembers(msg.members);
            setLadderResult(null);
            setRevealedGoals({});
            setRevealedGoalCols({});
            setArrivalPopup(null);
          }
          break;

        case 'CLAIM_SEAT':
          setMembers((prev) =>
            prev.map((m) => {
              if (m.claimedBy === msg.tabId && m.id !== msg.memberId) {
                return { ...m, claimedBy: undefined };
              }
              if (m.id === msg.memberId) {
                const isAlready = m.claimedBy === msg.tabId;
                return { ...m, claimedBy: isAlready ? undefined : msg.tabId };
              }
              return m;
            })
          );
          break;

        case 'UPDATE_MEMBER_NAME':
          setMembers((prev) =>
            prev.map((m) => (m.id === msg.memberId ? { ...m, name: msg.name } : m))
          );
          break;

        case 'UPDATE_MEMBER_DETAILS':
          setMembers((prev) =>
            prev.map((m) => {
              if (m.id === msg.memberId) {
                return {
                  ...m,
                  name: msg.name !== undefined ? msg.name : m.name,
                  avatar: msg.avatarEmoji !== undefined ? msg.avatarEmoji : m.avatar,
                  selectedMenu: msg.selectedMenu !== undefined ? msg.selectedMenu : m.selectedMenu,
                };
              }
              return m;
            })
          );
          break;

        case 'SHUFFLE_MEMBERS':
          membersRef.current = msg.members;
          setMembers(msg.members);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToastRef.current('👥 참가자 순서가 동기화되었습니다.', 'info');
          break;

        case 'SHUFFLE_RUNGS':
          ladderSeedRef.current = msg.seed;
          setLadderSeed(msg.seed);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToastRef.current('🎲 사다리 가로줄이 동기화되었습니다.', 'info');
          break;

        case 'SHUFFLE_GOALS':
          ladderGoalsRef.current = msg.goals;
          setLadderGoals(msg.goals);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToastRef.current('✨ 사다리 목표가 동기화되었습니다.', 'info');
          break;

        case 'UPDATE_WINNER_COUNT':
          if (typeof msg.winnerCount === 'number') {
            winnerCountRef.current = msg.winnerCount;
            prevWinnerCountRef.current = msg.winnerCount;
            setWinnerCount(msg.winnerCount);
            if (msg.goals) {
              ladderGoalsRef.current = msg.goals;
              setLadderGoals(msg.goals);
            }
            setLadderResult(null);
            setRevealedGoals({});
            setRevealedGoalCols({});
            setArrivalPopup(null);
            showToastRef.current(`🎯 당첨 인원수가 ${msg.winnerCount}명으로 동기화되었습니다.`, 'info');
          }
          break;

        case 'UPDATE_STORE':
          selectedStoreRef.current = msg.store;
          setSelectedStore(msg.store);
          showToastRef.current(
            msg.store ? `🏪 매장 '${msg.store.name}' 연동이 동기화되었습니다.` : '🏪 매장 연동이 해제되었습니다.',
            'info'
          );
          break;

        case 'UPDATE_LADDER_WEIGHT':
          useLadderWeightRef.current = msg.useLadderWeight;
          setUseLadderWeight(msg.useLadderWeight);
          showToastRef.current(
            msg.useLadderWeight ? '⚖️ 가중치 모드가 활성화되었습니다.' : '⚖️ 균등 모드가 활성화되었습니다.',
            'info'
          );
          break;

        case 'UPDATE_SPEED':
          if (typeof msg.speed === 'number') {
            ladderSpeedRef.current = msg.speed;
            setLadderSpeed(msg.speed);
          }
          break;

        case 'PLAY_LADDER':
          if (msg.speed) {
            ladderSpeedRef.current = msg.speed;
            setLadderSpeed(msg.speed);
          }
          if (msg.seed !== undefined) {
            ladderSeedRef.current = msg.seed;
            setLadderSeed(msg.seed);
          }
          if (msg.goals) {
            ladderGoalsRef.current = msg.goals;
            setLadderGoals(msg.goals);
          }
          if (msg.members && msg.members.length > 0) {
            prevMembersCountRef.current = msg.members.length;
            const nextWeightsKey = msg.members.map((m) => `${m.id}:${m.weight || 1}`).join(',');
            prevSettingsKeyRef.current = `${msg.members.length}:${winnerCountRef.current}:${nextWeightsKey}`;
            membersRef.current = msg.members;
            setMembers(msg.members);
          }
          handlePlayLadderRef.current(
            msg.skipTrace,
            false,
            msg.rungs,
            msg.goals,
            msg.members,
            msg.speed,
            msg.results,
            msg.revealedGoals,
            msg.revealedGoalCols
          );
          break;

        case 'LADDER_RUNNER_ARRIVED': {
          // 🔑 [호스트 주도 중계] 전체 즉시 결과 등으로 이미 최종 결과가 확정된 경우 지연 도착한 주자 도착 패킷 무시
          if (ladderResultRef.current !== null) break;
          // 🔑 [호스트 주도 중계] 방장이 목표 도달 시 게스트도 로컬 타이머를 즉시 정리하고 골인 지점으로 스냅 및 팝업 오픈
          clearTracingTimers();
          const activeMembers = membersRef.current;
          const activeGoals = ladderGoalsRef.current;
          const activeRungs = generateLadderRungs(activeMembers.length, ladderSeedRef.current);
          const { waypointsMap } = computeLadderPaths(activeMembers, activeGoals, activeRungs);
          const memberPath = waypointsMap[msg.member.id];
          if (memberPath && memberPath.length > 0) {
            const finalPt = memberPath[memberPath.length - 1];
            setCurrentTracerPosition(finalPt);
            setCurrentTracedTrail(memberPath);
            ensureTracerVisible(finalPt.x, undefined, false, false, ladderSpeedRef.current);
          }
          if (msg.revealedGoals) {
            setRevealedGoals(msg.revealedGoals);
            revealedGoalsRef.current = msg.revealedGoals;
          }
          if (msg.revealedGoalCols) {
            setRevealedGoalCols(msg.revealedGoalCols);
            revealedGoalColsRef.current = msg.revealedGoalCols;
          }
          setArrivalPopup({
            member: msg.member,
            result: msg.result,
            memberIndex: msg.memberIndex,
            totalMembers: msg.totalMembers,
            nextMemberName: msg.nextMemberName,
          });
          break;
        }

        case 'LADDER_PROCEED_NEXT':
          if (msg.speed) {
            ladderSpeedRef.current = msg.speed;
            setLadderSpeed(msg.speed);
          }
          if (msg.goals) {
            ladderGoalsRef.current = msg.goals;
            setLadderGoals(msg.goals);
          }
          if (msg.members && msg.members.length > 0) {
            membersRef.current = msg.members;
            setMembers(msg.members);
          }
          setArrivalPopup(null);
          handleProceedRef.current(
            msg.nextMemberIndex,
            false,
            msg.rungs,
            msg.goals,
            msg.members,
            msg.speed
          );
          break;

        case 'LADDER_COMPLETE':
          clearTracingTimers();
          if (msg.results) {
            setLadderResult(msg.results);
            ladderResultRef.current = msg.results;
            setIsLadderTracing(false);
            setActiveTracingMemberIndex(null);
            setCurrentTracerPosition(null);
            setCurrentTracedTrail([]);
            setArrivalPopup(null);

            // 🔑 [항목 2-f: 팝업을 닫은 뒤에도 목표 칸 하단에 참가자명/아바타 표시 영구 유지]
            if (msg.revealedGoals) {
              setRevealedGoals(msg.revealedGoals);
              revealedGoalsRef.current = msg.revealedGoals;
            } else {
              const currentMembers = membersRef.current.length > 0 ? membersRef.current : members;
              const revGoals: Record<string, boolean> = {};
              currentMembers.forEach((m) => {
                revGoals[m.id] = true;
              });
              setRevealedGoals(revGoals);
              revealedGoalsRef.current = revGoals;
            }

            if (msg.revealedGoalCols) {
              setRevealedGoalCols(msg.revealedGoalCols);
              revealedGoalColsRef.current = msg.revealedGoalCols;
            } else {
              const currentMembers = membersRef.current.length > 0 ? membersRef.current : members;
              const revCols: LadderRevealedGoalCols = {};
              currentMembers.forEach((m) => {
                const res = msg.results[m.id];
                if (res) {
                  revCols[res.goalIndex] = {
                    memberName: m.name,
                    avatar: m.avatar,
                    isWinner: res.isWinner,
                  };
                }
              });
              setRevealedGoalCols(revCols);
              revealedGoalColsRef.current = revCols;
            }

            setIsResultModalOpen(true);
          }
          break;

        case 'RESET_GAME':
          clearTracingTimers();
          setIsLadderTracing(false);
          setActiveTracingMemberIndex(null);
          setCurrentTracerPosition(null);
          setCurrentTracedTrail([]);
          setLadderResult(null);
          ladderResultRef.current = null;
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          setIsResultModalOpen(false);
          break;

        case 'LEAVE_ROOM':
          if (msg.tabId) {
            setMembers((prev) =>
              prev.map((m) => (m.claimedBy === msg.tabId ? { ...m, claimedBy: undefined } : m))
            );
          }
          showToastRef.current('참여자가 게임에서 퇴장했습니다.', 'info');
          break;

        case 'CLOSE_ROOM':
        case 'ROOM_CLOSED':
          clearTracingTimers();
          setIsLadderTracing(false);
          setActiveTracingMemberIndex(null);
          setCurrentTracerPosition(null);
          setCurrentTracedTrail([]);
          setArrivalPopup(null);
          isRoomClosedRef.current = true;
          setIsRoomClosed(true);
          if (msg.finalResult) {
            setLadderResult(msg.finalResult);
            ladderResultRef.current = msg.finalResult;
            const currentMembers = membersRef.current;
            const revGoals: Record<string, boolean> = {};
            const revCols: LadderRevealedGoalCols = {};
            currentMembers.forEach((m) => {
              revGoals[m.id] = true;
              const res = msg.finalResult[m.id];
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
          }
          if (!isRoomHost) {
            // 🔑 [항목 2-g: 게임 종료 시 링크 참가자 화면 인터랙션 팝업 오픈 -> 개인 플레이 모드 전환 안내]
            setIsGuestCloseNoticeOpen(true);
          }
          showToastRef.current('🔒 방장이 게임을 종료하였습니다. 개인 플레이 모드로 전환할 수 있습니다.', 'warning');
          break;

        case 'PRESENCE_CHANGE':
          setConnectedClients(msg.connectedClients);
          if (msg.members) {
            membersRef.current = msg.members;
            setMembers(msg.members);
          } else if (msg.seatReleasedTabId) {
            setMembers((prev) =>
              prev.map((m) =>
                m.claimedBy === msg.seatReleasedTabId ? { ...m, claimedBy: undefined } : m
              )
            );
          }
          break;
      }
    });

    channelRef.current = channel;

    if (!isRoomHost) {
      const snapshot = loadRoomSnapshot(roomId);
      if (snapshot) {
        const nextMembers = snapshot.members || membersRef.current;
        const nextWinnerCount = snapshot.winnerCount ?? winnerCountRef.current;
        const nextWeightsKey = nextMembers.map((m) => `${m.id}:${m.weight || 1}`).join(',');
        prevMembersCountRef.current = nextMembers.length;
        prevWinnerCountRef.current = nextWinnerCount;
        prevSettingsKeyRef.current = `${nextMembers.length}:${nextWinnerCount}:${nextWeightsKey}`;
        membersRef.current = nextMembers;
        ladderGoalsRef.current = snapshot.ladderGoals;
        ladderSeedRef.current = snapshot.ladderSeed;
        winnerCountRef.current = nextWinnerCount;
        ladderSpeedRef.current = snapshot.ladderSpeed;
        setMembers(nextMembers);
        setLadderGoals(snapshot.ladderGoals);
        setLadderSeed(snapshot.ladderSeed);
        setWinnerCount(nextWinnerCount);
        setUseLadderWeight(snapshot.useLadderWeight);
        setLadderSpeed(snapshot.ladderSpeed);
        setSelectedStore(snapshot.selectedStore);
      }
      channel.send({ type: 'SYNC_REQUEST', senderTabId: currentTabId });
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [roomId, isRoomHost, currentTabId, clearTracingTimers]);

  // 서버로부터 방 정보 패치 (폐기/종료된 방 접속 시 최종 결과 복원)
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/v1/games/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        const roomInfo = data?.room || data;
        if (roomInfo) {
          if (roomInfo.isClosed) {
            isRoomClosedRef.current = true;
            setIsRoomClosed(true);
            if (!isRoomHost) {
              setIsGuestCloseNoticeOpen(true);
            }
            if (roomInfo.finalResult) {
              setLadderResult(roomInfo.finalResult);
              ladderResultRef.current = roomInfo.finalResult;
              setIsResultModalOpen(true);
            }
          } else if (roomInfo.data && !isRoomHost) {
            const snap = roomInfo.data;
            const nextMembers = snap.members || membersRef.current;
            const nextWinnerCount = snap.winnerCount || winnerCountRef.current;
            const nextWeightsKey = nextMembers.map((m: Participant) => `${m.id}:${m.weight || 1}`).join(',');
            prevMembersCountRef.current = nextMembers.length;
            prevWinnerCountRef.current = nextWinnerCount;
            prevSettingsKeyRef.current = `${nextMembers.length}:${nextWinnerCount}:${nextWeightsKey}`;
            if (snap.members) {
              setMembers(snap.members);
              membersRef.current = snap.members;
            }
            if (snap.ladderGoals) {
              setLadderGoals(snap.ladderGoals);
              ladderGoalsRef.current = snap.ladderGoals;
            }
            if (snap.ladderSeed) {
              setLadderSeed(snap.ladderSeed);
              ladderSeedRef.current = snap.ladderSeed;
            }
            if (snap.winnerCount) {
              setWinnerCount(snap.winnerCount);
              winnerCountRef.current = snap.winnerCount;
            }
            if (snap.useLadderWeight !== undefined) {
              setUseLadderWeight(snap.useLadderWeight);
              useLadderWeightRef.current = snap.useLadderWeight;
            }
            if (snap.ladderSpeed) {
              setLadderSpeed(snap.ladderSpeed);
              ladderSpeedRef.current = snap.ladderSpeed;
            }
            if (snap.selectedStore !== undefined) {
              setSelectedStore(snap.selectedStore);
              selectedStoreRef.current = snap.selectedStore;
            }
            if (snap.ladderResult) {
              setLadderResult(snap.ladderResult);
              ladderResultRef.current = snap.ladderResult;
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch ladder room from server', err);
      });
  }, [roomId, isRoomHost, setLadderGoals, setMembers, setSelectedStore, setWinnerCount]);

  // 상위 SCR_GNT_01에 방 참여/방장 상태 동기화 (개인 모드 전환 시 상단 슬라이더/공유 잠금 즉시 해제)
  useEffect(() => {
    onRoomModeChange?.(!!roomId, isRoomHost);
  }, [roomId, isRoomHost, onRoomModeChange]);

  // 매장 변경 또는 연동 해제 시 참가자 메뉴 선택 및 아바타 기본값 복원, 게임결과 초기화
  const prevStoreIdRef = useRef<string | undefined>(selectedStore?.id);
  const isInitialMountRef = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (prevStoreIdRef.current !== selectedStore?.id) {
      prevStoreIdRef.current = selectedStore?.id;
      setMembers((prev) =>
        prev.map((m, idx) => {
          const preset = PRESET_CHARACTERS[idx % PRESET_CHARACTERS.length];
          return {
            ...m,
            selectedMenu: undefined,
            avatar: preset.avatar,
          };
        })
      );
      setLadderResult(null);
      setRevealedGoals({});
      setRevealedGoalCols({});
      setArrivalPopup(null);
      setIsResultModalOpen(false);
      if (selectedStore) {
        showToast(`🏪 매장이 '${selectedStore.name}'(으)로 변경되어 참가자 메뉴가 초기화되었습니다.`, 'info');
      } else {
        showToast('🏪 매장 연동이 해제되어 참가자 메뉴가 초기화되었습니다.', 'info');
      }
    }
  }, [selectedStore?.id, setMembers, showToast, selectedStore]);

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
      cameraScrollRef.current = el.scrollLeft;
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
      cameraScrollRef.current = ladderSliderRef.current.scrollLeft;
    }
  };

  const handleLadderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingLadderRef.current || !ladderSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - ladderSliderRef.current.offsetLeft;
    const walk = (x - ladderStartXRef.current) * 1.5;
    ladderSliderRef.current.scrollLeft = ladderScrollLeftRef.current - walk;
    cameraScrollRef.current = ladderSliderRef.current.scrollLeft;
  };

  const handleLadderMouseUpOrLeave = () => {
    isDraggingLadderRef.current = false;
  };

  const handleChangeLadderSpeed = (nextSpeed: number) => {
    if (isGuest || isRoomClosed) return;
    ladderSpeedRef.current = nextSpeed;
    setLadderSpeed(nextSpeed);
    if (channelRef.current) {
      channelRef.current.send({ type: 'UPDATE_SPEED', speed: nextSpeed }, getHostToken());
    }
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
    const nextSeed = ladderSeed + 1;
    setLadderSeed(nextSeed);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    if (channelRef.current) {
      channelRef.current.send({ type: 'SHUFFLE_RUNGS', seed: nextSeed }, getHostToken());
    }
    showToast('🎲 사다리 가로줄이 무작위로 재배치되었습니다!', 'info');
  };

  const handleShuffleGoals = () => {
    if (isLadderTracing) return;
    const shuffled = [...ladderGoals].sort(() => Math.random() - 0.5);
    setLadderGoals(shuffled);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    if (channelRef.current) {
      channelRef.current.send({ type: 'SHUFFLE_GOALS', goals: shuffled }, getHostToken());
    }
    showToast('🎯 목표 위치가 무작위로 재배치되었습니다!', 'info');
  };

  const handleShuffleMembers = () => {
    // 🔑 [피드백 2: 링크 참가자 모드에서도 참가자 섞기 허용 & 완전 교란(Derangement) 셔플 적용]
    if (isLadderTracing) return;
    let shuffled = [...members];
    if (shuffled.length > 1) {
      let attempts = 0;
      while (attempts < 15) {
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // 어떤 원소도 기존 위치(id)에 고정되지 않았는지 검사
        const hasFixedPoint = shuffled.some((m, idx) => m.id === members[idx].id);
        if (!hasFixedPoint) break;
        attempts++;
      }
    }
    setMembers(shuffled);
    membersRef.current = shuffled;
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    if (channelRef.current) {
      channelRef.current.send({ type: 'SHUFFLE_MEMBERS', members: shuffled }, getHostToken());
    }
    showToast('👥 참가자 순서가 무작위로 재배치되었습니다!', 'info');
  };

  const handleSkipToResult = (
    overrideRungs?: LadderRung[],
    overrideGoals?: LadderGoal[],
    overrideMembers?: Participant[],
    overrideResults?: LadderResultMap,
    overrideRevealedGoals?: Record<string, boolean>,
    overrideRevealedGoalCols?: LadderRevealedGoalCols
  ) => {
    clearTracingTimers();
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setArrivalPopup(null);

    const membersToUse = overrideMembers || membersRef.current;
    const rungsToUse = overrideRungs || ladderRungs;
    const goalsToUse = overrideGoals || ladderGoalsRef.current;
    const results = overrideResults || computeLadderPaths(membersToUse, goalsToUse, rungsToUse).results;

    const revGoals: Record<string, boolean> = overrideRevealedGoals ? { ...overrideRevealedGoals } : {};
    const revCols: LadderRevealedGoalCols = overrideRevealedGoalCols ? { ...overrideRevealedGoalCols } : {};
    if (!overrideRevealedGoals || !overrideRevealedGoalCols) {
      membersToUse.forEach((m) => {
        if (!overrideRevealedGoals) revGoals[m.id] = true;
        const res = results[m.id];
        if (res && !overrideRevealedGoalCols) {
          revCols[res.goalIndex] = {
            memberName: m.name,
            avatar: m.avatar,
            isWinner: res.isWinner,
          };
        }
      });
    }

    setLadderResult(results);
    ladderResultRef.current = results;
    setRevealedGoals(revGoals);
    revealedGoalsRef.current = revGoals;
    setRevealedGoalCols(revCols);
    revealedGoalColsRef.current = revCols;
    setIsResultModalOpen(true);

    return { results, revGoals, revCols };
  };

  // 게임 속도 연동 실시간 카메라 추적 엔진 (부동소수점 연속 보간 + 감쇠 예측 패닝 + 하드 안전 여백 클램핑)
  const ensureTracerVisible = (
    ptX: number,
    nextPtX?: number,
    immediate = false,
    isPanning = false,
    speedOverride?: number
  ) => {
    const el = ladderSliderRef.current;
    if (!el || isDraggingLadderRef.current) return;

    // 주자 출발 시 모바일 등에서 사다리 영역이 세로 뷰포트를 벗어나 있으면 화면 중앙에 맞춤
    if (immediate && typeof window !== 'undefined') {
      const rect = el.getBoundingClientRect();
      if (rect.top < 56 || rect.bottom > window.innerHeight - 40) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const viewWidth = el.clientWidth;
    const safeEdgePadding = Math.min(
      Math.max(56, Math.floor(viewWidth * 0.28)),
      LADDER_COL_WIDTH
    );

    const lookAheadDir = nextPtX !== undefined ? Math.sign(nextPtX - ptX) : 0;
    const forwardMargin = lookAheadDir * Math.min(42, Math.floor(viewWidth * 0.14));

    let targetScroll = ptX + forwardMargin - viewWidth / 2;
    if (ptX - targetScroll < safeEdgePadding) {
      targetScroll = ptX - safeEdgePadding;
    }
    if (targetScroll + viewWidth - ptX < safeEdgePadding) {
      targetScroll = ptX + safeEdgePadding - viewWidth;
    }
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));

    if (immediate) {
      cameraScrollRef.current = targetScroll;
      el.scrollLeft = targetScroll;
      return;
    }

    const activeSpeed = speedOverride ?? ladderSpeedRef.current;
    const followRate = isPanning
      ? 0.5
      : Math.min(0.95, Math.max(0.28, 0.52 * activeSpeed));
    const currentScroll = cameraScrollRef.current || el.scrollLeft;
    const diff = targetScroll - currentScroll;

    let nextScroll = Math.abs(diff) > 0.2 ? currentScroll + diff * followRate : targetScroll;
    if (ptX - nextScroll < safeEdgePadding) {
      nextScroll = ptX - safeEdgePadding;
    }
    if (nextScroll + viewWidth - ptX < safeEdgePadding) {
      nextScroll = ptX + safeEdgePadding - viewWidth;
    }
    nextScroll = Math.max(0, Math.min(maxScroll, nextScroll));
    cameraScrollRef.current = nextScroll;
    el.scrollLeft = nextScroll;
  };

  // 출발 컬럼으로 220ms 부드러운 ease-out 팬 (순간 텔레포트/끊김 완화)
  const smoothPanToStartX = (startX: number) => {
    const el = ladderSliderRef.current;
    if (!el) return;

    if (typeof window !== 'undefined') {
      const rect = el.getBoundingClientRect();
      if (rect.top < 56 || rect.bottom > window.innerHeight - 40) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const targetScroll = Math.max(0, Math.min(maxScroll, startX - el.clientWidth / 2));
    const fromScroll = el.scrollLeft;
    cameraLookAheadRef.current = 0;

    if (Math.abs(targetScroll - fromScroll) < 2 || typeof requestAnimationFrame === 'undefined') {
      cameraScrollRef.current = targetScroll;
      el.scrollLeft = targetScroll;
      return;
    }

    const startTime = performance.now();
    const duration = 220;

    const panStep = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = fromScroll + (targetScroll - fromScroll) * eased;
      cameraScrollRef.current = cur;
      if (!isDraggingLadderRef.current && ladderSliderRef.current) {
        ladderSliderRef.current.scrollLeft = cur;
      }
      if (t < 1) {
        panRafIdRef.current = requestAnimationFrame(panStep);
      } else {
        panRafIdRef.current = null;
      }
    };

    panRafIdRef.current = requestAnimationFrame(panStep);
  };

  // 60/120Hz 프레임 독립적 지수 감쇠 카메라 추종 (VSync 일치 + sub-pixel float 누적)
  const updateCameraDuringTrace = (
    ptX: number,
    vx: number,
    dt: number,
    activeSpeed: number
  ) => {
    const el = ladderSliderRef.current;
    if (!el || isDraggingLadderRef.current) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const viewWidth = el.clientWidth;
    const safeEdgePadding = Math.min(
      Math.max(56, Math.floor(viewWidth * 0.28)),
      LADDER_COL_WIDTH
    );

    // 가로줄 방향 전환 시 42px 급점프 대신 지수 보간으로 시선 오프셋을 부드럽게 이동
    const desiredLookAhead = vx * Math.min(42, Math.floor(viewWidth * 0.14));
    const lookAheadAlpha = 1 - Math.exp(-5.0 * dt);
    cameraLookAheadRef.current +=
      (desiredLookAhead - cameraLookAheadRef.current) * lookAheadAlpha;

    let targetScroll = ptX + cameraLookAheadRef.current - viewWidth / 2;
    if (ptX - targetScroll < safeEdgePadding) {
      targetScroll = ptX - safeEdgePadding;
    }
    if (targetScroll + viewWidth - ptX < safeEdgePadding) {
      targetScroll = ptX + safeEdgePadding - viewWidth;
    }
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));

    const responsiveness = Math.max(8, 10.5 * activeSpeed);
    const camAlpha = 1 - Math.exp(-responsiveness * dt);
    let nextScroll =
      cameraScrollRef.current + (targetScroll - cameraScrollRef.current) * camAlpha;

    // 2차 하드 바운드 클램핑: 어떤 배속에서도 포인트가 안전 시야 밖으로 이탈하지 않도록 보장
    if (ptX - nextScroll < safeEdgePadding) {
      nextScroll = ptX - safeEdgePadding;
    }
    if (nextScroll + viewWidth - ptX < safeEdgePadding) {
      nextScroll = ptX + safeEdgePadding - viewWidth;
    }

    nextScroll = Math.max(0, Math.min(maxScroll, nextScroll));
    cameraScrollRef.current = nextScroll;
    el.scrollLeft = nextScroll;
  };

  // 통합 requestAnimationFrame 연속 보간 주행 엔진 (주자 1 및 후속 주자 공통)
  const startRunnerTraceAnimation = (
    member: Participant,
    memberIdx: number,
    totalMembers: number,
    waypoints: { x: number; y: number }[],
    results: LadderResultMap,
    membersToUse: Participant[],
    broadcast: boolean,
    hostTokenToUse: string | null
  ) => {
    clearTracingTimers();
    const startPt = waypoints[0] || null;
    setActiveTracingMemberIndex(memberIdx);
    setCurrentTracerPosition(startPt);
    setCurrentTracedTrail(startPt ? [startPt] : []);

    if (startPt) {
      smoothPanToStartX(startPt.x);
    }

    const curve = buildPolylineCurve(waypoints);
    const BASE_PX_PER_SEC = 300; // 1.0x 기준 초당 300px

    stepTimeoutRef.current = setTimeout(() => {
      stepTimeoutRef.current = null;
      if (panRafIdRef.current !== null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(panRafIdRef.current);
        panRafIdRef.current = null;
      }
      if (ladderSliderRef.current) {
        cameraScrollRef.current = ladderSliderRef.current.scrollLeft;
      }
      cameraLookAheadRef.current = 0;

      let traveledDist = 0;
      let lastTimestamp: number | null = null;

      const stepFrame = (now: number) => {
        if (lastTimestamp === null) {
          lastTimestamp = now;
        }
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTimestamp) / 1000));
        lastTimestamp = now;

        const activeSpeed = ladderSpeedRef.current;
        traveledDist += BASE_PX_PER_SEC * activeSpeed * dt;

        const sample = samplePolylineAtDistance(curve, traveledDist);
        setCurrentTracerPosition(sample.pos);
        setCurrentTracedTrail(sample.trail);
        updateCameraDuringTrace(sample.pos.x, sample.vx, dt, activeSpeed);

        if (!sample.done) {
          rafIdRef.current = requestAnimationFrame(stepFrame);
          return;
        }

        rafIdRef.current = null;
        const finalPt = waypoints[waypoints.length - 1] || null;
        setCurrentTracerPosition(finalPt);
        setCurrentTracedTrail(waypoints);
        if (finalPt) {
          ensureTracerVisible(finalPt.x, undefined, false, false, activeSpeed);
        }

        const newRevealedGoals = { ...revealedGoalsRef.current, [member.id]: true };
        revealedGoalsRef.current = newRevealedGoals;
        setRevealedGoals(newRevealedGoals);

        let newRevealedGoalCols = { ...revealedGoalColsRef.current };
        const currentResult = results[member.id];
        if (currentResult) {
          newRevealedGoalCols = {
            ...newRevealedGoalCols,
            [currentResult.goalIndex]: {
              memberName: member.name,
              avatar: member.avatar,
              isWinner: currentResult.isWinner,
            },
          };
          revealedGoalColsRef.current = newRevealedGoalCols;
          setRevealedGoalCols(newRevealedGoalCols);
        }

        const nextIdx = memberIdx + 1;
        const isLast = nextIdx >= totalMembers;
        const nextMember = !isLast ? membersToUse[nextIdx] : undefined;

        setArrivalPopup({
          member,
          result: currentResult,
          memberIndex: memberIdx,
          totalMembers,
          nextMemberName: nextMember?.name,
        });

        // 🔑 [호스트 주도 이벤트 방송]: 주자 도착 팝업 및 주자 매핑 결과를 모든 참가자에게 즉시 방송
        if (broadcast && isRoomHost && channelRef.current) {
          channelRef.current.send(
            {
              type: 'LADDER_RUNNER_ARRIVED',
              memberIndex: memberIdx,
              member,
              result: currentResult,
              isLast,
              totalMembers,
              nextMemberName: nextMember?.name,
              revealedGoals: newRevealedGoals,
              revealedGoalCols: newRevealedGoalCols,
            },
            hostTokenToUse
          );
        }
      };

      rafIdRef.current = requestAnimationFrame(stepFrame);
    }, 250);
  };

  const handlePlayLadder = (
    skipTrace = false,
    broadcast = true,
    overrideRungs?: LadderRung[],
    overrideGoals?: LadderGoal[],
    overrideMembers?: Participant[],
    overrideSpeed?: number,
    overrideResults?: LadderResultMap,
    overrideRevealedGoals?: Record<string, boolean>,
    overrideRevealedGoalCols?: LadderRevealedGoalCols
  ) => {
    const membersToUse = overrideMembers || membersRef.current;
    const speedToUse = overrideSpeed ?? ladderSpeedRef.current;
    const hostTokenToUse = getHostToken();

    if (skipTrace) {
      // 🔑 [원자적 즉시결과 동기화] SHUFFLE_RUNGS 별도 송신 시 HTTP 레이스로 게스트 결과가 덮어써지는 문제 원천 차단
      let targetSeed = ladderSeedRef.current;
      if (broadcast) {
        targetSeed = ladderSeedRef.current + 1;
        ladderSeedRef.current = targetSeed;
        setLadderSeed(targetSeed);
      }
      const freshRungs = overrideRungs || generateLadderRungs(membersToUse.length, targetSeed);
      const goalsForSkip = overrideGoals || ladderGoalsRef.current;

      const skipOutcome = handleSkipToResult(
        freshRungs,
        goalsForSkip,
        membersToUse,
        overrideResults,
        overrideRevealedGoals,
        overrideRevealedGoalCols
      );

      if (broadcast && channelRef.current) {
        channelRef.current.send(
          {
            type: 'PLAY_LADDER',
            skipTrace: true,
            speed: speedToUse,
            seed: targetSeed,
            rungs: freshRungs,
            goals: goalsForSkip,
            members: membersToUse,
            results: skipOutcome.results,
            revealedGoals: skipOutcome.revGoals,
            revealedGoalCols: skipOutcome.revCols,
          },
          hostTokenToUse
        );
      }
      return;
    }

    const rungsToUse = overrideRungs || ladderRungs;
    const goalsToUse = overrideGoals || ladderGoalsRef.current;

    if (broadcast && channelRef.current) {
      channelRef.current.send(
        {
          type: 'PLAY_LADDER',
          skipTrace,
          speed: speedToUse,
          seed: ladderSeedRef.current,
          rungs: rungsToUse,
          goals: goalsToUse,
          members: membersToUse,
        },
        hostTokenToUse
      );
    }

    clearTracingTimers();

    setArrivalPopup(null);
    const { results, waypointsMap } = computeLadderPaths(membersToUse, goalsToUse, rungsToUse);
    setIsLadderTracing(true);
    setLadderResult(null);
    ladderResultRef.current = null;
    setCurrentTracedTrail([]);
    setRevealedGoals({});
    revealedGoalsRef.current = {};
    setRevealedGoalCols({});
    revealedGoalColsRef.current = {};

    const firstMember = membersToUse[0];
    if (!firstMember) {
      setIsLadderTracing(false);
      return;
    }

    startRunnerTraceAnimation(
      firstMember,
      0,
      membersToUse.length,
      waypointsMap[firstMember.id] || [],
      results,
      membersToUse,
      broadcast,
      hostTokenToUse
    );
  };
  handlePlayLadderRef.current = handlePlayLadder;

  const handleProceedAfterArrival = (
    targetIdx?: number,
    broadcast = true,
    overrideRungs?: LadderRung[],
    overrideGoals?: LadderGoal[],
    overrideMembers?: Participant[],
    overrideSpeed?: number
  ) => {
    const membersToUse = overrideMembers || membersRef.current;
    const rungsToUse = overrideRungs || ladderRungs;
    const goalsToUse = overrideGoals || ladderGoalsRef.current;
    const speedToUse = overrideSpeed ?? ladderSpeedRef.current;

    const currentArrival = arrivalPopupRef.current || arrivalPopup;
    const nextIdx = targetIdx !== undefined ? targetIdx : (currentArrival ? currentArrival.memberIndex + 1 : 0);
    const isLast = nextIdx >= membersToUse.length;
    clearTracingTimers();
    setArrivalPopup(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);

    const { results, waypointsMap } = computeLadderPaths(membersToUse, goalsToUse, rungsToUse);
    const hostTokenToUse = getHostToken();

    if (isLast) {
      setIsLadderTracing(false);
      setActiveTracingMemberIndex(null);
      setCurrentTracerPosition(null);
      setLadderResult(results);
      ladderResultRef.current = results;
      setIsResultModalOpen(true);

      if (broadcast && isRoomHost && channelRef.current) {
        channelRef.current.send(
          {
            type: 'LADDER_COMPLETE',
            results,
            revealedGoals: revealedGoalsRef.current,
            revealedGoalCols: revealedGoalColsRef.current,
          },
          hostTokenToUse
        );
      }
    } else {
      if (broadcast && isRoomHost && channelRef.current) {
        channelRef.current.send(
          {
            type: 'LADDER_PROCEED_NEXT',
            nextMemberIndex: nextIdx,
            speed: speedToUse,
            rungs: rungsToUse,
            goals: goalsToUse,
            members: membersToUse,
          },
          hostTokenToUse
        );
      }

      setIsLadderTracing(true);
      const nextMember = membersToUse[nextIdx];
      startRunnerTraceAnimation(
        nextMember,
        nextIdx,
        membersToUse.length,
        waypointsMap[nextMember.id] || [],
        results,
        membersToUse,
        broadcast,
        hostTokenToUse
      );
    }
  };
  handleProceedRef.current = handleProceedAfterArrival;

  const handleGoalColClick = (colIdx: number) => {
    if (isLadderTracing || isRoomClosed) return;
    if (isGuest) {
      showToast('방장만 사다리 목표를 직접 편집할 수 있습니다.', 'warning');
      return;
    }
    setEditingGoalCol(colIdx);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (colIdx: number, newGoal: LadderGoal) => {
    const updatedGoals = ladderGoalsRef.current.map((g, idx) => (idx === colIdx ? newGoal : g));
    setLadderGoals(updatedGoals);
    ladderGoalsRef.current = updatedGoals;
    if (channelRef.current && isRoomHost) {
      channelRef.current.send(
        {
          type: 'SHUFFLE_GOALS',
          goals: updatedGoals,
        },
        getHostToken()
      );
    }
    showToast(`${colIdx + 1}번 기둥 목표가 '${newGoal.text}'(으)로 변경되었습니다.`);
  };

  const handleSelectStore = (store: StorePreset | null) => {
    setSelectedStore(store);
    selectedStoreRef.current = store;
    if (channelRef.current && isRoomHost) {
      channelRef.current.send(
        {
          type: 'UPDATE_STORE',
          store,
        },
        getHostToken()
      );
    }
  };

  const handleToggleLadderWeight = () => {
    if (isGuest || isRoomClosed) return;
    const nextVal = !useLadderWeightRef.current;
    setUseLadderWeight(nextVal);
    useLadderWeightRef.current = nextVal;
    if (channelRef.current && isRoomHost) {
      channelRef.current.send(
        {
          type: 'UPDATE_LADDER_WEIGHT',
          useLadderWeight: nextVal,
        },
        getHostToken()
      );
    }
  };

  const handleWinnerCountChange = (val: number) => {
    if (isGuest || isRoomClosed) return;
    setWinnerCount(val);
    winnerCountRef.current = val;
    prevWinnerCountRef.current = val;
    const safeWinners = Math.max(1, Math.min(members.length - 1, val));
    const newGoals = generateDefaultLadderGoals(members.length, safeWinners);
    setLadderGoals(newGoals);
    ladderGoalsRef.current = newGoals;
    if (channelRef.current && isRoomHost) {
      channelRef.current.send(
        {
          type: 'UPDATE_WINNER_COUNT',
          winnerCount: val,
          goals: newGoals,
        },
        getHostToken()
      );
    }
  };

  const handleOpenStoreMenuPicker = (memberId: string) => {
    if (isRoomClosed) return;
    const target = members.find((m) => m.id === memberId);
    if (isGuest && target?.claimedBy !== currentTabId) {
      showToast('본인이 점유(찜)한 참가자의 메뉴만 선택할 수 있습니다.', 'warning');
      return;
    }
    setStoreModalMemberId(memberId);
    setStoreModalMode('MEMBER_MENU');
    setIsStoreModalOpen(true);
  };

  const handleSelectMenuForMember = (memberId: string, item: StoreMenuItem) => {
    if (isLadderTracing || isRoomClosed) {
      showToast('사다리가 진행 중이거나 마감된 게임에서는 메뉴를 변경할 수 없습니다.', 'warning');
      return;
    }
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
    if (channelRef.current) {
      channelRef.current.send({
        type: 'UPDATE_MEMBER_DETAILS',
        memberId,
        avatarEmoji: menuEmoji,
        selectedMenu: item,
      });
    }
    showToast(`'${item.name}' 메뉴가 선택되어 참가자 아이콘이 교체되었습니다.`);
  };

  // 🔑 [게스트 아이콘 변경] 참가자 아바타 이모티콘 변경 핸들러 및 실시간 동기화
  const handleSelectAvatarForMember = (memberId: string, emoji: string) => {
    if (isLadderTracing || isRoomClosed) {
      showToast('사다리가 진행 중이거나 마감된 게임에서는 아이콘을 변경할 수 없습니다.', 'warning');
      return;
    }
    const target = members.find((m) => m.id === memberId);
    if (isGuest && target?.claimedBy !== currentTabId) {
      showToast('본인이 점유(찜)한 참가자의 아이콘만 변경할 수 있습니다.', 'warning');
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, avatar: emoji, selectedMenu: undefined }
          : m
      )
    );
    if (channelRef.current) {
      channelRef.current.send({
        type: 'UPDATE_MEMBER_DETAILS',
        memberId,
        avatarEmoji: emoji,
        selectedMenu: undefined,
      });
    }
    setAvatarPickerMemberId(null);
    showToast(`참가자 아이콘이 '${emoji}'(으)로 변경되었습니다.`);
  };

  // 참가자 이름 직접 수정 핸들러
  const handleUpdateMemberName = (id: string, newName: string) => {
    if (isLadderTracing || isRoomClosed) {
      showToast('사다리가 진행 중이거나 마감된 게임에서는 이름을 변경할 수 없습니다.', 'warning');
      return;
    }
    const target = members.find((m) => m.id === id);
    if (isGuest && target?.claimedBy !== currentTabId) {
      showToast('본인이 점유(찜)한 참가자의 이름만 변경할 수 있습니다.', 'warning');
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
    if (channelRef.current) {
      channelRef.current.send({
        type: 'UPDATE_MEMBER_DETAILS',
        memberId: id,
        name: newName,
      });
    }
  };

  // 내 자리 찜하기 토글 (단일 선택 및 이전 선택 초기화 보장)
  const handleToggleClaimSeat = (memberId: string) => {
    if (isLadderTracing || isRoomClosed) {
      showToast('사다리가 진행 중이거나 마감된 게임에서는 자리를 변경할 수 없습니다.', 'warning');
      return;
    }
    const targetMember = members.find((m) => m.id === memberId);
    if (targetMember && targetMember.claimedBy && targetMember.claimedBy !== currentTabId) {
      showToast('이미 다른 참가자가 선택한 자리입니다.', 'warning');
      return;
    }

    setMembers((prev) => {
      const isAlreadyClaimedByMe = targetMember?.claimedBy === currentTabId;

      return prev.map((m) => {
        // 기존에 내가 점유한 다른 자리는 모두 해제 (단일 선택)
        if (m.claimedBy === currentTabId && m.id !== memberId) {
          return { ...m, claimedBy: undefined };
        }
        if (m.id === memberId) {
          return {
            ...m,
            claimedBy: isAlreadyClaimedByMe ? undefined : currentTabId,
          };
        }
        return m;
      });
    });

    if (channelRef.current) {
      channelRef.current.send({
        type: 'CLAIM_SEAT',
        memberId,
        tabId: currentTabId,
      });
    }
  };

  // 게임 공유하기 링크 생성 및 클립보드 복사
  const handleShareRoom = () => {
    let targetRoomId = roomId;
    if (!targetRoomId) {
      targetRoomId = generateGameRoomId('LADDER');
      setRoomId(targetRoomId);
      setIsRoomHost(true);

      // 🔑 [보안] URL에 host=1 파라미터를 추가하지 않고 깔끔하게 room만 유지
      const url = new URL(window.location.href);
      url.searchParams.set('room', targetRoomId);
      url.searchParams.delete('host');
      window.history.replaceState({}, '', url.toString());

      const stateSnapshot: LadderSyncState = {
        roomId: targetRoomId,
        hostTabId: currentTabId,
        members,
        ladderGoals,
        ladderSeed,
        winnerCount,
        useLadderWeight,
        ladderSpeed,
        selectedStore,
        ladderResult,
        timestamp: Date.now(),
      };

      saveRoomSnapshot(targetRoomId, stateSnapshot);

      // Register room to server for cross-device SSE & receive hostToken
      fetch('/api/v1/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: targetRoomId,
          gameType: 'LADDER',
          hostTabId: currentTabId,
          hostName: members[0]?.name || '호스트',
          data: stateSnapshot,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.hostToken) {
            setHostToken(data.hostToken);
            hostTokenRef.current = data.hostToken;
            try {
              window.sessionStorage.setItem(`moabogo_host_token_${targetRoomId}`, data.hostToken);
            } catch (e) {
              // ignore
            }
          }
        })
        .catch((e) => {
          console.warn('Failed to register room to server', e);
        });
    } else {
      // 🔑 이미 roomId가 있는 경우에도 최신 토큰 확보 및 서버 동기화
      const existingToken = getHostToken();
      fetch('/api/v1/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: targetRoomId,
          gameType: 'LADDER',
          hostTabId: currentTabId,
          hostToken: existingToken || undefined,
          hostName: members[0]?.name || '호스트',
          data: {
            members: membersRef.current,
            ladderGoals: ladderGoalsRef.current,
            ladderSeed: ladderSeedRef.current,
            winnerCount: winnerCountRef.current,
            useLadderWeight: useLadderWeightRef.current,
            ladderSpeed: ladderSpeedRef.current,
            selectedStore: selectedStoreRef.current,
            ladderResult: ladderResultRef.current,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.hostToken) {
            setHostToken(data.hostToken);
            hostTokenRef.current = data.hostToken;
            try {
              window.sessionStorage.setItem(`moabogo_host_token_${targetRoomId}`, data.hostToken);
            } catch (e) {
              // ignore
            }
          }
        })
        .catch((e) => {
          console.warn('Failed to re-register room to server', e);
        });
    }

    // 🔑 [항목 2-h: 다시 공유 시작한 뒤 '게임 종료' 배너 및 종료 상태 즉시 소거]
    setIsRoomClosed(false);
    setIsShareModalOpen(true);
  };

  // 🔑 [항목 2-i: 초대자 화면에서 게임 마감 후 새 게임 재시작 핸들러]
  const handleRestartGame = () => {
    setIsRoomClosed(false);
    setLadderResult(null);
    ladderResultRef.current = null;
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    setIsResultModalOpen(false);
    const nextSeed = ladderSeed + 1;
    setLadderSeed(nextSeed);
    const hostTokenToUse = getHostToken();
    if (channelRef.current) {
      channelRef.current.send({ type: 'RESET_GAME' }, hostTokenToUse);
      channelRef.current.send({ type: 'SHUFFLE_RUNGS', seed: nextSeed }, hostTokenToUse);
    }
    showToast('🎮 새 게임이 준비되었습니다! 사다리 타기를 시작하세요.', 'success');
  };

  useEffect(() => {
    onRegisterShareHandler?.(handleShareRoom);
  }, [handleShareRoom, onRegisterShareHandler]);

  const currentShareUrl = useMemo(() => {
    if (!roomId) return '';
    return buildRoomShareUrl(roomId, 'ladder');
  }, [roomId]);

  const handleCopyShareUrl = () => {
    if (!currentShareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentShareUrl).then(() => {
        showToast('🔗 실시간 방 초대 링크가 복사되었습니다!');
      }).catch(() => {
        showToast(`초대 링크: ${currentShareUrl}`);
      });
    } else {
      showToast(`초대 링크: ${currentShareUrl}`);
    }
  };

  const handleCopyRoomCode = () => {
    if (!roomId) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomId).then(() => {
        showToast(`📋 방 코드 '${roomId}'가 복사되었습니다!`);
      }).catch(() => {
        showToast(`방 코드: ${roomId}`);
      });
    } else {
      showToast(`방 코드: ${roomId}`);
    }
  };

  // 게임 종료 핸들러 (초대 링크 폐기 및 최종 결과 이력 저장)
  const handleCloseRoom = () => {
    if (!roomId) return;
    const targetRoomId = roomId;
    const hostTokenToUse = getHostToken();
    const finalResultToUse = ladderResultRef.current || ladderResult;

    clearTracingTimers();
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setArrivalPopup(null);
    setIsShareModalOpen(false);
    isRoomClosedRef.current = true;
    setIsRoomClosed(true);

    // 당일 이력 저장
    const winners = Object.entries(finalResultToUse || {}).filter(([, r]) => r.isWinner);
    const winnerSummary = winners.length > 0
      ? winners.map(([mid, r]) => {
        const m = members.find((item) => item.id === mid);
        return `${m?.name || '참가자'}(${r.text})`;
      }).join(', ')
      : `${members.length}명 참여 완료`;

    saveSharedGameHistory({
      id: `hist_${targetRoomId}_${Date.now()}`,
      roomId: targetRoomId,
      gameType: 'LADDER',
      title: selectedStore ? `${selectedStore.name} 사다리` : '사다리타기 게임',
      dateStr: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      participantsCount: members.length,
      winnerSummary,
      closedAt: Date.now(),
      data: {
        members,
        ladderGoals,
        selectedStore,
        ladderResult: finalResultToUse,
      },
    });

    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'CLOSE_ROOM',
          finalResult: finalResultToUse,
        },
        hostTokenToUse
      );
      channelRef.current.close();
      channelRef.current = null;
    }

    // 🔑 [피드백 1: 방장 게임종료 시 상태를 완전히 개인 모드로 전환 및 URL room/host 정리]
    try {
      window.sessionStorage.removeItem(`moabogo_host_token_${targetRoomId}`);
    } catch (e) {
      // ignore
    }
    setMembers((prev) => prev.map((m) => ({ ...m, claimedBy: undefined })));
    setRoomId(null);
    setHostToken(null);
    hostTokenRef.current = null;
    setIsRoomHost(false);
    isRoomClosedRef.current = false;
    setIsRoomClosed(false);
    setConnectedClients(1);
    onRoomModeChange?.(false, false);

    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('host');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));

    showToastRef.current('🔒 게임이 종료되었습니다. 초대 링크가 폐기되었으며 개인 게임 모드로 전환되었습니다.', 'info');
  };

  // 참가게임 이탈 핸들러 (개인 플레이 모드로 완벽 전환)
  const handleLeaveRoom = useCallback(() => {
    clearTracingTimers();
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setArrivalPopup(null);
    setIsGuestCloseNoticeOpen(false);
    setIsShareModalOpen(false);

    if (roomId) {
      try {
        window.sessionStorage.removeItem(`moabogo_host_token_${roomId}`);
      } catch (e) {
        // ignore
      }
    }
    if (roomId && channelRef.current) {
      if (!isRoomClosedRef.current) {
        channelRef.current.send({ type: 'LEAVE_ROOM', tabId: currentTabId });
      }
      channelRef.current.close();
      channelRef.current = null;
    }
    setMembers((prev) => prev.map((m) => ({ ...m, claimedBy: undefined })));
    setRoomId(null);
    setHostToken(null);
    hostTokenRef.current = null;
    setIsRoomHost(false);
    isRoomClosedRef.current = false;
    setIsRoomClosed(false);
    setConnectedClients(1);
    onRoomModeChange?.(false, false);

    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('host');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    showToastRef.current('개인 플레이 모드로 전환되었습니다. 자유롭게 게임을 계속할 수 있습니다.', 'info');
  }, [clearTracingTimers, currentTabId, onRoomModeChange, roomId, setMembers]);

  useEffect(() => {
    onRegisterLeaveHandler?.(handleLeaveRoom);
  }, [handleLeaveRoom, onRegisterLeaveHandler]);

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
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${resolvedTheme === 'dawn'
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
          disabled={isGuest}
          onClick={() => {
            if (isGuest) return;
            setStoreModalMemberId(members[0]?.id || '');
            setStoreModalMode('STORE_ONLY');
            setIsStoreModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all ${isGuest
              ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-zinc-800'
              : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer'
            }`}
          title={isGuest ? '방장만 매장 메뉴를 변경할 수 있습니다 (읽기 전용)' : undefined}
        >
          {isGuest ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Store className="w-3.5 h-3.5" />}
          <span>{selectedStore ? '매장 변경 / 해제' : '매장 메뉴 연동하기'}</span>
          {isGuest && <span className="text-[10px] text-slate-400 font-normal">(방장 전용)</span>}
        </button>
      </div>

      {/* 사다리 컨트롤러 및 설정 패널 */}
      <div
        className={`p-4 rounded-2xl border space-y-4 ${resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe]'
            : isDark
              ? 'bg-[#1a1a1e] border-[#27272a]'
              : 'bg-slate-50 border-slate-200/80'
          }`}
      >
        {/* 당첨 인원 슬라이더 & 가중치 모드 토글 (항목 2-b: 참여인원수와 100% 동일한 헤더 및 인원수 표시) */}
        <div className="w-full">
          <ElmRng01
            label={isGuest ? '당첨 인원수 (방장 제어 · 읽기 전용)' : '당첨 인원수'}
            labelExtra={
              <button
                type="button"
                disabled={isGuest || isRoomClosed}
                onClick={handleToggleLadderWeight}
                className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border transition-all flex items-center gap-1 ${isGuest || isRoomClosed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${useLadderWeight
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                    : resolvedTheme === 'dawn'
                      ? 'bg-white/80 border-[#bfdbfe] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      : isDark
                        ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                title={isGuest ? '방장만 가중치를 제어할 수 있습니다' : '가중치 모드 토글'}
              >
                <span>
                  {useLadderWeight
                    ? `가중치 ON (${members.filter((m) => (m.weight || 1) !== 1).length}명)`
                    : '가중치 OFF'}
                </span>
              </button>
            }
            value={winnerCount}
            min={1}
            max={Math.max(1, members.length - 1)}
            step={1}
            unit="명"
            disabled={isGuest || isLadderTracing || isRoomClosed}
            onChange={handleWinnerCountChange}
            colorScheme="indigo"
          />
        </div>

        {/* 퀵 액션 버튼 바: 속도 조절(모바일 줄바꿈 방지 슬라이드), 주사위 재배치, 셔플 */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5 shrink min-w-0 max-w-full">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 shrink-0 flex items-center gap-1">
              <span>속도:</span>
              {isGuest && <Lock className="w-3 h-3 text-slate-400" />}
            </span>
            {LADDER_SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isGuest || isRoomClosed}
                onClick={() => {
                  if (isGuest || isRoomClosed) return;
                  handleChangeLadderSpeed(opt.value);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all shrink-0 ${isGuest || isRoomClosed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${ladderSpeed === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleShuffleMembers}
              disabled={isLadderTracing}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${isLadderTracing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              title="참가자 순서 무작위 섞기 (참가자 공통)"
            >
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>참가자 섞기</span>
            </button>

            <button
              type="button"
              onClick={handleReshuffleRungs}
              disabled={isLadderTracing}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${isLadderTracing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              title="사다리 가로줄 무작위 섞기 (참가자 공통)"
            >
              <Dices className="w-3.5 h-3.5 text-indigo-500" />
              <span>가로줄 섞기</span>
            </button>

            <button
              type="button"
              onClick={handleShuffleGoals}
              disabled={isLadderTracing}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${isLadderTracing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              title="사다리 목표 무작위 섞기 (참가자 공통)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>목표 섞기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 사다리 메인 뷰어 존 */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-5 ${resolvedTheme === 'dawn'
            ? 'bg-white/80 border-[#bfdbfe]'
            : isDark
              ? 'bg-[#18181b] border-[#27272a]'
              : 'bg-white border-slate-200'
          }`}
      >
        {/* 사다리 플레이존 타이틀 헤더 */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-zinc-100">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>사다리 플레이존</span>
            </h3>
            {roomId && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                {roomId}
              </span>
            )}
            {isRoomClosed ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>종료됨 (초대 폐기)</span>
              </span>
            ) : roomId ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{connectedClients}명 동시 접속</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {roomId && isRoomHost && !isRoomClosed && (
              <button
                type="button"
                onClick={handleCloseRoom}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="초대 링크를 폐기하고 신규 유입을 차단합니다"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>게임 종료</span>
              </button>
            )}

            {/* 🔑 [항목 1: 링크 참가자 모드에서는 공유 버튼 비활성화 처리] */}
            <button
              type="button"
              disabled={isGuest}
              onClick={handleShareRoom}
              className={`p-2 rounded-xl border transition-all shadow-2xs ${isGuest
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-400'
                  : roomId
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400/30 cursor-pointer active:scale-95'
                    : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer active:scale-95'
                }`}
              title={isGuest ? '참가자 모드에서는 공유 링크를 생성할 수 없습니다 (방장 전용)' : '실시간 다자간 방 공유 및 QR 코드 열기'}
              aria-label="실시간 방 공유"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 닫힌 방 알림 배너 */}
        {isRoomClosed && (
          <div className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>방장이 게임을 종료하여 신규 참여가 마감되었습니다. 최종 게임 결과는 아래 팝업에서 확인 가능합니다.</span>
            </div>
            {ladderResult && (
              <button
                type="button"
                onClick={() => setIsResultModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                결과 팝업 보기
              </button>
            )}
          </div>
        )}

        {/* 참가자 헤더 칩 (상단 출발점) - 슬라이드드래그휠 복원 */}
        <div
          ref={ladderSliderRef}
          onMouseDown={handleLadderMouseDown}
          onMouseMove={handleLadderMouseMove}
          onMouseUp={handleLadderMouseUpOrLeave}
          onMouseLeave={handleLadderMouseUpOrLeave}
          className="w-full overflow-x-auto no-scrollbar py-2 cursor-grab active:cursor-grabbing select-none"
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
                  className={`flex flex-col items-center justify-start shrink-0 px-1 transition-all ${isOdd ? 'pt-7' : 'pt-0'
                    }`}
                >
                  {/* 2. 아이콘 상단 참가자 이름 직접 수정 입력필드 (항목 2-d: 한글 IME 중복 입력 방어) */}
                  <div className="w-full mb-1">
                    <MemberNameInput
                      initialName={m.name}
                      disabled={isLadderTracing || (isGuest && m.claimedBy !== currentTabId)}
                      onCommit={(newName) => handleUpdateMemberName(m.id, newName)}
                    />
                  </div>

                  {/* 3. 자리 찜하기 및 아바타 아이콘 영역 (높이 동일하게 고정하여 단차 0%) */}
                  <button
                    type="button"
                    onClick={() => handleToggleClaimSeat(m.id)}
                    className={`relative w-full p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${isClaimedByMe
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-2 ring-indigo-400'
                        : isClaimedByOther
                          ? 'border-slate-300 dark:border-zinc-700 bg-slate-100/60 dark:bg-zinc-800/40 opacity-75'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-300'
                      }`}
                    title={isClaimedByMe ? '내 자리 (클릭 시 점유 해제)' : '내 자리로 찜하기'}
                  >
                    {/* 내자리 선택 시 우상단 체크마크 배지 (단차 발생 방지) */}
                    {isClaimedByMe && (
                      <>
                        <span
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-zinc-800 z-10 animate-in zoom-in-75"
                          title="내 자리 선택됨"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setAvatarPickerMemberId(m.id);
                          }}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-zinc-800 z-10 animate-in zoom-in-75 cursor-pointer"
                          title="아이콘 이모티콘 변경"
                        >
                          <Smile className="w-3 h-3" />
                        </span>
                      </>
                    )}

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

                  {/* 매장 메뉴 선택 버튼 (매장 선택 시) 또는 내 자리 아이콘 변경 버튼 */}
                  {selectedStore ? (
                    <button
                      type="button"
                      onClick={() => handleOpenStoreMenuPicker(m.id)}
                      className="mt-1 px-1.5 py-0.5 rounded text-[10px] border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 truncate max-w-full font-medium hover:bg-amber-100 cursor-pointer"
                    >
                      {m.selectedMenu ? m.selectedMenu.name : '+ 메뉴 선택'}
                    </button>
                  ) : isClaimedByMe ? (
                    <button
                      type="button"
                      onClick={() => setAvatarPickerMemberId(m.id)}
                      className="mt-1 px-1.5 py-0.5 rounded text-[10px] border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 truncate max-w-full font-medium hover:bg-indigo-100 cursor-pointer"
                      title="아바타 아이콘 변경"
                    >
                      아이콘 변경
                    </button>
                  ) : null}
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
          {isRoomJoined && !isRoomHost ? (
            <div className="flex-1 py-3 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>{isLadderTracing ? '🏁 초대자가 사다리를 시작하여 함께 달리는 중...' : '🎮 초대자가 게임을 시작하면 화면이 동시에 시작됩니다'}</span>
            </div>
          ) : isRoomClosed ? (
            /* 🔑 [항목 2-i: 방장이 게임 종료 후 화면에서 바로 새 게임으로 재시작할 수 있는 액션 제공] */
            <button
              type="button"
              onClick={handleRestartGame}
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-0"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span className="whitespace-nowrap">새 게임으로 다시 시작 (방 재활성화)</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handlePlayLadder(false, true)}
                disabled={isLadderTracing}
                className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap min-w-0"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span className="whitespace-nowrap">{isLadderTracing ? '사다리 타는 중...' : (isRoomJoined ? '전체 동시 사다리 타기' : '사다리 타기')}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayLadder(true, true)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${resolvedTheme === 'dawn'
                    ? 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200'
                    : isDark
                      ? 'bg-[#27272a] border-[#3f3f46] text-slate-200 hover:bg-[#323238]'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <FastForward className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{isRoomJoined ? '전체 즉시 결과' : '즉시 결과'}</span>
              </button>
            </>
          )}

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
            className={`w-full max-w-lg p-5 rounded-2xl border flex flex-col gap-4 animate-in zoom-in-95 ${resolvedTheme === 'dawn'
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
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${res?.isWinner
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
        isGuest={isGuest}
      />

      {/* 매장 메뉴 선택 모달 */}
      <StoreMenuSelectModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        selectedStore={selectedStore}
        onSelectStore={handleSelectStore}
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

      {/* 실시간 다자간 방 공유 및 크로스 디바이스 QR 코드 모달 */}
      <LadderShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId || ''}
        gameTitle="사다리 게임"
        shareUrl={currentShareUrl}
        connectedClients={connectedClients}
        isHost={isRoomHost}
        isClosed={isRoomClosed}
        onCopyUrl={handleCopyShareUrl}
        onCopyCode={handleCopyRoomCode}
        onLeaveRoom={handleLeaveRoom}
        onCloseRoom={handleCloseRoom}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 🔑 [게스트 아이콘 변경] 참가자 아바타 이모티콘 선택 모달 */}
      {avatarPickerMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 ${resolvedTheme === 'dawn'
                ? 'bg-white border-[#bfdbfe]'
                : isDark
                  ? 'bg-[#1e1e22] border-[#2e2e34]'
                  : 'bg-white border-slate-200'
              }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>참가자 아이콘(이모티콘) 선택</span>
              </h3>
              <button
                type="button"
                onClick={() => setAvatarPickerMemberId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              선택한 아이콘이 실시간으로 참가자들에게 공유됩니다.
            </p>
            <div className="grid grid-cols-6 gap-2 py-2">
              {PRESET_AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectAvatarForMember(avatarPickerMemberId, emoji)}
                  className="w-11 h-11 text-2xl rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔑 [항목 2-g: 방장이 게임을 종료했을 때 게스트 화면 인터랙션 알림 모달] */}
      {isGuestCloseNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center ${resolvedTheme === 'dawn'
                ? 'bg-white border-[#bfdbfe]'
                : isDark
                  ? 'bg-[#1e1e22] border-[#2e2e34]'
                  : 'bg-white border-slate-200'
              }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                방장이 게임을 종료하였습니다
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                방장이 공유 방을 마감하여 실시간 참여가 종료되었습니다.<br />
                최종 결과를 확인하거나 <strong>[참여종료 및 게임 계속하기]</strong>로 현재 참가자들과 함께 자유롭게 게임을 이어갈 수 있습니다.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 pt-2">
              {ladderResult && (
                <button
                  type="button"
                  onClick={() => {
                    setIsGuestCloseNoticeOpen(false);
                    setIsResultModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                >
                  최종 결과 팝업 보기
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsGuestCloseNoticeOpen(false);
                  handleLeaveRoom();
                }}
                className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer transition-all shadow-2xs"
              >
                참여종료 및 혼자 게임 계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
