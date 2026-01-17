/**
 * OptiObra - Componente Card
 * Tarjeta contenedora profesional para supervisores
 */

import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  animate?: boolean;
}

const variantStyles = {
  default: 'bg-white border border-surface-200 shadow-card',
  outlined: 'bg-white border-2 border-surface-200',
  elevated: 'bg-white shadow-lg border border-surface-100',
  dark: 'bg-surface-800 border border-surface-700 text-white',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  animate = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${animate ? 'animate-fade-in-up' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Subcomponentes
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({
  className = '',
  title,
  subtitle,
  action,
  icon,
  ...props
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`} {...props}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-surface-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-surface-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={`flex items-center gap-3 pt-4 mt-4 border-t border-surface-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Stat Card Component
export interface StatCardProps {
  icon: ReactNode;
  iconColor?: string;
  iconBg?: string;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ icon, iconColor, iconBg, value, label, trend }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg || 'bg-primary-600'}`}
        >
          <span className={iconColor || 'text-white'}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-black text-surface-900 font-numeric">{value}</p>
          <p className="text-sm font-medium text-surface-600 truncate">{label}</p>
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
            }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
}

export default Card;
