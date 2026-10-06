import React, { useState, useEffect } from 'react';
import { studyGoalService, DailyGoalData } from '../services/studyGoalService';
import { soundEffects } from '../services/soundEffects';
import {
  Target,
  Clock,
  Flame,
  Gift,
  CheckCircle2,
  Sliders,
  Sparkles,
  X,
  Play,
} from 'lucide-react';

interface DailyGoalCardProps {
  onBonusClaimed: (points: number) => void;
  onStartJourney?: () => void;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  onBonusClaimed,
  onStartJourney,
}) => {
  const [goalData, setGoalData] = useState<DailyGoalData>(() => studyGoalService.getData());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(goalData.targetMinutes);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const update = () => {
      setGoalData(studyGoalService.getData());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalMinutesStudied = Math.floor(goalData.todaySeconds / 60);
  const targetMinutes = goalData.targetMinutes || 15;
  const progressPercent = Math.min(100, Math.round((goalData.todaySeconds / (targetMinutes * 60)) * 100));
  const isGoalReached = progressPercent >= 100;
  const todayStr = new Date().toISOString().split('T')[0];
  const isBonusClaimed = goalData.claimedBonusDate === todayStr;

  const handleClaimBonus = () => {
    soundEffects.playCorrect();
    const result = studyGoalService.claimBonus();
    if (result.success) {
      setGoalData(result.data);
      onBonusClaimed(result.points);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  const handleSaveGoal = (minutes: number) => {
    soundEffects.playClick();
    const updated = studyGoalService.setTargetMinutes(minutes);
    setGoalData(updated);
    setIsConfigModalOpen(false);
  };

  const presetMinutes = [5, 10, 15, 20, 30, 45, 60];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3 relative overflow-hidden">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 truncate">
                Meta Diária de Tempo
              </h3>
              {goalData.streakDays > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold shrink-0">
                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                  {goalData.streakDays}d
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              Preenche ao estudar na Jornada ou Tutor
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            setSelectedMinutes(goalData.targetMinutes);
            setIsConfigModalOpen(true);
          }}
          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-[11px] font-extrabold transition flex items-center gap-1 shrink-0"
          title="Definir quantos minutos quer estudar hoje"
        >
          <Sliders className="w-3 h-3 text-blue-600" />
          <span>{targetMinutes} min</span>
        </button>
      </div>

      {/* PROGRESS BAR & STATS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Hoje: <b className="text-slate-900 font-bold">{totalMinutesStudied} min</b> de {targetMinutes} min
          </span>
          <span className="font-black text-blue-700 font-mono">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalReached
                ? 'bg-emerald-600'
                : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ACTIONS / STATUS BANNER */}
      {isGoalReached ? (
        !isBonusClaimed ? (
          <button
            onClick={handleClaimBonus}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs animate-bounce"
          >
            <Gift className="w-4 h-4 text-white" />
            <span>Resgatar Bônus: +100 Pontos Extras! 🎁</span>
          </button>
        ) : (
          <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold truncate">Meta de hoje batida! (+100 pts resgatados)</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 shrink-0">Parabéns! 🌟</span>
          </div>
        )
      ) : (
        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
          <span className="truncate">
            Faltam <b>{Math.max(1, targetMinutes - totalMinutesStudied)} min</b> para a meta
          </span>
          <span className="text-amber-700 font-bold text-[10px] shrink-0">
            Bônus: +100 pts
          </span>
        </div>
      )}

      {/* CELEBRATION TOAST */}
      {showCelebration && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center text-xl mb-1 shadow-xs">
            🏆
          </div>
          <h4 className="text-xs font-black text-slate-900">Meta Diária Atingida!</h4>
          <p className="text-xs text-amber-700 font-bold">+100 Pontos adicionados!</p>
        </div>
      )}

      {/* GOAL CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-4 text-slate-900 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Definir Meta Diária</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Quantos minutos quer estudar hoje?</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {presetMinutes.map((min) => (
                <button
                  key={min}
                  onClick={() => setSelectedMinutes(min)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    selectedMinutes === min
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-2.5 text-[11px] text-blue-900 space-y-0.5">
              <span className="font-bold flex items-center gap-1 text-blue-800">
                <Clock className="w-3 h-3" />
                Dica de Aprendizagem:
              </span>
              <p className="text-blue-700 leading-snug">
                Estudar 15 a 30 minutos todos os dias fortalece a memória de longo prazo e cria um hábito constante.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveGoal(selectedMinutes)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
