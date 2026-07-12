# Informe de Auditoría y Hardening de Producción — Fase P0.7: SaaS Production Hardening Audit

**Estado:** `DESIGN PROPOSAL / AWAITING REVIEW`
**Fecha de emisión:** 2026-07-12
**Monorepo:** `PROTOTIPE`
**Ecosistema:** `App Ventas` / `Prototype CLI`

---

## 1. Seguridad Externa

El análisis de seguridad del Bridge local (`server.js`) y de los endpoints de la API expuesta revela las siguientes brechas críticas en entornos de producción:

### 1.1 Autenticación y Autorización del Bridge
* **Diagnóstico actual:**
  - El servidor Express en `server.js` implementa `authenticateFirebaseToken` y `authorizePermission` para proteger de manera robusta las operaciones del Pipeline de Promoción de Cores.
  - Sin embargo, **el resto de endpoints críticos de la API operativa se encuentran completamente abiertos y carecen de cualquier middleware de autenticación**. Esto incluye endpoints sumamente destructivos y operacionales como:
    - `POST /api/create-project` (aprovisionamiento físico en background).
    - `POST /api/upload-logo` (subida de archivos binarios).
    - `POST /api/library/extract` (extracción física de componentes).
    - `POST /api/library/inject` (inyección y modificación directa de archivos de la base de código).
    - `POST /api/git/discard` (eliminación irreversible de cambios sin confirmar).
    - `POST /api/project/maintenance` y `/api/project/env` (escritura de variables de entorno).
    - `POST /api/project/dev/start` y `/api/project/dev/stop` (gestión de subprocesos locales).
  - **Riesgo:** Un atacante que logre acceso a la red local o que exponga accidentalmente el puerto del Bridge a internet puede ejecutar comandos de inyección, purgar repositorios Git, extraer secretos del servidor, o realizar un ataque DoS saturando el motor de aprovisionamiento.
* **Propuesta de Hardening:**
  1. **Autenticación Dual Obligatoria:** Todos los endpoints del Bridge deben requerir el middleware `authenticateFirebaseToken` en producción.
  2. **Token de API para Integraciones Locales (`BRIDGE_API_KEY`):** Para flujos locales desde el CLI en consola offline, implementar soporte para validar cabeceras `Authorization: Bearer <token_estático_local>` bindeado al entorno local del desarrollador.
  3. **Verificación de Origen (CORS y Loopback):** Restringir por defecto los endpoints locales más destructivos (como `git/discard` o `dev/start`) para que solo admitan peticiones provenientes del loopback (`127.0.0.1` o `::1`).

### 1.2 Autorización por Roles Granular
* **Diagnóstico actual:**
  - El sistema de base de datos Firestore asocia permisos específicos a nivel de perfil (ej. `core-promotion:analyze`).
  - No obstante, no existe un mapeo formal para los endpoints del ciclo de vida del cliente (aprovisionamiento, inyección de componentes, mantenimiento).
* **Propuesta de Hardening:**
  - Implementar una estructura de permisos RBAC para todas las operaciones operativas de la plataforma:
    - `provisioning:create` para aprovisionar nuevas instancias.
    - `library:modify` para extraer e inyectar componentes en el catálogo.
    - `system:maintenance` para ejecutar reinicios, purgas o manipulación del entorno.

### 1.3 Rate Limiting y Control de Inundación
* **Diagnóstico actual:**
  - `server.js` carece de cualquier limitador de peticiones (Rate Limiter). Un flujo asíncrono mal diseñado en el cliente frontend o peticiones automatizadas recurrentes pueden agotar el stack de red y memoria de Express.
* **Propuesta de Hardening:**
  - Incorporar `express-rate-limit` con límites adaptados a la naturaleza del endpoint:
    - **Servicios Críticos / Operaciones E/S Pesadas:** Limitar a máximo 5 peticiones por minuto por dirección IP (ej: `/api/create-project`, `/api/library/inject`).
    - **Servicios Generales / Telemetría:** Limitar a un umbral más laxo (ej. 60 peticiones por minuto).

---

## 2. Auditoría y Trazabilidad

Un sistema SaaS con múltiples operadores y clientes requiere un rastro digital inmutable para auditorías forenses y soporte post-venta.

### 2.1 Identidad del Operador (Quién crea clientes)
* **Diagnóstico actual:**
  - El payload de creación de proyectos no captura información de identidad del operador.
  - El archivo final de metadatos `.prototipe.json` y el registro de estados de aprovisionamiento no documentan qué usuario o cuenta inició el aprovisionamiento de la instancia.
* **Propuesta de Hardening:**
  - Exigir que el payload de la API envíe el `operatorId` y `operatorEmail` autenticados.
  - Almacenar estos datos de auditoría dentro de `.prototipe.json` en la raíz del cliente, y como metadatos obligatorios en `artifacts/provisioning-state/{clientId}.json`.

### 2.2 Historial de Acciones (Audit Log)
* **Diagnóstico actual:**
  - No existe un rastro persistente estructurado que registre la historia de mutaciones de la plataforma. Si un operador descarta cambios Git o destruye archivos de configuración, no hay forma de auditarlo retrospectivamente.
* **Propuesta de Hardening:**
  - Desarrollar un subsistema `AuditLogger` que registre de forma inmutable todas las operaciones destructivas o de reescritura.
  - Cada entrada debe persistirse de forma atómica en un archivo inmutable (`artifacts/audit-log.json`) o replicarse en una colección de logs de seguridad en Firestore (`audit_logs`).

### 2.3 Logs Estructurados y Trazabilidad de Tareas
* **Diagnóstico actual:**
  - El archivo `cli_bridge.log` se genera como texto plano no estructurado. Esto imposibilita la indexación y búsquedas complejas por herramientas de agregación de logs.
  - Si bien se implementó el prefijo de `taskId` en algunos logs de `generator.js`, muchas rutinas en `server.js` y sub-servicios inyectan logs al sistema sin correlacionarlos con la tarea o job correspondiente.
* **Propuesta de Hardening:**
  - Adoptar logs JSON estructurados. Cada línea de log debe ser un objeto serializado con el siguiente esquema mínimo:
    ```json
    {
      "timestamp": "2026-07-12T05:00:00.000Z",
      "level": "INFO|SUCCESS|WARNING|ERROR",
      "taskId": "task-create-tienda-xyz-...",
      "clientId": "tienda-xyz",
      "operatorId": "uid-del-operador",
      "action": "scaffolding_base_copy",
      "message": "Copia de plantilla base completada",
      "elapsedMs": 450
    }
    ```

---

## 3. Observabilidad

Para operar la plataforma con un acuerdo de nivel de servicio (SLA) estable, se requiere telemetría técnica que complemente los KPIs comerciales del negocio.

### 3.1 Métricas de Rendimiento y Tiempos de Ciclo
* **Diagnóstico actual:**
  - No se miden las latencias ni duraciones individuales de las subtareas del ciclo de aprovisionamiento. No es posible saber qué fase del aprovisionamiento (ej: descarga de npm, creación de base de datos Firebase, compilación de producción de Vite) actúa como cuello de botella o presenta degradación.
* **Propuesta de Hardening:**
  - Implementar medición activa de tiempos de ejecución (`PerformanceProfiler`) en el backend y persistir los milisegundos consumidos por cada paso en la metadata del job terminado.

### 3.2 Categorización de Errores y Diagnósticos
* **Diagnóstico actual:**
  - Los errores se capturan de forma genérica y se exponen en plaintext en el campo `error` de la metadata. Esto genera riesgos de filtración de trazas físicas de directorios locales o credenciales, y no ayuda a clasificar la raíz del fallo.
* **Propuesta de Hardening:**
  - Definir un diccionario de códigos de error semánticos (ej. `ERR_FIREBASE_PROJECT_LIMIT`, `ERR_NPM_INSTALL_TIMEOUT`, `ERR_VITE_BUILD_FAILED`).
  - Sanitizar automáticamente las trazas antes de guardarlas en disco o base de datos.

### 3.3 Consumo de Recursos
* **Diagnóstico actual:**
  - La plataforma opera a ciegas respecto al hardware del host local.
* **Propuesta de Hardening:**
  - Recolectar estadísticas de CPU y memoria de manera reactiva durante picos de trabajo de aprovisionamiento o inyección, guardando el pico de consumo en el log final del Job.

### 3.4 Dashboards Técnicos
* **Diagnóstico actual:**
  - El dashboard del administrador expone KPIs comerciales pero no proporciona vistas de observabilidad técnica del Bridge.
* **Propuesta de Hardening:**
  - Diseñar y proponer la pestaña `Observabilidad Técnica` en el Dashboard Central (`SystemObservabilityView.jsx`) para que exponga: latencia de aprovisionamiento, tasa de fallos, consumo de memoria del host, estado de la cola en vivo, y logs JSON indexados por `taskId`.

---

## 4. Cloud Lifecycle y Resiliencia

El ciclo de vida en la nube de Firebase debe ser consistente e impedir el consumo fantasma de recursos.

### 4.1 Rollback Automático de Recursos Cloud
* **Diagnóstico actual:**
  - En la fase P0.4 se implementó el rastreo de recursos en la nube (`cloudResourcesCreated`) durante el aprovisionamiento. No obstante, **el rollback automático de recursos en la nube no está implementado**. Si la copia física o compilación Vite falla después de haber creado los recursos en la nube, estos quedan permanentemente huérfanos.
* **Propuesta de Hardening:**
  - Implementar la rutina `rollbackCloud(clientId, cloudResourcesCreated)`. En caso de fallo en el flujo de aprovisionamiento local, se debe invocar automáticamente esta rutina para ejecutar la eliminación física controlada de los recursos creados en Firebase (ej. mediante comandos del CLI `firebase projects:delete`).

### 4.2 Conciliación Periódica y Detección de Huérfanos
* **Diagnóstico actual:**
  - Si un proceso del Bridge se interrumpe de forma catastrófica (ej. corte de energía), los recursos en la nube creados parcialmente nunca se limpian y el estado del cliente queda bloqueado en `provisioning`.
* **Propuesta de Hardening:**
  - Implementar una rutina de "Grooming Cloud". Al arrancar el servidor o mediante un cron programado, comparar la lista física de proyectos Firebase (`firebase projects:list`) contra la lista de estados persistentes completados en Firestore y disco. Todo recurso cloud detectado que no tenga una instancia local correspondiente activa debe marcarse como huérfano y proponerse para purga manual/automática.

---

## 5. Escalabilidad y Optimización de Recursos

El Bridge opera actualmente bajo supuestos de uso moderado. La escalabilidad es crítica para soportar un número creciente de instancias de clientes.

### 5.1 Concurrencia de la Cola Dinámica
* **Diagnóstico actual:**
  - La cola de aprovisionamiento está limitada de manera fija a `maxConcurrency = 1`. Aunque esto protege servidores de bajo rendimiento o máquinas de desarrollo locales, subutiliza servidores potentes en la nube (ej: instancias con 8 cores y discos NVMe de alta velocidad).
* **Propuesta de Hardening:**
  - Permitir la configuración dinámica de `maxConcurrency` mediante la variable de entorno `PROVISIONING_MAX_CONCURRENCY`. Si el host detecta almacenamiento NVMe rápido y recursos de CPU disponibles, se puede incrementar la concurrencia controlada a $2$ o $3$ jobs en paralelo.

### 5.2 Deduplicación de Archivos y node_modules (Crecimiento de Disco)
* **Diagnóstico actual:**
  - Cada cliente aprovisionado localmente duplica una instalación de `node_modules` completa. A razón de $300$ MB por cliente, aprovisionar 100 clientes consumirá rápidamente $30$ GB de espacio de disco redundante.
* **Propuesta de Hardening:**
  - Migrar la instalación local del scaffolding para que utilice enlaces duros (hard links) y almacenamiento caché global compartido (ej: configurando `pnpm` o `yarn berry` en el generador en lugar de `npm` nativo). Esto reduce el consumo de disco por cada cliente de $300$ MB a menos de $5$ MB, acelerando la creación de la instancia a segundos.

### 5.3 Optimización del Drift Detection en Escala
* **Diagnóstico actual:**
  - El Drift Detector escanea físicamente y en caliente los archivos del disco del cliente para detectar discrepancias contra las plantillas Core. Este enfoque de escaneo recursivo degrada el rendimiento de Express a medida que aumenta el número de clientes y archivos.
* **Propuesta de Hardening:**
  - Reemplazar el escaneo físico recursivo por la lectura de un manifiesto de hashes SHA-256 pre-calculados (`manifest.lock.json`) generado al momento de compilar el Core. El Drift Detector solo tendrá que comparar el lockfile local contra el del Core en memoria, optimizando la verificación de drifts a microsegundos.
