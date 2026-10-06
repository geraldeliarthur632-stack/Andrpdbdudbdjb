export interface ChessVideoLesson {
  id: string;
  lessonNumber: number; // 0 for playlist, 1, 2, 3... for specific lessons
  playlistIndex?: number; // 0-based index in the official YouTube playlist
  lessonBadge: string; // e.g. "Aula 1", "Aula 2", "Playlist"
  youtubeId: string; // YouTube video ID or playlist embed identifier
  youtubeUrl: string; // Direct URL for external opening
  title: string;
  channel: string;
  duration: string;
  category: 'iniciante' | 'pecas' | 'especiais' | 'aberturas' | 'taticas' | 'mates' | 'finais';
  categoryLabel: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  description: string;
  keyTakeaways: string[];
  thumbnailUrl?: string;
  xpReward: number;
}

export const CHESS_OFFICIAL_PLAYLIST = {
  id: 'PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h',
  title: 'Curso Completo: Aprenda Xadrez do Zero (Playlist Oficial)',
  channel: 'Playlist Oficial de Xadrez para Iniciantes',
  url: 'https://youtube.com/playlist?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&si=5VsmuJjFZeYJ8ZeH',
  embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h',
  description:
    'Playlist completa com todas as vídeo-aulas passo a passo no YouTube para aprender a jogar xadrez desde o início: regras completas, movimentos de todas as peças, jogadas especiais (roque, en passant, promoção), táticas e xeque-mates fundamentais.',
  xpReward: 50,
};

export const CHESS_VIDEO_LESSONS: ChessVideoLesson[] = [
  {
    id: 'vid_regras_completas',
    lessonNumber: 1,
    playlistIndex: 0,
    lessonBadge: 'Aula 1',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=0',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=1',
    title: 'Aula 1: Como Jogar Xadrez do Zero - Regras Completas e Tabuleiro',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '14:20',
    category: 'iniciante',
    categoryLabel: 'Regras Básicas',
    difficulty: 'Iniciante',
    description:
      'Aprenda tudo sobre o tabuleiro de 64 casas, coordenadas de a a h e 1 a 8, posicionamento correto das peças (branca na direita) e o objetivo sagrado de dar xeque-mate.',
    keyTakeaways: [
      'O tabuleiro sempre tem a casa branca no canto inferior direito de cada jogador.',
      'A Dama começa sempre na sua própria cor (Dama branca na casa d1, Dama preta na d8).',
      'O objetivo é dar xeque-mate no Rei adversário, não capturar todas as peças.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/3n0Ff4Xb44g/hqdefault.jpg',
    xpReward: 30,
  },
  {
    id: 'vid_movimento_pecas',
    lessonNumber: 2,
    playlistIndex: 1,
    lessonBadge: 'Aula 2',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=1',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=2',
    title: 'Aula 2: O Movimento de Todas as Peças do Xadrez Passo a Passo',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '11:45',
    category: 'pecas',
    categoryLabel: 'Movimento das Peças',
    difficulty: 'Iniciante',
    description:
      'Guia visual mostrando como se movem e capturam a Torre (linhas retas), o Bispo (diagonais), o Cavalo (salto em L), a Dama, o Rei e os Peões.',
    keyTakeaways: [
      'A Torre move-se em linhas retas horizontais e verticais quantas casas quiser.',
      'O Bispo move-se exclusivamente em diagonais e nunca muda de cor de casa.',
      'O Cavalo salta em formato de "L" e é a única peça que pula por cima de outras.',
      'A Dama combina os poderes da Torre e do Bispo em todas as retas e diagonais.',
      'O Peão avança reto (1 ou 2 casas no primeiro lance) e captura 1 casa na diagonal.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/pZ_Yk9W7q3g/hqdefault.jpg',
    xpReward: 30,
  },
  {
    id: 'vid_jogadas_especiais',
    lessonNumber: 3,
    playlistIndex: 2,
    lessonBadge: 'Aula 3',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=2',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=3',
    title: 'Aula 3: As 3 Jogadas Especiais - Roque, En Passant e Promoção',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '09:50',
    category: 'especiais',
    categoryLabel: 'Jogadas Especiais',
    difficulty: 'Iniciante',
    description:
      'Domine os 3 movimentos especiais do xadrez: o Roque (para proteger o Rei), a captura "En Passant" de passagem e a Promoção do peão na 8ª fileira.',
    keyTakeaways: [
      'O Roque move o Rei 2 casas para o lado e a Torre salta para o lado dele.',
      'En Passant só pode ser feito no lance imediatamente após o peão adversário avançar 2 casas.',
      'Todo peão que chega à última fileira se transforma em Dama, Torre, Bispo ou Cavalo.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/7XqB5v_gL8k/hqdefault.jpg',
    xpReward: 35,
  },
  {
    id: 'vid_mate_pastor',
    lessonNumber: 4,
    playlistIndex: 3,
    lessonBadge: 'Aula 4',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=3',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=4',
    title: 'Aula 4: Xeque-Mate do Pastor em 4 Lances e Como se Defender',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '08:30',
    category: 'mates',
    categoryLabel: 'Xeque-Mates Famosos',
    difficulty: 'Iniciante',
    description:
      'Veja como funciona o famoso golpe do Mate do Pastor que ataca o ponto fraco f7 e aprenda a defesa sólida para nunca mais cair nele.',
    keyTakeaways: [
      'A Dama e o Bispo atacam juntos o peão fraco em f7.',
      'Para se defender, jogue g6 ou Nf6 bloqueando a linha de ataque da Dama.',
      'Nunca traga a Dama cedo demais se ela puder ser atacada por peças menores.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/b7Gv5Y9p0k8/hqdefault.jpg',
    xpReward: 30,
  },
  {
    id: 'vid_taticas_garfo_cravada',
    lessonNumber: 5,
    playlistIndex: 4,
    lessonBadge: 'Aula 5',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=4',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=5',
    title: 'Aula 5: Golpes Táticos Essenciais - Garfo, Cravada e Ataque Descoberto',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '15:10',
    category: 'taticas',
    categoryLabel: 'Táticas & Combinações',
    difficulty: 'Intermediário',
    description:
      'Aprenda a enxergar padrões táticos no tabuleiro para capturar peças adversárias e decidir partidas no meio-jogo.',
    keyTakeaways: [
      'Garfo: uma peça ataca dois alvos ao mesmo tempo (especialidade do Cavalo).',
      'Cravada: paralisa uma peça porque atrás dela está o Rei ou a Dama.',
      'Ataque Descoberto: mover uma peça para destampar um ataque fulminante de outra.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/8Nf9L_22100/hqdefault.jpg',
    xpReward: 40,
  },
  {
    id: 'vid_principios_abertura',
    lessonNumber: 6,
    playlistIndex: 5,
    lessonBadge: 'Aula 6',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=5',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=6',
    title: 'Aula 6: Princípios de Abertura - Domínio do Centro e Desenvolvimento',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '12:15',
    category: 'aberturas',
    categoryLabel: 'Abertura & Estratégia',
    difficulty: 'Iniciante',
    description:
      'Descubra os 3 mandamentos de ouro da abertura: dominar as casas centrais (e4, d4, e5, d5), desenvolver cavalos e bispos rapidamente e rocar cedo.',
    keyTakeaways: [
      'Ocupe o centro com peões (1. e4 ou 1. d4).',
      'Desenvolva os Cavalos antes dos Bispos.',
      'Proteja o Rei com o Roque antes do lance 10.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/O6UvD3b_q80/hqdefault.jpg',
    xpReward: 35,
  },
  {
    id: 'vid_mates_fundamentais',
    lessonNumber: 7,
    playlistIndex: 6,
    lessonBadge: 'Aula 7',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=6',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=7',
    title: 'Aula 7: Xeque-Mates Fundamentais - Mate do Corredor e Mate da Escadinha',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '10:40',
    category: 'mates',
    categoryLabel: 'Padrões de Mate',
    difficulty: 'Iniciante',
    description:
      'Aprenda como aplicar o Mate do Corredor na 8ª fileira e como coordenar duas Torres no Mate da Escadinha para empurrar o Rei inimigo até a borda.',
    keyTakeaways: [
      'Mate do Corredor explora o Rei preso atrás dos seus próprios peões.',
      'Mate da Escadinha usa duas peças pesadas em fileiras alternadas.',
      'Evite o afogamento deixando sempre o Rei em xeque nos lances de mate.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/V9P5Pz5l6sA/hqdefault.jpg',
    xpReward: 35,
  },
  {
    id: 'vid_final_rei_dama',
    lessonNumber: 8,
    playlistIndex: 7,
    lessonBadge: 'Aula 8',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=7',
    youtubeUrl: 'https://www.youtube.com/watch?v=videoseries&list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&index=8',
    title: 'Aula 8: Final de Jogo - Como Dar Mate de Rei e Dama sem Afogar',
    channel: 'Curso de Xadrez para Iniciantes',
    duration: '13:05',
    category: 'finais',
    categoryLabel: 'Finais de Partida',
    difficulty: 'Intermediário',
    description:
      'Método infalível para encurralar o Rei adversário com a Dama como uma "caixa invisível" e trazer seu Rei para aplicar o "Beijo da Morte".',
    keyTakeaways: [
      'A Dama corta o tabuleiro mantendo distância de cavalo do Rei inimigo.',
      'Aproxime seu próprio Rei para dar o apoio final.',
      'Coloque a Dama encostada no Rei adversário ("Beijo da Morte") protegida pelo seu Rei.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/vC_mZ9Xf3q0/hqdefault.jpg',
    xpReward: 40,
  },
  {
    id: 'vid_playlist_geral',
    lessonNumber: 0,
    playlistIndex: 0,
    lessonBadge: 'Playlist Completa',
    youtubeId: 'videoseries?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h',
    youtubeUrl: 'https://youtube.com/playlist?list=PLAfuxKJO2K3jgcsuTdInec2pRIuDMXY1h&si=5VsmuJjFZeYJ8ZeH',
    title: '▶ Playlist Oficial: Todas as Aulas de Xadrez do Zero',
    channel: 'Playlist Oficial de Xadrez',
    duration: 'Curso Completo',
    category: 'iniciante',
    categoryLabel: 'Playlist Oficial',
    difficulty: 'Iniciante',
    description:
      'Assista à sequência completa de aulas no YouTube para dominar o tabuleiro, movimentos, estratégias e táticas de xadrez.',
    keyTakeaways: [
      'Aulas em vídeo dinâmicas e didáticas para iniciantes.',
      'Aprenda no seu ritmo com explicações visuais de mestres.',
      'Domine desde os lances básicos até combinações táticas para vencer partidas.',
    ],
    thumbnailUrl: 'https://img.youtube.com/vi/3n0Ff4Xb44g/hqdefault.jpg',
    xpReward: 50,
  },
];

