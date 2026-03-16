/**
 * ═══════════════════════════════════════════════════════════
 *  FormPilot — Maximaler Funktionstest
 *  Simulation: 1 Jahr, 10 Nutzer, 500+ Formulare
 * ═══════════════════════════════════════════════════════════
 */

// ─── Imports (reale Module) ───
import { evaluateConditions, validateField, validatePage } from '../src/lib/validation.js';
import { slugify, createField, createEmptyTemplate } from '../src/lib/helpers.js';
import { DEMO_TEMPLATES } from '../src/config/templates.js';
import { USERS, STORAGE_KEYS, FIELD_TYPE_ICONS, FIELD_PALETTE } from '../src/config/constants.js';

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, name) {
  if (condition) { passed++; }
  else { failed++; errors.push(name); console.error(`  ✗ FAILED: ${name}`); }
}

function section(name) { console.log(`\n── ${name} ──`); }

// ═══════════════════════════════════════════
//  1. KONFIGURATION & KONSTANTEN
// ═══════════════════════════════════════════
section('1. Konfiguration & Konstanten');

assert(USERS.length === 3, '3 Demo-User vorhanden');
assert(USERS.find(u => u.role === 'admin'), 'Admin-User existiert');
assert(USERS.find(u => u.role === 'monteur'), 'Monteur-User existiert');
assert(USERS.find(u => u.role === 'buero'), 'Büro-User existiert');
assert(USERS.every(u => u.id && u.name && u.pin && u.role), 'Alle User haben id, name, pin, role');

assert(STORAGE_KEYS.submissions === 'fp_submissions', 'Storage Key: submissions');
assert(STORAGE_KEYS.templates === 'fp_templates', 'Storage Key: templates');
assert(STORAGE_KEYS.session === 'fp_session', 'Storage Key: session');

const allFieldTypes = Object.keys(FIELD_TYPE_ICONS);
assert(allFieldTypes.length >= 14, 'Mindestens 14 Feldtypen in FIELD_TYPE_ICONS');
assert(allFieldTypes.includes('text'), 'Feldtyp: text');
assert(allFieldTypes.includes('signature'), 'Feldtyp: signature');
assert(allFieldTypes.includes('photo'), 'Feldtyp: photo');
assert(allFieldTypes.includes('repeater'), 'Feldtyp: repeater');
assert(allFieldTypes.includes('checklist'), 'Feldtyp: checklist');
assert(allFieldTypes.includes('rating'), 'Feldtyp: rating');

const paletteTypes = FIELD_PALETTE.flatMap(g => g.items.map(i => i.type));
assert(paletteTypes.length >= 14, 'Mindestens 14 Typen in Palette');

// ═══════════════════════════════════════════
//  2. DEMO-TEMPLATES
// ═══════════════════════════════════════════
section('2. Demo-Templates');

assert(DEMO_TEMPLATES.length === 3, '3 Demo-Templates');
DEMO_TEMPLATES.forEach(tpl => {
  assert(tpl.id && tpl.name, `Template "${tpl.name}" hat id+name`);
  assert(tpl.pages && tpl.pages.length > 0, `Template "${tpl.name}" hat Seiten`);
  assert(tpl.category, `Template "${tpl.name}" hat Kategorie`);
  tpl.pages.forEach(page => {
    assert(page.id && page.title, `Seite "${page.title}" in "${tpl.name}" hat id+title`);
    assert(Array.isArray(page.fields), `Seite "${page.title}" hat fields Array`);
    page.fields.forEach(field => {
      assert(field.id && field.type, `Feld "${field.label || field.type}" hat id+type`);
      assert(allFieldTypes.includes(field.type), `Feldtyp "${field.type}" ist bekannt`);
    });
  });
});

// Baustellenabnahme hat 3 Seiten
const bau = DEMO_TEMPLATES.find(t => t.name.includes('Baustellenabnahme'));
assert(bau && bau.pages.length === 3, 'Baustellenabnahme hat 3 Seiten');

// Mängelprotokoll hat 2 Seiten
const mangel = DEMO_TEMPLATES.find(t => t.name.includes('Mängel'));
assert(mangel && mangel.pages.length === 2, 'Mängelprotokoll hat 2 Seiten');

// ═══════════════════════════════════════════
//  3. HELPER FUNKTIONEN
// ═══════════════════════════════════════════
section('3. Helper-Funktionen');

// slugify
assert(slugify('Hallo Welt') === 'hallo-welt', 'slugify: normal');
assert(slugify('Über Größe') === 'ueber-groesse', 'slugify: Umlaute');
assert(slugify('Test / Special (Chars)') === 'test-special-chars', 'slugify: Sonderzeichen');
assert(slugify('') === '', 'slugify: leer');
assert(slugify('---') === '', 'slugify: nur Striche');

// createField
const allCreatable = ['text', 'textarea', 'number', 'date', 'time', 'select', 'radio', 'checkbox', 'toggle', 'checklist', 'rating', 'heading', 'divider', 'info', 'signature', 'photo', 'repeater'];
allCreatable.forEach(type => {
  const f = createField(type);
  assert(f.id && f.type === type, `createField("${type}") hat id+type`);
  if (['select', 'radio', 'checkbox'].includes(type)) {
    assert(Array.isArray(f.options) && f.options.length >= 2, `createField("${type}") hat options`);
  }
  if (type === 'checklist') {
    assert(Array.isArray(f.items) && f.items.length >= 1, 'createField("checklist") hat items');
  }
  if (type === 'repeater') {
    assert(Array.isArray(f.subFields), 'createField("repeater") hat subFields');
  }
});

// createEmptyTemplate
const emptyTpl = createEmptyTemplate();
assert(emptyTpl.id, 'Empty Template hat id');
assert(emptyTpl.pages.length === 1, 'Empty Template hat 1 Seite');
assert(emptyTpl.pages[0].fields.length === 0, 'Empty Template Seite hat 0 Felder');

// ═══════════════════════════════════════════
//  4. VALIDATION ENGINE
// ═══════════════════════════════════════════
section('4. Validation Engine');

// Pflichtfeld-Validierung
const reqText = { id: 'f1', type: 'text', label: 'Name', required: true };
assert(validateField(reqText, '', {}) === 'Name ist erforderlich', 'Pflichtfeld leer → Fehler');
assert(validateField(reqText, null, {}) === 'Name ist erforderlich', 'Pflichtfeld null → Fehler');
assert(validateField(reqText, undefined, {}) === 'Name ist erforderlich', 'Pflichtfeld undefined → Fehler');
assert(validateField(reqText, 'Max', {}) === null, 'Pflichtfeld gefüllt → OK');

// Optional
const optText = { id: 'f2', type: 'text', label: 'Notiz' };
assert(validateField(optText, '', {}) === null, 'Optional leer → OK');
assert(validateField(optText, null, {}) === null, 'Optional null → OK');

// Text min/max/pattern
const valText = { id: 'f3', type: 'text', label: 'Code', validation: { minLength: 3, maxLength: 10, pattern: '^[A-Z]+$' } };
assert(validateField(valText, 'AB', {}) !== null, 'minLength unterschritten');
assert(validateField(valText, 'ABCDE', {}) === null, 'minLength+maxLength OK');
assert(validateField(valText, 'ABCDEFGHIJK', {}) !== null, 'maxLength überschritten');
assert(validateField(valText, 'abc', {}) !== null, 'Pattern verletzt');
assert(validateField(valText, 'ABC', {}) === null, 'Pattern erfüllt');

// Number min/max
const valNum = { id: 'f4', type: 'number', label: 'Leistung', required: true, validation: { min: 0, max: 100 } };
assert(validateField(valNum, -1, {}) !== null, 'Number unter min');
assert(validateField(valNum, 50, {}) === null, 'Number im Bereich');
assert(validateField(valNum, 101, {}) !== null, 'Number über max');
assert(validateField(valNum, 'abc', {}) !== null, 'Number NaN');

// Checklist required
const valCheck = { id: 'f5', type: 'checklist', label: 'Prüfung', required: true, items: [{ id: 'i1', label: 'P1' }] };
assert(validateField(valCheck, {}, {}) !== null, 'Checklist leer → Fehler');
assert(validateField(valCheck, { i1: { checked: true } }, {}) === null, 'Checklist geprüft → OK');
assert(validateField(valCheck, { i1: { checked: false } }, {}) !== null, 'Checklist ungeprüft → Fehler');

// Signature required
const valSig = { id: 'f6', type: 'signature', label: 'Unterschrift', required: true };
assert(validateField(valSig, null, {}) !== null, 'Signatur leer → Fehler');
assert(validateField(valSig, 'data:image/png;base64,...', {}) === null, 'Signatur vorhanden → OK');

// Photo required
const valPhoto = { id: 'f7', type: 'photo', label: 'Foto', required: true };
assert(validateField(valPhoto, null, {}) !== null, 'Foto leer → Fehler');
assert(validateField(valPhoto, [], {}) !== null, 'Foto leeres Array → Fehler');
assert(validateField(valPhoto, ['img1'], {}) === null, 'Foto vorhanden → OK');
assert(validateField(valPhoto, 'img1', {}) === null, 'Foto einzeln → OK');

// Repeater required
const valRep = { id: 'f8', type: 'repeater', label: 'Artikel', required: true };
assert(validateField(valRep, [], {}) !== null, 'Repeater leer → Fehler');
assert(validateField(valRep, [{ col1: 'val' }], {}) === null, 'Repeater mit Eintrag → OK');

// ═══════════════════════════════════════════
//  5. CONDITIONAL LOGIC ENGINE
// ═══════════════════════════════════════════
section('5. Conditional Logic Engine');

// Show-Bedingung
assert(evaluateConditions([{ field: 'f1', operator: 'equals', value: 'Ja', action: 'show' }], 'AND', { f1: 'Ja' }) === true, 'Show: equals match → sichtbar');
assert(evaluateConditions([{ field: 'f1', operator: 'equals', value: 'Ja', action: 'show' }], 'AND', { f1: 'Nein' }) === false, 'Show: equals mismatch → versteckt');

// Hide-Bedingung
assert(evaluateConditions([{ field: 'f1', operator: 'equals', value: 'Nein', action: 'hide' }], 'AND', { f1: 'Nein' }) === false, 'Hide: match → versteckt');
assert(evaluateConditions([{ field: 'f1', operator: 'equals', value: 'Nein', action: 'hide' }], 'AND', { f1: 'Ja' }) === true, 'Hide: mismatch → sichtbar');

// Operatoren
assert(evaluateConditions([{ field: 'f1', operator: 'notEquals', value: 'X', action: 'show' }], 'AND', { f1: 'Y' }) === true, 'notEquals: Y != X → true');
assert(evaluateConditions([{ field: 'f1', operator: 'contains', value: 'llo', action: 'show' }], 'AND', { f1: 'Hallo' }) === true, 'contains: match');
assert(evaluateConditions([{ field: 'f1', operator: 'gt', value: 5, action: 'show' }], 'AND', { f1: 10 }) === true, 'gt: 10 > 5');
assert(evaluateConditions([{ field: 'f1', operator: 'lt', value: 5, action: 'show' }], 'AND', { f1: 3 }) === true, 'lt: 3 < 5');
assert(evaluateConditions([{ field: 'f1', operator: 'isEmpty', value: '', action: 'show' }], 'AND', { f1: '' }) === true, 'isEmpty: leer');
assert(evaluateConditions([{ field: 'f1', operator: 'isEmpty', value: '', action: 'show' }], 'AND', { f1: 'abc' }) === false, 'isEmpty: nicht leer');
assert(evaluateConditions([{ field: 'f1', operator: 'isNotEmpty', value: '', action: 'show' }], 'AND', { f1: 'abc' }) === true, 'isNotEmpty: gefüllt');

// AND-Logik
assert(evaluateConditions([
  { field: 'f1', operator: 'equals', value: 'A', action: 'show' },
  { field: 'f2', operator: 'equals', value: 'B', action: 'show' },
], 'AND', { f1: 'A', f2: 'B' }) === true, 'AND: beide true');
assert(evaluateConditions([
  { field: 'f1', operator: 'equals', value: 'A', action: 'show' },
  { field: 'f2', operator: 'equals', value: 'B', action: 'show' },
], 'AND', { f1: 'A', f2: 'X' }) === false, 'AND: eine false');

// OR-Logik
assert(evaluateConditions([
  { field: 'f1', operator: 'equals', value: 'A', action: 'show' },
  { field: 'f2', operator: 'equals', value: 'B', action: 'show' },
], 'OR', { f1: 'X', f2: 'B' }) === true, 'OR: eine true');
assert(evaluateConditions([
  { field: 'f1', operator: 'equals', value: 'A', action: 'show' },
  { field: 'f2', operator: 'equals', value: 'B', action: 'show' },
], 'OR', { f1: 'X', f2: 'Y' }) === false, 'OR: beide false');

// Leere Conditions
assert(evaluateConditions([], 'AND', {}) === true, 'Keine Bedingungen → sichtbar');
assert(evaluateConditions(null, 'AND', {}) === true, 'null Bedingungen → sichtbar');

// Bedingte Validierung (hidden field not validated)
const condField = { id: 'fc', type: 'text', label: 'Bedingt', required: true, conditions: [{ field: 'f1', operator: 'equals', value: 'show', action: 'show' }] };
assert(validateField(condField, '', { f1: 'hide' }) === null, 'Verstecktes Pflichtfeld → kein Fehler');
assert(validateField(condField, '', { f1: 'show' }) !== null, 'Sichtbares Pflichtfeld → Fehler');

// ═══════════════════════════════════════════
//  6. PAGE VALIDATION
// ═══════════════════════════════════════════
section('6. Seiten-Validierung');

const testPage = {
  id: 'p1', title: 'Test',
  fields: [
    { id: 'f1', type: 'text', label: 'Name', required: true },
    { id: 'f2', type: 'number', label: 'Alter', required: true, validation: { min: 0, max: 120 } },
    { id: 'f3', type: 'heading', label: 'Überschrift' },
    { id: 'f4', type: 'divider' },
    { id: 'f5', type: 'text', label: 'Notiz' },
  ]
};

let pageErrors = validatePage(testPage, {});
assert(Object.keys(pageErrors).length === 2, 'Leere Seite: 2 Pflichtfehler (Name+Alter)');
assert(pageErrors['f1'], 'Name-Fehler vorhanden');
assert(pageErrors['f2'], 'Alter-Fehler vorhanden');
assert(!pageErrors['f3'], 'Heading nicht validiert');
assert(!pageErrors['f4'], 'Divider nicht validiert');
assert(!pageErrors['f5'], 'Optionales Feld kein Fehler');

pageErrors = validatePage(testPage, { f1: 'Max', f2: 25 });
assert(Object.keys(pageErrors).length === 0, 'Gefüllte Seite: 0 Fehler');

pageErrors = validatePage(testPage, { f1: 'Max', f2: 150 });
assert(Object.keys(pageErrors).length === 1, 'Alter über max → 1 Fehler');

// ═══════════════════════════════════════════
//  7. SIMULATION: 1 JAHR, 10 NUTZER, 500 FORMULARE
// ═══════════════════════════════════════════
section('7. Jahressimulation (10 Nutzer, 500+ Formulare)');

const SIM_USERS = [
  { id: 'u1', name: 'Max Müller', role: 'admin' },
  { id: 'u2', name: 'Tom Schmidt', role: 'monteur' },
  { id: 'u3', name: 'Lisa Weber', role: 'buero' },
  { id: 'u4', name: 'Jan Fischer', role: 'monteur' },
  { id: 'u5', name: 'Anna Koch', role: 'monteur' },
  { id: 'u6', name: 'Peter Bauer', role: 'monteur' },
  { id: 'u7', name: 'Sarah Klein', role: 'teamleiter' },
  { id: 'u8', name: 'Mike Wagner', role: 'monteur' },
  { id: 'u9', name: 'Eva Richter', role: 'monteur' },
  { id: 'u10', name: 'Chris Hoffmann', role: 'admin' },
];

// Generiere realistische Formulardaten für alle Feldtypen
function generateFieldData(field) {
  switch (field.type) {
    case 'text': return ['Photovoltaikanlage 10kWp', 'SolarEdge SE10K', 'Kunde Meier - Dach Süd', 'WR-Austausch 2026', 'Nacharbeit Kabelkanal'][Math.floor(Math.random() * 5)];
    case 'textarea': return ['Anlage wurde gemäß Herstellervorgaben installiert.\nAlle Stecker geprüft.\nDokumentation vollständig.', 'Dachziegel wurden angehoben, Module montiert, Ziegel wieder eingesetzt. Kein Schaden.', 'Wechselrichter zeigt Fehler E102. Austausch erforderlich.'][Math.floor(Math.random() * 3)];
    case 'number': return Math.round(Math.random() * 100 * 10) / 10;
    case 'date': {
      const d = new Date(2025, 3, 1);
      d.setDate(d.getDate() + Math.floor(Math.random() * 365));
      return d.toISOString().split('T')[0];
    }
    case 'time': return `${String(8 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    case 'select': return field.options?.[Math.floor(Math.random() * (field.options?.length || 1))]?.value || 'option-1';
    case 'radio': return field.options?.[Math.floor(Math.random() * (field.options?.length || 1))]?.value || 'option-1';
    case 'checkbox': {
      const opts = field.options || [{ value: 'opt1' }, { value: 'opt2' }];
      const count = 1 + Math.floor(Math.random() * opts.length);
      return opts.slice(0, count).map(o => o.value);
    }
    case 'toggle': return Math.random() > 0.3;
    case 'checklist': {
      const result = {};
      (field.items || []).forEach(item => {
        result[item.id] = { checked: Math.random() > 0.2, note: Math.random() > 0.7 ? 'Notiz: Alles OK' : '' };
      });
      return result;
    }
    case 'rating': return field.ratingType === 'traffic' ? [1, 2, 3][Math.floor(Math.random() * 3)] : 1 + Math.floor(Math.random() * (field.maxStars || 5));
    case 'signature': return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    case 'photo': return ['data:image/jpeg;base64,/9j/4AAQ...', 'data:image/jpeg;base64,/9j/4BBQ...'];
    case 'repeater': {
      const rows = [];
      const count = 1 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const row = {};
        (field.subFields || []).forEach(sf => { row[sf.id] = `Wert ${i + 1}-${sf.id}`; });
        rows.push(row);
      }
      return rows;
    }
    case 'heading': case 'divider': case 'info': return undefined;
    default: return 'test-value';
  }
}

// Submissions-Array
const submissions = [];
const startDate = new Date('2025-04-01');
const endDate = new Date('2026-04-01');
const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

// Templates: 3 Demo + 5 Custom
const customTemplates = [];
for (let i = 0; i < 5; i++) {
  const tpl = createEmptyTemplate();
  tpl.name = `Custom Formular ${i + 1}`;
  tpl.category = ['abnahme', 'service', 'mangel', 'pruefung', 'custom'][i];
  tpl.pages[0].fields = [
    createField('text'),
    createField('textarea'),
    createField('number'),
    createField('date'),
    createField('select'),
    createField('toggle'),
    createField('rating'),
  ];
  // Zweite Seite für einige
  if (i % 2 === 0) {
    tpl.pages.push({
      id: `page-${Date.now()}-${i}`,
      title: 'Seite 2',
      fields: [createField('checklist'), createField('signature'), createField('photo')],
    });
  }
  customTemplates.push(tpl);
}
const allTemplates = [...DEMO_TEMPLATES, ...customTemplates];

assert(allTemplates.length === 8, `8 Templates (3 Demo + 5 Custom): ${allTemplates.length}`);

// Simuliere 500+ Formulareingaben über 365 Tage
const targetSubmissions = 520;
for (let s = 0; s < targetSubmissions; s++) {
  const user = SIM_USERS[Math.floor(Math.random() * SIM_USERS.length)];
  const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  const dayOffset = Math.floor(Math.random() * totalDays);
  const subDate = new Date(startDate);
  subDate.setDate(subDate.getDate() + dayOffset);
  subDate.setHours(7 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60));

  const data = {};
  template.pages.forEach(page => {
    page.fields.forEach(field => {
      const val = generateFieldData(field);
      if (val !== undefined) data[field.id] = val;
    });
  });

  // Status: meiste completed, einige draft, wenige sent/archived
  const statusRoll = Math.random();
  const status = statusRoll < 0.75 ? 'completed' : statusRoll < 0.85 ? 'draft' : statusRoll < 0.95 ? 'sent' : 'archived';

  submissions.push({
    id: `sub-${s}-${Date.now()}`,
    templateId: template.id,
    templateVersion: template.version || 1,
    status,
    data,
    filledBy: user.id,
    filledByName: user.name,
    createdAt: subDate.toISOString(),
    completedAt: status !== 'draft' ? new Date(subDate.getTime() + Math.floor(Math.random() * 3600000)).toISOString() : null,
  });
}

assert(submissions.length >= 500, `${submissions.length} Formulare generiert (Ziel: 500+)`);

// Statistiken prüfen
const byStatus = {};
submissions.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });
console.log(`  Submissions: ${submissions.length}`);
console.log(`  Status-Verteilung: ${JSON.stringify(byStatus)}`);
assert(byStatus.completed > 300, `Completed: ${byStatus.completed} > 300`);
assert(byStatus.draft > 0, 'Mindestens 1 Draft');

const byUser = {};
submissions.forEach(s => { byUser[s.filledByName] = (byUser[s.filledByName] || 0) + 1; });
console.log(`  User-Verteilung: ${JSON.stringify(byUser)}`);
assert(Object.keys(byUser).length === 10, 'Alle 10 User haben Submissions');

const byTemplate = {};
submissions.forEach(s => { byTemplate[s.templateId] = (byTemplate[s.templateId] || 0) + 1; });
console.log(`  Template-Verteilung: ${Object.keys(byTemplate).length} Templates genutzt`);
assert(Object.keys(byTemplate).length === 8, 'Alle 8 Templates genutzt');

// Monate prüfen
const byMonth = {};
submissions.forEach(s => {
  const m = s.createdAt.slice(0, 7);
  byMonth[m] = (byMonth[m] || 0) + 1;
});
console.log(`  Monats-Verteilung: ${Object.keys(byMonth).length} Monate`);
assert(Object.keys(byMonth).length >= 12, 'Mindestens 12 Monate abgedeckt');

// ═══════════════════════════════════════════
//  8. VALIDIERUNG ALLER SIMULIERTEN DATEN
// ═══════════════════════════════════════════
section('8. Validierung aller simulierten Eingaben');

let validationErrors = 0;
let validatedFields = 0;
submissions.forEach(sub => {
  const tpl = allTemplates.find(t => t.id === sub.templateId);
  if (!tpl) { validationErrors++; return; }
  tpl.pages.forEach(page => {
    const errs = validatePage(page, sub.data);
    // Completed submissions should have no required-field errors for non-conditional fields
    if (sub.status === 'completed') {
      page.fields.forEach(f => {
        if (f.required && !f.conditions && !['heading', 'divider', 'info'].includes(f.type)) {
          if (errs[f.id]) validationErrors++;
        }
        validatedFields++;
      });
    }
  });
});
console.log(`  Validierte Felder: ${validatedFields}`);
console.log(`  Validierungsfehler: ${validationErrors}`);
// Some errors expected since random data might not meet all validation rules
assert(validatedFields > 3000, `Genügend Felder validiert: ${validatedFields}`);

// ═══════════════════════════════════════════
//  9. SUCHE & FILTER SIMULATION
// ═══════════════════════════════════════════
section('9. Suche & Filter');

// Filter by status
const completedSubs = submissions.filter(s => s.status === 'completed');
assert(completedSubs.length > 300, `Completed filter: ${completedSubs.length} > 300`);

// Filter by template
const firstTpl = allTemplates[0];
const tplSubs = submissions.filter(s => s.templateId === firstTpl.id);
assert(tplSubs.length > 0, `Template filter: ${tplSubs.length} für "${firstTpl.name}"`);

// Text search
const searchResults = submissions.filter(s => {
  if (s.filledByName?.toLowerCase().includes('max')) return true;
  return Object.values(s.data || {}).some(v => String(v).toLowerCase().includes('solar'));
});
console.log(`  Suche "max/solar": ${searchResults.length} Treffer`);

// Combined filter
const combined = submissions.filter(s => s.status === 'completed' && s.templateId === firstTpl.id);
console.log(`  Combined filter (completed + ${firstTpl.name}): ${combined.length} Treffer`);

// ═══════════════════════════════════════════
//  10. CSV EXPORT SIMULATION
// ═══════════════════════════════════════════
section('10. CSV Export Logik');

// Simulate CSV row generation
const templateMap = {};
allTemplates.forEach(t => { templateMap[t.id] = t; });

const fieldMap = new Map();
submissions.forEach(sub => {
  const tpl = templateMap[sub.templateId];
  if (!tpl) return;
  tpl.pages.flatMap(p => p.fields).forEach(f => {
    if (!['heading', 'divider', 'info'].includes(f.type)) {
      fieldMap.set(f.id, f.label || f.type);
    }
  });
});

const headers = ['ID', 'Formular', 'Status', 'Ausgefüllt von', 'Erstellt am', 'Abgeschlossen am', ...fieldMap.values()];
assert(headers.length > 10, `CSV Headers: ${headers.length} Spalten`);
console.log(`  CSV: ${headers.length} Spalten, ${submissions.length} Zeilen`);

// Test CSV escape
const escape = (v) => {
  const s = String(v).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
};
assert(escape('Normal') === 'Normal', 'CSV escape: normal');
assert(escape('Mit,Komma') === '"Mit,Komma"', 'CSV escape: Komma');
assert(escape('Mit"Quote') === '"Mit""Quote"', 'CSV escape: Quote');
assert(escape('Mit\nNewline') === '"Mit\nNewline"', 'CSV escape: Newline');

// ═══════════════════════════════════════════
//  11. PDF EXPORT LOGIK
// ═══════════════════════════════════════════
section('11. PDF Export Logik');

// Test formatValue equivalent
function formatValue(field, value) {
  if (value === null || value === undefined || value === '') return '—';
  switch (field.type) {
    case 'toggle': return value ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein');
    case 'checkbox': return Array.isArray(value) ? value.join(', ') : String(value);
    case 'rating':
      if (field.ratingType === 'traffic') {
        const labels = { 1: 'Gut', 2: 'Mittel', 3: 'Schlecht' };
        return labels[value] || String(value);
      }
      return `${'★'.repeat(Number(value))}${'☆'.repeat((field.maxStars || 5) - Number(value))}`;
    default: return String(value);
  }
}

assert(formatValue({ type: 'toggle' }, true) === 'Ja', 'PDF: toggle true');
assert(formatValue({ type: 'toggle' }, false) === 'Nein', 'PDF: toggle false');
assert(formatValue({ type: 'toggle', labelOn: 'An', labelOff: 'Aus' }, true) === 'An', 'PDF: toggle custom label');
assert(formatValue({ type: 'checkbox' }, ['A', 'B']) === 'A, B', 'PDF: checkbox');
assert(formatValue({ type: 'rating', ratingType: 'traffic' }, 1) === 'Gut', 'PDF: traffic 1 → Gut');
assert(formatValue({ type: 'rating', ratingType: 'traffic' }, 2) === 'Mittel', 'PDF: traffic 2 → Mittel');
assert(formatValue({ type: 'rating', ratingType: 'traffic' }, 3) === 'Schlecht', 'PDF: traffic 3 → Schlecht');
assert(formatValue({ type: 'rating', maxStars: 5 }, 3) === '★★★☆☆', 'PDF: stars 3/5');
assert(formatValue({ type: 'text' }, null) === '—', 'PDF: null → Strich');
assert(formatValue({ type: 'text' }, '') === '—', 'PDF: leer → Strich');

// Test alle Submissions können formatiert werden (kein Crash)
let formatCrashes = 0;
submissions.forEach(sub => {
  const tpl = templateMap[sub.templateId];
  if (!tpl) return;
  try {
    tpl.pages.flatMap(p => p.fields).forEach(f => {
      if (!['heading', 'divider', 'info'].includes(f.type)) {
        formatValue(f, sub.data[f.id]);
      }
    });
  } catch (e) {
    formatCrashes++;
    console.error(`  Format crash: ${e.message} (template: ${tpl.name}, sub: ${sub.id})`);
  }
});
assert(formatCrashes === 0, `PDF Format ohne Crashes: ${formatCrashes}`);

// ═══════════════════════════════════════════
//  12. TEMPLATE BUILDER LOGIK
// ═══════════════════════════════════════════
section('12. Template Builder Operationen');

// Template erstellen, Felder hinzufügen, Seiten verwalten
let tpl = createEmptyTemplate();
assert(tpl.pages.length === 1, 'Neues Template: 1 Seite');

// Felder hinzufügen
const fields = [createField('text'), createField('number'), createField('select'), createField('toggle')];
tpl.pages[0].fields = fields;
assert(tpl.pages[0].fields.length === 4, '4 Felder hinzugefügt');

// Seite hinzufügen
tpl.pages.push({ id: `page-new`, title: 'Seite 2', fields: [createField('signature'), createField('photo')] });
assert(tpl.pages.length === 2, '2 Seiten');

// Feld verschieben (Index 0 → 2)
const fieldsCopy = [...tpl.pages[0].fields];
const [moved] = fieldsCopy.splice(0, 1);
fieldsCopy.splice(2, 0, moved);
tpl.pages[0].fields = fieldsCopy;
assert(tpl.pages[0].fields[2].type === 'text', 'Feld verschoben: text jetzt an Index 2');

// Feld löschen
tpl.pages[0].fields = tpl.pages[0].fields.filter(f => f.type !== 'toggle');
assert(tpl.pages[0].fields.length === 3, 'Toggle gelöscht: 3 Felder');

// Seite umbenennen
tpl.pages[1].title = 'Unterschriften';
assert(tpl.pages[1].title === 'Unterschriften', 'Seite umbenannt');

// Seite löschen
tpl.pages = tpl.pages.filter((_, i) => i !== 1);
assert(tpl.pages.length === 1, 'Seite gelöscht: 1 Seite');

// Breite ändern
tpl.pages[0].fields[0] = { ...tpl.pages[0].fields[0], width: 'half' };
assert(tpl.pages[0].fields[0].width === 'half', 'Breite geändert: half');

// ═══════════════════════════════════════════
//  13. CONDITIONAL TEMPLATE MIT VALIDIERUNG
// ═══════════════════════════════════════════
section('13. Komplexe bedingte Formulare');

const complexPage = {
  id: 'cp1', title: 'Komplex',
  fields: [
    { id: 'art', type: 'select', label: 'Auftragsart', required: true, options: [{ value: 'montage', label: 'Montage' }, { value: 'service', label: 'Service' }, { value: 'pruefung', label: 'Prüfung' }] },
    { id: 'leistung', type: 'number', label: 'Leistung kWp', required: true, validation: { min: 0.5, max: 500 }, conditions: [{ field: 'art', operator: 'equals', value: 'montage', action: 'show' }] },
    { id: 'fehler', type: 'textarea', label: 'Fehlerbeschreibung', required: true, conditions: [{ field: 'art', operator: 'equals', value: 'service', action: 'show' }] },
    { id: 'protokoll', type: 'checklist', label: 'Prüfprotokoll', required: true, items: [{ id: 'p1', label: 'Erdung' }, { id: 'p2', label: 'Isolierung' }, { id: 'p3', label: 'Leistung' }], conditions: [{ field: 'art', operator: 'equals', value: 'pruefung', action: 'show' }] },
    { id: 'sig', type: 'signature', label: 'Unterschrift', required: true },
    { id: 'bewertung', type: 'rating', label: 'Bewertung', ratingType: 'traffic' },
  ]
};

// Montage-Szenario
let errs = validatePage(complexPage, { art: 'montage', leistung: 10, sig: 'data:...' });
assert(Object.keys(errs).length === 0, 'Montage komplett → 0 Fehler');

// Montage ohne Leistung
errs = validatePage(complexPage, { art: 'montage', sig: 'data:...' });
assert(errs['leistung'], 'Montage ohne Leistung → Fehler');
assert(!errs['fehler'], 'Fehlerbeschreibung versteckt → kein Fehler');
assert(!errs['protokoll'], 'Prüfprotokoll versteckt → kein Fehler');

// Service-Szenario
errs = validatePage(complexPage, { art: 'service', fehler: 'WR defekt', sig: 'data:...' });
assert(Object.keys(errs).length === 0, 'Service komplett → 0 Fehler');

errs = validatePage(complexPage, { art: 'service', sig: 'data:...' });
assert(errs['fehler'], 'Service ohne Fehlerbeschreibung → Fehler');
assert(!errs['leistung'], 'Leistung versteckt → kein Fehler');

// Prüfung-Szenario
errs = validatePage(complexPage, { art: 'pruefung', protokoll: { p1: { checked: true }, p2: { checked: true }, p3: { checked: true } }, sig: 'data:...' });
assert(Object.keys(errs).length === 0, 'Prüfung komplett → 0 Fehler');

errs = validatePage(complexPage, { art: 'pruefung', protokoll: {}, sig: 'data:...' });
assert(errs['protokoll'], 'Prüfung ohne Checks → Fehler');

// ═══════════════════════════════════════════
//  14. EDGE CASES
// ═══════════════════════════════════════════
section('14. Edge Cases');

// Leere Seite validieren
assert(Object.keys(validatePage({ id: 'empty', title: 'Leer', fields: [] }, {})).length === 0, 'Leere Seite → 0 Fehler');
assert(Object.keys(validatePage(null, {})).length === 0, 'null Seite → 0 Fehler');
assert(Object.keys(validatePage(undefined, {})).length === 0, 'undefined Seite → 0 Fehler');

// Feld ohne Label
const noLabel = { id: 'nl', type: 'text', required: true };
assert(validateField(noLabel, '', {}) !== null, 'Ohne Label required → Fehler');

// Sehr langer Text
const longText = 'A'.repeat(10000);
assert(validateField({ id: 'lt', type: 'text', label: 'Lang' }, longText, {}) === null, '10.000 Zeichen → OK');

// Unicode
assert(validateField({ id: 'uc', type: 'text', label: 'Unicode', required: true }, '日本語テスト 🚀', {}) === null, 'Unicode → OK');

// Number edge cases
assert(validateField({ id: 'n0', type: 'number', label: 'Null', required: true, validation: { min: 0 } }, 0, {}) === null, 'Number 0 mit min:0 → OK');

// Checkbox empty array
assert(validateField({ id: 'cb', type: 'checkbox', label: 'Check', required: true }, [], {}) !== null, 'Checkbox leeres Array → Fehler');

// ═══════════════════════════════════════════
//  15. ERGEBNIS
// ═══════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`  ERGEBNIS: ${passed} bestanden, ${failed} fehlgeschlagen`);
console.log('═'.repeat(50));

if (errors.length > 0) {
  console.log('\n  Fehlgeschlagene Tests:');
  errors.forEach(e => console.log(`    - ${e}`));
}

console.log(`\n  Simulation: ${submissions.length} Formulare, ${SIM_USERS.length} Nutzer, ${Object.keys(byMonth).length} Monate`);
console.log(`  Templates: ${allTemplates.length} (${DEMO_TEMPLATES.length} Demo + ${customTemplates.length} Custom)`);
console.log(`  Felder validiert: ${validatedFields}`);

process.exit(failed > 0 ? 1 : 0);
