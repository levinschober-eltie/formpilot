import { useRouter } from './lib/router';
import FormPilot from './App.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PricingPage } from './pages/PricingPage.jsx';
import { Datenschutz } from './pages/Datenschutz.jsx';
import { Impressum } from './pages/Impressum.jsx';
import { AGB } from './pages/AGB.jsx';
import { CookieBanner } from './components/common/CookieBanner.jsx';

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
        <PublicPage />
        <CookieBanner />
      </>
    );
  }

  // Default: show landing page for unknown routes
  return (
    <>
      <LandingPage />
      <CookieBanner />
    </>
  );
}
