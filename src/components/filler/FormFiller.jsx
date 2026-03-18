import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { validatePage } from '../../lib/validation';
import { storageSet } from '../../lib/storage';
import { saveDraft } from '../../lib/offlineDb';
import { FormField } from '../fields/FormField';

// ═══ Extracted Styles (P4) ═══
const S_HEADER = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' };
const S_TITLE = { fontSize: '18px', fontWeight: 700, margin: 0 };
const S_PAGE_INFO = { fontSize: '13px', color: S.colors.textSecondary };
const S_PAGES_WRAP = { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 10, background: S.colors.bg, paddingTop: '8px', paddingBottom: '8px' };
const S_FIELDS_WRAP = { display: 'flex', flexWrap: 'wrap', gap: '16px' };
const S_FOOTER = { display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'space-between' };
const pageBtnStyle = (i, pageIndex) => ({
  padding: '6px 14px', borderRadius: S.radius.full, fontSize: '12px', fontWeight: 600,
  border: `1.5px solid ${i === pageIndex ? S.colors.primary : i < pageIndex ? S.colors.success + '40' : S.colors.border}`,
  background: i === pageIndex ? `${S.colors.primary}12` : i < pageIndex ? `${S.colors.success}08` : 'transparent',
  color: i === pageIndex ? S.colors.primary : i < pageIndex ? S.colors.success : S.colors.textMuted,
  cursor: i < pageIndex ? 'pointer' : 'default', fontFamily: 'inherit',
});

// ═══ FEATURE: Form Filler (Chat F.1 + S01 Polish) ═══
export const FormFiller = React.memo(({ template, onSubmit, onCancel, initialData, draftId }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const formDataRef = useRef(formData);
  const pageIndexRef = useRef(pageIndex);
  // eslint-disable-next-line react-hooks/refs
  formDataRef.current = formData;
  // eslint-disable-next-line react-hooks/refs
  pageIndexRef.current = pageIndex;
  const pages = template.pages || [];
  const currentPage = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;
  const progress = useMemo(() => pages.length > 1 ? ((pageIndex + 1) / pages.length) * 100 : 100, [pageIndex, pages.length]);

  useEffect(() => {
    const key = draftId || `fp_draft_${template.id}_current`;
    const saveBoth = () => {
      const draftPayload = { templateId: template.id, data: formDataRef.current, pageIndex: pageIndexRef.current, updatedAt: new Date().toISOString() };
      storageSet(key, draftPayload);
      // Also persist in IndexedDB for offline resilience
      saveDraft(key, draftPayload).catch(() => {});
    };
    const timer = setInterval(saveBoth, 30000);
    return () => {
      clearInterval(timer);
      saveBoth();
    };
  }, [template.id, draftId]);

  const updateField = useCallback((fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (showErrors) setErrors(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
  }, [showErrors]);

  const navigatingRef = useRef(false);
  const goNext = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      if (!currentPage) { if (isLastPage) onSubmit(formData); return; }
      const pageErrors = validatePage(currentPage, formData);
      if (Object.keys(pageErrors).length > 0) { setErrors(pageErrors); setShowErrors(true); return; }
      setShowErrors(false); setErrors({});
      if (isLastPage) onSubmit(formData); else { setPageIndex(prev => prev + 1); window.scrollTo(0, 0); }
    } finally {
      setTimeout(() => { navigatingRef.current = false; }, 300);
    }
  }, [currentPage, formData, isLastPage, onSubmit]);

  const goBack = useCallback(() => {
    if (pageIndex > 0) { setPageIndex(prev => prev - 1); setShowErrors(false); setErrors({}); window.scrollTo(0, 0); }
  }, [pageIndex]);

  return (
    <div>
      <div style={S_HEADER}>
        <button onClick={onCancel} style={{ ...styles.btn('ghost'), padding: '8px' }}>← Zurück</button>
        <div style={{ flex: 1 }}>
          <h2 style={S_TITLE}>{template.name}</h2>
          {pages.length > 1 && <div style={S_PAGE_INFO}>Seite {pageIndex + 1} von {pages.length}: {currentPage.title}</div>}
        </div>
      </div>
      {pages.length > 1 && <div style={styles.progressBar}><div style={styles.progressFill(progress)} /></div>}
      {pages.length > 1 && (
        <div style={S_PAGES_WRAP}>
          {pages.map((p, i) => (
            <button key={p.id} onClick={() => { if (i < pageIndex) { setPageIndex(i); setShowErrors(false); } }}
              style={pageBtnStyle(i, pageIndex)}>{i < pageIndex ? '✓ ' : ''}{p.title}</button>
          ))}
        </div>
      )}
      <div style={{ ...styles.card, padding: '24px' }}>
        <div style={S_FIELDS_WRAP}>
          {(currentPage?.fields || []).map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={(val) => updateField(field.id, val)} error={showErrors ? errors[field.id] : null} formData={formData} />
          ))}
        </div>
      </div>
      <div style={S_FOOTER}>
        <button onClick={goBack} style={{ ...styles.btn('secondary'), visibility: pageIndex > 0 ? 'visible' : 'hidden' }}>← Zurück</button>
        <button onClick={goNext} style={styles.btn(isLastPage ? 'success' : 'primary', 'lg')}>{isLastPage ? '✓ Abschließen' : 'Weiter →'}</button>
      </div>
    </div>
  );
});

FormFiller.displayName = 'FormFiller';
