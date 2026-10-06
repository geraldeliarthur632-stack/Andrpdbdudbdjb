import React, { useState, useEffect, useRef } from 'react';
import {
  CHESS_VIDEO_LESSONS,
  CHESS_OFFICIAL_PLAYLIST,
  ChessVideoLesson,
} from '../../data/chessVideoData';
import { soundEffects } from '../../services/soundEffects';
import { backgroundAudioService } from '../../services/backgroundAudioService';
import {
  Play,
  Pause,
  CheckCircle2,
  Tv,
  Search,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ExternalLink,
  Plus,
  Check,
  RotateCcw,
  ListVideo,
  Flame,
  Film,
  GraduationCap,
  Volume2,
  X,
} from 'lucide-react';

interface ChessVideoPlayerProps {
  initialLessonId?: string;
  onEarnPoints?: (points: number, isChallengeCompleted?: boolean) => void;
  onGoToBoard?: () => void;
}

export const ChessVideoPlayer: React.FC<ChessVideoPlayerProps> = ({
  initialLessonId,
  onEarnPoints,
  onGoToBoard,
}) => {
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<ChessVideoLesson>(() => {
    if (initialLessonId) {
      const found = CHESS_VIDEO_LESSONS.find((v) => v.id === initialLessonId);
      if (found) return found;
    }
    return CHESS_VIDEO_LESSONS[0]; // Aula 1 by default
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingPlaylistEmbed, setIsPlayingPlaylistEmbed] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('estudahud_chess_videos_completed_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string | null>(null);

  // Sync MediaSession metadata whenever selectedVideo changes
  useEffect(() => {
    if (selectedVideo) {
      backgroundAudioService.updateMediaSession({
        title: selectedVideo.title,
        artist: selectedVideo.channel || 'Curso de Xadrez',
        album: 'Aprenda Xadrez do Zero',
        artworkUrl: selectedVideo.thumbnailUrl || './icon.svg',
        lessonBadge: selectedVideo.lessonBadge,
      });

      backgroundAudioService.pingServiceWorker(
        selectedVideo.lessonBadge,
        `Assistindo: ${selectedVideo.title}`
      );
    }
  }, [selectedVideo]);

  // Handle global MediaSession Prev/Next events from lockscreen / background notification shade
  useEffect(() => {
    const handleNextLesson = () => {
      const currentIndex = CHESS_VIDEO_LESSONS.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex >= 0 && currentIndex < CHESS_VIDEO_LESSONS.length - 1) {
        setSelectedVideo(CHESS_VIDEO_LESSONS[currentIndex + 1]);
      }
    };

    const handlePrevLesson = () => {
      const currentIndex = CHESS_VIDEO_LESSONS.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex > 0) {
        setSelectedVideo(CHESS_VIDEO_LESSONS[currentIndex - 1]);
      }
    };

    window.addEventListener('estudahud_media_next_lesson', handleNextLesson);
    window.addEventListener('estudahud_media_prev_lesson', handlePrevLesson);

    return () => {
      window.removeEventListener('estudahud_media_next_lesson', handleNextLesson);
      window.removeEventListener('estudahud_media_prev_lesson', handlePrevLesson);
    };
  }, [selectedVideo]);

  useEffect(() => {
    if (initialLessonId) {
      const found = CHESS_VIDEO_LESSONS.find((v) => v.id === initialLessonId);
      if (found) {
        setSelectedVideo(found);
        setIsPlayingPlaylistEmbed(found.id === 'vid_playlist_geral');
      }
    }
  }, [initialLessonId]);

  // Helper to extract YouTube ID or Playlist ID
  const extractYoutubeId = (url: string): { type: 'video' | 'playlist'; id: string } | null => {
    const trimmed = url.trim();

    if (trimmed.includes('list=')) {
      const listMatch = trimmed.match(/list=([a-zA-Z0-9_-]+)/);
      if (listMatch && listMatch[1]) {
        return { type: 'playlist', id: listMatch[1] };
      }
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { type: 'video', id: trimmed };
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return { type: 'video', id: match[2] };
    }

    return null;
  };

  const handleSelectVideo = (
    video: ChessVideoLesson,
    openDirectly: boolean = false,
    togglePause: boolean = false
  ) => {
    soundEffects.playClick();
    setSelectedVideo(video);

    if (togglePause) {
      setIsPaused((prev) => !prev);
    } else {
      setIsPaused(false);
    }

    if (video.id === 'vid_playlist_geral') {
      setIsPlayingPlaylistEmbed(true);
    } else {
      setIsPlayingPlaylistEmbed(false);
    }

    // Scroll smoothly to player container
    setTimeout(() => {
      videoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    if (openDirectly) {
      const url = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleMarkAsCompleted(video);
    }
  };

  const handleNextVideo = () => {
    const currentIndex = CHESS_VIDEO_LESSONS.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex >= 0 && currentIndex < CHESS_VIDEO_LESSONS.length - 1) {
      soundEffects.playClick();
      setSelectedVideo(CHESS_VIDEO_LESSONS[currentIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    const currentIndex = CHESS_VIDEO_LESSONS.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex > 0) {
      soundEffects.playClick();
      setSelectedVideo(CHESS_VIDEO_LESSONS[currentIndex - 1]);
    }
  };

  const handleOpenYoutubeDirectly = (video: ChessVideoLesson = selectedVideo) => {
    soundEffects.playVictory();
    const url = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    handleMarkAsCompleted(video);
  };

  const handleOpenOfficialPlaylist = () => {
    soundEffects.playVictory();
    window.open(CHESS_OFFICIAL_PLAYLIST.url, '_blank', 'noopener,noreferrer');
    onEarnPoints?.(CHESS_OFFICIAL_PLAYLIST.xpReward, true);
  };

  const handleMarkAsCompleted = (video: ChessVideoLesson) => {
    if (completedVideos.includes(video.id)) return;

    soundEffects.playCorrect('bonus');
    const nextCompleted = [...completedVideos, video.id];
    setCompletedVideos(nextCompleted);
    try {
      localStorage.setItem('estudahud_chess_videos_completed_v1', JSON.stringify(nextCompleted));
    } catch {}
    onEarnPoints?.(video.xpReward, true);
  };

  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const parsed = extractYoutubeId(customUrlInput);
    if (!parsed) {
      soundEffects.playError();
      setCustomError('Link inválido do YouTube. Cole um link de vídeo ou playlist válido.');
      return;
    }

    soundEffects.playCorrect('bonus');
    const isPlaylist = parsed.type === 'playlist';
    const newVid: ChessVideoLesson = {
      id: `custom_${Date.now()}`,
      lessonNumber: CHESS_VIDEO_LESSONS.length + 1,
      lessonBadge: isPlaylist ? 'Playlist' : `Aula Extra`,
      youtubeId: isPlaylist ? `videoseries?list=${parsed.id}` : parsed.id,
      youtubeUrl: customUrlInput.trim(),
      title: isPlaylist ? 'Playlist de Xadrez Importada' : 'Vídeo Personalizado de Xadrez',
      channel: 'YouTube',
      duration: isPlaylist ? 'Playlist' : 'Vídeo',
      category: 'iniciante',
      categoryLabel: isPlaylist ? 'Playlist' : 'Vídeo Adicionado',
      difficulty: 'Iniciante',
      description: 'Conteúdo de xadrez importado pelo usuário para assistir e aprender.',
      keyTakeaways: ['Acompanhe a aula no YouTube e pratique os temas no tabuleiro.'],
      xpReward: 35,
    };

    setSelectedVideo(newVid);
    setIsPlayingPlaylistEmbed(isPlaylist);
    setShowCustomModal(false);
    setCustomUrlInput('');
  };

  const filteredVideos = CHESS_VIDEO_LESSONS.filter((video) => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      video.title.toLowerCase().includes(query) ||
      video.lessonBadge.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.categoryLabel.toLowerCase().includes(query) ||
      `aula ${video.lessonNumber}`.includes(query) ||
      String(video.lessonNumber).includes(query);

    return matchesCategory && matchesSearch;
  });

  const isCurrentCompleted = completedVideos.includes(selectedVideo.id);
  const currentLessonIndex = CHESS_VIDEO_LESSONS.findIndex((v) => v.id === selectedVideo.id);
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex >= 0 && currentLessonIndex < CHESS_VIDEO_LESSONS.length - 1;

  // Compute embed URL based on video or playlist
  const getEmbedUrl = (video: ChessVideoLesson) => {
    if (video.youtubeId.includes('videoseries') || video.youtubeId.includes('list=')) {
      return `https://www.youtube.com/embed/${video.youtubeId}`;
    }
    return `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const embedSrc = getEmbedUrl(selectedVideo);

  return (
    <div className="space-y-4">
      {/* Top Banner: Direct Lesson Launcher & Selector */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 shrink-0 text-xl font-bold">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white">
                  Seletor de Aulas de Xadrez em Vídeo
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-black uppercase tracking-wider">
                  {selectedVideo.lessonBadge}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Segundo Plano Ativo
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Clique diretamente em 'Aula 1', 'Aula 2' ou pesquise para carregar o vídeo instantaneamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenOfficialPlaylist}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <ListVideo className="w-4 h-4" />
              <span>Playlist no YouTube ↗</span>
            </button>

            {onGoToBoard && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onGoToBoard();
                }}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>Praticar no Tabuleiro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {notifSuccessMessage && (
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notifSuccessMessage}</span>
          </div>
        )}

        {/* DIRECT LESSON SELECTOR BAR (Aula 1, Aula 2, Aula 3...) */}
        <div className="pt-2 border-t border-red-500/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-red-300 uppercase tracking-wider flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span>Aulas em Destaque (Clique para carregar na hora):</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Vídeo ativo: <strong className="text-white">{selectedVideo.lessonBadge}</strong>
            </span>
          </div>

          {/* Horizontal Scrollable Aula Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CHESS_VIDEO_LESSONS.map((lesson) => {
              const isSelected = selectedVideo.id === lesson.id;
              const isCompleted = completedVideos.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  id={`btn-select-lesson-${lesson.lessonNumber}`}
                  onClick={() => handleSelectVideo(lesson)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white ring-2 ring-red-400 shadow-md'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={`${lesson.lessonBadge}: ${lesson.title}`}
                >
                  <Play className={`w-3 h-3 ${isSelected ? 'fill-current text-white' : 'text-red-500'}`} />
                  <span>{lesson.lessonBadge}</span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                </button>
              );
            })}

            <button
              onClick={() => {
                soundEffects.playClick();
                setShowCustomModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer border border-slate-700"
            >
              <Plus className="w-3 h-3 text-rose-400" />
              <span>+ Outro Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player on Left, Playlist on Right */}
      <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4`}>
        {/* VIDEO EMBED & PLAYER SECTION */}
        <div
          ref={videoPlayerRef}
          id="chess-main-video-player"
          className={isTheaterMode ? 'w-full space-y-3 scroll-mt-20' : 'lg:col-span-8 space-y-3 scroll-mt-20'}
        >
          {/* Active Lesson Header Banner */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-black shrink-0 shadow-xs">
                {selectedVideo.lessonBadge}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {selectedVideo.title}
              </h3>
              {isPaused && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black shrink-0 flex items-center gap-1">
                  <Pause className="w-2.5 h-2.5" />
                  PAUSADO
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                  isPaused
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isPaused ? 'Retomar aula' : 'Pausar aula'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
              </button>

              <button
                onClick={() => setIsTheaterMode((prev) => !prev)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title={isTheaterMode ? 'Modo Normal' : 'Modo Expandido'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <a
                href={selectedVideo.youtubeUrl || CHESS_OFFICIAL_PLAYLIST.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Abrir no YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* YOUTUBE IFRAME EMBED PLAYER */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl aspect-video">
            {!isPaused ? (
              <iframe
                key={embedSrc}
                src={embedSrc}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-2xl shadow-lg">
                  <Pause className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {selectedVideo.lessonBadge}: {selectedVideo.title} (Em Pausa)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Vídeo pausado. Clique abaixo para retomar a exibição no player.
                  </p>
                </div>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 active:scale-95 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Retomar Reprodução do Vídeo</span>
                </button>
              </div>
            )}
          </div>

          {/* Player Quick Controls: Prev / Next / Direct External Open */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevVideo}
                disabled={!hasPrev}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Aula Anterior</span>
              </button>

              <button
                onClick={handleNextVideo}
                disabled={!hasNext}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Próxima Aula</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleOpenYoutubeDirectly(selectedVideo)}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span>Abrir {selectedVideo.lessonBadge} no YouTube ↗</span>
              </button>
            </div>
          </div>

          {/* Video Information & XP Reward Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">
                    {selectedVideo.lessonBadge}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    {selectedVideo.categoryLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                    {selectedVideo.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">⏱️ {selectedVideo.duration}</span>
                  <span className="text-xs text-slate-400 font-medium">• {selectedVideo.channel}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">{selectedVideo.title}</h3>
              </div>

              {/* Controls: Mark as Completed */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleMarkAsCompleted(selectedVideo)}
                  disabled={isCurrentCompleted}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                    isCurrentCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
                  }`}
                >
                  {isCurrentCompleted ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{selectedVideo.lessonBadge} Concluída (+{selectedVideo.xpReward} XP)</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Concluir {selectedVideo.lessonBadge} (+{selectedVideo.xpReward} XP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {selectedVideo.description}
            </p>

            {/* Key Takeaways */}
            {selectedVideo.keyTakeaways && selectedVideo.keyTakeaways.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Destaques da {selectedVideo.lessonBadge}:</span>
                </h4>
                <ul className="space-y-1.5">
                  {selectedVideo.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 font-medium">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* PLAYLIST LIST SECTION (Right column) */}
        {!isTheaterMode && (
          <div className="lg:col-span-4 space-y-3">
            {/* Search & Direct Dropdown Jump */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <ListVideo className="w-4 h-4 text-red-500" />
                  <span>Pesquisar Videoaulas</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-400">
                  {completedVideos.length}/{CHESS_VIDEO_LESSONS.length} Concluídas
                </span>
              </div>

              {/* Direct Dropdown Quick Jump */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Ir direto para a aula:
                </label>
                <select
                  value={selectedVideo.id}
                  onChange={(e) => {
                    const target = CHESS_VIDEO_LESSONS.find((v) => v.id === e.target.value);
                    if (target) handleSelectVideo(target);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-red-500 cursor-pointer"
                >
                  {CHESS_VIDEO_LESSONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.lessonBadge}: {v.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar ex: 'Aula 1', 'peças', 'mate'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'iniciante', label: 'Básico' },
                  { id: 'pecas', label: 'Peças' },
                  { id: 'especiais', label: 'Especiais' },
                  { id: 'aberturas', label: 'Abertura' },
                  { id: 'mates', label: 'Mates' },
                  { id: 'taticas', label: 'Táticas' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveCategory(cat.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Lessons List with Prominent Aula Numbers */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredVideos.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">Nenhuma videoaula encontrada para sua busca.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                filteredVideos.map((video) => {
                  const isSelected = video.id === selectedVideo.id;
                  const isCompleted = completedVideos.includes(video.id);

                  return (
                    <div
                      key={video.id}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-start gap-3 group relative ${
                        isSelected
                          ? 'bg-slate-800 border-red-500/80 shadow-lg shadow-red-950/40 ring-1 ring-red-500/50'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                      }`}
                    >
                      {/* Clickable Thumbnail with Direct Play Icon */}
                      <div
                        onClick={() => handleSelectVideo(video, false, false)}
                        className="relative w-20 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center cursor-pointer group/thumb"
                        title={`Clique para assistir ${video.lessonBadge}`}
                      >
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                          />
                        ) : (
                          <span className="text-xl">♟️</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/10 transition">
                          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                            {isSelected && isPaused ? (
                              <Pause className="w-3 h-3 text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            )}
                          </div>
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] font-bold text-white rounded">
                          {video.duration}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-black truncate">
                            {video.lessonBadge}
                          </span>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              Feita
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400 shrink-0">
                              +{video.xpReward} XP
                            </span>
                          )}
                        </div>

                        <h5
                          onClick={() => handleSelectVideo(video, false, false)}
                          className="text-xs font-bold text-white line-clamp-2 leading-snug cursor-pointer hover:text-red-300 transition"
                          title="Clique para ir para o vídeo"
                        >
                          {video.title}
                        </h5>

                        <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            {/* Botão Assistir / Ir para o Vídeo */}
                            <button
                              onClick={() => handleSelectVideo(video, false, false)}
                              className={`px-2 py-0.8 rounded-lg text-[10px] sm:text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                                isSelected && !isPaused
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              }`}
                              title={`Ir para o player e assistir ${video.lessonBadge}`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isSelected && !isPaused ? 'Assistindo' : 'Assistir'}</span>
                            </button>

                            {/* Botão de Pausar / Ir para Vídeo Pausado */}
                            <button
                              onClick={() => handleSelectVideo(video, false, true)}
                              className={`px-2 py-0.8 rounded-lg text-[10px] sm:text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                                isSelected && isPaused
                                  ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-amber-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                              }`}
                              title="Pausar / Ir para o vídeo"
                            >
                              <Pause className="w-3 h-3" />
                              <span>{isSelected && isPaused ? 'Pausado' : 'Pausar'}</span>
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenYoutubeDirectly(video);
                            }}
                            className="px-2 py-0.8 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[10px] font-black flex items-center gap-1 shadow transition cursor-pointer ml-auto"
                            title="Abrir no YouTube"
                          >
                            <Tv className="w-3 h-3" />
                            <span>YouTube ↗</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom URL Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              Colar Vídeo ou Playlist do YouTube
            </h3>
            <p className="text-xs text-slate-400">
              Cole o link de qualquer vídeo ou playlist de xadrez do YouTube para assistir no aplicativo.
            </p>

            <form onSubmit={handleAddCustomVideo} className="space-y-3">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Ex: https://www.youtube.com/playlist?list=... ou watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-red-500 placeholder-slate-600"
              />

              {customError && <p className="text-xs text-red-400 font-medium">{customError}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition cursor-pointer shadow-md"
                >
                  Carregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

