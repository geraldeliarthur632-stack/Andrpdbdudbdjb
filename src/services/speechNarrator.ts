export interface NarrationSegment {
  text: string;
  charStart?: number;
  charEnd?: number;
}

export const APP_INTRO_SEGMENTS: { text: string }[] = [
  {
    text: "Olá estudante! Bem-vindo à Trilha do Saber, seu aplicativo de estudos escolares e desafios do conhecimento!",
  },
  {
    text: "O aplicativo explica cada matéria com texto didático e voz clara antes de você responder às perguntas de fixação.",
  },
  {
    text: "Pratique com 10 questões perfeitas alinhadas à sua série escolar com leitura automática por voz na velocidade dinâmica.",
  },
  {
    text: "Explore Flashcards interativos e a Central de Jogos com Caça Palavras, Palavras Cruzadas, Quebra Cabeça e Xadrez!",
  },
];

export const APP_INTRO_TEXT = APP_INTRO_SEGMENTS.map((s) => s.text).join(' ');

export type NarrationStatus = 'idle' | 'playing' | 'paused';

export interface NarrationCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number) => void;
  rate?: number;
}

class SpeechNarratorService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private autoNarrateEnabled: boolean = true;
  private activeUtterancesSet: Set<SpeechSynthesisUtterance> = new Set();
  private onBeforeSpeakHooks: (() => void)[] = [];
  private currentSpeechSessionId: number = 0;
  private keepAliveInterval: any = null;
  private safetyTimeout: any = null;

  // Audio element for studio-quality AI cloud voice
  private activeAudio: HTMLAudioElement | null = null;
  private isUsingAudioElement: boolean = false;

  // State for chunk-by-chunk playback & pause/resume
  private currentChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private currentRate: number = 1.0;
  private currentFullText: string = '';
  private activeCallbacks: NarrationCallbacks = {};
  private statusListeners: Set<(status: NarrationStatus) => void> = new Set();

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('estudahud_auto_narrate');
        this.autoNarrateEnabled = saved !== 'false';

        // Keep persistent reference on window to prevent browser garbage collection
        (window as any).__speechNarratorUtterances = this.activeUtterancesSet;

        // Hook Android Native TTS bridge callbacks
        (window as any).__onAndroidTTSStart = (_id: string) => {
          this.handleNativeTTSStart();
        };
        (window as any).__onAndroidTTSDone = (_id: string) => {
          this.handleNativeTTSDone();
        };
        (window as any).__onAndroidTTSError = (_id: string) => {
          this.handleNativeTTSError();
        };
        (window as any).__onAndroidTTSReady = () => {
          // Native Android engine ready
        };

        if ('speechSynthesis' in window && window.speechSynthesis) {
          this.loadVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      }
    } catch {
      // Ignored in restricted environments
    }
  }

  /**
   * Returns native Android TTS bridge instance if running inside Android APK/WebView
   */
  private getAndroidTTS(): any {
    if (typeof window !== 'undefined' && (window as any).AndroidTTS) {
      return (window as any).AndroidTTS;
    }
    return null;
  }

  /**
   * Checks if Android native TTS engine is available
   */
  public isAndroidNative(): boolean {
    return Boolean(this.getAndroidTTS());
  }

  private notifyStatusChange(status: NarrationStatus) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch {}
    });
  }

  public subscribeStatus(listener: (status: NarrationStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Emit initial status
    try {
      listener(this.getStatus());
    } catch {}
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getStatus(): NarrationStatus {
    if (this.isPaused) return 'paused';
    if (this.isSpeaking) return 'playing';
    return 'idle';
  }

  public getProgress(): { currentChunk: number; totalChunks: number; percent: number } {
    const total = this.currentChunks.length;
    const current = Math.min(this.currentChunkIndex, total);
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    return { currentChunk: current, totalChunks: total, percent };
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    // Prevents Web Speech synthesis from freezing during long narrations on Chromium
    this.keepAliveInterval = setInterval(() => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
          if (this.isSpeaking && !this.isPaused && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
      } catch {}
    }, 4500);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private clearSafetyTimeout() {
    if (this.safetyTimeout) {
      clearTimeout(this.safetyTimeout);
      this.safetyTimeout = null;
    }
  }

  private loadVoices() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        this.voices = window.speechSynthesis.getVoices() || [];
      }
    } catch {
      this.voices = [];
    }
  }

  public async ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
      return [];
    }
    if (this.voices.length > 0) {
      return this.voices;
    }
    this.loadVoices();
    if (this.voices.length > 0) {
      return this.voices;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.loadVoices();
          resolve(this.voices);
        }
      }, 350);

      const handler = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.loadVoices();
          resolve(this.voices);
        }
      };

      try {
        window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true });
      } catch {
        window.speechSynthesis.onvoiceschanged = handler;
      }
    });
  }

  public registerOnBeforeSpeak(hook: () => void) {
    this.onBeforeSpeakHooks.push(hook);
  }

  private triggerBeforeSpeak() {
    this.onBeforeSpeakHooks.forEach((hook) => {
      try {
        hook();
      } catch {}
    });
  }

  public splitTextIntoChunks(text: string, maxChunkLength: number = 220): string[] {
    if (!text) return [];

    const normalized = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ');
    const rawSentences = normalized
      .replace(/([.?!;:])\s+/g, '$1|SPLIT|')
      .split('|SPLIT|');

    const chunks: string[] = [];

    for (const rawSentence of rawSentences) {
      const sentence = rawSentence.trim();
      if (!sentence) continue;

      if (sentence.length <= maxChunkLength) {
        chunks.push(sentence);
      } else {
        const clauses = sentence
          .replace(/([,:–—])\s+/g, '$1|SUB|')
          .split('|SUB|');

        let currentSubChunk = '';
        for (const clause of clauses) {
          const trimmedClause = clause.trim();
          if (!trimmedClause) continue;

          if ((currentSubChunk + ' ' + trimmedClause).trim().length <= maxChunkLength) {
            currentSubChunk = (currentSubChunk + ' ' + trimmedClause).trim();
          } else {
            if (currentSubChunk) chunks.push(currentSubChunk);
            if (trimmedClause.length <= maxChunkLength) {
              currentSubChunk = trimmedClause;
            } else {
              const words = trimmedClause.split(/\s+/);
              let wordChunk = '';
              for (const word of words) {
                if ((wordChunk + ' ' + word).trim().length <= maxChunkLength) {
                  wordChunk = (wordChunk + ' ' + word).trim();
                } else {
                  if (wordChunk) chunks.push(wordChunk);
                  wordChunk = word;
                }
              }
              currentSubChunk = wordChunk;
            }
          }
        }
        if (currentSubChunk) {
          chunks.push(currentSubChunk);
        }
      }
    }

    return chunks.length > 0 ? chunks : [text.trim()];
  }

  public isAutoNarrateEnabled(): boolean {
    return this.autoNarrateEnabled;
  }

  public setAutoNarrateEnabled(enabled: boolean) {
    this.autoNarrateEnabled = enabled;
    try {
      localStorage.setItem('estudahud_auto_narrate', String(enabled));
    } catch {}
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Sanitizes, cleans and formats text for natural, fluent speech in Portuguese TTS.
   */
  public formatMathForSpeech(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Clean Markdown formatting, tags & HTML
    text = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[MATH\]([\s\S]*?)\[\/MATH\]/gi, '$1')
      .replace(/\[IMAGE[^\]]*\]/gi, '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
      .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[ \t]*[-*•–—]\s+/gm, '');

    // 1.5. Fix abbreviations to sound natural in Portuguese TTS
    text = text
      .replace(/\be\s+etc\.?(?!\w)/gi, 'e assim por diante')
      .replace(/\betc\.?(?!\w)/gi, 'e assim por diante')
      .replace(/\be\s+outros\s+etc/gi, 'e outros semelhantes')
      .replace(/\b(p\.\s*ex\.|ex\.:|ex:)\b/gi, 'por exemplo')
      .replace(/\bobs\.:|\bobs:\b/gi, 'observação:')
      .replace(/\baprox\.\b/gi, 'aproximadamente')
      .replace(/\bvs\.?\b/gi, 'versus')
      .replace(/\bcap\.\s*(\d+)/gi, 'capítulo $1')
      .replace(/\bpágs?\.\s*(\d+)/gi, 'página $1')
      .replace(/\bart\.\s*(\d+)/gi, 'artigo $1')
      .replace(/\bnº\s*(\d+)/gi, 'número $1')
      .replace(/\bdr\.\s+/gi, 'doutor ')
      .replace(/\bdra\.\s+/gi, 'doutora ')
      .replace(/\bprof\.\s+/gi, 'professor ')
      .replace(/\bprofa\.\s+/gi, 'professora ');

    // 2. Fix compound words and hyphens
    text = text
      .replace(/\bquebra[-–—\s]*cabeça(s?)\b/gi, 'quebra cabeça$1')
      .replace(/\bpasso[-–—\s]*a[-–—\s]*passo\b/gi, 'passo a passo')
      .replace(/\bdia[-–—\s]*a[-–—\s]*dia\b/gi, 'dia a dia')
      .replace(/\bponto[-–—\s]*a[-–—\s]*ponto\b/gi, 'ponto a ponto')
      .replace(/\blado[-–—\s]*a[-–—\s]*lado\b/gi, 'lado a lado')
      .replace(/\bfrente[-–—\s]*a[-–—\s]*frente\b/gi, 'frente a frente')
      .replace(/\bcara[-–—\s]*a[-–—\s]*cara\b/gi, 'cara a cara')
      .replace(/\bbem[-–—\s]*vindo(s?)\b/gi, 'bem vindo$1')
      .replace(/\bbem[-–—\s]*vinda(s?)\b/gi, 'bem vinda$1')
      .replace(/\bguarda[-–—\s]*chuva(s?)\b/gi, 'guarda chuva$1')
      .replace(/\bguarda[-–—\s]*roupa(s?)\b/gi, 'guarda roupa$1')
      .replace(/\bguarda[-–—\s]*sol\b/gi, 'guarda sol')
      .replace(/\barco[-–—\s]*íris\b/gi, 'arco íris')
      .replace(/\bmeio[-–—\s]*ambiente\b/gi, 'meio ambiente')
      .replace(/\bmatéria[-–—\s]*prima(s?)\b/gi, 'matéria prima$1')
      .replace(/\bsegunda[-–—\s]*feira\b/gi, 'segunda feira')
      .replace(/\bterça[-–—\s]*feira\b/gi, 'terça feira')
      .replace(/\bquarta[-–—\s]*feira\b/gi, 'quarta feira')
      .replace(/\bquinta[-–—\s]*feira\b/gi, 'quinta feira')
      .replace(/\bsexta[-–—\s]*feira\b/gi, 'sexta feira')
      .replace(/\bfim[-–—\s]*de[-–—\s]*semana\b/gi, 'fim de semana')
      .replace(/\bpós[-–—\s]*graduação\b/gi, 'pós graduação')
      .replace(/\bpré[-–—\s]*história\b/gi, 'pré história')
      .replace(/\bauto[-–—\s]*avaliação\b/gi, 'auto avaliação');

    text = text.replace(
      /\b([a-zA-ZÀ-ÿ]+)\s*[-–—]\s*([a-zA-ZÀ-ÿ]+)\b/gi,
      '$1 $2'
    );

    // 3. Fix ranges like "anos 1930 - 1945"
    text = text.replace(/(\b(?:de|anos|ano|páginas|página|século|séculos|fase|etapa|nível)\s+\d+)\s*[-–—]\s*(\d+\b)/gi, '$1 a $2');
    text = text.replace(/\b(\d{4})\s*[-–—]\s*(\d{4})\b/g, '$1 a $2');

    // 3.5. Math subtraction
    text = text.replace(/(\d+)\s*[-−]\s*(\d+)/g, '$1 menos $2');
    text = text.replace(/\b([xyzXYZ])\s*[-−]\s*(\d+|[xyzXYZ])\b/g, '$1 menos $2');
    text = text.replace(/(\d+)\s*[-−]\s*([xyzXYZ])\b/g, '$1 menos $2');

    // 4. Fix dashes used as separators
    text = text.replace(/\s+[-–—]\s+/g, ', ');

    // 5. Units of measurement
    text = text
      .replace(/\bkm\/h\b/gi, 'quilômetros por hora')
      .replace(/\bm\/s\b/gi, 'metros por segundo')
      .replace(/\bcm²\b/gi, 'centímetros quadrados')
      .replace(/\bm²\b/gi, 'metros quadrados')
      .replace(/\bkm²\b/gi, 'quilômetros quadrados')
      .replace(/\bcm³\b/gi, 'centímetros cúbicos')
      .replace(/\bm³\b/gi, 'metros cúbicos')
      .replace(/(\d+)\s*°\s*C\b/gi, '$1 graus Celsius')
      .replace(/(\d+)\s*º\s*C\b/gi, '$1 graus Celsius')
      .replace(/(\d+)\s*°\s*F\b/gi, '$1 graus Fahrenheit')
      .replace(/(\d+)\s*%/g, '$1 por cento')
      .replace(/%/g, ' por cento');

    // 6. Common fractions
    text = text
      .replace(/\b1\/2\b/g, 'um meio')
      .replace(/\b1\/3\b/g, 'um terço')
      .replace(/\b2\/3\b/g, 'dois terços')
      .replace(/\b1\/4\b/g, 'um quarto')
      .replace(/\b3\/4\b/g, 'três quartos')
      .replace(/\b1\/5\b/g, 'um quinto')
      .replace(/\b2\/5\b/g, 'dois quintos')
      .replace(/\b3\/5\b/g, 'três quintos')
      .replace(/\b4\/5\b/g, 'quatro quintos')
      .replace(/\b1\/6\b/g, 'um sexto')
      .replace(/\b5\/6\b/g, 'cinco sextos')
      .replace(/\b1\/8\b/g, 'um oitavo')
      .replace(/\b3\/8\b/g, 'três oitavos')
      .replace(/\b5\/8\b/g, 'cinco oitavos')
      .replace(/\b7\/8\b/g, 'sete oitavos');

    // 7. Math symbols and operators
    text = text.replace(/(\d+)\s*×\s*(\d+)/g, '$1 vezes $2');
    text = text.replace(/(\d+)\s*÷\s*(\d+)/g, '$1 dividido por $2');
    text = text.replace(/(\d+)\s*·\s*(\d+)/g, '$1 vezes $2');
    text = text.replace(/(\d+)\s*\*\s*(\d+)/g, '$1 vezes $2');
    text = text.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 dividido por $2');

    text = text.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 mais $2');
    text = text.replace(/\b([xyzXYZ])\s*\+\s*(\d+|[xyzXYZ])\b/g, '$1 mais $2');
    text = text.replace(/(\d+)\s*\+\s*([xyzXYZ])\b/g, '$1 mais $2');

    text = text.replace(/(\d+)\s*=\s*(\d+)/g, '$1 igual a $2');
    text = text.replace(/\b([xyzXYZ])\s*=\s*(\d+|[xyzXYZ])\b/g, '$1 igual a $2');

    text = text.replace(/(\d+)\s*≠\s*(\d+)/g, '$1 diferente de $2');
    text = text.replace(/(\d+)\s*≈\s*(\d+)/g, '$1 aproximadamente $2');
    text = text.replace(/(\d+)\s*≤\s*(\d+)/g, '$1 menor ou igual a $2');
    text = text.replace(/(\d+)\s*≥\s*(\d+)/g, '$1 maior ou igual a $2');
    text = text.replace(/(\d+)\s*<\s*(\d+)/g, '$1 menor que $2');
    text = text.replace(/(\d+)\s*>\s*(\d+)/g, '$1 maior que $2');

    text = text.replace(/[ \t]+/g, ' ').trim();
    return text;
  }

  public getDefaultRate(): number {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('estudahud_speech_rate');
        if (saved === 'slow') return 0.85;
        if (saved === 'normal') return 1.0;
        if (saved === 'fast') return 1.25;
      }
    } catch {}
    return 1.0;
  }

  public setDefaultRate(rate: number) {
    this.currentRate = rate;
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const label = rate < 0.95 ? 'slow' : rate > 1.15 ? 'fast' : 'normal';
        localStorage.setItem('estudahud_speech_rate', label);
      }
    } catch {}
  }

  public getAvailablePortugueseVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    const ptBrVoices = this.voices.filter(
      (v) =>
        v.lang &&
        (v.lang.toLowerCase().replace('_', '-') === 'pt-br' ||
          v.lang.toLowerCase().startsWith('pt-br') ||
          v.name.toLowerCase().includes('brasil') ||
          v.name.toLowerCase().includes('brazil'))
    );
    return ptBrVoices.length > 0
      ? ptBrVoices
      : this.voices.filter((v) => v.lang && (v.lang.toLowerCase().startsWith('pt') || v.name.toLowerCase().includes('portug')));
  }

  public setPreferredVoice(voiceName: string) {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem('estudahud_preferred_voice', voiceName);
      }
    } catch {}
  }

  public getPreferredVoiceName(): string {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        return localStorage.getItem('estudahud_preferred_voice') || '';
      }
    } catch {}
    return '';
  }

  public getBestPortugueseVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    const candidates = this.getAvailablePortugueseVoices();

    if (candidates.length > 0) {
      const savedPref = this.getPreferredVoiceName();
      if (savedPref) {
        const customVoice = candidates.find(
          (v) => v.name === savedPref || v.voiceURI === savedPref || v.name.toLowerCase().includes(savedPref.toLowerCase())
        );
        if (customVoice) return customVoice;
      }

      const preferredVoicesOrder = [
        'Luciana',
        'Heloisa',
        'Camila',
        'Brenda',
        'Google português do Brasil',
        'Google Português',
        'Google pt-BR',
        'Felipe',
        'Daniel',
        'Antonio',
        'Letícia',
        'Leticia',
        'Yara',
        'Natural',
        'Francisca',
        'Maria',
      ];

      for (const pref of preferredVoicesOrder) {
        const found = candidates.find((v) => v.name.toLowerCase().includes(pref.toLowerCase()));
        if (found) return found;
      }

      return candidates[0];
    }
    return null;
  }

  /**
   * Main entrypoint for speaking text.
   * Completely avoids duplicate speech by stopping previous sessions first.
   */
  public speak(
    text: string,
    onStartOrEnd?:
      | (() => void)
      | NarrationCallbacks,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void,
    rate?: number
  ) {
    let actualStart: (() => void) | undefined;
    let actualEnd: (() => void) | undefined;
    let actualBoundary: ((charIndex: number) => void) | undefined = onBoundary;
    let actualPause: (() => void) | undefined;
    let actualResume: (() => void) | undefined;
    const defaultRate = this.getDefaultRate();
    let actualRate: number = rate || defaultRate;

    if (typeof onStartOrEnd === 'object' && onStartOrEnd !== null) {
      actualStart = onStartOrEnd.onStart;
      actualEnd = onStartOrEnd.onEnd;
      actualBoundary = onStartOrEnd.onBoundary || onBoundary;
      actualPause = onStartOrEnd.onPause;
      actualResume = onStartOrEnd.onResume;
      actualRate = onStartOrEnd.rate || rate || defaultRate;
    } else if (typeof onStartOrEnd === 'function') {
      if (typeof onEnd === 'function') {
        actualStart = onStartOrEnd;
        actualEnd = onEnd;
      } else {
        actualEnd = onStartOrEnd;
      }
    }

    this.activeCallbacks = {
      onStart: actualStart,
      onEnd: actualEnd,
      onBoundary: actualBoundary,
      onPause: actualPause,
      onResume: actualResume,
      rate: actualRate,
    };
    this.currentRate = actualRate;

    try {
      this.triggerBeforeSpeak();

      // Immediately cancel any previous speech to prevent audio duplication!
      this.stopInternal(false);

      const sanitizedText = this.formatMathForSpeech(text);
      if (!sanitizedText.trim()) {
        actualEnd?.();
        this.notifyStatusChange('idle');
        return;
      }

      this.currentFullText = text;
      this.currentSpeechSessionId++;
      const sessionId = this.currentSpeechSessionId;

      this.currentChunks = this.splitTextIntoChunks(sanitizedText, 240);
      if (this.currentChunks.length === 0) {
        actualEnd?.();
        this.notifyStatusChange('idle');
        return;
      }

      this.currentChunkIndex = 0;
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyStatusChange('playing');

      this.startKeepAlive();

      // Trigger playback synchronously to retain browser User-Gesture context
      this.playCurrentChunk();
    } catch (err) {
      console.warn('[speechNarrator] Erro ao iniciar fala:', err);
      this.stop();
      actualEnd?.();
    }
  }

  /**
   * Generates or streams high-fidelity pedagogical AI speech via /api/ai/tts
   * with fallback to native Android TTS and Web Speech.
   */
  public async speakWithAiAudio(
    text: string,
    callbacks?: NarrationCallbacks
  ): Promise<boolean> {
    const sanitizedText = this.formatMathForSpeech(text);
    if (!sanitizedText.trim()) return false;

    this.stopInternal(false);
    this.currentSpeechSessionId++;
    const sessionId = this.currentSpeechSessionId;

    this.isSpeaking = true;
    this.isPaused = false;
    this.currentRate = callbacks?.rate || this.getDefaultRate();
    this.notifyStatusChange('playing');
    callbacks?.onStart?.();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sanitizedText.slice(0, 1600),
          speed: this.currentRate,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (this.currentSpeechSessionId !== sessionId) return false;

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.playbackRate = Math.max(0.75, Math.min(this.currentRate, 1.5));
          this.activeAudio = audio;
          this.isUsingAudioElement = true;

          audio.onended = () => {
            if (this.currentSpeechSessionId === sessionId) {
              this.onNarrationFinished();
              callbacks?.onEnd?.();
            }
          };

          audio.onerror = () => {
            if (this.currentSpeechSessionId === sessionId) {
              this.isUsingAudioElement = false;
              this.activeAudio = null;
              this.speak(text, callbacks);
            }
          };

          await audio.play();
          return true;
        }
      }
    } catch {
      // In case of timeout or offline, fall back directly to device synthesizer
    }

    if (this.currentSpeechSessionId === sessionId) {
      this.isUsingAudioElement = false;
      this.speak(text, callbacks);
    }
    return false;
  }

  /**
   * Plays the chunk at this.currentChunkIndex
   */
  private playCurrentChunk() {
    const sessionId = this.currentSpeechSessionId;
    if (this.currentSpeechSessionId !== sessionId || !this.isSpeaking || this.isPaused) {
      return;
    }

    if (this.currentChunkIndex >= this.currentChunks.length) {
      this.onNarrationFinished();
      return;
    }

    const chunkText = this.currentChunks[this.currentChunkIndex];
    const androidTTS = this.getAndroidTTS();

    // 1. PATH: Native Android TTS Engine
    if (androidTTS) {
      try {
        const chunkId = `chunk_${sessionId}_${this.currentChunkIndex}`;
        const didCall = androidTTS.speakWithId
          ? androidTTS.speakWithId(chunkText, this.currentRate, chunkId)
          : androidTTS.speak(chunkText, this.currentRate);

        if (didCall !== false) {
          if (this.currentChunkIndex === 0) {
            this.activeCallbacks.onStart?.();
          }

          // Safety timeout in case Android TTS native callback gets delayed
          this.clearSafetyTimeout();
          const estimatedDurationMs = Math.max(2000, (chunkText.length / 12) * 1000 / this.currentRate + 2000);
          this.safetyTimeout = setTimeout(() => {
            if (this.currentSpeechSessionId === sessionId && this.isSpeaking && !this.isPaused) {
              this.advanceChunk();
            }
          }, estimatedDurationMs);
          return;
        }
      } catch (err) {
        console.warn('[speechNarrator] Falha no Android TTS bridge, tentando Web Speech:', err);
      }
    }

    // 2. PATH: Web SpeechSynthesis API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(chunkText);
        this.utterance = utterance;
        this.activeUtterancesSet.add(utterance);
        (window as any).__currentSpeechUtterance = utterance;

        const bestVoice = this.getBestPortugueseVoice();
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang || 'pt-BR';
        } else {
          utterance.lang = 'pt-BR';
        }

        utterance.rate = Math.max(0.8, Math.min(this.currentRate, 2.0));
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          if (this.currentSpeechSessionId !== sessionId) return;
          if (this.currentChunkIndex === 0) {
            this.activeCallbacks.onStart?.();
          }
        };

        utterance.onend = () => {
          this.activeUtterancesSet.delete(utterance);
          if (this.currentSpeechSessionId !== sessionId || this.isPaused) return;
          setTimeout(() => {
            if (this.currentSpeechSessionId === sessionId && !this.isPaused) {
              this.advanceChunk();
            }
          }, 35);
        };

        utterance.onerror = (e) => {
          this.activeUtterancesSet.delete(utterance);
          if (e.error === 'canceled' || e.error === 'interrupted') return;
          if (this.currentSpeechSessionId !== sessionId || this.isPaused) return;
          setTimeout(() => {
            if (this.currentSpeechSessionId === sessionId && !this.isPaused) {
              this.advanceChunk();
            }
          }, 40);
        };

        if (this.activeCallbacks.onBoundary) {
          utterance.onboundary = (event) => {
            if (this.currentSpeechSessionId === sessionId) {
              this.activeCallbacks.onBoundary?.(event.charIndex);
            }
          };
        }

        // Safety timeout so browser never freezes indefinitely
        this.clearSafetyTimeout();
        const estimatedDurationMs = Math.max(2200, (chunkText.length / 10) * 1000 / this.currentRate + 2500);
        this.safetyTimeout = setTimeout(() => {
          if (this.currentSpeechSessionId === sessionId && this.isSpeaking && !this.isPaused) {
            this.advanceChunk();
          }
        }, estimatedDurationMs);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('[speechNarrator] Falha ao enviar utterance no navegador:', err);
      }
    }

    // 3. PATH: Web Speech or Android not working - Graceful fallback
    this.onNarrationFinished();
  }

  private advanceChunk() {
    this.clearSafetyTimeout();
    this.currentChunkIndex++;
    if (this.currentChunkIndex >= this.currentChunks.length) {
      this.onNarrationFinished();
    } else {
      this.playCurrentChunk();
    }
  }

  private onNarrationFinished() {
    this.isSpeaking = false;
    this.isPaused = false;
    this.isUsingAudioElement = false;
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio = null;
      } catch {}
    }
    this.stopKeepAlive();
    this.clearSafetyTimeout();
    this.activeUtterancesSet.clear();
    this.notifyStatusChange('idle');
    this.activeCallbacks.onEnd?.();
  }

  // Android Native TTS Callbacks
  private handleNativeTTSStart() {
    if (this.currentChunkIndex === 0) {
      this.activeCallbacks.onStart?.();
    }
  }

  private handleNativeTTSDone() {
    this.clearSafetyTimeout();
    if (this.isSpeaking && !this.isPaused) {
      this.advanceChunk();
    }
  }

  private handleNativeTTSError() {
    this.clearSafetyTimeout();
    if (this.isSpeaking && !this.isPaused) {
      this.advanceChunk();
    }
  }

  /**
   * Pauses the current speech narration without losing place
   */
  public pause() {
    if (!this.isSpeaking || this.isPaused) return;

    this.isPaused = true;
    this.clearSafetyTimeout();

    if (this.isUsingAudioElement && this.activeAudio) {
      try {
        this.activeAudio.pause();
      } catch {}
    }

    const androidTTS = this.getAndroidTTS();
    if (androidTTS) {
      try {
        androidTTS.pause();
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.notifyStatusChange('paused');
    this.activeCallbacks.onPause?.();
  }

  /**
   * Resumes playback from where it was paused
   */
  public resume() {
    if (!this.isSpeaking || !this.isPaused) return;

    this.isPaused = false;
    this.notifyStatusChange('playing');
    this.activeCallbacks.onResume?.();

    if (this.isUsingAudioElement && this.activeAudio) {
      try {
        this.activeAudio.play().catch(() => {
          this.playCurrentChunk();
        });
        return;
      } catch {}
    }

    this.startKeepAlive();
    this.playCurrentChunk();
  }

  /**
   * Stops playback completely and resets position
   */
  public stop() {
    this.stopInternal(true);
  }

  private stopInternal(notifyCallbacks: boolean = true) {
    try {
      this.currentSpeechSessionId++;
      this.stopKeepAlive();
      this.clearSafetyTimeout();
      this.activeUtterancesSet.clear();

      if (this.activeAudio) {
        try {
          this.activeAudio.pause();
          this.activeAudio.src = '';
          this.activeAudio = null;
        } catch {}
      }
      this.isUsingAudioElement = false;

      const androidTTS = this.getAndroidTTS();
      if (androidTTS) {
        try {
          androidTTS.stop();
        } catch {}
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      }

      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentChunks = [];
      this.currentChunkIndex = 0;

      this.notifyStatusChange('idle');

      if (notifyCallbacks && wasSpeaking) {
        this.activeCallbacks.onEnd?.();
      }
    } catch {
      this.isSpeaking = false;
      this.isPaused = false;
      this.isUsingAudioElement = false;
      this.stopKeepAlive();
      this.notifyStatusChange('idle');
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking && !this.isPaused;
  }

  public isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Reads a question and its multiple-choice options with automatic voice
   */
  public speakQuestion(params: {
    questionIndex?: number;
    questionText: string;
    options?: string[];
    onStart?: () => void;
    onEnd?: () => void;
    force?: boolean;
    rate?: number;
  }) {
    if (!this.autoNarrateEnabled && !params.force) {
      return;
    }

    const defaultRate = this.getDefaultRate();
    const { questionIndex, questionText, options = [], onStart, onEnd, rate = defaultRate } = params;

    let fullText = '';
    if (typeof questionIndex === 'number') {
      fullText += `Questão ${questionIndex + 1}: `;
    }
    fullText += `${questionText}. `;

    if (options && options.length > 0) {
      const letters = ['A', 'B', 'C', 'D', 'E'];
      const optionsFormatted = options
        .map((opt, i) => `Opção ${letters[i] || i + 1}: ${opt}`)
        .join('. ');
      fullText += ` ${optionsFormatted}`;
    }

    this.speak(fullText, onStart, onEnd, undefined, rate);
  }

  // Multilingual speech pronunciation helper
  public speakLanguage(
    text: string,
    langCode: string = 'pt-BR',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    try {
      this.stop();
      this.speak(text, onStart, onEnd);
    } catch {
      onEnd?.();
    }
  }

  // English speech pronunciation helper
  public speakEnglish(text: string, onStart?: () => void, onEnd?: () => void) {
    this.speakLanguage(text, 'en-US', onStart, onEnd);
  }
}

export const speechNarrator = new SpeechNarratorService();
