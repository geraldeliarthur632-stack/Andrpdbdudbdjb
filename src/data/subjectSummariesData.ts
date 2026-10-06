import { GradeLevel, SubjectId } from '../types';

export interface SummaryExample {
  title: string;
  problem: string;
  stepByStepSolution: string;
  finalAnswer: string;
}

export interface TopicSummaryItem {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  gradeLevels: GradeLevel[]; // Which grades this topic applies to
  title: string; // e.g., "Multiplicação"
  category: string; // e.g., "Operações Básicas & Álgebra"
  howItWorks: string; // "Como se faz / Teoria e Passo a Passo"
  keySteps: string[]; // Steps 1, 2, 3...
  rulesAndFormulas?: string[]; // Important rules or formulas
  examples: SummaryExample[]; // "Exemplos: ..."
  goldenTips: string; // Exam tips / quick shortcuts
}

export const SUBJECT_SUMMARIES_DATABASE: TopicSummaryItem[] = [
  // ==========================================
  // MATEMÁTICA
  // ==========================================
  {
    id: 'mat_multiplicacao',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    gradeLevels: ['1_fund', '2_fund', '3_fund', '4_fund', '5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Multiplicação',
    category: 'Aritmética & Operações Básicas',
    howItWorks:
      'A multiplicação é a operação matemática que representa a soma repetida de uma mesma quantidade várias vezes. Em vez de somar 4 + 4 + 4, fazemos 4 × 3 = 12. Os números que multiplicamos são chamados de FATORES (ou multiplicando e multiplicador) e o resultado final é chamado de PRODUTO.',
    keySteps: [
      '1. Alinhe os números em coluna, colocando o número com mais algarismos em cima e o menor embaixo, alinhados pela direita (unidades embaixo de unidades).',
      '2. Multiplique o algarismo das unidades de baixo por cada algarismo do número de cima, da direita para a esquerda.',
      '3. Se o resultado da multiplicação der 10 ou mais, escreva apenas a unidade embaixo e suba a dezena ("vai um") para somar na próxima multiplicação.',
      '4. Se o multiplicador tiver dois ou mais dígitos (ex: 23), quando for multiplicar a dezena (o número 2), pule uma casa para a esquerda (ou coloque um zero) na linha de baixo.',
      '5. Some todas as linhas de resultados parciais para encontrar o produto final.',
    ],
    rulesAndFormulas: [
      'Propriedade Comutativa: A ordem dos fatores NÃO altera o produto (Ex: 6 × 7 = 42 e 7 × 6 = 42).',
      'Elemento Neutro: Qualquer número multiplicado por 1 é ele mesmo (Ex: 35 × 1 = 35).',
      'Elemento Nulo: Qualquer número multiplicado por 0 é sempre igual a ZERO (Ex: 148 × 0 = 0).',
      'Multiplicação por 10, 100 ou 1000: Basta acrescentar os zeros à direita do número (Ex: 45 × 10 = 450 | 12 × 100 = 1.200).',
      'Regra de Sinais: Sinais iguais resultam em positivo (+ · + = + | - · - = +); Sinais diferentes resultam em negativo (+ · - = - | - · + = -).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Multiplicação com "Vai Um" (Simples)',
        problem: 'Quanto é 36 × 4?',
        stepByStepSolution:
          '1º Passo: Multiplicamos 4 pelas unidades (4 × 6 = 24). Deixamos o 4 embaixo e subimos o 2 para a casa das dezenas.\n2º Passo: Multiplicamos 4 pelas dezenas (4 × 3 = 12) e somamos o 2 que subiu: 12 + 2 = 14.\n3º Passo: Juntamos os resultados obtendo 144.',
        finalAnswer: '36 × 4 = 144',
      },
      {
        title: 'Exemplo 2: Multiplicação com 2 Dígitos e Problema do Cotidiano',
        problem: 'Uma escola comprou 25 caixas de lápis. Cada caixa contém 18 lápis. Quantos lápis a escola comprou no total?',
        stepByStepSolution:
          'Armamos a conta: 25 × 18\n• 1ª Linha (multiplicando por 8): 8 × 25 = 200.\n• 2ª Linha (multiplicando por 1 da dezena): pulamos 1 casa e fazemos 1 × 25 = 250.\n• Somamos as parcelas: 200 + 250 = 450.',
        finalAnswer: 'A escola comprou 450 lápis no total.',
      },
    ],
    goldenTips:
      'Macetes de Estudo: Pratique a tabuada básica de 1 a 10 diariamente. Ao multiplicar números decimais (com vírgula), faça a conta normalmente sem vírgula e, no resultado final, conte o total de casas decimais dos dois números e ande a vírgula para a esquerda!',
  },

  {
    id: 'mat_divisao',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    gradeLevels: ['2_fund', '3_fund', '4_fund', '5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Divisão',
    category: 'Aritmética & Operações Básicas',
    howItWorks:
      'A divisão é a operação inversa da multiplicação. Ela serve para repartir uma quantidade em partes rigorosamente iguais ou descobrir quantas vezes uma quantidade cabe dentro de outra. Os termos são: DIVIDENDO (o total a ser dividido), DIVISOR (em quantas partes vamos dividir), QUOCIENTE (o resultado da divisão) e RESTO (o que sobra).',
    keySteps: [
      '1. Monte a chave da divisão colocando o dividendo à esquerda e o divisor dentro da chave.',
      '2. Veja se o primeiro algarismo da esquerda do dividendo é maior ou igual ao divisor. Se for menor, junte com o próximo algarismo.',
      '3. Descubra quantas vezes o divisor cabe naquele número e escreva esse valor no quociente.',
      '4. Multiplique o quociente pelo divisor e subtraia o resultado para achar o resto parcial.',
      '5. "Abaixe" o próximo algarismo do dividendo ao lado do resto e repita o processo até acabar os algarismos.',
    ],
    rulesAndFormulas: [
      'Relação Fundamental da Divisão: Dividendo = (Divisor × Quociente) + Resto.',
      'Divisão Exata: Quando o resto é igual a zero (Resto = 0).',
      'Regra de Ouro: O resto NUNCA pode ser maior ou igual ao divisor. Se for, você errou o número do quociente!',
      'Divisão por Zero: NUNCA é permitida na matemática (não existe dividir por 0).',
      'Prova Real da Divisão: Multiplique o Quociente pelo Divisor e some o Resto; o resultado deve dar o Dividendo.',
    ],
    examples: [
      {
        title: 'Exemplo 1: Divisão Exata Passo a Passo',
        problem: 'Calcule 156 ÷ 4.',
        stepByStepSolution:
          '1º Passo: O 1 é menor que 4, então pegamos 15. Quantas vezes 4 cabe em 15? Cabe 3 vezes (3 × 4 = 12). Sobram 15 - 12 = 3.\n2º Passo: Abaixamos o 6 ao lado do 3, formando 36.\n3º Passo: Quantas vezes 4 cabe em 36? Cabe 9 vezes (9 × 4 = 36). Sobram 36 - 36 = 0.',
        finalAnswer: '156 ÷ 4 = 39 (Resto 0)',
      },
      {
        title: 'Exemplo 2: Divisão Não Exata com Resto no Cotidiano',
        problem: 'Um agricultor colheu 95 laranjas e quer colocá-las em sacos com 8 laranjas cada. Quantos sacos cheios ele terá e quantas laranjas sobrarão?',
        stepByStepSolution:
          'Dividimos 95 por 8:\n• 9 ÷ 8 = 1 (sobra 1). Abaixamos o 5, formando 15.\n• 15 ÷ 8 = 1 (1 × 8 = 8). Sobram 15 - 8 = 7 laranjas.',
        finalAnswer: 'Ele terá 11 sacos cheios e sobrarão 7 laranjas.',
      },
    ],
    goldenTips:
      'Macete da Prova Real: Para ter 100% de certeza de que acertou a divisão na prova, faça: (Quociente × Divisor) + Resto. Se der exatamente o Dividendo, sua resposta está certa!',
  },

  {
    id: 'mat_fracoes',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    gradeLevels: ['4_fund', '5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Frações e Números Decimais',
    category: 'Números & Proporções',
    howItWorks:
      'Uma fração representa uma ou mais partes iguais de um todo dividido. O número superior é o NUMERADOR (indica quantas partes foram consideradas/pegas) e o número inferior é o DENOMINADOR (indica em quantas partes iguais o todo foi dividido). Toda fração também pode ser lida como uma divisão direta entre o numerador e o denominador.',
    keySteps: [
      '1. Para Somar/Subtrair Frações com Denominadores IGUAIS: Mantenha o denominador e some ou subtraia apenas os numeradores (Ex: 2/7 + 3/7 = 5/7).',
      '2. Para Somar/Subtrair com Denominadores DIFERENTES: Encontre o MMC dos denominadores, divida pelo de baixo e multiplique pelo de cima (método da borboleta ou MMC).',
      '3. Para Multiplicar Frações: Multiplique numerador com numerador (de cima com de cima) e denominador com denominador (de baixo com de baixo).',
      '4. Para Dividir Frações: Mantenha a primeira fração e multiplique pelo inverso da segunda fração.',
      '5. Para Simplificar: Divida o numerador e o denominador pelo mesmo número (MDC) até a fração ficar irredutível.',
    ],
    rulesAndFormulas: [
      'Multiplicação: (a / b) × (c / d) = (a × c) / (b × d)',
      'Divisão: (a / b) ÷ (c / d) = (a / b) × (d / c) = (a × d) / (b × c)',
      'Conversão para Decimal: Divida o numerador pelo denominador (Ex: 3/4 = 3 ÷ 4 = 0,75).',
      'Frações Equivalentes: Multiplicar ou dividir numerador e denominador pelo mesmo número gera frações com o mesmo valor (Ex: 1/2 = 2/4 = 4/8).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Soma de Frações com Denominadores Diferentes',
        problem: 'Calcule 1/3 + 2/5.',
        stepByStepSolution:
          '1º Passo: MMC entre 3 e 5 é 15.\n2º Passo: Transformamos as frações: (15 ÷ 3) × 1 = 5/15 e (15 ÷ 5) × 2 = 6/15.\n3º Passo: Somamos os numeradores: 5/15 + 6/15 = 11/15.',
        finalAnswer: '1/3 + 2/5 = 11/15',
      },
      {
        title: 'Exemplo 2: Multiplicação e Divisão de Frações',
        problem: 'Calcule: A) (3/4) × (2/5)  e  B) (2/3) ÷ (4/5).',
        stepByStepSolution:
          'A) Multiplicação: (3 × 2) / (4 × 5) = 6/20. Simplificando por 2: 3/10.\nB) Divisão: Invertemos a 2ª fração e multiplicamos: (2/3) × (5/4) = 10/12. Simplificando por 2: 5/6.',
        finalAnswer: 'A) 3/10 | B) 5/6',
      },
    ],
    goldenTips:
      'Macete do "X" (Borboleta para soma de 2 frações): Multiplique os denominadores para o número de baixo (b × d). Para o número de cima, multiplique cruzado e some: (a × d) + (b × c)!',
  },

  {
    id: 'mat_equacoes_1grau',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    gradeLevels: ['6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Equações do 1º Grau',
    category: 'Álgebra & Raciocínio',
    howItWorks:
      'Uma equação do 1º grau é uma igualdade matemática que envolve números e uma letra desconhecida chamada INCÓGNITA (geralmente representada por "x"). Resolver uma equação significa "isolar o x" para descobrir qual número torna a igualdade verdadeira.',
    keySteps: [
      '1. Enxergue a equação como uma balança de dois pratos em equilíbrio perfeita.',
      '2. Agrupe todos os termos que têm "x" no 1º membro (lado esquerdo da igualdade).',
      '3. Coloque todos os números que NÃO têm "x" no 2º membro (lado direito da igualdade).',
      '4. Regra Fundamental de Troca de Lado: Ao passar qualquer termo para o outro lado do sinal de igual (=), você DEVE INVERTER a operação:',
      '   • O que está somando (+) passa subtraindo (-).',
      '   • O que está subtraindo (-) passa somando (+).',
      '   • O que está multiplicando (·) passa dividindo (÷).',
      '   • O que está dividindo (÷) passa multiplicando (·).',
      '5. Reduza os termos semelhantes e divida o número final pelo coeficiente do x.',
    ],
    rulesAndFormulas: [
      'Forma Geral: ax + b = 0  (onde a ≠ 0)',
      'Solução Única: x = -b / a',
      'Eliminação de Parênteses: Use a propriedade distributiva (chuveirinho): 2(x + 4) = 2x + 8.',
      'Tirando a Prova Real: Substitua o valor de x encontrado na equação inicial; se o lado esquerdo for igual ao direito, está 100% correto!',
    ],
    examples: [
      {
        title: 'Exemplo 1: Equação Básica com Troca de Sinal',
        problem: 'Resolva a equação: 4x - 8 = 20.',
        stepByStepSolution:
          '1º Passo: Passamos o -8 para o lado direito com sinal invertido (+8):\n   4x = 20 + 8\n   4x = 28\n2º Passo: O 4 está multiplicando o x, então passa dividindo:\n   x = 28 / 4\n   x = 7.',
        finalAnswer: 'x = 7',
      },
      {
        title: 'Exemplo 2: Equação com x dos dois lados e problema contextualizado',
        problem: 'O dobro de um número somado a 15 é igual ao quíntuplo desse número menos 12. Qual é esse número?',
        stepByStepSolution:
          'Montando a equação: 2x + 15 = 5x - 12\n1º Passo: Letras para a esquerda e números para a direita:\n   2x - 5x = -12 - 15\n   -3x = -27\n2º Passo: Multiplicamos por (-1) para deixar o x positivo:\n   3x = 27\n   x = 27 / 3 = 9.',
        finalAnswer: 'O número procurado é 9.',
      },
    ],
    goldenTips:
      'Atenção Máxima com Sinais: O erro mais comum em provas é esquecer de trocar o sinal ao mudar de lado. Lembre-se: trocou de lado do igual, trocou o sinal!',
  },

  {
    id: 'mat_porcentagem_regra3',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Porcentagem & Regra de Três',
    category: 'Matemática Financeira & Proporções',
    howItWorks:
      'Porcentagem significa "por cento" (divisão por 100). O símbolo % representa uma fração com denominador 100. A Regra de Três Simples é a ferramenta matemática que permite descobrir um 4º valor desconhecido a partir de 3 valores proporcionais conhecidos.',
    keySteps: [
      '1. Para calcular porcentagem de um valor: Transforme a porcentagem em decimal (dividindo por 100) e multiplique pelo valor (Ex: 15% de 200 = 0,15 × 200 = 30).',
      '2. Para montar a Regra de Três: Organize os dados em colunas com grandezas iguais alinhadas (Ex: Dinheiro embaixo de Dinheiro, Porcentagem embaixo de Porcentagem).',
      '3. Coloque 100% como o total de referência na linha do valor integral.',
      '4. Multiplique cruzado (em "X"): Valor 1 × %2 = Valor 2 × %1.',
      '5. Isole a incógnita x dividindo pelo número que está multiplicando.',
    ],
    rulesAndFormulas: [
      'Fórmula Rápida: Porcentagem = (Valor Total × Taxa%) / 100',
      'Cálculo Mental Rápido: 10% = divida por 10 | 50% = divida por 2 | 25% = divida por 4 | 1% = divida por 100.',
      'Acréscimo: Valor Final = Valor Inicial × (1 + taxa decimal). Ex: +20% -> Multiplique por 1,20.',
      'Desconto: Valor Final = Valor Inicial × (1 - taxa decimal). Ex: -15% -> Multiplique por 0,85.',
    ],
    examples: [
      {
        title: 'Exemplo 1: Desconto Comercial em Compras',
        problem: 'Um tênis custa R$ 240,00, mas está com 15% de desconto à vista. Qual o valor do desconto e o preço final a pagar?',
        stepByStepSolution:
          '1º Passo: Calculamos o valor do desconto: 15% de 240 = (15 × 240) / 100 = 3600 / 100 = R$ 36,00 de desconto.\n2º Passo: Subtraímos do preço original: 240 - 36 = R$ 204,00.',
        finalAnswer: 'O desconto é de R$ 36,00 e o preço final é R$ 204,00.',
      },
      {
        title: 'Exemplo 2: Regra de Três Simples Direta',
        problem: 'Um carro gasta 12 litros de gasolina para percorrer 180 km. Quantos litros gastará para percorrer 300 km na mesma velocidade?',
        stepByStepSolution:
          'Montando a tabela:\nLitros    | Distância (km)\n12        | 180\nx         | 300\nMultiplicando cruzado: 180 × x = 12 × 300\n180x = 3.600 => x = 3.600 / 180 = 20 litros.',
        finalAnswer: 'O carro gastará 20 litros de gasolina.',
      },
    ],
    goldenTips:
      'Dica de Ouro de Cálculo Mental: Para achar 15% de cabeça: ache 10% (andando 1 vírgula para a esquerda), pegue a metade disso (que é 5%) e some os dois!',
  },

  // ==========================================
  // LÍNGUA PORTUGUESA
  // ==========================================
  {
    id: 'port_sujeito_predicado',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Sujeito e Predicado',
    category: 'Sintaxe & Análise da Oração',
    howItWorks:
      'A oração é organizada em torno de um verbo. Os dois termos fundamentais da oração são o SUJEITO (o termo sobre o qual se declara algo) e o PREDICADO (tudo aquilo que se declara sobre o sujeito, incluindo obrigatoriamente o verbo).',
    keySteps: [
      '1. Localize primeiro o VERBO da frase.',
      '2. Faça a "pergunta mágica" antes do verbo: "QUEM É QUE...?" ou "O QUE É QUE...?".',
      '3. A resposta dessa pergunta é o SUJEITO da oração.',
      '4. Tudo o que sobrar na frase (incluindo o próprio verbo) é o PREDICADO.',
      '5. Identifique o NÚCLEO do sujeito: é a palavra substantiva mais importante (sem preposição).',
    ],
    rulesAndFormulas: [
      'Sujeito Simples: Possui apenas 1 único núcleo (Ex: "Os alunos dedicados estudaram muito" -> Núcleo: alunos).',
      'Sujeito Composto: Possui 2 ou mais núcleos (Ex: "Pedro e Mariana fizeram o trabalho" -> Núcleos: Pedro, Mariana).',
      'Sujeito Oculto / Desinencial: Não está escrito explicitamente, mas é identificado pela terminação do verbo (Ex: "Viajamos ontem" -> Nós).',
      'Sujeito Indeterminado: Ocorre com verbo na 3ª pessoa do plural sem referência prévia (Ex: "Quebraram a janela") ou verbo + SE (Ex: "Precisa-se de ajudantes").',
      'Oração Sem Sujeito: Com verbos impessoais como HAVER (no sentido de existir), FAZER (tempo decorrido) ou verbos de fenômenos da natureza (chover, nevar).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Identificação de Sujeito e Núcleo',
        problem: 'Identifique o sujeito, o núcleo e o predicado na frase: "O vento forte da tempestade derrubou a cerca antiga".',
        stepByStepSolution:
          '1º Passo: Verbo = "derrubou".\n2º Passo: Quem derrubou a cerca? Resposta = "O vento forte da tempestade" (Sujeito).\n3º Passo: Palavra principal sem preposição = "vento" (Núcleo do sujeito).\n4º Passo: O que sobrou = "derrubou a cerca antiga" (Predicado).',
        finalAnswer: 'Sujeito: "O vento forte da tempestade" (Simples, núcleo: vento) | Predicado: "derrubou a cerca antiga".',
      },
      {
        title: 'Exemplo 2: Cuidado com Sujeito Oculto e Verbo Haver',
        problem: 'Classifique o sujeito em: A) "Comprei dois livros novos."  B) "Havia muitos alunos na sala."',
        stepByStepSolution:
          'A) Verbo "comprei" indica a 1ª pessoa do singular (Eu) -> Sujeito Oculto/Desinencial (Eu).\nB) Verbo "havia" está no sentido de existir -> Oração Sem Sujeito (Verbo impessoal).',
        finalAnswer: 'A) Sujeito Oculto (Eu) | B) Oração Sem Sujeito / Sujeito Inexistente.',
      },
    ],
    goldenTips:
      'Pegadinha de Prova: O verbo HAVER no sentido de existir NUNCA vai para o plural! Diz-se "Havia muitas pessoas" e NUNCA "Haviam muitas pessoas"!',
  },

  {
    id: 'port_acentuacao_grafica',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    gradeLevels: ['3_fund', '4_fund', '5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Acentuação Gráfica & Sílaba Tônica',
    category: 'Ortografia & Fonética',
    howItWorks:
      'As palavras na língua portuguesa possuem uma sílaba pronunciada com maior intensidade (chamada SÍLABA TÔNICA). Conforme a posição dessa sílaba mais forte (contando de trás para frente), as palavras são classificadas em Oxítonas, Paroxítonas ou Proparoxítonas, o que determina as regras de acento gráfico.',
    keySteps: [
      '1. Pronuncie a palavra "chamando" como se chamasse alguém no portão para identificar a sílaba que você estica a voz (a sílaba tônica).',
      '2. Conte a posição da sílaba forte de trás para frente:',
      '   • Última sílaba = OXÍTONA (Ex: ca-FÉ, a-RROZ, sa-CI).',
      '   • Penúltima sílaba = PAROXÍTONA (Ex: FÁ-cil, ME-sa, li-VRO).',
      '   • Antepenúltima sílaba = PROPAROXÍTONA (Ex: MÉ-di-co, LÂM-pa-da, ÁR-vo-re).',
      '3. Aplique a regra de acentuação correspondente à terminação da palavra.',
    ],
    rulesAndFormulas: [
      'Regra 1 (Proparoxítonas): TODAS as proparoxítonas são acentuadas sem exceção! (Ex: pássaro, relâmpago, física, matemática).',
      'Regra 2 (Oxítonas): Acentuam-se as terminadas em: -A(S), -E(S), -O(S), -EM, -ENS e ditongos abertos ÉI, ÉU, ÓI (Ex: sofá, você, cipó, também, parabéns, troféu).',
      'Regra 3 (Paroxítonas): Acentuam-se as que NÃO terminam como as oxítonas (terminadas em -R, -X, -N, -L, -I(S), -US, -UM, -Ã(S), -ÃO(S), -PS, ditongo). Mnemônico: ROUXINOL / LINUS PSI.',
      'Regra 4 (Hiatos I e U): Acentuam-se I e U tônicos sozinhos na sílaba ou com "S", que não formem sílaba com NH (Ex: sa-ú-de, pa-ís, ba-ú; mas ra-i-nha não leva acento).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Justificativa de Acento em Proparoxítona',
        problem: 'Por que a palavra "LÂMPADA" recebe acento circunflexo?',
        stepByStepSolution:
          '1º Passo: Separamos em sílabas: LÂM - PA - DA.\n2º Passo: A sílaba tônica é a antepenúltima (LÂM), portanto a palavra é Proparoxítona.\n3º Passo: Pela regra gramatical, todas as proparoxítonas da língua portuguesa são obrigatoriamente acentuadas.',
        finalAnswer: 'Porque é uma palavra proparoxítona (e todas as proparoxítonas levam acento).',
      },
      {
        title: 'Exemplo 2: Análise de Oxítona e Paroxítona',
        problem: 'Classifique e justifique o acento de: A) "Café"  B) "Fácil".',
        stepByStepSolution:
          'A) Ca-FÉ: A última sílaba é a mais forte (Oxítona) e termina em "E" -> Acentuada por ser oxítona terminada em -e.\nB) FÁ-cil: A penúltima sílaba é a mais forte (Paroxítona) e termina em "L" -> Acentuada por ser paroxítona terminada em -l.',
        finalAnswer: 'A) Oxítona terminada em -e | B) Paroxítona terminada em -l.',
      },
    ],
    goldenTips:
      'Mnemônico Infalível: Toda vez que você separar uma palavra e a 3ª sílaba de trás para frente for a mais forte, coloque acento imediatamente, pois é proparoxítona!',
  },

  // ==========================================
  // CIÊNCIAS DA NATUREZA & BIOLOGIA
  // ==========================================
  {
    id: 'cie_celula_fotossintese',
    subjectId: 'ciencias',
    subjectName: 'Ciências da Natureza',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Células, Fotossíntese & Respiração Celular',
    category: 'Biologia & Seres Vivos',
    howItWorks:
      'A célula é a menor unidade estrutural e funcional que constitui todos os seres vivos. Ela possui organelas que funcionam como pequenos órgãos celulares. As plantas produzem seu próprio alimento por meio da FOTOSSÍNTESE, e todos os seres vivos realizam a RESPIRAÇÃO CELULAR para extrair energia do alimento.',
    keySteps: [
      '1. Partes Básicas da Célula: Membrana Plasmática (controla a entrada e saída de substâncias), Citoplasma (meio gelatinoso onde ficam as organelas) e Núcleo (armazena o DNA e comanda as atividades).',
      '2. Diferença Chave: Célula Vegetal possui Parede Celular rígida, Vacúolo grande e Cloroplastos (que contêm clorofila para capturar a luz solar); a célula animal não tem essas estruturas.',
      '3. Mecanismo da Fotossíntese: A planta absorve Água pelas raízes + Gás Carbônico (CO2) pelas folhas + Luz Solar e produz GLICOSE (açúcar/energia) e libera OXIGÊNIO (O2) para a atmosfera.',
      '4. Mecanismo da Respiração Celular: Acontece nas MITOCÔNDRIAS, combinando Glicose + Oxigênio para produzir ENERGIA (ATP), liberando Água e CO2.',
    ],
    rulesAndFormulas: [
      'Equação da Fotossíntese: 6 CO2 (Gás Carbônico) + 6 H2O (Água) + Luz → C6H12O6 (Glicose) + 6 O2 (Oxigênio)',
      'Equação da Respiração Celular: C6H12O6 (Glicose) + 6 O2 (Oxigênio) → 6 CO2 + 6 H2O + ENERGIA (ATP)',
      'Mitocôndria = "Usina de Energia" da célula (Respiração Celular).',
      'Cloroplasto = "Cozinha da Planta" (Fotossíntese).',
      'Ribossomo = "Fábrica de Proteínas".',
    ],
    examples: [
      {
        title: 'Exemplo 1: Função das Organelas Celulares',
        problem: 'Qual organela celular é responsável por produzir a energia necessária para as atividades da célula?',
        stepByStepSolution:
          '1º Passo: A produção de energia ocorre pelo processo de respiração celular através da molécula de ATP.\n2º Passo: A organela especializada nesse processo em células eucarióticas é a Mitocôndria.',
        finalAnswer: 'Mitocôndria (responsável pela respiração celular e produção de energia ATP).',
      },
      {
        title: 'Exemplo 2: Relação entre Plantas e Atmosfera',
        problem: 'Por que os vegetais são chamados de organismos autótrofos e qual a importância do oxigênio liberado por eles?',
        stepByStepSolution:
          'Autótrofos ("produzem o próprio alimento"): Porque sintetizam matéria orgânica (glicose) através da fotossíntese usando luz solar e CO2. O oxigênio liberado é vital para a respiração de animais e seres humanos.',
        finalAnswer: 'São autótrofos por realizarem fotossíntese; o oxigênio liberado sustenta a respiração aeróbica no planeta.',
      },
    ],
    goldenTips:
      'Lembrete Crucial: As plantas realizam FOTOSSÍNTESE durante o dia (na presença de luz), mas RESPIRAM 24 horas por dia (dia e noite) consumindo oxigênio e liberando CO2 como qualquer ser vivo!',
  },

  // ==========================================
  // HISTÓRIA
  // ==========================================
  {
    id: 'hist_brasil_colonia',
    subjectId: 'historia',
    subjectName: 'História',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Brasil Colônia & Ciclos Econômicos',
    category: 'História do Brasil',
    howItWorks:
      'O período colonial brasileiro (1500 a 1822) foi marcado pelo Pacto Colonial e pela exploração mercantilista de Portugal sobre o território brasileiro. A economia baseou-se em ciclos de grandes produtos voltados para a exportação, utilizando mão de obra escravizada indígena e africana em latifúndios monocultores (sistema de Plantation).',
    keySteps: [
      '1. Período Pré-Colonial (1500-1530): Exploração do Pau-Brasil via escambo com os povos indígenas (troca de madeira por ferramentas de metal e tecidos).',
      '2. Capitanias Hereditárias (1534): Divisão do território em 15 faixas de terra doadas a nobres (Donatários). Apenas São Vicente e Pernambuco prosperaram.',
      '3. Governo-Geral (1548): Centralização política em Salvador para defender o litoral e organizar a cobrança de tributos para a Coroa.',
      '4. Ciclo do Açúcar (Sécs. XVI e XVII): Localizado no Nordeste; estruturado no Engenho com produção de cana e refino do açúcar.',
      '5. Ciclo do Ouro e Mineração (Séc. XVIII): Em Minas Gerais, Goiás e Mato Grosso; provocou a transferência da capital de Salvador para o Rio de Janeiro (1763) e originou revoltas como a Inconfidência Mineira.',
    ],
    rulesAndFormulas: [
      'Tripé da Plantation Colonial: Latifúndio (grandes propriedades) + Monocultura (um só produto) + Mão de obra escravizada.',
      'Pacto Colonial (Exclusivo Comercial): O Brasil só podia vender matérias-primas para Portugal e só podia comprar produtos manufaturados de Portugal.',
      'Quinto: Imposto real onde 20% (1/5) de todo ouro extraído pertencia à Coroa Portuguesa.',
    ],
    examples: [
      {
        title: 'Exemplo 1: Entendendo o Pacto Colonial',
        problem: 'O que era o Pacto Colonial e como ele beneficiava a metrópole portuguesa em relação ao Brasil?',
        stepByStepSolution:
          '1º Passo: O Pacto Colonial impunha o "Exclusivo Metropolitano".\n2º Passo: Os colonos brasileiros eram obrigados a vender seus produtos (açúcar, ouro) a preços baixos fixados por Portugal e comprar mercadorias importadas caras apenas de comerciantes portugueses.',
        finalAnswer: 'Era o monopólio comercial que garantia lucros máximos à metrópole através da exploração da colônia.',
      },
    ],
    goldenTips:
      'Dica para Provas do ENEM e Escolares: Entenda que a mineração no século XVIII mudou o eixo econômico e populacional do Brasil do Nordeste açucareiro para o Sudeste, criando uma sociedade urbana e o estilo artístico Barroco Mineiro de Aleijadinho!',
  },

  // ==========================================
  // GEOGRAFIA
  // ==========================================
  {
    id: 'geo_biomas_climas',
    subjectId: 'geografia',
    subjectName: 'Geografia',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Biomas e Climas do Brasil',
    category: 'Geografia Física & Ambiental',
    howItWorks:
      'O Brasil possui grande extensão territorial e diversidade climática devido à sua localização predominantemente intertropical. Essa variedade origina 6 grandes biomas continentais com vegetação, fauna e bacias hidrográficas características.',
    keySteps: [
      '1. Amazônia: Maior floresta tropical úmida do mundo, clima equatorial (quente e muito chuvoso o ano todo), vegetação densa e estratificada (estratos de terra firme, várzea e igapó).',
      '2. Cerrado: Considerado a "savana brasileira" e caixa d\'água do Brasil; clima tropical típico com duas estações bem definidas (verão chuvoso e inverno seco), árvores de troncos retorcidos e casca grossa.',
      '3. Caatinga: Único bioma 100% exclusivamente brasileiro; clima semiárido, chuvas escassas e irregulares, plantas xerófilas adaptadas à seca (cactos como mandacaru, xique-xique).',
      '4. Mata Atlântica: Floresta tropical litorânea de grande biodiversidade, atualmente a mais desmatada devido à concentração histórica da população nas capitais litorâneas.',
      '5. Pantanal: Maior planície inundável contínua do planeta, clima tropical com inundações periódicas no verão.',
      '6. Pampa (Campos Sulinos): Localizado no Rio Grande do Sul; clima subtropical com quatro estações bem marcadas e vegetação rasteira de gramíneas, ideal para pecuária.',
    ],
    rulesAndFormulas: [
      'Clima Equatorial = Quente + Superúmido o ano todo (Amazônia).',
      'Clima Semiárido = Quente + Seco / Pouca chuva (Sertão Nordestino / Caatinga).',
      'Clima Tropical Típico = Quente + Verão Chuvoso + Inverno Seco (Centro-Oeste / Sudeste).',
      'Clima Subtropical = Temperaturas mais amenas, invernos frios com geadas (Sul do Trópico de Capricórnio).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Adaptações das Plantas da Caatinga',
        problem: 'Quais características adaptativas permitem que a vegetação da Caatinga sobreviva a longos períodos sem chuva?',
        stepByStepSolution:
          '1º Passo: As plantas da Caatinga são xerófilas.\n2º Passo: Elas possuem folhas modificadas em espinhos (para evitar a perda de água por transpiração), caules carnosos que armazenam água (como os cactos) e raízes profundas que buscam lençóis freáticos.',
        finalAnswer: 'Folhas transformadas em espinhos, caules acumuladores de água e raízes profundas.',
      },
    ],
    goldenTips:
      'Para Lembrar nas Provas: O Cerrado é chamado de "Berço das Águas" porque nele nascem as principais nascentes que alimentam 8 das 12 bacias hidrográficas brasileiras!',
  },

  // ==========================================
  // LÍNGUA INGLESA
  // ==========================================
  {
    id: 'ing_verb_to_be_present',
    subjectId: 'ingles',
    subjectName: 'Língua Inglesa',
    gradeLevels: ['5_fund', '6_fund', '7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'],
    title: 'Verb To Be & Simple Present',
    category: 'Grammar & English Fundamentals',
    howItWorks:
      'O "Verb To Be" significa SER ou ESTAR em português. Ele é o verbo mais importante da língua inglesa e varia conforme o pronome sujeito. O "Simple Present" é usado para falar de hábitos, rotinas diárias e fatos universais.',
    keySteps: [
      '1. Conjugação do Verb To Be no Presente:',
      '   • I AM (Eu sou / Eu estou)',
      '   • YOU ARE (Você é / Você está | Vocês são / Vocês estão)',
      '   • HE IS / SHE IS / IT IS (Ele é / Ela é / Ele-Ela [objeto/animal] é)',
      '   • WE ARE (Nós somos / Nós estamos)',
      '   • THEY ARE (Eles-Elas são / Eles-Elas estão)',
      '2. Forma Negativa: Basta adicionar NOT depois do verbo (am not, is not / isn\'t, are not / aren\'t).',
      '3. Forma Interrogativa: Inverte a posição, colocando o verbo to be na frente do sujeito (Ex: Are you a student?).',
      '4. Regra da 3ª Pessoa no Simple Present (He, She, It): Adiciona-se "S", "ES" ou "IES" ao final do verbo na forma afirmativa (Ex: He plays, She watches, He studies).',
    ],
    rulesAndFormulas: [
      'Afirmativa: Subject + Verb To Be + Complement (Ex: She is happy).',
      'Negativa: Subject + Verb To Be + NOT + Complement (Ex: She is not / isn\'t sad).',
      'Interrogativa: Verb To Be + Subject + Complement? (Ex: Is she happy?).',
      'Auxiliares no Simple Present: DO (para I, You, We, They) e DOES (para He, She, It) em perguntas e negativas (do not / don\'t, does not / doesn\'t).',
    ],
    examples: [
      {
        title: 'Exemplo 1: Conjugação e Negativa',
        problem: 'Passe a frase "They are doctors" para a forma negativa e para a forma interrogativa.',
        stepByStepSolution:
          '• Afirmativa: They are doctors.\n• Negativa: Adicionamos NOT após "are" -> "They are not doctors" (ou "They aren\'t doctors").\n• Interrogativa: Passamos "are" para antes do sujeito -> "Are they doctors?".',
        finalAnswer: 'Negativa: They aren\'t doctors. | Interrogativa: Are they doctors?',
      },
      {
        title: 'Exemplo 2: Regra do "S" na 3ª pessoa do singular (He/She/It)',
        problem: 'Complete a frase com o verbo correto entre parênteses: "My sister ________ (to love) reading books every morning."',
        stepByStepSolution:
          '"My sister" equivale ao pronome SHE (3ª pessoa do singular). No Simple Present afirmativo, acrescentamos "S" ao verbo love -> loves.',
        finalAnswer: 'My sister loves reading books every morning.',
      },
    ],
    goldenTips:
      'Macete de Ouro: Lembre-se que nas frases interrogativas com DO/DOES (Simple Present), o verbo principal volta para a forma original sem "S"! Ex: "Does she play tennis?" e NUNCA "Does she plays".',
  },
];
