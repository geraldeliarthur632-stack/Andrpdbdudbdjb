import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UserProfile, SubjectId, Question, DifficultyLevel, GradeLevel } from '../../types';
import { GRADE_LABELS, SUBJECTS, getSubjectsForGrade, getQuestionsForMatch } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { mistakesTrackerService } from '../../services/mistakesTrackerService';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  Zap,
  Clock,
  Trophy,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Award,
  AlertCircle,
  BarChart2,
  BookOpen,
  GraduationCap,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface LightningChallengeModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, isMajorChallenge?: boolean, questionsCount?: number) => void;
  initialSubject?: SubjectId;
}

interface HighScoreRecord {
  subjectId: string;
  subjectName: string;
  correctCount: number;
  totalAnswered: number;
  maxStreak: number;
  xpEarned: number;
  duration: number;
  grade: string;
  date: string;
}

const STORAGE_KEY = 'estudahud_lightning_records_v2';

function getStoredRecords(): Record<string, HighScoreRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecord(record: HighScoreRecord) {
  try {
    const records = getStoredRecords();
    const key = `${record.subjectId}_${record.duration}`;
    const existing = records[key];
    if (!existing || record.correctCount > existing.correctCount) {
      records[key] = record;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true; // novo recorde!
    }
  } catch {}
  return false;
}

export const LightningChallengeMode: React.FC<LightningChallengeModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  initialSubject,
}) => {
  // Selected Grade Level (defaults to user's school grade)
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(user.grade || '6_fund');

  // Available subjects for the selected grade
  const availableSubjects = useMemo(() => {
    return getSubjectsForGrade(selectedGrade);
  }, [selectedGrade]);

  // Selected subject or 'all' (Tudo da Série)
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | 'all'>(() => {
    if (initialSubject && availableSubjects.some((s) => s.id === initialSubject)) {
      return initialSubject;
    }
    return 'all'; // Default: Tudo da Série (Mix Geral)
  });

  // Selected Duration in seconds (30s, 60s, 90s, 120s)
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  // Selected Difficulty
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Audio / Voice Settings
  const [autoNarrate, setAutoNarrate] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState<boolean>(false);

  // Selected subject info
  const selectedSubject = useMemo(() => {
    if (selectedSubjectId === 'all') {
      return {
        id: 'all',
        name: 'Tudo da Série (Mix Geral)',
        icon: '🎒',
        description: `Todas as matérias de ${GRADE_LABELS[selectedGrade]?.short || 'sua série'}`,
      };
    }
    return (
      availableSubjects.find((s) => s.id === selectedSubjectId) || {
        id: selectedSubjectId,
        name: 'Geral',
        icon: '📚',
        description: '',
      }
    );
  }, [availableSubjects, selectedSubjectId, selectedGrade]);

  // Game Phases: 'setup' | 'countdown' | 'playing' | 'results'
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'playing' | 'results'>('setup');
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Timer & Gameplay States
  const [timeLeft, setTimeLeft] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Player Performance Stats
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [copiedErrorSummary, setCopiedErrorSummary] = useState(false);

  // Review List of Missed Questions
  const [missedQuestions, setMissedQuestions] = useState<
    Array<{
      question: Question;
      chosenIndex: number | null;
      wasSkipped?: boolean;
    }>
  >([]);

  // High Scores in memory
  const [records, setRecords] = useState<Record<string, HighScoreRecord>>(() => getStoredRecords());

  // Timer refs
  const timerIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Load questions for selected subject & grade
  const loadQuestions = useCallback(
    (subjId: SubjectId | 'all', grade: GradeLevel, diff: 'all' | 'easy' | 'medium' | 'hard') => {
      const difficultyParam = diff === 'all' ? undefined : diff;
      const fetched = getQuestionsForMatch(grade, 60, difficultyParam, subjId);
      setQuestions(fetched);
      setCurrentIndex(0);
    },
    []
  );

  // Clean up speech & timers on unmount
  useEffect(() => {
    return () => {
      speechNarrator.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Handle 3, 2, 1 Countdown
  useEffect(() => {
    if (phase === 'countdown') {
      speechNarrator.stop();
      setCountdownNumber(3);
      soundEffects.playClick();

      let count = 3;
      countdownIntervalRef.current = window.setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownNumber(count);
          soundEffects.playClick();
        } else if (count === 0) {
          setCountdownNumber(0);
          soundEffects.playGameStart();
        } else {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setPhase('playing');
          setTimeLeft(selectedDuration);
        }
      }, 700);

      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [phase, selectedDuration]);

  // Handle Countdown Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // TIME IS UP!
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            handleTimeIsUp();
            return 0;
          }

          // Sound cues in last 10 seconds: distinct high-urgency sound for the final 5 seconds!
          if (prev <= 5 && prev >= 1) {
            soundEffects.playLightningLast5Seconds(prev);
          } else if (prev <= 10 && prev > 5) {
            soundEffects.playCountdownTick();
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [phase]);

  // Read question if autoNarrate is enabled
  useEffect(() => {
    if (phase === 'playing' && autoNarrate && questions[currentIndex]) {
      const q = questions[currentIndex];
      speechNarrator.speakQuestion({
        questionIndex: currentIndex,
        questionText: q.question,
        options: q.options,
        force: true,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } else {
      speechNarrator.stop();
      setIsSpeaking(false);
    }
  }, [phase, currentIndex, autoNarrate, questions]);

  // Finish Game when time is up
  const handleTimeIsUp = useCallback(() => {
    speechNarrator.stop();
    soundEffects.playBuzzerStop();
    setPhase('results');

    // Calculate final results
    setTotalXp((currXp) => {
      if (currXp > 0) {
        onEarnPoints(currXp, true, correctCount);
      }
      return currXp;
    });

    // Check high score
    const recordKey = `${selectedSubjectId}_${selectedDuration}`;
    const existing = records[recordKey];
    const isNew = !existing || correctCount > existing.correctCount;
    if (isNew && correctCount > 0) {
      setIsNewHighScore(true);
      const newRec: HighScoreRecord = {
        subjectId: selectedSubjectId,
        subjectName: selectedSubject.name,
        correctCount,
        totalAnswered: correctCount + wrongCount + skippedCount,
        maxStreak,
        xpEarned: totalXp,
        duration: selectedDuration,
        grade: GRADE_LABELS[selectedGrade]?.short || 'Série',
        date: new Date().toLocaleDateString('pt-BR'),
      };
      saveRecord(newRec);
      setRecords(getStoredRecords());
      soundEffects.playVictoryFanfare();
    } else {
      setIsNewHighScore(false);
      soundEffects.playSuccess();
    }
  }, [
    correctCount,
    wrongCount,
    skippedCount,
    maxStreak,
    totalXp,
    selectedSubjectId,
    selectedSubject,
    selectedDuration,
    selectedGrade,
    records,
    onEarnPoints,
  ]);

  // Start the challenge
  const handleStartChallenge = () => {
    soundEffects.playClick();
    loadQuestions(selectedSubjectId, selectedGrade, selectedDifficulty);
    setSelectedOption(null);
    setIsAnswering(false);
    setCorrectCount(0);
    setWrongCount(0);
    setSkippedCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setTotalXp(0);
    setLastFeedback(null);
    setMissedQuestions([]);
    setIsNewHighScore(false);
    setCopiedErrorSummary(false);
    setTimeLeft(selectedDuration);
    setPhase('countdown');
  };

  // Practice only missed questions
  const handlePracticeOnlyMissed = () => {
    if (missedQuestions.length === 0) return;
    soundEffects.playClick();
    const missedQs = missedQuestions.map((m) => m.question);
    setQuestions(missedQs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswering(false);
    setCorrectCount(0);
    setWrongCount(0);
    setSkippedCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setTotalXp(0);
    setLastFeedback(null);
    setMissedQuestions([]);
    setIsNewHighScore(false);
    setCopiedErrorSummary(false);
    setTimeLeft(selectedDuration);
    setPhase('countdown');
  };

  // Current question helper
  const currentQuestion = questions[currentIndex] || null;

  // Answer selection handler
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswering || phase !== 'playing' || !currentQuestion) return;

    speechNarrator.stop();
    setIsSpeaking(false);
    setIsAnswering(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }

      // Combo bonus logic
      let pointsEarned = 10;
      let comboVariant: 'standard' | 'combo' | 'bonus' = 'standard';

      if (nextStreak >= 5) {
        pointsEarned = 20; // 2x Combo
        comboVariant = 'bonus';
      } else if (nextStreak >= 3) {
        pointsEarned = 15; // 1.5x Combo
        comboVariant = 'combo';
      }

      // Difficulty bonus
      if (selectedDifficulty === 'hard') {
        pointsEarned += 5;
      }

      setCorrectCount((prev) => prev + 1);
      setTotalXp((prev) => prev + pointsEarned);
      setLastFeedback('correct');
      // Distinct electric lightning sound with streak pitch modulation
      soundEffects.playLightningCorrect(nextStreak);
    } else {
      setCurrentStreak(0);
      setWrongCount((prev) => prev + 1);
      setLastFeedback('wrong');
      // Distinct snappy electronic buzz for lightning mode
      soundEffects.playLightningIncorrect();

      // Track missed question for post-game review & error remediation
      setMissedQuestions((prev) => [
        ...prev,
        {
          question: currentQuestion,
          chosenIndex: optionIndex,
          wasSkipped: false,
        },
      ]);
    }

    // Record attempt for academic mistakes diagnostics
    try {
      const qText = (currentQuestion as any).question || (currentQuestion as any).text || '';
      const qSubj = (currentQuestion as any).subject || (currentQuestion as any).subjectId || 'geral';
      const subj = SUBJECTS.find((s) => s.id === qSubj) || { name: 'Geral' };
      mistakesTrackerService.recordAttempt({
        questionText: qText,
        subjectId: qSubj,
        subjectName: subj.name,
        topic: currentQuestion.topic || subj.name,
        isCorrect,
        grade: selectedGrade,
        userChoice: currentQuestion.options[optionIndex],
        correctChoice: currentQuestion.options[currentQuestion.correctIndex],
        explanation: currentQuestion.explanation,
      });
    } catch {}

    // Fast advance to next question (320ms for instant arcade momentum)
    window.setTimeout(() => {
      setSelectedOption(null);
      setIsAnswering(false);
      setLastFeedback(null);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Fetch more questions on the fly if user is super fast!
        const extra = getQuestionsForMatch(
          selectedGrade,
          25,
          selectedDifficulty === 'all' ? undefined : selectedDifficulty,
          selectedSubjectId
        );
        setQuestions((prev) => [...prev, ...extra]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 320);
  };

  // Skip question
  const handleSkipQuestion = () => {
    if (isAnswering || phase !== 'playing' || !currentQuestion) return;
    speechNarrator.stop();
    soundEffects.playClick();
    setSkippedCount((prev) => prev + 1);
    setCurrentStreak(0);

    setMissedQuestions((prev) => [
      ...prev,
      {
        question: currentQuestion,
        chosenIndex: null,
        wasSkipped: true,
      },
    ]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const extra = getQuestionsForMatch(
        selectedGrade,
        25,
        selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        selectedSubjectId
      );
      setQuestions((prev) => [...prev, ...extra]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Manual read aloud button
  const handleSpeakCurrentQuestion = () => {
    if (!currentQuestion) return;
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      speechNarrator.speakQuestion({
        questionIndex: currentIndex,
        questionText: currentQuestion.question,
        options: currentQuestion.options,
        force: true,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  // Keyboard shortcut listener for options 1, 2, 3, 4
  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswering) return;
      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        handleSelectOption(0);
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        handleSelectOption(1);
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        handleSelectOption(2);
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        handleSelectOption(3);
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space to skip
        handleSkipQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isAnswering, currentQuestion]);

  // Overall record for the selected subject and duration
  const currentRecord = records[`${selectedSubjectId}_${selectedDuration}`];

  // Helper to find question subject info when playing "all"
  const getQuestionSubjectInfo = (qSubject: string) => {
    return SUBJECTS.find((s) => s.id === qSubject) || { name: qSubject, icon: '📚' };
  };

  // --------------------------------------------------------------------------
  // RENDER: SETUP / SUBJECT SELECTION SCREEN
  // --------------------------------------------------------------------------
  if (phase === 'setup') {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-32 sm:pb-36">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Desafio Relâmpago</span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 border border-amber-300 p-5 sm:p-6 shadow-sm">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              ⚡ Modo Contra o Tempo
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Desafio Relâmpago: Tudo da Série & Matérias
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Responda o máximo de perguntas no tempo limite! Treine com <strong>Tudo da Série (Mix Geral)</strong>{' '}
              ou escolha uma matéria específica para bater seus recordes.
            </p>

            {/* Current Grade Badge & Selector */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-amber-300 text-xs font-bold text-amber-800 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>
                  Série:{' '}
                  <strong className="text-slate-900 font-black">
                    {GRADE_LABELS[selectedGrade]?.full || 'Ensino Fundamental'}
                  </strong>
                </span>
              </div>

              {currentRecord && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 shadow-2xs">
                  <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Recorde: <strong className="text-slate-900 font-black">{currentRecord.correctCount} acertos</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-4 -bottom-6 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none">
            ⚡
          </div>
        </div>

        {/* Duration & Difficulty Quick Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Duration Selector */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Tempo de Jogo:
              </span>
              <span className="text-amber-800 font-black">{selectedDuration} Segundos</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { sec: 30, label: '30s' },
                { sec: 60, label: '60s ⭐' },
                { sec: 90, label: '90s' },
                { sec: 120, label: '120s' },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedDuration(item.sec);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedDuration === item.sec
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility & Voice Settings */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Recursos de Voz & Dificuldade:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAutoNarrate(!autoNarrate);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  autoNarrate
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Leitura automática das perguntas em voz alta"
              >
                {autoNarrate ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{autoNarrate ? 'Voz Ligada' : 'Sem Voz'}</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setVoiceInputEnabled(!voiceInputEnabled);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  voiceInputEnabled
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Permite responder por voz falando Letra A, B, C, D"
              >
                {voiceInputEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{voiceInputEnabled ? 'Mic Ativo' : 'Mic Deslig.'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Choice: TUDO DA SÉRIE (MIX GERAL) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Modo Principal:</span>
            </h2>
            <span className="text-[11px] text-amber-700 font-bold">100% Alinhado à BNCC</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedSubjectId('all');
            }}
            className={`w-full p-4 rounded-3xl border text-left transition-all active:scale-[0.99] cursor-pointer relative overflow-hidden flex items-center justify-between shadow-xs ${
              selectedSubjectId === 'all'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 shadow-md ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 flex items-center justify-center text-2xl shadow-md shrink-0">
                🎒
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900">Tudo da Série (Mix Geral)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-300">
                    Completo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Mistura perguntas de Matemática, Português, Ciências, História, Geografia e Inglês da sua série!
                </p>
                {records[`all_${selectedDuration}`] && (
                  <p className="text-[11px] text-amber-700 font-bold pt-0.5">
                    🏆 Seu Recorde Geral: {records[`all_${selectedDuration}`].correctCount} acertos em {selectedDuration}s
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  selectedSubjectId === 'all'
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-300'
                }`}
              >
                {selectedSubjectId === 'all' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          </button>
        </div>

        {/* Or Choose a Specific Subject */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Ou Escolha uma Matéria Específica:</span>
            </h2>
            <span className="text-xs text-slate-500">{availableSubjects.length} matérias</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableSubjects.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              const rec = records[`${subj.id}_${selectedDuration}`];

              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedSubjectId(subj.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-2xl">{subj.icon || '📚'}</span>
                    {rec ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        {rec.correctCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Livre</span>
                    )}
                  </div>

                  <div>
                    <h3 className={`font-bold text-xs truncate ${isSelected ? 'text-amber-900 font-black' : 'text-slate-800'}`}>
                      {subj.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      {rec ? `Melhor: ${rec.correctCount} acertos` : 'Toque para jogar'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Game CTA */}
        <div className="pt-2">
          <button
            onClick={handleStartChallenge}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition transform active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white text-white" />
            <span>Iniciar Desafio Relâmpago ({selectedDuration}s)</span>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: 3, 2, 1 COUNTDOWN OVERLAY
  // --------------------------------------------------------------------------
  if (phase === 'countdown') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-sm font-bold animate-pulse">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{selectedSubject.name}</span>
          </div>

          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-xl border-4 border-amber-300">
              <span className="text-6xl font-black text-white tracking-tighter">
                {countdownNumber === 0 ? 'VAI!' : countdownNumber}
              </span>
            </div>
          </div>

          <p className="text-slate-600 font-medium text-sm">
            Prepare-se! {selectedDuration} segundos no relógio.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: PLAYING SCREEN
  // --------------------------------------------------------------------------
  if (phase === 'playing' && currentQuestion) {
    const isLast5Seconds = timeLeft <= 5 && timeLeft >= 1;
    const isUrgent = timeLeft <= 10;
    const progressPercent = (timeLeft / selectedDuration) * 100;
    const subjInfo = getQuestionSubjectInfo(currentQuestion.subject);

    return (
      <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full pb-28">
        {/* Top Control Bar: Exit, Timer, Score, Combo, Voice Controller */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Exit button */}
            <button
              onClick={() => {
                speechNarrator.stop();
                soundEffects.playClick();
                if (window.confirm('Deseja desistir do desafio relâmpago?')) {
                  if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                  setPhase('setup');
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Sair
            </button>

            {/* Central Timer Badge */}
            <div
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl font-black text-base transition-all ${
                isLast5Seconds
                  ? 'bg-rose-600 border-2 border-yellow-300 text-white scale-110 shadow-lg shadow-rose-600/40 ring-2 ring-yellow-400'
                  : isUrgent
                  ? 'bg-rose-100 border-2 border-rose-400 text-rose-700 scale-105 shadow-sm'
                  : 'bg-white border border-amber-300 text-amber-800 shadow-2xs'
              }`}
            >
              <Clock className={`w-4 h-4 ${isLast5Seconds ? 'text-yellow-300 animate-spin' : isUrgent ? 'text-rose-500 animate-spin' : 'text-amber-500'}`} />
              <span className="tracking-wider font-mono">
                {isLast5Seconds ? `⚡ 00:0${timeLeft}` : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
              </span>
            </div>

            {/* Score & Combo */}
            <div className="flex items-center gap-1.5">
              {currentStreak >= 3 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black animate-bounce shadow-2xs">
                  <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>x{currentStreak >= 5 ? '2.0' : '1.5'}</span>
                </div>
              )}

              <div className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1 shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>{correctCount}</span>
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isUrgent
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Header: Subject Badge, Topic, Question Index & Narration Button */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{subjInfo.icon || '📚'}</span>
            <span className="font-bold text-slate-800">{subjInfo.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate max-w-[140px]">{currentQuestion.topic}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio narrator button */}
            <button
              onClick={handleSpeakCurrentQuestion}
              className={`p-1.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                isSpeaking
                  ? 'bg-purple-600 border-purple-500 text-white animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Ler pergunta em voz alta"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <span className="font-black text-amber-600">#{currentIndex + 1}</span>
          </div>
        </div>

        {/* Question Box */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          {lastFeedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none transition-opacity duration-300" />
          )}
          {lastFeedback === 'wrong' && (
            <div className="absolute inset-0 bg-rose-500/10 pointer-events-none transition-opacity duration-300" />
          )}

          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* 4 Options Grid (A, B, C, D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {currentQuestion.options.map((optionText, optIndex) => {
            const letter = ['A', 'B', 'C', 'D'][optIndex] || `${optIndex + 1}`;
            const isSelected = selectedOption === optIndex;
            const isCorrectAnswer = optIndex === currentQuestion.correctIndex;

            let cardStyle =
              'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/40 shadow-2xs';

            if (isAnswering) {
              if (isCorrectAnswer) {
                cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm';
              } else if (isSelected && !isCorrectAnswer) {
                cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm';
              } else {
                cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={optIndex}
                disabled={isAnswering}
                onClick={() => handleSelectOption(optIndex)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3 cursor-pointer active:scale-[0.98] ${cardStyle}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isAnswering && isCorrectAnswer
                      ? 'bg-emerald-500 text-white'
                      : isAnswering && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {letter}
                </div>

                <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
                  {optionText}
                </span>

                {isAnswering && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswering && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Voice Answer Controller */}
        {voiceInputEnabled && (
          <div className="pt-1">
            <VoiceAnswerController
              options={currentQuestion.options}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswering}
              onSelectOption={(idx) => handleSelectOption(idx)}
              autoSubmitOnVoice={true}
            />
          </div>
        )}

        {/* Footer Actions: Skip Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleSkipQuestion}
            disabled={isAnswering}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Pular Pergunta (Sem perder tempo)</span>
          </button>

          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            Atalhos: Teclas 1, 2, 3, 4 ou A, B, C, D
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: RESULTS SCREEN (TEMPO ESGOTADO)
  // --------------------------------------------------------------------------
  const totalAnswered = correctCount + wrongCount + skippedCount;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const avgSecondsPerAnswer =
    totalAnswered > 0 ? (selectedDuration / totalAnswered).toFixed(1) : '0';

  // Copy error summary to clipboard
  const handleCopyErrors = () => {
    if (missedQuestions.length === 0) return;
    const lines = [
      `📚 Resumo dos Erros - Desafio Relâmpago (${selectedSubject.name})`,
      `Total de Erros: ${missedQuestions.length} de ${totalAnswered} questões`,
      '----------------------------------------',
      ...missedQuestions.map((item, idx) => {
        const correctLetter = ['A', 'B', 'C', 'D'][item.question.correctIndex];
        const correctText = item.question.options[item.question.correctIndex];
        return `${idx + 1}. ${item.question.question}\n   Gabarito (${correctLetter}): ${correctText}\n   Explicação: ${item.question.explanation || 'N/A'}\n`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedErrorSummary(true);
    soundEffects.playClick();
    setTimeout(() => setCopiedErrorSummary(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-32 sm:pb-36">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundEffects.playClick();
            setPhase('setup');
          }}
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 p-2 rounded-xl bg-white border border-slate-200 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trocar Matéria / Configurações</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          ⚡ {selectedDuration}s Finalizados
        </span>
      </div>

      {/* Main Result Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 border border-slate-200/90 p-5 sm:p-6 shadow-sm text-center space-y-3">
        {isNewHighScore && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm animate-bounce">
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>NOVO RECORDE PESSOAL! 🏆</span>
          </div>
        )}

        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center mx-auto shadow-md text-3xl">
          ⚡
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tempo Esgotado!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Você detonou no desafio de <strong>{selectedSubject.name}</strong> ({selectedDuration}s)!
        </p>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Acertos */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-bold block">Acertos</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
              {correctCount}
            </span>
            <span className="text-[10px] text-slate-400">de {totalAnswered} feitas</span>
          </div>

          {/* Precisão */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-bold block">Precisão</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
              {accuracyPercent}%
            </span>
            <span className="text-[10px] text-slate-400">taxa de acerto</span>
          </div>

          {/* Velocidade Média */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-bold block">Velocidade</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 block">
              {avgSecondsPerAnswer}s
            </span>
            <span className="text-[10px] text-slate-400">por resposta</span>
          </div>

          {/* XP Ganho */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-bold block">XP Ganho</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 block">
              +{totalXp}
            </span>
            <span className="text-[10px] text-slate-400">pontos somados</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={handleStartChallenge}
          className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jogar Novamente ({selectedSubject.name})</span>
        </button>

        {missedQuestions.length > 0 ? (
          <button
            onClick={handlePracticeOnlyMissed}
            className="py-3.5 px-4 rounded-2xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Treinar Só os {missedQuestions.length} Erros</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundEffects.playClick();
              setPhase('setup');
            }}
            className="py-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Escolher Outra Matéria</span>
          </button>
        )}
      </div>

      {/* Missed Questions Review Section with Pedagogical Resolution */}
      {missedQuestions.length > 0 && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-black text-slate-900">
                Resolução & Gabarito dos Erros ({missedQuestions.length})
              </h2>
            </div>

            <button
              onClick={handleCopyErrors}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              {copiedErrorSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedErrorSummary ? 'Copiado!' : 'Copiar Erros'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Aprenda a resposta certa e a explicação de cada questão para gabaritar no próximo round:
          </p>

          <div className="space-y-3">
            {missedQuestions.map((item, idx) => {
              const correctLetter = ['A', 'B', 'C', 'D'][item.question.correctIndex];
              const correctText = item.question.options[item.question.correctIndex];
              const chosenText =
                item.chosenIndex !== null
                  ? item.question.options[item.chosenIndex]
                  : 'Questão pulada';
              const chosenLetter =
                item.chosenIndex !== null ? ['A', 'B', 'C', 'D'][item.chosenIndex] : '—';
              const itemSubj = getQuestionSubjectInfo(item.question.subject);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-amber-700">
                      {itemSubj.icon} {itemSubj.name} • {item.question.topic}
                    </span>
                    <span className="text-slate-400">#{idx + 1}</span>
                  </div>

                  <p className="font-bold text-slate-900 text-sm">{item.question.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* User answer */}
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-1.5 text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block">
                          Sua Resposta ({chosenLetter}):
                        </span>
                        <span className="font-semibold">{chosenText}</span>
                      </div>
                    </div>

                    {/* Correct answer */}
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          Resposta Correta ({correctLetter}):
                        </span>
                        <span className="font-bold">{correctText}</span>
                      </div>
                    </div>
                  </div>

                  {item.question.explanation && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed shadow-2xs">
                      <strong className="text-amber-700 font-bold">Por que está correto?</strong>{' '}
                      {item.question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
