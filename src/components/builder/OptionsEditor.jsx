import React from 'react';
import { S } from '../../config/theme';
import { slugify } from '../../lib/helpers';

// ═══ Extracted Styles (P4) ═══
const S_INPUT = { flex: 1, padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 };
const S_DEL = (enabled) => ({ background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'not-allowed', fontSize: '13px', color: enabled ? S.colors.textMuted : S.colors.border, padding: '4px', flexShrink: 0 });
const S_ADD = { padding: '6px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' };

export const OptionsEditor = React.memo(({ options, onChange, itemLabel }) => {
  const lbl = itemLabel || 'Option';
  const add = () => onChange([...options, { value: `option-${options.length + 1}`, label: `${lbl} ${options.length + 1}` }]);
  const remove = (i) => { if (options.length <= 2) return; onChange(options.filter((_, j) => j !== i)); };
  const update = (i, key, val) => { const n = [...options]; n[i] = { ...n[i], [key]: val }; if (key === 'label') n[i].value = slugify(val) || `option-${i + 1}`; onChange(n); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input value={opt.label} onChange={e => update(i, 'label', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={`${lbl} ${i + 1}`} style={S_INPUT} />
          <button onClick={() => remove(i)} disabled={options.length <= 2} style={S_DEL(options.length > 2)}>🗑</button>
        </div>
      ))}
      <button onClick={add} style={S_ADD}>＋ {lbl} hinzufügen</button>
    </div>
  );
});

OptionsEditor.displayName = 'OptionsEditor';
