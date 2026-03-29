import { useState, useEffect, useCallback } from 'react';

// Parse hash: "#/pricing" -> "/pricing", "#/invite/abc" -> "/invite/abc"
function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash.startsWith('/') ? hash : '/' + hash;
}

export function useRouter() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((path) => {
    window.location.hash = path;
  }, []);

  // Extract path params: matchRoute('/invite/:token', '/invite/abc123') -> { token: 'abc123' }
  const matchRoute = useCallback((pattern, path) => {
    const patternParts = pattern.split('/');
    const pathParts = (path || route).split('/');
    if (patternParts.length !== pathParts.length) return null;
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }, [route]);

  return { route, navigate, matchRoute };
}

export function navigate(path) {
  window.location.hash = path;
}
