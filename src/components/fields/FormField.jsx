import React from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { evaluateConditions, isConditionallyRequired, isConditionallyDisabled } from '../../lib/validation';
import {
  TextField, TextareaField, NumberField, DateField, TimeField,
  SelectField, RadioField, CheckboxField, ToggleField,
  ChecklistField, RatingField, HeadingField, DividerField, InfoField,
  SignatureField, PhotoField,
} from './index';

// P4: widthMap outside render
const widthMap = { full: '100%', half: 'calc(50% - 8px)', third: 'calc(33.33% - 11px)' };

// ═══ FEATURE: Form Field Renderer (Chat F.1 + Signature/Photo) ═══
export const FormField = React.memo(({ field, value, onChange, error, formData }) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  if (field.type === 'heading') return <div style={{ width: '100%', minWidth: 0 }}><HeadingField field={field} /></div>;
  if (field.type === 'divider') return <div style={{ width: '100%', minWidth: 0 }}><DividerField /></div>;
  if (field.type === 'info') return <div style={{ width: '100%', minWidth: 0 }}><InfoField field={field} /></div>;
  const disabled = isConditionallyDisabled(field, formData);
  const condRequired = isConditionallyRequired(field, formData);
  const fieldInputId = `field-${field.id}`;
  const errorId = error ? `error-${field.id}` : undefined;
  const renderInput = () => {
    switch (field.type) {
      case 'text': return <TextField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'textarea': return <TextareaField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'number': return <NumberField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'date': return <DateField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'time': return <TimeField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'select': return <SelectField field={field} value={value} onChange={onChange} error={error} id={fieldInputId} aria-describedby={errorId} />;
      case 'radio': return <RadioField field={field} value={value} onChange={onChange} error={error} />;
      case 'checkbox': return <CheckboxField field={field} value={value} onChange={onChange} error={error} />;
      case 'toggle': return <ToggleField field={field} value={value} onChange={onChange} error={error} />;
      case 'checklist': return <ChecklistField field={field} value={value} onChange={onChange} error={error} />;
      case 'rating': return <RatingField field={field} value={value} onChange={onChange} error={error} />;
      case 'signature': return <SignatureField field={field} value={value} onChange={onChange} error={error} />;
      case 'photo': return <PhotoField field={field} value={value} onChange={onChange} error={error} />;
      case 'repeater': return <RepeaterField field={field} value={value} onChange={onChange} formData={formData} />;
      default: return <InfoField field={{ content: `Unbekannter Feldtyp: ${field.type}` }} />;
    }
  };
  return (
    <div style={{ width: widthMap[field.width] || '100%', minWidth: 0, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }} role={disabled ? 'group' : undefined} aria-disabled={disabled || undefined}>
      {field.label && <label htmlFor={fieldInputId} style={styles.fieldLabel}>{field.label}{(field.required || condRequired) && <span style={{ color: S.colors.danger, marginLeft: '4px' }} aria-hidden="true">*</span>}{(field.required || condRequired) && <span className="sr-only"> (Pflichtfeld)</span>}</label>}
      {renderInput()}
      {error && <div id={errorId} role="alert" style={styles.fieldError}>{error}</div>}
    </div>
  );
});

FormField.displayName = 'FormField';

// ═══ FEATURE: Repeater Field ═══
const RepeaterField = ({ field, value, onChange, formData }) => {
  const rows = Array.isArray(value) ? value : [];
  const subFields = field.subFields || [];
  const maxRows = field.validation?.maxRows || 20;

  const addRow = () => {
    if (rows.length >= maxRows) return;
    const emptyRow = {};
    subFields.forEach(sf => { emptyRow[sf.id] = ''; });
    onChange([...rows, emptyRow]);
  };

  const removeRow = (idx) => {
    onChange(rows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx, fieldId, val) => {
    const updated = rows.map((r, i) => i === idx ? { ...r, [fieldId]: val } : r);
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: S.colors.textMuted }}>#{ri + 1}</span>
            <button type="button" onClick={() => removeRow(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.colors.danger, fontSize: '14px' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {subFields.map(sf => (
              <div key={sf.id} style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, display: 'block', marginBottom: '3px' }}>{sf.label}</label>
                <input value={row[sf.id] || ''} onChange={e => updateRow(ri, sf.id, e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  placeholder={sf.placeholder || ''} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {rows.length < maxRows && (
        <button type="button" onClick={addRow} style={{ padding: '10px', borderRadius: S.radius.sm, border: `1.5px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
          ＋ Eintrag hinzufügen {rows.length > 0 && `(${rows.length}/${maxRows})`}
        </button>
      )}
    </div>
  );
};
