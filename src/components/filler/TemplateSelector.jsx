import { S, CATEGORY_COLORS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';

export const TemplateSelector = ({ onSelect, customTemplates }) => {
  const allTemplates = [...DEMO_TEMPLATES, ...(customTemplates || [])];
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Formular ausfüllen</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>Vorlage wählen und neues Formular starten</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allTemplates.map(t => (
          <button key={t.id} onClick={() => onSelect(t)} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${S.colors.border}`, fontFamily: 'inherit', padding: '20px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = S.colors.shadowLg; e.currentTarget.style.borderColor = CATEGORY_COLORS[t.category] || S.colors.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.colors.shadow; e.currentTarget.style.borderColor = S.colors.border; }}>
            <div style={{ fontSize: '36px', flexShrink: 0 }}>{t.icon || '📋'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description}</div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={styles.badge(CATEGORY_COLORS[t.category] || S.colors.textSecondary)}>{t.category}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} {t.pages.length === 1 ? 'Seite' : 'Seiten'}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.reduce((a, p) => a + p.fields.filter(f => !['heading', 'divider', 'info'].includes(f.type)).length, 0)} Felder</span>
                {!t.isDemo && <span style={styles.badge(S.colors.primary)}>Eigenes</span>}
              </div>
            </div>
            <span style={{ fontSize: '20px', color: S.colors.textMuted, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
};
