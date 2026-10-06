import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface StudentAvatarProps {
  photoURL?: string | null;
  className?: string;
  iconClassName?: string;
  alt?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  photoURL,
  className = 'w-10 h-10',
  iconClassName = 'w-5 h-5 text-indigo-600',
  alt = 'Estudante',
}) => {
  const [imageError, setImageError] = useState(false);

  if (photoURL && !imageError) {
    return (
      <img
        src={photoURL}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${className} object-cover rounded-full shadow-xs shrink-0 select-none`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 select-none`}
      title="Perfil do Estudante"
    >
      <GraduationCap className={iconClassName} />
    </div>
  );
};
