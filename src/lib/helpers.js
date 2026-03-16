export const slugify = (str) =>
  str.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const createField = (type) => {
  const id = `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = { id, type, label: '', placeholder: '', required: false, width: 'full', conditions: [], conditionLogic: 'AND', validation: {} };
  switch (type) {
    case 'text': return { ...base, label: 'Textfeld' };
    case 'textarea': return { ...base, label: 'Textbereich' };
    case 'number': return { ...base, label: 'Zahl' };
    case 'date': return { ...base, label: 'Datum', validation: { defaultToday: false } };
    case 'time': return { ...base, label: 'Uhrzeit' };
    case 'select': return { ...base, label: 'Auswahl', options: [{ value: 'option-1', label: 'Option 1' }, { value: 'option-2', label: 'Option 2' }] };
    case 'radio': return { ...base, label: 'Optionen', options: [{ value: 'option-1', label: 'Option 1' }, { value: 'option-2', label: 'Option 2' }] };
    case 'checkbox': return { ...base, label: 'Mehrfachauswahl', options: [{ value: 'option-1', label: 'Option 1' }, { value: 'option-2', label: 'Option 2' }] };
    case 'toggle': return { ...base, label: 'Ja/Nein', labelOn: 'Ja', labelOff: 'Nein' };
    case 'checklist': return { ...base, label: 'Checkliste', items: [{ id: 'item-1', label: 'Prüfpunkt 1' }, { id: 'item-2', label: 'Prüfpunkt 2' }], allowNotes: true };
    case 'rating': return { ...base, label: 'Bewertung', maxStars: 5, ratingType: 'stars' };
    case 'heading': return { ...base, label: 'Überschrift', level: 'h2' };
    case 'divider': return { ...base, type: 'divider', label: '' };
    case 'info': return { ...base, label: 'Info', content: 'Hinweis...' };
    default: return base;
  }
};

export const createEmptyTemplate = () => ({
  id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '', description: '', category: 'custom', icon: '📋', version: 1,
  pages: [{ id: `page-${Date.now()}`, title: 'Seite 1', fields: [] }],
  pdfSettings: { orientation: 'portrait', showLogo: true, showPageNumbers: true, footerText: 'Erstellt mit FormPilot', accentColor: '#2563eb' },
  emailTemplate: { subject: '', body: '', attachPdf: true, recipients: ['customer'] },
});
