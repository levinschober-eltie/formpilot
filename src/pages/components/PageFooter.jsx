import { S } from '../../config/theme';

// ═══ Styles (P4: outside render) ═══
const S_FOOTER = {
  borderTop: `1px solid ${S.colors.border}`,
  padding: '40px 20px',
  fontFamily: S.font.sans,
};

const S_INNER = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '32px',
};

const S_BRAND = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const S_LOGO = {
  fontWeight: 800,
  fontSize: '18px',
  letterSpacing: '-0.5px',
  color: S.colors.text,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const S_BRAND_SUB = {
  fontSize: '13px',
  color: S.colors.textMuted,
  maxWidth: '280px',
  lineHeight: '1.5',
};

const S_COL = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const S_COL_TITLE = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: S.colors.textMuted,
  marginBottom: '4px',
};

const S_LINK = {
  fontSize: '14px',
  color: S.colors.textSecondary,
  textDecoration: 'none',
  transition: S.transition,
};

const S_BOTTOM = {
  maxWidth: '1200px',
  margin: '24px auto 0',
  paddingTop: '24px',
  borderTop: `1px solid ${S.colors.borderFaint}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '24px 20px 0',
};

const S_COPY = {
  fontSize: '13px',
  color: S.colors.textMuted,
};

export function PageFooter() {
  return (
    <footer style={S_FOOTER} id="kontakt">
      <div style={S_INNER}>
        <div style={S_BRAND}>
          <div style={S_LOGO}>
            <span>&#x1F4CB;</span>
            <span>FormPilot</span>
          </div>
          <p style={S_BRAND_SUB}>
            Digitale Formulare für Handwerk und Industrie.
            Erstellen, ausfüllen, exportieren — alles in einer App.
          </p>
        </div>

        <div style={S_COL}>
          <div style={S_COL_TITLE}>Produkt</div>
          <a href="#/pricing" style={S_LINK}>Preise</a>
          <a href="#/app" style={S_LINK}>App öffnen</a>
        </div>

        <div style={S_COL}>
          <div style={S_COL_TITLE}>Rechtliches</div>
          <a href="#/datenschutz" style={S_LINK}>Datenschutz</a>
          <a href="#/impressum" style={S_LINK}>Impressum</a>
          <a href="#/agb" style={S_LINK}>AGB</a>
        </div>

        <div style={S_COL}>
          <div style={S_COL_TITLE}>Kontakt</div>
          <a href="mailto:kontakt@elite-pv.de" style={S_LINK}>kontakt@elite-pv.de</a>
        </div>
      </div>

      <div style={S_BOTTOM}>
        <span style={S_COPY}>&copy; 2026 Elite PV GmbH. Alle Rechte vorbehalten.</span>
      </div>
    </footer>
  );
}
