// ═══ FEATURE: Organization management (split from supabaseService) ═══
import { supabase } from '../supabase';
import { clearProfileCache } from './auth';

export async function createOrganization(name, slug) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-') })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createProfile(userId, orgId, name, email, role, pin = null) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, organization_id: orgId, name, email, role, pin })
    .select()
    .single();
  if (error) throw error;
  clearProfileCache();
  return data;
}
