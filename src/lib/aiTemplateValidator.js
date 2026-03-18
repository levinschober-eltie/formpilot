// ═══ FEATURE: AI Template Validator (Prompt 06) ═══

const VALID_FIELD_TYPES = [
  'text', 'textarea', 'number', 'date', 'time',
  'select', 'radio', 'checkbox', 'toggle',
  'checklist', 'rating', 'heading', 'divider',
  'info', 'signature', 'photo', 'repeater',
];

const VALID_CATEGORIES = ['service', 'abnahme', 'mangel', 'pruefung', 'uebergabe', 'custom'];
const VALID_WIDTHS = ['full', 'half', 'third'];
const VALID_OPERATORS = ['equals', 'notEquals', 'contains', 'isEmpty', 'isNotEmpty'];
const VALID_ACTIONS = ['show', 'hide', 'require'];

/**
 * Validates and fixes an AI-generated template to ensure it matches the FormPilot schema.
 * @param {object} rawTemplate - The raw template from Claude API
 * @returns {{ template: object, warnings: string[] }}
 */
export function validateAndFixAITemplate(rawTemplate) {
  const warnings = [];
  const ts = Date.now();

  if (!rawTemplate || typeof rawTemplate !== 'object') {
    throw new Error('Template ist kein gültiges Objekt');
  }

  // Top-level fields
  const template = {
    id: `tpl-ai-${ts}-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof rawTemplate.name === 'string' && rawTemplate.name.trim() ? rawTemplate.name.trim() : 'KI-Formular',
    description: typeof rawTemplate.description === 'string' ? rawTemplate.description.trim() : '',
    category: VALID_CATEGORIES.includes(rawTemplate.category) ? rawTemplate.category : 'custom',
    icon: typeof rawTemplate.icon === 'string' && rawTemplate.icon.length <= 4 ? rawTemplate.icon : '📋',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: true,
    pages: [],
    pdfSettings: {
      orientation: 'portrait',
      showLogo: true,
      showPageNumbers: true,
      footerText: 'Erstellt mit FormPilot',
      accentColor: '#2563eb',
    },
    emailTemplate: { subject: '', body: '', attachPdf: true, recipients: ['customer'] },
  };

  if (!rawTemplate.name || typeof rawTemplate.name !== 'string') {
    warnings.push('Kein Name vorhanden — "KI-Formular" verwendet');
  }
  if (!VALID_CATEGORIES.includes(rawTemplate.category)) {
    warnings.push(`Ungültige Kategorie "${rawTemplate.category}" — "custom" verwendet`);
  }

  // Pages
  const rawPages = Array.isArray(rawTemplate.pages) ? rawTemplate.pages : [];
  if (rawPages.length === 0) {
    warnings.push('Keine Seiten vorhanden — leere Seite hinzugefügt');
    rawPages.push({ id: 'p1', title: 'Seite 1', fields: [] });
  }

  let fieldCounter = 0;
  const usedIds = new Set();

  const uniqueId = (prefix) => {
    fieldCounter++;
    let id = `${prefix}-${ts}-${fieldCounter}`;
    while (usedIds.has(id)) {
      fieldCounter++;
      id = `${prefix}-${ts}-${fieldCounter}`;
    }
    usedIds.add(id);
    return id;
  };

  template.pages = rawPages.map((page, pageIdx) => {
    const pageId = uniqueId('page');
    const pageTitle = typeof page.title === 'string' && page.title.trim() ? page.title.trim() : `Seite ${pageIdx + 1}`;
    const rawFields = Array.isArray(page.fields) ? page.fields : [];

    const fields = rawFields.map((field) => {
      if (!field || typeof field !== 'object') {
        warnings.push('Ungültiges Feld übersprungen');
        return null;
      }

      const fieldId = uniqueId('field-ai');
      let type = typeof field.type === 'string' ? field.type.toLowerCase() : 'text';

      if (!VALID_FIELD_TYPES.includes(type)) {
        warnings.push(`Ungültiger Feldtyp "${type}" → "text" verwendet`);
        type = 'text';
      }

      const base = {
        id: fieldId,
        type,
        label: typeof field.label === 'string' ? field.label : '',
        placeholder: typeof field.placeholder === 'string' ? field.placeholder : '',
        required: field.required === true,
        width: VALID_WIDTHS.includes(field.width) ? field.width : 'full',
        conditions: [],
        conditionLogic: 'AND',
        validation: {},
      };

      // Conditions
      if (Array.isArray(field.conditions)) {
        base.conditions = field.conditions
          .filter(c => c && typeof c === 'object' && c.field)
          .map(c => ({
            field: String(c.field),
            operator: VALID_OPERATORS.includes(c.operator) ? c.operator : 'equals',
            value: c.value !== undefined ? c.value : '',
            action: VALID_ACTIONS.includes(c.action) ? c.action : 'show',
          }));
      }

      // Type-specific properties
      switch (type) {
        case 'select':
        case 'radio':
        case 'checkbox': {
          const opts = Array.isArray(field.options) ? field.options : [];
          base.options = opts.length > 0
            ? opts.map((o, i) => ({
                value: typeof o?.value === 'string' ? o.value : `opt-${i + 1}`,
                label: typeof o?.label === 'string' ? o.label : `Option ${i + 1}`,
              }))
            : [{ value: 'option-1', label: 'Option 1' }, { value: 'option-2', label: 'Option 2' }];
          if (opts.length === 0) {
            warnings.push(`Feld "${base.label}" (${type}): Keine Optionen — Defaults hinzugefügt`);
          }
          break;
        }
        case 'toggle':
          base.labelOn = typeof field.labelOn === 'string' ? field.labelOn : 'Ja';
          base.labelOff = typeof field.labelOff === 'string' ? field.labelOff : 'Nein';
          break;
        case 'checklist': {
          const items = Array.isArray(field.items) ? field.items : [];
          base.items = items.length > 0
            ? items.map((item, i) => ({
                id: uniqueId('cl'),
                label: typeof item?.label === 'string' ? item.label : `Prüfpunkt ${i + 1}`,
              }))
            : [{ id: uniqueId('cl'), label: 'Prüfpunkt 1' }, { id: uniqueId('cl'), label: 'Prüfpunkt 2' }];
          base.allowNotes = field.allowNotes !== false;
          if (items.length === 0) {
            warnings.push(`Feld "${base.label}" (checklist): Keine Items — Defaults hinzugefügt`);
          }
          break;
        }
        case 'rating':
          base.maxStars = typeof field.maxStars === 'number' && field.maxStars >= 1 && field.maxStars <= 10 ? field.maxStars : 5;
          base.ratingType = field.ratingType === 'traffic' ? 'traffic' : 'stars';
          break;
        case 'heading':
          base.level = ['h1', 'h2', 'h3'].includes(field.level) ? field.level : 'h2';
          break;
        case 'divider':
          base.label = '';
          break;
        case 'info':
          base.content = typeof field.content === 'string' ? field.content : (typeof field.label === 'string' ? field.label : 'Hinweis...');
          break;
        case 'number':
          if (typeof field.min === 'number') base.validation.min = field.min;
          if (typeof field.max === 'number') base.validation.max = field.max;
          if (typeof field.decimals === 'number') base.validation.decimals = field.decimals;
          if (typeof field.unit === 'string') base.validation.unit = field.unit;
          break;
        case 'date':
          base.validation.defaultToday = field.defaultToday === true;
          break;
        case 'photo':
          base.validation.maxPhotos = typeof field.maxPhotos === 'number' ? field.maxPhotos : 5;
          break;
        case 'repeater': {
          const subs = Array.isArray(field.subFields) ? field.subFields : [];
          base.subFields = subs.length > 0
            ? subs.map((sf, i) => ({
                id: uniqueId('sf'),
                label: typeof sf?.label === 'string' ? sf.label : `Spalte ${i + 1}`,
                type: VALID_FIELD_TYPES.includes(sf?.type) ? sf.type : 'text',
                placeholder: typeof sf?.placeholder === 'string' ? sf.placeholder : '',
              }))
            : [
                { id: uniqueId('sf'), label: 'Spalte 1', type: 'text', placeholder: '' },
                { id: uniqueId('sf'), label: 'Spalte 2', type: 'text', placeholder: '' },
              ];
          base.validation.maxRows = typeof field.maxRows === 'number' ? field.maxRows : 10;
          if (subs.length === 0) {
            warnings.push(`Feld "${base.label}" (repeater): Keine subFields — Defaults hinzugefügt`);
          }
          break;
        }
        case 'signature':
          base.width = 'full';
          break;
        default:
          break;
      }

      return base;
    }).filter(Boolean);

    return { id: pageId, title: pageTitle, fields };
  });

  // Fix condition references: map old AI field IDs to new unique IDs
  // The AI may reference its own IDs (e.g., "field-ai-5") in conditions.
  // We need to build a mapping from original AI IDs to our new unique IDs.
  const idMap = {};
  let aiIdx = 0;
  rawPages.forEach((page) => {
    const rawFields = Array.isArray(page.fields) ? page.fields : [];
    rawFields.forEach((field) => {
      if (field && field.id) {
        // The corresponding new field is at the same index in the output
        const newPage = template.pages[rawPages.indexOf(page)];
        if (newPage && newPage.fields[aiIdx - countFieldsBefore(rawPages, page)]) {
          // Simpler approach: just collect all old→new mappings
        }
        idMap[field.id] = null; // placeholder
      }
    });
  });

  // Build proper ID mapping
  const allOldIds = [];
  rawPages.forEach((page) => {
    (Array.isArray(page.fields) ? page.fields : []).forEach((f) => {
      if (f && f.id) allOldIds.push(f.id);
    });
  });
  const allNewIds = [];
  template.pages.forEach((page) => {
    page.fields.forEach((f) => allNewIds.push(f.id));
  });
  const finalIdMap = {};
  allOldIds.forEach((oldId, i) => {
    if (i < allNewIds.length) finalIdMap[oldId] = allNewIds[i];
  });

  // Update condition references
  template.pages.forEach((page) => {
    page.fields.forEach((field) => {
      if (field.conditions && field.conditions.length > 0) {
        field.conditions = field.conditions.map(c => ({
          ...c,
          field: finalIdMap[c.field] || c.field,
        }));
      }
    });
  });

  // Count totals for summary
  const totalFields = template.pages.reduce((sum, p) => sum + p.fields.length, 0);
  if (totalFields === 0) {
    warnings.push('Keine Felder generiert — Template ist leer');
  }

  return { template, warnings };
}

// Not needed externally - was placeholder for complex logic above
function countFieldsBefore() { return 0; }
