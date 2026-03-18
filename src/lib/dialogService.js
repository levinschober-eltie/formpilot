// ═══ Global Dialog Service (replaces browser confirm/alert/prompt) ═══
// Singleton pattern — works in components AND plain modules (e.g. exportPdf.js)

let _listener = null;

const show = (type, options) => {
  return new Promise((resolve) => {
    if (_listener) _listener({ type, ...options, resolve });
    else resolve(type === 'confirm' ? false : type === 'prompt' ? null : undefined);
  });
};

export const dialog = {
  /** Subscribe to dialog requests (called once from GlobalDialog) */
  subscribe(fn) { _listener = fn; },
  unsubscribe() { _listener = null; },

  /** Styled confirm — returns Promise<boolean> */
  confirm({ title = 'Bestätigen', message, confirmLabel = 'Bestätigen', cancelLabel = 'Abbrechen', variant = 'danger' } = {}) {
    return show('confirm', { title, message, confirmLabel, cancelLabel, variant });
  },

  /** Styled alert — returns Promise<void> */
  alert({ title = 'Hinweis', message, confirmLabel = 'OK' } = {}) {
    return show('alert', { title, message, confirmLabel });
  },

  /** Styled prompt — returns Promise<string|null> */
  prompt({ title = 'Eingabe', message, placeholder = '', defaultValue = '', confirmLabel = 'OK', cancelLabel = 'Abbrechen' } = {}) {
    return show('prompt', { title, message, placeholder, defaultValue, confirmLabel, cancelLabel });
  },
};
