import React, { useState, useEffect } from 'react';
import { GradeLevel, ReportCardData, SubjectId } from '../types';
import { GRADE_LABELS, getSubjectsForGrade } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { reportCardService } from '../services/reportCardService';
import { studyGoalService, WeeklyFocusSummary } from '../services/studyGoalService';
import { TopicMistakesChart } from './TopicMistakesChart';
import { WeeklyXpEvolutionChart } from './WeeklyXpEvolutionChart';
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  GraduationCap,
  Trophy,
  Target,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface LevelInfo {
  level: number;
  title: string;
  nextTitle: string;
  currentPointsInLevel: number;
  pointsNeededForNextLevel: number;
  progressPercent: number;
  totalPoints: number;
}

export function calculateAcademicLevel(totalPoints: number): LevelInfo {
  const safePoints = Math.max(0, typeof totalPoints === 'number' && !isNaN(totalPoints) ? totalPoints : 0);

  // Progressive XP brackets
  const levelTiers = [
    { level: 1, title: 'Aspirante', threshold: 0 },
    { level: 2, title: 'Iniciante', threshold: 100 },
    { level: 3, title: 'Aprendiz', threshold: 250 },
    { level: 4, title: 'Explorador', threshold: 450 },
    { level: 5, title: 'Pesquisador', threshold: 700 },
    { level: 6, title: 'Estudioso', threshold: 1000 },
    { level: 7, title: 'Mestre do Saber', threshold: 1400 },
    { level: 8, title: 'Sábio Acadêmico', threshold: 1900 },
    { level: 9, title: 'Doutor do Saber', threshold: 2500 },
    { level: 10, title: 'Lenda dos Estudos', threshold: 3200 },
  ];

  let currentLevelIdx = 0;
  for (let i = levelTiers.length - 1; i >= 0; i--) {
    if (safePoints >= levelTiers[i].threshold) {
      currentLevelIdx = i;
      break;
    }
  }

  let levelNumber = levelTiers[currentLevelIdx].level;
  let title = levelTiers[currentLevelIdx].title;
  let currentLevelThreshold = levelTiers[currentLevelIdx].threshold;
  let nextLevelThreshold: number;
  let nextTitle: string;

  if (currentLevelIdx < levelTiers.length - 1) {
    nextLevelThreshold = levelTiers[currentLevelIdx + 1].threshold;
    nextTitle = levelTiers[currentLevelIdx + 1].title;
  } else {
    // For levels beyond tier 10: every 800 XP gives 1 level
    const extraPoints = safePoints - levelTiers[levelTiers.length - 1].threshold;
    const extraLevels = Math.floor(extraPoints / 800);
    levelNumber = 10 + extraLevels;
    title = extraLevels > 5 ? 'Grão-Mestre Supremo' : 'Mestre Lendário';
    currentLevelThreshold = levelTiers[levelTiers.length - 1].threshold + extraLevels * 800;
    nextLevelThreshold = currentLevelThreshold + 800;
    nextTitle = 'Mestre Transcendental';
  }

  const span = Math.max(50, nextLevelThreshold - currentLevelThreshold);
  const currentPointsInLevel = Math.max(0, safePoints - currentLevelThreshold);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentPointsInLevel / span) * 100)));

  return {
    level: levelNumber,
    title,
    nextTitle,
    currentPointsInLevel,
    pointsNeededForNextLevel: span,
    progressPercent,
    totalPoints: safePoints,
  };
}

interface ProgressDashboardProps {
  totalPoints: number;
  completedChallenges: number;
  totalCorrectAnswers?: number;
  userGrade?: GradeLevel;
  userName?: string;
  theme?: 'light' | 'dark';
  customSubjects?: SubjectId[];
  onStartSession?: (subjectId: SubjectId) => void;
  onOpenTrophiesAndBadges?: (tab?: 'trophies' | 'badges') => void;
  onOpenProgressReport?: () => void;
  onOpenReportCard?: () => void;
  onOpenReminders?: () => void;
  onPracticeTopic?: (topic: string, subjectId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  totalPoints,
  completedChallenges,
  totalCorrectAnswers = 0,
  userGrade = '6_fund',
  userName = 'Estudante',
  theme = 'light',
  customSubjects = [],
  onStartSession,
  onOpenTrophiesAndBadges,
  onOpenReportCard,
  onOpenReminders,
  onPracticeTopic,
}) => {
  const isLight = theme === 'light';
  const safeGrade: GradeLevel = (userGrade as GradeLevel) || '6_fund';
  const [activeTab, setActiveTab] = useState<'geral' | 'erros' | 'materia'>('geral');
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusSummary>(() =>
    studyGoalService.getWeeklyFocusSummary()
  );
  const [reportData, setReportData] = useState<ReportCardData>(() =>
    reportCardService.getData(safeGrade)
  );

  useEffect(() => {
    const refresh = () => {
      setWeeklyFocus(studyGoalService.getWeeklyFocusSummary());
      setReportData(reportCardService.getData(safeGrade));
    };
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('estudahud_report_card_updated', handleUpdate);
    return () => {
      window.removeEventListener('estudahud_report_card_updated', handleUpdate);
    };
  }, [safeGrade]);

  const levelInfo = calculateAcademicLevel(totalPoints);
  const overallStats = reportCardService.calculateOverallStats(reportData);

  // Subjects for the user's grade
  const gradeSubjects = getSubjectsForGrade(safeGrade);

  // Format real subjects performance
  const subjectsPerformance = gradeSubjects.map((subj) => {
    const entry = reportData.subjects.find((s) => s.subjectId === subj.id);
    const { average } = entry
      ? reportCardService.calculateSubjectAverage(entry.grades)
      : { average: null };

    // Format display grade (0-10 format for Brazilian school standard)
    const gradeDisplay =
      average !== null ? (average / 10).toFixed(1).replace('.', ',') : 'Sem nota';
    const percent = average !== null ? Math.min(100, Math.round(average)) : 0;

    let barColor = 'bg-slate-700';
    if (average !== null) {
      if (average >= 70) barColor = 'bg-emerald-500';
      else if (average >= 50) barColor = 'bg-amber-500';
      else barColor = 'bg-rose-500';
    }

    return {
      id: subj.id,
      name: subj.name,
      icon: subj.icon,
      grade: gradeDisplay,
      percent,
      barColor,
      hasGrade: average !== null,
    };
  });

  // Real weekly graph points
  const maxWeeklyMinutes = Math.max(
    30,
    ...weeklyFocus.days.map((d) => d.minutes),
    weeklyFocus.targetMinutes
  );
  const weeklyData = weeklyFocus.days.map((d, i) => {
    const x = 20 + i * 46;
    // Invert Y for SVG (height 100, top is 15, bottom is 80)
    const heightPercent = Math.min(1, d.minutes / maxWeeklyMinutes);
    const y = Math.round(80 - heightPercent * 60);
    return {
      label: d.dayName,
      minutes: d.minutes,
      x,
      y,
      isToday: d.isToday,
      isTargetMet: d.isTargetMet,
    };
  });

  // Calculate SVG curve path
  const curvePoints = weeklyData.map((d) => `${d.x} ${d.y}`).join(' L ');
  const areaPath = `M ${weeklyData[0].x} ${weeklyData[0].y} L ${curvePoints} L ${weeklyData[weeklyData.length - 1].x} 90 L ${weeklyData[0].x} 90 Z`;

  const averageDisplay =
    overallStats.overallAverage !== null
      ? (overallStats.overallAverage / 10).toFixed(1).replace('.', ',')
      : '--';

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto w-full pb-24 sm:pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Meu Progresso
          </h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Nível {levelInfo.level} • {totalPoints.toLocaleString('pt-BR')} XP
          </p>
        </div>
        {onOpenReportCard && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenReportCard();
            }}
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition active:scale-95 ${
              isLight
                ? 'text-indigo-600 hover:text-indigo-700 bg-white border-slate-200 shadow-xs'
                : 'text-[#8b5cf6] hover:text-[#a855f7] bg-[#161e31] border-[#273553]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Boletim</span>
          </button>
        )}
      </div>

      {/* Segmented Control: Geral | Diagnóstico de Erros | Por matéria */}
      <div className={`p-1 rounded-2xl flex items-center gap-1 border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121829] border-[#273553]'
      }`}>
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('geral');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'geral'
              ? isLight
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-[#1e293b] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Geral (Cronograma & XP)
        </button>
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('erros');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'erros'
              ? isLight
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-[#1e293b] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
          <span>Diagnóstico de Erros</span>
        </button>
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('materia');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'materia'
              ? isLight
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-[#1e293b] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Por matéria
        </button>
      </div>

      {/* 1. ABA GERAL: TEMPO & CRONOGRAMA & EVOLUÇÃO XP & PREVIEW DE ERROS */}
      {activeTab === 'geral' && (
        <>
          {/* Gráfico Recharts: Evolução do XP nos últimos 7 dias */}
          <WeeklyXpEvolutionChart userTotalPoints={totalPoints} theme={theme} />

          <div className={`rounded-3xl p-4.5 space-y-4 shadow-xl border ${
            isLight
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-[#121829] border-[#273553]'
          }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tempo de Estudo Semanal
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-emerald-600' : 'text-[#4ade80]'}`}>
                  {weeklyFocus.formattedWeeklyTime}
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  ({weeklyFocus.activeDaysCount} {weeklyFocus.activeDaysCount === 1 ? 'dia ativo' : 'dias ativos'})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Sequência
              </span>
              <span className={`text-base font-black flex items-center justify-end gap-1 ${
                isLight ? 'text-amber-600' : 'text-amber-400'
              }`}>
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {weeklyFocus.streakDays} {weeklyFocus.streakDays === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>

          {/* Weekly Curve SVG Chart */}
          <div className="relative pt-2 pb-1">
            <div className="h-36 w-full flex items-center justify-center relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 320 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Horizontal Reference Grid Lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="320" y2="50" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="320" y2="80" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeDasharray="3 3" />

                {/* Y Axis Reference Labels */}
                <text x="0" y="20" fill={isLight ? '#94a3b8' : '#64748b'} fontSize="8" fontWeight="bold">
                  {maxWeeklyMinutes}m
                </text>
                <text x="0" y="50" fill={isLight ? '#94a3b8' : '#64748b'} fontSize="8" fontWeight="bold">
                  {Math.round(maxWeeklyMinutes / 2)}m
                </text>
                <text x="0" y="80" fill={isLight ? '#94a3b8' : '#64748b'} fontSize="8" fontWeight="bold">
                  0m
                </text>

                {/* Gradient Area under curve */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isLight ? '#10b981' : '#4ade80'} stopOpacity={isLight ? '0.25' : '0.35'} />
                    <stop offset="100%" stopColor={isLight ? '#10b981' : '#4ade80'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Line Stroke */}
                <path
                  d={`M ${weeklyData.map((d) => `${d.x} ${d.y}`).join(' L ')}`}
                  stroke={isLight ? '#10b981' : '#4ade80'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Dots on points */}
                {weeklyData.map((d, i) => (
                  <g key={i}>
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r="4.5"
                      fill={d.isTargetMet ? (isLight ? '#10b981' : '#4ade80') : (isLight ? '#6366f1' : '#8b5cf6')}
                      stroke={isLight ? '#ffffff' : '#121829'}
                      strokeWidth="2"
                    />
                    {d.isToday && (
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r="7"
                        fill={isLight ? '#10b981' : '#4ade80'}
                        fillOpacity="0.4"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className={`flex justify-between items-center px-1 text-[10px] font-bold mt-2 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {weeklyData.map((d, i) => (
                <span
                  key={i}
                  className={`text-center ${d.isToday ? (isLight ? 'text-emerald-700 font-black' : 'text-[#4ade80] font-black') : ''}`}
                >
                  {d.label}
                  {d.minutes > 0 && (
                    <span className={`block text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {d.minutes}m
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-[#161e31] border-[#273553] text-slate-300'
          }`}>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Meta diária recomendada:</span>
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {weeklyFocus.targetMinutes} min / dia
            </span>
          </div>
        </div>

        {/* Preview of Topic Mistakes in General View */}
        <TopicMistakesChart grade={safeGrade} onPracticeTopic={onPracticeTopic} theme={theme} />
        </>
      )}

      {/* 2. ABA DEDICADA: DIAGNÓSTICO DE ERROS POR TEMA (ONDE FOCAR) */}
      {activeTab === 'erros' && (
        <div className="space-y-4">
          <TopicMistakesChart grade={safeGrade} onPracticeTopic={onPracticeTopic} theme={theme} />
        </div>
      )}

      {/* 3. ABA MATÉRIA / BOLETIM */}
      {activeTab === 'materia' && (
      <div className={`rounded-3xl p-4.5 space-y-3.5 shadow-xl border ${
        isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#273553]'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Desempenho por matéria
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {overallStats.overallAverage !== null
                ? `Média geral do Boletim: ${averageDisplay}`
                : 'Notas cadastradas no Boletim'}
            </p>
          </div>
          {onOpenReportCard && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenReportCard();
              }}
              className={`text-xs font-bold ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-[#8b5cf6] hover:text-[#a855f7]'}`}
            >
              Lançar Notas
            </button>
          )}
        </div>

        <div className="space-y-3">
          {subjectsPerformance.map((subj) => (
            <div key={subj.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{subj.icon}</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{subj.name}</span>
                </div>
                <span
                  className={`font-black ${
                    subj.hasGrade
                      ? isLight ? 'text-slate-900' : 'text-white'
                      : isLight ? 'text-slate-400 font-normal text-[11px]' : 'text-slate-500 font-normal text-[11px]'
                  }`}
                >
                  {subj.grade}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1e293b]'}`}>
                <div
                  className={`h-full rounded-full ${subj.barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(subj.hasGrade ? 5 : 0, subj.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};
