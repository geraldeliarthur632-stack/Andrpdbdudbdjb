import React, { useState, useEffect } from 'react';
import { AgeGroup } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  ShieldCheck,
  X,
  Check,
  Baby,
  Smile,
  GraduationCap,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface AgeClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  currentAgeGroup?: AgeGroup;
  onAgeSaved?: (group: AgeGroup) => void;
}

export const AgeClassificationModal: React.FC<AgeClassificationModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  currentAgeGroup = 'nao_informada',
  onAgeSaved,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup>(currentAgeGroup);
  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(currentAgeGroup);
    }
  }, [isOpen, currentAgeGroup]);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEffects.playSuccess();
    if (onAgeSaved) {
      onAgeSaved(selectedGroup);
    }
    onClose();
  };

  const options: {
    id: AgeGroup;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    details: string;
  }[] = [
    {
      id: 'crianca',
      title: 'Criança (Até 12 anos)',
      subtitle: 'Alunos do Ensino Fundamental I e II',
      badge: 'Proteção Infantil Reforçada',
      icon: Baby,
      details: 'Interface intuitiva e acolhedora adaptada para os primeiros anos de aprendizado.',
    },
    {
      id: 'adolescente',
      title: 'Adolescente (13 a 17 anos)',
      subtitle: 'Alunos do Ensino Fundamental Final e Ensino Médio',
      badge: 'Ensino Médio e Vestibulares',
      icon: Smile,
      details: 'Conteúdos focados no avanço acadêmico, projetos e preparação para provas.',
    },
    {
      id: 'adulto',
      title: 'Adulto (18 anos ou mais)',
      subtitle: 'Estudantes do ENEM, vestibulares e concurseiros',
      badge: 'Classificação Geral Educativa',
      icon: GraduationCap,
      details: 'Foco total em alta performance, simulados e domínio conceitual avançado.',
    },
    {
      id: 'nao_informada',
      title: 'Prefiro não informar',
      subtitle: 'Máxima cautela e privacidade',
      badge: 'Privacidade Padrão',
      icon: HelpCircle,
      details: 'Por segurança e privacidade, o app adota perfil educacional padrão e seguro.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-config-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] bg-white border-slate-200 text-slate-900"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-indigo-50/80 border-indigo-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="age-config-modal-title" className="text-sm font-black text-indigo-900">
                Faixa Etária & Perfil
              </h3>
              <p className="text-[11px] text-indigo-700 font-medium">
                Personalização do aprendizado e proteção da privacidade
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg transition text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Privacy Note */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Privacidade Garantida:</strong> Não coletamos nem armazenamos sua data de nascimento ou sua idade exata. Seus dados permanecem seguros no seu dispositivo.
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Selecione a faixa etária do usuário:
            </label>

            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedGroup === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedGroup(opt.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                          : 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-100'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-600'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs">{opt.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] block text-slate-500 dark:text-slate-400 font-medium">
                        {opt.subtitle}
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {opt.badge}
                      </span>
                      <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {opt.details}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex items-center justify-end gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Salvar Preferência
          </button>
        </div>
      </div>
    </div>
  );
};
