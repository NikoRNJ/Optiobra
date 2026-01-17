/**
 * OptiObra - Componente Input Premium
 * Campo de entrada profesional con diseño moderno
 */

import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      success,
      leftIcon,
      rightIcon,
      rightElement,
      variant = 'default',
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2);
    const hasError = !!error;
    const [isFocused, setIsFocused] = useState(false);

    const variantStyles = {
      default: `
        bg-white border-2
        ${hasError
          ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
          : success
            ? 'border-success-300 focus:border-success-500 focus:ring-success-500/20'
            : isFocused
              ? 'border-primary-400'
              : 'border-surface-200 hover:border-surface-300'
        }
      `,
      filled: `
        bg-surface-100 border-2 border-transparent
        focus:bg-white
        ${hasError
          ? 'border-error-500 bg-error-50'
          : success
            ? 'border-success-500 bg-success-50'
            : 'focus:border-primary-400 hover:bg-surface-50'
        }
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block text-sm font-medium mb-1.5 transition-colors
              ${hasError ? 'text-error-600' : 'text-surface-700'}
            `}
          >
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className={`
              absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none
              transition-colors
              ${isFocused ? 'text-primary-500' : 'text-surface-400'}
              ${hasError ? 'text-error-400' : ''}
            `}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full h-12 px-4 py-3
              rounded-xl
              text-surface-900 placeholder:text-surface-400
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-primary-500/10
              disabled:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon || rightElement || hasError || success ? 'pr-11' : ''}
              ${variantStyles[variant]}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right side content */}
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1">
            {hasError && (
              <AlertCircle className="w-5 h-5 text-error-500" />
            )}
            {success && !hasError && (
              <CheckCircle className="w-5 h-5 text-success-500" />
            )}
            {(rightIcon || rightElement) && !hasError && !success && (
              <span className="text-surface-400">{rightIcon || rightElement}</span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-error-600 flex items-center gap-1.5 animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
