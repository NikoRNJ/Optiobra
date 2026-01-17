/**
 * OptiObra - Store de Compras
 * Gestión de estado para compras de materiales
 */

import { create } from 'zustand';
import type { Compra, EstadoCompra } from '@/types';
import { comprasRepo } from '@/database/db';

interface CompraState {
    // Estado
    compras: Compra[];
    compraActual: Compra | null;
    isLoading: boolean;
    error: string | null;

    // Filtros
    filtroEstado: EstadoCompra | 'todas';
    obraIdFiltro: string | null;

    // Acciones
    cargarCompras: (obraId?: string) => Promise<void>;
    cargarCompra: (id: string) => Promise<void>;
    crearCompra: (data: Omit<Compra, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    actualizarCompra: (id: string, data: Partial<Compra>) => Promise<void>;
    eliminarCompra: (id: string) => Promise<void>;
    cambiarEstado: (id: string, estado: EstadoCompra) => Promise<void>;
    setFiltroEstado: (estado: EstadoCompra | 'todas') => void;
    setObraIdFiltro: (obraId: string | null) => void;

    // Selectores
    comprasFiltradas: () => Compra[];
    totalCompras: () => number;
}

export const useCompraStore = create<CompraState>((set, get) => ({
    // Estado inicial
    compras: [],
    compraActual: null,
    isLoading: false,
    error: null,
    filtroEstado: 'todas',
    obraIdFiltro: null,

    // Cargar compras
    cargarCompras: async (obraId?: string) => {
        set({ isLoading: true, error: null });
        try {
            let compras: Compra[];
            if (obraId) {
                compras = await comprasRepo.getByObra(obraId);
            } else {
                const { db } = await import('@/database/db');
                compras = await db.compras.orderBy('fecha').reverse().toArray();
            }
            set({ compras, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar compras', isLoading: false });
            console.error('Error cargando compras:', error);
        }
    },

    // Cargar una compra específica
    cargarCompra: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const compra = await comprasRepo.getById(id);
            set({ compraActual: compra || null, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar compra', isLoading: false });
            console.error('Error cargando compra:', error);
        }
    },

    // Crear nueva compra
    crearCompra: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await comprasRepo.create(data);
            await get().cargarCompras(data.obraId);
            set({ isLoading: false });
            return id;
        } catch (error) {
            set({ error: 'Error al crear compra', isLoading: false });
            console.error('Error creando compra:', error);
            throw error;
        }
    },

    // Actualizar compra
    actualizarCompra: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await comprasRepo.update(id, data);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarCompras(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al actualizar compra', isLoading: false });
            console.error('Error actualizando compra:', error);
            throw error;
        }
    },

    // Eliminar compra
    eliminarCompra: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await comprasRepo.delete(id);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarCompras(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al eliminar compra', isLoading: false });
            console.error('Error eliminando compra:', error);
            throw error;
        }
    },

    // Cambiar estado de compra
    cambiarEstado: async (id, estado) => {
        await get().actualizarCompra(id, { estado });
    },

    // Setters
    setFiltroEstado: (filtroEstado) => set({ filtroEstado }),
    setObraIdFiltro: (obraIdFiltro) => set({ obraIdFiltro }),

    // Selector de compras filtradas
    comprasFiltradas: () => {
        const { compras, filtroEstado, obraIdFiltro } = get();

        return compras.filter((compra) => {
            if (obraIdFiltro && compra.obraId !== obraIdFiltro) return false;
            if (filtroEstado !== 'todas' && compra.estado !== filtroEstado) return false;
            return true;
        });
    },

    // Total de compras
    totalCompras: () => {
        const { compras } = get();
        return compras.reduce((sum, c) => sum + c.total, 0);
    },
}));
