---
name: developer-manual-builder
description: Generación estructurada de manuales técnicos de integración en 07_Manuales_Desarrollo/ e indexación automática en mapa_documentacion_ia.md.
trigger: "@crear-manual"
aliases:
  - "@manual-componente"
---

# Skill de Creación de Manuales Técnicos (`developer-manual-builder`)

Esta skill automatiza la generación y registro de manuales técnicos de integración para componentes reactivos que superen los umbrales de complejidad (2+ hooks, Firebase connect, estado complejo con Zustand).

## 📁 Rutas de Acceso

- **Carpeta de destino:** `[GIT_ROOT]/Documentacion PROTOTIPE/07_Manuales_Desarrollo/[Categoría]/[NombreComponente]/`
- **Mapa de indexación:** `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`
- **Endpoint API:** `POST http://localhost:3001/api/library/manual`

## 🛠️ Procedimiento de Uso

1. **Trigger de IA:** `@crear-manual` o `@manual-componente`.
2. **Estructura del Manual:**
   - **Propósito:** Definición de alto nivel de por qué existe el componente.
   - **Arquitectura:** Flujo de datos y dependencias.
   - **Guía de Integración:** Código JSX de ejemplo y directivas paso a paso.
   - **Troubleshooting:** Casos borde resueltos y errores comunes.
3. **Escritura y Registro:**
   - El Bridge escribe el archivo Markdown bajo una ruta estructurada en español.
   - Agrega la entrada con su respectivo Criterio de Decisión en `mapa_documentacion_ia.md` en caliente.
