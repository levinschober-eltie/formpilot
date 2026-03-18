// ═══ FEATURE: Persistence Layer (Redundant: localStorage + IndexedDB) ═══
// Primary: localStorage (fast, synchronous reads)
// Backup:  IndexedDB (survives cache clears, larger quota)
// Every write mirrors to both. On read failure, falls back to IndexedDB.

import { mirrorToBackup, idbGet } from './storageBackup';

export const storageGet = async (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted JSON or localStorage unavailable */ }

  // Fallback: try IndexedDB backup
  try {
    const backup = await idbGet(key);
    if (backup !== null && backup !== undefined) {
      // Restore to localStorage for next fast access
      try { localStorage.setItem(key, JSON.stringify(backup)); } catch { /* quota exceeded */ }
      return backup;
    }
  } catch { /* IndexedDB unavailable */ }

  return null;
};

export const storageSet = async (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
  // Mirror to IndexedDB backup (fire-and-forget, non-blocking)
  mirrorToBackup(key, value);
};

export const storageDel = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Storage delete error:', e);
  }
  mirrorToBackup(key, null);
};
