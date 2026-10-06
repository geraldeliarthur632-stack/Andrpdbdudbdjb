// PWA Install Prompt Service for Trilha do Saber

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallPromptListener = (hasPrompt: boolean) => void;

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isAppInstalled: boolean = false;
  private listeners: Set<InstallPromptListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Check if already running standalone or installed
    this.isAppInstalled = this.isStandalone();

    // If already standalone, persist in storage
    if (this.isAppInstalled) {
      try {
        localStorage.setItem('pwa_app_installed', 'true');
      } catch {}
    }

    // Check Chrome getInstalledRelatedApps API if available
    if (typeof navigator !== 'undefined' && 'getInstalledRelatedApps' in navigator) {
      try {
        (navigator as any)
          .getInstalledRelatedApps()
          .then((relatedApps: any[]) => {
            if (relatedApps && relatedApps.length > 0) {
              this.markAsInstalled();
            }
          })
          .catch(() => {});
      } catch {}
    }

    // Listen for display-mode media query changes (e.g. user launched standalone window)
    try {
      const standaloneMq = window.matchMedia('(display-mode: standalone)');
      const onModeChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.markAsInstalled();
        }
      };
      if (standaloneMq.addEventListener) {
        standaloneMq.addEventListener('change', onModeChange);
      } else if ((standaloneMq as any).addListener) {
        (standaloneMq as any).addListener(onModeChange);
      }
    } catch {}

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;

      // If the browser fires beforeinstallprompt and we are not in standalone display mode,
      // it means the browser considers the app not currently installed.
      const isPhysicallyStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (!isPhysicallyStandalone) {
        this.isAppInstalled = false;
        try {
          localStorage.removeItem('pwa_app_installed');
        } catch {}
      }

      this.notifyListeners(true);
      console.log('[PWA] Prompt de instalação nativo capturado e pronto para uso.');
    });

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.markAsInstalled();
      console.log('[PWA] Aplicativo instalado com sucesso.');
    });

    // Register Service Worker for offline capability & local push notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        const swUrl = new URL('sw.js', window.location.href).href;
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

            // Register periodic sync for daily study tip if supported by browser
            if ('periodicSync' in registration) {
              try {
                (registration as any).periodicSync
                  .register('daily-study-tip-sync', {
                    minInterval: 12 * 60 * 60 * 1000, // 12 hours
                  })
                  .catch(() => {});
              } catch {}
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration skipped or failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }

  public subscribe(listener: InstallPromptListener): () => void {
    this.listeners.add(listener);
    listener(this.hasNativePrompt());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(hasPrompt: boolean) {
    this.listeners.forEach((listener) => listener(hasPrompt));
  }

  public hasNativePrompt(): boolean {
    return this.deferredPrompt !== null;
  }

  public canInstall(): boolean {
    return this.hasNativePrompt() && !this.isStandalone();
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'not_available'> {
    return this.promptNativeInstall();
  }

  public markAsInstalled() {
    this.isAppInstalled = true;
    this.deferredPrompt = null;
    try {
      localStorage.setItem('pwa_app_installed', 'true');
    } catch {}
    this.notifyListeners(false);
  }

  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Direct standalone display modes
    const isDisplayStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches;

    // 2. iOS Safari standalone flag
    const isIosStandalone = (window.navigator as any).standalone === true;

    // 3. Android WebAPK / TWA referrer
    const isAndroidApp =
      typeof document !== 'undefined' && document.referrer.includes('android-app://');

    // 4. Native App wrappers (Capacitor / Cordova / React Native / Custom WebView)
    const isNativeWrapper =
      (window as any).Capacitor !== undefined ||
      (window as any).ReactNativeWebView !== undefined ||
      (window as any).isNativeApp === true ||
      (window as any).isAndroidApp === true;

    // 5. Query parameter indicative of installed shortcut
    const hasStandaloneQuery =
      window.location.search.includes('mode=standalone') ||
      window.location.search.includes('source=pwa');

    // 6. Stored installation flag
    let hasStoredInstalled = false;
    try {
      hasStoredInstalled = localStorage.getItem('pwa_app_installed') === 'true';
    } catch {}

    return Boolean(
      this.isAppInstalled ||
        isDisplayStandalone ||
        isIosStandalone ||
        isAndroidApp ||
        isNativeWrapper ||
        hasStandaloneQuery ||
        hasStoredInstalled
    );
  }

  public isInIframe(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  public openInDedicatedWindow() {
    if (typeof window === 'undefined') return;
    try {
      window.open(window.location.href, '_blank');
    } catch (e) {
      console.warn('Could not open standalone window', e);
    }
  }

  /**
   * Prompts the browser's native install dialog if available.
   * Returns:
   *  - 'accepted' if user clicked "Instalar"
   *  - 'dismissed' if user clicked "Cancelar"
   *  - 'not_available' if the browser doesn't have the prompt event ready (e.g. iOS or inside iframe)
   */
  public async promptNativeInstall(): Promise<'accepted' | 'dismissed' | 'not_available'> {
    if (!this.deferredPrompt) {
      return 'not_available';
    }

    try {
      const promptEvent = this.deferredPrompt;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        this.markAsInstalled();
      }
      this.deferredPrompt = null;
      this.notifyListeners(false);
      return choice.outcome;
    } catch (err) {
      console.warn('[PWA] Erro ao invocar prompt nativo:', err);
      this.deferredPrompt = null;
      this.notifyListeners(false);
      return 'not_available';
    }
  }
}

export const pwaService = new PWAService();
