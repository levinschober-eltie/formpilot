import React, { useCallback } from 'react';
import { S } from '../../config/theme';
import { FIELD_TYPE_ICONS } from '../../config/constants';

// ═══ Extracted Styles (P4) ═══
const S_GRAB = { cursor: 'grab', fontSize: '14px', color: S.colors.textMuted, flexShrink: 0, userSelect: 'none' };
const S_ICON = { fontSize: '16px', flexShrink: 0 };
const S_CONTENT = { flex: 1, minWidth: 0, overflow: 'hidden' };
const S_LABEL = { fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const S_REQUIRED = { color: S.colors.danger, marginLeft: '4px' };
const S_SUMMARY = { fontSize: '11px', color: S.colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const S_WIDTH_SELECT = { padding: '2px 4px', borderRadius: '4px', border: `1px solid ${S.colors.border}`, fontSize: '10px', background: S.colors.bgInput, cursor: 'pointer', fontFamily: 'inherit', color: S.colors.textSecondary, flexShrink: 0 };
const S_DELETE = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '14px', color: S.colors.textMuted, transition: S.transition, flexShrink: 0 };

export const BuilderFieldCard = React.memo(({ field, isSelected, onSelect, onDelete, onWidthChange }) => {
  const summaryParts = [];
  if (field.type !== 'divider') summaryParts.push(field.type);
  if (field.required) summaryParts.push('Pflichtfeld');
  if (field.validation?.minLength) summaryParts.push(`min ${field.validation.minLength}`);
  if (field.options) summaryParts.push(`${field.options.length} Opt.`);
  if (field.items) summaryParts.push(`${field.items.length} Pkt.`);
  if (field.conditions?.length) summaryParts.push(`${field.conditions.length} Bed.`);
  const isDisplay = ['heading', 'divider', 'info'].includes(field.type);

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('action', 'move');
    e.dataTransfer.setData('fieldId', field.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [field.id]);

  const handleClick = useCallback(() => onSelect(field.id), [onSelect, field.id]);
  const handleDelete = useCallback((e) => { e.stopPropagation(); if (confirm('Feld löschen?')) onDelete(field.id); }, [onDelete, field.id]);
  const handleWidthChange = useCallback((e) => { e.stopPropagation(); onWidthChange(field.id, e.target.value); }, [onWidthChange, field.id]);
  const handleWidthClick = useCallback((e) => e.stopPropagation(), []);

  const cardStyle = {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: S.radius.md,
    border: `2px solid ${isSelected ? S.colors.primary : S.colors.border}`,
    background: isSelected ? `${S.colors.primary}06` : S.colors.white,
    cursor: 'pointer', transition: S.transition, fontFamily: 'inherit', width: '100%', minWidth: 0, flexShrink: 0,
  };

  return (
    <div draggable onDragStart={handleDragStart} onClick={handleClick} style={cardStyle}>
      <span style={S_GRAB}>≡</span>
      <span style={S_ICON}>{FIELD_TYPE_ICONS[field.type] || '📋'}</span>
      <div style={S_CONTENT}>
        <div style={S_LABEL}>
          {field.label || (field.type === 'divider' ? 'Trennlinie' : 'Ohne Label')}
          {field.required && <span style={S_REQUIRED}>*</span>}
        </div>
        <div style={S_SUMMARY}>{summaryParts.join(' · ')}</div>
      </div>
      {!isDisplay && (
        <select value={field.width || 'full'} onChange={handleWidthChange} onClick={handleWidthClick} style={S_WIDTH_SELECT}>
          <option value="full">Full</option><option value="half">Half</option><option value="third">Third</option>
        </select>
      )}
      <button onClick={handleDelete} style={S_DELETE}
        onMouseEnter={e => e.currentTarget.style.color = S.colors.danger}
        onMouseLeave={e => e.currentTarget.style.color = S.colors.textMuted}>🗑</button>
    </div>
  );
});

BuilderFieldCard.displayName = 'BuilderFieldCard';
