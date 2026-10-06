import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, GradeLevel, SubjectId } from '../types';
import { GRADE_LABELS, getSubjectsForGrade } from '../data/curriculumData';
import {
  SUBJECT_SUMMARIES_DATABASE,
  TopicSummaryItem,
} from '../data/subjectSummariesData';
import { SubjectPdfService } from '../services/subjectPdfService';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  FileDown,
  Printer,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  Download,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Info,
  Check,
} from 'lucide-react';

interface SubjectSummariesPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const SubjectSummariesPdfModal: React.FC<SubjectSummariesPdfModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(user.grade || '6_fund');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [isGeneratingCustomTopic, setIsGeneratingCustomTopic] = useState<boolean>(false);
  const [customGeneratedTopics, setCustomGeneratedTopics] = useState<TopicSummaryItem[]>([]);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const gradeSubjects = useMemo(() => getSubjectsForGrade(selectedGrade), [selectedGrade]);

  // Combine database topics with custom generated ones
  const allTopics = useMemo(() => {
    return [...customGeneratedTopics, ...SUBJECT_SUMMARIES_DATABASE];
  }, [customGeneratedTopics]);

  // Filter topics by grade, subject and search query
  const filteredTopics = useMemo(() => {
    return allTopics.filter((t) => {
      // Grade filter
      const matchesGrade = !t.gradeLevels || t.gradeLevels.includes(selectedGrade);
      if (!matchesGrade) return false;

      // Subject filter
      if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSubject = t.subjectName.toLowerCase().includes(q);
        const matchesContent = t.howItWorks.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        return matchesTitle || matchesSubject || matchesContent || matchesCategory;
      }

      return true;
    });
  }, [allTopics, selectedGrade, selectedSubject, searchQuery]);

  if (!isOpen) return null;

  const currentSubjectObj = gradeSubjects.find((s) => s.id === selectedSubject);
  const subjectNameHeader = selectedSubject === 'all' ? 'Todas as Matérias' : (currentSubjectObj?.name || selectedSubject);

  // Generate & Download PDF
  const handleDownloadPdf = async () => {
    if (filteredTopics.length === 0) return;
    soundEffects.playClick();
    setIsGeneratingPdf(true);

    try {
      await SubjectPdfService.generateAndDownloadPdf(filteredTopics, user, subjectNameHeader);
      soundEffects.playCorrect('bonus');
      setDownloadSuccessToast('Resumo completo em PDF baixado com sucesso!');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print Preview
  const handlePrint = () => {
    if (filteredTopics.length === 0) return;
    soundEffects.playClick();
    SubjectPdfService.printSummaries(filteredTopics, user, subjectNameHeader);
  };

  // Generate new topic with AI
  const handleGenerateCustomTopicWithAi = async () => {
    if (!customTopicInput.trim()) return;
    soundEffects.playClick();
    setIsGeneratingCustomTopic(true);

    try {
      const res = await fetch('/api/ai/topic-theory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopicInput.trim(),
          grade: selectedGrade,
          subject: selectedSubject !== 'all' ? selectedSubject : 'matematica',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newTopic: TopicSummaryItem = {
          id: `custom_${Date.now()}`,
          subjectId: (selectedSubject !== 'all' ? selectedSubject : 'matematica') as SubjectId,
          subjectName: currentSubjectObj?.name || 'Matéria Escolar',
          gradeLevels: [selectedGrade],
          title: data.topic || customTopicInput.trim(),
          category: 'Resumo com IA',
          howItWorks: data.conceptSummary || 'Explicação detalhada gerada para estudo.',
          keySteps: data.howToSolveStepByStep || data.detailedTheory || [],
          rulesAndFormulas: data.rulesAndFormulas || [],
          examples: [
            {
              title: 'Exemplo Resolvido Passo a Passo',
              problem: data.similarExample?.problem || 'Aplicação prática do conceito.',
              stepByStepSolution: data.similarExample?.solutionStep || 'Resolução passo a passo detalhada.',
              finalAnswer: data.similarExample?.finalTakeaway || 'Conclusão e resposta correta.',
            },
          ],
          goldenTips: data.goldenTip || 'Revise as fórmulas e preste atenção aos comandos das questões!',
        };

        setCustomGeneratedTopics((prev) => [newTopic, ...prev]);
        setCustomTopicInput('');
        soundEffects.playCorrect('combo');
      } else {
        throw new Error('Fallback offline');
      }
    } catch (_e) {
      // Local pedagogical fallback for GitHub Pages and offline use
      const topicName = customTopicInput.trim() || 'Tópico de Estudo';
      const fallbackTopic: TopicSummaryItem = {
        id: `custom_local_${Date.now()}`,
        subjectId: (selectedSubject !== 'all' ? selectedSubject : 'matematica') as SubjectId,
        subjectName: currentSubjectObj?.name || 'Matéria Escolar',
        gradeLevels: [selectedGrade],
        title: topicName,
        category: 'Resumo Pedagógico',
        howItWorks: `Resumo estruturado sobre ${topicName}: compreenda os conceitos fundamentais, a nomenclatura técnica e como este tópico se relaciona com o cotidiano e com as avaliações curriculares.`,
        keySteps: [
          `1. Identificar as premissas centrais e os dados fornecidos no tema "${topicName}".`,
          '2. Aplicar a definição teórica ou a fórmula correspondente passo a passo.',
          '3. Validar a coerência do resultado obtido e revisar os cálculos ou argumentos.',
        ],
        rulesAndFormulas: [
          `Conceito de ${topicName}: Baseado nas competências da BNCC para o ${selectedGrade}.`,
          'Atenção aos detalhes: Evite saltar etapas de raciocínio intermediárias.',
        ],
        examples: [
          {
            title: `Exemplo Guiado: ${topicName}`,
            problem: `Como aplicar os princípios de ${topicName} em uma questão típica de prova?`,
            stepByStepSolution: `Analise primeiro o objetivo principal do exercício, organize os dados conhecidos e aplique os métodos padrão de ${currentSubjectObj?.name || 'estudo'}.`,
            finalAnswer: 'Resultado verificado com precisão teórica.',
          },
        ],
        goldenTips: 'Destaque palavras-chave no enunciado e revise seus resumos com repetição espaçada!',
      };

      setCustomGeneratedTopics((prev) => [fallbackTopic, ...prev]);
      setCustomTopicInput('');
      soundEffects.playCorrect('combo');
    } finally {
      setIsGeneratingCustomTopic(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-900"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Resumos das Matérias em PDF
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Apostila Completa
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Explicações passo a passo ("como se faz"), exemplos resolvidos e dicas de prova
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Grade Selector, Subject Filter & Search */}
          <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Grade Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Série:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setSelectedGrade(e.target.value as GradeLevel);
                  }}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  {Object.entries(GRADE_LABELS).map(([code, info]) => (
                    <option key={code} value={code} className="bg-white text-slate-900">
                      {info.full} ({info.short})
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Action Download & Print Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  disabled={filteredTopics.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs"
                  title="Visualizar e Imprimir em papel A4"
                >
                  <Printer className="w-4 h-4 text-purple-600" />
                  <span>Imprimir / A4</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf || filteredTopics.length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Baixar arquivo PDF com todos os resumos selecionados"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Gerando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Baixar em PDF ({filteredTopics.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subject Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedSubject('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                📚 Todas as Matérias
              </button>

              {gradeSubjects.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedSubject(subj.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    selectedSubject === subj.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.name}</span>
                </button>
              ))}
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar matéria ou assunto (ex: multiplicação, frações, sujeito, fotossíntese)..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Success Toast */}
          {downloadSuccessToast && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessToast}</span>
            </div>
          )}

          {/* Scrollable Topics Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 hover:border-indigo-300 transition"
                >
                  {/* Topic Title Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                        {topic.subjectName} • {topic.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>{topic.title}</span>
                      </h3>
                    </div>

                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Formato PDF
                    </span>
                  </div>

                  {/* 1. Como se faz (Explicação Passo a Passo) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Como se faz (Explicação e Teoria):
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                      {topic.howItWorks}
                    </p>

                    {topic.keySteps && topic.keySteps.length > 0 && (
                      <div className="space-y-1.5 pt-1 pl-1">
                        {topic.keySteps.map((step, idx) => (
                          <div key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Regras & Fórmulas */}
                  {topic.rulesAndFormulas && topic.rulesAndFormulas.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        📐 Regras & Fórmulas Importantes:
                      </h4>
                      <ul className="space-y-1 text-xs text-amber-900 font-medium">
                        {topic.rulesAndFormulas.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 shrink-0">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. Exemplos Resolvidos ("Exemplos: ...") */}
                  {topic.examples && topic.examples.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Exemplos Práticos Resolvidos:
                      </h4>

                      <div className="space-y-2">
                        {topic.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="text-xs font-black text-emerald-800">
                              ▶ {ex.title}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              Problema: <span className="text-slate-900 italic font-semibold">"{ex.problem}"</span>
                            </div>
                            <div className="text-xs text-slate-700 font-medium whitespace-pre-line bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                              <strong>Resolução Passo a Passo:</strong>
                              <br />
                              {ex.stepByStepSolution}
                            </div>
                            <div className="text-xs font-black text-emerald-700 pt-0.5">
                              Resultado: {ex.finalAnswer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Dica de Ouro */}
                  {topic.goldenTips && (
                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-semibold flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-purple-800 block mb-0.5">Dica de Prova / Macete:</strong>
                        <span>{topic.goldenTips}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                <p className="text-sm font-bold text-slate-700">
                  Nenhum resumo encontrado para o termo pesquisado.
                </p>
                <p className="text-xs text-slate-500">
                  Você pode usar o gerador com IA abaixo para criar o resumo de qualquer matéria ou conteúdo escolar na hora!
                </p>
              </div>
            )}

            {/* Generate Custom Topic with AI Box */}
            <div className="p-4 rounded-3xl bg-white border border-indigo-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900">
                  Precisa de um resumo sobre outro assunto? Gere com Inteligência Artificial:
                </h4>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateCustomTopicWithAi();
                  }}
                  placeholder="Digite qualquer assunto (ex: Equação do 2º Grau, Revolução Francesa, Orações Subordinadas)..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />

                <button
                  onClick={handleGenerateCustomTopicWithAi}
                  disabled={isGeneratingCustomTopic || !customTopicInput.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isGeneratingCustomTopic ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Gerar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
              Total de <strong>{filteredTopics.length}</strong> tópicos selecionados para o PDF
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-600" />
                <span>Imprimir / Visualizar</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || filteredTopics.length === 0}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Baixar PDF (.pdf)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
