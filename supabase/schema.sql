-- ═══════════════════════════════════════════
--  FormPilot Database Schema
--  Supabase PostgreSQL
-- ═══════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS formpilot;

-- Enums
CREATE TYPE formpilot.form_category AS ENUM (
  'abnahme', 'service', 'mangel', 'pruefung', 'uebergabe', 'custom'
);
CREATE TYPE formpilot.submission_status AS ENUM (
  'draft', 'completed', 'sent', 'archived'
);

-- ─── Formular-Vorlagen ───
CREATE TABLE formpilot.form_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Versionierung
CREATE TABLE formpilot.form_template_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES formpilot.form_templates(id) ON DELETE CASCADE,
  version       INT NOT NULL,
  schema        JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, version)
);

-- ─── Ausgefüllte Formulare ───
CREATE TABLE formpilot.submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES formpilot.form_templates(id),
  template_version INT NOT NULL DEFAULT 1,
  status          formpilot.submission_status DEFAULT 'draft',
  data            JSONB NOT NULL DEFAULT '{}'::JSONB,
  site_id         UUID,  -- Referenz auf LagerPilot sites (optional)
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

-- ─── Audit Trail ───
CREATE TABLE formpilot.submission_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES formpilot.submissions(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id),
  user_name       TEXT,
  changes         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
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

-- Policies: Alle Daten nach org_id isoliert
CREATE POLICY "fp_templates_org" ON formpilot.form_templates
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "fp_submissions_org" ON formpilot.submissions
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "fp_audit_org" ON formpilot.submission_audit
  USING (submission_id IN (
    SELECT id FROM formpilot.submissions
    WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  ));

-- ─── Storage Bucket ───
-- Erstelle in Supabase Dashboard:
-- Bucket: formpilot-files
-- Pfade:
--   signatures/{submission_id}/{field_id}.png
--   photos/{submission_id}/{field_id}_{index}.jpg
--   pdfs/{submission_id}.pdf
