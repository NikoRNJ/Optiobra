/**
 * OptiObra - Store de Materiales
 * Gestión de estado para inventario de materiales
 */

import { create } from 'zustand';
import type { Material } from '@/types';
import { materialesRepo } from '@/database/db';

interface MaterialState {
    // Estado
    materiales: Material[];
    materialActual: Material | null;
    isLoading: boolean;
    error: string | null;

    // Filtros
    obraIdFiltro: string | null;
    categoriaFiltro: string | null;
    busqueda: string;

    // Acciones
    cargarMateriales: (obraId?: string) => Promise<void>;
    cargarMaterial: (id: string) => Promise<void>;
    crearMaterial: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    actualizarMaterial: (id: string, data: Partial<Material>) => Promise<void>;
    eliminarMaterial: (id: string) => Promise<void>;
    actualizarStock: (id: string, cantidad: number, tipo: 'agregar' | 'usar') => Promise<void>;
    setObraIdFiltro: (obraId: string | null) => void;
    setCategoriaFiltro: (categoria: string | null) => void;
    setBusqueda: (busqueda: string) => void;

    // Selectores
    materialesFiltrados: () => Material[];
    categorias: () => string[];
    materialesBajoStock: () => Material[];
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
    // Estado inicial
    materiales: [],
    materialActual: null,
    isLoading: false,
    error: null,
    obraIdFiltro: null,
    categoriaFiltro: null,
    busqueda: '',

    // Cargar materiales
    cargarMateriales: async (obraId?: string) => {
        set({ isLoading: true, error: null });
        try {
            let materiales: Material[];
            if (obraId) {
                materiales = await materialesRepo.getByObra(obraId);
            } else {
                const { db } = await import('@/database/db');
                materiales = await db.materiales.orderBy('nombre').toArray();
            }
            set({ materiales, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar materiales', isLoading: false });
            console.error('Error cargando materiales:', error);
        }
    },

    // Cargar un material específico
    cargarMaterial: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const material = await materialesRepo.getById(id);
            set({ materialActual: material || null, isLoading: false });
        } catch (error) {
            set({ error: 'Error al cargar material', isLoading: false });
            console.error('Error cargando material:', error);
        }
    },

    // Crear nuevo material
    crearMaterial: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await materialesRepo.create(data);
            await get().cargarMateriales(data.obraId);
            set({ isLoading: false });
            return id;
        } catch (error) {
            set({ error: 'Error al crear material', isLoading: false });
            console.error('Error creando material:', error);
            throw error;
        }
    },

    // Actualizar material
    actualizarMaterial: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await materialesRepo.update(id, data);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarMateriales(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al actualizar material', isLoading: false });
            console.error('Error actualizando material:', error);
            throw error;
        }
    },

    // Eliminar material
    eliminarMaterial: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await materialesRepo.delete(id);
            const obraId = get().obraIdFiltro;
            if (obraId) {
                await get().cargarMateriales(obraId);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Error al eliminar material', isLoading: false });
            console.error('Error eliminando material:', error);
            throw error;
        }
    },

    // Actualizar stock
    actualizarStock: async (id, cantidad, tipo) => {
        const material = await materialesRepo.getById(id);
        if (!material) throw new Error('Material no encontrado');

        let nuevoStock = material.cantidadEnStock;
        let nuevaUtilizada = material.cantidadUtilizada;

        if (tipo === 'agregar') {
            nuevoStock += cantidad;
        } else {
            nuevoStock -= cantidad;
            nuevaUtilizada += cantidad;
        }

        await get().actualizarMaterial(id, {
            cantidadEnStock: Math.max(0, nuevoStock),
            cantidadUtilizada: nuevaUtilizada,
        });
    },

    // Setters
    setObraIdFiltro: (obraIdFiltro) => set({ obraIdFiltro }),
    setCategoriaFiltro: (categoriaFiltro) => set({ categoriaFiltro }),
    setBusqueda: (busqueda) => set({ busqueda }),

    // Selector de materiales filtrados
    materialesFiltrados: () => {
        const { materiales, categoriaFiltro, busqueda } = get();

        return materiales.filter((material) => {
            if (categoriaFiltro && material.categoria !== categoriaFiltro) return false;
            if (busqueda) {
                const searchLower = busqueda.toLowerCase();
                return material.nombre.toLowerCase().includes(searchLower);
            }
            return true;
        });
    },

    // Obtener categorías únicas
    categorias: () => {
        const { materiales } = get();
        const cats = [...new Set(materiales.map((m) => m.categoria))];
        return cats.sort();
    },

    // Materiales con bajo stock
    materialesBajoStock: () => {
        const { materiales } = get();
        return materiales.filter(
            (m) => m.cantidadEnStock < m.cantidadRequerida * 0.2
        );
    },
}));
