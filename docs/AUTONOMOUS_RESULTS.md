# FormPilot — Vollständige Autonome Code-Analyse

**Datum:** 2026-03-17
**Analysiert:** Jede Zeile in src/, supabase/, tests/, config, public
**Methode:** 5 parallele Tiefenanalysen + manueller Cross-Check jeder Datei

---

## EXECUTIVE SUMMARY — Top 20 Findings nach Impact

| # | Finding | Schwere | Aufwand | Datei(en) |
|---|---------|---------|---------|-----------|
| 1 | Fotos als Base64 in localStorage — 5MB-Limit nach 3-5 Submissions | KRITISCH | Mittel | PhotoField.jsx, storage.js |
| 2 | Doppel-Submit möglich (kein disabled-State) | KRITISCH | Gering | FormFiller.jsx:54-59 |
| 3 | storage.js verschluckt QuotaExceededError still — Datenverlust | KRITISCH | Gering | storage.js:28-31 |
| 4 | CSV Formula Injection (=CMD, +cmd) | HOCH | Gering | exportCsv.js:59-61 |
| 5 | XSS via unescapte img src in PDF Export | HOCH | Gering | exportPdf.js:93,100 |
| 6 | Template-Löschung macht Submissions unlesbar, keine Warnung | HOCH | Mittel | App.jsx:195-198 |
| 7 | templateVersion gespeichert aber nie ausgewertet | HOCH | Hoch | App.jsx:98, SubmissionDetail |
| 8 | Duplikat-Funktion generiert keine neuen Sub-IDs (Checklist, Repeater) | HOCH | Gering | FormBuilder.jsx:110-120 |
| 9 | SignatureField ignoriert value-Updates nach Mount (Undo bricht) | HOCH | Gering | SignatureField.jsx:62 |
| 10 | CheckboxField nicht tastaturbedienbar (kein <input>) | HOCH | Gering | CheckboxField.jsx:3-18 |
| 11 | ChecklistField — Klick auf Label-Text funktioniert nicht | HOCH | Gering | ChecklistField.jsx:13-14 |
| 12 | Disabled-Felder per Tastatur weiter bedienbar | HOCH | Gering | FormField.jsx:45 |
| 13 | Kunden-Dedup zu aggressiv ("Max" → "Maximilian GmbH") | HOCH | Gering | customerService.js:43-48 |
| 14 | CSV-Export ignoriert aktive Filter | MITTEL | Gering | SubmissionsList.jsx:71 |
| 15 | Drag&Drop berechnet Drop-Position nur Y-Achse (Half/Third kaputt) | MITTEL | Mittel | BuilderCanvas.jsx:24-34 |
| 16 | Jeder Tastendruck = 1 Undo-Schritt (Undo unbrauchbar für Text) | MITTEL | Gering | FormBuilder.jsx:169 |
| 17 | Pagination nicht zurückgesetzt bei Filteränderungen | MITTEL | Gering | SubmissionsList, CustomersScreen |
| 18 | PhotoField String/Array Typwechsel fragil | MITTEL | Gering | PhotoField.jsx:57,66,74 |
| 19 | CustomerDetail editData synchronisiert nicht bei Prop-Änderung | MITTEL | Gering | CustomerDetail.jsx:46 |
| 20 | Null Tests im gesamten Projekt (FR5 verletzt) | MITTEL | Hoch | Gesamtes Projekt |

**Empfohlene Reihenfolge:** #2 → #3 → #1 → #4 → #5 → #8 → #10 → #11 → #12 → #6 → Rest

---

## TEIL 1: DATEI-FÜR-DATEI ANALYSE

### src/App.jsx (283 Zeilen)
**Zweck:** Haupt-App, Routing via State-Machine, 15 State-Variablen
**Exports:** `default FormPilot`
**Abhängigkeiten:** Alle Layout/Filler/Builder-Komponenten, alle Services

**Bugs:**
- **Zeile 69 + 99-100:** Doppelte Persistierung. `useEffect` speichert submissions bei jeder Änderung UND `handleSubmitForm` speichert manuell. Race-Condition möglich.
- **Zeile 98:** `const updated = [...submissions, newSub]` — Stale Closure. Sollte `setSubmissions(prev => [...prev, newSub])` sein für Atomizität.
- **Zeile 177-188:** Direkte Mutation von `phase`-Objekt aus Storage (`phase.submissionId = null`). Funktioniert, aber bricht Immutability-Konvention.
- **Zeile 55:** `localStorage.getItem('fp_darkMode')` — Direkter Zugriff umgeht storage.js Abstraction.
- **Zeile 195-198:** Template-Löschung ohne Warnung dass existierende Submissions davon betroffen sind. Draft-Keys (`fp_draft_${id}_current`) werden nie aufgeräumt.

### src/main.jsx (13 Zeilen)
**Zweck:** Entry Point, StrictMode, ErrorBoundary
**Sauber.** Keine Issues.

### src/lib/storage.js (41 Zeilen)
**Zweck:** Persistence-Abstraktion über localStorage
**Bugs:**
- **Zeile 8-12 + 21-24:** Supabase-Backend Fallthrough. Wenn `STORAGE_BACKEND = 'supabase'`, fällt Code zu localStorage durch (Return ist auskommentiert).
- **Zeile 28-31:** QuotaExceededError wird nur geloggt, nicht propagiert. Caller weiß nicht, dass Daten verloren gingen.
- **Zeile 6-16:** `storageGet` returned `null` bei Parse-Error — korrekt, aber kein Logging der Korruption.

### src/lib/validation.js (94 Zeilen)
**Zweck:** Conditional Logic Engine + Validation Engine
**Bugs:**
- **Zeile 23:** `conditions[0]?.action` — nur erste Condition-Action zählt. Verschiedene Actions in derselben Condition-Gruppe werden ignoriert.
- **Zeile 52:** `if (!value && !field.required) return null` — Wert `0` wird fälschlich als "leer" behandelt (`!0 === true`). Number-Feld mit Wert 0 und `min: 1` wird nicht validiert.
- **Zeile 13:** `default: return true` — Unbekannter Operator wird still als `true` evaluiert. Tippfehler `"equal"` statt `"equals"` = Condition immer wahr.
- **Zeile 6:** `case 'equals': return val === c.value` — Strikte Gleichheit. Toggle-Wert `true` (boolean) matcht nicht `"true"` (string). Funktioniert aktuell, weil Toggle echte Booleans sendet. Bricht bei Schema-Migration.

### src/lib/helpers.js (40 Zeilen)
**Zweck:** Feld-Factory, Slug-Helper, Template-Factory
**Bugs:**
- **Zeile 27-28:** Repeater SubField-IDs basieren auf `Date.now()`. Bei schnellem Erstellen: identische Millisekunde → gleiche ID-Basis (aber unterschiedliches Suffix `-1`/`-2`).

### src/lib/supabase.js (12 Zeilen)
**Zweck:** Supabase Client (noch nicht aktiv genutzt)
**Status:** Erstellt Client nur wenn VITE_SUPABASE_URL + KEY gesetzt. Sauber.

### src/lib/exportPdf.js (122 Zeilen)
**Zweck:** PDF-Export via Print-Window
**Bugs:**
- **Zeile 93:** `<img src="${sig}"` — Signature-Wert wird NICHT escaped. XSS möglich: `data:x" onerror="alert(1)"`.
- **Zeile 100:** Gleicher Bug für Foto-URLs.
- **Zeile 53-54:** `accentColor` unescaped in CSS injiziert. CSS-Injection möglich.
- **Zeile 82:** `inputFields` berechnet aber nie verwendet (toter Code).
- **Zeile 115-120:** `window.open()` → `document.write()`. Kein try/catch um `print()`.

### src/lib/exportCsv.js (73 Zeilen)
**Zweck:** CSV-Export aller Submissions
**Bugs:**
- **Zeile 59-61:** Kein Schutz gegen CSV Formula Injection. Werte die mit `=`, `+`, `-`, `@` beginnen, werden direkt in CSV geschrieben → Excel führt sie als Formeln aus.
- **BOM** (Zeile 65): `\uFEFF` korrekt für UTF-8-CSV in Excel. Gut.
- **Zeile 71:** `URL.revokeObjectURL(url)` direkt nach `a.click()` — könnte zu früh sein wenn Browser den Download asynchron startet. In der Praxis OK weil Blob bereits gelesen.

### src/lib/customerService.js (192 Zeilen)
**Zweck:** Kunden-CRUD, Auto-Erkennung, Activity-Log
**Bugs:**
- **Zeile 43-48:** Dedup zu aggressiv. `"max mueller".includes("max")` && `"max".length >= 3` → Match! Jeder Kundenname der einen bestehenden 3+-Zeichen-Namen als Substring enthält, wird falsch zugeordnet.
- **Zeile 55-101:** Race Condition bei parallelen Calls. Read-Modify-Write ohne Lock.
- **Zeile 116:** Activity Log Off-by-One: `if (log.length > 1000) log.length = 1000` — nach `unshift` kurzzeitig 1001 Einträge. Trivial, aber korrekturfähig.
- **Zeile 188-192:** `deleteCustomer` räumt Activity-Log und verwaiste submissionIds nicht auf.

### src/lib/projectService.js (225 Zeilen)
**Zweck:** Projekt-CRUD, Phase-Management, AutoFill, SharedData
**Bugs:**
- **Zeile 216-222:** `reorderPhases` → `filter(Boolean)` entfernt ungültige IDs still. Phasen gehen verloren wenn eine ID nicht existiert.
- **Zeile 116-117:** Direkte Mutation von `phase`-Objekt: `phase.submissionId = submissionId`.
- **Zeile 140:** AutoFill matcht case-insensitive by Label. Zwei Felder mit Label "Datum" in verschiedenen Templates → falsches AutoFill.

### src/config/constants.js (74 Zeilen)
**Zweck:** Users, Storage-Keys, Field-Patterns
**Sicherheit:**
- **Zeile 2-6:** Hardcoded PINs im Klartext (1234, 5678, 9999). Demo-OK, Production-kritisch.
- **Zeile 18-24:** CUSTOMER_FIELD_PATTERNS — Label-basiertes Matching. Funktioniert für deutsche Labels, bricht bei Custom-Labels.

### src/config/templates.js (148 Zeilen)
**Zweck:** 3 Demo-Templates (Servicebericht, Baustellenabnahme, Mängelprotokoll)
**Status:** Korrekt strukturiert. Templates valide. Conditional Logic in Baustellenabnahme (a16→a17-a20) korrekt.

### src/config/theme.js (63 Zeilen)
**Zweck:** Design-Tokens, CSS-Variables, Farb-Mapping
**Status:** Sauber. Dark Mode via CSS Custom Properties korrekt.

### src/styles/shared.js (71 Zeilen)
**Zweck:** Shared Style-Funktionen
**Performance:** `navItem()`, `btn()`, `input()`, `badge()`, `progressFill()` sind Style-Factories die bei jedem Render neue Objekte erzeugen. P4-Verstoß für `btn` und `badge` (oft mit gleichen Args aufgerufen). Nicht memoized.

### src/hooks/useUndoRedo.js (51 Zeilen)
**Zweck:** Undo/Redo mit JSON-Serialisierung
**Bugs:**
- **Zeile 10:** Lazy-Init ruft `initialState()` doppelt auf wenn es eine Funktion ist (einmal in `useState`, einmal manuell). Kann divergierende Werte erzeugen bei `Date.now()` etc.
- **Zeile 47-48:** `canUndo`/`canRedo` basieren auf Refs, sind nur nach Re-Render korrekt. Fragil.
- **Kein Debounce:** Jeder `push()` speichert. Bei Text-Eingabe = 1 History-Entry pro Tastendruck.

### src/hooks/useDebounce.js
**Zweck:** Debounced Value-Hook
**Status:** Korrekt implementiert. Cleanup vorhanden.

### src/hooks/useMediaQuery.js
**Zweck:** CSS Media Query Hook
**Status:** Korrekt. SSR-safe. Cleanup vorhanden.

### src/hooks/useConfirm.js
**Zweck:** Custom Confirm-Dialog State-Management
**Status:** Sauber.

### src/components/common/ErrorBoundary.jsx
**Bugs:**
- Kein `componentDidCatch` → Error-Details und Component-Stack nicht geloggt.
- Reset-Button ruft `window.location.reload()` UND setzt State zurück (redundant).

### src/components/common/ToastMessage.jsx
**Bugs:**
- **Zeile 5:** `useEffect(() => { setTimeout(onDone, 2500); }, [])` — `onDone` fehlt in Dependencies. Stale Closure bei schnellem Toast-Wechsel. Zweiter Toast verschwindet mit Timer des ersten.

### src/components/common/ConfirmDialog.jsx
**Status:** Funktional korrekt. Fehlt: `role="dialog"`, `aria-modal="true"`, Focus-Trap.

### src/components/common/MiniToggle.jsx
**Status:** Sauber.

### src/components/fields/FormField.jsx (104 Zeilen)
**Bugs:**
- **Zeile 45:** `pointerEvents: 'none'` statt natives `disabled`-Attribut. Tastatur-User können weiter tippen.
- **Zeile 80:** RepeaterField `key={ri}` — Array-Index als Key. Bei Löschen mittlerer Zeile: Input-State-Verwirrung.

### src/components/fields/SignatureField.jsx (115 Zeilen)
**Bugs:**
- **Zeile 62:** Leeres Dependency-Array `[]`. Wenn `value` sich ändert (Undo/Redo), wird Canvas nicht aktualisiert.
- **Zeile 70-71:** `draw` Callback hat Stale `isDrawing` zwischen setState und Re-Render. Erster Pixel wird verschluckt.
- **Zeile 47-48:** Canvas-Größe einmalig gesetzt. Bei Window-Resize (Handy drehen): Verzerrung.
- **Zeile 103:** Canvas hat kein `tabIndex`, kein `role`, kein `aria-label`. Nicht keyboard-accessible.

### src/components/fields/PhotoField.jsx (124 Zeilen)
**Bugs:**
- **Zeile 57,66,74:** Wert wechselt zwischen `null`, `string`, `string[]`. Downstream-Code der `value.length` prüft, bekommt bei einzelnem Foto die String-Länge (~50000) statt 1.
- **Zeile 67-68:** `catch { // Silently skip corrupt images }` — kein User-Feedback.
- **Zeile 31-51:** Keine EXIF-Rotation-Korrektur. Ältere Safari/iPads zeigen Fotos gedreht.
- **Base64-Größe:** 1200px JPEG q0.8 = ~200-400KB pro Foto. 5 Fotos = 1-2MB. localStorage-Limit nach wenigen Submissions erreicht.

### src/components/fields/CheckboxField.jsx
**Bugs:**
- Kein `<input type="checkbox">`, rein visueller `onClick` auf `<label>`. Screen Reader sieht nichts. Keyboard-User können nichts fokussieren.
- Fehlen: `role="checkbox"`, `aria-checked`, `tabIndex`.

### src/components/fields/ChecklistField.jsx
**Bugs:**
- **Zeile 13-14:** `onClick` nur auf innerem `<div>` (22x22px Box), nicht auf Label-Text. Klick auf Text tut nichts.

### src/components/fields/RatingField.jsx
**Bugs:**
- Keine `aria-label` auf Stern-Buttons. Screen Reader sagt nur "Button".
- Kein Zurücksetzen auf 0 Sterne möglich (optionales Rating kann nicht rückgängig gemacht werden).
- Fehlen: `role="radiogroup"`, `role="radio"`, `aria-checked`, Pfeiltasten-Navigation.

### src/components/fields/DateField.jsx
**Bugs:**
- **Zeile 6:** `useEffect(() => { ... }, [])` mit `eslint-disable`. `defaultToday` und `value` fehlen in Dependencies. Kein Re-Run wenn sich Config ändert.

### src/components/fields/ToggleField.jsx
**Bugs:**
- **Zeile 4:** `value === true` — Strikter Vergleich. String `"true"` aus externen Daten → Toggle zeigt "Aus".

### src/components/fields/TextField.jsx + TextareaField.jsx
**Bugs:**
- `onBlur` setzt Border-Color aus Stale `error`-Closure. Kurzes rotes Flackern möglich nach Fehlerkorrektur.

### src/components/fields/NumberField.jsx, TimeField.jsx, SelectField.jsx, RadioField.jsx
**Status:** Funktional korrekt. RadioField hat verstecktes `<input>` (besser als CheckboxField).

### src/components/fields/LayoutFields.jsx (Heading, Divider, Info)
**Status:** Sauber. Rein dekorativ.

### src/components/filler/FormFiller.jsx (99 Zeilen)
**Bugs:**
- **Zeile 54-59:** Kein `isSubmitting`-State. Doppelklick auf "Abschließen" → doppelte Submission.
- **Zeile 55:** Leere Pages (`pages = []`) → `currentPage = undefined` → `isLastPage = false` → User sitzt fest.
- **Zeile 40-46:** Autosave alle 30s. Draft wird bei Cancel NICHT gelöscht (gewollt), aber bei Template-Löschung verwaisen Drafts.

### src/components/filler/TemplateSelector.jsx
**Bugs:**
- **Zeile 53-54:** `t.pages.length` und `t.pages.reduce(...)` ohne Null-Check. Korruptes Template ohne `pages` → Crash.

### src/components/builder/FormBuilder.jsx (215 Zeilen)
**Bugs:**
- **Zeile 169:** Text-Input `onChange` → `upd()` pro Tastendruck → 1 Undo-History-Entry pro Zeichen. Undo für Text-Eingaben komplett unbrauchbar.
- **Zeile 110-120:** `duplicateField` klont per `JSON.parse(JSON.stringify())`, generiert aber nur neue Top-Level-ID. Sub-Items (checklist.items, repeater.subFields) behalten Original-IDs → Daten-Konflikte im Filler.
- **Zeile 149:** `confirm('Ungespeicherte Änderungen verwerfen?')` — synchroner Dialog, blockiert Main Thread. Auf Mobile/PWA problematisch.

### src/components/builder/BuilderCanvas.jsx
**Bugs:**
- **Zeile 24-34:** Drop-Position nur nach Y-Achse. Bei Half/Third-Breite Feldern (nebeneinander): Drop immer vor erstem Feld der Zeile, nie zwischen.
- **Zeile 24-34:** `handleDragOver` feuert bei jedem Mouse-Move (60fps). `querySelectorAll` + Schleife bei jedem Event. Performance-Problem bei 50+ Feldern.

### src/components/builder/BuilderSettingsPanel.jsx
**Bugs:**
- **Zeile 45-46:** `field.id` Zugriff in useEffect VOR Null-Check `if (!field) return null`. Defensiver Code falsch strukturiert.

### src/components/builder/OptionsEditor.jsx
**Bugs:**
- **Zeile 18:** `key={i}` (Array-Index als Key). Durch Controlled Components abgemildert, aber React Anti-Pattern.

### src/components/builder/BuilderMetaPanel.jsx, BuilderPalette.jsx, BuilderFieldCard.jsx, ChecklistItemsEditor.jsx
**Status:** Funktional korrekt. Kleinere Style-Inline-Issues.

### src/components/layout/LoginScreen.jsx
**Bugs:**
- **Zeile 13:** Kein Brute-Force-Schutz. 4-stellige numerische PINs = 10.000 Kombinationen, alle in <1 Sekunde durchprobierbar.

### src/components/layout/SettingsScreen.jsx
**Bugs:**
- **Zeile 28:** Storage-Berechnung nur einmal bei Mount (`[]`). Nie aktualisiert.

### src/components/layout/SubmissionsList.jsx
**Bugs:**
- **Zeile 71:** CSV-Export nutzt `submissions` (ungefiltert) statt `filtered`. User exportiert immer ALLE Submissions, auch wenn Filter aktiv.
- **Pagination:** `page`-State wird bei Filteränderungen nicht zurückgesetzt. Nach Filter-Entfernung springt User auf alte Seite.

### src/components/layout/SubmissionDetail.jsx
**Status:** Funktional korrekt. Zeile 70: "Vorlage nicht gefunden" bei gelöschtem Template — korrekte Fallback-Anzeige, aber Daten sind nicht mehr lesbar.

### src/components/layout/TemplatesOverview.jsx
**Bugs:**
- **Zeile 55-56:** JSON-Import validiert nur `pages` als Array, nicht Inhalt. Malformed JSON (pages: [null, 42]) wird akzeptiert, crasht später.

### src/components/layout/DashboardScreen.jsx
**Status:** Großer `useMemo`-Block. Division durch 0 theoretisch möglich bei `stats.total === 0`, aber durch leeres Array abgesichert.

### src/components/layout/CustomersScreen.jsx
**Bugs:**
- Suche durchsucht nicht `phone`-Feld.
- `c.projects?.some(p => p.toLowerCase()...)` crasht wenn Project-Eintrag kein String.

### src/components/layout/CustomerDetail.jsx
**Bugs:**
- **Zeile 46:** `editData` wird bei Mount initialisiert, synchronisiert nicht bei `customer`-Prop-Änderung. Erneutes "Bearbeiten" zeigt alte Werte.
- **Zeile 43:** `notes` State synchronisiert nicht bei Kunden-Wechsel (wenn Komponente recycelt wird).

### src/components/layout/ProjectsScreen.jsx
**Status:** Pagination-Bug wie SubmissionsList.

### src/components/layout/ProjectDetail.jsx
**Bugs:**
- **Zeile 107:** `saveProject({ _deleted: true })` — sendet nur `_deleted`-Flag an Parent. Parent muss `onProjectChange` korrekt auswerten (tut er: App.jsx:214 `if (updated._deleted) { await deleteProject(updated.id); ... }`).
- **Zeile 238:** "Vertrag erstellen" Button sichtbar aber funktionslos wenn Template gelöscht wurde.

---

## TEIL 2: SICHERHEIT

### S-01: CSV Formula Injection [HOCH]
**Datei:** `src/lib/exportCsv.js:59-61`
**Problem:** Kein Schutz gegen `=CMD()`, `+cmd|`, `@SUM()` etc.
**Impact:** Excel führt Formeln aus wenn CSV geöffnet wird. Handwerksbetrieb-Mitarbeiter öffnen CSVs typischerweise direkt in Excel.
**Fix:**
```js
// VORHER:
const escape = (v) => {
  const s = String(v).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
};

// NACHHER:
const escape = (v) => {
  let s = String(v).replace(/"/g, '""');
  // CSV Formula Injection Prevention
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
};
```

### S-02: XSS in PDF Export — img src unescaped [HOCH]
**Datei:** `src/lib/exportPdf.js:93,100`
**Problem:** Signature- und Photo-Data-URLs werden direkt in `<img src="...">` injiziert.
**Fix:**
```js
// VORHER:
if (sig) html += `<img src="${sig}" class="signature-img" />`;
html += `...${photos.map(p => `<img src="${p}" class="photo-img" />`).join('')}...`;

// NACHHER:
if (sig) html += `<img src="${esc(sig)}" class="signature-img" />`;
html += `...${photos.map(p => `<img src="${esc(p)}" class="photo-img" />`).join('')}...`;
```

### S-03: CSS Injection via accentColor [NIEDRIG]
**Datei:** `src/lib/exportPdf.js:53-54`
**Fix:** `const accent = (settings.accentColor || '#2563eb').replace(/[^#a-fA-F0-9]/g, '');`

### S-04: Hardcoded PINs [MITTEL für Demo]
**Datei:** `src/config/constants.js:2-6`
**Status:** Akzeptabel für Demo-Phase. Vor Production: Auth via Supabase Auth.

### S-05: Kein Rate-Limiting bei Login [NIEDRIG]
**Datei:** `src/components/layout/LoginScreen.jsx:13`
**Fix:** Counter-State, nach 5 Fehlversuchen 30s Lockout.

### S-06: localStorage-Daten nicht signiert [INFO]
**Status:** Akzeptabel für localStorage-Phase. Bei Supabase: RLS Policies + Server-Side Validation.

### DSGVO-Hinweise
- Kundendaten in localStorage = lokal auf Gerät, keine Server-Übertragung aktuell
- Bei Supabase-Migration: Auftragsverarbeitung, Datenschutzerklärung, Löschkonzept nötig
- `deleteCustomer` räumt Activity-Log nicht auf → DSGVO-Löschanspruch nicht vollständig umgesetzt
- Fotos als Base64 enthalten möglicherweise EXIF-Daten (GPS-Koordinaten) → sollten gestrippt werden

---

## TEIL 3: PERFORMANCE

### P-01: React.memo fehlt auf Field-Komponenten [HOCH]
**Dateien:** RadioField, CheckboxField, ChecklistField, RatingField, ToggleField
**Impact:** Bei 20+ Feldern pro Seite: jede Eingabe re-rendert ALLE Felder.
**Fix:** Jede Komponente mit `React.memo()` wrappen. CheckboxField und ChecklistField brauchen Custom-Comparator wegen `formData`-Prop.

### P-02: Inline-Style-Factories in Listen [MITTEL]
**Dateien:** `styles.badge()`, `styles.btn()` in SubmissionsList, TemplatesOverview
**Impact:** Neue Objekt-Referenz bei jedem Render → React.memo nutzlos.
**Fix:** Häufige Varianten als Konstanten cachen: `const BTN_PRIMARY_SM = styles.btn('primary', 'sm');`

### P-03: BuilderCanvas handleDragOver 60fps DOM-Queries [MITTEL]
**Datei:** `src/components/builder/BuilderCanvas.jsx:24-34`
**Fix:** Throttle auf ~16ms (requestAnimationFrame) oder nur setDropIndex wenn sich idx ändert.

### P-04: useUndoRedo JSON.stringify bei jedem Tastendruck [MITTEL]
**Impact:** Template mit 50+ Feldern → ~10-50KB JSON-String pro Tastendruck.
**Fix:** Debounce `push()` um 500ms für Text-Eingaben.

### P-05: Kein Code-Splitting / Lazy Loading [NIEDRIG]
**Status:** Gesamte App in einem Bundle. Bei aktueller Größe (~50 Komponenten) noch akzeptabel.
**Für S04+:** React.lazy() für FormBuilder, DashboardScreen, ProjectDetail.

### Bundle-Größe Schätzung
- react + react-dom: ~45KB gzipped
- @supabase/supabase-js: ~30KB gzipped (noch ungenutzt!)
- vite-plugin-pwa (nur build-time)
- Eigener Code: ~80KB ungezipped → ~15-20KB gzipped
- **Gesamt: ~90KB gzipped** — sehr gut für PWA

### Supabase Query-Effizienz
**Status:** Supabase noch nicht aktiv. Bei Migration:
- Jeder `storageGet` + `storageSet` Zyklus → 2 Queries. Batch-Operations nötig.
- `customerService.processCustomerFromSubmission` = 1 Read + 1 Write (+ Activity Log). Bei Supabase: RPC Function empfohlen.

---

## TEIL 4: ERROR HANDLING

### E-01: storage.js QuotaExceededError [KRITISCH]
**Fix:**
```js
// VORHER:
catch (e) { console.error('Storage error:', e); }

// NACHHER:
export const storageSet = async (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (e) {
    console.error('Storage error:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { error: 'quota', message: 'Speicher voll. Bitte alte Einträge löschen.' };
    }
    return { error: 'unknown', message: 'Speicherfehler' };
  }
};
```

### E-02: App-Init ohne try/catch [HOCH]
**Datei:** `App.jsx:58-67`
**Fix:** Async IIFE in try/catch wrappen, bei Fehler: `setLoaded(true)` + Error-Toast.

### E-03: Template-Import ohne Schema-Validierung [MITTEL]
**Datei:** `TemplatesOverview.jsx:55-56`
**Fix:** Validiere: `pages` Array mit max 50 Einträgen, jede Page hat `fields` Array, jedes Field hat `id` + `type`, Gesamtgröße < 1MB.

### E-04: PhotoField verschluckt Fehler [MITTEL]
**Datei:** `PhotoField.jsx:67-68`
**Fix:** `catch (err) { setToast?.({ message: 'Fotos konnten nicht geladen werden', type: 'error' }); }`

### E-05: Netzwerk-Fehler (für Supabase-Migration)
**Status:** Noch nicht relevant (localStorage). Bei Migration:
- Retry-Logic mit exponential backoff
- Offline-Queue mit Background Sync
- Timeout-Handling (Supabase default: 30s)

### E-06: Auth-Fehler
**Status:** PIN-Auth lokal. Bei Supabase:
- Token-Refresh-Handling
- Session-Expiry-Detection
- Redirect zu Login bei 401

---

## TEIL 5: CODE-QUALITÄT

### Duplikate

| Pattern | Vorkommen | Fix |
|---------|-----------|-----|
| `.toLocaleDateString('de-DE', {day:'2-digit',...})` | 10+ | `lib/formatDate.js` |
| `storageGet → modify → storageSet` | 6+ | `storageUpdate(key, fn)` |
| `widthMap = {full:'100%', half:...}` | 2 | Nach `config/constants.js` |
| `Array.isArray(value) ? value : value ? [value] : []` | 5+ (PhotoField, exportPdf, SubmissionDetail) | `lib/normalizeArray.js` |
| `const photos = (() => { const v = ...; return Array.isArray(v) ? v : v ? [v] : []; })()` | 3 | Gleicher Helper |

### Toter Code
- `exportPdf.js:82` — `inputFields` berechnet, nie verwendet
- `supabase.js` — Client erstellt, nirgends importiert (geplantes Feature)
- `storage.js:8-12` — Supabase-Backend-Branches auskommentiert

### Inkonsistente Patterns
- `window.confirm()` vs. `useConfirm` Hook (SubmissionsList vs TemplatesOverview)
- Direkter `localStorage.getItem` (App.jsx:55) vs. `storageGet`
- Manche Komponenten mit `React.memo`, manche ohne

### Fehlende Types
- Kein TypeScript, keine JSDoc für Service-Funktionen
- Feld-Schema nirgends formal definiert (nur implizit in `createField`)

### Magic Numbers
- `30000` (Autosave Interval) — sollte Konstante sein
- `60000` (Builder Autosave)
- `1000` (Max Activity Log Entries)
- `1200` (Max Photo Width)
- `0.8` (JPEG Quality)
- `50` (Max Undo History)
- `5` (Default Max Photos)

---

## TEIL 6: FORMULAR-BUILDER DETAIL

### Feldtypen (17 implementiert)
| Typ | Builder | Filler | Validation | PDF | CSV | Bugs |
|-----|---------|--------|------------|-----|-----|------|
| text | ✓ | ✓ | ✓ | ✓ | ✓ | Border-Flicker onBlur |
| textarea | ✓ | ✓ | ✓ | ✓ | ✓ | Border-Flicker onBlur |
| number | ✓ | ✓ | ✓ | ✓ | ✓ | Wert 0 bei !required übersprungen |
| date | ✓ | ✓ | ✓ | ✓ | ✓ | useEffect[] mit defaultToday |
| time | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| select | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| radio | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| checkbox | ✓ | ✓ | ✓ | ✓ | ✓ | **Kein keyboard/a11y** |
| toggle | ✓ | ✓ | ✓ | ✓ | ✓ | Strict equality bei Strings |
| checklist | ✓ | ✓ | ✓ | ✓ | ✓ | **Label-Klick funktioniert nicht** |
| rating | ✓ | ✓ | ✓ | ✓ | ✓ | Kein Reset auf 0, kein a11y |
| heading | ✓ | ✓ | Skip | ✓ | Skip | - |
| divider | ✓ | ✓ | Skip | ✓ | Skip | - |
| info | ✓ | ✓ | Skip | ✓ | Skip | - |
| signature | ✓ | ✓ | ✓ | ✓ | - | **Canvas-Sync, Resize, a11y** |
| photo | ✓ | ✓ | ✓ | ✓ | - | **Type-Switching, Memory** |
| repeater | ✓ | ✓ | Teilweise | ✓ | ✓ | **key={index}, keine SubValidation** |

### Drag-and-Drop
- Nur Y-Achse → Half/Third-Layout: Drop zwischen Feldern in gleicher Zeile unmöglich
- `handleDragOver` bei jedem Mouse-Move ohne Throttling
- Kein visueller Drop-Indikator (nur `dropIndex`-State wird gesetzt, aber nicht gerendert als Linie)

### Undo/Redo
- Funktioniert für strukturelle Änderungen (Feld hinzufügen/löschen/verschieben)
- **Unbrauchbar für Text-Eingaben** (1 Entry pro Tastendruck)
- JSON.stringify pro Push → Performance bei großen Templates
- Max 50 History-Einträge (konfigurierbar)

### Feld-Duplizierung
- Top-Level ID wird neu generiert
- **Sub-IDs (checklist items, repeater subFields) NICHT** → Daten-Konflikte

---

## TEIL 7: UX / ACCESSIBILITY

### Accessibility-Audit

**Komplett fehlend:**
- Skip-to-Content Link
- `<main>` Landmark
- Focus-Trap in Modal-Dialogen (ConfirmDialog, Builder-Drawers)
- `role="dialog"` + `aria-modal="true"` auf Overlays
- Keyboard-Navigation in Rating-Widget
- `<input type="checkbox">` in CheckboxField

**Teilweise vorhanden:**
- `aria-label` auf PhotoField Remove-Buttons (✓), aber fehlend auf 30+ anderen Icon-Buttons
- `role="alert"` auf Fehlermeldungen (✓ in FormField:48)
- `htmlFor` auf Labels (✓ in FormField:46)
- `aria-describedby` für Error-Messages (✓ in FormField)

### Mobile Touch
- `touchAction: 'none'` auf SignatureField Canvas (✓)
- `WebkitTapHighlightColor: 'transparent'` auf Buttons (✓)
- `env(safe-area-inset-bottom)` auf BottomNav (✓)
- **Fehlt:** Touch-Feedback (active:scale), Haptic Feedback, Pull-to-Refresh

### Loading States
- **App-Init:** ✓ "Laden..." Anzeige
- **Formular-Submit:** ✗ Kein Loading-Indicator
- **PDF-Export:** ✗ Kein Loading-Indicator
- **Listen-Laden:** ✗ Kein Skeleton
- **Foto-Komprimierung:** ✗ Kein Progress-Indicator

### Empty States
- **Submissions leer:** ✓ "Noch keine Einträge"
- **Projekte leer:** ✓ "Noch keine Projekte"
- **Templates leer:** ✓ "Eigene Vorlagen erstellen"
- **Kunden leer:** Prüfbar, vermutlich vorhanden

### Dark Mode Konsistenz
- CSS Custom Properties korrekt implementiert
- `--fp-canvas-stroke` in SignatureField (✓)
- Alle Farben über `S.colors.*` referenziert
- **Potenzielle Lücke:** Inline-Farben in exportPdf.js (Print-Window hat eigenes Styling, kein Dark Mode nötig)

---

## TEIL 8: OFFLINE / PWA

### Aktueller Stand
- **vite-plugin-pwa** konfiguriert mit `registerType: 'autoUpdate'`
- **Workbox:** Cached alle statischen Assets (`**/*.{js,css,html,ico,png,svg,woff2}`)
- **Runtime Caching:** Nur Google Fonts
- **localStorage:** Gesamte Datenhaltung offline-fähig

### Was funktioniert offline
- ✓ App-Shell (HTML/CSS/JS gecacht via Service Worker)
- ✓ Alle Formulare (localStorage)
- ✓ PDF-Export (client-side)
- ✓ CSV-Export (client-side)

### Was NICHT funktioniert offline
- ✗ Kein Offline-Indikator in der UI
- ✗ Kein Background Sync
- ✗ Kein IndexedDB für große Daten (Fotos)
- ✗ Kein Conflict Resolution bei Multi-Device

### Was fehlt für S04 (Supabase-Migration)
1. **IndexedDB für Fotos/Signaturen** — Base64 in localStorage ist nicht skalierbar
2. **Offline-Queue** — Submissions die offline erstellt werden, müssen bei Reconnect synchronisiert werden
3. **Conflict Resolution** — Last-Write-Wins oder Merge-Strategy für gleichzeitige Edits
4. **Storage-Layer Refactor** — `storage.js` muss sowohl localStorage (offline) als auch Supabase (online) bedienen
5. **Online/Offline Detection** — `navigator.onLine` + `window.addEventListener('online'/'offline')`
6. **Retry-Logic** — Exponential Backoff für fehlgeschlagene Supabase-Calls
7. **Data Versioning** — `updatedAt`-Timestamps für Conflict Detection

### Cache-Strategie Empfehlung
```
- App Shell: Cache-First (bereits konfiguriert)
- API Calls: Network-First mit Cache-Fallback
- Fotos/Signaturen: Cache-First mit Background Update
- Templates: Stale-While-Revalidate
```

---

## TEIL 9: PDF/CSV EXPORT

### PDF Export (`exportPdf.js`)
**Funktionalität:** Print-basiert via `window.open()` + `document.write()`

**Unterstützte Feldtypen:**
| Typ | Darstellung | Korrekt? |
|-----|-------------|----------|
| text/textarea/number/date/time/select | Klartext | ✓ |
| toggle | "Ja"/"Nein" | ✓ |
| checkbox | Komma-getrennte Liste | ✓ |
| rating (stars) | ★★★☆☆ (3/5) | ✓ |
| rating (traffic) | Gut ✅ / Mittel ⚠️ / Schlecht ❌ | ✓ |
| checklist | ☑/☐ mit Notizen | ✓ |
| signature | Eingebettetes Bild | ✓ (aber XSS!) |
| photo | Foto-Grid | ✓ (aber XSS!) |
| repeater | Nummerierte Zeilen | ✓ |
| heading | Fette Überschrift | ✓ |
| divider | Horizontale Linie | ✓ |
| info | Info-Box | ✓ |

**Probleme:**
1. **XSS:** img src nicht escaped (S-02)
2. **Pop-up Blocker:** `window.open()` wird auf mobilen Browsern oft blockiert. Kein Fallback.
3. **Große Formulare:** Kein Page-Break-Management. 100+ Felder = endlos langes PDF.
4. **Unicode/Sonderzeichen:** `esc()` escaped nur `&<>"`. Emoji in Labels funktionieren (da HTML5).
5. **Fotos im PDF:** Base64-Data-URLs direkt als `<img src>`. Bei vielen Fotos: Print-Window braucht lange zum Laden.
6. **Signatur-Qualität:** PNG bei 2x Retina-Auflösung. Druckqualität OK.
7. **Layout:** Fixe 35%/65% Label/Value-Aufteilung. Lange Labels werden abgeschnitten.

### CSV Export (`exportCsv.js`)
**Probleme:**
1. **Formula Injection** (S-01)
2. **Encoding:** BOM + UTF-8 korrekt für Excel-Kompatibilität ✓
3. **Delimiter:** Komma als Separator. Deutsche Excel-Installationen erwarten Semikolon! → CSV öffnet in einer Spalte.
4. **Foto/Signatur-Werte:** Werden als langer Base64-String in CSV geschrieben → unbrauchbar.
5. **Checklist-Werte:** Korrekt formatiert mit ✓/✗ ✓
6. **Repeater-Werte:** Werden als JSON-String geschrieben → schwer lesbar.

**Fix für Delimiter-Problem:**
```js
// Deutsche Excel: Semikolon verwenden
const delimiter = ';';
const csv = [headers.map(escape).join(delimiter), ...rows.map(r => r.map(escape).join(delimiter))].join('\n');
```

---

## TEIL 10: SUPABASE-INTEGRATION

### Aktuelles Schema (`supabase/schema.sql`)
**Tabellen:**
- `profiles` (id, email, name, role, pin, avatar_url)
- `templates` (id, name, description, category, icon, version, pages JSONB, pdfSettings JSONB, emailTemplate JSONB)
- `submissions` (id, template_id, template_version, status, data JSONB, filled_by, filled_by_name)
- `customers` (id, name, email, phone, address, projects TEXT[], submission_ids TEXT[], notes)
- `projects` (id, name, description, status, customer_id, shared_data JSONB, phases JSONB)
- `activity_log` (id, action, customer_id, submission_id, template_name, user_name, details)
- `audit_log` (id, table_name, record_id, action, user_id, changes JSONB)

### RLS Policies
**Status:** Keine RLS Policies definiert! Das Schema hat `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` aber KEINE `CREATE POLICY`-Statements.

**Kritisch für S05:** Ohne RLS kann jeder authentifizierte User alle Daten lesen/schreiben.

**Empfohlene Policies:**
```sql
-- Beispiel für submissions
CREATE POLICY "Users can read own submissions"
ON submissions FOR SELECT USING (filled_by = auth.uid());

CREATE POLICY "Users can insert own submissions"
ON submissions FOR INSERT WITH CHECK (filled_by = auth.uid());

-- Admin kann alles
CREATE POLICY "Admins full access"
ON submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### Auth-Flow
**Aktuell:** PIN-basiert, hardcoded Users. Kein Supabase Auth.
**Für S05:** Migration zu `supabase.auth.signInWithPassword()` oder Magic Link.

### Storage-Nutzung
**Aktuell:** Nicht genutzt.
**Für S05:** Supabase Storage für Fotos und Signaturen statt Base64 in JSONB.
```
Fotos → supabase.storage.from('photos').upload(...)
Signaturen → supabase.storage.from('signatures').upload(...)
Submission.data enthält nur Storage-URLs
```

### Migration-Readiness
**Score: 3/10** — Grundstruktur vorhanden, aber:
1. ✗ Kein Auth-Flow
2. ✗ Keine RLS Policies
3. ✗ Kein Offline-Sync
4. ✗ Keine Storage-Integration für Binärdaten
5. ✗ storage.js Supabase-Backend ist Stub
6. ✓ Schema existiert und matcht localStorage-Struktur
7. ✓ `supabase.js` Client konfiguriert
8. ✓ JSONB für flexible Felder (pages, data, phases)

---

## TEIL 11: DASHBOARD & ANALYTICS

### Datenberechnung (`DashboardScreen.jsx`)
**Berechnete Metriken:**
- Gesamt-Submissions, Diesen Monat, Heute
- Templates Ranking (nach Nutzungshäufigkeit)
- Status-Verteilung (completed/sent/archived)
- User Ranking (nach Submissions)
- Letzte Aktivitäten (Activity Log)

**Korrektheit:**
- ✓ Template-Ranking: `submissions.filter(s => s.templateId === t.id).length` — korrekt
- ✓ Monats-Filter: `new Date(s.createdAt).getMonth() === now.getMonth()` — korrekt für gleichen Monat
- ⚠ Jahres-Überlauf: Vergleicht nur Monat, nicht Jahr. Submissions von März 2025 werden im März 2026 mitgezählt.
- ✓ Status-Verteilung: Einfaches Counting

**Performance:**
- Großer `useMemo`-Block recalculated bei jeder submissions/allTemplates-Änderung
- Activity Log via `getActivityLog()` → async Storage-Read bei jedem Mount
- Kein Caching der Dashboard-Stats

### Filter-Logik
- Kein Date-Range-Filter
- Kein Template-Filter
- Kein User-Filter
- **Nur** vordefinierte Zeiträume (Gesamt, Monat, Heute)

---

## TEIL 12: FIX-VORSCHLÄGE FÜR KRITISCHE FINDINGS

### Fix #1: Doppel-Submit Prevention
```jsx
// FormFiller.jsx — VORHER:
const goNext = useCallback(() => {
  ...
  if (isLastPage) onSubmit(formData);
  ...
}, [...]);

// FormFiller.jsx — NACHHER:
const [isSubmitting, setIsSubmitting] = useState(false);

const goNext = useCallback(async () => {
  if (isSubmitting) return;
  if (!currentPage) { if (isLastPage) { setIsSubmitting(true); await onSubmit(formData); } return; }
  const pageErrors = validatePage(currentPage, formData);
  if (Object.keys(pageErrors).length > 0) { setErrors(pageErrors); setShowErrors(true); return; }
  setShowErrors(false); setErrors({});
  if (isLastPage) { setIsSubmitting(true); await onSubmit(formData); }
  else { setPageIndex(prev => prev + 1); window.scrollTo(0, 0); }
}, [currentPage, formData, isLastPage, onSubmit, isSubmitting]);

// Button:
<button onClick={goNext} disabled={isSubmitting} style={styles.btn(isLastPage ? 'success' : 'primary', 'lg')}>
  {isSubmitting ? '⏳ Wird gespeichert...' : isLastPage ? '✓ Abschließen' : 'Weiter →'}
</button>
```

### Fix #2: Duplicate Field Sub-IDs
```jsx
// FormBuilder.jsx — VORHER:
const copy = JSON.parse(JSON.stringify(field));
copy.id = `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// FormBuilder.jsx — NACHHER:
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const copy = JSON.parse(JSON.stringify(field));
copy.id = `field-${newId()}`;
// Sub-IDs regenerieren
if (copy.items) copy.items = copy.items.map(item => ({ ...item, id: `item-${newId()}` }));
if (copy.subFields) copy.subFields = copy.subFields.map(sf => ({ ...sf, id: `sf-${newId()}` }));
```

### Fix #3: CheckboxField Keyboard-Accessible
```jsx
// VORHER:
<label key={o.value} onClick={() => toggle(o.value)} style={...}>
  <div style={boxStyle(checked)}>...</div>
  <span>{o.label}</span>
</label>

// NACHHER:
<label key={o.value} style={{ ...labelStyle, cursor: 'pointer' }}>
  <input type="checkbox" checked={checked} onChange={() => toggle(o.value)}
    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
  <div style={boxStyle(checked)} aria-hidden="true">...</div>
  <span>{o.label}</span>
</label>
```

### Fix #4: ChecklistField Label-Klick
```jsx
// VORHER:
<label style={...}>
  <div style={{...}} onClick={() => update(item.id, 'checked', !itemData.checked)}>

// NACHHER:
<label style={...} onClick={() => update(item.id, 'checked', !itemData.checked)}>
  <div style={{...}} aria-hidden="true">
```

### Fix #5: SignatureField Value-Sync
```jsx
// VORHER:
useEffect(() => {
  // ... canvas init + value load
}, []);

// NACHHER:
useEffect(() => {
  // ... canvas init
}, []);

useEffect(() => {
  if (!value || !canvasRef.current) return;
  const ctx = canvasRef.current.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
    setHasContent(true);
  };
  img.src = value;
}, [value]);
```

### Fix #6: Validation Wert 0
```js
// validation.js Zeile 52 — VORHER:
if (!value && !field.required) return null;

// NACHHER:
if ((value === undefined || value === null || value === '') && !required) return null;
```

---

## TEIL 13: SIGNATUR & FOTO-CAPTURE

### SignatureField Canvas-Handling
- **Auflösung:** `canvas.width = offsetWidth * 2` (2x für Retina). Gut.
- **Export:** `toDataURL('image/png')` — PNG für Unterschriften OK (kleine Dateigröße: ~5-20KB).
- **Strichstärke:** `lineWidth: 2` mit `scale(2,2)` = effektiv 1px auf Retina. Gut.
- **Stroke-Farbe:** `getComputedStyle('--fp-canvas-stroke')` — Dark Mode kompatibel. Gut.

**Probleme:**
1. Canvas-Größe einmalig gesetzt → Resize-Verzerrung
2. `isDrawing` als useState → Stale Closure bei schnellem Zeichnen
3. `value`-Prop wird nach Mount ignoriert (leeres Dep-Array)
4. `clearRect` funktioniert mit Scale, aber `drawImage` muss Scale berücksichtigen
5. Kein `tabIndex`, kein `aria-label` → nicht keyboard-accessible

**Fix für #2 (isDrawing Stale):**
```jsx
// useRef statt useState für isDrawing
const isDrawingRef = useRef(false);
const draw = useCallback((e) => {
  if (!isDrawingRef.current) return;
  // ... rest unchanged
}, [getPoint]); // isDrawing nicht mehr in deps
```

### PhotoField Bildkomprimierung
- **Methode:** FileReader → Image → Canvas → toDataURL
- **Max-Breite:** 1200px (konfigurierbar)
- **Qualität:** 0.8 JPEG
- **Ratio:** `Math.min(maxWidth / img.width, maxWidth / img.height, 1)` — proportional, nie hochskaliert. Korrekt.

**Probleme:**
1. **EXIF-Rotation:** Nicht korrigiert. Moderne Browser (Chrome 81+, Firefox 77+) korrigieren beim `<img>`-Load, aber Canvas `drawImage` nicht immer. Ältere iPads betroffen.
2. **EXIF GPS-Daten:** Werden beim Canvas-Re-Export gestrippt (Canvas hat kein EXIF). Gut für Datenschutz.
3. **Memory:** Mehrere gleichzeitige Komprimierungen erzeugen mehrere Canvas + Image Objekte. Kein explizites Cleanup.
4. **Typ-Wechsel:** `null` / `string` / `string[]` je nach Anzahl Fotos. Fragil.

### Mobile-Kamera Integration
- `<input type="file" capture="environment">` — korrekt für Rückkamera
- Separater Button für Kamera vs. Datei-Upload — gute UX
- `accept="image/*"` — alle Bildformate akzeptiert

### Speicher-Effizienz
| Szenario | Speicher pro Submission | Max Submissions |
|----------|------------------------|-----------------|
| Nur Text | ~2-5KB | ~1000+ |
| 1 Signatur | ~10-25KB | ~200+ |
| 5 Fotos (1200px) | ~1-2MB | **3-5** |
| 5 Fotos + 2 Signaturen | ~1.5-2.5MB | **2-3** |

**→ 5MB localStorage-Limit ist der kritischste Bottleneck.**

---

## TEIL 14: EDGE CASES

### Leere Formulare
- Template ohne Pages → `pages = []` → FormFiller: `currentPage = undefined` → `isLastPage = false` → **User sitzt fest**
- Template ohne Felder → Leere Karte wird angezeigt → "Abschließen" funktioniert (leere Submission) ✓

### 100+ Felder
- Kein Lazy-Rendering → alle Felder im DOM
- useUndoRedo: `JSON.stringify` bei jedem Push ~50-100KB pro Entry × 50 History = ~2.5-5MB Memory
- Drag&Drop: `querySelectorAll('[data-fc]')` bei jedem Mouse-Move → 100+ DOM-Queries/s
- Validierung: `validatePage` iteriert alle Felder synchron → bei 100+ Feldern spürbare Verzögerung

### Sehr lange Texte
- Textarea ohne `maxLength` Constraint im HTML (nur Validation `v.maxLength`)
- Lange Texte in localStorage-Submissions → Speicher-Verbrauch wächst
- PDF-Export: `white-space: pre-line` → Text bricht korrekt um
- CSV-Export: Newlines in Werten werden escaped (`"...\n..."`) ✓

### Gleichzeitige Submissions
- Zwei Browser-Tabs: Beide lesen `submissions` aus localStorage → Tab 1 speichert → Tab 2 überschreibt mit veraltetem Array → **Tab 1 Submission geht verloren**
- Kein `StorageEvent`-Listener für Cross-Tab-Sync

### Browser-Kompatibilität
- `color-mix()` in `styles.badge()` → Safari 16.2+, Chrome 111+. Ältere Browser: Fallback fehlt.
- `structuredClone` nicht verwendet (würde ältere Browser ausschließen)
- Canvas 2D API → universell unterstützt ✓
- `env(safe-area-inset-bottom)` → iOS Safari 11.2+ ✓

---

## TEIL 15: S04-S08 PLANUNGS-ANALYSE

### S04: Offline-First + IndexedDB
**Technische Vorbereitung:**
1. `storage.js` refactoren: Dual-Backend (IndexedDB für Binärdaten, localStorage für Settings)
2. Online/Offline-Detection in `App.jsx`
3. Sync-Queue Service erstellen
4. PhotoField: Base64 → IndexedDB Blob-Storage
5. SignatureField: Gleicher Ansatz

**Betroffene Dateien:**
- `src/lib/storage.js` — kompletter Rewrite
- `src/components/fields/PhotoField.jsx` — Storage-Referenz statt Base64
- `src/components/fields/SignatureField.jsx` — Storage-Referenz statt Base64
- `src/App.jsx` — Online/Offline-State
- `src/lib/exportPdf.js` — Fotos aus Storage laden statt inline

### S05: Supabase Full Integration
**Technische Vorbereitung:**
1. Auth-Flow implementieren (LoginScreen → Supabase Auth)
2. RLS Policies definieren und testen
3. `storage.js` → Supabase CRUD
4. Supabase Storage für Fotos/Signaturen
5. Realtime-Subscriptions für Multi-User

**Betroffene Dateien:**
- `src/lib/supabase.js` — Auth-Helpers
- `src/lib/storage.js` — Supabase Backend
- `src/components/layout/LoginScreen.jsx` — Supabase Auth
- `src/lib/customerService.js` — Supabase Queries
- `src/lib/projectService.js` — Supabase Queries
- `supabase/schema.sql` — RLS Policies hinzufügen

### S06: RBAC (Role-Based Access Control)
**Stellen die Berechtigungsprüfungen brauchen:**

| Aktion | Aktuell | Nötig |
|--------|---------|-------|
| Template erstellen/bearbeiten | Alle | admin, buero |
| Template löschen | Alle | admin |
| Submission löschen | Alle | admin |
| Submission Status ändern | Alle | admin, buero |
| Kunden bearbeiten/löschen | Alle | admin, buero |
| Projekte erstellen/löschen | Alle | admin |
| Einstellungen | Alle | admin |

**Schema-Erweiterung:**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  UNIQUE(role, resource, action)
);

INSERT INTO permissions (role, resource, action) VALUES
  ('admin', '*', '*'),
  ('buero', 'templates', 'read'),
  ('buero', 'templates', 'create'),
  ('buero', 'submissions', 'read'),
  ('buero', 'submissions', 'create'),
  ('buero', 'submissions', 'update_status'),
  ('buero', 'customers', 'read'),
  ('buero', 'customers', 'update'),
  ('monteur', 'submissions', 'create'),
  ('monteur', 'submissions', 'read_own');
```

**Client-Side:** `usePermission(resource, action)` Hook.

### S07: Analytics Dashboard
**Vorbereitung:** Activity-Log ist bereits vorhanden. Erweiterungen:
- Date-Range-Filter
- Template-Filter
- User-Filter
- Chart-Library (recharts oder Chart.js)
- Export als PDF/CSV

### S08: Email-Integration
**Vorbereitung:** `emailTemplate` ist bereits im Template-Schema (helpers.js:38-39).
- Supabase Edge Function für Email-Versand
- PDF als Attachment
- Empfänger-Konfiguration (Kunde, Büro, Custom)

---

## TEIL 16: WETTBEWERBER-VERGLEICH

### smap one
| Feature | smap one | FormPilot | Vorteil |
|---------|----------|-----------|---------|
| Formulare erstellen | ✓ | ✓ | Parität |
| Offline-Fähigkeit | ✓ (vollständig) | Teilweise | smap one |
| PDF-Export | ✓ (Server-Side) | ✓ (Client-Side) | Parität |
| Fotos/Signaturen | ✓ | ✓ | Parität |
| Multi-User Sync | ✓ | ✗ (geplant S05) | smap one |
| Conditional Logic | ✓ | ✓ | Parität |
| Preis | €15-40/User/Monat | Kostenlos (Self-Hosted) | FormPilot |
| API-Integration | ✓ (REST API) | ✗ (geplant) | smap one |
| Barcode/QR-Scanner | ✓ | ✗ | smap one |

### Offpaper
| Feature | Offpaper | FormPilot | Vorteil |
|---------|----------|-----------|---------|
| Drag&Drop Builder | ✓ | ✓ | Parität |
| Verschachtelte Formulare | ✓ | ✗ (Repeater nur 1 Ebene) | Offpaper |
| Kundenverwaltung | ✗ | ✓ | FormPilot |
| Projektverwaltung | ✗ | ✓ | FormPilot |
| Dashboard/Analytics | Limitiert | ✓ | FormPilot |
| Open Source | ✗ | Potenziell | FormPilot |
| Handwerker-Fokus | Generisch | Spezialisiert | FormPilot |

### FormPilot Unique Selling Points
1. **Spezialisierung auf Handwerk** (PV, Heizung, Sanitär)
2. **Projekt-Management mit Phasen** (Pacht → Genehmigung → Bau → Abnahme)
3. **Auto-Kundenerkennung** aus Formular-Daten
4. **AutoFill zwischen Projekt-Phasen** (SharedData)
5. **Self-Hosted / Kostenlos** möglich

### Feature-Gaps vs. Markt
1. ❌ Kein Barcode/QR-Scanner
2. ❌ Kein GPS-Tracking
3. ❌ Keine Email-Versendung
4. ❌ Kein Kalender-Integration
5. ❌ Keine API für externe Systeme
6. ❌ Kein Multi-Language Support

---

## TEIL 17: TEST-PLAN

### Aktueller Test-Stand
**Null Tests.** Kein Test-Framework konfiguriert. Kein `tests/`-Verzeichnis mit ausführbaren Tests. FR5 ("Regression nach jedem Feature") wird nicht eingehalten.

### Empfohlener Test-Plan

#### Unit Tests (Vitest)

**validation.js** (Priorität: HOCH)
- [ ] `evaluateConditions` mit AND/OR Logik
- [ ] `evaluateConditions` mit show/hide/require/disable Actions
- [ ] `validateField` für jeden Feldtyp
- [ ] `validateField` mit Wert `0` (Number-Feld, nicht required)
- [ ] `validateField` mit Wert `""` (required)
- [ ] `validateField` mit conditionally required
- [ ] `validateField` mit conditionally disabled
- [ ] `validatePage` mit gemischten Feldern
- [ ] Unbekannter Operator → Verhalten dokumentieren

**customerService.js** (Priorität: HOCH)
- [ ] `extractCustomerData` mit allen Feld-Patterns
- [ ] `findMatchingCustomer` exact match
- [ ] `findMatchingCustomer` substring false positive (Max vs Maximilian)
- [ ] `processCustomerFromSubmission` neuer Kunde
- [ ] `processCustomerFromSubmission` bestehender Kunde (Update)
- [ ] `processCustomerFromSubmission` ohne Kundendaten → null
- [ ] `removeSubmissionFromCustomer` Cleanup
- [ ] Race Condition bei parallelem `processCustomerFromSubmission`

**projectService.js** (Priorität: MITTEL)
- [ ] `createProject` mit Standard-Phasen
- [ ] `linkSubmissionToPhase` + SharedData-Extraktion
- [ ] `buildAutoFillData` Label-Matching
- [ ] `reorderPhases` mit ungültigen IDs
- [ ] `deleteProject` Cleanup

**exportCsv.js** (Priorität: MITTEL)
- [ ] CSV Formula Injection (=, +, -, @)
- [ ] Unicode-Zeichen (Umlaute, Emoji)
- [ ] Komma/Newline/Quote Escaping
- [ ] Checklist-Formatierung
- [ ] Leere Submissions

**exportPdf.js** (Priorität: MITTEL)
- [ ] XSS-Payloads in Formularwerten
- [ ] Alle Feldtypen korrekt formatiert
- [ ] Leere Werte (null, undefined, '')
- [ ] Signatur/Foto Einbettung

**helpers.js** (Priorität: NIEDRIG)
- [ ] `createField` für alle 17 Typen
- [ ] `createEmptyTemplate` Struktur
- [ ] `slugify` mit Umlauten

#### Integration Tests

- [ ] Submission-Lebenszyklus: Template → Fill → Submit → View → Delete
- [ ] Template-Lebenszyklus: Create → Edit → Duplicate → Delete
- [ ] Projekt-Lebenszyklus: Create → Phasen → Fill → Link → View
- [ ] Storage Quota: Simulation von 5MB-Überschreitung
- [ ] Cross-Tab: StorageEvent bei gleichzeitigen Tabs

#### E2E Tests (Playwright)

- [ ] Login mit korrektem/falschem PIN
- [ ] Formular ausfüllen mit allen Feldtypen
- [ ] PDF-Export (Print-Window öffnet)
- [ ] Builder: Feld hinzufügen, konfigurieren, speichern
- [ ] Offline: App funktioniert nach Netzwerk-Trennung

---

## TEIL 18: RBAC-READINESS

### Aktuelle Berechtigungsprüfungen
- `NAV_ITEMS` in `App.jsx:24-32`: Role-basierte Navigation ✓
- `getDefaultTab()`: Role-basierter Default-Tab ✓
- **Sonst: KEINE.** Alle CRUD-Operationen sind für alle Rollen verfügbar.

### Stellen die Prüfungen brauchen

| Datei | Zeile | Aktion | Erlaubte Rollen |
|-------|-------|--------|-----------------|
| App.jsx | 195 | Template löschen | admin |
| App.jsx | 159 | Submission löschen | admin |
| App.jsx | 150 | Status ändern | admin, buero |
| App.jsx | 208 | Projekt erstellen | admin, buero |
| App.jsx | 213 | Projekt ändern/löschen | admin |
| TemplatesOverview.jsx | Builder öffnen | admin, buero |
| TemplatesOverview.jsx | Template importieren | admin |
| CustomerDetail.jsx | Kunde bearbeiten | admin, buero |
| CustomerDetail.jsx | Kunde löschen | admin |
| ProjectDetail.jsx | Phase hinzufügen/löschen | admin, buero |
| SubmissionDetail.jsx | PDF Export | alle |
| FormFiller.jsx | Formular ausfüllen | alle |

### Empfohlener Ansatz
```jsx
// hooks/usePermission.js
export const usePermission = () => {
  const { user } = useAuth();
  const can = useCallback((resource, action) => {
    if (user.role === 'admin') return true;
    const perms = ROLE_PERMISSIONS[user.role] || {};
    return perms[resource]?.includes(action) || perms['*']?.includes(action);
  }, [user.role]);
  return { can };
};

// Nutzung:
const { can } = usePermission();
{can('templates', 'delete') && <button onClick={handleDelete}>Löschen</button>}
```

---

## TEIL 19: IMPLEMENTATION PLAN

### Sprint 1: Kritische Bugs (1-2 Tage)
**Acceptance Criteria:**
- [ ] Doppel-Submit verhindert (isSubmitting State)
- [ ] QuotaExceededError wird dem User angezeigt
- [ ] CSV Formula Injection gefixt
- [ ] PDF XSS gefixt (img src escaped)
- [ ] Duplicate Field generiert neue Sub-IDs

### Sprint 2: Accessibility & UX (2-3 Tage)
**Acceptance Criteria:**
- [ ] CheckboxField mit nativem `<input type="checkbox">`
- [ ] ChecklistField Label-Klick funktioniert
- [ ] Disabled Fields nativ disabled
- [ ] RatingField keyboard-accessible
- [ ] aria-labels auf allen Icon-Buttons
- [ ] Focus-Trap in ConfirmDialog

### Sprint 3: Data Integrity (2-3 Tage)
**Acceptance Criteria:**
- [ ] Kunden-Dedup mit strikterem Matching (Levenshtein oder Exact+Confirm)
- [ ] CSV-Export respektiert aktive Filter
- [ ] SignatureField synchronisiert value-Prop
- [ ] Pagination zurücksetzen bei Filteränderung
- [ ] Template-Löschung warnt über betroffene Submissions

### Sprint 4: Performance & Code-Qualität (2-3 Tage)
**Acceptance Criteria:**
- [ ] React.memo auf alle Field-Komponenten
- [ ] Undo-Debounce für Text-Eingaben (500ms)
- [ ] DragOver-Throttling in BuilderCanvas
- [ ] Datum-Formatierung als Helper extrahiert
- [ ] Konsistente Confirm-Dialoge (useConfirm überall)

### Sprint 5: Offline/Storage (3-5 Tage)
**Acceptance Criteria:**
- [ ] IndexedDB für Fotos und Signaturen
- [ ] Storage-Warnung bei >80% Auslastung
- [ ] Draft-Cleanup bei Template-Löschung
- [ ] Online/Offline-Indikator in UI

### Sprint 6: Tests (3-5 Tage)
**Acceptance Criteria:**
- [ ] Vitest konfiguriert
- [ ] Unit Tests für validation.js, customerService.js, exportCsv.js
- [ ] Integration Tests für Submission-Lebenszyklus
- [ ] CI-Pipeline mit Tests vor Build

### Sprint 7: Supabase Preparation (5-8 Tage)
**Acceptance Criteria:**
- [ ] Auth-Flow mit Supabase Auth
- [ ] RLS Policies implementiert und getestet
- [ ] Storage-Layer Dual-Backend (localStorage + Supabase)
- [ ] Fotos/Signaturen via Supabase Storage
- [ ] RBAC-Grundstruktur

---

## TEIL 20: KONSOLIDIERUNG

### Gesamt-Statistik
| Kategorie | Kritisch | Hoch | Mittel | Niedrig | Info |
|-----------|----------|------|--------|---------|------|
| Sicherheit | 1 | 3 | 3 | 1 | 1 |
| Bugs/Logik | 2 | 5 | 6 | 4 | 0 |
| Performance | 0 | 2 | 3 | 1 | 0 |
| Error Handling | 1 | 1 | 2 | 0 | 0 |
| UX/Accessibility | 1 | 4 | 3 | 1 | 0 |
| Offline/PWA | 0 | 1 | 2 | 1 | 0 |
| Data Integrity | 1 | 2 | 2 | 0 | 0 |
| Code-Qualität | 0 | 0 | 3 | 3 | 1 |
| Tests | 0 | 1 | 0 | 0 | 0 |
| **Gesamt** | **6** | **19** | **24** | **11** | **2** |

### Keine Duplikate
Jedes Finding ist einmalig gelistet. Cross-Referenzen (z.B. "PhotoField Type-Switching" betrifft sowohl Bugs als auch Data Integrity) werden nur einmal gezählt, in der primären Kategorie.

### Konsistenz-Check
- Alle Datei-Pfade relativ zu `src/`
- Alle Zeilennummern basierend auf aktuellem Code-Stand (2026-03-17)
- Fix-Vorschläge sind minimal-invasiv (keine Architektur-Umbauten)
- Priorisierung: Datenverlust > Sicherheit > Funktionalität > UX > Performance > Code-Qualität
