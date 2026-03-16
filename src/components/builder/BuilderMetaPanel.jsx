import { useState } from 'react';
import { S } from '../../config/theme';
import { BUILDER_ICONS, CATEGORY_OPTIONS } from '../../config/constants';

export const BuilderMetaPanel = ({ template, onChange }) => {
  const [showMeta, setShowMeta] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const togBtn = () => ({ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary });
  const sI = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' };
  return (
    <div style={{ marginBottom: '16px' }}>
      <button onClick={() => setShowMeta(!showMeta)} style={togBtn()}>
        <span style={{ transform: showMeta ? 'rotate(90deg)' : 'rotate(0)', transition: S.transition }}>▶</span> Beschreibung, Kategorie & Icon
      </button>
      {showMeta && (
        <div style={{ padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput, marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Beschreibung</label>
          <input value={template.description || ''} onChange={e => onChange({ ...template, description: e.target.value })} style={sI} placeholder="Kurze Beschreibung..." />
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Kategorie</label>
          <select value={template.category} onChange={e => onChange({ ...template, category: e.target.value })} style={{ ...sI, cursor: 'pointer' }}>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Icon</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BUILDER_ICONS.map(ic => <button key={ic} onClick={() => onChange({ ...template, icon: ic })} style={{ width: 36, height: 36, borderRadius: S.radius.sm, border: `2px solid ${template.icon === ic ? S.colors.primary : S.colors.border}`, background: template.icon === ic ? `${S.colors.primary}10` : 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</button>)}
          </div>
        </div>
      )}
      <button onClick={() => setShowPdf(!showPdf)} style={togBtn()}>
        <span style={{ transform: showPdf ? 'rotate(90deg)' : 'rotate(0)', transition: S.transition }}>▶</span> PDF-Einstellungen
      </button>
      {showPdf && (
        <div style={{ padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Ausrichtung</label>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[{ v: 'portrait', l: '↕ Hochformat' }, { v: 'landscape', l: '↔ Querformat' }].map(o => <button key={o.v} onClick={() => onChange({ ...template, pdfSettings: { ...template.pdfSettings, orientation: o.v } })} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${template.pdfSettings?.orientation === o.v ? S.colors.primary : S.colors.border}`, background: template.pdfSettings?.orientation === o.v ? `${S.colors.primary}10` : 'transparent', color: template.pdfSettings?.orientation === o.v ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{o.l}</button>)}
          </div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Akzentfarbe</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <input type="color" value={template.pdfSettings?.accentColor || '#2563eb'} onChange={e => onChange({ ...template, pdfSettings: { ...template.pdfSettings, accentColor: e.target.value } })} style={{ width: 40, height: 32, border: `1px solid ${S.colors.border}`, borderRadius: S.radius.sm, cursor: 'pointer' }} />
            <span style={{ fontSize: '12px', color: S.colors.textSecondary, fontFamily: S.font.mono }}>{template.pdfSettings?.accentColor || '#2563eb'}</span>
          </div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px' }}>Footer-Text</label>
          <input value={template.pdfSettings?.footerText || ''} onChange={e => onChange({ ...template, pdfSettings: { ...template.pdfSettings, footerText: e.target.value } })} style={sI} placeholder="Erstellt mit FormPilot" />
        </div>
      )}
    </div>
  );
};
