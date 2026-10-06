import React, { useState, useEffect, useRef } from 'react';
import { speechNarrator, APP_INTRO_TEXT, APP_INTRO_SEGMENTS } from '../services/speechNarrator';
import { soundEffects } from '../services/soundEffects';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Headphones,
  BookOpen,
  Calendar,
  GraduationCap,
  Clock,
  Bot,
  Swords,
  Layers,
  Award,
  HelpCircle,
} from 'lucide-react';

interface IntroNarratorModalProps {
  isOpen: boolean;
  onComplete?: () => void;
  onClose?: () => void;
  onOpenFaq?: () => void;
}

export const IntroNarratorModal: React.FC<IntroNarratorModalProps> = ({ isOpen, onComplete, onClose, onOpenFaq }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'audio'>('summary');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Start audio narration automatically
      startNarration();
    } else {
      stopNarration();
    }
    return () => {
      stopNarration();
    };
  }, [isOpen]);

  const startNarration = () => {
    stopNarration();
    setIsPlaying(true);
    setCurrentSec(0);
    setActiveSegmentIndex(0);

    // Compute character boundaries for segments
    let runningCharIndex = 0;
    const segmentBounds = APP_INTRO_SEGMENTS.map((seg) => {
      const start = runningCharIndex;
      runningCharIndex += seg.text.length + 1;
      return { start, end: runningCharIndex };
    });

    speechNarrator.speak(
      APP_INTRO_TEXT,
      () => {
        setIsPlaying(true);
        const startTime = Date.now();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setCurrentSec(elapsed);
        }, 300);
      },
      () => {
        setIsPlaying(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      },
      (charIndex: number) => {
        const idx = segmentBounds.findIndex(
          (b) => charIndex >= b.start && charIndex < b.end
        );
        if (idx !== -1) {
          setActiveSegmentIndex(idx);
        }
      },
      1.0 // Velocidade normal (1.0x)
    );
  };

  const togglePlayPause = () => {
    soundEffects.playClick();
    if (isPlaying) {
      speechNarrator.stop();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      startNarration();
    }
  };

  const stopNarration = () => {
    speechNarrator.stop();
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFinish = () => {
    stopNarration();
    soundEffects.playCorrect();
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const appHighlights = [
    {
      icon: '🚀',
      title: '1. Jornada BNCC Completa',
      desc: 'Trilhas organizadas do 1º ao 9º Ano Fundamental e 1º ao 3º Ensino Médio com lições didáticas em todas as disciplinas.',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    },
    {
      icon: '📸',
      title: '2. Criador de Provas por Foto com IA',
      desc: 'Tire fotos da apostila ou caderno e gere provas completas (objetivas, V/F, lacunas e discursivas) com Estimativa de Nota Oficial.',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    },
    {
      icon: '📚',
      title: '3. Caderno Digital de Resumos & PDFs',
      desc: 'Apostilas prontas para impressão com passo a passo ilustrado, fórmulas essenciais e exemplos resolvidos.',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    },
    {
      icon: '⚔️',
      title: '4. Sala de Competição & Duelos Multiplayer',
      desc: 'Dispute Duelo de Conhecimento, Passa ou Repassa, Jogo Stop e Desafios de Reflexo ao vivo com amigos ou robôs.',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    },
    {
      icon: '🤖',
      title: '5. Tutor & Professor IA 24h com Voz',
      desc: 'Explicador de conceitos difíceis, pesquisador escolar com referências e auxílio na lição de casa com síntese de voz.',
      color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    },
    {
      icon: '♟️',
      title: '6. Jogos Educativos & Lógicos',
      desc: 'Xadrez acadêmico estruturado, Desafio da Tabuada interativa, Caça-Palavras, Quebra-Cabeça Deslizante e Jogo da Memória.',
      color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    },
    {
      icon: '🌍',
      title: '7. Prática de Idiomas & Tradutor',
      desc: 'Aprenda e treine vocabulário em Inglês, Espanhol e Italiano com pronúncia guiada e tradução contextualizada.',
      color: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    },
    {
      icon: '📅',
      title: '8. Gestão de Estudos, Pomodoro & Boletim',
      desc: 'Cronograma semanal com alarmes, cronômetro de foco Pomodoro, metas diárias de XP e Boletim com insígnias e troféus.',
      color: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bem-vindo à Trilha do Saber!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">
              0:{currentSec.toString().padStart(2, '0')} / 0:28
            </span>
            <button
              onClick={handleFinish}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Audio Waveform Player Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-3 flex items-center justify-between gap-3 shadow-inner">
          <button
            onClick={togglePlayPause}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition shadow-md shrink-0 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
            title={isPlaying ? 'Pausar Áudio' : 'Ouvir Narração'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Sound wave visualizer */}
          <div className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 bg-slate-900/90 rounded-lg border border-slate-800">
            {isPlaying ? (
              <>
                <div className="w-1.5 bg-blue-400 rounded-full audio-bar-1" />
                <div className="w-1.5 bg-blue-300 rounded-full audio-bar-2" />
                <div className="w-1.5 bg-blue-500 rounded-full audio-bar-3" />
                <div className="w-1.5 bg-indigo-400 rounded-full audio-bar-4" />
                <div className="w-1.5 bg-purple-400 rounded-full audio-bar-5" />
                <div className="w-1.5 bg-blue-400 rounded-full audio-bar-2" />
                <div className="w-1.5 bg-cyan-400 rounded-full audio-bar-1" />
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-400">Clique para ouvir o guia em áudio</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              startNarration();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Reiniciar Narração"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Resumo Geral vs Transcrição */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-xl mb-3 border border-slate-800">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('summary');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Resumo do App</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('audio');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'audio'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Transcrição em Voz</span>
          </button>
        </div>

        {/* Content Box */}
        {activeTab === 'summary' ? (
          <div className="flex-1 overflow-y-auto bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 mb-4 space-y-2.5 scrollbar-thin">
            <p className="text-xs text-slate-300 font-medium leading-relaxed px-1">
              A <strong className="text-white">Trilha do Saber</strong> é seu ambiente completo de estudos com Inteligência Artificial, projetado para impulsionar suas notas e tornar o aprendizado divertido!
            </p>

            <div className="space-y-2 pt-1">
              {appHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${item.color}`}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4 space-y-2 text-xs text-zinc-300 scrollbar-thin">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Transcrição Oficial do Áudio</span>
            </div>

            {APP_INTRO_SEGMENTS.map((segment, index) => {
              const isActive = isPlaying && activeSegmentIndex === index;
              return (
                <div
                  key={index}
                  className={`p-2.5 rounded-xl transition duration-200 border ${
                    isActive
                      ? 'bg-blue-950/60 border-blue-500/60 text-blue-100 font-medium'
                      : 'bg-slate-900/40 border-transparent text-slate-400'
                  }`}
                >
                  <p className="leading-relaxed">{segment.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Link */}
        {onOpenFaq && (
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              stopNarration();
              onOpenFaq();
            }}
            className="w-full mb-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-blue-300 text-xs font-bold flex items-center justify-between hover:bg-slate-800 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Dúvidas comuns? Veja o <strong>FAQ (O que é BNCC?)</strong></span>
            </div>
            <span className="text-[11px] font-black text-amber-400">Ver →</span>
          </button>
        )}

        {/* Start Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Começar a Estudar & Explorar!</span>
        </button>
      </div>
    </div>
  );
};

