# FormPilot — Prompt 05: Multi-Signatur (Mehrere Unterschriften)

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du erweiterst das **Signatur-Feld** um Multi-Signatur-Funktionalität — bei Abnahmen, Übergaben und Protokollen müssen oft BEIDE Parteien unterschreiben (Auftragnehmer + Auftraggeber).

### Regeln
- FR1: Modular. Erweitere das bestehende SignatureField, breche NICHT die API.
- FR3: Schema abwärtskompatibel. Bestehende Signatur-Felder (single) müssen unverändert funktionieren.
- FR6: `npm run build` muss durchlaufen.
- P1-P4: Performance-Regeln einhalten.

### Aktueller Stand
Lies `src/components/fields/SignatureField.jsx`:
- Einzelnes Canvas für Unterschrift
- 2x Auflösung (Retina)
- "Löschen" Button
- Wert gespeichert als Base64 String
- Touch + Mouse Support

---

## Aufgabe: Multi-Signatur-Modus

### Schema-Erweiterung

Erweitere das Signatur-Feld-Schema um:
```javascript
{
  id: "field-...",
  type: "signature",
  label: "Unterschriften",
  required: false,
  // NEU:
  multiSignature: true,         // false = wie bisher (single), true = Multi-Modus
  signatureSlots: [
    { id: "sig-1", label: "Auftragnehmer", required: true },
    { id: "sig-2", label: "Auftraggeber", required: true },
    // Optional weitere:
    { id: "sig-3", label: "Zeuge", required: false },
  ]
}
```

**Abwärtskompatibilität:** Wenn `multiSignature` undefined/false ist → Verhalten wie bisher (ein Canvas, ein Base64-String).

### Gespeicherter Wert (Multi-Modus)

```javascript
// formData[fieldId] bei multiSignature:
{
  "sig-1": "data:image/png;base64,...",  // Auftragnehmer
  "sig-2": "data:image/png;base64,...",  // Auftraggeber
  "sig-3": null                           // Noch nicht unterschrieben
}
```

### UI im Filler (Multi-Modus)

```
┌─────────────────────────────────────┐
│  Unterschriften                      │
├─────────────────────────────────────┤
│                                      │
│  Auftragnehmer *                     │
│  ┌──────────────────────────────┐   │
│  │  [Canvas Unterschrift]        │   │
│  └──────────────────────────────┘   │
│  [Löschen]                           │
│                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                      │
│  Auftraggeber *                      │
│  ┌──────────────────────────────┐   │
│  └──────────────────────────────┘   │
│  [Löschen]                           │
│                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                      │
│  Zeuge (optional)                    │
│  ┌──────────────────────────────┐   │
│  └──────────────────────────────┘   │
│  [Löschen]                           │
│                                      │
└─────────────────────────────────────┘
```

- Jeder Slot ist ein eigenes Canvas
- Required-Marker (*) wenn der Slot `required: true` hat
- Gestrichelte Trennlinie zwischen Slots
- Jeder Slot hat eigenen "Löschen" Button
- Label über jedem Canvas

### UI im Builder (Settings)

Erweitere `src/components/builder/BuilderSettingsPanel.jsx` für Signatur-Felder:

Wenn Signatur-Feld ausgewählt:
- Toggle "Multi-Signatur" (an/aus)
- Wenn an: Liste der Signatur-Slots
  - Jeder Slot: Label (Text-Input) + Required (Toggle) + Löschen-Button
  - "Slot hinzufügen" Button (max 5 Slots)
  - Drag & Drop Reihenfolge (optional, nice-to-have)
- Wenn aus: Normal wie bisher (nur Label + Required)

### Validierung

Erweitere `src/lib/validation.js`:

- Multi-Signatur: Jeder required Slot muss unterschrieben sein
- Single-Signatur: Wie bisher (Wert darf nicht leer sein wenn required)
- Fehlermeldung: "Unterschrift '{SlotLabel}' fehlt"

### PDF-Export

Erweitere `src/lib/exportPdf.js`:

Multi-Signatur im PDF:
```
Unterschriften:
┌────────────────────┐  ┌────────────────────┐
│ [Signatur-Bild]    │  │ [Signatur-Bild]    │
│ Auftragnehmer      │  │ Auftraggeber       │
│ 18.03.2026         │  │ 18.03.2026         │
└────────────────────┘  └────────────────────┘
```

- Signaturen nebeneinander (2 pro Zeile, 3. darunter)
- Unter jeder Signatur: Slot-Label + Datum
- Trennlinie über dem Signatur-Bereich

### CSV-Export

Erweitere `src/lib/exportCsv.js`:

Multi-Signatur-Felder:
- Eine Spalte pro Slot: "Unterschriften - Auftragnehmer", "Unterschriften - Auftraggeber"
- Wert: "[Unterschrift vorhanden]" oder ""

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **Tests:**
   - [ ] Bestehendes Signatur-Feld (single) → Funktioniert wie bisher (Regression!)
   - [ ] Builder: Neues Signatur-Feld → Multi-Signatur aktivieren → 2 Slots anlegen
   - [ ] Builder: Slot-Labels ändern → Required pro Slot setzen → Speichern
   - [ ] Filler: Multi-Signatur → Beide Canvases funktionieren unabhängig
   - [ ] Filler: Required-Slot nicht unterschrieben → Validierungsfehler
   - [ ] Filler: Alle Slots unterschrieben → Submission erfolgreich
   - [ ] SubmissionDetail: Multi-Signaturen werden angezeigt
   - [ ] PDF-Export: Signaturen nebeneinander mit Labels
   - [ ] CSV-Export: Separate Spalten pro Slot
   - [ ] Formular mit altem Schema (ohne multiSignature) → Funktioniert (Fallback!)

---

## NICHT ÄNDERN

- `src/components/fields/PhotoField.jsx` — Wird von Prompt 03 bearbeitet
- `src/components/fields/BarcodeField.jsx` — Wird von Prompt 01 erstellt
- `src/config/templates.js` — Wird von Prompt 02 bearbeitet
- `src/lib/exportExcel.js` — Wird von Prompt 04 erstellt
- `src/App.jsx` — NICHT ändern
