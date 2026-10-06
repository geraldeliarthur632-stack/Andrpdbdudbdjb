import React, { useState, useEffect } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Trophy,
  BookOpen,
  RotateCw,
  CheckCircle2,
  XCircle,
  Award,
  Flame,
  Languages,
  Layers,
  Zap,
  Puzzle,
  ChevronRight,
  RefreshCw,
  Mic,
  MicOff,
} from 'lucide-react';

interface LanguageLearningModeProps {
  onBack: () => void;
  onAddScore: (points: number) => void;
}

export type TargetLanguage = 'spanish' | 'italian';
export type LearningTab = 'vocabulary' | 'flashcards' | 'quiz' | 'match' | 'scramble';

export interface VocabItem {
  id: string;
  original: string;
  translation: string;
  pronunciation: string;
  category: 'palavras_basicas' | 'numeros_1a10' | 'cores' | 'saudacoes' | 'alfabeto_sons' | 'escola' | 'alimentos' | 'verbos_essenciais' | 'falsos_amigos';
  exampleOriginal: string;
  exampleTranslation: string;
}

export interface SentenceItem {
  id: string;
  portuguese: string;
  targetSentence: string;
  scrambledWords: string[];
}

export const SPANISH_VOCAB: VocabItem[] = [
  // 1. Palavras Básicas do Cotidiano (Para quem não sabe nada)
  {
    id: 'es_b1',
    original: 'Sí / No / Por favor',
    translation: 'Sim / Não / Por favor',
    pronunciation: 'SI / NO / por fa-BOR',
    category: 'palavras_basicas',
    exampleOriginal: 'Sí, por favor, muchas gracias.',
    exampleTranslation: 'Sim, por favor, muito obrigado.',
  },
  {
    id: 'es_b2',
    original: '¿Cómo estás? / Muy bien, gracias',
    translation: 'Como você está? / Muito bem, obrigado',
    pronunciation: 'KÓ-mo es-TÁS / mui BIEN, GRÁ-ssias',
    category: 'palavras_basicas',
    exampleOriginal: '¿Cómo estás amigo? - Muy bien, gracias.',
    exampleTranslation: 'Como você está amigo? - Muito bem, obrigado.',
  },
  {
    id: 'es_b3',
    original: 'Perdón / Disculpe / Con permiso',
    translation: 'Perdão / Desculpe / Com licença',
    pronunciation: 'per-DÓN / dis-KUL-pe / kon per-MÍ-so',
    category: 'palavras_basicas',
    exampleOriginal: 'Disculpe, ¿dónde está la biblioteca?',
    exampleTranslation: 'Desculpe, onde fica a biblioteca?',
  },
  {
    id: 'es_b4',
    original: '¿Dónde está el baño?',
    translation: 'Onde fica o banheiro?',
    pronunciation: 'DON-de es-TÁ el BÁ-nho',
    category: 'palavras_basicas',
    exampleOriginal: 'Por favor, ¿dónde está el baño?',
    exampleTranslation: 'Por favor, onde fica o banheiro?',
  },
  {
    id: 'es_b5',
    original: '¿Cuánto cuesta? / Yo quiero...',
    translation: 'Quanto custa? / Eu quero...',
    pronunciation: 'KUAN-to KUÉS-ta / io KIÉ-ro',
    category: 'palavras_basicas',
    exampleOriginal: '¿Cuánto cuesta este cuaderno escolar?',
    exampleTranslation: 'Quanto custa este caderno escolar?',
  },

  // 2. Números de 1 a 10
  {
    id: 'es_num1',
    original: '1 = Uno, 2 = Dos, 3 = Tres',
    translation: '1 = Um, 2 = Dois, 3 = Três',
    pronunciation: 'Ú-no, DOS, TRES',
    category: 'numeros_1a10',
    exampleOriginal: 'Uno, dos, tres lápices en el estuche.',
    exampleTranslation: 'Um, dois, três lápis no estojo.',
  },
  {
    id: 'es_num2',
    original: '4 = Cuatro, 5 = Cinco, 6 = Seis',
    translation: '4 = Quatro, 5 = Cinco, 6 = Seis',
    pronunciation: 'KUÁ-tro, SÍN-ko, SEIS',
    category: 'numeros_1a10',
    exampleOriginal: 'Tengo cuatro libros y cinco cuadernos.',
    exampleTranslation: 'Tenho quatro livros e cinco cadernos.',
  },
  {
    id: 'es_num3',
    original: '7 = Siete, 8 = Ocho, 9 = Nueve, 10 = Diez',
    translation: '7 = Sete, 8 = Oito, 9 = Nove, 10 = Dez',
    pronunciation: 'SIÉ-te, Ó-tcho, NUÉ-ve, DIES',
    category: 'numeros_1a10',
    exampleOriginal: 'Diez sobre diez en la prueba de español.',
    exampleTranslation: 'Dez sobre dez na prova de espanhol.',
  },

  // 3. Cores Básicas
  {
    id: 'es_col1',
    original: 'Rojo, Azul y Amarillo',
    translation: 'Vermelho, Azul e Amarelo',
    pronunciation: 'RÓ-ro, a-SÚL i a-ma-RÍ-io',
    category: 'cores',
    exampleOriginal: 'La manzana es roja y el cielo es azul.',
    exampleTranslation: 'A maçã é vermelha e o céu é azul.',
  },
  {
    id: 'es_col2',
    original: 'Verde, Blanco y Negro',
    translation: 'Verde, Branco e Preto',
    pronunciation: 'BÉR-de, BLÁN-ko i NÉ-gro',
    category: 'cores',
    exampleOriginal: 'La pizarra es verde y la tiza es blanca.',
    exampleTranslation: 'O quadro-negro é verde e o giz é branco.',
  },

  // 4. Saudações & Apresentações do Zero
  {
    id: 'es_1',
    original: '¡Hola! ¿Cómo te llamas?',
    translation: 'Olá! Como você se chama?',
    pronunciation: 'Ó-la, KÓ-mo te IÁ-mas',
    category: 'saudacoes',
    exampleOriginal: '¡Hola! ¿Cómo te llamas? - Me llamo Lucas.',
    exampleTranslation: 'Olá! Como você se chama? - Meu nome é Lucas.',
  },
  {
    id: 'es_2',
    original: '¡Buenos días! Mucho gusto',
    translation: 'Bom dia! Muito prazer',
    pronunciation: 'bu-É-nos DÍ-as, MÚ-tcho GÚS-to',
    category: 'saudacoes',
    exampleOriginal: '¡Buenos días! Es un gran gusto conocerte.',
    exampleTranslation: 'Bom dia! É um grande prazer te conhecer.',
  },
  {
    id: 'es_3',
    original: '¡Buenas tardes y adiós!',
    translation: 'Boa tarde e até logo!',
    pronunciation: 'bu-É-nas TÁR-des i a-di-ÓS',
    category: 'saudacoes',
    exampleOriginal: '¡Buenas tardes a todos y hasta luego!',
    exampleTranslation: 'Boa tarde a todos e até logo!',
  },
  {
    id: 'es_4',
    original: 'Muchas gracias / De nada',
    translation: 'Muito obrigado / De nada',
    pronunciation: 'MÚ-tchas GRÁ-ssias / de NÁ-da',
    category: 'saudacoes',
    exampleOriginal: 'Muchas gracias por la explicación tan clara.',
    exampleTranslation: 'Muito obrigado pela explicação tão clara.',
  },
  // 5. Alfabeto & Sons Especiais
  {
    id: 'es_5',
    original: 'El niño y la niña (Som de NH no Ñ)',
    translation: 'O menino e a menina',
    pronunciation: 'el NÍ-nho i la NÍ-nha',
    category: 'alfabeto_sons',
    exampleOriginal: 'El niño español estudia en la escuela.',
    exampleTranslation: 'O menino espanhol estuda na escola.',
  },
  {
    id: 'es_6',
    original: 'El jamón rojo (Som de R forte no J)',
    translation: 'O presunto vermelho',
    pronunciation: 'el ra-MÓN RÓ-ro',
    category: 'alfabeto_sons',
    exampleOriginal: 'El jamón ibérico es muy famoso.',
    exampleTranslation: 'O presunto ibérico é muito famoso.',
  },
  // 6. Escola & Estudos
  {
    id: 'es_7',
    original: 'El cuaderno, el lápiz y la regla',
    translation: 'O caderno, o lápis e a régua',
    pronunciation: 'el kua-DÉR-no, el LÁ-pis i la RÉ-gla',
    category: 'escola',
    exampleOriginal: 'Abro mi cuaderno para escribir los apuntes.',
    exampleTranslation: 'Abro meu caderno para escrever as anotações.',
  },
  {
    id: 'es_8',
    original: 'El libro de la biblioteca escolar',
    translation: 'O livro da biblioteca escolar',
    pronunciation: 'el LÍ-bro de la bi-blio-TÉ-ka es-ko-LÁR',
    category: 'escola',
    exampleOriginal: 'Leemos el libro de español en silencio.',
    exampleTranslation: 'Lemos o livro de espanhol em silêncio.',
  },
  // 7. Alimentos
  {
    id: 'es_9',
    original: 'El desayuno: pan, queso y jugo',
    translation: 'O café da manhã: pão, queijo e suco',
    pronunciation: 'el de-sa-IÚ-no: pan, KÉ-so i RÚ-go',
    category: 'alimentos',
    exampleOriginal: 'El desayuno es la comida más importante.',
    exampleTranslation: 'O café da manhã é a refeição mais importante.',
  },
  {
    id: 'es_10',
    original: 'El agua fresca y la manzana',
    translation: 'A água fresca e a maçã',
    pronunciation: 'el Á-gua FRÉS-ka i la man-SÁ-na',
    category: 'alimentos',
    exampleOriginal: 'Bebo agua y como una manzana dulce.',
    exampleTranslation: 'Bebo água e como uma maçã doce.',
  },
  // 8. Verbos Essenciais
  {
    id: 'es_11',
    original: 'Yo soy estudiante / Yo estoy feliz',
    translation: 'Eu sou estudante / Eu estou feliz (Ser e Estar)',
    pronunciation: 'io SOI es-tu-di-ÁN-te / io es-TOI fe-LÍS',
    category: 'verbos_essenciais',
    exampleOriginal: 'Yo soy brasileño y estoy aprendiendo español.',
    exampleTranslation: 'Eu sou brasileiro e estou aprendendo espanhol.',
  },
  // 9. Falsos Amigos (Cuidado!)
  {
    id: 'es_12',
    original: 'Apellido (Sobrenome, não é apelido!)',
    translation: 'Sobrenome da família (Apelido é "apodo")',
    pronunciation: 'a-pe-IÍ-do',
    category: 'falsos_amigos',
    exampleOriginal: 'Mi apellido es Silva y mi nombre es Pedro.',
    exampleTranslation: 'Meu sobrenome é Silva e meu nome é Pedro.',
  },
  {
    id: 'es_13',
    original: 'Embarazada (Grávida, não é envergonhada!)',
    translation: 'Grávida (esperando bebê)',
    pronunciation: 'em-ba-ra-SÁ-da',
    category: 'falsos_amigos',
    exampleOriginal: 'Mi hermana está embarazada de cinco meses.',
    exampleTranslation: 'Minha irmã está grávida de cinco meses.',
  },
  {
    id: 'es_14',
    original: 'Exquisito (Delicioso/Saboroso, não é esquisito!)',
    translation: 'Delicioso / Muito saboroso',
    pronunciation: 'eks-ki-SÍ-to',
    category: 'falsos_amigos',
    exampleOriginal: 'El pastel de chocolate está exquisito.',
    exampleTranslation: 'O bolo de chocolate está delicioso.',
  },
];

export const ITALIANO_VOCAB: VocabItem[] = [
  // 1. Palavras Básicas do Cotidiano (Para quem não sabe nada)
  {
    id: 'it_b1',
    original: 'Sì / No / Per favore',
    translation: 'Sim / Não / Por favor',
    pronunciation: 'SI / NO / per fa-VÓ-re',
    category: 'palavras_basicas',
    exampleOriginal: 'Sì, per favore, grazie mille.',
    exampleTranslation: 'Sim, por favor, muito obrigado.',
  },
  {
    id: 'it_b2',
    original: 'Come stai? / Sto bene, grazie',
    translation: 'Como vai você? / Estou bem, obrigado',
    pronunciation: 'KÓ-me STAI / sto BÉ-ne, GRÁT-tsie',
    category: 'palavras_basicas',
    exampleOriginal: 'Ciao Marco! Come stai? - Sto molto bene!',
    exampleTranslation: 'Oi Marco! Como vai você? - Estou muito bem!',
  },
  {
    id: 'it_b3',
    original: 'Scusa / Mi scusi / Permesso',
    translation: 'Desculpe (informal) / Com licença (formal)',
    pronunciation: 'SKÚ-za / mi SKÚ-zi / per-MÉS-so',
    category: 'palavras_basicas',
    exampleOriginal: 'Mi scusi, dov\'è la stazione?',
    exampleTranslation: 'Com licença, onde fica a estação?',
  },
  {
    id: 'it_b4',
    original: 'Dov\'è il bagno?',
    translation: 'Onde fica o banheiro?',
    pronunciation: 'do-VÉ il BÁ-nho',
    category: 'palavras_basicas',
    exampleOriginal: 'Per favore, dov\'è il bagno della scuola?',
    exampleTranslation: 'Por favor, onde fica o banheiro da escola?',
  },
  {
    id: 'it_b5',
    original: 'Quanto costa? / Io vorrei...',
    translation: 'Quanto custa? / Eu gostaria de...',
    pronunciation: 'KUÁN-to KÓS-ta / Í-o vor-RÉI',
    category: 'palavras_basicas',
    exampleOriginal: 'Quanto costa questo gelato?',
    exampleTranslation: 'Quanto custa este sorvete?',
  },

  // 2. Números de 1 a 10
  {
    id: 'it_num1',
    original: '1 = Uno, 2 = Due, 3 = Tre',
    translation: '1 = Um, 2 = Dois, 3 = Três',
    pronunciation: 'Ú-no, DÚ-e, TRE',
    category: 'numeros_1a10',
    exampleOriginal: 'Uno, due, tre passi avanti.',
    exampleTranslation: 'Um, dois, três passos para frente.',
  },
  {
    id: 'it_num2',
    original: '4 = Quattro, 5 = Cinque, 6 = Sei',
    translation: '4 = Quatro, 5 = Cinco, 6 = Seis',
    pronunciation: 'KUÁT-tro, TCHÍN-kue, SEI',
    category: 'numeros_1a10',
    exampleOriginal: 'Quattro pizze e cinque bicchieri d\'acqua.',
    exampleTranslation: 'Quatro pizzas e cinco copos de água.',
  },
  {
    id: 'it_num3',
    original: '7 = Sette, 8 = Otto, 9 = Nove, 10 = Dieci',
    translation: '7 = Sete, 8 = Oito, 9 = Nove, 10 = Dez',
    pronunciation: 'SÉT-te, ÓT-to, NÓ-ve, DIÉ-tchi',
    category: 'numeros_1a10',
    exampleOriginal: 'Ho dieci anni e studio italiano.',
    exampleTranslation: 'Tenho dez anos e estudo italiano.',
  },

  // 3. Cores Básicas
  {
    id: 'it_col1',
    original: 'Rosso, Blu e Giallo',
    translation: 'Vermelho, Azul e Amarelo',
    pronunciation: 'RÓS-so, BLU e DJÁL-lo',
    category: 'cores',
    exampleOriginal: 'La maglia è rossa e il cielo è blu.',
    exampleTranslation: 'A camisa é vermelha e o céu é azul.',
  },
  {
    id: 'it_col2',
    original: 'Verde, Bianco e Nero',
    translation: 'Verde, Branco e Preto',
    pronunciation: 'VÉR-de, BIÁN-ko e NÉ-ro',
    category: 'cores',
    exampleOriginal: 'La bandiera italiana è verde, bianca e rossa.',
    exampleTranslation: 'A bandeira italiana é verde, branca e vermelha.',
  },

  // 4. Saudações do Zero
  {
    id: 'it_1',
    original: 'Ciao! Mi chiamo Matteo, piacere!',
    translation: 'Oi! Meu nome é Matteo, muito prazer!',
    pronunciation: 'TCHAU! mi KIÁ-mo mat-TÉ-o, pia-TCHÉ-re',
    category: 'saudacoes',
    exampleOriginal: 'Ciao a tutti, mi chiamo Matteo e sono qui!',
    exampleTranslation: 'Oi a todos, me chamo Matteo e estou aqui!',
  },
  {
    id: 'it_2',
    original: 'Buongiorno e benvenuti!',
    translation: 'Bom dia e bem-vindos!',
    pronunciation: 'buon-DJÓR-no e ben-ve-NÚ-ti',
    category: 'saudacoes',
    exampleOriginal: 'Buongiorno professore, siamo pronti per la lezione!',
    exampleTranslation: 'Bom dia professor, estamos prontos para a aula!',
  },
  {
    id: 'it_3',
    original: 'Buonasera e buonanotte!',
    translation: 'Boa tarde/noite e boa noite (ao dormir)!',
    pronunciation: 'buo-na-SÉ-ra e buo-na-NÓT-te',
    category: 'saudacoes',
    exampleOriginal: 'Buonanotte mamma, vado a dormire.',
    exampleTranslation: 'Boa noite mãe, vou dormir.',
  },
  {
    id: 'it_4',
    original: 'Grazie mille! / Prego!',
    translation: 'Muito obrigado! / De nada!',
    pronunciation: 'GRÁT-tsie MÍL-le / PRÉ-go',
    category: 'saudacoes',
    exampleOriginal: 'Grazie mille per il tuo aiuto! - Prego!',
    exampleTranslation: 'Muito obrigado pela sua ajuda! - De nada!',
  },
  // 5. Sons Italianos Especiais (GLI, GN, C/CH)
  {
    id: 'it_5',
    original: 'La famiglia e il figlio (Som de LH no GLI)',
    translation: 'A família e o filho',
    pronunciation: 'la fa-MÍ-lhia e il FÍ-lhio',
    category: 'alfabeto_sons',
    exampleOriginal: 'La mia famiglia vive in una bella città.',
    exampleTranslation: 'Minha família mora em uma bela cidade.',
  },
  {
    id: 'it_6',
    original: 'Gli gnocchi e la lasagna (Som de NH no GN)',
    translation: 'Os nhoques e a lasanha',
    pronunciation: 'lhi NHÓK-ki e la la-SÁ-nha',
    category: 'alfabeto_sons',
    exampleOriginal: 'La domenica mangiamo gli gnocchi al pomodoro.',
    exampleTranslation: 'No domingo comemos nhoque ao molho de tomate.',
  },
  {
    id: 'it_7',
    original: 'La bruschetta (Som de K no CH: Bruskéta)',
    translation: 'A bruschetta (torrada italiana com tomate)',
    pronunciation: 'la brus-KÉT-ta',
    category: 'alfabeto_sons',
    exampleOriginal: 'La bruschetta con olio e pomodoro è buonissima.',
    exampleTranslation: 'A bruschetta com azeite e tomate é deliciosa.',
  },
  // 6. Escola & Cotidiano
  {
    id: 'it_8',
    original: 'Il quaderno, la penna e il libro',
    translation: 'O caderno, a caneta e o livro',
    pronunciation: 'il kua-DÉR-no, la PÉN-na e il LÍ-bro',
    category: 'escola',
    exampleOriginal: 'Scrivo la lezione sul mio quaderno nuovo.',
    exampleTranslation: 'Escrevo a lição no meu caderno novo.',
  },
  // 7. Alimentos
  {
    id: 'it_9',
    original: 'La pizza margherita e il gelato',
    translation: 'A pizza margherita e o sorvete',
    pronunciation: 'la PÍT-tsa mar-ge-RÍ-ta e il dje-LÁ-to',
    category: 'alimentos',
    exampleOriginal: 'Prendiamo una pizza e un gelato al cioccolato.',
    exampleTranslation: 'Vamos pedir uma pizza e um sorvete de chocolate.',
  },
  {
    id: 'it_10',
    original: 'L\'acqua naturale e il pane fresco',
    translation: 'A água mineral e o pão fresco',
    pronunciation: 'L-ÁK-kua na-tu-RÁ-le e il PÁ-ne FRÉS-ko',
    category: 'alimentos',
    exampleOriginal: 'Vorrei un bicchiere d\'acqua, per favore.',
    exampleTranslation: 'Eu gostaria de um copo de água, por favor.',
  },
  // 8. Verbos Essenciais
  {
    id: 'it_11',
    original: 'Io sono brasiliano / Io ho dieci anni (Essere e Avere)',
    translation: 'Eu sou brasileiro / Eu tenho dez anos',
    pronunciation: 'Í-o SÓ-no bra-si-LIÁ-no / Í-o O DIÉ-tchi ÁN-ni',
    category: 'verbos_essenciais',
    exampleOriginal: 'Io sono felice di imparare l\'italiano.',
    exampleTranslation: 'Eu sou feliz em aprender italiano.',
  },
  // 9. Falsos Cognatos
  {
    id: 'it_12',
    original: 'Burro (É manteiga, não o animal!)',
    translation: 'Manteiga para culinária',
    pronunciation: 'BÚR-ro',
    category: 'falsos_amigos',
    exampleOriginal: 'Pane tostato con burro fresco.',
    exampleTranslation: 'Pão torrado com manteiga fresca.',
  },
  {
    id: 'it_13',
    original: 'Salire (Significa subir, não sair!)',
    translation: 'Subir (escadas, ônibus) - Sair é "uscire"',
    pronunciation: 'sa-LÍ-re',
    category: 'falsos_amigos',
    exampleOriginal: 'Dobbiamo salire le scale per arrivare all\'aula.',
    exampleTranslation: 'Devemos subir as escadas para chegar à sala de aula.',
  },
];

const SENTENCES_DATA: Record<TargetLanguage, SentenceItem[]> = {
  spanish: [
    {
      id: 's_es_1',
      portuguese: 'Olá, me chamo Lucas e sou estudante.',
      targetSentence: 'Hola me llamo Lucas y soy estudiante',
      scrambledWords: ['Hola', 'me', 'llamo', 'Lucas', 'y', 'soy', 'estudiante'],
    },
    {
      id: 's_es_2',
      portuguese: 'Eu gosto de ler livros na biblioteca da escola.',
      targetSentence: 'Me gusta leer libros en la biblioteca de la escuela',
      scrambledWords: ['Me', 'gusta', 'leer', 'libros', 'en', 'la', 'biblioteca', 'de', 'la', 'escuela'],
    },
    {
      id: 's_es_3',
      portuguese: 'Muito obrigado pela explicação do professor.',
      targetSentence: 'Muchas gracias por la explicación del profesor',
      scrambledWords: ['Muchas', 'gracias', 'por', 'la', 'explicación', 'del', 'profesor'],
    },
    {
      id: 's_es_4',
      portuguese: 'O café da manhã é muito gostoso.',
      targetSentence: 'El desayuno es muy rico',
      scrambledWords: ['El', 'desayuno', 'es', 'muy', 'rico'],
    },
  ],
  italian: [
    {
      id: 's_it_1',
      portuguese: 'Oi, meu nome é Matteo e sou brasileiro.',
      targetSentence: 'Ciao mi chiamo Matteo e sono brasiliano',
      scrambledWords: ['Ciao', 'mi', 'chiamo', 'Matteo', 'e', 'sono', 'brasiliano'],
    },
    {
      id: 's_it_2',
      portuguese: 'Eu quero aprender italiano com alegria.',
      targetSentence: 'Voglio imparare l italiano con grande gioia',
      scrambledWords: ['Voglio', 'imparare', 'l', 'italiano', 'con', 'grande', 'gioia'],
    },
    {
      id: 's_it_3',
      portuguese: 'Muito obrigado pela sua grande ajuda.',
      targetSentence: 'Grazie mille per il tuo grande aiuto',
      scrambledWords: ['Grazie', 'mille', 'per', 'il', 'tuo', 'grande', 'aiuto'],
    },
    {
      id: 's_it_4',
      portuguese: 'O sorvete de chocolate é delicioso.',
      targetSentence: 'Il gelato al cioccolato è buonissimo',
      scrambledWords: ['Il', 'gelato', 'al', 'cioccolato', 'è', 'buonissimo'],
    },
  ],
};

// Interactive Quiz Questions with multiple choice, true/false and voice
export interface LanguageQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'multiple_choice' | 'true_false' | 'voice_speech';
  expectedVoice?: string;
}

function shuffleLanguageQuizItem(q: LanguageQuizQuestion, targetSlot?: number): LanguageQuizQuestion {
  if (q.type === 'true_false' || q.options.length <= 1) return q;

  const numOptions = q.options.length;
  const origCorrectIdx = Math.max(0, Math.min(q.correctIndex ?? 0, numOptions - 1));
  const correctText = q.options[origCorrectIdx];
  const distractors = q.options.filter((_, idx) => idx !== origCorrectIdx);

  // Shuffle distractors
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = distractors[i];
    distractors[i] = distractors[j];
    distractors[j] = temp;
  }

  let finalSlot: number;
  if (typeof targetSlot === 'number' && targetSlot >= 0 && targetSlot < numOptions) {
    finalSlot = targetSlot;
  } else if (origCorrectIdx === 0 && numOptions >= 2) {
    finalSlot = 1 + Math.floor(Math.random() * (numOptions - 1));
  } else {
    finalSlot = Math.floor(Math.random() * numOptions);
  }

  const newOptions: string[] = [];
  let dIdx = 0;
  for (let s = 0; s < numOptions; s++) {
    if (s === finalSlot) {
      newOptions.push(correctText);
    } else {
      newOptions.push(distractors[dIdx++]);
    }
  }

  return {
    ...q,
    options: newOptions,
    correctIndex: finalSlot,
  };
}

function shuffleLanguageQuizList(list: LanguageQuizQuestion[]): LanguageQuizQuestion[] {
  const pattern = [1, 2, 3, 0, 2, 1];
  const offset = Math.floor(Math.random() * pattern.length);
  return list.map((q, idx) => {
    if (q.type === 'true_false' || q.options.length <= 1) return q;
    let slot = pattern[(idx + offset) % pattern.length] % q.options.length;
    if (slot === 0 && q.options.length >= 2) slot = 1 + Math.floor(Math.random() * (q.options.length - 1));
    return shuffleLanguageQuizItem(q, slot);
  });
}

const LANGUAGE_QUIZ_QUESTIONS: Record<
  TargetLanguage,
  LanguageQuizQuestion[]
> = {
  spanish: [
    {
      id: 'lq_es_1',
      question: 'Como se diz "Bom dia" em espanhol?',
      options: ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!', '¡Hola amigo!'],
      correctIndex: 0,
      explanation: 'Pela manhã usa-se "¡Buenos días!".',
      type: 'multiple_choice',
    },
    {
      id: 'lq_es_2',
      question: 'Verdadeiro ou Falso: "Apellido" em espanhol significa "sobrenome" da família.',
      options: ['Verdadeiro (V)', 'Falso (F)'],
      correctIndex: 0,
      explanation: 'Verdadeiro! Apellido é sobrenome. Apelido é "apodo".',
      type: 'true_false',
    },
    {
      id: 'lq_es_3',
      question: 'Fale com a voz: Como se diz "Muito obrigado" em espanhol?',
      options: ['Muchas gracias', 'Por favor', 'De nada', 'Buenos días'],
      correctIndex: 0,
      explanation: '"Muchas gracias" significa muito obrigado.',
      type: 'voice_speech',
      expectedVoice: 'muchas gracias',
    },
    {
      id: 'lq_es_4',
      question: 'O que significa a palavra "embarazada"?',
      options: ['Grávida (esperando bebê)', 'Envergonhada', 'Com pressa', 'Cansada'],
      correctIndex: 0,
      explanation: '"Embarazada" significa grávida. Envergonhada é "avergonzada".',
      type: 'multiple_choice',
    },
    {
      id: 'lq_es_5',
      question: 'Verdadeiro ou Falso: "Exquisito" significa uma comida muito saborosa e deliciosa.',
      options: ['Verdadeiro (V)', 'Falso (F)'],
      correctIndex: 0,
      explanation: 'Verdadeiro! Exquisito é um elogio para comida deliciosa.',
      type: 'true_false',
    },
    {
      id: 'lq_es_6',
      question: 'Fale com a voz: Qual letra exclusiva do espanhol tem som de NH (como em niño)?',
      options: ['Eñe (Ñ)', 'Jota (J)', 'Zeta (Z)', 'Doble ele (LL)'],
      correctIndex: 0,
      explanation: 'A letra Ñ (eñe) produz o som de NH.',
      type: 'voice_speech',
      expectedVoice: 'eñe',
    },
  ],
  italian: [
    {
      id: 'lq_it_1',
      question: 'Como se diz "Bom dia" em italiano?',
      options: ['Buongiorno', 'Buonasera', 'Buonanotte', 'Arrivederci'],
      correctIndex: 0,
      explanation: 'Buongiorno significa bom dia!',
      type: 'multiple_choice',
    },
    {
      id: 'lq_it_2',
      question: 'Verdadeiro ou Falso: A saudação "Ciao" pode ser usada tanto para "Oi" quanto para "Tchau".',
      options: ['Verdadeiro (V)', 'Falso (F)'],
      correctIndex: 0,
      explanation: 'Verdadeiro! Ciao serve para chegada e saída.',
      type: 'true_false',
    },
    {
      id: 'lq_it_3',
      question: 'Fale com a voz: Como se responde educadamente a "Grazie"?',
      options: ['Prego', 'Scusa', 'Ciao', 'Grazie'],
      correctIndex: 0,
      explanation: '"Prego" significa de nada / por favor.',
      type: 'voice_speech',
      expectedVoice: 'prego',
    },
    {
      id: 'lq_it_4',
      question: 'Como se pronuncia a palavra "Bruschetta"?',
      options: ['Bruskéta (som de K no CH)', 'Bruxeta (som de X)', 'Brusseta', 'Brutcheta'],
      correctIndex: 0,
      explanation: 'Em italiano o CH tem som de K duro (Bruskéta).',
      type: 'multiple_choice',
    },
    {
      id: 'lq_it_5',
      question: 'Verdadeiro ou Falso: O encontro de letras "GN" (como em Lasagna e Bagno) tem som de NH.',
      options: ['Verdadeiro (V)', 'Falso (F)'],
      correctIndex: 0,
      explanation: 'Verdadeiro! GN soa exatamente como NH.',
      type: 'true_false',
    },
    {
      id: 'lq_it_6',
      question: 'Fale com a voz: Qual alimento diário italiano significa a palavra "Burro"?',
      options: ['Manteiga', 'Queijo', 'Pão', 'Carne'],
      correctIndex: 0,
      explanation: 'Burro em italiano é manteiga!',
      type: 'voice_speech',
      expectedVoice: 'manteiga',
    },
  ],
};

export const LanguageLearningMode: React.FC<LanguageLearningModeProps> = ({
  onBack,
  onAddScore,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>('spanish');
  const [activeTab, setActiveTab] = useState<LearningTab>('vocabulary');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [streak, setStreak] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isVoiceSkipped, setIsVoiceSkipped] = useState(false);

  // Match Pairs state
  const [matchPairs, setMatchPairs] = useState<{
    left: { id: string; text: string }[];
    right: { id: string; text: string }[];
  }>({ left: [], right: [] });
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [matchCompleted, setMatchCompleted] = useState(false);

  // Sentence Scramble state
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{ id: string; text: string }[]>([]);
  const [scrambleFeedback, setScrambleFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Shuffled quiz questions so correct options are never fixed at position A
  const [shuffledQuizMap, setShuffledQuizMap] = useState<Record<TargetLanguage, LanguageQuizQuestion[]>>(() => ({
    spanish: shuffleLanguageQuizList(LANGUAGE_QUIZ_QUESTIONS.spanish),
    italian: shuffleLanguageQuizList(LANGUAGE_QUIZ_QUESTIONS.italian),
  }));

  const vocabList = selectedLanguage === 'spanish' ? SPANISH_VOCAB : ITALIANO_VOCAB;

  const filteredVocab =
    selectedCategory === 'all'
      ? vocabList
      : vocabList.filter((item) => item.category === selectedCategory);

  // Speech TTS handler
  const handleSpeak = (text: string) => {
    soundEffects.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'spanish' ? 'es-ES' : 'it-IT';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup Match Pairs game
  const initMatchPairs = () => {
    const subset = [...vocabList].sort(() => Math.random() - 0.5).slice(0, 5);
    const left = subset.map((item) => ({ id: item.id, text: item.original })).sort(() => Math.random() - 0.5);
    const right = subset.map((item) => ({ id: item.id, text: item.translation })).sort(() => Math.random() - 0.5);
    setMatchPairs({ left, right });
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds(new Set());
    setMatchCompleted(false);
  };

  // Setup Sentence Scramble
  const initSentenceScramble = (idx: number) => {
    const sList = SENTENCES_DATA[selectedLanguage];
    const sentenceObj = sList[idx % sList.length];
    if (sentenceObj) {
      const wordsWithIds = [...sentenceObj.scrambledWords]
        .sort(() => Math.random() - 0.5)
        .map((w, i) => ({ id: `${w}_${i}_${Date.now()}`, text: w }));
      setAvailableWords(wordsWithIds);
      setPlacedWords([]);
      setScrambleFeedback(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'match') initMatchPairs();
    if (activeTab === 'scramble') initSentenceScramble(0);
    if (activeTab === 'quiz') {
      setShuffledQuizMap((prev) => ({
        ...prev,
        [selectedLanguage]: shuffleLanguageQuizList(LANGUAGE_QUIZ_QUESTIONS[selectedLanguage]),
      }));
      setQuizIndex(0);
      setQuizScore(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuizCompleted(false);
      setIsVoiceSkipped(false);
    }
  }, [selectedLanguage, activeTab]);

  // Quiz questions
  const quizList = shuffledQuizMap[selectedLanguage] || LANGUAGE_QUIZ_QUESTIONS[selectedLanguage];
  const currentQuizQ = quizList[quizIndex % quizList.length];

  // Auto-speak question on quiz tab load/change
  useEffect(() => {
    if (activeTab === 'quiz' && currentQuizQ && !isAnswerSubmitted && !quizCompleted) {
      const timer = setTimeout(() => {
        speechNarrator.speakQuestion({
          questionIndex: quizIndex,
          questionText: currentQuizQ.question,
          options: currentQuizQ.options,
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
      };
    }
  }, [activeTab, quizIndex, isAnswerSubmitted, quizCompleted, currentQuizQ?.id]);

  const handleSelectQuizOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuizQ) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuizQ.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrect('standard');
      setQuizScore((prev) => prev + 1);
      setStreak((s) => s + 1);
      onAddScore(15);
    } else {
      soundEffects.playError();
    }
  };

  const handleNextQuizQ = () => {
    soundEffects.playClick();
    if (quizIndex + 1 < quizList.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsVoiceSkipped(false);
    } else {
      setQuizCompleted(true);
      soundEffects.playLevelUp();
      onAddScore(40);
    }
  };

  // Match Pairs handlers
  const handleSelectMatchLeft = (id: string) => {
    if (matchedIds.has(id)) return;
    soundEffects.playClick();
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleSelectMatchRight = (id: string) => {
    if (matchedIds.has(id)) return;
    soundEffects.playClick();
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      soundEffects.playCorrect('standard');
      const updated = new Set(matchedIds).add(leftId);
      setMatchedIds(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
      setStreak((s) => s + 1);
      onAddScore(10);

      if (updated.size === matchPairs.left.length) {
        setMatchCompleted(true);
        soundEffects.playLevelUp();
      }
    } else {
      soundEffects.playError();
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 400);
    }
  };

  // Sentence Scramble handlers
  const currentSentence = SENTENCES_DATA[selectedLanguage][scrambleIndex % SENTENCES_DATA[selectedLanguage].length];

  const handleWordClick = (wordObj: { id: string; text: string }) => {
    soundEffects.playClick();
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setPlacedWords((prev) => [...prev, wordObj.text]);
  };

  const handlePlacedWordClick = (index: number) => {
    soundEffects.playClick();
    const wordText = placedWords[index];
    setPlacedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, { id: `${wordText}_${Date.now()}_${Math.random()}`, text: wordText }]);
  };

  const handleCheckSentence = () => {
    const built = placedWords.join(' ').trim().toLowerCase();
    const expected = currentSentence.targetSentence.trim().toLowerCase();

    if (built === expected) {
      soundEffects.playCorrect('standard');
      setScrambleFeedback('correct');
      setStreak((s) => s + 1);
      onAddScore(20);
      setTimeout(() => {
        const nextIdx = scrambleIndex + 1;
        setScrambleIndex(nextIdx);
        initSentenceScramble(nextIdx);
      }, 1200);
    } else {
      soundEffects.playError();
      setScrambleFeedback('wrong');
      setTimeout(() => {
        setScrambleFeedback(null);
      }, 1200);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 pb-16 min-h-screen">
      {/* TOP HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                soundEffects.playClick();
                onBack();
              }}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition shrink-0 font-bold"
              title="Voltar ao Início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 truncate">
                  Espanhol & Italiano do Zero
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Nível A1 Iniciante
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                🟢 Começando do Absoluto Zero com pronúncia fonética e quizzes
              </p>
            </div>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 shrink-0">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-xs font-black">{streak}</span>
            <span className="text-[10px] font-bold text-amber-700 hidden sm:inline">Streak</span>
          </div>
        </div>

        {/* 2 ONLY LANGUAGES: ESPANHOL & ITALIANO */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-2.5 mt-3">
          {[
            {
              id: 'spanish',
              label: 'Espanhol (Do Zero 🇪🇸)',
              sub: 'Alfabeto, Ñ, J e Falsos Amigos',
              color: 'from-amber-500 to-rose-600',
            },
            {
              id: 'italian',
              label: 'Italiano (Do Zero 🇮🇹)',
              sub: 'Sons GLI, GN, C/CH e Verbos',
              color: 'from-emerald-600 to-teal-700',
            },
          ].map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedLanguage(lang.id as TargetLanguage);
                }}
                className={`p-2.5 rounded-2xl font-black text-xs transition flex flex-col items-center justify-center text-center shadow-xs border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 scale-[1.02] ring-2 ring-blue-500'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-sm font-black">{lang.label}</span>
                <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {lang.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5 LEARNING ACTIVITIES TABS */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'vocabulary', label: 'Vocabulário & Áudio', icon: '📖' },
            { id: 'flashcards', label: 'Cartões de Palavras', icon: '📇' },
            { id: 'quiz', label: 'Quiz (Assinalar, V/F & Voz)', icon: '⚡' },
            { id: 'match', label: 'Jogo dos Pares', icon: '🎯' },
            { id: 'scramble', label: 'Montar Frases', icon: '🧩' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveTab(tab.id as LearningTab);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
        {/* 1. VOCABULARY LIST & AUDIO */}
        {activeTab === 'vocabulary' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'palavras_basicas', label: '🗣️ Palavras Básicas' },
                { id: 'numeros_1a10', label: '🔢 Números 1 a 10' },
                { id: 'cores', label: '🎨 Cores' },
                { id: 'saudacoes', label: '👋 Saudações' },
                { id: 'alfabeto_sons', label: '🔤 Sons Especiais' },
                { id: 'escola', label: '🏫 Escola' },
                { id: 'alimentos', label: '🍎 Alimentos' },
                { id: 'verbos_essenciais', label: '⚡ Verbos Principais' },
                { id: 'falsos_amigos', label: '⚠️ Falsos Amigos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Vocab Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">{item.original}</span>
                        <button
                          onClick={() => handleSpeak(item.original)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition active:scale-95 shadow-xs"
                          title="Ouvir pronúncia"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        Pronúncia fonética: <span className="text-blue-700 italic font-bold">{item.pronunciation}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                    <span className="text-blue-950 font-bold block mb-0.5">Tradução em Português:</span>
                    <p className="text-slate-800 font-semibold">{item.translation}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                    <p className="text-slate-900 font-medium italic">"{item.exampleOriginal}"</p>
                    <p className="text-slate-500 text-[11px]">{item.exampleTranslation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-bold">
              <span>Cartão {currentCardIndex + 1} de {vocabList.length}</span>
              <span>Clique no cartão para virar</span>
            </div>

            {vocabList[currentCardIndex] && (
              <div
                onClick={() => {
                  soundEffects.playClick();
                  setIsFlipped(!isFlipped);
                }}
                className="w-full h-64 bg-white border-2 border-slate-200 hover:border-blue-400 rounded-3xl p-6 shadow-md cursor-pointer flex flex-col items-center justify-center text-center transition-all relative overflow-hidden select-none active:scale-[0.99]"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {selectedLanguage === 'spanish' ? '🇪🇸 Espanhol' : '🇮🇹 Italiano'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {vocabList[currentCardIndex].original}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono italic">
                      Pronúncia: {vocabList[currentCardIndex].pronunciation}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(vocabList[currentCardIndex].original);
                      }}
                      className="p-2.5 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition inline-flex"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in">
                    <span className="text-[11px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      🇧🇷 Português
                    </span>
                    <h3 className="text-xl font-black text-emerald-950 leading-tight">
                      {vocabList[currentCardIndex].translation}
                    </h3>
                    <p className="text-xs text-slate-600 italic">
                      "{vocabList[currentCardIndex].exampleOriginal}"
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : vocabList.length - 1));
                }}
                className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl font-bold text-xs shadow-xs transition"
              >
                Anterior
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev + 1) % vocabList.length);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-md transition"
              >
                Próximo Cartão
              </button>
            </div>
          </div>
        )}

        {/* 3. QUIZ (Assinalar, V/F e Voz com Botão de Pular) */}
        {activeTab === 'quiz' && (
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            {!quizCompleted ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900">
                    Questão {quizIndex + 1} de {quizList.length}
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    ⭐ {quizScore} acertos
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${((quizIndex + 1) / quizList.length) * 100}%` }}
                  />
                </div>

                {currentQuizQ && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-3 space-y-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 uppercase">
                      {currentQuizQ.type === 'true_false'
                        ? '❓ Verdadeiro ou Falso'
                        : currentQuizQ.type === 'voice_speech'
                        ? '🎙️ Pergunta por Voz'
                        : '📝 Assinalar Alternativa'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {currentQuizQ.question}
                    </h3>
                  </div>
                )}

                {/* Voice Controller */}
                {currentQuizQ && !isVoiceSkipped && (
                  <div className="mb-3">
                    <VoiceAnswerController
                      options={currentQuizQ.options}
                      selectedOption={selectedOption}
                      isAnswerSubmitted={isAnswerSubmitted}
                      onSelectOption={handleSelectQuizOption}
                      onSubmitAnswer={handleSubmitQuizAnswer}
                      onNextQuestion={handleNextQuizQ}
                      onCannotSpeak={() => setIsVoiceSkipped(true)}
                      isTrueFalse={currentQuizQ.type === 'true_false'}
                      promptVoicePhrase={currentQuizQ.expectedVoice}
                    />
                  </div>
                )}

                {isVoiceSkipped && (
                  <div className="mb-2.5 p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium">
                    <span>🔇 Microfone desativado: assinale sua resposta na tela.</span>
                    <button
                      onClick={() => setIsVoiceSkipped(false)}
                      className="text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      Reativar microfone
                    </button>
                  </div>
                )}

                {/* Options (True/False vs Multiple Choice) */}
                {currentQuizQ && (
                  <div className="space-y-2">
                    {currentQuizQ.type === 'true_false' ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {currentQuizQ.options.map((opt, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = idx === currentQuizQ.correctIndex;
                          const isV = opt.toLowerCase().includes('verdadeiro');

                          let style = isV
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900';

                          if (isAnswerSubmitted) {
                            if (isCorrect) style = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                            else if (isSelected) style = 'bg-rose-600 text-white border-rose-700 font-bold';
                            else style = 'opacity-40 bg-slate-100 border-slate-200 text-slate-400';
                          } else if (isSelected) {
                            style = isV ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-rose-600 text-white ring-2 ring-rose-400';
                          }

                          return (
                            <button
                              key={idx}
                              disabled={isAnswerSubmitted}
                              onClick={() => handleSelectQuizOption(idx)}
                              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition ${style}`}
                            >
                              <span className="text-xl">{isV ? '✓' : '✗'}</span>
                              <span className="text-xs font-black">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      currentQuizQ.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === currentQuizQ.correctIndex;
                        const letters = ['A', 'B', 'C', 'D'];

                        let style = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';
                        if (isAnswerSubmitted) {
                          if (isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                          else if (isSelected) style = 'bg-rose-50 border-rose-500 text-rose-950';
                          else style = 'opacity-40 bg-slate-50 border-slate-200 text-slate-400';
                        } else if (isSelected) {
                          style = 'bg-blue-50 border-blue-600 text-blue-950 font-bold ring-1 ring-blue-600';
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswerSubmitted}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${style}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200">
                                {letters[idx]}
                              </span>
                              <span className="text-xs">{opt}</span>
                            </div>
                            {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                            {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Explanation */}
                {isAnswerSubmitted && currentQuizQ && (
                  <div
                    className={`mt-3 p-3 rounded-2xl border text-xs leading-relaxed ${
                      selectedOption === currentQuizQ.correctIndex
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {selectedOption === currentQuizQ.correctIndex ? '✓ Correto!' : '✗ Explicação:'}
                    </p>
                    <p>{currentQuizQ.explanation}</p>
                  </div>
                )}

                {/* Submit / Next Button */}
                <div className="mt-4">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleSubmitQuizAnswer}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition"
                    >
                      Confirmar Resposta
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuizQ}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>{quizIndex + 1 < quizList.length ? 'Próxima Pergunta' : 'Finalizar Quiz'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-3xl bg-amber-400 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
                  🏆
                </div>
                <h3 className="text-lg font-black text-slate-900">Quiz de Idiomas Concluído!</h3>
                <p className="text-xs text-slate-600">
                  Você acertou <strong>{quizScore}</strong> de {quizList.length} questões.
                </p>
                <button
                  onClick={() => {
                    setShuffledQuizMap((prev) => ({
                      ...prev,
                      [selectedLanguage]: shuffleLanguageQuizList(LANGUAGE_QUIZ_QUESTIONS[selectedLanguage]),
                    }));
                    setQuizIndex(0);
                    setQuizScore(0);
                    setSelectedOption(null);
                    setIsAnswerSubmitted(false);
                    setQuizCompleted(false);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                >
                  Refazer Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. JOGO DOS PARES */}
        {activeTab === 'match' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
              <span>Selecione uma palavra na esquerda e combine com a tradução na direita!</span>
              <button
                onClick={initMatchPairs}
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Embaralhar</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 block mb-1">
                  {selectedLanguage === 'spanish' ? '🇪🇸 Espanhol' : '🇮🇹 Italiano'}
                </span>
                {matchPairs.left.map((item) => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedLeft === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleSelectMatchLeft(item.id)}
                      className={`w-full p-3 rounded-2xl border text-xs font-bold transition text-left ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-60'
                          : isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 block mb-1">🇧🇷 Português</span>
                {matchPairs.right.map((item) => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedRight === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleSelectMatchRight(item.id)}
                      className={`w-full p-3 rounded-2xl border text-xs font-bold transition text-left ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-60'
                          : isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {matchCompleted && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                <span className="text-2xl">🎉</span>
                <h4 className="text-sm font-black text-emerald-950">Todos os pares combinados com perfeição!</h4>
                <button
                  onClick={initMatchPairs}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Jogar Nova Rodada
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. MONTAR FRASES */}
        {activeTab === 'scramble' && currentSentence && (
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-700">Traduza para o idioma:</span>
              <h3 className="text-sm font-black text-slate-900">"{currentSentence.portuguese}"</h3>
            </div>

            {/* Placed Words Area */}
            <div className="min-h-[64px] p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap items-center gap-1.5">
              {placedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic mx-auto">
                  Clique nas palavras abaixo para montar a frase correta
                </span>
              ) : (
                placedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePlacedWordClick(idx)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                    title="Clique para remover"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available Words */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              {availableWords.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleWordClick(item)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                >
                  {item.text}
                </button>
              ))}
            </div>

            {/* Feedback & Check */}
            {scrambleFeedback === 'correct' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-black text-emerald-900">
                ✓ Excelente! Frase montada com perfeição!
              </div>
            )}
            {scrambleFeedback === 'wrong' && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-center text-xs font-black text-rose-900">
                ✗ Ordem incorreta. Tente novamente!
              </div>
            )}

            <button
              disabled={placedWords.length === 0}
              onClick={handleCheckSentence}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Verificar Frase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default LanguageLearningMode;
