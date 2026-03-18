import { useState, useEffect, useMemo, useCallback } from 'react';
import { S, STATUS_COLORS, STATUS_LABELS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { getActivityLog, updateCustomerNotes, updateCustomer, deleteCustomer, addActivityLog } from '../../lib/customerService';
import { exportSubmissionPdf } from '../../lib/exportPdf';
import { dialog } from '../../lib/dialogService';
import { useData } from '../../contexts/DataContext';

// ═══ Extracted Styles (P4) ═══
const S_HEADER = { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' };
const S_AVATAR = { width: 56, height: 56, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', flexShrink: 0 };
const S_INFO_GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' };
const S_INFO_ITEM = { padding: '12px 16px', borderRadius: S.radius.md, background: S.colors.bgInput, border: `1px solid ${S.colors.border}` };
const S_INFO_LABEL = { fontSize: '11px', fontWeight: 600, color: S.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' };
const S_INFO_VALUE = { fontSize: '14px', fontWeight: 500 };
const S_SECTION_TITLE = { fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' };
const S_TAB_BAR = { display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: `1px solid ${S.colors.border}` };
const S_TAB = (active) => ({ padding: '10px 16px', fontSize: '13px', fontWeight: active ? 700 : 500, border: 'none', borderBottom: `2px solid ${active ? S.colors.primary : 'transparent'}`, background: 'none', color: active ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' });
const S_LOG_ITEM = { display: 'flex', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${S.colors.borderFaint}` };
const S_LOG_DOT = (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: '6px' });
const S_NOTES_AREA = { width: '100%', padding: '12px', borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical', background: S.colors.bgInput };

const LOG_COLORS = {
  submission_created: S.colors.success,
  customer_created: S.colors.primary,
  customer_updated: S.colors.accent,
  note_added: S.colors.warning,
  pdf_exported: S.colors.textSecondary,
};
const LOG_LABELS = {
  submission_created: 'Vertrag erstellt',
  customer_created: 'Kontakt angelegt',
  customer_updated: 'Kontakt aktualisiert',
  note_added: 'Notiz hinzugefügt',
  pdf_exported: 'PDF exportiert',
};

// ═══ FEATURE: Kunden-Detailansicht ═══
const S_EDIT_INPUT = { width: '100%', padding: '8px 12px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: S.colors.bgInput };
const S_EDIT_LABEL = { fontSize: '12px', fontWeight: 600, color: S.colors.textMuted, marginBottom: '4px' };

export const CustomerDetail = ({ customer, onBack }) => {
  const { submissions, allTemplates, handleCustomersChange } = useData();
  const [tab, setTab] = useState('contracts');
  const [activityLog, setActivityLog] = useState([]);
  const [notes, setNotes] = useState(customer.notes || '');
  const [notesSaved, setNotesSaved] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: customer.name, email: customer.email || '', phone: customer.phone || '', address: customer.address || '' });

  const templateMap = useMemo(() => {
    const map = {};
    allTemplates.forEach(t => { map[t.id] = t; });
    return map;
  }, [allTemplates]);

  const customerSubs = useMemo(() => {
    return submissions
      .filter(s => customer.submissionIds?.includes(s.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [submissions, customer.submissionIds]);

  useEffect(() => {
    getActivityLog({ customerId: customer.id }).then(setActivityLog);
  }, [customer.id]);

  const handleSaveNotes = useCallback(async () => {
    await updateCustomerNotes(customer.id, notes);
    setNotesSaved(true);
    if (handleCustomersChange) handleCustomersChange();
  }, [customer.id, notes, handleCustomersChange]);

  const handleSaveEdit = useCallback(async () => {
    if (!editData.name.trim()) return;
    await updateCustomer(customer.id, editData);
    await addActivityLog({ action: 'customer_updated', customerId: customer.id, details: `Kontaktdaten bearbeitet` });
    setEditing(false);
    if (handleCustomersChange) handleCustomersChange();
  }, [customer.id, editData, handleCustomersChange]);

  const handleDeleteCustomer = useCallback(async () => {
    if (!(await dialog.confirm({ title: 'Kontakt löschen?', message: `"${customer.name}" wird unwiderruflich gelöscht.`, confirmLabel: 'Löschen' }))) return;
    await deleteCustomer(customer.id);
    if (handleCustomersChange) handleCustomersChange();
    onBack();
  }, [customer.id, customer.name, handleCustomersChange, onBack]);

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ ...styles.btn('ghost'), padding: '8px' }}>← Zurück</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Kontaktdetails</h2>
        </div>
      </div>

      {/* Kunden-Profil */}
      <div style={{ ...styles.card, padding: '24px', marginBottom: '16px' }}>
        <div style={S_HEADER}>
          <div style={S_AVATAR}>{getInitials(editing ? editData.name || customer.name : customer.name)}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{customer.name}</h3>
            <div style={{ fontSize: '13px', color: S.colors.textMuted }}>
              Kunde seit {new Date(customer.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}{customerSubs.length} {customerSubs.length === 1 ? 'Vertrag' : 'Verträge'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {!editing && <button onClick={() => setEditing(true)} style={styles.btn('secondary', 'sm')}>✎ Bearbeiten</button>}
            <button onClick={handleDeleteCustomer} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>🗑</button>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div><div style={S_EDIT_LABEL}>Name *</div><input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={S_EDIT_INPUT} /></div>
            <div><div style={S_EDIT_LABEL}>E-Mail</div><input value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} style={S_EDIT_INPUT} type="email" /></div>
            <div><div style={S_EDIT_LABEL}>Telefon</div><input value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} style={S_EDIT_INPUT} type="tel" /></div>
            <div><div style={S_EDIT_LABEL}>Adresse</div><input value={editData.address} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} style={S_EDIT_INPUT} /></div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={styles.btn('ghost', 'sm')}>Abbrechen</button>
              <button onClick={handleSaveEdit} style={styles.btn('primary', 'sm')}>Speichern</button>
            </div>
          </div>
        ) : (
          <div style={S_INFO_GRID}>
            {customer.email && (
              <div style={S_INFO_ITEM}>
                <div style={S_INFO_LABEL}>E-Mail</div>
                <div style={S_INFO_VALUE}>{customer.email}</div>
              </div>
            )}
            {customer.phone && (
              <div style={S_INFO_ITEM}>
                <div style={S_INFO_LABEL}>Telefon</div>
                <div style={S_INFO_VALUE}>{customer.phone}</div>
              </div>
            )}
            {customer.address && (
              <div style={S_INFO_ITEM}>
                <div style={S_INFO_LABEL}>Adresse</div>
                <div style={S_INFO_VALUE}>{customer.address}</div>
              </div>
            )}
            {customer.projects?.length > 0 && (
              <div style={S_INFO_ITEM}>
                <div style={S_INFO_LABEL}>Projekte</div>
                <div style={S_INFO_VALUE}>{customer.projects.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={S_TAB_BAR}>
        <button style={S_TAB(tab === 'contracts')} onClick={() => setTab('contracts')}>Verträge ({customerSubs.length})</button>
        <button style={S_TAB(tab === 'log')} onClick={() => setTab('log')}>Aktivitätslog ({activityLog.length})</button>
        <button style={S_TAB(tab === 'notes')} onClick={() => setTab('notes')}>Notizen</button>
      </div>

      {/* Tab: Verträge */}
      {tab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customerSubs.length === 0 ? (
            <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
              <p style={{ color: S.colors.textMuted }}>Noch keine Verträge vorhanden.</p>
            </div>
          ) : customerSubs.map(sub => {
            const tpl = templateMap[sub.templateId];
            return (
              <div key={sub.id} style={{ ...styles.card, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{tpl?.icon || '📋'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{tpl?.name || 'Formular'}</div>
                    <div style={{ fontSize: '12px', color: S.colors.textMuted }}>
                      {new Date(sub.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {sub.filledByName && ` · ${sub.filledByName}`}
                    </div>
                  </div>
                  <span style={styles.badge(STATUS_COLORS[sub.status] || S.colors.textMuted)}>{STATUS_LABELS[sub.status] || sub.status}</span>
                  <button onClick={() => tpl && exportSubmissionPdf(sub, tpl)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }} title="PDF Export">📄</button>
                </div>
                {sub.data && (() => {
                  const tplFields = tpl?.pages?.flatMap(p => p.fields) || [];
                  const preview = tplFields.filter(f => ['text', 'select', 'number', 'date'].includes(f.type) && sub.data[f.id]).slice(0, 4);
                  if (preview.length === 0) return null;
                  return (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${S.colors.borderFaint}`, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {preview.map(f => <div key={f.id} style={{ fontSize: '12px' }}><span style={{ color: S.colors.textMuted }}>{f.label}: </span><span style={{ fontWeight: 500 }}>{String(sub.data[f.id]).slice(0, 40)}</span></div>)}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Aktivitätslog */}
      {tab === 'log' && (
        <div style={styles.card}>
          {activityLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: S.colors.textMuted }}>Noch keine Aktivitäten aufgezeichnet.</div>
          ) : activityLog.map(entry => (
            <div key={entry.id} style={S_LOG_ITEM}>
              <div style={S_LOG_DOT(LOG_COLORS[entry.action] || S.colors.textMuted)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>
                  {LOG_LABELS[entry.action] || entry.action}
                  {entry.templateName && <span style={{ color: S.colors.textSecondary }}> — {entry.templateName}</span>}
                </div>
                {entry.details && <div style={{ fontSize: '12px', color: S.colors.textMuted, marginTop: '2px' }}>{entry.details}</div>}
                <div style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '4px' }}>
                  {new Date(entry.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {entry.userName && ` · ${entry.userName}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Notizen */}
      {tab === 'notes' && (
        <div style={styles.card}>
          <div style={S_SECTION_TITLE}>📝 Notizen zu {customer.name}</div>
          <textarea value={notes} onChange={e => { setNotes(e.target.value); setNotesSaved(false); }} style={S_NOTES_AREA} placeholder="Notizen zum Kunden..." />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: notesSaved ? S.colors.success : S.colors.warning }}>
              {notesSaved ? '✓ Gespeichert' : '● Ungespeicherte Änderungen'}
            </span>
            <button onClick={handleSaveNotes} disabled={notesSaved} style={{ ...styles.btn(notesSaved ? 'ghost' : 'primary', 'sm'), opacity: notesSaved ? 0.5 : 1 }}>
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
