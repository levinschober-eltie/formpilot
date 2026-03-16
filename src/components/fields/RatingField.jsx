import { S } from '../../config/theme';

export const RatingField = ({ field, value, onChange }) => {
  const max = field.maxStars || 5;
  const current = value || 0;
  if (field.ratingType === 'traffic') {
    const colors = [{ value: 1, color: '#16a34a', label: 'Gut' }, { value: 2, color: '#f59e0b', label: 'Mittel' }, { value: 3, color: '#dc2626', label: 'Schlecht' }];
    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        {colors.map(c => (
          <button key={c.value} onClick={() => onChange(c.value)} style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${current === c.value ? c.color : S.colors.border}`, background: current === c.value ? c.color : `${c.color}18`, cursor: 'pointer', transition: S.transition, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: current === c.value ? '#fff' : c.color, fontFamily: 'inherit' }}>{c.label}</button>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button key={star} onClick={() => onChange(star)} style={{ fontSize: '32px', cursor: 'pointer', background: 'none', border: 'none', padding: '4px', transition: S.transition, transform: star <= current ? 'scale(1.1)' : 'scale(1)', filter: star <= current ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</button>
      ))}
      {current > 0 && <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '14px', fontWeight: 600, color: S.colors.textSecondary }}>{current}/{max}</span>}
    </div>
  );
};
