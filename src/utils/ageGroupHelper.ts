import { AgeGroup, GradeLevel } from '../types';

export function deduceAgeGroupFromGrade(grade?: GradeLevel): AgeGroup {
  if (!grade) return 'nao_informada';

  if (['1_fund', '2_fund', '3_fund', '4_fund', '5_fund', '6_fund'].includes(grade)) {
    return 'crianca';
  }

  if (['7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio', 'enem'].includes(grade)) {
    return 'adolescente';
  }

  return 'adulto';
}
