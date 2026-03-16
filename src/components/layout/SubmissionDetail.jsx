import { S, STATUS_COLORS, STATUS_LABELS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { exportSubmissionPdf } from '../../lib/exportPdf';

// ═══ FEATURE: Submission Detail View ═══
const S_HEADER = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' };
const S_ACTIONS = { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' };
const S_FIELD_ROW = { display: 'flex', padding: '10px 0', borderBottom: `1px solid ${S.colors.border}08`, gap: '12px' };
const S_FIELD_LABEL = { width: '35%', fontWeight: 600, fontSize: '13px', color: S.colors.textSecondary, flexShrink: 0 };
const S_FIELD_VALUE = { flex: 1, fontSize: '14px', whiteSpace: 'pre-line', wordBreak: 'break-word' };

const renderValue = (field, value) => {
  if (value === null || value === undefined || value === '') return <span style={{ color: S.colors.textMuted }}>—</span>;
  switch (field.type) {
    case 'toggle':
      return <span style={{ color: value ? S.colors.success : S.colors.danger }}>{value ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein')}</span>;
    case 'checkbox':
      return Array.isArray(value) ? value.map((v, i) => (
        <span key={i} style={{ ...styles.badge(S.colors.primary), marginRight: '4px', marginBottom: '4px' }}>{v}</span>
      )) : String(value);
    case 'rating':
      if (field.ratingType === 'traffic') {
        const m = { good: { label: 'Gut', color: S.colors.success }, medium: { label: 'Mittel', color: S.colors.warning }, bad: { label: 'Schlecht', color: S.colors.danger } };
        const info = m[value] || { label: value, color: S.colors.textMuted };
        return <span style={styles.badge(info.color)}>{info.label}</span>;
      }
      return <span>{'★'.repeat(Number(value))}{'☆'.repeat((field.maxStars || 5) - Number(value))} ({value}/{field.maxStars || 5})</span>;
    case 'checklist':
      if (typeof value === 'object' && !Array.isArray(value)) {
        return <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.entries(value).map(([key, v]) => {
            const item = field.items?.find(i => i.id === key);
            return <div key={key} style={{ fontSize: '13px' }}>
              <span style={{ color: v?.checked ? S.colors.success : S.colors.textMuted }}>{v?.checked ? '☑' : '☐'}</span> {item?.label || key}
              {v?.note && <span style={{ color: S.colors.textSecondary, fontStyle: 'italic' }}> — {v.note}</span>}
            </div>;
          })}
        </div>;
      }
      return String(value);
    case 'signature':
      return value ? <img src={value} alt="Unterschrift" style={{ maxWidth: '240px', maxHeight: '80px', border: `1px solid ${S.colors.border}`, borderRadius: S.radius.sm }} /> : '—';
    case 'photo':
      const photos = Array.isArray(value) ? value : value ? [value] : [];
      return photos.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {photos.map((src, i) => <img key={i} src={src} alt={`Foto ${i + 1}`} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}` }} />)}
        </div>
      ) : '—';
    case 'repeater':
      if (!Array.isArray(value) || value.length === 0) return <span style={{ color: S.colors.textMuted }}>—</span>;
      const subFields = field.subFields || [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {value.map((row, ri) => (
            <div key={ri} style={{ fontSize: '13px', padding: '4px 8px', background: S.colors.bgInput, borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}` }}>
              <span style={{ fontWeight: 600, color: S.colors.textMuted, fontSize: '11px' }}>#{ri + 1}</span>
              {subFields.map(sf => row[sf.id] ? <span key={sf.id} style={{ marginLeft: '8px' }}>{sf.label}: {row[sf.id]}</span> : null)}
              {subFields.length === 0 && Object.entries(row).map(([k, v]) => <span key={k} style={{ marginLeft: '8px' }}>{k}: {String(v)}</span>)}
            </div>
          ))}
        </div>
      );
    default:
      return String(value);
  }
};

export const SubmissionDetail = ({ submission, template, onBack }) => {
  if (!template) return <div style={styles.card}><p>Vorlage nicht gefunden.</p><button onClick={onBack} style={styles.btn('secondary')}>Zurück</button></div>;

  return (
    <div>
      <div style={S_HEADER}>
        <button onClick={onBack} style={{ ...styles.btn('ghost'), padding: '8px' }}>← Zurück</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{template.icon} {template.name}</h2>
          <div style={{ fontSize: '12px', color: S.colors.textSecondary, marginTop: '2px' }}>
            {new Date(submission.completedAt || submission.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {submission.filledByName && ` · ${submission.filledByName}`}
          </div>
        </div>
        <span style={styles.badge(STATUS_COLORS[submission.status] || S.colors.textMuted)}>{STATUS_LABELS[submission.status] || submission.status}</span>
      </div>

      <div style={S_ACTIONS}>
        <button onClick={() => exportSubmissionPdf(submission, template)} style={styles.btn('primary', 'sm')}>📄 PDF Export</button>
      </div>

      {template.pages.map((page, pi) => (
        <div key={page.id} style={{ ...styles.card, marginBottom: '12px' }}>
          {template.pages.length > 1 && <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.colors.primary, marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${S.colors.primary}15` }}>{page.title}</h3>}
          {page.fields.map(field => {
            if (field.type === 'heading') return <h4 key={field.id} style={{ fontSize: '14px', fontWeight: 700, margin: '12px 0 6px', color: S.colors.text }}>{field.label}</h4>;
            if (field.type === 'divider') return <hr key={field.id} style={{ border: 'none', borderTop: `1px solid ${S.colors.border}`, margin: '8px 0' }} />;
            if (field.type === 'info') return <div key={field.id} style={{ background: `${S.colors.primary}08`, padding: '8px 12px', borderRadius: S.radius.sm, fontSize: '13px', color: S.colors.textSecondary, margin: '6px 0' }}>{field.content}</div>;
            return (
              <div key={field.id} style={S_FIELD_ROW}>
                <div style={S_FIELD_LABEL}>{field.label}{field.required && <span style={{ color: S.colors.danger }}> *</span>}</div>
                <div style={S_FIELD_VALUE}>{renderValue(field, submission.data?.[field.id])}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
