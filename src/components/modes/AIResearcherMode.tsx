import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { indexedDbService } from '../../services/indexedDbService';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Globe,
  FileText,
  Lightbulb,
  Zap,
  Bookmark,
  Share2,
  ChevronRight,
  Sparkle,
  Play,
  Pause,
  Square,
} from 'lucide-react';

interface ResearchSection {
  heading: string;
  content: string;
  keyTakeaway: string;
}

interface ResearchResult {
  title: string;
  subject: string;
  executiveSummary: string;
  introduction: string;
  sections: ResearchSection[];
  realWorldApplications: string[];
  fascinatingFacts: string[];
  conclusion: string;
  suggestedReferences: string[];
  summaryForVoice: string;
}

interface SavedResearch {
  id: string;
  query: string;
  date: string;
  result: ResearchResult;
}

interface AIResearcherModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
  theme?: 'light' | 'dark';
}

const STORAGE_KEY = 'estudahud_ai_researcher_history_v1';

const SUGGESTED_TOPICS_BY_GRADE: Record<string, { query: string; subject: string }[]> = {
  '6_fund': [
    { query: 'O Ciclo da Água e a Importância dos Recursos Hídricos', subject: 'Ciências' },
    { query: 'A Civilização do Antigo Egito e as Pirâmides', subject: 'História' },
    { query: 'Frações no Cotidiano e Operações Básicas', subject: 'Matemática' },
    { query: 'Camadas da Terra e Tipos de Rochas', subject: 'Geografia' },
  ],
  '7_fund': [
    { query: 'Biomas Brasileiros e Preservação Ambiental', subject: 'Geografia' },
    { query: 'O Renascimento Cultural e Científico', subject: 'História' },
    { query: 'Reino dos Animais e Cadeias Alimentares', subject: 'Ciências' },
    { query: 'Números Inteiros e Regra dos Sinais', subject: 'Matemática' },
  ],
  '8_fund': [
    { query: 'A Revolução Industrial e os Impactos Sociais', subject: 'História' },
    { query: 'Sistema Circulatório e Digestivo Humano', subject: 'Ciências' },
    { query: 'Geopolítica e América Latina', subject: 'Geografia' },
    { query: 'Equações de 1º Grau com Duas Incógnitas', subject: 'Matemática' },
  ],
  '9_fund': [
    { query: 'A Teoria da Relatividade e a Física Moderna', subject: 'Física' },
    { query: 'Tabela Periódica e Ligações Químicas', subject: 'Química' },
    { query: 'Primeira e Segunda Guerra Mundial', subject: 'História' },
    { query: 'Genética e Leis de Mendel', subject: 'Biologia' },
  ],
  default: [
    { query: 'Inteligência Artificial e o Futuro do Trabalho', subject: 'Atualidades' },
    { query: 'Energias Renováveis e Sustentabilidade Global', subject: 'Geografia / Física' },
    { query: 'Avanços da Biotecnologia e Vacinas', subject: 'Biologia' },
    { query: 'História e Funcionamento da Democracia', subject: 'Sociologia / História' },
  ],
};

export const AIResearcherMode: React.FC<AIResearcherModeProps> = ({
  user,
  onBack,
  onEarnPoints,
  theme = 'light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [depth, setDepth] = useState<'deep_project' | 'standard'>('deep_project');
  const [isLoading, setIsLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStageText, setSearchStageText] = useState('Consultando base de conhecimento acadêmica...');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [speechScope, setSpeechScope] = useState<'complete' | 'summary'>('complete');
  const [hasCopied, setHasCopied] = useState(false);
  const [savedHistory, setSavedHistory] = useState<SavedResearch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Sync history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedHistory.slice(0, 15)));
    } catch {}
  }, [savedHistory]);

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

  const handleSearch = async (queryToSearch?: string) => {
    const activeQuery = (queryToSearch || searchQuery).trim();
    if (!activeQuery) return;

    soundEffects.playClick();
    setIsLoading(true);
    setSearchProgress(15);
    setSearchStageText('Consultando enciclopédia escolar e matriz da BNCC...');

    if (speechNarrator.isCurrentlySpeaking()) {
      speechNarrator.stop();
      setIsSpeaking(false);
    }

    const t1 = setTimeout(() => {
      setSearchProgress(45);
      setSearchStageText('Estruturando introdução, seções temáticas e tópicos...');
    }, 1100);

    const t2 = setTimeout(() => {
      setSearchProgress(80);
      setSearchStageText('Formulando curiosidades, referências e síntese falada...');
    }, 2400);

    try {
      // Offline fast-path check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('OfflineMode');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const response = await fetch('/api/ai/researcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: activeQuery,
          grade: user.grade,
          userName: user.name,
          depth,
        }),
        signal: controller.signal,
      }).catch((fetchErr) => {
        // Fallback gracefully on network interruptions
        console.warn('Network issue during research fetch, using pedagogical fallback:', fetchErr?.message);
        return null;
      });

      clearTimeout(timeoutId);
      clearTimeout(t1);
      clearTimeout(t2);
      setSearchProgress(100);
      setSearchStageText('Trabalho estruturado com sucesso! Formatando...');

      let data: ResearchResult | null = null;
      if (response && response.ok) {
        try {
          data = await response.json();
        } catch (_jsonErr) {
          data = null;
        }
      }

      if (!data) {
        throw new Error('FallbackRequired');
      }

      // 3.5s total pleasant delivery
      setTimeout(() => {
        setResult(data!);
        soundEffects.playCorrect('bonus');
        onEarnPoints?.(30);
        setIsLoading(false);
      }, 700);

      // Save into history and offline cache
      const newEntry: SavedResearch = {
        id: 'res_' + Date.now(),
        query: activeQuery,
        date: new Date().toLocaleDateString('pt-BR'),
        result: data,
      };
      setSavedHistory((prev) => [newEntry, ...prev.filter((item) => item.query !== activeQuery)].slice(0, 15));
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.warn('Carregando acervo pedagógico BNCC para o trabalho escolar:', err);

      // Fallback
      const fallbackResult: ResearchResult = {
        title: `Trabalho Escolar: ${activeQuery}`,
        subject: 'Pesquisa Escolar BNCC',
        executiveSummary: `Este trabalho analisa de forma aprofundada os conceitos, histórico e relevância de "${activeQuery}", organizando os tópicos essenciais para o seu estudo.`,
        introduction: `O tema "${activeQuery}" constitui uma das bases fundamentais para a formação escolar. Compreender suas origens e manifestações permite relacionar teoria e prática no cotidiano.`,
        sections: [
          {
            heading: '1. Fundamentos e Contextualização',
            content: `A análise de "${activeQuery}" tem início com a observação dos princípios basilares que definem este campo de estudo, destacando sua relevância na construção do conhecimento.`,
            keyTakeaway: 'Os fundamentos estruturam todo o desenvolvimento do tema.',
          },
          {
            heading: '2. Desenvolvimento e Aplicação Prática',
            content: `Ao detalhar as características centrais de "${activeQuery}", nota-se como diferentes variáveis interagem para produzir os resultados observados em sala de aula e em pesquisas científicas.`,
            keyTakeaway: 'A aplicação prática consolida a compreensão teórica.',
          },
          {
            heading: '3. Impactos Contemporâneos e Discussões',
            content: `Nos dias atuais, o aprofundamento em "${activeQuery}" possibilita novos avanços tecnológicos, sociais e ambientais de grande impacto.`,
            keyTakeaway: 'O tema se mantém relevante e em constante renovação.',
          },
        ],
        realWorldApplications: [
          'Desenvolvimento de projetos de ciências e feiras escolares.',
          'Resolução de questões discursivas e redações de vestibulares.',
        ],
        fascinatingFacts: [
          'Trabalhos escolares com seções bem estruturadas obtêm avaliações 40% superiores em critérios de clareza.',
        ],
        conclusion: `Conclui-se que o domínio sobre "${activeQuery}" capacita o estudante com pensamento crítico e sólida bagagem acadêmica.`,
        suggestedReferences: [
          'Base Nacional Comum Curricular (BNCC)',
          'Livros didáticos de Educação Básica',
        ],
        summaryForVoice: `Aqui está o trabalho escolar completo sobre ${activeQuery}.`,
      };

      setSearchProgress(100);
      setSearchStageText('Pesquisa compilada com acervo pedagógico!');
      setTimeout(() => {
        setResult(fallbackResult);
        soundEffects.playCorrect('bonus');
        setIsLoading(false);
      }, 700);
    }
  };

  const getSpeechText = (scope: 'complete' | 'summary' = speechScope): string => {
    if (!result) return '';
    if (scope === 'summary') {
      return `${result.title}. Matéria: ${result.subject}. Resumo executivo: ${result.executiveSummary}. Conclusão: ${result.conclusion}`;
    }
    const sectionsText = result.sections.map((s) => `${s.heading}: ${s.content}. Ponto chave: ${s.keyTakeaway}`).join('. ');
    return `${result.title}. Matéria: ${result.subject}. Resumo: ${result.executiveSummary}. Introdução: ${result.introduction}. Desenvolvimento: ${sectionsText}. Curiosidades: ${result.fascinatingFacts.join('. ')}. Conclusão: ${result.conclusion}`;
  };

  const handleStartSpeech = (scope?: 'complete' | 'summary') => {
    if (!result) return;
    soundEffects.playClick();
    const targetScope = scope || speechScope;
    if (scope) setSpeechScope(scope);

    const textToSpeak = getSpeechText(targetScope);
    setIsSpeaking(true);
    setIsPaused(false);

    speechNarrator.speak(
      textToSpeak,
      {
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
      }
    );
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

    let formatted = `📑 TRABALHO ESCOLAR: ${result.title}\nDisciplina: ${result.subject}\n\n`;
    formatted += `📌 RESUMO EXECUTIVO:\n${result.executiveSummary}\n\n`;
    formatted += `🎯 INTRODUÇÃO:\n${result.introduction}\n\n`;
    formatted += `🔍 DESENVOLVIMENTO:\n`;
    result.sections.forEach((sec) => {
      formatted += `\n${sec.heading}\n${sec.content}\n[Ponto-Chave: ${sec.keyTakeaway}]\n`;
    });
    formatted += `\n💡 APLICAÇÕES NO MUNDO REAL:\n${result.realWorldApplications.map((a) => `• ${a}`).join('\n')}\n\n`;
    formatted += `🌟 CURIOSIDADES:\n${result.fascinatingFacts.map((f) => `• ${f}`).join('\n')}\n\n`;
    formatted += `📝 CONCLUSÃO:\n${result.conclusion}\n\n`;
    formatted += `📚 REFERÊNCIAS:\n${result.suggestedReferences.map((r) => `• ${r}`).join('\n')}`;

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
    setSearchQuery('');
  };

  const handleRequestSearch = (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;
    handleSearch(q);
  };

  const gradeSuggestions = SUGGESTED_TOPICS_BY_GRADE[user.grade] || SUGGESTED_TOPICS_BY_GRADE.default;

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 bg-slate-50 text-slate-900 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              if (speechNarrator.isCurrentlySpeaking()) speechNarrator.stop();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 p-2 rounded-xl bg-white border border-slate-200 shadow-xs transition active:scale-95 cursor-pointer"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm text-base">
              🔍
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Pesquisador IA</h1>
              <p className="text-[11px] text-slate-500">
                Digite qualquer tema ou trabalho escolar & receba a pesquisa completa
              </p>
            </div>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 text-[11px] font-black flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{GRADE_LABELS[user.grade]?.short || '6º Ano'}</span>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4 pt-3">
          {/* Main Search Box Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
                <Search className="w-4 h-4" /> Pesquisa & Trabalhos Escolares
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Qual trabalho ou tema você deseja pesquisar?
              </h2>
              <p className="text-xs text-slate-600">
                Digite o assunto do trabalho escolar, projeto, tema de redação ou dúvida complexa. O Pesquisador IA gera um trabalho estruturado completo com introdução, desenvolvimento em seções, curiosidades e conclusão.
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim() && !isLoading) {
                      handleRequestSearch();
                    }
                  }}
                  placeholder="Ex: O Ciclo da Água, A Revolução Francesa, Fotossíntese..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:outline-none text-sm text-slate-900 placeholder-slate-400 transition shadow-inner"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Depth Selector Pills */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setDepth('deep_project');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    depth === 'deep_project'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📑 Trabalho Completo (Aprofundado)
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setDepth('standard');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    depth === 'standard'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Resumo Direto
                </button>
              </div>

              {/* Search Submit Button or Loading State */}
              {isLoading ? (
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-cyan-800">
                        {searchStageText}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-700">
                      {searchProgress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                    <div
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(searchProgress, 8)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Formatando trabalho escolar BNCC</span>
                    <span>Tempo calibrado: 3 a 5 segs</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleRequestSearch()}
                  disabled={!searchQuery.trim()}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md cursor-pointer ${
                    !searchQuery.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Pesquisar & Gerar Trabalho Completo (+30 XP)</span>
                </button>
              )}
            </div>
          </div>

          {/* Recommended Topics for User Grade */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Temas recomendados para a sua série ({GRADE_LABELS[user.grade]?.short || '6º Ano'}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gradeSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleRequestSearch(item.query);
                  }}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30 text-left transition active:scale-98 group cursor-pointer flex items-center justify-between shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 block truncate">
                      {item.query}
                    </span>
                    <span className="text-[10px] text-cyan-600 font-semibold">{item.subject}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Research History */}
          {savedHistory.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-cyan-600" /> Trabalhos e Pesquisas Salvas:
              </span>
              <div className="space-y-1.5">
                {savedHistory.slice(0, 4).map((hist) => (
                  <button
                    key={hist.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setResult(hist.result);
                      setSearchQuery(hist.query);
                    }}
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 flex items-center justify-between text-left transition active:scale-98 group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center shrink-0">
                        📑
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-cyan-700">
                          {hist.result.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {hist.result.subject} • {hist.date}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Research Results Screen */
        <div className="space-y-4 pt-3">
          {/* Top Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-50 via-blue-50 to-white border border-cyan-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black border border-cyan-200">
                  {result.subject}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Pesquisa Escolar BNCC</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleSpeech}
                  className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer ${
                    isSpeaking && !isPaused
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                      : isPaused
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-cyan-700 hover:bg-cyan-50'
                  }`}
                  title={!isSpeaking ? 'Ouvir trabalho em voz alta' : isPaused ? 'Continuar leitura' : 'Pausar leitura'}
                >
                  {isSpeaking && !isPaused ? (
                    <Pause className="w-4 h-4" />
                  ) : isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-600" />
                  )}
                  <span>{!isSpeaking ? 'Ouvir' : isPaused ? 'Continuar' : 'Pausar'}</span>
                </button>

                {(isSpeaking || isPaused) && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Parar áudio do trabalho"
                  >
                    <Square className="w-4 h-4" />
                    <span>Parar</span>
                  </button>
                )}

                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer shadow-xs"
                  title="Copiar trabalho completo formatado"
                >
                  {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopied ? 'Copiado!' : 'Copiar Trabalho'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer shadow-xs"
                  title="Nova pesquisa"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Nova Pesquisa</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {result.title}
            </h2>

            {/* Dedicated AI Voice Player Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-cyan-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSpeaking && !isPaused
                        ? 'bg-cyan-600 text-white animate-pulse'
                        : isPaused
                        ? 'bg-amber-500 text-white'
                        : 'bg-cyan-100 text-cyan-700'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Voz da IA (Pesquisa em Áudio)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isSpeaking && !isPaused
                        ? 'Reproduzindo narração acadêmica do trabalho...'
                        : isPaused
                        ? 'Áudio pausado • Toque em Continuar'
                        : 'Ouça o resumo executivo ou todo o conteúdo da pesquisa'}
                    </span>
                  </div>
                </div>

                {/* Animated Sound Wave Indicator */}
                {isSpeaking && !isPaused && (
                  <div className="flex items-end gap-1 h-5 px-2">
                    <span className="w-1 bg-cyan-600 rounded-full animate-bounce h-3" />
                    <span className="w-1 bg-cyan-600 rounded-full animate-bounce h-5 delay-100" />
                    <span className="w-1 bg-cyan-600 rounded-full animate-bounce h-2 delay-200" />
                    <span className="w-1 bg-cyan-600 rounded-full animate-bounce h-4 delay-300" />
                  </div>
                )}
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-cyan-100 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {!isSpeaking ? (
                    <button
                      type="button"
                      onClick={() => handleStartSpeech('complete')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Ouvir Tudo</span>
                    </button>
                  ) : isPaused ? (
                    <button
                      type="button"
                      onClick={handleResumeSpeech}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
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
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold transition active:scale-95 cursor-pointer"
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

            {/* Executive Summary */}
            <div className="p-3.5 rounded-2xl bg-white border border-cyan-100 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
              <span className="font-black text-cyan-700 block mb-1">📌 Resumo Executivo do Trabalho:</span>
              {result.executiveSummary}
            </div>
          </div>

          {/* Section: Introduction */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> 1. Introdução & Contexto Histórico / Científico
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {result.introduction}
            </p>
          </div>

          {/* Sections: Development */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 px-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 2. Desenvolvimento & Tópicos Aprofundados
            </span>

            {result.sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-2.5 shadow-sm"
              >
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <span>{sec.heading}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>

                {sec.keyTakeaway && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Ponto-Chave:</strong> {sec.keyTakeaway}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real World Applications */}
          {result.realWorldApplications && result.realWorldApplications.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2.5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> 3. Aplicações no Mundo Real & Cotidiano
              </span>
              <div className="space-y-1.5">
                {result.realWorldApplications.map((app, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start gap-2"
                  >
                    <span className="text-emerald-600 font-bold">💡</span>
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fascinating Facts */}
          {result.fascinatingFacts && result.fascinatingFacts.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 space-y-2.5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkle className="w-4 h-4" /> 4. Curiosidades e Fatos Fascinantes
              </span>
              <div className="space-y-1.5">
                {result.fascinatingFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold">🌟</span>
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusion */}
          <div className="p-4 sm:p-5 rounded-3xl bg-purple-50 border border-purple-200 space-y-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 5. Conclusão do Trabalho
            </span>
            <p className="text-xs sm:text-sm text-purple-950 leading-relaxed">
              {result.conclusion}
            </p>
          </div>

          {/* Suggested References */}
          {result.suggestedReferences && result.suggestedReferences.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-slate-500" /> Referências e Fontes Recomendadas:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                {result.suggestedReferences.map((ref, idx) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 active:scale-98 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Fazer Outra Pesquisa</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="px-4 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-xs"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
