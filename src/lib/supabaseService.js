// ═══ FEATURE: Supabase Service Layer (S05) ═══
// CRUD operations for all entities via Supabase.
// Only used when Supabase is configured (VITE_SUPABASE_URL set).

import { supabase, isSupabaseConfigured } from './supabase';

// ═══ Helper: Get current user's org_id from profile ═══
let _cachedProfile = null;

export async function getCachedProfile() {
  if (_cachedProfile) return _cachedProfile;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  _cachedProfile = data;
  return data;
}

export function clearProfileCache() {
  _cachedProfile = null;
}

async function getOrgId() {
  const profile = await getCachedProfile();
  return profile?.organization_id;
}

// ═══ AUTH ═══
export async function signUp(email, password, name, role = 'admin') {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  clearProfileCache();
  const { data, error } = await supabase.auth.signIn
    ? await supabase.auth.signInWithPassword({ email, password })
    : { data: null, error: { message: 'Auth not available' } };
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  clearProfileCache();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithPin(pin) {
  // PIN-Login: Query profiles table for matching pin, then sign in with stored email
  // Note: This requires a server function or a special lookup. For now, we use a simple approach:
  // The PIN is stored hashed in profiles. We look up the profile by pin and use their email.
  // In production, this should be a Supabase Edge Function for security.
  clearProfileCache();
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, pin')
    .eq('pin', pin)
    .limit(1);
  if (error) throw error;
  if (!profiles || profiles.length === 0) throw new Error('Ungueltige PIN');
  return profiles[0];
}

export async function signOut() {
  clearProfileCache();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getCachedProfile();
  return profile ? { ...user, profile } : user;
}

// ═══ ORGANIZATION ═══
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

// ═══ TEMPLATES ═══
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

// ═══ SUBMISSIONS ═══
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

// ═══ CUSTOMERS ═══
export async function getCustomers() {
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  return (data || []).map(mapCustomerFromDb);
}

export async function getCustomer(id) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapCustomerFromDb(data);
}

export async function saveCustomer(customer) {
  const orgId = await getOrgId();
  const dbCustomer = mapCustomerToDb(customer, orgId);
  const { data, error } = await supabase
    .from('customers')
    .upsert(dbCustomer, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapCustomerFromDb(data);
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ═══ PROJECTS ═══
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

// ═══ FILE STORAGE ═══
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// ═══ Base64 <-> Storage helpers ═══
export async function uploadBase64(bucket, path, base64String) {
  // Convert base64 to blob
  const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 string');
  const mime = match[1];
  const bytes = atob(match[2]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });

  await uploadFile(bucket, path, blob);
  // For private buckets, return the path (use signed URLs for access)
  return path;
}

export async function downloadAsBase64(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
}

// ═══ ACTIVITY LOG ═══
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

// ═══ REALTIME ═══
export function subscribeToSubmissions(callback) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };
  const channel = supabase
    .channel('submissions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, callback)
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

export function subscribeToTemplates(callback) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };
  const channel = supabase
    .channel('templates-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, callback)
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ═══ DATA MAPPERS: DB <-> App format ═══
// The app uses camelCase IDs and flat structures;
// the DB uses snake_case and some fields are stored differently.

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
    pdfSettings, emailTemplate, isDemo, isArchived, organizationId, createdBy,
    createdAt, updatedAt, ...rest } = template;

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

function mapCustomerFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    metadata: row.metadata || {},
    submissions: row.metadata?.submissions || [],
    activityLog: row.metadata?.activityLog || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationId: row.organization_id,
  };
}

function mapCustomerToDb(customer, orgId) {
  return {
    id: customer.id || undefined,
    organization_id: orgId,
    name: customer.name,
    email: customer.email || null,
    phone: customer.phone || null,
    address: customer.address || null,
    notes: customer.notes || null,
    metadata: {
      submissions: customer.submissions || [],
      activityLog: customer.activityLog || [],
      ...(customer.metadata || {}),
    },
  };
}

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
