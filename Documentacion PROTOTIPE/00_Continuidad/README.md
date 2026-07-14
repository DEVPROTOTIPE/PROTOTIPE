# 00_Continuidad — Sistema de Empaquetado Temático de PROTOTIPE

Esta carpeta contiene las herramientas, índices y manifiestos diseñados para el empaquetado de contexto técnico del proyecto por temas. Su propósito es permitir cargar en conversaciones futuras únicamente el contexto correspondiente al tema de trabajo actual, en lugar de toda la documentación del proyecto.

## Estructura de Directorios

- `canonical/`: Contiene fuentes de documentación crítica que no se pueden modificar, con hashes estáticos y fijos:
  - `00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md`
  - `Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md`
  - `Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md`
- `index/`: Contiene el manifiesto estático de clasificaciones (`context-metadata.json`), el índice físico completo resuelto (`context-index.json`) y su representación legible (`context-index.md`).
- `selections/`: Contiene los manifiestos de selección de secciones por tema (ej. `migracion-claude-code.selection.json`).
- `packages/`: Carpetas autocontenidas por tema de desarrollo (ej. `migracion-claude-code/`), con sus fragmentos de texto exactos, referencias y alertas.
- `tools/`: Contiene el script extractor determinista v1.1 (`build-context-package.mjs`) y el conjunto de pruebas de robustez (`verify_robustness.js`).

## Reglas de Limpieza y Atomicidad

- **Sin Residuos de Fallos:** Si la validación de un manifiesto de selección falla por cualquier motivo (ej. traversal, hash incorrecto, solapamientos), el script extractor abortará la ejecución **antes** de crear cualquier directorio o escribir cualquier archivo en `packages/`.
- **Estructura Requerida:** Todo tema de paquete requiere los archivos estáticos `00_LEEME.md` y `01_CONTEXTO_MINIMO.md` preexistentes en su carpeta de salida antes de completar la compilación final.

## Comandos Operativos

### 1. Generar / Actualizar el Índice Semántico
Escanea todos los archivos Markdown versionados en Git y genera el índice físico:
```bash
node "Documentacion PROTOTIPE/00_Continuidad/tools/build-context-package.mjs" --index
```

### 2. Generar un Paquete de Contexto Temático (Extractor v1.1)
Procesa un manifiesto de selección específico para crear un paquete consolidado determinista:
```bash
node "Documentacion PROTOTIPE/00_Continuidad/tools/build-context-package.mjs" --selection "Documentacion PROTOTIPE/00_Continuidad/selections/migracion-claude-code.selection.json"
```

### 3. Ejecutar el Conjunto de Pruebas de Robustez
Ejecuta la suite automática de pruebas negativas y determinismo:
```bash
node "Documentacion PROTOTIPE/00_Continuidad/tools/verify_robustness.js"
```

## Procedimiento de Revisión Humana

1. Todas las secciones importadas inician con el estado `PENDING_HUMAN_REVIEW`.
2. El revisor humano debe auditar el contenido de `02_FUENTES_SELECCIONADAS.md` para verificar que la información es canónica y no contiene secretos.
3. Para aprobar la clasificación, se debe cambiar el campo `classificationReviewStatus` a `APPROVED` en el manifiesto de selección correspondiente y re-generar el paquete.
