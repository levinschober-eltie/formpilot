// ═══ FEATURE: Auth & Profile — drop-in replacement for supabase/auth.js ═══
import { apiFetch, setSessionToken, isApiConfigured } from './client';

// ═══ Helper: Cached profile ═══
let _cachedProfile = null;

export async function getCachedProfile() {
  if (_cachedProfile) return _cachedProfile;
  try {
    const data = await apiFetch('/api/auth/me');
    _cachedProfile = data;
    return data;
  } catch {
    return null;
  }
}

export function clearProfileCache() {
  _cachedProfile = null;
}

export async function getOrgId() {
  const profile = await getCachedProfile();
  return profile?.organization_id || profile?.organizationId;
}

// ═══ AUTH ═══
// eslint-disable-next-line no-unused-vars
export async function signUp(email, password, name, role = 'admin') {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
  // Store session token if returned
  if (data?.token) setSessionToken(data.token);
  return data;
}

export async function signIn(email, password) {
  clearProfileCache();
  const data = await apiFetch('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // Store session token if returned
  if (data?.token) setSessionToken(data.token);
  return data;
}

export async function signInWithEmail(email, password) {
  clearProfileCache();
  const data = await apiFetch('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) setSessionToken(data.token);
  return data;
}

export async function signInWithPin(pin) {
  clearProfileCache();
  const data = await apiFetch('/api/auth/pin-verify', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
  if (!data?.profile) throw new Error('Ungueltige PIN');
  if (data?.token) setSessionToken(data.token);
  return data.profile;
}

export async function signOut() {
  clearProfileCache();
  try {
    await apiFetch('/api/auth/sign-out', { method: 'POST' });
  } finally {
    setSessionToken(null);
  }
}

export async function getCurrentUser() {
  if (!isApiConfigured()) return null;
  try {
    const profile = await getCachedProfile();
    if (!profile) return null;
    return { id: profile.id, email: profile.email, profile };
  } catch {
    return null;
  }
}
