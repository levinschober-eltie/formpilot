import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { MiniToggle } from '../common/MiniToggle';

export const SettingsScreen = ({ user, onLogout, darkMode, onToggleDarkMode }) => (
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
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Über FormPilot</h3>
      <p style={{ fontSize: '13px', color: S.colors.textSecondary, lineHeight: 1.6 }}>Version 4.0 (Full Feature Release)<br />Formular-Generator für Handwerksbetriebe.</p>
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
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_offline: geplant</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_supabase: geplant</div>
      </div>
    </div>
  </div>
);
