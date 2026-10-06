import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  Calculator,
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Volume2,
} from 'lucide-react';

interface MathTimesTableModeProps {
  onBack: () => void;
  onAddScore: (points: number) => void;
}

type TabType = 'tabuada' | 'divisao' | 'infinito' | 'tabela_visual';

interface QuestionItem {
  num1: number;
  num2: number;
  operator: 'x' | '÷';
  answer: number;
  options: number[];
}

const STORAGE_INFINITE_RECORD_KEY = 'estudahud_math_infinite_level_record';

export const MathTimesTableMode: React.FC<MathTimesTableModeProps> = ({ onBack, onAddScore }) => {
  const [activeTab, setActiveTab] = useState<TabType>('infinito');
  const [selectedNumber, setSelectedNumber] = useState<number | 'all'>('all');

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Infinite Levels progression state
  const [infiniteLevel, setInfiniteLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0); // 0 to 5 per level
  const [levelMaxReached, setLevelMaxReached] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INFINITE_RECORD_KEY);
      return saved ? parseInt(saved, 10) || 1 : 1;
    } catch {
      return 1;
    }
  });

  const timerRef = useRef<any>(null);

  // Generate question based on infinite level or mode
  const generateQuestion = (tab: TabType, specificNum: number | 'all', levelNum = 1): QuestionItem => {
    let n1 = 1;
    let n2 = 1;
    let op: 'x' | '÷' = 'x';
    let ans = 1;

    if (tab === 'infinito') {
      // Dynamic difficulty scaling with infinite levels
      const maxTable = Math.min(5 + Math.floor(levelNum * 0.8), 20);
      const isDivision = Math.random() > 0.45;

      if (isDivision) {
        op = '÷';
        n2 = Math.floor(Math.random() * Math.min(10, 2 + Math.floor(levelNum * 0.5))) + 2;
        ans = Math.floor(Math.random() * maxTable) + 1;
        n1 = n2 * ans;
      } else {
        op = 'x';
        n1 = Math.floor(Math.random() * maxTable) + 1;
        n2 = Math.floor(Math.random() * Math.min(12, 4 + Math.floor(levelNum * 0.4))) + 1;
        ans = n1 * n2;
      }
    } else if (tab === 'tabuada') {
      op = 'x';
      n1 = specificNum === 'all' ? Math.floor(Math.random() * 12) + 1 : specificNum;
      n2 = Math.floor(Math.random() * 12) + 1;
      ans = n1 * n2;
    } else {
      // Divisão
      op = '÷';
      n2 = specificNum === 'all' ? Math.floor(Math.random() * 11) + 2 : (specificNum === 1 ? 2 : specificNum);
      ans = Math.floor(Math.random() * 12) + 1;
      n1 = n2 * ans;
    }

    // Generate 4 plausible options
    const opts = new Set<number>();
    opts.add(ans);

    while (opts.size < 4) {
      let offset = (Math.floor(Math.random() * 7) - 3);
      if (offset === 0) offset = 1;
      let fake = ans + offset;
      if (fake <= 0) fake = ans + Math.abs(offset) + 2;
      opts.add(fake);
    }

    const optionsArray = Array.from(opts);
    // Unbiased Fisher-Yates shuffle
    for (let i = optionsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    return {
      num1: n1,
      num2: n2,
      operator: op,
      answer: ans,
      options: optionsArray,
    };
  };

  const startGame = () => {
    soundEffects.playClick();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(activeTab === 'infinito' ? 45 : 60);
    setLives(3);
    setFeedback(null);
    setSelectedOption(null);
    setInfiniteLevel(1);
    setLevelProgress(0);

    const firstQ = generateQuestion(activeTab, selectedNumber, 1);
    setCurrentQuestion(firstQ);
  };

  // Timer loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver]);

  // Auto-speak question when currentQuestion changes
  useEffect(() => {
    if (isPlaying && currentQuestion && !gameOver && !feedback) {
      const opText = currentQuestion.operator === 'x' ? 'vezes' : 'dividido por';
      const speechText = `Quanto é ${currentQuestion.num1} ${opText} ${currentQuestion.num2}?`;
      const timer = setTimeout(() => {
        if (speechNarrator.isAutoNarrateEnabled()) {
          speechNarrator.speak(speechText, undefined, undefined, undefined, 1.0);
        }
      }, 250);

      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
      };
    }
  }, [isPlaying, currentQuestion, gameOver, feedback]);

  // Cleanup narrator on unmount
  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  const finishGame = () => {
    speechNarrator.stop();
    setGameOver(true);
    setIsPlaying(false);
    soundEffects.playLevelUp();
    if (score > 0) {
      onAddScore(score);
    }

    if (infiniteLevel > levelMaxReached) {
      setLevelMaxReached(infiniteLevel);
      try {
        localStorage.setItem(STORAGE_INFINITE_RECORD_KEY, infiniteLevel.toString());
      } catch {}
    }
  };

  const handleSelectAnswer = (option: number) => {
    if (!currentQuestion || feedback) return;

    setSelectedOption(option);

    if (option === currentQuestion.answer) {
      // Correct
      soundEffects.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const levelMultiplier = activeTab === 'infinito' ? Math.max(1, Math.floor(infiniteLevel * 0.5)) : 1;
      const pointsEarned = (10 + newStreak * 2) * levelMultiplier;
      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);

      // Infinite level progression
      if (activeTab === 'infinito') {
        const nextProgress = levelProgress + 1;
        if (nextProgress >= 5) {
          // Level UP!
          soundEffects.playLevelUp();
          const nextLevel = infiniteLevel + 1;
          setInfiniteLevel(nextLevel);
          setLevelProgress(0);
          setTimeLeft((prev) => Math.min(prev + 15, 60)); // Time bonus!

          if (nextLevel > levelMaxReached) {
            setLevelMaxReached(nextLevel);
            try {
              localStorage.setItem(STORAGE_INFINITE_RECORD_KEY, nextLevel.toString());
            } catch {}
          }
        } else {
          setLevelProgress(nextProgress);
        }
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        setCurrentQuestion(generateQuestion(activeTab, selectedNumber, infiniteLevel));
      }, 500);
    } else {
      // Wrong
      soundEffects.playError();
      setFeedback('wrong');
      setStreak(0);
      setWrongCount((prev) => prev + 1);

      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setTimeout(() => {
          finishGame();
        }, 600);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setSelectedOption(null);
          setCurrentQuestion(generateQuestion(activeTab, selectedNumber, infiniteLevel));
        }, 700);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 max-w-lg mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            if (isPlaying) {
              setIsPlaying(false);
              setGameOver(false);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isPlaying ? 'Sair do Jogo' : 'Início'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-blue-900 text-xs font-bold shadow-xs">
          <Calculator className="w-3.5 h-3.5 text-blue-700" />
          <span>Tabuada & Divisão</span>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Treino & Desafios de Cálculo Mental
              </h2>
              <p className="text-xs text-slate-600 leading-snug">
                Domine a multiplicação, divisão exata e avance pelos <strong>Níveis Infinitos</strong> com combos e recordes!
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('infinito');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'infinito'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ♾️ Infinito
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('tabuada');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'tabuada'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✖️ Tabuada
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('divisao');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'divisao'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ➗ Divisão
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('tabela_visual');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'tabela_visual'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Tabela
              </button>
            </div>

            {/* Mode Specific Description Card */}
            {activeTab === 'infinito' && (
              <div className="p-4 bg-white border border-blue-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                      🚀
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Modo Níveis Infinitos (1 a ∞)</h4>
                      <p className="text-[10px] text-slate-500">A cada 5 acertos, suba de nível com bônus de tempo</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Recorde: Nível {levelMaxReached}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-emerald-600 font-bold">✓ Vidas:</span> 3 corações por partida
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-blue-600 font-bold">✓ Bônus:</span> +15 segundos a cada nível concluído
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-amber-600 font-bold">✓ Multiplicador:</span> Mais pontos por nível alto
                  </p>
                </div>
              </div>
            )}

            {/* Select Number for Tabuada/Divisao */}
            {(activeTab === 'tabuada' || activeTab === 'divisao') && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Escolha o número que deseja treinar:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedNumber('all');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      selectedNumber === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Todos (1-12)
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedNumber(num);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedNumber === num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {activeTab === 'tabuada' ? `×${num}` : `÷${num}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Table */}
            {activeTab === 'tabela_visual' && (
              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 max-h-72 overflow-y-auto shadow-xs">
                <span className="text-xs font-bold text-slate-800 block">Tabela da Tabuada de 1 a 10</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                    <div key={t} className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <strong className="text-blue-700 block border-b border-slate-200 pb-0.5 mb-1 font-mono">
                        Tabuada do {t}
                      </strong>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
                        <div key={m} className="flex justify-between font-mono text-[10px]">
                          <span>{t} × {m}</span>
                          <span className="font-bold text-slate-900">= {t * m}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeTab !== 'tabela_visual' && (
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
            >
              <span>Começar Desafio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : isPlaying && currentQuestion ? (
        /* PLAYING VIEW */
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* HUD Status Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs text-xs font-bold mb-3">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Trophy className="w-4 h-4" />
                <span>{score} pts</span>
              </div>

              {activeTab === 'infinito' && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px]">
                  <span>Nível {infiniteLevel}</span>
                  <span className="text-[10px] text-slate-500">({levelProgress}/5)</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {[1, 2, 3].map((heart) => (
                  <span
                    key={heart}
                    className={`text-sm ${heart <= lives ? 'opacity-100' : 'opacity-20 grayscale'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-slate-700 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Infinite Level Progress Bar */}
            {activeTab === 'infinito' && (
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(levelProgress / 5) * 100}%` }}
                />
              </div>
            )}

            {/* Main Math Question Card */}
            <div
              className={`p-6 rounded-3xl border text-center transition-all duration-200 mb-4 shadow-sm ${
                feedback === 'correct'
                  ? 'bg-emerald-50 border-emerald-400'
                  : feedback === 'wrong'
                  ? 'bg-rose-50 border-rose-400'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Quanto é?
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono flex items-center justify-center gap-3">
                <span>{currentQuestion.num1}</span>
                <span className="text-blue-600">{currentQuestion.operator}</span>
                <span>{currentQuestion.num2}</span>
                <span className="text-slate-400">=</span>
                <span className="text-blue-700">?</span>
              </div>

              {streak > 1 && (
                <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Combo {streak}x!</span>
                </div>
              )}
            </div>

            {/* Answer Options Grid (A, B, C, D) */}
            <div className="grid grid-cols-2 gap-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQuestion.answer;

                let btnStyles = 'bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50/50';
                let letterStyles = 'bg-slate-100 text-slate-600 border-slate-200';

                if (feedback) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black';
                    letterStyles = 'bg-emerald-700 text-white border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'bg-rose-600 text-white border-rose-600 shadow-md font-black';
                    letterStyles = 'bg-rose-700 text-white border-rose-500';
                  } else {
                    btnStyles = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                    letterStyles = 'bg-slate-200 text-slate-400 border-slate-300';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition active:scale-[0.98] shadow-xs flex items-center justify-between gap-2 ${btnStyles}`}
                  >
                    <span className={`w-6 h-6 rounded-lg border text-xs font-black flex items-center justify-center shrink-0 ${letterStyles}`}>
                      {letter}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono flex-1 text-center">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* GAME OVER SUMMARY VIEW */
        <div className="flex-1 flex flex-col justify-between space-y-4 text-center my-auto">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mx-auto shadow-xs">
              🏆
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Desafio Concluído!</h3>
              <p className="text-xs text-slate-500">Confira seu desempenho no treino de cálculo</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[10px] text-blue-700 font-bold block">Pontos</span>
                <span className="text-base font-black text-blue-900 font-mono">+{score}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold block">Acertos</span>
                <span className="text-base font-black text-emerald-900 font-mono">{correctCount}</span>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] text-amber-700 font-bold block">
                  {activeTab === 'infinito' ? 'Nível' : 'Max Combo'}
                </span>
                <span className="text-base font-black text-amber-900 font-mono">
                  {activeTab === 'infinito' ? `Nível ${infiniteLevel}` : `${maxStreak}x`}
                </span>
              </div>
            </div>

            {activeTab === 'infinito' && infiniteLevel >= levelMaxReached && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Novo Recorde Pessoal: Nível {infiniteLevel}!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameOver(false);
                setIsPlaying(false);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Voltar ao Menu da Tabuada
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
