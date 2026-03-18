# FormPilot — Prompt 01: Barcode/QR-Scanner + GPS-Feldtypen

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du implementierst **zwei neue Feldtypen**: einen Barcode/QR-Scanner und ein GPS-Erfassungsfeld.

### Regeln (NIEMALS brechen)
- FR1: Modular. Neue Features als eigene Komponenten/Hooks. NIE Bestehendes umschreiben.
- FR3: Schema abwärtskompatibel. Fallbacks für alles.
- FR5: Regression nach jedem Feature — bestehende Feldtypen MÜSSEN weiterhin funktionieren.
- FR6: Am Ende: lauffähiger Code, `npm run build` muss durchlaufen.
- P1-P4: React.memo, useCallback, useMemo, Style-Objekte AUSSERHALB Render-Funktionen.

### Aktueller Stand
- 14 Feldtypen existieren bereits in `src/components/fields/`
- Feldtypen sind registriert in `src/config/constants.js` (FIELD_TYPE_ICONS, FIELD_PALETTE)
- Master-Renderer: `src/components/fields/FormField.jsx` routet nach `type`
- Exports: `src/components/fields/index.js`

---

## Aufgabe 1: BarcodeField.jsx

### Neue Datei: `src/components/fields/BarcodeField.jsx`

Erstelle einen neuen Feldtyp `barcode` der:

1. **Im Filler-Modus:**
   - Einen Button "Barcode/QR scannen" zeigt
   - Bei Klick die Kamera öffnet (über `navigator.mediaDevices.getUserMedia`)
   - Einen Live-Video-Feed in einem Modal/Overlay anzeigt
   - Die **BarcodeDetector API** nutzt (wo verfügbar) ODER als Fallback die Library `html5-qrcode` (prüfe ob im package.json, sonst installieren)
   - Den erkannten Code in ein Textfeld schreibt
   - Manuelles Eintippen als Fallback erlaubt
   - Mehrere Formate unterstützt: QR, Code128, Code39, EAN-13, EAN-8, UPC-A
   - Nach erfolgreichem Scan die Kamera stoppt
   - Einen "Erneut scannen" Button zeigt

2. **Im Builder-Modus (Settings):**
   - Erlaubte Formate konfigurierbar (Checkboxen)
   - Label konfigurierbar
   - Required ja/nein
   - Placeholder für manuelles Feld

3. **Schema-Erweiterung:**
```javascript
{
  id: "field-...",
  type: "barcode",
  label: "Geräte-Barcode",
  required: false,
  placeholder: "Manuell eingeben oder scannen",
  barcodeFormats: ["qr_code", "code_128", "ean_13"], // Konfigurierbar
  width: "full"
}
```

4. **Styling:**
   - Scan-Button: Primary-Style (`theme.colors.primary`)
   - Video-Overlay: Fullscreen mit semi-transparentem Hintergrund
   - Scan-Rahmen: Zentriertes Quadrat als visuelles Target
   - Erkannter Code: Grüner Erfolgs-Badge
   - CSS-in-JS, Style-Objekte außerhalb der Komponente definieren (P4)

5. **Fehlerbehandlung:**
   - Kamera-Permission verweigert → Hinweis + manuelles Feld
   - BarcodeDetector nicht verfügbar → Fallback-Library oder nur manuell
   - Kein Barcode erkannt nach 15s → Timeout-Hinweis

### Implementierungshinweise:
- Prüfe BarcodeDetector-Verfügbarkeit: `'BarcodeDetector' in window`
- Für den Fallback: `npm install html5-qrcode` (nur wenn BarcodeDetector nicht reicht)
- Video-Stream MUSS bei Unmount gestoppt werden (cleanup in useEffect)
- React.memo auf die Komponente (P1)
- useCallback auf alle Event-Handler (P2)

---

## Aufgabe 2: GpsField.jsx

### Neue Datei: `src/components/fields/GpsField.jsx`

Erstelle einen neuen Feldtyp `gps` der:

1. **Im Filler-Modus:**
   - Einen Button "Standort erfassen" zeigt
   - Bei Klick `navigator.geolocation.getCurrentPosition()` aufruft
   - Koordinaten anzeigt: Breitengrad, Längengrad, Genauigkeit
   - Optional: Link zu Google Maps mit den Koordinaten
   - Loading-State während GPS-Ermittlung
   - Automatische Erfassung beim Seitenaufruf (optional, konfigurierbar)

2. **Im Builder-Modus (Settings):**
   - Label konfigurierbar
   - Required ja/nein
   - `autoCapture: true/false` — Automatisch bei Seitenaufruf erfassen
   - `showMap: true/false` — Google Maps Link anzeigen
   - `highAccuracy: true/false` — GPS High Accuracy Mode

3. **Schema-Erweiterung:**
```javascript
{
  id: "field-...",
  type: "gps",
  label: "Standort",
  required: false,
  autoCapture: false,
  showMap: true,
  highAccuracy: true,
  width: "full"
}
```

4. **Gespeicherter Wert:**
```javascript
{
  lat: 48.1351,
  lng: 11.5820,
  accuracy: 15.5, // Meter
  timestamp: "2026-03-18T14:30:00Z"
}
```

5. **Styling:**
   - Koordinaten-Anzeige: Monospace-Font, leicht grauer Hintergrund
   - Genauigkeit als Badge (grün <20m, gelb <100m, rot >100m)
   - Maps-Link als kleiner Button mit 📍 Icon
   - Loading: Pulsierender Punkt

6. **Fehlerbehandlung:**
   - Permission verweigert → Klarer Hinweis "Standortfreigabe benötigt"
   - Timeout (10s) → "Standort konnte nicht ermittelt werden"
   - Unsicherer Kontext (HTTP) → "GPS nur über HTTPS verfügbar"

---

## Aufgabe 3: Integration in bestehende Dateien

### `src/config/constants.js` — Ergänze:

1. In `FIELD_TYPE_ICONS` hinzufügen:
```javascript
barcode: '📷',
gps: '📍',
```

2. In `FIELD_PALETTE` eine neue Gruppe oder zur Gruppe "Erweitert" hinzufügen:
```javascript
{
  type: 'barcode',
  label: 'Barcode / QR',
  description: 'Barcode oder QR-Code scannen',
  icon: '📷'
},
{
  type: 'gps',
  label: 'GPS-Standort',
  description: 'Aktuellen Standort erfassen',
  icon: '📍'
}
```

### `src/components/fields/FormField.jsx` — Ergänze:

Im Switch/Routing nach Feldtyp die neuen Typen hinzufügen:
```javascript
case 'barcode':
  return <BarcodeField {...props} />;
case 'gps':
  return <GpsField {...props} />;
```

Import hinzufügen. **NICHTS anderes in dieser Datei ändern!**

### `src/components/fields/index.js` — Ergänze Exports:
```javascript
export { default as BarcodeField } from './BarcodeField';
export { default as GpsField } from './GpsField';
```

### `src/components/builder/BuilderSettingsPanel.jsx` — Ergänze:

Füge Settings für die neuen Feldtypen hinzu:
- Barcode: Checkboxen für erlaubte Formate
- GPS: Toggles für autoCapture, showMap, highAccuracy

**NUR neue case-Blöcke hinzufügen, bestehende Settings NICHT ändern!**

### `src/lib/exportPdf.js` — Ergänze:

Rendering der neuen Feldtypen im PDF:
- Barcode: Zeige den gescannten Code-Wert als Text
- GPS: Zeige Koordinaten + optional Maps-Link

### `src/lib/exportCsv.js` — Ergänze:

- Barcode: Wert als String
- GPS: "lat,lng" als String

---

## Aufgabe 4: Validierung & Tests

Nach der Implementierung:

1. **Build prüfen:**
   ```bash
   npm run build
   ```
   → MUSS fehlerfrei durchlaufen

2. **Dev-Server starten:**
   ```bash
   npm run dev
   ```

3. **Manuelle Tests durchführen:**
   - [ ] FormBuilder öffnen → Barcode-Feld aus Palette ziehen → Settings konfigurieren
   - [ ] FormBuilder öffnen → GPS-Feld aus Palette ziehen → Settings konfigurieren
   - [ ] Formular mit beiden Feldern speichern → Neu laden → Felder sind noch da
   - [ ] Formular ausfüllen → Barcode manuell eintippen → Submission erstellen
   - [ ] Formular ausfüllen → GPS-Standort erfassen → Submission erstellen
   - [ ] Submission öffnen → PDF-Export → Werte sind im PDF sichtbar
   - [ ] Submission öffnen → CSV-Export → Werte sind in CSV enthalten
   - [ ] **Regression:** Altes Formular (Servicebericht) ausfüllen → Alle 14 bestehenden Feldtypen funktionieren noch

4. **Fehlerszenarien testen:**
   - [ ] Barcode: Kamera-Permission verweigern → Manuelles Feld nutzbar
   - [ ] GPS: Standort-Permission verweigern → Fehlermeldung sichtbar

5. **Performance:**
   - [ ] Kamera-Stream wird bei Navigation/Unmount gestoppt (kein Speicherleck)
   - [ ] GPS-Watch wird bei Unmount gecleaned

---

## NICHT ÄNDERN (diese Dateien werden von anderen Prompts bearbeitet)

- `src/config/templates.js` — Wird von Prompt 02 bearbeitet
- `src/components/fields/PhotoField.jsx` — Wird von Prompt 03 bearbeitet
- `src/components/fields/SignatureField.jsx` — Wird von Prompt 05 bearbeitet
- `src/lib/exportExcel.js` — Wird von Prompt 04 erstellt
- `src/App.jsx` — NICHT ändern
