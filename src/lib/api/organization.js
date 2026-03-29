// ═══ FEATURE: Organization management — drop-in replacement for supabase/organization.js ═══
// Organization + Profile creation is handled by the /api/auth/register endpoint.
// These stubs exist for backwards compatibility.

import { clearProfileCache } from './auth';

export async function createOrganization(name, slug) {
  // Handled by register endpoint — return a stub
  return {
    id: null,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  };
}

export async function createProfile(userId, orgId, name, email, role, pin = null) {
  // Handled by register endpoint — return a stub
  clearProfileCache();
  return {
    id: userId,
    organization_id: orgId,
    name,
    email,
    role,
    pin,
  };
}
