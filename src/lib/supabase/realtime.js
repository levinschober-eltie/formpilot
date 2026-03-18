// ═══ FEATURE: Realtime subscriptions (split from supabaseService) ═══
import { supabase, isSupabaseConfigured } from '../supabase';

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
