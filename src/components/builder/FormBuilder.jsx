import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// ═══ Extracted Styles (P4) ═══
const S_HEADER = { background: S.glass.background, backdropFilter: S.glass.backdropFilter, borderBottom: `1px solid ${S.colors.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 };
const S_NAME_INPUT = { width: '100%', padding: '4px 8px', border: '1.5px solid transparent', borderRadius: S.radius.sm, fontSize: '18px', fontWeight: 700, fontFamily: 'inherit', background: 'transparent', outline: 'none', transition: S.transition, color: S.colors.text };
const S_LAYOUT = { display: 'flex', flex: 1, overflow: 'hidden' };
const S_LEFT_PANEL = { width: '240px', flexShrink: 0, borderRight: `1px solid ${S.colors.border}`, background: S.colors.bgCard, overflowY: 'auto', padding: '12px' };
const S_CENTER = { flex: 1, overflowY: 'auto', padding: '16px', minWidth: 0 };
const S_RIGHT_PANEL = { width: '320px', flexShrink: 0, borderLeft: `1px solid ${S.colors.border}`, background: S.colors.bgCard, overflowY: 'auto', padding: '16px' };
const S_PALETTE_LABEL = { fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: S.colors.textSecondary };
const S_FAB = { position: 'fixed', bottom: 20, left: 20, width: 56, height: 56, borderRadius: '50%', background: S.colors.primary, color: '#fff', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: S.colors.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 };
const S_OVERLAY = { position: 'fixed', inset: 0, zIndex: 200 };
const S_BACKDROP = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' };
const S_DRAWER_LEFT = { position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px', background: S.colors.bgCardSolid, boxShadow: S.colors.shadowLg, overflowY: 'auto', padding: '16px' };
const S_DRAWER_RIGHT = { position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(360px, 90vw)', background: S.colors.bgCardSolid, boxShadow: S.colors.shadowLg, overflowY: 'auto', padding: '16px' };
const S_DRAWER_HEADER = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' };
const S_DRAWER_CLOSE = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: S.colors.textMuted };
const S_EMPTY_SETTINGS = { padding: '24px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' };
const S_UNDO_BTN = (enabled) => ({ padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: enabled ? S.colors.white : 'transparent', color: enabled ? S.colors.text : S.colors.border, cursor: enabled ? 'pointer' : 'default', fontSize: '14px', fontFamily: 'inherit', opacity: enabled ? 1 : 0.4 });

// ═══ FEATURE: Form Builder Main (Chat C02 + S01 Polish) ═══
export const FormBuilder = ({ template: initialTemplate, onSave, onClose }) => {
  const { state: template, push: setTemplateWithHistory, undo, redo, canUndo, canRedo } = useUndoRedo(() => JSON.parse(JSON.stringify(initialTemplate)));
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const autoSaveRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); doSave(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => { if (hasChanges) doSave(true); }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [hasChanges, template]);

  const activePage = template.pages[activePageIndex] || template.pages[0];
  const activeFields = activePage?.fields || [];
  const allFields = useMemo(() => template.pages.flatMap(p => p.fields), [template.pages]);
  const selectedField = useMemo(() => allFields.find(f => f.id === selectedFieldId), [allFields, selectedFieldId]);

  const upd = useCallback((next) => { setTemplateWithHistory(next); setHasChanges(true); }, [setTemplateWithHistory]);

  const addPage = useCallback(() => {
    const np = { id: `page-${Date.now()}`, title: `Seite ${template.pages.length + 1}`, fields: [] };
    const n = { ...template, pages: [...template.pages, np] }; upd(n); setActivePageIndex(n.pages.length - 1);
  }, [template, upd]);

  const deletePage = useCallback((idx) => {
    if (template.pages.length <= 1) return;
    upd({ ...template, pages: template.pages.filter((_, i) => i !== idx) });
    if (activePageIndex >= template.pages.length - 1) setActivePageIndex(Math.max(0, template.pages.length - 2));
    setSelectedFieldId(null);
  }, [template, upd, activePageIndex]);

  const renamePage = useCallback((pid, title) => upd({ ...template, pages: template.pages.map(p => p.id === pid ? { ...p, title } : p) }), [template, upd]);

  const addFieldToEnd = useCallback((type) => {
    const f = createField(type);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: [...p.fields, f] } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  }, [template, upd, activePageIndex, isDesktop]);

  const addFieldAtIndex = useCallback((type, index) => {
    const f = createField(type);
    const nf = [...activeFields]; nf.splice(index, 0, f);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: nf } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  }, [template, upd, activePageIndex, activeFields, isDesktop]);

  const moveField = useCallback((fieldId, toIndex) => {
    const fromIndex = activeFields.findIndex(f => f.id === fieldId);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const nf = [...activeFields]; const [moved] = nf.splice(fromIndex, 1);
    nf.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: nf } : p) });
  }, [template, upd, activePageIndex, activeFields]);

  const deleteField = useCallback((fid) => {
    upd({ ...template, pages: template.pages.map((p, i) => i === activePageIndex ? { ...p, fields: p.fields.filter(f => f.id !== fid) } : p) });
    if (selectedFieldId === fid) setSelectedFieldId(null);
  }, [template, upd, activePageIndex, selectedFieldId]);

  const updateSelectedField = useCallback((uf) => upd({ ...template, pages: template.pages.map(p => ({ ...p, fields: p.fields.map(f => f.id === uf.id ? uf : f) })) }), [template, upd]);

  const changeFieldWidth = useCallback((fid, w) => upd({ ...template, pages: template.pages.map(p => ({ ...p, fields: p.fields.map(f => f.id === fid ? { ...f, width: w } : f) })) }), [template, upd]);

  const doSave = useCallback(async (silent = false) => {
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
      if (!silent) setToast({ message: 'Gespeichert', type: 'success' });
      if (onSave) onSave(toSave);
      return true;
    } catch { if (!silent) setToast({ message: 'Speichern fehlgeschlagen', type: 'error' }); return false; }
  }, [template, onSave]);

  const handleClose = useCallback(() => { if (hasChanges && !confirm('Ungespeicherte Änderungen verwerfen?')) return; onClose(); }, [hasChanges, onClose]);

  const handleSelectField = useCallback((id) => { setSelectedFieldId(id); if (!isDesktop) setShowSettingsDrawer(true); }, [isDesktop]);
  const handleCloseSettings = useCallback(() => { setSelectedFieldId(null); setShowSettingsDrawer(false); }, []);
  const handlePaletteAdd = useCallback((t) => { addFieldToEnd(t); setShowPaletteDrawer(false); }, [addFieldToEnd]);
  const handleNameFocus = useCallback((e) => { e.target.style.borderColor = S.colors.primary; e.target.style.background = S.colors.bgInput; }, []);
  const handleNameBlur = useCallback((e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }, []);

  const settingsContent = selectedField ? (
    <BuilderSettingsPanel field={selectedField} allFields={allFields} onChange={updateSelectedField} onClose={handleCloseSettings} />
  ) : (
    <div style={S_EMPTY_SETTINGS}>Feld auswählen um Einstellungen zu bearbeiten</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: `linear-gradient(135deg, ${S.colors.bg} 0%, #e0e7ef 100%)`, fontFamily: S.font.sans }}>
      {toast && <ToastMessage message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      <div style={S_HEADER}>
        <button onClick={handleClose} style={{ ...styles.btn('ghost'), padding: '8px', fontSize: '14px' }}>← Zurück</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={template.name} onChange={e => upd({ ...template, name: e.target.value })} placeholder="Formularname eingeben..."
            style={S_NAME_INPUT} onFocus={handleNameFocus} onBlur={handleNameBlur} />
        </div>
        <button onClick={undo} disabled={!canUndo} style={S_UNDO_BTN(canUndo)} title="Rückgängig (Ctrl+Z)">↩</button>
        <button onClick={redo} disabled={!canRedo} style={S_UNDO_BTN(canRedo)} title="Wiederholen (Ctrl+Shift+Z)">↪</button>
        <span style={{ fontSize: '12px', color: hasChanges ? S.colors.warning : S.colors.success, fontWeight: 600, flexShrink: 0 }}>{hasChanges ? '● Ungespeichert' : '✓ Gespeichert'}</span>
        <button onClick={() => doSave(false)} style={styles.btn('primary', 'sm')}>Speichern</button>
      </div>
      <div style={S_LAYOUT}>
        {isDesktop && (
          <div style={S_LEFT_PANEL}>
            <div style={S_PALETTE_LABEL}>Feld-Palette</div>
            <BuilderPalette onAddField={addFieldToEnd} />
          </div>
        )}
        <div style={S_CENTER}>
          <BuilderMetaPanel template={template} onChange={upd} />
          <BuilderCanvas pages={template.pages} activePageIndex={activePageIndex} onPageChange={setActivePageIndex} onAddPage={addPage} onDeletePage={deletePage} onRenamePage={renamePage}
            fields={activeFields} selectedFieldId={selectedFieldId} onSelectField={handleSelectField}
            onDeleteField={deleteField} onAddFieldAtIndex={addFieldAtIndex} onMoveField={moveField} onFieldWidthChange={changeFieldWidth} />
        </div>
        {isDesktop && <div style={S_RIGHT_PANEL}>{settingsContent}</div>}
      </div>
      {!isDesktop && <>
        <button onClick={() => setShowPaletteDrawer(true)} style={S_FAB}>＋</button>
        {showPaletteDrawer && (
          <div style={S_OVERLAY}>
            <div style={S_BACKDROP} onClick={() => setShowPaletteDrawer(false)} />
            <div style={S_DRAWER_LEFT}>
              <div style={S_DRAWER_HEADER}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Feld hinzufügen</span>
                <button onClick={() => setShowPaletteDrawer(false)} style={S_DRAWER_CLOSE}>✕</button>
              </div>
              <BuilderPalette onAddField={handlePaletteAdd} />
            </div>
          </div>
        )}
        {showSettingsDrawer && selectedField && (
          <div style={S_OVERLAY}>
            <div style={S_BACKDROP} onClick={() => setShowSettingsDrawer(false)} />
            <div style={S_DRAWER_RIGHT}>{settingsContent}</div>
          </div>
        )}
      </>}
    </div>
  );
};
