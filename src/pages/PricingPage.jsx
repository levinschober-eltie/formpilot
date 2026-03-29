import { useState } from 'react';
import { S } from '../config/theme';
import { navigate } from '../lib/router';
import { getPlanPrice, getTierLimits, getPlanDisplayName } from '../lib/tierService';
import { PageHeader } from './components/PageHeader';
import { PageFooter } from './components/PageFooter';

// ═══ STYLES (P4: ALL outside render) ═══

const S_PAGE = {
  fontFamily: S.font.sans,
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${S.colors.bg} 0%, ${S.colors.bgEnd} 100%)`,
  color: S.colors.text,
  overflowX: 'hidden',
};

const S_HERO = {
  textAlign: 'center',
  padding: '60px 20px 40px',
  maxWidth: '800px',
  margin: '0 auto',
};

const S_H1 = {
  fontSize: 'clamp(28px, 4vw, 42px)',
  fontWeight: 900,
  letterSpacing: '-0.5px',
  marginBottom: '16px',
  color: S.colors.text,
};

const S_SUB = {
  fontSize: '17px',
  color: S.colors.textSecondary,
  lineHeight: 1.6,
  maxWidth: '600px',
  margin: '0 auto',
};

// ─── Toggle ───
const S_TOGGLE_WRAP = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  margin: '32px 0 48px',
};

const S_TOGGLE_LABEL = (active) => ({
  fontSize: '14px',
  fontWeight: active ? 700 : 500,
  color: active ? S.colors.text : S.colors.textMuted,
  cursor: 'pointer',
});

const S_TOGGLE_TRACK = {
  width: '48px',
  height: '26px',
  borderRadius: '13px',
  background: S.colors.primary,
  cursor: 'pointer',
  position: 'relative',
  transition: S.transition,
  border: 'none',
  padding: 0,
};

const S_TOGGLE_THUMB = (annual) => ({
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  background: '#fff',
  position: 'absolute',
  top: '2px',
  left: annual ? '24px' : '2px',
  transition: S.transition,
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
});

const S_SAVE_BADGE = {
  background: `${S.colors.success}15`,
  color: S.colors.success,
  padding: '4px 10px',
  borderRadius: S.radius.full,
  fontSize: '12px',
  fontWeight: 700,
};

// ─── Plan cards ───
const S_CARDS_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '20px',
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '0 20px',
};

const S_CARD = (highlighted) => ({
  background: highlighted ? S.colors.primary : S.colors.bgCard,
  backdropFilter: 'blur(12px)',
  borderRadius: S.radius.lg,
  border: highlighted ? 'none' : `1px solid ${S.colors.border}`,
  padding: '32px 24px',
  textAlign: 'center',
  transition: S.transition,
  boxShadow: highlighted ? `0 8px 40px ${S.colors.primary}30` : S.colors.shadow,
  transform: highlighted ? 'scale(1.03)' : 'none',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
});

const S_BADGE = {
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: S.colors.accent,
  color: '#1a1a1a',
  padding: '4px 16px',
  borderRadius: S.radius.full,
  fontSize: '12px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const S_PLAN_NAME = (h) => ({
  fontSize: '22px', fontWeight: 700, marginBottom: '8px',
  color: h ? '#fff' : S.colors.text,
});

const S_PLAN_DESC = (h) => ({
  fontSize: '13px', color: h ? 'rgba(255,255,255,0.7)' : S.colors.textMuted,
  marginBottom: '16px', lineHeight: 1.4,
});

const S_PRICE = (h) => ({
  fontSize: '44px', fontWeight: 900, letterSpacing: '-1px',
  color: h ? '#fff' : S.colors.text,
});

const S_PRICE_PER = (h) => ({
  fontSize: '14px', color: h ? 'rgba(255,255,255,0.6)' : S.colors.textMuted,
  marginBottom: '24px',
});

const S_LIST = { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 };

const S_LI = (h) => ({
  fontSize: '14px', color: h ? 'rgba(255,255,255,0.9)' : S.colors.textSecondary,
  display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4,
});

const S_CHECK = (h) => ({ color: h ? '#fff' : S.colors.success, fontSize: '15px', flexShrink: 0 });

const S_BTN = (h) => ({
  width: '100%', padding: '13px 24px', borderRadius: S.radius.md,
  border: h ? '2px solid rgba(255,255,255,0.3)' : 'none',
  background: h ? 'rgba(255,255,255,0.15)' : S.colors.primary,
  backdropFilter: h ? 'blur(8px)' : 'none',
  color: '#fff', fontSize: '15px', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit', transition: S.transition,
});

// ─── Comparison table ───
const S_TABLE_WRAP = {
  maxWidth: '1100px',
  margin: '80px auto 0',
  padding: '0 20px',
  overflowX: 'auto',
};

const S_TABLE = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
};

const S_TH = {
  padding: '14px 16px',
  textAlign: 'left',
  fontWeight: 700,
  borderBottom: `2px solid ${S.colors.border}`,
  color: S.colors.text,
  whiteSpace: 'nowrap',
};

const S_TH_PLAN = (highlighted) => ({
  ...S_TH,
  textAlign: 'center',
  color: highlighted ? S.colors.primary : S.colors.text,
  minWidth: '120px',
});

const S_TD = {
  padding: '12px 16px',
  borderBottom: `1px solid ${S.colors.borderFaint}`,
  color: S.colors.textSecondary,
};

const S_TD_CENTER = {
  ...S_TD,
  textAlign: 'center',
};

const S_SECTION_HEAD = {
  padding: '16px',
  fontWeight: 700,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: S.colors.primary,
  background: `${S.colors.primary}06`,
  borderBottom: `1px solid ${S.colors.border}`,
};

// ─── FAQ ───
const S_FAQ_SECTION = {
  maxWidth: '800px',
  margin: '80px auto 0',
  padding: '0 20px 80px',
};

const S_FAQ_TITLE = {
  fontSize: '28px',
  fontWeight: 800,
  textAlign: 'center',
  marginBottom: '40px',
  letterSpacing: '-0.5px',
  color: S.colors.text,
};

const S_FAQ_ITEM = {
  background: S.colors.bgCard,
  backdropFilter: 'blur(12px)',
  borderRadius: S.radius.md,
  border: `1px solid ${S.colors.border}`,
  marginBottom: '12px',
  overflow: 'hidden',
  transition: S.transition,
};

const S_FAQ_Q = {
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '15px',
  color: S.colors.text,
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'inherit',
};

const S_FAQ_A = {
  padding: '0 20px 16px',
  fontSize: '14px',
  color: S.colors.textSecondary,
  lineHeight: 1.7,
};

const S_FAQ_ARROW = (open) => ({
  fontSize: '18px',
  color: S.colors.textMuted,
  transition: S.transition,
  transform: open ? 'rotate(180deg)' : 'none',
  flexShrink: 0,
});

// ═══ Plan definitions ═══
const PLAN_DEFS = [
  {
    plan: 'free', name: 'Free', highlighted: false,
    desc: 'Perfekt zum Ausprobieren',
    features: ['2 Benutzer', '5 Formulare', '50 Einreichungen/Monat', '5 KI-Credits/Monat', '100 MB Speicher', 'Basis PDF'],
  },
  {
    plan: 'pro', name: 'Pro', highlighted: true, badge: 'Beliebteste Wahl',
    desc: 'Für wachsende Teams',
    features: ['10 Benutzer', '50 Formulare', '500 Einreichungen/Monat', '50 KI-Credits/Monat', '2 GB Speicher', 'Erweitertes PDF', 'API-Zugang (lesend)', '3 Webhooks'],
  },
  {
    plan: 'business', name: 'Business', highlighted: false,
    desc: 'Für größere Unternehmen',
    features: ['Unbegrenzte Benutzer', 'Unbegrenzte Formulare', '5.000 Einreichungen/Monat', '200 KI-Credits/Monat', '20 GB Speicher', 'Volles PDF-Branding', 'Voller API-Zugang', '20 Webhooks', 'White-Label', 'Custom Domain'],
  },
  {
    plan: 'enterprise', name: 'Enterprise', highlighted: false,
    desc: 'Individuell für Konzerne',
    features: ['Alles aus Business', 'Unbegrenzte Einreichungen', 'Unbegrenzte KI-Credits', 'Unbegrenzter Speicher', 'Unbegrenzte Webhooks', 'Dedizierter Support', 'SLA & AVV', 'On-Premise Option'],
  },
];

// ═══ Comparison rows ═══
const formatLimit = (v) => {
  if (v === Infinity) return '\u221E';
  if (typeof v === 'number') return v.toLocaleString('de-DE');
  return v;
};

const SECTIONS = [
  {
    title: 'Kapazitäten',
    rows: [
      { label: 'Benutzer', key: 'maxUsers' },
      { label: 'Formulare', key: 'maxTemplates' },
      { label: 'Einreichungen/Monat', key: 'maxSubmissionsPerMonth' },
      { label: 'KI-Credits/Monat', key: 'maxAiCreditsPerMonth' },
      { label: 'Speicher', key: 'maxStorageMB', format: (v) => v === Infinity ? '\u221E' : v >= 1024 ? `${(v / 1024).toFixed(0)} GB` : `${v} MB` },
    ],
  },
  {
    title: 'Integrationen',
    rows: [
      { label: 'API-Zugang', key: 'apiAccess', type: 'bool' },
      { label: 'API (Schreibzugriff)', key: 'apiReadOnly', type: 'bool', invert: true },
      { label: 'Webhooks', key: 'maxWebhooks' },
    ],
  },
  {
    title: 'Branding',
    rows: [
      { label: 'PDF-Branding', key: 'pdfBranding', format: (v) => ({ basic: 'Basis', header: 'Erweitert', full: 'Vollständig' })[v] || v },
      { label: 'White-Label', key: 'whiteLabel', type: 'bool' },
      { label: 'Custom Domain', key: 'customDomain', type: 'bool' },
    ],
  },
];

const PLAN_KEYS = ['free', 'pro', 'business', 'enterprise'];

// ═══ FAQ data ═══
const FAQS = [
  {
    q: 'Kann ich jederzeit meinen Tarif wechseln?',
    a: 'Ja, Sie können jederzeit upgraden oder downgraden. Beim Upgrade wird der neue Tarif sofort aktiv und der Restbetrag anteilig verrechnet. Beim Downgrade gilt der neue Tarif ab dem nächsten Abrechnungszeitraum.',
  },
  {
    q: 'Wie kann ich kündigen?',
    a: 'Sie können monatliche Tarife jederzeit zum Monatsende kündigen. Bei jährlicher Abrechnung ist eine Kündigung zum Ende der Laufzeit möglich. Nach der Kündigung bleiben Ihre Daten 30 Tage für den Export verfügbar.',
  },
  {
    q: 'Gibt es eine kostenlose Testphase?',
    a: 'Der Free-Tarif ist dauerhaft kostenlos. Für Pro und Business bieten wir auf Anfrage eine 14-tägige Testphase mit vollem Funktionsumfang an — keine Kreditkarte erforderlich.',
  },
  {
    q: 'Welche Zahlungsmethoden werden akzeptiert?',
    a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) sowie SEPA-Lastschrift. Enterprise-Kunden können auch per Rechnung zahlen.',
  },
  {
    q: 'Was passiert mit meinen Daten nach der Kündigung?',
    a: 'Nach einer Kündigung bleiben Ihre Daten 30 Tage lang verfügbar, damit Sie sie exportieren können. Danach werden alle Daten gemäß DSGVO unwiderruflich gelöscht. Auf Wunsch können wir eine sofortige Löschung durchführen.',
  },
];

// ═══ FAQ Item Component ═══
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={S_FAQ_ITEM}>
      <button style={S_FAQ_Q} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span style={S_FAQ_ARROW(open)}>{'\u25BE'}</span>
      </button>
      {open && <div style={S_FAQ_A}>{a}</div>}
    </div>
  );
}

// ═══ Main Component ═══
export function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (plan) => {
    const base = getPlanPrice(plan);
    if (base === null || base === 0) return base;
    return annual ? Math.round(base * 0.8) : base;
  };

  return (
    <div style={S_PAGE}>
      <PageHeader />

      {/* Hero */}
      <div style={S_HERO}>
        <h1 style={S_H1}>Einfache, transparente Preise</h1>
        <p style={S_SUB}>
          Starten Sie kostenlos und wachsen Sie mit Ihrem Unternehmen.
          Keine versteckten Kosten, keine Überraschungen.
        </p>

        {/* Billing toggle */}
        <div style={S_TOGGLE_WRAP}>
          <span style={S_TOGGLE_LABEL(!annual)} onClick={() => setAnnual(false)}>Monatlich</span>
          <button style={S_TOGGLE_TRACK} onClick={() => setAnnual(!annual)} aria-label="Abrechnungszeitraum umschalten">
            <div style={S_TOGGLE_THUMB(annual)} />
          </button>
          <span style={S_TOGGLE_LABEL(annual)} onClick={() => setAnnual(true)}>Jährlich</span>
          {annual && <span style={S_SAVE_BADGE}>20% sparen</span>}
        </div>
      </div>

      {/* Plan cards */}
      <div style={S_CARDS_GRID}>
        {PLAN_DEFS.map((p) => {
          const price = getPrice(p.plan);
          const isEnterprise = p.plan === 'enterprise';
          return (
            <div key={p.plan} style={S_CARD(p.highlighted)}>
              {p.badge && <div style={S_BADGE}>{p.badge}</div>}
              <div style={S_PLAN_NAME(p.highlighted)}>{p.name}</div>
              <div style={S_PLAN_DESC(p.highlighted)}>{p.desc}</div>
              <div style={S_PRICE(p.highlighted)}>
                {isEnterprise ? 'Individuell' : price === 0 ? 'Kostenlos' : `${price}\u20AC`}
              </div>
              <div style={S_PRICE_PER(p.highlighted)}>
                {isEnterprise ? 'Auf Anfrage' : price === 0 ? 'Für immer' : annual ? 'pro Monat, jährlich' : 'pro Monat'}
              </div>
              <ul style={S_LIST}>
                {p.features.map((f, i) => (
                  <li key={i} style={S_LI(p.highlighted)}>
                    <span style={S_CHECK(p.highlighted)}>{'\u2713'}</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                style={S_BTN(p.highlighted)}
                onClick={() => isEnterprise ? window.location.href = 'mailto:info@elite-pv.de?subject=FormPilot Enterprise Anfrage' : navigate('/app')}
              >
                {isEnterprise ? 'Kontakt aufnehmen' : price === 0 ? 'Kostenlos starten' : 'Plan wählen'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Full comparison table */}
      <div style={S_TABLE_WRAP}>
        <h2 style={{ ...S_H1, fontSize: '28px', marginTop: '0', marginBottom: '32px', textAlign: 'center' }}>
          Detaillierter Vergleich
        </h2>
        <table style={S_TABLE}>
          <thead>
            <tr>
              <th style={S_TH}>Funktion</th>
              {PLAN_KEYS.map(k => (
                <th key={k} style={S_TH_PLAN(k === 'pro')}>
                  {getPlanDisplayName(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section) => (
              <>
                <tr key={`sec-${section.title}`}>
                  <td colSpan={5} style={S_SECTION_HEAD}>{section.title}</td>
                </tr>
                {section.rows.map((row) => (
                  <tr key={row.key}>
                    <td style={S_TD}>{row.label}</td>
                    {PLAN_KEYS.map(pk => {
                      const limits = getTierLimits(pk);
                      const val = limits[row.key];
                      let display;
                      if (row.type === 'bool') {
                        const result = row.invert ? !val : val;
                        display = result
                          ? <span style={{ color: S.colors.success, fontWeight: 700 }}>{'\u2713'}</span>
                          : <span style={{ color: S.colors.textMuted }}>{'\u2014'}</span>;
                      } else if (row.format) {
                        display = row.format(val);
                      } else {
                        display = formatLimit(val);
                      }
                      return <td key={pk} style={S_TD_CENTER}>{display}</td>;
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div style={S_FAQ_SECTION}>
        <h2 style={S_FAQ_TITLE}>Häufig gestellte Fragen</h2>
        {FAQS.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>

      <PageFooter />
    </div>
  );
}
