/**
 * OptiObra - Componente Badge Premium
 * Etiqueta/insignia profesional con indicadores de estado
 */

import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-surface-100 text-surface-600 border border-surface-200',
  primary: 'bg-primary-50 text-primary-700 border border-primary-200',
  secondary: 'bg-surface-800 text-white',
  success: 'bg-success-50 text-success-700 border border-success-200',
  warning: 'bg-warning-50 text-warning-700 border border-warning-200',
  error: 'bg-error-50 text-error-700 border border-error-200',
  info: 'bg-info-50 text-info-700 border border-info-200',
  accent: 'bg-accent-50 text-accent-700 border border-accent-200',
};

const dotVariantColors = {
  default: 'bg-surface-400',
  primary: 'bg-primary-500',
  secondary: 'bg-surface-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  accent: 'bg-accent-500',
};

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-3 py-1 text-sm gap-2',
};

const dotSizes = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export function Badge({
  className = '',
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`
            rounded-full animate-pulse-soft
            ${dotSizes[size]}
            ${dotColor || dotVariantColors[variant]}
          `}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status Badge with predefined styles
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'paused' | 'error';
  label?: string;
  size?: 'xs' | 'sm' | 'md';
}

const statusConfig = {
  active: { variant: 'success' as const, label: 'Activo', dot: true },
  inactive: { variant: 'default' as const, label: 'Inactivo', dot: true },
  pending: { variant: 'warning' as const, label: 'Pendiente', dot: true },
  completed: { variant: 'primary' as const, label: 'Completado', dot: false },
  paused: { variant: 'info' as const, label: 'Pausado', dot: true },
  error: { variant: 'error' as const, label: 'Error', dot: true },
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot={config.dot}>
      {label || config.label}
    </Badge>
  );
}

export default Badge;
