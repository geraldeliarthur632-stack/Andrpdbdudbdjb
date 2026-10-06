import React, { useState, useEffect } from 'react';
import { ChessTheoryGuide, CHESS_THEORY_GUIDES } from '../data/chessAcademyData';
import { ChessPieceSvg } from './ChessPieceSvg';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Play,
  Lightbulb,
  AlertTriangle,
  Award,
  ChevronRight,
  Search,
  Swords,
  Crown,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface ChessTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVideos?: (lessonId?: string) => void;
}

export const ChessTheoryModal: React.FC<ChessTheoryModalProps> = ({
  isOpen,
  onClose,
  onOpenVideos,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(CHESS_THEORY_GUIDES[0].id);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const selectedGuide =
    CHESS_THEORY_GUIDES.find((g) => g.id === selectedGuideId) || CHESS_THEORY_GUIDES[0];

  const renderIcon = (icon: string, category: string, className = 'w-6 h-6') => {
    if (category === 'pecas' || ['♙', '♘', '♗', '♖', '♕', '♔', '♟', '♞', '♝', '♜', '♛', '♚'].includes(icon)) {
      const typeMap: Record<string, string> = {
        '♙': 'p', '♟': 'p',
        '♘': 'n', '♞': 'n',
        '♗': 'b', '♝': 'b',
        '♖': 'r', '♜': 'r',
        '♕': 'q', '♛': 'q',
        '♔': 'k', '♚': 'k',
      };
      const pType = typeMap[icon];
      if (pType) {
        return (
          <div className={className}>
            <ChessPieceSvg type={pType} color="w" className="w-full h-full" />
          </div>
        );
      }
    }
    return <span>{icon}</span>;
  };

  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  useEffect(() => {
    speechNarrator.stop();
    setIsSpeaking(false);
  }, [selectedGuideId, isOpen]);

  if (!isOpen) return null;

  const handleToggleSpeak = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
      return;
    }

    const fullNarration = `${selectedGuide.title}. ${selectedGuide.summary}. Como se movimenta: ${selectedGuide.howItMoves.join('. ')}. Como captura: ${selectedGuide.howItCaptures.join('. ')}. Dicas de Mestre: ${selectedGuide.proTips.join('. ')}`;

    speechNarrator.speak(
      fullNarration,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const filteredGuides = CHESS_THEORY_GUIDES.filter((guide) => {
    const matchesCat = filterCategory === 'all' || guide.category === filterCategory;
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl shadow-xs">
              ♔
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  Guia Pedagógico de Jogadas de Xadrez
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                  Teoria & Prática
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Aprenda as regras de cada peça, movimentos especiais, táticas e princípios de abertura
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              speechNarrator.stop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition border border-zinc-800 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Category Tabs & Search Bar */}
        <div className="pt-3 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pecas', label: '♟ Peças' },
              { id: 'jogadas_especiais', label: '🏰 Especiais' },
              { id: 'taticas', label: '⚔️ Táticas' },
              { id: 'estrategia', label: '🧠 Abertura' },
              { id: 'regras', label: '🏁 Regras' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playClick();
                  setFilterCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterCategory === cat.id
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar peça ou jogada..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content Area: Sidebar List + Main Detailed Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 flex-1 overflow-y-auto pt-2">
          {/* Left Column: Topics List */}
          <div className="md:col-span-4 space-y-1.5 overflow-y-auto max-h-52 md:max-h-full pr-1">
            {filteredGuides.map((guide) => {
              const isSelected = guide.id === selectedGuide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedGuideId(guide.id);
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left border transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-7 flex items-center justify-center">
                      {renderIcon(guide.pieceIcon, guide.category, 'w-6 h-6')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate leading-tight">{guide.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span>{guide.categoryLabel}</span>
                        {guide.pieceValue && (
                          <span className="text-amber-400/90 font-semibold">• {guide.pieceValue}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-amber-400' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Theory Article */}
          <div className="md:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-3.5">
              {/* Card Top Title & Audio Narrator */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                    {renderIcon(selectedGuide.pieceIcon, selectedGuide.category, 'w-8 h-8')}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {selectedGuide.categoryLabel}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                      {selectedGuide.title}
                    </h3>
                    {selectedGuide.pieceValue && (
                      <p className="text-xs text-amber-200 font-bold">
                        Valor de Combate: {selectedGuide.pieceValue}
                      </p>
                    )}
                  </div>
                </div>

                {/* Audio Narrator Button */}
                <button
                  onClick={handleToggleSpeak}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                    isSpeaking
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  }`}
                  title="Ouvir explicação em áudio"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Parar Voz</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ouvir Teoria</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary Box */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  {selectedGuide.summary}
                </p>
              </div>

              {/* Como Move & Como Captura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Como se movimenta */}
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                  <span className="font-extrabold text-blue-300 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Como se Movimenta:
                  </span>
                  <ul className="space-y-1 text-blue-100/90 text-[11px]">
                    {selectedGuide.howItMoves.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 shrink-0 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Como captura */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                  <span className="font-extrabold text-emerald-300 text-[11px] flex items-center gap-1">
                    <Swords className="w-3 h-3 text-emerald-400" />
                    Como Captura Peças:
                  </span>
                  <ul className="space-y-1 text-emerald-100/90 text-[11px]">
                    {selectedGuide.howItCaptures.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dicas de Grande Mestre & Erros Comuns */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                  <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    Dica de Ouro dos Grandes Mestres:
                  </span>
                  <div className="space-y-0.5 text-[11px] text-amber-100/90">
                    {selectedGuide.proTips.map((tip, idx) => (
                      <p key={idx}>💡 {tip}</p>
                    ))}
                  </div>
                </div>

                {selectedGuide.commonMistakes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                    <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Erros Mais Comuns a Evitar:
                    </span>
                    <div className="space-y-0.5 text-[11px] text-rose-200/90">
                      {selectedGuide.commonMistakes.map((mistake, idx) => (
                        <p key={idx}>⚠️ {mistake}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Practical Action Footer: Assistir Aulas de Vídeo no YouTube */}
            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vídeo-aulas completas disponíveis para cada tema</span>
              </div>

              {onOpenVideos && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedGuide.id === 'guide_tabuleiro' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_regras_completas');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 1</span>
                    </button>
                  )}

                  {(['guide_peao', 'guide_torre', 'guide_bispo', 'guide_cavalo', 'guide_dama', 'guide_rei'].includes(selectedGuide.id)) && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_movimento_pecas');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 2 (Peças)</span>
                    </button>
                  )}

                  {(['guide_roque', 'guide_en_passant'].includes(selectedGuide.id)) && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_jogadas_especiais');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 3 (Especiais)</span>
                    </button>
                  )}

                  {selectedGuide.id === 'guide_xeque_e_mate' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_mate_pastor');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 4 (Mates)</span>
                    </button>
                  )}

                  {selectedGuide.id === 'guide_taticas_garfo_cravada' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_taticas_garfo_cravada');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 5 (Táticas)</span>
                    </button>
                  )}

                  {selectedGuide.id === 'guide_abertura_estrategia' && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        speechNarrator.stop();
                        onOpenVideos('vid_principios_abertura');
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Aula 6 (Aberturas)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      speechNarrator.stop();
                      onOpenVideos();
                      onClose();
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700 flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <span>Ver Todas as Aulas</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
