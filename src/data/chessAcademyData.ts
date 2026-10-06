import { Square } from 'chess.js';

export interface ChessLessonStep {
  id: string;
  title: string;
  pieceName: string;
  pieceIcon: string;
  conceptDescription: string;
  instruction: string;
  initialFen: string; // Position to load
  allowedMoves?: { from: Square; to: Square }[]; // Specific correct move(s)
  targetSquares?: Square[]; // Targets to collect/reach
  correctMoveExplanation: string;
  hint: string;
  completedPoints: number;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  theme: 'mate' | 'garfo' | 'cravada' | 'duplo' | 'especial';
  themeLabel: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  fen: string; // Position
  turn: 'w' | 'b';
  objective: string;
  winningMove: { from: Square; to: Square; promotion?: string };
  alternativeWinningMoves?: { from: Square; to: Square }[];
  hint: string;
  explanation: string;
  points: number;
}

// Complete Interactive Board Lessons to Learn Chess from Absolute Scratch (No Quizzes, 100% Practical on the Board)
export const CHESS_LESSONS: ChessLessonStep[] = [
  {
    id: 'lesson_tabuleiro',
    title: '1. O Tabuleiro e as Coordenadas',
    pieceName: 'Tabuleiro',
    pieceIcon: '🏁',
    conceptDescription:
      'O xadrez é jogado num tabuleiro de 64 casas (32 claras e 32 escuras). As colunas verticais são identificadas pelas letras de "a" a "h", e as fileiras horizontais pelos números de 1 a 8. Regra de ouro: a casa no canto inferior direito de cada jogador deve ser sempre BRANCA ("branca na direita")!',
    instruction: 'Clique no Peão em e2 e avance-o 2 casas até a casa central e4 para começar o jogo!',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    allowedMoves: [{ from: 'e2', to: 'e4' }],
    targetSquares: ['e4'],
    correctMoveExplanation: 'Perfeito! O lance de peão para e4 ocupa o centro do tabuleiro e abre passagem para o Bispo e para a Dama!',
    hint: 'Clique no peão na casa e2 e toque no ponto verde na casa e4.',
    completedPoints: 15,
  },
  {
    id: 'lesson_torre',
    title: '2. A Torre (Linhas Retas)',
    pieceName: 'Torre',
    pieceIcon: '♖',
    conceptDescription:
      'A Torre é uma peça pesada que vale 5 pontos. Ela se move em linha reta em qualquer direção (horizontal e vertical) quantas casas quiser, desde que não haja obstáculos no caminho. Cada jogador começa com 2 Torres nos cantos do tabuleiro.',
    instruction: 'Clique na Torre branca em d4 e mova-a em linha reta para capturar o alvo na casa d7!',
    initialFen: '7k/3p4/8/8/3R4/8/8/4K3 w - - 0 1',
    allowedMoves: [{ from: 'd4', to: 'd7' }],
    targetSquares: ['d7'],
    correctMoveExplanation: 'Excelente! A Torre andou em linha reta vertical (pela coluna d) e capturou o alvo!',
    hint: 'Clique na Torre em d4. Casas válidas aparecerão com destaque. Escolha a casa d7.',
    completedPoints: 15,
  },
  {
    id: 'lesson_bispo',
    title: '3. O Bispo (As Diagonais)',
    pieceName: 'Bispo',
    pieceIcon: '♗',
    conceptDescription:
      'O Bispo vale 3 pontos e anda exclusivamente nas diagonais, quantas casas quiser. Cada jogador tem um Bispo de casas claras e um de casas escuras. O Bispo NUNCA troca de cor durante toda a partida!',
    instruction: 'Clique no Bispo branco em c4 e capture o alvo na diagonal em f7!',
    initialFen: '7k/5p2/8/8/2B5/8/8/4K3 w - - 0 1',
    allowedMoves: [{ from: 'c4', to: 'f7' }],
    targetSquares: ['f7'],
    correctMoveExplanation: 'Muito bem! O Bispo cortou o tabuleiro pela diagonal clara e capturou em f7!',
    hint: 'Mova o Bispo de c4 para f7 seguindo a linha diagonal.',
    completedPoints: 15,
  },
  {
    id: 'lesson_dama',
    title: '4. A Dama / Rainha (O Poder Máximo)',
    pieceName: 'Dama / Rainha',
    pieceIcon: '♕',
    conceptDescription:
      'A Dama é a peça mais poderosa e valiosa do jogo, valendo 9 pontos. Ela combina todos os poderes da Torre e do Bispo: pode andar em linhas retas (horizontais e verticais) e também em todas as diagonais!',
    instruction: 'Use o super alcance da Dama em d4 para capturar a peça adversária na diagonal em g7!',
    initialFen: '7k/6p1/8/8/3Q4/8/8/4K3 w - - 0 1',
    allowedMoves: [{ from: 'd4', to: 'g7' }],
    targetSquares: ['g7'],
    correctMoveExplanation: 'Perfeito! A Dama domina todo o tabuleiro com seu alcance versátil em retas e diagonais.',
    hint: 'Clique na Dama em d4 e toque na casa g7.',
    completedPoints: 15,
  },
  {
    id: 'lesson_rei',
    title: '5. O Rei (O Líder Sagrado)',
    pieceName: 'Rei',
    pieceIcon: '♔',
    conceptDescription:
      'O Rei tem valor infinito: se ele receber xeque-mate, a partida termina! O Rei anda apenas 1 casa por vez em qualquer direção (horizontal, vertical ou diagonal) e NUNCA pode se colocar numa casa que esteja sob ataque de uma peça inimiga.',
    instruction: 'Mova o Rei branco de e4 para a casa segura e5.',
    initialFen: '7k/8/8/8/4K3/8/8/8 w - - 0 1',
    allowedMoves: [{ from: 'e4', to: 'e5' }, { from: 'e4', to: 'd5' }, { from: 'e4', to: 'f5' }],
    targetSquares: ['e5'],
    correctMoveExplanation: 'Ótimo lance! O Rei deu um passo seguro para frente.',
    hint: 'Clique no Rei em e4 e mova-o 1 casa para e5.',
    completedPoints: 15,
  },
  {
    id: 'lesson_cavalo',
    title: '6. O Cavalo (O Salto em "L")',
    pieceName: 'Cavalo',
    pieceIcon: '♘',
    conceptDescription:
      'O Cavalo vale 3 pontos. Ele faz um movimento especial em formato de "L" (2 casas em linha reta e 1 para o lado). É a ÚNICA peça do xadrez com a habilidade mágica de SALTAR por cima de outras peças amigas ou inimigas!',
    instruction: 'O Cavalo está em d4 com peões bloqueando seu caminho. Salte por cima deles e capture o alvo em f5!',
    initialFen: '7k/8/8/5p2/3N4/8/8/4K3 w - - 0 1',
    allowedMoves: [{ from: 'd4', to: 'f5' }],
    targetSquares: ['f5'],
    correctMoveExplanation: 'Sensacional! O Cavalo saltou em "L" (duas para a direita e uma para cima) até f5!',
    hint: 'O Cavalo anda 2 casas para a direita e 1 para cima (d4 -> e4 -> f4 -> f5).',
    completedPoints: 15,
  },
  {
    id: 'lesson_peao_avanco',
    title: '7. O Peão: Avanço de 1 ou 2 Casas',
    pieceName: 'Peão',
    pieceIcon: '♙',
    conceptDescription:
      'O Peão vale 1 ponto. Ele anda sempre para frente, 1 casa por vez. No entanto, no seu primeiro movimento na partida, cada peão tem a opção especial de avançar 2 casas de uma vez!',
    instruction: 'Avance o peão de e2 dando o salto inicial de 2 casas até e4!',
    initialFen: '8/8/8/8/8/8/4P3/4K2k w - - 0 1',
    allowedMoves: [{ from: 'e2', to: 'e4' }],
    targetSquares: ['e4'],
    correctMoveExplanation: 'Muito bem! O peão aproveitou seu salto inicial de 2 casas.',
    hint: 'Clique no peão em e2 e toque na casa e4.',
    completedPoints: 15,
  },
  {
    id: 'lesson_peao_captura',
    title: '8. O Peão: Captura na Diagonal',
    pieceName: 'Peão',
    pieceIcon: '♙',
    conceptDescription:
      'Atenção à regra essencial do Peão: ele AVANÇA em linha reta para frente, mas só CAPTURA peças adversárias 1 casa na DIAGONAL à frente! Se houver uma peça inimiga bem à sua frente reta, ele fica bloqueado e não pode capturá-la.',
    instruction: 'O peão branco está em e4 e há um peão preto em d5. Realize a captura na diagonal!',
    initialFen: '8/8/8/3p4/4P3/8/8/4K2k w - - 0 1',
    allowedMoves: [{ from: 'e4', to: 'd5' }],
    targetSquares: ['d5'],
    correctMoveExplanation: 'Excelente captura! Lembre-se: o Peão avança reto, mas captura na diagonal!',
    hint: 'Mova o peão de e4 para d5 para capturar na diagonal.',
    completedPoints: 15,
  },
  {
    id: 'lesson_roque',
    title: '9. O Lance Especial do Roque',
    pieceName: 'Rei e Torre',
    pieceIcon: '♔♖',
    conceptDescription:
      'O Roque é a única jogada do xadrez onde você movimenta duas peças no mesmo lance! Ele serve para colocar o Rei em total segurança no canto e ativar a Torre para o centro. O Rei anda duas casas em direção à Torre e a Torre salta para o lado do Rei.',
    instruction: 'Realize o Roque Pequeno: clique no Rei em e1 e mova-o 2 casas para a direita até g1!',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    allowedMoves: [{ from: 'e1', to: 'g1' }],
    targetSquares: ['g1'],
    correctMoveExplanation: 'Roque realizado com perfeição! Agora seu Rei está protegido no canto e a Torre centralizada pronta para o combate.',
    hint: 'Clique no Rei em e1 e selecione a casa g1.',
    completedPoints: 20,
  },
  {
    id: 'lesson_promocao',
    title: '10. Promoção do Peão (A Coroação)',
    pieceName: 'Peão Coroado',
    pieceIcon: '♕',
    conceptDescription:
      'Quando um humilde Peão consegue atravessar todo o tabuleiro e alcançar a 8ª fileira (última linha adversária), ele é promovido imediatamente a Dama (Rainha), Torre, Bispo ou Cavalo!',
    instruction: 'Avance seu peão de e7 para e8 e transforme-o na poderosa Dama!',
    initialFen: '8/4P3/8/8/8/8/8/4K2k w - - 0 1',
    allowedMoves: [{ from: 'e7', to: 'e8' }],
    targetSquares: ['e8'],
    correctMoveExplanation: 'Parabéns! Seu peão foi promovido e virou uma Dama vencedora!',
    hint: 'Mova o peão de e7 para e8.',
    completedPoints: 20,
  },
  {
    id: 'lesson_xeque_defesa',
    title: '11. O Xeque e Como se Defender',
    pieceName: 'Rei sob Ataque',
    pieceIcon: '⚠️',
    conceptDescription:
      'Quando o Rei está sob ataque direto de uma peça inimiga, dizemos que ele está em XEQUE! Existem 3 maneiras de se defender de um xeque: 1) Fugir com o Rei para uma casa segura; 2) Bloquear/cobrir o ataque com outra peça; 3) Capturar a peça que está dando o xeque.',
    instruction: 'A Torre preta em e8 deu xeque no seu Rei em e1. Fuja com o Rei para a casa segura d1!',
    initialFen: '4r3/8/8/8/8/8/8/4K2k w - - 0 1',
    allowedMoves: [{ from: 'e1', to: 'd1' }, { from: 'e1', to: 'f1' }, { from: 'e1', to: 'd2' }, { from: 'e1', to: 'f2' }],
    targetSquares: ['d1'],
    correctMoveExplanation: 'Muito bem! O Rei escapou da linha de tiro da Torre e saiu do xeque!',
    hint: 'Mova o Rei de e1 para d1.',
    completedPoints: 20,
  },
  {
    id: 'lesson_xeque_mate',
    title: '12. O Xeque-Mate (Fim de Jogo)',
    pieceName: 'Xeque-Mate',
    pieceIcon: '🏆',
    conceptDescription:
      'O Xeque-Mate ocorre quando o Rei está em xeque e NÃO existe nenhuma jogada legal para escapar (não pode fugir, não pode cobrir e não pode capturar a peça agressora). Quem aplica o xeque-mate vence a partida imediatamente!',
    instruction: 'Dê o Xeque-Mate no Rei preto: mova a Dama branca de f3 para f7!',
    initialFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    allowedMoves: [{ from: 'f3', to: 'f7' }],
    targetSquares: ['f7'],
    correctMoveExplanation: 'XEQUE-MATE! O Rei preto está atacado pela Dama e não pode capturá-la porque ela está protegida pelo Bispo em c4!',
    hint: 'Mova a Dama de f3 para f7.',
    completedPoints: 25,
  },
  {
    id: 'lesson_garfo',
    title: '13. Golpe Tático: O Garfo do Cavalo',
    pieceName: 'Garfo Duplo',
    pieceIcon: '⚔️',
    conceptDescription:
      'O Garfo (ataque duplo) é uma das armas mais temidas do xadrez. Acontece quando uma única peça (como o Cavalo) ataca duas ou mais peças inimigas ao mesmo tempo, forçando o adversário a perder uma delas.',
    instruction: 'Mova o Cavalo branco para dar um garfo simultâneo no Rei preto e na Torre preta!',
    initialFen: 'r3k3/8/8/8/3N4/8/8/4K3 w - - 0 1',
    allowedMoves: [{ from: 'd4', to: 'c6' }],
    targetSquares: ['c6'],
    correctMoveExplanation: 'Sensacional! O Cavalo em c6 ataca o Rei em e8 e a Torre em a8 ao mesmo tempo. Como o Rei é obrigado a fugir, a Torre será capturada no lance seguinte!',
    hint: 'Mova o Cavalo de d4 para c6.',
    completedPoints: 25,
  },
  {
    id: 'lesson_cravada',
    title: '14. Golpe Tático: A Cravada do Bispo',
    pieceName: 'Cravada',
    pieceIcon: '🎯',
    conceptDescription:
      'A Cravada acontece quando uma peça atacante mira numa peça adversária que não pode sair do lugar porque, se ela se mover, expõe uma peça mais valiosa (como o Rei ou a Dama) que está logo atrás!',
    instruction: 'Mova o Bispo branco para b5, cravando o Cavalo preto contra o Rei preto em e8!',
    initialFen: 'r1bqk2r/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1',
    allowedMoves: [{ from: 'f1', to: 'b5' }],
    targetSquares: ['b5'],
    correctMoveExplanation: 'Perfeito! O Cavalo preto em c6 agora está totalmente cravado pelo Bispo de b5 e não pode se mover!',
    hint: 'Mova o Bispo branco da casa f1 para b5.',
    completedPoints: 25,
  },
  {
    id: 'lesson_en_passant',
    title: '15. En Passant (A Captura Especial ao Passar)',
    pieceName: 'Peão En Passant',
    pieceIcon: '⚡',
    conceptDescription:
      'O "En Passant" (em francês: "de passagem") é uma jogada especial dos peões. Se o peão adversário avançar 2 casas no seu salto inicial e parar lado a lado com o seu peão (na 5ª fileira), você pode capturá-lo na diagonal IMEDIATAMENTE no lance seguinte, como se ele tivesse andado só 1 casa!',
    instruction: 'O peão preto acabou de saltar de c7 para c5. Realize a captura En Passant movendo seu peão branco de d5 para c6!',
    initialFen: '8/8/8/2pP4/8/8/8/4K2k w - c6 0 1',
    allowedMoves: [{ from: 'd5', to: 'c6' }],
    targetSquares: ['c6'],
    correctMoveExplanation: 'Espetacular! Você executou a captura "En Passant"! O peão preto foi capturado de passagem na casa c6.',
    hint: 'Mova seu peão de d5 para a casa c6 na diagonal.',
    completedPoints: 30,
  },
  {
    id: 'lesson_roque_grande',
    title: '16. O Roque Grande (Lado da Dama)',
    pieceName: 'Rei e Torre da Ala da Dama',
    pieceIcon: '🏰',
    conceptDescription:
      'Assim como o Roque Pequeno, o Roque Grande é feito no lado da Dama (ala da Dama). O Rei se move 2 casas para a esquerda (de e1 para c1) e a Torre salta de a1 para d1, protegendo o Rei e ativando a Torre numa coluna central!',
    instruction: 'Faça o Roque Grande: clique no Rei em e1 e mova-o 2 casas para a esquerda até c1!',
    initialFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    allowedMoves: [{ from: 'e1', to: 'c1' }],
    targetSquares: ['c1'],
    correctMoveExplanation: 'Excelente! Roque Grande (0-0-0) completado com sucesso!',
    hint: 'Clique no Rei em e1 e mova para c1.',
    completedPoints: 25,
  },
  {
    id: 'lesson_ataque_descoberto',
    title: '17. Golpe Tático: O Ataque Descoberto',
    pieceName: 'Ataque Descoberto',
    pieceIcon: '💥',
    conceptDescription:
      'O Ataque Descoberto acontece quando você move uma peça da frente e, ao fazer isso, "destampa" o raio de ação de outra peça que estava escondida atrás dela, criando dois ataques ao mesmo tempo!',
    instruction: 'Mova o Cavalo branco de d4 para b5 atacando a casa c7 e abrindo a Torre em d1 para atacar a Dama preta em d8!',
    initialFen: 'r1bqk2r/pppp1ppp/8/8/3N4/8/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    allowedMoves: [{ from: 'd4', to: 'b5' }, { from: 'd4', to: 'f5' }, { from: 'd4', to: 'c6' }],
    targetSquares: ['b5'],
    correctMoveExplanation: 'Sensacional! O Cavalo saltou e liberou o ataque fulminante da Dama/Torre em linha reta!',
    hint: 'Mova o Cavalo de d4 para b5.',
    completedPoints: 30,
  },
  {
    id: 'lesson_afogamento',
    title: '18. Rei Afogado (Cuidado com o Empate!)',
    pieceName: 'Rei Afogado',
    pieceIcon: '⚖️',
    conceptDescription:
      'O "Afogamento" é um empate que acontece quando um jogador NÃO está em xeque, mas não tem NENHUM lance legal para fazer. Quando você estiver com muita vantagem de peças, tome muito cuidado para deixar pelo menos uma casa de fuga para o Rei adversário não ser afogado!',
    instruction: 'Em vez de prender o Rei preto sem xeque, dê o xeque-mate definitivo com a Dama em b7!',
    initialFen: 'k7/8/1K6/8/8/8/8/1Q6 w - - 0 1',
    allowedMoves: [{ from: 'b1', to: 'b7' }, { from: 'b1', to: 'a1' }, { from: 'b1', to: 'g1' }, { from: 'b1', to: 'h7' }],
    targetSquares: ['b7'],
    correctMoveExplanation: 'XEQUE-MATE! Você aplicou o mate perfeito sem afogar o Rei adversário!',
    hint: 'Mova a Dama branca para b7 (Qb7#) para aplicar o mate.',
    completedPoints: 30,
  },
  {
    id: 'lesson_abertura_centro',
    title: '19. Princípios da Abertura: O Domínio do Centro',
    pieceName: 'Centro do Tabuleiro',
    pieceIcon: '👑',
    conceptDescription:
      'Os 3 Mandamentos de Ouro de uma grande Abertura de Xadrez são: 1) Dominar as 4 casas centrais (e4, d4, e5, d5); 2) Desenvolver os Cavalos e Bispos antes de mexer a Dama; 3) Fazer o Roque cedo para proteger o Rei!',
    instruction: 'Inicie a partida com o lance clássico dos Grandes Mestres: ocupe o centro com Peão em e4!',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    allowedMoves: [{ from: 'e2', to: 'e4' }],
    targetSquares: ['e4'],
    correctMoveExplanation: 'Magnífico! O lance 1. e4 é o pilar da estratégia no xadrez moderno, controlando o centro e liberando Bispo e Dama.',
    hint: 'Avance o peão da casa e2 para a casa central e4.',
    completedPoints: 20,
  },
  {
    id: 'lesson_mate_pastor',
    title: '20. O Famoso Mate do Pastor',
    pieceName: 'Dama e Bispo em f7',
    pieceIcon: '⚡',
    conceptDescription:
      'O Mate do Pastor é uma das vitórias mais rápidas do xadrez (ocorre em 4 lances). A Dama e o Bispo unem forças para atacar o ponto fraco f7 das pretas, que só é defendido pelo Rei.',
    instruction: 'Dê o Mate do Pastor capturando em f7 com a Dama branca!',
    initialFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    allowedMoves: [{ from: 'f3', to: 'f7' }],
    targetSquares: ['f7'],
    correctMoveExplanation: 'Xeque-Mate do Pastor executado com sucesso! A Dama dá o golpe fatal com o apoio do Bispo de c4.',
    hint: 'Mova a Dama branca de f3 para f7 (Qxf7#).',
    completedPoints: 25,
  },
  {
    id: 'lesson_mate_corredor',
    title: '21. O Mate do Corredor (8ª Fileira)',
    pieceName: 'Torre no Corredor',
    pieceIcon: '🏰',
    conceptDescription:
      'O Mate do Corredor acontece quando a Torre ou Dama desce até a última fileira adversária e o Rei inimigo está encurralado atrás de seus próprios peões que nunca se moveram!',
    instruction: 'Desça a Torre branca de d1 até a casa d8 para aplicar o Mate do Corredor!',
    initialFen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    allowedMoves: [{ from: 'd1', to: 'd8' }],
    targetSquares: ['d8'],
    correctMoveExplanation: 'XEQUE-MATE DO CORREDOR! O Rei preto não pode fugir porque os peões de f7, g7 e h7 bloqueiam seu caminho.',
    hint: 'Mova a Torre de d1 para a casa d8 (Rd8#).',
    completedPoints: 25,
  },
  {
    id: 'lesson_mate_escadinha',
    title: '22. O Mate da Escadinha (Duas Torres)',
    pieceName: 'Duas Torres Trabalhando Juntas',
    pieceIcon: '🪜',
    conceptDescription:
      'A técnica da "Escadinha" usa duas Torres (ou Dama e Torre) em fileiras consecutivas para empurrar o Rei adversário casa por casa até a borda do tabuleiro.',
    instruction: 'Mova a Torre de b7 para a casa b8 para dar o xeque-mate final da escadinha!',
    initialFen: '4k3/1R6/8/8/8/8/8/R5K1 w - - 0 1',
    allowedMoves: [{ from: 'a1', to: 'a8' }, { from: 'b7', to: 'a7' }],
    targetSquares: ['a8'],
    correctMoveExplanation: 'Perfeito! A Torre de a1 subiu até a8 aplicando o mate definitivo enquanto a outra Torre corta a fuga!',
    hint: 'Mova a Torre de a1 para a8 (Ra8#).',
    completedPoints: 30,
  },
  {
    id: 'lesson_desvio',
    title: '23. Golpe Tático: O Desvio da Peça Defensora',
    pieceName: 'Desvio Tático',
    pieceIcon: '🎯',
    conceptDescription:
      'O Desvio é um recurso tático onde você força ou atrai a peça guardiã do adversário para longe de uma casa crucial, permitindo um ataque fulminante.',
    instruction: 'Capture a Torre preta em d8 com a Dama branca, desviando a defesa do adversário!',
    initialFen: '3r2k1/5ppp/8/8/8/8/8/3QR1K1 w - - 0 1',
    allowedMoves: [{ from: 'd1', to: 'd8' }],
    targetSquares: ['d8'],
    correctMoveExplanation: 'Sensacional! Ao capturar a Torre em d8, você força o desvio e domina a última fileira.',
    hint: 'Mova a Dama de d1 para d8.',
    completedPoints: 30,
  },
  {
    id: 'lesson_final_rei_dama',
    title: '24. Final de Jogo: Mate com Rei e Dama',
    pieceName: 'Rei e Dama Confinando o Inimigo',
    pieceIcon: '👑',
    conceptDescription:
      'No final de jogo com Rei e Dama contra Rei solitário, a Dama corta o espaço do Rei adversário como uma caixa invisível até o Rei branco chegar para dar o apoio final no mate.',
    instruction: 'Dê o "beijo da morte": coloque a Dama em g7 colada ao Rei preto com o apoio do Rei branco em f6!',
    initialFen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
    allowedMoves: [{ from: 'g1', to: 'g7' }, { from: 'g1', to: 'h7' }],
    targetSquares: ['g7'],
    correctMoveExplanation: 'XEQUE-MATE! O famoso "Beijo da Morte" com a Dama protegida pelo Rei!',
    hint: 'Mova a Dama de g1 para g7.',
    completedPoints: 30,
  },
];

export interface ChessTheoryGuide {
  id: string;
  title: string;
  category: 'pecas' | 'jogadas_especiais' | 'taticas' | 'estrategia' | 'regras';
  categoryLabel: string;
  pieceIcon: string;
  pieceValue?: string;
  summary: string;
  howItMoves: string[];
  howItCaptures: string[];
  proTips: string[];
  commonMistakes: string[];
  audioNarration: string;
  relatedLessonId?: string;
}

export const CHESS_THEORY_GUIDES: ChessTheoryGuide[] = [
  {
    id: 'guide_tabuleiro',
    title: 'O Tabuleiro, Coordenadas e Valor das Peças',
    category: 'regras',
    categoryLabel: 'Regras Básicas',
    pieceIcon: '🏁',
    pieceValue: 'Base do Jogo',
    summary:
      'O xadrez é disputado num tabuleiro de 64 casas quadradas alternadas entre claras e escuras, divididas em 8 colunas (a até h) e 8 fileiras (1 até 8).',
    howItMoves: [
      'Posicionamento correto: A casa do canto inferior direito de cada jogador deve ser sempre BRANCA ("Branca na direita").',
      'As peças brancas começam nas fileiras 1 e 2; as pretas nas fileiras 7 e 8.',
      'Dama na sua cor: A Dama branca começa na casa clara d1; a Dama preta começa na casa escura d8.',
    ],
    howItCaptures: [
      'Valor Relativo das Peças:',
      '• Peão (♙/♟) = 1 Ponto (a infantaria)',
      '• Cavalo (♘/♞) = 3 Pontos (peça menor ágil)',
      '• Bispo (♗/♝) = 3 Pontos (peça menor de longo alcance)',
      '• Torre (♖/♜) = 5 Pontos (peça pesada)',
      '• Dama / Rainha (♕/♛) = 9 Pontos (a mais poderosa)',
      '• Rei (♔/♚) = Infinito (o líder cujo mate encerra o jogo)',
    ],
    proTips: [
      'Use a matemática do valor das peças para saber se uma troca é vantajosa. Exemplo: trocar uma Torre (5) por um Peão (1) é uma perda de 4 pontos!',
      'As 4 casas centrais (d4, d5, e4, e5) são o coração do tabuleiro. Quem controla o centro controla o jogo.',
    ],
    commonMistakes: [
      'Montar o tabuleiro invertido (com casa preta no canto inferior direito).',
      'Colocar a Dama branca na casa do Rei ou trocar a cor inicial da Dama.',
    ],
    audioNarration:
      'O tabuleiro de xadrez possui 64 casas com 8 colunas de A a H e 8 fileiras de 1 a 8. Lembre-se sempre: casa branca no canto direito e Dama na sua própria cor. O Peão vale 1, Cavalo e Bispo valem 3, Torre vale 5, Dama vale 9 e o Rei tem valor infinito.',
    relatedLessonId: 'lesson_tabuleiro',
  },
  {
    id: 'guide_peao',
    title: 'O Peão: Avanço, Captura, Salto Inicial & Promoção',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♙',
    pieceValue: '1 Ponto',
    summary:
      'O Peão é a alma do xadrez. Embora seja a peça de menor valor individual, uma estrutura forte de peões protege o Rei e pode coroar novas Damas.',
    howItMoves: [
      'Anda sempre 1 casa para frente por lance.',
      'Primeiro movimento especial: no seu primeiríssimo lance na partida, cada peão tem a opção de avançar 2 casas de uma só vez.',
      'O peão nunca pode andar para trás ou para os lados.',
    ],
    howItCaptures: [
      'Captura na diagonal: o peão só captura peças adversárias 1 casa à frente nas diagonais!',
      'Se houver uma peça inimiga diretamente à sua frente em linha reta, o peão fica bloqueado e não pode se mover nem capturá-la.',
      'En Passant: se o peão adversário saltar 2 casas e parar ao lado do seu peão na 5ª fileira, você pode capturá-lo na diagonal no lance imediato.',
    ],
    proTips: [
      'Mantenha seus peões em cadeia (um protegendo o outro pela diagonal).',
      'Avance peões para a 8ª fileira para promovê-los a Damas no final de jogo.',
    ],
    commonMistakes: [
      'Tentar capturar em linha reta para frente (peão captura somente na diagonal).',
      'Avançar muitos peões na frente do Rei roqueado, deixando o Rei vulnerável.',
    ],
    audioNarration:
      'O Peão avança 1 casa para frente, mas pode andar 2 casas no seu lance inicial. Ele captura exclusivamente 1 casa na diagonal. Ao chegar na oitava fileira, ele é promovido a uma nova Dama ou outra peça forte!',
    relatedLessonId: 'lesson_peao_avanco',
  },
  {
    id: 'guide_torre',
    title: 'A Torre: Força em Linhas Retas e Colunas Abertas',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♖',
    pieceValue: '5 Pontos (Peça Pesada)',
    summary:
      'A Torre domina linhas retas (horizontais e verticais) com alcance ilimitado. É uma peça devastadora em finais de partida e na 7ª fileira adversária.',
    howItMoves: [
      'Move-se em qualquer direção em linha reta: para frente, para trás, para esquerda e para a direita.',
      'Pode andar quantas casas livres quiser até encontrar o fim do tabuleiro ou outra peça.',
    ],
    howItCaptures: [
      'Captura a primeira peça adversária no seu caminho em linha reta e ocupa a casa dessa peça.',
      'Não pode pular por cima de outras peças amigas ou inimigas.',
    ],
    proTips: [
      'Coloque suas Torres em colunas abertas (colunas sem peões) para penetrar no território inimigo.',
      'Duplique suas Torres na mesma coluna para criar uma "Bateria Pesada" impossível de parar.',
    ],
    commonMistakes: [
      'Deixar as Torres presas nos cantos atrás de peões que nunca se moveram.',
      'Entregar uma Torre por um peão ou cavalo isolado.',
    ],
    audioNarration:
      'A Torre vale 5 pontos e anda em linhas retas, horizontais e verticais, quantas casas quiser. Ela é excelente em colunas abertas e na sétima fileira.',
    relatedLessonId: 'lesson_torre',
  },
  {
    id: 'guide_bispo',
    title: 'O Bispo: Domínio das Diagonais e o Par de Bispos',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♗',
    pieceValue: '3 Pontos (Peça Menor)',
    summary:
      'O Bispo é um atirador de elite que corta o tabuleiro pelas diagonais. Cada jogador começa com um Bispo de casas claras e outro de casas escuras.',
    howItMoves: [
      'Move-se exclusivamente pelas linhas diagonais.',
      'Pode andar quantas casas livres quiser na diagonal.',
      'Regra fundamental: um Bispo que começa em casas claras NUNCA pisará numa casa escura em toda a partida!',
    ],
    howItCaptures: [
      'Captura na diagonal ocupando a casa da peça adversária.',
      'Não pode pular por cima de nenhuma peça.',
    ],
    proTips: [
      'O "Par de Bispos" trabalhando juntos controla tanto as casas claras quanto as escuras, sendo mais forte que dois cavalos em posições abertas.',
      'Desenvolva seus bispos para casas ativas como c4, f4, b5 ou g5 onde tenham longas diagonais livres.',
    ],
    commonMistakes: [
      'Prender o próprio Bispo atrás de uma parede dos seus próprios peões da mesma cor ("Bispo Mau").',
    ],
    audioNarration:
      'O Bispo vale 3 pontos e viaja velozmente pelas diagonais. O Bispo de casas claras nunca pisa em casas escuras e vice-versa. Juntos, o par de bispos domina o tabuleiro.',
    relatedLessonId: 'lesson_bispo',
  },
  {
    id: 'guide_cavalo',
    title: 'O Cavalo: O Salto em "L" e o Poder de Pular Peças',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♘',
    pieceValue: '3 Pontos (Peça Menor)',
    summary:
      'O Cavalo é a peça mais imprevisível e dinâmica do xadrez. É a ÚNICA peça que pode saltar por cima de qualquer outra peça no tabuleiro.',
    howItMoves: [
      'Move-se em formato de "L": duas casas em linha reta e uma para o lado (ou uma em linha reta e duas para o lado).',
      'Pula por cima de peças amigas e inimigas sem ser bloqueado.',
      'A cada movimento, o Cavalo sempre muda de cor de casa (se está numa casa clara, pousa numa escura).',
    ],
    howItCaptures: [
      'Captura apenas a peça adversária que estiver na casa final de pouso do seu "L".',
      'Ele NÃO captura as peças por cima das quais ele saltou durante o caminho!',
    ],
    proTips: [
      'Um Cavalo no centro do tabuleiro (como em d4, e4, d5, e5) pode pular para até 8 casas diferentes, enquanto no canto só tem 2 casas!',
      'Excelente para aplicar Garfos (ataques duplos ao Rei e à Dama).',
    ],
    commonMistakes: [
      'Colocar o Cavalo na borda do tabuleiro ("Cavalo na borda é uma perda").',
      'Achar que o cavalo captura as peças que ele salta por cima.',
    ],
    audioNarration:
      'O Cavalo vale 3 pontos e anda em formato de L. É a única peça do xadrez que salta por cima de outras peças. No centro ele ataca até 8 casas e é especialista em aplicar garfos duplos.',
    relatedLessonId: 'lesson_cavalo',
  },
  {
    id: 'guide_dama',
    title: 'A Dama / Rainha: O Poder Absoluto do Tabuleiro',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♕',
    pieceValue: '9 Pontos (A Mais Poderosa)',
    summary:
      'A Dama combina as forças da Torre e do Bispo. É a peça de maior valor tático e ofensivo, capaz de aplicar ataques mortais em qualquer direção.',
    howItMoves: [
      'Move-se em linha reta (horizontal e vertical) como a Torre.',
      'Move-se em diagonal como o Bispo.',
      'Pode andar quantas casas livres quiser em qualquer dessas 8 direções!',
    ],
    howItCaptures: [
      'Captura qualquer peça adversária no seu caminho em reta ou diagonal e ocupa sua casa.',
      'Não pode pular por cima de outras peças.',
    ],
    proTips: [
      'Não saia com a Dama muito cedo na abertura! Peças menores inimigas podem atacá-la e ganhar tempo de desenvolvimento.',
      'Coordene a Dama com um Bispo ou Cavalo para montar baterias de xeque-mate fulminantes.',
    ],
    commonMistakes: [
      'Perder a Dama por descuido ou cravada.',
      'Tentar atacar sozinho apenas com a Dama sem desenvolver as outras peças.',
    ],
    audioNarration:
      'A Dama é a peça mais poderosa, valendo 9 pontos. Ela anda em todas as retas e diagonais. Use sua força com sabedoria e evite expô-la muito cedo na abertura.',
    relatedLessonId: 'lesson_dama',
  },
  {
    id: 'guide_rei',
    title: 'O Rei: O Líder Sagrado e a Arte da Defesa',
    category: 'pecas',
    categoryLabel: 'Peças do Jogo',
    pieceIcon: '♔',
    pieceValue: 'Infinito (Fim de Jogo)',
    summary:
      'O Rei é a peça mais importante: sua captura nunca ocorre, pois se o Rei não tiver escapatória de um ataque, ocorre o Xeque-Mate e o jogo acaba.',
    howItMoves: [
      'Move-se exatamente 1 casa em qualquer direção (horizontal, vertical ou diagonal).',
      'Regra de Ouro: o Rei NUNCA pode se colocar em uma casa que esteja atacada por uma peça adversária.',
      'Dois Reis nunca podem ficar em casas vizinhas coladas (deve haver pelo menos 1 casa de distância entre eles).',
    ],
    howItCaptures: [
      'Captura qualquer peça adversária desprotegida a 1 casa de distância.',
      'Não pode capturar uma peça que esteja protegida por outra peça inimiga.',
    ],
    proTips: [
      'No início e meio-jogo, faça o Roque para esconder o Rei com segurança no canto atrás de peões.',
      'No final de jogo (quando restam poucas peças), o Rei se transforma numa peça ativa de ataque para apoiar a coroação de peões!',
    ],
    commonMistakes: [
      'Deixar o Rei no centro aberto sem rocar.',
      'Mover o Rei para uma casa sob xeque ilegal.',
    ],
    audioNarration:
      'O Rei anda 1 casa em qualquer direção e nunca pode ficar sob ataque de peças inimigas. Proteja seu Rei com o Roque no início e use-o ativamente no final da partida.',
    relatedLessonId: 'lesson_rei',
  },
  {
    id: 'guide_roque',
    title: 'O Roque: Segurança do Rei e Ativação da Torre',
    category: 'jogadas_especiais',
    categoryLabel: 'Jogadas Especiais',
    pieceIcon: '🏰',
    pieceValue: 'Jogada Especial',
    summary:
      'O Roque é a única jogada do xadrez onde você movimenta duas peças no mesmo turno: o Rei e a Torre.',
    howItMoves: [
      'Roque Pequeno (0-0): O Rei anda 2 casas para a direita (e1 -> g1) e a Torre pula para f1.',
      'Roque Grande (0-0-0): O Rei anda 2 casas para a esquerda (e1 -> c1) e a Torre pula para d1.',
      'Condições obrigatórias para poder rocar:',
      '1. O Rei e a Torre escolhida NUNCA se moveram na partida.',
      '2. Não há nenhuma peça entre o Rei e a Torre.',
      '3. O Rei NÃO pode estar em xeque.',
      '4. O Rei não pode passar por nenhuma casa atacada pelo adversário.',
    ],
    howItCaptures: ['O roque é uma jogada puramente defensiva/posicional, não captura peças.'],
    proTips: [
      'Faça o Roque nos primeiros 10 lances da partida para garantir a vitória.',
      'O Roque Pequeno costuma ser mais rápido e mais seguro na maioria das aberturas.',
    ],
    commonMistakes: [
      'Mover a Torre primeiro (a regra oficial diz para tocar e mover o Rei primeiro).',
      'Tentar rocar enquanto está recebendo um xeque.',
    ],
    audioNarration:
      'O Roque move o Rei duas casas em direção à Torre e a Torre salta para o lado dele. Só pode ser feito se o Rei e a Torre nunca se moveram e se o Rei não estiver em xeque nem passar por casas atacadas.',
    relatedLessonId: 'lesson_roque',
  },
  {
    id: 'guide_en_passant',
    title: 'En Passant: A Captura de Peão "De Passagem"',
    category: 'jogadas_especiais',
    categoryLabel: 'Jogadas Especiais',
    pieceIcon: '⚡',
    pieceValue: 'Regra Especial',
    summary:
      'O En Passant é uma regra histórica criada para evitar que um peão escape da captura pulando 2 casas no lance inicial.',
    howItMoves: [
      'Requisitos para En Passant:',
      '1. Seu peão deve estar na 5ª fileira (para as brancas) ou na 4ª fileira (para as pretas).',
      '2. O peão adversário avança 2 casas no seu salto inicial e para na coluna imediatamente ao lado do seu peão.',
      '3. Você DEVE executar a captura En Passant IMEDIATAMENTE no lance seguinte. Se fizer outro lance, perde o direito.',
    ],
    howItCaptures: [
      'Seu peão move-se 1 casa na diagonal para trás do peão adversário e remove o peão inimigo do tabuleiro!',
    ],
    proTips: [
      'Surpreenda adversários que acham que podem escapar do bloqueio pulando 2 casas.',
    ],
    commonMistakes: [
      'Tentar fazer o En Passant vários lances depois (só é válido no lance imediatamente seguinte).',
    ],
    audioNarration:
      'En Passant é a captura de passagem. Se o peão inimigo avançar 2 casas e parar ao lado do seu peão, você pode capturá-lo na diagonal no lance imediato.',
    relatedLessonId: 'lesson_en_passant',
  },
  {
    id: 'guide_xeque_e_mate',
    title: 'Xeque, Defesas, Xeque-Mate e Rei Afogado',
    category: 'taticas',
    categoryLabel: 'Combate e Finais',
    pieceIcon: '👑⚔️',
    pieceValue: 'Decisão da Partida',
    summary:
      'Aprenda a diferença crucial entre Xeque (aviso de ataque), as 3 defesas possíveis, Xeque-Mate (vitória) e Rei Afogado (empate).',
    howItMoves: [
      'XEQUE: Quando o Rei é atacado diretamente. Você é OBRIGADO a sair do xeque!',
      'As 3 Defesas Sagradas do Xeque (C-P-R):',
      '1. Capturar a peça agressora.',
      '2. Proteger / Bloquear a linha de tiro colocando uma peça no meio.',
      '3. Retirar / Fugir com o Rei para uma casa segura.',
      'XEQUE-MATE: Quando o Rei está em xeque e NENHUMA das 3 defesas é possível. Fim de jogo!',
      'REI AFOGADO: Quando o Rei NÃO está em xeque, mas o jogador da vez não tem nenhum lance legal permitido. Resultado: EMPATE!',
    ],
    howItCaptures: ['O Rei nunca é retirado do tabuleiro; o mate encerra o jogo instantaneamente.'],
    proTips: [
      'Sempre verifique xeques, capturas e ameaças em cada lance antes de jogar.',
      'Em finais com Dama de vantagem, nunca encurrale o Rei adversário no canto sem dar xeque, para não causar empate por afogamento.',
    ],
    commonMistakes: [
      'Fazer um lance ilegal enquanto o próprio Rei está em xeque.',
      'Confundir Afogamento com vitória.',
    ],
    audioNarration:
      'Xeque é um ataque ao Rei que exige defesa imediata fugindo, bloqueando ou capturando. Xeque-mate é o xeque sem saída que dá a vitória. Já o Rei Afogado sem lances legais resulta em empate.',
    relatedLessonId: 'lesson_xeque_mate',
  },
  {
    id: 'guide_taticas_garfo_cravada',
    title: 'Golpes Táticos: Garfo, Cravada e Ataque Descoberto',
    category: 'taticas',
    categoryLabel: 'Táticas e Truques',
    pieceIcon: '🎯',
    pieceValue: 'Armas Táticas',
    summary:
      'Táticas são combinações de curto prazo que ganham material ou aplicam xeque-mate forçado.',
    howItMoves: [
      '1. GARFO (Ataque Duplo): Uma única peça ataca duas ou mais peças inimigas simultaneamente (especialidade do Cavalo e dos Peões).',
      '2. CRAVADA: Uma peça atacante imobiliza uma peça adversária porque atrás dela está o Rei (Cravada Absoluta) ou a Dama (Cravada Relativa).',
      '3. ATAQUE DESCOBERTO: Uma peça se move e libera o raio de ação de uma Torre, Bispo ou Dama que estava atrás dela.',
      '4. ESPETO (Skewer): O oposto da cravada: ataca uma peça valiosa na frente (como o Rei) forçando-a a sair e capturando a peça de trás.',
    ],
    howItCaptures: ['Exploram a geometria do tabuleiro para ganhar peças de maior valor.'],
    proTips: [
      'Antes de jogar, procure por peças adversárias "no ar" (sem proteção). Peças desprotegidas são vítimas fáceis de garfos!',
    ],
    commonMistakes: ['Colocar a Dama e o Rei na mesma diagonal de um Bispo inimigo.'],
    audioNarration:
      'Os principais golpes táticos são o Garfo, que ataca duas peças ao mesmo tempo; a Cravada, que impede uma peça de se mover; e o Ataque Descoberto, que destampa uma ameaça oculta.',
    relatedLessonId: 'lesson_garfo',
  },
  {
    id: 'guide_abertura_estrategia',
    title: 'Os 3 Princípios de Ouro da Abertura de Xadrez',
    category: 'estrategia',
    categoryLabel: 'Estratégia e Abertura',
    pieceIcon: '🧠',
    pieceValue: 'Estratégia Mestra',
    summary:
      'Grandes Mestres seguem 3 regras universais nos primeiros 10 a 15 lances da partida para garantir uma posição vencedora.',
    howItMoves: [
      '1. Ocupe e Controle o Centro: Comece jogando Peão em e4 ou d4 para dominar o centro do tabuleiro.',
      '2. Desenvolva as Peças Menores: Mova seus Cavalos e Bispos para casas ativas. Regra prática: Cavalos antes dos Bispos!',
      '3. Proteja o Rei com o Roque: Faça o Roque cedo para esconder o Rei e ligar as duas Torres.',
    ],
    howItCaptures: ['Desenvolva atacando e defendendo casas chaves.'],
    proTips: [
      'Não mova a mesma peça duas vezes na abertura a menos que seja para capturar ou escapar.',
      'Não saia caçando peões com a Dama no início.',
    ],
    commonMistakes: [
      'Avançar os peões das laterais (a4, h4) em vez do centro.',
      'Deixar o Rei no meio do tabuleiro com o centro aberto.',
    ],
    audioNarration:
      'Os três princípios de ouro da abertura são: controlar o centro com peões, desenvolver cavalos e bispos com rapidez e fazer o roque cedo para proteger o Rei.',
    relatedLessonId: 'lesson_abertura_centro',
  },
];

// 10 Tactical Board Puzzles with Real Chess Positions
export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 'puzzle_mate_pastor',
    title: 'Xeque-Mate do Pastor em 1 Lance',
    theme: 'mate',
    themeLabel: 'Xeque-Mate',
    difficulty: 'facil',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    turn: 'w',
    objective: 'Encontre o lance fatal da Dama branca que aplica Xeque-Mate no Rei preto!',
    winningMove: { from: 'f3', to: 'f7' },
    hint: 'A casa f7 está defendida pelo Bispo em c4. A Dama pode dar o golpe final em f7!',
    explanation: 'Dama em f7 (Qxf7#)! O Rei preto está em xeque e não pode capturar porque a Dama está protegida pelo Bispo.',
    points: 25,
  },
  {
    id: 'puzzle_garfo_cavalo',
    title: 'O Famoso Garfo Real de Cavalo',
    theme: 'garfo',
    themeLabel: 'Garfo (Ataque Duplo)',
    difficulty: 'facil',
    fen: 'r3k2r/ppp2ppp/8/3N4/8/8/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    turn: 'w',
    objective: 'Mova o Cavalo branco de d5 para c7 dando um garfo com xeque no Rei e atacando a Torre em a8!',
    winningMove: { from: 'd5', to: 'c7' },
    hint: 'O Cavalo em d5 pode saltar para c7 dando xeque no Rei em e8 e atacando a Torre em a8.',
    explanation: 'Garfo perfeito de Cavalo (Nxc7+)! O Rei é obrigado a se mover e você ganha a Torre no lance seguinte.',
    points: 25,
  },
  {
    id: 'puzzle_mate_corredor',
    title: 'Xeque-Mate do Corredor (Back Rank)',
    theme: 'mate',
    themeLabel: 'Mate do Corredor',
    difficulty: 'facil',
    fen: '6k1/5ppp/8/8/8/8/4R1PP/6K1 w - - 0 1',
    turn: 'w',
    objective: 'O Rei preto está preso atrás dos seus próprios peões. Dê o mate na 8ª fileira!',
    winningMove: { from: 'e2', to: 'e8' },
    hint: 'A Torre branca pode invadir a última fileira (e8) dando xeque sem defesa.',
    explanation: 'Torre em e8 (Re8#)! Como os peões pretos bloqueiam a fuga do Rei, o mate é inevitável.',
    points: 25,
  },
  {
    id: 'puzzle_cravada_bispo',
    title: 'A Cravada Absoluta do Bispo',
    theme: 'cravada',
    themeLabel: 'Cravada',
    difficulty: 'medio',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 1',
    turn: 'b',
    objective: 'Cravar o Cavalo branco em c3 contra o Rei em e1 usando o Bispo preto!',
    winningMove: { from: 'b4', to: 'c3' },
    alternativeWinningMoves: [{ from: 'b4', to: 'c3' }],
    hint: 'O Bispo em b4 já está cravando o cavalo de c3. Ao capturar, ele desestrutura a ala da Dama.',
    explanation: 'Cravada absoluta: a peça cravada não pode se mover porque exporia o Rei diretamente.',
    points: 30,
  },
  {
    id: 'puzzle_mate_escadinha',
    title: 'Mate da Escadinha com 2 Torres',
    theme: 'mate',
    themeLabel: 'Xeque-Mate',
    difficulty: 'medio',
    fen: '7k/R7/1R6/8/8/8/8/4K3 w - - 0 1',
    turn: 'w',
    objective: 'Use a Torre de b6 para fechar a última fileira e dar o Xeque-mate da escadinha!',
    winningMove: { from: 'b6', to: 'b8' },
    hint: 'A Torre em a7 corta a 7ª fileira. A outra Torre deve atacar a 8ª fileira (b8).',
    explanation: 'Rb8#! A Torre de a7 impede o Rei de descer para a 7ª fileira e a Torre de b8 dá o mate.',
    points: 30,
  },
  {
    id: 'puzzle_ataque_duplo_dama',
    title: 'Ataque Duplo com a Dama Central',
    theme: 'duplo',
    themeLabel: 'Ataque Duplo',
    difficulty: 'medio',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R1BQKB1R b KQkq - 0 1',
    turn: 'b',
    objective: 'Capture a peça em c3 com o Bispo preto criando uma ameaça mortal!',
    winningMove: { from: 'b4', to: 'c3' },
    hint: 'Bxc3+ com xeque e ataque à Torre.',
    explanation: 'Excelente! O Bispo captura com xeque e ganha material decisivo.',
    points: 30,
  },
  {
    id: 'puzzle_mate_anastasia',
    title: 'Xeque-Mate com Dama e Cavalo',
    theme: 'mate',
    themeLabel: 'Xeque-Mate Tático',
    difficulty: 'dificil',
    fen: '5rk1/5ppp/4N3/8/8/8/5PPP/4Q1K1 w - - 0 1',
    turn: 'w',
    objective: 'Capture a Torre em f8 com o Cavalo eliminando a defesa do adversário!',
    winningMove: { from: 'e6', to: 'f8' },
    hint: 'O Cavalo em e6 pode capturar a Torre de f8.',
    explanation: 'Nxf8! Ganho decisivo de material limpando o caminho para a vitória.',
    points: 35,
  },
  {
    id: 'puzzle_promocao_vencedora',
    title: 'A Promoção Decisiva do Peão',
    theme: 'especial',
    themeLabel: 'Promoção',
    difficulty: 'dificil',
    fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1',
    turn: 'w',
    objective: 'Promova o peão na 8ª fileira para uma nova Dama e garanta a vitória!',
    winningMove: { from: 'e7', to: 'e8', promotion: 'q' },
    hint: 'Avance o peão de e7 para e8.',
    explanation: 'e8=Q! Com uma Dama nova no tabuleiro, a vitória branca é garantida.',
    points: 35,
  },
];
