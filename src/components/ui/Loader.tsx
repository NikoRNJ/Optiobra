/**
 * OptiObra - Componente Loader
 * Indicadores de carga
 */

import { Loader2 } from 'lucide-react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  return (
    <Loader2 
      className={`animate-spin text-primary-500 ${sizeStyles[size]} ${className}`} 
    />
  );
}

export interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Cargando...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Loader size="lg" />
      <p className="text-sm text-surface-500">{message}</p>
    </div>
  );
}

export interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message = 'Cargando...' }: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <p className="text-sm font-medium text-surface-600">{message}</p>
      </div>
    </div>
  );
}

export default Loader;
