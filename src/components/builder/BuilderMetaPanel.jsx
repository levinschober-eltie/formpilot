import React, { useState, useCallback } from 'react';
import { S } from '../../config/theme';
import { BUILDER_ICONS, CATEGORY_OPTIONS } from '../../config/constants';

// ═══ Extracted Styles (P4) ═══
const S_TOG_BTN = { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary };
const S_INPUT = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' };
const S_SECTION = { padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput, marginBottom: '8px' };
const S_SECTION_LABEL = { display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' };
const S_ORIENT_WRAP = { display: 'flex', gap: '4px', marginBottom: '8px' };
const S_COLOR_WRAP = { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' };
const S_COLOR_INPUT = { width: 40, height: 32, border: `1px solid ${S.colors.border}`, borderRadius: S.radius.sm, cursor: 'pointer' };
const S_COLOR_TEXT = { fontSize: '12px', color: S.colors.textSecondary, fontFamily: S.font.mono };
const optBtn = (active) => ({ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${active ? S.colors.primary : S.colors.border}`, background: active ? `${S.colors.primary}10` : 'transparent', color: active ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' });
const iconBtn = (active) => ({ width: 36, height: 36, borderRadius: S.radius.sm, border: `2px solid ${active ? S.colors.primary : S.colors.border}`, background: active ? `${S.colors.primary}10` : 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' });

export const BuilderMetaPanel = React.memo(({ template, onChange }) => {
  const [showMeta, setShowMeta] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const toggleMeta = useCallback(() => setShowMeta(p => !p), []);
  const togglePdf = useCallback(() => setShowPdf(p => !p), []);

  return (
    <div style={{ marginBottom: '16px' }}>
      <button onClick={toggleMeta} style={S_TOG_BTN}>
        <span style={{ transform: showMeta ? 'rotate(90deg)' : 'rotate(0)', transition: S.transition }}>▶</span> Beschreibung, Kategorie & Icon
      </button>
      {showMeta && (
        <div style={S_SECTION}>
          <label style={S_SECTION_LABEL}>Beschreibung</label>
          <input value={template.description || ''} onChange={e => onChange({ ...template, description: e.target.value })} style={S_INPUT} placeholder="Kurze Beschreibung..." />
          <label style={S_SECTION_LABEL}>Kategorie</label>
          <select value={template.category} onChange={e => onChange({ ...template, category: e.target.value })} style={{ ...S_INPUT, cursor: 'pointer' }}>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <label style={S_SECTION_LABEL}>Icon</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BUILDER_ICONS.map(ic => <button key={ic} onClick={() => onChange({ ...template, icon: ic })} style={iconBtn(template.icon === ic)}>{ic}</button>)}
          </div>
        </div>
      )}
      <button onClick={togglePdf} style={S_TOG_BTN}>
        <span style={{ transform: showPdf ? 'rotate(90deg)' : 'rotate(0)', transition: S.transition }}>▶</span> PDF-Einstellungen
      </button>
      {showPdf && (
        <div style={S_SECTION}>
          <label style={S_SECTION_LABEL}>Ausrichtung</label>
          <div style={S_ORIENT_WRAP}>
            {[{ v: 'portrait', l: 'Hochformat' }, { v: 'landscape', l: 'Querformat' }].map(o => <button key={o.v} onClick={() => onChange({ ...template, pdfSettings: { ...template.pdfSettings, orientation: o.v } })} style={optBtn(template.pdfSettings?.orientation === o.v)}>{o.l}</button>)}
          </div>
          <label style={S_SECTION_LABEL}>Akzentfarbe</label>
          <div style={S_COLOR_WRAP}>
            <input type="color" value={template.pdfSettings?.accentColor || '#2563eb'} onChange={e => onChange({ ...template, pdfSettings: { ...template.pdfSettings, accentColor: e.target.value } })} style={S_COLOR_INPUT} />
            <span style={S_COLOR_TEXT}>{template.pdfSettings?.accentColor || '#2563eb'}</span>
          </div>
          <label style={S_SECTION_LABEL}>Footer-Text</label>
          <input value={template.pdfSettings?.footerText || ''} onChange={e => onChange({ ...template, pdfSettings: { ...template.pdfSettings, footerText: e.target.value } })} style={S_INPUT} placeholder="Erstellt mit FormPilot" />
        </div>
      )}
    </div>
  );
});

BuilderMetaPanel.displayName = 'BuilderMetaPanel';
