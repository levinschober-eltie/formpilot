// ═══ FEATURE: Activity Log (split from supabaseService) ═══
import { supabase } from '../supabase';
import { getOrgId, getCachedProfile } from './auth';

export async function logActivity(action, entityType, entityId, details = {}) {
  const orgId = await getOrgId();
  const profile = await getCachedProfile();
  const { error } = await supabase.from('activity_log').insert({
    organization_id: orgId,
    user_id: profile?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
  if (error) console.error('Activity log error:', error);
}

export async function getActivityLog(filters = {}) {
  const orgId = await getOrgId();
  let query = supabase
    .from('activity_log')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(filters.limit || 50);

  if (filters.entityType) query = query.eq('entity_type', filters.entityType);
  if (filters.entityId) query = query.eq('entity_id', filters.entityId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
