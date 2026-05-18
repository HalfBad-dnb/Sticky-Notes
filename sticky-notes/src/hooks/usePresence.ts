import { useEffect } from 'react';

export function usePresence(userId: string | null, currentUsername: string | null) {
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/presence/online/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    const handleOffline = () => {
      if (userId) {
        navigator.sendBeacon(`/api/presence/offline/${userId}`, JSON.stringify({}));
      }
    };

    window.addEventListener('beforeunload', handleOffline);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleOffline();
    });

    return () => {
      window.removeEventListener('beforeunload', handleOffline);
      handleOffline();
    };
  }, [userId, currentUsername]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'user') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
}
