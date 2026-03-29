import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { S } from './config/theme';
import { styles } from './styles/shared';
import { STORAGE_KEYS } from './config/constants';
import { storageGet, storageSet } from './lib/storage';
import { processCustomerFromSubmission, addActivityLog, removeSubmissionFromCustomer } from './lib/customerService';
import { linkSubmissionToPhase, buildAutoFillData } from './lib/projectService';
import { isApiConfigured } from './lib/api/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LoginScreen } from './components/layout/LoginScreen';
import { SettingsScreen } from './components/layout/SettingsScreen';
import { SubmissionsList } from './components/layout/SubmissionsList';
import { SubmissionDetail } from './components/layout/SubmissionDetail';
import { TemplatesOverview } from './components/layout/TemplatesOverview';
import { DashboardScreen } from './components/layout/DashboardScreen';
import { CustomersScreen } from './components/layout/CustomersScreen';
import { CustomerDetail } from './components/layout/CustomerDetail';
import { ProjectsScreen } from './components/layout/ProjectsScreen';
import { ProjectDetail } from './components/layout/ProjectDetail';
import { TemplateSelector } from './components/filler/TemplateSelector';
import { FormFiller } from './components/filler/FormFiller';
const FormBuilder = lazy(() => import('./components/builder/FormBuilder').then(m => ({ default: m.FormBuilder })));
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { InstallPrompt } from './components/common/InstallPrompt';
import { GlobalDialog } from './components/common/GlobalDialog';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { UpdateNotification } from './components/common/UpdateNotification';

// ═══ Nav Items (P4: outside render) ═══
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'buero'] },
  { id: 'projects', label: 'Projekte', icon: '🏗️', roles: ['admin', 'buero'] },
  { id: 'templates', label: 'Formulare', icon: '📑', roles: ['admin', 'buero'] },
  { id: 'fill', label: 'Ausfüllen', icon: '✏️', roles: ['admin', 'monteur', 'buero'] },
  { id: 'submissions', label: 'Verträge', icon: '📥', roles: ['admin', 'monteur', 'buero'] },
  { id: 'customers', label: 'Kontakte', icon: '👥', roles: ['admin', 'buero'] },
  { id: 'settings', label: 'Mehr', icon: '⚙️', roles: ['admin', 'monteur', 'buero'] },
];

const getDefaultTab = (role) => {
  const first = NAV_ITEMS.find(n => n.roles.includes(role));
  return first?.id || 'fill';
};

// ═══ Loading Screen (P4) ═══
const S_LOADING = { textAlign: 'center' };
const S_LOADING_ICON = { fontSize: '48px', marginBottom: '12px' };
const S_LOADING_TEXT = { color: 'var(--fp-text-secondary)' };

// ═══ Lazy Loading Fallback (P4) ═══
const LoadingFallback = () => (
  <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center' }}>
    <div style={S_LOADING}><div style={S_LOADING_ICON}>📋</div><div style={S_LOADING_TEXT}>Laden...</div></div>
  </div>
);

// ═══ FormPilot Inner (uses Contexts) ═══
function FormPilotInner({ hiddenTabs = [], embeddedMode = false, onNavigateToHost, customFieldTypes }) {
  const { user, authChecked, handleLogin } = useAuth();
  const {
    submissions, setSubmissions,
    allTemplates,
    customers, setCustomers,
    projects,
    loaded,
    refreshTemplates,
    handleCustomersChange,
    refreshProjects, handleCreateProject,
    saveProject, deleteProject,
  } = useData();

  // ═══ UI / Navigation State ═══
  const [tab, setTab] = useState('fill');
  const [fillingTemplate, setFillingTemplate] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [fillingProjectContext, setFillingProjectContext] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fp_darkMode') === 'true');

  // ═══ Set default tab when user changes ═══
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setTab(getDefaultTab(user.role));
  }, [user]);

  // ═══ Dark mode persistence ═══
  useEffect(() => {
    localStorage.setItem('fp_darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ═══ Sync viewingCustomer when customers list refreshes ═══
  useEffect(() => {
    if (viewingCustomer) {
      const updated = customers.find(c => c.id === viewingCustomer.id);
      /* eslint-disable react-hooks/set-state-in-effect */
      if (!updated) setViewingCustomer(null);
      else if (updated !== viewingCustomer) setViewingCustomer(updated);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [customers, viewingCustomer]);

  // ═══ Login wrapper (sets tab after auth context login) ═══
  const onLogin = useCallback(async (u) => {
    await handleLogin(u);
    setTab(getDefaultTab(u.role));
  }, [handleLogin]);

  const handleStartFilling = useCallback(async (template, projectContext = null, phaseId = null) => {
    const dk = `fp_draft_${template.id}_current`;
    const draft = await storageGet(dk);
    let initial = draft?.data && Object.keys(draft.data).length > 0 ? draft.data : null;
    // Auto-Fill aus Projekt-Daten (Pacht, Gemeinde, etc. → gleiche Felder befüllen)
    if (projectContext) {
      const autoFill = buildAutoFillData(projectContext, template);
      initial = { ...autoFill, ...(initial || {}) }; // Draft hat Vorrang über AutoFill
      setFillingProjectContext({ ...projectContext, _targetPhaseId: phaseId });
    } else {
      setFillingProjectContext(null);
    }
    setDraftData(initial);
    setFillingTemplate(template);
  }, []);

  const handleSubmitForm = useCallback(async (data) => {
    const newSub = { id: 'sub-' + Date.now(), templateId: fillingTemplate.id, templateVersion: fillingTemplate.version, status: 'completed', data, filledBy: user.id, filledByName: user.name, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
    const updated = [...submissions, newSub]; setSubmissions(updated);
    await storageSet(STORAGE_KEYS.submissions, updated);
    await storageSet(`fp_draft_${fillingTemplate.id}_current`, null);

    // ═══ Auto-Kundenerstellung + Aktivitaetslog ═══
    const template = allTemplates.find(t => t.id === fillingTemplate.id);
    if (template) {
      const result = await processCustomerFromSubmission(newSub, template);
      if (result) {
        setCustomers(result.customers);
        await addActivityLog({
          action: 'submission_created',
          customerId: result.customer.id,
          submissionId: newSub.id,
          templateName: template.name,
          userName: user.name,
          details: `${template.name} ausgefuellt fuer ${result.customer.name}`,
        });
        await addActivityLog({
          action: result.isNew ? 'customer_created' : 'customer_updated',
          customerId: result.customer.id,
          submissionId: newSub.id,
          userName: user.name,
          details: result.isNew
            ? `Neuer Kontakt "${result.customer.name}" automatisch angelegt`
            : `Kontakt "${result.customer.name}" mit neuem Vertrag verknuepft`,
        });
      }
    }

    // ═══ Projekt-Verknuepfung (wenn aus Projekt heraus erstellt) ═══
    const projCtx = fillingProjectContext;
    if (projCtx && template) {
      const phaseId = projCtx._targetPhaseId;
      const phase = phaseId
        ? projCtx.phases.find(p => p.id === phaseId)
        : projCtx.phases.find(p => p.templateId === fillingTemplate.id && !p.submissionId);
      if (phase) {
        const updatedProj = await linkSubmissionToPhase(projCtx.id, phase.id, newSub.id, template);
        if (updatedProj) {
          await refreshProjects();
          setViewingProject(updatedProj);
        }
      }
    }

    setFillingTemplate(null); setDraftData(null); setFillingProjectContext(null);
    if (projCtx) { setTab('projects'); } else { setTab('submissions'); }
  }, [fillingTemplate, fillingProjectContext, submissions, allTemplates, user, setSubmissions, setCustomers, refreshProjects]);

  const handleStatusChange = useCallback(async (subId, newStatus) => {
    setSubmissions(prev => {
      const updated = prev.map(s => s.id === subId ? { ...s, status: newStatus } : s);
      storageSet(STORAGE_KEYS.submissions, updated);
      return updated;
    });
    setViewingSubmission(prev => prev?.id === subId ? { ...prev, status: newStatus } : prev);
  }, [setSubmissions]);

  const handleDeleteSubmission = useCallback(async (subId) => {
    setSubmissions(prev => {
      const updated = prev.filter(s => s.id !== subId);
      storageSet(STORAGE_KEYS.submissions, updated);
      return updated;
    });
    // Kunde-Verknuepfung bereinigen + Log
    const result = await removeSubmissionFromCustomer(subId);
    if (result) {
      setCustomers(result.customers);
      await addActivityLog({
        action: 'submission_deleted',
        customerId: result.customerId,
        submissionId: subId,
        userName: user?.name,
        details: `Vertrag ${subId} geloescht`,
      });
    }
    // Clean up dangling project phase references
    let projChanged = false;
    for (const proj of projects) {
      const phase = proj.phases?.find(p => p.submissionId === subId);
      if (phase) {
        phase.submissionId = null;
        phase.status = 'pending';
        await saveProject(proj);
        projChanged = true;
      }
    }
    if (projChanged) await refreshProjects();
    setViewingSubmission(null);
  }, [user, projects, setSubmissions, setCustomers, saveProject, refreshProjects]);

  const handleBuilderSave = useCallback(async () => { await refreshTemplates(); }, [refreshTemplates]);

  // ═══ Projekt-Handler ═══
  const handleCreateProjectAndView = useCallback(async (name) => {
    const proj = await handleCreateProject(name);
    setViewingProject(proj);
  }, [handleCreateProject]);

  const handleProjectChange = useCallback(async (updated) => {
    if (updated._deleted) { await deleteProject(updated.id); setViewingProject(null); await refreshProjects(); return; }
    await saveProject(updated);
    setViewingProject(updated);
    await refreshProjects();
  }, [saveProject, deleteProject, refreshProjects]);

  const handleStartFillingFromProject = useCallback((template, project, phaseId) => {
    handleStartFilling(template, project, phaseId);
  }, [handleStartFilling]);

  const visibleNav = useMemo(() => {
    let items = user ? NAV_ITEMS.filter(n => n.roles.includes(user.role)) : [];
    if (hiddenTabs.length > 0) items = items.filter(n => !hiddenTabs.includes(n.id));
    return items;
  }, [user, hiddenTabs]);

  // ═══ Loading state — wait for both data and auth check ═══
  const isLoading = !loaded || (isApiConfigured() && !authChecked);
  if (isLoading) return <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center' }}><div style={S_LOADING}><div style={S_LOADING_ICON}>📋</div><div style={S_LOADING_TEXT}>Laden...</div></div></div>;
  if (!user) return <><LoginScreen onLogin={onLogin} /><GlobalDialog /></>;
  if (builderTemplate) return <><ErrorBoundary><Suspense fallback={<LoadingFallback />}><FormBuilder template={builderTemplate} onSave={handleBuilderSave} onClose={() => setBuilderTemplate(null)} /></Suspense></ErrorBoundary><GlobalDialog /></>;

  return (
    <div style={styles.app}>
      <OfflineIndicator />
      <div style={embeddedMode ? { ...styles.topBar, padding: '8px 16px', minHeight: 44 } : styles.topBar}>
        {embeddedMode && onNavigateToHost ? (
          <button onClick={onNavigateToHost} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: S.colors.primary, fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
            <span style={{ fontSize: '18px' }}>←</span>
            <span>Zurück</span>
          </button>
        ) : (
          <div style={styles.logo}><span>📋</span><span>FormPilot</span></div>
        )}
        {!embeddedMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: S.colors.textSecondary }}>{user.name}</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{user.name.split(' ').map(w => w[0]).join('')}</div>
          </div>
        )}
      </div>
      <div style={styles.main}>
        {fillingTemplate ? (
          <ErrorBoundary>
            <FormFiller template={fillingTemplate} onSubmit={handleSubmitForm} onCancel={() => { setFillingTemplate(null); setDraftData(null); setFillingProjectContext(null); }} initialData={draftData} draftId={`fp_draft_${fillingTemplate.id}_current`} customFieldTypes={customFieldTypes} />
          </ErrorBoundary>
        ) : viewingSubmission ? (
          <ErrorBoundary>
            <SubmissionDetail
              submission={viewingSubmission}
              template={allTemplates.find(t => t.id === viewingSubmission.templateId)}
              onBack={() => setViewingSubmission(null)}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteSubmission}
            />
          </ErrorBoundary>
        ) : viewingProject ? (
          <ErrorBoundary>
            <ProjectDetail
              project={viewingProject}
              onBack={() => { setViewingProject(null); refreshProjects(); }}
              onProjectChange={handleProjectChange}
              onStartFilling={handleStartFillingFromProject}
            />
          </ErrorBoundary>
        ) : viewingCustomer ? (
          <ErrorBoundary>
            <CustomerDetail
              customer={viewingCustomer}
              onBack={() => { setViewingCustomer(null); handleCustomersChange(); }}
            />
          </ErrorBoundary>
        ) : (<>
          {tab === 'dashboard' && <ErrorBoundary><DashboardScreen /></ErrorBoundary>}
          {tab === 'projects' && <ErrorBoundary><ProjectsScreen onSelectProject={setViewingProject} onCreateProject={handleCreateProjectAndView} /></ErrorBoundary>}
          {tab === 'templates' && <ErrorBoundary><TemplatesOverview onOpenBuilder={setBuilderTemplate} onStartFilling={handleStartFilling} /></ErrorBoundary>}
          {tab === 'fill' && <ErrorBoundary><TemplateSelector onSelect={handleStartFilling} /></ErrorBoundary>}
          {tab === 'submissions' && <ErrorBoundary><SubmissionsList onViewSubmission={setViewingSubmission} onDeleteSubmission={handleDeleteSubmission} /></ErrorBoundary>}
          {tab === 'customers' && <ErrorBoundary><CustomersScreen onSelectCustomer={setViewingCustomer} /></ErrorBoundary>}
          {tab === 'settings' && <ErrorBoundary><SettingsScreen darkMode={darkMode} onToggleDarkMode={() => setDarkMode(p => !p)} /></ErrorBoundary>}
        </>)}
      </div>
      {!fillingTemplate && !viewingSubmission && !viewingCustomer && !viewingProject && (
        <div style={styles.bottomNav}>
          {visibleNav.map(n => <button key={n.id} onClick={() => setTab(n.id)} style={styles.navItem(tab === n.id)}><span style={{ fontSize: '20px' }}>{n.icon}</span><span>{n.label}</span></button>)}
        </div>
      )}
      <InstallPrompt />
      <UpdateNotification />
      <GlobalDialog />
    </div>
  );
}

// ═══ FormPilot Root (Provider Shell) ═══
export default function FormPilot({ hiddenTabs = [], embeddedMode = false, onNavigateToHost, initialUser, customFieldTypes, externalProjects, externalCustomers, onSubmissionSave } = {}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <DataProvider externalProjects={externalProjects} externalCustomers={externalCustomers} onSubmissionSave={onSubmissionSave}>
        <FormPilotInner hiddenTabs={hiddenTabs} embeddedMode={embeddedMode} onNavigateToHost={onNavigateToHost} customFieldTypes={customFieldTypes} />
      </DataProvider>
    </AuthProvider>
  );
}
