import { useState, useCallback, useRef, Suspense, lazy } from 'react';
import { S, CATEGORY_COLORS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';
import { STORAGE_KEYS } from '../../config/constants';
import { createEmptyTemplate } from '../../lib/helpers';
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

export const TemplatesOverview = ({ onOpenBuilder, onStartFilling }) => {
  const { user } = useAuth();
  const { customTemplates, handleDeleteTemplate: onDeleteTemplate } = useData();
  const [toast, setToast] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const fileInputRef = useRef(null);

  const handleAISaveAndOpen = useCallback(async (template) => {
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(template);
    await storageSet(STORAGE_KEYS.templates, existing);
    if (onDeleteTemplate) onDeleteTemplate(null); // triggers refresh
    setShowAIGenerator(false);
    onOpenBuilder(template);
  }, [onOpenBuilder, onDeleteTemplate]);

  const handleAIDirectUse = useCallback(async (template) => {
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(template);
    await storageSet(STORAGE_KEYS.templates, existing);
    if (onDeleteTemplate) onDeleteTemplate(null); // triggers refresh
    setShowAIGenerator(false);
    if (onStartFilling) onStartFilling(template);
  }, [onStartFilling, onDeleteTemplate]);

  const handleDuplicate = useCallback(async (t) => {
    const copy = JSON.parse(JSON.stringify(t));
    copy.id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    copy.name = `${t.name} (Kopie)`;
    copy.version = 1;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    const existing = await storageGet(STORAGE_KEYS.templates) || [];
    existing.push(copy);
    await storageSet(STORAGE_KEYS.templates, existing);
    if (onDeleteTemplate) onDeleteTemplate(null); // triggers refresh via parent
    setToast({ message: `"${copy.name}" erstellt`, type: 'success' });
  }, [onDeleteTemplate]);

  const handleDelete = useCallback(async (t) => {
    const yes = await confirm({ title: 'Vorlage löschen?', message: `"${t.name}" wird unwiderruflich gelöscht.`, confirmLabel: 'Löschen', variant: 'danger' });
    if (yes) onDeleteTemplate(t.id);
  }, [confirm, onDeleteTemplate]);

  const handleExport = useCallback((t) => {
    const data = JSON.parse(JSON.stringify(t));
    delete data.isDemo;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(t.name || 'vorlage').replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '')}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast({ message: 'Vorlage exportiert', type: 'success' });
  }, []);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const tpl = JSON.parse(text);
      if (!tpl.pages || !Array.isArray(tpl.pages)) throw new Error('Ungültiges Format');
      tpl.id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      tpl.name = tpl.name ? `${tpl.name} (Import)` : 'Importierte Vorlage';
      tpl.version = 1;
      tpl.createdAt = new Date().toISOString();
      tpl.updatedAt = new Date().toISOString();
      const existing = await storageGet(STORAGE_KEYS.templates) || [];
      existing.push(tpl);
      await storageSet(STORAGE_KEYS.templates, existing);
      if (onDeleteTemplate) onDeleteTemplate(null);
      setToast({ message: `"${tpl.name}" importiert`, type: 'success' });
    } catch {
      setToast({ message: 'Import fehlgeschlagen — ungültiges JSON', type: 'error' });
    }
    e.target.value = '';
  }, [onDeleteTemplate]);

  return (
    <div>
      {toast && <ToastMessage message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      {confirmState && <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showAIGenerator && <ErrorBoundary><Suspense fallback={<div style={{ textAlign: 'center', padding: '32px', color: S.colors.textSecondary }}>Laden...</div>}><AIFormGenerator onClose={() => setShowAIGenerator(false)} onOpenBuilder={handleAISaveAndOpen} onDirectUse={handleAIDirectUse} /></Suspense></ErrorBoundary>}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Vorlagen</h2>
        {user.role === 'admin' && (
          <div style={S_TOOLBAR}>
            <button onClick={() => fileInputRef.current?.click()} style={styles.btn('secondary', 'sm')}>📥 Importieren</button>
            <button onClick={() => setShowAIGenerator(true)} style={styles.btn('secondary', 'sm')}>KI-Generator</button>
            <button onClick={() => onOpenBuilder(createEmptyTemplate())} style={styles.btn('primary')}>+ Neues Formular</button>
          </div>
        )}
      </div>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>{user.role === 'admin' ? 'Formularvorlagen verwalten und erstellen' : 'Verfügbare Vorlagen'}</p>

      {(customTemplates || []).length > 0 && <>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eigene Vorlagen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {customTemplates.map(t => (
            <div key={t.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{t.icon || '📋'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name || 'Ohne Name'}</div>
                <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description || 'Keine Beschreibung'}</div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>v{t.version || 1}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>{t.pages?.length || 0} Seiten</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                {onStartFilling && <button onClick={() => onStartFilling(t)} style={styles.btn('primary', 'sm')}>✏️ Ausfüllen</button>}
                {user.role === 'admin' && <>
                  <button onClick={() => onOpenBuilder(t)} style={styles.btn('secondary', 'sm')}>✎ Bearbeiten</button>
                  <button onClick={() => handleDuplicate(t)} style={styles.btn('ghost', 'sm')} title="Duplizieren">📋</button>
                  <button onClick={() => handleExport(t)} style={styles.btn('ghost', 'sm')} title="Exportieren">📤</button>
                  <button onClick={() => handleDelete(t)} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>🗑</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      </>}

      <h3 style={{ fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo-Vorlagen</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DEMO_TEMPLATES.map(t => (
          <div key={t.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description}</div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} Seiten</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
              {onStartFilling && <button onClick={() => onStartFilling(t)} style={styles.btn('primary', 'sm')}>✏️ Ausfüllen</button>}
              {user.role === 'admin' && <button onClick={() => {
                const copy = JSON.parse(JSON.stringify(t));
                copy.id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                copy.name = `${t.name} (Kopie)`;
                copy.isDemo = false; copy.version = 1;
                onOpenBuilder(copy);
              }} style={styles.btn('secondary', 'sm')}>📋 Kopieren</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
