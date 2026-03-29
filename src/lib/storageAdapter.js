// ═══ FEATURE: Storage Adapter (S05) + Offline Fallback (S04) ═══
// Barrel re-export: all entity-specific adapters + shared helpers.
// Switches between localStorage and API based on configuration.
// Falls back to IndexedDB offline storage when network is unavailable.

import * as api from './api';
import { getOfflineDb } from './offlineDb';
import { isApiMode, isNetworkError } from './storageAdapterShared';

// ═══ Re-export shared helpers ═══
export { isApiMode, isSupabaseMode, isNetworkError } from './storageAdapterShared';

// ═══ Re-export entity modules ═══
export * from './storageAdapterTemplates';
export * from './storageAdapterSubmissions';
export * from './storageAdapterCustomers';
export * from './storageAdapterProjects';

// ═══ FILE STORAGE ═══
export async function uploadFileData(bucket, path, base64) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.uploadBase64(bucket, path, base64);
      } catch (e) {
        if (isNetworkError(e)) {
          // Store file offline
          const db = await getOfflineDb();
          await db.put('offlineFiles', { path, base64, bucket });
          return path; // Return path as reference
        }
        console.error('[StorageAdapter] File upload failed:', e);
        throw e;
      }
    } else {
      // Offline: store in IndexedDB
      const db = await getOfflineDb();
      await db.put('offlineFiles', { path, base64, bucket });
      return path;
    }
  }
  // localStorage fallback: just return the base64 as-is (no upload)
  return base64;
}

export async function getFileData(bucket, pathOrBase64) {
  // If it's already a base64 string (localStorage mode), return as-is
  if (pathOrBase64 && pathOrBase64.startsWith('data:')) return pathOrBase64;

  // Check offline files first
  if (pathOrBase64) {
    try {
      const db = await getOfflineDb();
      const offlineFile = await db.get('offlineFiles', pathOrBase64);
      if (offlineFile && offlineFile.base64) return offlineFile.base64;
    } catch {
      // Ignore IndexedDB errors
    }
  }

  if (isApiMode() && pathOrBase64) {
    try {
      return await api.downloadAsBase64(bucket, pathOrBase64);
    } catch (e) {
      console.error('[StorageAdapter] File download failed:', e);
      return null;
    }
  }
  return pathOrBase64;
}

// ═══ ACTIVITY LOG ═══
export async function logActivity(action, entityType, entityId, details = {}) {
  if (isApiMode()) {
    try {
      return await api.logActivity(action, entityType, entityId, details);
    } catch (e) {
      console.error('[StorageAdapter] Activity log failed:', e);
    }
  }
  // localStorage: activity log is handled by customerService already
}
