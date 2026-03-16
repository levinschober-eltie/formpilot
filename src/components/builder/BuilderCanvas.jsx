import React, { useState, useCallback } from 'react';
import { S } from '../../config/theme';
import { BuilderFieldCard } from './BuilderFieldCard';

export const BuilderCanvas = ({ pages, activePageIndex, onPageChange, onAddPage, onDeletePage, onRenamePage, fields, selectedFieldId, onSelectField, onDeleteField, onAddFieldAtIndex, onMoveField, onFieldWidthChange }) => {
  const [dropIndex, setDropIndex] = useState(-1);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editPageName, setEditPageName] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const container = e.currentTarget;
    const cards = Array.from(container.querySelectorAll('[data-fc]'));
    let idx = fields.length;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) { idx = i; break; }
    }
    setDropIndex(idx);
  }, [fields.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('action');
    if (action === 'add') onAddFieldAtIndex(e.dataTransfer.getData('fieldType'), dropIndex);
    else if (action === 'move') onMoveField(e.dataTransfer.getData('fieldId'), dropIndex);
    setDropIndex(-1);
  }, [dropIndex, onAddFieldAtIndex, onMoveField]);

  const commitPageEdit = () => { if (editingPageId && editPageName.trim()) onRenamePage(editingPageId, editPageName.trim()); setEditingPageId(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {pages.map((p, i) => (
          <div key={p.id}>
            {editingPageId === p.id ? (
              <input autoFocus value={editPageName} onChange={e => setEditPageName(e.target.value)} onBlur={commitPageEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitPageEdit(); if (e.key === 'Escape') setEditingPageId(null); }}
                style={{ padding: '6px 12px', borderRadius: S.radius.sm, border: `2px solid ${S.colors.primary}`, fontSize: '13px', fontFamily: 'inherit', width: '120px', outline: 'none' }} />
            ) : (
              <button onClick={() => onPageChange(i)} onDoubleClick={() => { setEditingPageId(p.id); setEditPageName(p.title); }}
                onContextMenu={e => { e.preventDefault(); if (pages.length > 1 && confirm(`Seite "${p.title}" löschen?`)) onDeletePage(i); }}
                style={{ padding: '6px 14px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: i === activePageIndex ? 700 : 500, border: `1.5px solid ${i === activePageIndex ? S.colors.primary : S.colors.border}`, background: i === activePageIndex ? `${S.colors.primary}10` : 'transparent', color: i === activePageIndex ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit', transition: S.transition }}>{p.title}</button>
            )}
          </div>
        ))}
        <button onClick={onAddPage} style={{ padding: '6px 12px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: 600, border: `1.5px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>＋</button>
      </div>
      <div onDragOver={handleDragOver} onDragLeave={() => setDropIndex(-1)} onDrop={handleDrop}
        style={{ flex: 1, minHeight: '200px', borderRadius: S.radius.lg, border: fields.length === 0 ? `2px dashed ${S.colors.border}` : 'none', padding: fields.length === 0 ? '48px 24px' : '0', display: 'flex', flexDirection: 'column', ...(fields.length === 0 && { alignItems: 'center', justifyContent: 'center' }) }}>
        {fields.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>📋</div>
            <p style={{ color: S.colors.textMuted, fontSize: '14px' }}>Felder aus der Palette hierher ziehen oder klicken</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' }}>
            {fields.map((field, i) => (
              <React.Fragment key={field.id}>
                {dropIndex === i && <div style={{ width: '100%', height: '3px', background: S.colors.primary, borderRadius: '2px', margin: '2px 0' }} />}
                <div data-fc="1" style={{ width: field.width === 'half' ? 'calc(50% - 6px)' : field.width === 'third' ? 'calc(33.33% - 8px)' : '100%' }}>
                  <BuilderFieldCard field={field} isSelected={selectedFieldId === field.id} onSelect={onSelectField} onDelete={onDeleteField} onWidthChange={onFieldWidthChange} />
                </div>
              </React.Fragment>
            ))}
            {dropIndex >= fields.length && <div style={{ width: '100%', height: '3px', background: S.colors.primary, borderRadius: '2px', margin: '2px 0' }} />}
          </div>
        )}
      </div>
    </div>
  );
};
