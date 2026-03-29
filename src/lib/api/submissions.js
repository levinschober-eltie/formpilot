// ═══ FEATURE: Submissions CRUD — drop-in replacement for supabase/submissions.js ═══
import { apiFetch } from './client';

export async function getSubmissions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.templateId) params.set('templateId', filters.templateId);
  if (filters.filledBy) params.set('filledBy', filters.filledBy);
  const qs = params.toString();
  const data = await apiFetch(`/api/submissions${qs ? `?${qs}` : ''}`);
  return (data || []).map(mapSubmissionFromDb);
}

export async function getSubmission(id) {
  const data = await apiFetch(`/api/submissions/${id}`);
  return mapSubmissionFromDb(data);
}

export async function saveSubmission(submission) {
  const dbSubmission = mapSubmissionToDb(submission);
  let data;
  if (submission.id) {
    data = await apiFetch(`/api/submissions/${submission.id}`, {
      method: 'PUT',
      body: JSON.stringify(dbSubmission),
    });
  } else {
    data = await apiFetch('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(dbSubmission),
    });
  }
  return mapSubmissionFromDb(data);
}

export async function updateSubmissionStatus(id, status) {
  const data = await apiFetch(`/api/submissions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return mapSubmissionFromDb(data);
}

export async function deleteSubmission(id) {
  await apiFetch(`/api/submissions/${id}`, { method: 'DELETE' });
}

// ═══ DATA MAPPERS (copied from supabase/submissions.js) ═══
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

function mapSubmissionToDb(submission) {
  return {
    id: submission.id || undefined,
    template_id: submission.templateId || null,
    template_version: submission.templateVersion || 1,
    status: submission.status || 'draft',
    data: submission.data || {},
    metadata: { ...(submission.metadata || {}), filledByName: submission.filledByName || '' },
    customer_id: submission.customerId || null,
    project_id: submission.projectId || null,
    completed_at: submission.completedAt || null,
  };
}
