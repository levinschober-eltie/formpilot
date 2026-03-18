-- Storage Buckets fuer Fotos und Signaturen
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
