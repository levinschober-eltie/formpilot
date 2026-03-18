// ═══ FEATURE: Templates CRUD (split from supabaseService) ═══
import { supabase } from '../supabase';
import { getOrgId, getCachedProfile } from './auth';

export async function getTemplates() {
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .or(`organization_id.eq.${orgId},is_demo.eq.true`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapTemplateFromDb);
}

export async function getTemplate(id) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapTemplateFromDb(data);
}

export async function saveTemplate(template) {
  const orgId = await getOrgId();
  const profile = await getCachedProfile();
  const dbTemplate = mapTemplateToDb(template, orgId, profile?.id);

  const { data, error } = await supabase
    .from('templates')
    .upsert(dbTemplate, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapTemplateFromDb(data);
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw error;
}

// ═══ DATA MAPPERS ═══
function mapTemplateFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    icon: row.icon,
    version: row.version,
    pages: row.schema?.pages || [],
    fields: row.schema?.fields || [],
    pdfSettings: row.pdf_settings || {},
    emailTemplate: row.email_template || {},
    isDemo: row.is_demo,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    // Preserve any extra schema keys the app may use
    ...row.schema,
    // Ensure pages/fields override schema spread
    ...(row.schema?.pages ? { pages: row.schema.pages } : {}),
  };
}

function mapTemplateToDb(template, orgId, userId) {
  // Extract schema-specific fields from the template
  const { id, name, description, category, icon, version, pages, fields,
    pdfSettings, emailTemplate, isDemo, isArchived,
    organizationId: _organizationId, createdBy: _createdBy,
    createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = template;

  return {
    id: id || undefined,
    organization_id: orgId,
    created_by: userId,
    name,
    description: description || null,
    category: category || 'custom',
    icon: icon || '📋',
    version: version || 1,
    schema: { pages: pages || [], fields: fields || [], ...rest },
    pdf_settings: pdfSettings || {},
    email_template: emailTemplate || {},
    is_demo: isDemo || false,
    is_archived: isArchived || false,
  };
}
