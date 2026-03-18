import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, USERS } from '../config/constants';
import { DEMO_TEMPLATES } from '../config/templates';
import { storageGet, storageSet } from '../lib/storage';
import { checkIntegrity, restoreFromBackup, createFullBackup } from '../lib/storageBackup';
import { getCustomers as fetchCustomers } from '../lib/customerService';
import { getProjects as fetchProjects, saveProject, deleteProject, createProject } from '../lib/projectService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
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
        // ═══ Integrity Check: Auto-Recovery from IndexedDB if localStorage wiped ═══
        const integrity = await checkIntegrity();
        if (integrity.needsRestore) {
          console.warn(`[FormPilot] localStorage leer, stelle ${integrity.backupKeyCount} Keys aus Backup wieder her...`);
          await restoreFromBackup();
        }

        // If not using Supabase, load session from localStorage
        if (!isSupabaseConfigured()) {
          const session = await storageGet(STORAGE_KEYS.session);
          if (session) {
            const u = USERS.find(u => u.id === session.userId);
            if (u) loginFromStorage(u);
          }
        }

        const subs = await storageGet(STORAGE_KEYS.submissions); if (subs) setSubmissions(subs);
        const tpls = await storageGet(STORAGE_KEYS.templates); if (tpls) setCustomTemplates(tpls);
        const custs = await fetchCustomers(); setCustomers(custs);
        const projs = await fetchProjects(); setProjects(projs);

        // Create full backup after successful load
        createFullBackup().catch(() => {});
      } catch (e) {
        console.error('Init load failed:', e);
      }
      setLoaded(true);
    })();
  }, [loginFromStorage]);

  // ═══ Persist submissions ═══
  useEffect(() => { if (loaded) storageSet(STORAGE_KEYS.submissions, submissions); }, [submissions, loaded]);

  const allTemplates = useMemo(() => [...DEMO_TEMPLATES, ...customTemplates], [customTemplates]);

  const refreshTemplates = useCallback(async () => {
    const tpls = await storageGet(STORAGE_KEYS.templates) || [];
    setCustomTemplates(tpls);
  }, []);

  const handleDeleteTemplate = useCallback(async (id) => {
    if (!id) { await refreshTemplates(); return; }
    const tpls = (await storageGet(STORAGE_KEYS.templates) || []).filter(t => t.id !== id);
    await storageSet(STORAGE_KEYS.templates, tpls);
    setCustomTemplates(tpls);
  }, [refreshTemplates]);

  const handleCustomersChange = useCallback(async () => {
    const custs = await fetchCustomers();
    setCustomers(custs);
  }, []);

  const refreshProjects = useCallback(async () => {
    const projs = await fetchProjects();
    setProjects(projs);
  }, []);

  const handleCreateProject = useCallback(async (name) => {
    const proj = await createProject(name);
    await refreshProjects();
    return proj;
  }, [refreshProjects]);

  const value = useMemo(() => ({
    submissions, setSubmissions,
    customTemplates, allTemplates,
    customers, setCustomers,
    projects, setProjects,
    loaded,
    refreshTemplates, handleDeleteTemplate,
    handleCustomersChange,
    refreshProjects, handleCreateProject,
    saveProject, deleteProject,
  }), [submissions, customTemplates, allTemplates, customers, projects, loaded,
       refreshTemplates, handleDeleteTemplate, handleCustomersChange, refreshProjects, handleCreateProject]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
