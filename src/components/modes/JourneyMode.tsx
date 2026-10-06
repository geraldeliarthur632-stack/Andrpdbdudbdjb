import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, GradeLevel, SubjectId, TopicLesson, Question } from '../../types';
import { GRADE_LABELS, SAMPLE_LESSONS, SUBJECTS, shuffleQuestionOptions, shuffleQuestionsList } from '../../data/curriculumData';
import { getYearTopicsForSubject, getDefaultTopicForSubject, JourneyTopicOption } from '../../services/journeyCurriculumService';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { reportCardService, SubjectEstimatedGrade } from '../../services/reportCardService';
import { mistakesTrackerService } from '../../services/mistakesTrackerService';
import { answeredQuestionsService } from '../../services/answeredQuestionsService';
import { VoiceAnswerController } from '../VoiceAnswerController';
import { QuestionTheoryGuideModal } from '../QuestionTheoryGuideModal';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Award,
  RotateCcw,
  Zap,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  LogOut,
  Plus,
} from 'lucide-react';
import { SubjectIcon } from '../SubjectIcon';
import { getSubjectsForGrade } from '../../data/curriculumData';

interface JourneyModeProps {
  user: UserProfile;
  initialSubjectId?: SubjectId;
  onBack: () => void;
  onFinishLesson?: (score: number) => void;
  onEarnPoints?: (points: number, isMajorChallenge?: boolean, questionsCount?: number) => void;
  onAnswerCorrect?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenErrorFeedback?: (topic?: string) => void;
}

type LessonPlan = TopicLesson;

export interface QuestionReviewItem {
  question: Question;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

type JourneyStep = 'subject_select' | 'topic_select' | 'lesson_intro' | 'quiz' | 'review' | 'summary';

const SUBJECT_NAMES_MAP: Record<string, string> = {
  matematica: 'Matemática',
  portugues: 'Língua Portuguesa',
  ingles: 'Língua Inglesa',
  ciencias: 'Ciências da Natureza',
  historia: 'História',
  geografia: 'Geografia',
  artes: 'Artes',
  filosofia: 'Filosofia',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  xadrez: 'Xadrez',
  espanhol: 'Espanhol',
  italiano: 'Italiano',
};

const SUBJECT_LIST: {
  id: SubjectId;
  name: string;
  icon: string;
  iconBg: string;
  accentColor: string;
  description: string;
}[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '🔢',
    iconBg: 'bg-indigo-600',
    accentColor: 'border-indigo-500 text-indigo-400',
    description: 'Cálculos, frações, álgebra, geometria e resolução de problemas.',
  },
  {
    id: 'portugues',
    name: 'Português',
    icon: '📚',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Gramática, interpretação de texto, ortografia e redação.',
  },
  {
    id: 'ciencias',
    name: 'Ciências',
    icon: '🔬',
    iconBg: 'bg-cyan-600',
    accentColor: 'border-cyan-500 text-cyan-400',
    description: 'Corpo humano, ecossistemas, física básica e reações químicas.',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '🧬',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Citologia, ecologia, seres vivos, genética e evolução humana.',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: '⚡',
    iconBg: 'bg-sky-600',
    accentColor: 'border-sky-500 text-sky-400',
    description: 'Cinemática, forças, energia, óptica, ondas e termologia.',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '🧪',
    iconBg: 'bg-purple-600',
    accentColor: 'border-purple-500 text-purple-400',
    description: 'Átomos, tabela periódica, ligações químicas e reações.',
  },
  {
    id: 'historia',
    name: 'História',
    icon: '🏛️',
    iconBg: 'bg-amber-600',
    accentColor: 'border-amber-500 text-amber-400',
    description: 'Civilizações antigas, Brasil Colônia, guerras mundiais e cidadania.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '🌍',
    iconBg: 'bg-blue-600',
    accentColor: 'border-blue-500 text-blue-400',
    description: 'Relevo, clima, cartografia, geopolítica e urbanização.',
  },
  {
    id: 'ingles',
    name: 'Inglês',
    icon: '🇬🇧',
    iconBg: 'bg-rose-600',
    accentColor: 'border-rose-500 text-rose-400',
    description: 'Vocabulário, tempos verbais, conversação e interpretação.',
  },
  {
    id: 'artes',
    name: 'Artes',
    icon: '🎨',
    iconBg: 'bg-pink-600',
    accentColor: 'border-pink-500 text-pink-400',
    description: 'História da arte, cores, expressões culturais e movimentos visuais.',
  },
  {
    id: 'espanhol',
    name: 'Espanhol (Do Zero)',
    icon: '🇪🇸',
    iconBg: 'bg-amber-600',
    accentColor: 'border-amber-500 text-amber-400',
    description: 'Começando do zero: saudações, primeiras palavras, números e pronúncia.',
  },
  {
    id: 'italiano',
    name: 'Italiano (Do Zero)',
    icon: '🇮🇹',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Começando do zero: primeiras palavras, sons especiais (GLI, GN, C/CH) e saudações.',
  },
];

export const JourneyMode: React.FC<JourneyModeProps> = ({
  user,
  initialSubjectId,
  onBack,
  onFinishLesson,
  onEarnPoints,
  onAnswerCorrect,
  onOpenSubjectCustomization,
  onOpenErrorFeedback,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(
    initialSubjectId && initialSubjectId !== 'xadrez' ? initialSubjectId : 'matematica'
  );
  const [currentStep, setCurrentStep] = useState<JourneyStep>(
    initialSubjectId ? 'lesson_intro' : 'subject_select'
  );
  const [activeLesson, setActiveLesson] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparando sua aula com IA...');

  // Set initial subject when provided from external launcher (e.g. Next Study Reminder card or Continuar Estudando)
  useEffect(() => {
    if (initialSubjectId && initialSubjectId !== 'xadrez') {
      setSelectedSubject(initialSubjectId);
      const topics = getYearTopicsForSubject(user.grade, initialSubjectId);
      const chosen = topics[0] || getDefaultTopicForSubject(user.grade, initialSubjectId);
      handleSelectLesson(chosen.lesson, false);
    }
  }, [initialSubjectId]);

  // Ensure selectedSubject is valid for current grade and custom subjects
  useEffect(() => {
    const available = getSubjectsForGrade(user.grade, user.customSubjects).filter((s) => s.id !== 'xadrez');
    if (available.length > 0 && !available.some((s) => s.id === selectedSubject)) {
      setSelectedSubject(available[0].id);
    }
  }, [user.grade, user.customSubjects, selectedSubject]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [isTheoryGuideOpen, setIsTheoryGuideOpen] = useState(false);
  const [estimatedGrade, setEstimatedGrade] = useState<SubjectEstimatedGrade>(() =>
    reportCardService.getEstimatedSubjectGrade(selectedSubject)
  );

  // Review & Continuous Flow State
  const [answeredQuestionsReview, setAnsweredQuestionsReview] = useState<QuestionReviewItem[]>([]);
  const [reviewActiveTab, setReviewActiveTab] = useState<'questions' | 'theory'>('questions');
  const [reviewSpeakingIndex, setReviewSpeakingIndex] = useState<number | null>(null);
  const [isSpeakingReviewTheory, setIsSpeakingReviewTheory] = useState<boolean>(false);

  // Safeguard: Ensure topic_select never leaves an empty white screen
  useEffect(() => {
    if (currentStep === 'topic_select') {
      setCurrentStep('subject_select');
    }
  }, [currentStep]);

  // Audio / Speech State
  const [isSpeakingExplanation, setIsSpeakingExplanation] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [autoAdvanceLessonIntro, setAutoAdvanceLessonIntro] = useState<boolean>(true);
  const [isAutoAdvancingToQuiz, setIsAutoAdvancingToQuiz] = useState<boolean>(false);
  const lessonIntroAdvanceTimerRef = useRef<number | null>(null);

  const clearLessonIntroTimer = () => {
    if (lessonIntroAdvanceTimerRef.current) {
      clearTimeout(lessonIntroAdvanceTimerRef.current);
      lessonIntroAdvanceTimerRef.current = null;
    }
    setIsAutoAdvancingToQuiz(false);
  };

  // Saída segura da Jornada: limpa narrador, timers de fala e chama onBack com segurança
  const handleExitJourney = () => {
    try {
      soundEffects.playClick();
    } catch {}
    try {
      speechNarrator.stop();
    } catch {}
    try {
      clearLessonIntroTimer();
    } catch {}
    setIsSpeakingExplanation(false);
    setReviewSpeakingIndex(null);
    setIsSpeakingReviewTheory(false);
    try {
      onBack();
    } catch (err) {
      console.warn('Erro ao sair da jornada:', err);
    }
  };

  // Limpeza de áudio e timers caso o componente da Jornada seja desmontado
  useEffect(() => {
    return () => {
      try {
        speechNarrator.stop();
      } catch {}
      clearLessonIntroTimer();
      setIsSpeakingExplanation(false);
      setReviewSpeakingIndex(null);
      setIsSpeakingReviewTheory(false);
    };
  }, []);

  // Fallback lesson builder
  const getFallbackLesson = (subjId: SubjectId): LessonPlan => {
    // Try finding in sample lessons
    const found = SAMPLE_LESSONS.find((l) => l.subject === subjId && l.grade === user.grade) ||
                  SAMPLE_LESSONS.find((l) => l.subject === subjId);
    if (found) {
      return {
        id: found.id,
        subject: found.subject,
        grade: user.grade,
        title: found.title,
        summary: found.summary,
        detailedExplanation: `${found.summary}\n\n${found.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || ''}\n\nExemplo: ${found.example || ''}`,
        keyPoints: found.keyPoints || [],
        example: found.example || '',
        practiceQuestions: shuffleQuestionsList(found.practiceQuestions || []),
      };
    }

    const subjName = SUBJECT_NAMES_MAP[subjId] || 'Matéria';
    const lessonResult: LessonPlan = {
      id: `lesson_${subjId}_${user.grade}`,
      subject: subjId,
      grade: user.grade,
      title: `${subjName}: Fundamentos e Aplicação Prática`,
      summary: `Nesta aula especial de ${subjName}, você aprenderá as regras fundamentais, conceitos principais e como aplicar os conhecimentos em exercícios práticos da BNCC.`,
      detailedExplanation: `O estudo de ${subjName} é essencial para o desenvolvimento do raciocínio lógico e interpretação.\n\n` +
        `1. **Conceito Central**: Compreender o funcionamento das regras e definições básicas.\n` +
        `2. **Aplicação Prática**: Como analisar enunciados e resolver questões com segurança.\n` +
        `3. **Dicas de Ouro**: Leia com atenção cada alternativa e elimine as opções incorretas.`,
      keyPoints: [
        'Leia o enunciado com atenção identificando os dados principais.',
        'Aplique a fórmula ou regra gramatical correspondente.',
        'Revise a resposta antes de confirmar a alternativa final.',
      ],
      example: `Exemplo Prático de ${subjName}: Ao analisar um problema, separe o que é pedido e resolva etapa por etapa para garantir 100% de precisão!`,
      practiceQuestions: [
        {
          id: `q_1_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Qual é o princípio fundamental no estudo de ${subjName}?`,
          options: [
            'Compreender o conceito e aplicar o método passo a passo',
            'Chutar respostas aleatoriamente sem ler',
            'Ignorar as regras e fórmulas ensinadas',
            'Decorar apenas sem entender o raciocínio',
          ],
          correctIndex: 0,
          explanation: 'Compreender o conceito básico e aplicar o método passo a passo é a melhor forma de aprender de verdade e garantir o sucesso escolar.',
          difficulty: 'easy',
        },
        {
          id: `q_2_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Em uma questão desafiadora de ${subjName}, qual é o primeiro passo recomendado?`,
          options: [
            'Ler com atenção e destacar as informações principais',
            'Responder imediatamente a primeira opção que ver',
            'Pular a questão sem tentar resolver',
            'Chutar a alternativa D sem pensar',
          ],
          correctIndex: 0,
          explanation: 'Ler o enunciado atentamente e destacar as informações principais evita pegadinhas e orienta o raciocínio correto.',
          difficulty: 'medium',
        },
        {
          id: `q_3_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Por que revisar os conceitos teóricos antes dos exercícios melhora o aprendizado?`,
          options: [
            'Porque solidifica a memória e prepara a mente para a prática',
            'Porque não tem utilidade nenhuma',
            'Porque só serve para gastar tempo',
            'Porque o aprendizado não precisa de teoria',
          ],
          correctIndex: 0,
          explanation: 'A teoria e os exemplos guiam a compreensão lógica necessária para acertar qualquer tipo de questão na prova.',
          difficulty: 'easy',
        },
        {
          id: `q_4_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Qual a melhor estratégia ao se deparar com alternativas parecidas?`,
          options: [
            'Eliminar as comprovadamente erradas e comparar as restantes',
            'Escolher na sorte',
            'Desistir da questão',
            'Marcar qualquer uma rápido',
          ],
          correctIndex: 0,
          explanation: 'A técnica de eliminação lógica reduz as opções e aumenta exponencialmente as chances de acerto.',
          difficulty: 'medium',
        },
        {
          id: `q_5_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `O que significa ter domínio no conteúdo de ${subjName}?`,
          options: [
            'Saber explicar o porquê da resposta e resolver com segurança',
            'Apenas acertar por coincidência',
            'Copiar a resposta de outros sem entender',
            'Saber apenas o título da matéria',
          ],
          correctIndex: 0,
          explanation: 'Dominar uma matéria significa ser capaz de explicar o raciocínio e resolver problemas semelhantes de forma independente.',
          difficulty: 'hard',
        },
      ],
    };
    lessonResult.practiceQuestions = shuffleQuestionsList(lessonResult.practiceQuestions || []);
    return lessonResult;
  };

  // List of year topics for currently selected subject and grade
  const availableTopics = useMemo(() => {
    return getYearTopicsForSubject(user.grade, selectedSubject);
  }, [user.grade, selectedSubject]);

  // Histórico de tópicos concluídos para salvar e nunca ficar repetindo
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('estudahud_journey_completed_topics_v3');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const markTopicCompleted = (topicIdOrTitle: string) => {
    if (!topicIdOrTitle) return;
    const clean = topicIdOrTitle.toLowerCase().trim();
    setCompletedTopicIds((prev) => {
      if (prev.includes(clean)) return prev;
      const updated = [...prev, clean];
      try {
        localStorage.setItem('estudahud_journey_completed_topics_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const defaultTopic = availableTopics[0] || getDefaultTopicForSubject(user.grade, selectedSubject);

  // Current topic index in the grade's curriculum
  const currentTopicIndex = useMemo(() => {
    if (!activeLesson) return 0;
    const idx = availableTopics.findIndex(
      (t) =>
        (t?.id && t.id === activeLesson.id) ||
        (t?.lesson?.id && t.lesson.id === activeLesson.id) ||
        (t?.title && activeLesson.title && t.title.toLowerCase().trim() === activeLesson.title.toLowerCase().trim())
    );
    return idx >= 0 ? idx : 0;
  }, [availableTopics, activeLesson]);

  // Next topic in the subject's curriculum sequence
  const nextTopic = useMemo(() => {
    if (availableTopics.length === 0) return null;
    const nextIdx = currentTopicIndex + 1;
    if (nextIdx < availableTopics.length) {
      return availableTopics[nextIdx];
    }
    // Procura qualquer outro da matéria que ainda não foi concluído
    const uncompleted = availableTopics.find((t) => {
      const tid = t?.id ? t.id.toLowerCase().trim() : '';
      const tTitle = t?.title ? t.title.toLowerCase().trim() : '';
      const tLessonId = t?.lesson?.id ? t.lesson.id.toLowerCase().trim() : '';

      const isCompleted =
        (tid && completedTopicIds.includes(tid)) ||
        (tTitle && completedTopicIds.includes(tTitle)) ||
        (tLessonId && completedTopicIds.includes(tLessonId));

      return !isCompleted;
    });
    return uncompleted || null;
  }, [availableTopics, currentTopicIndex, completedTopicIds]);

  // Next subject in the student's curriculum
  const nextSubject = useMemo(() => {
    const userSubjects = getSubjectsForGrade(user.grade, user.customSubjects);
    const curIdx = userSubjects.findIndex((s) => s.id === selectedSubject);
    if (curIdx >= 0 && curIdx + 1 < userSubjects.length) {
      return userSubjects[curIdx + 1];
    }
    return userSubjects[0] || null;
  }, [user.grade, user.customSubjects, selectedSubject]);

  // Start lesson with theoretical explanation (seleciona o primeiro NÃO concluído para não repetir)
  const handleStartLessonExplanation = (subjId?: SubjectId) => {
    soundEffects.playClick();
    const targetSubject = subjId || selectedSubject;
    setSelectedSubject(targetSubject);
    const topics = getYearTopicsForSubject(user.grade, targetSubject);
    const uncompleted = topics.find(
      (t) =>
        !completedTopicIds.includes(t.id.toLowerCase().trim()) &&
        !completedTopicIds.includes(t.title.toLowerCase().trim()) &&
        !completedTopicIds.includes(t.lesson.id.toLowerCase().trim())
    );
    const chosen = uncompleted || topics[0] || getDefaultTopicForSubject(user.grade, targetSubject);
    handleSelectLesson(chosen.lesson, false);
  };

  // Launch a selected lesson. Por padrão (startDirectWithQuestions = false),
  // a pessoa vê e ouve a explicação do conteúdo com voz da IA antes de responder às questões!
  const handleSelectLesson = (lesson: LessonPlan, startDirectWithQuestions = false) => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingExplanation(false);
    setReviewSpeakingIndex(null);
    setIsSpeakingReviewTheory(false);

    setIsLoading(false);
    setActiveLesson(lesson);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionCorrectCount(0);
    setAnsweredQuestionsReview([]);

    if (startDirectWithQuestions) {
      setCurrentStep('quiz');
    } else {
      setCurrentStep('lesson_intro');
      clearLessonIntroTimer();
      const subjName = SUBJECT_NAMES_MAP[selectedSubject] || 'Matéria';
      const fullSpeechText = `Aula de ${subjName}. ${lesson.title}. ${lesson.summary}. Regras principais: ${(lesson.keyPoints || []).join('. ')}. Exemplo: ${lesson.example || ''}`;
      try {
        speechNarrator.speak(
          fullSpeechText,
          () => {
            setIsSpeakingExplanation(true);
            setIsAutoAdvancingToQuiz(false);
          },
          () => {
            setIsSpeakingExplanation(false);
            if (autoAdvanceLessonIntro) {
              setIsAutoAdvancingToQuiz(true);
              if (lessonIntroAdvanceTimerRef.current) clearTimeout(lessonIntroAdvanceTimerRef.current);
              lessonIntroAdvanceTimerRef.current = window.setTimeout(() => {
                setIsAutoAdvancingToQuiz(false);
                setCurrentStep('quiz');
              }, 1200);
            }
          },
          undefined,
          1.0 // Velocidade normal padrão: 1.0x
        );
      } catch {}
    }
  };

  // Seguir Padrão: Inicia pela explicação do conteúdo
  const handleFollowDefaultTopic = () => {
    handleSelectLesson(defaultTopic.lesson, false);
  };

  // Start Journey - directs to lesson explanation
  const handleStartJourney = () => {
    handleStartLessonExplanation();
  };

  // Avançar para o Próximo Conteúdo com salvamento automático para não repetir
  const handleAdvanceToNextTopic = () => {
    soundEffects.playClick();
    clearLessonIntroTimer();
    speechNarrator.stop();
    setIsSpeakingExplanation(false);
    setReviewSpeakingIndex(null);
    setIsSpeakingReviewTheory(false);

    if (activeLesson) {
      markTopicCompleted(activeLesson.id);
      markTopicCompleted(activeLesson.title);
    }

    if (nextTopic) {
      // Carrega o próximo conteúdo com explicação teórica antes
      handleSelectLesson(nextTopic.lesson, false);
    } else if (nextSubject) {
      // Se acabou os tópicos da matéria, avança para a próxima matéria da grade
      setSelectedSubject(nextSubject.id as SubjectId);
      const nextTopics = getYearTopicsForSubject(user.grade, nextSubject.id as SubjectId);
      const nextUncompleted =
        nextTopics.find(
          (t) =>
            !completedTopicIds.includes(t.id.toLowerCase().trim()) &&
            !completedTopicIds.includes(t.title.toLowerCase().trim()) &&
            !completedTopicIds.includes(t.lesson.id.toLowerCase().trim())
        ) || nextTopics[0] || getDefaultTopicForSubject(user.grade, nextSubject.id as SubjectId);
      handleSelectLesson(nextUncompleted.lesson, false);
    } else if (availableTopics[0]) {
      // Reinicia o primeiro tópico
      handleSelectLesson(availableTopics[0].lesson, false);
    }
  };

  // Ouvir explicação do conteúdo de novo
  const handleReplayExplanation = () => {
    if (!activeLesson) return;
    soundEffects.playClick();
    clearLessonIntroTimer();
    speechNarrator.stop();
    setReviewSpeakingIndex(null);
    setIsSpeakingReviewTheory(false);
    handleSelectLesson(activeLesson, false);
  };

  // Refazer as perguntas do mesmo conteúdo
  const handleRetryCurrentTopic = () => {
    if (!activeLesson) return;
    soundEffects.playClick();
    clearLessonIntroTimer();
    speechNarrator.stop();
    setIsSpeakingExplanation(false);
    setReviewSpeakingIndex(null);
    setIsSpeakingReviewTheory(false);

    const reloaded: LessonPlan = {
      ...activeLesson,
      practiceQuestions: shuffleQuestionsList(activeLesson.practiceQuestions || []),
    };
    handleSelectLesson(reloaded, false);
  };

  // Narração de explicações na tela de revisão
  const handleToggleReviewSpeech = (idx: number, explanation: string) => {
    soundEffects.playClick();
    if (reviewSpeakingIndex === idx) {
      speechNarrator.stop();
      setReviewSpeakingIndex(null);
    } else {
      speechNarrator.stop();
      setIsSpeakingReviewTheory(false);
      setReviewSpeakingIndex(idx);
      speechNarrator.speak(
        explanation,
        () => setReviewSpeakingIndex(idx),
        () => setReviewSpeakingIndex(null),
        undefined,
        1.0 // Velocidade normal padrão
      );
    }
  };

  // Narração do resumo teórico na tela de revisão
  const handleToggleReviewTheorySpeech = () => {
    soundEffects.playClick();
    if (isSpeakingReviewTheory) {
      speechNarrator.stop();
      setIsSpeakingReviewTheory(false);
    } else if (activeLesson) {
      speechNarrator.stop();
      setReviewSpeakingIndex(null);
      const speech = `${activeLesson.title}. ${activeLesson.summary}. Pontos fundamentais: ${(activeLesson.keyPoints || []).join('. ')}. Exemplo: ${activeLesson.example || ''}`;
      speechNarrator.speak(
        speech,
        () => setIsSpeakingReviewTheory(true),
        () => setIsSpeakingReviewTheory(false),
        undefined,
        1.0 // Velocidade normal padrão
      );
    }
  };

  // Toggle narration in theory screen
  const toggleExplanationSpeech = () => {
    soundEffects.playClick();
    clearLessonIntroTimer();
    if (isSpeakingExplanation) {
      speechNarrator.stop();
      setIsSpeakingExplanation(false);
    } else if (activeLesson) {
      const fullSpeechText = `${activeLesson.title}. ${activeLesson.summary}. ${activeLesson.detailedExplanation}. Dicas: ${(activeLesson.keyPoints || []).join('. ')}. ${activeLesson.example || ''}`;
      speechNarrator.speak(
        fullSpeechText,
        () => {
          setIsSpeakingExplanation(true);
          setIsAutoAdvancingToQuiz(false);
        },
        () => {
          setIsSpeakingExplanation(false);
          if (autoAdvanceLessonIntro) {
            setIsAutoAdvancingToQuiz(true);
            if (lessonIntroAdvanceTimerRef.current) clearTimeout(lessonIntroAdvanceTimerRef.current);
            lessonIntroAdvanceTimerRef.current = window.setTimeout(() => {
              setIsAutoAdvancingToQuiz(false);
              setCurrentStep('quiz');
            }, 1200);
          }
        },
        undefined,
        1.0 // Velocidade normal padrão
      );
    }
  };

  // Go to Quiz from Lesson Intro
  const handleProceedToQuiz = () => {
    soundEffects.playClick();
    clearLessonIntroTimer();
    speechNarrator.stop();
    setIsSpeakingExplanation(false);
    setCurrentStep('quiz');
  };

  const currentQ = activeLesson?.practiceQuestions?.[currentQuestionIndex];

  // Auto-speak question when entering quiz or navigating to next question
  useEffect(() => {
    if (currentStep === 'quiz' && currentQ && !isAnswerSubmitted) {
      // Pequeno timeout para permitir que a interface renderize limpa antes de soar o áudio
      const timer = setTimeout(() => {
        speechNarrator.speakQuestion({
          questionIndex: currentQuestionIndex,
          questionText: currentQ.question || (currentQ as any).text,
          options: currentQ.options || [],
          onStart: () => setIsSpeakingQuestion(true),
          onEnd: () => {
            setIsSpeakingQuestion(false);
          },
        });
      }, 50);
      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
        setIsSpeakingQuestion(false);
      };
    }
  }, [currentStep, currentQuestionIndex, isAnswerSubmitted, currentQ?.id]);

  // Speak Current Question manually or replay
  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    soundEffects.playClick();

    if (isSpeakingQuestion) {
      speechNarrator.stop();
      setIsSpeakingQuestion(false);
      return;
    }

    speechNarrator.speakQuestion({
      questionIndex: currentQuestionIndex,
      questionText: currentQ.question || (currentQ as any).text,
      options: currentQ.options || [],
      force: true,
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false),
    });
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQ?.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrect();
      setSessionCorrectCount((prev) => prev + 1);
      onAnswerCorrect?.();
      onEarnPoints?.(15, false, 1);
    } else {
      soundEffects.playError();
    }

    // Save to review history for this session
    if (currentQ) {
      setAnsweredQuestionsReview((prev) => {
        const updated = [...prev];
        updated[currentQuestionIndex] = {
          question: currentQ,
          selectedOptionIndex: idx,
          isCorrect,
        };
        return updated;
      });
    }

    // Update simulated grade for this subject based on Journey exercise results
    try {
      const updatedEstimate = reportCardService.recordJourneyExerciseResult(
        currentSubjectMeta.id,
        currentSubjectMeta.name,
        isCorrect
      );
      setEstimatedGrade(updatedEstimate);
    } catch {}

    // Track attempt in academic mistakes diagnostic service and answered questions history
    try {
      if (currentQ) {
        mistakesTrackerService.recordAttempt({
          questionText: currentQ.question || (currentQ as any).text || '',
          subjectId: currentSubjectMeta.id,
          subjectName: currentSubjectMeta.name,
          topic: activeLesson?.title || currentSubjectMeta.name,
          isCorrect,
          grade: user.grade,
          userChoice: currentQ.options[idx],
          correctChoice: currentQ.options[currentQ.correctIndex],
          explanation: currentQ.explanation,
        });

        answeredQuestionsService.recordAnswer({
          question: currentQ,
          selectedOptionIndex: idx,
          subjectId: currentSubjectMeta.id,
          subjectName: currentSubjectMeta.name,
          topicTitle: activeLesson?.title || currentSubjectMeta.name,
          grade: user.grade,
          sourceMode: 'jornada',
        });
      }
    } catch {}
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    speechNarrator.stop();

    if (!activeLesson) return;

    const totalQuestions = activeLesson.practiceQuestions.length;
    if (currentQuestionIndex + 1 >= totalQuestions) {
      if (activeLesson) {
        markTopicCompleted(activeLesson.id);
        markTopicCompleted(activeLesson.title);
      }
      setCurrentStep('review');
      onFinishLesson?.(sessionCorrectCount);
      onEarnPoints?.(60, true, sessionCorrectCount);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const currentSubjectMeta = SUBJECT_LIST.find((s) => s.id === selectedSubject) || SUBJECT_LIST[0];

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 text-slate-900 max-w-lg mx-auto w-full pb-20 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentStep === 'review' || currentStep === 'summary') {
              handleExitJourney();
            } else if (currentStep === 'quiz' || currentStep === 'lesson_intro') {
              setCurrentStep('subject_select');
            } else {
              handleExitJourney();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition cursor-pointer font-bold text-xs active:scale-95"
          title={currentStep === 'review' || currentStep === 'summary' ? 'Sair da Jornada' : 'Voltar'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 'review' || currentStep === 'summary' ? 'Sair' : 'Voltar'}</span>
        </button>

        {currentStep === 'subject_select' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-slate-900">Continuar Jornada</h1>
            <span className="text-[10px] text-slate-500 font-semibold">
              {GRADE_LABELS[user.grade]?.short || 'Ensino Fundamental'}
            </span>
          </div>
        )}

        {currentStep === 'topic_select' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-slate-900">Conteúdos do Ano</h1>
            <span className="text-[10px] text-indigo-700 font-bold">
              {currentSubjectMeta.name} • {GRADE_LABELS[user.grade]?.short || 'Série'}
            </span>
          </div>
        )}

        {currentStep === 'lesson_intro' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-slate-900">Explicação da Aula</h1>
            <span className="text-[10px] text-indigo-700 font-bold truncate max-w-[200px] block">
              {activeLesson?.title || currentSubjectMeta.name}
            </span>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              Questão {currentQuestionIndex + 1} de {activeLesson?.practiceQuestions?.length || 10}
            </span>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-slate-900">Revisão do Conteúdo</h1>
            <span className="text-[10px] text-emerald-700 font-bold truncate max-w-[200px] block">
              {activeLesson?.title || currentSubjectMeta.name}
            </span>
          </div>
        )}

        <div className="w-9" />
      </div>

      {/* LOADING SCREEN */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 border border-purple-300 flex items-center justify-center animate-bounce shadow-md">
              <SubjectIcon subjectId={currentSubjectMeta.id} className="w-8 h-8 text-indigo-700" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-purple-200 animate-ping pointer-events-none" />
          </div>
          <p className="text-sm font-bold text-slate-900 text-center animate-pulse">
            {loadingText}
          </p>
          <p className="text-xs text-slate-500 text-center max-w-xs">
            Gerando teoria personalizada, regras práticas e questões da BNCC...
          </p>
        </div>
      )}

      {/* STEP 1: SUBJECT SELECT WITH SINGLE CONTINUAR BUTTON */}
      {!isLoading && (currentStep === 'subject_select' || currentStep === 'topic_select') && (() => {
        const userSubjects = getSubjectsForGrade(user.grade, user.customSubjects).filter((s) => s.id !== 'xadrez');
        const allowedSubjectIds = new Set(userSubjects.map((s) => s.id));
        const filteredSubjectList = SUBJECT_LIST.filter((s) => allowedSubjectIds.has(s.id) && s.id !== 'xadrez');

        return (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Title / Description */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                    Escolha a Matéria
                  </span>
                  {onOpenSubjectCustomization && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenSubjectCustomization();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Editar Matérias</span>
                    </button>
                  )}
                </div>
                <h2 className="text-base font-black text-slate-900">
                  O que vamos aprender hoje?
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selecione a disciplina e clique em Continuar para ver a explicação com voz da IA antes das perguntas.
                </p>
              </div>

              {/* Subjects Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSubjectList.map((subj) => {
                  const isSelected = selectedSubject === subj.id;
                  return (
                    <button
                      key={subj.id}
                      onClick={() => {
                        handleStartLessonExplanation(subj.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${subj.iconBg} flex items-center justify-center shadow-md shrink-0`}
                      >
                        <SubjectIcon subjectId={subj.id} className="w-5 h-5 text-indigo-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-xs font-black truncate ${
                            isSelected ? 'text-indigo-950 font-black' : 'text-slate-800 font-bold'
                          }`}
                        >
                          {subj.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          BNCC {GRADE_LABELS[user.grade]?.short || '6º ano'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Botão de Adicionar / Editar Matérias no Grid */}
                {onOpenSubjectCustomization && (
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onOpenSubjectCustomization();
                    }}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all flex items-center gap-3 active:scale-[0.98] cursor-pointer group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-black text-indigo-900 group-hover:text-indigo-950 truncate">
                        Editar Matérias
                      </h3>
                      <span className="text-[10px] text-indigo-700 font-semibold block leading-tight">
                        Adicionar Ciências
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Active Subject Summary Card */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl ${currentSubjectMeta.iconBg} flex items-center justify-center shadow-md shrink-0`}
                >
                  <SubjectIcon subjectId={currentSubjectMeta.id} className="w-6 h-6 text-indigo-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      {currentSubjectMeta.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-[9px] font-black">
                      IA Pronta
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-2">
                    {currentSubjectMeta.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button: Continuar para a Explicação da Matéria */}
            <div className="pt-2">
              <button
                onClick={() => handleStartLessonExplanation(selectedSubject)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Continuar para a Explicação da Matéria 📖</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* STEP 2: LESSON INTRO / THEORY EXPLANATION WITH AI AUDIO NARRATOR */}
      {!isLoading && currentStep === 'lesson_intro' && activeLesson && (
        <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto pr-1">
          <div className="space-y-4">
            {/* Top Bar with Current Topic & Switch Button */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">📖</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                    Matéria & Conteúdo
                  </span>
                  <h4 className="text-xs font-black text-indigo-950 truncate">
                    {activeLesson.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  speechNarrator.stop();
                  setIsSpeakingExplanation(false);
                  setCurrentStep('subject_select');
                }}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Trocar Matéria</span>
              </button>
            </div>

            {/* Audio Narrator Control Bar */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleExplanationSpeech}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSpeakingExplanation
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                  }`}
                  title={isSpeakingExplanation ? 'Pausar áudio' : 'Ouvir explicação'}
                >
                  {isSpeakingExplanation ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>Voz da IA Pedagógica</span>
                    {isSpeakingExplanation && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {isSpeakingExplanation
                      ? 'Narrando conteúdo da aula...'
                      : 'Toque para ouvir a explicação falada'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-advance toggle */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setAutoAdvanceLessonIntro(!autoAdvanceLessonIntro);
                  }}
                  className={`px-2 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    autoAdvanceLessonIntro
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={autoAdvanceLessonIntro ? 'Avanço automático para as perguntas ativado' : 'Avanço automático desativado'}
                >
                  <span>Auto-passar:</span>
                  <span className={`px-1 rounded-md text-[10px] ${autoAdvanceLessonIntro ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    {autoAdvanceLessonIntro ? 'Sim' : 'Não'}
                  </span>
                </button>

                {/* Audio Wave Bars visualizer */}
                {isSpeakingExplanation && (
                  <div className="flex items-center gap-0.5 h-5 px-2">
                    <span className="w-1 h-3 bg-indigo-600 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-5 bg-purple-600 rounded-full animate-bounce delay-150" />
                    <span className="w-1 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-bounce delay-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Ação Imediata: Ir para as Perguntas Agora (sem travar na tela) */}
            <div className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 border border-indigo-200 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">📝</span>
                <div className="min-w-0">
                  <span className="text-xs font-black text-indigo-950 block truncate">
                    Pronto para responder às perguntas?
                  </span>
                  <span className="text-[10px] text-indigo-800/80 truncate block">
                    {activeLesson.practiceQuestions.length} questões com gabarito comentado
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleProceedToQuiz}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>Ir para Perguntas ➔</span>
              </button>
            </div>

            {/* Auto-advancing notification banner */}
            {isAutoAdvancingToQuiz && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2 shadow-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900 leading-tight">
                    Quadro narrado! Passando para as perguntas de fixação...
                  </span>
                </div>
                <button
                  onClick={() => handleProceedToQuiz()}
                  className="px-2.5 py-1 rounded-xl bg-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-300 cursor-pointer"
                >
                  Ir Agora
                </button>
              </div>
            )}

            {/* Title & Summary */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-black">
                  📚 Resumo da Matéria
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                {activeLesson.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeLesson.summary}
              </p>
            </div>

            {/* Block 1: O Conteúdo da Aula */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                <span>📖 1. O Conteúdo da Aula</span>
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-1">
                {activeLesson.detailedExplanation}
              </div>
            </div>

            {/* Block 2: Como Fazer / Regras Práticas */}
            {activeLesson.keyPoints && activeLesson.keyPoints.length > 0 && (
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  <span>✍️ 2. Como Fazer (Regras e Dicas)</span>
                </h3>
                <ul className="space-y-1.5">
                  {activeLesson.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Block 3: Exemplo Resolvido */}
            {activeLesson.example && (
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-xs font-black text-cyan-800 flex items-center gap-1.5">
                  <span>💡 3. Exemplo Prático Resolvido</span>
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {activeLesson.example}
                </p>
              </div>
            )}
          </div>

          {/* CTA: Iniciar Exercícios */}
          <div className="pt-3 sticky bottom-0 bg-slate-50/95 backdrop-blur-xs pb-1 border-t border-slate-200">
            <button
              onClick={handleProceedToQuiz}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>Praticar Questões</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QUIZ VIEW (NO TIMER, WITH QUESTION SPEECH) */}
      {!isLoading && currentStep === 'quiz' && currentQ && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Automatic Voice Answer Controller */}
            <VoiceAnswerController
              options={currentQ.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNextQuestion}
            />

            {/* Question Audio Readout Bar & Explain Question CTA */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsTheoryGuideOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 hover:text-purple-900 border border-purple-300 text-xs font-black transition shadow-2xs active:scale-95 cursor-pointer"
                  title="Ver explicação didática completa da matéria e desta questão"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Explicar Pergunta 💡</span>
                </button>

                <button
                  onClick={handleSpeakQuestion}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  title="Ouvir pergunta em voz alta"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isSpeakingQuestion ? 'Pausar' : 'Ouvir'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full"
                  title="Nota simulada pelo seu desempenho nos exercícios desta matéria"
                >
                  Nota Est: {estimatedGrade.estimatedGrade10.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {currentQuestionIndex + 1}/{activeLesson?.practiceQuestions.length || 1}
                </span>
              </div>
            </div>

            {/* Question Statement Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
                {activeLesson?.title || currentSubjectMeta.name}
              </span>
              <h2 className="text-sm font-black text-slate-900 leading-relaxed">
                {currentQ.question || (currentQ as any).text}
              </h2>
            </div>

            {/* Options List (A, B, C, D) */}
            <div className="space-y-2.5">
              {(currentQ.options || []).map((optionText, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let cardStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50 shadow-2xs';
                let letterStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    cardStyle =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs';
                    letterStyle = 'bg-emerald-500 text-white border-emerald-600 font-black';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs';
                    letterStyle = 'bg-rose-500 text-white border-rose-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 text-left active:scale-[0.99] cursor-pointer ${cardStyle}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${letterStyle}`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs font-semibold flex-1 leading-snug">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pedagogical Explanation Feedback Card */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-2xl border space-y-1.5 animate-in fade-in slide-in-from-bottom-2 ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-amber-50 border-amber-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${
                    selectedOption === currentQ.correctIndex ? 'text-emerald-800' : 'text-amber-900'
                  }`}>
                    {selectedOption === currentQ.correctIndex
                      ? 'Parabéns, você acertou! 🎉'
                      : 'Explicação Pedagógica 💡'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentQ.explanation}
                </p>

                {onOpenErrorFeedback && (
                  <div className="flex justify-end pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenErrorFeedback(`Questão de ${currentSubjectMeta.name}: ${currentQ.question.substring(0, 50)}...`);
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      <span>Reportar erro nesta pergunta</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Question / Review CTA Button */}
          {isAnswerSubmitted && (
            <div className="pt-2">
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>
                  {currentQuestionIndex + 1 >= (activeLesson?.practiceQuestions?.length || 10)
                    ? 'Fazer Revisão do Conteúdo 📝'
                    : 'Próxima Pergunta'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && currentStep === 'quiz' && !currentQ && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm m-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-xs">
            🎯
          </div>
          <h2 className="text-base font-black text-slate-900">Perguntas Concluídas!</h2>
          <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
            Todas as perguntas deste conteúdo foram finalizadas.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setCurrentStep('review')}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
            >
              <span>Ver Revisão do Conteúdo</span>
            </button>
            <button
              type="button"
              onClick={handleExitJourney}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Jornada</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW VIEW (Revisão após as perguntas com avanço para o próximo conteúdo - 100% TEMA CLARO) */}
      {!isLoading && (currentStep === 'review' || currentStep === 'summary') && (
        activeLesson ? (
        <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto pr-1 pb-4">
          <div className="space-y-4">
            {/* Top Celebration & Score Banner */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                      Revisão do Conteúdo
                    </span>
                    <h2 className="text-sm font-black text-slate-900 truncate max-w-[210px]">
                      {activeLesson.title}
                    </h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black shrink-0">
                  {currentSubjectMeta.name}
                </span>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Acertos</span>
                  <span className="text-sm font-black text-emerald-700">
                    {sessionCorrectCount} de {activeLesson.practiceQuestions.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">XP Ganho</span>
                  <span className="text-sm font-black text-purple-700">+60 XP</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Nota Estimada</span>
                  <span className="text-sm font-black text-amber-700">
                    {estimatedGrade.estimatedGrade10.toFixed(1)}/10
                  </span>
                </div>
              </div>
            </div>

            {/* HERO CARD: AVANÇAR PARA O PRÓXIMO CONTEÚDO (E VAI INDO) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-2 border-indigo-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Próximo Passo da Trilha</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {nextTopic
                    ? `Conteúdo ${currentTopicIndex + 2} de ${availableTopics.length}`
                    : 'Disciplina Concluída!'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {nextTopic
                    ? 'Avançar para o Próximo Conteúdo'
                    : nextSubject
                    ? `Parabéns! Avançar para ${nextSubject.name}`
                    : 'Parabéns! Você concluiu todos os conteúdos!'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                  {nextTopic
                    ? nextTopic.title
                    : nextSubject
                    ? `Todos os conteúdos de ${currentSubjectMeta.name} foram revisados! Continuar para ${nextSubject.name} com novas perguntas.`
                    : 'Você revisou todos os conteúdos programados para o seu ano escolar!'}
                </p>
              </div>

              {/* Status de salvamento automático */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Conteúdo salvo com sucesso! O app avançará sem repetir este conteúdo.</span>
              </div>

              {/* Botão Principal: Avançar para o Próximo Conteúdo */}
              <button
                onClick={handleAdvanceToNextTopic}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Avançar para o Próximo Conteúdo</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Botões Solicitados: Ouvir Explicação de Novo / Fazer Perguntas de Novo */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReplayExplanation}
                  className="py-3 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 text-center"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Ouvir explicação de novo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRetryCurrentTopic}
                  className="py-3 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 text-center"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Fazer perguntas de novo</span>
                </button>
              </div>

              {/* Botão Sair da Jornada */}
              <button
                type="button"
                onClick={handleExitJourney}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Sair da Jornada (Salvar e Voltar ao Início)</span>
              </button>
            </div>

            {/* REVISION TABS: GABARITO DAS PERGUNTAS / RESUMO TEÓRICO */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setReviewActiveTab('questions');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  reviewActiveTab === 'questions'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Gabarito das Perguntas ({sessionCorrectCount}/{activeLesson.practiceQuestions.length})</span>
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setReviewActiveTab('theory');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  reviewActiveTab === 'theory'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Resumo Teórico</span>
              </button>
            </div>

            {/* TAB 1: GABARITO COMENTADO DAS PERGUNTAS */}
            {reviewActiveTab === 'questions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="font-semibold">Revisão detalhada de cada questão:</span>
                  <span className="font-bold text-emerald-700">
                    {Math.round((sessionCorrectCount / (activeLesson.practiceQuestions.length || 1)) * 100)}% de acertos
                  </span>
                </div>

                {activeLesson.practiceQuestions.map((q, idx) => {
                  const recorded = answeredQuestionsReview[idx];
                  const userOptionIdx = recorded?.selectedOptionIndex ?? null;
                  const isCorrect = recorded ? recorded.isCorrect : userOptionIdx === q.correctIndex;
                  const isSpeakingThis = reviewSpeakingIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                          : 'bg-rose-50/50 border-rose-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Header of Question */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span>Questão {idx + 1}</span>
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Acertou</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Errou</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Question text */}
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {q.question || (q as any).text}
                      </p>

                      {/* User answer vs correct answer */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {userOptionIdx !== null && (
                          <div
                            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                              isCorrect
                                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                                : 'bg-rose-100/70 border-rose-300 text-rose-950'
                            }`}
                          >
                            <span className="font-black shrink-0">Sua resposta:</span>
                            <span className="font-medium leading-snug">
                              {String.fromCharCode(65 + userOptionIdx)}) {q.options[userOptionIdx] || 'Não selecionada'}
                            </span>
                          </div>
                        )}

                        {!isCorrect && (
                          <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 flex items-start gap-2">
                            <span className="font-black text-emerald-900 shrink-0">Resposta correta:</span>
                            <span className="font-semibold text-emerald-950 leading-snug">
                              {String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pedagogical Explanation Box */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-amber-800 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Explicação Didática</span>
                          </span>
                          <button
                            onClick={() => handleToggleReviewSpeech(idx, q.explanation)}
                            className="text-[10px] text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            {isSpeakingThis ? (
                              <>
                                <Pause className="w-3 h-3 text-rose-600" />
                                <span>Pausar</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-indigo-600" />
                                <span>Ouvir</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: RESUMO TEÓRICO DO CONTEÚDO */}
            {reviewActiveTab === 'theory' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Resumo de Fixação</h3>
                    <p className="text-[10px] text-slate-500">Conceitos fundamentais para memorizar</p>
                  </div>
                  <button
                    onClick={handleToggleReviewTheorySpeech}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isSpeakingReviewTheory ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-rose-600" />
                        <span>Pausar Áudio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Ouvir Resumo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="text-xs font-black text-purple-800">📖 1. Visão Geral</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeLesson.summary}
                  </p>
                </div>

                {activeLesson.keyPoints && activeLesson.keyPoints.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <h4 className="text-xs font-black text-amber-800">✍️ 2. Pontos-Chave</h4>
                    <ul className="space-y-1.5">
                      {activeLesson.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeLesson.example && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <h4 className="text-xs font-black text-cyan-800">💡 3. Exemplo Resolvido</h4>
                    <p className="text-xs text-slate-800 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {activeLesson.example}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="pt-3 sticky bottom-0 bg-slate-50/95 backdrop-blur-xs space-y-2 pb-1 border-t border-slate-200">
            <button
              onClick={handleAdvanceToNextTopic}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Avançar para o Próximo Conteúdo 🚀</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleReplayExplanation}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-purple-900 border border-purple-200 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Ouvir explicação de novo</span>
              </button>

              <button
                type="button"
                onClick={handleRetryCurrentTopic}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-amber-950 border border-amber-200 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Fazer perguntas de novo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExitJourney}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sair da Jornada (Salvar e Voltar ao Início)</span>
            </button>
          </div>
        </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm m-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-base font-black text-slate-900">Perguntas Concluídas com Sucesso!</h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
              Você completou os exercícios desta lição. Todos os seus pontos XP e acertos foram registrados.
            </p>
            <button
              type="button"
              onClick={handleExitJourney}
              className="w-full max-w-xs py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Jornada (Voltar ao Início)</span>
            </button>
          </div>
        )
      )}

      {/* QUESTION THEORY & AI GUIDE MODAL */}
      <QuestionTheoryGuideModal
        isOpen={isTheoryGuideOpen}
        onClose={() => setIsTheoryGuideOpen(false)}
        question={currentQ || null}
        userGrade={user.grade}
        lesson={activeLesson}
        userName={user.name}
      />
    </div>
  );
};
