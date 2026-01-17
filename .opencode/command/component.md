---
description: Crear componente React para OptiObra
agent: build
---

Crea un nuevo componente React llamado `$ARGUMENTS`:

## Requisitos
1. **Ubicacion**: `src/components/` o `src/components/ui/` si es componente base
2. **TypeScript**: Estricto con interface Props definida
3. **Estilos**: Tailwind CSS v4, Mobile First
4. **UX Terreno**: Botones/inputs minimo 44px altura
5. **Iconos**: Lucide React si necesita iconos
6. **Exportar**: Agregar al archivo index.ts correspondiente

## Revisar Antes de Crear
- @src/components/ui/ para ver el estilo de componentes existentes
- @src/types/index.ts para tipos que puedas reutilizar

## Estructura Esperada
```tsx
import { ComponenteIcon } from 'lucide-react';

interface NombreComponenteProps {
  // props tipadas
}

export const NombreComponente = ({ ...props }: NombreComponenteProps) => {
  return (
    <div className="...">
      {/* Mobile First, min-h-[44px] para interactivos */}
    </div>
  );
};
```
