import { Question, SubjectId, GradeLevel } from '../types';

export interface AnsweredQuestionRecord {
  id: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  subjectId: SubjectId;
  subjectName: string;
  topicTitle: string;
  explanation: string;
  answeredAt: string; // ISO date
  grade?: GradeLevel;
  sourceMode?: string; // 'journey', 'caderno', 'duel', 'math', etc.
}

const STORAGE_KEY = 'estudahud_answered_questions_history_v1';
const MAX_STORED_RECORDS = 500;

export const answeredQuestionsService = {
  getRecords(): AnsweredQuestionRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // Initial sample answered questions based on BNCC curriculum
    const initialRecords: AnsweredQuestionRecord[] = [
      {
        id: 'ans_init_1',
        questionText: 'Qual fração é equivalente a 75%?',
        options: ['1/2', '2/3', '3/4', '4/5'],
        selectedOptionIndex: 2,
        correctOptionIndex: 2,
        isCorrect: true,
        subjectId: 'matematica',
        subjectName: 'Matemática',
        topicTitle: 'Frações e Porcentagem',
        explanation: '75% = 75/100. Simplificando por 25 no numerador e denominador, obtemos 3/4.',
        answeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        grade: '6_fund',
        sourceMode: 'jornada',
      },
      {
        id: 'ans_init_2',
        questionText: 'Na oração "Os estudantes chegaram animados para a aula", qual é o sujeito?',
        options: ['Os estudantes', 'Animados', 'Para a aula', 'Chegaram'],
        selectedOptionIndex: 0,
        correctOptionIndex: 0,
        isCorrect: true,
        subjectId: 'portugues',
        subjectName: 'Português',
        topicTitle: 'Sujeito e Predicado',
        explanation: 'Quem chegou animado? "Os estudantes", portanto este é o sujeito simples da frase.',
        answeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        grade: '6_fund',
        sourceMode: 'caderno',
      },
      {
        id: 'ans_init_3',
        questionText: 'Qual organela celular é responsável pela respiração celular e produção de energia (ATP)?',
        options: ['Ribossomo', 'Mitocôndria', 'Complexo de Golgi', 'Lisossomo'],
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        subjectId: 'ciencias',
        subjectName: 'Ciências',
        topicTitle: 'Célula e Organelas',
        explanation: 'As mitocôndrias realizam a respiração celular que gera energia para todas as atividades vitais da célula.',
        answeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        grade: '6_fund',
        sourceMode: 'jornada',
      },
      {
        id: 'ans_init_4',
        questionText: 'Em qual camada da Terra ocorrem as correntes de convecção que movimentam as placas tectônicas?',
        options: ['Crosta terrestre', 'Manto', 'Núcleo externo', 'Núcleo interno'],
        selectedOptionIndex: 0,
        correctOptionIndex: 1,
        isCorrect: false,
        subjectId: 'geografia',
        subjectName: 'Geografia',
        topicTitle: 'Camadas da Terra e Placas',
        explanation: 'As correntes de convecção de magma ocorrem no manto terrestre (astenosfera), impulsionando a litosfera.',
        answeredAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        grade: '6_fund',
        sourceMode: 'jornada',
      },
    ];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecords));
    } catch {}

    return initialRecords;
  },

  recordAnswer(params: {
    question: Question | { question?: string; text?: string; options?: string[]; correctIndex?: number; explanation?: string };
    selectedOptionIndex: number;
    subjectId: SubjectId;
    subjectName?: string;
    topicTitle?: string;
    grade?: GradeLevel;
    sourceMode?: string;
  }): AnsweredQuestionRecord {
    const q = params.question as any;
    const questionText = q.question || q.text || 'Pergunta sem enunciado';
    const options = Array.isArray(q.options) ? q.options : [];
    const correctOptionIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
    const isCorrect = params.selectedOptionIndex === correctOptionIndex;

    const record: AnsweredQuestionRecord = {
      id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      questionText,
      options,
      selectedOptionIndex: params.selectedOptionIndex,
      correctOptionIndex,
      isCorrect,
      subjectId: params.subjectId || 'matematica',
      subjectName: params.subjectName || 'Matemática',
      topicTitle: params.topicTitle || 'Conteúdo Escolar',
      explanation: q.explanation || 'Consulte a teoria para revisar este conteúdo.',
      answeredAt: new Date().toISOString(),
      grade: params.grade,
      sourceMode: params.sourceMode || 'jornada',
    };

    try {
      const current = this.getRecords();
      // Previne duplicações consecutivas imediatas
      const updated = [record, ...current.filter((r) => r.questionText !== questionText || Date.now() - new Date(r.answeredAt).getTime() > 60000)].slice(0, MAX_STORED_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return record;
  },

  getFilteredRecords(params?: {
    subjectId?: string;
    filter?: 'all' | 'correct' | 'wrong';
    search?: string;
  }): AnsweredQuestionRecord[] {
    let records = this.getRecords();

    if (params?.subjectId && params.subjectId !== 'all') {
      records = records.filter((r) => r.subjectId === params.subjectId);
    }

    if (params?.filter === 'correct') {
      records = records.filter((r) => r.isCorrect);
    } else if (params?.filter === 'wrong') {
      records = records.filter((r) => !r.isCorrect);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.questionText.toLowerCase().includes(q) ||
          r.topicTitle.toLowerCase().includes(q) ||
          r.explanation.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q)
      );
    }

    return records;
  },

  getStats(): {
    total: number;
    correct: number;
    wrong: number;
    accuracyPercent: number;
    bySubject: Record<string, { total: number; correct: number; name: string }>;
  } {
    const records = this.getRecords();
    const total = records.length;
    const correct = records.filter((r) => r.isCorrect).length;
    const wrong = total - correct;
    const accuracyPercent = total > 0 ? Math.round((correct / total) * 100) : 0;

    const bySubject: Record<string, { total: number; correct: number; name: string }> = {};

    records.forEach((r) => {
      if (!bySubject[r.subjectId]) {
        bySubject[r.subjectId] = { total: 0, correct: 0, name: r.subjectName };
      }
      bySubject[r.subjectId].total += 1;
      if (r.isCorrect) {
        bySubject[r.subjectId].correct += 1;
      }
    });

    return { total, correct, wrong, accuracyPercent, bySubject };
  },

  getSubjectSummaries(subjectId?: SubjectId): { topicTitle: string; points: string[]; questionCount: number }[] {
    const records = this.getRecords().filter((r) => !subjectId || r.subjectId === subjectId);
    const groups: Record<string, { topicTitle: string; points: Set<string>; questionCount: number }> = {};

    records.forEach((r) => {
      const key = r.topicTitle || 'Conceitos Gerais';
      if (!groups[key]) {
        groups[key] = { topicTitle: key, points: new Set(), questionCount: 0 };
      }
      groups[key].questionCount += 1;
      if (r.explanation && r.explanation.length > 10) {
        // Extrai ponto-chave da explicação
        const sentence = r.explanation.split('.')[0].trim();
        if (sentence) {
          groups[key].points.add(sentence);
        }
      }
    });

    return Object.values(groups).map((g) => ({
      topicTitle: g.topicTitle,
      points: Array.from(g.points).slice(0, 4),
      questionCount: g.questionCount,
    }));
  },

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
