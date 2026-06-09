# Protocolo de Inicialización y Bootstrap de Nuevos Proyectos (Ecosistema Blueprint)

Este estándar técnico establece el protocolo obligatorio para iniciar cualquier nuevo proyecto de software a medida bajo nuestro ecosistema. Su propósito es **garantizar** que cada nueva aplicación incorpore de manera nativa e instantánea el generador de mapas para IA, el sistema de siembra de base de datos y la capacidad de reutilizar componentes portables de nuestra biblioteca sin fricciones.

---

## 🏛️ Modelo Arquitectural Confirmado: Un Proyecto Firebase por Cliente

En el ecosistema Ecosistema de Prototipe, cada cliente cuenta con su propia instancia física y lógica completamente aislada en un proyecto Firebase independiente. 

### Justificación Técnica (Aislamiento de Autenticación y Datos)
- **Aislamiento de Firebase Auth:** Firebase Authentication trabaja a nivel de proyecto. Compartir un único proyecto Firebase entre múltiples clientes B2B impediría la independencia de inicios de sesión y complicaría el control de accesos de manera crítica.
- **Robustez y Seguridad:** El aislamiento total de Firestore por cliente asegura que un bug de filtración o error en las reglas de seguridad no exponga datos sensibles de un comercio a otro.
- **Rendimiento:** Evita problemas de límites físicos de lecturas/escrituras de base de datos (congestión por ráfagas de múltiples clientes).
- **Flexibilidad de Despliegue:** Cada cliente puede poseer sus propias Cloud Functions y dominio propio en Hosting sin colisionar con otros inquilinos.

### Integración Central y Telemetría
Aunque los proyectos de base de datos y auth estén completamente aislados, cada instancia de cliente se conecta a la base de datos central de control (**`prototipe-multi-instancia-control`**) exclusivamente para reportar comisiones, métricas de facturación y auditorías de telemetría a través de una segunda instancia de Firebase App (`centralDevApp`) inicializada en caliente usando las variables `VITE_DEVELOPER_CENTRAL_*` en el `.env.local` de cada cliente.

```mermaid
graph TD
    subgraph Central Control
        C[prototipe-multi-instancia-control]
    end
    subgraph Cliente 1 (e.g., Lencería Sofía)
        A1[ventas-smartfix]
        T1[telemetryService]
        B1[billingService]
    end
    subgraph Cliente 2 (e.g., Barbería Glamour)
        A2[app-barber-glamour]
        T2[telemetryService]
        B2[billingService]
    end

    T1 -->|Reporta telemetría / token| C
    B1 -->|Reporta cobros / comisiones| C
    T2 -->|Reporta telemetría / token| C
    B2 -->|Reporta cobros / comisiones| C
```

---

## 📋 Checklist de Inicialización (Paso a Paso)

### Paso 0: Creación Previa del Proyecto Firebase
Antes de ejecutar el `Prototipe-CLI` o realizar el aprovisionamiento desde el Dashboard Dev, es **obligatorio** crear manualmente el nuevo proyecto en la Firebase Console del cliente:
1. Crear el proyecto en la Firebase Console (ej: `ventas-mi-cliente`).
2. Habilitar **Firebase Authentication** (proveedor por Correo/Contraseña y Teléfono).
3. Habilitar **Cloud Firestore** en modo producción y en la región preferida (ej: `southamerica-east1` o `us-east1`).
4. Habilitar **Firebase Hosting**.

### Paso 1: Configurar la carpeta de Utilidades (`/scratch/`)
Crea un directorio llamado `/scratch/` (o `/scripts/`) en la raíz del nuevo proyecto y copia en él las dos herramientas core de automatización:
1. **`generate_ia_map.js`**: El indexador de rutas semánticas que permite a la IA entender todo el código en su primer turno.
2. **`seed_brand.js`**: El script de siembra adaptado para poblar Firestore o la base de datos correspondiente con la configuración inicial de marca y datos demo del cliente.

### Paso 2: Automatizar los scripts de NPM
Abre el archivo `package.json` de la nueva aplicación y añade el script de mapeo, enlazándolo con el comando de compilación para garantizar que el mapa se actualice ante cualquier cambio en el código:
```json
  "scripts": {
    "dev": "vite",
    "map": "node scratch/generate_ia_map.js",
    "build": "npm run map && vite build"
  }
```

### Paso 3: Inicializar la documentación física del proyecto
Crea una carpeta de control documental o añade la ruta correspondiente en el repositorio local. Para mantener la alineación técnica con nuestro estándar, es mandatorio crear/copiar cuatro archivos en la raíz o directorio de documentación de la nueva app:
1. `mapa_arquitectura_ia.md` *(Se autogenera al ejecutar `npm run map`)*.
2. `bitacora_cambios.md` *(Historial cronológico de cambios de código)*.
3. `tareas_pendientes.md` *(Control de estado de los requerimientos / Roadmap)*.
4. `GEMINI.md` *(Instrucciones del proyecto, estándares del stack y reglas de comportamiento del ecosistema Ecosistema para la IA. Se copia del backup en `/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`)*.


### Paso 4: Orientar a la IA con el Mapa de Documentación Global
La documentación compartida (Biblioteca de Componentes, Módulos Completos, Manuales, Estándares) no cambia con cada proyecto — es global. Para que la IA la localice instantáneamente, provéele la ruta del mapa de documentación en el primer prompt:

👉 **Mapa de Documentación Global:** [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md)

> [!TIP]
> Este archivo actúa como el GPS de la documentación. Contiene todos los enlaces directos a manuales, bitácoras, la biblioteca de componentes, los módulos completos y sus índices internos.

### Paso 5: Carga del Prompt de Arranque a la IA
En el **primer mensaje** de cada nueva sesión de desarrollo, copia y pega el siguiente prompt. Le provees ambos mapas (código + documentación) para que la IA tenga contexto total desde el turno cero:

> ⚙️ **PROMPT DE INICIALIZACIÓN PARA LA IA (CON AMBOS MAPAS):**
> *"Hola. Vamos a trabajar sobre este proyecto. Antes de proceder, lee de forma prioritaria los siguientes dos archivos de navegación. Son tu GPS completo:*
>
> *1. **Mapa de Código** → `mapa_arquitectura_ia.md` en la raíz del proyecto: contiene las rutas absolutas y el rol técnico de cada módulo de código.*
> *2. **Mapa de Documentación** → [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md): contiene la estructura completa de la documentación global (biblioteca de componentes, módulos completos, manuales, bitácoras y estándares).*
>
> **Reglas de trabajo obligatorias:**
> 1. Usa las rutas absolutas de ambos mapas para acceder a archivos directamente sin realizar búsquedas recursivas (`grep` o `list_dir`) innecesarias.
> 2. Antes de implementar cualquier lógica nueva, revisa el índice [README.md de la Biblioteca de Componentes](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) y la carpeta [10_Modulos_Completos](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/10_Modulos_Completos/) para verificar si ya existe un componente portable o un módulo de negocio (Feature) que pueda reutilizarse.
> 3. Al culminar cada tarea, registra proactivamente el cambio en `bitacora_cambios.md` y `tareas_pendientes.md` sin necesidad de que yo te lo recuerde."*

### Paso 6: Configurar e inyectar PWA con Auto-Actualización instantánea
Para asegurar que todo cambio o corrección crítica desplegada por Firebase Hosting se refleje inmediatamente en el navegador de los clientes y administradores de forma transparente (sin obligarles a recargar dos veces o borrar la caché del navegador manualmente), se debe configurar de forma obligatoria en la inicialización:

1. **En `vite.config.js`:**
   Inyectar dentro del plugin de `VitePWA` el parámetro `registerType: 'autoUpdate'` y habilitar el control inmediato del Service Worker en las opciones de `workbox`:
   ```javascript
   VitePWA({
     registerType: 'autoUpdate',
     workbox: {
       skipWaiting: true,      // Fuerza al Service Worker nuevo a activarse de inmediato
       clientsClaim: true,     // Reclama el control de las pestañas activas al instante
       cleanupOutdatedCaches: true
     },
     // ...
   })
   ```

2. **En `src/main.jsx`:**
   Registrar el Service Worker capturando el callback de refresco y forzando la recarga síncrona de la ventana:
   ```javascript
   import { registerSW } from 'virtual:pwa-register'

   const updateSW = registerSW({
     immediate: true,
     onNeedRefresh() {
       console.log('[PWA Update] Nueva versión detectada, recargando aplicación...')
       updateSW(true).then(() => {
         window.location.reload()
       })
     }
   })
   ```

### Paso 7: Declaración y Despliegue de Índices de Firestore
Para garantizar que las consultas compuestas y filtros múltiples en caliente de la aplicación nunca lancen excepciones de indexado ausente en producción (`FirebaseError: The query requires an index`), la IA y el desarrollador deben auditar y sincronizar los índices compuestos de forma obligatoria:

1. **Auditoría de Consultas compuestas:**
   Analizar estáticamente los archivos de servicios (`src/services/`) y hooks de la aplicación buscando consultas de Firestore que utilicen múltiples filtros combinados (`where`) u ordenamientos complejos (`orderBy`).
2. **Definición en `firestore.indexes.json`:**
   Declarar localmente la estructura JSON del índice compuesto correspondiente dentro de la matriz `indexes` del archivo de configuración del proyecto:
   ```json
   {
     "collectionGroup": "nombre_coleccion",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "campo_filtro_1", "order": "ASCENDING" },
       { "fieldPath": "campo_orden_2", "order": "DESCENDING" }
     ]
   }
   ```
3. **Despliegue proactivo via CLI:**
   Una vez configurados localmente, la IA debe inicializar la base de datos Firestore y desplegar los índices compuestos directamente usando Firebase CLI apuntando al identificador del nuevo proyecto del cliente:
   ```bash
   firebase deploy --only firestore:indexes -P [id-proyecto-firebase]
   ```

### Paso 8: Autoinicialización y Blindaje de Ajustes del Sistema (settings)
Para evitar que la interfaz de la aplicación se congele o muestre una **pantalla en blanco** debido a la ausencia del documento `/config/settings` en la base de datos de un nuevo cliente/proyecto, la IA debe verificar que:
1. El servicio `appConfigService.js` intercepte la ausencia de los datos del documento (`snap.exists() === false`).
2. Se realice un aprovisionamiento síncrono inicializando los datos por defecto (`DEFAULT_SETTINGS`) y escribiéndolos en Firestore para desbloquear la hidratación del store global (`isLoaded: true`) al instante.
3. Se garantice un fallback en memoria local en caso de fallos de red durante la primera carga para que el login siempre esté visible y funcional.

### Paso 8.5: Ley e Integración Obligatoria de Telemetría Automática en Caliente (Ecosistema Bridge)
Para garantizar la consolidación centralizada de cobros y facturación de todas las instancias del ecosistema, **cualquier nueva aplicación (sea creada desde una plantilla o desarrollada 100% desde cero)** debe incorporar obligatoriamente el reporte de telemetría mensual de comisiones.

#### Protocolo de Integración en Proyectos Nuevos/Desde Cero:
1. **Copiar los Servicios de Monetización y Conexión:** Importar o transcribir [centralFirebaseService.js](file:///D:/PROTOTIPE/App%20Ventas/src/services/centralFirebaseService.js) (singleton de base de datos secundaria), `billingService.js` y `telemetryService.js` a la carpeta `src/services/` de la nueva aplicación.
2. **Consumir el Singleton Central:** Asegurarse de que tanto `telemetryService.js` como `billingService.js` consuman `getCentralFirestore()` desde `centralFirebaseService.js` en lugar de instanciar aplicaciones de Firebase directamente, evitando así colisiones de conexión múltiple en caliente durante el Hot Reload.
3. **Conectar el Listener en useAppConfigSync.js:** Al inicializar la app, se debe activar la escucha en segundo plano de los acumulados de ventas del periodo actual mediante `subscribeToBillingData`.
4. **Disparar la Transmisión:** Al recibir las métricas, llamar a `reportMonthlyBillingToDeveloper` pasándole las ventas del mes actual (`metrics.totalMes`), la configuración de facturación, el periodo en formato `YYYY-MM` y el conteo de servicios.

Este proceso debe ser asíncrono y silencioso (capturado con `catch`), de modo que si las variables centrales del desarrollador en `.env.local` no están configuradas, los servicios detecten automáticamente el modo local y no interfieran con la experiencia de usuario ni inyecten errores en la consola.

---

## 📦 Cómo Reutilizar Componentes y Módulos Completos

Todos los componentes de nuestra **Biblioteca de Componentes** (`D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`) y los módulos completos de **Módulos Completos** (`D:\PROTOTIPE\Documentacion PROTOTIPE\10_Modulos_Completos\`) han sido diseñados bajo los siguientes pilares para asegurar compatibilidad en nuevos proyectos:

1. **Cero Dependencias Rígidas de Iconos:**
   No usan `lucide-react` ni otras librerías. Tienen SVGs inline nativos embebidos y aceptan la inyección de íconos mediante la propiedad `icons={{}}`.
2. **Estilos Parametrizables (HSL Color-mix):**
   Utilizan variables CSS nativas para el color de marca primaria (`--color-primary-hsl`) y el color de acción (`--color-action-hsl`). Al cambiar estas variables en el `index.css` de tu nuevo proyecto, todos los componentes reutilizados adaptarán su paleta de color automáticamente.
3. **Persistencia Desacoplada (ServiceConfig):**
   Los hooks y servicios de base de datos no tienen rutas de colecciones hardcodeadas. Aceptan un objeto `config` (que contiene referencias de base de datos, nombres de colecciones y callbacks) para que puedas inyectar la configuración del nuevo cliente.

---

## ⚠️ Paso 9: Configuración Correcta del `.env.local` por Tipo de Proyecto

> [!CAUTION]
> **REGLA CRÍTICA — SIEMPRE VERIFICAR ANTES DE INICIAR DESARROLLO:**
> Mezclar las credenciales de Firebase entre el proyecto base (SmartFix) y un proyecto de cliente real (Moni, etc.) provoca errores de permisos en consola, conexiones a bases de datos incorrectas y comportamientos inesperados de la aplicación.

Existen **dos tipos de proyectos** en el ecosistema. Cada uno tiene un patrón de `.env.local` diferente y **obligatorio**:

---

### 🔵 Tipo 1: Proyecto Base de Desarrollo (`ventas-smartfix`)
Es la **plantilla core** usada para desarrollo y pruebas. **NO se conecta a ninguna base de datos central ni reporta telemetría.**

```env
# ─── Firebase del proyecto base ───────────────────────────────
VITE_FIREBASE_API_KEY=[credencial de ventas-smartfix]
VITE_FIREBASE_AUTH_DOMAIN=ventas-smartfix.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ventas-smartfix
VITE_FIREBASE_STORAGE_BUCKET=ventas-smartfix.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=[id de ventas-smartfix]
VITE_FIREBASE_APP_ID=[app id de ventas-smartfix]

# ─── Conexión Central Ecosistema ─── DESACTIVADA EN BASE TEMPLATE ───
VITE_DEVELOPER_TELEMETRY_ENDPOINT=
VITE_DEVELOPER_TELEMETRY_TOKEN=
VITE_DEVELOPER_CENTRAL_API_KEY=
VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN=
VITE_DEVELOPER_CENTRAL_PROJECT_ID=
VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET=
VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID=
VITE_DEVELOPER_CENTRAL_APP_ID=
VITE_DEVELOPER_CLIENT_ID=

# ─── FCM Push ─────────────────────────────────────────────────
VITE_FIREBASE_VAPID_KEY=[vapid key de ventas-smartfix]
```

> [!IMPORTANT]
> Con todas las variables `VITE_DEVELOPER_CENTRAL_*` vacías, los servicios `billingService.js` y `telemetryService.js` detectan automáticamente que no hay conexión central y operan en modo local puro, sin intentar conectarse a `prototipe-multi-instancia-control`. **Cero errores de permisos en consola.**

---

### 🟢 Tipo 2: Proyecto de Cliente Real (ej: `ventas-moni-app`)
Es una instancia clonada del Core para un cliente real. **SÍ se conecta a la base de datos central** para sincronización de comisiones y telemetría.

> [!NOTE]
> **Aprovisionamiento Automatizado (Recomendado):**
> 1. Al ejecutar `Prototipe-CLI`, este genera automáticamente el slug del `clientId` y el `VITE_DEVELOPER_TELEMETRY_TOKEN` dinámico único en el `.env.local` del nuevo proyecto.
> 2. Desde el **Dashboard Dev (Consola Central)**, el formulario de Briefing de Clientes creará de manera atómica ambos documentos en Firestore central (`clientes_control/{id}` y `tokens/{TOKEN}`), eliminando la necesidad de inserción manual.

**Checklist de configuración obligatoria para un cliente nuevo (Manual o Automatizado):**

- [ ] **Las credenciales Firebase principales** (`VITE_FIREBASE_*`) apuntan al proyecto Firebase del cliente (ej: `ventas-moni-app`), NO al proyecto base SmartFix.
- [ ] **El `VITE_DEVELOPER_CLIENT_ID`** corresponde exactamente al ID del proyecto Firebase del cliente (ej: `ventas-moni-app`).
- [ ] **El documento del cliente existe** en la colección `/clientes_control/{CLIENT_ID}` de la BD central `prototipe-multi-instancia-control` con los campos: `comisionPorcentaje`, `nombre` *(automatizado por Dashboard Dev)*.
- [ ] **⚠️ CRÍTICO — El documento token existe** en la colección `/tokens/{VITE_DEVELOPER_TELEMETRY_TOKEN}` de la BD central `prototipe-multi-instancia-control` con los campos: `active: true`, `clientId: {CLIENT_ID}` *(automatizado por Dashboard Dev)*. **Sin este documento las reglas de Firestore bloquearán toda escritura a `reportesBilling`.**
- [ ] **El token** `VITE_DEVELOPER_TELEMETRY_TOKEN` en el `.env.local` del cliente **coincide** con el ID del documento token creado (`/tokens/{TOKEN}`).
- [ ] **El `firebase-messaging-sw.js`** en `public/` tiene las credenciales del proyecto Firebase del cliente, **no del proyecto base SmartFix**.
- [ ] **El `.firebaserc`** tiene el proyecto del cliente como `default` para despliegues.

> [!CAUTION]
> **Orden de aprovisionamiento si se realiza manualmente:**
> 1. Crear `/clientes_control/{CLIENT_ID}` en Firestore central (comisión, nombre)
> 2. Crear `/tokens/{TOKEN}` en Firestore central (active, clientId)
> 3. Configurar `.env.local` con las variables centrales activadas
> 4. Actualizar `firebase-messaging-sw.js` con las credenciales del cliente
> 5. Actualizar `.firebaserc` con el project ID del cliente

```env
# ─── Firebase del cliente real ─────────────────────────────────
VITE_FIREBASE_API_KEY=[credencial de ventas-moni-app]
VITE_FIREBASE_AUTH_DOMAIN=ventas-moni-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ventas-moni-app
VITE_FIREBASE_STORAGE_BUCKET=ventas-moni-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=[id de ventas-moni-app]
VITE_FIREBASE_APP_ID=[app id de ventas-moni-app]

# ─── Conexión Central Ecosistema ─── ACTIVADA EN CLIENTE REAL ────────
VITE_DEVELOPER_TELEMETRY_ENDPOINT=
VITE_DEVELOPER_TELEMETRY_TOKEN=[token único del cliente — debe coincidir con Firestore central]
VITE_DEVELOPER_CENTRAL_API_KEY=[api key de prototipe-multi-instancia-control]
VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN=prototipe-multi-instancia-control.firebaseapp.com
VITE_DEVELOPER_CENTRAL_PROJECT_ID=prototipe-multi-instancia-control
VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET=prototipe-multi-instancia-control.firebasestorage.app
VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID=[messaging id central]
VITE_DEVELOPER_CENTRAL_APP_ID=[app id central]
VITE_DEVELOPER_CLIENT_ID=ventas-moni-app

# ─── FCM Push ──────────────────────────────────────────────────
VITE_FIREBASE_VAPID_KEY=[vapid key del proyecto del cliente]
```

> [!WARNING]
> **Verificar también `firebase-messaging-sw.js`:** Este archivo en `/public/` tiene credenciales hardcodeadas del proyecto Firebase. Al clonar el Core para un nuevo cliente, **actualizar obligatoriamente** las credenciales dentro de `firebase.initializeApp({...})` para que apunten al proyecto del cliente, no al proyecto base SmartFix. De lo contrario las notificaciones push fallarán silenciosamente.

---

### 📋 Origen de los errores de esta sesión (`[BUG-016]` y errores de permisos)

| Error | Causa Raíz | Prevención |
|:------|:-----------|:-----------|
| `FirebaseError: Expected first argument to doc()` en AdminHome | `getCentralFirestore()` retornaba `FirebaseApp` en lugar de `getFirestore(app)` | Siempre llamar `getFirestore(app)` al final de la inicialización |
| `Missing or insufficient permissions` en `reportesBilling` | El documento `/tokens/{TOKEN}` no existía en la BD central. Las reglas lo buscan para validar cada escritura | Crear el documento `/tokens/{TOKEN}` en `prototipe-multi-instancia-control` como paso 2 del aprovisionamiento |
| `Missing or insufficient permissions` en `clientes_control` | La regla `allow read: if request.auth != null` rechazaba al cliente porque su auth pertenece a su propio proyecto Firebase, no al central | Cambiar la regla a `allow read: if true` (los datos de comisión no son sensibles) |
| App conectada a `ventas-moni-app` en lugar de `ventas-smartfix` | El `.env.local` fue reemplazado con las credenciales de Moni durante el aprovisionamiento | Nunca copiar el `.env.local` de un cliente real al template base; usar el Prototipe-CLI para generar uno nuevo |
| `[BUG-020]` La siembra no cambia el logo ni datos de marca en la UI | El script de siembra escribía config en `/config/appConfig`, pero la app consume desde `/config/settings` | Asegurar que el script de siembra de base de datos escriba la configuración de marca exclusivamente en `/config/settings` |

---

## 🛑 Protocolo de Autocorrección de Errores de Firebase CLI (Despliegues fallidos)

En caso de que el asistente de aprovisionamiento, la IA o el CLI local fallen al ejecutar comandos de despliegue (`firebase deploy --only...`) mostrando el error:
`Fallo al desplegar en Firebase: Command failed: firebase deploy --only... Asegúrate de tener firebase-cli logueado.`

### Instrucción Obligatoria para la IA y Scripts de Resiliencia:
1. **Detección Activa:** Al detectar una falla de autenticación en la consola del CLI, la IA o el script no deben reintentar en bucle infinito.
2. **Acción de Mitigación Automática en Entorno Local:**
   * La IA debe indicarle inmediatamente al usuario que ejecute `firebase login --reauth` en su terminal de sistema para restablecer las credenciales locales globales.
3. **Acción en Servidores de Aprovisionamiento Continuo / CI:**
   * Si no hay sesión interactiva activa, se debe validar la variable de entorno `FIREBASE_TOKEN` del backend. Si está ausente, emitir una alerta crítica en la respuesta de la API `POST /api/create-project` solicitando configurar el token obtenido con `firebase login:ci`.
   * El comando de despliegue debe forzar el uso del token si está disponible: `firebase deploy --only firestore:rules,firestore:indexes -P [id-proyecto-firebase] --token "%FIREBASE_TOKEN%"`.


