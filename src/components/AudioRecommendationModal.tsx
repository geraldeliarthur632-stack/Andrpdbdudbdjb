import React from 'react';
import { Headphones, Volume2, Sparkles, Check, X } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface AudioRecommendationModalProps {
  isOpen: boolean;
  subjectName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const AudioRecommendationModal: React.FC<AudioRecommendationModalProps> = ({
  isOpen,
  subjectName,
  onConfirm,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    soundEffects.playClick();
    if (dontShowAgain) {
      try {
        localStorage.setItem('estudahud_audio_tip_dismissed', 'true');
      } catch {}
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Recomendação de Áudio</h3>
              <p className="text-[11px] text-slate-500">{subjectName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Banner */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>

          <h4 className="text-xs font-bold text-emerald-950">
            Use Fones de Ouvido ou Aumente o Volume!
          </h4>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Nesta aula de <strong>{subjectName}</strong>, a Inteligência Artificial vai narrar a explicação da matéria e ler todas as perguntas em voz alta para você!
          </p>
        </div>

        {/* Checkbox Don't show again */}
        <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-3.5 h-3.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Não mostrar este aviso novamente</span>
        </label>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Iniciar Aula com Narração por Voz</span>
        </button>
      </div>
    </div>
  );
};
