import { memo } from 'react';
import { S } from '../config/theme';
import { PageLayout } from './PageLayout';

// ═══ Styles (P4: outside render) ═══
const S_SECTION = {
  marginBottom: '32px',
};

const S_H2 = {
  fontSize: '20px',
  fontWeight: 700,
  color: S.colors.text,
  marginBottom: '12px',
  marginTop: '32px',
  letterSpacing: '-0.3px',
};

const S_H3 = {
  fontSize: '16px',
  fontWeight: 600,
  color: S.colors.text,
  marginBottom: '8px',
  marginTop: '20px',
};

const S_P = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: S.colors.textSecondary,
  marginBottom: '12px',
};

const S_UL = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: S.colors.textSecondary,
  paddingLeft: '24px',
  marginBottom: '12px',
};

const S_LINK = {
  color: S.colors.primary,
  textDecoration: 'underline',
};

const S_DATE = {
  fontSize: '13px',
  color: S.colors.textMuted,
  marginBottom: '32px',
};

// ═══ Datenschutz Page ═══
export const Datenschutz = memo(function Datenschutz() {
  return (
    <PageLayout title="Datenschutzerklärung">
      <p style={S_DATE}>Stand: 29. März 2026</p>

      {/* 1. Verantwortliche Stelle */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>1. Verantwortliche Stelle</h2>
        <p style={S_P}>
          Elite PV GmbH<br />
          Vertreten durch: Levin Schober (Geschäftsführer)<br />
          Musterstraße 1<br />
          12345 Musterstadt<br />
          E-Mail: <a href="mailto:kontakt@elite-pv.de" style={S_LINK}>kontakt@elite-pv.de</a>
        </p>
      </section>

      {/* 2. Erhebung und Verarbeitung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>2. Erhebung und Verarbeitung personenbezogener Daten</h2>
        <p style={S_P}>
          Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unserer
          Webanwendung FormPilot und der damit verbundenen Dienstleistungen erforderlich ist. Die Erhebung
          und Verarbeitung Ihrer personenbezogenen Daten erfolgt ausschließlich auf Grundlage der
          gesetzlichen Bestimmungen (DSGVO, BDSG, TTDSG).
        </p>
        <p style={S_P}>
          FormPilot ist eine SaaS-Webanwendung zur digitalen Erstellung und Verwaltung von Formularen
          für Handwerksbetriebe. Bei der Nutzung unseres Dienstes werden verschiedene personenbezogene
          Daten erhoben und verarbeitet.
        </p>
      </section>

      {/* 3. Rechtsgrundlagen */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>3. Rechtsgrundlagen der Verarbeitung (Art. 6 DSGVO)</h2>
        <p style={S_P}>Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf folgenden Rechtsgrundlagen:</p>
        <ul style={S_UL}>
          <li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung: Soweit Sie uns eine Einwilligung zur Verarbeitung erteilt haben.</li>
          <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung: Soweit die Verarbeitung zur Erfüllung eines Vertrags mit Ihnen oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.</li>
          <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – Rechtliche Verpflichtung: Soweit wir einer rechtlichen Verpflichtung unterliegen.</li>
          <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – Berechtigtes Interesse: Soweit die Verarbeitung zur Wahrung unserer berechtigten Interessen erforderlich ist.</li>
        </ul>
      </section>

      {/* 4. Welche Daten wir erheben */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>4. Welche Daten wir erheben</h2>

        <h3 style={S_H3}>4.1 Account-Daten</h3>
        <p style={S_P}>
          Bei der Registrierung und Nutzung von FormPilot erheben wir folgende Daten:
        </p>
        <ul style={S_UL}>
          <li>Name und Vorname</li>
          <li>E-Mail-Adresse</li>
          <li>Firmenname und Branche</li>
          <li>Benutzerrolle (Admin, Monteur, Büro)</li>
          <li>Zugangsdaten (verschlüsselt gespeichert)</li>
        </ul>

        <h3 style={S_H3}>4.2 Nutzungsdaten</h3>
        <p style={S_P}>
          Bei der Nutzung unserer Anwendung werden automatisch folgende technische Daten erhoben:
        </p>
        <ul style={S_UL}>
          <li>IP-Adresse (anonymisiert)</li>
          <li>Browsertyp und -version</li>
          <li>Betriebssystem</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Genutzte Funktionen und Seitenaufrufe</li>
        </ul>

        <h3 style={S_H3}>4.3 Formulardaten</h3>
        <p style={S_P}>
          Daten, die Sie in FormPilot-Formularen eingeben, werden zur Bereitstellung des Dienstes
          gespeichert. Dies können je nach Formulartyp unterschiedliche Daten sein, einschließlich
          Kundendaten, Projektdaten, Unterschriften und Fotos. Diese Daten werden ausschließlich
          für die Zwecke verarbeitet, die sich aus dem jeweiligen Formular ergeben.
        </p>

        <h3 style={S_H3}>4.4 Zahlungsdaten</h3>
        <p style={S_P}>
          Zahlungen werden über unseren Zahlungsdienstleister Stripe (Stripe, Inc.) abgewickelt.
          Wir selbst speichern keine vollständigen Kreditkartennummern oder Bankdaten.
          Stripe verarbeitet Ihre Zahlungsdaten gemäß dessen eigener{' '}
          <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" style={S_LINK}>
            Datenschutzerklärung
          </a>.
        </p>
      </section>

      {/* 5. Cookies und Tracking */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>5. Cookies und Tracking</h2>
        <p style={S_P}>
          FormPilot verwendet ausschließlich <strong>technisch notwendige Cookies</strong>, die für den
          Betrieb der Anwendung erforderlich sind. Dazu gehören:
        </p>
        <ul style={S_UL}>
          <li>Session-Cookies zur Authentifizierung</li>
          <li>Cookie-Consent-Speicherung (localStorage)</li>
          <li>Einstellungen wie Dark Mode (localStorage)</li>
        </ul>
        <p style={S_P}>
          Wir verwenden <strong>keine Tracking-Cookies</strong>, keine Analyse-Tools wie Google Analytics
          und keine Werbe-Tracker. Es findet kein Profiling statt.
        </p>
      </section>

      {/* 6. Datenweitergabe an Dritte */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>6. Datenweitergabe an Dritte</h2>
        <p style={S_P}>
          Wir geben Ihre personenbezogenen Daten nur an Dritte weiter, wenn dies für die Erbringung
          unserer Dienstleistungen erforderlich ist oder eine gesetzliche Verpflichtung besteht.
          Folgende Dienstleister werden eingesetzt:
        </p>
        <ul style={S_UL}>
          <li>
            <strong>Stripe, Inc.</strong> (USA) – Zahlungsabwicklung. Stripe ist unter dem EU-US
            Data Privacy Framework zertifiziert.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </li>
          <li>
            <strong>Railway Corp.</strong> (USA) – Hosting und Datenbanken.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an zuverlässigem Hosting).
          </li>
          <li>
            <strong>Vercel, Inc.</strong> (USA) – CDN und Frontend-Hosting.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an performanter Auslieferung).
          </li>
          <li>
            <strong>Anthropic, PBC</strong> (USA) – KI-gestützte Formularerstellung.
            Daten werden nur bei aktiver Nutzung der KI-Funktion übermittelt.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </li>
        </ul>
        <p style={S_P}>
          Für die Datenübermittlung in die USA stützen wir uns auf die jeweiligen
          Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2 lit. c DSGVO sowie,
          soweit vorhanden, auf Zertifizierungen nach dem EU-US Data Privacy Framework.
        </p>
      </section>

      {/* 7. Datenspeicherung und Löschung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>7. Datenspeicherung und Löschung</h2>
        <p style={S_P}>
          Ihre personenbezogenen Daten werden nur so lange gespeichert, wie es für die Zwecke,
          für die sie erhoben wurden, erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
        </p>
        <ul style={S_UL}>
          <li><strong>Account-Daten:</strong> Werden bei Kontolöschung unverzüglich gelöscht.</li>
          <li><strong>Formulardaten:</strong> Werden gemäß Ihren Einstellungen oder bei Kontolöschung gelöscht.</li>
          <li><strong>Zahlungsdaten:</strong> Aufbewahrung gemäß handels- und steuerrechtlichen Vorschriften (bis zu 10 Jahre).</li>
          <li><strong>Nutzungsdaten:</strong> Werden nach 90 Tagen automatisch anonymisiert.</li>
        </ul>
      </section>

      {/* 8. Rechte der Betroffenen */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>8. Ihre Rechte als betroffene Person</h2>
        <p style={S_P}>
          Ihnen stehen gemäß DSGVO folgende Rechte zu, die Sie jederzeit unter{' '}
          <a href="mailto:kontakt@elite-pv.de" style={S_LINK}>kontakt@elite-pv.de</a> geltend machen können:
        </p>
        <ul style={S_UL}>
          <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu erhalten.</li>
          <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger oder die Vervollständigung unvollständiger Daten verlangen.</li>
          <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</li>
          <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können unter bestimmten Voraussetzungen die Einschränkung der Verarbeitung verlangen.</li>
          <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</li>
          <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung Ihrer Daten aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen.</li>
        </ul>
        <p style={S_P}>
          Sofern die Verarbeitung auf einer Einwilligung beruht, können Sie diese jederzeit
          mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO).
        </p>
      </section>

      {/* 9. Datenschutzbeauftragter */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>9. Datenschutzbeauftragter</h2>
        <p style={S_P}>
          Die Bestellung eines Datenschutzbeauftragten ist für unser Unternehmen derzeit
          nicht gesetzlich vorgeschrieben. Bei Fragen zum Datenschutz wenden Sie sich bitte an:
        </p>
        <p style={S_P}>
          Levin Schober<br />
          Elite PV GmbH<br />
          E-Mail: <a href="mailto:kontakt@elite-pv.de" style={S_LINK}>kontakt@elite-pv.de</a>
        </p>
      </section>

      {/* 10. Beschwerderecht */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>10. Beschwerderecht bei einer Aufsichtsbehörde</h2>
        <p style={S_P}>
          Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs
          steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde zu, wenn Sie der Ansicht sind,
          dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt (Art. 77 DSGVO).
        </p>
        <p style={S_P}>
          Die für uns zuständige Aufsichtsbehörde ist:<br />
          Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
          Promenade 18, 91522 Ansbach<br />
          <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" style={S_LINK}>
            www.lda.bayern.de
          </a>
        </p>
      </section>
    </PageLayout>
  );
});
