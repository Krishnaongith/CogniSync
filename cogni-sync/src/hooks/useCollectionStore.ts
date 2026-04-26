import type { Collection, Session } from '../types/index';
import { openDB } from '../db/openDB';

const STORE_NAME = 'collections';
const SESSIONS_STORE_NAME = 'sessions';
const LS_KEY = 'cognisync_collections';

// ─── Pure helper functions (exported for testing) ────────────────────────────

/** Returns error string if name is empty/whitespace-only, null if valid. */
export function validateCollectionName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Collection name cannot be empty';
  }
  return null;
}

/** Case-insensitive duplicate check against existing collections. */
export function isNameDuplicate(
  name: string,
  existing: Collection[],
  excludeId?: string,
): boolean {
  const lower = name.trim().toLowerCase();
  return existing.some(
    (c) => c.name.trim().toLowerCase() === lower && c.id !== excludeId,
  );
}

/** Sort collections descending by updatedAt (most recent first). */
export function sortCollectionsByUpdatedAt(collections: Collection[]): Collection[] {
  return [...collections].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Filter sessions by collectionId, sort by savedAt descending. */
export function getSessionsForCollection(
  sessions: Session[],
  collectionId: string | null,
): Session[] {
  const filtered = sessions.filter((s) => {
    if (collectionId === null) {
      return s.collectionId === null || s.collectionId === undefined;
    }
    return s.collectionId === collectionId;
  });
  return [...filtered].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

// ─── IndexedDB helpers ───────────────────────────────────────────────────────

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

// ─── localStorage fallback ───────────────────────────────────────────────────

function lsGetAll(): Collection[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Collection[]) : [];
  } catch {
    return [];
  }
}

function lsSave(collections: Collection[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(collections));
}

function lsGetSessions(): Session[] {
  try {
    const raw = localStorage.getItem('cognisync_sessions');
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function lsSaveSessions(sessions: Session[]): void {
  localStorage.setItem('cognisync_sessions', JSON.stringify(sessions));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CollectionStoreAPI {
  createCollection: (name: string) => Promise<Collection>;
  renameCollection: (id: string, newName: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  getAllCollections: () => Promise<Collection[]>;
  getCollection: (id: string) => Promise<Collection | undefined>;
}

export function useCollectionStore(
  showToast?: (opts: { type: 'error'; title: string; message?: string }) => void,
): CollectionStoreAPI {
  const isIDBAvailable = typeof indexedDB !== 'undefined';

  const toast = (message: string) => {
    showToast?.({ type: 'error', title: 'Collection Store Error', message });
  };

  // ── IndexedDB implementation ──

  async function idbCreateCollection(name: string): Promise<Collection> {
    const db = await openDB();
    try {
      // Read existing to check duplicates
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const all: Collection[] = await idbRequest(store.getAll());

      const nameError = validateCollectionName(name);
      if (nameError) throw new Error(nameError);
      if (isNameDuplicate(name, all)) throw new Error('A collection with this name already exists');

      const now = new Date().toISOString();
      const collection: Collection = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
      };

      await idbRequest(store.put(collection));
      await idbTransaction(tx);
      return collection;
    } finally {
      db.close();
    }
  }

  async function idbRenameCollection(id: string, newName: string): Promise<void> {
    const db = await openDB();
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const nameError = validateCollectionName(newName);
      if (nameError) throw new Error(nameError);

      const existing = await idbRequest<Collection | undefined>(store.get(id));
      if (!existing) throw new Error('Collection not found');

      const all: Collection[] = await idbRequest(store.getAll());
      if (isNameDuplicate(newName, all, id)) throw new Error('A collection with this name already exists');

      existing.name = newName.trim();
      existing.updatedAt = new Date().toISOString();
      await idbRequest(store.put(existing));
      await idbTransaction(tx);
    } finally {
      db.close();
    }
  }

  async function idbDeleteCollection(id: string): Promise<void> {
    const db = await openDB();
    try {
      const tx = db.transaction([STORE_NAME, SESSIONS_STORE_NAME], 'readwrite');
      const collectionStore = tx.objectStore(STORE_NAME);
      const sessionStore = tx.objectStore(SESSIONS_STORE_NAME);

      // Remove collection
      await idbRequest(collectionStore.delete(id));

      // Cascade: nullify collectionId on affected sessions
      const allSessions: Session[] = await idbRequest(sessionStore.getAll());
      for (const session of allSessions) {
        if (session.collectionId === id) {
          session.collectionId = null;
          await idbRequest(sessionStore.put(session));
        }
      }

      await idbTransaction(tx);
    } finally {
      db.close();
    }
  }

  async function idbGetAllCollections(): Promise<Collection[]> {
    const db = await openDB();
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const all: Collection[] = await idbRequest(store.getAll());
      return sortCollectionsByUpdatedAt(all);
    } finally {
      db.close();
    }
  }

  async function idbGetCollection(id: string): Promise<Collection | undefined> {
    const db = await openDB();
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      return await idbRequest<Collection | undefined>(store.get(id));
    } finally {
      db.close();
    }
  }

  // ── localStorage fallback implementation ──

  async function lsCreateCollection(name: string): Promise<Collection> {
    const nameError = validateCollectionName(name);
    if (nameError) throw new Error(nameError);

    const collections = lsGetAll();
    if (isNameDuplicate(name, collections)) throw new Error('A collection with this name already exists');

    const now = new Date().toISOString();
    const collection: Collection = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    collections.push(collection);
    lsSave(collections);
    return collection;
  }

  async function lsRenameCollection(id: string, newName: string): Promise<void> {
    const nameError = validateCollectionName(newName);
    if (nameError) throw new Error(nameError);

    const collections = lsGetAll();
    const idx = collections.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Collection not found');

    if (isNameDuplicate(newName, collections, id)) throw new Error('A collection with this name already exists');

    collections[idx].name = newName.trim();
    collections[idx].updatedAt = new Date().toISOString();
    lsSave(collections);
  }

  async function lsDeleteCollection(id: string): Promise<void> {
    const collections = lsGetAll().filter((c) => c.id !== id);
    lsSave(collections);

    // Cascade: nullify collectionId on affected sessions
    const sessions = lsGetSessions();
    let changed = false;
    for (const session of sessions) {
      if (session.collectionId === id) {
        session.collectionId = null;
        changed = true;
      }
    }
    if (changed) lsSaveSessions(sessions);
  }

  async function lsGetAllCollections(): Promise<Collection[]> {
    return sortCollectionsByUpdatedAt(lsGetAll());
  }

  async function lsGetCollection(id: string): Promise<Collection | undefined> {
    return lsGetAll().find((c) => c.id === id);
  }

  // ── Wrapped with error handling ──

  if (isIDBAvailable) {
    return {
      createCollection: async (name) => {
        try {
          return await idbCreateCollection(name);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast(msg);
          throw err;
        }
      },
      renameCollection: async (id, newName) => {
        try {
          await idbRenameCollection(id, newName);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast(msg);
          throw err;
        }
      },
      deleteCollection: async (id) => {
        try {
          await idbDeleteCollection(id);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast(msg);
        }
      },
      getAllCollections: async () => {
        try {
          return await idbGetAllCollections();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast(msg);
          return [];
        }
      },
      getCollection: async (id) => {
        try {
          return await idbGetCollection(id);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast(msg);
          return undefined;
        }
      },
    };
  }

  // localStorage fallback
  return {
    createCollection: async (name) => {
      try {
        return await lsCreateCollection(name);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
        throw err;
      }
    },
    renameCollection: async (id, newName) => {
      try {
        await lsRenameCollection(id, newName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
        throw err;
      }
    },
    deleteCollection: async (id) => {
      try {
        await lsDeleteCollection(id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
      }
    },
    getAllCollections: async () => {
      try {
        return await lsGetAllCollections();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
        return [];
      }
    },
    getCollection: async (id) => {
      try {
        return await lsGetCollection(id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg);
        return undefined;
      }
    },
  };
}
