import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { generateUniqueNames } from '../utils/nameGenerator';
import { X, Check, GraduationCap, Camera, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave?: (updated: Partial<UserProfile>) => void;
  onSaveProfile?: (updated: Partial<UserProfile>) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onSaveProfile,
}) => {
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState<GradeLevel>(user.grade);
  const [photoURL, setPhotoURL] = useState<string | undefined>(user.photoURL);
  const [error, setError] = useState('');
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setGrade(user.grade);
      setPhotoURL(user.photoURL);
      setError('');
      setSuggestedNames(generateUniqueNames(4));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePickSuggestion = (sug: string) => {
    soundEffects.playClick();
    setName(sug);
    setError('');
  };

  const handleRefreshSuggestions = () => {
    soundEffects.playClick();
    setSuggestedNames(generateUniqueNames(4));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('A foto selecionada é muito grande. Escolha uma imagem de até 5MB.');
      soundEffects.playError();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoURL(result);
      setError('');
      soundEffects.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    soundEffects.playClick();
    setPhotoURL(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, informe seu nome ou escolha uma sugestão.');
      soundEffects.playError();
      return;
    }

    if (cleanName.length < 3) {
      setError('O nome precisa ter pelo menos 3 caracteres.');
      soundEffects.playError();
      return;
    }

    soundEffects.playClick();
    const updatedData: Partial<UserProfile> = {
      name: cleanName,
      grade,
      photoURL: photoURL || undefined,
      avatar: 'graduation-cap',
    };

    if (onSave) onSave(updatedData);
    if (onSaveProfile) onSaveProfile(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Editar Perfil</h3>
            <p className="text-xs text-slate-500">Foto opcional, nome e ano escolar</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Photo Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="relative mx-auto w-20 h-20 rounded-full bg-white border-2 border-indigo-200 shadow-md flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-indigo-600">
                  <GraduationCap className="w-10 h-10 text-indigo-600" />
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5">Padrão</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {photoURL ? 'Foto de perfil ativa' : 'Chapéu de Formatura (Padrão)'}
              </p>
              <p className="text-[11px] text-slate-500">
                A foto é opcional. Se não escolher, usamos o chapéu de formatura.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-photo-upload"
              />
              <label
                htmlFor="profile-photo-upload"
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{photoURL ? 'Trocar Foto' : 'Escolher Foto'}</span>
              </label>

              {photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="Remover foto e voltar ao chapéu de formatura"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover</span>
                </button>
              )}
            </div>
          </div>

          {/* Name input & Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-bold text-xs">Seu Nome / Apelido</label>
              <button
                type="button"
                onClick={handleRefreshSuggestions}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sugerir Nomes</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite seu nome ou apelido..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-sm font-semibold transition"
            />

            {/* Suggestions */}
            {suggestedNames.length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Sugestões rápidas:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedNames.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handlePickSuggestion(sug)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                        name === sug
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grade selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">Série ou Ano Escolar</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-semibold focus:outline-hidden focus:border-indigo-600 cursor-pointer"
            >
              {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g].short} ({GRADE_LABELS[g].full})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
