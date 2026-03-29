import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, USERS } from '../config/constants';
import { DEMO_TEMPLATES } from '../config/templates';
import { storageGet, storageSet } from '../lib/storage';
import { checkIntegrity, restoreFromBackup, createFullBackup } from '../lib/storageBackup';
import { getCustomers as fetchCustomers } from '../lib/customerService';
import { getProjects as fetchProjects, saveProject, deleteProject, createProject } from '../lib/projectService';
import { isApiConfigured } from '../lib/api/client';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children, externalProjects, externalCustomers, onSubmissionSave }) {
  const { loginFromStorage } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ═══ Load data on mount ═══
  useEffect(() => {
    (async () => {
      try {
        // Integrity check only if not using external data
        if (!externalProjects && !externalCustomers) {
          const integrity = await checkIntegrity();
          if (integrity.needsRestore) {
            console.warn(`[FormPilot] localStorage leer, stelle ${integrity.backupKeyCount} Keys aus Backup wieder her...`);
            await restoreFromBackup();
          }
        }

        if (!isApiConfigured() && !externalProjects && !externalCustomers) {
          const session = await storageGet(STORAGE_KEYS.session);
          if (session) {
            const u = USERS.find(u => u.id === session.userId);
            if (u) loginFromStorage(u);
          }
        }

        const subs = await storageGet(STORAGE_KEYS.submissions); if (subs) setSubmissions(subs);
        const tpls = await storageGet(STORAGE_KEYS.templates); if (tpls) setCustomTemplates(tpls);

        if (!externalCustomers) {
          const custs = await fetchCustomers(); setCustomers(custs);
        }
        if (!externalProjects) {
          const projs = await fetchProjects(); setProjects(projs);
        }

        if (!externalProjects && !externalCustomers) {
          createFullBackup().catch(() => {});
        }
      } catch (e) {
        console.error('Init load failed:', e);
      }
      setLoaded(true);
    })();
  }, [loginFromStorage, externalProjects, externalCustomers]);

  // ═══ Clear all data on logout ═══
  useEffect(() => {
    const handleLogout = () => {
      setSubmissions([]);
      setCustomTemplates([]);
      setCustomers([]);
      setProjects([]);
    };
    window.addEventListener('formpilot:logout', handleLogout);
    return () => window.removeEventListener('formpilot:logout', handleLogout);
  }, []);

  // ═══ Sync external data when props change ═══
  useEffect(() => {
    if (externalProjects) setProjects(externalProjects);
  }, [externalProjects]);

  useEffect(() => {
    if (externalCustomers) setCustomers(externalCustomers);
  }, [externalCustomers]);

  // ═══ Persist submissions ═══
  useEffect(() => { if (loaded) storageSet(STORAGE_KEYS.submissions, submissions); }, [submissions, loaded]);

  const allTemplates = useMemo(() => [...DEMO_TEMPLATES, ...customTemplates], [customTemplates]);

  // Active templates for "Ausfüllen" tab: only custom, active, not archived
  const activeTemplates = useMemo(() =>
    customTemplates.filter(t => t.isActive !== false && !t.isArchived),
    [customTemplates]
  );

  const refreshTemplates = useCallback(async () => {
    const tpls = await storageGet(STORAGE_KEYS.templates) || [];
    setCustomTemplates(tpls);
  }, []);

  // Update a single template's properties (active, roles, archive)
  const updateTemplate = useCallback(async (id, updates) => {
    const tpls = (await storageGet(STORAGE_KEYS.templates) || []).map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    await storageSet(STORAGE_KEYS.templates, tpls);
    setCustomTemplates(tpls);
  }, []);

  const handleDeleteTemplate = useCallback(async (id) => {
    if (!id) { await refreshTemplates(); return; }
    const tpls = (await storageGet(STORAGE_KEYS.templates) || []).filter(t => t.id !== id);
    await storageSet(STORAGE_KEYS.templates, tpls);
    setCustomTemplates(tpls);
  }, [refreshTemplates]);

  const handleCustomersChange = useCallback(async () => {
    if (externalCustomers) return; // External data managed by host
    const custs = await fetchCustomers();
    setCustomers(custs);
  }, [externalCustomers]);

  const refreshProjects = useCallback(async () => {
    if (externalProjects) return; // External data managed by host
    const projs = await fetchProjects();
    setProjects(projs);
  }, [externalProjects]);

  const handleCreateProject = useCallback(async (name) => {
    if (externalProjects) return null; // External data managed by host
    const proj = await createProject(name);
    await refreshProjects();
    return proj;
  }, [refreshProjects, externalProjects]);

  const value = useMemo(() => ({
    submissions, setSubmissions,
    customTemplates, allTemplates, activeTemplates,
    customers, setCustomers,
    projects, setProjects,
    loaded,
    refreshTemplates, updateTemplate, handleDeleteTemplate,
    handleCustomersChange,
    refreshProjects, handleCreateProject,
    saveProject, deleteProject,
    onSubmissionSave,
  }), [submissions, customTemplates, allTemplates, activeTemplates, customers, projects, loaded,
       refreshTemplates, updateTemplate, handleDeleteTemplate, handleCustomersChange, refreshProjects, handleCreateProject,
       onSubmissionSave]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
