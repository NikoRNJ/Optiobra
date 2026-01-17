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
    Modal,
    Input,
} from '@/components/ui';
import { useActividadStore, useObraStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import { formatDate } from '@/utils';
import type { Actividad, AvanceActividad, EstadoActividad } from '@/types';
import { db, generateId, now } from '@/database/db';

const ESTADOS: { value: EstadoActividad; label: string; color: string; icon: typeof CheckCircle }[] = [
    { value: 'pendiente', label: 'PENDIENTE', color: 'bg-surface-100 text-surface-600 border-surface-200', icon: Clock },
    { value: 'en_progreso', label: 'EN EJECUCIÓN', color: 'bg-primary-50 text-primary-700 border-primary-100', icon: Play },
    { value: 'completada', label: 'COMPLETADA', color: 'bg-success-50 text-success-700 border-success-100', icon: CheckCircle },
    { value: 'cancelada', label: 'CANCELADA', color: 'bg-error-50 text-error-700 border-error-100', icon: AlertCircle },
];

function AvanceCard({ avance }: { avance: AvanceActividad }) {
    const fecha = new Date(avance.fecha);

    return (
        <div className="relative pl-8 pb-8 last:pb-0 group">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-6 bottom-0 w-1 bg-surface-100 group-last:hidden" />

            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border-2 border-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary-600" />
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mb-1">
                            {fecha.toLocaleDateString('es-CL', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">
                            REGISTRO: {fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {avance.porcentajeAvance !== undefined && (
                        <div className="bg-success-50 px-2 py-1 rounded-lg border border-success-100">
                            <span className="text-[10px] font-black text-success-700">
                                {avance.porcentajeAvance}% RENDIMIENTO
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-xs font-medium text-surface-600 leading-relaxed mb-4 uppercase tracking-tight">
                    {avance.descripcion}
                </p>

                {/* Fotos del avance */}
                {avance.multimedia.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {avance.multimedia.map((media) => (
                            <div
                                key={media.id}
                                className="w-24 h-24 rounded-xl bg-surface-100 flex-shrink-0 overflow-hidden border border-surface-200"
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
            </div>
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
        <div className="min-h-full px-4 py-6 pb-40 space-y-6">
            {/* Header Industrial */}
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-white border border-surface-200 shadow-sm flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-surface-900" />
                        </Button>
                        <div className="min-w-0">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
                                Detalle de Operación
                            </span>
                            <h1 className="text-2xl font-black text-surface-900 leading-tight">
                                {actividad.titulo}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button 
                        onClick={() => setModalEstado(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${estadoActual?.color}`}
                    >
                        <IconEstado className="w-3.5 h-3.5" />
                        {estadoActual?.label}
                    </button>
                    {actividad.esActividadLarga && (
                        <div className="bg-surface-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 text-primary-400" />
                            LARGA DURACIÓN
                        </div>
                    )}
                </div>

                {/* Industrial Progress Bar */}
                <Card className="bg-white border-none shadow-sm" padding="lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Progreso Temporal</span>
                        </div>
                        <span className="text-sm font-black text-primary-600 font-numeric">{Math.round(progresoTiempo)}%</span>
                    </div>
                    <div className="h-3 bg-surface-50 rounded-full overflow-hidden border border-surface-100 p-0.5">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                            style={{ width: `${Math.min(progresoTiempo, 100)}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100 mb-3">
                        <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Duración</p>
                    <p className="text-xl font-black text-surface-900 leading-none">{actividad.duracionDias} DÍAS</p>
                </div>
                
                <div className={`p-4 rounded-3xl border shadow-sm flex flex-col items-center transition-colors ${diasRestantes <= 3 ? 'bg-accent-50 border-accent-100' : 'bg-white border-surface-100'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-3 ${diasRestantes <= 3 ? 'bg-accent-100 border-accent-200' : 'bg-surface-50 border-surface-100'}`}>
                        <Clock className={`w-5 h-5 ${diasRestantes <= 3 ? 'text-accent-600' : 'text-surface-600'}`} />
                    </div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Balance</p>
                    <p className={`text-xl font-black leading-none ${diasRestantes <= 3 ? 'text-accent-700' : 'text-surface-900'}`}>
                        {diasRestantes > 0 ? `${diasRestantes} DÍAS` : 'VENCIDA'}
                    </p>
                </div>
            </div>

            {/* Logistics Timeline */}
            <Card className="bg-white border-none shadow-sm" padding="lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">INICIO</p>
                        <p className="text-xs font-black text-surface-900">{formatDate(actividad.fechaInicio).toUpperCase()}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <div className="h-0.5 bg-surface-100 relative">
                            <div className="absolute -top-1 left-0 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white shadow-sm" />
                            <div className="absolute -top-1 right-0 w-2.5 h-2.5 rounded-full bg-surface-300 border-2 border-white shadow-sm" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">TÉRMINO</p>
                        <p className="text-xs font-black text-surface-900">{formatDate(actividad.fechaFin).toUpperCase()}</p>
                    </div>
                </div>
            </Card>

            {/* Description & Project */}
            <div className="space-y-4">
                {actividad.descripcion && (
                    <Card className="bg-white border-none shadow-sm" padding="lg">
                        <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">Términos de Referencia</h3>
                        <p className="text-sm font-medium text-surface-600 leading-relaxed uppercase tracking-tight">
                            {actividad.descripcion}
                        </p>
                    </Card>
                )}

                {obraAsociada && (
                    <button 
                        onClick={() => navigate(`/obras/${obraAsociada.id}`)}
                        className="w-full bg-surface-900 p-4 rounded-3xl flex items-center gap-4 transition-transform active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                            <Building2 className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Proyecto Vinculado</p>
                            <p className="font-black text-white text-sm uppercase truncate">{obraAsociada.nombre}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30" />
                    </button>
                )}
            </div>

            {/* Industrial Feed / Historial de Avances */}
            {actividad.esActividadLarga && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-primary-500 rounded-full" />
                            <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Historial de Operación</h3>
                        </div>
                        <Button
                            size="sm"
                            className="rounded-xl h-9 font-black text-[10px] tracking-widest uppercase"
                            onClick={() => setModalAvance(true)}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Registrar
                        </Button>
                    </div>

                    {(!actividad.avances || actividad.avances.length === 0) ? (
                        <div className="bg-white border-2 border-dashed border-surface-100 rounded-[2rem] py-12 px-6 text-center group">
                            <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-4 border border-surface-100 transition-transform group-hover:scale-110">
                                <Image className="w-10 h-10 text-surface-200" />
                            </div>
                            <p className="text-xs font-black text-surface-400 uppercase tracking-widest mb-6">Sin registros de campo</p>
                            <Button
                                variant="outline"
                                className="border-primary-200 text-primary-600 font-black text-[10px] tracking-widest uppercase"
                                onClick={() => setModalAvance(true)}
                            >
                                Iniciar Bitácora
                            </Button>
                        </div>
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

            {/* Tactical Footer Actions */}
            <div className="fixed bottom-20 left-4 right-4 z-40">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-[2.5rem] border border-surface-100 shadow-2xl flex gap-3">
                    <Button
                        className="flex-1 h-14 rounded-[1.75rem] font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-primary-500/20"
                        onClick={() => setModalEstado(true)}
                    >
                        Gestionar Estado
                    </Button>
                    <Button
                        variant="danger"
                        className="w-14 h-14 rounded-[1.75rem] flex items-center justify-center flex-shrink-0"
                        onClick={() => setModalEliminar(true)}
                    >
                        <Trash2 className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Modal Nuevo Avance */}
            <Modal
                isOpen={modalAvance}
                onClose={() => setModalAvance(false)}
                title="REGISTRO DE CAMPO"
                variant="sheet"
            >
                <div className="space-y-6">
                    <div className="bg-surface-900 p-4 rounded-2xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary-400" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                            FECHA: {new Date().toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            }).toUpperCase()}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                            BITÁCORA DE TRABAJO
                        </label>
                        <textarea
                            placeholder="DESCRIBA LA LABOR EJECUTADA, MATERIALES UTILIZADOS Y OBSERVACIONES TÉCNICAS..."
                            value={nuevoAvanceDescripcion}
                            onChange={(e) => setNuevoAvanceDescripcion(e.target.value)}
                            className="w-full h-40 px-5 py-4 bg-surface-50 border border-surface-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-xs font-bold uppercase tracking-tight placeholder:text-surface-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                            AVANCE ESTIMADO (%)
                        </label>
                        <Input
                            type="number"
                            placeholder="0 - 100"
                            value={nuevoAvancePorcentaje}
                            onChange={(e) => setNuevoAvancePorcentaje(e.target.value)}
                            className="h-12 border-surface-100 bg-surface-50 font-black text-sm"
                            min="0"
                            max="100"
                        />
                    </div>

                    {/* Selector de fotos */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                            EVIDENCIA FOTOGRÁFICA
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFotosChange}
                            className="hidden"
                        />

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={handleSeleccionarFotos}
                                className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 flex-shrink-0 flex flex-col items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors"
                            >
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[8px] font-black uppercase tracking-widest">AÑADIR</span>
                            </button>
                            {fotosSeleccionadas.map((foto, index) => (
                                <div
                                    key={index}
                                    className="w-20 h-20 rounded-2xl bg-surface-100 flex-shrink-0 overflow-hidden relative border border-surface-200"
                                >
                                    <img
                                        src={URL.createObjectURL(foto)}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setFotosSeleccionadas(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center shadow-lg transform active:scale-90"
                                    >
                                        <span className="text-white text-[10px] font-bold">×</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        fullWidth
                        className="h-14 rounded-2xl font-black text-xs tracking-[0.2em] uppercase mt-4"
                        onClick={handleAgregarAvance}
                    >
                        REGISTRAR AVANCE
                    </Button>
                </div>
            </Modal>

            {/* Modal Cambiar Estado */}
            <Modal
                isOpen={modalEstado}
                onClose={() => setModalEstado(false)}
                title="ESTADO DE OPERACIÓN"
                variant="sheet"
            >
                <div className="grid grid-cols-1 gap-3">
                    {ESTADOS.map((estado) => {
                        const Icon = estado.icon;
                        const isActual = actividad.estado === estado.value;
                        return (
                            <button
                                key={estado.value}
                                onClick={() => handleCambiarEstado(estado.value)}
                                className={`
                                    w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all
                                    ${isActual
                                        ? 'border-primary-600 bg-primary-50 shadow-md scale-[1.02]'
                                        : 'border-surface-100 hover:border-primary-200 bg-white shadow-sm'
                                    }
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${estado.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-left flex-1">
                                    <span className="font-black text-xs uppercase tracking-widest text-surface-900 block">{estado.label}</span>
                                    <span className="text-[9px] font-bold text-surface-400 uppercase tracking-tighter">ACTUALIZAR ESTADO A ESTA FASE</span>
                                </div>
                                {isActual && (
                                    <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
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
                title="SISTEMA DE SEGURIDAD"
            >
                <div className="text-center py-6">
                    <div className="w-20 h-20 rounded-3xl bg-error-50 flex items-center justify-center mx-auto mb-6 border border-error-100 shadow-sm">
                        <Trash2 className="w-10 h-10 text-error-600" />
                    </div>
                    <h4 className="text-lg font-black text-surface-900 uppercase tracking-tight mb-2">Eliminar Registro</h4>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-8 px-4">
                        Esta acción purgará de forma permanente los datos de esta operación.
                    </p>
                    <div className="flex gap-3 px-2">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => setModalEliminar(false)}
                        >
                            CANCELAR
                        </Button>
                        <Button 
                            variant="danger" 
                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-error-200"
                            onClick={handleEliminar}
                        >
                            SÍ, ELIMINAR
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );

}

export default ActividadDetallePage;
