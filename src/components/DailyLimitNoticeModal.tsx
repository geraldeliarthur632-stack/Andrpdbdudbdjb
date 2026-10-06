import React from 'react';
import { soundEffects } from '../services/soundEffects';
import { dailyTimeLimitService, DAILY_LIMIT_SECONDS } from '../services/dailyTimeLimitService';
import {
  Clock,
  Coffee,
  Heart,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DailyLimitNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes?: number) => void;
  todaySeconds: number;
}

export const DailyLimitNoticeModal: React.FC<DailyLimitNoticeModalProps> = ({
  isOpen,
  onClose,
  onSnooze,
  todaySeconds,
}) => {
  if (!isOpen) return null;

  const handleRestNow = () => {
    soundEffects.playStudyReminderChime();
    dailyTimeLimitService.setNotifiedToday(true);
    onClose();
  };

  const handleSnooze = () => {
    soundEffects.playClick();
    onSnooze(15);
  };

  const formattedTime = dailyTimeLimitService.formatTime(todaySeconds);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-amber-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header with Warm Attention Palette */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 text-white relative">
          <button
            onClick={handleRestNow}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar aviso"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner mb-3">
            🧘
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Limite de 2 Horas Atingido</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Hora de parar e descansar!
          </h2>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-2 font-medium">
            Você atingiu <strong>{formattedTime}</strong> de estudos hoje.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Main User Requirement Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Aviso Importante de Saúde & Foco</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>É melhor parar por hoje</strong>, porque o recomendado pelos especialistas é no máximo <strong>2 horas de estudos por dia na tela</strong> para não sobrecarregar sua mente e visão.
            </p>
          </div>

          {/* Dicas para a pausa */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              O que fazer agora para fixar o aprendizado:
            </span>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Descanse a visão</span>
                  <span className="text-[11px] text-slate-500 block">Olhe para longe ou feche os olhos por alguns minutos.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Beba água e alongue-se</span>
                  <span className="text-[11px] text-slate-500 block">Hidrate-se e dê uma caminhada para ativar a circulação.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Fixação cerebral</span>
                  <span className="text-[11px] text-slate-500 block">O sono e o repouso são quando o cérebro consolida a memória!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRestNow}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entendi, vou parar e descansar</span>
          </button>

          <button
            type="button"
            onClick={handleSnooze}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Continuar estudando mais um pouco (mais 15 min)
          </button>
        </div>
      </div>
    </div>
  );
};
