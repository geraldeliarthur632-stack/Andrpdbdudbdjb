/**
 * dailyTimeLimitService.ts
 * Monitora o tempo ativo de estudos na tela por dia com limite saudável recomendado de 2 horas (7200 segundos).
 */

export const DAILY_LIMIT_SECONDS = 2 * 60 * 60; // 7200 segundos (2 horas)

class DailyTimeLimitService {
  private getTodayKey(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `estudahud_time_spent_${year}-${month}-${day}`;
  }

  private getNotifiedKey(): string {
    return `${this.getTodayKey()}_notified`;
  }

  private getSnoozeKey(): string {
    return `${this.getTodayKey()}_snooze_until`;
  }

  public getTodaySeconds(): number {
    try {
      const val = localStorage.getItem(this.getTodayKey());
      const parsed = parseInt(val || '0', 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  public addSeconds(delta: number): number {
    if (delta <= 0) return this.getTodaySeconds();
    try {
      const current = this.getTodaySeconds();
      const next = current + delta;
      localStorage.setItem(this.getTodayKey(), String(next));
      return next;
    } catch {
      return this.getTodaySeconds();
    }
  }

  public isLimitReached(): boolean {
    return this.getTodaySeconds() >= DAILY_LIMIT_SECONDS;
  }

  public hasNotifiedToday(): boolean {
    try {
      return localStorage.getItem(this.getNotifiedKey()) === 'true';
    } catch {
      return false;
    }
  }

  public setNotifiedToday(value: boolean): void {
    try {
      if (value) {
        localStorage.setItem(this.getNotifiedKey(), 'true');
      } else {
        localStorage.removeItem(this.getNotifiedKey());
      }
    } catch {}
  }

  public snoozeNotice(minutes: number = 15): void {
    try {
      const snoozeUntil = Date.now() + minutes * 60 * 1000;
      localStorage.setItem(this.getSnoozeKey(), String(snoozeUntil));
    } catch {}
  }

  public shouldShowNotice(): boolean {
    if (!this.isLimitReached()) return false;

    // Checa se está snoozed
    try {
      const snoozeUntilStr = localStorage.getItem(this.getSnoozeKey());
      if (snoozeUntilStr) {
        const snoozeUntil = parseInt(snoozeUntilStr, 10);
        if (!isNaN(snoozeUntil) && Date.now() < snoozeUntil) {
          return false;
        }
      }
    } catch {}

    return !this.hasNotifiedToday();
  }

  public formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    }
    return `${minutes} min`;
  }

  public getPercentage(): number {
    const current = this.getTodaySeconds();
    return Math.min(100, Math.round((current / DAILY_LIMIT_SECONDS) * 100));
  }

  // Utilitários de testes e reset
  public setSecondsForTesting(seconds: number): void {
    try {
      localStorage.setItem(this.getTodayKey(), String(seconds));
      this.setNotifiedToday(false);
      localStorage.removeItem(this.getSnoozeKey());
    } catch {}
  }

  public resetToday(): void {
    try {
      localStorage.removeItem(this.getTodayKey());
      localStorage.removeItem(this.getNotifiedKey());
      localStorage.removeItem(this.getSnoozeKey());
    } catch {}
  }
}

export const dailyTimeLimitService = new DailyTimeLimitService();
