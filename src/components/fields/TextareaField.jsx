import React, { useState, useEffect } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useDebounce } from '../../hooks/useDebounce';

export const TextareaField = React.memo(({ field, value, onChange, error, id, ...rest }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    if (debouncedValue !== value) onChange(debouncedValue);
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  return (
    <textarea id={id} style={{ ...styles.input(!!error), minHeight: '100px', resize: 'vertical' }} value={localValue}
      onChange={e => setLocalValue(e.target.value)} placeholder={field.placeholder || ''} rows={field.validation?.rows || 4}
      maxLength={field.validation?.maxLength} aria-describedby={rest['aria-describedby']}
      onFocus={e => { e.target.style.borderColor = S.colors.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${S.colors.primary}18`; }}
      onBlur={e => { e.target.style.borderColor = error ? S.colors.danger : S.colors.border; e.target.style.boxShadow = 'none'; }} />
  );
});
TextareaField.displayName = 'TextareaField';
