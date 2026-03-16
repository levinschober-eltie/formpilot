import { S } from '../../config/theme';

export const MiniToggle = ({ value, onChange, label }) => (
  <button onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: S.radius.sm, border: `1px solid ${value ? S.colors.primary : S.colors.border}`, background: value ? `${S.colors.primary}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', fontSize: '13px' }}>
    <div style={{ width: 36, height: 20, borderRadius: 10, background: value ? S.colors.primary : S.colors.textMuted, position: 'relative', transition: S.transition, flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 18 : 2, transition: S.transition }} />
    </div>
    <span>{label || (value ? 'Ja' : 'Nein')}</span>
  </button>
);
