import { S } from '../../config/theme';

export const CheckboxField = ({ field, value, onChange }) => {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(field.options || []).map(o => (
        <label key={o.value} onClick={() => toggle(o.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${selected.includes(o.value) ? S.colors.primary : S.colors.border}`, background: selected.includes(o.value) ? `${S.colors.primary}08` : S.colors.bgInput, cursor: 'pointer', transition: S.transition }}>
          <div style={{ width: 20, height: 20, borderRadius: '6px', border: `2px solid ${selected.includes(o.value) ? S.colors.primary : S.colors.textMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected.includes(o.value) ? S.colors.primary : 'transparent', transition: S.transition, flexShrink: 0 }}>
            {selected.includes(o.value) && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: '15px' }}>{o.label}</span>
        </label>
      ))}
    </div>
  );
};
