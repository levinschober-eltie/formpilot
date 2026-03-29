import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { S } from '../../config/theme';

const S_BANNER = {
  position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 10000, display: 'flex', alignItems: 'center', gap: '12px',
  padding: '12px 20px', borderRadius: S.radius.md,
  background: S.colors.primary, color: '#fff', fontSize: '14px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25)', fontFamily: 'inherit',
};
const S_BTN = {
  padding: '6px 14px', borderRadius: S.radius.sm, border: '2px solid #fff',
  background: '#fff', color: S.colors.primary, fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const S_DISMISS = {
  ...S_BTN, background: 'transparent', color: '#fff',
};

export const UpdateNotification = React.memo(function UpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(async () => {
          if (registration.installing || !navigator.onLine) return;
          await registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  if (offlineReady) {
    setTimeout(() => setOfflineReady(false), 3000);
    return (
      <div style={S_BANNER}>
        <span>App ist offline verfügbar</span>
      </div>
    );
  }

  if (!needRefresh) return null;

  return (
    <div style={S_BANNER}>
      <span>Neue Version verfügbar</span>
      <button style={S_BTN} onClick={() => updateServiceWorker(true)}>Aktualisieren</button>
      <button style={S_DISMISS} onClick={() => setNeedRefresh(false)}>Später</button>
    </div>
  );
});
