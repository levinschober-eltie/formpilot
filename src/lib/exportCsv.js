// ═══ FEATURE: CSV Export ═══

export const exportSubmissionsCsv = (submissions, allTemplates) => {
  if (!submissions.length) return;

  const templateMap = {};
  allTemplates.forEach(t => { templateMap[t.id] = t; });

  // Collect all unique field IDs across all submissions
  // For multi-signature fields, create separate columns per slot
  const fieldMap = new Map(); // id -> label
  const multiSigSlots = new Map(); // fieldId -> [{id, label, fieldLabel}]
  submissions.forEach(sub => {
    const tpl = templateMap[sub.templateId];
    if (!tpl) return;
    tpl.pages.flatMap(p => p.fields).forEach(f => {
      if (['heading', 'divider', 'info'].includes(f.type)) return;
      if (f.type === 'signature' && f.multiSignature && Array.isArray(f.signatureSlots) && f.signatureSlots.length > 0) {
        // Multi-signature: one column per slot
        if (!multiSigSlots.has(f.id)) {
          multiSigSlots.set(f.id, f.signatureSlots.map(slot => ({
            id: slot.id,
            label: slot.label,
            fieldLabel: f.label || f.type,
          })));
        }
      } else {
        fieldMap.set(f.id, f.label || f.type);
      }
    });
  });

  // Build header columns: base fields + multi-sig slot columns
  const multiSigHeaders = [];
  const multiSigAccessors = []; // { fieldId, slotId }
  multiSigSlots.forEach((slots, fieldId) => {
    slots.forEach(slot => {
      multiSigHeaders.push(`${slot.fieldLabel} - ${slot.label}`);
      multiSigAccessors.push({ fieldId, slotId: slot.id });
    });
  });

  const headers = ['ID', 'Formular', 'Status', 'Ausgefüllt von', 'Erstellt am', 'Abgeschlossen am', ...fieldMap.values(), ...multiSigHeaders];
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
    const multiSigValues = multiSigAccessors.map(({ fieldId, slotId }) => {
      const val = sub.data?.[fieldId];
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return val[slotId] ? '[Unterschrift vorhanden]' : '';
      }
      return '';
    });
    return [...base, ...fieldValues, ...multiSigValues];
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
