import React from 'react';
import { GraduationCap, Camera, User } from 'lucide-react';

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  name = 'Estudante',
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const iconSizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const containerSize = sizeMap[size] || sizeMap.md;
  const iconSize = iconSizeMap[size] || iconSizeMap.md;

  // Se tiver foto de perfil válida (base64 ou URL http/https)
  if (photoURL && (photoURL.startsWith('data:image') || photoURL.startsWith('http://') || photoURL.startsWith('https://') || photoURL.startsWith('/'))) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 ${containerSize} ${
          showBorder ? 'border-2 border-indigo-500 shadow-sm' : ''
        } ${className}`}
        title={name}
      >
        <img
          src={photoURL}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Em caso de falha de carregamento da imagem remota, fallback seguro
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Padrão oficial escolar: Ícone clássico do Chapéu de Formatura (sem emojis)
  return (
    <div
      className={`relative rounded-full shrink-0 flex items-center justify-center bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 text-white ${containerSize} ${
        showBorder ? 'border-2 border-white/80 shadow-md ring-2 ring-indigo-500/20' : ''
      } ${className}`}
      title={name}
      aria-label={`Avatar de ${name}`}
    >
      <GraduationCap className={`${iconSize} text-white drop-shadow-xs`} />
    </div>
  );
};

// Componente para selecionar ou alterar a foto de perfil opcional
interface ProfilePhotoPickerProps {
  currentPhotoURL?: string | null;
  onPhotoSelected: (base64Image: string) => void;
  onRemovePhoto?: () => void;
  userName?: string;
}

export const ProfilePhotoPicker: React.FC<ProfilePhotoPickerProps> = ({
  currentPhotoURL,
  onPhotoSelected,
  onRemovePhoto,
  userName = 'Estudante',
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte e comprime a foto para visualização leve em JPEG
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          onPhotoSelected(compressed);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <UserAvatar photoURL={currentPhotoURL} name={userName} size="xl" />
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera className="w-6 h-6" />
        </div>
        <button
          type="button"
          className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-md border-2 border-white hover:bg-indigo-700 transition"
          title="Escolher foto de perfil"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
        >
          {currentPhotoURL ? 'Alterar Foto de Perfil' : 'Adicionar Foto de Perfil (Opcional)'}
        </button>

        {currentPhotoURL && onRemovePhoto && (
          <button
            type="button"
            onClick={onRemovePhoto}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 transition"
          >
            Usar Chapéu de Formatura
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500 text-center max-w-xs">
        Se você não escolher uma foto, o aplicativo exibirá automaticamente o elegante chapéu de formatura.
      </p>
    </div>
  );
};
