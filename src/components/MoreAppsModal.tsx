import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  Gamepad2,
  Layers,
  CheckCircle2,
  Copy,
  Users,
  Flame,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface MoreAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const DEFAULT_APP_NAME = 'Não Seja o Pegador (Pega - Pega)';
const DEFAULT_APP_LINK = 'https://tente-nao-ser-o-pegador.ai.studio/';
const DEFAULT_APP_PHOTO = '/pega-pega-app.jpg';
const DEFAULT_APP_DESC =
  'Desvie dos outros jogadores, corra velozmente pela arena com reflexos rápidos e dispute partidas multiplayer eletrizantes para não ser o pegador!';

export const MoreAppsModal: React.FC<MoreAppsModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
}) => {
  const [appName, setAppName] = useState<string>(() => {
    try {
      return localStorage.getItem('estudahud_custom_more_apps_name') || DEFAULT_APP_NAME;
    } catch {
      return DEFAULT_APP_NAME;
    }
  });

  const [appLink, setAppLink] = useState<string>(() => {
    try {
      return localStorage.getItem('estudahud_custom_more_apps_link') || DEFAULT_APP_LINK;
    } catch {
      return DEFAULT_APP_LINK;
    }
  });

  const [appPhoto, setAppPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('estudahud_custom_more_apps_photo') || DEFAULT_APP_PHOTO;
    } catch {
      return DEFAULT_APP_PHOTO;
    }
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setAppName(localStorage.getItem('estudahud_custom_more_apps_name') || DEFAULT_APP_NAME);
        setAppLink(localStorage.getItem('estudahud_custom_more_apps_link') || DEFAULT_APP_LINK);
        setAppPhoto(localStorage.getItem('estudahud_custom_more_apps_photo') || DEFAULT_APP_PHOTO);
      } catch {}
    };
    window.addEventListener('estudahud_more_apps_updated', handleUpdate);
    return () => window.removeEventListener('estudahud_more_apps_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appLink || DEFAULT_APP_LINK);
      soundEffects.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col max-h-[90vh] overflow-y-auto transition-all bg-white border-slate-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">Mais Apps & Jogos</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-black border border-amber-500/30">
                  Parceiro Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Jogos educativos e aplicativos conectados ao seu aprendizado
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Game Card */}
        <div className="py-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl border transition-all bg-gradient-to-br from-amber-50/70 via-indigo-50/40 to-purple-50/50 border-amber-200/80 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Photo */}
              <div className="relative shrink-0 group">
                <img
                  src={appPhoto || DEFAULT_APP_PHOTO}
                  alt={appName || DEFAULT_APP_NAME}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg border-2 border-amber-400/80 ring-2 ring-amber-500/20"
                />
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" />
                  NOVO
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                    🎮 Pega - Pega
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/30">
                    Multijogador
                  </span>
                </div>

                <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                  {appName || DEFAULT_APP_NAME}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {DEFAULT_APP_DESC}
                </p>

                {/* Highlights tags */}
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] font-semibold text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">⚡ Partidas Rápidas</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">👑 Desafio da Coroa</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">🌐 100% Grátis</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-amber-200/50 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={appLink || DEFAULT_APP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playClick()}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Jogar Agora</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full sm:w-auto py-3 px-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Copiar Link"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips / Info */}
          <div className="p-3.5 rounded-2xl bg-slate-100 text-xs text-slate-600 flex items-center gap-2.5 border border-slate-200/70">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Abra em uma nova aba para jogar e desafiar amigos em tempo real!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
