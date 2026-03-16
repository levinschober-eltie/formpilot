import { S, CATEGORY_COLORS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';
import { createEmptyTemplate } from '../../lib/helpers';

export const TemplatesOverview = ({ user, onOpenBuilder, customTemplates, onDeleteTemplate }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Vorlagen</h2>
        {user.role === 'admin' && <button onClick={() => onOpenBuilder(createEmptyTemplate())} style={styles.btn('primary')}>＋ Neues Formular</button>}
      </div>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>{user.role === 'admin' ? 'Formularvorlagen verwalten und erstellen' : 'Verfügbare Vorlagen'}</p>

      {(customTemplates || []).length > 0 && <>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eigene Vorlagen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {customTemplates.map(t => (
            <div key={t.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{t.icon || '📋'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name || 'Ohne Name'}</div>
                <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description || 'Keine Beschreibung'}</div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>v{t.version || 1}</span>
                  <span style={styles.badge(S.colors.textSecondary)}>{t.pages?.length || 0} Seiten</span>
                </div>
              </div>
              {user.role === 'admin' && <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => onOpenBuilder(t)} style={styles.btn('secondary', 'sm')}>✎ Bearbeiten</button>
                <button onClick={() => { if (confirm(`"${t.name}" löschen?`)) onDeleteTemplate(t.id); }} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>🗑</button>
              </div>}
            </div>
          ))}
        </div>
      </>}

      <h3 style={{ fontSize: '14px', fontWeight: 700, color: S.colors.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo-Vorlagen</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DEMO_TEMPLATES.map(t => (
          <div key={t.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{t.description}</div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                <span style={styles.badge(CATEGORY_COLORS[t.category] || CATEGORY_COLORS.custom)}>{t.category}</span>
                <span style={styles.badge(S.colors.textSecondary)}>{t.pages.length} Seiten</span>
              </div>
            </div>
            {user.role === 'admin' && <button onClick={() => {
              const copy = JSON.parse(JSON.stringify(t));
              copy.id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
              copy.name = `${t.name} (Kopie)`;
              copy.isDemo = false; copy.version = 1;
              onOpenBuilder(copy);
            }} style={styles.btn('secondary', 'sm')}>📋 Kopieren</button>}
          </div>
        ))}
      </div>
    </div>
  );
};
