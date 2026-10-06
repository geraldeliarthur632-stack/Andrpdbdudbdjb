import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Star,
  Timer,
  Award,
  Zap,
  Volume2,
  CheckCircle2,
  Brain,
  Globe,
  Calculator,
  FlaskConical,
  BookOpen,
  Compass,
} from 'lucide-react';

export type MemoryCategory = 'languages' | 'math' | 'science' | 'portuguese' | 'history';
export type MemoryDifficulty = 'easy' | 'medium' | 'hard' | 'master';

interface MemoryCard {
  id: string;
  pairId: string;
  display: string;
  subtext?: string;
  icon?: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameModeProps {
  user?: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number, isMajor?: boolean) => void;
}

const CATEGORIES: {
  id: MemoryCategory;
  name: string;
  icon: any;
  color: string;
  description: string;
}[] = [
  {
    id: 'languages',
    name: 'Espanhol & Italiano',
    icon: Globe,
    color: 'from-amber-500 to-orange-600',
    description: 'Vocabulário do zero (palavras úteis, saudações e significados)',
  },
  {
    id: 'math',
    name: 'Matemática & Fórmulas',
    icon: Calculator,
    color: 'from-blue-600 to-indigo-600',
    description: 'Tabuada rápida, raízes, potências e geometria',
  },
  {
    id: 'science',
    name: 'Ciências & Natureza',
    icon: FlaskConical,
    color: 'from-emerald-600 to-teal-600',
    description: 'Fórmulas químicas, biologia e leis da física',
  },
  {
    id: 'portuguese',
    name: 'Português & Gramática',
    icon: BookOpen,
    color: 'from-purple-600 to-pink-600',
    description: 'Classes de palavras, tonicidade e figuras de linguagem',
  },
  {
    id: 'history',
    name: 'História & Geografia',
    icon: Compass,
    color: 'from-rose-600 to-amber-600',
    description: 'Datas marcantes, capitais, monumentos e relevos',
  },
];

const DIFFICULTY_CONFIG: Record<
  MemoryDifficulty,
  { label: string; pairsCount: number; points: number; gridCols: string }
> = {
  easy: { label: 'Fácil (4 Pares)', pairsCount: 4, points: 25, gridCols: 'grid-cols-2 sm:grid-cols-4' },
  medium: { label: 'Médio (6 Pares)', pairsCount: 6, points: 45, gridCols: 'grid-cols-3 sm:grid-cols-4' },
  hard: { label: 'Difícil (8 Pares)', pairsCount: 8, points: 70, gridCols: 'grid-cols-4 sm:grid-cols-4' },
  master: { label: 'Mestre (10 Pares)', pairsCount: 10, points: 100, gridCols: 'grid-cols-4 sm:grid-cols-5' },
};

// Database of educational card pairs
const MEMORY_PAIRS_DATA: Record<
  MemoryCategory,
  { a: string; b: string; subA?: string; subB?: string; explanation: string }[]
> = {
  languages: [
    { a: '¡Hola!', b: 'Oi / Olá', subA: 'Espanhol', subB: 'Português', explanation: '¡Hola! significa Oi ou Olá em Espanhol.' },
    { a: 'Gracias', b: 'Obrigado', subA: 'Espanhol', subB: 'Português', explanation: 'Gracias significa Obrigado em Espanhol.' },
    { a: 'Ciao', b: 'Olá / Tchau', subA: 'Italiano', subB: 'Português', explanation: 'Ciao serve tanto para dar Olá quanto para se despedir em Italiano.' },
    { a: 'Grazie', b: 'Muito Obrigado', subA: 'Italiano', subB: 'Português', explanation: 'Grazie é a forma clássica de agradecer em Italiano.' },
    { a: 'Por favor', b: 'Por favore', subA: 'Espanhol', subB: 'Italiano', explanation: 'Por favor em Espanhol e Per favore em Italiano.' },
    { a: 'El Niño', b: 'O Menino', subA: 'Espanhol', subB: 'Português', explanation: 'El niño significa o menino em espanhol.' },
    { a: 'La Famiglia', b: 'A Família', subA: 'Italiano', subB: 'Português', explanation: 'La famiglia significa a família em italiano.' },
    { a: 'Rojo', b: 'Vermelho', subA: 'Espanhol', subB: 'Português', explanation: 'Rojo é a cor vermelha em espanhol.' },
    { a: 'Burro', b: 'Manteiga', subA: 'Italiano (Falso Amigo)', subB: 'Português', explanation: 'Atenção: Burro em Italiano significa Manteiga de passar no pão!' },
    { a: 'Buonanotte', b: 'Boa Noite', subA: 'Italiano', subB: 'Português', explanation: 'Buonanotte é boa noite ao ir dormir em italiano.' },
    { a: 'Desayuno', b: 'Café da Manhã', subA: 'Espanhol', subB: 'Português', explanation: 'Desayuno é o café da manhã em espanhol.' },
    { a: 'Arrivederci', b: 'Até Logo', subA: 'Italiano', subB: 'Português', explanation: 'Arrivederci significa até logo ou adeus em italiano.' },
  ],
  math: [
    { a: '7 × 8', b: '56', subA: 'Multiplicação', subB: 'Resultado', explanation: 'Sete vezes oito é igual a cinquenta e seis.' },
    { a: '√81', b: '9', subA: 'Raiz Quadrada', subB: 'Valor', explanation: 'A raiz quadrada de 81 é 9, pois 9 vezes 9 é 81.' },
    { a: '3² + 4²', b: '25', subA: 'Pitágoras (9+16)', subB: 'Hipotenusa ao Quadrado', explanation: '3 ao quadrado mais 4 ao quadrado resulta em 25, famoso triângulo 3, 4, 5.' },
    { a: '12 × 5', b: '60', subA: 'Cálculo Rápido', subB: 'Produto', explanation: 'Doze vezes cinco é igual a sessenta.' },
    { a: '20% de 200', b: '40', subA: 'Porcentagem', subB: 'Valor Final', explanation: 'Vinte por cento de duzentos é igual a quarenta.' },
    { a: '1/2 em Decimal', b: '0,5', subA: 'Fração', subB: 'Número Decimal', explanation: 'A metade, ou um sobre dois, corresponde a zero vírgula cinco.' },
    { a: '9 × 9', b: '81', subA: 'Potência 9²', subB: 'Produto', explanation: 'Nove vezes nove é igual a oitenta e um.' },
    { a: '10³', b: '1.000', subA: '10 ao Cubo', subB: 'Milhar', explanation: 'Dez elevado ao cubo é igual a mil.' },
    { a: 'Ângulo Reto', b: '90°', subA: 'Geometria', subB: 'Medida Exata', explanation: 'Um ângulo reto mede exatamente noventa graus.' },
    { a: 'Círculo Completo', b: '360°', subA: 'Circunferência', subB: 'Graus Totais', explanation: 'Uma volta completa no círculo tem trezentos e sessenta graus.' },
    { a: '√144', b: '12', subA: 'Raiz Quadrada', subB: 'Valor', explanation: 'A raiz quadrada de 144 é 12.' },
    { a: '3/4 em Porcentagem', b: '75%', subA: 'Fração Três Quartos', subB: 'Porcentagem', explanation: 'Três quartos representam setenta e cinco por cento.' },
  ],
  science: [
    { a: 'H₂O', b: 'Água', subA: 'Fórmula Química', subB: 'Composto Vital', explanation: 'H2O é a fórmula química da água.' },
    { a: 'Fotossíntese', b: 'Glicose e O₂', subA: 'Processo Vegetal', subB: 'Produtos Criados', explanation: 'Na fotossíntese as plantas usam luz para produzir glicose e oxigênio.' },
    { a: 'Mitocôndria', b: 'Respiração Celular', subA: 'Organela', subB: 'Função Energética (ATP)', explanation: 'A mitocôndria é responsável pela produção de energia e respiração celular.' },
    { a: 'Símbolo Fe', b: 'Ferro', subA: 'Tabela Periódica', subB: 'Metal Essencial', explanation: 'Fe é o símbolo químico do ferro.' },
    { a: 'Gravidade Terrestre', b: '9,8 m/s²', subA: 'Física', subB: 'Aceleração', explanation: 'A aceleração da gravidade na Terra é de aproximadamente 9,8 metros por segundo ao quadrado.' },
    { a: 'DNA', b: 'Código Genético', subA: 'Ácido Desoxirribonucléico', subB: 'Hereditariedade', explanation: 'O DNA contém o código genético de todos os seres vivos.' },
    { a: 'CO₂', b: 'Dióxido de Carbono', subA: 'Gás Estufa', subB: 'Química', explanation: 'CO2 é o dióxido de carbono, liberado na nossa respiração.' },
    { a: 'Planeta Vermelho', b: 'Marte', subA: 'Astronomia', subB: '4º Planeta', explanation: 'Marte é chamado de planeta vermelho devido ao óxido de ferro em seu solo.' },
    { a: 'Clorofila', b: 'Pigmento Verde', subA: 'Botânica', subB: 'Absorve Luz', explanation: 'A clorofila é o pigmento que dá a cor verde às plantas e capta luz solar.' },
    { a: 'Velocidade da Luz', b: '300.000 km/s', subA: 'No Vácuo', subB: 'Constante c', explanation: 'A luz viaja a trezentos mil quilômetros por segundo no vácuo.' },
  ],
  portuguese: [
    { a: 'Oxítona', b: 'Última sílaba forte', subA: 'Ex: Café, Cipó', subB: 'Regra de Tonicidade', explanation: 'Oxítona é a palavra cuja última sílaba é a mais forte.' },
    { a: 'Paroxítona', b: 'Penúltima sílaba forte', subA: 'Ex: Mesa, Fácil', subB: 'Maioria no Português', explanation: 'Paroxítona é a palavra com a penúltima sílaba tônica.' },
    { a: 'Proparoxítona', b: 'Antepenúltima forte', subA: 'Ex: Lâmpada, Pássaro', subB: 'Todas Levam Acento', explanation: 'Proparoxítona é a palavra com a antepenúltima sílaba forte, e todas são acentuadas.' },
    { a: 'Substantivo', b: 'Dá nome aos seres', subA: 'Classe Gramatical', subB: 'Ex: Casa, Cachorro', explanation: 'Substantivo é a classe de palavras que dá nome aos seres e objetos.' },
    { a: 'Verbo', b: 'Indica ação ou estado', subA: 'Classe Gramatical', subB: 'Ex: Estudar, Ser', explanation: 'Verbo expressa ação, estado, mudança de estado ou fenômeno da natureza.' },
    { a: 'Adjetivo', b: 'Qualidade ou defeito', subA: 'Característica', subB: 'Ex: Inteligente, Azul', explanation: 'Adjetivo é a palavra que caracteriza ou qualifica o substantivo.' },
    { a: 'Sinônimo de Efêmero', b: 'Passageiro / Breve', subA: 'Vocabulário Culto', subB: 'Mesmo Significado', explanation: 'Efêmero significa algo que dura pouco tempo, passageiro.' },
    { a: 'Antônimo de Escasso', b: 'Abundante / Farto', subA: 'Sentido Oposto', subB: 'Grande Quantidade', explanation: 'O antônimo de escasso é abundante.' },
    { a: 'Hiato', b: 'Duas vogais separadas', subA: 'Ex: Sa-ú-de', subB: 'Encontro Vocálico', explanation: 'Hiato ocorre quando duas vogais ficam em sílabas vizinhas separadas.' },
    { a: 'Ditongo', b: 'Vogal + Semivogal juntas', subA: 'Ex: Noite, Peixe', subB: 'Na Mesma Sílaba', explanation: 'Ditongo é o encontro de uma vogal e semivogal na mesma sílaba.' },
  ],
  history: [
    { a: 'Capital do Brasil', b: 'Brasília', subA: 'Geografia', subB: 'Distrito Federal', explanation: 'Brasília foi inaugurada em 1960 pelo presidente Juscelino Kubitschek.' },
    { a: 'Descobrimento do Brasil', b: 'Ano 1500', subA: 'História', subB: 'Pedro Álvares Cabral', explanation: 'A chegada dos portugueses ao Brasil ocorreu no ano de 1500.' },
    { a: 'Independência do Brasil', b: '1822 (7 de Setembro)', subA: 'Grito do Ipiranga', subB: 'Dom Pedro I', explanation: 'A Independência do Brasil foi proclamada em 7 de setembro de 1822.' },
    { a: 'Maior Rio do Mundo', b: 'Rio Amazonas', subA: 'Volume e Extensão', subB: 'América do Sul', explanation: 'O Rio Amazonas é o maior rio em volume de água e extensão do planeta.' },
    { a: 'Coliseu', b: 'Roma Antiga', subA: 'Anfiteatro Flávio', subB: 'Itália', explanation: 'O Coliseu é um dos monumentos mais famosos do Império Romano.' },
    { a: 'Pirâmides de Gizé', b: 'Egito Antigo', subA: 'Quéops, Quéfren, Miquerinos', subB: 'Faraós', explanation: 'As pirâmides do Egito foram construídas há mais de 4500 anos como tumbas dos faraós.' },
    { a: 'Queda do Muro de Berlim', b: 'Ano 1989', subA: 'Guerra Fria', subB: 'Reunificação da Alemanha', explanation: 'A queda do Muro de Berlim em 1989 simbolizou o fim da Guerra Fria.' },
    { a: 'Maior País do Mundo', b: 'Rússia', subA: 'Área Territorial', subB: '17 milhões de km²', explanation: 'A Rússia é o maior país do mundo em extensão territorial.' },
    { a: 'Monte Everest', b: '8.848 metros', subA: 'Ponto Mais Alto', subB: 'Cordilheira do Himalaia', explanation: 'O Monte Everest é a montanha de maior altitude da Terra, com 8848 metros.' },
    { a: 'Tratado de Tordesilhas', b: 'Ano 1494', subA: 'Portugal e Espanha', subB: 'Divisão do Novo Mundo', explanation: 'O Tratado de Tordesilhas dividiu as terras descobertas entre Portugal e Espanha em 1494.' },
  ],
};

const CARD_COLORS = [
  'bg-blue-600/90 border-blue-400',
  'bg-emerald-600/90 border-emerald-400',
  'bg-purple-600/90 border-purple-400',
  'bg-amber-600/90 border-amber-400',
  'bg-rose-600/90 border-rose-400',
  'bg-indigo-600/90 border-indigo-400',
  'bg-teal-600/90 border-teal-400',
  'bg-cyan-600/90 border-cyan-400',
  'bg-fuchsia-600/90 border-fuchsia-400',
  'bg-orange-600/90 border-orange-400',
];

export const MemoryGameMode: React.FC<MemoryGameModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory>('languages');
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('medium');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastMatchExplanation, setLastMatchExplanation] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or Reset Game
  const startNewGame = () => {
    soundEffects.playGameStart();
    const config = DIFFICULTY_CONFIG[difficulty];
    const availablePairs = MEMORY_PAIRS_DATA[selectedCategory];

    // Shuffle available pairs and pick the required number
    const shuffledAvailable = [...availablePairs].sort(() => Math.random() - 0.5);
    const chosenPairs = shuffledAvailable.slice(0, config.pairsCount);

    const generatedCards: MemoryCard[] = [];

    chosenPairs.forEach((pair, index) => {
      const color = CARD_COLORS[index % CARD_COLORS.length];
      const pairId = `pair_${index}`;

      // Card A
      generatedCards.push({
        id: `card_${index}_a`,
        pairId,
        display: pair.a,
        subtext: pair.subA,
        color,
        isFlipped: false,
        isMatched: false,
      });

      // Card B
      generatedCards.push({
        id: `card_${index}_b`,
        pairId,
        display: pair.b,
        subtext: pair.subB,
        color,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards on the board
    const finalShuffledBoard = generatedCards.sort(() => Math.random() - 0.5);

    setCards(finalShuffledBoard);
    setFlippedCardIds([]);
    setMatchedPairsCount(0);
    setMovesCount(0);
    setSecondsElapsed(0);
    setIsGameOver(false);
    setIsGameActive(true);
    setLastMatchExplanation(null);

    // Initial voice greeting
    if (isVoiceActive) {
      const catName = CATEGORIES.find((c) => c.id === selectedCategory)?.name || '';
      speechNarrator.speak(`Jogo da Memória iniciado: ${catName}. Encontre os pares correspondentes!`);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isGameActive && !isGameOver) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, isGameOver]);

  // Start game on first mount or when category/difficulty changes
  useEffect(() => {
    startNewGame();
  }, [selectedCategory, difficulty]);

  // Handle Card Click
  const handleCardClick = (clickedCard: MemoryCard) => {
    // Cannot click if already flipped, matched, or if 2 cards are currently being evaluated
    if (
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCardIds.length >= 2 ||
      isGameOver
    ) {
      return;
    }

    soundEffects.playCardFlip();

    // Flip the card
    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlippedIds = [...flippedCardIds, clickedCard.id];
    setFlippedCardIds(newFlippedIds);

    // If 2 cards are flipped, check for a match
    if (newFlippedIds.length === 2) {
      setMovesCount((prev) => prev + 1);

      const firstCard = updatedCards.find((c) => c.id === newFlippedIds[0])!;
      const secondCard = updatedCards.find((c) => c.id === newFlippedIds[1])!;

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH FOUND!
        soundEffects.playCardMatch();

        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.pairId === firstCard.pairId
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedCardIds([]);
          const newMatchedCount = matchedPairsCount + 1;
          setMatchedPairsCount(newMatchedCount);

          // Find explanation and speak it
          const pairItem = MEMORY_PAIRS_DATA[selectedCategory].find(
            (p) =>
              (p.a === firstCard.display && p.b === secondCard.display) ||
              (p.b === firstCard.display && p.a === secondCard.display)
          );

          if (pairItem) {
            setLastMatchExplanation(pairItem.explanation);
            if (isVoiceActive) {
              speechNarrator.speak(`Par encontrado! ${pairItem.explanation}`);
            }
          }

          // Check if all pairs are found (Game Over)
          const totalPairs = DIFFICULTY_CONFIG[difficulty].pairsCount;
          if (newMatchedCount >= totalPairs) {
            handleVictory();
          }
        }, 400);
      } else {
        // NO MATCH - flip back after delay
        soundEffects.playIncorrect();
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              newFlippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCardIds([]);
        }, 950);
      }
    }
  };

  // Victory celebration
  const handleVictory = () => {
    setIsGameOver(true);
    setIsGameActive(false);
    soundEffects.playVictoryFanfare();

    const config = DIFFICULTY_CONFIG[difficulty];
    const earnedXp = config.points;

    if (onEarnPoints) {
      onEarnPoints(earnedXp, true);
    }

    if (isVoiceActive) {
      setTimeout(() => {
        speechNarrator.speak(
          `Parabéns, você completou o Jogo da Memória com sucesso e ganhou ${earnedXp} pontos de experiência!`
        );
      }, 700);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStars = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const optimalMoves = config.pairsCount + 2;
    if (movesCount <= optimalMoves) return 3;
    if (movesCount <= optimalMoves * 1.6) return 2;
    return 1;
  };

  const currentCategoryData = CATEGORIES.find((c) => c.id === selectedCategory)!;
  const CategoryIcon = currentCategoryData.icon;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 text-slate-900 p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-4 pb-20">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              speechNarrator.stop();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-slate-900 transition active:scale-95 text-xs font-bold shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600" />
            <span>Voltar aos Modos</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsVoiceActive(!isVoiceActive);
                if (isVoiceActive) speechNarrator.stop();
              }}
              className={`p-2 rounded-2xl border transition active:scale-95 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isVoiceActive
                  ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              title={isVoiceActive ? 'Voz da IA ativada' : 'Voz silenciada'}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isVoiceActive ? 'Voz IA On' : 'Voz Off'}</span>
            </button>

            <button
              onClick={startNewGame}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Embaralhar / Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Title Header with Category Icon */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentCategoryData.color} text-white flex items-center justify-center shadow-sm text-2xl shrink-0`}>
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Jogo da Memória Educativo</h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-black uppercase">
                  Novo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Conecte os conceitos, traduções de idiomas e fórmulas com foco e memória!
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <Timer className="w-4 h-4" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>{movesCount} jogadas</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                {matchedPairsCount}/{DIFFICULTY_CONFIG[difficulty].pairsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Category Selection Tabs */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block px-1">
            1. Escolha a Matéria do Jogo:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`p-2.5 rounded-2xl border transition flex items-center gap-2.5 text-left active:scale-98 cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${cat.color} text-white border-purple-400 shadow-md`
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700 shadow-2xs hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-purple-50 text-purple-600'} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{cat.name}</span>
                    <span className={`text-[9px] block truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {cat.id === 'languages' ? 'Espanhol & Italiano' : 'Aprenda brincando'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-700 px-2">Dificuldade:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {(Object.keys(DIFFICULTY_CONFIG) as MemoryDifficulty[]).map((key) => {
              const cfg = DIFFICULTY_CONFIG[key];
              const isSelected = difficulty === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    soundEffects.playClick();
                    setDifficulty(key);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Match Explanation Banner */}
        {lastMatchExplanation && !isGameOver && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 text-purple-950 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium">
                <strong className="text-purple-700 font-bold">Conceito Aprendido:</strong> {lastMatchExplanation}
              </p>
            </div>
            <button
              onClick={() => speechNarrator.speak(lastMatchExplanation)}
              className="p-1.5 rounded-lg bg-purple-200 hover:bg-purple-300 text-purple-800 transition shrink-0 cursor-pointer"
              title="Ouvir explicação da IA"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MEMORY CARDS BOARD */}
        <div className={`grid ${DIFFICULTY_CONFIG[difficulty].gridCols} gap-2.5 sm:gap-3`}>
          {cards.map((card) => {
            const isFlippedOrMatched = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched || isGameOver}
                className={`aspect-[4/3] sm:aspect-square rounded-2xl p-2.5 sm:p-3 relative transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center text-center shadow-xs select-none cursor-pointer ${
                  card.isMatched
                    ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900 shadow-sm'
                    : card.isFlipped
                    ? `${card.color} border-2 text-white shadow-md scale-[1.02]`
                    : 'bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-purple-400 text-purple-600'
                }`}
              >
                {isFlippedOrMatched ? (
                  <div className="space-y-1 animate-in zoom-in-90 duration-200 w-full">
                    {card.subtext && (
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-90 truncate">
                        {card.subtext}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm md:text-base font-black block leading-tight px-1 break-words">
                      {card.display}
                    </span>
                    {card.isMatched && (
                      <span className="text-[10px] font-black text-emerald-600 block flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Par OK!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg font-black">
                      ?
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Toque</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* VICTORY MODAL / CARD */}
        {isGameOver && (
          <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-purple-300 rounded-3xl text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center text-3xl shadow-md animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Parabéns! Você Venceu o Jogo da Memória! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-purple-700">
                Excelente raciocínio e fixação de conteúdo em <strong>{currentCategoryData.name}</strong>!
              </p>
            </div>

            {/* Stars & Stats */}
            <div className="flex items-center justify-center gap-2 text-amber-400 text-2xl py-1">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-7 h-7 ${
                    starIdx <= calculateStars()
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold">Tempo</span>
                <span className="text-base font-black text-slate-900">{formatTime(secondsElapsed)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold">Jogadas</span>
                <span className="text-base font-black text-slate-900">{movesCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-amber-300 shadow-2xs">
                <span className="text-[10px] text-amber-700 block font-bold">Recompensa</span>
                <span className="text-base font-black text-amber-600">
                  +{DIFFICULTY_CONFIG[difficulty].points} XP
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={startNewGame}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onBack();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm transition active:scale-95 cursor-pointer shadow-2xs"
              >
                Voltar aos Desafios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
