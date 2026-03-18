// ═══ FEATURE: Demo Templates (Chat F.1) ═══
import { INDUSTRY_TEMPLATES } from './industryTemplates';

const _DEMO_TEMPLATES = [
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
        { id: 'f10', type: 'photo', label: 'Fotos vom Einsatz', width: 'full', validation: { maxPhotos: 5 } },
        { id: 'f11', type: 'signature', label: 'Unterschrift Techniker', required: true, width: 'full' },
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
          { id: 'a25', type: 'photo', label: 'Fotos der Anlage', width: 'full', validation: { maxPhotos: 10 } },
          { id: 'a26', type: 'signature', label: 'Unterschrift Auftraggeber', required: true, width: 'full' },
          { id: 'a27', type: 'signature', label: 'Unterschrift Monteur', required: true, width: 'full' },
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
          { id: 'm15', type: 'photo', label: 'Fotos der Mängel', required: true, width: 'full', validation: { maxPhotos: 10 } },
          { id: 'm16', type: 'signature', label: 'Unterschrift Prüfer', required: true, width: 'full' },
        ]
      }
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#dc2626' },
  }
];

// Kombinierter Export: 3 Demo-Templates + 20 Branchenvorlagen
export const DEMO_TEMPLATES = [..._DEMO_TEMPLATES, ...INDUSTRY_TEMPLATES];
