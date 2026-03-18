// ═══ FEATURE: Storage Adapter (S05) + Offline Fallback (S04) ═══
// Switches between localStorage and Supabase based on configuration.
// Falls back to IndexedDB offline storage when network is unavailable.

import { isSupabaseConfigured } from './supabase';
import { storageGet, storageSet } from './storage';
import * as supa from './supabaseService';
import { STORAGE_KEYS } from '../config/constants';
import { getOfflineDb, cacheTemplates, getCachedTemplates, cacheSubmissions, getCachedSubmissions } from './offlineDb';
import { syncQueue } from './syncQueue';

// ═══ Check mode ═══
export const isSupabaseMode = () => isSupabaseConfigured();

// ═══ Helper: check if error is a network error ═══
function isNetworkError(e) {
  if (!navigator.onLine) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('timeout') || msg.includes('aborted');
}

// ═══ TEMPLATES ═══
export async function loadTemplates() {
  if (isSupabaseMode()) {
    try {
      const templates = await supa.getTemplates();
      // Cache in IndexedDB for offline access
      cacheTemplates(templates).catch(() => {});
      return templates;
    } catch (e) {
      console.error('[StorageAdapter] Supabase templates load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const cached = await getCachedTemplates();
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.templates)) || [];
}

export async function saveTemplate(template) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.saveTemplate(template);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveTemplateOffline(template);
        }
        console.error('[StorageAdapter] Supabase template save failed:', e);
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
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.deleteTemplate(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'template', data: { id } });
          const db = await getOfflineDb();
          await db.delete('templates', id);
          return;
        }
        console.error('[StorageAdapter] Supabase template delete failed:', e);
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

// ═══ SUBMISSIONS ═══
export async function loadSubmissions(filters = {}) {
  if (isSupabaseMode()) {
    try {
      const submissions = await supa.getSubmissions(filters);
      // Cache in IndexedDB for offline access
      cacheSubmissions(submissions).catch(() => {});
      return submissions;
    } catch (e) {
      console.error('[StorageAdapter] Supabase submissions load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const cached = await getCachedSubmissions();
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.submissions)) || [];
}

export async function saveSubmission(submission) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        const saved = await supa.saveSubmission(submission);
        // Also cache locally
        const db = await getOfflineDb();
        await db.put('offlineSubmissions', saved);
        return saved;
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveSubmissionOffline(submission);
        }
        console.error('[StorageAdapter] Supabase submission save failed:', e);
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
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.updateSubmissionStatus(id, status);
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
        console.error('[StorageAdapter] Supabase submission status update failed:', e);
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
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.deleteSubmission(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'submission', data: { id } });
          const db = await getOfflineDb();
          await db.delete('offlineSubmissions', id);
          return;
        }
        console.error('[StorageAdapter] Supabase submission delete failed:', e);
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

// ═══ CUSTOMERS ═══
export async function loadCustomers() {
  if (isSupabaseMode()) {
    try {
      const customers = await supa.getCustomers();
      // Cache in IndexedDB
      const db = await getOfflineDb();
      const tx = db.transaction('customers', 'readwrite');
      for (const c of customers) { await tx.store.put(c); }
      await tx.done;
      return customers;
    } catch (e) {
      console.error('[StorageAdapter] Supabase customers load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const db = await getOfflineDb();
        const cached = await db.getAll('customers');
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.customers)) || [];
}

export async function saveCustomer(customer) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.saveCustomer(customer);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveCustomerOffline(customer);
        }
        console.error('[StorageAdapter] Supabase customer save failed:', e);
        throw e;
      }
    } else {
      return await _saveCustomerOffline(customer);
    }
  }
  const custs = (await storageGet(STORAGE_KEYS.customers)) || [];
  const idx = custs.findIndex(c => c.id === customer.id);
  if (idx >= 0) custs[idx] = customer; else custs.push(customer);
  await storageSet(STORAGE_KEYS.customers, custs);
  return customer;
}

async function _saveCustomerOffline(customer) {
  const db = await getOfflineDb();
  await db.put('customers', customer);
  await syncQueue.enqueue({
    type: customer.id ? 'update' : 'create',
    entity: 'customer',
    data: customer,
  });
  return customer;
}

export async function deleteCustomer(id) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.deleteCustomer(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'customer', data: { id } });
          const db = await getOfflineDb();
          await db.delete('customers', id);
          return;
        }
        console.error('[StorageAdapter] Supabase customer delete failed:', e);
        throw e;
      }
    } else {
      await syncQueue.enqueue({ type: 'delete', entity: 'customer', data: { id } });
      const db = await getOfflineDb();
      await db.delete('customers', id);
      return;
    }
  }
  const custs = ((await storageGet(STORAGE_KEYS.customers)) || []).filter(c => c.id !== id);
  await storageSet(STORAGE_KEYS.customers, custs);
}

// ═══ PROJECTS ═══
export async function loadProjects() {
  if (isSupabaseMode()) {
    try {
      const projects = await supa.getProjects();
      // Cache in IndexedDB
      const db = await getOfflineDb();
      const tx = db.transaction('projects', 'readwrite');
      for (const p of projects) { await tx.store.put(p); }
      await tx.done;
      return projects;
    } catch (e) {
      console.error('[StorageAdapter] Supabase projects load failed, trying offline cache:', e);
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
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.saveProject(project);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveProjectOffline(project);
        }
        console.error('[StorageAdapter] Supabase project save failed:', e);
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
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.deleteProject(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'project', data: { id } });
          const db = await getOfflineDb();
          await db.delete('projects', id);
          return;
        }
        console.error('[StorageAdapter] Supabase project delete failed:', e);
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

// ═══ FILE STORAGE ═══
export async function uploadFileData(bucket, path, base64) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.uploadBase64(bucket, path, base64);
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

  if (isSupabaseMode() && pathOrBase64) {
    try {
      return await supa.downloadAsBase64(bucket, pathOrBase64);
    } catch (e) {
      console.error('[StorageAdapter] File download failed:', e);
      return null;
    }
  }
  return pathOrBase64;
}

// ═══ ACTIVITY LOG ═══
export async function logActivity(action, entityType, entityId, details = {}) {
  if (isSupabaseMode()) {
    try {
      return await supa.logActivity(action, entityType, entityId, details);
    } catch (e) {
      console.error('[StorageAdapter] Activity log failed:', e);
    }
  }
  // localStorage: activity log is handled by customerService already
}
