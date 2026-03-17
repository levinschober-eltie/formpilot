import { useState, useMemo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

// ═══ Constants ═══
const STATUS_LABELS = {
  planning: 'In Planung',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  archived: 'Archiviert',
};

const STATUS_COLORS = {
  planning: '#2563eb',
  active: '#16a34a',
  completed: '#64748b',
  archived: '#94a3b8',
};

const PAGE_SIZE = 20;

// ═══ Extracted Styles (P4) ═══
const S_SEARCH = { flex: '1 1 200px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput, minWidth: '150px' };
const S_STAT = { fontSize: '12px', color: S.colors.textSecondary, marginBottom: '16px' };
const S_CARD_ROW = { display: 'flex', alignItems: 'center', gap: '12px' };
const S_ICON = { width: 44, height: 44, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', flexShrink: 0 };
const S_NAME = { fontWeight: 600, fontSize: '15px' };
const S_META = { fontSize: '12px', color: S.colors.textMuted };
const S_EMPTY_ICON = { fontSize: '48px', marginBottom: '12px', opacity: 0.5 };

const S_STATUS_BADGE = (status) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: S.radius.full,
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
  background: `color-mix(in srgb, ${STATUS_COLORS[status] || STATUS_COLORS.planning} 9%, transparent)`,
  color: STATUS_COLORS[status] || STATUS_COLORS.planning,
});

// ═══ FEATURE: Projektliste ═══
export const ProjectsScreen = ({ projects, onSelectProject, onCreateProject }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const getPhaseProgress = (project) => {
    const phases = project.phases || [];
    const completed = phases.filter(p => p.status === 'completed').length;
    return { completed, total: phases.length };
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateProject(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  const createBtn = (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {showCreate ? (<>
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Projektname..." style={S_SEARCH} autoFocus />
        <button onClick={handleCreate} style={styles.btn('primary', 'sm')}>Erstellen</button>
        <button onClick={() => { setShowCreate(false); setNewName(''); }} style={styles.btn('ghost', 'sm')}>Abbrechen</button>
      </>) : (
        <button onClick={() => setShowCreate(true)} style={styles.btn('primary', 'sm')}>+ Neues Projekt</button>
      )}
    </div>
  );

  if (projects.length === 0) return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Projekte</h2>
      {createBtn}
      <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px' }}>
        <div style={S_EMPTY_ICON}>🏗️</div>
        <p style={{ color: S.colors.textSecondary, marginBottom: '8px' }}>Noch keine Projekte vorhanden.</p>
        <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>Erstellen Sie ein neues Projekt, um loszulegen.</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Projekte</h2>
      <p style={S_STAT}>{filtered.length} von {projects.length} Projekt{projects.length !== 1 ? 'en' : ''}</p>

      {createBtn}

      <div style={{ marginBottom: '16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Projekte suchen..." style={S_SEARCH} />
      </div>

      {(() => {
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        const currentPage = Math.min(page, Math.max(0, totalPages - 1));
        const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
        return (<>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paged.map(project => {
              const { completed, total } = getPhaseProgress(project);
              return (
                <div key={project.id} style={{ ...styles.card, padding: '16px 20px', cursor: 'pointer', transition: S.transition }}
                  onClick={() => onSelectProject(project)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = S.colors.shadowLg; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.colors.shadow; }}>
                  <div style={S_CARD_ROW}>
                    <div style={S_ICON}>🏗️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S_NAME}>{project.name}</div>
                      <div style={S_META}>
                        {total > 0 && <span>{completed}/{total} Phasen abgeschlossen · </span>}
                        {project.updatedAt && <span>{new Date(project.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>}
                      </div>
                    </div>
                    <span style={S_STATUS_BADGE(project.status)}>{STATUS_LABELS[project.status] || STATUS_LABELS.planning}</span>
                  </div>
                  {project.description && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${S.colors.borderFaint}`, fontSize: '12px', color: S.colors.textMuted }}>
                      {project.description}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && search && (
              <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
                <p style={{ color: S.colors.textMuted }}>Keine Projekte für "{search}" gefunden.</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }} role="navigation" aria-label="Seitennavigation">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} style={styles.btn('ghost', 'sm')} aria-label="Vorherige Seite">← Zurück</button>
              <span style={{ fontSize: '13px', color: S.colors.textSecondary }}>Seite {currentPage + 1} von {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} style={styles.btn('ghost', 'sm')} aria-label="Nächste Seite">Weiter →</button>
            </div>
          )}
        </>);
      })()}
    </div>
  );
};
