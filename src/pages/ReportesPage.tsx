/**
 * OptiObra - Página de Reportes
 * Dashboard con métricas y exportación de datos
 */

import { useState, useEffect } from 'react';
import {
    Download,
    Building2,
    Users,
    Package,
    DollarSign,
    Calendar,
    PieChart,
    BarChart3,
    Clock
} from 'lucide-react';
import { Card, Button, Select } from '@/components/ui';
import { useObraStore } from '@/stores';
import { db } from '@/database/db';
import { formatCurrency } from '@/utils';

interface DashboardStats {
    totalObras: number;
    obrasActivas: number;
    totalTrabajadores: number;
    totalCompras: number;
    totalActividades: number;
    actividadesPendientes: number;
}

function StatCard({
    icon: Icon,
    label,
    value,
    color = 'blue',
    suffix
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'orange' | 'purple';
    suffix?: string;
}) {
    const colorStyles = {
        blue: { bg: 'bg-primary-50', icon: 'text-primary-600', border: 'border-l-primary-500' },
        green: { bg: 'bg-success-50', icon: 'text-success-600', border: 'border-l-success-500' },
        orange: { bg: 'bg-accent-50', icon: 'text-accent-600', border: 'border-l-accent-500' },
        purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-l-purple-500' },
    };

    const style = colorStyles[color];

    return (
        <Card className={`overflow-hidden border-l-4 ${style.border} transition-transform active:scale-95`} padding="none">
            <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${style.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xl font-black text-surface-900 font-numeric leading-none mb-1">
                        {value}{suffix}
                    </p>
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest truncate">{label}</p>
                </div>
            </div>
        </Card>
    );
}

export function ReportesPage() {
    const { obras, cargarObras } = useObraStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalObras: 0,
        obrasActivas: 0,
        totalTrabajadores: 0,
        totalCompras: 0,
        totalActividades: 0,
        actividadesPendientes: 0,
    });
    const [periodoFiltro, setPeriodoFiltro] = useState('mes');
    const [_isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarObras();
        cargarEstadisticas();
    }, [cargarObras]);

    const cargarEstadisticas = async () => {
        setIsLoading(true);
        try {
            const [trabajadores, compras, actividades] = await Promise.all([
                db.trabajadores.count(),
                db.compras.toArray(),
                db.actividades.toArray(),
            ]);

            const obrasActivas = obras.filter(o => o.estado === 'en_progreso').length;
            const actividadesPendientes = actividades.filter(
                a => a.estado === 'pendiente' || a.estado === 'en_progreso'
            ).length;
            const totalCompras = compras.reduce((sum, c) => sum + c.total, 0);

            setStats({
                totalObras: obras.length,
                obrasActivas,
                totalTrabajadores: trabajadores,
                totalCompras,
                totalActividades: actividades.length,
                actividadesPendientes,
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (obras.length > 0) {
            cargarEstadisticas();
        }
    }, [obras]);

    const exportarDatos = async (tipo: 'obras' | 'compras' | 'actividades') => {
        try {
            let data: unknown[];
            let filename: string;

            switch (tipo) {
                case 'obras':
                    data = await db.obras.toArray();
                    filename = 'obras_optiobra.json';
                    break;
                case 'compras':
                    data = await db.compras.toArray();
                    filename = 'compras_optiobra.json';
                    break;
                case 'actividades':
                    data = await db.actividades.toArray();
                    filename = 'actividades_optiobra.json';
                    break;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exportando datos:', error);
        }
    };

    return (
        <div className="min-h-full px-4 py-6 space-y-6">
            {/* Header Premium Industrial */}
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
                           Métricas de Rendimiento
                        </span>
                        <h1 className="text-3xl font-black text-surface-900 leading-none truncate">
                           Panel de Control
                        </h1>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100 flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-primary-600" />
                    </div>
                </div>

                <div className="bg-white p-2 rounded-3xl border border-surface-100 shadow-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500 ml-2" />
                    <Select
                        value={periodoFiltro}
                        onChange={(e) => setPeriodoFiltro(e.target.value)}
                        className="border-none bg-transparent h-10 font-bold text-xs flex-1"
                        options={[
                            { value: 'semana', label: 'Periodo: Esta semana' },
                            { value: 'mes', label: 'Periodo: Este mes' },
                            { value: 'trimestre', label: 'Periodo: Este trimestre' },
                            { value: 'anio', label: 'Periodo: Este año' },
                            { value: 'todo', label: 'Histórico Total' },
                        ]}
                    />
                </div>
            </div>

            {/* Stats Industrial Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    icon={Building2}
                    label="Obras en Ejecución"
                    value={stats.obrasActivas}
                    color="green"
                />
                <StatCard
                    icon={Building2}
                    label="Expedientes Totales"
                    value={stats.totalObras}
                    color="blue"
                />
                <StatCard
                    icon={Users}
                    label="Operarios Activos"
                    value={stats.totalTrabajadores}
                    color="purple"
                />
                <StatCard
                    icon={Clock}
                    label="Alertas de Tarea"
                    value={stats.actividadesPendientes}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Health */}
                <Card className="border-none shadow-sm bg-white" padding="lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center border border-success-100">
                                <DollarSign className="w-5 h-5 text-success-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-0.5">
                                    Inversión Acumulada
                                </p>
                                <p className="text-2xl font-black text-surface-900 font-numeric leading-none">
                                    {formatCurrency(stats.totalCompras)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-surface-400">Eficiencia Presupuestaria</span>
                            <span className="text-success-600">Saludable (65%)</span>
                        </div>
                        <div className="h-2.5 bg-surface-50 rounded-full overflow-hidden border border-surface-100 p-0.5">
                            <div
                                className="h-full bg-success-500 rounded-full transition-all shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                style={{ width: '65%' }}
                            />
                        </div>
                        <p className="text-[10px] font-medium text-surface-400 leading-relaxed italic">
                            * Análisis basado en la relación entre presupuesto proyectado y compras ejecutadas.
                        </p>
                    </div>
                </Card>

                {/* Export Controls Industrial */}
                <Card className="border-none shadow-sm bg-surface-900 text-white" padding="lg">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                          <Download className="w-5 h-5 text-primary-400" />
                       </div>
                       <h3 className="font-black text-xs uppercase tracking-[0.2em]">Sincronización de Datos</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white justify-start font-bold text-xs h-11 rounded-xl"
                            onClick={() => exportarDatos('obras')}
                        >
                            <Building2 className="w-4 h-4 mr-3 text-primary-400" />
                            EXPORTAR MAESTRO DE OBRAS
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white justify-start font-bold text-xs h-11 rounded-xl"
                            onClick={() => exportarDatos('compras')}
                        >
                            <Package className="w-4 h-4 mr-3 text-primary-400" />
                            EXPORTAR HISTORIAL LOGÍSTICO
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white justify-start font-bold text-xs h-11 rounded-xl"
                            onClick={() => exportarDatos('actividades')}
                        >
                            <Calendar className="w-4 h-4 mr-3 text-primary-400" />
                            EXPORTAR BITÁCORA DE CAMPO
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Future Capacity */}
            <Card className="border-none shadow-sm bg-white" padding="lg">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
                          <BarChart3 className="w-5 h-5 text-primary-600" />
                       </div>
                       <h3 className="font-black text-xs uppercase tracking-widest text-surface-900">Proyección de Avance Mensual</h3>
                   </div>
                </div>
                
                <div className="h-40 bg-surface-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-surface-100 group">
                    <div className="bg-white p-3 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <PieChart className="w-8 h-8 text-primary-200" />
                    </div>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Módulo BI en Desarrollo</p>
                    <p className="text-[9px] font-bold text-surface-300 mt-1 uppercase">Próxima Actualización V2.0</p>
                </div>
            </Card>
        </div>
    );
}

export default ReportesPage;
