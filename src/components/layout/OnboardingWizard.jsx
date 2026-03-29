import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { apiFetch } from '../../lib/api/client';
import { LogoUpload } from '../common/LogoUpload';

// ═══ Extracted Styles (P4) ═══
const S_OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
};
const S_MODAL = {
  ...S.glass,
  background: S.colors.bgCard,
  borderRadius: S.radius.xl,
  boxShadow: S.colors.shadowLg,
  width: '100%', maxWidth: '600px', maxHeight: '90vh',
  overflow: 'auto', padding: '32px',
};
const S_STEPS = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px', marginBottom: '32px',
};
const S_STEP_DOT = (active, done) => ({
  width: '10px', height: '10px', borderRadius: '50%',
  background: active ? S.colors.primary : done ? S.colors.success : S.colors.border,
  transition: S.transition,
});
const S_STEP_LINE = {
  width: '40px', height: '2px', background: S.colors.border, borderRadius: '1px',
};
const S_TITLE = {
  fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center',
};
const S_SUBTITLE = {
  fontSize: '14px', color: S.colors.textSecondary, marginBottom: '24px', textAlign: 'center',
};
const S_FIELD = { marginBottom: '16px' };
const S_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_INDUSTRY_GRID = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px', marginBottom: '24px',
};
const S_INDUSTRY_CARD = (selected) => ({
  padding: '20px 16px', borderRadius: S.radius.lg, textAlign: 'center',
  border: `2px solid ${selected ? S.colors.primary : S.colors.border}`,
  background: selected ? `${S.colors.primary}10` : S.colors.bgInput,
  cursor: 'pointer', transition: S.transition,
});
const S_INDUSTRY_ICON = { fontSize: '28px', marginBottom: '8px', display: 'block' };
const S_INDUSTRY_LABEL = { fontSize: '13px', fontWeight: 600, color: S.colors.text };
const S_FOOTER = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginTop: '24px', gap: '12px', flexWrap: 'wrap',
};
const S_TEMPLATE_SUGGESTION = (selected) => ({
  padding: '14px 16px', borderRadius: S.radius.md,
  border: `1.5px solid ${selected ? S.colors.primary : S.colors.border}`,
  background: selected ? `${S.colors.primary}08` : S.colors.bgInput,
  cursor: 'pointer', transition: S.transition, marginBottom: '8px',
  display: 'flex', alignItems: 'center', gap: '12px',
});
const S_CHECK = (checked) => ({
  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
  border: `2px solid ${checked ? S.colors.primary : S.colors.border}`,
  background: checked ? S.colors.primary : 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontSize: '12px', fontWeight: 700, transition: S.transition,
});
const S_OPTION_CARD = {
  padding: '16px', borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`, background: S.colors.bgInput,
  cursor: 'pointer', transition: S.transition, marginBottom: '10px',
  display: 'flex', alignItems: 'center', gap: '14px',
};
const S_OPTION_ICON = { fontSize: '24px', flexShrink: 0 };
const S_OPTION_TITLE = { fontWeight: 600, fontSize: '14px', marginBottom: '2px' };
const S_OPTION_DESC = { fontSize: '12px', color: S.colors.textSecondary };

// ═══ Industry Data (P4) ═══
const INDUSTRIES = [
  { id: 'handwerk', label: 'Handwerk', icon: '\u{1F528}' },
  { id: 'industrie', label: 'Industrie', icon: '\u{1F3ED}' },
  { id: 'bau', label: 'Bau', icon: '\u{1F3D7}' },
  { id: 'service', label: 'Service', icon: '\u{1F4CB}' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '\u{2699}' },
];

const INDUSTRY_TEMPLATES = {
  handwerk: [
    { id: 'hw-service', name: 'Service-Bericht', desc: 'Standard-Servicebericht mit Arbeitszeiten und Material' },
    { id: 'hw-abnahme', name: 'Abnahmeprotokoll', desc: 'Kundenabnahme mit Checkliste und Unterschrift' },
    { id: 'hw-mangel', name: 'Mängelprotokoll', desc: 'Mängeldokumentation mit Fotos und Bewertung' },
  ],
  industrie: [
    { id: 'ind-pruefung', name: 'Prüfprotokoll', desc: 'Standardisierte Prüfung mit Messwerten' },
    { id: 'ind-wartung', name: 'Wartungsprotokoll', desc: 'Regelmässige Wartungsdokumentation' },
    { id: 'ind-sicherheit', name: 'Sicherheitsunterweisung', desc: 'Unterweisung mit Teilnehmerliste' },
  ],
  bau: [
    { id: 'bau-tagesbericht', name: 'Bau-Tagesbericht', desc: 'Täglicher Baustellenbericht mit Wetter und Personal' },
    { id: 'bau-abnahme', name: 'Bauabnahme', desc: 'Abnahmeprotokoll für Bauleistungen' },
    { id: 'bau-aufmass', name: 'Aufmass', desc: 'Aufmass-Erfassung mit Skizzen' },
  ],
  service: [
    { id: 'srv-einsatz', name: 'Einsatzbericht', desc: 'Technischer Einsatzbericht mit Zeiterfassung' },
    { id: 'srv-uebergabe', name: 'Übergabeprotokoll', desc: 'Übergabe an Kunden mit Checkliste' },
    { id: 'srv-feedback', name: 'Kundenfeedback', desc: 'Bewertungsbogen nach Einsatz' },
  ],
  sonstiges: [
    { id: 'gen-checkliste', name: 'Allgemeine Checkliste', desc: 'Flexible Checkliste für beliebige Zwecke' },
    { id: 'gen-bericht', name: 'Allgemeiner Bericht', desc: 'Freitext-Bericht mit Fotos' },
  ],
};

export const OnboardingWizard = memo(function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Company profile
  const [company, setCompany] = useState({
    name: '', address: '', phone: '', email: '', logo: '',
  });

  // Step 2: Industry
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  // Step 3: Template choice
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const suggestedTemplates = useMemo(() => {
    return selectedIndustry ? (INDUSTRY_TEMPLATES[selectedIndustry] || []) : [];
  }, [selectedIndustry]);

  const updateCompanyField = useCallback((field, value) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogoChange = useCallback((val) => {
    setCompany(prev => ({ ...prev, logo: val }));
  }, []);

  const toggleSuggestion = useCallback((id) => {
    setSelectedSuggestions(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const handleNext = useCallback(async () => {
    if (step === 0) {
      // Save company profile
      if (company.name.trim()) {
        setSaving(true);
        try {
          await apiFetch('/api/organization/profile', {
            method: 'PUT',
            body: JSON.stringify({
              companyName: company.name,
              companyAddress: company.address,
              companyPhone: company.phone,
              companyEmail: company.email,
              companyLogo: company.logo,
            }),
          });
        } catch (e) {
          // Save locally as fallback
          localStorage.setItem('fp_company_settings', JSON.stringify({
            companyName: company.name,
            companyAddress: company.address,
            companyPhone: company.phone,
            companyEmail: company.email,
            companyLogo: company.logo,
          }));
        }
        setSaving(false);
      }
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      onComplete({ company, industry: selectedIndustry, templates: selectedSuggestions });
    }
  }, [step, company, selectedIndustry, selectedSuggestions, onComplete]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const handleSkip = useCallback(() => {
    onComplete(null);
  }, [onComplete]);

  const handleActionCreateFromScratch = useCallback(() => {
    onComplete({ company, industry: selectedIndustry, templates: [], action: 'builder' });
  }, [company, selectedIndustry, onComplete]);

  const handleActionGenerateWithAI = useCallback(() => {
    onComplete({ company, industry: selectedIndustry, templates: [], action: 'ai' });
  }, [company, selectedIndustry, onComplete]);

  const canProceed = useMemo(() => {
    if (step === 0) return company.name.trim().length > 0;
    if (step === 1) return selectedIndustry !== null;
    return true;
  }, [step, company.name, selectedIndustry]);

  return (
    <div style={S_OVERLAY}>
      <div style={S_MODAL}>
        {/* Step indicators */}
        <div style={S_STEPS}>
          <div style={S_STEP_DOT(step === 0, step > 0)} />
          <div style={S_STEP_LINE} />
          <div style={S_STEP_DOT(step === 1, step > 1)} />
          <div style={S_STEP_LINE} />
          <div style={S_STEP_DOT(step === 2, false)} />
        </div>

        {/* ═══ Step 1: Unternehmensprofil ═══ */}
        {step === 0 && (
          <>
            <h2 style={S_TITLE}>Unternehmensprofil</h2>
            <p style={S_SUBTITLE}>
              Hinterlege deine Firmendaten. Diese erscheinen auf deinen Formularen und PDF-Exporten.
            </p>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Firmenlogo</label>
              <LogoUpload value={company.logo} onChange={handleLogoChange} />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Firmenname *</label>
              <input
                value={company.name}
                onChange={e => updateCompanyField('name', e.target.value)}
                placeholder="z.B. Mustermann GmbH"
                style={S_INPUT}
              />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Adresse</label>
              <textarea
                value={company.address}
                onChange={e => updateCompanyField('address', e.target.value)}
                placeholder={'Musterstr. 1\n12345 Musterstadt'}
                rows={3}
                style={{ ...S_INPUT, minHeight: '72px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ ...S_FIELD, flex: 1 }}>
                <label style={S_LABEL}>Telefon</label>
                <input
                  value={company.phone}
                  onChange={e => updateCompanyField('phone', e.target.value)}
                  placeholder="089/12345678"
                  style={S_INPUT}
                />
              </div>
              <div style={{ ...S_FIELD, flex: 1 }}>
                <label style={S_LABEL}>E-Mail</label>
                <input
                  value={company.email}
                  onChange={e => updateCompanyField('email', e.target.value)}
                  placeholder="info@firma.de"
                  type="email"
                  style={S_INPUT}
                />
              </div>
            </div>
          </>
        )}

        {/* ═══ Step 2: Branche wählen ═══ */}
        {step === 1 && (
          <>
            <h2 style={S_TITLE}>Branche wählen</h2>
            <p style={S_SUBTITLE}>
              Wähle deine Branche, um passende Formularvorlagen vorgeschlagen zu bekommen.
            </p>
            <div style={S_INDUSTRY_GRID}>
              {INDUSTRIES.map(ind => (
                <div
                  key={ind.id}
                  style={S_INDUSTRY_CARD(selectedIndustry === ind.id)}
                  onClick={() => setSelectedIndustry(ind.id)}
                >
                  <span style={S_INDUSTRY_ICON}>{ind.icon}</span>
                  <span style={S_INDUSTRY_LABEL}>{ind.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ Step 3: Erstes Formular ═══ */}
        {step === 2 && (
          <>
            <h2 style={S_TITLE}>Erstes Formular</h2>
            <p style={S_SUBTITLE}>
              Wähle Vorlagen aus oder erstelle dein eigenes Formular.
            </p>

            {suggestedTemplates.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '10px' }}>
                  Empfohlene Vorlagen
                </div>
                {suggestedTemplates.map(t => (
                  <div
                    key={t.id}
                    style={S_TEMPLATE_SUGGESTION(selectedSuggestions.includes(t.id))}
                    onClick={() => toggleSuggestion(t.id)}
                  >
                    <div style={S_CHECK(selectedSuggestions.includes(t.id))}>
                      {selectedSuggestions.includes(t.id) ? '\u2713' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: S.colors.textSecondary }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '10px' }}>
              Oder starte anders
            </div>
            <div
              style={S_OPTION_CARD}
              onClick={handleActionCreateFromScratch}
            >
              <span style={S_OPTION_ICON}>{'\u{1F4DD}'}</span>
              <div>
                <div style={S_OPTION_TITLE}>Selbst erstellen</div>
                <div style={S_OPTION_DESC}>Eigenes Formular im Builder zusammenstellen</div>
              </div>
            </div>
            <div
              style={S_OPTION_CARD}
              onClick={handleActionGenerateWithAI}
            >
              <span style={S_OPTION_ICON}>{'\u2728'}</span>
              <div>
                <div style={S_OPTION_TITLE}>Mit KI generieren</div>
                <div style={S_OPTION_DESC}>Beschreibe dein Formular und die KI erstellt es</div>
              </div>
            </div>
          </>
        )}

        {/* ═══ Footer: Navigation ═══ */}
        <div style={S_FOOTER}>
          <button
            onClick={handleSkip}
            style={{ ...styles.btn('ghost'), fontSize: '13px' }}
          >
            Überspringen
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 0 && (
              <button onClick={handleBack} style={styles.btn('secondary')}>
                Zurück
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || saving}
              style={{
                ...styles.btn('primary'),
                opacity: canProceed && !saving ? 1 : 0.5,
              }}
            >
              {saving ? 'Speichern...' : step === 2
                ? (selectedSuggestions.length > 0 ? 'Vorlagen übernehmen' : 'Fertig')
                : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OnboardingWizard.displayName = 'OnboardingWizard';
