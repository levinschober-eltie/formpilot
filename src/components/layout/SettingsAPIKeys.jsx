import { useState, useCallback, useMemo, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useSubscription } from '../../hooks/useSubscription';
import { getTierLimits, getPlanDisplayName } from '../../lib/tierService';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '16px', fontWeight: 600, marginBottom: '16px' };
const S_KEY_ROW = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 0', borderBottom: `1px solid ${S.colors.borderFaint}`,
  gap: '12px', flexWrap: 'wrap',
};
const S_KEY_PREFIX = {
  fontFamily: S.font.mono, fontSize: '13px', fontWeight: 500,
  background: S.colors.bgInput, padding: '4px 10px', borderRadius: S.radius.sm,
  border: `1px solid ${S.colors.border}`, whiteSpace: 'nowrap',
};
const S_KEY_NAME = { fontWeight: 600, fontSize: '14px' };
const S_KEY_META = { fontSize: '12px', color: S.colors.textSecondary, marginTop: '2px' };
const S_CREATE_FORM = {
  padding: '16px', borderRadius: S.radius.md,
  background: S.colors.bgInput, border: `1px solid ${S.colors.border}`,
  marginTop: '16px',
};
const S_FIELD = { marginBottom: '12px' };
const S_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_SCOPES_GRID = { display: 'flex', gap: '16px', flexWrap: 'wrap' };
const S_SCOPE_CHECK = {
  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
  fontSize: '13px', fontWeight: 500,
};
const S_NEW_KEY_BOX = {
  padding: '16px', borderRadius: S.radius.md, marginTop: '16px',
  background: `${S.colors.success}10`, border: `1.5px solid ${S.colors.success}40`,
};
const S_COPY_INPUT = {
  ...styles.input(false), fontSize: '13px', fontFamily: S.font.mono,
  background: S.colors.bgCard, minHeight: '42px',
};
const S_RATE_LIMIT_BOX = {
  padding: '14px', borderRadius: S.radius.md,
  background: S.colors.bgInput, border: `1px solid ${S.colors.border}`,
  marginTop: '16px',
};
const S_EMPTY = {
  padding: '24px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px',
};
const S_NO_ACCESS = {
  padding: '24px', textAlign: 'center', borderRadius: S.radius.md,
  background: S.colors.bgInput, marginTop: '12px',
};

// ═══ Placeholder Keys (P4) ═══
const INITIAL_KEYS = [
  {
    id: 'key-1',
    name: 'Produktions-Schlüssel',
    prefix: 'fp_live_a3f2...',
    scopes: ['lesen', 'schreiben'],
    createdAt: '2025-12-01T10:00:00Z',
    lastUsed: '2026-03-28T14:30:00Z',
  },
  {
    id: 'key-2',
    name: 'Nur-Lese-Schlüssel',
    prefix: 'fp_live_8b1c...',
    scopes: ['lesen'],
    createdAt: '2026-01-15T08:00:00Z',
    lastUsed: null,
  },
];

export const SettingsAPIKeys = memo(function SettingsAPIKeys() {
  const { subscription } = useSubscription();
  const plan = subscription?.plan || 'free';
  const limits = useMemo(() => getTierLimits(plan), [plan]);

  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState(['lesen']);
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasAccess = limits.apiAccess;

  const toggleScope = useCallback((scope) => {
    setNewKeyScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  }, []);

  const handleToggleCreateForm = useCallback(() => {
    setShowCreateForm(prev => !prev);
    setNewKeyName('');
    setNewKeyScopes(['lesen']);
    setCreatedKey(null);
    setCopied(false);
  }, []);

  const handleCreateKey = useCallback(() => {
    if (!newKeyName.trim()) return;
    // Generate a mock key
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let fullKey = 'fp_live_';
    const rng = crypto.getRandomValues(new Uint8Array(32));
    for (let i = 0; i < 32; i++) fullKey += chars[rng[i] % chars.length];

    const newEntry = {
      id: 'key-' + Date.now(),
      name: newKeyName.trim(),
      prefix: fullKey.slice(0, 12) + '...',
      scopes: [...newKeyScopes],
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setKeys(prev => [...prev, newEntry]);
    setCreatedKey(fullKey);
    setShowCreateForm(false);
  }, [newKeyName, newKeyScopes]);

  const handleRevokeKey = useCallback((id) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  }, []);

  const handleCopyKey = useCallback(async () => {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
      const input = document.getElementById('fp-new-key-input');
      if (input) { input.select(); document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }
  }, [createdKey]);

  const handleDismissCreatedKey = useCallback(() => {
    setCreatedKey(null);
    setCopied(false);
  }, []);

  if (!hasAccess) {
    return (
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={S_TITLE}>API-Schlüssel</h3>
        <div style={S_NO_ACCESS}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            API-Zugang nicht verfügbar
          </div>
          <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>
            Der API-Zugang ist ab dem {getPlanDisplayName('pro')}-Plan verfügbar.
            Upgrade deinen Plan, um die API nutzen zu können.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ ...S_TITLE, marginBottom: 0 }}>API-Schlüssel</h3>
        <button onClick={handleToggleCreateForm} style={styles.btn('primary', 'sm')}>
          {showCreateForm ? 'Abbrechen' : 'Neuen Schlüssel erstellen'}
        </button>
      </div>

      {/* ═══ Created Key Banner ═══ */}
      {createdKey && (
        <div style={S_NEW_KEY_BOX}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.success, marginBottom: '8px' }}>
            Schlüssel erstellt. Kopiere ihn jetzt — er wird nur einmal angezeigt!
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id="fp-new-key-input"
              readOnly
              value={createdKey}
              style={{ ...S_COPY_INPUT, flex: 1 }}
              onClick={e => e.target.select()}
            />
            <button onClick={handleCopyKey} style={styles.btn('primary', 'sm')}>
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
          <button
            onClick={handleDismissCreatedKey}
            style={{ ...styles.btn('ghost', 'sm'), marginTop: '8px', fontSize: '12px' }}
          >
            Verstanden, Schlüssel gesichert
          </button>
        </div>
      )}

      {/* ═══ Create Form ═══ */}
      {showCreateForm && (
        <div style={S_CREATE_FORM}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Neuen API-Schlüssel erstellen</div>
          <div style={S_FIELD}>
            <label style={S_LABEL}>Name</label>
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="z.B. Produktions-Schlüssel"
              style={S_INPUT}
            />
          </div>
          <div style={S_FIELD}>
            <label style={S_LABEL}>Berechtigungen</label>
            <div style={S_SCOPES_GRID}>
              {['lesen', 'schreiben'].map(scope => (
                <label key={scope} style={S_SCOPE_CHECK}>
                  <input
                    type="checkbox"
                    checked={newKeyScopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    style={{ width: '16px', height: '16px', accentColor: S.colors.primary }}
                  />
                  <span>{scope.charAt(0).toUpperCase() + scope.slice(1)}</span>
                </label>
              ))}
            </div>
            {limits.apiReadOnly && newKeyScopes.includes('schreiben') && (
              <div style={{ fontSize: '12px', color: S.colors.warning, marginTop: '6px' }}>
                Dein Plan ({getPlanDisplayName(plan)}) erlaubt nur Lese-Zugriff. Schreib-Berechtigungen sind ab Business verfügbar.
              </div>
            )}
          </div>
          <button
            onClick={handleCreateKey}
            disabled={!newKeyName.trim() || newKeyScopes.length === 0}
            style={{
              ...styles.btn('primary'), width: '100%',
              opacity: newKeyName.trim() && newKeyScopes.length > 0 ? 1 : 0.5,
            }}
          >
            Schlüssel erstellen
          </button>
        </div>
      )}

      {/* ═══ Key List ═══ */}
      {keys.length > 0 ? (
        <div>
          {keys.map(key => (
            <div key={key.id} style={S_KEY_ROW}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S_KEY_NAME}>{key.name}</div>
                <div style={S_KEY_META}>
                  <span style={S_KEY_PREFIX}>{key.prefix}</span>
                  {' \u00B7 '}
                  {key.scopes.join(', ')}
                  {' \u00B7 '}
                  Erstellt am {new Date(key.createdAt).toLocaleDateString('de-DE')}
                  {key.lastUsed && (
                    <> {' \u00B7 '} Zuletzt: {new Date(key.lastUsed).toLocaleDateString('de-DE')}</>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRevokeKey(key.id)}
                style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}
              >
                Widerrufen
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={S_EMPTY}>
          Keine API-Schlüssel vorhanden. Erstelle einen Schlüssel, um die FormPilot API zu nutzen.
        </div>
      )}

      {/* ═══ Rate Limit Info ═══ */}
      <div style={S_RATE_LIMIT_BOX}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Rate Limits</div>
        <div style={{ fontSize: '12px', color: S.colors.textSecondary, lineHeight: 1.6 }}>
          Plan: {getPlanDisplayName(plan)}<br />
          {plan === 'pro' && 'Max. 100 Requests/Minute, nur Lese-Zugriff.'}
          {plan === 'business' && 'Max. 500 Requests/Minute, voller Lese- und Schreibzugriff.'}
          {plan === 'enterprise' && 'Unbegrenzt Requests, voller Zugriff.'}
          {plan === 'sdk' && 'SDK-Intern: Unbegrenzt.'}
        </div>
      </div>
    </div>
  );
});

SettingsAPIKeys.displayName = 'SettingsAPIKeys';
