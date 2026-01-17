/**
 * OptiObra - Sistema de Gestión para Construcción
 * App principal con enrutamiento
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Toast } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import {
  HomePage,
  ObrasPage,
  NuevaObraPage,
  ObraDetallePage,
  NuevoTrabajadorPage,
  CubicacionPage,
  ActividadesPage,
  NuevaActividadPage,
  ActividadDetallePage,
  ComprasPage,
  NuevaCompraPage,
  MaterialesPage,
  ReportesPage,
  MasPage,
} from '@/pages';
import './index.css';

function App() {
  const { toasts } = useUIStore();

  return (
    <BrowserRouter>
      <MainLayout>
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
