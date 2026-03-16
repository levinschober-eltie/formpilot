-- ═══════════════════════════════════════════
--  FormPilot Database Schema
--  Eigenständiges Supabase-Projekt
-- ═══════════════════════════════════════════

-- ─── Organizations (Multi-Tenancy) ───
CREATE TABLE IF NOT EXISTS public.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Profiles ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'monteur' CHECK (role IN ('admin', 'teamleiter', 'monteur', 'buero')),
  org_id      UUID NOT NULL REFERENCES public.organizations(id),
  pin         TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Enums ───
CREATE TYPE formpilot_form_category AS ENUM (
  'abnahme', 'service', 'mangel', 'pruefung', 'uebergabe', 'custom'
);
CREATE TYPE formpilot_submission_status AS ENUM (
  'draft', 'completed', 'sent', 'archived'
);

-- ─── Formular-Vorlagen ───
CREATE TABLE public.form_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        formpilot_form_category DEFAULT 'custom',
  icon            TEXT DEFAULT '📋',
  version         INT NOT NULL DEFAULT 1,
  schema          JSONB NOT NULL,
  pdf_settings    JSONB DEFAULT '{}'::JSONB,
  email_template  JSONB DEFAULT '{}'::JSONB,
  is_system       BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id)
);

-- ─── Template-Versionierung ───
CREATE TABLE public.form_template_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  version       INT NOT NULL,
  schema        JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, version)
);

-- ─── Ausgefüllte Formulare ───
CREATE TABLE public.submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES public.form_templates(id),
  template_version INT NOT NULL DEFAULT 1,
  status          formpilot_submission_status DEFAULT 'draft',
  data            JSONB NOT NULL DEFAULT '{}'::JSONB,
  customer_name   TEXT,
  customer_email  TEXT,
  project_name    TEXT,
  project_address TEXT,
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

-- ─── Audit Trail ───
CREATE TABLE public.submission_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id),
  user_name       TEXT,
  changes         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ───
CREATE INDEX idx_fp_templates_org ON public.form_templates(org_id) WHERE active = TRUE;
CREATE INDEX idx_fp_submissions_org ON public.submissions(org_id, status);
CREATE INDEX idx_fp_submissions_template ON public.submissions(template_id);
CREATE INDEX idx_fp_audit_submission ON public.submission_audit(submission_id);
CREATE INDEX idx_fp_profiles_org ON public.profiles(org_id);

-- ─── RLS ───
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_audit ENABLE ROW LEVEL SECURITY;

-- Org-Zugehörigkeit prüfen
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations: Nur eigene Org sehen
CREATE POLICY "org_own" ON public.organizations
  USING (id = public.get_user_org_id());

-- Profiles: Nur Mitglieder der eigenen Org
CREATE POLICY "profiles_own_org" ON public.profiles
  USING (org_id = public.get_user_org_id());

-- Templates: Nur eigene Org
CREATE POLICY "templates_own_org" ON public.form_templates
  USING (org_id = public.get_user_org_id());

-- Submissions: Nur eigene Org
CREATE POLICY "submissions_own_org" ON public.submissions
  USING (org_id = public.get_user_org_id());

-- Audit: Nur Submissions der eigenen Org
CREATE POLICY "audit_own_org" ON public.submission_audit
  USING (submission_id IN (
    SELECT id FROM public.submissions
    WHERE org_id = public.get_user_org_id()
  ));

-- ─── Trigger: updated_at automatisch setzen ───
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_templates BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_submissions BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Auto-Profil bei Signup ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, org_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'monteur'),
    (NEW.raw_user_meta_data->>'org_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Storage Bucket ───
-- Im Supabase Dashboard erstellen:
-- Bucket: formpilot-files (public: false)
-- Pfade:
--   signatures/{submission_id}/{field_id}.png
--   photos/{submission_id}/{field_id}_{index}.jpg
--   pdfs/{submission_id}.pdf

-- ─── Seed: Demo-Organisation ───
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Betrieb', 'demo')
ON CONFLICT DO NOTHING;
