import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsCompanyBranding } from './SettingsCompanyBranding';
import { SettingsBackup } from './SettingsBackup';
import { SettingsAI } from './SettingsAI';
import { SettingsInfo } from './SettingsInfo';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '22px', fontWeight: 700, marginBottom: '20px' };
const S_USER_CARD = { ...styles.card };
const S_USER_ROW = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' };
const S_AVATAR = { width: 52, height: 52, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' };
const S_USER_NAME = { fontWeight: 600, fontSize: '16px' };
const S_USER_EMAIL = { fontSize: '13px', color: S.colors.textSecondary };
const S_SECTION_TITLE = { fontSize: '16px', fontWeight: 600, marginBottom: '16px' };

export const SettingsScreen = ({ darkMode, onToggleDarkMode }) => {
  const { user, handleLogout } = useAuth();

  return (
    <div>
      <h2 style={S_TITLE}>Einstellungen</h2>

      {/* ═══ User Card ═══ */}
      <div style={S_USER_CARD}>
        <h3 style={S_SECTION_TITLE}>Benutzer</h3>
        <div style={S_USER_ROW}>
          <div style={S_AVATAR}>{user.name.split(' ').map(w => w[0]).join('')}</div>
          <div>
            <div style={S_USER_NAME}>{user.name}</div>
            <div style={S_USER_EMAIL}>{user.email}</div>
            <span style={styles.badge(S.colors.primary)}>{user.role === 'admin' ? 'Administrator' : user.role === 'monteur' ? 'Monteur' : 'Büro'}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ ...styles.btn('danger'), width: '100%' }}>Abmelden</button>
      </div>

      {/* ═══ Sub-Sections ═══ */}
      <SettingsInfo darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
      <SettingsCompanyBranding />
      <SettingsAI />
      <SettingsBackup />
    </div>
  );
};
