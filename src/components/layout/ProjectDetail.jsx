import { useState, useEffect, useCallback, useMemo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { linkSubmissionToPhase } from '../../lib/projectService';

// ═══ Extracted Styles (P4) ═══
const S_BACK_ROW = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' };
const S_NAME_INPUT = { fontSize: '20px', fontWeight: 700, border: 'none', background: 'transparent', outline: 'none', padding: '4px 0', width: '100%', fontFamily: 'inherit', color: S.colors.text };
const S_DESC_AREA = { width: '100%', padding: '10px 14px', borderRadius: S.radius.md, border: `1.5px solid ${S.colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minHeight: '72px', resize: 'vertical', background: S.colors.bgInput, color: S.colors.text };
const S_STATS_ROW = { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' };
const S_STAT = { padding: '8px 14px', borderRadius: S.radius.md, background: S.colors.bgInput, border: `1px solid ${S.colors.border}`, fontSize: '13px' };
const S_STAT_NUM = { fontWeight: 700, fontSize: '18px', display: 'block', marginBottom: '2px' };
const S_META = { fontSize: '12px', color: S.colors.textMuted, marginTop: '12px' };

const S_TIMELINE_WRAP = { position: 'relative', paddingLeft: '48px', marginTop: '8px' };
const S_PHASE_ROW = { position: 'relative', paddingBottom: '24px' };
const S_TIMELINE_LINE = (isCompleted) => ({
  position: 'absolute', left: 15, top: 32, bottom: -16, width: 2,
  background: isCompleted ? S.colors.success : S.colors.border,
});
const S_TIMELINE_DOT = (status) => ({
  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '14px', fontWeight: 700,
  background: status === 'completed' ? '#16a34a' : status === 'in_progress' ? '#2563eb' : S.colors.bgCardSolid,
  color: status === 'completed' || status === 'in_progress' ? '#fff' : S.colors.textMuted,
  border: status === 'pending' ? `2px solid ${S.colors.border}` : 'none',
  position: 'absolute', left: -48, top: 4,
});
const S_PHASE_CARD = { ...styles.card, padding: '16px 20px', marginBottom: 0 };
const S_PHASE_TITLE_INPUT = { fontSize: '15px', fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', padding: '2px 0', width: '100%', fontFamily: 'inherit', color: S.colors.text };
const S_PHASE_FIELD = { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px' };
const S_PHASE_LABEL = { fontSize: '12px', fontWeight: 600, color: S.colors.textMuted, minWidth: '70px' };
const S_SELECT = { padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', background: S.colors.bgInput, color: S.colors.text, flex: 1, maxWidth: '260px' };
const S_DATE_INPUT = { padding: '6px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', background: S.colors.bgInput, color: S.colors.text };

const PHASE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Ausstehend' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'completed', label: 'Abgeschlossen' },
];
const PROJECT_STATUS_OPTIONS = [
  { value: 'planning', label: 'In Planung' },
  { value: 'active', label: 'Aktiv' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'archived', label: 'Archiviert' },
];
const STATUS_BADGE_COLORS = { pending: S.colors.textMuted, in_progress: S.colors.primary, completed: S.colors.success };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// ═══ FEATURE: Projekt-Detailansicht mit Timeline ═══
export const ProjectDetail = ({ project, submissions, allTemplates, onBack, onProjectChange, onStartFilling }) => {
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [phases, setPhases] = useState(project.phases || []);
  const [linkingPhaseId, setLinkingPhaseId] = useState(null);

  // Sync local state when project prop changes (e.g. after submission link)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(project.name || '');
    setDescription(project.description || '');
    setPhases(project.phases || []);
  }, [project]);

  const templateMap = useMemo(() => {
    const map = {};
    allTemplates.forEach(t => { map[t.id] = t; });
    return map;
  }, [allTemplates]);

  // Submissions already linked to any phase in this project
  const linkedSubIds = useMemo(() => {
    const ids = new Set();
    phases.forEach(p => { if (p.submissionId) ids.add(p.submissionId); });
    return ids;
  }, [phases]);

  const unlinkableSubs = useMemo(() =>
    submissions.filter(s => !linkedSubIds.has(s.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [submissions, linkedSubIds]);

  const completedCount = useMemo(() => phases.filter(p => p.status === 'completed').length, [phases]);

  // ─── Save helpers ───
  const saveProject = useCallback((updates) => {
    const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
    onProjectChange(updated);
  }, [project, onProjectChange]);

  const handleNameBlur = useCallback(() => {
    if (name.trim() && name !== project.name) saveProject({ name: name.trim() });
  }, [name, project.name, saveProject]);

  const handleDescBlur = useCallback(() => {
    if (description !== (project.description || '')) saveProject({ description });
  }, [description, project.description, saveProject]);

  const updatePhase = useCallback((phaseId, patch) => {
    const next = phases.map(p => p.id === phaseId ? { ...p, ...patch } : p);
    setPhases(next);
    saveProject({ phases: next });
  }, [phases, saveProject]);

  const handleDelete = useCallback(() => {
    if (!confirm(`Projekt "${project.name}" unwiderruflich löschen?`)) return;
    saveProject({ _deleted: true });
    onBack();
  }, [project.name, saveProject, onBack]);

  const addPhase = useCallback(() => {
    const next = [...phases, {
      id: `phase_${Date.now()}`,
      title: `Phase ${phases.length + 1}`,
      templateId: null,
      submissionId: null,
      dueDate: null,
      status: 'pending',
    }];
    setPhases(next);
    saveProject({ phases: next });
  }, [phases, saveProject]);

  const removePhase = useCallback((phaseId) => {
    const next = phases.filter(p => p.id !== phaseId);
    setPhases(next);
    saveProject({ phases: next });
  }, [phases, saveProject]);

  const handleLinkSubmission = useCallback(async (phaseId, subId) => {
    // Call linkSubmissionToPhase to extract sharedData for auto-fill
    const phase = phases.find(p => p.id === phaseId);
    const tpl = phase?.templateId ? templateMap[phase.templateId] : null;
    const updatedProj = await linkSubmissionToPhase(project.id, phaseId, subId, tpl);
    if (updatedProj) {
      onProjectChange(updatedProj);
    } else {
      updatePhase(phaseId, { submissionId: subId });
    }
    setLinkingPhaseId(null);
  }, [phases, templateMap, project.id, onProjectChange, updatePhase]);

  const dotIcon = (status, idx) => {
    if (status === 'completed') return '\u2713';
    if (status === 'in_progress') return '\u25CF';
    return idx + 1;
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={S_BACK_ROW}>
        <button onClick={onBack} style={{ ...styles.btn('ghost'), padding: '8px' }}>&larr; Zur&uuml;ck</button>
        <div style={{ flex: 1 }}>
          <input value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur} style={S_NAME_INPUT} placeholder="Projektname..." />
        </div>
        <select value={project.status || 'planning'} onChange={e => saveProject({ status: e.target.value })} style={S_SELECT}>
          {PROJECT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={handleDelete} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>&#x1F5D1;</button>
      </div>

      {/* ── Info Card ── */}
      <div style={{ ...styles.card, padding: '20px', marginBottom: '20px' }}>
        <textarea value={description} onChange={e => setDescription(e.target.value)} onBlur={handleDescBlur} style={S_DESC_AREA} placeholder="Projektbeschreibung..." />
        <div style={S_STATS_ROW}>
          <div style={S_STAT}><span style={S_STAT_NUM}>{phases.length}</span>Phasen gesamt</div>
          <div style={S_STAT}><span style={S_STAT_NUM}>{completedCount}</span>Abgeschlossen</div>
          <div style={S_STAT}><span style={S_STAT_NUM}>{linkedSubIds.size}</span>Vertr&auml;ge verkn&uuml;pft</div>
        </div>
        <div style={S_META}>
          Erstellt: {fmtDate(project.createdAt)}{project.updatedAt && ` · Aktualisiert: ${fmtDate(project.updatedAt)}`}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Projektphasen</div>

      <div style={S_TIMELINE_WRAP}>
        {phases.map((phase, idx) => {
          const isLast = idx === phases.length - 1;
          const tpl = phase.templateId ? templateMap[phase.templateId] : null;
          const linkedSub = phase.submissionId ? submissions.find(s => s.id === phase.submissionId) : null;

          return (
            <div key={phase.id} style={S_PHASE_ROW}>
              {/* Vertical line */}
              {!isLast && <div style={S_TIMELINE_LINE(phase.status === 'completed')} />}
              {/* Dot */}
              <div style={S_TIMELINE_DOT(phase.status)}>{dotIcon(phase.status, idx)}</div>

              {/* Phase card */}
              <div style={S_PHASE_CARD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    value={phase.title}
                    onChange={e => { const v = e.target.value; setPhases(ps => ps.map(p => p.id === phase.id ? { ...p, title: v } : p)); }}
                    onBlur={e => updatePhase(phase.id, { title: e.target.value })}
                    style={{ ...S_PHASE_TITLE_INPUT, flex: 1 }}
                    placeholder="Phasenname..."
                  />
                  <button onClick={() => { if (confirm(`Phase "${phase.title}" entfernen?`)) removePhase(phase.id); }} style={{ ...styles.btn('ghost', 'sm'), padding: '4px 8px', color: S.colors.danger, fontSize: '12px', flexShrink: 0 }} title="Phase entfernen">✕</button>
                </div>

                {/* Template selector */}
                <div style={S_PHASE_FIELD}>
                  <span style={S_PHASE_LABEL}>Vorlage</span>
                  <select value={phase.templateId || ''} onChange={e => updatePhase(phase.id, { templateId: e.target.value || null })} style={S_SELECT}>
                    <option value="">— Vorlage w&auml;hlen —</option>
                    {allTemplates.map(t => <option key={t.id} value={t.id}>{t.icon || ''} {t.name}</option>)}
                  </select>
                </div>

                {/* Due date */}
                <div style={S_PHASE_FIELD}>
                  <span style={S_PHASE_LABEL}>F&auml;llig</span>
                  <input type="date" value={phase.dueDate || ''} onChange={e => updatePhase(phase.id, { dueDate: e.target.value || null })} style={S_DATE_INPUT} />
                </div>

                {/* Status */}
                <div style={S_PHASE_FIELD}>
                  <span style={S_PHASE_LABEL}>Status</span>
                  <select value={phase.status} onChange={e => updatePhase(phase.id, { status: e.target.value })} style={S_SELECT}>
                    {PHASE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Submission area */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${S.colors.borderFaint}` }}>
                  {linkedSub ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: S.colors.success, fontWeight: 600 }}>&#x2713;</span>
                      <span>{templateMap[linkedSub.templateId]?.name || 'Vertrag'} &mdash; {fmtDate(linkedSub.createdAt)}</span>
                      <button onClick={() => updatePhase(phase.id, { submissionId: null })} style={{ ...styles.btn('ghost', 'sm'), fontSize: '11px', padding: '2px 8px', color: S.colors.textMuted }}>Trennen</button>
                    </div>
                  ) : phase.templateId ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => tpl && onStartFilling(tpl, project, phase.id)} style={styles.btn('primary', 'sm')}>Vertrag erstellen</button>
                      <button onClick={() => setLinkingPhaseId(linkingPhaseId === phase.id ? null : phase.id)} style={styles.btn('secondary', 'sm')}>Vertrag verkn&uuml;pfen</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: S.colors.textMuted, fontStyle: 'italic' }}>Bitte zuerst eine Vorlage w&auml;hlen</div>
                  )}

                  {/* Link existing submission dropdown */}
                  {linkingPhaseId === phase.id && (
                    <div style={{ marginTop: '8px', padding: '8px', background: S.colors.bgInput, borderRadius: S.radius.md, border: `1px solid ${S.colors.border}`, maxHeight: '160px', overflowY: 'auto' }}>
                      {unlinkableSubs.length === 0 ? (
                        <div style={{ fontSize: '12px', color: S.colors.textMuted, padding: '8px' }}>Keine unverkn&uuml;pften Vertr&auml;ge vorhanden.</div>
                      ) : unlinkableSubs.map(sub => (
                        <div key={sub.id} onClick={() => handleLinkSubmission(phase.id, sub.id)} style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: S.radius.sm, fontSize: '13px', transition: S.transition }}>
                          {templateMap[sub.templateId]?.name || 'Vertrag'} &mdash; {fmtDate(sub.createdAt)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Phase ── */}
      <button onClick={addPhase} style={{ ...styles.btn('secondary'), width: '100%', marginTop: phases.length > 0 ? '8px' : '0' }}>
        + Phase hinzuf&uuml;gen
      </button>
    </div>
  );
};
