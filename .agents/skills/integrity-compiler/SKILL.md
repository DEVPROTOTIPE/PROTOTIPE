---
name: integrity-compiler
description: >-
  Ejecutar secuencialmente el protocolo de validación física e integridad
  documental después de cada cambio de código en el proyecto activo.
  Se activa de forma automática en segundo plano tras cualquier edición de
  código, o manualmente con @postchange.
trigger: "@postchange"
aliases:
  - "@postchange [PROYECTO_ACTIVO?]"
---

# Integrity Compiler Instructions

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto sobre el que se está trabajando. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@postchange "App Reservas"`), usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar: "¿En qué proyecto estás trabajando? Indica la ruta o el nombre de la plantilla."

---

## 📁 Rutas del Proyecto Portables

> Las rutas se construyen dinámicamente usando el directorio raíz del ecosistema `[GIT_ROOT]`:
>
> **Rutas fijas del ecosistema (portables):**
> - Biblioteca: `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`
> - Bitácora: `[GIT_ROOT]/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`
> - Mapas: `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/`
> - Dev-dashboard: `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard/`
>
> **Rutas dinámicas del proyecto (dependen de `[PROYECTO_ACTIVO]`):**
> - Código fuente: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/`
> - Componentes: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/components/`
> - Hooks: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/hooks/`
> - Servicios: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/services/`
> - Variables de entorno: `[GIT_ROOT]/[PROYECTO_ACTIVO]/.env.local`
> - Package: `[GIT_ROOT]/[PROYECTO_ACTIVO]/package.json`

---

Actúas como un Ingeniero de Integración Continua (CI/CD) y DevOps. Esta skill se ejecuta **automáticamente** en segundo plano tras cualquier cambio físico de código o de forma manual mediante trigger. Debes:

1. **Validación de Integridad y Build de Control (Autónomo e Invisible)**: 
   ⛔ **BLOQUEANTE:** Si la validación sintáctica o el build fallan, detén la ejecución del protocolo. Reporta de inmediato el error al usuario y corrígelo de forma proactiva en ese mismo turno.
   - Ejecuta primero la validación sintáctica del Core con `cmd /c npm run validate` en la ruta de `[PROYECTO_ACTIVO]` (si está declarada en su `package.json`).
   - Propón y ejecuta la compilación del proyecto con `cmd /c npm run build` en la ruta de `[PROYECTO_ACTIVO]` para asegurar la ausencia de fallos estáticos o de empaquetado. Si los cambios afectan a la biblioteca de componentes, archivos de documentación, herramientas del CLI o configuraciones del dashboard, compila obligatoriamente también el dashboard central (`cmd /c npm run build` en `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard`).
2. **Validación de Reglas**: Comprobar la integridad sintáctica de `firestore.rules`.
3. **Registro de Auditoría Silencioso**: Escribir de forma proactiva la entrada cronológica de la solución en `[GIT_ROOT]/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`.
4. **Sincronización del Mapa**: Si el cambio crea o renombra archivos, actualizar `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md` y `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`.
4.5. **Sincronización del Prompt Maestro**: Si el cambio modifica, crea o remueve algún componente de la biblioteca en `06_Biblioteca_Componentes`, debes ejecutar obligatoriamente `node scripts/sync-discovery-prompt.cjs` en `[GIT_ROOT]/Prototipe-CLI/` para regenerar el catálogo vivo y las llaves de ejemplo en el prompt de descubrimiento.
5. **Cierre de Tareas**: Actualizar y marcar como completadas las tareas del roadmap en `[GIT_ROOT]/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md` (o la carpeta local de tareas correspondiente).

