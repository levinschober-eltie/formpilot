// ═══ FEATURE: Data Migration — localStorage -> Supabase (S05) ═══
// Migrates existing local data to Supabase after first cloud login.

import { storageGet } from './storage';
import { STORAGE_KEYS } from '../config/constants';
import * as api from './api';
import { isApiConfigured } from './api/client';

// NOTE: Migration metadata uses direct localStorage intentionally —
// these are simple flags/progress tracking, not user data needing IndexedDB backup.
const MIGRATION_KEY = 'fp_migration_completed';
const MIGRATION_PROGRESS_KEY = 'fp_migration_progress';

// ═══ Check if migration is needed ═══
export function needsMigration() {
  if (!isApiConfigured()) return false;
  if (localStorage.getItem(MIGRATION_KEY) === 'true') return false;

  // Check if there's local data to migrate
  const hasTemplates = !!localStorage.getItem(STORAGE_KEYS.templates);
  const hasSubmissions = !!localStorage.getItem(STORAGE_KEYS.submissions);
  const hasCustomers = !!localStorage.getItem(STORAGE_KEYS.customers);
  const hasProjects = !!localStorage.getItem(STORAGE_KEYS.projects);

  return hasTemplates || hasSubmissions || hasCustomers || hasProjects;
}

// ═══ Get migration progress (for resuming) ═══
function getMigrationProgress() {
  try {
    const raw = localStorage.getItem(MIGRATION_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveMigrationProgress(progress) {
  localStorage.setItem(MIGRATION_PROGRESS_KEY, JSON.stringify(progress));
}

// ═══ Main Migration Function ═══
export async function migrateToApi(onProgress = () => {}) {
  if (!isApiConfigured()) {
    return { migrated: {}, errors: ['Supabase nicht konfiguriert'] };
  }

  const result = {
    migrated: { templates: 0, submissions: 0, customers: 0, projects: 0, files: 0 },
    errors: [],
    total: 0,
    processed: 0,
  };

  const progress = getMigrationProgress();

  try {
    // 1. Templates
    const templates = (await storageGet(STORAGE_KEYS.templates)) || [];
    const submissions = (await storageGet(STORAGE_KEYS.submissions)) || [];
    const customers = (await storageGet(STORAGE_KEYS.customers)) || [];
    const projects = (await storageGet(STORAGE_KEYS.projects)) || [];

    result.total = templates.length + submissions.length + customers.length + projects.length;
    onProgress({ phase: 'counting', ...result });

    // 2. Migrate Templates
    onProgress({ phase: 'templates', ...result });
    for (const template of templates) {
      if (progress[`template_${template.id}`]) { result.migrated.templates++; result.processed++; continue; }
      try {
        await api.saveTemplate(template);
        result.migrated.templates++;
        progress[`template_${template.id}`] = true;
        saveMigrationProgress(progress);
      } catch (e) {
        result.errors.push(`Template "${template.name}": ${e.message}`);
      }
      result.processed++;
      onProgress({ phase: 'templates', ...result });
    }

    // 3. Migrate Customers
    onProgress({ phase: 'customers', ...result });
    for (const customer of customers) {
      if (progress[`customer_${customer.id}`]) { result.migrated.customers++; result.processed++; continue; }
      try {
        await api.saveCustomer(customer);
        result.migrated.customers++;
        progress[`customer_${customer.id}`] = true;
        saveMigrationProgress(progress);
      } catch (e) {
        result.errors.push(`Kunde "${customer.name}": ${e.message}`);
      }
      result.processed++;
      onProgress({ phase: 'customers', ...result });
    }

    // 4. Migrate Projects
    onProgress({ phase: 'projects', ...result });
    for (const project of projects) {
      if (progress[`project_${project.id}`]) { result.migrated.projects++; result.processed++; continue; }
      try {
        await api.saveProject(project);
        result.migrated.projects++;
        progress[`project_${project.id}`] = true;
        saveMigrationProgress(progress);
      } catch (e) {
        result.errors.push(`Projekt "${project.name}": ${e.message}`);
      }
      result.processed++;
      onProgress({ phase: 'projects', ...result });
    }

    // 5. Migrate Submissions (including Base64 file uploads)
    onProgress({ phase: 'submissions', ...result });
    for (const submission of submissions) {
      if (progress[`submission_${submission.id}`]) { result.migrated.submissions++; result.processed++; continue; }
      try {
        // Check for base64 data in submission fields (photos, signatures)
        const migratedData = await migrateSubmissionFiles(submission.data, submission.id);
        const migratedSub = { ...submission, data: migratedData };
        await api.saveSubmission(migratedSub);
        result.migrated.submissions++;
        progress[`submission_${submission.id}`] = true;
        saveMigrationProgress(progress);
      } catch (e) {
        result.errors.push(`Formular ${submission.id}: ${e.message}`);
      }
      result.processed++;
      onProgress({ phase: 'submissions', ...result });
    }

    // 6. Mark migration as complete
    if (result.errors.length === 0) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      localStorage.removeItem(MIGRATION_PROGRESS_KEY);
    }

    onProgress({ phase: 'done', ...result });
    return result;
  } catch (e) {
    result.errors.push(`Migration abgebrochen: ${e.message}`);
    onProgress({ phase: 'error', ...result });
    return result;
  }
}

// ═══ Migrate Base64 files in submission data to Supabase Storage ═══
async function migrateSubmissionFiles(data, submissionId) {
  if (!data || typeof data !== 'object') return data;
  const migrated = { ...data };

  for (const [key, value] of Object.entries(migrated)) {
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      // Single base64 image (signature, photo)
      try {
        const ext = value.match(/data:image\/(\w+)/)?.[1] || 'png';
        const path = `${submissionId}/${key}.${ext}`;
        await api.uploadBase64('submissions', path, value);
        migrated[key] = `storage:submissions/${path}`;
      } catch (e) {
        console.error(`File migration failed for ${key}:`, e);
        // Keep original base64 on failure
      }
    } else if (Array.isArray(value)) {
      // Array of images (photo field with multiple)
      const migratedArr = [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'string' && item.startsWith('data:image/')) {
          try {
            const ext = item.match(/data:image\/(\w+)/)?.[1] || 'png';
            const path = `${submissionId}/${key}_${i}.${ext}`;
            await api.uploadBase64('submissions', path, item);
            migratedArr.push(`storage:submissions/${path}`);
          } catch {
            migratedArr.push(item);
          }
        } else if (typeof item === 'object' && item !== null && item.data && typeof item.data === 'string' && item.data.startsWith('data:image/')) {
          try {
            const ext = item.data.match(/data:image\/(\w+)/)?.[1] || 'png';
            const path = `${submissionId}/${key}_${i}.${ext}`;
            await api.uploadBase64('submissions', path, item.data);
            migratedArr.push({ ...item, data: `storage:submissions/${path}` });
          } catch {
            migratedArr.push(item);
          }
        } else {
          migratedArr.push(item);
        }
      }
      migrated[key] = migratedArr;
    }
  }

  return migrated;
}

// ═══ Reset migration flag (for testing) ═══
export function resetMigrationFlag() {
  localStorage.removeItem(MIGRATION_KEY);
  localStorage.removeItem(MIGRATION_PROGRESS_KEY);
}
