import React, { useState, useCallback } from 'react';
import { S } from '../../config/theme';
import { FIELD_PALETTE } from '../../config/constants';

// ═══ Extracted Styles (P4) ═══
const S_GROUP_BTN = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: S.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'inherit' };
const S_ITEMS_WRAP = { display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' };
const S_ITEM = (disabled) => ({
  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: S.radius.sm,
  border: `1px solid ${S.colors.border}`, background: disabled ? S.colors.bg : S.colors.white,
  cursor: disabled ? 'not-allowed' : 'grab', transition: S.transition, opacity: disabled ? 0.5 : 1,
  fontSize: '13px', fontFamily: 'inherit',
});
const S_ITEM_ICON = { fontSize: '16px', flexShrink: 0 };
const S_ITEM_CONTENT = { flex: 1, minWidth: 0 };
const S_ITEM_LABEL = { fontWeight: 600, fontSize: '13px', lineHeight: 1.2 };
const S_ITEM_DESC = { fontSize: '11px', color: S.colors.textMuted, lineHeight: 1.2 };
const S_LOCK = { fontSize: '10px', color: S.colors.textMuted };

export const BuilderPalette = React.memo(({ onAddField }) => {
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FIELD_PALETTE.map(g => [g.group, true])));
  const toggleGroup = useCallback((group) => setOpenGroups(p => ({ ...p, [group]: !p[group] })), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {FIELD_PALETTE.map(group => (
        <div key={group.group}>
          <button onClick={() => toggleGroup(group.group)} style={S_GROUP_BTN}>
            {group.group}
            <span style={{ transform: openGroups[group.group] ? 'rotate(180deg)' : 'rotate(0)', transition: S.transition, fontSize: '10px' }}>▼</span>
          </button>
          {openGroups[group.group] && (
            <div style={S_ITEMS_WRAP}>
              {group.items.map(item => (
                <div key={item.type} draggable={!item.disabled}
                  onDragStart={item.disabled ? undefined : (e) => { e.dataTransfer.setData('action', 'add'); e.dataTransfer.setData('fieldType', item.type); e.dataTransfer.effectAllowed = 'copy'; }}
                  onClick={item.disabled ? undefined : () => onAddField(item.type)}
                  style={S_ITEM(item.disabled)}
                  onMouseEnter={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.primary; e.currentTarget.style.background = `${S.colors.primary}06`; }}
                  onMouseLeave={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.border; e.currentTarget.style.background = S.colors.white; }}
                  title={item.disabled ? item.desc : `${item.label} – ${item.desc}`}>
                  <span style={S_ITEM_ICON}>{item.icon}</span>
                  <div style={S_ITEM_CONTENT}>
                    <div style={S_ITEM_LABEL}>{item.label}</div>
                    <div style={S_ITEM_DESC}>{item.desc}</div>
                  </div>
                  {item.disabled && <span style={S_LOCK}>🔒</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

BuilderPalette.displayName = 'BuilderPalette';
