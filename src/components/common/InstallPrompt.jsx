// ═══ FEATURE: PWA Install Prompt (S04) ═══
// Custom install banner using beforeinstallprompt event.

import React, { useState, useEffect, useCallback } from 'react';
import { S } from '../../config/theme';

// ═══ Styles (P4: outside render) ═══
const S_BANNER = {
  position: 'fixed',
  bottom: '80px',
  left: '16px',
  right: '16px',
  maxWidth: '420px',
  margin: '0 auto',
  background: S.colors.bgCard || '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 9998,
  border: `1.5px solid ${S.colors.primary}30`,
  animation: 'fp-slide-up 0.3s ease',
};

const S_ICON = {
  fontSize: '32px',
  flexShrink: 0,
};

const S_TEXT = {
  flex: 1,
  minWidth: 0,
};

const S_TITLE = {
  fontWeight: 700,
  fontSize: '14px',
  marginBottom: '2px',
  color: S.colors.text || '#1e293b',
};

const S_DESC = {
  fontSize: '12px',
  color: S.colors.textSecondary || '#64748b',
};

const S_ACTIONS = {
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
};

const S_INSTALL_BTN = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: 'none',
  background: S.colors.primary,
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const S_DISMISS_BTN = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: `1px solid ${S.colors.border || '#e2e8f0'}`,
  background: 'transparent',
  color: S.colors.textSecondary || '#64748b',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const STORAGE_KEY = 'fp_installPromptDismissed';

export const InstallPrompt = React.memo(() => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstalled(true);
      return;
    }
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Inject slide-up animation
    if (!document.getElementById('fp-slide-up-style')) {
      const style = document.createElement('style');
      style.id = 'fp-slide-up-style';
      style.textContent = '@keyframes fp-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }';
      document.head.appendChild(style);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a short delay (not immediately on first visit)
      const visitCount = parseInt(localStorage.getItem('fp_visitCount') || '0', 10) + 1;
      localStorage.setItem('fp_visitCount', String(visitCount));
      if (visitCount >= 2) {
        setShow(true);
      }
    };

    const installedHandler = () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Increment visit count even without beforeinstallprompt
    const visitCount = parseInt(localStorage.getItem('fp_visitCount') || '0', 10) + 1;
    localStorage.setItem('fp_visitCount', String(visitCount));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  if (!show || installed) return null;

  return (
    <div style={S_BANNER}>
      <div style={S_ICON}>📲</div>
      <div style={S_TEXT}>
        <div style={S_TITLE}>FormPilot installieren</div>
        <div style={S_DESC}>Schneller Zugriff, offline nutzbar</div>
      </div>
      <div style={S_ACTIONS}>
        <button style={S_DISMISS_BTN} onClick={handleDismiss}>Spaeter</button>
        <button style={S_INSTALL_BTN} onClick={handleInstall}>Installieren</button>
      </div>
    </div>
  );
});

InstallPrompt.displayName = 'InstallPrompt';
