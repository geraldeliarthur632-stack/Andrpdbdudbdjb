import { GradeLevel, Question, SubjectId } from '../types';
import { shuffleQuestionOptions, shuffleQuestionsList } from './curriculumData';

export interface CadernoTopic {
  id: string;
  subjectId: SubjectId;
  title: string;
  gradeStage: string; // e.g. "Fundamental II", "Ensino Médio", "Iniciante do Zero"
  difficulty: 'fácil' | 'médio' | 'avançado';
  icon: string;
  summary: string;
  detailedTheory: string[];
  howToDoStepByStep: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  solvedExamples: {
    problem: string;
    resolutionSteps: string[];
    finalAnswer: string;
    pedagogicalTip: string;
  }[];
  goldenRules: string[];
  commonMistakes: string[];
  practiceQuestions: Question[];
}

export const CADERNO_SUBJECTS_INFO: {
  id: SubjectId;
  name: string;
  icon: string;
  badge: string;
  color: string;
  bgGradient: string;
  description: string;
}[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '📐',
    badge: 'Cálculo & Lógica',
    color: 'text-amber-700 border-amber-300 bg-amber-50',
    bgGradient: 'from-amber-500 to-orange-600',
    description: 'Frações, equações, porcentagem, geometria e raciocínio prático passo a passo.',
  },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    icon: '✍️',
    badge: 'Gramática & Texto',
    color: 'text-blue-700 border-blue-300 bg-blue-50',
    bgGradient: 'from-blue-600 to-indigo-700',
    description: 'Pontuação, concordância, classes de palavras, figuras de linguagem e redação.',
  },
  {
    id: 'ciencias',
    name: 'Ciências da Natureza',
    icon: '🔬',
    badge: 'Fund. I e II',
    color: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    bgGradient: 'from-emerald-600 to-teal-700',
    description: 'Corpo humano, ecossistemas, células, reações e física do cotidiano.',
  },
  {
    id: 'historia',
    name: 'História',
    icon: '🏛️',
    badge: 'Sociedade & Fatos',
    color: 'text-rose-700 border-rose-300 bg-rose-50',
    bgGradient: 'from-rose-600 to-red-700',
    description: 'Brasil Colônia, Império, República, Guerras Mundiais e Cidadania.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '🌍',
    badge: 'Espaço & Clima',
    color: 'text-cyan-700 border-cyan-300 bg-cyan-50',
    bgGradient: 'from-cyan-600 to-blue-700',
    description: 'Relevo, biomas brasileiros, urbanização, geopolítica e cartografia.',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: '⚡',
    badge: 'Ensino Médio & ENEM',
    color: 'text-violet-700 border-violet-300 bg-violet-50',
    bgGradient: 'from-violet-600 to-purple-700',
    description: 'Cinemática, Leis de Newton, Trabalho, Energia, Óptica e Eletricidade.',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '🧪',
    badge: 'Ensino Médio & ENEM',
    color: 'text-pink-700 border-pink-300 bg-pink-50',
    bgGradient: 'from-pink-600 to-rose-700',
    description: 'Tabela periódica, ligações químicas, estequiometria e soluções.',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '🧬',
    badge: 'Ensino Médio & ENEM',
    color: 'text-teal-700 border-teal-300 bg-teal-50',
    bgGradient: 'from-teal-600 to-emerald-700',
    description: 'Citologia, Genética Mendeliana, Fisiologia e Ecologia.',
  },
  {
    id: 'ingles',
    name: 'Língua Inglesa',
    icon: '🇬🇧',
    badge: 'Conteúdo da Série (BNCC)',
    color: 'text-sky-700 border-sky-300 bg-sky-50',
    bgGradient: 'from-sky-600 to-blue-700',
    description: 'Gramática, tempos verbais (Present, Past, Future, Modals), conectivos, leitura e falsos cognatos.',
  },
  {
    id: 'xadrez',
    name: 'Xadrez',
    icon: '♟️',
    badge: 'Estratégia & Raciocínio Lógico',
    color: 'text-stone-700 border-stone-300 bg-stone-50',
    bgGradient: 'from-stone-700 to-slate-900',
    description: 'Fundamentos do tabuleiro, movimento e valor das peças, táticas (garfo, cravada, espeto), roque e xeque-mate.',
  },
  {
    id: 'espanhol',
    name: 'Espanhol (Do Zero)',
    icon: '🇪🇸',
    badge: '🟢 Começando do Absoluto Zero',
    color: 'text-amber-800 border-amber-300 bg-amber-50',
    bgGradient: 'from-amber-600 to-red-600',
    description: 'Para quem nunca teve aula: alfabeto, saudações, falsos amigos, verbos ser/estar e pronúncia.',
  },
  {
    id: 'italiano',
    name: 'Italiano (Do Zero)',
    icon: '🇮🇹',
    badge: '🟢 Começando do Absoluto Zero',
    color: 'text-emerald-800 border-emerald-300 bg-emerald-50',
    bgGradient: 'from-emerald-600 to-rose-600',
    description: 'Para quem nunca teve aula: sons especiais (gli, gn, c/ch), saudações, verbos essere/avere e frases úteis.',
  },
];

const RAW_CADERNO_TOPICS: CadernoTopic[] = [
  // 1. MATEMÁTICA: FRAÇÕES & OPERAÇÕES
  {
    id: 'cad_mat_fracoes',
    subjectId: 'matematica',
    title: 'Frações, Simplificação e Operações',
    gradeStage: 'Fundamental II & Revisão Médio',
    difficulty: 'fácil',
    icon: '🍰',
    summary: 'Aprenda o que é fração, como somar, subtrair, multiplicar e dividir frações com o método prático e exemplos do dia a dia.',
    detailedTheory: [
      'Uma fração é uma representação matemática de partes iguais de um todo. O número superior chama-se NUMERADOR (quantas partes foram consideradas) e o inferior DENOMINADOR (em quantas partes o todo foi dividido).',
      'Frações Equivalentes: São frações que representam a mesma quantidade, mesmo com números diferentes. Exemplo: 1/2 = 2/4 = 4/8 = 50%. Obtemos multiplicando ou dividindo o numerador e o denominador pelo mesmo número.',
      'Soma e Subtração com denominadores iguais: Mantém o denominador e opera apenas os numeradores (ex: 2/7 + 3/7 = 5/7).',
      'Soma e Subtração com denominadores diferentes: Precisamos encontrar o MMC (Mínimo Múltiplo Comum) para igualar os denominadores antes de somar.',
      'Multiplicação de Frações: Multiplica-se numerador por numerador e denominador por denominador (ex: 2/3 × 4/5 = 8/15).',
      'Divisão de Frações: Mantém a primeira fração e multiplica pelo inverso da segunda fração (ex: 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6).'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Identificar os Denominadores',
        description: 'Verifique se os denominadores (números de baixo) são iguais ou diferentes.'
      },
      {
        stepNumber: 2,
        title: 'Calcular o MMC se forem diferentes',
        description: 'Encontre o MMC dos denominadores para transformá-las em frações com o mesmo denominador comum.'
      },
      {
        stepNumber: 3,
        title: 'Dividir pelo de baixo e multiplicar pelo de cima',
        description: 'Pegue o novo denominador, divida pelo antigo e multiplique pelo numerador correspondente.'
      },
      {
        stepNumber: 4,
        title: 'Simplificar a Resposta',
        description: 'Sempre divida numerador e denominador pelo Maior Divisor Comum (MDC) até a fração ficar irredutível.'
      }
    ],
    solvedExamples: [
      {
        problem: 'Calcule: 1/3 + 1/6 e dê a resposta simplificada.',
        resolutionSteps: [
          'Passo 1: Denominadores são 3 e 6. O MMC(3, 6) = 6.',
          'Passo 2: Converter 1/3 para base 6 ➔ 6 ÷ 3 = 2 ➔ 2 × 1 = 2/6.',
          'Passo 3: Somar as frações com mesma base ➔ 2/6 + 1/6 = 3/6.',
          'Passo 4: Simplificar dividindo ambos por 3 ➔ 3÷3 / 6÷3 = 1/2.'
        ],
        finalAnswer: '1/2',
        pedagogicalTip: 'Sempre confira se a fração final pode ser dividida pelo mesmo número em cima e embaixo!'
      },
      {
        problem: 'Efetue a multiplicação: (3/4) × (2/5).',
        resolutionSteps: [
          'Passo 1: Multiplicar numeradores ➔ 3 × 2 = 6.',
          'Passo 2: Multiplicar denominadores ➔ 4 × 5 = 20.',
          'Passo 3: Fração obtida = 6/20. Dividindo ambos por 2 ➔ 3/10.'
        ],
        finalAnswer: '3/10',
        pedagogicalTip: 'Na multiplicação NÃO precisa tirar MMC, é só multiplicar reto!'
      }
    ],
    goldenRules: [
      'Na multiplicação, multiplica reto: cima com cima, baixo com baixo.',
      'Na divisão, copia a primeira e multiplica pelo inverso da segunda.',
      'Nunca some os denominadores (ex: 1/5 + 2/5 = 3/5, NUNCA 3/10).'
    ],
    commonMistakes: [
      'Somar denominadores (Erro grave: 1/2 + 1/2 NÃO é 2/4, é 2/2 = 1 inteiro).',
      'Tentar tirar MMC na multiplicação (desnecessário e causa confusão).'
    ],
    practiceQuestions: [
      {
        id: 'cq_mat_1',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual é o resultado da soma 2/5 + 1/5?',
        options: ['3/5', '3/10', '2/25', '1/5'],
        correctIndex: 0,
        explanation: 'Com denominadores iguais (5), somamos apenas os numeradores: 2 + 1 = 3, mantendo o 5. Resultado: 3/5.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_mat_2',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Verdadeiro ou Falso: A fração 4/8 é equivalente a 1/2.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! Dividindo o numerador e denominador de 4/8 por 4, obtemos 1/2.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_mat_3',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Fale a resposta com a sua voz: Quanto é 1/2 multiplicado por 2/3?',
        options: ['1/3', '2/5', '3/5', '1/6'],
        correctIndex: 0,
        explanation: '(1 × 2) / (2 × 3) = 2/6. Simplificando por 2, temos 1/3.',
        difficulty: 'medium',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['um terço', '1/3', 'letra a', 'a']
      },
      {
        id: 'cq_mat_4',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual é o inverso da fração 3/7?',
        options: ['7/3', '3/7', '-3/7', '1/3'],
        correctIndex: 0,
        explanation: 'O inverso de uma fração é obtido trocando o numerador com o denominador. Inverso de 3/7 é 7/3.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_mat_5',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Verdadeiro ou Falso: Na multiplicação de frações, devemos sempre tirar o MMC dos denominadores.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! Na multiplicação multiplica-se direto (numerador com numerador, denominador com denominador). O MMC é usado apenas na soma e subtração com denominadores diferentes.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_mat_6',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Quanto vale 3/4 de 20 chocolates?',
        options: ['15 chocolates', '12 chocolates', '10 chocolates', '18 chocolates'],
        correctIndex: 0,
        explanation: 'Calculamos dividindo 20 pelo denominador 4 (20 ÷ 4 = 5) e multiplicando pelo numerador 3 (5 × 3 = 15).',
        difficulty: 'medium',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_mat_7',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Fale com a sua voz: Qual é a fração irredutível de 10/20?',
        options: ['1/2', '2/4', '5/10', '1/4'],
        correctIndex: 0,
        explanation: 'Dividindo 10 e 20 por 10, obtemos 1/2 (meio).',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['meio', 'um meio', '1/2', 'letra a', 'a']
      },
      {
        id: 'cq_mat_8',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Verdadeiro ou Falso: O número de cima da fração é chamado de denominador.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! O número de cima é o NUMERADOR. O número de baixo é o DENOMINADOR.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_mat_9',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Resolva a divisão: (1/2) ÷ (1/4). Qual o resultado?',
        options: ['2', '1/8', '1/2', '4'],
        correctIndex: 0,
        explanation: 'Mantemos a 1ª fração (1/2) e multiplicamos pelo inverso da 2ª (4/1) ➔ (1/2) × (4/1) = 4/2 = 2.',
        difficulty: 'medium',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_mat_10',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Se uma pizza de 8 pedaços tem 3 pedaços comidos, qual fração representa o que RESTOU?',
        options: ['5/8', '3/8', '8/5', '1/2'],
        correctIndex: 0,
        explanation: 'O total são 8/8. Se 3/8 foram comidos, restam 8/8 - 3/8 = 5/8.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },

  // 2. PORTUGUÊS: PONTUAÇÃO & O USO DA VÍRGULA
  {
    id: 'cad_port_virgula',
    subjectId: 'portugues',
    title: 'Regras da Vírgula e Pontuação Correta',
    gradeStage: 'Fundamental & Médio',
    difficulty: 'médio',
    icon: '📝',
    summary: 'Domine quando usar e quando NUNCA usar a vírgula: vocativo, aposto, enumeração e orações explicativas.',
    detailedTheory: [
      'A vírgula NÃO é uma pausa para respirar. Ela é uma marcação de estrutura sintática da frase.',
      'REGRA DE OURO DA PROIBIÇÃO: NUNCA se separa o SUJEITO do seu VERBO por vírgula (ex: "Os alunos estudaram" está certo; "Os alunos, estudaram" é ERRO GRAVE).',
      'NUNCA se separa o VERBO do seu OBJETO/COMPLEMENTO por vírgula.',
      'USOS OBRIGATÓRIOS: 1. Isolar Vocativo (chamamento: "Mariana, venha aqui!"); 2. Isolar Aposto explicativo ("Pelé, o rei do futebol, nasceu em Minas."); 3. Enumerações ("Comprei maçã, banana, pera e uva."); 4. Isolar adjunto adverbial deslocado ("Ontem à noite, choveu muito.").'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Achar o Sujeito e o Verbo',
        description: 'Pergunte "quem fez a ação?" para achar o sujeito. Garanta que NÃO haja vírgula entre ele e o verbo.'
      },
      {
        stepNumber: 2,
        title: 'Verificar se há chamamento (Vocativo)',
        description: 'Se você está chamando ou falando diretamente com alguém, isole essa pessoa por vírgula.'
      },
      {
        stepNumber: 3,
        title: 'Verificar explicações no meio da frase (Aposto)',
        description: 'Se há um trecho que explica um termo anterior, coloque entre duas vírgulas.'
      }
    ],
    solvedExamples: [
      {
        problem: 'Identifique a pontuação correta: "Ana a melhor aluna da turma passou no exame."',
        resolutionSteps: [
          'Passo 1: O termo "a melhor aluna da turma" explica quem é Ana (é um aposto).',
          'Passo 2: O aposto explicativo deve vir isolado entre vírgulas.',
          'Passo 3: Frase correta: "Ana, a melhor aluna da turma, passou no exame."'
        ],
        finalAnswer: 'Ana, a melhor aluna da turma, passou no exame.',
        pedagogicalTip: 'Se você retirar o termo entre vírgulas, a frase continua com sentido perfeito: "Ana passou no exame".'
      }
    ],
    goldenRules: [
      'Sujeito e verbo são inseparáveis: nada de vírgula entre eles!',
      'Vocativo sempre tem vírgula ("Boa noite, professor!").',
      'Antes de "mas", "porém", "contudo", usa-se vírgula ("Estudei, mas não fui bem").'
    ],
    commonMistakes: [
      'Achar que vírgula é pausa para respirar.',
      'Colocar vírgula entre sujeito e verbo ("O menino da escola, comeu o bolo" ➔ INCORRETO).'
    ],
    practiceQuestions: [
      {
        id: 'cq_port_1',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Assinale a frase com a pontuação CORRETA quanto ao vocativo:',
        options: ['Bom dia, professora!', 'Bom dia professora!', 'Bom, dia professora!', 'Bom dia professora,!'],
        correctIndex: 0,
        explanation: 'O vocativo (termo de chamamento: "professora") deve ser sempre isolado por vírgula.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_port_2',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Verdadeiro ou Falso: É permitido colocar vírgula para separar o sujeito direto do seu verbo.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! É uma regra fundamental da gramática: NUNCA se separa o sujeito do verbo por vírgula.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_port_3',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Fale com a voz: Qual termo isolado por vírgulas explica quem é a pessoa na frase "Dom Pedro II, imperador do Brasil, era culto"?',
        options: ['Imperador do Brasil', 'Era culto', 'Dom Pedro', 'Brasil'],
        correctIndex: 0,
        explanation: '"Imperador do Brasil" é o aposto explicativo e vem isolado entre vírgulas.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['imperador do brasil', 'aposto', 'letra a', 'a']
      },
      {
        id: 'cq_port_4',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Assinale a alternativa em que a vírgula foi usada de forma INCORRETA:',
        options: ['Os estudantes dedicados, tiraram nota dez.', 'Comprei lápis, borracha, caneta e régua.', 'São Paulo, a maior metrópole do país, não para.', 'Amanhã pela manhã, teremos prova.'],
        correctIndex: 0,
        explanation: 'Em "Os estudantes dedicados, tiraram nota dez", a vírgula está separando indevidamente o sujeito ("Os estudantes dedicados") do verbo ("tiraram").',
        difficulty: 'medium',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_port_5',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Verdadeiro ou Falso: Antes da conjunção adversativa "mas" (com sentido de oposição), o uso da vírgula é obrigatório.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! Antes de conjunções adversativas (mas, porém, contudo, todavia) usa-se vírgula (ex: "Correu muito, mas perdeu o ônibus").',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_port_6',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Qual pontuação final deve ser usada em uma pergunta direta?',
        options: ['Ponto de interrogação (?)', 'Ponto de exclamação (!)', 'Reticências (...)', 'Ponto e vírgula (;)'],
        correctIndex: 0,
        explanation: 'Perguntas diretas são finalizadas obrigatoriamente com o ponto de interrogação (?).',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_port_7',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Fale com a voz: Em "Ontem, choveu bastante", por que a palavra "Ontem" tem vírgula?',
        options: ['Adjunto adverbial deslocado', 'Vocativo', 'Aposto', 'Sujeito composto'],
        correctIndex: 0,
        explanation: '"Ontem" é um adjunto adverbial de tempo deslocado para o início da oração, por isso recebe vírgula.',
        difficulty: 'medium',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['adjunto adverbial', 'adjunto adverbial deslocado', 'tempo', 'letra a']
      },
      {
        id: 'cq_port_8',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Verdadeiro ou Falso: A vírgula é simplesmente uma pausa de respiração do leitor.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! A vírgula segue regras sintáticas e gramaticais precisas, não tem relação com o fôlego da fala.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_port_9',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Qual sinal de pontuação é usado para indicar uma citação direta ou fala de personagem após um verbo de elocução?',
        options: ['Dois-pontos (:)', 'Ponto de exclamação (!)', 'Ponto final (.)', 'Vírgula (,)'],
        correctIndex: 0,
        explanation: 'Os dois-pontos introduzem a fala direta ou uma citação (ex: "O professor disse: Abram os livros").',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_port_10',
        subject: 'portugues',
        grade: '7_fund',
        topic: 'Pontuação',
        question: 'Assinale a alternativa com o uso correto das reticências (...) :',
        options: ['Para indicar hesitação, dúvida ou interrupção de pensamento', 'Para terminar uma frase afirmativa simples', 'Para separar sujeito e predicado', 'Para fazer uma pergunta direta'],
        correctIndex: 0,
        explanation: 'As reticências indicam suspensão, interrupção ou hesitação no fluxo do pensamento.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },

  // 3. ESPANHOL (DO ZERO): ALFABETO, SAUDAÇÕES & FALSOS AMIGOS
  {
    id: 'cad_esp_zero',
    subjectId: 'espanhol',
    title: 'Espanhol Começando do Absoluto Zero',
    gradeStage: 'Nível Iniciante A1 (Para quem nunca estudou)',
    difficulty: 'fácil',
    icon: '🇪🇸',
    summary: 'Aprenda espanhol passo a passo do início: alfabeto, sons especiais, saudações, apresentações pessoais e os perigosos falsos amigos (heterossemânticos).',
    detailedTheory: [
      'O espanhol possui 27 letras. A letra exclusiva é o "Ñ" (com som de NH em português, ex: España = Espanha, Niño = Menino).',
      'SONS IMPORTANTES DO ESPANHOL: 1. "J" e "G (antes de e/i)" têm som raspado de R forte (ex: Jamón = Ramón, Gente = Rente); 2. "LL" tem som de "i" ou "dj" (ex: Me llamo = Me iamo / Me djamo); 3. "CH" tem som de "tch" (ex: Chocolate = Tchocolate); 4. "Z" tem som de "S" sibilado na América Latina e de "TH" na Espanha (Zapatos = Sapatos).',
      'SAUDAÇÕES DIÁRIAS: ¡Hola! (Olá), ¡Buenos días! (Bom dia), ¡Buenas tardes! (Boa tarde), ¡Buenas noches! (Boa noite), ¡Adiós! / ¡Hasta luego! (Adeus / Até logo).',
      'APRESENTAÇÃO PESSOAL: "¿Cómo te llamas?" (Como se chama?), "Me llamo..." (Meu nome é...), "Mucho gusto / Encantado" (Muito prazer), "¿De dónde eres?" (De onde você é?), "Soy de Brasil" (Sou do Brasil).',
      'FALSOS AMIGOS (HETEROSSEMÂNTICOS): Palavras que parecem português mas significam outra coisa! "Embarazada" = Grávida (não é envergonhada); "Apellido" = Sobrenome (não é apelido); "Propina" = Gorjeta (não é propina ilegal); "Exquisito" = Saboroso/Delicioso (não é esquisito estranho); "Largo" = Comprido/Longo (não é largo de largura, que é ancho).'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Memorizar as Saudações e Despedidas Básicas',
        description: 'Comece sempre com ¡Hola! e use ¡Buenos días! pela manhã e ¡Hasta luego! ao se despedir.'
      },
      {
        stepNumber: 2,
        title: 'Treinar a Apresentação Pessoal',
        description: 'Formule sua frase: "¡Hola! Me llamo [Seu Nome], soy de Brasil y tengo [Sua Idade] años. ¡Mucho gusto!"'
      },
      {
        stepNumber: 3,
        title: 'Cuidado com os Falsos Amigos',
        description: 'Nunca diga que está "embarazada" se estiver com vergonha (diga "tengo vergüenza").'
      }
    ],
    solvedExamples: [
      {
        problem: 'Traduza para o espanhol: "Olá, me chamo Carlos e sou brasileiro. Muito prazer!"',
        resolutionSteps: [
          'Passo 1: Olá ➔ ¡Hola!',
          'Passo 2: me chamo Carlos ➔ me llamo Carlos',
          'Passo 3: e sou brasileiro ➔ y soy brasileño',
          'Passo 4: Muito prazer ➔ ¡Mucho gusto! (ou ¡Encantado!)'
        ],
        finalAnswer: '¡Hola! Me llamo Carlos y soy brasileño. ¡Mucho gusto!',
        pedagogicalTip: 'Note que em espanhol usa-se a exclamação e interrogação invertidas no início da frase (¡ ! e ¿ ?).'
      },
      {
        problem: 'O que significa dizer "La comida del restaurante está exquisita"?',
        resolutionSteps: [
          'Passo 1: Identificar a palavra "exquisita".',
          'Passo 2: "Exquisito" em espanhol é um falso amigo que significa "delicioso / saboroso / de alta qualidade".',
          'Passo 3: A frase significa que a comida está deliciosa!'
        ],
        finalAnswer: 'A comida do restaurante está deliciosa / saborosa.',
        pedagogicalTip: 'Não confunda com o português "esquisito", que em espanhol se diz "raro" ou "extraño".'
      }
    ],
    goldenRules: [
      'A letra Ñ sempre tem som de "NH" (ex: año = ano, niño = menino).',
      'Use ¿ no início de perguntas e ¡ no início de exclamações.',
      'Apellido significa SOBRENOME, e Apodo significa APELIDO.'
    ],
    commonMistakes: [
      'Achar que "exquisito" significa estranho.',
      'Achar que "embarazada" significa envergonhada (significa grávida).',
      'Pronunciar o J como em português (em espanhol soa como R forte).'
    ],
    practiceQuestions: [
      {
        id: 'cq_esp_1',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Como se diz "Bom dia" em espanhol?',
        options: ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!', '¡Hola amigo!'],
        correctIndex: 0,
        explanation: 'Pela manhã usamos a saudação "¡Buenos días!".',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_esp_2',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Verdadeiro ou Falso: Em espanhol, a palavra "apellido" significa "sobrenome" da família.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! "Apellido" significa sobrenome (ex: Silva, Santos). Apelido em espanhol é chamado de "apodo".',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_esp_3',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Fale com a voz: Como você responde em espanhol para "Muito prazer"?',
        options: ['Mucho gusto', 'Hasta luego', 'Buenos días', 'Por favor'],
        correctIndex: 0,
        explanation: '"Mucho gusto" ou "Encantado" significa "Muito prazer".',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['mucho gusto', 'encantado', 'letra a', 'a']
      },
      {
        id: 'cq_esp_4',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'O que significa a palavra "embarazada" em espanhol?',
        options: ['Grávida (esperando um bebê)', 'Envergonhada', 'Cansada', 'Atrasada'],
        correctIndex: 0,
        explanation: '"Embarazada" é um famoso heterossemântico e significa "grávida". Envergonhada é "avergonzada".',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_esp_5',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Verdadeiro ou Falso: A letra "Ñ" (como em niño ou España) tem o som similar a "NH" em português.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! O Ñ (eñe) produz o som de NH.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_esp_6',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Qual é a resposta correta para a pergunta "¿Cómo te llamas?" ?',
        options: ['Me llamo Lucas', 'Soy de Brasil', 'Tengo 12 años', 'Estoy bien'],
        correctIndex: 0,
        explanation: '"¿Cómo te llamas?" pergunta o nome, e a resposta é "Me llamo..." (Meu nome é...).',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_esp_7',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Fale com a voz: Como se diz "Obrigado" em espanhol?',
        options: ['Gracias', 'De nada', 'Por favor', 'Perdón'],
        correctIndex: 0,
        explanation: '"Gracias" significa "Obrigado/Obrigada".',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['gracias', 'muchas gracias', 'letra a', 'a']
      },
      {
        id: 'cq_esp_8',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Verdadeiro ou Falso: A palavra "exquisito" em espanhol significa que a comida é ruim e esquisita.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! "Exquisito" significa extremamente saboroso, delicioso e refinado.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_esp_9',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Como se diz "Até logo / Até mais" em espanhol?',
        options: ['¡Hasta luego!', '¡Hola!', '¡Buenas noches!', '¡Por supuesto!'],
        correctIndex: 0,
        explanation: '¡Hasta luego! e ¡Hasta la vista! são despedidas muito comuns que significam "Até logo".',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_esp_10',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Espanhol do Zero',
        question: 'Qual número corresponde a "ocho" em espanhol?',
        options: ['8', '7', '9', '18'],
        correctIndex: 0,
        explanation: 'Ocho é o número 8 (uno, dos, tres, cuatro, cinco, seis, siete, OCHO, nueve, diez).',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },

  // 4. ITALIANO (DO ZERO): SONS ESPECIAIS, SAUDAÇÕES & VERBO ESSERE
  {
    id: 'cad_ita_zero',
    subjectId: 'italiano',
    title: 'Italiano Começando do Absoluto Zero',
    gradeStage: 'Nível Iniciante A1 (Para quem nunca estudou)',
    difficulty: 'fácil',
    icon: '🇮🇹',
    summary: 'Aprenda italiano com pronúncia fonética perfeita: sons de C/CH, G/GH, GLI, GN, saudações, apresentações e o verbo ESSERE (ser/estar).',
    detailedTheory: [
      'O italiano é uma língua musical e muito expressiva, onde a fonética faz toda a diferença para quem está começando do zero.',
      'SONS CRUCIAIS DO ITALIANO (Dica de Ouro):',
      '1. "C" antes de E ou I tem som de "TCH" (ex: Ciao = Tchau, Cibo = Tchibo, Gelato = Djelato).',
      '2. "CH" antes de E ou I tem som de "QU/K" duro (ex: Perché = Perquê, Chianti = Quianti, Bruschetta = Brusketa).',
      '3. "GLI" tem som de "LH" suave (ex: Famiglia = Família, Figlio = Filho).',
      '4. "GN" tem som de "NH" (ex: Gnocchi = Nhoqui, Lasagna = Lasanha, Bagno = Banho).',
      '5. "SC" antes de E ou I tem som de "CH" do português (ex: Pesce = Peche, Scusa = Escusa).',
      'SAUDAÇÕES DIÁRIAS: Ciao! (Oi / Tchau informal), Buongiorno! (Bom dia), Buonasera! (Boa tarde/noite), Buonanotte! (Boa noite ao ir dormir), Arrivederci! (Até logo), Per favore / Per piacere (Por favor), Grazie mille! (Muito obrigado), Prego! (De nada).',
      'VERBO ESSERE (Ser / Estar no presente): Io sono (Eu sou/estou), Tu sei (Você é/está), Lui/Lei è (Ele/Ela é/está), Noi siamo (Nós somos/estamos), Voi siete (Vocês são/estão), Loro sono (Eles/Elas são/estão).'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Dominar o Som da Palavra "Ciao"',
        description: 'Pronuncia-se "TCHAU" e serve tanto para dizer "Oi/Olá" quando chega quanto "Tchau" quando sai.'
      },
      {
        stepNumber: 2,
        title: 'Praticar o som de CH (sempre K)',
        description: 'Lembre-se: "Che cosa?" se pronuncia "QUE COSA?" (O que é isso?).'
      },
      {
        stepNumber: 3,
        title: 'Aprender a Apresentação Pessoal',
        description: 'Diga: "Ciao! Mi chiamo [Seu Nome], sono brasiliano/a. Piacere di conoscerti!"'
      }
    ],
    solvedExamples: [
      {
        problem: 'Como se pronuncia a palavra italiana "Gnocchi"?',
        resolutionSteps: [
          'Passo 1: O grupo "GN" tem som de "NH".',
          'Passo 2: O grupo "CCH" tem som de "K/QU".',
          'Passo 3: A pronúncia correta fica "NHÓ-QUI".'
        ],
        finalAnswer: 'Pronuncia-se "Nhóqui".',
        pedagogicalTip: 'Em italiano, o "CH" endurece o som para K, nunca tem som de X!'
      },
      {
        problem: 'Complete com o verbo essere: "Io _____ brasiliano."',
        resolutionSteps: [
          'Passo 1: O sujeito é "Io" (primeira pessoa do singular: Eu).',
          'Passo 2: A conjugação de Essere para Io é "SONO".',
          'Passo 3: Frase completa: "Io sono brasiliano."'
        ],
        finalAnswer: 'Io sono brasiliano.',
        pedagogicalTip: 'Io sono = Eu sou. Tu sei = Você é. Lui è = Ele é.'
      }
    ],
    goldenRules: [
      'GLI soa como LH (figlio = filho).',
      'GN soa como NH (bagno = banho).',
      'CH soa como K/QU (perché = perquê).',
      'Grazie mille significa muito obrigado, e a resposta é "Prego" (de nada).'
    ],
    commonMistakes: [
      'Pronunciar "Bruschetta" com som de X (o correto é "Bruskéta"!).',
      'Achar que "Salire" significa sair (salire significa SUBIR; sair é uscire!).',
      'Confundir "Burro" (burro em italiano é MANTEIGA, não é o animal!).'
    ],
    practiceQuestions: [
      {
        id: 'cq_ita_1',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Como se diz "Bom dia" formal em italiano?',
        options: ['Buongiorno', 'Buonanotte', 'Arrivederci', 'Prego'],
        correctIndex: 0,
        explanation: 'Buongiorno significa "Bom dia". Buonanotte é "Boa noite ao dormir" e Arrivederci é "Até logo".',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_ita_2',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Verdadeiro ou Falso: A palavra "Ciao" em italiano pode ser usada tanto para dizer "Oi" quanto para "Tchau".',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! "Ciao" é uma saudação informal universal para chegada (Oi) e saída (Tchau).',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_ita_3',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Fale com a voz: Qual é a resposta mais educada e comum para "Grazie" em italiano?',
        options: ['Prego', 'Scusa', 'Ciao', 'Buongiorno'],
        correctIndex: 0,
        explanation: '"Prego" significa "De nada / Por favor / Não há de quê" após um agradecimento.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['prego', 'di niente', 'letra a', 'a']
      },
      {
        id: 'cq_ita_4',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Qual som a combinação de letras "GN" produz em palavras como "Lasagna" e "Bagno"?',
        options: ['Som de NH (Lasanha, Banho)', 'Som de G duro', 'Som de S', 'Som de L'],
        correctIndex: 0,
        explanation: 'Em italiano, o encontro "GN" tem exatamente o som de "NH" do português.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_ita_5',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Verdadeiro ou Falso: Em italiano, o alimento "burro" significa "manteiga".',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! "Burro" em italiano é manteiga (usada no pão e receitas). O animal burro em italiano é "asino".',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_ita_6',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Como se conjuga o verbo essere para "Eu sou" (Io)?',
        options: ['Io sono', 'Io sei', 'Io è', 'Io siamo'],
        correctIndex: 0,
        explanation: 'A conjugação da 1ª pessoa é "Io sono" (Eu sou / Eu estou).',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_ita_7',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Fale com a voz: Como se diz "Muito obrigado" em italiano?',
        options: ['Grazie mille', 'Buonasera', 'Arrivederci', 'Per favore'],
        correctIndex: 0,
        explanation: '"Grazie mille" significa literalmente "Mil obrigados" (Muito obrigado).',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['grazie mille', 'grazie', 'letra a', 'a']
      },
      {
        id: 'cq_ita_8',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Verdadeiro ou Falso: A palavra "Bruschetta" deve ser pronunciada como "Bruxeta".',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! O "CH" italiano sempre tem som de "K/QU", portanto a pronúncia correta é "Bruskéta".',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_ita_9',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Como você pergunta "Como você se chama?" em italiano?',
        options: ['Come ti chiami?', 'Di dove sei?', 'Come stai?', 'Quanti anni hai?'],
        correctIndex: 0,
        explanation: '"Come ti chiami?" significa "Como você se chama?". A resposta é "Mi chiamo..."',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_ita_10',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Italiano do Zero',
        question: 'Qual número é "cinque" em italiano?',
        options: ['5', '50', '15', '4'],
        correctIndex: 0,
        explanation: 'Cinque é o número 5 (uno, due, tre, quattro, CINQUE, sei, sette, otto, nove, dieci).',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },

  // 5. CIÊNCIAS: FOTOSSÍNTESE & ECOSSISTEMAS
  {
    id: 'cad_cie_fotossintese',
    subjectId: 'ciencias',
    title: 'Fotossíntese, Célula Vegetal e Cadeia Alimentar',
    gradeStage: 'Fundamental & Médio',
    difficulty: 'fácil',
    icon: '🌱',
    summary: 'Entenda como as plantas produzem seu próprio alimento, a equação da fotossíntese e a importância para a vida na Terra.',
    detailedTheory: [
      'A fotossíntese é o processo biológico pelo qual organismos autótrofos (como plantas e algas) convertem energia luminosa do Sol em energia química (glicose).',
      'REAGENTES (O que a planta absorve): Gás carbônico (CO₂ do ar pelos estômatos) + Água e sais minerais (H₂O do solo pelas raízes) + Luz solar captada pela Clorofila nos Cloroplastos.',
      'PRODUTOS (O que a planta produz e libera): Glicose (C₆H₁₂O₆ para sua nutrição e crescimento) + Gás Oxigênio (O₂ liberado para a atmosfera).',
      'EQUAÇÃO GERAL: 6 CO₂ + 6 H₂O + Luz Solar ➔ C₆H₁₂O₆ (Glicose) + 6 O₂ (Oxigênio).',
      'Importância Ecológica: As plantas são os PRODUTORES na base de todas as cadeias alimentares terrestres e renovam o oxigênio que respiramos.'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Lembrar a entrada dos reagentes',
        description: 'Raiz suga Água (H₂O) + Folhas absorvem Gás Carbônico (CO₂) + Clorofila capta Luz.'
      },
      {
        stepNumber: 2,
        title: 'Entender a reação nos cloroplastos',
        description: 'A energia solar quebra as moléculas e reorganiza em glicose (alimento da planta).'
      },
      {
        stepNumber: 3,
        title: 'Identificar o produto liberado',
        description: 'A planta libera Oxigênio (O₂) puro para o ar que todos os seres vivos respiram.'
      }
    ],
    solvedExamples: [
      {
        problem: 'Por que uma planta mantida no escuro total não consegue realizar fotossíntese?',
        resolutionSteps: [
          'Passo 1: A fotossíntese exige energia luminosa para excitar as moléculas de clorofila.',
          'Passo 2: Sem luz solar ou artificial, a reação química não é iniciada.',
          'Passo 3: A planta no escuro apenas consome suas reservas e realiza respiração celular.'
        ],
        finalAnswer: 'Porque a luz é a fonte de energia essencial para ativar a clorofila e produzir glicose.',
        pedagogicalTip: 'Lembre-se do prefixo: "FOTO" significa luz + "SÍNTESE" significa produzir/construir!'
      }
    ],
    goldenRules: [
      'Reagentes: Gás Carbônico + Água + Luz.',
      'Produtos: Glicose + Oxigênio.',
      'Organela responsável: Cloroplasto (contém o pigmento verde Clorofila).'
    ],
    commonMistakes: [
      'Achar que planta só faz fotossíntese e não respira (plantas respiram O₂ o tempo todo, dia e noite!).',
      'Confundir gás carbônico com oxigênio na absorção.'
    ],
    practiceQuestions: [
      {
        id: 'cq_cie_1',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Qual gás essencial para a nossa respiração é LIBERADO pelas plantas durante a fotossíntese?',
        options: ['Oxigênio (O₂)', 'Gás carbônico (CO₂)', 'Nitrogênio (N₂)', 'Metano (CH₄)'],
        correctIndex: 0,
        explanation: 'A fotossíntese absorve gás carbônico e libera oxigênio puro (O₂) para a atmosfera.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_cie_2',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Verdadeiro ou Falso: Os cloroplastos são as organelas celulares onde ocorre a fotossíntese.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! É nos cloroplastos que fica a clorofila, pigmento responsável por absorver a luz solar.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_cie_3',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Fale com a voz: Qual é o açúcar (alimento) produzido pelas plantas na fotossíntese?',
        options: ['Glicose', 'Amido', 'Proteína', 'Gordura'],
        correctIndex: 0,
        explanation: 'A glicose é o carboidrato simples produzido como alimento e energia da planta.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['glicose', 'glicose vegetal', 'letra a', 'a']
      },
      {
        id: 'cq_cie_4',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Qual é a estrutura microscópica nas folhas por onde entram e saem os gases da planta?',
        options: ['Estômatos', 'Mitocôndrias', 'Raízes', 'Sementes'],
        correctIndex: 0,
        explanation: 'Os estômatos são pequenos poros na superfície das folhas que realizam as trocas gasosas.',
        difficulty: 'medium',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_cie_5',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Verdadeiro ou Falso: As plantas realizam apenas fotossíntese, elas nunca respiram oxigênio.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! As plantas respiram oxigênio constantemente (24 horas por dia) através das suas mitocôndrias.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_cie_6',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Qual o papel dos organismos autótrofos (como as plantas) em uma cadeia alimentar?',
        options: ['Produtores', 'Consumidores primários', 'Consumidores secundários', 'Decompositores'],
        correctIndex: 0,
        explanation: 'Os autótrofos são a base da cadeia alimentar e são chamados de produtores porque fabricam o próprio alimento.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_cie_7',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Fale com a voz: Qual é o pigmento verde que capta a luz do sol nas plantas?',
        options: ['Clorofila', 'Caroteno', 'Hemoglobina', 'Melanina'],
        correctIndex: 0,
        explanation: 'A clorofila é o pigmento verde capaz de captar os fótons de luz solar.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['clorofila', 'pigmento clorofila', 'letra a', 'a']
      },
      {
        id: 'cq_cie_8',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Verdadeiro ou Falso: As algas microscópicas (fitoplâncton) nos oceanos produzem a maior parte do oxigênio do planeta Terra.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! O fitoplâncton marinho é responsável por mais de 50% de todo o oxigênio produzido no planeta.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_cie_9',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'Por onde a planta absorve água e sais minerais do solo?',
        options: ['Pelas raízes', 'Pelas flores', 'Pelos frutos', 'Pelos estômatos'],
        correctIndex: 0,
        explanation: 'As raízes possuem pelos absorventes que retiram água e nutrientes minerais do solo.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_cie_10',
        subject: 'ciencias',
        grade: '6_fund',
        topic: 'Fotossíntese',
        question: 'O que aconteceria com a vida na Terra se todas as plantas e algas desaparecessem?',
        options: ['Os níveis de oxigênio cairiam drasticamente e as cadeias alimentares entrariam em colapso', 'Nada mudaria', 'Os animais passariam a produzir oxigênio', 'A temperatura diminuiria'],
        correctIndex: 0,
        explanation: 'Sem produtores, não haveria alimento para os herbívoros nem renovação de oxigênio, colapsando os ecossistemas.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },

  // 6. HISTÓRIA: BRASIL COLÔNIA & INDEPENDÊNCIA
  {
    id: 'cad_hist_brasil',
    subjectId: 'historia',
    title: 'Brasil Colônia, Ciclo do Ouro e Independência (1822)',
    gradeStage: 'Fundamental & Médio',
    difficulty: 'médio',
    icon: '🇧🇷',
    summary: 'Compreenda os ciclos econômicos do pau-brasil, cana-de-açúcar, mineração e o processo que culminou na Independência em 7 de setembro de 1822.',
    detailedTheory: [
      'Período Pré-Colonial (1500-1530): Exploração do Pau-Brasil através do escambo com povos indígenas.',
      'Ciclo da Cana-de-Açúcar (Séculos XVI e XVII): Baseado no sistema de plantation (latifúndio, monocultura, produção voltada para exportação e mão de obra escravizada indígena e africana), centrado no Nordeste.',
      'Ciclo do Ouro (Século XVIII): Deslocamento do eixo econômico para a região Sudeste (Minas Gerais). Cobrança de altos impostos por Portugal (o Quinto e a Derrama) provocou revoltas como a Inconfidência Mineira (1789).',
      'Chegada da Família Real (1808): Fuga de D. João VI para o Brasil, Abertura dos Portos às Nações Amigas e elevação do Brasil a Reino Unido a Portugal e Algarves (1815).',
      'Independência (1822): Em 7 de setembro de 1822, Dom Pedro I declara o rompimento oficial com as Cortes de Lisboa às margens do riacho Ipiranga.'
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Memorizar a linha do tempo dos ciclos',
        description: 'Pau-Brasil (1500) ➔ Cana-de-Açúcar (Nordeste) ➔ Ouro (Minas Gerais) ➔ Café.'
      },
      {
        stepNumber: 2,
        title: 'Entender a importância de 1808',
        description: 'A vinda da corte portuguesa transformou o Rio de Janeiro na sede do império e abriu os portos.'
      },
      {
        stepNumber: 3,
        title: 'Reconhecer os fatores do 7 de Setembro',
        description: 'A tentativa de Portugal de recolonizar o Brasil forçou as elites locais e D. Pedro I à Independência.'
      }
    ],
    solvedExamples: [
      {
        problem: 'O que foi a "Abertura dos Portos às Nações Amigas" em 1808?',
        resolutionSteps: [
          'Passo 1: Até 1808 vigorava o Pacto Colonial (o Brasil só podia comercializar com Portugal).',
          'Passo 2: Com a chegada da família real, D. João VI decretou o fim do monopólio comercial.',
          'Passo 3: O Brasil passou a fazer comércio direto com países aliados, especialmente a Inglaterra.'
        ],
        finalAnswer: 'Foi o fim do pacto colonial exclusivo, permitindo ao Brasil comercializar diretamente com outras nações.',
        pedagogicalTip: 'Esse ato foi o primeiro grande passo para a autonomia econômica que levou à Independência!'
      }
    ],
    goldenRules: [
      'Plantation: Latifúndio + Monocultura + Exportação + Escravidão.',
      'Inconfidência Mineira (1789): Movimento republicano da elite contra os impostos do ouro.',
      '7 de Setembro de 1822: Data oficial da Proclamação da Independência por D. Pedro I.'
    ],
    commonMistakes: [
      'Achar que a independência acabou com a escravidão (a escravidão continuou até 1888!).',
      'Confundir Tiradentes (1789) com a Independência (1822).'
    ],
    practiceQuestions: [
      {
        id: 'cq_hist_1',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Quem proclamou a Independência do Brasil no dia 7 de setembro de 1822?',
        options: ['Dom Pedro I', 'Dom Pedro II', 'Tiradentes', 'Dom João VI'],
        correctIndex: 0,
        explanation: 'Dom Pedro I declarou a independência do Brasil às margens do Ipiranga e tornou-se o primeiro imperador.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_hist_2',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Verdadeiro ou Falso: A Independência do Brasil em 1822 aboliu imediatamente a escravidão no país.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! A escravidão continuou por mais 66 anos após a independência, sendo abolida apenas em 1888 com a Lei Áurea.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_hist_3',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Fale com a voz: Em qual estado brasileiro ocorreu o Ciclo do Ouro no século XVIII?',
        options: ['Minas Gerais', 'Bahia', 'Rio Grande do Sul', 'Pernambuco'],
        correctIndex: 0,
        explanation: 'Minas Gerais foi o grande centro da mineração de ouro e diamantes no século XVIII.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['minas gerais', 'minas', 'letra a', 'a']
      },
      {
        id: 'cq_hist_4',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Qual imposto cobrado pela Coroa portuguesa equivalia a 20% (uma quinta parte) de todo o ouro extraído?',
        options: ['O Quinto', 'A Derrama', 'O Dízimo', 'A Capitania'],
        correctIndex: 0,
        explanation: 'O Quinto era o imposto régio de 20% sobre o ouro fundido nas Casas de Fundição.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_hist_5',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Verdadeiro ou Falso: A vinda da Família Real portuguesa ao Brasil em 1808 ocorreu devido às invasões napoleônicas na Europa.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! As tropas de Napoleão Bonaparte invadiram Portugal após D. João VI descumprir o Bloqueio Continental.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_hist_6',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Qual foi o primeiro produto econômico explorado pelos portugueses no litoral brasileiro a partir de 1500?',
        options: ['Pau-Brasil', 'Café', 'Soja', 'Ouro'],
        correctIndex: 0,
        explanation: 'O pau-brasil, árvore da qual se extraía tinta vermelha para tecidos, foi a primeira riqueza explorada.',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_hist_7',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Fale com a voz: Qual mártir da Inconfidência Mineira foi executado em 21 de abril de 1792?',
        options: ['Tiradentes', 'Zumbi dos Palmares', 'Duque de Caxias', 'José Bonifácio'],
        correctIndex: 0,
        explanation: 'Joaquim José da Silva Xavier, o Tiradentes, foi o único condenado à morte na Inconfidência Mineira.',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['tiradentes', 'joaquim jose da silva xavier', 'letra a', 'a']
      },
      {
        id: 'cq_hist_8',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Verdadeiro ou Falso: As Capitanias Hereditárias dividiram o Brasil em faixas de terra doadas a nobres para colonizar e proteger o território.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! D. João III dividiu o litoral em 15 faixas entregues aos capitães donatários em 1534.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true
      },
      {
        id: 'cq_hist_9',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'Qual o papel de José Bonifácio de Andrada e Silva na história brasileira?',
        options: ['Patriarca da Independência e conselheiro de D. Pedro I', 'Líder dos bandeirantes paulistas', 'Último imperador do Brasil', 'General da Guerra do Paraguai'],
        correctIndex: 0,
        explanation: 'José Bonifácio foi ministro e articulador político fundamental no processo de independência em 1822.',
        difficulty: 'medium',
        questionType: 'multiple_choice'
      },
      {
        id: 'cq_hist_10',
        subject: 'historia',
        grade: '8_fund',
        topic: 'História do Brasil',
        question: 'O que foi o "Dia do Fico" em 9 de janeiro de 1822?',
        options: ['Quando D. Pedro declarou que permaneceria no Brasil desobedecendo ordens de Portugal', 'A data da abolição da escravidão', 'A chegada de Cabral a Porto Seguro', 'A coroação de D. Pedro II'],
        correctIndex: 0,
        explanation: 'No Dia do Fico, D. Pedro recusou a ordem das Cortes de Lisboa para retornar a Portugal e disse: "Se é para o bem de todos e felicidade geral da Nação, estou pronto! Diga ao povo que fico!".',
        difficulty: 'easy',
        questionType: 'multiple_choice'
      }
    ]
  },
  // 7. LÍNGUA INGLESA: TEMPOS VERBAIS & INTERPRETAÇÃO (CONTEÚDO DA SÉRIE / BNCC)
  {
    id: 'cad_ing_verb_tenses',
    subjectId: 'ingles',
    title: 'Tempos Verbais: Simple Present, Simple Past e Futuro',
    gradeStage: 'Fundamental II ao Ensino Médio',
    difficulty: 'médio',
    icon: '🇬🇧',
    summary: 'Domine as regras estruturais do inglês curricular: conjugação no Simple Present (regra do -s para He/She/It), verbos regulares e irregulares no Simple Past (auxiliar Did), e formas de futuro (Will vs. Going To).',
    detailedTheory: [
      'O estudo de Língua Inglesa na BNCC é focado em competências comunicativas e compreensão estrutural dos tempos verbais.',
      '1. SIMPLE PRESENT (Rotinas, Hábitos e Fatos Gerais): Na afirmativa com He, She, It, adiciona-se "-s" ao verbo (ex: He plays, She writes). Verbos terminados em -o, -ch, -sh, -ss, -x recebem "-es" (ex: He goes, She watches). Na negativa usa-se "don\'t" ou "doesn\'t", e na interrogativa o auxiliar "Do" ou "Does".',
      '2. SIMPLE PAST (Ações Finalizadas no Passado): Verbos regulares recebem "-ed" (ex: play -> played, study -> studied). Verbos irregulares têm formas próprias que devem ser memorizadas (ex: go -> went, see -> saw, buy -> bought, have -> had). Nas formas negativa e interrogativa, usa-se o auxiliar "DID / DIDN\'T" e o verbo volta à forma base no infinitivo (ex: "Did you eat?" / "She didn\'t go").',
      '3. FUTURE (Will vs. Be Going To): "Will" é usado para decisões tomadas no momento da fala ou previsões sem evidência imediata (ex: "I will call you later"). "Be going to" expressa planos já decididos ou intenções prévias (ex: "I am going to travel next month").',
      '4. FALSOS AMIGOS (False Friends): Atenção a palavras que parecem português mas têm significado diferente: "Actually" (na verdade), "Pretend" (fingir), "Push" (empurrar), "Parents" (pais - pai e mãe).',
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Identifique o Sujeito e o Tempo da Ação',
        description: 'Observe se a frase se refere ao presente habitual (every day, usually), passado concluído (yesterday, last week, ago) ou futuro (tomorrow, next year).',
      },
      {
        stepNumber: 2,
        title: 'Aplique a Regra da 3ª Pessoa no Presente',
        description: 'Se o sujeito for He, She, It ou singular (my mother, the dog), adicione -s/-es na afirmativa ou use doesn\'t na negativa.',
      },
      {
        stepNumber: 3,
        title: 'Atenção ao Uso do Auxiliar no Passado',
        description: 'Se houver DID ou DIDN\'T na frase, NUNCA coloque o verbo principal no passado (Diga "Did you see?", NUNCA "Did you saw?").',
      },
    ],
    solvedExamples: [
      {
        problem: 'Passe a frase para a 3ª pessoa do singular: "I study English and watch series every day" -> (She ...)',
        resolutionSteps: [
          'O verbo "study" termina em consoante + y: vira "studies".',
          'O verbo "watch" termina em som de -ch: vira "watches".',
          'Juntando tudo: "She studies English and watches series every day."',
        ],
        finalAnswer: 'She studies English and watches series every day.',
        pedagogicalTip: 'Lembre-se: She/He/It sempre altera a terminação do verbo no Simple Present afirmativo.',
      },
      {
        problem: 'Passe a frase "They went to the party" para a forma negativa e interrogativa.',
        resolutionSteps: [
          'O verbo "went" é passado de "go".',
          'Na negativa: usamos didn\'t + verbo base ("go") -> "They didn\'t go to the party."',
          'Na interrogativa: colocamos o auxiliar Did no início -> "Did they go to the party?"',
        ],
        finalAnswer: 'Negativa: They didn\'t go to the party. | Interrogativa: Did they go to the party?',
        pedagogicalTip: 'O auxiliar Did absorve o tempo passado, permitindo que o verbo principal permaneça limpo no infinitivo.',
      },
    ],
    goldenRules: [
      'Simple Present 3ª pessoa: He/She/It sempre leva "-s", "-es" ou "-ies" na afirmativa.',
      'Após auxiliares (Do, Does, Did, Don\'t, Doesn\'t, Didn\'t, Will), o verbo principal SEMPRE fica na forma base.',
      'Verbos no passado regular: Consoante + Y troca por "-ied" (study -> studied); CVC dobra a última consoante (stop -> stopped).',
      'False Friends essenciais: Actually = na verdade; Pretend = fingir; Push = empurrar; Pull = puxar.',
    ],
    commonMistakes: [
      'Erro comum: Dizer "He don\'t know" em vez de "He doesn\'t know".',
      'Erro comum: Dizer "I didn\'t went" com dois passados juntos em vez de "I didn\'t go".',
      'Erro comum: Traduzir "Actually" como "Atualmente" (o correto é "na verdade / realmente").',
    ],
    practiceQuestions: [
      {
        id: 'cq_ing_1',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Simple Present 3rd Person',
        question: 'Complete com a forma correta do verbo: "Gabriel _______ (teach) history at our school."',
        options: ['teaches', 'teach', 'teachies', 'teaching'],
        correctIndex: 0,
        explanation: 'Verbos terminados em -ch recebem -es na 3ª pessoa do singular (Gabriel = He): "teaches".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_2',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Simple Past Negatives',
        question: 'Qual frase está gramaticalmente correta no Simple Past?',
        options: ["We didn't buy the tickets.", "We didn't bought the tickets.", 'We not bought the tickets.', 'We no buy the tickets.'],
        correctIndex: 0,
        explanation: 'Após o auxiliar negativo "didn\'t", o verbo principal fica na forma base no infinitivo ("buy").',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_3',
        subject: 'ingles',
        grade: '8_fund',
        topic: 'Falsos Cognatos',
        question: 'Verdadeiro ou Falso: Em inglês, a palavra "PRETEND" significa ter a pretensão de fazer algo no futuro.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! "Pretend" é um falso amigo que significa "fingir". Pretender/ter intenção em inglês é "intend" ou "plan to".',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true,
      },
      {
        id: 'cq_ing_4',
        subject: 'ingles',
        grade: '8_fund',
        topic: 'Modal Verbs',
        question: 'Qual verbo modal expressa uma recomendação ou conselho amigável ("Você deveria descansar")?',
        options: ['Should', 'Must', 'May', 'Can'],
        correctIndex: 0,
        explanation: '"Should" é o modal específico para conselhos e sugestões ("You should rest").',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_5',
        subject: 'ingles',
        grade: '8_fund',
        topic: 'Pronúncia e Fala por Voz',
        question: '🗣️ Fale com a voz: Como se diz "Ontem" em inglês?',
        options: ['Yesterday', 'Tomorrow', 'Today', 'Tonight'],
        correctIndex: 0,
        explanation: 'Diga: "Yesterday" (ontem).',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['yesterday', 'yester day', 'letra a', 'a'],
      },
      {
        id: 'cq_ing_6',
        subject: 'ingles',
        grade: '9_fund',
        topic: 'Future Forms',
        question: 'Complete a frase indicando uma decisão espontânea no momento da fala: "The phone is ringing. I _______ answer it!"',
        options: ['will', 'am going to', 'did', 'does'],
        correctIndex: 0,
        explanation: 'Para decisões rápidas e espontâneas no momento em que se fala, usa-se o futuro com "will".',
        difficulty: 'medium',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_7',
        subject: 'ingles',
        grade: '9_fund',
        topic: 'Conectivos Textuais',
        question: 'Qual das seguintes palavras de ligação expressa ideia de CONCLUSÃO / RESULTADO?',
        options: ['Therefore (Portanto)', 'Although (Embora)', 'However (No entanto)', 'Because (Porque)'],
        correctIndex: 0,
        explanation: '"Therefore" indica conclusão ("portanto, por conseguinte").',
        difficulty: 'medium',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_8',
        subject: 'ingles',
        grade: '1_medio',
        topic: 'Verdadeiro ou Falso (Irregulares)',
        question: 'Verdadeiro ou Falso: O passado do verbo irregular "TO WRITE" (escrever) é "WRITED".',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! O passado simples de "write" é "wrote" (e o particípio é "written").',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true,
      },
      {
        id: 'cq_ing_9',
        subject: 'ingles',
        grade: '2_medio',
        topic: 'Question Words',
        question: 'Qual "Question Word" é usada para perguntar sobre a MOTIVAÇÃO ou RAZÃO de algo acontecer?',
        options: ['Why (Por que)', 'Where (Onde)', 'Who (Quem)', 'Which (Qual)'],
        correctIndex: 0,
        explanation: '"Why" pergunta a razão/motivo, e a resposta geralmente começa com "Because".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ing_10',
        subject: 'ingles',
        grade: '3_medio',
        topic: 'Leitura & Vocabulário',
        question: 'Na porta de uma loja em Londres, a placa diz "PULL". O que você deve fazer?',
        options: ['Puxar a porta em sua direção', 'Empurrar a porta para frente', 'Aguardar o atendente', 'Bater na porta'],
        correctIndex: 0,
        explanation: '"Pull" significa puxar! "Push" é empurrar. Este é um falso cognato visual muito comum para brasileiros.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
    ],
  },
  // 8. XADREZ: FUNDAMENTOS, TÁTICAS E ESTRATÉGIA
  {
    id: 'cad_xadrez_completo',
    subjectId: 'xadrez',
    title: 'Xadrez: Regras, Táticas (Garfo, Cravada, Espeto) e Xeque-Mate',
    gradeStage: 'Iniciação ao Avançado',
    difficulty: 'fácil',
    icon: '♟️',
    summary: 'Aprenda xadrez passo a passo: montagem do tabuleiro, valor relativo e movimento das peças, golpes táticos decisivos (garfo, cravada, espeto), roque, en passant e planos de xeque-mate.',
    detailedTheory: [
      'O xadrez é um jogo de estratégia sobre um tabuleiro quadriculado de 64 casas (8 colunas verticais designadas por letras "a" até "h", e 8 fileiras horizontais numeradas de "1" a "8").',
      '1. MONTAGEM E VALORES DAS PEÇAS: A casa no canto inferior direito de cada jogador deve ser sempre branca. A Dama fica na sua própria cor (Dama branca na casa branca d1, Dama preta na casa preta d8). Valores relativos: Dama = 9 pontos, Torre = 5 pontos, Bispo = 3 pontos, Cavalo = 3 pontos, Peão = 1 ponto. O Rei tem valor infinito pois sua perda determina o fim da partida.',
      '2. MOVIMENTAÇÃO: Rei anda 1 casa em qualquer direção; Dama move-se qualquer número de casas em linhas retas ou diagonais; Torre anda em linhas retas (horizontais e verticais); Bispo move-se em diagonais (cada jogador tem um Bispo de casas claras e outro de casas escuras); Cavalo anda em "L" (duas casas numa direção e uma perpendicular) e é a única peça capaz de pular por cima de outras; Peão avança 1 casa para frente (ou 2 casas no primeiro lance), mas captura somente 1 casa na diagonal à frente.',
      '3. MOVIMENTOS ESPECIAIS: a) Roque (move Rei 2 casas para o lado e a Torre pula sobre ele; protege o Rei); b) Promoção (quando o Peão alcança a 8ª fileira e se transforma em Dama, Torre, Bispo ou Cavalo); c) En Passant (captura de peão adversário logo após ele avançar 2 casas ao lado do seu).',
      '4. TÁTICAS FUNDAMENTAIS: Garfo (uma peça ataca duas ou mais peças inimigas ao mesmo tempo); Cravada (uma peça não pode se mover porque deixaria o Rei ou a Dama sob ataque); Espeto (a peça mais valiosa na frente é forçada a fugir expondo a peça de trás).',
      '5. XEQUE-MATE VS AFOGAMENTO: Xeque-Mate é o ataque definitivo ao Rei onde não há defesa legal (vitória). Afogamento (Stalemate) é quando o jogador da vez não está em xeque mas não possui nenhum lance legal disponível (empate).',
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Domine a Abertura e Proteja o Rei',
        description: 'Nos primeiros lances, ocupe o centro com peões (e4/d4), desenvolva peças leves (Cavalos e Bispos) e faça o Roque para proteger seu Rei.',
      },
      {
        stepNumber: 2,
        title: 'Procure Golpes Táticos em Cada Lance',
        description: 'Verifique sempre se há peças adversárias desprotegidas ("peças no ar") e se é possível aplicar um Garfo de Cavalo ou uma Cravada com Bispo/Torre.',
      },
      {
        stepNumber: 3,
        title: 'Calcule a Contagem Material Antes das Trocas',
        description: 'Nunca troque uma peça de valor superior por uma inferior (ex: trocar uma Torre de 5 pts por um Bispo de 3 pts sem compensação tática clara).',
      },
    ],
    solvedExamples: [
      {
        problem: 'Cenário Tático: Seu Cavalo branco salta para a casa c7, dando xeque no Rei preto em e8 e atacando ao mesmo tempo a Torre preta em a8. Que golpe é esse e qual o desfecho?',
        resolutionSteps: [
          'O Cavalo branco ameaça simultaneamente duas peças de alto valor: o Rei e a Torre.',
          'Como o Rei está em xeque, o jogador de pretas é obrigado a mover o Rei para escapar.',
          'No lance seguinte, o Cavalo branco captura a Torre em a8 (+5 pontos de vantagem material).',
        ],
        finalAnswer: 'Trata-se de um Garfo real com ganho forçado de material (+5 pontos da Torre).',
        pedagogicalTip: 'O Cavalo é a peça mais perigosa para aplicar garfos porque seu movimento em L não pode ser bloqueado por outras peças!',
      },
      {
        problem: 'O Peão branco está na casa e7 e o jogador o avança para e8. Quais são as opções de promoção?',
        resolutionSteps: [
          'Ao atingir a 8ª fileira adversária, o peão não pode continuar como peão.',
          'Pelas regras oficiais da FIDE, ele pode ser promovido imediatamente a Dama (Rainha), Torre, Bispo ou Cavalo.',
          'Na grande maioria dos casos escolhe-se a Dama por ser a peça mais poderosa (9 pontos).',
        ],
        finalAnswer: 'O peão pode ser promovido a Dama, Torre, Bispo ou Cavalo (geralmente Dama).',
        pedagogicalTip: 'Você pode promover a uma nova Dama mesmo que sua Dama original ainda esteja no tabuleiro!',
      },
    ],
    goldenRules: [
      'Regra da Montagem: Casa branca sempre no canto inferior direito de cada jogador ("branca na direita").',
      'Valores das Peças: Peão = 1 | Cavalo = 3 | Bispo = 3 | Torre = 5 | Dama = 9 | Rei = Infinito.',
      'Noções de Abertura: Controle o centro, desenvolva cavalos e bispos antes da dama, e realize o Roque rapidamente.',
      'Cuidado com o Afogamento: Ao vencer com grande vantagem de material, certifique-se de que o Rei adversário sempre tenha casas livres ou esteja em xeque.',
    ],
    commonMistakes: [
      'Erro comum: Sair com a Dama muito cedo no início da partida, tornando-a alvo fácil de ataques das peças menores adversárias.',
      'Erro comum: Esquecer de proteger as peças e deixar "peças no ar" (desprotegidas) suscetíveis a garfos.',
      'Erro comum: Confundir Xeque-Mate (vitória) com Afogamento (empate por falta de lances legais sem estar em xeque).',
    ],
    practiceQuestions: [
      {
        id: 'cq_xad_1',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Valores das Peças',
        question: 'Qual é o valor relativo em pontos de uma Torre e de um Bispo no xadrez?',
        options: ['Torre = 5 pontos e Bispo = 3 pontos', 'Torre = 3 pontos e Bispo = 5 pontos', 'Torre = 9 pontos e Bispo = 1 ponto', 'Ambos valem 4 pontos'],
        correctIndex: 0,
        explanation: 'A Torre vale 5 pontos (peça maior) e o Bispo vale 3 pontos (peça menor).',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_2',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Movimento do Cavalo',
        question: 'Qual é a característica única que diferencia o Cavalo de todas as outras peças no xadrez?',
        options: ['É a única peça capaz de saltar sobre outras peças no tabuleiro', 'Move-se em linha reta infinita', 'Pode andar para trás como o peão', 'Vale mais que a Dama'],
        correctIndex: 0,
        explanation: 'O Cavalo move-se em formato de "L" e tem o poder exclusivo de saltar sobre peças amigas e adversárias.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_3',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Verdadeiro ou Falso (Roque)',
        question: 'Verdadeiro ou Falso: É permitido fazer o Roque se o Rei já tiver se movimentado em uma jogada anterior.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 1,
        explanation: 'Falso! Para ter direito ao Roque, tanto o Rei quanto a respectiva Torre nunca podem ter se movimentado antes na partida.',
        difficulty: 'easy',
        questionType: 'true_false',
        isTrueFalse: true,
      },
      {
        id: 'cq_xad_4',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Tática do Garfo',
        question: 'O que define o golpe tático do "Garfo" no xadrez?',
        options: ['Uma única peça ataca simultaneamente duas ou mais peças inimigas', 'Uma troca de damas no centro', 'Um xeque dado por um peão', 'O rei protegido pela torre no canto'],
        correctIndex: 0,
        explanation: 'O Garfo é o ataque simultâneo duplo executado por uma peça contra dois alvos adversários.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_5',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Pronúncia e Fala por Voz',
        question: '🗣️ Fale com a voz: Qual é o nome do lance especial onde o Rei anda 2 casas para o lado e a Torre salta ao lado dele?',
        options: ['Roque', 'En Passant', 'Promoção', 'Cravada'],
        correctIndex: 0,
        explanation: 'Diga: "Roque".',
        difficulty: 'easy',
        questionType: 'voice_speech',
        isVoiceQuestion: true,
        expectedVoicePhrases: ['roque', 'roque pequeno', 'roque grande', 'letra a', 'a'],
      },
      {
        id: 'cq_xad_6',
        subject: 'xadrez',
        grade: '8_fund',
        topic: 'Regra da Cravada',
        question: 'Em uma "Cravada Absoluta", qual peça encontra-se imediatamente atrás da peça atacada?',
        options: ['O Rei', 'A Dama', 'A Torre', 'Um Peão'],
        correctIndex: 0,
        explanation: 'Na cravada absoluta, a peça atrás é o Rei, tornando qualquer movimento da peça da frente uma jogada ilegal.',
        difficulty: 'medium',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_7',
        subject: 'xadrez',
        grade: '8_fund',
        topic: 'Promoção do Peão',
        question: 'Quando um Peão atinge a oitava fileira adversária, em quais peças ele pode ser promovido?',
        options: ['Dama, Torre, Bispo ou Cavalo', 'Apenas em Dama', 'Apenas em um novo Rei', 'Em qualquer peça menos a Dama'],
        correctIndex: 0,
        explanation: 'O peão pode ser transformado em Dama, Torre, Bispo ou Cavalo à escolha do jogador.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_8',
        subject: 'xadrez',
        grade: '9_fund',
        topic: 'Verdadeiro ou Falso (Afogamento)',
        question: 'Verdadeiro ou Falso: Se o jogador da vez não estiver em xeque e não possuir nenhum lance legal para jogar, a partida termina em EMPATE por afogamento.',
        options: ['Verdadeiro (V)', 'Falso (F)'],
        correctIndex: 0,
        explanation: 'Verdadeiro! O afogamento (stalemate) resulta em empate automático imediato segundo as regras da FIDE.',
        difficulty: 'medium',
        questionType: 'true_false',
        isTrueFalse: true,
      },
      {
        id: 'cq_xad_9',
        subject: 'xadrez',
        grade: '9_fund',
        topic: 'Mate Pastor',
        question: 'O famoso "Mate Pastor" (Scholar\'s Mate) é uma ameaça típica de início de jogo que ataca qual casa fraca das pretas?',
        options: ['A casa f7 (protegida apenas pelo Rei no início)', 'A casa h8', 'A casa a7', 'A casa c8'],
        correctIndex: 0,
        explanation: 'O ponto f7 (f2 para as brancas) é a casa mais vulnerável no início porque é defendida apenas pelo Rei.',
        difficulty: 'medium',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_xad_10',
        subject: 'xadrez',
        grade: '1_medio',
        topic: 'Estratégia de Abertura',
        question: 'Qual dos seguintes é um princípio clássico de ouro na fase de abertura de uma partida?',
        options: ['Controlar o centro, desenvolver cavalos e bispos e rocar cedo', 'Avançar todos os peões da lateral', 'Mover o rei para o centro nos primeiros lances', 'Trocar a dama rapidamente'],
        correctIndex: 0,
        explanation: 'Os três pilares da abertura são: domínio do centro, rápido desenvolvimento harmônico das peças e segurança do Rei com o Roque.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
    ],
  },
  // TOPIC 9: ESPANHOL DO ZERO (PRIMEIRAS PALAVRAS & SONS)
  {
    id: 'cad_esp_1',
    subjectId: 'espanhol',
    title: 'Espanhol do Zero: Primeiras Palavras, Sons e Saudações',
    gradeStage: 'Iniciante do Zero',
    difficulty: 'fácil',
    icon: '🇪🇸',
    summary:
      'Guia essencial para quem está começando do zero: alfabeto com letra Ñ e J forte, saudações do dia a dia, palavras essenciais, números de 1 a 10 e os falsos amigos mais comuns.',
    detailedTheory: [
      'O espanhol (castelhano) é muito próximo do português, mas exige atenção na pronúncia dos sons e em palavras que parecem uma coisa, mas significam outra (falsos amigos).',
      'A letra Ñ (eñe) tem som de NH no português: "niño" (menino) lê-se "ninho", "España" lê-se "Espanha".',
      'A letra J (jota) e o G antes de E/I têm som forte aspirado de R raspado na garganta: "jamón" lê-se "ramón", "rojo" lê-se "ró-ro".',
      'A letra H é sempre muda, exatamente como em português ("hola", "hoy").',
      'As saudações mais usadas são: ¡Hola! (Oi!), ¡Buenos días! (Bom dia!), ¡Buenas tardes! (Boa tarde!), ¡Buenas noches! (Boa noite!).',
      'Palavras mágicas de convivência: Por favor, Gracias (obrigado/a), De nada, Con permiso (com licença), Perdón / Disculpe.',
      'Números de 1 a 10: 1 = Uno, 2 = Dos, 3 = Tres, 4 = Cuatro, 5 = Cinco, 6 = Seis, 7 = Siete, 8 = Ocho, 9 = Nueve, 10 = Diez.',
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Aprenda a se apresentar',
        description: 'Diga "¡Hola! Me llamo [seu nome]" e depois pergunte "¿Y tú, cómo te llamas?".',
      },
      {
        stepNumber: 2,
        title: 'Memorize as saudações do relógio',
        description: 'De manhã: "Buenos días". À tarde: "Buenas tardes". À noite: "Buenas noches". Note que vão sempre no plural!',
      },
      {
        stepNumber: 3,
        title: 'Cuidado com os falsos cognatos',
        description: 'Lembre-se que "apellido" é sobrenome, "embarazada" é grávida e "exquisito" é delicioso.',
      },
    ],
    solvedExamples: [
      {
        problem: 'Como se apresentar em espanhol e dizer que você é estudante?',
        resolutionSteps: [
          'Saudação: "¡Hola! Buenos días."',
          'Nome: "Me llamo Lucas."',
          'Profissão/Ocupação: "Soy estudiante de la escuela."',
          'Frase completa: "¡Hola! Buenos días, me llamo Lucas y soy estudiante."',
        ],
        finalAnswer: '"¡Hola! Me llamo Lucas y soy estudiante."',
        pedagogicalTip: 'Em espanhol usa-se o verbo "ser" para identidade de forma igual ao português.',
      },
    ],
    goldenRules: [
      'As exclamações e interrogações no início das frases levam pontuação invertida: ¡Hola! ¿Cómo estás?',
      'Em espanhol não existe som de "Z" zumbido nem som de "V" labial fechado; o som de V aproxima-se do B suave.',
      'Palavras no plural em saudações: "Buenos días", não se diz "Buen día" como padrão formal.',
    ],
    commonMistakes: [
      'Achar que "apellido" significa apelido (é sobrenome; apelido é "apodo").',
      'Confundir "rojo" (vermelho) com roxo (roxo em espanhol é "morado").',
      'Esquecer de pronunciar o som de NH ao ver a letra com til Ñ.',
    ],
    practiceQuestions: [
      {
        id: 'cq_esp_1',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Saudações',
        question: 'Como se diz "Bom dia" em espanhol?',
        options: ['¡Buenos días!', '¡Buen día!', '¡Boa dia!', '¡Buenas mañanas!'],
        correctIndex: 0,
        explanation: 'A saudação padrão em espanhol é no plural: "¡Buenos días!".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_2',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Falsos Cognatos',
        question: 'Se um formulário em espanhol pede o seu "Apellido", o que você deve preencher?',
        options: ['Seu sobrenome de família (ex: Silva, Santos)', 'Seu apelido de infância', 'Seu primeiro nome', 'Seu endereço'],
        correctIndex: 0,
        explanation: '"Apellido" significa sobrenome em espanhol. Apelido carinhoso chama-se "apodo".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_3',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Pronúncia do Ñ',
        question: 'A letra "Ñ" na palavra "niño" (menino) tem qual som?',
        options: ['Som de NH (como em ninho)', 'Som de N comum', 'Som de L duplo', 'Som de M'],
        correctIndex: 0,
        explanation: 'A letra Ñ (eñe) tem som idêntico ao NH da língua portuguesa.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_4',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Números 1 a 5',
        question: 'Qual a sequência correta dos números de 1 a 3 em espanhol?',
        options: ['Uno, dos, tres', 'Um, dois, três', 'One, two, three', 'Uno, due, tre'],
        correctIndex: 0,
        explanation: 'Os números de 1 a 3 em espanhol são: Uno, dos, tres.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_5',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Cores',
        question: 'Qual cor representa a palavra "Rojo" em espanhol?',
        options: ['Vermelho', 'Roxo', 'Rosa', 'Marrom'],
        correctIndex: 0,
        explanation: '"Rojo" significa vermelho. Roxo em espanhol é "morado".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_6',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Agradecimento',
        question: 'Qual a forma mais educada de dizer "Muito obrigado" e "De nada"?',
        options: ['Muchas gracias / De nada', 'Muito obrigado / Por nada', 'Thank you / Welcome', 'Grazie / Prego'],
        correctIndex: 0,
        explanation: '"Muchas gracias" e "De nada" são as expressões de cortesia em espanhol.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_7',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Verbo Ser',
        question: 'Como dizer "Eu sou brasileiro" em espanhol?',
        options: ['Yo soy brasileño', 'Yo estoy brasileño', 'Yo hago brasileño', 'Yo tengo brasileño'],
        correctIndex: 0,
        explanation: 'Usa-se o verbo "ser" para nacionalidade: "Yo soy brasileño".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_8',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Material Escolar',
        question: 'O que são "el cuaderno", "el lápiz" e "el libro"?',
        options: ['O caderno, o lápis e o livro', 'A mochila, a régua e o apontador', 'A caneta, o estojo e a tesoura', 'A lousa, a borracha e o papel'],
        correctIndex: 0,
        explanation: 'São os materiais escolares básicos em espanhol.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_9',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Falsos Cognatos',
        question: 'Se alguém disser que o almoço está "Exquisito", isso significa:',
        options: ['Muito saboroso e delicioso', 'Estranho e esquisito', 'Ruim e azedo', 'Muito frio'],
        correctIndex: 0,
        explanation: '"Exquisito" é um falso amigo que significa delicioso ou de ótimo gosto.',
        difficulty: 'medium',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_esp_10',
        subject: 'espanhol',
        grade: '6_fund',
        topic: 'Perguntas Básicas',
        question: 'Como perguntar "Onde fica o banheiro?" em espanhol?',
        options: ['¿Dónde está el baño?', '¿Dónde fica o baño?', '¿Aonde vai o banheiro?', '¿Dónde tem banheiro?'],
        correctIndex: 0,
        explanation: 'Em espanhol usa-se "¿Dónde está el baño?".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
    ],
  },
  // TOPIC 10: ITALIANO DO ZERO (PRIMEIRAS PALAVRAS & SONS)
  {
    id: 'cad_ita_1',
    subjectId: 'italiano',
    title: 'Italiano do Zero: Primeiras Palavras, Sons e Pronúncia',
    gradeStage: 'Iniciante do Zero',
    difficulty: 'fácil',
    icon: '🇮🇹',
    summary:
      'Aprenda italiano do absoluto zero: como pronunciar os sons especiais (GLI, GN, C/CH), cumprimentar com Ciao e Buongiorno, números de 1 a 10 e frases do dia a dia.',
    detailedTheory: [
      'A língua italiana é melodiosa e musical. Praticamente todas as palavras terminam em vogal (a, e, i, o, u).',
      'O som de "GLI" equivale ao "LH" do português: "famiglia" (família), "figlio" (filho), "bottiglia" (garrafa).',
      'O som de "GN" equivale ao "NH" do português: "gnocchi" (nhoque), "lasagna" (lasanha), "bagno" (banheiro).',
      'A letra "C" com E/I tem som de TCH: "ciao" (tchau), "cena" (tchêna - jantar), "cioccolato" (tchocoláto).',
      'A combinação "CH" com E/I tem som de K: "bruschetta" (bruskéta), "chianti" (kiânti), "amiche" (amíke).',
      'Saudações essenciais: "Ciao!" (olá/tchau informal), "Buongiorno!" (bom dia formal), "Buonasera!" (boa tarde/noite), "Buonanotte!" (boa noite antes de dormir).',
      'Cortesia: "Per favore" (por favor), "Grazie mille" (muito obrigado), "Prego!" (de nada), "Scusa / Mi scusi" (desculpa / com licença).',
      'Números de 1 a 10: 1 = Uno, 2 = Due, 3 = Tre, 4 = Quattro, 5 = Cinque, 6 = Sei, 7 = Sette, 8 = Otto, 9 = Nove, 10 = Dieci.',
    ],
    howToDoStepByStep: [
      {
        stepNumber: 1,
        title: 'Aprenda a saudação mágica: CIAO',
        description: 'Use "Ciao!" para cumprimentar amigos ao chegar e também ao se despedir.',
      },
      {
        stepNumber: 2,
        title: 'Pratique a regra do C e CH',
        description: 'Lembre: C + I/E = Som de "TCH" (Ciao). CH + I/E = Som de "K" (Bruschetta).',
      },
      {
        stepNumber: 3,
        title: 'Memorize as palavras de cortesia',
        description: 'Diga "Grazie mille" para agradecer e responda "Prego!" quando alguém agradecer você.',
      },
    ],
    solvedExamples: [
      {
        problem: 'Como pedir um copo de água e um sorvete educadamente na Itália?',
        resolutionSteps: [
          'Cumprimento: "Buongiorno!"',
          'Pedido: "Vorrei un bicchiere d\'acqua e un gelato."',
          'Cortesia: "Per favore, grazie!"',
          'Frase completa: "Buongiorno! Vorrei un\'acqua e un gelato, per favore. Grazie mille!"',
        ],
        finalAnswer: '"Vorrei un\'acqua e un gelato, per favore. Grazie!"',
        pedagogicalTip: '"Vorrei" significa "eu gostaria" e é a forma mais educada de fazer pedidos.',
      },
    ],
    goldenRules: [
      'A letra "H" em italiano é sempre muda e serve para endurecer o som (CH = K, GH = G de gato).',
      'Consoantes duplas (doppie) como em "pizza", "notte", "bello" devem ser pronunciadas com uma leve pausa enfática.',
      'A idade em italiano se expressa com o verbo Avere (ter): "Io ho 12 anni".',
    ],
    commonMistakes: [
      'Pronunciar "bruschetta" como "bruschêta" em vez de "bruskéta".',
      'Achar que "burro" é um animal (burro em italiano é manteiga culinária).',
      'Achar que "salire" significa sair (salire significa subir; sair é "uscire").',
    ],
    practiceQuestions: [
      {
        id: 'cq_ita_1',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Saudações',
        question: 'Qual palavra em italiano serve tanto para dizer "Oi" quanto para dizer "Tchau"?',
        options: ['Ciao', 'Buongiorno', 'Grazie', 'Prego'],
        correctIndex: 0,
        explanation: '"Ciao" é a saudação mais usada na Itália para chegadas e despedidas informais.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_2',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Pronúncia Especial',
        question: 'Qual o som da combinação "GLI" na palavra italiana "Famiglia"?',
        options: ['Som de LH (como em família)', 'Som de GLI seco', 'Som de L duplo', 'Som de R'],
        correctIndex: 0,
        explanation: 'O grupo "GLI" tem som de "LH" em italiano.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_3',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Pronúncia do CH',
        question: 'Como se pronuncia a palavra "Bruschetta" em italiano?',
        options: ['Brus-KÉ-ta', 'Brus-CHÉ-ta', 'Brus-JÉ-ta', 'Brus-TCHÉ-ta'],
        correctIndex: 0,
        explanation: 'Em italiano, o grupo CH antes de E ou I tem som de "K" (Bruskéta).',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_4',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Falsos Cognatos',
        question: 'O que significa a palavra "Burro" em italiano?',
        options: ['Manteiga culinária', 'Um jumento / animal', 'Um erro bobo', 'Um tipo de pão'],
        correctIndex: 0,
        explanation: '"Burro" em italiano é manteiga. O animal burro chama-se "asino".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_5',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Cortesia',
        question: 'Quando alguém lhe diz "Grazie mille!", qual é a resposta educada padrão?',
        options: ['Prego!', 'Ciao!', 'Scusa!', 'Buonanotte!'],
        correctIndex: 0,
        explanation: '"Prego!" significa "de nada" em italiano.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_6',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Números 1 a 5',
        question: 'Quais são os números de 1 a 3 em italiano?',
        options: ['Uno, due, tre', 'Uno, dos, tres', 'Un, deux, trois', 'One, two, three'],
        correctIndex: 0,
        explanation: 'Os números de 1 a 3 em italiano são: Uno, due, tre.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_7',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Cores',
        question: 'Quais são as três cores da bandeira da Itália?',
        options: ['Verde, bianco e rosso', 'Azul, amarelo e verde', 'Rosso, nero e giallo', 'Verde, blu e bianco'],
        correctIndex: 0,
        explanation: 'A bandeira tricolor italiana é "verde, bianco e rosso" (verde, branco e vermelho).',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_8',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Perguntas Básicas',
        question: 'Como perguntar "Onde fica o banheiro?" em italiano?',
        options: ['Dov\'è il bagno?', 'Onde fica o bagno?', 'Dove esta la casa?', 'Qual è il bagno?'],
        correctIndex: 0,
        explanation: '"Dov\'è il bagno?" é a forma correta em italiano (onde fica o banheiro).',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_9',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Pronúncia do GN',
        question: 'A palavra "Gnocchi" e a palavra "Lasagna" têm qual som na sílaba "GN"?',
        options: ['Som de NH (como nhoque e lasanha)', 'Som de G duplo', 'Som de N mudo', 'Som de L'],
        correctIndex: 0,
        explanation: 'O grupo "GN" em italiano tem som idêntico ao "NH" da língua portuguesa.',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
      {
        id: 'cq_ita_10',
        subject: 'italiano',
        grade: '6_fund',
        topic: 'Verbo Essere (Identidade)',
        question: 'Como dizer "Eu sou brasileiro" em italiano?',
        options: ['Io sono brasiliano', 'Io ho brasiliano', 'Io faccio brasiliano', 'Io sto brasiliano'],
        correctIndex: 0,
        explanation: 'Usa-se o verbo essere: "Io sono brasiliano".',
        difficulty: 'easy',
        questionType: 'multiple_choice',
      },
    ],
  },
];

// Export CADERNO_TOPICS with options randomized so that correct answers are not always A
export const CADERNO_TOPICS: CadernoTopic[] = RAW_CADERNO_TOPICS.map((topic) => ({
  ...topic,
  practiceQuestions: shuffleQuestionsList(topic.practiceQuestions || []),
}));
