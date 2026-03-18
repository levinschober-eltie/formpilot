import React from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { evaluateConditions, isConditionallyRequired, isConditionallyDisabled } from '../../lib/validation';
import {
  TextField, TextareaField, NumberField, DateField, TimeField,
  SelectField, RadioField, CheckboxField, ToggleField,
  ChecklistField, RatingField, HeadingField, DividerField, InfoField,
  SignatureField, PhotoField, BarcodeField, GpsField,
} from './index';

// P4: widthMap outside render
const widthMap = { full: '100%', half: 'calc(50% - 8px)', third: 'calc(33.33% - 11px)' };

// ═══ FEATURE: Repeater Field ═══
// P4: All style objects extracted outside render
const S_REPEATER = { display: 'flex', flexDirection: 'column', gap: '8px' };
const S_REPEATER_ROW = { padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput, position: 'relative' };
const S_REPEATER_ROW_HEADER = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' };
const S_REPEATER_ROW_NUM = { fontSize: '12px', fontWeight: 600, color: S.colors.textMuted };
const S_REPEATER_REMOVE = { background: 'none', border: 'none', cursor: 'pointer', color: S.colors.danger, fontSize: '14px' };
const S_REPEATER_FIELDS = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const S_REPEATER_INPUT = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const S_REPEATER_TOGGLE_LABEL = { display: 'flex', alignItems: 'center', gap: '6px', height: '36px', cursor: 'pointer' };
const S_REPEATER_TOGGLE_TEXT = { fontSize: '12px', color: S.colors.textSecondary };
const S_REPEATER_SUBFIELD = { flex: '1 1 200px', minWidth: 0 };
const S_REPEATER_SUBFIELD_LABEL = { fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, display: 'block', marginBottom: '3px' };
const S_REPEATER_ADD = { padding: '10px', borderRadius: S.radius.sm, border: `1.5px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' };

// eslint-disable-next-line no-unused-vars
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
    <div style={S_REPEATER}>
      {rows.map((row, ri) => (
        <div key={ri} style={S_REPEATER_ROW}>
          <div style={S_REPEATER_ROW_HEADER}>
            <span style={S_REPEATER_ROW_NUM}>#{ri + 1}</span>
            <button type="button" onClick={() => removeRow(ri)} style={S_REPEATER_REMOVE}>✕</button>
          </div>
          <div style={S_REPEATER_FIELDS}>
            {subFields.map(sf => {
              const sfType = sf.type || 'text';
              let input;
              if (sfType === 'select') {
                const opts = typeof sf.options === 'string' ? sf.options.split(',').map(o => o.trim()).filter(Boolean) : (Array.isArray(sf.options) ? sf.options : []);
                input = (
                  <select value={row[sf.id] || ''} onChange={e => updateRow(ri, sf.id, e.target.value)} style={S_REPEATER_INPUT}>
                    <option value="">— Wählen —</option>
                    {opts.map(o => {
                      const val = typeof o === 'object' ? o.value : o;
                      const lbl = typeof o === 'object' ? o.label : o;
                      return <option key={val} value={val}>{lbl}</option>;
                    })}
                  </select>
                );
              } else if (sfType === 'toggle') {
                input = (
                  <label style={S_REPEATER_TOGGLE_LABEL}>
                    <input type="checkbox" checked={!!row[sf.id]} onChange={e => updateRow(ri, sf.id, e.target.checked)} />
                    <span style={S_REPEATER_TOGGLE_TEXT}>{row[sf.id] ? 'Ja' : 'Nein'}</span>
                  </label>
                );
              } else {
                input = (
                  <input type={sfType === 'number' ? 'number' : sfType === 'date' ? 'date' : 'text'}
                    value={row[sf.id] || ''} onChange={e => updateRow(ri, sf.id, sfType === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    style={S_REPEATER_INPUT} placeholder={sf.placeholder || ''} />
                );
              }
              return (
                <div key={sf.id} style={S_REPEATER_SUBFIELD}>
                  <label style={S_REPEATER_SUBFIELD_LABEL}>{sf.label}</label>
                  {input}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {rows.length < maxRows && (
        <button type="button" onClick={addRow} style={S_REPEATER_ADD}>
          + Eintrag hinzufügen {rows.length > 0 && `(${rows.length}/${maxRows})`}
        </button>
      )}
    </div>
  );
};

// ═══ FEATURE: Form Field Renderer (Chat F.1 + Signature/Photo) ═══
export const FormField = React.memo(({ field, value, onChange, error, formData, customFieldTypes, readOnly }) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;

  // ═══ Custom Field Types Plugin System ═══
  if (customFieldTypes && customFieldTypes[field.type]) {
    const CustomComponent = customFieldTypes[field.type];
    const disabled = isConditionallyDisabled(field, formData);
    const condRequired = isConditionallyRequired(field, formData);
    return (
      <div style={{ width: widthMap[field.width] || '100%', minWidth: 0, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        {field.label && <label style={styles.fieldLabel}>{field.label}{(field.required || condRequired) && <span style={{ color: S.colors.danger, marginLeft: '4px' }} aria-hidden="true">*</span>}</label>}
        <CustomComponent
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          readOnly={readOnly || disabled}
          formData={formData}
        />
        {error && <div role="alert" style={styles.fieldError}>{error}</div>}
      </div>
    );
  }

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
      case 'radio': return <RadioField field={field} value={value} onChange={onChange} error={error} aria-describedby={errorId} />;
      case 'checkbox': return <CheckboxField field={field} value={value} onChange={onChange} error={error} aria-describedby={errorId} />;
      case 'toggle': return <ToggleField field={field} value={value} onChange={onChange} error={error} aria-describedby={errorId} />;
      case 'checklist': return <ChecklistField field={field} value={value} onChange={onChange} error={error} aria-describedby={errorId} />;
      case 'rating': return <RatingField field={field} value={value} onChange={onChange} error={error} aria-describedby={errorId} />;
      case 'signature': return <SignatureField field={field} value={value} onChange={onChange} error={error} />;
      case 'photo': return <PhotoField field={field} value={value} onChange={onChange} error={error} />;
      case 'repeater': return <RepeaterField field={field} value={value} onChange={onChange} formData={formData} />;
      case 'barcode': return <BarcodeField field={field} value={value} onChange={onChange} error={error} />;
      case 'gps': return <GpsField field={field} value={value} onChange={onChange} error={error} />;
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
