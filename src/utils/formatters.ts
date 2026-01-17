/**
 * OptiObra - Funciones de Formateo
 * Utilidades para formatear datos en la UI
 */

import { format, formatDistance, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { UNIDADES_MEDIDA } from './constants';
import type { EstadoObra, EstadoTrabajador, EstadoActividad, EstadoCompra } from '@/types';

// ============================================
// FORMATEO DE FECHAS
// ============================================

/**
 * Formatea una fecha al formato chileno DD/MM/YYYY
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatea una fecha con hora DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Formatea una fecha de forma relativa ("hace 2 días")
 */
export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return formatDistance(d, new Date(), { addSuffix: true, locale: es });
}

/**
 * Formatea solo el día y mes ("15 Ene")
 */
export function formatShortDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'd MMM', { locale: es });
}

/**
 * Formatea el nombre del día ("Lunes 15")
 */
export function formatDayName(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, "EEEE d", { locale: es });
}

// ============================================
// FORMATEO DE NÚMEROS
// ============================================

/**
 * Formatea un número con separadores de miles (formato chileno)
 * Ej: 1234567 -> "1.234.567"
 */
export function formatNumber(value: number | undefined, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un número como moneda chilena
 * Ej: 1234567 -> "$1.234.567"
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return value.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formatea un número con su unidad de medida
 * Ej: (1.5, 'm3') -> "1,5 m³"
 */
export function formatWithUnit(value: number | undefined, unit: string): string {
  if (value === undefined || value === null || isNaN(value)) return '-';
  const unitInfo = UNIDADES_MEDIDA[unit as keyof typeof UNIDADES_MEDIDA];
  const decimals = unit === 'm3' || unit === 'm2' ? 2 : unit === 'kg' || unit === 'lt' ? 1 : 0;
  return `${formatNumber(value, decimals)} ${unitInfo?.simbolo || unit}`;
}

/**
 * Formatea un porcentaje
 * Ej: 0.75 -> "75%"
 */
export function formatPercent(value: number | undefined, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return `${formatNumber(value * 100, decimals)}%`;
}

// ============================================
// FORMATEO DE RUT CHILENO
// ============================================

/**
 * Formatea un RUT chileno
 * Ej: "12345678k" -> "12.345.678-K"
 */
export function formatRut(rut: string | undefined): string {
  if (!rut) return '-';
  
  // Limpiar el RUT
  let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length < 2) return clean;
  
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  
  // Agregar puntos
  let formatted = '';
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    formatted = body[i] + formatted;
    if (j % 3 === 2 && i > 0) {
      formatted = '.' + formatted;
    }
  }
  
  return `${formatted}-${dv}`;
}

/**
 * Valida un RUT chileno
 */
export function validateRut(rut: string | undefined): boolean {
  if (!rut) return false;
  
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : String(11 - remainder);
  
  return dv === calculatedDv;
}

// ============================================
// FORMATEO DE ESTADOS
// ============================================

export const ESTADO_OBRA_LABELS: Record<EstadoObra, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En Progreso',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
};

export const ESTADO_OBRA_COLORS: Record<EstadoObra, string> = {
  planificacion: 'bg-blue-100 text-blue-800',
  en_progreso: 'bg-green-100 text-green-800',
  pausada: 'bg-yellow-100 text-yellow-800',
  finalizada: 'bg-gray-100 text-gray-800',
};

export const ESTADO_TRABAJADOR_LABELS: Record<EstadoTrabajador, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  finalizado: 'Finalizado',
};

export const ESTADO_TRABAJADOR_COLORS: Record<EstadoTrabajador, string> = {
  activo: 'bg-green-100 text-green-800',
  inactivo: 'bg-yellow-100 text-yellow-800',
  finalizado: 'bg-gray-100 text-gray-800',
};

export const ESTADO_ACTIVIDAD_LABELS: Record<EstadoActividad, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const ESTADO_ACTIVIDAD_COLORS: Record<EstadoActividad, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

export const ESTADO_COMPRA_LABELS: Record<EstadoCompra, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

export const ESTADO_COMPRA_COLORS: Record<EstadoCompra, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagada: 'bg-blue-100 text-blue-800',
  entregada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

// ============================================
// FORMATEO DE TELÉFONO
// ============================================

/**
 * Formatea un teléfono chileno
 * Ej: "912345678" -> "+56 9 1234 5678"
 */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return '-';
  
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 9 && clean.startsWith('9')) {
    // Celular sin código país
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5)}`;
  }
  
  if (clean.length === 11 && clean.startsWith('569')) {
    // Celular con código país
    return `+${clean.slice(0, 2)} ${clean.slice(2, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  
  return phone; // Devolver original si no coincide
}

// ============================================
// TRUNCADO DE TEXTO
// ============================================

/**
 * Trunca un texto a una longitud máxima
 */
export function truncate(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Obtiene las iniciales de un nombre
 * Ej: "Juan Pérez González" -> "JP"
 */
export function getInitials(name: string | undefined, max = 2): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, max)
    .map(word => word[0].toUpperCase())
    .join('');
}
