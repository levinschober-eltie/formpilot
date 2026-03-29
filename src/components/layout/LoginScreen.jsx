// ═══ FEATURE: Login Screen (S05 — Supabase Auth + Demo Fallback) ═══
import { useState } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { USERS } from '../../config/constants';
import { isApiConfigured } from '../../lib/api/client';
import { signInWithEmail, signInWithPin, getCachedProfile, clearProfileCache } from '../../lib/api';
import { RegisterScreen } from './RegisterScreen';

// ═══ Extracted Styles (P4) ═══
const S_WRAPPER = { alignItems: 'center', justifyContent: 'center', padding: '20px' };
const S_CARD = { maxWidth: '400px', width: '100%', textAlign: 'center' };
const S_ICON = { fontSize: '48px', marginBottom: '8px' };
const S_TITLE = { fontSize: '28px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' };
const S_SUBTITLE = { color: 'var(--fp-text-secondary)', marginBottom: '28px', fontSize: '14px' };
const S_USER_LIST = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' };
const S_PIN_WRAP = { marginBottom: '16px' };
const S_DEMO_HINT = { fontSize: '11px', color: 'var(--fp-text-muted)', marginTop: '16px' };
const S_FIELD = { marginBottom: '12px', textAlign: 'left' };
const S_LABEL = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--fp-text-secondary)' };
const S_TAB_ROW = { display: 'flex', gap: '0', marginBottom: '20px', borderRadius: S.radius.md, overflow: 'hidden', border: `1px solid ${S.colors.border}` };
const tabStyle = (active) => ({
  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  background: active ? S.colors.primary : 'transparent', color: active ? '#fff' : S.colors.textSecondary,
  transition: S.transition,
});

export const LoginScreen = ({ onLogin }) => {
  const supabaseMode = isApiConfigured();
  const [mode, setMode] = useState(supabaseMode ? 'email' : 'demo'); // 'email' | 'pin' | 'demo' | 'register'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ═══ Demo Login (no Supabase) ═══
  const handleDemoLogin = () => {
    if (!selectedUser) { setError('Bitte Benutzer waehlen'); return; }
    const user = USERS.find(u => u.id === selectedUser);
    if (user && user.pin === pin) { onLogin(user); } else { setError('Falsche PIN'); setPin(''); }
  };

  // ═══ Supabase Email Login ═══
  const handleEmailLogin = async () => {
    if (!email.trim()) { setError('Bitte E-Mail eingeben'); return; }
    if (!password) { setError('Bitte Passwort eingeben'); return; }
    setLoading(true);
    setError('');
    try {
      clearProfileCache();
      await signInWithEmail(email.trim(), password);
      const profile = await getCachedProfile();
      if (!profile) throw new Error('Profil nicht gefunden');
      onLogin({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        organizationId: profile.organization_id,
        profile,
      });
    } catch (e) {
      setError(e.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  // ═══ Register callback ═══
  const handleRegistered = (user) => {
    onLogin(user);
  };

  // ═══ Register Screen ═══
  if (mode === 'register') {
    return <RegisterScreen onRegistered={handleRegistered} onBack={() => setMode('email')} />;
  }

  return (
    <div style={{ ...styles.app, ...S_WRAPPER }}>
      <div style={{ ...styles.card, ...S_CARD }}>
        <div style={S_ICON}>📋</div>
        <h1 style={S_TITLE}>FormPilot</h1>
        <p style={S_SUBTITLE}>Digitale Formulare fuer Handwerksbetriebe</p>

        {/* Mode tabs (only when Supabase is configured) */}
        {supabaseMode && (
          <div style={S_TAB_ROW}>
            <button onClick={() => { setMode('email'); setError(''); }} style={tabStyle(mode === 'email')}>E-Mail</button>
            <button onClick={() => { setMode('pin'); setError(''); }} style={tabStyle(mode === 'pin')}>PIN</button>
            <button onClick={() => { setMode('demo'); setError(''); }} style={tabStyle(mode === 'demo')}>Demo</button>
          </div>
        )}

        {/* ═══ Email Login ═══ */}
        {mode === 'email' && supabaseMode && (
          <>
            <div style={S_FIELD}>
              <label style={S_LABEL}>E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                placeholder="admin@firma.de"
                style={{ ...styles.input(!!error), fontSize: '15px' }}
                autoFocus
              />
            </div>
            <div style={S_FIELD}>
              <label style={S_LABEL}>Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                placeholder="Passwort"
                style={{ ...styles.input(false), fontSize: '15px' }}
              />
            </div>
            {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
            <button
              onClick={handleEmailLogin}
              disabled={loading}
              style={{ ...styles.btn('primary', 'lg'), width: '100%', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Anmeldung...' : 'Anmelden'}
            </button>
            <button
              onClick={() => setMode('register')}
              style={{ background: 'none', border: 'none', color: S.colors.primary, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', marginTop: '16px', padding: '8px' }}
            >
              Noch kein Konto? Jetzt registrieren
            </button>
          </>
        )}

        {/* ═══ PIN Quick Login (Supabase) ═══ */}
        {mode === 'pin' && supabaseMode && (
          <>
            <p style={{ fontSize: '13px', color: S.colors.textSecondary, marginBottom: '16px' }}>
              Schnellanmeldung mit 4-stelliger PIN (fuer Monteure)
            </p>
            <div style={S_PIN_WRAP}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="PIN eingeben"
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && pin.length === 4) {
                    setLoading(true);
                    setError('');
                    try {
                      const profile = await signInWithPin(pin);
                      onLogin({
                        id: profile.id,
                        name: profile.name || 'Monteur',
                        email: profile.email,
                        role: 'monteur',
                        organizationId: profile.organization_id,
                        profile,
                      });
                    } catch (err) {
                      setError(err.message || 'Falsche PIN');
                      setPin('');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                style={{ ...styles.input(!!error), textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                autoFocus
              />
            </div>
            {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
            <button
              onClick={async () => {
                if (pin.length !== 4) { setError('PIN muss 4 Stellen haben'); return; }
                setLoading(true);
                setError('');
                try {
                  const profile = await signInWithPin(pin);
                  onLogin({
                    id: profile.id,
                    name: profile.name || 'Monteur',
                    email: profile.email,
                    role: 'monteur',
                    organizationId: profile.organization_id,
                    profile,
                  });
                } catch (err) {
                  setError(err.message || 'Falsche PIN');
                  setPin('');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              style={{ ...styles.btn('primary', 'lg'), width: '100%', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Anmeldung...' : 'Anmelden'}
            </button>
          </>
        )}

        {/* ═══ Demo Login (Fallback / no Supabase) ═══ */}
        {(mode === 'demo' || !supabaseMode) && (
          <>
            {supabaseMode && (
              <p style={{ fontSize: '13px', color: S.colors.textSecondary, marginBottom: '16px' }}>
                Demo-Modus (lokale Daten, kein Cloud-Sync)
              </p>
            )}
            <div style={S_USER_LIST}>
              {USERS.map(u => (
                <button key={u.id} onClick={() => { setSelectedUser(u.id); setError(''); }} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: S.radius.md, border: `2px solid ${selectedUser === u.id ? S.colors.primary : S.colors.border}`,
                  background: selectedUser === u.id ? `${S.colors.primary}08` : S.colors.bgInput,
                  cursor: 'pointer', fontFamily: 'inherit', transition: S.transition, textAlign: 'left',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: selectedUser === u.id ? S.colors.primary : S.colors.border,
                    color: selectedUser === u.id ? '#fff' : S.colors.textSecondary, fontWeight: 700, fontSize: '14px', flexShrink: 0,
                  }}>{u.name.split(' ').map(w => w[0]).join('')}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: S.colors.textMuted }}>{u.role === 'admin' ? 'Administrator' : u.role === 'monteur' ? 'Monteur' : 'Buero'}</div>
                  </div>
                </button>
              ))}
            </div>
            {selectedUser && (
              <div style={S_PIN_WRAP}>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN eingeben" value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleDemoLogin()}
                  style={{ ...styles.input(!!error), textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} autoFocus />
              </div>
            )}
            {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
            <button onClick={handleDemoLogin} style={{ ...styles.btn('primary', 'lg'), width: '100%' }}>Anmelden</button>
            <p style={S_DEMO_HINT}>Demo-PINs: Admin 1234 · Monteur 5678 · Buero 9999</p>
          </>
        )}
      </div>
    </div>
  );
};
