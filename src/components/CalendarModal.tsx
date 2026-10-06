import React, { useState, useEffect, useMemo } from 'react';
import { ExamEntry, GradeLevel, SubjectId } from '../types';
import { SUBJECTS, getSubjectsForGrade } from '../data/curriculumData';
import { notificationService } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Bell,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  Play,
} from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubjectToStudy?: (subjectId: SubjectId) => void;
  userGrade?: GradeLevel;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  matematica: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-600' },
  portugues: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600' },
  ciencias: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-600' },
  historia: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-600' },
  geografia: { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-600' },
  fisica: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-600' },
  quimica: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-600' },
  biologia: { bg: 'bg-lime-100', text: 'text-lime-800', dot: 'bg-lime-600' },
  ingles: { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-600' },
  espanhol: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600' },
  italiano: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-600' },
  xadrez: { bg: 'bg-stone-100', text: 'text-stone-800', dot: 'bg-stone-700' },
};

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onSelectSubjectToStudy,
  userGrade = '6_fund',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [testAlertSent, setTestAlertSent] = useState(false);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState<SubjectId>('matematica');
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('08:00');
  const [formTopics, setFormTopics] = useState('');
  const [formReminderDayBefore, setFormReminderDayBefore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setExams(notificationService.getExams());
      setPermissionStatus(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calendar math
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    soundEffects.playClick();
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    soundEffects.playClick();
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    soundEffects.playClick();
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  const handleRequestPermission = async () => {
    soundEffects.playClick();
    const granted = await notificationService.requestNotificationPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    if (granted) {
      soundEffects.playVictory();
    }
  };

  const handleSendTestExamAlert = () => {
    soundEffects.playClick();
    const subjName = SUBJECTS.find((s) => s.id === formSubjectId)?.name || 'Matemática';
    notificationService.sendTestExamNotification(subjName, formTitle || 'Prova Bimestral');
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 3000);
  };

  const handleAddExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();

    // Auto-request push permissions if not granted yet
    if (permissionStatus !== 'granted') {
      try {
        await notificationService.requestNotificationPermission();
        setPermissionStatus(notificationService.getPermissionStatus());
      } catch {}
    }

    const subjectObj = SUBJECTS.find((s) => s.id === formSubjectId);
    const subjectName = subjectObj?.name || 'Matemática';

    notificationService.addExam({
      subjectId: formSubjectId,
      subjectName,
      title: formTitle.trim() || `Prova de ${subjectName}`,
      date: selectedDateStr,
      time: formTime,
      topicsCovered: formTopics.trim(),
      reminderDayBeforeAtNoon: formReminderDayBefore,
      reminderOnDayMorning: true,
    });

    setExams(notificationService.getExams());
    setShowAddExamForm(false);
    setFormTitle('');
    setFormTopics('');
    soundEffects.playVictory();
  };

  const handleDeleteExam = (id: string) => {
    soundEffects.playClick();
    notificationService.deleteExam(id);
    setExams(notificationService.getExams());
  };

  // Filter exams for the selected day
  const examsOnSelectedDate = exams.filter((e) => e.date === selectedDateStr);

  // Today ISO String
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // Formatted date header for selected day
  const [selY, selM, selD] = selectedDateStr.split('-').map(Number);
  const selectedDateObj = new Date(selY, selM - 1, selD);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>Calendário de Provas</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Anotar provas com lembrete 1 dia antes às 12:00
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Notification Permission & Test Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0 border border-amber-400/80 bg-indigo-950 p-0.5 flex items-center justify-center">
                  <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Alarme & Notificações Push em Segundo Plano
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {permissionStatus === 'granted'
                      ? 'Notificações push ativas! Provas tocarão como alarme sonoro às 12h do dia anterior ✅'
                      : 'Ative as notificações para receber alarme e lembrete push das suas provas'}
                  </span>
                </div>
              </div>

              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition active:scale-95 shrink-0"
                >
                  Permitir Push
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
              <span className="text-[10px] text-amber-900 font-medium">
                Alarme contínuo para provas e push em segundo plano
              </span>
              <button
                onClick={handleSendTestExamAlert}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition shadow-xs active:scale-95"
              >
                {testAlertSent ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Disparado!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-amber-700" />
                    <span>Testar Alarme de Prova</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CALENDAR VIEW */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400">
              {WEEK_DAYS.map((wd) => (
                <div key={wd}>{wd}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = cellDateStr === todayStr;
                const isSelected = cellDateStr === selectedDateStr;
                const dayExams = exams.filter((e) => e.date === cellDateStr);

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-9.5 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm z-10'
                        : isToday
                        ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dayNum}</span>

                    {/* Dots for exams */}
                    {dayExams.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {dayExams.slice(0, 3).map((ex) => {
                          const col = SUBJECT_COLORS[ex.subjectId]?.dot || 'bg-amber-500';
                          return (
                            <span
                              key={ex.id}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : col}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY HEADER & BUTTON TO ADD EXAM */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="font-extrabold text-slate-900 text-xs block capitalize">
                {formattedSelectedDate}
              </span>
              <span className="text-[10px] text-slate-500">
                {examsOnSelectedDate.length} prova(s) agendada(s)
              </span>
            </div>

            {!showAddExamForm && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowAddExamForm(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Anotar Prova</span>
              </button>
            )}
          </div>

          {/* ADD EXAM FORM */}
          {showAddExamForm && (
            <form
              onSubmit={handleAddExamSubmit}
              className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Anotar Prova para o Dia Selecionado</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddExamForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Matéria da Prova
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value as SubjectId)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                >
                  {getSubjectsForGrade(userGrade).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title of the exam */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Título / Nome da Prova
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prova Bimestral de Geometria e Equações"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                />
              </div>

              {/* Time & Topics */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Horário da Prova
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Conteúdos / Capítulos
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cap. 3 e 4 do livro"
                    value={formTopics}
                    onChange={(e) => setFormTopics(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Mandatory 1-day before at 12:00 Reminder Checkbox */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formReminderDayBefore}
                    onChange={(e) => setFormReminderDayBefore(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 text-[11px] block">
                      ⏰ Lembrar 1 dia antes às 12:00 (Meio-dia)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      O app enviará notificação push, alarme e a IA avisará em voz alta para você revisar a tempo.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Submit buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddExamForm(false)}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
                >
                  Salvar Prova & Lembrete
                </button>
              </div>
            </form>
          )}

          {/* EXAMS LIST ON SELECTED DAY */}
          {examsOnSelectedDate.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-2xl">📅</span>
              <p className="font-bold text-slate-700 text-xs">
                Nenhuma prova anotada neste dia
              </p>
              <p className="text-[11px] text-slate-400">
                Clique no botão "Anotar Prova" acima para salvar sua data de avaliação!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {examsOnSelectedDate.map((exam) => {
                const colorInfo = SUBJECT_COLORS[exam.subjectId] || {
                  bg: 'bg-blue-100',
                  text: 'text-blue-800',
                  dot: 'bg-blue-600',
                };

                return (
                  <div
                    key={exam.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${colorInfo.bg} ${colorInfo.text}`}
                        >
                          📝
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${colorInfo.bg} ${colorInfo.text}`}>
                              {exam.subjectName}
                            </span>
                            <span className="font-bold text-slate-500 text-[10px]">
                              {exam.time || '08:00'}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                            {exam.title}
                          </h4>

                          {exam.topicsCovered && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              📖 Conteúdo: {exam.topicsCovered}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                        title="Excluir Prova"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Reminder Status & Quick Study Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <img src="/app-logo.png" alt="App" className="w-3.5 h-3.5 object-cover rounded-xs" />
                        <span>Alarme: 1 dia antes às 12:00</span>
                      </span>

                      {onSelectSubjectToStudy && (
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            onClose();
                            onSelectSubjectToStudy(exam.subjectId);
                          }}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Revisar Agora</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ALL UPCOMING EXAMS SECTION */}
          {exams.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Todas as Provas Salvas ({exams.length})
              </span>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {exams.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedDateStr(ex.date);
                      const [y, m] = ex.date.split('-').map(Number);
                      setCurrentDate(new Date(y, m - 1, 1));
                    }}
                    className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-900 truncate">
                        {ex.subjectName}: {ex.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 shrink-0 ml-2">
                      {ex.date.split('-').reverse().join('/')} ({ex.time || '08:00'})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Salvo automaticamente no seu aparelho
          </span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
