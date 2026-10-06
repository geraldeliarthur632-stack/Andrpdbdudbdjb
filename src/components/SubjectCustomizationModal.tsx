import React, { useState, useEffect } from 'react';
import { UserProfile, SubjectId, GradeLevel } from '../types';
import { CONFIGURABLE_SPECIFIC_SUBJECTS, GRADE_LABELS, HIGH_SCHOOL_GRADES } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { X, Check, Atom, ArrowRight } from 'lucide-react';

interface SubjectCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveSubjects: (selectedSubjects: SubjectId[]) => void;
  isFirstSetup?: boolean;
}

export const SubjectCustomizationModal: React.FC<SubjectCustomizationModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveSubjects,
  isFirstSetup = false,
}) => {
  const isHighSchool = HIGH_SCHOOL_GRADES.includes(user.grade as GradeLevel);

  // Initialize selected subjects strictly from user profile customSubjects (empty by default until student adds them)
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(() => {
    if (user.customSubjects && user.customSubjects.length > 0) {
      return user.customSubjects.filter((id) => ['biologia', 'fisica', 'quimica'].includes(id));
    }
    return [];
  });

  useEffect(() => {
    if (isOpen) {
      if (user.customSubjects && user.customSubjects.length > 0) {
        setSelectedSubjects(
          user.customSubjects.filter((id) => ['biologia', 'fisica', 'quimica'].includes(id))
        );
      } else {
        setSelectedSubjects([]);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleSubject = (subjId: SubjectId) => {
    soundEffects.playClick();
    setSelectedSubjects((prev) =>
      prev.includes(subjId) ? prev.filter((id) => id !== subjId) : [...prev, subjId]
    );
  };

  const handleSelectSciencePack = () => {
    soundEffects.playClick();
    setSelectedSubjects(['biologia', 'fisica', 'quimica']);
  };

  const handleClearSciencePack = () => {
    soundEffects.playClick();
    setSelectedSubjects([]);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('estudahud_subjects_prompted_once', 'true');
    } catch {}
    if (!user.hasConfiguredSubjects) {
      onSaveSubjects(selectedSubjects);
    }
    onClose();
  };

  const handleSkip = () => {
    soundEffects.playClick();
    try {
      localStorage.setItem('estudahud_subjects_prompted_once', 'true');
    } catch {}
    onSaveSubjects(isHighSchool ? ['biologia', 'fisica', 'quimica'] : []);
    onClose();
  };

  const handleSave = () => {
    soundEffects.playSuccess();
    try {
      localStorage.setItem('estudahud_subjects_prompted_once', 'true');
    } catch {}
    onSaveSubjects(selectedSubjects);
    onClose();
  };

  const gradeInfo = GRADE_LABELS[user.grade] || { full: 'Sua Série', stage: 'Escolar' };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 sm:p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Ciências da Natureza
                </span>
                <span className="text-[11px] text-indigo-100 font-medium">
                  {gradeInfo.full}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Editar Matérias Escolares
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mt-2 font-normal">
            Sua escola tem aulas separadas de <strong>Biologia, Física e Química</strong>? Selecione abaixo quais dessas 3 matérias você estuda:
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Biologia, Física e Química
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleSelectSciencePack}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer px-2 py-0.5 rounded-md hover:bg-indigo-50"
                >
                  Marcar as 3
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleClearSciencePack}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 transition cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-100"
                >
                  Desmarcar
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              Muito comuns no Ensino Médio e em escolas com matérias específicas no Fundamental (8º e 9º ano):
            </p>

            {/* The 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {CONFIGURABLE_SPECIFIC_SUBJECTS.map((sub) => {
                const isChecked = selectedSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-500/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <span className="text-2xl">{sub.icon}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isChecked
                            ? 'bg-indigo-600 text-white'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-900 block">
                        {sub.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-1">
                        {sub.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clarification Info Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5 text-slate-700 text-xs">
            <span className="text-base">💡</span>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              Você pode alterar ou adicionar essas matérias a qualquer momento pelo botão <strong>"Editar Matérias"</strong> dentro da <strong>Jornada</strong>. As matérias da BNCC (Matemática, Português, Ciências geral, História, Geografia, Inglês) continuam sempre disponíveis.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            {selectedSubjects.length === 0 ? (
              <span>Nenhuma ciência separada (usar Ciências da BNCC)</span>
            ) : (
              <span>
                <strong>{selectedSubjects.length}</strong> de 3 matérias específicas ativadas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isFirstSetup ? (
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Pular
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <span>Salvar Matérias</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
