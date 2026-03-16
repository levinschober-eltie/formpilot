import { useState, useEffect, useRef } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { validatePage } from '../../lib/validation';
import { storageSet } from '../../lib/storage';
import { FormField } from '../fields/FormField';

// ═══ FEATURE: Form Filler (Chat F.1) ═══
export const FormFiller = ({ template, onSubmit, onCancel, initialData, draftId }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const autoSaveTimer = useRef(null);
  const pages = template.pages || [];
  const currentPage = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;
  const progress = pages.length > 1 ? ((pageIndex + 1) / pages.length) * 100 : 100;

  useEffect(() => {
    autoSaveTimer.current = setInterval(async () => {
      const key = draftId || `fp_draft_${template.id}_current`;
      await storageSet(key, { templateId: template.id, data: formData, pageIndex, updatedAt: new Date().toISOString() });
    }, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, [formData, pageIndex]);

  useEffect(() => {
    return () => {
      const key = draftId || `fp_draft_${template.id}_current`;
      storageSet(key, { templateId: template.id, data: formData, pageIndex, updatedAt: new Date().toISOString() });
    };
  }, [formData, pageIndex]);

  const updateField = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (showErrors) setErrors(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
  };
  const goNext = () => {
    const pageErrors = validatePage(currentPage, formData);
    if (Object.keys(pageErrors).length > 0) { setErrors(pageErrors); setShowErrors(true); return; }
    setShowErrors(false); setErrors({});
    if (isLastPage) onSubmit(formData); else { setPageIndex(prev => prev + 1); window.scrollTo(0, 0); }
  };
  const goBack = () => { if (pageIndex > 0) { setPageIndex(prev => prev - 1); setShowErrors(false); setErrors({}); window.scrollTo(0, 0); } };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={onCancel} style={{ ...styles.btn('ghost'), padding: '8px' }}>← Zurück</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{template.name}</h2>
          {pages.length > 1 && <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>Seite {pageIndex + 1} von {pages.length}: {currentPage.title}</div>}
        </div>
      </div>
      {pages.length > 1 && <div style={styles.progressBar}><div style={styles.progressFill(progress)} /></div>}
      {pages.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {pages.map((p, i) => (
            <button key={p.id} onClick={() => { if (i < pageIndex) { setPageIndex(i); setShowErrors(false); } }}
              style={{ padding: '6px 14px', borderRadius: S.radius.full, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${i === pageIndex ? S.colors.primary : i < pageIndex ? S.colors.success + '40' : S.colors.border}`, background: i === pageIndex ? `${S.colors.primary}12` : i < pageIndex ? `${S.colors.success}08` : 'transparent', color: i === pageIndex ? S.colors.primary : i < pageIndex ? S.colors.success : S.colors.textMuted, cursor: i < pageIndex ? 'pointer' : 'default', fontFamily: 'inherit' }}>{i < pageIndex ? '✓ ' : ''}{p.title}</button>
          ))}
        </div>
      )}
      <div style={{ ...styles.card, padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {(currentPage?.fields || []).map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={(val) => updateField(field.id, val)} error={showErrors ? errors[field.id] : null} formData={formData} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'space-between' }}>
        <button onClick={goBack} style={{ ...styles.btn('secondary'), visibility: pageIndex > 0 ? 'visible' : 'hidden' }}>← Zurück</button>
        <button onClick={goNext} style={styles.btn(isLastPage ? 'success' : 'primary', 'lg')}>{isLastPage ? '✓ Abschließen' : 'Weiter →'}</button>
      </div>
    </div>
  );
};
