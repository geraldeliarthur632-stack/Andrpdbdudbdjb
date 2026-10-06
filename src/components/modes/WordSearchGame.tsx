import React, { useState, useEffect, useMemo } from 'react';
import { generateRandomWordSearchGrid, WordSearchLevel } from '../../data/educationalGamesData';
import { GradeLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Eraser,
} from 'lucide-react';

interface WordSearchGameProps {
  grade?: GradeLevel;
  theme?: 'light' | 'dark';
  onBack: () => void;
  onEarnPoints: (pts: number, isMajor?: boolean) => void;
}

const STORAGE_WORDSEARCH_KEY = 'estudahud_wordsearch_lvl_v3';

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  grade = '6_fund' as GradeLevel,
  theme = 'light',
  onBack,
  onEarnPoints,
}) => {
  const isLight = theme === 'light';
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_WORDSEARCH_KEY}_${grade}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch {}
    return 0;
  });

  // Generate randomized grid on level / seed change
  const [levelSeed, setLevelSeed] = useState<number>(0);
  const level: WordSearchLevel = useMemo(() => {
    return generateRandomWordSearchGrid(currentLevelIndex + levelSeed, grade);
  }, [currentLevelIndex, levelSeed, grade]);

  // List of found word strings
  const [foundWords, setFoundWords] = useState<string[]>([]);
  // Cells that have been matched: set of 'r,c' keys
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  // Currently clicked sequence of cells: [[r, c], [r, c], ...]
  const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset when level changes
  useEffect(() => {
    setFoundWords([]);
    setFoundCells(new Set());
    setSelectedPath([]);
    setIsCompleted(false);
  }, [currentLevelIndex, levelSeed]);

  // Check completion
  useEffect(() => {
    if (level.words.length > 0 && foundWords.length === level.words.length) {
      if (!isCompleted) {
        setIsCompleted(true);
        soundEffects.playLevelUp();
        onEarnPoints(40, true);
        try {
          localStorage.setItem(`${STORAGE_WORDSEARCH_KEY}_${grade}`, String(currentLevelIndex + 1));
        } catch {}
      }
    }
  }, [foundWords, level.words.length, isCompleted, currentLevelIndex, grade, onEarnPoints]);

  // Helper to check if two cells are adjacent (distance <= 1 in row and col)
  const isAdjacent = (r1: number, c1: number, r2: number, c2: number) => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  };

  // Helper to check if a new cell continues the direction of the current path
  const isValidNextStep = (path: [number, number][], r: number, c: number) => {
    if (path.length === 0) return true;
    const [lastR, lastC] = path[path.length - 1];

    if (!isAdjacent(lastR, lastC, r, c)) return false;

    if (path.length === 1) return true; // Any adjacent cell is fine for 2nd letter

    // For 3rd+ letter, verify same delta direction
    const [firstR, firstC] = path[path.length - 2];
    const expectedDr = lastR - firstR;
    const expectedDc = lastC - firstC;

    const actualDr = r - lastR;
    const actualDc = c - lastC;

    return actualDr === expectedDr && actualDc === expectedDc;
  };

  // Handle letter clicking letter-by-letter
  const handleCellClick = (r: number, c: number) => {
    if (isCompleted) return;

    soundEffects.playClick();

    // If already in selectedPath at the end, clicking it again could undo last step
    const cellKey = `${r},${c}`;
    const isAlreadySelected = selectedPath.some(([row, col]) => row === r && col === c);

    if (isAlreadySelected) {
      // If clicking the last cell, deselect it
      if (
        selectedPath.length > 0 &&
        selectedPath[selectedPath.length - 1][0] === r &&
        selectedPath[selectedPath.length - 1][1] === c
      ) {
        setSelectedPath((prev) => prev.slice(0, -1));
        return;
      }
      // If clicking an earlier cell, restart selection from this cell
      setSelectedPath([[r, c]]);
      return;
    }

    // If starting a fresh selection
    if (selectedPath.length === 0) {
      setSelectedPath([[r, c]]);
      return;
    }

    // If valid next consecutive letter in the line
    if (isValidNextStep(selectedPath, r, c)) {
      const nextPath: [number, number][] = [...selectedPath, [r, c]];
      setSelectedPath(nextPath);

      // Check if current path forms any unfound target word
      const formedLetters = nextPath.map(([row, col]) => level.grid[row]?.[col] || '').join('');
      const reversedLetters = formedLetters.split('').reverse().join('');

      const matchedWord = level.words.find(
        (w) =>
          !foundWords.includes(w.word) &&
          (w.word === formedLetters || w.word === reversedLetters)
      );

      if (matchedWord) {
        // Matched! Cross it out on the board and in the list
        soundEffects.playCorrect('bonus');
        setFoundWords((prev) => [...prev, matchedWord.word]);

        // Add all path cells to foundCells set
        setFoundCells((prev) => {
          const nextSet = new Set(prev);
          nextPath.forEach(([row, col]) => nextSet.add(`${row},${col}`));
          return nextSet;
        });

        // Clear active selection
        setSelectedPath([]);
      }
    } else {
      // Clicked a non-consecutive cell -> start fresh from this new cell
      setSelectedPath([[r, c]]);
    }
  };

  const handleClearSelection = () => {
    soundEffects.playClick();
    setSelectedPath([]);
  };

  const handleShuffleBoard = () => {
    soundEffects.playClick();
    setLevelSeed((prev) => prev + 1);
  };

  const handleNextLevel = () => {
    soundEffects.playClick();
    setCurrentLevelIndex((prev) => prev + 1);
    setLevelSeed(0);
  };

  const handlePrevLevel = () => {
    if (currentLevelIndex <= 0) return;
    soundEffects.playClick();
    setCurrentLevelIndex((prev) => prev - 1);
    setLevelSeed(0);
  };

  const currentSpelledWord = selectedPath
    .map(([r, c]) => level.grid[r]?.[c] || '')
    .join('');

  return (
    <div className={`flex-1 flex flex-col p-4 max-w-lg mx-auto w-full pb-24 select-none ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090d16] text-white'
    }`}>
      {/* TOP HEADER */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className={`flex items-center gap-1.5 text-xs p-2 rounded-xl border transition cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              : 'bg-[#121829] border-[#1f2b45] text-slate-400 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs border ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
        }`}>
          <Search className="w-3.5 h-3.5 text-emerald-500" />
          <span>Caça-Palavras</span>
        </div>
      </div>

      {/* LEVEL HEADER & INSTRUCTIONS */}
      <div className={`p-3.5 rounded-3xl mb-3 shadow-lg space-y-2.5 border ${
        isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#1f2b45]'
      }`}>
        <div className="flex items-center justify-between">
          <button
            disabled={currentLevelIndex <= 0}
            onClick={handlePrevLevel}
            className={`p-1.5 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'border-[#273553] text-slate-400 hover:text-white hover:bg-[#161f38]'
            }`}
            title="Nível anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{level.title}</h2>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block mt-0.5 ${
              isLight
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
            }`}>
              {level.theme} • {foundWords.length}/{level.words.length} Encontradas
            </span>
          </div>

          <button
            onClick={handleNextLevel}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'border-[#273553] text-slate-400 hover:text-white hover:bg-[#161f38]'
            }`}
            title="Próximo nível"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action / Helper Bar */}
        <div className={`flex items-center justify-between text-xs pt-1.5 border-t font-semibold ${
          isLight ? 'border-slate-100 text-slate-600' : 'border-[#1f2b45] text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {currentSpelledWord ? (
                <>Letras: <strong className={isLight ? 'text-amber-600 font-mono tracking-wider' : 'text-amber-300 font-mono tracking-wider'}>{currentSpelledWord}</strong></>
              ) : (
                'Toque em cada letra na ordem para formar a palavra'
              )}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {selectedPath.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                <Eraser className="w-3 h-3" />
                <span>Desmarcar</span>
              </button>
            )}

            <button
              onClick={handleShuffleBoard}
              className={`flex items-center gap-1 text-[11px] p-1 rounded-md transition cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-[#161f38]'
              }`}
              title="Embaralhar palavras no tabuleiro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Embaralhar</span>
            </button>
          </div>
        </div>
      </div>

      {/* LETTER GRID BOARD (TABULEIRO COM PALAVRAS RISCADAS) */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <div className={`p-3 rounded-3xl shadow-xl inline-block border-2 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#121829] border-[#1f2b45]'
        }`}>
          <div
            className="grid gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {level.grid.map((row, r) =>
              row.map((letter, c) => {
                const cellKey = `${r},${c}`;
                const isFound = foundCells.has(cellKey);
                const isSelected = selectedPath.some(([rowIdx, colIdx]) => rowIdx === r && colIdx === c);

                return (
                  <button
                    key={cellKey}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-150 relative active:scale-90 cursor-pointer ${
                      isFound
                        ? isLight
                          ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                        : isSelected
                        ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 scale-105 shadow-md font-extrabold'
                        : isLight
                        ? 'bg-slate-100 border border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-slate-200/80'
                        : 'bg-[#0b0f19] border border-[#1f2b45] text-slate-200 hover:border-[#8b5cf6]/50 hover:bg-[#161f38]'
                    }`}
                  >
                    <span>{letter}</span>

                    {/* Visual Strike-Through Line / Mark on Board for Found Words */}
                    {isFound && (
                      <span className={`absolute inset-x-1 h-0.5 rounded-full pointer-events-none rotate-[-20deg] ${
                        isLight ? 'bg-emerald-600' : 'bg-emerald-400/80'
                      }`} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* WORD LIST (PALAVRAS RISCADAS) */}
      <div className={`mt-3 p-3.5 rounded-3xl shadow-lg space-y-2 border ${
        isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#1f2b45]'
      }`}>
        <span className={`text-[11px] font-black uppercase tracking-wider block ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          Palavras para Encontrar ({foundWords.length}/{level.words.length}):
        </span>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {level.words.map((w, idx) => {
            const isWordFound = foundWords.includes(w.word);

            return (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                  isWordFound
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-70 scale-95'
                      : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 line-through opacity-70 scale-95 shadow-inner'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-[#0b0f19] border-[#1f2b45] text-slate-200'
                }`}
                title={w.hint}
              >
                {isWordFound && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                <span>{w.word}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* LEVEL COMPLETED CALLOUT */}
      {isCompleted && (
        <div className={`mt-3 p-4 rounded-3xl text-center space-y-2.5 shadow-xl animate-in zoom-in-95 border ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-gradient-to-r from-emerald-950 to-teal-950 border-emerald-500/50 text-white'
        }`}>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-500 mx-auto flex items-center justify-center text-2xl animate-bounce">
            🎉
          </div>
          <h3 className={`text-base font-black ${isLight ? 'text-emerald-950' : 'text-white'}`}>
            Excelente! Você riscou todas as palavras! 🏆
          </h3>
          <p className={`text-xs ${isLight ? 'text-emerald-800' : 'text-emerald-200'}`}>
            Você completou o <strong>{level.title}</strong> e ganhou <strong>+40 XP</strong>!
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
