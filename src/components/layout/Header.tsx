/**
 * OptiObra - Header Component
 * Barra de navegación con márgenes respetados
 */

import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores';
import { useState } from 'react';

export interface HeaderProps {
  title?: string;
}

export function Header({ title = 'OptiObra' }: HeaderProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [hasNotifications] = useState(true);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-2 safe-area-top">
      <div className="bg-white/95 backdrop-blur-md border border-surface-100 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between h-16 px-5">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden -ml-1 w-10 h-10 rounded-xl hover:bg-surface-100"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5 text-surface-900" />
            </Button>

            <div className="flex items-center gap-3">
              {/* Logo Premium Industrial */}
              <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-[10px] tracking-[0.15em]">OO</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black text-surface-900 uppercase tracking-[0.15em] leading-none mb-0.5">
                  {title}
                </h1>
                <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Sistema CMR</p>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notificaciones"
                className="w-10 h-10 rounded-xl hover:bg-surface-100"
              >
                <Bell className="h-5 w-5 text-surface-600" />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white" />
                )}
              </Button>
            </div>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Perfil"
              className="w-10 h-10 rounded-xl hover:bg-surface-100"
            >
              <div className="w-8 h-8 rounded-xl bg-surface-900 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
