const DB_NAME = 'cognisync_db';
const DB_VERSION = 2;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      // v0 → v1: sessions store
      if (oldVersion < 1) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('savedAt', 'savedAt', { unique: false });
        sessions.createIndex('fileName', 'fileName', { unique: false });
      }

      // v1 → v2: collections store
      if (oldVersion < 2) {
        const collections = db.createObjectStore('collections', { keyPath: 'id' });
        collections.createIndex('name', 'name', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
