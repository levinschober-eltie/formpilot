import { S } from '../../config/theme';

export const ToggleField = ({ field, value, onChange, error }) => {
  const on = value === true;
  return (
    <button type="button" onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: S.radius.md, border: `1.5px solid ${on ? S.colors.primary : error ? S.colors.danger : S.colors.border}`, background: on ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition, fontFamily: 'inherit', width: '100%' }}>
      <div style={{ width: 48, height: 26, borderRadius: 13, background: on ? S.colors.primary : S.colors.textMuted, position: 'relative', transition: S.transition, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 25 : 3, transition: S.transition, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: '15px', fontWeight: 500, color: S.colors.text }}>{on ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein')}</span>
    </button>
  );
};
