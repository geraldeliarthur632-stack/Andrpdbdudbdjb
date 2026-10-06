class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private examAlarmInterval: number | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioContextClass =
          typeof window !== 'undefined'
            ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            : null;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play click sound
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio fallback
    }
  }

  // Play error sound
  public playError() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Silent catch
    }
  }

  public playWrong() {
    this.playError();
  }

  public playIncorrect() {
    this.playError();
  }

  // Play correct answer sound with variations
  public playCorrect(variant: 'standard' | 'combo' | 'bonus' | string = 'standard') {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (variant === 'combo') {
        // Energetic 3-note ascending chime
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.26);
        });
      } else if (variant === 'bonus') {
        // Bright sparkle chime
        const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.22, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.29);
        });
      } else {
        // Standard pleasant 2-note chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    } catch {
      // Audio fallback
    }
  }

  public playSuccess() {
    this.playCorrect('bonus');
  }

  // Play a triumphant unique 'Level Up' fanfare sound effect
  public playLevelUp() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Sparkling rapid arpeggio followed by sustained majestic chord
      const arpeggio = [
        { f: 440.0, t: 0.00, d: 0.12 }, // A4
        { f: 554.37, t: 0.08, d: 0.12 }, // C#5
        { f: 659.25, t: 0.16, d: 0.12 }, // E5
        { f: 880.0, t: 0.24, d: 0.18 }, // A5
        { f: 1108.73, t: 0.32, d: 0.25 }, // C#6
      ];

      arpeggio.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + note.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.d + 0.02);
      });

      // Triumphant sustained high chord at the end (A5 + E6 + A6)
      const chord = [880.0, 1318.51, 1760.0];
      const chordStart = now + 0.42;

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordStart);

        gain.gain.setValueAtTime(0.18, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + 0.7);
      });
    } catch {
      // Audio fallback
    }
  }

  // Play celebration / victory fanfare
  public playVictory() {
    this.playLevelUp();
  }

  // Play party game start whistle / horn fanfare
  public playGameStart() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {}
  }

  // Play Stop Buzzer emergency alarm
  public playBuzzerStop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  // Play quick countdown tick
  public playCountdownTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // Play lobby emoji reaction pop
  public playReaction() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Play a gentle notification alarm chime
  public playAlarm() {
    this.playExamAlarm(false);
  }

  // Authentic Digital Exam Alarm (BEEP-BEEP, BEEP-BEEP) for exams
  public playExamAlarm(loop = true) {
    if (this.isMuted) return;
    this.stopExamAlarm();

    const triggerBeepCycle = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Beep 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.13);

        // Beep 2
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(880, now + 0.16);
        gain2.gain.setValueAtTime(0.22, now + 0.16);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.16);
        osc2.stop(now + 0.29);

        // Beep 3 (Higher urgency pulse)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'square';
        osc3.frequency.setValueAtTime(1046.5, now + 0.32);
        gain3.gain.setValueAtTime(0.25, now + 0.32);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.32);
        osc3.stop(now + 0.45);
      } catch {}
    };

    triggerBeepCycle();
    if (loop && typeof window !== 'undefined') {
      this.examAlarmInterval = window.setInterval(triggerBeepCycle, 900);
    }
  }

  public stopExamAlarm() {
    if (this.examAlarmInterval) {
      clearInterval(this.examAlarmInterval);
      this.examAlarmInterval = null;
    }
  }

  public isExamAlarmActive(): boolean {
    return this.examAlarmInterval !== null;
  }

  // Distinct Lightning Challenge hit sound with electric spark and streak modulation
  public playLightningCorrect(streak: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Base frequency scales upward with combo streak for rewarding arcade feel
      const baseFreq = Math.min(520 + streak * 45, 960);

      // Primary tone: bright crystal attack
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
      gain1.gain.setValueAtTime(0.24, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.19);

      // Electric spark sparkle overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.07);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.16);

      // Extra bonus sparkle note on combos
      if (streak >= 3) {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        const chordFreq = baseFreq * 1.5; // Perfect 5th harmonic
        osc3.frequency.setValueAtTime(chordFreq, now + 0.05);
        gain3.gain.setValueAtTime(0.18, now + 0.05);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.05);
        osc3.stop(now + 0.23);
      }
    } catch {}
  }

  // Distinct Lightning Challenge error sound (immediate, snappy, dry electronic thud)
  public playLightningIncorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Double low click/buzz with zero latency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // Distinct tense sound for the last 5 seconds of the lightning challenge
  public playLightningLast5Seconds(secondsLeft: number) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Frequency rises urgently: 5s -> 4s -> 3s -> 2s -> 1s
      const freqTable: Record<number, number> = {
        5: 640,
        4: 740,
        3: 860,
        2: 1000,
        1: 1200,
      };
      const freq = freqTable[secondsLeft] || 700;

      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      gain1.gain.setValueAtTime(0.26, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Quick double echo pulse for urgency
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.15, now + 0.09);
      gain2.gain.setValueAtTime(0.2, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.17);
    } catch {}
  }

  // Chess sounds
  public playChessMove() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  public playChessCapture() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  public playChessCheck() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 660];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.06;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch {}
  }

  // Play celebration fanfare for victory
  public playVictoryFanfare(_danceId?: string) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 523.25, d: 0.12, t: 0.14 },
        { f: 523.25, d: 0.12, t: 0.28 },
        { f: 659.25, d: 0.35, t: 0.42 },
        { f: 587.33, d: 0.15, t: 0.8 },
        { f: 659.25, d: 0.15, t: 0.98 },
        { f: 783.99, d: 0.5, t: 1.15 },
        { f: 1046.5, d: 0.8, t: 1.7 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + note.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.d + 0.05);
      });
    } catch {
      // Audio catch
    }
  }

  // Play short, pleasant study reminder chime to alert students
  public playStudyReminderChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Melodic 4-note bell chime: C5 (523.25), G5 (783.99), E5 (659.25), C6 (1046.50)
      const chimeNotes = [
        { f: 523.25, t: 0.00, d: 0.22 },
        { f: 783.99, t: 0.12, d: 0.22 },
        { f: 659.25, t: 0.24, d: 0.22 },
        { f: 1046.50, t: 0.36, d: 0.45 },
      ];

      chimeNotes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + note.t;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.d + 0.05);
      });
    } catch {}
  }

  // Play card flip sound for memory game
  public playCardFlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // Play card match success sound
  public playCardMatch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {}
  }
}

export const soundEffects = new SoundEffectsService();
