/**
 * OptiObra - Componente Button
 * Botón profesional industrial para supervisores
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: `
    bg-primary-600 hover:bg-primary-700 active:bg-primary-800
    text-white shadow-md
  `,
  secondary: `
    bg-surface-800 hover:bg-surface-900 active:bg-surface-950
    text-white shadow-md
  `,
  accent: `
    bg-accent-600 hover:bg-accent-700 active:bg-accent-800
    text-white shadow-md
  `,
  outline: `
    border-2 border-surface-300 hover:border-surface-400 
    hover:bg-surface-50 active:bg-surface-100
    text-surface-700
  `,
  ghost: `
    hover:bg-surface-100 active:bg-surface-200
    text-surface-700
  `,
  danger: `
    bg-error-600 hover:bg-error-700 active:bg-error-800
    text-white shadow-md
  `,
  success: `
    bg-success-600 hover:bg-success-700 active:bg-success-800
    text-white shadow-md
  `,
};

const sizeStyles = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-10 px-4 text-sm gap-2 rounded-lg',
  md: 'h-12 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-14 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-12 w-12 p-0 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-bold
          transition-all duration-150
          press-effect
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {size !== 'icon' && children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
