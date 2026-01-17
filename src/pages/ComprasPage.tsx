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
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  Card, 
  CardContent,
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
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary-500" />
            Compras
          </h1>
          <p className="text-surface-500 mt-1">
            Historial de compras de materiales
          </p>
        </div>
        <Button onClick={() => navigate('/compras/nueva')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold font-numeric text-green-700">
                  {formatCurrency(totalGastado)}
                </p>
                <p className="text-sm text-green-600">Total Gastado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-yellow-700">
                  {comprasPendientes}
                </p>
                <p className="text-sm text-yellow-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-blue-700">
                  {comprasEntregadas}
                </p>
                <p className="text-sm text-blue-600">Entregadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-50 border-surface-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-surface-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-surface-700">
                  {compras.length}
                </p>
                <p className="text-sm text-surface-600">Total Compras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar por proveedor o material..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'Todas las obras' },
                ...obras.map(o => ({ value: o.id!, label: o.nombre }))
              ]}
              value={filtroObra}
              onChange={(e) => setFiltroObra(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'pagada', label: 'Pagada' },
                { value: 'entregada', label: 'Entregada' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de compras */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : comprasFiltradas.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-12 h-12" />}
          title="No hay compras"
          description={busqueda || filtroObra || filtroEstado
            ? "No se encontraron compras con los filtros aplicados"
            : "Comienza registrando tus primeras compras"
          }
          action={{
            label: 'Nueva Compra',
            onClick: () => navigate('/compras/nueva'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {comprasFiltradas.map((compra) => (
            <Card 
              key={compra.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/compras/${compra.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Icono */}
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-6 h-6 text-primary-600" />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-surface-900">
                          {compra.proveedor}
                        </h4>
                        <p className="text-sm text-surface-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {getObraNombre(compra.obraId)}
                        </p>
                      </div>
                      <Badge>
                        {ESTADO_COMPRA_LABELS[compra.estado]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(compra.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {compra.items.length} items
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="mt-2 text-sm text-surface-600">
                      {compra.items.slice(0, 2).map((item, idx) => (
                        <span key={idx}>
                          {item.cantidad} {item.unidad} {item.descripcion}
                          {idx < Math.min(compra.items.length - 1, 1) && ', '}
                        </span>
                      ))}
                      {compra.items.length > 2 && (
                        <span className="text-surface-400">
                          {' '}y {compra.items.length - 2} más...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold font-numeric text-surface-900">
                      {formatCurrency(compra.total)}
                    </p>
                    <ChevronRight className="w-5 h-5 text-surface-300 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComprasPage;
