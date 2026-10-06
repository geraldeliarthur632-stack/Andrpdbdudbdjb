// Academic Topics Mistakes Tracker & Diagnostics Service
import { GradeLevel } from '../types';

export interface QuestionAttemptRecord {
  id: string;
  questionText: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  isCorrect: boolean;
  timestamp: number;
  grade: GradeLevel;
  userChoice?: string;
  correctChoice?: string;
  explanation?: string;
}

export interface TopicMistakeStat {
  topic: string;
  subjectId: string;
  subjectName: string;
  icon: string;
  totalAttempts: number;
  errorCount: number;
  correctCount: number;
  accuracyPercent: number;
  errorRatePercent: number;
  status: 'critico' | 'atencao' | 'dominado';
  recommendation: string;
}

const STORAGE_KEY = 'estudahud_question_attempts_v1';

class MistakesTrackerService {
  private attempts: QuestionAttemptRecord[] = [];

  constructor() {
    this.loadAttempts();
  }

  private loadAttempts(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.attempts = JSON.parse(saved);
      } else {
        this.seedInitialGradeData('6_fund');
      }
    } catch {
      this.attempts = [];
    }
  }

  private saveAttempts(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.attempts));
      window.dispatchEvent(new CustomEvent('estudahud_mistakes_updated'));
    } catch {}
  }

  public recordAttempt(attempt: Omit<QuestionAttemptRecord, 'id' | 'timestamp'>): void {
    const newRecord: QuestionAttemptRecord = {
      ...attempt,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };
    this.attempts.push(newRecord);
    // Keep max 300 recent records
    if (this.attempts.length > 300) {
      this.attempts = this.attempts.slice(this.attempts.length - 300);
    }
    this.saveAttempts();
  }

  public getTopicMistakesSummary(grade: GradeLevel = '6_fund'): TopicMistakeStat[] {
    // If empty for this grade, seed default curriculum attempts
    const gradeAttempts = this.attempts.filter((a) => a.grade === grade);
    if (gradeAttempts.length === 0) {
      this.seedInitialGradeData(grade);
    }

    const relevant = this.attempts.filter((a) => a.grade === grade);
    const topicMap = new Map<string, {
      subjectId: string;
      subjectName: string;
      total: number;
      errors: number;
      correct: number;
    }>();

    for (const att of relevant) {
      const key = att.topic || 'Conceitos Gerais';
      const existing = topicMap.get(key) || {
        subjectId: att.subjectId || 'geral',
        subjectName: att.subjectName || 'Geral',
        total: 0,
        errors: 0,
        correct: 0,
      };

      existing.total += 1;
      if (att.isCorrect) {
        existing.correct += 1;
      } else {
        existing.errors += 1;
      }
      topicMap.set(key, existing);
    }

    const subjectIcons: Record<string, string> = {
      matematica: '📐',
      portugues: '📚',
      ciencias: '🔬',
      historia: '🏛️',
      geografia: '🌍',
      ingles: '🗣️',
      artes: '🎨',
      filosofia: '🧠',
      sociologia: '👥',
      fisica: '⚡',
      quimica: '🧪',
      biologia: '🧬',
      literatura: '📖',
      redacao: '✍️',
    };

    const results: TopicMistakeStat[] = [];

    topicMap.forEach((val, topic) => {
      const accuracyPercent = Math.round((val.correct / Math.max(1, val.total)) * 100);
      const errorRatePercent = 100 - accuracyPercent;
      let status: 'critico' | 'atencao' | 'dominado' = 'dominado';

      if (accuracyPercent < 55 || val.errors >= 3) {
        status = 'critico';
      } else if (accuracyPercent < 75 || val.errors >= 1) {
        status = 'atencao';
      }

      let recommendation = 'Ótimo domínio deste tema. Mantenha as revisões periódicas!';
      if (status === 'critico') {
        recommendation = `Alta taxa de erros (${val.errors} erros). Recomendado revisar a teoria e fazer simulados guiados com foco na BNCC.`;
      } else if (status === 'atencao') {
        recommendation = `Desempenho intermediário (${accuracyPercent}% de acertos). Pratique 3 a 5 exercícios extras para consolidar.`;
      }

      results.push({
        topic,
        subjectId: val.subjectId,
        subjectName: val.subjectName,
        icon: subjectIcons[val.subjectId] || '📝',
        totalAttempts: val.total,
        errorCount: val.errors,
        correctCount: val.correct,
        accuracyPercent,
        errorRatePercent,
        status,
        recommendation,
      });
    });

    // Sort: topics with most errors and highest error rate first
    return results.sort((a, b) => {
      if (b.errorCount !== a.errorCount) {
        return b.errorCount - a.errorCount;
      }
      return b.errorRatePercent - a.errorRatePercent;
    });
  }

  public getMostMissedTopics(grade: GradeLevel = '6_fund', limit = 5): TopicMistakeStat[] {
    const summary = this.getTopicMistakesSummary(grade);
    return summary.filter((s) => s.errorCount > 0).slice(0, limit);
  }

  public getRecentErrors(grade: GradeLevel = '6_fund', limit = 10): QuestionAttemptRecord[] {
    const relevant = this.attempts.filter((a) => a.grade === grade && !a.isCorrect);
    // Return newest first
    return relevant.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  public getAttemptsForTopic(grade: GradeLevel = '6_fund', topic: string): QuestionAttemptRecord[] {
    return this.attempts
      .filter((a) => a.grade === grade && a.topic.toLowerCase() === topic.toLowerCase())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public clearTopicErrors(grade: GradeLevel, topic: string): void {
    // Remove past errors for this topic and replace with a correct attempt
    this.attempts = this.attempts.filter(
      (a) => !(a.grade === grade && a.topic.toLowerCase() === topic.toLowerCase() && !a.isCorrect)
    );
    this.saveAttempts();
  }

  public getSubjectErrorStats(grade: GradeLevel = '6_fund'): Array<{
    subjectId: string;
    subjectName: string;
    icon: string;
    errorCount: number;
    correctCount: number;
    totalAttempts: number;
    accuracyPercent: number;
  }> {
    const summary = this.getTopicMistakesSummary(grade);
    const map = new Map<string, {
      subjectName: string;
      icon: string;
      errorCount: number;
      correctCount: number;
      totalAttempts: number;
    }>();

    for (const item of summary) {
      const existing = map.get(item.subjectId) || {
        subjectName: item.subjectName,
        icon: item.icon,
        errorCount: 0,
        correctCount: 0,
        totalAttempts: 0,
      };
      existing.errorCount += item.errorCount;
      existing.correctCount += item.correctCount;
      existing.totalAttempts += item.totalAttempts;
      map.set(item.subjectId, existing);
    }

    const list: Array<{
      subjectId: string;
      subjectName: string;
      icon: string;
      errorCount: number;
      correctCount: number;
      totalAttempts: number;
      accuracyPercent: number;
    }> = [];

    map.forEach((val, id) => {
      const accuracyPercent = Math.round((val.correctCount / Math.max(1, val.totalAttempts)) * 100);
      list.push({
        subjectId: id,
        subjectName: val.subjectName,
        icon: val.icon,
        errorCount: val.errorCount,
        correctCount: val.correctCount,
        totalAttempts: val.totalAttempts,
        accuracyPercent,
      });
    });

    return list.sort((a, b) => b.errorCount - a.errorCount);
  }

  public getDifficultyRankedSubjects(
    grade: GradeLevel = '6_fund',
    availableSubjects: Array<{ id: string; name: string; icon?: string }>
  ): Array<{
    subjectId: string;
    subjectName: string;
    icon: string;
    errorCount: number;
    correctCount: number;
    totalAttempts: number;
    accuracyPercent: number;
    difficultyScore: number;
    reason: string;
    badgeLabel: string;
  }> {
    const errorStats = this.getSubjectErrorStats(grade);
    const errorStatsMap = new Map(errorStats.map((s) => [s.subjectId, s]));

    let estimatedGrades: Record<string, { totalAttempts?: number; correctAttempts?: number }> = {};
    try {
      const raw = localStorage.getItem('estudahud_journey_estimated_grades_v1');
      if (raw) estimatedGrades = JSON.parse(raw);
    } catch {}

    const results = availableSubjects.map((sub) => {
      const fromErrors = errorStatsMap.get(sub.id);
      const fromEstimated = estimatedGrades[sub.id];

      const correctCount = (fromErrors?.correctCount || 0) + (fromEstimated?.correctAttempts || 0);
      const additionalErrors = Math.max(0, (fromEstimated?.totalAttempts || 0) - (fromEstimated?.correctAttempts || 0));
      const errorCount = (fromErrors?.errorCount || 0) + additionalErrors;
      const totalAttempts = correctCount + errorCount;
      const accuracyPercent = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

      let difficultyScore = 0;
      let reason = '';
      let badgeLabel = '';

      if (totalAttempts > 0) {
        difficultyScore = (100 - accuracyPercent) * 2 + Math.min(50, errorCount * 5);
        if (accuracyPercent <= 50) {
          reason = `Maior taxa de erros: ${accuracyPercent}% de acertos acumulados (${correctCount} acertos em ${totalAttempts} questões)`;
          badgeLabel = `⚠️ Maior Dificuldade (${accuracyPercent}% acertos)`;
        } else if (accuracyPercent <= 75) {
          reason = `Atenção recomendada: ${accuracyPercent}% de acertos acumulados (${correctCount} de ${totalAttempts} certas)`;
          badgeLabel = `🎯 Reforço Recomendado (${accuracyPercent}% acertos)`;
        } else {
          reason = `Bom desempenho (${accuracyPercent}% de acertos), revisão periódica indicada`;
          badgeLabel = `📘 Revisão (${accuracyPercent}% acertos)`;
        }
      } else {
        difficultyScore = 40;
        reason = `Ainda sem questões respondidas — ideal para acumular novos acertos e XP`;
        badgeLabel = `🌟 Começar Prática`;
      }

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        icon: sub.icon || '📚',
        errorCount,
        correctCount,
        totalAttempts,
        accuracyPercent,
        difficultyScore,
        reason,
        badgeLabel,
      };
    });

    return results.sort((a, b) => b.difficultyScore - a.difficultyScore);
  }

  public getOverallDiagnostic(grade: GradeLevel = '6_fund'): {
    totalErrors: number;
    totalCorrect: number;
    totalAttempts: number;
    overallAccuracy: number;
    criticalTopicsCount: number;
    attentionTopicsCount: number;
    masteredTopicsCount: number;
    mostVulnerableSubject: string;
    mostVulnerableTopic: string;
  } {
    const summary = this.getTopicMistakesSummary(grade);
    let totalErrors = 0;
    let totalCorrect = 0;
    let criticalTopicsCount = 0;
    let attentionTopicsCount = 0;
    let masteredTopicsCount = 0;

    for (const t of summary) {
      totalErrors += t.errorCount;
      totalCorrect += t.correctCount;
      if (t.status === 'critico') criticalTopicsCount++;
      else if (t.status === 'atencao') attentionTopicsCount++;
      else masteredTopicsCount++;
    }

    const totalAttempts = totalErrors + totalCorrect;
    const overallAccuracy = Math.round((totalCorrect / Math.max(1, totalAttempts)) * 100);

    const subjectStats = this.getSubjectErrorStats(grade);
    const mostVulnerableSubject = subjectStats[0]?.subjectName || 'Matemática';
    const mostVulnerableTopic = summary[0]?.topic || 'Frações & Números Decimais';

    return {
      totalErrors,
      totalCorrect,
      totalAttempts,
      overallAccuracy,
      criticalTopicsCount,
      attentionTopicsCount,
      masteredTopicsCount,
      mostVulnerableSubject,
      mostVulnerableTopic,
    };
  }

  public seedInitialGradeData(grade: GradeLevel): void {
    const realQuestionsSeed: Record<string, Array<{
      subjectId: string;
      subjectName: string;
      topic: string;
      questionText: string;
      isCorrect: boolean;
      userChoice?: string;
      correctChoice?: string;
      explanation?: string;
    }>> = {
      '6_fund': [
        {
          subjectId: 'matematica',
          subjectName: 'Matemática',
          topic: 'Frações & Números Decimais',
          questionText: 'Qual é o resultado da soma entre 2/5 e 1/2?',
          isCorrect: false,
          userChoice: '3/7 (somou numeradores e denominadores)',
          correctChoice: '9/10 (encontrou o MMC 10)',
          explanation: 'Para somar frações com denominadores diferentes, calcula-se o MMC entre 5 e 2 (10), obtendo 4/10 + 5/10 = 9/10.',
        },
        {
          subjectId: 'matematica',
          subjectName: 'Matemática',
          topic: 'Frações & Números Decimais',
          questionText: 'Como transformar a fração 3/4 em número decimal?',
          isCorrect: false,
          userChoice: '3,4',
          correctChoice: '0,75',
          explanation: 'Divide-se o numerador pelo denominador: 3 ÷ 4 = 0,75.',
        },
        {
          subjectId: 'matematica',
          subjectName: 'Matemática',
          topic: 'Expressões Numéricas & Ordem',
          questionText: 'Em 10 + 5 × 2 - 4, qual operação deve ser resolvida primeiro?',
          isCorrect: false,
          userChoice: '10 + 5 (da esquerda para a direita)',
          correctChoice: '5 × 2 (multiplicação tem prioridade)',
          explanation: 'Na ordem das operações matemáticas, multiplicações e divisões devem ser efetuadas antes de adições e subtrações.',
        },
        {
          subjectId: 'portugues',
          subjectName: 'Português',
          topic: 'Interpretação de Texto & Coesão',
          questionText: 'Qual conectivo expressa ideia de oposição entre duas orações?',
          isCorrect: false,
          userChoice: 'Portanto',
          correctChoice: 'No entanto / Porém',
          explanation: '"No entanto" e "porém" são conjunções adversativas que indicam oposição, enquanto "portanto" é conclusiva.',
        },
        {
          subjectId: 'ciencias',
          subjectName: 'Ciências',
          topic: 'Células e Sistemas do Corpo',
          questionText: 'Qual organela celular é responsável pela respiração celular e produção de energia?',
          isCorrect: false,
          userChoice: 'Ribossomo',
          correctChoice: 'Mitocôndria',
          explanation: 'As mitocôndrias produzem ATP através da respiração celular, sendo as verdadeiras usinas de energia da célula.',
        },
        {
          subjectId: 'geografia',
          subjectName: 'Geografia',
          topic: 'Cartografia & Coordenadas',
          questionText: 'As linhas imaginárias horizontais que medem a latitude a partir da Linha do Equador são chamadas de:',
          isCorrect: false,
          userChoice: 'Meridianos',
          correctChoice: 'Paralelos',
          explanation: 'Paralelos medem a latitude (norte-sul), enquanto meridianos (como Greenwich) medem a longitude (leste-oeste).',
        },
        {
          subjectId: 'historia',
          subjectName: 'História',
          topic: 'Civilizações Antigas & Egito',
          questionText: 'Por que o rio Nilo era considerado fundamental para o Egito Antigo?',
          isCorrect: true,
          userChoice: 'Suas cheias férteis permitiam agricultura no deserto',
          correctChoice: 'Suas cheias férteis permitiam agricultura no deserto',
          explanation: 'O húmus deixado pelas inundações periódicas fertilizava as margens do rio Nilo.',
        },
        {
          subjectId: 'matematica',
          subjectName: 'Matemática',
          topic: 'Frações & Números Decimais',
          questionText: 'Quanto é 0,6 multiplicado por 10?',
          isCorrect: true,
          userChoice: '6',
          correctChoice: '6',
          explanation: 'Multiplicar por 10 desloca a vírgula uma casa para a direita.',
        },
      ],
    };

    const seeds = realQuestionsSeed[grade] || realQuestionsSeed['6_fund'];
    const now = Date.now();

    for (let idx = 0; idx < seeds.length; idx++) {
      const q = seeds[idx];
      this.attempts.push({
        id: `seed_${q.subjectId}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        grade,
        subjectId: q.subjectId,
        subjectName: q.subjectName,
        topic: q.topic,
        questionText: q.questionText,
        isCorrect: q.isCorrect,
        userChoice: q.userChoice,
        correctChoice: q.correctChoice,
        explanation: q.explanation,
        timestamp: now - (idx * 3600000 * 3),
      });
    }

    this.saveAttempts();
  }
}

export const mistakesTrackerService = new MistakesTrackerService();
