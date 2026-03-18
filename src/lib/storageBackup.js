// ═══ FEATURE: Redundant Storage Layer (IndexedDB Backup) ═══
// Level 1: Mirrors all localStorage data to IndexedDB for redundancy.
// Level 2: Versioning — keeps last N snapshots of critical keys for rollback.
// Level 2: Checksums — detects corruption before it propagates to backup.

const DB_NAME = 'formpilot_backup';
const DB_VERSION = 2;
const STORE_NAME = 'kv';
const HISTORY_STORE = 'history';
const SNAPSHOT_KEY = '_fp_backup_meta';

// Critical keys get versioned history (max snapshots kept)
const CRITICAL_KEYS = ['fp_submissions', 'fp_templates', 'fp_customers', 'fp_projects'];
const MAX_VERSIONS = 5;

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('key', 'key', { unique: false });
        store.createIndex('key_ts', ['key', 'timestamp'], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
  return dbPromise;
};

// ═══ Lightweight checksum (FNV-1a 32-bit) ═══
const fnv1a = (str) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
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

// ═══ History / Versioning ═══

/**
 * Save a versioned snapshot of a critical key.
 * Keeps last MAX_VERSIONS entries, auto-prunes older ones.
 */
const saveVersion = async (key, value) => {
  if (!CRITICAL_KEYS.includes(key) || value === null || value === undefined) return;
  try {
    const db = await openDB();
    const json = JSON.stringify(value);
    const checksum = fnv1a(json);
    const entry = { key, timestamp: Date.now(), checksum, value, size: json.length };

    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.add(entry);

    // Prune: keep only last MAX_VERSIONS per key
    const idx = store.index('key');
    const req = idx.getAllKeys(IDBKeyRange.only(key));
    req.onsuccess = () => {
      const ids = req.result;
      if (ids.length > MAX_VERSIONS) {
        const toDelete = ids.slice(0, ids.length - MAX_VERSIONS);
        toDelete.forEach(id => store.delete(id));
      }
    };

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* versioning is best-effort */ }
};

/**
 * Get version history for a critical key.
 * Returns array of { id, timestamp, checksum, size } (newest first), without the full value.
 */
export const getVersionHistory = async (key) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE, 'readonly');
      const store = tx.objectStore(HISTORY_STORE);
      const idx = store.index('key');
      const req = idx.getAll(IDBKeyRange.only(key));
      req.onsuccess = () => {
        const entries = (req.result || []).map(e => ({
          id: e.id, timestamp: e.timestamp, checksum: e.checksum, size: e.size,
        })).sort((a, b) => b.timestamp - a.timestamp);
        resolve(entries);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch { return []; }
};

/**
 * Restore a specific version by its history ID.
 * Writes to both localStorage and IndexedDB kv store.
 */
export const restoreVersion = async (historyId) => {
  const db = await openDB();
  const entry = await new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const req = tx.objectStore(HISTORY_STORE).get(historyId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (!entry) throw new Error('Version nicht gefunden');

  // Verify checksum before restoring
  const json = JSON.stringify(entry.value);
  const checksum = fnv1a(json);
  if (checksum !== entry.checksum) {
    throw new Error('Checksum-Fehler: Version ist beschädigt');
  }

  // Write to both stores + checksum
  localStorage.setItem(entry.key, json);
  if (CRITICAL_KEYS.includes(entry.key)) {
    localStorage.setItem('_fpck_' + entry.key, checksum);
  }
  await idbSet(entry.key, entry.value);
  return { key: entry.key, timestamp: entry.timestamp, checksum };
};

// ═══ Backup Operations ═══

/**
 * Mirror a single key-value pair to IndexedDB (fire-and-forget).
 * Critical keys also get versioned snapshots.
 */
export const mirrorToBackup = (key, value) => {
  idbSet(key, value).then(() => {
    idbSet(SNAPSHOT_KEY, { lastBackup: new Date().toISOString(), source: 'auto-mirror' });
  }).catch(() => {});
  // Version critical keys (debounced by nature of fire-and-forget)
  saveVersion(key, value);
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
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      if (CRITICAL_KEYS.includes(key)) {
        localStorage.setItem('_fpck_' + key, fnv1a(json));
      }
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
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      if (CRITICAL_KEYS.includes(key)) {
        localStorage.setItem('_fpck_' + key, fnv1a(json));
      }
      await idbSet(key, value);
      imported++;
    } catch { /* skip */ }
  }
  return imported;
};
