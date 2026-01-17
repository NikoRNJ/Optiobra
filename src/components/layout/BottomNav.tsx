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
  { to: '/', icon: Home, label: 'PANEL' },
  { to: '/obras', icon: HardHat, label: 'OBRAS' },
  { to: '/cubicacion', icon: Calculator, label: 'CÁLCULO' },
  { to: '/actividades', icon: CalendarDays, label: 'TAREAS' },
  { to: '/mas', icon: LayoutGrid, label: 'GESTIÓN' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-4 safe-area-bottom">
      {/* Premium Industrial floating nav */}
      <div className="bg-white/95 backdrop-blur-md border border-surface-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));
            const isCenterItem = index === 2;

            if (isCenterItem) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative flex flex-col items-center justify-center -mt-10"
                >
                  {/* Tactical Floating Button */}
                  <div
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      shadow-2xl transition-all duration-300 active:scale-90
                      ${isActive
                        ? 'bg-surface-900 ring-4 ring-white'
                        : 'bg-primary-600 ring-4 ring-white'
                      }
                    `}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={`
                      text-[8px] font-black mt-1.5 uppercase tracking-[0.15em]
                      ${isActive ? 'text-surface-900' : 'text-surface-400'}
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
                className="relative flex flex-col items-center justify-center h-full px-1"
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-surface-900 rounded-full" />
                )}

                {/* Icon tactical */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isActive ? 'bg-surface-100' : ''}
                  `}
                >
                  <item.icon
                    className={`
                      h-5 w-5 transition-colors duration-300
                      ${isActive ? 'text-surface-900' : 'text-surface-400'}
                    `}
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[8px] font-black mt-1 uppercase tracking-[0.1em]
                    ${isActive ? 'text-surface-900' : 'text-surface-400'}
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
