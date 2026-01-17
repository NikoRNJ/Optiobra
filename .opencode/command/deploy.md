---
description: Build de produccion y sync con Android (Capacitor)
agent: build
---

Ejecuta el proceso de deploy para OptiObra:

## Pasos

### 1. Build de Produccion
```bash
npm run build
```
- Verifica que no haya errores de TypeScript
- Verifica que no haya errores de Vite

### 2. Sincronizar con Capacitor
```bash
npx cap sync android
```
- Copia los assets de `dist/` a la carpeta Android
- Actualiza plugins nativos si hay cambios

### 3. Verificar Estado
```bash
npx cap doctor
```
- Muestra el estado de la configuracion de Capacitor

## Si Todo OK
Indica como abrir en Android Studio:
```bash
npx cap open android
```

## Si Hay Errores
- Muestra los errores especificos
- Sugiere como corregirlos
- NO continues con el sync si el build falla

## Notas
- El proyecto usa Capacitor v8
- Target: Android (no iOS por ahora)
- Los assets van a `android/app/src/main/assets/public/`
