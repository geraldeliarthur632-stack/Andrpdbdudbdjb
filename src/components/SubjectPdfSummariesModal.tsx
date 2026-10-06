import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, GradeLevel, SubjectId } from '../types';
import { getSubjectsForGrade, GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import {
  CURRICULUM_SUMMARIES_DATABASE,
  TopicSummaryItem,
  openPdfPrintWindow,
  downloadHtmlFile,
  generatePrintablePdfHtml,
} from '../services/pdfSummaryService';
import {
  X,
  FileDown,
  Printer,
  BookOpen,
  Sparkles,
  Search,
  Check,
  Eye,
  Layers,
  ChevronRight,
  HelpCircle,
  Download,
  Info,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface SubjectPdfSummariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const SubjectPdfSummariesModal: React.FC<SubjectPdfSummariesModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const grade = user.grade || '6_fund';
  const availableSubjects = getSubjectsForGrade(grade);
  const gradeInfo = GRADE_LABELS[grade] || { short: 'Série Escolar', full: 'Ensino Fundamental' };

  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customSummaries, setCustomSummaries] = useState<TopicSummaryItem[]>(
    CURRICULUM_SUMMARIES_DATABASE
  );
  const [previewItem, setPreviewItem] = useState<TopicSummaryItem | null>(null);

  // Custom AI Topic Generator states
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [customSubjectInput, setCustomSubjectInput] = useState<SubjectId>('matematica');
  const [showAiTopicPrompt, setShowAiTopicPrompt] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  if (!isOpen) return null;

  // Filtered summaries
  const filteredSummaries = customSummaries.filter((item) => {
    const matchesSubject = selectedSubject === 'all' || item.subjectId === selectedSubject;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.howItIsDone.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Action: Open PDF Print Dialog (Save as PDF)
  const handlePrintOrSavePdf = (subjectFilter: SubjectId | 'all' = selectedSubject) => {
    soundEffects.playClick();
    openPdfPrintWindow({
      studentName: user.name || 'Estudante',
      grade,
      subjectFilter,
      customSummaries,
    });
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 4000);
  };

  // Action: Download direct file
  const handleDirectDownload = (subjectFilter: SubjectId | 'all' = selectedSubject) => {
    soundEffects.playClick();
    const html = generatePrintablePdfHtml({
      studentName: user.name || 'Estudante',
      grade,
      subjectFilter,
      customSummaries,
    });
    const subLabel = subjectFilter === 'all' ? 'Completo_Todas_Materias' : subjectFilter;
    downloadHtmlFile({
      htmlContent: html,
      fileName: `Resumo_${subLabel}_${(user.name || 'Aluno').replace(/\s+/g, '_')}.html`,
    });
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 4000);
  };

  // Action: Generate Custom Topic with AI in the same pedagogical structure
  const handleGenerateAiTopic = async () => {
    if (!customTopicInput.trim()) return;
    soundEffects.playClick();
    setIsGeneratingCustom(true);

    try {
      const res = await fetch('/api/ai/topic-theory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopicInput.trim(),
          subjectId: customSubjectInput,
          gradeLevel: grade,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newItem: TopicSummaryItem = {
          id: `custom_${Date.now()}`,
          topic: data.topic || customTopicInput.trim(),
          subjectId: customSubjectInput,
          subjectName:
            availableSubjects.find((s) => s.id === customSubjectInput)?.name || 'Matéria',
          icon: '✨',
          howItIsDone: {
            definition: data.conceptSummary || 'Definição e conceito essencial do assunto.',
            steps: data.howToSolveStepByStep || [
              '1. Leia o enunciado e identifique os dados principais.',
              '2. Aplique a regra conceitual correspondente.',
              '3. Realize os cálculos ou análise lógica.',
            ],
            rulesOrFormulas: data.rulesAndFormulas || [],
          },
          examples: [
            {
              title: 'Exemplo Prático Resolvido',
              statement: data.similarExample?.problem || 'Problema de aplicação do assunto.',
              stepByStepSolution:
                data.similarExample?.solutionStep || 'Passo a passo da resolução.',
              result: data.similarExample?.finalTakeaway || 'Resultado final da questão.',
            },
          ],
          goldenTip: data.goldenTip || 'Revise a tabuada e os conceitos básicos antes da prova!',
        };

        setCustomSummaries((prev) => [newItem, ...prev]);
        setPreviewItem(newItem);
        setCustomTopicInput('');
        setShowAiTopicPrompt(false);
        soundEffects.playCorrect('bonus');
      } else {
        throw new Error('Erro ao gerar');
      }
    } catch (e) {
      console.error(e);
      // Local fallback topic
      const fallbackItem: TopicSummaryItem = {
        id: `custom_${Date.now()}`,
        topic: customTopicInput.trim(),
        subjectId: customSubjectInput,
        subjectName:
          availableSubjects.find((s) => s.id === customSubjectInput)?.name || 'Matéria',
        icon: '📝',
        howItIsDone: {
          definition: `Resumo do assunto ${customTopicInput.trim()} para estudo escolar.`,
          steps: [
            '1. Entenda os termos fundamentais da matéria.',
            '2. Identifique os passos para solucionar os exercícios.',
            '3. Aplique as propriedades e regras nas questões da apostila.',
          ],
          rulesOrFormulas: ['Revise a matéria periodicamente para fixar na memória de longo prazo.'],
        },
        examples: [
          {
            title: `Exemplo de aplicação: ${customTopicInput.trim()}`,
            statement: `Como resolver uma questão típica sobre ${customTopicInput.trim()}?`,
            stepByStepSolution:
              'Identifique os dados fornecidos, aplique a fórmula ou regra teórica e confira a coerência do resultado.',
            result: 'Resolução estruturada com sucesso.',
          },
        ],
        goldenTip: 'Anote os pontos principais no seu caderno e pratique com exercícios variados!',
      };

      setCustomSummaries((prev) => [fallbackItem, ...prev]);
      setPreviewItem(fallbackItem);
      setCustomTopicInput('');
      setShowAiTopicPrompt(false);
      soundEffects.playCorrect('standard');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Baixar Resumo das Matérias em PDF
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {gradeInfo.short}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Resumos didáticos com "Como se faz" passo a passo e "Exemplos resolvidos"
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout: Baixar Completo em PDF */}
        <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/50 border-b border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Apostila Completa da Série em PDF
            </span>
            <p className="text-[11px] text-slate-600">
              Gera um documento formatado com todas as disciplinas pronto para imprimir ou salvar
              em PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handlePrintOrSavePdf('all')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            <button
              onClick={() => handleDirectDownload('all')}
              className="px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Baixar arquivo offline"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {downloadSuccessToast && (
          <div className="bg-emerald-50 border-y border-emerald-200 px-4 py-2 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Documento em PDF gerado com sucesso! Escolha "Salvar como PDF" no menu de impressão.</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Controls: Subject Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Subject Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedSubject('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#161f36] text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                📚 Todas ({customSummaries.length})
              </button>

              {availableSubjects.map((sub) => {
                const count = customSummaries.filter((c) => c.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSubject(sub.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                      selectedSubject === sub.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-[#161f36] text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar assunto (ex: Multiplicação)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121829] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* AI Generator Toggle Banner */}
          <div className="bg-[#121829] border border-[#273553] rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                ✨
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Precisa do resumo de outro assunto específico?
                </span>
                <span className="text-[11px] text-slate-400">
                  Gere resumos pedagógicos de qualquer conteúdo com IA no mesmo formato.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                setShowAiTopicPrompt((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAiTopicPrompt ? 'Ocultar' : 'Adicionar Assunto'}</span>
            </button>
          </div>

          {/* AI Generator Input Box */}
          {showAiTopicPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161e38] to-[#121829] border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nome do assunto (Ex: Teorema de Pitágoras, Concordância Verbal, Célula Vegetal)..."
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  className="flex-1 bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                <select
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value as SubjectId)}
                  className="bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateAiTopic}
                  disabled={isGeneratingCustom || !customTopicInput.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isGeneratingCustom || !customTopicInput.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {isGeneratingCustom ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Criar Resumo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* List of Topic Summary Cards */}
          <div className="space-y-3">
            {filteredSummaries.length > 0 ? (
              filteredSummaries.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121829] border border-[#273553] hover:border-indigo-500/50 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5 transition"
                >
                  {/* Topic Title and Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#1a233a] border border-slate-700 flex items-center justify-center text-lg shadow-sm shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                          {item.topic}
                        </h3>
                        <span className="text-[11px] font-bold text-indigo-400">
                          {item.subjectName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handlePrintOrSavePdf(item.subjectId)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Imprimir ou Salvar resumo desta matéria em PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir {item.subjectName}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. SE FAZ DE TAL JEITO (Como se faz) */}
                  <div className="p-3.5 rounded-2xl bg-[#162035] border-l-4 border-indigo-500 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                        ⚙️ Como se faz (Regras Passo a Passo):
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                      {item.howItIsDone.definition}
                    </p>

                    <div className="space-y-1 pt-1">
                      {item.howItIsDone.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] sm:text-xs text-slate-300 flex items-start gap-1.5"
                        >
                          <span className="text-indigo-400 font-bold shrink-0">•</span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>

                    {item.howItIsDone.rulesOrFormulas &&
                      item.howItIsDone.rulesOrFormulas.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-[#0b0f19]/70 border border-slate-700/60 mt-2 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-300 uppercase block">
                            📌 Regras & Propriedades:
                          </span>
                          {item.howItIsDone.rulesOrFormulas.map((r, idx) => (
                            <p key={idx} className="text-[11px] text-slate-300">
                              • {r}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* 2. EXEMPLOS (Exemplos práticos) */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-sky-400 tracking-wider block">
                      📝 Exemplos Práticos Resolvidos:
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      {item.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#0e1628] border border-slate-700/70 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{ex.title}</span>
                          </div>

                          <div className="p-2 rounded-xl bg-[#141d33] border-l-2 border-sky-400 text-xs font-serif text-slate-200 italic">
                            "{ex.statement}"
                          </div>

                          <div className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed pl-1">
                            <span className="font-bold text-slate-200">Resolução: </span>
                            {ex.stepByStepSolution}
                          </div>

                          <div className="text-xs font-extrabold text-emerald-400 pt-0.5">
                            ✔ {ex.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. DICA DE OURO */}
                  {item.goldenTip && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                      <span className="text-base">💡</span>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                          Dica de Ouro para não errar em provas:
                        </span>
                        <p className="text-xs font-medium text-amber-100 leading-relaxed">
                          {item.goldenTip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhum resumo encontrado</h4>
                <p className="text-xs text-slate-500">
                  Tente buscar por outro termo ou use o botão "Adicionar Assunto" acima.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#121829] border-t border-[#273553] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>
              Ao clicar em <strong>Imprimir</strong>, selecione a opção{' '}
              <strong>"Salvar como PDF"</strong> no seu navegador ou celular.
            </span>
          </div>

          <button
            onClick={() => handlePrintOrSavePdf(selectedSubject)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              Baixar {selectedSubject === 'all' ? 'Todas as Matérias' : 'Matéria Selecionada'} em PDF
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
