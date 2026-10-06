export interface PermissionsStatus {
  micGranted: boolean;
  notifGranted: boolean;
  allGranted: boolean;
  needsMic: boolean;
  needsNotif: boolean;
}

export class PermissionService {
  private static MIC_STORAGE_KEY = 'estudahud_mic_granted';
  private static ALL_ACCEPTED_KEY = 'estudahud_permissions_accepted';

  /**
   * Verifica o estado em tempo real das permissões de microfone e notificações
   */
  static async checkStatus(): Promise<PermissionsStatus> {
    // 1. Notificações
    let notifGranted = false;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      notifGranted = Notification.permission === 'granted';
    }

    // 2. Microfone
    let micGranted = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        // @ts-ignore - query name 'microphone'
        const status = await navigator.permissions.query({ name: 'microphone' });
        micGranted = status.state === 'granted';
      }
    } catch {
      // Fallback
    }

    if (!micGranted && typeof localStorage !== 'undefined') {
      micGranted = localStorage.getItem(this.MIC_STORAGE_KEY) === 'true';
    }

    const allGranted = micGranted && notifGranted;
    if (allGranted && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.ALL_ACCEPTED_KEY, 'true');
    }

    return {
      micGranted,
      notifGranted,
      allGranted,
      needsMic: !micGranted,
      needsNotif: !notifGranted,
    };
  }

  /**
   * Solicita acesso ao microfone (para respostas por voz em testes/quizzes)
   */
  static async requestMicrophone(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.MIC_STORAGE_KEY, 'true');
        }
        return true;
      }
    } catch (e) {
      console.warn('Permissão de microfone não concedida ou indisponível:', e);
    }
    return false;
  }

  /**
   * Solicita acesso a notificações (Desativado)
   */
  static async requestNotification(): Promise<boolean> {
    return false;
  }

  static markAllAccepted(): void {
    try {
      localStorage.setItem(this.ALL_ACCEPTED_KEY, 'true');
      localStorage.setItem(this.MIC_STORAGE_KEY, 'true');
    } catch {}
  }

  static isAlreadyFullyAccepted(): boolean {
    return true;
  }
}
