import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { GradeLevel, MultiplayerRoom, Question, UserProfile, GameRoomType, StopCategoryAnswers, SubjectId } from '../../types';
import {
  GRADE_LABELS,
  SUBJECTS,
  getQuestionsForMatch,
  getTiebreakerQuestions,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Play,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Crown,
  ChevronRight,
  Bot,
  Zap,
  Sparkles,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Gamepad2,
  Clock,
  Send,
  Flag,
} from 'lucide-react';

interface MultiplayerModeProps {
  user: UserProfile;
  onBack: () => void;
  onAnswerCorrect?: () => void;
  onMatchFinished?: (winnerIsUser: boolean, correctCount: number) => void;
  onEarnPoints?: (points: number, isMajor?: boolean, count?: number) => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
};

const STOP_CATEGORIES = [
  { id: 'cidade' as const, label: '🏙️ Cidade / País', placeholder: 'Ex: Brasil, Curitiba...' },
  { id: 'animal' as const, label: '🐾 Animal', placeholder: 'Ex: Baleia, Cachorro...' },
  { id: 'materia' as const, label: '📚 Matéria / Ciência', placeholder: 'Ex: Matemática, Biologia...' },
  { id: 'objeto' as const, label: '🎒 Objeto Escolar', placeholder: 'Ex: Caderno, Borracha...' },
  { id: 'verbo' as const, label: '⚡ Verbo / Ação', placeholder: 'Ex: Correr, Brincar...' },
];

const LOBBY_REACTIONS = ['🔥', '🚀', '🎉', '😎', '👑', '⚡', '👏', '🧠', '💯'];

export const MultiplayerMode: React.FC<MultiplayerModeProps> = ({
  user,
  onBack,
  onAnswerCorrect,
  onMatchFinished,
  onEarnPoints,
}) => {
  const [view, setView] = useState<'lobby_choice' | 'room_waiting' | 'in_match' | 'tiebreaker' | 'winner'>('lobby_choice');
  const [selectedGameType, setSelectedGameType] = useState<GameRoomType>('math');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('matematica');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [floatingReaction, setFloatingReaction] = useState<{ emoji: string; name: string } | null>(null);

  // Question answering state (for Math & Quiz modes)
  const [localPlayerQuestions, setLocalPlayerQuestions] = useState<Question[]>([]);
  const [localTiebreakerQuestions, setLocalTiebreakerQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(20);
  const [streak, setStreak] = useState(0);

  // Tiebreaker index
  const [tiebreakerIndex, setTiebreakerIndex] = useState(0);

  // Chess specific state
  const [chessSelectedSquare, setChessSelectedSquare] = useState<Square | null>(null);
  const [chessPossibleMoves, setChessPossibleMoves] = useState<string[]>([]);
  const [chessBoard, setChessBoard] = useState<Chess>(() => new Chess());

  // STOP specific state
  const [stopAnswers, setStopAnswers] = useState<StopCategoryAnswers>({
    cidade: '',
    animal: '',
    materia: '',
    objeto: '',
    verbo: '',
  });
  const [stopCountdownLeft, setStopCountdownLeft] = useState<number | null>(null);

  const pollIntervalRef = useRef<number | null>(null);
  const questionTimerRef = useRef<number | null>(null);
  const stopCountdownRef = useRef<number | null>(null);

  // Sync chess board with server state
  useEffect(() => {
    if (room?.chessState?.fen) {
      try {
        const c = new Chess(room.chessState.fen);
        setChessBoard(c);
      } catch {}
    }
  }, [room?.chessState?.fen]);

  // Main room polling loop
  useEffect(() => {
    if (room?.code && view !== 'lobby_choice') {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room.code}`);
          if (res.ok) {
            const data = await res.json();
            const updatedRoom: MultiplayerRoom = data.room;
            setRoom(updatedRoom);

            // Handle latest reaction
            if (updatedRoom.recentReactions && updatedRoom.recentReactions.length > 0) {
              const latest = updatedRoom.recentReactions[updatedRoom.recentReactions.length - 1];
              if (Date.now() - latest.timestamp < 3000) {
                setFloatingReaction({ emoji: latest.emoji, name: latest.playerName });
              }
            }

            // View state transitions
            if (updatedRoom.status === 'in_progress' && view === 'room_waiting') {
              soundEffects.playGameStart();
              setView('in_match');
              setCurrentQuestionIndex(0);
              setSelectedOption(null);
              setIsAnswerSubmitted(false);
              setQuestionTimer(20);
            } else if (updatedRoom.status === 'tiebreaker' && view === 'in_match') {
              setView('tiebreaker');
              setSelectedOption(null);
              setIsAnswerSubmitted(false);
            } else if (updatedRoom.status === 'finished' && view !== 'winner') {
              soundEffects.playVictory();
              setView('winner');
              const isWinner = updatedRoom.winnerId === myPlayerId;
              const myPlayer = updatedRoom.players.find((p) => p.id === myPlayerId);
              if (onMatchFinished) {
                onMatchFinished(isWinner, myPlayer?.score || 0);
              }
              if (onEarnPoints) {
                onEarnPoints(isWinner ? 50 : 25, true, 1);
              }
            }

            // Trigger AI Bot chess move if playing chess with a bot on bot's turn
            if (
              updatedRoom.gameType === 'chess' &&
              updatedRoom.status === 'in_progress' &&
              updatedRoom.chessState?.turn === 'b'
            ) {
              const blackPlayer = updatedRoom.players.find((p) => p.id === updatedRoom.chessState?.blackPlayerId);
              if (blackPlayer?.isBot) {
                fetch(`/api/rooms/${updatedRoom.code}/chess-bot-move`, { method: 'POST' }).catch(() => {});
              }
            }
          }
        } catch {
          // Silent catch for network polling
        }
      }, 1400);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [room?.code, view, myPlayerId, onMatchFinished, onEarnPoints]);

  // Question countdown timer for Math and Quiz
  useEffect(() => {
    if (view === 'in_match' && (room?.gameType === 'math' || room?.gameType === 'general') && !isAnswerSubmitted) {
      questionTimerRef.current = window.setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev <= 1) {
            handleAnswerQuestion(-1); // Time out = wrong
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
    };
  }, [view, currentQuestionIndex, isAnswerSubmitted, room?.gameType]);

  // STOP Countdown timer
  useEffect(() => {
    if (room?.gameType === 'stop' && room.stopState?.stopCountdownEnd && view === 'in_match') {
      stopCountdownRef.current = window.setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.stopState!.stopCountdownEnd! - Date.now()) / 1000));
        setStopCountdownLeft(remaining);
        if (remaining <= 0) {
          clearInterval(stopCountdownRef.current!);
          // Submit current answers
          handleStopSubmitAnswers();
        }
      }, 500);
    }

    return () => {
      if (stopCountdownRef.current) {
        clearInterval(stopCountdownRef.current);
        stopCountdownRef.current = null;
      }
    };
  }, [room?.stopState?.stopCountdownEnd, view]);

  // Create Room Handler
  const handleCreateRoom = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    const effectiveSubject = selectedGameType === 'math' ? 'matematica' : selectedSubject;
    const questions = getQuestionsForMatch(
      user.grade,
      10,
      'medium',
      effectiveSubject === 'all' ? undefined : effectiveSubject
    );
    const tiebreakers = getTiebreakerQuestions(
      user.grade,
      effectiveSubject === 'all' ? undefined : effectiveSubject
    );

    setLocalPlayerQuestions(questions);
    setLocalTiebreakerQuestions(tiebreakers);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user.name || 'Jogador 1',
          hostGrade: user.grade,
          hostAvatar: user.photoURL || 'graduation-cap',
          grade: user.grade,
          gameType: selectedGameType,
          subject: effectiveSubject,
          questions,
          tiebreakerQuestions: tiebreakers,
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar sala.');

      const data = await res.json();
      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setView('room_waiting');
    } catch {
      // Local fallback simulation room
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const prefix = selectedGameType === 'chess' ? 'XADREZ' : selectedGameType === 'stop' ? 'STOP' : 'MAT';
      const simRoom: MultiplayerRoom = {
        code: `${prefix}-${randomCode}`,
        grade: user.grade,
        gameType: selectedGameType,
        status: 'waiting',
        hostId: 'me',
        players: [
          {
            id: 'me',
            name: user.name || 'Eu (Anfitrião)',
            avatar: user.photoURL || 'graduation-cap',
            grade: user.grade,
            score: 0,
            errors: 0,
            currentQuestionIndex: 0,
            isReady: true,
            connected: true,
          },
        ],
        questions,
        tiebreakerQuestions: tiebreakers,
        currentQuestionIndex: 0,
        maxPlayers: selectedGameType === 'chess' ? 2 : 6,
        createdAt: Date.now(),
      };
      setRoom(simRoom);
      setMyPlayerId('me');
      setView('room_waiting');
    } finally {
      setIsLoading(false);
    }
  };

  // Join Room Handler
  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMessage('Por favor, digite o código da sala.');
      return;
    }

    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: joinCodeInput.trim().toUpperCase(),
          playerName: user.name || 'Amigo',
          playerGrade: user.grade,
          playerAvatar: user.photoURL || 'graduation-cap',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível entrar na sala.');
      }

      const joinedRoom: MultiplayerRoom = data.room;
      const roomSubject = joinedRoom.subject || (joinedRoom.gameType === 'math' ? 'matematica' : undefined);
      // Generate questions tailored to THIS player's own grade level matching the room's chosen subject!
      const myQuestions = getQuestionsForMatch(user.grade, 10, 'medium', roomSubject === 'all' ? undefined : roomSubject);
      const myTiebreakers = getTiebreakerQuestions(user.grade, roomSubject === 'all' ? undefined : roomSubject);
      setLocalPlayerQuestions(myQuestions);
      setLocalTiebreakerQuestions(myTiebreakers);

      setRoom(joinedRoom);
      setMyPlayerId(data.playerId);
      setView('room_waiting');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao entrar na sala. Verifique o código.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add AI Bot to Room
  const handleAddBot = async () => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/add-bot`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        soundEffects.playCorrect('combo');
      }
    } catch {}
  };

  // Kick/Remove Player or Bot
  const handleKickPlayer = async (targetPlayerId: string) => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostPlayerId: myPlayerId, targetPlayerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {}
  };

  // Send Reaction Emoji
  const handleSendReaction = async (emoji: string) => {
    if (!room) return;
    soundEffects.playReaction();
    setFloatingReaction({ emoji, name: user.name || 'Eu' });
    try {
      await fetch(`/api/rooms/${room.code}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId, emoji }),
      });
    } catch {}
  };

  // Start Room Match (Host only)
  const handleStartMatch = async () => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setView('in_match');
        soundEffects.playGameStart();
      }
    } catch {
      // Offline fallback
      setView('in_match');
    }
  };

  // Submit Answer for Quiz / Math
  const handleAnswerQuestion = async (optionIndex: number) => {
    if (isAnswerSubmitted || !room) return;

    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    const isTiebreaker = view === 'tiebreaker';
    const activeQuestions = isTiebreaker
      ? (localTiebreakerQuestions.length > 0 ? localTiebreakerQuestions : room.tiebreakerQuestions)
      : (localPlayerQuestions.length > 0 ? localPlayerQuestions : room.questions);
    const activeIndex = isTiebreaker ? tiebreakerIndex : currentQuestionIndex;
    const currentQ = activeQuestions[activeIndex];

    const isCorrect = optionIndex === currentQ?.correctIndex;

    if (isCorrect) {
      soundEffects.playCorrect(streak >= 2 ? 'combo' : 'standard');
      setStreak((s) => s + 1);
      if (onAnswerCorrect) onAnswerCorrect();
    } else {
      soundEffects.playError();
      setStreak(0);
    }

    try {
      const res = await fetch(`/api/rooms/${room.code}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: myPlayerId,
          isCorrect,
          questionIndex: activeIndex,
          isTiebreaker,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {}

    // Advance after brief feedback delay
    setTimeout(() => {
      if (isTiebreaker) {
        setTiebreakerIndex((i) => i + 1);
      } else {
        setCurrentQuestionIndex((i) => i + 1);
      }
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionTimer(20);
    }, 1200);
  };

  // --- CHESS INTERACTIONS ---
  const handleChessSquareClick = async (square: Square) => {
    if (!room?.chessState || room.status !== 'in_progress') return;

    const isWhite = room.chessState.whitePlayerId === myPlayerId;
    const isBlack = room.chessState.blackPlayerId === myPlayerId;
    const myColor = isWhite ? 'w' : isBlack ? 'b' : null;

    if (!myColor || room.chessState.turn !== myColor) return;

    // If square already selected and clicking another square -> attempt move
    if (chessSelectedSquare) {
      if (chessPossibleMoves.includes(square)) {
        try {
          soundEffects.playChessMove();
          const res = await fetch(`/api/rooms/${room.code}/chess-move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: myPlayerId,
              from: chessSelectedSquare,
              to: square,
              promotion: 'q',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setRoom(data.room);
          }
        } catch {}
      }
      setChessSelectedSquare(null);
      setChessPossibleMoves([]);
      return;
    }

    // Select piece
    const piece = chessBoard.get(square);
    if (piece && piece.color === myColor) {
      setChessSelectedSquare(square);
      const moves = chessBoard.moves({ square, verbose: true });
      setChessPossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    }
  };

  // --- STOP / ADEDONHA INTERACTIONS ---
  const handleStopCall = async () => {
    if (!room || !room.stopState) return;
    soundEffects.playBuzzerStop();
    try {
      const res = await fetch(`/api/rooms/${room.code}/stop-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId, answers: stopAnswers }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {}
  };

  const handleStopSubmitAnswers = async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.code}/stop-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId, answers: stopAnswers }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {}
  };

  const handleStopNextRound = async () => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/stop-next-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setStopAnswers({ cidade: '', animal: '', materia: '', objeto: '', verbo: '' });
      }
    } catch {}
  };

  // Rematch Handler
  const handleRematch = async () => {
    if (!room) return;
    soundEffects.playClick();
    const effectiveSubject = room.subject || (room.gameType === 'math' ? 'matematica' : undefined);
    const newQuestions = getQuestionsForMatch(
      user.grade,
      10,
      'medium',
      effectiveSubject === 'all' ? undefined : effectiveSubject
    );
    try {
      const res = await fetch(`/api/rooms/${room.code}/rematch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQuestions }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setView('in_match');
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setQuestionTimer(20);
        setStopAnswers({ cidade: '', animal: '', materia: '', objeto: '', verbo: '' });
      }
    } catch {
      setView('room_waiting');
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    soundEffects.playCorrect();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // =========================================================================
  // VIEW 1: LOBBY CHOICE (Stumble Guys Style Landing Screen)
  // =========================================================================
  if (view === 'lobby_choice') {
    const gameModes: { id: GameRoomType; title: string; desc: string; icon: string; badge: string; color: string }[] = [
      {
        id: 'math',
        title: 'Competição de Matemática Online ⚡',
        desc: 'Corrida de cálculo mental contra o relógio e amigos!',
        icon: '⚡',
        badge: 'Mais Popular 🔥',
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'chess',
        title: 'Xadrez 1v1 Competitivo ♟️',
        desc: 'Desafie amigos em tempo real ou jogue contra o Robô IA.',
        icon: '♟️',
        badge: 'Estratégia 🧠',
        color: 'from-slate-800 to-slate-950',
      },
      {
        id: 'general',
        title: 'Quiz Geral BNCC 🎓',
        desc: '10 perguntas das matérias da sua série com desempate surpresa.',
        icon: '📚',
        badge: 'Todas as Matérias 🌟',
        color: 'from-blue-600 to-indigo-700',
      },
    ];

    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 bg-slate-100 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-300 rounded-full text-amber-900 text-xs font-black shadow-xs">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Multiplayer Online</span>
          </div>
        </div>

        {/* Stumble Guys Party Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-20 text-8xl pointer-events-none select-none">
            🎮
          </div>
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3 h-3" />
              <span>Salas com Amigos & Robôs</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Arena Multiplayer Educativa</h2>
            <p className="text-xs text-blue-100 leading-snug">
              Crie uma sala privada, envie o código para seus amigos jogarem juntos ou adicione robôs inteligentes!
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-medium animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Escolha o Modo de Jogo da Sala:</span>
          </label>

          <div className="grid grid-cols-1 gap-2">
            {gameModes.map((m) => {
              const isSelected = selectedGameType === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedGameType(m.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition relative overflow-hidden active:scale-[0.99] flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-400'
                      : 'bg-white/80 border-slate-200 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl shadow-xs shrink-0 border border-slate-200">
                      {m.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{m.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.desc}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selector for Match Questions */}
        {selectedGameType !== 'chess' && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <label className="text-xs font-black uppercase tracking-wide text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                2. Matéria do Duelo X1:
              </span>
              <span className="text-[10px] text-blue-600 font-bold">100% fiel ao conteúdo</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'matematica' as const, label: 'Matemática', icon: '⚡' },
                { id: 'portugues' as const, label: 'Português', icon: '📖' },
                { id: 'ciencias' as const, label: 'Ciências', icon: '🔬' },
                { id: 'historia' as const, label: 'História', icon: '🏛️' },
                { id: 'geografia' as const, label: 'Geografia', icon: '🌍' },
                { id: 'ingles' as const, label: 'Inglês', icon: '🇬🇧' },
                { id: 'all' as const, label: 'Mistas (Geral)', icon: '🌟' },
              ].map((sub) => {
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubject(sub.id);
                      if (sub.id !== 'matematica' && selectedGameType === 'math') {
                        setSelectedGameType('general');
                      }
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action: Create Room Button */}
        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Criar Nova Sala com este Modo 🚀</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="shrink-0 mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Ou entrar com código
          </span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        {/* Join Room Form */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Entrar em uma Sala Existente:</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: MAT-1234, XADREZ-5678"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-xs font-black uppercase text-slate-900 tracking-wider placeholder:normal-case placeholder:font-medium placeholder:text-slate-400"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isLoading || !joinCodeInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Entrar</span>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: STUMBLE GUYS-STYLE PARTY ROOM LOBBY (`room_waiting`)
  // =========================================================================
  if (view === 'room_waiting' && room) {
    const isHost = room.hostId === myPlayerId;
    const canStart = room.players.length >= 1; // Can start with bots or friends

    const gameModeNames: Record<GameRoomType, string> = {
      math: '⚡ Matemática Rápida',
      chess: '♟️ Xadrez 1v1',
      stop: '🛑 STOP Escolar',
      general: '🎓 Quiz Geral BNCC',
      speed_reflex: '🎯 Desafio de Reflexo',
    };

    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 bg-slate-900 text-white max-w-lg mx-auto w-full relative min-h-screen">
        {/* Floating Emoji Particle */}
        {floatingReaction && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white px-3 py-1.5 rounded-full border border-slate-700 shadow-xl flex items-center gap-2 z-50 animate-bounce">
            <span className="text-2xl">{floatingReaction.emoji}</span>
            <span className="text-xs font-black text-amber-300">{floatingReaction.name}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              setView('lobby_choice');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sair da Sala</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Lobby Aberto</span>
          </div>
        </div>

        {/* Mode Tag */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
            Modo Selecionado
          </span>
          <h2 className="text-lg font-black text-white">{gameModeNames[room.gameType] || 'Modo Educativo'}</h2>
        </div>

        {/* Room Code Card (Stumble Guys style) */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-3xl text-center space-y-2.5 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Código da Sala para Convite
          </div>

          <div className="inline-flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-700/80 shadow-inner">
            <span className="text-2xl font-black text-amber-400 tracking-widest font-mono select-all">
              {room.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition active:scale-90"
              title="Copiar Código"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {copiedCode && (
            <p className="text-[11px] font-bold text-emerald-400 animate-in fade-in">
              Código copiado! Envie no WhatsApp ou chat para seu amigo entrar.
            </p>
          )}
        </div>

        {/* Party Stage / Player Podiums */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Jogadores no Palco ({room.players.length}/{room.maxPlayers})</span>
            </span>

            {isHost && room.players.length < room.maxPlayers && (
              <button
                onClick={handleAddBot}
                className="text-[11px] font-black text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 px-2.5 py-1 rounded-xl transition flex items-center gap-1 active:scale-95"
              >
                <Bot className="w-3 h-3" />
                <span>+ Robô IA</span>
              </button>
            )}
          </div>

          {/* Player Grid Pedestals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {room.players.map((p, idx) => {
              const isPlayerHost = p.id === room.hostId;
              const isMe = p.id === myPlayerId;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1.5 transition relative overflow-hidden ${
                    isMe
                      ? 'bg-blue-900/40 border-blue-400 ring-2 ring-blue-500/50 shadow-md'
                      : 'bg-slate-800/70 border-slate-700'
                  }`}
                >
                  {/* Host Crown */}
                  {isPlayerHost && (
                    <div className="absolute top-1.5 left-1.5 text-amber-400 text-xs font-black flex items-center gap-0.5">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Kick button for host */}
                  {isHost && !isPlayerHost && (
                    <button
                      onClick={() => handleKickPlayer(p.id)}
                      className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-400 text-[10px] p-1 rounded-md transition"
                      title="Remover"
                    >
                      ✕
                    </button>
                  )}

                  {/* Bouncing Avatar Pedestal */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center text-3xl shadow-md border border-slate-600 animate-bounce">
                    {p.avatar || '🎓'}
                  </div>

                  {/* Player Name */}
                  <div className="min-w-0 w-full px-1">
                    <span className="text-xs font-black text-white truncate block">
                      {p.name} {isMe && '(Você)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {p.isBot ? '🤖 Robô Amigo' : GRADE_LABELS[p.grade]?.short || 'Estudante'}
                    </span>
                  </div>

                  {/* Ready Indicator */}
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 Pronto
                  </span>
                </div>
              );
            })}

            {/* Empty Slot Card */}
            {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
              <div
                key={`empty_${i}`}
                className="p-3 rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[120px]"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-lg">
                  ⏳
                </div>
                <span className="text-[10px] font-bold text-slate-500">Aguardando jogador...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emoji Reactions Bar */}
        <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block text-center">
            Reações Rápidas no Lobby:
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {LOBBY_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-lg p-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 hover:scale-110 active:scale-95 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-2">
          {isHost ? (
            <button
              onClick={handleStartMatch}
              disabled={!canStart}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Partida Agora! 🚀</span>
            </button>
          ) : (
            <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Aguardando o Anfitrião iniciar a partida...
              </span>
              <p className="text-[11px] text-slate-400">Prepare-se para o desafio!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: IN MATCH (Mode Specific Gameplay)
  // =========================================================================
  if ((view === 'in_match' || view === 'tiebreaker') && room) {
    // -----------------------------------------------------------------------
    // MATCH TYPE A: XADREZ ONLINE 1v1
    // -----------------------------------------------------------------------
    if (room.gameType === 'chess' && room.chessState) {
      const isWhite = room.chessState.whitePlayerId === myPlayerId;
      const isBlack = room.chessState.blackPlayerId === myPlayerId;
      const isSpectator = !isWhite && !isBlack;
      const myColor = isWhite ? 'w' : isBlack ? 'b' : 'w';
      const isMyTurn = (room.chessState.turn === 'w' && isWhite) || (room.chessState.turn === 'b' && isBlack);

      const whitePlayer = room.players.find((p) => p.id === room.chessState?.whitePlayerId);
      const blackPlayer = room.players.find((p) => p.id === room.chessState?.blackPlayerId);

      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = myColor === 'b' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

      return (
        <div className="flex-1 flex flex-col p-4 space-y-3.5 bg-slate-900 text-white max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundEffects.playClick();
                setView('room_waiting');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lobby</span>
            </button>
            <div className="text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
              ♟️ Xadrez 1v1 Online
            </div>
          </div>

          {/* Opponent Info */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{blackPlayer?.avatar || '♟️'}</span>
              <div>
                <span className="text-xs font-black text-white">{blackPlayer?.name || 'Adversário (Negras)'}</span>
                <span className="text-[10px] text-slate-400 block">
                  Capturas: {room.chessState.capturedByBlack.map((p) => PIECE_SYMBOLS[p] || p).join(' ')}
                </span>
              </div>
            </div>
            {room.chessState.turn === 'b' && (
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 animate-pulse">
                Pensando...
              </span>
            )}
          </div>

          {/* Turn Alert */}
          <div
            className={`p-2 rounded-xl text-center text-xs font-black transition ${
              isMyTurn
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isMyTurn ? '👉 Sua vez de jogar!' : `Aguardando jogada de ${room.chessState.turn === 'w' ? 'Brancas' : 'Negras'}...`}
          </div>

          {/* Chess Board */}
          <div className="w-full aspect-square bg-slate-800 border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {ranks.map((rank) => (
              <div key={rank} className="flex-1 flex">
                {files.map((file) => {
                  const square = `${file}${rank}` as Square;
                  const piece = chessBoard.get(square);
                  const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 1;
                  const isSelected = chessSelectedSquare === square;
                  const isPossible = chessPossibleMoves.includes(square);

                  return (
                    <button
                      key={square}
                      onClick={() => handleChessSquareClick(square)}
                      className={`flex-1 flex items-center justify-center text-2xl sm:text-3xl font-serif select-none relative transition ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : isLight
                          ? 'bg-[#edd8b7] text-slate-900'
                          : 'bg-[#b88762] text-slate-900'
                      }`}
                    >
                      {piece && PIECE_SYMBOLS[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}

                      {/* Possible move dot */}
                      {isPossible && (
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500/80 ring-2 ring-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Me Info */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{whitePlayer?.avatar || '🎓'}</span>
              <div>
                <span className="text-xs font-black text-white">{whitePlayer?.name || 'Você (Brancas)'}</span>
                <span className="text-[10px] text-slate-400 block">
                  Capturas: {room.chessState.capturedByWhite.map((p) => PIECE_SYMBOLS[p.toUpperCase()] || p).join(' ')}
                </span>
              </div>
            </div>
            {room.chessState.turn === 'w' && (
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 animate-pulse">
                Sua vez
              </span>
            )}
          </div>
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // MATCH TYPE B: STOP / ADEDONHA ESCOLAR
    // -----------------------------------------------------------------------
    if (room.gameType === 'stop' && room.stopState) {
      const currentLetter = room.stopState.letter.toUpperCase();
      const isReviewing = room.stopState.isReviewing;
      const isHost = room.hostId === myPlayerId;

      return (
        <div className="flex-1 flex flex-col p-4 space-y-3.5 bg-slate-50 max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundEffects.playClick();
                setView('room_waiting');
              }}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lobby</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                🛑 STOP Escolar • Round {room.stopState.roundNumber}/{room.stopState.totalRounds}
              </span>
            </div>
          </div>

          {/* Letter Banner */}
          <div className="p-4 bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white rounded-3xl shadow-md text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">
              Letra da Rodada
            </span>
            <div className="text-5xl font-black tracking-widest font-mono drop-shadow-md">
              "{currentLetter}"
            </div>
            <p className="text-xs text-rose-100">
              Preencha palavras que comecem com a letra <strong>{currentLetter}</strong>!
            </p>
          </div>

          {/* Stop Countdown Warning */}
          {room.stopState.stoppedBy && !isReviewing && (
            <div className="p-3 bg-amber-500 text-slate-950 font-black rounded-2xl text-center space-y-0.5 shadow-md animate-pulse">
              <div className="text-sm">
                🛑 {room.stopState.stoppedByName || 'Alguém'} DEU STOP!
              </div>
              <div className="text-xs text-slate-900">
                Tempo restante para enviar: <strong>{stopCountdownLeft ?? 10}s</strong>
              </div>
            </div>
          )}

          {/* Review Mode vs Input Mode */}
          {isReviewing ? (
            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 text-center">
                📋 Resultado da Rodada com a Letra "{currentLetter}"
              </h3>

              <div className="space-y-2">
                {room.players.map((p) => {
                  const pAns = room.stopState?.playerAnswers[p.id];
                  const roundScore = room.stopState?.roundScores[p.id] || 0;

                  return (
                    <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                        </span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          +{roundScore} pts
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                        <div>🏙️: {pAns?.cidade || '—'}</div>
                        <div>🐾: {pAns?.animal || '—'}</div>
                        <div>📚: {pAns?.materia || '—'}</div>
                        <div>🎒: {pAns?.objeto || '—'}</div>
                        <div className="col-span-2">⚡: {pAns?.verbo || '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isHost ? (
                <button
                  onClick={handleStopNextRound}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition active:scale-95 shadow-xs"
                >
                  {room.stopState.roundNumber >= room.stopState.totalRounds
                    ? 'Ver Pódio Final 🏆'
                    : 'Próxima Rodada 🚀'}
                </button>
              ) : (
                <p className="text-center text-xs text-slate-500 font-medium">
                  Aguardando anfitrião avançar para a próxima rodada...
                </p>
              )}
            </div>
          ) : (
            /* Active Inputs */
            <div className="space-y-2.5">
              {STOP_CATEGORIES.map((cat) => {
                const val = stopAnswers[cat.id];
                const isValidStart = val.trim().length > 0 && val.trim()[0].toUpperCase() === currentLetter;

                return (
                  <div key={cat.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>{cat.label}</span>
                      {isValidStart && <span className="text-[10px] text-emerald-700 font-bold">🟢 Correto</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={cat.placeholder}
                      value={val}
                      onChange={(e) => setStopAnswers({ ...stopAnswers, [cat.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs font-bold text-slate-900"
                    />
                  </div>
                );
              })}

              {/* Big Red STOP Button */}
              <button
                onClick={handleStopCall}
                disabled={Boolean(room.stopState.stoppedBy)}
                className="w-full py-4 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition disabled:opacity-60"
              >
                <span>🛑 DAR STOP!</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // MATCH TYPE C: MATEMÁTICA RÁPIDA & QUIZ GERAL BNCC (Race Track)
    // -----------------------------------------------------------------------
    const isTiebreaker = view === 'tiebreaker';
    const activeQuestions = isTiebreaker
      ? (localTiebreakerQuestions.length > 0 ? localTiebreakerQuestions : room.tiebreakerQuestions)
      : (localPlayerQuestions.length > 0 ? localPlayerQuestions : room.questions);
    const activeIndex = isTiebreaker ? tiebreakerIndex : currentQuestionIndex;
    const currentQ = activeQuestions[activeIndex];

    return (
      <div className="flex-1 flex flex-col p-4 space-y-3.5 bg-slate-50 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              setView('room_waiting');
            }}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Questão {activeIndex + 1}/{activeQuestions.length}
            </span>
          </div>
        </div>

        {/* Race Track Visualization (Stumble Guys style) */}
        <div className="p-3 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500">
            <span>🏁 Pista de Corrida Ao Vivo</span>
            <span>Meta: 10 Acertos</span>
          </div>

          <div className="space-y-1.5">
            {room.players.map((p) => {
              const progressPct = Math.min(100, (p.currentQuestionIndex / (activeQuestions.length || 10)) * 100);
              const isMe = p.id === myPlayerId;

              return (
                <div key={p.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>{p.avatar}</span>
                      <span className={isMe ? 'font-black text-blue-700' : ''}>{p.name}</span>
                    </span>
                    <span className="text-xs font-black text-slate-900">{p.score} pts</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isMe ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-2 px-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                questionTimer <= 5 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(questionTimer / 20) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-slate-700">{questionTimer}s</span>
        </div>

        {/* Question Card */}
        {currentQ ? (
          <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                {currentQ.subject || 'Desafio'}
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-snug">{currentQ.question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-600 border-red-600 text-white font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuestion(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-3 rounded-2xl border text-xs text-left font-bold transition active:scale-[0.99] flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Calculando resultados da rodada...</p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: WINNER / PODIUM CELEBRATION (Stumble Guys Style Podium)
  // =========================================================================
  if (view === 'winner' && room) {
    const isWinner = room.winnerId === myPlayerId;
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const firstPlace = sortedPlayers[0];
    const secondPlace = sortedPlayers[1];
    const thirdPlace = sortedPlayers[2];

    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 bg-slate-900 text-white max-w-lg mx-auto w-full min-h-screen">
        <VictoryCelebration
          winnerName={firstPlace?.name || 'Vencedor'}
          winnerAvatar={firstPlace?.avatar || '🏆'}
          scoreText={`Pontos: ${firstPlace?.score || 0} pts`}
          modeTitle="Multiplayer Online"
          onHome={onBack}
        />

        {/* Top Header */}
        <div className="text-center space-y-1 pt-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            🏆 Fim de Partida!
          </span>
          <h2 className="text-2xl font-black text-white">Pódio dos Campeões</h2>
          <p className="text-xs text-slate-300">
            {isWinner ? '🎉 Parabéns! Você conquistou o 1º Lugar!' : 'Grande partida! Veja as colocações:'}
          </p>
        </div>

        {/* 3D-Styled Stumble Guys Podium */}
        <div className="pt-8 pb-4 flex items-end justify-center gap-2 max-w-sm mx-auto w-full">
          {/* 2nd Place */}
          {secondPlace && (
            <div className="flex-1 flex flex-col items-center space-y-1.5">
              <div className="text-2xl animate-bounce">{secondPlace.avatar}</div>
              <span className="text-xs font-black text-slate-200 truncate max-w-[80px]">
                {secondPlace.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{secondPlace.score} pts</span>
              <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-slate-600 to-slate-400 flex items-center justify-center font-black text-2xl text-slate-900 shadow-lg border-t-2 border-slate-300">
                🥈 2º
              </div>
            </div>
          )}

          {/* 1st Place (Center & Tallest) */}
          {firstPlace && (
            <div className="flex-1 flex flex-col items-center space-y-1.5 -mt-6">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
              <div className="text-4xl">{firstPlace.avatar}</div>
              <span className="text-xs font-black text-amber-300 truncate max-w-[90px]">
                {firstPlace.name}
              </span>
              <span className="text-xs font-black text-amber-400">{firstPlace.score} pts</span>
              <div className="w-full h-36 rounded-t-2xl bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center font-black text-3xl text-amber-950 shadow-2xl border-t-2 border-yellow-200">
                👑 1º
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="flex-1 flex flex-col items-center space-y-1.5">
              <div className="text-2xl animate-bounce">{thirdPlace.avatar}</div>
              <span className="text-xs font-black text-slate-200 truncate max-w-[80px]">
                {thirdPlace.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{thirdPlace.score} pts</span>
              <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-700 flex items-center justify-center font-black text-xl text-amber-200 shadow-md border-t-2 border-amber-600">
                🥉 3º
              </div>
            </div>
          )}
        </div>

        {/* Score Table */}
        <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-3xl space-y-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wide">
            Classificação Geral:
          </span>
          <div className="space-y-1.5">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono w-4">{idx + 1}º</span>
                  <span>{p.avatar}</span>
                  <span className="text-white">{p.name}</span>
                </div>
                <span className="text-amber-400 font-black">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleRematch}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente / Revanche 🔄</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setView('lobby_choice');
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
          >
            Voltar ao Menu Principal
          </button>
        </div>
      </div>
    );
  }

  return null;
};
