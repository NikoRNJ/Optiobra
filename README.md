# 🏗️ OptiObra - Sistema CMR para Construcción

> Sistema de gestión integral para empresas de construcción en Chile. Aplicación web progresiva (PWA) offline-first diseñada para maestros, contratistas y empresas constructoras.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)

## 📋 Descripción

**OptiObra** es un MVP de sistema CMR (Construction Resource Management) que permite gestionar obras de construcción de manera eficiente. Desarrollado con tecnologías modernas y pensado para funcionar offline en terreno.

## ✨ Características Principales

### 🏢 Gestión de Obras
- Crear, editar y eliminar proyectos de construcción
- Estados: Planificación, En Progreso, Pausada, Finalizada
- Seguimiento de fechas, presupuestos y clientes
- Geolocalización GPS de obras

### 👷 Gestión de Trabajadores
- Registro de trabajadores por obra
- 20+ tipos de labores (Jornal, Maestro Primera, Carpintero, etc.)
- Control de estados: Activo, Inactivo, Finalizado
- Almacenamiento de contratos y documentos

### 📊 Cubicación de Materiales
- Calculadora de materiales según NCh 170 (Normativa Chilena)
- Tipos: Terreno, Zapata, Radier, Muro, Losa, Pilar, Viga, etc.
- Dosificaciones de hormigón (H20 a H40)
- Cálculo automático de cemento, arena, gravilla y agua

### 📅 Registro de Actividades
- Bitácora diaria/semanal de obra
- Adjuntar fotos y videos
- Prioridades y estados
- Historial completo por obra

### 🛒 Control de Compras
- Registro de compras de materiales
- Cálculo automático de IVA (19%)
- Estados: Pendiente, Pagada, Entregada
- Seguimiento por proveedor

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2 | UI Framework |
| **TypeScript** | 5.9 | Tipado estático |
| **Vite** | 7.2 | Build tool |
| **Tailwind CSS** | 4.1 | Estilos |
| **Zustand** | 5.0 | Estado global |
| **Dexie** | 4.2 | IndexedDB (offline) |
| **React Hook Form** | 7.69 | Formularios |
| **Zod** | 4.3 | Validación |
| **date-fns** | 4.1 | Fechas |
| **Lucide React** | 0.562 | Iconos |
| **Recharts** | 3.6 | Gráficos |

## 📂 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # MainLayout, Header, Sidebar, BottomNav
│   └── ui/              # Button, Card, Input, Modal, Badge, etc.
├── database/
│   └── db.ts            # Dexie IndexedDB + Repositorios
├── pages/               # Páginas de la aplicación
│   ├── HomePage.tsx     # Dashboard principal
│   ├── ObrasPage.tsx    # Listado de obras
│   ├── NuevaObraPage.tsx
│   ├── ObraDetallePage.tsx
│   ├── CubicacionPage.tsx
│   ├── ActividadesPage.tsx
│   ├── ComprasPage.tsx
│   └── ...
├── stores/              # Estado global (Zustand)
│   ├── obraStore.ts
│   ├── trabajadorStore.ts
│   └── uiStore.ts
├── types/               # Tipos TypeScript
│   └── index.ts
├── utils/               # Utilidades
│   ├── calculations.ts  # Cálculos de cubicación
│   ├── constants.ts     # Dosificaciones NCh
│   └── formatters.ts    # Formateadores CLP, RUT, fechas
└── App.tsx              # Router principal
```

## 🚀 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd CMR

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📱 Uso

1. **Inicio**: Dashboard con resumen de obras activas y acciones rápidas
2. **Obras**: Crear y gestionar proyectos de construcción
3. **Trabajadores**: Registrar personal por cada obra
4. **Cubicación**: Calcular materiales necesarios
5. **Actividades**: Documentar avance diario
6. **Compras**: Registrar gastos en materiales

## 🌐 Características Técnicas

- ✅ **Offline-First**: Funciona sin conexión usando IndexedDB
- ✅ **Responsive**: Diseño mobile-first
- ✅ **PWA Ready**: Instalable como app nativa
- ✅ **Type-Safe**: 100% TypeScript
- ✅ **Localizado**: Formato chileno (RUT, pesos, fechas)

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

Desarrollado con ❤️ para la industria de la construcción chilena.
