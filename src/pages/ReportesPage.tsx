/**
 * OptiObra - Página de Reportes
 * Dashboard con métricas y exportación de datos
 */

import { useState, useEffect } from 'react';
import {
    FileText,
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
        blue: 'bg-primary-100 text-primary-600',
        green: 'bg-success-100 text-success-600',
        orange: 'bg-accent-100 text-accent-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <Card>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${colorStyles[color]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-2xl font-black text-surface-900 font-numeric">
                        {value}{suffix}
                    </p>
                    <p className="text-sm font-medium text-surface-600 truncate">{label}</p>
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
        <div className="min-h-full px-5 py-4">
            {/* Header */}
            <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
                <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-black text-surface-900">Reportes</h1>
                            <p className="text-sm text-surface-600">Dashboard y estadísticas</p>
                        </div>
                    </div>

                    <Select
                        value={periodoFiltro}
                        onChange={(e) => setPeriodoFiltro(e.target.value)}
                        options={[
                            { value: 'semana', label: 'Esta semana' },
                            { value: 'mes', label: 'Este mes' },
                            { value: 'trimestre', label: 'Este trimestre' },
                            { value: 'anio', label: 'Este año' },
                            { value: 'todo', label: 'Todo el tiempo' },
                        ]}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard
                    icon={Building2}
                    label="Obras Activas"
                    value={stats.obrasActivas}
                    color="green"
                />
                <StatCard
                    icon={Building2}
                    label="Total Obras"
                    value={stats.totalObras}
                    color="blue"
                />
                <StatCard
                    icon={Users}
                    label="Trabajadores"
                    value={stats.totalTrabajadores}
                    color="purple"
                />
                <StatCard
                    icon={Clock}
                    label="Tareas Pendientes"
                    value={stats.actividadesPendientes}
                    color="orange"
                />
            </div>

            {/* Financial Summary */}
            <Card className="mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-surface-500 uppercase tracking-wide">
                            Total en Compras
                        </p>
                        <p className="text-2xl font-black text-surface-900 font-numeric">
                            {formatCurrency(stats.totalCompras)}
                        </p>
                    </div>
                </div>

                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-success-500 rounded-full transition-all"
                        style={{ width: '65%' }}
                    />
                </div>
                <p className="text-xs text-surface-500 mt-2">
                    65% del presupuesto total utilizado
                </p>
            </Card>

            {/* Export Section */}
            <Card className="mb-4">
                <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Datos
                </h3>
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => exportarDatos('obras')}
                        leftIcon={<Building2 className="w-4 h-4" />}
                    >
                        Exportar Obras (JSON)
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => exportarDatos('compras')}
                        leftIcon={<Package className="w-4 h-4" />}
                    >
                        Exportar Compras (JSON)
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => exportarDatos('actividades')}
                        leftIcon={<Calendar className="w-4 h-4" />}
                    >
                        Exportar Actividades (JSON)
                    </Button>
                </div>
            </Card>

            {/* Chart Placeholder */}
            <Card>
                <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Actividad Mensual
                </h3>
                <div className="h-48 bg-surface-50 rounded-xl flex items-center justify-center border-2 border-dashed border-surface-200">
                    <div className="text-center">
                        <PieChart className="w-12 h-12 text-surface-300 mx-auto mb-2" />
                        <p className="text-sm text-surface-500 font-medium">
                            Gráficos próximamente
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ReportesPage;
