---
description: Commit y push a GitHub
agent: build
---

Realiza commit y push al repositorio OptiObra:

## Pasos
1. `git status` para ver cambios pendientes
2. `git add .` para agregar archivos relevantes (NO agregues .env o secretos)
3. `git commit -m "$ARGUMENTS"` 
   - Si no se proporciona mensaje, genera uno descriptivo en espanol
   - Formato: `tipo: descripcion breve`
   - Tipos: feat, fix, refactor, style, docs, chore
4. `git push origin main`

## Repositorio
- URL: https://github.com/NikoRNJ/Optiobra
- Branch: main

## Antes de Push
- Verifica que `npm run build` pase sin errores
- No incluyas archivos sensibles (.env, tokens, keys)

## Ejemplo de Mensaje
```
feat: agregar calculadora de radier con NCh 170
fix: corregir validacion de RUT en formulario trabajador
refactor: extraer hook useOfflineSync para reutilizar logica
```
