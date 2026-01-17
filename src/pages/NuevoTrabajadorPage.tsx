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
  CardContent,
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
        toast.error('La imagen no debe superar los 5MB');
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
      toast.error('Error: No se encontró la obra');
      return;
    }

    setIsSubmitting(true);
    try {
      await crearTrabajador({
        obraId,
        nombreCompleto: data.nombreCompleto,
        rut: data.rut,
        labor: data.labor as LaborTrabajador,
        laborPersonalizada: data.labor === 'otro' ? data.laborPersonalizada : undefined,
        fechaIngreso: data.fechaIngreso,
        fechaSalida: data.fechaSalida || undefined,
        estado: 'activo' as EstadoTrabajador,
        fotoContrato: fotoContrato || undefined,
        telefono: data.telefono,
        contactoEmergencia: data.contactoEmergencia,
        observaciones: data.observaciones,
      });
      toast.success('Trabajador agregado exitosamente');
      navigate(`/obras/${obraId}`);
    } catch (error) {
      toast.error('Error al agregar trabajador');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Nuevo Trabajador</h1>
          <p className="text-surface-500">Agrega un trabajador a la obra</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            {/* Foto del contrato */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Foto del contrato (opcional)
              </label>
              
              {fotoContrato ? (
                <div className="relative w-full max-w-xs">
                  <img
                    src={fotoContrato}
                    alt="Foto del contrato"
                    className="w-full h-48 object-cover rounded-lg border border-surface-200"
                  />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-surface-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-surface-400" />
                    <span className="text-sm text-surface-600">
                      Subir imagen
                    </span>
                  </label>
                </div>
              )}
              <p className="text-xs text-surface-500 mt-1">
                Máximo 5MB. Formatos: JPG, PNG
              </p>
            </div>

            {/* Nombre completo */}
            <Input
              label="Nombre completo"
              placeholder="Ej: Juan Pérez González"
              error={errors.nombreCompleto?.message}
              {...register('nombreCompleto')}
              required
            />

            {/* RUT */}
            <Input
              label="RUT"
              placeholder="12.345.678-9"
              error={errors.rut?.message}
              {...register('rut')}
              hint="Formato: 12.345.678-9"
            />

            {/* Labor */}
            <Select
              label="Labor"
              options={laborOptions}
              placeholder="Selecciona una labor"
              error={errors.labor?.message}
              {...register('labor')}
              required
            />

            {/* Labor personalizada (si selecciona "otro") */}
            {selectedLabor === 'otro' && (
              <Input
                label="Especificar labor"
                placeholder="Describe la labor"
                error={errors.laborPersonalizada?.message}
                {...register('laborPersonalizada')}
                required
              />
            )}

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha de ingreso"
                type="date"
                error={errors.fechaIngreso?.message}
                {...register('fechaIngreso')}
                required
              />
              <Input
                label="Fecha de salida (opcional)"
                type="date"
                error={errors.fechaSalida?.message}
                {...register('fechaSalida')}
                hint="Dejar vacío si es indefinido"
              />
            </div>

            {/* Teléfonos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                error={errors.telefono?.message}
                {...register('telefono')}
              />
              <Input
                label="Contacto de emergencia"
                type="tel"
                placeholder="+56 9 1234 5678"
                error={errors.contactoEmergencia?.message}
                {...register('contactoEmergencia')}
              />
            </div>

            {/* Observaciones */}
            <Textarea
              label="Observaciones"
              placeholder="Notas adicionales sobre el trabajador..."
              rows={3}
              error={errors.observaciones?.message}
              {...register('observaciones')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={isSubmitting ? undefined : <Save className="w-4 h-4" />}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Trabajador'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NuevoTrabajadorPage;
