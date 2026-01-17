---
description: Crear Pull Request en GitHub
agent: build
---

Crea un Pull Request para: $ARGUMENTS

## Pasos
1. Crear branch desde main:
   ```
   git checkout -b feature/$1
   ```
   (convierte espacios a guiones y usa minusculas)

2. Commit de cambios actuales si hay:
   ```
   git add .
   git commit -m "feat: $ARGUMENTS"
   ```

3. Push del branch:
   ```
   git push -u origin feature/$1
   ```

4. Crear PR con `gh pr create`:
   ```
   gh pr create --title "feat: $ARGUMENTS" --body "$(cat <<'EOF'
   ## Resumen
   - Descripcion de los cambios
   
   ## Tipo de Cambio
   - [ ] Nueva funcionalidad
   - [ ] Correccion de bug
   - [ ] Refactorizacion
   
   ## Checklist
   - [ ] Build pasa sin errores
   - [ ] Funciona offline (Dexie.js)
   - [ ] Mobile first (44px minimo)
   EOF
   )"
   ```

## Repositorio
- URL: https://github.com/NikoRNJ/Optiobra
- Base branch: main

## Al Finalizar
Muestra la URL del PR creado.
