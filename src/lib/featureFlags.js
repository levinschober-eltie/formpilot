// ═══ Feature Flags — Tier-basierte Flags ═══
import { getTierLimits } from './tierService';

const FLAGS = {
  fp_billing: () => true,                                       // Always show billing UI (for upgrades)
  fp_api_keys: (plan) => getTierLimits(plan).apiAccess,
  fp_webhooks: (plan) => getTierLimits(plan).maxWebhooks > 0,
  fp_white_label: (plan) => getTierLimits(plan).whiteLabel,
  fp_ai_generator: (plan) => getTierLimits(plan).maxAiCreditsPerMonth > 0,
  fp_team_invite: () => true,                                   // Always enabled
  fp_onboarding: () => true,                                    // Always enabled
  fp_custom_domain: (plan) => getTierLimits(plan).customDomain,
};

export function isFeatureEnabled(flag, plan = 'free') {
  const check = FLAGS[flag];
  if (!check) return false;
  return check(plan);
}

export function getEnabledFeatures(plan = 'free') {
  const enabled = {};
  for (const [flag, check] of Object.entries(FLAGS)) {
    enabled[flag] = check(plan);
  }
  return enabled;
}
