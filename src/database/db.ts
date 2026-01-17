/**
 * OptiObra - Base de datos IndexedDB con Dexie
 * Almacenamiento offline-first para la aplicación
 */

import Dexie, { type Table } from 'dexie';
import type { 
  Obra, 
  Trabajador, 
  Material, 
  Compra, 
  Actividad, 
  Cubicacion 
} from '@/types';

// ============================================
// DEFINICIÓN DE LA BASE DE DATOS
// ============================================

class OptiObraDatabase extends Dexie {
  // Tablas tipadas
  obras!: Table<Obra, string>;
  trabajadores!: Table<Trabajador, string>;
  materiales!: Table<Material, string>;
  compras!: Table<Compra, string>;
  actividades!: Table<Actividad, string>;
  cubicaciones!: Table<Cubicacion, string>;

  constructor() {
    super('OptiObraDB');

    // Esquema de la base de datos
    // Los índices permiten búsquedas rápidas
    this.version(1).stores({
      obras: 'id, nombre, estado, fechaInicio, cliente, createdAt',
      trabajadores: 'id, obraId, nombreCompleto, labor, estado, fechaIngreso, createdAt',
      materiales: 'id, obraId, nombre, categoria, createdAt',
      compras: 'id, obraId, fecha, proveedor, createdAt',
      actividades: 'id, obraId, fecha, tipo, estado, createdAt',
      cubicaciones: 'id, obraId, tipo, nombre, createdAt',
    });
  }
}

// Instancia única de la base de datos
export const db = new OptiObraDatabase();

// ============================================
// FUNCIONES DE UTILIDAD PARA LA BD
// ============================================

/**
 * Genera un ID único
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Obtiene la fecha actual como string ISO
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Crea timestamps para nuevos registros
 */
export function createTimestamps() {
  const date = now();
  return {
    createdAt: date,
    updatedAt: date,
  };
}

/**
 * Actualiza el timestamp de modificación
 */
export function updateTimestamp() {
  return {
    updatedAt: now(),
  };
}

// ============================================
// REPOSITORIOS
// ============================================

// Repositorio de Obras
export const obrasRepo = {
  async getAll(): Promise<Obra[]> {
    return db.obras.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<Obra | undefined> {
    return db.obras.get(id);
  },

  async create(data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.obras.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Obra);
    return id;
  },

  async update(id: string, data: Partial<Obra>): Promise<void> {
    await db.obras.update(id, {
      ...data,
      ...updateTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    // Eliminar en cascada
    await db.transaction('rw', [db.obras, db.trabajadores, db.materiales, db.compras, db.actividades], async () => {
      await db.trabajadores.where('obraId').equals(id).delete();
      await db.materiales.where('obraId').equals(id).delete();
      await db.compras.where('obraId').equals(id).delete();
      await db.actividades.where('obraId').equals(id).delete();
      await db.obras.delete(id);
    });
  },

  async getByEstado(estado: Obra['estado']): Promise<Obra[]> {
    return db.obras.where('estado').equals(estado).toArray();
  },
};

// Repositorio de Trabajadores
export const trabajadoresRepo = {
  async getByObra(obraId: string): Promise<Trabajador[]> {
    return db.trabajadores
      .where('obraId')
      .equals(obraId)
      .reverse()
      .sortBy('createdAt');
  },

  async getById(id: string): Promise<Trabajador | undefined> {
    return db.trabajadores.get(id);
  },

  async create(data: Omit<Trabajador, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.trabajadores.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Trabajador);
    return id;
  },

  async update(id: string, data: Partial<Trabajador>): Promise<void> {
    await db.trabajadores.update(id, {
      ...data,
      ...updateTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.trabajadores.delete(id);
  },

  async getActivos(obraId: string): Promise<Trabajador[]> {
    return db.trabajadores
      .where(['obraId', 'estado'])
      .equals([obraId, 'activo'])
      .toArray();
  },

  async countByObra(obraId: string): Promise<number> {
    return db.trabajadores.where('obraId').equals(obraId).count();
  },
};

// Repositorio de Materiales
export const materialesRepo = {
  async getByObra(obraId: string): Promise<Material[]> {
    return db.materiales.where('obraId').equals(obraId).toArray();
  },

  async getById(id: string): Promise<Material | undefined> {
    return db.materiales.get(id);
  },

  async create(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.materiales.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Material);
    return id;
  },

  async update(id: string, data: Partial<Material>): Promise<void> {
    await db.materiales.update(id, {
      ...data,
      ...updateTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.materiales.delete(id);
  },
};

// Repositorio de Compras
export const comprasRepo = {
  async getByObra(obraId: string): Promise<Compra[]> {
    return db.compras
      .where('obraId')
      .equals(obraId)
      .reverse()
      .sortBy('fecha');
  },

  async getById(id: string): Promise<Compra | undefined> {
    return db.compras.get(id);
  },

  async create(data: Omit<Compra, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.compras.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Compra);
    return id;
  },

  async update(id: string, data: Partial<Compra>): Promise<void> {
    await db.compras.update(id, {
      ...data,
      ...updateTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.compras.delete(id);
  },

  async getTotalByObra(obraId: string): Promise<number> {
    const compras = await this.getByObra(obraId);
    return compras.reduce((sum, c) => sum + c.total, 0);
  },
};

// Repositorio de Actividades
export const actividadesRepo = {
  async getByObra(obraId: string): Promise<Actividad[]> {
    return db.actividades
      .where('obraId')
      .equals(obraId)
      .reverse()
      .sortBy('fecha');
  },

  async getById(id: string): Promise<Actividad | undefined> {
    return db.actividades.get(id);
  },

  async getByFecha(obraId: string, fecha: Date): Promise<Actividad[]> {
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    const startISO = startOfDay.toISOString();
    const endISO = endOfDay.toISOString();

    return db.actividades
      .where('obraId')
      .equals(obraId)
      .filter((a) => a.fecha >= startISO && a.fecha <= endISO)
      .toArray();
  },

  async create(data: Omit<Actividad, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.actividades.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Actividad);
    return id;
  },

  async update(id: string, data: Partial<Actividad>): Promise<void> {
    await db.actividades.update(id, {
      ...data,
      ...updateTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.actividades.delete(id);
  },

  async getPendientes(obraId: string): Promise<Actividad[]> {
    return db.actividades
      .where('obraId')
      .equals(obraId)
      .filter((a) => a.estado === 'pendiente' || a.estado === 'en_progreso')
      .toArray();
  },
};

// Repositorio de Cubicaciones
export const cubicacionesRepo = {
  async getAll(): Promise<Cubicacion[]> {
    return db.cubicaciones.orderBy('createdAt').reverse().toArray();
  },

  async getByObra(obraId: string): Promise<Cubicacion[]> {
    return db.cubicaciones.where('obraId').equals(obraId).toArray();
  },

  async getById(id: string): Promise<Cubicacion | undefined> {
    return db.cubicaciones.get(id);
  },

  async create(data: Omit<Cubicacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId();
    await db.cubicaciones.add({
      ...data,
      id,
      ...createTimestamps(),
    } as Cubicacion);
    return id;
  },

  async delete(id: string): Promise<void> {
    await db.cubicaciones.delete(id);
  },
};

// Export por defecto
export default db;
