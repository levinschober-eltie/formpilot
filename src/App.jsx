import { useState, useEffect, useCallback } from 'react';
import { S } from './config/theme';
import { styles } from './styles/shared';
import { STORAGE_KEYS, USERS } from './config/constants';
import { DEMO_TEMPLATES } from './config/templates';
import { storageGet, storageSet } from './lib/storage';
import { LoginScreen } from './components/layout/LoginScreen';
import { SettingsScreen } from './components/layout/SettingsScreen';
import { SubmissionsList } from './components/layout/SubmissionsList';
import { SubmissionDetail } from './components/layout/SubmissionDetail';
import { TemplatesOverview } from './components/layout/TemplatesOverview';
import { DashboardScreen } from './components/layout/DashboardScreen';
import { TemplateSelector } from './components/filler/TemplateSelector';
import { FormFiller } from './components/filler/FormFiller';
import { FormBuilder } from './components/builder/FormBuilder';

// ═══ FormPilot Main App ═══
export default function FormPilot() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('fill');
  const [submissions, setSubmissions] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [fillingTemplate, setFillingTemplate] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fp_darkMode') === 'true');

  useEffect(() => {
    (async () => {
      const session = await storageGet(STORAGE_KEYS.session);
      if (session) { const u = USERS.find(u => u.id === session.userId); if (u) setUser(u); }
      const subs = await storageGet(STORAGE_KEYS.submissions); if (subs) setSubmissions(subs);
      const tpls = await storageGet(STORAGE_KEYS.templates); if (tpls) setCustomTemplates(tpls);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded && submissions.length > 0) storageSet(STORAGE_KEYS.submissions, submissions); }, [submissions, loaded]);

  useEffect(() => {
    localStorage.setItem('fp_darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = async (u) => { setUser(u); await storageSet(STORAGE_KEYS.session, { userId: u.id }); };
  const handleLogout = async () => { setUser(null); await storageSet(STORAGE_KEYS.session, null); };

  const handleStartFilling = async (template) => {
    const dk = `fp_draft_${template.id}_current`;
    const draft = await storageGet(dk);
    setDraftData(draft?.data && Object.keys(draft.data).length > 0 ? draft.data : null);
    setFillingTemplate(template);
  };

  const handleSubmitForm = async (data) => {
    const newSub = { id: 'sub-' + Date.now(), templateId: fillingTemplate.id, templateVersion: fillingTemplate.version, status: 'completed', data, filledBy: user.id, filledByName: user.name, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
    const updated = [...submissions, newSub]; setSubmissions(updated);
    await storageSet(STORAGE_KEYS.submissions, updated);
    await storageSet(`fp_draft_${fillingTemplate.id}_current`, null);
    setFillingTemplate(null); setDraftData(null); setTab('submissions');
  };

  const handleDeleteSubmission = useCallback(async (subId) => {
    const updated = submissions.filter(s => s.id !== subId);
    setSubmissions(updated);
    await storageSet(STORAGE_KEYS.submissions, updated);
    setViewingSubmission(null);
  }, [submissions]);

  const handleBuilderSave = async () => { const tpls = await storageGet(STORAGE_KEYS.templates) || []; setCustomTemplates(tpls); };
  const handleDeleteTemplate = async (id) => { const tpls = (await storageGet(STORAGE_KEYS.templates) || []).filter(t => t.id !== id); await storageSet(STORAGE_KEYS.templates, tpls); setCustomTemplates(tpls); };

  if (!loaded) return <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div><div style={{ color: S.colors.textSecondary }}>Laden...</div></div></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (builderTemplate) return <FormBuilder template={builderTemplate} onSave={handleBuilderSave} onClose={() => setBuilderTemplate(null)} />;

  const allTemplates = [...DEMO_TEMPLATES, ...customTemplates];

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'buero'] },
    { id: 'templates', label: 'Vorlagen', icon: '📑', roles: ['admin', 'buero'] },
    { id: 'fill', label: 'Ausfüllen', icon: '✏️', roles: ['admin', 'monteur'] },
    { id: 'submissions', label: 'Eingereicht', icon: '📥', roles: ['admin', 'monteur', 'buero'] },
    { id: 'settings', label: 'Mehr', icon: '⚙️', roles: ['admin', 'monteur', 'buero'] },
  ];
  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  const appStyle = darkMode ? {
    ...styles.app,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#e2e8f0',
  } : styles.app;

  return (
    <div style={appStyle} data-theme={darkMode ? 'dark' : 'light'}>
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
          />
        ) : (<>
          {tab === 'dashboard' && <DashboardScreen submissions={submissions} allTemplates={allTemplates} user={user} />}
          {tab === 'templates' && <TemplatesOverview user={user} onOpenBuilder={setBuilderTemplate} customTemplates={customTemplates} onDeleteTemplate={handleDeleteTemplate} />}
          {tab === 'fill' && <TemplateSelector onSelect={handleStartFilling} customTemplates={customTemplates} />}
          {tab === 'submissions' && <SubmissionsList submissions={submissions} user={user} allTemplates={allTemplates} onViewSubmission={setViewingSubmission} onDeleteSubmission={handleDeleteSubmission} />}
          {tab === 'settings' && <SettingsScreen user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(p => !p)} />}
        </>)}
      </div>
      {!fillingTemplate && !viewingSubmission && (
        <div style={styles.bottomNav}>
          {visibleNav.map(n => <button key={n.id} onClick={() => setTab(n.id)} style={styles.navItem(tab === n.id)}><span style={{ fontSize: '20px' }}>{n.icon}</span><span>{n.label}</span></button>)}
        </div>
      )}
    </div>
  );
}
