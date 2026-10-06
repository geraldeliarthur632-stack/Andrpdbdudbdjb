import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Check, Eye, Maximize2 } from 'lucide-react';
import { useScreenAdaptation } from '../hooks/useScreenAdaptation';
import { soundEffects } from '../services/soundEffects';

export type DisplayMode = 'auto' | 'phone' | 'tablet' | 'desktop';

interface PortraitContainerProps {
  children: React.ReactNode;
  themeClass?: string;
  displayMode?: DisplayMode;
  onToggleDisplayMode?: (mode: DisplayMode) => void;
}

export const PortraitContainer: React.FC<PortraitContainerProps> = ({
  children,
  themeClass = 'theme-blue',
  displayMode: initialDisplayMode = 'auto',
  onToggleDisplayMode,
}) => {
  const screen = useScreenAdaptation();
  const [currentMode, setCurrentMode] = useState<DisplayMode>(() => {
    try {
      const saved = localStorage.getItem('estudahud_display_mode_v2');
      if (saved === 'phone' || saved === 'tablet' || saved === 'desktop' || saved === 'auto') {
        return saved;
      }
    } catch {}
    return initialDisplayMode;
  });

  const [showAutoFitToast, setShowAutoFitToast] = useState<boolean>(true);

  // Auto dismiss toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAutoFitToast(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectMode = (mode: DisplayMode) => {
    soundEffects.playClick();
    setCurrentMode(mode);
    try {
      localStorage.setItem('estudahud_display_mode_v2', mode);
    } catch {}
    if (onToggleDisplayMode) {
      onToggleDisplayMode(mode);
    }
  };

  // Determine effective display style based on mode and screen size
  const effectiveMode = currentMode === 'auto'
    ? screen.isMobile
      ? 'phone'
      : screen.isTablet
      ? 'tablet'
      : 'desktop'
    : currentMode;

  // Responsive width & height sizing
  const getContainerStyles = () => {
    if (screen.isMobile) {
      if (screen.isLandscape) {
        return 'w-full min-h-[100dvh] h-[100dvh] max-w-full rounded-none border-0 shadow-none';
      }
      return 'w-full min-h-[100dvh] h-[100dvh] max-w-full rounded-none border-0 shadow-none';
    }

    if (screen.isLandscape) {
      switch (effectiveMode) {
        case 'phone':
          return 'w-full max-w-2xl min-h-[96dvh] max-h-[99dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
        case 'tablet':
          return 'w-full max-w-5xl xl:max-w-6xl min-h-[96dvh] max-h-[99dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
        case 'desktop':
        default:
          return 'w-full max-w-6xl xl:max-w-7xl min-h-[96dvh] max-h-[99dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
      }
    }

    switch (effectiveMode) {
      case 'tablet':
        return 'w-full max-w-3xl lg:max-w-4xl min-h-[94dvh] max-h-[98dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
      case 'desktop':
        return 'w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-[94dvh] max-h-[98dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
      case 'phone':
      default:
        return 'w-full max-w-md min-h-[94dvh] max-h-[98dvh] sm:rounded-3xl border border-slate-700/80 shadow-2xl';
    }
  };

  // Text scaling class based on accessibility preference
  const getTextScaleClass = () => {
    switch (screen.textScale) {
      case 'large':
        return 'text-scale-large font-reading-large';
      case 'comfort':
        return 'text-scale-comfort font-reading-comfort';
      case 'standard':
      default:
        return 'text-scale-standard';
    }
  };

  const isLight = themeClass === 'theme-light';

  return (
    <div
      className={`min-h-[100dvh] h-[100dvh] ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#070a12] text-slate-100'
      } flex flex-col justify-center items-center ${themeClass} ${
        screen.isMobile || (screen.isLandscape && screen.height < 650) ? 'p-0' : 'p-1 sm:p-2 md:p-3'
      } overflow-hidden`}
    >
      {/* Auto Screen Fit Subtle Notification on Entry */}
      {showAutoFitToast && (
        <div className="fixed top-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-w-xs mx-auto pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {screen.isLandscape ? 'Modo Paisagem (Deitado)' : 'Modo Retrato (Em Pé)'} • {screen.width}×{screen.height}px
            </span>
          </div>
        </div>
      )}

      {/* Top Device Mode Switcher bar on wider screens (Tablets/Desktops) */}
      {!screen.isMobile && screen.height >= 550 && (
        <div className={`hidden sm:flex items-center justify-between w-full max-w-4xl lg:max-w-5xl px-2 mb-1 text-xs font-semibold ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          <div className={`flex items-center gap-1 backdrop-blur-xs px-2 py-1 rounded-full shadow-md border ${
            isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-[#121829]/90 border-slate-800'
          }`}>
            <span className={`text-[10px] mr-1 uppercase font-bold tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Ajuste de Tela:
            </span>

            <button
              onClick={() => handleSelectMode('auto')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Ajuste automático inteligente para a orientação do seu dispositivo"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Automático</span>
            </button>

            <button
              onClick={() => handleSelectMode('phone')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentMode === 'phone'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Visualização Celular"
            >
              <Smartphone className="w-3 h-3" />
              <span>Celular</span>
            </button>

            <button
              onClick={() => handleSelectMode('tablet')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentMode === 'tablet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Visualização Tablet / iPad"
            >
              <Tablet className="w-3 h-3" />
              <span>Tablet</span>
            </button>

            <button
              onClick={() => handleSelectMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentMode === 'desktop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Visualização Expandida (Computador / Tela Cheia)"
            >
              <Monitor className="w-3 h-3" />
              <span>Expandido</span>
            </button>
          </div>

          {/* Quick text zoom / reading comfort switcher */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md border ${
            isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-[#121829]/90 border-slate-800'
          }`}>
            <Eye className={`w-3 h-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <button
              onClick={() => screen.changeTextScale('standard')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                screen.textScale === 'standard' ? 'bg-blue-600 text-white' : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
              }`}
              title="Tamanho padrão de leitura"
            >
              A
            </button>
            <button
              onClick={() => screen.changeTextScale('comfort')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                screen.textScale === 'comfort' ? 'bg-blue-600 text-white' : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
              }`}
              title="Tamanho confortável de leitura"
            >
              A+
            </button>
            <button
              onClick={() => screen.changeTextScale('large')}
              className={`px-1.5 py-0.5 rounded text-xs font-bold cursor-pointer ${
                screen.textScale === 'large' ? 'bg-blue-600 text-white' : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
              }`}
              title="Tamanho grande de leitura"
            >
              A++
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div
        className={`${getContainerStyles()} ${getTextScaleClass()} ${
          isLight ? 'bg-slate-50 text-slate-900 border-slate-200 shadow-md' : 'bg-[#0b0f19] text-slate-100'
        } flex flex-col relative overflow-hidden transition-all duration-200`}
      >
        {/* Inner Content Area */}
        <div className="flex-1 flex flex-col min-h-0 h-full w-full relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
