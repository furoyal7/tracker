import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'expense-tracker-sync';
const STORE_NAME = 'sync-queue';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export const addToSyncQueue = async (request: { url: string; method: string; body: any; headers: any }) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.add(STORE_NAME, {
    ...request,
    timestamp: Date.now(),
  });
  
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register('sync-transactions');
    } catch (e) {
      console.warn('Background sync could not be registered', e);
    }
  } else {
    // Fallback: try to sync if we are online now
    if (navigator.onLine) {
      processSyncQueue();
    }
  }
};

export const getSyncQueue = async () => {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const removeFromSyncQueue = async (id: number) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: JSON.stringify(item.body),
      });

      if (response.ok) {
        await removeFromSyncQueue(item.id);
      }
    } catch (error) {
      console.error('Failed to sync item:', item, error);
    }
  }
};

// Listen for online events to process the queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
}
