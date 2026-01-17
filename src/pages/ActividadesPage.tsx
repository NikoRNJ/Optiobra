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
  ChevronRight
} from 'lucide-react';
import { 
  Card, 
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
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
            Bitácora de Campo
          </span>
          <h1 className="text-2xl font-black text-surface-900 leading-none">Actividades</h1>
        </div>
        <Button 
          size="sm"
          className="rounded-full px-5 h-10 shadow-lg shadow-primary-200"
          onClick={() => navigate('/actividades/nueva')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      {/* Filtros Modernos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-2 rounded-2xl border border-surface-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar en registros..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border-none rounded-xl text-sm focus:ring-0 outline-none"
          />
        </div>
        <Select
          className="border-none bg-surface-50 rounded-xl"
          options={[
            { value: '', label: 'Cualquier Obra' },
            ...obras.map(o => ({ value: o.id!, label: o.nombre }))
          ]}
          value={filtroObra}
          onChange={(e) => setFiltroObra(e.target.value)}
        />
        <Select
          className="border-none bg-surface-50 rounded-xl"
          options={[
            { value: '', label: 'Cualquier Estado' },
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_progreso', label: 'En Progreso' },
            { value: 'completada', label: 'Completada' },
            { value: 'cancelada', label: 'Cancelada' },
          ]}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        />
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', count: actividades.filter(a => a.estado === 'pendiente').length, color: 'text-warning-600 bg-warning-50' },
          { label: 'En Proceso', count: actividades.filter(a => a.estado === 'en_progreso').length, color: 'text-info-600 bg-info-50' },
          { label: 'Completas', count: actividades.filter(a => a.estado === 'completada').length, color: 'text-success-600 bg-success-50' },
          { label: 'Total', count: actividades.length, color: 'text-surface-600 bg-surface-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-2xl border border-surface-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{stat.label}</span>
            <span className={`px-2 py-0.5 rounded-lg font-bold text-xs ${stat.color}`}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Lista de actividades por fecha */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
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
        <div className="space-y-10">
          {Object.entries(actividadesPorFecha).map(([fecha, acts]) => (
            <div key={fecha}>
              <div className="flex items-center gap-2 mb-4 bg-surface-50 p-2 rounded-lg w-fit">
                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                <h3 className="text-[10px] font-black italic text-surface-500 uppercase tracking-widest leading-none">{fecha}</h3>
              </div>
              
              <div className="space-y-4">
                {acts.map((actividad) => (
                  <Card 
                    key={actividad.id}
                    className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden p-0"
                    onClick={() => navigate(`/actividades/${actividad.id}`)}
                  >
                    <div className="flex items-stretch">
                      <div className="w-1 bg-primary-500 group-hover:w-2 transition-all" />
                      <div className="p-4 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="pt-1 flex-shrink-0">
                            {getEstadoIcon(actividad.estado)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="min-w-0">
                                <h4 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors truncate">
                                  {actividad.titulo}
                                </h4>
                                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                  <Building2 className="w-3 h-3 text-primary-500/50" />
                                  {getObraNombre(actividad.obraId)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge className="text-[9px] font-black uppercase border-none px-1.5 py-0.5 rounded-md">
                                  {ESTADO_ACTIVIDAD_LABELS[actividad.estado]}
                                </Badge>
                                {actividad.prioridad && (
                                  <Badge 
                                    variant={prioridadConfig[actividad.prioridad].color}
                                    className="text-[9px] font-black uppercase border-none px-1.5 py-0.5 rounded-md"
                                  >
                                    {prioridadConfig[actividad.prioridad].label}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {actividad.descripcion && (
                              <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed italic border-l-2 border-surface-100 pl-3 mb-4">
                                "{actividad.descripcion}"
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-surface-50">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-surface-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold">14:20</span>
                                </div>
                                {actividad.multimedia && actividad.multimedia.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-surface-200" />
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary-600/70">
                                      <Image className="w-3 h-3" />
                                      {actividad.multimedia.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-primary-600 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                Detalles
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
