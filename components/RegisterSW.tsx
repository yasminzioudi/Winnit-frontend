'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    // Only register in production
    if (
      process.env.NODE_ENV !== 'production' ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates on load
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              showUpdateNotification(newWorker);
            }
          });
        });

        // Listen for controller change (after skip waiting)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    };

    const showUpdateNotification = (worker: ServiceWorker) => {
      // Create a simple toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0a0a0a;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        font-family: system-ui, sans-serif;
        font-size: 14px;
      `;

      toast.innerHTML = `
        <span>Nouvelle version disponible</span>
        <button id="reload-btn" style="
          background: #a3e635;
          color: #0a0a0a;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        ">Recharger</button>
      `;

      document.body.appendChild(toast);

      const reloadBtn = document.getElementById('reload-btn');
      reloadBtn?.addEventListener('click', () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
        toast.remove();
      });

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 10000);
    };

    registerServiceWorker();

    // Check for updates every hour
    const interval = setInterval(() => {
      registration?.update();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
