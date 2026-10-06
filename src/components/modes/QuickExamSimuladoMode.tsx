import React, { useState, useEffect } from 'react';
import { Question, UserProfile } from '../../types';
import {
  getFallbackLesson,
  GRADE_LABELS,
  SUBJECTS,
  getGradeAndRevisionQuestions,
  getSubjectsForGrade,
  shuffleQuestionOptions,
  shuffleQuestionsList,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { indexedDbService } from '../../services/indexedDbService';
import { mistakesTrackerService } from '../../services/mistakesTrackerService';
import { QuestionTheoryGuideModal } from '../QuestionTheoryGuideModal';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Zap,
  Clock,
  Flame,
  ChevronRight,
  GraduationCap,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface QuickExamSimuladoModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, correctCount: number) => void;
}

export const QuickExamSimuladoMode: React.FC<QuickExamSimuladoModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  const grade = user.grade || '6_fund';
  const gradeInfo = GRADE_LABELS[grade] || { short: '6º Ano', full: '6º Ano Fundamental' };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [answersSummary, setAnswersSummary] = useState<
    { question: Question; selectedIndex: number; isCorrect: boolean }[]
  >([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isTheoryGuideOpen, setIsTheoryGuideOpen] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [isLoadingSimulado, setIsLoadingSimulado] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStepText, setLoadingStepText] = useState<string>('Consultando matriz da BNCC...');

  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  const currQuestion = questions[currentIndex];
  const questionText = currQuestion ? currQuestion.question || (currQuestion as any).text || '' : '';

  // Auto-speak question when question loads or advances
  useEffect(() => {
    if (currQuestion && !isAnswered && !isFinished) {
      const timer = setTimeout(() => {
        speechNarrator.speakQuestion({
          questionIndex: currentIndex,
          questionText,
          options: currQuestion.options || [],
          onStart: () => setIsSpeakingQuestion(true),
          onEnd: () => setIsSpeakingQuestion(false),
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
        setIsSpeakingQuestion(false);
      };
    }
  }, [currentIndex, isAnswered, isFinished, currQuestion?.id]);

  const handleSpeakQuestion = () => {
    if (!currQuestion) return;
    soundEffects.playClick();

    if (isSpeakingQuestion) {
      speechNarrator.stop();
      setIsSpeakingQuestion(false);
      return;
    }

    speechNarrator.speakQuestion({
      questionIndex: currentIndex,
      questionText,
      options: currQuestion.options || [],
      force: true,
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false),
    });
  };

  // Generate 5 dynamic questions on load (Strictly excluding non-curricular / optional subjects like xadrez)
  const loadSimulado = async () => {
    setIsLoadingSimulado(true);
    setLoadingProgress(10);
    setLoadingStepText('Consultando matriz da BNCC e matérias da série...');

    const pool: Question[] = [];
    const subjects = getSubjectsForGrade(grade).filter(
      (s) => s.id !== 'xadrez' && s.id !== 'italiano' && s.id !== 'espanhol'
    );

    subjects.forEach((subj) => {
      try {
        const lesson = getFallbackLesson(grade, subj.id);
        if (lesson && lesson.practiceQuestions && lesson.practiceQuestions.length > 0) {
          lesson.practiceQuestions.forEach((q) => {
            if (q.subject !== 'xadrez') {
              pool.push({
                ...q,
                subject: subj.id,
                gradeOriginLabel: q.gradeOriginLabel || `${subj.name} • ${GRADE_LABELS[grade]?.short || 'BNCC'}`,
              });
            }
          });
        }
      } catch {}
    });

    if (pool.length < 5) {
      const fallbackQuestions = getGradeAndRevisionQuestions(grade, undefined, 4, 4).filter(
        (q) => q.subject !== 'xadrez'
      );
      pool.push(...fallbackQuestions);
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffleQuestionsList(shuffled.slice(0, 5));

    // Save offline backup in IndexedDB
    try {
      await indexedDbService.saveOfflineQuestions(selected);
    } catch {}

    // Fast loading sequence for instant responsiveness
    setTimeout(() => {
      setLoadingProgress(60);
      setLoadingStepText('Cruzando 5 questões inéditas com gabarito...');
    }, 100);

    setTimeout(() => {
      setLoadingProgress(100);
      setLoadingStepText('Simulado pronto!');
    }, 200);

    setTimeout(() => {
      setQuestions(selected);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setCorrectCount(0);
      setStreak(0);
      setTimer(30);
      setAnswersSummary([]);
      setIsFinished(false);
      setIsLoadingSimulado(false);
    }, 280);
  };

  useEffect(() => {
    loadSimulado();
  }, [grade]);

  // Question Timer Countdown
  useEffect(() => {
    if (isFinished || isAnswered || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnswered, isFinished, currentIndex, questions.length]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    soundEffects.playError();
    setStreak(0);

    const currQ = questions[currentIndex];
    mistakesTrackerService.recordAttempt({
      grade,
      subjectId: currQ.subject || 'geral',
      subjectName: SUBJECTS[currQ.subject]?.name || 'Geral',
      topic: currQ.topic || currQ.category || 'Simulado BNCC',
      questionText: currQ.question,
      isCorrect: false,
      userChoice: 'Tempo Esgotado',
      correctChoice: currQ.options[currQ.correctIndex],
    });

    setAnswersSummary((prev) => [
      ...prev,
      {
        question: currQ,
        selectedIndex: -1,
        isCorrect: false,
      },
    ]);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currQ = questions[currentIndex];
    const isCorrect = idx === currQ.correctIndex;

    mistakesTrackerService.recordAttempt({
      grade,
      subjectId: currQ.subject || 'geral',
      subjectName: SUBJECTS[currQ.subject]?.name || 'Geral',
      topic: currQ.topic || currQ.category || 'Simulado BNCC',
      questionText: currQ.question,
      isCorrect,
      userChoice: currQ.options[idx],
      correctChoice: currQ.options[currQ.correctIndex],
    });

    if (isCorrect) {
      soundEffects.playCorrect();
      const pointsEarned = 50 + streak * 10;
      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      onEarnPoints(pointsEarned, 1);
    } else {
      soundEffects.playError();
      setStreak(0);
      onEarnPoints(10, 0);
    }

    setAnswersSummary((prev) => [
      ...prev,
      {
        question: currQ,
        selectedIndex: idx,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimer(30);
    } else {
      setIsFinished(true);
      soundEffects.playLevelUp();
    }
  };

  if (isLoadingSimulado || (!currQuestion && !isFinished)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-50 text-slate-900 max-w-md mx-auto w-full">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center shadow-md">
            <Zap className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-xs">
            5Q
          </div>
        </div>

        <div className="space-y-2 w-full">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Preparando Simulado BNCC</h2>
          <p className="text-xs text-purple-700 font-medium min-h-[20px] transition-all">
            {loadingStepText}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-1.5">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300">
            <div
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(loadingProgress, 5)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
            <span>Série {gradeInfo.short}</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Carregamento calibrado • 3 a 5 segs</span>
        </div>
      </div>
    );
  }

  const subjectMatch = currQuestion ? SUBJECTS.find((s) => s.id === currQuestion.subject) : null;
  const subjectName = subjectMatch ? subjectMatch.name : 'Geral';

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition active:scale-95 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-800">
          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-black">{gradeInfo.short}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            Pergunta {currentIndex + 1}/{questions.length}
          </span>

          <div
            className={`flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-xl border ${
              timer <= 5
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-black'
                : 'bg-white text-purple-800 border-slate-200 shadow-2xs'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>00:{timer < 10 ? `0${timer}` : timer}</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white rounded-lg text-xs font-black animate-pulse shadow-xs">
              <Flame className="w-3 h-3 fill-white" />
              <span>{streak}x</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE QUIZ */}
      {!isFinished && currQuestion ? (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div className="space-y-4">
            {/* Difficulty Badge & Subject */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                Fácil
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {currQuestion.gradeOriginLabel || subjectName}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {questionText}
              </h2>
            </div>

            {/* Automatic Voice Answer Controller */}
            <VoiceAnswerController
              options={currQuestion.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswered}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNextQuestion}
            />

            {/* Options List (A, B, C, D) */}
            <div className="space-y-2.5">
              {currQuestion.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currQuestion.correctIndex;

                let cardStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50 shadow-2xs';
                let letterStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                if (isAnswered) {
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
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 text-left active:scale-[0.99] cursor-pointer ${cardStyle}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${letterStyle}`}
                    >
                      {letter}
                    </div>
                    <span className="text-sm font-semibold flex-1 leading-snug">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Resolution Card */}
            {isAnswered && currQuestion.explanation && (
              <div
                className={`p-4 rounded-2xl border space-y-1.5 animate-in fade-in slide-in-from-bottom-2 ${
                  selectedOption === currQuestion.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-amber-50 border-amber-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${
                    selectedOption === currQuestion.correctIndex ? 'text-emerald-800' : 'text-amber-900'
                  }`}>
                    {selectedOption === currQuestion.correctIndex ? 'Correto! 🎉' : 'Gabarito Pedagógico 💡'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line">
                  {currQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action CTA Button */}
          {isAnswered && (
            <div className="sticky bottom-2 z-10 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pb-1">
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>{currentIndex + 1 < questions.length ? 'Próxima pergunta' : 'Ver Resultado'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* FINISHED SUMMARY */
        <div className="flex-1 flex flex-col justify-between py-6 space-y-4 text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto text-3xl shadow-sm">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Simulado Concluído!</h2>
              <p className="text-xs text-slate-500">
                Você respondeu as 5 questões express do {GRADE_LABELS[grade]?.short || 'BNCC'}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Acertos</span>
                <span className="text-xl font-black text-emerald-700">{correctCount} / {questions.length}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Pontos XP</span>
                <span className="text-xl font-black text-purple-700">+{score} XP</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={loadSimulado}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95 mb-2 cursor-pointer"
              >
                Fazer Novo Simulado
              </button>
              <button
                onClick={onBack}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theory Guide Modal */}
      {currQuestion && (
        <QuestionTheoryGuideModal
          isOpen={isTheoryGuideOpen}
          onClose={() => setIsTheoryGuideOpen(false)}
          question={currQuestion}
          userGrade={grade}
        />
      )}
    </div>
  );
};
