// ═══ FEATURE: Projects CRUD — drop-in replacement for supabase/projects.js ═══
import { apiFetch } from './client';

export async function getProjects() {
  const data = await apiFetch('/api/projects');
  return (data || []).map(mapProjectFromDb);
}

export async function getProject(id) {
  const data = await apiFetch(`/api/projects/${id}`);
  return mapProjectFromDb(data);
}

export async function saveProject(project) {
  const dbProject = mapProjectToDb(project);
  let data;
  if (project.id) {
    data = await apiFetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify(dbProject),
    });
  } else {
    data = await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(dbProject),
    });
  }
  return mapProjectFromDb(data);
}

export async function deleteProject(id) {
  await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
}

// ═══ DATA MAPPERS (copied from supabase/projects.js) ═══
function mapProjectFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    customerId: row.customer_id,
    sharedData: row.shared_data || {},
    phases: row.phases || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationId: row.organization_id,
  };
}

function mapProjectToDb(project) {
  return {
    id: project.id || undefined,
    customer_id: project.customerId || null,
    name: project.name,
    description: project.description || null,
    status: project.status || 'planning',
    shared_data: project.sharedData || {},
    phases: project.phases || [],
  };
}
