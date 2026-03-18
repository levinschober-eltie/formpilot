// ═══ FEATURE: Persistence Layer (Redundant: localStorage + IndexedDB) ═══
// Primary: localStorage (fast, synchronous reads)
// Backup:  IndexedDB (survives cache clears, larger quota)
// Every write mirrors to both. On read failure, falls back to IndexedDB.
// Critical keys are validated via checksum to detect corruption.

import { mirrorToBackup, idbGet } from './storageBackup';
import { dialog } from './dialogService';

// ═══ Lightweight checksum (must match storageBackup.js) ═══
const fnv1a = (str) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

const CRITICAL_KEYS = ['fp_submissions', 'fp_templates', 'fp_customers', 'fp_projects'];
const CHECKSUM_PREFIX = '_fpck_';

export const storageGet = async (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      // Validate checksum for critical keys
      if (CRITICAL_KEYS.includes(key)) {
        const storedChecksum = localStorage.getItem(CHECKSUM_PREFIX + key);
        const actualChecksum = fnv1a(raw);
        if (storedChecksum && storedChecksum !== actualChecksum) {
          console.warn(`[FormPilot] Checksum mismatch for ${key} — falling back to IndexedDB`);
          // localStorage is corrupted, try IndexedDB
          const backup = await idbGet(key);
          if (backup !== null && backup !== undefined) {
            const backupJson = JSON.stringify(backup);
            try {
              localStorage.setItem(key, backupJson);
              localStorage.setItem(CHECKSUM_PREFIX + key, fnv1a(backupJson));
            } catch { /* quota */ }
            return backup;
          }
        }
      }
      return JSON.parse(raw);
    }
  } catch { /* corrupted JSON or localStorage unavailable */ }

  // Fallback: try IndexedDB backup
  try {
    const backup = await idbGet(key);
    if (backup !== null && backup !== undefined) {
      // Restore to localStorage for next fast access
      try {
        const json = JSON.stringify(backup);
        localStorage.setItem(key, json);
        if (CRITICAL_KEYS.includes(key)) {
          localStorage.setItem(CHECKSUM_PREFIX + key, fnv1a(json));
        }
      } catch { /* quota exceeded */ }
      return backup;
    }
  } catch { /* IndexedDB unavailable */ }

  return null;
};

export const storageSet = async (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      localStorage.removeItem(CHECKSUM_PREFIX + key);
    } else {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      // Store checksum for critical keys
      if (CRITICAL_KEYS.includes(key)) {
        localStorage.setItem(CHECKSUM_PREFIX + key, fnv1a(json));
      }
    }
  } catch (e) {
    console.error('Storage error:', e);
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      dialog.alert({
        title: 'Speicher voll',
        message: 'Speicher voll — Daten konnten nicht gespeichert werden. Bitte alte Einträge löschen.',
      });
    }
  }
  // Mirror to IndexedDB backup (fire-and-forget, non-blocking)
  mirrorToBackup(key, value);
};

export const storageDel = async (key) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(CHECKSUM_PREFIX + key);
  } catch (e) {
    console.error('Storage delete error:', e);
  }
  mirrorToBackup(key, null);
};
