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

-- Customers: Org-basierter Zugriff
CREATE POLICY "customers_select_own_org" ON customers
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_insert_own_org" ON customers
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_update_own_org" ON customers
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "customers_delete_admin" ON customers
  FOR DELETE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()) AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Projects: Org-basierter Zugriff
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
