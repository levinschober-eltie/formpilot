// ═══ FEATURE: 20 Branchenspezifische Vorlagen (Prompt 02) ═══
// Modulare Vorlagenbibliothek — wird in templates.js importiert und zu DEMO_TEMPLATES hinzugefügt.

export const INDUSTRY_TEMPLATES = [

  // ═══════════════════════════════════════════
  // SHK (Sanitär, Heizung, Klima) — 4 Templates
  // ═══════════════════════════════════════════

  // 1. Heizungswartungsprotokoll
  {
    id: 'tpl-shk-heizungswartung',
    name: 'Heizungswartungsprotokoll',
    description: 'Vollständiges Wartungsprotokoll für Heizungsanlagen inkl. Messwerte und Prüfpunkte',
    category: 'pruefung',
    icon: '🔥',
    version: 1,
    pages: [
      {
        id: 'shk-hw-p1', title: 'Kundendaten', fields: [
          { id: 'shk-hw-001', type: 'heading', label: 'Kundendaten', level: 'h2' },
          { id: 'shk-hw-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'shk-hw-003', type: 'text', label: 'Auftragsnummer', width: 'half', placeholder: 'z.B. AUF-2024-001' },
          { id: 'shk-hw-004', type: 'text', label: 'Kundenname', required: true, width: 'full', placeholder: 'Vor- und Nachname / Firma' },
          { id: 'shk-hw-005', type: 'text', label: 'Adresse', required: true, width: 'full', placeholder: 'Straße, PLZ Ort' },
          { id: 'shk-hw-006', type: 'text', label: 'Telefon', width: 'half', placeholder: 'Telefonnummer' },
          { id: 'shk-hw-007', type: 'text', label: 'Anlagennummer', width: 'half', placeholder: 'Anlagen-Nr.' },
        ]
      },
      {
        id: 'shk-hw-p2', title: 'Anlagendaten', fields: [
          { id: 'shk-hw-010', type: 'heading', label: 'Anlagendaten', level: 'h2' },
          { id: 'shk-hw-011', type: 'select', label: 'Hersteller', required: true, width: 'half', options: [
            { value: 'viessmann', label: 'Viessmann' },
            { value: 'buderus', label: 'Buderus' },
            { value: 'vaillant', label: 'Vaillant' },
            { value: 'wolf', label: 'Wolf' },
            { value: 'junkers', label: 'Junkers/Bosch' },
            { value: 'weishaupt', label: 'Weishaupt' },
            { value: 'brötje', label: 'Brötje' },
            { value: 'sonstige', label: 'Sonstige' },
          ]},
          { id: 'shk-hw-012', type: 'text', label: 'Typ / Modell', required: true, width: 'half', placeholder: 'z.B. Vitodens 300-W' },
          { id: 'shk-hw-013', type: 'number', label: 'Baujahr', width: 'half', validation: { min: 1970, max: 2030 } },
          { id: 'shk-hw-014', type: 'select', label: 'Brennstoff', required: true, width: 'half', options: [
            { value: 'gas', label: 'Gas' },
            { value: 'oel', label: 'Öl' },
            { value: 'pellet', label: 'Pellet' },
            { value: 'waermepumpe', label: 'Wärmepumpe' },
            { value: 'fernwaerme', label: 'Fernwärme' },
          ]},
          { id: 'shk-hw-015', type: 'number', label: 'Leistung (kW)', width: 'half', validation: { min: 0, max: 999, decimals: 1 } },
          { id: 'shk-hw-016', type: 'text', label: 'Fabrik-Nr. / Serien-Nr.', width: 'half' },
        ]
      },
      {
        id: 'shk-hw-p3', title: 'Prüfpunkte', fields: [
          { id: 'shk-hw-020', type: 'heading', label: 'Wartungsprüfung', level: 'h2' },
          { id: 'shk-hw-021', type: 'info', label: '', content: 'Alle Prüfpunkte sorgfältig kontrollieren und abhaken.' },
          { id: 'shk-hw-022', type: 'checklist', label: 'Prüfpunkte Heizungsanlage', required: true, items: [
            { id: 'shk-hw-c01', label: 'Brenner gereinigt und geprüft' },
            { id: 'shk-hw-c02', label: 'Abgaswerte gemessen und protokolliert' },
            { id: 'shk-hw-c03', label: 'Dichtheitsprüfung durchgeführt' },
            { id: 'shk-hw-c04', label: 'Ausdehnungsgefäß Vordruck geprüft' },
            { id: 'shk-hw-c05', label: 'Sicherheitsventil geprüft' },
            { id: 'shk-hw-c06', label: 'Umwälzpumpe geprüft' },
            { id: 'shk-hw-c07', label: 'Regelung / Steuerung kontrolliert' },
            { id: 'shk-hw-c08', label: 'Schornsteinanschluss geprüft' },
            { id: 'shk-hw-c09', label: 'Kondensatablauf gereinigt' },
            { id: 'shk-hw-c10', label: 'Wasserdruck kontrolliert' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'shk-hw-p4', title: 'Messwerte', fields: [
          { id: 'shk-hw-030', type: 'heading', label: 'Abgasmesswerte', level: 'h2' },
          { id: 'shk-hw-031', type: 'number', label: 'Abgastemperatur (°C)', width: 'half', validation: { min: 0, max: 500, decimals: 1 } },
          { id: 'shk-hw-032', type: 'number', label: 'CO-Wert (mg/kWh)', width: 'half', validation: { min: 0, max: 5000, decimals: 0 } },
          { id: 'shk-hw-033', type: 'number', label: 'O₂-Wert (%)', width: 'half', validation: { min: 0, max: 21, decimals: 1 } },
          { id: 'shk-hw-034', type: 'number', label: 'Abgasverlust (%)', width: 'half', validation: { min: 0, max: 30, decimals: 1 } },
          { id: 'shk-hw-035', type: 'number', label: 'Rußzahl', width: 'half', validation: { min: 0, max: 9, decimals: 0 } },
          { id: 'shk-hw-036', type: 'number', label: 'CO₂-Wert (%)', width: 'half', validation: { min: 0, max: 20, decimals: 1 } },
          { id: 'shk-hw-037', type: 'number', label: 'Zugwert (Pa)', width: 'half', validation: { min: -50, max: 50, decimals: 1 } },
          { id: 'shk-hw-038', type: 'number', label: 'Anlagendruck (bar)', width: 'half', validation: { min: 0, max: 10, decimals: 1 } },
        ]
      },
      {
        id: 'shk-hw-p5', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'shk-hw-040', type: 'heading', label: 'Gesamtbewertung', level: 'h2' },
          { id: 'shk-hw-041', type: 'rating', label: 'Gesamtzustand der Anlage', required: true, maxStars: 5, ratingType: 'stars' },
          { id: 'shk-hw-042', type: 'textarea', label: 'Bemerkungen / Empfehlungen', width: 'full', placeholder: 'Hinweise, empfohlene Maßnahmen...' },
          { id: 'shk-hw-043', type: 'toggle', label: 'Mängel vorhanden', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'shk-hw-044', type: 'textarea', label: 'Mängelbeschreibung', width: 'full', placeholder: 'Art und Umfang der Mängel...', conditions: [{ field: 'shk-hw-043', operator: 'equals', value: true, action: 'show' }] },
          { id: 'shk-hw-045', type: 'date', label: 'Nächster Wartungstermin', width: 'half' },
          { id: 'shk-hw-046', type: 'divider' },
          { id: 'shk-hw-047', type: 'signature', label: 'Unterschrift Techniker', required: true, width: 'full' },
          { id: 'shk-hw-048', type: 'signature', label: 'Unterschrift Kunde', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#dc2626' },
  },

  // 2. Trinkwasser-Probenahmeprotokoll
  {
    id: 'tpl-shk-trinkwasser',
    name: 'Trinkwasser-Probenahmeprotokoll',
    description: 'Protokoll zur Probenahme von Trinkwasser gemäß TrinkwV',
    category: 'pruefung',
    icon: '🚿',
    version: 1,
    pages: [
      {
        id: 'shk-tw-p1', title: 'Probenahmestelle', fields: [
          { id: 'shk-tw-001', type: 'heading', label: 'Probenahmedaten', level: 'h2' },
          { id: 'shk-tw-002', type: 'date', label: 'Datum der Probenahme', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'shk-tw-003', type: 'time', label: 'Uhrzeit', required: true, width: 'half' },
          { id: 'shk-tw-004', type: 'text', label: 'Proben-Nr.', required: true, width: 'half', placeholder: 'z.B. TW-2024-001' },
          { id: 'shk-tw-005', type: 'text', label: 'Probennehmer', required: true, width: 'half' },
          { id: 'shk-tw-006', type: 'text', label: 'Auftraggeber', required: true, width: 'full' },
          { id: 'shk-tw-007', type: 'text', label: 'Objekt / Adresse', required: true, width: 'full', placeholder: 'Gebäude, Straße, PLZ Ort' },
          { id: 'shk-tw-008', type: 'text', label: 'Probenahmestelle', required: true, width: 'full', placeholder: 'z.B. Küche EG, Zapfstelle Bad 2.OG' },
        ]
      },
      {
        id: 'shk-tw-p2', title: 'Anlageninformationen', fields: [
          { id: 'shk-tw-010', type: 'heading', label: 'Anlageninformationen', level: 'h2' },
          { id: 'shk-tw-011', type: 'select', label: 'Leitungsmaterial', width: 'half', options: [
            { value: 'kupfer', label: 'Kupfer' },
            { value: 'edelstahl', label: 'Edelstahl' },
            { value: 'verzinkt', label: 'Verzinkter Stahl' },
            { value: 'kunststoff', label: 'Kunststoff' },
            { value: 'blei', label: 'Blei (Altbestand)' },
            { value: 'unbekannt', label: 'Unbekannt' },
          ]},
          { id: 'shk-tw-012', type: 'select', label: 'Probenart', required: true, width: 'half', options: [
            { value: 'stagnation', label: 'Stagnationsprobe' },
            { value: 'zufall', label: 'Zufallsprobe (Z)' },
            { value: 'ablauf', label: 'Ablaufprobe nach Spülung' },
          ]},
          { id: 'shk-tw-013', type: 'number', label: 'Wassertemperatur (°C)', width: 'half', validation: { min: 0, max: 100, decimals: 1 } },
          { id: 'shk-tw-014', type: 'select', label: 'Warmwasser / Kaltwasser', width: 'half', options: [
            { value: 'kalt', label: 'Kaltwasser (PWC)' },
            { value: 'warm', label: 'Warmwasser (PWH)' },
            { value: 'zirkulation', label: 'Zirkulation (PWH-C)' },
          ]},
          { id: 'shk-tw-015', type: 'checklist', label: 'Probenahmebedingungen', items: [
            { id: 'shk-tw-c01', label: 'Vorlaufzeit eingehalten (mind. 4h Stagnation)' },
            { id: 'shk-tw-c02', label: 'Entnahmestelle desinfiziert / abgeflammt' },
            { id: 'shk-tw-c03', label: 'Probengefäß steril' },
            { id: 'shk-tw-c04', label: 'Transportbedingungen eingehalten' },
          ], allowNotes: true },
          { id: 'shk-tw-016', type: 'textarea', label: 'Bemerkungen zur Probenahme', width: 'full' },
        ]
      },
      {
        id: 'shk-tw-p3', title: 'Dokumentation & Unterschrift', fields: [
          { id: 'shk-tw-020', type: 'heading', label: 'Dokumentation', level: 'h2' },
          { id: 'shk-tw-021', type: 'photo', label: 'Foto der Entnahmestelle', width: 'full', validation: { maxPhotos: 3 } },
          { id: 'shk-tw-022', type: 'textarea', label: 'Besondere Auffälligkeiten', width: 'full', placeholder: 'z.B. Verfärbung, Geruch, Trübung...' },
          { id: 'shk-tw-023', type: 'text', label: 'Labor / Versand an', width: 'full', placeholder: 'Name des Labors' },
          { id: 'shk-tw-024', type: 'divider' },
          { id: 'shk-tw-025', type: 'signature', label: 'Unterschrift Probennehmer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#0ea5e9' },
  },

  // 3. Rohrleitungs-Abdruckprotokoll
  {
    id: 'tpl-shk-abdruck',
    name: 'Rohrleitungs-Abdruckprotokoll',
    description: 'Druckprüfprotokoll für Rohrleitungen nach DIN EN 806-4 / DIN 1988-2',
    category: 'pruefung',
    icon: '🔧',
    version: 1,
    pages: [
      {
        id: 'shk-ab-p1', title: 'Bauvorhaben & Leitung', fields: [
          { id: 'shk-ab-001', type: 'heading', label: 'Bauvorhaben', level: 'h2' },
          { id: 'shk-ab-002', type: 'date', label: 'Prüfdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'shk-ab-003', type: 'text', label: 'Bauvorhaben / Objekt', required: true, width: 'full', placeholder: 'Bezeichnung und Adresse' },
          { id: 'shk-ab-004', type: 'text', label: 'Auftraggeber', required: true, width: 'half' },
          { id: 'shk-ab-005', type: 'text', label: 'Auftragnehmer / Installateur', required: true, width: 'half' },
          { id: 'shk-ab-006', type: 'divider' },
          { id: 'shk-ab-007', type: 'heading', label: 'Leitungsdaten', level: 'h2' },
          { id: 'shk-ab-008', type: 'select', label: 'Leitungsart', required: true, width: 'half', options: [
            { value: 'trinkwasser', label: 'Trinkwasserleitung' },
            { value: 'heizung', label: 'Heizungsleitung' },
            { value: 'gas', label: 'Gasleitung' },
            { value: 'abwasser', label: 'Abwasserleitung (Druckleitung)' },
            { value: 'sonstige', label: 'Sonstige' },
          ]},
          { id: 'shk-ab-009', type: 'select', label: 'Leitungsmaterial', width: 'half', options: [
            { value: 'kupfer', label: 'Kupfer' },
            { value: 'edelstahl', label: 'Edelstahl' },
            { value: 'kunststoff', label: 'Kunststoff (PE/PP/PVC)' },
            { value: 'verbund', label: 'Mehrschichtverbundrohr' },
            { value: 'stahl', label: 'Stahl' },
          ]},
          { id: 'shk-ab-010', type: 'text', label: 'Leitungsabschnitt / Dimension', width: 'full', placeholder: 'z.B. KG → 1.OG, DN 20-32' },
        ]
      },
      {
        id: 'shk-ab-p2', title: 'Druckprüfung', fields: [
          { id: 'shk-ab-020', type: 'heading', label: 'Prüfparameter', level: 'h2' },
          { id: 'shk-ab-021', type: 'select', label: 'Prüfmedium', required: true, width: 'half', options: [
            { value: 'wasser', label: 'Wasser' },
            { value: 'luft', label: 'Druckluft' },
            { value: 'stickstoff', label: 'Stickstoff' },
            { value: 'inertgas', label: 'Inertgas' },
          ]},
          { id: 'shk-ab-022', type: 'number', label: 'Prüfdruck (bar)', required: true, width: 'half', validation: { min: 0, max: 100, decimals: 1 } },
          { id: 'shk-ab-023', type: 'number', label: 'Einwirkzeit (min)', required: true, width: 'half', validation: { min: 0, max: 1440 } },
          { id: 'shk-ab-024', type: 'time', label: 'Prüfbeginn', required: true, width: 'half' },
          { id: 'shk-ab-025', type: 'divider' },
          { id: 'shk-ab-026', type: 'heading', label: 'Ablesedrücke', level: 'h2' },
          { id: 'shk-ab-027', type: 'info', label: '', content: 'Druckwerte zu den jeweiligen Ablesezeitpunkten eintragen.' },
          { id: 'shk-ab-028', type: 'repeater', label: 'Druckablesungen', width: 'full', subFields: [
            { id: 'shk-ab-sf01', label: 'Uhrzeit', type: 'time', placeholder: '' },
            { id: 'shk-ab-sf02', label: 'Abgelesener Druck (bar)', type: 'number', placeholder: '' },
            { id: 'shk-ab-sf03', label: 'Bemerkung', type: 'text', placeholder: '' },
          ], validation: { maxRows: 20 } },
        ]
      },
      {
        id: 'shk-ab-p3', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'shk-ab-030', type: 'heading', label: 'Prüfergebnis', level: 'h2' },
          { id: 'shk-ab-031', type: 'radio', label: 'Ergebnis der Druckprüfung', required: true, options: [
            { value: 'bestanden', label: 'Bestanden — kein Druckabfall festgestellt' },
            { value: 'nicht-bestanden', label: 'Nicht bestanden — Druckabfall festgestellt' },
          ]},
          { id: 'shk-ab-032', type: 'textarea', label: 'Bemerkungen', width: 'full', placeholder: 'Ggf. Leckagen, Nachbesserungen...' },
          { id: 'shk-ab-033', type: 'photo', label: 'Fotos (Manometer, Leitung)', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'shk-ab-034', type: 'divider' },
          { id: 'shk-ab-035', type: 'signature', label: 'Unterschrift Prüfer / Installateur', required: true, width: 'full' },
          { id: 'shk-ab-036', type: 'signature', label: 'Unterschrift Auftraggeber', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#2563eb' },
  },

  // 4. SHK-Serviceauftrag
  {
    id: 'tpl-shk-service',
    name: 'SHK-Serviceauftrag',
    description: 'Serviceauftrag für Sanitär-, Heizungs- und Klimatechnik mit Materialerfassung',
    category: 'service',
    icon: '🛠️',
    version: 1,
    pages: [
      {
        id: 'shk-sa-p1', title: 'Auftragsdaten', fields: [
          { id: 'shk-sa-001', type: 'heading', label: 'Auftragsdaten', level: 'h2' },
          { id: 'shk-sa-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'shk-sa-003', type: 'text', label: 'Auftragsnummer', width: 'half', placeholder: 'z.B. SA-2024-001' },
          { id: 'shk-sa-004', type: 'text', label: 'Kundenname', required: true, width: 'full', placeholder: 'Vor- und Nachname / Firma' },
          { id: 'shk-sa-005', type: 'text', label: 'Adresse', required: true, width: 'full', placeholder: 'Straße, PLZ Ort' },
          { id: 'shk-sa-006', type: 'text', label: 'Telefon', width: 'half' },
          { id: 'shk-sa-007', type: 'time', label: 'Anfahrtszeit / Ankunft', width: 'half' },
        ]
      },
      {
        id: 'shk-sa-p2', title: 'Störung & Arbeiten', fields: [
          { id: 'shk-sa-010', type: 'heading', label: 'Störung / Auftrag', level: 'h2' },
          { id: 'shk-sa-011', type: 'select', label: 'Art der Störung', required: true, width: 'full', options: [
            { value: 'heizungsausfall', label: 'Heizungsausfall' },
            { value: 'wasserrohrbruch', label: 'Wasserrohrbruch' },
            { value: 'verstopfung', label: 'Verstopfung / Abfluss' },
            { value: 'warmwasser', label: 'Kein Warmwasser' },
            { value: 'leckage', label: 'Leckage / Tropfwasser' },
            { value: 'therme', label: 'Therme / Brenner Störung' },
            { value: 'wartung', label: 'Geplante Wartung' },
            { value: 'installation', label: 'Neuinstallation' },
            { value: 'sonstige', label: 'Sonstige' },
          ]},
          { id: 'shk-sa-012', type: 'textarea', label: 'Beschreibung der Störung / des Auftrags', required: true, width: 'full', placeholder: 'Detaillierte Beschreibung...' },
          { id: 'shk-sa-013', type: 'divider' },
          { id: 'shk-sa-014', type: 'heading', label: 'Durchgeführte Arbeiten', level: 'h2' },
          { id: 'shk-sa-015', type: 'textarea', label: 'Durchgeführte Arbeiten', required: true, width: 'full', placeholder: 'Was wurde gemacht?' },
        ]
      },
      {
        id: 'shk-sa-p3', title: 'Material & Zeit', fields: [
          { id: 'shk-sa-020', type: 'heading', label: 'Materialverbrauch', level: 'h2' },
          { id: 'shk-sa-021', type: 'repeater', label: 'Verbrauchtes Material', width: 'full', subFields: [
            { id: 'shk-sa-sf01', label: 'Artikel / Material', type: 'text', placeholder: 'z.B. Heizkörperventil' },
            { id: 'shk-sa-sf02', label: 'Menge', type: 'number', placeholder: '' },
            { id: 'shk-sa-sf03', label: 'Einheit', type: 'text', placeholder: 'Stk./m/kg' },
          ], validation: { maxRows: 15 } },
          { id: 'shk-sa-022', type: 'divider' },
          { id: 'shk-sa-023', type: 'heading', label: 'Arbeitszeit', level: 'h2' },
          { id: 'shk-sa-024', type: 'number', label: 'Arbeitszeit (Stunden)', required: true, width: 'half', validation: { min: 0, max: 24, decimals: 2 } },
          { id: 'shk-sa-025', type: 'number', label: 'Fahrtzeit (Stunden)', width: 'half', validation: { min: 0, max: 10, decimals: 2 } },
          { id: 'shk-sa-026', type: 'select', label: 'Status', required: true, width: 'half', options: [
            { value: 'erledigt', label: 'Erledigt' },
            { value: 'teilweise', label: 'Teilweise — Folgetermin nötig' },
            { value: 'material', label: 'Material bestellt — Folgetermin' },
          ]},
        ]
      },
      {
        id: 'shk-sa-p4', title: 'Fotos & Unterschrift', fields: [
          { id: 'shk-sa-030', type: 'heading', label: 'Dokumentation', level: 'h2' },
          { id: 'shk-sa-031', type: 'photo', label: 'Fotos vorher', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'shk-sa-032', type: 'photo', label: 'Fotos nachher', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'shk-sa-033', type: 'textarea', label: 'Bemerkungen', width: 'full' },
          { id: 'shk-sa-034', type: 'divider' },
          { id: 'shk-sa-035', type: 'signature', label: 'Unterschrift Techniker', required: true, width: 'full' },
          { id: 'shk-sa-036', type: 'signature', label: 'Unterschrift Kunde', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#2563eb' },
  },

  // ═══════════════════════════════════════════
  // Elektro — 4 Templates
  // ═══════════════════════════════════════════

  // 5. E-Check Protokoll
  {
    id: 'tpl-elek-echeck',
    name: 'E-Check Protokoll',
    description: 'Prüfprotokoll für die elektrische Anlage nach DIN VDE 0100-600',
    category: 'pruefung',
    icon: '⚡',
    version: 1,
    pages: [
      {
        id: 'elek-ec-p1', title: 'Anlagendaten', fields: [
          { id: 'elek-ec-001', type: 'heading', label: 'Anlagendaten', level: 'h2' },
          { id: 'elek-ec-002', type: 'date', label: 'Prüfdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'elek-ec-003', type: 'text', label: 'Prüfer / Elektrofachkraft', required: true, width: 'half' },
          { id: 'elek-ec-004', type: 'text', label: 'Auftraggeber', required: true, width: 'full' },
          { id: 'elek-ec-005', type: 'text', label: 'Standort / Adresse', required: true, width: 'full' },
          { id: 'elek-ec-006', type: 'text', label: 'Zähler-Nr.', width: 'half' },
          { id: 'elek-ec-007', type: 'text', label: 'Sicherungskasten / UV-Bezeichnung', width: 'half' },
        ]
      },
      {
        id: 'elek-ec-p2', title: 'Prüfpunkte', fields: [
          { id: 'elek-ec-010', type: 'heading', label: 'Sichtprüfung & Funktionsprüfung', level: 'h2' },
          { id: 'elek-ec-011', type: 'checklist', label: 'Prüfpunkte elektrische Anlage', required: true, items: [
            { id: 'elek-ec-c01', label: 'Leitungsanlage ordnungsgemäß verlegt' },
            { id: 'elek-ec-c02', label: 'Schutzmaßnahmen vorhanden und wirksam' },
            { id: 'elek-ec-c03', label: 'Fehlerstromschutzschalter (RCD) vorhanden' },
            { id: 'elek-ec-c04', label: 'Überspannungsschutz vorhanden' },
            { id: 'elek-ec-c05', label: 'Isolationswiderstand ausreichend' },
            { id: 'elek-ec-c06', label: 'Schleifenimpedanz gemessen' },
            { id: 'elek-ec-c07', label: 'Schutzleiterverbindungen geprüft' },
            { id: 'elek-ec-c08', label: 'Beschriftung der Sicherungen vorhanden' },
            { id: 'elek-ec-c09', label: 'Steckdosen und Schalter einwandfrei' },
            { id: 'elek-ec-c10', label: 'Potentialausgleich vorhanden' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'elek-ec-p3', title: 'Messwerte', fields: [
          { id: 'elek-ec-020', type: 'heading', label: 'Messwerte je Stromkreis', level: 'h2' },
          { id: 'elek-ec-021', type: 'info', label: '', content: 'Messwerte für jeden geprüften Stromkreis eintragen.' },
          { id: 'elek-ec-022', type: 'repeater', label: 'Messwerte Stromkreise', width: 'full', subFields: [
            { id: 'elek-ec-sf01', label: 'Stromkreis', type: 'text', placeholder: 'z.B. SK1 Küche' },
            { id: 'elek-ec-sf02', label: 'Iso.-Widerstand (MΩ)', type: 'number', placeholder: '' },
            { id: 'elek-ec-sf03', label: 'Schleifenimp. (Ω)', type: 'number', placeholder: '' },
            { id: 'elek-ec-sf04', label: 'RCD-Auslösezeit (ms)', type: 'number', placeholder: '' },
          ], validation: { maxRows: 20 } },
        ]
      },
      {
        id: 'elek-ec-p4', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'elek-ec-030', type: 'heading', label: 'Prüfergebnis', level: 'h2' },
          { id: 'elek-ec-031', type: 'radio', label: 'Gesamtergebnis', required: true, options: [
            { value: 'bestanden', label: 'Bestanden — Anlage entspricht den Normen' },
            { value: 'bedingt', label: 'Bedingt bestanden — Mängel festgestellt, Betrieb noch möglich' },
            { value: 'nicht-bestanden', label: 'Nicht bestanden — Sofortige Nachbesserung erforderlich' },
          ]},
          { id: 'elek-ec-032', type: 'textarea', label: 'Festgestellte Mängel / Bemerkungen', width: 'full', conditions: [{ field: 'elek-ec-031', operator: 'notEquals', value: 'bestanden', action: 'show' }] },
          { id: 'elek-ec-033', type: 'date', label: 'Nächster Prüftermin', width: 'half' },
          { id: 'elek-ec-034', type: 'divider' },
          { id: 'elek-ec-035', type: 'signature', label: 'Unterschrift Prüfer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#f59e0b' },
  },

  // 6. PV-Inbetriebnahmeprotokoll
  {
    id: 'tpl-elek-pv',
    name: 'PV-Inbetriebnahmeprotokoll',
    description: 'Inbetriebnahmeprotokoll für Photovoltaikanlagen',
    category: 'abnahme',
    icon: '☀️',
    version: 1,
    pages: [
      {
        id: 'elek-pv-p1', title: 'Anlagendaten', fields: [
          { id: 'elek-pv-001', type: 'heading', label: 'Anlagendaten', level: 'h2' },
          { id: 'elek-pv-002', type: 'date', label: 'Inbetriebnahmedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'elek-pv-003', type: 'text', label: 'Anlagenbetreiber', required: true, width: 'full' },
          { id: 'elek-pv-004', type: 'text', label: 'Standort / Adresse', required: true, width: 'full' },
          { id: 'elek-pv-005', type: 'number', label: 'Anlagenleistung (kWp)', required: true, width: 'half', validation: { min: 0, max: 9999, decimals: 2 } },
          { id: 'elek-pv-006', type: 'divider' },
          { id: 'elek-pv-007', type: 'heading', label: 'Module', level: 'h2' },
          { id: 'elek-pv-008', type: 'text', label: 'Modulhersteller', required: true, width: 'half' },
          { id: 'elek-pv-009', type: 'text', label: 'Modultyp', required: true, width: 'half' },
          { id: 'elek-pv-010', type: 'number', label: 'Anzahl Module', required: true, width: 'half', validation: { min: 1, max: 9999 } },
          { id: 'elek-pv-011', type: 'number', label: 'Leistung je Modul (Wp)', width: 'half', validation: { min: 0, max: 1000 } },
          { id: 'elek-pv-012', type: 'divider' },
          { id: 'elek-pv-013', type: 'heading', label: 'Wechselrichter', level: 'h2' },
          { id: 'elek-pv-014', type: 'text', label: 'WR-Hersteller', required: true, width: 'half' },
          { id: 'elek-pv-015', type: 'text', label: 'WR-Typ', required: true, width: 'half' },
          { id: 'elek-pv-016', type: 'text', label: 'WR-Seriennummer', width: 'half' },
          { id: 'elek-pv-017', type: 'number', label: 'WR-Leistung (kVA)', width: 'half', validation: { min: 0, max: 999, decimals: 1 } },
        ]
      },
      {
        id: 'elek-pv-p2', title: 'Messwerte', fields: [
          { id: 'elek-pv-020', type: 'heading', label: 'Elektrische Messwerte je String', level: 'h2' },
          { id: 'elek-pv-021', type: 'repeater', label: 'String-Messwerte', width: 'full', subFields: [
            { id: 'elek-pv-sf01', label: 'String-Nr.', type: 'text', placeholder: 'z.B. String 1' },
            { id: 'elek-pv-sf02', label: 'Leerlaufsp. Uoc (V)', type: 'number', placeholder: '' },
            { id: 'elek-pv-sf03', label: 'Kurzschlussstr. Isc (A)', type: 'number', placeholder: '' },
            { id: 'elek-pv-sf04', label: 'Iso.-Widerstand (MΩ)', type: 'number', placeholder: '' },
          ], validation: { maxRows: 10 } },
        ]
      },
      {
        id: 'elek-pv-p3', title: 'Prüfung', fields: [
          { id: 'elek-pv-030', type: 'heading', label: 'Installationsprüfung', level: 'h2' },
          { id: 'elek-pv-031', type: 'checklist', label: 'Prüfpunkte PV-Anlage', required: true, items: [
            { id: 'elek-pv-c01', label: 'Modulbefestigung fachgerecht' },
            { id: 'elek-pv-c02', label: 'Kabelverlegung ordnungsgemäß' },
            { id: 'elek-pv-c03', label: 'Erdung / Potentialausgleich hergestellt' },
            { id: 'elek-pv-c04', label: 'Blitzschutzanbindung geprüft' },
            { id: 'elek-pv-c05', label: 'Beschriftung vorhanden (DC-Seite, AC-Seite)' },
            { id: 'elek-pv-c06', label: 'DC-Freischalter funktionsfähig' },
            { id: 'elek-pv-c07', label: 'NA-Schutz parametriert' },
            { id: 'elek-pv-c08', label: 'Einspeisezähler montiert / konfiguriert' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'elek-pv-p4', title: 'Fotos & Abnahme', fields: [
          { id: 'elek-pv-040', type: 'heading', label: 'Fotodokumentation', level: 'h2' },
          { id: 'elek-pv-041', type: 'photo', label: 'Fotos Module / Dachansicht', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'elek-pv-042', type: 'photo', label: 'Fotos Wechselrichter', width: 'full', validation: { maxPhotos: 3 } },
          { id: 'elek-pv-043', type: 'photo', label: 'Fotos Zähler / Anschluss', width: 'full', validation: { maxPhotos: 3 } },
          { id: 'elek-pv-044', type: 'divider' },
          { id: 'elek-pv-045', type: 'heading', label: 'Abnahme', level: 'h2' },
          { id: 'elek-pv-046', type: 'toggle', label: 'Anlage abgenommen / in Betrieb genommen', required: true, labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'elek-pv-047', type: 'textarea', label: 'Bemerkungen', width: 'full' },
          { id: 'elek-pv-048', type: 'divider' },
          { id: 'elek-pv-049', type: 'signature', label: 'Unterschrift Errichter', required: true, width: 'full' },
          { id: 'elek-pv-050', type: 'signature', label: 'Unterschrift Anlagenbetreiber', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#f59e0b' },
  },

  // 7. DGUV V3 Prüfprotokoll
  {
    id: 'tpl-elek-dguv',
    name: 'Prüfprotokoll DGUV Vorschrift 3',
    description: 'Prüfung ortsveränderlicher elektrischer Betriebsmittel nach DGUV V3',
    category: 'pruefung',
    icon: '🔌',
    version: 1,
    pages: [
      {
        id: 'elek-dg-p1', title: 'Gerätedaten', fields: [
          { id: 'elek-dg-001', type: 'heading', label: 'Gerätedaten', level: 'h2' },
          { id: 'elek-dg-002', type: 'date', label: 'Prüfdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'elek-dg-003', type: 'text', label: 'Prüfer', required: true, width: 'half' },
          { id: 'elek-dg-004', type: 'text', label: 'Gerätebezeichnung', required: true, width: 'full', placeholder: 'z.B. Bohrmaschine Bosch GSB 18' },
          { id: 'elek-dg-005', type: 'text', label: 'Hersteller', required: true, width: 'half' },
          { id: 'elek-dg-006', type: 'text', label: 'Serien-Nr. / Inventar-Nr.', required: true, width: 'half' },
          { id: 'elek-dg-007', type: 'text', label: 'Standort / Abteilung', width: 'half' },
          { id: 'elek-dg-008', type: 'select', label: 'Schutzklasse', width: 'half', options: [
            { value: 'sk1', label: 'Schutzklasse I' },
            { value: 'sk2', label: 'Schutzklasse II' },
            { value: 'sk3', label: 'Schutzklasse III' },
          ]},
        ]
      },
      {
        id: 'elek-dg-p2', title: 'Sichtprüfung', fields: [
          { id: 'elek-dg-010', type: 'heading', label: 'Sichtprüfung', level: 'h2' },
          { id: 'elek-dg-011', type: 'checklist', label: 'Sichtprüfung', required: true, items: [
            { id: 'elek-dg-c01', label: 'Gehäuse unbeschädigt' },
            { id: 'elek-dg-c02', label: 'Anschlussleitung einwandfrei' },
            { id: 'elek-dg-c03', label: 'Stecker unbeschädigt' },
            { id: 'elek-dg-c04', label: 'Zugentlastung vorhanden und intakt' },
            { id: 'elek-dg-c05', label: 'Typenschild lesbar' },
            { id: 'elek-dg-c06', label: 'Schalter / Taster funktionsfähig' },
            { id: 'elek-dg-c07', label: 'Keine sichtbaren Schmorspuren' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'elek-dg-p3', title: 'Messungen', fields: [
          { id: 'elek-dg-020', type: 'heading', label: 'Messwerte', level: 'h2' },
          { id: 'elek-dg-021', type: 'number', label: 'Schutzleiterwiderstand (Ω)', width: 'half', validation: { min: 0, max: 10, decimals: 3 } },
          { id: 'elek-dg-022', type: 'number', label: 'Isolationswiderstand (MΩ)', width: 'half', validation: { min: 0, max: 999, decimals: 2 } },
          { id: 'elek-dg-023', type: 'number', label: 'Berührungsstrom (mA)', width: 'half', validation: { min: 0, max: 50, decimals: 2 } },
          { id: 'elek-dg-024', type: 'number', label: 'Schutzleiterstrom (mA)', width: 'half', validation: { min: 0, max: 50, decimals: 2 } },
          { id: 'elek-dg-025', type: 'text', label: 'Messgerät / Typ', width: 'full', placeholder: 'z.B. Fluke 6500-2' },
        ]
      },
      {
        id: 'elek-dg-p4', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'elek-dg-030', type: 'heading', label: 'Prüfergebnis', level: 'h2' },
          { id: 'elek-dg-031', type: 'radio', label: 'Ergebnis', required: true, options: [
            { value: 'bestanden', label: 'Bestanden' },
            { value: 'bedingt', label: 'Bedingt bestanden — Mängel beseitigen' },
            { value: 'nicht-bestanden', label: 'Nicht bestanden — Gerät gesperrt' },
          ]},
          { id: 'elek-dg-032', type: 'textarea', label: 'Festgestellte Mängel', width: 'full', conditions: [{ field: 'elek-dg-031', operator: 'notEquals', value: 'bestanden', action: 'show' }] },
          { id: 'elek-dg-033', type: 'date', label: 'Nächster Prüftermin', width: 'half' },
          { id: 'elek-dg-034', type: 'toggle', label: 'Prüfplakette angebracht', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'elek-dg-035', type: 'divider' },
          { id: 'elek-dg-036', type: 'signature', label: 'Unterschrift Prüfer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#8b5cf6' },
  },

  // 8. Elektro-Aufmaß
  {
    id: 'tpl-elek-aufmass',
    name: 'Elektro-Aufmaß',
    description: 'Aufmaßerfassung für Elektroinstallationen nach Räumen und Positionen',
    category: 'service',
    icon: '📐',
    version: 1,
    pages: [
      {
        id: 'elek-am-p1', title: 'Projektdaten', fields: [
          { id: 'elek-am-001', type: 'heading', label: 'Projektdaten', level: 'h2' },
          { id: 'elek-am-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'elek-am-003', type: 'text', label: 'Bauvorhaben / Projekt', required: true, width: 'full' },
          { id: 'elek-am-004', type: 'text', label: 'Auftraggeber', required: true, width: 'half' },
          { id: 'elek-am-005', type: 'text', label: 'Aufgenommen durch', required: true, width: 'half' },
        ]
      },
      {
        id: 'elek-am-p2', title: 'Aufmaßpositionen', fields: [
          { id: 'elek-am-010', type: 'heading', label: 'Positionen', level: 'h2' },
          { id: 'elek-am-011', type: 'text', label: 'Raum / Bereich', required: true, width: 'full', placeholder: 'z.B. Büro EG links' },
          { id: 'elek-am-012', type: 'repeater', label: 'Aufmaßpositionen', width: 'full', subFields: [
            { id: 'elek-am-sf01', label: 'Pos.-Nr.', type: 'text', placeholder: '1.1' },
            { id: 'elek-am-sf02', label: 'Beschreibung', type: 'text', placeholder: 'z.B. Steckdose 3-fach' },
            { id: 'elek-am-sf03', label: 'Menge', type: 'number', placeholder: '' },
            { id: 'elek-am-sf04', label: 'Einheit', type: 'text', placeholder: 'Stk./m/Pausch.' },
          ], validation: { maxRows: 30 } },
          { id: 'elek-am-013', type: 'photo', label: 'Fotos zum Bereich', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'elek-am-014', type: 'textarea', label: 'Bemerkungen', width: 'full' },
        ]
      },
      {
        id: 'elek-am-p3', title: 'Unterschrift', fields: [
          { id: 'elek-am-020', type: 'divider' },
          { id: 'elek-am-021', type: 'signature', label: 'Unterschrift Aufnehmender', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#0ea5e9' },
  },

  // ═══════════════════════════════════════════
  // Facility Management — 4 Templates
  // ═══════════════════════════════════════════

  // 9. Gebäudeinspektion / Rundgang
  {
    id: 'tpl-fm-inspektion',
    name: 'Gebäudeinspektion / Rundgang',
    description: 'Systematische Gebäudebegehung mit Bereichsbewertung und Mängelerfassung',
    category: 'pruefung',
    icon: '🏢',
    version: 1,
    pages: [
      {
        id: 'fm-in-p1', title: 'Objektdaten', fields: [
          { id: 'fm-in-001', type: 'heading', label: 'Inspektionsdaten', level: 'h2' },
          { id: 'fm-in-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'fm-in-003', type: 'text', label: 'Prüfer / Facility Manager', required: true, width: 'half' },
          { id: 'fm-in-004', type: 'text', label: 'Objekt / Gebäude', required: true, width: 'full', placeholder: 'Bezeichnung und Adresse' },
        ]
      },
      {
        id: 'fm-in-p2', title: 'Bereichsprüfung', fields: [
          { id: 'fm-in-010', type: 'heading', label: 'Bereichsprüfung', level: 'h2' },
          { id: 'fm-in-011', type: 'info', label: '', content: 'Jeden Bereich einzeln bewerten. Bei Mängeln Foto und Bemerkung hinzufügen.' },
          { id: 'fm-in-012', type: 'repeater', label: 'Bereiche', width: 'full', subFields: [
            { id: 'fm-in-sf01', label: 'Bereich / Raum', type: 'text', placeholder: 'z.B. Eingangsbereich' },
            { id: 'fm-in-sf02', label: 'Zustand (1-5)', type: 'number', placeholder: '1=schlecht, 5=sehr gut' },
            { id: 'fm-in-sf03', label: 'Bemerkung', type: 'text', placeholder: 'Mängel / Auffälligkeiten' },
          ], validation: { maxRows: 20 } },
          { id: 'fm-in-013', type: 'divider' },
          { id: 'fm-in-014', type: 'checklist', label: 'Allgemeine Prüfpunkte', required: true, items: [
            { id: 'fm-in-c01', label: 'Sauberkeit allgemein in Ordnung' },
            { id: 'fm-in-c02', label: 'Beleuchtung funktionsfähig' },
            { id: 'fm-in-c03', label: 'Fenster und Türen schließen ordnungsgemäß' },
            { id: 'fm-in-c04', label: 'Bodenbeläge intakt' },
            { id: 'fm-in-c05', label: 'Brandschutzeinrichtungen vorhanden' },
            { id: 'fm-in-c06', label: 'Fluchtwege frei und gekennzeichnet' },
            { id: 'fm-in-c07', label: 'Beschilderung vollständig' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'fm-in-p3', title: 'Mängel & Bewertung', fields: [
          { id: 'fm-in-020', type: 'heading', label: 'Mängelfotos', level: 'h2' },
          { id: 'fm-in-021', type: 'photo', label: 'Fotos festgestellter Mängel', width: 'full', validation: { maxPhotos: 10 } },
          { id: 'fm-in-022', type: 'rating', label: 'Dringlichkeit der Maßnahmen', required: true, maxStars: 5, ratingType: 'stars' },
          { id: 'fm-in-023', type: 'textarea', label: 'Gesamtbewertung / Empfehlung', width: 'full', placeholder: 'Zusammenfassung und empfohlene Maßnahmen...' },
          { id: 'fm-in-024', type: 'divider' },
          { id: 'fm-in-025', type: 'signature', label: 'Unterschrift Prüfer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#059669' },
  },

  // 10. Schlüsselübergabeprotokoll
  {
    id: 'tpl-fm-schluessel',
    name: 'Schlüsselübergabeprotokoll',
    description: 'Protokoll zur Übergabe von Schlüsseln inkl. Zählerständen',
    category: 'uebergabe',
    icon: '🔑',
    version: 1,
    pages: [
      {
        id: 'fm-sl-p1', title: 'Parteien & Objekt', fields: [
          { id: 'fm-sl-001', type: 'heading', label: 'Übergabedaten', level: 'h2' },
          { id: 'fm-sl-002', type: 'date', label: 'Übergabedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'fm-sl-003', type: 'text', label: 'Objekt / Einheit', required: true, width: 'full', placeholder: 'z.B. Musterstr. 1, Whg. 3 OG links' },
          { id: 'fm-sl-004', type: 'divider' },
          { id: 'fm-sl-005', type: 'text', label: 'Übergeber (Name)', required: true, width: 'half' },
          { id: 'fm-sl-006', type: 'text', label: 'Übergeber (Firma / Funktion)', width: 'half' },
          { id: 'fm-sl-007', type: 'text', label: 'Übernehmer (Name)', required: true, width: 'half' },
          { id: 'fm-sl-008', type: 'text', label: 'Übernehmer (Firma / Funktion)', width: 'half' },
        ]
      },
      {
        id: 'fm-sl-p2', title: 'Schlüssel', fields: [
          { id: 'fm-sl-010', type: 'heading', label: 'Übergebene Schlüssel', level: 'h2' },
          { id: 'fm-sl-011', type: 'repeater', label: 'Schlüssel', width: 'full', subFields: [
            { id: 'fm-sl-sf01', label: 'Schlüssel-Nr.', type: 'text', placeholder: 'z.B. S-001' },
            { id: 'fm-sl-sf02', label: 'Art', type: 'text', placeholder: 'Haustür/Whg./Keller/Briefkasten' },
            { id: 'fm-sl-sf03', label: 'Anzahl', type: 'number', placeholder: '' },
          ], validation: { maxRows: 15 } },
        ]
      },
      {
        id: 'fm-sl-p3', title: 'Zählerstände', fields: [
          { id: 'fm-sl-020', type: 'heading', label: 'Zählerstände bei Übergabe', level: 'h2' },
          { id: 'fm-sl-021', type: 'repeater', label: 'Zählerstände', width: 'full', subFields: [
            { id: 'fm-sl-sf04', label: 'Zähler-Art', type: 'text', placeholder: 'Strom/Gas/Wasser/Heizung' },
            { id: 'fm-sl-sf05', label: 'Zählerstand', type: 'number', placeholder: '' },
            { id: 'fm-sl-sf06', label: 'Zähler-Nr.', type: 'text', placeholder: '' },
          ], validation: { maxRows: 10 } },
          { id: 'fm-sl-022', type: 'photo', label: 'Fotos der Zählerstände', width: 'full', validation: { maxPhotos: 5 } },
        ]
      },
      {
        id: 'fm-sl-p4', title: 'Bemerkungen & Unterschrift', fields: [
          { id: 'fm-sl-030', type: 'heading', label: 'Bemerkungen', level: 'h2' },
          { id: 'fm-sl-031', type: 'textarea', label: 'Bemerkungen zum Zustand', width: 'full', placeholder: 'Zustand der Wohnung / des Objekts bei Übergabe...' },
          { id: 'fm-sl-032', type: 'divider' },
          { id: 'fm-sl-033', type: 'signature', label: 'Unterschrift Übergeber', required: true, width: 'full' },
          { id: 'fm-sl-034', type: 'signature', label: 'Unterschrift Übernehmer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#6366f1' },
  },

  // 11. Brandschutzbegehung
  {
    id: 'tpl-fm-brandschutz',
    name: 'Brandschutzbegehung',
    description: 'Protokoll zur brandschutztechnischen Begehung mit Mängelerfassung',
    category: 'pruefung',
    icon: '🔥',
    version: 1,
    pages: [
      {
        id: 'fm-bs-p1', title: 'Begehungsdaten', fields: [
          { id: 'fm-bs-001', type: 'heading', label: 'Brandschutzbegehung', level: 'h2' },
          { id: 'fm-bs-002', type: 'date', label: 'Begehungsdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'fm-bs-003', type: 'text', label: 'Objekt / Gebäude', required: true, width: 'full' },
          { id: 'fm-bs-004', type: 'text', label: 'Brandschutzbeauftragter', required: true, width: 'half' },
          { id: 'fm-bs-005', type: 'text', label: 'Teilnehmer', width: 'full', placeholder: 'Namen der Teilnehmer' },
        ]
      },
      {
        id: 'fm-bs-p2', title: 'Prüfpunkte', fields: [
          { id: 'fm-bs-010', type: 'heading', label: 'Brandschutztechnische Prüfpunkte', level: 'h2' },
          { id: 'fm-bs-011', type: 'checklist', label: 'Brandschutzprüfung', required: true, items: [
            { id: 'fm-bs-c01', label: 'Feuerlöscher vorhanden und geprüft' },
            { id: 'fm-bs-c02', label: 'Fluchtwegebeschilderung vollständig' },
            { id: 'fm-bs-c03', label: 'Brandschutztüren schließen selbsttätig' },
            { id: 'fm-bs-c04', label: 'Rauchmelder funktionsfähig' },
            { id: 'fm-bs-c05', label: 'Löschdecken vorhanden' },
            { id: 'fm-bs-c06', label: 'Brandschutzklappen geprüft' },
            { id: 'fm-bs-c07', label: 'Sprinkleranlage funktionsfähig (falls vorhanden)' },
            { id: 'fm-bs-c08', label: 'Fluchtwege frei und nicht zugestellt' },
            { id: 'fm-bs-c09', label: 'Brandschutzordnung aushängend' },
            { id: 'fm-bs-c10', label: 'Sammelplatz gekennzeichnet' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'fm-bs-p3', title: 'Mängel', fields: [
          { id: 'fm-bs-020', type: 'heading', label: 'Festgestellte Mängel', level: 'h2' },
          { id: 'fm-bs-021', type: 'toggle', label: 'Mängel festgestellt', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'fm-bs-022', type: 'repeater', label: 'Mängelliste', width: 'full', subFields: [
            { id: 'fm-bs-sf01', label: 'Bereich', type: 'text', placeholder: 'z.B. 2. OG Flur' },
            { id: 'fm-bs-sf02', label: 'Mangel', type: 'text', placeholder: 'Beschreibung' },
            { id: 'fm-bs-sf03', label: 'Priorität', type: 'text', placeholder: 'Sofort/Kurzfr./Mittelfr.' },
          ], validation: { maxRows: 15 }, conditions: [{ field: 'fm-bs-021', operator: 'equals', value: true, action: 'show' }] },
          { id: 'fm-bs-023', type: 'photo', label: 'Mängelfotos', width: 'full', validation: { maxPhotos: 10 }, conditions: [{ field: 'fm-bs-021', operator: 'equals', value: true, action: 'show' }] },
          { id: 'fm-bs-024', type: 'date', label: 'Frist zur Mängelbeseitigung', width: 'half', conditions: [{ field: 'fm-bs-021', operator: 'equals', value: true, action: 'show' }] },
        ]
      },
      {
        id: 'fm-bs-p4', title: 'Unterschrift', fields: [
          { id: 'fm-bs-030', type: 'textarea', label: 'Zusammenfassung / Empfehlungen', width: 'full' },
          { id: 'fm-bs-031', type: 'divider' },
          { id: 'fm-bs-032', type: 'signature', label: 'Unterschrift Brandschutzbeauftragter', required: true, width: 'full' },
          { id: 'fm-bs-033', type: 'signature', label: 'Unterschrift Objektverantwortlicher', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#dc2626' },
  },

  // 12. Wartungsprotokoll Aufzug/Technik
  {
    id: 'tpl-fm-wartung',
    name: 'Wartungsprotokoll Technik',
    description: 'Allgemeines Wartungsprotokoll für technische Anlagen (Aufzug, Lüftung, etc.)',
    category: 'pruefung',
    icon: '🔧',
    version: 1,
    pages: [
      {
        id: 'fm-wt-p1', title: 'Anlagendaten', fields: [
          { id: 'fm-wt-001', type: 'heading', label: 'Anlagendaten', level: 'h2' },
          { id: 'fm-wt-002', type: 'date', label: 'Wartungsdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'fm-wt-003', type: 'text', label: 'Techniker / Wartungsfirma', required: true, width: 'half' },
          { id: 'fm-wt-004', type: 'select', label: 'Anlagentyp', required: true, width: 'half', options: [
            { value: 'aufzug', label: 'Aufzug' },
            { value: 'lueftung', label: 'Lüftungsanlage / RLT' },
            { value: 'heizung', label: 'Heizungsanlage' },
            { value: 'klima', label: 'Klimaanlage' },
            { value: 'brandmelde', label: 'Brandmeldeanlage' },
            { value: 'notstrom', label: 'Notstromanlage' },
            { value: 'sonstige', label: 'Sonstige' },
          ]},
          { id: 'fm-wt-005', type: 'text', label: 'Hersteller', width: 'half' },
          { id: 'fm-wt-006', type: 'number', label: 'Baujahr', width: 'half', validation: { min: 1950, max: 2030 } },
          { id: 'fm-wt-007', type: 'text', label: 'Standort (Gebäude / Raum)', required: true, width: 'full' },
          { id: 'fm-wt-008', type: 'text', label: 'Fabrik-Nr. / Inventar-Nr.', width: 'half' },
        ]
      },
      {
        id: 'fm-wt-p2', title: 'Wartungspunkte', fields: [
          { id: 'fm-wt-010', type: 'heading', label: 'Wartungsprüfung', level: 'h2' },
          { id: 'fm-wt-011', type: 'checklist', label: 'Wartungspunkte', required: true, items: [
            { id: 'fm-wt-c01', label: 'Sichtprüfung durchgeführt' },
            { id: 'fm-wt-c02', label: 'Funktionsprüfung durchgeführt' },
            { id: 'fm-wt-c03', label: 'Sicherheitseinrichtungen geprüft' },
            { id: 'fm-wt-c04', label: 'Verschleißteile geprüft / getauscht' },
            { id: 'fm-wt-c05', label: 'Schmierung / Ölstand kontrolliert' },
            { id: 'fm-wt-c06', label: 'Filter gereinigt / gewechselt' },
            { id: 'fm-wt-c07', label: 'Steuerung / Regelung geprüft' },
            { id: 'fm-wt-c08', label: 'Elektrische Anschlüsse geprüft' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'fm-wt-p3', title: 'Messwerte & Material', fields: [
          { id: 'fm-wt-020', type: 'heading', label: 'Messwerte', level: 'h2' },
          { id: 'fm-wt-021', type: 'repeater', label: 'Messwerte', width: 'full', subFields: [
            { id: 'fm-wt-sf01', label: 'Messpunkt', type: 'text', placeholder: 'z.B. Temperatur Vorlauf' },
            { id: 'fm-wt-sf02', label: 'Wert', type: 'number', placeholder: '' },
            { id: 'fm-wt-sf03', label: 'Einheit', type: 'text', placeholder: '°C / bar / V' },
            { id: 'fm-wt-sf04', label: 'Soll-Bereich', type: 'text', placeholder: 'z.B. 50-70°C' },
          ], validation: { maxRows: 15 } },
          { id: 'fm-wt-022', type: 'divider' },
          { id: 'fm-wt-023', type: 'heading', label: 'Materialverbrauch', level: 'h2' },
          { id: 'fm-wt-024', type: 'repeater', label: 'Eingesetztes Material', width: 'full', subFields: [
            { id: 'fm-wt-sf05', label: 'Material / Ersatzteil', type: 'text', placeholder: '' },
            { id: 'fm-wt-sf06', label: 'Menge', type: 'number', placeholder: '' },
            { id: 'fm-wt-sf07', label: 'Artikel-Nr.', type: 'text', placeholder: '' },
          ], validation: { maxRows: 10 } },
        ]
      },
      {
        id: 'fm-wt-p4', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'fm-wt-030', type: 'heading', label: 'Ergebnis', level: 'h2' },
          { id: 'fm-wt-031', type: 'date', label: 'Nächster Wartungstermin', width: 'half' },
          { id: 'fm-wt-032', type: 'textarea', label: 'Bemerkungen / Empfehlungen', width: 'full' },
          { id: 'fm-wt-033', type: 'divider' },
          { id: 'fm-wt-034', type: 'signature', label: 'Unterschrift Techniker', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#059669' },
  },

  // ═══════════════════════════════════════════
  // Maler/Trockenbau — 2 Templates
  // ═══════════════════════════════════════════

  // 13. Baustellenabnahme Malerarbeiten
  {
    id: 'tpl-maler-abnahme',
    name: 'Baustellenabnahme Malerarbeiten',
    description: 'Abnahmeprotokoll für Maler- und Lackierarbeiten mit Raumbewertung',
    category: 'abnahme',
    icon: '🎨',
    version: 1,
    pages: [
      {
        id: 'maler-ab-p1', title: 'Projektdaten', fields: [
          { id: 'maler-ab-001', type: 'heading', label: 'Projektdaten', level: 'h2' },
          { id: 'maler-ab-002', type: 'date', label: 'Abnahmedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'maler-ab-003', type: 'text', label: 'Objekt / Baustelle', required: true, width: 'full' },
          { id: 'maler-ab-004', type: 'text', label: 'Auftraggeber', required: true, width: 'half' },
          { id: 'maler-ab-005', type: 'text', label: 'Auftragnehmer', required: true, width: 'half' },
        ]
      },
      {
        id: 'maler-ab-p2', title: 'Räume / Bereiche', fields: [
          { id: 'maler-ab-010', type: 'heading', label: 'Leistungsbewertung je Raum', level: 'h2' },
          { id: 'maler-ab-011', type: 'repeater', label: 'Räume / Bereiche', width: 'full', subFields: [
            { id: 'maler-ab-sf01', label: 'Raum / Bereich', type: 'text', placeholder: 'z.B. Wohnzimmer' },
            { id: 'maler-ab-sf02', label: 'Arbeit', type: 'text', placeholder: 'Anstrich/Tapete/Putz/Lack' },
            { id: 'maler-ab-sf03', label: 'Bewertung (1-5)', type: 'number', placeholder: '1=mangelhaft, 5=sehr gut' },
          ], validation: { maxRows: 20 } },
        ]
      },
      {
        id: 'maler-ab-p3', title: 'Mängel', fields: [
          { id: 'maler-ab-020', type: 'heading', label: 'Mängelliste', level: 'h2' },
          { id: 'maler-ab-021', type: 'toggle', label: 'Mängel vorhanden', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'maler-ab-022', type: 'repeater', label: 'Mängel', width: 'full', subFields: [
            { id: 'maler-ab-sf04', label: 'Raum', type: 'text', placeholder: '' },
            { id: 'maler-ab-sf05', label: 'Mangel-Beschreibung', type: 'text', placeholder: '' },
            { id: 'maler-ab-sf06', label: 'Frist', type: 'text', placeholder: 'z.B. 14 Tage' },
          ], validation: { maxRows: 15 }, conditions: [{ field: 'maler-ab-021', operator: 'equals', value: true, action: 'show' }] },
          { id: 'maler-ab-023', type: 'photo', label: 'Mängelfotos', width: 'full', validation: { maxPhotos: 10 }, conditions: [{ field: 'maler-ab-021', operator: 'equals', value: true, action: 'show' }] },
        ]
      },
      {
        id: 'maler-ab-p4', title: 'Ergebnis & Unterschrift', fields: [
          { id: 'maler-ab-030', type: 'heading', label: 'Gesamtergebnis', level: 'h2' },
          { id: 'maler-ab-031', type: 'radio', label: 'Abnahmeergebnis', required: true, options: [
            { value: 'ohne-maengel', label: 'Abnahme ohne Mängel' },
            { value: 'mit-maengel', label: 'Abnahme mit Mängeln (Nachbesserung vereinbart)' },
            { value: 'verweigert', label: 'Abnahme verweigert' },
          ]},
          { id: 'maler-ab-032', type: 'textarea', label: 'Bemerkungen', width: 'full' },
          { id: 'maler-ab-033', type: 'divider' },
          { id: 'maler-ab-034', type: 'signature', label: 'Unterschrift Auftraggeber', required: true, width: 'full' },
          { id: 'maler-ab-035', type: 'signature', label: 'Unterschrift Auftragnehmer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#a855f7' },
  },

  // 14. Aufmaßblatt (Maler)
  {
    id: 'tpl-maler-aufmass',
    name: 'Aufmaßblatt Malerarbeiten',
    description: 'Flächenaufmaß für Maler- und Trockenbauarbeiten mit Raumerfassung',
    category: 'service',
    icon: '📐',
    version: 1,
    pages: [
      {
        id: 'maler-am-p1', title: 'Projektdaten', fields: [
          { id: 'maler-am-001', type: 'heading', label: 'Aufmaßdaten', level: 'h2' },
          { id: 'maler-am-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'maler-am-003', type: 'text', label: 'Bauvorhaben', required: true, width: 'full' },
          { id: 'maler-am-004', type: 'text', label: 'Auftraggeber', required: true, width: 'half' },
          { id: 'maler-am-005', type: 'text', label: 'Aufgenommen durch', required: true, width: 'half' },
          { id: 'maler-am-006', type: 'text', label: 'Raum / Bereich', required: true, width: 'full', placeholder: 'z.B. Wohnzimmer EG' },
        ]
      },
      {
        id: 'maler-am-p2', title: 'Positionen', fields: [
          { id: 'maler-am-010', type: 'heading', label: 'Aufmaßpositionen', level: 'h2' },
          { id: 'maler-am-011', type: 'repeater', label: 'Positionen', width: 'full', subFields: [
            { id: 'maler-am-sf01', label: 'Position / Leistung', type: 'text', placeholder: 'z.B. Wandfläche streichen' },
            { id: 'maler-am-sf02', label: 'Länge (m)', type: 'number', placeholder: '' },
            { id: 'maler-am-sf03', label: 'Breite/Höhe (m)', type: 'number', placeholder: '' },
            { id: 'maler-am-sf04', label: 'Fläche (m²)', type: 'number', placeholder: '' },
            { id: 'maler-am-sf05', label: 'Abzüge (m²)', type: 'number', placeholder: '' },
          ], validation: { maxRows: 25 } },
          { id: 'maler-am-012', type: 'info', label: '', content: 'Hinweis: Fläche = Länge × Höhe. Fenster/Türen als Abzüge eintragen.' },
        ]
      },
      {
        id: 'maler-am-p3', title: 'Fotos & Unterschrift', fields: [
          { id: 'maler-am-020', type: 'heading', label: 'Dokumentation', level: 'h2' },
          { id: 'maler-am-021', type: 'photo', label: 'Skizze / Fotos', width: 'full', validation: { maxPhotos: 5 } },
          { id: 'maler-am-022', type: 'textarea', label: 'Bemerkungen', width: 'full' },
          { id: 'maler-am-023', type: 'divider' },
          { id: 'maler-am-024', type: 'signature', label: 'Unterschrift Aufnehmender', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#a855f7' },
  },

  // ═══════════════════════════════════════════
  // Allgemein/Übergreifend — 6 Templates
  // ═══════════════════════════════════════════

  // 15. Arbeitsschein / Stundennachweis
  {
    id: 'tpl-allg-arbeitsschein',
    name: 'Arbeitsschein / Stundennachweis',
    description: 'Arbeitszeiterfassung mit Material- und Fahrkostennachweis',
    category: 'service',
    icon: '📋',
    version: 1,
    pages: [
      {
        id: 'allg-as-p1', title: 'Auftragsdaten', fields: [
          { id: 'allg-as-001', type: 'heading', label: 'Auftragsdaten', level: 'h2' },
          { id: 'allg-as-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-as-003', type: 'text', label: 'Mitarbeiter', required: true, width: 'half' },
          { id: 'allg-as-004', type: 'text', label: 'Projekt / Kunde', required: true, width: 'full' },
          { id: 'allg-as-005', type: 'text', label: 'Auftragsnummer', width: 'half' },
        ]
      },
      {
        id: 'allg-as-p2', title: 'Arbeitszeiten', fields: [
          { id: 'allg-as-010', type: 'heading', label: 'Arbeitszeiterfassung', level: 'h2' },
          { id: 'allg-as-011', type: 'repeater', label: 'Arbeitszeiten', width: 'full', subFields: [
            { id: 'allg-as-sf01', label: 'Datum', type: 'text', placeholder: 'TT.MM.JJJJ' },
            { id: 'allg-as-sf02', label: 'Von', type: 'text', placeholder: 'HH:MM' },
            { id: 'allg-as-sf03', label: 'Bis', type: 'text', placeholder: 'HH:MM' },
            { id: 'allg-as-sf04', label: 'Pause (min)', type: 'number', placeholder: '' },
            { id: 'allg-as-sf05', label: 'Tätigkeit', type: 'text', placeholder: '' },
          ], validation: { maxRows: 14 } },
        ]
      },
      {
        id: 'allg-as-p3', title: 'Material & Fahrt', fields: [
          { id: 'allg-as-020', type: 'heading', label: 'Materialverbrauch', level: 'h2' },
          { id: 'allg-as-021', type: 'repeater', label: 'Material', width: 'full', subFields: [
            { id: 'allg-as-sf06', label: 'Material', type: 'text', placeholder: '' },
            { id: 'allg-as-sf07', label: 'Menge', type: 'number', placeholder: '' },
            { id: 'allg-as-sf08', label: 'Einheit', type: 'text', placeholder: 'Stk./m/kg' },
          ], validation: { maxRows: 10 } },
          { id: 'allg-as-022', type: 'divider' },
          { id: 'allg-as-023', type: 'heading', label: 'Fahrtkosten', level: 'h2' },
          { id: 'allg-as-024', type: 'number', label: 'Gefahrene Kilometer', width: 'half', validation: { min: 0, max: 9999 } },
          { id: 'allg-as-025', type: 'textarea', label: 'Bemerkungen', width: 'full' },
        ]
      },
      {
        id: 'allg-as-p4', title: 'Unterschrift', fields: [
          { id: 'allg-as-030', type: 'divider' },
          { id: 'allg-as-031', type: 'signature', label: 'Unterschrift Mitarbeiter', required: true, width: 'full' },
          { id: 'allg-as-032', type: 'signature', label: 'Unterschrift Auftraggeber', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#2563eb' },
  },

  // 16. Gefährdungsbeurteilung
  {
    id: 'tpl-allg-gefaehrdung',
    name: 'Gefährdungsbeurteilung',
    description: 'Gefährdungsbeurteilung nach ArbSchG mit Risikoeinschätzung und Schutzmaßnahmen',
    category: 'pruefung',
    icon: '⚠️',
    version: 1,
    pages: [
      {
        id: 'allg-gb-p1', title: 'Allgemeine Daten', fields: [
          { id: 'allg-gb-001', type: 'heading', label: 'Gefährdungsbeurteilung', level: 'h2' },
          { id: 'allg-gb-002', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-gb-003', type: 'text', label: 'Ersteller', required: true, width: 'half' },
          { id: 'allg-gb-004', type: 'text', label: 'Arbeitsbereich / Baustelle', required: true, width: 'full' },
          { id: 'allg-gb-005', type: 'text', label: 'Tätigkeit', required: true, width: 'full', placeholder: 'z.B. Dacharbeiten, Elektroinstallation' },
        ]
      },
      {
        id: 'allg-gb-p2', title: 'Gefährdungen', fields: [
          { id: 'allg-gb-010', type: 'heading', label: 'Identifizierte Gefährdungen', level: 'h2' },
          { id: 'allg-gb-011', type: 'repeater', label: 'Gefährdungen und Maßnahmen', width: 'full', subFields: [
            { id: 'allg-gb-sf01', label: 'Gefährdung', type: 'text', placeholder: 'z.B. Absturzgefahr' },
            { id: 'allg-gb-sf02', label: 'Risiko', type: 'text', placeholder: 'Gering/Mittel/Hoch/Sehr hoch' },
            { id: 'allg-gb-sf03', label: 'Maßnahme', type: 'text', placeholder: 'z.B. Gerüst aufstellen' },
            { id: 'allg-gb-sf04', label: 'Verantwortlich', type: 'text', placeholder: '' },
            { id: 'allg-gb-sf05', label: 'Frist', type: 'text', placeholder: 'TT.MM.JJJJ' },
          ], validation: { maxRows: 15 } },
        ]
      },
      {
        id: 'allg-gb-p3', title: 'Schutzausrüstung', fields: [
          { id: 'allg-gb-020', type: 'heading', label: 'Persönliche Schutzausrüstung (PSA)', level: 'h2' },
          { id: 'allg-gb-021', type: 'checklist', label: 'Erforderliche PSA', required: true, items: [
            { id: 'allg-gb-c01', label: 'Schutzhelm' },
            { id: 'allg-gb-c02', label: 'Schutzhandschuhe' },
            { id: 'allg-gb-c03', label: 'Schutzbrille' },
            { id: 'allg-gb-c04', label: 'Gehörschutz' },
            { id: 'allg-gb-c05', label: 'Sicherheitsschuhe S3' },
            { id: 'allg-gb-c06', label: 'Auffanggurt / PSAgA' },
            { id: 'allg-gb-c07', label: 'Atemschutz' },
            { id: 'allg-gb-c08', label: 'Warnweste' },
          ], allowNotes: true },
          { id: 'allg-gb-022', type: 'divider' },
          { id: 'allg-gb-023', type: 'toggle', label: 'Unterweisung der Mitarbeiter erfolgt', required: true, labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'allg-gb-024', type: 'date', label: 'Datum der Unterweisung', width: 'half', conditions: [{ field: 'allg-gb-023', operator: 'equals', value: true, action: 'show' }] },
        ]
      },
      {
        id: 'allg-gb-p4', title: 'Unterschrift', fields: [
          { id: 'allg-gb-030', type: 'textarea', label: 'Weitere Hinweise', width: 'full' },
          { id: 'allg-gb-031', type: 'divider' },
          { id: 'allg-gb-032', type: 'signature', label: 'Unterschrift Ersteller', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#ea580c' },
  },

  // 17. Bautagebuch
  {
    id: 'tpl-allg-bautagebuch',
    name: 'Bautagebuch',
    description: 'Tägliches Bautagebuch mit Wetter, Personal, Arbeiten und Lieferungen',
    category: 'custom',
    icon: '📊',
    version: 1,
    pages: [
      {
        id: 'allg-bt-p1', title: 'Tagesdaten', fields: [
          { id: 'allg-bt-001', type: 'heading', label: 'Bautagebuch', level: 'h2' },
          { id: 'allg-bt-002', type: 'text', label: 'Projekt / Baustelle', required: true, width: 'full' },
          { id: 'allg-bt-003', type: 'date', label: 'Datum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-bt-004', type: 'select', label: 'Wetter', required: true, width: 'half', options: [
            { value: 'sonnig', label: 'Sonnig' },
            { value: 'bewoelkt', label: 'Bewölkt' },
            { value: 'regen', label: 'Regen' },
            { value: 'schnee', label: 'Schnee' },
            { value: 'frost', label: 'Frost' },
          ]},
          { id: 'allg-bt-005', type: 'number', label: 'Temperatur (°C)', width: 'half', validation: { min: -30, max: 50 } },
          { id: 'allg-bt-006', type: 'text', label: 'Bauleiter', required: true, width: 'half' },
        ]
      },
      {
        id: 'allg-bt-p2', title: 'Personal & Arbeiten', fields: [
          { id: 'allg-bt-010', type: 'heading', label: 'Anwesende Firmen / Personal', level: 'h2' },
          { id: 'allg-bt-011', type: 'repeater', label: 'Anwesende', width: 'full', subFields: [
            { id: 'allg-bt-sf01', label: 'Firma / Gewerk', type: 'text', placeholder: '' },
            { id: 'allg-bt-sf02', label: 'Personenzahl', type: 'number', placeholder: '' },
            { id: 'allg-bt-sf03', label: 'Tätigkeit', type: 'text', placeholder: '' },
          ], validation: { maxRows: 15 } },
          { id: 'allg-bt-012', type: 'divider' },
          { id: 'allg-bt-013', type: 'heading', label: 'Durchgeführte Arbeiten', level: 'h2' },
          { id: 'allg-bt-014', type: 'textarea', label: 'Durchgeführte Arbeiten', required: true, width: 'full', placeholder: 'Beschreibung der heutigen Arbeiten...' },
          { id: 'allg-bt-015', type: 'textarea', label: 'Besondere Vorkommnisse', width: 'full', placeholder: 'Unfälle, Störungen, Verzögerungen...' },
        ]
      },
      {
        id: 'allg-bt-p3', title: 'Lieferungen & Fotos', fields: [
          { id: 'allg-bt-020', type: 'heading', label: 'Materiallieferungen', level: 'h2' },
          { id: 'allg-bt-021', type: 'repeater', label: 'Lieferungen', width: 'full', subFields: [
            { id: 'allg-bt-sf04', label: 'Material', type: 'text', placeholder: '' },
            { id: 'allg-bt-sf05', label: 'Menge', type: 'number', placeholder: '' },
            { id: 'allg-bt-sf06', label: 'Lieferant', type: 'text', placeholder: '' },
          ], validation: { maxRows: 10 } },
          { id: 'allg-bt-022', type: 'divider' },
          { id: 'allg-bt-023', type: 'photo', label: 'Fotos Baufortschritt', width: 'full', validation: { maxPhotos: 10 } },
        ]
      },
      {
        id: 'allg-bt-p4', title: 'Unterschrift', fields: [
          { id: 'allg-bt-030', type: 'textarea', label: 'Hinweise für den nächsten Tag', width: 'full' },
          { id: 'allg-bt-031', type: 'divider' },
          { id: 'allg-bt-032', type: 'signature', label: 'Unterschrift Bauleiter', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#78716c' },
  },

  // 18. Übergabeprotokoll allgemein
  {
    id: 'tpl-allg-uebergabe',
    name: 'Übergabeprotokoll',
    description: 'Allgemeines Übergabeprotokoll für Objekte, Geräte oder Anlagen',
    category: 'uebergabe',
    icon: '📦',
    version: 1,
    pages: [
      {
        id: 'allg-ue-p1', title: 'Übergabedaten', fields: [
          { id: 'allg-ue-001', type: 'heading', label: 'Übergabeprotokoll', level: 'h2' },
          { id: 'allg-ue-002', type: 'date', label: 'Übergabedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-ue-003', type: 'text', label: 'Übergeber', required: true, width: 'half' },
          { id: 'allg-ue-004', type: 'text', label: 'Übernehmer', required: true, width: 'half' },
          { id: 'allg-ue-005', type: 'text', label: 'Objekt / Gegenstand', required: true, width: 'full', placeholder: 'Was wird übergeben?' },
        ]
      },
      {
        id: 'allg-ue-p2', title: 'Zustand', fields: [
          { id: 'allg-ue-010', type: 'heading', label: 'Zustandsbeschreibung', level: 'h2' },
          { id: 'allg-ue-011', type: 'textarea', label: 'Zustandsbeschreibung', required: true, width: 'full', placeholder: 'Allgemeiner Zustand bei Übergabe...' },
          { id: 'allg-ue-012', type: 'checklist', label: 'Zustandsprüfung', items: [
            { id: 'allg-ue-c01', label: 'Vollständig' },
            { id: 'allg-ue-c02', label: 'Funktionsfähig' },
            { id: 'allg-ue-c03', label: 'Sauber' },
            { id: 'allg-ue-c04', label: 'Unbeschädigt' },
          ], allowNotes: true },
          { id: 'allg-ue-013', type: 'divider' },
          { id: 'allg-ue-014', type: 'toggle', label: 'Mängel vorhanden', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'allg-ue-015', type: 'repeater', label: 'Mängel', width: 'full', subFields: [
            { id: 'allg-ue-sf01', label: 'Mangel', type: 'text', placeholder: 'Beschreibung' },
            { id: 'allg-ue-sf02', label: 'Foto-Nr.', type: 'text', placeholder: '' },
          ], validation: { maxRows: 10 }, conditions: [{ field: 'allg-ue-014', operator: 'equals', value: true, action: 'show' }] },
          { id: 'allg-ue-016', type: 'photo', label: 'Mängelfotos', width: 'full', validation: { maxPhotos: 10 }, conditions: [{ field: 'allg-ue-014', operator: 'equals', value: true, action: 'show' }] },
        ]
      },
      {
        id: 'allg-ue-p3', title: 'Zubehör & Unterschrift', fields: [
          { id: 'allg-ue-020', type: 'heading', label: 'Mitgeliefertes Zubehör', level: 'h2' },
          { id: 'allg-ue-021', type: 'repeater', label: 'Zubehör', width: 'full', subFields: [
            { id: 'allg-ue-sf03', label: 'Gegenstand', type: 'text', placeholder: '' },
            { id: 'allg-ue-sf04', label: 'Anzahl', type: 'number', placeholder: '' },
            { id: 'allg-ue-sf05', label: 'Zustand', type: 'text', placeholder: 'gut/mittel/schlecht' },
          ], validation: { maxRows: 15 } },
          { id: 'allg-ue-022', type: 'textarea', label: 'Sonstige Bemerkungen', width: 'full' },
          { id: 'allg-ue-023', type: 'divider' },
          { id: 'allg-ue-024', type: 'signature', label: 'Unterschrift Übergeber', required: true, width: 'full' },
          { id: 'allg-ue-025', type: 'signature', label: 'Unterschrift Übernehmer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#6366f1' },
  },

  // 19. Reklamationsprotokoll
  {
    id: 'tpl-allg-reklamation',
    name: 'Reklamationsprotokoll',
    description: 'Erfassung und Bearbeitung von Kundenreklamationen',
    category: 'mangel',
    icon: '⚠️',
    version: 1,
    pages: [
      {
        id: 'allg-rk-p1', title: 'Reklamationsdaten', fields: [
          { id: 'allg-rk-001', type: 'heading', label: 'Reklamation', level: 'h2' },
          { id: 'allg-rk-002', type: 'date', label: 'Eingangsdatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-rk-003', type: 'text', label: 'Kundenname', required: true, width: 'full' },
          { id: 'allg-rk-004', type: 'text', label: 'Rechnungs-Nr. / Auftrags-Nr.', required: true, width: 'half' },
          { id: 'allg-rk-005', type: 'date', label: 'Ursprüngliches Auftragsdatum', width: 'half' },
          { id: 'allg-rk-006', type: 'text', label: 'Adresse', width: 'full' },
          { id: 'allg-rk-007', type: 'text', label: 'Telefon', width: 'half' },
        ]
      },
      {
        id: 'allg-rk-p2', title: 'Reklamationsgrund', fields: [
          { id: 'allg-rk-010', type: 'heading', label: 'Reklamationsgrund', level: 'h2' },
          { id: 'allg-rk-011', type: 'select', label: 'Kategorie', required: true, width: 'full', options: [
            { value: 'qualitaet', label: 'Qualitätsmangel' },
            { value: 'ausfuehrung', label: 'Fehlerhafte Ausführung' },
            { value: 'termin', label: 'Terminverzug' },
            { value: 'material', label: 'Materialfehler' },
            { value: 'schaden', label: 'Beschädigung' },
            { value: 'sonstige', label: 'Sonstige' },
          ]},
          { id: 'allg-rk-012', type: 'textarea', label: 'Detaillierte Beschreibung', required: true, width: 'full', placeholder: 'Genaue Beschreibung des Reklamationsgrundes...' },
          { id: 'allg-rk-013', type: 'photo', label: 'Fotos des Schadens / Mangels', width: 'full', validation: { maxPhotos: 10 } },
        ]
      },
      {
        id: 'allg-rk-p3', title: 'Beurteilung & Maßnahme', fields: [
          { id: 'allg-rk-020', type: 'heading', label: 'Beurteilung', level: 'h2' },
          { id: 'allg-rk-021', type: 'radio', label: 'Reklamation', required: true, options: [
            { value: 'berechtigt', label: 'Berechtigt' },
            { value: 'teilweise', label: 'Teilweise berechtigt' },
            { value: 'unberechtigt', label: 'Unberechtigt' },
          ]},
          { id: 'allg-rk-022', type: 'textarea', label: 'Begründung der Beurteilung', width: 'full' },
          { id: 'allg-rk-023', type: 'divider' },
          { id: 'allg-rk-024', type: 'heading', label: 'Maßnahmen', level: 'h2' },
          { id: 'allg-rk-025', type: 'textarea', label: 'Vereinbarte Maßnahme', required: true, width: 'full', placeholder: 'Nachbesserung, Ersatz, Gutschrift...' },
          { id: 'allg-rk-026', type: 'radio', label: 'Kostenübernahme', required: true, options: [
            { value: 'auftragnehmer', label: 'Auftragnehmer' },
            { value: 'auftraggeber', label: 'Auftraggeber' },
            { value: 'geteilt', label: 'Geteilt' },
          ]},
          { id: 'allg-rk-027', type: 'date', label: 'Frist zur Erledigung', width: 'half' },
        ]
      },
      {
        id: 'allg-rk-p4', title: 'Unterschrift', fields: [
          { id: 'allg-rk-030', type: 'textarea', label: 'Sonstige Vereinbarungen', width: 'full' },
          { id: 'allg-rk-031', type: 'divider' },
          { id: 'allg-rk-032', type: 'signature', label: 'Unterschrift Auftragnehmer', required: true, width: 'full' },
          { id: 'allg-rk-033', type: 'signature', label: 'Unterschrift Kunde', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#dc2626' },
  },

  // 20. Fahrzeugübergabe / Fuhrpark-Check
  {
    id: 'tpl-allg-fahrzeug',
    name: 'Fahrzeugübergabe / Fuhrpark-Check',
    description: 'Fahrzeugübergabeprotokoll mit Zustandsprüfung und Schadenserfassung',
    category: 'uebergabe',
    icon: '🚗',
    version: 1,
    pages: [
      {
        id: 'allg-fz-p1', title: 'Fahrzeugdaten', fields: [
          { id: 'allg-fz-001', type: 'heading', label: 'Fahrzeugdaten', level: 'h2' },
          { id: 'allg-fz-002', type: 'date', label: 'Übergabedatum', required: true, width: 'half', validation: { defaultToday: true } },
          { id: 'allg-fz-003', type: 'text', label: 'Kennzeichen', required: true, width: 'half' },
          { id: 'allg-fz-004', type: 'text', label: 'Fahrzeugtyp / Modell', required: true, width: 'half' },
          { id: 'allg-fz-005', type: 'number', label: 'km-Stand', required: true, width: 'half', validation: { min: 0, max: 999999 } },
          { id: 'allg-fz-006', type: 'select', label: 'Tankstand', required: true, width: 'half', options: [
            { value: 'voll', label: 'Voll' },
            { value: 'dreiviertel', label: '3/4' },
            { value: 'halb', label: '1/2' },
            { value: 'viertel', label: '1/4' },
            { value: 'reserve', label: 'Reserve' },
          ]},
          { id: 'allg-fz-007', type: 'text', label: 'Übergeber', required: true, width: 'half' },
          { id: 'allg-fz-008', type: 'text', label: 'Übernehmer', required: true, width: 'half' },
        ]
      },
      {
        id: 'allg-fz-p2', title: 'Zustandsprüfung', fields: [
          { id: 'allg-fz-010', type: 'heading', label: 'Fahrzeug-Check', level: 'h2' },
          { id: 'allg-fz-011', type: 'checklist', label: 'Ausstattung & Zustand', required: true, items: [
            { id: 'allg-fz-c01', label: 'Verbandskasten vorhanden und gültig' },
            { id: 'allg-fz-c02', label: 'Warndreieck vorhanden' },
            { id: 'allg-fz-c03', label: 'Warnweste vorhanden' },
            { id: 'allg-fz-c04', label: 'Bereifung in Ordnung (Profiltiefe)' },
            { id: 'allg-fz-c05', label: 'Beleuchtung funktionsfähig' },
            { id: 'allg-fz-c06', label: 'Ölstand in Ordnung' },
            { id: 'allg-fz-c07', label: 'Wischwasser aufgefüllt' },
            { id: 'allg-fz-c08', label: 'Sauberkeit innen' },
            { id: 'allg-fz-c09', label: 'Sauberkeit außen' },
            { id: 'allg-fz-c10', label: 'Fahrzeugpapiere vorhanden' },
          ], allowNotes: true },
        ]
      },
      {
        id: 'allg-fz-p3', title: 'Schäden', fields: [
          { id: 'allg-fz-020', type: 'heading', label: 'Schadenserfassung', level: 'h2' },
          { id: 'allg-fz-021', type: 'toggle', label: 'Schäden vorhanden', labelOn: 'Ja', labelOff: 'Nein' },
          { id: 'allg-fz-022', type: 'repeater', label: 'Schäden', width: 'full', subFields: [
            { id: 'allg-fz-sf01', label: 'Position am Fahrzeug', type: 'text', placeholder: 'Vorne links/Dach/Heck...' },
            { id: 'allg-fz-sf02', label: 'Beschreibung', type: 'text', placeholder: 'Kratzer/Delle/Riss...' },
          ], validation: { maxRows: 10 }, conditions: [{ field: 'allg-fz-021', operator: 'equals', value: true, action: 'show' }] },
          { id: 'allg-fz-023', type: 'photo', label: 'Schadensfotos', width: 'full', validation: { maxPhotos: 10 }, conditions: [{ field: 'allg-fz-021', operator: 'equals', value: true, action: 'show' }] },
        ]
      },
      {
        id: 'allg-fz-p4', title: 'Unterschrift', fields: [
          { id: 'allg-fz-030', type: 'heading', label: 'Übergabe', level: 'h2' },
          { id: 'allg-fz-031', type: 'number', label: 'km-Stand bei Übergabe', required: true, width: 'half', validation: { min: 0, max: 999999 } },
          { id: 'allg-fz-032', type: 'textarea', label: 'Bemerkungen', width: 'full' },
          { id: 'allg-fz-033', type: 'divider' },
          { id: 'allg-fz-034', type: 'signature', label: 'Unterschrift Übergeber', required: true, width: 'full' },
          { id: 'allg-fz-035', type: 'signature', label: 'Unterschrift Übernehmer', required: true, width: 'full' },
        ]
      },
    ],
    pdfSettings: { orientation: 'portrait', showLogo: true, accentColor: '#475569' },
  },

];
