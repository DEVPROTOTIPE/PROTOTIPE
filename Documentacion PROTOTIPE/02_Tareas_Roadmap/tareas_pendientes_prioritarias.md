# Tareas Pendientes Prioritarias y Roadmap de Infraestructura

Este documento registra de forma jerárquica las tareas de infraestructura, automatización del CLI, y la escalabilidad a largo plazo del ecosistema PROTOTIPE. Se divide entre las tareas ya completadas (fases iniciales), el backlog prioritario de automatización, y el roadmap estratégico a futuro.

---

## 🗂️ 1. Historial de Tareas Completadas (Fase Inicial de Ecosistema)

Estas tareas corresponden al diseño inicial de la arquitectura del ecosistema y ya se encuentran integradas y operativas en los proyectos activos.

* **[x] ~~Inicializar el Proyecto de Firebase Central del Desarrollador~~**
  * *Estado:* Completado (Proyecto central `prototipe-ecosistema-control` configurado y conectado).
* **[x] ~~Desarrollar la Interfaz del Panel Central (Dashboard Dev)~~**
  * *Estado:* Completado (Proyecto activo en [`D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard) con observador de clientes, facturación y visor de biblioteca).
* **[x] ~~Crear la Tabla de API Keys y Tokens de Seguridad~~**
  * *Estado:* Completado (Gestionado mediante la colección `/tokens` en Firestore Central para asociar clientes y validar facturación).
* **[x] ~~Activación de Telemetría en Clientes de Producción~~**
  * *Estado:* Completado (El core de `App Ventas` transmite cobros y facturación a la base central de manera síncrona en segundo plano).

---

## ⚡ 2. Backlog Prioritario de Automatización y Robustez (Para Aprobación)

Tareas destinadas a blindar el CLI y los scripts de sincronización ante errores de desarrollo o regresiones.

* **[x] ~~Tarea P1: Modo Simulación (`--dry-run`) en `sync_templates.js`~~**
  * *Estado:* Completado. Se implementaron los flags `--dry-run` (`-d`) y `--yes` (`-y`) en `sync_templates.js`. Realiza una simulación comparando tamaños y contenido de archivos, previsualiza sanitizaciones de seguridad, y solicita confirmación interactiva por consola readline antes de escribir en caliente.
* **[x] ~~Tarea P2: Validación de Esquema en Registro (`plantillas_registro.json`)~~**
  * *Estado:* Completado. Se implementó una rutina estricta de validación `validarRegistro` en `sync_templates.js` que verifica tipos de datos, rutas absolutas y patrones de versión SemVer en el registro central.
* **[x] ~~Tarea P3: Pruebas de Integración Automatizadas en el CLI~~**
  * *Estado:* Completado. Se implementó el runner `test_templates.js` que simula la instalación y el build de Vite de cada plantilla en entornos temporales de forma aislada, y se integró automáticamente al flujo `@actualizar-template` mediante el flag `--run-tests` y el comando `npm run sync:full`.
* **[x] ~~Tarea P4: Automatización de Reglas mediante Git Hooks~~**
  * *Estado:* Completado. Se configuró un hook de pre-commit nativo en `D:\Aplicaciones\App Ventas\.git\hooks\pre-commit` que ejecuta `sync_rules.js` de forma automática al confirmar cambios en el repositorio principal, asegurando la propagación y adición de las reglas de IA en caliente.

---

## 🚀 3. Roadmap Estratégico y Expansión a Futuro (Largo Plazo)

Mejoras de producto orientadas a aumentar el valor comercial de PROTOTIPE en el mercado latinoamericano.

### 💳 A. Integración de Pasarelas de Pago y Recaudo Automático
* *Descripción:* Módulo opcional configurable desde el wizard de onboarding para integrar credenciales de Wompi, Bold o Mercado Pago en el checkout del cliente sin tocar código.

### 🧾 B. Integración DIAN POS Electrónico (Colombia)
* *Descripción:* Adaptar la salida del checkout y del POS físico para conectarse con un proveedor tecnológico (Alanube, Plemsi) y emitir el documento equivalente electrónico exigido por la DIAN para comercios locales.

### 🛡️ C. Restricción de Escrituras Directas a Telemetría (Seguridad Cloud - Camino B)
* *Descripción:* Migrar la telemetría a una Cloud Function HTTPS proxy en el Firebase Central (requiere plan Blaze de pago). Esto permitirá remover por completo el SDK cliente secundario (`centralFirebaseService.js`) del bundle del cliente y eliminar `VITE_DEVELOPER_CENTRAL_API_KEY`, realizando todas las validaciones de tokens server-side con rate-limiting.
* *Estado:* Pendiente (Camino A con reglas Firestore implementado en Tarea 288 para plan Spark; Camino B queda como evolución futura cuando se adquiera el plan Blaze).
