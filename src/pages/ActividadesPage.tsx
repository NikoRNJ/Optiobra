/**
 * OptiObra - Página de Actividades
 * Registro de actividades diarias/semanales con multimedia
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  Building2,
  Image,
  Video,
  ChevronRight
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
import { actividadesRepo } from '@/database/db';
import { formatDate, ESTADO_ACTIVIDAD_LABELS } from '@/utils';
import type { Actividad, EstadoActividad } from '@/types';

const prioridadConfig = {
  alta: { label: 'Alta', color: 'error' as const },
  media: { label: 'Media', color: 'warning' as const },
  baja: { label: 'Baja', color: 'success' as const },
};

export function ActividadesPage() {
  const navigate = useNavigate();
  const { obras, cargarObras } = useObraStore();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroObra, setFiltroObra] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarObras();
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      // Obtener todas las actividades de todas las obras
      const todasActividades: Actividad[] = [];
      for (const obra of obras) {
        if (obra.id) {
          const actividadesObra = await actividadesRepo.getByObra(obra.id);
          todasActividades.push(...actividadesObra);
        }
      }
      // Ordenar por fecha más reciente
      todasActividades.sort((a: Actividad, b: Actividad) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setActividades(todasActividades);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar actividades
  const actividadesFiltradas = actividades.filter(act => {
    const matchObra = !filtroObra || act.obraId === filtroObra;
    const matchEstado = !filtroEstado || act.estado === filtroEstado;
    const matchBusqueda = !busqueda || 
      act.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      act.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchObra && matchEstado && matchBusqueda;
  });

  // Agrupar por fecha
  const actividadesPorFecha = actividadesFiltradas.reduce((acc, act) => {
    const fecha = formatDate(act.fecha);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(act);
    return acc;
  }, {} as Record<string, Actividad[]>);

  const getObraNombre = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra?.nombre || 'Sin obra';
  };

  const getEstadoIcon = (estado: EstadoActividad) => {
    switch (estado) {
      case 'completada':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'en_progreso':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pendiente':
        return <Circle className="w-5 h-5 text-yellow-500" />;
      case 'cancelada':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary-500" />
            Actividades
          </h1>
          <p className="text-surface-500 mt-1">
            Gestiona las actividades de tus obras
          </p>
        </div>
        <Button onClick={() => navigate('/actividades/nueva')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar actividades..."
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
                { value: 'en_progreso', label: 'En Progreso' },
                { value: 'completada', label: 'Completada' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Circle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-yellow-700">
                  {actividades.filter(a => a.estado === 'pendiente').length}
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
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-blue-700">
                  {actividades.filter(a => a.estado === 'en_progreso').length}
                </p>
                <p className="text-sm text-blue-600">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-green-700">
                  {actividades.filter(a => a.estado === 'completada').length}
                </p>
                <p className="text-sm text-green-600">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-50 border-surface-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-surface-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-numeric text-surface-700">
                  {actividades.length}
                </p>
                <p className="text-sm text-surface-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de actividades por fecha */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : actividadesFiltradas.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-12 h-12" />}
          title="No hay actividades"
          description={busqueda || filtroObra || filtroEstado
            ? "No se encontraron actividades con los filtros aplicados"
            : "Comienza agregando actividades a tus obras"
          }
          action={{
            label: 'Nueva Actividad',
            onClick: () => navigate('/actividades/nueva'),
          }}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(actividadesPorFecha).map(([fecha, acts]) => (
            <div key={fecha}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-surface-400" />
                <h3 className="text-sm font-medium text-surface-500">{fecha}</h3>
                <span className="text-xs text-surface-400">({acts.length})</span>
              </div>
              
              <div className="space-y-3">
                {acts.map((actividad) => (
                  <Card 
                    key={actividad.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/actividades/${actividad.id}`)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        {/* Estado icon */}
                        <div className="pt-1">
                          {getEstadoIcon(actividad.estado)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-surface-900">
                                {actividad.titulo}
                              </h4>
                              <p className="text-sm text-surface-500 flex items-center gap-1 mt-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {getObraNombre(actividad.obraId)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                size="sm"
                              >
                                {ESTADO_ACTIVIDAD_LABELS[actividad.estado]}
                              </Badge>
                              {actividad.prioridad && (
                                <Badge 
                                  variant={prioridadConfig[actividad.prioridad].color}
                                  size="sm"
                                >
                                  {prioridadConfig[actividad.prioridad].label}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {actividad.descripcion && (
                            <p className="text-sm text-surface-600 mt-2 line-clamp-2">
                              {actividad.descripcion}
                            </p>
                          )}

                          {/* Multimedia indicators */}
                          {actividad.multimedia && actividad.multimedia.length > 0 && (
                            <div className="flex items-center gap-3 mt-3 text-xs text-surface-400">
                              <span className="flex items-center gap-1">
                                <Image className="w-3.5 h-3.5" />
                                {actividad.multimedia.filter(m => m.tipo === 'imagen').length} fotos
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" />
                                {actividad.multimedia.filter(m => m.tipo === 'video').length} videos
                              </span>
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-surface-300" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActividadesPage;
