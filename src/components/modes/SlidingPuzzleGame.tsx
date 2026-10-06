import React, { useState, useEffect } from 'react';
import { getAnimalPuzzleLevel, AnimalPuzzleLevel, AnimalPuzzleItem } from '../../data/educationalGamesData';
import { GradeLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  Heart,
  CheckCircle2,
  Volume2,
  Flame,
} from 'lucide-react';

interface SlidingPuzzleGameProps {
  grade?: GradeLevel;
  theme?: 'light' | 'dark';
  onBack: () => void;
  onEarnPoints: (pts: number, isMajor?: boolean) => void;
}

interface CardItem {
  uid: string;
  animalId: string;
  animal: AnimalPuzzleItem;
  isFlipped: boolean;
  isMatched: boolean;
}

const STORAGE_ANIMAL_PUZZLE_KEY = 'estudahud_animal_puzzle_level_v2';

export const SlidingPuzzleGame: React.FC<SlidingPuzzleGameProps> = ({
  theme = 'light',
  onBack,
  onEarnPoints,
}) => {
  const isLight = theme === 'light';
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANIMAL_PUZZLE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch {}
    return 0;
  });

  const level: AnimalPuzzleLevel = getAnimalPuzzleLevel(currentLevelIndex);

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastDiscoveredFact, setLastDiscoveredFact] = useState<AnimalPuzzleItem | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Initialize and shuffle animal pairs on level change
  const initializeLevel = (lvl: AnimalPuzzleLevel) => {
    const rawPairs: CardItem[] = [];
    lvl.animals.forEach((animal) => {
      // First card of pair
      rawPairs.push({
        uid: `${animal.id}_1_${Math.random()}`,
        animalId: animal.id,
        animal,
        isFlipped: false,
        isMatched: false,
      });
      // Second card of pair
      rawPairs.push({
        uid: `${animal.id}_2_${Math.random()}`,
        animalId: animal.id,
        animal,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards randomly
    const shuffled = rawPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedUids([]);
    setMovesCount(0);
    setMatchedPairsCount(0);
    setIsCompleted(false);
    setLastDiscoveredFact(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    initializeLevel(level);
  }, [currentLevelIndex]);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  // Handle card selection
  const handleCardClick = (card: CardItem) => {
    if (card.isMatched || card.isFlipped || flippedUids.length >= 2 || isCompleted) {
      return;
    }

    soundEffects.playClick();

    // Flip this card
    const nextCards = cards.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c));
    setCards(nextCards);

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMovesCount((prev) => prev + 1);
      const firstCard = cards.find((c) => c.uid === nextFlipped[0]);
      const secondCard = card;

      if (firstCard && firstCard.animalId === secondCard.animalId) {
        // MATCH FOUND! (Encontrou o mesmo animal!)
        soundEffects.playCorrect('bonus');
        setLastDiscoveredFact(card.animal);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.animalId === card.animalId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedUids([]);
          const newMatched = matchedPairsCount + 1;
          setMatchedPairsCount(newMatched);

          if (newMatched === level.animals.length) {
            // Level completely solved!
            setIsCompleted(true);
            setIsTimerRunning(false);
            soundEffects.playLevelUp();
            onEarnPoints(50, true);
            try {
              localStorage.setItem(STORAGE_ANIMAL_PUZZLE_KEY, String(currentLevelIndex + 1));
            } catch {}
          }
        }, 500);
      } else {
        // No match - flip back after brief pause
        soundEffects.playError();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (nextFlipped.includes(c.uid) ? { ...c, isFlipped: false } : c))
          );
          setFlippedUids([]);
        }, 900);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleNextLevel = () => {
    soundEffects.playClick();
    setCurrentLevelIndex((prev) => prev + 1);
  };

  const handlePrevLevel = () => {
    if (currentLevelIndex <= 0) return;
    soundEffects.playClick();
    setCurrentLevelIndex((prev) => prev - 1);
  };

  const handleRestart = () => {
    soundEffects.playClick();
    initializeLevel(level);
  };

  return (
    <div className={`flex-1 flex flex-col p-4 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090d16] text-white'} max-w-lg md:max-w-xl mx-auto w-full pb-20 select-none`}>
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className={`flex items-center gap-1.5 text-xs p-2 rounded-xl border transition cursor-pointer font-bold ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-white bg-[#121829] border-[#1f2b45]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
          isLight
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
        }`}>
          <span>🐾 Quebra-Cabeça dos Bichos</span>
        </div>
      </div>

      {/* LEVEL HEADER */}
      <div className={`border p-3.5 rounded-3xl mb-3 shadow-lg space-y-2.5 ${
        isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#1f2b45]'
      }`}>
        <div className="flex items-center justify-between">
          <button
            disabled={currentLevelIndex <= 0}
            onClick={handlePrevLevel}
            className={`p-1.5 rounded-xl border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-[#273553] text-slate-400 hover:text-white hover:bg-[#161f38]'
            }`}
            title="Nível anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{level.title}</h2>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 border ${
              isLight
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
            }`}>
              {level.habitatTheme} • {matchedPairsCount}/{level.animals.length} Pares de Animais
            </span>
          </div>

          <button
            onClick={handleNextLevel}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-[#273553] text-slate-400 hover:text-white hover:bg-[#161f38]'
            }`}
            title="Próximo nível"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* STATS BAR */}
        <div className={`flex items-center justify-between text-xs pt-1.5 border-t font-semibold ${
          isLight
            ? 'border-slate-100 text-slate-500'
            : 'border-[#1f2b45] text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Tempo: <strong className={isLight ? 'text-slate-800 font-bold' : 'text-white'}>{formatTime(timerSeconds)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Tentativas: <strong className={isLight ? 'text-slate-800 font-bold' : 'text-white'}>{movesCount}</strong></span>
          </div>

          <button
            onClick={handleRestart}
            className={`flex items-center gap-1 text-[11px] p-1 rounded-md transition cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-[#161f38]'
            }`}
            title="Embaralhar e reiniciar peças"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* PUZZLE BOARD: 3x4 or 4x3 Grid of Cute Animals */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-sm">
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.uid}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched || isCompleted}
                className={`aspect-square rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center relative shadow-md active:scale-95 cursor-pointer ${
                  card.isMatched
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-emerald-500/10 scale-[0.98]'
                      : 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 border-emerald-500 text-emerald-200 shadow-emerald-500/20 scale-[0.98]'
                    : isRevealed
                    ? isLight
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-indigo-500/20'
                      : 'bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-400 text-white shadow-indigo-500/30'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300 text-slate-400 shadow-xs'
                    : 'bg-[#121829] hover:bg-[#161f38] border-[#273553] hover:border-[#8b5cf6]/50 text-slate-600'
                }`}
              >
                {isRevealed ? (
                  <div className="flex flex-col items-center justify-center p-1 animate-in zoom-in-75 duration-200">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md">
                      {card.animal.emoji}
                    </span>
                    <span className={`text-[10px] font-black mt-1 text-center truncate max-w-[80px] ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {card.animal.name}
                    </span>
                    {card.isMatched && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl text-slate-400 opacity-70">🐾</span>
                    <span className={`text-[9px] font-bold uppercase mt-0.5 ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}>Bicho</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DISCOVERED ANIMAL CURIOSITY CARD */}
      {lastDiscoveredFact && (
        <div className={`mt-3 p-3.5 rounded-2xl shadow-lg flex items-start gap-3 border animate-in fade-in slide-in-from-bottom-2 ${
          isLight
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-[#121829] border-amber-500/40 text-slate-300'
        }`}>
          <div className={`w-10 h-10 rounded-2xl text-2xl flex items-center justify-center shrink-0 border ${
            isLight
              ? 'bg-white border-amber-200 shadow-xs'
              : 'bg-amber-500/20 border-amber-500/30'
          }`}>
            {lastDiscoveredFact.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-black ${
                isLight ? 'text-amber-900' : 'text-amber-300'
              }`}>
                Par Encontrado: {lastDiscoveredFact.name}! 🎉
              </span>
              <span className={`text-[9px] font-semibold ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                ({lastDiscoveredFact.habitat})
              </span>
            </div>
            <p className={`text-[11px] leading-snug mt-0.5 ${
              isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
            }`}>
              {lastDiscoveredFact.fact}
            </p>
          </div>
        </div>
      )}

      {/* COMPLETED CALLOUT */}
      {isCompleted && (
        <div className={`mt-3 p-4 rounded-3xl text-center space-y-2.5 shadow-xl border animate-in zoom-in-95 ${
          isLight
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-gradient-to-r from-emerald-950 to-teal-950 border-emerald-500/50 text-white'
        }`}>
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl animate-bounce border ${
            isLight
              ? 'bg-white border-emerald-200 shadow-sm text-emerald-600'
              : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
          }`}>
            🏆
          </div>
          <h3 className={`text-base font-black ${isLight ? 'text-emerald-950' : 'text-white'}`}>
            Parabéns! Você encontrou todos os animais! 🌟
          </h3>
          <p className={`text-xs ${isLight ? 'text-emerald-800' : 'text-emerald-200'}`}>
            Completado em <strong>{movesCount} tentativas</strong> ({formatTime(timerSeconds)}) • <strong>+50 XP conquistados!</strong>
          </p>
          <button
            onClick={handleNextLevel}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
          >
            <span>Avançar para o Nível {currentLevelIndex + 2}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
