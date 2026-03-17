// ═══ FEATURE: CSV Export ═══

export const exportSubmissionsCsv = (submissions, allTemplates) => {
  if (!submissions.length) return;

  const templateMap = {};
  allTemplates.forEach(t => { templateMap[t.id] = t; });

  // Collect all unique field IDs across all submissions
  const fieldMap = new Map();
  submissions.forEach(sub => {
    const tpl = templateMap[sub.templateId];
    if (!tpl) return;
    tpl.pages.flatMap(p => p.fields).forEach(f => {
      if (!['heading', 'divider', 'info'].includes(f.type)) {
        fieldMap.set(f.id, f.label || f.type);
      }
    });
  });

  const headers = ['ID', 'Formular', 'Status', 'Ausgefüllt von', 'Erstellt am', 'Abgeschlossen am', ...fieldMap.values()];
  const fieldIds = [...fieldMap.keys()];

  // Feld-Typ-Map für lesbare Formatierung
  const fieldTypeMap = {};
  allTemplates.forEach(t => t.pages?.flatMap(p => p.fields).forEach(f => { fieldTypeMap[f.id] = f; }));

  const formatCsvValue = (val, field) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'Ja' : 'Nein';
    if (Array.isArray(val)) return val.join('; ');
    if (typeof val === 'object') {
      // Checklist: {id: {checked, note}}
      if (field?.type === 'checklist') {
        return Object.entries(val).map(([key, v]) => {
          const item = field.items?.find(i => i.id === key);
          return `${v?.checked ? '✓' : '✗'} ${item?.label || key}${v?.note ? ` (${v.note})` : ''}`;
        }).join('; ');
      }
      return JSON.stringify(val);
    }
    return String(val);
  };

  const rows = submissions.map(sub => {
    const tpl = templateMap[sub.templateId];
    const base = [
      sub.id,
      tpl?.name || sub.templateId,
      sub.status,
      sub.filledByName || '',
      sub.createdAt || '',
      sub.completedAt || '',
    ];
    const fieldValues = fieldIds.map(fid => formatCsvValue(sub.data?.[fid], fieldTypeMap[fid]));
    return [...base, ...fieldValues];
  });

  const escape = (v) => {
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };

  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formpilot_export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
