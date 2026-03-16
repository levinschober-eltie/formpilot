import { S } from '../../config/theme';

export const RadioField = ({ field, value, onChange, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {(field.options || []).map(o => (
      <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${value === o.value ? S.colors.primary : error ? S.colors.danger : S.colors.border}`, background: value === o.value ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${value === o.value ? S.colors.primary : S.colors.textMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: S.transition, flexShrink: 0 }}>
          {value === o.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: S.colors.primary }} />}
        </div>
        <span style={{ fontSize: '15px' }}>{o.label}</span>
        <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} style={{ display: 'none' }} />
      </label>
    ))}
  </div>
);
