// ═══ FEATURE: Online/Offline Detection Hook (S04) ═══

import { useState, useEffect, useCallback } from 'react';
import { syncQueue } from '../lib/syncQueue';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, failed: 0, processing: false, total: 0 });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncQueue.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync queue status
    const unsubscribe = syncQueue.subscribe((status) => {
      setSyncStatus(status);
    });

    // Get initial sync status
    syncQueue.getQueueStatus().then(setSyncStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const retryFailed = useCallback(() => {
    syncQueue.retryFailed();
  }, []);

  const triggerSync = useCallback(() => {
    syncQueue.processQueue();
  }, []);

  return {
    isOnline,
    wasOffline,
    syncStatus,
    retryFailed,
    triggerSync,
  };
}
