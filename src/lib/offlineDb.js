// ═══ FEATURE: Offline Database (S04) ═══
// IndexedDB via idb for offline data storage and sync queue.

import { openDB } from 'idb';

const DB_NAME = 'formpilot-offline';
const DB_VERSION = 1;

let _dbPromise = null;

export async function getOfflineDb() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Offline-Cache for master data
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }

        // Sync queue for offline changes
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('by-timestamp', 'timestamp');
          syncStore.createIndex('by-status', 'status');
        }

        // Offline submissions (stored locally until synced)
        if (!db.objectStoreNames.contains('offlineSubmissions')) {
          db.createObjectStore('offlineSubmissions', { keyPath: 'id' });
        }

        // Offline files (photos, signatures as base64/blob)
        if (!db.objectStoreNames.contains('offlineFiles')) {
          db.createObjectStore('offlineFiles', { keyPath: 'path' });
        }

        // Drafts store (replaces localStorage for drafts)
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'key' });
        }
      },
    });
  }
  return _dbPromise;
}

// ═══ Generic helpers ═══
export async function offlineGetAll(storeName) {
  const db = await getOfflineDb();
  return db.getAll(storeName);
}

export async function offlineGet(storeName, key) {
  const db = await getOfflineDb();
  return db.get(storeName, key);
}

export async function offlinePut(storeName, value) {
  const db = await getOfflineDb();
  return db.put(storeName, value);
}

export async function offlineDelete(storeName, key) {
  const db = await getOfflineDb();
  return db.delete(storeName, key);
}

export async function offlineClear(storeName) {
  const db = await getOfflineDb();
  return db.clear(storeName);
}

// ═══ Draft helpers ═══
export async function saveDraft(key, data) {
  const db = await getOfflineDb();
  return db.put('drafts', { key, ...data, savedAt: new Date().toISOString() });
}

export async function getDraft(key) {
  const db = await getOfflineDb();
  return db.get('drafts', key);
}

export async function deleteDraft(key) {
  const db = await getOfflineDb();
  return db.delete('drafts', key);
}

// ═══ Cache templates in IndexedDB for offline ═══
export async function cacheTemplates(templates) {
  const db = await getOfflineDb();
  const tx = db.transaction('templates', 'readwrite');
  for (const t of templates) {
    await tx.store.put(t);
  }
  await tx.done;
}

export async function getCachedTemplates() {
  const db = await getOfflineDb();
  return db.getAll('templates');
}

// ═══ Cache submissions ═══
export async function cacheSubmissions(submissions) {
  const db = await getOfflineDb();
  const tx = db.transaction('offlineSubmissions', 'readwrite');
  for (const s of submissions) {
    await tx.store.put(s);
  }
  await tx.done;
}

export async function getCachedSubmissions() {
  const db = await getOfflineDb();
  return db.getAll('offlineSubmissions');
}
