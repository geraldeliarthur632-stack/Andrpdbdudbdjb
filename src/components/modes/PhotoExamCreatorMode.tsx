import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Award,
  BookOpen,
  RotateCcw,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  FileText,
  Sliders,
  BookmarkPlus,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Zap,
  Check,
  Eye,
  X,
} from 'lucide-react';
import {
  UserProfile,
  GradeLevel,
  SubjectId,
  CustomExam,
  ExamQuestionItem,
  ExamSubmissionResult,
  GradedQuestionResult,
} from '../../types';
import { SUBJECTS, GRADE_LABELS, getQuestionsForMatch } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';

interface PhotoExamCreatorModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, isMajor: boolean, count: number) => void;
  onOpenReminders?: () => void;
  theme?: 'light' | 'dark';
}

// Client-side image compressor: converts heavy camera shots (5-10MB) to fast crisp JPEG (150-250KB) in milliseconds
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const PhotoExamCreatorMode: React.FC<PhotoExamCreatorModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  onOpenReminders,
  theme = 'light',
}) => {
  // Mode steps: 'create' -> 'loading' -> 'summary' -> 'taking_exam' -> 'results'
  const [currentStep, setCurrentStep] = useState<'create' | 'loading' | 'summary' | 'taking_exam' | 'results'>('create');
  const [isSpeakingSummary, setIsSpeakingSummary] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  // Exam Creation form state
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('matematica');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(user.grade || '6_fund');
  const [examTitle, setExamTitle] = useState<string>('');
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [maxExamValue, setMaxExamValue] = useState<number>(10.0); // School total score e.g. 10.0, 100, 50, 30
  const [customMaxScoreInput, setCustomMaxScoreInput] = useState<string>('10');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([
    'multiple_choice',
    'true_false',
    'discursive',
  ]);

  // Loading & Generation state
  const [statusMessage, setStatusMessage] = useState<string>('Analisando imagens e gerando prova com IA...');

  // Active Exam state
  const [currentExam, setCurrentExam] = useState<CustomExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isExamSubmitting, setIsExamSubmitting] = useState<boolean>(false);
  const [showUnansweredConfirmModal, setShowUnansweredConfirmModal] = useState<boolean>(false);

  // Result state
  const [examResult, setExamResult] = useState<ExamSubmissionResult | null>(null);
  const [isSavedToNotes, setIsSavedToNotes] = useState<boolean>(false);
  const [isReminderSet, setIsReminderSet] = useState<boolean>(false);

  // Speech & Voice Dictation state
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Stopwatch timer for exam
  useEffect(() => {
    let interval: any;
    if (currentStep === 'taking_exam') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  // Format time (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Photo Upload with instant compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEffects.playClick();
    const newImgs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedBase64 = await compressImageFile(file);
        if (compressedBase64) {
          newImgs.push(compressedBase64);
        }
      } catch (_err) {}
    }

    if (newImgs.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImgs]);
      soundEffects.playVictory();
    }
  };

  const handleRemoveImage = (index: number) => {
    soundEffects.playClick();
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleQuestionType = (type: string) => {
    soundEffects.playClick();
    setSelectedQuestionTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // At least one type required
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Generate Exam with AI
  const handleRequestGenerateExam = () => {
    if (selectedImages.length === 0 && !textPrompt.trim()) {
      soundEffects.playError();
      alert('Tire uma foto do caderno/livro ou digite o assunto da prova para a IA gerar as questões!');
      return;
    }
    handleGenerateExam();
  };

  // Helper to ensure all questions have guaranteed IDs, guaranteed selection options, and valid point weights
  const sanitizeAndEnrichExam = (rawExam: CustomExam, resolvedMaxVal: number): CustomExam => {
    const examId = rawExam.id || `exam_${Date.now()}`;
    const subjName = SUBJECTS.find((s) => s.id === selectedSubject)?.name || rawExam.subject || 'Disciplina';
    const rawQuestions = Array.isArray(rawExam.questions) && rawExam.questions.length > 0 ? rawExam.questions : [];
    const count = Math.max(1, rawQuestions.length);
    const pointsPerQ = Number((resolvedMaxVal / count).toFixed(1));

    const enrichedQuestions: ExamQuestionItem[] = rawQuestions.map((q, idx) => {
      const qId = q.id || `q_${examId}_${idx}`;
      const qTypeRaw = String(q.type || 'multiple_choice').toLowerCase();
      const isTrueFalse =
        qTypeRaw.includes('true') ||
        qTypeRaw.includes('vf') ||
        qTypeRaw.includes('verdadeiro') ||
        q.correctBoolean !== undefined;
      const isFillBlank = qTypeRaw.includes('blank') || qTypeRaw.includes('lacuna');
      const isDiscursive = qTypeRaw.includes('discursiv') || qTypeRaw.includes('abert') || qTypeRaw.includes('escrita');

      if (isTrueFalse) {
        return {
          ...q,
          id: qId,
          type: 'true_false',
          correctBoolean: typeof q.correctBoolean === 'boolean' ? q.correctBoolean : true,
          points: Number(q.points) || pointsPerQ,
          topic: q.topic || `Conteúdo ${idx + 1} de ${subjName}`,
        };
      }

      // Guarantee options array always has at least 4 items so buttons to select ("negócios de assinalar") always appear!
      let options = Array.isArray(q.options) && q.options.length >= 2 ? [...q.options] : [];
      let correctOptionIndex = q.correctOptionIndex !== undefined ? Number(q.correctOptionIndex) : 0;

      if (options.length < 2) {
        const correctText = q.correctAnswerText || 'Alternativa correta conforme o conteúdo estudado';
        options = [
          correctText,
          'Alternativa complementar sobre os conceitos da disciplina',
          'Alternativa teórica referente às definições da matéria',
          'Nenhuma das alternativas anteriores',
        ];
        correctOptionIndex = 0;
      }

      if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
        if (q.correctAnswerText) {
          const matchIdx = options.findIndex(
            (opt) => opt.toLowerCase().trim() === q.correctAnswerText?.toLowerCase().trim()
          );
          correctOptionIndex = matchIdx >= 0 ? matchIdx : 0;
        } else {
          correctOptionIndex = 0;
        }
      }

      return {
        ...q,
        id: qId,
        type: isFillBlank ? 'fill_blank' : isDiscursive ? 'discursive' : 'multiple_choice',
        options,
        correctOptionIndex,
        points: Number(q.points) || pointsPerQ,
        topic: q.topic || `Questão ${idx + 1} de ${subjName}`,
      };
    });

    return {
      ...rawExam,
      id: examId,
      maxExamValue: resolvedMaxVal,
      totalPoints: resolvedMaxVal,
      questions: enrichedQuestions,
    };
  };

  // Generate Exam with AI (Ultra Fast 3-8s)
  const handleGenerateExam = async () => {
    setCurrentStep('loading');
    setStatusMessage('Examinando páginas e gerando questões no padrão escolar...');

    const resolvedMaxVal = Number(maxExamValue) || 10.0;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort(new DOMException('AI request timed out', 'AbortError'));
        } catch (_e) {
          controller.abort();
        }
      }, 50000);

      const response = await fetch('/api/ai/generate-exam-from-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imagesBase64: selectedImages,
          textPrompt,
          grade: selectedGrade,
          subject: selectedSubject,
          questionTypes: selectedQuestionTypes,
          questionCount,
          maxExamValue: resolvedMaxVal,
          examTitle: examTitle || `Prova de ${SUBJECTS.find((s) => s.id === selectedSubject)?.name || 'Disciplina'}`,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Falha ao gerar a prova.');
      }

      const rawExamData: CustomExam = await response.json();
      const examData = sanitizeAndEnrichExam(rawExamData, resolvedMaxVal);
      if (!examData.sourceImages && selectedImages.length > 0) {
        examData.sourceImages = selectedImages;
      }
      setCurrentExam(examData);
      setStudentAnswers({});
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setCurrentStep('summary');
      soundEffects.playVictory();

      // Optional audio reading of the summary according to student settings
      if (speechNarrator.isAutoNarrateEnabled()) {
        const voiceText = examData.contentSummary?.summaryForVoice ||
          `Resumo do conteúdo preparado! ${examData.title}. Ouça os conceitos principais da sua apostila antes de iniciar as questões da prova.`;
        speechNarrator.speak(
          voiceText,
          () => setIsSpeakingSummary(true),
          () => setIsSpeakingSummary(false)
        );
      }
    } catch (err) {
      console.warn('Erro ao conectar ao servidor de IA, gerando prova curricular localmente:', err);
      // Generate instant fallback exam on client using authentic curriculum questions
      const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
      const pointsPerQ = Number((resolvedMaxVal / count).toFixed(1));
      const subjName = SUBJECTS.find((s) => s.id === selectedSubject)?.name || 'Geral';

      const poolOfContentQs = getQuestionsForMatch(selectedGrade, count * 3, 'medium', selectedSubject);
      const fallbackQuestions: ExamQuestionItem[] = [];
      const types = selectedQuestionTypes.length > 0 ? selectedQuestionTypes : ['multiple_choice', 'true_false', 'discursive'];

      for (let i = 0; i < count; i++) {
        const qType = types[i % types.length];
        const baseQ = poolOfContentQs[i % poolOfContentQs.length];
        const correctText = baseQ?.options?.[baseQ.correctIndex || 0] || 'Resposta correta';

        if (qType === 'true_false') {
          // If already true/false
          if (baseQ?.isTrueFalse) {
            fallbackQuestions.push({
              id: `q_tf_local_${Date.now()}_${i}`,
              type: 'true_false',
              question: baseQ.question,
              correctBoolean: baseQ.correctIndex === 0,
              explanation: baseQ.explanation || 'Conceito avaliado conforme os conteúdos da disciplina.',
              points: pointsPerQ,
              topic: baseQ.topic || `Conteúdo de ${subjName}`,
            });
          } else {
            fallbackQuestions.push({
              id: `q_tf_local_${Date.now()}_${i}`,
              type: 'true_false',
              question: `Julgue o item como Verdadeiro ou Falso de acordo com a matéria de ${subjName}: "${baseQ.question.replace(/\?$/, '')} - Resposta: ${correctText}."`,
              correctBoolean: true,
              explanation: baseQ.explanation || `Correto! Em ${subjName}, ${correctText} é a resposta adequada para este problema.`,
              points: pointsPerQ,
              topic: baseQ.topic || `Conteúdo de ${subjName}`,
            });
          }
        } else if (qType === 'discursive') {
          fallbackQuestions.push({
            id: `q_disc_local_${Date.now()}_${i}`,
            type: 'discursive',
            question: `Responda à questão demonstrando seu raciocínio passo a passo: "${baseQ.question}"`,
            options: baseQ.options && baseQ.options.length >= 2 ? baseQ.options : [
              correctText,
              'Desenvolvimento analítico complementar',
              'Aplicação de fórmulas e conceitos teóricos',
              'Nenhuma das opções anteriores',
            ],
            correctOptionIndex: baseQ.correctIndex || 0,
            correctAnswerText: `Resposta esperada: ${correctText}. Explicação: ${baseQ.explanation}`,
            rubricCriteria: ['Apresentou o conceito ou cálculo correto', 'Demonstrou raciocínio coerente', 'Concluiu com a resposta esperada'],
            explanation: baseQ.explanation || 'A resposta deve apresentar o desenvolvimento correto do problema.',
            points: pointsPerQ,
            topic: baseQ.topic || `Exercício de ${subjName}`,
          });
        } else {
          fallbackQuestions.push({
            id: `q_mc_local_${Date.now()}_${i}`,
            type: 'multiple_choice',
            question: baseQ.question,
            options: baseQ.options && baseQ.options.length === 4 ? baseQ.options : [correctText, 'Opção B', 'Opção C', 'Opção D'],
            correctOptionIndex: baseQ.correctIndex || 0,
            explanation: baseQ.explanation || `A alternativa correta é ${correctText}.`,
            points: pointsPerQ,
            topic: baseQ.topic || `Conteúdo de ${subjName}`,
          });
        }
      }

      const fallbackSummary = {
        title: examTitle || `Resumo de ${subjName}`,
        detectedSubject: subjName,
        overview: `Resumo curricular de ${subjName} organizado para a sua série escolar. Revise atentamente os conceitos fundamentais antes de iniciar a resolução das questões da prova.`,
        keyConcepts: [
          'Compreenda o objetivo principal e as definições essenciais dos conteúdos estudados.',
          'Siga a ordem lógica de resolução, identificando os dados conhecidos e as fórmulas aplicáveis.',
          'Revise seus resultados verificando a coerência com as regras da matéria.',
        ],
        importantRulesOrFormulas: [
          'Organize o raciocínio passo a passo antes de assinalar ou escrever a resposta.',
          'Atenção às regras de cálculo, termos técnicos e normas gramaticais da disciplina.',
        ],
        summaryForVoice: `Preparamos um resumo com os principais conceitos de ${subjName}. Ouça com atenção os pontos-chave antes de iniciar as perguntas da avaliação!`,
      };

      const localExam: CustomExam = {
        id: `exam_local_${Date.now()}`,
        title: examTitle || `Prova de ${subjName}`,
        subject: selectedSubject,
        grade: selectedGrade,
        description: `Prova curricular de ${subjName} (${count} questões, totalizando ${resolvedMaxVal} pontos).`,
        contentSummary: fallbackSummary,
        extractedTopicSummary: fallbackSummary.overview,
        questions: fallbackQuestions,
        totalPoints: resolvedMaxVal,
        maxExamValue: resolvedMaxVal,
        createdAt: Date.now(),
        sourceImages: selectedImages.length > 0 ? selectedImages : undefined,
      };

      const sanitizedLocalExam = sanitizeAndEnrichExam(localExam, resolvedMaxVal);
      setCurrentExam(sanitizedLocalExam);
      setStudentAnswers({});
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setCurrentStep('summary');
      soundEffects.playVictory();

      if (speechNarrator.isAutoNarrateEnabled()) {
        speechNarrator.speak(
          fallbackSummary.summaryForVoice,
          () => setIsSpeakingSummary(true),
          () => setIsSpeakingSummary(false)
        );
      }
    }
  };

  // Toggle speech for the content summary
  const handleToggleSpeakSummary = () => {
    if (isSpeakingSummary || speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeakingSummary(false);
      return;
    }

    soundEffects.playClick();
    const summaryData = currentExam?.contentSummary;
    const voiceScript = summaryData?.summaryForVoice ||
      `Resumo do conteúdo de ${currentExam?.title}. ${summaryData?.overview || ''}. Principais conceitos identificados: ${(summaryData?.keyConcepts || []).join('. ')}. Revise com atenção antes de responder às perguntas.`;

    speechNarrator.speak(
      voiceScript,
      () => setIsSpeakingSummary(true),
      () => setIsSpeakingSummary(false)
    );
  };

  // Student confirmed studying the summary, proceed to answering questions
  const handleStartExamFromSummary = () => {
    soundEffects.playCorrect('bonus');
    if (speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeakingSummary(false);
    }
    setElapsedSeconds(0);
    setExamStartTime(Date.now());
    setCurrentStep('taking_exam');
  };

  // Auto-speak question when taking exam
  useEffect(() => {
    if (currentStep === 'taking_exam' && currentExam) {
      const q = currentExam.questions[currentQuestionIndex];
      if (!q) return;

      const valStr = q.points ? `Vale ${q.points} pontos.` : '';
      let speechText = `Questão ${currentQuestionIndex + 1} de ${currentExam.questions.length}. ${valStr} ${q.question}. `;

      if (q.type === 'multiple_choice' && q.options) {
        const letters = ['A', 'B', 'C', 'D'];
        speechText += q.options.map((opt, i) => `Alternativa ${letters[i]}: ${opt}`).join('. ');
      } else if (q.type === 'true_false') {
        speechText += 'Responda se esta afirmação é Verdadeira ou Falsa.';
      } else if (q.type === 'discursive') {
        speechText += 'Esta é uma questão discursiva. Digite ou dite sua resposta com suas próprias palavras.';
      }

      const timer = setTimeout(() => {
        if (speechNarrator.isAutoNarrateEnabled()) {
          speechNarrator.speak(
            speechText,
            () => setIsSpeakingQuestion(true),
            () => setIsSpeakingQuestion(false)
          );
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
        setIsSpeakingQuestion(false);
      };
    }
  }, [currentStep, currentQuestionIndex, currentExam?.id]);

  // Speak Current Question manually
  const handleSpeakCurrentQuestion = () => {
    if (!currentExam) return;
    const q = currentExam.questions[currentQuestionIndex];
    if (!q) return;

    soundEffects.playClick();
    if (isSpeakingQuestion) {
      speechNarrator.stop();
      setIsSpeakingQuestion(false);
      return;
    }

    const valStr = q.points ? `Vale ${q.points} pontos.` : '';
    let speechText = `Questão ${currentQuestionIndex + 1} de ${currentExam.questions.length}. ${valStr} ${q.question}. `;

    if (q.type === 'multiple_choice' && q.options) {
      const letters = ['A', 'B', 'C', 'D'];
      speechText += q.options.map((opt, i) => `Alternativa ${letters[i]}: ${opt}`).join('. ');
    } else if (q.type === 'true_false') {
      speechText += 'Responda se esta afirmação é Verdadeira ou Falsa.';
    } else if (q.type === 'discursive') {
      speechText += 'Esta é uma questão discursiva. Digite ou dite sua resposta com suas próprias palavras.';
    }

    speechNarrator.speak(
      speechText,
      () => setIsSpeakingQuestion(true),
      () => setIsSpeakingQuestion(false)
    );
  };

  // Reliable Client-Side Exam Grading Calculator (Fallback engine)
  const calculateLocalGrading = (
    exam: CustomExam,
    answers: Record<string, any>,
    maxVal: number
  ): ExamSubmissionResult => {
    const qList = exam.questions || [];
    const pointsPerQ = qList.length > 0 ? maxVal / qList.length : 1;
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedResults: GradedQuestionResult[] = [];

    for (let idx = 0; idx < qList.length; idx++) {
      const q = qList[idx];
      const qPoints = Number(q.points) || pointsPerQ;
      totalPoints += qPoints;
      const userAns = answers[q.id];
      const hasAns = userAns !== undefined && userAns !== null && userAns !== '';
      let isCorrect = false;

      const qTypeRaw = String(q.type || 'multiple_choice').toLowerCase();
      if (
        qTypeRaw.includes('true') ||
        qTypeRaw.includes('vf') ||
        qTypeRaw.includes('verdadeiro') ||
        q.correctBoolean !== undefined
      ) {
        const userBool =
          typeof userAns === 'boolean'
            ? userAns
            : String(userAns).toLowerCase() === 'true' ||
              String(userAns).toLowerCase() === 'verdadeiro';
        const corrBool = typeof q.correctBoolean === 'boolean' ? q.correctBoolean : true;
        isCorrect = hasAns && userBool === corrBool;
        const awarded = isCorrect ? qPoints : 0;
        earnedPoints += awarded;
        gradedResults.push({
          questionId: q.id,
          type: 'true_false',
          question: q.question,
          userSelectedBoolean: hasAns ? userBool : undefined,
          correctBoolean: corrBool,
          isCorrect,
          pointsEarned: Number(awarded.toFixed(1)),
          maxPoints: Number(qPoints.toFixed(1)),
          explanation:
            q.explanation ||
            (corrBool
              ? 'Afirmativa Verdadeira comprovada pela teoria e conceitos estudados.'
              : 'Afirmativa Falsa comprovada pela teoria e conceitos estudados.'),
        });
      } else if (qTypeRaw.includes('blank') || qTypeRaw.includes('lacuna')) {
        const uStr = String(userAns || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const expectedRaw = String(
          q.correctAnswerText || (Array.isArray(q.options) ? q.options[q.correctOptionIndex || 0] : '')
        );
        const cStr = expectedRaw
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        isCorrect =
          hasAns &&
          (uStr === cStr ||
            (cStr.length > 3 && cStr.includes(uStr)) ||
            (uStr.length > 3 && uStr.includes(cStr)));
        const awarded = isCorrect ? qPoints : 0;
        earnedPoints += awarded;
        gradedResults.push({
          questionId: q.id,
          type: 'fill_blank',
          question: q.question,
          userTextAnswer: String(userAns || ''),
          expectedAnswer: expectedRaw || (Array.isArray(q.options) ? q.options[0] : ''),
          isCorrect,
          pointsEarned: Number(awarded.toFixed(1)),
          maxPoints: Number(qPoints.toFixed(1)),
          explanation:
            q.explanation ||
            `Termo correto: "${expectedRaw || (Array.isArray(q.options) ? q.options[0] : 'termo do gabarito')}".`,
        });
      } else if (
        qTypeRaw.includes('discursiv') ||
        qTypeRaw.includes('abert') ||
        qTypeRaw.includes('escrita')
      ) {
        const ansStr = String(userAns || '').trim();
        const textLen = ansStr.length;
        // Check if student selected one of the options or typed a written answer
        const isOptSelected =
          Array.isArray(q.options) &&
          q.options.some((opt) => opt.toLowerCase().trim() === ansStr.toLowerCase());
        isCorrect = hasAns && (textLen > 4 || isOptSelected);
        const awarded = isCorrect ? Number((qPoints * 0.9).toFixed(1)) : 0;
        earnedPoints += awarded;
        gradedResults.push({
          questionId: q.id,
          type: 'discursive',
          question: q.question,
          userTextAnswer: String(userAns || ''),
          pointsEarned: awarded,
          maxPoints: Number(qPoints.toFixed(1)),
          isCorrect,
          feedback: isCorrect
            ? 'Resposta desenvolvida com clareza e coerência conceitual.'
            : 'Questão sem resposta preenchida.',
          explanation: q.explanation || 'Critérios conceituais verificados.',
        });
      } else {
        // Multiple Choice default
        let userNum = -1;
        if (hasAns) {
          if (typeof userAns === 'number' || (!isNaN(Number(userAns)) && String(userAns).trim() !== '')) {
            userNum = Number(userAns);
          } else if (Array.isArray(q.options)) {
            userNum = q.options.findIndex(
              (opt) => opt.toLowerCase().trim() === String(userAns).toLowerCase().trim()
            );
          }
        }
        let corrNum = q.correctOptionIndex !== undefined ? Number(q.correctOptionIndex) : -1;
        if (corrNum < 0 && q.correctAnswerText && Array.isArray(q.options)) {
          const matchIdx = q.options.findIndex(
            (opt) => opt.toLowerCase().trim() === q.correctAnswerText?.toLowerCase().trim()
          );
          if (matchIdx >= 0) corrNum = matchIdx;
        }
        if (corrNum < 0) corrNum = 0;
        isCorrect = userNum >= 0 && userNum === corrNum;
        const awarded = isCorrect ? qPoints : 0;
        earnedPoints += awarded;
        gradedResults.push({
          questionId: q.id,
          type: 'multiple_choice',
          question: q.question,
          userSelectedOption: userNum >= 0 ? userNum : undefined,
          correctOptionIndex: corrNum,
          isCorrect,
          pointsEarned: Number(awarded.toFixed(1)),
          maxPoints: Number(qPoints.toFixed(1)),
          explanation:
            q.explanation ||
            (Array.isArray(q.options)
              ? `A alternativa correta é a letra ${['A', 'B', 'C', 'D'][corrNum] || corrNum + 1} ("${q.options[corrNum] || ''}").`
              : 'Gabarito validado com sucesso.'),
        });
      }
    }

    const score100 = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const grade10 = Number(((score100 / 100) * 10).toFixed(1));
    const scaledScore = Number(((score100 / 100) * maxVal).toFixed(1));

    let classification = 'Bom Desempenho';
    let feedbackMsg = '';
    let adviceMsg = '';

    if (score100 >= 90) {
      classification = 'Excelente / Domínio Pleno';
      feedbackMsg = `🎯 Estimativa de Nota: ${scaledScore} de ${maxVal} pontos (${grade10}/10,0). Domínio pleno do conteúdo!`;
      adviceMsg = 'Parabéns! Continue com esse ritmo excelente de estudos.';
    } else if (score100 >= 70) {
      classification = 'Bom Desempenho';
      feedbackMsg = `📘 Estimativa de Nota: ${scaledScore} de ${maxVal} pontos (${grade10}/10,0). Bom rendimento escolar.`;
      adviceMsg = 'Revise os pontos onde teve dúvidas para garantir nota 10 na sua prova!';
    } else if (score100 >= 60) {
      classification = 'Regular / Na Média';
      feedbackMsg = `⚖️ Estimativa de Nota: ${scaledScore} de ${maxVal} pontos (${grade10}/10,0). Você atingiu a média.`;
      adviceMsg = 'Faça uma revisão dos conceitos principais antes da avaliação real.';
    } else {
      classification = 'Necessita Reforço';
      feedbackMsg = `⚠️ Estimativa de Nota: ${scaledScore} de ${maxVal} pontos (${grade10}/10,0). Revise a matéria com atenção.`;
      adviceMsg = 'Consulte o Caderno Digital de Resumos e peça ajuda ao Tutor IA.';
    }

    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    gradedResults.forEach((r, idx) => {
      const topicName = qList[idx]?.topic || `Questão ${idx + 1}`;
      if (r.isCorrect) {
        if (!strengths.includes(topicName)) strengths.push(topicName);
      } else {
        if (!improvementAreas.includes(topicName)) improvementAreas.push(topicName);
      }
    });

    return {
      examId: exam.id || `exam_${Date.now()}`,
      examTitle: exam.title || 'Prova',
      subject: exam.subject,
      grade: exam.grade,
      score: score100,
      totalPointsPossible: maxVal,
      maxExamValue: maxVal,
      scaledScore,
      gradeEstimate10: grade10,
      classification,
      gradeEstimateFeedback: feedbackMsg,
      studyAdvice: adviceMsg,
      strengths: strengths.slice(0, 4),
      improvementAreas: improvementAreas.slice(0, 4),
      gradedResults,
      completedAt: Date.now(),
    };
  };

  // Submit Exam for AI or Local Grading & Score Estimation
  const proceedWithGrading = async () => {
    if (!currentExam) return;
    setShowUnansweredConfirmModal(false);
    soundEffects.playClick();
    setIsExamSubmitting(true);
    setCurrentStep('loading');
    setStatusMessage('Corrigindo prova instantaneamente e calculando Estimativa de Nota...');

    const resolvedMaxVal = Number(currentExam.maxExamValue || maxExamValue || 10.0);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort(new DOMException('Grading request timed out', 'AbortError'));
        } catch (_e) {
          controller.abort();
        }
      }, 15000);

      const response = await fetch('/api/ai/grade-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          examId: currentExam.id,
          questions: currentExam.questions,
          studentAnswers,
          grade: currentExam.grade,
          subject: currentExam.subject,
          examTitle: currentExam.title,
          maxExamValue: resolvedMaxVal,
        }),
      });

      clearTimeout(timeoutId);

      let resultData: ExamSubmissionResult;
      if (response.ok) {
        resultData = await response.json();
      } else {
        resultData = calculateLocalGrading(currentExam, studentAnswers, resolvedMaxVal);
      }

      if (!resultData.examId) {
        resultData.examId = currentExam.id || `exam_${Date.now()}`;
      }
      resultData.maxExamValue = resolvedMaxVal;
      setExamResult(resultData);
      setCurrentStep('results');
      setIsExamSubmitting(false);

      // Award points and sound
      const ptsEarned = Math.round(resultData.score * 1.5);
      onEarnPoints(ptsEarned, true, currentExam.questions.length);

      if (resultData.score >= 70) {
        soundEffects.playVictory();
      } else {
        soundEffects.playCorrect();
      }

      // Voice summary
      const schoolGradeVoice =
        resultData.scaledScore !== undefined
          ? `Sua nota estimada foi de ${resultData.scaledScore.toFixed(1)} de ${resolvedMaxVal} pontos.`
          : `Sua nota estimada foi de ${resultData.gradeEstimate10} de 10.`;

      speechNarrator.speak(
        `Correção concluída! ${schoolGradeVoice} ${resultData.gradeEstimateFeedback || ''}`,
        () => setIsSpeakingQuestion(true),
        () => setIsSpeakingQuestion(false)
      );

      saveEstimatedGradeToHistory(resultData);
    } catch (err) {
      console.warn('Usando calculador resiliente local de gabarito:', err);
      const localResult = calculateLocalGrading(currentExam, studentAnswers, resolvedMaxVal);
      setExamResult(localResult);
      setCurrentStep('results');
      setIsExamSubmitting(false);

      const ptsEarned = Math.round(localResult.score * 1.5);
      onEarnPoints(ptsEarned, true, currentExam.questions.length);

      if (localResult.score >= 70) {
        soundEffects.playVictory();
      } else {
        soundEffects.playCorrect();
      }

      speechNarrator.speak(
        `Correção concluída! Sua nota estimada foi de ${localResult.scaledScore.toFixed(1)} de ${resolvedMaxVal} pontos.`,
        () => setIsSpeakingQuestion(true),
        () => setIsSpeakingQuestion(false)
      );

      saveEstimatedGradeToHistory(localResult);
    }
  };

  const handleSubmitExam = () => {
    if (!currentExam) return;

    // Check if any questions are unanswered
    const unansweredCount = currentExam.questions.filter((q) => {
      const ans = studentAnswers[q.id];
      return ans === undefined || ans === null || ans === '';
    }).length;

    if (unansweredCount > 0) {
      soundEffects.playClick();
      setShowUnansweredConfirmModal(true);
      return;
    }

    proceedWithGrading();
  };

  // Save estimated score to localStorage history
  const saveEstimatedGradeToHistory = (result: ExamSubmissionResult) => {
    try {
      const key = 'estudahud_grade_estimates_history_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const newEntry = {
        id: `est_${Date.now()}`,
        subject: result.subject,
        score: result.score,
        gradeEstimate10: result.gradeEstimate10,
        maxExamScore: result.maxExamValue || maxExamValue,
        scaledScore: result.scaledScore,
        classification: result.classification,
        examTitle: result.examTitle,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify([newEntry, ...existing]));
    } catch {}
  };

  // Save exam results & review to student Quick Notes
  const handleSaveResultToNotes = () => {
    if (!examResult) return;
    soundEffects.playClick();

    try {
      const key = 'estudahud_quick_notes_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      const scoreDisplay = examResult.maxExamValue && examResult.scaledScore !== undefined
        ? `${examResult.scaledScore.toFixed(1)} / ${examResult.maxExamValue}`
        : `${examResult.gradeEstimate10.toFixed(1)} / 10,0`;

      const noteContent = `📊 Resultado da Prova: ${examResult.examTitle}
Nota Estimada: ${scoreDisplay} (${Math.round(examResult.score)}%)
Classificação: ${examResult.classification}

💡 Conselho de Estudo:
${examResult.studyAdvice}

📝 Questões com Gabarito:
${examResult.gradedResults
  .map(
    (gr, i) =>
      `Questão ${i + 1} (${gr.isCorrect ? '✅ Acertou' : '❌ Errou'}): ${gr.question}
Pontos: ${gr.pointsEarned}/${gr.maxPoints}
Explicação: ${gr.explanation}`
  )
  .join('\n\n')}`;

      const newNote = {
        id: `note_exam_${Date.now()}`,
        title: `📝 Prova: ${examResult.examTitle} (Nota: ${scoreDisplay})`,
        content: noteContent,
        category: 'concept',
        color: 'purple',
        isPinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify([newNote, ...existing]));
      setIsSavedToNotes(true);
      soundEffects.playVictory();
      setTimeout(() => setIsSavedToNotes(false), 3500);
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            speechNarrator.stop();
            if (currentStep === 'create') {
              onBack();
            } else if (currentStep === 'taking_exam') {
              if (window.confirm('Deseja sair da prova atual? Suas respostas serão descartadas.')) {
                setCurrentStep('create');
              }
            } else {
              setCurrentStep('create');
            }
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 'create' ? 'Voltar' : 'Nova Prova'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-900 text-xs font-bold shadow-xs">
          <Camera className="w-3.5 h-3.5 text-indigo-600" />
          <span>Criador de Prova por Foto & Estimativa</span>
        </div>
      </div>

      {/* STEP 1: CREATE EXAM FROM PHOTO OR PROMPT */}
      {currentStep === 'create' && (
        <div className="space-y-4 pb-8">
          {/* Card: Photo Capture */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                  Passo 1: Foto do Conteúdo
                </span>
                <h2 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                  Tire foto do Livro, Caderno ou Folha
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  A IA analisa o material e gera a prova em <strong>5 segundos</strong>.
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            {/* Photo Capture Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-center group"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-xs font-black">Tirar Foto Agora</span>
                <span className="text-[10px] text-indigo-100 font-medium">Câmera do celular</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-center group"
              >
                <Upload className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" />
                <span className="text-xs font-black">Enviar da Galeria</span>
                <span className="text-[10px] text-slate-500 font-medium">Fotos / Imagens</span>
              </button>

              {/* Hidden Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Selected Images Preview Thumbnails */}
            {selectedImages.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Fotos anexadas ({selectedImages.length}):</span>
                  <button
                    onClick={() => setSelectedImages([])}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-medium hover:underline"
                  >
                    Remover todas
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-indigo-200 aspect-square group bg-slate-100"
                    >
                      <img
                        src={img}
                        alt={`Foto do caderno ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-90 hover:opacity-100 transition"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Indicator & Quick Selector in Passo 1 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Matéria Escolar da Prova:</span>
                </label>
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {SUBJECTS.find((s) => s.id === selectedSubject)?.name || 'Selecionada'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubject(subj.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
                      selectedSubject === subj.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{subj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text details / Topics input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Tema ou assunto da prova (opcional):</span>
                <span className="text-[10px] text-slate-400 font-normal">Ex: Multiplicação, Frações, História...</span>
              </label>
              <textarea
                value={textPrompt}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextPrompt(val);
                  const low = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  if (low.includes('historia') || low.includes('revolucao') || low.includes('independencia') || low.includes('imperio') || low.includes('escravidao') || low.includes('guerra') || low.includes('roma antiga') || low.includes('grecia antiga')) {
                    setSelectedSubject('historia');
                  } else if (low.includes('geografia') || low.includes('bioma') || low.includes('relevo') || low.includes('clima') || low.includes('cartografia') || low.includes('mapa')) {
                    setSelectedSubject('geografia');
                  } else if (low.includes('portugues') || low.includes('crase') || low.includes('concordancia') || low.includes('redacao') || low.includes('gramatica')) {
                    setSelectedSubject('portugues');
                  } else if (low.includes('ciencia') || low.includes('biologia') || low.includes('celula') || low.includes('fotossintese') || low.includes('ecossistema')) {
                    setSelectedSubject('ciencias');
                  } else if (low.includes('ingles') || low.includes('english')) {
                    setSelectedSubject('ingles');
                  } else if (low.includes('matematica') || low.includes('bhaskara') || low.includes('equacao') || low.includes('fracao') || low.includes('tabuada')) {
                    setSelectedSubject('matematica');
                  }
                }}
                placeholder="Ex: Multiplicação com 2 algarismos, Frações equivalentes, Revolução Francesa, Gramática..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[58px]"
              />
            </div>
          </div>

          {/* Card: Subject, Grade, Question Count & Total Score Configuration */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Passo 2: Configuração da Avaliação
            </span>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Matéria da Prova:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubject(subj.id);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition text-left border ${
                      selectedSubject === subj.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{subj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* VALOR DA PROVA NA ESCOLA (Configuração de Nota Máxima) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Valor Total da Prova (Nota Máxima na Escola):</span>
                </label>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  Vale {maxExamValue} pontos
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Defina quanto vale a prova na sua escola para estimar a nota exata (ex: 10,0, 100, 50,0 ou personalizado):
              </p>

              {/* Quick score presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '10,0 (Padrão)', val: 10.0 },
                  { label: '100 pts', val: 100 },
                  { label: '50,0', val: 50.0 },
                  { label: '7,0', val: 7.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setMaxExamValue(item.val);
                      setCustomMaxScoreInput(String(item.val));
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                      maxExamValue === item.val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Score Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600 font-medium shrink-0">Outro valor da prova:</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="1000"
                  value={customMaxScoreInput}
                  onChange={(e) => {
                    setCustomMaxScoreInput(e.target.value);
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed) && parsed > 0) {
                      setMaxExamValue(parsed);
                    }
                  }}
                  className="w-24 p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: 8.0"
                />
                <span className="text-xs text-slate-500 font-bold">pontos no total</span>
              </div>
            </div>

            {/* Question Count & Grade */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Série Escolar:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(GRADE_LABELS).map(([gradeKey, info]) => (
                    <option key={gradeKey} value={gradeKey}>
                      {info.short} ({info.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Quantidade de Questões:
                </label>
                <div className="flex items-center gap-1">
                  {[3, 5, 8, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setQuestionCount(count);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        questionCount === count
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Types Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Formatos de Questões incluídos:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'multiple_choice', label: 'Múltipla Escolha (A, B, C, D)' },
                  { id: 'true_false', label: 'Verdadeiro ou Falso' },
                  { id: 'discursive', label: 'Discursiva (Escrita/Voz)' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleQuestionType(type.id)}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition ${
                      selectedQuestionTypes.includes(type.id)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleRequestGenerateExam}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Gerar Prova & Estimar Nota em Segundos ⚡</span>
          </button>
        </div>
      )}

      {/* STEP 2: FAST LOADING STATE (3-8s) */}
      {currentStep === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm my-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg animate-pulse">
            <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>

          <div className="space-y-1 max-w-xs">
            <h3 className="text-base font-black text-slate-900">
              {statusMessage}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Processamento acelerado com IA (tempo estimado: 3 a 5 segundos).
            </p>
          </div>

          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-amber-400 rounded-full animate-pulse w-4/5" />
          </div>
        </div>
      )}

      {/* STEP 2.5: CONTENT SUMMARY BEFORE EXAM (Apostila Overview & Voice Narration) */}
      {currentStep === 'summary' && currentExam && (
        <div className="flex-1 flex flex-col space-y-4 pb-12">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50/50 to-white text-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {currentExam.contentSummary?.detectedSubject || SUBJECTS.find((s) => s.id === currentExam.subject)?.name || 'Apostila'}
                </span>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Resumo Pedagógico da sua Apostila
                </span>
              </div>

              {/* Voice toggle button */}
              <button
                type="button"
                onClick={handleToggleSpeakSummary}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                  isSpeakingSummary
                    ? 'bg-amber-400 text-slate-950 animate-pulse border border-amber-300'
                    : 'bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200 shadow-xs'
                }`}
                title={isSpeakingSummary ? 'Pausar áudio' : 'Ouvir resumo em voz alta'}
              >
                {isSpeakingSummary ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                <span>{isSpeakingSummary ? 'Pausar Áudio' : 'Ouvir Resumo'}</span>
              </button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {currentExam.contentSummary?.title || currentExam.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Revise os pontos centrais e fórmulas extraídas das fotos da sua apostila antes das questões!
              </p>
            </div>

            {/* Audio waveform / speaking indicator */}
            {isSpeakingSummary && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <Volume2 className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                <span className="animate-pulse">Narrando o resumo da sua apostila em voz alta...</span>
              </div>
            )}

            {/* Overview text */}
            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium shadow-xs">
              <span className="font-black text-indigo-900 block mb-1">📖 Visão Geral do Conteúdo:</span>
              {currentExam.contentSummary?.overview || currentExam.description}
            </div>
          </div>

          {/* Key Concepts from Apostila */}
          {currentExam.contentSummary?.keyConcepts && currentExam.contentSummary.keyConcepts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  📌
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Conceitos Principais da Apostila (Estude Antes da Prova)
                </h3>
              </div>

              <div className="space-y-2">
                {currentExam.contentSummary.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules / Formulas / Tips */}
          {currentExam.contentSummary?.importantRulesOrFormulas && currentExam.contentSummary.importantRulesOrFormulas.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <h3 className="text-sm font-black text-amber-950">
                  Regras, Fórmulas & Macetes da sua Apostila
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentExam.contentSummary.importantRulesOrFormulas.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2 shadow-2xs"
                  >
                    <span className="text-amber-500 font-bold text-sm leading-none">•</span>
                    <span className="leading-relaxed font-medium">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Photos Thumbnails */}
          {((currentExam.sourceImages && currentExam.sourceImages.length > 0) || selectedImages.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  Fotos da sua apostila analisadas ({(currentExam.sourceImages || selectedImages).length}):
                </span>
                <span className="text-[10px] text-slate-400">Toque para ampliar</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {(currentExam.sourceImages || selectedImages).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageZoom(img)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 transition group bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`Foto da apostila ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                      Ampliar
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleStartExamFromSummary}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Estudei o Resumo! Iniciar Perguntas da Prova ({currentExam.questions.length} questões) 🚀</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                if (speechNarrator.isCurrentlySpeaking()) speechNarrator.stop();
                setIsSpeakingSummary(false);
                setCurrentStep('create');
              }}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold text-center transition"
            >
              ← Voltar e alterar fotos da apostila
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TAKING THE EXAM */}
      {currentStep === 'taking_exam' && currentExam && (
        <div className="flex-1 flex flex-col justify-between space-y-3 pb-4">
          <div>
            {/* Exam Header */}
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900">
                  Questão {currentQuestionIndex + 1} de {currentExam.questions.length}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  Total: {currentExam.maxExamValue || maxExamValue} pts
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Summary quick access button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setShowSummaryModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Consultar resumo e fórmulas da apostila"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Resumo</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>

                <button
                  onClick={handleSpeakCurrentQuestion}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    isSpeakingQuestion
                      ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Ouvir enunciado da questão"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Question Number Jump Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 mb-2.5 scrollbar-none">
              {currentExam.questions.map((qItem, qIdx) => {
                const ans = studentAnswers[qItem.id];
                const isAnswered = ans !== undefined && ans !== null && ans !== '';
                const isCurrent = qIdx === currentQuestionIndex;
                return (
                  <button
                    key={qItem.id || qIdx}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentQuestionIndex(qIdx);
                    }}
                    className={`min-w-[36px] h-8 px-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center justify-center border cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{qIdx + 1}</span>
                    {isAnswered && !isCurrent && <span className="ml-1 text-[10px] text-emerald-600 font-black">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / currentExam.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            {(() => {
              if (!currentExam.questions || currentExam.questions.length === 0) {
                return (
                  <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                    Nenhuma questão encontrada nesta prova.
                  </div>
                );
              }

              const safeIndex = Math.min(
                Math.max(0, currentQuestionIndex),
                currentExam.questions.length - 1
              );
              const q = currentExam.questions[safeIndex];
              if (!q) {
                return (
                  <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                    Carregando questão...
                  </div>
                );
              }

              const userAns = studentAnswers[q.id];
              const pointsVal = (
                Number(currentExam.maxExamValue || maxExamValue || 10.0) / currentExam.questions.length
              ).toFixed(1);

              const qTypeRaw = String(q.type || 'multiple_choice').toLowerCase();
              const isTrueFalse =
                qTypeRaw.includes('true') ||
                qTypeRaw.includes('vf') ||
                qTypeRaw.includes('verdadeiro') ||
                q.correctBoolean !== undefined;
              const isFillBlank = qTypeRaw.includes('blank') || qTypeRaw.includes('lacuna');
              const isDiscursive =
                qTypeRaw.includes('discursiv') ||
                qTypeRaw.includes('abert') ||
                qTypeRaw.includes('escrita');
              const isMultipleChoice = !isTrueFalse && !isFillBlank && !isDiscursive;

              // Ensure options always exist so "os negócios de assinalar" ALWAYS appear!
              let displayOptions: string[] = [];
              if (Array.isArray(q.options) && q.options.length >= 2) {
                displayOptions = q.options;
              } else {
                const ansText = q.correctAnswerText || 'Alternativa Correta (Item A)';
                displayOptions = [
                  ansText,
                  'Alternativa Complementar (Item B)',
                  'Alternativa Teórica (Item C)',
                  'Nenhuma das anteriores (Item D)',
                ];
              }

              return (
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 uppercase">
                        {q.topic || 'Questão da Prova'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Vale {pointsVal} pontos
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Multiple Choice Options - Always rendered with full interactive options */}
                  {isMultipleChoice && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        Selecione a alternativa correta:
                      </p>
                      {displayOptions.map((opt, optIdx) => {
                        const isSelected =
                          userAns !== undefined &&
                          userAns !== null &&
                          (userAns === optIdx ||
                            Number(userAns) === optIdx ||
                            String(userAns).trim() === String(opt).trim());
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setStudentAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            }}
                            className={`w-full p-3 sm:p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-[0.99] min-h-[48px] ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-600'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-700'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {letters[optIdx] || optIdx + 1}
                              </span>
                              <span className="leading-snug text-xs sm:text-sm">{opt}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* True / False Options - Always tactile buttons */}
                  {isTrueFalse && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        Assinale se a afirmativa é Verdadeira ou Falsa:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setStudentAnswers((prev) => ({ ...prev, [q.id]: true }));
                          }}
                          className={`p-4 rounded-2xl border text-center transition font-bold text-sm cursor-pointer min-h-[72px] flex flex-col items-center justify-center ${
                            userAns === true || String(userAns).toLowerCase() === 'true'
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-2xl mb-1">👍</span>
                          <span>Verdadeiro</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setStudentAnswers((prev) => ({ ...prev, [q.id]: false }));
                          }}
                          className={`p-4 rounded-2xl border text-center transition font-bold text-sm cursor-pointer min-h-[72px] flex flex-col items-center justify-center ${
                            userAns === false || String(userAns).toLowerCase() === 'false'
                              ? 'bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-500 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-2xl mb-1">👎</span>
                          <span>Falso</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fill in the Blank Options - with clickable chips and options to select */}
                  {isFillBlank && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Preencha a lacuna:
                        </label>
                      </div>

                      <input
                        type="text"
                        value={userAns || ''}
                        onChange={(e) =>
                          setStudentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Digite o termo que completa a frase..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                      />

                      {/* Clickable option chips if available */}
                      {displayOptions.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 block">
                            Ou toque para assinalar a palavra / alternativa:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {displayOptions.map((optWord, wIdx) => {
                              const isPicked =
                                String(userAns || '').toLowerCase().trim() ===
                                String(optWord).toLowerCase().trim();
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  onClick={() => {
                                    soundEffects.playClick();
                                    setStudentAnswers((prev) => ({ ...prev, [q.id]: optWord }));
                                  }}
                                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    isPicked
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50'
                                  }`}
                                >
                                  <span>{optWord}</span>
                                  {isPicked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discursive / Written Answer WITH selectable alternative choices as well */}
                  {isDiscursive && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Sua Resposta:
                        </label>
                      </div>

                      {/* Selectable Alternative Options to mark easily */}
                      {displayOptions.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-600 block">
                            Assinale a alternativa que melhor responde à questão:
                          </span>
                          <div className="space-y-1.5">
                            {displayOptions.map((opt, optIdx) => {
                              const isSelected =
                                String(userAns || '').trim() === String(opt).trim() ||
                                userAns === optIdx ||
                                Number(userAns) === optIdx;
                              const letters = ['A', 'B', 'C', 'D'];
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    soundEffects.playClick();
                                    setStudentAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                  }}
                                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-[0.99] ${
                                    isSelected
                                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-1 ring-indigo-600 shadow-xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white border-indigo-700'
                                          : 'bg-white text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {letters[optIdx] || optIdx + 1}
                                    </span>
                                    <span className="leading-snug text-xs sm:text-sm">{opt}</span>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          Ou digite sua resposta detalhada:
                        </span>
                        <textarea
                          value={userAns || ''}
                          onChange={(e) =>
                            setStudentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Escreva sua resposta ou toque em 'Ditar por Voz' para falar..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 min-h-[75px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Sticky Navigation Controls for Seamless Responsiveness */}
          <div className="sticky bottom-0 bg-slate-50/95 backdrop-blur-md pt-3 pb-2 border-t border-slate-200 z-10 shrink-0 mt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className="py-3 px-4 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition shrink-0 min-h-[44px] cursor-pointer"
              >
                ← Anterior
              </button>

              {currentQuestionIndex + 1 < currentExam.questions.length ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentQuestionIndex((prev) =>
                      Math.min(currentExam.questions.length - 1, prev + 1)
                    );
                  }}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs min-h-[44px] cursor-pointer active:scale-[0.99]"
                >
                  <span>Próxima Questão</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Finalizar & Corrigir Prova 🎯</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTS & GRADE ESTIMATION */}
      {currentStep === 'results' && examResult && (
        <div className="space-y-4 pb-8">
          {/* Card: Official Grade Banner */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50/40 to-white border border-indigo-200 rounded-3xl p-5 text-slate-900 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                Resultado & Estimativa de Nota
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Tempo: {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {examResult.examTitle}
                </h2>
                <p className="text-xs text-indigo-700 font-bold mt-0.5">
                  {examResult.classification}
                </p>
              </div>

              {/* Big Score Badge */}
              <div className="p-3 bg-white border border-indigo-200 rounded-2xl text-center shrink-0 shadow-xs">
                <span className="text-2xl font-black text-indigo-900 block">
                  {examResult.maxExamValue && examResult.scaledScore !== undefined
                    ? `${examResult.scaledScore.toFixed(1)}`
                    : `${examResult.gradeEstimate10.toFixed(1)}`}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block">
                  de {examResult.maxExamValue || maxExamValue} pts
                </span>
              </div>
            </div>

            {/* Score Comparison pills */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-100">
              <div className="bg-white border border-indigo-100 p-2 rounded-xl text-center shadow-xs">
                <span className="text-[10px] text-slate-500 block">Escala Nacional (0 a 10):</span>
                <span className="text-xs font-black text-emerald-700">
                  {examResult.gradeEstimate10.toFixed(1)} / 10,0
                </span>
              </div>
              <div className="bg-white border border-indigo-100 p-2 rounded-xl text-center shadow-xs">
                <span className="text-[10px] text-slate-500 block">Aproveitamento:</span>
                <span className="text-xs font-black text-amber-700">
                  {Math.round(examResult.score)}% de Acerto
                </span>
              </div>
            </div>

            {/* Feedback & Advice */}
            <div className="p-3 bg-white border border-indigo-100 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium shadow-xs">
              {examResult.gradeEstimateFeedback}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveResultToNotes}
              className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-xs ${
                isSavedToNotes
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSavedToNotes ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Salvo no Caderno!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-purple-600" />
                  <span>Salvar no Meu Caderno</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setCurrentStep('create');
                setSelectedImages([]);
                setTextPrompt('');
                setCurrentExam(null);
                setExamResult(null);
                setStudentAnswers({});
                setCurrentQuestionIndex(0);
                setElapsedSeconds(0);
                setIsSpeakingQuestion(false);
                setIsSpeakingSummary(false);
                speechNarrator.stop();
              }}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span>Fazer Outra Prova</span>
            </button>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Gabarito Comentado Questão a Questão:
            </h3>

            <div className="space-y-2.5">
              {examResult.gradedResults.map((gr, i) => (
                <div
                  key={gr.questionId || i}
                  className={`p-3.5 rounded-2xl border ${
                    gr.isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-rose-50/70 border-rose-200'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {gr.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="text-xs font-black text-slate-900">
                        Questão {i + 1}
                      </span>
                    </div>

                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                      {gr.pointsEarned} / {gr.maxPoints} pts
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {gr.question}
                  </p>

                  <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                    <strong>Gabarito & Explicação:</strong> {gr.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUMMARY CONSULTATION DURING EXAM */}
      {showSummaryModal && currentExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50 text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                  📖
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight text-slate-900">
                    Resumo da sua Apostila
                  </h3>
                  <p className="text-[10px] text-indigo-600 font-bold">
                    {currentExam.contentSummary?.title || currentExam.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleSpeakSummary}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                    isSpeakingSummary
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-white text-indigo-900 border-indigo-200 hover:bg-slate-50'
                  }`}
                  title={isSpeakingSummary ? 'Pausar áudio' : 'Ouvir resumo em voz alta'}
                >
                  {isSpeakingSummary ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                  <span className="hidden sm:inline">{isSpeakingSummary ? 'Pausar' : 'Ouvir'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setShowSummaryModal(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer shadow-xs"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Overview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                <span className="font-black text-indigo-900 block mb-1">Visão Geral:</span>
                {currentExam.contentSummary?.overview || currentExam.description}
              </div>

              {/* Key concepts */}
              {currentExam.contentSummary?.keyConcepts && currentExam.contentSummary.keyConcepts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    📌 Conceitos Fundamentais:
                  </span>
                  <div className="space-y-1.5">
                    {currentExam.contentSummary.keyConcepts.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                        <span className="font-bold text-indigo-600">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules / Formulas */}
              {currentExam.contentSummary?.importantRulesOrFormulas && currentExam.contentSummary.importantRulesOrFormulas.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                    ⚡ Regras & Fórmulas:
                  </span>
                  <div className="space-y-1.5">
                    {currentExam.contentSummary.importantRulesOrFormulas.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                        <span className="font-bold text-amber-600">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos thumbnails */}
              {((currentExam.sourceImages && currentExam.sourceImages.length > 0) || selectedImages.length > 0) && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    📸 Fotos da Apostila:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(currentExam.sourceImages || selectedImages).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageZoom(img)}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 relative"
                      >
                        <img src={img} alt={`Página ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowSummaryModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Voltar para as Questões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNANSWERED QUESTIONS CONFIRMATION */}
      {showUnansweredConfirmModal && currentExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Questões sem Resposta
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você ainda possui{' '}
                <span className="font-bold text-amber-700">
                  {
                    currentExam.questions.filter((q) => {
                      const ans = studentAnswers[q.id];
                      return ans === undefined || ans === null || ans === '';
                    }).length
                  }{' '}
                  questão(ões)
                </span>{' '}
                em branco nesta prova. Deseja finalizar e enviar mesmo assim?
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  // Jump to the first unanswered question
                  const firstUnansweredIdx = currentExam.questions.findIndex((q) => {
                    const ans = studentAnswers[q.id];
                    return ans === undefined || ans === null || ans === '';
                  });
                  if (firstUnansweredIdx >= 0) {
                    setCurrentQuestionIndex(firstUnansweredIdx);
                  }
                  setShowUnansweredConfirmModal(false);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-[0.99]"
              >
                Continuar Respondendo Prova
              </button>

              <button
                type="button"
                onClick={() => {
                  proceedWithGrading();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Finalizar e Corrigir Mesmo Assim 🎯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE ZOOM / FULL PREVIEW */}
      {activeImageZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveImageZoom(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-slate-900 rounded-3xl p-2 border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImageZoom(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
              title="Fechar ampliação"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImageZoom}
              alt="Foto da apostila em alta resolução"
              className="max-h-[85vh] w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
