import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, Question, SubjectId, UserProfile } from '../../types';
import {
  GRADE_LABELS,
  SUBJECTS,
  getQuestionsForMatch,
  getSubjectsForGrade,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { VictoryCelebration } from '../VictoryCelebration';
import {
  ArrowLeft,
  Swords,
  Users,
  Trophy,
  Crown,
  Flame,
  Zap,
  Sparkles,
  Timer,
  Clock,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Share2,
  ChevronRight,
  Shield,
  Award,
  GraduationCap,
} from 'lucide-react';

interface KnowledgeDuelModeProps {
  user: UserProfile;
  theme?: 'light' | 'dark';
  onBack: () => void;
  onEarnPoints?: (points: number, isMajor?: boolean, count?: number) => void;
}

interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string; // TailWind gradient
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTimeSpent: number; // in seconds
}

const AVATAR_OPTIONS = [
  'graduation-cap',
  'crown',
  'zap',
  'shield',
  'award',
  'sparkles',
  'flame',
  'trophy',
  'swords',
];

const renderDuelAvatar = (avId: string, photoURL?: string, className = 'w-6 h-6 text-white') => {
  if (photoURL && (avId === 'graduation-cap' || !avId)) {
    return <img src={photoURL} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />;
  }
  if (avId && (avId.startsWith('http') || avId.startsWith('data:image'))) {
    return <img src={avId} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />;
  }
  switch (avId) {
    case 'crown': return <Crown className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'award': return <Award className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'trophy': return <Trophy className={className} />;
    case 'swords': return <Swords className={className} />;
    case 'graduation-cap':
    default:
      if (!avId || avId.length > 4) {
        return <GraduationCap className={className} />;
      }
      return <span className="select-none leading-none text-2xl">{avId}</span>;
  }
};

export const KnowledgeDuelMode: React.FC<KnowledgeDuelModeProps> = ({
  user,
  theme = 'light',
  onBack,
  onEarnPoints,
}) => {
  const isLight = theme === 'light';
  // Game steps: 'setup' | 'versus_intro' | 'playing' | 'round_feedback' | 'game_over'
  const [step, setStep] = useState<'setup' | 'versus_intro' | 'playing' | 'round_feedback' | 'game_over'>('setup');

  // Match configuration
  const [player1Name, setPlayer1Name] = useState<string>(user.name || 'Você');
  const [player1Avatar, setPlayer1Avatar] = useState<string>('graduation-cap');
  const [player2Name, setPlayer2Name] = useState<string>('Amigo');
  const [player2Avatar, setPlayer2Avatar] = useState<string>('crown');

  const [matchGrade, setMatchGrade] = useState<GradeLevel>(user.grade || '6_fund');
  const [matchSubject, setMatchSubject] = useState<SubjectId | 'all'>('all');
  const [roundsCount, setRoundsCount] = useState<number>(5); // 5, 8, 10
  const [timePerQuestion, setTimePerQuestion] = useState<number>(20); // 15, 20, 30, 0 (no timer)

  // Gameplay State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [activePlayerTurn, setActivePlayerTurn] = useState<1 | 2>(1); // 1 for P1, 2 for P2

  const [p1State, setP1State] = useState<DuelPlayer>({
    id: 'p1',
    name: user.name || 'Você',
    avatar: 'graduation-cap',
    color: 'from-indigo-600 to-purple-600',
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeSpent: 0,
  });

  const [p2State, setP2State] = useState<DuelPlayer>({
    id: 'p2',
    name: 'Amigo',
    avatar: 'crown',
    color: 'from-rose-500 to-amber-500',
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeSpent: 0,
  });

  // Current turn interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsAwardedThisTurn, setPointsAwardedThisTurn] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Winner state
  const [winner, setWinner] = useState<DuelPlayer | null>(null);
  const [isTie, setIsTie] = useState<boolean>(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTimeRef = useRef<number>(Date.now());

  // Available subjects for the selected grade
  const availableSubjects = getSubjectsForGrade(matchGrade);

  // START MATCH
  const handleStartDuel = () => {
    soundEffects.playClick();

    // Generate questions for the duel
    const totalQuestionsNeeded = roundsCount * 2; // Each round has a question for P1 and P2
    const generated = getQuestionsForMatch(matchGrade, totalQuestionsNeeded, 'medium', matchSubject);

    setQuestions(generated);
    setCurrentRoundIndex(0);
    setActivePlayerTurn(1);

    const initialP1: DuelPlayer = {
      id: 'p1',
      name: player1Name.trim() || 'Jogador 1',
      avatar: player1Avatar,
      color: 'from-indigo-600 to-purple-600',
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalTimeSpent: 0,
    };

    const initialP2: DuelPlayer = {
      id: 'p2',
      name: player2Name.trim() || 'Jogador 2',
      avatar: player2Avatar,
      color: 'from-rose-500 to-amber-500',
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalTimeSpent: 0,
    };

    setP1State(initialP1);
    setP2State(initialP2);

    // Show versus intro animation then jump to playing
    setStep('versus_intro');
    soundEffects.playLevelUp();

    setTimeout(() => {
      setStep('playing');
      startTurnTimer();
    }, 2000);
  };

  // Timer helper
  const startTurnTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timePerQuestion <= 0) return;

    setTimeLeft(timePerQuestion);
    turnStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time expired for this turn
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechNarrator.stop();
    };
  }, []);

  // Time expired handler
  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setIsCorrect(false);
    setPointsAwardedThisTurn(0);
    soundEffects.playWrong();

    // Update active player stats
    const activePlayer = activePlayerTurn === 1 ? p1State : p2State;
    const timeSpent = timePerQuestion;

    if (activePlayerTurn === 1) {
      setP1State((prev) => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
      }));
    } else {
      setP2State((prev) => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
      }));
    }
  };

  // Current active question
  const questionIndex = currentRoundIndex * 2 + (activePlayerTurn === 1 ? 0 : 1);
  const currentQuestion = questions[questionIndex] || questions[0];

  // SUBMIT ANSWER
  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);
    speechNarrator.stop();
    setIsSpeaking(false);

    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const isAnswerCorrect = index === currentQuestion.correctIndex;
    setIsCorrect(isAnswerCorrect);

    const secondsTaken = timePerQuestion > 0 ? Math.max(1, timePerQuestion - timeLeft) : 5;

    let points = 0;
    if (isAnswerCorrect) {
      soundEffects.playCorrect();
      // Base score: 100 pts + speed bonus (up to 50 pts)
      const speedBonus = timePerQuestion > 0 ? Math.round((timeLeft / timePerQuestion) * 50) : 25;
      points = 100 + speedBonus;
    } else {
      soundEffects.playWrong();
      points = 0;
    }

    setPointsAwardedThisTurn(points);

    // Update active player's score
    if (activePlayerTurn === 1) {
      setP1State((prev) => ({
        ...prev,
        score: prev.score + points,
        correctAnswers: prev.correctAnswers + (isAnswerCorrect ? 1 : 0),
        wrongAnswers: prev.wrongAnswers + (isAnswerCorrect ? 0 : 1),
        totalTimeSpent: prev.totalTimeSpent + secondsTaken,
      }));
    } else {
      setP2State((prev) => ({
        ...prev,
        score: prev.score + points,
        correctAnswers: prev.correctAnswers + (isAnswerCorrect ? 1 : 0),
        wrongAnswers: prev.wrongAnswers + (isAnswerCorrect ? 0 : 1),
        totalTimeSpent: prev.totalTimeSpent + secondsTaken,
      }));
    }
  };

  // NEXT TURN / NEXT ROUND / GAME OVER
  const handleAdvanceTurn = () => {
    soundEffects.playClick();
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setPointsAwardedThisTurn(0);

    if (activePlayerTurn === 1) {
      // Switch to Player 2's turn for the current round
      setActivePlayerTurn(2);
      startTurnTimer();
    } else {
      // Both players completed this round
      if (currentRoundIndex + 1 < roundsCount) {
        // Move to next round, starting with Player 1
        setCurrentRoundIndex((prev) => prev + 1);
        setActivePlayerTurn(1);
        startTurnTimer();
      } else {
        // MATCH FINISHED! Determine Winner
        finishMatch();
      }
    }
  };

  const finishMatch = () => {
    soundEffects.playVictory();
    setStep('game_over');

    // Give real XP to the user account
    const userScore = p1State.score;
    const isUserWinner = p1State.score > p2State.score;
    const isDraw = p1State.score === p2State.score;

    if (isDraw) {
      setIsTie(true);
      setWinner(null);
      if (onEarnPoints) {
        onEarnPoints(Math.max(50, Math.round(userScore / 3)), false, p1State.correctAnswers);
      }
    } else if (isUserWinner) {
      setIsTie(false);
      setWinner(p1State);
      if (onEarnPoints) {
        onEarnPoints(Math.max(100, Math.round(userScore / 2)), true, p1State.correctAnswers);
      }
    } else {
      setIsTie(false);
      setWinner(p2State);
      if (onEarnPoints) {
        onEarnPoints(Math.max(40, Math.round(userScore / 4)), false, p1State.correctAnswers);
      }
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion) return;
    soundEffects.playClick();

    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${currentQuestion.question}. Opções: A) ${currentQuestion.options[0]}. B) ${currentQuestion.options[1]}. C) ${currentQuestion.options[2] || ''}. D) ${currentQuestion.options[3] || ''}`;
    setIsSpeaking(true);
    speechNarrator.speak(textToSpeak, () => {
      setIsSpeaking(false);
    });
  };

  const activePlayer = activePlayerTurn === 1 ? p1State : p2State;

  // =========================================================================
  // VIEW 1: SETUP DUEL
  // =========================================================================
  if (step === 'setup') {
    return (
      <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4 pb-28">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-[#121829] hover:bg-[#1e293b] border-[#273553] text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-sm flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" />
              <span>Duelo 1 vs 1</span>
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-xl space-y-2 ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-purple-200'
            : 'bg-gradient-to-br from-[#1b1938] via-[#121829] to-[#121829] border-[#8b5cf6]/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-600/30">
              ⚔️
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Duelo de Conhecimento
              </h1>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Desafie um amigo ou colega em uma partida rápida de perguntas e respostas!
              </p>
            </div>
          </div>
        </div>

        {/* Players Configuration (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Player 1 (You) */}
          <div className={`rounded-3xl border p-4 space-y-3 shadow-md relative overflow-hidden ${
            isLight
              ? 'bg-white border-indigo-200 shadow-xs'
              : 'bg-[#121829] border-indigo-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-indigo-600' : 'text-indigo-400'
              }`}>
                <Crown className="w-3.5 h-3.5" />
                Jogador 1 (Você)
              </span>
              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Host</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                {renderDuelAvatar(player1Avatar, user.photoURL, 'w-7 h-7 text-white')}
              </div>
              <div className="flex-1 min-w-0">
                <label className={`text-[11px] font-bold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Seu Nome</label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  maxLength={18}
                  placeholder="Nome do Jogador 1"
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-hidden ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-[#161e31] border-[#273553] text-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Avatar selector */}
            <div className="space-y-1">
              <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Escolha seu Avatar:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayer1Avatar(av);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                      player1Avatar === av
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-300'
                    }`}
                  >
                    {renderDuelAvatar(av, undefined, 'w-4 h-4')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player 2 (Challenger) */}
          <div className={`rounded-3xl border p-4 space-y-3 shadow-md relative overflow-hidden ${
            isLight
              ? 'bg-white border-rose-200 shadow-xs'
              : 'bg-[#121829] border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-rose-600' : 'text-rose-400'
              }`}>
                <Swords className="w-3.5 h-3.5" />
                Jogador 2 (Desafiante)
              </span>
              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Amigo</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                {renderDuelAvatar(player2Avatar, undefined, 'w-7 h-7 text-white')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Nome do Amigo</label>
                  <div className="flex items-center gap-1">
                    {['Amigo', 'Colega', 'Rival'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setPlayer2Name(sug)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border cursor-pointer ${
                          player2Name === sug
                            ? 'bg-rose-600 text-white border-rose-600'
                            : isLight
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  maxLength={18}
                  placeholder="Ex: Lucas, Sofia..."
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-hidden ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                      : 'bg-[#161e31] border-[#273553] text-white focus:border-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* Avatar selector */}
            <div className="space-y-1">
              <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Avatar do Desafiante:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayer2Avatar(av);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                      player2Avatar === av
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400 scale-105 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-300'
                    }`}
                  >
                    {renderDuelAvatar(av, undefined, 'w-4 h-4')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match Settings Card */}
        <div className={`rounded-3xl border p-4 sm:p-5 space-y-4 shadow-md ${
          isLight
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-[#121829] border-[#273553]'
        }`}>
          <h3 className={`text-sm font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Shield className="w-4 h-4 text-purple-500" />
            <span>Configurações da Partida</span>
          </h3>

          {/* 1. Grade Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nível Escolar / Série:</label>
            <select
              value={matchGrade}
              onChange={(e) => {
                soundEffects.playClick();
                setMatchGrade(e.target.value as GradeLevel);
                setMatchSubject('all');
              }}
              className={`w-full px-3 py-2.5 rounded-2xl border text-sm font-bold focus:outline-hidden ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  : 'bg-[#161e31] border-[#273553] text-white focus:border-purple-500'
              }`}
            >
              {Object.entries(GRADE_LABELS).map(([k, val]) => (
                <option key={k} value={k} className={isLight ? 'bg-white text-slate-900' : 'bg-[#121829] text-white'}>
                  {val.full} ({val.stage})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Matéria do Duelo:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setMatchSubject('all');
                }}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition text-xs font-bold cursor-pointer ${
                  matchSubject === 'all'
                    ? isLight
                      ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                      : 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-[#161e31] border-[#273553] text-slate-300 hover:bg-[#1e293b]'
                }`}
              >
                <span className="text-base">🌟</span>
                <span className="truncate">Geral (Mistas)</span>
              </button>

              {availableSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setMatchSubject(sub.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition text-xs font-bold cursor-pointer ${
                    matchSubject === sub.id
                      ? isLight
                        ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                        : 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-[#161e31] border-[#273553] text-slate-300 hover:bg-[#1e293b]'
                  }`}
                >
                  <span className="text-base">{sub.icon}</span>
                  <span className="truncate">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Number of Rounds & Timer */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t ${
            isLight ? 'border-slate-100' : 'border-[#1e293b]'
          }`}>
            {/* Rounds */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Rodadas de Perguntas:</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 8, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      soundEffects.playClick();
                      setRoundsCount(count);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition border cursor-pointer ${
                      roundsCount === count
                        ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                        : isLight
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-[#161e31] text-slate-300 border-[#273553] hover:bg-[#1e293b]'
                    }`}
                  >
                    {count} Questões
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tempo por Pergunta:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '15s ⚡', val: 15 },
                  { label: '25s ⏱️', val: 25 },
                  { label: 'Livre ♾️', val: 0 },
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => {
                      soundEffects.playClick();
                      setTimePerQuestion(t.val);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition border cursor-pointer ${
                      timePerQuestion === t.val
                        ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                        : isLight
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-[#161e31] text-slate-300 border-[#273553] hover:bg-[#1e293b]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartDuel}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition shadow-xl shadow-purple-900/30 active:scale-[0.99] cursor-pointer"
        >
          <Swords className="w-5 h-5" />
          <span>INICIAR DUELO DE CONHECIMENTO</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: VERSUS INTRO ANIMATION
  // =========================================================================
  if (step === 'versus_intro') {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 text-center space-y-6 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f19] text-white'
      }`}>
        <span className="text-xs font-black tracking-widest text-purple-500 uppercase animate-pulse">
          PREPAREM-SE PARA O DUELO
        </span>

        <div className="flex items-center justify-center gap-6 sm:gap-12">
          {/* P1 */}
          <div className="space-y-2 animate-bounce">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/40 p-3 overflow-hidden">
              {renderDuelAvatar(p1State.avatar, user.photoURL, 'w-10 h-10 sm:w-12 sm:h-12 text-white')}
            </div>
            <span className={`text-base sm:text-lg font-black block truncate max-w-[120px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {p1State.name}
            </span>
          </div>

          {/* VS */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-rose-600/50 scale-125 animate-pulse">
            VS
          </div>

          {/* P2 */}
          <div className="space-y-2 animate-bounce">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/40 p-3 overflow-hidden">
              {renderDuelAvatar(p2State.avatar, undefined, 'w-10 h-10 sm:w-12 sm:h-12 text-white')}
            </div>
            <span className={`text-base sm:text-lg font-black block truncate max-w-[120px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {p2State.name}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-2xl border max-w-sm w-full ${
          isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'bg-[#121829] border-[#273553] text-slate-300'
        }`}>
          <p className="text-xs font-bold">
            {roundsCount} Rodadas • {timePerQuestion > 0 ? `${timePerQuestion}s por questão` : 'Sem tempo'}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE GAMEPLAY
  // =========================================================================
  if (step === 'playing') {
    return (
      <div className="flex-1 flex flex-col p-3 sm:p-4 max-w-3xl mx-auto w-full space-y-3.5 pb-28">
        {/* Live Scoreboard Header (P1 vs P2) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* P1 Scoreboard Card */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              activePlayerTurn === 1
                ? isLight
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]'
                  : 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50 scale-[1.02]'
                : isLight
                ? 'bg-white border-slate-200 opacity-80'
                : 'bg-[#121829]/60 border-[#273553] opacity-75'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {renderDuelAvatar(p1State.avatar, user.photoURL, 'w-4 h-4 text-white')}
                </div>
                <span className={`text-xs sm:text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p1State.name}</span>
              </div>
              <span className={`text-sm sm:text-base font-black font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                {p1State.score} <span className="text-[10px]">pts</span>
              </span>
            </div>
            <div className={`flex items-center justify-between text-[10px] font-bold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>{p1State.correctAnswers} acertos</span>
              {activePlayerTurn === 1 && (
                <span className={`font-black animate-pulse ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>SUA VEZ 🎯</span>
              )}
            </div>
          </div>

          {/* P2 Scoreboard Card */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              activePlayerTurn === 2
                ? isLight
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30 shadow-md scale-[1.02]'
                  : 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50 scale-[1.02]'
                : isLight
                ? 'bg-white border-slate-200 opacity-80'
                : 'bg-[#121829]/60 border-[#273553] opacity-75'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {renderDuelAvatar(p2State.avatar, undefined, 'w-4 h-4 text-white')}
                </div>
                <span className={`text-xs sm:text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p2State.name}</span>
              </div>
              <span className={`text-sm sm:text-base font-black font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                {p2State.score} <span className="text-[10px]">pts</span>
              </span>
            </div>
            <div className={`flex items-center justify-between text-[10px] font-bold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>{p2State.correctAnswers} acertos</span>
              {activePlayerTurn === 2 && (
                <span className={`font-black animate-pulse ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>SUA VEZ 🎯</span>
              )}
            </div>
          </div>
        </div>

        {/* Turn & Round Progress Bar */}
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Rodada {currentRoundIndex + 1}/{roundsCount}
            </span>
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              • Vez de <strong className={isLight ? 'text-purple-600' : 'text-purple-400'}>{activePlayer.name}</strong>
            </span>
          </div>

          {/* Time Remaining Indicator */}
          {timePerQuestion > 0 && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-black border ${
                timeLeft <= 5
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500 animate-pulse'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-[#161e31] text-slate-200 border-[#273553]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Question Box */}
        {currentQuestion && (
          <div className="space-y-3">
            <div className={`rounded-3xl border p-4 sm:p-5 space-y-3 shadow-lg relative ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
            }`}>
              {/* Question header info: Topic and Voice read button */}
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-[#161e31] border-[#273553] text-purple-300'
                }`}>
                  {currentQuestion.topic || 'Conhecimento Geral'}
                </span>

                <button
                  onClick={handleSpeakQuestion}
                  className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                    isSpeaking
                      ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-300'
                  }`}
                  title="Ouvir pergunta em voz alta"
                  aria-label="Ouvir pergunta"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                </button>
              </div>

              {/* Question statement */}
              <h2 className={`text-sm sm:text-base md:text-lg font-black leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQuestion.correctIndex;

                let optionStyles = isLight
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-purple-400'
                  : 'bg-[#121829] border-[#273553] text-slate-200 hover:bg-[#161e31] hover:border-purple-500/60';

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    optionStyles = isLight
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/50';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyles = isLight
                      ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold'
                      : 'bg-rose-950/70 border-rose-500 text-rose-100';
                  } else {
                    optionStyles = isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                      : 'bg-[#121829]/50 border-[#1e293b] text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] font-medium text-xs sm:text-sm cursor-pointer ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-[#161e31] border-[#273553] text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="min-w-0">{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer feedback banner & Next player advance */}
            {isAnswerSubmitted && (
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isCorrect
                      ? isLight
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-100'
                      : isLight
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-rose-950/80 border-rose-500/80 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{isCorrect ? '🎯' : '❌'}</span>
                    <div>
                      <span className="text-xs sm:text-sm font-black block">
                        {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta!'}
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {isCorrect
                          ? `+${pointsAwardedThisTurn} pontos para ${activePlayer.name}`
                          : 'Nenhum ponto marcado nesta rodada'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAdvanceTurn}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>
                      {activePlayerTurn === 1
                        ? `Vez de ${p2State.name}`
                        : currentRoundIndex + 1 < roundsCount
                        ? 'Próxima Rodada'
                        : 'Ver Resultado'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Explanation text */}
                {currentQuestion.explanation && (
                  <div className={`p-3 rounded-2xl border text-xs ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-[#0b0f19] border-[#273553] text-slate-300'
                  }`}>
                    <strong className={`block mb-0.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Explicação Didática:</strong>
                    {currentQuestion.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: MATCH FINAL RESULTS (WINNER / TIE)
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-xl mx-auto w-full space-y-4 pb-28 justify-center text-center">
      {/* Victory Celebration Effects */}
      <VictoryCelebration
        winnerName={winner?.name || 'Empate'}
        winnerAvatar="graduation-cap"
        scoreText={`Placar: ${p1State.score} x ${p2State.score}`}
        modeTitle="Duelo do Conhecimento 1v1"
        onPlayAgain={() => setStep('setup')}
        onHome={onBack}
      />

      {/* Trophy / Result Icon */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-2xl shadow-amber-500/40 mx-auto animate-bounce">
        {isTie ? <Users className="w-10 h-10 text-white" /> : <Trophy className="w-10 h-10 text-white" />}
      </div>

      <div className="space-y-1">
        <span className="text-xs font-black tracking-widest text-purple-500 uppercase">
          DUELO FINALIZADO
        </span>
        <h1 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {isTie ? 'Empate Épico!' : `Vitória de ${winner?.name}! 🎉`}
        </h1>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {isTie
            ? 'Ambos os jogadores mostraram um conhecimento incrível e empataram a pontuação!'
            : `${winner?.name} conquistou o título de campeão com ${winner?.score} pontos!`}
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* P1 Results */}
        <div
          className={`p-4 rounded-3xl border space-y-2 ${
            winner?.id === 'p1'
              ? isLight
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30'
                : 'bg-gradient-to-b from-indigo-950/80 to-[#121829] border-indigo-500 ring-2 ring-indigo-500/30'
              : isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#121829] border-[#273553]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md overflow-hidden p-2">
            {renderDuelAvatar(p1State.avatar, user.photoURL, 'w-8 h-8 text-white')}
          </div>
          <span className={`text-sm font-black block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p1State.name}</span>
          <div className={`text-xl sm:text-2xl font-black font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            {p1State.score} <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>pts</span>
          </div>
          <div className={`text-xs font-medium space-y-0.5 pt-1 border-t ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-[#1e293b] text-slate-400'
          }`}>
            <p>{p1State.correctAnswers}/{roundsCount} acertos</p>
            <p>{p1State.totalTimeSpent}s tempo total</p>
          </div>
          {winner?.id === 'p1' && (
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              👑 Campeão
            </span>
          )}
        </div>

        {/* P2 Results */}
        <div
          className={`p-4 rounded-3xl border space-y-2 ${
            winner?.id === 'p2'
              ? isLight
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-gradient-to-b from-rose-950/80 to-[#121829] border-rose-500 ring-2 ring-rose-500/30'
              : isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#121829] border-[#273553]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md overflow-hidden p-2">
            {renderDuelAvatar(p2State.avatar, undefined, 'w-8 h-8 text-white')}
          </div>
          <span className={`text-sm font-black block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p2State.name}</span>
          <div className={`text-xl sm:text-2xl font-black font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
            {p2State.score} <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>pts</span>
          </div>
          <div className={`text-xs font-medium space-y-0.5 pt-1 border-t ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-[#1e293b] text-slate-400'
          }`}>
            <p>{p2State.correctAnswers}/{roundsCount} acertos</p>
            <p>{p2State.totalTimeSpent}s tempo total</p>
          </div>
          {winner?.id === 'p2' && (
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              👑 Campeão
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Rematch / Back */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleStartDuel}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-900/30 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jogar Revanche ⚔️</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setStep('setup');
          }}
          className={`w-full py-3 rounded-2xl border font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-[#121829] hover:bg-[#161e31] border-[#273553] text-slate-200'
          }`}
        >
          Mudar Configurações de Jogadores
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            isLight
              ? 'bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              : 'bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white'
          }`}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};
