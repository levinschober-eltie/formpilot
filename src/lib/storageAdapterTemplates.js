// ═══ FEATURE: Storage Adapter — Templates ═══
// Split from storageAdapter.js for modularity.

import { storageGet, storageSet } from './storage';
import * as api from './api';
import { STORAGE_KEYS } from '../config/constants';
import { getOfflineDb, cacheTemplates, getCachedTemplates } from './offlineDb';
import { syncQueue } from './syncQueue';
import { isApiMode, isNetworkError } from './storageAdapterShared';

// ═══ TEMPLATES ═══
export async function loadTemplates() {
  if (isApiMode()) {
    try {
      const templates = await api.getTemplates();
      // Cache in IndexedDB for offline access
      cacheTemplates(templates).catch(() => {});
      return templates;
    } catch (e) {
      console.error('[StorageAdapter] API templates load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const cached = await getCachedTemplates();
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.templates)) || [];
}

export async function saveTemplate(template) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.saveTemplate(template);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveTemplateOffline(template);
        }
        console.error('[StorageAdapter] API template save failed:', e);
        throw e;
      }
    } else {
      return await _saveTemplateOffline(template);
    }
  }
  // localStorage: update the templates array
  const templates = (await storageGet(STORAGE_KEYS.templates)) || [];
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) templates[idx] = template; else templates.push(template);
  await storageSet(STORAGE_KEYS.templates, templates);
  return template;
}

async function _saveTemplateOffline(template) {
  const db = await getOfflineDb();
  await db.put('templates', template);
  await syncQueue.enqueue({
    type: template.id ? 'update' : 'create',
    entity: 'template',
    data: template,
  });
  return template;
}

export async function deleteTemplate(id) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.deleteTemplate(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'template', data: { id } });
          const db = await getOfflineDb();
          await db.delete('templates', id);
          return;
        }
        console.error('[StorageAdapter] API template delete failed:', e);
        throw e;
      }
    } else {
      await syncQueue.enqueue({ type: 'delete', entity: 'template', data: { id } });
      const db = await getOfflineDb();
      await db.delete('templates', id);
      return;
    }
  }
  const templates = ((await storageGet(STORAGE_KEYS.templates)) || []).filter(t => t.id !== id);
  await storageSet(STORAGE_KEYS.templates, templates);
}
