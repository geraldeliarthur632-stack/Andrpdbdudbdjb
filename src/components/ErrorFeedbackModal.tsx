import React, { useState, useEffect } from 'react';
import { UserProfile, UserErrorReport, ErrorCategory, ErrorStatus } from '../types';
import { errorFeedbackService } from '../services/errorFeedbackService';
import { soundEffects } from '../services/soundEffects';
import { GRADE_LABELS } from '../data/curriculumData';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  ThumbsUp,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Bug,
  HelpCircle,
  FileQuestion,
  Lightbulb,
  BookOpen,
  Bot,
  Clock,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';

interface ErrorFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialCategory?: ErrorCategory;
  initialTopicContext?: string;
  questionContext?: any;
}

const CATEGORY_CONFIG: Record<
  ErrorCategory,
  { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; border: string }
> = {
  questao: {
    label: 'Questão / Gabarito',
    icon: FileQuestion,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  bug: {
    label: 'Bug / Travamento',
    icon: Bug,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ia_explicador: {
    label: 'IA / Explicador / Áudio',
    icon: Bot,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  materia: {
    label: 'Matéria ou Conteúdo',
    icon: BookOpen,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  sugestao: {
    label: 'Sugestão de Melhoria',
    icon: Lightbulb,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  outro: {
    label: 'Outro Problema',
    icon: HelpCircle,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
};

const STATUS_CONFIG: Record<ErrorStatus, { label: string; badgeClass: string; icon: React.FC<{ className?: string }> }> = {
  em_analise: {
    label: 'Em Análise',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
  },
  investigando: {
    label: 'Investigando Correção',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Sparkles,
  },
  resolvido: {
    label: 'Resolvido pela IA',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    icon: CheckCircle2,
  },
};

export const ErrorFeedbackModal: React.FC<ErrorFeedbackModalProps> = ({
  isOpen,
  onClose,
  user,
  initialCategory = 'questao',
  initialTopicContext = '',
  questionContext,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'hub'>('form');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ErrorCategory>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Hub / Central de Erros states
  const [reports, setReports] = useState<UserErrorReport[]>(() =>
    errorFeedbackService.getCachedReports()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Load and refresh reports from server
  const loadReports = async () => {
    const fetched = await errorFeedbackService.fetchReports();
    setReports(fetched);
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
      setFormSuccessMessage('');
      setFormError('');
      if (initialTopicContext) {
        setTitle(`Erro em: ${initialTopicContext}`);
      }
    }
  }, [isOpen, initialTopicContext]);

  useEffect(() => {
    const handleUpdate = () => {
      setReports([...errorFeedbackService.getCachedReports()]);
    };
    window.addEventListener('estudahud_error_feedback_updated', handleUpdate);
    return () => {
      window.removeEventListener('estudahud_error_feedback_updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (cleanTitle.length < 3) {
      setFormError('Por favor, informe um título claro para o erro (mínimo 3 letras).');
      soundEffects.playError();
      return;
    }
    if (cleanDesc.length < 6) {
      setFormError('Descreva o erro com mais detalhes para que possamos corrigir.');
      soundEffects.playError();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await errorFeedbackService.submitErrorReport({
        userId: user.userId || user.name,
        userName: user.name || 'Estudante',
        userGrade: user.grade,
        category,
        title: cleanTitle,
        description: cleanDesc,
        questionContext,
      });

      if (res.success) {
        soundEffects.playSuccess();
        const msg = res.aiCorrection
          ? 'Relato enviado! A IA analisou e corrigiu o erro exclusivamente para você.'
          : 'Relato enviado com sucesso para a Central de Erros!';
        setFormSuccessMessage(msg);
        setTitle('');
        setDescription('');
        await loadReports();
        // Switch to hub after 1.5s to show it listed
        setTimeout(() => {
          setActiveTab('hub');
          setFormSuccessMessage('');
        }, 1500);
      } else {
        setFormError(res.message || 'Falha ao enviar relato. Tente novamente.');
        soundEffects.playError();
      }
    } catch {
      setFormError('Erro ao comunicar com o servidor. O relato foi guardado no seu dispositivo.');
      soundEffects.playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUpvote = async (reportId: string) => {
    soundEffects.playClick();
    await errorFeedbackService.toggleUpvote(reportId);
    setReports([...errorFeedbackService.getCachedReports()]);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (filterCategory !== 'todos' && r.category !== filterCategory) return false;
    if (filterStatus !== 'todos' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAuthor = r.userName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAuthor;
    }
    return true;
  });

  const gradeLabel = GRADE_LABELS[user.grade]?.full || 'Ensino';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-indigo-700 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-inner shrink-0">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Canal de Feedback Aberto
                </span>
                <span className="text-[11px] text-rose-100 font-medium hidden sm:inline">
                  Comunidade Trilha do Saber
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Central de Erros & Feedback
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-black/20 p-1 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('form');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-rose-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Digitar Novo Erro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('hub');
                loadReports();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-white text-rose-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Central de Erros ({reports.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Form to type error */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Encontrou algum erro em uma questão, gabarito duvidoso, bug no sistema ou tem uma
                sugestão? <strong>Digite abaixo com suas palavras</strong>. Todos os relatos vão
                direto para o servidor, onde a <strong>IA analisa e tenta corrigir o problema imediatamente</strong> com exclusividade para a sua conta!
              </p>
            </div>

            {/* Author info pill */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                )}
                <span className="font-bold text-slate-800">{user.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{gradeLabel}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Relatando como Aluno</span>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Qual é a categoria do problema?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as ErrorCategory[]).map((catKey) => {
                  const cfg = CATEGORY_CONFIG[catKey];
                  const Icon = cfg.icon;
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setCategory(catKey);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer text-xs font-bold ${
                        isSelected
                          ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-2 ring-rose-500/50`
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Título ou Resumo do Erro
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ex: Questão de Fração do 6º ano com resposta invertida"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Descreva o que aconteceu em detalhes</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {description.length} caracteres
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={800}
                placeholder="Digite detalhadamente onde viu o erro, qual era a pergunta, o cálculo que você fez ou o comportamento estranho..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 leading-relaxed resize-none"
                required
              />
            </div>

            {/* Feedback messages */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registrando na Central...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Relato para a Central de Erros</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Central de Erros (Todos os erros relatados pelos usuários) */}
        {activeTab === 'hub' && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Search and Filters Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por assunto, dúvida ou palavra-chave..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategory('todos')}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer ${
                    filterCategory === 'todos'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({reports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('questao')}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filterCategory === 'questao'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  <FileQuestion className="w-3 h-3" />
                  <span>Questões</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('bug')}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filterCategory === 'bug'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <Bug className="w-3 h-3" />
                  <span>Bugs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('ia_explicador')}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filterCategory === 'ia_explicador'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>IA & Áudio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('materia')}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filterCategory === 'materia'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Matérias</span>
                </button>
              </div>
            </div>

            {/* List of Reports */}
            {filteredReports.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Nenhum relato encontrado</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tente alterar os filtros ou use a aba ao lado para relatar o primeiro erro dessa
                  categoria!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="mt-2 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Digitar Novo Relato
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => {
                  const catCfg = CATEGORY_CONFIG[report.category] || CATEGORY_CONFIG.outro;
                  const statCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.em_analise;
                  const CatIcon = catCfg.icon;
                  const StatIcon = statCfg.icon;
                  const isUpvoted = errorFeedbackService.isUpvotedByMe(report.id);
                  const isMyReport = Boolean(
                    report.appliedOnlyForUserId &&
                    (report.appliedOnlyForUserId === user.userId || report.appliedOnlyForUserId === user.name)
                  );
                  const formattedDate = new Date(report.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition space-y-2.5 text-left"
                    >
                      {/* Card Top: Category and Status */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${catCfg.bg} ${catCfg.border} ${catCfg.text}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{catCfg.label}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${statCfg.badgeClass}`}
                          >
                            <StatIcon className="w-3 h-3" />
                            <span>{statCfg.label}</span>
                          </span>
                          {isMyReport && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Corrigido para Você
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {report.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                          {report.description}
                        </p>
                      </div>

                      {/* AI Personalized Correction (Exclusively for reporting user) */}
                      {report.aiCorrection && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Correção da IA (Aplicada para seu usuário):</span>
                          </div>
                          <p className="text-emerald-950 font-medium leading-relaxed">
                            {report.aiCorrection}
                          </p>
                          {report.correctedQuestion && (
                            <div className="mt-2 p-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 space-y-1 shadow-2xs">
                              <span className="font-extrabold text-[11px] text-emerald-800 block">Questão Corrigida pela IA:</span>
                              <p className="font-bold text-xs">{report.correctedQuestion.question}</p>
                              {Array.isArray(report.correctedQuestion.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                                  {report.correctedQuestion.options.map((opt: string, optIdx: number) => (
                                    <div
                                      key={optIdx}
                                      className={`p-1.5 px-2 rounded-lg border flex items-center justify-between ${
                                        optIdx === report.correctedQuestion?.correctIndex
                                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-black'
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {optIdx === report.correctedQuestion?.correctIndex && (
                                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">Gabarito</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {report.correctedQuestion.explanation && (
                                <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                  <strong>Explicação:</strong> {report.correctedQuestion.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Official Pedagogical / Developer Answer */}
                      {!report.aiCorrection && report.adminResponse && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-black text-indigo-900">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Resposta Pedagógica:</span>
                          </div>
                          <p className="text-indigo-950 leading-relaxed font-medium">
                            {report.adminResponse}
                          </p>
                        </div>
                      )}

                      {/* Footer info: author and upvote button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-bold text-slate-700">{report.userName}</span>
                          {report.userGrade && (
                            <span className="text-slate-400">
                              • {GRADE_LABELS[report.userGrade as any]?.full || report.userGrade}
                            </span>
                          )}
                        </div>

                        {/* Interactive Upvote */}
                        <button
                          type="button"
                          onClick={() => handleToggleUpvote(report.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            isUpvoted
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Também encontrou esse erro ou apoia a correção?"
                        >
                          <ThumbsUp className={`w-3 h-3 ${isUpvoted ? 'fill-white' : ''}`} />
                          <span>Também tive isso ({report.upvotes})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            {activeTab === 'hub'
              ? `${filteredReports.length} relatos exibidos na Central`
              : 'Seu relato ajuda milhares de alunos a aprenderem melhor!'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
