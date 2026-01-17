/**
 * OptiObra - Componente Textarea
 * Campo de texto multilínea
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name || Math.random().toString(36).slice(2);
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-3 py-2
            bg-white border rounded-lg
            text-surface-900 placeholder:text-surface-400
            transition-colors duration-200
            resize-y min-h-[80px]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-surface-100 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
              : 'border-surface-300 hover:border-surface-400'
            }
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-error-500">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
