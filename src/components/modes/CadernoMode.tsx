import React, { useState, useEffect, useRef } from 'react';
import { CadernoTopic, CADERNO_SUBJECTS_INFO, CADERNO_TOPICS } from '../../data/cadernoData';
import { SubjectId, Question, UserProfile } from '../../types';
import { shuffleQuestionsList, GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { answeredQuestionsService, AnsweredQuestionRecord } from '../../services/answeredQuestionsService';
import { SubjectIcon } from '../SubjectIcon';
import { AIResearcherMode } from './AIResearcherMode';
import { AIExplainerMode } from './AIExplainerMode';
import { PhotoExamCreatorMode } from './PhotoExamCreatorMode';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Trophy,
  Award,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  CheckSquare,
  Search,
  Camera,
  Upload,
  FileText,
  Star,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Filter,
  Calendar,
  Layers,
  Flame,
} from 'lucide-react';

export type CadernoSectionTab =
  | 'answered_questions'
  | 'summaries'
  | 'grade_photo'
  | 'researcher'
  | 'explainer'
  | 'exam_creator';

interface NotebookEvaluation {
  id: string;
  grade: number;
  title: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  xpAwarded: number;
  evaluatedAt: string;
  subjectName: string;
  imagePreview?: string;
}

interface CadernoModeProps {
  user?: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, isMajor?: boolean, correctCount?: number) => void;
  onOpenChessBoard?: () => void;
}

const EVALUATION_HISTORY_KEY = 'trilha_caderno_evaluations_history_v1';

export const CadernoMode: React.FC<CadernoModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  onOpenChessBoard,
}) => {
  const [activeTab, setActiveTab] = useState<CadernoSectionTab>('answered_questions');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('matematica');
  const [activeTopic, setActiveTopic] = useState<CadernoTopic>(() => {
    return CADERNO_TOPICS.find((t) => t.subjectId === 'matematica') || CADERNO_TOPICS[0];
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Answered questions state
  const [answeredList, setAnsweredList] = useState<AnsweredQuestionRecord[]>(() =>
    answeredQuestionsService.getRecords()
  );
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [answeredSearch, setAnsweredSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Redo question state
  const [redoQuestionRecord, setRedoQuestionRecord] = useState<AnsweredQuestionRecord | null>(null);
  const [redoSelectedOption, setRedoSelectedOption] = useState<number | null>(null);
  const [isRedoSubmitted, setIsRedoSubmitted] = useState<boolean>(false);

  // Generated AI Summary state for answered questions
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // Grade photo state
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoSubject, setPhotoSubject] = useState<SubjectId>('matematica');
  const [isEvaluatingPhoto, setIsEvaluatingPhoto] = useState(false);
  const [photoEvaluationError, setPhotoEvaluationError] = useState<string | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<NotebookEvaluation | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<NotebookEvaluation[]>(() => {
    try {
      const stored = localStorage.getItem(EVALUATION_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 10 Questions Quiz State inside Summaries
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Refresh answered questions when switching to that tab
  useEffect(() => {
    if (activeTab === 'answered_questions') {
      setAnsweredList(answeredQuestionsService.getRecords());
    }
  }, [activeTab]);

  // Filter topics for summaries
  const topicsForSubject = CADERNO_TOPICS.filter((t) => {
    const matchesSubject = t.subjectId === selectedSubjectId;
    if (!searchQuery) return matchesSubject;
    const q = searchQuery.toLowerCase();
    return (
      (matchesSubject || !selectedSubjectId) &&
      (t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.detailedTheory.some((line) => line.toLowerCase().includes(q)))
    );
  });

  const selectedSubject =
    CADERNO_SUBJECTS_INFO.find((s) => s.id === selectedSubjectId) || CADERNO_SUBJECTS_INFO[0];

  const [quizQuestions, setQuizQuestions] = useState<Question[]>(() =>
    shuffleQuestionsList(activeTopic.practiceQuestions || [])
  );

  useEffect(() => {
    setQuizQuestions(shuffleQuestionsList(activeTopic.practiceQuestions || []));
  }, [activeTopic.id]);

  const currentQuestions = quizQuestions.length > 0 ? quizQuestions : activeTopic.practiceQuestions || [];
  const currentQ: Question | undefined = currentQuestions[currentQuestionIndex];

  const handleSelectSubject = (id: SubjectId) => {
    soundEffects.playClick();
    setSelectedSubjectId(id);
    const found = CADERNO_TOPICS.find((t) => t.subjectId === id);
    if (found) {
      setActiveTopic(found);
      setQuizQuestions(shuffleQuestionsList(found.practiceQuestions || []));
    }
  };

  const handleStart10Questions = () => {
    soundEffects.playClick();
    setQuizQuestions(shuffleQuestionsList(activeTopic.practiceQuestions || []));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
    setIsQuizActive(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrect('standard');
      setScore((prev) => prev + 1);
      onEarnPoints(10, false, 1);
    } else {
      soundEffects.playError();
    }

    try {
      const rec = answeredQuestionsService.recordAnswer({
        question: currentQ,
        selectedOptionIndex: selectedOption,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject.name,
        topicTitle: activeTopic.title,
        grade: user?.grade,
        sourceMode: 'caderno',
      });
      setAnsweredList((prev) => [rec, ...prev]);
    } catch {}
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeaking(false);

    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      soundEffects.playLevelUp();
      setIsQuizCompleted(true);
      onEarnPoints(score >= 7 ? 50 : 25, true, 0);
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      speechNarrator.speakQuestion({
        questionIndex: currentQuestionIndex,
        questionText: currentQ.question,
        options: currentQ.options || [],
        force: true,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const handleToggleSpeakSummary = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      const textToSpeak = `Resumo de ${selectedSubject.name}, tópico ${activeTopic.title}. ${activeTopic.summary}. Conceitos essenciais: ${activeTopic.detailedTheory.join('. ')}.`;
      speechNarrator.speak(
        textToSpeak,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Answered questions filters and statistics
  const filteredAnswered = answeredList.filter((item) => {
    const matchesSubject = filterSubject === 'all' || item.subjectId === filterSubject;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'correct' && item.isCorrect) ||
      (filterStatus === 'incorrect' && !item.isCorrect);
    const matchesSearch =
      !answeredSearch ||
      item.questionText.toLowerCase().includes(answeredSearch.toLowerCase()) ||
      item.topicTitle.toLowerCase().includes(answeredSearch.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(answeredSearch.toLowerCase());
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const totalAnsweredCount = answeredList.length;
  const correctCount = answeredList.filter((i) => i.isCorrect).length;
  const incorrectCount = totalAnsweredCount - correctCount;
  const accuracyPercent =
    totalAnsweredCount > 0 ? Math.round((correctCount / totalAnsweredCount) * 100) : 0;

  // Redo single question handler
  const handleStartRedo = (item: AnsweredQuestionRecord) => {
    soundEffects.playClick();
    setRedoQuestionRecord(item);
    setRedoSelectedOption(null);
    setIsRedoSubmitted(false);
  };

  const handleSubmitRedo = () => {
    if (!redoQuestionRecord || redoSelectedOption === null || isRedoSubmitted) return;
    setIsRedoSubmitted(true);
    const isCorrect = redoSelectedOption === redoQuestionRecord.correctOptionIndex;
    if (isCorrect) {
      soundEffects.playCorrect('standard');
      onEarnPoints(15, false, 1);
    } else {
      soundEffects.playError();
    }

    try {
      const updated = answeredQuestionsService.recordAnswer({
        question: {
          question: redoQuestionRecord.questionText,
          options: redoQuestionRecord.options,
          correctIndex: redoQuestionRecord.correctOptionIndex,
          explanation: redoQuestionRecord.explanation,
        },
        selectedOptionIndex: redoSelectedOption,
        subjectId: redoQuestionRecord.subjectId,
        subjectName: redoQuestionRecord.subjectName,
        topicTitle: redoQuestionRecord.topicTitle,
        grade: user?.grade,
        sourceMode: 'caderno_refazer',
      });
      setAnsweredList((prev) => [updated, ...prev]);
    } catch {}
  };

  // AI Summary Generator from answered questions
  const handleGenerateAiSummary = async () => {
    soundEffects.playClick();
    setIsGeneratingSummary(true);
    setGeneratedSummary(null);

    const questionsToSummarize = filteredAnswered.slice(0, 10);
    const summaryPrompt = questionsToSummarize
      .map(
        (q, idx) =>
          `Questão ${idx + 1} (${q.subjectName} - ${q.topicTitle}): "${q.questionText}" | Gabarito: ${
            q.options[q.correctOptionIndex]
          } | Explicação: ${q.explanation}`
      )
      .join('\n');

    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Gere um Resumo de Estudos Didático e Organizado do Caderno Escolar baseado nas seguintes questões respondidas pelo aluno:\n${summaryPrompt}`,
          grade: user?.grade || '6_fund',
          subject: filterSubject !== 'all' ? filterSubject : 'geral',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text =
          data?.result?.executiveSummary ||
          data?.result?.introduction ||
          data?.text ||
          'Resumo gerado com sucesso para fixação do conteúdo no caderno!';
        setGeneratedSummary(text);
        soundEffects.playSuccess();
      } else {
        // Fallback local pedagogical summary
        const topics = Array.from(new Set(questionsToSummarize.map((q) => q.topicTitle)));
        setGeneratedSummary(
          `Resumo de Revisão do Caderno:\nVocê praticou questões fundamentais sobre: ${topics.join(
            ', '
          )}.\nPontos-chave: Revise os conceitos errados, pratique a leitura atenta dos enunciados e destaque as fórmulas principais em seu caderno físico.`
        );
      }
    } catch {
      setGeneratedSummary(
        `Resumo do Caderno: Você praticou ${questionsToSummarize.length} questões escolares. Recomendamos refazer as questões incorretas e anotar as explicações no seu caderno físico.`
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Photo evaluation handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setPhotoEvaluationError('A imagem é muito grande. Escolha uma foto de até 8MB.');
      soundEffects.playError();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
      setPhotoEvaluationError(null);
      soundEffects.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleEvaluateNotebookPhoto = async () => {
    if (!photoBase64) {
      setPhotoEvaluationError('Selecione ou tire uma foto do caderno primeiro.');
      soundEffects.playError();
      return;
    }

    soundEffects.playClick();
    setIsEvaluatingPhoto(true);
    setPhotoEvaluationError(null);

    const subMeta = CADERNO_SUBJECTS_INFO.find((s) => s.id === photoSubject) || CADERNO_SUBJECTS_INFO[0];

    try {
      const res = await fetch('/api/ai/grade-notebook-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          subjectId: photoSubject,
          subjectName: subMeta.name,
          grade: user?.grade || '6_fund',
          studentName: user?.name || 'Estudante',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Falha ao avaliar a foto do caderno.');
      }

      const data = await res.json();
      const evalResult: NotebookEvaluation = {
        id: `eval_${Date.now()}`,
        grade: Number(data.grade || 8.5),
        title: data.title || 'Avaliação do Caderno',
        feedback: data.feedback || 'Caderno bem estruturado e legível.',
        strengths: Array.isArray(data.strengths) ? data.strengths : ['Anotações organizadas'],
        improvements: Array.isArray(data.improvements) ? data.improvements : ['Adicione marca-texto nos títulos'],
        xpAwarded: Number(data.xpAwarded || 100),
        evaluatedAt: data.evaluatedAt || new Date().toISOString(),
        subjectName: subMeta.name,
        imagePreview: photoBase64,
      };

      setCurrentEvaluation(evalResult);
      soundEffects.playLevelUp();
      onEarnPoints(evalResult.xpAwarded, true, 0);

      // Save to evaluation history
      const updatedHistory = [evalResult, ...evaluationHistory].slice(0, 20);
      setEvaluationHistory(updatedHistory);
      try {
        localStorage.setItem(EVALUATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch {}
    } catch (err: any) {
      setPhotoEvaluationError(err.message || 'Não foi possível analisar a foto. Tente novamente.');
      soundEffects.playError();
    } finally {
      setIsEvaluatingPhoto(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      soundEffects.playClick();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  // If inside sub-tools with their own full views
  if (activeTab === 'researcher') {
    return (
      <AIResearcherMode
        user={user || ({ name: 'Estudante', grade: '6_fund' } as any)}
        onBack={() => setActiveTab('answered_questions')}
        onEarnPoints={(pts) => onEarnPoints(pts, false, 1)}
      />
    );
  }

  if (activeTab === 'explainer') {
    return (
      <AIExplainerMode
        user={user || ({ name: 'Estudante', grade: '6_fund' } as any)}
        onBack={() => setActiveTab('answered_questions')}
        onEarnPoints={(pts) => onEarnPoints(pts, false, 1)}
      />
    );
  }

  if (activeTab === 'exam_creator') {
    return (
      <PhotoExamCreatorMode
        user={user || ({ name: 'Estudante', grade: '6_fund' } as any)}
        onBack={() => setActiveTab('answered_questions')}
        onEarnPoints={(pts, isMajor, count) => onEarnPoints(pts, isMajor, count)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 bg-slate-50 text-slate-900 max-w-4xl mx-auto w-full pb-28 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition cursor-pointer font-bold text-xs active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="text-center min-w-0">
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center gap-1.5 truncate">
            <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Caderno Escolar</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-semibold truncate">
            {GRADE_LABELS[user?.grade || '6_fund']?.full || 'Ensino Fundamental'} • BNCC
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* Caderno Navigation Tabs (Segmented Control - Zero Emojis) */}
      <div className="flex rounded-2xl bg-slate-200/80 p-1 mb-5 gap-1 overflow-x-auto scrollbar-none shadow-inner border border-slate-300/60">
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('answered_questions');
          }}
          className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'answered_questions'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Perguntas Respondidas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('summaries');
          }}
          className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'summaries'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="truncate">Resumos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('grade_photo');
          }}
          className={`flex-1 min-w-[125px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'grade_photo'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Avaliar Caderno</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('researcher');
          }}
          className="flex-1 min-w-[100px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-slate-600 hover:text-slate-900 hover:bg-white/50"
        >
          <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Pesquisador</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('explainer');
          }}
          className="flex-1 min-w-[100px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-slate-600 hover:text-slate-900 hover:bg-white/50"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Explicador</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('exam_creator');
          }}
          className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-slate-600 hover:text-slate-900 hover:bg-white/50"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="truncate">Criar Provas</span>
        </button>
      </div>

      {/* ===================== TAB 1: PERGUNTAS RESPONDIDAS ===================== */}
      {activeTab === 'answered_questions' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Stats Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider">
                  Histórico de Aprendizagem
                </span>
                <h2 className="text-base font-black text-slate-900">Perguntas Respondidas</h2>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingSummary || filteredAnswered.length === 0}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingSummary ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando Resumo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Resumo das Perguntas</span>
                  </>
                )}
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Total</span>
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {totalAnsweredCount}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 font-bold block">Acertos</span>
                <span className="text-sm sm:text-base font-black text-emerald-700">
                  {correctCount}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[10px] text-rose-700 font-bold block">Erros</span>
                <span className="text-sm sm:text-base font-black text-rose-700">
                  {incorrectCount}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <span className="text-[10px] text-indigo-700 font-bold block">Precisão</span>
                <span className="text-sm sm:text-base font-black text-indigo-700">
                  {accuracyPercent}%
                </span>
              </div>
            </div>

            {/* AI Generated Summary Box */}
            {generatedSummary && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Resumo Pedagógico do seu Caderno</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(generatedSummary, 'summary')}
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded-lg hover:bg-white transition cursor-pointer"
                    title="Copiar resumo"
                  >
                    {copiedId === 'summary' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {generatedSummary}
                </p>
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar nas perguntas e temas já respondidos..."
                  value={answeredSearch}
                  onChange={(e) => setAnsweredSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Todas as Matérias</option>
                {CADERNO_SUBJECTS_INFO.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Filtrar:
              </span>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({answeredList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('correct')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'correct'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Acertos ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('incorrect')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'incorrect'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Erros ({incorrectCount})
              </button>
            </div>
          </div>

          {/* List of Answered Questions */}
          {filteredAnswered.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">Nenhuma pergunta encontrada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {answeredList.length === 0
                  ? 'Você ainda não respondeu perguntas. Inicie uma lição na Jornada ou nos Resumos do Caderno para acumular seu histórico de estudo.'
                  : 'Nenhuma pergunta corresponde aos filtros selecionados. Tente limpar a busca ou mudar o filtro de matéria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnswered.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
                        <SubjectIcon subjectId={item.subjectId} className="w-3.5 h-3.5 text-indigo-700" />
                      </span>
                      <span className="text-xs font-black text-slate-800">{item.subjectName}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-semibold">{item.topicTitle}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.isCorrect ? (
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

                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        {new Date(item.answeredAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Enunciado da Pergunta */}
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-relaxed">
                    {item.questionText}
                  </p>

                  {/* Respostas e Gabarito */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        item.isCorrect
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">
                        Sua resposta selecionada
                      </span>
                      <span className="font-bold">
                        {item.options[item.selectedOptionIndex] || 'Opção selecionada'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                      <span className="text-[10px] font-black uppercase text-indigo-700 block mb-0.5">
                        Gabarito Correto Oficial
                      </span>
                      <span className="font-bold">
                        {item.options[item.correctOptionIndex] || 'Gabarito correto'}
                      </span>
                    </div>
                  </div>

                  {/* Explicação Didática */}
                  {item.explanation && (
                    <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-indigo-800 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>Explicação Didática do Caderno</span>
                      </span>
                      <p className="leading-relaxed">{item.explanation}</p>
                    </div>
                  )}

                  {/* Botão Refazer Questão */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.questionText, item.id)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Pergunta</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartRedo(item)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3 text-indigo-600" />
                      <span>Refazer Questão</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal / Dialog para Refazer a Questão */}
          {redoQuestionRecord && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      Refazer: {redoQuestionRecord.topicTitle}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRedoQuestionRecord(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-black text-slate-900 leading-relaxed">
                  {redoQuestionRecord.questionText}
                </p>

                <div className="space-y-2">
                  {redoQuestionRecord.options.map((opt, oIdx) => {
                    const isSelected = redoSelectedOption === oIdx;
                    const isCorrect = oIdx === redoQuestionRecord.correctOptionIndex;
                    let btnClass = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400';
                    if (isRedoSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                      } else {
                        btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          if (!isRedoSubmitted) {
                            soundEffects.playClick();
                            setRedoSelectedOption(oIdx);
                          }
                        }}
                        disabled={isRedoSubmitted}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {isRedoSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isRedoSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isRedoSubmitted && (
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-slate-800 space-y-1">
                    <span className="font-bold text-indigo-900 block">Explicação:</span>
                    <p>{redoQuestionRecord.explanation}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {!isRedoSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSubmitRedo}
                      disabled={redoSelectedOption === null}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      Confirmar Resposta
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRedoQuestionRecord(null)}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-sm"
                    >
                      Fechar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: RESUMOS DAS LIÇÕES ===================== */}
      {activeTab === 'summaries' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Subject Selector Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CADERNO_SUBJECTS_INFO.map((subj) => (
              <button
                key={subj.id}
                onClick={() => handleSelectSubject(subj.id)}
                className={`px-3 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  selectedSubjectId === subj.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SubjectIcon subjectId={subj.id} className={`w-3.5 h-3.5 ${selectedSubjectId === subj.id ? 'text-white' : 'text-indigo-600'}`} />
                <span>{subj.name}</span>
              </button>
            ))}
          </div>

          {/* Active Topic Summary Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                  {selectedSubject.name} • Teoria & Conceitos
                </span>
                <h2 className="text-base font-black text-slate-900">{activeTopic.title}</h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleSpeakSummary}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-400 border-amber-500 text-slate-900 animate-pulse'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                  title={isSpeaking ? 'Parar leitura por voz' : 'Ouvir resumo em voz alta'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-slate-900" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{isSpeaking ? 'Pausar' : 'Ouvir Resumo'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStart10Questions}
                  className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Praticar Questões</span>
                </button>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {activeTopic.summary}
            </p>

            {/* Detailed Theory Points */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">Conceitos Essenciais:</span>
              <ul className="space-y-1.5">
                {activeTopic.detailedTheory.map((point, pIdx) => (
                  <li key={pIdx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quiz Flow if active */}
          {isQuizActive && currentQ && (
            <div className="p-5 rounded-3xl bg-white border-2 border-indigo-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-800">
                  Questão {currentQuestionIndex + 1} de {currentQuestions.length}
                </span>

                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                  title="Ouvir pergunta"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <h3 className="text-sm font-black text-slate-900 leading-relaxed">
                {currentQ.question}
              </h3>

              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let btnClass = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      btnClass = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                    } else {
                      btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswerSubmitted && currentQ.explanation && (
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-indigo-900 block">Explicação:</span>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              <div className="pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-sm"
                  >
                    {currentQuestionIndex + 1 < currentQuestions.length
                      ? 'Próxima Questão'
                      : 'Finalizar Exercício'}
                  </button>
                )}
              </div>
            </div>
          )}

          {isQuizCompleted && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-base font-black text-slate-900">Exercício Concluído!</h3>
              <p className="text-xs text-slate-600">
                Você acertou {score} de {currentQuestions.length} questões do tópico.
              </p>
              <button
                type="button"
                onClick={() => setIsQuizActive(false)}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-black text-xs transition cursor-pointer"
              >
                Voltar aos Resumos
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: AVALIAR CADERNO (FOTO COM NOTA) ===================== */}
      {activeTab === 'grade_photo' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Card de Envio da Foto */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Correção Pedagógica com IA
              </span>
              <h2 className="text-base font-black text-slate-900">
                Tirar Foto do Caderno & Dar uma Nota
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie uma foto da folha do seu caderno. A IA analisa caligrafia, organização, clareza das anotações e atribui uma nota de 0 a 10 com dicas para aprimorar.
              </p>
            </div>

            {/* Subject Selector for Notebook Evaluation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disciplina do Caderno:
              </label>
              <select
                value={photoSubject}
                onChange={(e) => setPhotoSubject(e.target.value as SubjectId)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                {CADERNO_SUBJECTS_INFO.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Capture / Upload Box */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
                id="notebook-camera-input"
              />

              {photoBase64 ? (
                <div className="space-y-2">
                  <div className="relative w-full max-h-72 rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-sm bg-slate-900 flex items-center justify-center">
                    <img
                      src={photoBase64}
                      alt="Foto do caderno"
                      className="max-h-72 w-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="notebook-camera-input"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                      <span>Tirar Outra Foto</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleEvaluateNotebookPhoto}
                      disabled={isEvaluatingPhoto}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer transition disabled:opacity-50"
                    >
                      {isEvaluatingPhoto ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Avaliando Caderno com IA...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Avaliar & Dar Nota</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 text-center space-y-3 transition">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-800">
                      Tirar foto da página do seu caderno
                    </h3>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                      Foque na folha com boa iluminação para que a caligrafia e as anotações fiquem nítidas.
                    </p>
                  </div>

                  <label
                    htmlFor="notebook-camera-input"
                    className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Abrir Câmera ou Galeria</span>
                  </label>
                </div>
              )}

              {photoEvaluationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{photoEvaluationError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resultado da Avaliação Atual com Nota de 0 a 10 */}
          {currentEvaluation && (
            <div className="p-5 rounded-3xl bg-white border-2 border-emerald-300 shadow-lg space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-lg font-black leading-none">
                      {currentEvaluation.grade.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-100">de 10.0</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 block">
                      Nota do Caderno • {currentEvaluation.subjectName}
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      {currentEvaluation.title}
                    </h3>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black">
                  +{currentEvaluation.xpAwarded} XP
                </div>
              </div>

              {/* Parecer Pedagógico */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Parecer do Professor:</span>
                </span>
                <p className="leading-relaxed">{currentEvaluation.feedback}</p>
              </div>

              {/* Pontos Fortes e Dicas de Melhoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pontos Fortes:</span>
                  </span>
                  <ul className="space-y-1">
                    {currentEvaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1.5">
                  <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Dicas para a Próxima Aula:</span>
                  </span>
                  <ul className="space-y-1">
                    {currentEvaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Avaliações Anteriores */}
          {evaluationHistory.length > 0 && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Histórico de Notas do Caderno</span>
              </h3>

              <div className="space-y-2">
                {evaluationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                        {item.grade.toFixed(1)}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 block truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.subjectName} • {new Date(item.evaluatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentEvaluation(item)}
                      className="py-1 px-2.5 rounded-lg bg-white border border-slate-200 text-indigo-700 font-bold text-[11px] hover:bg-slate-100 transition cursor-pointer"
                    >
                      Ver Parecer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
