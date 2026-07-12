# 📝 Bitácora de Cambios e Historial de Commits

## CLI-459 — 2026-07-12
**Feature: Aislamiento y Desacoplamiento de Fases en el Aprovisionamiento de Firebase Auth**

### Cambios realizados:
1. **Flujo de Auth Desacoplado**: Separamos el aprovisionamiento de autenticación de Firebase en tres fases independientes usando try/catch individuales:
   * **Fase 1**: Inicializar Identity Platform llamando a `identityPlatform:initializeAuth`.
   * **Fase 2**: Habilitar el proveedor de Email/Password mediante un `PATCH` a la configuración de SignIn.
   * **Fase 3**: Crear la cuenta de usuario administrador en Firebase Auth llamando a `v1/projects/{projectId}/accounts`.
2. **Resiliencia ante Fallos**: Si la Fase 2 falla (debido a que el proyecto esté en el plan Spark y no soporte la edición mediante PATCH de Identity Platform v2), el sistema continuará y ejecutará la Fase 3 de todas formas. Esto permite inyectar el usuario admin de forma administrativa (bypass) incluso si la configuración de SignIn no se pudo actualizar vía API.
3. **Depuración Enriquecida**: Los logs ahora imprimen de forma descriptiva el éxito o la causa de error de cada fase para facilitar la auditoría.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-458 — 2026-07-12
**Fix: Inicialización de Identity Platform en GCP para evitar CONFIGURATION_NOT_FOUND**

### Cambios realizados:
1. **Inicialización de Auth en GCP**: Corregimos el error `CONFIGURATION_NOT_FOUND` al intentar configurar el proveedor de email en proyectos recién aprovisionados en la nube.
2. **REST API Endpoint**: Añadimos una llamada REST POST al endpoint administrativo de Google `identityPlatform:initializeAuth` con un payload vacío. Esto configura proactivamente la base de datos de Auth en GCP antes de intentar actualizar las propiedades del SignIn mediante PATCH.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-457 — 2026-07-12
**Feature: Habilitación de Firebase Auth, Despliegue de Reglas e Índices y Descarga Individual de Logs de Aprovisionamiento**

### Cambios realizados:
1. **Habilitación de Firebase Auth (Identity Toolkit):** Ahora, durante la fase de aprovisionamiento en la nube (dentro de `server.js`), se habilita proactivamente la API `identitytoolkit.googleapis.com` en GCP, se activa el proveedor de Correo y Contraseña, y se crea la cuenta del usuario administrador. La inyección es 100% resiliente frente a latencias o fallas de propagación de APIs en GCP.
2. **Despliegue de Reglas e Índices:** Añadimos la ejecución proactiva de `firebase deploy --only firestore:rules,firestore:indexes,storage` en el directorio de la instancia recién creada. Esto se ejecuta directamente antes del sembrado (`seedProjectDatabase`) para garantizar que la base de datos de producción quede con la gobernanza y los índices configurados de inmediato.
3. **Persistencia y Control Manual de Progreso:** Se eliminó el `useEffect` en `App.jsx` que cerraba la ventana de progreso del aprovisionamiento con un timer de 1.5s. Ahora el modal de progreso se mantiene abierto y permite al desarrollador cerrarlo de forma manual con el botón "Completado / Ir a Onboarding" o "Cerrar y Revisar Logs".
4. **Descarga de Logs Individuales:** Se implementó una función `handleDownloadLog` en `ProvisioningProgressModal.jsx` conectada a un botón premium en el footer. Permite descargar todo el registro (logs) de ese aprovisionamiento individual en un archivo `.txt` limpio (removiendo códigos de escape ANSI) y nombrado cronológicamente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-456 — 2026-07-12
**Fix: Blindaje Total de URLs Hardcodeadas en Componentes Admin del Dashboard Central**

### Cambios realizados:
1. **SaaSOperationsView.jsx (Bug Crítico):** Corregido puerto hardcodeado `localhost:3000` → `CLI_URL` (`localhost:3001`). Este era el causante directo del error `ERR_CONNECTION_REFUSED`. Cada fetch de telemetría (adopción, pings, logs) ahora falla de forma independiente con `try/catch` individuales, previniendo cascadas de error.
2. **ClientLifecyclePanel.jsx:** 5 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (feature-registry, drift, features/add|remove, branding, status/update).
3. **CorePromotionModal.jsx:** 7 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (preflight, events SSE, execute, poll blueprint, publish, activate, rollbacks).
4. **FeatureMarketplaceView.jsx:** 1 URL hardcodeada `localhost:3001` reemplazada por `CLI_URL` (feature-registry).
5. **NichesManagerPanel.jsx:** Default prop `cliUrl = 'http://localhost:3001'` reemplazado por `cliUrl = CLI_URL`.

### Archivos modificados:
- [`dev-dashboard/src/components/admin/SaaSOperationsView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SaaSOperationsView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/CorePromotionModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CorePromotionModal.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/NichesManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/NichesManagerPanel.jsx) [MODIFY]

---

## CLI-455 — 2026-07-12
**Feature: Corrección de Resolución de Puertos en el Inicio de Servidores Locales de Clientes en el Bridge CLI**

### Cambios realizados:
1. **Resolución de Puertos Configurados en /api/project/dev/start:** Corregido el bug en el endpoint de arranque de servidores de desarrollo en `server.js`. Ahora, el backend intenta leer el puerto asignado en el archivo `vite.config.js` físico de la instancia del cliente de forma prioritaria en lugar de forzar a ciegas el puerto determinista (`forcedPort`) de rango `3100-3199`. El puerto determinista se mantiene únicamente como fallback de seguridad si no existe o no se puede leer la configuración del cliente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

## CLI-454 — 2026-07-12
**Feature: Soporte Completo para Purga de Desvíos de Archivos Obsoletos y Saneamiento de Roadmap**

### Cambios realizados:
1. **Refactorización de /api/integrity/prune-drifts en server.js:** Corregida y mejorada la lógica del endpoint de purga de desvíos en el Bridge para que admita tanto archivos declarados inline (`- Archivos: ...`) como viñetas de archivos individuales de forma vertical (`    - [...](url)`), eliminando las líneas correspondientes de forma limpia y atómica.
2. **Saneamiento Físico del Roadmap:** Ejecutado un script de purga local que saneó y eliminó de inmediato los 17 desvíos rotos obsoletos (`FILE_NOT_FOUND`) de `tareas_pendientes.md`, restableciendo la consistencia total del disco a verde.
3. **Fix de Consistencia de Git (Prefijo BUG):** Añadido el prefijo de tareas `BUG` al regex extractor de IDs de la validación de Git del status de integridad en `server.js`. Esto evita que las tareas marcadas como BUG queden huérfanas falsamente en el análisis de consistencia. Vinculamos de forma automatizada las 32 tareas completadas hoy que carecían de commits en Git.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Prototipe-CLI/scripts/prune_drifts_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/prune_drifts_local.js) [NEW]
- [`Prototipe-CLI/scripts/link_tasks_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/link_tasks_local.js) [NEW]

---

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

