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
  MapPin,
  Activity
} from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { useObraStore } from '@/stores';
import { formatDate, ESTADO_OBRA_LABELS } from '@/utils';

// Stat Card Component - Refined & Modern
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
    blue: 'text-primary-600 bg-primary-50',
    green: 'text-success-600 bg-success-50',
    orange: 'text-accent-600 bg-accent-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card className="border-none shadow-sm transition-all hover:shadow-md" padding="sm">
      <div className="flex flex-col gap-2">
        <div className={`w-10 h-10 rounded-lg ${colorStyles[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-surface-900 tracking-tight">
            {value}
          </p>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
            {label}
          </p>
        </div>
        {trend && (
          <div className={`absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend.up ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
            }`}>
            {trend.up ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
}

// Quick Action Button - Modern Tile
function QuickAction({
  to,
  icon: Icon,
  label,
  description,
  color = 'primary'
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color?: 'primary' | 'accent' | 'success' | 'purple';
}) {
  const colorMap = {
    primary: 'bg-primary-500 shadow-primary-200/50',
    accent: 'bg-accent-500 shadow-accent-200/50',
    success: 'bg-success-500 shadow-success-200/50',
    purple: 'bg-purple-500 shadow-purple-200/50',
  };

  return (
    <Link to={to} className="group">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-surface-100 h-full transition-all active:scale-95 group-hover:shadow-md">
        <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-surface-900 text-sm leading-tight pr-4">{label}</h3>
        <p className="text-[11px] text-surface-500 mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

// Obra Card - Professional & Sharp
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
      className={`block animate-fade-in-up stagger-${Math.min(index + 1, 4)} group`}
    >
      <Card
        hover
        className={`border-none shadow-sm group-hover:shadow-md transition-all border-l-4 ${stateColors[obra.estado] || 'border-l-surface-300'}`}
        padding="md"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-surface-900 text-base truncate group-hover:text-primary-600 transition-colors">
              {obra.nombre}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
              <span className="text-xs font-medium text-surface-500 truncate">{obra.cliente}</span>
            </div>
          </div>
          <span className={`
            px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border flex-shrink-0
            ${stateBadgeColors[obra.estado] || 'bg-surface-100 text-surface-600 border-surface-200'}
          `}>
            {ESTADO_OBRA_LABELS[obra.estado]}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-surface-50">
          <div className="flex items-center gap-2 text-surface-400">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{formatDate(obra.fechaInicio)}</span>
          </div>
          <div className="flex items-center gap-1 text-primary-600 font-bold text-xs">
            GESTIONAR
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
    <div className="min-h-full px-4 pt-2 pb-6 space-y-8">
      {/* Header Section */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
              Dashboard Operativo
            </span>
            <h1 className="text-2xl font-black text-surface-900 leading-none">
              Resumen General
            </h1>
          </div>
          <Link to="/obras/nueva">
            <Button
              size="sm"
              className="rounded-full px-4 h-9 shadow-lg shadow-primary-200"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Obra
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Modern Compacy Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={TrendingUp}
            value={obrasActivas.length}
            label="En Curso"
            color="green"
          />
          <StatCard
            icon={HardHat}
            value={obras.length}
            label="Totales"
            color="blue"
          />
          <StatCard
            icon={Users}
            value={totalTrabajadores || '0'}
            label="Personal"
            color="purple"
          />
          <StatCard
            icon={Package}
            value="—"
            label="Insumos"
            color="orange"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Quick Actions - Grid of Tiles */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest">
              Herramientas de Obra
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              to="/cubicacion"
              icon={Calculator}
              label="Cubicar Material"
              description="Cálculos NCh 170"
              color="primary"
            />
            <QuickAction
              to="/actividades/nueva"
              icon={CalendarDays}
              label="Nueva Actividad"
              description="Bitácora de campo"
              color="accent"
            />
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest">
                Proyectos Actuales
              </h2>
            </div>
            <Link
              to="/obras"
              className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1"
            >
              Panel completo
              <ChevronRight className="w-3 h-3" />
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

        {/* Info Banner - Refined and Less Intrusive */}
        <div className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 rounded-2xl p-6 text-white shadow-xl shadow-surface-200/50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Activity className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base tracking-tight">Normativa NCh 170</h3>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed font-medium">
                Cálculos basados en estándares chilenos oficiales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
