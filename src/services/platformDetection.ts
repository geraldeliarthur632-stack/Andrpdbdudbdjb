// Platform and Operating System Detection Service
// Detects Android, iOS (iPhone/iPad), or Desktop/PC/Web dynamically

export type DetectedOS = 'android' | 'ios' | 'desktop';

export interface PlatformDetails {
  os: DetectedOS;
  osName: string; // 'Android', 'iOS (iPhone/iPad)', 'Computador (PC / Mac)'
  deviceLabel: string; // 'Android', 'iPhone / iPad', 'Computador'
  storeName: string; // 'Google Play & Chrome', 'App Store & Safari', 'Microsoft Windows & Chrome Web'
  storeBadge: string; // 'Google Play', 'App Store', 'PC / Web App'
  shortButtonText: string; // 'Baixar Android', 'Baixar iOS', 'Baixar no PC'
  fullButtonText: string; // 'Baixar no Android', 'Instalar no iPhone/iPad', 'Instalar no PC'
  tooltipTitle: string;
  tooltipDescription: string;
  quickStepTip: string;
  recommendedBrowser: string;
}

/**
 * Detects the user operating system and platform dynamically from browser navigator
 */
export function detectUserPlatform(): PlatformDetails {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return getDesktopPlatformDetails();
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';

  // Check iOS (iPhone, iPad, iPod, or iPadOS masquerading as MacIntel with touch support)
  const isIos =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/MacIntel/i.test(platform) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  if (isIos) {
    const isIPad = /iPad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const deviceLabel = isIPad ? 'iPad (iOS)' : 'iPhone (iOS)';

    return {
      os: 'ios',
      osName: 'iOS (Apple)',
      deviceLabel,
      storeName: 'App Store & Safari Web App',
      storeBadge: 'App Store',
      shortButtonText: 'Baixar no iOS',
      fullButtonText: `Instalar no ${isIPad ? 'iPad' : 'iPhone'}`,
      tooltipTitle: `Dispositivo Apple (${deviceLabel}) Detectado`,
      tooltipDescription:
        'Instale o Trilha do Saber na tela de início do seu iPhone ou iPad para abrir em tela cheia como um app nativo da App Store.',
      quickStepTip: 'No Safari: toque no botão Compartilhar (⎋) e escolha "Adicionar à Tela de Início (+)".',
      recommendedBrowser: 'Safari',
    };
  }

  // Check Android
  const isAndroid = /Android/i.test(userAgent) || /Android/i.test(platform);
  if (isAndroid) {
    return {
      os: 'android',
      osName: 'Android (Google)',
      deviceLabel: 'Android',
      storeName: 'Google Play & Chrome',
      storeBadge: 'Google Play',
      shortButtonText: 'Instalar no Android',
      fullButtonText: 'Instalar no Android (Google Play)',
      tooltipTitle: 'Dispositivo Android Detectado',
      tooltipDescription:
        'Instale o aplicativo oficial Trilha do Saber na Google Play Store ou adicione direto à sua tela inicial pelo navegador com 1 toque!',
      quickStepTip: 'Disponível na Google Play Store oficial ou via Chrome ("Instalar aplicativo").',
      recommendedBrowser: 'Google Play / Chrome',
    };
  }

  // Default to Desktop / PC / Mac / Linux
  return getDesktopPlatformDetails();
}

/**
 * Checks if the app is currently running inside the Android native container
 */
export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /TrilhaDoSaberAndroid/i.test(navigator.userAgent);
}

function getDesktopPlatformDetails(): PlatformDetails {
  return {
    os: 'desktop',
    osName: 'Computador (Desktop / Web)',
    deviceLabel: 'Computador / PC',
    storeName: 'Windows / Mac / Web App',
    storeBadge: 'PC / Web App',
    shortButtonText: 'Baixar no PC',
    fullButtonText: 'Instalar no Computador',
    tooltipTitle: 'Computador / Desktop Detectado',
    tooltipDescription:
      'Instale o Trilha do Saber no seu computador (Windows, macOS ou Linux) para abrir em uma janela independente e estudar offline sem distrações.',
    quickStepTip: 'No Chrome ou Edge: clique no ícone de instalar (💻) na barra de endereços ou no menu ⋮.',
    recommendedBrowser: 'Google Chrome / Microsoft Edge',
  };
}
