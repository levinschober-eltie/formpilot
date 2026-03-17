import { useEffect, useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

// ═══ Extracted Styles (P4) ═══
const S_OVERLAY = { position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const S_BACKDROP = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' };
const S_DIALOG = { position: 'relative', background: S.colors.bgCardSolid, borderRadius: S.radius.lg, padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${S.colors.border}` };
const S_TITLE = { fontSize: '17px', fontWeight: 700, marginBottom: '8px' };
const S_MESSAGE = { fontSize: '14px', color: S.colors.textSecondary, lineHeight: 1.5, marginBottom: '20px' };
const S_ACTIONS = { display: 'flex', gap: '8px', justifyContent: 'flex-end' };

export const ConfirmDialog = ({ title, message, confirmLabel = 'Bestätigen', cancelLabel = 'Abbrechen', variant = 'danger', onConfirm, onCancel }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter') onConfirm();
  }, [onConfirm, onCancel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={S_OVERLAY}>
      <div style={S_BACKDROP} onClick={onCancel} />
      <div style={S_DIALOG}>
        <div style={S_TITLE}>{title}</div>
        <div style={S_MESSAGE}>{message}</div>
        <div style={S_ACTIONS}>
          <button onClick={onCancel} style={styles.btn('ghost', 'sm')}>{cancelLabel}</button>
          <button onClick={onConfirm} style={styles.btn(variant, 'sm')}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
