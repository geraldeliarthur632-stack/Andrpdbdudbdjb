import React, { useState, useEffect, useRef } from 'react';
import { detectUserPlatform, PlatformDetails, DetectedOS } from '../services/platformDetection';
import { soundEffects } from '../services/soundEffects';
import { pwaService } from '../services/pwaService';
import { Download, Sparkles, ChevronRight, CheckCircle2, HelpCircle, X, ExternalLink } from 'lucide-react';

// ==========================================
// OFFICIAL STORE & PLATFORM SVG ICONS
// ==========================================

export const GooglePlayStoreIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.609 1.814L13.792 12 3.61 22.186A2.296 2.296 0 013 20.562V3.438c0-.62.222-1.196.609-1.624z"
      fill="#00C1A6"
    />
    <path
      d="M17.204 8.588L4.697 1.367a2.22 2.22 0 00-1.088-.447L13.792 12l3.412-3.412z"
      fill="#00A0FF"
    />
    <path
      d="M17.204 15.412L13.792 12 3.61 22.08a2.22 2.22 0 001.087-.447l12.507-7.221z"
      fill="#FF3333"
    />
    <path
      d="M21.758 11.215l-4.554-2.627L13.792 12l3.412 3.412 4.554-2.627a1.536 1.536 0 000-2.57z"
      fill="#FFD400"
    />
  </svg>
);

export const AppleStoreIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.61-11.23-20.73-14.78-33.34-3.55-12.61-5.33-24.3-5.33-35.07 0-14.28 3.55-25.96 10.65-35.06 7.1-9.09 16.02-13.72 26.77-13.88 5.11 0 10.74 1.34 16.9 4.02 6.16 2.68 10.14 4.08 11.95 4.21 2.45-.4 6.78-1.96 12.98-4.68 6.2-2.73 11.89-3.95 17.06-3.68 12.61.67 22.56 5.63 29.83 14.88-11.05 6.69-16.45 15.89-16.19 27.61.34 9.17 3.86 16.89 10.56 23.14 6.7 6.25 14.77 9.8 24.22 10.65-2.22 6.74-4.83 13.52-7.82 20.33zM119.22 31.84c0-7.72 2.76-14.97 8.28-21.75 5.52-6.78 12.28-10.87 20.28-12.27.23 1.08.34 2.16.34 3.24 0 7.6-2.88 15.01-8.63 22.23-5.75 7.22-12.87 11.45-21.36 12.68-.34-1.39-.51-2.77-.51-4.13z" />
  </svg>
);

export const DesktopStoreIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const PlatformStoreIcon: React.FC<{ os: DetectedOS; className?: string }> = ({ os, className = 'w-4 h-4' }) => {
  if (os === 'android') return <GooglePlayStoreIcon className={className} />;
  if (os === 'ios') return <AppleStoreIcon className={className} />;
  return <DesktopStoreIcon className={className} />;
};

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface DownloadAppButtonProps {
  onOpenInstallModal: () => void;
  variant?: 'header' | 'banner' | 'card' | 'badge-only';
  className?: string;
  showTooltip?: boolean;
}

export const PLAY_STORE_URL =
  'https://play.google.com/store/search?q=Trilha%20do%20Saber%20-%20Estude%20F%C3%A1cil&c=apps';

export const DownloadAppButton: React.FC<DownloadAppButtonProps> = () => {
  return null;
};

const _UnusedDownloadAppButton: React.FC<DownloadAppButtonProps> = ({
  onOpenInstallModal,
  variant = 'header',
  className = '',
  showTooltip = true,
}) => {
  const [platform, setPlatform] = useState<PlatformDetails>(() => detectUserPlatform());
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(pwaService.hasNativePrompt());
  const [isInstalled, setIsInstalled] = useState(pwaService.isStandalone());
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setPlatform(detectUserPlatform());

    const unsubscribe = pwaService.subscribe((promptAvailable) => {
      setHasNativePrompt(promptAvailable);
      setIsInstalled(pwaService.isStandalone());
    });

    return () => {
      unsubscribe();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Handle outside click to close tooltip on mobile touch
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = window.setTimeout(() => {
      setIsTooltipVisible(false);
    }, 250);
  };

  // Instalação automática se houver suporte nativo; caso contrário, abre o tutorial completo com suporte à Play Store
  const handleClick = async (e: React.MouseEvent) => {
    soundEffects.playClick();
    if (pwaService.hasNativePrompt()) {
      try {
        const outcome = await pwaService.promptNativeInstall();
        if (outcome === 'accepted') {
          soundEffects.playVictoryFanfare();
          setIsInstalled(true);
          return;
        }
      } catch (err) {
        console.warn('Falha no prompt nativo:', err);
      }
    }
    onOpenInstallModal();
  };

  // Button styles based on detected OS
  const getOsColors = () => {
    if (platform.os === 'android') {
      return {
        bg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-emerald-600/20',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        cardBg: 'from-emerald-50 via-teal-50 to-indigo-50 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700',
        accentText: 'text-emerald-700',
      };
    }
    if (platform.os === 'ios') {
      return {
        bg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white border-slate-700/60 shadow-slate-900/30',
        badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        cardBg: 'from-slate-50 via-indigo-50 to-purple-50 border-indigo-200',
        iconBg: 'bg-slate-200 text-slate-900',
        accentText: 'text-indigo-800',
      };
    }
    return {
      bg: 'bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-700 hover:from-indigo-500 hover:to-sky-500 text-white border-indigo-400/40 shadow-indigo-600/20',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      cardBg: 'from-indigo-50 via-sky-50 to-blue-50 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
      accentText: 'text-indigo-700',
    };
  };

  const colors = getOsColors();

  // ==========================================
  // EXPLANATORY TOOLTIP COMPONENT
  // ==========================================
  const renderTooltip = () => {
    if (!showTooltip || !isTooltipVisible) return null;

    return (
      <div
        className="absolute top-full mt-2.5 right-0 z-50 w-72 sm:w-80 bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        role="tooltip"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Little Arrow Indicator */}
        <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45" />

        <div className="relative space-y-2.5">
          {/* Header with Detected OS & Store Badge */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
                <PlatformStoreIcon os={platform.os} className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider block text-slate-900 leading-tight">
                  {platform.storeBadge}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {platform.osName}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badgeBg}`}>
              Detectado
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              {platform.tooltipTitle}
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {platform.tooltipDescription}
            </p>
          </div>

          {/* Quick Step Tip */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Dica de Instalação Rápida ({platform.recommendedBrowser}):</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium pl-4">
              {platform.quickStepTip}
            </p>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={handleClick}
            className={`w-full py-2 px-3 rounded-xl text-xs font-black transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${colors.bg}`}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{hasNativePrompt ? 'Instalar com 1 Toque' : platform.fullButtonText}</span>
          </button>

          {platform.os === 'android' && (
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEffects.playClick()}
              className="w-full py-1.5 px-3 rounded-xl text-[11px] font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <GooglePlayStoreIcon className="w-3.5 h-3.5" />
              <span>Instalar pela Google Play Store</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // HIDE WHEN INSTALLED
  // Se o aplicativo já estiver instalado, o botão de instalar some completamente
  // ==========================================
  if (isInstalled) {
    return null;
  }

  // ==========================================
  // VARIANT: HEADER (TOP BAR BUTTON)
  // ==========================================
  if (variant === 'header') {
    return (
      <div
        ref={containerRef}
        className="relative inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={handleClick}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm text-xs font-black transition active:scale-95 group cursor-pointer ${colors.bg} ${className}`}
          title={`${platform.fullButtonText} • ${platform.storeBadge} (${platform.tooltipTitle})`}
          aria-label={platform.fullButtonText}
        >
          <PlatformStoreIcon os={platform.os} className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
          <span className="text-xs font-black truncate max-w-[110px] sm:max-w-none">
            {platform.shortButtonText}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 ml-0.5 animate-pulse" />
        </button>

        {renderTooltip()}
      </div>
    );
  }

  // ==========================================
  // VARIANT: BANNER (HOME SCREEN HERO BANNER)
  // ==========================================
  if (variant === 'banner') {
    return (
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`rounded-3xl p-3.5 sm:p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-md flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <PlatformStoreIcon os={platform.os} className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  Baixar Aplicativo Oficial
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white shrink-0 flex items-center gap-1">
                  <PlatformStoreIcon os={platform.os} className="w-3 h-3" />
                  <span>{platform.storeBadge}</span>
                </span>
              </div>
              <p className="text-[11px] text-white/90 truncate">
                {platform.tooltipDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
            {platform.os === 'android' && (
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playClick()}
                className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="Abrir na Google Play Store"
              >
                <GooglePlayStoreIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Play Store</span>
                <ExternalLink className="w-3 h-3 text-white/80" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsTooltipVisible((prev) => !prev)}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Ver instruções de instalação para seu sistema operacional"
              aria-label="Ver instruções detalhadas"
            >
              <HelpCircle className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={handleClick}
              className="py-2 px-3.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-black text-xs transition active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>{hasNativePrompt ? 'Instalar Agora' : platform.shortButtonText}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>
        </div>

        {renderTooltip()}
      </div>
    );
  }

  // ==========================================
  // VARIANT: CARD (FOR SETTINGS / PROFILE)
  // ==========================================
  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <PlatformStoreIcon os={platform.os} className="w-4 h-4 text-slate-700" />
          <span>Aplicativo Trilha do Saber</span>
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badgeBg}`}>
          {platform.storeBadge}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 bg-indigo-950 shrink-0 shadow-xs flex items-center justify-center">
            <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {platform.fullButtonText}
            </h4>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {platform.quickStepTip}
            </p>
          </div>
        </div>

        <button
          onClick={handleClick}
          className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer ${colors.bg}`}
        >
          <PlatformStoreIcon os={platform.os} className="w-3.5 h-3.5" />
          <span>{hasNativePrompt ? 'Instalar' : platform.shortButtonText}</span>
        </button>
      </div>

      {platform.os === 'android' && (
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
          <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
            <GooglePlayStoreIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Disponível na Google Play Store</span>
          </span>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEffects.playClick()}
            className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline underline-offset-2"
          >
            <span>Abrir Play Store</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {renderTooltip()}
    </div>
  );
};
