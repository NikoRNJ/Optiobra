/**
 * OptiObra - Store de Horas Laborales (HLA)
 * Gestión de estado para registros de horas trabajadas
 */

import { create } from 'zustand';
import type { RegistroHora, TipoHora, ResumenHorasTrabajador } from '@/types';
import { registrosHoraRepo, trabajadoresRepo } from '@/database/db';

interface HoraState {
  // Estado
  registrosHora: RegistroHora[];
  registroActual: RegistroHora | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros
  filtroTipo: TipoHora | 'todos';
  filtroAprobado: boolean | 'todos';
  trabajadorId: string | null;
  busqueda: string;
  
  // Acciones
  cargarRegistros: (obraId: string) => Promise<void>;
  cargarRegistrosPorTrabajador: (trabajadorId: string) => Promise<void>;
  cargarRegistro: (id: string) => Promise<void>;
  crearRegistro: (data: Omit<RegistroHora, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  actualizarRegistro: (id: string, data: Partial<RegistroHora>) => Promise<void>;
  eliminarRegistro: (id: string) => Promise<void>;
  aprobarRegistro: (id: string, aprobadasPor: string) => Promise<void>;
  setRegistroActual: (registro: RegistroHora | null) => void;
  setFiltroTipo: (tipo: TipoHora | 'todos') => void;
  setFiltroAprobado: (aprobado: boolean | 'todos') => void;
  setTrabajadorId: (trabajadorId: string | null) => void;
  setBusqueda: (busqueda: string) => void;
  limpiarFiltros: () => void;
  
  // Selectores
  registrosFiltrados: () => RegistroHora[];
  calcularResumenPorTrabajador: (obraId: string) => Promise<ResumenHorasTrabajador[]>;
  getTotalHoras: () => number;
  getPendientesAprobacion: () => RegistroHora[];
}

export const useHoraStore = create<HoraState>((set, get) => ({
  // Estado inicial
  registrosHora: [],
  registroActual: null,
  isLoading: false,
  error: null,
  filtroTipo: 'todos',
  filtroAprobado: 'todos',
  trabajadorId: null,
  busqueda: '',

  // Cargar registros de una obra
  cargarRegistros: async (obraId: string) => {
    set({ isLoading: true, error: null });
    try {
      const registros = await registrosHoraRepo.getByObra(obraId);
      set({ registrosHora: registros, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar registros de horas', isLoading: false });
      console.error('Error cargando registros:', error);
    }
  },

  // Cargar registros de un trabajador
  cargarRegistrosPorTrabajador: async (trabajadorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const registros = await registrosHoraRepo.getByTrabajador(trabajadorId);
      set({ registrosHora: registros, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar registros del trabajador', isLoading: false });
      console.error('Error cargando registros:', error);
    }
  },

  // Cargar un registro específico
  cargarRegistro: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const registro = await registrosHoraRepo.getById(id);
      set({ registroActual: registro || null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar registro', isLoading: false });
      console.error('Error cargando registro:', error);
    }
  },

  // Crear registro
  crearRegistro: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const id = await registrosHoraRepo.create(data);
      // Recargar registros
      if (data.obraId) {
        await get().cargarRegistros(data.obraId);
      }
      set({ isLoading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear registro', isLoading: false });
      console.error('Error creando registro:', error);
      throw error;
    }
  },

  // Actualizar registro
  actualizarRegistro: async (id: string, data: Partial<RegistroHora>) => {
    set({ isLoading: true, error: null });
    try {
      await registrosHoraRepo.update(id, data);
      // Actualizar en el estado local
      const registros = get().registrosHora.map(r => 
        r.id === id ? { ...r, ...data } : r
      );
      set({ registrosHora: registros, isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar registro', isLoading: false });
      console.error('Error actualizando registro:', error);
      throw error;
    }
  },

  // Eliminar registro
  eliminarRegistro: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await registrosHoraRepo.delete(id);
      const registros = get().registrosHora.filter(r => r.id !== id);
      set({ registrosHora: registros, isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar registro', isLoading: false });
      console.error('Error eliminando registro:', error);
      throw error;
    }
  },

  // Aprobar registro
  aprobarRegistro: async (id: string, aprobadasPor: string) => {
    await get().actualizarRegistro(id, {
      aprobado: true,
      aprobadasPor,
      fechaAprobacion: new Date().toISOString(),
    });
  },

  // Setters
  setRegistroActual: (registro) => set({ registroActual: registro }),
  setFiltroTipo: (tipo) => set({ filtroTipo: tipo }),
  setFiltroAprobado: (aprobado) => set({ filtroAprobado: aprobado }),
  setTrabajadorId: (trabajadorId) => set({ trabajadorId }),
  setBusqueda: (busqueda) => set({ busqueda }),
  limpiarFiltros: () => set({ 
    filtroTipo: 'todos', 
    filtroAprobado: 'todos',
    trabajadorId: null,
    busqueda: '' 
  }),

  // Selectores
  registrosFiltrados: () => {
    const { registrosHora, filtroTipo, filtroAprobado, trabajadorId, busqueda } = get();
    
    return registrosHora.filter(registro => {
      // Filtro por tipo
      if (filtroTipo !== 'todos' && registro.tipo !== filtroTipo) {
        return false;
      }
      
      // Filtro por aprobado
      if (filtroAprobado !== 'todos' && registro.aprobado !== filtroAprobado) {
        return false;
      }
      
      // Filtro por trabajador
      if (trabajadorId && registro.trabajadorId !== trabajadorId) {
        return false;
      }
      
      // Búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        return (
          registro.descripcion?.toLowerCase().includes(searchLower) ||
          registro.observaciones?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  },

  // Calcular resumen por trabajador
  calcularResumenPorTrabajador: async (obraId: string) => {
    try {
      const registros = await registrosHoraRepo.getByObra(obraId);
      const trabajadores = await trabajadoresRepo.getByObra(obraId);
      
      const resumenMap = new Map<string, ResumenHorasTrabajador>();
      
      // Inicializar resumen para cada trabajador
      trabajadores.forEach(trabajador => {
        if (trabajador.id) {
          resumenMap.set(trabajador.id, {
            trabajadorId: trabajador.id,
            nombreTrabajador: trabajador.nombreCompleto,
            horasNormales: 0,
            horasExtra: 0,
            horasNocturnas: 0,
            horasFestivos: 0,
            horasTotales: 0,
          });
        }
      });
      
      // Acumular horas por tipo
      registros.forEach(registro => {
        const resumen = resumenMap.get(registro.trabajadorId);
        if (resumen) {
          switch (registro.tipo) {
            case 'normal':
              resumen.horasNormales += registro.horasTotales;
              break;
            case 'extra':
              resumen.horasExtra += registro.horasTotales;
              break;
            case 'nocturna':
              resumen.horasNocturnas += registro.horasTotales;
              break;
            case 'festivo':
              resumen.horasFestivos += registro.horasTotales;
              break;
          }
          resumen.horasTotales += registro.horasTotales;
        }
      });
      
      return Array.from(resumenMap.values()).filter(r => r.horasTotales > 0);
    } catch (error) {
      console.error('Error calculando resumen:', error);
      return [];
    }
  },

  // Calcular total de horas
  getTotalHoras: () => {
    const registros = get().registrosFiltrados();
    return registros.reduce((sum, r) => sum + r.horasTotales, 0);
  },

  // Obtener registros pendientes de aprobación
  getPendientesAprobacion: () => {
    const { registrosHora } = get();
    return registrosHora.filter(r => !r.aprobado);
  },
}));
