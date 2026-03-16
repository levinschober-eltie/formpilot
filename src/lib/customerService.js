import { storageGet, storageSet } from './storage';
import { STORAGE_KEYS, CUSTOMER_FIELD_PATTERNS } from '../config/constants';

// ═══ FEATURE: Kunden-Service (Auto-Erkennung + Log) ═══

/**
 * Extrahiert Kundendaten aus einer Submission anhand der Feld-Labels.
 * Durchsucht alle Template-Felder nach bekannten Mustern (Kundenname, E-Mail, etc.)
 */
export const extractCustomerData = (submission, template) => {
  if (!template || !submission.data) return null;

  const allFields = template.pages.flatMap(p => p.fields);
  const result = { name: '', email: '', phone: '', address: '', project: '' };

  allFields.forEach(field => {
    const val = submission.data[field.id];
    if (!val || typeof val !== 'string' || !val.trim()) return;
    const label = (field.label || '').toLowerCase().trim();

    for (const [key, patterns] of Object.entries(CUSTOMER_FIELD_PATTERNS)) {
      if (!result[key] && patterns.some(p => label.includes(p))) {
        result[key] = val.trim();
        break;
      }
    }
  });

  // Mindestens ein Name oder Projekt muss vorhanden sein
  if (!result.name && !result.project) return null;

  return result;
};

/**
 * Sucht einen bestehenden Kunden anhand von Name oder Projekt (case-insensitive)
 */
export const findMatchingCustomer = (customers, extracted) => {
  if (!extracted) return null;
  const nameLower = (extracted.name || '').toLowerCase();
  const projectLower = (extracted.project || '').toLowerCase();

  return customers.find(c => {
    if (nameLower && c.name.toLowerCase() === nameLower) return true;
    if (nameLower && c.name.toLowerCase().includes(nameLower) && nameLower.length >= 3) return true;
    if (nameLower && nameLower.includes(c.name.toLowerCase()) && c.name.length >= 3) return true;
    return false;
  }) || null;
};

/**
 * Erstellt oder aktualisiert einen Kunden basierend auf Submission-Daten.
 * Gibt { customer, isNew, customers } zurück.
 */
export const processCustomerFromSubmission = async (submission, template) => {
  const extracted = extractCustomerData(submission, template);
  if (!extracted) return null;

  const customers = await storageGet(STORAGE_KEYS.customers) || [];
  let existing = findMatchingCustomer(customers, extracted);
  let isNew = false;

  if (existing) {
    // Kundendaten ergänzen (leere Felder füllen)
    let updated = false;
    if (!existing.email && extracted.email) { existing.email = extracted.email; updated = true; }
    if (!existing.phone && extracted.phone) { existing.phone = extracted.phone; updated = true; }
    if (!existing.address && extracted.address) { existing.address = extracted.address; updated = true; }
    if (extracted.project && !existing.projects?.includes(extracted.project)) {
      existing.projects = [...(existing.projects || []), extracted.project];
      updated = true;
    }
    // Submission verknüpfen
    if (!existing.submissionIds?.includes(submission.id)) {
      existing.submissionIds = [...(existing.submissionIds || []), submission.id];
      updated = true;
    }
    if (updated) {
      existing.updatedAt = new Date().toISOString();
      const idx = customers.findIndex(c => c.id === existing.id);
      if (idx >= 0) customers[idx] = existing;
    }
  } else {
    // Neuen Kunden erstellen
    existing = {
      id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: extracted.name || extracted.project,
      email: extracted.email || '',
      phone: extracted.phone || '',
      address: extracted.address || '',
      projects: extracted.project ? [extracted.project] : [],
      submissionIds: [submission.id],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customers.push(existing);
    isNew = true;
  }

  await storageSet(STORAGE_KEYS.customers, customers);
  return { customer: existing, isNew, customers };
};

/**
 * Aktivitätslog: Eintrag hinzufügen
 */
export const addActivityLog = async (entry) => {
  const log = await storageGet(STORAGE_KEYS.activityLog) || [];
  log.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...entry,
    createdAt: new Date().toISOString(),
  });
  // Max 1000 Einträge
  if (log.length > 1000) log.length = 1000;
  await storageSet(STORAGE_KEYS.activityLog, log);
  return log;
};

/**
 * Aktivitätslog für einen bestimmten Kunden oder eine Submission
 */
export const getActivityLog = async (filter = {}) => {
  const log = await storageGet(STORAGE_KEYS.activityLog) || [];
  if (filter.customerId) return log.filter(e => e.customerId === filter.customerId);
  if (filter.submissionId) return log.filter(e => e.submissionId === filter.submissionId);
  return log;
};

/**
 * Alle Kunden laden
 */
export const getCustomers = async () => {
  return await storageGet(STORAGE_KEYS.customers) || [];
};

/**
 * Kunden-Notizen aktualisieren
 */
export const updateCustomerNotes = async (customerId, notes) => {
  const customers = await storageGet(STORAGE_KEYS.customers) || [];
  const idx = customers.findIndex(c => c.id === customerId);
  if (idx >= 0) {
    customers[idx].notes = notes;
    customers[idx].updatedAt = new Date().toISOString();
    await storageSet(STORAGE_KEYS.customers, customers);
  }
  return customers;
};
