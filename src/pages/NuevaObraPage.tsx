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
  CardContent,
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
  { value: 'planificacion', label: 'En planificación' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'finalizada', label: 'Finalizada' },
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
        nombre: data.nombre,
        cliente: data.cliente,
        direccion: data.direccion,
        telefono: data.telefono,
        fechaInicio: data.fechaInicio,
        fechaEstimadaFin: data.fechaEstimadaFin || undefined,
        estado: data.estado as EstadoObra,
        presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : undefined,
        descripcion: data.descripcion,
      });
      toast.success('Obra creada exitosamente');
      navigate('/obras');
    } catch (error) {
      toast.error('Error al crear la obra');
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
          <h1 className="text-2xl font-bold text-surface-900">Nueva Obra</h1>
          <p className="text-surface-500">Crea un nuevo proyecto de construcción</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            {/* Nombre */}
            <Input
              label="Nombre de la obra"
              placeholder="Ej: Casa Pérez - Lo Barnechea"
              error={errors.nombre?.message}
              {...register('nombre')}
              required
            />

            {/* Cliente */}
            <Input
              label="Cliente"
              placeholder="Nombre del cliente o mandante"
              error={errors.cliente?.message}
              {...register('cliente')}
              required
            />

            {/* Dirección */}
            <Input
              label="Dirección"
              placeholder="Dirección completa de la obra"
              error={errors.direccion?.message}
              {...register('direccion')}
              required
            />

            {/* Teléfono */}
            <Input
              label="Teléfono de contacto"
              placeholder="+56 9 1234 5678"
              type="tel"
              error={errors.telefono?.message}
              {...register('telefono')}
            />

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha de inicio"
                type="date"
                error={errors.fechaInicio?.message}
                {...register('fechaInicio')}
                required
              />
              <Input
                label="Fecha estimada de término"
                type="date"
                error={errors.fechaEstimadaFin?.message}
                {...register('fechaEstimadaFin')}
              />
            </div>

            {/* Estado y Presupuesto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Estado"
                options={estadoOptions}
                error={errors.estado?.message}
                {...register('estado')}
                required
              />
              <Input
                label="Presupuesto (CLP)"
                type="number"
                placeholder="0"
                error={errors.presupuesto?.message}
                {...register('presupuesto')}
              />
            </div>

            {/* Descripción */}
            <Textarea
              label="Descripción"
              placeholder="Descripción general del proyecto..."
              rows={4}
              error={errors.descripcion?.message}
              {...register('descripcion')}
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
            {isSubmitting ? 'Guardando...' : 'Guardar Obra'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NuevaObraPage;
