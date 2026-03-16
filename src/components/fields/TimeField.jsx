import { styles } from '../../styles/shared';

export const TimeField = ({ field, value, onChange, error }) => (
  <input type="time" style={styles.input(!!error)} value={value || ''} onChange={e => onChange(e.target.value)} />
);
