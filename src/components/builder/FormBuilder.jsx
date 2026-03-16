import { useState, useEffect, useRef } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { STORAGE_KEYS } from '../../config/constants';
import { storageGet, storageSet } from '../../lib/storage';
import { createField } from '../../lib/helpers';
import { ToastMessage } from '../common/ToastMessage';
import { BuilderPalette } from './BuilderPalette';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderSettingsPanel } from './BuilderSettingsPanel';
import { BuilderMetaPanel } from './BuilderMetaPanel';

// ═══ FEATURE: Form Builder Main (Chat C02) ═══
export const FormBuilder = ({ template: initialTemplate, onSave, onClose }) => {
  const [template, setTemplate] = useState(() => JSON.parse(JSON.stringify(initialTemplate)));
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const autoSaveRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', h); return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => { if (hasChanges) doSave(true); }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [hasChanges, template]);

  const activePage = template.pages[activePageIndex] || template.pages[0];
  const activeFields = activePage?.fields || [];
  const allFields = template.pages.flatMap(p => p.fields);
  const selectedField = allFields.find(f => f.id === selectedFieldId);

  const upd = (next) => { setTemplate(next); setHasChanges(true); };

  const addPage = () => {
    const np = { id: `page-${Date.now()}`, title: `Seite ${template.pages.length + 1}`, fields: [] };
    const n = { ...template, pages: [...template.pages, np] }; upd(n); setActivePageIndex(n.pages.length - 1);
  };
  const deletePage = (idx) => {
    if (template.pages.length <= 1) return;
    upd({ ...template, pages: template.pages.filter((_, i) => i !== idx) });
    if (activePageIndex >= template.pages.length - 1) setActivePageIndex(Math.max(0, template.pages.length - 2));
    setSelectedFieldId(null);
  };
  const renamePage = (pid, title) => upd({ ...template, pages: template.pages.map(p => p.id === pid ? { ...p, title } : p) });

  const addFieldToEnd = (type) => {
    const f = createField(type);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: [...p.fields, f] } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  };
  const addFieldAtIndex = (type, index) => {
    const f = createField(type);
    const nf = [...activeFields]; nf.splice(index, 0, f);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: nf } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  };
  const moveField = (fieldId, toIndex) => {
    const fromIndex = activeFields.findIndex(f => f.id === fieldId);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const nf = [...activeFields]; const [moved] = nf.splice(fromIndex, 1);
    nf.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: nf } : p) });
  };
  const deleteField = (fid) => {
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: p.fields.filter(f => f.id !== fid) } : p) });
    if (selectedFieldId === fid) setSelectedFieldId(null);
  };
  const updateSelectedField = (uf) => upd({ ...template, pages: template.pages.map(p => ({ ...p, fields: p.fields.map(f => f.id === uf.id ? uf : f) })) });
  const changeFieldWidth = (fid, w) => upd({ ...template, pages: template.pages.map(p => ({ ...p, fields: p.fields.map(f => f.id === fid ? { ...f, width: w } : f) })) });

  const doSave = async (silent = false) => {
    if (!template.name?.trim()) { if (!silent) setToast({ message: 'Formularname fehlt', type: 'error' }); return false; }
    try {
      const existing = await storageGet(STORAGE_KEYS.templates) || [];
      const now = new Date().toISOString();
      const idx = existing.findIndex(t => t.id === template.id);
      const toSave = { ...template, updatedAt: now };
      if (idx >= 0) { toSave.version = (existing[idx].version || 1) + 1; existing[idx] = toSave; }
      else { toSave.createdAt = now; existing.push(toSave); }
      await storageSet(STORAGE_KEYS.templates, existing);
      setHasChanges(false);
      if (!silent) setToast({ message: 'Gespeichert ✓', type: 'success' });
      if (onSave) onSave(toSave);
      return true;
    } catch { if (!silent) setToast({ message: 'Speichern fehlgeschlagen', type: 'error' }); return false; }
  };

  const handleClose = () => { if (hasChanges && !confirm('Ungespeicherte Änderungen verwerfen?')) return; onClose(); };

  const settingsContent = selectedField ? (
    <BuilderSettingsPanel field={selectedField} allFields={allFields} onChange={updateSelectedField} onClose={() => { setSelectedFieldId(null); setShowSettingsDrawer(false); }} />
  ) : (
    <div style={{ padding: '24px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' }}>Feld auswählen um Einstellungen zu bearbeiten</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: `linear-gradient(135deg, ${S.colors.bg} 0%, #e0e7ef 100%)`, fontFamily: S.font.sans }}>
      {toast && <ToastMessage message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      <div style={{ background: S.glass.background, backdropFilter: S.glass.backdropFilter, borderBottom: `1px solid ${S.colors.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={handleClose} style={{ ...styles.btn('ghost'), padding: '8px', fontSize: '14px' }}>← Zurück</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={template.name} onChange={e => upd({ ...template, name: e.target.value })} placeholder="Formularname eingeben..."
            style={{ width: '100%', padding: '4px 8px', border: '1.5px solid transparent', borderRadius: S.radius.sm, fontSize: '18px', fontWeight: 700, fontFamily: 'inherit', background: 'transparent', outline: 'none', transition: S.transition, color: S.colors.text }}
            onFocus={e => { e.target.style.borderColor = S.colors.primary; e.target.style.background = S.colors.bgInput; }}
            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }} />
        </div>
        <span style={{ fontSize: '12px', color: hasChanges ? S.colors.warning : S.colors.success, fontWeight: 600, flexShrink: 0 }}>{hasChanges ? '● Ungespeichert' : '✓ Gespeichert'}</span>
        <button onClick={() => doSave(false)} style={styles.btn('primary', 'sm')}>💾 Speichern</button>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isDesktop && (
          <div style={{ width: '240px', flexShrink: 0, borderRight: `1px solid ${S.colors.border}`, background: S.colors.bgCard, overflowY: 'auto', padding: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: S.colors.textSecondary }}>Feld-Palette</div>
            <BuilderPalette onAddField={addFieldToEnd} />
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minWidth: 0 }}>
          <BuilderMetaPanel template={template} onChange={upd} />
          <BuilderCanvas pages={template.pages} activePageIndex={activePageIndex} onPageChange={setActivePageIndex} onAddPage={addPage} onDeletePage={deletePage} onRenamePage={renamePage}
            fields={activeFields} selectedFieldId={selectedFieldId} onSelectField={(id) => { setSelectedFieldId(id); if (!isDesktop) setShowSettingsDrawer(true); }}
            onDeleteField={deleteField} onAddFieldAtIndex={addFieldAtIndex} onMoveField={moveField} onFieldWidthChange={changeFieldWidth} />
        </div>
        {isDesktop && (
          <div style={{ width: '320px', flexShrink: 0, borderLeft: `1px solid ${S.colors.border}`, background: S.colors.bgCard, overflowY: 'auto', padding: '16px' }}>
            {settingsContent}
          </div>
        )}
      </div>
      {!isDesktop && <>
        <button onClick={() => setShowPaletteDrawer(true)} style={{ position: 'fixed', bottom: 20, left: 20, width: 56, height: 56, borderRadius: '50%', background: S.colors.primary, color: '#fff', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: S.colors.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>＋</button>
        {showPaletteDrawer && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowPaletteDrawer(false)} />
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px', background: S.colors.bgCardSolid, boxShadow: S.colors.shadowLg, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Feld hinzufügen</span>
                <button onClick={() => setShowPaletteDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: S.colors.textMuted }}>✕</button>
              </div>
              <BuilderPalette onAddField={(t) => { addFieldToEnd(t); setShowPaletteDrawer(false); }} />
            </div>
          </div>
        )}
        {showSettingsDrawer && selectedField && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowSettingsDrawer(false)} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(360px, 90vw)', background: S.colors.bgCardSolid, boxShadow: S.colors.shadowLg, overflowY: 'auto', padding: '16px' }}>
              {settingsContent}
            </div>
          </div>
        )}
      </>}
    </div>
  );
};
