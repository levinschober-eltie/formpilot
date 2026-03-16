import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const SettingsScreen = ({ user, onLogout }) => (
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
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Über FormPilot</h3>
      <p style={{ fontSize: '13px', color: S.colors.textSecondary, lineHeight: 1.6 }}>Version 3.0 (Multi-File Architektur)<br />Formular-Generator für Handwerksbetriebe.</p>
    </div>
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Feature-Flags</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontFamily: S.font.mono }}>
        <div><span style={{ color: S.colors.success }}>●</span> fp_core_engine: true</div>
        <div><span style={{ color: S.colors.success }}>●</span> fp_form_filler: true</div>
        <div><span style={{ color: S.colors.success }}>●</span> fp_form_builder: true</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_signature: false (S02)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_photo: false (S02)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_pdf: false (S03)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_email: false (S03)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_offline: false (S04)</div>
        <div><span style={{ color: S.colors.textMuted }}>○</span> fp_supabase: false (Migration)</div>
      </div>
    </div>
  </div>
);
