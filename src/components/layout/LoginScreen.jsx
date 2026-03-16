import { useState } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { USERS } from '../../config/constants';

export const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const handleLogin = () => {
    if (!selectedUser) { setError('Bitte Benutzer wählen'); return; }
    const user = USERS.find(u => u.id === selectedUser);
    if (user && user.pin === pin) { onLogin(user); } else { setError('Falsche PIN'); setPin(''); }
  };
  return (
    <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📋</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>FormPilot</h1>
        <p style={{ color: S.colors.textSecondary, marginBottom: '28px', fontSize: '14px' }}>Digitale Formulare für Handwerksbetriebe</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {USERS.map(u => (
            <button key={u.id} onClick={() => { setSelectedUser(u.id); setError(''); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: S.radius.md, border: `2px solid ${selectedUser === u.id ? S.colors.primary : S.colors.border}`, background: selectedUser === u.id ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', fontFamily: 'inherit', transition: S.transition, textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedUser === u.id ? S.colors.primary : S.colors.border, color: selectedUser === u.id ? '#fff' : S.colors.textSecondary, fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{u.name.split(' ').map(w => w[0]).join('')}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: S.colors.textMuted }}>{u.role === 'admin' ? 'Administrator' : u.role === 'monteur' ? 'Monteur' : 'Büro'}</div>
              </div>
            </button>
          ))}
        </div>
        {selectedUser && (
          <div style={{ marginBottom: '16px' }}>
            <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN eingeben" value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ ...styles.input(!!error), textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} autoFocus />
          </div>
        )}
        {error && <div style={{ ...styles.fieldError, marginBottom: '12px' }}>{error}</div>}
        <button onClick={handleLogin} style={{ ...styles.btn('primary', 'lg'), width: '100%' }}>Anmelden</button>
        <p style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '16px' }}>Demo-PINs: Admin 1234 · Monteur 5678 · Büro 9999</p>
      </div>
    </div>
  );
};
