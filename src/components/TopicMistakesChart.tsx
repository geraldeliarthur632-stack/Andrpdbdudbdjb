import React, { useState, useEffect } from 'react';
import { GradeLevel } from '../types';
import {
  mistakesTrackerService,
  TopicMistakeStat,
  QuestionAttemptRecord,
} from '../services/mistakesTrackerService';
import { soundEffects } from '../services/soundEffects';
import {
  AlertTriangle,
  TrendingDown,
  Target,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Zap,
  HelpCircle,
  XCircle,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
} from 'lucide-react';

interface TopicMistakesChartProps {
  grade: GradeLevel;
  onPracticeTopic?: (topic: string, subjectId: string) => void;
  theme?: 'light' | 'dark';
}

export const TopicMistakesChart: React.FC<TopicMistakesChartProps> = ({
  grade,
  onPracticeTopic,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [stats, setStats] = useState<TopicMistakeStat[]>(() =>
    mistakesTrackerService.getTopicMistakesSummary(grade)
  );
  const [filterMode, setFilterMode] = useState<'critical' | 'all'>('critical');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<TopicMistakeStat | null>(null);
  const [recentErrors, setRecentErrors] = useState<QuestionAttemptRecord[]>(() =>
    mistakesTrackerService.getRecentErrors(grade, 10)
  );
  const [activeSubTab, setActiveSubTab] = useState<'topics' | 'review'>('topics');
  const [resolvedSuccessMsg, setResolvedSuccessMsg] = useState<string | null>(null);

  const refreshData = () => {
    const s = mistakesTrackerService.getTopicMistakesSummary(grade);
    setStats(s);
    setRecentErrors(mistakesTrackerService.getRecentErrors(grade, 10));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('estudahud_mistakes_updated', refreshData);
    return () => {
      window.removeEventListener('estudahud_mistakes_updated', refreshData);
    };
  }, [grade]);

  // Overall diagnostic metrics
  const diagnostic = mistakesTrackerService.getOverallDiagnostic(grade);
  const subjectsList = Array.from(new Set(stats.map((s) => s.subjectName)));

  // Filtered stats
  let filteredStats = stats;
  if (selectedSubject !== 'all') {
    filteredStats = filteredStats.filter((s) => s.subjectName === selectedSubject);
  }
  if (filterMode === 'critical') {
    filteredStats = filteredStats.filter((s) => s.status === 'critico' || s.status === 'atencao');
  }

  const maxErrors = Math.max(1, ...stats.map((s) => s.errorCount));

  const handleResolveTopic = (topic: string) => {
    soundEffects.playVictory();
    mistakesTrackerService.clearTopicErrors(grade, topic);
    refreshData();
    setSelectedTopic(null);
    setResolvedSuccessMsg(`Tema "${topic}" marcado como revisado e resolvido com sucesso!`);
    setTimeout(() => setResolvedSuccessMsg(null), 4000);
  };

  return (
    <div
      id="topic-mistakes-diagnostics-card"
      className={`rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#121829] border-[#273553] text-slate-100'
      }`}
    >
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 ${
        isLight ? 'border-slate-100' : 'border-[#273553]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${
            isLight
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
          }`}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Diagnóstico de Erros por Tema
              </h3>
              {diagnostic.criticalTopicsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse border ${
                  isLight
                    ? 'bg-rose-100 border-rose-200 text-rose-700'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {diagnostic.criticalTopicsCount}{' '}
                  {diagnostic.criticalTopicsCount === 1 ? 'tema crítico' : 'temas críticos'}
                </span>
              )}
            </div>
            <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Análise real das suas dificuldades nos simulados, caderno e desafios
            </p>
          </div>
        </div>

        {/* Diagnostic view switch */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto text-xs font-bold ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#162035] border-[#273553]'
        }`}>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveSubTab('topics');
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'topics'
                ? 'bg-indigo-600 text-white shadow font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Temas ({stats.length})
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveSubTab('review');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
              activeSubTab === 'review'
                ? 'bg-indigo-600 text-white shadow font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Ver Questões Erradas</span>
          </button>
        </div>
      </div>

      {/* Resolved Success Alert */}
      {resolvedSuccessMsg && (
        <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resolvedSuccessMsg}</span>
        </div>
      )}

      {/* Summary Diagnostic Overview Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className={`p-2.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Aproveitamento
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg font-black ${
                diagnostic.overallAccuracy >= 70
                  ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                  : diagnostic.overallAccuracy >= 50
                  ? isLight ? 'text-amber-700' : 'text-amber-400'
                  : isLight ? 'text-rose-700' : 'text-rose-400'
              }`}
            >
              {diagnostic.overallAccuracy}%
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>geral</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Erros Mapeados
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-black ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
              {diagnostic.totalErrors}
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>erros</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Matéria Frágil
          </span>
          <span className={`text-sm font-black truncate block ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
            {diagnostic.mostVulnerableSubject}
          </span>
        </div>

        <div className={`p-2.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Temas Dominados
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {diagnostic.masteredTopicsCount}
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>temas</span>
          </div>
        </div>
      </div>

      {/* Focus Alert Box */}
      {stats.length > 0 && stats[0].errorCount > 0 && activeSubTab === 'topics' && (
        <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-amber-950/40 border-amber-500/40 text-slate-100'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-300'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <span className={`font-black block ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
              Prioridade máxima de reforço acadêmico:
            </span>
            <p className={`leading-relaxed font-medium ${isLight ? 'text-amber-800' : 'text-slate-300'}`}>
              O tema <strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>"{stats[0].topic}"</strong> ({stats[0].subjectName}) acumula{' '}
              <strong className={`font-black ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>{stats[0].errorCount} erros</strong> com aproveitamento de{' '}
              <strong className={`font-black ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{stats[0].accuracyPercent}%</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 1. ABA DE TEMAS */}
      {activeSubTab === 'topics' && (
        <div className="space-y-3">
          {/* Filtering toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                    : 'bg-[#162035] text-slate-400 hover:text-white border-[#273553]'
                }`}
              >
                Todas Matérias
              </button>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    selectedSubject === subj
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                      : 'bg-[#162035] text-slate-400 hover:text-white border-[#273553]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1 p-0.5 rounded-xl border text-[11px] font-bold ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#162035] border-[#273553]'
            }`}>
              <button
                onClick={() => setFilterMode('critical')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'critical'
                    ? isLight
                      ? 'bg-white text-rose-700 font-black shadow-xs'
                      : 'bg-[#273553] text-rose-300 font-black'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Onde Focar
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'all'
                    ? isLight
                      ? 'bg-white text-slate-900 font-black shadow-xs'
                      : 'bg-[#273553] text-white font-black'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({stats.length})
              </button>
            </div>
          </div>

          {/* Topic Items List */}
          <div className="space-y-2.5">
            {filteredStats.map((item) => {
              const isSelected = selectedTopic?.topic === item.topic;
              const topicAttempts = mistakesTrackerService.getAttemptsForTopic(grade, item.topic);
              const topicErrors = topicAttempts.filter((a) => !a.isCorrect);

              let badgeColor = isLight
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              if (item.status === 'critico') {
                badgeColor = isLight
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              } else if (item.status === 'atencao') {
                badgeColor = isLight
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              }

              return (
                <div
                  key={item.topic}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedTopic(isSelected ? null : item);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-[#18243c] border-purple-500/70 ring-1 ring-purple-500/40'
                      : isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                      : 'bg-[#162035]/70 hover:bg-[#162035] border-[#273553]'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg select-none shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs sm:text-sm font-black truncate ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {item.topic}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'text-slate-600 bg-slate-100 border-slate-200'
                              : 'text-slate-400 bg-[#1e293b] border-[#334155]'
                          }`}>
                            {item.subjectName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {item.errorCount} {item.errorCount === 1 ? 'erro' : 'erros'}
                      </span>
                      <span className={`text-xs font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {item.accuracyPercent}%
                      </span>
                      {isSelected ? (
                        <ChevronUp className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-purple-400'}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar (Accuracy vs Error slices) */}
                  <div className="space-y-1">
                    <div className={`w-full h-2 rounded-full overflow-hidden flex border ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1e293b] border-[#273553]'
                    }`}>
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${item.accuracyPercent}%` }}
                        title={`Acertos: ${item.accuracyPercent}%`}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${item.errorRatePercent}%` }}
                        title={`Erros: ${item.errorRatePercent}%`}
                      />
                    </div>

                    <div className={`flex items-center justify-between text-[10px] font-medium px-0.5 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {item.correctCount} acertos
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {item.errorCount} erros ({item.totalAttempts} tentativas)
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div
                      className={`mt-3.5 pt-3.5 border-t space-y-3 animate-in fade-in ${
                        isLight ? 'border-slate-200' : 'border-[#273553]'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Pedagogical recommendation */}
                      <div className={`p-3 rounded-xl border text-xs ${
                        isLight
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                          : 'bg-purple-950/50 border-purple-500/30 text-purple-200'
                      }`}>
                        <div className={`flex items-center gap-1.5 font-bold mb-1 ${
                          isLight ? 'text-indigo-800' : 'text-purple-300'
                        }`}>
                          <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-500' : 'text-amber-300'}`} />
                          <span>Diagnóstico Pedagógico do Professor:</span>
                        </div>
                        <p className="leading-relaxed">{item.recommendation}</p>
                      </div>

                      {/* Display recent errors for this specific topic */}
                      {topicErrors.length > 0 && (
                        <div className="space-y-2">
                          <span className={`text-[11px] font-bold flex items-center gap-1 ${
                            isLight ? 'text-slate-700' : 'text-slate-300'
                          }`}>
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Questões com erro registradas neste tema ({topicErrors.length}):</span>
                          </span>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {topicErrors.map((err, errIdx) => (
                              <div
                                key={err.id || errIdx}
                                className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-200'
                                    : 'bg-[#0f172a] border-[#273553]'
                                }`}
                              >
                                <p className={`font-bold text-[11px] leading-snug ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}>
                                  {err.questionText}
                                </p>
                                {err.userChoice && (
                                  <div className={`text-[10px] flex items-start gap-1 ${
                                    isLight ? 'text-rose-700' : 'text-rose-300'
                                  }`}>
                                    <span className="font-bold">Sua resposta:</span>
                                    <span>{err.userChoice}</span>
                                  </div>
                                )}
                                {err.correctChoice && (
                                  <div className={`text-[10px] flex items-start gap-1 ${
                                    isLight ? 'text-emerald-700' : 'text-emerald-300'
                                  }`}>
                                    <span className="font-bold">Resposta correta:</span>
                                    <span>{err.correctChoice}</span>
                                  </div>
                                )}
                                {err.explanation && (
                                  <div className={`text-[10px] p-1.5 rounded-lg border mt-1 ${
                                    isLight
                                      ? 'bg-white border-slate-200 text-slate-600'
                                      : 'bg-[#162035] border-[#273553] text-slate-400'
                                  }`}>
                                    <strong className={isLight ? 'text-slate-800' : 'text-slate-300'}>
                                      Explicação:
                                    </strong>{' '}
                                    {err.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        {onPracticeTopic && (
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              onPracticeTopic(item.topic, item.subjectId);
                            }}
                            className="w-full sm:flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Treinar este tema agora</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleResolveTopic(item.topic)}
                          className={`w-full sm:w-auto py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-[#1e293b] hover:bg-[#28384f] text-slate-300 hover:text-white border-[#334155]'
                          }`}
                          title="Marcar dificuldades deste tema como resolvidas"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Marcar Resolvido</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredStats.length === 0 && (
              <div className={`text-center py-8 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Nenhum tema encontrado com o filtro selecionado. Todos os temas estão em bom nível!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ABA DE REVISÃO DIRETA DE QUESTÕES ERRADAS */}
      {activeSubTab === 'review' && (
        <div className="space-y-3 animate-in fade-in">
          <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Últimas questões que você errou nos exercícios e simulados:</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {recentErrors.length} {recentErrors.length === 1 ? 'questão' : 'questões'}
            </span>
          </div>

          {recentErrors.map((err, idx) => (
            <div
              key={err.id || idx}
              className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#162035] border-[#273553]'
              }`}
            >
              <div className={`flex items-center justify-between gap-2 border-b pb-2 ${
                isLight ? 'border-slate-100' : 'border-[#273553]'
              }`}>
                <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-indigo-600' : 'text-purple-400'}`}>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {err.subjectName}
                  </span>
                  <span>{err.topic}</span>
                </span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {new Date(err.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <p className={`font-bold text-xs leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {err.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {err.userChoice && (
                  <div className={`p-2 rounded-xl border ${
                    isLight
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  }`}>
                    <span className={`block text-[10px] font-bold ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                      Sua escolha (incorreta):
                    </span>
                    <span className="text-xs font-semibold">{err.userChoice}</span>
                  </div>
                )}
                {err.correctChoice && (
                  <div className={`p-2 rounded-xl border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  }`}>
                    <span className={`block text-[10px] font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      Gabarito correto:
                    </span>
                    <span className="text-xs font-semibold">{err.correctChoice}</span>
                  </div>
                )}
              </div>

              {err.explanation && (
                <div className={`p-2.5 rounded-xl border text-[11px] space-y-0.5 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-[#0f172a] border-[#273553] text-slate-300'
                }`}>
                  <strong className={`font-bold block ${isLight ? 'text-indigo-700' : 'text-purple-300'}`}>
                    Por que esta é a resposta correta?
                  </strong>
                  <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{err.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {recentErrors.length === 0 && (
            <div className={`text-center py-8 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Nenhuma questão com erro registrada recentemente! Excelente desempenho.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
