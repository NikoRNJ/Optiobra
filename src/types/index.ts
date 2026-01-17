/**
 * OptiObra - Sistema CMR Construcción Chile
 * Tipos globales de la aplicación
 */

// ============================================
// TIPOS BASE
// ============================================

/** Identificador único */
export type ID = string;

/** Timestamps comunes */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/** Coordenadas GPS */
export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

// ============================================
// OBRA
// ============================================

export type EstadoObra = 'planificacion' | 'en_progreso' | 'pausada' | 'finalizada';

export interface Obra extends Timestamps {
  id?: ID;
  nombre: string;
  direccion: string;
  cliente: string;
  telefono?: string;
  fechaInicio: string;
  fechaEstimadaFin?: string;
  estado: EstadoObra;
  presupuesto?: number;
  descripcion?: string;
  ubicacionGPS?: GPSLocation;
  imagenPortada?: string;
}

// ============================================
// TRABAJADOR
// ============================================

export type LaborTrabajador =
  | 'jornal'
  | 'maestro_primera'
  | 'maestro_segunda'
  | 'carpintero'
  | 'fierrero'
  | 'concretero'
  | 'albanil'
  | 'estucador'
  | 'ceramista'
  | 'pintor'
  | 'electrico'
  | 'gasfiter'
  | 'soldador'
  | 'operador_maquinaria'
  | 'ayudante'
  | 'capataz'
  | 'supervisor'
  | 'bodeguero'
  | 'junior'
  | 'otro';

export const LABORES_TRABAJADOR: Record<LaborTrabajador, string> = {
  jornal: 'Jornal',
  maestro_primera: 'Maestro de Primera',
  maestro_segunda: 'Maestro de Segunda',
  carpintero: 'Carpintero',
  fierrero: 'Fierrero/Armador',
  concretero: 'Concretero',
  albanil: 'Albañil',
  estucador: 'Estucador',
  ceramista: 'Ceramista',
  pintor: 'Pintor',
  electrico: 'Eléctrico',
  gasfiter: 'Gasfíter',
  soldador: 'Soldador',
  operador_maquinaria: 'Operador Maquinaria',
  ayudante: 'Ayudante',
  capataz: 'Capataz',
  supervisor: 'Supervisor',
  bodeguero: 'Bodeguero',
  junior: 'Junior',
  otro: 'Otro',
};

export type EstadoTrabajador = 'activo' | 'inactivo' | 'finalizado';

export interface Trabajador extends Timestamps {
  id?: ID;
  obraId: ID;
  nombreCompleto: string;
  rut?: string;
  labor: LaborTrabajador;
  laborPersonalizada?: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: EstadoTrabajador;
  fotoContrato?: string;
  telefono?: string;
  contactoEmergencia?: string;
  observaciones?: string;
}

// ============================================
// MATERIALES E INVENTARIO
// ============================================

export type UnidadMedida =
  | 'unidad' | 'kg' | 'ton'
  | 'm' | 'm2' | 'm3'
  | 'lt' | 'saco' | 'bolsa'
  | 'rollo' | 'plancha' | 'caja';

export interface Material extends Timestamps {
  id?: ID;
  obraId: ID;
  nombre: string;
  categoria: string;
  unidad: UnidadMedida;
  cantidadRequerida: number;
  cantidadUtilizada: number;
  cantidadEnStock: number;
  precioUnitario?: number;
  proveedor?: string;
}

export interface ItemCompra {
  materialId?: ID;
  descripcion: string;
  cantidad: number;
  unidad: UnidadMedida;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoCompra = 'pendiente' | 'pagada' | 'entregada' | 'cancelada';

export interface Compra extends Timestamps {
  id?: ID;
  obraId: ID;
  fecha: string;
  proveedor: string;
  numeroFactura?: string;
  items: ItemCompra[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
  comprobanteImagen?: string;
  estado: EstadoCompra;
  notas?: string;
}

// ============================================
// ACTIVIDADES
// ============================================

export type TipoActividad = 'diaria' | 'semanal' | 'tarea' | 'inspeccion' | 'entrega' | 'reunion' | 'otro';
export type EstadoActividad = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
export type PrioridadActividad = 'alta' | 'media' | 'baja';

export interface MultimediaItem {
  id: ID;
  tipo: 'imagen' | 'video';
  url: string;
  thumbnail?: string;
  nombre?: string;
  descripcion?: string;
  fechaCaptura: string;
  gps?: GPSLocation;
}

/** Registro de avance diario para actividades largas */
export interface AvanceActividad {
  id: ID;
  fecha: string;
  descripcion: string;
  porcentajeAvance?: number;
  multimedia: MultimediaItem[];
  createdAt: string;
}

export interface Actividad extends Timestamps {
  id?: ID;
  obraId: ID;

  // Fechas
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;

  // Información básica
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  estado: EstadoActividad;
  prioridad?: PrioridadActividad;

  // Duración calculada
  duracionDias: number;
  esActividadLarga: boolean; // > 7 días

  // Notificaciones
  notificado3Dias?: boolean;

  // Relaciones
  trabajadorIds?: ID[];
  multimedia: MultimediaItem[];

  // Historial de avances (para actividades largas)
  avances: AvanceActividad[];

  // Ubicación
  ubicacionGPS?: GPSLocation;

  // Campo legacy para compatibilidad
  fecha: string;
}

// ============================================
// CUBICACIONES
// ============================================

export type TipoCubicacion =
  | 'terreno'
  | 'zapata'
  | 'radier'
  | 'muro'
  | 'losa'
  | 'pilar'
  | 'viga'
  | 'cadena'
  | 'sobrecimiento';

export type GradoHormigon = 'H20' | 'H25' | 'H30' | 'H35' | 'H40';

export interface MaterialCubicacion {
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface ResultadoCubicacion {
  tipo: TipoCubicacion;
  superficie?: number;
  volumen?: number;
  materiales: MaterialCubicacion[];
}

export interface Cubicacion extends Timestamps {
  id?: ID;
  obraId?: ID;
  tipo: TipoCubicacion;
  nombre: string;
  parametros: Record<string, number>;
  resultado: ResultadoCubicacion;
}

// ============================================
// UI TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: ID;
  type: ToastType;
  message: string;
  duration?: number;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
