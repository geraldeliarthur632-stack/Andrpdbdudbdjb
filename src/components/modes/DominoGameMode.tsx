import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, SubjectId, UserProfile } from '../../types';
import { GRADE_LABELS, SUBJECTS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Bot,
  Users,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  Award,
  GraduationCap,
} from 'lucide-react';

interface DominoGameModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number, isMajor?: boolean, count?: number) => void;
  theme?: 'light' | 'dark';
}

export type DominoType = 'classic' | 'educational';
export type DominoOpponent = 'bot' | 'pass_and_play' | 'solo';

export interface DominoTile {
  id: string;
  left: number | string;
  right: number | string;
  leftLabel?: string;
  rightLabel?: string;
  isDouble?: boolean;
}

export interface PlacedTile {
  tile: DominoTile;
  placedLeft: number | string;
  placedRight: number | string;
  reversed?: boolean;
}

// Educational Domino content bank tailored to subjects
const EDUCATIONAL_DOMINO_SETS: Record<string, { a: string; b: string }[]> = {
  matematica: [
    { a: '7 × 8', b: '56' },
    { a: '9 × 6', b: '54' },
    { a: '12 × 12', b: '144' },
    { a: '√81', b: '9' },
    { a: '50% de 200', b: '100' },
    { a: '25% de 80', b: '20' },
    { a: '3³ (3 ao cubo)', b: '27' },
    { a: '2⁴ (2 a quarta)', b: '16' },
    { a: 'Ângulo Reto', b: '90°' },
    { a: 'Ângulo Raso', b: '180°' },
    { a: 'Fração 1/2', b: '0,5' },
    { a: 'Fração 3/4', b: '0,75' },
    { a: '15 ÷ 3', b: '5' },
    { a: '100 ÷ 4', b: '25' },
  ],
  ciencias: [
    { a: 'Fórmula da Água', b: 'H₂O' },
    { a: 'Gás da Respiração', b: 'Oxigênio (O₂)' },
    { a: 'Gás da Fotossíntese', b: 'Gás Carbônico (CO₂)' },
    { a: 'Usina de Energia Celular', b: 'Mitocôndria' },
    { a: 'Pigmento Verde das Plantas', b: 'Clorofila' },
    { a: 'Maior Órgão Humano', b: 'Pele' },
    { a: 'Planeta Vermelho', b: 'Marte' },
    { a: 'Centro do Sistema Solar', b: 'Sol' },
    { a: 'Decompositores', b: 'Fungos & Bactérias' },
    { a: 'Transmissor da Dengue', b: 'Aedes aegypti' },
    { a: 'Molécula da Genética', b: 'DNA' },
    { a: 'Satélite Natural da Terra', b: 'Lua' },
  ],
  portugues: [
    { a: 'Antônimo de Elogio', b: 'Crítica' },
    { a: 'Sinônimo de Feliz', b: 'Alegre' },
    { a: 'Oxítona Acentuada', b: 'Café' },
    { a: 'Paroxítona', b: 'Janela' },
    { a: 'Proparoxítona', b: 'Lâmpada' },
    { a: 'Figura: Vento Sussurrou', b: 'Personificação' },
    { a: 'Figura: Amor é Fogo', b: 'Metáfora' },
    { a: 'Substantivo Próprio', b: 'Brasil' },
    { a: 'Verbo no Passado', b: 'Estudou' },
    { a: 'Verbo no Futuro', b: 'Vencerá' },
    { a: 'Coletivo de Lobos', b: 'Alcateia' },
    { a: 'Coletivo de Peixes', b: 'Cardume' },
  ],
  historia: [
    { a: 'Independência do Brasil', b: '1822' },
    { a: 'Proclamação da República', b: '1889' },
    { a: 'Chegada dos Portugueses', b: '1500' },
    { a: 'Abolição da Escravidão', b: '1888' },
    { a: 'Primeiro Imperador do Brasil', b: 'D. Pedro I' },
    { a: 'Civilização dos Faraós', b: 'Egito Antigo' },
    { a: 'Berço da Democracia', b: 'Atenas (Grécia)' },
    { a: 'Invenção da Escrita', b: 'Mesopotâmia' },
    { a: 'Grito do Ipiranga', b: '7 de Setembro' },
    { a: 'Lei Áurea', b: 'Princesa Isabel' },
  ],
  geografia: [
    { a: 'Maior Bioma Brasileiro', b: 'Amazônia' },
    { a: 'Capital do Brasil', b: 'Brasília' },
    { a: 'Maior País do Mundo', b: 'Rússia' },
    { a: 'Linha que Divide a Terra', b: 'Equador' },
    { a: 'Clima do Nordeste', b: 'Semiárido' },
    { a: 'Maior Bacia Hidrográfica', b: 'Rio Amazonas' },
    { a: 'Continente do Brasil', b: 'América do Sul' },
    { a: 'Ponto Mais Alto do Brasil', b: 'Pico da Neblina' },
    { a: 'Vegetação de Caatinga', b: 'Cactos' },
    { a: 'Pico Mais Alto do Mundo', b: 'Monte Everest' },
  ],
};

// Generates 28 classic double-six domino tiles
function generateClassicDominoSet(): DominoTile[] {
  const tiles: DominoTile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push({
        id: `tile_${i}_${j}`,
        left: i,
        right: j,
        isDouble: i === j,
      });
    }
  }
  return tiles;
}

// Generates educational domino tiles where items chain concept -> value -> next concept
function generateEducationalDominoSet(subject: string): DominoTile[] {
  const items = EDUCATIONAL_DOMINO_SETS[subject] || EDUCATIONAL_DOMINO_SETS.matematica;
  const tiles: DominoTile[] = [];

  // Chain items so:
  // Tile 0: [Concept 0 | Answer 0]
  // Tile 1: [Answer 0  | Concept 1]
  // Tile 2: [Concept 1 | Answer 1]
  // ... and so on, creating a rich network of matchable connections!
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    const next = items[(i + 1) % items.length];

    // Direct card
    tiles.push({
      id: `edu_${i}_a`,
      left: cur.a,
      right: cur.b,
      leftLabel: 'Pergunta/Conceito',
      rightLabel: 'Resposta/Valor',
      isDouble: false,
    });

    // Connector card
    tiles.push({
      id: `edu_${i}_b`,
      left: cur.b,
      right: next.a,
      leftLabel: 'Resposta',
      rightLabel: 'Próximo Tema',
      isDouble: false,
    });
  }

  // Shuffle and limit to 24 tiles for balanced play
  return tiles.sort(() => Math.random() - 0.5).slice(0, 24);
}

export const DominoGameMode: React.FC<DominoGameModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Screen state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'game_over'>('menu');
  const [dominoType, setDominoType] = useState<DominoType>('educational');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('matematica');
  const [opponent, setOpponent] = useState<DominoOpponent>('bot');

  // Match state
  const [boardTiles, setBoardTiles] = useState<PlacedTile[]>([]);
  const [playerHand, setPlayerHand] = useState<DominoTile[]>([]);
  const [opponentHand, setOpponentHand] = useState<DominoTile[]>([]);
  const [boneyard, setBoneyard] = useState<DominoTile[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [winner, setWinner] = useState<'player' | 'opponent' | 'tie' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [score, setScore] = useState({ player: 0, opponent: 0 });

  // Board open ends
  const leftOpenEnd = boardTiles.length > 0 ? boardTiles[0].placedLeft : null;
  const rightOpenEnd = boardTiles.length > 0 ? boardTiles[boardTiles.length - 1].placedRight : null;

  // Initialize a fresh game
  const handleStartGame = () => {
    soundEffects.playClick();

    let allTiles: DominoTile[] = [];
    if (dominoType === 'classic') {
      allTiles = generateClassicDominoSet().sort(() => Math.random() - 0.5);
    } else {
      allTiles = generateEducationalDominoSet(selectedSubject);
    }

    // Lead tile in center of table
    const leadTile = allTiles.pop()!;
    const initialBoard: PlacedTile[] = [
      {
        tile: leadTile,
        placedLeft: leadTile.left,
        placedRight: leadTile.right,
      },
    ];

    // Deal 7 tiles each (or 6 if small set)
    const handSize = dominoType === 'classic' ? 7 : 6;
    const pHand = allTiles.splice(0, handSize);
    const oHand = opponent !== 'solo' ? allTiles.splice(0, handSize) : [];

    setBoardTiles(initialBoard);
    setPlayerHand(pHand);
    setOpponentHand(oHand);
    setBoneyard(allTiles);
    setCurrentTurn('player');
    setWinner(null);
    setStatusMessage('Sua vez! Toque em uma peça da sua mão que combine com as pontas da mesa.');
    setGameState('playing');
  };

  // Check if tile can connect to an end
  const canConnectLeft = (tile: DominoTile): boolean => {
    if (leftOpenEnd === null) return true;
    return String(tile.left) === String(leftOpenEnd) || String(tile.right) === String(leftOpenEnd);
  };

  const canConnectRight = (tile: DominoTile): boolean => {
    if (rightOpenEnd === null) return true;
    return String(tile.left) === String(rightOpenEnd) || String(tile.right) === String(rightOpenEnd);
  };

  // Play tile on Left end
  const playTileLeft = (tile: DominoTile, isPlayer: boolean) => {
    if (leftOpenEnd === null) return;

    let placedLeft: number | string;
    let placedRight: number | string;

    if (String(tile.right) === String(leftOpenEnd)) {
      placedLeft = tile.left;
      placedRight = tile.right;
    } else {
      placedLeft = tile.right;
      placedRight = tile.left;
    }

    const newPlaced: PlacedTile = {
      tile,
      placedLeft,
      placedRight,
    };

    setBoardTiles((prev) => [newPlaced, ...prev]);
    soundEffects.playCorrect();

    if (isPlayer) {
      setPlayerHand((prev) => prev.filter((t) => t.id !== tile.id));
      checkWinCondition(playerHand.length - 1, opponentHand.length, 'player');
    } else {
      setOpponentHand((prev) => prev.filter((t) => t.id !== tile.id));
      checkWinCondition(playerHand.length, opponentHand.length - 1, 'opponent');
    }
  };

  // Play tile on Right end
  const playTileRight = (tile: DominoTile, isPlayer: boolean) => {
    if (rightOpenEnd === null) return;

    let placedLeft: number | string;
    let placedRight: number | string;

    if (String(tile.left) === String(rightOpenEnd)) {
      placedLeft = tile.left;
      placedRight = tile.right;
    } else {
      placedLeft = tile.right;
      placedRight = tile.left;
    }

    const newPlaced: PlacedTile = {
      tile,
      placedLeft,
      placedRight,
    };

    setBoardTiles((prev) => [...prev, newPlaced]);
    soundEffects.playCorrect();

    if (isPlayer) {
      setPlayerHand((prev) => prev.filter((t) => t.id !== tile.id));
      checkWinCondition(playerHand.length - 1, opponentHand.length, 'player');
    } else {
      setOpponentHand((prev) => prev.filter((t) => t.id !== tile.id));
      checkWinCondition(playerHand.length, opponentHand.length - 1, 'opponent');
    }
  };

  // Player clicks a tile in hand
  const handleTileClick = (tile: DominoTile) => {
    if (currentTurn !== 'player' || isBotThinking) return;

    const matchesLeft = canConnectLeft(tile);
    const matchesRight = canConnectRight(tile);

    if (!matchesLeft && !matchesRight) {
      soundEffects.playError();
      setStatusMessage('Essa peça não encaixa em nenhuma das duas pontas da mesa!');
      return;
    }

    // Default to connecting to whichever matches; if both, connect to right
    if (matchesRight) {
      playTileRight(tile, true);
    } else {
      playTileLeft(tile, true);
    }
  };

  // Check if someone won
  const checkWinCondition = (
    pCount: number,
    oCount: number,
    lastPlayer: 'player' | 'opponent'
  ) => {
    if (pCount === 0) {
      setWinner('player');
      setScore((s) => ({ ...s, player: s.player + 1 }));
      setGameState('game_over');
      soundEffects.playVictoryFanfare();
      onEarnPoints?.(40, true, 1);
      return;
    }

    if (opponent !== 'solo' && oCount === 0) {
      setWinner('opponent');
      setScore((s) => ({ ...s, opponent: s.opponent + 1 }));
      setGameState('game_over');
      soundEffects.playError();
      return;
    }

    // Pass turn to next player
    if (opponent !== 'solo') {
      setCurrentTurn(lastPlayer === 'player' ? 'opponent' : 'player');
    } else {
      setStatusMessage('Peça encaixada! Continue conectando as peças da sua mão.');
    }
  };

  // Draw tile from boneyard ("Comprar no Dorme")
  const handleDrawTile = () => {
    if (boneyard.length === 0) {
      soundEffects.playError();
      setStatusMessage('O dorme está vazio! Não há mais peças para comprar.');
      return;
    }

    soundEffects.playClick();
    const nextBoneyard = [...boneyard];
    const drawn = nextBoneyard.pop()!;

    setBoneyard(nextBoneyard);
    if (currentTurn === 'player') {
      setPlayerHand((prev) => [...prev, drawn]);
      setStatusMessage(`Você comprou uma nova peça do dorme.`);
    } else {
      setOpponentHand((prev) => [...prev, drawn]);
    }
  };

  // Pass Turn
  const handlePassTurn = () => {
    soundEffects.playClick();
    if (opponent === 'solo') return;

    setStatusMessage('Você passou a vez.');
    setCurrentTurn('opponent');
  };

  // Bot Turn Automation
  useEffect(() => {
    if (gameState !== 'playing' || currentTurn !== 'opponent' || opponent !== 'bot') return;

    setIsBotThinking(true);
    setStatusMessage('Robô Edu está analisando o tabuleiro...');

    const timer = setTimeout(() => {
      // Find matching tile in bot's hand
      let movePlayed = false;

      for (const tile of opponentHand) {
        if (canConnectRight(tile)) {
          playTileRight(tile, false);
          movePlayed = true;
          break;
        } else if (canConnectLeft(tile)) {
          playTileLeft(tile, false);
          movePlayed = true;
          break;
        }
      }

      // If no valid move, bot draws or passes
      if (!movePlayed) {
        if (boneyard.length > 0) {
          const nextBoneyard = [...boneyard];
          const drawn = nextBoneyard.pop()!;
          setBoneyard(nextBoneyard);
          setOpponentHand((prev) => [...prev, drawn]);
          setStatusMessage('Robô Edu comprou uma peça do dorme...');

          // Try to play drawn tile immediately
          if (canConnectRight(drawn)) {
            playTileRight(drawn, false);
            movePlayed = true;
          } else if (canConnectLeft(drawn)) {
            playTileLeft(drawn, false);
            movePlayed = true;
          }
        }

        if (!movePlayed) {
          setStatusMessage('Robô Edu não tinha jogadas e passou a vez!');
          setCurrentTurn('player');
        }
      }

      setIsBotThinking(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentTurn, gameState, opponent, opponentHand, boardTiles]);

  // Check if player has any playable tiles in hand
  const playerHasMoves = playerHand.some(
    (t) => canConnectLeft(t) || canConnectRight(t)
  );

  // Render a domino tile with bone-white finish & center brass pin
  const renderTileComponent = (
    tile: DominoTile,
    onClick?: () => void,
    isPlayable = false,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const isClassic = typeof tile.left === 'number' && typeof tile.right === 'number';

    const sizeClasses =
      size === 'sm'
        ? 'w-14 h-24 text-[10px]'
        : size === 'lg'
        ? 'w-24 h-40 text-sm'
        : 'w-20 sm:w-22 h-32 sm:h-36 text-xs';

    return (
      <button
        key={tile.id}
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`relative flex flex-col rounded-2xl border-2 transition-all select-none shadow-md cursor-pointer ${sizeClasses} ${
          isPlayable
            ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/60 scale-105 active:scale-95 animate-pulse'
            : 'bg-white border-slate-300 hover:border-slate-400 active:scale-98'
        }`}
      >
        {/* Top Half */}
        <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-center font-black text-slate-900 overflow-hidden border-b border-slate-300/80 relative">
          {isClassic ? (
            <div className="flex items-center justify-center font-black text-lg text-slate-800">
              {renderPips(Number(tile.left))}
            </div>
          ) : (
            <span className="leading-tight line-clamp-3 text-[11px] font-bold text-slate-800">
              {tile.left}
            </span>
          )}
        </div>

        {/* Center Brass Spindle / Divisor Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border border-amber-700 shadow-xs z-10" />

        {/* Bottom Half */}
        <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-center font-black text-slate-900 overflow-hidden relative">
          {isClassic ? (
            <div className="flex items-center justify-center font-black text-lg text-slate-800">
              {renderPips(Number(tile.right))}
            </div>
          ) : (
            <span className="leading-tight line-clamp-3 text-[11px] font-bold text-indigo-700">
              {tile.right}
            </span>
          )}
        </div>
      </button>
    );
  };

  // Render pips for classic dominoes
  const renderPips = (n: number) => {
    if (n === 0) return <span className="text-slate-300 text-xs font-mono">—</span>;

    const pipArr = Array.from({ length: n });
    return (
      <div className="grid grid-cols-2 gap-1 p-1">
        {pipArr.map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-900" />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col p-3 sm:p-4 max-w-4xl mx-auto w-full min-h-screen ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      {/* ===================== VIEW 1: MENU & CONFIG ===================== */}
      {gameState === 'menu' && (
        <div className="flex-1 flex flex-col space-y-4 justify-between max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundEffects.playClick();
                onBack();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-white border border-slate-200 shadow-xs transition font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-black">
              <span>🀄 Modo Dominó</span>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white shadow-lg space-y-2 relative overflow-hidden">
            <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>Raciocínio & Estratégia</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Dominó do Saber 🀄</h1>
            <p className="text-xs text-amber-100 leading-relaxed">
              Conecte conceitos, resolva equações ou dispute o clássico duplo-seis contra o Robô Edu ou amigos!
            </p>
          </div>

          {/* Type Choice */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-slate-700">
              1. Escolha o Estilo do Dominó:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setDominoType('educational');
                }}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  dominoType === 'educational'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400 shadow-md'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">🎓</div>
                <div className="text-xs font-black text-slate-900">Dominó Educativo</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Conecte Perguntas com Respostas e Fórmulas da matéria
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setDominoType('classic');
                }}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  dominoType === 'classic'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400 shadow-md'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">🀄</div>
                <div className="text-xs font-black text-slate-900">Dominó Clássico (0-6)</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pedras tradicionais com pontos, buchas e pontuação
                </p>
              </button>
            </div>
          </div>

          {/* Educational Subject Selector (If Educational) */}
          {dominoType === 'educational' && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <label className="text-xs font-black uppercase tracking-wide text-slate-700 flex items-center justify-between">
                <span>2. Matéria do Dominó Educativo:</span>
                <span className="text-[10px] text-amber-700 font-bold">BNCC</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'matematica' as const, label: 'Matemática', icon: '⚡' },
                  { id: 'ciencias' as const, label: 'Ciências', icon: '🔬' },
                  { id: 'portugues' as const, label: 'Português', icon: '📖' },
                  { id: 'historia' as const, label: 'História', icon: '🏛️' },
                  { id: 'geografia' as const, label: 'Geografia', icon: '🌍' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubject(s.id);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border text-left cursor-pointer ${
                      selectedSubject === s.id
                        ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opponent Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide text-slate-700">
              {dominoType === 'educational' ? '3.' : '2.'} Escolha o Adversário:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bot' as const, label: 'Robô Edu (IA)', icon: <Bot className="w-4 h-4 text-purple-600" /> },
                { id: 'pass_and_play' as const, label: '2 Jogadores', icon: <Users className="w-4 h-4 text-blue-600" /> },
                { id: 'solo' as const, label: 'Desafio Solo', icon: <Trophy className="w-4 h-4 text-amber-600" /> },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setOpponent(op.id);
                  }}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    opponent === op.id
                      ? 'bg-white border-amber-500 ring-2 ring-amber-400 shadow-md font-black text-slate-900'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white font-bold'
                  }`}
                >
                  <div>{op.icon}</div>
                  <span className="text-xs">{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>INICIAR PARTIDA DE DOMINÓ</span>
          </button>
        </div>
      )}

      {/* ===================== VIEW 2: PLAYING BOARD ===================== */}
      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col space-y-3 justify-between">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameState('menu');
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sair</span>
            </button>

            {/* Score & Turn Banner */}
            <div className="flex items-center gap-3 text-xs font-black">
              <span className="flex items-center gap-1.5 text-slate-800">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>{user.name || 'Você'}: {playerHand.length} peças</span>
              </span>

              <span className="text-slate-400">VS</span>

              <span className="flex items-center gap-1.5 text-purple-700">
                {opponent === 'bot' ? (
                  <Bot className="w-4 h-4 text-purple-600" />
                ) : (
                  <Users className="w-4 h-4 text-purple-600" />
                )}
                <span>
                  {opponent === 'bot' ? 'Robô Edu' : 'Jogador 2'}: {opponentHand.length} peças
                </span>
              </span>
            </div>

            {/* Draw Pile Count */}
            <div className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Dorme: {boneyard.length}</span>
            </div>
          </div>

          {/* Status Message Banner */}
          <div
            className={`p-2.5 rounded-2xl text-xs font-bold text-center border shadow-xs transition-all ${
              currentTurn === 'player'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-purple-50 border-purple-200 text-purple-800'
            }`}
          >
            {statusMessage}
          </div>

          {/* Domino Board: The Chain of Linked Tiles */}
          <div className="flex-1 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 p-4 rounded-3xl border-4 border-amber-800/80 shadow-2xl flex flex-col justify-center overflow-x-auto min-h-[260px] relative">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200/80 mb-2 flex items-center justify-between">
              <span>Mesa de Jogo (Pontas Abertas)</span>
              <span>
                Ponta Esquerda: <strong>{String(leftOpenEnd)}</strong> | Ponta Direita:{' '}
                <strong>{String(rightOpenEnd)}</strong>
              </span>
            </div>

            {/* Placed Domino Chain */}
            <div className="flex items-center gap-2 py-4 px-2 overflow-x-auto justify-start sm:justify-center">
              {boardTiles.map((item, idx) => (
                <div key={idx} className="shrink-0 transition-transform animate-in zoom-in-95 duration-200">
                  {renderTileComponent(item.tile, undefined, false, 'sm')}
                </div>
              ))}
            </div>
          </div>

          {/* Player Hand Area */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span className="flex items-center gap-1.5">
                <span>Sua Mão de Peças ({playerHand.length})</span>
                {playerHasMoves && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] animate-pulse">
                    Peça disponível!
                  </span>
                )}
              </span>

              {/* Action buttons: Draw or Pass */}
              <div className="flex items-center gap-2">
                {boneyard.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleDrawTile}
                    disabled={currentTurn !== 'player' || isBotThinking}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Comprar no Dorme ({boneyard.length})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePassTurn}
                    disabled={currentTurn !== 'player' || isBotThinking}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <span>Passar a Vez</span>
                  </button>
                )}
              </div>
            </div>

            {/* Player Tiles Hand (Horizontal scrolling shelf) */}
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1">
              {playerHand.map((tile) => {
                const isPlayable =
                  currentTurn === 'player' && (canConnectLeft(tile) || canConnectRight(tile));

                return (
                  <div key={tile.id} className="shrink-0">
                    {renderTileComponent(tile, () => handleTileClick(tile), isPlayable, 'md')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: GAME OVER CELEBRATION ===================== */}
      {gameState === 'game_over' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 max-w-md mx-auto w-full text-center">
          {winner === 'player' && (
            <VictoryCelebration
              winnerName={user.name || 'Jogador'}
              winnerAvatar="graduation-cap"
              scoreText={`Pontuação: ${score.player} pts`}
              modeTitle="Dominó do Saber"
              onPlayAgain={() => handleStartGame()}
              onHome={onBack}
            />
          )}

          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border ${
              winner === 'player'
                ? 'bg-amber-100 border-amber-300 text-amber-600 animate-bounce'
                : 'bg-slate-200 border-slate-300 text-slate-600'
            }`}
          >
            {winner === 'player' ? <Trophy className="w-10 h-10 text-amber-600" /> : <Users className="w-10 h-10 text-slate-600" />}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              {winner === 'player' ? 'VOCÊ BATEU O DOMINÓ!' : 'FIM DA PARTIDA!'}
            </h2>
            <p className="text-xs text-slate-600">
              {winner === 'player'
                ? 'Parabéns! Você jogou todas as suas peças com maestria e ganhou +40 Pontos XP!'
                : 'O adversário conseguiu bater primeiro desta vez. Que tal uma revanche?'}
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 w-full shadow-xs space-y-2 text-xs font-bold text-slate-700">
            <div className="flex justify-between border-b pb-1.5">
              <span>Placar de Vitórias:</span>
              <span className="font-black text-amber-700">
                Você: {score.player} | Adversário: {score.opponent}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tipo da Partida:</span>
              <span>{dominoType === 'classic' ? 'Dominó Clássico (0-6)' : `Educativo (${selectedSubject})`}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState('menu')}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Voltar ao Menu</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
