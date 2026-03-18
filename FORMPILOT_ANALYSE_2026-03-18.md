# FormPilot — Vollständige Ist-Analyse (2026-03-18)

## Zusammenfassung

Analyse von 81 Source-Files, 4 parallele Agents (Architektur, Performance, UX/Bugs, Security).
**Ergebnis: 100+ identifizierte Verbesserungen** in 6 Kategorien.

---

## 1. KRITISCHE BUGS (sofort fixen)

| # | Bug | Datei | Zeile | Auswirkung |
|---|-----|-------|-------|------------|
| B1 | Signatur-Validierung: Leere Canvas erzeugt gültige DataURL → Pflichtfeld-Check passiert | validation.js | 72-87 | Formulare ohne Unterschrift absendbar |
| B2 | FormFiller Page-Navigation Race Condition: Refs können stale sein bei schnellem Klicken | FormFiller.jsx | 61-71 | Seitensprung, Validierung übersprungen |
| B3 | Dashboard NaN: `Math.max(...[])` bei 0 Submissions → Chart-Bars NaN | DashboardScreen.jsx | 89 | Dashboard-Chart kaputt |
| B4 | Conditional Logic: Nur erste Condition-Action wird benutzt, gemischte Actions ignoriert | validation.js | 2-27 | Bedingte Felder funktionieren falsch |
| B5 | DateField defaultToday: Einmal gefeuert, bei Feld-Clear kein Re-Populate | DateField.jsx | 5-6 | defaultToday-Feature unzuverlässig |
| B6 | BarcodeField Detector-Leak: detectorRef nicht gereinigt bei stopCamera() | BarcodeField.jsx | 118-157 | Memory-Leak bei wiederholtem Scannen |
| B7 | GpsField autoCapturedRef außerhalb Component → bei Re-Mount kein Auto-Capture | GpsField.jsx | 77, 137-141 | GPS Auto-Capture bricht |

---

## 2. SICHERHEIT

| # | Problem | Severity | Datei |
|---|---------|----------|-------|
| S1 | PIN in Klartext in DB gespeichert, kein Hash | KRITISCH | supabaseService.js:52-66 |
| S2 | Claude API-Key in localStorage (XSS-Risiko) | HOCH | aiService.js:59-74 |
| S3 | CSV/Excel Formula Injection nicht verhindert | MITTEL | exportCsv.js:92-94, exportExcel.js |
| S4 | PDF Logo-URL nicht validiert (javascript: möglich) | MITTEL | exportPdf.js:22 |
| S5 | RLS: Activity-Log erlaubt INSERT mit gefälschtem userName | MITTEL | 002_rls_policies.sql:89-93 |
| S6 | PII-Export unverschlüsselt als JSON | MITTEL | storageBackup.js:277-296 |
| S7 | localStorage Quota-Fehler stillschweigend ignoriert | KRITISCH | storage.js:67-85 |

---

## 3. PERFORMANCE (P1-P6 Regeln)

### P1: Fehlende React.memo (15 Komponenten)
- TextField, TextareaField, NumberField, DateField, TimeField
- SelectField, RadioField, CheckboxField, ToggleField
- ChecklistField, RatingField, LayoutFields (Heading/Divider/Info)
- MiniToggle, ToastMessage

### P2: Fehlende useCallback (20+ Stellen)
- Alle Field-Komponenten: onChange/onFocus/onBlur inline in JSX
- BuilderPalette: onMouseEnter/onMouseLeave inline
- Layout-Screens: onMouseEnter/onMouseLeave inline Style-Mutations
- GlobalDialog: onChange inline

### P4: Style-Objekte in Render
- PhotoAnnotation.jsx:124-129 (dynamisches backgroundImage)
- ChecklistField.jsx:8-26 (inline Styles im Render)
- RatingField.jsx:10,18,23 (inline im Conditional Render)

### P6: Fehlende Debounce auf Text-Inputs
- TextField/TextareaField: Sofortiges State-Update ohne Debounce
- BuilderSettingsPanel: Alle Label/Placeholder Inputs ohne Debounce
- FormBuilder: Name-Input ohne Debounce
- ProjectDetail: Name/Description ohne Debounce

---

## 4. ARCHITEKTUR

| Problem | Impact | Lösung |
|---------|--------|--------|
| App.jsx God-Component (402 Zeilen, 16 States) | Schwer wartbar, Re-Render-Kaskaden | Context-Provider extrahieren |
| Prop-Drilling: templateMap in 6+ Komponenten dupliziert | Code-Duplikation | TemplateContext einführen |
| 3 verschiedene State-Patterns (local/singleton/storage) | Inkonsistenz, Race Conditions | Vereinheitlichen |
| supabaseService.js (400+ Zeilen) | Monolith | Splitten: auth, templates, submissions |
| Kein Code-Splitting | 968 KB Bundle | React.lazy() für Builder/AI |

---

## 5. UX-VERBESSERUNGEN

| Problem | Datei | Lösung |
|---------|-------|--------|
| Repeater: Nur text-Spalten, kein Type-Selector | BuilderSettingsPanel | Column-Type Dropdown |
| Conditional Require/Disable: UI vorhanden, Backend fehlt | validation.js | Logik implementieren |
| GPS Auto-Capture: Stille Fehler, kein User-Feedback | GpsField.jsx | Error-Toast anzeigen |
| Photo-Kompression: Fehler stillschweigend ignoriert | PhotoField.jsx | Error-Feedback |
| FormFiller Page-Nav nicht sticky | FormFiller.jsx | Sticky Position |
| Builder Settings Drawer Overflow auf Mobile | FormBuilder.jsx | Scroll-Fix |
| Rating-Stars nicht Keyboard-navigierbar | RatingField.jsx | Arrow-Key Support |

---

## 6. ACCESSIBILITY

| Problem | Dateien |
|---------|---------|
| aria-describedby fehlt für Radio, Checkbox, Toggle, Rating | FormField.jsx |
| MiniToggle: fehlt role="switch", aria-checked | MiniToggle.jsx |
| Signature: Kein Keyboard-Fallback | SignatureField.jsx |
| Builder Drag-Drop: Kein Keyboard-Reorder | BuilderCanvas.jsx |
| Rating: Fehlende aria-labels auf Buttons | RatingField.jsx |

---

## Priorisierung für Phase 3

### Batch A: Kritische Bugs + Security (MUSS)
- B1-B7, S1, S3, S7

### Batch B: Performance P1-P6 (MUSS laut CLAUDE.md)
- React.memo auf 15 Komponenten
- useCallback auf Field-Handler
- Debounce auf Text-Inputs

### Batch C: Architektur-Verbesserungen (SOLL)
- Context-Provider für Templates/User
- Code-Splitting

### Batch D: UX + Accessibility (SOLL)
- Accessibility-Fixes
- UX-Verbesserungen
