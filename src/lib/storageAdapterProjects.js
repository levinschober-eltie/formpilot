// ═══ FEATURE: Storage Adapter — Projects ═══
// Split from storageAdapter.js for modularity.

import { storageGet, storageSet } from './storage';
import * as api from './api';
import { STORAGE_KEYS } from '../config/constants';
import { getOfflineDb } from './offlineDb';
import { syncQueue } from './syncQueue';
import { isApiMode, isNetworkError } from './storageAdapterShared';

// ═══ PROJECTS ═══
export async function loadProjects() {
  if (isApiMode()) {
    try {
      const projects = await api.getProjects();
      // Cache in IndexedDB
      const db = await getOfflineDb();
      const tx = db.transaction('projects', 'readwrite');
      for (const p of projects) { await tx.store.put(p); }
      await tx.done;
      return projects;
    } catch (e) {
      console.error('[StorageAdapter] API projects load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const db = await getOfflineDb();
        const cached = await db.getAll('projects');
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.projects)) || [];
}

export async function saveProject(project) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.saveProject(project);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveProjectOffline(project);
        }
        console.error('[StorageAdapter] API project save failed:', e);
        throw e;
      }
    } else {
      return await _saveProjectOffline(project);
    }
  }
  const projs = (await storageGet(STORAGE_KEYS.projects)) || [];
  const idx = projs.findIndex(p => p.id === project.id);
  if (idx >= 0) projs[idx] = project; else projs.push(project);
  await storageSet(STORAGE_KEYS.projects, projs);
  return project;
}

async function _saveProjectOffline(project) {
  const db = await getOfflineDb();
  await db.put('projects', project);
  await syncQueue.enqueue({
    type: project.id ? 'update' : 'create',
    entity: 'project',
    data: project,
  });
  return project;
}

export async function deleteProject(id) {
  if (isApiMode()) {
    if (navigator.onLine) {
      try {
        return await api.deleteProject(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'project', data: { id } });
          const db = await getOfflineDb();
          await db.delete('projects', id);
          return;
        }
        console.error('[StorageAdapter] API project delete failed:', e);
        throw e;
      }
    } else {
      await syncQueue.enqueue({ type: 'delete', entity: 'project', data: { id } });
      const db = await getOfflineDb();
      await db.delete('projects', id);
      return;
    }
  }
  const projs = ((await storageGet(STORAGE_KEYS.projects)) || []).filter(p => p.id !== id);
  await storageSet(STORAGE_KEYS.projects, projs);
}
