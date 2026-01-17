/**
 * OptiObra - Página Registro de Horas (HLA)
 * Formulario para registrar horas laborales de trabajadores
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Save,
  Clock
} from 'lucide-react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Button, 
  Input,
  Select,
  Textarea
} from '@/components/ui';
import { useObraStore, useTrabajadorStore } from '@/stores';
import { registrosHoraRepo } from '@/database/db';
import { toast } from '@/stores/uiStore';
import type { TipoHora } from '@/types';

const horaSchema = z.object({
  obraId: z.string().min(1, 'Selecciona una obra'),
  trabajadorId: z.string().min(1, 'Selecciona un trabajador'),
  fecha: z.string().min(1, 'Selecciona la fecha'),
  horaInicio: z.string().min(1, 'Requerido'),
  horaFin: z.string().min(1, 'Requerido'),
  tipo: z.enum(['normal', 'extra', 'nocturna', 'festivo']),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
});

type HoraFormData = z.infer<typeof horaSchema>;

const tiposHora: { value: TipoHora; label: string; descripcion: string }[] = [
  { value: 'normal', label: 'Normal', descripcion: 'Horas ordinarias' },
  { value: 'extra', label: 'Extra', descripcion: 'Horas extraordinarias' },
  { value: 'nocturna', label: 'Nocturna', descripcion: 'Horas nocturnas' },
  { value: 'festivo', label: 'Festivo', descripcion: 'Horas en días festivos' },
];

export function NuevaHoraPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get('obraId');
  const trabajadorIdParam = searchParams.get('trabajadorId');
  
  const { obras, cargarObras } = useObraStore();
  const { trabajadores, cargarTrabajadores } = useTrabajadorStore();
  const [horasTotales, setHorasTotales] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HoraFormData>({
    resolver: zodResolver(horaSchema),
    defaultValues: {
      obraId: obraIdParam || '',
      trabajadorId: trabajadorIdParam || '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '17:00',
      tipo: 'normal',
    },
  });

  const watchObraId = watch('obraId');
  const watchHoraInicio = watch('horaInicio');
  const watchHoraFin = watch('horaFin');

  useEffect(() => {
    cargarObras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (watchObraId) {
      cargarTrabajadores(watchObraId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchObraId]);

  useEffect(() => {
    if (obraIdParam) setValue('obraId', obraIdParam);
    if (trabajadorIdParam) setValue('trabajadorId', trabajadorIdParam);
  }, [obraIdParam, trabajadorIdParam, setValue]);

  // Calcular horas totales
  useEffect(() => {
    if (watchHoraInicio && watchHoraFin) {
      const [horaIni, minIni] = watchHoraInicio.split(':').map(Number);
      const [horaFin, minFin] = watchHoraFin.split(':').map(Number);
      
      const inicioMinutos = horaIni * 60 + minIni;
      const finMinutos = horaFin * 60 + minFin;
      
      let diferencia = finMinutos - inicioMinutos;
      if (diferencia < 0) diferencia += 24 * 60; // Si cruza medianoche
      
      const horas = diferencia / 60;
      setHorasTotales(Math.round(horas * 100) / 100);
    }
  }, [watchHoraInicio, watchHoraFin]);

  const onSubmit = async (data: HoraFormData) => {
    try {
      await registrosHoraRepo.create({
        ...data,
        horasTotales,
        aprobado: false,
      });

      toast.success('Registro de horas guardado exitosamente');
      navigate(`/horas?obraId=${data.obraId}`);
    } catch (error) {
      console.error('Error guardando registro:', error);
      toast.error('Error al guardar el registro de horas');
    }
  };

  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');

  return (
    <div className="container-page">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Registrar Horas Laborales
        </h1>
        <p className="text-gray-600 mt-1">
          Registra las horas trabajadas por un trabajador
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader title="Información del Registro" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Obra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('obraId')}
                  error={errors.obraId?.message}
                  disabled={!!obraIdParam}
                  options={[
                    { value: '', label: 'Selecciona una obra' },
                    ...obras.map((obra) => ({ value: obra.id!, label: obra.nombre }))
                  ]}
                />
              </div>

              {/* Trabajador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajador <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('trabajadorId')}
                  error={errors.trabajadorId?.message}
                  disabled={!watchObraId || !!trabajadorIdParam}
                  options={[
                    { value: '', label: 'Selecciona un trabajador' },
                    ...trabajadoresActivos.map((trabajador) => ({ value: trabajador.id!, label: trabajador.nombreCompleto }))
                  ]}
                />
                {!watchObraId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Primero selecciona una obra
                  </p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  {...register('fecha')}
                  error={errors.fecha?.message}
                />
              </div>

              {/* Tipo de Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Hora <span className="text-red-500">*</span>
                </label>
                <Select 
                  {...register('tipo')} 
                  error={errors.tipo?.message}
                  options={tiposHora.map((tipo) => ({
                    value: tipo.value,
                    label: `${tipo.label} - ${tipo.descripcion}`
                  }))}
                />
              </div>

              {/* Hora Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  {...register('horaInicio')}
                  error={errors.horaInicio?.message}
                />
              </div>

              {/* Hora Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  {...register('horaFin')}
                  error={errors.horaFin?.message}
                />
              </div>

              {/* Horas Totales Calculadas */}
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Horas Totales: <span className="text-2xl font-bold">{horasTotales.toFixed(2)}</span> horas
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Trabajo
                </label>
                <Textarea
                  {...register('descripcion')}
                  placeholder="Describe brevemente el trabajo realizado..."
                  rows={2}
                  error={errors.descripcion?.message}
                />
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <Textarea
                  {...register('observaciones')}
                  placeholder="Notas adicionales, incidencias, etc..."
                  rows={2}
                  error={errors.observaciones?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
          </Button>
        </div>
      </form>
    </div>
  );
}
