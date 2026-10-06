// Advanced IndexedDB Service for Trilha do Saber (Offline Persistence & Caching)
import { UserProfile, GradeLevel, TopicLesson, Question, ExamEntry } from '../types';

const DB_NAME = 'LetsStudyOfflineDB';
const DB_VERSION = 2;

export interface OfflineStoredTip {
  id: string;
  tip: string;
  category: string;
  topic: string;
  icon?: string;
  actionableStep?: string;
  targetSubject?: string;
  timestamp: number;
  read?: boolean;
}

export interface OfflineStorageStats {
  lessonsCount: number;
  questionsCount: number;
  tipsCount: number;
  examsCount: number;
  researchCount: number;
  isSupported: boolean;
  lastSyncedAt: number;
}

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isAvailable: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.isAvailable = true;
      this.initDB();
    }
  }

  private async initDB(): Promise<IDBDatabase | null> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // 1. User profile and progress
            if (!db.objectStoreNames.contains('userProfile')) {
              db.createObjectStore('userProfile', { keyPath: 'key' });
            }

            // 2. Study Tips
            if (!db.objectStoreNames.contains('studyTips')) {
              const tipStore = db.createObjectStore('studyTips', { keyPath: 'id' });
              tipStore.createIndex('timestamp', 'timestamp', { unique: false });
              tipStore.createIndex('targetSubject', 'targetSubject', { unique: false });
            }

            // 3. Offline Curricular Lessons
            if (!db.objectStoreNames.contains('lessons')) {
              const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
              lessonStore.createIndex('grade_subject', ['grade', 'subject'], { unique: false });
            }

            // 4. Offline Question Bank
            if (!db.objectStoreNames.contains('questions')) {
              const qStore = db.createObjectStore('questions', { keyPath: 'id' });
              qStore.createIndex('subject_grade', ['subject', 'grade'], { unique: false });
            }

            // 5. Offline Exams and Simulado Tests
            if (!db.objectStoreNames.contains('exams')) {
              const examStore = db.createObjectStore('exams', { keyPath: 'id' });
              examStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // 6. Research and Projects History
            if (!db.objectStoreNames.contains('research')) {
              const resStore = db.createObjectStore('research', { keyPath: 'id' });
              resStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // 7. Notification and Push Schedules
            if (!db.objectStoreNames.contains('schedules')) {
              db.createObjectStore('schedules', { keyPath: 'id' });
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            console.warn('[IndexedDB] Erro ao abrir banco de dados local. Usando fallback localStorage.');
            resolve(null);
          };
        } catch (e) {
          console.warn('[IndexedDB] Exception ao inicializar:', e);
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  private async getDB(): Promise<IDBDatabase | null> {
    return this.initDB();
  }

  // ===== USER PROFILE & PROGRESS =====
  public async saveUserProfile(user: UserProfile): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        localStorage.setItem('estudahud_user_profile', JSON.stringify(user));
        return;
      }

      const tx = db.transaction('userProfile', 'readwrite');
      const store = tx.objectStore('userProfile');
      store.put({ key: 'currentUser', data: user, updatedAt: Date.now() });

      // Keep localStorage synchronized as well
      localStorage.setItem('estudahud_user_profile', JSON.stringify(user));
    } catch (err) {
      console.warn('[IndexedDB] Erro ao salvar perfil:', err);
    }
  }

  public async getUserProfile(): Promise<UserProfile | null> {
    try {
      const db = await this.getDB();
      if (!db) {
        const saved = localStorage.getItem('estudahud_user_profile');
        return saved ? JSON.parse(saved) : null;
      }

      return new Promise((resolve) => {
        const tx = db.transaction('userProfile', 'readonly');
        const store = tx.objectStore('userProfile');
        const req = store.get('currentUser');

        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            const saved = localStorage.getItem('estudahud_user_profile');
            resolve(saved ? JSON.parse(saved) : null);
          }
        };

        req.onerror = () => {
          const saved = localStorage.getItem('estudahud_user_profile');
          resolve(saved ? JSON.parse(saved) : null);
        };
      });
    } catch {
      return null;
    }
  }

  // ===== STUDY TIPS PERSISTENCE =====
  public async saveStudyTip(tip: Partial<OfflineStoredTip>): Promise<void> {
    try {
      const entry: OfflineStoredTip = {
        id: tip.id || `tip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tip: tip.tip || '',
        category: tip.category || 'dica_estudo',
        topic: tip.topic || 'Geral',
        icon: tip.icon || '💡',
        actionableStep: tip.actionableStep || '',
        targetSubject: tip.targetSubject || 'Geral',
        timestamp: tip.timestamp || Date.now(),
        read: tip.read || false,
      };

      const db = await this.getDB();
      if (!db) {
        const list = this.getFallbackTips();
        list.unshift(entry);
        localStorage.setItem('estudahud_cached_tips_v2', JSON.stringify(list.slice(0, 30)));
        return;
      }

      const tx = db.transaction('studyTips', 'readwrite');
      tx.objectStore('studyTips').put(entry);

      // Save fallback in localStorage too
      const list = this.getFallbackTips();
      list.unshift(entry);
      localStorage.setItem('estudahud_cached_tips_v2', JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar dica de estudo:', e);
    }
  }

  public async getStoredStudyTips(limit = 20): Promise<OfflineStoredTip[]> {
    try {
      const db = await this.getDB();
      if (!db) return this.getFallbackTips().slice(0, limit);

      return new Promise((resolve) => {
        const tx = db.transaction('studyTips', 'readonly');
        const store = tx.objectStore('studyTips');
        const req = store.getAll();

        req.onsuccess = () => {
          const results: OfflineStoredTip[] = req.result || [];
          results.sort((a, b) => b.timestamp - a.timestamp);
          if (results.length === 0) {
            resolve(this.getFallbackTips().slice(0, limit));
          } else {
            resolve(results.slice(0, limit));
          }
        };

        req.onerror = () => {
          resolve(this.getFallbackTips().slice(0, limit));
        };
      });
    } catch {
      return this.getFallbackTips().slice(0, limit);
    }
  }

  public async getLatestStudyTips(limit = 10): Promise<OfflineStoredTip[]> {
    return this.getStoredStudyTips(limit);
  }

  private getFallbackTips(): OfflineStoredTip[] {
    try {
      const saved = localStorage.getItem('estudahud_cached_tips_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: 'tip_default_1',
        tip: 'Ao resolver problemas de matemática, separe os dados do enunciado em "O que eu sei" e "O que o problema pede". Isso reduz erros de interpretação em 70%!',
        category: 'dica_estudo',
        topic: 'Estratégia de Resolução',
        icon: '📐',
        actionableStep: 'Sublinhe com cores diferentes os números e a pergunta final do exercício de hoje.',
        targetSubject: 'Matemática',
        timestamp: Date.now() - 3600000,
        read: true,
      },
      {
        id: 'tip_default_2',
        tip: 'A técnica de repetição espaçada funciona melhor quando você revisa o conteúdo 24 horas após a primeira aula e novamente após 7 dias.',
        category: 'tecnica_memorizacao',
        topic: 'Curva do Esquecimento',
        icon: '🧠',
        actionableStep: 'Dedique 5 minutos para revisar os Flashcards das matérias estudadas ontem.',
        targetSubject: 'Geral',
        timestamp: Date.now() - 86400000,
        read: false,
      },
    ];
  }

  // ===== OFFLINE LESSONS PERSISTENCE =====
  public async saveLesson(lesson: TopicLesson): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        localStorage.setItem(`estudahud_lesson_${lesson.grade}_${lesson.subject}`, JSON.stringify(lesson));
        return;
      }

      const tx = db.transaction('lessons', 'readwrite');
      tx.objectStore('lessons').put(lesson);
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar lição offline:', e);
    }
  }

  public async getLesson(grade: GradeLevel, subject: string): Promise<TopicLesson | null> {
    try {
      const db = await this.getDB();
      if (!db) {
        const saved = localStorage.getItem(`estudahud_lesson_${grade}_${subject}`);
        return saved ? JSON.parse(saved) : null;
      }

      return new Promise((resolve) => {
        const tx = db.transaction('lessons', 'readonly');
        const store = tx.objectStore('lessons');
        const req = store.getAll();

        req.onsuccess = () => {
          const allLessons: TopicLesson[] = req.result || [];
          const found = allLessons.find(
            (l) => l.grade === grade && l.subject.toLowerCase() === subject.toLowerCase()
          );
          resolve(found || null);
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // ===== OFFLINE EXAMS & SIMULADOS PERSISTENCE =====
  public async saveOfflineExam(exam: ExamEntry | any): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        const saved = localStorage.getItem('estudahud_offline_exams_v2');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(exam);
        localStorage.setItem('estudahud_offline_exams_v2', JSON.stringify(list.slice(0, 20)));
        return;
      }

      const tx = db.transaction('exams', 'readwrite');
      tx.objectStore('exams').put(exam);
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar exame offline:', e);
    }
  }

  public async getAllOfflineExams(): Promise<any[]> {
    try {
      const db = await this.getDB();
      if (!db) {
        const saved = localStorage.getItem('estudahud_offline_exams_v2');
        return saved ? JSON.parse(saved) : [];
      }

      return new Promise((resolve) => {
        const tx = db.transaction('exams', 'readonly');
        const store = tx.objectStore('exams');
        const req = store.getAll();

        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
          resolve(list);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ===== OFFLINE QUESTIONS PERSISTENCE =====
  public async saveOfflineQuestions(questions: Question[]): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) return;

      const tx = db.transaction('questions', 'readwrite');
      const store = tx.objectStore('questions');
      for (const q of questions) {
        store.put(q);
      }
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar banco de questões:', e);
    }
  }

  public async getOfflineQuestions(subject?: string, grade?: string, limit = 10): Promise<Question[]> {
    try {
      const db = await this.getDB();
      if (!db) return [];

      return new Promise((resolve) => {
        const tx = db.transaction('questions', 'readonly');
        const store = tx.objectStore('questions');
        const req = store.getAll();

        req.onsuccess = () => {
          let list: Question[] = req.result || [];
          if (subject) {
            list = list.filter((q) => q.subject === subject);
          }
          if (grade) {
            list = list.filter((q) => !q.grade || q.grade === grade);
          }
          const shuffled = [...list].sort(() => Math.random() - 0.5);
          resolve(shuffled.slice(0, limit));
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ===== SCHEDULED NOTIFICATIONS / STUDY TIPS PUSH =====
  public async savePushSchedule(schedule: { id: string; type: string; time: string; days: number[]; enabled: boolean; payload?: any }): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db) {
        localStorage.setItem(`estudahud_schedule_${schedule.id}`, JSON.stringify(schedule));
        return;
      }

      const tx = db.transaction('schedules', 'readwrite');
      tx.objectStore('schedules').put(schedule);
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar agendamento push:', e);
    }
  }

  public async getPushSchedules(): Promise<any[]> {
    try {
      const db = await this.getDB();
      if (!db) return [];

      return new Promise((resolve) => {
        const tx = db.transaction('schedules', 'readonly');
        const store = tx.objectStore('schedules');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ===== STORAGE STATS =====
  public async getStats(): Promise<OfflineStorageStats> {
    const stats: OfflineStorageStats = {
      lessonsCount: 0,
      questionsCount: 0,
      tipsCount: 0,
      examsCount: 0,
      researchCount: 0,
      isSupported: this.isAvailable,
      lastSyncedAt: Date.now(),
    };

    try {
      const db = await this.getDB();
      if (!db) return stats;

      const stores = ['lessons', 'questions', 'studyTips', 'exams', 'research'];
      for (const s of stores) {
        try {
          const tx = db.transaction(s, 'readonly');
          const countReq = tx.objectStore(s).count();
          await new Promise<void>((resolve) => {
            countReq.onsuccess = () => {
              if (s === 'lessons') stats.lessonsCount = countReq.result;
              if (s === 'questions') stats.questionsCount = countReq.result;
              if (s === 'studyTips') stats.tipsCount = countReq.result;
              if (s === 'exams') stats.examsCount = countReq.result;
              if (s === 'research') stats.researchCount = countReq.result;
              resolve();
            };
            countReq.onerror = () => resolve();
          });
        } catch {}
      }
    } catch {}

    return stats;
  }
}

export const indexedDbService = new IndexedDbService();
