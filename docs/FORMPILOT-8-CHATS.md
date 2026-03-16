# FormPilot — 8-Chat-Plan für Claude Code

**Optimiert für:** Claude Code mit API-Zugang, maximale Nutzung pro Session
**Prinzip:** Weniger Chats, mehr pro Session, klare Schnittgrenzen

---

## Chat-Übersicht

| Chat | Thema | Merged | Komplexität | ~Zeilen |
|------|-------|--------|-------------|---------|
| **S01** | Builder Polish + Performance-Fundament | C03 | 🟡 | +500 |
| **S02** | Signatur + Foto + Kamera | C04 | 🟡 | +600 |
| **S03** | PDF + Email + Dashboard + CSV | C05+C06 | 🔴 | +900 |
| **S04** | Offline + Vorlagen-Bibliothek | C07 | 🔴 | +600 |
| **S05** | LagerPilot-Bridge + Berechtigungen | C08+C09 | 🔴 | +900 |
| **S06** | Erweiterte Felder + Repeater | C12 | 🔴 | +800 |
| **S07** | Analytics + Branding + Dark Mode | C10+C11 | 🟡 | +700 |
| **S08** | Automationen + API + Performance + Final | C13+C14+C15 | 🔴 | +600 |

**Gesamt: ~5600 Zeilen Delta → Enddatei ~7100 Zeilen**

```
S01 ──► S02 ──► S03 ──► S04 ──► S05 ──► S06 ──► S07 ──► S08
(strikt linear — jeder Chat baut auf dem vorherigen auf)
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 0 — PROJEKTSTART (einmalig, vor S01)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```markdown
# FormPilot — Projektstart mit Claude Code

Du baust FormPilot — einen Formular-Generator für Handwerksbetriebe 
(à la smap one / Offpaper). Die App wird als standalone React-App entwickelt 
und später als Modul in LagerPilot (unsere Lagerverwaltung) integriert.

## Projektstand
- Core Engine + Filler: ✅ (14 Feldtypen, Conditional Logic, Validation, Drafts)
- Builder Grundgerüst: ✅ (Drag&Drop, Settings-Panel, Speichern)
- Aktueller Code: formpilot-2-2.jsx (1517 Zeilen, Single-File React JSX)

## Aufgabe: Projektstruktur anlegen

```
~/projects/formpilot/
├── CLAUDE.md              # Projekt-Anweisungen (erstellen!)
├── src/
│   └── formpilot.jsx      # Arbeitsdatei (Kopie von formpilot-2-2.jsx)
├── versions/
│   └── formpilot-v2.jsx   # Backup Ausgangscode
├── docs/
│   ├── HANDOVER.md         # Übergabe-Dokument (liegt bei)
│   ├── masterprompt.md     # Architektur-Referenz (liegt bei)
│   └── C00-uebersicht.md   # Regeln + Schema (liegt bei)
└── prompts/
    └── (werden pro Chat angelegt)
```

## CLAUDE.md Inhalt:

```
# FormPilot

Digitaler Formular-Generator für Handwerksbetriebe.
Single-File React JSX. Wird später in LagerPilot eingebettet.

## Regeln (NIEMALS brechen)
FR1: Modular. Neue Features als Hooks/Komponenten. NIE Bestehendes umschreiben.
     Marker: // ═══ FEATURE: [Name] (SXX) ═══
FR2: Feature-Flags: fp_{name}. undefined → deaktiviert.
FR3: Schema abwärtskompatibel. Fallbacks für alles.
FR4: LagerPilot-kompatibel (S-Objekt, Auth, Offline-Queue).
FR5: Daten-Isolation. LagerPilot nur READ-ONLY.
FR6: Regression nach jedem Feature.
FR7: Am Ende: KOMPLETTER lauffähiger Code.

## Performance (IMMER)
P1: React.memo auf Komponenten die Props empfangen + oft re-rendern.
P2: useCallback auf Event-Handler die als Props weitergegeben werden.
P3: useMemo auf teure Berechnungen (Filterung, Parsing, Validierung).
P4: Style-Objekte AUSSERHALB Render-Funktionen definieren.
P5: Listen >20 Items → Pagination oder Virtualisierung.
P6: Debounce auf Text-Inputs die State triggern (300ms).
P7: Lazy Loading für schwere Komponenten (Builder, PDF, Analytics).
P8: Bilder <500KB, Thumbnails für Listen.
P9: Storage-Ops IMMER async, NIE im Render-Pfad.
P10: State so nah wie möglich an der Nutzung.

## Demo-User
Admin: PIN 1234 | Monteur: PIN 5678 | Büro: PIN 9999

## Workflow
1. Feature implementieren in src/formpilot.jsx
2. Regression prüfen
3. Backup nach versions/formpilot-vX.jsx
4. Feature-Flags in SettingsScreen aktualisieren
```

Richte alles ein, bestätige die Struktur.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S01 — BUILDER POLISH + PERFORMANCE-FUNDAMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S01 Masterprompt

```markdown
# S01: Builder Polish + Performance-Fundament

## Basis: src/formpilot.jsx (1517 Zeilen). Regeln FR1–FR7, P1–P10.

## Features (alle implementieren)

### 1. Live-Vorschau
- Button "👁 Vorschau" in Builder-Toolbar
- FormFiller rendert aktuelles Schema (READ-ONLY, debounced 300ms)
- Device-Toggle: Phone (360px) / Tablet (768px) / Desktop (100%)
- Desktop: Split-View Option (Canvas links, Vorschau rechts)
- Mobile: Fullscreen-Overlay
- Klick in Vorschau auf Feld → selektiert es im Canvas (bidirektional)

### 2. Undo/Redo
- Custom Hook useUndoRedo: past[], present, future[]
- JSON-Snapshots, max 30 Schritte, FIFO
- Snapshot bei: Feld add/delete/move/update, Seite add/delete/rename
- Toolbar-Buttons mit Disabled-State + Count-Badge
- Ctrl+Z / Ctrl+Shift+Z (⌘ auf Mac)

### 3. Feld-Duplikation
- Button 📋 in BuilderFieldCard + Ctrl+D
- Deep-Clone mit neuen IDs (field.id, options[].value, items[].id)
- Label + " (Kopie)", eingefügt direkt nach Original

### 4. Keyboard Shortcuts
- Ctrl+S: Speichern
- Ctrl+Z / Ctrl+Shift+Z: Undo/Redo
- Ctrl+D: Duplizieren
- Delete: Feld löschen
- Escape: Auswahl aufheben
- Ctrl+P: Vorschau toggle
- Alle mit ⌘ statt Ctrl auf Mac (e.metaKey)

### 5. Schema-Validierung beim Speichern
- ❌ Name fehlt
- ❌ Seite ohne Felder
- ⚠️ Feld ohne Label (Warnung, nicht blockierend)
- ❌ Zirkuläre Bedingungen erkennen
- ❌ Bedingung referenziert gelöschtes Feld
- Toast mit Details + Scroll zum Problem

### 6. Performance-Fundament (KRITISCH)
- React.memo auf: BuilderFieldCard, BuilderPalette, FormField, 
  ChecklistField, RatingField, SubmissionsList
- useCallback auf: alle onChange/onClick die als Props durchgereicht werden
- useMemo auf: allFields, activeFields, selectedField Ableitungen
- Style-Objekte: Aus Render raus, als Konstanten oder useMemo
- Debounce: Builder-Settings Texteingaben (Label, Placeholder) → 300ms
- Test: 50 Felder im Canvas → kein Scroll-Lag

### 7. Kleine UX-Verbesserungen
- Auto-Select + Auto-Focus Label bei neuem Feld
- Half/Third-Felder nebeneinander im Canvas (Flexbox-Row)
- Options-Editor: Enter=neue Option, Backspace=löschen (>2)
- Quick-Add Button am Canvas-Ende (6 häufigste Typen)
- Drag-Indikator: 2px blau mit ●-Endpunkten

## Akzeptanzkriterien (62 Punkte)
→ Alle aus der HANDOVER.md Sektion 10 + folgende:
- 50 Felder → kein Lag
- Vorschau zeigt Conditional Logic korrekt
- Undo nach Speichern → alte Version wiederherstellbar
- Gespeichertes Template im Filler komplett ausfüllbar
- Regression: Login, Nav, Filler, Submissions, Drafts

## Output
src/formpilot.jsx + versions/formpilot-v3.jsx
```

## S01 Folgeprompt

```markdown
# S01 Folgeprompt: Prüfung + Verbesserung

1. Gehe JEDES der 62 Akzeptanzkriterien durch. Bug? → Listen + Fixen.
2. Edge-Cases prüfen:
   - 0 Felder → Platzhalter
   - 50 Felder → Performance
   - 10 Seiten → Tabs wrapping
   - Bedingung auf Feld anderer Seite
   - Label 200 Zeichen → Ellipsis
   - Speichern während Auto-Save → kein Race
3. Performance-Audit: Jede Komponente prüfen — memo, callback, memoized styles?
4. ALLE Bugs fixen → finalen Code ausgeben.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S02 — SIGNATUR + FOTO + KAMERA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S02 Masterprompt

```markdown
# S02: Signatur + Foto + Kamera

## Basis: src/formpilot.jsx (Stand S01). Regeln FR1–FR7, P1–P10.

### 1. SignatureField
- Canvas-basiert mit Pointer Events (pointerdown/move/up)
- Bézier-Kurven für smooth lines (quadraticCurveTo)
- Liniendicke variiert mit Geschwindigkeit (schnell=dünn, langsam=dick)
- Retina: canvas.width = el.clientWidth * devicePixelRatio
- Undo: Strokes als Array, letzte entfernen + Canvas neu zeichnen
- Clear: Canvas leeren (mit "Wirklich löschen?" Confirm)
- Bestätigen: Canvas sperren, grüner Rahmen, Timestamp anzeigen
- "Signatur ändern": entsperrt Canvas
- Export: toDataURL('image/png') → Base64 → im formData speichern
- Draft-Save: Base64 in window.storage (groß aber funktional)
- touch-action: none auf Canvas (kein Page-Scroll beim Zeichnen!)
- Min-Höhe: 200px, responsive Breite

### 2. PhotoField
- Zwei Modi: Kamera (getUserMedia) + Datei-Upload (File-Picker)
- Kamera: navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  → Video-Element → Canvas-Capture → Base64
- Fallback: Wenn getUserMedia nicht verfügbar → nur File-Picker
- Kompression: Canvas resize auf max 1200px Breite, JPEG quality 0.7 → <500KB
- Thumbnail-Grid: 80x80px Previews, Klick → Lightbox
- Lightbox: Vollbild-Overlay, Swipe/Pfeil auf Mobile, ✕ zum Schließen
- Caption: Optionales Textfeld pro Foto
- maxPhotos: Konfigurierbar (default 5), Button verschwindet bei Limit
- Löschen: ✕ auf Thumbnail, mit Confirm
- allowCamera: Toggle in Builder-Settings (default true)
- Stream-Cleanup: Kamera-Stream IMMER bei Unmount stoppen!
  tracks.forEach(track => track.stop())

### 3. Builder-Integration
- Signature + Photo in Palette AKTIVIEREN (bisher deaktiviert/🔒)
- Builder-Settings:
  - Signature: Label, Required
  - Photo: Label, Required, maxPhotos (Slider 1–10), allowCamera Toggle
- Vorschau zeigt Signature als leeren Canvas-Platzhalter
- Vorschau zeigt Photo als Upload-Platzhalter

### 4. Demo-Templates erweitern
- Baustellenabnahme: + 2 Signatur-Felder (Monteur, Kunde) auf Seite 3
- Baustellenabnahme: + 1 Foto-Feld (Mängel-Fotos, conditional bei Mängel=Ja)
- Servicebericht: + 1 Foto-Feld (Arbeitsergebnis)
- Mängelprotokoll: + 1 Foto-Feld (Mängel-Fotos)

### 5. Performance
- Kamera-Stream: Lazy init (erst bei Klick auf Kamera-Button)
- Fotos: Base64 nur in formData, Thumbnails via CSS object-fit
- Signatur: Canvas nur bei Sichtbarkeit initialisieren
- React.memo auf SignatureField + PhotoField

## Akzeptanzkriterien
1-13: Signatur (Canvas, Touch, Maus, Smooth, Undo, Clear, Confirm, Export, 
      Required, 2 unabhängige Felder, Resize, Draft-Save)
14-22: Foto (Kamera, Kompression, Thumbnail, Lightbox, Caption, maxPhotos, 
       Löschen, allowCamera, Stream-Cleanup)
23-27: Builder (Palette aktiv, Settings korrekt, Vorschau)
28-31: Demo-Templates (Signatur + Foto Felder vorhanden, ausfüllbar)
32-40: Regression S01 (Login, Nav, Builder, Filler, Conditional, Validation, 
       Drafts, Submissions, Vorschau, Undo/Redo)

## Output
src/formpilot.jsx + versions/formpilot-v4.jsx
```

## S02 Folgeprompt

```markdown
# S02 Folgeprompt
1. Alle 40 Kriterien prüfen.
2. Edge-Cases: Signatur auf 320px Breite, 10 Fotos à 5MB, Kamera-Permission 
   verweigert, Canvas Pointer vs Scroll, Stream-Cleanup bei schnellem Tab-Wechsel.
3. Performance: Foto-Kompression blockiert nicht den Main-Thread?
4. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S03 — PDF + EMAIL + DASHBOARD + CSV
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S03 Masterprompt

```markdown
# S03: PDF + Email + Dashboard + CSV

## Basis: src/formpilot.jsx (Stand S02). Regeln FR1–FR7, P1–P10.
## Merged: C05 (PDF) + C06 (Email+Dashboard)

### Teil A: PDF-Generierung

#### Ansatz: HTML→Print
- Generiere professionelles HTML-Dokument
- Öffne in neuem Fenster/iframe → Browser-Print-Dialog (Speichern als PDF)
- @media print CSS für saubere Ausgabe

#### Layout (A4, professionell — wird an Kunden versendet!)
- Header: Logo-Platzhalter (60x60 grauer Kasten) + Formularname + Datum
- Metadaten-Box: Kategorie, Version, Monteur, Status — abgerundete Box
- Akzentfarbe aus pdfSettings durchgängig (Header-Linie, Überschriften, Häkchen)
- Zebra-Stripes auf Feld-Zeilen (abwechselnd leicht grau)
- Footer: Seitenzahlen + "Erstellt mit FormPilot" + Timestamp
- page-break-inside: avoid auf Feld-Container
- Wasserzeichen "ENTWURF" diagonal bei Drafts

#### Feldtypen im PDF
- text/textarea/number: Label links, Wert rechts (oder darunter bei langen Texten)
- date/time: Deutsches Format (TT.MM.JJJJ / HH:MM)
- select/radio: Gewählte Option als Text (Label, nicht Value)
- checkbox: Alle gewählten Optionen komma-separiert
- toggle: "Ja"/"Nein" als farbiges Badge (grün/rot)
- checklist: Tabelle mit ✅/❌ pro Item + Notizen-Spalte
- rating stars: ★★★☆☆ (gefüllt + leer)
- rating traffic: Farbiger Kreis mit Label
- signature: Bild (Base64 → <img>), Label darunter, Datum
- photo: Grid (2 pro Zeile), abgerundete Ecken, Caption darunter
- heading: Als fette Überschrift mit Akzentfarbe
- Conditional fields: Ausgeblendete Felder → NICHT im PDF!

#### Submission-Detail-View
- Klick auf Submission in Liste → Detail-Ansicht
- Alle Felder mit Werten (read-only, wie Filler aber ohne Eingabe)
- Signaturen als Bilder, Fotos als Galerie
- "📄 PDF erstellen" Button → öffnet PDF-Vorschau
- "← Zurück zur Liste" Button

### Teil B: Email-Versand (simuliert)

- E-Mail-Dialog (Modal): Empfänger, Betreff, Body
- Empfänger: Auto-Fill aus Formulardaten (wenn Feld "E-Mail" existiert) + manuell
- Variablen im Betreff/Body: {form.name}, {customer.name}, {date}, {monteur}
- "PDF anhängen" Toggle (default: an)
- Senden → Status wird auf "sent" gesetzt + Toast
- In der Artifact-Umgebung: Simulation (Toast "E-Mail würde versendet an...")
- email_sent: true, email_sent_at: timestamp, email_to: adresse

### Teil C: Dashboard

- Submissions-Liste erweitern:
  - 5 Filter: Status (Dropdown), Template (Dropdown), Datum-Range (Von/Bis), 
    Monteur (Dropdown), Freitext-Suche
  - Sortierung: Datum ↑↓, Name ↑↓, Status
  - Bulk-Aktionen: Checkboxen + "Archivieren" / "Löschen" Buttons
- 4 Statistik-Karten: Gesamt, Abgeschlossen, Entwürfe, Versendet
- CSV-Export: UTF-8 BOM (für Excel-Umlaute!), alle sichtbaren Submissions
  - Header: Formular, Status, Monteur, Datum, + alle Feld-Labels
  - Werte: Feld-Werte als Text (Checkliste: "3/5 geprüft")

### Performance
- PDF-Preview: Lazy rendern (nur bei Bedarf)
- Dashboard-Filter: useMemo auf gefilterte+sortierte Liste
- CSV-Export: Kein UI-Block (async mit Toast "Exportiere...")

## Akzeptanzkriterien (50 Punkte)
PDF: 15 Punkte (alle Feldtypen, Layout, Header/Footer, Print, Conditional)
Email: 8 Punkte (Dialog, Variablen, Status, Simulation)
Dashboard: 12 Punkte (Filter, Sortierung, Bulk, Statistik, CSV)
Detail: 5 Punkte (Klick→Detail, alle Daten, Signaturen, Fotos, PDF-Button)
Regression: 10 Punkte (alle S01+S02 Features)

## Output
src/formpilot.jsx + versions/formpilot-v5.jsx
```

## S03 Folgeprompt

```markdown
# S03 Folgeprompt
1. Alle 50 Kriterien prüfen.
2. PDF Edge-Cases: Formular mit 0 ausgefüllten Feldern, nur Signaturen, 
   10 Fotos, sehr lange Texte (1000 Zeichen), Seitenumbruch mitten in Checkliste.
3. CSV: Öffne in Excel → Umlaute korrekt? Semikolon als Separator für DE Excel.
4. Dashboard: 100 Submissions → Filter-Performance?
5. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S04 — OFFLINE + VORLAGEN-BIBLIOTHEK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S04 Masterprompt

```markdown
# S04: Offline-Modus + Vorlagen-Bibliothek

## Basis: src/formpilot.jsx (Stand S03). Regeln FR1–FR7, P1–P10.

### Teil A: Offline-Modus

#### Detection
- navigator.onLine + 'online'/'offline' Events
- Zusätzlich: Heartbeat-Ping alle 30s (fetch mit timeout → online/offline)
- State: { isOnline: boolean, lastSyncedAt: Date }

#### Offline-Queue
- Wenn offline: Submissions + Drafts in Queue (window.storage)
- Queue-Struktur: [{ id, type: 'submission'|'draft', data, createdAt }]
- Fotos + Signaturen: Base64 in Queue (max 5MB pro Eintrag)
- Bei Reconnect: Queue automatisch abarbeiten (sequentiell)
- Fortschritts-Toast: "Synchronisiere 3/5..."
- Conflict Resolution: Last-Write-Wins + User-Hinweis wenn Conflict

#### UI
- TopBar: Gelbes Banner "⚡ Offline — Daten werden lokal gespeichert"
- Grünes Banner bei Reconnect: "✅ Wieder online — Synchronisiere..."
- Offline-Icon neben jedem Submission die noch nicht synced ist
- Formular-Ausfüllen funktioniert komplett offline
- Builder funktioniert offline (Templates lokal gespeichert)

### Teil B: Vorlagen-Bibliothek

#### System-Templates (4 ausführliche, professionelle Vorlagen)
1. **Baustellenabnahme** (5 Seiten):
   - S1: Projektdaten (auto-prefill ready)
   - S2: Installations-Checkliste (15 Prüfpunkte)
   - S3: Qualitätsprüfung (Rating + Checkliste)
   - S4: Mängel (conditional, Fotos, Schweregrad)
   - S5: Unterschriften (Monteur + Kunde) + Abschluss

2. **Servicebericht** (3 Seiten):
   - S1: Einsatzdaten + Kundeninfo
   - S2: Arbeiten + Material + Fotos
   - S3: Empfehlungen + Unterschrift

3. **Mängelprotokoll** (3 Seiten):
   - S1: Standort + Projekt
   - S2: Mängel-Liste (Repeater-ready, erstmal als große Checkliste)
   - S3: Maßnahmen + Fristen + Unterschrift

4. **Werkzeug-Übergabe** (2 Seiten):
   - S1: Werkzeugliste (Checklist mit Zustandsbewertung)
   - S2: Übergabe-Details + Unterschriften

#### Bibliothek-UI
- Vorlagen-Übersicht mit Kategorien-Filter (Tabs)
- Suchfeld für Vorlagen
- Favoriten (Stern-Toggle, gespeichert in window.storage)
- "Als Vorlage nutzen" → Deep-Clone als eigenes Template
- Template Import: JSON-Datei hochladen → validieren → speichern
- Template Export: JSON-Download

## Akzeptanzkriterien (35 Punkte)
Offline: 15 Punkte (Detection, Queue, Sync, Banner, ausfüllen offline, 
         Builder offline, Fotos offline, Reconnect-Sync)
Vorlagen: 12 Punkte (4 Templates, Kategorien, Suche, Favoriten, 
          Import/Export, Duplikation)
Regression: 8 Punkte

## Output
src/formpilot.jsx + versions/formpilot-v6.jsx
```

## S04 Folgeprompt

```markdown
# S04 Folgeprompt
1. Offline: App komplett offline testen (navigator.onLine = false simulieren).
   Formular ausfüllen → Foto → Signatur → Submit → alles in Queue?
   Reconnect → Queue abgearbeitet?
2. Vorlagen: Alle 4 System-Templates komplett ausfüllbar?
   Import/Export: Exportiertes JSON → Re-Import → identisch?
3. Performance: Offline-Queue mit 10 Submissions → Sync blockiert UI nicht?
4. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S05 — LAGERPILOT-BRIDGE + BERECHTIGUNGEN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S05 Masterprompt

```markdown
# S05: LagerPilot-Bridge + Berechtigungen + Multi-Tenancy

## Basis: src/formpilot.jsx (Stand S04). Regeln FR1–FR7, P1–P10.
## KRITISCH: FR5 — NUR lesen, NIE schreiben in LagerPilot-Daten!

### Teil A: LagerPilot-Bridge (fp_lagerpilot Feature-Flag)

#### Simulierte LagerPilot-Daten
```javascript
const LAGERPILOT_DATA = {
  sites: [
    { id: 's1', name: 'PV-Anlage Müller', address: 'Hauptstr. 15, 80331 München',
      client: 'Müller GmbH', contact: 'Hans Müller', contactEmail: 'mueller@firma.de',
      status: 'aktiv' },
    { id: 's2', name: 'Heizung Schmidt', address: 'Bergstr. 8, 81245 München',
      client: 'Schmidt & Söhne', contact: 'Karl Schmidt', contactEmail: 'schmidt@soehne.de',
      status: 'aktiv' },
    { id: 's3', name: 'Sanitär Hofbräuhaus', address: 'Platzl 9, 80331 München',
      client: 'Hofbräu AG', contact: 'Maria Weber', contactEmail: 'weber@hofbraeu.de',
      status: 'abgeschlossen' },
  ],
  bookings: {
    's1': [
      { id: 'b1', articleName: 'PV-Modul 400W', articleNr: 'PV-400', quantity: 12, unit: 'Stk', bookedAt: '2026-03-10' },
      { id: 'b2', articleName: 'Wechselrichter 10kW', articleNr: 'WR-10K', quantity: 1, unit: 'Stk', bookedAt: '2026-03-10' },
      { id: 'b3', articleName: 'Montageschiene 3m', articleNr: 'MS-3M', quantity: 8, unit: 'Stk', bookedAt: '2026-03-11' },
      { id: 'b4', articleName: 'DC-Kabel 6mm²', articleNr: 'DC-6', quantity: 50, unit: 'm', bookedAt: '2026-03-11' },
      { id: 'b5', articleName: 'Dachhaken Ziegel', articleNr: 'DH-Z', quantity: 24, unit: 'Stk', bookedAt: '2026-03-10' },
    ],
    's2': [
      { id: 'b6', articleName: 'Wärmepumpe 12kW', articleNr: 'WP-12', quantity: 1, unit: 'Stk', bookedAt: '2026-03-08' },
      { id: 'b7', articleName: 'Pufferspeicher 500L', articleNr: 'PS-500', quantity: 1, unit: 'Stk', bookedAt: '2026-03-08' },
      { id: 'b8', articleName: 'Cu-Rohr 22mm', articleNr: 'CU-22', quantity: 30, unit: 'm', bookedAt: '2026-03-09' },
    ],
    's3': [
      { id: 'b9', articleName: 'Waschtisch Keramik', articleNr: 'WT-K1', quantity: 3, unit: 'Stk', bookedAt: '2026-03-05' },
      { id: 'b10', articleName: 'Armatur Einhand', articleNr: 'AR-EH', quantity: 3, unit: 'Stk', bookedAt: '2026-03-05' },
    ],
  },
};
```

#### Neue Feldtypen
- **article-list**: Tabelle mit Artikeln der gewählten Baustelle
  - Spalten: ✓, Artikel, Art.Nr., Soll-Menge, Status (✅/⚠️/❌), Notiz
  - Status-Toggle pro Zeile: Vorhanden / Teilweise / Fehlt
  - Sortierbar nach Artikelname / Menge / Status
  - Notiz-Feld pro Zeile (klappbar)
  
- **customer-data**: Auto-Prefill Block aus Baustellendaten
  - Zeigt: Firmenname, Ansprechpartner, E-Mail, Adresse
  - Editierbar (falls abweichend)

#### Baustellen-Integration
- Baustellen-Dropdown mit Autocomplete-Suche im Formular
- Wahl der Baustelle → Auto-Prefill aller customer-data + article-list Felder
- "Abnahme starten" Quick-Action auf Startseite wenn fp_lagerpilot=true

#### PDF-Rendering
- article-list: Professionelle Tabelle mit Farbcodierung (✅ grün, ⚠️ gelb, ❌ rot)
- customer-data: Kompakte Info-Box

### Teil B: Berechtigungen + Multi-Tenancy

#### 4 Rollen mit Permissions-Map
```javascript
const ROLE_PERMISSIONS = {
  admin: {
    'templates.create': true, 'templates.edit': true, 'templates.delete': true, 'templates.view': true,
    'submissions.own': true, 'submissions.team': true, 'submissions.all': true,
    'submissions.archive': true, 'submissions.delete': true,
    'email.send': true,
    'settings.org': true, 'settings.users': true, 'settings.own_profile': true,
  },
  teamleiter: {
    'templates.view': true,
    'submissions.own': true, 'submissions.team': true,
    'submissions.archive': true,
    'email.send': true,
    'settings.users': true, 'settings.own_profile': true,
  },
  monteur: {
    'templates.view': true,
    'submissions.own': true,
    'settings.own_profile': true,
  },
  buero: {
    'templates.view': true,
    'submissions.all': true,
    'email.send': true,
    'settings.own_profile': true,
  },
};

const hasPermission = (user, perm) => ROLE_PERMISSIONS[user.role]?.[perm] === true;
```

#### Multi-Tenancy
- 2 Organisationen: { id: 'org1', name: 'Solar Plus GmbH' }, { id: 'org2', name: 'HausTech AG' }
- Jeder User gehört zu einer org_id
- Templates + Submissions nach org_id isoliert
- Neuer User: "Tim Teamleiter" (PIN 4321, role: teamleiter, org_id: org1)
- User in org2: "Eva Admin" (PIN 1111, role: admin, org_id: org2)

#### User-Verwaltung (Admin only)
- User-Liste mit Name, Email, Rolle, Status
- Rolle ändern (Dropdown)
- User deaktivieren/aktivieren

#### Audit-Trail
- Jede Aktion loggen: { action, userId, userName, timestamp, details }
- Aktionen: submission.created, submission.completed, template.created, 
  email.sent, user.role_changed
- Audit-Log anzeigbar in Settings (Admin only, letzte 50 Einträge)

#### UI-Anpassungen
- ALLE Buttons/Tabs/Aktionen prüfen mit hasPermission()
- Monteur sieht keinen Builder-Button
- Büro sieht keine Edit/Delete-Buttons
- Teamleiter sieht Team-Submissions, nicht fremde
- Org-Name im TopBar neben Logo

## Akzeptanzkriterien (45 Punkte)
LagerPilot: 15 (Baustellen, Artikel, Prefill, article-list, customer-data, PDF)
Berechtigungen: 15 (4 Rollen, hasPermission, UI-Hiding, korrekte Isolation)
Multi-Tenancy: 8 (2 Orgs, isolierte Daten, User-Verwaltung)
Audit: 3 (Logging, Anzeige, korrekte Aktionen)
Regression: 4

FR5-CHECK: FormPilot schreibt NICHT in LAGERPILOT_DATA!

## Output
src/formpilot.jsx + versions/formpilot-v7.jsx
```

## S05 Folgeprompt

```markdown
# S05 Folgeprompt
1. FR5-Audit: Grep nach allen Stellen die LAGERPILOT_DATA referenzieren.
   KEINE darf schreibend sein (.push, [x]=, delete, splice).
2. Permissions-Audit: Als Monteur einloggen → Builder-Button unsichtbar?
   Als Büro → kein Edit? Als Teamleiter → nur Team-Submissions?
3. Org-Isolation: Submissions von Org1 unsichtbar für Org2?
4. LagerPilot: Baustelle wechseln → Artikelliste aktualisiert?
5. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S06 — ERWEITERTE FELDER + REPEATER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S06 Masterprompt

```markdown
# S06: Erweiterte Felder + Repeater

## Basis: src/formpilot.jsx (Stand S05). Regeln FR1–FR7, P1–P10.

### Neue Feldtypen

1. **repeater** — Dynamische Gruppen
   - Konfigurierbar: Welche Felder pro Instanz (Sub-Schema)
   - "＋ Eintrag hinzufügen" Button, "🗑 Entfernen" pro Instanz
   - Min/Max Instanzen konfigurierbar
   - Nummerierung: "Mangel 1", "Mangel 2", etc.
   - Collapsed/Expanded Toggle pro Instanz (Performance!)
   - Im Builder: Sub-Felder per Drag&Drop konfigurieren
   - Im PDF: Jede Instanz als Block mit Rahmen
   - Beispiel: Mängel-Repeater (Beschreibung + Schweregrad + Foto + Frist)

2. **location** — GPS-Koordinaten
   - navigator.geolocation.getCurrentPosition()
   - Anzeige: Lat/Lng als Text + "📍 Position erfassen" Button
   - Accuracy-Indikator (Genauigkeit in Metern)
   - Karten-Platzhalter (grauer Kasten mit Koordinaten, keine Map-Library)
   - Fallback bei fehlender Permission: Manuelle Eingabe
   - Im PDF: Koordinaten als Text + Google-Maps-Link

3. **datetime** — Datum + Uhrzeit kombiniert
   - Rendert als date + time nebeneinander (half-width each)
   - Speichert als ISO-String
   - Im PDF: "14.03.2026 um 15:30 Uhr"

4. **file** — Datei-Upload
   - Drag & Drop Zone + Click-to-Upload
   - Konfigurierbar: allowedTypes (z.B. ['.pdf','.doc','.xlsx']), maxSizeMB
   - Datei als Base64 speichern (Dev) → Supabase Storage (Prod)
   - Dateiliste mit Name + Größe + ✕ Löschen
   - Im PDF: "Angehängte Datei: dokument.pdf (2.3 MB)"

5. **calculated** — Berechnetes Feld
   - Formel referenziert andere Felder: "={field-a} + {field-b}"
   - Operatoren: +, -, *, /, Funktionen: SUM(), AVG(), COUNT()
   - Read-only Anzeige, aktualisiert sich automatisch
   - Im Builder: Formel-Editor mit Feld-Referenz-Picker
   - Im PDF: Label + berechneter Wert

### Builder-Integration
- Alle 5 neuen Typen in Palette (neue Gruppe "Erweitert")
- Settings-Panels für jeden Typ
- Repeater: Sub-Schema-Editor (Mini-Canvas für Sub-Felder)
- Calculated: Formel-Editor mit Autocomplete für Feld-Referenzen

### Performance (KRITISCH für Repeater!)
- Repeater-Instanzen: Collapsed by default (nur Header sichtbar)
- Nur expanded Instanz rendert ihre Felder
- Bei 20 Instanzen → kein Lag (React.memo + lazy Render)
- Calculated: Debounce 300ms auf Neuberechnung

## Akzeptanzkriterien (40 Punkte)
Repeater: 12 (Add, Remove, Min/Max, Collapsed, Sub-Schema, Builder, PDF, 
          Performance mit 20 Instanzen)
Location: 6 (GPS, Accuracy, Permission-Fallback, PDF)
DateTime: 4 (Render, Speichern, PDF)
File: 6 (Upload, DnD, Types, Size-Limit, Delete, PDF)
Calculated: 6 (Formel-Parser, Auto-Update, SUM/AVG, Builder, PDF)
Regression: 6

## Output
src/formpilot.jsx + versions/formpilot-v8.jsx
```

## S06 Folgeprompt

```markdown
# S06 Folgeprompt
1. Repeater: 20 Mangel-Instanzen → Performance? Expand/Collapse smooth?
2. Repeater im Repeater (nested) → Blockieren oder erlauben?
3. Calculated: Zirkuläre Referenz (A=B, B=A) → Erkennung?
4. Location: GPS Timeout → sinnvolle Fehlermeldung?
5. Alle neuen Felder in Demo-Templates einbauen wo sinnvoll.
6. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S07 — ANALYTICS + BRANDING + DARK MODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S07 Masterprompt

```markdown
# S07: Analytics + Branding + Dark Mode

## Basis: src/formpilot.jsx (Stand S06). Regeln FR1–FR7, P1–P10.

### Teil A: Analytics Dashboard (neuer Tab, Admin + Büro)

#### Charts (REIN SVG-basiert, keine Libraries!)
1. **Submissions-Timeline** (Line-Chart): Submissions pro Tag/Woche über 30/90 Tage
2. **Status-Verteilung** (Donut-Chart): Draft/Completed/Sent/Archived
3. **Top-Templates** (Horizontal Bar): Welches Template wird am meisten genutzt
4. **Top-Monteure** (Horizontal Bar): Wer füllt am meisten aus

#### KPIs (4 Karten)
- Formulare gesamt / diesen Monat
- Ø Ausfüllzeit (completedAt - startedAt)
- Completion-Rate (completed / total)
- Formulare pro Tag (Trend-Pfeil ↑↓)

#### SVG-Chart-Engine
```jsx
// Minimale, wiederverwendbare Chart-Komponenten
const BarChart = React.memo(({ data, width, height, color }) => { /* SVG */ });
const DonutChart = React.memo(({ segments, size }) => { /* SVG */ });
const LineChart = React.memo(({ points, width, height, color }) => { /* SVG */ });
```

#### Filter: Template, Monteur, Zeitraum (7d/30d/90d/custom)
#### Druckbare Ansicht: "📊 Dashboard drucken"

### Teil B: Branding + White-Label

#### Logo
- Upload (File-Input → Base64 → window.storage 'fp_org_logo')
- Anzeige: Login-Screen, TopBar (klein, 28px), PDF-Header
- Platzhalter wenn kein Logo

#### Farbschema pro Organisation
- Primary Color Picker → überschreibt S.colors.primary
- Accent Color Picker → überschreibt S.colors.accent
- Header-Hintergrund → optional dunkel (für helle Logos)
- Gespeichert in window.storage 'fp_org_branding'
- CSS-Variablen-Override: Alle Komponenten nutzen S.colors → passt sich an

#### Dark Mode
- Toggle in Einstellungen
- S-Objekt komplett dualisieren:
  - Dark: bg=#0f172a, bgCard=rgba(30,41,59,0.9), text=#e2e8f0, border=#334155
  - Alle Farbwerte als Paar: S.colors.bg / S.colorsDark.bg
- Gespeichert in window.storage 'fp_dark_mode'
- System-Preference: prefers-color-scheme als Default

### Performance
- Charts: Nur rendern wenn Tab aktiv (intersection Observer oder flag)
- Chart-Daten: useMemo mit Submissions als Dependency
- Branding: CSS-Variablen statt Inline-Styles wo möglich
- Dark Mode: Klassen-Toggle statt Komplett-Rerender

## Akzeptanzkriterien (35 Punkte)
Analytics: 15 (4 Charts, 4 KPIs, Filter, Print)
Branding: 10 (Logo Upload/Display, Farben, PDF-Integration)
Dark Mode: 6 (Toggle, alle Bereiche, System-Pref, Persistenz)
Regression: 4

## Output
src/formpilot.jsx + versions/formpilot-v9.jsx
```

## S07 Folgeprompt

```markdown
# S07 Folgeprompt
1. Charts: Mit 0 Submissions → leerer Zustand? Mit 500 → Performance?
2. Dark Mode: JEDEN Screen prüfen (Login, Builder, Filler, PDF-Vorschau, 
   Dashboard, Settings). Kontrast ausreichend?
3. Branding: Logo 2000x2000px hochladen → korrekt skaliert?
4. PDF: Branding-Farben + Logo korrekt übernommen?
5. Bugs listen + fixen.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# S08 — AUTOMATIONEN + API + PERFORMANCE + FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## S08 Masterprompt

```markdown
# S08: Automationen + API + Performance + Finale Abnahme

## Basis: src/formpilot.jsx (Stand S07). Regeln FR1–FR7, P1–P10.
## Dies ist der LETZTE Chat. Das Ergebnis muss PRODUCTION-READY sein.

### Teil A: Automationen (einfach)

#### Workflow-Builder (Admin only)
- Trigger: submission.completed, submission.created, schedule (daily/weekly)
- Bedingung: template.category == X, field.value == Y
- Aktion: Email senden, Status ändern, Webhook feuern
- UI: Einfache Karten-basierte Konfiguration (kein Node-Graph)
- Beispiel-Workflow: "Wenn Abnahme abgeschlossen → E-Mail an Kunde"

#### Webhooks
- URL + Events (multi-select) + Secret-Key
- Events: submission.created, submission.completed, submission.sent
- Payload: { event, timestamp, submission: { id, templateName, data } }
- Webhook-Log: Letzte 50 Events mit Payload (aufklappbar)
- Retry-Info: "Fehlgeschlagen → 3 Retries" (simuliert)

### Teil B: API-Explorer (Admin only)

- Swagger-artiges UI mit 7 Endpoints:
  - GET /templates → Liste aller Templates
  - GET /templates/:id → Einzelnes Template
  - POST /submissions → Neue Submission erstellen
  - GET /submissions → Liste (mit ?status=&template_id=&page=&limit=)
  - GET /submissions/:id → Einzelne Submission
  - PATCH /submissions/:id → Status ändern
  - POST /submissions/:id/pdf → PDF generieren (simuliert)
- Methoden-Badges: GET=grün, POST=blau, PATCH=gelb
- Request/Response Beispiele (JSON, copy-to-clipboard)
- API-Key: Generieren, Anzeigen (einmalig), Widerrufen

### Teil C: Performance-Optimierung (GESAMTE App)

#### Code-Audit
- JEDE Komponente prüfen: React.memo, useCallback, useMemo vorhanden?
- Inline-Style-Objekte: Alle raus aus Render-Pfaden
- Event-Handler: Alle mit useCallback wrappen wenn als Prop
- Listen: Alle >20 Items mit Pagination oder Lazy-Render
- Storage-Ops: Alle async, keine im Render-Pfad

#### Error Handling
- Error Boundaries um Builder, Filler, Dashboard, PDF-Preview
- Global: window.onerror + unhandledrejection → Toast
- Graceful Degradation: Unbekannter Feldtyp → InfoBox statt Crash
- Storage-Fehler: Fallback + User-Hinweis

#### Accessibility (Basis)
- aria-label auf interaktive Elemente (Buttons, Inputs)
- tabIndex auf Custom-Controls (Toggle, Rating, Signatur)
- Focus-Trap in Modals/Drawers
- Keyboard-Navigation: Tab durch alle Formular-Felder

### Teil D: Finale Abnahme

#### VOLLSTÄNDIGER Regressionstest
Gehe SYSTEMATISCH durch JEDES Feature:

**S01 (Builder):**
- [ ] Builder öffnen (Admin) / nicht öffnen (Monteur)
- [ ] 3-Spalten-Layout (Desktop), Drawers (Mobile)
- [ ] Alle 17 Feldtypen aus Palette platzierbar
- [ ] Drag & Drop Umsortierung
- [ ] Feld-Einstellungen (3 Tabs)
- [ ] Conditional Logic konfigurieren
- [ ] Options/Checklist-Editor
- [ ] Live-Vorschau + Device-Toggle
- [ ] Undo/Redo (Ctrl+Z/Shift+Z)
- [ ] Keyboard Shortcuts (Ctrl+S/D, Del, Esc)
- [ ] Schema-Validierung (Name, leere Seiten, zirkuläre Bedingungen)
- [ ] Speichern + Template erscheint im Filler

**S02 (Signatur + Foto):**
- [ ] Signatur zeichnen (Maus + Touch)
- [ ] Smooth Lines, Undo, Clear, Confirm
- [ ] Foto: Kamera + Upload
- [ ] Kompression <500KB
- [ ] Lightbox, Caption, maxPhotos
- [ ] Draft-Save mit Signatur + Fotos

**S03 (PDF + Email + Dashboard):**
- [ ] PDF-Vorschau: Alle Feldtypen korrekt
- [ ] PDF: Header, Footer, Akzentfarbe, Seitenumbrüche
- [ ] PDF: Signaturen + Fotos sichtbar
- [ ] PDF: Conditional Fields ausgeblendet
- [ ] Submission-Detail-View
- [ ] Email-Dialog: Empfänger, Variablen, Status-Update
- [ ] Dashboard: 5 Filter, Sortierung, Bulk-Aktionen
- [ ] CSV-Export: UTF-8 BOM, Umlaute korrekt

**S04 (Offline + Vorlagen):**
- [ ] Offline-Banner bei Verbindungsverlust
- [ ] Formular offline ausfüllbar
- [ ] Queue-Sync bei Reconnect
- [ ] 4 System-Templates komplett ausfüllbar
- [ ] Template Import/Export (JSON)
- [ ] Favoriten

**S05 (LagerPilot + Berechtigungen):**
- [ ] Baustellen-Dropdown + Autocomplete
- [ ] article-list: Tabelle mit Status-Toggle
- [ ] customer-data: Auto-Prefill
- [ ] FR5: Kein Schreibzugriff auf LAGERPILOT_DATA
- [ ] 4 Rollen korrekt: Admin/Teamleiter/Monteur/Büro
- [ ] hasPermission steuert alle UI-Elemente
- [ ] Org-Isolation funktioniert

**S06 (Erweiterte Felder):**
- [ ] Repeater: Add/Remove/Min/Max/Collapsed
- [ ] Location: GPS + Fallback
- [ ] DateTime: Render + PDF
- [ ] File: Upload + Types + Size
- [ ] Calculated: Formel + Auto-Update

**S07 (Analytics + Branding):**
- [ ] 4 SVG-Charts rendern korrekt
- [ ] KPIs berechnet
- [ ] Logo Upload + Anzeige (Login, TopBar, PDF)
- [ ] Farbschema-Override
- [ ] Dark Mode: Alle Screens

**S08 (dieses Feature):**
- [ ] Workflow-Builder: Trigger + Bedingung + Aktion
- [ ] Webhooks: Erstellen + Log
- [ ] API-Explorer: 7 Endpoints dokumentiert
- [ ] API-Key: Generieren + Widerrufen
- [ ] Error Boundaries funktionieren
- [ ] Accessibility: Tab-Navigation durch Formular

#### Alle Bugs → Listen → Fixen
Schweregrade: 🔴 kritisch (Crash/Datenverlust) / 🟡 mittel (Feature defekt) / 🟢 kosmetisch

#### Migration-Vorbereitung
- window.storage → Supabase Mapping-Kommentar pro Storage-Key
- FormPilotModule Props-Interface dokumentieren (für LagerPilot-Einbettung)
- Multi-File-Split-Plan: Welche Komponenten → welche Dateien

## Output
src/formpilot.jsx + versions/formpilot-final.jsx
Bug-Liste + Migration-Plan als Kommentar im Code-Header
```

## S08 Folgeprompt

```markdown
# S08 Folgeprompt: LETZTE Prüfung

1. NOCHMAL alle ~60 Regressions-Punkte durchgehen.
2. Performance-Profil: Gibt es Stellen wo >50ms Render-Zeit?
3. Memory-Leaks: Timer, Event-Listener, Kamera-Streams — alle cleaned up?
4. Schema-Kompatibilität: Alte Demo-Templates noch ladbar?
5. Finaler Code: Sauber, kommentiert, keine TODOs, keine console.log.
6. Output: formpilot-final.jsx — production-ready.
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STANDARD-FOLGEPROMPT (für JEDEN Chat S01–S08)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```markdown
# Folgeprompt: Verbesserung + Prüfung + Performance-Audit

## A: Verbesserungen
Identifiziere 5+ UX/Performance-Schwachstellen. Verbessere sie.

## B: Akzeptanzkriterien
Gehe JEDES Kriterium durch. Bug? → Listen + Fixen.

## C: Regression
- Login (alle User + Rollen)
- Navigation
- Builder (Palette, Canvas, Settings, Vorschau, Undo)
- Filler (alle Feldtypen, Conditional Logic, Validation, Seiten)
- Signatur + Foto (ab S02)
- PDF + Email (ab S03)
- Offline (ab S04)
- LagerPilot + Permissions (ab S05)
- Erweiterte Felder (ab S06)
- Analytics + Branding + Dark Mode (ab S07)

## D: Performance
- React.memo auf allen Prop-Komponenten?
- useCallback auf allen Prop-Handlern?
- useMemo auf allen teuren Berechnungen?
- Keine Inline-Styles in Render?
- Keine Storage-Ops im Render-Pfad?

## E: Output
Gefixter Code + versions/formpilot-vX.jsx + Bug-Liste
```

---
---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REFERENZ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Chat-Reihenfolge (strikt linear)

```
S01 → S02 → S03 → S04 → S05 → S06 → S07 → S08
```

## Zeilen-Prognose

| Chat | Kumulativ | Feature-Flags |
|------|-----------|---------------|
| Start | 1517 | core, filler, builder |
| S01 | ~2000 | + preview, undo_redo |
| S02 | ~2600 | + signature, photo |
| S03 | ~3500 | + pdf, email, dashboard |
| S04 | ~4100 | + offline, templates_library |
| S05 | ~5000 | + lagerpilot, permissions |
| S06 | ~5800 | + repeater, location, datetime, file, calculated |
| S07 | ~6500 | + analytics, branding, dark_mode |
| S08 | ~7100 | + automations, api, webhooks |

## Zeitschätzung

| Chat | Dauer | Risiko |
|------|-------|--------|
| S01 | 30–45 min | 🟢 Niedrig |
| S02 | 45–60 min | 🟡 Canvas-Kompatibilität |
| S03 | 60–90 min | 🟡 PDF-Qualität |
| S04 | 45–60 min | 🟡 Sync-Edge-Cases |
| S05 | 60–90 min | 🔴 Komplexester Chat |
| S06 | 60–90 min | 🔴 Repeater-Performance |
| S07 | 45–60 min | 🟢 Gut abgrenzbar |
| S08 | 90–120 min | 🔴 Finale Abnahme |

**Gesamt: ~7–10 Stunden über 8 Sessions**
