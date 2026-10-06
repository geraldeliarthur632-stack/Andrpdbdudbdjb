/**
 * Camada unificada de persistência local para a Trilha do Saber
 * Gerencia o salvamento seguro e reativo de configurações, XP, sequência e progresso
 */

export interface AppStorageKeys {
  USER_NAME: string;
  USER_AVATAR: string;
  STUDENT_GRADE: string;
  TOTAL_XP: string;
  CURRENT_STREAK: string;
  MAX_STREAK: string;
  LAST_STUDY_DATE: string;
  DAILY_GOAL_MINUTES: string;
  TODAY_STUDY_MINUTES: string;
  THEME_PREFERENCE: string;
  SOUND_ENABLED: string;
  NOTIFICATIONS_ENABLED: string;
  COMPLETED_LESSONS: string;
  COMPLETED_EXERCISES: string;
  UNLOCKED_ACHIEVEMENTS: string;
  FAVORITES_LIST: string;
}

const STORAGE_KEYS: AppStorageKeys = {
  USER_NAME: 'trilha_user_name',
  USER_AVATAR: 'trilha_user_avatar',
  STUDENT_GRADE: 'trilha_student_grade',
  TOTAL_XP: 'trilha_total_xp',
  CURRENT_STREAK: 'trilha_current_streak',
  MAX_STREAK: 'trilha_max_streak',
  LAST_STUDY_DATE: 'trilha_last_study_date',
  DAILY_GOAL_MINUTES: 'trilha_daily_goal_minutes',
  TODAY_STUDY_MINUTES: 'trilha_today_study_minutes',
  THEME_PREFERENCE: 'trilha_theme_mode',
  SOUND_ENABLED: 'trilha_sound_enabled',
  NOTIFICATIONS_ENABLED: 'trilha_notifications_enabled',
  COMPLETED_LESSONS: 'trilha_completed_lessons',
  COMPLETED_EXERCISES: 'trilha_completed_exercises',
  UNLOCKED_ACHIEVEMENTS: 'trilha_unlocked_achievements',
  FAVORITES_LIST: 'trilha_favorites_list',
};

export class StorageService {
  static getItem<T>(key: keyof AppStorageKeys, defaultValue: T): T {
    try {
      const storageKey = STORAGE_KEYS[key];
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  static setItem<T>(key: keyof AppStorageKeys, value: T): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (err) {
      console.warn('Erro ao salvar no StorageService:', err);
    }
  }

  static getString(key: keyof AppStorageKeys, defaultValue = ''): string {
    try {
      const storageKey = STORAGE_KEYS[key];
      const val = localStorage.getItem(storageKey);
      return val !== null ? val : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static setString(key: keyof AppStorageKeys, value: string): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.setItem(storageKey, value);
    } catch (err) {
      console.warn('Erro ao salvar string:', err);
    }
  }

  static remove(key: keyof AppStorageKeys): void {
    try {
      const storageKey = STORAGE_KEYS[key];
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Erro ao remover do storage:', err);
    }
  }

  /**
   * Reseta dados com confirmação prévia para a tela de configurações
   */
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn('Erro ao resetar storage:', err);
    }
  }
}
