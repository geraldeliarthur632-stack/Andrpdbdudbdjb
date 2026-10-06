import React, { useState, useEffect, useCallback } from 'react';
import { GradeLevel, UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import { reportCardService } from '../services/reportCardService';
import { notificationService } from '../services/notificationService';
import { indexedDbService } from '../services/indexedDbService';
import {
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCw,
  Share2,
  Check,
  Zap,
  Target,
  GraduationCap,
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  Radio,
} from 'lucide-react';

interface DynamicStudyTip {
  tip: string;
  category: 'dica_estudo' | 'fato_rapido' | 'motivacao' | 'tecnica_memorizacao';
  topic: string;
  icon: string;
  actionableStep: string;
  targetSubject?: string;
  proficiencyBadge?: string;
}

interface StudyTipCardProps {
  userGrade?: GradeLevel;
  user?: UserProfile;
  theme?: 'light' | 'dark';
}

export const StudyTipCard: React.FC<StudyTipCardProps> = ({
  userGrade = '6_fund',
  user,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [currentTip, setCurrentTip] = useState<DynamicStudyTip>({
    tip: 'Ao resolver problemas de matemática, separe os dados do enunciado em "O que eu sei" e "O que o problema pede". Isso reduz erros de interpretação em 70%!',
    category: 'dica_estudo',
    topic: 'Estratégia de Resolução',
    icon: '📐',
    actionableStep: 'Sublinhe com cores diferentes os números e a pergunta final do exercício de hoje.',
    targetSubject: 'Matemática',
    proficiencyBadge: 'Reforço Focado em Matemática',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(() => notificationService.getDailyTipScheduleTime());
  const [pushEnabled, setPushEnabled] = useState(() => notificationService.isDailyTipNotificationEnabled());
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');

  // Calculate user proficiency & weak subjects
  const getProficiencyData = useCallback(() => {
    const accuracy = user && user.completedChallenges > 0
      ? Math.round((user.totalCorrectAnswers / Math.max(1, user.completedChallenges * 5)) * 100)
      : 70;

    let level: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario';
    if (accuracy < 55) level = 'iniciante';
    else if (accuracy >= 80) level = 'avancado';

    const activeGrade: GradeLevel = (user?.grade || userGrade || '6_fund') as GradeLevel;

    // Check report card grades and estimated grades for weak subjects
    const reportCard = reportCardService.getData(activeGrade);
    const estimated = reportCardService.getAllEstimatedGrades();
    const weakSubjects: string[] = [];

    // 1. Check estimated grades from exercises
    Object.values(estimated).forEach((est) => {
      if (est.estimatedGrade10 < 7.0) {
        weakSubjects.push(est.subjectName);
      }
    });

    // 2. Check report card manual entries
    if (reportCard && Array.isArray(reportCard.subjects)) {
      reportCard.subjects.forEach((s) => {
        const validGrades = s.grades.filter((g): g is number => typeof g === 'number');
        if (validGrades.length > 0) {
          const avg = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
          if (avg < 60 && !weakSubjects.includes(s.subjectName)) {
            weakSubjects.push(s.subjectName);
          }
        }
      });
    }

    // Default weak subjects if none recorded
    if (weakSubjects.length === 0) {
      weakSubjects.push('Matemática', 'Língua Portuguesa', 'Ciências');
    }

    return {
      proficiencyLevel: level,
      weakSubjects,
      accuracyRate: Math.min(100, Math.max(10, accuracy)),
    };
  }, [user, userGrade]);

  const fetchDailyTip = useCallback(async () => {
    setIsLoading(true);
    const profData = getProficiencyData();

    try {
      const response = await fetch('/api/ai/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: user?.grade || userGrade,
          userName: user?.name || 'Estudante',
          proficiencyLevel: profData.proficiencyLevel,
          weakSubjects: profData.weakSubjects,
          accuracyRate: profData.accuracyRate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.tip) {
          setCurrentTip(data);
          // Persist to IndexedDB
          await indexedDbService.saveStudyTip({
            tip: data.tip,
            topic: data.topic,
            icon: data.icon,
            actionableStep: data.actionableStep,
            targetSubject: data.targetSubject,
            timestamp: Date.now(),
            read: true,
          });

          // Sync schedule with Service Worker
          notificationService.scheduleDailyTipToServiceWorker(scheduleTime, data);
        }
      } else {
        throw new Error('Servidor indisponível');
      }
    } catch (err) {
      console.warn('Carregando dica de estudo offline do cache IndexedDB / local...');
      // 1. Try to load from IndexedDB
      try {
        const cachedTips = await indexedDbService.getLatestStudyTips(5);
        if (cachedTips && cachedTips.length > 0) {
          const randomSaved = cachedTips[Math.floor(Math.random() * cachedTips.length)];
          const offlineTipObj: DynamicStudyTip = {
            tip: randomSaved.tip,
            topic: randomSaved.topic || 'Estratégia de Aprendizagem',
            icon: randomSaved.icon || '💡',
            actionableStep: randomSaved.actionableStep || 'Revise este conceito nos exercícios de hoje.',
            category: 'dica_estudo',
            targetSubject: randomSaved.targetSubject || profData.weakSubjects[0] || 'Geral',
            proficiencyBadge: 'Modo Offline Ativo',
          };
          setCurrentTip(offlineTipObj);
          notificationService.scheduleDailyTipToServiceWorker(scheduleTime, offlineTipObj);
          return;
        }
      } catch {}

      // 2. Built-in Offline Fallbacks
      const fallbackTips: DynamicStudyTip[] = [
        {
          tip: 'Ao estudar conteúdos com fórmulas ou regras gramaticais, crie cartões de pergunta e resposta (Flashcards) e pratique a autoexplicação!',
          category: 'tecnica_memorizacao',
          topic: 'Flashcards & Autoexplicação',
          icon: '⚡',
          actionableStep: 'Anote 3 perguntas-chave da matéria de hoje e tente responder sem olhar o livro.',
          targetSubject: profData.weakSubjects[0] || 'Matemática',
          proficiencyBadge: 'Fixação de Conceitos',
        },
        {
          tip: 'Fazer simulados com cronômetro calibrado treina o cérebro contra a ansiedade da prova e melhora a velocidade de raciocínio em 40%.',
          category: 'dica_estudo',
          topic: 'Gestão de Tempo em Avaliações',
          icon: '⏱️',
          actionableStep: 'Faça o Simulado BNCC Express de 5 questões hoje no Let\'s Study.',
          targetSubject: 'Geral',
          proficiencyBadge: 'Treino de Performance',
        },
        {
          tip: 'A Curva do Esquecimento de Ebbinghaus prova que revisar o conteúdo 24h depois consolida 80% a mais na memória de longo prazo.',
          category: 'dica_estudo',
          topic: 'Repetição Espaçada',
          icon: '🧠',
          actionableStep: 'Gaste 5 minutos hoje revendo o resumo do que você estudou ontem.',
          targetSubject: 'Geral',
          proficiencyBadge: 'Memória de Longo Prazo',
        },
      ];

      const chosen = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
      setCurrentTip(chosen);
      notificationService.scheduleDailyTipToServiceWorker(scheduleTime, chosen);
    } finally {
      setIsLoading(false);
    }
  }, [user, userGrade, getProficiencyData, scheduleTime]);

  // Load once on mount or when user changes
  useEffect(() => {
    fetchDailyTip();
  }, [fetchDailyTip]);

  const handleNextTip = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }
    fetchDailyTip();
  };

  const handleSpeakTip = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Dica de Estudo Personalizada: ${currentTip.topic}. ${currentTip.tip} Passo prático para fazer hoje: ${currentTip.actionableStep}`;
    setIsSpeaking(true);
    speechNarrator.speak(textToSpeak, () => {
      setIsSpeaking(false);
    });
  };

  const handleCopyTip = () => {
    soundEffects.playClick();
    const text = `💡 Dica de Estudo Diária Personalizada: *${currentTip.topic}* (${currentTip.targetSubject || 'Geral'})\n\n${currentTip.tip}\n\n👉 *Passo prático para hoje:* ${currentTip.actionableStep}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {}
  };

  const handleTogglePush = async () => {
    soundEffects.playClick();
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    notificationService.setDailyTipNotificationEnabled(nextState);

    if (nextState) {
      const granted = await notificationService.requestNotificationPermission();
      if (granted) {
        notificationService.scheduleDailyTipToServiceWorker(scheduleTime, currentTip);
        setScheduleSuccessMsg('Agendamento diário ativo via PWA e Service Worker! ⏰');
      } else {
        setScheduleSuccessMsg('Permissão de notificação necessária no navegador.');
      }
    } else {
      setScheduleSuccessMsg('Lembrete diário pausado.');
    }
    setTimeout(() => setScheduleSuccessMsg(''), 3500);
  };

  const handleSaveSchedule = async () => {
    soundEffects.playClick();
    notificationService.setDailyTipScheduleTime(scheduleTime);
    notificationService.setDailyTipNotificationEnabled(true);
    setPushEnabled(true);

    const granted = await notificationService.requestNotificationPermission();
    if (granted) {
      notificationService.scheduleDailyTipToServiceWorker(scheduleTime, currentTip);
      setScheduleSuccessMsg(`Dicas de estudo agendadas para todos os dias às ${scheduleTime}!`);
    } else {
      setScheduleSuccessMsg('Notificações ativadas! (Permita no navegador para receber com app fechado)');
    }
    setTimeout(() => setScheduleSuccessMsg(''), 3500);
  };

  const handleTestPushNotification = async () => {
    soundEffects.playClick();
    await notificationService.requestNotificationPermission();
    notificationService.triggerDailyTipNotification(currentTip, true);
    setScheduleSuccessMsg('Notificação de teste enviada! 🔔');
    setTimeout(() => setScheduleSuccessMsg(''), 3000);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-lg group transition-all duration-300 border ${
      isLight
        ? 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
        : 'bg-[#121829] border-[#273553] hover:border-purple-500/50'
    }`}>
      {/* Background soft ambient glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
        isLight
          ? 'bg-gradient-to-bl from-purple-200/40 via-indigo-100/30 to-transparent'
          : 'bg-gradient-to-bl from-purple-600/15 via-blue-500/10 to-transparent'
      }`} />

      <div className="relative z-10 space-y-3">
        {/* Header with Category Pill, Badges & Quick Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xs">
              <span>{currentTip.icon || '💡'}</span>
              <span className="tracking-wide uppercase">{currentTip.topic}</span>
            </span>

            {currentTip.targetSubject && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                isLight
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
              }`}>
                <Target className="w-3 h-3 text-amber-500" />
                <span>Reforço: {currentTip.targetSubject}</span>
              </span>
            )}
          </div>

          {/* Action buttons: Read aloud, Copy, Schedule Push, Refresh with AI */}
          <div className="flex items-center gap-1.5">
            {/* Listen to tip with Web Speech API */}
            <button
              onClick={handleSpeakTip}
              className={`p-1.5 rounded-xl border transition active:scale-95 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isSpeaking
                  ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                  : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-300 hover:text-white'
              }`}
              title={isSpeaking ? 'Parar leitura em áudio' : 'Ouvir dica com voz sintetizada (Web Speech)'}
              aria-label="Ouvir dica"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />}
              <span className="text-[11px] font-bold">{isSpeaking ? 'Parar' : 'Ouvir Dica'}</span>
            </button>

            {/* Schedule Push Notification Modal Trigger */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowScheduleModal(!showScheduleModal);
              }}
              className={`p-1.5 rounded-xl border transition active:scale-95 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                pushEnabled
                  ? isLight
                    ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/50'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-400'
              }`}
              title="Agendar Notificações Push diárias desta dica"
              aria-label="Agendar Notificações Push"
            >
              {pushEnabled ? <BellRing className="w-3.5 h-3.5 text-purple-600" /> : <Bell className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px] font-bold hidden sm:inline">{scheduleTime}</span>
            </button>

            <button
              onClick={handleCopyTip}
              className={`p-1.5 rounded-xl border transition active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                  : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-300 hover:text-white'
              }`}
              title="Copiar dica"
              aria-label="Copiar dica"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleNextTip}
              disabled={isLoading}
              className={`p-1.5 rounded-xl border transition active:scale-95 flex items-center gap-1 cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                  : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-300 hover:text-white'
              }`}
              title="Gerar nova dica de reforço com IA"
              aria-label="Nova dica"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'} ${isLoading ? 'animate-spin' : ''}`} />
              <span className={`text-[11px] font-bold hidden sm:inline ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nova Dica IA</span>
            </button>
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Dica Diária de Reforço Personalizado</span>
            </h3>
            {isSpeaking && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse ${
                isLight ? 'text-purple-700 bg-purple-100' : 'text-purple-300 bg-purple-500/20'
              }`}>
                <Radio className="w-3 h-3 text-purple-600 animate-spin" />
                <span>Narrando por voz...</span>
              </span>
            )}
          </div>

          <p className={`text-xs sm:text-[13px] leading-relaxed ${
            isLight ? 'text-slate-700' : 'text-slate-200'
          }`}>
            {currentTip.tip}
          </p>
        </div>

        {/* Actionable Practical Step Box */}
        <div className={`p-2.5 sm:p-3 rounded-2xl flex items-start gap-2.5 border ${
          isLight
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-[#0b0f19]/80 border-[#273553]/90'
        }`}>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border ${
            isLight
              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            ⚡
          </div>
          <div className="min-w-0">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
              isLight ? 'text-emerald-800' : 'text-emerald-400'
            }`}>
              Passo Prático para Fazer Hoje:
            </span>
            <p className={`text-xs font-medium leading-snug ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {currentTip.actionableStep}
            </p>
          </div>
        </div>

        {/* Schedule Push Notification In-Card Settings Drawer */}
        {showScheduleModal && (
          <div className={`p-3.5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl border ${
            isLight
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-[#0e1424] border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Agendar Dicas de Estudo (Push PWA)
                </span>
              </div>
              <button
                onClick={handleTogglePush}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                  pushEnabled
                    ? isLight
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isLight
                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {pushEnabled ? 'Ativado ✅' : 'Desativado'}
              </button>
            </div>

            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Receba as dicas de memorização e estratégias diárias como notificações push direto no seu celular ou computador via Service Worker, mesmo com o aplicativo fechado!
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                isLight ? 'bg-white border-purple-200 text-slate-800' : 'bg-[#161e31] border-[#273553]'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Horário:</span>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className={`bg-transparent text-xs font-bold focus:outline-none cursor-pointer ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                />
              </div>

              <button
                onClick={handleSaveSchedule}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar Horário
              </button>

              <button
                onClick={handleTestPushNotification}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition active:scale-95 flex items-center gap-1 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-[#1e293b] hover:bg-[#273553] text-slate-200 border-[#334155]'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Testar Push Agora
              </button>
            </div>

            {scheduleSuccessMsg && (
              <div className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border animate-in fade-in ${
                isLight
                  ? 'text-emerald-800 bg-emerald-100 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {scheduleSuccessMsg}
              </div>
            )}
          </div>
        )}

        {/* Footer Proficiency Badge */}
        {currentTip.proficiencyBadge && (
          <div className={`flex items-center justify-between text-[11px] pt-0.5 border-t ${
            isLight
              ? 'text-purple-700 border-slate-100'
              : 'text-purple-300/80 border-[#1e293b]/70'
          }`}>
            <span className="flex items-center gap-1 font-semibold">
              <GraduationCap className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
              {currentTip.proficiencyBadge}
            </span>
            <span id="study-tip-offline-badge" className="text-[10px] text-white">Offline & Salvo no IndexedDB</span>
          </div>
        )}
      </div>
    </div>
  );
};

