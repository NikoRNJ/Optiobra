/**
 * OptiObra - Página de Compras
 * Historial y gestión de compras de materiales
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Building2,
  Calendar,
  DollarSign,
  Package,
  TrendingUp
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Select,
  Badge,
  EmptyState
} from '@/components/ui';
import { useObraStore } from '@/stores/obraStore';
import { comprasRepo } from '@/database/db';
import { formatDate, formatCurrency, ESTADO_COMPRA_LABELS } from '@/utils';
import type { Compra } from '@/types';

export function ComprasPage() {
  const navigate = useNavigate();
  const { obras, cargarObras } = useObraStore();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroObra, setFiltroObra] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarObras();
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      // Obtener todas las compras de todas las obras
      const todasCompras: Compra[] = [];
      for (const obra of obras) {
        if (obra.id) {
          const comprasObra = await comprasRepo.getByObra(obra.id);
          todasCompras.push(...comprasObra);
        }
      }
      // Ordenar por fecha más reciente
      todasCompras.sort((a: Compra, b: Compra) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setCompras(todasCompras);
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const matchObra = !filtroObra || compra.obraId === filtroObra;
    const matchEstado = !filtroEstado || compra.estado === filtroEstado;
    const matchBusqueda = !busqueda || 
      compra.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.items.some(i => i.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return matchObra && matchEstado && matchBusqueda;
  });

  const getObraNombre = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra?.nombre || 'Sin obra';
  };

  // Calcular totales
  const totalGastado = compras
    .filter(c => c.estado !== 'cancelada')
    .reduce((sum, c) => sum + c.total, 0);

  const comprasPendientes = compras.filter(c => c.estado === 'pendiente').length;
  const comprasEntregadas = compras.filter(c => c.estado === 'entregada').length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Premium Industrial */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-2">
        <div className="min-w-0">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
             Logística y Suministros
          </span>
          <h1 className="text-3xl font-black text-surface-900 leading-none truncate">
            Historial de Compras
          </h1>
        </div>
        <Button 
          onClick={() => navigate('/compras/nueva')}
          className="rounded-2xl font-black text-xs uppercase tracking-widest px-6 h-12 shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Adquisición
        </Button>
      </div>

      {/* Estadísticas de Compras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Inversión Total</p>
              <p className="text-xl font-black font-numeric text-success-600">
                {formatCurrency(totalGastado)}
              </p>
           </div>
           <DollarSign className="absolute -right-2 -bottom-2 w-16 h-16 text-success-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Pendientes</p>
              <div className="flex items-end gap-1">
                 <p className="text-2xl font-black text-accent-500 leading-none">{comprasPendientes}</p>
                 <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Ordenes</span>
              </div>
           </div>
           <Package className="absolute -right-2 -bottom-2 w-16 h-16 text-accent-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Recibidas</p>
              <div className="flex items-end gap-1">
                 <p className="text-2xl font-black text-primary-600 leading-none">{comprasEntregadas}</p>
                 <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Items</span>
              </div>
           </div>
           <TrendingUp className="absolute -right-2 -bottom-2 w-16 h-16 text-primary-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Total Gestión</p>
              <div className="flex items-end gap-1">
                 <p className="text-2xl font-black text-surface-900 leading-none">{compras.length}</p>
                 <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Tickets</span>
              </div>
           </div>
           <ShoppingCart className="absolute -right-2 -bottom-2 w-16 h-16 text-surface-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="bg-white p-2 rounded-3xl border border-surface-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              type="text"
              placeholder="Buscar proveedor o insumo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-50 border-none rounded-2xl text-xs font-bold text-surface-700 placeholder:text-surface-300 focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Seleccionar Obra' },
              ...obras.map(o => ({ value: o.id!, label: o.nombre }))
            ]}
            value={filtroObra}
            onChange={(e) => setFiltroObra(e.target.value)}
            className="border-none bg-surface-50 rounded-2xl"
          />
          <Select
            options={[
              { value: '', label: 'Estado de Orden' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'pagada', label: 'Pagada' },
              { value: 'entregada', label: 'Entregada' },
              { value: 'cancelada', label: 'Cancelada' },
            ]}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border-none bg-surface-50 rounded-2xl"
          />
        </div>
      </div>

      {/* Listado de Operaciones */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-surface-200">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
          <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Sincronizando inventario...</p>
        </div>
      ) : comprasFiltradas.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16 text-surface-100" />}
          title="SISTEMA VACÍO"
          description={busqueda || filtroObra || filtroEstado
            ? "No hay registros que coincidan con los parámetros de búsqueda."
            : "No se han registrado operaciones de compra en el sistema."
          }
          action={{
            label: 'NUEVA ORDEN',
            onClick: () => navigate('/compras/nueva'),
          }}
          className="bg-white border-2 border-dashed border-surface-200 rounded-3xl py-20"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comprasFiltradas.map((compra) => {
            const statusColors: Record<string, string> = {
              'pendiente': 'border-l-accent-500',
              'pagada': 'border-l-primary-500',
              'entregada': 'border-l-success-500',
              'cancelada': 'border-l-error-500',
            };
            
            return (
              <Card 
                key={compra.id}
                className={`hover:border-primary-300 transition-all cursor-pointer border-l-4 ${statusColors[compra.estado] || 'border-l-surface-300'} overflow-hidden`}
                padding="none"
                onClick={() => navigate(`/compras/${compra.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
                        <ShoppingCart className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-surface-900 truncate uppercase tracking-tight text-sm">
                          {compra.proveedor}
                        </h4>
                        <p className="text-[10px] font-bold text-surface-400 flex items-center gap-1 uppercase tracking-tighter">
                          <Building2 className="w-3 h-3 text-primary-400" />
                          {getObraNombre(compra.obraId)}
                        </p>
                      </div>
                    </div>
                    <Badge className="border-none text-[9px] font-black uppercase tracking-widest bg-surface-100 text-surface-600">
                      {ESTADO_COMPRA_LABELS[compra.estado]}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                     <div className="flex flex-wrap gap-2">
                        {compra.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-50 border border-surface-100 text-[9px] font-bold text-surface-600">
                            {item.cantidad} {item.unidad} {item.descripcion}
                          </span>
                        ))}
                        {compra.items.length > 3 && (
                          <span className="text-[9px] font-black text-primary-400 uppercase tracking-tighter pt-0.5">
                            + {compra.items.length - 3} MÁS
                          </span>
                        )}
                     </div>

                     <div className="flex items-center justify-between pt-3 border-t border-surface-50">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-[10px] font-black text-surface-400 uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5 text-primary-500" />
                              {formatDate(compra.fecha)}
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black font-numeric text-surface-900 leading-none">
                              {formatCurrency(compra.total)}
                           </p>
                        </div>
                     </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ComprasPage;
