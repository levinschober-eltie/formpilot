import { S, STATUS_COLORS, STATUS_LABELS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';

export const SubmissionsList = ({ submissions, user, allTemplates }) => {
  const templateMap = {};
  (allTemplates || DEMO_TEMPLATES).forEach(t => { templateMap[t.id] = t; });
  if (submissions.length === 0) return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Eingereichte Formulare</h2>
      <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
        <p style={{ color: S.colors.textSecondary }}>Noch keine Formulare eingereicht.</p>
      </div>
    </div>
  );
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Eingereichte Formulare</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>{submissions.length} Formular{submissions.length !== 1 ? 'e' : ''}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(sub => {
          const tpl = templateMap[sub.templateId];
          return (
            <div key={sub.id} style={{ ...styles.card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{tpl?.icon || '📋'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{tpl?.name || 'Formular'}</div>
                  <div style={{ fontSize: '12px', color: S.colors.textMuted }}>{new Date(sub.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}{sub.filledByName && ` · ${sub.filledByName}`}</div>
                </div>
                <span style={styles.badge(STATUS_COLORS[sub.status] || S.colors.textMuted)}>{STATUS_LABELS[sub.status] || sub.status}</span>
              </div>
              {sub.data && Object.keys(sub.data).length > 0 && (() => {
                const tplFields = tpl?.pages?.flatMap(p => p.fields) || [];
                const preview = tplFields.filter(f => ['text', 'select'].includes(f.type) && sub.data[f.id]).slice(0, 3);
                if (preview.length === 0) return null;
                return (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${S.colors.border}`, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {preview.map(f => <div key={f.id} style={{ fontSize: '12px' }}><span style={{ color: S.colors.textMuted }}>{f.label}: </span><span style={{ fontWeight: 500 }}>{String(sub.data[f.id]).slice(0, 40)}</span></div>)}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
