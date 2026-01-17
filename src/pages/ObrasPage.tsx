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
  Input, 
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
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-surface-900 truncate text-lg">
            {obra.nombre}
          </h3>
          <p className="text-sm text-surface-500 truncate">{obra.cliente}</p>
        </div>
        <Badge className={ESTADO_OBRA_COLORS[obra.estado]}>
          {ESTADO_OBRA_LABELS[obra.estado]}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-surface-600">
        {obra.direccion && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <span className="truncate">{obra.direccion}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-surface-400 flex-shrink-0" />
          <span>
            Inicio: {formatDate(obra.fechaInicio)}
            {obra.fechaEstimadaFin && ` - Fin: ${formatDate(obra.fechaEstimadaFin)}`}
          </span>
        </div>
      </div>

      {obra.descripcion && (
        <p className="mt-3 text-sm text-surface-500 line-clamp-2">
          {obra.descripcion}
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
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Obras</h1>
          <p className="text-surface-500">
            {obras.length} {obras.length === 1 ? 'proyecto' : 'proyectos'} registrados
          </p>
        </div>
        <Link to="/obras/nueva">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Nueva Obra
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, cliente o dirección..."
            leftIcon={<Search className="w-4 h-4" />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            Filtros
          </Button>
          <div className="hidden sm:block w-48">
            <Select
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
