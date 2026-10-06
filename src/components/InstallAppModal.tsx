import React, { useState, useEffect } from 'react';
import { soundEffects } from '../services/soundEffects';
import { pwaService } from '../services/pwaService';
import { speechNarrator } from '../services/speechNarrator';
import { detectUserPlatform } from '../services/platformDetection';
import { GooglePlayStoreIcon, AppleStoreIcon, DesktopStoreIcon, PlatformStoreIcon } from './DownloadAppButton';
import {
  X,
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Laptop,
  MonitorSmartphone,
  Zap,
  BellRing,
  Copy,
  Check,
  ShieldCheck,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Official Platform Symbols (SVG)
export const AndroidIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.75h24c-.3432-4.0911-2.6889-7.5633-6.1185-9.4286" />
  </svg>
);

export const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.61-11.23-20.73-14.78-33.34-3.55-12.61-5.33-24.3-5.33-35.07 0-14.28 3.55-25.96 10.65-35.06 7.1-9.09 16.02-13.72 26.77-13.88 5.11 0 10.74 1.34 16.9 4.02 6.16 2.68 10.14 4.08 11.95 4.21 2.45-.4 6.78-1.96 12.98-4.68 6.2-2.73 11.89-3.95 17.06-3.68 12.61.67 22.56 5.63 29.83 14.88-11.05 6.69-16.45 15.89-16.19 27.61.34 9.17 3.86 16.89 10.56 23.14 6.7 6.25 14.77 9.8 24.22 10.65-2.22 6.74-4.83 13.52-7.82 20.33zM119.22 31.84c0-7.72 2.76-14.97 8.28-21.75 5.52-6.78 12.28-10.87 20.28-12.27.23 1.08.34 2.16.34 3.24 0 7.6-2.88 15.01-8.63 22.23-5.75 7.22-12.87 11.45-21.36 12.68-.34-1.39-.51-2.77-.51-4.13z" />
  </svg>
);

export const DesktopIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const PLAY_STORE_URL =
  'https://play.google.com/store/search?q=Trilha%20do%20Saber%20-%20Estude%20F%C3%A1cil&c=apps';

const TUTORIAL_SPEECH_TEXTS = {
  android:
    "Tutorial de instalação no Android: Você pode instalar diretamente pela Google Play Store tocando no botão oficial, ou adicionar direto à sua tela inicial pelo navegador Chrome tocando no menu de três pontinhos e escolhendo 'Instalar aplicativo'. O app abrirá em tela cheia com todos os seus estudos!",
  ios:
    "Tutorial de instalação no iPhone, iPad ou Mac: Primeiro, no navegador Safari, localize a barra inferior e toque no botão de Compartilhar, que é um quadrado com uma seta para cima. Segundo, role as opções para baixo e toque em 'Adicionar à Tela de Início', com o símbolo de mais. Terceiro, toque em 'Adicionar' no canto superior direito. Pronto! O app estará na sua tela inicial!",
  pc:
    "Tutorial de instalação no Computador: Primeiro, na barra de endereços do seu navegador Chrome ou Edge, clique no ícone de instalar aplicativo ou acesse o menu de três pontinhos e clique em 'Instalar Trilha do Saber'. Segundo, confirme em Instalar na janela que abrir. O Trilha do Saber abrirá em uma janela própria direto na sua área de trabalho!",
};

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [platformTab, setPlatformTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [detectedPlatform, setDetectedPlatform] = useState<'android' | 'ios' | 'pc'>('android');
  const [hasPrompt, setHasPrompt] = useState<boolean>(pwaService.hasNativePrompt());
  const [isInstalled, setIsInstalled] = useState<boolean>(pwaService.isStandalone());
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAttemptingInstall, setIsAttemptingInstall] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // Detect platform for default tab
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      if (/iPad|iPhone|iPod/i.test(userAgent) && !(window as any).MSStream) {
        setPlatformTab('ios');
        setDetectedPlatform('ios');
      } else if (/android/i.test(userAgent)) {
        setPlatformTab('android');
        setDetectedPlatform('android');
      } else if (/Win|Mac|Linux/i.test(userAgent) && !/Mobi/i.test(userAgent)) {
        setPlatformTab('pc');
        setDetectedPlatform('pc');
      } else {
        setPlatformTab('android');
        setDetectedPlatform('android');
      }
    }

    // Subscribe to PWA service install prompt updates
    const unsubscribe = pwaService.subscribe((promptAvailable) => {
      setHasPrompt(promptAvailable);
      setIsInstalled(pwaService.isStandalone());
    });

    return () => {
      unsubscribe();
      try {
        speechNarrator.stop();
      } catch {}
    };
  }, []);

  // Stop speech when modal is closed
  useEffect(() => {
    if (!isOpen) {
      try {
        speechNarrator.stop();
        setIsAiSpeaking(false);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    soundEffects.playClick();
    setIsAttemptingInstall(true);
    const outcome = await pwaService.promptNativeInstall();
    setIsAttemptingInstall(false);
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      soundEffects.playVictoryFanfare();
    }
  };

  const handleCopyLink = () => {
    soundEffects.playClick();
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleToggleAiSpeech = () => {
    if (isAiSpeaking) {
      soundEffects.playClick();
      speechNarrator.stop();
      setIsAiSpeaking(false);
    } else {
      soundEffects.playClick();
      setIsAiSpeaking(true);
      const textToSpeak = TUTORIAL_SPEECH_TEXTS[platformTab];
      speechNarrator.speak(
        textToSpeak,
        () => setIsAiSpeaking(false),
        () => setIsAiSpeaking(false)
      );
    }
  };

  const handleSwitchTab = (tab: 'android' | 'ios' | 'pc') => {
    soundEffects.playClick();
    setPlatformTab(tab);
    if (isAiSpeaking) {
      speechNarrator.stop();
      const textToSpeak = TUTORIAL_SPEECH_TEXTS[tab];
      speechNarrator.speak(
        textToSpeak,
        () => setIsAiSpeaking(false),
        () => setIsAiSpeaking(false)
      );
    }
  };

  const handleCloseModal = () => {
    try {
      soundEffects.playClick();
      speechNarrator.stop();
      setIsAiSpeaking(false);
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition border border-slate-200 shadow-xs cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HERO BANNER */}
        <div className="relative rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 shadow-xs">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl overflow-hidden border border-emerald-300 shadow-sm shrink-0 bg-white p-1 flex items-center justify-center">
                <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    {isInstalled ? 'App Instalado' : 'Instalar App'}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Trilha do Saber
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {isInstalled ? 'Aplicativo Instalado' : 'Baixar Aplicativo Oficial'}
                </h2>
              </div>
            </div>

            {hasPrompt && !isInstalled && (
              <button
                onClick={handleTriggerNativeInstall}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer animate-pulse hover:animate-none"
              >
                <Download className="w-4 h-4" />
                <span>Instalar</span>
              </button>
            )}
          </div>
        </div>

        {/* JÁ INSTALADO OU SUCESSO DE INSTALAÇÃO */}
        {isInstalled || installSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-emerald-950 leading-tight">
                Aplicativo Instalado com Sucesso! 🎉
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                O ícone da <strong>Trilha do Saber</strong> já está pronto e instalado no seu dispositivo para você estudar a qualquer momento.
              </p>
            </div>
          </div>
        ) : (
          /* BOTÃO PRINCIPAL DE INSTALAÇÃO: 1 CLIQUE DIRETO */
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <PlatformStoreIcon os={detectedPlatform === 'pc' ? 'desktop' : detectedPlatform} className="w-4 h-4 text-emerald-600" />
                Instalação com 1 Toque
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {detectedPlatform === 'android' ? 'Google Play / Chrome' : detectedPlatform === 'ios' ? 'App Store / Safari' : 'PC / Web App'}
              </span>
            </div>

            <button
              onClick={handleTriggerNativeInstall}
              disabled={isAttemptingInstall}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
            >
              <PlatformStoreIcon os={detectedPlatform === 'pc' ? 'desktop' : detectedPlatform} className="w-5 h-5 text-white shrink-0" />
              <span>
                {isAttemptingInstall
                  ? 'Processando instalação...'
                  : `Instalar no ${detectedPlatform === 'android' ? 'Android' : detectedPlatform === 'ios' ? 'iPhone / iPad' : 'Computador'} Agora`}
              </span>
            </button>

            {detectedPlatform === 'android' && (
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playClick()}
                className="w-full py-2.5 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer border border-emerald-300"
              >
                <GooglePlayStoreIcon className="w-4 h-4" />
                <span>Instalar pela Google Play Store Oficial</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              </a>
            )}
            
            <p className="text-[11px] text-slate-500 text-center font-medium">
              Instala direto na sua tela inicial! Caso precise do passo a passo manual, selecione seu aparelho abaixo e a IA vai ler o tutorial para você:
            </p>
          </div>
        )}

        {/* WIDGET: IA FALA O TUTORIAL */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isAiSpeaking
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-400 ring-2 ring-purple-400/20 shadow-sm'
            : 'bg-indigo-50/70 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isAiSpeaking
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-indigo-600 text-white'
              }`}>
                {isAiSpeaking ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">
                  {isAiSpeaking ? 'A IA está narrando o tutorial...' : 'Ouvir Tutorial com a Voz da IA'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {isAiSpeaking ? 'Ouça as instruções passo a passo' : 'Clique para a IA explicar em voz alta'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAiSpeech}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-xs ${
                isAiSpeaking
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isAiSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Parar IA</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir IA 🔊</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SELEÇÃO DE PLATAFORMA COM SÍMBOLOS OFICIAIS */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Escolha seu Aparelho:
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Detectado: {detectedPlatform === 'android' ? 'Android' : detectedPlatform === 'ios' ? 'iOS' : 'Computador'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {/* 1. ANDROID */}
            <button
              onClick={() => handleSwitchTab('android')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                platformTab === 'android'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className={`p-1 rounded-lg ${platformTab === 'android' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600'}`}>
                <GooglePlayStoreIcon className="w-4 h-4" />
              </div>
              <span className="truncate">Android (Play Store)</span>
            </button>

            {/* 2. IOS / MAC */}
            <button
              onClick={() => handleSwitchTab('ios')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                platformTab === 'ios'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className={`p-1 rounded-lg ${platformTab === 'ios' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}>
                <AppleStoreIcon className="w-4 h-4" />
              </div>
              <span className="truncate">iOS (App Store)</span>
            </button>

            {/* 3. COMPUTADOR */}
            <button
              onClick={() => handleSwitchTab('pc')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                platformTab === 'pc'
                  ? 'bg-white text-indigo-700 shadow-sm border border-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <div className={`p-1 rounded-lg ${platformTab === 'pc' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}>
                <DesktopStoreIcon className="w-4 h-4" />
              </div>
              <span className="truncate">Computador (PC)</span>
            </button>
          </div>
        </div>

        {/* PLATFORM STEP-BY-STEP INSTRUCTIONS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          {/* ANDROID TUTORIAL */}
          {platformTab === 'android' && (
            <div className="space-y-3">
              {/* OPÇÃO 1: GOOGLE PLAY STORE OFICIAL */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-emerald-200 flex items-center justify-center">
                      <GooglePlayStoreIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 leading-tight">
                        Disponível na Google Play Store
                      </h5>
                      <span className="text-[10px] text-emerald-800 font-bold">
                        App Oficial • Trilha do Saber - Estude Fácil
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    Recomendado
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  Você pode instalar diretamente pela <strong>Google Play Store</strong> com atualizações automáticas e melhor desempenho no seu smartphone ou tablet Android:
                </p>

                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEffects.playClick()}
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer text-center"
                >
                  <GooglePlayStoreIcon className="w-4 h-4" />
                  <span>Instalar na Google Play Store</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>
              </div>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <AndroidIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Ou instale pelo navegador Google Chrome</h4>
                  <p className="text-[10px] text-slate-500">Siga os 3 passos simples abaixo:</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Abra o menu de opções do navegador</p>
                    <p className="text-slate-600 text-[11px]">
                      Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Google Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Toque em "Instalar aplicativo"</p>
                    <p className="text-slate-600 text-[11px]">
                      Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Confirme a instalação</p>
                    <p className="text-slate-600 text-[11px]">
                      O ícone da <strong>Trilha do Saber</strong> aparecerá direto na sua tela inicial, pronto para abrir como aplicativo em tela cheia!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IPHONE / IPAD (IOS SAFARI) */}
          {platformTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="p-1.5 rounded-xl bg-slate-200 text-slate-900">
                  <AppleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Tutorial para iPhone & iPad (Safari)</h4>
                  <p className="text-[10px] text-slate-500">Siga os 3 passos no navegador Safari:</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Toque em Compartilhar
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Na barra inferior do Safari, toque no ícone de <strong>Compartilhar (quadrado com seta ⎋)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Selecione "Adicionar à Tela de Início"
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-600" />
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Role o menu para baixo e toque em <strong>"Adicionar à Tela de Início" (+)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Toque em "Adicionar"</p>
                    <p className="text-slate-600 text-[11px]">
                      No canto superior direito, confirme em <strong>"Adicionar"</strong>. O app estará na tela inicial do seu iPhone!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPUTADOR / PC / MAC */}
          {platformTab === 'pc' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
                  <DesktopIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Tutorial para Computador (Chrome / Edge)</h4>
                  <p className="text-[10px] text-slate-500">Instalação em janela própria no PC ou Mac:</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Clique no ícone de instalação do navegador</p>
                    <p className="text-slate-600 text-[11px]">
                      No canto direito da barra de endereço do seu navegador, clique no ícone de <strong>Instalar Aplicativo 💻</strong> ou no menu de 3 pontinhos (⋮) ➔ <strong>"Instalar aplicativo..."</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Confirme a instalação</p>
                    <p className="text-slate-600 text-[11px]">
                      Clique em <strong>"Instalar"</strong>. Uma janela limpa e dedicada abrirá direto na sua área de trabalho!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO COPIAR LINK DO APP */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Link direto do aplicativo:
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-2xs"
              title="Copiar link do app"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FOOTER CONFIRM BUTTON */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Gratuito & Seguro</span>
          </div>

          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
