import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import {
  Sparkles,
  RotateCcw,
  Award,
  Crown,
  Zap,
  Shield,
  Flame,
  Trophy,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

interface VictoryCelebrationProps {
  winnerName: string;
  winnerAvatar: string;
  scoreText?: string;
  modeTitle: string;
  onPlayAgain?: () => void;
  onHome: () => void;
}

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  winnerName,
  winnerAvatar,
  scoreText,
  modeTitle,
  onPlayAgain,
  onHome,
}) => {
  useEffect(() => {
    soundEffects.playVictoryFanfare();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      try {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#eab308', '#ec4899', '#10b981', '#8b5cf6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#eab308', '#ec4899', '#10b981', '#8b5cf6'],
        });
      } catch {}

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const renderWinnerIcon = (av: string) => {
    if (av && (av.startsWith('http') || av.startsWith('data:image'))) {
      return <img src={av} alt="Vencedor" className="w-full h-full object-cover rounded-full" />;
    }
    switch (av) {
      case 'crown': return <Crown className="w-12 h-12 text-amber-300" />;
      case 'zap': return <Zap className="w-12 h-12 text-amber-300" />;
      case 'shield': return <Shield className="w-12 h-12 text-amber-300" />;
      case 'award': return <Award className="w-12 h-12 text-amber-300" />;
      case 'sparkles': return <Sparkles className="w-12 h-12 text-amber-300" />;
      case 'flame': return <Flame className="w-12 h-12 text-amber-300" />;
      case 'trophy': return <Trophy className="w-12 h-12 text-amber-300" />;
      case 'graduation-cap': return <GraduationCap className="w-12 h-12 text-amber-300" />;
      default:
        if (!av || av.length > 4) {
          return <GraduationCap className="w-12 h-12 text-amber-300" />;
        }
        return <span className="text-5xl">{av}</span>;
    }
  };

  return (
    <div className="p-5 flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Victory Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-400 text-xs font-bold mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Vitória! • {modeTitle}</span>
      </div>

      {/* Winner Avatar */}
      <div className="relative my-3">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-300/20 border-2 border-amber-400/80 flex items-center justify-center shadow-2xl relative animate-bounce overflow-hidden">
          {renderWinnerIcon(winnerAvatar)}

          <div className="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 p-1.5 rounded-full shadow-md z-10">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black text-zinc-100 tracking-tight mb-1">
        {winnerName} Venceu a Partida!
      </h2>
      <p className="text-xs text-zinc-400 max-w-xs mb-4">
        {scoreText || 'Excelente desempenho na resolução dos desafios e estratégias!'}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs text-xs font-bold">
        {onPlayAgain && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onPlayAgain();
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-md transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>
        )}

        <button
          onClick={() => {
            soundEffects.playClick();
            onHome();
          }}
          className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Voltar aos Desafios</span>
        </button>
      </div>
    </div>
  );
};
