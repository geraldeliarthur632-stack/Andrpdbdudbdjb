import { GradeLevel, Question, SubjectId, TopicLesson } from '../types';
import { GRADE_LABELS, SUBJECTS, getFallbackLesson } from '../data/curriculumData';

export interface QuestionTheoryGuide {
  topic: string;
  subjectName: string;
  gradeLabel: string;
  conceptSummary: string;
  detailedTheory: string[];
  rulesAndFormulas: string[];
  howToSolveStepByStep: string[];
  similarExample: {
    problem: string;
    solutionStep: string;
    finalTakeaway: string;
  };
  goldenTip: string;
}

// Local pedagogical theory generator for instant, latency-free, reliable explanations
export class TopicTheoryService {
  /**
   * Generates a pedagogical guide for a specific question or topic
   */
  public static getTheoryForQuestion(
    question: Question,
    userGrade: GradeLevel,
    lesson?: TopicLesson | null
  ): QuestionTheoryGuide {
    const rawSubj = (question.subject || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const topic = question.topic || 'Conceito Fundamental';
    const qText = question.question || '';
    const qLower = (qText + ' ' + topic).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let resolvedSubjId: SubjectId = 'matematica';
    if (rawSubj.includes('hist') || qLower.includes('historia') || qLower.includes('revolucao') || qLower.includes('independencia') || qLower.includes('imperio') || qLower.includes('escravidao') || qLower.includes('guerra') || qLower.includes('roma') || qLower.includes('grecia')) {
      resolvedSubjId = 'historia';
    } else if (rawSubj.includes('geo') || qLower.includes('geografia') || qLower.includes('bioma') || qLower.includes('relevo') || qLower.includes('clima') || qLower.includes('mapa')) {
      resolvedSubjId = 'geografia';
    } else if (rawSubj.includes('port') || rawSubj.includes('lingua') || qLower.includes('portugues') || qLower.includes('crase') || qLower.includes('concordancia') || qLower.includes('redacao') || qLower.includes('verbo')) {
      resolvedSubjId = 'portugues';
    } else if (rawSubj.includes('cien') || rawSubj.includes('bio') || qLower.includes('ciencia') || qLower.includes('celula') || qLower.includes('fotossintese') || qLower.includes('biologia')) {
      resolvedSubjId = 'ciencias';
    } else if (rawSubj.includes('ingl') || qLower.includes('ingles') || qLower.includes('english')) {
      resolvedSubjId = 'ingles';
    } else if (rawSubj.includes('fisic') || qLower.includes('fisica') || qLower.includes('cinematica')) {
      resolvedSubjId = 'fisica';
    } else if (rawSubj.includes('quim') || qLower.includes('quimica') || qLower.includes('atomo')) {
      resolvedSubjId = 'quimica';
    } else if (rawSubj.includes('filo') || qLower.includes('filosofia') || qLower.includes('socio')) {
      resolvedSubjId = 'historia';
    } else if (rawSubj.includes('mat') || qLower.includes('matematica') || qLower.includes('equacao') || qLower.includes('bhaskara') || qLower.includes('fracao')) {
      resolvedSubjId = 'matematica';
    } else if (SUBJECTS.some((s) => s.id === (rawSubj as SubjectId))) {
      resolvedSubjId = rawSubj as SubjectId;
    }

    const subjId = resolvedSubjId;
    const subjInfo = SUBJECTS.find((s) => s.id === subjId) || {
      name: 'Estudos Gerais',
      id: subjId,
    };
    const gradeInfo = GRADE_LABELS[userGrade] || { short: 'Série Escolar', full: 'Ensino Fundamental' };

    // 1. Build context-aware theory based on subject & keywords
    let conceptSummary = '';
    const detailedTheory: string[] = [];
    const rulesAndFormulas: string[] = [];
    let howToSolveStepByStep: string[] = [
      '1. Leia o enunciado com calma e sublinhe o comando principal (o que a questão quer que você descubra).',
      '2. Identifique os dados fornecidos e a regra teórica da matéria que se aplica a este caso.',
      '3. Elimine as opções que vão contra as regras fundamentais e teste a alternativa mais coerente.',
    ];

    let similarExample = {
      problem: 'Exemplo prático de aplicação do conteúdo.',
      solutionStep: 'Aplicando a definição teórica e o método passo a passo.',
      finalTakeaway: 'Sempre confira os detalhes antes de marcar a resposta final!',
    };

    let goldenTip = 'Preste muita atenção às palavras-chave do enunciado como "correto", "exceto", "aumenta" ou "diminui".';

    // Tailored curriculum intelligence by subject:
    if (subjId === 'matematica') {
      if (qLower.includes('multiplica') || qLower.includes('vezes') || qLower.includes('fator') || qLower.includes('produto') || qLower.includes('tabuada') || qLower.includes('dobro') || qLower.includes('triplo')) {
        conceptSummary = 'Multiplicação é a operação matemática que representa a soma repetida de parcelas iguais. Por exemplo: 4 × 3 é o mesmo que somar 4 três vezes (4 + 4 + 4 = 12).';
        detailedTheory.push(
          'Fatores (ou multiplicando e multiplicador): são os números que estão sendo multiplicados.',
          'Produto: é o resultado final obtido na multiplicação.',
          'Propriedade Comutativa: a ordem dos fatores não altera o produto (ex: 3 × 5 = 15 e 5 × 3 = 15).',
          'Elemento Neutro: qualquer número multiplicado por 1 é ele mesmo (ex: 8 × 1 = 8).',
          'Elemento Nulo: qualquer número multiplicado por 0 é igual a 0 (ex: 9 × 0 = 0).'
        );
        rulesAndFormulas.push(
          'Regra de Como Armar: Alinhe os números à direita e multiplique a unidade de baixo por todos os algarismos de cima.',
          'Regra do "Vai Um": Se a multiplicação passar de 9, coloque a unidade embaixo e suba a dezena para somar na próxima coluna.',
          'Multiplicação por 10, 100 ou 1000: basta acrescentar a quantidade de zeros à direita do número (ex: 15 × 10 = 150; 7 × 100 = 700).'
        );
        howToSolveStepByStep = [
          '1. Identifique os fatores: qual número se repete e quantas vezes ele se repete.',
          '2. Se for um cálculo de 2 dígitos, arme a conta e multiplique primeiro pelas unidades e depois pelas dezenas (lembrando de pular uma casa ou colocar o 0).',
          '3. Some os resultados parciais para encontrar o produto final.',
        ];
        similarExample = {
          problem: 'Uma caixa contém 14 pacotes de canetas, e cada pacote tem 6 canetas. Quantas canetas há no total na caixa?',
          solutionStep: '1º passo: Arme a multiplicação: 14 × 6.\n2º passo: Multiplique 6 pelas unidades: 6 × 4 = 24 (fica 4 e sobe 2).\n3º passo: Multiplique 6 pelas dezenas e some o que subiu: 6 × 1 = 6 + 2 = 8.\nResultado: 84.',
          finalTakeaway: 'Há um total de 84 canetas na caixa.',
        };
        goldenTip = 'Lembre-se: decorar a tabuada básica (de 1 a 10) torna qualquer conta de multiplicação rápida e sem erros!';
      } else if (qLower.includes('divis') || qLower.includes('divid') || qLower.includes('quociente') || qLower.includes('resto') || qLower.includes('metade') || qLower.includes('repartir')) {
        conceptSummary = 'Divisão é a operação matemática que consiste em repartir uma quantidade em partes iguais ou descobrir quantas vezes um número cabe dentro de outro.';
        detailedTheory.push(
          'Dividendo: o número total que será dividido.',
          'Divisor: em quantas partes estamos dividindo.',
          'Quociente: o resultado da divisão.',
          'Resto: o que sobra quando a divisão não é exata (o resto é sempre menor que o divisor).',
          'Operação Inversa: A divisão é o oposto da multiplicação (Se 6 × 4 = 24, então 24 ÷ 6 = 4).'
        );
        rulesAndFormulas.push(
          'Relação Fundamental da Divisão: Dividendo = (Divisor × Quociente) + Resto.',
          'Divisão Exata: quando o resto é igual a zero (ex: 20 ÷ 4 = 5, resto 0).',
          'Regra Proibida: Nunca existe divisão por ZERO na matemática!'
        );
        howToSolveStepByStep = [
          '1. Veja quantas vezes o divisor cabe no primeiro algarismo do dividendo. Se for menor, pegue os dois primeiros algarismos.',
          '2. Multiplique o divisor pelo quociente encontrado e subtraia do dividendo para achar a sobra.',
          '3. Desça o próximo algarismo e repita o processo até o final.',
        ];
        similarExample = {
          problem: 'Uma professora quer dividir igualmente 72 folhas de papel entre 6 alunos. Quantas folhas cada aluno receberá?',
          solutionStep: '1º passo: 7 dividido por 6 dá 1 e sobra 1.\n2º passo: Desce o 2, formando 12.\n3º passo: 12 dividido por 6 dá 2 e sobra 0.\nQuociente: 12.',
          finalTakeaway: 'Cada aluno receberá 12 folhas de papel.',
        };
        goldenTip = 'Para conferir se a sua divisão está certa, faça a prova real multiplicando o resultado pelo divisor: o valor deve ser exatamente igual ao dividendo!';
      } else if (qLower.includes('equaç') || qLower.includes('x') || qLower.includes('incógnita')) {
        conceptSummary = 'Uma equação é uma igualdade matemática onde queremos encontrar o valor de uma letra desconhecida (incógnita).';
        detailedTheory.push(
          'O sinal de igualdade (=) funciona como uma balança de dois pratos: o que fizermos de um lado, devemos fazer do outro.',
          'Termos com a incógnita (como "x") devem ficar de um lado, e números sozinhos do outro lado da igualdade.',
          'Ao trocar um termo de lado, invertemos sua operação: soma vira subtração, multiplicação vira divisão.'
        );
        rulesAndFormulas.push(
          'Regra de Troca de Lado: (+) ↔ (-)',
          'Regra de Multiplicação/Divisão: (·) ↔ (÷)',
          'Operação Inversa: Se 2x = 10, então x = 10 / 2 = 5'
        );
        similarExample = {
          problem: 'Resolva a equação 3x + 6 = 21.',
          solutionStep: '1º passo: Passe o +6 para o outro lado subtraindo: 3x = 21 - 6 => 3x = 15.\n2º passo: Passe o 3 dividindo: x = 15 / 3 => x = 5.',
          finalTakeaway: 'Substitua x = 5 na equação original para testar: 3·5 + 6 = 15 + 6 = 21 (Correto!).',
        };
        goldenTip = 'Para tirar a prova real, basta substituir o valor encontrado no lugar do x e verificar se a conta fecha!';
      } else if (qLower.includes('fraç') || qLower.includes('denominador') || qLower.includes('numerador')) {
        conceptSummary = 'Uma fração representa a divisão de um todo em partes iguais. O numerador indica quantas partes pegamos e o denominador em quantas partes o todo foi dividido.';
        detailedTheory.push(
          'Numerador (número de cima): parte considerada ou consumida.',
          'Denominador (número de baixo): total de partes em que o inteiro foi dividido (nunca pode ser zero).',
          'Frações Equivalentes: representam a mesma quantidade (ex: 1/2 = 2/4 = 5/10).'
        );
        rulesAndFormulas.push(
          'Soma com denominadores iguais: mantenha o denominador e some os numeradores (1/5 + 2/5 = 3/5).',
          'Soma com denominadores diferentes: calcule o MMC dos denominadores primeiro.',
          'Multiplicação de frações: multiplique cima por cima e baixo por baixo ((a/b) · (c/d) = (a·c)/(b·d)).'
        );
        similarExample = {
          problem: 'Em uma pizza de 8 fatias iguais, Lucas comeu 3 fatias. Qual fração sobrou?',
          solutionStep: '1º passo: O total é 8/8. Ele comeu 3/8.\n2º passo: A sobra é 8/8 - 3/8 = (8 - 3)/8 = 5/8.',
          finalTakeaway: 'Sobraram 5/8 da pizza.',
        };
        goldenTip = 'Lembre-se: o denominador NUNCA pode ser zero, pois não existe divisão por zero na matemática!';
      } else if (qLower.includes('porcent') || qLower.includes('%') || qLower.includes('desconto')) {
        conceptSummary = 'Porcentagem significa "por cento", ou seja, uma razão cujo denominador é 100. É muito usada em descontos, juros e estatísticas.';
        detailedTheory.push(
          '25% significa 25 dividido por 100, ou seja, 0,25 ou 1/4.',
          'Para calcular a porcentagem de um valor, transforme em decimal e multiplique (ou use regra de 3 simples).',
          'Desconto: valor original menos a porcentagem calculada. Acréscimo: valor original mais a porcentagem.'
        );
        rulesAndFormulas.push(
          '10% de X = X dividido por 10 (basta andar a vírgula 1 casa para a esquerda).',
          '50% de X = Metade de X (X / 2).',
          '20% de X = 2 vezes 10% de X.'
        );
        similarExample = {
          problem: 'Quanto é 20% de R$ 80,00?',
          solutionStep: '10% de 80 é R$ 8,00. Como 20% é o dobro de 10%, temos 8 · 2 = R$ 16,00.',
          finalTakeaway: 'Logo, 20% de 80 é igual a 16.',
        };
        goldenTip = 'Aprenda a calcular 10% de cabeça (dividindo por 10). A partir disso, você calcula qualquer outra porcentagem com facilidade!';
      } else {
        conceptSummary = `Em Matemática (${topic}), analisamos padrões lógicos, números, propriedades geométricas ou relações algébricas.`;
        detailedTheory.push(
          'Todo problema matemático possui dados de entrada (o que foi informado) e uma meta de saída (o que se quer descobrir).',
          'A precisão nas operações básicas (adição, subtração, multiplicação e divisão) é o alicerce para resolver qualquer questão.',
          'Interpretar o texto do problema em linguagem matemática é metade da resolução.'
        );
        rulesAndFormulas.push(
          'Ordem das Operações (PEMDAS/BODMAS): 1º Parênteses, 2º Potências/Raízes, 3º Multiplicações/Divisões, 4º Somas/Subtrações.',
          'Regra de Sinais: (+)(+) = (+), (-)(-) = (+), (+)(-) = (-), (-)(+) = (-).'
        );
        similarExample = {
          problem: 'Calcule o valor da expressão: 5 + 3 · 4.',
          solutionStep: '1º passo: Primeiro fazemos a multiplicação: 3 · 4 = 12.\n2º passo: Depois fazemos a soma: 5 + 12 = 17.',
          finalTakeaway: 'Atenção: se fizéssemos a soma primeiro (5+3=8 -> 8·4=32), o resultado estaria errado!',
        };
        goldenTip = 'Nunca faça somas antes das multiplicações, a menos que haja parênteses indicando a prioridade!';
      }
    } else if (subjId === 'portugues') {
      if (qLower.includes('sujeito') || qLower.includes('predicado') || qLower.includes('verbo')) {
        conceptSummary = 'A oração se divide em dois termos essenciais: Sujeito (o termo sobre o qual se faz uma declaração) e Predicado (tudo o que se declara sobre o sujeito, incluindo o verbo).';
        detailedTheory.push(
          'Para achar o sujeito: pergunte "QUEM?" ou "O QUÊ?" para o verbo da oração.',
          'Sujeito Simples: possui apenas 1 núcleo (ex: "Os alunos chegaram" -> núcleo: alunos).',
          'Sujeito Composto: possui 2 ou mais núcleos (ex: "Pedro e Maria estudaram").',
          'Sujeito Oculto/Desinencial: não está escrito, mas é identificado pela terminação verbal (ex: "Comemos pizza" -> Nós).'
        );
        rulesAndFormulas.push(
          'Pergunta mágica: [Quem / O que] + [Verbo] = Sujeito.',
          'Concordância Verbal: O verbo deve concordar em número e pessoa com o núcleo do sujeito.'
        );
        similarExample = {
          problem: 'Identifique o sujeito da frase: "O vento forte derrubou as árvores da praça".',
          solutionStep: 'Faça a pergunta ao verbo: Quem derrubou? Resposta: "O vento forte". O núcleo (palavra principal) é "vento".',
          finalTakeaway: 'Classificação: Sujeito simples (um único núcleo: vento).',
        };
        goldenTip = 'Não confunda o sujeito completo ("O vento forte") com o núcleo do sujeito ("vento"). O núcleo é a palavra substantiva mais importante!';
      } else if (qLower.includes('acentu') || qLower.includes('oxítona') || qLower.includes('paroxítona') || qLower.includes('proparoxítona')) {
        conceptSummary = 'Acentuação gráfica depende da posição da sílaba tônica (a sílaba mais forte pronunciada na palavra).';
        detailedTheory.push(
          'Oxítonas: a última sílaba é a mais forte (ex: ca-fé, a-rroz). Acentuam-se as terminadas em A, E, O (seguidas ou não de S), EM, ENS.',
          'Paroxítonas: a penúltima sílaba é a mais forte (ex: fá-cil, me-sa). É a classe mais comum no português.',
          'Proparoxítonas: a antepenúltima sílaba é a mais forte (ex: ár-vo-re, lâm-pa-da). REGRA DE OURO: TODAS as proparoxítonas são acentuadas!'
        );
        rulesAndFormulas.push(
          'Regra 1: TODAS as proparoxítonas levam acento gráfico (médico, lâmpada, pássaro).',
          'Oxítonas terminadas em -a(s), -e(s), -o(s), -em, -ens levam acento (pará, café, cipó, também).'
        );
        similarExample = {
          problem: 'Por que a palavra "LÂMPADA" é acentuada?',
          solutionStep: 'Separando as sílabas: LÂM-PA-DA. A sílaba mais forte é a antepenúltima (LÂM). Logo, é proparoxítona.',
          finalTakeaway: 'Como todas as palavras proparoxítonas recebem acento na língua portuguesa, ela deve ser acentuada.',
        };
        goldenTip = 'Sempre separe as sílabas mentalmente de trás para frente: última (oxítona), penúltima (paroxítona), antepenúltima (proparoxítona)!';
      } else {
        conceptSummary = `Em Língua Portuguesa (${topic}), estudamos a estrutura do texto, gramática, classes de palavras e interpretação leitora.`;
        detailedTheory.push(
          'Interpretar um texto exige ler o contexto geral antes de focar nos detalhes específicos.',
          'As palavras desempenham funções sintáticas (sujeito, objeto, adjunto) e morfológicas (substantivo, adjetivo, verbo, pronome).',
          'A pontuação correta (vírgula, ponto, dois-pontos) altera completamente o sentido de uma oração.'
        );
        rulesAndFormulas.push(
          'Substantivo: dá nome às coisas (casa, amor, Brasil).',
          'Adjetivo: caracteriza o substantivo (casa bonita, amor sincero).',
          'Verbo: expressa ação, estado ou fenômeno da natureza (correr, ser, chover).'
        );
        similarExample = {
          problem: 'Qual a classe gramatical da palavra destacada: "O gato CORREU pelo jardim"?',
          solutionStep: '"Correu" indica uma ação realizada pelo gato no passado.',
          finalTakeaway: 'Portanto, a classe gramatical é VERBO.',
        };
        goldenTip = 'Dica de interpretação: volte ao texto sempre que tiver dúvida para conferir exatamente o que o autor escreveu e não o que você supõe!';
      }
    } else if (subjId === 'ciencias' || subjId === 'biologia') {
      conceptSummary = `Em Ciências/Biologia (${topic}), compreendemos o funcionamento dos seres vivos, ecologia, corpo humano e leis da natureza.`;
      detailedTheory.push(
        'A célula é a unidade básica e funcional de todos os seres vivos.',
        'Organelas celulares possuem funções específicas: Mitocôndria (respiração celular/energia), Ribossomo (produção de proteínas), Núcleo (material genético DNA).',
        'Os ecossistemas dependem do equilíbrio entre seres produtores (plantas), consumidores e decompositores.'
      );
      rulesAndFormulas.push(
        'Fotossíntese: Água + Gás Carbônico + Luz Solar → Glicose + Oxigênio.',
        'Cadeia Alimentar: Produtores (Autótrofos) → Consumidores Primários (Herbívoros) → Secundários (Carnívoros) → Decompositores (Fungos e Bactérias).'
      );
      similarExample = {
        problem: 'Qual organela é responsável por gerar energia (ATP) para a célula através da respiração?',
        solutionStep: 'A mitocôndria funciona como a "usina de energia" da célula eucariótica.',
        finalTakeaway: 'Resposta: Mitocôndria.',
      };
      goldenTip = 'Lembre-se: As plantas produzem seu próprio alimento pela fotossíntese (são autótrofas), enquanto os animais precisam se alimentar de outros seres (são heterótrofos)!';
    } else if (subjId === 'historia') {
      conceptSummary = `Em História (${topic}), estudamos as ações humanas ao longo do tempo, transformações sociais, culturas e marcos políticos.`;
      detailedTheory.push(
        'Os acontecimentos históricos sempre possuem causas econômicas, sociais, políticas e culturais.',
        'A história não é feita de memorização de datas isoladas, mas da compreensão de como o passado moldou o nosso presente.',
        'Fontes históricas (documentos, cartas, fósseis, artefatos, fotos) são as evidências usadas pelos historiadores.'
      );
      rulesAndFormulas.push(
        'Linha do Tempo Tradicional: Pré-História → Idade Antiga → Idade Média → Idade Moderna → Idade Contemporânea.',
        'Causa e Consequência: Todo evento histórico é motivado por fatores prévios e gera impactos posteriores.'
      );
      similarExample = {
        problem: 'Qual foi o principal motivo para a Proclamação da República no Brasil em 1889?',
        solutionStep: 'O Império de D. Pedro II perdeu o apoio dos cafeicultores (após a abolição da escravidão), da Igreja Católica e dos militares do Exército.',
        finalTakeaway: 'O isolamento político da monarquia levou os militares liderados por Deodoro da Fonseca a proclamarem a República.',
      };
      goldenTip = 'Procure sempre relacionar quem eram os grupos sociais envolvidos em cada conflito ou evento histórico!';
    } else if (subjId === 'geografia') {
      conceptSummary = `Em Geografia (${topic}), investigamos o espaço geográfico, as paisagens, os fenômenos climáticos e a relação entre a humanidade e a natureza.`;
      detailedTheory.push(
        'Espaço Geográfico: é o espaço natural transformado pelas atividades humanas.',
        'Coordenadas Geográficas: Latitude (linhas horizontais / paralelos de 0° a 90° N/S a partir do Equador) e Longitude (linhas verticais / meridianos de 0° a 180° L/O a partir de Greenwich).',
        'Clima vs. Tempo: Tempo é o estado momentâneo da atmosfera (hoje está chovendo); Clima é o padrão atmosférico observado ao longo de muitos anos.'
      );
      rulesAndFormulas.push(
        'Paralelos principais: Equador (0°), Trópico de Câncer, Trópico de Capricórnio, Círculos Polares.',
        'Meridiano principal: Greenwich (0°) - define os fusos horários mundiais.'
      );
      similarExample = {
        problem: 'Diferencie tempo meteorológico de clima.',
        solutionStep: 'Tempo é variável e imediato (ex: "hoje fez frio e choveu à tarde"). Clima é o comportamento constante ao longo de pelo menos 30 anos (ex: "o Nordeste semiárido possui clima seco").',
        finalTakeaway: 'Tempo muda todo dia; clima é a característica permanente de uma região.',
      };
      goldenTip = 'Para lembrar de Latitude e Longitude: Latitude = linhas Deitadas (paralelos ao Equador); Longitude = linhas Longas em pé (de polo a polo)!';
    } else if (subjId === 'fisica') {
      conceptSummary = `Em Física (${topic}), compreendemos como as forças, o movimento, a energia, a eletricidade e as ondas interagem no universo.`;
      detailedTheory.push(
        'Cinemática: estuda o movimento dos corpos sem se preocupar com as suas causas.',
        'Velocidade Média: é a razão entre o deslocamento (espaço percorrido) e o intervalo de tempo gasto.',
        'Leis de Newton: 1ª Lei (Inércia), 2ª Lei (Princípio Fundamental: Força = massa · aceleração), 3ª Lei (Ação e Reação).'
      );
      rulesAndFormulas.push(
        'Velocidade Média: Vm = Δs / Δt',
        '2ª Lei de Newton: F = m · a (Força em Newtons, massa em kg, aceleração em m/s²)',
        'Energia Cinética: Ec = (m · v²) / 2'
      );
      similarExample = {
        problem: 'Um carro percorre 120 km em 2 horas. Qual foi sua velocidade média?',
        solutionStep: 'Aplicando a fórmula Vm = Δs / Δt:\nVm = 120 km / 2 h = 60 km/h.',
        finalTakeaway: 'A velocidade média do veículo foi de 60 km/h.',
      };
      goldenTip = 'Sempre confira as unidades de medida! No Sistema Internacional (SI), a distância é em metros (m), o tempo em segundos (s) e a velocidade em m/s (multiplique por 3,6 para passar para km/h).';
    } else if (subjId === 'quimica') {
      conceptSummary = `Em Química (${topic}), analisamos a matéria, suas propriedades, transformações, ligações atômicas e reações químicas.`;
      detailedTheory.push(
        'O átomo é formado por Prótons (+) e Nêutrons (0) no núcleo, e Elétrons (-) na eletrosfera.',
        'Mistura Homogênea: apresenta apenas 1 fase visual (ex: água com sal dissolvido). Mistura Heterogênea: apresenta 2 ou mais fases visíveis (ex: água e óleo).',
        'Fenômeno Físico: não altera a substância (ex: gelo derretendo). Fenômeno Químico: forma novas substâncias (ex: papel queimando, ferro enferrujando).'
      );
      rulesAndFormulas.push(
        'Número Atômico (Z): número de prótons no núcleo.',
        'Número de Massa (A): A = Prótons (Z) + Nêutrons (N)',
        'Lei de Lavoisier: "Na natureza nada se cria, nada se perde, tudo se transforma" (Massa dos reagentes = Massa dos produtos).'
      );
      similarExample = {
        problem: 'Classifique a queima de uma vela como fenômeno físico ou químico.',
        solutionStep: 'Ao queimar, o pavio e a parafina reagem com o oxigênio liberando gás carbônico e vapor de água, transformando a matéria.',
        finalTakeaway: 'Trata-se de um fenômeno QUÍMICO (reação de combustão).',
      };
      goldenTip = 'Dica rápida: se houve mudança de cheiro, cor, formação de gás ou liberação de luz/calor, é quase sempre uma reação química!';
    } else if (subjId === 'ingles' || subjId === 'espanhol' || subjId === 'italiano') {
      const langName = subjId === 'ingles' ? 'Inglês' : subjId === 'espanhol' ? 'Espanhol' : 'Italiano';
      conceptSummary = `Em Língua Estrangeira (${langName} - ${topic}), focamos em vocabulário, estrutura gramatical e sentido prático das frases no dia a dia.`;
      detailedTheory.push(
        'Observe o contexto da frase antes de traduzir palavra por palavra.',
        'Cuidado com os Falsos Cognatos (palavras que parecem do português, mas têm significado diferente).',
        'Preste atenção aos pronomes, tempos verbais e saudações comuns.'
      );
      rulesAndFormulas.push(
        'Inglês: Verbo To Be (Am / Is / Are) = Ser ou Estar.',
        'Espanhol: "Muito" antes de adjetivo/advérbio vira "MUY"; antes de substantivo vira "MUCHO".',
        'Italiano: "Ciao" serve tanto para "Olá" (chegada) quanto para "Tchau" (despedida).'
      );
      similarExample = {
        problem: `Como traduzir a ideia central da frase no contexto de ${langName}?`,
        solutionStep: 'Analise o sujeito da oração, o verbo principal e o objeto.',
        finalTakeaway: 'Adapte ao modo natural de falar do idioma sem traduções literais truncadas.',
      };
      goldenTip = 'Ao estudar idiomas, pratique a pronúncia em voz alta e relacione as palavras novas com imagens ou situações reais!';
    } else {
      conceptSummary = `Este tópico (${topic}) faz parte do currículo da ${gradeInfo.short} em ${subjInfo.name}.`;
      detailedTheory.push(
        'Leia com atenção cada alternativa e elimine as opções obviamente incorretas.',
        'Conecte o conteúdo com exemplos práticos do seu cotidiano.',
        'Utilize o método de raciocínio passo a passo para testar cada afirmação.'
      );
      rulesAndFormulas.push(
        'Identifique o sujeito ou conceito chave da questão.',
        'Verifique a coerência lógica entre o enunciado e as alternativas.'
      );
    }

    // Enhance with lesson specific summary if available
    if (lesson) {
      if (lesson.detailedExplanation) {
        detailedTheory.unshift(lesson.detailedExplanation);
      }
      if (lesson.keyPoints && lesson.keyPoints.length > 0) {
        rulesAndFormulas.push(...lesson.keyPoints.slice(0, 2));
      }
      if (lesson.example) {
        similarExample.problem = `Exemplo da lição (${lesson.title}):`;
        similarExample.solutionStep = lesson.example;
      }
    }

    return {
      topic,
      subjectName: subjInfo.name,
      gradeLabel: gradeInfo.short,
      conceptSummary,
      detailedTheory,
      rulesAndFormulas,
      howToSolveStepByStep,
      similarExample,
      goldenTip,
    };
  }

  /**
   * Save a theory summary directly into the user's Quick Notes notebook
   */
  public static saveTheoryToNotes(theory: QuestionTheoryGuide): boolean {
    try {
      const STORAGE_KEY = 'estudahud_quick_notes_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      let notes = [];
      if (raw) {
        try {
          notes = JSON.parse(raw);
        } catch {}
      }

      const noteTitle = `📖 ${theory.subjectName}: ${theory.topic}`;
      const noteContent =
        `📚 CONCEITO PRINCIPAL (${theory.gradeLabel}):\n${theory.conceptSummary}\n\n` +
        `⚡ REGRAS & FÓRMULAS:\n${theory.rulesAndFormulas.map((r) => `• ${r}`).join('\n')}\n\n` +
        `🧠 COMO PENSAR / RESOLVER:\n${theory.howToSolveStepByStep.join('\n')}\n\n` +
        `💡 EXEMPLO PRÁTICO:\n${theory.similarExample.problem}\n${theory.similarExample.solutionStep}\n\n` +
        `🌟 DICA DE OURO: ${theory.goldenTip}`;

      const newNote = {
        id: `theory_note_${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        category: 'concept',
        isPinned: true,
        color: 'emerald',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      notes.unshift(newNote);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      return true;
    } catch {
      return false;
    }
  }
}
