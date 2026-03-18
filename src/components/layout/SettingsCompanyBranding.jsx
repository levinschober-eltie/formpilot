import { useState, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { LogoUpload } from '../common/LogoUpload';

// ═══ Extracted Styles (P4) ═══
const S_COMPANY_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_COMPANY_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_COMPANY_FIELD = { marginBottom: '12px' };
const S_PREVIEW_HEADER = {
  border: `1px solid ${S.colors.border}`, borderRadius: S.radius.md, padding: '16px',
  marginTop: '16px', background: S.colors.bgInput,
};

const loadCompanySettings = () => {
  try {
    const raw = localStorage.getItem('fp_company_settings');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveCompanySettings = (settings) => {
  localStorage.setItem('fp_company_settings', JSON.stringify(settings));
};

export const SettingsCompanyBranding = memo(function SettingsCompanyBranding() {
  const [company, setCompany] = useState(() => loadCompanySettings());
  const [companySaved, setCompanySaved] = useState(false);

  const updateCompanyField = useCallback((field, value) => {
    setCompany(prev => {
      const next = { ...prev, [field]: value };
      saveCompanySettings(next);
      return next;
    });
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2000);
  }, []);

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Firmeneinstellungen</h3>
      <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '16px' }}>
        Diese Daten erscheinen im PDF-Export als Kopfzeile. Logo wird auf max. 400x200px komprimiert.
      </p>
      {companySaved && <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.success, marginBottom: '10px' }}>Gespeichert</div>}
      <div style={S_COMPANY_FIELD}>
        <label style={S_COMPANY_LABEL}>Firmenlogo</label>
        <LogoUpload value={company.companyLogo || ''} onChange={(val) => updateCompanyField('companyLogo', val)} />
      </div>
      <div style={S_COMPANY_FIELD}>
        <label style={S_COMPANY_LABEL}>Firmenname</label>
        <input value={company.companyName || ''} onChange={e => updateCompanyField('companyName', e.target.value)} placeholder="z.B. GF Elite PV GmbH" style={S_COMPANY_INPUT} />
      </div>
      <div style={S_COMPANY_FIELD}>
        <label style={S_COMPANY_LABEL}>Adresse</label>
        <textarea value={company.companyAddress || ''} onChange={e => updateCompanyField('companyAddress', e.target.value)} placeholder="Musterstr. 1&#10;12345 Musterstadt" rows={3} style={{ ...S_COMPANY_INPUT, minHeight: '72px', resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ ...S_COMPANY_FIELD, flex: 1 }}>
          <label style={S_COMPANY_LABEL}>Telefon</label>
          <input value={company.companyPhone || ''} onChange={e => updateCompanyField('companyPhone', e.target.value)} placeholder="089/12345678" style={S_COMPANY_INPUT} />
        </div>
        <div style={{ ...S_COMPANY_FIELD, flex: 1 }}>
          <label style={S_COMPANY_LABEL}>E-Mail</label>
          <input value={company.companyEmail || ''} onChange={e => updateCompanyField('companyEmail', e.target.value)} placeholder="info@firma.de" style={S_COMPANY_INPUT} />
        </div>
      </div>
      <div style={S_COMPANY_FIELD}>
        <label style={S_COMPANY_LABEL}>Akzentfarbe (PDF)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="color" value={company.accentColor || '#2563eb'} onChange={e => updateCompanyField('accentColor', e.target.value)} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: S.radius.sm }} />
          <span style={{ fontSize: '13px', color: S.colors.textSecondary, fontFamily: S.font.mono }}>{company.accentColor || '#2563eb'}</span>
        </div>
      </div>
      {(company.companyName || company.companyLogo) && (
        <div style={S_PREVIEW_HEADER}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: S.colors.textMuted, marginBottom: '8px' }}>PDF-Kopfzeile Vorschau:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: `3px solid ${company.accentColor || '#2563eb'}` }}>
            {company.companyLogo && <img src={company.companyLogo} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' }} />}
            <div>
              {company.companyName && <div style={{ fontSize: '15px', fontWeight: 700, color: company.accentColor || '#2563eb' }}>{company.companyName}</div>}
              {company.companyAddress && company.companyAddress.split('\n').map((line, i) => <div key={i} style={{ fontSize: '11px', color: S.colors.textSecondary }}>{line}</div>)}
              {company.companyPhone && <div style={{ fontSize: '11px', color: S.colors.textSecondary }}>Tel: {company.companyPhone}</div>}
              {company.companyEmail && <div style={{ fontSize: '11px', color: S.colors.textSecondary }}>{company.companyEmail}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
