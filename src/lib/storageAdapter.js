// ═══ FEATURE: Storage Adapter (S05) ═══
// Switches between localStorage and Supabase based on configuration.
// Provides the same API shape so the rest of the app doesn't need to know.

import { isSupabaseConfigured } from './supabase';
import { storageGet, storageSet } from './storage';
import * as supa from './supabaseService';
import { STORAGE_KEYS } from '../config/constants';

// ═══ Check mode ═══
export const useSupabase = () => isSupabaseConfigured();

// ═══ TEMPLATES ═══
export async function loadTemplates() {
  if (useSupabase()) {
    try {
      return await supa.getTemplates();
    } catch (e) {
      console.error('[StorageAdapter] Supabase templates load failed, falling back to localStorage:', e);
    }
  }
  return (await storageGet(STORAGE_KEYS.templates)) || [];
}

export async function saveTemplate(template) {
  if (useSupabase()) {
    try {
      return await supa.saveTemplate(template);
    } catch (e) {
      console.error('[StorageAdapter] Supabase template save failed:', e);
      throw e;
    }
  }
  // localStorage: update the templates array
  const templates = (await storageGet(STORAGE_KEYS.templates)) || [];
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) templates[idx] = template; else templates.push(template);
  await storageSet(STORAGE_KEYS.templates, templates);
  return template;
}

export async function deleteTemplate(id) {
  if (useSupabase()) {
    try {
      return await supa.deleteTemplate(id);
    } catch (e) {
      console.error('[StorageAdapter] Supabase template delete failed:', e);
      throw e;
    }
  }
  const templates = ((await storageGet(STORAGE_KEYS.templates)) || []).filter(t => t.id !== id);
  await storageSet(STORAGE_KEYS.templates, templates);
}

// ═══ SUBMISSIONS ═══
export async function loadSubmissions(filters = {}) {
  if (useSupabase()) {
    try {
      return await supa.getSubmissions(filters);
    } catch (e) {
      console.error('[StorageAdapter] Supabase submissions load failed, falling back:', e);
    }
  }
  return (await storageGet(STORAGE_KEYS.submissions)) || [];
}

export async function saveSubmission(submission) {
  if (useSupabase()) {
    try {
      return await supa.saveSubmission(submission);
    } catch (e) {
      console.error('[StorageAdapter] Supabase submission save failed:', e);
      throw e;
    }
  }
  const subs = (await storageGet(STORAGE_KEYS.submissions)) || [];
  const idx = subs.findIndex(s => s.id === submission.id);
  if (idx >= 0) subs[idx] = submission; else subs.push(submission);
  await storageSet(STORAGE_KEYS.submissions, subs);
  return submission;
}

export async function updateSubmissionStatus(id, status) {
  if (useSupabase()) {
    try {
      return await supa.updateSubmissionStatus(id, status);
    } catch (e) {
      console.error('[StorageAdapter] Supabase submission status update failed:', e);
      throw e;
    }
  }
  const subs = (await storageGet(STORAGE_KEYS.submissions)) || [];
  const updated = subs.map(s => s.id === id ? { ...s, status } : s);
  await storageSet(STORAGE_KEYS.submissions, updated);
  return updated.find(s => s.id === id);
}

export async function deleteSubmission(id) {
  if (useSupabase()) {
    try {
      return await supa.deleteSubmission(id);
    } catch (e) {
      console.error('[StorageAdapter] Supabase submission delete failed:', e);
      throw e;
    }
  }
  const subs = ((await storageGet(STORAGE_KEYS.submissions)) || []).filter(s => s.id !== id);
  await storageSet(STORAGE_KEYS.submissions, subs);
}

// ═══ CUSTOMERS ═══
export async function loadCustomers() {
  if (useSupabase()) {
    try {
      return await supa.getCustomers();
    } catch (e) {
      console.error('[StorageAdapter] Supabase customers load failed, falling back:', e);
    }
  }
  return (await storageGet(STORAGE_KEYS.customers)) || [];
}

export async function saveCustomer(customer) {
  if (useSupabase()) {
    try {
      return await supa.saveCustomer(customer);
    } catch (e) {
      console.error('[StorageAdapter] Supabase customer save failed:', e);
      throw e;
    }
  }
  const custs = (await storageGet(STORAGE_KEYS.customers)) || [];
  const idx = custs.findIndex(c => c.id === customer.id);
  if (idx >= 0) custs[idx] = customer; else custs.push(customer);
  await storageSet(STORAGE_KEYS.customers, custs);
  return customer;
}

export async function deleteCustomer(id) {
  if (useSupabase()) {
    try {
      return await supa.deleteCustomer(id);
    } catch (e) {
      console.error('[StorageAdapter] Supabase customer delete failed:', e);
      throw e;
    }
  }
  const custs = ((await storageGet(STORAGE_KEYS.customers)) || []).filter(c => c.id !== id);
  await storageSet(STORAGE_KEYS.customers, custs);
}

// ═══ PROJECTS ═══
export async function loadProjects() {
  if (useSupabase()) {
    try {
      return await supa.getProjects();
    } catch (e) {
      console.error('[StorageAdapter] Supabase projects load failed, falling back:', e);
    }
  }
  return (await storageGet(STORAGE_KEYS.projects)) || [];
}

export async function saveProject(project) {
  if (useSupabase()) {
    try {
      return await supa.saveProject(project);
    } catch (e) {
      console.error('[StorageAdapter] Supabase project save failed:', e);
      throw e;
    }
  }
  const projs = (await storageGet(STORAGE_KEYS.projects)) || [];
  const idx = projs.findIndex(p => p.id === project.id);
  if (idx >= 0) projs[idx] = project; else projs.push(project);
  await storageSet(STORAGE_KEYS.projects, projs);
  return project;
}

export async function deleteProject(id) {
  if (useSupabase()) {
    try {
      return await supa.deleteProject(id);
    } catch (e) {
      console.error('[StorageAdapter] Supabase project delete failed:', e);
      throw e;
    }
  }
  const projs = ((await storageGet(STORAGE_KEYS.projects)) || []).filter(p => p.id !== id);
  await storageSet(STORAGE_KEYS.projects, projs);
}

// ═══ FILE STORAGE ═══
export async function uploadFileData(bucket, path, base64) {
  if (useSupabase()) {
    try {
      return await supa.uploadBase64(bucket, path, base64);
    } catch (e) {
      console.error('[StorageAdapter] File upload failed:', e);
      throw e;
    }
  }
  // localStorage fallback: just return the base64 as-is (no upload)
  return base64;
}

export async function getFileData(bucket, pathOrBase64) {
  // If it's already a base64 string (localStorage mode), return as-is
  if (pathOrBase64 && pathOrBase64.startsWith('data:')) return pathOrBase64;
  if (useSupabase() && pathOrBase64) {
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
  if (useSupabase()) {
    try {
      return await supa.logActivity(action, entityType, entityId, details);
    } catch (e) {
      console.error('[StorageAdapter] Activity log failed:', e);
    }
  }
  // localStorage: activity log is handled by customerService already
}
