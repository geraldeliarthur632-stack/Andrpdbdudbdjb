import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { studyGoalService, DailyXpHistoryPoint } from '../services/studyGoalService';
import { soundEffects } from '../services/soundEffects';
import {
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Flame,
  CheckCircle2,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles,
} from 'lucide-react';

interface WeeklyXpEvolutionChartProps {
  userTotalPoints?: number;
  theme?: 'light' | 'dark';
}

export const WeeklyXpEvolutionChart: React.FC<WeeklyXpEvolutionChartProps> = ({
  userTotalPoints,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');
  const [summary, setSummary] = useState(() => studyGoalService.getWeeklyXpSummary(userTotalPoints));

  useEffect(() => {
    const refresh = () => {
      setSummary(studyGoalService.getWeeklyXpSummary(userTotalPoints));
    };

    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('estudahud_daily_xp_updated', handleUpdate);
    const interval = setInterval(refresh, 5000);

    return () => {
      window.removeEventListener('estudahud_daily_xp_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [userTotalPoints]);

  const {
    points,
    total7DaysXp,
    averageDailyXp,
    metGoalDaysCount,
    bestDayXp,
    bestDayLabel,
    goalXp,
  } = summary;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: DailyXpHistoryPoint = payload[0].payload;
    const value = chartMode === 'daily' ? data.xp : data.cumulativeXp;
    const isMet = data.xp >= data.goal;

    return (
      <div className={`rounded-2xl p-3 shadow-xl text-xs space-y-1.5 min-w-[170px] pointer-events-none backdrop-blur-md border ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/80'
          : 'bg-[#0f172a] border-[#334155] text-white shadow-2xl'
      }`}>
        <div className={`flex items-center justify-between gap-2 border-b pb-1.5 ${isLight ? 'border-slate-100' : 'border-[#1e293b]'}`}>
          <span className={`font-extrabold text-[13px] flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            {data.dayFull}
          </span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{data.formattedDate}</span>
        </div>

        <div className={`flex items-center justify-between pt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
            {chartMode === 'daily' ? 'XP Ganho:' : 'Total Acumulado:'}
          </span>
          <span className="font-black text-sm text-indigo-600 flex items-center gap-0.5">
            <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
            {value.toLocaleString('pt-BR')} XP
          </span>
        </div>

        {chartMode === 'daily' && (
          <div className={`flex items-center justify-between pt-1 border-t ${isLight ? 'border-slate-100' : 'border-[#1e293b]/60'}`}>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Meta: {data.goal} XP</span>
            {isMet ? (
              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Meta batida!
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-600">
                Faltam {Math.max(0, data.goal - data.xp)} XP
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="weekly-xp-evolution-chart"
      className={`rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#121829] border-[#273553] text-white'
      }`}
    >
      {/* Card Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b pb-3.5 ${
        isLight ? 'border-slate-100' : 'border-[#273553]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 border ${
            isLight
              ? 'bg-purple-50 border-purple-200 text-purple-600'
              : 'bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border-purple-500/40 text-purple-300'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Evolução de XP (Últimos 7 dias)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border ${
                isLight
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              }`}>
                <Sparkles className="w-3 h-3 text-amber-500" />
                Recharts
              </span>
            </div>
            <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Acompanhe seu ritmo e crescimento acadêmico dia a dia
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Diário vs Acumulado */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto text-xs font-bold ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#162035] border-[#273553]'
        }`}>
          <button
            onClick={() => {
              soundEffects.playClick();
              setChartMode('daily');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              chartMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>XP Diário</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setChartMode('cumulative');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              chartMode === 'cumulative'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Crescimento</span>
          </button>
        </div>
      </div>

      {/* Key Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
        <div className={`p-2.5 rounded-2xl border space-y-0.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Total 7 Dias
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg sm:text-xl font-black ${isLight ? 'text-sky-600' : 'text-[#38bdf8]'}`}>
              +{total7DaysXp.toLocaleString('pt-BR')}
            </span>
            <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>XP</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border space-y-0.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Média Diária
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg sm:text-xl font-black ${isLight ? 'text-purple-600' : 'text-[#a855f7]'}`}>
              {averageDailyXp}
            </span>
            <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>XP/dia</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border space-y-0.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Metas Batidas
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-emerald-600">
              {metGoalDaysCount}
            </span>
            <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>de 7 dias</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border space-y-0.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#162035]/80 border-[#273553]'
        }`}>
          <span className={`text-[10px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Melhor Dia
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-amber-600">
              {bestDayXp}
            </span>
            <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>XP ({bestDayLabel})</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="pt-2 relative z-10 w-full">
        <div className="w-full h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'daily' ? (
              <AreaChart
                data={points}
                margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rechartsXpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke={isLight ? '#94a3b8' : '#475569'}
                  tick={{ fontSize: 11, fill: isLight ? '#475569' : '#94a3b8', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: isLight ? '#cbd5e1' : '#273553' }}
                />
                <YAxis
                  stroke={isLight ? '#94a3b8' : '#475569'}
                  tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: isLight ? '#cbd5e1' : '#273553' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {goalXp > 0 && (
                  <ReferenceLine
                    y={goalXp}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Meta: ${goalXp} XP`,
                      position: 'top',
                      fill: isLight ? '#b45309' : '#fbbf24',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#rechartsXpGradient)"
                  dot={{
                    r: 4,
                    fill: '#8b5cf6',
                    stroke: isLight ? '#ffffff' : '#121829',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#38bdf8',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            ) : (
              <AreaChart
                data={points}
                margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rechartsCumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke={isLight ? '#94a3b8' : '#475569'}
                  tick={{ fontSize: 11, fill: isLight ? '#475569' : '#94a3b8', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: isLight ? '#cbd5e1' : '#273553' }}
                />
                <YAxis
                  stroke={isLight ? '#94a3b8' : '#475569'}
                  tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: isLight ? '#cbd5e1' : '#273553' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeXp"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#rechartsCumulativeGradient)"
                  dot={{
                    r: 4,
                    fill: '#06b6d4',
                    stroke: isLight ? '#ffffff' : '#121829',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#38bdf8',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom indicator / Legend */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-medium border-t ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-[#273553]/70 text-slate-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              {chartMode === 'daily' ? 'XP Ganho no Dia' : 'XP Acumulado'}
            </span>
            {chartMode === 'daily' && (
              <span className={`flex items-center gap-1.5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                <span className={`w-3 h-0.5 border-t-2 border-dashed inline-block ${isLight ? 'border-amber-600' : 'border-amber-400'}`} />
                Linha de Meta ({goalXp} XP)
              </span>
            )}
          </div>

          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Toque nos pontos para inspecionar cada dia
          </span>
        </div>
      </div>
    </div>
  );
};
