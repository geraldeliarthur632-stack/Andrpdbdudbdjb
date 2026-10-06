import React, { useState } from 'react';
import { DifficultyLevel, UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  ChevronRight,
  Calculator,
  Search,
  Puzzle,
  Swords,
  Users,
  Camera,
  Bot,
  Sparkles,
  Zap,
  LayoutGrid,
} from 'lucide-react';

interface ChallengesHubProps {
  user: UserProfile;
  onBack?: () => void;
  selectedDifficulty?: DifficultyLevel;
  onSelectDifficulty?: (d: DifficultyLevel) => void;
  onOpenMoreApps?: () => void;
  theme?: 'light' | 'dark';
  onSelectChallenge: (
    mode:
      | 'chess'
      | 'math'
      | 'competition'
      | 'multiplayer'
      | 'duel'
      | 'wordsearch'
      | 'puzzle'
      | 'times_table'
      | 'photo_exam'
      | 'explainer'
      | 'researcher'
      | 'custom'
      | 'caderno'
      | 'memory'
      | 'languages'
      | 'translator'
      | 'lightning'
      | 'domino'
  ) => void;
}

export const ChallengesHub: React.FC<ChallengesHubProps> = ({
  onBack,
  onOpenMoreApps,
  onSelectChallenge,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState<'all' | 'duels' | 'board' | 'arcade'>('all');

  // CENTRAL DE DESAFIOS: SOMENTE JOGOS
  const games = [
    {
      id: 'domino' as const,
      category: 'board' as const,
      title: 'Dominó do Saber & Clássico',
      description: 'Conecte pedras de fórmulas, perguntas e respostas ou jogue o clássico 0-6 contra Robô IA',
      badge: 'NOVO JOGO 🀄',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md border border-amber-300/40">
          🀄
        </div>
      ),
    },
    {
      id: 'duel' as const,
      category: 'duels' as const,
      title: 'Duelo de Conhecimento 1v1',
      description: 'Desafie um amigo com perguntas de múltipla escolha e bônus de velocidade',
      badge: 'X1 Amigos ⚔️',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 text-white flex items-center justify-center shadow-md border border-violet-400/40 text-xl font-black">
          ⚔️
        </div>
      ),
    },
    {
      id: 'multiplayer' as const,
      category: 'duels' as const,
      title: 'Salas Multiplayer Online',
      description: 'Crie salas privadas com código para disputar com amigos em tempo real na matéria escolhida',
      badge: 'Online 🎮',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md border border-purple-400/30">
          <Users className="w-6 h-6 text-white" />
        </div>
      ),
    },
    {
      id: 'competition' as const,
      category: 'duels' as const,
      title: 'Duelo 1v1 Local (Pass & Play)',
      description: 'Dispute no mesmo aparelho: passe o celular entre dois jogadores para responder',
      badge: '2 Jogadores',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 via-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md border border-rose-400/40">
          <Swords className="w-6 h-6 text-white" />
        </div>
      ),
    },
    {
      id: 'lightning' as const,
      category: 'arcade' as const,
      title: 'Desafio Relâmpago (60 Segundos)',
      description: 'Responda o máximo de perguntas de uma matéria específica em 60s com combos e recordes',
      badge: '60s Cronômetro',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md border border-amber-300/40">
          ⚡
        </div>
      ),
    },
    {
      id: 'chess' as const,
      category: 'board' as const,
      title: 'Academia de Xadrez & Partida 1v1',
      description: 'Aprenda como cada peça se move, regras e jogue partidas interativas contra o robô ou amigos',
      badge: 'Estratégia ♟️',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-700 to-slate-900 text-white flex items-center justify-center shadow-md border border-indigo-400/30 text-2xl">
          ♟️
        </div>
      ),
    },
    {
      id: 'puzzle' as const,
      category: 'arcade' as const,
      title: 'Quebra-Cabeça dos Animais',
      description: 'Encontre e combine os pares dos mesmos bichos para vencer',
      badge: 'Bichos 🦁',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center shadow-md border border-amber-400/30 text-2xl">
          🦁
        </div>
      ),
    },
    {
      id: 'wordsearch' as const,
      category: 'arcade' as const,
      title: 'Caça-Palavras Interativo',
      description: 'Toque nas letras, risque palavras no tabuleiro e avance',
      badge: 'Vocabulário',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md border border-emerald-400/30">
          <Search className="w-6 h-6 text-white" />
        </div>
      ),
    },
    {
      id: 'memory' as const,
      category: 'arcade' as const,
      title: 'Jogo da Memória Educativo',
      description: 'Idiomas, fórmulas científicas e conceitos para treinar a memorização',
      badge: 'Memória 🧠',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md border border-purple-400/40">
          🧠
        </div>
      ),
    },
    {
      id: 'math' as const,
      category: 'arcade' as const,
      title: 'Competição de Matemática Rápida',
      description: 'Desafie seus limites em contas rápidas e cálculo mental contra o relógio',
      badge: 'Cálculo Mental',
      customIcon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md border border-amber-300">
          <span className="text-2xl font-black">⚡</span>
        </div>
      ),
    },
  ];

  const filteredGames = games.filter((g) => activeCategory === 'all' || g.category === activeCategory);

  return (
    <div className={`flex-1 flex flex-col p-4 space-y-4 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto w-full pb-24 sm:pb-28 ${
      isLight ? 'text-slate-900' : 'bg-[#090d16] text-white'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            className={`flex items-center gap-1.5 text-xs p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-xs'
                : 'text-slate-400 hover:text-white bg-[#121829] border-[#1f2b45]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h1 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Desafios & Jogos
            </h1>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onOpenMoreApps && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenMoreApps();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xs text-xs font-black transition active:scale-95 cursor-pointer"
              title="Ver Todos os Apps & Jogos"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mais Apps</span>
            </button>
          )}

          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
            isLight
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-[#8b5cf6]/15 border-[#8b5cf6]/30 text-[#c084fc]'
          }`}>
            <Sparkles className={`w-3 h-3 ${isLight ? 'text-purple-600' : 'text-[#c084fc]'}`} />
            <span>{filteredGames.length} Modos</span>
          </div>
        </div>
      </div>

      {/* Title & Subtitle if back button was present */}
      {onBack && (
        <div>
          <h1 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Desafios & Jogos
          </h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Escolha uma modalidade para treinar seu raciocínio
          </p>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Todos os Jogos' },
          { id: 'duels', label: '⚔️ Duelos 1v1 & Online' },
          { id: 'board', label: '🀄 Tabuleiro & Dominó' },
          { id: 'arcade', label: '⚡ Agilidade & Lógica' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundEffects.playClick();
              setActiveCategory(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
              activeCategory === tab.id
                ? isLight
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[#8b5cf6] text-white shadow-md shadow-purple-600/30'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                : 'bg-[#121829] border border-[#273553] text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Cards List */}
      <div className="space-y-2.5">
        {filteredGames.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              soundEffects.playClick();
              onSelectChallenge(game.id);
            }}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 group active:scale-[0.99] flex items-center justify-between cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                : 'bg-[#121829] border-[#1f2b45] hover:border-[#8b5cf6]/60 hover:bg-[#161f38] shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                {game.customIcon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm tracking-tight transition-colors truncate ${
                    isLight
                      ? 'text-slate-900 group-hover:text-indigo-600'
                      : 'text-white group-hover:text-[#c084fc]'
                  }`}>
                    {game.title}
                  </h3>
                  {game.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-black shrink-0 ${
                      isLight
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    }`}>
                      {game.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs line-clamp-1 mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {game.description}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 transition-all shrink-0 ml-2 group-hover:translate-x-1 ${
              isLight
                ? 'text-slate-400 group-hover:text-indigo-600'
                : 'text-slate-500 group-hover:text-[#8b5cf6]'
            }`} />
          </button>
        ))}

        {/* Mais Apps do Ecossistema */}
        <button
          onClick={() => {
            soundEffects.playClick();
            if (onOpenMoreApps) {
              onOpenMoreApps();
            }
          }}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group active:scale-[0.99] flex items-center justify-between cursor-pointer ${
            isLight
              ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200 hover:border-indigo-400 shadow-sm'
              : 'bg-gradient-to-r from-[#1b1c3a] to-[#251838] border-[#3b3263] hover:border-purple-400 shadow-md'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
              📱
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm tracking-tight transition-colors truncate ${
                  isLight ? 'text-indigo-950 group-hover:text-indigo-600' : 'text-white group-hover:text-purple-300'
                }`}>
                  Mais Apps
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white shrink-0">
                  Explorar
                </span>
              </div>
              <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-indigo-800/80' : 'text-slate-300'}`}>
                Descubra novos aplicativos e ferramentas parceiras de estudo
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-all shrink-0 ml-2 group-hover:translate-x-1 ${
            isLight ? 'text-indigo-600' : 'text-purple-300'
          }`} />
        </button>
      </div>
    </div>
  );
};
