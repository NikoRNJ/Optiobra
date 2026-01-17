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
    <header className="sticky top-0 z-40 px-5 pt-4 pb-2 safe-area-top">
      <div className="bg-white border border-surface-200 rounded-2xl shadow-card">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden -ml-1 w-9 h-9"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2.5">
              {/* Logo */}
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xs tracking-tight">OO</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-black text-surface-900 leading-none">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notificaciones"
                className="w-9 h-9"
              >
                <Bell className="h-5 w-5" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full border-2 border-white" />
                )}
              </Button>
            </div>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Perfil"
              className="w-9 h-9"
            >
              <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
