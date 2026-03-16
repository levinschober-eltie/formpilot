import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { evaluateConditions } from '../../lib/validation';
import {
  TextField, TextareaField, NumberField, DateField, TimeField,
  SelectField, RadioField, CheckboxField, ToggleField,
  ChecklistField, RatingField, HeadingField, DividerField, InfoField,
} from './index';

// ═══ FEATURE: Form Field Renderer (Chat F.1) ═══
export const FormField = ({ field, value, onChange, error, formData }) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  if (field.type === 'heading') return <HeadingField field={field} />;
  if (field.type === 'divider') return <DividerField />;
  if (field.type === 'info') return <InfoField field={field} />;
  const widthMap = { full: '100%', half: 'calc(50% - 8px)', third: 'calc(33.33% - 11px)' };
  const renderInput = () => {
    switch (field.type) {
      case 'text': return <TextField field={field} value={value} onChange={onChange} error={error} />;
      case 'textarea': return <TextareaField field={field} value={value} onChange={onChange} error={error} />;
      case 'number': return <NumberField field={field} value={value} onChange={onChange} error={error} />;
      case 'date': return <DateField field={field} value={value} onChange={onChange} error={error} />;
      case 'time': return <TimeField field={field} value={value} onChange={onChange} error={error} />;
      case 'select': return <SelectField field={field} value={value} onChange={onChange} error={error} />;
      case 'radio': return <RadioField field={field} value={value} onChange={onChange} />;
      case 'checkbox': return <CheckboxField field={field} value={value} onChange={onChange} />;
      case 'toggle': return <ToggleField field={field} value={value} onChange={onChange} />;
      case 'checklist': return <ChecklistField field={field} value={value} onChange={onChange} />;
      case 'rating': return <RatingField field={field} value={value} onChange={onChange} />;
      default: return <InfoField field={{ content: `Unbekannter Feldtyp: ${field.type}` }} />;
    }
  };
  return (
    <div style={{ width: widthMap[field.width] || '100%', minWidth: 0 }}>
      {field.label && <label style={styles.fieldLabel}>{field.label}{field.required && <span style={{ color: S.colors.danger, marginLeft: '4px' }}>*</span>}</label>}
      {renderInput()}
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  );
};
