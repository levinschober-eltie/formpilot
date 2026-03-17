import { useState, useEffect, useCallback, useMemo } from 'react';
import { S } from './config/theme';
import { styles } from './styles/shared';
import { STORAGE_KEYS, USERS } from './config/constants';
import { DEMO_TEMPLATES } from './config/templates';
import { storageGet, storageSet } from './lib/storage';
import { processCustomerFromSubmission, addActivityLog, getCustomers, removeSubmissionFromCustomer } from './lib/customerService';
import { getProjects, saveProject, deleteProject, createProject, linkSubmissionToPhase, buildAutoFillData } from './lib/projectService';
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
import { FormBuilder } from './components/builder/FormBuilder';

// ═══ FormPilot Main App ═══
export default function FormPilot() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('fill');
  const [submissions, setSubmissions] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fillingTemplate, setFillingTemplate] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [viewingProject, setViewingProject] = useState(null);
  const [fillingProjectContext, setFillingProjectContext] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fp_darkMode') === 'true');

  useEffect(() => {
    (async () => {
      const session = await storageGet(STORAGE_KEYS.session);
      if (session) { const u = USERS.find(u => u.id === session.userId); if (u) setUser(u); }
      const subs = await storageGet(STORAGE_KEYS.submissions); if (subs) setSubmissions(subs);
      const tpls = await storageGet(STORAGE_KEYS.templates); if (tpls) setCustomTemplates(tpls);
      const custs = await getCustomers(); setCustomers(custs);
      const projs = await getProjects(); setProjects(projs);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) storageSet(STORAGE_KEYS.submissions, submissions); }, [submissions, loaded]);

  useEffect(() => {
    localStorage.setItem('fp_darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = async (u) => { setUser(u); await storageSet(STORAGE_KEYS.session, { userId: u.id }); };
  const handleLogout = async () => { setUser(null); await storageSet(STORAGE_KEYS.session, null); };

  const handleStartFilling = async (template, projectContext = null) => {
    const dk = `fp_draft_${template.id}_current`;
    const draft = await storageGet(dk);
    let initial = draft?.data && Object.keys(draft.data).length > 0 ? draft.data : null;
    // Auto-Fill aus Projekt-Daten (Pacht, Gemeinde, etc. → gleiche Felder befüllen)
    if (projectContext) {
      const autoFill = buildAutoFillData(projectContext, template);
      initial = { ...autoFill, ...(initial || {}) }; // Draft hat Vorrang über AutoFill
      setFillingProjectContext(projectContext);
    } else {
      setFillingProjectContext(null);
    }
    setDraftData(initial);
    setFillingTemplate(template);
  };

  const allTemplates = useMemo(() => [...DEMO_TEMPLATES, ...customTemplates], [customTemplates]);

  const handleSubmitForm = async (data) => {
    const newSub = { id: 'sub-' + Date.now(), templateId: fillingTemplate.id, templateVersion: fillingTemplate.version, status: 'completed', data, filledBy: user.id, filledByName: user.name, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
    const updated = [...submissions, newSub]; setSubmissions(updated);
    await storageSet(STORAGE_KEYS.submissions, updated);
    await storageSet(`fp_draft_${fillingTemplate.id}_current`, null);

    // ═══ Auto-Kundenerstellung + Aktivitätslog ═══
    const template = allTemplates.find(t => t.id === fillingTemplate.id);
    if (template) {
      const result = await processCustomerFromSubmission(newSub, template);
      if (result) {
        setCustomers(result.customers);
        // Log: Vertrag erstellt
        await addActivityLog({
          action: 'submission_created',
          customerId: result.customer.id,
          submissionId: newSub.id,
          templateName: template.name,
          userName: user.name,
          details: `${template.name} ausgefüllt für ${result.customer.name}`,
        });
        // Log: Kunde erstellt oder aktualisiert
        await addActivityLog({
          action: result.isNew ? 'customer_created' : 'customer_updated',
          customerId: result.customer.id,
          submissionId: newSub.id,
          userName: user.name,
          details: result.isNew
            ? `Neuer Kontakt "${result.customer.name}" automatisch angelegt`
            : `Kontakt "${result.customer.name}" mit neuem Vertrag verknüpft`,
        });
      }
    }

    // ═══ Projekt-Verknüpfung (wenn aus Projekt heraus erstellt) ═══
    if (fillingProjectContext) {
      const proj = fillingProjectContext;
      // Finde die Phase die dieses Template verwendet und noch keine Submission hat
      const phase = proj.phases.find(p => p.templateId === fillingTemplate.id && !p.submissionId);
      if (phase) {
        const updatedProj = await linkSubmissionToPhase(proj.id, phase.id, newSub.id, template);
        if (updatedProj) {
          const projs = await getProjects(); setProjects(projs);
          setViewingProject(updatedProj);
        }
      }
    }

    setFillingTemplate(null); setDraftData(null); setFillingProjectContext(null);
    if (fillingProjectContext) { setTab('projects'); } else { setTab('submissions'); }
  };

  const handleStatusChange = useCallback(async (subId, newStatus) => {
    setSubmissions(prev => {
      const updated = prev.map(s => s.id === subId ? { ...s, status: newStatus } : s);
      storageSet(STORAGE_KEYS.submissions, updated);
      return updated;
    });
    setViewingSubmission(prev => prev?.id === subId ? { ...prev, status: newStatus } : prev);
  }, []);

  const handleDeleteSubmission = useCallback(async (subId) => {
    setSubmissions(prev => {
      const updated = prev.filter(s => s.id !== subId);
      storageSet(STORAGE_KEYS.submissions, updated);
      return updated;
    });
    // Kunde-Verknüpfung bereinigen + Log
    const result = await removeSubmissionFromCustomer(subId);
    if (result) {
      setCustomers(result.customers);
      await addActivityLog({
        action: 'submission_deleted',
        customerId: result.customerId,
        submissionId: subId,
        userName: user?.name,
        details: `Vertrag ${subId} gelöscht`,
      });
    }
    setViewingSubmission(null);
  }, [user]);

  const handleBuilderSave = async () => { const tpls = await storageGet(STORAGE_KEYS.templates) || []; setCustomTemplates(tpls); };
  const refreshTemplates = useCallback(async () => { const tpls = await storageGet(STORAGE_KEYS.templates) || []; setCustomTemplates(tpls); }, []);
  const handleDeleteTemplate = async (id) => {
    if (!id) { await refreshTemplates(); return; }
    const tpls = (await storageGet(STORAGE_KEYS.templates) || []).filter(t => t.id !== id); await storageSet(STORAGE_KEYS.templates, tpls); setCustomTemplates(tpls);
  };

  const handleCustomersChange = useCallback(async () => {
    const custs = await getCustomers();
    setCustomers(custs);
    setViewingCustomer(prev => prev ? custs.find(c => c.id === prev.id) || null : null);
  }, []);

  // ═══ Projekt-Handler ═══
  const refreshProjects = useCallback(async () => { const projs = await getProjects(); setProjects(projs); }, []);
  const handleCreateProject = useCallback(async (name) => {
    const proj = await createProject(name);
    await refreshProjects();
    setViewingProject(proj);
  }, [refreshProjects]);
  const handleProjectChange = useCallback(async (updated) => {
    if (updated._deleted) { await deleteProject(updated.id); setViewingProject(null); await refreshProjects(); return; }
    await saveProject(updated);
    setViewingProject(updated);
    await refreshProjects();
  }, [refreshProjects]);
  const handleStartFillingFromProject = useCallback((template, project) => {
    handleStartFilling(template, project);
  }, []);

  if (!loaded) return <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div><div style={{ color: S.colors.textSecondary }}>Laden...</div></div></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (builderTemplate) return <FormBuilder template={builderTemplate} onSave={handleBuilderSave} onClose={() => setBuilderTemplate(null)} />;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'buero'] },
    { id: 'projects', label: 'Projekte', icon: '🏗️', roles: ['admin', 'buero'] },
    { id: 'templates', label: 'Vorlagen', icon: '📑', roles: ['admin', 'buero'] },
    { id: 'fill', label: 'Ausfüllen', icon: '✏️', roles: ['admin', 'monteur'] },
    { id: 'submissions', label: 'Verträge', icon: '📥', roles: ['admin', 'monteur', 'buero'] },
    { id: 'customers', label: 'Kontakte', icon: '👥', roles: ['admin', 'buero'] },
    { id: 'settings', label: 'Mehr', icon: '⚙️', roles: ['admin', 'monteur', 'buero'] },
  ];
  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <div style={styles.logo}><span>📋</span><span>FormPilot</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: S.colors.textSecondary }}>{user.name}</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{user.name.split(' ').map(w => w[0]).join('')}</div>
        </div>
      </div>
      <div style={styles.main}>
        {fillingTemplate ? (
          <FormFiller template={fillingTemplate} onSubmit={handleSubmitForm} onCancel={() => { setFillingTemplate(null); setDraftData(null); }} initialData={draftData} draftId={`fp_draft_${fillingTemplate.id}_current`} />
        ) : viewingSubmission ? (
          <SubmissionDetail
            submission={viewingSubmission}
            template={allTemplates.find(t => t.id === viewingSubmission.templateId)}
            onBack={() => setViewingSubmission(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteSubmission}
          />
        ) : viewingProject ? (
          <ProjectDetail
            project={viewingProject}
            submissions={submissions}
            allTemplates={allTemplates}
            onBack={() => { setViewingProject(null); refreshProjects(); }}
            onProjectChange={handleProjectChange}
            onStartFilling={handleStartFillingFromProject}
          />
        ) : viewingCustomer ? (
          <CustomerDetail
            customer={viewingCustomer}
            submissions={submissions}
            allTemplates={allTemplates}
            onBack={() => { setViewingCustomer(null); handleCustomersChange(); }}
            onCustomersChange={handleCustomersChange}
          />
        ) : (<>
          {tab === 'dashboard' && <DashboardScreen submissions={submissions} allTemplates={allTemplates} user={user} />}
          {tab === 'projects' && <ProjectsScreen projects={projects} onSelectProject={setViewingProject} onCreateProject={handleCreateProject} />}
          {tab === 'templates' && <TemplatesOverview user={user} onOpenBuilder={setBuilderTemplate} customTemplates={customTemplates} onDeleteTemplate={handleDeleteTemplate} />}
          {tab === 'fill' && <TemplateSelector onSelect={handleStartFilling} customTemplates={customTemplates} />}
          {tab === 'submissions' && <SubmissionsList submissions={submissions} user={user} allTemplates={allTemplates} onViewSubmission={setViewingSubmission} onDeleteSubmission={handleDeleteSubmission} />}
          {tab === 'customers' && <CustomersScreen customers={customers} submissions={submissions} allTemplates={allTemplates} onSelectCustomer={setViewingCustomer} />}
          {tab === 'settings' && <SettingsScreen user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(p => !p)} />}
        </>)}
      </div>
      {!fillingTemplate && !viewingSubmission && !viewingCustomer && !viewingProject && (
        <div style={styles.bottomNav}>
          {visibleNav.map(n => <button key={n.id} onClick={() => setTab(n.id)} style={styles.navItem(tab === n.id)}><span style={{ fontSize: '20px' }}>{n.icon}</span><span>{n.label}</span></button>)}
        </div>
      )}
    </div>
  );
}
