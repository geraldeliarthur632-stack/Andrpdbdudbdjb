import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Gamepad2,
  Zap,
  Search,
  BookOpen,
  Brain,
  Calculator,
  Swords,
  Users,
  Calendar,
  GraduationCap,
  Clock,
  Timer,
  FileDown,
  Globe,
  Camera,
  Play,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export interface MoreAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  onSelectApp: (appId: string) => void;
}

interface AppItem {
  id: string;
  category: 'games' | 'study' | 'tools';
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  iconBg: string;
  icon: React.ReactNode;
  actionText: string;
  externalUrl?: string;
}

export const MoreAppsModal: React.FC<MoreAppsModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  onSelectApp,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'games' | 'study' | 'tools'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const appsList: AppItem[] = [
    // --- JOGO DESTAQUE PARCEIRO ---
    {
      id: 'pega_pega',
      category: 'games',
      title: 'Não Seja o Pegador (Pega - Pega)',
      description: 'Desvie dos pegadores, dispute partidas multiplayer em tempo real e não fique com a coroa!',
      badge: 'Destaque 👑',
      badgeColor: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
      iconBg: 'bg-gradient-to-tr from-amber-400 to-orange-500',
      icon: (
        <img
          src="/pega-pega-app.jpg"
          alt="Não Seja o Pegador"
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-xl object-cover"
        />
      ),
      actionText: 'Jogar Agora',
      externalUrl: 'https://tente-nao-ser-o-pegador.ai.studio/',
    },
    // --- JOGOS EDUCATIVOS ---
    {
      id: 'puzzle',
      category: 'games',
      title: 'Quebra-Cabeça dos Animais',
      description: 'Encontre os pares dos mesmos bichos, avance fases e conheça curiosidades biológicas',
      badge: 'Popular',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
      icon: <span className="text-xl">🦁</span>,
      actionText: 'Jogar',
    },
    {
      id: 'wordsearch',
      category: 'games',
      title: 'Caça-Palavras Interativo',
      description: 'Desvende palavras em temas de Ciências, Sistema Solar, Natureza e Gramática',
      badge: 'Educativo',
      badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
      icon: <Search className="w-5 h-5 text-white" />,
      actionText: 'Jogar',
    },
    {
      id: 'memory',
      category: 'games',
      title: 'Jogo da Memória Educativo',
      description: 'Treine memória com Espanhol, Italiano, Fórmulas de Matemática e capitais',
      badge: 'Novo',
      badgeColor: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-pink-500',
      icon: <Brain className="w-5 h-5 text-white" />,
      actionText: 'Jogar',
    },
    {
      id: 'times_table',
      category: 'games',
      title: 'Treino da Tabuada Divertida',
      description: 'Treine tabuadas do 1 ao 10 com cronômetro, áudio e placar de acertos',
      badge: 'Matemática',
      badgeColor: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
      iconBg: 'bg-gradient-to-tr from-orange-500 to-red-500',
      icon: <Calculator className="w-5 h-5 text-white" />,
      actionText: 'Treinar',
    },
    {
      id: 'math',
      category: 'games',
      title: 'Competição de Matemática',
      description: 'Cálculos rápidos contra o relógio e recordes de velocidade mental',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      icon: <Zap className="w-5 h-5 text-white" />,
      actionText: 'Desafiar',
    },
    {
      id: 'lightning',
      category: 'games',
      title: 'Desafio Relâmpago (60 Segundos)',
      description: 'Responda o máximo de perguntas acadêmicas em 1 minuto com combos de XP',
      badge: '60s',
      badgeColor: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
      iconBg: 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600',
      icon: <Zap className="w-5 h-5 text-white fill-white" />,
      actionText: 'Jogar Agora',
    },
    {
      id: 'chess',
      category: 'games',
      title: 'Academia de Xadrez & Peças',
      description: 'Aprenda o movimento de cada peça no tabuleiro interativo com dicas de mestre',
      iconBg: 'bg-gradient-to-tr from-slate-700 to-slate-900',
      icon: <span className="text-xl text-white">♟️</span>,
      actionText: 'Aprender',
    },
    {
      id: 'duel',
      category: 'games',
      title: 'Duelo de Conhecimento 1v1',
      description: 'Quiz competitivo de múltipla escolha com bônus de rapidez e pontuação',
      iconBg: 'bg-gradient-to-tr from-rose-600 to-red-700',
      icon: <Swords className="w-5 h-5 text-white" />,
      actionText: 'Duelo',
    },
    {
      id: 'competition',
      category: 'games',
      title: 'Duelo 1v1 Local (Pass & Play)',
      description: 'Desafie amigos no mesmo aparelho passando a vez para responder',
      iconBg: 'bg-gradient-to-tr from-violet-600 to-indigo-700',
      icon: <Gamepad2 className="w-5 h-5 text-white" />,
      actionText: 'Pass & Play',
    },
    {
      id: 'multiplayer',
      category: 'games',
      title: 'Salas Multiplayer Online',
      description: 'Crie salas ou jogue com bots em tempo real para disputar ranking',
      iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-700',
      icon: <Users className="w-5 h-5 text-white" />,
      actionText: 'Entrar',
    },

    // --- FERRAMENTAS INTELIGENTES ---
    {
      id: 'translator',
      category: 'study',
      title: 'Tradutor (Foto & Texto)',
      description: 'Traduza fotos de apostilas ou digite textos em 12 idiomas com pronúncia',
      badge: 'Tradução',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30',
      iconBg: 'bg-gradient-to-tr from-cyan-600 to-teal-500',
      icon: <Globe className="w-5 h-5 text-white" />,
      actionText: 'Traduzir',
    },
    {
      id: 'explainer',
      category: 'study',
      title: 'Explicador (Foto & Temas)',
      description: 'Tire fotos do caderno ou digite tópicos para obter explicações passo a passo',
      badge: 'Estudos',
      badgeColor: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
      icon: <span className="text-xl">📸</span>,
      actionText: 'Explicar',
    },
    {
      id: 'researcher',
      category: 'study',
      title: 'Pesquisador Escolar',
      description: 'Pesquise trabalhos escolares e receba sumário estruturado e fontes confiáveis',
      badge: 'Pesquisa',
      badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-600',
      icon: <span className="text-xl">🔍</span>,
      actionText: 'Pesquisar',
    },
    {
      id: 'photo_exam',
      category: 'study',
      title: 'Criar Prova (Foto & PDF)',
      description: 'Gere simulados automáticos com gabarito a partir do material que você estuda',
      badge: 'Simulado',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-blue-600',
      icon: <Camera className="w-5 h-5 text-white" />,
      actionText: 'Criar',
    },

    // --- FERRAMENTAS ESCOLARES ---
    {
      id: 'pdf_summaries',
      category: 'tools',
      title: 'Resumos em PDF (Apostilas A4)',
      description: 'Baixe e imprima resumos completos organizados por matéria para estudar',
      badge: 'Download',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-sky-500',
      icon: <FileDown className="w-5 h-5 text-white" />,
      actionText: 'Ver PDFs',
    },
    {
      id: 'calendar',
      category: 'tools',
      title: 'Calendário de Provas & Trabalhos',
      description: 'Agende datas importantes com contagem regressiva e alertas de estudo',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
      icon: <Calendar className="w-5 h-5 text-white" />,
      actionText: 'Abrir',
    },
    {
      id: 'report_card',
      category: 'tools',
      title: 'Boletim Escolar & Médias',
      description: 'Controle de notas bimestrais por matéria e diagnóstico de aprovação',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-sky-500',
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      actionText: 'Abrir',
    },
    {
      id: 'reminders',
      category: 'tools',
      title: 'Horários & Rotina Semanal',
      description: 'Defina lembretes de estudo automáticos para manter a consistência',
      iconBg: 'bg-gradient-to-tr from-pink-500 to-rose-600',
      icon: <Clock className="w-5 h-5 text-white" />,
      actionText: 'Ajustar',
    },
    {
      id: 'focus',
      category: 'tools',
      title: 'Plano & Foco Pomodoro',
      description: 'Timer com música ambiente de concentração e pausas recomendadas',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-600',
      icon: <Timer className="w-5 h-5 text-white" />,
      actionText: 'Iniciar',
    },
  ];

  const filteredApps = appsList.filter((app) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0f1523] border-[#273553] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            isLight ? 'border-slate-100 bg-slate-50/70' : 'border-[#1f2b45] bg-[#121829]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Mais Apps & Jogos
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 text-[10px] font-black border border-purple-500/30">
                  {appsList.length} Atividades
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Escolha qualquer jogo ou ferramenta para praticar agora
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className={`p-2 rounded-2xl transition cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-[#1a233a]'
            }`}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Filter */}
        <div className={`p-3 sm:px-5 border-b space-y-2.5 ${isLight ? 'border-slate-100' : 'border-[#1f2b45]'}`}>
          {/* Search Box */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Buscar jogo ou aplicativo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-2xl border outline-hidden transition ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500 focus:bg-white'
                  : 'bg-[#121829] border-[#273553] text-white focus:border-purple-500'
              }`}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'Todos', count: appsList.length },
              { id: 'games', label: '🎮 Jogos Educativos', count: appsList.filter((a) => a.category === 'games').length },
              { id: 'study', label: '📖 Estudos & Tradutor', count: appsList.filter((a) => a.category === 'study').length },
              { id: 'tools', label: '📚 Ferramentas', count: appsList.filter((a) => a.category === 'tools').length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    : 'bg-[#121829] text-slate-400 hover:bg-[#1a233a] hover:text-white border border-[#1f2b45]'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Apps & Games List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 max-h-[60vh]">
          {filteredApps.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-3xl">🔍</span>
              <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Nenhum aplicativo encontrado
              </p>
              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Tente buscar com outra palavra-chave
              </p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  soundEffects.playClick();
                  if (app.externalUrl) {
                    window.open(app.externalUrl, '_blank');
                  } else {
                    onSelectApp(app.id);
                  }
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer active:scale-[0.99] ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 hover:shadow-sm'
                    : 'bg-[#121829] border-[#1f2b45] hover:border-purple-500/60 hover:bg-[#161f38]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl ${app.iconBg} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200`}
                  >
                    {app.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isLight
                            ? 'text-slate-900 group-hover:text-purple-600'
                            : 'text-white group-hover:text-purple-300'
                        }`}
                      >
                        {app.title}
                      </h4>
                      {app.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
                            app.badgeColor || 'bg-purple-500/15 text-purple-600 border-purple-500/30'
                          }`}
                        >
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <span
                    className={`hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                      isLight
                        ? 'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white'
                        : 'bg-purple-950/40 text-purple-300 border-purple-800/60 group-hover:bg-purple-600 group-hover:text-white'
                    }`}
                  >
                    {app.actionText}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition sm:hidden ${
                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f2b45] text-slate-300'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
