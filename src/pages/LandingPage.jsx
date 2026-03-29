import { S } from '../config/theme';
import { navigate } from '../lib/router';
import { getPlanPrice, getTierLimits } from '../lib/tierService';
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

// ─── Hero ───
const S_HERO = {
  position: 'relative',
  background: `linear-gradient(135deg, ${S.colors.primaryDark} 0%, ${S.colors.primary} 50%, ${S.colors.primaryLight} 100%)`,
  padding: '80px 20px 100px',
  textAlign: 'center',
  overflow: 'hidden',
};

const S_HERO_BG = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  pointerEvents: 'none',
};

const S_HERO_INNER = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '800px',
  margin: '0 auto',
};

const S_HERO_BADGE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 16px',
  borderRadius: S.radius.full,
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '24px',
};

const S_HERO_H1 = {
  fontSize: 'clamp(32px, 5vw, 52px)',
  fontWeight: 900,
  color: '#fff',
  lineHeight: 1.1,
  letterSpacing: '-1px',
  marginBottom: '20px',
};

const S_HERO_SUB = {
  fontSize: 'clamp(16px, 2.2vw, 20px)',
  color: 'rgba(255,255,255,0.85)',
  lineHeight: 1.6,
  maxWidth: '600px',
  margin: '0 auto 36px',
};

const S_HERO_CTAS = {
  display: 'flex',
  gap: '14px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const S_HERO_BTN_PRIMARY = {
  padding: '14px 32px',
  borderRadius: S.radius.md,
  border: 'none',
  background: '#fff',
  color: S.colors.primary,
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

const S_HERO_BTN_SECONDARY = {
  padding: '14px 32px',
  borderRadius: S.radius.md,
  border: '2px solid rgba(255,255,255,0.4)',
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(8px)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
};

// ─── Mockup ───
const S_MOCKUP = {
  maxWidth: '700px',
  margin: '48px auto 0',
  padding: '16px',
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: S.radius.xl,
  border: '1px solid rgba(255,255,255,0.2)',
  position: 'relative',
  zIndex: 1,
};

const S_MOCKUP_INNER = {
  background: 'rgba(255,255,255,0.95)',
  borderRadius: S.radius.lg,
  padding: '24px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const S_MOCK_TOPBAR = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingBottom: '12px',
  borderBottom: '1px solid #e2e8f0',
};

const S_MOCK_DOT = (color) => ({
  width: '10px', height: '10px', borderRadius: '50%', background: color,
});

const S_MOCK_FIELD = {
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#94a3b8',
};

// ─── Section common ───
const S_SECTION = {
  padding: '80px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
};

const S_SECTION_ALT = {
  padding: '80px 20px',
  background: S.colors.bgCard,
};

const S_SECTION_TITLE = {
  fontSize: 'clamp(26px, 4vw, 38px)',
  fontWeight: 800,
  textAlign: 'center',
  letterSpacing: '-0.5px',
  marginBottom: '12px',
  color: S.colors.text,
};

const S_SECTION_SUB = {
  fontSize: '16px',
  color: S.colors.textSecondary,
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 48px',
  lineHeight: 1.6,
};

// ─── Features grid ───
const S_FEATURES_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
};

const S_FEATURE_CARD = {
  background: S.colors.bgCard,
  backdropFilter: 'blur(12px)',
  borderRadius: S.radius.lg,
  border: `1px solid ${S.colors.border}`,
  padding: '28px',
  transition: S.transition,
  boxShadow: S.colors.shadow,
};

const S_FEATURE_ICON = {
  width: '48px',
  height: '48px',
  borderRadius: S.radius.md,
  background: `${S.colors.primary}10`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  marginBottom: '16px',
};

const S_FEATURE_TITLE = {
  fontSize: '17px',
  fontWeight: 700,
  marginBottom: '8px',
  color: S.colors.text,
};

const S_FEATURE_DESC = {
  fontSize: '14px',
  color: S.colors.textSecondary,
  lineHeight: 1.6,
};

// ─── Steps ───
const S_STEPS = {
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
  flexWrap: 'wrap',
  maxWidth: '900px',
  margin: '0 auto',
};

const S_STEP = {
  flex: '1 1 220px',
  maxWidth: '280px',
  textAlign: 'center',
};

const S_STEP_NUM = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${S.colors.primary}, ${S.colors.primaryLight})`,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  fontWeight: 800,
  margin: '0 auto 16px',
  boxShadow: `0 4px 16px ${S.colors.primary}40`,
};

const S_STEP_TITLE = {
  fontSize: '18px',
  fontWeight: 700,
  marginBottom: '8px',
  color: S.colors.text,
};

const S_STEP_DESC = {
  fontSize: '14px',
  color: S.colors.textSecondary,
  lineHeight: 1.6,
};

// ─── Pricing preview ───
const S_PRICING_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  maxWidth: '1000px',
  margin: '0 auto',
};

const S_PRICE_CARD = (highlighted) => ({
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
});

const S_PRICE_BADGE = {
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

const S_PRICE_NAME = (highlighted) => ({
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '8px',
  color: highlighted ? '#fff' : S.colors.text,
});

const S_PRICE_AMOUNT = (highlighted) => ({
  fontSize: '40px',
  fontWeight: 900,
  letterSpacing: '-1px',
  color: highlighted ? '#fff' : S.colors.text,
});

const S_PRICE_PERIOD = (highlighted) => ({
  fontSize: '14px',
  color: highlighted ? 'rgba(255,255,255,0.7)' : S.colors.textMuted,
  marginBottom: '24px',
});

const S_PRICE_FEATURES = (highlighted) => ({
  listStyle: 'none',
  padding: 0,
  margin: '0 0 28px',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

const S_PRICE_FEATURE = (highlighted) => ({
  fontSize: '14px',
  color: highlighted ? 'rgba(255,255,255,0.9)' : S.colors.textSecondary,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  lineHeight: 1.4,
});

const S_PRICE_CHECK = (highlighted) => ({
  color: highlighted ? '#fff' : S.colors.success,
  fontSize: '16px',
  flexShrink: 0,
});

const S_PRICE_BTN = (highlighted) => ({
  width: '100%',
  padding: '12px 24px',
  borderRadius: S.radius.md,
  border: highlighted ? '2px solid rgba(255,255,255,0.4)' : 'none',
  background: highlighted ? 'rgba(255,255,255,0.15)' : S.colors.primary,
  backdropFilter: highlighted ? 'blur(8px)' : 'none',
  color: highlighted ? '#fff' : '#fff',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
});

// ─── CTA section ───
const S_CTA_SECTION = {
  textAlign: 'center',
  padding: '80px 20px',
  background: `linear-gradient(135deg, ${S.colors.primaryDark} 0%, ${S.colors.primary} 100%)`,
};

const S_CTA_H2 = {
  fontSize: 'clamp(26px, 4vw, 38px)',
  fontWeight: 800,
  color: '#fff',
  marginBottom: '16px',
  letterSpacing: '-0.5px',
};

const S_CTA_P = {
  fontSize: '17px',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: '32px',
  maxWidth: '500px',
  margin: '0 auto 32px',
  lineHeight: 1.6,
};

const S_CTA_BTN = {
  padding: '16px 40px',
  borderRadius: S.radius.md,
  border: 'none',
  background: '#fff',
  color: S.colors.primary,
  fontSize: '17px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: S.transition,
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};

// ═══ Feature data ═══
const FEATURES = [
  {
    icon: '\u2B50', // star
    title: '19 Feldtypen',
    desc: 'Text, Foto, Unterschrift, GPS, Barcode, Checkbox, Dropdown, Tabellen und mehr — alles was Sie brauchen.',
  },
  {
    icon: '\u2728', // sparkles
    title: 'KI-Formular-Generator',
    desc: 'Beschreiben Sie Ihr Formular per Prompt und unsere KI erstellt es automatisch. In Sekunden fertig.',
  },
  {
    icon: '\uD83D\uDCC4', // page
    title: 'PDF-Export',
    desc: 'Professionelle PDFs mit Ihrem Firmenbranding. Logo, Farben und Layout — automatisch formatiert.',
  },
  {
    icon: '\uD83D\uDCF6', // signal
    title: 'Offline-fähig',
    desc: 'Arbeiten Sie ohne Internet auf der Baustelle. Daten werden automatisch synchronisiert, sobald Sie wieder online sind.',
  },
  {
    icon: '\uD83D\uDCC1', // folder
    title: 'Projekt-Management',
    desc: 'Baustellen, Phasen und Verknüpfungen. Organisieren Sie Ihre Formulare projektbezogen.',
  },
  {
    icon: '\uD83D\uDC65', // people
    title: 'Team-Rollen',
    desc: 'Admin, Büro, Monteur — rollenbasierter Zugriff. Jeder sieht nur, was für ihn relevant ist.',
  },
];

// ═══ Plan data for pricing preview ═══
const PLANS = [
  {
    name: 'Free',
    plan: 'free',
    highlighted: false,
    features: [
      '2 Benutzer',
      '5 Formulare',
      '50 Einreichungen/Monat',
      '5 KI-Credits/Monat',
      '100 MB Speicher',
      'Basis PDF-Branding',
    ],
  },
  {
    name: 'Pro',
    plan: 'pro',
    highlighted: true,
    badge: 'Beliebteste Wahl',
    features: [
      '10 Benutzer',
      '50 Formulare',
      '500 Einreichungen/Monat',
      '50 KI-Credits/Monat',
      '2 GB Speicher',
      'API-Zugang (lesend)',
      '3 Webhooks',
    ],
  },
  {
    name: 'Business',
    plan: 'business',
    highlighted: false,
    features: [
      'Unbegrenzte Benutzer',
      'Unbegrenzte Formulare',
      '5.000 Einreichungen/Monat',
      '200 KI-Credits/Monat',
      '20 GB Speicher',
      'Voller API-Zugang',
      'White-Label & Custom Domain',
    ],
  },
];

// ═══ Component ═══
export function LandingPage() {
  return (
    <div style={S_PAGE}>
      <PageHeader />

      {/* ─── Hero ─── */}
      <section style={S_HERO}>
        <div style={S_HERO_BG} />
        <div style={S_HERO_INNER}>
          <div style={S_HERO_BADGE}>
            <span>&#x1F680;</span>
            <span>Jetzt verfügbar — kostenlos starten</span>
          </div>
          <h1 style={S_HERO_H1}>
            Digitale Formulare für<br />Handwerk & Industrie
          </h1>
          <p style={S_HERO_SUB}>
            Erstellen Sie professionelle Formulare, füllen Sie sie auf der Baustelle aus
            und exportieren Sie alles als PDF — auch ohne Internet.
          </p>
          <div style={S_HERO_CTAS}>
            <button style={S_HERO_BTN_PRIMARY} onClick={() => navigate('/app')}>
              Kostenlos starten
            </button>
            <button style={S_HERO_BTN_SECONDARY} onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Mehr erfahren
            </button>
          </div>

          {/* App mockup */}
          <div style={S_MOCKUP}>
            <div style={S_MOCKUP_INNER}>
              <div style={S_MOCK_TOPBAR}>
                <div style={S_MOCK_DOT('#ef4444')} />
                <div style={S_MOCK_DOT('#f59e0b')} />
                <div style={S_MOCK_DOT('#22c55e')} />
                <span style={{ marginLeft: '12px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Serviceprotokoll
                </span>
              </div>
              <div style={S_MOCK_FIELD}>Kundenname: Max Mustermann GmbH</div>
              <div style={S_MOCK_FIELD}>Auftragsnummer: AUF-2026-0042</div>
              <div style={{ ...S_MOCK_FIELD, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Foto der Anlage</span>
                <span style={{ background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Aufnehmen</span>
              </div>
              <div style={{ ...S_MOCK_FIELD, borderStyle: 'dashed', textAlign: 'center', color: '#94a3b8' }}>
                Unterschrift des Kunden
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={S_SECTION} id="features">
        <h2 style={S_SECTION_TITLE}>Alles was Sie brauchen</h2>
        <p style={S_SECTION_SUB}>
          FormPilot vereint Formularerstellung, Datenerfassung und Export in einer
          leistungsstarken Anwendung.
        </p>
        <div style={S_FEATURES_GRID}>
          {FEATURES.map((f, i) => (
            <div key={i} style={S_FEATURE_CARD}>
              <div style={S_FEATURE_ICON}>{f.icon}</div>
              <div style={S_FEATURE_TITLE}>{f.title}</div>
              <div style={S_FEATURE_DESC}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={S_SECTION_ALT}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={S_SECTION_TITLE}>So funktioniert's</h2>
          <p style={S_SECTION_SUB}>
            In drei einfachen Schritten von der leeren Seite zum fertigen Dokument.
          </p>
          <div style={S_STEPS}>
            <div style={S_STEP}>
              <div style={S_STEP_NUM}>1</div>
              <div style={S_STEP_TITLE}>Erstellen</div>
              <div style={S_STEP_DESC}>
                Bauen Sie Ihr Formular mit dem Drag-and-Drop-Editor oder lassen Sie
                die KI eines für Sie generieren.
              </div>
            </div>
            <div style={S_STEP}>
              <div style={S_STEP_NUM}>2</div>
              <div style={S_STEP_TITLE}>Ausfüllen</div>
              <div style={S_STEP_DESC}>
                Ihre Monteure füllen Formulare direkt auf dem Smartphone aus —
                auch offline auf der Baustelle.
              </div>
            </div>
            <div style={S_STEP}>
              <div style={S_STEP_NUM}>3</div>
              <div style={S_STEP_TITLE}>Exportieren</div>
              <div style={S_STEP_DESC}>
                Exportieren Sie fertige Formulare als professionelle PDFs
                mit Ihrem Firmenbranding.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section style={S_SECTION} id="pricing">
        <h2 style={S_SECTION_TITLE}>Einfache, transparente Preise</h2>
        <p style={S_SECTION_SUB}>
          Starten Sie kostenlos. Upgraden Sie, wenn Sie mehr brauchen.
          Keine versteckten Kosten.
        </p>
        <div style={S_PRICING_GRID}>
          {PLANS.map((p) => {
            const price = getPlanPrice(p.plan);
            return (
              <div key={p.plan} style={S_PRICE_CARD(p.highlighted)}>
                {p.badge && <div style={S_PRICE_BADGE}>{p.badge}</div>}
                <div style={S_PRICE_NAME(p.highlighted)}>{p.name}</div>
                <div style={S_PRICE_AMOUNT(p.highlighted)}>
                  {price === 0 ? 'Kostenlos' : `${price}\u20AC`}
                </div>
                <div style={S_PRICE_PERIOD(p.highlighted)}>
                  {price === 0 ? 'Für immer' : 'pro Monat'}
                </div>
                <ul style={S_PRICE_FEATURES(p.highlighted)}>
                  {p.features.map((f, i) => (
                    <li key={i} style={S_PRICE_FEATURE(p.highlighted)}>
                      <span style={S_PRICE_CHECK(p.highlighted)}>{'\u2713'}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={S_PRICE_BTN(p.highlighted)}
                  onClick={() => p.plan === 'free' ? navigate('/app') : navigate('/pricing')}
                >
                  {price === 0 ? 'Kostenlos starten' : 'Plan wählen'}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              background: 'none', border: 'none', color: S.colors.primary,
              fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Alle Tarife vergleichen &rarr;
          </button>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={S_CTA_SECTION}>
        <h2 style={S_CTA_H2}>Jetzt kostenlos starten</h2>
        <p style={S_CTA_P}>
          Keine Kreditkarte erforderlich. Erstellen Sie Ihr erstes Formular in unter 2 Minuten.
        </p>
        <button style={S_CTA_BTN} onClick={() => navigate('/app')}>
          FormPilot kostenlos testen
        </button>
      </section>

      <PageFooter />
    </div>
  );
}
