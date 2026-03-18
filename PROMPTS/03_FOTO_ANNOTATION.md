# FormPilot — Prompt 03: Foto-Annotation

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du implementierst **Foto-Annotation** — die Möglichkeit, auf aufgenommenen Fotos zu zeichnen, Pfeile zu setzen und Text zu schreiben. Das ist ein kritisches Feature für Baustellendokumentation und Mängelprotokolle.

### Regeln
- FR1: Modular. Annotation als eigener Hook/Komponente, NICHT PhotoField.jsx komplett umschreiben.
- FR3: Schema abwärtskompatibel. Bestehende Foto-Felder ohne Annotation müssen weiterhin funktionieren.
- FR6: `npm run build` muss durchlaufen.
- P1-P4: React.memo, useCallback, useMemo, Styles außerhalb Render.

### Aktueller Stand PhotoField.jsx
Lies `src/components/fields/PhotoField.jsx` — aktuell:
- Kamera-Capture oder File-Upload
- Auto-Kompression auf 1200×1200px JPEG
- Mehrere Fotos (konfigurierbar max)
- Vorschau-Thumbnails mit Lösch-Button
- Werte gespeichert als Base64-Array

---

## Aufgabe: Annotation-Overlay für Fotos

### Neue Datei: `src/components/fields/PhotoAnnotation.jsx`

Erstelle eine eigenständige Annotation-Komponente die:

1. **Als Overlay über einem Foto geöffnet wird:**
   - Fullscreen-Modal mit dem Foto als Hintergrund
   - Canvas-Layer darüber für Zeichnungen
   - Toolbar am oberen oder unteren Rand

2. **Zeichen-Tools (Toolbar):**
   - **Freihand-Stift** (Default) — Zeichnen mit dem Finger/Maus
   - **Pfeil** — Vom Startpunkt zum Endpunkt
   - **Kreis/Rechteck** — Bereich markieren
   - **Text** — Tippen und platzieren
   - **Farbwähler** — Rot (Default), Gelb, Grün, Blau, Weiß, Schwarz
   - **Strichstärke** — Dünn (2px), Mittel (4px), Dick (8px)
   - **Rückgängig** — Letzte Aktion undoen (mindestens 20 Schritte)
   - **Alles löschen** — Alle Annotationen entfernen (mit Bestätigung)
   - **Fertig** — Annotation speichern und Modal schließen
   - **Abbrechen** — Ohne Speichern schließen

3. **Canvas-Implementierung:**
   - HTML5 Canvas über dem Foto
   - Canvas-Größe = Foto-Größe (skaliert auf Bildschirm)
   - Touch-Events UND Mouse-Events unterstützen
   - Multi-Touch vermeiden (nur 1 Finger zum Zeichnen)
   - `pointerdown`, `pointermove`, `pointerup` Events (Pointer Events API für Touch+Mouse)
   - Retina-Support: Canvas 2x Auflösung, CSS-Skalierung

4. **Speicherung:**
   - Beim "Fertig"-Klick: Canvas + Foto zusammen als neues Base64-Image rendern
   - Das Original-Foto wird durch das annotierte Foto ERSETZT im formData
   - KEINE separate Speicherung der Annotation-Daten (zu komplex, Foto mit Annotation ist genug)

5. **Integration in PhotoField.jsx:**
   - Jedes Foto-Thumbnail bekommt einen "Bearbeiten ✏️" Button
   - Klick öffnet PhotoAnnotation mit dem Foto
   - Nach "Fertig" wird das Foto im Array ersetzt

### Styling:

```
┌─────────────────────────────────────┐
│  [Stift] [Pfeil] [□] [T] [↩] [🗑]  │  ← Toolbar
│  [🔴🟡🟢🔵⚪⚫] [—━━]               │  ← Farbe + Stärke
├─────────────────────────────────────┤
│                                     │
│          ┌───────────┐              │
│          │   FOTO    │              │
│          │  + Canvas │              │
│          │  Overlay  │              │
│          └───────────┘              │
│                                     │
├─────────────────────────────────────┤
│     [Abbrechen]     [Fertig ✓]      │  ← Actions
└─────────────────────────────────────┘
```

- Dunkler Hintergrund (rgba(0,0,0,0.95))
- Toolbar: Glasmorphism-Effekt, abgerundete Buttons
- Aktives Tool: Hervorgehoben (Primary-Farbe)
- Touch-Target: Mindestens 44×44px pro Button (Mobile!)
- Z-Index: Über allem (z-index: 10000)

### Implementierungsdetails:

**Freihand-Stift:**
```javascript
// Im pointermove Handler:
ctx.lineTo(x, y);
ctx.stroke();
```

**Pfeil:**
- Beim pointerdown: Startpunkt merken
- Beim pointermove: Vorschau zeichnen (temporary canvas oder redraw)
- Beim pointerup: Endpunkt, Pfeil mit Spitze zeichnen
- Pfeilspitze: 3 Linien am Ende (15° Winkel, 20px Länge)

**Rechteck/Kreis:**
- Gleiche Logik wie Pfeil (Start → Drag → Ende)
- Nur Umriss, nicht gefüllt (damit Foto sichtbar bleibt)

**Text:**
- Bei Klick/Tap: Prompt/Input für Text (window.prompt oder eigenes Mini-Input)
- Text wird an Klick-Position gerendert
- Font: 16px Bold, mit schwarzem Outline für Lesbarkeit auf jedem Hintergrund

**Undo-Stack:**
```javascript
// Nach jeder abgeschlossenen Aktion:
// Snapshot des Canvas als ImageData speichern
undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
```

**Zusammenführen Foto + Annotation:**
```javascript
const mergeCanvas = document.createElement('canvas');
// ... Foto zeichnen, dann Annotation-Canvas drüber
const merged = mergeCanvas.toDataURL('image/jpeg', 0.85);
```

### Neuer Hook: `src/hooks/useAnnotation.js`

Extrahiere die Zeichenlogik in einen Hook:
```javascript
export function useAnnotation(canvasRef) {
  // State: tool, color, strokeWidth, undoStack
  // Handlers: startDraw, draw, endDraw, undo, clearAll
  // Returns: { tool, setTool, color, setColor, ... handlers }
}
```

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **Manuelle Tests:**
   - [ ] Foto aufnehmen → "Bearbeiten" klicken → Annotation-Modal öffnet sich
   - [ ] Freihand zeichnen → Linie erscheint in gewählter Farbe
   - [ ] Farbe wechseln → Neue Linie hat neue Farbe
   - [ ] Pfeil zeichnen → Pfeil mit Spitze erscheint
   - [ ] Rechteck zeichnen → Umriss-Rechteck erscheint
   - [ ] Text platzieren → Text erscheint am Klick-Punkt
   - [ ] Rückgängig → Letzte Aktion verschwindet
   - [ ] "Fertig" → Modal schließt, Foto-Thumbnail zeigt annotiertes Bild
   - [ ] "Abbrechen" → Modal schließt, Original-Foto unverändert
   - [ ] Submission erstellen → PDF-Export zeigt annotiertes Foto
   - [ ] **Mobile-Test:** Touch-Zeichnen auf Tablet/Handy funktioniert
   - [ ] **Regression:** PhotoField ohne Annotation funktioniert noch (bestehende Formulare)

3. **Edge Cases:**
   - [ ] Sehr großes Foto (4000×3000) → Canvas skaliert korrekt
   - [ ] Foto im Hochformat → Annotation passt sich an
   - [ ] Mehrere Fotos annotieren → Jedes behält seine Annotation
   - [ ] Undo nach "Alles löschen" → Nicht möglich (Stack geleert)

---

## NICHT ÄNDERN

- `src/components/fields/SignatureField.jsx` — Prompt 05
- `src/components/fields/BarcodeField.jsx` — Prompt 01 (wird erstellt)
- `src/components/fields/GpsField.jsx` — Prompt 01 (wird erstellt)
- `src/config/templates.js` — Prompt 02
- `src/lib/exportExcel.js` — Prompt 04
- `src/App.jsx` — NICHT ändern
