import { useState, useEffect } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { MiniToggle } from '../common/MiniToggle';

// ═══ Extracted Styles (P4) ═══
const S_QUOTA_BAR = { height: '8px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden', marginTop: '8px' };
const S_QUOTA_FILL = (pct) => ({
  height: '100%', width: `${pct}%`, borderRadius: S.radius.full, transition: 'width 0.3s ease',
  background: pct > 80 ? S.colors.danger : pct > 60 ? S.colors.warning : S.colors.success,
});

const estimateStorageUsage = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('fp_')) {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
  }
  return total;
};

export const SettingsScreen = ({ user, onLogout, darkMode, onToggleDarkMode }) => {
  const [storageBytes, setStorageBytes] = useState(0);
  const maxBytes = 5 * 1024 * 1024; // 5MB localStorage limit

  useEffect(() => { setStorageBytes(estimateStorageUsage()); }, []);

  const storageMB = (storageBytes / (1024 * 1024)).toFixed(2);
  const storagePct = Math.min(100, (storageBytes / maxBytes) * 100);

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Einstellungen</h2>
      <div style={styles.card}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Benutzer</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>{user.name.split(' ').map(w => w[0]).join('')}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{user.email}</div>
            <span style={styles.badge(S.colors.primary)}>{user.role === 'admin' ? 'Administrator' : user.role === 'monteur' ? 'Monteur' : 'Büro'}</span>
          </div>
        </div>
        <button onClick={onLogout} style={{ ...styles.btn('danger'), width: '100%' }}>Abmelden</button>
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Darstellung</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Dark Mode</div>
            <div style={{ fontSize: '12px', color: S.colors.textSecondary }}>Dunkles Farbschema verwenden</div>
          </div>
          <MiniToggle value={darkMode} onChange={onToggleDarkMode} />
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Speicherverbrauch</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: S.colors.textSecondary }}>{storageMB} MB von 5 MB</span>
          <span style={{ color: storagePct > 80 ? S.colors.danger : S.colors.textMuted, fontWeight: 600 }}>{storagePct.toFixed(0)}%</span>
        </div>
        <div style={S_QUOTA_BAR}><div style={S_QUOTA_FILL(storagePct)} /></div>
        {storagePct > 80 && <p style={{ fontSize: '12px', color: S.colors.danger, marginTop: '8px' }}>Speicher fast voll! Alte Formulare löschen oder exportieren.</p>}
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Über FormPilot</h3>
        <p style={{ fontSize: '13px', color: S.colors.textSecondary, lineHeight: 1.6 }}>Version 5.0 (Feature Complete)<br />Formular-Generator für Handwerksbetriebe.</p>
      </div>
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Feature-Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontFamily: S.font.mono }}>
          <div><span style={{ color: S.colors.success }}>●</span> fp_core_engine: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_form_filler: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_form_builder: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_signature: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_photo: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_pdf_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_csv_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_dashboard: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_repeater: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_dark_mode: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_search_filter: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_crm: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_template_import_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_status_management: aktiv</div>
          <div><span style={{ color: S.colors.textMuted }}>○</span> fp_offline: geplant</div>
          <div><span style={{ color: S.colors.textMuted }}>○</span> fp_supabase: geplant</div>
        </div>
      </div>
    </div>
  );
};
