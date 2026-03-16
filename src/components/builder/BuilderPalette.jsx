import { useState } from 'react';
import { S } from '../../config/theme';
import { FIELD_PALETTE } from '../../config/constants';

export const BuilderPalette = ({ onAddField }) => {
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FIELD_PALETTE.map(g => [g.group, true])));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {FIELD_PALETTE.map(group => (
        <div key={group.group}>
          <button onClick={() => setOpenGroups(p => ({ ...p, [group.group]: !p[group.group] }))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: S.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'inherit' }}>
            {group.group}
            <span style={{ transform: openGroups[group.group] ? 'rotate(180deg)' : 'rotate(0)', transition: S.transition, fontSize: '10px' }}>▼</span>
          </button>
          {openGroups[group.group] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' }}>
              {group.items.map(item => (
                <div key={item.type} draggable={!item.disabled}
                  onDragStart={item.disabled ? undefined : (e) => { e.dataTransfer.setData('action', 'add'); e.dataTransfer.setData('fieldType', item.type); e.dataTransfer.effectAllowed = 'copy'; }}
                  onClick={item.disabled ? undefined : () => onAddField(item.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: item.disabled ? S.colors.bg : S.colors.white, cursor: item.disabled ? 'not-allowed' : 'grab', transition: S.transition, opacity: item.disabled ? 0.5 : 1, fontSize: '13px', fontFamily: 'inherit' }}
                  onMouseEnter={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.primary; e.currentTarget.style.background = `${S.colors.primary}06`; }}
                  onMouseLeave={item.disabled ? undefined : e => { e.currentTarget.style.borderColor = S.colors.border; e.currentTarget.style.background = S.colors.white; }}
                  title={item.disabled ? item.desc : `${item.label} – ${item.desc}`}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: S.colors.textMuted, lineHeight: 1.2 }}>{item.desc}</div>
                  </div>
                  {item.disabled && <span style={{ fontSize: '10px', color: S.colors.textMuted }}>🔒</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
