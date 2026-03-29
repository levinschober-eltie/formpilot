// ═══ FEATURE: Sync Queue (S04) ═══
// Queues offline changes and syncs them when network is available.

import { getOfflineDb } from './offlineDb';
import * as api from './api';
import { isApiConfigured } from './api/client';

class SyncQueueManager {
  constructor() {
    this._processing = false;
    this._listeners = new Set();
  }

  // ═══ Subscribe to queue status changes ═══
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    this.getQueueStatus().then(status => {
      this._listeners.forEach(fn => {
        try { fn(status); } catch { /* ignore */ }
      });
    });
  }

  // ═══ Add change to queue ═══
  async enqueue(action) {
    try {
      const db = await getOfflineDb();
      const entry = {
        ...action,
        status: 'pending',
        retryCount: 0,
        timestamp: Date.now(),
      };
      await db.add('syncQueue', entry);
      this._notify();

      // Trigger sync if online
      if (navigator.onLine && isApiConfigured()) {
        this.processQueue();
      }
    } catch (e) {
      console.error('[SyncQueue] Enqueue failed:', e);
    }
  }

  // ═══ Process all pending entries ═══
  async processQueue() {
    if (this._processing) return;
    if (!navigator.onLine || !isApiConfigured()) return;

    this._processing = true;
    this._notify();

    try {
      const db = await getOfflineDb();
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const index = store.index('by-status');
      const pending = await index.getAll('pending');
      await tx.done;

      for (const entry of pending) {
        try {
          await this._processEntry(entry);
          // Mark completed
          const tx2 = db.transaction('syncQueue', 'readwrite');
          entry.status = 'completed';
          entry.completedAt = Date.now();
          await tx2.store.put(entry);
          await tx2.done;
        } catch (error) {
          const tx2 = db.transaction('syncQueue', 'readwrite');
          entry.retryCount = (entry.retryCount || 0) + 1;
          entry.lastError = error.message;
          if (entry.retryCount >= 5) {
            entry.status = 'failed';
          }
          await tx2.store.put(entry);
          await tx2.done;
          console.warn('[SyncQueue] Entry failed:', entry.id, error.message);
        }
      }

      // Clean up completed entries older than 24h
      await this._cleanupCompleted();
    } catch (e) {
      console.error('[SyncQueue] processQueue error:', e);
    } finally {
      this._processing = false;
      this._notify();
    }
  }

  // ═══ Process single entry ═══
  async _processEntry(entry) {
    const { type, entity, data } = entry;

    switch (entity) {
      case 'submission':
        if (type === 'create' || type === 'update') {
          // Upload any offline files first
          await this._uploadOfflineFiles(data);
          await api.saveSubmission(data);
        } else if (type === 'delete') {
          await api.deleteSubmission(data.id);
        }
        break;

      case 'template':
        if (type === 'create' || type === 'update') {
          await api.saveTemplate(data);
        } else if (type === 'delete') {
          await api.deleteTemplate(data.id);
        }
        break;

      case 'customer':
        if (type === 'create' || type === 'update') {
          await api.saveCustomer(data);
        } else if (type === 'delete') {
          await api.deleteCustomer(data.id);
        }
        break;

      case 'project':
        if (type === 'create' || type === 'update') {
          await api.saveProject(data);
        } else if (type === 'delete') {
          await api.deleteProject(data.id);
        }
        break;

      default:
        console.warn('[SyncQueue] Unknown entity:', entity);
    }
  }

  // ═══ Upload offline files (photos, signatures) ═══
  async _uploadOfflineFiles(data) {
    if (!data || !data._offlineFiles) return;
    try {
      const db = await getOfflineDb();
      for (const fileMeta of data._offlineFiles) {
        const fileData = await db.get('offlineFiles', fileMeta.path);
        if (fileData && fileData.base64) {
          await api.uploadBase64(fileMeta.bucket || 'submissions', fileMeta.path, fileData.base64);
          // Clean up offline file
          await db.delete('offlineFiles', fileMeta.path);
        }
      }
      // Remove offline files metadata from data
      delete data._offlineFiles;
    } catch (e) {
      console.warn('[SyncQueue] Upload offline files error:', e);
    }
  }

  // ═══ Queue status ═══
  async getQueueStatus() {
    try {
      const db = await getOfflineDb();
      const all = await db.getAll('syncQueue');
      const pending = all.filter(e => e.status === 'pending').length;
      const failed = all.filter(e => e.status === 'failed').length;
      const processing = this._processing;
      return { pending, failed, processing, total: pending + failed };
    } catch {
      return { pending: 0, failed: 0, processing: false, total: 0 };
    }
  }

  // ═══ Retry failed entries ═══
  async retryFailed() {
    try {
      const db = await getOfflineDb();
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const index = store.index('by-status');
      const failed = await index.getAll('failed');
      for (const entry of failed) {
        entry.status = 'pending';
        entry.retryCount = 0;
        entry.lastError = null;
        await store.put(entry);
      }
      await tx.done;
      this._notify();

      if (navigator.onLine) {
        this.processQueue();
      }
    } catch (e) {
      console.error('[SyncQueue] retryFailed error:', e);
    }
  }

  // ═══ Cleanup completed entries older than 24h ═══
  async _cleanupCompleted() {
    try {
      const db = await getOfflineDb();
      const all = await db.getAll('syncQueue');
      const cutoff = Date.now() - 86400000; // 24h
      const tx = db.transaction('syncQueue', 'readwrite');
      for (const entry of all) {
        if (entry.status === 'completed' && entry.completedAt && entry.completedAt < cutoff) {
          await tx.store.delete(entry.id);
        }
      }
      await tx.done;
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Singleton
export const syncQueue = new SyncQueueManager();
