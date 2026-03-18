# FormPilot — Prompt 06: KI-Formular-Generator

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du implementierst einen **KI-gestützten Formular-Generator** — der Nutzer beschreibt in natürlicher Sprache was für ein Formular er braucht, und die KI erstellt automatisch ein vollständiges Template mit passenden Feldern, Seiten und bedingter Logik.

Das ist ein **Killer-Feature** — smapOne, SafetyCulture, Jotform und Lumiform bieten bereits ähnliches. FormPilot braucht es für Wettbewerbsfähigkeit UND als WOW-Moment beim Onboarding.

### Regeln
- FR1: Modular. Neues Feature als eigene Komponente + eigener Service.
- FR3: Schema abwärtskompatibel. Generierte Templates verwenden das exakte bestehende Schema.
- FR6: `npm run build` muss durchlaufen.
- P1-P4: Performance-Regeln einhalten.

### Aktueller Stand
- Template-Schema: Lies `src/config/templates.js` für Beispiele
- Feldtypen: `text`, `textarea`, `number`, `date`, `time`, `select`, `radio`, `checkbox`, `toggle`, `checklist`, `rating`, `heading`, `divider`, `info`, `signature`, `photo`, `repeater`
- Helpers: `src/lib/helpers.js` → `createField()`, `createEmptyTemplate()`
- Template wird in localStorage gespeichert (Key: `fp_templates`)

---

## Aufgabe 1: AI Service

### Neue Datei: `src/lib/aiService.js`

Erstelle einen Service der die Claude API (Anthropic) aufruft:

```javascript
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

export async function generateFormTemplate(userPrompt, language = 'de') {
  // 1. System-Prompt mit FormPilot-Schema-Wissen
  // 2. User-Prompt
  // 3. API-Call
  // 4. Response parsen
  // 5. Schema validieren
  // 6. Template-Objekt zurückgeben
}
```

**System-Prompt für Claude:**

```
Du bist ein Formular-Experte für Handwerk, Bau und Facility Management.
Du erstellst digitale Formulare im FormPilot-Schema.

REGELN:
1. Antworte NUR mit einem JSON-Objekt. Kein Markdown, kein Text drumherum.
2. Verwende NUR diese Feldtypen: text, textarea, number, date, time, select, radio, checkbox, toggle, checklist, rating, heading, divider, info, signature, photo, repeater
3. Jedes Feld braucht: id (einzigartig, Format: "field-ai-{nummer}"), type, label
4. Organisiere logisch in Seiten (pages)
5. Nutze bedingte Logik wo sinnvoll
6. Denke an: Kopfdaten → Details → Prüfung → Ergebnis → Unterschrift
7. Nutze deutsche Labels und Optionen
8. Markiere wichtige Felder als required: true
9. Verwende passende Feldtypen (z.B. Toggle für Ja/Nein, Rating für Bewertungen, Checklist für Prüfpunkte, Repeater für dynamische Listen)

SCHEMA:
{
  "name": "Formular-Name",
  "description": "Kurzbeschreibung",
  "category": "service|abnahme|mangel|pruefung|uebergabe|custom",
  "icon": "Passendes Emoji",
  "pages": [{
    "id": "p1",
    "title": "Seitenname",
    "fields": [{
      "id": "field-ai-1",
      "type": "text",
      "label": "Feldname",
      "required": true,
      "placeholder": "Platzhalter",
      "width": "full|half|third",
      "conditions": [{
        "field": "anderes-feld-id",
        "operator": "equals|notEquals|contains|isEmpty|isNotEmpty",
        "value": "wert",
        "action": "show|hide|require"
      }]
    }]
  }]
}

Für SELECT/RADIO/CHECKBOX: options: [{ value: "opt1", label: "Option 1" }]
Für CHECKLIST: items: [{ id: "c1", label: "Prüfpunkt 1" }]
Für REPEATER: subFields: [{ id: "sf1", label: "Spalte", type: "text" }]
Für RATING: maxStars: 5, ratingType: "stars|traffic"
Für DATE: defaultToday: true/false
Für NUMBER: min, max, decimals, unit
```

**API-Call:**

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  },
  body: JSON.stringify({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  })
});
```

**WICHTIG:** Der Header `anthropic-dangerous-direct-browser-access: true` ist nötig für Browser-Calls. In Produktion sollte das über einen Backend-Proxy laufen, aber für MVP ist Direct Access OK.

**Response-Verarbeitung:**
1. JSON aus Response extrahieren (Claude antwortet manchmal mit ```json Wrapper)
2. Schema validieren (alle Felder haben id, type, label)
3. IDs uniquifizieren (Timestamps hinzufügen)
4. Template-Wrapper hinzufügen (id, version, createdAt, etc.)
5. Fehlerbehandlung: JSON-Parse-Error → Retry mit Hinweis

### Neue Datei: `src/lib/aiTemplateValidator.js`

Validiert und bereinigt das von der KI generierte Template:
```javascript
export function validateAndFixAITemplate(rawTemplate) {
  // 1. Prüfe ob alle Pflichtfelder vorhanden
  // 2. Ersetze ungültige Feldtypen
  // 3. Generiere fehlende IDs
  // 4. Prüfe Options-Arrays bei Select/Radio/Checkbox
  // 5. Prüfe subFields bei Repeater
  // 6. Prüfe items bei Checklist
  // 7. Setze Defaults für fehlende Werte
  // 8. Gib bereinigtes Template zurück + Warnings-Array
}
```

---

## Aufgabe 2: UI-Komponente

### Neue Datei: `src/components/builder/AIFormGenerator.jsx`

Ein Modal/Dialog der:

1. **Eingabe-Phase:**
   ```
   ┌─────────────────────────────────────────┐
   │  🤖 KI-Formular-Generator               │
   ├─────────────────────────────────────────┤
   │                                          │
   │  Beschreibe dein Formular:               │
   │  ┌──────────────────────────────────┐   │
   │  │ z.B. "Ein Wartungsprotokoll für  │   │
   │  │ Heizungsanlagen mit Messwerten,  │   │
   │  │ Prüfpunkten und Unterschrift     │   │
   │  │ von Techniker und Kunde"         │   │
   │  └──────────────────────────────────┘   │
   │                                          │
   │  💡 Beispiele:                           │
   │  • "Abnahmeprotokoll für PV-Anlage"     │
   │  • "Mängelprotokoll mit Fotos"          │
   │  • "Täglicher Baustellenbericht"         │
   │  • "Fahrzeugübergabe-Checkliste"         │
   │                                          │
   │           [🤖 Formular generieren]        │
   └─────────────────────────────────────────┘
   ```

2. **Loading-Phase:**
   - Animierter Spinner/Pulse
   - Text: "KI erstellt dein Formular..."
   - Fortschritts-Schritte: "Struktur planen → Felder erstellen → Logik hinzufügen → Fertig"
   - Timeout nach 30s: "Das dauert länger als erwartet. Bitte warte..."

3. **Ergebnis-Phase:**
   ```
   ┌─────────────────────────────────────────┐
   │  ✅ Formular erstellt!                   │
   ├─────────────────────────────────────────┤
   │                                          │
   │  📋 Heizungswartungsprotokoll            │
   │  5 Seiten · 23 Felder · 3 Prüflisten    │
   │                                          │
   │  Vorschau:                               │
   │  ├── Seite 1: Kundendaten (5 Felder)    │
   │  ├── Seite 2: Anlagendaten (6 Felder)   │
   │  ├── Seite 3: Prüfpunkte (8 Items)      │
   │  ├── Seite 4: Messwerte (4 Felder)      │
   │  └── Seite 5: Ergebnis (4 Felder)       │
   │                                          │
   │  [Im Builder bearbeiten] [Direkt nutzen] │
   │  [Neu generieren]  [Abbrechen]           │
   └─────────────────────────────────────────┘
   ```

4. **Fehler-Phase:**
   - Klare Fehlermeldung
   - "Erneut versuchen" Button
   - "API-Key fehlt" → Hinweis auf Settings

5. **Klickbare Beispiele:**
   - Die Beispiel-Texte sind klickbar und füllen das Textarea

### Integration: Wo öffnet sich der Generator?

**Option A (empfohlen):** In `TemplatesOverview.jsx` als neuer Button:
```
[+ Neues Formular]  [🤖 KI-Generator]  [📥 Importieren]
```

**Option B:** Als erster Schritt im FormBuilder (wenn kein Template geladen):
"Starte mit KI oder erstelle manuell"

Implementiere **Option A**: Neuer Button in der Templates-Übersicht.

### API-Key Konfiguration

In `src/components/layout/SettingsScreen.jsx`:
- Neuer Abschnitt "KI-Einstellungen"
- Input für Anthropic API-Key (type="password", maskiert)
- "Testen" Button → Kurzer API-Call zum Validieren
- Gespeichert in localStorage: `fp_ai_settings`
- Hinweis: "Dein API-Key wird nur lokal gespeichert und nie an Dritte weitergegeben."

---

## Aufgabe 3: Fehlerbehandlung & Edge Cases

1. **Kein API-Key:** → Modal zeigt "Bitte API-Key in Einstellungen hinterlegen" mit Link
2. **API-Fehler (Rate Limit, 500, etc.):** → "Fehler bei der KI. Bitte in 30s erneut versuchen."
3. **Ungültiges JSON:** → Retry (max 2x) mit expliziterem Prompt
4. **Leerer Prompt:** → Button deaktiviert, Hinweis
5. **Sehr kurzer Prompt (< 10 Zeichen):** → "Bitte beschreibe dein Formular genauer."
6. **Netzwerkfehler:** → "Keine Internetverbindung. KI-Generator benötigt Online-Zugang."

---

## Aufgabe 4: "Direkt nutzen" vs "Im Builder bearbeiten"

- **"Im Builder bearbeiten":** Template wird gespeichert und der FormBuilder öffnet sich damit
- **"Direkt nutzen":** Template wird gespeichert und der FormFiller öffnet sich
- **"Neu generieren":** Zurück zur Eingabe-Phase (vorheriger Text bleibt)

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **Tests (mit API-Key):**
   - [ ] Einstellungen → API-Key eingeben → "Testen" → Erfolgsmeldung
   - [ ] Templates → "KI-Generator" → Prompt eingeben → Formular wird generiert
   - [ ] Generiertes Formular hat valide Struktur (Seiten, Felder, IDs)
   - [ ] "Im Builder bearbeiten" → Builder öffnet sich mit dem Template
   - [ ] Builder: Alle generierten Felder sind bearbeitbar
   - [ ] "Direkt nutzen" → Filler öffnet sich, alle Felder funktionieren
   - [ ] Formular ausfüllen → Submission erstellen → PDF-Export korrekt
   - [ ] Beispiel-Prompts klicken → Text wird übernommen

3. **Tests (ohne API-Key):**
   - [ ] "KI-Generator" → Hinweis "API-Key benötigt" mit Link zu Einstellungen
   - [ ] Kein Crash, kein hängender State

4. **Prompt-Qualität testen (mindestens 5 verschiedene):**
   - [ ] "Wartungsprotokoll für Heizungsanlagen"
   - [ ] "Abnahmeprotokoll für Photovoltaik-Installation"
   - [ ] "Täglicher Baustellenbericht mit Wetter und Arbeitszeiten"
   - [ ] "Mängelprotokoll mit Fotos und Prioritäten"
   - [ ] "Fahrzeugübergabe-Checkliste"
   → Jedes Ergebnis muss sinnvolle Felder und Struktur haben

5. **Regression:**
   - [ ] Bestehende Templates unverändert
   - [ ] Manuelles Erstellen im Builder funktioniert noch
   - [ ] Template-Import/Export funktioniert noch

---

## NICHT ÄNDERN

- `src/components/fields/*` — Wird von Prompts 01, 03, 05 bearbeitet
- `src/config/templates.js` — Wird von Prompt 02 bearbeitet
- `src/lib/export*.js` — Wird von Prompt 04 bearbeitet
- `src/App.jsx` — Nur minimal ändern wenn nötig (State für AI-Modal)
