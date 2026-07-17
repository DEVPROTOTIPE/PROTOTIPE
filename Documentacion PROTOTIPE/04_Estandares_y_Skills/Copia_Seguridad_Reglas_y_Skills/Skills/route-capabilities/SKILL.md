---
name: route-capabilities
description: "Selecciona la combinación mínima de skills, agentes y herramientas aprobadas para tareas ambiguas, transversales o sensibles en PROTOTIPE. Activar antes de arquitectura, seguridad, backend/cloud, documentación transversal, releases o cuando existan tres o más capacidades plausibles. No instala ni actualiza herramientas."
---

# Enrutar capacidades de PROTOTIPE

## Propósito

Elegir capacidades por evidencia, riesgo, permisos y costo de contexto. Esta skill
no resuelve la tarea final y no concede autorizaciones.

## Fuentes

- Contrato: `.agents/AI_WORKFLOW.md`
- Registro: `.agents/capabilities/registry.json`
- Consulta determinista:
  `.agents/skills/route-capabilities/scripts/query-registry.mjs`

## Instrucciones

1. Confirmar tarea, alcance, rutas, lectura/escritura, efectos externos, datos,
   riesgo, evidencia y criterio de cierre.
2. Validar el registro:

   ```powershell
   $node = 'D:\PROTOTIPE_TOOLS\node-v22.23.0-win-x64\node.exe'
   & $node .agents/skills/route-capabilities/scripts/query-registry.mjs --validate
   ```

3. Consultar con términos específicos:

   ```powershell
   $node = 'D:\PROTOTIPE_TOOLS\node-v22.23.0-win-x64\node.exe'
   & $node .agents/skills/route-capabilities/scripts/query-registry.mjs --query "seguridad firebase reglas"
   ```

4. Considerar por defecto únicamente estados permitidos por `policy`.
5. Elegir una capacidad principal. Añadir otra solo si cubre un riesgo o evidencia
   diferente. Para seguridad, arquitectura, datos, billing o release, asignar un
   revisor independiente.
6. Si se selecciona una skill interna bajo `.agents/skills`, leer su `SKILL.md`
   completo antes de actuar. No cargar las skills descartadas.
7. Si no hay resultado suficiente, devolver `DISCOVERY_REVIEW_REQUIRED` y usar
   `find-skills-governed` solo con autorización para acceder a red.
8. Antes de ejecutar, presentar la decisión al fundador en lenguaje sencillo.

## Salida obligatoria

```text
ROUTING_DECISION
Tarea:
Riesgo:
Principal:
Revisor opcional:
Herramientas:
Descartadas y motivo:
Permisos requeridos:
Pruebas/evidencia:
Estado: READY | BLOCKED | DISCOVERY_REVIEW_REQUIRED
```

## Bloqueos

- No instalar, actualizar, eliminar ni ejecutar capacidades externas.
- No seleccionar por puntuación o popularidad solamente.
- No usar paquetes completos cuando una capacidad pequeña cubra la tarea.
- No usar `--all`, `-g`, `-y`, scripts remotos por pipe ni URLs Git arbitrarias.
- No declarar selección perfecta; registrar incertidumbre y alternativas.

## Verificación

- El registro pasa `--validate`.
- Cada selección tiene estado permitido y una ruta/origen identificable.
- Las capacidades descartadas no se cargaron ni ejecutaron.
- La decisión respeta `.agents/AI_WORKFLOW.md`.
