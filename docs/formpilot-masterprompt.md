# FormPilot — Masterprompt v1.0

**Projekt:** Modularer Formular-Generator (à la smap one / Offpaper)
**Ziel:** Standalone-PWA, die nach Fertigstellung nahtlos in LagerPilot integriert wird
**Datum:** 14.03.2026

---

## 1. Produkt-Vision

FormPilot ist ein digitaler Formular-Generator für Handwerksbetriebe. Nutzer (Admins) erstellen eigene Formulare per Drag & Drop. Monteure füllen diese mobil aus — inklusive Unterschrift, Fotos, Checklisten. Ausgefüllte Formulare werden als PDF generiert und optional per E-Mail an den Kunden versendet.

**Kernzielgruppe:** Handwerks-/Installationsbetriebe, Bau, Facility Management
**Primärer Use-Case:** Baustellenabnahme, Serviceberichte, Mängelprotokolle, Übergabeprotokolle

---

## 2. Techstack (LagerPilot-kompatibel)

| Layer | Technologie | Begründung |
|-------|-------------|------------|
| **Frontend** | React JSX (Single-File) | Identisch zu LagerPilot — spätere Integration als Modul |
| **Styling** | CSS-in-JS via S-Objekt + CSS-Variablen | Kompatibel mit LagerPilot Design-System |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) | Selbe Instanz wie LagerPilot |
| **Automation** | n8n (PDF-Generierung, E-Mail-Versand) | Selbe n8n-Instanz |
| **PDF-Engine** | n8n + Puppeteer (HTML→PDF) ODER jsPDF im Client | Hybridansatz |
| **Offline** | Service Worker + Offline-Queue | Wie LagerPilot, Formulare auch offline ausfüllbar |
| **Signatur** | Canvas-basiert (react-signature-canvas Pattern) | Touch + Stylus Support |
| **Kamera/Upload** | Supabase Storage + Kompression im Client | `bookings/`-Bucket Pattern |

---

## 3. Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│  FormPilot Frontend (React JSX → später LagerPilot-Modul)       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Form Builder │  │ Form Filler  │  │ Submissions Dashboard  │ │
│  │ (Admin)      │  │ (Monteur)    │  │ (Übersicht/PDF/Email)  │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                  │                      │              │
│  ┌──────┴──────────────────┴──────────────────────┴────────────┐ │
│  │  FormPilot Core Engine                                       │ │
│  │  - Schema Parser (JSON → React Components)                   │ │
│  │  - Validation Engine                                         │ │
│  │  - Conditional Logic Engine                                  │ │
│  │  - PDF Template Renderer                                     │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase                                                        │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ PostgreSQL   │  │ Auth     │  │ Storage  │  │ Realtime    │ │
│  │ form_schemas │  │ (JWT)    │  │ (Fotos,  │  │ (Live-Sync) │ │
│  │ submissions  │  │          │  │  Signat.)│  │             │ │
│  └──────┬───────┘  └──────────┘  └──────────┘  └─────────────┘ │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│  n8n                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ PDF-Generate │  │ Email-Send   │  │ LagerPilot-Bridge    │  │
│  │ (Puppeteer)  │  │ (SMTP)       │  │ (Artikel→Formular)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Formular-Schema (JSON-Datenmodell)

Jedes Formular ist ein JSON-Schema. Der Builder erzeugt es, der Filler rendert es.

```jsonc
{
  "id": "uuid",
  "name": "Baustellenabnahme",
  "version": 1,
  "category": "abnahme",           // abnahme | service | mangel | custom
  "createdBy": "user-uuid",
  "createdAt": "2026-03-14T10:00:00Z",
  "updatedAt": "2026-03-14T10:00:00Z",
  
  // Seitenstruktur (mehrseitig möglich)
  "pages": [
    {
      "id": "page-1",
      "title": "Allgemeine Daten",
      "fields": [
        {
          "id": "field-uuid",
          "type": "text",              // → siehe Feld-Typen
          "label": "Projektbezeichnung",
          "placeholder": "z.B. PV-Anlage Müller",
          "required": true,
          "width": "full",             // full | half | third
          "conditions": [],            // Conditional Logic
          "validation": {
            "minLength": 3,
            "maxLength": 200
          },
          "prefill": {                 // Auto-Befüllung
            "source": "site",          // site | customer | user | static | lagerpilot
            "field": "name"
          }
        }
      ]
    }
  ],
  
  // PDF-Layout
  "pdfSettings": {
    "orientation": "portrait",
    "showLogo": true,
    "showPageNumbers": true,
    "headerText": "",
    "footerText": "Erstellt mit FormPilot",
    "accentColor": "#f0c040"
  },
  
  // Email-Vorlage
  "emailTemplate": {
    "subject": "Abnahmeprotokoll — {site.name}",
    "body": "Sehr geehrte/r {customer.name},\n\nanbei das Abnahmeprotokoll...",
    "attachPdf": true,
    "recipients": ["customer"]         // customer | admin | custom
  },
  
  // LagerPilot-Integration (optional, nur wenn verbunden)
  "lagerpilotBinding": {
    "enabled": false,
    "siteField": "field-uuid-site",    // Welches Feld = Baustelle
    "showBookedArticles": true,        // Verbuchte Artikel anzeigen
    "articleListMode": "readonly"       // readonly | editable | checklist
  }
}
```

### 4.1 Feld-Typen

| Typ | Beschreibung | Optionen |
|-----|-------------|----------|
| `text` | Einzeiliger Text | minLength, maxLength, pattern |
| `textarea` | Mehrzeiliger Text | minLength, maxLength, rows |
| `number` | Zahl | min, max, decimals, unit |
| `date` | Datum | minDate, maxDate, defaultToday |
| `time` | Uhrzeit | — |
| `datetime` | Datum + Uhrzeit | — |
| `select` | Dropdown | options[], allowOther |
| `radio` | Radio-Buttons | options[] |
| `checkbox` | Checkboxen (multi) | options[], minSelect, maxSelect |
| `toggle` | Ja/Nein Toggle | labelOn, labelOff |
| `signature` | Unterschrift-Canvas | label (z.B. "Kunde", "Monteur") |
| `photo` | Foto-Upload/Kamera | maxPhotos, maxSizeMB, allowCamera |
| `file` | Datei-Upload | allowedTypes[], maxSizeMB |
| `heading` | Überschrift (kein Input) | level (h2/h3/h4) |
| `divider` | Trennlinie | — |
| `info` | Info-Text (kein Input) | content (Markdown) |
| `checklist` | Checkliste mit Status | items[], allowNotes, allowPhotos |
| `rating` | Sterne-/Ampel-Bewertung | maxStars, type (stars/traffic) |
| `location` | GPS-Koordinaten | autoCapture |
| `article-list` | 🔗 LagerPilot: Artikel-Tabelle | source (site-bookings/manual) |
| `customer-data` | 🔗 LagerPilot: Kundendaten-Block | fields[] |

### 4.2 Conditional Logic

```jsonc
{
  "conditions": [
    {
      "field": "field-uuid-mangel",     // Referenz-Feld
      "operator": "equals",             // equals | notEquals | contains | gt | lt | isEmpty | isNotEmpty
      "value": "ja",
      "action": "show"                  // show | hide | require | disable
    }
  ],
  "conditionLogic": "AND"              // AND | OR
}
```

---

## 5. Datenbank-Schema (Supabase PostgreSQL)

```sql
-- ═══════════════════════════════════════════
--  FormPilot Schema (eigenes Schema, selbe DB)
-- ═══════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS formpilot;

-- Enums
CREATE TYPE formpilot.form_category AS ENUM ('abnahme', 'service', 'mangel', 'pruefung', 'uebergabe', 'custom');
CREATE TYPE formpilot.submission_status AS ENUM ('draft', 'completed', 'sent', 'archived');

-- ─── Formular-Vorlagen ───
CREATE TABLE formpilot.form_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  category      formpilot.form_category DEFAULT 'custom',
  version       INT NOT NULL DEFAULT 1,
  schema        JSONB NOT NULL,                -- Das komplette Formular-Schema
  pdf_settings  JSONB DEFAULT '{}'::JSONB,
  email_template JSONB DEFAULT '{}'::JSONB,
  lagerpilot_binding JSONB DEFAULT '{}'::JSONB,
  is_template   BOOLEAN DEFAULT FALSE,         -- Globale Vorlage vs. Custom
  active        BOOLEAN DEFAULT TRUE,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id)
);

-- Versionierung: Alte Versionen behalten
CREATE TABLE formpilot.form_template_versions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id   UUID NOT NULL REFERENCES formpilot.form_templates(id) ON DELETE CASCADE,
  version       INT NOT NULL,
  schema        JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, version)
);

-- ─── Ausgefüllte Formulare ───
CREATE TABLE formpilot.submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id   UUID NOT NULL REFERENCES formpilot.form_templates(id),
  template_version INT NOT NULL DEFAULT 1,
  status        formpilot.submission_status DEFAULT 'draft',
  data          JSONB NOT NULL DEFAULT '{}'::JSONB,  -- Alle Feld-Werte
  
  -- Kontext
  site_id       UUID REFERENCES public.sites(id),    -- 🔗 LagerPilot Baustelle
  customer_name TEXT,
  customer_email TEXT,
  
  -- Unterschriften (Pfade in Supabase Storage)
  signatures    JSONB DEFAULT '[]'::JSONB,
  -- [{ fieldId, storagePath, signedBy, signedAt }]
  
  -- Fotos
  photos        JSONB DEFAULT '[]'::JSONB,
  -- [{ fieldId, storagePath, caption, takenAt }]
  
  -- PDF
  pdf_path      TEXT,                               -- Supabase Storage Pfad
  pdf_generated_at TIMESTAMPTZ,
  
  -- Email
  email_sent    BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  email_to      TEXT,
  
  -- GPS
  gps_lat       NUMERIC(9,6),
  gps_lng       NUMERIC(9,6),
  
  -- Meta
  filled_by     UUID NOT NULL REFERENCES auth.users(id),
  filled_by_name TEXT,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  org_id        UUID NOT NULL REFERENCES public.organizations(id)
);

-- ─── Audit Trail ───
CREATE TABLE formpilot.submission_audit (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES formpilot.submissions(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,                  -- created | updated | completed | pdf_generated | email_sent
  user_id       UUID REFERENCES auth.users(id),
  user_name     TEXT,
  changes       JSONB,                          -- Was wurde geändert
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ───
CREATE INDEX idx_fp_templates_org ON formpilot.form_templates(org_id) WHERE active = TRUE;
CREATE INDEX idx_fp_submissions_org ON formpilot.submissions(org_id, status);
CREATE INDEX idx_fp_submissions_site ON formpilot.submissions(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX idx_fp_submissions_template ON formpilot.submissions(template_id);
CREATE INDEX idx_fp_audit_submission ON formpilot.submission_audit(submission_id);

-- ─── RLS ───
ALTER TABLE formpilot.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE formpilot.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formpilot.submission_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fp_templates_org" ON formpilot.form_templates
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "fp_submissions_org" ON formpilot.submissions
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "fp_audit_org" ON formpilot.submission_audit
  USING (submission_id IN (
    SELECT id FROM formpilot.submissions 
    WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  ));

-- ─── Supabase Storage Bucket ───
-- formpilot-files/
--   signatures/{submission_id}/{field_id}.png
--   photos/{submission_id}/{field_id}_{index}.jpg
--   pdfs/{submission_id}.pdf
```

---

## 6. Feature-Roadmap (Chat-basierte Entwicklung)

### Phase 1: Foundation (Chats F.1–F.3)

| Chat | Thema | Abhängigkeiten |
|------|-------|----------------|
| **F.1** | Core Engine + Form Filler | — |
| **F.2** | Form Builder (Drag & Drop) | F.1 |
| **F.3** | Signatur + Foto + Offline | F.1 |

### Phase 2: Output (Chats F.4–F.5)

| Chat | Thema | Abhängigkeiten |
|------|-------|----------------|
| **F.4** | PDF-Generierung + Vorschau | F.1–F.3 |
| **F.5** | E-Mail-Versand + Dashboard | F.4 |

### Phase 3: Integration (Chats F.6–F.7)

| Chat | Thema | Abhängigkeiten |
|------|-------|----------------|
| **F.6** | 🔗 LagerPilot-Bridge (Artikel, Baustellen, Kunden) | F.1–F.5 + LagerPilot |
| **F.7** | Vorlagen-Bibliothek + Duplikation + Template-Sharing | F.2 |

### Phase 4: Polish (Chats F.8–F.9)

| Chat | Thema | Abhängigkeiten |
|------|-------|----------------|
| **F.8** | Berechtigungen + Offline-Sync + Conflict Resolution | F.1–F.7 |
| **F.9** | E2E-Tests + Performance + Deployment | F.1–F.8 |

```
F.1 (Engine) ──┬──► F.2 (Builder) ──► F.7 (Vorlagen)
               ├──► F.3 (Signatur/Foto)
               └──► F.4 (PDF) ──► F.5 (Email/Dashboard)
F.1–F.5 ──────► F.6 (LagerPilot-Bridge)
F.1–F.7 ──────► F.8 (Permissions) ──► F.9 (Final)
```

---

## 7. Unveränderliche Regeln

```
FR1  MODULARER ANSATZ: Neue Features als eigenständige Hooks/Komponenten.
     NIE bestehende Funktionen umschreiben. Kommentar-Block pro Feature:
     // ═══ FEATURE: [Name] (Chat F.X) ═══

FR2  FEATURE-FLAGS: Jedes Feature → data.featureFlags.fp_{name} = true|false.
     Wenn Flag fehlt/undefined → Feature deaktiviert (graceful fallback).
     Prefix "fp_" unterscheidet FormPilot-Flags von LagerPilot-Flags.

FR3  SCHEMA-KOMPATIBILITÄT: Formular-Schema MUSS abwärtskompatibel bleiben.
     Neue Feld-Typen dürfen bestehende Formulare NICHT brechen.
     IMMER Fallbacks: (field.x || defaultValue), unbekannte Typen → <InfoBox>.

FR4  LAGERPILOT-KOMPATIBILITÄT:
     - Selbes S-Objekt / CSS-Variablen-System
     - Selbe Auth-Schicht (Supabase Auth, JWT, Rollen)
     - Selbe Offline-Queue-Architektur
     - Selbe org_id Multi-Tenancy
     - FormPilot MUSS als Tab/Modul in LagerPilot einbettbar sein

FR5  DATEN-ISOLATION: FormPilot nutzt eigenes Supabase-Schema "formpilot".
     Verweise auf LagerPilot-Daten (sites, bookings, articles) nur via 
     READ-ONLY Queries. FormPilot schreibt NIE in LagerPilot-Tabellen.

FR6  REGRESSIONS-TEST nach jedem Feature:
     - Formular erstellen (Builder)
     - Formular ausfüllen (Filler) 
     - Signatur + Foto
     - PDF erzeugen
     - Offline-Modus
     - Navigation

FR7  CODE-ABSCHLUSS: Am Ende JEDES Chats muss der KOMPLETTE CODE
     als fertiges Artifact vorliegen — fehlerfrei, lauffähig, alle Features integriert.
```

---

## 8. Prompt-Vorlage pro Chat

```markdown
# FormPilot Chat F.{X}: {Thema}

## Kontext
- Projekt: FormPilot — Formular-Generator für Handwerksbetriebe
- Basis-Datei: formpilot-{vorherige-version}.jsx
- Tech: React JSX (Single-File), Supabase, n8n
- Regeln: FR1–FR7 (siehe Masterprompt)

## Aufgabe
{Detaillierte Feature-Beschreibung}

## Akzeptanzkriterien
1. ...
2. ...

## Regressions-Checkliste
- [ ] Formular erstellen (Builder)
- [ ] Formular ausfüllen (Filler)
- [ ] Signatur + Foto
- [ ] PDF-Generierung
- [ ] Offline-Queue
- [ ] Navigation

## Output
Kompletter Code als Artifact: formpilot-{neue-version}.jsx
```

---

## 9. LagerPilot-Integration (Phase 3, Chat F.6)

### 9.1 Integration als LagerPilot-Tab

```jsx
// In lagerverwaltung-{version}.jsx:
// Neuer Nav-Eintrag
{ id: 'forms', label: '📋 Formulare', icon: '📋', permission: 'forms.view' }

// FormPilot wird als Komponente eingebettet:
case 'forms':
  return <FormPilotModule 
    supabase={supabase}
    orgId={data.orgId}
    userId={session.user.id}
    siteId={selectedSite?.id}      // Aktive Baustelle
    theme={S}                       // Design-System durchreichen
  />;
```

### 9.2 Datenbrücke: LagerPilot → FormPilot

| LagerPilot-Daten | FormPilot-Nutzung |
|-------------------|-------------------|
| `sites` (Baustellen) | Dropdown im Formular, Auto-Prefill Adresse/Kunde |
| `bookings` (Buchungen einer Baustelle) | Artikel-Liste im Abnahmeformular |
| `articles` (Artikelstamm) | Artikel-Referenz in Checklisten |
| `profiles` (User) | Monteur-Name für Signatur-Label |
| `customers` (via sites.client*) | Kundendaten-Prefill, E-Mail-Empfänger |

### 9.3 Baustellenabnahme-Flow (Hauptanwendungsfall)

```
1. Monteur wählt Baustelle in LagerPilot
2. Öffnet "📋 Abnahme starten" Button
3. FormPilot lädt Abnahme-Template + Baustellendaten
4. Auto-Prefill: Projektname, Adresse, Kunde, Ansprechpartner
5. Artikel-Liste: Alle auf die Baustelle gebuchten Artikel erscheinen
   → Monteur prüft Vollständigkeit (Checkliste)
   → Fehlende Artikel markieren + Notiz
6. Foto-Dokumentation: Monteur fotografiert Ergebnis
7. Checkliste: Qualitätsprüfpunkte abarbeiten
8. Mängel erfassen (Conditional: wenn "Mängel vorhanden" = Ja)
9. Unterschrift Monteur
10. Unterschrift Kunde
11. PDF generieren → Vorschau → Bestätigen
12. E-Mail an Kunde mit PDF-Anhang
13. Submission wird in FormPilot gespeichert + Link in LagerPilot-Baustelle
```

---

## 10. Vorgefertigte Templates

### 10.1 Baustellenabnahme
- Seite 1: Projektdaten (auto-prefill), Datum, Monteur
- Seite 2: Artikel-Checkliste (🔗 LagerPilot bookings)
- Seite 3: Qualitäts-Checkliste (konfigurierbar)
- Seite 4: Mängel (conditional, mit Fotos)
- Seite 5: Unterschriften (Monteur + Kunde) + Abschluss

### 10.2 Servicebericht
- Kundeninfo, Anlagentyp, Fehlerbeschreibung
- Durchgeführte Arbeiten (Checkliste)
- Verwendetes Material (🔗 LagerPilot oder manuell)
- Fotos vorher/nachher
- Empfehlungen, nächster Termin
- Unterschriften

### 10.3 Mängelprotokoll
- Standort + Verortung (GPS)
- Mängel-Liste (Foto + Beschreibung + Schweregrad)
- Verantwortlicher, Frist
- Unterschrift

### 10.4 Werkzeug-Übergabe
- Werkzeugliste (🔗 LagerPilot tools)
- Zustandsbewertung pro Werkzeug
- Fotos
- Übergabe an / von
- Unterschriften

---

## 11. Technische Details

### 11.1 Signatur-Komponente

```jsx
// Canvas-basiert, Touch + Mouse + Stylus
const SignatureField = ({ fieldId, label, onSave }) => {
  const canvasRef = useRef(null);
  // Zeichenlogik: pointerdown → pointermove → pointerup
  // Speichern als PNG → Base64 → Supabase Storage
  // Undo: letzte Stroke entfernen
  // Clear: Canvas zurücksetzen
  // Bestätigen: onSave(base64Data)
};
```

### 11.2 Offline-Strategie

```
Online:  Formular ausfüllen → direkt in Supabase speichern (draft)
Offline: Formular ausfüllen → in IndexedDB/localStorage queuen
         Fotos + Signaturen: als Base64 in Queue (max 5MB pro Foto)
         Bei Reconnect: Queue abarbeiten → Upload → Supabase
```

### 11.3 PDF-Generierung (zwei Wege)

**Weg A: Client-seitig (jsPDF + html2canvas)**
- Schnell, offline-fähig
- Begrenzte Formatierung
- Für einfache Formulare

**Weg B: Server-seitig (n8n + Puppeteer)**
- Pixel-perfekt
- HTML-Template → Puppeteer → PDF
- Für komplexe Layouts, Firmenlogo, etc.
- n8n-Webhook: POST /generate-pdf { submissionId }

### 11.4 n8n-Workflows

| Workflow | Trigger | Aktion |
|----------|---------|--------|
| `fp-generate-pdf` | Webhook POST | HTML rendern → Puppeteer → PDF → Supabase Storage |
| `fp-send-email` | Webhook POST | PDF aus Storage laden → SMTP versenden |
| `fp-submission-notify` | DB Trigger (status=completed) | Push/Mail an Admin |
| `fp-cleanup-drafts` | Cron (wöchentlich) | Drafts > 30 Tage archivieren |

---

## 12. Design-Prinzipien

1. **Mobile-First**: 90% der Nutzung auf Tablet/Handy auf der Baustelle
2. **Große Touch-Targets**: Min 44×44px, Unterschrift-Canvas mind. 300px hoch
3. **Progressive Disclosure**: Nur sichtbar was relevant ist (Conditional Logic)
4. **Offline-tolerant**: Alles muss auch ohne Netz funktionieren
5. **Schnell ausfüllbar**: Auto-Prefill, Defaults, Quick-Input wo möglich
6. **Baustellentauglich**: Hoher Kontrast, große Schrift, Handschuh-Modus

---

## 13. Start-Prompt (Chat F.1)

```markdown
# FormPilot Chat F.1: Core Engine + Form Filler

## Kontext
- Neues Projekt: FormPilot — Formular-Generator für Handwerksbetriebe
- Tech: React JSX (Single-File), CSS-in-JS, Tailwind-kompatibel
- Entwicklungsmodus: Claude.ai Artifact (window.storage als Persistenz)
- Spätere Migration: Supabase (identisch zu LagerPilot)
- Regeln: FR1–FR7 aus dem Masterprompt

## Aufgabe — Core Engine + Filler
Baue die FormPilot-Grundstruktur als React JSX Single-File-App:

### 1. App-Struktur
- Navigation: Templates | Ausfüllen | Eingereicht | Einstellungen
- Auth: Einfaches Login (wie LagerPilot — User-Array in data)
- Rollen: admin (erstellt Formulare), monteur (füllt aus), buero (sieht Eingaben)
- Responsive: Mobile-first, Bottom-Nav auf Mobile, Sidebar auf Desktop

### 2. Form Schema Engine
- JSON-Schema Parser: Rendert Formular aus Schema-Definition
- Alle Basis-Feldtypen implementieren: text, textarea, number, date, time, 
  select, radio, checkbox, toggle, heading, divider, info, checklist, rating
- Mehrseitige Formulare: Seiten-Navigation (Zurück/Weiter/Fertig)
- Conditional Logic Engine: show/hide/require basierend auf anderen Feldern
- Validation Engine: required, minLength, maxLength, min, max, pattern

### 3. Form Filler UI
- Monteur wählt Template → neues Formular starten
- Seitenweise Ausfüllen mit Progress-Bar
- Validierung pro Seite (nächste Seite nur wenn valid)
- Zwischenspeichern als Draft (auto-save alle 30s)
- Abschließen → Status "completed"

### 4. Demo-Templates
- 3 hardcodierte Demo-Vorlagen: 
  a) Einfacher Servicebericht (1 Seite, 8 Felder)
  b) Baustellenabnahme (3 Seiten, 15+ Felder, Conditional Logic)
  c) Mängelprotokoll (2 Seiten, Checkliste + Rating)

### 5. Style-System
- S-Objekt identisch zum LagerPilot-Pattern
- CSS-Variablen für Theming (Light/Dark ready)
- Glassmorphism Cards, sanfte Animationen
- Touch-optimiert: große Buttons, klar erkennbare Inputs

## Akzeptanzkriterien
1. App startet, Login funktioniert, Navigation zwischen Tabs
2. Alle 3 Demo-Templates sind wählbar und komplett ausfüllbar
3. Conditional Logic funktioniert (z.B. Mängel-Sektion erscheint nur bei "Ja")
4. Validierung blockiert ungültige Eingaben
5. Draft-Speicherung funktioniert (Refresh → Daten bleiben)
6. Responsive: Mobile (360px) + Tablet (768px) + Desktop (1280px)
7. Eingereichte Formulare erscheinen in der Übersicht

## Output
Kompletter Code als Artifact: formpilot-1.jsx
```
