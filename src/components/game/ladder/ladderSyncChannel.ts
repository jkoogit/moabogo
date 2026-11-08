import { Participant } from '../types';
import { StorePreset } from '../../../sample/data/systemStorePool';
import { LadderGoal, LadderResultMap } from './types';

export interface LadderSyncState {
  roomId: string;
  hostTabId: string;
  members: Participant[];
  ladderGoals: LadderGoal[];
  ladderSeed: number;
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
  | { type: 'CLAIM_SEAT'; memberId: string; tabId: string }
  | { type: 'UPDATE_MEMBER_NAME'; memberId: string; name: string }
  | { type: 'SHUFFLE_RUNGS'; seed: number }
  | { type: 'SHUFFLE_GOALS'; goals: LadderGoal[] }
  | { type: 'PLAY_LADDER'; skipTrace: boolean; speed: number }
  | { type: 'RESET_GAME' }
  | { type: 'LEAVE_ROOM'; tabId: string };

export interface LadderChannelHandle {
  send: (msg: LadderSyncMessage) => void;
  close: () => void;
}

const STORAGE_PREFIX = 'moabogo_ladder_sync_';

export function createLadderSyncChannel(
  roomId: string,
  currentTabId: string,
  onMessage: (msg: LadderSyncMessage) => void
): LadderChannelHandle {
  const channelName = `moabogo_ladder_room_${roomId}`;
  const storageKey = `${STORAGE_PREFIX}${roomId}`;

  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(channelName);
      broadcastChannel.onmessage = (event) => {
        if (event.data) {
          onMessage(event.data as LadderSyncMessage);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization failed, falling back to storage events', e);
    }
  }

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

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  const send = (msg: LadderSyncMessage) => {
    // 1. Send via BroadcastChannel (in-memory, immediate 0ms)
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(msg);
      } catch (err) {
        console.warn('Failed to send broadcastChannel message', err);
      }
    }

    // 2. Also write to localStorage (cross-window storage event fallback + state snapshot persistence)
    if (typeof window !== 'undefined') {
      try {
        const payload = {
          senderTabId: currentTabId,
          timestamp: Date.now(),
          msg,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (err) {
        // quota exceeded or private mode guard
      }
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
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
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
