import { useState, useCallback, useMemo, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useSubscription } from '../../hooks/useSubscription';
import { createCheckout, createPortal } from '../../lib/api/billing';
import { getTierLimits, getUsagePercentage, getPlanDisplayName, getPlanPrice, getUpgradePlan } from '../../lib/tierService';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '16px', fontWeight: 600, marginBottom: '16px' };
const S_PLAN_HEADER = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
};
const S_PLAN_NAME = { fontSize: '22px', fontWeight: 700 };
const S_PLAN_PRICE = { fontSize: '14px', color: S.colors.textSecondary };
const S_STATUS_BADGE = (status) => {
  const colors = {
    active: S.colors.success,
    canceled: S.colors.warning,
    past_due: S.colors.danger,
    trialing: S.colors.primary,
  };
  return styles.badge(colors[status] || S.colors.textMuted);
};
const S_USAGE_SECTION = { marginTop: '20px' };
const S_USAGE_ITEM = { marginBottom: '16px' };
const S_USAGE_HEADER = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '6px',
};
const S_USAGE_LABEL = { fontSize: '13px', fontWeight: 500, color: S.colors.text };
const S_USAGE_VALUE = (pct) => ({
  fontSize: '13px', fontWeight: 600, fontFamily: S.font.mono,
  color: pct >= 100 ? S.colors.danger : pct >= 80 ? S.colors.warning : S.colors.textSecondary,
});
const S_USAGE_BAR = {
  height: '8px', background: S.colors.border, borderRadius: S.radius.full,
  overflow: 'hidden',
};
const S_USAGE_FILL = (pct) => ({
  height: '100%', borderRadius: S.radius.full, transition: 'width 0.4s ease',
  width: `${Math.min(pct, 100)}%`,
  background: pct >= 100 ? S.colors.danger : pct >= 80 ? S.colors.warning : S.colors.success,
});
const S_UPGRADE_CTA = {
  marginTop: '20px', padding: '20px', borderRadius: S.radius.lg,
  background: `linear-gradient(135deg, ${S.colors.primary}10, ${S.colors.accent}10)`,
  border: `1.5px solid ${S.colors.primary}30`,
};
const S_CTA_TITLE = { fontSize: '16px', fontWeight: 700, marginBottom: '8px' };
const S_CTA_DESC = { fontSize: '13px', color: S.colors.textSecondary, marginBottom: '16px', lineHeight: 1.6 };
const S_FEATURE_ROW = {
  display: 'flex', alignItems: 'center', gap: '8px',
  fontSize: '13px', marginBottom: '6px', color: S.colors.text,
};
const S_FEATURE_CHECK = { color: S.colors.success, fontWeight: 700, fontSize: '14px' };
const S_ACTIONS = { display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' };
const S_PERIOD = { fontSize: '12px', color: S.colors.textMuted, marginTop: '4px' };

// ═══ Status Labels (P4) ═══
const STATUS_LABELS = {
  active: 'Aktiv',
  canceled: 'Gekündigt',
  past_due: 'Überfällig',
  trialing: 'Testphase',
  incomplete: 'Unvollständig',
};

// ═══ Usage config ═══
const USAGE_FIELDS = [
  { key: 'maxSubmissionsPerMonth', label: 'Einreichungen', usageKey: 'submissions' },
  { key: 'maxTemplates', label: 'Vorlagen', usageKey: 'templates' },
  { key: 'maxAiCreditsPerMonth', label: 'KI-Credits', usageKey: 'aiCredits' },
  { key: 'maxStorageMB', label: 'Speicher (MB)', usageKey: 'storageMB' },
];

// ═══ Upgrade features per plan ═══
const UPGRADE_FEATURES = {
  pro: [
    'Bis zu 10 Teammitglieder',
    '500 Einreichungen/Monat',
    '50 KI-Credits/Monat',
    'API-Zugang (nur lesen)',
    '3 Webhooks',
    '2 GB Speicher',
  ],
  business: [
    'Unbegrenzte Teammitglieder',
    '5.000 Einreichungen/Monat',
    '200 KI-Credits/Monat',
    'Voller API-Zugang',
    '20 Webhooks',
    '20 GB Speicher',
    'White-Label',
    'Eigene Domain',
  ],
};

export const SettingsBilling = memo(function SettingsBilling() {
  const { subscription, usage, loading, refresh } = useSubscription();
  const [actionLoading, setActionLoading] = useState(null);

  const plan = subscription?.plan || 'free';
  const status = subscription?.status || 'active';
  const limits = useMemo(() => getTierLimits(plan), [plan]);
  const upgradePlan = useMemo(() => getUpgradePlan(plan), [plan]);

  const usageData = useMemo(() => {
    if (!usage) return [];
    return USAGE_FIELDS.map(f => {
      const max = limits[f.key];
      const current = usage[f.usageKey] ?? 0;
      const pct = getUsagePercentage(plan, f.key, current);
      const displayMax = max === Infinity ? '\u221E' : max;
      return { ...f, current, max, pct, displayMax };
    });
  }, [usage, limits, plan]);

  const handleUpgrade = useCallback(async () => {
    if (!upgradePlan) return;
    setActionLoading('upgrade');
    try {
      const url = await createCheckout(upgradePlan);
      if (url) window.location.href = url;
    } catch (e) {
      console.error('[SettingsBilling] Checkout failed:', e);
    }
    setActionLoading(null);
  }, [upgradePlan]);

  const handleManage = useCallback(async () => {
    setActionLoading('manage');
    try {
      const url = await createPortal();
      if (url) window.location.href = url;
    } catch (e) {
      console.error('[SettingsBilling] Portal failed:', e);
    }
    setActionLoading(null);
  }, []);

  if (loading) {
    return (
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={S_TITLE}>Abonnement</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' }}>
          Lade Abo-Daten...
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={S_TITLE}>Abonnement</h3>

      {/* ═══ Current Plan ═══ */}
      <div style={S_PLAN_HEADER}>
        <div>
          <div style={S_PLAN_NAME}>{getPlanDisplayName(plan)}</div>
          <div style={S_PLAN_PRICE}>
            {getPlanPrice(plan) !== null
              ? (getPlanPrice(plan) === 0 ? 'Kostenlos' : `${getPlanPrice(plan)}\u00A0\u20AC/Monat`)
              : 'Individuell'
            }
          </div>
          {subscription?.currentPeriodEnd && (
            <div style={S_PERIOD}>
              Laufzeit bis {new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')}
            </div>
          )}
        </div>
        <span style={S_STATUS_BADGE(status)}>
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      {/* ═══ Usage Bars ═══ */}
      <div style={S_USAGE_SECTION}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Nutzung</div>
        {usageData.map(u => (
          <div key={u.key} style={S_USAGE_ITEM}>
            <div style={S_USAGE_HEADER}>
              <span style={S_USAGE_LABEL}>{u.label}</span>
              <span style={S_USAGE_VALUE(u.pct)}>{u.current}/{u.displayMax}</span>
            </div>
            <div style={S_USAGE_BAR}>
              <div style={S_USAGE_FILL(u.pct)} />
            </div>
          </div>
        ))}
        {usageData.length === 0 && (
          <div style={{ fontSize: '13px', color: S.colors.textMuted }}>
            Nutzungsdaten werden geladen...
          </div>
        )}
      </div>

      {/* ═══ Actions ═══ */}
      <div style={S_ACTIONS}>
        {plan !== 'free' && (
          <button
            onClick={handleManage}
            disabled={actionLoading === 'manage'}
            style={{ ...styles.btn('secondary'), opacity: actionLoading === 'manage' ? 0.6 : 1 }}
          >
            {actionLoading === 'manage' ? 'Laden...' : 'Plan verwalten'}
          </button>
        )}
        <button
          onClick={refresh}
          style={styles.btn('ghost', 'sm')}
        >
          Aktualisieren
        </button>
      </div>

      {/* ═══ Upgrade CTA (free plan) ═══ */}
      {upgradePlan && (
        <div style={S_UPGRADE_CTA}>
          <div style={S_CTA_TITLE}>
            Upgrade auf {getPlanDisplayName(upgradePlan)}
          </div>
          <div style={S_CTA_DESC}>
            Schalte erweiterte Funktionen frei und steigere die Produktivität deines Teams.
          </div>
          {(UPGRADE_FEATURES[upgradePlan] || []).map((feat, i) => (
            <div key={i} style={S_FEATURE_ROW}>
              <span style={S_FEATURE_CHECK}>{'\u2713'}</span>
              <span>{feat}</span>
            </div>
          ))}
          <button
            onClick={handleUpgrade}
            disabled={actionLoading === 'upgrade'}
            style={{ ...styles.btn('primary'), width: '100%', marginTop: '16px', opacity: actionLoading === 'upgrade' ? 0.6 : 1 }}
          >
            {actionLoading === 'upgrade'
              ? 'Laden...'
              : `Upgrade auf ${getPlanDisplayName(upgradePlan)} (${getPlanPrice(upgradePlan)}\u00A0\u20AC/Monat)`
            }
          </button>
        </div>
      )}
    </div>
  );
});

SettingsBilling.displayName = 'SettingsBilling';
