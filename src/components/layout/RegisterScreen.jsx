// ═══ FEATURE: Registration Screen (S05 — Supabase Auth) ═══
import { useState } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { createOrganization, createProfile, clearProfileCache } from '../../lib/supabaseService';

// ═══ Extracted Styles (P4) ═══
const S_WRAPPER = { alignItems: 'center', justifyContent: 'center', padding: '20px' };
const S_CARD = { maxWidth: '440px', width: '100%', textAlign: 'center' };
const S_TITLE = { fontSize: '28px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' };
const S_SUBTITLE = { color: 'var(--fp-text-secondary)', marginBottom: '24px', fontSize: '14px' };
const S_STEP_LABEL = { fontSize: '12px', fontWeight: 600, color: S.colors.primary, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const S_FIELD = { marginBottom: '12px', textAlign: 'left' };
const S_LABEL = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--fp-text-secondary)' };

export const RegisterScreen = ({ onRegistered, onBack }) => {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) return null;

  const handleStep1 = () => {
    if (!orgName.trim()) { setError('Bitte Firmennamen eingeben'); return; }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!name.trim()) { setError('Bitte Namen eingeben'); return; }
    if (!email.trim()) { setError('Bitte E-Mail eingeben'); return; }
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben'); return; }
    if (password !== passwordConfirm) { setError('Passwoerter stimmen nicht ueberein'); return; }

    setLoading(true);
    setError('');
    try {
      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Registrierung fehlgeschlagen');

      // 2. Create Organization
      const org = await createOrganization(orgName.trim());

      // 3. Create Profile
      clearProfileCache();
      const profile = await createProfile(
        authData.user.id,
        org.id,
        name.trim(),
        email.trim(),
        'admin'
      );

      // 4. Callback with user data
      onRegistered({
        id: authData.user.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        organizationId: org.id,
        profile,
      });
    } catch (e) {
      console.error('Registration error:', e);
      setError(e.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.app, ...S_WRAPPER }}>
      <div style={{ ...styles.card, ...S_CARD }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📋</div>
        <h1 style={S_TITLE}>FormPilot</h1>
        <p style={S_SUBTITLE}>Neues Konto erstellen</p>

        {step === 1 && (
          <>
            <div style={S_STEP_LABEL}>Schritt 1 von 2 — Firma</div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Firmenname</label>
              <input
                value={orgName}
                onChange={e => { setOrgName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleStep1()}
                placeholder="z.B. GF Elite PV GmbH"
                style={{ ...styles.input(!!error), fontSize: '15px' }}
                autoFocus
              />
            </div>
            {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
            <button onClick={handleStep1} style={{ ...styles.btn('primary', 'lg'), width: '100%' }}>
              Weiter
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S_STEP_LABEL}>Schritt 2 von 2 — Admin-Account</div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Ihr Name</label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Max Mustermann"
                style={{ ...styles.input(false), fontSize: '15px' }}
                autoFocus
              />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@firma.de"
                style={{ ...styles.input(false), fontSize: '15px' }}
              />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Mindestens 6 Zeichen"
                style={{ ...styles.input(false), fontSize: '15px' }}
              />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Passwort wiederholen</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => { setPasswordConfirm(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                placeholder="Passwort bestaetigen"
                style={{ ...styles.input(false), fontSize: '15px' }}
              />
            </div>
            {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ ...styles.btn('primary', 'lg'), width: '100%', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Registrierung...' : 'Konto erstellen'}
            </button>
            <button
              onClick={() => { setStep(1); setError(''); }}
              style={{ ...styles.btn('secondary'), width: '100%', marginTop: '8px' }}
            >
              Zurueck
            </button>
          </>
        )}

        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: S.colors.primary, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', marginTop: '16px', padding: '8px' }}
        >
          Bereits ein Konto? Anmelden
        </button>
      </div>
    </div>
  );
};
