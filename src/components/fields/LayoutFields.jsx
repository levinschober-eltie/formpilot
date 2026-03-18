import React from 'react';
import { S } from '../../config/theme';

export const HeadingField = React.memo(({ field }) => {
  const Tag = field.level === 'h3' ? 'h3' : field.level === 'h4' ? 'h4' : 'h2';
  const sizes = { h2: '20px', h3: '17px', h4: '15px' };
  return <Tag style={{ fontSize: sizes[Tag], fontWeight: 700, margin: '8px 0 4px', color: S.colors.text }}>{field.label}</Tag>;
});
HeadingField.displayName = 'HeadingField';

export const DividerField = React.memo(() => <hr style={{ border: 'none', borderTop: `1px solid ${S.colors.border}`, margin: '12px 0' }} />);
DividerField.displayName = 'DividerField';

export const InfoField = React.memo(({ field }) => (
  <div style={{ padding: '12px 16px', borderRadius: S.radius.md, background: `${S.colors.primary}08`, border: `1px solid ${S.colors.primary}20`, fontSize: '14px', color: S.colors.textSecondary, lineHeight: 1.5 }}>
    ℹ️ {field.content || field.label}
  </div>
));
InfoField.displayName = 'InfoField';
