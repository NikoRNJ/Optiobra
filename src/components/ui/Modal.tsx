/**
 * OptiObra - Componente Modal Premium
 * Ventana modal profesional optimizada para móviles
 */

import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ModalSize } from '@/types';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  variant?: 'default' | 'sheet' | 'fullscreen';
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  variant = 'default',
}: ModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  // Sheet variant (bottom sheet for mobile)
  if (variant === 'sheet') {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-fade-in"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Sheet Content */}
        <div
          className={`
            relative w-full max-w-lg
            bg-white rounded-t-3xl shadow-2xl
            animate-slide-up
            flex flex-col max-h-[90vh]
            safe-area-bottom
          `}
        >
          {/* Drag indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-surface-300" />
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-5 pb-3">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-lg font-bold text-surface-900">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="-mr-2 -mt-1"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-surface-400" />
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-2">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-surface-100">
              {footer}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // Fullscreen variant (for mobile forms)
  if (variant === 'fullscreen') {
    return createPortal(
      <div
        className="fixed inset-0 z-50 bg-white animate-fade-in flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-100 safe-area-top">
          <div className="flex items-center gap-3">
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="-ml-2"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            {title && (
              <h2 id="modal-title" className="text-lg font-bold text-surface-900">
                {title}
              </h2>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 py-4 border-t border-surface-100 safe-area-bottom">
            {footer}
          </div>
        )}
      </div>,
      document.body
    );
  }

  // Default centered modal
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeStyles[size]}
          bg-white rounded-2xl shadow-2xl
          animate-scale-in
          flex flex-col max-h-[90vh]
          border border-surface-100
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-surface-100">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-bold text-surface-900">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="-mr-2 -mt-1"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-surface-400" />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100 bg-surface-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
