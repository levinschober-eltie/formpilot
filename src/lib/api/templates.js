// ═══ FEATURE: Templates CRUD — drop-in replacement for supabase/templates.js ═══
import { apiFetch } from './client';

export async function getTemplates() {
  const data = await apiFetch('/api/templates');
  return (data || []).map(mapTemplateFromDb);
}

export async function getTemplate(id) {
  const data = await apiFetch(`/api/templates/${id}`);
  return mapTemplateFromDb(data);
}

export async function saveTemplate(template) {
  const dbTemplate = mapTemplateToDb(template);
  let data;
  if (template.id) {
    data = await apiFetch(`/api/templates/${template.id}`, {
      method: 'PUT',
      body: JSON.stringify(dbTemplate),
    });
  } else {
    data = await apiFetch('/api/templates', {
      method: 'POST',
      body: JSON.stringify(dbTemplate),
    });
  }
  return mapTemplateFromDb(data);
}

export async function deleteTemplate(id) {
  await apiFetch(`/api/templates/${id}`, { method: 'DELETE' });
}

// ═══ DATA MAPPERS (copied from supabase/templates.js) ═══
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
    isActive: row.is_active ?? true,
    isArchived: row.is_archived,
    visibleForRoles: row.visible_for_roles || ['admin', 'monteur', 'buero'],
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

function mapTemplateToDb(template) {
  // Extract schema-specific fields from the template
  const { id, name, description, category, icon, version, pages, fields,
    pdfSettings, emailTemplate, isDemo, isActive, isArchived, visibleForRoles,
    organizationId: _organizationId, createdBy: _createdBy,
    createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = template;

  return {
    id: id || undefined,
    name,
    description: description || null,
    category: category || 'custom',
    icon: icon || '\u{1F4CB}',
    version: version || 1,
    schema: { pages: pages || [], fields: fields || [], ...rest },
    pdf_settings: pdfSettings || {},
    email_template: emailTemplate || {},
    is_demo: isDemo || false,
    is_active: isActive !== false,
    is_archived: isArchived || false,
    visible_for_roles: visibleForRoles || ['admin', 'monteur', 'buero'],
  };
}
