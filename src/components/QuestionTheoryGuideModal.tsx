import React, { useState, useEffect } from 'react';
import { GradeLevel, Question, SubjectId, TopicLesson, UserProfile } from '../types';
import { TopicTheoryService, QuestionTheoryGuide } from '../services/topicTheoryService';
import { speechNarrator } from '../services/speechNarrator';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  BookOpen,
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  BookmarkPlus,
  Check,
  ChevronRight,
  HelpCircle,
  Zap,
  GraduationCap,
  Calculator,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface QuestionTheoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  userGrade: GradeLevel;
  lesson?: TopicLesson | null;
  userName?: string;
}

type TheoryTab = 'concept' | 'rules' | 'steps' | 'example' | 'ai_tutor';

export const QuestionTheoryGuideModal: React.FC<QuestionTheoryGuideModalProps> = ({
  isOpen,
  onClose,
  question,
  userGrade,
  lesson,
  userName = 'Estudante',
}) => {
  const [activeTab, setActiveTab] = useState<TheoryTab>('concept');
  const [theory, setTheory] = useState<QuestionTheoryGuide | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  // AI Tutor custom explanation
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiExplainStyle, setAiExplainStyle] = useState<'simple' | 'step_by_step' | 'analogy'>('simple');

  useEffect(() => {
    const unsub = speechNarrator.subscribeStatus((status) => {
      if (status === 'playing') {
        setIsSpeaking(true);
        setIsPaused(false);
      } else if (status === 'paused') {
        setIsSpeaking(true);
        setIsPaused(true);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });

    return () => {
      unsub();
      speechNarrator.stop();
    };
  }, []);

  useEffect(() => {
    if (isOpen && question) {
      const guide = TopicTheoryService.getTheoryForQuestion(question, userGrade, lesson);
      setTheory(guide);
      setIsSaved(false);
      setActiveTab('concept');
      setAiExplanation('');
    } else {
      speechNarrator.stop();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isOpen, question, userGrade, lesson]);

  if (!isOpen || !question || !theory) return null;

  const getTextToSpeak = () => {
    if (!theory) return '';
    if (activeTab === 'concept') {
      return `Teoria de ${theory.subjectName}, tópico ${theory.topic}. ${theory.conceptSummary}. ${theory.detailedTheory.join('. ')}`;
    } else if (activeTab === 'rules') {
      return `Regras e conceitos de ouro: ${theory.rulesAndFormulas.join('. ')}. Dica importante: ${theory.goldenTip}`;
    } else if (activeTab === 'steps') {
      return `Como resolver questões deste tipo passo a passo: ${theory.howToSolveStepByStep.join('. ')}`;
    } else if (activeTab === 'example') {
      return `Exemplo prático: ${theory.similarExample.problem}. Resolução: ${theory.similarExample.solutionStep}. Conclusão: ${theory.similarExample.finalTakeaway}`;
    } else if (activeTab === 'ai_tutor') {
      return aiExplanation || 'Peça uma explicação detalhada ao Professor IA.';
    }
    return '';
  };

  const handleToggleSpeak = () => {
    soundEffects.playClick();
    if (!isSpeaking) {
      const textToSpeak = getTextToSpeak();
      if (!textToSpeak) return;
      speechNarrator.speak(
        textToSpeak,
        {
          onStart: () => {
            setIsSpeaking(true);
            setIsPaused(false);
          },
          onEnd: () => {
            setIsSpeaking(false);
            setIsPaused(false);
          },
          onPause: () => setIsPaused(true),
          onResume: () => setIsPaused(false),
          rate: speechSpeed,
        }
      );
    } else if (isPaused) {
      speechNarrator.resume();
    } else {
      speechNarrator.pause();
    }
  };

  const handleStopSpeak = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleCycleSpeed = () => {
    const nextSpeed = speechSpeed === 1.0 ? 1.25 : speechSpeed === 1.25 ? 0.85 : 1.0;
    setSpeechSpeed(nextSpeed);
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }
  };

  const handleSaveToNotes = () => {
    soundEffects.playCorrect('bonus');
    const ok = TopicTheoryService.saveTheoryToNotes(theory);
    if (ok) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleRequestAiExplanation = async (style: 'simple' | 'step_by_step' | 'analogy') => {
    setAiExplainStyle(style);
    setIsLoadingAi(true);
    soundEffects.playClick();

    const stylePrompt =
      style === 'simple'
        ? 'Explique este conteúdo de forma super simples e direta, como se eu tivesse 10 anos, usando palavras fáceis e acolhedoras.'
        : style === 'step_by_step'
        ? 'Explique o raciocínio e a teoria desta matéria detalhando o método de resolução em 3 passos lógicos claros.'
        : 'Explique este conceito usando uma analogia divertida do dia a dia ou dos esportes/jogos para eu nunca mais esquecer.';

    try {
      const res = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: userGrade,
          userName,
          currentText: `${stylePrompt}\nMatéria: ${theory.subjectName}\nTópico: ${theory.topic}\nEnunciado da Dúvida: ${question.question}`,
          messages: [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setAiExplanation(data.reply);
        } else {
          setAiExplanation(
            `💡 Dica do Professor:\nO tópico "${theory.topic}" em ${theory.subjectName} exige que você se concentre nas regras fundamentais:\n\n${theory.conceptSummary}\n\nAnalise o que a pergunta está pedindo e teste cada alternativa com calma!`
          );
        }
      } else {
        setAiExplanation(
          `💡 Resumo Pedagógico:\n${theory.conceptSummary}\n\n⚡ Dica de Aplicação:\n${theory.goldenTip}`
        );
      }
    } catch (_err) {
      setAiExplanation(
        `💡 Resumo Didático:\n${theory.conceptSummary}\n\n⚡ Regra de Ouro:\n${theory.goldenTip}`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="theory-guide-title"
      >
        {/* MODAL HEADER */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {theory.subjectName} • {theory.gradeLabel}
                  </span>
                  <span className="text-[10px] bg-amber-400/30 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full font-bold">
                    Aprender a Matéria
                  </span>
                </div>
                <h2 id="theory-guide-title" className="text-sm sm:text-base font-black truncate text-white mt-0.5">
                  {theory.topic}
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                speechNarrator.stop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
              aria-label="Fechar guia de teoria"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AUDIO NARRATOR BAR */}
          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleSpeak}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isSpeaking && !isPaused
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : isPaused
                    ? 'bg-amber-300 text-slate-900'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isSpeaking && !isPaused ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : isPaused ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSpeaking && !isPaused
                    ? 'Pausar Áudio'
                    : isPaused
                    ? 'Continuar'
                    : 'Ouvir Explicação'}
                </span>
              </button>

              {(isSpeaking || isPaused) && (
                <button
                  onClick={handleStopSpeak}
                  className="px-2.5 py-1 bg-rose-500/80 hover:bg-rose-500 rounded-full text-[11px] font-bold text-white transition flex items-center gap-1 cursor-pointer"
                  title="Parar áudio"
                >
                  <Square className="w-3 h-3" />
                  <span>Parar</span>
                </button>
              )}

              <button
                onClick={handleCycleSpeed}
                className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[10px] font-bold text-white transition cursor-pointer"
                title="Velocidade da voz"
              >
                {speechSpeed}x
              </button>
            </div>

            <button
              onClick={handleSaveToNotes}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Salvar esta teoria no Caderno de Anotações"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Salvo no Caderno!' : 'Salvar no Caderno'}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('concept');
            }}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'concept'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Teoria & Conceito</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('rules');
            }}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Regras & Fórmulas</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('steps');
            }}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>3. Como Pensar</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('example');
            }}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'example'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>4. Exemplo Resolvido</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('ai_tutor');
              if (!aiExplanation && !isLoadingAi) {
                handleRequestAiExplanation('simple');
              }
            }}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ai_tutor'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-purple-600 hover:text-purple-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Professor IA</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: THEORY & CONCEPTS */}
          {activeTab === 'concept' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <span className="text-[11px] font-extrabold uppercase text-blue-800 block mb-1">
                  💡 O que você precisa saber sobre este assunto:
                </span>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {theory.conceptSummary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Explicação Detalhada do Conteúdo:</span>
                </h4>
                <div className="space-y-2">
                  {theory.detailedTheory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] font-bold">Dica de Fixação:</strong>
                  <span>{theory.goldenTip}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RULES & FORMULAS */}
          {activeTab === 'rules' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Regras Fundamentais & Propriedades:</span>
                </h4>
                <div className="space-y-2">
                  {theory.rulesAndFormulas.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-blue-900 font-bold shadow-2xs"
                    >
                      ⚡ {rule}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
                <span className="font-bold text-[11px] block mb-1 text-emerald-900">
                  🌟 Macete de Ouro:
                </span>
                <p>{theory.goldenTip}</p>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP PROBLEM SOLVING */}
          {activeTab === 'steps' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <span className="font-bold text-indigo-900 block mb-1 text-xs">
                  🧠 Método de Raciocínio (Como resolver sem adivinhar):
                </span>
                <p className="text-indigo-950 text-[11px]">
                  Siga estas 3 etapas simples para encontrar a resposta certa em qualquer pergunta deste tópico:
                </p>
              </div>

              <div className="space-y-2.5">
                {theory.howToSolveStepByStep.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-slate-800 leading-snug">{step}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-[11px]">
                🎯 <strong>Lembre-se:</strong> Não precisa ter pressa. Leia as alternativas com calma e elimine primeiro as opções que você tem certeza que estão incorretas.
              </div>
            </div>
          )}

          {/* TAB 4: SIMILAR EXAMPLE */}
          {activeTab === 'example' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-extrabold text-slate-900 text-xs block">
                  📝 Enunciado de Exemplo Resolvido:
                </span>
                <p className="text-slate-800 font-medium italic bg-white p-2.5 rounded-xl border border-slate-200">
                  "{theory.similarExample.problem}"
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Resolução Passo a Passo Comentada:</span>
                </span>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-slate-800 whitespace-pre-line leading-relaxed">
                  {theory.similarExample.solutionStep}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 font-medium text-xs">
                💡 <strong>Conclusão:</strong> {theory.similarExample.finalTakeaway}
              </div>
            </div>
          )}

          {/* TAB 5: AI TUTOR */}
          {activeTab === 'ai_tutor' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span className="font-bold text-purple-950 text-xs">
                    Professor IA Especialista na BNCC
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  {theory.gradeLabel}
                </span>
              </div>

              {/* Quick style selectors */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleRequestAiExplanation('simple')}
                  className={`p-2 rounded-xl border text-[10px] font-bold text-center transition ${
                    aiExplainStyle === 'simple'
                      ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🧸 Super Simples
                </button>
                <button
                  onClick={() => handleRequestAiExplanation('step_by_step')}
                  className={`p-2 rounded-xl border text-[10px] font-bold text-center transition ${
                    aiExplainStyle === 'step_by_step'
                      ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  📐 Passo a Passo
                </button>
                <button
                  onClick={() => handleRequestAiExplanation('analogy')}
                  className={`p-2 rounded-xl border text-[10px] font-bold text-center transition ${
                    aiExplainStyle === 'analogy'
                      ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🎮 Com Analogia
                </button>
              </div>

              {isLoadingAi ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-purple-950">
                    O Professor IA está preparando a melhor explicação didática...
                  </span>
                </div>
              ) : aiExplanation ? (
                <div className="p-3.5 bg-white border border-purple-200 rounded-2xl shadow-xs space-y-2">
                  <div className="text-slate-800 leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <p className="text-slate-600">
                    Clique em uma das opções acima para o Professor IA gerar uma explicação personalizada para a sua série!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              speechNarrator.stop();
              onClose();
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] cursor-pointer"
          >
            <span>Entendi a Matéria! Voltar para a Questão</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
