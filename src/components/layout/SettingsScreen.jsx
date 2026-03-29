import { useState, useCallback, useMemo, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsCompanyBranding } from './SettingsCompanyBranding';
import { SettingsBackup } from './SettingsBackup';
import { SettingsAI } from './SettingsAI';
import { SettingsInfo } from './SettingsInfo';
import { TeamManagement } from './TeamManagement';
import { SettingsBilling } from './SettingsBilling';
import { SettingsAPIKeys } from './SettingsAPIKeys';
import { SettingsWebhooks } from './SettingsWebhooks';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '22px', fontWeight: 700, marginBottom: '20px' };
const S_USER_CARD = { ...styles.card };
const S_USER_ROW = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' };
const S_AVATAR = { width: 52, height: 52, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' };
const S_USER_NAME = { fontWeight: 600, fontSize: '16px' };
const S_USER_EMAIL = { fontSize: '13px', color: S.colors.textSecondary };
const S_TAB_BAR = {
  display: 'flex', gap: '4px', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
  marginBottom: '4px', paddingBottom: '4px',
  scrollbarWidth: 'none', msOverflowStyle: 'none',
};
const S_TAB = (active) => ({
  padding: '8px 16px', borderRadius: S.radius.md,
  fontSize: '13px', fontWeight: active ? 600 : 500,
  color: active ? S.colors.primary : S.colors.textSecondary,
  background: active ? `${S.colors.primary}10` : 'transparent',
  border: active ? `1.5px solid ${S.colors.primary}25` : '1.5px solid transparent',
  cursor: 'pointer', transition: S.transition, whiteSpace: 'nowrap',
  fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
});

// ═══ Tab Config (P4) ═══
const TABS = [
  { id: 'allgemein', label: 'Allgemein', adminOnly: false },
  { id: 'branding', label: 'Branding', adminOnly: false },
  { id: 'ki', label: 'KI', adminOnly: false },
  { id: 'backup', label: 'Backup', adminOnly: false },
  { id: 'team', label: 'Team', adminOnly: true },
  { id: 'abonnement', label: 'Abonnement', adminOnly: true },
  { id: 'api', label: 'API-Schlüssel', adminOnly: true },
  { id: 'webhooks', label: 'Webhooks', adminOnly: true },
];

export const SettingsScreen = memo(function SettingsScreen({ darkMode, onToggleDarkMode }) {
  const { user, handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('allgemein');
  const isAdmin = user.role === 'admin';

  const visibleTabs = useMemo(() =>
    TABS.filter(t => !t.adminOnly || isAdmin),
    [isAdmin]
  );

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  return (
    <div>
      <h2 style={S_TITLE}>Einstellungen</h2>

      {/* ═══ User Card ═══ */}
      <div style={S_USER_CARD}>
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

      {/* ═══ Tab Navigation ═══ */}
      <div style={S_TAB_BAR}>
        {visibleTabs.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={S_TAB(activeTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab Content ═══ */}
      {activeTab === 'allgemein' && <SettingsInfo darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />}
      {activeTab === 'branding' && <SettingsCompanyBranding />}
      {activeTab === 'ki' && <SettingsAI />}
      {activeTab === 'backup' && <SettingsBackup />}
      {activeTab === 'team' && isAdmin && <TeamManagement />}
      {activeTab === 'abonnement' && isAdmin && <SettingsBilling />}
      {activeTab === 'api' && isAdmin && <SettingsAPIKeys />}
      {activeTab === 'webhooks' && isAdmin && <SettingsWebhooks />}
    </div>
  );
});
