/**
 * OptiObra - Funciones de Cubicación
 * Cálculos de materiales según normativas NCh chilenas
 */

import type { GradoHormigon, ResultadoCubicacion } from '@/types';
import {
  DOSIFICACIONES_HORMIGON,
  TIPOS_LADRILLO,
  ACERO_DIAMETROS,
  MALLAS_ACMA,
  MORTEROS,
  FACTOR_DESPERDICIO,
  cementoKgASacos,
} from './constants';

// ============================================
// FUNCIONES DE CÁLCULO BASE
// ============================================

/**
 * Redondea a 2 decimales
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Redondea a 3 decimales
 */
export function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

// ============================================
// TERRENO
// ============================================

export interface CalculoTerreno {
  largo: number;
  ancho: number;
  profundidadExcavacion?: number;
}

export function calcularTerreno(params: CalculoTerreno): ResultadoCubicacion {
  const { largo, ancho, profundidadExcavacion = 0 } = params;
  
  const superficie = round2(largo * ancho);
  const volumenExcavacion = profundidadExcavacion > 0 
    ? round3(superficie * profundidadExcavacion) 
    : 0;

  return {
    tipo: 'terreno',
    superficie,
    volumen: volumenExcavacion,
    materiales: volumenExcavacion > 0 
      ? [{ nombre: 'Volumen excavación', cantidad: volumenExcavacion, unidad: 'm3' }]
      : [],
  };
}

// ============================================
// ZAPATA
// ============================================

export interface CalculoZapata {
  largo: number;
  ancho: number;
  alto: number;
  gradoHormigon: GradoHormigon;
  cantidad?: number;
  conDesperdicio?: boolean;
}

export function calcularZapata(params: CalculoZapata): ResultadoCubicacion {
  const { 
    largo, 
    ancho, 
    alto, 
    gradoHormigon, 
    cantidad = 1,
    conDesperdicio = true 
  } = params;

  const volumenUnitario = largo * ancho * alto;
  const volumenTotal = round3(volumenUnitario * cantidad);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumenTotal * FACTOR_DESPERDICIO.hormigon) 
    : volumenTotal;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];
  
  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  return {
    tipo: 'zapata',
    volumen: volumenTotal,
    materiales: [
      { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
      { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
      { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
      { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
      { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
    ],
  };
}

// ============================================
// RADIER
// ============================================

export interface CalculoRadier {
  largo: number;
  ancho: number;
  espesor: number; // en cm
  gradoHormigon: GradoHormigon;
  tipoMalla?: keyof typeof MALLAS_ACMA;
  conFilm?: boolean;
  conDesperdicio?: boolean;
}

export function calcularRadier(params: CalculoRadier): ResultadoCubicacion {
  const {
    largo,
    ancho,
    espesor,
    gradoHormigon,
    tipoMalla = 'C139',
    conFilm = true,
    conDesperdicio = true,
  } = params;

  const superficie = round2(largo * ancho);
  const espesorM = espesor / 100;
  const volumen = round3(superficie * espesorM);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumen * FACTOR_DESPERDICIO.hormigon) 
    : volumen;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];
  const malla = MALLAS_ACMA[tipoMalla];

  // Calcular cantidad de mallas necesarias
  const areaMalla = malla.ancho * malla.largo;
  const cantidadMallas = Math.ceil(superficie * 1.1 / areaMalla); // 10% traslape

  // Calcular film polietileno (m²)
  const filmM2 = conFilm ? round2(superficie * 1.15) : 0; // 15% traslape

  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  const materiales: ResultadoCubicacion['materiales'] = [
    { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
    { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
    { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
    { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
    { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
    { nombre: malla.nombre, cantidad: cantidadMallas, unidad: 'unidad' },
  ];

  if (conFilm) {
    materiales.push({ nombre: 'Film polietileno', cantidad: filmM2, unidad: 'm2' });
  }

  return {
    tipo: 'radier',
    superficie,
    volumen,
    materiales,
  };
}

// ============================================
// MURO
// ============================================

export interface CalculoMuro {
  largo: number;
  alto: number;
  tipoLadrillo: keyof typeof TIPOS_LADRILLO;
  espesorJunta?: number; // en cm, default 1.5
  conEstuco?: boolean;
  espesorEstuco?: number; // en cm
  conDesperdicio?: boolean;
}

export function calcularMuro(params: CalculoMuro): ResultadoCubicacion {
  const {
    largo,
    alto,
    tipoLadrillo,
    espesorJunta = 1.5,
    conEstuco = false,
    espesorEstuco = 2.5,
    conDesperdicio = true,
  } = params;

  const superficie = round2(largo * alto);
  const ladrillo = TIPOS_LADRILLO[tipoLadrillo];
  
  // Calcular ladrillos necesarios
  let cantidadLadrillos = Math.ceil(superficie * ladrillo.porM2);
  if (conDesperdicio) {
    cantidadLadrillos = Math.ceil(cantidadLadrillos * FACTOR_DESPERDICIO.ladrillos);
  }

  // Calcular mortero para juntas
  // Estimación: volumen de junta = perímetro ladrillo * espesor junta * cantidad
  const espesorJuntaM = espesorJunta / 100;
  const volumenMorteroBase = superficie * espesorJuntaM * 0.5; // factor aproximado
  const volumenMortero = conDesperdicio 
    ? round3(volumenMorteroBase * FACTOR_DESPERDICIO.mortero)
    : round3(volumenMorteroBase);

  const mortero = MORTEROS['1:3'];
  const cementoMorteroKg = round2(volumenMortero * mortero.cementoKgM3);
  const arenaMorteroM3 = round3(volumenMortero * mortero.arenaM3);

  const materiales: ResultadoCubicacion['materiales'] = [
    { nombre: ladrillo.nombre, cantidad: cantidadLadrillos, unidad: 'unidad' },
    { nombre: 'Cemento (mortero)', cantidad: cementoKgASacos(cementoMorteroKg), unidad: 'saco' },
    { nombre: 'Arena (mortero)', cantidad: arenaMorteroM3, unidad: 'm3' },
  ];

  // Calcular estuco si aplica
  if (conEstuco) {
    const espesorEstucoM = espesorEstuco / 100;
    const superficieEstuco = superficie * 2; // ambos lados
    const volumenEstuco = round3(superficieEstuco * espesorEstucoM);
    
    const morteroEstuco = MORTEROS['1:4'];
    const cementoEstucoKg = round2(volumenEstuco * morteroEstuco.cementoKgM3);
    const arenaEstucoM3 = round3(volumenEstuco * morteroEstuco.arenaM3);

    materiales.push(
      { nombre: 'Cemento (estuco)', cantidad: cementoKgASacos(cementoEstucoKg), unidad: 'saco' },
      { nombre: 'Arena (estuco)', cantidad: arenaEstucoM3, unidad: 'm3' }
    );
  }

  return {
    tipo: 'muro',
    superficie,
    materiales,
  };
}

// ============================================
// LOSA
// ============================================

export interface CalculoLosa {
  largo: number;
  ancho: number;
  espesor: number; // en cm
  gradoHormigon: GradoHormigon;
  diametroAcero?: number; // mm
  espaciamientoAcero?: number; // cm
  conMoldaje?: boolean;
  conDesperdicio?: boolean;
}

export function calcularLosa(params: CalculoLosa): ResultadoCubicacion {
  const {
    largo,
    ancho,
    espesor,
    gradoHormigon,
    diametroAcero = 10,
    espaciamientoAcero = 15,
    conMoldaje = true,
    conDesperdicio = true,
  } = params;

  const superficie = round2(largo * ancho);
  const espesorM = espesor / 100;
  const volumen = round3(superficie * espesorM);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumen * FACTOR_DESPERDICIO.hormigon) 
    : volumen;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];
  const acero = ACERO_DIAMETROS[diametroAcero];

  // Calcular fierro
  const espaciamientoM = espaciamientoAcero / 100;
  const barrasLargo = Math.ceil(ancho / espaciamientoM) + 1;
  const barrasAncho = Math.ceil(largo / espaciamientoM) + 1;
  const mlFierro = (barrasLargo * largo) + (barrasAncho * ancho);
  const mlFierroConDesperdicio = conDesperdicio 
    ? round2(mlFierro * FACTOR_DESPERDICIO.acero) 
    : round2(mlFierro);
  const kgFierro = round2(mlFierroConDesperdicio * acero.pesoKgM);

  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  const materiales: ResultadoCubicacion['materiales'] = [
    { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
    { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
    { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
    { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
    { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
    { nombre: `Fierro Ø${diametroAcero}mm`, cantidad: kgFierro, unidad: 'kg' },
    { nombre: `Fierro Ø${diametroAcero}mm (ml)`, cantidad: mlFierroConDesperdicio, unidad: 'm' },
  ];

  if (conMoldaje) {
    // Moldaje: superficie de losa + bordes
    const moldajeM2 = round2(superficie);
    materiales.push({ nombre: 'Moldaje', cantidad: moldajeM2, unidad: 'm2' });
  }

  return {
    tipo: 'losa',
    superficie,
    volumen,
    materiales,
  };
}

// ============================================
// PILAR
// ============================================

export interface CalculoPilar {
  base: number; // cm
  profundidad: number; // cm
  altura: number; // metros
  gradoHormigon: GradoHormigon;
  cantidad?: number;
  barrasLongitudinales?: number;
  diametroBarra?: number;
  diametroEstribo?: number;
  espaciamientoEstribo?: number; // cm
  conDesperdicio?: boolean;
}

export function calcularPilar(params: CalculoPilar): ResultadoCubicacion {
  const {
    base,
    profundidad,
    altura,
    gradoHormigon,
    cantidad = 1,
    barrasLongitudinales = 4,
    diametroBarra = 12,
    diametroEstribo = 8,
    espaciamientoEstribo = 20,
    conDesperdicio = true,
  } = params;

  const baseM = base / 100;
  const profundidadM = profundidad / 100;
  const volumenUnitario = baseM * profundidadM * altura;
  const volumenTotal = round3(volumenUnitario * cantidad);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumenTotal * FACTOR_DESPERDICIO.hormigon) 
    : volumenTotal;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];
  const aceroBarra = ACERO_DIAMETROS[diametroBarra];
  const aceroEstribo = ACERO_DIAMETROS[diametroEstribo];

  // Calcular fierro longitudinal
  const mlBarras = altura * barrasLongitudinales * cantidad;
  
  // Calcular estribos
  const perimetroEstribo = 2 * (baseM + profundidadM - 0.08); // restando recubrimiento
  const cantidadEstribos = Math.ceil((altura * 100) / espaciamientoEstribo) + 1;
  const mlEstribos = perimetroEstribo * cantidadEstribos * cantidad;

  const mlFierroTotal = conDesperdicio 
    ? round2((mlBarras + mlEstribos) * FACTOR_DESPERDICIO.acero)
    : round2(mlBarras + mlEstribos);

  const kgBarras = round2(mlBarras * aceroBarra.pesoKgM * (conDesperdicio ? FACTOR_DESPERDICIO.acero : 1));
  const kgEstribos = round2(mlEstribos * aceroEstribo.pesoKgM * (conDesperdicio ? FACTOR_DESPERDICIO.acero : 1));

  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  return {
    tipo: 'pilar',
    volumen: volumenTotal,
    materiales: [
      { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
      { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
      { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
      { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
      { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
      { nombre: `Fierro Ø${diametroBarra}mm (barras)`, cantidad: kgBarras, unidad: 'kg' },
      { nombre: `Fierro Ø${diametroEstribo}mm (estribos)`, cantidad: kgEstribos, unidad: 'kg' },
      { nombre: 'Fierro total (ml)', cantidad: mlFierroTotal, unidad: 'm' },
    ],
  };
}

// ============================================
// VIGA / CADENA
// ============================================

export interface CalculoViga {
  largo: number; // metros
  base: number; // cm
  altura: number; // cm
  gradoHormigon: GradoHormigon;
  cantidad?: number;
  barrasSuperiores?: number;
  barrasInferiores?: number;
  diametroBarra?: number;
  diametroEstribo?: number;
  espaciamientoEstribo?: number; // cm
  conDesperdicio?: boolean;
}

export function calcularViga(params: CalculoViga): ResultadoCubicacion {
  const {
    largo,
    base,
    altura,
    gradoHormigon,
    cantidad = 1,
    barrasSuperiores = 2,
    barrasInferiores = 2,
    diametroBarra = 12,
    diametroEstribo = 8,
    espaciamientoEstribo = 20,
    conDesperdicio = true,
  } = params;

  const baseM = base / 100;
  const alturaM = altura / 100;
  const volumenUnitario = baseM * alturaM * largo;
  const volumenTotal = round3(volumenUnitario * cantidad);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumenTotal * FACTOR_DESPERDICIO.hormigon) 
    : volumenTotal;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];
  const aceroBarra = ACERO_DIAMETROS[diametroBarra];
  const aceroEstribo = ACERO_DIAMETROS[diametroEstribo];

  // Calcular fierro longitudinal
  const totalBarras = barrasSuperiores + barrasInferiores;
  const mlBarras = largo * totalBarras * cantidad;
  
  // Calcular estribos
  const perimetroEstribo = 2 * (baseM + alturaM - 0.08);
  const cantidadEstribos = Math.ceil((largo * 100) / espaciamientoEstribo) + 1;
  const mlEstribos = perimetroEstribo * cantidadEstribos * cantidad;

  const kgBarras = round2(mlBarras * aceroBarra.pesoKgM * (conDesperdicio ? FACTOR_DESPERDICIO.acero : 1));
  const kgEstribos = round2(mlEstribos * aceroEstribo.pesoKgM * (conDesperdicio ? FACTOR_DESPERDICIO.acero : 1));

  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  return {
    tipo: 'viga',
    volumen: volumenTotal,
    materiales: [
      { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
      { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
      { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
      { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
      { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
      { nombre: `Fierro Ø${diametroBarra}mm (barras)`, cantidad: kgBarras, unidad: 'kg' },
      { nombre: `Fierro Ø${diametroEstribo}mm (estribos)`, cantidad: kgEstribos, unidad: 'kg' },
    ],
  };
}

// Alias para cadena (usa misma función)
export const calcularCadena = calcularViga;

// ============================================
// SOBRECIMIENTO
// ============================================

export interface CalculoSobrecimiento {
  largoTotal: number; // metros lineales
  ancho: number; // cm
  alto: number; // cm
  gradoHormigon: GradoHormigon;
  conDesperdicio?: boolean;
}

export function calcularSobrecimiento(params: CalculoSobrecimiento): ResultadoCubicacion {
  const {
    largoTotal,
    ancho,
    alto,
    gradoHormigon,
    conDesperdicio = true,
  } = params;

  const anchoM = ancho / 100;
  const altoM = alto / 100;
  const volumen = round3(largoTotal * anchoM * altoM);
  const volumenConDesperdicio = conDesperdicio 
    ? round3(volumen * FACTOR_DESPERDICIO.hormigon) 
    : volumen;

  const dosificacion = DOSIFICACIONES_HORMIGON[gradoHormigon];

  const cementoKg = round2(volumenConDesperdicio * dosificacion.cemento);
  const arenaM3 = round3(volumenConDesperdicio * dosificacion.arena);
  const gravillaM3 = round3(volumenConDesperdicio * dosificacion.gravilla);
  const aguaLt = round2(volumenConDesperdicio * dosificacion.agua);

  return {
    tipo: 'sobrecimiento',
    volumen,
    materiales: [
      { nombre: `Hormigón ${gradoHormigon}`, cantidad: volumenConDesperdicio, unidad: 'm3' },
      { nombre: 'Cemento', cantidad: cementoKgASacos(cementoKg), unidad: 'saco' },
      { nombre: 'Arena', cantidad: arenaM3, unidad: 'm3' },
      { nombre: 'Gravilla', cantidad: gravillaM3, unidad: 'm3' },
      { nombre: 'Agua', cantidad: aguaLt, unidad: 'lt' },
    ],
  };
}
