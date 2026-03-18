import { dialog } from './dialogService';
// ═══ FEATURE: PDF Export (Print-based) with Company Branding ═══

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getCompanySettings = () => {
  try {
    const raw = localStorage.getItem('fp_company_settings');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildCompanyHeader = (company, accent, headerLayout) => {
  if (!company) return '';
  const textAlign = headerLayout === 'center' ? 'center' : headerLayout === 'right' ? 'right' : 'left';
  const flexDir = headerLayout === 'right' ? 'row-reverse' : 'row';

  let logoHtml = '';
  if (company.companyLogo) {
    const logoUrl = String(company.companyLogo);
    // Only allow data:image/ and https: URLs to prevent javascript:/vbscript: injection
    if (/^data:image\//i.test(logoUrl) || /^https:\/\//i.test(logoUrl)) {
      logoHtml = `<img src="${logoUrl}" style="max-width:180px;max-height:80px;object-fit:contain;" alt="Logo" />`;
    }
  }

  const contactLines = [];
  if (company.companyName) contactLines.push(`<div style="font-size:16pt;font-weight:700;color:${accent}">${esc(company.companyName)}</div>`);
  if (company.companyAddress) {
    company.companyAddress.split('\n').forEach(line => {
      contactLines.push(`<div style="font-size:9pt;color:#555">${esc(line)}</div>`);
    });
  }
  if (company.companyPhone) contactLines.push(`<div style="font-size:9pt;color:#555">Tel: ${esc(company.companyPhone)}</div>`);
  if (company.companyEmail) contactLines.push(`<div style="font-size:9pt;color:#555">${esc(company.companyEmail)}</div>`);

  if (headerLayout === 'center') {
    return `<div style="text-align:center;padding-bottom:12px;margin-bottom:16px;border-bottom:3px solid ${accent}">
      ${logoHtml ? `<div style="margin-bottom:8px">${logoHtml}</div>` : ''}
      ${contactLines.join('')}
    </div>`;
  }

  return `<div style="display:flex;flex-direction:${flexDir};align-items:center;gap:16px;padding-bottom:12px;margin-bottom:16px;border-bottom:3px solid ${accent}">
    ${logoHtml ? `<div style="flex-shrink:0">${logoHtml}</div>` : ''}
    <div style="text-align:${textAlign};flex:1">${contactLines.join('')}</div>
  </div>`;
};

const buildWatermark = (text) => {
  return `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:72pt;color:rgba(200,200,200,0.25);font-weight:900;pointer-events:none;z-index:0;white-space:nowrap;">${esc(text)}</div>`;
};

const FONT_SIZES = {
  small: { body: '9pt', header: '16pt', pageTitle: '11pt', label: '9pt', meta: '8pt' },
  normal: { body: '11pt', header: '20pt', pageTitle: '13pt', label: '10pt', meta: '9pt' },
  large: { body: '13pt', header: '24pt', pageTitle: '15pt', label: '12pt', meta: '10pt' },
};

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
    case 'barcode': return value ? String(value) : '—';
    case 'gps':
      if (value && typeof value === 'object' && value.lat != null) {
        return `Lat: ${value.lat.toFixed(6)}, Lng: ${value.lng.toFixed(6)} (±${value.accuracy || '?'}m)`;
      }
      return '—';
    case 'signature':
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const signed = Object.values(value).filter(Boolean).length;
        return signed ? `[${signed} Unterschrift(en) vorhanden]` : '—';
      }
      return value ? '[Unterschrift vorhanden]' : '—';
    case 'photo': {
      const photos = Array.isArray(value) ? value : value ? [value] : [];
      return photos.length ? `[${photos.length} Foto(s)]` : '—';
    }
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
  if (!template || !submission) return;
  const settings = template.pdfSettings || {};
  const company = getCompanySettings();
  const accent = company?.accentColor || settings.accentColor || '#2563eb';
  const footer = settings.footerText || 'Erstellt mit FormPilot';
  const headerLayout = settings.headerLayout || 'left';
  const fontSize = FONT_SIZES[settings.fontSize] || FONT_SIZES.normal;
  const paperSize = settings.paperSize === 'letter' ? 'letter' : 'A4';
  const showCompanyHeader = settings.showCompanyHeader !== false;
  const showWatermark = settings.showWatermark && submission.status !== 'completed';
  const watermarkText = settings.watermarkText || 'ENTWURF';

  const allFields = template.pages.flatMap(p => p.fields);
  const _signatureFields = allFields.filter(f => f.type === 'signature' && submission.data?.[f.id]);
  const _photoFields = allFields.filter(f => f.type === 'photo' && submission.data?.[f.id]);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @page { size: ${paperSize} ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'}; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; font-size: ${fontSize.body}; color: #1a1a1a; line-height: 1.5; position: relative; }
  .header { border-bottom: 3px solid ${accent}; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: ${fontSize.header}; color: ${accent}; }
  .header .meta { font-size: ${fontSize.meta}; color: #666; text-align: right; }
  .page-title { font-size: 13pt; font-weight: 700; color: ${accent}; margin: 16px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e0e0e0; }
  .field-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
  .field-label { width: 35%; font-weight: 600; color: #444; font-size: ${fontSize.label}; }
  .field-value { width: 65%; white-space: pre-line; }
  .required { color: #dc2626; }
  .signature-section { margin-top: 20px; page-break-inside: avoid; }
  .signature-img { max-width: 300px; max-height: 100px; border: 1px solid #e0e0e0; border-radius: 4px; }
  .multi-sig-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
  .multi-sig-slot { flex: 0 0 calc(50% - 8px); text-align: center; }
  .multi-sig-label { font-size: 9pt; font-weight: 600; color: #444; margin-top: 4px; }
  .multi-sig-date { font-size: 8pt; color: #888; }
  .photo-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .photo-img { width: 120px; height: 90px; object-fit: cover; border: 1px solid #e0e0e0; border-radius: 4px; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; padding: 8px 15mm; border-top: 1px solid #e0e0e0; }
  @media print { .no-print { display: none; } }
</style></head><body>`;

  // Watermark
  if (showWatermark) {
    html += buildWatermark(watermarkText);
  }

  // Company header
  if (showCompanyHeader && company && (company.companyName || company.companyLogo)) {
    html += buildCompanyHeader(company, accent, headerLayout);
  }

  html += `<div class="header">
    <div><h1>${esc(template.icon || '📋')} ${esc(template.name)}</h1>
    <div style="font-size:${fontSize.meta};color:#666;margin-top:4px">${esc(template.description || '')}</div></div>
    <div class="meta">
      <div>Ausgefüllt: ${new Date(submission.completedAt || submission.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      <div>Von: ${esc(submission.filledByName || '—')}</div>
      <div>ID: ${esc(submission.id)}</div>
    </div></div>`;

  template.pages.forEach((page) => {
    if (template.pages.length > 1) {
      html += `<div class="page-title">${esc(page.title)}</div>`;
    }
    const _inputFields = page.fields.filter(f => !['heading', 'divider', 'info'].includes(f.type));
    page.fields.forEach(f => {
      if (f.type === 'heading') {
        html += `<div style="font-size:12pt;font-weight:700;margin:12px 0 6px;color:#333">${esc(f.label)}</div>`;
      } else if (f.type === 'divider') {
        html += `<hr style="border:none;border-top:1px solid #ddd;margin:10px 0">`;
      } else if (f.type === 'info') {
        html += `<div style="background:#f0f4ff;padding:8px 12px;border-radius:4px;font-size:10pt;margin:6px 0;color:#555">${esc(f.content || '')}</div>`;
      } else if (f.type === 'signature') {
        const sig = submission.data?.[f.id];
        const isMulti = f.multiSignature && Array.isArray(f.signatureSlots) && f.signatureSlots.length > 0;
        if (isMulti) {
          const multiVal = (typeof sig === 'object' && sig !== null && !Array.isArray(sig)) ? sig : {};
          const dateStr = new Date(submission.completedAt || submission.createdAt).toLocaleDateString('de-DE');
          html += `<div class="signature-section"><div style="font-weight:600;font-size:10pt;margin-bottom:4px">${esc(f.label)}</div>`;
          html += `<hr style="border:none;border-top:1px solid #ddd;margin:4px 0 8px">`;
          html += `<div class="multi-sig-grid">`;
          f.signatureSlots.forEach(slot => {
            html += `<div class="multi-sig-slot">`;
            if (multiVal[slot.id]) {
              html += `<img src="${multiVal[slot.id]}" class="signature-img" />`;
            } else {
              html += `<div style="height:60px;border:1px dashed #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:9pt">Nicht unterschrieben</div>`;
            }
            html += `<div class="multi-sig-label">${esc(slot.label)}</div>`;
            if (multiVal[slot.id]) html += `<div class="multi-sig-date">${dateStr}</div>`;
            html += `</div>`;
          });
          html += `</div></div>`;
        } else {
          html += `<div class="signature-section"><div class="field-row"><div class="field-label">${esc(f.label)}${f.required ? ' <span class="required">*</span>' : ''}</div><div class="field-value">`;
          if (sig) html += `<img src="${sig}" class="signature-img" />`;
          else html += '—';
          html += `</div></div></div>`;
        }
      } else if (f.type === 'photo') {
        const photos = (() => { const v = submission.data?.[f.id]; return Array.isArray(v) ? v : v ? [v] : []; })();
        html += `<div class="field-row"><div class="field-label">${esc(f.label)}</div><div class="field-value">`;
        if (photos.length) {
          html += `<div class="photo-grid">${photos.map(p => `<img src="${p}" class="photo-img" />`).join('')}</div>`;
        } else {
          html += '—';
        }
        html += `</div></div>`;
      } else {
        const val = formatValue(f, submission.data?.[f.id]);
        html += `<div class="field-row"><div class="field-label">${esc(f.label || f.type)}${f.required ? ' <span class="required">*</span>' : ''}</div><div class="field-value">${esc(val)}</div></div>`;
      }
    });
  });

  const footerParts = [];
  if (company?.companyName) footerParts.push(esc(company.companyName));
  footerParts.push(esc(footer));
  footerParts.push(new Date().toLocaleDateString('de-DE'));
  html += `<div class="footer">${footerParts.join(' \u00b7 ')}</div>`;
  html += `</body></html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) { dialog.alert({ title: 'Pop-up blockiert', message: 'Bitte Pop-ups für diese Seite erlauben.' }); return; }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => { try { printWindow.print(); } catch { /* print dialog cancelled or blocked */ } }, 300);
  };
};
