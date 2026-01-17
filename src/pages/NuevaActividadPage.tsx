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
  Bell,
  Clock,
  Building2,
  AlertCircle
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
  { value: 'tarea', label: 'Tarea General', icon: '📋' },
  { value: 'diaria', label: 'Actividad Diaria', icon: '📅' },
  { value: 'semanal', label: 'Actividad Semanal', icon: '📆' },
  { value: 'inspeccion', label: 'Inspección', icon: '🔍' },
  { value: 'entrega', label: 'Entrega', icon: '📦' },
  { value: 'reunion', label: 'Reunión', icon: '👥' },
  { value: 'otro', label: 'Otro', icon: '📌' },
];

const PRIORIDADES: { value: PrioridadActividad; label: string; color: string }[] = [
  { value: 'alta', label: 'Alta', color: 'bg-error-100 text-error-700 border-error-300' },
  { value: 'media', label: 'Media', color: 'bg-warning-100 text-warning-700 border-warning-300' },
  { value: 'baja', label: 'Baja', color: 'bg-success-100 text-success-700 border-success-300' },
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
    <div className="min-h-full flex flex-col">
      {/* Header fijo */}
      <div className="bg-white border border-surface-200 rounded-b-2xl shadow-card mx-5 mt-4">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={pasoAnterior}
              className="-ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-surface-900">Nueva Actividad</h1>
              <p className="text-xs text-surface-500">
                Paso {pasos.indexOf(pasoActual) + 1} de {pasos.length}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div
        className={`
          flex-1 px-5 py-4 transition-all duration-200
          ${animandoPaso ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
        `}
      >
        {/* PASO 1: Seleccionar Obra */}
        {pasoActual === 'obra' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-black text-surface-900 mb-2">
                Selecciona la Obra
              </h2>
              <p className="text-sm text-surface-600">
                ¿En qué proyecto vas a trabajar?
              </p>
            </div>

            <div className="space-y-3">
              {obras.map(obra => (
                <button
                  key={obra.id}
                  onClick={() => {
                    setObraId(obra.id!);
                    siguientePaso();
                  }}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${obraId === obra.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-surface-200 bg-white hover:border-primary-300'
                    }
                  `}
                >
                  <h3 className="font-bold text-surface-900">{obra.nombre}</h3>
                  <p className="text-sm text-surface-600 mt-1">{obra.direccion}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Seleccionar Fechas */}
        {pasoActual === 'calendario' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-accent-600" />
              </div>
              <h2 className="text-xl font-black text-surface-900 mb-2">
                ¿Cuándo?
              </h2>
              <p className="text-sm text-surface-600">
                Selecciona fecha de inicio y fin
              </p>
            </div>

            <Calendar
              selectedStartDate={fechaInicio}
              selectedEndDate={fechaFin}
              onSelectDate={handleSelectDate}
              onSelectRange={handleSelectRange}
              mode="range"
            />

            {/* Alerta de notificación */}
            {fechaNotificacion && fechaFin && duracionDias > 3 && (
              <Card className="bg-warning-50 border-warning-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-bold text-warning-800 text-sm">
                      Recordatorio programado
                    </p>
                    <p className="text-xs text-warning-700 mt-1">
                      Te notificaremos <strong>3 días antes</strong> del vencimiento
                      ({fechaNotificacion.toLocaleDateString('es-CL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })})
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Info actividad larga */}
            {esActividadLarga && (
              <Card className="bg-primary-50 border-primary-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-primary-800 text-sm">
                      Actividad de larga duración
                    </p>
                    <p className="text-xs text-primary-700 mt-1">
                      Podrás registrar avances diarios con fotos y descripciones
                      del progreso de esta actividad.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Button
              fullWidth
              onClick={siguientePaso}
              disabled={!fechaInicio || !fechaFin}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* PASO 3: Detalles */}
        {pasoActual === 'detalles' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-black text-surface-900 mb-2">
                Describe la Actividad
              </h2>
              <p className="text-sm text-surface-600">
                {esActividadLarga
                  ? 'Esta es una actividad de larga duración'
                  : 'Actividad de corta duración'
                }
              </p>
            </div>

            <Input
              label="Título de la Actividad"
              placeholder="Ej: Construcción de muro perimetral"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700">
                Descripción
              </label>
              <textarea
                placeholder={esActividadLarga
                  ? "Describe el trabajo a realizar. Podrás agregar avances diarios con fotos..."
                  : "Describe brevemente la actividad..."
                }
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full h-32 px-4 py-3 border-2 border-surface-200 rounded-xl resize-none focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <Select
              label="Tipo de Actividad"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoActividad)}
              options={TIPOS_ACTIVIDAD.map(t => ({
                value: t.value,
                label: `${t.icon} ${t.label}`,
              }))}
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700">
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORIDADES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPrioridad(p.value)}
                    className={`
                      py-3 rounded-xl border-2 font-bold text-sm transition-all
                      ${prioridad === p.value ? p.color : 'bg-white text-surface-600 border-surface-200'}
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              fullWidth
              onClick={siguientePaso}
              disabled={!titulo}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Revisar y Crear
            </Button>
          </div>
        )}

        {/* PASO 4: Confirmación */}
        {pasoActual === 'confirmacion' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-surface-900 mb-2">
                Confirmar Actividad
              </h2>
              <p className="text-sm text-surface-600">
                Revisa los datos antes de crear
              </p>
            </div>

            <Card>
              <div className="space-y-4">
                {/* Obra */}
                <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-surface-600" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Obra</p>
                    <p className="font-bold text-surface-900">{obraSeleccionada?.nombre}</p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-500">Duración</p>
                    <p className="font-bold text-surface-900">
                      {fechaInicio?.toLocaleDateString('es-CL')} - {fechaFin?.toLocaleDateString('es-CL')}
                    </p>
                    <span className={`
                      inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold
                      ${esActividadLarga ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600'}
                    `}>
                      {duracionDias} {duracionDias === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                </div>

                {/* Título y descripción */}
                <div className="pb-3 border-b border-surface-100">
                  <p className="text-xs text-surface-500 mb-1">Actividad</p>
                  <p className="font-bold text-surface-900">{titulo}</p>
                  {descripcion && (
                    <p className="text-sm text-surface-600 mt-1 line-clamp-2">{descripcion}</p>
                  )}
                </div>

                {/* Tipo y prioridad */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-surface-500">Tipo</p>
                    <p className="font-bold text-surface-700">
                      {TIPOS_ACTIVIDAD.find(t => t.value === tipo)?.icon} {TIPOS_ACTIVIDAD.find(t => t.value === tipo)?.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">Prioridad</p>
                    <span className={`
                      inline-block px-3 py-1 rounded-full text-xs font-bold
                      ${PRIORIDADES.find(p => p.value === prioridad)?.color}
                    `}>
                      {PRIORIDADES.find(p => p.value === prioridad)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info adicional para actividades largas */}
            {esActividadLarga && (
              <Card className="bg-primary-50 border-primary-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-800">
                    <p className="font-bold mb-1">Actividad de larga duración</p>
                    <p className="text-xs">
                      Después de crear esta actividad, podrás registrar avances
                      diarios con fotos del progreso del trabajo.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Button
              fullWidth
              onClick={handleCrear}
              isLoading={isLoading}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Crear Actividad
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NuevaActividadPage;
