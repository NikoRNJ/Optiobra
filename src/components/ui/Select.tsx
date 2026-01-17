/**
 * OptiObra - Componente Select Premium
 * Selector profesional con diseño moderno
 */

import { forwardRef, type SelectHTMLAttributes, useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      options,
      placeholder = 'Seleccionar...',
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).slice(2);
    const hasError = !!error;
    const [isFocused, setIsFocused] = useState(false);

    const variantStyles = {
      default: `
        bg-white border-2
        ${hasError
          ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
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
          : 'focus:border-primary-400 hover:bg-surface-50'
        }
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-12 px-4 py-3 pr-11
              rounded-xl
              text-surface-900
              appearance-none cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-primary-500/10
              disabled:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60
              ${variantStyles[variant]}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className={`
            absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none
            transition-colors
            ${isFocused ? 'text-primary-500' : 'text-surface-400'}
            ${hasError ? 'text-error-400' : ''}
          `}>
            <ChevronDown className={`
              h-5 w-5 transition-transform duration-200
              ${isFocused ? 'rotate-180' : ''}
            `} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-2 text-sm text-error-600 flex items-center gap-1.5 animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-2 text-sm text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
