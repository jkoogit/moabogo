import { RouletteSliceItem } from '../types';

export interface RouletteSyncState {
  roomId: string;
  hostTabId: string;
  roulettePresetTitle: string;
  rouletteItems: RouletteSliceItem[];
  selectedWinner: RouletteSliceItem | null;
  useRouletteWeight: boolean;
  excludeWinnerMode: boolean;
  timestamp: number;
}

export type RouletteSyncMessage =
  | { type: 'ROULETTE_SYNC_REQUEST'; senderTabId: string }
  | { type: 'ROULETTE_SYNC_STATE'; state: RouletteSyncState }
  | { type: 'SPIN_ROULETTE'; targetAngle: number; chosenItem: RouletteSliceItem; duration: number }
  | { type: 'SYNC_ROULETTE_ITEMS'; items: RouletteSliceItem[] }
  | { type: 'SYNC_ROULETTE_RESULT'; winner: RouletteSliceItem | null }
  | { type: 'RESET_ROULETTE' }
  | { type: 'CLOSE_ROOM'; finalResult?: any }
  | { type: 'ROOM_CLOSED'; finalResult?: any }
  | { type: 'PRESENCE_CHANGE'; connectedClients: number };

export interface RouletteChannelHandle {
  send: (msg: RouletteSyncMessage) => void;
  close: () => void;
}

const STORAGE_PREFIX = 'moabogo_roulette_sync_';

export function createRouletteSyncChannel(
  roomId: string,
  currentTabId: string,
  onMessage: (msg: RouletteSyncMessage) => void
): RouletteChannelHandle {
  const channelName = `moabogo_roulette_room_${roomId}`;
  const storageKey = `${STORAGE_PREFIX}${roomId}`;

  // 1. BroadcastChannel (0ms local tab)
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(channelName);
      broadcastChannel.onmessage = (event) => {
        if (event.data) {
          onMessage(event.data as RouletteSyncMessage);
        }
      };
    } catch (e) {
      console.warn('Roulette BroadcastChannel failed', e);
    }
  }

  // 2. Server-Sent Events (SSE) remote cross-device stream
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
            if (payload.senderTabId !== currentTabId) {
              onMessage(payload.action as RouletteSyncMessage);
            }
          } else if (payload.type === 'PRESENCE_CHANGE') {
            onMessage({
              type: 'PRESENCE_CHANGE',
              connectedClients: payload.connectedClients || 1,
            });
          } else if (payload.type === 'ROOM_CONNECTED') {
            onMessage({
              type: 'PRESENCE_CHANGE',
              connectedClients: payload.connectedClients || 1,
            });
            if (payload.data && Object.keys(payload.data).length > 0) {
              onMessage({
                type: 'ROULETTE_SYNC_STATE',
                state: payload.data as RouletteSyncState,
              });
            }
          }
        } catch (err) {
          console.error('[Roulette SSE] Error parsing message', err);
        }
      };
    } catch (err) {
      console.warn('[Roulette SSE] EventSource init failed', err);
    }
  }

  // 3. Storage Event Fallback
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload && payload.senderTabId !== currentTabId) {
          onMessage(payload.msg as RouletteSyncMessage);
        }
      } catch (err) {
        // ignore
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  const send = (msg: RouletteSyncMessage) => {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(msg);
      } catch (err) {
        // ignore
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            senderTabId: currentTabId,
            timestamp: Date.now(),
            msg,
          })
        );
      } catch (e) {
        // ignore
      }

      fetch(`/api/v1/games/rooms/${encodeURIComponent(roomId)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: msg,
          senderTabId: currentTabId,
        }),
      }).catch((e) => {
        // ignore
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
    }
  };

  return { send, close };
}
