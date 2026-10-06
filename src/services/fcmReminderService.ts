import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { getFirebaseApp, getDb, FirebaseService } from './database/firebaseService';
import { doc, setDoc } from 'firebase/firestore';
import { StudyReminder, DayOfWeek } from '../types';

export interface FCMReminderSettings {
  enabled: boolean;
  token: string | null;
  advanceNoticeMinutes: number; // e.g. 10 minutes before
  studentName: string;
  lastUpdated: string | null;
}

export interface ForegroundFCMMessagePayload {
  title: string;
  body: string;
  subjectId?: string;
  subjectName?: string;
  minutesLeft?: number;
  time?: string;
}

const FCM_STORAGE_TOKEN_KEY = 'estudahud_fcm_device_token';
const FCM_STORAGE_ENABLED_KEY = 'estudahud_fcm_reminders_enabled';
const FCM_STORAGE_ADVANCE_MINUTES_KEY = 'estudahud_fcm_advance_minutes';

class FCMReminderService {
  private messaging: Messaging | null = null;
  private isInitAttempted = false;
  private supported = false;
  private cachedToken: string | null = null;
  private foregroundListeners: Array<(payload: ForegroundFCMMessagePayload) => void> = [];

  constructor() {
    this.cachedToken = typeof window !== 'undefined' ? localStorage.getItem(FCM_STORAGE_TOKEN_KEY) : null;
    this.initIfSupported();
  }

  // Check if browser/device supports Web Push and FCM
  public async isFCMSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
    try {
      const supported = await isSupported();
      this.supported = supported;
      return supported;
    } catch {
      return false;
    }
  }

  // Initialize Firebase Messaging safely
  private async initIfSupported(): Promise<Messaging | null> {
    if (this.messaging) return this.messaging;
    if (this.isInitAttempted) return this.messaging;
    this.isInitAttempted = true;

    try {
      const isSupp = await this.isFCMSupported();
      if (!isSupp) return null;

      const app = getFirebaseApp();
      if (!app) return null;

      this.messaging = getMessaging(app);

      // Listen for foreground push messages when app is active
      onMessage(this.messaging, (payload) => {
        console.log('[FCM] Mensagem recebida em primeiro plano:', payload);
        const notificationPayload: ForegroundFCMMessagePayload = {
          title: payload.notification?.title || payload.data?.title || '🎒 Trilha do Saber: Lembrete de Estudo',
          body: payload.notification?.body || payload.data?.body || 'Seu horário de estudos está próximo!',
          subjectId: payload.data?.subjectId,
          subjectName: payload.data?.subjectName,
          minutesLeft: payload.data?.minutesLeft ? Number(payload.data.minutesLeft) : undefined,
          time: payload.data?.time,
        };

        this.notifyForegroundListeners(notificationPayload);

        // Dispatch window event for UI banners or modals
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('estudahud_fcm_foreground_alert', {
              detail: notificationPayload,
            })
          );
        }
      });

      return this.messaging;
    } catch (err) {
      console.warn('[FCM] Falha ao inicializar Firebase Messaging:', err);
      return null;
    }
  }

  // Register device for FCM notifications (Disabled)
  public async requestFCMRegistration(_studentName: string = 'Estudante'): Promise<{ success: boolean; token: string | null; error?: string }> {
    return { success: false, token: null, error: 'Notificações desativadas' };
  }

  // Save token locally
  private saveTokenLocally(token: string) {
    this.cachedToken = token;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(FCM_STORAGE_TOKEN_KEY, token);
        localStorage.setItem(FCM_STORAGE_ENABLED_KEY, 'true');
      }
    } catch {}
  }

  // Synchronize FCM Token and Preferences to Firestore
  public async syncTokenToFirestore(token: string, studentName: string): Promise<boolean> {
    try {
      const db = getDb();
      const currentUser = FirebaseService.getCurrentUser();
      if (!currentUser || !currentUser.uid || currentUser.uid.startsWith('guest_')) {
        return false;
      }
      const userId = currentUser.uid;

      if (!db) return false;

      const advanceMinutes = this.getAdvanceNoticeMinutes();
      const tokenRef = doc(db, 'users', userId, 'fcmTokens', token.substring(0, 32));

      await setDoc(
        tokenRef,
        {
          token,
          userId,
          studentName,
          advanceNoticeMinutes: advanceMinutes,
          devicePlatform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'web_pwa',
          enabled: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return true;
    } catch (err) {
      console.warn('[FCM] Aviso ao sincronizar token no Firestore (ignorado se offline):', err);
      return false;
    }
  }

  // Get current device token
  public getStoredToken(): string | null {
    if (this.cachedToken) return this.cachedToken;
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(FCM_STORAGE_TOKEN_KEY);
      }
    } catch {}
    return null;
  }

  // Check if FCM reminders are enabled
  public isFCMEnabled(): boolean {
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem(FCM_STORAGE_ENABLED_KEY);
        return val === 'true';
      }
    } catch {}
    return true;
  }

  // Enable or disable FCM reminders
  public setFCMEnabled(enabled: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(FCM_STORAGE_ENABLED_KEY, enabled ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('estudahud_fcm_settings_changed'));
      }
    } catch {}
  }

  // Get configured advance notice minutes (e.g. 10 minutes before subject begins)
  public getAdvanceNoticeMinutes(): number {
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem(FCM_STORAGE_ADVANCE_MINUTES_KEY);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num)) return num;
        }
      }
    } catch {}
    return 10; // Default: 10 minutes advance warning
  }

  // Set advance notice minutes
  public setAdvanceNoticeMinutes(minutes: number): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(FCM_STORAGE_ADVANCE_MINUTES_KEY, String(minutes));
        window.dispatchEvent(new CustomEvent('estudahud_fcm_settings_changed'));
      }
    } catch {}
  }

  // Register listener for in-app foreground FCM push
  public onForegroundAlert(callback: (payload: ForegroundFCMMessagePayload) => void): () => void {
    this.foregroundListeners.push(callback);
    return () => {
      this.foregroundListeners = this.foregroundListeners.filter((l) => l !== callback);
    };
  }

  private notifyForegroundListeners(payload: ForegroundFCMMessagePayload) {
    for (const listener of this.foregroundListeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('[FCM] Erro no listener em primeiro plano:', err);
      }
    }
  }

  /**
   * Generates tailored, personalized study notification text
   */
  public generatePersonalizedReminder(params: {
    studentName: string;
    subjectName: string;
    subjectId?: string;
    scheduledTime: string;
    advanceMinutes: number;
    notes?: string;
  }): { title: string; body: string } {
    const { studentName, subjectName, scheduledTime, advanceMinutes, notes } = params;
    const cleanName = studentName && studentName.trim() ? studentName.trim() : 'Estudante';

    if (advanceMinutes > 0) {
      const title = `🎒 Trilha do Saber • ${subjectName} em ${advanceMinutes} min!`;
      const noteClause = notes && notes.trim() ? ` 🎯 Foco: ${notes.trim()}` : '';
      const body = `Olá, ${cleanName}! Sua sessão no cronograma começa às ${scheduledTime} (em ${advanceMinutes} min).${noteClause} Prepare seu material para garantir seu XP!`;
      return { title, body };
    } else {
      const title = `🔔 Hora do Estudo: ${subjectName}!`;
      const noteClause = notes && notes.trim() ? ` (${notes.trim()})` : '';
      const body = `Olá, ${cleanName}! Sua sessão de ${subjectName} começou agora no seu cronograma.${noteClause} Toque para iniciar os exercícios e desafios!`;
      return { title, body };
    }
  }

  /**
   * Dispatches background FCM study reminder test (triggers in 5s)
   * This allows the student to test background delivery by minimizing the app or locking the phone.
   */
  public testBackgroundFCMReminder(params: {
    studentName?: string;
    subjectName?: string;
    subjectId?: string;
    delaySeconds?: number;
  }): void {
    if (typeof window === 'undefined') return;

    const delayMs = (params.delaySeconds || 5) * 1000;
    const studentName = params.studentName || 'Estudante';
    const subjectName = params.subjectName || 'Matemática';
    const subjectId = params.subjectId || 'matematica';

    const personalized = this.generatePersonalizedReminder({
      studentName,
      subjectName,
      subjectId,
      scheduledTime: '14:00',
      advanceMinutes: 10,
      notes: 'Resolver 10 exercícios de cálculo mental e subir no ranking',
    });

    const payload = {
      type: 'TRIGGER_TEST_FCM_REMINDER',
      payload: {
        delayMs,
        title: personalized.title,
        body: personalized.body,
        subjectId,
      },
    };

    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(payload);
      } else {
        navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage(payload));
      }
    }

    // Also call backend endpoint to log / dispatch push
    this.sendReminderThroughBackend({
      token: this.getStoredToken() || 'test_token',
      title: personalized.title,
      body: personalized.body,
      subjectId,
      subjectName,
      minutesLeft: 10,
      studentName,
    });
  }

  /**
   * Synchronize upcoming schedule reminders with Service Worker taking advance minutes into account
   */
  public syncRemindersToServiceWorker(
    reminders: StudyReminder[],
    studentName: string = 'Estudante'
  ): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (!this.isFCMEnabled()) return;

    try {
      const now = new Date();
      const advanceMinutes = this.getAdvanceNoticeMinutes();
      const advanceRemindersList: Array<{
        title: string;
        body: string;
        delayMs: number;
        tag: string;
        subjectId: string;
        url: string;
      }> = [];

      for (const rem of reminders) {
        if (!rem.enabled) continue;
        const [rh, rm] = (rem.time || '14:00').split(':').map(Number);
        if (isNaN(rh) || isNaN(rm)) continue;

        for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
          const targetStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + dayOffset,
            rh,
            rm,
            0
          );
          const targetDayOfWeek = targetStartDate.getDay() as DayOfWeek;

          if (rem.daysOfWeek.includes(targetDayOfWeek)) {
            // 1. Advance Alert (e.g. 10 minutes before)
            if (advanceMinutes > 0) {
              const advanceTriggerDate = new Date(targetStartDate.getTime() - advanceMinutes * 60 * 1000);
              const delayAdvanceMs = advanceTriggerDate.getTime() - now.getTime();

              if (delayAdvanceMs > 0 && delayAdvanceMs < 7 * 24 * 3600 * 1000) {
                const copy = this.generatePersonalizedReminder({
                  studentName,
                  subjectName: rem.subjectName,
                  subjectId: rem.subjectId,
                  scheduledTime: rem.time,
                  advanceMinutes,
                  notes: rem.notes,
                });

                advanceRemindersList.push({
                  title: copy.title,
                  body: copy.body,
                  delayMs: delayAdvanceMs,
                  tag: `fcm_advance_${rem.id}_${targetStartDate.getTime()}`,
                  subjectId: rem.subjectId,
                  url: `/?mode=journey&subject=${rem.subjectId}`,
                });
              }
            }

            // 2. Exact Start Time Alert
            const delayStartMs = targetStartDate.getTime() - now.getTime();
            if (delayStartMs > 0 && delayStartMs < 7 * 24 * 3600 * 1000) {
              const startCopy = this.generatePersonalizedReminder({
                studentName,
                subjectName: rem.subjectName,
                subjectId: rem.subjectId,
                scheduledTime: rem.time,
                advanceMinutes: 0,
                notes: rem.notes,
              });

              advanceRemindersList.push({
                title: startCopy.title,
                body: startCopy.body,
                delayMs: delayStartMs,
                tag: `fcm_start_${rem.id}_${targetStartDate.getTime()}`,
                subjectId: rem.subjectId,
                url: `/?mode=journey&subject=${rem.subjectId}`,
              });
            }
          }
        }
      }

      if (advanceRemindersList.length > 0) {
        const sendMsg = (swTarget: ServiceWorker | null | undefined) => {
          if (!swTarget) return;
          swTarget.postMessage({
            type: 'SCHEDULE_FCM_ADVANCE_REMINDERS',
            payload: { reminders: advanceRemindersList },
          });
        };

        if (navigator.serviceWorker.controller) {
          sendMsg(navigator.serviceWorker.controller);
        } else {
          navigator.serviceWorker.ready.then((reg) => sendMsg(reg.active));
        }
      }
    } catch (err) {
      console.warn('[FCM] Falha ao sincronizar lembretes no Service Worker:', err);
    }
  }

  // Call backend to trigger push notification
  public async sendReminderThroughBackend(payload: {
    token: string;
    title: string;
    body: string;
    subjectId: string;
    subjectName: string;
    minutesLeft: number;
    studentName: string;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/fcm/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const fcmReminderService = new FCMReminderService();
