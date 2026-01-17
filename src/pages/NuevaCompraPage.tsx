/**
 * OptiObra - Página Nueva Compra
 * Formulario para registrar compras de materiales
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Save,
  Plus,
  Trash2
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
import { useObraStore } from '@/stores/obraStore';
import { comprasRepo } from '@/database/db';
import { toast } from '@/stores/uiStore';
import { formatCurrency } from '@/utils';
import type { Compra, ItemCompra, UnidadMedida } from '@/types';

const itemSchema = z.object({
  descripcion: z.string().min(1, 'Requerido'),
  cantidad: z.number().positive('Mayor a 0'),
  unidad: z.string().min(1, 'Requerido'),
  precioUnitario: z.number().min(0, 'Mínimo 0'),
});

const compraSchema = z.object({
  obraId: z.string().min(1, 'Selecciona una obra'),
  proveedor: z.string().min(2, 'Mínimo 2 caracteres'),
  fecha: z.string().min(1, 'Selecciona la fecha'),
  numeroFactura: z.string().optional(),
  estado: z.enum(['pendiente', 'pagada', 'entregada', 'cancelada']),
  notas: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un item'),
});

type CompraFormData = z.infer<typeof compraSchema>;

const unidadesMaterial = [
  { value: 'un', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'm', label: 'Metros' },
  { value: 'm2', label: 'Metros²' },
  { value: 'm3', label: 'Metros³' },
  { value: 'lt', label: 'Litros' },
  { value: 'saco', label: 'Sacos' },
  { value: 'bolsa', label: 'Bolsas' },
  { value: 'pallet', label: 'Pallets' },
  { value: 'caja', label: 'Cajas' },
];

export function NuevaCompraPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get('obraId');
  
  const { obras, cargarObras } = useObraStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      obraId: obraIdParam || '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      items: [{ descripcion: '', cantidad: 1, unidad: 'un', precioUnitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    cargarObras();
    if (obraIdParam) {
      setValue('obraId', obraIdParam);
    }
  }, [obraIdParam]);

  const watchItems = watch('items');

  // Calcular totales
  const subtotales = watchItems.map(item => 
    (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0)
  );
  const total = subtotales.reduce((sum, st) => sum + st, 0);

  const agregarItem = () => {
    append({ descripcion: '', cantidad: 1, unidad: 'un', precioUnitario: 0 });
  };

  const onSubmit = async (data: CompraFormData) => {
    try {
      const items: ItemCompra[] = data.items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidad: item.unidad as UnidadMedida,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      }));

      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const iva = Math.round(subtotal * 0.19);
      const totalCompra = subtotal + iva;

      const compraData: Omit<Compra, 'id' | 'createdAt' | 'updatedAt'> = {
        obraId: data.obraId,
        proveedor: data.proveedor,
        fecha: data.fecha,
        numeroFactura: data.numeroFactura || undefined,
        estado: data.estado,
        notas: data.notas || undefined,
        items,
        subtotal,
        iva,
        total: totalCompra,
      };

      await comprasRepo.create(compraData);
      toast.success('Compra registrada correctamente');
      
      if (obraIdParam) {
        navigate(`/obras/${obraIdParam}?tab=compras`);
      } else {
        navigate('/compras');
      }
    } catch (error) {
      toast.error('Error al guardar la compra');
      console.error(error);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-surface-900">
            Nueva Compra
          </h1>
          <p className="text-sm text-surface-500">
            Registra una compra de materiales
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos de la compra */}
        <Card>
          <CardHeader title="Información de la Compra" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Obra"
                options={[
                  { value: '', label: 'Selecciona una obra...' },
                  ...obras.map(o => ({ value: o.id!, label: o.nombre }))
                ]}
                error={errors.obraId?.message}
                required
                {...register('obraId')}
              />
              <Input
                label="Proveedor"
                placeholder="Ej: Ferretería Construmart"
                error={errors.proveedor?.message}
                required
                {...register('proveedor')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Fecha"
                type="date"
                error={errors.fecha?.message}
                required
                {...register('fecha')}
              />
              <Input
                label="N° Factura / Boleta"
                placeholder="Opcional"
                {...register('numeroFactura')}
              />
              <Select
                label="Estado"
                options={[
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'pagada', label: 'Pagada' },
                  { value: 'entregada', label: 'Entregada' },
                ]}
                {...register('estado')}
              />
            </div>

            <Textarea
              label="Notas"
              placeholder="Observaciones adicionales..."
              rows={2}
              {...register('notas')}
            />
          </CardContent>
        </Card>

        {/* Items de la compra */}
        <Card>
          <CardHeader 
            title="Materiales" 
            action={
              <Button 
                type="button"
                size="sm"
                variant="outline"
                onClick={agregarItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            }
          />
          <CardContent>
            {errors.items?.message && (
              <p className="text-sm text-red-500 mb-4">{errors.items.message}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div 
                  key={field.id}
                  className="p-4 bg-surface-50 rounded-lg border border-surface-200"
                >
                  <div className="grid grid-cols-12 gap-3">
                    {/* Descripción */}
                    <div className="col-span-12 sm:col-span-5">
                      <Input
                        label={index === 0 ? "Material" : undefined}
                        placeholder="Ej: Cemento Melón"
                        error={errors.items?.[index]?.descripcion?.message}
                        {...register(`items.${index}.descripcion`)}
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        label={index === 0 ? "Cantidad" : undefined}
                        type="number"
                        step="0.01"
                        placeholder="1"
                        error={errors.items?.[index]?.cantidad?.message}
                        {...register(`items.${index}.cantidad`)}
                      />
                    </div>

                    {/* Unidad */}
                    <div className="col-span-4 sm:col-span-2">
                      <Select
                        label={index === 0 ? "Unidad" : undefined}
                        options={unidadesMaterial}
                        {...register(`items.${index}.unidad`)}
                      />
                    </div>

                    {/* Precio unitario */}
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        label={index === 0 ? "Precio" : undefined}
                        type="number"
                        placeholder="0"
                        error={errors.items?.[index]?.precioUnitario?.message}
                        {...register(`items.${index}.precioUnitario`)}
                      />
                    </div>

                    {/* Delete */}
                    <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="mt-2 text-right text-sm text-surface-500">
                    Subtotal: <span className="font-semibold font-numeric text-surface-700">
                      {formatCurrency(subtotales[index] || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-surface-700">
                  Total de la Compra
                </span>
                <span className="text-2xl font-bold font-numeric text-primary-700">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Compra'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NuevaCompraPage;
