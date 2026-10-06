import React from 'react';
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Landmark,
  Globe,
  Palette,
  Languages,
  Activity,
  Music,
  Dna,
  Atom,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SubjectId } from '../types';

interface SubjectIconProps {
  subjectId: SubjectId | string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ subjectId, className = 'w-5 h-5 text-indigo-600' }) => {
  switch (subjectId) {
    case 'matematica':
      return <Calculator className={className} />;
    case 'portugues':
    case 'literatura':
    case 'redacao':
      return <BookOpen className={className} />;
    case 'ciencias':
      return <FlaskConical className={className} />;
    case 'biologia':
      return <Dna className={className} />;
    case 'fisica':
    case 'quimica':
      return <Atom className={className} />;
    case 'historia':
    case 'filosofia':
    case 'sociologia':
      return <Landmark className={className} />;
    case 'geografia':
      return <Globe className={className} />;
    case 'artes':
      return <Palette className={className} />;
    case 'ingles':
    case 'espanhol':
      return <Languages className={className} />;
    case 'ed_fisica':
      return <Activity className={className} />;
    case 'musica':
      return <Music className={className} />;
    case 'programacao':
      return <Binary className={className} />;
    case 'geral':
    case 'todos':
      return <Layers className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
