import { BadgeItem, TrophyItem } from '../types';

export const ALL_BADGES: BadgeItem[] = [
  {
    id: 'badge_50',
    title: 'Iniciado do Saber',
    description: 'Alcançou 50 pontos na plataforma resolvendo questões.',
    pointsRequired: 50,
    icon: '🌱',
    tier: 'bronze',
    category: 'Primeiros Passos',
  },
  {
    id: 'badge_150',
    title: 'Estudante Focado',
    description: 'Atingiu a marca de 150 pontos com ritmo contínuo.',
    pointsRequired: 150,
    icon: '⚡',
    tier: 'bronze',
    category: 'Foco Curricular',
  },
  {
    id: 'badge_300',
    title: 'Explorador da BNCC',
    description: 'Superou 300 pontos acumulados nas disciplinas.',
    pointsRequired: 300,
    icon: '🧭',
    tier: 'silver',
    category: 'Exploração',
  },
  {
    id: 'badge_600',
    title: 'Acadêmico Dedicado',
    description: 'Conquistou 600 pontos com dedicação diária.',
    pointsRequired: 600,
    icon: '🎓',
    tier: 'silver',
    category: 'Constância',
  },
  {
    id: 'badge_1000',
    title: 'Mestre da Lógica',
    description: 'Alcançou o primeiro milhar (1.000 pontos) de estudos.',
    pointsRequired: 1000,
    icon: '🌟',
    tier: 'gold',
    category: 'Alta Performance',
  },
  {
    id: 'badge_2000',
    title: 'Sábio do Saber',
    description: 'Acumulou 2.000 pontos com alto índice de acertos.',
    pointsRequired: 2000,
    icon: '💎',
    tier: 'diamond',
    category: 'Sabedoria',
  },
  {
    id: 'badge_5000',
    title: 'Grão-Mestre Notável',
    description: 'Alcançou 5.000 pontos com domínio curricular.',
    pointsRequired: 5000,
    icon: '👑',
    tier: 'master',
    category: 'Prestígio',
  },
  {
    id: 'badge_10000',
    title: 'Lenda do Conhecimento',
    description: 'O patamar lendário de 10.000 pontos acumulados.',
    pointsRequired: 10000,
    icon: '🪐',
    tier: 'master',
    category: 'Lenda Acadêmica',
  },
];

export const ALL_TROPHIES: TrophyItem[] = [
  {
    id: 'trophy_bronze_25',
    title: 'Troféu de Bronze',
    description: 'Acertou 25 perguntas curriculares com sucesso.',
    correctAnswersRequired: 25,
    icon: '🥉',
    metal: 'bronze',
    rarityLabel: '25 Acertos',
  },
  {
    id: 'trophy_silver_50',
    title: 'Troféu de Prata',
    description: 'Acertou 50 perguntas curriculares com sucesso.',
    correctAnswersRequired: 50,
    icon: '🥈',
    metal: 'silver',
    rarityLabel: '50 Acertos',
  },
  {
    id: 'trophy_gold_150',
    title: 'Troféu de Ouro',
    description: 'Acertou 150 perguntas curriculares com maestria.',
    correctAnswersRequired: 150,
    icon: '🥇',
    metal: 'gold',
    rarityLabel: '150 Acertos',
  },
  {
    id: 'trophy_diamond_300',
    title: 'Troféu de Diamante',
    description: 'Acertou 300 perguntas curriculares com precisão máxima.',
    correctAnswersRequired: 300,
    icon: '💎',
    metal: 'diamond',
    rarityLabel: '300 Acertos',
  },
  {
    id: 'trophy_legendary_500',
    title: 'Troféu Lendário',
    description: 'Acertou 500 perguntas na plataforma. Conhecimento supremo!',
    correctAnswersRequired: 500,
    icon: '👑',
    metal: 'legendary',
    rarityLabel: '500 Acertos',
  },
];

/**
 * Returns all earned badges based on total points
 */
export function getEarnedBadges(totalPoints: number): BadgeItem[] {
  return ALL_BADGES.filter((b) => totalPoints >= b.pointsRequired);
}

/**
 * Returns the highest unlocked badge, or null if none
 */
export function getHighestBadge(totalPoints: number): BadgeItem | null {
  const earned = getEarnedBadges(totalPoints);
  if (earned.length === 0) return null;
  return earned[earned.length - 1];
}

/**
 * Returns the next badge to be unlocked
 */
export function getNextBadge(totalPoints: number): BadgeItem | null {
  return ALL_BADGES.find((b) => totalPoints < b.pointsRequired) || null;
}

/**
 * Returns all earned trophies based on correct answers
 */
export function getEarnedTrophies(totalCorrect: number): TrophyItem[] {
  return ALL_TROPHIES.filter((t) => totalCorrect >= t.correctAnswersRequired);
}

/**
 * Returns the highest unlocked trophy, or null if none
 */
export function getHighestTrophy(totalCorrect: number): TrophyItem | null {
  const earned = getEarnedTrophies(totalCorrect);
  if (earned.length === 0) return null;
  return earned[earned.length - 1];
}

/**
 * Returns the next trophy to be unlocked
 */
export function getNextTrophy(totalCorrect: number): TrophyItem | null {
  return ALL_TROPHIES.find((t) => totalCorrect < t.correctAnswersRequired) || null;
}
