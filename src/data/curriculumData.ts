import { GradeLevel, Question, SubjectId, SubjectInfo, TopicLesson, DifficultyLevel } from '../types';

export const GRADE_LABELS: Record<GradeLevel, { short: string; full: string; stage: string; previousGrade: GradeLevel | null }> = {
  '1_fund': { short: '1º Ano', full: '1º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: null },
  '2_fund': { short: '2º Ano', full: '2º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '1_fund' },
  '3_fund': { short: '3º Ano', full: '3º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '2_fund' },
  '4_fund': { short: '4º Ano', full: '4º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '3_fund' },
  '5_fund': { short: '5º Ano', full: '5º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '4_fund' },
  '6_fund': { short: '6º Ano', full: '6º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '5_fund' },
  '7_fund': { short: '7º Ano', full: '7º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '6_fund' },
  '8_fund': { short: '8º Ano', full: '8º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '7_fund' },
  '9_fund': { short: '9º Ano', full: '9º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '8_fund' },
  '1_medio': { short: '1º EM', full: '1ª Série do Ensino Médio', stage: 'Médio', previousGrade: '9_fund' },
  '2_medio': { short: '2º EM', full: '2ª Série do Ensino Médio', stage: 'Médio', previousGrade: '1_medio' },
  '3_medio': { short: '3º EM', full: '3ª Série do Ensino Médio', stage: 'Médio', previousGrade: '2_medio' },
  'enem': { short: 'ENEM', full: 'Pré-Vestibular & ENEM', stage: 'Avançado', previousGrade: '3_medio' },
};

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '📐',
    color: 'from-amber-500 to-orange-600',
    description: 'Números, operações, álgebra, geometria e raciocínio lógico.',
  },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    icon: '📖',
    color: 'from-blue-500 to-indigo-600',
    description: 'Gramática, interpretação de texto, ortografia e literatura.',
  },
  {
    id: 'ingles',
    name: 'Língua Inglesa',
    icon: '🇬🇧',
    color: 'from-sky-500 to-blue-600',
    description: 'Gramática, tempos verbais, vocabulário e interpretação textual da série.',
  },
  {
    id: 'ciencias',
    name: 'Ciências da Natureza',
    icon: '🧪',
    color: 'from-emerald-500 to-teal-600',
    description: 'Corpo humano, ecossistemas, química e física do cotidiano.',
  },
  {
    id: 'historia',
    name: 'História',
    icon: '🏛️',
    color: 'from-rose-500 to-red-600',
    description: 'História do Brasil, civilizações antigas e fatos do mundo.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '🌍',
    color: 'from-cyan-500 to-blue-600',
    description: 'Mapas, relevo, clima, vegetação e geopolítica mundial.',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: '⚡',
    color: 'from-violet-500 to-purple-600',
    description: 'Mecânica, energia, óptica, eletricidade e ondas.',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '⚗️',
    color: 'from-pink-500 to-rose-600',
    description: 'Matéria, reações, tabela periódica e transformações.',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '🧬',
    color: 'from-teal-500 to-emerald-600',
    description: 'Células, genética, evolução e ecologia.',
  },
  {
    id: 'xadrez',
    name: 'Xadrez',
    icon: '♟️',
    color: 'from-slate-700 to-stone-900',
    description: 'Regras, movimentos de peças, táticas (garfo, cravada, espeto), roque, en passant e xeque-mate.',
  },
  {
    id: 'espanhol',
    name: 'Língua Espanhola',
    icon: '🇪🇸',
    color: 'from-amber-500 to-rose-600',
    description: '🟢 Começando do Absoluto Zero: Alfabeto, pronúncia, saudações, falsos amigos e vocabulário inicial.',
    isBeginnerFromZero: true,
  },
  {
    id: 'italiano',
    name: 'Língua Italiana',
    icon: '🇮🇹',
    color: 'from-emerald-600 to-rose-600',
    description: '🟢 Começando do Absoluto Zero: Alfabeto, sons especiais (GLI, GN, C/CH), saudações e primeiras frases.',
    isBeginnerFromZero: true,
  },
];

export const HIGH_SCHOOL_GRADES: GradeLevel[] = ['1_medio', '2_medio', '3_medio', 'enem'];

export const CONFIGURABLE_SPECIFIC_SUBJECTS: {
  id: SubjectId;
  name: string;
  category: 'ciencias_especificas';
  icon: string;
  description: string;
}[] = [
  {
    id: 'biologia',
    name: 'Biologia',
    category: 'ciencias_especificas',
    icon: '🧬',
    description: 'Citologia, seres vivos, corpo humano, ecologia e genética.',
  },
  {
    id: 'fisica',
    name: 'Física',
    category: 'ciencias_especificas',
    icon: '⚡',
    description: 'Movimento, força, energia, óptica, ondas e eletricidade.',
  },
  {
    id: 'quimica',
    name: 'Química',
    category: 'ciencias_especificas',
    icon: '🧪',
    description: 'Matéria, átomos, reações químicas e tabela periódica.',
  },
];

export function getSubjectsForGrade(
  grade?: GradeLevel | string,
  customSubjects?: SubjectId[]
): SubjectInfo[] {
  let activeCustom = customSubjects;
  if (activeCustom === undefined && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('estudahud_user_profile_v3') || localStorage.getItem('estudahud_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.customSubjects)) {
          activeCustom = parsed.customSubjects;
        }
      }
    } catch {}
  }

  // Base list of BNCC subjects always included
  const baseList: SubjectId[] = [
    'matematica',
    'portugues',
    'ciencias',
    'historia',
    'geografia',
    'ingles',
    'espanhol',
    'italiano',
  ];

  const isHighSchool = grade && HIGH_SCHOOL_GRADES.includes(grade as GradeLevel);

  // If customSubjects has been configured by the user, respect their selection
  // (Base subjects + any specific subjects they selected, e.g. biologia, fisica, quimica)
  if (Array.isArray(activeCustom)) {
    const chosenIds = new Set<SubjectId>([...baseList, ...activeCustom]);
    // Ensure xadrez is removed from school subjects list
    chosenIds.delete('xadrez');
    return SUBJECTS.filter((s) => chosenIds.has(s.id));
  }

  // Only base BNCC subjects by default.
  // Specific subjects like biologia, fisica and quimica are only added if the student configures them via "Editar Matérias"
  return SUBJECTS.filter((s) => baseList.includes(s.id) && s.id !== 'xadrez');
}

/**
 * Utility to randomly shuffle the options of a single question and update its correctIndex.
 * GUARANTEES that:
 * 1. If the question comes with correctIndex === 0 (Position A), the correct answer is
 *    GUARANTEED to move away from position A to another alternative (B, C, D) so that
 *    the correct answer is never fixed at position A.
 * 2. If forcedTargetIndex is provided, places the correct answer at that specific slot.
 * 3. All other alternatives (distractors) are randomly shuffled using Fisher-Yates.
 * 4. True/False questions maintain their standard binary order [Verdadeiro, Falso].
 */
export function shuffleQuestionOptions(question: Question, forcedTargetIndex?: number): Question {
  if (!question || !question.options || question.options.length <= 1) return question;

  // Preserve True/False fixed binary order [Verdadeiro (V), Falso (F)]
  if (question.isTrueFalse || question.questionType === 'true_false') {
    return question;
  }

  const numOptions = question.options.length;
  const origCorrectIdx = Math.max(0, Math.min(question.correctIndex ?? 0, numOptions - 1));
  const correctOptionText = question.options[origCorrectIdx];

  // Separate distractors
  const distractors = question.options.filter((_, idx) => idx !== origCorrectIdx);

  // Fisher-Yates shuffle on distractors
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = distractors[i];
    distractors[i] = distractors[j];
    distractors[j] = temp;
  }

  // Determine target slot for the correct answer
  let targetCorrectIdx: number;
  if (
    typeof forcedTargetIndex === 'number' &&
    forcedTargetIndex >= 0 &&
    forcedTargetIndex < numOptions
  ) {
    targetCorrectIdx = forcedTargetIndex;
  } else if (origCorrectIdx === 0 && numOptions >= 2) {
    // If the answer is originally at position A (index 0), GUARANTEE that it changes position
    // by picking randomly from {1, 2, ..., numOptions - 1} (e.g. B, C, D)
    const nonZeroSlots: number[] = [];
    for (let s = 1; s < numOptions; s++) nonZeroSlots.push(s);
    targetCorrectIdx = nonZeroSlots[Math.floor(Math.random() * nonZeroSlots.length)];
  } else if (numOptions >= 2) {
    // If originally not 0, pick any slot different from origCorrectIdx
    const otherSlots: number[] = [];
    for (let s = 0; s < numOptions; s++) {
      if (s !== origCorrectIdx) otherSlots.push(s);
    }
    targetCorrectIdx = otherSlots[Math.floor(Math.random() * otherSlots.length)];
  } else {
    targetCorrectIdx = 0;
  }

  // Assemble new options array with correct answer placed at targetCorrectIdx
  const newOptions: string[] = [];
  let distractorIdx = 0;
  for (let s = 0; s < numOptions; s++) {
    if (s === targetCorrectIdx) {
      newOptions.push(correctOptionText);
    } else {
      newOptions.push(distractors[distractorIdx++]);
    }
  }

  return {
    ...question,
    options: newOptions,
    correctIndex: targetCorrectIdx,
  };
}

/**
 * Shuffles an entire list of questions (e.g., for a Simulado, Prova or Quiz session).
 * Distributes correct answer positions across alternatives (A, B, C, D) evenly
 * while guaranteeing that questions starting at index 0 move their correct answer,
 * preventing any repetitive patterns or fixed positions.
 */
export function shuffleQuestionsList(questions: Question[]): Question[] {
  if (!questions || questions.length === 0) return [];

  // Varied distribution slots for multiple-choice questions (e.g., B, C, D, A, C, B, D, ...)
  const targetPattern = [1, 2, 3, 0, 2, 1, 3, 0, 1, 2];
  const offset = Math.floor(Math.random() * targetPattern.length);

  return questions.map((q, idx) => {
    if (!q || !q.options || q.options.length <= 1) return q;
    if (q.isTrueFalse || q.questionType === 'true_false') return q;

    const numOptions = q.options.length;
    let slot = targetPattern[(idx + offset) % targetPattern.length] % numOptions;

    // For the first question or questions authored at 0, avoid slot 0 so the answer never defaults to A
    if ((idx === 0 || q.correctIndex === 0) && slot === 0 && numOptions >= 2) {
      slot = 1 + Math.floor(Math.random() * (numOptions - 1));
    }

    return shuffleQuestionOptions(q, slot);
  });
}

// Rich lesson topics with didactic explanations and 5 questions each
const RAW_SAMPLE_LESSONS: TopicLesson[] = [
  // 6º ano - Matemática - Frações
  {
    id: 'mat_6_fracoes',
    subject: 'matematica',
    grade: '6_fund',
    title: 'Frações e Divisão em Partes Iguais',
    summary:
      'Uma fração representa uma ou mais partes iguais de um todo que foi dividido. O numerador (número de cima) indica quantas partes foram tomadas, e o denominador (número de baixo) indica em quantas partes o todo foi dividido.',
    keyPoints: [
      'O número de cima é o Numerador (quantas partes pegamos).',
      'O número de baixo é o Denominador (o total de partes iguais).',
      'Frações equivalentes têm o mesmo valor numérico (ex: 1/2 = 2/4 = 4/8).',
      'Para somar frações com mesmo denominador, somamos os numeradores e mantemos o denominador.',
    ],
    example:
      'Se uma pizza for dividida em 8 fatias iguais e você comer 3 fatias, você consumiu 3/8 da pizza. As 5 fatias restantes representam 5/8.',
    practiceQuestions: [
      {
        id: 'q_mat_6_1',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Em uma barra de chocolate com 10 pedaços iguais, Pedro comeu 4 pedaços. Qual fração representa o que Pedro comeu?',
        options: ['4/10 (ou 2/5)', '10/4', '4/6', '6/10'],
        correctIndex: 0,
        explanation: 'Pedro comeu 4 de um total de 10 partes, resultando em 4/10, que simplificado é 2/5.',
        difficulty: 'easy',
      },
      {
        id: 'q_mat_6_2',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual fração é equivalente a 1/2?',
        options: ['3/6', '2/3', '3/4', '1/4'],
        correctIndex: 0,
        explanation: 'Multiplicando numerador e denominador de 1/2 por 3, obtemos 3/6.',
        difficulty: 'easy',
      },
      {
        id: 'q_mat_6_3',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Quanto é 2/7 + 3/7?',
        options: ['5/7', '5/14', '6/7', '1/7'],
        correctIndex: 0,
        explanation: 'Como os denominadores são iguais a 7, somamos os numeradores: 2 + 3 = 5, mantendo o 7 embaixo (5/7).',
        difficulty: 'medium',
      },
      {
        id: 'q_mat_6_4',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Uma turma tem 30 alunos. Se 1/3 gosta de futebol, quantos alunos gostam de futebol?',
        options: ['10 alunos', '15 alunos', '20 alunos', '5 alunos'],
        correctIndex: 0,
        explanation: '1/3 de 30 é calculado dividindo 30 por 3 = 10 alunos.',
        difficulty: 'medium',
      },
      {
        id: 'q_mat_6_5',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual das frações a seguir é considerada uma fração imprópria (onde o numerador é maior que o denominador)?',
        options: ['7/4', '2/5', '3/8', '1/2'],
        correctIndex: 0,
        explanation: '7/4 tem o numerador (7) maior que o denominador (4), representando mais do que 1 inteiro.',
        difficulty: 'hard',
      },
    ],
  },
  // 8º ano - Ciências - Sistema Circulatório e Sangue
  {
    id: 'cie_8_circulatorio',
    subject: 'ciencias',
    grade: '8_fund',
    title: 'Sistema Cardiovascular e Circulação Humana',
    summary:
      'O sistema cardiovascular é responsável por transportar nutrientes, oxigênio e hormônios para todas as células do corpo através do sangue impulsionado pelo coração.',
    keyPoints: [
      'O coração funciona como uma bomba com 4 cavidades (2 átrios e 2 ventrículos).',
      'Artérias levam sangue que sai do coração; veias trazem sangue de volta ao coração.',
      'Os glóbulos vermelhos (hemácias) transportam oxigênio com a hemoglobina.',
      'Os glóbulos brancos (leucócitos) são as células de defesa do organismo.',
    ],
    example:
      'Na pequena circulação, o sangue vai do coração aos pulmões para receber oxigênio (hematose) e retorna ao coração. Na grande circulação, o sangue oxigenado é distribuído para todo o corpo.',
    practiceQuestions: [
      {
        id: 'q_cie_8_1',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Qual componente do sangue é o principal responsável pelo transporte de oxigênio?',
        options: ['Hemácias (glóbulos vermelhos)', 'Leucócitos (glóbulos brancos)', 'Plaquetas', 'Plasma'],
        correctIndex: 0,
        explanation: 'As hemácias contêm hemoglobina, proteína que se liga ao oxigênio nos pulmões e o leva às células.',
        difficulty: 'easy',
      },
      {
        id: 'q_cie_8_2',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Os vasos sanguíneos que levam sangue DO coração PARA o restante do corpo chamam-se:',
        options: ['Artérias', 'Veias', 'Capilares linfáticos', 'Vênulas'],
        correctIndex: 0,
        explanation: 'Artérias saem do coração com sangue sob alta pressão; veias trazem o sangue de volta.',
        difficulty: 'easy',
      },
      {
        id: 'q_cie_8_3',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'O coração humano é dividido internamente em quantas cavidades?',
        options: ['4 (2 átrios e 2 ventrículos)', '2 cavidades', '3 cavidades', '6 cavidades'],
        correctIndex: 0,
        explanation: 'São 2 átrios superiores que recebem sangue e 2 ventrículos inferiores que bombeiam o sangue.',
        difficulty: 'medium',
      },
      {
        id: 'q_cie_8_4',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Qual é a função principal das plaquetas sanguíneas?',
        options: ['Auxiliar na coagulação do sangue', 'Combater vírus e bactérias', 'Produzir hormônios', 'Transportar gás carbônico'],
        correctIndex: 0,
        explanation: 'As plaquetas atuam na formação de coágulos para conter sangramentos e cicatrizar feridas.',
        difficulty: 'medium',
      },
      {
        id: 'q_cie_8_5',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'O processo de oxigenação do sangue que ocorre nos alvéolos pulmonares é chamado de:',
        options: ['Hematose', 'Fagocitose', 'Diapedese', 'Hemólise'],
        correctIndex: 0,
        explanation: 'Hematose é a troca gasosa onde o gás carbônico sai do sangue e o oxigênio entra.',
        difficulty: 'hard',
      },
    ],
  },
  // 1º Ano Ensino Médio - Português - Figuras de Linguagem
  {
    id: 'port_1em_figuras',
    subject: 'portugues',
    grade: '1_medio',
    title: 'Figuras de Linguagem e Expressividade',
    summary:
      'Figuras de linguagem são recursos estilísticos utilizados pelo autor para dar maior expressividade, emoção, impacto e beleza ao texto ou fala.',
    keyPoints: [
      'Metáfora: comparação implícita sem conectivo (ex: "Ela é uma flor").',
      'Metonímia: troca de um termo por outro com relação de proximidade (ex: "Li Machado de Assis").',
      'Hipérbole: exagero intencional (ex: "Estou morrendo de sede").',
      'Antítese: aproximação de palavras com sentidos opostos (ex: "O amor e o ódio").',
    ],
    example:
      'Quando dizemos "Chorei rios de lágrimas", estamos usando uma Hipérbole para enfatizar a intensidade do choro por meio do exagero.',
    practiceQuestions: [
      {
        id: 'q_port_1em_1',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Na frase "Ele comeu dois pratos inteiros no almoço", qual figura de linguagem ocorre?',
        options: ['Metonímia (o continente pelo conteúdo)', 'Metáfora', 'Eufemismo', 'Pleonasmo'],
        correctIndex: 0,
        explanation: 'Ele comeu a comida que estava nos pratos, e não os pratos de cerâmica. Isso é metonímia.',
        difficulty: 'easy',
      },
      {
        id: 'q_port_1em_2',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Em "O vento sussurrava segredos pelas frestas da janela", temos um exemplo de:',
        options: ['Personificação / Prosopopeia', 'Hipérbole', 'Ironia', 'Paradoxo'],
        correctIndex: 0,
        explanation: 'Atribuir características humanas (sussurrar segredos) a elementos inanimados (o vento) é personificação.',
        difficulty: 'easy',
      },
      {
        id: 'q_port_1em_3',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Substituir a frase "Ele morreu" por "Ele descansou e foi para o andar de cima" é um exemplo de:',
        options: ['Eufemismo (suavização)', 'Hipérbole', 'Sinestesia', 'Antítese'],
        correctIndex: 0,
        explanation: 'O eufemismo é utilizado para suavizar uma ideia desagradável ou chocante.',
        difficulty: 'medium',
      },
      {
        id: 'q_port_1em_4',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'A frase "Amor é fogo que arde sem se ver / É ferida que dói e não se sente" de Camões apresenta principalmente:',
        options: ['Paradoxo (ideias contraditórias que parecem impossíveis juntas)', 'Catacrese', 'Aliteração', 'Onomatopeia'],
        correctIndex: 0,
        explanation: 'O paradoxo reúne conceitos inconciliáveis na lógica cotidiana para expressar a complexidade do amor.',
        difficulty: 'hard',
      },
      {
        id: 'q_port_1em_5',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Em "Senti o doce perfume da sua voz", qual figura combina sentidos corporais diferentes (paladar e audição/olfato)?',
        options: ['Sinestesia', 'Pleonasmo', 'Anacoluto', 'Zeugma'],
        correctIndex: 0,
        explanation: 'Sinestesia é a fusão de diferentes sensações físicas em uma mesma expressão.',
        difficulty: 'hard',
      },
    ],
  },
  // 7º Ano / Geral - Língua Espanhola - Saludos, Pronombres y Verbos
  {
    id: 'esp_7_saludos',
    subject: 'espanhol',
    grade: '7_fund',
    title: 'Saludos, Presentaciones y Verbos Básicos en Español',
    revisionTitle: 'Revisión: Alfabeto y Pronombres Personales en Español',
    revisionSummary:
      'En español, los pronombres personales (yo, tú, él, ella, nosotros, vosotros, ellos) indican quién realiza la acción. La letra "ñ" y las reglas de pronunciación de "ll", "j" y "c/z" son fundamentales.',
    revisionDetailedExplanation:
      'Aprender español comienza con dominar los pronombres personales y el abecedario. En español no existe la letra "ç", pero tenemos la letra "ñ" (como en "español" y "año"). La letra "j" suena como una "rr" fuerte en portugués (como en "jamón"). Los pronombres sujetos son: Yo (eu), Tú (você/tu), Él/Ella/Usted (ele/ela/o senhor), Nosotros (nós), Vosotros (vós/vocês na Espanha) y Ellos/Ellas/Ustedes (eles/elas/vocês na América Latina).',
    revisionKeyPoints: [
      'Yo = Eu | Tú = Você (informal) | Usted = O senhor / A senhora (formal).',
      'Nosotros = Nós | Ellos / Ellas = Eles / Elas | Ustedes = Vocês.',
      'A letra "Ñ" tem som de "NH" em português (ex: España = Espanha).',
      'A letra "J" e "G" (antes de E e I) têm som gutural raspado na garganta.',
    ],
    revisionExample:
      'Para se apresentar formalmente: "Hola, yo soy Carlos y usted es el profesor."',
    summary:
      'Aprenda como cumprimentar, despedir-se e usar os verbos SER, ESTAR e LLAMARSE para manter uma conversa básica em espanhol.',
    detailedExplanation:
      'Cumprimentos e apresentações são a porta de entrada para a comunicação em língua espanhola. Para saudações usamos: "¡Hola!" (Oi/Olá), "¡Buenos días!" (Bom dia), "¡Buenas tardes!" (Boa tarde) e "¡Buenas noches!" (Boa noite). Para perguntar o nome: "¿Cómo te llamas?" (informal) ou "¿Cómo se llama usted?" (formal). Para responder: "Me llamo...", "Mi nombre es..." ou "Soy...". O verbo SER é usado para características permanentes, profissão e origem ("Yo soy estudiante", "Soy de Brasil"), enquanto ESTAR é usado para localização e estados temporários ("Estoy feliz", "Estoy en la escuela"). Atenção aos falsos amigos: "embarazada" significa grávida (e não embaraçada), e "apellido" significa sobrenome!',
    keyPoints: [
      '¡Buenos días! = Bom dia | ¡Buenas tardes! = Boa tarde | ¡Buenas noches! = Boa noite.',
      '¿Cómo te llamas? -> Me llamo... (Como você se chama? -> Eu me chamo...).',
      'Ser: Yo soy, Tú eres, Él es, Nosotros somos, Ellos son (origem e identidade).',
      'Estar: Yo estoy, Tú estás, Él está, Nosotros estamos, Ellos están (estado e localização).',
      'Cuidado com falsos amigos: "Apellido" é Sobrenome, "Sobrenome" em espanhol é Apodo (apelido)!',
    ],
    example:
      '— ¡Hola! ¿Cómo te llamas? — ¡Hola! Me llamo Lucas, soy brasileño y estoy muy contento de conocerte.',
    practiceQuestions: [
      {
        id: 'q_esp_7_1',
        subject: 'espanhol',
        grade: '7_fund',
        topic: 'Saludos y Cortesía',
        question: 'Como se diz "Bom dia" em espanhol?',
        options: ['¡Buenos días!', '¡Buenas mañanas!', '¡Buen día sol!', '¡Hola día!'],
        correctIndex: 0,
        explanation: 'Em espanhol a saudação correta da manhã é "¡Buenos días!" (no plural).',
        difficulty: 'easy',
      },
      {
        id: 'q_esp_7_2',
        subject: 'espanhol',
        grade: '7_fund',
        topic: 'Pronombres Personales',
        question: 'Qual pronome pessoal em espanhol corresponde ao "Eu" do português?',
        options: ['Yo', 'Tú', 'Él', 'Nosotros'],
        correctIndex: 0,
        explanation: '"Yo" é o pronome da primeira pessoa do singular (Eu).',
        difficulty: 'easy',
      },
      {
        id: 'q_esp_7_3',
        subject: 'espanhol',
        grade: '7_fund',
        topic: 'Falsos Amigos (Heterosemánticos)',
        question: 'Em espanhol, o que significa a palavra "APELLIDO"?',
        options: ['Sobrenome', 'Apelido carinhoso', 'Primeiro nome', 'Profissão'],
        correctIndex: 0,
        explanation: '"Apellido" significa sobrenome da família. Já "Apodo" significa apelido.',
        difficulty: 'medium',
      },
      {
        id: 'q_esp_7_4',
        subject: 'espanhol',
        grade: '7_fund',
        topic: 'Verbos Ser y Estar',
        question: 'Complete a frase corretamente: "Yo ______ estudiante de español y ______ en la biblioteca."',
        options: ['soy / estoy', 'estoy / soy', 'eres / estás', 'somos / estamos'],
        correctIndex: 0,
        explanation: '"Soy" indica identidade/profissão (verbo Ser) e "estoy" indica localização no espaço (verbo Estar).',
        difficulty: 'medium',
      },
      {
        id: 'q_esp_7_5',
        subject: 'espanhol',
        grade: '7_fund',
        topic: 'Despedidas',
        question: 'Qual expressão expressa "Até logo / Até breve" em espanhol?',
        options: ['Hasta luego', 'Por favor', 'De nada', 'Muchas gracias'],
        correctIndex: 0,
        explanation: '"Hasta luego" e "Hasta pronto" são formas comuns de despedida.',
        difficulty: 'easy',
      },
    ],
  },
  // 7º Ano / Geral - Língua Italiana - Saluti, Presentazioni e Verbi Base
  {
    id: 'ita_7_saluti',
    subject: 'italiano',
    grade: '7_fund',
    title: 'Saluti, Presentazioni e Verbi Essere e Avere in Italiano',
    revisionTitle: 'Revisione: Alfabeto, Pronuncia e Pronomi Personali Italiani',
    revisionSummary:
      'In italiano, i pronomi personali soggetto sono: io (eu), tu (você), lui/lei (ele/ela), noi (nós), voi (vocês) e loro (eles/elas). As combinações "ci/ce" e "chi/che" têm sons especiais.',
    revisionDetailedExplanation:
      'A língua italiana tem uma melodia encantadora e regras fonéticas muito claras. A pronúncia de "C" antes de E/I soa como "TCH" ("ciao" soa "tchao", "cena" soa "tchena"). Já "CH" antes de E/I soa como "K" ("chianti" = kianti, "perché" = perkê). Da mesma forma, "G" antes de E/I soa "DJ" ("gelato" = djelato). Os pronomes sujeitos são: Io (eu), Tu (tu/você), Lui/Lei (ele/ela/a senhora com maiúscula formal), Noi (nós), Voi (vós/vocês) e Loro (eles/elas).',
    revisionKeyPoints: [
      'Io = Eu | Tu = Você | Lui/Lei = Ele / Ela.',
      'Noi = Nós | Voi = Vocês | Loro = Eles / Elas.',
      '"Ciao" serve tanto para Oi quanto para Tchau informal.',
      '"Ci/Ce" tem som de "Tch" e "Chi/Che" tem som de "K" duro.',
    ],
    revisionExample:
      'Exemplo de apresentação: "Ciao a tutti! Io sono Sofia e lui è mio fratello Marco."',
    summary:
      'Aprenda as saudações cotidianas, formas de cortesia e os dois verbos pilares do italiano: ESSERE (ser/estar) e AVERE (ter).',
    detailedExplanation:
      'Para cumprimentar em italiano usamos: "Buongiorno!" (Bom dia), "Buonasera!" (Boa tarde/Boa noite ao chegar), "Buonanotte!" (Boa noite ao ir dormir) e o famoso "Ciao!" (Oi ou Tchau informal). Para perguntar o nome: "Come ti chiami?" (informal) ou "Come si chiama Lei?" (formal). Para responder: "Mi chiamo Giovanni" ou "Io sono Giovanni". Os dois verbos auxiliares mais importantes são ESSERE (Io sono, Tu sei, Lui è, Noi siamo, Voi siete, Loro sono) e AVERE (Io ho, Tu hai, Lui ha, Noi abbiamo, Voi avete, Loro hanno). Atenção: a letra H é sempre muda em italiano!',
    keyPoints: [
      'Buongiorno! = Bom dia | Buonasera! = Boa noite (ao chegar) | Buonanotte! = Boa noite (ao dormir).',
      'Come ti chiami? -> Mi chiamo... (Como você se chama? -> Meu nome é...).',
      'Verbo Essere: Io sono, Tu sei, Lui/Lei è, Noi siamo, Voi siete, Loro sono.',
      'Verbo Avere: Io ho, Tu hai, Lui/Lei ha, Noi abbiamo, Voi avete, Loro hanno.',
      '"Grazie!" significa Obrigado, e a resposta é "Prego!" (De nada).',
    ],
    example:
      '— Ciao, come ti chiami? — Ciao! Mi chiamo Matteo, ho dodici anni e sono italiano. E tu?',
    practiceQuestions: [
      {
        id: 'q_ita_7_1',
        subject: 'italiano',
        grade: '7_fund',
        topic: 'Saluti di Base',
        question: 'Como dizemos "Bom dia" formal em italiano?',
        options: ['Buongiorno', 'Buonanotte', 'Arrivederci', 'Per favore'],
        correctIndex: 0,
        explanation: '"Buongiorno" é a saudação padrão para o período diurno em italiano.',
        difficulty: 'easy',
      },
      {
        id: 'q_ita_7_2',
        subject: 'italiano',
        grade: '7_fund',
        topic: 'Cortesia e Ringraziamenti',
        question: 'Qual é a resposta educada e correta após alguém lhe dizer "Grazie!" (Obrigado)?',
        options: ['Prego!', 'Ciao!', 'Scusa!', 'Piacere!'],
        correctIndex: 0,
        explanation: '"Prego" significa "de nada / por favor / disponha" em resposta a um agradecimento.',
        difficulty: 'easy',
      },
      {
        id: 'q_ita_7_3',
        subject: 'italiano',
        grade: '7_fund',
        topic: 'Verbo Essere',
        question: 'Qual é a conjugação correta do verbo ESSERE para "Noi" (Nós)?',
        options: ['siamo (Noi siamo)', 'sono', 'siete', 'sei'],
        correctIndex: 0,
        explanation: 'A conjugação é: io sono, tu sei, lui è, noi siamo, voi siete, loro sono.',
        difficulty: 'medium',
      },
      {
        id: 'q_ita_7_4',
        subject: 'italiano',
        grade: '7_fund',
        topic: 'Verbo Avere (Idade)',
        question: 'Para dizer "Eu tenho 14 anos" em italiano, usamos o verbo AVERE. Como fica a frase?',
        options: ['Io ho 14 anni', 'Io sono 14 anni', 'Io faccio 14 anni', 'Io sto 14 anni'],
        correctIndex: 0,
        explanation: 'Em italiano a idade é expressa com o verbo Avere: "Io ho ... anni". O "H" é mudo.',
        difficulty: 'medium',
      },
      {
        id: 'q_ita_7_5',
        subject: 'italiano',
        grade: '7_fund',
        topic: 'Vocabolario e Famiglia',
        question: 'Como se diz "Mãe" e "Pai" em italiano?',
        options: ['Madre / Mamma e Padre / Papà', 'Hermana e Hermano', 'Fratello e Sorella', 'Zia e Zio'],
        correctIndex: 0,
        explanation: '"Madre / Mamma" é mãe e "Padre / Papà" é pai em italiano.',
        difficulty: 'easy',
      },
    ],
  },
  // 3º Ano EM / ENEM - História - Revolução Industrial e Era Contemporânea
  {
    id: 'hist_enem_revolucao',
    subject: 'historia',
    grade: 'enem',
    title: 'A Revolução Industrial e as Transformações no Trabalho',
    summary:
      'Iniciada na Inglaterra no século XVIII, a Revolução Industrial substituiu o trabalho artesanal pelas máquinas a vapor, impulsionando a urbanização rápida e novas relações de classe social.',
    keyPoints: [
      'Pioneirismo inglês devido a carvão, ferro, capitais acumulados e cercamento dos campos.',
      'Surgimento da burguesia industrial e do proletariado operário.',
      'Jornadas extenuantes de trabalho que deram origem ao movimento operário e sindicatos.',
      'Impacto definitivo na velocidade dos transportes com trens e barcos a vapor.',
    ],
    example:
      'As ferrovias permitiram escoar a produção têxtil de Manchester para o porto de Liverpool em poucas horas, integrando mercados globais.',
    practiceQuestions: [
      {
        id: 'q_hist_enem_1',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'Qual país foi o pioneiro na Primeira Revolução Industrial no século XVIII?',
        options: ['Inglaterra', 'França', 'Alemanha', 'Estados Unidos'],
        correctIndex: 0,
        explanation: 'A Inglaterra reuniu jazidas de carvão/ferro, capital comercial acumulado e mão de obra urbana disponível.',
        difficulty: 'easy',
      },
      {
        id: 'q_hist_enem_2',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'A principal fonte de energia motriz da Primeira Revolução Industrial foi:',
        options: ['O vapor gerado pela queima de carvão mineral', 'A eletricidade', 'O petróleo', 'A energia nuclear'],
        correctIndex: 0,
        explanation: 'A máquina a vapor de James Watt impulsionada pelo carvão foi o motor central da primeira fase.',
        difficulty: 'easy',
      },
      {
        id: 'q_hist_enem_3',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'O movimento operário inglês que destruía máquinas por considerá-las culpadas pelo desemprego ficou conhecido como:',
        options: ['Ludismo', 'Cartismo', 'Anarquismo', 'Taylorismo'],
        correctIndex: 0,
        explanation: 'O ludismo (liderado simbolicamente por Ned Ludd) quebrava teares mecânicos em protesto às condições de vida.',
        difficulty: 'medium',
      },
      {
        id: 'q_hist_enem_4',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'Qual foi o fenômeno socioespacial provocado pela transferência de camponeses para as cidades industriais?',
        options: ['Êxodo rural e rápido crescimento urbano desordenado', 'Reforma agrária planejada', 'Desconcentração urbana', 'Colonização do interior'],
        correctIndex: 0,
        explanation: 'A Lei de Cercamento dos Campos expulsou camponeses para os centros fabris superlotados.',
        difficulty: 'medium',
      },
      {
        id: 'q_hist_enem_5',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'A Segunda Revolução Industrial (século XIX) destacou-se principalmente por introduzir:',
        options: ['Petróleo, eletricidade, aço e a indústria química', 'Apenas teares manuais', 'A energia eólica em larga escala', 'O artesanato feudal'],
        correctIndex: 0,
        explanation: 'A segunda fase expandiu-se com motor a combustão, eletricidade e produção em massa de aço.',
        difficulty: 'hard',
      },
    ],
  },
  // XADREZ: FUNDAMENTOS, PEÇAS E TABULEIRO
  {
    id: 'xad_6_fundamentos',
    subject: 'xadrez',
    grade: '6_fund',
    title: 'Fundamentos do Xadrez: Tabuleiro, Peças e Valores',
    summary:
      'O xadrez é jogado em um tabuleiro de 64 casas (8 colunas × 8 fileiras). Cada exército começa com 16 peças: 1 Rei, 1 Dama, 2 Torres, 2 Bispos, 2 Cavalos e 8 Peões. Compreender o valor relativo e a mobilidade de cada peça é a chave da vitória.',
    keyPoints: [
      'Posicionamento: "Branca na direita" (a casa no canto inferior direito deve ser branca) e Dama na sua própria cor (Dama branca na casa branca, Dama preta na casa preta).',
      'Valores relativos: Dama = 9 pts, Torre = 5 pts, Bispo = 3 pts, Cavalo = 3 pts, Peão = 1 pt. O Rei tem valor infinito.',
      'Movimento do Cavalo: Anda em forma de "L" (2 casas em linha e 1 lateral) e é a única peça que pode pular sobre outras.',
      'Movimento do Peão: Avança 1 casa para frente (ou 2 no lance inicial), mas captura apenas 1 casa na diagonal à frente.',
    ],
    example:
      'Se um jogador troca um Cavalo (3 pts) por uma Torre adversária (5 pts), ele ganha o que no xadrez se chama de "Qualidade" (+2 pontos de vantagem material).',
    practiceQuestions: [
      {
        id: 'q_xad_6_1',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Valores das Peças',
        question: 'Qual é a pontuação relativa de valor atribuída à Dama (Rainha) e à Torre no xadrez?',
        options: ['Dama = 9 pontos e Torre = 5 pontos', 'Dama = 5 pontos e Torre = 3 pontos', 'Dama = 10 pontos e Torre = 8 pontos', 'Dama = 7 pontos e Torre = 4 pontos'],
        correctIndex: 0,
        explanation: 'Na escala padrão de valores do xadrez: Dama = 9 pontos, Torre = 5 pontos, Bispo = 3, Cavalo = 3 e Peão = 1.',
        difficulty: 'easy',
      },
      {
        id: 'q_xad_6_2',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Movimento das Peças',
        question: 'Qual é a única peça no xadrez com a habilidade de pular por cima de outras peças no tabuleiro?',
        options: ['O Cavalo', 'A Torre', 'O Bispo', 'A Dama'],
        correctIndex: 0,
        explanation: 'O Cavalo salta por cima de qualquer peça amiga ou adversária durante seu movimento em formato de L.',
        difficulty: 'easy',
      },
      {
        id: 'q_xad_6_3',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Montagem do Tabuleiro',
        question: 'Na montagem inicial das peças de xadrez, em qual casa a Dama branca deve ser posicionada?',
        options: ['Em uma casa branca (Dama na sua própria cor)', 'Em uma casa preta', 'No canto do tabuleiro', 'Atrás do Rei'],
        correctIndex: 0,
        explanation: 'A regra clássica estabelece: "Dama na sua própria cor" (Dama branca na casa branca d1, Dama preta na casa preta d8).',
        difficulty: 'easy',
      },
      {
        id: 'q_xad_6_4',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Movimento do Peão',
        question: 'Como o Peão se move e como ele realiza uma captura no xadrez?',
        options: ['Anda para frente reto, mas captura na diagonal para frente', 'Anda na diagonal e captura para trás', 'Anda em L e captura em linha reta', 'Anda para todos os lados e salta peças'],
        correctIndex: 0,
        explanation: 'O Peão anda estritamente para a frente, mas só captura uma casa na diagonal à sua frente.',
        difficulty: 'medium',
      },
      {
        id: 'q_xad_6_5',
        subject: 'xadrez',
        grade: '6_fund',
        topic: 'Contagem do Tabuleiro',
        question: 'Quantas casas no total compõem um tabuleiro oficial de xadrez?',
        options: ['64 casas (8 colunas × 8 fileiras)', '100 casas', '32 casas', '48 casas'],
        correctIndex: 0,
        explanation: 'O tabuleiro de xadrez tem 8 fileiras por 8 colunas, totalizando 64 casas (32 claras e 32 escuras).',
        difficulty: 'easy',
      },
    ],
  },
  // XADREZ: TÁTICAS (GARFO, CRAVADA, ESPETO E ROQUE)
  {
    id: 'xad_7_taticas',
    subject: 'xadrez',
    grade: '7_fund',
    title: 'Táticas no Xadrez: Garfo, Cravada, Espeto e Roque',
    summary:
      'A tática consiste em sequências curtas de jogadas calculadas para ganhar material ou dar xeque-mate. Os três golpes táticos fundamentais são o Garfo (ataque duplo), a Cravada (imobilização) e o Espeto (ataque alinhado). O Roque protege o Rei e ativa a Torre.',
    keyPoints: [
      'Garfo (Double Attack): Uma peça ataca simultaneamente duas ou mais peças inimigas (típico do Cavalo em c7/f7 atacando Rei e Torre).',
      'Cravada (Pin): Uma peça não pode sair da linha de ataque porque exporia uma peça mais valiosa (como o Rei ou a Dama) atrás dela.',
      'Espeto (Skewer): Semelhante à cravada, mas a peça de maior valor está na frente e, ao fugir, expõe a de menor valor atrás.',
      'Roque: O Rei anda 2 casas para o lado e a Torre passa por cima dele. Requisitos: Rei e Torre nunca terem se movido e não haver casas atacadas no caminho.',
    ],
    example:
      'Um Cavalo branco em e5 ataca simultaneamente o Rei preto em g6 e a Dama preta em c6: isso é um Garfo devastador com ganho de material forçado.',
    practiceQuestions: [
      {
        id: 'q_xad_7_1',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Tática do Garfo',
        question: 'No xadrez, o que chamamos de "Garfo" (ataque duplo)?',
        options: ['Quando uma única peça ataca simultaneamente duas ou mais peças adversárias', 'Quando um peão vira dama', 'Quando o rei é afogado sem lances legais', 'Quando o cavalo pula a torre no início'],
        correctIndex: 0,
        explanation: 'O Garfo é o golpe onde uma peça ameaça duas peças inimigas ao mesmo tempo, forçando uma perda material.',
        difficulty: 'easy',
      },
      {
        id: 'q_xad_7_2',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Cravada Absoluta',
        question: 'O que caracteriza uma "Cravada Absoluta" em uma partida de xadrez?',
        options: ['A peça não pode se mover legalmente porque deixaria seu próprio Rei em xeque', 'A peça pode capturar qualquer outra peça', 'O peão não pode avançar por estar bloqueado', 'A dama está trocada pela torre'],
        correctIndex: 0,
        explanation: 'A cravada é absoluta quando a peça que está atrás é o Rei, tornando qualquer movimento da peça cravada uma jogada ilegal.',
        difficulty: 'medium',
      },
      {
        id: 'q_xad_7_3',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Regra do Roque',
        question: 'Qual é o objetivo principal do lance especial chamado "Roque"?',
        options: ['Colocar o Rei em segurança em um canto e colocar a Torre no jogo', 'Capturar a dama adversária imediatamente', 'Promover o peão a rainha na 8ª fileira', 'Dar xeque-mate em um só lance'],
        correctIndex: 0,
        explanation: 'O Roque protege o Rei tirando-o do centro vulnerável e centraliza a Torre para apoiar o ataque.',
        difficulty: 'easy',
      },
      {
        id: 'q_xad_7_4',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Condições do Roque',
        question: 'Em qual situação o jogador está IMPEDIDO pelas regras de realizar o Roque?',
        options: ['Se o Rei já tiver se movido anteriormente na partida', 'Se todos os peões estiverem vivos', 'Se o adversário ainda tiver o cavalo', 'Se a partida tiver menos de 10 lances'],
        correctIndex: 0,
        explanation: 'Se o Rei ou a Torre escolhida já se movimentaram em qualquer momento anterior da partida, o direito ao roque é perdido.',
        difficulty: 'medium',
      },
      {
        id: 'q_xad_7_5',
        subject: 'xadrez',
        grade: '7_fund',
        topic: 'Diferença de Tática: Espeto vs Cravada',
        question: 'No golpe do "Espeto" (skewer), qual peça fica na frente da linha de ataque?',
        options: ['A peça mais valiosa (como o Rei ou Dama), que ao fugir expõe a peça de trás', 'A peça menos valiosa (como o peão)', 'Sempre um peão adversário', 'O cavalo cravado'],
        correctIndex: 0,
        explanation: 'No espeto a peça mais valiosa fica na frente: quando ela é atacada e precisa fugir, a peça que estava atrás dela é capturada.',
        difficulty: 'hard',
      },
    ],
  },
  // INGLÊS: 6º ANO - SIMPLE PRESENT & ROUTINES
  {
    id: 'ing_6_simple_present',
    subject: 'ingles',
    grade: '6_fund',
    title: 'Simple Present, Daily Routines and Pronouns',
    summary:
      'O Simple Present é o tempo verbal em inglês usado para descrever hábitos diários, rotinas, verdades universais e preferências. Na 3ª pessoa do singular (He, She, It), adiciona-se "-s", "-es" ou "-ies" ao verbo na forma afirmativa.',
    keyPoints: [
      'Pronomes Pessoais: I (Eu), You (Você), He (Ele), She (Ela), It (Ele/Ela para coisas/animais), We (Nós), They (Eles/Elas).',
      'Regra da 3ª Pessoa: He/She/It recebe "-s" (ex: I work -> She works; I play -> He plays).',
      'Verbos terminados em -o, -ch, -sh, -ss, -x recebem "-es" (ex: He goes, She watches).',
      'Negativa e Interrogativa: usa-se o auxiliar "do/don\'t" (para I, You, We, They) e "does/doesn\'t" (para He, She, It).',
    ],
    example:
      'Afirmativa: "She speaks English very well."\nNegativa: "She doesn\'t speak French."\nInterrogativa: "Does she live in Brazil?"',
    practiceQuestions: [
      {
        id: 'q_ing_6_1',
        subject: 'ingles',
        grade: '6_fund',
        topic: 'Simple Present - 3rd Person',
        question: 'Complete the sentence correctly: "My sister _______ (watch) TV every evening after school."',
        options: ['watches', 'watch', 'watchs', 'watching'],
        correctIndex: 0,
        explanation: 'Para a 3ª pessoa do singular (My sister = She), verbos terminados em "-ch" recebem "-es": "watches".',
        difficulty: 'easy',
      },
      {
        id: 'q_ing_6_2',
        subject: 'ingles',
        grade: '6_fund',
        topic: 'Auxiliar Do/Does',
        question: 'Which auxiliary verb is used to form a question with "THEY" in Simple Present?',
        options: ['Do (e.g., Do they study?)', 'Does', 'Is', 'Are'],
        correctIndex: 0,
        explanation: 'Com os pronomes I, You, We, They usa-se o auxiliar "Do" para perguntas.',
        difficulty: 'easy',
      },
      {
        id: 'q_ing_6_3',
        subject: 'ingles',
        grade: '6_fund',
        topic: 'Personal Pronouns',
        question: 'Qual pronome pessoal em inglês substitui "Pedro and Maria" em uma frase?',
        options: ['They (Eles/Elas)', 'We (Nós)', 'He (Ele)', 'It'],
        correctIndex: 0,
        explanation: '"Pedro and Maria" é terceira pessoa do plural, correspondendo ao pronome "They".',
        difficulty: 'easy',
      },
      {
        id: 'q_ing_6_4',
        subject: 'ingles',
        grade: '6_fund',
        topic: 'Negative Form in Simple Present',
        question: 'Choose the correct negative sentence: "He _______ play video games on Mondays."',
        options: ["doesn't", "don't", 'no', 'not is'],
        correctIndex: 0,
        explanation: 'Para He, She, It a forma negativa no presente usa "doesn\'t" seguido do verbo na forma base.',
        difficulty: 'medium',
      },
      {
        id: 'q_ing_6_5',
        subject: 'ingles',
        grade: '6_fund',
        topic: 'Daily Routine Vocabulary',
        question: 'What does the daily routine phrase "to wake up" mean in Portuguese?',
        options: ['Acordar / Despertar', 'Tomar café da manhã', 'Ir para a escola', 'Dormir'],
        correctIndex: 0,
        explanation: '"Wake up" significa acordar; "get up" levantar-se da cama.',
        difficulty: 'easy',
      },
    ],
  },
  // INGLÊS: 7º ANO - SIMPLE PAST & IRREGULAR VERBS
  {
    id: 'ing_7_simple_past',
    subject: 'ingles',
    grade: '7_fund',
    title: 'Simple Past: Regular and Irregular Verbs',
    summary:
      'O Simple Past expressa ações concluídas no passado em um tempo determinado. Verbos regulares recebem o sufixo "-ed" (ex: play -> played, study -> studied). Verbos irregulares têm formas próprias no passado (ex: go -> went, see -> saw, buy -> bought).',
    keyPoints: [
      'Verbos Regulares: acrescenta-se "-ed" (ex: work -> worked, love -> loved, study -> studied).',
      'Verbos Irregulares Comuns: go -> went, have -> had, see -> saw, make -> made, eat -> ate.',
      'Forma Negativa e Interrogativa: usa-se o auxiliar "DID / DIDN\'T" e o verbo principal volta para o infinitivo sem "to" (ex: "Did you go?" / "I didn\'t see").',
      'Expressões de Tempo no Passado: yesterday (ontem), last night (ontem à noite), last week (semana passada), two days ago (dois dias atrás).',
    ],
    example:
      'Afirmativa: "We went to the beach yesterday."\nNegativa: "We didn\'t go to the mall."\nInterrogativa: "Did you travel last weekend?"',
    practiceQuestions: [
      {
        id: 'q_ing_7_1',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Irregular Verbs',
        question: 'What is the past tense form of the irregular verb "TO GO"?',
        options: ['Went', 'Goed', 'Gone', 'Goes'],
        correctIndex: 0,
        explanation: 'O passado simples de "go" é "went" (ex: "She went to school yesterday").',
        difficulty: 'easy',
      },
      {
        id: 'q_ing_7_2',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Negative Form in Past',
        question: 'Which sentence is grammatically correct in the Simple Past?',
        options: ["I didn't see the movie yesterday.", "I didn't saw the movie yesterday.", 'I not saw the movie.', 'I no see the movie.'],
        correctIndex: 0,
        explanation: 'Após o auxiliar negativo "didn\'t", o verbo principal deve ficar na sua forma base ("see", e não "saw").',
        difficulty: 'medium',
      },
      {
        id: 'q_ing_7_3',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Regular Verb Spelling',
        question: 'What is the past simple form of the regular verb "TO STUDY"?',
        options: ['Studied', 'Studyed', 'Studyied', 'Studying'],
        correctIndex: 0,
        explanation: 'Verbos terminados em consoante + y trocam o "y" por "i" antes de adicionar "-ed": study -> studied.',
        difficulty: 'easy',
      },
      {
        id: 'q_ing_7_4',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Irregular Verb - Buy',
        question: 'Qual é o passado simples do verbo "TO BUY" (comprar)?',
        options: ['Bought', 'Buyed', 'Brought', 'Bouted'],
        correctIndex: 0,
        explanation: 'O passado de "buy" é "bought". ("Brought" é o passado de "bring" = trazer).',
        difficulty: 'medium',
      },
      {
        id: 'q_ing_7_5',
        subject: 'ingles',
        grade: '7_fund',
        topic: 'Time Expressions in Past',
        question: 'O que significa a expressão temporal "TWO DAYS AGO" frequentemente usada com o Simple Past?',
        options: ['Dois dias atrás (há dois dias)', 'Em dois dias (futuro)', 'Durante dois dias', 'Depois de dois dias'],
        correctIndex: 0,
        explanation: '"Ago" posposto indica tempo decorrido no passado: "two days ago" = há dois dias / dois dias atrás.',
        difficulty: 'easy',
      },
    ],
  },
];

// Export SAMPLE_LESSONS with all practice question options scrambled so correct answers are random
export const SAMPLE_LESSONS: TopicLesson[] = RAW_SAMPLE_LESSONS.map((lesson) => ({
  ...lesson,
  practiceQuestions: shuffleQuestionsList(lesson.practiceQuestions || []),
}));

// Curated questions categorized by grade to serve journey, local pass-and-play and multiplayer
const RAW_CURRICULUM_QUESTIONS_POOL: Record<GradeLevel, Question[]> = {
  '1_fund': [
    {
      id: 'q_1f_1',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem e Adição',
      question: 'Se você tem 3 maçãs e ganha mais 2 maçãs, com quantas maçãs você fica?',
      options: ['5 maçãs', '4 maçãs', '6 maçãs', '3 maçãs'],
      correctIndex: 0,
      explanation: '3 + 2 = 5 maçãs no total!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_2',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem até 10',
      question: 'Quantos dedos temos juntando as duas mãos?',
      options: ['10 dedos', '5 dedos', '8 dedos', '12 dedos'],
      correctIndex: 0,
      explanation: 'Cada mão tem 5 dedos. 5 + 5 = 10 dedos!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_3',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição Simples',
      question: 'Quanto é 4 + 1?',
      options: ['5', '3', '6', '4'],
      correctIndex: 0,
      explanation: 'Contando 1 depois do 4, temos o número 5.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_4',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Formas Geométricas',
      question: 'Qual forma geométrica parece com uma roda de bicicleta?',
      options: ['Círculo', 'Quadrado', 'Triângulo', 'Retângulo'],
      correctIndex: 0,
      explanation: 'A roda é redonda como um círculo!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_5',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Sequência Numérica',
      question: 'Qual número vem logo depois do número 6?',
      options: ['7', '5', '8', '9'],
      correctIndex: 0,
      explanation: 'Na ordem numérica: 1, 2, 3, 4, 5, 6, 7...',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_8',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Subtração básica',
      question: 'Se havia 5 patinhos na lagoa e 2 foram embora, quantos ficaram?',
      options: ['3 patinhos', '2 patinhos', '4 patinhos', '1 patinho'],
      correctIndex: 0,
      explanation: '5 - 2 = 3 patinhos restantes.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_7',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Comparação de Quantidades',
      question: 'Qual número é MAIOR: 8 ou 3?',
      options: ['8', '3', 'São iguais', 'Nenhum'],
      correctIndex: 0,
      explanation: '8 representa uma quantidade maior do que 3.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_8',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição Simples',
      question: 'Lucas tem 2 carrinhos azuis e 2 carrinhos vermelhos. Quantos carrinhos ele tem ao todo?',
      options: ['4 carrinhos', '3 carrinhos', '5 carrinhos', '2 carrinhos'],
      correctIndex: 0,
      explanation: '2 + 2 = 4 carrinhos.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_9',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Formas Geométricas',
      question: 'Qual forma geométrica tem 3 pontas (três lados)?',
      options: ['Triângulo', 'Círculo', 'Quadrado', 'Retângulo'],
      correctIndex: 0,
      explanation: 'O triângulo tem 3 lados e 3 pontas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_10',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Subtração Simples',
      question: 'Você tinha 4 balas e deu 1 para seu amigo. Com quantas balas você ficou?',
      options: ['3 balas', '2 balas', '5 balas', '1 bala'],
      correctIndex: 0,
      explanation: '4 - 1 = 3 balas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_11',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição com Zero',
      question: 'Quanto é 6 + 0?',
      options: ['6', '0', '7', '60'],
      correctIndex: 0,
      explanation: 'Somar zero não altera a quantidade: 6 + 0 = 6.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_12',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem de Objetos',
      question: 'Quantas patas tem um cachorrinho saudável?',
      options: ['4 patas', '2 patas', '6 patas', '3 patas'],
      correctIndex: 0,
      explanation: 'O cachorro é um animal quadrúpede e tem 4 patas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_11',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Comparação de Tamanho',
      question: 'Qual destes objetos é geralmente MAIOR que um lápis?',
      options: ['Um carro', 'Uma borracha', 'Um apontador', 'Um clipe'],
      correctIndex: 0,
      explanation: 'Um carro é muito maior do que um lápis!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_2',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Alfabeto',
      question: 'Qual é a primeira letra da palavra BOLA?',
      options: ['B', 'O', 'L', 'A'],
      correctIndex: 0,
      explanation: 'A palavra BOLA começa com a letra B!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_6',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Vogais',
      question: 'Quais são as cinco vogais do nosso alfabeto?',
      options: ['A, E, I, O, U', 'B, C, D, F, G', '1, 2, 3, 4, 5', 'P, Q, R, S, T'],
      correctIndex: 0,
      explanation: 'As vogais são A, E, I, O e U.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_9',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Identificação de Letras',
      question: 'Qual destas palavras começa com a letra M?',
      options: ['Maçã', 'Pato', 'Bola', 'Sapo'],
      correctIndex: 0,
      explanation: 'A palavra Maçã começa com a letra M!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_3',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Animais',
      question: 'Qual destes animais sabe voar?',
      options: ['Passarinho', 'Cachorro', 'Gato', 'Tartaruga'],
      correctIndex: 0,
      explanation: 'Os passarinhos têm asas e sabem voar.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_7',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Plantas',
      question: 'O que a plantinha precisa para crescer saudável?',
      options: ['Água e luz do Sol', 'Refrigerante e doce', 'Ficar no escuro', 'Brinquedos'],
      correctIndex: 0,
      explanation: 'As plantas precisam de água, terra boa e luz solar.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_12',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Higiene e Saúde',
      question: 'O que devemos fazer sempre antes de comer e depois de brincar?',
      options: ['Lavar as mãos com água e sabão', 'Assistir televisão', 'Dormir', 'Correr descalço'],
      correctIndex: 0,
      explanation: 'Lavar as mãos elimina bactérias e nos mantém saudáveis.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_10',
      subject: 'historia',
      grade: '1_fund',
      topic: 'Família e Convivência',
      question: 'O que devemos fazer para ter uma boa convivência com os colegas na escola?',
      options: ['Respeitar e compartilhar', 'Gritar e brigar', 'Não falar com ninguém', 'Correr empurrando'],
      correctIndex: 0,
      explanation: 'O respeito e o carinho tornam a convivência harmoniosa.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_5',
      subject: 'geografia',
      grade: '1_fund',
      topic: 'Dia e Noite',
      question: 'O que ilumina o nosso céu durante o dia?',
      options: ['O Sol', 'A Lua', 'As estrelas', 'As nuvens'],
      correctIndex: 0,
      explanation: 'O Sol é a grande estrela que ilumina nosso dia.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_1',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Greetings',
      question: 'Como dizemos "Olá" em inglês para a professora ou amigos?',
      options: ['Hello (ou Hi)', 'Goodbye', 'Night', 'Thanks'],
      correctIndex: 0,
      explanation: '"Hello" e "Hi" significam "Olá" em inglês!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_2',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Colors',
      question: 'Qual é a cor "RED" em português?',
      options: ['Vermelho', 'Azul', 'Amarelo', 'Verde'],
      correctIndex: 0,
      explanation: '"Red" é a cor vermelha, como a maçã!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_3',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Animals',
      question: 'Como chamamos o "Cachorro" em inglês?',
      options: ['Dog', 'Cat', 'Fish', 'Bird'],
      correctIndex: 0,
      explanation: '"Dog" significa cachorro em inglês!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_4',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Numbers',
      question: 'Quantos dedos você tem em uma mão em inglês? (5 dedos)',
      options: ['Five (5)', 'Two (2)', 'Ten (10)', 'One (1)'],
      correctIndex: 0,
      explanation: 'Número 5 em inglês é "Five"!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_5',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Colors',
      question: 'Qual cor representa a palavra "BLUE"?',
      options: ['Azul', 'Rosa', 'Preto', 'Branco'],
      correctIndex: 0,
      explanation: '"Blue" é a cor azul, como o céu ensolarado!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_6',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Greetings',
      question: 'Quando vamos embora da escola, dizemos:',
      options: ['Goodbye! (Tchau)', 'Hello!', 'Please', 'Good morning'],
      correctIndex: 0,
      explanation: '"Goodbye" ou "Bye" usamos para nos despedir.',
      difficulty: 'easy',
    },
  ],

  '2_fund': [
    {
      id: 'q_2f_1',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Dezenas',
      question: 'Quantas unidades formam 1 dezena?',
      options: ['10 unidades', '5 unidades', '20 unidades', '100 unidades'],
      correctIndex: 0,
      explanation: '1 dezena é igual a 10 unidades.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_2',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Sílabas',
      question: 'Quantas sílabas tem a palavra CA-CHOR-RO?',
      options: ['3 sílabas', '2 sílabas', '4 sílabas', '1 sílaba'],
      correctIndex: 0,
      explanation: 'A palavra CA-CHOR-RO tem 3 sílabas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_3',
      subject: 'ciencias',
      grade: '2_fund',
      topic: 'Sentidos',
      question: 'Qual órgão usamos para sentir o gosto dos alimentos?',
      options: ['A língua (paladar)', 'Os olhos (visão)', 'Os ouvidos (audição)', 'O nariz (olfato)'],
      correctIndex: 0,
      explanation: 'O paladar é percebido pelas papilas gustativas na língua.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_4',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Dobro',
      question: 'Qual é o dobro de 6?',
      options: ['12', '8', '14', '10'],
      correctIndex: 0,
      explanation: 'O dobro de 6 é 6 x 2 = 12.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_5',
      subject: 'geografia',
      grade: '2_fund',
      topic: 'Meios de Transporte',
      question: 'Qual é um meio de transporte aquático?',
      options: ['Navio', 'Avião', 'Bicicleta', 'Metrô'],
      correctIndex: 0,
      explanation: 'Navios navegam sobre as águas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_6',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Rimas',
      question: 'Qual palavra rima com CORAÇÃO?',
      options: ['Balão', 'Janela', 'Sapato', 'Casa'],
      correctIndex: 0,
      explanation: 'Coração e Balão terminam com o mesmo som "-ão".',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_7',
      subject: 'ciencias',
      grade: '2_fund',
      topic: 'Estados da Água',
      question: 'Quando a água congela e vira gelo, ela está em qual estado?',
      options: ['Sólido', 'Líquido', 'Gasoso', 'Vapor'],
      correctIndex: 0,
      explanation: 'O gelo é a água em estado sólido.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_8',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Antônimos',
      question: 'Qual é o contrário (antônimo) da palavra ALTO?',
      options: ['Baixo', 'Grande', 'Forte', 'Largo'],
      correctIndex: 0,
      explanation: 'O contrário de alto é baixo.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_9',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Horas',
      question: 'Quantas horas tem um dia completo?',
      options: ['24 horas', '12 horas', '48 horas', '60 horas'],
      correctIndex: 0,
      explanation: 'Um dia completo tem 24 horas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_10',
      subject: 'historia',
      grade: '2_fund',
      topic: 'Passagem do Tempo',
      question: 'Qual instrumento usamos para medir a passagem dos dias, semanas e meses?',
      options: ['Calendário', 'Termômetro', 'Régua', 'Balança'],
      correctIndex: 0,
      explanation: 'O calendário organiza os dias, meses e anos.',
      difficulty: 'easy',
    },
  ],

  '3_fund': [
    {
      id: 'q_3f_1',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Multiplicação',
      question: 'Quanto é 4 vezes 5?',
      options: ['20', '15', '25', '18'],
      correctIndex: 0,
      explanation: '4 x 5 = 20.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_2',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Substantivos',
      question: 'Qual das palavras é um substantivo próprio (deve ser escrito com letra maiúscula)?',
      options: ['Brasil', 'cidade', 'menino', 'cadeira'],
      correctIndex: 0,
      explanation: 'Brasil é o nome próprio de um país.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_3',
      subject: 'ciencias',
      grade: '3_fund',
      topic: 'Luz e Sombra',
      question: 'A sombra de um objeto é formada quando:',
      options: ['O objeto bloqueia a passagem da luz', 'A luz atravessa totalmente o objeto', 'Está completamente escuro', 'O objeto esquenta'],
      correctIndex: 0,
      explanation: 'Objetos opacos barram a luz, projetando a sombra.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_4',
      subject: 'geografia',
      grade: '3_fund',
      topic: 'Paisagem Natural e Cultural',
      question: 'Qual elemento é típico de uma paisagem cultural (modificada pelo ser humano)?',
      options: ['Um prédio de apartamentos', 'Uma floresta nativa', 'Uma cachoeira', 'Uma montanha'],
      correctIndex: 0,
      explanation: 'Prédios são construções humanas, compondo a paisagem cultural.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_5',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Centena',
      question: 'Quantas dezenas formam 1 centena (100)?',
      options: ['10 dezenas', '5 dezenas', '100 dezenas', '20 dezenas'],
      correctIndex: 0,
      explanation: '10 dezenas x 10 = 100.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_6',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Pontuação',
      question: 'Qual sinal de pontuação usamos no final de uma pergunta?',
      options: ['Ponto de interrogação (?)', 'Ponto final (.)', 'Ponto de exclamação (!)', 'Vírgula (,)'],
      correctIndex: 0,
      explanation: 'O ponto de interrogação (?) finaliza perguntas diretas.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_7',
      subject: 'ciencias',
      grade: '3_fund',
      topic: 'Ciclo da Água',
      question: 'Como se chama o processo em que a água líquida se transforma em vapor pelo calor do Sol?',
      options: ['Evaporação', 'Condensação', 'Precipitação', 'Solidificação'],
      correctIndex: 0,
      explanation: 'A evaporação transforma água líquida em vapor de água.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_8',
      subject: 'historia',
      grade: '3_fund',
      topic: 'Comunidades Tradicionais',
      question: 'Quem foram os primeiros habitantes do território que hoje chamamos de Brasil?',
      options: ['Os povos indígenas', 'Os imigrantes europeus', 'Os navegadores asiáticos', 'Os astronautas'],
      correctIndex: 0,
      explanation: 'Diversos povos indígenas já habitavam o Brasil milhares de anos antes da chegada dos portugueses.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_9',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Sílaba Tônica',
      question: 'Na palavra "MÁGICA", qual é a sílaba tônica (mais forte)?',
      options: ['MÁ', 'GI', 'CA', 'GICA'],
      correctIndex: 0,
      explanation: 'A sílaba MÁ é a mais forte e recebe acento agudo.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_10',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Divisão Simples',
      question: 'Se dividirmos 18 balas igualmente entre 3 amigos, quantas balas cada um ganha?',
      options: ['6 balas', '5 balas', '9 balas', '4 balas'],
      correctIndex: 0,
      explanation: '18 ÷ 3 = 6 balas para cada.',
      difficulty: 'easy',
    },
  ],

  '4_fund': [
    {
      id: 'q_4f_1',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Geometria e Formas',
      question: 'Quantos lados tem um triângulo e um retângulo respectivamente?',
      options: ['3 e 4', '4 e 3', '3 e 5', '4 e 4'],
      correctIndex: 0,
      explanation: 'O triângulo possui 3 lados e o retângulo 4 lados.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_2',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Multiplicação por 2 algarismos',
      question: 'Quanto é 25 multiplicado por 4?',
      options: ['100', '75', '125', '90'],
      correctIndex: 0,
      explanation: '25 x 4 = 100.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_3',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Frações Intuitivas',
      question: 'Se uma barra de chocolate tem 8 pedaços e você come a metade (1/2), quantos pedaços você comeu?',
      options: ['4 pedaços', '2 pedaços', '6 pedaços', '8 pedaços'],
      correctIndex: 0,
      explanation: 'A metade de 8 é 8 ÷ 2 = 4 pedaços.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_4',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Perímetro',
      question: 'Um quadrado tem lados de 5 cm cada. Qual é o perímetro desse quadrado?',
      options: ['20 cm', '25 cm', '15 cm', '10 cm'],
      correctIndex: 0,
      explanation: 'O perímetro é a soma dos 4 lados: 5 + 5 + 5 + 5 = 20 cm.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_5',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Sistema de Numeração Decimal',
      question: 'No número 3.482, qual algarismo ocupa a ordem das centenas?',
      options: ['4 (quatrocentos)', '3 (três mil)', '8 (oitenta)', '2 (duas unidades)'],
      correctIndex: 0,
      explanation: 'O algarismo 4 representa 4 centenas (400).',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_2',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Cadeia Alimentar',
      question: 'Em uma cadeia alimentar, as plantas verdes que realizam fotossíntese são chamadas de:',
      options: ['Produtores', 'Consumidores primários', 'Decompositores', 'Predadores de topo'],
      correctIndex: 0,
      explanation: 'As plantas produzem seu próprio alimento por fotossíntese a partir da luz solar.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_2',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Misturas e Transformações',
      question: 'Quando misturamos água e sal e o sal se dissolve completamente, temos uma mistura:',
      options: ['Homogênea (uma única fase visível)', 'Heterogênea', 'Sólida', 'Gasosa'],
      correctIndex: 0,
      explanation: 'Misturas homogêneas apresentam aspecto uniforme com apenas uma fase visível.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_3',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Microrganismos e Fungos',
      question: 'Qual destes seres vivos atua como decompositor essencial na reciclagem de matéria orgânica na natureza?',
      options: ['Fungos e bactérias', 'Leões e tigres', 'Árvores e grama', 'Gaviões e corujas'],
      correctIndex: 0,
      explanation: 'Fungos e bactérias decompõem restos de folhas e seres mortos, nutrindo o solo.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_4',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Pontos Cardeais e Bússola',
      question: 'Qual instrumento com agulha magnética aponta sempre na direção norte para navegação?',
      options: ['Bússola', 'Termômetro', 'Telescópio', 'Barômetro'],
      correctIndex: 0,
      explanation: 'A bússola possui agulha imantada que se alinha com o campo magnético da Terra.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_3',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Adjetivos',
      question: 'Na frase "A menina inteligente resolveu o problema rápido", qual palavra é um adjetivo?',
      options: ['Inteligente', 'Menina', 'Problema', 'Resolveu'],
      correctIndex: 0,
      explanation: '"Inteligente" caracteriza e qualifica o substantivo "menina".',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_2',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Tempos Verbais',
      question: 'Em "Ontem os alunos brincaram no pátio", em qual tempo verbal está o verbo?',
      options: ['Passado (Pretérito)', 'Presente', 'Futuro', 'Imperativo'],
      correctIndex: 0,
      explanation: '"Brincaram" indica uma ação que já aconteceu no passado.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_3',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Pronomes Pessoais',
      question: 'Qual pronome substitui corretamente o termo destacado em: "Lucas e Pedro foram ao parque"?',
      options: ['Eles', 'Nós', 'Vós', 'Ele'],
      correctIndex: 0,
      explanation: '"Lucas e Pedro" é 3ª pessoa do plural, correspondente ao pronome "Eles".',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_4',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Acentuação',
      question: 'Qual das palavras a seguir é uma oxítona (última sílaba mais forte) acentuada?',
      options: ['Café', 'Árvore', 'Lápis', 'Mesa'],
      correctIndex: 0,
      explanation: 'Ca-fé tem a última sílaba forte e terminada em E, recebendo acento.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_4',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Grandes Navegações e Brasil',
      question: 'Em qual ano os navios portugueses comandados por Pedro Álvares Cabral chegaram ao Brasil?',
      options: ['1500', '1822', '1889', '1492'],
      correctIndex: 0,
      explanation: 'A frota de Cabral aportou em Porto Seguro em 22 de abril de 1500.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_his_2',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Pau-Brasil e Primeiros Ciclos',
      question: 'Qual foi a primeira riqueza natural explorada pelos portugueses no litoral brasileiro?',
      options: ['Pau-Brasil', 'Café', 'Ouro', 'Soja'],
      correctIndex: 0,
      explanation: 'O pau-brasil era extraído pela madeira avermelhada usada para tingir tecidos na Europa.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_his_3',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Capitanias Hereditárias',
      question: 'A divisão inicial do território brasileiro em 15 grandes faixas de terra doadas a nobres portugueses chamava-se:',
      options: ['Capitanias Hereditárias', 'República Federativa', 'Governo Geral', 'Tratado de Tordesilhas'],
      correctIndex: 0,
      explanation: 'As Capitanias Hereditárias foram criadas pelo rei D. João III em 1534.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_5',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Regiões do Brasil',
      question: 'O Brasil é dividido oficialmente em quantas grandes regiões pelo IBGE?',
      options: ['5 regiões (Norte, Nordeste, Centro-Oeste, Sudeste e Sul)', '3 regiões', '7 regiões', '4 regiões'],
      correctIndex: 0,
      explanation: 'São 5 macro-regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_geo_2',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Capital do Brasil',
      question: 'Qual é a capital federal do Brasil, localizada no Distrito Federal?',
      options: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Salvador'],
      correctIndex: 0,
      explanation: 'Brasília é a capital federal do país, inaugurada em 1960.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_geo_3',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Rosa dos Ventos',
      question: 'Quais são os quatro pontos cardeais principais da Rosa dos Ventos?',
      options: ['Norte, Sul, Leste e Oeste', 'Cima, Baixo, Direita e Esquerda', 'Primavera, Verão, Outono e Inverno', 'Sol, Lua, Terra e Mar'],
      correctIndex: 0,
      explanation: 'Os pontos cardeais fundamentais para orientação geográfica são Norte, Sul, Leste e Oeste.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_1',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Pronomes e Verbo To Be',
      question: 'Como dizemos "Eu sou um estudante" em inglês?',
      options: ['I am a student', 'He is a student', 'They are students', 'We are student'],
      correctIndex: 0,
      explanation: '"I am" corresponde a "Eu sou / Eu estou" no presente.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_2',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Clima e Tempo',
      question: 'Qual palavra em inglês usamos quando o dia está ensolarado com muito sol?',
      options: ['Sunny', 'Rainy', 'Cloudy', 'Snowy'],
      correctIndex: 0,
      explanation: '"Sunny" significa ensolarado (derivado de Sun = Sol).',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_3',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Horas',
      question: 'O que significa a expressão "It is ten o\'clock"?',
      options: ['São dez horas em ponto', 'São duas horas', 'São cinco horas', 'São dez minutos'],
      correctIndex: 0,
      explanation: '"Ten o\'clock" significa dez horas em ponto.',
      difficulty: 'easy',
    },
  ],

  '5_fund': [
    {
      id: 'q_5f_1',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Frações Decimais',
      question: 'O número decimal 0,75 corresponde a qual fração simplificada?',
      options: ['3/4', '1/2', '1/4', '4/5'],
      correctIndex: 0,
      explanation: '0,75 = 75/100, que simplificado dividindo por 25 dá 3/4.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_2',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Porcentagem Básica',
      question: 'Quanto é 50% de R$ 120,00?',
      options: ['R$ 60,00', 'R$ 50,00', 'R$ 24,00', 'R$ 70,00'],
      correctIndex: 0,
      explanation: '50% representa a metade exata do valor: 120 ÷ 2 = 60.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_3',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Área de Retângulo',
      question: 'Uma sala retangular mede 6 metros de comprimento por 4 metros de largura. Qual é a área dessa sala?',
      options: ['24 m²', '20 m²', '10 m²', '36 m²'],
      correctIndex: 0,
      explanation: 'A área do retângulo é calculada por base x altura: 6 x 4 = 24 m².',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_4',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'As 4 Operações',
      question: 'Se uma fábrica produz 350 brinquedos por dia, quantos brinquedos produzirá em 10 dias?',
      options: ['3.500 brinquedos', '35.000 brinquedos', '350 brinquedos', '1.350 brinquedos'],
      correctIndex: 0,
      explanation: 'Multiplicando por 10, basta acrescentar um zero à direita: 350 x 10 = 3.500.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_2',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Sistema Respiratório',
      question: 'Qual é o gás que absorvemos na inspiração e é essencial para a respiração de todas as células?',
      options: ['Oxigênio (O2)', 'Gás Carbônico (CO2)', 'Metano', 'Hélio'],
      correctIndex: 0,
      explanation: 'Nosso corpo necessita do oxigênio para a produção de energia nas células.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_cie_2',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Sistema Circulatório e Coração',
      question: 'Qual órgão musculoso funciona como uma bomba impulsionando o sangue para todo o corpo humano?',
      options: ['O coração', 'O estômago', 'O pulmão', 'O fígado'],
      correctIndex: 0,
      explanation: 'O coração bombeia o sangue oxigenado através das artérias e veias.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_cie_3',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Água e Sustentabilidade',
      question: 'Qual é a atitude correta para economizar água tratada em casa?',
      options: ['Fechar a torneira enquanto escova os dentes', 'Lavar calçadas com mangueira aberta', 'Tomar banhos de 30 minutos', 'Deixar torneiras pingando'],
      correctIndex: 0,
      explanation: 'Fechar a torneira enquanto escovamos os dentes evita o desperdício de litros de água tratada.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_3',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Cidadania e Constituição',
      question: 'O que é a Constituição de um país?',
      options: ['A lei máxima fundamental que define os direitos e deveres dos cidadãos', 'Um livro de contos históricos', 'O mapa das capitais', 'O hino nacional'],
      correctIndex: 0,
      explanation: 'A Constituição é a Carta Magna que rege as leis e a cidadania do país.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_his_2',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Direitos Humanos e Criança',
      question: 'No Brasil, o documento legal que protege integralmente os direitos das crianças e adolescentes é:',
      options: ['O Estatuto da Criança e do Adolescente (ECA)', 'O Código de Trânsito', 'A Carta de Pero Vaz de Caminha', 'O Tratado de Madri'],
      correctIndex: 0,
      explanation: 'O ECA (Lei nº 8.069/1990) garante direitos à educação, saúde, proteção e convivência familiar.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_his_3',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Patrimônio Histórico',
      question: 'Cidades históricas como Ouro Preto (MG) e Olinda (PE) são consideradas patrimônios culturais porque:',
      options: ['Preservam a memória, arquitetura e história do povo brasileiro', 'Têm os maiores shoppings centers', 'São capitais atuais do Brasil', 'Foram construídas ontem'],
      correctIndex: 0,
      explanation: 'Patrimônios históricos guardam a identidade cultural e a história de gerações passadas.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_4',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Tempos Verbais',
      question: 'Na frase "Nós estudaremos para a prova amanhã", o verbo está em qual tempo?',
      options: ['Futuro', 'Passado (Pretérito)', 'Presente', 'Imperativo'],
      correctIndex: 0,
      explanation: '"Estudaremos" indica uma ação que ainda irá acontecer no futuro.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_por_2',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Gêneros Textuais',
      question: 'Um texto narrativo curto que traz animais como personagens e ensina uma moral final chama-se:',
      options: ['Fábula', 'Notícia jornalística', 'Receita culinária', 'Bula de remédio'],
      correctIndex: 0,
      explanation: 'Fábulas (como a da Lebre e a Tartaruga) usam animais personificados para transmitir lições morais.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_por_3',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Sujeito e Predicado',
      question: 'Na oração "Os atletas brasileiros conquistaram a medalha de ouro", qual é o predicado?',
      options: ['Conquistaram a medalha de ouro', 'Os atletas brasileiros', 'A medalha de ouro', 'Os atletas'],
      correctIndex: 0,
      explanation: 'O predicado é tudo aquilo que se declara a respeito do sujeito (a partir do verbo).',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_5',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Biomas Brasileiros',
      question: 'Qual é a maior floresta tropical do mundo localizada em grande parte no Norte do Brasil?',
      options: ['Floresta Amazônica', 'Mata Atlântica', 'Cerrado', 'Caatinga'],
      correctIndex: 0,
      explanation: 'A Amazônia é a maior floresta tropical úmida do planeta e abriga a maior bacia hidrográfica.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_geo_2',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Relevo Brasileiro',
      question: 'As formas de relevo no Brasil são predominantemente formadas por:',
      options: ['Planaltos, planícies e depressões', 'Altas cordilheiras com vulcões ativos', 'Geleiras e fiordes', 'Abismos submarinos visíveis'],
      correctIndex: 0,
      explanation: 'O relevo brasileiro é antigo e erodido, composto de planaltos, depressões e planícies.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_geo_3',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Zona Rural e Urbana',
      question: 'A produção agropecuária (plantações e criação de gado) ocorre principalmente na:',
      options: ['Zona Rural (campo)', 'Zona Urbana (centro da metrópole)', 'Área industrial portuária', 'Zona comercial financeira'],
      correctIndex: 0,
      explanation: 'O campo ou zona rural é o espaço onde se concentram as atividades do setor primário da economia.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_1',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Rotina e Present Simple',
      question: 'Como dizemos "Eu acordo às 7 horas" em inglês?',
      options: ['I wake up at 7 o\'clock', 'I sleeping at 7 o\'clock', 'I dinner at 7', 'I study yesterday at 7'],
      correctIndex: 0,
      explanation: '"Wake up" significa acordar na rotina diária.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_2',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Wh- Questions',
      question: 'Qual palavra interrogativa usamos para perguntar ONDE (lugar) em inglês?',
      options: ['Where', 'When', 'Who', 'Why'],
      correctIndex: 0,
      explanation: '"Where" significa onde/aonde, "When" é quando, "Who" é quem e "Why" é por que.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_3',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Preposições de Lugar',
      question: 'Se o livro está SOBRE (em cima da) mesa, dizemos:',
      options: ['The book is ON the table', 'The book is UNDER the table', 'The book is IN the table', 'The book is BEHIND the table'],
      correctIndex: 0,
      explanation: '"On" indica sobre/em cima de uma superfície.',
      difficulty: 'easy',
    },
  ],

  '6_fund': [
    ...SAMPLE_LESSONS[0].practiceQuestions,
    {
      id: 'q_6f_6',
      subject: 'historia',
      grade: '6_fund',
      topic: 'Mesopotâmia e Egito',
      question: 'Qual rio foi fundamental para o desenvolvimento da agricultura no Egito Antigo?',
      options: ['Rio Nilo', 'Rio Amazonas', 'Rio Tigre', 'Rio Danúbio'],
      correctIndex: 0,
      explanation: 'O Rio Nilo fertilizava as terras egípcias através de suas cheias periódicas.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_his_2',
      subject: 'historia',
      grade: '6_fund',
      topic: 'Grécia e Roma Antiga',
      question: 'A pólis grega famosa por sua disciplina militar rígida e guerreiros implacáveis era:',
      options: ['Esparta', 'Atenas', 'Corinto', 'Tebas'],
      correctIndex: 0,
      explanation: 'Esparta educava seus cidadãos desde os 7 anos na arte da guerra (agogê).',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_7',
      subject: 'ciencias',
      grade: '6_fund',
      topic: 'Célula e Seres Vivos',
      question: 'A estrutura que abriga o material genético (DNA) na célula eucarionte é:',
      options: ['O núcleo', 'A membrana plasmática', 'A parede celular', 'O citoplasma'],
      correctIndex: 0,
      explanation: 'Nas células eucariontes, o DNA fica protegido dentro da membrana nuclear.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_cie_2',
      subject: 'ciencias',
      grade: '6_fund',
      topic: 'Atmosfera e Ar',
      question: 'Qual é o gás mais abundante na atmosfera terrestre que respiramos?',
      options: ['Nitrogênio (N2 - cerca de 78%)', 'Oxigênio (O2)', 'Gás Carbônico (CO2)', 'Hélio (He)'],
      correctIndex: 0,
      explanation: 'O nitrogênio compõe aproximadamente 78% do volume do ar atmosférico, seguido pelo oxigênio (21%).',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_8',
      subject: 'geografia',
      grade: '6_fund',
      topic: 'Camadas da Terra',
      question: 'A camada mais externa e sólida da Terra onde vivemos é chamada de:',
      options: ['Crosta terrestre (Litosfera)', 'Manto superior', 'Núcleo externo', 'Núcleo interno'],
      correctIndex: 0,
      explanation: 'A crosta terrestre é a camada superficial rochosa do planeta.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_geo_2',
      subject: 'geografia',
      grade: '6_fund',
      topic: 'Cartografia e Mapas',
      question: 'A linha imaginária que divide a Terra em Hemisfério Norte e Hemisfério Sul é a:',
      options: ['Linha do Equador', 'Meridiano de Greenwich', 'Trópico de Câncer', 'Círculo Polar Ártico'],
      correctIndex: 0,
      explanation: 'A Linha do Equador (latitude 0º) divide o globo entre os hemisférios Norte e Sul.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_9',
      subject: 'matematica',
      grade: '6_fund',
      topic: 'MDC e MMC',
      question: 'Qual é o Mínimo Múltiplo Comum (MMC) entre 4 e 6?',
      options: ['12', '24', '10', '2'],
      correctIndex: 0,
      explanation: 'Os múltiplos de 4 são 4, 8, 12, 16... e de 6 são 6, 12, 18... O menor comum é 12.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_mat_2',
      subject: 'matematica',
      grade: '6_fund',
      topic: 'Potenciação',
      question: 'Quanto vale 3 elevado ao cubo (3³)?',
      options: ['27', '9', '6', '18'],
      correctIndex: 0,
      explanation: '3³ = 3 x 3 x 3 = 27.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_10',
      subject: 'portugues',
      grade: '6_fund',
      topic: 'Substantivo Coletivo',
      question: 'Qual é o substantivo coletivo para um conjunto de ilhas?',
      options: ['Arquipélago', 'Constelação', 'Cardume', 'Alcateia'],
      correctIndex: 0,
      explanation: 'Arquipélago é o coletivo que designa um grupo de ilhas.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_por_2',
      subject: 'portugues',
      grade: '6_fund',
      topic: 'Classes Gramaticais',
      question: 'Na frase "Os alunos inteligentes estudaram bastante", a palavra "bastante" funciona como:',
      options: ['Advérbio de intensidade', 'Substantivo', 'Verbo', 'Adjetivo'],
      correctIndex: 0,
      explanation: '"Bastante" intensifica a ação do verbo estudar, atuando como advérbio de intensidade.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_ing_1',
      subject: 'ingles',
      grade: '6_fund',
      topic: 'Present Continuous',
      question: 'Qual frase está correta no Present Continuous (ação acontecendo agora)?',
      options: ['They are playing soccer', 'They plays soccer', 'They play soccer yesterday', 'They is playing soccer'],
      correctIndex: 0,
      explanation: 'Com "They", usamos "are" + verbo terminado em "-ing": "They are playing".',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_ing_2',
      subject: 'ingles',
      grade: '6_fund',
      topic: 'Possessive Adjectives',
      question: 'Complete: "This is Maria. _____ car is blue."',
      options: ['Her', 'His', 'My', 'Their'],
      correctIndex: 0,
      explanation: '"Her" é o adjetivo possessivo feminino singular (dela).',
      difficulty: 'easy',
    },
  ],

  '7_fund': [
    {
      id: 'q_7f_1',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Números Negativos',
      question: 'Qual é o resultado de (-8) + (+15)?',
      options: ['+7', '-7', '+23', '-23'],
      correctIndex: 0,
      explanation: 'Ao somar -8 com +15, subtraímos os valores e mantemos o sinal do maior módulo: +7.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_mat_2',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Regra de Três Simples',
      question: 'Se 3 cadernos custam R$ 15,00, quanto custarão 6 cadernos?',
      options: ['R$ 30,00', 'R$ 25,00', 'R$ 45,00', 'R$ 20,00'],
      correctIndex: 0,
      explanation: 'Dobrando a quantidade de cadernos, o preço também dobra: 15 x 2 = R$ 30,00.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_5',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Equação de 1º Grau',
      question: 'Resolva a equação: 2x + 4 = 14. Qual é o valor de x?',
      options: ['x = 5', 'x = 9', 'x = 7', 'x = 4'],
      correctIndex: 0,
      explanation: '2x = 14 - 4 => 2x = 10 => x = 5.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_9',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Ângulos',
      question: 'Como é chamado um ângulo que mede exatamente 90 graus?',
      options: ['Ângulo reto', 'Ângulo agudo', 'Ângulo obtuso', 'Ângulo raso'],
      correctIndex: 0,
      explanation: 'O ângulo reto mede precisamente 90º.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_2',
      subject: 'ciencias',
      grade: '7_fund',
      topic: 'Reinos dos Seres Vivos',
      question: 'As bactérias pertencem a qual reino de seres vivos?',
      options: ['Reino Monera', 'Reino Fungi', 'Reino Plantae', 'Reino Animalia'],
      correctIndex: 0,
      explanation: 'Bactérias e arqueas são procariontes e constituem o reino Monera.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_7',
      subject: 'ciencias',
      grade: '7_fund',
      topic: 'Vacinas e Imunidade',
      question: 'Como as vacinas agem no corpo humano?',
      options: ['Estimulam o sistema imunológico a produzir anticorpos de memória', 'Matam bactérias instantaneamente como antibióticos', 'Substituem o sangue doente', 'Aumentam a temperatura corporal para sempre'],
      correctIndex: 0,
      explanation: 'Vacinas apresentam antígenos atenuados para treinar os linfócitos a criar defesas.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_3',
      subject: 'historia',
      grade: '7_fund',
      topic: 'Feudalismo',
      question: 'No feudalismo da Idade Média europeia, a principal fonte de riqueza e poder era:',
      options: ['A posse da terra (o feudo)', 'O comércio marítimo internacional', 'O trabalho assalariado', 'A indústria manufatureira'],
      correctIndex: 0,
      explanation: 'A economia feudal era agrária e descentralizada com base no feudo.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_10',
      subject: 'historia',
      grade: '7_fund',
      topic: 'Renascimento',
      question: 'O movimento cultural e artístico dos séculos XIV a XVI que valorizou a razão e a cultura greco-romana foi:',
      options: ['Renascimento Cultural', 'Iluminismo', 'Guerra Fria', 'Cruzadas'],
      correctIndex: 0,
      explanation: 'O Renascimento destacou gênios como Leonardo da Vinci e Michelangelo.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_4',
      subject: 'geografia',
      grade: '7_fund',
      topic: 'Domínios Morfoclimáticos',
      question: 'O bioma brasileiro com clima semiárido, vegetação com espinhos e cactos chama-se:',
      options: ['Caatinga', 'Pampa', 'Pantanal', 'Mata dos Cocais'],
      correctIndex: 0,
      explanation: 'A Caatinga é exclusiva do Brasil e adaptada à seca.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_6',
      subject: 'portugues',
      grade: '7_fund',
      topic: 'Sujeito e Predicado',
      question: 'Na oração "Os alunos dedicados venceram a competição", qual é o sujeito simples?',
      options: ['Os alunos dedicados', 'Venceram a competição', 'A competição', 'Dedicados venceram'],
      correctIndex: 0,
      explanation: 'O sujeito é quem pratica a ação expressa no verbo.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_8',
      subject: 'ingles',
      grade: '7_fund',
      topic: 'Simple Present',
      question: 'Complete com o verbo correto: "She _____ English every day."',
      options: ['studies', 'study', 'studying', 'is study'],
      correctIndex: 0,
      explanation: 'Na 3ª pessoa do singular (He/She/It) no presente simples, adicionamos -s/-es/-ies.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_ing_2',
      subject: 'ingles',
      grade: '7_fund',
      topic: 'Comparatives',
      question: 'Qual frase usa corretamente o grau comparativo em inglês?',
      options: ['An elephant is bigger than a mouse', 'An elephant is more big than a mouse', 'An elephant is biggest than a mouse', 'An elephant is big than a mouse'],
      correctIndex: 0,
      explanation: 'Para adjetivos curtos como "big", dobramos a consoante e acrescentamos "-er": "bigger than".',
      difficulty: 'medium',
    },
  ],

  '8_fund': [
    ...SAMPLE_LESSONS[1].practiceQuestions,
    {
      id: 'q_8f_6',
      subject: 'matematica',
      grade: '8_fund',
      topic: 'Notação Científica',
      question: 'Como escrevemos o número 35.000 em notação científica?',
      options: ['3,5 x 10⁴', '35 x 10³', '0,35 x 10⁵', '3,5 x 10³'],
      correctIndex: 0,
      explanation: 'Deslocamos a vírgula 4 casas para a esquerda: 3,5 x 10⁴.',
      difficulty: 'medium',
    },
    {
      id: 'q_8f_10',
      subject: 'matematica',
      grade: '8_fund',
      topic: 'Produtos Notáveis',
      question: 'O desenvolvimento do quadrado da soma (x + 3)² é igual a:',
      options: ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9', '2x + 6'],
      correctIndex: 0,
      explanation: '(x + 3)² = x² + 2(x)(3) + 3² = x² + 6x + 9.',
      difficulty: 'hard',
    },
    {
      id: 'q_8f_7',
      subject: 'historia',
      grade: '8_fund',
      topic: 'Independência do Brasil',
      question: 'Quem proclamou a Independência do Brasil às margens do Rio Ipiranga em 1822?',
      options: ['Dom Pedro I', 'Tiradentes', 'Dom Pedro II', 'Marechal Deodoro'],
      correctIndex: 0,
      explanation: 'Dom Pedro I deu o Grito do Ipiranga em 7 de setembro de 1822.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_his_2',
      subject: 'historia',
      grade: '8_fund',
      topic: 'Iluminismo e Revolução Francesa',
      question: 'O lema iluminista que guiou a Revolução Francesa de 1789 foi:',
      options: ['Liberdade, Igualdade e Fraternidade', 'Ordem e Progresso', 'Deus, Pátria e Família', 'Pão e Circo'],
      correctIndex: 0,
      explanation: '"Liberté, Égalité, Fraternité" foi o grande lema transformador da Revolução Francesa.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_8',
      subject: 'geografia',
      grade: '8_fund',
      topic: 'Américas',
      question: 'A cordilheira de montanhas mais extensa da América do Sul é:',
      options: ['Cordilheira dos Andes', 'Montanhas Rochosas', 'Montes Urais', 'Himalaia'],
      correctIndex: 0,
      explanation: 'Os Andes estendem-se por milhares de quilômetros na costa oeste sul-americana.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_9',
      subject: 'portugues',
      grade: '8_fund',
      topic: 'Vozes Verbais',
      question: 'Em "A carta foi escrita pelo aluno", a oração está em qual voz verbal?',
      options: ['Voz passiva', 'Voz ativa', 'Voz reflexiva', 'Voz recíproca'],
      correctIndex: 0,
      explanation: 'O sujeito "A carta" recebe a ação praticada pelo agente da passiva "o aluno".',
      difficulty: 'medium',
    },
    {
      id: 'q_8f_cie_1',
      subject: 'ciencias',
      grade: '8_fund',
      topic: 'Sistema Nervoso',
      question: 'A unidade básica e funcional do sistema nervoso responsável pela condução de impulsos elétricos é o:',
      options: ['Neurônio', 'Néfron', 'Glóbulo vermelho', 'Alvéolo'],
      correctIndex: 0,
      explanation: 'Os neurônios transmitem sinais através de sinapses químicas e elétricas.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_ing_1',
      subject: 'ingles',
      grade: '8_fund',
      topic: 'Future with Will and Going to',
      question: 'Complete: "Look at the dark clouds! It _____ rain."',
      options: ['is going to', 'will', 'did', 'was'],
      correctIndex: 0,
      explanation: 'Usamos "be going to" para previsões baseadas em evidências visuais no presente.',
      difficulty: 'medium',
    },
  ],

  '9_fund': [
    {
      id: 'q_9f_1',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Equação do 2º Grau',
      question: 'Qual fórmula é tradicionalmente usada para encontrar as raízes de uma equação ax² + bx + c = 0?',
      options: ['Fórmula de Bhaskara', 'Teorema de Pitágoras', 'Regra de Três', 'Fórmula de Heron'],
      correctIndex: 0,
      explanation: 'Bhaskara calcula x = (-b ± √Δ) / 2a com Δ = b² - 4ac.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_2',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Química e Tabela Periódica',
      question: 'Qual é o símbolo químico do elemento Ouro na Tabela Periódica?',
      options: ['Au', 'Ag', 'Fe', 'Cu'],
      correctIndex: 0,
      explanation: 'Au vem do latim "Aurum" (brilhante). Ag é prata e Fe é ferro.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_3',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Física - Velocidade Média',
      question: 'Um carro percorre 120 km em 2 horas. Qual foi sua velocidade média?',
      options: ['60 km/h', '120 km/h', '240 km/h', '30 km/h'],
      correctIndex: 0,
      explanation: 'Vm = ΔS / Δt = 120 km / 2 h = 60 km/h.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_4',
      subject: 'historia',
      grade: '9_fund',
      topic: 'Primeira Guerra Mundial',
      question: 'Qual fato histórico de 1914 deflagrou o início da Primeira Guerra Mundial?',
      options: ['O assassinato do arquiduque Francisco Ferdinando em Sarajevo', 'A queda da Bastilha', 'O ataque a Pearl Harbor', 'A quebra da Bolsa de Nova York'],
      correctIndex: 0,
      explanation: 'O atentado contra o herdeiro austro-húngaro ativou o sistema de alianças militares.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_5',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Teorema de Pitágoras',
      question: 'Em um triângulo retângulo com catetos medindo 3 cm e 4 cm, a hipotenusa mede:',
      options: ['5 cm', '7 cm', '6 cm', '8 cm'],
      correctIndex: 0,
      explanation: 'a² = 3² + 4² = 9 + 16 = 25 => a = √25 = 5 cm.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_6',
      subject: 'portugues',
      grade: '9_fund',
      topic: 'Orações Coordenadas',
      question: 'Na frase "Ele estudou muito, porém não conseguiu a nota", a conjunção "porém" expressa ideia de:',
      options: ['Adversidade / oposição', 'Conclusão', 'Explicação', 'Adição'],
      correctIndex: 0,
      explanation: '"Porém", "mas", "contudo" e "todavia" são conjunções adversativas.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_7',
      subject: 'geografia',
      grade: '9_fund',
      topic: 'Globalização',
      question: 'A integração econômica, cultural e tecnológica entre diferentes nações do mundo é chamada de:',
      options: ['Globalização', 'Protecionismo', 'Isolacionismo', 'Feudalismo'],
      correctIndex: 0,
      explanation: 'A globalização encurtou distâncias por meio das telecomunicações e transportes modernos.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_8',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Genética',
      question: 'Quem é considerado o "Pai da Genética" por seus experimentos com ervilhas?',
      options: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Albert Einstein'],
      correctIndex: 0,
      explanation: 'Mendel formulou as leis da hereditariedade cruzando linhagens de ervilhas.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_9',
      subject: 'ingles',
      grade: '9_fund',
      topic: 'Modal Verbs',
      question: 'Qual verbo modal indica uma obrigação ou necessidade forte?',
      options: ['Must', 'Might', 'Could', 'May'],
      correctIndex: 0,
      explanation: '"Must" expressa dever/obrigação estrita (ex: You must study).',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_10',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Função Afim',
      question: 'Na função f(x) = 3x - 5, qual é o valor de f(4)?',
      options: ['7', '12', '9', '-1'],
      correctIndex: 0,
      explanation: 'f(4) = 3(4) - 5 = 12 - 5 = 7.',
      difficulty: 'medium',
    },
  ],

  '1_medio': [
    ...SAMPLE_LESSONS[2].practiceQuestions,
    {
      id: 'q_1m_6',
      subject: 'fisica',
      grade: '1_medio',
      topic: 'Leis de Newton',
      question: 'A 2ª Lei de Newton (Princípio Fundamental da Dinâmica) é expressa matematicamente por:',
      options: ['F = m . a', 'E = m . c²', 'V = d / t', 'P = U . i'],
      correctIndex: 0,
      explanation: 'Força resultante é o produto da massa do corpo pela aceleração adquirida (F = m . a).',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_fis_2',
      subject: 'fisica',
      grade: '1_medio',
      topic: 'Cinemática Escalar',
      question: 'Um móvel parte do repouso e atinge a velocidade de 20 m/s em 4 segundos. Sua aceleração média foi:',
      options: ['5 m/s²', '80 m/s²', '16 m/s²', '2,5 m/s²'],
      correctIndex: 0,
      explanation: 'a = Δv / Δt = (20 - 0) / 4 = 5 m/s².',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_7',
      subject: 'quimica',
      grade: '1_medio',
      topic: 'Modelos Atômicos',
      question: 'Qual cientista propôs o modelo atômico com elétrons girando em órbitas quantizadas de energia?',
      options: ['Niels Bohr', 'John Dalton', 'J.J. Thomson', 'Ernest Rutherford'],
      correctIndex: 0,
      explanation: 'Bohr aperfeiçoou o modelo de Rutherford introduzindo níveis de energia quantizados.',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_qui_2',
      subject: 'quimica',
      grade: '1_medio',
      topic: 'Ligações Químicas',
      question: 'A ligação formada pela atração eletrostática entre um metal (que doa elétrons) e um não metal (que recebe) é a ligação:',
      options: ['Iônica', 'Covalente simples', 'Metálica', 'Ponte de hidrogênio'],
      correctIndex: 0,
      explanation: 'A ligação iônica ocorre por transferência definitiva de elétrons formando cátions e ânions.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_8',
      subject: 'biologia',
      grade: '1_medio',
      topic: 'Membrana Plasmática',
      question: 'O modelo que descreve a estrutura dinâmica da membrana celular com fosfolipídios e proteínas é o:',
      options: ['Mosaico Fluido', 'Pudim de Passas', 'Dupla Hélice', 'Célula Fechada'],
      correctIndex: 0,
      explanation: 'Proposto por Singer e Nicolson em 1972, descreve a fluidez da bicamada lipídica.',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_bio_2',
      subject: 'biologia',
      grade: '1_medio',
      topic: 'Organelas Celulares',
      question: 'Qual organela citoplasmática é a principal responsável pela respiração celular e produção de ATP?',
      options: ['Mitocôndria', 'Complexo de Golgi', 'Lisossomo', 'Retículo Endoplasmático'],
      correctIndex: 0,
      explanation: 'As mitocôndrias produzem a maior parte do ATP através do ciclo de Krebs e cadeia respiratória.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_9',
      subject: 'matematica',
      grade: '1_medio',
      topic: 'Conjuntos e Funções',
      question: 'Uma função f(x) = ax + b é estritamente crescente quando o coeficiente angular "a" é:',
      options: ['Maior que zero (a > 0)', 'Menor que zero (a < 0)', 'Igual a zero (a = 0)', 'Negativo fracionário'],
      correctIndex: 0,
      explanation: 'Se a > 0, à medida que x aumenta, f(x) também aumenta.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_10',
      subject: 'historia',
      grade: '1_medio',
      topic: 'Grécia Antiga',
      question: 'Qual pólis (cidade-estado) grega é famosa pelo nascimento da Democracia direta na Antiguidade?',
      options: ['Atenas', 'Esparta', 'Tebas', 'Corinto'],
      correctIndex: 0,
      explanation: 'Atenas desenvolveu a democracia na praça pública (Ágora).',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_geo_1',
      subject: 'geografia',
      grade: '1_medio',
      topic: 'Estrutura Geológica e Placas Tectônicas',
      question: 'O movimento em que duas placas tectônicas colidem uma contra a outra é chamado de limite:',
      options: ['Convergente', 'Divergente', 'Transformante', 'Estático'],
      correctIndex: 0,
      explanation: 'Limites convergentes provocam subducção ou orogênese (formação de cadeias montanhosas).',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_ing_1',
      subject: 'ingles',
      grade: '1_medio',
      topic: 'First Conditional',
      question: 'Complete: "If it rains tomorrow, we _____ stay at home."',
      options: ['will', 'would', 'did', 'have'],
      correctIndex: 0,
      explanation: 'A First Conditional usa "If + Present Simple" na oração condicional e "Will + verbo base" na oração principal.',
      difficulty: 'medium',
    },
  ],

  '2_medio': [
    {
      id: 'q_2m_1',
      subject: 'quimica',
      grade: '2_medio',
      topic: 'Termoquímica',
      question: 'Uma reação química que libera calor para o ambiente e tem variação de entalpia negativa (ΔH < 0) é:',
      options: ['Exotérmica', 'Endotérmica', 'Isotérmica', 'Adiabática'],
      correctIndex: 0,
      explanation: 'Reações exotérmicas liberam energia na forma de calor para o meio.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_7',
      subject: 'quimica',
      grade: '2_medio',
      topic: 'Soluções e Concentração',
      question: 'Se dissolvermos 20g de sal em água até completar 1 litro de solução, a concentração comum é:',
      options: ['20 g/L', '10 g/L', '40 g/L', '0,2 g/L'],
      correctIndex: 0,
      explanation: 'C = m / V = 20 g / 1 L = 20 g/L.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_2',
      subject: 'fisica',
      grade: '2_medio',
      topic: 'Termologia e Escalas',
      question: 'Qual temperatura na escala Celsius corresponde ao ponto de fusão do gelo ao nível do mar?',
      options: ['0 ºC', '100 ºC', '32 ºC', '-273 ºC'],
      correctIndex: 0,
      explanation: 'O gelo funde a 0 ºC (32 ºF / 273 K).',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_6',
      subject: 'fisica',
      grade: '2_medio',
      topic: 'Óptica Geométrica',
      question: 'O arco-íris e a separação da luz branca em várias cores ao atravessar um prisma é devido ao fenômeno da:',
      options: ['Refração e dispersão da luz', 'Reflexão total', 'Polarização', 'Difração sonora'],
      correctIndex: 0,
      explanation: 'Cada frequência de luz refrata em um ângulo diferente ao mudar de meio.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_3',
      subject: 'biologia',
      grade: '2_medio',
      topic: 'Botânica',
      question: 'Qual grupo vegetal foi o primeiro a desenvolver sementes protegidas no interior de frutos?',
      options: ['Angiospermas', 'Gimnospermas', 'Pteridófitas', 'Briófitas'],
      correctIndex: 0,
      explanation: 'As angiospermas são as plantas com flores e frutos verdadeiros.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_4',
      subject: 'matematica',
      grade: '2_medio',
      topic: 'Trigonometria',
      question: 'Qual é o valor do seno de um ângulo de 30 graus (sen 30º)?',
      options: ['1/2 (ou 0,5)', '√3/2', '√2/2', '1'],
      correctIndex: 0,
      explanation: 'Na tabela dos ângulos notáveis, sen 30º = 1/2 e cos 60º = 1/2.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_9',
      subject: 'matematica',
      grade: '2_medio',
      topic: 'Matrizes e Determinantes',
      question: 'O determinante da matriz 2x2 com linhas [3, 2] e [1, 4] é:',
      options: ['10', '14', '6', '12'],
      correctIndex: 0,
      explanation: 'Det = (3 x 4) - (2 x 1) = 12 - 2 = 10.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_5',
      subject: 'portugues',
      grade: '2_medio',
      topic: 'Romantismo no Brasil',
      question: 'O poema "Canção do Exílio" ("Minha terra tem palmeiras, onde canta o sabiá...") foi escrito por:',
      options: ['Gonçalves Dias', 'Castro Alves', 'Álvares de Azevedo', 'Casimiro de Abreu'],
      correctIndex: 0,
      explanation: 'Gonçalves Dias é o ícone da 1ª geração romântica nacionalista.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_8',
      subject: 'historia',
      grade: '2_medio',
      topic: 'Brasil Império',
      question: 'O período em que Dom Pedro II governou o Brasil por quase 50 anos é conhecido como:',
      options: ['Segundo Reinado', 'Primeiro Reinado', 'República Velha', 'Regência Una'],
      correctIndex: 0,
      explanation: 'O Segundo Reinado durou de 1840 (Golpe da Maioridade) até 1889.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_10',
      subject: 'geografia',
      grade: '2_medio',
      topic: 'Fontes de Energia',
      question: 'Qual fonte de energia limpa e renovável aproveita a força dos ventos?',
      options: ['Energia Eólica', 'Energia Termelétrica', 'Energia Nuclear', 'Carvão Mineral'],
      correctIndex: 0,
      explanation: 'Aerogeradores convertem a energia cinética do vento em eletricidade.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_ing_1',
      subject: 'ingles',
      grade: '2_medio',
      topic: 'Phrasal Verbs',
      question: 'O que significa o phrasal verb "give up" na frase "Never give up on your dreams"?',
      options: ['Desistir', 'Começar', 'Acelerar', 'Esquecer'],
      correctIndex: 0,
      explanation: '"Give up" significa desistir ou renunciar.',
      difficulty: 'easy',
    },
  ],

  '3_medio': [
    {
      id: 'q_3m_1',
      subject: 'quimica',
      grade: '3_medio',
      topic: 'Química Orgânica',
      question: 'Compostos formados exclusivamente por átomos de carbono e hidrogênio são chamados de:',
      options: ['Hidrocarbonetos', 'Álcoois', 'Ésteres', 'Aminas'],
      correctIndex: 0,
      explanation: 'Hidrocarbonetos (como metano, propano e gasolina) contêm apenas C e H.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_9',
      subject: 'quimica',
      grade: '3_medio',
      topic: 'Isomeria Plana',
      question: 'Compostos que possuem a mesma fórmula molecular mas fórmulas estruturais diferentes são chamados de:',
      options: ['Isômeros', 'Polímeros', 'Isótopos', 'Alótropos'],
      correctIndex: 0,
      explanation: 'Isomeria ocorre quando a mesma composição atômica gera arranjos moleculares distintos.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_2',
      subject: 'fisica',
      grade: '3_medio',
      topic: 'Eletrodinâmica',
      question: 'A 1ª Lei de Ohm que relaciona Tensão (U), Resistência (R) e Corrente (i) é:',
      options: ['U = R . i', 'P = m . g', 'F = q . E', 'B = μ . i'],
      correctIndex: 0,
      explanation: 'A ddp é proporcional à corrente elétrica através da resistência (U = R.i).',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_8',
      subject: 'fisica',
      grade: '3_medio',
      topic: 'Eletromagnetismo',
      question: 'A criação de uma corrente elétrica a partir da variação de um campo magnético é o princípio da:',
      options: ['Indução Eletromagnética (Faraday)', 'Gravitação Universal', 'Termodinâmica', 'Lei de Coulomb'],
      correctIndex: 0,
      explanation: 'A indução de Faraday é a base do funcionamento de geradores e usinas hidrelétricas.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_3',
      subject: 'biologia',
      grade: '3_medio',
      topic: 'Ecologia',
      question: 'A relação ecológica entre abelhas e flores, na qual ambas as espécies se beneficiam, é um exemplo de:',
      options: ['Mutualismo', 'Parasitismo', 'Predatismo', 'Amensalismo'],
      correctIndex: 0,
      explanation: 'No mutualismo interespecífico, ambos os seres envolvidos obtêm vantagens mútuas.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_4',
      subject: 'matematica',
      grade: '3_medio',
      topic: 'Geometria Analítica',
      question: 'A distância entre a origem (0,0) e o ponto P(3, 4) no plano cartesiano é:',
      options: ['5 unidades', '7 unidades', '6 unidades', '25 unidades'],
      correctIndex: 0,
      explanation: 'd = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_7',
      subject: 'matematica',
      grade: '3_medio',
      topic: 'Probabilidade',
      question: 'Ao lançar um dado justo de 6 faces, qual é a probabilidade de sair um número par?',
      options: ['3/6 (ou 50%)', '1/6', '2/6', '4/6'],
      correctIndex: 0,
      explanation: 'Os números pares são {2, 4, 6}, ou seja, 3 em 6 casos possíveis (50%).',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_5',
      subject: 'portugues',
      grade: '3_medio',
      topic: 'Modernismo Brasileiro',
      question: 'Qual evento marco inaugurou oficialmente o Modernismo no Brasil em 1922?',
      options: ['Semana de Arte Moderna em São Paulo', 'A Proclamação da República', 'O Manifesto Antropófago', 'A fundação da ABL'],
      correctIndex: 0,
      explanation: 'A Semana de 22 ocorreu no Theatro Municipal de SP em fevereiro de 1922.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_6',
      subject: 'historia',
      grade: '3_medio',
      topic: 'Guerra Fria',
      question: 'O confronto geopolítico e ideológico indireto entre EUA (capitalismo) e URSS (socialismo) foi a:',
      options: ['Guerra Fria', 'Primeira Guerra Mundial', 'Guerra do Vietnã', 'Guerra das Rosas'],
      correctIndex: 0,
      explanation: 'A Guerra Fria durou do fim da Segunda Guerra Mundial até 1991.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_10',
      subject: 'geografia',
      grade: '3_medio',
      topic: 'Urbanização e Metrópoles',
      question: 'A conurbação de duas ou mais metrópoles criando uma gigantesca mancha urbana contínua é chamada de:',
      options: ['Megalópole', 'Megacidade', 'Tecnopolo', 'Distrito Industrial'],
      correctIndex: 0,
      explanation: 'Megalópoles se formam pela união funcional de complexos metropolitanos.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_ing_1',
      subject: 'ingles',
      grade: '3_medio',
      topic: 'False Friends (Falsos Cognatos)',
      question: 'A palavra em inglês "actually" significa:',
      options: ['Na verdade / Realmente', 'Atualmente', 'Eventualmente', 'Atualmente no momento'],
      correctIndex: 0,
      explanation: '"Actually" significa na verdade. Para dizer "atualmente", usa-se "currently" ou "nowadays".',
      difficulty: 'medium',
    },
  ],

  'enem': [
    ...SAMPLE_LESSONS[3].practiceQuestions,
    {
      id: 'q_enem_6',
      subject: 'biologia',
      grade: 'enem',
      topic: 'Biotecnologia',
      question: 'Organismos que receberam e incorporaram genes de outra espécie por engenharia genética são chamados de:',
      options: ['Transgênicos (OGMs)', 'Clones', 'Mutantes aleatórios', 'Fósseis vivos'],
      correctIndex: 0,
      explanation: 'Transgênicos possuem sequências de DNA recombinante de outras espécies.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_7',
      subject: 'matematica',
      grade: 'enem',
      topic: 'Estatística - Média, Moda e Mediana',
      question: 'Em um conjunto de dados [2, 4, 4, 7, 8], qual valor representa a Moda?',
      options: ['4 (valor mais frequente)', '5 (média aritmética)', '7', '2'],
      correctIndex: 0,
      explanation: 'A moda é o elemento que aparece com maior frequência no conjunto.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_8',
      subject: 'geografia',
      grade: 'enem',
      topic: 'Aquecimento Global e Efeito Estufa',
      question: 'O principal gás de efeito estufa emitido pela queima maciça de combustíveis fósseis é:',
      options: ['Dióxido de Carbono (CO2)', 'Gás Ozônio (O3)', 'Hélio (He)', 'Nitrogênio (N2)'],
      correctIndex: 0,
      explanation: 'O CO2 retém a radiação infravermelha, elevando a temperatura média global.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_9',
      subject: 'portugues',
      grade: 'enem',
      topic: 'Interpretação e Coesão',
      question: 'A anáfora na construção textual consiste em:',
      options: ['Retomar um termo ou ideia já mencionado anteriormente no texto', 'Antecipar um termo que ainda será dito', 'Repetir sons consonantais', 'Usar termos estrangeiros'],
      correctIndex: 0,
      explanation: 'A coesão anafórica recupera referentes anteriores para evitar repetições desnecessárias.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_10',
      subject: 'fisica',
      grade: 'enem',
      topic: 'Consumo de Energia Elétrica',
      question: 'Um chuveiro elétrico de 5.000 W (5 kW) ligado por 2 horas consome quanta energia em kWh?',
      options: ['10 kWh', '2,5 kWh', '10.000 kWh', '25 kWh'],
      correctIndex: 0,
      explanation: 'Energia = Potência x Tempo = 5 kW x 2 h = 10 kWh.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_qui_1',
      subject: 'quimica',
      grade: 'enem',
      topic: 'Eletroquímica e Pilhas',
      question: 'Em uma pilha galvânica (como a pilha de Daniell), a oxidação ocorre em qual polo?',
      options: ['No Ânodo (polo negativo)', 'No Cátodo (polo positivo)', 'Na ponte salina', 'No voltímetro'],
      correctIndex: 0,
      explanation: 'Regra mnemônica CROA: Cátodo Reduz, Oxida no Ânodo.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_his_1',
      subject: 'historia',
      grade: 'enem',
      topic: 'Ditadura Militar e Redemocratização',
      question: 'O movimento popular de 1983-1984 que exigia eleições presidenciais diretas no Brasil ficou conhecido como:',
      options: ['Diretas Já', 'Caras-Pintadas', 'Revolta da Vacina', 'Marcha dos 100 Mil'],
      correctIndex: 0,
      explanation: 'As "Diretas Já" mobilizaram milhões de brasileiros em prol da Emenda Dante de Oliveira.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_ing_1',
      subject: 'ingles',
      grade: 'enem',
      topic: 'ENEM Reading Comprehension',
      question: 'Ao responder questões de Língua Inglesa do ENEM, a estratégia "Skimming" consiste em:',
      options: ['Fazer uma leitura rápida para captar a ideia geral e o tema central do texto', 'Procurar uma palavra-chave específica (Scanning)', 'Traduzir palavra por palavra no dicionário', 'Ler de trás para frente'],
      correctIndex: 0,
      explanation: 'Skimming é a técnica de leitura dinâmica para identificar a ideia global do texto.',
      difficulty: 'easy',
    },
  ],
};

// Export CURRICULUM_QUESTIONS_POOL with all questions randomized across alternatives (A, B, C, D)
export const CURRICULUM_QUESTIONS_POOL: Record<GradeLevel, Question[]> = Object.fromEntries(
  Object.entries(RAW_CURRICULUM_QUESTIONS_POOL).map(([grade, questions]) => [
    grade,
    shuffleQuestionsList(questions),
  ])
) as Record<GradeLevel, Question[]>;

// Tiebreaker questions specifically built from lighter questions of the grade below!
export function getTiebreakerQuestions(grade: GradeLevel, subject?: SubjectId | 'all'): Question[] {
  const previousGrade = GRADE_LABELS[grade]?.previousGrade || '1_fund';
  const targetSubj = subject && subject !== 'all' ? subject : undefined;

  if (targetSubj) {
    const pool = CURRICULUM_QUESTIONS_POOL[previousGrade] || CURRICULUM_QUESTIONS_POOL['1_fund'] || [];
    let subjPool = pool.filter((q) => q.subject === targetSubj);
    if (subjPool.length === 0) {
      subjPool = generateProceduralQuestions(previousGrade, targetSubj, 5, new Set<string>());
    }
    return shuffleQuestionsList(subjPool.slice(0, 5)).map((q, idx) => ({
      ...q,
      id: `tb_${previousGrade}_${idx}`,
      question: `⭐ DESEMPATE (${GRADE_LABELS[previousGrade]?.short || 'Base'}): ${q.question}`,
      isTiebreaker: true,
    }));
  }

  if (!GRADE_LABELS[grade]?.previousGrade) {
    // 1_fund fallback tiebreakers: ultra-easy questions
    const fallbackQuestions: Question[] = [
      {
        id: 'tb_1_1',
        subject: 'matematica',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Quanto é 1 + 1?',
        options: ['2', '1', '3', '0'],
        correctIndex: 0,
        explanation: '1 + 1 = 2!',
        difficulty: 'easy',
        isTiebreaker: true,
      },
      {
        id: 'tb_1_2',
        subject: 'portugues',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Qual a cor da banana madura?',
        options: ['Amarela', 'Azul', 'Vermelha', 'Roxa'],
        correctIndex: 0,
        explanation: 'A banana madura é amarela.',
        difficulty: 'easy',
        isTiebreaker: true,
      },
      {
        id: 'tb_1_3',
        subject: 'ciencias',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Quantas pernas tem um pato?',
        options: ['2 pernas', '4 pernas', '6 pernas', '1 perna'],
        correctIndex: 0,
        explanation: 'O pato é uma ave bípede e tem 2 pernas!',
        difficulty: 'easy',
        isTiebreaker: true,
      },
    ];
    return shuffleQuestionsList(fallbackQuestions);
  }

  // Pick questions from the previous grade and format them with "DESEMPATE" badge
  const pool = CURRICULUM_QUESTIONS_POOL[previousGrade] || CURRICULUM_QUESTIONS_POOL['1_fund'];
  return shuffleQuestionsList(pool.slice(0, 5)).map((q, idx) => ({
    ...q,
    id: `tb_${previousGrade}_${idx}`,
    question: `⭐ DESEMPATE (${GRADE_LABELS[previousGrade]?.short || 'Base'}): ${q.question}`,
    isTiebreaker: true,
  }));
}

/**
 * Helper to retrieve all curated questions across all grades for a specific subject.
 * Guarantees that only questions from that exact subject are returned, with shuffled options.
 */
export function getAllQuestionsForSubject(subject: SubjectId): Question[] {
  const allQuestions: Question[] = [];

  // 1. From sample lessons
  for (const lesson of SAMPLE_LESSONS) {
    if (lesson.subject === subject) {
      allQuestions.push(...(lesson.practiceQuestions || []));
    }
  }

  // 2. From all grade pools
  for (const gradeKey of Object.keys(CURRICULUM_QUESTIONS_POOL) as GradeLevel[]) {
    const gradePool = CURRICULUM_QUESTIONS_POOL[gradeKey] || [];
    for (const q of gradePool) {
      if (q.subject === subject) {
        allQuestions.push(q);
      }
    }
  }

  return shuffleQuestionsList(allQuestions);
}

// Function to generate dynamic, BNCC-accurate unique procedural questions for any grade and subject
export function generateProceduralQuestions(
  grade: GradeLevel,
  subject: SubjectId,
  count: number,
  excludeTexts: Set<string> = new Set<string>()
): Question[] {
  const safeExclude = excludeTexts || new Set<string>();
  const result: Question[] = [];
  const subjInfo = SUBJECTS.find((s) => s.id === subject);
  const subjName = subjInfo?.name || 'Estudos';
  const gradeLabel = GRADE_LABELS[grade]?.short || 'Série';

  // Bank of specialized dynamic question generators by subject
  const generators: Array<() => Question | null> = [];

  if (grade === '1_fund') {
    if (subject === 'matematica') {
      // 1. Additions up to 10
      for (let a = 1; a <= 5; a++) {
        for (let b = 1; b <= 5; b++) {
          generators.push(() => {
            const sum = a + b;
            const qText = `Quanto é ${a} + ${b}?`;
            if (excludeTexts.has(qText.toLowerCase())) return null;
            const distSet = new Set<number>();
            for (const off of [1, 2, -1, 3, -2, 4]) {
              const cand = sum + off;
              if (cand > 0 && cand !== sum && !distSet.has(cand)) {
                distSet.add(cand);
                if (distSet.size === 3) break;
              }
            }
            const dist = Array.from(distSet);
            return {
              id: `dyn_mat_add_${a}_${b}_${Date.now()}`,
              subject: 'matematica',
              grade: '1_fund',
              topic: 'Adição Simples',
              question: qText,
              options: [`${sum}`, `${dist[0]}`, `${dist[1]}`, `${dist[2]}`],
              correctIndex: 0,
              explanation: `Juntando ${a} com mais ${b}, temos exatamente ${sum}.`,
              difficulty: 'easy',
            };
          });
        }
      }

      // 2. Subtractions within 10
      const subPairs = [[4, 1], [5, 2], [6, 1], [5, 3], [7, 2], [8, 3], [6, 3], [9, 2], [10, 5], [3, 2], [4, 3], [8, 4], [7, 3]];
      for (const [a, b] of subPairs) {
        generators.push(() => {
          const diff = a - b;
          const qText = `Se você tinha ${a} figurinhas e deu ${b} para seu amigo, quantas restaram?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const distSet = new Set<number>();
          for (const off of [1, 2, -1, 3, -2, 4]) {
            const cand = diff + off;
            if (cand > 0 && cand !== diff && !distSet.has(cand)) {
              distSet.add(cand);
              if (distSet.size === 3) break;
            }
          }
          const dist = Array.from(distSet);
          return {
            id: `dyn_mat_sub_${a}_${b}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Subtração Básica',
            question: qText,
            options: [`${diff} figurinhas`, `${dist[0]} figurinhas`, `${dist[1]} figurinhas`, `${dist[2]} figurinhas`],
            correctIndex: 0,
            explanation: `Diminuindo ${b} de ${a}, sobram exatamente ${diff} figurinhas.`,
            difficulty: 'easy',
          };
        });
      }

      // 3. Shapes
      const shapes = [
        { shape: 'Círculo', obj: 'Uma bola de futebol', hint: 'redondinha e sem pontas' },
        { shape: 'Quadrado', obj: 'Uma janela com 4 lados iguais', hint: 'quatro lados retinhos e iguais' },
        { shape: 'Triângulo', obj: 'Uma fatia de pizza triangular', hint: 'três pontas (três lados)' },
        { shape: 'Retângulo', obj: 'A tela de uma televisão ou porta', hint: 'dois lados compridos e dois mais curtos' },
      ];
      for (const sh of shapes) {
        generators.push(() => {
          const qText = `Qual destes objetos tem o formato parecido com um ${sh.shape}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_mat_sh_${sh.shape}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Formas Geométricas',
            question: qText,
            options: [sh.obj, 'Um lápis pontudo', 'Uma régua quebrada', 'Uma nuvem no céu'],
            correctIndex: 0,
            explanation: `O ${sh.shape} tem o formato característico de ${sh.hint}.`,
            difficulty: 'easy',
          };
        });
      }

      // 4. Greater than / Counting
      const compNumbers = [[7, 2], [9, 4], [8, 5], [6, 1], [10, 3], [5, 0]];
      for (const [m1, m2] of compNumbers) {
        generators.push(() => {
          const qText = `Qual número representa a MAIOR quantidade: ${m1} ou ${m2}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_mat_cmp_${m1}_${m2}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Comparação de Quantidades',
            question: qText,
            options: [`O número ${m1}`, `O número ${m2}`, 'São quantidades iguais', 'Nenhum dos dois'],
            correctIndex: 0,
            explanation: `O número ${m1} tem mais unidades do que o ${m2}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'portugues') {
      const words = [
        { word: 'GATO', letter: 'G', vow: 2, sil: 2 },
        { word: 'SAPO', letter: 'S', vow: 2, sil: 2 },
        { word: 'VACA', letter: 'V', vow: 2, sil: 2 },
        { word: 'PATO', letter: 'P', vow: 2, sil: 2 },
        { word: 'LEÃO', letter: 'L', vow: 3, sil: 2 },
        { word: 'URSO', letter: 'U', vow: 2, sil: 2 },
        { word: 'MACACO', letter: 'M', vow: 3, sil: 3 },
        { word: 'ZEBRA', letter: 'Z', vow: 2, sil: 2 },
        { word: 'BONECA', letter: 'B', vow: 3, sil: 3 },
        { word: 'PIPA', letter: 'P', vow: 2, sil: 2 },
        { word: 'CASA', letter: 'C', vow: 2, sil: 2 },
        { word: 'ESTRELA', letter: 'E', vow: 3, sil: 3 },
      ];

      for (const w of words) {
        generators.push(() => {
          const qText = `Qual é a PRIMEIRA letra da palavra ${w.word}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherLetters = ['A', 'B', 'M', 'T', 'D'].filter((l) => l !== w.letter).slice(0, 3);
          return {
            id: `dyn_por_let_${w.word}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Letra Inicial',
            question: qText,
            options: [`Letra ${w.letter}`, `Letra ${otherLetters[0]}`, `Letra ${otherLetters[1]}`, `Letra ${otherLetters[2]}`],
            correctIndex: 0,
            explanation: `A palavra ${w.word} começa com o som da letra ${w.letter}.`,
            difficulty: 'easy',
          };
        });

        generators.push(() => {
          const qText = `Quantos pedacinhos (sílabas) tem a palavra ${w.word} ao falar em voz alta?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_por_sil_${w.word}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Separação Silábica',
            question: qText,
            options: [`${w.sil} sílabas`, `${w.sil + 1} sílabas`, `${Math.max(1, w.sil - 1)} sílabas`, `${w.sil + 2} sílabas`],
            correctIndex: 0,
            explanation: `Ao pronunciar ${w.word} pausadamente batendo palmas, abrimos a boca ${w.sil} vezes.`,
            difficulty: 'easy',
          };
        });
      }

      // Rhymes
      const rhymes = [
        { p1: 'PATO', p2: 'GATO', wrong: ['BOLA', 'MESA', 'SAPATO'] },
        { p1: 'BOLA', p2: 'MOLA', wrong: ['DADO', 'GATO', 'CARRO'] },
        { p1: 'SOL', p2: 'CARACOL', wrong: ['LUA', 'CHUVA', 'VENTO'] },
        { p1: 'PANELA', p2: 'JANELA', wrong: ['PRATO', 'COPO', 'GARFO'] },
        { p1: 'MÃO', p2: 'AVIÃO', wrong: ['PÉ', 'OLHO', 'BOCA'] },
      ];
      for (const rh of rhymes) {
        generators.push(() => {
          const qText = `Qual destas palavras RIMA (combina no final) com a palavra ${rh.p1}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_por_rhy_${rh.p1}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Rimas Infantis',
            question: qText,
            options: [rh.p2, rh.wrong[0], rh.wrong[1], rh.wrong[2]],
            correctIndex: 0,
            explanation: `${rh.p1} rima com ${rh.p2} porque ambas terminam com o mesmo som final!`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'ciencias') {
      const senses = [
        { action: 'ouvir uma bela música e a voz dos amigos', sense: 'Audição (Ouvidos)' },
        { action: 'enxergar as cores do arco-íris e ler historinhas', sense: 'Visão (Olhos)' },
        { action: 'sentir o cheirinho gostoso de um bolo assando', sense: 'Olfato (Nariz)' },
        { action: 'saborear o gosto doce de uma maçã ou sorvete', sense: 'Paladar (Língua/Boca)' },
        { action: 'sentir se um ursinho de pelúcia é macio ou fofinho', sense: 'Tato (Pele/Mãos)' },
      ];
      for (const sn of senses) {
        generators.push(() => {
          const qText = `Qual sentido do nosso corpo usamos para ${sn.action}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherSenses = ['Visão', 'Audição', 'Olfato', 'Tato', 'Paladar'].filter((s) => !sn.sense.includes(s)).slice(0, 3);
          return {
            id: `dyn_cie_sn_${sn.sense}_${Date.now()}`,
            subject: 'ciencias',
            grade: '1_fund',
            topic: 'Cinco Sentidos',
            question: qText,
            options: [sn.sense, otherSenses[0], otherSenses[1], otherSenses[2]],
            correctIndex: 0,
            explanation: `Para ${sn.action}, usamos o sentido da ${sn.sense}.`,
            difficulty: 'easy',
          };
        });
      }

      const animals = [
        { q: 'Qual destes animais vive dentro da água e usa nadadeiras para nadar?', a: 'O Peixinho', w: ['O Cavalo', 'O Cachorro', 'O Macaco'] },
        { q: 'Qual destes animais tem penas, bico e duas asas?', a: 'O Passarinho', w: ['O Gato', 'O Leão', 'O Elefante'] },
        { q: 'Qual animal é conhecido como o melhor amigo do homem e late?', a: 'O Cachorro', w: ['A Vaca', 'O Tigre', 'O Coelho'] },
        { q: 'Qual animal produz leite e vive na fazenda?', a: 'A Vaca', w: ['A Cobra', 'O Gavião', 'O Rato'] },
        { q: 'O que devemos fazer para manter nossos dentes sempre limpinhos e saudáveis?', a: 'Escovar os dentes após as refeições', w: ['Comer balas o dia todo', 'Não escovar antes de dormir', 'Beber refrigerante'] },
        { q: 'De que as plantinhas precisam para produzir seu próprio alimento e crescer?', a: 'Água, terra boa e luz do Sol', w: ['Apenas ficar no escuro', 'Refrigerante e doces', 'Brinquedos plásticos'] },
      ];
      for (const an of animals) {
        generators.push(() => {
          if (excludeTexts.has(an.q.toLowerCase())) return null;
          return {
            id: `dyn_cie_an_${Date.now()}_${Math.random()}`,
            subject: 'ciencias',
            grade: '1_fund',
            topic: 'Animais e Natureza',
            question: an.q,
            options: [an.a, an.w[0], an.w[1], an.w[2]],
            correctIndex: 0,
            explanation: `Resposta correta: ${an.a}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'historia' || subject === 'geografia') {
      const histGeoItems = [
        { q: 'O que brilha no céu durante o dia aquecendo a Terra?', a: 'O Sol', w: ['A Lua', 'As Estrelas', 'Os Cometas'] },
        { q: 'O que aparece no céu à noite quando o dia escurece?', a: 'A Lua e as estrelas', w: ['O Sol forte', 'O arco-íris de dia', 'O meio-dia'] },
        { q: 'Qual atitude torna a sala de aula um lugar alegre e respeitoso?', a: 'Compartilhar brinquedos e ajudar os colegas', w: ['Gritar e brigar', 'Empurrar no recreio', 'Não ouvir a professora'] },
        { q: 'Quando olhamos para a nossa frente, o que fica na direção contrária?', a: 'Atrás de nós', w: ['Em cima', 'Embaixo', 'No chão'] },
        { q: 'Qual documento registra o dia em que uma criança nasceu e o nome de seus pais?', a: 'Certidão de Nascimento', w: ['Bilhete de cinema', 'Cupom de mercado', 'Desenho no papel'] },
        { q: 'Onde guardamos os brinquedos e descansamos com nossa família?', a: 'Em nossa casa (nosso lar)', w: ['No supermercado', 'No trânsito da rua', 'No ponto de ônibus'] },
        { q: 'Qual é o lugar da escola onde a turma se reúne com o professor para aprender?', a: 'Sala de aula', w: ['Portaria', 'Estacionamento', 'Cozinha'] },
      ];
      for (const hg of histGeoItems) {
        generators.push(() => {
          if (excludeTexts.has(hg.q.toLowerCase())) return null;
          return {
            id: `dyn_hg_${Date.now()}_${Math.random()}`,
            subject,
            grade: '1_fund',
            topic: subject === 'historia' ? 'Família e Convivência' : 'Espaço e Localização',
            question: hg.q,
            options: [hg.a, hg.w[0], hg.w[1], hg.w[2]],
            correctIndex: 0,
            explanation: `Correto: ${hg.a}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'ingles') {
      const engColors = [
        { pt: 'Vermelho', en: 'Red' },
        { pt: 'Azul', en: 'Blue' },
        { pt: 'Amarelo', en: 'Yellow' },
        { pt: 'Verde', en: 'Green' },
        { pt: 'Rosa', en: 'Pink' },
        { pt: 'Laranja', en: 'Orange' },
        { pt: 'Preto', en: 'Black' },
        { pt: 'Branco', en: 'White' },
      ];
      for (const col of engColors) {
        generators.push(() => {
          const qText = `Como dizemos a cor "${col.pt}" em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherColors = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'Black'].filter((c) => c !== col.en).slice(0, 3);
          return {
            id: `dyn_eng_col_${col.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Colors in English',
            question: qText,
            options: [col.en, otherColors[0], otherColors[1], otherColors[2]],
            correctIndex: 0,
            explanation: `A cor "${col.pt}" em inglês é "${col.en}".`,
            difficulty: 'easy',
          };
        });
      }

      const engNums = [
        { pt: '1 (Um)', en: 'One' },
        { pt: '2 (Dois)', en: 'Two' },
        { pt: '3 (Três)', en: 'Three' },
        { pt: '4 (Quatro)', en: 'Four' },
        { pt: '5 (Cinco)', en: 'Five' },
        { pt: '6 (Seis)', en: 'Six' },
        { pt: '7 (Sete)', en: 'Seven' },
        { pt: '8 (Oito)', en: 'Eight' },
        { pt: '9 (Nove)', en: 'Nine' },
        { pt: '10 (Dez)', en: 'Ten' },
      ];
      for (const num of engNums) {
        generators.push(() => {
          const qText = `Como dizemos o número ${num.pt} em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherNums = ['One', 'Two', 'Three', 'Four', 'Five', 'Ten'].filter((n) => n !== num.en).slice(0, 3);
          return {
            id: `dyn_eng_num_${num.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Numbers 1-10',
            question: qText,
            options: [num.en, otherNums[0], otherNums[1], otherNums[2]],
            correctIndex: 0,
            explanation: `O número ${num.pt} em inglês é "${num.en}".`,
            difficulty: 'easy',
          };
        });
      }

      const engAnimals = [
        { pt: 'Cachorro', en: 'Dog', wr: ['Cat', 'Fish', 'Bird'] },
        { pt: 'Gato', en: 'Cat', wr: ['Dog', 'Lion', 'Duck'] },
        { pt: 'Peixe', en: 'Fish', wr: ['Bird', 'Dog', 'Cat'] },
        { pt: 'Pássaro / Passarinho', en: 'Bird', wr: ['Fish', 'Dog', 'Cat'] },
        { pt: 'Leão', en: 'Lion', wr: ['Cat', 'Dog', 'Fish'] },
      ];
      for (const an of engAnimals) {
        generators.push(() => {
          const qText = `Como se diz "${an.pt}" em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_eng_an_${an.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Animals in English',
            question: qText,
            options: [an.en, an.wr[0], an.wr[1], an.wr[2]],
            correctIndex: 0,
            explanation: `"${an.pt}" em inglês é "${an.en}".`,
            difficulty: 'easy',
          };
        });
      }
    }
  }

  // Comprehensive subject-specific generators for 2º ano through Ensino Médio / ENEM
  if (subject === 'matematica') {
    const multPairs = [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 9], [6, 6], [7, 7], [8, 8], [5, 5], [3, 7], [4, 8]];
    for (const [x, y] of multPairs) {
      generators.push(() => {
        const prod = x * y;
        const qText = `Quanto é ${x} × ${y}?`;
        if (excludeTexts.has(qText.toLowerCase())) return null;
        const distSet = new Set<number>();
        for (const off of [2, -2, 4, -4, 3, -3, 6]) {
          const cand = prod + off;
          if (cand > 0 && cand !== prod && !distSet.has(cand)) {
            distSet.add(cand);
            if (distSet.size === 3) break;
          }
        }
        const dist = Array.from(distSet);
        return {
          id: `dyn_mat_mult_${x}_${y}_${Date.now()}`,
          subject: 'matematica',
          grade,
          topic: 'Multiplicação e Cálculo',
          question: qText,
          options: [`${prod}`, `${dist[0]}`, `${dist[1]}`, `${dist[2]}`],
          correctIndex: 0,
          explanation: `${x} multiplicado por ${y} resulta em ${prod}.`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'portugues') {
    const portTopics = [
      { q: `Na análise gramatical da Língua Portuguesa para o ${gradeLabel}, qual palavra funciona como núcleo do sujeito?`, a: 'O substantivo ou pronome substantivo', w: ['O adjetivo restritivo', 'O verbo transitivo', 'A conjunção coordenativa'] },
      { q: `Qual alternativa indica corretamente uma figura de linguagem baseada na aproximação de ideias opostas?`, a: 'Antítese ou Paradoxo', w: ['Metonímia simples', 'Aliteração consonantal', 'Onomatopeia'] },
    ];
    for (const pt of portTopics) {
      generators.push(() => {
        if (excludeTexts.has(pt.q.toLowerCase())) return null;
        return {
          id: `dyn_por_gen_${Date.now()}_${Math.random()}`,
          subject: 'portugues',
          grade,
          topic: 'Gramática e Análise Textual',
          question: pt.q,
          options: [pt.a, pt.w[0], pt.w[1], pt.w[2]],
          correctIndex: 0,
          explanation: `A resposta correta em Língua Portuguesa é "${pt.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'ciencias' || subject === 'biologia') {
    const bioGen = [
      { q: `Qual processo biológico converte gás carbônico e água em glicose e oxigênio nas plantas verdes?`, a: 'Fotossíntese', w: ['Respiração celular anaeróbica', 'Fermentação lática', 'Transpiração foliar'] },
      { q: `Na genética estudada no ${gradeLabel}, como são chamadas as diferentes formas de um mesmo gene que determinam uma característica?`, a: 'Alelos', w: ['Ribossomos', 'Cromátides-irmãs', 'Mutations aleatórias'] },
    ];
    for (const bg of bioGen) {
      generators.push(() => {
        if (excludeTexts.has(bg.q.toLowerCase())) return null;
        return {
          id: `dyn_bio_gen_${Date.now()}_${Math.random()}`,
          subject,
          grade,
          topic: 'Biologia e Ciências',
          question: bg.q,
          options: [bg.a, bg.w[0], bg.w[1], bg.w[2]],
          correctIndex: 0,
          explanation: `O conceito correto em ${subjName} é "${bg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'historia') {
    const histGen = [
      { q: `Qual foi o período histórico caracterizado pelo modo de produção feudal na Europa Ocidental?`, a: 'Idade Média', w: ['Antiguidade Clássica', 'Revolução Contemporânea', 'Período Neolítico'] },
      { q: `O movimento intelectual e científico do século XVIII que valorizava a razão contra o absolutismo chamou-se:`, a: 'Iluminismo', w: ['Escolástica medieval', 'Mercantilismo estatal', 'Feudalismo agrário'] },
    ];
    for (const hg of histGen) {
      generators.push(() => {
        if (excludeTexts.has(hg.q.toLowerCase())) return null;
        return {
          id: `dyn_hist_gen_${Date.now()}_${Math.random()}`,
          subject: 'historia',
          grade,
          topic: 'História Geral e do Brasil',
          question: hg.q,
          options: [hg.a, hg.w[0], hg.w[1], hg.w[2]],
          correctIndex: 0,
          explanation: `Historicamente, a alternativa correta é "${hg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'geografia') {
    const geoGen = [
      { q: `Como se denominam as linhas imaginárias horizontais traçadas paralelamente à Linha do Equador?`, a: 'Paralelos (Latitude)', w: ['Meridianos (Longitude)', 'Fusos horários', 'Coordenadas UTM'] },
      { q: `Qual bioma brasileiro é caracterizado por árvores de troncos tortuosos, casca grossa e clima com duas estações bem definidas?`, a: 'Cerrado', w: ['Mata de Araucárias', 'Pampa gaúcho', 'Floresta Amazônica'] },
    ];
    for (const gg of geoGen) {
      generators.push(() => {
        if (excludeTexts.has(gg.q.toLowerCase())) return null;
        return {
          id: `dyn_geo_gen_${Date.now()}_${Math.random()}`,
          subject: 'geografia',
          grade,
          topic: 'Geografia Física e Humana',
          question: gg.q,
          options: [gg.a, gg.w[0], gg.w[1], gg.w[2]],
          correctIndex: 0,
          explanation: `Na Geografia, a resposta correta é "${gg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'fisica') {
    const fisGen = [
      { q: `Qual é a unidade de medida da Força no Sistema Internacional (SI)?`, a: 'Newton (N)', w: ['Joule (J)', 'Watt (W)', 'Pascal (Pa)'] },
      { q: `O princípio que afirma que a energia total de um sistema isolado permanece constante é a:`, a: 'Conservação da Energia', w: ['Inércia absoluta', 'Atrito dinâmico', 'Indução eletromagnética'] },
    ];
    for (const fg of fisGen) {
      generators.push(() => {
        if (excludeTexts.has(fg.q.toLowerCase())) return null;
        return {
          id: `dyn_fis_gen_${Date.now()}_${Math.random()}`,
          subject: 'fisica',
          grade,
          topic: 'Física Geral',
          question: fg.q,
          options: [fg.a, fg.w[0], fg.w[1], fg.w[2]],
          correctIndex: 0,
          explanation: `Na Física, a alternativa correta é "${fg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'quimica') {
    const quiGen = [
      { q: `Qual é a ligação química formada pela partilha de pares de elétrons entre átomos de ametais?`, a: 'Ligação Covalente', w: ['Ligação Iônica', 'Ligação Metálica', 'Ponte de Hidrogênio'] },
      { q: `Uma solução que possui concentração máxima de soluto dissolvido a uma dada temperatura é chamada de:`, a: 'Saturada', w: ['Insaturada', 'Supersaturada instável', 'Diluída'] },
    ];
    for (const qg of quiGen) {
      generators.push(() => {
        if (excludeTexts.has(qg.q.toLowerCase())) return null;
        return {
          id: `dyn_qui_gen_${Date.now()}_${Math.random()}`,
          subject: 'quimica',
          grade,
          topic: 'Química Geral',
          question: qg.q,
          options: [qg.a, qg.w[0], qg.w[1], qg.w[2]],
          correctIndex: 0,
          explanation: `Em Química, o conceito correto é "${qg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'ingles') {
    const engGen = [
      { q: `What is the past tense of the irregular verb "to go" in English?`, a: 'Went', w: ['Goed', 'Gone', 'Going'] },
      { q: `Which modal verb expresses ability or capacity in English?`, a: 'Can', w: ['Must', 'Should', 'Might'] },
      { q: `In English, what does the false friend "ACTUALLY" mean?`, a: 'Na verdade / Realmente', w: ['Atualmente', 'Hoje em dia', 'No futuro'] },
      { q: `Choose the correct 3rd person form: "He _______ (study) every day."`, a: 'Studies', w: ['Study', 'Studys', 'Studying'] },
    ];
    for (const eg of engGen) {
      generators.push(() => {
        if (excludeTexts.has(eg.q.toLowerCase())) return null;
        return {
          id: `dyn_eng_gen_${Date.now()}_${Math.random()}`,
          subject: 'ingles',
          grade,
          topic: 'English Grammar',
          question: eg.q,
          options: [eg.a, eg.w[0], eg.w[1], eg.w[2]],
          correctIndex: 0,
          explanation: `The correct English grammar choice is "${eg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'espanhol') {
    const espGen = [
      { q: `¿Cómo se dice "Muito obrigado" en español?`, a: 'Muchas gracias', w: ['De nada', 'Por favor', 'Hasta luego'] },
      { q: `¿Cuál es el pronombre de segunda persona del singular informal en español?`, a: 'Tú', w: ['Usted', 'Vosotros', 'Ellos'] },
      { q: `En español, ¿qué significa el falso cognado (heterosemántico) "BORRADOR"?`, a: 'Apagador / Borracha escolar', w: ['Rascunho de papel', 'Ladrão de casas', 'Bêbado'] },
      { q: `¿Cuál es la forma correcta del verbo "SER" para "Nosotros" en presente?`, a: 'Somos', w: ['Son', 'Sois', 'Eres'] },
      { q: `¿Cómo se dice "Cachorro" (filhote de cão) en español?`, a: 'Perro (o cachorro para filhotes em geral)', w: ['Gato', 'Pájaro', 'Caballo'] },
    ];
    for (const eg of espGen) {
      generators.push(() => {
        if (excludeTexts.has(eg.q.toLowerCase())) return null;
        return {
          id: `dyn_esp_gen_${Date.now()}_${Math.random()}`,
          subject: 'espanhol',
          grade,
          topic: 'Língua Espanhola',
          question: eg.q,
          options: [eg.a, eg.w[0], eg.w[1], eg.w[2]],
          correctIndex: 0,
          explanation: `Em espanhol, a resposta correta é "${eg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'italiano') {
    const itaGen = [
      { q: `Come si dice "Muito obrigado" in italiano?`, a: 'Grazie mille', w: ['Prego', 'Per favore', 'Arrivederci'] },
      { q: `Qual è la resposta corretta quando qualcuno ti dice "Grazie!" in italiano?`, a: 'Prego!', w: ['Ciao!', 'Scusa!', 'Piacere!'] },
      { q: `Qual è la coniugazione del verbo ESSERE per "Io" in italiano?`, a: 'Io sono', w: ['Io sei', 'Io è', 'Io siamo'] },
      { q: `Come si dice "Bom dia" e "Boa noite" in italiano?`, a: 'Buongiorno e Buonanotte', w: ['Ciao e Addio', 'Buona sera e Salve', 'Per favore e Prego'] },
      { q: `In italiano, come si dice "Gato" e "Cachorro"?`, a: 'Gatto e Cane', w: ['Cane e Cavallo', 'Uccello e Pesce', 'Topo e Farfalla'] },
    ];
    for (const ig of itaGen) {
      generators.push(() => {
        if (excludeTexts.has(ig.q.toLowerCase())) return null;
        return {
          id: `dyn_ita_gen_${Date.now()}_${Math.random()}`,
          subject: 'italiano',
          grade,
          topic: 'Língua Italiana',
          question: ig.q,
          options: [ig.a, ig.w[0], ig.w[1], ig.w[2]],
          correctIndex: 0,
          explanation: `In italiano, a resposta correta é "${ig.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'xadrez') {
    const xadGen = [
      { q: `Quantos pontos de valor relativo vale a Dama (Rainha) no xadrez?`, a: '9 pontos', w: ['5 pontos', '3 pontos', '1 ponto'] },
      { q: `Qual peça do xadrez é a única capaz de pular outras peças no tabuleiro?`, a: 'O Cavalo', w: ['A Torre', 'O Bispo', 'O Peão'] },
      { q: `No xadrez, o que chamamos de "Garfo"?`, a: 'Uma peça que ataca duas ou mais peças adversárias ao mesmo tempo', w: ['Um peão que vira dama', 'Um empate por falta de lances', 'A saída do rei para o centro'] },
      { q: `Qual lance especial envolve o Rei andando duas casas em direção à Torre?`, a: 'Roque', w: ['En Passant', 'Promoção', 'Cravada'] },
      { q: `Quantas casas no total tem um tabuleiro de xadrez?`, a: '64 casas (8x8)', w: ['32 casas', '100 casas', '48 casas'] },
      { q: `O que acontece no xadrez se um jogador não está em xeque mas não tem lances legais?`, a: 'Empate por afogamento (stalemate)', w: ['Vitória das brancas', 'Vitória das pretas', 'O jogador perde a vez'] },
    ];
    for (const xg of xadGen) {
      generators.push(() => {
        if (excludeTexts.has(xg.q.toLowerCase())) return null;
        return {
          id: `dyn_xad_gen_${Date.now()}_${Math.random()}`,
          subject: 'xadrez',
          grade,
          topic: 'Xadrez',
          question: xg.q,
          options: [xg.a, xg.w[0], xg.w[1], xg.w[2]],
          correctIndex: 0,
          explanation: `No xadrez, a resposta correta é "${xg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  }

  // Shuffle generators and collect unique questions
  const shuffledGens = [...generators].sort(() => Math.random() - 0.5);

  for (const gen of shuffledGens) {
    if (result.length >= count) break;
    const q = gen();
    if (q && !excludeTexts.has(q.question.toLowerCase())) {
      excludeTexts.add(q.question.toLowerCase());
      result.push(shuffleQuestionOptions(q));
    }
  }

  // GUARANTEED UNIVERSAL FALLBACK: If still need more questions to reach count, generate procedural real subject-matter questions
  const subjectSpecificContentTemplates: Record<string, { q: string; opts: string[]; exp: string; topic: string }[]> = {
    matematica: [
      {
        q: 'Em uma classe com 30 alunos, 60% são meninas. Quantos meninos há nessa classe?',
        opts: ['12 meninos', '18 meninos', '15 meninos', '10 meninos'],
        exp: '60% de 30 = 18 meninas. Logo, os meninos são 30 - 18 = 12 meninos.',
        topic: 'Porcentagem Aplicada',
      },
      {
        q: 'Qual é o valor da expressão numérica: 18 + 6 ÷ 2 - 3 × 4?',
        opts: ['9', '15', '24', '0'],
        exp: 'Resolvendo divisões e multiplicações primeiro: 6 ÷ 2 = 3 e 3 × 4 = 12. Em seguida: 18 + 3 - 12 = 21 - 12 = 9.',
        topic: 'Expressões Numéricas',
      },
      {
        q: 'Um quadrado tem perímetro igual a 36 cm. Qual é a medida de sua área?',
        opts: ['81 cm²', '36 cm²', '72 cm²', '144 cm²'],
        exp: 'O lado do quadrado é 36 ÷ 4 = 9 cm. A área é Lado × Lado = 9 × 9 = 81 cm².',
        topic: 'Área e Perímetro',
      },
      {
        q: 'Qual é a fração irredutível equivalente a 24/36?',
        opts: ['2/3', '3/4', '4/6', '1/2'],
        exp: 'Dividindo numerador e denominador por 12 (MDC): 24÷12 = 2 e 36÷12 = 3, resultando em 2/3.',
        topic: 'Frações e Simplificação',
      },
    ],
    portugues: [
      {
        q: 'Assinale a alternativa em que a concordância verbal está de acordo com a norma-padrão:',
        opts: ['Havia muitas pessoas na fila do teatro.', 'Haviam muitas pessoas na fila do teatro.', 'Fazem dois meses que não o vejo.', 'Existia muitos problemas para resolver.'],
        exp: 'O verbo "haver" no sentido de "existir" é impessoal e fica sempre na 3ª pessoa do singular ("Havia muitas pessoas").',
        topic: 'Concordância Verbal',
      },
      {
        q: 'Na oração "O vento sussurrava segredos pelas folhas", qual figura de linguagem foi empregada?',
        opts: ['Personificação (Prosopopeia)', 'Metáfora', 'Hipérbole', 'Eufemismo'],
        exp: 'A personificação ou prosopopeia atribui ações ou sentimentos humanos a seres inanimados ("vento sussurrava").',
        topic: 'Figuras de Linguagem',
      },
      {
        q: 'Qual das alternativas contém apenas palavras proparoxítonas e, portanto, todas acentuadas?',
        opts: ['Lâmpada, pássaro, histórico', 'Café, cipó, maracujá', 'Automóvel, fácil, táxi', 'Caju, urubu, saci'],
        exp: 'Lâmpada, pássaro e histórico têm a antepenúltima sílaba tônica, sendo todas proparoxítonas obrigatóriamente acentuadas.',
        topic: 'Acentuação Gráfica',
      },
    ],
    ciencias: [
      {
        q: 'Qual é a função primordial da molécula de clorofila nas células das plantas verdes?',
        opts: ['Absorver a energia da luz solar para realizar a fotossíntese', 'Armazenar água durante os períodos de seca', 'Transportar nutrientes das raízes até as folhas', 'Proteger a planta contra pragas e insetos'],
        exp: 'A clorofila é o pigmento que absorve os fótons de luz solar para desencadear as reações químicas da fotossíntese.',
        topic: 'Fotossíntese e Botânica',
      },
      {
        q: 'Em um ecossistema equilibrado, qual é o papel desempenhado pelos organismos decompositores (fungos e bactérias)?',
        opts: ['Reciclar a matéria orgânica devolvendo nutrientes ao solo', 'Produzir oxigênio por meio da quimiossíntese', 'Atuar como consumidores primários exclusivos', 'Servir como predadores de topo na cadeia alimentar'],
        exp: 'Os decompositores decompõem a matéria orgânica morta, transformando-a em compostos minerais essenciais para os produtores.',
        topic: 'Cadeias e Teias Alimentares',
      },
    ],
    historia: [
      {
        q: 'Em que ano e por qual documento foi formalmente proclamada a Independência do Brasil em relação a Portugal?',
        opts: ['1822, com o Grito do Ipiranga por D. Pedro I', '1889, com o Marechal Deodoro da Fonseca', '1500, com a Carta de Pero Vaz de Caminha', '1808, com a chegada da Família Real'],
        exp: 'A Independência do Brasil foi proclamada em 7 de setembro de 1822 por D. Pedro I às margens do rio Ipiranga.',
        topic: 'Brasil Império e Independência',
      },
    ],
    geografia: [
      {
        q: 'Qual é o maior bioma em extensão territorial no Brasil, abrigando a maior bacia hidrográfica do planeta?',
        opts: ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Caatinga'],
        exp: 'O bioma Amazônia ocupa quase metade do território nacional e abriga a bacia do rio Amazonas.',
        topic: 'Biomas e Hidrografia do Brasil',
      },
    ],
    ingles: [
      {
        q: 'Choose the correct form of the verb: "She _____ to the library every Wednesday."',
        opts: ['goes', 'go', 'going', 'is go'],
        exp: 'Para a 3ª pessoa do singular (She/He/It) no Present Simple, acrescenta-se -es ao verbo "go" (goes).',
        topic: 'Simple Present Tense',
      },
      {
        q: 'Which of the following is the antonym (opposite) of the word "EXPENSIVE"?',
        opts: ['Cheap', 'Heavy', 'Dangerous', 'Quiet'],
        exp: '"Cheap" significa barato, que é o antônimo direto de "expensive" (caro).',
        topic: 'Vocabulary & Antonyms',
      },
      {
        q: 'Complete with the correct question word: "_____ is your favorite school subject?"',
        opts: ['What', 'Who', 'Where', 'When'],
        exp: 'Usa-se "What" (Qual / O que) para perguntar sobre coisas, objetos ou preferências.',
        topic: 'Wh- Questions',
      },
    ],
    biologia: [
      {
        q: 'Qual organela citoplasmática é conhecida como a "usina de energia" da célula responsável pela respiração celular?',
        opts: ['Mitocôndria', 'Complexo de Golgi', 'Ribossomo', 'Retículo Endoplasmático'],
        exp: 'As mitocôndrias produzem ATP através da respiração celular, fornecendo energia para a célula.',
        topic: 'Citologia e Organelas Celulares',
      },
      {
        q: 'No DNA, qual base nitrogenada sempre se emparelha especificamente com a Guanina por meio de pontes de hidrogênio?',
        opts: ['Citosina', 'Timina', 'Adenina', 'Uracila'],
        exp: 'Na estrutura em dupla hélice do DNA, a Guanina se liga à Citosina (G-C) e a Adenina à Timina (A-T).',
        topic: 'Genética Molecular e DNA',
      },
    ],
    fisica: [
      {
        q: 'De acordo com a Primeira Lei de Newton (Lei da Inércia), um corpo em repouso ou em movimento retilíneo uniforme tende a:',
        opts: ['Manter seu estado de movimento se a força resultante for nula', 'Acelerar constantemente na direção da gravidade', 'Parar imediatamente devido à perda de massa', 'Aumentar sua velocidade com o tempo'],
        exp: 'A Lei da Inércia afirma que na ausência de forças resultantes externas, o corpo mantém velocidade constante.',
        topic: 'Leis de Newton e Cinemática',
      },
      {
        q: 'Qual é a velocidade média de um veículo que percorre uma distância de 150 km em 2 horas?',
        opts: ['75 km/h', '100 km/h', '50 km/h', '60 km/h'],
        exp: 'Velocidade média = Distância / Tempo = 150 km / 2 h = 75 km/h.',
        topic: 'Velocidade Média',
      },
    ],
    quimica: [
      {
        q: 'Qual é a fórmula química da água e que tipo de ligação une seus átomos de hidrogênio e oxigênio?',
        opts: ['H₂O, com ligações covalentes', 'NaCl, com ligações iônicas', 'CO₂, com ligações metálicas', 'H₂O₂, com ligações iônicas'],
        exp: 'A água (H₂O) é formada pelo compartilhamento de elétrons (ligações covalentes) entre o oxigênio e o hidrogênio.',
        topic: 'Ligações Químicas e Moléculas',
      },
    ],
    artes: [
      {
        q: 'Quais são as três cores primárias no sistema tradicional de artes plásticas (pigmento)?',
        opts: ['Vermelho, azul e amarelo', 'Verde, laranja e roxo', 'Preto, branco e cinza', 'Azul, amarelo e verde'],
        exp: 'As cores primárias são cores puras que não resultam da mistura de outras: vermelho, azul e amarelo.',
        topic: 'Teoria das Cores',
      },
    ],
    educacao_fisica: [
      {
        q: 'Qual capacidade física é desenvolvida prioritariamente em corridas de longa distância e maratonas?',
        opts: ['Resistência cardiorrespiratória', 'Força explosiva pura', 'Flexibilidade passiva', 'Velocidade de sprint'],
        exp: 'Corridas contínuas de longa duração exigem e aprimoram a resistência cardiorrespiratória e aeróbica do organismo.',
        topic: 'Capacidades Físicas e Saúde',
      },
    ],
    filosofia: [
      {
        q: 'Qual filósofo grego é famoso pela máxima "Conhece-te a ti mesmo" e pelo método da Maiêutica?',
        opts: ['Sócrates', 'Aristóteles', 'Platão', 'Heráclito'],
        exp: 'Sócrates usava a maiêutica (parto das ideias) para ajudar os interlocutores a buscarem o autoconhecimento.',
        topic: 'Filosofia Clássica',
      },
    ],
    sociologia: [
      {
        q: 'O conceito sociológico de "fato social", dotado de coerção, exterioridade e generalidade, foi desenvolvido por:',
        opts: ['Émile Durkheim', 'Max Weber', 'Karl Marx', 'Auguste Comte'],
        exp: 'Émile Durkheim formulou as regras do método sociológico definindo fatos sociais como coercitivos e exteriores.',
        topic: 'Fundamentos da Sociologia',
      },
    ],
  };

  let fallbackIdx = 0;
  while (result.length < count) {
    const subStr = String(subject);
    const templates =
      subjectSpecificContentTemplates[subStr] ||
      (subStr === 'ciencias' || subStr === 'biologia' || subStr === 'fisica' || subStr === 'quimica'
        ? subjectSpecificContentTemplates.ciencias
        : subStr === 'historia' || subStr === 'geografia' || subStr === 'filosofia' || subStr === 'sociologia'
        ? subjectSpecificContentTemplates.historia
        : subStr === 'ingles'
        ? subjectSpecificContentTemplates.ingles
        : subStr === 'matematica'
        ? subjectSpecificContentTemplates.matematica
        : subjectSpecificContentTemplates.portugues);
    const item = templates[fallbackIdx % templates.length];
    const qText = `${item.q}${fallbackIdx >= templates.length ? ` (Var. ${Math.floor(fallbackIdx / templates.length) + 1})` : ''}`;

    if (!excludeTexts.has(qText.toLowerCase())) {
      excludeTexts.add(qText.toLowerCase());
      result.push({
        id: `dyn_fallback_${subject}_${grade}_${Date.now()}_${fallbackIdx}_${Math.random()}`,
        subject,
        grade,
        topic: item.topic,
        question: qText,
        options: item.opts,
        correctIndex: 0,
        explanation: item.exp,
        difficulty: 'medium',
      });
    }
    fallbackIdx++;
    if (fallbackIdx > 50) break;
  }

  return shuffleQuestionsList(result);
}

// Function to get questions for matches with difficulty support and randomized options
export function getQuestionsForMatch(
  grade: GradeLevel,
  count: number = 5,
  difficulty?: 'easy' | 'medium' | 'hard',
  subject?: SubjectId | 'all'
): Question[] {
  const pool = CURRICULUM_QUESTIONS_POOL[grade] || CURRICULUM_QUESTIONS_POOL['1_fund'] || [];
  
  let filtered = [...pool];

  if (subject && subject !== 'all') {
    filtered = pool.filter((q) => q.subject === subject);
  }

  if (difficulty) {
    const matched = filtered.filter((q) => q.difficulty === difficulty);
    if (matched.length > 0) {
      filtered = matched;
    }
  }

  // Shuffle and deduplicate
  const seenTexts = new Set<string>();
  const uniqueSelected: Question[] = [];

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    const normalized = q.question.trim().toLowerCase();
    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      uniqueSelected.push(q);
      if (uniqueSelected.length >= count) break;
    }
  }

  // If we still need more questions to reach count, generate procedural unique questions
  if (uniqueSelected.length < count) {
    const needed = count - uniqueSelected.length;
    if (subject && subject !== 'all') {
      const dynamicQs = generateProceduralQuestions(grade, subject, needed, seenTexts);
      uniqueSelected.push(...dynamicQs);
    } else {
      // Pick across all subjects of this grade for a rich "tudo da série" pool
      const gradeSubjects = getSubjectsForGrade(grade);
      if (gradeSubjects.length > 0) {
        let subjIdx = 0;
        let remainingNeeded = needed;
        while (remainingNeeded > 0 && subjIdx < gradeSubjects.length * 3) {
          const currentSubj = gradeSubjects[subjIdx % gradeSubjects.length];
          const batchCount = Math.min(remainingNeeded, 3);
          const dynamicQs = generateProceduralQuestions(grade, currentSubj.id, batchCount, seenTexts);
          if (dynamicQs.length > 0) {
            uniqueSelected.push(...dynamicQs);
            remainingNeeded -= dynamicQs.length;
          }
          subjIdx++;
        }
      }
    }
  }

  // Double check invariant: if subject was specified (and not 'all'), never return questions of other subjects
  let finalResult = uniqueSelected;
  if (subject && subject !== 'all') {
    finalResult = finalResult.filter((q) => q.subject === subject);
    if (finalResult.length < count) {
      const extraNeeded = count - finalResult.length;
      finalResult.push(...generateProceduralQuestions(grade, subject, extraNeeded, seenTexts));
    }
  }

  return shuffleQuestionsList(finalResult);
}

/**
 * Returns a balanced, 100% UNIQUE 10-question set:
 * - 5 questions from the previous grade (foundation/revision)
 * - 5 questions from the user's current grade (target curriculum)
 * GUARANTEES: NEVER repeats a question within the session.
 */
export function getGradeAndRevisionQuestions(
  grade: GradeLevel,
  subject?: SubjectId | 'all',
  previousCount: number = 5,
  currentCount: number = 5,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question[] {
  const previousGrade = GRADE_LABELS[grade]?.previousGrade;
  const currentGradeLabel = GRADE_LABELS[grade]?.short || 'Série Atual';
  const previousGradeLabel = previousGrade ? GRADE_LABELS[previousGrade]?.short : 'Base Inicial';

  const usedQuestionTexts = new Set<string>();

  const getUniqueFromPool = (targetGrade: GradeLevel, countNeeded: number): Question[] => {
    const rawPool = CURRICULUM_QUESTIONS_POOL[targetGrade] || CURRICULUM_QUESTIONS_POOL['1_fund'] || [];
    let candidates = [...rawPool];

    if (subject && subject !== 'all') {
      const bySubj = rawPool.filter((q) => q.subject === subject);
      if (bySubj.length > 0) {
        candidates = bySubj;
      }
    }

    if (difficulty) {
      const byDiff = candidates.filter((q) => q.difficulty === difficulty);
      if (byDiff.length > 0) candidates = byDiff;
    }

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const chosen: Question[] = [];

    for (const q of shuffled) {
      const normalized = q.question.trim().toLowerCase();
      if (!usedQuestionTexts.has(normalized)) {
        usedQuestionTexts.add(normalized);
        chosen.push(q);
        if (chosen.length >= countNeeded) break;
      }
    }

    return chosen;
  };

  // 1. Gather 5 unique revision questions
  const prevTargetGrade = previousGrade || '1_fund';
  const selectedPrevRaw = getUniqueFromPool(prevTargetGrade, previousCount);
  
  // If fewer than requested, generate unique procedural questions to fill to 5
  if (selectedPrevRaw.length < previousCount) {
    const needed = previousCount - selectedPrevRaw.length;
    const targetSubj = subject && subject !== 'all' ? subject : 'matematica';
    const dynamic = generateProceduralQuestions(prevTargetGrade, targetSubj, needed, usedQuestionTexts);
    selectedPrevRaw.push(...dynamic);
  }

  const selectedPrev: Question[] = selectedPrevRaw.map((q, idx) => ({
    ...q,
    id: `rev_${q.id || idx}_${Date.now()}_${idx}`,
    gradeOriginLabel: previousGrade ? `Revisão: ${previousGradeLabel}` : `Base Inicial (${currentGradeLabel})`,
  }));

  // 2. Gather 5 unique current grade questions
  const selectedCurrRaw = getUniqueFromPool(grade, currentCount);

  // If fewer than requested, generate unique procedural questions to fill to 5
  if (selectedCurrRaw.length < currentCount) {
    const needed = currentCount - selectedCurrRaw.length;
    const targetSubj = subject && subject !== 'all' ? subject : 'matematica';
    const dynamic = generateProceduralQuestions(grade, targetSubj, needed, usedQuestionTexts);
    selectedCurrRaw.push(...dynamic);
  }

  const selectedCurr: Question[] = selectedCurrRaw.map((q, idx) => ({
    ...q,
    id: `cur_${q.id || idx}_${Date.now()}_${idx}`,
    gradeOriginLabel: `Conteúdo da Série: ${currentGradeLabel}`,
  }));

  const combined = shuffleQuestionsList([...selectedPrev, ...selectedCurr]);

  // Invariant assertion: if a subject was specified, NEVER allow questions of other subjects
  if (subject && subject !== 'all') {
    return combined.filter((q) => q.subject === subject);
  }

  return combined;
}

/**
 * Provides a dedicated, age-appropriate fallback lesson with BNCC-aligned theory,
 * keypoints, practical example, and 10 questions when offline or generating dynamically.
 */
function internalGetFallbackLesson(grade: GradeLevel, subjectId: SubjectId): TopicLesson {
  const subjInfo = SUBJECTS.find((s) => s.id === subjectId);
  const subjectName = subjInfo?.name || 'Estudos';
  const gradeLabel = GRADE_LABELS[grade]?.short || 'Série';

  const questions = getGradeAndRevisionQuestions(grade, subjectId, 5, 5);

  // Subject-specific rich curriculum content generator for fallbacks:
  if (subjectId === 'matematica') {
    if (grade === '1_fund') {
      return {
        id: `fb_mat_${grade}`,
        subject: 'matematica',
        grade,
        title: 'Números, Contagem e Adição até 10',
        summary: 'Aprenda a contar de 1 até 10, juntar quantidades simples e reconhecer quem tem mais ou menos.',
        detailedExplanation:
          'A matemática começa na contagem dos objetos ao nosso redor! Contamos nos dedinhos: 1, 2, 3, 4, 5, 6, 7, 8, 9 e 10. A adição (+) é a ação de juntar ou somar: se você tem 3 carrinhos e ganha mais 2, juntamos tudo para obter 5 carrinhos. A subtração (-) é a ação de tirar: se temos 4 maçãs e comemos 1, sobram 3 maçãs. Saber comparar quantidades nos ajuda a ver qual grupo é maior ou menor.',
        keyPoints: [
          'Contagem nos dedos de 1 a 10 com atenção.',
          'Somar (+) significa juntar ou acrescentar mais objetos.',
          'Subtrair (-) significa tirar, comer ou diminuir.',
          'Formas geométricas: o círculo é redondinho e o quadrado tem 4 lados iguais.',
        ],
        example: 'Se você tem 4 lápis de cor no estojo e ganha mais 3, você junta: 4 + 3 = 7 lápis de cor no total!',
        practiceQuestions: questions,
      };
    }
    if (['2_fund', '3_fund', '4_fund', '5_fund'].includes(grade)) {
      return {
        id: `fb_mat_${grade}`,
        subject: 'matematica',
        grade,
        title: 'Multiplicação, Divisão e Operações Fundamentais',
        summary: 'Aprenda o que é multiplicação, tabuada, divisão e como armar e resolver as contas passo a passo.',
        detailedExplanation:
          'A Multiplicação é a operação que simplifica a soma de parcelas iguais. Por exemplo, em vez de somar 4 + 4 + 4 + 4 + 4, fazemos 5 × 4 = 20. Os números que multiplicamos são chamados de fatores e o resultado é o produto. Na Divisão, repartimos uma quantidade em partes iguais: 20 ÷ 4 = 5. Para armar a conta de multiplicação com mais de um dígito, alinhamos as ordens (unidades com unidades, dezenas com dezenas), multiplicamos e somamos o valor que "sobe" (vai um) para a coluna seguinte.',
        keyPoints: [
          'Multiplicação é soma de parcelas repetidas: 3 × 6 = 6 + 6 + 6 = 18.',
          'Ordem dos fatores: mudar a ordem não altera o resultado (ex: 4 × 7 = 28 e 7 × 4 = 28).',
          'Regra do "Vai Um": o dígito da dezena sobe para ser somado na próxima multiplicação.',
          'Divisão é a operação inversa da multiplicação (se 6 × 5 = 30, então 30 ÷ 5 = 6).',
        ],
        example:
          'Problema: Uma estante tem 12 prateleiras, e cada prateleira tem 8 livros. Quantos livros há no total?\nSolução: Multiplicamos 12 × 8. Primeiro fazemos 8 × 2 = 16 (fica 6 e sobe 1). Depois 8 × 1 = 8 + 1 = 9. Resposta: 96 livros.',
        practiceQuestions: questions,
      };
    }
    return {
      id: `fb_mat_${grade}`,
      subject: 'matematica',
      grade,
      title: 'Álgebra, Equações, Frações e Geometria',
      summary: 'Resumo teórico com conceitos, fórmulas e regras de resolução para equações, proporções e cálculos matemáticos.',
      detailedExplanation:
        'A Matemática no Ensino Fundamental II e Médio conecta números, letras e formas geométricas. Em Álgebra, usamos letras (incógnitas como x) para representar valores desconhecidos. Para resolver uma equação de 1º grau (ex: 2x + 4 = 10), isolamos a incógnita invertendo as operações: o +4 passa como -4 (2x = 6) e o 2 que multiplica passa dividindo (x = 3). Em Frações e Porcentagem, calculamos frações de quantidades e aplicamos a regra de três para proporções diretas e inversas.',
      keyPoints: [
        'Equações de 1º grau: isole a incógnita x invertendo os sinais dos termos (+ vira - e × vira ÷).',
        'Frações: para somar frações com denominadores diferentes, use o MMC.',
        'Porcentagem: calcular 20% de um valor é multiplicar por 20 e dividir por 100 (ou multiplicar por 0,2).',
        'Geometria: Área do retângulo = Base × Altura; Área do triângulo = (Base × Altura) ÷ 2.',
      ],
      example:
        'Problema: Resolva a equação 3x + 15 = 45.\nSolução Passo a Passo:\n1. Passe o +15 para o outro lado subtraindo: 3x = 45 - 15 -> 3x = 30.\n2. Passe o 3 dividindo: x = 30 ÷ 3 -> x = 10.\nResposta final: x = 10.',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'portugues') {
    return {
      id: `fb_por_${grade}`,
      subject: 'portugues',
      grade,
      title: 'Gramática, Ortografia e Interpretação de Texto',
      summary: 'Aprenda as regras de concordância, classes gramaticais, pontuação e estratégias de leitura.',
      detailedExplanation:
        'A Língua Portuguesa organiza a comunicação através de regras gramaticais e expressividade. As classes de palavras incluem Substantivos (dão nome aos seres), Adjetivos (caracterizam), Verbos (indicam ações ou estados) e Pronomes. Na Concordância Verbal, o verbo sempre concorda em número e pessoa com o sujeito (ex: "Os alunos estudaram", e não "Os alunos estudou"). Na pontuação, a vírgula separa elementos de uma lista ou orações explicativas, e o ponto final conclui pensamentos.',
      keyPoints: [
        'Concordância Verbal: Sujeito no plural exige verbo no plural.',
        'Pontuação: Nunca separe o sujeito do seu verbo com vírgula!',
        'Uso dos Porquês: "Por que" (pergunta), "Porque" (resposta), "Por quê" (fim de frase), "Porquê" (substantivo com artigo).',
        'Interpretação: Leia o texto identificando a ideia central antes de analisar as alternativas.',
      ],
      example:
        'Exemplo de Concordância:\nIncorreto: "Fazem dois anos que não viajo."\nCorreto: "Faz dois anos que não viajo." (O verbo fazer no sentido de tempo decorrido é impessoal e fica no singular!).',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'ciencias' || subjectId === 'biologia') {
    return {
      id: `fb_cie_${grade}`,
      subject: subjectId,
      grade,
      title: 'Seres Vivos, Corpo Humano e Ecossistemas',
      summary: 'Compreenda a organização celular, sistemas do corpo, cadeias alimentares e sustentabilidade.',
      detailedExplanation:
        'As Ciências da Natureza e a Biologia investigam a vida e as interações no planeta. A Célula é a unidade básica de todos os seres vivos, contendo membrana, citoplasma e material genético (DNA). No corpo humano, células semelhantes formam tecidos, que formam órgãos e sistemas (como o sistema digestório, respiratório e circulatório). Nos ecossistemas, a energia flui dos produtores (plantas que fazem fotossíntese) para os consumidores e decompositores.',
      keyPoints: [
        'Fotossíntese: Plantas usam luz do sol, água e gás carbônico para produzir glicose e oxigênio.',
        'Célula: Núcleo guarda o DNA, mitocôndria produz energia celular.',
        'Sistema Circulatório: O coração bombeia o sangue oxigenado pelas artérias para todo o corpo.',
        'Cadeia Alimentar: Produtores -> Consumidores Primários (herbívoros) -> Consumidores Secundários.',
      ],
      example:
        'Exemplo de Cadeia Alimentar:\nCapim (Produtor) -> Gafanhoto (Consumidor Primário) -> Sapo (Consumidor Secundário) -> Cobra (Consumidor Terciário) -> Fungos/Bactérias (Decompositores).',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'historia') {
    return {
      id: `fb_his_${grade}`,
      subject: 'historia',
      grade,
      title: 'Sociedade, Cidadania e Transformações Históricas',
      summary: 'Entenda os grandes acontecimentos históricos, fontes históricas e a formação da sociedade brasileira e mundial.',
      detailedExplanation:
        'A História é a ciência que investiga as ações humanas ao longo do tempo. Estudamos as sociedades através de Fontes Históricas: documentos escritos, fósseis, fotos, monumentos e relatos orais. Compreender fatos como a formação das primeiras civilizações, a colonização do Brasil, a abolição da escravidão e a Proclamação da República nos permite entender os direitos de cidadania e os desafios da nossa sociedade atual.',
      keyPoints: [
        'Fontes Históricas: Vestígios deixados pelo ser humano (escritos, orais, visuais e materiais).',
        'Tempo Histórico: Mudanças e permanências nos costumes e na política através dos séculos.',
        'Cidadania: Conjunto de direitos civis, políticos e sociais conquistados ao longo da história.',
        'Brasil Colônia e Império: A transição de colônia portuguesa para nação independente.',
      ],
      example:
        'Exemplo Histórico:\nA Independência do Brasil ocorreu em 7 de setembro de 1822 por D. Pedro I, marcando o fim do pacto colonial e o início do Império do Brasil.',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'geografia') {
    return {
      id: `fb_geo_${grade}`,
      subject: 'geografia',
      grade,
      title: 'Espaço Geográfico, Clima, Relevo e Biomas',
      summary: 'Aprenda sobre cartografia, relevo, hidrografia, regiões brasileiras e dinâmica da população.',
      detailedExplanation:
        'A Geografia estuda a relação entre a sociedade e a natureza no espaço geográfico. Os mapas utilizam elementos fundamentais: Título, Escala, Legenda e Rosa dos Ventos. O relevo terrestre é moldado por agentes internos (tectonismo, vulcões) e externos (vento, chuva, rios). O Brasil possui seis grandes biomas: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal, cada um com clima e biodiversidade específicos.',
      keyPoints: [
        'Escala Cartográfica: Indica quantas vezes a realidade foi reduzida no mapa.',
        'Biomas do Brasil: Amazônia (maior floresta tropical), Cerrado (savana rica em nascentes), Caatinga (semiárido).',
        'Coordenadas Geográficas: Latitude (linhas paralelas ao Equador) e Longitude (Meridiano de Greenwich).',
        'Urbanização e Meio Ambiente: Crescimento das cidades e necessidade de sustentabilidade.',
      ],
      example:
        'Exemplo de Clima e Relevo:\nA região Nordeste do Brasil abriga o Sertão com clima semiárido e vegetação adaptada à seca (como cactos com espinhos que evitam a perda de água).',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'fisica') {
    return {
      id: `fb_fis_${grade}`,
      subject: 'fisica',
      grade,
      title: 'Mecânica, Velocidade Média e Leis de Newton',
      summary: 'Aprenda os princípios do movimento, aceleração, forças e energia.',
      detailedExplanation:
        'A Física investiga as leis fundamentais que regem o universo e os movimentos. A Velocidade Média é a razão entre a distância percorrida e o tempo gasto: Vm = ΔS / Δt. As Três Leis de Newton explicam as forças: 1ª Lei (Inércia - um corpo tende a manter seu estado), 2ª Lei (F = m × a - a força resultante é massa vezes aceleração) e 3ª Lei (Ação e Reação - para toda força aplicada existe outra de igual intensidade e sentido oposto).',
      keyPoints: [
        'Velocidade Média: Vm = ΔS / Δt (Distância dividida pelo Tempo).',
        'Conversão de Unidades: De km/h para m/s, divida por 3,6; de m/s para km/h, multiplique por 3,6.',
        '1ª Lei de Newton (Inércia): Cinto de segurança nos protege da tendência de continuar em movimento.',
        '2ª Lei de Newton: Força = Massa × Aceleração (F = m × a).',
      ],
      example:
        'Problema: Um carro percorre 180 km em 2 horas. Qual sua velocidade média?\nSolução: Vm = 180 km ÷ 2 h = 90 km/h. Convertendo para m/s: 90 ÷ 3,6 = 25 m/s.',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'quimica') {
    return {
      id: `fb_qui_${grade}`,
      subject: 'quimica',
      grade,
      title: 'Estrutura Atômica, Tabela Periódica e Ligações Químicas',
      summary: 'Aprenda o que são átomos, elementos químicos, ligações e transformações da matéria.',
      detailedExplanation:
        'A Química estuda a matéria, suas propriedades e suas transformações. O Átomo é composto por um núcleo com prótons (positivos) e nêutrons (neutros), rodeado pela eletrosfera com elétrons (negativos). Na Tabela Periódica, os elementos estão organizados em ordem crescente de número atômico (Z = prótons). Nas reações químicas, a Lei de Lavoisier afirma que na natureza nada se cria, nada se perde, tudo se transforma: a massa dos reagentes é igual à massa dos produtos.',
      keyPoints: [
        'Número Atômico (Z): Quantidade de prótons no núcleo do átomo.',
        'Número de Massa (A): Soma de Prótons + Nêutrons (A = Z + n).',
        'Estados Físicos: Sólido, Líquido e Gasoso (Mudanças: Fusão, Ebulição, Condensação, Solidificação).',
        'Lei da Conservação das Massas (Lavoisier): Massa dos Reagentes = Massa dos Produtos.',
      ],
      example:
        'Exemplo de Reação Balanceada:\n2 H₂ + O₂ -> 2 H₂O (4 átomos de hidrogênio e 2 átomos de oxigênio antes e depois da reação!).',
      practiceQuestions: questions,
    };
  }

  if (subjectId === 'espanhol') {
    return {
      id: `fb_esp_${grade}`,
      subject: 'espanhol',
      grade,
      title: '🟢 Espanhol: Começando do Zero (Alfabeto, Saudações e Primeiras Palavras)',
      summary: 'Trilha do Zero Absoluto: Aprenda as primeiras saudações, sons do alfabeto, números básicos e como se apresentar em espanhol sem pré-requisitos.',
      detailedExplanation:
        'Bem-vindo ao Espanhol do Zero! Como a maioria dos alunos não tem aula de espanhol na escola, começamos aqui do zero absoluto. As saudações principais são: "¡Hola!" (Olá/Oi), "¡Buenos días!" (Bom dia), "¡Buenas tardes!" (Boa tarde) e "¡Buenas noches!" (Boa noite). Para se apresentar, dizemos: "Me llamo..." ou "Soy...". Os pronomes básicos são: Yo (Eu), Tú (Você), Él/Ella (Ele/Ela) e Nosotros (Nós). Diferenças de pronúncia importantes: a letra Ñ soa como NH (España = Espanha), o J e o G antes de E/I soam raspados na garganta (como RR em português, ex: jamón), e não existe a letra Ç no alfabeto espanhol. Falsos amigos: "Embarazada" é Grávida, "Apellido" é Sobrenome e "Propina" é Gorjeta!',
      keyPoints: [
        '¡Hola! = Oi / Olá | ¡Buenos días! = Bom dia | ¡Hasta luego! = Até logo.',
        '¿Cómo te llamas? -> Me llamo... (Como você se chama? -> Eu me chamo...).',
        'Pronúncia: "Ñ" soa como "NH" (ex: Niño = Menino). "J" soa como "RR" forte.',
        'Números de 1 a 5: Uno (1), Dos (2), Tres (3), Cuatro (4), Cinco (5).',
        'Falsos Cognatos: "Apellido" significa sobrenome, não apelido carinhoso!',
      ],
      example:
        'Diálogo do Zero:\n— ¡Hola! ¿Cómo te llamas?\n— ¡Buenos días! Me llamo Sofia, soy de Brasil y estudio español desde cero.',
      practiceQuestions: [
        {
          id: 'q_esp_zero_1',
          subject: 'espanhol',
          grade,
          topic: 'Saudações do Zero',
          question: 'Como dizemos "Bom dia" em espanhol ao encontrar alguém pela manhã?',
          options: ['¡Buenos días!', '¡Buenas mañanas!', '¡Buen día sol!', '¡Hola día!'],
          correctIndex: 0,
          explanation: 'Em espanhol a saudação correta da manhã é "¡Buenos días!" (sempre no plural).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_2',
          subject: 'espanhol',
          grade,
          topic: 'Verdadeiro ou Falso (Falsos Amigos)',
          question: 'VERDADEIRO OU FALSO: Em espanhol, a palavra "APELLIDO" significa apelido carinhoso.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 1,
          explanation: 'FALSO! "Apellido" em espanhol significa SOBRENOME da família. Apelido carinhoso em espanhol é "Apodo".',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_esp_zero_3',
          subject: 'espanhol',
          grade,
          topic: 'Pronúncia e Fala por Voz',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Como se diz "Olá, bom dia!" em espanhol?',
          options: ['¡Hola, buenos días!', '¡Hola, buenas tardes!', '¡Hola, buenas noches!', '¡Adiós, hasta luego!'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "¡Hola, buenos días!".',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['hola buenos dias', 'hola', 'buenos dias', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['¡Hola, buenos días!', '¡Hola, buenas tardes!', '¡Hola, buenas noches!', '¡Adiós, até logo!'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_4',
          subject: 'espanhol',
          grade,
          topic: 'Verdadeiro ou Falso (Pronúncia)',
          question: 'VERDADEIRO OU FALSO: A letra "Ñ" (como em España e Niño) tem som similar a "NH" do português.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! A letra "Ñ" tem o som idêntico ao "NH" da língua portuguesa (ex: España = Espanha, Baño = Banho).',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_esp_zero_5',
          subject: 'espanhol',
          grade,
          topic: 'Apresentação Básica',
          question: 'Para perguntar o nome de alguém em espanhol de forma informal, dizemos:',
          options: ['¿Cómo te llamas?', '¿De dónde eres tú?', '¿Qué hora es?', '¿Cómo estás tú?'],
          correctIndex: 0,
          explanation: '"¿Cómo te llamas?" significa "Como você se chama?". A resposta é "Me llamo..." (Eu me chamo...).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_6',
          subject: 'espanhol',
          grade,
          topic: 'Números do Zero',
          question: 'Como se escreve o número "3" e o número "4" em espanhol?',
          options: ['Tres e Cuatro', 'Tre e Quattro', 'Three e Four', 'Três e Quatro'],
          correctIndex: 0,
          explanation: 'Em espanhol: 1 = uno, 2 = dos, 3 = tres, 4 = cuatro, 5 = cinco.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_7',
          subject: 'espanhol',
          grade,
          topic: 'Verdadeiro ou Falso (Significado)',
          question: 'VERDADEIRO OU FALSO: Em espanhol, a frase "Muchas gracias" significa "Muito obrigado(a)".',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! "Muchas gracias" significa muito obrigado e a resposta comum é "De nada".',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_esp_zero_8',
          subject: 'espanhol',
          grade,
          topic: 'Fala e Pronúncia por Voz',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Como se diz "Muito obrigado" em espanhol?',
          options: ['Muchas gracias', 'De nada', 'Por favor', 'Hasta pronto'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Muchas gracias".',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['muchas gracias', 'gracias', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Muchas gracias', 'De nada', 'Por favor', 'Hasta pronto'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_9',
          subject: 'espanhol',
          grade,
          topic: 'Pronomes Básicos',
          question: 'Qual pronome em espanhol significa "Eu"?',
          options: ['Yo', 'Tú', 'Él', 'Nosotros'],
          correctIndex: 0,
          explanation: '"Yo" é o pronome "Eu" em espanhol (ex: "Yo soy estudiante").',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_esp_zero_10',
          subject: 'espanhol',
          grade,
          topic: 'Despedidas do Zero',
          question: 'Qual expressão em espanhol significa "Até logo / Nos vemos em breve"?',
          options: ['¡Hasta luego!', '¡Por favor!', '¡Perdón!', '¡Bienvenido!'],
          correctIndex: 0,
          explanation: '"¡Hasta luego!" significa até logo e "¡Hasta pronto!" significa até breve.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
      ],
    };
  }

  if (subjectId === 'italiano') {
    return {
      id: `fb_ita_${grade}`,
      subject: 'italiano',
      grade,
      title: '🟢 Italiano: Começando do Zero (Saluti, Pronuncia e Prime Parole)',
      summary: 'Trilha do Zero Absoluto: Aprenda as saudações essenciais, segredos da pronúncia italiana, números de 1 a 10 e frases do dia a dia.',
      detailedExplanation:
        'Benvenuti all\'italiano da zero! Como o italiano raramente é ensinado na escola regular, aqui começamos passo a passo do zero absoluto. As saudações principais são: "Buongiorno!" (Bom dia), "Buonasera!" (Boa tarde/Boa noite ao chegar), "Buonanotte!" (Boa noite ao ir dormir) e o versátil "Ciao!" (serve tanto para Oi quanto para Tchau informal). Para agradecer dizemos "Grazie mille!" e para responder "Prego!". Segredos de pronúncia: "CI" e "CE" soam como "TCH" (ex: Ciao = Tchao, Cena = Tchena). Já "CHI" e "CHE" soam como "K" duro (ex: Perché = Perkê, Macchina = Mákina). "GI" e "GE" soam como "DJ" (ex: Gelato = Djelato). A letra "H" é sempre muda! Falsos amigos clássicos: "Burro" em italiano não é o animal, é Manteiga!',
      keyPoints: [
        'Buongiorno = Bom dia | Buonasera = Boa noite ao chegar | Ciao = Oi / Tchau.',
        'Grazie mille = Muito obrigado | Prego = De nada / Por favor.',
        'Pronúncia: "Ci/Ce" soa "Tch" | "Chi/Che" soa "K" duro | "Gi/Ge" soa "Dj".',
        'Números de 1 a 5: Uno (1), Due (2), Tre (3), Quattro (4), Cinque (5).',
        'Falso Amigo: "Burro" significa manteiga e "Salita" significa subida!',
      ],
      example:
        'Diálogo do Zero:\n— Ciao! Come ti chiami?\n— Ciao! Mi chiamo Matteo, piacere di conoscerti. Studio l\'italiano da zero!',
      practiceQuestions: [
        {
          id: 'q_ita_zero_1',
          subject: 'italiano',
          grade,
          topic: 'Saudações do Zero',
          question: 'Como se diz "Bom dia" em italiano?',
          options: ['Buongiorno', 'Buonanotte', 'Arrivederci', 'Per favore'],
          correctIndex: 0,
          explanation: '"Buongiorno" é a saudação formal e diurna do italiano.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_2',
          subject: 'italiano',
          grade,
          topic: 'Verdadeiro ou Falso (Falsos Amigos)',
          question: 'VERDADEIRO OU FALSO: Em italiano, a palavra "BURRO" significa o animal burro.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 1,
          explanation: 'FALSO! "Burro" em italiano significa MANTEIGA de passar no pão (o animal burro em italiano se chama "asino").',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_ita_zero_3',
          subject: 'italiano',
          grade,
          topic: 'Pronúncia e Fala por Voz',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Como se diz "Muito obrigado" em italiano?',
          options: ['Grazie mille', 'Prego', 'Scusa', 'Arrivederci'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Grazie mille" (Muito obrigado).',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['grazie mille', 'grazie', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Grazie mille', 'Prego', 'Scusa', 'Arrivederci'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_4',
          subject: 'italiano',
          grade,
          topic: 'Verdadeiro ou Falso (Saudações)',
          question: 'VERDADEIRO OU FALSO: A palavra "CIAO" em italiano pode ser usada tanto para dizer "Oi" quanto para dizer "Tchau" informal.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! "Ciao" é uma saudação informal universal usada tanto na chegada (Oi) quanto na saída (Tchau).',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_ita_zero_5',
          subject: 'italiano',
          grade,
          topic: 'Cortesia do Zero',
          question: 'Qual é a resposta correta e educada quando alguém lhe diz "Grazie" (Obrigado)?',
          options: ['Prego!', 'Ciao!', 'Scusa!', 'Piacere!'],
          correctIndex: 0,
          explanation: '"Prego!" significa "De nada / Disponha / Por favor" em resposta ao agradecimento.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_6',
          subject: 'italiano',
          grade,
          topic: 'Pronúncia Italiana',
          question: 'Em italiano, como se pronuncia o famoso sorvete "GELATO"?',
          options: ['"Djelato" (com som de DJ)', '"Guelato" (com som de G duro)', '"Relato" (com som de R)', '"Selato"'],
          correctIndex: 0,
          explanation: 'Em italiano a letra "G" antes de "E" e "I" soa como "DJ" (ex: Gelato = Djelato).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_7',
          subject: 'italiano',
          grade,
          topic: 'Verdadeiro ou Falso (Gramática)',
          question: 'VERDADEIRO OU FALSO: Em italiano, a letra "H" (acca) é sempre pronunciada como um som mudo.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! A letra H em italiano é sempre muda (ex: "ho" soa "ó", "ha" soa "á", "hanno" soa "áno").',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_ita_zero_8',
          subject: 'italiano',
          grade,
          topic: 'Fala e Pronúncia por Voz',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Como dizemos "Bom dia" em italiano?',
          options: ['Buongiorno', 'Buonanotte', 'Arrivederci', 'Scusa'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Buongiorno".',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['buongiorno', 'buon giorno', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Buongiorno', 'Buonanotte', 'Arrivederci', 'Scusa'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_9',
          subject: 'italiano',
          grade,
          topic: 'Números do Zero',
          question: 'Como são os números 1, 2 e 3 em italiano?',
          options: ['Uno, Due, Tre', 'One, Two, Three', 'Uno, Dos, Tres', 'Um, Dois, Três'],
          correctIndex: 0,
          explanation: 'Em italiano: 1 = uno, 2 = due, 3 = tre, 4 = quattro, 5 = cinque.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ita_zero_10',
          subject: 'italiano',
          grade,
          topic: 'Apresentação do Zero',
          question: 'Como você diz "Meu nome é Sofia" em italiano?',
          options: ['Mi chiamo Sofia (ou Io sono Sofia)', 'Io ho Sofia', 'Io faccio Sofia', 'Io sto Sofia'],
          correctIndex: 0,
          explanation: '"Mi chiamo Sofia" ou "Io sono Sofia" é a forma correta de dizer seu nome em italiano.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
      ],
    };
  }

  if (subjectId === 'xadrez') {
    return {
      id: `fb_xad_${grade}`,
      subject: 'xadrez',
      grade,
      title: '♟️ Xadrez: Fundamentos, Movimento das Peças, Táticas e Estratégia',
      summary:
        'Aprenda xadrez de forma completa: tabuleiro, movimentação e valor de cada peça, golpes táticos (garfo, cravada, espeto), roque, en passant e caminhos para o xeque-mate.',
      detailedExplanation:
        'O xadrez é um jogo de estratégia milenar disputado em um tabuleiro de 64 casas (8 colunas × 8 fileiras). A casa no canto inferior direito de cada jogador deve ser sempre branca ("branca na direita"). Cada exército possui 16 peças: 1 Rei (valor infinito), 1 Dama/Rainha (9 pontos), 2 Torres (5 pontos), 2 Bispos (3 pontos), 2 Cavalos (3 pontos) e 8 Peões (1 ponto). Movimentação: A Torre anda em linhas retas (horizontais e verticais); o Bispo anda nas diagonais mantendo sempre a cor da casa onde começou; a Dama combina os movimentos da Torre e do Bispo; o Cavalo move-se em forma de "L" e é a ÚNICA peça que pode saltar sobre outras; o Peão move-se 1 casa para frente (podendo andar 2 casas em seu primeiro lance), mas captura somente 1 casa na diagonal à frente. Movimentos Especiais: 1) Roque (protege o Rei e ativa a Torre num lance conjunto); 2) En Passant (captura de peão "de passagem" logo após ele andar 2 casas); 3) Promoção (ao atingir a última fileira, o peão pode virar Dama, Torre, Bispo ou Cavalo). Objetivo Final: Dar XEQUE-MATE no Rei adversário, que é quando o Rei está sob ataque direto e não há nenhuma jogada legal para escapar!',
      keyPoints: [
        'Tabuleiro & Montagem: 64 casas (8x8), casa branca na direita, Dama na sua própria cor.',
        'Valores Relativos: Dama (9), Torre (5), Bispo (3), Cavalo (3), Peão (1). O Rei tem valor infinito.',
        'Movimentos Especiais: Roque (proteção do Rei), En Passant (captura de passagem) e Promoção do Peão.',
        'Táticas Principais: Garfo (ataque duplo simultâneo), Cravada (peça travada protegendo o Rei/Dama) e Espeto.',
        'Xeque-Mate vs. Afogamento: Xeque-Mate = Rei em xeque sem defesa (vitória); Afogamento = Rei NÃO está em xeque mas jogador não tem lances legais (empate).',
      ],
      example:
        'Exemplo de Garfo de Cavalo:\nAo jogar o Cavalo na casa c7 atacando ao mesmo tempo o Rei preto em e8 e a Torre preta em a8, o adversário é forçado a mover o Rei, permitindo a captura da Torre no lance seguinte!',
      practiceQuestions: [
        {
          id: 'q_xad_fb_1',
          subject: 'xadrez',
          grade,
          topic: 'Valores das Peças',
          question: 'Qual é o valor relativo em pontos atribuído à Dama (Rainha) no xadrez?',
          options: ['9 pontos', '5 pontos', '3 pontos', '1 ponto'],
          correctIndex: 0,
          explanation: 'A Dama é a peça mais poderosa e com maior mobilidade do jogo, valendo 9 pontos.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_2',
          subject: 'xadrez',
          grade,
          topic: 'Verdadeiro ou Falso (Movimento)',
          question: 'VERDADEIRO OU FALSO: O Cavalo é a única peça no xadrez que tem permissão para saltar sobre outras peças.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! O Cavalo move-se em formato de "L" (2 casas retas e 1 perpendicular) e salta quaisquer peças no caminho.',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_xad_fb_3',
          subject: 'xadrez',
          grade,
          topic: 'Fala por Voz ou Toque',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Qual é o nome do lance especial em que o Rei anda 2 casas para o lado e a Torre passa por cima dele?',
          options: ['Roque', 'En Passant', 'Promoção', 'Cravada'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Roque". É o movimento especial de defesa do Rei e ativação da Torre.',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['roque', 'roque pequeno', 'roque grande', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Roque', 'En Passant', 'Promoção', 'Cravada'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_4',
          subject: 'xadrez',
          grade,
          topic: 'Tática do Garfo',
          question: 'O que caracteriza o golpe tático chamado "GARFO" (ou ataque duplo)?',
          options: ['Uma única peça ataca simultaneamente duas ou mais peças adversárias', 'Um peão é promovido a dama', 'O rei fica afogado sem ter para onde ir', 'A troca de bispos da mesma cor'],
          correctIndex: 0,
          explanation: 'O Garfo ocorre quando uma peça ameaça duas peças adversárias ao mesmo tempo (muito comum com o Cavalo ou Peão).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_5',
          subject: 'xadrez',
          grade,
          topic: 'Verdadeiro ou Falso (Regras de Final)',
          question: 'VERDADEIRO OU FALSO: Se o jogador da vez não estiver em xeque, mas não possuir nenhum lance legal para jogar, a partida termina empatada por "afogamento".',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! O afogamento (stalemate) é quando o Rei não está em xeque e nenhum lance legal é possível, resultando em empate imediato.',
          difficulty: 'medium',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_xad_fb_6',
          subject: 'xadrez',
          grade,
          topic: 'Movimento do Peão',
          question: 'Como o Peão se movimenta e como ele captura uma peça no xadrez?',
          options: ['Avança em linha reta para frente, mas captura na diagonal para frente', 'Avança na diagonal e captura para trás', 'Avança em L e captura em linha reta', 'Move-se para todas as direções'],
          correctIndex: 0,
          explanation: 'O peão anda para frente (1 casa, ou 2 no primeiro lance), mas só captura peças situadas a 1 casa na diagonal à sua frente.',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_7',
          subject: 'xadrez',
          grade,
          topic: 'Tática da Cravada',
          question: 'Em uma "Cravada Absoluta", por que a peça não pode sair da sua casa?',
          options: ['Porque seu movimento deixaria o próprio Rei em xeque ilegal', 'Porque ela vale mais que a Dama', 'Porque o tabuleiro está bloqueado', 'Porque é o lance inicial do jogo'],
          correctIndex: 0,
          explanation: 'Na cravada absoluta, a peça está no meio da linha de ataque entre a peça adversária e o seu próprio Rei.',
          difficulty: 'medium',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_8',
          subject: 'xadrez',
          grade,
          topic: 'Fala por Voz ou Toque',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Qual é o nome do objetivo supremo do xadrez, quando o Rei adversário está sob ataque e não tem defesa?',
          options: ['Xeque-mate', 'Empate', 'Roque', 'En passant'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Xeque-mate" (encerra a partida com vitória).',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['xeque mate', 'xeque-mate', 'mate', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Xeque-mate', 'Empate', 'Roque', 'En passant'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_9',
          subject: 'xadrez',
          grade,
          topic: 'Promoção do Peão',
          question: 'O que acontece quando um Peão consegue alcançar a 8ª e última fileira do tabuleiro adversário?',
          options: ['Ele é promovido e transformado em Dama, Torre, Bispo ou Cavalo', 'Ele é removido do tabuleiro', 'Ele vira um segundo Rei', 'A partida termina imediatamente em empate'],
          correctIndex: 0,
          explanation: 'Ao chegar ao final do tabuleiro, o peão é promovido (geralmente à Dama, a peça mais forte).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_xad_fb_10',
          subject: 'xadrez',
          grade,
          topic: 'Princípios de Abertura',
          question: 'Qual é um dos princípios estratégicos mais importantes na abertura de uma partida de xadrez?',
          options: ['Controlar as casas centrais (e4, d4, e5, d5) e desenvolver Cavalos e Bispos rapidamente', 'Mover apenas a Dama nos primeiros 5 lances', 'Manter todas as peças na primeira fileira', 'Avançar todos os peões das laterais'],
          correctIndex: 0,
          explanation: 'Os grandes mestres ensinam: controlar o centro, desenvolver peças leves (Cavalos e Bispos) e rocar cedo para proteger o Rei.',
          difficulty: 'medium',
          questionType: 'multiple_choice',
        },
      ],
    };
  }

  if (subjectId === 'ingles') {
    return {
      id: `fb_ing_${grade}`,
      subject: 'ingles',
      grade,
      title: `🇬🇧 Língua Inglesa: Gramática, Tempos Verbais e Interpretação • ${gradeLabel}`,
      summary:
        'Aprenda o conteúdo curricular de Inglês da sua série: tempos verbais (Present, Past, Future, Modals), pronomes, falsos cognatos e interpretação de texto segundo a BNCC.',
      detailedExplanation:
        'O estudo da Língua Inglesa na educação básica desenvolve competências de leitura, compreensão auditiva e estruturas gramaticais essenciais. Estruturas-chave: 1) Simple Present: descreve rotinas e fatos gerais (He/She/It recebe terminação -s/-es, e auxiliares Do/Does); 2) Simple Past: expressa ações finalizadas no passado (verbos regulares com -ed, ex: played, e irregulares com formas próprias, ex: went, bought, com auxiliar Did); 3) Future: "Will" para decisões espontâneas e previsões, e "Going to" para planos e intenções planejadas; 4) Modal Verbs: can (habilidade/permissão), must (obrigação/dedução), should (conselho/recomendação); 5) Conectivos e Falsos Cognatos: palavras como "Actually" (na verdade), "Pretend" (fingir) e "Push" (empurrar) exigem atenção na leitura.',
      keyPoints: [
        'Simple Present: Rotinas e hábitos (He/She/It + -s/-es; auxiliares Do/Does/Don\'t/Doesn\'t).',
        'Simple Past: Ações concluídas (Verbos regulares com -ed e irregulares; auxiliar Did/Didn\'t).',
        'Future Forms: Will (decisão imediata/previsão) vs. Be going to (intenção/plano).',
        'Modal Verbs: Can (poder/capacidade), Should (dever/conselho), Must (obrigação).',
        'Falsos Amigos (False Cognates): Actually = na verdade; Pretend = fingir; Parents = pais.',
      ],
      example:
        'Exemplo Gramatical da Série:\n"She bought a new book yesterday and will read it tomorrow."\n(bought = passado simples de buy; will read = futuro com will).',
      practiceQuestions: [
        {
          id: 'q_ing_fb_1',
          subject: 'ingles',
          grade,
          topic: 'Simple Present',
          question: 'Complete com a forma correta do verbo no Simple Present: "Lucas _______ (play) guitar every weekend."',
          options: ['plays', 'play', 'playes', 'playing'],
          correctIndex: 0,
          explanation: 'Para a 3ª pessoa do singular (Lucas = He), acrescenta-se "-s" ao verbo no presente: "plays".',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_2',
          subject: 'ingles',
          grade,
          topic: 'Verdadeiro ou Falso (Falsos Cognatos)',
          question: 'VERDADEIRO OU FALSO: Em inglês, a palavra "ACTUALLY" significa "atualmente nos dias de hoje".',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 1,
          explanation: 'FALSO! "Actually" é um falso cognato e significa "na verdade / realmente". "Atualmente" em inglês se diz "currently" ou "nowadays".',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_ing_fb_3',
          subject: 'ingles',
          grade,
          topic: 'Fala por Voz ou Toque',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Qual é o passado simples do verbo "TO GO" (ir)?',
          options: ['Went', 'Goed', 'Gone', 'Going'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Went". O verbo "go" é irregular e seu passado é "went".',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['went', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Went', 'Goed', 'Gone', 'Going'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_4',
          subject: 'ingles',
          grade,
          topic: 'Modal Verbs',
          question: 'Qual verbo modal em inglês é mais apropriado para dar um conselho ("Você deveria estudar mais")?',
          options: ['Should', 'Must', 'Can', 'Might'],
          correctIndex: 0,
          explanation: '"Should" é o modal utilizado para conselhos, recomendações e sugestões ("You should study more").',
          difficulty: 'medium',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_5',
          subject: 'ingles',
          grade,
          topic: 'Verdadeiro ou Falso (Passado com Auxiliar)',
          question: 'VERDADEIRO OU FALSO: Na frase negativa no passado "I didn\'t see him", o verbo "see" deve ficar na forma base porque o auxiliar "didn\'t" já indica o passado.',
          options: ['Verdadeiro (V)', 'Falso (F)'],
          correctIndex: 0,
          explanation: 'VERDADEIRO! Com os auxiliares did/didn\'t o verbo principal permanece na forma base do infinitivo.',
          difficulty: 'easy',
          questionType: 'true_false',
          isTrueFalse: true,
        },
        {
          id: 'q_ing_fb_6',
          subject: 'ingles',
          grade,
          topic: 'Question Words',
          question: 'Qual "Question Word" em inglês é usada para perguntar sobre "LUGAR / ONDE"?',
          options: ['Where', 'When', 'Why', 'Who'],
          correctIndex: 0,
          explanation: '"Where" = Onde (lugar); "When" = Quando (tempo); "Why" = Por que (razão); "Who" = Quem (pessoa).',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_7',
          subject: 'ingles',
          grade,
          topic: 'Futuro com Going To',
          question: 'Complete a frase de plano futuro: "They _______ visit their grandparents next Sunday."',
          options: ['are going to', 'is going to', 'am going to', 'will to'],
          correctIndex: 0,
          explanation: 'Com o sujeito "They", usa-se o verbo "are" + "going to" ("They are going to visit...").',
          difficulty: 'medium',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_8',
          subject: 'ingles',
          grade,
          topic: 'Fala por Voz ou Toque',
          question: '🗣️ RESPOSTA POR VOZ OU TOQUE: Como se diz "Obrigado pela sua ajuda" em inglês?',
          options: ['Thank you for your help', 'Good morning', 'You are welcome', 'See you later'],
          correctIndex: 0,
          explanation: 'Diga ou assinale: "Thank you for your help".',
          difficulty: 'easy',
          questionType: 'voice_speech',
          isVoiceQuestion: true,
          expectedVoicePhrases: ['thank you for your help', 'thank you', 'thanks for your help', 'letra a', 'opcao a', 'a'],
          fallbackOptions: ['Thank you for your help', 'Good morning', 'You are welcome', 'See you later'],
          fallbackType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_9',
          subject: 'ingles',
          grade,
          topic: 'Conectivos Textuais',
          question: 'O que expressa o conectivo "HOWEVER" em um texto em inglês?',
          options: ['Contraste / Oposição (No entanto, porém)', 'Adição / Soma (Além disso)', 'Causa (Por causa de)', 'Conclusão (Portanto)'],
          correctIndex: 0,
          explanation: '"However" é uma conjunção adversativa que indica contraste ou oposição entre duas ideias.',
          difficulty: 'medium',
          questionType: 'multiple_choice',
        },
        {
          id: 'q_ing_fb_10',
          subject: 'ingles',
          grade,
          topic: 'Pronomes Demonstrativos',
          question: 'Qual pronome demonstrativo é usado para apontar para um único objeto que está PERTO de quem fala?',
          options: ['This (Este / Esta / Isto)', 'That (Aquele / Aquela)', 'These (Estes / Estas)', 'Those (Aqueles / Aquelas)'],
          correctIndex: 0,
          explanation: '"This" é usado para singular e próximo ("This is my pen").',
          difficulty: 'easy',
          questionType: 'multiple_choice',
        },
      ],
    };
  }

  // Idiomas e genérico
  return {
    id: `fb_${subjectId}_${grade}`,
    subject: subjectId,
    grade,
    title: `Conteúdo de ${subjectName} • ${gradeLabel}`,
    summary: `Resumo didático com os conceitos principais, regras práticas e exemplos resolvidos de ${subjectName}.`,
    detailedExplanation: `Nesta aula de ${subjectName}, apresentamos uma explicação completa sobre os conceitos fundamentais da disciplina orientada pela BNCC. Ao compreender passo a passo o significado dos termos, as regras e a estrutura prática da matéria, você assimila o conteúdo com facilidade e desenvolve total segurança para responder às perguntas a seguir.`,
    keyPoints: [
      `Conceito central e definições fundamentais da matéria.`,
      `Regras práticas de análise e resolução passo a passo.`,
      `Atenção aos detalhes e palavras-chave de cada questão.`,
      `Aplicação do raciocínio crítico em cada problema.`,
    ],
    example: `Ao aplicar as regras práticas da disciplina, resolver os exercícios se torna direto e intuitivo.`,
    practiceQuestions: questions,
  };
}

export function getFallbackLesson(grade: GradeLevel, subjectId: SubjectId): TopicLesson {
  const lesson = internalGetFallbackLesson(grade, subjectId);
  return {
    ...lesson,
    practiceQuestions: shuffleQuestionsList(lesson.practiceQuestions || []),
  };
}
