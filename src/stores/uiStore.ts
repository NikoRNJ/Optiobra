/**
 * OptiObra - Store de UI
 * Gestión de estado global de la interfaz
 */

import { create } from 'zustand';
import type { Toast, ConfirmDialog, ModalSize } from '@/types';
import { generateId } from '@/database/db';

interface UIState {
  // Navegación
  sidebarOpen: boolean;
  currentRoute: string;
  
  // Modales
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  modalTitle: string;
  modalSize: ModalSize;
  
  // Toasts/Notificaciones
  toasts: Toast[];
  
  // Diálogo de confirmación
  confirmDialog: ConfirmDialog;
  
  // Loading global
  globalLoading: boolean;
  loadingMessage: string;
  
  // Acciones de navegación
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  
  // Acciones de modal
  openModal: (content: React.ReactNode, title?: string, size?: ModalSize) => void;
  closeModal: () => void;
  
  // Acciones de toast
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Acciones de confirmación
  showConfirm: (options: Omit<ConfirmDialog, 'isOpen'>) => void;
  hideConfirm: () => void;
  
  // Acciones de loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

const DEFAULT_TOAST_DURATION = 4000;

export const useUIStore = create<UIState>((set, get) => ({
  // Estado inicial
  sidebarOpen: false,
  currentRoute: '/',
  modalOpen: false,
  modalContent: null,
  modalTitle: '',
  modalSize: 'md',
  toasts: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },
  globalLoading: false,
  loadingMessage: '',

  // Navegación
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentRoute: (route) => set({ currentRoute: route }),

  // Modal
  openModal: (content, title = '', size = 'md') => {
    set({
      modalOpen: true,
      modalContent: content,
      modalTitle: title,
      modalSize: size,
    });
  },

  closeModal: () => {
    set({
      modalOpen: false,
      modalContent: null,
      modalTitle: '',
    });
  },

  // Toasts
  showToast: (type, message, duration = DEFAULT_TOAST_DURATION) => {
    const id = generateId();
    const toast: Toast = { id, type, message, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remover después de la duración
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),

  // Confirmación
  showConfirm: (options) => {
    set({
      confirmDialog: {
        ...options,
        isOpen: true,
      },
    });
  },

  hideConfirm: () => {
    set((state) => ({
      confirmDialog: {
        ...state.confirmDialog,
        isOpen: false,
      },
    }));
  },

  // Loading global
  setGlobalLoading: (loading, message = 'Cargando...') => {
    set({
      globalLoading: loading,
      loadingMessage: loading ? message : '',
    });
  },
}));

// Helpers para usar fuera de componentes
export const toast = {
  success: (message: string, duration?: number) => 
    useUIStore.getState().showToast('success', message, duration),
  error: (message: string, duration?: number) => 
    useUIStore.getState().showToast('error', message, duration),
  warning: (message: string, duration?: number) => 
    useUIStore.getState().showToast('warning', message, duration),
  info: (message: string, duration?: number) => 
    useUIStore.getState().showToast('info', message, duration),
};
