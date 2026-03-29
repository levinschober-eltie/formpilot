// ═══ FEATURE: Activity Log — drop-in replacement for supabase/activity.js ═══
import { apiFetch } from './client';

export async function logActivity(action, entityType, entityId, details = {}) {
  try {
    await apiFetch('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      }),
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

export async function getActivityLog(filters = {}) {
  const params = new URLSearchParams();
  if (filters.entityType) params.set('entityType', filters.entityType);
  if (filters.entityId) params.set('entityId', filters.entityId);
  params.set('limit', String(filters.limit || 50));
  const qs = params.toString();
  const data = await apiFetch(`/api/activity${qs ? `?${qs}` : ''}`);
  return data || [];
}
