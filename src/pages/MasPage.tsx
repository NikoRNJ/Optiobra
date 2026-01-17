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
        <Link to={to} className="group">
            <Card hover className="flex items-center gap-4 border-none shadow-sm group-active:scale-[0.98] transition-all" padding="md">
                <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 transition-colors">
                    <Icon className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">{label}</h3>
                        {badge && (
                            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-accent-500 text-white rounded-md shadow-sm shadow-accent-200">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] font-medium text-surface-500 mt-0.5 truncate uppercase tracking-tight">{description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-300 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Card>
        </Link>
    );
}

export function MasPage() {
    return (
        <div className="min-h-full px-4 py-6 space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between px-1">
                <div>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
                        Sistema OptiObra
                    </span>
                    <h1 className="text-2xl font-black text-surface-900 leading-none">Menú Principal</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-surface-400" />
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
                {/* Sección Principal */}
                <div className="flex items-center gap-2 px-1 mb-2">
                    <div className="h-1 w-1 rounded-full bg-primary-500" />
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">
                        Operaciones
                    </p>
                </div>

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
                <div className="flex items-center gap-2 px-1 mb-2 pt-6">
                    <div className="h-1 w-1 rounded-full bg-accent-500" />
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">
                        Configuración del Sistema
                    </p>
                </div>

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
                <div className="flex items-center gap-2 px-1 mb-2 pt-6">
                    <div className="h-1 w-1 rounded-full bg-success-500" />
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">
                        Soporte Técnico
                    </p>
                </div>

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
            <div className="mt-12 p-6 border-t border-surface-100 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-surface-900 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <p className="text-xs font-black text-surface-900 uppercase tracking-[0.2em]">OptiObra v1.0</p>
                </div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                    © 2026 - Control Maestro de Residenciales
                </p>
            </div>
        </div>
    );
}

export default MasPage;
