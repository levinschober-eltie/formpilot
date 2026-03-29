// ═══ FEATURE: Excel Export (SheetJS) ═══
// Lazy-load XLSX (~380KB) only when export is used
let _XLSX = null;
async function getXLSX() {
  if (!_XLSX) _XLSX = await import('xlsx');
  return _XLSX;
}

const sanitizeFormulaInjection = (val) => {
  if (typeof val === 'string' && /^[=+\-@\t\r]/.test(val)) {
    return "'" + val;
  }
  return val;
};

const formatExcelValue = (field, value) => {
  if (value === null || value === undefined || value === '') return '';
  switch (field.type) {
    case 'toggle':
      return value ? (field.labelOn || 'Ja') : (field.labelOff || 'Nein');
    case 'checkbox':
      return Array.isArray(value) ? sanitizeFormulaInjection(value.join(', ')) : sanitizeFormulaInjection(String(value));
    case 'radio':
    case 'select':
      return sanitizeFormulaInjection(String(value));
    case 'rating':
      if (field.ratingType === 'traffic') {
        const labels = { 1: 'Gut', 2: 'Mittel', 3: 'Schlecht' };
        return labels[value] || String(value);
      }
      return `${value}/${field.maxStars || 5}`;
    case 'checklist':
      if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value).map(([key, v]) => {
          const item = field.items?.find(i => i.id === key);
          return `${v?.checked ? '\u2611' : '\u2610'} ${item?.label || key}${v?.note ? ` \u2014 ${v.note}` : ''}`;
        }).join('\n');
      }
      return String(value);
    case 'signature':
      return value ? '[Unterschrift vorhanden]' : '';
    case 'photo': {
      const photos = Array.isArray(value) ? value : value ? [value] : [];
      return photos.length ? `[${photos.length} Foto(s) vorhanden]` : '';
    }
    case 'number':
      return typeof value === 'number' ? value : Number(value) || String(value);
    case 'date':
      return sanitizeFormulaInjection(value);
    case 'repeater':
      if (!Array.isArray(value) || value.length === 0) return '';
      return value.map((row, i) => {
        const cols = Object.entries(row).map(([, v]) => String(v || '')).join(' | ');
        return `#${i + 1}: ${cols}`;
      }).join('\n');
    default: {
      const result = String(value);
      return sanitizeFormulaInjection(result);
    }
  }
};

const getColumnWidths = (data) => {
  if (!data || data.length === 0) return [];
  const maxCols = Math.max(...data.map(r => r.length));
  const widths = [];
  for (let c = 0; c < maxCols; c++) {
    let max = 10;
    for (const row of data) {
      const val = row[c];
      if (val != null) {
        const len = String(val).split('\n').reduce((m, line) => Math.max(m, line.length), 0);
        max = Math.max(max, Math.min(len + 2, 60));
      }
    }
    widths.push({ wch: max });
  }
  return widths;
};

const triggerDownload = async (workbook, filename) => {
  const XLSX = await getXLSX();
  const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export a single submission to Excel (.xlsx)
 */
export const exportSubmissionToExcel = async (submission, template) => {
  if (!template || !submission) return;

  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  // Sheet 1: Formulardaten
  const rows = [];
  rows.push(['Feld', 'Wert']);

  template.pages.forEach((page) => {
    if (template.pages.length > 1) {
      rows.push([]);
      rows.push([`\u2550\u2550 ${page.title} \u2550\u2550`]);
    }
    page.fields.forEach((field) => {
      if (['heading', 'divider', 'info'].includes(field.type)) return;

      // Handle repeater as sub-table
      if (field.type === 'repeater' && Array.isArray(submission.data?.[field.id]) && submission.data[field.id].length > 0) {
        rows.push([field.label || field.type, '']);
        const repeaterData = submission.data[field.id];
        const subFields = field.subFields || [];
        if (subFields.length > 0) {
          rows.push(['', ...subFields.map(sf => sf.label || sf.id)]);
          repeaterData.forEach((row, i) => {
            rows.push([`  #${i + 1}`, ...subFields.map(sf => row[sf.id] != null ? String(row[sf.id]) : '')]);
          });
        } else if (repeaterData.length > 0) {
          const keys = Object.keys(repeaterData[0]);
          rows.push(['', ...keys]);
          repeaterData.forEach((row, i) => {
            rows.push([`  #${i + 1}`, ...keys.map(k => row[k] != null ? String(row[k]) : '')]);
          });
        }
        return;
      }

      const val = formatExcelValue(field, submission.data?.[field.id]);
      rows.push([field.label || field.type, val]);
    });
  });

  const ws1 = XLSX.utils.aoa_to_sheet(rows);
  ws1['!cols'] = getColumnWidths(rows);

  // Bold header row
  if (ws1['A1']) ws1['A1'].s = { font: { bold: true } };
  if (ws1['B1']) ws1['B1'].s = { font: { bold: true } };

  XLSX.utils.book_append_sheet(wb, ws1, 'Formulardaten');

  // Sheet 2: Metadaten
  const meta = [
    ['Eigenschaft', 'Wert'],
    ['Formular-Name', template.name || ''],
    ['Kategorie', template.category || ''],
    ['Version', template.version || '1'],
    ['Ausgef\u00fcllt von', submission.filledByName || ''],
    ['Erstellt am', submission.createdAt ? new Date(submission.createdAt).toLocaleString('de-DE') : ''],
    ['Abgeschlossen am', submission.completedAt ? new Date(submission.completedAt).toLocaleString('de-DE') : ''],
    ['Status', submission.status || ''],
    ['Submission-ID', submission.id || ''],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(meta);
  ws2['!cols'] = getColumnWidths(meta);
  XLSX.utils.book_append_sheet(wb, ws2, 'Metadaten');

  const safeName = (template.name || 'Formular').replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_').slice(0, 40);
  await triggerDownload(wb, `${safeName}_${submission.id}.xlsx`);
};

/**
 * Export multiple submissions of one template to Excel (.xlsx)
 * All submissions as rows in a single sheet
 */
export const exportMultipleToExcel = async (submissions, template) => {
  if (!template || !submissions || submissions.length === 0) return;

  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  const allFields = template.pages.flatMap(p => p.fields).filter(f => !['heading', 'divider', 'info'].includes(f.type));

  const headers = ['ID', 'Ausgef\u00fcllt von', 'Erstellt am', 'Status', ...allFields.map(f => f.label || f.type)];
  const rows = [headers];

  submissions.forEach((sub) => {
    const row = [
      sub.id || '',
      sub.filledByName || '',
      sub.createdAt ? new Date(sub.createdAt).toLocaleString('de-DE') : '',
      sub.status || '',
      ...allFields.map(f => formatExcelValue(f, sub.data?.[f.id])),
    ];
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = getColumnWidths(rows);

  // Bold header row
  for (let c = 0; c < headers.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellRef]) ws[cellRef].s = { font: { bold: true } };
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Alle Einträge');

  const safeName = (template.name || 'Formular').replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_').slice(0, 40);
  await triggerDownload(wb, `${safeName}_Bulk_${new Date().toISOString().split('T')[0]}.xlsx`);
};
