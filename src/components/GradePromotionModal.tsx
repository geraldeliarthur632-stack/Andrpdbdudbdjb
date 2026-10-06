import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Star,
  Award,
} from 'lucide-react';

interface GradePromotionModalProps {
  isOpen: boolean;
  previousGrade: GradeLevel;
  nextGrade: GradeLevel;
  onAdvance: () => void;
}

export const GradePromotionModal: React.FC<GradePromotionModalProps> = ({
  isOpen,
  previousGrade,
  nextGrade,
  onAdvance,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEffects.playVictoryFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 65,
            origin: { x: 0.1, y: 0.6 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 65,
            origin: { x: 0.9, y: 0.6 },
          });
        }, 300);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const prevLabel = GRADE_LABELS[previousGrade]?.full || 'Série Anterior';
  const nextLabel = GRADE_LABELS[nextGrade]?.full || 'Próxima Série';
  const nextShort = GRADE_LABELS[nextGrade]?.short || 'Nova Série';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

          {/* Celebration Header */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 12, stiffness: 240 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 text-white flex items-center justify-center text-4xl mx-auto shadow-xl shadow-amber-200">
              🎓
            </div>
            <span className="absolute -top-1 right-1/4 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 text-xs font-black text-white items-center justify-center shadow-md">
                ⭐
              </span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Ano Escolar Concluído! 🎉
            </span>
            <h2 className="text-lg font-black text-slate-900">Parabéns pela Formatura!</h2>
            <p className="text-xs text-slate-600">
              Você completou com sucesso todos os conteúdos de <strong>{prevLabel}</strong>!
            </p>
          </motion.div>

          {/* PROMOTION CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Promovido para:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-200">
                {nextShort}
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900">{nextLabel}</h3>

            <div className="space-y-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <p>
                  <strong>Fundamentos Fáceis e Básicos:</strong> Comece com revisões simples para ganhar confiança.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <p>
                  <strong>Explicações Aprofundadas da IA:</strong> Conceitos detalhados com áudio e texto antes dos exercícios!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bonus Reward */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-900 font-bold"
          >
            <span>Recompensa de Avanço:</span>
            <span className="text-amber-700 font-black">+200 Pontos Extras! 🎁</span>
          </motion.div>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              soundEffects.playCorrect();
              onAdvance();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition active:scale-98 cursor-pointer"
          >
            <span>Avançar para o {nextShort} e Aprender!</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
