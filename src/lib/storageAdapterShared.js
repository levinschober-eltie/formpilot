// ═══ FEATURE: Storage Adapter — Shared Helpers (S05) + Offline Fallback (S04) ═══
// Shared utilities used by all storageAdapter sub-modules.

import { isSupabaseConfigured } from './supabase';

// ═══ Check mode ═══
export const isSupabaseMode = () => isSupabaseConfigured();

// ═══ Helper: check if error is a network error ═══
export function isNetworkError(e) {
  if (!navigator.onLine) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('timeout') || msg.includes('aborted');
}
