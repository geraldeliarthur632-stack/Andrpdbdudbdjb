export interface PersonalizedCorrection {
  id: string;
  userId: string;
  questionText: string;
  subjectId?: string;
  originalQuestion?: string;
  aiExplanation: string;
  correctedQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  appliedAt: string;
}

const STORAGE_PREFIX = 'estudahud_ai_corrections_user_';

export const personalizedCorrectionsService = {
  getStorageKey(userId?: string): string {
    const safeUser = (userId || 'convidado_user').trim().toLowerCase();
    return `${STORAGE_PREFIX}${safeUser}`;
  },

  getAllCorrections(userId?: string): PersonalizedCorrection[] {
    if (typeof window === 'undefined') return [];
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  saveCorrection(correction: Omit<PersonalizedCorrection, 'id' | 'appliedAt'>): PersonalizedCorrection {
    const record: PersonalizedCorrection = {
      ...correction,
      id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appliedAt: new Date().toISOString(),
    };

    if (typeof window === 'undefined') return record;

    try {
      const key = this.getStorageKey(correction.userId);
      const existing = this.getAllCorrections(correction.userId);
      const updated = [record, ...existing.filter((c) => c.questionText !== record.questionText)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}

    return record;
  },

  findCorrectionForQuestion(userId: string | undefined, questionText: string): PersonalizedCorrection | null {
    if (!questionText) return null;
    const cleanQ = questionText.trim().toLowerCase();
    const list = this.getAllCorrections(userId);
    return (
      list.find((c) => {
        const itemQ = (c.questionText || c.originalQuestion || '').trim().toLowerCase();
        return itemQ === cleanQ || (cleanQ.length > 20 && itemQ.includes(cleanQ.slice(0, 30)));
      }) || null
    );
  },
};
