import { GradeLevel } from '../types';

// ================= WORD SEARCH DATA STRUCTURE =================
export interface WordSearchWord {
  word: string;
  hint: string;
}

export interface WordSearchLevel {
  id: number;
  title: string;
  theme: string;
  gridSize: number;
  grid: string[][];
  words: {
    word: string;
    hint: string;
    path: [number, number][]; // Exact cell coordinates [row, col] on grid
  }[];
}

// Animal Matching Puzzle Data Structure
export interface AnimalPuzzleItem {
  id: string;
  name: string;
  emoji: string;
  soundName?: string;
  habitat: string;
  fact: string;
}

export interface AnimalPuzzleLevel {
  id: number;
  title: string;
  habitatName: string;
  habitatTheme: string;
  bgGradient: string;
  description: string;
  animals: AnimalPuzzleItem[];
}

// Curated themes and words for Word Search
export const WORD_SEARCH_THEMES = [
  {
    theme: 'Sistema Solar & Astronomia',
    words: [
      { word: 'PLANETA', hint: 'Corpo celeste que orbita uma estrela' },
      { word: 'SOLAR', hint: 'Relativo ao Sol' },
      { word: 'TERRA', hint: 'Nosso planeta azul' },
      { word: 'MARTE', hint: 'O planeta vermelho' },
      { word: 'ORBITA', hint: 'Trajetória de um astro no espaço' },
      { word: 'COMETA', hint: 'Corpo de gelo e poeira com cauda' },
      { word: 'LUA', hint: 'Satélite natural da Terra' },
      { word: 'ASTRO', hint: 'Corpo celeste no universo' },
      { word: 'GALAXIA', hint: 'Grande aglomerado de estrelas' },
    ],
  },
  {
    theme: 'Ecossistemas & Natureza',
    words: [
      { word: 'FLORESTA', hint: 'Grande área com vegetação arbórea' },
      { word: 'BIOMA', hint: 'Conjunto de vida vegetal e animal' },
      { word: 'FAUNA', hint: 'Conjunto de animais de uma região' },
      { word: 'FLORA', hint: 'Conjunto de plantas de uma região' },
      { word: 'AGUA', hint: 'Recurso essencial para a vida' },
      { word: 'CLIMA', hint: 'Padrão meteorológico de uma região' },
      { word: 'SOLO', hint: 'Camada superficial da Terra' },
      { word: 'RIO', hint: 'Curso natural de água doce' },
    ],
  },
  {
    theme: 'Matemática & Geometria',
    words: [
      { word: 'FRACAO', hint: 'Parte de um todo dividido' },
      { word: 'ANGULO', hint: 'Abertura entre duas semirretas' },
      { word: 'PRISMA', hint: 'Poliedro com bases paralelas' },
      { word: 'CIRCULO', hint: 'Figura geométrica redonda' },
      { word: 'SOMA', hint: 'Operação de adição básica' },
      { word: 'RAIZ', hint: 'Operação inversa da potência' },
      { word: 'MULTIPLO', hint: 'Produto de números inteiros' },
      { word: 'RETA', hint: 'Linha infinita em ambas as direções' },
    ],
  },
  {
    theme: 'Língua Portuguesa & Literatura',
    words: [
      { word: 'VERBO', hint: 'Palavra que indica ação ou estado' },
      { word: 'POESIA', hint: 'Gênero literário em versos' },
      { word: 'SINTAXE', hint: 'Relação entre palavras na oração' },
      { word: 'METAFORA', hint: 'Comparação implícita em figura de linguagem' },
      { word: 'FABULA', hint: 'História com animais e lição de moral' },
      { word: 'RIMA', hint: 'Semelhança sonora final nos versos' },
      { word: 'VOGAL', hint: 'Sons A, E, I, O, U na língua' },
      { word: 'SUBSTANTIVO', hint: 'Palavra que dá nome aos seres' },
    ],
  },
  {
    theme: 'História & Civilizações',
    words: [
      { word: 'IMPERIO', hint: 'Governo de um imperador' },
      { word: 'BRASIL', hint: 'Nosso país na América do Sul' },
      { word: 'EGITO', hint: 'Terra dos faraós e pirâmides' },
      { word: 'GRECIA', hint: 'Berço da democracia' },
      { word: 'ROMANOS', hint: 'Grande império da antiguidade' },
      { word: 'FARAO', hint: 'Soberano do Antigo Egito' },
      { word: 'CULTURA', hint: 'Costumes e conhecimentos de um povo' },
      { word: 'MUSEU', hint: 'Local de preservação da memória histórica' },
    ],
  },
  {
    theme: 'Corpo Humano & Saúde',
    words: [
      { word: 'CORACAO', hint: 'Órgão que bombeia o sangue' },
      { word: 'CELULA', hint: 'Menor unidade viva dos seres' },
      { word: 'PULMAO', hint: 'Órgão essencial para a respiração' },
      { word: 'CEREBRO', hint: 'Centro de controle do corpo' },
      { word: 'SANGUE', hint: 'Líquido vital que transporta nutrientes' },
      { word: 'OSSO', hint: 'Estrutura rígida do esqueleto' },
      { word: 'MUSCULO', hint: 'Tecido responsável pelos movimentos' },
    ],
  },
];

// Helper to generate a randomly shuffled and embedded Word Search grid
export function generateRandomWordSearchGrid(
  levelIndex: number,
  _grade: GradeLevel = '6_fund'
): WordSearchLevel {
  const themeObj = WORD_SEARCH_THEMES[levelIndex % WORD_SEARCH_THEMES.length];
  const gridSize = 9;
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => '')
  );

  // Pick 5 to 7 words randomly for this level
  const shuffledWords = [...themeObj.words].sort(() => Math.random() - 0.5).slice(0, 6);
  const placedWords: {
    word: string;
    hint: string;
    path: [number, number][];
  }[] = [];

  // Directions: [dRow, dCol]
  // Horizontal Right, Horizontal Left, Vertical Down, Vertical Up, Diagonal Down-Right, Diagonal Up-Right
  const directions = [
    [0, 1],   // right
    [0, -1],  // left
    [1, 0],   // down
    [-1, 0],  // up
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
  ];

  for (const item of shuffledWords) {
    const rawWord = item.word.toUpperCase().replace(/[^A-Z]/g, '');
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const [dr, dc] = dir;

      const maxR = dr === 1 ? gridSize - rawWord.length : dr === -1 ? gridSize - 1 : gridSize - 1;
      const minR = dr === -1 ? rawWord.length - 1 : 0;
      const maxC = dc === 1 ? gridSize - rawWord.length : dc === -1 ? gridSize - 1 : gridSize - 1;
      const minC = dc === -1 ? rawWord.length - 1 : 0;

      if (maxR < minR || maxC < minC) continue;

      const startR = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const startC = minC + Math.floor(Math.random() * (maxC - minC + 1));

      // Check if word can fit without conflict
      let canPlace = true;
      const currentPath: [number, number][] = [];

      for (let i = 0; i < rawWord.length; i++) {
        const r = startR + i * dr;
        const c = startC + i * dc;

        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
          canPlace = false;
          break;
        }

        const existing = grid[r][c];
        if (existing !== '' && existing !== rawWord[i]) {
          canPlace = false;
          break;
        }
        currentPath.push([r, c]);
      }

      if (canPlace) {
        // Place letters
        for (let i = 0; i < rawWord.length; i++) {
          const [r, c] = currentPath[i];
          grid[r][c] = rawWord[i];
        }
        placedWords.push({
          word: rawWord,
          hint: item.hint,
          path: currentPath,
        });
        placed = true;
      }
    }
  }

  // Fill remaining empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return {
    id: levelIndex + 1,
    title: `Nível ${levelIndex + 1}: ${themeObj.theme}`,
    theme: themeObj.theme,
    gridSize,
    grid,
    words: placedWords,
  };
}

// ================= ANIMAL PUZZLE LEVELS (QUEBRA-CABEÇA DE ANIMAIS) =================
export const ANIMAL_PUZZLE_LEVELS: AnimalPuzzleLevel[] = [
  {
    id: 1,
    title: 'Nível 1: Animais da Fazenda',
    habitatName: 'Fazendinha Feliz',
    habitatTheme: 'Animais Domésticos',
    bgGradient: 'from-amber-600 via-yellow-600 to-emerald-700',
    description: 'Encontre os pares dos animais que vivem no campo e na fazenda!',
    animals: [
      { id: 'vaca', name: 'Vaquinha', emoji: '🐮', habitat: 'Fazenda', fact: 'As vacas produzem leite e têm um olfato excelente, sentindo cheiros a até 10 km!' },
      { id: 'porco', name: 'Porquinho', emoji: '🐷', habitat: 'Fazenda', fact: 'Os porquinhos são animais muito inteligentes e adoram tomar banho de lama para se refrescar.' },
      { id: 'galinha', name: 'Galinha', emoji: '🐔', habitat: 'Fazenda', fact: 'As galinhas conseguem se lembrar de mais de 100 rostos diferentes de pessoas e de outras aves!' },
      { id: 'ovelha', name: 'Ovelhinha', emoji: '🐑', habitat: 'Fazenda', fact: 'As ovelhas têm visão panorâmica de quase 360 graus para se proteger de predadores.' },
      { id: 'cavalo', name: 'Cavalinho', emoji: '🐴', habitat: 'Fazenda', fact: 'Os cavalos conseguem dormir tanto em pé quanto deitados com segurança.' },
      { id: 'pato', name: 'Patinho', emoji: '🦆', habitat: 'Fazenda', fact: 'As penas dos patos são impermeáveis à água graças a uma camada natural de óleo!' },
    ],
  },
  {
    id: 2,
    title: 'Nível 2: Savana & Selva Selvagem',
    habitatName: 'Reino da Savana',
    habitatTheme: 'Animais Selvagens',
    bgGradient: 'from-amber-500 via-orange-600 to-rose-700',
    description: 'Combine os pares dos reis da selva e gigantes da natureza!',
    animals: [
      { id: 'leao', name: 'Leão', emoji: '🦁', habitat: 'Savana Africana', fact: 'O rugido de um leão adulto pode ser ouvido a até 8 km de distância!' },
      { id: 'elefante', name: 'Elefante', emoji: '🐘', habitat: 'Savana', fact: 'Os elefantes são os maiores mamíferos terrestres e têm uma memória fantástica.' },
      { id: 'girafa', name: 'Girafa', emoji: '🦒', habitat: 'Savana', fact: 'A girafa é o animal mais alto do planeta e tem uma língua azul de até 45 cm!' },
      { id: 'zebra', name: 'Zebra', emoji: '🦓', habitat: 'Savana', fact: 'As listras de cada zebra são únicas, como a impressão digital dos seres humanos!' },
      { id: 'macaco', name: 'Macaco', emoji: '🐵', habitat: 'Selva', fact: 'Os macacos usam ferramentas, como gravetos e pedras, para pegar comida na natureza.' },
      { id: 'tigre', name: 'Tigre', emoji: '🐯', habitat: 'Florestas Asiáticas', fact: 'Os tigres adoram nadar e podem cruzar rios de vários quilômetros com facilidade!' },
    ],
  },
  {
    id: 3,
    title: 'Nível 3: Fundo do Mar & Oceanos',
    habitatName: 'Oceano Encantado',
    habitatTheme: 'Vida Marinha',
    bgGradient: 'from-cyan-600 via-blue-700 to-indigo-900',
    description: 'Mergulhe fundo para encontrar os pares das criaturas marinhas!',
    animals: [
      { id: 'golfinho', name: 'Golfinho', emoji: '🐬', habitat: 'Oceanos', fact: 'Os golfinhos dormem com apenas metade do cérebro para continuar respirando!' },
      { id: 'tartaruga', name: 'Tartaruga Marinha', emoji: '🐢', habitat: 'Oceanos Tropicais', fact: 'As tartarugas marinhas navegam usando o campo magnético da Terra para voltar à praia onde nasceram.' },
      { id: 'tubarao', name: 'Tubarão', emoji: '🦈', habitat: 'Oceanos', fact: 'Os tubarões existem há mais de 400 milhões de anos, antes mesmo dos dinossauros!' },
      { id: 'polvo', name: 'Polvo', emoji: '🐙', habitat: 'Recifes de Coral', fact: 'Os polvos têm 3 corações, sangue azul e uma inteligência impressionante para escapar de labirintos!' },
      { id: 'baleia', name: 'Baleia Azul', emoji: '🐳', habitat: 'Oceanos', fact: 'A baleia-azul é o maior animal que já existiu em toda a história da Terra!' },
      { id: 'peixe_palhaco', name: 'Peixe-Palhaço', emoji: '🐠', habitat: 'Anêmonas do Mar', fact: 'Eles vivem protegidos entre os tentáculos venenosos das anêmonas graças ao seu muco protetor.' },
    ],
  },
  {
    id: 4,
    title: 'Nível 4: Floresta Mágica & Pets',
    habitatName: 'Bosque dos Amigos',
    habitatTheme: 'Animais da Floresta',
    bgGradient: 'from-emerald-600 via-teal-700 to-indigo-800',
    description: 'Conecte os bichinhos fofos da floresta temperada e companheiros!',
    animals: [
      { id: 'panda', name: 'Panda-Gigante', emoji: '🐼', habitat: 'Florestas de Bambu', fact: 'Os pandas passam cerca de 12 horas por dia comendo bambu saboroso!' },
      { id: 'raposa', name: 'Raposa', emoji: '🦊', habitat: 'Bosques', fact: 'As raposas têm uma audição tão apurada que conseguem ouvir um ratinho se movendo sob a neve!' },
      { id: 'coelho', name: 'Coelhinho', emoji: '🐰', habitat: 'Campos', fact: 'Os dentes dos coelhos nunca param de crescer e se desgastam ao mastigar vegetais.' },
      { id: 'coruja', name: 'Corujinha', emoji: '🦉', habitat: 'Florestas', fact: 'As corujas conseguem girar a cabeça em até 270 graus sem mover o corpo!' },
      { id: 'cachorro', name: 'Cachorrinho', emoji: '🐶', habitat: 'Nossos Lares', fact: 'O olfato dos cães é até 100.000 vezes mais sensível que o olfato humano!' },
      { id: 'gato', name: 'Gatinho', emoji: '🐱', habitat: 'Nossos Lares', fact: 'Os gatos têm uma flexibilidade incrível e usam seus bigodes para medir espaços onde cabem!' },
    ],
  },
];

export function getAnimalPuzzleLevel(levelIndex: number): AnimalPuzzleLevel {
  const baseCount = ANIMAL_PUZZLE_LEVELS.length;
  const baseLevel = ANIMAL_PUZZLE_LEVELS[levelIndex % baseCount];
  const cycle = Math.floor(levelIndex / baseCount) + 1;

  if (cycle === 1) {
    return baseLevel;
  }

  return {
    ...baseLevel,
    id: levelIndex + 1,
    title: `Nível ${levelIndex + 1}: ${baseLevel.habitatName} (Mundo +${cycle})`,
  };
}
