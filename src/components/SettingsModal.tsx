import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import { GRADE_LABELS } from '../data/curriculumData';
import { notificationService } from '../services/notificationService';
import { studyGoalService } from '../services/studyGoalService';
import { StudentAvatar } from './StudentAvatar';
import {
  X,
  Settings,
  User,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Shield,
  Check,
  GraduationCap,
  Sliders,
  HelpCircle,
  BookOpen,
  Info,
  Laptop,
  Smartphone,
  Download,
  Moon,
  Sun,
  FileDown,
  Printer,
  AlertCircle,
  SlidersHorizontal,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Mic,
  MicOff,
  Cloud,
  LogOut,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenProfileEdit: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar: () => void;
  onOpenReportCard?: () => void;
  onOpenInstallApp?: () => void;
  onOpenOfflineAccess?: () => void;
  onOpenErrorFeedback?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenFaq?: () => void;
  onOpenAppExplanation?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenProfileEdit,
  onOpenAuth,
  onLogout,
  onOpenCalendar,
  onOpenReportCard,
  onOpenInstallApp,
  onOpenOfflineAccess,
  onOpenErrorFeedback,
  onOpenSubjectCustomization,
  onOpenFaq,
  onOpenAppExplanation,
  isMuted,
  onToggleMute,
  theme = 'light',
  onToggleTheme,
}) => {
  const [speechRate, setSpeechRate] = useState<'slow' | 'normal' | 'fast'>(() => {
    return (localStorage.getItem('estudahud_speech_rate') as any) || 'normal';
  });
  const [autoNarrate, setAutoNarrate] = useState<boolean>(() => {
    return localStorage.getItem('estudahud_auto_narrate') !== 'false';
  });
  const [reminderSoundAlert, setReminderSoundAlert] = useState<boolean>(() => {
    return localStorage.getItem('estudahud_reminder_sound_alert') !== 'false';
  });
  const [dailyGoalReminderEnabled, setDailyGoalReminderEnabled] = useState<boolean>(() => {
    return notificationService.isDailyGoalReminderEnabled();
  });
  const [dailyGoalReminderTime, setDailyGoalReminderTime] = useState<string>(() => {
    return notificationService.getDailyGoalReminderTime();
  });
  const [goalTargetMinutes, setGoalTargetMinutes] = useState<number>(() => {
    return studyGoalService.getData().targetMinutes || 15;
  });
  const [goalData, setGoalData] = useState(() => studyGoalService.getData());
  const [dailyGoalTestSent, setDailyGoalTestSent] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(() => {
    return localStorage.getItem('eduplay_voice_mic_enabled') === 'true';
  });

  useEffect(() => {
    const updateGoalInfo = () => {
      setGoalData(studyGoalService.getData());
    };
    window.addEventListener('estudahud_study_seconds_added', updateGoalInfo);
    window.addEventListener('estudahud_daily_goal_reminder_config_updated', () => {
      setDailyGoalReminderEnabled(notificationService.isDailyGoalReminderEnabled());
      setDailyGoalReminderTime(notificationService.getDailyGoalReminderTime());
    });
    return () => {
      window.removeEventListener('estudahud_study_seconds_added', updateGoalInfo);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('estudahud_speech_rate', speechRate);
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('estudahud_auto_narrate', String(autoNarrate));
  }, [autoNarrate]);

  useEffect(() => {
    localStorage.setItem('estudahud_reminder_sound_alert', String(reminderSoundAlert));
  }, [reminderSoundAlert]);

  if (!isOpen) return null;

  const handleSpeechRateChange = (rate: 'slow' | 'normal' | 'fast') => {
    soundEffects.playClick();
    setSpeechRate(rate);
  };

  const handleAutoNarrateToggle = () => {
    soundEffects.playClick();
    setAutoNarrate((prev) => !prev);
  };

  const handleToggleReminderSoundAlert = () => {
    const next = !reminderSoundAlert;
    setReminderSoundAlert(next);
    if (next) {
      soundEffects.playStudyReminderChime();
    } else {
      soundEffects.playClick();
    }
  };

  const handleTestReminderChime = () => {
    soundEffects.playStudyReminderChime();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Configurações</h3>
              <p className="text-xs text-slate-500">Preferências, perfil, offline e áudio</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SEÇÃO DE PERFIL DO ESTUDANTE */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Perfil do Estudante
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Conta Ativa
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <StudentAvatar
                photoURL={user.photoURL}
                className="w-11 h-11"
                iconClassName="w-6 h-6 text-indigo-600"
                alt={user.name || 'Estudante'}
              />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[160px]">
                  {user.name || 'Estudante'}
                </h4>
                <p className="text-xs text-indigo-600 font-semibold">
                  {GRADE_LABELS[user.grade]?.full || '6º Ano Fundamental'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.totalPoints || 0} pts • {user.totalCorrectAnswers || 0} acertos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenProfileEdit();
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                title="Alterar nome ou apelido e série"
              >
                <User className="w-3 h-3" />
                <span>Alterar nome ou apelido</span>
              </button>
            </div>
          </div>

          {/* Sincronização no Banco de Dados (Firestore / Google / E-mail) */}
          {onOpenAuth && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    user.userId || user.email || user.phoneNumber ? 'bg-emerald-600' : 'bg-indigo-600'
                  }`}>
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.userId || user.email || user.phoneNumber ? 'Banco de Dados (Nuvem Ativa)' : 'Salvar no Banco de Dados'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user.phoneNumber || user.email || 'Conecte com Telefone (SMS) ou Google'}
                    </p>
                  </div>
                </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenAuth();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer ${
                        user.userId || user.email || user.phoneNumber
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {user.userId || user.email || user.phoneNumber ? 'Gerenciar' : 'Entrar'}
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          onLogout();
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                        title="Sair da Conta e ir para a tela de login"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sair</span>
                      </button>
                    )}
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. ACESSO OFFLINE */}
        {onOpenOfflineAccess && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Cursos Offline
              </span>
              <span className="text-[10px] text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                IndexedDB + SW
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Estudo Sem Conexão
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Baixe aulas e conteúdos para estudar quando estiver sem internet.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenOfflineAccess();
                  onClose();
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Gerenciar</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ÁUDIO, VOZ E SONS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            Sons e Narração de Voz
          </span>

          {/* Efeitos Sonoros */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isMuted ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Efeitos Sonoros do Jogo</p>
                <p className="text-[10px] text-slate-500">Sons de cliques, acertos e vitórias</p>
              </div>
            </div>

            <button
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isMuted
                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              {isMuted ? 'Silenciado' : 'Ativado'}
            </button>
          </div>

          {/* Microfone e Resposta por Voz */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${micEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Microfone nas Questões</p>
                <p className="text-[10px] text-slate-500">
                  {micEnabled ? 'Ativo para ditar alternativas A, B, C, D' : 'Desativado (somente toque na tela)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                const next = !micEnabled;
                setMicEnabled(next);
                try {
                  localStorage.setItem('eduplay_voice_mic_enabled', next ? 'true' : 'false');
                } catch {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                micEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {micEnabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Velocidade de Narração */}
          <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-900">Velocidade da Voz da IA</p>
            <p className="text-[10px] text-slate-500 mb-2">Velocidade com que a inteligência artificial lê as explicações teóricas</p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow', label: 'Lenta (0.8x)' },
                { id: 'normal', label: 'Normal (1.0x)' },
                { id: 'fast', label: 'Rápida (1.2x)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSpeechRateChange(item.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center transition border cursor-pointer ${
                    speechRate === item.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ROTINA E LEMBRETES */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            Rotina & Provas
          </span>

          {/* Lembrete Amigável da Meta Diária no Celular */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-rose-50/50 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      Lembrete da Meta Diária
                    </h4>
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-extrabold rounded-full">
                      Celular & PWA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Avisa no celular caso ainda falte estudar até o horário limite
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  const next = !dailyGoalReminderEnabled;
                  setDailyGoalReminderEnabled(next);
                  notificationService.setDailyGoalReminderEnabled(next);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dailyGoalReminderEnabled ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                aria-label="Ativar lembrete da meta diária"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    dailyGoalReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {dailyGoalReminderEnabled && (
              <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
                {/* Horário de Checagem */}
                <div className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-slate-700 font-bold">Lembrar às:</span>
                  </div>
                  <input
                    type="time"
                    value={dailyGoalReminderTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDailyGoalReminderTime(val);
                      notificationService.setDailyGoalReminderTime(val);
                    }}
                    className="px-2 py-0.5 rounded-lg border border-amber-300 bg-white font-bold text-amber-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Meta Diária em Minutos */}
                <div className="space-y-1 bg-white/80 p-2 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-bold flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-600" />
                      Sua Meta de Hoje:
                    </span>
                    <span className="font-black text-amber-800 text-xs">
                      {goalTargetMinutes} minutos/dia
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setGoalTargetMinutes(mins);
                          studyGoalService.setTargetMinutes(mins);
                          setGoalData(studyGoalService.getData());
                        }}
                        className={`py-1 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                          goalTargetMinutes === mins
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status em Tempo Real do Dia */}
                {(() => {
                  const studiedMin = Math.floor((goalData.todaySeconds || 0) / 60);
                  const targetMin = goalData.targetMinutes || 15;
                  const isMet = studiedMin >= targetMin;
                  const remaining = Math.max(0, targetMin - studiedMin);

                  return (
                    <div
                      className={`p-2 rounded-xl text-[11px] border ${
                        isMet
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-100/70 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-extrabold leading-tight">
                            {isMet
                              ? `✅ Meta diária batida hoje! (${studiedMin} de ${targetMin} min)`
                              : `⏳ Estudou ${studiedMin} de ${targetMin} min (faltam ${remaining} min)`}
                          </p>
                          <p className="text-[10px] opacity-90 mt-0.5">
                            {isMet
                              ? `Ofensiva de ${goalData.streakDays} dias protegida. Nenhuma cobrança será enviada hoje!`
                              : `Se você não atingir a meta até as ${dailyGoalReminderTime}, um lembrete amigável vibrará no seu celular.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Botão de Teste Imediato */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    💡 Funciona com app aberto ou no celular (PWA)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      soundEffects.playClick();
                      await notificationService.requestNotificationPermission();
                      await notificationService.triggerDailyGoalReminder(true);
                      setDailyGoalTestSent(true);
                      setTimeout(() => setDailyGoalTestSent(false), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {dailyGoalTestSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Notificação Enviada!</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Testar no Celular</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenCalendar();
                onClose();
              }}
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                📅 Calendário de Provas
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Anotar datas de exames
              </span>
            </button>

            {onOpenReportCard && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenReportCard();
                  onClose();
                }}
                className="col-span-2 p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                    📊 Meu Boletim Escolar & Notas
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Lançar notas bimestrais e metas
                  </span>
                </div>
                <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
              </button>
            )}

            {/* Personalizar Matérias (Biologia, Física, Química...) */}
            {onOpenSubjectCustomization && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenSubjectCustomization();
                  onClose();
                }}
                className="col-span-2 p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                    🧬 Matérias da Minha Escola
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Configurar se tem Biologia, Física e Química separadas
                  </span>
                </div>
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 shrink-0" />
              </button>
            )}

            {/* Perguntas Frequentes (FAQ) */}
            {onOpenFaq && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenFaq();
                  onClose();
                }}
                className="col-span-2 p-3 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-indigo-950 block group-hover:text-indigo-800 transition">
                    ❓ Perguntas Frequentes (FAQ)
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">
                    O que é BNCC?, tire dúvidas e saiba como usar a IA
                  </span>
                </div>
                <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              </button>
            )}

            {/* Explicação do App com Voz da IA */}
            {onOpenAppExplanation && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAppExplanation();
                  onClose();
                }}
                className="col-span-2 p-3 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-purple-950 block group-hover:text-purple-800 transition">
                    🎙️ Explicação do App (Voz da IA)
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">
                    Tour narrado na velocidade normal que passa as telas sozinho
                  </span>
                </div>
                <Volume2 className="w-5 h-5 text-purple-600 shrink-0" />
              </button>
            )}

            {/* Central de Erros e Feedback */}
            {onOpenErrorFeedback && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenErrorFeedback();
                  onClose();
                }}
                className="col-span-2 p-3 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200 hover:border-rose-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-rose-900 block group-hover:text-rose-700 transition">
                    🚨 Central de Erros & Feedback
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    Relatar um erro no app e acompanhar erros enviados pela comunidade
                  </span>
                </div>
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* 6. DADOS & CONTA */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Sessão & Dados do Estudante
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              100% Protegido
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ao sair da conta, suas informações, pontuações e notas continuam <strong>salvas no banco de dados</strong>. Você não perde seu progresso e pode reconectar a qualquer momento.
          </p>

          {onLogout && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onLogout();
              }}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          )}
        </div>

        {/* RESUMO COMPLETO DO APLICATIVO */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Resumo da Trilha do Saber
            </span>
            <span className="text-[10px] text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              100% BNCC
            </span>
          </div>

          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            A <strong>Trilha do Saber</strong> é um ecossistema educacional completo projetado para potencializar o aprendizado e as notas escolares com Inteligência Artificial e gamificação:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-indigo-900 block font-bold">🚀 1. Jornada BNCC</strong>
              Aulas e trilhas curriculares completas do 1º ao 9º ano Fundamental e 1º ao 3º Médio.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-purple-900 block font-bold">📸 2. Provas por Foto com IA</strong>
              Gere avaliações personalizadas (objetivas, V/F e discursivas) com correção da IA.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-emerald-900 block font-bold">📚 3. Caderno Digital de Resumos</strong>
              Acesse resumos completos com fórmulas, regras e conceitos práticos.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-amber-900 block font-bold">⚔️ 4. Competição & Duelos</strong>
              Duelos de Conhecimento, Passa ou Repassa, Jogo Stop e Desafios de Reflexo ao vivo.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-blue-900 block font-bold">🤖 5. Tutor & Professor IA 24h</strong>
              Tire dúvidas, pesquise temas escolares e escute explicações didáticas com voz.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-cyan-900 block font-bold">♟️ 6. Jogos Educativos</strong>
              Xadrez acadêmico, Desafio da Tabuada, Caça-Palavras, Quebra-Cabeça e Memória.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-rose-900 block font-bold">🌍 7. Idiomas & Tradutor</strong>
              Prática de Inglês, Espanhol e Italiano com pronúncia guiada e tradução.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <strong className="text-teal-900 block font-bold">📅 8. Gestão & Foco nos Estudos</strong>
              Cronograma com alarmes, cronômetro Pomodoro, metas diárias de XP e Boletim com troféus.
            </div>
          </div>
        </div>

        {/* SOBRE O APLICATIVO */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Trilha do Saber • 100% Alinhado à BNCC</span>
          <span className="font-semibold">Versão 3.6</span>
        </div>
      </div>
    </div>
  );
};
