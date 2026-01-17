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
    <Card hover className="cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar
          name={trabajador.nombreCompleto}
          src={trabajador.fotoContrato}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-surface-900 truncate">
            {trabajador.nombreCompleto}
          </h4>
          <p className="text-sm text-surface-500">
            {LABORES_TRABAJADOR[trabajador.labor]}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              size="sm"
              className={ESTADO_TRABAJADOR_COLORS[trabajador.estado]}
            >
              {trabajador.estado}
            </Badge>
            <span className="text-xs text-surface-400">
              Desde {formatDate(trabajador.fechaIngreso)}
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

  useEffect(() => {
    if (id) {
      cargarObra(id);
      cargarTrabajadores(id);
    }
  }, [id, cargarObra, cargarTrabajadores]);

  const handleDelete = () => {
    showConfirm({
      title: '¿Eliminar obra?',
      message: 'Esta acción eliminará la obra y todos sus datos asociados (trabajadores, materiales, actividades). No se puede deshacer.',
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

  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/obras')}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-surface-900">
                {obraActual.nombre}
              </h1>
              <Badge className={ESTADO_OBRA_COLORS[obraActual.estado]}>
                {ESTADO_OBRA_LABELS[obraActual.estado]}
              </Badge>
            </div>
            <p className="text-surface-500">{obraActual.cliente}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Button
            variant="outline"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/obras/${id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={handleDelete}
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-surface-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t-lg
              font-medium text-sm whitespace-nowrap
              transition-colors duration-200
              ${activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Información General */}
            <Card>
              <CardHeader title="Información General" />
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-surface-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-surface-500">Dirección</p>
                    <p className="font-medium">{obraActual.direccion}</p>
                  </div>
                </div>

                {obraActual.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-surface-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-surface-500">Teléfono</p>
                      <p className="font-medium">{obraActual.telefono}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-surface-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-surface-500">Fechas</p>
                    <p className="font-medium">
                      {formatDate(obraActual.fechaInicio)}
                      {obraActual.fechaEstimadaFin && (
                        <> - {formatDate(obraActual.fechaEstimadaFin)}</>
                      )}
                    </p>
                  </div>
                </div>

                {obraActual.presupuesto && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-surface-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-surface-500">Presupuesto</p>
                      <p className="font-medium font-numeric">
                        {formatCurrency(obraActual.presupuesto)}
                      </p>
                    </div>
                  </div>
                )}

                {obraActual.descripcion && (
                  <div className="pt-2 border-t border-surface-200">
                    <p className="text-sm text-surface-500 mb-1">Descripción</p>
                    <p className="text-surface-700">{obraActual.descripcion}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen */}
            <Card>
              <CardHeader title="Resumen" />
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-surface-50 rounded-lg">
                    <p className="text-2xl font-bold text-surface-900">
                      {trabajadoresActivos.length}
                    </p>
                    <p className="text-sm text-surface-500">Trabajadores</p>
                  </div>
                  <div className="text-center p-4 bg-surface-50 rounded-lg">
                    <p className="text-2xl font-bold text-surface-900">0</p>
                    <p className="text-sm text-surface-500">Actividades</p>
                  </div>
                  <div className="text-center p-4 bg-surface-50 rounded-lg">
                    <p className="text-2xl font-bold text-surface-900">0</p>
                    <p className="text-sm text-surface-500">Materiales</p>
                  </div>
                  <div className="text-center p-4 bg-surface-50 rounded-lg">
                    <p className="text-2xl font-bold text-surface-900">0</p>
                    <p className="text-sm text-surface-500">Compras</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trabajadores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-surface-500">
                {trabajadores.length} trabajador{trabajadores.length !== 1 && 'es'}
              </p>
              <Link to={`/obras/${id}/trabajadores/nuevo`}>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Agregar Trabajador
                </Button>
              </Link>
            </div>

            {trabajadores.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-surface-400" />}
                title="Sin trabajadores"
                description="Agrega trabajadores para gestionar el equipo de la obra"
                action={{
                  label: 'Agregar Trabajador',
                  onClick: () => navigate(`/obras/${id}/trabajadores/nuevo`),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
