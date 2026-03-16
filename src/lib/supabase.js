import { createClient } from '@supabase/supabase-js';

// Supabase-Konfiguration — wird via .env befüllt
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper: Prüfen ob Supabase konfiguriert ist
export const isSupabaseConfigured = () => !!supabase;
