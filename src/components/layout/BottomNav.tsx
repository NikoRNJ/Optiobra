/**
 * OptiObra - BottomNav Component
 * Navegación inferior flotante con márgenes
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  HardHat,
  Calculator,
  CalendarDays,
  LayoutGrid
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/obras', icon: HardHat, label: 'Obras' },
  { to: '/cubicacion', icon: Calculator, label: 'Cubicar' },
  { to: '/actividades', icon: CalendarDays, label: 'Tareas' },
  { to: '/mas', icon: LayoutGrid, label: 'Más' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-5 pb-4 safe-area-bottom">
      {/* Floating nav container */}
      <div className="bg-white border border-surface-200 rounded-2xl shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));
            const isCenterItem = index === 2;

            if (isCenterItem) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative flex flex-col items-center justify-center -mt-6"
                >
                  {/* Floating Button */}
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      shadow-lg transition-all duration-150 press-effect
                      ${isActive
                        ? 'bg-primary-600'
                        : 'bg-primary-600 hover:bg-primary-700'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={`
                      text-[9px] font-bold mt-1 uppercase tracking-wide
                      ${isActive ? 'text-primary-600' : 'text-surface-500'}
                    `}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center justify-center h-full px-2"
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-600 rounded-b-full" />
                )}

                {/* Icon */}
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center
                    transition-all duration-150
                    ${isActive ? 'bg-primary-50' : ''}
                  `}
                >
                  <item.icon
                    className={`
                      h-5 w-5 transition-colors duration-150
                      ${isActive ? 'text-primary-600' : 'text-surface-400'}
                    `}
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[9px] uppercase tracking-wide
                    ${isActive ? 'font-bold text-primary-600' : 'font-semibold text-surface-400'}
                  `}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
