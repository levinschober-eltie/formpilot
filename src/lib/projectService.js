import { storageGet, storageSet } from './storage';
import { secureId } from './helpers';

// ═══ FEATURE: Project Service ═══

const STORAGE_KEY = 'fp_projects';

const generateId = (prefix) => secureId(prefix);

const DEFAULT_PHASES = [
  'Pachtvertrag',
  'Grundstückssicherung',
  'Bauleitplanung / Gemeinde',
  'Netzanschluss / Leitungswege',
  'Genehmigung',
  'Bauausführung',
  'Abnahme',
];

const SIMPLE_FIELD_TYPES = ['text', 'date', 'number', 'select'];

/**
 * Alle Projekte laden
 */
export const getProjects = async () => {
  return await storageGet(STORAGE_KEY) || [];
};

/**
 * Projekt speichern (upsert by id)
 */
export const saveProject = async (project) => {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  project.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  await storageSet(STORAGE_KEY, projects);
  return project;
};

/**
 * Projekt löschen
 */
export const deleteProject = async (projectId) => {
  const projects = (await getProjects()).filter(p => p.id !== projectId);
  await storageSet(STORAGE_KEY, projects);
  return projects;
};

/**
 * Neues Projekt erstellen mit Standard-Phasen für Bauleitplanung
 */
export const createProject = async (name, description = '') => {
  const now = new Date().toISOString();
  const project = {
    id: generateId('proj'),
    name,
    description,
    status: 'planning',
    createdAt: now,
    updatedAt: now,
    customerId: null,
    sharedData: {},
    phases: DEFAULT_PHASES.map((title, i) => ({
      id: generateId('phase'),
      title,
      description: '',
      templateId: null,
      submissionId: null,
      status: 'pending',
      order: i,
      dueDate: null,
    })),
  };
  return await saveProject(project);
};

/**
 * Shared Data aus einer Submission + Template extrahieren.
 * Gibt { fieldLabel: value } für alle einfachen Felder mit Wert zurück.
 */
export const extractSharedData = (submission, template) => {
  if (!template || !submission?.data) return {};

  const allFields = (template.pages || []).flatMap(p => p.fields || []);
  const result = {};

  allFields.forEach(field => {
    if (!SIMPLE_FIELD_TYPES.includes(field.type)) return;
    const val = submission.data[field.id];
    if (val === null || val === undefined || val === '') return;
    const label = (field.label || '').trim();
    if (!label) return;
    result[label] = val;
  });

  return result;
};

/**
 * Submission mit einer Phase verknüpfen.
 * Extrahiert Daten und merged sie in project.sharedData.
 */
export const linkSubmissionToPhase = async (projectId, phaseId, submissionId, template) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const phase = project.phases.find(ph => ph.id === phaseId);
  if (!phase) return null;

  phase.submissionId = submissionId;
  phase.status = 'completed';

  // Submission laden und Daten extrahieren
  const submissions = await storageGet('fp_submissions') || [];
  const submission = submissions.find(s => s.id === submissionId);
  if (submission && template) {
    const extracted = extractSharedData(submission, template);
    project.sharedData = { ...project.sharedData, ...extracted };
  }

  return await saveProject(project);
};

/**
 * AutoFill-Daten für ein Template aus den sharedData eines Projekts erstellen.
 * Gibt { fieldId: value } zurück, matching by label (case-insensitive, trimmed).
 */
export const buildAutoFillData = (project, template) => {
  if (!project?.sharedData || !template) return {};

  const allFields = (template.pages || []).flatMap(p => p.fields || []);
  const sharedLower = {};
  for (const [key, val] of Object.entries(project.sharedData)) {
    sharedLower[key.toLowerCase().trim()] = val;
  }

  const result = {};
  allFields.forEach(field => {
    const label = (field.label || '').toLowerCase().trim();
    if (label && sharedLower[label] !== undefined) {
      result[field.id] = sharedLower[label];
    }
  });

  return result;
};

/**
 * Phase zu einem Projekt hinzufügen
 */
export const addPhase = async (projectId, title, templateId = null) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const maxOrder = project.phases.length > 0
    ? Math.max(...project.phases.map(ph => ph.order))
    : -1;

  project.phases.push({
    id: generateId('phase'),
    title,
    description: '',
    templateId,
    submissionId: null,
    status: 'pending',
    order: maxOrder + 1,
    dueDate: null,
  });

  return await saveProject(project);
};

/**
 * Phase aus einem Projekt entfernen
 */
export const removePhase = async (projectId, phaseId) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  project.phases = project.phases.filter(ph => ph.id !== phaseId);
  return await saveProject(project);
};

/**
 * Phase-Eigenschaften aktualisieren
 */
export const updatePhase = async (projectId, phaseId, updates) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const phase = project.phases.find(ph => ph.id === phaseId);
  if (!phase) return null;

  Object.assign(phase, updates);
  return await saveProject(project);
};

/**
 * Phasen-Reihenfolge anhand neuer ID-Sortierung setzen
 */
export const reorderPhases = async (projectId, phaseIds) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const phaseMap = new Map(project.phases.map(ph => [ph.id, ph]));
  project.phases = phaseIds
    .map((id, i) => {
      const phase = phaseMap.get(id);
      if (phase) phase.order = i;
      return phase;
    })
    .filter(Boolean);

  return await saveProject(project);
};
