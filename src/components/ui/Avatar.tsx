/**
 * OptiObra - Componente Avatar
 * Muestra iniciales o imagen de usuario
 */

import { useState } from 'react';
import { User } from 'lucide-react';
import { getInitials } from '@/utils/formatters';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colors = [
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-yellow-100 text-yellow-700',
  'bg-lime-100 text-lime-700',
  'bg-green-100 text-green-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-pink-100 text-pink-700',
];

function getColorFromName(name?: string): string {
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  const showImage = src && !imgError;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden flex-shrink-0
        font-semibold
        ${sizeStyles[size]}
        ${!showImage ? colorClass : 'bg-surface-200'}
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : name ? (
        <span>{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-surface-400" />
      )}
    </div>
  );
}

export default Avatar;
