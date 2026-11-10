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
  formatLadderResultText,
  formatStoreOrderText,
} from './ladderEngine';
import { LadderViewerSvg } from './LadderViewerSvg';
import {
  LadderGoalModal,
  LadderArrivalModal,
  StoreMenuSelectModal,
  LadderResultModal,
  LadderShareModal,
  getStoreMenuEmoji,
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
  const channelRef = useRef<LadderChannelHandle | null>(null);
  const isRoomJoined = !!roomId;
  const isGuest = isRoomJoined && !isRoomHost;
  const handlePlayLadderRef = useRef<(skipTrace?: boolean, broadcast?: boolean) => void>(() => {});

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
                members,
                ladderGoals,
                ladderSeed,
                winnerCount,
                useLadderWeight,
                ladderSpeed,
                selectedStore,
                ladderResult,
                timestamp: Date.now(),
              },
            });
          }
          break;

        case 'SYNC_STATE':
          if (!isRoomHost) {
            setMembers(msg.state.members);
            setLadderGoals(msg.state.ladderGoals);
            setLadderSeed(msg.state.ladderSeed);
            setWinnerCount(msg.state.winnerCount);
            setUseLadderWeight(msg.state.useLadderWeight);
            setLadderSpeed(msg.state.ladderSpeed);
            setSelectedStore(msg.state.selectedStore);
            if (msg.state.ladderResult) {
              setLadderResult(msg.state.ladderResult);
            }
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
          setMembers(msg.members);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToast('👥 참가자 순서가 동기화되었습니다.', 'info');
          break;

        case 'SHUFFLE_RUNGS':
          setLadderSeed(msg.seed);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToast('🎲 사다리 가로줄이 동기화되었습니다.', 'info');
          break;

        case 'SHUFFLE_GOALS':
          setLadderGoals(msg.goals);
          setLadderResult(null);
          setRevealedGoals({});
          setRevealedGoalCols({});
          setArrivalPopup(null);
          showToast('✨ 사다리 목표가 동기화되었습니다.', 'info');
          break;

        case 'PLAY_LADDER':
          if (msg.speed) {
            setLadderSpeed(msg.speed);
          }
          handlePlayLadderRef.current(msg.skipTrace, false);
          break;

        case 'RESET_GAME':
          setLadderResult(null);
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
          showToast('참여자가 게임에서 퇴장했습니다.', 'info');
          break;

        case 'CLOSE_ROOM':
        case 'ROOM_CLOSED':
          setIsRoomClosed(true);
          if (msg.finalResult) {
            setLadderResult(msg.finalResult);
            setIsResultModalOpen(true);
          }
          showToast('🔒 방장이 게임을 종료하였습니다. (신규 유입 차단 및 최종 결과 보관)', 'warning');
          break;

        case 'PRESENCE_CHANGE':
          setConnectedClients(msg.connectedClients);
          if (msg.members) {
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
        setMembers(snapshot.members);
        setLadderGoals(snapshot.ladderGoals);
        setLadderSeed(snapshot.ladderSeed);
        setWinnerCount(snapshot.winnerCount);
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
  }, [roomId, isRoomHost, currentTabId, members, ladderGoals, ladderSeed, winnerCount, useLadderWeight, ladderSpeed, selectedStore, ladderResult, setLadderGoals, setMembers, setSelectedStore, setWinnerCount, showToast]);

  // 서버로부터 방 정보 패치 (폐기/종료된 방 접속 시 최종 결과 복원)
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/v1/games/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.room) {
          if (data.room.isClosed) {
            setIsRoomClosed(true);
            if (data.room.finalResult) {
              setLadderResult(data.room.finalResult);
              setIsResultModalOpen(true);
            }
          } else if (data.room.data && !isRoomHost) {
            const snap = data.room.data;
            if (snap.members) setMembers(snap.members);
            if (snap.ladderGoals) setLadderGoals(snap.ladderGoals);
            if (snap.ladderSeed) setLadderSeed(snap.ladderSeed);
            if (snap.winnerCount) setWinnerCount(snap.winnerCount);
            if (snap.useLadderWeight !== undefined) setUseLadderWeight(snap.useLadderWeight);
            if (snap.ladderSpeed) setLadderSpeed(snap.ladderSpeed);
            if (snap.selectedStore !== undefined) setSelectedStore(snap.selectedStore);
            if (snap.ladderResult) setLadderResult(snap.ladderResult);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch ladder room from server', err);
      });
  }, [roomId, isRoomHost, setLadderGoals, setMembers, setSelectedStore, setWinnerCount]);

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
    const nextSeed = ladderSeed + 1;
    setLadderSeed(nextSeed);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    if (channelRef.current) {
      channelRef.current.send({ type: 'SHUFFLE_RUNGS', seed: nextSeed }, hostToken);
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
      channelRef.current.send({ type: 'SHUFFLE_GOALS', goals: shuffled }, hostToken);
    }
    showToast('🎯 목표 위치가 무작위로 재배치되었습니다!', 'info');
  };

  const handleShuffleMembers = () => {
    if (isLadderTracing || isGuest) return;
    const shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setMembers(shuffled);
    setLadderResult(null);
    setRevealedGoals({});
    setRevealedGoalCols({});
    setArrivalPopup(null);
    if (channelRef.current) {
      channelRef.current.send({ type: 'SHUFFLE_MEMBERS', members: shuffled }, hostToken);
    }
    showToast('👥 참가자 순서가 무작위로 재배치되었습니다!', 'info');
  };

  const handleSkipToResult = (overrideRungs?: LadderRung[]) => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setIsLadderTracing(false);
    setActiveTracingMemberIndex(null);
    setCurrentTracerPosition(null);
    setCurrentTracedTrail([]);
    setArrivalPopup(null);

    const rungsToUse = overrideRungs || ladderRungs;
    const { results } = computeLadderPaths(members, ladderGoals, rungsToUse);
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

  // 선제적 오토 가로 스크롤 엔진 (진행 방향 선제 시야 확보 & 실시간 스프링 댐핑 추적)
  const ensureTracerVisible = (ptX: number, nextPtX?: number, immediate = false) => {
    const el = ladderSliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const viewWidth = el.clientWidth;
    // 진행 방향 선제 시야 예측 (사다리 가로줄 이동 시 해당 방향으로 최대 140px 미리 뷰포트 확보)
    const lookAheadDir = nextPtX !== undefined ? Math.sign(nextPtX - ptX) : 0;
    const forwardMargin = lookAheadDir * Math.min(140, viewWidth * 0.25);

    // 트레이서와 진행 방향을 뷰포트 중심 구역에 선제 배치
    const desiredCenter = ptX + forwardMargin;
    const targetScroll = Math.max(0, Math.min(maxScroll, desiredCenter - viewWidth / 2));

    if (immediate) {
      el.scrollLeft = targetScroll;
      return;
    }

    const currentScroll = el.scrollLeft;
    const diff = targetScroll - currentScroll;

    if (Math.abs(diff) > 2) {
      // 브라우저 smooth의 지연/취소 현상을 방지하고 매 틱마다 즉각 40%씩 부드럽게 전진 수렴
      el.scrollLeft = currentScroll + diff * 0.4;
    }
  };

  const handlePlayLadder = (skipTrace = false, broadcast = true) => {
    if (skipTrace) {
      // 🔑 [요구사항 8: 전체 즉시결과 실행 시 순간 사다리 가로줄 섞기(초기화) 후 게임 진행]
      const nextSeed = ladderSeed + 1;
      setLadderSeed(nextSeed);
      if (channelRef.current) {
        channelRef.current.send({ type: 'SHUFFLE_RUNGS', seed: nextSeed }, hostToken);
      }
      const freshRungs = generateLadderRungs(members.length, nextSeed);

      if (broadcast && channelRef.current) {
        channelRef.current.send(
          {
            type: 'PLAY_LADDER',
            skipTrace: true,
            speed: ladderSpeed,
          },
          hostToken
        );
      }

      handleSkipToResult(freshRungs);
      return;
    }

    if (broadcast && channelRef.current) {
      channelRef.current.send(
        {
          type: 'PLAY_LADDER',
          skipTrace,
          speed: ladderSpeed,
        },
        hostToken
      );
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

      const memberPoints = paths[currentMember.id] || [];
      const startPt = memberPoints[0] || null;
      // 이전 마커와 선을 완전히 끊고 새 주자의 최상단 시작점에서 정밀 출발
      setCurrentTracerPosition(startPt);
      setCurrentTracedTrail(startPt ? [startPt] : []);
      if (startPt) {
        // 주자 출발 시 해당 기둥으로 선제 즉각 포커싱
        ensureTracerVisible(startPt.x, undefined, true);
      }
      const trailHistory: { x: number; y: number }[] = startPt ? [startPt] : [];
      let stepIdx = 1;

      const speedInterval =
        LADDER_SPEED_OPTIONS.find((s) => s.value === ladderSpeed)?.interval || 20;

      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = setInterval(() => {
        if (stepIdx < memberPoints.length) {
          const pt = memberPoints[stepIdx];
          const nextPt = stepIdx + 3 < memberPoints.length ? memberPoints[stepIdx + 3] : memberPoints[stepIdx + 1];
          setCurrentTracerPosition(pt);
          trailHistory.push(pt);
          setCurrentTracedTrail([...trailHistory]);
          // 트레이서 이동 경로 및 진행 방향에 맞추어 선제적 시야 확보
          ensureTracerVisible(pt.x, nextPt?.x);
          stepIdx++;
        } else {
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }

          // 골인 지점에 안착
          const finalPt = memberPoints[memberPoints.length - 1] || null;
          setCurrentTracerPosition(finalPt);
          if (finalPt) {
            ensureTracerVisible(finalPt.x);
          }

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
  handlePlayLadderRef.current = handlePlayLadder;

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

      const memberPoints = paths[nextMember.id] || [];
      const startPt = memberPoints[0] || null;
      // 다음 주자의 사다리 최상단 시작점에서 정밀 출발 및 선제 포커싱
      setCurrentTracerPosition(startPt);
      setCurrentTracedTrail(startPt ? [startPt] : []);
      if (startPt) {
        ensureTracerVisible(startPt.x, undefined, true);
      }
      const trailHistory: { x: number; y: number }[] = startPt ? [startPt] : [];
      let stepIdx = 1;

      const speedInterval =
        LADDER_SPEED_OPTIONS.find((s) => s.value === ladderSpeed)?.interval || 20;

      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = setInterval(() => {
        if (stepIdx < memberPoints.length) {
          const pt = memberPoints[stepIdx];
          const nextPt = stepIdx + 3 < memberPoints.length ? memberPoints[stepIdx + 3] : memberPoints[stepIdx + 1];
          setCurrentTracerPosition(pt);
          trailHistory.push(pt);
          setCurrentTracedTrail([...trailHistory]);
          // 트레이서 이동 경로 및 진행 방향에 맞추어 선제적 시야 확보
          ensureTracerVisible(pt.x, nextPt?.x);
          stepIdx++;
        } else {
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
          }

          // 골인 지점에 안착
          const finalPt = memberPoints[memberPoints.length - 1] || null;
          setCurrentTracerPosition(finalPt);
          if (finalPt) {
            ensureTracerVisible(finalPt.x);
          }

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
    if (isGuest) {
      showToast('방장만 사다리 목표를 직접 편집할 수 있습니다.', 'warning');
      return;
    }
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
    if (isLadderTracing) {
      showToast('사다리가 진행 중인 동안에는 메뉴를 변경할 수 없습니다.', 'warning');
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
    if (isLadderTracing) {
      showToast('사다리가 진행 중인 동안에는 아이콘을 변경할 수 없습니다.', 'warning');
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
    if (isLadderTracing) {
      showToast('사다리가 진행 중인 동안에는 이름을 변경할 수 없습니다.', 'warning');
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
    if (isLadderTracing) {
      showToast('사다리가 진행 중인 동안에는 자리를 변경할 수 없습니다.', 'warning');
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
    }

    setIsShareModalOpen(true);
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
    setIsRoomClosed(true);

    // 당일 이력 저장
    const winners = Object.entries(ladderResult || {}).filter(([, r]) => r.isWinner);
    const winnerSummary = winners.length > 0
      ? winners.map(([mid, r]) => {
          const m = members.find((item) => item.id === mid);
          return `${m?.name || '참가자'}(${r.text})`;
        }).join(', ')
      : `${members.length}명 참여 완료`;

    saveSharedGameHistory({
      id: `hist_${roomId}_${Date.now()}`,
      roomId,
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
        ladderResult,
      },
    });

    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'CLOSE_ROOM',
          finalResult: ladderResult,
        },
        hostToken
      );
    }

    showToast('🔒 게임이 종료되었습니다. 초대 링크가 폐기되었으며 당일 이력에 보관되었습니다.', 'info');
  };

  // 참가게임 이탈 핸들러
  const handleLeaveRoom = () => {
    if (roomId) {
      try {
        window.sessionStorage.removeItem(`moabogo_host_token_${roomId}`);
      } catch (e) {
        // ignore
      }
    }
    if (roomId && channelRef.current) {
      channelRef.current.send({ type: 'LEAVE_ROOM', tabId: currentTabId });
      channelRef.current.close();
      channelRef.current = null;
    }
    setRoomId(null);
    setHostToken(null);
    setIsRoomHost(false);
    setIsRoomClosed(false);
    setConnectedClients(1);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('host');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    showToast('공유 게임에서 이탈하여 로컬 플레이존으로 복귀했습니다.');
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
          disabled={isGuest}
          onClick={() => {
            if (isGuest) return;
            setStoreModalMemberId(members[0]?.id || '');
            setStoreModalMode('STORE_ONLY');
            setIsStoreModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all ${
            isGuest
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
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>당첨 인원수</span>
              {isGuest && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 방장 제어
                </span>
              )}
            </span>
            <button
              type="button"
              disabled={isGuest}
              onClick={() => {
                if (isGuest) return;
                setUseLadderWeight((prev) => !prev);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
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
            disabled={isGuest || isLadderTracing}
            onChange={(val) => {
              if (isGuest) return;
              setWinnerCount(val);
            }}
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
                disabled={isGuest}
                onClick={() => {
                  if (isGuest) return;
                  setLadderSpeed(opt.value);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                  isGuest ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  ladderSpeed === opt.value
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
              disabled={isLadderTracing || isGuest}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${
                isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={isGuest ? '방장만 참가자를 섞을 수 있습니다' : '참가자 순서 섞기'}
            >
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>참가자 섞기</span>
            </button>

            <button
              type="button"
              onClick={handleReshuffleRungs}
              disabled={isLadderTracing}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${
                isLadderTracing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all ${
                isLadderTracing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
        className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-5 ${
          resolvedTheme === 'dawn'
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

            <button
              type="button"
              onClick={handleShareRoom}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                roomId
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400/30'
                  : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}
              title="실시간 다자간 방 공유 및 QR 코드 열기"
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
                  {/* 2. 아이콘 상단 참가자 이름 직접 수정 입력필드 */}
                  <div className="w-full mb-1">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={isLadderTracing}
                      maxLength={10}
                      className="w-full h-7 px-1 text-[11px] font-bold text-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs truncate select-text disabled:opacity-60"
                      placeholder="이름"
                      title="참가자 이름 수정 (클릭 시 전체선택)"
                    />
                  </div>

                  {/* 3. 자리 찜하기 및 아바타 아이콘 영역 (높이 동일하게 고정하여 단차 0%) */}
                  <button
                    type="button"
                    onClick={() => handleToggleClaimSeat(m.id)}
                    className={`relative w-full p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isClaimedByMe
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
          ) : (
            <>
              <button
                type="button"
                onClick={() => handlePlayLadder(false, true)}
                disabled={isLadderTracing || isRoomClosed}
                className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap min-w-0"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span className="whitespace-nowrap">{isRoomClosed ? '게임 마감됨' : (isLadderTracing ? '사다리 타는 중...' : (isRoomJoined ? '전체 동시 사다리 타기' : '사다리 타기'))}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayLadder(true, true)}
                disabled={isRoomClosed}
                className={`py-3 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  resolvedTheme === 'dawn'
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
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 ${
              resolvedTheme === 'dawn'
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
    </div>
  );
};
