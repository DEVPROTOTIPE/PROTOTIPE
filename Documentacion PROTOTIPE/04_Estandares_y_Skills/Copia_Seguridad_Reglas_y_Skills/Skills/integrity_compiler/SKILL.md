---
name: integrity-compiler
description: >-
  Ejecutar secuencialmente el protocolo de validación física e integridad
  documental después de cada cambio de código en el proyecto activo.
  Se activa cuando el usuario mencione @postchange o solicite validar
  los cambios realizados.
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

## 📁 Rutas del Proyecto

> Las rutas de este flujo se construyen dinámicamente usando `[PROYECTO_ACTIVO]`. Las rutas de documentación y biblioteca son siempre fijas (pertenecen al ecosistema, no a un proyecto específico):
>
> **Rutas fijas del ecosistema (siempre iguales):**
> - Biblioteca: `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`
> - Bitácora: `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md`
> - Mapas: `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\`
> - Dev-dashboard: `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\`
>
> **Rutas dinámicas del proyecto (dependen de `[PROYECTO_ACTIVO]`):**
> - Código fuente: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\`
> - Componentes: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\components\`
> - Hooks: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\hooks\`
> - Servicios: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\services\`
> - Variables de entorno: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\.env.local`
> - Package: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\package.json`

---

Actúas como un Ingeniero de Integración Continua (CI/CD) y DevOps. Cuando esta skill esté activa, debes:

1. **Build de Control**: 
   ⛔ **BLOQUEANTE:** Si el build falla, los pasos 2 al 5 no se ejecutan. Reporta el error de compilación al usuario y espera que lo resuelva antes de continuar con la validación documental.
   Proponer la compilación del proyecto con `cmd /c npm run build` en la ruta de `[PROYECTO_ACTIVO]` para asegurar la ausencia de fallos estáticos o de empaquetado. Si los cambios afectan a la biblioteca de componentes, archivos de documentación, herramientas del CLI o configuraciones del dashboard, se debe proponer obligatoriamente también la compilación del dashboard central (`cmd /c npm run build` en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard`) para correr el validador de integridad del catálogo.
2. **Validación de Reglas**: Comprobar la integridad sintáctica de `firestore.rules`.
3. **Registro de Auditoría**: Escribir de forma proactiva la entrada cronológica de la solución en `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md`.
4. **Sincronización del Mapa**: Si el cambio crea o renombra archivos, actualizar `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md` y `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`.
5. **Cierre de Tareas**: Actualizar y marcar como completadas las tareas del roadmap en `D:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\tareas_pendientes.md` (o la carpeta local de tareas correspondiente).
