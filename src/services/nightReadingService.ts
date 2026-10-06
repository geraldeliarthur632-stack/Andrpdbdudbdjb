// Night Reading / Leitura Noturna Service (Reduces blue light & visual fatigue automatically at night)

export type NightReadingMode = 'auto' | 'always_on' | 'off';

export interface NightReadingSettings {
  mode: NightReadingMode;
  warmth: number; // 15 to 50 percent
  startHour: number; // default 18 (18:00)
  endHour: number; // default 6 (06:00)
}

const STORAGE_KEY = 'estudahud_night_reading_settings_v1';
const ELEMENT_ID = 'night-reading-screen-filter';

class NightReadingService {
  private settings: NightReadingSettings;
  private intervalId: any = null;

  constructor() {
    this.settings = this.loadSettings();
    if (typeof window !== 'undefined') {
      this.applyFilter();
      this.startTimer();
    }
  }

  private loadSettings(): NightReadingSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return {
      mode: 'auto',
      warmth: 28,
      startHour: 18,
      endHour: 6,
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      window.dispatchEvent(new CustomEvent('estudahud_night_reading_changed', { detail: this.getStatus() }));
    } catch {}
  }

  public getSettings(): NightReadingSettings {
    return { ...this.settings };
  }

  public isCurrentlyActive(): boolean {
    if (this.settings.mode === 'off') return false;
    if (this.settings.mode === 'always_on') return true;

    // 'auto': check system time
    const hour = new Date().getHours();
    if (this.settings.startHour > this.settings.endHour) {
      // Overnight (e.g. 18:00 to 06:00)
      return hour >= this.settings.startHour || hour < this.settings.endHour;
    } else {
      return hour >= this.settings.startHour && hour < this.settings.endHour;
    }
  }

  public getStatus() {
    return {
      isActive: this.isCurrentlyActive(),
      mode: this.settings.mode,
      warmth: this.settings.warmth,
      startHour: this.settings.startHour,
      endHour: this.settings.endHour,
      currentHour: new Date().getHours(),
    };
  }

  public setMode(mode: NightReadingMode): void {
    this.settings.mode = mode;
    this.saveSettings();
    this.applyFilter();
  }

  public setWarmth(warmth: number): void {
    this.settings.warmth = Math.min(50, Math.max(10, warmth));
    this.saveSettings();
    this.applyFilter();
  }

  public setSchedule(startHour: number, endHour: number): void {
    this.settings.startHour = startHour;
    this.settings.endHour = endHour;
    this.saveSettings();
    this.applyFilter();
  }

  public toggle(): void {
    if (this.settings.mode === 'off') {
      this.setMode('auto');
    } else if (this.settings.mode === 'auto') {
      this.setMode('always_on');
    } else {
      this.setMode('off');
    }
  }

  public applyFilter(): void {
    if (typeof document === 'undefined') return;

    let overlay = document.getElementById(ELEMENT_ID);
    const active = this.isCurrentlyActive();

    if (!active) {
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => {
          overlay?.remove();
        }, 300);
      }
      return;
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = ELEMENT_ID;
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '99999';
      overlay.style.transition = 'opacity 0.5s ease-in-out, background-color 0.5s ease';
      document.body.appendChild(overlay);
    }

    const opacity = (this.settings.warmth / 100) * 0.45;
    overlay.style.backgroundColor = `rgba(255, 145, 20, ${opacity.toFixed(3)})`;
    overlay.style.mixBlendMode = 'multiply';
    overlay.style.opacity = '1';
  }

  private startTimer(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.applyFilter();
    }, 30000); // check every 30s
  }
}

export const nightReadingService = new NightReadingService();
