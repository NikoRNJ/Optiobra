/**
 * OptiObra - Página Detalle de Actividad
 * Vista detallada con historial de avances para actividades largas
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Building2,
    Plus,
    Camera,
    Image,
    CheckCircle,
    AlertCircle,
    Play,
    Trash2,
    ChevronRight
} from 'lucide-react';
import {
    Card,
    Button,
    Badge,
    Modal,
    Input,
} from '@/components/ui';
import { useActividadStore, useObraStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import { formatDate } from '@/utils';
import type { Actividad, AvanceActividad, EstadoActividad } from '@/types';
import { db, generateId, now } from '@/database/db';

const ESTADOS: { value: EstadoActividad; label: string; color: string; icon: typeof CheckCircle }[] = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-surface-100 text-surface-700', icon: Clock },
    { value: 'en_progreso', label: 'En Progreso', color: 'bg-primary-100 text-primary-700', icon: Play },
    { value: 'completada', label: 'Completada', color: 'bg-success-100 text-success-700', icon: CheckCircle },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-error-100 text-error-700', icon: AlertCircle },
];

function AvanceCard({ avance }: { avance: AvanceActividad }) {
    const fecha = new Date(avance.fecha);

    return (
        <div className="relative pl-8 pb-6 last:pb-0">
            {/* Timeline line */}
            <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-surface-200 last:hidden" />

            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-100 border-2 border-primary-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
            </div>

            <Card className="ml-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <p className="text-xs font-bold text-primary-600">
                            {fecha.toLocaleDateString('es-CL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </p>
                        <p className="text-[10px] text-surface-500">
                            {fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {avance.porcentajeAvance !== undefined && (
                        <Badge size="sm" variant="success">
                            {avance.porcentajeAvance}%
                        </Badge>
                    )}
                </div>

                <p className="text-sm text-surface-700">{avance.descripcion}</p>

                {/* Fotos del avance */}
                {avance.multimedia.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                        {avance.multimedia.map((media) => (
                            <div
                                key={media.id}
                                className="w-20 h-20 rounded-lg bg-surface-100 flex-shrink-0 overflow-hidden"
                            >
                                <img
                                    src={media.url}
                                    alt={media.nombre || 'Avance'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export function ActividadDetallePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { obras, cargarObras } = useObraStore();
    useActividadStore();

    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalAvance, setModalAvance] = useState(false);
    const [modalEstado, setModalEstado] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);

    // Form nuevo avance
    const [nuevoAvanceDescripcion, setNuevoAvanceDescripcion] = useState('');
    const [nuevoAvancePorcentaje, setNuevoAvancePorcentaje] = useState('');
    const [fotosSeleccionadas, setFotosSeleccionadas] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        cargarObras();
        cargarActividad();
    }, [id]);

    const cargarActividad = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const act = await db.actividades.get(id);
            setActividad(act || null);
        } catch (error) {
            console.error('Error cargando actividad:', error);
            toast.error('Error al cargar la actividad');
        }
        setIsLoading(false);
    };

    const obraAsociada = obras.find(o => o.id === actividad?.obraId);

    // Calcular días restantes
    const diasRestantes = actividad ? Math.ceil(
        (new Date(actividad.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ) : 0;

    // Calcular progreso basado en tiempo
    const progresoTiempo = actividad ? Math.min(100, Math.max(0,
        ((new Date().getTime() - new Date(actividad.fechaInicio).getTime()) /
            (new Date(actividad.fechaFin).getTime() - new Date(actividad.fechaInicio).getTime())) * 100
    )) : 0;

    const handleCambiarEstado = async (nuevoEstado: EstadoActividad) => {
        if (!actividad?.id) return;
        try {
            await db.actividades.update(actividad.id, {
                estado: nuevoEstado,
                updatedAt: now()
            });
            setActividad(prev => prev ? { ...prev, estado: nuevoEstado } : null);
            toast.success(`Estado actualizado a "${ESTADOS.find(e => e.value === nuevoEstado)?.label}"`);
            setModalEstado(false);
        } catch {
            toast.error('Error al cambiar estado');
        }
    };

    const handleAgregarAvance = async () => {
        if (!actividad?.id || !nuevoAvanceDescripcion.trim()) {
            toast.error('Escribe una descripción del avance');
            return;
        }

        const nuevoAvance: AvanceActividad = {
            id: generateId(),
            fecha: new Date().toISOString(),
            descripcion: nuevoAvanceDescripcion.trim(),
            porcentajeAvance: nuevoAvancePorcentaje ? parseInt(nuevoAvancePorcentaje) : undefined,
            multimedia: [], // TODO: Procesar fotos seleccionadas
            createdAt: now(),
        };

        try {
            const avancesActuales = actividad.avances || [];
            await db.actividades.update(actividad.id, {
                avances: [...avancesActuales, nuevoAvance],
                estado: 'en_progreso',
                updatedAt: now(),
            });

            setActividad(prev => prev ? {
                ...prev,
                avances: [...(prev.avances || []), nuevoAvance],
                estado: 'en_progreso',
            } : null);

            toast.success('Avance registrado correctamente');
            setModalAvance(false);
            setNuevoAvanceDescripcion('');
            setNuevoAvancePorcentaje('');
            setFotosSeleccionadas([]);
        } catch {
            toast.error('Error al registrar avance');
        }
    };

    const handleEliminar = async () => {
        if (!actividad?.id) return;
        try {
            await db.actividades.delete(actividad.id);
            toast.success('Actividad eliminada');
            navigate('/actividades');
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleSeleccionarFotos = () => {
        fileInputRef.current?.click();
    };

    const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFotosSeleccionadas(prev => [...prev, ...files].slice(0, 5));
    };

    if (isLoading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="animate-pulse text-surface-500">Cargando...</div>
            </div>
        );
    }

    if (!actividad) {
        return (
            <div className="min-h-full flex items-center justify-center px-5">
                <Card className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                    <p className="font-bold text-surface-700">Actividad no encontrada</p>
                    <Button className="mt-4" onClick={() => navigate('/actividades')}>
                        Volver
                    </Button>
                </Card>
            </div>
        );
    }

    const estadoActual = ESTADOS.find(e => e.value === actividad.estado);
    const IconEstado = estadoActual?.icon || Clock;

    return (
        <div className="min-h-full px-5 py-4 pb-32">
            {/* Header */}
            <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="-ml-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-black text-surface-900 line-clamp-2">
                                {actividad.titulo}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge
                                    size="sm"
                                    className={estadoActual?.color}
                                    onClick={() => setModalEstado(true)}
                                >
                                    <IconEstado className="w-3 h-3 mr-1" />
                                    {estadoActual?.label}
                                </Badge>
                                {actividad.esActividadLarga && (
                                    <Badge size="sm" variant="default">
                                        Larga duración
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-4 pb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-surface-500">Progreso temporal</span>
                        <span className="font-bold text-primary-600">{Math.round(progresoTiempo)}%</span>
                    </div>
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 rounded-full transition-all"
                            style={{ width: `${progresoTiempo}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="text-center">
                    <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs text-surface-500">Duración</p>
                    <p className="font-black text-surface-900">{actividad.duracionDias} días</p>
                </Card>
                <Card className={`text-center ${diasRestantes <= 3 ? 'bg-warning-50 border-warning-200' : ''}`}>
                    <Clock className={`w-6 h-6 mx-auto mb-2 ${diasRestantes <= 3 ? 'text-warning-600' : 'text-accent-600'}`} />
                    <p className="text-xs text-surface-500">Restantes</p>
                    <p className={`font-black ${diasRestantes <= 3 ? 'text-warning-700' : 'text-surface-900'}`}>
                        {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencida'}
                    </p>
                </Card>
            </div>

            {/* Fechas */}
            <Card className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-surface-500">Inicio</p>
                        <p className="font-bold text-surface-900">
                            {formatDate(actividad.fechaInicio)}
                        </p>
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="h-0.5 bg-surface-200 relative">
                            <div
                                className="absolute h-full bg-primary-500 rounded-full"
                                style={{ width: `${Math.min(progresoTiempo, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-surface-500">Fin</p>
                        <p className="font-bold text-surface-900">
                            {formatDate(actividad.fechaFin)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Descripción */}
            {actividad.descripcion && (
                <Card className="mb-4">
                    <h3 className="font-bold text-surface-900 mb-2">Descripción</h3>
                    <p className="text-sm text-surface-600">{actividad.descripcion}</p>
                </Card>
            )}

            {/* Obra */}
            {obraAsociada && (
                <Card className="mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-surface-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-surface-500">Obra asociada</p>
                        <p className="font-bold text-surface-900">{obraAsociada.nombre}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-surface-400" />
                </Card>
            )}

            {/* Historial de Avances - Solo para actividades largas */}
            {actividad.esActividadLarga && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-surface-900">Historial de Avances</h3>
                        <Button
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setModalAvance(true)}
                        >
                            Añadir
                        </Button>
                    </div>

                    {(!actividad.avances || actividad.avances.length === 0) ? (
                        <Card className="text-center py-8 border-2 border-dashed border-surface-300">
                            <Image className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                            <p className="font-bold text-surface-600">Sin avances registrados</p>
                            <p className="text-sm text-surface-500 mt-1 mb-4">
                                Registra el progreso diario de esta actividad
                            </p>
                            <Button
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={() => setModalAvance(true)}
                            >
                                Registrar Primer Avance
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-0">
                            {[...actividad.avances].reverse().map((avance) => (
                                <AvanceCard
                                    key={avance.id}
                                    avance={avance}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Acciones fijas en el footer */}
            <div className="fixed bottom-20 left-0 right-0 px-5 py-3 bg-white border-t border-surface-200 safe-area-bottom">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setModalEstado(true)}
                    >
                        Cambiar Estado
                    </Button>
                    <Button
                        variant="danger"
                        size="icon"
                        onClick={() => setModalEliminar(true)}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Modal Nuevo Avance */}
            <Modal
                isOpen={modalAvance}
                onClose={() => setModalAvance(false)}
                title="Registrar Avance"
                variant="sheet"
            >
                <div className="space-y-4">
                    <div className="bg-surface-50 p-4 rounded-xl">
                        <p className="text-sm font-bold text-surface-700">
                            📅 {new Date().toLocaleDateString('es-CL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700">
                            ¿Qué se hizo hoy?
                        </label>
                        <textarea
                            placeholder="Describe el trabajo realizado, materiales usados, observaciones..."
                            value={nuevoAvanceDescripcion}
                            onChange={(e) => setNuevoAvanceDescripcion(e.target.value)}
                            className="w-full h-32 px-4 py-3 border-2 border-surface-200 rounded-xl resize-none focus:border-primary-500 focus:outline-none"
                        />
                    </div>

                    <Input
                        label="Porcentaje de avance (opcional)"
                        type="number"
                        placeholder="Ej: 50"
                        value={nuevoAvancePorcentaje}
                        onChange={(e) => setNuevoAvancePorcentaje(e.target.value)}
                        min="0"
                        max="100"
                    />

                    {/* Selector de fotos */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700">
                            Fotos del avance
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFotosChange}
                            className="hidden"
                        />

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {fotosSeleccionadas.map((foto, index) => (
                                <div
                                    key={index}
                                    className="w-20 h-20 rounded-xl bg-surface-100 flex-shrink-0 overflow-hidden relative"
                                >
                                    <img
                                        src={URL.createObjectURL(foto)}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setFotosSeleccionadas(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center"
                                    >
                                        <span className="text-white text-xs">×</span>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleSeleccionarFotos}
                                className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-300 flex-shrink-0 flex flex-col items-center justify-center text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                            >
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold">Añadir</span>
                            </button>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        onClick={handleAgregarAvance}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Guardar Avance
                    </Button>
                </div>
            </Modal>

            {/* Modal Cambiar Estado */}
            <Modal
                isOpen={modalEstado}
                onClose={() => setModalEstado(false)}
                title="Cambiar Estado"
                variant="sheet"
            >
                <div className="space-y-2">
                    {ESTADOS.map((estado) => {
                        const Icon = estado.icon;
                        const isActual = actividad.estado === estado.value;
                        return (
                            <button
                                key={estado.value}
                                onClick={() => handleCambiarEstado(estado.value)}
                                className={`
                  w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all
                  ${isActual
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-surface-200 hover:border-primary-300'
                                    }
                `}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${estado.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-surface-900">{estado.label}</span>
                                {isActual && (
                                    <CheckCircle className="w-5 h-5 text-primary-600 ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </Modal>

            {/* Modal Eliminar */}
            <Modal
                isOpen={modalEliminar}
                onClose={() => setModalEliminar(false)}
                title="Eliminar Actividad"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-error-600" />
                    </div>
                    <p className="text-surface-700 mb-2">
                        ¿Estás seguro de eliminar esta actividad?
                    </p>
                    <p className="text-sm text-surface-500 mb-6">
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setModalEliminar(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" fullWidth onClick={handleEliminar}>
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ActividadDetallePage;
