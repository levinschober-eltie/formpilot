import React, { useState, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { S, CATEGORY_COLORS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';
import { STORAGE_KEYS, ROLES } from '../../config/constants';
import { createEmptyTemplate, secureId } from '../../lib/helpers';
import { storageGet, storageSet } from '../../lib/storage';
import { ToastMessage } from '../common/ToastMessage';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
const AIFormGenerator = lazy(() => import('../builder/AIFormGenerator').then(m => ({ default: m.AIFormGenerator })));

// ═══ Extracted Styles (P4) ═══
const S_TOOLBAR = { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' };
const S_SECTION = { fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const S_CARDS = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' };
const S_ACTIVE_PILL = (active) => ({
  display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '9999px',
  fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
  background: active ? '#22c55e18' : `${S.colors.textMuted}15`,
  color: active ? '#16a34a' : S.colors.textMuted,
  transition: S.transition,
});
const S_ROLE_CHIP = (active) => ({
  display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px',
  fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: `1px solid ${active ? S.colors.primary : S.colors.border}`,
  background: active ? `${S.colors.primary}12` : 'transparent',
  color: active ? S.colors.primary : S.colors.textMuted,
  fontFamily: 'inherit', transition: S.transition,
});
const S_ROLES_ROW = { display: 'flex', gap: '4px', alignItems: 'center', marginTop: '6px' };
const S_ROLES_LABEL = { fontSize: '11px', color: S.colors.textMuted, marginRight: '2px' };
const S_ARCHIVE_TOGGLE = {
  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
  border: 'none', background: 'none', fontFamily: 'inherit', padding: '0',
  fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary,
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
};
const S_CARD_BASE = { ...styles.card, display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 20px' };
const S_ACTIONS = { display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' };

const ALL_ROLES = ['admin', 'monteur', 'buero'];

export const TemplatesOverview = React.memo(({ onOpenBuilder, onStartFilling }) => {
  const { user } = useAuth();
  const { customTemplates, handleDeleteTemplate: onDeleteTemplate, updateTemplate } = useData();
  const [toast, setToast] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showDemos, setShowDemos] = useState(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const fileInputRef = useRef(null);

  // ═══ Split templates into sections ═══
  const activeList = useMemo(() =>
    (customTemplates || []).filter(t => t.isActive !== false && !t.isArchived),
    [customTemplates]
  );
  const inactiveList = useMemo(() =>
    (customTemplates || []).filter(t => t.isActive === false && !t.isArchived),
    [customTemplates]
  );
  const archivedList = useMemo(() =>
    (customTemplates || []).filter(t => t.isArchived),
    [customTemplates]
  );

  // ═══ Template Actions ═══
  const handleToggleActive = useCallback((t) => {
    const newActive = t.isActive === false;
    updateTemplate(t.id, { isActive: newActive });
    setToast({ message: `"${t.name}" ${newActive ? 'aktiviert' : 'deaktiviert'}`, type: 'success' });
  }, [updateTemplate]);

  const handleToggleRole = useCallback((t, roleId) => {
    const current = t.visibleForRoles || ALL_ROLES;
    const newRoles = current.includes(roleId)
      ? current.filter(r => r !== roleId)
      : [...current, roleId];
    if (newRoles.length === 0) {
      setToast({ message: 'Mindestens eine Rolle erforderlich', type: 'error' });
      return;
    }
    updateTemplate(t.id, { visibleForRoles: newRoles });
  }, [updateTemplate]);

  const handleArchive = useCallback(async (t) => {
    const yes = await confirm({ title: 'Formular archivieren?', message: `"${t.name}" wird archiviert und ist nicht mehr zum Ausfüllen verfügbar.`, confirmLabel: 'Archivieren' });
    if (yes) {
      updateTemplate(t.id, { isArchived: true, isActive: false });
      setToast({ message: `"${t.name}" archiviert`, type: 'success' });
    }
  }, [confirm, updateTemplate]);

  const handleUnarchive = useCallback((t) => {
    updateTemplate(t.id, { isArchived: false, isActive: false });
    setToast({ message: `"${t.name}" wiederhergestellt (inaktiv)`, type: 'success' });
  }, [updateTemplate]);

  const handleDelete = useCallback(async (t) => {
    const yes = await confirm({ title: 'Formular löschen?', message: `"${t.name}" wird unwiderruflich gelöscht.`, confirmLabel: 'Löschen', variant: 'danger' });
    if (yes) {
      onDeleteTemplate(t.id);
      setToast({ message: `"${t.name}" gelöscht`, type: 'success' });
    }
  }, [confirm, onDeleteTemplate]);

  const handleDuplicate = useCallback(async (t) => {
    const copy = JSON.parse(JSON.stringify(t));
    copy.id = secureId('tpl');
    copy.name = `${t.name} (Kopie)`;
    copy.version = 1;
    copy.isActive = false;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(copy);
    await storageSet(STORAGE_KEYS.templates, existing);
    onDeleteTemplate(null); // triggers refresh
    setToast({ message: `"${copy.name}" erstellt (inaktiv)`, type: 'success' });
  }, [onDeleteTemplate]);

  const handleExport = useCallback((t) => {
    const data = JSON.parse(JSON.stringify(t));
    delete data.isDemo;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(t.name || 'formular').replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '')}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast({ message: 'Formular exportiert', type: 'success' });
  }, []);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const tpl = JSON.parse(text);
      if (!tpl.pages || !Array.isArray(tpl.pages)) throw new Error('Ungültiges Format');
      tpl.id = secureId('tpl');
      tpl.name = tpl.name ? `${tpl.name} (Import)` : 'Importiertes Formular';
      tpl.version = 1;
      tpl.isDemo = false;
      tpl.isActive = false;
      tpl.visibleForRoles = [...ALL_ROLES];
      tpl.createdAt = new Date().toISOString();
      tpl.updatedAt = new Date().toISOString();
      const existing = await storageGet(STORAGE_KEYS.templates) || [];
      existing.push(tpl);
      await storageSet(STORAGE_KEYS.templates, existing);
      onDeleteTemplate(null);
      setToast({ message: `"${tpl.name}" importiert (inaktiv)`, type: 'success' });
    } catch {
      setToast({ message: 'Import fehlgeschlagen — ungültiges JSON', type: 'error' });
    }
    e.target.value = '';
  }, [onDeleteTemplate]);

  const handleActivateDemo = useCallback(async (demo) => {
    const copy = JSON.parse(JSON.stringify(demo));
    copy.id = secureId('tpl');
    copy.isDemo = false;
    copy.isActive = true;
    copy.visibleForRoles = [...ALL_ROLES];
    copy.version = 1;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(copy);
    await storageSet(STORAGE_KEYS.templates, existing);
    onDeleteTemplate(null);
    setToast({ message: `"${copy.name}" als Formular aktiviert`, type: 'success' });
  }, [onDeleteTemplate]);

  const handleAISaveAndOpen = useCallback(async (template) => {
    template.isActive = false;
    template.visibleForRoles = [...ALL_ROLES];
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(template);
    await storageSet(STORAGE_KEYS.templates, existing);
    onDeleteTemplate(null);
    setShowAIGenerator(false);
    onOpenBuilder(template);
  }, [onOpenBuilder, onDeleteTemplate]);

  const handleAIDirectUse = useCallback(async (template) => {
    template.isActive = true;
    template.visibleForRoles = [...ALL_ROLES];
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(template);
    await storageSet(STORAGE_KEYS.templates, existing);
    onDeleteTemplate(null);
    setShowAIGenerator(false);
    if (onStartFilling) onStartFilling(template);
  }, [onStartFilling, onDeleteTemplate]);

  // ═══ Check which demos are already activated ═══
  const activatedDemoNames = useMemo(() =>
    new Set((customTemplates || []).map(t => t.name)),
    [customTemplates]
  );

  // ═══ Render a single form card ═══
  const renderFormCard = useCallback((t, isArchived = false) => (
    <div key={t.id} style={{ ...S_CARD_BASE, opacity: (t.isActive === false || isArchived) ? 0.7 : 1 }}>
      <span style={{ fontSize: '32px', flexShrink: 0, marginTop: '2px' }}>{t.icon || '📋'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{t.name || 'Ohne Name'}</span>
          {!isArchived && user.role === 'admin' && (
            <button onClick={() => handleToggleActive(t)} style={S_ACTIVE_PILL(t.isActive !== false)}>
              {t.isActive !== false ? 'Aktiv' : 'Inaktiv'}
            </button>
          )}
        </div>
        <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description || 'Keine Beschreibung'}</div>
        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
          <span style={styles.badge(S.colors.textSecondary)}>v{t.version || 1}</span>
          <span style={styles.badge(S.colors.textSecondary)}>{t.pages?.length || 0} Seiten</span>
        </div>
        {/* Role visibility (admin only, not for archived) */}
        {!isArchived && user.role === 'admin' && (
          <div style={S_ROLES_ROW}>
            <span style={S_ROLES_LABEL}>Sichtbar:</span>
            {ROLES.map(r => {
              const active = (t.visibleForRoles || ALL_ROLES).includes(r.id);
              return <button key={r.id} onClick={() => handleToggleRole(t, r.id)} style={S_ROLE_CHIP(active)}>{r.label}</button>;
            })}
          </div>
        )}
      </div>
      <div style={S_ACTIONS}>
        {isArchived ? (<>
          {user.role === 'admin' && <>
            <button onClick={() => handleUnarchive(t)} style={styles.btn('secondary', 'sm')}>Wiederherstellen</button>
            <button onClick={() => handleDelete(t)} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>🗑</button>
          </>}
        </>) : (<>
          {onStartFilling && t.isActive !== false && <button onClick={() => onStartFilling(t)} style={styles.btn('primary', 'sm')}>Ausfüllen</button>}
          {user.role === 'admin' && <>
            <button onClick={() => onOpenBuilder(t)} style={styles.btn('secondary', 'sm')}>Bearbeiten</button>
            <button onClick={() => handleDuplicate(t)} style={styles.btn('ghost', 'sm')} title="Duplizieren">📋</button>
            <button onClick={() => handleExport(t)} style={styles.btn('ghost', 'sm')} title="Exportieren">📤</button>
            <button onClick={() => handleArchive(t)} style={styles.btn('ghost', 'sm')} title="Archivieren">📦</button>
            <button onClick={() => handleDelete(t)} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }} title="Löschen">🗑</button>
          </>}
        </>)}
      </div>
    </div>
  ), [user, handleToggleActive, handleToggleRole, handleArchive, handleUnarchive, handleDelete, handleDuplicate, handleExport, onOpenBuilder, onStartFilling]);

  return (
    <div>
      {toast && <ToastMessage message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showAIGenerator && <ErrorBoundary><Suspense fallback={<div style={{ textAlign: 'center', padding: '32px', color: S.colors.textSecondary }}>Laden...</div>}><AIFormGenerator onClose={() => setShowAIGenerator(false)} onOpenBuilder={handleAISaveAndOpen} onDirectUse={handleAIDirectUse} /></Suspense></ErrorBoundary>}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Formulare</h2>
        {user.role === 'admin' && (
          <div style={S_TOOLBAR}>
            <button onClick={() => fileInputRef.current?.click()} style={styles.btn('secondary', 'sm')}>Importieren</button>
            <button onClick={() => setShowAIGenerator(true)} style={styles.btn('secondary', 'sm')}>KI-Generator</button>
            <button onClick={() => onOpenBuilder(createEmptyTemplate())} style={styles.btn('primary')}>+ Neues Formular</button>
          </div>
        )}
      </div>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
        {user.role === 'admin' ? 'Formulare verwalten, aktivieren und Rollen zuweisen' : 'Verfügbare Formulare'}
      </p>

      {/* ═══ Active Forms ═══ */}
      {activeList.length > 0 && <>
        <h3 style={S_SECTION}>Aktive Formulare ({activeList.length})</h3>
        <div style={S_CARDS}>{activeList.map(t => renderFormCard(t))}</div>
      </>}

      {/* ═══ Inactive Forms ═══ */}
      {inactiveList.length > 0 && <>
        <h3 style={S_SECTION}>Inaktive Formulare ({inactiveList.length})</h3>
        <div style={S_CARDS}>{inactiveList.map(t => renderFormCard(t))}</div>
      </>}

      {/* ═══ No custom forms yet ═══ */}
      {activeList.length === 0 && inactiveList.length === 0 && (
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Noch keine Formulare</div>
          <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>
            Erstelle ein neues Formular oder aktiviere eine Vorlage aus der Bibliothek unten.
          </div>
        </div>
      )}

      {/* ═══ Archived Forms ═══ */}
      {archivedList.length > 0 && <>
        <button onClick={() => setShowArchived(!showArchived)} style={S_ARCHIVE_TOGGLE}>
          <span style={{ fontSize: '12px', transition: S.transition, transform: showArchived ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
          Archiviert ({archivedList.length})
        </button>
        {showArchived && <div style={S_CARDS}>{archivedList.map(t => renderFormCard(t, true))}</div>}
      </>}

      {/* ═══ Demo Templates Library ═══ */}
      <button onClick={() => setShowDemos(!showDemos)} style={{ ...S_ARCHIVE_TOGGLE, marginTop: archivedList.length > 0 ? '0' : '8px' }}>
        <span style={{ fontSize: '12px', transition: S.transition, transform: showDemos ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
        Vorlagen-Bibliothek ({DEMO_TEMPLATES.length})
      </button>
      {showDemos && (
        <div style={S_CARDS}>
          {DEMO_TEMPLATES.map(t => (
            <div key={t.id} style={{ ...S_CARD_BASE, opacity: 0.85 }}>
              <span style={{ fontSize: '32px', flexShrink: 0, marginTop: '2px' }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{t.name}</div>
                <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description}</div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                  <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} Seiten</span>
                  {activatedDemoNames.has(t.name) && <span style={styles.badge(S.colors.success)}>bereits aktiviert</span>}
                </div>
              </div>
              <div style={S_ACTIONS}>
                {user.role === 'admin' && <>
                  <button onClick={() => handleActivateDemo(t)} style={styles.btn('primary', 'sm')}>Aktivieren</button>
                  <button onClick={() => {
                    const copy = JSON.parse(JSON.stringify(t));
                    copy.id = secureId('tpl');
                    copy.name = `${t.name} (Kopie)`;
                    copy.isDemo = false; copy.version = 1;
                    onOpenBuilder(copy);
                  }} style={styles.btn('secondary', 'sm')}>Anpassen</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
TemplatesOverview.displayName = 'TemplatesOverview';
