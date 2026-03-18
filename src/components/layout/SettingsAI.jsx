import { useState, useEffect, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { getAISettings, saveAISettings, testAPIKey } from '../../lib/aiService';
import { isSupabaseConfigured } from '../../lib/supabase';

// ═══ Extracted Styles (P4) ═══
const S_AI_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_AI_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_SUPABASE_NOTE = { fontSize: '11px', color: S.colors.textMuted, marginTop: '8px', padding: '8px 12px', background: S.colors.bgInput, borderRadius: S.radius.sm, display: 'flex', alignItems: 'center', gap: '6px' };

export const SettingsAI = memo(function SettingsAI() {
  const [aiKey, setAiKey] = useState('');
  const [aiTestStatus, setAiTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [aiTestMsg, setAiTestMsg] = useState('');

  useEffect(() => {
    (async () => {
      const settings = await getAISettings();
      if (settings.apiKey) setAiKey(settings.apiKey);
    })();
  }, []);

  const handleAiKeySave = useCallback(async () => {
    await saveAISettings({ apiKey: aiKey.trim() });
    setAiTestStatus(null);
    setAiTestMsg('Gespeichert');
    setTimeout(() => setAiTestMsg(''), 2000);
  }, [aiKey]);

  const handleAiKeyTest = useCallback(async () => {
    if (!aiKey.trim()) { setAiTestStatus('error'); setAiTestMsg('Bitte API-Key eingeben'); return; }
    setAiTestStatus('testing');
    setAiTestMsg('');
    try {
      await testAPIKey(aiKey.trim());
      await saveAISettings({ apiKey: aiKey.trim() });
      setAiTestStatus('success');
      setAiTestMsg('API-Key ist gültig!');
    } catch (e) {
      setAiTestStatus('error');
      setAiTestMsg(e.message || 'Verbindung fehlgeschlagen');
    }
  }, [aiKey]);

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>KI-Einstellungen</h3>
      <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>
        Anthropic API-Key für den KI-Formular-Generator. Dein Key wird nur lokal gespeichert und nie an Dritte weitergegeben.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <label style={S_AI_LABEL}>API-Key</label>
        <input
          type="password"
          value={aiKey}
          onChange={e => setAiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={S_AI_INPUT}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleAiKeySave} style={{ ...styles.btn('secondary'), flex: 1 }}>Speichern</button>
        <button onClick={handleAiKeyTest} disabled={aiTestStatus === 'testing'} style={{ ...styles.btn('primary'), flex: 1, opacity: aiTestStatus === 'testing' ? 0.6 : 1 }}>
          {aiTestStatus === 'testing' ? 'Teste...' : 'Testen'}
        </button>
      </div>
      {aiTestMsg && (
        <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: aiTestStatus === 'success' ? S.colors.success : aiTestStatus === 'error' ? S.colors.danger : S.colors.textSecondary }}>
          {aiTestMsg}
        </div>
      )}
      {isSupabaseConfigured() && (
        <div style={S_SUPABASE_NOTE}>
          <span style={{ color: S.colors.success, fontSize: '14px' }}>&#9679;</span>
          Im Produktivmodus wird der API-Key serverseitig verwaltet. Der lokale Key dient nur als Fallback.
        </div>
      )}
    </div>
  );
});
