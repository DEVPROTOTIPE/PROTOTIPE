# 🏛️ Documento Maestro de Reglas Arquitectónicas — Ecosistema PROTOTIPE

Este documento consolida el estándar de diseño, reglas de desarrollo, seguridad, sincronización y escalabilidad del ecosistema **PROTOTIPE**. Es el marco normativo obligatorio para desarrolladores e Inteligencias Artificiales que trabajen sobre el proyecto.

---

## 1. Principios de Arquitectura

*   **Multitenancy Híbrido (Sharding por Proyecto):** Cada cliente posee su propia instancia aislada del código y su base de datos Firebase dedicada. Queda prohibido compartir proyectos de Firebase entre clientes productivos.
*   **Branding Dinámico Basado en HSL:** La identidad visual de las marcas se inyecta mediante variables cromáticas HSL a nivel de CSS nativo. Todos los componentes deben consumir tokens de color dinámicos (e.g., `--color-primary`) para permitir mutación cromática instantánea.
*   **Desacoplamiento de Secretos:** La lógica de las plantillas (Cores) debe estar completamente limpia de credenciales o API Keys de Firebase. Estas variables de entorno se inyectan en tiempo de aprovisionamiento en archivos `.env.local` específicos de cada cliente.
*   **Sincronización Unidireccional Downstream:** Los cambios y mejoras operativas fluyen en un solo sentido: **Core de Desarrollo** → **Templates del CLI** → **Instancia del Cliente**. Los parches se aplican por comparación de hashes MD5 y diffs interactivos.
*   **Procesamiento Asíncrono no Bloqueante:** Las tareas pesadas del sistema (npm install, ejecuciones de Git, despliegues y smoke tests con Playwright) deben correr en procesos hijos independientes (workers forkeados) para no congelar el loop de eventos del servidor API Express.
*   **Monitoreo y Telemetría Centralizada:** Las métricas de error, deudas y comisiones de las instancias de clientes se reportan de forma asíncrona hacia una base de datos centralizada de telemetría a través del Developer Cockpit, con fallback elástico dual-channel.
*   **Auditoría y Paridad Rigurosa (NPM Drift & Build Check):** El CLI audita periódicamente la paridad del package.json de clientes y calcula un consistencyScore de Cores, reportando desviaciones de dependencias (`mismatchDeps`, `missingDeps`, `addedDeps`), y ejecutando builds de Vite en seco (`buildAudit=true`).
*   **Playgrounds Dinámicos (Zero-Configuration Sandboxes):** La interfaz central del desarrollador autodescubre e importa bajo demanda los sandboxes de componentes interactivos en caliente mediante `import.meta.glob`, evitando imports o declaraciones manuales estáticas en `ComponentSandbox.jsx`.

---

## 2. Reglas de Desarrollo

### 2.1 Tecnologías y Dependencias Aprobadas
*   **UI y Componentes:** React 19+, Vite, Tailwind CSS v4 (utilizando variables HSL adaptativas nativas), Framer Motion (para transiciones fluidas de modales y paneles).
*   **Estado y Utilidades:** Zustand (para almacenamiento global ligero y persistencia local), jsPDF y AutoTable (para exportación vectorial A4), Leaflet y Nominatim (para mapas interactivos sin APIs de pago).
*   **Servicios Externos:** Firebase SDK (Auth, Firestore para persistencia, Storage para imágenes de catálogo, Hosting para despliegue).

### 2.2 Tecnologías Prohibidas
*   **Estilos Estáticos:** Tailwind CSS v3 o utilidades de color hardcodeadas sin mapear a variables CSS HSL de marca.
*   **Librerías de Iconos Pesadas:** Prohibido el uso de `lucide-react` u otras librerías pesadas en componentes genéricos de la biblioteca. Todo icono debe ser inyectado como SVG nativo en línea (`inline`) con soporte para herencia de color.
*   **APIs Geográficas de Pago:** Prohibido el uso de Google Maps API u otros sistemas comerciales para visualización o selección de pines.
*   **Procesadores de Imagen en Servidor:** Prohibido el uso de Cloud Functions dedicadas a redimensionar o almacenar imágenes de catálogo. El procesamiento de imágenes debe hacerse en el lado del cliente (Jimp/Canvas) y guardarse en Firebase Storage.

### 2.3 Convenciones de Código y Archivos
*   **Idioma de Documentación:** Todos los manuales, bitácoras, hojas de ruta y archivos de la biblioteca deben nombrarse y redactarse en español claro, utilizando títulos jerárquicos de Markdown.
*   **Contraste WCAG:** Todo selector cromático de branding debe validar un delta mínimo de 30% de luminosidad entre el color de fondo y el color de texto acentuado.
*   **Aislamiento UI (Modales y Drawers):** Todos los componentes interactivos flotantes (modales, notificaciones, bottom sheets) deben renderizarse mediante React Portals y contar con "tap-shields" (cierres al hacer clic en el backdrop).
*   **Interacciones Táctiles:** Los componentes para móviles deben soportar Pointer Events nativos y gestos táctiles fluidos (swipe-to-dismiss, drag offset).

---

## 3. Reglas de Sincronización (Core → Template → Cliente)

### 3.1 Flujo Operativo Obligatorio
1.  **Modificación del Core:** Las características visuales y lógicas de la app base se programan en `Plantillas Core/App Ventas/`.
2.  **Sincronización al CLI:** Se ejecuta `sync_templates.js` para extraer el código y sanitizarlo en la carpeta de templates del CLI, reemplazando credenciales de Firebase en caliente con tokens mudos como `AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]`.
3.  **Propagación a Clientes:** Se ejecuta `sync_clients.js` para comparar hashes MD5 de los templates contra las instancias de producción activas.
4.  **Validación de Build e Integridad:** Tras copiar los archivos, el motor de sincronización corre de forma obligatoria `npm run build` en el cliente.
5.  **Despliegue y Rollback:** Si el build del cliente es exitoso, se limpia el backup y se actualiza la versión del metadato. Si el build falla, el sistema debe restaurar inmediatamente la instancia desde `.temp_backup_sync` de forma automática.

### 3.2 Errores Críticos que Rompen la Sincronización
*   **Edición Directa en Clientes:** Modificar archivos del núcleo directamente en la carpeta `/Instancias Clientes/`. Estos cambios serán sobreescritos o generarán conflictos MD5 irreversibles.
*   **Metadatos Incompletos:** Omitir o corromper campos en el archivo de control `.prototipe.json` de la instancia.
*   **Fugas de Secretos en Templates:** Olvidar sanitizar variables de entorno en el script de templates, lo que causaría la propagación de claves API de un cliente a otro.
*   **Falta de Dependencias en la "Versión de Oro":** Modificar el `package.json` de un template con dependencias de red sin registrarlas en el motor de pruebas `test_templates.js` para validar la paridad.

---

## 4. Reglas de Seguridad

*   **Sanitización Shell en Backend:** Queda estrictamente prohibido interpolar directamente variables en comandos de consola (`execAsync`). Todo argumento del CLI (nombres de proyecto, IDs de Firebase, nombres de ramas) debe pasar por el helper `sanitizeShellArgument` que restringe el input a caracteres alfanuméricos seguros.
*   **Prevención de Directory Traversal:** Todos los endpoints de Express del backend CLI que manipulan archivos en el disco local deben pasar por la validación `isPathContained(parent, child)`, impidiendo accesos mediante rutas relativas (`../`).
*   **Reglas de Firestore Restrictivas:** Las reglas de seguridad de Firestore (`firestore.rules`) en producción deben exigir autenticación del token admin (`request.auth.token.admin == true`) para lecturas y escrituras de telemetría y comisiones del sistema. La lectura pública directa de colecciones de control está estrictamente prohibida.
*   **Middleware de API CORS Restringido:** El backend de Express local no debe usar CORS abierto (`*`). Debe configurarse una lista blanca exclusiva para los puertos locales de desarrollo `localhost:5173` y `127.0.0.1:5173`.
*   **Políticas de CORS y Bucket Resilientes:** El aprovisionamiento de Firebase Storage exige políticas restrictivas. Las cabeceras CORS se inyectan automáticamente en caliente mediante `gsutil cors set` para los orígenes de desarrollo autorizados, resolviendo la conmutación entre el bucket `.appspot.com` y `.firebasestorage.app` e implementando un almacenamiento en caché en memoria (`storageBucketCache`) para suprimir latencias de red en sucesivas consultas.
*   **Token Bearer Local:** El bridge API Express debe exigir una cabecera de autenticación `Authorization: Bearer <token>` consumida del `.env` local para evitar ejecuciones remotas maliciosas en redes locales.
*   **Saneamiento Pre-commit (Git Leak Preventer):** Los scripts de backup y el hook de `pre-commit` deben abortar la indexación si se detecta un archivo de variables de entorno `.env` local sin desindexar.

---

## 5. Reglas de Escalabilidad (100, 500, 1000 Clientes)

*   **Aislamiento de Recursos (Database Sharding):** Para escalar sin colisiones en límites de Firestore o picos de tráfico concurrentes, cada cliente debe operar en un shard de hosting y base de datos dedicado.
*   **Delta Sync & Offline First:** Las aplicaciones cliente deben utilizar listeners reactivos asíncronos desacoplados, implementando sincronización delta en IndexedDB (a través de Zustand persistido) para reducir el volumen de lecturas directas a Firestore.
*   **Mitigación de Telemetría Síncrona:** El reporte de métricas del cliente a la Consola Central no debe bloquear la UI. Debe ejecutarse en background utilizando colas de persistencia local offline antes del envío asíncrono.
*   **Portabilidad Multiplataforma:** Toda lógica de automatización escrita en scripts del sistema de archivos debe migrar de PowerShell a scripts multiplataforma de Node (usando `shelljs` o `execa`) para operar de forma idéntica en Windows, macOS y Linux.
*   **Lazy-Loading de Vistas en Consola Central:** El dashboard de control (`App.jsx`) debe modularizarse extrayendo las vistas pesadas (Sandbox, Suite E2E, Backup) en páginas dinámicas autocontenidas mediante `React.lazy()` para evitar la sobrecarga de memoria del navegador al administrar cientos de clientes.

---

## 6. Reglas para IA

*   **Criterio de Decisión Obligatorio:** Antes de leer o modificar un archivo, la IA debe auditar el archivo [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) para verificar si la pieza documental coincide al 100% con su objetivo, previniendo el consumo excesivo de contexto.
*   **Prohibición de Resúmenes:** Queda prohibido generar explicaciones o resúmenes arquitectónicos de alto nivel al editar código. Las modificaciones lógicas deben documentarse con granularidad técnica estricta (flujos, paso a paso, parámetros y retornos).
*   **Sincronización Inmediata de Mapas:** Ante cualquier modificación que altere la estructura física o lógica del código o de la documentación, la IA debe actualizar de forma proactiva:
    1.  La hoja de ruta: [`tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) (completando o relacionando la tarea).
    2.  La bitácora: [`bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) (detallando el cambio de código).
    3.  El mapa físico: [`mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) (registrando nuevas rutas).
    4.  El mapa semántico: [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) (actualizando los criterios de decisión).
*   **Disparadores Rápidos:**
    *   `@postchange`: Ejecuta secuencialmente la compilación de control del dashboard, registro de bitácora y sincronización de mapas.
    *   `@extraer-componente`: Activa el extractor de componentes a la biblioteca.
*   **Prohibición de Despliegues Automáticos:** La IA nunca debe realizar despliegues a Firebase hosting o hosting de clientes de manera autónoma; requiere autorización y solicitud explícita del usuario.

---

## 7. Lista de Acciones Prohibidas

1.  **Crear archivos sueltos en la raíz** del directorio `/Documentacion PROTOTIPE/`. Todo documento debe clasificarse en su subcarpeta temática.
2.  **Inyectar credenciales reales** en archivos rastreados por Git (`.env.local` en plantillas core o CLI).
3.  **Duplicar componentes atómicos básicos** (botones, inputs, toasts, alertas) de forma ad-hoc en los componentes de negocio. Se debe heredar del catálogo o proponer un nuevo componente de biblioteca.
4.  **Importar librerías externas de iconos** o estilos globales sin previa auditoría de dependencias de la "versión de oro".
5.  **Utilizar bucles bloqueantes síncronos** (`fs.readFileSync`, `execSync`, `npm install` directo) en el loop de eventos del servidor API Express.
6.  **Desplegar reglas de Firestore** en modo laxo (`allow read, write: if true`) para colecciones comisionales, de facturación o telemetría.
7.  **Realizar pulls preventivos interactivos de Git** en ramas locales sin validar la existencia remota previa del target de la rama.

---

## 8. Checklist de Auditoría (Para Nuevas Implementaciones)

- [ ] **Sanitización de Consola:** ¿Los argumentos interpolados en comandos shell pasan por `sanitizeShellArgument`?
- [ ] **Prevención de Traversal:** ¿Todos los streams o lecturas de archivos del backend local usan `isPathContained`?
- [ ] **Branding Adaptativo:** ¿El componente hereda el color de marca mediante variables CSS HSL o Tailwind `--color-*`?
- [ ] **Contraste WCAG:** ¿El contraste de color de la UI en tema claro y oscuro supera el delta del 30% de luminosidad?
- [ ] **Aislamiento de Modales:** ¿El modal flotante está montado en un React Portal con cierre exterior (tap-shield)?
- [ ] **SVG Inline:** ¿Se eliminaron dependencias a librerías de iconos externas a favor de código SVG inline?
- [ ] **Desbloqueo de API:** ¿Las llamadas de sistema pesadas en el servidor Express corren de forma asíncrona o vía child process?
- [ ] **Paridad del package.json:** ¿Se auditaron las dependencias del nuevo módulo contra las "versiones de oro" del CLI?
- [ ] **Clean Git:** ¿El archivo de entorno `.env.local` del módulo nuevo está listado explícitamente en el `.gitignore`?
- [ ] **Mapeo de IA:** ¿Se actualizaron e indexaron las rutas y descripciones en `mapa_aplicacion.md`, `mapa_documentacion_ia.md`, `tareas_pendientes.md` y `bitacora_cambios.md`?
