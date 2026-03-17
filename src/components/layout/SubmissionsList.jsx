import { useState, useMemo } from 'react';
import { S, STATUS_COLORS, STATUS_LABELS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { DEMO_TEMPLATES } from '../../config/templates';
import { exportSubmissionsCsv } from '../../lib/exportCsv';
import { exportSubmissionPdf } from '../../lib/exportPdf';

// ═══ FEATURE: Submissions List (Enhanced with Search, Filter, Export) ═══
const S_TOOLBAR = { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' };
const S_SEARCH = { flex: '1 1 200px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput, minWidth: '150px' };
const S_FILTER_SELECT = { padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', background: S.colors.bgInput, cursor: 'pointer' };

const PAGE_SIZE = 20;

export const SubmissionsList = ({ submissions, user, allTemplates, onViewSubmission, onDeleteSubmission }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [page, setPage] = useState(0);

  const templateMap = useMemo(() => {
    const map = {};
    (allTemplates || DEMO_TEMPLATES).forEach(t => { map[t.id] = t; });
    return map;
  }, [allTemplates]);

  const filtered = useMemo(() => {
    let result = [...submissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    if (templateFilter !== 'all') result = result.filter(s => s.templateId === templateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => {
        const tpl = templateMap[s.templateId];
        if (tpl?.name?.toLowerCase().includes(q)) return true;
        if (s.filledByName?.toLowerCase().includes(q)) return true;
        if (s.data) {
          return Object.values(s.data).some(v => String(v).toLowerCase().includes(q));
        }
        return false;
      });
    }
    return result;
  }, [submissions, search, statusFilter, templateFilter, templateMap]);

  const uniqueTemplates = useMemo(() => {
    const ids = [...new Set(submissions.map(s => s.templateId))];
    return ids.map(id => ({ id, name: templateMap[id]?.name || id }));
  }, [submissions, templateMap]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Eingereichte Formulare</h2>
        <button onClick={() => exportSubmissionsCsv(submissions, allTemplates || DEMO_TEMPLATES)} style={styles.btn('secondary', 'sm')}>📊 CSV Export</button>
      </div>
      <p style={{ color: S.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>{filtered.length} von {submissions.length} Formular{submissions.length !== 1 ? 'en' : ''}</p>

      <div style={S_TOOLBAR}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Suchen..." style={S_SEARCH} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S_FILTER_SELECT}>
          <option value="all">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={templateFilter} onChange={e => setTemplateFilter(e.target.value)} style={S_FILTER_SELECT}>
          <option value="all">Alle Formulare</option>
          {uniqueTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {(() => {
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        const currentPage = Math.min(page, Math.max(0, totalPages - 1));
        const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
        return (<>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paged.map(sub => {
              const tpl = templateMap[sub.templateId];
              return (
                <div key={sub.id} style={{ ...styles.card, padding: '16px 20px', cursor: 'pointer', transition: S.transition }}
                  onClick={() => onViewSubmission?.(sub)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = S.colors.shadowLg; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.colors.shadow; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{tpl?.icon || '📋'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{tpl?.name || 'Formular'}</div>
                      <div style={{ fontSize: '12px', color: S.colors.textMuted }}>
                        {new Date(sub.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {sub.filledByName && ` · ${sub.filledByName}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={styles.badge(STATUS_COLORS[sub.status] || S.colors.textMuted)}>{STATUS_LABELS[sub.status] || sub.status}</span>
                      <button onClick={(e) => { e.stopPropagation(); if (tpl) exportSubmissionPdf(sub, tpl); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', opacity: tpl ? 1 : 0.3 }} title="PDF Export" aria-label="Als PDF exportieren">📄</button>
                      {onDeleteSubmission && <button onClick={(e) => { e.stopPropagation(); if (confirm('Eintrag löschen?')) onDeleteSubmission(sub.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: S.colors.textMuted }} title="Löschen" aria-label="Eintrag löschen">🗑</button>}
                    </div>
                  </div>
                  {sub.data && Object.keys(sub.data).length > 0 && (() => {
                    const tplFields = tpl?.pages?.flatMap(p => p.fields) || [];
                    const preview = tplFields.filter(f => ['text', 'select', 'number', 'date'].includes(f.type) && sub.data[f.id]).slice(0, 3);
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
            {filtered.length === 0 && (
              <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
                <p style={{ color: S.colors.textMuted }}>Keine Ergebnisse für diese Filter.</p>
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
