import React, { useState } from 'react';
import { UserProfile } from '../types';
import { THEMATIC_AVATARS, ThematicAvatar, isAvatarUnlocked, getAvatarById, getAvatarByEmoji } from '../data/avatarGalleryData';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  Sparkles,
  Lock,
  Check,
  Award,
  Zap,
  Star,
  Crown,
  ChevronRight,
  Flame,
  Shield,
  Palette,
} from 'lucide-react';

interface AvatarGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSelectAvatar: (avatar: ThematicAvatar) => void;
}

type CategoryFilter = 'all' | 'exatas' | 'humanas' | 'ciencias' | 'estrategia' | 'lendarios' | 'iniciais';

export const AvatarGalleryModal: React.FC<AvatarGalleryModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectAvatar,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [previewAvatar, setPreviewAvatar] = useState<ThematicAvatar>(() => {
    return (
      (user.avatarId ? getAvatarById(user.avatarId) : null) ||
      getAvatarByEmoji(user.avatar) ||
      THEMATIC_AVATARS[0]
    );
  });

  if (!isOpen) return null;

  const userPoints = user.totalPoints || 0;

  const filteredAvatars = THEMATIC_AVATARS.filter((avatar) => {
    if (selectedCategory === 'all') return true;
    return avatar.category === selectedCategory;
  });

  const unlockedCount = THEMATIC_AVATARS.filter((a) => isAvatarUnlocked(a, userPoints)).length;
  const isPreviewUnlocked = isAvatarUnlocked(previewAvatar, userPoints);
  const isPreviewEquipped =
    user.avatarId === previewAvatar.id || user.avatar === previewAvatar.emoji;

  const handleEquip = (avatar: ThematicAvatar) => {
    if (!isAvatarUnlocked(avatar, userPoints)) {
      soundEffects.playError();
      return;
    }
    soundEffects.playVictory();
    onSelectAvatar(avatar);
  };

  const getAnimationCSS = (anim: ThematicAvatar['animationKey']) => {
    switch (anim) {
      case 'matrix':
      case 'pulse':
        return 'animate-pulse';
      case 'float':
        return 'animate-bounce';
      case 'flame':
      case 'cosmic':
      case 'sparkle':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-amber-500">
                <Palette className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Galeria de Avatares</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {unlockedCount} / {THEMATIC_AVATARS.length} Desbloqueados
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Atinja metas de XP em estudos para liberar avatares temáticos e animados!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border border-slate-200 relative overflow-hidden shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Animated Avatar Visual */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${previewAvatar.bgGradient} p-1 ${previewAvatar.borderClass} ${previewAvatar.glowClass} flex items-center justify-center transition-all duration-300 shadow-sm`}
              >
                <div className="w-full h-full rounded-xl bg-white/95 flex items-center justify-center text-4xl sm:text-5xl select-none relative overflow-hidden shadow-inner">
                  <span className={`${getAnimationCSS(previewAvatar.animationKey)} inline-block transform hover:scale-110 transition duration-200`}>
                    {previewAvatar.emoji}
                  </span>
                  {/* Subtle decorative glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/20 pointer-events-none" />
                </div>
              </div>

              {!isPreviewUnlocked && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-slate-800 border border-amber-400 text-amber-300 flex items-center justify-center shadow-md">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Avatar Details */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {previewAvatar.name}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                  {previewAvatar.badgeLabel}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {previewAvatar.categoryLabel}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {previewAvatar.description}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-amber-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Efeito: {previewAvatar.specialPerk}</span>
              </div>

              {/* Unlock Requirement / Progress */}
              <div className="pt-1">
                {isPreviewUnlocked ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Desbloqueado!
                    </span>
                    <button
                      onClick={() => handleEquip(previewAvatar)}
                      disabled={isPreviewEquipped}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                        isPreviewEquipped
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold'
                      }`}
                    >
                      {isPreviewEquipped ? '✓ Equipado no Perfil' : 'Equipar Este Avatar'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-500" /> Requisito: {previewAvatar.xpRequired} XP
                      </span>
                      <span className="text-amber-700">
                        {userPoints} / {previewAvatar.xpRequired} XP (Faltam {Math.max(previewAvatar.xpRequired - userPoints, 0)} XP)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(Math.round((userPoints / previewAvatar.xpRequired) * 100), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar shrink-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'iniciais', label: 'Iniciais' },
            { id: 'exatas', label: 'Exatas & Lógica' },
            { id: 'humanas', label: 'Humanas & Letras' },
            { id: 'ciencias', label: 'Ciências' },
            { id: 'estrategia', label: 'Estratégia' },
            { id: 'lendarios', label: 'Lendários 👑' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(tab.id as CategoryFilter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Avatars Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[340px]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {filteredAvatars.map((avatar) => {
              const unlocked = isAvatarUnlocked(avatar, userPoints);
              const isSelected = previewAvatar.id === avatar.id;
              const isEquipped = user.avatarId === avatar.id || user.avatar === avatar.emoji;

              return (
                <button
                  key={avatar.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setPreviewAvatar(avatar);
                  }}
                  className={`p-2.5 rounded-2xl border text-center relative flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40 scale-[1.02] shadow-xs'
                      : unlocked
                      ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 opacity-70'
                  }`}
                >
                  {/* Equipped tag */}
                  {isEquipped && (
                    <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                      ✓
                    </span>
                  )}

                  {/* Lock icon */}
                  {!unlocked && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-700 text-amber-300 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Avatar Visual */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.bgGradient} p-0.5 ${
                      unlocked ? avatar.borderClass : 'border-slate-300'
                    } flex items-center justify-center shadow-2xs`}
                  >
                    <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-2xl select-none">
                      <span className={unlocked ? getAnimationCSS(avatar.animationKey) : 'grayscale contrast-75'}>
                        {avatar.emoji}
                      </span>
                    </div>
                  </div>

                  {/* Name & XP */}
                  <div className="w-full">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{avatar.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {avatar.xpRequired === 0 ? 'Livre' : `${avatar.xpRequired} XP`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Seu XP Total: <strong className="text-amber-700 font-extrabold">{userPoints} XP</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
