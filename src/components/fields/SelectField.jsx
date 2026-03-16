import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

export const SelectField = ({ field, value, onChange, error }) => (
  <select style={{ ...styles.input(!!error), cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23475569\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
    value={value || ''} onChange={e => onChange(e.target.value)}>
    <option value="">— Bitte wählen —</option>
    {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
