import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const TextField = ({ field, value, onChange, error, id, ...rest }) => (
  <input type="text" id={id} style={styles.input(!!error)} value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={field.placeholder || ''} maxLength={field.validation?.maxLength}
    aria-describedby={rest['aria-describedby']}
    onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${S.colors.primary}18`; }}
    onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; e.target.style.boxShadow = 'none'; }} />
);
