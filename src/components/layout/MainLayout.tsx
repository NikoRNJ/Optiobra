/**
 * OptiObra - MainLayout Component
 * Layout principal con espaciado centrado
 */

import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen min-h-dvh bg-surface-100">
      {/* Sidebar - visible en desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-8">
          {children}
        </main>

        {/* Bottom navigation - visible en móvil */}
        <BottomNav />
      </div>
    </div>
  );
}

export default MainLayout;
