import { useState, useEffect, useMemo } from 'react';
import { S, CATEGORY_COLORS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { CATEGORY_OPTIONS } from '../../config/constants';
import { getCachedTemplates } from '../../lib/offlineDb';
import { useAuth } from '../../contexts/AuthContext';
import { useTemplates } from '../../hooks/useTemplates';

// ═══ Extracted Styles (P4) ═══
const S_SEARCH = { flex: '1 1 200px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput, minWidth: '150px' };
const S_FILTER_SELECT = { padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', background: S.colors.bgInput, cursor: 'pointer' };
const S_OFFLINE_BADGE = { display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#22c55e18', color: '#16a34a', border: '1px solid #22c55e40' };
const S_EMPTY = { ...styles.card, textAlign: 'center', padding: '40px 24px' };
const S_EMPTY_ICON = { fontSize: '48px', marginBottom: '12px' };
const S_EMPTY_TITLE = { fontWeight: 600, fontSize: '16px', marginBottom: '8px' };
const S_EMPTY_DESC = { color: S.colors.textSecondary, fontSize: '14px' };

export const TemplateSelector = ({ onSelect }) => {
  const { user } = useAuth();
  const { activeTemplates } = useTemplates();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cachedIds, setCachedIds] = useState(new Set());

  // Only show templates visible for the current user's role
  const roleFiltered = useMemo(() =>
    activeTemplates.filter(t => {
      const roles = t.visibleForRoles || ['admin', 'monteur', 'buero'];
      return roles.includes(user?.role);
    }),
    [activeTemplates, user]
  );

  // Load cached template IDs to show offline badge
  useEffect(() => {
    getCachedTemplates()
      .then(cached => setCachedIds(new Set(cached.map(t => t.id))))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = roleFiltered;
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    return result;
  }, [roleFiltered, search, categoryFilter]);

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Formular ausfüllen</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>Aktives Formular wählen und ausfüllen</p>

      {roleFiltered.length === 0 ? (
        <div style={S_EMPTY}>
          <div style={S_EMPTY_ICON}>📋</div>
          <div style={S_EMPTY_TITLE}>Keine Formulare verfügbar</div>
          <div style={S_EMPTY_DESC}>
            {user?.role === 'admin' || user?.role === 'buero'
              ? 'Gehe zu "Formulare" um Vorlagen zu aktivieren.'
              : 'Ein Administrator muss zuerst Formulare für deine Rolle freischalten.'}
          </div>
        </div>
      ) : (<>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Formular suchen..." style={S_SEARCH} />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={S_FILTER_SELECT}>
            <option value="all">Alle Kategorien</option>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 && (
            <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
              <p style={{ color: S.colors.textMuted }}>Keine Formulare gefunden.</p>
            </div>
          )}
          {filtered.map(t => (
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
                  {cachedIds.has(t.id) && <span style={S_OFFLINE_BADGE}>Offline verfuegbar</span>}
                </div>
              </div>
              <span style={{ fontSize: '20px', color: S.colors.textMuted, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </>)}
    </div>
  );
};
