import { useState, useEffect, useCallback } from 'react';
import { getSubscription, getUsage } from '../lib/api/billing';
import { isApiConfigured } from '../lib/api/client';

// ═══ HOOK: Subscription + Usage Data ═══
export function useSubscription() {
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'active' });
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const [sub, usg] = await Promise.all([getSubscription(), getUsage()]);
      setSubscription(sub);
      setUsage(usg);
    } catch (e) {
      console.error('[FormPilot] Subscription load failed:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { subscription, usage, loading, refresh };
}
