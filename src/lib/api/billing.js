// ═══ API Client: Billing & Subscription ═══
import { apiFetch } from './client';

export async function getSubscription() {
  const { subscription } = await apiFetch('/api/billing/subscription');
  return subscription;
}

export async function getUsage() {
  const { usage } = await apiFetch('/api/billing/usage');
  return usage;
}

export async function createCheckout(plan) {
  const { url } = await apiFetch('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  return url;
}

export async function createPortal() {
  const { url } = await apiFetch('/api/billing/portal', {
    method: 'POST',
  });
  return url;
}
