// ═══ FEATURE: Offline Indicator Banner (S04) ═══
// Shows offline status, sync progress, and sync errors.

import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// ═══ Styles (P4: outside render) ═══
const S_BANNER_BASE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: 'inherit',
  transition: 'transform 0.3s ease, opacity 0.3s ease',
};

const S_OFFLINE = {
  ...S_BANNER_BASE,
  background: '#fbbf24',
  color: '#78350f',
};

const S_SYNCING = {
  ...S_BANNER_BASE,
  background: '#3b82f6',
  color: '#ffffff',
};

const S_ERROR = {
  ...S_BANNER_BASE,
  background: '#ef4444',
  color: '#ffffff',
};

const S_SUCCESS = {
  ...S_BANNER_BASE,
  background: '#22c55e',
  color: '#ffffff',
};

const S_RETRY_BTN = {
  padding: '2px 10px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.5)',
  background: 'rgba(255,255,255,0.2)',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'inherit',
  fontWeight: 600,
};

const S_SPINNER = {
  display: 'inline-block',
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTop: '2px solid #fff',
  borderRadius: '50%',
  animation: 'fp-spin 0.8s linear infinite',
};

export const OfflineIndicator = React.memo(() => {
  const { isOnline, syncStatus, retryFailed } = useOnlineStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [prevPending, setPrevPending] = useState(0);

  // Show success message briefly after sync completes
  useEffect(() => {
    if (prevPending > 0 && syncStatus.pending === 0 && !syncStatus.processing && syncStatus.failed === 0 && isOnline) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevPending(syncStatus.pending);
  }, [syncStatus.pending, syncStatus.processing, syncStatus.failed, isOnline, prevPending]);

  // Inject keyframe animation once
  useEffect(() => {
    if (document.getElementById('fp-spin-style')) return;
    const style = document.createElement('style');
    style.id = 'fp-spin-style';
    style.textContent = '@keyframes fp-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }, []);

  // Offline banner
  if (!isOnline) {
    return (
      <div style={S_OFFLINE}>
        <span>Offline</span>
        <span style={{ fontWeight: 400 }}>— Aenderungen werden gespeichert und bei Verbindung synchronisiert</span>
        {syncStatus.pending > 0 && (
          <span style={{ fontWeight: 400 }}>({syncStatus.pending} ausstehend)</span>
        )}
      </div>
    );
  }

  // Syncing banner
  if (syncStatus.processing) {
    return (
      <div style={S_SYNCING}>
        <span style={S_SPINNER} />
        <span>Synchronisiere...</span>
        {syncStatus.pending > 0 && (
          <span style={{ fontWeight: 400 }}>({syncStatus.pending} {syncStatus.pending === 1 ? 'Aenderung' : 'Aenderungen'})</span>
        )}
      </div>
    );
  }

  // Error banner
  if (syncStatus.failed > 0) {
    return (
      <div style={S_ERROR}>
        <span>{syncStatus.failed} {syncStatus.failed === 1 ? 'Aenderung konnte' : 'Aenderungen konnten'} nicht synchronisiert werden</span>
        <button style={S_RETRY_BTN} onClick={retryFailed}>Erneut versuchen</button>
      </div>
    );
  }

  // Success banner (transient)
  if (showSuccess) {
    return (
      <div style={S_SUCCESS}>
        <span>Erfolgreich synchronisiert</span>
      </div>
    );
  }

  return null;
});

OfflineIndicator.displayName = 'OfflineIndicator';
