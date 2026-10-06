/**
 * Background Audio & Media Session Service for Trilha do Saber
 * Enables background audio playback, lock-screen / notification shade media controls (MediaSession API),
 * and syncs study timers & video lessons with the Service Worker when running in the background.
 */

export interface MediaSessionLessonInfo {
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  lessonBadge?: string;
}

class BackgroundAudioService {
  private isBackgroundAudioEnabled: boolean = true;
  private currentLesson: MediaSessionLessonInfo | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isAudioPlaying: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('estudahud_bg_audio_enabled');
        if (saved !== null) {
          this.isBackgroundAudioEnabled = saved === 'true';
        }
        this.initMediaSessionHandlers();
      }
    } catch {}
  }

  /**
   * Initializes browser & OS MediaSession handlers (notification shade / lockscreen controls)
   */
  private initMediaSessionHandlers() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.resume();
        window.dispatchEvent(new CustomEvent('estudahud_media_play'));
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
        window.dispatchEvent(new CustomEvent('estudahud_media_pause'));
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        window.dispatchEvent(new CustomEvent('estudahud_media_prev_lesson'));
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        window.dispatchEvent(new CustomEvent('estudahud_media_next_lesson'));
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        this.stop();
        window.dispatchEvent(new CustomEvent('estudahud_media_stop'));
      });
    } catch (err) {
      console.warn('MediaSession action handler registration error:', err);
    }
  }

  /**
   * Updates lockscreen and system notification shade with current lesson/audio details
   */
  public updateMediaSession(info: MediaSessionLessonInfo) {
    this.currentLesson = info;
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const defaultIcon = typeof window !== 'undefined' ? new URL('icon.svg', window.location.href).href : './icon.svg';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.lessonBadge ? `[${info.lessonBadge}] ${info.title}` : info.title,
        artist: info.artist || "Trilha do Saber - Educação e Xadrez",
        album: info.album || 'Curso de Xadrez & Videoaulas',
        artwork: [
          { src: info.artworkUrl || defaultIcon, sizes: '96x96', type: 'image/svg+xml' },
          { src: info.artworkUrl || defaultIcon, sizes: '128x128', type: 'image/svg+xml' },
          { src: info.artworkUrl || defaultIcon, sizes: '256x256', type: 'image/svg+xml' },
          { src: info.artworkUrl || defaultIcon, sizes: '512x512', type: 'image/svg+xml' },
        ],
      });

      navigator.mediaSession.playbackState = 'playing';
    } catch (err) {
      console.warn('Error updating MediaSession metadata:', err);
    }
  }

  /**
   * Clears or pauses media session
   */
  public pause() {
    this.isAudioPlaying = false;
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch {}
    }
  }

  public resume() {
    this.isAudioPlaying = true;
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'playing';
      } catch {}
    }
  }

  public stop() {
    this.isAudioPlaying = false;
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
  }

  public isEnabled(): boolean {
    return this.isBackgroundAudioEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.isBackgroundAudioEnabled = enabled;
    try {
      localStorage.setItem('estudahud_bg_audio_enabled', String(enabled));
    } catch {}
  }

  /**
   * Tells Service Worker that background task/audio/notifications are actively running
   */
  public pingServiceWorker(title: string, message: string) {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'BACKGROUND_STATUS_UPDATE',
        payload: {
          title,
          message,
          timestamp: Date.now(),
        },
      });
    }
  }
}

export const backgroundAudioService = new BackgroundAudioService();
