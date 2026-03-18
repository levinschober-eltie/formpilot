import { useState, useMemo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useDebounce } from '../../hooks/useDebounce';
import { useData } from '../../contexts/DataContext';

// ═══ Extracted Styles (P4) ═══
const S_SEARCH = { flex: '1 1 200px', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput, minWidth: '150px' };
const S_STAT = { fontSize: '12px', color: S.colors.textSecondary, marginBottom: '16px' };
const S_CARD_ROW = { display: 'flex', alignItems: 'center', gap: '12px' };
const S_AVATAR = { width: 44, height: 44, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 };
const S_NAME = { fontWeight: 600, fontSize: '15px' };
const S_META = { fontSize: '12px', color: S.colors.textMuted };
const S_BADGE = (count) => ({ ...styles.badge(count > 5 ? S.colors.success : S.colors.primary), fontSize: '11px', flexShrink: 0 });
const S_EMPTY_ICON = { fontSize: '48px', marginBottom: '12px', opacity: 0.5 };

const PAGE_SIZE = 20;

// ═══ FEATURE: Kundenliste ═══
export const CustomersScreen = ({ onSelectCustomer }) => {
  const { customers, submissions, allTemplates } = useData();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(0);

  const templateMap = useMemo(() => {
    const map = {};
    allTemplates.forEach(t => { map[t.id] = t; });
    return map;
  }, [allTemplates]);

  const enriched = useMemo(() => {
    return customers.map(c => {
      const subs = c.submissionIds ? submissions.filter(s => c.submissionIds.includes(s.id)) : [];
      const lastSub = subs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      return { ...c, submissionCount: subs.length, lastSubmission: lastSub };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [customers, submissions]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return enriched;
    const q = debouncedSearch.toLowerCase();
    return enriched.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.projects?.some(p => p.toLowerCase().includes(q))
    );
  }, [enriched, debouncedSearch]);

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (customers.length === 0) return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Kontakte</h2>
      <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px' }}>
        <div style={S_EMPTY_ICON}>👥</div>
        <p style={{ color: S.colors.textSecondary, marginBottom: '8px' }}>Noch keine Kontakte vorhanden.</p>
        <p style={{ color: S.colors.textMuted, fontSize: '13px' }}>Kontakte werden automatisch erstellt wenn Formulare ausgefüllt werden.</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Kontakte</h2>
      <p style={S_STAT}>{filtered.length} von {customers.length} Kontakt{customers.length !== 1 ? 'en' : ''}</p>

      <div style={{ marginBottom: '16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Kontakte suchen..." style={S_SEARCH} />
      </div>

      {(() => {
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        const currentPage = Math.min(page, Math.max(0, totalPages - 1));
        const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
        return (<>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paged.map(customer => (
              <div key={customer.id} style={{ ...styles.card, padding: '16px 20px', cursor: 'pointer', transition: S.transition }}
                onClick={() => onSelectCustomer(customer)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = S.colors.shadowLg; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = S.colors.shadow; }}>
                <div style={S_CARD_ROW}>
                  <div style={S_AVATAR}>{getInitials(customer.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S_NAME}>{customer.name}</div>
                    <div style={S_META}>
                      {customer.email && <span>{customer.email} · </span>}
                      {customer.address && <span>{customer.address} · </span>}
                      {customer.projects?.length > 0 && <span>{customer.projects[customer.projects.length - 1]}</span>}
                    </div>
                  </div>
                  <span style={S_BADGE(customer.submissionCount)}>{customer.submissionCount} {customer.submissionCount === 1 ? 'Vertrag' : 'Verträge'}</span>
                </div>
                {customer.lastSubmission && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${S.colors.borderFaint}`, fontSize: '12px', color: S.colors.textMuted }}>
                    Letzter Vertrag: {templateMap[customer.lastSubmission.templateId]?.name || 'Formular'} — {new Date(customer.lastSubmission.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && search && (
              <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
                <p style={{ color: S.colors.textMuted }}>Keine Kontakte für "{search}" gefunden.</p>
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
