import { S } from '../../config/theme';

export const ChecklistItemsEditor = ({ items, onChange }) => {
  const add = () => onChange([...items, { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: `Prüfpunkt ${items.length + 1}` }]);
  const remove = (i) => { if (items.length <= 1) return; onChange(items.filter((_, j) => j !== i)); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: S.colors.textMuted, flexShrink: 0 }}>{i + 1}.</span>
          <input value={item.label} onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            style={{ flex: 1, padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />
          <button onClick={() => remove(i)} disabled={items.length <= 1} style={{ background: 'none', border: 'none', cursor: items.length <= 1 ? 'not-allowed' : 'pointer', fontSize: '13px', color: items.length <= 1 ? S.colors.border : S.colors.textMuted, padding: '4px', flexShrink: 0 }}>🗑</button>
        </div>
      ))}
      <button onClick={add} style={{ padding: '6px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>＋ Prüfpunkt hinzufügen</button>
    </div>
  );
};
