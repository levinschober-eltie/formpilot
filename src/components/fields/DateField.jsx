import { useEffect } from 'react';
import { styles } from '../../styles/shared';

export const DateField = ({ field, value, onChange, error, id, ...rest }) => {
  const defaultToday = field.validation?.defaultToday;
  useEffect(() => { if (!value && defaultToday) onChange(new Date().toISOString().split('T')[0]); }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only on mount
  const displayVal = (!value && defaultToday) ? new Date().toISOString().split('T')[0] : (value || '');
  return <input type="date" id={id} style={styles.input(!!error)} value={displayVal} onChange={e => onChange(e.target.value)} aria-describedby={rest['aria-describedby']} />;
};
