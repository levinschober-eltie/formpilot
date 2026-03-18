import React from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const NumberField = React.memo(({ field, value, onChange, error, id, ...rest }) => (
  <div style={{ position: 'relative' }}>
    <input type="number" id={id} style={styles.input(!!error)} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      min={field.validation?.min} max={field.validation?.max} step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : 1}
      aria-describedby={rest['aria-describedby']}
      onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; }} onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; }} />
    {field.validation?.unit && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: S.colors.textMuted, fontSize: '14px' }}>{field.validation.unit}</span>}
  </div>
));
NumberField.displayName = 'NumberField';
