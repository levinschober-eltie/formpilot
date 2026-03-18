// ═══ FEATURE: Submissions CRUD (split from supabaseService) ═══
import { supabase } from '../supabase';
import { getOrgId, getCachedProfile } from './auth';

export async function getSubmissions(filters = {}) {
  const orgId = await getOrgId();
  let query = supabase
    .from('submissions')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.templateId) query = query.eq('template_id', filters.templateId);
  if (filters.filledBy) query = query.eq('filled_by', filters.filledBy);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapSubmissionFromDb);
}

export async function getSubmission(id) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapSubmissionFromDb(data);
}

export async function saveSubmission(submission) {
  const orgId = await getOrgId();
  const profile = await getCachedProfile();
  const dbSubmission = mapSubmissionToDb(submission, orgId, profile?.id);

  const { data, error } = await supabase
    .from('submissions')
    .upsert(dbSubmission, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapSubmissionFromDb(data);
}

export async function updateSubmissionStatus(id, status) {
  const updates = { status };
  if (status === 'completed') updates.completed_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapSubmissionFromDb(data);
}

export async function deleteSubmission(id) {
  const { error } = await supabase.from('submissions').delete().eq('id', id);
  if (error) throw error;
}

// ═══ DATA MAPPERS ═══
function mapSubmissionFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    templateId: row.template_id,
    templateVersion: row.template_version,
    status: row.status,
    data: row.data || {},
    metadata: row.metadata || {},
    filledBy: row.filled_by,
    filledByName: row.metadata?.filledByName || '',
    customerId: row.customer_id,
    projectId: row.project_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationId: row.organization_id,
  };
}

function mapSubmissionToDb(submission, orgId, userId) {
  return {
    id: submission.id || undefined,
    organization_id: orgId,
    template_id: submission.templateId || null,
    template_version: submission.templateVersion || 1,
    filled_by: userId,
    status: submission.status || 'draft',
    data: submission.data || {},
    metadata: { ...(submission.metadata || {}), filledByName: submission.filledByName || '' },
    customer_id: submission.customerId || null,
    project_id: submission.projectId || null,
    completed_at: submission.completedAt || null,
  };
}
