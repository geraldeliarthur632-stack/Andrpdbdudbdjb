import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import {
  Sparkles,
  Flame,
  Trophy,
  Zap,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  X,
  Star,
  Award,
} from 'lucide-react';

interface DailyXpCelebrationModalProps {
  isOpen: boolean;
  earnedXp: number;
  goalXp: number;
  streakDays?: number;
  onClose: () => void;
  onContinueStudying?: () => void;
  onOpenProgress?: () => void;
}

export const DailyXpCelebrationModal: React.FC<DailyXpCelebrationModalProps> = ({
  isOpen,
  earnedXp,
  goalXp,
  streakDays = 1,
  onClose,
  onContinueStudying,
  onOpenProgress,
}) => {
  const [isSparkling, setIsSparkling] = useState(false);

  const triggerConfettiExplosion = () => {
    try {
      // Center burst
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#8b5cf6', '#ec4899', '#38bdf8', '#fbbf24', '#10b981'],
        shapes: ['circle', 'square'],
      });

      // Left cannon
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.65 },
          colors: ['#fbbf24', '#f59e0b', '#3b82f6', '#8b5cf6'],
        });
      }, 200);

      // Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.65 },
          colors: ['#10b981', '#34d399', '#ec4899', '#a855f7'],
        });
      }, 400);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      soundEffects.playVictoryFanfare();
      triggerConfettiExplosion();
      setIsSparkling(true);

      const msg = `Sensacional! Você atingiu 100% da sua meta diária de XP com ${earnedXp} pontos! Parabéns pela sua dedicação e consistência!`;
      speechNarrator.speak(msg);

      const timer = setTimeout(() => setIsSparkling(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, earnedXp]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-4 overflow-hidden"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Close icon in corner */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>META DIÁRIA DE XP CONCLUÍDA!</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
          </motion.div>

          {/* Central Animated Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12, stiffness: 240 }}
            className="relative inline-flex items-center justify-center"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 p-1 shadow-xl shadow-amber-200">
              <div className="w-full h-full rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-4xl sm:text-5xl select-none">🏆</span>
                <div className="absolute bottom-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-black text-white shadow-xs">
                  100%
                </div>
              </div>
            </div>

            {/* Floating mini badges */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-black"
            >
              ✓
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55, type: 'spring' }}
              className="absolute -bottom-1 -left-2 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-black"
            >
              🔥
            </motion.div>
          </motion.div>

          {/* Headline & Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sensacional! Meta Batida! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
              Você atingiu <span className="text-amber-600 font-black">{earnedXp} XP</span> hoje e completou 100% da sua meta de estudos diários!
            </p>
          </motion.div>

          {/* Consistency & Streak Highlight Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left"
          >
            <div className="space-y-0.5 border-r border-slate-200 pr-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Progresso Hoje</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900">{earnedXp}</span>
                <span className="text-xs text-slate-400">/ {goalXp} XP</span>
              </div>
              <span className="text-[10px] font-black text-emerald-600 block">
                100% Concluído ✓
              </span>
            </div>

            <div className="space-y-0.5 pl-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>Ofensiva de Estudos</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-orange-600">{streakDays}</span>
                <span className="text-xs text-slate-400">{streakDays === 1 ? 'dia' : 'dias'} seguidos</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 block">
                Consistência Máxima!
              </span>
            </div>
          </motion.div>

          {/* Motivational Consistency Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 text-left flex items-start gap-2.5"
          >
            <span className="text-base select-none">🧠</span>
            <p className="leading-snug">
              <strong className="text-purple-950 font-bold">O poder da consistência:</strong> Estudar todo dia ativa a memória de longo prazo do cérebro, facilitando a fixação de simulados e provas!
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="space-y-2 pt-1"
          >
            <button
              onClick={() => {
                soundEffects.playVictory();
                triggerConfettiExplosion();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-200 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>🎉 Comemorar com Mais Confetes!</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                  if (onContinueStudying) onContinueStudying();
                }}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {onOpenProgress && (
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onClose();
                    onOpenProgress();
                  }}
                  className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 active:scale-98 text-purple-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border border-purple-200 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Ver Progresso</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
