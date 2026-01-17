/**
 * OptiObra - Página Detalle de Obra
 * Vista completa de una obra con tabs para diferentes secciones
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Package,
  CalendarDays,
  ShoppingCart,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Plus
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  PageLoader,
  EmptyState,
  Avatar
} from '@/components/ui';
import { useObraStore, useTrabajadorStore, useUIStore } from '@/stores';
import {
  formatDate,
  formatCurrency,
  ESTADO_OBRA_LABELS,
  ESTADO_OBRA_COLORS,
  LABORES_TRABAJADOR,
  ESTADO_TRABAJADOR_COLORS
} from '@/utils';
import type { Trabajador } from '@/types';

type TabType = 'info' | 'trabajadores' | 'materiales' | 'actividades' | 'compras';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Info', icon: MapPin },
  { id: 'trabajadores', label: 'Equipo', icon: Users },
  { id: 'materiales', label: 'Materiales', icon: Package },
  { id: 'actividades', label: 'Tareas', icon: CalendarDays },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
];

function TrabajadorCard({ trabajador }: { trabajador: Trabajador }) {
  return (
    <Card className="hover:border-primary-300 transition-colors cursor-pointer border-l-4 border-l-primary-500 overflow-hidden">
      <div className="flex items-center gap-4 p-1">
        <div className="relative">
          <Avatar
            name={trabajador.nombreCompleto}
            src={trabajador.fotoContrato}
            size="lg"
            className="rounded-xl border-2 border-surface-100"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${trabajador.estado === 'activo' ? 'bg-success-500' : 'bg-surface-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">
              {LABORES_TRABAJADOR[trabajador.labor]}
            </span>
          </div>
          <h4 className="font-black text-surface-900 truncate leading-tight mb-1">
            {trabajador.nombreCompleto}
          </h4>
          <div className="flex items-center gap-2">
            <Badge
              className={`${ESTADO_TRABAJADOR_COLORS[trabajador.estado]} border-none text-[9px] font-black uppercase px-2 py-0`}
            >
              {trabajador.estado}
            </Badge>
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">
              D. {formatDate(trabajador.fechaIngreso)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ObraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obraActual, cargarObra, eliminarObra, isLoading } = useObraStore();
  const { trabajadores, cargarTrabajadores } = useTrabajadorStore();
  const { showConfirm, hideConfirm } = useUIStore();

  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Calcular trabajadores activos
  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');

  useEffect(() => {
    if (id) {
      cargarObra(id);
      cargarTrabajadores(id);
    }
  }, [id, cargarObra, cargarTrabajadores]);

  const handleDelete = () => {
    showConfirm({
      title: '¿Eliminar obra?',
      message: 'Esta acción eliminará la obra y todos sus datos asociados. No se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        if (id) {
          await eliminarObra(id);
          hideConfirm();
          navigate('/obras');
        }
      },
      onCancel: hideConfirm,
    });
  };

  if (isLoading) {
    return <PageLoader message="Cargando obra..." />;
  }

  if (!obraActual) {
    return (
      <div className="p-4 lg:p-6">
        <EmptyState
          title="Obra no encontrada"
          description="La obra que buscas no existe o fue eliminada"
          action={{
            label: 'Volver a Obras',
            onClick: () => navigate('/obras'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header Moderno con Actions compactas */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white shadow-sm border border-surface-100 h-10 w-10 flex-shrink-0"
              onClick={() => navigate('/obras')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block"> Expediente de Obra </span>
              <h1 className="text-2xl font-black text-surface-900 leading-none truncate">{obraActual.nombre}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
             <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-surface-400 hover:text-primary-600"
                onClick={() => navigate(`/obras/${id}/editar`)}
             >
                <Edit className="w-4 h-4" />
             </Button>
             <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-surface-400 hover:text-error-600"
                onClick={handleDelete}
             >
                <Trash2 className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <div className="bg-white p-3 rounded-2xl border border-surface-100 shadow-sm">
              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Estado</p>
              <Badge className={`${ESTADO_OBRA_COLORS[obraActual.estado]} border-none text-[10px] uppercase font-black px-2 py-0.5 rounded-md`}>
                {ESTADO_OBRA_LABELS[obraActual.estado]}
              </Badge>
           </div>
           <div className="bg-white p-3 rounded-2xl border border-surface-100 shadow-sm">
              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Cliente</p>
              <p className="text-xs font-bold text-surface-700 truncate">{obraActual.cliente}</p>
           </div>
           <div className="bg-white p-3 rounded-2xl border border-surface-100 shadow-sm">
              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Presupuesto</p>
              <p className="text-xs font-bold text-success-600 truncate">{formatCurrency(obraActual.presupuesto || 0)}</p>
           </div>
           <div className="bg-white p-3 rounded-2xl border border-surface-100 shadow-sm">
              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Personal</p>
              <p className="text-xs font-bold text-surface-700">{trabajadores.length} Activos</p>
           </div>
        </div>
      </div>

      {/* Modern Tabs - Pill Style */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full
              font-black text-[10px] uppercase tracking-widest whitespace-nowrap
              transition-all duration-200 border-2
              ${activeTab === tab.id
                ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-200'
                : 'bg-white text-surface-400 border-surface-100 hover:border-surface-200'
              }
            `}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-primary-500'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Información General */}
            <Card className="border-l-4 border-l-primary-500">
              <CardHeader title="Información General" className="text-xs font-black uppercase tracking-widest text-primary-600" />
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-surface-50/50 p-3 rounded-xl border border-surface-100">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">Dirección</p>
                    <p className="text-sm font-bold text-surface-700">{obraActual.direccion}</p>
                  </div>
                </div>

                {obraActual.telefono && (
                  <div className="flex items-start gap-3 bg-surface-50/50 p-3 rounded-xl border border-surface-100">
                    <Phone className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">Teléfono</p>
                      <p className="text-sm font-bold text-surface-700">{obraActual.telefono}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 bg-surface-50/50 p-3 rounded-xl border border-surface-100">
                  <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">Periodo de Obra</p>
                    <p className="text-sm font-bold text-surface-700">
                      {formatDate(obraActual.fechaInicio)}
                      {obraActual.fechaEstimadaFin && (
                        <> — {formatDate(obraActual.fechaEstimadaFin)}</>
                      )}
                    </p>
                  </div>
                </div>

                {obraActual.presupuesto && (
                  <div className="flex items-start gap-3 bg-success-50/30 p-3 rounded-xl border border-success-100">
                    <DollarSign className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-success-600 uppercase tracking-tighter">Presupuesto Asignado</p>
                      <p className="text-sm font-bold text-success-700 font-numeric">
                        {formatCurrency(obraActual.presupuesto)}
                      </p>
                    </div>
                  </div>
                )}

                {obraActual.descripcion && (
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">Descripción del Proyecto</p>
                    <p className="text-xs text-surface-600 leading-relaxed bg-surface-50 p-3 rounded-xl border border-dashed border-surface-200">
                      {obraActual.descripcion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de Métricas */}
            <Card className="border-l-4 border-l-accent-500">
              <CardHeader title="Resumen de Métricas" className="text-xs font-black uppercase tracking-widest text-accent-600" />
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-left p-4 bg-white rounded-2xl border border-surface-100 shadow-sm">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">Equipo</p>
                    <div className="flex items-end gap-1">
                      <p className="text-2xl font-black text-surface-900 leading-none">
                        {trabajadoresActivos.length}
                      </p>
                      <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Operarios</span>
                    </div>
                  </div>
                  <div className="text-left p-4 bg-white rounded-2xl border border-surface-100 shadow-sm">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">Avance</p>
                    <div className="flex items-end gap-1">
                      <p className="text-2xl font-black text-primary-600 leading-none">0</p>
                      <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Tareas</span>
                    </div>
                  </div>
                  <div className="text-left p-4 bg-white rounded-2xl border border-surface-100 shadow-sm">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">Materiales</p>
                    <div className="flex items-end gap-1">
                      <p className="text-2xl font-black text-surface-900 leading-none">0</p>
                      <span className="text-[10px] font-bold text-surface-400 uppercase pb-0.5">Items</span>
                    </div>
                  </div>
                  <div className="text-left p-4 bg-white rounded-2xl border border-surface-100 shadow-sm">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter mb-1">Inversión</p>
                    <div className="flex items-end gap-1">
                      <p className="text-2xl font-black text-success-600 leading-none">$0</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-primary-900 rounded-2xl text-white overflow-hidden relative">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-1">Estado de Ejecución</p>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xl font-black italic">OPTIMIZADO</span>
                         <span className="text-xs font-bold bg-primary-800 px-2 py-0.5 rounded">V1.2</span>
                      </div>
                      <div className="w-full bg-primary-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-accent-500 h-full w-[15%]" />
                      </div>
                   </div>
                   <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Package className="w-24 h-24" />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trabajadores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-surface-100 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="bg-primary-50 p-2 rounded-xl">
                    <Users className="w-5 h-5 text-primary-600" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-surface-900">Personal Desplegado</h3>
                    <p className="text-[10px] font-bold text-surface-400">
                      {trabajadores.length} OPERARIOS EN LISTA
                    </p>
                 </div>
              </div>
              <Link to={`/obras/${id}/trabajadores/nuevo`}>
                <Button 
                   size="sm" 
                   className="rounded-full font-black text-[10px] uppercase tracking-widest px-4"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  AGREGAR
                </Button>
              </Link>
            </div>

            {trabajadores.length === 0 ? (
              <EmptyState
                icon={<Users className="w-12 h-12 text-surface-200" />}
                title="SISTEMA SIN REGISTROS"
                description="No se han asignado operarios a este frente de obra."
                action={{
                  label: 'ALTA DE OPERARIO',
                  onClick: () => navigate(`/obras/${id}/trabajadores/nuevo`),
                }}
                className="bg-white border-2 border-dashed border-surface-200 rounded-3xl py-12"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trabajadores.map((trabajador) => (
                  <TrabajadorCard key={trabajador.id} trabajador={trabajador} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'materiales' && (
          <EmptyState
            icon={<Package className="w-8 h-8 text-surface-400" />}
            title="Sin materiales"
            description="Registra los materiales necesarios para esta obra"
            action={{
              label: 'Agregar Material',
              onClick: () => navigate(`/materiales?obraId=${id}`),
            }}
          />
        )}

        {activeTab === 'actividades' && (
          <EmptyState
            icon={<CalendarDays className="w-8 h-8 text-surface-400" />}
            title="Sin actividades"
            description="Registra las actividades y avances de la obra"
            action={{
              label: 'Nueva Actividad',
              onClick: () => navigate(`/actividades/nueva?obraId=${id}`),
            }}
          />
        )}

        {activeTab === 'compras' && (
          <EmptyState
            icon={<ShoppingCart className="w-8 h-8 text-surface-400" />}
            title="Sin compras"
            description="Registra las compras de materiales para esta obra"
            action={{
              label: 'Registrar Compra',
              onClick: () => navigate(`/compras/nueva?obraId=${id}`),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ObraDetallePage;
