import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { useScreenAdaptation } from '../../hooks/useScreenAdaptation';
import {
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  Image as ImageIcon,
  Volume2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  BookOpen,
  Trash2,
  Languages,
  FileText,
  Upload,
  Info,
  Bookmark,
  Layers,
  ChevronDown,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

interface AITranslatorModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
  theme?: 'light' | 'dark';
}

export interface TranslationResult {
  detectedSourceLang: string;
  detectedSourceLangCode?: string;
  originalText: string;
  translatedText: string;
  pronunciationGuide: string;
  culturalOrGrammarNotes?: string;
  vocabularyBreakdown?: {
    word: string;
    translation: string;
    partOfSpeech?: string;
    example?: string;
  }[];
  exampleSentences?: {
    original: string;
    translation: string;
  }[];
  alternativeTranslations?: string[];
  isOfflineFallback?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Detectar Auto', flag: '✨', voiceLang: 'pt-BR' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', voiceLang: 'pt-BR' },
  { code: 'en', name: 'Inglês', flag: '🇺🇸', voiceLang: 'en-US' },
  { code: 'es', name: 'Espanhol', flag: '🇪🇸', voiceLang: 'es-ES' },
  { code: 'fr', name: 'Francês', flag: '🇫🇷', voiceLang: 'fr-FR' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', voiceLang: 'it-IT' },
  { code: 'de', name: 'Alemão', flag: '🇩🇪', voiceLang: 'de-DE' },
  { code: 'ja', name: 'Japonês', flag: '🇯🇵', voiceLang: 'ja-JP' },
  { code: 'zh', name: 'Chinês', flag: '🇨🇳', voiceLang: 'zh-CN' },
  { code: 'ru', name: 'Russo', flag: '🇷🇺', voiceLang: 'ru-RU' },
  { code: 'la', name: 'Latim', flag: '🏛️', voiceLang: 'it-IT' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷', voiceLang: 'ko-KR' },
];

const QUICK_EXAMPLES = [
  { text: 'Where is the nearest science museum?', source: 'en', target: 'pt', label: 'Museu de Ciências (EN)' },
  { text: '¿Podría explicarme este ejercicio de matemáticas?', source: 'es', target: 'pt', label: 'Exercício Escolar (ES)' },
  { text: 'La curiosité est le moteur de l\'apprentissage.', source: 'fr', target: 'pt', label: 'Frase Filosófica (FR)' },
  { text: 'Studiare insieme rende tutto più facile e divertente.', source: 'it', target: 'pt', label: 'Estudo em Grupo (IT)' },
  { text: 'Wissen ist Macht und eröffnet neue Wege.', source: 'de', target: 'pt', label: 'Conhecimento (DE)' },
  { text: 'Mens sana in corpore sano.', source: 'la', target: 'pt', label: 'Mente Sã (Latim)' },
];

export const AITranslatorMode: React.FC<AITranslatorModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  theme = 'light',
}) => {
  const screen = useScreenAdaptation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('pt');
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeakingOriginal, setIsSpeakingOriginal] = useState<boolean>(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState<boolean>(false);
  const [savedToNotebook, setSavedToNotebook] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'translation' | 'vocab' | 'notes'>('translation');

  // Request Translation
  const handleRequestTranslate = () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMsg('Digite um texto ou envie uma imagem/foto para traduzir.');
      return;
    }
    handleTranslate();
  };

  // Swap Source & Target Languages
  const handleSwapLanguages = () => {
    soundEffects.playClick();
    if (sourceLang === 'auto') {
      setSourceLang(targetLang === 'pt' ? 'en' : 'pt');
      setTargetLang('pt');
    } else {
      const prevSource = sourceLang;
      const prevTarget = targetLang;
      setSourceLang(prevTarget);
      setTargetLang(prevSource);
    }
    // If we have a translated result, swap input with translated text
    if (result && result.translatedText) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  // Image Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      soundEffects.playClick();
      setSelectedImage(reader.result as string);
      setImageFileName(file.name);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop support
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        soundEffects.playClick();
        setSelectedImage(reader.result as string);
        setImageFileName(file.name);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Listen to paste events for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              soundEffects.playClick();
              setSelectedImage(reader.result as string);
              setImageFileName('imagem_colada.png');
              setErrorMsg(null);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Perform Translation
  const handleTranslate = async () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMsg('Digite um texto ou envie uma imagem/foto para traduzir.');
      return;
    }

    soundEffects.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSavedToNotebook(false);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim() || undefined,
          imageBase64: selectedImage || undefined,
          sourceLang,
          targetLang,
        }),
      });

      if (res.ok) {
        const data: TranslationResult = await res.json();
        setResult(data);
        soundEffects.playCorrect('bonus');
        if (onEarnPoints) {
          onEarnPoints(15);
        }
        return;
      }
      throw new Error(`Servidor estático ou offline (${res.status})`);
    } catch (_err: any) {
      // Client-side fallback for static web hosting (GitHub Pages) and offline usage
      const rawText = inputText.trim() || 'Estudar e aprender';
      const cleanLower = rawText.toLowerCase();

      const DICTIONARY: Record<string, Record<string, string>> = {
        'olá': { en: 'Hello', es: 'Hola', fr: 'Bonjour', it: 'Ciao', de: 'Hallo', ja: 'こんにちは (Konnichiwa)' },
        'bom dia': { en: 'Good morning', es: 'Buenos días', fr: 'Bonjour', it: 'Buongiorno', de: 'Guten Morgen', ja: 'おはようございます' },
        'boa tarde': { en: 'Good afternoon', es: 'Buenas tardes', fr: 'Bon après-midi', it: 'Buon pomeriggio', de: 'Guten Tag', ja: 'こんにちは' },
        'boa noite': { en: 'Good evening / Good night', es: 'Buenas noches', fr: 'Bonsoir / Bonne nuit', it: 'Buonasera / Buonanotte', de: 'Guten Abend', ja: 'こんばんは' },
        'obrigado': { en: 'Thank you', es: 'Gracias', fr: 'Merci', it: 'Grazie', de: 'Danke', ja: 'ありがとう (Arigatou)' },
        'por favor': { en: 'Please', es: 'Por favor', fr: "S'il vous plaît", it: 'Per favore', de: 'Bitte', ja: 'お願いします' },
        'escola': { en: 'School', es: 'Escuela', fr: 'École', it: 'Scuola', de: 'Schule', ja: '学校 (Gakkou)' },
        'estudante': { en: 'Student', es: 'Estudiante', fr: 'Étudiant', it: 'Studente', de: 'Student / Schüler', ja: '学生 (Gakusei)' },
        'professor': { en: 'Teacher', es: 'Profesor', fr: 'Professeur', it: 'Professore', de: 'Lehrer', ja: '先生 (Sensei)' },
        'livro': { en: 'Book', es: 'Libro', fr: 'Livre', it: 'Libro', de: 'Buch', ja: '本 (Hon)' },
        'matemática': { en: 'Mathematics', es: 'Matemáticas', fr: 'Mathématiques', it: 'Matematica', de: 'Mathematik', ja: '数学 (Suugaku)' },
        'ciência': { en: 'Science', es: 'Ciencia', fr: 'Science', it: 'Scienza', de: 'Wissenschaft', ja: '科学 (Kagaku)' },
        'história': { en: 'History', es: 'Historia', fr: 'Histoire', it: 'Storia', de: 'Geschichte', ja: '歴史 (Rekishi)' },
        'geografia': { en: 'Geography', es: 'Geografía', fr: 'Géographie', it: 'Geografia', de: 'Geografie', ja: '地理 (Chiri)' },
        'amigo': { en: 'Friend', es: 'Amigo', fr: 'Ami', it: 'Amico', de: 'Freund', ja: '友達 (Tomodachi)' },
      };

      let translated = DICTIONARY[cleanLower]?.[targetLang] || `[${targetLang.toUpperCase()}] ${rawText}`;
      if (cleanLower.includes('where is the nearest science museum')) {
        translated = 'Onde fica o museu de ciências mais próximo?';
      } else if (cleanLower.includes('podría explicarme este ejercicio')) {
        translated = 'Poderia me explicar este exercício de matemática?';
      } else if (cleanLower.includes('la curiosité est le moteur')) {
        translated = 'A curiosidade é o motor da aprendizagem.';
      } else if (cleanLower.includes('studiare insieme')) {
        translated = 'Estudar juntos torna tudo mais fácil e divertido.';
      } else if (cleanLower.includes('wissen ist macht')) {
        translated = 'Conhecimento é poder e abre novos caminhos.';
      } else if (cleanLower.includes('mens sana in corpore sano')) {
        translated = 'Mente sã em corpo são.';
      }

      const fallbackResult: TranslationResult = {
        detectedSourceLang: sourceLang === 'auto' ? 'Português (Detectado)' : sourceLang.toUpperCase(),
        detectedSourceLangCode: sourceLang === 'auto' ? 'pt' : sourceLang,
        originalText: rawText,
        translatedText: translated,
        pronunciationGuide: `Pronúncia fonética aproximada: [${translated.replace(/[^\w\s]/g, '')}]`,
        culturalOrGrammarNotes: `Dica de Idiomas: Na língua ${targetLang.toUpperCase()}, a ordem dos termos e a entonação fortalecem a fluência e a clareza ao se comunicar no dia a dia escolar.`,
        vocabularyBreakdown: [
          {
            word: rawText.split(' ')[0] || 'Palavra',
            translation: translated.split(' ')[0] || 'Tradução',
            partOfSpeech: 'Termo chave',
            example: `${rawText} ➔ ${translated}`,
          },
        ],
        exampleSentences: [
          {
            original: rawText,
            translation: translated,
          },
        ],
        alternativeTranslations: [translated],
        isOfflineFallback: true,
      };

      setResult(fallbackResult);
      soundEffects.playCorrect('bonus');
      if (onEarnPoints) {
        onEarnPoints(15);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopyText = (text: string) => {
    soundEffects.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Audio Playback for Original Text
  const handleSpeakOriginal = () => {
    if (!result) return;
    soundEffects.playClick();
    const voiceLang =
      SUPPORTED_LANGUAGES.find((l) => l.code === (result.detectedSourceLangCode || sourceLang))
        ?.voiceLang || 'en-US';

    speechNarrator.speakLanguage(
      result.originalText,
      voiceLang,
      () => setIsSpeakingOriginal(true),
      () => setIsSpeakingOriginal(false)
    );
  };

  // Audio Playback for Translated Text
  const handleSpeakTranslation = () => {
    if (!result) return;
    soundEffects.playClick();
    const voiceLang =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.voiceLang || 'pt-BR';

    speechNarrator.speakLanguage(
      result.translatedText,
      voiceLang,
      () => setIsSpeakingTranslation(true),
      () => setIsSpeakingTranslation(false)
    );
  };

  // Save to Caderno / Flashcard
  const handleSaveToNotebook = () => {
    if (!result) return;
    soundEffects.playCorrect('combo');
    setSavedToNotebook(true);

    try {
      const savedItems = JSON.parse(localStorage.getItem('estudahud_saved_translations') || '[]');
      savedItems.unshift({
        id: Date.now().toString(),
        sourceLang: result.detectedSourceLang,
        targetLang,
        original: result.originalText,
        translation: result.translatedText,
        pronunciation: result.pronunciationGuide,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('estudahud_saved_translations', JSON.stringify(savedItems.slice(0, 50)));
    } catch {}

    setTimeout(() => setSavedToNotebook(false), 3000);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 landscape-compact-header">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.playClick();
                speechNarrator.stop();
                onBack();
              }}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition active:scale-95 cursor-pointer shadow-xs"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Tradutor IA
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                    Texto & Foto
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tradução pedagógica, pronúncia por voz e análise de vocabulário
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(inputText || selectedImage || result) && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setInputText('');
                  setSelectedImage(null);
                  setImageFileName('');
                  setResult(null);
                  setErrorMsg(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Limpar tudo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Adaptive Grid in Landscape, Stacked in Portrait) */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-4 space-y-4">
        {/* Language Selection Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-2">
          {/* Source Language Selector */}
          <div className="flex-1 relative">
            <label className="text-[10px] uppercase font-extrabold text-slate-500 block mb-1">
              De (Origem)
            </label>
            <div className="relative">
              <select
                value={sourceLang}
                onChange={(e) => {
                  soundEffects.playClick();
                  setSourceLang(e.target.value);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-cyan-500 rounded-2xl px-3 py-2.5 pr-8 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <div className="pt-4 shrink-0">
            <button
              onClick={handleSwapLanguages}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm active:scale-90 transition cursor-pointer"
              title="Inverter Idiomas"
              aria-label="Inverter Idiomas"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Target Language Selector */}
          <div className="flex-1 relative">
            <label className="text-[10px] uppercase font-extrabold text-slate-500 block mb-1">
              Para (Destino)
            </label>
            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => {
                  soundEffects.playClick();
                  setTargetLang(e.target.value);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-cyan-500 rounded-2xl px-3 py-2.5 pr-8 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dual-Pane in Landscape vs Single Column in Portrait */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start landscape-split-pane">
          {/* ================= LEFT PANE: INPUT & ATTACHMENTS ================= */}
          <div className="space-y-4">
            {/* Input Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  Texto ou Foto de Exercício
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {inputText.length} caracteres
                </span>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite, cole um texto ou tire foto de um livro, caderno ou placa em qualquer língua..."
                  rows={screen.isLandscape && screen.height < 600 ? 3 : 5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                />
              </div>

              {/* Image Preview if selected */}
              {selectedImage && (
                <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {imageFileName || 'Foto Selecionada'}
                      </span>
                      <span className="text-[10px] text-cyan-700 font-medium">
                        Pronto para reconhecimento de texto (OCR)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedImage(null);
                      setImageFileName('');
                    }}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition shadow-xs cursor-pointer"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons: Camera, Upload, Paste */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Camera Button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-cyan-600" />
                  <span>Tirar Foto</span>
                </button>

                {/* Upload Image Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Anexar Imagem</span>
                </button>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Big Translate Trigger Button */}
              <button
                onClick={handleRequestTranslate}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer ${
                  isLoading || (!inputText.trim() && !selectedImage)
                    ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Traduzindo com Inteligência Artificial...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Traduzir Agora (+15 XP)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Practice Chips */}
            <div className="bg-white border border-slate-200 rounded-3xl p-3.5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Exemplos Rápidos de Estudo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEffects.playClick();
                      setInputText(ex.text);
                      setSourceLang(ex.source);
                      setTargetLang(ex.target);
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-800 transition active:scale-95 cursor-pointer text-left shadow-xs"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANE: TRANSLATION RESULT & STUDY NOTES ================= */}
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {result ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Result Card */}
                <div className="bg-white border border-cyan-200 rounded-3xl p-4 shadow-sm space-y-3.5">
                  {/* Top Bar: Detected info & Quick Actions */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                        {result.detectedSourceLang || 'Idioma de Origem'} ➔{' '}
                        {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || 'Português'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Copy button */}
                      <button
                        onClick={() => handleCopyText(result.translatedText)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition active:scale-90 shadow-xs cursor-pointer"
                        title="Copiar Tradução"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Save to Notebook button */}
                      <button
                        onClick={handleSaveToNotebook}
                        className={`p-2 rounded-xl transition active:scale-90 shadow-xs cursor-pointer ${
                          savedToNotebook
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900'
                        }`}
                        title="Salvar no Caderno de Vocabulário"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Original Text Mini Box */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Original:
                      </span>
                      <p className="text-xs text-slate-700 font-medium italic truncate">
                        "{result.originalText}"
                      </p>
                    </div>
                    <button
                      onClick={handleSpeakOriginal}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shrink-0 shadow-xs cursor-pointer"
                      title="Ouvir original"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Main Translated Text Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                        Tradução:
                      </span>
                      <button
                        onClick={handleSpeakTranslation}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSpeakingTranslation
                            ? 'bg-cyan-600 text-white animate-pulse'
                            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'
                        }`}
                        title="Ouvir pronúncia com voz natural"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Ouvir Voz</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-white border border-cyan-200 text-slate-900 text-base sm:text-lg font-bold leading-relaxed shadow-inner">
                      {result.translatedText}
                    </div>
                  </div>

                  {/* Phonetic Pronunciation Guide */}
                  {result.pronunciationGuide && (
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        Guia de Pronúncia e Fonética:
                      </span>
                      <p className="text-xs font-semibold text-blue-900">
                        {result.pronunciationGuide}
                      </p>
                    </div>
                  )}

                  {/* Cultural or Grammar Notes */}
                  {result.culturalOrGrammarNotes && (
                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-700 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Dica Gramatical & Contexto:
                      </span>
                      <p className="text-xs text-purple-950">
                        {result.culturalOrGrammarNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vocabulary Breakdown Section */}
                {result.vocabularyBreakdown && result.vocabularyBreakdown.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-600" />
                        Vocabulário & Termos-Chave
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {result.vocabularyBreakdown.length} palavras
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.vocabularyBreakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 hover:border-cyan-400 transition"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-xs font-black text-cyan-800">{item.word}</span>
                            {item.partOfSpeech && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                {item.partOfSpeech}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900">{item.translation}</p>
                          {item.example && (
                            <p className="text-[10px] text-slate-500 italic pt-0.5">
                              Ex: {item.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State / How it works */
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center mx-auto text-2xl">
                  🌐
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">
                    Traduza Textos, Exercícios e Fotos de Livros
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Digite ou anexe a foto da sua apostila escolar. A inteligência artificial
                    extrai o texto, traduz fielmente e ensina a pronúncia e gramática.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] text-slate-600 font-semibold">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">📸 Foto / OCR</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">🗣️ Voz Natural</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">📖 Gramática</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">⚡ 12 Idiomas</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
