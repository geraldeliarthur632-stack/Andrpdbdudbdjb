import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { calculateAcademicLevel } from './ProgressDashboard';
import { getHighestBadge, getHighestTrophy, getEarnedBadges, getEarnedTrophies } from '../data/trophiesAndBadges';
import { studyGoalService } from '../services/studyGoalService';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import {
  X,
  Copy,
  Check,
  Share2,
  FileText,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Clock,
} from 'lucide-react';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  dailyGoalCount?: number;
}

type ReportFormat = 'complete' | 'whatsapp' | 'teacher';

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  user,
  dailyGoalCount = 3,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('complete');
  const [customNote, setCustomNote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const totalPoints = user.totalPoints || 0;
  const completedChallenges = user.completedChallenges || 0;
  const totalCorrect = user.totalCorrectAnswers || 0;
  const gradeLabel = GRADE_LABELS[user.grade]?.full || 'Ensino Fundamental';
  const gradeShort = GRADE_LABELS[user.grade]?.short || '6º Ano';
  const levelInfo = calculateAcademicLevel(totalPoints);
  const highestBadge = getHighestBadge(totalPoints);
  const highestTrophy = getHighestTrophy(totalCorrect);
  const earnedBadgesCount = getEarnedBadges(totalPoints).length;
  const earnedTrophiesCount = getEarnedTrophies(totalCorrect).length;
  const weeklyFocus = studyGoalService.getWeeklyFocusSummary();

  const isGoalMet = completedChallenges >= dailyGoalCount;
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const generateReportText = (format: ReportFormat): string => {
    const studentName = user.name || 'Estudante';
    const noteSection = customNote.trim() ? `\n📌 *Nota Pessoal:* ${customNote.trim()}\n` : '';

    if (format === 'complete') {
      return (
`📊 *RELATÓRIO DE PROGRESSO SEMANAL - ESTUDAHUD*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Estudante:* ${studentName}
🎓 *Série Escolar:* ${gradeLabel} (Alinhado à BNCC)
📅 *Data:* ${todayFormatted}

⏱️ *TEMPO DE FOCO & CRONOGRAMA SEMANAL:*
• Tempo Total de Foco: ${weeklyFocus.formattedWeeklyTime} (${weeklyFocus.weeklyProgressPercent}% da meta semanal)
• Frequência / Dias Ativos: ${weeklyFocus.activeDaysCount} de 7 dias
• Nível de Consistência: ${weeklyFocus.consistencyTier}
• Média Diária: ${weeklyFocus.averageDailyMinutes} min/dia de estudo ativo

📈 *DESEMPENHO ACADÊMICO:*
• Pontuação Total: ${totalPoints.toLocaleString('pt-BR')} pontos
• Nível Atual: Nível ${levelInfo.level} — ${levelInfo.title}
• Questões Acertadas: ${totalCorrect} acertos
• Desafios Concluídos: ${completedChallenges} atividades
• Meta Diária: ${isGoalMet ? '✅ Concluída com sucesso!' : `⚡ Em andamento (${completedChallenges}/${dailyGoalCount})`}

🏆 *CONQUISTAS E MARCOS:*
• Troféu Atual: ${highestTrophy ? `${highestTrophy.icon} ${highestTrophy.title} (${highestTrophy.rarityLabel})` : 'Iniciando coleção'}
• Emblema de Pontos: ${highestBadge ? `${highestBadge.icon} ${highestBadge.title}` : 'Primeiros passos'}
• Total de Colecionáveis: ${earnedTrophiesCount} troféus | ${earnedBadgesCount} emblemas
${noteSection}
💡 *Observação Pedagógica:* O estudante mantém uma rotina ativa de aprendizado com resumos teóricos, prática de exercícios curriculares e fixação por repetição espaçada.

🔗 *EstudaHUD — Plataforma Curricular Interativa*`
      );
    }

    if (format === 'whatsapp') {
      return (
`📚 *Resumo de Estudos de ${studentName}* (${todayFormatted})
🎓 *Série:* ${gradeShort} | *Nível:* ${levelInfo.title}

⏱️ *Foco Semanal:* ${weeklyFocus.formattedWeeklyTime} (${weeklyFocus.activeDaysCount}/7 dias ativos - ${weeklyFocus.consistencyTier})
⭐ *Pontos:* ${totalPoints.toLocaleString('pt-BR')} pts
🎯 *Perguntas Acertadas:* ${totalCorrect} acertos
🏅 *Desafios Concluídos:* ${completedChallenges}
🏆 *Destaque:* ${highestTrophy ? `${highestTrophy.icon} ${highestTrophy.title}` : highestBadge ? `${highestBadge.icon} ${highestBadge.title}` : 'Estudos em dia!'}
${isGoalMet ? '✅ Meta semanal de estudos batida!' : `⚡ ${completedChallenges}/${dailyGoalCount} metas concluídas`}
${customNote.trim() ? `\n💬 *Mensagem:* ${customNote.trim()}\n` : ''}
🚀 Praticando com foco no EstudaHUD!`
      );
    }

    // teacher format
    return (
`📝 *RELATÓRIO PEDAGÓGICO DE ATIVIDADES CURRICULARES (BNCC)*
══════════════════════════════════════════
• Estudante: ${studentName}
• Ano/Série: ${gradeLabel}
• Data de Emissão: ${todayFormatted}

⏱️ *ROTINA E ENGAJAMENTO TEMPORAL:*
- Tempo Total Semanal: ${weeklyFocus.formattedWeeklyTime}
- Regularidade no Cronograma: ${weeklyFocus.activeDaysCount}/7 dias (${weeklyFocus.consistencyTier})
- Média por Dia Ativo: ${weeklyFocus.averageDailyMinutes} minutos

📌 *MÉTRICAS DE RENDIMENTO:*
- Domínio Curricular: ${totalPoints.toLocaleString('pt-BR')} pontos acumulados
- Nível de Proficiência: Nível ${levelInfo.level} (${levelInfo.title})
- Exercícios Corretos: ${totalCorrect} itens resolvidos
- Módulos / Desafios Finalizados: ${completedChallenges}
- Status de Engajamento: ${isGoalMet ? 'Excelente (Meta Ativa)' : 'Regular em evolução'}
${highestTrophy ? `- Marco de Precisão: ${highestTrophy.title} (${highestTrophy.rarityLabel})` : ''}
${noteSection}
Relatório gerado pelo ambiente de aprendizagem EstudaHUD.`
    );
  };

  const reportText = generateReportText(selectedFormat);

  const handleCopy = async () => {
    soundEffects.playClick();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reportText);
      } else {
        // Fallback for older/restricted contexts
        const textarea = document.createElement('textarea');
        textarea.value = reportText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    soundEffects.playClick();
    const encoded = encodeURIComponent(reportText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    soundEffects.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório de Progresso - ${user.name || 'Estudante'}`,
          text: reportText,
        });
        return;
      } catch {}
    }
    // Fallback to copy
    handleCopy();
  };

  const handleToggleSpeak = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechNarrator.speak(
        reportText.replace(/[*•#=━]/g, ''),
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleClose = () => {
    speechNarrator.stop();
    setIsSpeaking(false);
    soundEffects.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0 font-bold">
              📋
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900 truncate">
                Resumo de Progresso Semanal
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Copie e envie para pais ou professores
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition shrink-0"
            aria-label="Fechar Resumo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
            Modelo de Mensagem
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                soundEffects.playClick();
                setSelectedFormat('complete');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 text-[11px] truncate ${
                selectedFormat === 'complete'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Completo</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setSelectedFormat('whatsapp');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 text-[11px] truncate ${
                selectedFormat === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setSelectedFormat('teacher');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 text-[11px] truncate ${
                selectedFormat === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Professor</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold block">Pontos</span>
              <span className="text-sm font-black text-blue-700">{totalPoints.toLocaleString('pt-BR')}</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold block">Acertos</span>
              <span className="text-sm font-black text-amber-700">{totalCorrect}</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold block">Desafios</span>
              <span className="text-sm font-black text-emerald-700">{completedChallenges}</span>
            </div>
          </div>

          {/* Optional Note Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Adicionar Recado Opcional (Ex: "Estudei frações hoje"):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Concluí os exercícios de história e matemática!"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              maxLength={120}
            />
          </div>

          {/* Formatted Text Preview Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Texto Formatado para Copiar:
              </span>

              {/* Audio Listen Button */}
              <button
                onClick={handleToggleSpeak}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                  isSpeaking
                    ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Ouvir resumo em áudio"
              >
                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeaking ? 'Pausar Áudio' : 'Ouvir Texto'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={reportText}
                rows={8}
                className="w-full p-3 text-xs font-mono bg-white border border-slate-300 rounded-2xl text-slate-800 focus:outline-hidden shadow-inner leading-relaxed resize-none select-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp direct share */}
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98 ${
                isCopied
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Texto Copiado! 🎉' : 'Copiar Resumo'}</span>
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
          >
            Voltar aos Estudos
          </button>
        </div>
      </div>
    </div>
  );
};
