/**
 * OptiObra - Sidebar Component Premium
 * Menú lateral profesional para desktop con diseño moderno
 */

import { NavLink } from 'react-router-dom';
import {
  Home,
  HardHat,
  Calculator,
  CalendarDays,
  Package,
  ShoppingCart,
  Users,
  FileBarChart,
  Settings,
  X,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/obras', icon: HardHat, label: 'Obras', badge: 3 },
  { to: '/cubicacion', icon: Calculator, label: 'Cubicación' },
  { to: '/actividades', icon: CalendarDays, label: 'Actividades' },
];

const secondaryNavItems: NavItem[] = [
  { to: '/materiales', icon: Package, label: 'Materiales' },
  { to: '/compras', icon: ShoppingCart, label: 'Compras' },
  { to: '/trabajadores', icon: Users, label: 'Trabajadores' },
  { to: '/reportes', icon: FileBarChart, label: 'Reportes' },
];

const footerNavItems: NavItem[] = [
  { to: '/ayuda', icon: HelpCircle, label: 'Ayuda' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
];

function NavSection({ items, title }: { items: NavItem[]; title?: string }) {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="space-y-1">
      {title && (
        <p className="px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => `
            group flex items-center justify-between px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${isActive
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${isActive
                    ? 'bg-primary-100'
                    : 'bg-surface-100 group-hover:bg-surface-200'
                  }
                `}>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                </div>
                <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`
                    px-2 py-0.5 text-xs font-semibold rounded-full
                    ${isActive
                      ? 'bg-primary-200 text-primary-700'
                      : 'bg-surface-200 text-surface-600'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`
                  h-4 w-4 opacity-0 -translate-x-2 transition-all
                  group-hover:opacity-100 group-hover:translate-x-0
                  ${isActive ? 'opacity-100 translate-x-0 text-primary-500' : 'text-surface-400'}
                `} />
              </div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-white/95 backdrop-blur-lg border-r border-surface-200/50
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto lg:bg-white
          shadow-2xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-surface-100">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white font-bold">OO</span>
              </div>
              <div>
                <span className="font-bold text-surface-900 text-lg">OptiObra</span>
                <p className="text-xs text-surface-500 -mt-0.5">Sistema CMR</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-surface-100"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-surface-500" />
            </Button>
          </div>

          {/* User Profile Quick View */}
          <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                <span className="text-white font-semibold text-sm">JC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900 truncate">Juan Contractor</p>
                <p className="text-xs text-surface-500">Plan Profesional</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <NavSection items={mainNavItems} />
            <NavSection items={secondaryNavItems} title="Gestión" />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-surface-100 space-y-2">
            <NavSection items={footerNavItems} />

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-500 hover:bg-error-50 hover:text-error-600 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-surface-100 group-hover:bg-error-100 flex items-center justify-center transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
