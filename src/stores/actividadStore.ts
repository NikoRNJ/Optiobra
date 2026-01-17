/**
 * OptiObra - Store de Actividades
 * Gestión de estado para actividades/tareas
 */

import { create } from 'zustand';
import type { Actividad, EstadoActividad, TipoActividad } from '@/types';
import { actividadesRepo } from '@/database/db';

interface ActividadState {
    // Estado
    actividades: Actividad[];
    actividadActual: Actividad | null;
    isLoading: boolean;
    error: string | null;

    // Filtros
    filtroEstado: EstadoActividad | 'todas';
    filtroTipo: TipoActividad | 'todas';
    obraIdFiltro: string | null;

    // Acciones
    cargarActividades: (obraId?: string) => Promise<void>;
    cargarActividad: (id: string) => Promise<void>;
    crearActividad: (data: Omit<Actividad, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    actualizarActividad: (id: string, data: Partial<Actividad>) => Promise<void>;
    eliminarActividad: (id: string) => Promise<void>;
    cambiarEstado: (id: string, estado: EstadoActividad) => Promise<void>;
    setFiltroEstado: (estado: EstadoActividad | 'todas') => void;
    setFiltroTipo: (tipo: TipoActividad | 'todas') => void;
    setObraIdFiltro: (obraId: string | null) => void;

    // Selectores
    actividadesFiltradas: () => Actividad[];
    actividadesPendientes: () => Actividad[];
}

export const useActividadStore = create<ActividadState>((set, get) => ({
    // Estado inicial
    actividades: [],
    actividadActual: null,
    isLoading: false,
    error: null,
    filtroEstado: 'todas',
    filtroTipo: 'todas',
    obraIdFiltro: null,

    // Cargar actividades
    cargarActividades: async (obraId?: string) => {
        set({ isLoading: true, error: null });
        try {
            let actividades: Actividad[];
            if (obraId) {
                actividades = await actividadesRepo.getByObra(obraId);
            } else {
                // Cargar todas las actividades de todas las obras
                const { db } = await import('@/database/db');
                actividades = await db.actividades.orderBy('fecha').reverse().toArray();
            }
            set({ actividades, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar actividades', isLoading: false });
            console.error('Error cargando actividades:', error);
        }
    },

    // Cargar una actividad específica
    cargarActividad: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const actividad = await actividadesRepo.getById(id);
            set({ actividadActual: actividad || null, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar actividad', isLoading: false });
            console.error('Error cargando actividad:', error);
        }
    },

    // Crear nueva actividad
    crearActividad: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await actividadesRepo.create(data);
            await get().cargarActividades(data.obraId);
            set({ isLoading: false });
            return id;
        } catch (error) {
            set({ error: 'Error al crear actividad', isLoading: false });
            console.error('Error creando actividad:', error);
            throw error;
        }
    },

    // Actualizar actividad
    actualizarActividad: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await actividadesRepo.update(id, data);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarActividades(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al actualizar actividad', isLoading: false });
            console.error('Error actualizando actividad:', error);
            throw error;
        }
    },

    // Eliminar actividad
    eliminarActividad: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await actividadesRepo.delete(id);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarActividades(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al eliminar actividad', isLoading: false });
            console.error('Error eliminando actividad:', error);
            throw error;
        }
    },

    // Cambiar estado de actividad
    cambiarEstado: async (id, estado) => {
        await get().actualizarActividad(id, { estado });
    },

    // Setters
    setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
    setFiltroTipo: (filtroTipo) => set({ filtroTipo }),
    setObraIdFiltro: (obraIdFiltro) => set({ obraIdFiltro }),

    // Selector de actividades filtradas
    actividadesFiltradas: () => {
        const { actividades, filtroEstado, filtroTipo, obraIdFiltro } = get();

        return actividades.filter((actividad) => {
            if (obraIdFiltro && actividad.obraId !== obraIdFiltro) return false;
            if (filtroEstado !== 'todas' && actividad.estado !== filtroEstado) return false;
            if (filtroTipo !== 'todas' && actividad.tipo !== filtroTipo) return false;
            return true;
        });
    },

    // Selector de actividades pendientes
    actividadesPendientes: () => {
        const { actividades } = get();
        return actividades.filter(
            (a) => a.estado === 'pendiente' || a.estado === 'en_progreso'
        );
    },
}));
