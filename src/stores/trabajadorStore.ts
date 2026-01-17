/**
 * OptiObra - Store de Trabajadores
 * Gestión de estado para trabajadores de obra
 */

import { create } from 'zustand';
import type { Trabajador, LaborTrabajador, EstadoTrabajador } from '@/types';
import { trabajadoresRepo } from '@/database/db';

interface TrabajadorState {
  // Estado
  trabajadores: Trabajador[];
  trabajadorActual: Trabajador | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros
  filtroLabor: LaborTrabajador | 'todas';
  filtroEstado: EstadoTrabajador | 'todos';
  busqueda: string;
  
  // Acciones
  cargarTrabajadores: (obraId: string) => Promise<void>;
  cargarTrabajador: (id: string) => Promise<void>;
  crearTrabajador: (data: Omit<Trabajador, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  actualizarTrabajador: (id: string, data: Partial<Trabajador>) => Promise<void>;
  eliminarTrabajador: (id: string) => Promise<void>;
  darDeBaja: (id: string, fechaSalida?: Date) => Promise<void>;
  setTrabajadorActual: (trabajador: Trabajador | null) => void;
  setFiltroLabor: (labor: LaborTrabajador | 'todas') => void;
  setFiltroEstado: (estado: EstadoTrabajador | 'todos') => void;
  setBusqueda: (busqueda: string) => void;
  limpiarFiltros: () => void;
  
  // Selectores
  trabajadoresFiltrados: () => Trabajador[];
  contarActivos: () => number;
  contarPorLabor: () => Record<LaborTrabajador, number>;
}

export const useTrabajadorStore = create<TrabajadorState>((set, get) => ({
  // Estado inicial
  trabajadores: [],
  trabajadorActual: null,
  isLoading: false,
  error: null,
  filtroLabor: 'todas',
  filtroEstado: 'todos',
  busqueda: '',

  // Cargar trabajadores de una obra
  cargarTrabajadores: async (obraId: string) => {
    set({ isLoading: true, error: null });
    try {
      const trabajadores = await trabajadoresRepo.getByObra(obraId);
      set({ trabajadores, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar trabajadores', isLoading: false });
      console.error('Error cargando trabajadores:', error);
    }
  },

  // Cargar un trabajador específico
  cargarTrabajador: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const trabajador = await trabajadoresRepo.getById(id);
      set({ trabajadorActual: trabajador || null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar trabajador', isLoading: false });
      console.error('Error cargando trabajador:', error);
    }
  },

  // Crear nuevo trabajador
  crearTrabajador: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const id = await trabajadoresRepo.create(data);
      // Recargar lista de trabajadores
      await get().cargarTrabajadores(data.obraId);
      set({ isLoading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear trabajador', isLoading: false });
      console.error('Error creando trabajador:', error);
      throw error;
    }
  },

  // Actualizar trabajador
  actualizarTrabajador: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await trabajadoresRepo.update(id, data);
      // Obtener obraId del trabajador actual para recargar
      const trabajador = get().trabajadores.find(t => t.id === id);
      if (trabajador) {
        await get().cargarTrabajadores(trabajador.obraId);
      }
      // Actualizar trabajador actual si es el mismo
      if (get().trabajadorActual?.id === id) {
        await get().cargarTrabajador(id);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar trabajador', isLoading: false });
      console.error('Error actualizando trabajador:', error);
      throw error;
    }
  },

  // Eliminar trabajador
  eliminarTrabajador: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const trabajador = get().trabajadores.find(t => t.id === id);
      await trabajadoresRepo.delete(id);
      if (trabajador) {
        await get().cargarTrabajadores(trabajador.obraId);
      }
      if (get().trabajadorActual?.id === id) {
        set({ trabajadorActual: null });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar trabajador', isLoading: false });
      console.error('Error eliminando trabajador:', error);
      throw error;
    }
  },

  // Dar de baja (cambiar estado a finalizado)
  darDeBaja: async (id, fechaSalida = new Date()) => {
    await get().actualizarTrabajador(id, {
      estado: 'finalizado',
      fechaSalida: fechaSalida.toISOString(),
    });
  },

  // Setters
  setTrabajadorActual: (trabajador) => set({ trabajadorActual: trabajador }),
  setFiltroLabor: (filtroLabor) => set({ filtroLabor }),
  setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
  setBusqueda: (busqueda) => set({ busqueda }),
  
  limpiarFiltros: () => set({
    filtroLabor: 'todas',
    filtroEstado: 'todos',
    busqueda: '',
  }),

  // Selector de trabajadores filtrados
  trabajadoresFiltrados: () => {
    const { trabajadores, filtroLabor, filtroEstado, busqueda } = get();
    
    return trabajadores.filter((t) => {
      // Filtro por labor
      if (filtroLabor !== 'todas' && t.labor !== filtroLabor) {
        return false;
      }
      
      // Filtro por estado
      if (filtroEstado !== 'todos' && t.estado !== filtroEstado) {
        return false;
      }
      
      // Filtro por búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        return (
          t.nombreCompleto.toLowerCase().includes(searchLower) ||
          t.rut?.toLowerCase().includes(searchLower) ||
          t.telefono?.includes(searchLower)
        );
      }
      
      return true;
    });
  },

  // Contar trabajadores activos
  contarActivos: () => {
    return get().trabajadores.filter(t => t.estado === 'activo').length;
  },

  // Contar trabajadores por labor
  contarPorLabor: () => {
    const conteo = {} as Record<LaborTrabajador, number>;
    get().trabajadores.forEach((t) => {
      if (t.estado === 'activo') {
        conteo[t.labor] = (conteo[t.labor] || 0) + 1;
      }
    });
    return conteo;
  },
}));
