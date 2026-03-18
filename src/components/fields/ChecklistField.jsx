import React, { useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const ChecklistField = React.memo(({ field, value, onChange, error }) => {
  const data = value || {};
  const update = (itemId, key, val) => onChange({ ...data, [itemId]: { ...(data[itemId] || {}), [key]: val } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {(field.items || []).map(item => {
        const itemData = data[item.id] || {};
        return (
          <div key={item.id} style={{ padding: '12px 14px', borderRadius: S.radius.md, border: `1.5px solid ${itemData.checked ? S.colors.success + '60' : error ? S.colors.danger : S.colors.border}`, background: itemData.checked ? `${S.colors.success}08` : S.colors.bgInput, transition: S.transition }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, borderRadius: '6px', border: `2px solid ${itemData.checked ? S.colors.success : S.colors.textMuted}`, background: itemData.checked ? S.colors.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: S.transition, flexShrink: 0 }} onClick={() => update(item.id, 'checked', !itemData.checked)}>
                {itemData.checked && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
            </label>
            {field.allowNotes && itemData.checked && (
              <input type="text" placeholder="Notiz hinzufügen..." value={itemData.note || ''} onChange={e => update(item.id, 'note', e.target.value)}
                style={{ ...styles.input(false), marginTop: '8px', minHeight: '40px', fontSize: '13px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
});
ChecklistField.displayName = 'ChecklistField';
