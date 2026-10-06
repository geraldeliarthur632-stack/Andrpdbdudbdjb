import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  BookOpen,
  Zap,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Check,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { speechNarrator } from '../services/speechNarrator';
import { soundEffects } from '../services/soundEffects';

export interface AudioTheoryIntroPlayerProps {
  title: string;
  subtitle?: string;
  subjectName: string;
  gradeLabel?: string;
  gradeBadge?: string;
  phaseLabel?: string;
  phaseColor?: 'blue' | 'amber' | 'emerald' | 'purple';
  summary?: string;
  summaryText?: string;
  detailedExplanation?: string;
  keyPoints?: string[];
  howToSolve?: string[];
  example?: string;
  practicalExample?: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'amber' | 'emerald' | 'purple';
  onStartExercises?: () => void;
  onStartQuestions?: () => void;
  onSaveToNotes?: () => void;
  isSavedToNotes?: boolean;
  isNoteSaved?: boolean;
  exerciseButtonLabel?: string;
  startQuestionsLabel?: string;
}

export const AudioTheoryIntroPlayer: React.FC<AudioTheoryIntroPlayerProps> = ({
  title,
  subtitle,
  subjectName,
  gradeLabel,
  gradeBadge,
  phaseLabel,
  phaseColor,
  summary,
  summaryText,
  detailedExplanation,
  keyPoints = [],
  howToSolve = [],
  example,
  practicalExample,
  badgeText,
  badgeColor,
  onStartExercises,
  onStartQuestions,
  onSaveToNotes,
  isSavedToNotes,
  isNoteSaved,
  exerciseButtonLabel,
  startQuestionsLabel,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'all' | 'content' | 'how_to' | 'example'>('all');

  useEffect(() => {
    const unsub = speechNarrator.subscribeStatus((status) => {
      if (status === 'playing') {
        setIsPlaying(true);
        setIsPaused(false);
      } else if (status === 'paused') {
        setIsPlaying(true);
        setIsPaused(true);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
    });

    return () => {
      unsub();
      speechNarrator.stop();
    };
  }, []);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('estudahud_autoplay_theory') !== 'false';
    } catch {
      return true;
    }
  });

  const effectiveContent = detailedExplanation || summaryText || summary || '';
  const effectiveExample = practicalExample || example || '';
  const effectiveSteps = (howToSolve && howToSolve.length > 0) ? howToSolve : keyPoints;
  const effectiveBadgeText = phaseLabel || badgeText || 'Conteúdo da Aula';
  const effectiveBadgeColor = phaseColor || badgeColor || 'blue';
  const effectiveGradeBadge = gradeBadge || gradeLabel || '';
  const effectiveButtonLabel = startQuestionsLabel || exerciseButtonLabel || 'Ir para as Perguntas';
  const effectiveIsSaved = Boolean(isSavedToNotes || isNoteSaved);

  const handleStart = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsPlaying(false);
    if (onStartQuestions) {
      onStartQuestions();
    } else if (onStartExercises) {
      onStartExercises();
    }
  };

  // Prepare full speech text focusing directly on content, how-to, and example
  const fullText = React.useMemo(() => {
    const stepsStr = Array.isArray(effectiveSteps) && effectiveSteps.length > 0
      ? `Como fazer e regras importantes: ${effectiveSteps.join('. ')}.`
      : '';
    const exampleStr = effectiveExample ? `Exemplo do conteúdo: ${effectiveExample}.` : '';

    return `Aula de ${subjectName}. Título: ${title}. O Conteúdo que vai cair nas perguntas: ${effectiveContent}. ${stepsStr} ${exampleStr} Toque no botão abaixo para ir para as perguntas.`;
  }, [subjectName, title, effectiveContent, effectiveSteps, effectiveExample]);

  // Handle Play / Pause / Resume
  const handleTogglePlay = () => {
    soundEffects.playClick();
    if (!isPlaying) {
      speechNarrator.speak(
        fullText,
        {
          onStart: () => {
            setIsPlaying(true);
            setIsPaused(false);
          },
          onEnd: () => {
            setIsPlaying(false);
            setIsPaused(false);
          },
          onPause: () => setIsPaused(true),
          onResume: () => setIsPaused(false),
          rate: playbackSpeed,
        }
      );
    } else if (isPaused) {
      speechNarrator.resume();
    } else {
      speechNarrator.pause();
    }
  };

  const handleStopPlay = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Change speed
  const handleChangeSpeed = (speed: number) => {
    soundEffects.playClick();
    setPlaybackSpeed(speed);
    if (isPlaying) {
      speechNarrator.stop();
      speechNarrator.speak(
        fullText,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        undefined,
        speed
      );
    }
  };

  // Replay from start
  const handleReplay = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    speechNarrator.speak(
      fullText,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      undefined,
      playbackSpeed
    );
  };

  // Auto-play on mount if enabled
  useEffect(() => {
    let timer: any;
    if (isAutoPlayEnabled) {
      timer = setTimeout(() => {
        speechNarrator.speak(
          fullText,
          () => setIsPlaying(true),
          () => setIsPlaying(false),
          undefined,
          playbackSpeed
        );
      }, 40);
    }

    return () => {
      clearTimeout(timer);
      speechNarrator.stop();
      setIsPlaying(false);
    };
  }, [fullText, isAutoPlayEnabled]);

  const toggleAutoPlay = () => {
    soundEffects.playClick();
    const nextVal = !isAutoPlayEnabled;
    setIsAutoPlayEnabled(nextVal);
    try {
      localStorage.setItem('estudahud_autoplay_theory', String(nextVal));
    } catch {}
  };

  const headerBg = {
    blue: 'from-blue-700 via-indigo-700 to-blue-800',
    amber: 'from-amber-600 via-orange-600 to-amber-700',
    emerald: 'from-emerald-700 via-teal-700 to-emerald-800',
    purple: 'from-purple-700 via-indigo-700 to-purple-800',
  }[effectiveBadgeColor] || 'from-blue-700 to-indigo-800';

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col space-y-3 p-1">
      {/* Audio Header Bar */}
      <div className={`p-4 sm:p-5 bg-gradient-to-r ${headerBg} text-white rounded-2xl space-y-3 shadow-xs`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <Headphones className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200 block truncate">
                {effectiveBadgeText}
              </span>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                {title}
              </h2>
            </div>
          </div>

          {effectiveGradeBadge && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/20 shrink-0">
              {effectiveGradeBadge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-white/90 font-medium line-clamp-2">
            {subtitle}
          </p>
        )}

        {/* Audio Player Controls Bar */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Play/Pause/Resume Button */}
            <button
              onClick={handleTogglePlay}
              className="px-3.5 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              title={isPlaying && !isPaused ? 'Pausar Áudio' : isPaused ? 'Continuar Leitura' : 'Ouvir Explicação em Voz'}
            >
              {isPlaying && !isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-blue-700 fill-blue-700" />
                  <span>Pausar</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-blue-700 fill-blue-700" />
                  <span>Continuar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-blue-700 fill-blue-700" />
                  <span>Ouvir Aula</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            {(isPlaying || isPaused) && (
              <button
                onClick={handleStopPlay}
                className="px-2.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition active:scale-95 shrink-0 cursor-pointer"
                title="Parar áudio"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Replay Button */}
            <button
              onClick={handleReplay}
              className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-xl transition active:scale-95 shrink-0"
              title="Reiniciar áudio do início"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Sound Wave Visualizer when playing */}
            <div className="flex items-center gap-1 h-5 px-1.5 flex-1 justify-center">
              {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-white transition-all duration-300 ${
                    isPlaying ? 'animate-pulse' : 'opacity-35'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(5, height * 20)}px` : '4px',
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Speed & Autoplay options */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
            {/* Speed pills */}
            <div className="flex items-center gap-1 bg-black/25 rounded-lg p-0.5">
              {[0.85, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleChangeSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black transition ${
                    playbackSpeed === speed
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={toggleAutoPlay}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                isAutoPlayEnabled
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                  : 'bg-white/10 text-white/70 border-white/15'
              }`}
              title="Alternar reprodução automática de voz ao entrar"
            >
              Auto-Voz: {isAutoPlayEnabled ? 'LIGADO' : 'DESL.'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section Tabs */}
      <div className="px-2 pt-1">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('all');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('content');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'content'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 O Conteúdo
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('how_to');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'how_to'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Como Fazer
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('example');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'example'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💡 Exemplo
          </button>
        </div>
      </div>

      {/* Body Content Blocks: O Conteúdo, Como Fazer, Exemplos */}
      <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
        {/* 1. O CONTEÚDO QUE VAI CAIR */}
        {(activeTab === 'all' || activeTab === 'content') && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>O Conteúdo da Aula (O que vai cair nas perguntas):</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {effectiveContent}
            </p>
          </div>
        )}

        {/* 2. COMO FAZER & REGRAS */}
        {(activeTab === 'all' || activeTab === 'how_to') && Array.isArray(effectiveSteps) && effectiveSteps.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-950 font-extrabold text-xs">
              <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Como Fazer (Passo a Passo & Regras Práticas):</span>
            </div>
            <ul className="space-y-1.5">
              {effectiveSteps.map((step, i) => (
                <li key={i} className="text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. EXEMPLO DO CONTEÚDO */}
        {(activeTab === 'all' || activeTab === 'example') && effectiveExample && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-950 font-extrabold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Exemplo do Conteúdo (Resolvido Passo a Passo):</span>
            </div>
            <p className="text-xs text-blue-950 font-medium leading-relaxed bg-white/90 p-2.5 rounded-xl border border-blue-100 whitespace-pre-line">
              {effectiveExample}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions: Botão de Salvar e Botão Ir para as Perguntas */}
      <div className="p-3 pt-1 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
        {onSaveToNotes && (
          <button
            onClick={onSaveToNotes}
            className={`w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
              effectiveIsSaved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {effectiveIsSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Salvo no Meu Caderno!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-blue-600" />
                <span>Salvar Teoria no Caderno</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={handleStart}
          className="w-full flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
        >
          <span>{effectiveButtonLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
