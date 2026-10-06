import React, { useState, useEffect } from 'react';
import { FocusSessionReminder, DayOfWeek, FocusTechnique } from '../types';
import { notificationService, DAY_NAMES } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';
import {
  Clock,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Sparkles,
  Zap,
  Volume2,
  Check,
  AlertCircle,
  Play,
  Flame,
  Calendar,
  X,
} from 'lucide-react';

interface FocusSessionsManagerPanelProps {
  onStartFocusDirectly?: (durationMinutes: number) => void;
}

export const FocusSessionsManagerPanel: React.FC<FocusSessionsManagerPanelProps> = ({
  onStartFocusDirectly,
}) => {
  const [sessions, setSessions] = useState<FocusSessionReminder[]>(() =>
    notificationService.getFocusSessions()
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [technique, setTechnique] = useState<FocusTechnique>('pomodoro');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [time, setTime] = useState('15:00');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [subjectName, setSubjectName] = useState('Geral / BNCC');
  const [soundAlert, setSoundAlert] = useState(true);
  const [voiceAlert, setVoiceAlert] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setSessions(notificationService.getFocusSessions());
    };
    window.addEventListener('estudahud_focus_sessions_updated', handleUpdate);
    return () => {
      window.removeEventListener('estudahud_focus_sessions_updated', handleUpdate);
    };
  }, []);

  const handleApplyTechniquePreset = (tech: FocusTechnique) => {
    setTechnique(tech);
    if (tech === 'pomodoro') {
      setDurationMinutes(25);
      setBreakMinutes(5);
      if (!title) setTitle('Sessão Pomodoro: Foco Guiado');
    } else if (tech === 'deep_work') {
      setDurationMinutes(50);
      setBreakMinutes(10);
      if (!title) setTitle('Deep Work: Imersão Total');
    } else if (tech === 'quick_sprint') {
      setDurationMinutes(15);
      setBreakMinutes(3);
      if (!title) setTitle('Sprint Rápido: Fixação');
    }
  };

  const handleToggleDay = (day: DayOfWeek) => {
    soundEffects.playClick();
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const handleToggleSession = (id: string) => {
    soundEffects.playClick();
    notificationService.toggleFocusSession(id);
    setSessions(notificationService.getFocusSessions());
  };

  const handleDeleteSession = (id: string) => {
    soundEffects.playClick();
    notificationService.deleteFocusSession(id);
    setSessions(notificationService.getFocusSessions());
  };

  const handleTestSession = (session: FocusSessionReminder) => {
    soundEffects.playClick();
    notificationService.triggerFocusSessionNotification(session, true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();

    if (!title.trim()) return;

    if (editingId) {
      const existing = sessions.find((s) => s.id === editingId);
      if (existing) {
        notificationService.updateFocusSession({
          ...existing,
          title: title.trim(),
          technique,
          durationMinutes,
          breakMinutes,
          time,
          daysOfWeek: selectedDays,
          subjectName: subjectName.trim(),
          soundAlert,
          voiceAlert,
        });
      }
    } else {
      notificationService.addFocusSession({
        title: title.trim(),
        technique,
        durationMinutes,
        breakMinutes,
        time,
        daysOfWeek: selectedDays,
        enabled: true,
        subjectName: subjectName.trim(),
        soundAlert,
        voiceAlert,
      });
    }

    setSessions(notificationService.getFocusSessions());
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle('');
    setTechnique('pomodoro');
    setDurationMinutes(25);
    setBreakMinutes(5);
    setTime('15:00');
    setSelectedDays([1, 2, 3, 4, 5]);
    setSubjectName('Geral / BNCC');
    setSoundAlert(true);
    setVoiceAlert(true);
  };

  const startEdit = (s: FocusSessionReminder) => {
    setEditingId(s.id);
    setTitle(s.title);
    setTechnique(s.technique);
    setDurationMinutes(s.durationMinutes);
    setBreakMinutes(s.breakMinutes);
    setTime(s.time);
    setSelectedDays(s.daysOfWeek);
    setSubjectName(s.subjectName || 'Geral');
    setSoundAlert(s.soundAlert);
    setVoiceAlert(s.voiceAlert);
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Sessões de Foco Recorrentes</span>
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Agende blocos de concentração com notificações e voz nos dias da semana
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAdding(true);
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Sessão</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <span className="text-xs font-black text-purple-950">
              {editingId ? '✏️ Editar Sessão de Foco' : '✨ Criar Nova Sessão de Foco'}
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nome da Sessão
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Pomodoro da Tarde, Matemática..."
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Matéria ou Objetivo
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Ex: Redação, Ciências, Geral..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Technique Presets */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Técnica de Concentração
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyTechniquePreset('pomodoro')}
                className={`p-2 rounded-xl border text-center transition ${
                  technique === 'pomodoro'
                    ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-black">Pomodoro</span>
                <span className="text-[10px] opacity-85">25m foco / 5m pausa</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTechniquePreset('deep_work')}
                className={`p-2 rounded-xl border text-center transition ${
                  technique === 'deep_work'
                    ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-black">Deep Work</span>
                <span className="text-[10px] opacity-85">50m foco / 10m pausa</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTechniquePreset('quick_sprint')}
                className={`p-2 rounded-xl border text-center transition ${
                  technique === 'quick_sprint'
                    ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-black">Sprint Rápido</span>
                <span className="text-[10px] opacity-85">15m foco / 3m pausa</span>
              </button>
            </div>
          </div>

          {/* Time & Durations */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Horário (24h)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Duração (min)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Pausa (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Days of Week Chips */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Dias da Semana Recorrentes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((d) => {
                const active = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleToggleDay(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => setSoundAlert(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Som de Alerta</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={voiceAlert}
                onChange={(e) => setVoiceAlert(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Narração por Voz</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {editingId ? 'Salvar Alterações' : 'Criar Sessão'}
            </button>
          </div>
        </form>
      )}

      {/* Focus Sessions List */}
      <div className="space-y-2.5">
        {sessions.map((s) => {
          const daysText = s.daysOfWeek
            .map((d) => DAY_NAMES.find((dn) => dn.id === d)?.short)
            .filter(Boolean)
            .join(', ');

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border transition ${
                s.enabled
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {s.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                      {s.durationMinutes}m + {s.breakMinutes}m pausa
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      {s.time}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-semibold">{daysText}</span>
                    {s.subjectName && (
                      <>
                        <span>•</span>
                        <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                          {s.subjectName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTestSession(s)}
                    title="Testar Notificação"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {onStartFocusDirectly && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onStartFocusDirectly(s.durationMinutes);
                      }}
                      title="Iniciar esta sessão agora"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(s)}
                    className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleToggleSession(s.id)}
                    className={`p-1.5 rounded-lg transition ${
                      s.enabled
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {s.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && !isAdding && (
          <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Nenhuma sessão de foco configurada</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Crie rotinas semanais para treinar sua concentração com pausas inteligentes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
