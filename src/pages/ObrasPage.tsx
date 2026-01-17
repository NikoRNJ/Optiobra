/**
 * OptiObra - Página de Obras
 * Listado y gestión de obras/proyectos
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  HardHat,
  MapPin,
  Calendar,
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  EmptyState, 
  PageLoader,
  Select
} from '@/components/ui';
import { useObraStore } from '@/stores';
import { formatDate, ESTADO_OBRA_LABELS, ESTADO_OBRA_COLORS } from '@/utils';
import type { EstadoObra } from '@/types';

const estadoOptions = [
  { value: 'todas', label: 'Todas las obras' },
  { value: 'planificacion', label: 'En planificación' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'pausada', label: 'Pausadas' },
  { value: 'finalizada', label: 'Finalizadas' },
];

function ObraCard({ obra }: { obra: import('@/types').Obra }) {
  const navigate = useNavigate();

  return (
    <Card 
      hover 
      onClick={() => navigate(`/obras/${obra.id}`)}
      className="cursor-pointer border-none shadow-sm hover:shadow-md transition-all group"
      padding="md"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-surface-900 truncate text-base group-hover:text-primary-600 transition-colors">
            {obra.nombre}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-surface-300" />
            <p className="text-xs font-semibold text-surface-500 truncate uppercase tracking-wider">{obra.cliente}</p>
          </div>
        </div>
        <Badge className={`${ESTADO_OBRA_COLORS[obra.estado]} text-[10px] font-black uppercase tracking-wider border-none px-2 py-0.5 rounded-md`}>
          {ESTADO_OBRA_LABELS[obra.estado]}
        </Badge>
      </div>

      <div className="space-y-2.5">
        {obra.direccion && (
          <div className="flex items-center gap-2.5 text-surface-600">
            <div className="w-7 h-7 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-surface-400" />
            </div>
            <span className="text-xs font-medium truncate">{obra.direccion}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-surface-600">
          <div className="w-7 h-7 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-surface-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-tight">
            INICIO: {formatDate(obra.fechaInicio)}
          </span>
        </div>
      </div>

      {obra.descripcion && (
        <p className="mt-4 text-xs text-surface-400 line-clamp-2 leading-relaxed italic border-t border-surface-50 pt-3">
          "{obra.descripcion}"
        </p>
      )}
    </Card>
  );
}

export function ObrasPage() {
  const navigate = useNavigate();
  const { 
    obras, 
    cargarObras, 
    isLoading,
    filtroEstado,
    busqueda,
    setFiltroEstado,
    setBusqueda,
    obrasFiltradas
  } = useObraStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarObras();
  }, [cargarObras]);

  const obrasMostradas = obrasFiltradas();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
            Gestión de Proyectos
          </span>
          <h1 className="text-2xl font-black text-surface-900 leading-none">Obras</h1>
        </div>
        <Link to="/obras/nueva">
          <Button 
            size="sm"
            className="rounded-full px-5 h-10 shadow-lg shadow-primary-200"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Obra
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar proyecto o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-surface-200 text-surface-900 text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block p-3 pl-10 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            className="rounded-xl border-surface-200 text-surface-600 sm:hidden"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <div className="hidden sm:block w-48">
            <Select
              className="rounded-xl"
              options={estadoOptions}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoObra | 'todas')}
            />
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      {showFilters && (
        <div className="sm:hidden">
          <Select
            label="Estado"
            options={estadoOptions}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoObra | 'todas')}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <PageLoader message="Cargando obras..." />
      ) : obrasMostradas.length === 0 ? (
        obras.length === 0 ? (
          <EmptyState
            icon={<HardHat className="w-8 h-8 text-surface-400" />}
            title="No hay obras registradas"
            description="Crea tu primera obra para comenzar a gestionar tus proyectos de construcción"
            action={{
              label: 'Crear Primera Obra',
              onClick: () => navigate('/obras/nueva'),
            }}
          />
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8 text-surface-400" />}
            title="No se encontraron obras"
            description="Intenta con otros términos de búsqueda o ajusta los filtros"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {obrasMostradas.map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ObrasPage;
