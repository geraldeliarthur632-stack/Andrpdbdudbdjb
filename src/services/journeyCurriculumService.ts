import { GradeLevel, SubjectId, TopicLesson, Question } from '../types';
import {
  getFallbackLesson,
  CURRICULUM_QUESTIONS_POOL,
  SAMPLE_LESSONS,
  shuffleQuestionsList,
  GRADE_LABELS,
} from '../data/curriculumData';
import { CADERNO_TOPICS } from '../data/cadernoData';

export interface JourneyTopicOption {
  id: string;
  title: string;
  description: string;
  badge?: string;
  isDefault?: boolean;
  questionsCount: number;
  lesson: TopicLesson;
}

interface CuratedTopicDef {
  title: string;
  summary: string;
  keyPoints: string[];
  example: string;
  topicKeywords: string[];
}

const CURATED_BNCC_TOPICS_BY_SUBJECT: Record<string, CuratedTopicDef[]> = {
  matematica: [
    {
      title: 'Frações e Divisão em Partes Iguais',
      summary: 'Aprenda o conceito de numerador, denominador, frações equivalentes e operações de soma e subtração.',
      keyPoints: [
        'O denominador indica em quantas partes o todo foi dividido.',
        'O numerador indica quantas dessas partes foram tomadas.',
        'Para somar frações com mesmo denominador, soma-se apenas o numerador.',
        'Frações equivalentes representam a mesma quantidade (ex: 1/2 = 2/4).',
      ],
      example: 'Se você tem uma pizza cortada em 8 fatias e come 3, você consumiu 3/8 da pizza inteira.',
      topicKeywords: ['fração', 'frações', 'divisão', 'partes'],
    },
    {
      title: 'Números Decimais, Moeda e Porcentagem',
      summary: 'Entenda como os números com vírgula funcionam, operações financeiras e cálculo rápido de porcentagens.',
      keyPoints: [
        'A vírgula separa a parte inteira da parte decimal (décimos, centésimos).',
        'Para somar números decimais, alinhe vírgula debaixo de vírgula.',
        'Porcentagem (%) representa uma fração de denominador 100 (ex: 25% = 25/100 = 0,25).',
        '10% de um número é simplesmente dividir por 10.',
      ],
      example: 'Em uma compra de R$ 80,00 com 10% de desconto, o desconto é de R$ 8,00 e o total a pagar é R$ 72,00.',
      topicKeywords: ['decimal', 'decimais', 'porcentagem', 'moeda', 'dinheiro'],
    },
    {
      title: 'Álgebra e Equações Simples de 1º Grau',
      summary: 'Descubra como desvendar o valor de incógnitas (como x) invertendo operações matemáticas.',
      keyPoints: [
        'Incógnita é a letra que representa um número desconhecido na igualdade.',
        'O objetivo é isolar a incógnita em um dos lados da igualdade.',
        'O que está somando passa subtraindo, e o que está multiplicando passa dividindo.',
        'Sempre faça a prova real substituindo o resultado na equação.',
      ],
      example: 'Na equação 2x + 6 = 16: passamos o 6 subtraindo (2x = 10) e depois dividimos por 2 (x = 5).',
      topicKeywords: ['equação', 'álgebra', 'incógnita', 'valor desconhecido'],
    },
    {
      title: 'Geometria Plana, Ângulos e Perímetro',
      summary: 'Explore figuras geométricas planas, cálculo de perímetro e áreas básicas e classificação de ângulos.',
      keyPoints: [
        'Perímetro é a soma de todos os lados de uma figura geométrica.',
        'Área do retângulo = Base × Altura; Área do triângulo = (Base × Altura) ÷ 2.',
        'Ângulo agudo mede menos de 90°; Ângulo reto mede exatamente 90° (em L).',
        'A soma dos ângulos internos de qualquer triângulo é sempre 180°.',
      ],
      example: 'Um terreno retangular de 10m de largura por 20m de comprimento tem perímetro 10 + 10 + 20 + 20 = 60 metros.',
      topicKeywords: ['geometria', 'ângulos', 'perímetro', 'área', 'triângulo'],
    },
    {
      title: 'Múltiplos, Divisores, MMC e MDC',
      summary: 'Domine a divisibilidade, números primos e resolução prática com MMC e MDC.',
      keyPoints: [
        'Número primo é aquele divisível apenas por 1 e por ele mesmo (ex: 2, 3, 5, 7, 11).',
        'Múltiplos de um número são obtidos multiplicando-o pelos números naturais.',
        'MMC (Mínimo Múltiplo Comum) é o menor múltiplo comum positivo.',
        'MDC (Máximo Divisor Comum) é o maior número que divide ambos ao mesmo tempo.',
      ],
      example: 'Os múltiplos de 3 são 0, 3, 6, 9, 12... e os divisores de 12 são 1, 2, 3, 4, 6 e 12.',
      topicKeywords: ['múltiplo', 'divisor', 'mmc', 'mdc', 'primo'],
    },
  ],
  portugues: [
    {
      title: 'Classes de Palavras: Substantivos, Adjetivos e Verbos',
      summary: 'Aprenda a reconhecer as principais classes gramaticais e sua função na construção de frases.',
      keyPoints: [
        'Substantivo: nomeia seres, objetos, lugares e sentimentos (ex: livro, alegria).',
        'Adjetivo: caracteriza e dá qualidade ao substantivo (ex: livro interessante).',
        'Verbo: expressa ação, estado ou fenômeno da natureza (ex: ler, chover).',
        'Artigo: define ou indefine o substantivo (ex: o, a, um, uma).',
      ],
      example: 'Na frase "O menino esperto correu no parque", menino é substantivo, esperto é adjetivo e correu é verbo.',
      topicKeywords: ['classes', 'substantivo', 'adjetivo', 'verbo', 'gramática'],
    },
    {
      title: 'Concordância Verbal e Nominal',
      summary: 'Regras práticas de concordância para escrever e falar corretamente de acordo com a norma-padrão.',
      keyPoints: [
        'O verbo sempre concorda em número e pessoa com o seu sujeito.',
        'Sujeito no plural exige verbo no plural (ex: "Eles chegaram", e não "Eles chegou").',
        'O verbo "fazer" indicando tempo decorrido fica sempre no singular (ex: "Faz dois anos").',
        'Adjetivos concordam em gênero e número com o substantivo a que se referem.',
      ],
      example: 'Correto: "Fazem-se consertos" (passiva sintética com sujeito plural consertos).',
      topicKeywords: ['concordância', 'verbal', 'nominal', 'sujeito', 'plural'],
    },
    {
      title: 'Pontuação, Parágrafos e Uso da Vírgula',
      summary: 'Descubra como pontuar com clareza e nunca mais errar a vírgula nas suas redações e provas.',
      keyPoints: [
        'Regra de ouro: NUNCA separe o sujeito do verbo com vírgula.',
        'A vírgula serve para listar itens ou isolar explicações (aposto).',
        'O ponto final encerra períodos declarativos completos.',
        'O ponto e vírgula separa orações coordenadas extensas ou itens em listas.',
      ],
      example: 'Correto: "Comprei maçãs, uvas, laranjas e peras na feira."',
      topicKeywords: ['pontuação', 'vírgula', 'parágrafo', 'ponto'],
    },
    {
      title: 'Interpretação Textual e Gêneros Narrativos',
      summary: 'Estratégias de leitura crítica para identificar ideias centrais, inferências e intenção do autor.',
      keyPoints: [
        'Leia o texto uma primeira vez para entender o tema global.',
        'Diferencie fato (acontecimento comprovável) de opinião (julgamento pessoal).',
        'Identifique o narrador (1ª pessoa ou 3ª pessoa observador/onisciente).',
        'Ao responder questões, volte ao parágrafo indicado no enunciado.',
      ],
      example: 'Em uma fábula, os animais falam e a narrativa termina sempre com uma moral instrutiva.',
      topicKeywords: ['interpretação', 'leitura', 'gênero', 'narrativa', 'texto'],
    },
    {
      title: 'Figuras de Linguagem e Expressividade',
      summary: 'Domine metáfora, metonímia, hipérbole, ironia e personificação para enriquecer seu vocabulário.',
      keyPoints: [
        'Metáfora: comparação implícita sem conectivo (ex: "Você tem um coração de ouro").',
        'Hipérbole: exagero intencional (ex: "Já te falei isso um milhão de vezes").',
        'Personificação: atribuir qualidades humanas a seres inanimados (ex: "A lua sorriu").',
        'Ironia: dizer o oposto do que se pensa para satirizar ou provocar reflexão.',
      ],
      example: '"Chorei rios de lágrimas" é um exemplo clássico de hipérbole pelo exagero poético.',
      topicKeywords: ['figuras', 'metáfora', 'hipérbole', 'ironia', 'linguagem'],
    },
  ],
  ciencias: [
    {
      title: 'Células, Tecidos e Organização da Vida',
      summary: 'Entenda a unidade fundamental dos seres vivos, organelas celulares e a formação de tecidos e órgãos.',
      keyPoints: [
        'A célula é a menor unidade viva de qualquer organismo.',
        'Células procariontes não possuem núcleo delimitado; eucariontes possuem núcleo com DNA.',
        'A membrana plasmática controla o que entra e sai da célula.',
        'Células semelhantes formam tecidos, tecidos formam órgãos e órgãos formam sistemas.',
      ],
      example: 'O coração é um órgão composto principalmente por tecido muscular cardíaco.',
      topicKeywords: ['célula', 'tecido', 'organela', 'núcleo', 'vida'],
    },
    {
      title: 'Ecossistemas, Cadeias Alimentares e Equilíbrio',
      summary: 'Descubra como a energia solar é transformada em vida e flui entre produtores, consumidores e decompositores.',
      keyPoints: [
        'Produtores (plantas/algas) realizam fotossíntese produzindo matéria orgânica.',
        'Consumidores primários alimentam-se de produtores (herbívoros).',
        'Decompositores (fungos/bactérias) reciclam os nutrientes de volta ao solo.',
        'O desmatamento e a poluição quebram o equilíbrio das cadeias ecológicas.',
      ],
      example: 'Capim (Produtor) -> Gafanhoto (Herbívoro) -> Sapo (Carnívoro) -> Serpente.',
      topicKeywords: ['ecossistema', 'cadeia alimentar', 'produtor', 'fotossíntese'],
    },
    {
      title: 'Corpo Humano: Digestão, Respiração e Circulação',
      summary: 'Aprenda como os sistemas do organismo trabalham juntos para fornecer energia e oxigênio.',
      keyPoints: [
        'Sistema Digestório: quebra alimentos em nutrientes absorvíveis no intestino.',
        'Sistema Respiratório: realiza as trocas gasosas (absorve O₂ e elimina CO₂) nos alvéolos pulmonares.',
        'Sistema Circulatório: o coração impulsiona o sangue oxigenado pelas artérias.',
        'A pulsação reflete as contrações rítmicas do músculo cardíaco.',
      ],
      example: 'Ao respirar fundo, o diafragma desce permitindo que os pulmões se expandam com ar rico em oxigênio.',
      topicKeywords: ['corpo humano', 'digestão', 'respiração', 'coração', 'sangue'],
    },
    {
      title: 'Misturas, Substâncias e Separação de Materiais',
      summary: 'Compreenda a diferença entre substâncias puras e misturas homogêneas ou heterogêneas no dia a dia.',
      keyPoints: [
        'Mistura homogênea (solução): apresenta apenas uma única fase visual (ex: água com sal dissolvido).',
        'Mistura heterogênea: apresenta duas ou mais fases distintas (ex: água e óleo).',
        'Filtração separa sólidos de líquidos (ex: coar café).',
        'Evaporação e Destilação separam misturas homogêneas baseadas no ponto de ebulição.',
      ],
      example: 'Na praia, o sal de cozinha é obtido pela evaporação da água do mar nas salinas.',
      topicKeywords: ['mistura', 'substância', 'separação', 'filtração', 'fase'],
    },
  ],
  historia: [
    {
      title: 'Fontes Históricas e Primeiras Civilizações',
      summary: 'Como os historiadores pesquisam o passado através de vestígios arqueológicos, fósseis e tradições.',
      keyPoints: [
        'Fontes históricas podem ser materiais, visuais, escritas ou orais.',
        'A escrita cuneiforme na Mesopotâmia marcou o início do registro escrito.',
        'Os rios Nilo, Tigre e Eufrates foram vitais para a agricultura das primeiras cidades.',
        'A História reconstrói a vida dos povos considerando múltiplos pontos de vista.',
      ],
      example: 'Pinturas rupestres em cavernas revelam técnicas de caça e crenças dos primeiros humanos.',
      topicKeywords: ['fontes', 'arqueologia', 'civilização', 'mesopotâmia', 'egito'],
    },
    {
      title: 'Grécia Antiga, Democracia e Filosofia',
      summary: 'O berço da democracia ateniense, dos Jogos Olímpicos e do pensamento racional ocidental.',
      keyPoints: [
        'Atenas desenvolveu a democracia direta, onde cidadãos debatiam na Ágora.',
        'Esparta era uma pólis militarizada e focada no treinamento de guerreiros.',
        'Os Jogos Olímpicos reuniam todas as cidades gregas em uma trégua sagrada.',
        'Mito e Razão: a filosofia nasceu quando os gregos buscaram explicações lógicas para a natureza.',
      ],
      example: 'O conceito moderno de cidadania e votação teve suas primeiras raízes na Grécia Antiga.',
      topicKeywords: ['grécia', 'democracia', 'atenas', 'olimpíadas', 'filosofia'],
    },
    {
      title: 'Brasil Colônia: Ciclo do Açúcar e Sociedade',
      summary: 'A colonização portuguesa, o sistema de capitanias, os engenhos de açúcar e a resistência escravizada.',
      keyPoints: [
        'O cultivo da cana-de-açúcar no Nordeste gerou a base econômica colonial.',
        'A mão de obra era predominantemente de africanos escravizados nos engenhos.',
        'A Casa-Grande e a Senzala simbolizavam a forte hierarquia e desigualdade social.',
        'Quilombos como o de Palmares foram centros fundamentais de resistência e liberdade.',
      ],
      example: 'Zumbi dos Palmares tornou-se o maior símbolo de resistência contra a escravidão no Brasil.',
      topicKeywords: ['brasil colônia', 'açúcar', 'escravidão', 'engenho', 'quilombo'],
    },
    {
      title: 'Revolução Industrial e Transformações no Trabalho',
      summary: 'A invenção da máquina a vapor, o surgimento das fábricas e as lutas pelos direitos dos trabalhadores.',
      keyPoints: [
        'A Inglaterra pioneira utilizou carvão mineral e vapor para mover teares industriais.',
        'Cidades cresceram rapidamente com o êxodo rural (migração do campo para a cidade).',
        'Jornadas de trabalho chegavam a 16 horas diárias sem direitos trabalhistas.',
        'Movimentos operários e sindicatos surgiram para conquistar férias, descanso semanal e limites de jornada.',
      ],
      example: 'A locomotiva a vapor encurtou distâncias continentais e revolucionou o transporte de mercadorias.',
      topicKeywords: ['revolução industrial', 'fábrica', 'trabalho', 'vapor', 'cidade'],
    },
  ],
  geografia: [
    {
      title: 'Cartografia, Coordenadas e Fusos Horários',
      summary: 'Como ler mapas, orientar-se pela Rosa dos Ventos e calcular distâncias reais através da escala.',
      keyPoints: [
        'Latitude mede a distância em graus da Linha do Equador (Norte ou Sul).',
        'Longitude mede a distância em graus do Meridiano de Greenwich (Leste ou Oeste).',
        'Escala gráfica ou numérica indica quantas vezes o território foi reduzido no papel.',
        'A Terra possui 24 fusos horários de 15 graus cada um.',
      ],
      example: 'No fuso oficial de Brasília (GMT-3), estamos 3 horas atrás do horário de Londres (GMT 0).',
      topicKeywords: ['cartografia', 'mapa', 'coordenadas', 'latitude', 'fuso'],
    },
    {
      title: 'Relevo, Tectonismo e Agentes da Terra',
      summary: 'Descubra como o interior da Terra e as forças do clima modelam montanhas, planaltos e planícies.',
      keyPoints: [
        'A litosfera terrestre é dividida em placas tectônicas em constante movimento.',
        'O choque entre placas forma montanhas e causa terremotos e erupções vulcânicas.',
        'Agentes externos (chuva, vento, rios) desgastam as rochas através do intemperismo e erosão.',
        'Planaltos sofrem erosão; planícies acumulam sedimentos transportados.',
      ],
      example: 'A Cordilheira dos Andes foi formada pelo choque entre a Placa de Nazca e a Placa Sul-Americana.',
      topicKeywords: ['relevo', 'placas tectônicas', 'erosão', 'montanhas', 'terremoto'],
    },
    {
      title: 'Biomas Brasileiros e Sustentabilidade',
      summary: 'Explore a rica biodiversidade da Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal.',
      keyPoints: [
        'Amazônia: maior floresta tropical do planeta, rica em água e biodiversidade.',
        'Cerrado: a savana brasileira, conhecida como o "berço das águas" do país.',
        'Caatinga: único bioma 100% brasileiro, adaptado à seca com vegetação xerófila.',
        'Mata Atlântica: bioma litorâneo intensamente povoado e prioritário para preservação.',
      ],
      example: 'Cactos com espinhos na Caatinga evitam a evaporação da água durante os períodos de estiagem.',
      topicKeywords: ['bioma', 'amazônia', 'cerrado', 'caatinga', 'meio ambiente'],
    },
  ],
  ingles: [
    {
      title: 'Simple Present and Daily Routines',
      summary: 'Aprenda a falar sobre sua rotina, hábitos e a regra do -s/-es na terceira pessoa (He, She, It).',
      keyPoints: [
        'Use Simple Present para hábitos, rotinas diárias e verdades gerais.',
        'Na 3ª pessoa do singular (he/she/it), acrescenta-se -s ao verbo (ex: He works).',
        'Auxiliares para perguntas: Do (I, you, we, they) e Does (he, she, it).',
        'Na forma negativa use: don\'t ou doesn\'t (ex: She doesn\'t like coffee).',
      ],
      example: '"I wake up at 7 AM every day, but my sister wakes up at 8 AM."',
      topicKeywords: ['simple present', 'routine', 'verbs', 'third person'],
    },
    {
      title: 'Verb to Be, Pronouns and Introductions',
      summary: 'Os primeiros passos essenciais: Am, Is, Are, pronomes pessoais e como se apresentar em inglês.',
      keyPoints: [
        'Pronomes: I (eu), You (você), He/She/It (ele/ela/objeto), We (nós), They (eles).',
        'Verb To Be: I am, You are, He is, She is, It is, We are, They are.',
        'Significa "Ser" ou "Estar" dependendo do contexto.',
        'Perguntas invertem a posição: "Are you ready?" e "Is he a student?".',
      ],
      example: '"Hello! My name is Lucas. I am 12 years old and I am from Brazil."',
      topicKeywords: ['verb to be', 'pronouns', 'am is are', 'introduction'],
    },
    {
      title: 'Question Words (Wh-) and Essential Vocabulary',
      summary: 'Domine What, Where, When, Who, Why e How para fazer perguntas e entender diálogos em inglês.',
      keyPoints: [
        'What: O que / Qual | Where: Onde | When: Quando.',
        'Who: Quem | Why: Por que (responde com Because) | How: Como.',
        'School vocabulary: Pencil, notebook, teacher, classroom, backpack.',
        'Family members: Father, mother, brother, sister, grandparents.',
      ],
      example: '"Where do you study?" -> "I study at school."',
      topicKeywords: ['question words', 'wh questions', 'vocabulary', 'school'],
    },
  ],
  espanhol: [
    {
      title: '🟢 Começando do Zero: Alfabeto, Saudações e Pronúncia',
      summary: 'Aprenda os sons especiais do espanhol, primeiras saudações e como se apresentar sem medo.',
      keyPoints: [
        'Saudações: ¡Hola! (Olá), ¡Buenos días! (Bom dia), ¡Buenas tardes! (Boa tarde).',
        'Despedidas: ¡Hasta luego! (Até logo), ¡Adiós! (Adeus), ¡Hasta mañana! (Até amanhã).',
        'Sons: A letra Ñ soa como NH (España = Espanha); o J soa como RR forte.',
        'Não existe Ç nem SS no alfabeto espanhol.',
      ],
      example: '— ¡Hola! ¿Cómo te llamas?\n— ¡Buenas tardes! Me llamo Diego y soy de Brasil.',
      topicKeywords: ['saudações', 'alfabeto', 'pronúncia', 'do zero', 'saludos'],
    },
    {
      title: 'Falsos Amigos (Heterosemánticos) e Vocabulário Prático',
      summary: 'Cuidado com pegadinhas! Aprenda as palavras que parecem português mas têm significado bem diferente.',
      keyPoints: [
        'Embarazada: significa GRÁVIDA (e não envergonhada!).',
        'Apellido: significa SOBRENOME (e não apelido carinhoso).',
        'Propina: significa GORJETA (em restaurantes).',
        'Vaso: é um COPO de água (e não vaso de flor).',
      ],
      example: 'Ao pedir água em um restaurante: "Un vaso de agua, por favor."',
      topicKeywords: ['falsos amigos', 'heterosemánticos', 'vocabulário', 'pegadinhas'],
    },
    {
      title: 'Números, Família, Cores e Dias da Semana',
      summary: 'Vocabulário essencial para contar, descrever pessoas e falar datas em espanhol.',
      keyPoints: [
        'Números: Uno, Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve, Diez.',
        'Dias da semana: Lunes (segunda), Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.',
        'Família: Padre (pai), Madre (mãe), Hermano (irmão), Abuelo (avô).',
        'Cores: Rojo (vermelho), Amarillo (amarelo), Azul, Verde, Blanco, Negro.',
      ],
      example: '"El lunes tengo clase de español con mi hermano."',
      topicKeywords: ['números', 'família', 'cores', 'dias da semana'],
    },
  ],
  italiano: [
    {
      title: '🟢 Começando do Zero: Alfabeto, Saluti e Pronúncia',
      summary: 'Aprenda as saudações mais elegantes, os sons de C/CH, G/GH, GLI e GN e como falar com sotaque natural.',
      keyPoints: [
        'Saluti: Ciao! (Oi/Tchau informal), Buongiorno! (Bom dia), Buonasera! (Boa noite).',
        'Cortesia: Per favore (Por favor), Grazie mille (Muito obrigado), Prego (De nada).',
        'Sons: "GN" soa como NH (Bagno = Banho); "GLI" soa como LH (Famiglia = Família).',
        '"CE/CI" soam como TCHÊ/TCHI (Ciao); "CHE/CHI" soam como QUÊ/QUI (Chianti).',
      ],
      example: '— Ciao! Come ti chiami?\n— Buongiorno! Mi chiamo Marco e piacere di conoscerti!',
      topicKeywords: ['saluti', 'alfabeto', 'pronuncia', 'sons especiais', 'do zero'],
    },
    {
      title: 'Verbi Essere e Avere no Presente',
      summary: 'Os dois verbos pilares da língua italiana: aprender a conjugar e usar em frases cotidianas.',
      keyPoints: [
        'Verbo Essere (Ser/Estar): Io sono, Tu sei, Lui/Lei è, Noi siamo, Voi siete, Loro sono.',
        'Verbo Avere (Ter): Io ho, Tu hai, Lui/Lei ha, Noi abbiamo, Voi avete, Loro hanno.',
        'A letra H no verbo avere é muda na pronúncia (ho = "ô", hai = "ái").',
        'Idade em italiano usa o verbo Avere (ex: "Ho 12 anni").',
      ],
      example: '"Io sono brasiliano e ho dodici anni" (Eu sou brasileiro e tenho doze anos).',
      topicKeywords: ['verbi', 'essere', 'avere', 'coniugazione', 'presente'],
    },
  ],
  xadrez: [
    {
      title: 'Fundamentos do Xadrez: Peças, Movimentos e Valores',
      summary: 'Aprenda como cada peça se move pelo tabuleiro e a pontuação relativa de peões, cavalos, bispos, torres e damas.',
      keyPoints: [
        'O Peão move 1 casa à frente (2 no primeiro lance) e captura na diagonal.',
        'O Cavalo (3 pts) move em forma de "L" e é a única peça que pula outras.',
        'O Bispo (3 pts) corre pelas diagonais; A Torre (5 pts) pelas colunas e fileiras.',
        'A Dama (9 pts) combina os movimentos da Torre e do Bispo; O Rei tem valor infinito.',
      ],
      example: 'Brancas começam jogando. Casa branca à direita de cada jogador na montagem.',
      topicKeywords: ['xadrez', 'peças', 'movimento', 'valor', 'tabuleiro'],
    },
    {
      title: 'Táticas Clássicas: Garfo, Cravada, Espeto e Roque',
      summary: 'Descubra os golpes táticos que ganham partidas e como proteger seu rei através do roque.',
      keyPoints: [
        'Garfo: uma única peça ataca duas ou mais peças inimigas simultaneamente (comum com cavalo e peão).',
        'Cravada: uma peça não pode se mover porque deixaria uma peça mais valiosa ou o Rei sob ataque.',
        'Espeto: ataque direto a uma peça valiosa que, ao fugir, expõe outra peça atrás.',
        'Roque: lance especial que protege o Rei e ativa a Torre em um só movimento.',
      ],
      example: 'Um Cavalo em c7 dando cheque no Rei e atacando a Torre em a8 realiza um garfo devastador.',
      topicKeywords: ['garfo', 'cravada', 'espeto', 'roque', 'táticas'],
    },
    {
      title: 'Xeque, Xeque-Mate e Rei Afogado',
      summary: 'Aprenda a diferença entre ameaçar o rei, vencer a partida ou empatar por afogamento.',
      keyPoints: [
        'Xeque: o Rei está sob ataque direto e DEVE sair da ameaça imediatamente.',
        'Maneiras de responder ao xeque: Fugir com o Rei, Bloquear o ataque ou Capturar a peça atacante.',
        'Xeque-Mate: o Rei está em xeque e não há nenhuma jogada legal para salvá-lo (Fim de jogo!).',
        'Rei Afogado: o Rei NÃO está em xeque, mas o jogador não tem nenhum movimento legal (Empate!).',
      ],
      example: 'O Mate do Pastor é uma vitória relâmpago em 4 lances aproveitando a fraqueza da casa f7.',
      topicKeywords: ['xeque', 'xeque-mate', 'mate', 'afogado', 'vitória'],
    },
  ],
  fisica: [
    {
      title: 'Cinemática e Velocidade Média',
      summary: 'Compreenda a relação entre distância percorrida, tempo e rapidez no movimento dos corpos.',
      keyPoints: [
        'Velocidade Média: Vm = ΔS / Δt (variação de espaço dividida pelo tempo).',
        'No Sistema Internacional (SI), a velocidade é medida em metros por segundo (m/s).',
        'Para converter de km/h para m/s, divida por 3,6; de m/s para km/h, multiplique por 3,6.',
        'Movimento Uniforme (MU): velocidade constante e aceleração igual a zero.',
      ],
      example: 'Um veículo que percorre 120 km em 2 horas possui velocidade média de 60 km/h (16,6 m/s).',
      topicKeywords: ['velocidade média', 'cinemática', 'm/s', 'movimento', 'espaço'],
    },
    {
      title: 'Leis de Newton e Forças da Dinâmica',
      summary: 'Os três princípios fundamentais que explicam por que as coisas se movem, param ou aceleram.',
      keyPoints: [
        '1ª Lei (Inércia): um corpo em repouso ou movimento retilíneo uniforme tende a permanecer assim.',
        '2ª Lei (Princípio Fundamental): Força Resultante = Massa × Aceleração (F = m × a).',
        '3ª Lei (Ação e Reação): para toda ação existe uma reação de igual intensidade e sentido oposto.',
        'Peso é a força gravitacional exercida sobre a massa (P = m × g).',
      ],
      example: 'O cinto de segurança impede que os passageiros continuem em movimento pela inércia em uma freada brusca.',
      topicKeywords: ['newton', 'leis de newton', 'força', 'inércia', 'massa'],
    },
  ],
  quimica: [
    {
      title: 'Estrutura Atômica e Tabela Periódica',
      summary: 'Descubra a estrutura do átomo (prótons, nêutrons e elétrons) e como os elementos estão organizados.',
      keyPoints: [
        'O núcleo atômico concentra prótons (carga +) e nêutrons (neutros).',
        'A eletrosfera contém os elétrons (carga -) orbitando em camadas de energia.',
        'Número Atômico (Z) = número de prótons (a identidade do elemento).',
        'A Tabela Periódica organiza os elementos em ordem crescente de número atômico.',
      ],
      example: 'O Hidrogênio (H) possui Z = 1 (1 próton no núcleo e 1 elétron na camada K).',
      topicKeywords: ['átomo', 'prótons', 'elétrons', 'tabela periódica', 'número atômico'],
    },
    {
      title: 'Ligações Químicas e Reações',
      summary: 'Por que os átomos se unem para formar moléculas e a regra da conservação das massas.',
      keyPoints: [
        'Regra do Octeto: átomos buscam estabilidade completando 8 elétrons na camada de valência.',
        'Ligação Iônica: transferência definitiva de elétrons entre metal e ametal (ex: NaCl).',
        'Ligação Covalente: compartilhamento de pares de elétrons entre ametais (ex: H₂O).',
        'Lei de Lavoisier: "Na natureza nada se cria, nada se perde, tudo se transforma".',
      ],
      example: 'O sal de cozinha (NaCl) é formado pela atração eletrostática entre o cátion Na⁺ e o ânion Cl⁻.',
      topicKeywords: ['ligações químicas', 'iônica', 'covalente', 'reações', 'lavoisier'],
    },
  ],
  biologia: [
    {
      title: 'Citologia e Bioquímica Celular',
      summary: 'A estrutura interna da célula eucarionte e as organelas que mantêm a vida ativa.',
      keyPoints: [
        'Mitocôndrias realizam a respiração celular e produzem ATP (energia).',
        'Ribossomos são responsáveis pela síntese de proteínas.',
        'Complexo Golgiense empacota e secreta substâncias celulares.',
        'O núcleo guarda o DNA e comanda as funções metabólicas.',
      ],
      example: 'Células musculares contêm muitas mitocôndrias para suprir a alta demanda energética na contração.',
      topicKeywords: ['citologia', 'mitocôndria', 'dna', 'célula', 'organelas'],
    },
    {
      title: 'Genética, Hereditariedade e Leis de Mendel',
      summary: 'Como os genes e cromossomos transmitem as características dos pais para os filhos.',
      keyPoints: [
        'Genótipo é o conjunto de genes (ex: AA, Aa, aa); Fenótipo é a característica expressa visível.',
        'Gene dominante manifesta sua característica mesmo em dose simples (Aa).',
        'Gene recessivo só se manifesta em homozigose (aa).',
        '1ª Lei de Mendel: os alelos se segregam na formação dos gametas.',
      ],
      example: 'O cruzamento entre dois indivíduos heterozigotos (Aa × Aa) gera 75% dominantes e 25% recessivos.',
      topicKeywords: ['genética', 'mendel', 'hereditariedade', 'alelos', 'genes'],
    },
  ],
  artes: [
    {
      title: 'Cores, Luz e Elementos da Composição Visual',
      summary: 'Aprenda sobre cores primárias, secundárias, quentes e frias e harmonia artística.',
      keyPoints: [
        'Cores Primárias: Azul, Amarelo e Vermelho (não podem ser obtidas por misturas).',
        'Cores Secundárias: Laranja (vermelho + amarelo), Verde (azul + amarelo) e Roxo (azul + vermelho).',
        'Cores Quentes transmitem energia e calor; Cores Frias transmitem calma e serenidade.',
        'Ponto, linha e textura são os elementos estruturais de qualquer desenho ou pintura.',
      ],
      example: 'O pintor Vincent van Gogh usava contrastes vibrantes entre azul (frio) e amarelo (quente) em "A Noite Estrelada".',
      topicKeywords: ['cores', 'primárias', 'secundárias', 'van gogh', 'composição'],
    },
  ],
};

/**
 * Retorna as opções de conteúdos do ano disponíveis para a disciplina e ano escolar,
 * com o primeiro item sendo SEMPRE a recomendação padrão oficial do aplicativo.
 */
export function getYearTopicsForSubject(
  grade: GradeLevel,
  subjectId: SubjectId
): JourneyTopicOption[] {
  const result: JourneyTopicOption[] = [];
  const addedTitles = new Set<string>();

  // 1. Tópico Padrão do Aplicativo (Recomendado)
  const defaultLesson = getFallbackLesson(grade, subjectId);
  const defaultOption: JourneyTopicOption = {
    id: `default_${subjectId}_${grade}`,
    title: defaultLesson.title,
    description: defaultLesson.summary,
    badge: 'Recomendação Padrão do App',
    isDefault: true,
    questionsCount: defaultLesson.practiceQuestions?.length || 5,
    lesson: defaultLesson,
  };
  result.push(defaultOption);
  addedTitles.add(defaultLesson.title.toLowerCase().trim());

  // 2. Lições Curadas da Base BNCC para esta disciplina
  const curatedDefs = CURATED_BNCC_TOPICS_BY_SUBJECT[subjectId] || [];
  const pool = CURRICULUM_QUESTIONS_POOL[grade] || [];
  const gradeQuestions = pool.filter((q) => q.subject === subjectId);

  for (let i = 0; i < curatedDefs.length; i++) {
    const cDef = curatedDefs[i];
    const normalizedTitle = cDef.title.toLowerCase().trim();
    if (addedTitles.has(normalizedTitle)) continue;

    // Filtra questões do banco cujo tópico ou texto combinem com as palavras-chave
    const matchingQuestions = gradeQuestions.filter((q) => {
      const qText = `${q.topic || ''} ${q.question || ''}`.toLowerCase();
      return cDef.topicKeywords.some((kw) => qText.includes(kw.toLowerCase()));
    });

    // Se faltarem questões específicas, completa com questões do mesmo ano e disciplina
    const questionsToUse = matchingQuestions.length >= 3
      ? matchingQuestions.slice(0, 5)
      : [
          ...matchingQuestions,
          ...gradeQuestions.filter((q) => !matchingQuestions.some((mq) => mq.id === q.id)),
        ].slice(0, 5);

    // Se a disciplina tem poucas questões na série, aproveita o pool da lição padrão com embaralhamento
    const finalQuestions = questionsToUse.length >= 3
      ? questionsToUse
      : defaultLesson.practiceQuestions.slice(0, 5);

    const lesson: TopicLesson = {
      id: `curated_${subjectId}_${i}_${grade}`,
      subject: subjectId,
      grade,
      title: cDef.title,
      summary: cDef.summary,
      detailedExplanation: `${cDef.summary}\n\nConceitos Fundamentais:\n${cDef.keyPoints
        .map((p, idx) => `${idx + 1}. ${p}`)
        .join('\n')}\n\nExemplo Prático:\n${cDef.example}`,
      keyPoints: cDef.keyPoints,
      example: cDef.example,
      practiceQuestions: shuffleQuestionsList(finalQuestions),
    };

    result.push({
      id: lesson.id,
      title: lesson.title,
      description: lesson.summary,
      questionsCount: lesson.practiceQuestions.length,
      lesson,
    });
    addedTitles.add(normalizedTitle);
  }

  // 3. Tópicos do Caderno Digital / Teoria Prática
  const cadernoMatches = CADERNO_TOPICS.filter((t) => t.subjectId === subjectId);
  for (const cad of cadernoMatches) {
    const norm = cad.title.toLowerCase().trim();
    if (addedTitles.has(norm)) continue;

    const stepStrings = (cad.howToDoStepByStep || []).map((s: any) =>
      typeof s === 'string' ? s : `${s.title}: ${s.description}`
    );
    const firstEx = cad.solvedExamples?.[0];
    const exampleStr = firstEx
      ? `${firstEx.problem}\nResolução: ${(firstEx.resolutionSteps || []).join(' -> ')}\nResultado: ${firstEx.finalAnswer}`
      : cad.summary;

    const lesson: TopicLesson = {
      id: `caderno_${cad.id}_${grade}`,
      subject: subjectId,
      grade,
      title: cad.title,
      summary: cad.summary,
      detailedExplanation: `${cad.summary}\n\nPasso a Passo:\n${stepStrings
        .map((step, idx) => `${idx + 1}. ${step}`)
        .join('\n')}`,
      keyPoints: stepStrings.slice(0, 4),
      example: exampleStr,
      practiceQuestions: shuffleQuestionsList(
        cad.practiceQuestions && cad.practiceQuestions.length >= 3
          ? cad.practiceQuestions
          : defaultLesson.practiceQuestions
      ),
    };

    result.push({
      id: lesson.id,
      title: lesson.title,
      description: lesson.summary,
      badge: 'Teoria Detalhada',
      questionsCount: lesson.practiceQuestions.length,
      lesson,
    });
    addedTitles.add(norm);
  }

  // 4. Lições de Amostra (SAMPLE_LESSONS)
  const sampleMatches = SAMPLE_LESSONS.filter((l) => l.subject === subjectId);
  for (const sLesson of sampleMatches) {
    const norm = sLesson.title.toLowerCase().trim();
    if (addedTitles.has(norm)) continue;

    const lesson: TopicLesson = {
      id: `sample_${sLesson.id}_${grade}`,
      subject: subjectId,
      grade,
      title: sLesson.title,
      summary: sLesson.summary,
      detailedExplanation: `${sLesson.summary}\n\n${(sLesson.keyPoints || [])
        .map((p, idx) => `${idx + 1}. ${p}`)
        .join('\n')}`,
      keyPoints: sLesson.keyPoints || [],
      example: sLesson.example || '',
      practiceQuestions: shuffleQuestionsList(
        sLesson.practiceQuestions && sLesson.practiceQuestions.length >= 3
          ? sLesson.practiceQuestions
          : defaultLesson.practiceQuestions
      ),
    };

    result.push({
      id: lesson.id,
      title: lesson.title,
      description: lesson.summary,
      questionsCount: lesson.practiceQuestions.length,
      lesson,
    });
    addedTitles.add(norm);
  }

  return result;
}

/**
 * Retorna diretamente a opção padrão do aplicativo para a disciplina
 */
export function getDefaultTopicForSubject(
  grade: GradeLevel,
  subjectId: SubjectId
): JourneyTopicOption {
  const topics = getYearTopicsForSubject(grade, subjectId);
  return topics[0];
}
