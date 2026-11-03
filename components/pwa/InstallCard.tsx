'use client';

import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Initialize
    Promise.resolve().then(() => {
      // Check if already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Detect iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (iOS) {
        setIsIOS(true);
      }
    });

    // Capture beforeinstallprompt (not available on iOS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS or already prompted
      if (isIOS) {
        setShowIOSHint(true);
        setTimeout(() => setShowIOSHint(false), 5000);
      }
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if no prompt available and not iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="relative flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-surface hover:bg-surface-subtle text-xs font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
        aria-label="Installer WINNIT OS"
      >
        <Download className="w-3.5 h-3.5 text-brand-lime" />
        <span className="hidden sm:inline">Installer</span>
      </button>

      {/* iOS hint */}
      {showIOSHint && isIOS && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-ink text-ink-inverted rounded-lg p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <Share className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold mb-1">Installer WINNIT OS</p>
              <p className="text-xs opacity-90">
                Appuyez sur <strong>Partager</strong> puis <strong>Sur l&apos;écran d&apos;accueil</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSHint(false)}
              className="text-ink-inverted/60 hover:text-ink-inverted"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
