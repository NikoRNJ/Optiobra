/**
 * OptiObra - Página Nueva Actividad
 * Flujo guiado para crear actividades con calendario animado
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  FileText,
  Check,
  Clock,
  Building2
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Select,
  Calendar
} from '@/components/ui';
import { useObraStore, useActividadStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import type { TipoActividad, PrioridadActividad } from '@/types';

// Tipos de actividad disponibles
const TIPOS_ACTIVIDAD: { value: TipoActividad; label: string; icon: string }[] = [
  { value: 'tarea', label: 'TAREA GENERAL', icon: '📋' },
  { value: 'diaria', label: 'RUTINA DIARIA', icon: '📅' },
  { value: 'semanal', label: 'CICLO SEMANAL', icon: '📆' },
  { value: 'inspeccion', label: 'CONTROL TÉCNICO', icon: '🔍' },
  { value: 'entrega', label: 'HITO ENTREGA', icon: '📦' },
  { value: 'reunion', label: 'PLANIFICACIÓN', icon: '👥' },
  { value: 'otro', label: 'OTROS', icon: '📌' },
];

const PRIORIDADES: { value: PrioridadActividad; label: string; color: string }[] = [
  { value: 'alta', label: 'ALTA PRIORIDAD', color: 'bg-error-50 text-error-700 border-error-100' },
  { value: 'media', label: 'MODERADA', color: 'bg-warning-50 text-warning-700 border-warning-100' },
  { value: 'baja', label: 'CONTROLADA', color: 'bg-success-50 text-success-700 border-success-100' },
];

type Paso = 'obra' | 'calendario' | 'detalles' | 'confirmacion';

export function NuevaActividadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get('obraId');

  const { obras, cargarObras } = useObraStore();
  const { crearActividad, isLoading } = useActividadStore();

  // Estado del formulario por pasos
  const [pasoActual, setPasoActual] = useState<Paso>('obra');
  const [animandoPaso, setAnimandoPaso] = useState(false);

  // Datos del formulario
  const [obraId, setObraId] = useState(obraIdParam || '');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<TipoActividad>('tarea');
  const [prioridad, setPrioridad] = useState<PrioridadActividad>('media');

  useEffect(() => {
    cargarObras();
  }, [cargarObras]);

  useEffect(() => {
    if (obraIdParam) {
      setObraId(obraIdParam);
      setPasoActual('calendario');
    }
  }, [obraIdParam]);

  // Calcular duración y si es actividad larga
  const duracionDias = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0;
    return Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [fechaInicio, fechaFin]);

  const esActividadLarga = duracionDias > 7;

  // Calcular fecha de notificación (3 días antes)
  const fechaNotificacion = useMemo(() => {
    if (!fechaFin) return null;
    const fecha = new Date(fechaFin);
    fecha.setDate(fecha.getDate() - 3);
    return fecha;
  }, [fechaFin]);

  // Funciones de navegación entre pasos
  const irAPaso = (paso: Paso) => {
    setAnimandoPaso(true);
    setTimeout(() => {
      setPasoActual(paso);
      setTimeout(() => setAnimandoPaso(false), 100);
    }, 200);
  };

  const siguientePaso = () => {
    const pasos: Paso[] = ['obra', 'calendario', 'detalles', 'confirmacion'];
    const indiceActual = pasos.indexOf(pasoActual);
    if (indiceActual < pasos.length - 1) {
      irAPaso(pasos[indiceActual + 1]);
    }
  };

  const pasoAnterior = () => {
    const pasos: Paso[] = ['obra', 'calendario', 'detalles', 'confirmacion'];
    const indiceActual = pasos.indexOf(pasoActual);
    if (indiceActual > 0) {
      irAPaso(pasos[indiceActual - 1]);
    } else {
      navigate(-1);
    }
  };

  // Manejar selección de fechas
  const handleSelectDate = (date: Date) => {
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(date);
      setFechaFin(null);
    }
  };

  const handleSelectRange = (start: Date, end: Date) => {
    setFechaInicio(start);
    setFechaFin(end);
  };

  // Crear actividad
  const handleCrear = async () => {
    if (!obraId || !fechaInicio || !fechaFin || !titulo) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    try {
      await crearActividad({
        obraId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        fecha: fechaInicio.toISOString(), // Legacy
        titulo,
        descripcion,
        tipo,
        prioridad,
        estado: 'pendiente',
        duracionDias,
        esActividadLarga,
        multimedia: [],
        avances: [],
      });

      toast.success('Actividad creada correctamente');

      // Si es actividad larga, mostrar info de notificación
      if (esActividadLarga && fechaNotificacion) {
        toast.info(`Recibirás una notificación el ${fechaNotificacion.toLocaleDateString('es-CL')}`);
      }

      navigate('/actividades');
    } catch {
      toast.error('Error al crear la actividad');
    }
  };

  // Obtener nombre de obra seleccionada
  const obraSeleccionada = obras.find(o => o.id === obraId);

  // Indicador de progreso
  const pasos: Paso[] = ['obra', 'calendario', 'detalles', 'confirmacion'];
  const progreso = ((pasos.indexOf(pasoActual) + 1) / pasos.length) * 100;

  return (
    <div className="min-h-full flex flex-col bg-surface-50">
      {/* Header Premium Industrial */}
      <div className="bg-white border-b border-surface-100 px-6 py-6 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={pasoAnterior}
              className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-surface-900" />
            </Button>
            <div className="flex-1">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-0.5 block">
                Planificación de Obra
              </span>
              <h1 className="text-xl font-black text-surface-900 uppercase tracking-tighter leading-none">Nueva Actividad</h1>
            </div>
          </div>

          {/* Stepper Industrial */}
          <div className="flex items-center gap-1.5 mb-2">
            {pasos.map((p, i) => (
              <div 
                key={p} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  pasos.indexOf(pasoActual) >= i ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-surface-100'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
              FASE {pasos.indexOf(pasoActual) + 1} DE {pasos.length}
            </span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
              {Math.round(progreso)}% COMPLETADO
            </span>
          </div>
      </div>

      {/* Contenido del paso actual */}
      <div
        className={`
          flex-1 px-4 py-8 transition-all duration-300
          ${animandoPaso ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
        `}
      >
        {/* PASO 1: Seleccionar Obra */}
        {pasoActual === 'obra' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-primary-50 flex items-center justify-center mb-6 border border-primary-100 shadow-sm">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2 leading-none">
                Selección de Proyecto
              </h2>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
                Vincule la actividad a una obra activa
              </p>
            </div>

            <div className="space-y-3 px-2">
              {obras.map(obra => (
                <button
                  key={obra.id}
                  onClick={() => {
                    setObraId(obra.id!);
                    siguientePaso();
                  }}
                  className={`
                    w-full p-5 rounded-[2rem] border-2 text-left transition-all group relative overflow-hidden
                    ${obraId === obra.id
                      ? 'border-primary-600 bg-white shadow-xl scale-[1.02]'
                      : 'border-surface-100 bg-white hover:border-primary-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${obraId === obra.id ? 'bg-primary-600' : 'bg-surface-50'}`}>
                        <Building2 className={`w-6 h-6 ${obraId === obra.id ? 'text-white' : 'text-surface-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-surface-900 uppercase text-xs tracking-widest truncate">{obra.nombre}</h3>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter mt-0.5 truncate">{obra.direccion}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform ${obraId === obra.id ? 'text-primary-600 translate-x-0' : 'text-surface-200 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Seleccionar Fechas */}
        {pasoActual === 'calendario' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-accent-50 flex items-center justify-center mx-auto mb-6 border border-accent-100 shadow-sm">
                <CalendarIcon className="w-8 h-8 text-accent-600" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2 leading-none">
                Cronograma de Ejecución
              </h2>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
                Defina la ventana temporal de la labor
              </p>
            </div>

            <div className="bg-white p-2 rounded-[2.5rem] border border-surface-100 shadow-sm">
                <Calendar
                    selectedStartDate={fechaInicio}
                    selectedEndDate={fechaFin}
                    onSelectDate={handleSelectDate}
                    onSelectRange={handleSelectRange}
                    mode="range"
                />
            </div>

            {/* Info actividad larga Industrial */}
            {esActividadLarga && (
              <div className="bg-primary-50 border border-primary-100 p-4 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200 shadow-sm">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary-800 uppercase tracking-widest mb-1">
                      Módulo de Bitácora Habilitado
                    </h4>
                    <p className="text-[10px] font-bold text-primary-700 uppercase tracking-tighter leading-tight">
                      OPERACIÓN EXTENSA RECONOCIDA. SE ACTIVARÁ EL REGISTRO DIARIO DE AVANCES CON EVIDENCIA MULTIMEDIA.
                    </p>
                  </div>
              </div>
            )}

            <Button
              fullWidth
              className="h-14 rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-primary-500/20"
              onClick={siguientePaso}
              disabled={!fechaInicio || !fechaFin}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              CONTINUAR AL REGISTRO
            </Button>
          </div>
        )}

        {/* PASO 3: Detalles */}
        {pasoActual === 'detalles' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-[2.2rem] bg-success-50 flex items-center justify-center mx-auto mb-6 border border-success-100 shadow-sm">
                <FileText className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2 leading-none">
                Especificaciones Técnicas
              </h2>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
                {esActividadLarga
                  ? 'CONFIGURANDO OPERACIÓN DE LARGO ALIENTO'
                  : 'CONFIGURANDO ACTIVIDAD PUNTUAL'
                }
              </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                        DENOMINACIÓN DE LA ACTIVIDAD
                    </label>
                    <Input
                        placeholder="EJ: CONSTRUCCIÓN DE MURO PERIMETRAL SECTOR A"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value.toUpperCase())}
                        className="h-12 border-surface-100 bg-white font-bold text-xs uppercase"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                        ALCANCE Y OBSERVACIONES
                    </label>
                    <textarea
                        placeholder={esActividadLarga
                        ? "DESCRIBA EL TRABAJO A REALIZAR. PODRÁ AGREGAR AVANCES DIARIOS CON FOTOS..."
                        : "DESCRIBA BREVEMENTE LA ACTIVIDAD..."
                        }
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value.toUpperCase())}
                        className="w-full h-32 px-5 py-4 bg-white border border-surface-100 rounded-3xl resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-xs font-bold uppercase tracking-tight placeholder:text-surface-300"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                        NATURALEZA DE LA LABOR
                    </label>
                    <Select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoActividad)}
                        options={TIPOS_ACTIVIDAD.map(t => ({
                            value: t.value,
                            label: `${t.icon} ${t.label}`,
                        }))}
                        className="h-12 border-surface-100 bg-white font-bold text-xs uppercase"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1 text-center block">
                        NIVEL DE PRIORIDAD OPERATIVA
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {PRIORIDADES.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPrioridad(p.value)}
                            className={`
                            h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all
                            ${prioridad === p.value ? p.color + ' shadow-md scale-[1.02]' : 'bg-white text-surface-400 border-surface-100'}
                            `}
                        >
                            {p.label.split(' ')[0]}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
              fullWidth
              className="h-14 rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-primary-500/20"
              onClick={siguientePaso}
              disabled={!titulo}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              VALORAR Y FINALIZAR
            </Button>
          </div>
        )}

        {/* PASO 4: Confirmación */}
        {pasoActual === 'confirmacion' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-[2.5rem] bg-primary-900 flex items-center justify-center mx-auto mb-6 border border-primary-800 shadow-xl">
                <Check className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2 leading-none">
                Resumen de Orden
              </h2>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
                Verifique los parámetros de la actividad
              </p>
            </div>

            <Card className="bg-white border-none shadow-sm overflow-hidden" padding="none">
              <div className="p-1 space-y-1">
                {/* Obra */}
                <div className="bg-surface-50/50 p-4 rounded-[1.75rem] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-surface-100 shadow-sm">
                    <Building2 className="w-6 h-6 text-surface-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-0.5">Proyecto Destino</p>
                    <p className="font-black text-surface-900 uppercase text-xs truncate">{obraSeleccionada?.nombre}</p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-surface-50/50 p-4 rounded-[1.75rem] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-surface-100 shadow-sm">
                    <CalendarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-0.5">Cronograma Confirmado</p>
                    <p className="font-black text-surface-900 uppercase text-xs">
                      {fechaInicio?.toLocaleDateString('es-CL')} — {fechaFin?.toLocaleDateString('es-CL')}
                    </p>
                    <div className="mt-1.5 flex gap-2">
                        <span className={`
                        px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest
                        ${esActividadLarga ? 'bg-primary-900 text-white' : 'bg-surface-200 text-surface-700'}
                        `}>
                        {duracionDias} DÍAS
                        </span>
                        {esActividadLarga && (
                          <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary-100">
                             BITÁCORA ACTIVA
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Título y descripción */}
                <div className="bg-surface-900 p-5 rounded-[2rem] text-white my-2">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">Denominación del Trabajo</p>
                  <p className="font-black text-sm uppercase leading-tight mb-3">{titulo}</p>
                  {descripcion && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] font-medium text-white/60 leading-relaxed uppercase italic">"{descripcion}"</p>
                    </div>
                  )}
                </div>

                {/* Tipo y prioridad */}
                <div className="flex gap-2 p-1">
                  <div className="flex-1 bg-surface-50/50 p-4 rounded-[1.75rem]">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Categoría</p>
                    <p className="font-black text-surface-900 uppercase text-[10px]">
                      {TIPOS_ACTIVIDAD.find(t => t.value === tipo)?.icon} {TIPOS_ACTIVIDAD.find(t => t.value === tipo)?.label}
                    </p>
                  </div>
                  <div className="flex-1 bg-surface-50/50 p-4 rounded-[1.75rem]">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Impacto</p>
                    <span className={`
                      inline-block px-3 py-1 rounded-lg text-center w-full text-[10px] font-black uppercase tracking-widest
                      ${PRIORIDADES.find(p => p.value === prioridad)?.color}
                    `}>
                      {PRIORIDADES.find(p => p.value === prioridad)?.label.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="pt-4">
                <Button
                    fullWidth
                    className="h-16 rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-primary-600/30"
                    onClick={handleCrear}
                    isLoading={isLoading}
                    leftIcon={<Check className="w-5 h-5" />}
                >
                    EMITIR ORDEN DE TRABAJO
                </Button>
                <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest text-center mt-4 px-6 leading-relaxed">
                    AL EMITIR ESTA ORDEN, SE NOTIFICARÁ AL SISTEMA CENTRAL Y SE HABILITARÁN LOS REGISTROS DE CAMPO PARA LA FECHA DE INICIO.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NuevaActividadPage;
