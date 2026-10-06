import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../services/soundEffects';
import { studyGoalService } from '../services/studyGoalService';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Sparkles,
  Coffee,
  Brain,
  Headphones,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardPoints: (points: number) => void;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';
type Soundscape = 'none' | 'rain' | 'alpha' | 'whitenoise';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const STUDY_TIPS = [
  '💡 Mantenha a água por perto e afaste o celular durante o bloco de foco.',
  '📖 Fazer pequenas pausas de 5 minutos ajuda a consolidar a memória no cérebro.',
  '🎯 Ao estudar, tente explicar o conteúdo em voz alta com suas próprias palavras.',
  '✍️ Anotar os pontos mais difíceis no Bloco de Notas facilita a revisão pré-prova.',
  '🧠 O cérebro aprende por repetição espaçada: revise hoje e novamente em 3 dias!',
  '⚡ Resolver 5 exercícios práticos vale mais do que apenas reler a teoria.',
];

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  onAwardPoints,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<Soundscape>('none');
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  // Audio Context for synthetic soundscapes (Rain, Alpha Waves, White Noise)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  // Rotate tip every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          // If in focus mode, record study second to studyGoalService
          if (mode === 'focus') {
            studyGoalService.addStudySeconds(1);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, mode]);

  // Audio Soundscape Generator
  useEffect(() => {
    stopSoundscape();

    if (!isOpen || soundscape === 'none' || !isRunning) {
      return;
    }

    try {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      if (soundscape === 'alpha') {
        // Binaural 432Hz + 442Hz (10Hz Alpha beat for deep focus)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const masterGain = ctx.createGain();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(432, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(442, ctx.currentTime);

        masterGain.gain.setValueAtTime(0.04, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(masterGain);
        masterGain.connect(ctx.destination);

        oscL.start();
        oscR.start();
        soundNodesRef.current = [oscL, oscR, masterGain];
      } else if (soundscape === 'rain') {
        // Raindrop / Pink noise simulation
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        soundNodesRef.current = [whiteNoise, filter, gainNode];
      } else if (soundscape === 'whitenoise') {
        // Gentle White Noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        filter.Q.setValueAtTime(0.5, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();
        soundNodesRef.current = [noise, filter, gainNode];
      }
    } catch {
      // Audio fallback
    }

    return () => {
      stopSoundscape();
    };
  }, [isOpen, soundscape, isRunning]);

  const stopSoundscape = () => {
    try {
      soundNodesRef.current.forEach((node) => {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      });
      soundNodesRef.current = [];
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch {}
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundEffects.playVictory();

    if (mode === 'focus') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      onAwardPoints(50);
      setShowRewardModal(true);
      // Auto suggest short break
      setMode('short_break');
      setSecondsLeft(MODE_DURATIONS.short_break);
    } else {
      // Return to focus
      setMode('focus');
      setSecondsLeft(MODE_DURATIONS.focus);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    soundEffects.playClick();
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(MODE_DURATIONS[newMode]);
  };

  const toggleTimer = () => {
    soundEffects.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundEffects.playClick();
    setIsRunning(false);
    setSecondsLeft(MODE_DURATIONS[mode]);
  };

  if (!isOpen) return null;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((totalDuration - secondsLeft) / totalDuration) * 100);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>Modo Foco & Pomodoro</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold border border-indigo-200">
                  +50 XP
                </span>
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                Alta concentração com pausas cronometradas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsRunning(false);
              stopSoundscape();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-center">
          {/* MODE SELECTOR PILLS */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => switchMode('focus')}
              className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
                mode === 'focus'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Foco (25m)</span>
            </button>
            <button
              onClick={() => switchMode('short_break')}
              className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
                mode === 'short_break'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Pausa (5m)</span>
            </button>
            <button
              onClick={() => switchMode('long_break')}
              className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
                mode === 'long_break'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Longo (15m)</span>
            </button>
          </div>

          {/* CIRCULAR TIMER DISPLAY */}
          <div className="py-4 flex flex-col items-center justify-center relative">
            <div className="relative w-48 h-48 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner">
              {/* Animated Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-current text-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`stroke-current transition-all duration-1000 ease-linear ${
                    mode === 'focus'
                      ? 'text-indigo-600'
                      : mode === 'short_break'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Time display */}
              <div className="relative z-10 space-y-1">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight block">
                  {timeFormatted}
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    mode === 'focus'
                      ? 'bg-indigo-50 text-indigo-700'
                      : mode === 'short_break'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {mode === 'focus' ? 'Bloco de Estudo' : 'Descanso'}
                </span>
              </div>
            </div>

            {/* Sessions count badge */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sessões concluídas hoje: <strong className="text-indigo-700">{completedSessions}</strong></span>
            </div>
          </div>

          {/* CONTROLS (PLAY / PAUSE / RESET) */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition active:scale-95 shadow-xs"
              title="Reiniciar Cronômetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Iniciar Foco</span>
                </>
              )}
            </button>
          </div>

          {/* SOUNDSCAPES / AMBIÊNCIA SONORA */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ambiência Sonora (Foco)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {soundscape === 'none' ? 'Desativado' : 'Ativo durante o timer'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSoundscape('none');
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center border ${
                  soundscape === 'none'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Mudo
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSoundscape('alpha');
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center border ${
                  soundscape === 'alpha'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                🧠 Alfa 10Hz
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSoundscape('rain');
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center border ${
                  soundscape === 'rain'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                }`}
              >
                🌧️ Chuva
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSoundscape('whitenoise');
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center border ${
                  soundscape === 'whitenoise'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                🍃 Ruído
              </button>
            </div>
          </div>

          {/* DICA PEDAGÓGICA */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-left flex items-start gap-2.5">
            <span className="text-base shrink-0">✨</span>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              {STUDY_TIPS[tipIndex]}
            </p>
          </div>
        </div>

        {/* REWARD MODAL OVERLAY */}
        {showRewardModal && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in zoom-in-95">
            <div className="bg-white rounded-3xl p-6 text-center space-y-4 max-w-xs shadow-2xl border border-indigo-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
                🏆
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Sessão Concluída!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Você completou 25 minutos de foco total e ganhou:
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-black text-sm">
                  +50 Pontos XP ⚡
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowRewardModal(false);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Aproveitar Pausa de 5 min ☕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
