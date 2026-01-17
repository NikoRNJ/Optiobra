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
    <div className="min-h-full px-4 py-6 pb-20 space-y-6 max-w-4xl mx-auto">
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
                Gestión de Suministros
              </span>
              <h1 className="text-2xl font-black text-surface-900 leading-tight uppercase tracking-tighter">
                Registro de Adquisición
              </h1>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logistics Data Card */}
        <Card className="bg-white border-none shadow-sm" padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-primary-500 rounded-full" />
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Protocolo de Compra</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Proyecto de Asignación</label>
                <Select
                  options={[
                    { value: '', label: 'SELECCIONE OBRA DE DESTINO...' },
                    ...obras.map(o => ({ value: o.id!, label: o.nombre.toUpperCase() }))
                  ]}
                  error={errors.obraId?.message}
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                  required
                  {...register('obraId')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Entidad Proveedora</label>
                <Input
                  placeholder="EJ: FERRETERÍA CONSTRUMART"
                  error={errors.proveedor?.message}
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                  required
                  {...register('proveedor')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Fecha de Operación</label>
                <Input
                  type="date"
                  error={errors.fecha?.message}
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs"
                  required
                  {...register('fecha')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Folio Documento</label>
                <Input
                  placeholder="FACTURA / BOLETA"
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                  {...register('numeroFactura')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Estado de Pago</label>
                <Select
                  options={[
                    { value: 'pendiente', label: '⏳ PENDIENTE' },
                    { value: 'pagada', label: '✅ PAGADA' },
                    { value: 'entregada', label: '📦 ENTREGADA' },
                  ]}
                  className="h-12 border-surface-100 bg-surface-50 font-black text-xs uppercase"
                  {...register('estado')}
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Notas Logísticas</label>
                <Textarea
                placeholder="OBSERVACIONES TÉCNICAS SOBRE LA COMPRA..."
                rows={2}
                className="bg-surface-50 border-surface-100 font-bold text-xs uppercase transition-all focus:ring-2 focus:ring-primary-500/20"
                {...register('notes' as any)} // Fixed potential naming issue if existed, adjusting name consistency
                />
            </div>
          </div>
        </Card>

        {/* Dynamic Items Industrial List */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-accent-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Manifiesto de Carga</h3>
                </div>
                <Button 
                    type="button"
                    size="sm"
                    className="h-9 rounded-xl font-black text-[10px] tracking-widest uppercase bg-surface-900 text-white"
                    onClick={() => append({ descripcion: '', cantidad: 1, unidad: 'un', precioUnitario: 0 })}
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    ANEXAR ITEM
                </Button>
            </div>

            {errors.items?.message && (
              <p className="text-[10px] font-black text-error-600 bg-error-50 p-3 rounded-xl border border-error-100 uppercase tracking-widest text-center">{errors.items.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div 
                  key={field.id}
                  className="group relative bg-white p-5 rounded-[2rem] border border-surface-100 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="grid grid-cols-12 gap-4">
                    {/* Item Info */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <label className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Descripción</label>
                      <Input
                        placeholder="EJ: CEMENTO MELÓN ESPECIAL"
                        error={errors.items?.[index]?.descripcion?.message}
                        className="h-11 border-surface-100 bg-surface-50/50 font-black text-[11px] uppercase"
                        {...register(`items.${index}.descripcion`)}
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Cant.</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        error={errors.items?.[index]?.cantidad?.message}
                        className="h-11 border-surface-100 bg-surface-50/50 font-black text-[11px]"
                        {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Unid.</label>
                      <Select
                        options={unidadesMaterial}
                        className="h-11 border-surface-100 bg-surface-50/50 font-black text-[11px] uppercase"
                        {...register(`items.${index}.unidad`)}
                      />
                    </div>

                    <div className="col-span-4 md:col-span-3 space-y-2">
                      <label className="text-[9px] font-black text-surface-400 uppercase tracking-widest">V. Unitario</label>
                      <Input
                        type="number"
                        placeholder="0"
                        error={errors.items?.[index]?.precioUnitario?.message}
                        className="h-11 border-surface-100 bg-surface-50/50 font-black text-[11px]"
                        {...register(`items.${index}.precioUnitario`, { valueAsNumber: true })}
                      />
                    </div>


                    {/* Tactical Remove Button */}
                    <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="h-11 w-11 rounded-xl text-error-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                  </div>

                  {/* Partial Subtotal industrial */}
                  <div className="mt-4 pt-4 border-t border-surface-50 flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-surface-300 uppercase tracking-widest italic">Cálculo de Item</span>
                    <span className="text-xs font-black text-surface-400 font-numeric">
                      {formatCurrency(subtotales[index] || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Industrial Totalizer */}
            <div className="mt-8 bg-surface-900 rounded-[2.5rem] p-6 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-inner">
                            <Save className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">TOTAL LIQUIDACIÓN</p>
                            <h2 className="text-4xl font-black text-white font-numeric leading-none tracking-tighter">{formatCurrency(total)}</h2>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5 min-w-[220px]">
                        <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">NETO OPERATIVO</span>
                            <span className="text-xs font-bold font-numeric">{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">IVA CRÉDITO (19%)</span>
                            <span className="text-xs font-bold font-numeric text-primary-400">{formatCurrency(Math.round(total * 0.19))}</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="h-16 px-10 rounded-[1.75rem] bg-white text-surface-900 hover:bg-primary-50 font-black text-xs tracking-[0.2em] uppercase shadow-xl transition-all active:scale-[0.98] border-none"
                    >
                        REGISTRAR ADQUISICIÓN
                    </Button>
                </div>
            </div>
          </div>
      </form>
    </div>
  );
}

export default NuevaCompraPage;
