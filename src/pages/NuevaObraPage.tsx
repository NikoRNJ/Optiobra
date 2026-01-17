/**
 * OptiObra - Página Nueva Obra
 * Formulario para crear una nueva obra
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  Select,
  Textarea
} from '@/components/ui';
import { useObraStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import type { EstadoObra } from '@/types';

// Schema de validación
const obraSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  cliente: z.string().min(2, 'Ingresa el nombre del cliente'),
  direccion: z.string().min(5, 'Ingresa la dirección de la obra'),
  telefono: z.string().optional(),
  fechaInicio: z.string().min(1, 'Selecciona la fecha de inicio'),
  fechaEstimadaFin: z.string().optional(),
  estado: z.enum(['planificacion', 'en_progreso', 'pausada', 'finalizada']),
  presupuesto: z.string().optional(),
  descripcion: z.string().optional(),
});

type ObraFormData = z.infer<typeof obraSchema>;

const estadoOptions = [
  { value: 'planificacion', label: 'PRE-EJECUCIÓN / PLAN' },
  { value: 'en_progreso', label: 'FASE CONSTRUCTIVA' },
  { value: 'pausada', label: 'DETENIDO / STANDBY' },
  { value: 'finalizada', label: 'ENTREGA FINALIZADA' },
];

export function NuevaObraPage() {
  const navigate = useNavigate();
  const { crearObra } = useObraStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      estado: 'planificacion',
      fechaInicio: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ObraFormData) => {
    setIsSubmitting(true);
    try {
      await crearObra({
        nombre: data.nombre.toUpperCase(),
        cliente: data.cliente.toUpperCase(),
        direccion: data.direccion.toUpperCase(),
        telefono: data.telefono,
        fechaInicio: data.fechaInicio,
        fechaEstimadaFin: data.fechaEstimadaFin || undefined,
        estado: data.estado as EstadoObra,
        presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : undefined,
        descripcion: data.descripcion,
      });
      toast.success('EXPEDIENTE DE OBRA GENERADO');
      navigate('/obras');
    } catch (error) {
      toast.error('ERROR EN EL REGISTRO');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full px-4 py-6 pb-20 space-y-6 max-w-3xl mx-auto">
      {/* Header Premium Industrial */}
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
                Planificación Maestra
              </span>
              <h1 className="text-2xl font-black text-surface-900 leading-tight uppercase tracking-tighter">
                Apertura de Proyecto
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Industrial */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white border-none shadow-sm" padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-primary-500 rounded-full" />
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Parámetros del Expediente</h3>
          </div>

          <div className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Denominación de Obra</label>
                <Input
                placeholder="EJ: CASA PÉREZ - LO BARNECHEA"
                error={errors.nombre?.message}
                className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                {...register('nombre')}
                required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Mandante / Cliente</label>
                    <Input
                    placeholder="INGRESAR TITULAR"
                    error={errors.cliente?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                    {...register('cliente')}
                    required
                    />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Contacto Directo</label>
                    <Input
                    placeholder="+56 9 XXXX XXXX"
                    type="tel"
                    error={errors.telefono?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('telefono')}
                    />
                </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Ubicación Geográfica</label>
                <Input
                placeholder="DIRECCIÓN COMPLETA DE LA FAENA"
                error={errors.direccion?.message}
                className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                {...register('direccion')}
                required
                />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Arribo a Terreno</label>
                <Input
                    type="date"
                    error={errors.fechaInicio?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('fechaInicio')}
                    required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Entrega Estimada</label>
                <Input
                    type="date"
                    error={errors.fechaEstimadaFin?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('fechaEstimadaFin')}
                />
              </div>
            </div>

            {/* Estado y Presupuesto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Fase Operativa Inicial</label>
                <Select
                    options={estadoOptions}
                    error={errors.estado?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-[10px] uppercase"
                    {...register('estado')}
                    required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Presupuesto Proyectado (CLP)</label>
                <Input
                    type="number"
                    placeholder="0"
                    error={errors.presupuesto?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('presupuesto')}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Memoria Descriptiva del Proyecto</label>
                <Textarea
                placeholder="DETALLES TÉCNICOS Y ALCANCE DE LOS TRABAJOS..."
                rows={4}
                error={errors.descripcion?.message}
                className="bg-surface-50 border-surface-100 font-bold text-xs uppercase focus:ring-2 focus:ring-primary-500/20"
                {...register('descripcion')}
                />
            </div>
          </div>
        </Card>

        {/* Tactical Submit Industrial */}
        <div className="pt-4">
            <Button
            type="submit"
            isLoading={isSubmitting}
            className="h-16 w-full rounded-[2rem] bg-surface-900 text-white hover:bg-surface-800 font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all active:scale-[0.98]"
            leftIcon={isSubmitting ? undefined : <Save className="w-5 h-5 text-primary-400" />}
            >
            {isSubmitting ? 'PROCESANDO EXPEDIENTE...' : 'CONFIRMAR APERTURA DE OBRA'}
            </Button>
            <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest text-center mt-4 px-6 leading-relaxed">
                AL CONFIRMAR, SE GENERARÁ UN NUEVO EXPEDIENTE DIGITAL Y SE HABILITARÁN LAS HERRAMIENTAS DE GESTIÓN LOGÍSTICA PARA ESTE PROYECTO.
            </p>
        </div>
      </form>
    </div>
  );
}

export default NuevaObraPage;
