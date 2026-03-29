import { useState, useEffect } from 'react';
import { S } from '../../config/theme';

const COOKIE_KEY = 'fp_cookie_consent';

// ═══ Styles (P4: outside render) ═══
const S_BANNER = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: S.glass.background,
  backdropFilter: S.glass.backdropFilter,
  borderTop: `1px solid ${S.colors.border}`,
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  fontFamily: S.font.sans,
};

const S_TEXT = {
  fontSize: '13px',
  color: S.colors.textSecondary,
  maxWidth: '600px',
  lineHeight: '1.5',
};

const S_LINK = {
  color: S.colors.primary,
  textDecoration: 'underline',
};

const S_BTN_ACCEPT = {
  padding: '8px 20px',
  borderRadius: S.radius.md,
  border: 'none',
  background: S.colors.primary,
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};

const S_BTN_DECLINE = {
  padding: '8px 20px',
  borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`,
  background: 'transparent',
  color: S.colors.textSecondary,
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={S_BANNER}>
      <p style={S_TEXT}>
        Diese Website verwendet technisch notwendige Cookies für den Betrieb der Anwendung.{' '}
        Weitere Informationen finden Sie in unserer{' '}
        <a href="#/datenschutz" style={S_LINK}>Datenschutzerklärung</a>.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={decline} style={S_BTN_DECLINE}>Nur notwendige</button>
        <button onClick={accept} style={S_BTN_ACCEPT}>Akzeptieren</button>
      </div>
    </div>
  );
}
