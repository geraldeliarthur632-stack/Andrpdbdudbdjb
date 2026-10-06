import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel, Question, UserProfile } from '../../types';
import { getQuestionsForMatch } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Calculator,
  Play,
  Zap,
  Timer,
  Flame,
  Sparkles,
  Volume2,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface MathChallengeModeProps {
  user: UserProfile;
  onBack: () => void;
  difficulty?: DifficultyLevel;
  onEarnPoints?: (points: number, isChallengeCompleted?: boolean) => void;
}

const STORAGE_MATH_PHASE_RECORD_KEY = 'estudahud_math_phase_record_v1';

export const MathChallengeMode: React.FC<MathChallengeModeProps> = ({
  user,
  onBack,
  difficulty = 'medium',
  onEarnPoints,
}) => {
  const [subMode, setSubMode] = useState<'menu' | 'solo'>('menu');

  const pointsPerCorrect = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 25 : 15;
  const initialTimer = difficulty === 'easy' ? 30 : difficulty === 'hard' ? 20 : 25;

  // --- SOLO STATE & INFINITE PHASES ---
  const [soloQuestions, setSoloQuestions] = useState<Question[]>([]);
  const [soloIndex, setSoloIndex] = useState(0);
  const [soloSelectedOption, setSoloSelectedOption] = useState<number | null>(null);
  const [soloSubmitted, setSoloSubmitted] = useState(false);
  const [soloScore, setSoloScore] = useState(0);
  const [soloStreak, setSoloStreak] = useState(0);
  const [soloTimer, setSoloTimer] = useState(initialTimer);
  const [isSoloFinished, setIsSoloFinished] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [maxPhaseReached, setMaxPhaseReached] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MATH_PHASE_RECORD_KEY);
      return saved ? parseInt(saved, 10) || 1 : 1;
    } catch {
      return 1;
    }
  });

  const soloTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      speechNarrator.stop();
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
    };
  }, []);

  // --- SOLO TIMER ---
  useEffect(() => {
    if (subMode === 'solo' && !soloSubmitted && !isSoloFinished && soloQuestions.length > 0) {
      soloTimerRef.current = window.setInterval(() => {
        setSoloTimer((prev) => {
          if (prev <= 1) {
            handleSoloSubmit(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (soloTimerRef.current) {
        clearInterval(soloTimerRef.current);
        soloTimerRef.current = null;
      }
    };
  }, [subMode, soloSubmitted, isSoloFinished, soloIndex, soloQuestions.length]);

  const currentSoloQ = soloQuestions[soloIndex];

  // Auto-speak question on solo math load or step
  useEffect(() => {
    if (subMode === 'solo' && currentSoloQ && !soloSubmitted && !isSoloFinished) {
      const timer = setTimeout(() => {
        speechNarrator.speakQuestion({
          questionIndex: soloIndex,
          questionText: currentSoloQ.question,
          options: currentSoloQ.options || [],
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
        setIsSpeaking(false);
      };
    }
  }, [subMode, soloIndex, soloSubmitted, isSoloFinished, currentSoloQ?.id]);

  // Start Solo Math
  const startSoloMath = (phase = 1) => {
    soundEffects.playClick();
    const questions = getQuestionsForMatch(user.grade, 10, difficulty as DifficultyLevel, 'matematica');
    setSoloQuestions(questions);
    setSoloIndex(0);
    setSoloSelectedOption(null);
    setSoloSubmitted(false);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloTimer(initialTimer);
    setIsSoloFinished(false);
    setCurrentPhase(phase);
    setSubMode('solo');
  };

  const handleSoloSubmit = (overrideOpt?: number | null) => {
    if (soloSubmitted) return;
    const chosen = overrideOpt !== undefined ? overrideOpt : soloSelectedOption;
    const currentQ = soloQuestions[soloIndex];
    if (!currentQ) return;

    setSoloSubmitted(true);
    const isCorrect = chosen === currentQ.correctIndex;

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      const nextStreak = soloStreak + 1;
      setSoloStreak(nextStreak);
      const streakBonus = Math.floor(nextStreak / 3) * 5;
      const phaseMultiplier = Math.max(1, Math.floor(currentPhase * 0.4));
      const earned = (pointsPerCorrect + streakBonus) * phaseMultiplier;
      setSoloScore((prev) => prev + earned);
    } else {
      soundEffects.playError();
      setSoloStreak(0);
    }
  };

  const handleSoloNext = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeaking(false);

    if (soloIndex < soloQuestions.length - 1) {
      setSoloIndex((prev) => prev + 1);
      setSoloSelectedOption(null);
      setSoloSubmitted(false);
      setSoloTimer(initialTimer);
    } else {
      // Completed current 10 questions phase
      setIsSoloFinished(true);
      soundEffects.playLevelUp();
      if (onEarnPoints && soloScore > 0) {
        onEarnPoints(soloScore, true);
      }

      if (currentPhase >= maxPhaseReached) {
        const nextMax = currentPhase + 1;
        setMaxPhaseReached(nextMax);
        try {
          localStorage.setItem(STORAGE_MATH_PHASE_RECORD_KEY, nextMax.toString());
        } catch {}
      }
    }
  };

  const handleAdvanceToNextPhase = () => {
    soundEffects.playClick();
    const nextPhase = currentPhase + 1;
    const questions = getQuestionsForMatch(user.grade, 10, difficulty as DifficultyLevel, 'matematica');
    setSoloQuestions(questions);
    setSoloIndex(0);
    setSoloSelectedOption(null);
    setSoloSubmitted(false);
    setSoloTimer(Math.max(15, initialTimer - Math.min(10, nextPhase)));
    setIsSoloFinished(false);
    setCurrentPhase(nextPhase);
  };

  const handleSpeakManually = () => {
    if (!currentSoloQ) return;
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      speechNarrator.speakQuestion({
        questionIndex: soloIndex,
        questionText: currentSoloQ.question,
        options: currentSoloQ.options || [],
        force: true,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 max-w-lg mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            speechNarrator.stop();
            if (subMode !== 'menu') {
              setSubMode('menu');
              setIsSoloFinished(false);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{subMode === 'menu' ? 'Central de Desafios' : 'Menu de Matemática'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-900 text-xs font-bold shadow-xs">
          <Calculator className="w-3.5 h-3.5 text-amber-700" />
          <span>Competição de Matemática Online</span>
        </div>
      </div>

      {/* SUBMODE: MENU */}
      {subMode === 'menu' && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Competição de Matemática Online</h2>
              <p className="text-xs text-slate-600 leading-snug">
                Resolva cálculos rápidos com leitura de voz automática da IA e avance pelas <strong>Fases Infinitas (1 a ∞)</strong>!
              </p>
            </div>

            {/* Solo Phase Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Modo Fases Infinitas (1 a ∞)</h3>
                    <p className="text-[11px] text-slate-500">10 perguntas com voz automática por fase</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Recorde: Fase {maxPhaseReached}
                </span>
              </div>

              <button
                onClick={() => startSoloMath(1)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Começar Desafio Matemático</span>
              </button>
            </div>

            {/* Feature Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Voz IA Automática Ativada</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Cada equação é anunciada com clareza pela IA sintetizadora. Responda clicando na alternativa ou utilizando os comandos por voz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODE: SOLO PLAYING */}
      {subMode === 'solo' && !isSoloFinished && currentSoloQ && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* HUD Status Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs text-xs font-bold mb-3">
              <div className="flex items-center gap-1.5 text-amber-700">
                <Zap className="w-4 h-4" />
                <span>{soloScore} pts</span>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <span>Fase {currentPhase}</span>
                <span className="text-[10px] text-slate-500 font-normal">({soloIndex + 1}/10)</span>
              </div>

              <div className="flex items-center gap-1 text-slate-700 font-mono">
                <Timer className="w-3.5 h-3.5 text-rose-600" />
                <span>{soloTimer}s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-amber-600 transition-all duration-300 rounded-full"
                style={{ width: `${((soloIndex + 1) / 10) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-2 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  {currentSoloQ.topic || 'Cálculo & Lógica'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeakManually}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                      isSpeaking
                        ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{isSpeaking ? 'Falando...' : 'Ouvir IA'}</span>
                  </button>

                  {soloStreak > 1 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {soloStreak}x Combo
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{currentSoloQ.question}</h3>
            </div>

            {/* Multiple-Choice Answer Options (A, B, C, D) */}
            <div className="space-y-2 mb-3">
              {(currentSoloQ.options || []).map((optionText, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = soloSelectedOption === idx;
                const isCorrect = idx === currentSoloQ.correctIndex;

                let optionStyles = 'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs';
                let letterStyles = 'bg-slate-100 border-slate-200 text-slate-700';

                if (isSelected && !soloSubmitted) {
                  optionStyles = 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/40 shadow-sm';
                  letterStyles = 'bg-amber-600 border-amber-600 text-white';
                }

                if (soloSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md';
                    letterStyles = 'bg-emerald-700 border-emerald-700 text-white';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-600 border-rose-600 text-white font-bold shadow-md';
                    letterStyles = 'bg-rose-700 border-rose-700 text-white';
                  } else {
                    optionStyles = 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60';
                    letterStyles = 'bg-slate-200 border-slate-300 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={soloSubmitted}
                    onClick={() => {
                      if (!soloSubmitted) {
                        soundEffects.playClick();
                        setSoloSelectedOption(idx);
                      }
                    }}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 active:scale-[0.99] text-xs sm:text-sm font-medium ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 transition-colors ${letterStyles}`}>
                        {letter}
                      </span>
                      <span className="min-w-0 font-medium break-words leading-tight">{optionText}</span>
                    </div>

                    {soloSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    )}
                    {soloSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submission / Feedback Controls */}
            {!soloSubmitted ? (
              <button
                disabled={soloSelectedOption === null}
                onClick={() => handleSoloSubmit()}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] mb-3 ${
                  soloSelectedOption !== null
                    ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <span>Confirmar Resposta</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-2 mb-3">
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    soloSelectedOption === currentSoloQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">
                      {soloSelectedOption === currentSoloQ.correctIndex ? '🎯' : '💡'}
                    </span>
                    <div>
                      <p className="text-xs font-black">
                        {soloSelectedOption === currentSoloQ.correctIndex
                          ? 'Resposta Correta!'
                          : `Resposta Incorreta! A alternativa correta é a Letra ${String.fromCharCode(65 + currentSoloQ.correctIndex)}.`}
                      </p>
                      {currentSoloQ.explanation && (
                        <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                          {currentSoloQ.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSoloNext}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
                >
                  <span>{soloIndex < soloQuestions.length - 1 ? 'Próxima Questão' : 'Ver Resultado da Fase'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Voice Controller (Auxiliary input) */}
            <VoiceAnswerController
              options={currentSoloQ.options || []}
              selectedOption={soloSelectedOption}
              isAnswerSubmitted={soloSubmitted}
              onSelectOption={(idx) => {
                if (!soloSubmitted) setSoloSelectedOption(idx);
              }}
              onSubmitAnswer={() => handleSoloSubmit()}
              onCannotSpeak={() => {}}
              correctIndex={currentSoloQ.correctIndex}
              explanation={currentSoloQ.explanation}
              onNext={handleSoloNext}
              subjectId="matematica"
            />
          </div>
        </div>
      )}

      {/* SUBMODE: SOLO FINISHED (PHASE CLEARED) */}
      {subMode === 'solo' && isSoloFinished && (
        <div className="flex-1 flex flex-col justify-between space-y-4 text-center my-auto">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mx-auto shadow-xs">
              🏆
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Fase {currentPhase} Concluída!</h3>
              <p className="text-xs text-slate-500">Parabéns pelo treino de raciocínio matemático</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs text-amber-800 font-bold block">Pontuação Conquistada</span>
              <span className="text-2xl font-black text-amber-950 font-mono">+{soloScore} pts</span>
            </div>

            {currentPhase >= maxPhaseReached && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Novo Recorde Pessoal: Fase {currentPhase}!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAdvanceToNextPhase}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
            >
              <span>Avançar para a Fase {currentPhase + 1} (Infinito)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setSubMode('menu');
                setIsSoloFinished(false);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
