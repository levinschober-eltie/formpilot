import { styles } from '../../styles/shared';

// eslint-disable-next-line no-unused-vars
export const TimeField = ({ field, value, onChange, error, id, ...rest }) => (
  <input type="time" id={id} style={styles.input(!!error)} value={value || ''} onChange={e => onChange(e.target.value)} aria-describedby={rest['aria-describedby']} />
);
