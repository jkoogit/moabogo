import { Participant } from '../types';
import { StorePreset } from '../../../sample/data/systemStorePool';
import { LadderRung, LadderGoal, LadderResultMap, LadderResultItem, LadderRevealedGoalCols } from './types';

export interface LadderSyncState {
  roomId: string;
  hostTabId: string;
  members: Participant[];
  ladderGoals: LadderGoal[];
  ladderSeed: number;
  ladderRungs?: LadderRung[];
  winnerCount: number;
  useLadderWeight: boolean;
  ladderSpeed: number;
  selectedStore: StorePreset | null;
  ladderResult?: LadderResultMap | null;
  timestamp: number;
}

export type LadderSyncMessage =
  | { type: 'SYNC_REQUEST'; senderTabId: string }
  | { type: 'SYNC_STATE'; state: LadderSyncState }
  | { type: 'SYNC_MEMBERS'; members: Participant[] }
  | { type: 'CLAIM_SEAT'; memberId: string; tabId: string }
  | { type: 'UPDATE_MEMBER_NAME'; memberId: string; name: string }
  | { type: 'UPDATE_MEMBER_DETAILS'; memberId: string; name?: string; avatarEmoji?: string; selectedMenu?: any }
  | { type: 'SHUFFLE_MEMBERS'; members: Participant[] }
  | { type: 'SHUFFLE_RUNGS'; seed: number; rungs?: LadderRung[] }
  | { type: 'SHUFFLE_GOALS'; goals: LadderGoal[] }
  | { type: 'UPDATE_WINNER_COUNT'; winnerCount: number; goals?: LadderGoal[] }
  | { type: 'UPDATE_STORE'; store: StorePreset | null; members?: Participant[] }
  | { type: 'UPDATE_LADDER_WEIGHT'; useLadderWeight: boolean }
  | { type: 'UPDATE_SPEED'; speed: number }
  | {
      type: 'PLAY_LADDER';
      skipTrace: boolean;
      speed: number;
      seed?: number;
      rungs?: LadderRung[];
      goals?: LadderGoal[];
      members?: Participant[];
      results?: LadderResultMap;
      revealedGoals?: Record<string, boolean>;
      revealedGoalCols?: LadderRevealedGoalCols;
    }
  | { type: 'RESET_GAME' }
  | { type: 'LEAVE_ROOM'; tabId: string }
  | { type: 'CLOSE_ROOM'; finalResult?: any }
  | { type: 'ROOM_CLOSED'; finalResult?: any }
  | {
      type: 'LADDER_RUNNER_ARRIVED';
      memberIndex: number;
      member: Participant;
      result: LadderResultItem;
      isLast: boolean;
      totalMembers: number;
      nextMemberName?: string;
      revealedGoals?: Record<string, boolean>;
      revealedGoalCols?: LadderRevealedGoalCols;
    }
  | { type: 'LADDER_PROCEED_NEXT'; nextMemberIndex: number; speed?: number; rungs?: LadderRung[]; goals?: LadderGoal[]; members?: Participant[] }
  | {
      type: 'LADDER_COMPLETE';
      results: LadderResultMap;
      revealedGoals?: Record<string, boolean>;
      revealedGoalCols?: LadderRevealedGoalCols;
    }
  | { type: 'PRESENCE_CHANGE'; connectedClients: number; seatReleasedTabId?: string; members?: Participant[] }
  | { type: 'NAVIGATE_GAME_TAB'; targetTab: 'LADDER' | 'ROULETTE' }
  | { type: 'SYNC_GAME_MODAL'; modalType: 'RESULT_MODAL'; isOpen: boolean };

export interface LadderChannelHandle {
  send: (msg: LadderSyncMessage, hostToken?: string | null) => void;
  close: () => void;
}

const STORAGE_PREFIX = 'moabogo_ladder_sync_';

/**
 * 룸 식별자 생성 유틸리티 (Type-Prefixed Crockford Base32)
 * @param gameType 'LADDER' | 'ROULETTE' | 'SETTLEMENT'
 */
export function generateGameRoomId(gameType: 'LADDER' | 'ROULETTE' | 'SETTLEMENT' = 'LADDER'): string {
  const prefix = gameType === 'ROULETTE' ? 'ROU' : gameType === 'SETTLEMENT' ? 'SET' : 'LAD';
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 혼동 문자(0, O, 1, I, L) 제외 31진법
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * 환경(로컬, 샌드박스, 개발, 검증, 운영) 호환 공유 URL 생성기
 * 기본값: 현재 실행 중인 도메인(window.location.origin) 기준 URL 생성 (Page Not Found 방지)
 * usePublicPreview: true 시 AI Studio 배포용 ais-pre- 도메인으로 변환
 */
export function buildRoomShareUrl(
  roomId: string,
  gameType: 'ladder' | 'roulette' = 'ladder',
  usePublicPreview = false
): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;

  if (usePublicPreview && origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  const pathname = window.location.pathname;
  return `${origin}${pathname}?game=${gameType}&room=${encodeURIComponent(roomId)}`;
}

/**
 * 하이브리드 실시간 채널 생성 함수 (BroadcastChannel + SSE Remote Relay + LocalStorage Fallback)
 */
export function createLadderSyncChannel(
  roomId: string,
  currentTabId: string,
  onMessage: (msg: LadderSyncMessage) => void
): LadderChannelHandle {
  const channelName = `moabogo_ladder_room_${roomId}`;
  const storageKey = `${STORAGE_PREFIX}${roomId}`;

  // 1. Tier 1: 로컬 브라우저 탭 간 BroadcastChannel (0ms 초저지연)
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(channelName);
      broadcastChannel.onmessage = (event) => {
        if (event.data) {
          const raw = event.data as any;
          if (raw && typeof raw === 'object' && 'msg' in raw && 'senderTabId' in raw) {
            if (raw.senderTabId !== currentTabId && raw.msg) {
              onMessage(raw.msg as LadderSyncMessage);
            }
          } else {
            onMessage(raw as LadderSyncMessage);
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization failed, falling back to storage/SSE', e);
    }
  }

  // 2. Tier 2: 크로스 디바이스 HTTP Server-Sent Events (SSE) 리모트 스트림
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      const sseUrl = `/api/v1/games/rooms/${encodeURIComponent(roomId)}/events?tabId=${encodeURIComponent(currentTabId)}`;
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (e) => {
        if (!e.data) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'ACTION_RELAY' && payload.action) {
            // 본인이 발행한 액션은 로컬에서 이미 처리되었으므로 중복 적용 방지
            if (payload.senderTabId !== currentTabId) {
              onMessage(payload.action as LadderSyncMessage);
            }
          } else if (payload.type === 'PRESENCE_CHANGE') {
            onMessage({
              type: 'PRESENCE_CHANGE',
              connectedClients: payload.connectedClients || 1,
              seatReleasedTabId: payload.seatReleasedTabId,
              members: payload.members,
            });
          } else if (payload.type === 'ROOM_CONNECTED') {
            onMessage({
              type: 'PRESENCE_CHANGE',
              connectedClients: payload.connectedClients || 1,
            });
            if (payload.isClosed) {
              onMessage({
                type: 'CLOSE_ROOM',
                finalResult: payload.finalResult,
              });
            }
            if (payload.data && Array.isArray(payload.data.ladderGoals) && payload.data.ladderGoals.length > 0) {
              onMessage({
                type: 'SYNC_STATE',
                state: payload.data as LadderSyncState,
              });
            }
          }
        } catch (err) {
          console.error('[SSE] Failed to parse message', err);
        }
      };

      eventSource.onerror = () => {
        // 네트워크 두절 시 EventSource 자동 재시도 대기 (경고 로깅만 수행)
      };
    } catch (err) {
      console.warn('[SSE] EventSource init failed', err);
    }
  }

  // 3. Tier 3: 동일 브라우저 다른 탭 Fallback (Storage Event)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload && payload.senderTabId !== currentTabId) {
          onMessage(payload.msg as LadderSyncMessage);
        }
      } catch (err) {
        console.error('Failed to parse storage event message', err);
      }
    }
  };

  // 4. 탭 닫기/이탈 시 실시간 점유 자리 해제 및 Presence 갱신 (Beacon + Broadcast)
  const handleBeforeUnload = () => {
    try {
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'LEAVE_ROOM', tabId: currentTabId });
      }
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = JSON.stringify({ tabId: currentTabId });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`/api/v1/games/rooms/${encodeURIComponent(roomId)}/leave`, blob);
      }
    } catch (e) {
      // ignore
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  // 메시지 송신 함수 (모든 계층으로 동시 송신)
  const send = (msg: LadderSyncMessage, hostToken?: string | null) => {
    // 1) BroadcastChannel 송신 (로컬 탭 즉시 반영, senderTabId 첨부)
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ senderTabId: currentTabId, msg });
      } catch (err) {
        // ignore
      }
    }

    // 2) 로컬스토리지 백업 기록
    if (typeof window !== 'undefined') {
      try {
        const payload = {
          senderTabId: currentTabId,
          timestamp: Date.now(),
          msg,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (err) {
        // ignore
      }
    }

    // 3) 원격 서버 SSE 릴레이 브로드캐스트 (크로스 디바이스 전파)
    if (typeof window !== 'undefined') {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (hostToken) {
        headers['x-host-token'] = hostToken;
      }
      const isUrgent = msg.type === 'CLOSE_ROOM' || msg.type === 'LEAVE_ROOM';
      fetch(`/api/v1/games/rooms/${encodeURIComponent(roomId)}/action`, {
        method: 'POST',
        headers,
        keepalive: isUrgent,
        body: JSON.stringify({
          action: msg,
          senderTabId: currentTabId,
          hostToken: hostToken || undefined,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error(`[Channel] Remote action dispatch failed (${res.status} ${res.statusText}):`, errData);
          }
        })
        .catch((e) => {
          console.warn('[Channel] Remote action dispatch network error', e);
        });
    }
  };

  const close = () => {
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch (e) {
        // ignore
      }
    }
    if (eventSource) {
      try {
        eventSource.close();
      } catch (e) {
        // ignore
      }
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  };

  return { send, close };
}

export function saveRoomSnapshot(roomId: string, state: LadderSyncState) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`moabogo_ladder_snapshot_${roomId}`, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }
}

export function loadRoomSnapshot(roomId: string): LadderSyncState | null {
  if (typeof window !== 'undefined') {
    try {
      const data = window.localStorage.getItem(`moabogo_ladder_snapshot_${roomId}`);
      if (data) return JSON.parse(data) as LadderSyncState;
    } catch (e) {
      // ignore
    }
  }
  return null;
}
