// ═══ FEATURE: Users & Auth (Chat F.1) ═══
export const USERS = [
  { id: 'u1', name: 'Max Admin', email: 'admin@formpilot.de', pin: '1234', role: 'admin' },
  { id: 'u2', name: 'Tom Monteur', email: 'tom@formpilot.de', pin: '5678', role: 'monteur' },
  { id: 'u3', name: 'Lisa Büro', email: 'lisa@formpilot.de', pin: '9999', role: 'buero' },
];

export const STORAGE_KEYS = {
  submissions: 'fp_submissions',
  drafts: 'fp_drafts',
  session: 'fp_session',
  templates: 'fp_templates',
};

export const FIELD_TYPE_ICONS = {
  text: '📝', textarea: '📄', number: '#️⃣', date: '📅', time: '🕐',
  select: '🔽', radio: '⭕', checkbox: '☑️', toggle: '🔘',
  checklist: '✅', rating: '⭐', heading: '📌', divider: '➖',
  info: 'ℹ️', signature: '✍️', photo: '📷', repeater: '🔁',
};

export const CATEGORY_OPTIONS = [
  { value: 'abnahme', label: 'Abnahme' },
  { value: 'service', label: 'Service' },
  { value: 'mangel', label: 'Mängel' },
  { value: 'pruefung', label: 'Prüfung' },
  { value: 'uebergabe', label: 'Übergabe' },
  { value: 'custom', label: 'Sonstige' },
];

export const BUILDER_ICONS = ['📋', '🔧', '🏗️', '⚠️', '📐', '🔌', '🏠', '🛠️', '📊', '✅', '🔍', '📦', '🚿', '💡', '🔥', '❄️', '⚡', '🏢', '🧰', '📝'];

export const FIELD_PALETTE = [
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
    { type: 'signature', icon: '✍️', label: 'Unterschrift', desc: 'Digitale Unterschrift' },
    { type: 'photo', icon: '📷', label: 'Foto', desc: 'Kamera / Upload' },
    { type: 'repeater', icon: '🔁', label: 'Wiederholung', desc: 'Dynamische Feldgruppe' },
  ]},
];
