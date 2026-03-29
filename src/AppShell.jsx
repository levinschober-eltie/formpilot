import { lazy, Suspense } from 'react';
import { useRouter } from './lib/router';
import FormPilot from './App.jsx';
import { CookieBanner } from './components/common/CookieBanner.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx').then(m => ({ default: m.PricingPage })));
const Datenschutz = lazy(() => import('./pages/Datenschutz.jsx').then(m => ({ default: m.Datenschutz })));
const Impressum = lazy(() => import('./pages/Impressum.jsx').then(m => ({ default: m.Impressum })));
const AGB = lazy(() => import('./pages/AGB.jsx').then(m => ({ default: m.AGB })));

// ═══ Public route map ═══
const PUBLIC_ROUTES = {
  '/': LandingPage,
  '/pricing': PricingPage,
  '/datenschutz': Datenschutz,
  '/impressum': Impressum,
  '/agb': AGB,
};

export function AppShell() {
  const { route } = useRouter();

  // Check if logged in (session token exists)
  const isLoggedIn = !!localStorage.getItem('fp_session_token') || !!localStorage.getItem('fp_session');

  // If logged in and on root, show the app
  if (isLoggedIn && (route === '/' || route === '/app')) {
    return (
      <>
        <FormPilot />
        <CookieBanner />
      </>
    );
  }

  // If on /app route, show app (will show login screen if not logged in)
  if (route === '/app') {
    return (
      <>
        <FormPilot />
        <CookieBanner />
      </>
    );
  }

  // Public routes
  const PublicPage = PUBLIC_ROUTES[route];
  if (PublicPage) {
    return (
      <>
        <Suspense fallback={null}>
          <PublicPage />
        </Suspense>
        <CookieBanner />
      </>
    );
  }

  // Default: show landing page for unknown routes
  return (
    <>
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
      <CookieBanner />
    </>
  );
}
