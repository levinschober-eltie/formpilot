# FormPilot — Prompt 04: Excel-Export + Custom PDF-Templates

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du implementierst **Excel-Export** und **Custom PDF-Templates** mit Firmenbranding. Handwerksbetriebe arbeiten viel mit Excel und wollen professionelle PDFs mit eigenem Logo.

### Regeln
- FR1: Modular. Neue Export-Funktionen als eigene Dateien.
- FR3: Schema abwärtskompatibel. Bestehender PDF/CSV-Export muss weiterhin funktionieren.
- FR6: `npm run build` muss durchlaufen.
- Keine neuen CDN-Abhängigkeiten. Alles über npm.

### Aktueller Stand
- `src/lib/exportPdf.js` — Print-basierter HTML→PDF Export
- `src/lib/exportCsv.js` — Flat CSV mit UTF-8
- `src/components/layout/SubmissionDetail.jsx` — Export-Buttons
- Templates haben `pdfSettings` Objekt (orientation, showLogo, showPageNumbers, footerText, accentColor)

---

## Aufgabe 1: Excel-Export

### Neue Datei: `src/lib/exportExcel.js`

1. **Library installieren:**
   ```bash
   npm install xlsx
   ```
   (SheetJS — client-side Excel-Generation, kein Server nötig)

2. **Funktion: `exportSubmissionToExcel(submission, template)`**

   Erstellt eine .xlsx Datei mit:

   **Sheet 1: "Formulardaten"**
   - Spalte A: Feldname (Label)
   - Spalte B: Wert
   - Formatierung:
     - Header-Zeile: Bold, Hintergrund Primary-Farbe
     - Seitentitel als Merged-Header-Zeilen
     - Datum-Felder als Excel-Datum formatiert
     - Zahlen-Felder als Excel-Zahlen
     - Checkbox/Radio: Komma-getrennte Auswahl
     - Repeater: Als Sub-Tabelle (eingerückt oder als eigenes Sheet)
     - Fotos: "[Foto vorhanden]" + Dateiname
     - Signaturen: "[Unterschrift vorhanden]"

   **Sheet 2: "Metadaten"**
   - Formular-Name, Kategorie, Version
   - Ausgefüllt von, Datum, Status
   - Submission-ID

3. **Funktion: `exportMultipleToExcel(submissions, template)`**

   Für Bulk-Export mehrerer Submissions eines Templates:
   - Ein Sheet pro Submission ODER
   - Ein Sheet mit allen Submissions als Zeilen (wie CSV, aber formatiert)
   - Header: Alle Feldlabels
   - Zeilen: Submission-Werte
   - Auto-Spaltenbreite

4. **Datei-Download:**
   ```javascript
   // SheetJS schreibt direkt als Blob
   const blob = XLSX.write(workbook, { type: 'blob', bookType: 'xlsx' });
   // Trigger Download
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `${template.name}_${submission.id}.xlsx`;
   a.click();
   ```

---

## Aufgabe 2: Custom PDF-Templates

### Erweitere: `src/lib/exportPdf.js`

Aktuell nutzt der PDF-Export ein festes HTML-Layout. Erweitere es um **konfigurierbares Branding:**

1. **Erweitere das `pdfSettings` Schema in Templates:**
   ```javascript
   pdfSettings: {
     // Bestehend (NICHT ändern):
     orientation: "portrait",
     showLogo: true,
     showPageNumbers: true,
     footerText: "Erstellt mit FormPilot",
     accentColor: "#2563eb",

     // NEU:
     companyName: "",        // Firmenname im Header
     companyLogo: "",        // Base64 oder URL des Logos
     companyAddress: "",     // Adresse im Header
     companyPhone: "",       // Telefon
     companyEmail: "",       // Email
     headerLayout: "left",   // "left" | "center" | "right" — Logo-Position
     showCompanyHeader: true,
     showWatermark: false,
     watermarkText: "ENTWURF",
     fontSize: "normal",     // "small" | "normal" | "large"
     paperSize: "a4",        // "a4" | "letter"
   }
   ```

2. **PDF-Header mit Firmenbranding:**
   ```
   ┌─────────────────────────────────────────┐
   │  [LOGO]  Firmenname GmbH                │
   │          Musterstraße 1, 12345 Ort       │
   │          Tel: 0123/456789                 │
   │          info@firma.de                    │
   ├─────────────────────────────────────────┤
   │  Formular-Name          Datum: 18.03.26  │
   │  Auftragsnr: SUB-xxx    Status: ✓        │
   ├─────────────────────────────────────────┤
   ```

3. **Logo-Upload in Settings:**

   ### Neue Datei: `src/components/common/LogoUpload.jsx`

   - Einfacher File-Input für Bild-Upload
   - Vorschau des hochgeladenen Logos
   - Kompression auf max 400×200px
   - Speicherung als Base64 in localStorage (`fp_company_settings`)
   - "Logo entfernen" Button

4. **Firmen-Einstellungen in SettingsScreen:**

   ### Erweitere: `src/components/layout/SettingsScreen.jsx`

   Neuer Abschnitt "Firmeneinstellungen":
   - Logo-Upload (LogoUpload Komponente)
   - Firmenname (Text-Input)
   - Adresse (Textarea)
   - Telefon (Text-Input)
   - Email (Text-Input)
   - Akzentfarbe (Color-Picker: einfacher Input type="color")
   - Vorschau des PDF-Headers

   Gespeichert als `fp_company_settings` in localStorage:
   ```javascript
   {
     companyName: "GF Elite PV GmbH",
     companyLogo: "data:image/png;base64,...",
     companyAddress: "Musterstr. 1\n12345 München",
     companyPhone: "089/12345678",
     companyEmail: "info@elite-pv.de",
     accentColor: "#2563eb"
   }
   ```

5. **PDF-Export mit Firmen-Settings:**

   Der exportPdf.js liest automatisch `fp_company_settings` und wendet sie an:
   - Logo oben links/rechts/mitte (je nach headerLayout)
   - Firmenname, Adresse, Kontakt
   - Akzentfarbe für Überschriften und Trennlinien
   - Footer: Firmenname statt "Erstellt mit FormPilot" (oder beides)

6. **Wasserzeichen (optional):**
   - Diagonaler Text "ENTWURF" über jeder Seite
   - Nur wenn `showWatermark: true` und Status ≠ "completed"
   - Hellgrau, 45° Rotation, große Schrift

---

## Aufgabe 3: Export-Buttons in SubmissionDetail

### Erweitere: `src/components/layout/SubmissionDetail.jsx`

Füge einen "Excel-Export" Button hinzu neben dem bestehenden PDF/CSV:

```
[📄 PDF]  [📊 Excel]  [📋 CSV]
```

- Excel-Button ruft `exportSubmissionToExcel()` auf
- Bestehende PDF/CSV Buttons NICHT verändern

---

## Aufgabe 4: Bulk-Export in SubmissionsList

### Erweitere: `src/components/layout/SubmissionsList.jsx`

Wenn Submissions gefiltert/angezeigt werden:
- "Alle exportieren (Excel)" Button am Ende der Liste
- Ruft `exportMultipleToExcel()` auf mit allen sichtbaren Submissions
- Loading-State während Export

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **Excel-Export Tests:**
   - [ ] Einzelne Submission → Excel → Datei öffnet sich in Excel/LibreOffice
   - [ ] Alle Feldtypen sind korrekt dargestellt (Text, Zahlen, Datum, Listen)
   - [ ] Repeater-Felder sind als Tabelle erkennbar
   - [ ] Header-Zeile ist fett und farbig
   - [ ] Spaltenbreite passt zum Inhalt
   - [ ] Bulk-Export: 5+ Submissions → Eine Excel-Datei mit allen Zeilen
   - [ ] UTF-8 Umlaute (ä, ö, ü, ß) korrekt

3. **Custom PDF Tests:**
   - [ ] SettingsScreen → Firmeneinstellungen → Logo hochladen → Vorschau korrekt
   - [ ] PDF-Export → Logo erscheint im Header
   - [ ] Firmenname, Adresse, Kontakt im PDF sichtbar
   - [ ] Akzentfarbe ändert Überschriften-Farbe
   - [ ] PDF ohne Firmen-Settings → Normaler Export (wie vorher, Regression!)
   - [ ] Wasserzeichen bei Draft-Status sichtbar

4. **Regression:**
   - [ ] Bestehender PDF-Export funktioniert unverändert (wenn keine Firmen-Settings)
   - [ ] Bestehender CSV-Export unverändert
   - [ ] Alle Export-Buttons in SubmissionDetail funktionieren

---

## NICHT ÄNDERN

- `src/components/fields/*` — Wird von Prompts 01, 03, 05 bearbeitet
- `src/config/templates.js` — Wird von Prompt 02 bearbeitet
- `src/App.jsx` — NICHT ändern (außer wenn nötig für company settings state)
