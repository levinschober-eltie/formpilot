// ═══ FEATURE: Auth & Profile (split from supabaseService) ═══
import { supabase, isSupabaseConfigured } from '../supabase';

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

export async function getOrgId() {
  const profile = await getCachedProfile();
  return profile?.organization_id;
}

// ═══ AUTH ═══
// eslint-disable-next-line no-unused-vars
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
  clearProfileCache();

  // Call Edge Function for secure PIN verification (PIN never compared client-side)
  const { data, error } = await supabase.functions.invoke('verify-pin', {
    body: { pin },
  });

  if (error) throw new Error(error.message || 'PIN-Verifizierung fehlgeschlagen');
  if (!data?.profile) throw new Error('Ungueltige PIN');

  return data.profile;
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
