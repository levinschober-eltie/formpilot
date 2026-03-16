import { S } from '../../config/theme';
import { FIELD_TYPE_ICONS } from '../../config/constants';

export const BuilderFieldCard = ({ field, isSelected, onSelect, onDelete, onWidthChange }) => {
  const summaryParts = [];
  if (field.type !== 'divider') summaryParts.push(field.type);
  if (field.required) summaryParts.push('Pflichtfeld');
  if (field.validation?.minLength) summaryParts.push(`min ${field.validation.minLength}`);
  if (field.options) summaryParts.push(`${field.options.length} Opt.`);
  if (field.items) summaryParts.push(`${field.items.length} Pkt.`);
  if (field.conditions?.length) summaryParts.push(`${field.conditions.length} Bed.`);
  const isDisplay = ['heading', 'divider', 'info'].includes(field.type);

  return (
    <div draggable
      onDragStart={(e) => { e.dataTransfer.setData('action', 'move'); e.dataTransfer.setData('fieldId', field.id); e.dataTransfer.effectAllowed = 'move'; }}
      onClick={() => onSelect(field.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: S.radius.md,
        border: `2px solid ${isSelected ? S.colors.primary : S.colors.border}`,
        background: isSelected ? `${S.colors.primary}06` : S.colors.white,
        cursor: 'pointer', transition: S.transition, fontFamily: 'inherit',
        width: field.width === 'half' ? 'calc(50% - 6px)' : field.width === 'third' ? 'calc(33.33% - 8px)' : '100%',
        minWidth: 0, flexShrink: 0,
      }}>
      <span style={{ cursor: 'grab', fontSize: '14px', color: S.colors.textMuted, flexShrink: 0, userSelect: 'none' }}>≡</span>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{FIELD_TYPE_ICONS[field.type] || '📋'}</span>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {field.label || (field.type === 'divider' ? 'Trennlinie' : 'Ohne Label')}
          {field.required && <span style={{ color: S.colors.danger, marginLeft: '4px' }}>*</span>}
        </div>
        <div style={{ fontSize: '11px', color: S.colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summaryParts.join(' · ')}</div>
      </div>
      {!isDisplay && (
        <select value={field.width || 'full'} onChange={(e) => { e.stopPropagation(); onWidthChange(field.id, e.target.value); }} onClick={e => e.stopPropagation()}
          style={{ padding: '2px 4px', borderRadius: '4px', border: `1px solid ${S.colors.border}`, fontSize: '10px', background: S.colors.bgInput, cursor: 'pointer', fontFamily: 'inherit', color: S.colors.textSecondary, flexShrink: 0 }}>
          <option value="full">Full</option><option value="half">Half</option><option value="third">Third</option>
        </select>
      )}
      <button onClick={(e) => { e.stopPropagation(); if (confirm('Feld löschen?')) onDelete(field.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '14px', color: S.colors.textMuted, transition: S.transition, flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = S.colors.danger} onMouseLeave={e => e.currentTarget.style.color = S.colors.textMuted}>🗑</button>
    </div>
  );
};
