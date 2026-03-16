import { useEffect } from 'react';
import { styles } from '../../styles/shared';

export const DateField = ({ field, value, onChange, error }) => {
  const defaultVal = (!value && field.validation?.defaultToday) ? new Date().toISOString().split('T')[0] : value;
  useEffect(() => { if (!value && field.validation?.defaultToday) onChange(new Date().toISOString().split('T')[0]); }, []);
  return <input type="date" style={styles.input(!!error)} value={defaultVal || ''} onChange={e => onChange(e.target.value)} />;
};
