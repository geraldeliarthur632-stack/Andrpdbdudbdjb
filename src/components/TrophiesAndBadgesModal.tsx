import React, { useState } from 'react';
import { BadgeItem, TrophyItem, UserProfile } from '../types';
import {
  ALL_BADGES,
  ALL_TROPHIES,
  getEarnedBadges,
  getEarnedTrophies,
  getHighestBadge,
  getHighestTrophy,
  getNextBadge,
  getNextTrophy,
} from '../data/trophiesAndBadges';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import {
  X,
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Star,
  Flame,
} from 'lucide-react';

interface TrophiesAndBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  defaultTab?: 'trophies' | 'badges';
}

export const TrophiesAndBadgesModal: React.FC<TrophiesAndBadgesModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultTab = 'trophies',
}) => {
  const [activeTab, setActiveTab] = useState<'trophies' | 'badges'>(defaultTab);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPoints = user.totalPoints || 0;
  const totalCorrect = user.totalCorrectAnswers || 0;

  const earnedBadges = getEarnedBadges(totalPoints);
  const highestBadge = getHighestBadge(totalPoints);
  const nextBadge = getNextBadge(totalPoints);

  const earnedTrophies = getEarnedTrophies(totalCorrect);
  const highestTrophy = getHighestTrophy(totalCorrect);
  const nextTrophy = getNextTrophy(totalCorrect);

  const handleSpeakItem = (id: string, text: string) => {
    soundEffects.playClick();
    if (speakingId === id) {
      speechNarrator.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speechNarrator.speak(
        text,
        () => setSpeakingId(id),
        () => setSpeakingId(null)
      );
    }
  };

  const handleClose = () => {
    speechNarrator.stop();
    setSpeakingId(null);
    soundEffects.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0 font-bold">
              🏆
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900 truncate">
                Coleção de Troféus & Emblemas
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Marcos por pontos e acertos curriculares
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition shrink-0"
            aria-label="Fechar Coleção"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-1 bg-white">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 text-xs font-bold">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('trophies');
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'trophies'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Troféus de Acertos ({earnedTrophies.length}/{ALL_TROPHIES.length})</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('badges');
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'badges'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Emblemas ({earnedBadges.length}/{ALL_BADGES.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
          {/* TAB: TROPHIES (ACERTOS DE PERGUNTAS) */}
          {activeTab === 'trophies' && (
            <div className="space-y-3">
              {/* Summary Status Box */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                      🎯
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Perguntas Acertadas
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Total geral: <strong className="text-amber-700 font-bold">{totalCorrect} acertos</strong>
                      </span>
                    </div>
                  </div>

                  {highestTrophy ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-extrabold">
                      <span>{highestTrophy.icon}</span>
                      <span>{highestTrophy.title}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                      Sem troféus ainda
                    </span>
                  )}
                </div>

                {/* Next Trophy Progress */}
                {nextTrophy ? (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">
                        Próximo: {nextTrophy.icon} {nextTrophy.title}
                      </span>
                      <span className="text-amber-700 font-mono">
                        {totalCorrect} / {nextTrophy.correctAnswersRequired} acertos
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((totalCorrect / nextTrophy.correctAnswersRequired) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Faltam <strong>{Math.max(0, nextTrophy.correctAnswersRequired - totalCorrect)}</strong> acertos para desbloquear!
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Todos os troféus da coleção foram conquistados! Parabéns!</span>
                  </div>
                )}
              </div>

              {/* Trophies List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Galeria de Troféus
                </span>

                {ALL_TROPHIES.map((trophy) => {
                  const isUnlocked = totalCorrect >= trophy.correctAnswersRequired;
                  const progressPct = Math.min(
                    100,
                    Math.round((totalCorrect / trophy.correctAnswersRequired) * 100)
                  );
                  const isSpeaking = speakingId === trophy.id;

                  let borderClass = 'border-slate-200 bg-white';
                  let iconBg = 'bg-slate-100 text-slate-400';
                  let textBadge = 'bg-slate-100 text-slate-600 border-slate-200';

                  if (isUnlocked) {
                    if (trophy.metal === 'bronze') {
                      borderClass = 'border-amber-300 bg-amber-50/40';
                      iconBg = 'bg-amber-100 text-amber-900';
                      textBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                    } else if (trophy.metal === 'silver') {
                      borderClass = 'border-slate-300 bg-slate-50';
                      iconBg = 'bg-slate-200 text-slate-800';
                      textBadge = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
                    } else if (trophy.metal === 'gold') {
                      borderClass = 'border-yellow-400 bg-yellow-50/60 ring-1 ring-yellow-400/50';
                      iconBg = 'bg-yellow-100 text-yellow-900';
                      textBadge = 'bg-yellow-100 text-yellow-900 border-yellow-300 font-extrabold';
                    } else if (trophy.metal === 'diamond') {
                      borderClass = 'border-cyan-300 bg-cyan-50/50';
                      iconBg = 'bg-cyan-100 text-cyan-900';
                      textBadge = 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold';
                    } else {
                      borderClass = 'border-purple-300 bg-purple-50/50';
                      iconBg = 'bg-purple-100 text-purple-900';
                      textBadge = 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
                    }
                  }

                  return (
                    <div
                      key={trophy.id}
                      className={`p-3.5 rounded-2xl border transition shadow-xs space-y-2 ${borderClass}`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-xs ${
                              isUnlocked ? iconBg : 'bg-slate-100 opacity-60 grayscale'
                            }`}
                          >
                            {isUnlocked ? trophy.icon : <Lock className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                className={`text-sm font-black truncate ${
                                  isUnlocked ? 'text-slate-900' : 'text-slate-600'
                                }`}
                              >
                                {trophy.title}
                              </h3>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md border ${textBadge}`}>
                                {trophy.rarityLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-snug mt-0.5">
                              {trophy.description}
                            </p>
                          </div>
                        </div>

                        {/* Audio Narrator Button */}
                        <button
                          onClick={() =>
                            handleSpeakItem(
                              trophy.id,
                              `${trophy.title}. ${trophy.description}. Status: ${
                                isUnlocked
                                  ? 'Troféu Conquistado!'
                                  : `Faltam ${trophy.correctAnswersRequired - totalCorrect} acertos.`
                              }`
                            )
                          }
                          className={`p-1.5 rounded-xl border transition shrink-0 ${
                            isSpeaking
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title="Ouvir detalhes"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Progress Bar for Locked / Conquered label */}
                      <div className="pt-1 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                        {isUnlocked ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Troféu Conquistado!</span>
                          </div>
                        ) : (
                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                              <span>Progresso de Acertos</span>
                              <span className="font-mono">{totalCorrect} / {trophy.correctAnswersRequired}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-500 transition-all duration-300 rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: BADGES (EMBLEMAS DE PONTOS TOTAIS) */}
          {activeTab === 'badges' && (
            <div className="space-y-3">
              {/* Badges Summary Status Box */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                      <Zap className="w-4 h-4 text-blue-700 fill-blue-700" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Pontuação Acumulada
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Total: <strong className="text-blue-700 font-bold">{totalPoints.toLocaleString('pt-BR')} pts</strong>
                      </span>
                    </div>
                  </div>

                  {highestBadge ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-extrabold">
                      <span>{highestBadge.icon}</span>
                      <span>{highestBadge.title}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                      Sem emblemas ainda
                    </span>
                  )}
                </div>

                {/* Next Badge Progress */}
                {nextBadge ? (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">
                        Próximo: {nextBadge.icon} {nextBadge.title}
                      </span>
                      <span className="text-blue-700 font-mono">
                        {totalPoints} / {nextBadge.pointsRequired} pts
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((totalPoints / nextBadge.pointsRequired) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Faltam <strong>{Math.max(0, nextBadge.pointsRequired - totalPoints)}</strong> pontos para o próximo emblema!
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Você desbloqueou todos os emblemas da plataforma! Incrível!</span>
                  </div>
                )}
              </div>

              {/* Badges List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Emblemas por Pontuação
                </span>

                {ALL_BADGES.map((badge) => {
                  const isUnlocked = totalPoints >= badge.pointsRequired;
                  const progressPct = Math.min(
                    100,
                    Math.round((totalPoints / badge.pointsRequired) * 100)
                  );
                  const isSpeaking = speakingId === badge.id;

                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border transition shadow-xs space-y-2 ${
                        isUnlocked
                          ? 'border-blue-200 bg-white'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-xs ${
                              isUnlocked ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-slate-100 grayscale'
                            }`}
                          >
                            {isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                className={`text-sm font-black truncate ${
                                  isUnlocked ? 'text-slate-900' : 'text-slate-600'
                                }`}
                              >
                                {badge.title}
                              </h3>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md border bg-slate-100 text-slate-700 border-slate-200 font-bold">
                                {badge.pointsRequired.toLocaleString('pt-BR')} pts
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-snug mt-0.5">
                              {badge.description}
                            </p>
                          </div>
                        </div>

                        {/* Audio Narrator Button */}
                        <button
                          onClick={() =>
                            handleSpeakItem(
                              badge.id,
                              `${badge.title}. ${badge.description}. Categoria: ${badge.category}. Requer ${badge.pointsRequired} pontos. Status: ${
                                isUnlocked
                                  ? 'Emblema Desbloqueado!'
                                  : `Faltam ${badge.pointsRequired - totalPoints} pontos.`
                              }`
                            )
                          }
                          className={`p-1.5 rounded-xl border transition shrink-0 ${
                            isSpeaking
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title="Ouvir detalhes"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Status / Progress */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        {isUnlocked ? (
                          <div className="flex items-center gap-1 text-blue-700 font-extrabold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Emblema Desbloqueado!</span>
                          </div>
                        ) : (
                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                              <span>Progresso de Pontos</span>
                              <span className="font-mono">{totalPoints} / {badge.pointsRequired}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition active:scale-[0.99]"
          >
            Fechar Coleção
          </button>
        </div>
      </div>
    </div>
  );
};
