/**
 * PWA Install Prompt Component
 * Shows install to home screen prompt for supported devices
 */
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Button from './Button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      console.log('PWA installed');
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (err) {
      console.error('Error during install:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-black text-white rounded-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs text-gray-300 mt-1">
              Install BENOVERTECH POS on your home screen for quick access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-800 rounded transition"
            aria-label="Dismiss"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="accent"
            size="sm"
            onClick={handleInstall}
            className="flex items-center justify-center flex-1"
          >
            <Download size={16} className="mr-2" />
            Install
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
