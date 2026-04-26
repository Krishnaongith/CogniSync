import type { Session } from '../types/index';
import { openDB } from '../db/openDB';

const STORE_NAME = 'sessions';
const SESSION_CAP = 50;
const LS_KEY = 'cognisync_sessions';

// ─── Pure helper functions (exported for testing) ────────────────────────────

/** Sort sessions descending by savedAt (most recent first). */
export function sortSessionsDescending(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

/** Enforce the 50-session cap: remove oldest sessions until count <= cap. */
export function enforceSessionCap(sessions: Session[], cap = SESSION_CAP): Session[] {
  const sorted = sortSessionsDescending(sessions);
  return sorted.slice(0, cap);
}

/** Remove a session by id from an array. */
export function removeSessionById(sessions: Session[], id: string): Session[] {
  return sessions.filter((s) => s.id !== id);
}

// ─── IndexedDB helpers ───────────────────────────────────────────────────────

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── localStorage fallback ───────────────────────────────────────────────────

function lsGetAll(): Session[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function lsSave(sessions: Session[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface SessionStoreAPI {
  saveSession: (session: Session) => Promise<void>;
  getSession: (id: string) => Promise<Session | undefined>;
  getAllSessions: () => Promise<Session[]>;
  deleteSession: (id: string) => Promise<void>;
  updateSession: (id: string, updates: Partial<Pick<Session, 'collectionId' | 'fileName'>>) => Promise<void>;
}

export function useSessionStore(
  showToast?: (opts: { type: 'error'; title: string; message?: string }) => void,
): SessionStoreAPI {
  const isIDBAvailable = typeof indexedDB !== 'undefined';

  const toast = (message: string) => {
    showToast?.({ type: 'error', title: 'Session Store Error', message });
  };

  // ── IndexedDB implementation ──

  async function idbSaveSession(session: Session): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Count existing sessions
    const count: number = await idbRequest(store.count());

    if (count >= SESSION_CAP) {
      // Delete oldest: open cursor on savedAt index ascending
      const index = store.index('savedAt');
      const cursor = await idbRequest(index.openCursor(null, 'next'));
      if (cursor) {
        await idbRequest(store.delete(cursor.primaryKey));
      }
    }

    await idbRequest(store.put(session));
    db.close();
  }

  async function idbGetSession(id: string): Promise<Session | undefined> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await idbRequest<Session | undefined>(store.get(id));
    db.close();
    return result;
  }

  async function idbGetAllSessions(): Promise<Session[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('savedAt');
    const all: Session[] = await idbRequest(index.getAll());
    db.close();
    // Sort descending (most recent first)
    return sortSessionsDescending(all);
  }

  async function idbDeleteSession(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await idbRequest(store.delete(id));
    db.close();
  }

  async function idbUpdateSession(id: string, updates: Partial<Pick<Session, 'collectionId' | 'fileName'>>): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing = await idbRequest<Session | undefined>(store.get(id));
    if (existing) {
      const updated = { ...existing, ...updates };
      await idbRequest(store.put(updated));
    }
    db.close();
  }

  // ── localStorage fallback implementation ──

  async function lsSaveSession(session: Session): Promise<void> {
    let sessions = lsGetAll();
    // Replace if exists, otherwise add
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    sessions = enforceSessionCap(sessions);
    lsSave(sessions);
  }

  async function lsGetSession(id: string): Promise<Session | undefined> {
    return lsGetAll().find((s) => s.id === id);
  }

  async function lsGetAllSessions(): Promise<Session[]> {
    return sortSessionsDescending(lsGetAll());
  }

  async function lsDeleteSession(id: string): Promise<void> {
    const sessions = removeSessionById(lsGetAll(), id);
    lsSave(sessions);
  }

  async function lsUpdateSession(id: string, updates: Partial<Pick<Session, 'collectionId' | 'fileName'>>): Promise<void> {
    const sessions = lsGetAll();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], ...updates };
      lsSave(sessions);
    }
  }

  // ── Wrapped with error handling ──

  const wrap =
    <T>(fn: () => Promise<T>, fallback: T): (() => Promise<T>) =>
    async () => {
      try {
        return await fn();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
        return fallback;
      }
    };

  if (isIDBAvailable) {
    return {
      saveSession: async (session) => {
        try {
          await idbSaveSession(session);
        } catch (err) {
          toast(err instanceof Error ? err.message : String(err));
        }
      },
      getSession: async (id) => {
        try {
          return await idbGetSession(id);
        } catch (err) {
          toast(err instanceof Error ? err.message : String(err));
          return undefined;
        }
      },
      getAllSessions: wrap(idbGetAllSessions, []),
      deleteSession: async (id) => {
        try {
          await idbDeleteSession(id);
        } catch (err) {
          toast(err instanceof Error ? err.message : String(err));
        }
      },
      updateSession: async (id, updates) => {
        try {
          await idbUpdateSession(id, updates);
        } catch (err) {
          toast(err instanceof Error ? err.message : String(err));
        }
      },
    };
  }

  // localStorage fallback
  return {
    saveSession: async (session) => {
      try {
        await lsSaveSession(session);
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
      }
    },
    getSession: async (id) => {
      try {
        return await lsGetSession(id);
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
        return undefined;
      }
    },
    getAllSessions: wrap(lsGetAllSessions, []),
    deleteSession: async (id) => {
      try {
        await lsDeleteSession(id);
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
      }
    },
    updateSession: async (id, updates) => {
      try {
        await lsUpdateSession(id, updates);
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
      }
    },
  };
}
