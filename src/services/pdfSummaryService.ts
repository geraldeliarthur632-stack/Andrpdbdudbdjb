import { GradeLevel, SubjectId } from '../types';
import { GRADE_LABELS, SUBJECTS } from '../data/curriculumData';

export interface TopicSummaryItem {
  id: string;
  topic: string;
  subjectId: SubjectId;
  subjectName: string;
  icon: string;
  gradeLabel?: string;
  // "Se faz de tal jeito..."
  howItIsDone: {
    definition: string;
    steps: string[];
    rulesOrFormulas?: string[];
  };
  // "Exemplos: ..."
  examples: {
    title: string;
    statement: string;
    stepByStepSolution: string;
    result: string;
  }[];
  goldenTip: string;
}

export const CURRICULUM_SUMMARIES_DATABASE: TopicSummaryItem[] = [
  // ==================== MATEMÁTICA ====================
  {
    id: 'mat_multiplicacao',
    topic: 'Multiplicação',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    icon: '✖️',
    howItIsDone: {
      definition:
        'A multiplicação é a operação matemática que representa a soma abreviada de parcelas iguais. Em vez de somar 4 + 4 + 4 + 4 + 4, fazemos 4 × 5 = 20.',
      steps: [
        '1º Passo: Arme a conta alinhando os números à direita (unidades sob unidades, dezenas sob dezenas).',
        '2º Passo: Multiplique o algarismo da unidade de baixo por todos os algarismos do número de cima, da direita para a esquerda.',
        '3º Passo (Vai um): Se o resultado de uma coluna for maior ou igual a 10, deixe a unidade embaixo e suba a dezena para somar após a próxima multiplicação.',
        '4º Passo (Dois dígitos): Ao multiplicar a dezena de baixo, pule uma casa à direita (ou coloque um zero) antes de começar a escrever os resultados.',
        '5º Passo: Some todos os resultados parciais obtidos para encontrar o produto final.',
      ],
      rulesOrFormulas: [
        'Propriedade Comutativa: A ordem dos fatores não altera o produto (ex: 6 × 8 = 48 e 8 × 6 = 48).',
        'Elemento Neutro: Qualquer número multiplicado por 1 é ele mesmo (ex: 37 × 1 = 37).',
        'Elemento Nulo: Qualquer número multiplicado por 0 é igual a 0 (ex: 154 × 0 = 0).',
        'Multiplicação por 10, 100 ou 1000: Basta acrescentar os zeros no final (ex: 25 × 10 = 250; 9 × 100 = 900).',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Multiplicação com reagrupamento (vai um)',
        statement: 'Calcule: 24 × 6',
        stepByStepSolution:
          '1. Multiplique as unidades: 6 × 4 = 24. Deixamos o algarismo 4 embaixo e subimos o 2 para a casa das dezenas.\n2. Multiplique as dezenas: 6 × 2 = 12. Somamos o 2 que subiu: 12 + 2 = 14.\n3. Escrevemos 14 ao lado do 4.',
        result: 'Resultado: 144',
      },
      {
        title: 'Exemplo 2: Situação-Problema do Cotidiano',
        statement:
          'Uma papelaria comprou 15 caixas de lápis de cor. Cada caixa vem com 12 lápis. Quantos lápis a papelaria comprou no total?',
        stepByStepSolution:
          'Armamos a conta 15 × 12:\n• 2 × 15 = 30\n• 1 (dezena) × 15 = 150 (lembrando de pular a casa da unidade)\n• Somando as parcelas: 30 + 150 = 180.',
        result: 'Resposta: A papelaria comprou 180 lápis no total.',
      },
    ],
    goldenTip:
      'Ao multiplicar por números que terminam em zero (como 30, 400), multiplique apenas os números diferentes de zero e acrescente os zeros todos juntos no final! Ex: 12 × 300 ➔ 12 × 3 = 36 ➔ acrescente 00 = 3.600.',
  },
  {
    id: 'mat_divisao',
    topic: 'Divisão',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    icon: '➗',
    howItIsDone: {
      definition:
        'A divisão é a operação inversa da multiplicação. Serve para repartir uma quantidade em partes iguais ou descobrir quantas vezes uma quantia cabe dentro de outra.',
      steps: [
        '1º Passo: Monte a chave da divisão colocando o Dividendo à esquerda e o Divisor dentro da chave.',
        '2º Passo: Olhe o primeiro algarismo da esquerda do dividendo. Se for menor que o divisor, pegue os dois primeiros algarismos.',
        '3º Passo (Estimar e Multiplicar): Descubra qual número multiplicado pelo divisor chega mais perto do dividendo sem passar.',
        '4º Passo (Subtrair): Multiplique esse número pelo divisor e subtraia para achar o resto temporário.',
        '5º Passo (Descer o próximo): Desça o próximo algarismo ao lado do resto e repita o processo até não sobrar mais números para descer.',
      ],
      rulesOrFormulas: [
        'Relação Fundamental: Dividendo = (Divisor × Quociente) + Resto.',
        'O resto NUNCA pode ser maior ou igual ao divisor.',
        'Divisão por ZERO: É matematicamente impossível (não existe divisão por 0).',
        'Prova Real: Multiplique o quociente pelo divisor e some o resto. Deve dar o dividendo exato.',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Divisão Exata Passo a Passo',
        statement: 'Calcule: 84 ÷ 4',
        stepByStepSolution:
          '1. Divida o primeiro algarismo: 8 ÷ 4 = 2 (pois 2 × 4 = 8). Resto: 8 - 8 = 0.\n2. Desça o algarismo 4.\n3. Divida 4 ÷ 4 = 1 (pois 1 × 4 = 4). Resto: 4 - 4 = 0.',
        result: 'Quociente: 21 (Resto: 0)',
      },
      {
        title: 'Exemplo 2: Situação-Problema com Resto',
        statement:
          'Um fazendeiro colheu 125 laranjas e vai embalá-las em sacos com 6 laranjas cada. Quantos sacos cheios ele conseguirá fazer e quantas laranjas sobrarão?',
        stepByStepSolution:
          'Armamos 125 ÷ 6:\n1. 1 é menor que 6, então pegamos 12. 12 ÷ 6 = 2 (2 × 6 = 12, sobra 0).\n2. Desce o 5. 5 ÷ 6 = 0 (0 × 6 = 0, sobra 5).\n3. Quociente = 20 e Resto = 5.',
        result: 'Resposta: Ele fará 20 sacos cheios e sobrarão 5 laranjas.',
      },
    ],
    goldenTip:
      'Quando você descer um número e ele for menor que o divisor (não der para dividir), OBRIGATORIAMENTE coloque um 0 no quociente antes de descer o próximo número!',
  },
  {
    id: 'mat_fracoes',
    topic: 'Frações (Adição, Subtração e Multiplicação)',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    icon: '🍰',
    howItIsDone: {
      definition:
        'Fração representa uma ou mais partes de um todo que foi dividido em partes iguais. O número de cima é o Numerador (quantas partes pegamos) e o de baixo é o Denominador (em quantas partes o todo foi dividido).',
      steps: [
        'Adição/Subtração com Denominadores IGUAIS: Mantenha o denominador e apenas some ou subtraia os numeradores (ex: 2/7 + 3/7 = 5/7).',
        'Adição/Subtração com Denominadores DIFERENTES: Encontre o MMC (Mínimo Múltiplo Comum) dos denominadores para torná-los iguais. Divida o novo denominador pelo antigo e multiplique pelo de cima.',
        'Multiplicação de Frações: Multiplique reto! Numerador vezes numerador e denominador vezes denominador (ex: 2/3 × 4/5 = 8/15).',
        'Divisão de Frações: Conserve a primeira fração e multiplique pelo INVERSO da segunda fração (ex: 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12).',
      ],
      rulesOrFormulas: [
        'Fração Própria: Numerador menor que o denominador (ex: 3/5).',
        'Fração Imprópria: Numerador maior ou igual ao denominador (ex: 7/4).',
        'Simplificação: Dividir o numerador e o denominador pelo mesmo número (MDC) até virar irredutível.',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Soma com denominadores diferentes (MMC)',
        statement: 'Calcule: 1/2 + 2/3',
        stepByStepSolution:
          '1. O MMC entre 2 e 3 é 6.\n2. Para a 1ª fração: 6 ÷ 2 = 3 ➔ 3 × 1 = 3/6.\n3. Para a 2ª fração: 6 ÷ 3 = 2 ➔ 2 × 2 = 4/6.\n4. Somando com bases iguais: 3/6 + 4/6 = 7/6.',
        result: 'Resultado: 7/6 (ou 1 inteiro e 1/6)',
      },
      {
        title: 'Exemplo 2: Multiplicação Direta',
        statement: 'Calcule: 3/4 × 2/5',
        stepByStepSolution:
          '1. Multiplique os numeradores: 3 × 2 = 6.\n2. Multiplique os denominadores: 4 × 5 = 20.\n3. Simplifique dividindo ambos por 2: 6/20 = 3/10.',
        result: 'Resultado: 3/10',
      },
    ],
    goldenTip:
      'Lembre-se da regra de ouro da divisão de frações: "Copia a primeira, troca o sinal por multiplicação e vira a segunda de ponta cabeça!"',
  },
  {
    id: 'mat_equacao1grau',
    topic: 'Equações de 1º Grau',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    icon: '⚖️',
    howItIsDone: {
      definition:
        'Uma equação de 1º grau é uma igualdade matemática com uma incógnita (letra desconhecida, como "x"). O objetivo é descobrir o valor numérico que torna a igualdade verdadeira.',
      steps: [
        '1º Passo (Organizar): Pense na equação como uma balança de dois pratos. Deixe os termos com letra (x) no 1º membro (lado esquerdo) e os números puros no 2º membro (lado direito).',
        '2º Passo (Inverter a operação): Ao mudar um termo de lado da igualdade, inverta a sua operação matemática:',
        '• O que está SOMANDO (+) vai SUBTRAINDO (-).',
        '• O que está SUBTRAINDO (-) vai SOMANDO (+).',
        '• O que está MULTIPLICANDO (·) vai DIVIDINDO (÷).',
        '• O que está DIVIDINDO (÷) vai MULTIPLICANDO (·).',
        '3º Passo (Reduzir): Some ou subtraia os termos semelhantes de cada lado.',
        '4º Passo (Isolar): Isole o "x" passando o coeficiente que o multiplica dividindo o outro lado.',
      ],
      rulesOrFormulas: [
        'Forma Geral: ax + b = 0 (com a ≠ 0).',
        'Solução: x = -b / a.',
        'Regra de Sinais: Multiplicação/Divisão: (+ com + = +), (- com - = +), (+ com - = -).',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Equação Simples com Troca de Lados',
        statement: 'Resolva: 3x - 5 = 16',
        stepByStepSolution:
          '1. Passe o -5 para o lado direito somando: 3x = 16 + 5\n2. Calcule a soma: 3x = 21\n3. Passe o 3 que está multiplicando o x para o outro lado dividindo: x = 21 ÷ 3\n4. x = 7.',
        result: 'Conjunto Solução: S = {7}',
      },
      {
        title: 'Exemplo 2: Equação com x dos dois lados',
        statement: 'Resolva: 5x + 4 = 2x + 19',
        stepByStepSolution:
          '1. Agrupe as letras à esquerda: 5x - 2x = 19 - 4\n2. Calcule ambos os lados: 3x = 15\n3. Isole o x: x = 15 ÷ 3\n4. x = 5.',
        result: 'Conjunto Solução: S = {5}',
      },
    ],
    goldenTip:
      'Para conferir se acertou, substitua o valor de "x" encontrado na equação original. Se os dois lados derem o mesmo número, seu cálculo está 100% certo!',
  },
  {
    id: 'mat_regra3',
    topic: 'Regra de Três Simples (Direta e Inversa)',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    icon: '📊',
    howItIsDone: {
      definition:
        'A regra de três simples é um método prático para encontrar um valor desconhecido a partir de três valores conhecidos que mantêm uma proporção entre si.',
      steps: [
        '1º Passo: Monte uma tabela com duas colunas, colocando a mesma grandeza e unidade na mesma coluna.',
        '2º Passo (Análise de Proporção): Pergunte-se: se uma grandeza aumentar, a outra também aumenta ou diminui?',
        '• Diretamente Proporcional: Se uma sobe, a outra SOBE (ex: mais pães comprados = mais dinheiro gasto). Multiplica-se em CRUZ (X).',
        '• Inversamente Proporcional: Se uma sobe, a outra DIMINUI (ex: mais operários trabalhando = menos dias para terminar a obra). Multiplica-se em LINHA RETA (=).',
        '3º Passo: Isole o "x" e efetue as divisões para encontrar o valor final.',
      ],
      rulesOrFormulas: [
        'Direta: a/b = c/x ➔ a · x = b · c',
        'Inversa: a · b = c · x ➔ x = (a · b) / c',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Regra de Três Direta (Multiplica em Cruz)',
        statement:
          'Se 3 cadernos custam R$ 24,00, quanto custarão 8 cadernos iguais a esses?',
        stepByStepSolution:
          'Montando a proporção:\nCadernos | Valor (R$)\n   3     |    24\n   8     |     x\n(Mais cadernos = mais dinheiro ➔ Diretamente proporcional)\nMultiplicamos em cruz: 3 · x = 8 · 24\n3x = 192 ➔ x = 192 ÷ 3 ➔ x = 64.',
        result: 'Resposta: Os 8 cadernos custarão R$ 64,00.',
      },
      {
        title: 'Exemplo 2: Regra de Três Inversa (Multiplica em Linha)',
        statement:
          'Um carro com velocidade de 60 km/h faz uma viagem em 4 horas. Se a velocidade aumentar para 80 km/h, em quanto tempo fará a mesma viagem?',
        stepByStepSolution:
          'Montando a proporção:\nVelocidade (km/h) | Tempo (horas)\n      60          |      4\n      80          |      x\n(Mais velocidade = MENOS tempo ➔ Inversamente proporcional)\nMultiplicamos em linha reta: 80 · x = 60 · 4\n80x = 240 ➔ x = 240 ÷ 80 ➔ x = 3 horas.',
        result: 'Resposta: A viagem durará 3 horas.',
      },
    ],
    goldenTip:
      'Nunca multiplique em cruz no automático! Sempre analise antes se a relação é direta (mais gera mais) ou inversa (mais gera menos).',
  },

  // ==================== LÍNGUA PORTUGUESA ====================
  {
    id: 'port_classes_gramaticais',
    topic: 'Classes de Palavras (Substantivo, Adjetivo e Verbo)',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    icon: '📚',
    howItIsDone: {
      definition:
        'Na língua portuguesa, todas as palavras existentes estão organizadas em 10 classes gramaticais de acordo com a sua função e significado na frase.',
      steps: [
        '1. Substantivo: É a palavra que dá NOME aos seres, coisas, lugares, sentimentos e ideias (ex: aluno, Brasil, amor, mesa, escola).',
        '2. Adjetivo: É a palavra que dá CARACTERÍSTICA, qualidade ou estado ao substantivo (ex: aluno DEDICADO, escola LIMPA, dia ENSOLARADO).',
        '3. Verbo: É a palavra que indica AÇÃO, ESTADO ou FENÔMENO DA NATUREZA situados no tempo (ex: correr, estudar, ser, chover).',
        '4. Artigo: Acompanha o substantivo definindo (o, a, os, as) ou indefinindo (um, uma, uns, umas).',
        '5. Pronome: Acompanha ou substitui o nome (eu, você, ele, meu, este, aquele).',
      ],
      rulesOrFormulas: [
        'Concordância Nominal: O adjetivo e o artigo concordam em gênero (masculino/feminino) e número (singular/plural) com o substantivo a que se referem (ex: "Os garotos estudiosos").',
        'Flexão Verbal: O verbo flexiona em tempo (passado, presente, futuro) e pessoa (1ª, 2ª, 3ª).',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Identificação de Classes na Frase',
        statement:
          'Na frase: "A jovem pesquisadora fez descobertas incríveis.", identifique as classes das palavras sublinhadas.',
        stepByStepSolution:
          '• "A": Artigo definido feminino singular.\n• "jovem": Adjetivo (qualifica a pesquisadora).\n• "pesquisadora": Substantivo (nome da pessoa).\n• "fez": Verbo (ação no passado do verbo fazer).\n• "descobertas": Substantivo.\n• "incríveis": Adjetivo (qualifica as descobertas).',
        result: 'Classificação concluída com sucesso.',
      },
      {
        title: 'Exemplo 2: Diferença entre Substantivo e Adjetivo',
        statement: 'Observe: "O velho sábio falou" vs "O sábio velho falou".',
        stepByStepSolution:
          '• Em "O velho sábio": "velho" é o substantivo (a pessoa idosa) e "sábio" é o adjetivo (sua qualidade).\n• Em "O sábio velho": "sábio" virou o substantivo (o sábio) e "velho" virou o adjetivo (que tem idade avançada).',
        result: 'A ordem das palavras pode mudar a classe gramatical!',
      },
    ],
    goldenTip:
      'Para achar o substantivo, tente colocar "o" ou "a" antes da palavra. Para achar o verbo, tente conjugar com "eu", "nós" ou "eles".',
  },
  {
    id: 'port_sujeito_predicado',
    topic: 'Sujeito e Predicado (Sintaxe Básica)',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    icon: '✍️',
    howItIsDone: {
      definition:
        'Sujeito e Predicado são os dois termos essenciais da oração. Toda frase com verbo se divide nesses dois blocos estruturais.',
      steps: [
        '1º Passo (Achar o verbo): Localize o verbo principal da frase.',
        '2º Passo (Achar o Sujeito): Faça a pergunta mágica ao verbo: "QUEM É QUE...?" ou "O QUE É QUE...?". A resposta é o Sujeito.',
        '3º Passo (Achar o Predicado): Tudo o que sobrar na frase (incluindo o próprio verbo) é o Predicado.',
        '4º Passo (Tipos de Sujeito):',
        '• Sujeito Simples: Tem apenas 1 núcleo (palavra principal). Ex: "O [sol] brilha."',
        '• Sujeito Composto: Tem 2 ou mais núcleos. Ex: "[Pedro] e [Ana] viajaram."',
        '• Sujeito Oculto (Desinencial): Não está escrito, mas descobrimos pela terminação do verbo. Ex: "Comemos pizza" ➔ (Nós).',
        '• Sujeito Indeterminado: Ocorre com verbo na 3ª pessoa do plural sem referência anterior. Ex: "Quebraram a janela."',
      ],
      rulesOrFormulas: [
        'Regra de Concordância Verbal: O verbo sempre concorda em número e pessoa com o núcleo do sujeito (ex: "A turma [singular] comemorou [singular]").',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Decomposição da Oração',
        statement: 'Analise a oração: "Os alunos dedicados venceram a gincana escolar."',
        stepByStepSolution:
          '1. Verbo: "venceram".\n2. Pergunta: Quem é que venceu a gincana? Resposta: "Os alunos dedicados" ➔ SUJEITO.\n3. Núcleo do sujeito: "alunos" (1 núcleo ➔ Sujeito Simples).\n4. Todo o resto: "venceram a gincana escolar" ➔ PREDICADO.',
        result: 'Sujeito Simples: "Os alunos dedicados" | Predicado: "venceram a gincana escolar"',
      },
      {
        title: 'Exemplo 2: Sujeito Oculto',
        statement: 'Identifique o sujeito em: "Estudamos toda a matéria ontem à noite."',
        stepByStepSolution:
          '1. Verbo: "estudamos".\n2. Pergunta: Quem estudou? A terminação "-mos" indica a 1ª pessoa do plural ("Nós").\n3. Como a palavra "Nós" não está escrita na frase, o sujeito é Oculto (ou Desinencial).',
        result: 'Sujeito Oculto: (Nós)',
      },
    ],
    goldenTip:
      'Cuidado com armadilhas! O sujeito nem sempre fica no começo da frase. Em "Chegaram os convidados", o sujeito é "os convidados", pois são eles que chegaram!',
  },

  // ==================== CIÊNCIAS DA NATUREZA / BIOLOGIA ====================
  {
    id: 'cien_fotossintese',
    topic: 'Fotossíntese e Respiração Celular',
    subjectId: 'ciencias',
    subjectName: 'Ciências da Natureza',
    icon: '🌱',
    howItIsDone: {
      definition:
        'A fotossíntese é o processo bioquímico pelo qual as plantas, algas e algumas bactérias (seres autótrofos) produzem seu próprio alimento (glicose) utilizando luz solar, água e gás carbônico.',
      steps: [
        '1. Absorção da Água e Minerais: As raízes absorvem água do solo que sobe pelo caule até as folhas através dos vasos condutores (xilema).',
        '2. Captura do Gás Carbônico (CO₂): A planta absorve o gás carbônico do ar através de pequenas aberturas nas folhas chamadas estômatos.',
        '3. Absorção da Luz: A clorofila (pigmento verde localizado nos cloroplastos) capta a energia luminosa do Sol.',
        '4. Transformação Química: A energia solar quebra as moléculas de água e CO₂, sintetizando Glicose (energia química para a planta crescer).',
        '5. Liberação de Oxigênio (O₂): Como subproduto desse processo, a planta libera gás oxigênio puro para a atmosfera.',
      ],
      rulesOrFormulas: [
        'Equação Química da Fotossíntese: 6 CO₂ + 6 H₂O + Luz Solar ➔ C₆H₁₂O₆ (Glicose) + 6 O₂ (Oxigênio).',
        'Diferença Crucial: A planta faz fotossíntese apenas na presença de luz, mas RESPIRA (consome O₂ e libera CO₂) o tempo todo, dia e noite!',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Importância da Luz Solar',
        statement:
          'Por que uma planta colocada em um quarto totalmente escuro por semanas acaba murchando e morrendo, mesmo sendo regada com água todos os dias?',
        stepByStepSolution:
          'A planta precisa da energia da luz solar para acionar os cloroplastos e realizar a fotossíntese. Sem luz, ela não consegue produzir glicose (seu alimento) e consome todas as suas reservas energéticas até morrer.',
        result: 'Conclusão: A água é indispensável, mas sem luz não há nutrição autótrofa.',
      },
      {
        title: 'Exemplo 2: Cadeia Ecológica',
        statement: 'Qual é o papel dos vegetais na cadeia alimentar?',
        stepByStepSolution:
          'As plantas são os Produtores Primários da cadeia alimentar terrestre. Elas convertem energia inorgânica (luz solar + minerais) em matéria orgânica comestível para os consumidores primários (herbívoros).',
        result: 'Produtores da base de toda a teia ecológica.',
      },
    ],
    goldenTip:
      'Lembre-se: Os seres autótrofos produzem seu próprio alimento (plantas/algas). Já os heterótrofos (animais e fungos) precisam se alimentar de outros seres vivos!',
  },

  // ==================== HISTÓRIA ====================
  {
    id: 'hist_brasil_colonia',
    topic: 'Brasil Colônia (Ciclos Econômicos e Sociedade)',
    subjectId: 'historia',
    subjectName: 'História',
    icon: '⛵',
    howItIsDone: {
      definition:
        'O período colonial brasileiro (1500–1822) compreende a época em que o Brasil foi território dependente e explorado por Portugal, estruturado pelo Pacto Colonial, latifúndio, monocultura e trabalho escravo.',
      steps: [
        '1. Período Pré-Colonial (1500–1530): Extração do Pau-Brasil com escambo indígena e feitorias no litoral.',
        '2. Ciclo da Cana-de-Açúcar (Séculos XVI e XVII): Estabelecido no Nordeste (Bahia e Pernambuco). Baseado no Engenho, mão de obra de africanos escravizados e solo massapê.',
        '3. Ciclo do Ouro e Diamantes (Século XVIII): Descoberta nas Minas Gerais, Goiás e Mato Grosso. Mudança da capital de Salvador para o Rio de Janeiro (1763) e surgimento da classe média urbana e do Barroco.',
        '4. O Pacto Colonial: O Brasil só podia comprar e vender produtos diretamente para Portugal, pagando altos impostos (como o Quinto e a Derrama).',
      ],
      rulesOrFormulas: [
        'Estrutura do Plantation: Latifúndio (grandes terras) + Monocultura (um produto só) + Mão de obra escrava + Produção voltada para Exportação.',
        'Tratado de Tordesilhas (1494): Dividia as terras do Novo Mundo entre Portugal e Espanha.',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Comparação de Ciclos Econômicos',
        statement:
          'Qual foi o principal impacto da mineração de ouro no século XVIII sobre a organização social e territorial do Brasil Colonial?',
        stepByStepSolution:
          '1. Deslocamento do eixo econômico e político do Nordeste açucareiro para o Centro-Sul.\n2. Mudança da capital para o Rio de Janeiro em 1763 para fiscalizar o porto do ouro.\n3. Surgimento de cidades no interior (Ouro Preto, Mariana) com intensa vida cultural e comércio interno.',
        result: 'Consequência: Interiorização do país e urbanização do Sudeste.',
      },
    ],
    goldenTip:
      'Lembre-se da sigla MELE para a economia colonial do açúcar: Monocultura, Exportação, Latifúndio e Escravidão!',
  },

  // ==================== GEOGRAFIA ====================
  {
    id: 'geo_climas_biomas',
    topic: 'Climas e Biomas Brasileiros',
    subjectId: 'geografia',
    subjectName: 'Geografia',
    icon: '🌴',
    howItIsDone: {
      definition:
        'O Brasil possui dimensões continentais e apresenta 6 grandes biomas continentais associados aos diferentes tipos climáticos e formações vegetais.',
      steps: [
        '1. Amazônia: Maior floresta tropical do mundo. Clima Equatorial (quente e muito úmido o ano todo, chuvas diárias). Vegetação densa e estratificada com rios caudalosos.',
        '2. Cerrado: A "savana brasileira" localizada no Centro-Oeste. Clima Tropical Típico (com 2 estações bem definidas: verão chuvoso e inverno seco). Árvores com cascas grossas e raízes profundas.',
        '3. Caatinga: Bioma exclusivo do Brasil no Sertão Nordestino. Clima Semiárido (quente e com pouca chuva, secas prolongadas). Plantas xerófilas (cactos) que acumulam água.',
        '4. Mata Atlântica: Floresta tropical litorânea rica em biodiversidade, muito desmatada pela urbanização histórica.',
        '5. Pantanal: Maior planície alagável do planeta. Clima tropical com inundações periódicas.',
        '6. Pampa (Campos Sulinos): No Rio Grande do Sul. Clima Subtropical (estações bem demarcadas, invernos frios com geadas) e vegetação rasteira para pecuária.',
      ],
      rulesOrFormulas: [
        'Fatores Climáticos: Latitude (distância do Equador), Altitude (altura em relação ao mar), Maritimidade (proximidade do mar) e Massas de Ar.',
      ],
    },
    examples: [
      {
        title: 'Exemplo 1: Adaptação Vegetal ao Clima',
        statement:
          'Por que as plantas da Caatinga, como o Mandacaru, possuem espinhos em vez de folhas largas?',
        stepByStepSolution:
          'Os espinhos são folhas modificadas evolutivamente para evitar a perda de água por transpiração sob o sol forte e clima semiárido, além de proteger os tecidos suculentos e cheios de água contra animais herbívoros.',
        result: 'Adaptação xeromórfica para sobrevivência na seca.',
      },
    ],
    goldenTip:
      'Lembre-se da regra: quanto mais alto o relevo, mais frio o clima (a cada 1000m de altitude a temperatura cai cerca de 6°C)!',
  },
];

// Helper to generate a clean, high-resolution, print-ready HTML document for PDF export
export function generatePrintablePdfHtml({
  studentName,
  grade,
  subjectFilter,
  customSummaries,
}: {
  studentName: string;
  grade: GradeLevel;
  subjectFilter?: SubjectId | 'all';
  customSummaries?: TopicSummaryItem[];
}): string {
  const gradeInfo = GRADE_LABELS[grade] || { short: 'Série Escolar', full: 'Ensino Fundamental e Médio' };
  const allSummaries = customSummaries && customSummaries.length > 0 ? customSummaries : CURRICULUM_SUMMARIES_DATABASE;

  const filteredItems =
    !subjectFilter || subjectFilter === 'all'
      ? allSummaries
      : allSummaries.filter((item) => item.subjectId === subjectFilter);

  const subjectTitle =
    subjectFilter && subjectFilter !== 'all'
      ? SUBJECTS.find((s) => s.id === subjectFilter)?.name || 'Resumo da Matéria'
      : 'Apostila Geral de Todas as Matérias';

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Resumo Escolar - ${subjectTitle} - ${studentName || 'Estudante'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

    @page {
      size: A4 portrait;
      margin: 15mm 15mm 18mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.55;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }

    /* Cover / Header Banner */
    .header-banner {
      border: 2px solid #4f46e5;
      border-radius: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title h1 {
      margin: 0 0 4px 0;
      font-size: 18pt;
      font-weight: 900;
      color: #312e81;
      letter-spacing: -0.5px;
    }

    .header-title p {
      margin: 0;
      font-size: 10pt;
      color: #4338ca;
      font-weight: 700;
    }

    .student-badge {
      text-align: right;
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.4;
    }

    .student-badge strong {
      color: #0f172a;
      font-size: 10.5pt;
    }

    /* Topic Card Section */
    .topic-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      margin-bottom: 22px;
      page-break-inside: avoid;
      background-color: #ffffff;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .topic-header {
      background: #1e293b;
      color: #ffffff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .topic-header h2 {
      margin: 0;
      font-size: 13pt;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topic-subject-tag {
      font-size: 8.5pt;
      text-transform: uppercase;
      font-weight: 800;
      background: #38bdf8;
      color: #0c4a6e;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .topic-body {
      padding: 14px 18px;
    }

    /* "Se faz de tal jeito..." section */
    .how-it-is-done-box {
      background-color: #f8fafc;
      border-left: 4px solid #4f46e5;
      padding: 12px 14px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 14px;
    }

    .section-label {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #4338ca;
      margin-bottom: 6px;
      display: block;
    }

    .concept-def {
      font-size: 10.5pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .step-list {
      margin: 6px 0 0 0;
      padding-left: 18px;
    }

    .step-list li {
      margin-bottom: 5px;
      font-size: 10pt;
      color: #334155;
    }

    .rules-list {
      background: #ffffff;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 9pt;
      color: #1e293b;
    }

    .rules-list strong {
      color: #0f172a;
    }

    /* "Exemplos: ..." section */
    .examples-container {
      margin-top: 14px;
    }

    .example-item {
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
    }

    .example-title {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .example-statement {
      font-style: italic;
      font-family: 'Lora', Georgia, serif;
      color: #1e293b;
      font-size: 10pt;
      background: #ffffff;
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #0ea5e9;
      margin-bottom: 6px;
    }

    .example-solution {
      font-size: 9.5pt;
      color: #334155;
      white-space: pre-line;
      line-height: 1.45;
    }

    .example-result {
      font-weight: 800;
      color: #047857;
      font-size: 10pt;
      margin-top: 4px;
      display: block;
    }

    /* Dica de ouro box */
    .golden-tip-box {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: 8px;
      padding: 8px 12px;
      margin-top: 12px;
      font-size: 9.5pt;
      color: #92400e;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .golden-tip-box strong {
      color: #78350f;
    }

    /* Footer on print */
    .print-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #64748b;
    }

    @media print {
      body {
        background: transparent;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Header escolar com dados do aluno -->
  <div class="header-banner">
    <div class="header-title">
      <h1>📚 Trilha do Saber — Resumo de Matérias</h1>
      <p>${subjectTitle} • Guia Pedagógico Completo</p>
    </div>
    <div class="student-badge">
      <strong>Aluno(a):</strong> ${studentName || 'Estudante'}<br>
      <strong>Série:</strong> ${gradeInfo.full}<br>
      <strong>Gerado em:</strong> ${dateStr}
    </div>
  </div>

  <!-- Loop através dos tópicos formatados no padrão "Como se faz + Exemplos" -->
  <div class="topics-list">
    ${filteredItems
      .map(
        (item) => `
      <div class="topic-card">
        <div class="topic-header">
          <h2><span>${item.icon}</span> ${item.topic}</h2>
          <span class="topic-subject-tag">${item.subjectName}</span>
        </div>

        <div class="topic-body">
          <!-- Bloco "Como se faz" -->
          <div class="how-it-is-done-box">
            <span class="section-label">⚙️ Como se faz & Regras Passo a Passo:</span>
            <div class="concept-def">${item.howItIsDone.definition}</div>
            <ul class="step-list">
              ${item.howItIsDone.steps.map((st) => `<li>${st}</li>`).join('')}
            </ul>

            ${
              item.howItIsDone.rulesOrFormulas && item.howItIsDone.rulesOrFormulas.length > 0
                ? `
              <div class="rules-list">
                <strong>📌 Regras e Propriedades Fundamentais:</strong><br>
                ${item.howItIsDone.rulesOrFormulas.map((r) => `• ${r}`).join('<br>')}
              </div>
            `
                : ''
            }
          </div>

          <!-- Bloco "Exemplos" -->
          <div class="examples-container">
            <span class="section-label" style="color: #0284c7;">📝 Exemplos Práticos Resolvidos:</span>
            ${item.examples
              .map(
                (ex) => `
              <div class="example-item">
                <div class="example-title">${ex.title}</div>
                <div class="example-statement">${ex.statement}</div>
                <div class="example-solution"><strong>Resolução Passo a Passo:</strong><br>${ex.stepByStepSolution}</div>
                <span class="example-result">✔ ${ex.result}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Dica de Ouro -->
          ${
            item.goldenTip
              ? `
            <div class="golden-tip-box">
              <span>💡</span>
              <div><strong>Dica de Ouro para Provas:</strong> ${item.goldenTip}</div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="print-footer">
    Trilha do Saber — Material Didático de Apoio Escolar • Bons Estudos!
  </div>

  <script>
    // Auto trigger print dialog when opened
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;
}

// Function to trigger direct PDF print dialog in browser (opens high quality printable tab)
export function openPdfPrintWindow({
  studentName,
  grade,
  subjectFilter,
  customSummaries,
}: {
  studentName: string;
  grade: GradeLevel;
  subjectFilter?: SubjectId | 'all';
  customSummaries?: TopicSummaryItem[];
}) {
  const htmlContent = generatePrintablePdfHtml({
    studentName,
    grade,
    subjectFilter,
    customSummaries,
  });

  const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If pop-up was blocked, download as printable .html file that the user can open & save as PDF
    downloadHtmlFile({
      htmlContent,
      fileName: `Resumo_Materias_${subjectFilter || 'Completo'}_${(studentName || 'Estudos').replace(/\s+/g, '_')}.html`,
    });
  }
}

// Helper to download standalone file
export function downloadHtmlFile({ htmlContent, fileName }: { htmlContent: string; fileName: string }) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
