// ============================================================================
// 모아보고 오프라인 세션 토큰 저장소 (IndexedDB + LocalStorage 미러 폴백)
// SSOT: 네트워크 단절 시에도 기기 로컬 세션 유지 및 동기화 뷰어(SCR-OFF-01) 연동
// ============================================================================

export type OfflineAuthProvider = 'EMAIL' | 'KAKAO' | 'NAVER' | 'GOOGLE';

export interface OfflineAuthSession {
  sessionId: string;
  userId: string;
  email: string;
  nickname: string;
  provider: OfflineAuthProvider;
  maskedToken: string;
  issuedAt: string;
  expiresAt: string;
  isActive: boolean;
}

const IDB_NAME = 'moabogo_auth_db';
const IDB_VERSION = 1;
const IDB_STORE = 'offline_sessions';
const IDB_RECORD_KEY = 'current_session';
const LS_SESSION_KEY = 'moabogo_offline_session_v1';
const LS_REVOKED_MARKER = '__REVOKED__';
export const OFFLINE_SESSION_CHANGED_EVENT = 'moabogo:offline-session-changed';

function formatDateTime(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function buildSeedSession(): OfflineAuthSession {
  const now = new Date();
  const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    sessionId: 'sess_seed_koo_01',
    userId: 'u-1001-koo',
    email: 'jkok2j2m@gmail.com',
    nickname: '구본영(호스트)',
    provider: 'EMAIL',
    maskedToken: 'moa_idb_9f4a****c81e',
    issuedAt: formatDateTime(now),
    expiresAt: formatDateTime(exp),
    isActive: true,
  };
}

function notifySessionChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OFFLINE_SESSION_CHANGED_EVENT));
  }
}

function openAuthDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeSessionToIDB(session: OfflineAuthSession | null): Promise<void> {
  const db = await openAuthDatabase();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      if (session) {
        store.put(session, IDB_RECORD_KEY);
      } else {
        store.delete(IDB_RECORD_KEY);
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    db.close();
  }
}

export async function hydrateOfflineSessionFromIDB(): Promise<OfflineAuthSession | null> {
  const db = await openAuthDatabase();
  if (!db) return getCachedOfflineSession();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_RECORD_KEY);
      req.onsuccess = () => {
        db.close();
        const result = (req.result as OfflineAuthSession | undefined) || null;
        if (result) {
          try {
            localStorage.setItem(LS_SESSION_KEY, JSON.stringify(result));
          } catch {
            // ignore
          }
          resolve(result);
        } else {
          resolve(getCachedOfflineSession());
        }
      };
      req.onerror = () => {
        db.close();
        resolve(getCachedOfflineSession());
      };
    } catch {
      db.close();
      resolve(getCachedOfflineSession());
    }
  });
}

export function getCachedOfflineSession(): OfflineAuthSession | null {
  if (typeof window === 'undefined') return buildSeedSession();
  try {
    const raw = localStorage.getItem(LS_SESSION_KEY);
    if (raw === LS_REVOKED_MARKER) return null;
    if (!raw) {
      const seed = buildSeedSession();
      localStorage.setItem(LS_SESSION_KEY, JSON.stringify(seed));
      void writeSessionToIDB(seed);
      return seed;
    }
    return JSON.parse(raw) as OfflineAuthSession;
  } catch {
    return null;
  }
}

export function issueOfflineSession(params: {
  email: string;
  nickname?: string;
  provider: OfflineAuthProvider;
}): OfflineAuthSession {
  const now = new Date();
  const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const randHead = Math.random().toString(16).slice(2, 6);
  const randTail = Math.random().toString(16).slice(2, 6);

  const session: OfflineAuthSession = {
    sessionId: `sess_${Date.now().toString(36)}`,
    userId: 'u-1001-koo',
    email: params.email || 'jkok2j2m@gmail.com',
    nickname: params.nickname || '구본영(호스트)',
    provider: params.provider,
    maskedToken: `moa_idb_${randHead}****${randTail}`,
    issuedAt: formatDateTime(now),
    expiresAt: formatDateTime(exp),
    isActive: true,
  };

  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
  void writeSessionToIDB(session);
  notifySessionChange();
  return session;
}

export function extendOfflineSession(): OfflineAuthSession | null {
  const current = getCachedOfflineSession();
  if (!current) return null;
  const now = new Date();
  const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const updated: OfflineAuthSession = {
    ...current,
    expiresAt: formatDateTime(exp),
    isActive: true,
  };
  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  void writeSessionToIDB(updated);
  notifySessionChange();
  return updated;
}

export function revokeOfflineSession(): void {
  try {
    localStorage.setItem(LS_SESSION_KEY, LS_REVOKED_MARKER);
  } catch {
    // ignore
  }
  void writeSessionToIDB(null);
  notifySessionChange();
}
