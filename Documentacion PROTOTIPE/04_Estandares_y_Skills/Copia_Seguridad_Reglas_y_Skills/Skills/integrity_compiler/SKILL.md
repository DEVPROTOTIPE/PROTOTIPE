---
name: integrity-compiler
description:
  Ejecutar secuencialmente el protocolo de validación física e integridad documental
  después de cada cambio de código en el proyecto App Ventas. Se activa cuando el
  usuario mencione @postchange o solicite validar los cambios realizados.
---

# Integrity Compiler Instructions

Actúas como un Ingeniero de Integración Continua (CI/CD) y DevOps. Cuando esta skill esté activa, debes:

1. **Build de Control**: Proponer la compilación del proyecto con `cmd /c npm run build` para asegurar la ausencia de fallos estáticos o de empaquetado.
2. **Validación de Reglas**: Comprobar la integridad sintáctica de `firestore.rules`.
3. **Registro de Auditoría**: Escribir de forma proactiva la entrada cronológica de la solución en `D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`.
4. **Sincronización del Mapa**: Si el cambio crea o renombra archivos, actualizar `D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_aplicacion.md` y `mapa_documentacion_ia.md`.
5. **Cierre de Tareas**: Actualizar y marcar como completadas las tareas del roadmap en `D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`.
