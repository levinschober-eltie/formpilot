import React, { useState, useCallback, useRef } from 'react';
import { S } from '../../config/theme';
import { BuilderFieldCard } from './BuilderFieldCard';
import { dialog } from '../../lib/dialogService';

// ═══ Extracted Styles (P4) ═══
const S_CONTAINER = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 };
const S_TABS = { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' };
const S_PAGE_INPUT = (colors) => ({ padding: '6px 12px', borderRadius: S.radius.sm, border: `2px solid ${colors.primary}`, fontSize: '13px', fontFamily: 'inherit', width: '120px', outline: 'none' });
const S_PAGE_BTN = (active) => ({ padding: '6px 14px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: active ? 700 : 500, border: `1.5px solid ${active ? S.colors.primary : S.colors.border}`, background: active ? `${S.colors.primary}10` : 'transparent', color: active ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit', transition: S.transition });
const S_ADD_PAGE = { padding: '6px 12px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: 600, border: `1.5px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontFamily: 'inherit' };
const S_EMPTY = { textAlign: 'center' };
const S_EMPTY_ICON = { fontSize: '40px', marginBottom: '12px', opacity: 0.4 };
const S_EMPTY_TEXT = { color: S.colors.textMuted, fontSize: '14px' };
const S_FIELDS_WRAP = { display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' };
const S_DROP_LINE = { width: '100%', height: '3px', background: S.colors.primary, borderRadius: '2px', margin: '2px 0' };
const FIELD_WIDTH = { half: 'calc(50% - 6px)', third: 'calc(33.33% - 8px)', full: '100%' };

export const BuilderCanvas = React.memo(({ pages, activePageIndex, onPageChange, onAddPage, onDeletePage, onRenamePage, fields, selectedFieldId, onSelectField, onDeleteField, onDuplicateField, onAddFieldAtIndex, onMoveField, onFieldWidthChange }) => {
  const [dropIndex, setDropIndex] = useState(-1);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editPageName, setEditPageName] = useState('');
  const containerRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const container = e.currentTarget;
    const cards = container.querySelectorAll('[data-fc]');
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

  const handleDragLeave = useCallback(() => setDropIndex(-1), []);
  const commitPageEdit = useCallback(() => { if (editingPageId && editPageName.trim()) onRenamePage(editingPageId, editPageName.trim()); setEditingPageId(null); }, [editingPageId, editPageName, onRenamePage]);

  const emptyStyle = fields.length === 0
    ? { flex: 1, minHeight: '200px', borderRadius: S.radius.lg, border: `2px dashed ${S.colors.border}`, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
    : { flex: 1, minHeight: '200px', borderRadius: S.radius.lg, padding: '0', display: 'flex', flexDirection: 'column' };

  return (
    <div style={S_CONTAINER}>
      <div style={S_TABS}>
        {pages.map((p, i) => (
          <div key={p.id}>
            {editingPageId === p.id ? (
              <input autoFocus value={editPageName} onChange={e => setEditPageName(e.target.value)} onBlur={commitPageEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitPageEdit(); if (e.key === 'Escape') setEditingPageId(null); }}
                style={S_PAGE_INPUT(S.colors)} />
            ) : (
              <button onClick={() => onPageChange(i)} onDoubleClick={() => { setEditingPageId(p.id); setEditPageName(p.title); }}
                onContextMenu={async e => { e.preventDefault(); if (pages.length > 1 && await dialog.confirm({ title: 'Seite löschen?', message: `"${p.title}" wirklich löschen?`, confirmLabel: 'Löschen' })) onDeletePage(i); }}
                style={S_PAGE_BTN(i === activePageIndex)}>{p.title}</button>
            )}
          </div>
        ))}
        <button onClick={onAddPage} style={S_ADD_PAGE}>＋</button>
      </div>
      <div ref={containerRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} style={emptyStyle}>
        {fields.length === 0 ? (
          <div style={S_EMPTY}>
            <div style={S_EMPTY_ICON}>📋</div>
            <p style={S_EMPTY_TEXT}>Felder aus der Palette hierher ziehen oder klicken</p>
          </div>
        ) : (
          <div style={S_FIELDS_WRAP}>
            {fields.map((field, i) => (
              <React.Fragment key={field.id}>
                {dropIndex === i && <div style={S_DROP_LINE} />}
                <div data-fc="1" style={{ width: FIELD_WIDTH[field.width] || '100%' }}>
                  <BuilderFieldCard field={field} isSelected={selectedFieldId === field.id} onSelect={onSelectField} onDelete={onDeleteField} onDuplicate={onDuplicateField} onWidthChange={onFieldWidthChange} />
                </div>
              </React.Fragment>
            ))}
            {dropIndex >= fields.length && <div style={S_DROP_LINE} />}
          </div>
        )}
      </div>
    </div>
  );
});

BuilderCanvas.displayName = 'BuilderCanvas';
