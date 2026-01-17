/**
 * OptiObra - Constantes de Cubicación
 * Normativas NCh y valores estándar para construcción chilena
 */

import type { GradoHormigon } from '@/types';

// ============================================
// DOSIFICACIONES DE HORMIGÓN
// ============================================

export interface DosificacionHormigon {
  /** kg de cemento por m³ */
  cemento: number;
  /** m³ de arena por m³ de hormigón */
  arena: number;
  /** m³ de gravilla por m³ de hormigón */
  gravilla: number;
  /** litros de agua por m³ */
  agua: number;
  /** Resistencia característica en MPa */
  resistencia: number;
}

/**
 * Dosificaciones estándar según NCh 170
 * Valores por m³ de hormigón
 */
export const DOSIFICACIONES_HORMIGON: Record<GradoHormigon, DosificacionHormigon> = {
  H20: { cemento: 300, arena: 0.50, gravilla: 0.80, agua: 180, resistencia: 20 },
  H25: { cemento: 350, arena: 0.48, gravilla: 0.78, agua: 175, resistencia: 25 },
  H30: { cemento: 400, arena: 0.45, gravilla: 0.75, agua: 170, resistencia: 30 },
  H35: { cemento: 420, arena: 0.43, gravilla: 0.73, agua: 165, resistencia: 35 },
  H40: { cemento: 450, arena: 0.40, gravilla: 0.70, agua: 160, resistencia: 40 },
};

// ============================================
// LADRILLOS Y BLOQUES
// ============================================

export interface TipoLadrillo {
  nombre: string;
  /** Largo en metros */
  largo: number;
  /** Ancho en metros */
  ancho: number;
  /** Alto en metros */
  alto: number;
  /** Unidades por m² de muro */
  porM2: number;
  /** Peso aproximado en kg */
  peso: number;
}

export const TIPOS_LADRILLO: Record<string, TipoLadrillo> = {
  fiscal: {
    nombre: 'Ladrillo Fiscal',
    largo: 0.29,
    ancho: 0.14,
    alto: 0.071,
    porM2: 50,
    peso: 3.2,
  },
  princesa: {
    nombre: 'Ladrillo Princesa',
    largo: 0.29,
    ancho: 0.14,
    alto: 0.094,
    porM2: 38,
    peso: 4.0,
  },
  bloque_14: {
    nombre: 'Bloque 14 cm',
    largo: 0.39,
    ancho: 0.14,
    alto: 0.19,
    porM2: 12.5,
    peso: 12,
  },
  bloque_19: {
    nombre: 'Bloque 19 cm',
    largo: 0.39,
    ancho: 0.19,
    alto: 0.19,
    porM2: 12.5,
    peso: 15,
  },
  bloque_09: {
    nombre: 'Bloque 9 cm',
    largo: 0.39,
    ancho: 0.09,
    alto: 0.19,
    porM2: 12.5,
    peso: 8,
  },
};

// ============================================
// ACERO DE REFUERZO
// ============================================

export interface DiametroAcero {
  /** Diámetro en mm */
  diametro: number;
  /** Peso en kg por metro lineal */
  pesoKgM: number;
  /** Área de sección en cm² */
  areaCm2: number;
}

/**
 * Peso del acero según NCh 204
 * Índice: diámetro en mm
 */
export const ACERO_DIAMETROS: Record<number, DiametroAcero> = {
  6: { diametro: 6, pesoKgM: 0.222, areaCm2: 0.283 },
  8: { diametro: 8, pesoKgM: 0.395, areaCm2: 0.503 },
  10: { diametro: 10, pesoKgM: 0.617, areaCm2: 0.785 },
  12: { diametro: 12, pesoKgM: 0.888, areaCm2: 1.131 },
  16: { diametro: 16, pesoKgM: 1.578, areaCm2: 2.011 },
  18: { diametro: 18, pesoKgM: 1.998, areaCm2: 2.545 },
  20: { diametro: 20, pesoKgM: 2.466, areaCm2: 3.142 },
  22: { diametro: 22, pesoKgM: 2.984, areaCm2: 3.801 },
  25: { diametro: 25, pesoKgM: 3.853, areaCm2: 4.909 },
  28: { diametro: 28, pesoKgM: 4.834, areaCm2: 6.158 },
  32: { diametro: 32, pesoKgM: 6.313, areaCm2: 8.042 },
};

// Lista de diámetros disponibles para selects
export const DIAMETROS_DISPONIBLES = [6, 8, 10, 12, 16, 18, 20, 22, 25, 28, 32];

// ============================================
// MALLAS ACMA
// ============================================

export interface TipoMalla {
  nombre: string;
  /** Ancho en metros */
  ancho: number;
  /** Largo en metros */
  largo: number;
  /** Peso en kg */
  peso: number;
  /** Diámetro del alambre en mm */
  diametro: number;
  /** Espaciamiento en cm */
  espaciamiento: number;
}

export const MALLAS_ACMA: Record<string, TipoMalla> = {
  C92: { nombre: 'Malla ACMA C-92', ancho: 2.0, largo: 5.0, peso: 18.4, diametro: 4.2, espaciamiento: 15 },
  C139: { nombre: 'Malla ACMA C-139', ancho: 2.0, largo: 5.0, peso: 27.8, diametro: 5.0, espaciamiento: 15 },
  C188: { nombre: 'Malla ACMA C-188', ancho: 2.0, largo: 5.0, peso: 37.6, diametro: 6.0, espaciamiento: 15 },
  C257: { nombre: 'Malla ACMA C-257', ancho: 2.0, largo: 5.0, peso: 51.4, diametro: 7.0, espaciamiento: 15 },
  C335: { nombre: 'Malla ACMA C-335', ancho: 2.0, largo: 5.0, peso: 67.0, diametro: 8.0, espaciamiento: 15 },
};

// ============================================
// MORTERO
// ============================================

export interface DosificacionMortero {
  nombre: string;
  /** Partes de cemento */
  cemento: number;
  /** Partes de arena */
  arena: number;
  /** kg de cemento por m³ de mortero */
  cementoKgM3: number;
  /** m³ de arena por m³ de mortero */
  arenaM3: number;
  /** Uso recomendado */
  uso: string;
}

export const MORTEROS: Record<string, DosificacionMortero> = {
  '1:3': {
    nombre: 'Mortero 1:3',
    cemento: 1,
    arena: 3,
    cementoKgM3: 450,
    arenaM3: 1.0,
    uso: 'Pega ladrillos, estuco grueso',
  },
  '1:4': {
    nombre: 'Mortero 1:4',
    cemento: 1,
    arena: 4,
    cementoKgM3: 350,
    arenaM3: 1.0,
    uso: 'Pega bloques, estuco fino',
  },
  '1:5': {
    nombre: 'Mortero 1:5',
    cemento: 1,
    arena: 5,
    cementoKgM3: 280,
    arenaM3: 1.0,
    uso: 'Estucos interiores',
  },
};

// ============================================
// RENDIMIENTOS VARIOS
// ============================================

/** Rendimiento de pintura en m² por litro */
export const RENDIMIENTO_PINTURA = {
  latex: 10, // m² por litro
  oleo: 12,
  esmalte: 14,
  anticorrosivo: 8,
};

/** Espesor de radier estándar en cm */
export const ESPESOR_RADIER_ESTANDAR = 10;

/** Espesor de estuco en cm */
export const ESPESOR_ESTUCO = {
  grueso: 2.0,
  fino: 0.5,
  total: 2.5,
};

/** Factor de desperdicio estándar */
export const FACTOR_DESPERDICIO = {
  hormigon: 1.05, // 5%
  acero: 1.10, // 10%
  ladrillos: 1.05, // 5%
  mortero: 1.10, // 10%
  pintura: 1.15, // 15%
};

// ============================================
// UNIDADES DE MEDIDA
// ============================================

export const UNIDADES_MEDIDA = {
  unidad: { nombre: 'Unidad', simbolo: 'un', plural: 'unidades' },
  kg: { nombre: 'Kilogramo', simbolo: 'kg', plural: 'kg' },
  ton: { nombre: 'Tonelada', simbolo: 'ton', plural: 'ton' },
  m: { nombre: 'Metro', simbolo: 'm', plural: 'm' },
  m2: { nombre: 'Metro cuadrado', simbolo: 'm²', plural: 'm²' },
  m3: { nombre: 'Metro cúbico', simbolo: 'm³', plural: 'm³' },
  lt: { nombre: 'Litro', simbolo: 'L', plural: 'L' },
  saco: { nombre: 'Saco', simbolo: 'saco', plural: 'sacos' },
  bolsa: { nombre: 'Bolsa', simbolo: 'bolsa', plural: 'bolsas' },
  rollo: { nombre: 'Rollo', simbolo: 'rollo', plural: 'rollos' },
  plancha: { nombre: 'Plancha', simbolo: 'plancha', plural: 'planchas' },
  caja: { nombre: 'Caja', simbolo: 'caja', plural: 'cajas' },
};

/** Peso del saco de cemento en kg (estándar Chile) */
export const PESO_SACO_CEMENTO = 42.5;

/** Convertir kg de cemento a sacos */
export function cementoKgASacos(kg: number): number {
  return Math.ceil(kg / PESO_SACO_CEMENTO);
}
