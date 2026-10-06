import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { UserProfile, MultiplayerRoom, DifficultyLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { VictoryCelebration } from '../VictoryCelebration';
import { ChessTheoryModal } from '../ChessTheoryModal';
import { ChessVideoPlayer } from './ChessVideoPlayer';
import { ChessPieceSvg } from '../ChessPieceSvg';
import {
  CHESS_PUZZLES,
  CHESS_THEORY_GUIDES,
  ChessPuzzle,
} from '../../data/chessAcademyData';
import {
  ArrowLeft,
  Users,
  Bot,
  Globe2,
  Copy,
  Check,
  RotateCcw,
  Flag,
  Loader2,
  Sparkles,
  Lightbulb,
  Puzzle,
  Swords,
  ChevronRight,
  ChevronLeft,
  Award,
  BookOpen,
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldAlert,
  Crown,
  Tv,
} from 'lucide-react';

interface ChessModeProps {
  user: UserProfile;
  onBack: () => void;
  difficulty?: DifficultyLevel;
  onEarnPoints?: (points: number, isChallengeCompleted?: boolean) => void;
  initialTab?: 'videos' | 'puzzles' | 'bot' | 'local' | 'multiplayer' | 'sandbox';
}

// Unicode Chess Pieces map
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

export const ChessMode: React.FC<ChessModeProps> = ({
  user,
  onBack,
  difficulty = 'medium',
  onEarnPoints,
  initialTab = 'videos',
}) => {
  const [activeTab, setActiveTab] = useState<
    'videos' | 'puzzles' | 'bot' | 'local' | 'multiplayer' | 'sandbox'
  >(initialTab);

  const [selectedVideoLessonId, setSelectedVideoLessonId] = useState<string | undefined>(undefined);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState<boolean>(false);

  // New customization options for chess visibility
  const [boardTheme, setBoardTheme] = useState<'wood' | 'green' | 'blue' | 'slate'>(() => {
    try {
      return (localStorage.getItem('estudahud_chess_board_theme') as any) || 'wood';
    } catch {
      return 'wood';
    }
  });

  const [pieceStyle, setPieceStyle] = useState<'hd_vector' | 'giant_emoji'>(() => {
    try {
      return (localStorage.getItem('estudahud_chess_piece_style') as any) || 'hd_vector';
    } catch {
      return 'hd_vector';
    }
  });

  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const saveBoardTheme = (t: 'wood' | 'green' | 'blue' | 'slate') => {
    setBoardTheme(t);
    try {
      localStorage.setItem('estudahud_chess_board_theme', t);
    } catch {}
  };

  const savePieceStyle = (s: 'hd_vector' | 'giant_emoji') => {
    setPieceStyle(s);
    try {
      localStorage.setItem('estudahud_chess_piece_style', s);
    } catch {}
  };

  const BOARD_THEME_CONFIGS = {
    wood: {
      name: 'Madeira Clássica',
      light: 'bg-[#f0d9b5] text-amber-950',
      dark: 'bg-[#b58863] text-amber-50',
      frame: 'bg-[#5c3a21] border-[#3b2515]',
    },
    green: {
      name: 'Verde Torneio',
      light: 'bg-[#e8edcc] text-emerald-950',
      dark: 'bg-[#779952] text-emerald-50',
      frame: 'bg-[#1e3a1e] border-[#132713]',
    },
    blue: {
      name: 'Azul Oceano',
      light: 'bg-[#dee3e6] text-slate-950',
      dark: 'bg-[#6287a2] text-blue-50',
      frame: 'bg-[#1e293b] border-[#0f172a]',
    },
    slate: {
      name: 'Alto Contraste',
      light: 'bg-[#f1f5f9] text-slate-950',
      dark: 'bg-[#475569] text-white',
      frame: 'bg-[#0f172a] border-[#020617]',
    },
  };

  // Stop narration on unmount or tab change
  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  useEffect(() => {
    speechNarrator.stop();
  }, [activeTab]);

  // =========================================================================
  // 2. PUZZLES TÁTICOS NO TABULEIRO
  // =========================================================================
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const currentPuzzle: ChessPuzzle = CHESS_PUZZLES[puzzleIndex] || CHESS_PUZZLES[0];
  const [puzzleChess, setPuzzleChess] = useState<Chess>(() => new Chess(currentPuzzle.fen));
  const [puzzleSelectedSquare, setPuzzleSelectedSquare] = useState<Square | null>(null);
  const [puzzlePossibleMoves, setPuzzlePossibleMoves] = useState<string[]>([]);
  const [puzzleSolved, setPuzzleSolved] = useState<boolean>(false);
  const [puzzleError, setPuzzleError] = useState<boolean>(false);
  const [showPuzzleHint, setShowPuzzleHint] = useState<boolean>(false);

  useEffect(() => {
    const newChess = new Chess(currentPuzzle.fen);
    setPuzzleChess(newChess);
    setPuzzleSelectedSquare(null);
    setPuzzlePossibleMoves([]);
    setPuzzleSolved(false);
    setPuzzleError(false);
    setShowPuzzleHint(false);
  }, [puzzleIndex]);

  const handlePuzzleSquareClick = (square: Square) => {
    if (puzzleSolved) return;

    if (puzzleSelectedSquare) {
      if (puzzleSelectedSquare === square) {
        setPuzzleSelectedSquare(null);
        setPuzzlePossibleMoves([]);
        return;
      }

      try {
        const move = puzzleChess.move({
          from: puzzleSelectedSquare,
          to: square,
          promotion: currentPuzzle.winningMove.promotion || 'q',
        });

        if (move) {
          setPuzzleSelectedSquare(null);
          setPuzzlePossibleMoves([]);

          const isWin =
            (move.from === currentPuzzle.winningMove.from && move.to === currentPuzzle.winningMove.to) ||
            currentPuzzle.alternativeWinningMoves?.some((m) => m.from === move.from && m.to === move.to);

          if (isWin) {
            soundEffects.playCorrect('bonus');
            soundEffects.playChessCapture();
            setPuzzleSolved(true);
            setPuzzleError(false);
            onEarnPoints?.(currentPuzzle.points, true);
          } else {
            soundEffects.playError();
            setPuzzleError(true);
            // Undo move after brief delay
            setTimeout(() => {
              puzzleChess.undo();
              setPuzzleChess(new Chess(puzzleChess.fen()));
              setPuzzleError(false);
            }, 800);
          }
          return;
        }
      } catch {
        soundEffects.playError();
      }
    }

    const piece = puzzleChess.get(square);
    if (piece && piece.color === currentPuzzle.turn) {
      setPuzzleSelectedSquare(square);
      const moves = puzzleChess.moves({ square, verbose: true });
      setPuzzlePossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    } else {
      setPuzzleSelectedSquare(null);
      setPuzzlePossibleMoves([]);
    }
  };

  const handleResetPuzzle = () => {
    soundEffects.playClick();
    const newChess = new Chess(currentPuzzle.fen);
    setPuzzleChess(newChess);
    setPuzzleSelectedSquare(null);
    setPuzzlePossibleMoves([]);
    setPuzzleSolved(false);
    setPuzzleError(false);
  };

  const handleNextPuzzle = () => {
    soundEffects.playClick();
    if (puzzleIndex + 1 < CHESS_PUZZLES.length) {
      setPuzzleIndex((prev) => prev + 1);
    }
  };

  // =========================================================================
  // 3. PARTIDA NO TABULEIRO (Vs Robô Tutor / Local / Sandbox)
  // =========================================================================
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameChess, setGameChess] = useState<Chess>(() => new Chess());
  const [gameSelectedSquare, setGameSelectedSquare] = useState<Square | null>(null);
  const [gamePossibleMoves, setGamePossibleMoves] = useState<string[]>([]);
  const [gameCapturedWhite, setGameCapturedWhite] = useState<string[]>([]);
  const [gameCapturedBlack, setGameCapturedBlack] = useState<string[]>([]);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [tutorTip, setTutorTip] = useState<string | null>(null);

  const handleResetGame = () => {
    soundEffects.playClick();
    const newGame = new Chess();
    setGameChess(newGame);
    setGameSelectedSquare(null);
    setGamePossibleMoves([]);
    setGameCapturedWhite([]);
    setGameCapturedBlack([]);
    setGameWinner(null);
    setGameOverReason(null);
    setIsBotThinking(false);
    setTutorTip(null);
  };

  const handleUndoMove = () => {
    soundEffects.playClick();
    if (activeTab === 'bot') {
      // Undo bot move + user move
      gameChess.undo();
      gameChess.undo();
    } else {
      gameChess.undo();
    }
    setGameChess(new Chess(gameChess.fen()));
    setGameSelectedSquare(null);
    setGamePossibleMoves([]);
    setGameWinner(null);
  };

  const generateTutorTip = () => {
    soundEffects.playClick();
    if (gameChess.isGameOver()) {
      setTutorTip('A partida já terminou!');
      return;
    }

    const moves = gameChess.moves({ verbose: true });
    if (moves.length === 0) return;

    // Tactical checks
    const mateMove = moves.find((m) => m.san.includes('#'));
    if (mateMove) {
      setTutorTip(`🎯 Existe um XEQUE-MATE no tabuleiro! Verifique lances com a casa ${mateMove.to}!`);
      return;
    }

    const captureMove = moves.find((m) => m.captured);
    if (captureMove) {
      setTutorTip(`⚔️ Dica de Ataque: Você tem a oportunidade de capturar uma peça em ${captureMove.to}!`);
      return;
    }

    const checkMove = moves.find((m) => m.san.includes('+'));
    if (checkMove) {
      setTutorTip(`👑 Dica: Você pode dar XEQUE no Rei adversário movendo para ${checkMove.to}!`);
      return;
    }

    const centerMove = moves.find((m) => ['d4', 'e4', 'd5', 'e5', 'c4', 'f4'].includes(m.to));
    if (centerMove) {
      setTutorTip(`🛡️ Princípio Estratégico: Ocupe ou ataque o CENTRO do tabuleiro (${centerMove.to}) para maior controle!`);
      return;
    }

    const developMove = moves.find((m) => ['N', 'B'].includes(m.piece.toUpperCase()));
    if (developMove) {
      setTutorTip(`🐴 Desenvolvimento: Mova suas peças leves (Cavalos e Bispos) para o jogo! Ex: ${developMove.san}.`);
      return;
    }

    setTutorTip('💡 Procure proteger seu Rei, conectar suas Torres e manter suas peças coordenadas!');
  };

  const handleGameSquareClick = (square: Square) => {
    if (gameWinner || isBotThinking) return;

    if (gameSelectedSquare) {
      if (gameSelectedSquare === square) {
        setGameSelectedSquare(null);
        setGamePossibleMoves([]);
        return;
      }

      try {
        const move = gameChess.move({
          from: gameSelectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          if (move.captured) {
            soundEffects.playChessCapture();
            if (move.color === 'w') {
              setGameCapturedBlack((prev) => [...prev, move.captured!]);
            } else {
              setGameCapturedWhite((prev) => [...prev, move.captured!]);
            }
          } else {
            soundEffects.playChessMove();
          }

          if (gameChess.inCheck()) {
            soundEffects.playChessCheck();
          }

          setGameSelectedSquare(null);
          setGamePossibleMoves([]);
          setTutorTip(null);

          // Check End
          if (gameChess.isCheckmate()) {
            const winner = move.color === 'w' ? 'Brancas' : 'Pretas';
            setGameWinner(winner);
            setGameOverReason('Xeque-mate!');
            onEarnPoints?.(50, true);
            return;
          } else if (gameChess.isDraw()) {
            setGameWinner('Empate');
            setGameOverReason('Empate por afogamento ou repetição.');
            onEarnPoints?.(25, true);
            return;
          }

          // If playing vs Bot and Black's turn
          if (activeTab === 'bot' && gameChess.turn() === 'b') {
            setIsBotThinking(true);
            setTimeout(() => {
              makeBotMove();
            }, 600);
          }
          return;
        }
      } catch {
        // Not a legal move
      }
    }

    const piece = gameChess.get(square);
    if (piece) {
      if (activeTab === 'bot' && piece.color !== 'w') return;
      if (activeTab === 'local' && piece.color !== gameChess.turn()) return;

      setGameSelectedSquare(square);
      const moves = gameChess.moves({ square, verbose: true });
      setGamePossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    } else {
      setGameSelectedSquare(null);
      setGamePossibleMoves([]);
    }
  };

  const makeBotMove = () => {
    if (gameChess.isGameOver()) return;

    const moves = gameChess.moves({ verbose: true });
    if (moves.length === 0) return;

    let chosenMove = moves[0];

    if (botDifficulty === 'easy') {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (botDifficulty === 'medium') {
      const captures = moves.filter((m) => m.captured);
      const checks = moves.filter((m) => m.san.includes('+'));
      if (captures.length > 0) {
        chosenMove = captures[Math.floor(Math.random() * captures.length)];
      } else if (checks.length > 0) {
        chosenMove = checks[Math.floor(Math.random() * checks.length)];
      } else {
        chosenMove = moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      const pieceValues: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
      let bestScore = -100;
      for (const m of moves) {
        let score = 0;
        if (m.captured) score += (pieceValues[m.captured] || 1) * 10;
        if (m.san.includes('+')) score += 5;
        if (['d4', 'd5', 'e4', 'e5'].includes(m.to)) score += 2;
        if (score > bestScore) {
          bestScore = score;
          chosenMove = m;
        }
      }
    }

    try {
      const move = gameChess.move(chosenMove);
      if (move) {
        if (move.captured) {
          soundEffects.playChessCapture();
          setGameCapturedWhite((prev) => [...prev, move.captured!]);
        } else {
          soundEffects.playChessMove();
        }

        if (gameChess.inCheck()) {
          soundEffects.playChessCheck();
        }

        if (gameChess.isCheckmate()) {
          setGameWinner('Robô (Pretas)');
          setGameOverReason('Xeque-mate do computador!');
        } else if (gameChess.isDraw()) {
          setGameWinner('Empate');
          setGameOverReason('Empate no tabuleiro!');
        }
      }
    } catch {}
    setIsBotThinking(false);
  };

  // =========================================================================
  // 4. MULTIPLAYER ONLINE CHESS
  // =========================================================================
  const [mpView, setMpView] = useState<'lobby' | 'waiting' | 'in_game' | 'finished'>('lobby');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeTab === 'multiplayer' && room?.code && mpView !== 'lobby') {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room.code}`);
          if (res.ok) {
            const data = await res.json();
            setRoom(data.room);

            if (data.room.status === 'in_progress' && mpView === 'waiting') {
              setMpView('in_game');
            } else if (data.room.status === 'finished' && mpView === 'in_game') {
              setMpView('finished');
            }
          }
        } catch {}
      }, 1200);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeTab, room?.code, mpView]);

  const handleCreateMpRoom = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user.name || 'Jogador 1',
          hostGrade: user.grade,
          hostAvatar: user.photoURL || 'graduation-cap',
          gameType: 'chess',
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar sala de xadrez');

      const data = await res.json();
      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setMpView('waiting');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMpRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMessage('Digite o código da sala de xadrez (ex: XADREZ-1234).');
      soundEffects.playError();
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
          playerName: user.name || 'Desafiante',
          playerGrade: user.grade,
          playerAvatar: user.photoURL || 'graduation-cap',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar na sala.');

      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setMpView('in_game');
    } catch (err: any) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Sala não encontrada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSquareClickMp = async (square: Square) => {
    if (!room || !room.chessState || room.status !== 'in_progress') return;

    const isWhite = room.chessState.whitePlayerId === myPlayerId;
    const myColor = isWhite ? 'w' : 'b';
    const isMyTurn = room.chessState.turn === myColor;

    if (!isMyTurn) return;

    const chess = new Chess(room.chessState.fen);

    if (gameSelectedSquare) {
      if (gameSelectedSquare === square) {
        setGameSelectedSquare(null);
        setGamePossibleMoves([]);
        return;
      }

      try {
        const res = await fetch(`/api/rooms/${room.code}/chess-move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: myPlayerId,
            from: gameSelectedSquare,
            to: square,
            promotion: 'q',
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setRoom(data.room);
          setGameSelectedSquare(null);
          setGamePossibleMoves([]);

          if (data.move?.captured) {
            soundEffects.playChessCapture();
          } else {
            soundEffects.playChessMove();
          }

          if (data.room.chessState?.isCheck) {
            soundEffects.playChessCheck();
          }

          if (data.room.status === 'finished') {
            setMpView('finished');
          }
        } else {
          soundEffects.playError();
          setGameSelectedSquare(null);
          setGamePossibleMoves([]);
        }
      } catch {
        soundEffects.playError();
      }
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === myColor) {
      setGameSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setGamePossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    }
  };

  // =========================================================================
  // UNIVERSAL CHESSBOARD RENDERER (Crisp, High Contrast, Responsive)
  // =========================================================================
  const renderInteractiveBoard = (
    chess: Chess,
    selectedSq: Square | null,
    possibleMvs: string[],
    onSquareClick: (sq: Square) => void,
    targetSquares?: Square[],
    isCheck: boolean = false
  ) => {
    let board = chess.board();
    let ranks = [8, 7, 6, 5, 4, 3, 2, 1];
    let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    if (isFlipped) {
      board = [...board].reverse().map((row) => [...row].reverse());
      ranks = [1, 2, 3, 4, 5, 6, 7, 8];
      files = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    }

    const currentTheme = BOARD_THEME_CONFIGS[boardTheme] || BOARD_THEME_CONFIGS.wood;

    return (
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Customization Options Bar */}
        <div className="w-full max-w-[400px] flex items-center justify-between gap-1 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-[11px] shadow-sm">
          {/* Themes */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-bold hidden sm:inline">Tema:</span>
            {(['wood', 'green', 'blue', 'slate'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  soundEffects.playClick();
                  saveBoardTheme(t);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                  boardTheme === t
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={BOARD_THEME_CONFIGS[t].name}
              >
                {t === 'wood' ? '🪵 Madeira' : t === 'green' ? '🟢 Torneio' : t === 'blue' ? '🌊 Azul' : '⚪ Grafite'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Piece Style Toggle */}
            <button
              onClick={() => {
                soundEffects.playClick();
                savePieceStyle(pieceStyle === 'hd_vector' ? 'giant_emoji' : 'hd_vector');
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] transition cursor-pointer"
              title="Alternar estilo visual das peças"
            >
              {pieceStyle === 'hd_vector' ? '🎨 Peças HD' : '👑 Símbolos'}
            </button>

            {/* Invert Board */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsFlipped((prev) => !prev);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Girar Tabuleiro (Brancas/Pretas)"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Board Frame */}
        <div
          className={`w-full max-w-[390px] sm:max-w-[420px] aspect-square mx-auto p-2 sm:p-2.5 rounded-2xl border-4 shadow-2xl flex flex-col justify-between select-none ${currentTheme.frame}`}
        >
          {board.map((row, rIdx) => {
            const rank = ranks[rIdx];
            return (
              <div key={rank} className="flex-1 flex">
                {row.map((piece, fIdx) => {
                  const currentFile = files[fIdx];
                  const squareName = `${currentFile}${rank}` as Square;
                  const isLight = (rIdx + fIdx) % 2 === 0;
                  const isSelected = selectedSq === squareName;
                  const isPossible = possibleMvs.includes(squareName);
                  const isTarget = targetSquares?.includes(squareName);
                  const isPieceKing = piece?.type === 'k' && piece?.color === chess.turn();
                  const isKingInCheck = isPieceKing && isCheck;

                  return (
                    <button
                      key={squareName}
                      id={`chess-sq-${squareName}`}
                      onClick={() => onSquareClick(squareName)}
                      className={`flex-1 relative flex items-center justify-center transition-all ${
                        isLight ? currentTheme.light : currentTheme.dark
                      } ${
                        isSelected
                          ? 'ring-4 ring-amber-400 ring-inset bg-amber-300/80 z-10'
                          : isKingInCheck
                          ? 'ring-4 ring-rose-500 ring-inset bg-rose-600/70 animate-pulse'
                          : ''
                      } active:scale-95`}
                    >
                      {/* Rank & File Coordinates */}
                      {fIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-0.5 text-[8px] font-black pointer-events-none opacity-70 ${
                            isLight ? 'text-black' : 'text-white'
                          }`}
                        >
                          {rank}
                        </span>
                      )}
                      {rIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-0.5 text-[8px] font-black pointer-events-none opacity-70 ${
                            isLight ? 'text-black' : 'text-white'
                          }`}
                        >
                          {currentFile}
                        </span>
                      )}

                      {/* Target Goal Star */}
                      {isTarget && !piece && (
                        <span className="text-amber-400 text-lg sm:text-xl animate-bounce drop-shadow">⭐</span>
                      )}

                      {/* Valid Move Indicator Dot */}
                      {isPossible && !piece && (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400/90 shadow-md ring-2 ring-amber-200" />
                      )}

                      {/* Valid Capture Ring */}
                      {isPossible && piece && (
                        <div className="absolute inset-0.5 sm:inset-1 rounded-sm border-2 sm:border-3 border-rose-500 bg-rose-500/30 pointer-events-none z-10" />
                      )}

                      {/* Piece Symbol - Rendered with High Contrast Vector SVG */}
                      {piece && (
                        <div className="w-[88%] h-[88%] flex items-center justify-center pointer-events-none transition-transform">
                          <ChessPieceSvg
                            type={piece.type}
                            color={piece.color}
                            pieceStyle={pieceStyle}
                            className="w-full h-full max-w-[42px] max-h-[42px]"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col p-3 sm:p-4 bg-slate-50 ${activeTab === 'videos' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-lg'} mx-auto w-full transition-all`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsTheoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-bold shadow-2xs transition active:scale-95"
            title="Abrir Guia Pedagógico de Todas as Jogadas e Regras"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Guia de Jogadas</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold shadow-xs">
            <span>♟️ Tabuleiro</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-xl mb-3 text-xs overflow-x-auto scrollbar-none">
        {/* TAB 0: VÍDEOS YOUTUBE (Playlist Oficial & Aulas 1 a 8) */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('videos');
          }}
          className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Tv className={`w-3.5 h-3.5 ${activeTab === 'videos' ? 'text-white' : 'text-rose-600'}`} />
          <span>Aulas em Vídeo</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('puzzles');
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'puzzles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5 text-blue-700" />
          <span>Puzzles</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('bot');
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'bot' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-700" />
          <span>Robô Tutor</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('local');
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'local' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-700" />
          <span>2 Jogadores</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('multiplayer');
          }}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'multiplayer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-sky-700" />
          <span>Online</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 0: VÍDEO-AULAS NO YOUTUBE COM REPRODUTOR INTEGRADO NO APP
      ========================================================================= */}
      {activeTab === 'videos' && (
        <ChessVideoPlayer
          initialLessonId={selectedVideoLessonId}
          onEarnPoints={onEarnPoints}
          onGoToBoard={() => setActiveTab('bot')}
        />
      )}

      {/* =========================================================================
          TAB 1: PUZZLES TÁTICOS NO TABULEIRO
      ========================================================================= */}
      {activeTab === 'puzzles' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">{currentPuzzle.title}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab('videos');
                  }}
                  className="text-[10px] font-black px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center gap-1 transition cursor-pointer"
                >
                  <Tv className="w-3 h-3" />
                  <span>Vídeos</span>
                </button>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full">
                  {puzzleIndex + 1}/{CHESS_PUZZLES.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Jogam as <strong>{currentPuzzle.turn === 'w' ? 'Brancas (♔)' : 'Pretas (♚)'}</strong>
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowPuzzleHint((prev) => !prev);
                }}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showPuzzleHint ? 'Esconder Dica' : 'Ver Dica'}</span>
              </button>
            </div>

            <p className="text-xs font-bold text-slate-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
              🎯 Objetivo: {currentPuzzle.objective}
            </p>

            {showPuzzleHint && (
              <p className="text-xs text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200">
                💡 <strong>Dica:</strong> {currentPuzzle.hint}
              </p>
            )}
          </div>

          {/* Puzzle Board */}
          {renderInteractiveBoard(
            puzzleChess,
            puzzleSelectedSquare,
            puzzlePossibleMoves,
            handlePuzzleSquareClick
          )}

          {/* Puzzle Result Status */}
          {puzzleSolved ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-center space-y-2 animate-fadeIn shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-black text-sm">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Excelente Lance! +{currentPuzzle.points} pts</span>
              </div>
              <p className="text-xs text-emerald-800">{currentPuzzle.explanation}</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleResetPuzzle}
                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir</span>
                </button>
                {puzzleIndex + 1 < CHESS_PUZZLES.length && (
                  <button
                    onClick={handleNextPuzzle}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Próximo Puzzle</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1">
              <button
                onClick={handleResetPuzzle}
                className="py-2 px-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>

              <button
                onClick={handleNextPuzzle}
                disabled={puzzleIndex + 1 >= CHESS_PUZZLES.length}
                className="py-2 px-3 bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
              >
                <span>Pular Puzzle</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3 & 4: PARTIDA VS ROBÔ TUTOR OU 2 JOGADORES
      ========================================================================= */}
      {(activeTab === 'bot' || activeTab === 'local') && (
        <div className="space-y-3">
          {/* Status and Controls */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    gameChess.turn() === 'w' ? 'bg-amber-200 ring-2 ring-amber-500' : 'bg-slate-900 ring-2 ring-slate-600'
                  }`}
                />
                <span className="text-xs font-black text-slate-900">
                  {activeTab === 'bot'
                    ? gameChess.turn() === 'w'
                      ? 'Sua Vez (Brancas)'
                      : isBotThinking
                      ? 'Robô Pensando...'
                      : 'Vez do Robô Tutor'
                    : `Vez das ${gameChess.turn() === 'w' ? 'Brancas' : 'Pretas'}`}
                </span>
              </div>

              {activeTab === 'bot' && (
                <div className="flex items-center gap-1">
                  {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        soundEffects.playClick();
                        setBotDifficulty(lvl);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        botDifficulty === lvl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lvl === 'easy' ? 'Fácil' : lvl === 'medium' ? 'Médio' : 'Mestre'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check Alert */}
            {gameChess.inCheck() && (
              <div className="py-1 px-2.5 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 text-xs font-black text-center animate-pulse">
                ⚠️ REI EM XEQUE! O Rei deve escapar ou ser protegido!
              </div>
            )}

            {/* Tutor Tip Button */}
            {activeTab === 'bot' && (
              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={generateTutorTip}
                  className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  <span>Pedir Dica ao Tutor</span>
                </button>

                <button
                  onClick={handleUndoMove}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Desfazer</span>
                </button>
              </div>
            )}

            {tutorTip && (
              <p className="text-xs text-amber-950 bg-amber-50 p-2.5 rounded-xl border border-amber-200 animate-fadeIn">
                {tutorTip}
              </p>
            )}
          </div>

          {/* Board */}
          {renderInteractiveBoard(
            gameChess,
            gameSelectedSquare,
            gamePossibleMoves,
            handleGameSquareClick,
            undefined,
            gameChess.inCheck()
          )}

          {/* Captured Pieces */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500">Capturadas:</span>
              {gameCapturedBlack.map((p, i) => (
                <div key={i} className="w-5 h-5 flex items-center justify-center">
                  <ChessPieceSvg type={p} color="b" className="w-full h-full" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {gameCapturedWhite.map((p, i) => (
                <div key={i} className="w-5 h-5 flex items-center justify-center">
                  <ChessPieceSvg type={p} color="w" className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Game Over Modal */}
          {gameWinner && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-2 shadow-sm animate-fadeIn">
              <h4 className="font-black text-slate-900 text-base">{gameOverReason}</h4>
              <p className="text-xs font-bold text-amber-900">Vencedor: {gameWinner}</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleResetGame}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Nova Partida
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: MULTIPLAYER ONLINE CHESS
      ========================================================================= */}
      {activeTab === 'multiplayer' && (
        <div className="space-y-4">
          {mpView === 'lobby' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                  ♔
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Xadrez Multiplayer Online</h3>
                  <p className="text-xs text-slate-500">Jogue com amigos em tempo real com código de sala</p>
                </div>
              </div>

              <button
                onClick={handleCreateMpRoom}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
                <span>Criar Nova Sala (Você será Brancas)</span>
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Ou entrar em sala existente:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: XADREZ-1234"
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleJoinMpRoom}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
                  >
                    Entrar
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 font-bold">
                  {errorMessage}
                </p>
              )}
            </div>
          )}

          {mpView === 'waiting' && room && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-xs">
              <h3 className="font-black text-slate-900 text-sm">Aguardando oponente entrar...</h3>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                <span className="text-base font-mono font-black text-blue-900">{room.code}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(room.code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="p-1 text-slate-600 hover:text-slate-900"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Envie o código acima para seu amigo entrar na partida!</p>
            </div>
          )}

          {mpView === 'in_game' && room && room.chessState && (
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Partida: {room.players[0]?.name} vs {room.players[1]?.name || 'Adversário'}
                </span>
                <span className="font-bold text-blue-700">
                  Vez de: {room.chessState.turn === 'w' ? 'Brancas' : 'Pretas'}
                </span>
              </div>

              {renderInteractiveBoard(
                new Chess(room.chessState.fen),
                gameSelectedSquare,
                gamePossibleMoves,
                handleSquareClickMp,
                undefined,
                room.chessState.isCheck
              )}
            </div>
          )}
        </div>
      )}

      {/* Pedagogical Chess Theory Explainer Modal */}
      <ChessTheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
        onOpenVideos={(lessonId) => {
          if (lessonId) {
            setSelectedVideoLessonId(lessonId);
          }
          setActiveTab('videos');
          setIsTheoryModalOpen(false);
        }}
      />
    </div>
  );
};
