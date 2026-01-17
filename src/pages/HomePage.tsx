/**
 * OptiObra - Página de Inicio
 * Dashboard profesional para Supervisores de Obras
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  Calculator,
  CalendarDays,
  Plus,
  TrendingUp,
  Users,
  Package,
  ChevronRight,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { useObraStore } from '@/stores';
import { formatDate, ESTADO_OBRA_LABELS } from '@/utils';

// Stat Card Component - Industrial Design
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  trend
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  trend?: { value: number; up: boolean };
}) {
  const colorStyles = {
    blue: 'bg-primary-600 text-white',
    green: 'bg-success-600 text-white',
    orange: 'bg-accent-600 text-white',
    purple: 'bg-purple-600 text-white',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colorStyles[color]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-surface-900 font-numeric tracking-tight">
            {value}
          </p>
          <p className="text-sm font-medium text-surface-600 truncate">
            {label}
          </p>
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend.up ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
            }`}>
            {trend.up ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
}

// Quick Action Button - Industrial
function QuickAction({
  to,
  icon: Icon,
  label,
  description,
  variant = 'primary'
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
  variant?: 'primary' | 'accent';
}) {
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    accent: 'bg-accent-600 hover:bg-accent-700',
  };

  return (
    <Link to={to} className="block">
      <div className={`
        relative p-5 rounded-xl ${variantStyles[variant]}
        shadow-lg transform transition-all duration-200
        active:scale-[0.98] overflow-hidden
      `}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base">{label}</h3>
            <p className="text-sm text-white/80 truncate">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

// Obra Card - Professional
function ObraCard({ obra, index }: { obra: import('@/types').Obra; index: number }) {
  const stateColors: Record<string, string> = {
    en_progreso: 'border-l-success-500',
    planificacion: 'border-l-info-500',
    pausada: 'border-l-warning-500',
    finalizada: 'border-l-surface-400',
  };

  const stateBadgeColors: Record<string, string> = {
    en_progreso: 'bg-success-100 text-success-700 border-success-200',
    planificacion: 'bg-info-100 text-info-700 border-info-200',
    pausada: 'bg-warning-100 text-warning-700 border-warning-200',
    finalizada: 'bg-surface-100 text-surface-600 border-surface-200',
  };

  return (
    <Link
      to={`/obras/${obra.id}`}
      className={`block animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}
    >
      <Card
        hover
        className={`border-l-4 ${stateColors[obra.estado] || 'border-l-surface-300'}`}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-surface-900 text-base truncate">
              {obra.nombre}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
              <span className="text-sm text-surface-600 truncate">{obra.cliente}</span>
            </div>
          </div>
          <span className={`
            px-2.5 py-1 text-xs font-bold rounded-lg border flex-shrink-0
            ${stateBadgeColors[obra.estado] || 'bg-surface-100 text-surface-600 border-surface-200'}
          `}>
            {ESTADO_OBRA_LABELS[obra.estado]}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <div className="flex items-center gap-2 text-surface-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDate(obra.fechaInicio)}</span>
          </div>
          <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
            Ver detalles
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { obras, cargarObras, isLoading } = useObraStore();

  useEffect(() => {
    cargarObras();
  }, [cargarObras]);

  const obrasActivas = obras.filter(o => o.estado === 'en_progreso');
  const obrasRecientes = obras.slice(0, 4);
  // Nota: El conteo de trabajadores se hace por obra, no como propiedad directa
  const totalTrabajadores = 0; // Se carga de forma asíncrona por cada obra

  return (
    <div className="min-h-full px-5 py-4">
      {/* Header Section */}
      <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
        <div className="p-5">
          {/* Welcome & Actions */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
                Panel de Control
              </p>
              <h1 className="text-2xl font-black text-surface-900 mt-1">
                Supervisión de Obras
              </h1>
            </div>
            <Link to="/obras/nueva">
              <Button
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Nueva Obra
              </Button>
            </Link>
          </div>

          {/* Stats Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={TrendingUp}
              value={obrasActivas.length}
              label="Obras Activas"
              color="green"
            />
            <StatCard
              icon={HardHat}
              value={obras.length}
              label="Total Obras"
              color="blue"
            />
            <StatCard
              icon={Users}
              value={totalTrabajadores || '—'}
              label="Trabajadores"
              color="purple"
            />
            <StatCard
              icon={Package}
              value="—"
              label="Materiales"
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 mt-4">
        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-bold text-surface-700 uppercase tracking-wide mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <QuickAction
              to="/cubicacion"
              icon={Calculator}
              label="Calcular Cubicación"
              description="Materiales según NCh 170"
              variant="primary"
            />
            <QuickAction
              to="/actividades/nueva"
              icon={CalendarDays}
              label="Registrar Actividad"
              description="Bitácora diaria de obra"
              variant="accent"
            />
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-surface-700 uppercase tracking-wide">
              Obras Recientes
            </h2>
            <Link
              to="/obras"
              className="flex items-center gap-1 text-sm text-primary-600 font-bold hover:text-primary-700 transition-colors"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : obrasRecientes.length === 0 ? (
            <EmptyState
              icon={<HardHat className="w-10 h-10 text-surface-400" />}
              title="Sin obras registradas"
              description="Crea tu primera obra para comenzar a gestionar tus proyectos"
              variant="card"
              action={{
                label: 'Crear Obra',
                onClick: () => window.location.href = '/obras/nueva',
              }}
            />
          ) : (
            <div className="space-y-3">
              {obrasRecientes.map((obra, index) => (
                <ObraCard key={obra.id} obra={obra} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Info Banner */}
        <div className="bg-surface-800 rounded-xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">Normativa NCh 170</h3>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">
                Todos los cálculos de cubicación utilizan la normativa chilena oficial
                para dosificación de hormigones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
