import { useState, useEffect, useCallback, useRef } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { dialog } from '../../lib/dialogService';

// ═══ Extracted Styles (P4) ═══
const S_OVERLAY = { position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const S_BACKDROP = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' };
const S_DIALOG = { position: 'relative', background: S.colors.bgCardSolid, borderRadius: S.radius.lg, padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${S.colors.border}` };
const S_TITLE = { fontSize: '17px', fontWeight: 700, marginBottom: '8px' };
const S_MESSAGE = { fontSize: '14px', color: S.colors.textSecondary, lineHeight: 1.5, marginBottom: '20px' };
const S_ACTIONS = { display: 'flex', gap: '8px', justifyContent: 'flex-end' };
const S_INPUT = { width: '100%', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput, marginBottom: '20px', color: S.colors.text };

export const GlobalDialog = () => {
  const [state, setState] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    dialog.subscribe((request) => {
      setState(request);
      if (request.type === 'prompt') setInputValue(request.defaultValue || '');
    });
    return () => dialog.unsubscribe();
  }, []);

  const handleConfirm = useCallback(() => {
    if (!state) return;
    if (state.type === 'prompt') state.resolve(inputValue);
    else if (state.type === 'confirm') state.resolve(true);
    else state.resolve();
    setState(null);
  }, [state, inputValue]);

  const handleCancel = useCallback(() => {
    if (!state) return;
    if (state.type === 'prompt') state.resolve(null);
    else if (state.type === 'confirm') state.resolve(false);
    else state.resolve();
    setState(null);
  }, [state]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') handleCancel();
    if (e.key === 'Enter') handleConfirm();
  }, [handleConfirm, handleCancel]);

  useEffect(() => {
    if (!state) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleKeyDown]);

  // Auto-focus input for prompt
  useEffect(() => {
    if (state?.type === 'prompt' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state]);

  if (!state) return null;

  const isAlert = state.type === 'alert';
  const isPrompt = state.type === 'prompt';

  return (
    <div style={S_OVERLAY}>
      <div style={S_BACKDROP} onClick={handleCancel} />
      <div style={S_DIALOG}>
        <div style={S_TITLE}>{state.title}</div>
        {state.message && <div style={S_MESSAGE}>{state.message}</div>}
        {isPrompt && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={state.placeholder}
            style={S_INPUT}
          />
        )}
        <div style={S_ACTIONS}>
          {!isAlert && (
            <button onClick={handleCancel} style={styles.btn('ghost', 'sm')}>
              {state.cancelLabel || 'Abbrechen'}
            </button>
          )}
          <button onClick={handleConfirm} style={styles.btn(state.variant || 'primary', 'sm')}>
            {state.confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
