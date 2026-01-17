/**
 * OptiObra - Componente Toast Premium
 * Notificaciones flotantes profesionales
 */

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { Toast as ToastData, ToastType } from '@/types';
import { useUIStore } from '@/stores';

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-200',
  error: 'bg-error-50 border-error-200',
  warning: 'bg-warning-50 border-warning-200',
  info: 'bg-info-50 border-info-200',
};

const iconContainerStyles: Record<ToastType, string> = {
  success: 'bg-success-100',
  error: 'bg-error-100',
  warning: 'bg-warning-100',
  info: 'bg-info-100',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-success-600',
  error: 'text-error-600',
  warning: 'text-warning-600',
  info: 'text-info-600',
};

const textStyles: Record<ToastType, string> = {
  success: 'text-success-800',
  error: 'text-error-800',
  warning: 'text-warning-800',
  info: 'text-info-800',
};

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
}

export function Toast({ id, type, message }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const removeToast = useUIStore((s) => s.removeToast);
  const Icon = icons[type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(id), 200);
  };

  // Auto-dismiss with progress bar
  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          handleClose();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-start gap-3 p-4
        border rounded-2xl shadow-lg
        backdrop-blur-sm
        transition-all duration-200
        ${styles[type]}
        ${isExiting ? 'opacity-0 translate-x-4 scale-95' : 'animate-slide-in-right'}
      `}
      role="alert"
    >
      {/* Icon container */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconContainerStyles[type]}`}>
        <Icon className={`h-5 w-5 ${iconStyles[type]}`} />
      </div>

      {/* Message */}
      <div className="flex-1 pt-1">
        <p className={`text-sm font-semibold ${textStyles[type]}`}>{message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          hover:bg-black/5 transition-colors press-effect
          ${textStyles[type]}
        `}
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div
          className={`h-full transition-all duration-50 ease-linear ${iconStyles[type].replace('text-', 'bg-')}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastData }) {
  return <Toast id={toast.id} type={toast.type} message={toast.message} />;
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:max-w-sm w-auto sm:w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;
