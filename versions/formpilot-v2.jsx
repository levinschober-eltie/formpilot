import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// FormPilot v2.0 — Core Engine + Form Filler + Form Builder
// Chat F.1: Core Engine ✅
// Chat C02: Form Builder Grundgerüst ✅
// ═══════════════════════════════════════════════════════════════

// ═══ FEATURE: Style System (Chat F.1) ═══
const S = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#f0c040',
    accentDark: '#d4a017',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    bg: '#f1f5f9',
    bgCard: 'rgba(255,255,255,0.82)',
    bgCardSolid: '#ffffff',
    bgInput: '#f8fafc',
    border: '#e2e8f0',
    borderFocus: '#2563eb',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    white: '#ffffff',
    shadow: '0 4px 24px rgba(0,0,0,0.06)',
    shadowLg: '0 8px 40px rgba(0,0,0,0.10)',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  font: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  glass: {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.4)',
  },
};

// ═══ FEATURE: Demo Templates (Chat F.1) ═══
const DEMO_TEMPLATES = [
  {
    id: 'tpl-service',
    name: 'Servicebericht',
    description: 'Einfacher Servicebericht für Kundeneinsätze',
    category: 'service',
    icon: '🔧',
    version: 1,
    isDemo: true,
    pages: [{
      id: 'p1', title: 'Servicebericht', fields: [
        { id: 'f1', type: 'heading', label: 'Einsatzdaten', level: 'h2' },
        { id: 'f2', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
        { id: 'f3', type: 'time', label: 'Uhrzeit', required: true, width: 'half' },
        { id: 'f4', type: 'text', label: 'Kundenname', required: true, placeholder: 'z.B. Müller GmbH', width: 'full', validation: { minLength: 2, maxLength: 100 } },
        { id: 'f5', type: 'text', label: 'Anlagentyp', required: true, placeholder: 'z.B. PV-Anlage 10kWp', width: 'full' },
        { id: 'f6', type: 'textarea', label: 'Fehlerbeschreibung', required: true, placeholder: 'Was lag vor?', width: 'full', validation: { minLength: 10 } },
        { id: 'f7', type: 'textarea', label: 'Durchgeführte Arbeiten', required: true, placeholder: 'Was wurde gemacht?', width: 'full', validation: { minLength: 10 } },
        { id: 'f8', type: 'select', label: 'Status', required: true, width: 'half', options: [
          { value: 'erledigt', label: 'Erledigt' },
          { value: 'teilweise', label: 'Teilweise erledigt' },
          { value: 'offen', label: 'Folgetermin nötig' },
        ]},
        { id: 'f9', type: 'textarea', label: 'Bemerkungen', required: false, placeholder: 'Weitere Hinweise...', width: 'full' },
      ]
    }],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#2563eb' },
  },
  {
    id: 'tpl-abnahme',
    name: 'Baustellenabnahme',
    description: 'Vollständiges Abnahmeprotokoll mit Checkliste und Mängelerfassung',
    category: 'abnahme',
    icon: '🏗️',
    version: 1,
    isDemo: true,
    pages: [
      {
        id: 'p1', title: 'Projektdaten', fields: [
          { id: 'a1', type: 'heading', label: 'Projektinformationen', level: 'h2' },
          { id: 'a2', type: 'text', label: 'Projektbezeichnung', required: true, placeholder: 'z.B. PV-Anlage Müller', width: 'full', validation: { minLength: 3 } },
          { id: 'a3', type: 'text', label: 'Auftraggeber', required: true, placeholder: 'Firmenname', width: 'half' },
          { id: 'a4', type: 'text', label: 'Ansprechpartner', required: true, width: 'half' },
          { id: 'a5', type: 'text', label: 'Adresse', required: true, placeholder: 'Straße, PLZ Ort', width: 'full' },
          { id: 'a6', type: 'date', label: 'Abnahmedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'a7', type: 'text', label: 'Monteur', required: true, width: 'half' },
          { id: 'a8', type: 'divider' },
          { id: 'a9', type: 'select', label: 'Anlagentyp', required: true, width: 'half', options: [
            { value: 'pv', label: 'Photovoltaik' },
            { value: 'solarthermie', label: 'Solarthermie' },
            { value: 'waermepumpe', label: 'Wärmepumpe' },
            { value: 'heizung', label: 'Heizungsanlage' },
            { value: 'sonstiges', label: 'Sonstiges' },
          ]},
          { id: 'a10', type: 'number', label: 'Anlagenleistung (kW)', width: 'half', validation: { min: 0, max: 9999, decimals: 2 } },
        ]
      },
      {
        id: 'p2', title: 'Prüfung', fields: [
          { id: 'a11', type: 'heading', label: 'Qualitätsprüfung', level: 'h2' },
          { id: 'a12', type: 'info', label: '', content: 'Bitte alle Prüfpunkte sorgfältig kontrollieren und bewerten.' },
          { id: 'a13', type: 'checklist', label: 'Installationsprüfung', required: true, items: [
            { id: 'c1', label: 'Montage fachgerecht ausgeführt' },
            { id: 'c2', label: 'Kabelführung ordnungsgemäß' },
            { id: 'c3', label: 'Dichtungen geprüft' },
            { id: 'c4', label: 'Beschriftungen vorhanden' },
            { id: 'c5', label: 'Sicherheitseinrichtungen geprüft' },
          ], allowNotes: true },
          { id: 'a14', type: 'rating', label: 'Gesamteindruck Installation', required: true, maxStars: 5, ratingType: 'stars' },
          { id: 'a15', type: 'divider' },
          { id: 'a16', type: 'toggle', label: 'Mängel vorhanden?', labelOn: 'Ja', labelOff: 'Nein' },
        ]
      },
      {
        id: 'p3', title: 'Mängel & Abschluss', fields: [
          { id: 'a17', type: 'heading', label: 'Mängelerfassung', level: 'h2', conditions: [{ field: 'a16', operator: 'equals', value: true, action: 'show' }] },
          { id: 'a18', type: 'textarea', label: 'Mängelbeschreibung', required: false, placeholder: 'Mängel detailliert beschreiben...', width: 'full', validation: { minLength: 10 }, conditions: [{ field: 'a16', operator: 'equals', value: true, action: 'show' }] },
          { id: 'a19', type: 'select', label: 'Schweregrad', width: 'half', options: [
            { value: 'gering', label: 'Gering — Nutzung möglich' },
            { value: 'mittel', label: 'Mittel — Nachbesserung nötig' },
            { value: 'schwer', label: 'Schwer — Nutzung eingeschränkt' },
          ], conditions: [{ field: 'a16', operator: 'equals', value: true, action: 'show' }] },
          { id: 'a20', type: 'date', label: 'Nachbesserung bis', width: 'half', conditions: [{ field: 'a16', operator: 'equals', value: true, action: 'show' }] },
          { id: 'a21', type: 'divider' },
          { id: 'a22', type: 'heading', label: 'Abschluss', level: 'h2' },
          { id: 'a23', type: 'toggle', label: 'Anlage abgenommen', labelOn: 'Ja', labelOff: 'Nein', required: true },
          { id: 'a24', type: 'textarea', label: 'Abschlussbemerkungen', placeholder: 'Weitere Hinweise...', width: 'full' },
        ]
      }
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#f0c040' },
  },
  {
    id: 'tpl-mangel',
    name: 'Mängelprotokoll',
    description: 'Mängel dokumentieren mit Fotos und Bewertung',
    category: 'mangel',
    icon: '⚠️',
    version: 1,
    isDemo: true,
    pages: [
      {
        id: 'p1', title: 'Standort & Projekt', fields: [
          { id: 'm1', type: 'heading', label: 'Projektinformationen', level: 'h2' },
          { id: 'm2', type: 'text', label: 'Projekt / Baustelle', required: true, width: 'full' },
          { id: 'm3', type: 'text', label: 'Adresse', required: true, width: 'full' },
          { id: 'm4', type: 'date', label: 'Begehungsdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'm5', type: 'text', label: 'Erfasst durch', required: true, width: 'half' },
        ]
      },
      {
        id: 'p2', title: 'Mängelliste', fields: [
          { id: 'm6', type: 'heading', label: 'Erfasste Mängel', level: 'h2' },
          { id: 'm7', type: 'info', label: '', content: 'Jeden Mangel einzeln beschreiben und bewerten.' },
          { id: 'm8', type: 'checklist', label: 'Mängel-Checkliste', required: true, items: [
            { id: 'mc1', label: 'Elektroinstallation geprüft' },
            { id: 'mc2', label: 'Sanitärinstallation geprüft' },
            { id: 'mc3', label: 'Dämmung / Abdichtung geprüft' },
            { id: 'mc4', label: 'Malerarbeiten geprüft' },
            { id: 'mc5', label: 'Bodenbeläge geprüft' },
            { id: 'mc6', label: 'Fenster / Türen geprüft' },
            { id: 'mc7', label: 'Außenanlagen geprüft' },
          ], allowNotes: true },
          { id: 'm9', type: 'textarea', label: 'Detaillierte Mängelbeschreibung', required: true, placeholder: 'Alle gefundenen Mängel beschreiben...', width: 'full', validation: { minLength: 20 } },
          { id: 'm10', type: 'rating', label: 'Gesamtzustand', required: true, maxStars: 5, ratingType: 'stars' },
          { id: 'm11', type: 'select', label: 'Priorität', required: true, width: 'half', options: [
            { value: 'niedrig', label: 'Niedrig' },
            { value: 'mittel', label: 'Mittel' },
            { value: 'hoch', label: 'Hoch' },
            { value: 'kritisch', label: 'Kritisch' },
          ]},
          { id: 'm12', type: 'text', label: 'Verantwortlich', required: true, width: 'half' },
          { id: 'm13', type: 'date', label: 'Frist', required: true, width: 'half' },
          { id: 'm14', type: 'textarea', label: 'Maßnahmen', placeholder: 'Empfohlene Maßnahmen...', width: 'full' },
        ]
      }
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#dc2626' },
  }
];

// ═══ FEATURE: Users & Auth (Chat F.1) ═══
const USERS = [
  { id: 'u1', name: 'Max Admin', email: 'admin@formpilot.de', pin: '1234', role: 'admin' },
  { id: 'u2', name: 'Tom Monteur', email: 'tom@formpilot.de', pin: '5678', role: 'monteur' },
  { id: 'u3', name: 'Lisa Büro', email: 'lisa@formpilot.de', pin: '9999', role: 'buero' },
];

// ═══ FEATURE: Persistence Helpers (Chat F.1, extended C02) ═══
const STORAGE_KEYS = {
  submissions: 'fp_submissions',
  drafts: 'fp_drafts',
  session: 'fp_session',
  templates: 'fp_templates',
};

const storageGet = async (key) => {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
};

const storageSet = async (key, value) => {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch (e) { console.error('Storage error:', e); }
};

// ═══ FEATURE: Conditional Logic Engine (Chat F.1) ═══
const evaluateConditions = (conditions, conditionLogic, formData) => {
  if (!conditions || conditions.length === 0) return true;
  const results = conditions.map(c => {
    const val = formData[c.field];
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'notEquals': return val !== c.value;
      case 'contains': return String(val || '').includes(c.value);
      case 'gt': return Number(val) > Number(c.value);
      case 'lt': return Number(val) < Number(c.value);
      case 'isEmpty': return !val || val === '' || (Array.isArray(val) && val.length === 0);
      case 'isNotEmpty': return val && val !== '' && !(Array.isArray(val) && val.length === 0);
      default: return true;
    }
  });
  const logic = conditionLogic || 'AND';
  const passes = logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  const action = conditions[0]?.action || 'show';
  if (action === 'show') return passes;
  if (action === 'hide') return !passes;
  return true;
};

// ═══ FEATURE: Validation Engine (Chat F.1) ═══
const validateField = (field, value, formData) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  const v = field.validation || {};
  if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} ist erforderlich`;
  }
  if (!value && !field.required) return null;
  if (field.type === 'text' || field.type === 'textarea') {
    if (v.minLength && String(value).length < v.minLength) return `Mindestens ${v.minLength} Zeichen`;
    if (v.maxLength && String(value).length > v.maxLength) return `Maximal ${v.maxLength} Zeichen`;
    if (v.pattern && !new RegExp(v.pattern).test(value)) return `Ungültiges Format`;
  }
  if (field.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return 'Bitte eine Zahl eingeben';
    if (v.min !== undefined && n < v.min) return `Minimum: ${v.min}`;
    if (v.max !== undefined && n > v.max) return `Maximum: ${v.max}`;
  }
  if (field.type === 'checklist' && field.required) {
    const checked = Object.values(value || {}).filter(v => v?.checked).length;
    if (checked === 0) return 'Mindestens ein Punkt muss geprüft werden';
  }
  return null;
};

const validatePage = (page, formData) => {
  const errors = {};
  const inputFields = (page?.fields || []).filter(f => !['heading', 'divider', 'info'].includes(f.type));
  inputFields.forEach(f => {
    if (f.conditions && !evaluateConditions(f.conditions, f.conditionLogic, formData)) return;
    const err = validateField(f, formData[f.id], formData);
    if (err) errors[f.id] = err;
  });
  return errors;
};

// ═══ FEATURE: Styles (Chat F.1) ═══
const styles = {
  app: {
    fontFamily: S.font.sans,
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${S.colors.bg} 0%, #e0e7ef 100%)`,
    color: S.colors.text,
    display: 'flex',
    flexDirection: 'column',
    WebkitFontSmoothing: 'antialiased',
  },
  topBar: {
    background: S.glass.background,
    backdropFilter: S.glass.backdropFilter,
    borderBottom: `1px solid ${S.colors.border}`,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { flex: 1, padding: '20px', maxWidth: '960px', width: '100%', margin: '0 auto', paddingBottom: '100px' },
  card: {
    background: S.colors.bgCard, backdropFilter: 'blur(12px)', borderRadius: S.radius.lg,
    border: `1px solid ${S.colors.border}`, boxShadow: S.colors.shadow, padding: '24px', marginBottom: '16px', transition: S.transition,
  },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, background: S.glass.background,
    backdropFilter: S.glass.backdropFilter, borderTop: `1px solid ${S.colors.border}`,
    display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 100,
  },
  navItem: (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 16px',
    borderRadius: S.radius.md, fontSize: '11px', fontWeight: active ? 700 : 500,
    color: active ? S.colors.primary : S.colors.textSecondary, background: active ? `${S.colors.primary}11` : 'transparent',
    transition: S.transition, cursor: 'pointer', border: 'none', fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
  }),
  btn: (variant = 'primary', size = 'md') => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px',
    borderRadius: S.radius.md, fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    fontWeight: 600, fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: S.transition,
    WebkitTapHighlightColor: 'transparent',
    ...(variant === 'primary' && { background: S.colors.primary, color: S.colors.white }),
    ...(variant === 'secondary' && { background: `${S.colors.primary}10`, color: S.colors.primary, border: `1.5px solid ${S.colors.primary}30` }),
    ...(variant === 'danger' && { background: S.colors.danger, color: S.colors.white }),
    ...(variant === 'ghost' && { background: 'transparent', color: S.colors.textSecondary }),
    ...(variant === 'success' && { background: S.colors.success, color: S.colors.white }),
  }),
  input: (hasError) => ({
    width: '100%', padding: '12px 14px', borderRadius: S.radius.md,
    border: `1.5px solid ${hasError ? S.colors.danger : S.colors.border}`,
    fontSize: '15px', fontFamily: 'inherit', background: S.colors.bgInput, color: S.colors.text,
    transition: S.transition, outline: 'none', boxSizing: 'border-box', minHeight: '48px',
  }),
  fieldLabel: { display: 'block', fontSize: '14px', fontWeight: 600, color: S.colors.text, marginBottom: '6px' },
  fieldError: { fontSize: '12px', color: S.colors.danger, marginTop: '4px', fontWeight: 500 },
  badge: (color) => ({
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: S.radius.full,
    fontSize: '12px', fontWeight: 600, background: `${color}18`, color: color,
  }),
  progressBar: { height: '6px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden', marginBottom: '20px' },
  progressFill: (pct) => ({
    height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${S.colors.primary}, ${S.colors.accent})`,
    borderRadius: S.radius.full, transition: 'width 0.4s ease',
  }),
};

// ═══ FEATURE: Field Renderer Components (Chat F.1) ═══

const TextField = ({ field, value, onChange, error }) => (
  <input type="text" style={styles.input(!!error)} value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={field.placeholder || ''} maxLength={field.validation?.maxLength}
    onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${S.colors.primary}18`; }}
    onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; e.target.style.boxShadow = 'none'; }} />
);

const TextareaField = ({ field, value, onChange, error }) => (
  <textarea style={{ ...styles.input(!!error), minHeight: '100px', resize: 'vertical' }} value={value || ''}
    onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} rows={field.validation?.rows || 4}
    maxLength={field.validation?.maxLength}
    onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${S.colors.primary}18`; }}
    onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; e.target.style.boxShadow = 'none'; }} />
);

const NumberField = ({ field, value, onChange, error }) => (
  <div style={{ position: 'relative' }}>
    <input type="number" style={styles.input(!!error)} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      min={field.validation?.min} max={field.validation?.max} step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : 1}
      onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; }} onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; }} />
    {field.validation?.unit && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: S.colors.textMuted, fontSize: '14px' }}>{field.validation.unit}</span>}
  </div>
);

const DateField = ({ field, value, onChange, error }) => {
  const defaultVal = (!value && field.validation?.defaultToday) ? new Date().toISOString().split('T')[0] : value;
  useEffect(() => { if (!value && field.validation?.defaultToday) onChange(new Date().toISOString().split('T')[0]); }, []);
  return <input type="date" style={styles.input(!!error)} value={defaultVal || ''} onChange={e => onChange(e.target.value)} />;
};

const TimeField = ({ field, value, onChange, error }) => (
  <input type="time" style={styles.input(!!error)} value={value || ''} onChange={e => onChange(e.target.value)} />
);

const SelectField = ({ field, value, onChange, error }) => (
  <select style={{ ...styles.input(!!error), cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23475569\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
    value={value || ''} onChange={e => onChange(e.target.value)}>
    <option value="">— Bitte wählen —</option>
    {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const RadioField = ({ field, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {(field.options || []).map(o => (
      <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${value === o.value ? S.colors.primary : S.colors.border}`, background: value === o.value ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${value === o.value ? S.colors.primary : S.colors.textMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: S.transition, flexShrink: 0 }}>
          {value === o.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: S.colors.primary }} />}
        </div>
        <span style={{ fontSize: '15px' }}>{o.label}</span>
        <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} style={{ display: 'none' }} />
      </label>
    ))}
  </div>
);

const CheckboxField = ({ field, value, onChange }) => {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(field.options || []).map(o => (
        <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${selected.includes(o.value) ? S.colors.primary : S.colors.border}`, background: selected.includes(o.value) ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition }}>
          <div style={{ width: 20, height: 20, borderRadius: '6px', border: `2px solid ${selected.includes(o.value) ? S.colors.primary : S.colors.textMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected.includes(o.value) ? S.colors.primary : 'transparent', transition: S.transition, flexShrink: 0 }}>
            {selected.includes(o.value) && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: '15px' }}>{o.label}</span>
        </label>
      ))}
    </div>
  );
};

const ToggleField = ({ field, value, onChange }) => {
  const on = value === true;
  return (
    <button onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: S.radius.md, border: `1.5px solid ${on ? S.colors.primary : S.colors.border}`, background: on ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition, fontFamily: 'inherit', width: '100%' }}>
      <div style={{ width: 48, height: 26, borderRadius: 13, background: on ? S.colors.primary : S.colors.textMuted, position: 'relative', transition: S.transition, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 25 : 3, transition: S.transition, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: '15px', fontWeight: 500, color: S.colors.text }}>{on ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein')}</span>
    </button>
  );
};

const ChecklistField = ({ field, value, onChange }) => {
  const data = value || {};
  const update = (itemId, key, val) => onChange({ ...data, [itemId]: { ...(data[itemId] || {}), [key]: val } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {(field.items || []).map(item => {
        const itemData = data[item.id] || {};
        return (
          <div key={item.id} style={{ padding: '12px 14px', borderRadius: S.radius.md, border: `1.5px solid ${itemData.checked ? S.colors.success + '60' : S.colors.border}`, background: itemData.checked ? `${S.colors.success}08` : S.colors.bgInput, transition: S.transition }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, borderRadius: '6px', border: `2px solid ${itemData.checked ? S.colors.success : S.colors.textMuted}`, background: itemData.checked ? S.colors.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: S.transition, flexShrink: 0 }} onClick={() => update(item.id, 'checked', !itemData.checked)}>
                {itemData.checked && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
            </label>
            {field.allowNotes && itemData.checked && (
              <input type="text" placeholder="Notiz hinzufügen..." value={itemData.note || ''} onChange={e => update(item.id, 'note', e.target.value)}
                style={{ ...styles.input(false), marginTop: '8px', minHeight: '40px', fontSize: '13px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const RatingField = ({ field, value, onChange }) => {
  const max = field.maxStars || 5;
  const current = value || 0;
  if (field.ratingType === 'traffic') {
    const colors = [{ value: 1, color: '#16a34a', label: 'Gut' }, { value: 2, color: '#f59e0b', label: 'Mittel' }, { value: 3, color: '#dc2626', label: 'Schlecht' }];
    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        {colors.map(c => (
          <button key={c.value} onClick={() => onChange(c.value)} style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${current === c.value ? c.color : S.colors.border}`, background: current === c.value ? c.color : `${c.color}18`, cursor: 'pointer', transition: S.transition, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: current === c.value ? '#fff' : c.color, fontFamily: 'inherit' }}>{c.label}</button>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button key={star} onClick={() => onChange(star)} style={{ fontSize: '32px', cursor: 'pointer', background: 'none', border: 'none', padding: '4px', transition: S.transition, transform: star <= current ? 'scale(1.1)' : 'scale(1)', filter: star <= current ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</button>
      ))}
      {current > 0 && <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '14px', fontWeight: 600, color: S.colors.textSecondary }}>{current}/{max}</span>}
    </div>
  );
};

const HeadingField = ({ field }) => {
  const Tag = field.level === 'h3' ? 'h3' : field.level === 'h4' ? 'h4' : 'h2';
  const sizes = { h2: '20px', h3: '17px', h4: '15px' };
  return <Tag style={{ fontSize: sizes[Tag], fontWeight: 700, margin: '8px 0 4px', color: S.colors.text }}>{field.label}</Tag>;
};

const DividerField = () => <hr style={{ border: 'none', borderTop: `1px solid ${S.colors.border}`, margin: '12px 0' }} />;

const InfoField = ({ field }) => (
  <div style={{ padding: '12px 16px', borderRadius: S.radius.md, background: `${S.colors.primary}08`, border: `1px solid ${S.colors.primary}20`, fontSize: '14px', color: S.colors.textSecondary, lineHeight: 1.5 }}>
    ℹ️ {field.content || field.label}
  </div>
);

// ═══ FEATURE: Form Field Renderer (Chat F.1) ═══
const FormField = ({ field, value, onChange, error, formData }) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  if (field.type === 'heading') return <HeadingField field={field} />;
  if (field.type === 'divider') return <DividerField />;
  if (field.type === 'info') return <InfoField field={field} />;
  const widthMap = { full: '100%', half: 'calc(50% - 8px)', third: 'calc(33.33% - 11px)' };
  const renderInput = () => {
    switch (field.type) {
      case 'text': return <TextField field={field} value={value} onChange={onChange} error={error} />;
      case 'textarea': return <TextareaField field={field} value={value} onChange={onChange} error={error} />;
      case 'number': return <NumberField field={field} value={value} onChange={onChange} error={error} />;
      case 'date': return <DateField field={field} value={value} onChange={onChange} error={error} />;
      case 'time': return <TimeField field={field} value={value} onChange={onChange} error={error} />;
      case 'select': return <SelectField field={field} value={value} onChange={onChange} error={error} />;
      case 'radio': return <RadioField field={field} value={value} onChange={onChange} />;
      case 'checkbox': return <CheckboxField field={field} value={value} onChange={onChange} />;
      case 'toggle': return <ToggleField field={field} value={value} onChange={onChange} />;
      case 'checklist': return <ChecklistField field={field} value={value} onChange={onChange} />;
      case 'rating': return <RatingField field={field} value={value} onChange={onChange} />;
      default: return <InfoField field={{ content: `Unbekannter Feldtyp: ${field.type}` }} />;
    }
  };
  return (
    <div style={{ width: widthMap[field.width] || '100%', minWidth: 0 }}>
      {field.label && <label style={styles.fieldLabel}>{field.label}{field.required && <span style={{ color: S.colors.danger, marginLeft: '4px' }}>*</span>}</label>}
      {renderInput()}
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  );
};

// ═══ FEATURE: Login Screen (Chat F.1) ═══
const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const handleLogin = () => {
    if (!selectedUser) { setError('Bitte Benutzer wählen'); return; }
    const user = USERS.find(u => u.id === selectedUser);
    if (user && user.pin === pin) { onLogin(user); } else { setError('Falsche PIN'); setPin(''); }
  };
  return (
    <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📋</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>FormPilot</h1>
        <p style={{ color: S.colors.textSecondary, marginBottom: '28px', fontSize: '14px' }}>Digitale Formulare für Handwerksbetriebe</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {USERS.map(u => (
            <button key={u.id} onClick={() => { setSelectedUser(u.id); setError(''); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: S.radius.md, border: `2px solid ${selectedUser === u.id ? S.colors.primary : S.colors.border}`, background: selectedUser === u.id ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', fontFamily: 'inherit', transition: S.transition, textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedUser === u.id ? S.colors.primary : S.colors.border, color: selectedUser === u.id ? '#fff' : S.colors.textSecondary, fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{u.name.split(' ').map(w => w[0]).join('')}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: S.colors.textMuted }}>{u.role === 'admin' ? 'Administrator' : u.role === 'monteur' ? 'Monteur' : 'Büro'}</div>
              </div>
            </button>
          ))}
        </div>
        {selectedUser && (
          <div style={{ marginBottom: '16px' }}>
            <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN eingeben" value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ ...styles.input(!!error), textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} autoFocus />
          </div>
        )}
        {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
        <button onClick={handleLogin} style={{ ...styles.btn('primary', 'lg'), width: '100%' }}>Anmelden</button>
        <p style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '16px' }}>Demo-PINs: Admin 1234 · Monteur 5678 · Büro 9999</p>
      </div>
    </div>
  );
};

// ═══ FEATURE: Template Selector (Chat F.1, updated C02) ═══
const TemplateSelector = ({ onSelect, customTemplates }) => {
  const allTemplates = [...DEMO_TEMPLATES, ...(customTemplates || [])];
  const categoryColors = { service: S.colors.primary, abnahme: S.colors.accent, mangel: S.colors.danger, pruefung: S.colors.primaryLight, uebergabe: S.colors.success, custom: S.colors.textSecondary };
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Formular ausfüllen</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>Vorlage wählen und neues Formular starten</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allTemplates.map(t => (
          <button key={t.id} onClick={() => onSelect(t)} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${S.colors.border}`, fontFamily: 'inherit', padding: '20px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = S.colors.shadowLg; e.currentTarget.style.borderColor = categoryColors[t.category] || S.colors.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.colors.shadow; e.currentTarget.style.borderColor = S.colors.border; }}>
            <div style={{ fontSize: '36px', flexShrink: 0 }}>{t.icon || '📋'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description}</div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={styles.badge(categoryColors[t.category] || S.colors.textSecondary)}>{t.category}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} {t.pages.length === 1 ? 'Seite' : 'Seiten'}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.reduce((a, p) => a + p.fields.filter(f => !['heading', 'divider', 'info'].includes(f.type)).length, 0)} Felder</span>
                {!t.isDemo && <span style={styles.badge(S.colors.primary)}>Eigenes</span>}
              </div>
            </div>
            <span style={{ fontSize: '20px', color: S.colors.textMuted, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══ FEATURE: Form Filler (Chat F.1) ═══
const FormFiller = ({ template, onSubmit, onCancel, initialData, draftId }) => {
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

// ═══ FEATURE: Submissions List (Chat F.1, updated C02) ═══
const SubmissionsList = ({ submissions, user, allTemplates }) => {
  const statusColors = { draft: S.colors.warning, completed: S.colors.success, sent: S.colors.primary, archived: S.colors.textMuted };
  const statusLabels = { draft: 'Entwurf', completed: 'Abgeschlossen', sent: 'Versendet', archived: 'Archiviert' };
  const templateMap = {};
  (allTemplates || DEMO_TEMPLATES).forEach(t => { templateMap[t.id] = t; });
  if (submissions.length === 0) return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Eingereichte Formulare</h2>
      <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
        <p style={{ color: S.colors.textSecondary }}>Noch keine Formulare eingereicht.</p>
      </div>
    </div>
  );
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Eingereichte Formulare</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>{submissions.length} Formular{submissions.length !== 1 ? 'e' : ''}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(sub => {
          const tpl = templateMap[sub.templateId];
          return (
            <div key={sub.id} style={{ ...styles.card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{tpl?.icon || '📋'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{tpl?.name || 'Formular'}</div>
                  <div style={{ fontSize: '12px', color: S.colors.textMuted }}>{new Date(sub.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}{sub.filledByName && ` · ${sub.filledByName}`}</div>
                </div>
                <span style={styles.badge(statusColors[sub.status] || S.colors.textMuted)}>{statusLabels[sub.status] || sub.status}</span>
              </div>
              {sub.data && Object.keys(sub.data).length > 0 && (() => {
                const tplFields = tpl?.pages?.flatMap(p => p.fields) || [];
                const preview = tplFields.filter(f => ['text', 'select'].includes(f.type) && sub.data[f.id]).slice(0, 3);
                if (preview.length === 0) return null;
                return (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${S.colors.border}`, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {preview.map(f => <div key={f.id} style={{ fontSize: '12px' }}><span style={{ color: S.colors.textMuted }}>{f.label}: </span><span style={{ fontWeight: 500 }}>{String(sub.data[f.id]).slice(0, 40)}</span></div>)}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══ FEATURE: Settings Screen (Chat F.1, updated C02) ═══
const SettingsScreen = ({ user, onLogout }) => (
  <div>
    <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Einstellungen</h2>
    <div style={styles.card}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Benutzer</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>{user.name.split(' ').map(w => w[0]).join('')}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>{user.name}</div>
          <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{user.email}</div>
          <span style={styles.badge(S.colors.primary)}>{user.role === 'admin' ? 'Administrator' : user.role === 'monteur' ? 'Monteur' : 'Büro'}</span>
        </div>
      </div>
      <button onClick={onLogout} style={{ ...styles.btn('danger'), width: '100%' }}>Abmelden</button>
    </div>
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Über FormPilot</h3>
      <p style={{ fontSize: '13px', color: S.colors.textSecondary, lineHeight: 1.6 }}>Version 2.0 (Chat C02: Builder Grundgerüst)<br />Formular-Generator für Handwerksbetriebe.</p>
    </div>
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Feature-Flags</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontFamily: S.font.mono }}>
        <div><span style={{ color: S.colors.success }}>●</span> fp_core_engine: true</div>
        <div><span style={{ color: S.colors.success }}>●</span> fp_form_filler: true</div>
        <div><span style={{ color: S.colors.success }}>●</span> fp_form_builder: true</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_signature: false (C04)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_photo: false (C04)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_pdf: false (C05)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_email: false (C06)</div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// FEATURE: Form Builder (Chat C02)
// ═══════════════════════════════════════════════════════════════

const FIELD_PALETTE = [
  { group: 'Texteingabe', items: [
    { type: 'text', icon: '📝', label: 'Textfeld', desc: 'Einzeiliger Text' },
    { type: 'textarea', icon: '📄', label: 'Textbereich', desc: 'Mehrzeiliger Text' },
    { type: 'number', icon: '#️⃣', label: 'Zahl', desc: 'Numerischer Wert' },
  ]},
  { group: 'Datum & Zeit', items: [
    { type: 'date', icon: '📅', label: 'Datum', desc: 'Datumsauswahl' },
    { type: 'time', icon: '🕐', label: 'Uhrzeit', desc: 'Zeitauswahl' },
  ]},
  { group: 'Auswahl', items: [
    { type: 'select', icon: '🔽', label: 'Dropdown', desc: 'Einzelauswahl' },
    { type: 'radio', icon: '⭕', label: 'Radio', desc: 'Optionen (eine)' },
    { type: 'checkbox', icon: '☑️', label: 'Checkbox', desc: 'Mehrfachauswahl' },
    { type: 'toggle', icon: '🔘', label: 'Toggle', desc: 'Ja/Nein-Schalter' },
  ]},
  { group: 'Prüfung', items: [
    { type: 'checklist', icon: '✅', label: 'Checkliste', desc: 'Prüfpunkte' },
    { type: 'rating', icon: '⭐', label: 'Bewertung', desc: 'Sterne/Ampel' },
  ]},
  { group: 'Layout', items: [
    { type: 'heading', icon: '📌', label: 'Überschrift', desc: 'Abschnitt-Titel' },
    { type: 'divider', icon: '➖', label: 'Trennlinie', desc: 'Optische Trennung' },
    { type: 'info', icon: 'ℹ️', label: 'Info-Text', desc: 'Hinweisblock' },
  ]},
  { group: 'Erweitert', items: [
    { type: 'signature', icon: '✍️', label: 'Unterschrift', desc: 'Kommt in C04', disabled: true },
    { type: 'photo', icon: '📷', label: 'Foto', desc: 'Kommt in C04', disabled: true },
  ]},
];

const BUILDER_ICONS = ['📋','🔧','🏗️','⚠️','📐','🔌','🏠','🛠️','📊','✅','🔍','📦','🚿','💡','🔥','❄️','⚡','🏢','🧰','📝'];
const CATEGORY_OPTIONS = [{ value: 'abnahme', label: 'Abnahme' },{ value: 'service', label: 'Service' },{ value: 'mangel', label: 'Mängel' },{ value: 'pruefung', label: 'Prüfung' },{ value: 'uebergabe', label: 'Übergabe' },{ value: 'custom', label: 'Sonstige' }];
const FIELD_TYPE_ICONS = { text:'📝', textarea:'📄', number:'#️⃣', date:'📅', time:'🕐', select:'🔽', radio:'⭕', checkbox:'☑️', toggle:'🔘', checklist:'✅', rating:'⭐', heading:'📌', divider:'➖', info:'ℹ️', signature:'✍️', photo:'📷' };

const slugify = (str) => str.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const createField = (type) => {
  const id = `field-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const base = { id, type, label: '', placeholder: '', required: false, width: 'full', conditions: [], conditionLogic: 'AND', validation: {} };
  switch (type) {
    case 'text': return { ...base, label: 'Textfeld' };
    case 'textarea': return { ...base, label: 'Textbereich' };
    case 'number': return { ...base, label: 'Zahl' };
    case 'date': return { ...base, label: 'Datum', validation: { defaultToday: false } };
    case 'time': return { ...base, label: 'Uhrzeit' };
    case 'select': return { ...base, label: 'Auswahl', options: [{value:'option-1',label:'Option 1'},{value:'option-2',label:'Option 2'}] };
    case 'radio': return { ...base, label: 'Optionen', options: [{value:'option-1',label:'Option 1'},{value:'option-2',label:'Option 2'}] };
    case 'checkbox': return { ...base, label: 'Mehrfachauswahl', options: [{value:'option-1',label:'Option 1'},{value:'option-2',label:'Option 2'}] };
    case 'toggle': return { ...base, label: 'Ja/Nein', labelOn: 'Ja', labelOff: 'Nein' };
    case 'checklist': return { ...base, label: 'Checkliste', items: [{id:'item-1',label:'Prüfpunkt 1'},{id:'item-2',label:'Prüfpunkt 2'}], allowNotes: true };
    case 'rating': return { ...base, label: 'Bewertung', maxStars: 5, ratingType: 'stars' };
    case 'heading': return { ...base, label: 'Überschrift', level: 'h2' };
    case 'divider': return { ...base, type: 'divider', label: '' };
    case 'info': return { ...base, label: 'Info', content: 'Hinweis...' };
    default: return base;
  }
};

const createEmptyTemplate = () => ({
  id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  name: '', description: '', category: 'custom', icon: '📋', version: 1,
  pages: [{ id: `page-${Date.now()}`, title: 'Seite 1', fields: [] }],
  pdfSettings: { orientation: 'portrait', showLogo: true, showPageNumbers: true, footerText: 'Erstellt mit FormPilot', accentColor: '#2563eb' },
  emailTemplate: { subject: '', body: '', attachPdf: true, recipients: ['customer'] },
});

// ═══ FEATURE: Toast (Chat C02) ═══
const ToastMessage = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 24px', borderRadius: S.radius.md, fontWeight: 600, fontSize: '14px', background: type === 'error' ? S.colors.danger : S.colors.success, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>{message}</div>
  );
};

// ═══ FEATURE: Builder Palette (Chat C02) ═══
const BuilderPalette = ({ onAddField }) => {
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FIELD_PALETTE.map(g => [g.group, true])));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {FIELD_PALETTE.map(group => (
        <div key={group.group}>
          <button onClick={() => setOpenGroups(p => ({ ...p, [group.group]: !p[group.group] }))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: S.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'inherit' }}>
            {group.group}
            <span style={{ transform: openGroups[group.group] ? 'rotate(180deg)' : 'rotate(0)', transition: S.transition, fontSize: '10px' }}>▼</span>
          </button>
          {openGroups[group.group] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' }}>
              {group.items.map(item => (
                <div key={item.type} draggable={!item.disabled}
                  onDragStart={item.disabled ? undefined : (e) => { e.dataTransfer.setData('action','add'); e.dataTransfer.setData('fieldType',item.type); e.dataTransfer.effectAllowed = 'copy'; }}
                  onClick={item.disabled ? undefined : () => onAddField(item.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: item.disabled ? S.colors.bg : S.colors.white, cursor: item.disabled ? 'not-allowed' : 'grab', transition: S.transition, opacity: item.disabled ? 0.5 : 1, fontSize: '13px', fontFamily: 'inherit' }}
                  onMouseEnter={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.primary; e.currentTarget.style.background = `${S.colors.primary}06`; }}
                  onMouseLeave={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.border; e.currentTarget.style.background = S.colors.white; }}
                  title={item.disabled ? item.desc : `${item.label} – ${item.desc}`}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: S.colors.textMuted, lineHeight: 1.2 }}>{item.desc}</div>
                  </div>
                  {item.disabled && <span style={{ fontSize: '10px', color: S.colors.textMuted }}>🔒</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ═══ FEATURE: Builder Field Card (Chat C02) ═══
const BuilderFieldCard = ({ field, isSelected, onSelect, onDelete, onWidthChange }) => {
  const summaryParts = [];
  if (field.type !== 'divider') summaryParts.push(field.type);
  if (field.required) summaryParts.push('Pflichtfeld');
  if (field.validation?.minLength) summaryParts.push(`min ${field.validation.minLength}`);
  if (field.options) summaryParts.push(`${field.options.length} Opt.`);
  if (field.items) summaryParts.push(`${field.items.length} Pkt.`);
  if (field.conditions?.length) summaryParts.push(`${field.conditions.length} Bed.`);
  const isDisplay = ['heading','divider','info'].includes(field.type);

  return (
    <div draggable
      onDragStart={(e) => { e.dataTransfer.setData('action','move'); e.dataTransfer.setData('fieldId',field.id); e.dataTransfer.effectAllowed = 'move'; }}
      onClick={() => onSelect(field.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: S.radius.md,
        border: `2px solid ${isSelected ? S.colors.primary : S.colors.border}`,
        background: isSelected ? `${S.colors.primary}06` : S.colors.white,
        cursor: 'pointer', transition: S.transition, fontFamily: 'inherit',
        width: field.width === 'half' ? 'calc(50% - 6px)' : field.width === 'third' ? 'calc(33.33% - 8px)' : '100%',
        minWidth: 0, flexShrink: 0,
      }}>
      <span style={{ cursor: 'grab', fontSize: '14px', color: S.colors.textMuted, flexShrink: 0, userSelect: 'none' }}>≡</span>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{FIELD_TYPE_ICONS[field.type] || '📋'}</span>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {field.label || (field.type === 'divider' ? 'Trennlinie' : 'Ohne Label')}
          {field.required && <span style={{ color: S.colors.danger, marginLeft: '4px' }}>*</span>}
        </div>
        <div style={{ fontSize: '11px', color: S.colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summaryParts.join(' · ')}</div>
      </div>
      {!isDisplay && (
        <select value={field.width || 'full'} onChange={(e) => { e.stopPropagation(); onWidthChange(field.id, e.target.value); }} onClick={e => e.stopPropagation()}
          style={{ padding: '2px 4px', borderRadius: '4px', border: `1px solid ${S.colors.border}`, fontSize: '10px', background: S.colors.bgInput, cursor: 'pointer', fontFamily: 'inherit', color: S.colors.textSecondary, flexShrink: 0 }}>
          <option value="full">Full</option><option value="half">Half</option><option value="third">Third</option>
        </select>
      )}
      <button onClick={(e) => { e.stopPropagation(); if (confirm('Feld löschen?')) onDelete(field.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '14px', color: S.colors.textMuted, transition: S.transition, flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = S.colors.danger} onMouseLeave={e => e.currentTarget.style.color = S.colors.textMuted}>🗑</button>
    </div>
  );
};

// ═══ FEATURE: Builder Canvas (Chat C02) ═══
const BuilderCanvas = ({ pages, activePageIndex, onPageChange, onAddPage, onDeletePage, onRenamePage, fields, selectedFieldId, onSelectField, onDeleteField, onAddFieldAtIndex, onMoveField, onFieldWidthChange }) => {
  const [dropIndex, setDropIndex] = useState(-1);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editPageName, setEditPageName] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const container = e.currentTarget;
    const cards = Array.from(container.querySelectorAll('[data-fc]'));
    let idx = fields.length;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) { idx = i; break; }
    }
    setDropIndex(idx);
  }, [fields.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('action');
    if (action === 'add') onAddFieldAtIndex(e.dataTransfer.getData('fieldType'), dropIndex);
    else if (action === 'move') onMoveField(e.dataTransfer.getData('fieldId'), dropIndex);
    setDropIndex(-1);
  }, [dropIndex, onAddFieldAtIndex, onMoveField]);

  const commitPageEdit = () => { if (editingPageId && editPageName.trim()) onRenamePage(editingPageId, editPageName.trim()); setEditingPageId(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {pages.map((p, i) => (
          <div key={p.id}>
            {editingPageId === p.id ? (
              <input autoFocus value={editPageName} onChange={e => setEditPageName(e.target.value)} onBlur={commitPageEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitPageEdit(); if (e.key === 'Escape') setEditingPageId(null); }}
                style={{ padding: '6px 12px', borderRadius: S.radius.sm, border: `2px solid ${S.colors.primary}`, fontSize: '13px', fontFamily: 'inherit', width: '120px', outline: 'none' }} />
            ) : (
              <button onClick={() => onPageChange(i)} onDoubleClick={() => { setEditingPageId(p.id); setEditPageName(p.title); }}
                onContextMenu={e => { e.preventDefault(); if (pages.length > 1 && confirm(`Seite "${p.title}" löschen?`)) onDeletePage(i); }}
                style={{ padding: '6px 14px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: i === activePageIndex ? 700 : 500, border: `1.5px solid ${i === activePageIndex ? S.colors.primary : S.colors.border}`, background: i === activePageIndex ? `${S.colors.primary}10` : 'transparent', color: i === activePageIndex ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit', transition: S.transition }}>{p.title}</button>
            )}
          </div>
        ))}
        <button onClick={onAddPage} style={{ padding: '6px 12px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: 600, border: `1.5px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>＋</button>
      </div>
      <div onDragOver={handleDragOver} onDragLeave={() => setDropIndex(-1)} onDrop={handleDrop}
        style={{ flex: 1, minHeight: '200px', borderRadius: S.radius.lg, border: fields.length === 0 ? `2px dashed ${S.colors.border}` : 'none', padding: fields.length === 0 ? '48px 24px' : '0', display: 'flex', flexDirection: 'column', ...(fields.length === 0 && { alignItems: 'center', justifyContent: 'center' }) }}>
        {fields.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>📋</div>
            <p style={{ color: S.colors.textMuted, fontSize: '14px' }}>Felder aus der Palette hierher ziehen oder klicken</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' }}>
            {fields.map((field, i) => (
              <React.Fragment key={field.id}>
                {dropIndex === i && <div style={{ width: '100%', height: '3px', background: S.colors.primary, borderRadius: '2px', margin: '2px 0' }} />}
                <div data-fc="1" style={{ width: field.width === 'half' ? 'calc(50% - 6px)' : field.width === 'third' ? 'calc(33.33% - 8px)' : '100%' }}>
                  <BuilderFieldCard field={field} isSelected={selectedFieldId === field.id} onSelect={onSelectField} onDelete={onDeleteField} onWidthChange={onFieldWidthChange} />
                </div>
              </React.Fragment>
            ))}
            {dropIndex >= fields.length && <div style={{ width: '100%', height: '3px', background: S.colors.primary, borderRadius: '2px', margin: '2px 0' }} />}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══ FEATURE: Options Editor (Chat C02) ═══
const OptionsEditor = ({ options, onChange, itemLabel }) => {
  const lbl = itemLabel || 'Option';
  const add = () => onChange([...options, { value: `option-${options.length+1}`, label: `${lbl} ${options.length+1}` }]);
  const remove = (i) => { if (options.length <= 2) return; onChange(options.filter((_,j) => j !== i)); };
  const update = (i, key, val) => { const n = [...options]; n[i] = { ...n[i], [key]: val }; if (key === 'label') n[i].value = slugify(val) || `option-${i+1}`; onChange(n); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input value={opt.label} onChange={e => update(i,'label',e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={`${lbl} ${i+1}`} style={{ flex: 1, padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
          <button onClick={() => remove(i)} disabled={options.length <= 2} style={{ background: 'none', border: 'none', cursor: options.length <= 2 ? 'not-allowed' : 'pointer', fontSize: '13px', color: options.length <= 2 ? S.colors.border : S.colors.textMuted, padding: '4px', flexShrink: 0 }}>🗑</button>
        </div>
      ))}
      <button onClick={add} style={{ padding: '6px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>＋ {lbl} hinzufügen</button>
    </div>
  );
};

// ═══ FEATURE: Checklist Items Editor (Chat C02) ═══
const ChecklistItemsEditor = ({ items, onChange }) => {
  const add = () => onChange([...items, { id: `item-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, label: `Prüfpunkt ${items.length+1}` }]);
  const remove = (i) => { if (items.length <= 1) return; onChange(items.filter((_,j) => j !== i)); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: S.colors.textMuted, flexShrink: 0 }}>{i+1}.</span>
          <input value={item.label} onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            style={{ flex: 1, padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
          <button onClick={() => remove(i)} disabled={items.length <= 1} style={{ background: 'none', border: 'none', cursor: items.length <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px', color: items.length <= 1 ? S.colors.border : S.colors.textMuted, padding: '4px', flexShrink: 0 }}>🗑</button>
        </div>
      ))}
      <button onClick={add} style={{ padding: '6px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>＋ Prüfpunkt hinzufügen</button>
    </div>
  );
};

// ═══ FEATURE: Mini Toggle helper (Chat C02) ═══
const MiniToggle = ({ value, onChange, label }) => (
  <button onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: S.radius.sm, border: `1px solid ${value ? S.colors.primary : S.colors.border}`, background: value ? `${S.colors.primary}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', fontSize: '13px' }}>
    <div style={{ width: 36, height: 20, borderRadius: 10, background: value ? S.colors.primary : S.colors.textMuted, position: 'relative', transition: S.transition, flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 18 : 2, transition: S.transition }} />
    </div>
    <span>{label || (value ? 'Ja' : 'Nein')}</span>
  </button>
);

// ═══ FEATURE: Builder Settings Panel (Chat C02) ═══
const BuilderSettingsPanel = ({ field, allFields, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  if (!field) return null;
  const upd = (key, value) => onChange({ ...field, [key]: value });
  const updV = (key, value) => onChange({ ...field, validation: { ...(field.validation || {}), [key]: value } });
  const isDisplay = ['heading','divider','info'].includes(field.type);
  const hasOptions = ['select','radio','checkbox'].includes(field.type);
  const referenceFields = allFields.filter(f => f.id !== field.id && !['heading','divider','info'].includes(f.type));
  const sI = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const sL = { display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px', marginTop: '12px' };
  const tabS = (id) => ({ flex: 1, padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: activeTab === id ? 700 : 500, border: 'none', borderBottom: `2px solid ${activeTab === id ? S.colors.primary : 'transparent'}`, background: 'none', color: activeTab === id ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' });

  const getOps = (refType) => {
    switch (refType) {
      case 'text': case 'textarea': return [{v:'equals',l:'ist gleich'},{v:'notEquals',l:'ist nicht'},{v:'contains',l:'enthält'},{v:'isEmpty',l:'ist leer'},{v:'isNotEmpty',l:'ist nicht leer'}];
      case 'number': case 'rating': return [{v:'equals',l:'ist gleich'},{v:'notEquals',l:'ist nicht'},{v:'gt',l:'größer als'},{v:'lt',l:'kleiner als'}];
      case 'toggle': return [{v:'equals',l:'ist gleich'}];
      case 'select': case 'radio': return [{v:'equals',l:'ist gleich'},{v:'notEquals',l:'ist nicht'}];
      default: return [{v:'equals',l:'ist gleich'},{v:'isEmpty',l:'ist leer'}];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>{FIELD_TYPE_ICONS[field.type] || '📋'} {field.type}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: S.colors.textMuted }}>✕</button>
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${S.colors.border}`, marginBottom: '12px' }}>
        <button style={tabS('general')} onClick={() => setActiveTab('general')}>Allgemein</button>
        {!isDisplay && <button style={tabS('validation')} onClick={() => setActiveTab('validation')}>Validierung</button>}
        <button style={tabS('conditions')} onClick={() => setActiveTab('conditions')}>Bedingungen</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>

        {/* ── GENERAL ── */}
        {activeTab === 'general' && <>
          {field.type !== 'divider' && <><label style={sL}>Label</label><input value={field.label || ''} onChange={e => upd('label',e.target.value)} style={sI} autoFocus placeholder="Feldname" /></>}
          {!isDisplay && <><label style={sL}>Breite</label><div style={{ display: 'flex', gap: '4px' }}>{['full','half','third'].map(w => <button key={w} onClick={() => upd('width',w)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.width === w ? S.colors.primary : S.colors.border}`, background: field.width === w ? `${S.colors.primary}10` : 'transparent', color: field.width === w ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{w === 'full' ? 'Voll' : w === 'half' ? 'Halb' : 'Drittel'}</button>)}</div></>}
          {!isDisplay && <><label style={sL}>Pflichtfeld</label><MiniToggle value={field.required} onChange={v => upd('required',v)} /></>}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && <><label style={sL}>Placeholder</label><input value={field.placeholder || ''} onChange={e => upd('placeholder',e.target.value)} style={sI} placeholder="Platzhaltertext..." /></>}
          {field.type === 'number' && <><label style={sL}>Einheit</label><input value={field.validation?.unit || ''} onChange={e => updV('unit',e.target.value)} style={sI} placeholder="z.B. kW, m²" /></>}
          {field.type === 'toggle' && <><label style={sL}>Label An</label><input value={field.labelOn || 'Ja'} onChange={e => upd('labelOn',e.target.value)} style={sI} /><label style={sL}>Label Aus</label><input value={field.labelOff || 'Nein'} onChange={e => upd('labelOff',e.target.value)} style={sI} /></>}
          {field.type === 'heading' && <><label style={sL}>Ebene</label><div style={{ display: 'flex', gap: '4px' }}>{['h2','h3','h4'].map(lv => <button key={lv} onClick={() => upd('level',lv)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.level === lv ? S.colors.primary : S.colors.border}`, background: field.level === lv ? `${S.colors.primary}10` : 'transparent', color: field.level === lv ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{lv.toUpperCase()}</button>)}</div></>}
          {field.type === 'info' && <><label style={sL}>Inhalt</label><textarea value={field.content || ''} onChange={e => upd('content',e.target.value)} style={{ ...sI, minHeight: '80px', resize: 'vertical' }} /></>}
          {hasOptions && <><label style={sL}>Optionen (min. 2)</label><OptionsEditor options={field.options || []} onChange={o => upd('options',o)} /></>}
          {field.type === 'checklist' && <><label style={sL}>Prüfpunkte</label><ChecklistItemsEditor items={field.items || []} onChange={i => upd('items',i)} /><label style={sL}>Notizen erlauben</label><MiniToggle value={field.allowNotes} onChange={v => upd('allowNotes',v)} /></>}
          {field.type === 'rating' && <>
            <label style={sL}>Typ</label>
            <div style={{ display: 'flex', gap: '4px' }}>{[{v:'stars',l:'⭐ Sterne'},{v:'traffic',l:'🚦 Ampel'}].map(rt => <button key={rt.v} onClick={() => upd('ratingType',rt.v)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.ratingType === rt.v ? S.colors.primary : S.colors.border}`, background: field.ratingType === rt.v ? `${S.colors.primary}10` : 'transparent', color: field.ratingType === rt.v ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{rt.l}</button>)}</div>
            {field.ratingType !== 'traffic' && <><label style={sL}>Max Sterne: {field.maxStars || 5}</label><input type="range" min={3} max={10} value={field.maxStars || 5} onChange={e => upd('maxStars',Number(e.target.value))} style={{ width: '100%' }} /></>}
          </>}
        </>}

        {/* ── VALIDATION ── */}
        {activeTab === 'validation' && <>
          {(field.type === 'text' || field.type === 'textarea') && <>
            <label style={sL}>Min. Zeichen</label><input type="number" min={0} value={field.validation?.minLength || ''} onChange={e => updV('minLength',e.target.value ? Number(e.target.value) : undefined)} style={sI} />
            <label style={sL}>Max. Zeichen</label><input type="number" min={0} value={field.validation?.maxLength || ''} onChange={e => updV('maxLength',e.target.value ? Number(e.target.value) : undefined)} style={sI} />
            <label style={sL}>Regex-Pattern</label><input value={field.validation?.pattern || ''} onChange={e => updV('pattern',e.target.value)} style={sI} placeholder="z.B. ^[A-Z].*" />
          </>}
          {field.type === 'number' && <>
            <label style={sL}>Minimum</label><input type="number" value={field.validation?.min ?? ''} onChange={e => updV('min',e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Maximum</label><input type="number" value={field.validation?.max ?? ''} onChange={e => updV('max',e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Dezimalstellen</label><input type="number" min={0} max={6} value={field.validation?.decimals ?? ''} onChange={e => updV('decimals',e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
          </>}
          {field.type === 'date' && <><label style={sL}>Heute als Standard</label><MiniToggle value={field.validation?.defaultToday} onChange={v => updV('defaultToday',v)} /></>}
          {field.type === 'checkbox' && <>
            <label style={sL}>Min. Auswahl</label><input type="number" min={0} value={field.validation?.minSelect ?? ''} onChange={e => updV('minSelect',e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Max. Auswahl</label><input type="number" min={0} value={field.validation?.maxSelect ?? ''} onChange={e => updV('maxSelect',e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
          </>}
          {!['text','textarea','number','date','checkbox'].includes(field.type) && <div style={{ padding: '16px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' }}>Keine Validierungsoptionen für diesen Feldtyp.</div>}
        </>}

        {/* ── CONDITIONS ── */}
        {activeTab === 'conditions' && <>
          <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>Feld anzeigen/ausblenden basierend auf anderen Feldern.</p>
          {(field.conditions || []).map((cond, ci) => {
            const ref = referenceFields.find(f => f.id === cond.field);
            const ops = ref ? getOps(ref.type) : [{v:'equals',l:'ist gleich'}];
            return (
              <div key={ci} style={{ padding: '10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, marginBottom: '8px', background: S.colors.bgInput }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: S.colors.textMuted }}>Wenn</span>
                  <button onClick={() => { const n = [...(field.conditions || [])]; n.splice(ci,1); upd('conditions',n); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: S.colors.textMuted }}>✕</button>
                </div>
                <select value={cond.field || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], field: e.target.value, value: '' }; upd('conditions',n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}>
                  <option value="">— Feld wählen —</option>
                  {referenceFields.map(rf => <option key={rf.id} value={rf.id}>{rf.label || rf.type}</option>)}
                </select>
                <select value={cond.operator || 'equals'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], operator: e.target.value }; upd('conditions',n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}>
                  {ops.map(op => <option key={op.v} value={op.v}>{op.l}</option>)}
                </select>
                {!['isEmpty','isNotEmpty'].includes(cond.operator) && (
                  ref?.type === 'toggle' ? (
                    <select value={String(cond.value)} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value === 'true' }; upd('conditions',n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}><option value="true">Ja</option><option value="false">Nein</option></select>
                  ) : ref?.options ? (
                    <select value={cond.value || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value }; upd('conditions',n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}><option value="">— Wert —</option>{ref.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  ) : (
                    <input value={cond.value ?? ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: ref?.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }; upd('conditions',n); }} type={ref?.type === 'number' ? 'number' : 'text'} placeholder="Wert" style={{ ...sI, fontSize: '12px', padding: '6px 8px' }} />
                  )
                )}
                <select value={cond.action || 'show'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], action: e.target.value }; upd('conditions',n); }} style={{ ...sI, fontSize: '12px', padding: '6px 8px' }}>
                  <option value="show">Anzeigen</option><option value="hide">Ausblenden</option><option value="require">Pflichtfeld machen</option><option value="disable">Deaktivieren</option>
                </select>
              </div>
            );
          })}
          {(field.conditions || []).length > 1 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: S.colors.textSecondary, alignSelf: 'center' }}>Verknüpfung:</span>
              {['AND','OR'].map(l => <button key={l} onClick={() => upd('conditionLogic',l)} style={{ padding: '4px 12px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.conditionLogic === l ? S.colors.primary : S.colors.border}`, background: field.conditionLogic === l ? `${S.colors.primary}10` : 'transparent', color: field.conditionLogic === l ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{l === 'AND' ? 'UND' : 'ODER'}</button>)}
            </div>
          )}
          <button onClick={() => upd('conditions',[...(field.conditions || []), { field: '', operator: 'equals', value: '', action: 'show' }])} style={{ padding: '8px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', width: '100%' }}>＋ Bedingung hinzufügen</button>
        </>}
      </div>
    </div>
  );
};

// ═══ FEATURE: Builder Meta Panel (Chat C02) ═══
const BuilderMetaPanel = ({ template, onChange }) => {
  const [showMeta, setShowMeta] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const togBtn = (open, label) => ({ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary });
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
            {[{v:'portrait',l:'↕ Hochformat'},{v:'landscape',l:'↔ Querformat'}].map(o => <button key={o.v} onClick={() => onChange({ ...template, pdfSettings: { ...template.pdfSettings, orientation: o.v } })} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${template.pdfSettings?.orientation === o.v ? S.colors.primary : S.colors.border}`, background: template.pdfSettings?.orientation === o.v ? `${S.colors.primary}10` : 'transparent', color: template.pdfSettings?.orientation === o.v ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{o.l}</button>)}
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

// ═══ FEATURE: Form Builder Main (Chat C02) ═══
const FormBuilder = ({ template: initialTemplate, onSave, onClose }) => {
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
    const np = { id: `page-${Date.now()}`, title: `Seite ${template.pages.length+1}`, fields: [] };
    const n = { ...template, pages: [...template.pages, np] }; upd(n); setActivePageIndex(n.pages.length-1);
  };
  const deletePage = (idx) => {
    if (template.pages.length <= 1) return;
    upd({ ...template, pages: template.pages.filter((_,i) => i !== idx) });
    if (activePageIndex >= template.pages.length - 1) setActivePageIndex(Math.max(0, template.pages.length-2));
    setSelectedFieldId(null);
  };
  const renamePage = (pid, title) => upd({ ...template, pages: template.pages.map(p => p.id === pid ? { ...p, title } : p) });

  const addFieldToEnd = (type) => {
    const f = createField(type);
    upd({ ...template, pages: template.pages.map((p,i) => i === activePageIndex ? { ...p, fields: [...p.fields, f] } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  };
  const addFieldAtIndex = (type, index) => {
    const f = createField(type);
    const nf = [...activeFields]; nf.splice(index,0,f);
    upd({ ...template, pages: template.pages.map((p,i) => i === activePageIndex ? { ...p, fields: nf } : p) });
    setSelectedFieldId(f.id);
    if (!isDesktop) setShowSettingsDrawer(true);
  };
  const moveField = (fieldId, toIndex) => {
    const fromIndex = activeFields.findIndex(f => f.id === fieldId);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const nf = [...activeFields]; const [moved] = nf.splice(fromIndex,1);
    nf.splice(toIndex > fromIndex ? toIndex-1 : toIndex, 0, moved);
    upd({ ...template, pages: template.pages.map((p,i) => i === activePageIndex ? { ...p, fields: nf } : p) });
  };
  const deleteField = (fid) => {
    upd({ ...template, pages: template.pages.map((p,i) => i === activePageIndex ? { ...p, fields: p.fields.filter(f => f.id !== fid) } : p) });
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

      {/* Header */}
      <div style={{ background: S.glass.background, backdropFilter: S.glass.backdropFilter, borderBottom: `1px solid ${S.colors.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={handleClose} style={{ ...styles.btn('ghost'), padding: '8px', fontSize: '14px' }}>← Zurück</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={template.name} onChange={e => upd({ ...template, name: e.target.value })} placeholder="Formularname eingeben..."
            style={{ width: '100%', padding: '4px 8px', border: '1.5px solid transparent', borderRadius: S.radius.sm, fontSize: '18px', fontWeight: 700, fontFamily: 'inherit', background: 'transparent', outline: 'none', transition: S.transition, color: S.colors.text }}
            onFocus={e => { e.target.style.borderColor = S.colors.primary; e.target.style.background = S.colors.bgInput; }}
            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }} />
        </div>
        <span style={{ fontSize: '12px', color: hasChanges ? S.colors.warning : S.colors.success, fontWeight: 600, flexShrink: 0 }}>{hasChanges ? '● Ungespeichert' : '✓ Gespeichert'}</span>
        <button onClick={() => doSave(false)} style={styles.btn('primary','sm')}>💾 Speichern</button>
      </div>

      {/* Body */}
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

      {/* Mobile drawers */}
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

// ═══ FEATURE: Templates Overview (Chat F.1, updated C02) ═══
const TemplatesOverview = ({ user, onOpenBuilder, customTemplates, onDeleteTemplate }) => {
  const cc = { service: S.colors.primary, abnahme: S.colors.accent, mangel: S.colors.danger, pruefung: S.colors.primaryLight, uebergabe: S.colors.success, custom: S.colors.textSecondary };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Vorlagen</h2>
        {user.role === 'admin' && <button onClick={() => onOpenBuilder(createEmptyTemplate())} style={styles.btn('primary')}>＋ Neues Formular</button>}
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
                  <span style={styles.badge(cc[t.category] || cc.custom)}>{t.category}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>v{t.version || 1}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>{t.pages?.length || 0} Seiten</span>
                </div>
              </div>
              {user.role === 'admin' && <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => onOpenBuilder(t)} style={styles.btn('secondary','sm')}>✎ Bearbeiten</button>
                <button onClick={() => { if (confirm(`"${t.name}" löschen?`)) onDeleteTemplate(t.id); }} style={{ ...styles.btn('ghost','sm'), color: S.colors.danger }}>🗑</button>
              </div>}
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
                <span style={styles.badge(cc[t.category] || cc.custom)}>{t.category}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} Seiten</span>
              </div>
            </div>
            {user.role === 'admin' && <button onClick={() => {
              const copy = JSON.parse(JSON.stringify(t));
              copy.id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
              copy.name = `${t.name} (Kopie)`;
              copy.isDemo = false; copy.version = 1;
              onOpenBuilder(copy);
            }} style={styles.btn('secondary','sm')}>📋 Kopieren</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══ FEATURE: Main App (Chat F.1, updated C02) ═══
export default function FormPilot() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('fill');
  const [submissions, setSubmissions] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [fillingTemplate, setFillingTemplate] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);
  const [loaded, setLoaded] = useState(false);

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

  const handleLogin = async (u) => { setUser(u); await storageSet(STORAGE_KEYS.session, { userId: u.id }); };
  const handleLogout = async () => { setUser(null); await storageSet(STORAGE_KEYS.session, null); };

  const handleStartFilling = async (template) => {
    const dk = `fp_draft_${template.id}_current`;
    const draft = await storageGet(dk);
    setDraftData(draft?.data && Object.keys(draft.data).length > 0 ? draft.data : null);
    setFillingTemplate(template);
  };

  const handleSubmitForm = async (data) => {
    const newSub = { id: 'sub-'+Date.now(), templateId: fillingTemplate.id, templateVersion: fillingTemplate.version, status: 'completed', data, filledBy: user.id, filledByName: user.name, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
    const updated = [...submissions, newSub]; setSubmissions(updated);
    await storageSet(STORAGE_KEYS.submissions, updated);
    await storageSet(`fp_draft_${fillingTemplate.id}_current`, null);
    setFillingTemplate(null); setDraftData(null); setTab('submissions');
  };

  const handleBuilderSave = async () => { const tpls = await storageGet(STORAGE_KEYS.templates) || []; setCustomTemplates(tpls); };
  const handleDeleteTemplate = async (id) => { const tpls = (await storageGet(STORAGE_KEYS.templates) || []).filter(t => t.id !== id); await storageSet(STORAGE_KEYS.templates, tpls); setCustomTemplates(tpls); };

  if (!loaded) return <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div><div style={{ color: S.colors.textSecondary }}>Laden...</div></div></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (builderTemplate) return <FormBuilder template={builderTemplate} onSave={handleBuilderSave} onClose={() => setBuilderTemplate(null)} />;

  const allTemplates = [...DEMO_TEMPLATES, ...customTemplates];
  const NAV_ITEMS = [
    { id: 'templates', label: 'Vorlagen', icon: '📑', roles: ['admin','buero'] },
    { id: 'fill', label: 'Ausfüllen', icon: '✏️', roles: ['admin','monteur'] },
    { id: 'submissions', label: 'Eingereicht', icon: '📥', roles: ['admin','monteur','buero'] },
    { id: 'settings', label: 'Einstellungen', icon: '⚙️', roles: ['admin','monteur','buero'] },
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
        ) : (<>
          {tab === 'templates' && <TemplatesOverview user={user} onOpenBuilder={setBuilderTemplate} customTemplates={customTemplates} onDeleteTemplate={handleDeleteTemplate} />}
          {tab === 'fill' && <TemplateSelector onSelect={handleStartFilling} customTemplates={customTemplates} />}
          {tab === 'submissions' && <SubmissionsList submissions={submissions} user={user} allTemplates={allTemplates} />}
          {tab === 'settings' && <SettingsScreen user={user} onLogout={handleLogout} />}
        </>)}
      </div>
      {!fillingTemplate && (
        <div style={styles.bottomNav}>
          {visibleNav.map(n => <button key={n.id} onClick={() => setTab(n.id)} style={styles.navItem(tab === n.id)}><span style={{ fontSize: '20px' }}>{n.icon}</span><span>{n.label}</span></button>)}
        </div>
      )}
    </div>
  );
}
