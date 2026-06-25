# Auditoría Técnica: Blindaje de Replicación de Cores y Conectividad Central 2026

Este informe analiza la robustez y seguridad del motor de aprovisionamiento de marcas blancas (`Prototipe-CLI`) ante la clonación de múltiples cores genéricos actuales y futuros, garantizando cero fallos de base de datos, aislamiento de telemetría y conexión ininterrumpida con el Dashboard Central.

---

## 🔍 DIAGNÓSTICO DE PUNTOS CRÍTICOS Y RIESGOS

### 1. Aislamiento y Sincronización Automática de Tokens (Seguridad / Robustez)
* **Severidad**: Alta
* **Ubicación exacta**: [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L350-L398) y [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L383-L532)
* **Causa Raíz**: Durante el aprovisionamiento manual o automático, se inyecta en el `.env.local` de la instancia del cliente un token de telemetría único generado al vuelo (`VITE_DEVELOPER_TELEMETRY_TOKEN`). Sin embargo, el CLI no inserta ni registra automáticamente este token generado en la base de datos de control central (`clientes_control/{clientId}`).
* **Impacto**: Si el desarrollador no crea o actualiza manualmente el registro del cliente en el CRM central con el token correspondiente antes del primer ping, la app cliente no podrá establecer el listener de telemetría en tiempo real y lanzará excepciones silenciosas en consola (`Error al escuchar documento central: Document does not exist`).
* **Solución Concreta**: Agregar en el endpoint `/api/create-project` de `server.js` una escritura asíncrona hacia la base de datos de Firestore Central (utilizando las credenciales del desarrollador) para registrar el documento del cliente en `/clientes_control/{clientId}` con su token y metadatos recién creados, automatizando el flujo al 100%.

### 2. Dependencia y Acoplamiento del Smoke Test (Rendimiento / Calidad)
* **Severidad**: Media
* **Ubicación exacta**: [`worker_create_project.js`](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js#L76-L89)
* **Causa Raíz**: El Smoke Test de inicialización utiliza Playwright para levantar el navegador headless, navegar y verificar errores de React en runtime. No obstante, el validador determina si ejecutar el test basándose rígidamente en la presencia de `@playwright/test` en el `package.json` del Core.
* **Impacto**: Si en el futuro se crea un Core ligero o una plantilla de PWA que no integre Playwright por defecto para reducir dependencias, el Smoke Test se omitirá. Esto desactiva el blindaje de renderizado, permitiendo que la app se replique rota si hay un error sintáctico o una incompatibilidad HSL.
* **Solución Concreta**: Desacoplar el runner de Playwright de la app local del cliente. El CLI debe utilizar su propia instancia global de Playwright (instalada en el entorno de desarrollo local o CLI) para lanzar el test de humo sobre el puerto `5190`, independientemente de las dependencias declaradas en el `package.json` de la marca.

### 3. Inyección Rígida de HSL en Temas CSS (Escalabilidad / Cores Futuros)
* **Severidad**: Media
* **Ubicación exacta**: [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L292-L348)
* **Causa Raíz**: Para inyectar los colores de marca personalizados en el Core replicado, el generador asume de forma hardcodeada que el archivo de estilos principal se encuentra en `src/index.css` y que define las variables de tema dentro del bloque `:root`.
* **Impacto**: Si un Core futuro utiliza Tailwind CSS v4 puro (con variables de tema definidas en `@theme` en lugar de `:root` tradicionales) o separa la configuración CSS en múltiples archivos de utilidades, la inyección fallará y el cliente heredará colores de fallback, rompiendo la identidad visual de la marca blanca.
* **Solución Concreta**: Refactorizar la configuración de variables HSL para que, en lugar de modificar físicamente archivos CSS, las inyecte en tiempo de compilación o renderizado (por ejemplo, generando un archivo JSON de tema `src/config/theme.json` que el Core consuma reactivamente, o aplicando clases HSL dinámicas inyectadas como inline styles en el elemento raíz `<html>` desde `index.html`).

### 4. Falta de Validación del Firebase Storage en Preflight Check (Robustez)
* **Severidad**: Media
* **Ubicación exacta**: [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L69-L90)
* **Causa Raíz**: La validación de credenciales en el Preflight Check (`validateFirebaseCredentials`) evalúa de forma exitosa que el Project ID exista y que la API Key sea correcta contra la API REST de Firestore, pero no comprueba si el bucket de Firebase Storage está activo en el proyecto del cliente.
* **Impacto**: Si la base de datos de Firestore está activa pero el cliente olvidó inicializar o habilitar el servicio de Storage en su consola de Firebase, la app se aprovisionará y compilará con éxito, pero la carga de imágenes, logos y archivos del negocio fallará inmediatamente en producción.
* **Solución Concreta**: Añadir una validación secundaria en `validateFirebaseCredentials` que realice un fetch asíncrono o un `GET` a la API REST de Cloud Storage (`https://firebasestorage.googleapis.com/v0/b/{bucket}`) para verificar que el servicio responda correctamente antes de proceder.

---

## 🛡️ MATRIZ DE RIESGOS DE REPLICACIÓN MULTI-CORE

| Riesgo | Probabilidad | Impacto | Mitigación Existente | Mitigación Propuesta |
| :--- | :--- | :--- | :--- | :--- |
| **Token Desalineado** | Alta | Medio | Creación manual en CRM | Registro automático desde el CLI en Firestore Central al aprovisionar. |
| **Storage Inactivo** | Media | Alto | Ninguna | Preflight Check REST para verificar Storage Bucket. |
| **Error Sintáctico React** | Baja | Crítico | Smoke Test con Playwright | Mantener Playwright global en el CLI para validar todo Core. |
| **Carga CSS Incompatible** | Media | Medio | Fallback visual | Sostener la marca blanca mediante variables HSL inyectadas en JSON o inline HTML. |
| **Rotación de API Key Central** | Baja | Alto | Fallbacks hardcodeados | Propagar automáticamente los cambios de Firebase Central a través de las actualizaciones downstream de `sync_clients.js`. |

---

## 🚀 CHECKLIST DE BLINDAJE PARA NUEVOS CORES (A FUTURO)

Para asegurar que un nuevo Core desarrollado a futuro sea 100% compatible con el aprovisionador y no rompa el ecosistema, debe cumplir con las siguientes reglas arquitectónicas:

1. **Variables de Entorno Estructuradas**: Leer todos los secretos de Firebase exclusivamente mediante `import.meta.env` y el prefijo `VITE_`.
2. **Fallback de Conexión Central**: Integrar `centralFirebaseService.js` en el arranque (`App.jsx`) para el control remoto de pings y alertas de pago, respetando los fallbacks predeterminados.
3. **Resguardo de `firebase.json`**: No hardcodear propiedades específicas de cliente en el `firebase.json` del Core; este debe permanecer puramente estructural para que la sincronización downstream lo propague de forma limpia.
4. **Validación Sintáctica Local**: Incluir la suite de testing Playwright en el repositorio del Core para posibilitar el Smoke Test automático del CLI.
