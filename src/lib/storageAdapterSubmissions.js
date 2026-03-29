// ═══ FEATURE: Storage Adapter — Submissions ═══
// Split from storageAdapter.js for modularity.

import { storageGet, storageSet } from './storage';
import * as api from './api';
import { STORAGE_KEYS } from '../config/constants';
import { getOfflineDb, cacheSubmissions, getCachedSubmissions } from './offlineDb';
import { syncQueue } from './syncQueue';
import { isApiMode, isNetworkError } from './storageAdapterShared';

// ═══ SUBMISSIONS ═══
export async function loadSubmissions(filters = {}) {
  if (isApiMode()) {
    try {
      const submissions = await api.getSubmissions(filters);
      // Cache in IndexedDB for offline access
      cacheSubmissions(submissions).catch(() => {});
      return submissions;
    } catch (e) {
      console.error('[StorageAdapter] API submissions load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const cached = await getCachedSubmissions();
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.submissions)) || [];
}

export async function saveSubmission(submission) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        const saved = await api.saveSubmission(submission);
        // Also cache locally
        const db = await getOfflineDb();
        await db.put('offlineSubmissions', saved);
        return saved;
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveSubmissionOffline(submission);
        }
        console.error('[StorageAdapter] API submission save failed:', e);
        throw e;
      }
    } else {
      return await _saveSubmissionOffline(submission);
    }
  }
  const subs = (await storageGet(STORAGE_KEYS.submissions)) || [];
  const idx = subs.findIndex(s => s.id === submission.id);
  if (idx >= 0) subs[idx] = submission; else subs.push(submission);
  await storageSet(STORAGE_KEYS.submissions, subs);
  return submission;
}

async function _saveSubmissionOffline(submission) {
  const db = await getOfflineDb();
  await db.put('offlineSubmissions', submission);
  await syncQueue.enqueue({
    type: submission.id ? 'update' : 'create',
    entity: 'submission',
    data: submission,
  });
  return submission;
}

export async function updateSubmissionStatus(id, status) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.updateSubmissionStatus(id, status);
      } catch (e) {
        if (isNetworkError(e)) {
          // Store status change offline
          const db = await getOfflineDb();
          const existing = await db.get('offlineSubmissions', id);
          if (existing) {
            existing.status = status;
            await db.put('offlineSubmissions', existing);
            await syncQueue.enqueue({ type: 'update', entity: 'submission', data: existing });
            return existing;
          }
        }
        console.error('[StorageAdapter] API submission status update failed:', e);
        throw e;
      }
    } else {
      const db = await getOfflineDb();
      const existing = await db.get('offlineSubmissions', id);
      if (existing) {
        existing.status = status;
        await db.put('offlineSubmissions', existing);
        await syncQueue.enqueue({ type: 'update', entity: 'submission', data: existing });
        return existing;
      }
    }
  }
  const subs = (await storageGet(STORAGE_KEYS.submissions)) || [];
  const updated = subs.map(s => s.id === id ? { ...s, status } : s);
  await storageSet(STORAGE_KEYS.submissions, updated);
  return updated.find(s => s.id === id);
}

export async function deleteSubmission(id) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.deleteSubmission(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'submission', data: { id } });
          const db = await getOfflineDb();
          await db.delete('offlineSubmissions', id);
          return;
        }
        console.error('[StorageAdapter] API submission delete failed:', e);
        throw e;
      }
    } else {
      await syncQueue.enqueue({ type: 'delete', entity: 'submission', data: { id } });
      const db = await getOfflineDb();
      await db.delete('offlineSubmissions', id);
      return;
    }
  }
  const subs = ((await storageGet(STORAGE_KEYS.submissions)) || []).filter(s => s.id !== id);
  await storageSet(STORAGE_KEYS.submissions, subs);
}
