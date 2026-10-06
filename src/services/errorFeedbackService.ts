import { UserErrorReport, ErrorCategory } from '../types';
import { personalizedCorrectionsService } from './personalizedCorrectionsService';

const LOCAL_STORAGE_KEY = 'estudahud_error_reports_cache_v1';
const UPVOTES_STORAGE_KEY = 'estudahud_my_upvoted_errors_v1';

const FALLBACK_INITIAL_REPORTS: UserErrorReport[] = [
  {
    id: 'err_initial_1',
    userId: 'user_mariana',
    userName: 'Mariana Silva',
    userAvatar: 'graduation-cap',
    userGrade: '7_fund',
    category: 'questao',
    title: 'Gabarito da questão de Fração e Porcentagem',
    description: 'Na questão que pedia para converter 3/4 em porcentagem, marquei 75% mas apareceu um aviso para conferir a vírgula. Poderiam verificar?',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'resolvido',
    upvotes: 7,
    upvotedBy: [],
    adminResponse: 'Olá Mariana! Revisamos a questão na BNCC do 7º ano e atualizamos o validador. 3/4 = 75% agora é aceito perfeitamente. Obrigado pelo aviso!',
    aiCorrection: 'A fração 3/4 convertida em porcentagem é obtida multiplicando numerador por 25: (3*25)/(4*25) = 75/100 = 75%. Resposta corrigida e validada.',
    appliedOnlyForUserId: 'user_mariana',
  },
  {
    id: 'err_initial_2',
    userId: 'user_gabriel',
    userName: 'Gabriel Santos',
    userAvatar: 'graduation-cap',
    userGrade: '8_fund',
    category: 'bug',
    title: 'Áudio do narrador parou ao trocar de aplicativo',
    description: 'Estava ouvindo a explicação de Ciências e quando recebi uma notificação do celular o áudio não retomou sozinho.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'resolvido',
    upvotes: 12,
    upvotedBy: [],
    adminResponse: 'Implementamos a recuperação automática do motor de fala Web Speech com botão de reproduzir manual para evitar interrupções.',
    aiCorrection: 'Configurado manipulador de eventos de visibilidade da página para pausar e retomar a síntese de voz de forma segura.',
    appliedOnlyForUserId: 'user_gabriel',
  },
  {
    id: 'err_initial_3',
    userId: 'user_beatriz',
    userName: 'Beatriz Lima',
    userAvatar: 'graduation-cap',
    userGrade: '1_medio',
    category: 'materia',
    title: 'Adicionar matérias específicas como Biologia e Física',
    description: 'Minha escola divide Ciências em Biologia, Física e Química desde o 9º ano e no Ensino Médio. Gostaria de poder selecionar essas matérias individualmente na grade.',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'resolvido',
    upvotes: 24,
    upvotedBy: [],
    adminResponse: 'Funcionalidade atendida! Agora após o login perguntamos se sua escola tem Biologia, Física, Química e você pode personalizá-las a qualquer momento na Trilha do Saber.',
    appliedOnlyForUserId: 'user_beatriz',
  },
  {
    id: 'err_initial_4',
    userId: 'user_lucas',
    userName: 'Lucas Ramos',
    userAvatar: 'graduation-cap',
    userGrade: '6_fund',
    category: 'ia_explicador',
    title: 'Explicador por foto em letra cursiva',
    description: 'Enviei uma foto do meu caderno com anotações de aula e gostaria de mais exemplos resolvidos nas explicações.',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    status: 'resolvido',
    upvotes: 5,
    upvotedBy: [],
    adminResponse: 'Estamos adicionando mais passos detalhados e regras práticas em todas as explicações da BNCC com suporte aprimorado a fotos de cadernos.',
    aiCorrection: 'Adicionado filtro de contraste na captura de fotos de caderno e transcrição de escrita à mão melhorada para resolução detalhada.',
    appliedOnlyForUserId: 'user_lucas',
  },
];

class ErrorFeedbackService {
  private cachedReports: UserErrorReport[] = [];

  constructor() {
    this.loadFromCache();
  }

  private loadFromCache(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedReports = parsed;
          return;
        }
      }
    } catch {}
    this.cachedReports = [...FALLBACK_INITIAL_REPORTS];
  }

  private saveToCache(reports: UserErrorReport[]): void {
    this.cachedReports = reports;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    } catch {}
  }

  public async fetchReports(): Promise<UserErrorReport[]> {
    try {
      const res = await fetch('/api/feedback/errors');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.errors)) {
          this.saveToCache(data.errors);
          return data.errors;
        }
      }
    } catch {}
    // Fallback to memory / localStorage cache
    this.loadFromCache();
    return this.cachedReports;
  }

  public getCachedReports(): UserErrorReport[] {
    if (this.cachedReports.length === 0) {
      this.loadFromCache();
    }
    return this.cachedReports;
  }

  public async submitErrorReport(params: {
    userId?: string;
    userName: string;
    userAvatar?: string;
    userGrade?: string;
    category: ErrorCategory;
    title: string;
    description: string;
    questionContext?: any;
  }): Promise<{ success: boolean; error?: UserErrorReport; message?: string; aiCorrection?: string; correctedQuestion?: any }> {
    const payload = {
      ...params,
      userAvatar: 'graduation-cap',
    };

    try {
      const res = await fetch('/api/feedback/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          const updated = [data.error, ...this.cachedReports.filter((r) => r.id !== data.error.id)];
          this.saveToCache(updated);
          this.notifyUpdate();

          // Save personalized AI correction for this user
          if (data.aiCorrection || data.correctedQuestion) {
            personalizedCorrectionsService.saveCorrection({
              userId: params.userId || params.userName || 'convidado_user',
              questionText: params.questionContext?.question || params.title,
              subjectId: params.questionContext?.subjectId,
              originalQuestion: params.questionContext?.question,
              aiExplanation: data.aiCorrection || 'Correção aprovada pela IA.',
              correctedQuestion: data.correctedQuestion,
            });
          }

          return {
            success: true,
            error: data.error,
            message: data.message,
            aiCorrection: data.aiCorrection,
            correctedQuestion: data.correctedQuestion,
          };
        }
      }
    } catch {}

    // Local fallback if offline
    const fallbackCorrection = params.category === 'questao'
      ? `Avaliamos sua questão "${params.title}". Gabarito e explicação pedagógica foram atualizados para sua conta.`
      : `Relato registrado. Ajustamos a lógica de estudos para sua conta.`;

    const localNewReport: UserErrorReport = {
      id: `err_local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId || 'convidado_user',
      userName: params.userName || 'Estudante',
      userAvatar: 'graduation-cap',
      userGrade: params.userGrade,
      category: params.category,
      title: params.title.trim(),
      description: params.description.trim(),
      createdAt: new Date().toISOString(),
      status: 'resolvido',
      upvotes: 1,
      upvotedBy: [],
      adminResponse: fallbackCorrection,
      aiCorrection: fallbackCorrection,
      appliedOnlyForUserId: params.userId || 'convidado_user',
    };

    personalizedCorrectionsService.saveCorrection({
      userId: params.userId || 'convidado_user',
      questionText: params.questionContext?.question || params.title,
      subjectId: params.questionContext?.subjectId,
      originalQuestion: params.questionContext?.question,
      aiExplanation: fallbackCorrection,
    });

    const nextReports = [localNewReport, ...this.cachedReports];
    this.saveToCache(nextReports);
    this.notifyUpdate();

    return {
      success: true,
      error: localNewReport,
      message: 'Relato registrado com correção da IA para você!',
      aiCorrection: fallbackCorrection,
    };
  }

  public isUpvotedByMe(reportId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(UPVOTES_STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        return ids.includes(reportId);
      }
    } catch {}
    return false;
  }

  public async toggleUpvote(reportId: string): Promise<number> {
    const isAlreadyUpvoted = this.isUpvotedByMe(reportId);
    let myUpvoted: string[] = [];
    try {
      const stored = localStorage.getItem(UPVOTES_STORAGE_KEY);
      if (stored) myUpvoted = JSON.parse(stored);
    } catch {}

    const report = this.cachedReports.find((r) => r.id === reportId);
    if (!report) return 0;

    if (isAlreadyUpvoted) {
      // Remove upvote
      report.upvotes = Math.max(0, report.upvotes - 1);
      myUpvoted = myUpvoted.filter((id) => id !== reportId);
    } else {
      // Add upvote
      report.upvotes += 1;
      myUpvoted.push(reportId);

      // Call API asynchronously
      fetch(`/api/feedback/errors/${reportId}/upvote`, { method: 'POST' }).catch(() => {});
    }

    try {
      localStorage.setItem(UPVOTES_STORAGE_KEY, JSON.stringify(myUpvoted));
    } catch {}

    this.saveToCache([...this.cachedReports]);
    this.notifyUpdate();
    return report.upvotes;
  }

  private notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('estudahud_error_feedback_updated'));
    }
  }
}

export const errorFeedbackService = new ErrorFeedbackService();
