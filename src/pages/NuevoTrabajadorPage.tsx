/**
 * OptiObra - Página Nuevo Trabajador
 * Formulario para agregar un trabajador a una obra
 */

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  Select,
  Textarea
} from '@/components/ui';
import { useTrabajadorStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import { LABORES_TRABAJADOR, validateRut } from '@/utils';
import type { LaborTrabajador, EstadoTrabajador } from '@/types';

// Schema de validación
const trabajadorSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rut: z.string().optional().refine((val) => !val || validateRut(val), {
    message: 'RUT inválido',
  }),
  labor: z.string().min(1, 'Selecciona una labor'),
  laborPersonalizada: z.string().optional(),
  fechaIngreso: z.string().min(1, 'Selecciona la fecha de ingreso'),
  fechaSalida: z.string().optional(),
  telefono: z.string().optional(),
  contactoEmergencia: z.string().optional(),
  observaciones: z.string().optional(),
});

type TrabajadorFormData = z.infer<typeof trabajadorSchema>;

// Opciones de labor para el select
const laborOptions = Object.entries(LABORES_TRABAJADOR).map(([value, label]) => ({
  value,
  label,
}));

export function NuevoTrabajadorPage() {
  const { id: obraId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { crearTrabajador } = useTrabajadorStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoContrato, setFotoContrato] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TrabajadorFormData>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: {
      fechaIngreso: new Date().toISOString().split('T')[0],
    },
  });

  const selectedLabor = watch('labor');

  // Manejar selección de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Límite de 5MB excedido');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoContrato(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFotoContrato(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: TrabajadorFormData) => {
    if (!obraId) {
      toast.error('ID DE OBRA NO DETECTADO');
      return;
    }

    setIsSubmitting(true);
    try {
      await crearTrabajador({
        obraId,
        nombreCompleto: data.nombreCompleto.toUpperCase(),
        rut: data.rut,
        labor: data.labor as LaborTrabajador,
        laborPersonalizada: data.labor === 'otro' ? data.laborPersonalizada?.toUpperCase() : undefined,
        fechaIngreso: data.fechaIngreso,
        fechaSalida: data.fechaSalida || undefined,
        estado: 'activo' as EstadoTrabajador,
        fotoContrato: fotoContrato || undefined,
        telefono: data.telefono,
        contactoEmergencia: data.contactoEmergencia,
        observaciones: data.observaciones,
      });
      toast.success('PERSONAL REGISTRADO CORRECTAMENTE');
      navigate(`/obras/${obraId}`);
    } catch (error) {
      toast.error('ERROR EN EL REGISTRO DE PERSONAL');
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
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white border border-surface-200 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-surface-900" />
            </Button>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-1 block">
                Gestión de Capital Humano
              </span>
              <h1 className="text-2xl font-black text-surface-900 leading-tight uppercase tracking-tighter">
                Alta de Personal
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Industrial */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white border-none shadow-sm" padding="lg">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-6 bg-purple-500 rounded-full" />
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Ficha Técnica del Operador</h3>
          </div>

          <div className="space-y-6">
            {/* Foto del contrato */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                Documentación Contractual (Digital)
              </label>
              
              {fotoContrato ? (
                <div className="relative w-full aspect-video sm:aspect-[21/9] bg-surface-50 rounded-2xl overflow-hidden border-2 border-surface-100 group">
                  <img
                    src={fotoContrato}
                    alt="Foto del contrato"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-surface-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeFoto}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl transition-transform active:scale-90"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-contrato"
                  />
                  <label
                    htmlFor="foto-contrato"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-surface-100 rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                  >
                    <Upload className="w-8 h-8 text-surface-300 group-hover:text-purple-500 transition-colors mb-2" />
                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                      Vincular Captura de Contrato
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Nombre completo */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Nombres y Apellidos</label>
                <Input
                placeholder="EJ: JUAN IGNACIO PÉREZ GÓMEZ"
                error={errors.nombreCompleto?.message}
                className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                {...register('nombreCompleto')}
                required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RUT */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Identificación (RUT)</label>
                    <Input
                    placeholder="12.345.678-K"
                    error={errors.rut?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('rut')}
                    />
                </div>

                {/* Labores */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Especialidad Operativa</label>
                    <Select
                    options={laborOptions}
                    error={errors.labor?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-[10px] uppercase"
                    {...register('labor')}
                    required
                    />
                </div>
            </div>

            {selectedLabor === 'otro' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Especificar Especialidad</label>
                <Input
                  placeholder="EJ: TOPÓGRAFO / ELECTROMECÁNICO"
                  error={errors.laborPersonalizada?.message}
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                  {...register('laborPersonalizada')}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                    <Input
                    placeholder="+56 9 XXXX XXXX"
                    type="tel"
                    error={errors.telefono?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('telefono')}
                    />
                </div>

                {/* Contacto Emergencia */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Contacto de Emergencia</label>
                    <Input
                    placeholder="NOMBRE / TELÉFONO"
                    error={errors.contactoEmergencia?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                    {...register('contactoEmergencia')}
                    />
                </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Inicio de Actividades</label>
                <Input
                    type="date"
                    error={errors.fechaIngreso?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                    {...register('fechaIngreso')}
                    required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Cese de Actividades (Opcional)</label>
                <Input
                    type="date"
                    error={errors.fechaSalida?.message}
                    className="h-12 border-surface-100 bg-surface-50 font-black text-xs text-surface-400"
                    {...register('fechaSalida')}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Antecedentes Adicionales / Notas</label>
                <Textarea
                placeholder="REQUERIMIENTOS ESPECIALES, CERTIFICACIONES, ETC..."
                rows={3}
                error={errors.observaciones?.message}
                className="bg-surface-50 border-surface-100 font-bold text-xs uppercase focus:ring-2 focus:ring-purple-500/20"
                {...register('observaciones')}
                />
            </div>
          </div>
        </Card>

        {/* Tactical Submit */}
        <div className="pt-4">
            <Button
            type="submit"
            isLoading={isSubmitting}
            className="h-16 w-full rounded-[2rem] bg-surface-900 text-white hover:bg-surface-800 font-black text-sm tracking-[0.2em] uppercase shadow-2xl transition-all active:scale-[0.98]"
            leftIcon={isSubmitting ? undefined : <Save className="w-5 h-5 text-purple-400" />}
            >
            {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR TRABAJADOR'}
            </Button>
            <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest text-center mt-4 px-6 leading-relaxed">
                AL REGISTRAR, EL TRABAJADOR SERÁ VINCULADO AL PROYECTO ACTUAL Y SE INICIARÁ SU CONTROL DE ASISTENCIA Y RENDIMIENTO OPERATIVO.
            </p>
        </div>
      </form>
    </div>
  );
}

export default NuevoTrabajadorPage;
