import React, { useState, useEffect } from 'react';
import { GradeLevel, GradingPeriodType, ReportCardData, SubjectGradeEntry, UserProfile } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { reportCardService, SubjectEstimatedGrade } from '../services/reportCardService';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Share2,
  Check,
  TrendingUp,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ isOpen, onClose, user }) => {
  const [reportData, setReportData] = useState<ReportCardData>(() =>
    reportCardService.getData(user.grade)
  );
  const [estimatedGrades, setEstimatedGrades] = useState<Record<string, SubjectEstimatedGrade>>(() =>
    reportCardService.getAllEstimatedGrades()
  );
  const [isCopied, setIsCopied] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReportData(reportCardService.getData(user.grade));
      setEstimatedGrades(reportCardService.getAllEstimatedGrades());
    }
  }, [isOpen, user.grade]);

  if (!isOpen) return null;

  const totalPeriods = reportData.periodType === 'bimonthly' ? 4 : 3;
  const periodLabels =
    reportData.periodType === 'bimonthly'
      ? ['1º Bim', '2º Bim', '3º Bim', '4º Bim']
      : ['1º Trim', '2º Trim', '3º Trim'];

  const stats = reportCardService.calculateOverallStats(reportData);

  const handleGradeChange = (subjectIndex: number, periodIndex: number, valueStr: string) => {
    const updated = { ...reportData, subjects: [...reportData.subjects] };
    const targetSubject = { ...updated.subjects[subjectIndex] };
    const newGrades = [...targetSubject.grades];

    if (valueStr.trim() === '') {
      newGrades[periodIndex] = null;
    } else {
      const parsed = parseFloat(valueStr.replace(',', '.'));
      if (!isNaN(parsed)) {
        const clamped = Math.max(0, Math.min(100, Math.round(parsed * 10) / 10));
        newGrades[periodIndex] = clamped;
      }
    }

    targetSubject.grades = newGrades;
    updated.subjects[subjectIndex] = targetSubject;

    setReportData(updated);
    reportCardService.saveData(updated);
  };

  const handleApplyEstimate = (subjectIndex: number, periodIndex: number, estimatedVal: number) => {
    soundEffects.playCorrect('bonus');
    handleGradeChange(subjectIndex, periodIndex, String(estimatedVal));
  };

  const handlePeriodTypeChange = (newType: GradingPeriodType) => {
    soundEffects.playClick();
    const updated: ReportCardData = {
      ...reportData,
      periodType: newType,
      subjects: reportData.subjects.map((s) => ({
        ...s,
        grades: newType === 'bimonthly' ? [s.grades[0] ?? null, s.grades[1] ?? null, s.grades[2] ?? null, s.grades[3] ?? null] : [s.grades[0] ?? null, s.grades[1] ?? null, s.grades[2] ?? null],
      })),
    };
    setReportData(updated);
    reportCardService.saveData(updated);
  };

  const handlePassingGradeChange = (newPassing: number) => {
    soundEffects.playClick();
    const updated: ReportCardData = {
      ...reportData,
      passingGrade: newPassing,
    };
    setReportData(updated);
    reportCardService.saveData(updated);
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    soundEffects.playClick();
    const newEntry: SubjectGradeEntry = {
      subjectId: `custom_${Date.now()}`,
      subjectName: newSubjectName.trim(),
      isCustom: true,
      grades: reportData.periodType === 'bimonthly' ? [null, null, null, null] : [null, null, null],
    };

    const updated: ReportCardData = {
      ...reportData,
      subjects: [...reportData.subjects, newEntry],
    };

    setReportData(updated);
    reportCardService.saveData(updated);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const handleDeleteSubject = (subjectIndex: number) => {
    soundEffects.playClick();
    const updated: ReportCardData = {
      ...reportData,
      subjects: reportData.subjects.filter((_, idx) => idx !== subjectIndex),
    };
    setReportData(updated);
    reportCardService.saveData(updated);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Deseja restaurar as matérias padrão da sua série e limpar as notas?')) {
      soundEffects.playClick();
      const defaultData = reportCardService.getDefaultData(user.grade);
      setReportData(defaultData);
      reportCardService.saveData(defaultData);
    }
  };

  const handleCopyReport = () => {
    soundEffects.playClick();
    const dateStr = new Date().toLocaleDateString('pt-BR');
    let text = `📊 BOLETIM ESCOLAR - ${user.name || 'Estudante'}\n`;
    text += `Série: ${GRADE_LABELS[user.grade]?.full || 'Ensino Fundamental'}\n`;
    text += `Data: ${dateStr}\n`;
    text += `Escala de Notas: 0 a 100 (Nota Máxima: 100)\n`;
    text += `Média para Aprovação: ${reportData.passingGrade} pts\n`;
    text += `Classificação: ≥ ${reportData.passingGrade} (Aprovado) | 40-59 (Baixo da Média) | < 40 (Crítico)\n`;
    text += `------------------------------------\n\n`;

    reportData.subjects.forEach((subj) => {
      const { average } = reportCardService.calculateSubjectAverage(subj.grades);
      const gradesFormatted = subj.grades
        .slice(0, totalPeriods)
        .map((g, i) => `${periodLabels[i]}: ${g !== null ? g : '-'}`)
        .join(' | ');

      const est = estimatedGrades[subj.subjectId];
      const estText = est ? ` • Est. Jornada: ${est.estimatedGrade100} pts (${est.estimatedGrade10}/10)` : '';

      const status =
        average === null
          ? 'Em Andamento'
          : average >= reportData.passingGrade
          ? '✅ APROVADO'
          : average >= 40
          ? '⚠️ BAIXO DA MÉDIA (40 - 59)'
          : '❌ CRÍTICO (< 40)';

      text += `📚 ${subj.subjectName}\n`;
      text += `Notas Oficiais: ${gradesFormatted}\n`;
      text += `Média Atual: ${average !== null ? average.toFixed(1) : 'Sem notas'} pts${estText} • Status: ${status}\n\n`;
    });

    text += `------------------------------------\n`;
    text += `🏆 Média Geral: ${stats.overallAverage !== null ? stats.overallAverage.toFixed(1) : '-'} pts\n`;
    text += `Aprovadas: ${stats.passedSubjectsCount} | Em Atenção/Baixo: ${stats.atRiskSubjectsCount} | Pendentes: ${stats.pendingSubjectsCount}\n`;
    text += `Gerado no Estudahud BNCC 🚀`;

    try {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 border border-blue-400 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Meu Boletim Escolar & Estimativas</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                  {GRADE_LABELS[user.grade]?.short}
                </span>
              </h2>
              <p className="text-[10px] text-slate-300">
                Notas reais da sua escola + notas simuladas pelos exercícios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowSettings(!showSettings);
              }}
              className={`p-1.5 rounded-xl border transition ${
                showSettings
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Ajustar Sistema de Avaliação (Bimestral/Trimestral e Média)"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SETTINGS ACCORDION */}
        {showSettings && (
          <div className="p-3.5 bg-blue-50 border-b border-blue-200 space-y-3 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-950">
              <span>Configuração da Escola</span>
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-rose-600 font-semibold transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* PERIOD TYPE */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Divisão do Ano:
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-white border border-slate-300 rounded-xl">
                  <button
                    onClick={() => handlePeriodTypeChange('bimonthly')}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      reportData.periodType === 'bimonthly'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    4 Bimestres
                  </button>
                  <button
                    onClick={() => handlePeriodTypeChange('trimonthly')}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      reportData.periodType === 'trimonthly'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    3 Trimestres
                  </button>
                </div>
              </div>

              {/* PASSING GRADE */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Média para Passar (0 a 100):
                </label>
                <div className="flex items-center gap-1.5">
                  {[50, 60, 70, 75].map((val) => (
                    <button
                      key={val}
                      onClick={() => handlePassingGradeChange(val)}
                      className={`flex-1 py-1 text-xs font-black rounded-xl border transition ${
                        reportData.passingGrade === val
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCALE & CRITERIA BANNER */}
        <div className="px-3.5 py-1.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[10px] shrink-0 font-bold">
          <div className="flex items-center gap-1 text-slate-700">
            <span>Nota Máxima: <strong className="text-slate-900 font-black">100 pts (10,0)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              ≥ {reportData.passingGrade}: Aprovado
            </span>
            <span className="text-amber-700 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
              40–59: Baixo da Média
            </span>
            <span className="text-rose-700 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
              &lt; 40: Crítico
            </span>
          </div>
        </div>

        {/* OVERALL STATS SUMMARY BANNER */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Média Geral Oficial
              </span>
              <span className="text-base font-black text-blue-700">
                {stats.overallAverage !== null ? stats.overallAverage.toFixed(1) : '-'}
              </span>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Aprovadas (≥ {reportData.passingGrade})
              </span>
              <span className="text-base font-black text-emerald-700">
                {stats.passedSubjectsCount} / {stats.totalSubjectsCount}
              </span>
            </div>

            <div className="p-2 bg-amber-50 border border-amber-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                Em Atenção / Baixo
              </span>
              <span className="text-base font-black text-amber-700">
                {stats.atRiskSubjectsCount}
              </span>
            </div>
          </div>
        </div>

        {/* SUBJECTS GRADE LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {reportData.subjects.map((subj, sIdx) => {
            const { average, filledCount } = reportCardService.calculateSubjectAverage(subj.grades);
            const neededInfo = reportCardService.calculateNeededGradeForPassing(
              subj.grades,
              reportData.periodType,
              reportData.passingGrade
            );
            const estimated = estimatedGrades[subj.subjectId] || reportCardService.getEstimatedSubjectGrade(subj.subjectId, subj.subjectName);

            const isPassed = average !== null && average >= reportData.passingGrade;
            const isWarning = average !== null && average >= 40 && average < reportData.passingGrade;
            const isCritical = average !== null && average < 40;

            return (
              <div
                key={subj.subjectId || sIdx}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 hover:border-slate-300 transition"
              >
                {/* SUBJECT TITLE & AVERAGE HEADER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {subj.subjectName}
                    </span>
                    {subj.isCustom && (
                      <button
                        onClick={() => handleDeleteSubject(sIdx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                        title="Remover matéria personalizada"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                        average === null
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : isPassed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isWarning
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isWarning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {isCritical && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span>
                        {average === null
                          ? 'Sem notas reais'
                          : isPassed
                          ? `Aprovado (${average.toFixed(1)})`
                          : isWarning
                          ? `Baixo (${average.toFixed(1)})`
                          : `Crítico (${average.toFixed(1)})`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* GRADE INPUTS ROW (NOTAS REAIS DA ESCOLA) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>Notas Oficiais da Escola (Digite aqui):</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: totalPeriods }).map((_, pIdx) => {
                      const gradeVal = subj.grades[pIdx];
                      const gradeDisplay = gradeVal !== null && gradeVal !== undefined ? gradeVal.toString() : '';

                      return (
                        <div key={pIdx} className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block text-center">
                            {periodLabels[pIdx]}
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradeDisplay}
                            onChange={(e) => handleGradeChange(sIdx, pIdx, e.target.value)}
                            className={`w-full py-1.5 px-1 text-center font-bold text-xs rounded-xl border transition outline-none ${
                              gradeVal !== null
                                ? gradeVal >= reportData.passingGrade
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 focus:ring-2 focus:ring-emerald-400'
                                  : gradeVal >= 40
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 focus:ring-2 focus:ring-amber-400'
                                  : 'bg-rose-50/70 border-rose-300 text-rose-950 focus:ring-2 focus:ring-rose-400'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-400'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SIMULATED ESTIMATED GRADE FROM JOURNEY EXERCISES */}
                <div className="p-2.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[10px] font-black text-purple-950">
                        Nota Estimada pelos Exercícios da Jornada:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-purple-900 bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                        {estimated.estimatedGrade100} pts ({estimated.estimatedGrade10.toFixed(1)} / 10,0)
                      </span>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {estimated.totalAttempts > 0
                          ? `(${estimated.correctAttempts}/${estimated.totalAttempts} acertos • ${estimated.classification})`
                          : '(Faça lições na Jornada para calibrar)'}
                      </span>
                    </div>
                  </div>

                  {/* Button to auto-fill an empty period with estimated grade */}
                  {Array.from({ length: totalPeriods }).some((_, i) => subj.grades[i] === null) && (
                    <button
                      onClick={() => {
                        const firstEmptyIdx = subj.grades.findIndex((g) => g === null);
                        if (firstEmptyIdx !== -1) {
                          handleApplyEstimate(sIdx, firstEmptyIdx, estimated.estimatedGrade100);
                        }
                      }}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shrink-0 shadow-xs"
                      title="Usar nota simulada no próximo bimestre vazio"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Preencher</span>
                    </button>
                  )}
                </div>

                {/* PASSING FORECAST TIP */}
                {filledCount > 0 && filledCount < totalPeriods && (
                  <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3 text-blue-600" />
                      <span>Meta p/ aprovação ({reportData.passingGrade} pts):</span>
                    </span>
                    {neededInfo.isAlreadyPassed ? (
                      <span className="font-bold text-emerald-700">
                        🎉 Já atingiu os pontos necessários!
                      </span>
                    ) : neededInfo.isImpossible ? (
                      <span className="font-bold text-rose-700">
                        Necessita recuperação final (&gt;100 pts)
                      </span>
                    ) : (
                      <span className="font-bold text-blue-700">
                        Média de <strong>{neededInfo.neededAverageInRemaining?.toFixed(1)}</strong> nos períodos restantes
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ADD CUSTOM SUBJECT BUTTON OR FORM */}
          {!showAddSubject ? (
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowAddSubject(true);
              }}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Outra Disciplina (Ex: Redação, Arte, Filosofia)</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddCustomSubject}
              className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in"
            >
              <label className="text-xs font-bold text-blue-950 block">
                Nome da Nova Disciplina:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Redação, Educação Física, Artes..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition active:scale-95 shadow-xs"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-xl font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 gap-2">
          <button
            onClick={handleCopyReport}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs active:scale-95'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Boletim Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar / Compartilhar Notas</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition active:scale-95 shadow-xs text-center"
          >
            Concluir & Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
