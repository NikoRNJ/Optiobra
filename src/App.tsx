/**
 * OptiObra - Sistema de Gestión para Construcción
 * App principal con enrutamiento y code-splitting
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Toast, PageLoader } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import './index.css';

// Lazy load de páginas para reducir bundle inicial
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const ObrasPage = lazy(() => import('@/pages/ObrasPage').then(m => ({ default: m.ObrasPage })));
const NuevaObraPage = lazy(() => import('@/pages/NuevaObraPage').then(m => ({ default: m.NuevaObraPage })));
const ObraDetallePage = lazy(() => import('@/pages/ObraDetallePage').then(m => ({ default: m.ObraDetallePage })));
const NuevoTrabajadorPage = lazy(() => import('@/pages/NuevoTrabajadorPage').then(m => ({ default: m.NuevoTrabajadorPage })));
const CubicacionPage = lazy(() => import('@/pages/CubicacionPage').then(m => ({ default: m.CubicacionPage })));
const ActividadesPage = lazy(() => import('@/pages/ActividadesPage').then(m => ({ default: m.ActividadesPage })));
const NuevaActividadPage = lazy(() => import('@/pages/NuevaActividadPage').then(m => ({ default: m.NuevaActividadPage })));
const ActividadDetallePage = lazy(() => import('@/pages/ActividadDetallePage').then(m => ({ default: m.ActividadDetallePage })));
const ComprasPage = lazy(() => import('@/pages/ComprasPage').then(m => ({ default: m.ComprasPage })));
const NuevaCompraPage = lazy(() => import('@/pages/NuevaCompraPage').then(m => ({ default: m.NuevaCompraPage })));
const MaterialesPage = lazy(() => import('@/pages/MaterialesPage').then(m => ({ default: m.MaterialesPage })));
const ReportesPage = lazy(() => import('@/pages/ReportesPage').then(m => ({ default: m.ReportesPage })));
const MasPage = lazy(() => import('@/pages/MasPage').then(m => ({ default: m.MasPage })));

function App() {
  const { toasts } = useUIStore();

  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<PageLoader message="Cargando página..." />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Obras */}
            <Route path="/obras" element={<ObrasPage />} />
            <Route path="/obras/nueva" element={<NuevaObraPage />} />
            <Route path="/obras/:id" element={<ObraDetallePage />} />
            <Route path="/obras/:obraId/trabajadores/nuevo" element={<NuevoTrabajadorPage />} />

            {/* Cubicación */}
            <Route path="/cubicacion" element={<CubicacionPage />} />

            {/* Actividades/Tareas */}
            <Route path="/actividades" element={<ActividadesPage />} />
            <Route path="/actividades/nueva" element={<NuevaActividadPage />} />
            <Route path="/actividades/:id" element={<ActividadDetallePage />} />

            {/* Compras */}
            <Route path="/compras" element={<ComprasPage />} />
            <Route path="/compras/nueva" element={<NuevaCompraPage />} />

            {/* Materiales */}
            <Route path="/materiales" element={<MaterialesPage />} />

            {/* Reportes */}
            <Route path="/reportes" element={<ReportesPage />} />

            {/* Más opciones */}
            <Route path="/mas" element={<MasPage />} />

            {/* Placeholders para rutas futuras */}
            <Route path="/configuracion" element={<MasPage />} />
            <Route path="/notificaciones" element={<MasPage />} />
            <Route path="/datos" element={<MasPage />} />
            <Route path="/ayuda" element={<MasPage />} />
            <Route path="/acerca" element={<MasPage />} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>

      {/* Toasts globales */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
          />
        ))}
      </div>
    </BrowserRouter>
  );
}

export default App;
