// ═══ FEATURE: Conditional Logic Engine (Chat F.1) ═══
const evalConditionResults = (conditions, conditionLogic, formData) => {
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
  return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
};

// Group conditions by action and evaluate each group
const groupConditionsByAction = (conditions) => {
  const groups = {};
  conditions.forEach(c => {
    const action = c.action || 'show';
    if (!groups[action]) groups[action] = [];
    groups[action].push(c);
  });
  return groups;
};

export const evaluateConditions = (conditions, conditionLogic, formData) => {
  if (!conditions || conditions.length === 0) return true;
  const groups = groupConditionsByAction(conditions);
  // If any "hide" condition is met, field is hidden
  if (groups.hide) {
    const hidePasses = evalConditionResults(groups.hide, conditionLogic, formData);
    if (hidePasses) return false;
  }
  // If "show" conditions exist and are not met, field is hidden
  if (groups.show) {
    const showPasses = evalConditionResults(groups.show, conditionLogic, formData);
    if (!showPasses) return false;
  }
  return true;
};

export const isConditionallyRequired = (field, formData) => {
  if (!field.conditions || field.conditions.length === 0) return false;
  const groups = groupConditionsByAction(field.conditions);
  if (!groups.require) return false;
  return evalConditionResults(groups.require, field.conditionLogic, formData);
};

export const isConditionallyDisabled = (field, formData) => {
  if (!field.conditions || field.conditions.length === 0) return false;
  const groups = groupConditionsByAction(field.conditions);
  if (!groups.disable) return false;
  return evalConditionResults(groups.disable, field.conditionLogic, formData);
};

// Helper: blank canvas PNG data URLs are typically <2000 chars; real signatures are >3000
const isBlankSignature = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return true;
  return dataUrl.length < 2000;
};

// ═══ FEATURE: Validation Engine (Chat F.1) ═══
export const validateField = (field, value, formData) => {
  if (field.conditions && !evaluateConditions(field.conditions, field.conditionLogic, formData)) return null;
  if (isConditionallyDisabled(field, formData)) return null;
  const v = field.validation || {};
  const required = field.required || isConditionallyRequired(field, formData);
  if (required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} ist erforderlich`;
  }
  if (!value && !field.required) return null;
  if (field.type === 'text' || field.type === 'textarea') {
    if (v.minLength && String(value).length < v.minLength) return `Mindestens ${v.minLength} Zeichen`;
    if (v.maxLength && String(value).length > v.maxLength) return `Maximal ${v.maxLength} Zeichen`;
    if (v.pattern) { try { if (!new RegExp(v.pattern).test(value)) return `Ungültiges Format`; } catch { /* ungültiges Pattern ignorieren */ } }
  }
  if (field.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return 'Bitte eine Zahl eingeben';
    if (v.min !== undefined && n < v.min) return `Minimum: ${v.min}`;
    if (v.max !== undefined && n > v.max) return `Maximum: ${v.max}`;
  }
  if (field.type === 'checkbox' && Array.isArray(value)) {
    if (v.minSelect && value.length < v.minSelect) return `Mindestens ${v.minSelect} auswählen`;
    if (v.maxSelect && value.length > v.maxSelect) return `Maximal ${v.maxSelect} auswählen`;
  }
  if (field.type === 'checklist' && field.required) {
    const checked = Object.values(value || {}).filter(v => v?.checked).length;
    if (checked === 0) return 'Mindestens ein Punkt muss geprüft werden';
  }
  if (field.type === 'signature') {
    // Multi-Signatur mode
    if (field.multiSignature && Array.isArray(field.signatureSlots) && field.signatureSlots.length > 0) {
      const multiVal = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};
      for (const slot of field.signatureSlots) {
        if (slot.required && isBlankSignature(multiVal[slot.id])) {
          return `Unterschrift '${slot.label}' fehlt`;
        }
      }
      return null;
    }
    // Single mode (backward compatible)
    if (required && isBlankSignature(value)) {
      return 'Unterschrift ist erforderlich';
    }
  }
  if (field.type === 'photo' && field.required) {
    const photos = Array.isArray(value) ? value : value ? [value] : [];
    if (photos.length === 0) return 'Mindestens ein Foto erforderlich';
  }
  if (field.type === 'repeater' && field.required) {
    if (!Array.isArray(value) || value.length === 0) return 'Mindestens ein Eintrag erforderlich';
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
