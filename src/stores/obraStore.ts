/**
 * OptiObra - Store de Obras
 * Gestión de estado para obras/proyectos
 */

import { create } from 'zustand';
import type { Obra, EstadoObra } from '@/types';
import { obrasRepo } from '@/database/db';

interface ObraState {
  // Estado
  obras: Obra[];
  obraActual: Obra | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros
  filtroEstado: EstadoObra | 'todas';
  busqueda: string;
  
  // Acciones
  cargarObras: () => Promise<void>;
  cargarObra: (id: string) => Promise<void>;
  crearObra: (data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  actualizarObra: (id: string, data: Partial<Obra>) => Promise<void>;
  eliminarObra: (id: string) => Promise<void>;
  setObraActual: (obra: Obra | null) => void;
  setFiltroEstado: (estado: EstadoObra | 'todas') => void;
  setBusqueda: (busqueda: string) => void;
  
  // Selectores computados
  obrasFiltradas: () => Obra[];
}

export const useObraStore = create<ObraState>((set, get) => ({
  // Estado inicial
  obras: [],
  obraActual: null,
  isLoading: false,
  error: null,
  filtroEstado: 'todas',
  busqueda: '',

  // Cargar todas las obras
  cargarObras: async () => {
    set({ isLoading: true, error: null });
    try {
      const obras = await obrasRepo.getAll();
      set({ obras, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar obras', isLoading: false });
      console.error('Error cargando obras:', error);
    }
  },

  // Cargar una obra específica
  cargarObra: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const obra = await obrasRepo.getById(id);
      set({ obraActual: obra || null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar obra', isLoading: false });
      console.error('Error cargando obra:', error);
    }
  },

  // Crear nueva obra
  crearObra: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const id = await obrasRepo.create(data);
      await get().cargarObras();
      set({ isLoading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear obra', isLoading: false });
      console.error('Error creando obra:', error);
      throw error;
    }
  },

  // Actualizar obra
  actualizarObra: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await obrasRepo.update(id, data);
      await get().cargarObras();
      // Actualizar obra actual si es la misma
      if (get().obraActual?.id === id) {
        await get().cargarObra(id);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar obra', isLoading: false });
      console.error('Error actualizando obra:', error);
      throw error;
    }
  },

  // Eliminar obra
  eliminarObra: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await obrasRepo.delete(id);
      await get().cargarObras();
      if (get().obraActual?.id === id) {
        set({ obraActual: null });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar obra', isLoading: false });
      console.error('Error eliminando obra:', error);
      throw error;
    }
  },

  // Setters
  setObraActual: (obra) => set({ obraActual: obra }),
  setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
  setBusqueda: (busqueda) => set({ busqueda }),

  // Selector de obras filtradas
  obrasFiltradas: () => {
    const { obras, filtroEstado, busqueda } = get();
    
    return obras.filter((obra) => {
      // Filtro por estado
      if (filtroEstado !== 'todas' && obra.estado !== filtroEstado) {
        return false;
      }
      
      // Filtro por búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        return (
          obra.nombre.toLowerCase().includes(searchLower) ||
          obra.cliente.toLowerCase().includes(searchLower) ||
          obra.direccion.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  },
}));
