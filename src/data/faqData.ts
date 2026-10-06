export interface FaqItem {
  id: string;
  category: 'bncc' | 'app' | 'gamificacao' | 'estudos';
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  tags: string[];
  keyPoints?: string[];
}

export interface FaqCategory {
  id: 'todas' | 'bncc' | 'app' | 'gamificacao' | 'estudos';
  label: string;
  icon: string;
  description: string;
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'todas',
    label: 'Todas as Dúvidas',
    icon: '✨',
    description: 'Explore todas as perguntas frequentes sobre o aplicativo e a educação',
  },
  {
    id: 'bncc',
    label: 'BNCC & Pedagógico',
    icon: '📚',
    description: 'Tudo sobre a Base Nacional Comum Curricular e diretrizes educacionais',
  },
  {
    id: 'app',
    label: 'Voz da IA & Recursos',
    icon: '🎙️',
    description: 'Como funciona a narração por voz, auto-passar de quadros e recursos do app',
  },
  {
    id: 'gamificacao',
    label: 'Pontos & Troféus',
    icon: '🏆',
    description: 'Como ganhar XP, subir de nível escolar e desbloquear distintivos',
  },
  {
    id: 'estudos',
    label: 'Rotina & Limites',
    icon: '⏰',
    description: 'Metas diárias, limite saudável de 2 horas e modo offline',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'o-que-e-bncc',
    category: 'bncc',
    question: 'O que é BNCC?',
    shortAnswer:
      'A BNCC (Base Nacional Comum Curricular) é o documento oficial do Brasil que estabelece quais aprendizagens essenciais todos os alunos devem desenvolver na Educação Básica.',
    detailedAnswer:
      'A BNCC (Base Nacional Comum Curricular) é um documento normativo de caráter obrigatório emitido pelo Ministério da Educação (MEC) e homologado pelo Conselho Nacional de Educação (CNE). Ela define com clareza o conjunto orgânico e progressivo de aprendizagens fundamentais que todos os estudantes brasileiros — desde a Educação Infantil, passando pelo Ensino Fundamental até o Ensino Médio — têm o direito de aprender, seja em escolas públicas ou particulares em qualquer região do país.',
    tags: ['bncc', 'mec', 'educacao', 'ensino', 'escola', 'curriculo', 'diretrizes'],
    keyPoints: [
      'Garante igualdade e equidade de aprendizagem em todo o território nacional.',
      'Serve de referência obrigatória para os currículos escolares e materiais didáticos.',
      'Organiza os conteúdos por competências, habilidades e anos escolares.',
      'Abrange Língua Portuguesa, Matemática, Ciências, História, Geografia, Artes, Educação Física e Língua Inglesa.',
    ],
  },
  {
    id: 'como-app-alinhado-bncc',
    category: 'bncc',
    question: 'Como o Trilha do Saber se alinha às diretrizes da BNCC?',
    shortAnswer:
      'Cada disciplina, explicação teórica e questão do aplicativo foi planejada seguindo as habilidades e competências específicas estipuladas pela BNCC para cada série escolar.',
    detailedAnswer:
      'No Trilha do Saber, nenhuma pergunta é aleatória. Todo o currículo disponível para o 1º ao 9º ano do Ensino Fundamental e para o Ensino Médio respeita a progressão de habilidades da BNCC (como operações matemáticas, interpretação textual, ecossistemas, períodos históricos e cidadania). Ao praticar no app, o aluno reforça exatamente o que a sua professora ou professor está ensinando na escola.',
    tags: ['bncc', 'alinhamento', 'materias', 'curriculo', 'habilidades', 'escola'],
    keyPoints: [
      'Lições divididas por série oficial brasileira (1º ao 9º ano e Ensino Médio).',
      'Teoria didática antes de cada bateria de 10 perguntas.',
      'Conteúdos revisados para garantir fidelidade pedagógica.',
    ],
  },
  {
    id: 'competencias-gerais-bncc',
    category: 'bncc',
    question: 'Quais são as 10 Competências Gerais da BNCC?',
    shortAnswer:
      'São as 10 grandes competências humanas, intelectuais, sociais e éticas que todo aluno deve construir ao longo da vida escolar.',
    detailedAnswer:
      'A BNCC estabelece 10 Competências Gerais que articulam conhecimentos conceituais com atitudes e valores para a cidadania plena:\n\n1. Conhecimento: Valorizar e utilizar os conhecimentos sobre o mundo físico, social e cultural.\n2. Pensamento científico, crítico e criativo: Investigar causas, elaborar hipóteses e criar soluções.\n3. Repertório cultural: Fruir e participar de manifestações artísticas e culturais.\n4. Comunicação: Expressar-se em múltiplas linguagens (verbal, corporal, visual e digital).\n5. Cultura digital: Utilizar tecnologias digitais de forma crítica, reflexiva e ética.\n6. Trabalho e projeto de vida: Entender o mundo do trabalho e planejar seu futuro.\n7. Argumentação: Argumentar com base em fatos e dados confiáveis, respeitando os direitos humanos.\n8. Autoconhecimento e autocuidado: Cuidar da saúde física e emocional.\n9. Empatia e cooperação: Exercitar a convivência pacífica e combater o preconceito.\n10. Responsabilidade e cidadania: Agir com autonomia, ética e solidariedade.',
    tags: ['bncc', 'competencias', 'mec', 'cidadania', 'valores', 'educacao'],
    keyPoints: [
      'Desenvolvimento integral do aluno (cognitivo e socioemocional).',
      'Estímulo à cultura digital e pensamento crítico.',
      'Autonomia para aprender a aprender.',
    ],
  },
  {
    id: 'voz-ia-velocidade-normal',
    category: 'app',
    question: 'Como funciona a voz da IA na velocidade normal?',
    shortAnswer:
      'A voz da IA agora narra o conteúdo na velocidade natural (1.0x), proporcionando uma dicção clara e contínua sem cortes de áudio.',
    detailedAnswer:
      'O sistema de narração por voz foi calibrado para a velocidade normal de fala humana (1.0x). O motor de síntese vocal divide textos longos de maneira inteligente e monitora cada segmento, impedindo cortes de som ou congelamentos. Você pode ativar ou pausar a fala a qualquer instante clicando no botão de alto-falante (Ouvir IA).',
    tags: ['voz', 'ia', 'velocidade', 'normal', 'audio', 'narrador', 'som'],
    keyPoints: [
      'Velocidade normal (1.0x) para ótima compreensão de crianças e jovens.',
      'Suporte a vozes brasileiras de alta fidelidade nativas do navegador.',
      'Botão de pausa e reprodução instantâneo.',
    ],
  },
  {
    id: 'auto-passar-quadros',
    category: 'app',
    question: 'Como funciona a passagem automática de quadros?',
    shortAnswer:
      'Quando o "Auto-passar: Ligado" está ativo, assim que a IA termina de narrar o quadro explicativo, o sistema avança sozinho para a próxima tela.',
    detailedAnswer:
      'O recurso "Auto-passar" foi criado para tornar o estudo mais fluido e dinâmico. Tanto no Tutorial de Início quanto na Jornada de Aprendizado, ao terminar de escutar a narração do primeiro quadro, o aplicativo exibe um aviso verde animado e transita automaticamente para as perguntas de fixação ou para o próximo passo. Você pode ligar ou desligar essa opção no botão superior "Auto-passar: Ligado/Desligado".',
    tags: ['autopassar', 'passar sozinho', 'quadro', 'ia', 'tutorial', 'jornada'],
    keyPoints: [
      'Não precisa tocar na tela para avançar após ouvir a explicação.',
      'Pode ser pausado a qualquer momento caso queira reler.',
      'Disponível no Tutorial e nas aulas da Jornada.',
    ],
  },
  {
    id: 'tutorial-primeira-vez',
    category: 'app',
    question: 'O tutorial de início aparece de novo depois da primeira vez?',
    shortAnswer:
      'Não! O tutorial interativo aparece automaticamente apenas no seu primeiro acesso ao aplicativo. Depois que você o conclui ou fecha, ele não abre mais sozinho.',
    detailedAnswer:
      'O Tutorial de Início foi projetado para apresentar os principais recursos do Trilha do Saber na sua primeira visita (Jornada, Matérias, Voz IA, Central de Jogos e Troféus). Assim que você assiste ou pula o tutorial, o aplicativo grava a sua preferência e ele nunca mais surge espontaneamente. Se você quiser revê-lo no futuro, basta clicar em "Ver Tutorial de Início" aqui no FAQ ou na aba Configurações!',
    tags: ['tutorial', 'primeira vez', 'inicio', 'boas-vindas', 'ajuda'],
    keyPoints: [
      'Abre automaticamente apenas na primeira visita.',
      'Memoriza que você já concluiu no navegador/celular.',
      'Pode ser reaberto manualmente a qualquer momento.',
    ],
  },
  {
    id: 'limite-duas-horas',
    category: 'estudos',
    question: 'Por que o aplicativo tem um limite diário de 2 horas de estudo?',
    shortAnswer:
      'O limite de 2 horas diárias visa proteger a saúde visual, evitar a fadiga mental e promover uma rotina equilibrada para crianças e adolescentes.',
    detailedAnswer:
      'Estudos pedagógicos e médicos recomendam que o tempo de tela para estudos diários de crianças e jovens seja fracionado e com pausas regulares. Por isso, o Trilha do Saber monitora os minutos de estudo ativo. Ao atingir 2 horas no mesmo dia, uma mensagem acolhedora convida o estudante a beber água, relaxar a visão e voltar com energia renovada amanhã.',
    tags: ['limite', 'tempo', '2 horas', 'saude', 'tela', 'estudo', 'descanso'],
    keyPoints: [
      'Incentiva hábitos de estudo regulares e saudáveis.',
      'Evita cansaço mental e melhora a fixação do conteúdo.',
      'Aparece apenas quando o tempo diário de 2h é completado.',
    ],
  },
  {
    id: 'como-ganhar-xp-trofeus',
    category: 'gamificacao',
    question: 'Como ganhar pontos XP, troféus e subir de nível?',
    shortAnswer:
      'Você acumula pontos de experiência (XP) ao acertar questões, completar aulas, jogar Xadrez, Palavras Cruzadas e desafios diários.',
    detailedAnswer:
      'Cada resposta correta na Jornada de Aprendizado concede pontos XP e moedas de sabedoria. Além disso, ao acertar séries consecutivas ou alcançar marcos históricos (como 50 questões perfeitas ou 7 dias seguidos de estudo), você desbloqueia troféus dourados e distintivos exclusivos na sua Galeria de Conquistas.',
    tags: ['xp', 'pontos', 'trofeus', 'medalhas', 'nivel', 'gamificacao'],
    keyPoints: [
      'Pontos aumentam o seu Nível Acadêmico no Perfil.',
      'Troféus bronze, prata e ouro para conquistas memoráveis.',
      'Streak de dias estimula a constância no estudo.',
    ],
  },
  {
    id: 'prova-foto-ia',
    category: 'app',
    question: 'Como funciona o Criador de Provas por Foto com IA?',
    shortAnswer:
      'Você tira uma foto de qualquer folha de caderno, livro ou apostila e a IA gera um resumo didático com 5 a 10 perguntas automáticas.',
    detailedAnswer:
      'Na aba "Prova por Foto", basta apontar a câmera do celular para o texto de um livro didático ou apostila escolar. A inteligência artificial faz a leitura óptica (OCR), extrai o tema principal e cria instantaneamente um simulado de fixação com narração por voz e gabarito comentado.',
    tags: ['foto', 'camera', 'prova', 'ia', 'ocr', 'caderno', 'livro'],
    keyPoints: [
      'Transforma qualquer material impresso em teste interativo.',
      'Explicação dos acertos e erros.',
      'Pode ser salvo no seu histórico.',
    ],
  },
  {
    id: 'modo-offline-pwa',
    category: 'estudos',
    question: 'Posso usar o Trilha do Saber sem internet (offline)?',
    shortAnswer:
      'Sim! O aplicativo funciona como PWA (Progressive Web App) e pode ser instalado no celular ou computador com suporte offline.',
    detailedAnswer:
      'Clicando no botão "Instalar App" no topo da tela, você adiciona o Trilha do Saber à tela inicial do seu smartphone Android, iPhone ou computador. As questões básicas, o Caderno Digital e os Resumos em PDF continuam acessíveis mesmo em locais sem sinal de internet.',
    tags: ['offline', 'sem internet', 'pwa', 'instalar', 'download', 'pdf'],
    keyPoints: [
      'Funciona direto no navegador ou instalado como app nativo.',
      'Economiza dados móveis.',
      'Exportação de resumos em PDF para imprimir ou ler offline.',
    ],
  },
  {
    id: 'reportar-erro-duvida',
    category: 'app',
    question: 'Como reportar um erro em uma questão ou enviar sugestões?',
    shortAnswer:
      'Basta clicar no botão "Reportar Erro / Feedback" no rodapé de qualquer questão ou no menu do seu perfil.',
    detailedAnswer:
      'Valorizamos muito a exatidão pedagógica. Se encontrar qualquer ambiguidade de texto, gabarito ou tiver ideias de novos temas da BNCC para adicionarmos, clique em "Reportar Erro / Sugestão". Nossa equipe pedagógica avalia todas as mensagens para manter o conteúdo impecável.',
    tags: ['reportar', 'erro', 'sugestao', 'feedback', 'suporte', 'duvidas'],
    keyPoints: [
      'Canal aberto direto com a equipe pedagógica.',
      'Aprimoramento contínuo das questões e respostas.',
    ],
  },
];
