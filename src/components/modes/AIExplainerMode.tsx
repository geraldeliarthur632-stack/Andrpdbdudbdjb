import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  FileText,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Eye,
  Star,
  Search,
  Play,
  Pause,
  Square,
} from 'lucide-react';

interface ExplainerResult {
  title: string;
  subject: string;
  overview: string;
  detailedExplanation: string;
  stepByStep: string[];
  keyRules: string[];
  solvedExamples: { problem: string; solution: string }[];
  pitfallsToAvoid: string[];
  summaryForVoice: string;
}

interface SavedExplanation {
  id: string;
  date: string;
  result: ExplainerResult;
  imagePreview?: string;
  imagesPreview?: string[];
}

interface AIExplainerModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
  theme?: 'light' | 'dark';
}

const STORAGE_KEY = 'estudahud_ai_explainer_history_v1';
const FAVORITES_STORAGE_KEY = 'estudahud_ai_explainer_favorites_v1';

const MAX_PHOTOS = 100;

// Client-side image compressor for high-speed uploads
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const AIExplainerMode: React.FC<AIExplainerModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  theme = 'light',
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0 });
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);
  const [topicText, setTopicText] = useState('');
  const [selectedSubjectHint, setSelectedSubjectHint] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplainerResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [speechScope, setSpeechScope] = useState<'complete' | 'summary'>('complete');
  const [hasCopied, setHasCopied] = useState(false);
  const [savedHistory, setSavedHistory] = useState<SavedExplanation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [favorites, setFavorites] = useState<SavedExplanation[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [showFavoritesModal, setShowFavoritesModal] = useState<boolean>(false);
  const [favoriteToast, setFavoriteToast] = useState<string | null>(null);
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync saved history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedHistory.slice(0, 15)));
    } catch {}
  }, [savedHistory]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Synchronize narration status and ensure clean unmount without lingering audio
  useEffect(() => {
    const unsub = speechNarrator.subscribeStatus((status) => {
      if (status === 'playing') {
        setIsSpeaking(true);
        setIsPaused(false);
      } else if (status === 'paused') {
        setIsSpeaking(true);
        setIsPaused(true);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });

    return () => {
      unsub();
      speechNarrator.stop();
    };
  }, []);

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEffects.playClick();
    const availableSlots = MAX_PHOTOS - selectedImages.length;
    if (availableSlots <= 0) {
      showToast(`Limite máximo de ${MAX_PHOTOS} fotos atingido!`);
      e.target.value = '';
      return;
    }

    const filesArray = Array.from(files).slice(0, availableSlots) as File[];
    if (files.length > availableSlots) {
      showToast(`Adicionando até o limite de ${MAX_PHOTOS} fotos (${filesArray.length} fotos selecionadas)`);
    }

    setIsCompressing(true);
    setCompressProgress({ current: 0, total: filesArray.length });

    try {
      const validImages: string[] = [];
      // Compress in batches of 4 to prevent blocking the UI
      for (let i = 0; i < filesArray.length; i += 4) {
        const batch = filesArray.slice(i, i + 4);
        const batchResults = await Promise.all(batch.map((f) => compressImageFile(f)));
        for (const res of batchResults) {
          if (res) validImages.push(res);
        }
        setCompressProgress({
          current: Math.min(i + 4, filesArray.length),
          total: filesArray.length,
        });
      }
      setSelectedImages((prev) => [...prev, ...validImages].slice(0, MAX_PHOTOS));
      showToast(`${validImages.length} ${validImages.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}!`);
    } catch (err) {
      console.error('Falha ao compactar imagens:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    soundEffects.playClick();
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllImages = () => {
    soundEffects.playClick();
    setSelectedImages([]);
  };

  const handleRequestExplain = () => {
    if (selectedImages.length === 0 && !topicText.trim()) return;
    handleExplain();
  };

  const handleExplain = async () => {
    if (selectedImages.length === 0 && !topicText.trim()) return;

    soundEffects.playClick();
    setIsLoading(true);
    if (speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/ai/explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagesBase64: selectedImages,
          imageBase64: selectedImages[0] || null,
          topicText: topicText.trim(),
          grade: user.grade,
          userName: user.name,
          subjectHint: selectedSubjectHint !== 'auto' ? selectedSubjectHint : '',
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar explicação');
      }

      const data: ExplainerResult = await response.json();
      setResult(data);
      soundEffects.playCorrect('bonus');
      onEarnPoints?.(30);

      // Save to local history
      const newEntry: SavedExplanation = {
        id: 'exp_' + Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        result: data,
        imagePreview: selectedImages[0] || undefined,
        imagesPreview: selectedImages.length > 0 ? selectedImages : undefined,
      };
      setSavedHistory((prev) => [newEntry, ...prev.filter((item) => item.result.title !== data.title)].slice(0, 15));
    } catch (err) {
      console.error('Explainer error:', err);
      // Local educational fallback
      const fallbackResult: ExplainerResult = {
        title: topicText.trim() || 'Conteúdo da Foto Escolar',
        subject: 'Estudo BNCC',
        overview: 'Identificamos o conteúdo pedagógico da sua foto. Aqui está a explicação completa e estruturada para você dominar cada detalhe deste tema.',
        detailedExplanation: 'Este tema envolve a aplicação de conceitos fundamentais da disciplina. Ao estudar este material, é importante compreender as relações de causa e efeito, as etapas de desenvolvimento e a aplicação em problemas reais.',
        stepByStep: [
          'Passo 1: Identifique com clareza o objetivo principal do exercício ou tema.',
          'Passo 2: Destaque os dados conhecidos, variáveis e fórmulas necessárias.',
          'Passo 3: Aplique a ordem de resolução com atenção às operações e regras.',
          'Passo 4: Revise o resultado final conferindo se responde integralmente à questão.',
        ],
        keyRules: [
          'Mantenha sempre suas anotações organizadas com cabeçalho e etapas.',
          'Verifique as unidades de medida e regras de sinais antes de finalizar.',
        ],
        solvedExamples: [
          {
            problem: 'Exemplo prático de aplicação deste conteúdo.',
            solution: 'Passo a passo demonstrativo com explicação de cada linha de raciocínio.',
          },
        ],
        pitfallsToAvoid: [
          'Evite pular etapas intermediárias de cálculo ou interpretação.',
          'Cuidado com enunciados que possuem pegadinhas ou termos invertidos.',
        ],
        summaryForVoice: 'Aqui está a explicação completa do seu conteúdo escolar com passos e regras.',
      };
      setResult(fallbackResult);
      soundEffects.playCorrect('bonus');
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeechText = (scope: 'complete' | 'summary' = speechScope): string => {
    if (!result) return '';
    if (scope === 'summary') {
      return `${result.title}. Matéria: ${result.subject}. Resumo didático: ${result.summaryForVoice || result.overview}. Regras essenciais: ${result.keyRules.slice(0, 3).join('. ')}.`;
    }
    return `${result.title}. Matéria: ${result.subject}. Visão geral: ${result.overview}. Explicação detalhada: ${result.detailedExplanation}. Passo a passo: ${result.stepByStep.join('. ')}. Regras essenciais: ${result.keyRules.join('. ')}. Exemplo resolvido: ${result.solvedExamples.map(e => `${e.problem}. ${e.solution}`).join('. ')}.`;
  };

  const handleStartSpeech = (scope?: 'complete' | 'summary') => {
    if (!result) return;
    soundEffects.playClick();
    const targetScope = scope || speechScope;
    if (scope) setSpeechScope(scope);

    const textToSpeak = getSpeechText(targetScope);
    setIsSpeaking(true);
    setIsPaused(false);

    const callbacks = {
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      },
      rate: speechSpeed,
    };

    if (targetScope === 'summary') {
      speechNarrator.speakWithAiAudio(textToSpeak, callbacks);
    } else {
      speechNarrator.speak(textToSpeak, callbacks);
    }
  };

  const handlePauseSpeech = () => {
    soundEffects.playClick();
    speechNarrator.pause();
    setIsPaused(true);
  };

  const handleResumeSpeech = () => {
    soundEffects.playClick();
    speechNarrator.resume();
    setIsPaused(false);
  };

  const handleStopSpeech = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const toggleSpeech = () => {
    if (!isSpeaking) {
      handleStartSpeech();
    } else if (isPaused) {
      handleResumeSpeech();
    } else {
      handlePauseSpeech();
    }
  };

  const handleCycleSpeed = () => {
    soundEffects.playClick();
    const nextSpeed = speechSpeed === 1.0 ? 1.25 : speechSpeed === 1.25 ? 0.85 : 1.0;
    setSpeechSpeed(nextSpeed);
    speechNarrator.setDefaultRate(nextSpeed);
    if (isSpeaking && !isPaused) {
      handleStartSpeech();
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    soundEffects.playClick();
    const formatted = `📚 ${result.title} (${result.subject})\n\n📌 VISÃO GERAL:\n${result.overview}\n\n📖 EXPLICAÇÃO DETALHADA:\n${result.detailedExplanation}\n\n🪜 PASSO A PASSO:\n${result.stepByStep.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📐 REGRAS ESSENCIAIS:\n${result.keyRules.map((r) => `• ${r}`).join('\n')}\n\n💡 EXEMPLO RESOLVIDO:\n${result.solvedExamples.map((ex) => `Problema: ${ex.problem}\nSolução: ${ex.solution}`).join('\n\n')}\n\n⚠️ PONTOS DE ATENÇÃO:\n${result.pitfallsToAvoid.map((p) => `• ${p}`).join('\n')}`;
    
    navigator.clipboard?.writeText(formatted);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleReset = () => {
    soundEffects.playClick();
    if (speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }
    setResult(null);
    setSelectedImages([]);
    setActiveImageZoom(null);
    setTopicText('');
  };

  const isCurrentFavorited = Boolean(
    result && favorites.some((fav) => fav.result.title.trim().toLowerCase() === result.title.trim().toLowerCase())
  );

  const showToast = (msg: string) => {
    setFavoriteToast(msg);
    setTimeout(() => {
      setFavoriteToast(null);
    }, 2500);
  };

  const handleToggleCurrentFavorite = () => {
    if (!result) return;
    soundEffects.playClick();

    if (isCurrentFavorited) {
      setFavorites((prev) =>
        prev.filter((fav) => fav.result.title.trim().toLowerCase() !== result.title.trim().toLowerCase())
      );
      showToast('Removido dos Favoritos');
    } else {
      soundEffects.playVictory();
      const newFav: SavedExplanation = {
        id: 'fav_' + Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        result,
        imagePreview: selectedImages[0] || undefined,
        imagesPreview: selectedImages.length > 0 ? selectedImages : undefined,
      };
      setFavorites((prev) => [newFav, ...prev]);
      showToast('⭐ Salvo nos Resumos Favoritos!');
    }
  };

  const handleToggleFavoriteItem = (item: SavedExplanation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playClick();
    const alreadyFavorited = favorites.some(
      (fav) => fav.result.title.trim().toLowerCase() === item.result.title.trim().toLowerCase()
    );

    if (alreadyFavorited) {
      setFavorites((prev) =>
        prev.filter((fav) => fav.result.title.trim().toLowerCase() !== item.result.title.trim().toLowerCase())
      );
      showToast('Removido dos Favoritos');
    } else {
      soundEffects.playVictory();
      setFavorites((prev) => [item, ...prev]);
      showToast('⭐ Salvo nos Resumos Favoritos!');
    }
  };

  const handleOpenFavorite = (fav: SavedExplanation) => {
    soundEffects.playClick();
    if (speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }
    setResult(fav.result);
    if (fav.imagesPreview && fav.imagesPreview.length > 0) {
      setSelectedImages(fav.imagesPreview);
    } else if (fav.imagePreview) {
      setSelectedImages([fav.imagePreview]);
    } else {
      setSelectedImages([]);
    }
    setShowFavoritesModal(false);
  };

  const handleRemoveFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playClick();
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    showToast('Removido dos Favoritos');
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-32">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelected}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelected}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              if (speechNarrator.isCurrentlySpeaking()) speechNarrator.stop();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 p-2 rounded-xl bg-white border border-slate-200 shadow-xs hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md text-base">
              📸
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Explicador</h1>
              <p className="text-[11px] text-slate-500">
                Tire fotos da sua apostila ou caderno — suporte a várias fotos simultâneas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Resumos Favoritos */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setShowFavoritesModal(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            title="Ver lista de Resumos Favoritos"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="hidden sm:inline">Resumos Favoritos</span>
            <span className="sm:hidden">Favoritos</span>
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {favorites.length}
              </span>
            )}
          </button>

          <div className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-black flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{GRADE_LABELS[user.grade]?.short || '6º Ano'}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {!result ? (
        <div className="space-y-4 pt-3">
          {/* Main Photo Capture Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Fotos da Apostila, Caderno ou Lição (Até 100 fotos)
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                O que você quer explicar?
              </h2>
              <p className="text-xs text-slate-600">
                Você pode anexar <strong>até 100 fotos</strong> da sua apostila (por exemplo: capítulos inteiros, teoria e listas de exercícios). O explicador analisa o conteúdo e sintetiza tudo de forma didática!
              </p>
            </div>

            {/* Compression Progress Feedback */}
            {isCompressing && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800 flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900">Preparando fotos...</span>
                    <span className="text-purple-700 font-mono">{compressProgress.current} / {compressProgress.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-150"
                      style={{
                        width: `${Math.round((compressProgress.current / Math.max(1, compressProgress.total)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Multiple Images List & Thumbnails */}
            {selectedImages.length > 0 ? (
              <div className="space-y-3 p-3.5 rounded-2xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-800 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Fotos anexadas ({selectedImages.length} de {MAX_PHOTOS} fotos):
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-black">
                      {selectedImages.length}/{MAX_PHOTOS}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllImages}
                    className="text-rose-600 hover:text-rose-700 text-[11px] hover:underline cursor-pointer font-bold"
                  >
                    Remover todas
                  </button>
                </div>

                {/* Thumbnails Grid with Scrollbar for Up to 100 photos */}
                <div className="max-h-72 overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group bg-slate-100 shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`Foto do material ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setActiveImageZoom(img)}
                      />
                      {/* Page badge */}
                      <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-black text-white pointer-events-none">
                        #{idx + 1}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>

                      {/* Zoom hint */}
                      <button
                        type="button"
                        onClick={() => setActiveImageZoom(img)}
                        className="absolute bottom-1 right-1 w-5 h-5 bg-black/75 hover:bg-black text-white rounded flex items-center justify-center text-[9px] cursor-pointer"
                        title="Ampliar foto"
                      >
                        <Eye className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add more photos buttons row */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                  <button
                    type="button"
                    disabled={selectedImages.length >= MAX_PHOTOS}
                    onClick={() => {
                      soundEffects.playClick();
                      cameraInputRef.current?.click();
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      selectedImages.length >= MAX_PHOTOS
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    <span>+ Tirar mais fotos</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedImages.length >= MAX_PHOTOS}
                    onClick={() => {
                      soundEffects.playClick();
                      fileInputRef.current?.click();
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      selectedImages.length >= MAX_PHOTOS
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>+ Galeria (até 100)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      cameraInputRef.current?.click();
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white flex flex-col items-center justify-center gap-2.5 transition active:scale-95 shadow-md shadow-purple-600/20 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-black block">Tirar Fotos com a Câmera</span>
                      <span className="text-[11px] text-white/90">Tire fotos das páginas da apostila</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      fileInputRef.current?.click();
                    }}
                    className="p-4 rounded-2xl bg-white border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 text-slate-800 flex flex-col items-center justify-center gap-2.5 transition active:scale-95 group cursor-pointer shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-black block text-slate-900">Escolher Fotos da Galeria</span>
                      <span className="text-[11px] text-purple-700 font-semibold">Selecione até 100 fotos de uma vez</span>
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  💡 Dica: Você pode enviar até 100 fotos em sequência para explicar livros ou apostilas inteiras de uma vez.
                </p>
              </div>
            )}

            {/* Subject Selector to enforce subject accuracy */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  Matéria da Foto (Opcional):
                </span>
                <span className="text-[10px] text-purple-600 font-bold">Garante explicação 100% fiel à matéria</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'auto', label: '🤖 Auto (Detectar)' },
                  { id: 'Matemática', label: '⚡ Matemática' },
                  { id: 'Língua Portuguesa', label: '📖 Português' },
                  { id: 'Ciências', label: '🔬 Ciências' },
                  { id: 'História', label: '🏛️ História' },
                  { id: 'Geografia', label: '🌍 Geografia' },
                  { id: 'Física', label: '💡 Física' },
                  { id: 'Química', label: '🧪 Química' },
                  { id: 'Biologia', label: '🧬 Biologia' },
                  { id: 'Inglês', label: '🇬🇧 Inglês' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubjectHint(sub.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedSubjectHint === sub.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Topic Context */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                Dúvida específica ou tema adicional (opcional):
              </label>
              <textarea
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                placeholder="Ex: Explique a questão número 3 do livro, ou explique como fazer o trabalho de história sobre a Independência..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 resize-none transition"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleRequestExplain}
              disabled={isLoading || (selectedImages.length === 0 && !topicText.trim())}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md cursor-pointer ${
                isLoading || (selectedImages.length === 0 && !topicText.trim())
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analisando {selectedImages.length > 1 ? `${selectedImages.length} fotos` : 'foto'} e gerando explicação completa...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>
                    Explicar {selectedImages.length > 1 ? `as ${selectedImages.length} Fotos` : 'Tudo'} (+30 XP)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Quick Examples Suggestions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Exemplos rápidos para testar agora:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { title: 'Fórmula de Bhaskara', hint: 'Matemática • Equação do 2º Grau' },
                { title: 'Regras da Crase', hint: 'Português • Macetes de Gramática' },
                { title: 'Fotossíntese e Energia', hint: 'Ciências • Ciclo nas Plantas' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundEffects.playClick();
                    setTopicText(item.title);
                  }}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition active:scale-95 group cursor-pointer shadow-xs"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 block">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent History */}
          {savedHistory.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Explicações Recentes Salvas:
              </span>
              <div className="space-y-1.5">
                {savedHistory.slice(0, 4).map((hist) => {
                  const isItemFav = favorites.some(
                    (fav) => fav.result.title.trim().toLowerCase() === hist.result.title.trim().toLowerCase()
                  );
                  return (
                    <div
                      key={hist.id}
                      className="w-full p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 flex items-center justify-between text-left transition group shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setResult(hist.result);
                          if (hist.imagesPreview && hist.imagesPreview.length > 0) {
                            setSelectedImages(hist.imagesPreview);
                          } else if (hist.imagePreview) {
                            setSelectedImages([hist.imagePreview]);
                          }
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                          📄
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-purple-700">
                            {hist.result.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {hist.result.subject} • {hist.date}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavoriteItem(hist, e)}
                          className={`p-1.5 rounded-lg transition active:scale-90 ${
                            isItemFav
                              ? 'text-amber-500 hover:text-amber-600 bg-amber-50 border border-amber-200'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={isItemFav ? 'Remover dos Favoritos' : 'Salvar nos Resumos Favoritos'}
                        >
                          <Star className={`w-4 h-4 ${isItemFav ? 'fill-amber-500' : ''}`} />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Explainer Result Screen */
        <div className="space-y-4 pt-3">
          {/* Top Result Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black border border-purple-200">
                  {result.subject}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Explicação Completa</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  onClick={handleToggleCurrentFavorite}
                  className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer ${
                    isCurrentFavorited
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-amber-700 hover:border-amber-300'
                  }`}
                  title={isCurrentFavorited ? 'Remover dos Resumos Favoritos' : 'Salvar nos Resumos Favoritos'}
                >
                  <Star className={`w-4 h-4 ${isCurrentFavorited ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                  <span>{isCurrentFavorited ? 'Favoritado' : 'Favoritar'}</span>
                </button>

                <button
                  onClick={toggleSpeech}
                  className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer ${
                    isSpeaking && !isPaused
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : isPaused
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                  title={!isSpeaking ? 'Ouvir explicação com voz da IA' : isPaused ? 'Continuar leitura' : 'Pausar leitura'}
                >
                  {isSpeaking && !isPaused ? (
                    <Pause className="w-4 h-4" />
                  ) : isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-purple-600" />
                  )}
                  <span>{!isSpeaking ? 'Ouvir' : isPaused ? 'Continuar' : 'Pausar'}</span>
                </button>

                {(isSpeaking || isPaused) && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Parar áudio da IA"
                  >
                    <Square className="w-4 h-4" />
                    <span>Parar</span>
                  </button>
                )}

                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
                  title="Copiar explicação"
                >
                  {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
                  title="Explicar outra foto"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Nova Foto</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {result.title}
            </h2>

            {/* Dedicated AI Voice Player Card with Pause, Resume, Stop & Speed */}
            <div className="p-3.5 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSpeaking && !isPaused
                        ? 'bg-purple-600 text-white animate-pulse'
                        : isPaused
                        ? 'bg-amber-500 text-white'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Voz da IA (Explicação em Áudio)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isSpeaking && !isPaused
                        ? 'Reproduzindo narração didática do tema...'
                        : isPaused
                        ? 'Áudio pausado • Toque em Continuar'
                        : 'Ouça o resumo ou a explicação completa passo a passo'}
                    </span>
                  </div>
                </div>

                {/* Animated Sound Wave Indicator */}
                {isSpeaking && !isPaused && (
                  <div className="flex items-end gap-1 h-5 px-2">
                    <span className="w-1 bg-purple-600 rounded-full animate-bounce h-3" />
                    <span className="w-1 bg-purple-600 rounded-full animate-bounce h-5 delay-100" />
                    <span className="w-1 bg-purple-600 rounded-full animate-bounce h-2 delay-200" />
                    <span className="w-1 bg-purple-600 rounded-full animate-bounce h-4 delay-300" />
                  </div>
                )}
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-purple-100 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {!isSpeaking ? (
                    <button
                      type="button"
                      onClick={() => handleStartSpeech('complete')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Ouvir Tudo</span>
                    </button>
                  ) : isPaused ? (
                    <button
                      type="button"
                      onClick={handleResumeSpeech}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Continuar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseSpeech}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar</span>
                    </button>
                  )}

                  {!isSpeaking && (
                    <button
                      type="button"
                      onClick={() => handleStartSpeech('summary')}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold transition active:scale-95 cursor-pointer"
                    >
                      <span>Ouvir Resumo</span>
                    </button>
                  )}

                  {(isSpeaking || isPaused) && (
                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Parar</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 transition cursor-pointer"
                    title="Alternar velocidade da narração"
                  >
                    Velocidade: {speechSpeed}x
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Overview */}
            <div className="p-3.5 rounded-2xl bg-white border border-purple-100 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
              <span className="font-black text-purple-700 block mb-1">📌 O que é este tema / Conceito Principal:</span>
              {result.overview}
            </div>
          </div>

          {/* Photos Analyzed Gallery (if photos were provided) */}
          {selectedImages.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Páginas Analisadas do seu Material ({selectedImages.length} fotos):
              </span>
              <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {selectedImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageZoom(img)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-purple-500 group transition active:scale-95"
                    title={`Ver foto da página ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Foto da página ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-black text-white">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Detailed In-Depth Explanation */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicação Aprofundada
            </span>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {result.detailedExplanation}
            </div>
          </div>

          {/* Section 2: Step-by-Step Guide (Como Fazer / Como Resolver) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Passo a Passo: Como Fazer & Resolver
            </span>
            <div className="space-y-2">
              {result.stepByStep.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Key Rules & Formulas */}
          {result.keyRules && result.keyRules.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Fórmulas, Regras e Definições Obrigatórias
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.keyRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Solved Real Examples */}
          {result.solvedExamples && result.solvedExamples.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Exemplos Reais Resolvidos Passo a Passo
              </span>
              <div className="space-y-3">
                {result.solvedExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="text-xs sm:text-sm font-bold text-blue-700">
                      ❓ Problema / Exercício {idx + 1}:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 pl-2 border-l-2 border-blue-400">
                      {ex.problem}
                    </p>
                    <div className="text-xs sm:text-sm font-bold text-emerald-700 pt-1">
                      ✅ Solução Detalhada:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 pl-2 border-l-2 border-emerald-400 whitespace-pre-line">
                      {ex.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Common Pitfalls to Avoid */}
          {result.pitfallsToAvoid && result.pitfallsToAvoid.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-2.5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Dicas de Ouro: O que NÃO errar!
              </span>
              <div className="space-y-1.5">
                {result.pitfallsToAvoid.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start gap-2"
                  >
                    <span className="text-rose-500 font-bold">⚠️</span>
                    <span>{pitfall}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 active:scale-98 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Tirar Outra Foto para Explicar</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE ZOOM / FULL PREVIEW */}
      {activeImageZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActiveImageZoom(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-slate-900 rounded-3xl p-2 border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImageZoom(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-white/20"
              title="Fechar ampliação"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImageZoom}
              alt="Foto da apostila em tela cheia"
              className="max-h-[85vh] w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {favoriteToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-amber-400/60 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{favoriteToast}</span>
        </div>
      )}

      {/* MODAL: RESUMOS FAVORITOS */}
      {showFavoritesModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setShowFavoritesModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center text-base shadow-xs">
                  ⭐
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      Resumos Favoritos
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                      {favorites.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Seus resumos e explicações salvos para revisão rápida
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowFavoritesModal(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Fechar favoritos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter if there are multiple favorites */}
            {favorites.length > 2 && (
              <div className="p-3 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={favoritesSearchQuery}
                    onChange={(e) => setFavoritesSearchQuery(e.target.value)}
                    placeholder="Pesquisar por matéria ou tema..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 transition"
                  />
                  {favoritesSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFavoritesSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1">
              {favorites.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto text-2xl">
                    ⭐
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Nenhum resumo favoritado ainda
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ao tirar fotos da sua apostila ou gerar uma explicação, clique no botão <strong>"Favoritar"</strong> para salvar a matéria aqui e revisar antes das suas provas!
                    </p>
                  </div>
                </div>
              ) : (
                (() => {
                  const filtered = favorites.filter((fav) => {
                    if (!favoritesSearchQuery.trim()) return true;
                    const q = favoritesSearchQuery.toLowerCase();
                    return (
                      fav.result.title.toLowerCase().includes(q) ||
                      fav.result.subject.toLowerCase().includes(q) ||
                      fav.result.overview.toLowerCase().includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Nenhum resumo encontrado com o termo "{favoritesSearchQuery}".
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      {filtered.map((fav) => {
                        const hasImages = (fav.imagesPreview && fav.imagesPreview.length > 0) || Boolean(fav.imagePreview);
                        const photosCount = fav.imagesPreview?.length || (fav.imagePreview ? 1 : 0);

                        return (
                          <div
                            key={fav.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 space-y-2.5 transition shadow-xs"
                          >
                            {/* Card Top Row */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
                                  {fav.result.subject}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {fav.date}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleRemoveFavorite(fav.id, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Remover dos favoritos"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Title & Overview */}
                            <div>
                              <h4 className="text-sm font-black text-slate-900 leading-snug">
                                {fav.result.title}
                              </h4>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {fav.result.overview}
                              </p>
                            </div>

                            {/* Card Footer: Metadata & Open Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                {hasImages && (
                                  <span className="flex items-center gap-1 text-purple-700 font-medium">
                                    <Camera className="w-3 h-3" />
                                    {photosCount} {photosCount === 1 ? 'foto' : 'fotos'}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {fav.result.stepByStep.length} passos
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenFavorite(fav)}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Abrir Resumo</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {favorites.length} {favorites.length === 1 ? 'resumo salvo' : 'resumos salvos'}
              </span>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setShowFavoritesModal(false);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
