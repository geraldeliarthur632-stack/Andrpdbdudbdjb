import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { studyGoalService } from '../services/studyGoalService';
import { soundEffects } from '../services/soundEffects';
import {
  Zap,
  Target,
  Flame,
  Sparkles,
  Sliders,
  CheckCircle2,
  Trophy,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface DailyXpCardProps {
  onOpenCelebration?: (earnedXp: number, goalXp: number) => void;
  streakDays?: number;
  userTotalPoints?: number;
  theme?: 'light' | 'dark';
}

export const DailyXpCard: React.FC<DailyXpCardProps> = ({
  onOpenCelebration,
  streakDays = 1,
  userTotalPoints,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [xpData, setXpData] = useState(() => studyGoalService.getDailyXpData(userTotalPoints));
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(xpData.goalXp);

  const triggerLocalConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#fbbf24', '#8b5cf6', '#38bdf8'],
      });
    } catch {}
  };

  useEffect(() => {
    const update = () => {
      setXpData(studyGoalService.getDailyXpData(userTotalPoints));
    };
    update();

    const handleCustomUpdate = () => update();
    window.addEventListener('estudahud_daily_xp_updated', handleCustomUpdate);
    const interval = setInterval(update, 3000);

    return () => {
      window.removeEventListener('estudahud_daily_xp_updated', handleCustomUpdate);
      clearInterval(interval);
    };
  }, [userTotalPoints]);

  const progress = Math.min(100, Math.round((xpData.earnedXp / xpData.goalXp) * 100));
  const isCompleted = xpData.isGoalMet || progress >= 100;

  const presetGoals = [50, 100, 150, 200, 300];

  const handleSaveGoal = (goal: number) => {
    soundEffects.playClick();
    studyGoalService.setDailyXpGoal(goal);
    setXpData(studyGoalService.getDailyXpData());
    setIsConfigOpen(false);
  };

  const handleSimulateAddXp = (amount: number) => {
    soundEffects.playCorrect();
    studyGoalService.resetCelebrationForTesting();
    const updated = studyGoalService.addDailyXp(amount);
    setXpData(updated);
    if (updated.isGoalMet || updated.progressPercent >= 100) {
      triggerLocalConfetti();
    }
  };

  const handleResetXpToday = () => {
    soundEffects.playClick();
    studyGoalService.resetCelebrationForTesting();
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(
        'estudahud_daily_xp_tracker_v2',
        JSON.stringify({ date: today, earnedXp: 0, goalXp: xpData.goalXp })
      );
      setXpData({
        earnedXp: 0,
        goalXp: xpData.goalXp,
        progressPercent: 0,
        isGoalMet: false,
      });
      window.dispatchEvent(new CustomEvent('estudahud_daily_xp_updated'));
    } catch {}
  };

  return (
    <div
      id="daily-xp-progress-card"
      className={`relative rounded-3xl p-4 transition-all duration-500 overflow-hidden border ${
        isCompleted
          ? isLight
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-emerald-400 shadow-md ring-1 ring-emerald-300'
            : 'bg-gradient-to-br from-[#121829] via-[#1a2536] to-[#0e241c] border-emerald-500/60 shadow-emerald-950/50 ring-1 ring-emerald-400/40'
          : isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#273553] shadow-slate-950/50'
      }`}
    >
      {/* Background flare when completed */}
      {isCompleted && (
        <>
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        </>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md transition-transform ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 text-white animate-bounce shadow-emerald-500/40'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
            }`}
            style={isCompleted ? { animationDuration: '3s' } : undefined}
          >
            {isCompleted ? <Trophy className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-white" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`text-xs sm:text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Meta Diária de XP
              </h3>
              {isCompleted ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 text-emerald-600 text-[10px] font-black shrink-0 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  100% META BATIDA!
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isLight ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                }`}>
                  {progress}%
                </span>
              )}
            </div>
            <p className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isCompleted
                ? 'Sensacional! Consistência do dia concluída 🔥'
                : 'Ganhe XP no caderno, simulados e desafios'}
            </p>
          </div>
        </div>

        {/* Action Button: Settings or Celebration */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted && onOpenCelebration && (
            <button
              onClick={() => {
                soundEffects.playVictory();
                triggerLocalConfetti();
                onOpenCelebration(xpData.earnedXp, xpData.goalXp);
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
              title="Ver celebração com confetes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrar 🎉</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedGoal(xpData.goalXp);
              setIsConfigOpen(true);
            }}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-400 hover:text-white border-[#273553]'
            }`}
            title="Ajustar meta de XP diária"
            aria-label="Ajustar meta"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Numeric Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{xpData.earnedXp}</span>
            <span className={`font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/ {xpData.goalXp} XP hoje</span>
          </div>

          <span
            className={`font-black font-mono ${
              isCompleted ? 'text-emerald-600 text-sm' : isLight ? 'text-purple-700' : 'text-purple-300'
            }`}
          >
            {progress}%
          </span>
        </div>

        <div className={`w-full h-3 rounded-full p-0.5 overflow-hidden border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1e293b] border-[#273553]'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
            }`}
            style={{ width: `${Math.max(progress > 0 ? 5 : 0, progress)}%` }}
          />
        </div>
      </div>

      {/* Footer info pill */}
      {isCompleted ? (
        <div className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between text-[11px] ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
        }`}>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="text-sm">🎉</span>
            <span>Meta de 100% atingida! Parabéns pela consistência!</span>
          </span>
          <span className={`font-semibold text-[10px] shrink-0 ${isLight ? 'text-emerald-700 font-black' : 'text-emerald-300'}`}>
            +{xpData.earnedXp} XP
          </span>
        </div>
      ) : (
        <div className={`mt-2 flex items-center justify-between text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>Faltam {Math.max(0, xpData.goalXp - xpData.earnedXp)} XP para bater os 100%</span>
          <span className={`font-bold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>Meta: {xpData.goalXp} XP</span>
        </div>
      )}

      {/* Goal Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-center relative border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#121829] border-[#273553] text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Target className="w-4 h-4 text-purple-500" />
                <span>Meta Diária de XP</span>
              </h4>
              <button
                onClick={() => setIsConfigOpen(false)}
                className={`p-1 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs text-left ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Defina quantos pontos de XP você quer conquistar por dia para manter o ritmo e a consistência nos estudos:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {presetGoals.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedGoal === g
                      ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-300 border border-[#273553]'
                  }`}
                >
                  {g} XP
                </button>
              ))}
            </div>

            {/* Quick test buttons for easy preview */}
            <div className={`pt-2 border-t text-left space-y-2 ${isLight ? 'border-slate-100' : 'border-[#273553]'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Testar Barra de Progresso e Confetes:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateAddXp(25)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    isLight
                      ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      : 'bg-[#162137] hover:bg-[#1e2e4e] text-purple-300 border-[#2d4066]'
                  }`}
                >
                  +25 XP
                </button>
                <button
                  onClick={() => handleSimulateAddXp(xpData.goalXp)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-black shadow transition cursor-pointer"
                >
                  🎯 Atingir 100%
                </button>
                <button
                  onClick={handleResetXpToday}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                    isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      : 'bg-[#1e293b] hover:bg-[#28384f] text-slate-400 hover:text-white border-transparent'
                  }`}
                  title="Zerar progresso de hoje"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSaveGoal(selectedGoal)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95 cursor-pointer"
            >
              Salvar Meta Diária
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

