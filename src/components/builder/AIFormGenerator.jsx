import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { generateFormTemplate, getAISettings } from '../../lib/aiService';

// ═══ Extracted Styles (P4) ═══
const S_OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
};
const S_MODAL = {
  background: S.colors.bgCardSolid, borderRadius: S.radius.xl, width: '100%', maxWidth: '560px',
  maxHeight: '90vh', overflow: 'auto', boxShadow: S.colors.shadowLg, border: `1px solid ${S.colors.border}`,
};
const S_HEADER = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0',
};
const S_BODY = { padding: '16px 24px 24px' };
const S_TEXTAREA = {
  width: '100%', minHeight: '100px', padding: '12px 14px', borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`, fontSize: '15px', fontFamily: 'inherit',
  background: S.colors.bgInput, color: S.colors.text, resize: 'vertical', outline: 'none',
  boxSizing: 'border-box', transition: S.transition,
};
const S_EXAMPLES_TITLE = { fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '8px', marginTop: '16px' };
const S_EXAMPLE_BTN = {
  display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: S.radius.md,
  border: `1px solid ${S.colors.border}`, background: S.colors.bgInput, color: S.colors.text,
  fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: S.transition, marginBottom: '6px',
};
const S_LOADING_CONTAINER = { textAlign: 'center', padding: '40px 20px' };
const S_SPINNER = {
  width: '48px', height: '48px', border: `4px solid ${S.colors.border}`, borderTopColor: S.colors.primary,
  borderRadius: '50%', margin: '0 auto 16px', animation: 'fp-spin 0.8s linear infinite',
};
const S_RESULT_HEADER = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' };
const S_TREE_LINE = {
  fontSize: '13px', color: S.colors.textSecondary, padding: '4px 0', fontFamily: S.font.mono,
};
const S_ACTIONS = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' };
const S_ERROR_BOX = {
  padding: '16px', borderRadius: S.radius.md, background: `color-mix(in srgb, ${S.colors.danger} 8%, transparent)`,
  border: `1px solid ${S.colors.danger}30`, color: S.colors.danger, fontSize: '14px', marginBottom: '16px',
};
const S_CLOSE_BTN = {
  background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer',
  color: S.colors.textSecondary, padding: '4px 8px', lineHeight: 1, fontFamily: 'inherit',
};
const S_WARNING_BOX = {
  padding: '10px 14px', borderRadius: S.radius.md, background: `color-mix(in srgb, ${S.colors.warning} 10%, transparent)`,
  border: `1px solid ${S.colors.warning}30`, fontSize: '12px', color: S.colors.warning, marginTop: '12px',
};

const EXAMPLE_PROMPTS = [
  'Abnahmeprotokoll für PV-Anlage mit Checkliste und Unterschriften',
  'Mängelprotokoll mit Fotos und Prioritäten',
  'Täglicher Baustellenbericht mit Wetter und Arbeitszeiten',
  'Fahrzeugübergabe-Checkliste',
  'Wartungsprotokoll für Heizungsanlagen mit Messwerten',
];

const PROGRESS_STEPS = [
  'Struktur planen...',
  'Felder erstellen...',
  'Logik hinzufügen...',
  'Fertig!',
];

// Spinner keyframes — injected once
let spinnerInjected = false;
function injectSpinner() {
  if (spinnerInjected) return;
  spinnerInjected = true;
  const style = document.createElement('style');
  style.textContent = '@keyframes fp-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

const AIFormGenerator = memo(function AIFormGenerator({ onClose, onOpenBuilder, onDirectUse }) {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState('input'); // input | loading | result | error
  const [result, setResult] = useState(null); // { template, warnings }
  const [error, setError] = useState('');
  const [progressIdx, setProgressIdx] = useState(0);
  const progressRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { injectSpinner(); }, []);

  // Progress animation during loading
  useEffect(() => {
    if (phase !== 'loading') {
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressIdx(0);
    progressRef.current = setInterval(() => {
      setProgressIdx(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [phase]);

  const handleGenerate = useCallback(async () => {
    const settings = getAISettings();
    if (!settings.apiKey) {
      setError('NO_API_KEY');
      setPhase('error');
      return;
    }
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError('Bitte beschreibe dein Formular genauer (mindestens 10 Zeichen).');
      setPhase('error');
      return;
    }

    setPhase('loading');
    setError('');
    try {
      const res = await generateFormTemplate(prompt);
      setResult(res);
      setPhase('result');
    } catch (err) {
      if (err.message === 'NO_API_KEY') {
        setError('NO_API_KEY');
      } else {
        setError(err.message || 'Unbekannter Fehler');
      }
      setPhase('error');
    }
  }, [prompt]);

  const handleExampleClick = useCallback((example) => {
    setPrompt(example);
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const handleRegenerate = useCallback(() => {
    setResult(null);
    setPhase('input');
  }, []);

  const handleOpenInBuilder = useCallback(() => {
    if (result?.template) onOpenBuilder(result.template);
  }, [result, onOpenBuilder]);

  const handleDirectUse = useCallback(() => {
    if (result?.template) onDirectUse(result.template);
  }, [result, onDirectUse]);

  // Summary stats
  const stats = result?.template ? (() => {
    const pages = result.template.pages;
    const totalFields = pages.reduce((s, p) => s + p.fields.length, 0);
    const checklists = pages.reduce((s, p) => s + p.fields.filter(f => f.type === 'checklist').length, 0);
    return { pages: pages.length, fields: totalFields, checklists };
  })() : null;

  return (
    <div style={S_OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S_MODAL} onClick={e => e.stopPropagation()}>
        <div style={S_HEADER}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>KI-Formular-Generator</h2>
          <button style={S_CLOSE_BTN} onClick={onClose} aria-label="Schließen">&times;</button>
        </div>

        <div style={S_BODY}>
          {/* ═══ INPUT PHASE ═══ */}
          {phase === 'input' && (
            <>
              <label style={{ ...styles.fieldLabel, marginBottom: '8px' }}>Beschreibe dein Formular:</label>
              <textarea
                ref={textareaRef}
                style={S_TEXTAREA}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder='z.B. "Ein Wartungsprotokoll für Heizungsanlagen mit Messwerten, Prüfpunkten und Unterschrift von Techniker und Kunde"'
              />
              <div style={S_EXAMPLES_TITLE}>Beispiele:</div>
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button key={i} style={S_EXAMPLE_BTN} onClick={() => handleExampleClick(ex)}>
                  {ex}
                </button>
              ))}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || prompt.trim().length < 10}
                  style={{
                    ...styles.btn('primary', 'lg'),
                    width: '100%',
                    opacity: (!prompt.trim() || prompt.trim().length < 10) ? 0.5 : 1,
                    cursor: (!prompt.trim() || prompt.trim().length < 10) ? 'not-allowed' : 'pointer',
                  }}
                >
                  Formular generieren
                </button>
                {prompt.trim().length > 0 && prompt.trim().length < 10 && (
                  <div style={{ fontSize: '12px', color: S.colors.warning, marginTop: '6px', textAlign: 'center' }}>
                    Bitte beschreibe dein Formular genauer.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ LOADING PHASE ═══ */}
          {phase === 'loading' && (
            <div style={S_LOADING_CONTAINER}>
              <div style={S_SPINNER} />
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>KI erstellt dein Formular...</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                {PROGRESS_STEPS.map((step, i) => (
                  <div key={i} style={{ color: i <= progressIdx ? S.colors.primary : S.colors.textMuted, fontWeight: i === progressIdx ? 600 : 400 }}>
                    {i < progressIdx ? '\u2713' : i === progressIdx ? '\u25CF' : '\u25CB'} {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ RESULT PHASE ═══ */}
          {phase === 'result' && result?.template && (
            <>
              <div style={S_RESULT_HEADER}>
                <span style={{ fontSize: '36px' }}>{result.template.icon || '\u2705'}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{result.template.name}</div>
                  <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>
                    {stats.pages} Seiten &middot; {stats.fields} Felder{stats.checklists > 0 ? ` \u00B7 ${stats.checklists} Checklisten` : ''}
                  </div>
                </div>
              </div>

              {result.template.description && (
                <div style={{ fontSize: '14px', color: S.colors.textSecondary, marginBottom: '12px' }}>
                  {result.template.description}
                </div>
              )}

              <div style={{ padding: '12px', background: S.colors.bgInput, borderRadius: S.radius.md }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Vorschau:</div>
                {result.template.pages.map((page, i) => (
                  <div key={page.id} style={S_TREE_LINE}>
                    {i < result.template.pages.length - 1 ? '\u251C\u2500\u2500' : '\u2514\u2500\u2500'} Seite {i + 1}: {page.title} ({page.fields.length} Felder)
                  </div>
                ))}
              </div>

              {result.warnings && result.warnings.length > 0 && (
                <div style={S_WARNING_BOX}>
                  <strong>Hinweise:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div style={S_ACTIONS}>
                <button onClick={handleOpenInBuilder} style={{ ...styles.btn('primary'), flex: 1 }}>
                  Im Builder bearbeiten
                </button>
                <button onClick={handleDirectUse} style={{ ...styles.btn('success'), flex: 1 }}>
                  Direkt nutzen
                </button>
              </div>
              <div style={{ ...S_ACTIONS, marginTop: '8px' }}>
                <button onClick={handleRegenerate} style={{ ...styles.btn('secondary'), flex: 1 }}>
                  Neu generieren
                </button>
                <button onClick={onClose} style={{ ...styles.btn('ghost'), flex: 1 }}>
                  Abbrechen
                </button>
              </div>
            </>
          )}

          {/* ═══ ERROR PHASE ═══ */}
          {phase === 'error' && (
            <>
              {error === 'NO_API_KEY' ? (
                <div style={S_ERROR_BOX}>
                  <strong>API-Key fehlt</strong>
                  <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                    Bitte hinterlege deinen Anthropic API-Key in den Einstellungen
                    unter &quot;KI-Einstellungen&quot;.
                  </p>
                </div>
              ) : (
                <div style={S_ERROR_BOX}>
                  <strong>Fehler</strong>
                  <p style={{ margin: '8px 0 0', fontSize: '13px' }}>{error}</p>
                </div>
              )}
              <div style={S_ACTIONS}>
                <button onClick={() => { setError(''); setPhase('input'); }} style={{ ...styles.btn('primary'), flex: 1 }}>
                  Erneut versuchen
                </button>
                <button onClick={onClose} style={{ ...styles.btn('ghost'), flex: 1 }}>
                  Abbrechen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export { AIFormGenerator };
