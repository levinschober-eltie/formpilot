import { useState } from 'react';
import { S } from '../../config/theme';
import { navigate } from '../../lib/router';

// ═══ Styles (P4: outside render) ═══
const S_NAV = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  background: S.glass.background,
  backdropFilter: S.glass.backdropFilter,
  borderBottom: `1px solid ${S.colors.border}`,
  fontFamily: S.font.sans,
};

const S_NAV_INNER = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const S_LOGO = {
  fontWeight: 800,
  fontSize: '20px',
  letterSpacing: '-0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: S.colors.text,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontFamily: 'inherit',
  padding: 0,
};

const S_LINKS = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
};

const S_LINK = {
  fontSize: '14px',
  fontWeight: 500,
  color: S.colors.textSecondary,
  textDecoration: 'none',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontFamily: 'inherit',
  padding: 0,
  transition: S.transition,
};

const S_CTA_GROUP = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const S_BTN_LOGIN = {
  padding: '8px 18px',
  borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.primary}30`,
  background: `${S.colors.primary}10`,
  color: S.colors.primary,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
};

const S_BTN_CTA = {
  padding: '8px 18px',
  borderRadius: S.radius.md,
  border: 'none',
  background: S.colors.primary,
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
};

const S_HAMBURGER = {
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  fontSize: '24px',
  color: S.colors.text,
  lineHeight: 1,
};

const S_MOBILE_MENU = {
  position: 'fixed',
  top: '64px',
  left: 0,
  right: 0,
  bottom: 0,
  background: S.colors.bgCardSolid,
  zIndex: 999,
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const S_MOBILE_LINK = {
  fontSize: '18px',
  fontWeight: 600,
  color: S.colors.text,
  padding: '12px 0',
  borderBottom: `1px solid ${S.colors.border}`,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: S.colors.border,
  fontFamily: 'inherit',
  textAlign: 'left',
};

const S_MOBILE_BTN = {
  padding: '14px 20px',
  borderRadius: S.radius.md,
  border: 'none',
  background: S.colors.primary,
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'center',
  marginTop: '8px',
};

export function PageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    // If not on landing, navigate there first
    if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={S_NAV}>
      <div style={S_NAV_INNER}>
        <button style={S_LOGO} onClick={() => navigate('/')}>
          <span style={{ fontSize: '24px' }}>&#x1F4CB;</span>
          <span>FormPilot</span>
        </button>

        {/* Desktop links */}
        <div style={S_LINKS} className="fp-nav-links">
          <button style={S_LINK} onClick={() => scrollTo('features')}>Funktionen</button>
          <button style={S_LINK} onClick={() => navigate('/pricing')}>Preise</button>
          <button style={S_LINK} onClick={() => scrollTo('kontakt')}>Kontakt</button>
        </div>

        {/* Desktop CTAs */}
        <div style={S_CTA_GROUP} className="fp-nav-cta">
          <button style={S_BTN_LOGIN} onClick={() => navigate('/app')}>Einloggen</button>
          <button style={S_BTN_CTA} onClick={() => navigate('/app')}>Kostenlos starten</button>
        </div>

        {/* Mobile hamburger */}
        <button
          style={S_HAMBURGER}
          className="fp-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={S_MOBILE_MENU}>
          <button style={S_MOBILE_LINK} onClick={() => scrollTo('features')}>Funktionen</button>
          <button style={S_MOBILE_LINK} onClick={() => navigate('/pricing')}>Preise</button>
          <button style={S_MOBILE_LINK} onClick={() => scrollTo('kontakt')}>Kontakt</button>
          <button style={S_MOBILE_LINK} onClick={() => { setMenuOpen(false); navigate('/app'); }}>Einloggen</button>
          <button style={S_MOBILE_BTN} onClick={() => { setMenuOpen(false); navigate('/app'); }}>Kostenlos starten</button>
        </div>
      )}

      {/* Responsive CSS injected once */}
      <style>{`
        @media (max-width: 768px) {
          .fp-nav-links, .fp-nav-cta { display: none !important; }
          .fp-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
