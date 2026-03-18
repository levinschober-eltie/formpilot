// ═══ FEATURE: Redundant Storage Layer (IndexedDB Backup) ═══
// Mirrors all localStorage data to IndexedDB for redundancy.
// If localStorage is wiped (cache clear, storage pressure), data survives in IndexedDB.

const DB_NAME = 'formpilot_backup';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const SNAPSHOT_KEY = '_fp_backup_meta';

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE_NAME); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
  return dbPromise;
};

// ═══ Low-level IndexedDB operations ═══

export const idbGet = async (key) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};

export const idbSet = async (key, value) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      if (value === null || value === undefined) {
        store.delete(key);
      } else {
        store.put(value, key);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB not available — silently fail
  }
};

export const idbGetAll = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const keys = store.getAllKeys();
      const values = store.getAll();
      tx.oncomplete = () => {
        const result = {};
        keys.result.forEach((k, i) => { result[k] = values.result[i]; });
        resolve(result);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return {};
  }
};

// ═══ Backup Operations ═══

/**
 * Mirror a single key-value pair to IndexedDB (fire-and-forget).
 */
export const mirrorToBackup = (key, value) => {
  idbSet(key, value).then(() => {
    idbSet(SNAPSHOT_KEY, { lastBackup: new Date().toISOString(), source: 'auto-mirror' });
  }).catch(() => {});
};

/**
 * Full backup: copy all fp_ keys from localStorage to IndexedDB.
 */
export const createFullBackup = async () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('fp_')) keys.push(key);
  }
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      const value = raw ? JSON.parse(raw) : null;
      await idbSet(key, value);
    } catch { /* skip corrupted entries */ }
  }
  await idbSet(SNAPSHOT_KEY, {
    lastBackup: new Date().toISOString(),
    source: 'full-backup',
    keyCount: keys.length,
  });
  return keys.length;
};

/**
 * Restore: copy all fp_ keys from IndexedDB back to localStorage.
 * Returns number of keys restored.
 */
export const restoreFromBackup = async () => {
  const all = await idbGetAll();
  let restored = 0;
  for (const [key, value] of Object.entries(all)) {
    if (!key.startsWith('fp_')) continue;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      restored++;
    } catch { /* localStorage full or unavailable */ }
  }
  return restored;
};

/**
 * Check if localStorage is empty but IndexedDB has data (= data loss detected).
 * Returns { needsRestore, backupMeta, localKeyCount, backupKeyCount }
 */
export const checkIntegrity = async () => {
  let localKeyCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith('fp_')) localKeyCount++;
  }

  const all = await idbGetAll();
  const backupKeys = Object.keys(all).filter(k => k.startsWith('fp_'));
  const backupMeta = all[SNAPSHOT_KEY] || null;

  return {
    needsRestore: localKeyCount === 0 && backupKeys.length > 0,
    backupMeta,
    localKeyCount,
    backupKeyCount: backupKeys.length,
  };
};

// ═══ Export / Import (User-facing backup) ═══

/**
 * Export all FormPilot data as a downloadable JSON file.
 */
export const exportAllData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('fp_')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return Object.keys(data).length;
};

/**
 * Import FormPilot data from a JSON backup file.
 * Returns number of keys imported.
 */
export const importAllData = async (file) => {
  const text = await file.text();
  const data = JSON.parse(text);
  let imported = 0;
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith('fp_')) continue;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      await idbSet(key, value);
      imported++;
    } catch { /* skip */ }
  }
  return imported;
};
