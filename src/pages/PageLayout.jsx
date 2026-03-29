import { memo } from 'react';
import { S } from '../config/theme';

// ═══ Styles (P4: outside render) ═══
const S_WRAPPER = {
  fontFamily: S.font.sans,
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${S.colors.bg} 0%, ${S.colors.bgEnd} 100%)`,
  color: S.colors.text,
  display: 'flex',
  flexDirection: 'column',
  WebkitFontSmoothing: 'antialiased',
};

const S_NAV = {
  background: S.glass.background,
  backdropFilter: S.glass.backdropFilter,
  borderBottom: `1px solid ${S.colors.border}`,
  padding: '12px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const S_LOGO = {
  fontWeight: 700,
  fontSize: '20px',
  letterSpacing: '-0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: S.colors.text,
};

const S_BACK = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`,
  background: 'transparent',
  color: S.colors.textSecondary,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
  transition: S.transition,
};

const S_MAIN = {
  flex: 1,
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '32px 20px 60px',
  boxSizing: 'border-box',
};

const S_TITLE = {
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: S.colors.text,
  marginBottom: '32px',
  lineHeight: '1.3',
};

const S_FOOTER = {
  background: S.glass.background,
  backdropFilter: S.glass.backdropFilter,
  borderTop: `1px solid ${S.colors.border}`,
  padding: '24px 20px',
  textAlign: 'center',
};

const S_FOOTER_LINKS = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px 24px',
  marginBottom: '12px',
};

const S_FOOTER_LINK = {
  color: S.colors.textSecondary,
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  transition: S.transition,
};

const S_FOOTER_COPY = {
  fontSize: '12px',
  color: S.colors.textMuted,
};

// ═══ PageLayout Component ═══
export const PageLayout = memo(function PageLayout({ title, children }) {
  return (
    <div style={S_WRAPPER}>
      {/* Navigation */}
      <nav style={S_NAV}>
        <a href="#/" style={S_LOGO}>
          <span>📋</span>
          <span>FormPilot</span>
        </a>
        <a href="#/" style={S_BACK}>
          <span style={{ fontSize: '16px' }}>←</span>
          Zurück
        </a>
      </nav>

      {/* Content */}
      <main style={S_MAIN}>
        {title && <h1 style={S_TITLE}>{title}</h1>}
        {children}
      </main>

      {/* Footer */}
      <footer style={S_FOOTER}>
        <div style={S_FOOTER_LINKS}>
          <a href="#/datenschutz" style={S_FOOTER_LINK}>Datenschutz</a>
          <a href="#/impressum" style={S_FOOTER_LINK}>Impressum</a>
          <a href="#/agb" style={S_FOOTER_LINK}>AGB</a>
        </div>
        <p style={S_FOOTER_COPY}>&copy; 2026 Elite PV GmbH. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
});
