# 🛡️ Informe de Auditoría Técnica: Inyección de Features y Feature Flags

**ID de Auditoría:** AUD-CLI-493  
**Severidad Global:** CRÍTICA  
**Ubicación:** `Prototipe-CLI/server.js` (add/remove endpoints) & `dev-dashboard/src/components/admin/FeatureFlagManager.jsx`  
**Fecha:** 2026-07-13  
**Auditor:** Antigravity (Arquitecto Senior de Software)

---

## 1. Resumen Ejecutivo
Esta auditoría analiza con ojo clínico la coherencia del motor de inyección de módulos en disco y su contraparte de control de flags en la consola del Dashboard Central. Se identificaron tres brechas críticas de paridad física-lógica, riesgos residuales de concurrencia y fallas en la experiencia de usuario (UI/UX) que provocan inconsistencias de estados (switches inactivos y drifts de sincronización).

---

## 2. Diagnóstico Técnico Detallado

### Hallazgo 1: Desconexión de Sincronización entre la CLI (Disco) y Firestore
* **Severidad:** CRÍTICA  
* **Ubicación exacta:** [`server.js:L7497-L7545`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L7497-L7545) y [`server.js:L7548-L7586`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L7548-L7586)
* **Causa Raíz:** Los endpoints `/api/project/features/add` y `/api/project/features/remove` completan correctamente la copia de directorios físicos en `src/features/` y actualizan el `prototipe.lock.json` local. Sin embargo, **no realizan ninguna actualización en Firestore** en el documento del inquilino en `clientes_control/[clientId]`.
* **Impacto:** Firestore queda desactualizado. Al consultar el estado del cliente en otras vistas del Dashboard, se asume que las features no están instaladas (se pintan los botones de Play verde en lugar de Trash rojo).
* **Solución Concreta:** Modificar los endpoints de la CLI para actualizar de forma atómica en Firestore el campo `installedFeatures` (array) con los datos del lock y configurar el toggle correspondiente en `featureToggles[featureId] = true` tras la inyección.

---

### Hallazgo 2: Riesgo de Race Condition en la Persistencia de `prototipe.lock.json`
* **Severidad:** MEDIA  
* **Ubicación exacta:** [`server.js:L7521-L7534`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L7521-L7534)
* **Causa Raíz:** La lectura (`fs.readJson`) y posterior escritura (`fs.writeJson`) sobre el archivo de lock no es atómica. Si se solicitan dos inyecciones de módulos al mismo tiempo, una de las llamadas puede leer el lock viejo antes de que la otra escriba, resultando en la pérdida de registros de features instaladas.
* **Impacto:** Corrupción del archivo `prototipe.lock.json` de la instancia.
* **Solución Concreta:** Implementar un bloqueo semáforo secuencial en el Bridge de la CLI antes de realizar escrituras sobre el archivo del lockfile.

---

### Hallazgo 3: Confusión de Flujos en la Interfaz (Mezcla de Peras con Manzanas)
* **Severidad:** BAJA (UX/Consistencia)  
* **Ubicación exacta:** [`FeatureFlagManager.jsx:L365-L389`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx#L365-L389)
* **Causa Raíz:** Se pintaban en la misma cuadrícula de switches las variables booleanas operativas del Core y las features instaladas físicamente en disco.
* **Impacto:** El administrador puede intentar apagar un módulo y creer que se desinstaló del disco (lo cual es falso), o intentar prender un módulo que no tiene archivos de código en disco, causando un crash en tiempo de ejecución en la app cliente por módulos huérfanos.
* **Solución Concreta:** Dividir visualmente la interfaz en dos secciones claramente diferenciadas:
  1. **Sección A (Configuración Operativa):** Flags lógicas del core (se pueden encender/apagar libremente).
  2. **Sección B (Módulos Instalados):** Módulos que están físicamente en el disco. Su switch controla si están activos lógicamente en runtime.

---

## 3. Matriz de Correcciones Recomendadas

| ID | Componente | Descripción de la Modificación | Estado de Validación |
| :--- | :--- | :--- | :--- |
| **CORR-1** | `server.js` | Auto-actualizar `clientes_control` en Firestore en las llamadas de `/add` y `/remove` | Pendiente Aprobación |
| **CORR-2** | `FeatureFlagManager.jsx` | Rediseñar la UI para segmentar visualmente en 2 grids (Flags de Core y Toggles de Módulos) | Pendiente Aprobación |
| **CORR-3** | `FeatureFlagManager.jsx` | Limitar la acción masiva "Habilitar Todas" para que solo afecte al bloque de flags lógicas del Core | Pendiente Aprobación |
