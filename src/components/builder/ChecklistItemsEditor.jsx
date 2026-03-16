import React from 'react';
import { S } from '../../config/theme';

// ═══ Extracted Styles (P4) ═══
const S_NUM = { fontSize: '12px', color: S.colors.textMuted, flexShrink: 0 };
const S_INPUT = { flex: 1, padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 };
const S_DEL = (enabled) => ({ background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'not-allowed', fontSize: '13px', color: enabled ? S.colors.textMuted : S.colors.border, padding: '4px', flexShrink: 0 });
const S_ADD = { padding: '6px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' };

export const ChecklistItemsEditor = React.memo(({ items, onChange }) => {
  const add = () => onChange([...items, { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: `Prüfpunkt ${items.length + 1}` }]);
  const remove = (i) => { if (items.length <= 1) return; onChange(items.filter((_, j) => j !== i)); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={S_NUM}>{i + 1}.</span>
          <input value={item.label} onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} style={S_INPUT} />
          <button onClick={() => remove(i)} disabled={items.length <= 1} style={S_DEL(items.length > 1)}>🗑</button>
        </div>
      ))}
      <button onClick={add} style={S_ADD}>＋ Prüfpunkt hinzufügen</button>
    </div>
  );
});

ChecklistItemsEditor.displayName = 'ChecklistItemsEditor';
