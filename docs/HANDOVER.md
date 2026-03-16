# FormPilot — Vollständige Projektübergabe für Claude Code

**Datum:** 14.03.2026
**Übergabe von:** Claude.ai Projekt (Web-Interface)
**Übergabe an:** Claude Code (Terminal/MacBook)
**Erstellt durch:** Systematische Analyse aller Projektdateien + 2 Chat-Sessions

---

## 1. PROJEKTSTATUS — Wo stehen wir?

| Aspekt | Status |
|--------|--------|
| **Aktueller Stand** | Chat C02 abgeschlossen (Builder Grundgerüst) |
| **Aktuelle Datei** | `formpilot-2-2.jsx` (1517 Zeilen) |
| **Fertige Features** | F.1 Core Engine ✅ + C02 Builder Grundgerüst ✅ |
| **Nächster Schritt** | C03 Builder Polish (Verbesserung + Prüfung des Builders) |
| **Verbleibend** | 13 von 15 Chats (C03–C15) |
| **Ziel** | Production-ready PWA, Feature-Parität mit smap one / Offpaper |

---

## 2. WAS IST FORMPILOT?

Digitaler Formular-Generator für Handwerksbetriebe. Nutzer (Admins) erstellen Formulare per Drag & Drop. Monteure füllen diese mobil aus — inklusive Unterschrift, Fotos, Checklisten. Ausgefüllte Formulare → PDF → E-Mail an Kunden.

**Kernzielgruppe:** Handwerks-/Installationsbetriebe, Bau, Facility Management
**Primäre Use-Cases:** Baustellenabnahme, Serviceberichte, Mängelprotokolle, Übergabeprotokolle
**USP gegenüber Wettbewerb (smap one, Offpaper):** Integration mit LagerPilot (eigene Lagerverwaltungs-App)

---

## 3. TECHSTACK

| Layer | Technologie | Hinweis |
|-------|-------------|---------|
| **Frontend** | React JSX (Single-File) | Identisch zu LagerPilot |
| **Styling** | CSS-in-JS via S-Objekt + CSS-Variablen | Kein Tailwind, eigenes Design-System |
| **Persistenz (Dev)** | `window.storage` (Claude.ai Artifact-API) | Muss später → Supabase migriert werden |
| **Persistenz (Prod)** | Supabase (PostgreSQL + Auth + Storage + Realtime) | Selbe Instanz wie LagerPilot |
| **Automation** | n8n (PDF-Generierung, E-Mail-Versand) | Selbe n8n-Instanz |
| **Offline** | Service Worker + Offline-Queue | Wie LagerPilot |
| **Signatur** | Canvas-basiert (Pointer Events) | Touch + Stylus + Mouse |
| **Foto/Upload** | getUserMedia + Kompression | Supabase Storage für Prod |

**Wichtig für Claude Code:** Die App wird aktuell als **Claude.ai React Artifact** entwickelt (Single-File JSX, `window.storage` für Persistenz). Später wird sie als Modul in LagerPilot eingebettet und auf Supabase migriert.

---

## 4. DATEIEN — Was existiert

### 4.1 Projektdateien (im Claude.ai Projekt)

```
/project/
├── formpilot-masterprompt.md    # Gesamtarchitektur, Schema, Regeln, DB-Schema
├── C00-uebersicht.md            # Konsolidierter 15-Chat-Plan, Regeln FR1–FR7
└── formpilot-2-2.jsx            # AKTUELLER CODE (1517 Zeilen, F.1 + C02)
```

### 4.2 Generierte Dokumente (in Chat 1 erstellt, NICHT im Projekt gespeichert)

In der ersten Chat-Session wurde eine **vollständige Prompt-Sammlung** für alle 15 Chats generiert. Diese Dokumente wurden als Downloads bereitgestellt, sind aber NICHT im Projekt hochgeladen:

- `formpilot-entwicklungsplan.md` — Gesamtplan mit Feature-Vergleich vs. smap/Offpaper
- Prompt-Sammlung für F.2–F.15 (Masterprompts + Verbesserungs-Prompts + Prüf-Prompts)

### 4.3 Was NICHT mehr existiert

- `formpilot-1.jsx` — wurde durch `formpilot-2-2.jsx` ersetzt (F.1 ist darin enthalten)

---

## 5. AKTUELLER CODE — Was ist implementiert

### 5.1 Implementierte Features (formpilot-2-2.jsx)

**F.1 Core Engine ✅:**
- Login-System (3 Demo-User: Admin/Monteur/Büro, PIN-basiert)
- 4-Tab-Navigation: Vorlagen | Ausfüllen | Eingereicht | Einstellungen
- Bottom-Nav (Mobile) mit rollenbasierter Sichtbarkeit
- JSON-Schema-Parser → rendert Formulare dynamisch
- 14 Basis-Feldtypen: text, textarea, number, date, time, select, radio, checkbox, toggle, heading, divider, info, checklist, rating
- Mehrseitige Formulare mit Progress-Bar + Seiten-Navigation
- Conditional Logic Engine (show/hide/require/disable, AND/OR)
- Validation Engine (required, minLength, maxLength, min, max, pattern)
- Auto-Save Drafts (alle 30s via window.storage)
- 3 Demo-Templates: Servicebericht, Baustellenabnahme, Mängelprotokoll
- Submissions-Liste mit Status-Badges und Feld-Preview
- S-Objekt Design-System (Glassmorphism, Touch-optimiert)

**C02 Builder Grundgerüst ✅:**
- FormBuilder Hauptkomponente mit 3-Spalten-Layout (Palette / Canvas / Settings)
- BuilderPalette — 12 aktive Feldtypen in 5 Gruppen (signature + photo als deaktiviert markiert → C04)
- BuilderCanvas — Drop-Zone mit HTML5 Drag & Drop, Seiten-Tabs
- BuilderFieldCard — Feld-Karten mit Drag-Handle, Width-Selector, Delete
- BuilderSettingsPanel — 3 Tabs: Allgemein / Validierung / Bedingungen
- BuilderMetaPanel — Beschreibung, Kategorie, Icon-Picker, PDF-Einstellungen
- OptionsEditor / ChecklistItemsEditor
- Conditional Logic konfigurierbar im Builder
- Speichern in `fp_templates` (window.storage), Auto-Save alle 60s
- Templates erscheinen im Filler + Vorlagen-Übersicht
- Demo-Templates kopierbar
- Responsive: <1024px → FAB + Drawers für Palette/Settings
- ToastMessage Komponente

### 5.2 Feature-Flags (aktueller Stand)

```
fp_core_engine:  ✅ true
fp_form_filler:  ✅ true
fp_form_builder: ✅ true
fp_signature:    ❌ false (C04)
fp_photo:        ❌ false (C04)
fp_pdf:          ❌ false (C05)
fp_email:        ❌ false (C06)
fp_offline:      ❌ false (C07)
fp_lagerpilot:   ❌ false (C08)
```

### 5.3 Bekannte Einschränkungen der aktuellen Version

- Builder hat noch KEINE Live-Vorschau (kommt in C03)
- Builder hat noch KEIN Undo/Redo (kommt in C03)
- Builder hat noch KEINE Feld-Duplikation (kommt in C03)
- Signature + Photo Felder sind in der Palette deaktiviert (kommt in C04)
- Kein PDF-Export (kommt in C05)
- Kein E-Mail-Versand (kommt in C06)
- Kein Offline-Modus (kommt in C07)
- Kein Submission-Detail-View (kommt in C05)

---

## 6. ARCHITEKTUR — Wie der Code aufgebaut ist

### 6.1 Single-File-Struktur

Alles in EINER JSX-Datei. Jedes Feature ist durch Kommentar-Blöcke markiert:

```jsx
// ═══ FEATURE: [Name] (Chat CXX) ═══
```

### 6.2 Komponenten-Hierarchie

```
FormPilot (Main App)
├── LoginScreen
├── TopBar + BottomNav
├── Tab: Vorlagen → TemplatesOverview
│   └── FormBuilder (öffnet als Vollbild)
│       ├── BuilderPalette (Links / Drawer)
│       ├── BuilderCanvas (Mitte)
│       │   └── BuilderFieldCard (pro Feld)
│       ├── BuilderSettingsPanel (Rechts / Drawer)
│       │   ├── OptionsEditor
│       │   └── ChecklistItemsEditor
│       └── BuilderMetaPanel (im Canvas-Bereich)
├── Tab: Ausfüllen → TemplateSelector
│   └── FormFiller (öffnet inline)
│       └── FormField (pro Feld)
│           ├── TextField, TextareaField, NumberField
│           ├── DateField, TimeField, SelectField
│           ├── RadioField, CheckboxField, ToggleField
│           ├── ChecklistField, RatingField
│           └── HeadingField, DividerField, InfoField
├── Tab: Eingereicht → SubmissionsList
└── Tab: Einstellungen → SettingsScreen
```

### 6.3 Datenfluss

```
Templates (DEMO_TEMPLATES + window.storage 'fp_templates')
    ↓
TemplateSelector → User wählt Template
    ↓
FormFiller → rendert Schema → User füllt aus
    ↓
Auto-Save → window.storage (Draft)
    ↓
Submit → window.storage 'fp_submissions'
    ↓
SubmissionsList → Übersicht aller Submissions
```

### 6.4 Persistenz-Keys (window.storage)

| Key | Inhalt |
|-----|--------|
| `fp_submissions` | Array aller abgeschlossenen Formulare |
| `fp_drafts` | (Reserviert, aktuell nicht genutzt) |
| `fp_session` | `{ userId: 'u1' }` — Login-Session |
| `fp_templates` | Array eigener Templates (vom Builder erstellt) |
| `fp_draft_{templateId}_current` | Auto-Save Draft pro Template |

---

## 7. FORMULAR-SCHEMA — Das JSON-Datenmodell

Jedes Formular ist ein JSON-Schema. Der Builder erzeugt es, der Filler rendert es:

```jsonc
{
  "id": "tpl-uuid",
  "name": "Baustellenabnahme",
  "description": "Vollständiges Abnahmeprotokoll",
  "category": "abnahme",        // abnahme|service|mangel|pruefung|uebergabe|custom
  "icon": "🏗️",
  "version": 1,
  "isDemo": true/false,
  "pages": [
    {
      "id": "page-uuid",
      "title": "Projektdaten",
      "fields": [
        {
          "id": "field-uuid",
          "type": "text",          // siehe Feldtypen unten
          "label": "Projektbezeichnung",
          "placeholder": "z.B. PV-Anlage Müller",
          "required": true,
          "width": "full",         // full|half|third
          "conditions": [          // Conditional Logic
            {
              "field": "ref-field-id",
              "operator": "equals", // equals|notEquals|contains|gt|lt|isEmpty|isNotEmpty
              "value": "ja",
              "action": "show"      // show|hide|require|disable
            }
          ],
          "conditionLogic": "AND", // AND|OR
          "validation": {
            "minLength": 3,
            "maxLength": 200
          }
        }
      ]
    }
  ],
  "pdfSettings": {
    "orientation": "portrait",
    "showLogo": true,
    "showPageNumbers": true,
    "footerText": "Erstellt mit FormPilot",
    "accentColor": "#f0c040"
  },
  "emailTemplate": {
    "subject": "...",
    "body": "...",
    "attachPdf": true,
    "recipients": ["customer"]
  }
}
```

### Feld-Typen (aktuell implementiert)

| Typ | Beschreibung | Spezifische Properties |
|-----|-------------|----------------------|
| `text` | Einzeiliger Text | minLength, maxLength, pattern |
| `textarea` | Mehrzeiliger Text | minLength, maxLength, rows |
| `number` | Zahl | min, max, decimals, unit |
| `date` | Datum | defaultToday |
| `time` | Uhrzeit | — |
| `select` | Dropdown | options[{value,label}] |
| `radio` | Radio-Buttons | options[{value,label}] |
| `checkbox` | Checkboxen (multi) | options[{value,label}], minSelect, maxSelect |
| `toggle` | Ja/Nein | labelOn, labelOff |
| `checklist` | Prüfliste | items[{id,label}], allowNotes |
| `rating` | Bewertung | maxStars, ratingType (stars/traffic) |
| `heading` | Überschrift | level (h2/h3/h4) |
| `divider` | Trennlinie | — |
| `info` | Info-Text | content |

### Geplante Feld-Typen (noch nicht implementiert)

| Typ | Geplant für |
|-----|-------------|
| `signature` | C04 |
| `photo` | C04 |
| `file` | C04 |
| `datetime` | C12 |
| `location` | C12 |
| `article-list` | C08 (LagerPilot) |
| `customer-data` | C08 (LagerPilot) |
| `repeater` | C12 |
| `qrcode` | C12 |
| `barcode` | C12 |

---

## 8. UNVERÄNDERLICHE REGELN (FR1–FR7)

Diese Regeln gelten für JEDEN Code-Change. NIEMALS brechen.

```
FR1  MODULARER ANSATZ
     Neue Features als eigenständige Hooks/Komponenten.
     NIE bestehende Funktionen umschreiben.
     Kommentar-Block pro Feature:
     // ═══ FEATURE: [Name] (Chat CXX) ═══

FR2  FEATURE-FLAGS
     Jedes Feature → fp_{name} = true|false.
     Wenn Flag fehlt/undefined → Feature deaktiviert (graceful fallback).
     Prefix "fp_" unterscheidet FormPilot-Flags von LagerPilot-Flags.

FR3  SCHEMA-KOMPATIBILITÄT
     Formular-Schema MUSS abwärtskompatibel bleiben.
     Neue Feld-Typen dürfen bestehende Formulare NICHT brechen.
     IMMER Fallbacks: (field.x || defaultValue).
     Unbekannte Typen → <InfoBox> mit Hinweis.

FR4  LAGERPILOT-KOMPATIBILITÄT
     - Selbes S-Objekt / CSS-Variablen-System
     - Selbe Auth-Schicht (Supabase Auth, JWT, Rollen)
     - Selbe Offline-Queue-Architektur
     - Selbe org_id Multi-Tenancy
     - FormPilot MUSS als Tab/Modul in LagerPilot einbettbar sein

FR5  DATEN-ISOLATION
     FormPilot nutzt eigenes Supabase-Schema "formpilot".
     Verweise auf LagerPilot-Daten (sites, bookings, articles) nur via
     READ-ONLY Queries. FormPilot schreibt NIE in LagerPilot-Tabellen.

FR6  REGRESSIONS-TEST nach jedem Feature:
     - Formular erstellen (Builder)
     - Formular ausfüllen (Filler)
     - Signatur + Foto (ab C04)
     - PDF erzeugen (ab C05)
     - Offline-Modus (ab C07)
     - Navigation + Login

FR7  CODE-ABSCHLUSS
     Am Ende JEDES Chats/Tasks muss der KOMPLETTE CODE als fertiges
     Artefakt vorliegen — fehlerfrei, lauffähig, alle Features integriert.
```

---

## 9. ENTWICKLUNGSPLAN — Die 15 Chats

### Chat-Übersicht

| Chat | Thema | Status | Input → Output |
|------|-------|--------|----------------|
| **C01** | Core Engine + Filler | ✅ fertig | — → formpilot-1.jsx |
| **C02** | Builder Grundgerüst | ✅ fertig | formpilot-1.jsx → formpilot-2-2.jsx |
| **C03** | Builder Polish + Prüfung | ⬜ NÄCHSTER | formpilot-2-2.jsx → formpilot-3.jsx |
| **C04** | Signatur + Foto + Kamera | ⬜ | formpilot-3.jsx → formpilot-4.jsx |
| **C05** | PDF-Generierung + Vorschau | ⬜ | formpilot-4.jsx → formpilot-5.jsx |
| **C06** | Email + Dashboard + CSV | ⬜ | formpilot-5.jsx → formpilot-6.jsx |
| **C07** | Offline + Vorlagen-Bibliothek | ⬜ | formpilot-6.jsx → formpilot-7.jsx |
| **C08** | LagerPilot-Bridge | ⬜ | formpilot-7.jsx → formpilot-8.jsx |
| **C09** | Berechtigungen + Multi-Tenancy | ⬜ | formpilot-8.jsx → formpilot-9.jsx |
| **C10** | Analytics Dashboard + Charts | ⬜ | formpilot-9.jsx → formpilot-10.jsx |
| **C11** | Branding + White-Label | ⬜ | formpilot-10.jsx → formpilot-11.jsx |
| **C12** | Erweiterte Felder + Repeater | ⬜ | formpilot-11.jsx → formpilot-12.jsx |
| **C13** | Automationen + API + Webhooks | ⬜ | formpilot-12.jsx → formpilot-13.jsx |
| **C14** | Performance + Error Handling + A11y | ⬜ | formpilot-13.jsx → formpilot-14.jsx |
| **C15** | Finale Abnahme + Migration | ⬜ | formpilot-14.jsx → formpilot-final.jsx |

### Abhängigkeits-Graph

```
C01 ✅ ──┬──► C02 ✅ (Builder) ──► C03 (Builder Polish)
         ├──► C04 (Signatur/Foto)
         └──► C05 (PDF) ──► C06 (Email/Dashboard)
C03+C04+C06 ──► C07 (Offline + Vorlagen)
C07 ──► C08 (LagerPilot)
C08 ──► C09 (Berechtigungen)
C09 ──► C10 (Analytics)
C10 ──► C11 (Branding)
C11 ──► C12 (Erw. Felder)
C12 ──► C13 (Automationen + API)
C13 ──► C14 (Performance)
C14 ──► C15 (Final)
```

### Feature-Vergleich: FormPilot vs. Markt

| Feature | smap one | Offpaper | FormPilot Status |
|---------|----------|----------|-----------------|
| Drag & Drop Builder | ✅ | ✅ | ✅ C02 (Grundgerüst) |
| Mobile Filler | ✅ | ✅ | ✅ C01 |
| Conditional Logic | ✅ | ✅ | ✅ C01 |
| Signatur | ✅ | ✅ | ⬜ C04 |
| Fotos | ✅ | ✅ | ⬜ C04 |
| PDF-Export | ✅ | ✅ | ⬜ C05 |
| E-Mail-Versand | ✅ | ✅ | ⬜ C06 |
| Offline | ✅ | ⚠️ | ⬜ C07 |
| Vorlagen-Bibliothek | ✅ | ✅ | ⬜ C07 |
| Repeater-Felder | ✅ | ✅ | ⬜ C12 |
| GPS/Location | ✅ | ⚠️ | ⬜ C12 |
| Berechtigungen | ✅ | ✅ | ⬜ C09 |
| Dashboard/Analytics | ✅ | ⚠️ | ⬜ C10 |
| Branding/White-Label | ✅ | ✅ | ⬜ C11 |
| API/Webhooks | ✅ | ❌ | ⬜ C13 |
| **Lagerverwaltung** | ❌ | ❌ | **⬜ C08 — USP!** |

---

## 10. C03 — NÄCHSTER SCHRITT (Builder Polish)

### Was C03 beinhaltet

1. **Live-Vorschau** mit Device-Toggle (Mobile/Tablet/Desktop) — FormFiller rendert das aktuelle Schema in Echtzeit
2. **Undo/Redo** (min. 20 Schritte + Keyboard Shortcuts Ctrl+Z / Ctrl+Shift+Z)
3. **Feld-Duplikation** (Rechtsklick oder Button)
4. **Drag-Feedback perfektionieren** (Schatten, Drop-Indikator ●——●, Pulse-Animation)
5. **Auto-Select + Auto-Focus** bei neuem Feld (Label sofort editierbar)
6. **Options-Editor verbessern** (Enter → neue Option, Tab → nächste, Backspace → löschen)
7. **Keyboard Shortcuts** (Ctrl+S speichern, Ctrl+Z undo, Del löschen, etc.)
8. **Half/Third Felder nebeneinander** im Canvas darstellen
9. **Schema-Validierung** beim Speichern (Name vorhanden, keine leeren Seiten, keine zirkulären Bedingungen)
10. **Performance bei vielen Feldern** (React.memo, Debounce)
11. **Vollständige Prüfung** aller Builder-Funktionen + Regression F.1

### Akzeptanzkriterien C03

- Builder öffnen/schließen funktioniert (Admin only)
- 3-Spalten-Layout korrekt (Desktop) / Drawers korrekt (Mobile)
- Alle 12 Feldtypen aus Palette platzierbar (Drag + Klick)
- Feld-Einstellungen: Alle 3 Tabs (Allgemein/Validierung/Bedingungen)
- Conditional Logic im Builder konfigurierbar
- Live-Vorschau zeigt aktuelles Formular
- Undo/Redo funktioniert
- Speichern erzeugt gültiges Schema
- Gespeichertes Template im Filler ausfüllbar
- Regression: Login, Navigation, Filler, Submissions, Drafts

---

## 11. DATENBANK-SCHEMA (für spätere Supabase-Migration)

```sql
CREATE SCHEMA IF NOT EXISTS formpilot;

-- Enums
CREATE TYPE formpilot.form_category AS ENUM (
  'abnahme', 'service', 'mangel', 'pruefung', 'uebergabe', 'custom'
);
CREATE TYPE formpilot.submission_status AS ENUM (
  'draft', 'completed', 'sent', 'archived'
);

-- Formular-Vorlagen
CREATE TABLE formpilot.form_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        formpilot.form_category DEFAULT 'custom',
  version         INT NOT NULL DEFAULT 1,
  schema          JSONB NOT NULL,
  pdf_settings    JSONB DEFAULT '{}'::JSONB,
  email_template  JSONB DEFAULT '{}'::JSONB,
  lagerpilot_binding JSONB DEFAULT '{}'::JSONB,
  is_template     BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id)
);

-- Ausgefüllte Formulare
CREATE TABLE formpilot.submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id     UUID NOT NULL REFERENCES formpilot.form_templates(id),
  template_version INT NOT NULL DEFAULT 1,
  status          formpilot.submission_status DEFAULT 'draft',
  data            JSONB NOT NULL DEFAULT '{}'::JSONB,
  site_id         UUID REFERENCES public.sites(id),
  customer_name   TEXT,
  customer_email  TEXT,
  signatures      JSONB DEFAULT '[]'::JSONB,
  photos          JSONB DEFAULT '[]'::JSONB,
  pdf_path        TEXT,
  pdf_generated_at TIMESTAMPTZ,
  email_sent      BOOLEAN DEFAULT FALSE,
  email_sent_at   TIMESTAMPTZ,
  email_to        TEXT,
  gps_lat         NUMERIC(9,6),
  gps_lng         NUMERIC(9,6),
  filled_by       UUID NOT NULL REFERENCES auth.users(id),
  filled_by_name  TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id)
);

-- Audit Trail
CREATE TABLE formpilot.submission_audit (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id   UUID NOT NULL REFERENCES formpilot.submissions(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id),
  user_name       TEXT,
  changes         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE formpilot.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE formpilot.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formpilot.submission_audit ENABLE ROW LEVEL SECURITY;

-- Alle Policies filtern via org_id aus profiles
CREATE POLICY "fp_templates_org" ON formpilot.form_templates
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "fp_submissions_org" ON formpilot.submissions
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Storage Bucket
-- formpilot-files/
--   signatures/{submission_id}/{field_id}.png
--   photos/{submission_id}/{field_id}_{index}.jpg
--   pdfs/{submission_id}.pdf
```

---

## 12. LAGERPILOT-INTEGRATION (Phase 3, Chat C08)

### Integration als LagerPilot-Tab

```jsx
// In lagerverwaltung-{version}.jsx:
{ id: 'forms', label: '📋 Formulare', icon: '📋', permission: 'forms.view' }

case 'forms':
  return <FormPilotModule
    supabase={supabase}
    orgId={data.orgId}
    userId={session.user.id}
    siteId={selectedSite?.id}
    theme={S}
  />;
```

### Datenbrücke (READ-ONLY!)

| LagerPilot-Daten | FormPilot-Nutzung |
|-------------------|-------------------|
| `sites` (Baustellen) | Dropdown, Auto-Prefill Adresse/Kunde |
| `bookings` (Buchungen) | Artikel-Liste im Abnahmeformular |
| `articles` (Artikelstamm) | Referenz in Checklisten |
| `profiles` (User) | Monteur-Name für Signatur |
| `customers` (via sites) | Kundendaten-Prefill, E-Mail |

---

## 13. DEMO-USER (Entwicklungsmodus)

| User | Email | PIN | Rolle | Kann |
|------|-------|-----|-------|------|
| Max Admin | admin@formpilot.de | 1234 | admin | Alles |
| Tom Monteur | tom@formpilot.de | 5678 | monteur | Ausfüllen |
| Lisa Büro | lisa@formpilot.de | 9999 | buero | Ansehen |

---

## 14. DESIGN-PRINZIPIEN

1. **Mobile-First** — 90% Nutzung auf Tablet/Handy auf der Baustelle
2. **Große Touch-Targets** — Min 44×44px, Signatur-Canvas mind. 300px hoch
3. **Progressive Disclosure** — Nur sichtbar was relevant (Conditional Logic)
4. **Offline-tolerant** — Alles muss ohne Netz funktionieren
5. **Schnell ausfüllbar** — Auto-Prefill, Defaults, Quick-Input
6. **Baustellentauglich** — Hoher Kontrast, große Schrift

### Style-System (S-Objekt)

```javascript
const S = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#f0c040',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    bg: '#f1f5f9',
    bgCard: 'rgba(255,255,255,0.82)',
    bgInput: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    // ...
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  font: { sans: "'DM Sans', -apple-system, ...", mono: "'JetBrains Mono', monospace" },
  glass: { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px) saturate(180%)' },
};
```

---

## 15. n8n-WORKFLOWS (Prod)

| Workflow | Trigger | Aktion |
|----------|---------|--------|
| `fp-generate-pdf` | Webhook POST | HTML → Puppeteer → PDF → Supabase Storage |
| `fp-send-email` | Webhook POST | PDF aus Storage → SMTP versenden |
| `fp-submission-notify` | DB Trigger | Push/Mail an Admin bei completed |
| `fp-cleanup-drafts` | Cron (wöchentlich) | Drafts > 30 Tage archivieren |

---

## 16. WORKFLOW FÜR CLAUDE CODE

### Empfohlene Projektstruktur auf MacBook

```
~/projects/formpilot/
├── HANDOVER.md              # Dieses Dokument
├── formpilot-masterprompt.md # Architektur-Referenz
├── C00-uebersicht.md        # Chat-Plan + Regeln
├── src/
│   └── formpilot-2-2.jsx    # Aktueller Code (Startpunkt)
├── prompts/                  # Optional: Chat-Prompts pro Phase
│   ├── C03-builder-polish.md
│   ├── C04-signatur-foto.md
│   └── ...
└── docs/
    └── schema-reference.md   # Schema-Doku
```

### Arbeitsweise mit Claude Code

**Option A: Weiter als Single-File (empfohlen für jetzt)**
- Datei bleibt `formpilot-X.jsx`, Versionierung über Dateinamen
- Pro Feature: Code erweitern, Regression prüfen, Version hochzählen
- Vorteil: Identisch zur bisherigen Arbeitsweise, kein Refactoring nötig

**Option B: Multi-File Split (erst ab C14/C15)**
- Komponenten in separate Dateien aufteilen
- Build-System (Vite) einrichten
- Sinnvoll erst wenn die App feature-complete ist

### Pro Task an Claude Code

```bash
# Claude Code Context laden:
# 1. HANDOVER.md als Referenz
# 2. Aktuelle .jsx Datei
# 3. Spezifische Aufgabe (z.B. C03 Builder Polish)

claude "Lies HANDOVER.md für den Projektkontext.
Arbeite an C03: Builder Polish für formpilot-2-2.jsx.
Implementiere Live-Vorschau, Undo/Redo, Feld-Duplikation.
Regeln FR1–FR7 beachten. Output: formpilot-3.jsx"
```

---

## 17. CHECKLISTE — Vollständigkeit dieser Übergabe

- [x] Projektstatus und aktueller Stand
- [x] Was ist FormPilot (Produkt-Vision)
- [x] Techstack komplett
- [x] Alle existierenden Dateien aufgelistet
- [x] Aktueller Code: Was ist implementiert, was fehlt
- [x] Feature-Flags dokumentiert
- [x] Architektur: Komponenten-Hierarchie + Datenfluss
- [x] Persistenz-Keys (window.storage)
- [x] Formular-Schema (JSON) vollständig dokumentiert
- [x] Alle Feld-Typen (implementiert + geplant)
- [x] Conditional Logic Schema
- [x] Regeln FR1–FR7 vollständig
- [x] 15-Chat-Entwicklungsplan mit Abhängigkeiten
- [x] Feature-Vergleich vs. Wettbewerb
- [x] Nächster Schritt (C03) detailliert beschrieben
- [x] Datenbank-Schema für Supabase-Migration
- [x] LagerPilot-Integration dokumentiert
- [x] Demo-User und PINs
- [x] Design-Prinzipien + S-Objekt
- [x] n8n-Workflows
- [x] Empfohlener Workflow für Claude Code
- [x] Chat-History: Alle relevanten Entscheidungen aus 2 Chats extrahiert

---

*Ende der Projektübergabe. Viel Erfolg mit Claude Code!*
