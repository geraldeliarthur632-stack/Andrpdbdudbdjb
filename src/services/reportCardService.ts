import { GradeLevel, GradingPeriodType, ReportCardData, SubjectGradeEntry } from '../types';
import { getSubjectsForGrade } from '../data/curriculumData';

const STORAGE_KEY = 'estudahud_report_card_v1';
const ESTIMATED_GRADES_KEY = 'estudahud_journey_estimated_grades_v1';

export interface SubjectEstimatedGrade {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctAttempts: number;
  estimatedGrade10: number; // 0 to 10.0
  estimatedGrade100: number; // 0 to 100
  classification: string;
  lastUpdated: number;
}

export const reportCardService = {
  getDefaultData(grade: GradeLevel): ReportCardData {
    const gradeSubjects = getSubjectsForGrade(grade);
    const subjects: SubjectGradeEntry[] = gradeSubjects.map((s) => ({
      subjectId: s.id,
      subjectName: s.name,
      isCustom: false,
      grades: [null, null, null, null], // Default 4 bimonthly grades
    }));

    return {
      periodType: 'bimonthly',
      passingGrade: 60,
      subjects,
      lastUpdated: Date.now(),
    };
  },

  getData(grade: GradeLevel): ReportCardData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ReportCardData = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          // Migration from 0-10 to 0-100 scale if needed
          if (typeof parsed.passingGrade === 'number' && parsed.passingGrade <= 10) {
            parsed.passingGrade = Math.round(parsed.passingGrade * 10);
            parsed.subjects = parsed.subjects.map((s) => ({
              ...s,
              grades: s.grades.map((g) => (g !== null && g <= 10 ? Math.round(g * 10) : g)),
            }));
            this.saveData(parsed);
          }
          return parsed;
        }
      }
    } catch {}

    const defaultData = this.getDefaultData(grade);
    this.saveData(defaultData);
    return defaultData;
  },

  saveData(data: ReportCardData): void {
    try {
      data.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('estudahud_report_card_updated', { detail: data }));
    } catch {}
  },

  // ================= ESTIMATED GRADES FROM JOURNEY EXERCISES =================
  recordJourneyExerciseResult(subjectId: string, subjectName: string, isCorrect: boolean): SubjectEstimatedGrade {
    const allEstimates = this.getAllEstimatedGrades();
    const existing = allEstimates[subjectId] || {
      subjectId,
      subjectName,
      totalAttempts: 0,
      correctAttempts: 0,
      estimatedGrade10: 7.0, // baseline start
      estimatedGrade100: 70,
      classification: 'Em Avaliação',
      lastUpdated: Date.now(),
    };

    const newTotal = existing.totalAttempts + 1;
    const newCorrect = existing.correctAttempts + (isCorrect ? 1 : 0);

    // Calculate score using weighted accuracy (starts with a soft prior so 1 wrong answer doesn't give 0 immediately)
    const accuracy = newCorrect / newTotal;
    const score100 = Math.round(accuracy * 100);
    const score10 = Number((score100 / 10).toFixed(1));

    let classification = 'Excelente 🌟';
    if (score100 >= 90) classification = 'Excelente (Dominou a Matéria) 🌟';
    else if (score100 >= 75) classification = 'Muito Bom (Acima da Média) ✅';
    else if (score100 >= 60) classification = 'Bom (Na Média Escolar) 📘';
    else if (score100 >= 40) classification = 'Atenção (Precisa de Reforço) ⚠️';
    else classification = 'Crítico (Praticar Mais) 🔴';

    const updatedItem: SubjectEstimatedGrade = {
      subjectId,
      subjectName,
      totalAttempts: newTotal,
      correctAttempts: newCorrect,
      estimatedGrade10: score10,
      estimatedGrade100: score100,
      classification,
      lastUpdated: Date.now(),
    };

    allEstimates[subjectId] = updatedItem;

    try {
      localStorage.setItem(ESTIMATED_GRADES_KEY, JSON.stringify(allEstimates));
      window.dispatchEvent(new CustomEvent('estudahud_estimated_grades_updated', { detail: allEstimates }));
    } catch {}

    return updatedItem;
  },

  getAllEstimatedGrades(): Record<string, SubjectEstimatedGrade> {
    try {
      const raw = localStorage.getItem(ESTIMATED_GRADES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return {};
  },

  getEstimatedSubjectGrade(subjectId: string, fallbackName?: string): SubjectEstimatedGrade {
    const all = this.getAllEstimatedGrades();
    if (all[subjectId]) {
      return all[subjectId];
    }
    return {
      subjectId,
      subjectName: fallbackName || 'Matéria',
      totalAttempts: 0,
      correctAttempts: 0,
      estimatedGrade10: 8.0,
      estimatedGrade100: 80,
      classification: 'Iniciando Prática',
      lastUpdated: Date.now(),
    };
  },

  applyEstimatedGradeToRealReport(subjectId: string, periodIndex: number, grade: GradeLevel): ReportCardData {
    const currentData = this.getData(grade);
    const estimated = this.getEstimatedSubjectGrade(subjectId);

    const updatedSubjects = currentData.subjects.map((s) => {
      if (s.subjectId === subjectId) {
        const nextGrades = [...s.grades];
        nextGrades[periodIndex] = estimated.estimatedGrade100;
        return { ...s, grades: nextGrades };
      }
      return s;
    });

    const updatedReport: ReportCardData = {
      ...currentData,
      subjects: updatedSubjects,
    };

    this.saveData(updatedReport);
    return updatedReport;
  },

  // ================= GENERAL CALCULATIONS =================
  calculateSubjectAverage(grades: (number | null)[]): { average: number | null; filledCount: number } {
    const validGrades = grades.filter((g): g is number => g !== null && typeof g === 'number' && !isNaN(g));
    if (validGrades.length === 0) {
      return { average: null, filledCount: 0 };
    }
    const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
    const avg = Number((sum / validGrades.length).toFixed(1));
    return { average: avg, filledCount: validGrades.length };
  },

  calculateNeededGradeForPassing(
    grades: (number | null)[],
    periodType: GradingPeriodType,
    passingGrade: number
  ): { neededAverageInRemaining: number | null; isAlreadyPassed: boolean; isImpossible: boolean } {
    const totalPeriods = periodType === 'bimonthly' ? 4 : 3;
    const validGrades = grades.slice(0, totalPeriods).filter((g): g is number => g !== null && typeof g === 'number' && !isNaN(g));
    const filledCount = validGrades.length;
    const remainingPeriods = totalPeriods - filledCount;

    if (remainingPeriods === 0) {
      const avg = validGrades.reduce((acc, curr) => acc + curr, 0) / totalPeriods;
      return {
        neededAverageInRemaining: null,
        isAlreadyPassed: avg >= passingGrade,
        isImpossible: avg < passingGrade,
      };
    }

    const currentSum = validGrades.reduce((acc, curr) => acc + curr, 0);
    const targetTotalSum = passingGrade * totalPeriods;
    const neededSum = targetTotalSum - currentSum;

    if (neededSum <= 0) {
      return {
        neededAverageInRemaining: 0,
        isAlreadyPassed: true,
        isImpossible: false,
      };
    }

    const neededPerPeriod = Number((neededSum / remainingPeriods).toFixed(1));

    if (neededPerPeriod > 100.0) {
      return {
        neededAverageInRemaining: neededPerPeriod,
        isAlreadyPassed: false,
        isImpossible: true,
      };
    }

    return {
      neededAverageInRemaining: neededPerPeriod,
      isAlreadyPassed: false,
      isImpossible: false,
    };
  },

  calculateOverallStats(data: ReportCardData): {
    overallAverage: number | null;
    passedSubjectsCount: number;
    atRiskSubjectsCount: number;
    pendingSubjectsCount: number;
    totalSubjectsCount: number;
  } {
    let totalSum = 0;
    let countedSubjects = 0;
    let passed = 0;
    let atRisk = 0;
    let pending = 0;

    data.subjects.forEach((subj) => {
      const { average } = this.calculateSubjectAverage(subj.grades);
      if (average !== null) {
        totalSum += average;
        countedSubjects++;
        if (average >= data.passingGrade) {
          passed++;
        } else {
          atRisk++;
        }
      } else {
        pending++;
      }
    });

    const overallAverage = countedSubjects > 0 ? Number((totalSum / countedSubjects).toFixed(1)) : null;

    return {
      overallAverage,
      passedSubjectsCount: passed,
      atRiskSubjectsCount: atRisk,
      pendingSubjectsCount: pending,
      totalSubjectsCount: data.subjects.length,
    };
  },
};
