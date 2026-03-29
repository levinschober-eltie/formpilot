import { useState, useCallback, useMemo, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useSubscription } from '../../hooks/useSubscription';
import { getTierLimits, getPlanDisplayName, canUseWebhooks } from '../../lib/tierService';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '16px', fontWeight: 600, marginBottom: '16px' };
const S_WEBHOOK_ROW = {
  padding: '16px', borderRadius: S.radius.md,
  border: `1px solid ${S.colors.border}`, background: S.colors.bgInput,
  marginBottom: '10px',
};
const S_WEBHOOK_HEADER = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '12px', flexWrap: 'wrap', marginBottom: '8px',
};
const S_WEBHOOK_URL = {
  fontFamily: S.font.mono, fontSize: '13px', fontWeight: 500,
  wordBreak: 'break-all',
};
const S_WEBHOOK_META = { fontSize: '12px', color: S.colors.textSecondary, marginTop: '6px' };
const S_WEBHOOK_EVENTS = {
  display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px',
};
const S_EVENT_TAG = {
  padding: '2px 8px', borderRadius: S.radius.full,
  fontSize: '11px', fontWeight: 500, fontFamily: S.font.mono,
  background: `${S.colors.primary}10`, color: S.colors.primary,
  border: `1px solid ${S.colors.primary}20`,
};
const S_ACTIONS_ROW = {
  display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px',
  flexWrap: 'wrap',
};
const S_CREATE_FORM = {
  padding: '16px', borderRadius: S.radius.md,
  background: S.colors.bgInput, border: `1px solid ${S.colors.border}`,
  marginTop: '16px',
};
const S_FIELD = { marginBottom: '12px' };
const S_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_EVENTS_GRID = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '8px',
};
const S_EVENT_CHECK = {
  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
  fontSize: '13px', fontWeight: 500, padding: '6px 0',
};
const S_TOGGLE = (active) => ({
  width: '36px', height: '20px', borderRadius: '10px',
  background: active ? S.colors.success : S.colors.border,
  position: 'relative', cursor: 'pointer', transition: S.transition,
  flexShrink: 0, border: 'none', padding: 0,
});
const S_TOGGLE_KNOB = (active) => ({
  width: '16px', height: '16px', borderRadius: '50%',
  background: '#fff', position: 'absolute', top: '2px',
  left: active ? '18px' : '2px', transition: S.transition,
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
});
const S_FAILURE_BADGE = (count) => ({
  ...styles.badge(count > 0 ? S.colors.danger : S.colors.success),
  fontSize: '11px',
});
const S_EMPTY = {
  padding: '24px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px',
};
const S_NO_ACCESS = {
  padding: '24px', textAlign: 'center', borderRadius: S.radius.md,
  background: S.colors.bgInput, marginTop: '12px',
};

// ═══ Available Events (P4) ═══
const AVAILABLE_EVENTS = [
  { id: 'submission.created', label: 'Formular erstellt' },
  { id: 'submission.completed', label: 'Formular abgeschlossen' },
  { id: 'submission.deleted', label: 'Formular gelöscht' },
  { id: 'template.created', label: 'Vorlage erstellt' },
  { id: 'template.updated', label: 'Vorlage aktualisiert' },
  { id: 'team.member_joined', label: 'Mitglied beigetreten' },
  { id: 'team.member_removed', label: 'Mitglied entfernt' },
];

// ═══ Placeholder Webhooks (P4) ═══
const INITIAL_WEBHOOKS = [
  {
    id: 'wh-1',
    url: 'https://api.example.com/webhooks/formpilot',
    events: ['submission.created', 'submission.completed'],
    active: true,
    lastTriggered: '2026-03-28T14:30:00Z',
    failureCount: 0,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'wh-2',
    url: 'https://hooks.slack.com/services/T00/B00/xxx',
    events: ['submission.completed', 'template.created'],
    active: false,
    lastTriggered: '2026-03-20T11:00:00Z',
    failureCount: 3,
    createdAt: '2026-02-05T16:00:00Z',
  },
];

export const SettingsWebhooks = memo(function SettingsWebhooks() {
  const { subscription } = useSubscription();
  const plan = subscription?.plan || 'free';
  const limits = useMemo(() => getTierLimits(plan), [plan]);

  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState([]);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const hasAccess = limits.maxWebhooks > 0;
  const canAdd = canUseWebhooks(plan, webhooks.length);

  const toggleEvent = useCallback((eventId) => {
    setNewEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
  }, []);

  const handleToggleCreateForm = useCallback(() => {
    setShowCreateForm(prev => !prev);
    setNewUrl('');
    setNewEvents([]);
  }, []);

  const handleCreateWebhook = useCallback(() => {
    const url = newUrl.trim();
    if (!url || newEvents.length === 0) return;

    setWebhooks(prev => [...prev, {
      id: 'wh-' + Date.now(),
      url,
      events: [...newEvents],
      active: true,
      lastTriggered: null,
      failureCount: 0,
      createdAt: new Date().toISOString(),
    }]);
    setNewUrl('');
    setNewEvents([]);
    setShowCreateForm(false);
  }, [newUrl, newEvents]);

  const handleDeleteWebhook = useCallback((id) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  }, []);

  const handleToggleActive = useCallback((id) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id ? { ...w, active: !w.active } : w
    ));
  }, []);

  const handleTestWebhook = useCallback(async (id) => {
    setTestingId(id);
    setTestResult(null);
    // Simulate test
    await new Promise(r => setTimeout(r, 1200));
    setTestResult({ id, success: true });
    setTestingId(null);
    setTimeout(() => setTestResult(null), 3000);
  }, []);

  if (!hasAccess) {
    return (
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={S_TITLE}>Webhooks</h3>
        <div style={S_NO_ACCESS}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            Webhooks nicht verfügbar
          </div>
          <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>
            Webhooks sind ab dem {getPlanDisplayName('pro')}-Plan verfügbar.
            Upgrade deinen Plan, um Webhooks nutzen zu können.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ ...S_TITLE, marginBottom: 0 }}>Webhooks</h3>
        {canAdd ? (
          <button onClick={handleToggleCreateForm} style={styles.btn('primary', 'sm')}>
            {showCreateForm ? 'Abbrechen' : 'Webhook hinzufügen'}
          </button>
        ) : (
          <span style={{ fontSize: '12px', color: S.colors.textMuted }}>
            Limit erreicht ({webhooks.length}/{limits.maxWebhooks})
          </span>
        )}
      </div>

      {/* ═══ Create Form ═══ */}
      {showCreateForm && (
        <div style={S_CREATE_FORM}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Neuen Webhook hinzufügen</div>
          <div style={S_FIELD}>
            <label style={S_LABEL}>URL</label>
            <input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://api.example.com/webhook"
              type="url"
              style={S_INPUT}
            />
          </div>
          <div style={S_FIELD}>
            <label style={S_LABEL}>Events</label>
            <div style={S_EVENTS_GRID}>
              {AVAILABLE_EVENTS.map(evt => (
                <label key={evt.id} style={S_EVENT_CHECK}>
                  <input
                    type="checkbox"
                    checked={newEvents.includes(evt.id)}
                    onChange={() => toggleEvent(evt.id)}
                    style={{ width: '16px', height: '16px', accentColor: S.colors.primary }}
                  />
                  <span>{evt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreateWebhook}
            disabled={!newUrl.trim() || newEvents.length === 0}
            style={{
              ...styles.btn('primary'), width: '100%',
              opacity: newUrl.trim() && newEvents.length > 0 ? 1 : 0.5,
            }}
          >
            Webhook erstellen
          </button>
        </div>
      )}

      {/* ═══ Webhook List ═══ */}
      {webhooks.length > 0 ? (
        <div>
          {webhooks.map(wh => (
            <div key={wh.id} style={{ ...S_WEBHOOK_ROW, opacity: wh.active ? 1 : 0.6 }}>
              <div style={S_WEBHOOK_HEADER}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S_WEBHOOK_URL}>{wh.url}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={S_FAILURE_BADGE(wh.failureCount)}>
                    {wh.failureCount > 0 ? `${wh.failureCount} Fehler` : 'OK'}
                  </span>
                  <button
                    style={S_TOGGLE(wh.active)}
                    onClick={() => handleToggleActive(wh.id)}
                    aria-label={wh.active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <div style={S_TOGGLE_KNOB(wh.active)} />
                  </button>
                </div>
              </div>

              <div style={S_WEBHOOK_EVENTS}>
                {wh.events.map(evt => (
                  <span key={evt} style={S_EVENT_TAG}>{evt}</span>
                ))}
              </div>

              <div style={S_WEBHOOK_META}>
                Erstellt am {new Date(wh.createdAt).toLocaleDateString('de-DE')}
                {wh.lastTriggered && (
                  <> {' \u00B7 '} Zuletzt ausgelöst: {new Date(wh.lastTriggered).toLocaleDateString('de-DE')}</>
                )}
              </div>

              <div style={S_ACTIONS_ROW}>
                <button
                  onClick={() => handleTestWebhook(wh.id)}
                  disabled={testingId === wh.id}
                  style={{ ...styles.btn('secondary', 'sm'), opacity: testingId === wh.id ? 0.6 : 1 }}
                >
                  {testingId === wh.id ? 'Teste...' : 'Test senden'}
                </button>
                {testResult?.id === wh.id && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: testResult.success ? S.colors.success : S.colors.danger }}>
                    {testResult.success ? 'Test erfolgreich!' : 'Test fehlgeschlagen'}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteWebhook(wh.id)}
                  style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger, marginLeft: 'auto' }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={S_EMPTY}>
          Keine Webhooks konfiguriert. Erstelle einen Webhook, um Ereignisse an externe Systeme zu senden.
        </div>
      )}

      {/* ═══ Limit Info ═══ */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: S.colors.textMuted, textAlign: 'right' }}>
        {webhooks.length}/{limits.maxWebhooks === Infinity ? '\u221E' : limits.maxWebhooks} Webhooks ({getPlanDisplayName(plan)})
      </div>
    </div>
  );
});

SettingsWebhooks.displayName = 'SettingsWebhooks';
