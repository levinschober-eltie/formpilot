// ═══ API Client — replaces src/lib/supabase.js ═══
const API_URL = import.meta.env.VITE_API_URL || '';

export function isApiConfigured() {
  return !!API_URL;
}

// Alias for backwards compat (same signature as isSupabaseConfigured)
export const isSupabaseConfigured = isApiConfigured;

// ═══ Session token management ═══
let _sessionToken = localStorage.getItem('fp_session_token');

export function setSessionToken(token) {
  _sessionToken = token;
  if (token) localStorage.setItem('fp_session_token', token);
  else localStorage.removeItem('fp_session_token');
}

export function getSessionToken() {
  return _sessionToken;
}

// ═══ Base fetch with auth ═══
export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (_sessionToken) {
    headers['Authorization'] = `Bearer ${_sessionToken}`;
  }
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('fp_session_token');
      window.location.hash = '#/';
      throw new Error('Sitzung abgelaufen — bitte erneut anmelden');
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}
