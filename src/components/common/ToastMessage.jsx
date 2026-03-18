import React, { useEffect } from 'react';
import { S } from '../../config/theme';

export const ToastMessage = React.memo(({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 24px', borderRadius: S.radius.md, fontWeight: 600, fontSize: '14px', background: type === 'error' ? S.colors.danger : S.colors.success, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>{message}</div>
  );
});
ToastMessage.displayName = 'ToastMessage';
