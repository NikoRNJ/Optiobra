/**
 * OptiObra - Página "Más"
 * Menú de acceso a funciones adicionales
 */

import { Link } from 'react-router-dom';
import {
    Package,
    FileText,
    Settings,
    HelpCircle,
    Info,
    ChevronRight,
    Database,
    Bell
} from 'lucide-react';
import { Card } from '@/components/ui';

interface MenuItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    description: string;
    badge?: string;
}

function MenuItem({ to, icon: Icon, label, description, badge }: MenuItemProps) {
    return (
        <Link to={to}>
            <Card hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-surface-900">{label}</h3>
                        {badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-accent-100 text-accent-700 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-surface-600 truncate">{description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
            </Card>
        </Link>
    );
}

export function MasPage() {
    return (
        <div className="min-h-full px-5 py-4">
            {/* Header */}
            <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
                <div className="p-5">
                    <h1 className="text-xl font-black text-surface-900">Más Opciones</h1>
                    <p className="text-sm text-surface-600 mt-1">
                        Funciones adicionales y configuración
                    </p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
                {/* Sección Principal */}
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wide px-1">
                    Módulos
                </p>

                <MenuItem
                    to="/materiales"
                    icon={Package}
                    label="Materiales"
                    description="Inventario por obra"
                />

                <MenuItem
                    to="/reportes"
                    icon={FileText}
                    label="Reportes"
                    description="Estadísticas y exportación"
                    badge="Nuevo"
                />

                {/* Sección Configuración */}
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wide px-1 mt-6">
                    Configuración
                </p>

                <MenuItem
                    to="/configuracion"
                    icon={Settings}
                    label="Configuración"
                    description="Preferencias de la app"
                />

                <MenuItem
                    to="/notificaciones"
                    icon={Bell}
                    label="Notificaciones"
                    description="Gestionar alertas"
                />

                <MenuItem
                    to="/datos"
                    icon={Database}
                    label="Datos Offline"
                    description="Sincronización y respaldo"
                />

                {/* Sección Ayuda */}
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wide px-1 mt-6">
                    Ayuda
                </p>

                <MenuItem
                    to="/ayuda"
                    icon={HelpCircle}
                    label="Centro de Ayuda"
                    description="Tutoriales y FAQ"
                />

                <MenuItem
                    to="/acerca"
                    icon={Info}
                    label="Acerca de OptiObra"
                    description="Versión 1.0.0"
                />
            </div>

            {/* Footer Info */}
            <div className="mt-8 p-4 rounded-xl bg-surface-100 border border-surface-200 text-center">
                <p className="text-sm font-bold text-surface-700">OptiObra CMR</p>
                <p className="text-xs text-surface-500 mt-1">
                    Sistema de Gestión para Construcción
                </p>
                <p className="text-xs text-surface-400 mt-2">
                    © 2026 - Normativas NCh Chile
                </p>
            </div>
        </div>
    );
}

export default MasPage;
