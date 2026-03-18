# FormPilot — Prompt 07: Supabase Cloud-Migration (S05)

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`
> **WICHTIG:** Starte diesen Prompt ERST wenn Prompts 01-06 abgeschlossen und gemerged sind!

---

## Kontext

FormPilot ist eine React/Vite PWA die aktuell ALLES in **localStorage + IndexedDB** speichert. Du migrierst den gesamten Datenlayer zu **Supabase** (PostgreSQL + Auth + Storage + Realtime). Der Supabase-Client ist bereits initialisiert (`src/lib/supabase.js`), aber nicht aktiv genutzt.

### Regeln
- FR1: Modular. Neuen Supabase-Layer als Service, bestehende Komponenten nutzen ihn über existierende Storage-API.
- FR3: Schema abwärtskompatibel. Bestehende localStorage-Daten müssen migrierbar sein.
- FR4: Eigene Supabase-Instanz (Auth, Storage, Realtime).
- FR6: `npm run build` muss durchlaufen.
- **KRITISCH:** RLS (Row Level Security) von Anfang an auf JEDER Tabelle!

### Aktueller Stand
- `src/lib/storage.js` — Abstraktions-Layer (storageGet/storageSet) über localStorage + IndexedDB
- `src/lib/supabase.js` — Client initialisiert, aber nicht genutzt
- Alle Daten unter `fp_*` Keys in localStorage
- Demo-User: Hardcoded in `src/config/constants.js`

---

## Aufgabe 1: Datenbank-Schema (SQL)

### Neue Datei: `supabase/migrations/001_initial_schema.sql`

Erstelle das komplette PostgreSQL-Schema:

```sql
-- =====================================================
-- FormPilot Database Schema
-- =====================================================

-- 1. ORGANIZATIONS (Mandantenfähigkeit vorbereitet)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',  -- company_name, logo, address, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'monteur', 'buero')),
  pin TEXT, -- For quick login (hashed)
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEMPLATES
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('service', 'abnahme', 'mangel', 'pruefung', 'uebergabe', 'custom')),
  icon TEXT DEFAULT '📋',
  version INTEGER DEFAULT 1,
  schema JSONB NOT NULL,  -- Das komplette Template-Schema (pages, fields, etc.)
  pdf_settings JSONB DEFAULT '{}',
  email_template JSONB DEFAULT '{}',
  is_demo BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBMISSIONS
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  template_id UUID REFERENCES templates(id),
  template_version INTEGER DEFAULT 1,
  filled_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'sent', 'archived')),
  data JSONB NOT NULL DEFAULT '{}',  -- Alle Feldwerte
  metadata JSONB DEFAULT '{}',  -- GPS, device info, etc.
  customer_id UUID REFERENCES customers(id),
  project_id UUID REFERENCES projects(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  customer_id UUID REFERENCES customers(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  shared_data JSONB DEFAULT '{}',
  phases JSONB DEFAULT '[]',  -- Array of phase objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY_LOG (Audit-Trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'submission.created', 'template.updated', etc.
  entity_type TEXT NOT NULL, -- 'submission', 'template', 'customer', 'project'
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_templates_org ON templates(organization_id);
CREATE INDEX idx_submissions_org ON submissions(organization_id);
CREATE INDEX idx_submissions_template ON submissions(template_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_filled_by ON submissions(filled_by);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Neue Datei: `supabase/migrations/002_rls_policies.sql`

```sql
-- =====================================================
-- Row Level Security — JEDE Tabelle braucht RLS!
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: User sieht nur eigene Organisation
CREATE POLICY "profiles_select_own_org" ON profiles
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Templates: Org-Mitglieder sehen alle Templates ihrer Org
CREATE POLICY "templates_select_own_org" ON templates
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR is_demo = true
  );

CREATE POLICY "templates_insert_admin_buero" ON templates
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'buero')
  );

CREATE POLICY "templates_update_admin_buero" ON templates
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'buero')
  );

CREATE POLICY "templates_delete_admin" ON templates
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Submissions: Org-Mitglieder sehen alle, erstellen eigene
CREATE POLICY "submissions_select_own_org" ON submissions
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "submissions_insert_own_org" ON submissions
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "submissions_update_own_org" ON submissions
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "submissions_delete_admin" ON submissions
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Customers & Projects: Gleiche Logik wie Submissions
CREATE POLICY "customers_select_own_org" ON customers
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_insert_own_org" ON customers
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_update_own_org" ON customers
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_delete_admin" ON customers
  FOR DELETE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()) AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "projects_select_own_org" ON projects
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "projects_insert_own_org" ON projects
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "projects_update_own_org" ON projects
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "projects_delete_admin" ON projects
  FOR DELETE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()) AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Activity Log: Lesen Org, Schreiben alle (automatisch)
CREATE POLICY "activity_log_select_own_org" ON activity_log
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "activity_log_insert_own_org" ON activity_log
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Organizations: Nur eigene Org sehen
CREATE POLICY "organizations_select_own" ON organizations
  FOR SELECT USING (id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "organizations_update_admin" ON organizations
  FOR UPDATE USING (id = (SELECT organization_id FROM profiles WHERE id = auth.uid()) AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Neue Datei: `supabase/migrations/003_storage_buckets.sql`

```sql
-- Storage Buckets für Fotos und Signaturen
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage Policies
CREATE POLICY "submissions_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');

CREATE POLICY "submissions_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');

CREATE POLICY "logos_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
```

---

## Aufgabe 2: Supabase Service Layer

### Neue Datei: `src/lib/supabaseService.js`

Erstelle CRUD-Funktionen die den gleichen Datenfluss wie der bestehende localStorage-Layer haben:

```javascript
import { supabase } from './supabase';

// === AUTH ===
export async function signUp(email, password, name, role) { ... }
export async function signIn(email, password) { ... }
export async function signInWithPin(pin) { ... }  // Quick-Login für Monteure
export async function signOut() { ... }
export async function getCurrentUser() { ... }

// === TEMPLATES ===
export async function getTemplates() { ... }
export async function getTemplate(id) { ... }
export async function saveTemplate(template) { ... }  // Upsert
export async function deleteTemplate(id) { ... }

// === SUBMISSIONS ===
export async function getSubmissions(filters = {}) { ... }
export async function getSubmission(id) { ... }
export async function saveSubmission(submission) { ... }  // Upsert
export async function updateSubmissionStatus(id, status) { ... }
export async function deleteSubmission(id) { ... }

// === CUSTOMERS ===
export async function getCustomers() { ... }
export async function getCustomer(id) { ... }
export async function saveCustomer(customer) { ... }
export async function deleteCustomer(id) { ... }

// === PROJECTS ===
export async function getProjects() { ... }
export async function getProject(id) { ... }
export async function saveProject(project) { ... }
export async function deleteProject(id) { ... }

// === FILE STORAGE ===
export async function uploadFile(bucket, path, file) { ... }
export async function getFileUrl(bucket, path) { ... }
export async function deleteFile(bucket, path) { ... }

// === ACTIVITY LOG ===
export async function logActivity(action, entityType, entityId, details) { ... }
export async function getActivityLog(filters) { ... }

// === REALTIME ===
export function subscribeToSubmissions(orgId, callback) { ... }
export function subscribeToTemplates(orgId, callback) { ... }
```

**WICHTIG: Foto/Signatur-Migration:**
- Aktuell: Base64-Strings in formData (riesig, in localStorage)
- Neu: Files in Supabase Storage hochladen, nur URL in formData speichern
- Upload-Funktion: Base64 → Blob → Upload → URL zurück
- Download: URL → Fetch → Base64 (für Canvas/Anzeige)

### Neue Datei: `src/lib/storageAdapter.js`

Ein Adapter der zwischen localStorage und Supabase umschaltet:

```javascript
const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL;

export async function getData(key) {
  if (USE_SUPABASE) {
    return supabaseService.get(key);
  }
  return localStorageService.get(key);
}

// ... etc.
```

Der Adapter stellt sicher dass die App sowohl mit als auch ohne Supabase funktioniert (Fallback auf localStorage).

---

## Aufgabe 3: Auth-Umstellung

### Erweitere: `src/components/layout/LoginScreen.jsx`

Aktuell: Hardcoded PIN-Login gegen `constants.js` User-Liste.

Neuer Flow:
1. **Supabase konfiguriert?** → Email + Password Login (mit "Passwort vergessen")
2. **Quick-Login (Monteur):** PIN-Eingabe → `signInWithPin()` → Supabase-Session
3. **Supabase NICHT konfiguriert?** → Bestehender Demo-Login (Fallback)
4. **Registrierung:** Neuer Screen für Ersteinrichtung (Organisation + Admin-User)

### Neue Datei: `src/components/layout/RegisterScreen.jsx`

Ersteinrichtung:
1. Organisationsname
2. Admin-Name, Email, Passwort
3. → Supabase Account erstellen
4. → Organization erstellen
5. → Profile erstellen
6. → Dashboard anzeigen

### Session-Management

In `App.jsx`:
- `supabase.auth.onAuthStateChange()` Listener
- User-State aus Supabase statt localStorage
- Auth-Guard: Nicht-eingeloggte User → Login-Screen
- Session-Refresh: Automatisch über Supabase

---

## Aufgabe 4: Daten-Migration

### Neue Datei: `src/lib/dataMigration.js`

Funktion die bestehende localStorage-Daten zu Supabase migriert:

```javascript
export async function migrateLocalDataToSupabase(userId, orgId) {
  // 1. Templates aus localStorage lesen
  // 2. Für jedes Template: In Supabase speichern
  // 3. Submissions migrieren (inkl. Base64 → Storage Upload)
  // 4. Customers migrieren
  // 5. Projects migrieren
  // 6. Nach erfolgreicher Migration: localStorage-Daten als "migriert" markieren
  // 7. Fehlerbehandlung: Teilweise Migration → Fortsetzen wo abgebrochen
  // Gibt { migrated: { templates: 5, submissions: 23, ... }, errors: [] } zurück
}
```

**Migration-UI:** Banner in Settings: "Du hast lokale Daten. Möchtest du sie in die Cloud migrieren?" → Button → Progress-Anzeige → Ergebnis

---

## Aufgabe 5: App.jsx Anpassung

Passe `App.jsx` an:
- State-Management: Daten aus Supabase statt localStorage laden
- Loading-State beim initialen Laden
- Error-Boundary für Netzwerkfehler
- Realtime-Subscriptions für live Updates
- **Behalte Fallback auf localStorage** wenn Supabase nicht konfiguriert ist

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **Ohne Supabase (.env leer):**
   - [ ] App startet normal mit localStorage (wie bisher)
   - [ ] Alle Features funktionieren (KOMPLETTE Regression!)
   - [ ] Kein Crash, keine Fehler in Console

3. **Mit Supabase:**
   - [ ] Registrierung → Organisation + User erstellt
   - [ ] Login → Dashboard zeigt leere Daten
   - [ ] Template erstellen → In Supabase gespeichert
   - [ ] Formular ausfüllen → Submission in Supabase
   - [ ] Fotos → In Supabase Storage hochgeladen
   - [ ] Zweiter Browser/Tab → Gleiche Daten sichtbar (Cloud-Sync!)
   - [ ] Logout → Login → Daten sind noch da

4. **Migration:**
   - [ ] Lokale Daten vorhanden → Migrations-Banner erscheint
   - [ ] Migration starten → Progress-Anzeige
   - [ ] Nach Migration: Alle Daten in Supabase vorhanden
   - [ ] Fotos/Signaturen in Storage (nicht mehr Base64 in JSON)

5. **RLS testen:**
   - [ ] User A sieht NUR Daten seiner Organisation
   - [ ] Monteur kann Submissions erstellen aber NICHT Templates löschen
   - [ ] Admin kann alles

6. **SQL Migrations:**
   - [ ] Migrations-Dateien sind syntaktisch korrekt
   - [ ] Können in leerer Supabase-Instanz ausgeführt werden
   - [ ] Alle Tabellen, Indexes, Policies werden erstellt

---

## Dateien die geändert werden

- `src/lib/supabase.js` — Erweitern
- `src/lib/storage.js` — Adapter-Logic
- `src/components/layout/LoginScreen.jsx` — Auth-Flow
- `src/components/layout/SettingsScreen.jsx` — Migrations-UI
- `src/App.jsx` — State-Management, Auth-Guard
- NEUE Dateien: supabaseService.js, storageAdapter.js, dataMigration.js, RegisterScreen.jsx, SQL-Migrations
