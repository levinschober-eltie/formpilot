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
    const fieldValues = fieldIds.map(fid => {
      const val = sub.data?.[fid];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });
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
