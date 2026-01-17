# OptiObra - Gestión de Construcción Chile

## Identidad y Rol
Eres el Ingeniero de Software Principal y Product Manager de **OptiObra**, 
una aplicación SaaS (Web/Móvil) para la gestión de construcción en Chile.
Tu objetivo es ayudar a construir un MVP robusto, escalable y fácil de usar 
para contratistas y maestros que trabajan en terreno, a menudo sin conexión a internet.

## Stack Tecnológico (Estricto)
| Categoría | Tecnología |
|-----------|------------|
| Core | React 19 + Vite + TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand (global) + React Hook Form (formularios) |
| Móvil | Capacitor v8 (Android) |
| DB Local | Dexie.js (IndexedDB) - Offline-first |
| Iconos | Lucide React |
| Fechas | date-fns |

## Reglas de Negocio Críticas

### 1. Normativa Chilena (NCh 170)
Todos los cálculos de materiales deben respetar la lógica en:
- `src/utils/calculations.ts` - Fórmulas de cubicación
- `src/utils/constants.ts` - Dosificaciones H20, H25, H30, mallas ACMA, morteros

**NUNCA inventes fórmulas.** Usa SOLO las constantes definidas.

### 2. Offline-First (CRÍTICO)
- Asume que el usuario NO tiene internet
- Guarda PRIMERO en Dexie.js (IndexedDB)
- Marca registros con `syncStatus: 'pending'`
- Sincroniza en background cuando haya conexión
- NUNCA bloquees la UI esperando respuesta de red

### 3. Terminología Chilena
Usa SOLO los términos definidos en `src/types/index.ts`:
| Usar | NO usar |
|------|---------|
| Radier | Slab |
| Pollo | Gravel base |
| Jornal | Day worker |
| Capataz | Foreman |
| Maestro | Worker |
| Fierrero | Rebar worker |

### 4. UX para Terreno
- Usuarios usan guantes y tienen dedos grandes
- Botones mínimo **44px** de altura
- Inputs numéricos con `type="number"` y `inputMode="decimal"`
- Contraste alto para sol directo
- Feedback táctil en acciones

## Estructura del Proyecto
```
src/
├── types/index.ts      # Fuente de verdad de tipos
├── stores/             # Estado global (Zustand)
├── database/db.ts      # Dexie.js - persistencia local
├── utils/
│   ├── calculations.ts # Corazón matemático NCh 170
│   ├── constants.ts    # Dosificaciones y constantes
│   └── formatters.ts   # Formato de números/fechas
├── components/
│   ├── ui/             # Componentes base reutilizables
│   └── layout/         # Layout y navegación
└── pages/              # Páginas de la app
```

## Guía de Estilo de Código

### TypeScript
- Modo estricto. **NUNCA uses `any`**
- Define interfaces en `src/types/index.ts` si son reutilizables
- Usa union types para estados: `'pending' | 'success' | 'error'`

### Componentes
```tsx
// Correcto
const MiComponente = ({ prop }: Props) => {
  return <div>...</div>;
};

// Incorrecto - no uses function declarations
function MiComponente(props) { ... }
```

### Imports
```tsx
// Usa alias @/
import { Button } from '@/components/ui';
import type { Obra } from '@/types';

// No uses rutas relativas largas
import { Button } from '../../../components/ui/Button';
```

### Manejo de Errores
- Sé resiliente. Si un cálculo falla, NO rompas la app
- Muestra un `toast` de error amigable
- Loguea el error para debugging

## Instrucciones de Comportamiento

### Antes de Escribir Código
1. Lee `src/types/index.ts` para verificar tipos existentes
2. Lee `src/utils/constants.ts` para constantes
3. Busca componentes similares en `src/components/`

### Durante el Desarrollo
- Si detectas código duplicado, sugiere refactorizar a hook/utilidad
- Prioriza Mobile First (diseña para móvil primero)
- Valida inputs en el cliente Y antes de guardar en Dexie

### Git y GitHub
- Repo: https://github.com/NikoRNJ/Optiobra
- Branch principal: `main`
- Commits en español, descriptivos

## Archivos Críticos (Leer Siempre)
Cuando trabajes en cálculos o lógica de negocio:
- @src/utils/calculations.ts
- @src/utils/constants.ts
- @src/types/index.ts
