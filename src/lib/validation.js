// ═══ FEATURE: Conditional Logic Engine (Chat F.1) ═══
export const evaluateConditions = (conditions, conditionLogic, formData) => {
  if (!conditions || conditions.length === 0) return true;
  const results = conditions.map(c => {
    const val = formData[c.field];
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'notEquals': return val !== c.value;
      case 'contains': return String(val || '').includes(c.value);
      case 'gt': return Number(val) > Number(c.value);
      case 'lt': return Number(val) < Number(c.value);
      case 'isEmpty': return !val || val === '' || (Array.isArray(val) && val.length === 0);
      case 'isNotEmpty': return val && val !== '' && !(Array.isArray(val) && val.length === 0);
      default: return true;
    }
  });
  const logic = conditionLogic || 'AND';
  const passes = logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  const action = conditions[0]?.action || 'show';
  if (action === 'show') return passes;
  if (action === 'hide') return !passes;
  return true;
};

// ═══ FEATURE: Validation Engine (Chat F.1) ═══
export const validateField = (field, value, formData) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  const v = field.validation || {};
  if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} ist erforderlich`;
  }
  if (!value && !field.required) return null;
  if (field.type === 'text' || field.type === 'textarea') {
    if (v.minLength && String(value).length < v.minLength) return `Mindestens ${v.minLength} Zeichen`;
    if (v.maxLength && String(value).length > v.maxLength) return `Maximal ${v.maxLength} Zeichen`;
    if (v.pattern && !new RegExp(v.pattern).test(value)) return `Ungültiges Format`;
  }
  if (field.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return 'Bitte eine Zahl eingeben';
    if (v.min !== undefined && n < v.min) return `Minimum: ${v.min}`;
    if (v.max !== undefined && n > v.max) return `Maximum: ${v.max}`;
  }
  if (field.type === 'checklist' && field.required) {
    const checked = Object.values(value || {}).filter(v => v?.checked).length;
    if (checked === 0) return 'Mindestens ein Punkt muss geprüft werden';
  }
  return null;
};

export const validatePage = (page, formData) => {
  const errors = {};
  const inputFields = (page?.fields || []).filter(f => !['heading', 'divider', 'info'].includes(f.type));
  inputFields.forEach(f => {
    if (f.conditions && !evaluateConditions(f.conditions, f.conditionLogic, formData)) return;
    const err = validateField(f, formData[f.id], formData);
    if (err) errors[f.id] = err;
  });
  return errors;
};
