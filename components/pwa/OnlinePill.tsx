'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function OnlinePill() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize after mount to avoid hydration mismatch
    Promise.resolve().then(() => {
      setIsOnline(navigator.onLine);
      setMounted(true);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium transition-colors ${
        isOnline
          ? 'bg-positive-mint text-positive-emerald border border-positive-border'
          : 'bg-negative-tint text-negative-red border border-negative-border'
      }`}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'En ligne' : 'Hors ligne'}
    >
      {isOnline ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
    </div>
  );
}
