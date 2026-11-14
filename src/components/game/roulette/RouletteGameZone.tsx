import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Play,
  RotateCcw,
  Copy,
  Camera,
  Download,
  HelpCircle,
  Plus,
  Minus,
  Trophy,
  Share2,
  Lock,
  Dices,
} from 'lucide-react';
import { ElmRng01, ElmSld03 } from '../../../sample/elements/Tokens';
import { Participant, RouletteSliceItem, saveSharedGameHistory } from '../types';
import { DEFAULT_FIVE_ITEMS_PRESET } from './types';
import {
  calculateRouletteSlices,
  pickRandomRouletteItem,
  calculateTargetRotation,
  formatRouletteResultText,
} from './rouletteEngine';
import { RouletteWheelSvg } from './RouletteWheelSvg';
import {
  RouletteHelpModal,
  RouletteItemSettingModal,
  RouletteIconPickerModal,
  RouletteResultModal,
} from './RouletteModals';
import { LadderShareModal } from '../ladder/LadderModals';
import {
  createRouletteSyncChannel,
  RouletteChannelHandle,
  RouletteSyncMessage,
  RouletteSyncState,
  saveRouletteRoomSnapshot,
  loadRouletteRoomSnapshot,
} from './rouletteSyncChannel';
import { generateGameRoomId, buildRoomShareUrl } from '../ladder/ladderSyncChannel';
import {
  ROULETTE_PRESETS,
  RoulettePreset,
  RoulettePresetItem,
} from '../../../sample/data/systemStorePool';
import {
  generateRouletteResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
} from '../../../sample/utils/gameResultCardCanvas';

export interface RouletteGameZoneProps {
  members: Participant[];
  roulettePresetTitle: string;
  setRoulettePresetTitle: (title: string) => void;
  rouletteItems: RouletteSliceItem[];
  setRouletteItems: React.Dispatch<React.SetStateAction<RouletteSliceItem[]>>;
  selectedRouletteWinner: RouletteSliceItem | null;
  setSelectedRouletteWinner: (w: RouletteSliceItem | null) => void;
  useRouletteWeight: boolean;
  setUseRouletteWeight: React.Dispatch<React.SetStateAction<boolean>>;
  excludeWinnerMode: boolean;
  setExcludeWinnerMode: React.Dispatch<React.SetStateAction<boolean>>;
  excludedWinners: Participant[];
  setExcludedWinners: React.Dispatch<React.SetStateAction<Participant[]>>;
  excludedRouletteItems: RouletteSliceItem[];
  setExcludedRouletteItems: React.Dispatch<React.SetStateAction<RouletteSliceItem[]>>;
  currentTabId?: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  resolvedTheme: string;
  isDark: boolean;
  onRegisterShareHandler?: (handler: () => void) => void;
  onRegisterLeaveHandler?: (handler: () => void) => void;
  onRoomModeChange?: (inRoom: boolean, isHost: boolean) => void;
}

export const RouletteGameZone: React.FC<RouletteGameZoneProps> = ({
  members,
  roulettePresetTitle,
  setRoulettePresetTitle,
  rouletteItems,
  setRouletteItems,
  selectedRouletteWinner,
  setSelectedRouletteWinner,
  useRouletteWeight,
  setUseRouletteWeight,
  excludeWinnerMode,
  setExcludeWinnerMode,
  excludedRouletteItems,
  setExcludedRouletteItems,
  currentTabId = 'tab_roulette',
  showToast,
  resolvedTheme,
  isDark,
  onRegisterShareHandler,
  onRegisterLeaveHandler,
  onRoomModeChange,
}) => {
  const [rouletteRotation, setRouletteRotation] = useState<number>(0);
  const [rouletteTransitionDuration, setRouletteTransitionDuration] = useState<number>(3500);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  // 실시간 공유 방 상태
  const [roomId, setRoomId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      return r && r.startsWith('ROU') ? r : null;
    }
    return null;
  });
  // 🔑 [보안] URL query parameter host=1 제거 -> sessionStorage의 hostToken 존재 및 일치 여부로 방장 권한 판정
  const [hostToken, setHostToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      if (r) {
        return window.sessionStorage.getItem(`moabogo_host_token_${r}`);
      }
    }
    return null;
  });
  const [isRoomHost, setIsRoomHost] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      if (r) {
        return !!window.sessionStorage.getItem(`moabogo_host_token_${r}`);
      }
    }
    return false;
  });
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isRoomClosed, setIsRoomClosed] = useState<boolean>(false);
  const [isGuestCloseNoticeOpen, setIsGuestCloseNoticeOpen] = useState<boolean>(false);
  const channelRef = useRef<RouletteChannelHandle | null>(null);
  const isGuest = !!roomId && !isRoomHost;
  const handleSpinRouletteRef = useRef<
    (skip?: boolean, overrideChosen?: RouletteSliceItem, broadcast?: boolean, overrideDuration?: number) => void
  >(() => {});

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState<boolean>(false);
  const [iconPickerTargetId, setIconPickerTargetId] = useState<string | null>(null);

  // New item form in modal
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemIcon, setNewItemIcon] = useState<string>('🎯');

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const guestSpinFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpinChosenRef = useRef<RouletteSliceItem | null>(null);

  // 🔑 [안정화] SSE useEffect 의존성 격리 및 비동기 클로저 스테일 방지를 위한 Refs
  const roulettePresetTitleRef = useRef<string>(roulettePresetTitle);
  const rouletteItemsRef = useRef<RouletteSliceItem[]>(rouletteItems);
  const selectedRouletteWinnerRef = useRef<RouletteSliceItem | null>(selectedRouletteWinner);
  const useRouletteWeightRef = useRef<boolean>(useRouletteWeight);
  const excludeWinnerModeRef = useRef<boolean>(excludeWinnerMode);
  const excludedRouletteItemsRef = useRef<RouletteSliceItem[]>(excludedRouletteItems);
  const rouletteRotationRef = useRef<number>(rouletteRotation);
  const isSpinningRef = useRef<boolean>(isSpinning);
  const hostTokenRef = useRef<string | null>(hostToken);
  const isRoomClosedRef = useRef<boolean>(isRoomClosed);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    roulettePresetTitleRef.current = roulettePresetTitle;
  }, [roulettePresetTitle]);

  useEffect(() => {
    rouletteItemsRef.current = rouletteItems;
  }, [rouletteItems]);

  useEffect(() => {
    selectedRouletteWinnerRef.current = selectedRouletteWinner;
  }, [selectedRouletteWinner]);

  useEffect(() => {
    useRouletteWeightRef.current = useRouletteWeight;
  }, [useRouletteWeight]);

  useEffect(() => {
    excludeWinnerModeRef.current = excludeWinnerMode;
  }, [excludeWinnerMode]);

  useEffect(() => {
    excludedRouletteItemsRef.current = excludedRouletteItems;
  }, [excludedRouletteItems]);

  useEffect(() => {
    rouletteRotationRef.current = rouletteRotation;
  }, [rouletteRotation]);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    hostTokenRef.current = hostToken;
  }, [hostToken]);

  useEffect(() => {
    isRoomClosedRef.current = isRoomClosed;
  }, [isRoomClosed]);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const getHostToken = useCallback(
    (targetId?: string | null): string | null => {
      if (hostTokenRef.current) return hostTokenRef.current;
      const rid = targetId || roomId;
      if (rid && typeof window !== 'undefined') {
        try {
          const stored = window.sessionStorage.getItem(`moabogo_host_token_${rid}`);
          if (stored) {
            hostTokenRef.current = stored;
            return stored;
          }
        } catch (e) {
          // ignore
        }
      }
      return null;
    },
    [roomId]
  );

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    if (guestSpinFallbackTimerRef.current) {
      clearTimeout(guestSpinFallbackTimerRef.current);
      guestSpinFallbackTimerRef.current = null;
    }
  }, []);

  // 실시간 룰렛 채널 리스너 (roomId, isRoomHost, currentTabId, clearSpinTimer에만 의존 -> SSE 무한 재연결 원천 차단)
  useEffect(() => {
    if (!roomId) {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      return;
    }

    const channel = createRouletteSyncChannel(roomId, currentTabId, (msg: RouletteSyncMessage) => {
      switch (msg.type) {
        case 'ROULETTE_SYNC_REQUEST':
          if (isRoomHost) {
            channel.send({
              type: 'ROULETTE_SYNC_STATE',
              state: {
                roomId,
                hostTabId: currentTabId,
                roulettePresetTitle: roulettePresetTitleRef.current,
                rouletteItems: rouletteItemsRef.current,
                selectedWinner: selectedRouletteWinnerRef.current,
                useRouletteWeight: useRouletteWeightRef.current,
                excludeWinnerMode: excludeWinnerModeRef.current,
                timestamp: Date.now(),
              },
            });
          }
          break;

        case 'ROULETTE_SYNC_STATE':
          if (!isRoomHost) {
            setRoulettePresetTitle(msg.state.roulettePresetTitle);
            roulettePresetTitleRef.current = msg.state.roulettePresetTitle;
            setRouletteItems(msg.state.rouletteItems);
            rouletteItemsRef.current = msg.state.rouletteItems;
            setSelectedRouletteWinner(msg.state.selectedWinner);
            selectedRouletteWinnerRef.current = msg.state.selectedWinner;
            setUseRouletteWeight(msg.state.useRouletteWeight);
            useRouletteWeightRef.current = msg.state.useRouletteWeight;
            setExcludeWinnerMode(msg.state.excludeWinnerMode);
            excludeWinnerModeRef.current = msg.state.excludeWinnerMode;
          }
          break;

        case 'SPIN_ROULETTE':
          if (!isRoomHost) {
            handleSpinRouletteRef.current(false, msg.chosenItem, false, msg.duration);
          }
          break;

        case 'ROULETTE_SPIN_COMPLETE':
          if (!isRoomHost) {
            clearSpinTimer();
            isSpinningRef.current = false;
            setIsSpinning(false);
            setSelectedRouletteWinner(msg.winner);
            selectedRouletteWinnerRef.current = msg.winner;
            if (msg.items) {
              setRouletteItems(msg.items);
              rouletteItemsRef.current = msg.items;
            }
            if (msg.excludedItems) {
              setExcludedRouletteItems(msg.excludedItems);
              excludedRouletteItemsRef.current = msg.excludedItems;
            }
            setIsResultModalOpen(true);
          }
          break;

        case 'SYNC_ROULETTE_ITEMS':
        case 'SHUFFLE_ROULETTE_ITEMS':
          setRouletteItems(msg.items);
          rouletteItemsRef.current = msg.items;
          if (msg.type === 'SYNC_ROULETTE_ITEMS' && msg.presetTitle) {
            setRoulettePresetTitle(msg.presetTitle);
            roulettePresetTitleRef.current = msg.presetTitle;
          }
          setSelectedRouletteWinner(null);
          selectedRouletteWinnerRef.current = null;
          if (msg.type === 'SHUFFLE_ROULETTE_ITEMS') {
            showToastRef.current('🎲 룰렛 항목 순서가 동기화되었습니다.', 'info');
          }
          break;

        case 'SYNC_ROULETTE_RESULT':
          setSelectedRouletteWinner(msg.winner);
          selectedRouletteWinnerRef.current = msg.winner;
          break;

        case 'RESET_ROULETTE':
          clearSpinTimer();
          isSpinningRef.current = false;
          setIsSpinning(false);
          isRoomClosedRef.current = false;
          setIsRoomClosed(false);
          setIsGuestCloseNoticeOpen(false);
          setSelectedRouletteWinner(null);
          selectedRouletteWinnerRef.current = null;
          setIsResultModalOpen(false);
          break;

        case 'CLOSE_ROOM':
        case 'ROOM_CLOSED':
          if (isRoomClosedRef.current) break;
          clearSpinTimer();
          isSpinningRef.current = false;
          setIsSpinning(false);
          isRoomClosedRef.current = true;
          setIsRoomClosed(true);
          if (msg.finalResult) {
            setSelectedRouletteWinner(msg.finalResult);
            selectedRouletteWinnerRef.current = msg.finalResult;
          }
          if (!isRoomHost) {
            setIsGuestCloseNoticeOpen(true);
          }
          showToastRef.current('🔒 방장이 게임을 종료하였습니다. 개인 플레이 모드로 전환할 수 있습니다.', 'warning');
          break;

        case 'PRESENCE_CHANGE':
          setConnectedClients(msg.connectedClients);
          break;
      }
    });

    channelRef.current = channel;

    if (!isRoomHost) {
      const snapshot = loadRouletteRoomSnapshot(roomId);
      if (snapshot) {
        setRoulettePresetTitle(snapshot.roulettePresetTitle);
        roulettePresetTitleRef.current = snapshot.roulettePresetTitle;
        setRouletteItems(snapshot.rouletteItems);
        rouletteItemsRef.current = snapshot.rouletteItems;
        setSelectedRouletteWinner(snapshot.selectedWinner);
        selectedRouletteWinnerRef.current = snapshot.selectedWinner;
        setUseRouletteWeight(snapshot.useRouletteWeight);
        useRouletteWeightRef.current = snapshot.useRouletteWeight;
        setExcludeWinnerMode(snapshot.excludeWinnerMode);
        excludeWinnerModeRef.current = snapshot.excludeWinnerMode;
      }
      channel.send({ type: 'ROULETTE_SYNC_REQUEST', senderTabId: currentTabId });
    }

    return () => {
      clearSpinTimer();
      channel.close();
      channelRef.current = null;
    };
  }, [roomId, isRoomHost, currentTabId, clearSpinTimer, setExcludeWinnerMode, setExcludedRouletteItems, setRouletteItems, setRoulettePresetTitle, setSelectedRouletteWinner, setUseRouletteWeight]);

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
              setSelectedRouletteWinner(roomInfo.finalResult);
              selectedRouletteWinnerRef.current = roomInfo.finalResult;
            }
          } else if (roomInfo.data && !isRoomHost) {
            const snap = roomInfo.data;
            if (snap.roulettePresetTitle) {
              setRoulettePresetTitle(snap.roulettePresetTitle);
              roulettePresetTitleRef.current = snap.roulettePresetTitle;
            }
            if (snap.rouletteItems) {
              setRouletteItems(snap.rouletteItems);
              rouletteItemsRef.current = snap.rouletteItems;
            }
            if (snap.selectedWinner !== undefined) {
              setSelectedRouletteWinner(snap.selectedWinner);
              selectedRouletteWinnerRef.current = snap.selectedWinner;
            }
            if (snap.useRouletteWeight !== undefined) {
              setUseRouletteWeight(snap.useRouletteWeight);
              useRouletteWeightRef.current = snap.useRouletteWeight;
            }
            if (snap.excludeWinnerMode !== undefined) {
              setExcludeWinnerMode(snap.excludeWinnerMode);
              excludeWinnerModeRef.current = snap.excludeWinnerMode;
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch roulette room from server', err);
      });
  }, [roomId, isRoomHost, setExcludeWinnerMode, setRouletteItems, setRoulettePresetTitle, setSelectedRouletteWinner, setUseRouletteWeight]);

  // 상위 SCR_GNT_01에 방 참여/방장 상태 동기화 (개인 모드 전환 시 상단 슬라이더/공유 잠금 즉시 해제)
  useEffect(() => {
    onRoomModeChange?.(!!roomId, isRoomHost);
  }, [roomId, isRoomHost, onRoomModeChange]);

  const totalRouletteWeight = useMemo(() => {
    return rouletteItems.reduce((acc, it) => acc + Math.max(1, it.weight || 1), 0);
  }, [rouletteItems]);

  const rouletteSlices = useMemo(() => {
    return calculateRouletteSlices(rouletteItems, totalRouletteWeight);
  }, [rouletteItems, totalRouletteWeight]);

  const totalRouletteWeightRef = useRef<number>(totalRouletteWeight);
  const rouletteSlicesRef = useRef(rouletteSlices);

  useEffect(() => {
    totalRouletteWeightRef.current = totalRouletteWeight;
  }, [totalRouletteWeight]);

  useEffect(() => {
    rouletteSlicesRef.current = rouletteSlices;
  }, [rouletteSlices]);

  const handleUpdateRouletteItemCount = (count: number) => {
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRouletteItems((prev) => {
      const diff = count - prev.length;
      if (diff === 0) return prev;
      if (diff > 0) {
        const added = Array.from({ length: diff }, (_, i) => {
          const idx = prev.length + i + 1;
          return {
            id: `item_${Date.now()}_${idx}`,
            name: `항목${idx}`,
            avatar: '🎯',
            weight: 1,
          };
        });
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const handleUpdateItemName = (id: string, name: string) => {
    setRouletteItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, name } : it))
    );
  };

  const handleUpdateItemWeight = (id: string, delta: number) => {
    setRouletteItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const current = it.weight || 1;
        const next = Math.max(1, Math.min(10, current + delta));
        return { ...it, weight: next };
      })
    );
  };

  const handleSpinRoulette = (
    skip = false,
    overrideChosen?: RouletteSliceItem,
    broadcast = false,
    overrideDuration?: number
  ) => {
    const itemsToUse = rouletteItemsRef.current;
    if (itemsToUse.length === 0) return;

    const totalWeightToUse = itemsToUse.reduce((acc, it) => acc + Math.max(1, it.weight || 1), 0);
    const slicesToUse = calculateRouletteSlices(itemsToUse, totalWeightToUse);
    const currentRotation = rouletteRotationRef.current;
    const excludeMode = excludeWinnerModeRef.current;
    const hostTokenToUse = getHostToken();

    if (isSpinningRef.current && skip) {
      clearSpinTimer();
      const chosen = currentSpinChosenRef.current || overrideChosen || itemsToUse[0];
      const { nextRotation, duration } = calculateTargetRotation(chosen, slicesToUse, currentRotation, true);
      setRouletteTransitionDuration(duration);
      setRouletteRotation(nextRotation);
      rouletteRotationRef.current = nextRotation;
      isSpinningRef.current = false;
      setIsSpinning(false);
      setSelectedRouletteWinner(chosen);
      selectedRouletteWinnerRef.current = chosen;
      setIsResultModalOpen(true);

      let nextItems: RouletteSliceItem[] | undefined;
      let nextExcluded: RouletteSliceItem[] | undefined;
      if (excludeMode && itemsToUse.length > 2) {
        nextExcluded = [...excludedRouletteItemsRef.current, chosen];
        nextItems = itemsToUse.filter((it) => it.id !== chosen.id);
        setExcludedRouletteItems(nextExcluded);
        excludedRouletteItemsRef.current = nextExcluded;
        setRouletteItems(nextItems);
        rouletteItemsRef.current = nextItems;
      }

      if (isRoomHost && channelRef.current) {
        channelRef.current.send(
          {
            type: 'ROULETTE_SPIN_COMPLETE',
            winner: chosen,
            items: nextItems,
            excludedItems: nextExcluded,
          },
          hostTokenToUse
        );
      }
      return;
    }

    // 🔑 [호스트 주도 중계] 게스트는 SPIN_ROULETTE 수신 시 즉시 재시작 가능, 로컬 버튼 중복 클릭 방지
    if (isSpinningRef.current && broadcast) return;

    clearSpinTimer();

    setSelectedRouletteWinner(null);
    selectedRouletteWinnerRef.current = null;
    setIsResultModalOpen(false);
    const chosen = overrideChosen || pickRandomRouletteItem(itemsToUse, totalWeightToUse);
    currentSpinChosenRef.current = chosen;

    const { nextRotation, duration } = calculateTargetRotation(chosen, slicesToUse, currentRotation, skip);
    const effectiveDuration = overrideDuration ?? duration;
    isSpinningRef.current = true;
    setIsSpinning(true);
    setRouletteTransitionDuration(effectiveDuration);
    setRouletteRotation(nextRotation);
    rouletteRotationRef.current = nextRotation;

    if (broadcast && isRoomHost && channelRef.current) {
      channelRef.current.send(
        {
          type: 'SPIN_ROULETTE',
          targetAngle: nextRotation,
          chosenItem: chosen,
          duration: effectiveDuration,
        },
        hostTokenToUse
      );
    }

    if (!isRoomHost && roomId) {
      // 게스트는 방장의 ROULETTE_SPIN_COMPLETE를 기다리되 네트워크 지연 대비 폴백 타이머 유지
      guestSpinFallbackTimerRef.current = setTimeout(() => {
        guestSpinFallbackTimerRef.current = null;
        if (!isSpinningRef.current) return;
        isSpinningRef.current = false;
        setIsSpinning(false);
        setSelectedRouletteWinner(chosen);
        selectedRouletteWinnerRef.current = chosen;
        setIsResultModalOpen(true);
      }, effectiveDuration + 1200);
      return;
    }

    spinTimerRef.current = setTimeout(() => {
      spinTimerRef.current = null;
      isSpinningRef.current = false;
      setIsSpinning(false);
      setSelectedRouletteWinner(chosen);
      selectedRouletteWinnerRef.current = chosen;
      setIsResultModalOpen(true);

      let nextItems: RouletteSliceItem[] | undefined;
      let nextExcluded: RouletteSliceItem[] | undefined;
      if (excludeMode && itemsToUse.length > 2) {
        nextExcluded = [...excludedRouletteItemsRef.current, chosen];
        nextItems = itemsToUse.filter((it) => it.id !== chosen.id);
        setExcludedRouletteItems(nextExcluded);
        excludedRouletteItemsRef.current = nextExcluded;
        setRouletteItems(nextItems);
        rouletteItemsRef.current = nextItems;
      }

      if (broadcast && isRoomHost && channelRef.current) {
        channelRef.current.send(
          {
            type: 'ROULETTE_SPIN_COMPLETE',
            winner: chosen,
            items: nextItems,
            excludedItems: nextExcluded,
          },
          getHostToken()
        );
      }
    }, effectiveDuration);
  };
  handleSpinRouletteRef.current = handleSpinRoulette;

  // 실시간 룰렛 방 생성 및 공유 핸들러
  const handleShareRoom = useCallback(() => {
    let targetRoomId = roomId;
    if (!targetRoomId) {
      targetRoomId = generateGameRoomId('ROULETTE');
      setRoomId(targetRoomId);
      setIsRoomHost(true);

      // 🔑 [보안] URL에 host=1 파라미터를 추가하지 않고 깔끔하게 room만 유지
      const url = new URL(window.location.href);
      url.searchParams.set('game', 'roulette');
      url.searchParams.set('room', targetRoomId);
      url.searchParams.delete('host');
      window.history.replaceState({}, '', url.toString());

      const stateSnapshot: RouletteSyncState = {
        roomId: targetRoomId,
        hostTabId: currentTabId,
        roulettePresetTitle: roulettePresetTitleRef.current,
        rouletteItems: rouletteItemsRef.current,
        selectedWinner: selectedRouletteWinnerRef.current,
        useRouletteWeight: useRouletteWeightRef.current,
        excludeWinnerMode: excludeWinnerModeRef.current,
        timestamp: Date.now(),
      };

      saveRouletteRoomSnapshot(targetRoomId, stateSnapshot);

      fetch('/api/v1/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: targetRoomId,
          gameType: 'ROULETTE',
          hostTabId: currentTabId,
          hostName: '호스트',
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
          console.warn('Failed to register roulette room to server', e);
        });
    } else {
      const existingToken = getHostToken(targetRoomId);
      fetch('/api/v1/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: targetRoomId,
          gameType: 'ROULETTE',
          hostTabId: currentTabId,
          hostToken: existingToken || undefined,
          hostName: '호스트',
          data: {
            roomId: targetRoomId,
            hostTabId: currentTabId,
            roulettePresetTitle: roulettePresetTitleRef.current,
            rouletteItems: rouletteItemsRef.current,
            selectedWinner: selectedRouletteWinnerRef.current,
            useRouletteWeight: useRouletteWeightRef.current,
            excludeWinnerMode: excludeWinnerModeRef.current,
            timestamp: Date.now(),
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
          console.warn('Failed to re-register roulette room to server', e);
        });
    }

    isRoomClosedRef.current = false;
    setIsRoomClosed(false);
    setIsShareModalOpen(true);
  }, [currentTabId, getHostToken, roomId]);

  useEffect(() => {
    onRegisterShareHandler?.(handleShareRoom);
  }, [handleShareRoom, onRegisterShareHandler]);

  const currentShareUrl = useMemo(() => {
    if (!roomId) return '';
    return buildRoomShareUrl(roomId, 'roulette');
  }, [roomId]);

  const handleCopyShareUrl = () => {
    if (!currentShareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentShareUrl).then(() => {
        showToast('🔗 룰렛 실시간 방 초대 링크가 복사되었습니다!');
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

  const handleCloseRoom = () => {
    if (!roomId) return;
    const targetRoomId = roomId;
    const hostTokenToUse = getHostToken(targetRoomId);
    const winnerToUse = selectedRouletteWinnerRef.current || selectedRouletteWinner;

    clearSpinTimer();
    isSpinningRef.current = false;
    setIsSpinning(false);
    setIsShareModalOpen(false);
    isRoomClosedRef.current = true;
    setIsRoomClosed(true);

    const winnerSummary = winnerToUse
      ? `${winnerToUse.avatar} ${winnerToUse.name} 당첨`
      : '룰렛 종료';

    saveSharedGameHistory({
      id: `hist_${targetRoomId}_${Date.now()}`,
      roomId: targetRoomId,
      gameType: 'ROULETTE',
      title: roulettePresetTitleRef.current,
      dateStr: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      participantsCount: rouletteItemsRef.current.length,
      winnerSummary,
      closedAt: Date.now(),
      data: {
        roulettePresetTitle: roulettePresetTitleRef.current,
        rouletteItems: rouletteItemsRef.current,
        selectedWinner: winnerToUse,
      },
    });

    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'CLOSE_ROOM',
          finalResult: winnerToUse,
        },
        hostTokenToUse
      );
      channelRef.current.close();
      channelRef.current = null;
    }

    try {
      window.sessionStorage.removeItem(`moabogo_host_token_${targetRoomId}`);
    } catch (e) {
      // ignore
    }
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

    showToastRef.current('🔒 룰렛 게임이 종료되었습니다. 초대 링크가 폐기되었으며 개인 게임 모드로 전환되었습니다.', 'info');
  };

  const handleLeaveRoom = useCallback(() => {
    clearSpinTimer();
    isSpinningRef.current = false;
    setIsSpinning(false);
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
  }, [clearSpinTimer, currentTabId, onRoomModeChange, roomId]);

  useEffect(() => {
    onRegisterLeaveHandler?.(handleLeaveRoom);
  }, [handleLeaveRoom, onRegisterLeaveHandler]);

  const handleApplyMembersToRoulette = () => {
    if (members.length < 2) {
      showToast('참여 멤버가 2명 이상이어야 합니다.', 'warning');
      return;
    }
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRoulettePresetTitle('👥 참여 멤버 룰렛');
    const mapped = members.map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      weight: Math.max(1, m.weight || 1),
    }));
    setRouletteItems(mapped);
    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'SYNC_ROULETTE_ITEMS',
          items: mapped,
          presetTitle: '👥 참여 멤버 룰렛',
        },
        getHostToken()
      );
    }
    showToast(`참여 멤버 ${members.length}명이 룰렛 항목에 반영되었습니다.`);
  };

  const handleShuffleRouletteItems = () => {
    if (isSpinning) return;
    const shuffled = [...rouletteItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRouletteItems(shuffled);
    setSelectedRouletteWinner(null);
    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'SHUFFLE_ROULETTE_ITEMS',
          items: shuffled,
        },
        getHostToken()
      );
    }
    showToast('🎲 룰렛 항목 순서를 무작위로 섞었습니다!');
  };

  const handleSelectPreset = (preset: RoulettePreset) => {
    setSelectedRouletteWinner(null);
    setIsResultModalOpen(false);
    setRoulettePresetTitle(preset.title);
    const newItems = preset.items.map((it: RoulettePresetItem) => ({
      id: it.id,
      name: it.name,
      avatar: it.icon || '🎯',
      weight: it.weight || 1,
    }));
    setRouletteItems(newItems);
    if (channelRef.current) {
      channelRef.current.send(
        {
          type: 'SYNC_ROULETTE_ITEMS',
          items: newItems,
          presetTitle: preset.title,
        },
        getHostToken()
      );
    }
    showToast(`'${preset.title}' 프리셋이 적용되었습니다.`);
  };

  const handleCopyText = () => {
    if (!selectedRouletteWinner) return;
    const text = formatRouletteResultText(selectedRouletteWinner, roulettePresetTitle, rouletteItems);
    navigator.clipboard?.writeText(text);
    showToast('룰렛 결과 텍스트가 클립보드에 복사되었습니다.');
  };

  const handleCopyImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateRouletteResultCardBlob({
        title: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        presetTitle: roulettePresetTitle,
        candidates: rouletteItems.map((it) => {
          const w = Math.max(1, it.weight || 1);
          return {
            name: it.name,
            avatar: it.avatar,
            weight: w,
            pct: Math.round((w / Math.max(1, totalRouletteWeight)) * 100),
          };
        }),
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
      setIsGeneratingCard(false);
    }
  };

  const handleDownloadImageCard = async () => {
    if (!selectedRouletteWinner) return;
    setIsGeneratingCard(true);
    try {
      const blob = await generateRouletteResultCardBlob({
        title: roulettePresetTitle,
        winner: {
          name: selectedRouletteWinner.name,
          avatar: selectedRouletteWinner.avatar,
          weight: selectedRouletteWinner.weight,
        },
        presetTitle: roulettePresetTitle,
        candidates: rouletteItems.map((it) => {
          const w = Math.max(1, it.weight || 1);
          return {
            name: it.name,
            avatar: it.avatar,
            weight: w,
            pct: Math.round((w / Math.max(1, totalRouletteWeight)) * 100),
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      downloadBlobAsFile(blob, `moabogo_roulette_${Date.now()}.png`);
      showToast('룰렛 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download roulette card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleOpenIconPicker = (itemId: string) => {
    setIconPickerTargetId(itemId);
    setIsIconPickerOpen(true);
  };

  const handleSelectIcon = (icon: string) => {
    if (iconPickerTargetId === 'new_item') {
      setNewItemIcon(icon);
    } else if (iconPickerTargetId) {
      setRouletteItems((prev) =>
        prev.map((it) => (it.id === iconPickerTargetId ? { ...it, avatar: icon } : it))
      );
    }
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || rouletteItems.length >= 20) return;
    const item: RouletteSliceItem = {
      id: `item_custom_${Date.now()}`,
      name: newItemName.trim(),
      avatar: newItemIcon,
      weight: 1,
    };
    setRouletteItems((prev) => [...prev, item]);
    setNewItemName('');
  };

  const handleInstantResultInModal = () => {
    clearSpinTimer();
    isSpinningRef.current = false;
    setIsSpinning(false);
    const itemsToUse = rouletteItemsRef.current;
    const totalWeightToUse = itemsToUse.reduce((acc, it) => acc + Math.max(1, it.weight || 1), 0);
    const slicesToUse = calculateRouletteSlices(itemsToUse, totalWeightToUse);
    const chosen = pickRandomRouletteItem(itemsToUse, totalWeightToUse);
    const { nextRotation } = calculateTargetRotation(chosen, slicesToUse, rouletteRotationRef.current, true);
    setRouletteTransitionDuration(0);
    setRouletteRotation(nextRotation);
    rouletteRotationRef.current = nextRotation;
    setSelectedRouletteWinner(chosen);
    selectedRouletteWinnerRef.current = chosen;
    showToast(`즉시 결과: '${chosen.name}'(이)가 당첨되었습니다!`);

    let nextItems: RouletteSliceItem[] | undefined;
    let nextExcluded: RouletteSliceItem[] | undefined;
    if (excludeWinnerModeRef.current && itemsToUse.length > 2) {
      nextExcluded = [...excludedRouletteItemsRef.current, chosen];
      nextItems = itemsToUse.filter((it) => it.id !== chosen.id);
      setExcludedRouletteItems(nextExcluded);
      excludedRouletteItemsRef.current = nextExcluded;
      setRouletteItems(nextItems);
      rouletteItemsRef.current = nextItems;
    }

    if (isRoomHost && channelRef.current) {
      channelRef.current.send(
        {
          type: 'ROULETTE_SPIN_COMPLETE',
          winner: chosen,
          items: nextItems,
          excludedItems: nextExcluded,
        },
        getHostToken()
      );
    }
  };

  return (
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
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              현재 룰렛 주제:
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              {roulettePresetTitle}
            </span>
            {roomId && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                {roomId}
              </span>
            )}
            {excludedRouletteItems.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {excludedRouletteItems.length}개 항목 제외 중
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              title="룰렛 이용 안내"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {roomId && (
              <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{connectedClients}명 동시 접속 중</span>
              </span>
            )}
            <button
              type="button"
              disabled={isGuest}
              onClick={handleShareRoom}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                isGuest
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-400'
                  : roomId
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/40 cursor-pointer'
                  : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:border-indigo-400 cursor-pointer'
              }`}
              title={
                isGuest
                  ? '참가자 모드에서는 공유 링크를 생성할 수 없습니다 (방장 전용)'
                  : '실시간 룰렛 다자간 방 공유 및 QR 코드 열기'
              }
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{roomId ? '실시간 공유 / QR' : '다자간 방 만들기'}</span>
            </button>
          </div>
        </div>

        {/* 룰렛 항목 인디케이터 & 가중치 모드 토글 */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>설정 항목</span>
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
                setUseRouletteWeight((prev) => !prev);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                useRouletteWeight
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                  : resolvedTheme === 'dawn'
                  ? 'bg-white/80 border-[#bfdbfe] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{useRouletteWeight ? '가중치 ON' : '가중치 OFF'}</span>
            </button>
          </div>
          <ElmRng01
            label=""
            value={rouletteItems.length}
            min={2}
            max={20}
            step={1}
            unit="개"
            disabled={isGuest || isSpinning}
            onChange={(val: number) => {
              if (isGuest) return;
              handleUpdateRouletteItemCount(val);
            }}
            colorScheme="indigo"
          />
        </div>

        {/* 항목 조정 & 프리셋 설정 버튼 + 항목 섞기 */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">항목 조정:</span>
            <span className="text-[11px] text-slate-400">
              {isGuest ? '방장만 항목 및 가중치를 변경할 수 있습니다' : '개별 명칭 및 가중치 세부 설정'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSpinning}
              onClick={handleShuffleRouletteItems}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold transition-all ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer'
              }`}
              title="룰렛 항목 순서 무작위 섞기 (참가자 공통)"
            >
              <Dices className="w-3.5 h-3.5 text-indigo-500" />
              <span>항목 섞기</span>
            </button>

            <button
              type="button"
              disabled={isGuest}
              onClick={() => {
                if (isGuest) return;
                setIsSettingModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs shrink-0 ${
                isGuest
                  ? 'bg-slate-400 dark:bg-zinc-700 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              }`}
            >
              {isGuest ? <Lock className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
              <span>{isGuest ? '항목 설정 (방장 전용)' : '항목 & 프리셋 설정'}</span>
            </button>
          </div>
        </div>

        {/* 추천 프리셋 원터치 슬라이드 (좌우 이동 버튼 제거 및 슬라이드드래그휠 전담) */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              📌 추천 프리셋:
            </span>
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => {
                if (isSpinning) return;
                handleApplyMembersToRoulette();
              }}
              className={`text-[11px] font-bold flex items-center gap-1 shrink-0 ${
                isSpinning
                  ? 'text-slate-400 cursor-not-allowed opacity-50'
                  : 'text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer'
              }`}
            >
              <span>👥</span>
              <span>참여 멤버 ({members.length}명) 반영</span>
            </button>
          </div>
          <ElmSld03
            showNavButtons={false}
            stepWidth={160}
            className="w-full"
            innerClassName="flex items-center gap-1.5 py-1 px-0.5"
          >
            {[DEFAULT_FIVE_ITEMS_PRESET, ...ROULETTE_PRESETS].map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  if (isSpinning) return;
                  handleSelectPreset(preset);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  roulettePresetTitle === preset.title
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : resolvedTheme === 'dawn'
                    ? 'bg-white border-[#bfdbfe] text-[#0d2746] hover:bg-blue-50'
                    : isDark
                    ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{preset.icon || '🎯'}</span>
                <span>{preset.title.replace(/^[^\s]+\s*/, '')}</span>
              </button>
            ))}
          </ElmSld03>
        </div>
      </div>

      {/* 룰렛 메인 인터랙션 존 (휠 + 항목 칩 + 컨트롤러) */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center justify-center gap-6 ${
          resolvedTheme === 'dawn'
            ? 'bg-white/80 border-[#bfdbfe]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* 룰렛 플레이존 타이틀 헤더 */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-zinc-100">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>룰렛 플레이존</span>
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
              disabled={isGuest}
              onClick={handleShareRoom}
              className={`p-2 rounded-xl border transition-all shadow-2xs ${
                isGuest
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-400'
                  : roomId
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400/30 cursor-pointer active:scale-95'
                  : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer active:scale-95'
              }`}
              title={
                isGuest
                  ? '참가자 모드에서는 공유 링크를 생성할 수 없습니다 (방장 전용)'
                  : '실시간 다자간 방 공유 및 QR 코드 열기'
              }
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
              <span>방장이 게임을 종료하여 신규 참여가 마감되었습니다. 최종 당첨 결과는 아래 팝업에서 확인 가능합니다.</span>
            </div>
            {selectedRouletteWinner && (
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

        {/* 상단 인라인 슬라이스 칩들 */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
          {rouletteItems.map((item, idx) => {
            const weight = Math.max(1, item.weight || 1);
            const pct = Math.round((weight / Math.max(1, totalRouletteWeight)) * 100);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
                  resolvedTheme === 'dawn'
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                    : isDark
                    ? 'bg-[#242429] border-[#34343a] text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <button
                  type="button"
                  disabled={isGuest}
                  onClick={() => handleOpenIconPicker(item.id)}
                  className={`transition-transform shrink-0 ${
                    isGuest ? 'cursor-not-allowed opacity-80' : 'hover:scale-125 cursor-pointer'
                  }`}
                  title={isGuest ? '방장만 아이콘을 변경할 수 있습니다' : '아이콘 변경'}
                >
                  {item.avatar}
                </button>
                <input
                  type="text"
                  value={item.name}
                  readOnly={isGuest}
                  onChange={(e) => {
                    if (isGuest) return;
                    handleUpdateItemName(item.id, e.target.value);
                  }}
                  placeholder={`항목${idx + 1}`}
                  className="bg-transparent border-b border-transparent hover:border-current focus:border-current outline-none text-xs font-bold w-16 sm:w-20 px-0.5 text-center transition-colors truncate"
                  title={isGuest ? '방장만 항목명을 수정할 수 있습니다' : '클릭하여 항목명 바로 수정'}
                />
                <span className="text-[10px] opacity-60 font-mono shrink-0">{pct}%</span>
                {/* 룰렛 가중치 인라인 조절 컨트롤 */}
                {useRouletteWeight && (
                  <div className="flex items-center gap-0.5 ml-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isGuest}
                      onClick={() => handleUpdateItemWeight(item.id, -1)}
                      className="p-0.5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                      title="가중치 1 감소"
                      aria-label="1 감소"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-8 py-0.2 rounded bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 text-[10px] font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 tabular-nums select-none">
                      {weight}x
                    </span>
                    <button
                      type="button"
                      disabled={isGuest}
                      onClick={() => handleUpdateItemWeight(item.id, 1)}
                      className="p-0.5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                      title="가중치 1 증가"
                      aria-label="1 증가"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 룰렛 휠 본체 (SVG) */}
        <RouletteWheelSvg
          slices={rouletteSlices}
          rotation={rouletteRotation}
          duration={rouletteTransitionDuration}
          isSpinning={isSpinning}
          onCenterClick={isGuest ? undefined : () => handleSpinRoulette(false, undefined, true)}
        />

        {/* 룰렛 메인 컨트롤 버튼 바 (모바일 줄바꿈 방지 및 요소 단위 줄바꿈, 재실행 및 회전중 텍스트 제거) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-lg">
          {isGuest ? (
            <div className="flex-1 py-3 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>
                {isSpinning
                  ? '🏁 초대자가 룰렛을 돌려 함께 회전하는 중...'
                  : '🎮 초대자가 룰렛을 돌리면 모든 화면에서 함께 회전합니다'}
              </span>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={isRoomClosed}
                onClick={() => handleSpinRoulette(false, undefined, true)}
                className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-0"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span className="whitespace-nowrap">{isRoomClosed ? '게임 마감됨' : '룰렛 돌리기'}</span>
              </button>

              <button
                type="button"
                disabled={isRoomClosed}
                onClick={() => handleSpinRoulette(true, undefined, true)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  resolvedTheme === 'dawn'
                    ? 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200'
                    : isDark
                    ? 'bg-[#27272a] border-[#3f3f46] text-slate-200 hover:bg-[#323238]'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="whitespace-nowrap">⚡ 즉시 결과</span>
              </button>
            </>
          )}

          {selectedRouletteWinner && (
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

        {/* 당첨 결과 알림 카드 */}
        {selectedRouletteWinner && (
          <div
            className={`w-full max-w-md p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 ${
              resolvedTheme === 'dawn'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950'
                : isDark
                ? 'bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-700/60 text-amber-200'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold">당첨을 축하합니다!</span>
            </div>
            <div className="text-xl sm:text-2xl font-black flex items-center gap-2 tracking-tight">
              <span className="text-3xl">{selectedRouletteWinner.avatar}</span>
              <span>{selectedRouletteWinner.name}</span>
            </div>

            {/* 결과 복사 타이틀 및 3건의 아이콘 */}
            <div className="flex items-center justify-between w-full pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
              <span className="text-xs font-bold text-amber-900/80 dark:text-amber-200/80">
                결과 복사:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 font-bold text-xs shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer flex items-center justify-center"
                  title="룰렛 결과 텍스트 복사"
                >
                  <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyImageCard}
                  disabled={isGeneratingCard}
                  className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 font-bold text-xs shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40"
                  title="룰렛 카드 이미지 복사"
                >
                  <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadImageCard}
                  disabled={isGeneratingCard}
                  className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 font-bold text-xs shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40"
                  title="룰렛 카드 이미지 파일 저장"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 도움말 모달 */}
      <RouletteHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 세부 항목 및 가중치 관리 모달 */}
      <RouletteItemSettingModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        items={rouletteItems}
        setItems={setRouletteItems}
        useWeight={useRouletteWeight}
        setUseWeight={setUseRouletteWeight}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemIcon={newItemIcon}
        setNewItemIcon={setNewItemIcon}
        onAddItem={handleAddNewItem}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
        onSelectIconTrigger={handleOpenIconPicker}
      />

      {/* 이모지 선택 모달 */}
      <RouletteIconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIcon}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 룰렛 최종 결과 전폭 팝업 모달 */}
      <RouletteResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        winner={selectedRouletteWinner}
        presetTitle={roulettePresetTitle}
        items={rouletteItems}
        onSpinAgain={() => handleSpinRoulette(false, undefined, true)}
        onInstantResult={handleInstantResultInModal}
        onCopyText={handleCopyText}
        onCopyImageCard={handleCopyImageCard}
        onDownloadImageCard={handleDownloadImageCard}
        resolvedTheme={resolvedTheme}
        isDark={isDark}
      />

      {/* 실시간 룰렛 다자간 방 공유 및 크로스 디바이스 QR 코드 모달 */}
      <LadderShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId || ''}
        gameTitle="룰렛 게임"
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

      {/* 방장이 게임을 종료했을 때 게스트 화면 인터랙션 알림 모달 */}
      {isGuestCloseNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center ${
              resolvedTheme === 'dawn'
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
                최종 결과를 확인하거나 <strong>[참여종료 및 혼자 게임 계속하기]</strong>로 현재 항목들과 함께 자유롭게 게임을 이어갈 수 있습니다.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 pt-2">
              {selectedRouletteWinner && (
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
