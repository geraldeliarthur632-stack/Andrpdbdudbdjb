import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import { BadgeItem, TrophyItem } from '../types';
import { Sparkles, Trophy, Award, ArrowRight, X, Star } from 'lucide-react';

interface UnlockCelebrationModalProps {
  unlockedItem: {
    type: 'trophy' | 'badge';
    item: TrophyItem | BadgeItem;
  } | null;
  onClose: () => void;
  onOpenCollection: () => void;
}

export const UnlockCelebrationModal: React.FC<UnlockCelebrationModalProps> = ({
  unlockedItem,
  onClose,
  onOpenCollection,
}) => {
  useEffect(() => {
    if (unlockedItem) {
      soundEffects.playVictoryFanfare();
      try {
        // Multi-stage confetti celebration
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0.1, y: 0.6 },
          });
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 0.9, y: 0.6 },
          });
        }, 250);
      } catch {}
    }
  }, [unlockedItem]);

  if (!unlockedItem) return null;

  const isTrophy = unlockedItem.type === 'trophy';
  const trophy = isTrophy ? (unlockedItem.item as TrophyItem) : null;
  const badge = !isTrophy ? (unlockedItem.item as BadgeItem) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl space-y-4 overflow-hidden"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-black shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{isTrophy ? 'Novo Troféu Desbloqueado!' : 'Novo Emblema Conquistado!'}</span>
          </motion.div>

          {/* Animated Big Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12, stiffness: 240 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-100 via-amber-50 to-yellow-100 border-2 border-amber-300 flex items-center justify-center text-5xl shadow-lg">
              {unlockedItem.item.icon}
            </div>

            {/* Sparkle badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-md"
            >
              ✓
            </motion.div>
          </motion.div>

          {/* Title & Desc */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <h2 className="text-xl font-black text-slate-900">{unlockedItem.item.title}</h2>
            <p className="text-xs text-slate-600 leading-snug">
              {unlockedItem.item.description}
            </p>
          </motion.div>

          {/* Milestone info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl w-full text-xs font-bold text-slate-700"
          >
            {isTrophy ? (
              <span>Marco atingido: <strong className="text-amber-700">{trophy?.correctAnswersRequired} perguntas corretas</strong></span>
            ) : (
              <span>Marco atingido: <strong className="text-blue-700">{badge?.pointsRequired} pontos totais</strong></span>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full space-y-2 pt-1"
          >
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
                onOpenCollection();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
            >
              <span>Ver Coleção de Troféus</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Continuar Estudando
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
