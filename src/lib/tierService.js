// ═══ FormPilot Tier Service — Feature-Gating nach Subscription-Plan ═══

const TIER_LIMITS = {
  free: {
    maxUsers: 2,
    maxTemplates: 5,
    maxSubmissionsPerMonth: 50,
    maxAiCreditsPerMonth: 5,
    maxStorageMB: 100,
    apiAccess: false,
    apiReadOnly: false,
    maxWebhooks: 0,
    whiteLabel: false,
    pdfBranding: 'basic',   // basic | header | full
    customDomain: false,
  },
  pro: {
    maxUsers: 10,
    maxTemplates: 50,
    maxSubmissionsPerMonth: 500,
    maxAiCreditsPerMonth: 50,
    maxStorageMB: 2048,
    apiAccess: true,
    apiReadOnly: true,
    maxWebhooks: 3,
    whiteLabel: false,
    pdfBranding: 'header',
    customDomain: false,
  },
  business: {
    maxUsers: Infinity,
    maxTemplates: Infinity,
    maxSubmissionsPerMonth: 5000,
    maxAiCreditsPerMonth: 200,
    maxStorageMB: 20480,
    apiAccess: true,
    apiReadOnly: false,
    maxWebhooks: 20,
    whiteLabel: true,
    pdfBranding: 'full',
    customDomain: true,
  },
  enterprise: {
    maxUsers: Infinity,
    maxTemplates: Infinity,
    maxSubmissionsPerMonth: Infinity,
    maxAiCreditsPerMonth: Infinity,
    maxStorageMB: Infinity,
    apiAccess: true,
    apiReadOnly: false,
    maxWebhooks: Infinity,
    whiteLabel: true,
    pdfBranding: 'full',
    customDomain: true,
  },
  sdk: {
    // Internal plan for Levin's projects — Business features + higher API limits
    maxUsers: Infinity,
    maxTemplates: Infinity,
    maxSubmissionsPerMonth: Infinity,
    maxAiCreditsPerMonth: 500,
    maxStorageMB: 51200,
    apiAccess: true,
    apiReadOnly: false,
    maxWebhooks: Infinity,
    whiteLabel: true,
    pdfBranding: 'full',
    customDomain: true,
  },
};

export function getTierLimits(plan = 'free') {
  return TIER_LIMITS[plan] || TIER_LIMITS.free;
}

export function canCreateTemplate(plan, currentCount) {
  const limits = getTierLimits(plan);
  return currentCount < limits.maxTemplates;
}

export function canSubmitForm(plan, currentMonthCount) {
  const limits = getTierLimits(plan);
  return currentMonthCount < limits.maxSubmissionsPerMonth;
}

export function canUseAI(plan, currentMonthCredits) {
  const limits = getTierLimits(plan);
  return currentMonthCredits < limits.maxAiCreditsPerMonth;
}

export function canAccessAPI(plan) {
  const limits = getTierLimits(plan);
  return limits.apiAccess;
}

export function canUseWebhooks(plan, currentCount) {
  const limits = getTierLimits(plan);
  return currentCount < limits.maxWebhooks;
}

export function canUseWhiteLabel(plan) {
  return getTierLimits(plan).whiteLabel;
}

export function getUsagePercentage(plan, field, currentValue) {
  const limits = getTierLimits(plan);
  const max = limits[field];
  if (max === Infinity) return 0;
  return Math.min(100, Math.round((currentValue / max) * 100));
}

export function isAtLimit(plan, field, currentValue) {
  return getUsagePercentage(plan, field, currentValue) >= 100;
}

export function isNearLimit(plan, field, currentValue) {
  return getUsagePercentage(plan, field, currentValue) >= 80;
}

// Get the next plan upgrade from current
export function getUpgradePlan(currentPlan) {
  const upgrades = { free: 'pro', pro: 'business', business: 'enterprise' };
  return upgrades[currentPlan] || null;
}

// Get display name for plan
export function getPlanDisplayName(plan) {
  const names = { free: 'Free', pro: 'Pro', business: 'Business', enterprise: 'Enterprise', sdk: 'SDK' };
  return names[plan] || plan;
}

// Get price for plan (monthly EUR)
export function getPlanPrice(plan) {
  const prices = { free: 0, pro: 29, business: 79, enterprise: null, sdk: 0 };
  return prices[plan] ?? null;
}
