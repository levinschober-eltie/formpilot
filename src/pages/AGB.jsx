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

// ═══ AGB Page ═══
export const AGB = memo(function AGB() {
  return (
    <PageLayout title="Allgemeine Geschäftsbedingungen">
      <p style={S_DATE}>Stand: 29. März 2026</p>

      {/* 1. Geltungsbereich */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 1 Geltungsbereich</h2>
        <p style={S_P}>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der
          Elite PV GmbH (nachfolgend „Anbieter") und dem Nutzer (nachfolgend „Kunde") über die
          Nutzung der SaaS-Webanwendung FormPilot.
        </p>
        <p style={S_P}>
          Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nicht
          Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.
        </p>
      </section>

      {/* 2. Vertragsschluss */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 2 Vertragsschluss und Registrierung</h2>
        <p style={S_P}>
          Der Vertrag über die Nutzung von FormPilot kommt durch die Registrierung des Kunden
          und die Bestätigung durch den Anbieter zustande. Mit der Registrierung akzeptiert der
          Kunde diese AGB.
        </p>
        <p style={S_P}>
          Der Kunde ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige
          Angaben zu machen und diese bei Änderungen unverzüglich zu aktualisieren.
        </p>
        <p style={S_P}>
          Jeder Kunde darf nur ein Konto anlegen. Die Zugangsdaten sind vertraulich zu behandeln
          und dürfen nicht an Dritte weitergegeben werden. Der Kunde haftet für alle Aktivitäten,
          die über sein Konto erfolgen.
        </p>
      </section>

      {/* 3. Leistungsbeschreibung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 3 Leistungsbeschreibung</h2>
        <p style={S_P}>
          FormPilot ist eine webbasierte SaaS-Anwendung (Software as a Service) zur digitalen
          Erstellung, Verwaltung und Ausfüllung von Formularen für Handwerksbetriebe.
          Der Leistungsumfang umfasst insbesondere:
        </p>
        <ul style={S_UL}>
          <li>Erstellung und Verwaltung von Formularvorlagen mit dem integrierten Formular-Builder</li>
          <li>Digitales Ausfüllen von Formularen durch Teammitglieder (Monteure, Büropersonal)</li>
          <li>Kundenverwaltung und Projektverwaltung</li>
          <li>KI-gestützte Formularerstellung (abhängig vom gewählten Tarif)</li>
          <li>Export und Archivierung von ausgefüllten Formularen</li>
          <li>Rollenbezogene Zugriffskontrolle (Admin, Monteur, Büro)</li>
        </ul>
        <p style={S_P}>
          Der konkrete Funktionsumfang richtet sich nach dem jeweils gewählten Tarif
          (Free, Starter, Professional, Enterprise).
        </p>
      </section>

      {/* 4. Preise und Zahlung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 4 Preise und Zahlung</h2>
        <p style={S_P}>
          Die Nutzung von FormPilot erfolgt auf Basis eines Abonnementmodells.
          Die jeweils gültigen Preise sind auf der Webseite des Anbieters einsehbar.
          Alle Preise verstehen sich als Nettopreise zuzüglich der gesetzlichen Umsatzsteuer.
        </p>
        <p style={S_P}>
          Die Abrechnung erfolgt monatlich oder jährlich im Voraus, je nach gewähltem
          Abrechnungszeitraum. Die Zahlung wird über den externen Zahlungsdienstleister
          Stripe (Stripe, Inc.) abgewickelt.
        </p>
        <p style={S_P}>
          Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Anwendung zu
          sperren, bis die ausstehenden Zahlungen beglichen sind. Das Recht zur Kündigung
          aus wichtigem Grund bleibt unberührt.
        </p>
      </section>

      {/* 5. Kostenlose Testversion */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 5 Kostenlose Nutzung (Free-Plan)</h2>
        <p style={S_P}>
          Der Anbieter stellt einen kostenlosen Tarif (Free-Plan) mit eingeschränktem
          Funktionsumfang zur Verfügung. Der Free-Plan ermöglicht dem Kunden, die Grundfunktionen
          von FormPilot zeitlich unbegrenzt zu nutzen.
        </p>
        <p style={S_P}>
          Der Anbieter behält sich vor, den Funktionsumfang des Free-Plans jederzeit zu ändern.
          Eine Umstellung auf einen kostenpflichtigen Tarif erfolgt ausschließlich durch aktive
          Buchung des Kunden. Ein automatischer Übergang in ein kostenpflichtiges Abonnement
          findet nicht statt.
        </p>
      </section>

      {/* 6. Laufzeit und Kündigung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 6 Laufzeit und Kündigung</h2>
        <p style={S_P}>
          Das Abonnement beginnt mit der Buchung eines kostenpflichtigen Tarifs und läuft
          für den gewählten Abrechnungszeitraum (Monat oder Jahr).
        </p>
        <p style={S_P}>
          Das Abonnement verlängert sich automatisch um den jeweiligen Abrechnungszeitraum,
          sofern es nicht vor Ablauf der Laufzeit gekündigt wird. Die Kündigung kann jederzeit
          über die Kontoeinstellungen oder per E-Mail an{' '}
          <a href="mailto:kontakt@elite-pv.de" style={S_LINK}>kontakt@elite-pv.de</a> erfolgen.
        </p>
        <p style={S_P}>
          Bei Kündigung bleibt der Zugang bis zum Ende des bezahlten Abrechnungszeitraums bestehen.
          Danach wird das Konto auf den Free-Plan zurückgestuft. Bereits gezahlte Beiträge werden
          nicht erstattet.
        </p>
        <p style={S_P}>
          Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt für beide
          Parteien unberührt.
        </p>
      </section>

      {/* 7. Verfügbarkeit */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 7 Verfügbarkeit</h2>
        <p style={S_P}>
          Der Anbieter strebt eine Verfügbarkeit der Anwendung von 99,5 % im Jahresmittel an.
          Hiervon ausgenommen sind Zeiten, in denen die Server aufgrund von technischer Wartung,
          Updates oder Umständen, die nicht im Einflussbereich des Anbieters liegen (höhere Gewalt,
          Ausfall von Drittanbieterdiensten), nicht erreichbar sind.
        </p>
        <p style={S_P}>
          Geplante Wartungsarbeiten werden nach Möglichkeit vorab angekündigt und
          in nutzungsarme Zeiten gelegt.
        </p>
      </section>

      {/* 8. Datenschutz */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 8 Datenschutz</h2>
        <p style={S_P}>
          Der Schutz personenbezogener Daten ist dem Anbieter ein wichtiges Anliegen.
          Einzelheiten zur Erhebung, Verarbeitung und Nutzung personenbezogener Daten
          entnehmen Sie bitte unserer{' '}
          <a href="#/datenschutz" style={S_LINK}>Datenschutzerklärung</a>.
        </p>
        <p style={S_P}>
          Soweit der Kunde im Rahmen der Nutzung von FormPilot personenbezogene Daten Dritter
          verarbeitet, ist er selbst Verantwortlicher im Sinne der DSGVO. Der Anbieter wird in
          diesem Fall als Auftragsverarbeiter tätig. Auf Anfrage wird ein Auftragsverarbeitungsvertrag
          (AVV) gemäß Art. 28 DSGVO bereitgestellt.
        </p>
      </section>

      {/* 9. Gewährleistung und Haftung */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 9 Gewährleistung und Haftung</h2>
        <p style={S_P}>
          Der Anbieter gewährleistet, dass FormPilot im Wesentlichen der Leistungsbeschreibung
          entspricht. Unwesentliche Abweichungen begründen keinen Gewährleistungsanspruch.
        </p>
        <p style={S_P}>
          Die Haftung des Anbieters für Schäden ist, soweit gesetzlich zulässig, auf Vorsatz und
          grobe Fahrlässigkeit beschränkt. Bei leichter Fahrlässigkeit haftet der Anbieter nur bei
          Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), in diesem Fall begrenzt auf
          den vorhersehbaren, vertragstypischen Schaden.
        </p>
        <p style={S_P}>
          Die vorstehenden Haftungsbeschränkungen gelten nicht für Schäden aus der Verletzung
          des Lebens, des Körpers oder der Gesundheit sowie für Ansprüche nach dem
          Produkthaftungsgesetz.
        </p>
        <p style={S_P}>
          Der Anbieter haftet nicht für den Verlust von Daten, soweit der Schaden darauf
          beruht, dass der Kunde es unterlassen hat, regelmäßige Datensicherungen durchzuführen.
        </p>
      </section>

      {/* 10. Änderungen der AGB */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 10 Änderungen der AGB</h2>
        <p style={S_P}>
          Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern,
          sofern dies aus sachlich gerechtfertigten Gründen erforderlich ist und der Kunde
          dadurch nicht unangemessen benachteiligt wird.
        </p>
        <p style={S_P}>
          Änderungen werden dem Kunden mindestens 30 Tage vor Inkrafttreten per E-Mail
          mitgeteilt. Widerspricht der Kunde nicht innerhalb von 30 Tagen nach Zugang der
          Mitteilung, gelten die geänderten AGB als angenommen. Auf die Bedeutung des
          Schweigens wird der Kunde in der Mitteilung gesondert hingewiesen.
        </p>
      </section>

      {/* 11. Schlussbestimmungen */}
      <section style={S_SECTION}>
        <h2 style={S_H2}>§ 11 Schlussbestimmungen</h2>
        <p style={S_P}>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts (CISG).
        </p>
        <p style={S_P}>
          Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder
          öffentlich-rechtliches Sondervermögen, ist Gerichtsstand für alle Streitigkeiten
          aus oder im Zusammenhang mit dem Vertragsverhältnis der Sitz des Anbieters.
        </p>
        <p style={S_P}>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so berührt
          dies die Wirksamkeit der übrigen Bestimmungen nicht. An die Stelle der unwirksamen
          Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der
          unwirksamen Bestimmung am nächsten kommt (Salvatorische Klausel).
        </p>
        <p style={S_P}>
          Mündliche Nebenabreden bestehen nicht. Änderungen und Ergänzungen dieses Vertrages
          bedürfen der Schriftform. Dies gilt auch für die Änderung dieser Schriftformklausel.
        </p>
      </section>
    </PageLayout>
  );
});
