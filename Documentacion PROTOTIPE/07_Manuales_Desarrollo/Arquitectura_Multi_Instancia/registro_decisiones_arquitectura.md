# 📄 Registro de Decisiones Arquitectónicas (ADR) — Ecosistema PROTOTIPE

Este documento registra las decisiones técnicas fundamentales que gobiernan el diseño, seguridad y escalabilidad del ecosistema **PROTOTIPE**, detallando el contexto, las alternativas evaluadas y las consecuencias de cada elección.

---

## ADR-001: Arquitectura Multitenant por Sharding Físico de Proyectos Firebase

### Estado
**Aprobado**

### Contexto
El sistema debe aprovisionar y escalar aplicaciones móviles/web personalizadas para múltiples marcas independientes. Se requiere aislamiento de datos estricto para cumplir normativas de privacidad, facilidad de personalización y control de costos de infraestructura.

### Decisión
Implementar un modelo de **Sharding Físico** en el que cada cliente tiene su propia base de datos (Firestore), repositorio de almacenamiento (Firebase Storage) y hosting dedicado e independiente en Firebase.

### Alternativas Descartadas
*   **Multitenancy Lógico en Base de Datos Única:** Consiste en compartir un solo proyecto de Firebase y filtrar colecciones con un atributo `tenantId`.
    *   *Razón de descarte:* Riesgo crítico de fuga de datos debido a errores en reglas de seguridad o consultas incorrectas de API, límites estrictos de escrituras por segundo en un único Firestore (límite de 10,000 escrituras/segundo global), y dificultad para aislar la facturación exacta de consumos de red y almacenamiento de cada marca.

### Ventajas
*   **Aislamiento de Seguridad:** Los datos de un cliente físicamente no existen en el espacio de nombres de otro.
*   **Límites de Cuota Independientes:** Cada cliente cuenta con sus propios límites de throughput de Firestore, reduciendo el riesgo de "Vecino Ruidoso" (noisy neighbor).
*   **Alineación de Costos:** Permite delegar la facturación de Firebase directamente al cliente final de forma transparente.
*   **Simplicidad de Reglas:** Reglas de Firestore limpias y específicas para el modelo de negocio del nicho del cliente.

### Riesgos y Mitigación
*   **Complejidad de Aprovisionamiento:** Requiere automatizar la creación de proyectos y configuraciones mediante CLI. *Mitigación:* Se implementó el motor asíncrono en `generator.js` que automatiza el ciclo de vida del aprovisionamiento mediante la API del CLI de Firebase.
*   **Agregación Global Compleja:** Dificultad para generar reportes y consolidaciones globales de facturación. *Mitigación:* Se creó un canal de telemetría centralizado asíncrono que reporta transacciones y comisiones hacia un shard SaaS central.

---

## ADR-002: Inyección de Identidad Visual por HSL Dinámico Nativo

### Estado
**Aprobado**

### Contexto
Cada instancia requiere una paleta de colores corporativa contrastada que se adapte dinámicamente tanto a temas oscuros como claros, sin requerir recompilaciones pesadas de estilos en el lado del cliente ni complicar la mantenibilidad del catálogo de componentes.

### Decisión
Utilizar **variables CSS HSL nativas** inyectadas por el motor de aprovisionamiento en la raíz del DOM (`:root`), consumidas directamente por Tailwind CSS v4 para la generación de la interfaz.

### Alternativas Descartadas
*   **Compilación Estática por Cliente (Configuración JS de Tailwind):** Generar un archivo de configuración de Tailwind específico por marca y recompilar el CSS de producción en cada cambio.
    *   *Razón de descarte:* Tiempos de despliegue lentos y bloqueos de CPU. Hace inviable el cambio de colores interactivo en tiempo real desde el dashboard de administración.
*   **Variables Hexadecimales:**
    *   *Razón de descarte:* Dificultad matemática para derivar variaciones cromáticas (tonos más oscuros, más claros o transparencias) de forma dinámica en la interfaz sin añadir librerías pesadas de manipulación de color en el cliente.

### Ventajas
*   **Mutación en Caliente:** Permite alterar el branding en caliente modificando un string en la base de datos o CSS del cliente.
*   **Cálculos de Contraste Simples:** Facilita la aplicación del algoritmo WCAG (delta de luminosidad de la variable L del HSL >30%) antes de inyectar los colores.
*   **Derivaciones de Color Nativas:** Permite generar bordes de hover, sombras y acentos variando la luminosidad directamente en CSS (`hsl(var(--color-primary-h) var(--color-primary-s) calc(var(--color-primary-l) - 10%))`).

### Riesgos y Mitigación
*   **Contraste Deficiente:** El operador puede ingresar colores primarios y secundarios que anulen la legibilidad. *Mitigación:* Middleware de Express API en `server.js` valida que la delta de luminosidad cumpla con las directivas WCAG antes de persistir los valores de marca.

---

## ADR-003: Sincronización Downstream por Hashes MD5 y Rollback Automatizado

### Estado
**Aprobado**

### Contexto
El ecosistema evoluciona constantemente con mejoras operativas aplicadas en la plantilla Core (App Ventas). Es necesario propagar estas mejoras de forma segura a decenas de instancias activas sin alterar sus datos locales y asegurando la disponibilidad del servicio.

### Decisión
Implementar un sistema de **Sincronización Unidireccional Downstream** mediante scripts de CLI (`sync_clients.js`) que validan paridad por hashes MD5, aíslan secretos mediante tokens mudos, ejecutan builds de producción locales y realizan rollback inmediato si la compilación falla.

### Alternativas Descartadas
*   **Git Submodules / Git Subtrees:** Enlazar la plantilla Core a las instancias como sub-módulo de Git.
    *   *Razón de descarte:* Genera conflictos de mezcla sumamente difíciles de resolver en entornos automatizados. Impide inyectar cambios de branding dinámicos y secretos sin contaminar el repositorio Core.
*   **Actualizaciones Manuales de Código:** Copiar y pegar archivos modificados directamente.
    *   *Razón de descarte:* Inviable a escala. Propensión masiva a introducir errores de compilación y pérdida de consistencia.

### Ventajas
*   **Seguridad contra Regresiones:** El cliente nunca se actualiza en producción si la compilación post-parche falla.
*   **Visibilidad de Desviación:** Permite auditar visualmente los diffs línea por línea antes de inyectar los parches.
*   **Aislamiento de Configuraciones:** Los archivos de variables de entorno `.env.local` y los metadatos `.prototipe.json` de cada cliente se excluyen de la sincronización de forma predeterminada.

### Riesgos y Mitigación
*   **Sobreescritura de Cambios Locales Ad-hoc:** Si un desarrollador altera un archivo del core en el cliente, el sincronizador lo pisará. *Mitigación:* Se estableció la regla prohibitiva de no tocar carpetas del núcleo en instancias, y el mapa semántico de la IA alerta activamente sobre esta directiva.

---

## ADR-004: Desacoplamiento de Operaciones Pesadas por Procesos Hijos IPC (Forking)

### Estado
**Aprobado**

### Contexto
El aprovisionamiento de proyectos y los tests de integración Playwright consumen recursos de procesamiento elevados y tiempos de espera de hasta 2 minutos. Si estas operaciones corren sobre el hilo de ejecución principal de la API de Express, bloquean el dashboard visual e invalidan las métricas de telemetría.

### Decisión
Utilizar la arquitectura de **Procesos Hijos** (`child_process.fork()`) para delegar operaciones de larga duración a workers dedicados (`worker_create_project.js`), comunicándose de manera bidireccional mediante IPC y Server-Sent Events (SSE).

### Alternativas Descartadas
*   **Ejecuciones Síncronas en API Express:** Correr comandos directamente en el controlador de rutas del Express Server local utilizando funciones bloqueantes.
    *   *Razón de descarte:* Congela el loop de eventos del servidor, provocando latencias críticas, desconexiones del dashboard e interrupciones en la recepción de logs de la terminal.

### Ventajas
*   **Estabilidad del Servidor Central:** La API permanece receptiva para responder consultas de estado o comandos de detención de emergencia.
*   **Streaming en Vivo:** Permite emitir logs de instalación o pruebas en vivo hacia el dev-dashboard a través de canales de Server-Sent Events (SSE).
*   **Aislamiento de Fallos:** Si el proceso de instalación de npm o los tests caen catastróficamente, el proceso principal del servidor Express no se ve afectado.

### Riesgos y Mitigación
*   **Zombies y Procesos Huérfanos:** Procesos del sistema de automatización (como instancias de Playwright Headless Chromium) que quedan activos consumiendo memoria tras abortar la tarea. *Mitigación:* Implementación de la utilidad recursiva `killProcessTree` por PID en Windows (`taskkill /PID {pid} /T /F`) en el cleanup de cancelación de tareas.

---

## ADR-005: Canal de Telemetría Centralizado y Desacoplado (Asíncrono Offline-First)

### Estado
**Aprobado**

### Contexto
El Developer Cockpit central consolida datos de facturación comisional y logs de fallos del ecosistema. Sin embargo, las fallas de red o indisponibilidad temporal del servidor de telemetría no deben detener las transacciones comerciales ni la operativa diaria de las tiendas de los clientes.

### Decisión
Implementar un **Canal de Telemetría Asíncrono** desacoplado del flujo crítico de la transacción (checkout), utilizando buffers de persistencia local (Zustand persistido / IndexedDB) que reintentan la sincronización de logs cuando se restablece la conectividad.

### Alternativas Descartadas
*   **Escrituras Directas Síncronas en Transacción:** Bloquear la finalización de un pedido de venta del cliente hasta que se confirme la transacción de comisión de desarrollo en la base de datos central de control.
    *   *Razón de descarte:* Introduce un punto único de falla (SPOF). Si el servidor SaaS de control cae o experimenta latencia, todos los clientes del ecosistema quedarían imposibilitados para vender.

### Ventajas
*   **Tolerancia Total a Fallos:** La experiencia de compra de los clientes permanece fluida bajo redes inestables.
*   **Cero Latencia en Checkout:** El tiempo de respuesta del checkout se mantiene en milisegundos al no depender de llamadas HTTPS externas secuenciales de control.
*   **Persistencia Local Offline:** Los reportes de comisiones y logs de errores se acumulan en un storage local seguro y se envían de forma automática cuando el dispositivo detecta conexión.

### Riesgos y Mitigación
*   **Drift de Saldos:** Retraso temporal en la actualización de comisiones en el panel del administrador central. *Mitigación:* Se implementó un detector de conectividad en el dashboard (`connectivity_toast.md`) y el visor comisional indica visualmente si hay transacciones pendientes de sincronización local.

---

## ADR-006: Playgrounds dinámicos auto-detectables (Zero-Configuration Sandboxes)

### Estado
**Aprobado**

### Contexto
Declarar manualmente cada playground en `ComponentSandbox.jsx` introducía acoplamiento estático y aumentaba el riesgo de regresiones al agregar o modificar componentes en la biblioteca de desarrollo.

### Decisión
Utilizar `import.meta.glob` de Vite para escanear y cargar de forma dinámica los archivos de sandbox interactivos ubicados en `src/components/admin/sandboxes/` en tiempo de ejecución.

### Ventajas
* **Mantenimiento Cero**: Crear un archivo de playground bajo el estándar de nomenclatura lo registra de forma automática en la consola.
* **Aislamiento de Fallos**: El renderizado dinámico se encapsula con un `SandboxErrorBoundary` que evita que caídas en tiempo de ejecución del sandbox afecten a la consola.

---

## ADR-007: Fallback de Storage bucket y caching CORS local

### Estado
**Aprobado**

### Contexto
El aprovisionamiento automatizado fallaba o experimentaba demoras críticas al intentar inyectar reglas CORS sobre buckets `.appspot.com` inexistentes en proyectos Firebase nuevos que usan el formato `.firebasestorage.app`.

### Decisión
Implementar un resolvedor dinámico con fallback elástico en `server.js` (`/api/project/firebase/cors-setup`) que conmuta automáticamente de bucket en caso de error 404, almacenando en caché en memoria (`storageBucketCache` de tipo Map indexado por `clientId`) el bucket exitoso del cliente para evitar repeticiones de red.

### Ventajas
* **Resiliencia**: Autodetecta el tipo de bucket asignado por la nube al proyecto Firebase del cliente.
* **Rendimiento**: Elimina latencias y llamadas redundantes del comando `gsutil` en subsiguientes cargas o sincronizaciones.

---

## ADR-008: Canal de telemetría de canal dual (Dual-channel sink)

### Estado
**Aprobado**

### Contexto
Las políticas estrictas de CORS y bloqueos de red local impedían al dashboard central recibir reportes de telemetría e incidentes en vivo directamente desde el backend de Express o clientes de desarrollo.

### Decisión
Implementar una arquitectura de transmisión dual en `telemetryService.js`. Intenta escribir primero directamente a la base de datos de control de Firestore Central a través de la inicialización de una segunda aplicación de Firebase (`centralFirebaseService.js`) con credenciales de lectura y escritura específicas, y ofrece un fallback elástico por HTTPS llamando a una Cloud Function si la conexión de base de datos directa es bloqueada.

### Ventajas
* **Garantía de Recepción**: Asegura que el dashboard del desarrollador reciba reportes e incidentes aun bajo restricciones severas de CORS o bloqueos de red.
* **Desacoplamiento**: Mantiene la independencia de base de datos de cada cliente y centraliza el control.
