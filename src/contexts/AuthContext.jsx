import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getCurrentUser, clearProfileCache, signOut as supabaseSignOut } from '../lib/supabaseService';
import { storageSet } from '../lib/storage';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ═══ Supabase Auth State Listener ═══
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isSupabaseConfigured()) {
      setAuthChecked(true);
      return;
    }

    // Check current session
    const checkSession = async () => {
      try {
        const supaUser = await getCurrentUser();
        if (supaUser?.profile) {
          const profile = supaUser.profile;
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            organizationId: profile.organization_id,
            profile,
          });
        }
      } catch (e) {
        console.error('[FormPilot] Auth check failed:', e);
      }
      setAuthChecked(true);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearProfileCache();
        setUser(null);
      } else if (event === 'SIGNED_IN' && session) {
        // Refresh profile
        try {
          clearProfileCache();
          const supaUser = await getCurrentUser();
          if (supaUser?.profile) {
            const profile = supaUser.profile;
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              organizationId: profile.organization_id,
              profile,
            });
          }
        } catch (e) {
          console.error('[FormPilot] Auth state change error:', e);
        }
      }
    });

    /* eslint-enable react-hooks/set-state-in-effect */
    return () => subscription?.unsubscribe();
  }, []);

  // Demo mode: set user from stored session (called by DataContext during init)
  const loginFromStorage = useCallback((u) => {
    setUser(u);
  }, []);

  const handleLogin = useCallback(async (u) => {
    setUser(u);
    // Only store session in localStorage for demo mode
    if (!isSupabaseConfigured()) {
      await storageSet(STORAGE_KEYS.session, { userId: u.id });
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabaseSignOut();
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }
    clearProfileCache();
    setUser(null);
    await storageSet(STORAGE_KEYS.session, null);
  }, []);

  const value = useMemo(() => ({
    user, authChecked, handleLogin, handleLogout, loginFromStorage,
  }), [user, authChecked, handleLogin, handleLogout, loginFromStorage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
