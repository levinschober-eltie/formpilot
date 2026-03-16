// ═══ FEATURE: PDF Export (Print-based) ═══

const formatValue = (field, value) => {
  if (value === null || value === undefined || value === '') return '—';
  switch (field.type) {
    case 'toggle': return value ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein');
    case 'checkbox': return Array.isArray(value) ? value.join(', ') : String(value);
    case 'rating':
      if (field.ratingType === 'traffic') {
        const labels = { 1: 'Gut ✅', 2: 'Mittel ⚠️', 3: 'Schlecht ❌' };
        return labels[value] || String(value);
      }
      return `${'★'.repeat(Number(value))}${'☆'.repeat((field.maxStars || 5) - Number(value))} (${value}/${field.maxStars || 5})`;
    case 'checklist':
      if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value).map(([key, v]) => {
          const item = field.items?.find(i => i.id === key);
          return `${v?.checked ? '☑' : '☐'} ${item?.label || key}${v?.note ? ` — ${v.note}` : ''}`;
        }).join('\n');
      }
      return String(value);
    case 'signature': return value ? '[Unterschrift vorhanden]' : '—';
    case 'photo':
      const photos = Array.isArray(value) ? value : value ? [value] : [];
      return photos.length ? `[${photos.length} Foto(s)]` : '—';
    case 'repeater':
      if (!Array.isArray(value) || value.length === 0) return '—';
      return value.map((row, i) => {
        const cols = Object.entries(row).map(([, v]) => String(v || '')).join(' | ');
        return `#${i + 1}: ${cols}`;
      }).join('\n');
    default: return String(value);
  }
};

export const exportSubmissionPdf = (submission, template) => {
  const settings = template.pdfSettings || {};
  const accent = settings.accentColor || '#2563eb';
  const footer = settings.footerText || 'Erstellt mit FormPilot';

  const allFields = template.pages.flatMap(p => p.fields);
  const signatureFields = allFields.filter(f => f.type === 'signature' && submission.data?.[f.id]);
  const photoFields = allFields.filter(f => f.type === 'photo' && submission.data?.[f.id]);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @page { size: ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'}; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; }
  .header { border-bottom: 3px solid ${accent}; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 20pt; color: ${accent}; }
  .header .meta { font-size: 9pt; color: #666; text-align: right; }
  .page-title { font-size: 13pt; font-weight: 700; color: ${accent}; margin: 16px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e0e0e0; }
  .field-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
  .field-label { width: 35%; font-weight: 600; color: #444; font-size: 10pt; }
  .field-value { width: 65%; white-space: pre-line; }
  .required { color: #dc2626; }
  .signature-section { margin-top: 20px; page-break-inside: avoid; }
  .signature-img { max-width: 300px; max-height: 100px; border: 1px solid #e0e0e0; border-radius: 4px; }
  .photo-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .photo-img { width: 120px; height: 90px; object-fit: cover; border: 1px solid #e0e0e0; border-radius: 4px; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; padding: 8px 15mm; border-top: 1px solid #e0e0e0; }
  @media print { .no-print { display: none; } }
</style></head><body>`;

  html += `<div class="header">
    <div><h1>${template.icon || '📋'} ${template.name}</h1>
    <div style="font-size:9pt;color:#666;margin-top:4px">${template.description || ''}</div></div>
    <div class="meta">
      <div>Ausgefüllt: ${new Date(submission.completedAt || submission.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      <div>Von: ${submission.filledByName || '—'}</div>
      <div>ID: ${submission.id}</div>
    </div></div>`;

  template.pages.forEach((page) => {
    if (template.pages.length > 1) {
      html += `<div class="page-title">${page.title}</div>`;
    }
    const inputFields = page.fields.filter(f => !['heading', 'divider', 'info'].includes(f.type));
    page.fields.forEach(f => {
      if (f.type === 'heading') {
        html += `<div style="font-size:12pt;font-weight:700;margin:12px 0 6px;color:#333">${f.label}</div>`;
      } else if (f.type === 'divider') {
        html += `<hr style="border:none;border-top:1px solid #ddd;margin:10px 0">`;
      } else if (f.type === 'info') {
        html += `<div style="background:#f0f4ff;padding:8px 12px;border-radius:4px;font-size:10pt;margin:6px 0;color:#555">${f.content || ''}</div>`;
      } else if (f.type === 'signature') {
        const sig = submission.data?.[f.id];
        html += `<div class="signature-section"><div class="field-row"><div class="field-label">${f.label}${f.required ? ' <span class="required">*</span>' : ''}</div><div class="field-value">`;
        if (sig) html += `<img src="${sig}" class="signature-img" />`;
        else html += '—';
        html += `</div></div></div>`;
      } else if (f.type === 'photo') {
        const photos = (() => { const v = submission.data?.[f.id]; return Array.isArray(v) ? v : v ? [v] : []; })();
        html += `<div class="field-row"><div class="field-label">${f.label}</div><div class="field-value">`;
        if (photos.length) {
          html += `<div class="photo-grid">${photos.map(p => `<img src="${p}" class="photo-img" />`).join('')}</div>`;
        } else {
          html += '—';
        }
        html += `</div></div>`;
      } else {
        const val = formatValue(f, submission.data?.[f.id]);
        html += `<div class="field-row"><div class="field-label">${f.label || f.type}${f.required ? ' <span class="required">*</span>' : ''}</div><div class="field-value">${val}</div></div>`;
      }
    });
  });

  html += `<div class="footer">${footer} · ${new Date().toLocaleDateString('de-DE')}</div>`;
  html += `</body></html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => { printWindow.print(); }, 300);
  };
};
