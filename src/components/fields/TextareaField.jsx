import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const TextareaField = ({ field, value, onChange, error, id, ...rest }) => (
  <textarea id={id} style={{ ...styles.input(!!error), minHeight: '100px', resize: 'vertical' }} value={value || ''}
    onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} rows={field.validation?.rows || 4}
    maxLength={field.validation?.maxLength} aria-describedby={rest['aria-describedby']}
    onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${S.colors.primary}18`; }}
    onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; e.target.style.boxShadow = 'none'; }} />
);
