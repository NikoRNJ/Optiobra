/**
 * OptiObra - Componente EmptyState Premium
 * Estado vacío profesional con animaciones y diseño atractivo
 */

import type { ReactNode } from 'react';
import { FileQuestion, Plus } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-3">
          {icon || <FileQuestion className="w-6 h-6 text-surface-400" />}
        </div>
        <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-surface-500 max-w-xs">{description}</p>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-2xl border border-surface-200/60 shadow-card p-8 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-50 flex items-center justify-center">
              {icon || <FileQuestion className="w-8 h-8 text-surface-400" />}
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary-100 animate-pulse-soft" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-accent-100 animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
          </div>

          <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>

          {description && (
            <p className="text-sm text-surface-500 max-w-sm mb-5 leading-relaxed">{description}</p>
          )}

          {action && (
            <Button
              onClick={action.onClick}
              leftIcon={action.icon || <Plus className="w-4 h-4" />}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in-up">
      {/* Icon with decorative background */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-50 flex items-center justify-center shadow-sm">
          {icon || <FileQuestion className="w-10 h-10 text-surface-400" />}
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary-100 opacity-70 animate-bounce-subtle" />
        <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-accent-100 opacity-70 animate-bounce-subtle" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-1/2 -right-6 w-4 h-4 rounded-full bg-secondary-100 opacity-50 animate-pulse-soft" />
      </div>

      <h3 className="text-xl font-bold text-surface-900 mb-2">{title}</h3>

      {description && (
        <p className="text-base text-surface-500 max-w-md mb-6 leading-relaxed text-balance">
          {description}
        </p>
      )}

      {action && (
        <Button
          size="lg"
          onClick={action.onClick}
          leftIcon={action.icon || <Plus className="w-5 h-5" />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
