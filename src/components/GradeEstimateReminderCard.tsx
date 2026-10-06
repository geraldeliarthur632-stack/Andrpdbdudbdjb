import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Camera,
  Zap,
  Bell,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export interface GradeEstimateReminderCardProps {
  onOpenPhotoExam?: () => void;
  onStartExam?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
}

interface HistoricalEstimate {
  id: string;
  subject: string;
  score: number;
  gradeEstimate10: number;
  maxExamScore?: number;
  scaledScore?: number;
  classification: string;
  examTitle: string;
  date: string;
  timestamp: number;
}

export const GradeEstimateReminderCard: React.FC<GradeEstimateReminderCardProps> = ({
  onOpenPhotoExam,
  onStartExam,
  onOpenReminders,
  onOpenCalendar,
}) => {
  const [history, setHistory] = useState<HistoricalEstimate[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderFrequency, setReminderFrequency] = useState<number>(2); // days

  // Safe action callbacks
  const handlePhotoExam = () => {
    soundEffects.playClick();
    if (typeof onOpenPhotoExam === 'function') {
      onOpenPhotoExam();
    } else if (typeof onStartExam === 'function') {
      onStartExam();
    }
  };

  const handleReminders = () => {
    soundEffects.playClick();
    if (typeof onOpenReminders === 'function') {
      onOpenReminders();
    } else if (typeof onOpenCalendar === 'function') {
      onOpenCalendar();
    } else {
      setIsReminderModalOpen(true);
    }
  };

  // Load history and reminder settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('estudahud_grade_estimates_history_v1');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const latest = history[0];

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-950 border-emerald-300';
    if (score >= 70) return 'bg-blue-100 text-blue-950 border-blue-300';
    if (score >= 60) return 'bg-amber-100 text-amber-950 border-amber-300';
    return 'bg-rose-100 text-rose-950 border-rose-300';
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    const filtered = history.filter((item) => item.id !== id);
    setHistory(filtered);
    try {
      localStorage.setItem('estudahud_grade_estimates_history_v1', JSON.stringify(filtered));
    } catch {}
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-2 border-indigo-500/30 rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-inner">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">
                  Estimador de Nota Escolar & IA
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                  Ultra Rápido ⚡
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/90 font-medium">
                Tire foto do caderno, defina o valor da prova e teste sua nota antes da escola!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsReminderModalOpen(true);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white border border-white/10 transition active:scale-95 shrink-0"
            title="Ver histórico e lembretes de teste"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* Latest Estimate Display */}
        {latest ? (
          <div
            onClick={() => setIsReminderModalOpen(true)}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center justify-between transition cursor-pointer active:scale-[0.99] relative z-10"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-indigo-300">
                  Último Teste Realizado:
                </span>
                <span className="text-[10px] text-white/60 font-medium">
                  {latest.date}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                {latest.examTitle || `Prova de ${latest.subject}`}
              </h4>

              <div className="flex items-center gap-2 pt-0.5">
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${getScoreBadgeColor(
                    latest.score
                  )}`}
                >
                  {latest.maxExamScore && latest.scaledScore !== undefined
                    ? `Nota: ${latest.scaledScore.toFixed(1)} / ${latest.maxExamScore}`
                    : `Nota: ${latest.gradeEstimate10.toFixed(1)} / 10,0`}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">
                  {latest.classification}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-indigo-300 shrink-0" />
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-indigo-100 relative z-10">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Nenhum teste de prova realizado ainda
              </span>
              <p className="text-[10px] text-indigo-200">
                Tire foto do seu caderno ou livro para a IA gerar a prova e calcular sua nota em segundos!
              </p>
            </div>
            <span className="text-lg">📸</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-0.5 relative z-10">
          <button
            onClick={handlePhotoExam}
            className="w-full p-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-center group cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-950 group-hover:scale-110 transition" />
            <span>Criar Prova por Foto 📸</span>
          </button>
        </div>
      </div>

      {/* HISTORICAL ESTIMATES & REMINDER MODAL */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Histórico & Lembretes de Prova
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Acompanhe a evolução da sua nota estimada
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Histórico de Estimativas ({history.length}):
              </span>

              {history.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  Nenhum teste de prova realizado ainda. Use o criador de provas por foto para treinar!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {item.examTitle || item.subject}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {item.classification}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl border ${getScoreBadgeColor(
                            item.score
                          )}`}
                        >
                          {item.maxExamScore && item.scaledScore !== undefined
                            ? `${item.scaledScore.toFixed(1)} / ${item.maxExamScore}`
                            : `${item.gradeEstimate10.toFixed(1)} / 10`}
                        </span>

                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Excluir histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsReminderModalOpen(false);
                  handlePhotoExam();
                }}
                className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Nova Prova com Foto</span>
              </button>

              <button
                onClick={() => {
                  setIsReminderModalOpen(false);
                  handleReminders();
                }}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ver Calendário</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
