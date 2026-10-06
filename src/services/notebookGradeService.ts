export interface NotebookGradeResult {
  id: string;
  grade: number; // 0 to 10
  title: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  subjectId: string;
  subjectName: string;
  xpAwarded: number;
  evaluatedAt: string;
  imageThumbnail?: string;
}

const STORAGE_KEY = 'estudahud_notebook_grades_history_v1';

export const notebookGradeService = {
  getHistory(): NotebookGradeResult[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  saveToHistory(record: NotebookGradeResult): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = [record, ...history.filter((r) => r.id !== record.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },

  async evaluatePhoto(params: {
    imageBase64: string;
    subjectId?: string;
    subjectName?: string;
    grade?: string;
    studentName?: string;
  }): Promise<NotebookGradeResult> {
    const res = await fetch('/api/ai/grade-notebook-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || 'Não foi possível avaliar a foto do caderno no momento.');
    }

    const data = await res.json();
    const result: NotebookGradeResult = {
      id: `nb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      grade: typeof data.grade === 'number' ? data.grade : 9.0,
      title: data.title || 'Avaliação do Caderno',
      feedback: data.feedback || 'Caderno bem estruturado com caligrafia caprichada e fórmulas destacadas.',
      strengths: Array.isArray(data.strengths) ? data.strengths : ['Anotações organizadas', 'Tópicos claros'],
      improvements: Array.isArray(data.improvements) ? data.improvements : ['Adicione data em cada nova aula'],
      subjectId: params.subjectId || 'geral',
      subjectName: params.subjectName || 'Geral',
      xpAwarded: Number(data.xpAwarded) || 80,
      evaluatedAt: data.evaluatedAt || new Date().toISOString(),
      imageThumbnail: params.imageBase64.length < 500000 ? params.imageBase64 : undefined,
    };

    this.saveToHistory(result);
    return result;
  },
};
