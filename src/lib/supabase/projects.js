// ═══ FEATURE: Projects CRUD (split from supabaseService) ═══
import { supabase } from '../supabase';
import { getOrgId } from './auth';

export async function getProjects() {
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProjectFromDb);
}

export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapProjectFromDb(data);
}

export async function saveProject(project) {
  const orgId = await getOrgId();
  const dbProject = mapProjectToDb(project, orgId);
  const { data, error } = await supabase
    .from('projects')
    .upsert(dbProject, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapProjectFromDb(data);
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ═══ DATA MAPPERS ═══
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

function mapProjectToDb(project, orgId) {
  return {
    id: project.id || undefined,
    organization_id: orgId,
    customer_id: project.customerId || null,
    name: project.name,
    description: project.description || null,
    status: project.status || 'planning',
    shared_data: project.sharedData || {},
    phases: project.phases || [],
  };
}
