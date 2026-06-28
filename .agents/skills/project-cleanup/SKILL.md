---
name: project-cleanup
description: Limpieza segura de directorios temporales, cachés de Vite y carpetas dist/build para liberar espacio, con políticas rígidas de lista blanca.
trigger: "@limpiar-temporales"
aliases:
  - "@purgar-cache"
---

# Skill de Limpieza Segura (`project-cleanup`)

Esta skill permite purgar directorios residuales, cachés de empaquetado Vite y carpetas de build en el monorepo de forma no destructiva, protegiendo todo el código fuente y las variables de entorno locales.

## 📁 Rutas de Acceso

- **Directorios autorizados (Lista blanca estricta):**
  - `[Ruta_Cliente]/node_modules/.vite`
  - `[Ruta_Cliente]/node_modules/.vite-temp`
  - `[Ruta_Cliente]/dist`
  - `[Ruta_Cliente]/build`
  - `[GIT_ROOT]/Documentacion PROTOTIPE/02_Tareas_Roadmap/.tmp`
- **Endpoint API:** `POST http://localhost:3001/api/project/cleanup`

## 🛠️ Procedimiento de Uso

1. **Trigger de IA:** `@limpiar-temporales` o `@purgar-cache`.
2. **Políticas de Seguridad:**
   - Queda prohibido borrar archivos sueltos `.js`, `.jsx`, `.json`, `.css`, `.rules`, o `.env`.
   - El backend del CLI calcula la ruta absoluta en base al ID de instancia para prevenir Directory Traversal y inyecciones relativas maliciosas (`../`).
   - Tolera de forma segura la ausencia inicial de la carpeta `.tmp`.
