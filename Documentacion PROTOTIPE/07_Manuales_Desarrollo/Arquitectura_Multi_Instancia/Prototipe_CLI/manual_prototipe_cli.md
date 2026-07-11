# 🛠️ Manual Técnico — Prototipe CLI

> **Última actualización:** 2026-06-08  
> **Ubicación del proyecto:** `D:\PROTOTIPE\Prototipe-CLI\`  
> **Propósito:** Aprovisionamiento automatizado de nuevas instancias del ecosistema Ecosistema Prototipe.

---

## 1. Arquitectura General

El CLI se compone de **3 archivos JavaScript** con responsabilidades bien separadas:

```
Prototipe-CLI/
├── cli.js          → Modo terminal interactivo (Inquirer.js)
├── server.js       → Bridge API HTTP (Express en puerto 3001)
├── generator.js    → Motor puro de aprovisionamiento (copia, configura, despliega)
└── templates/
    └── template-ventas/   → Plantilla base de la app de ventas
```

### Cómo se relacionan

```
Dev Dashboard (React)
        │
        │  HTTP (localhost:3001)
        ▼
   server.js  ──────────────────▶  generator.js
  (Bridge API)       llama              (lógica pura)
        │
        ▼
   Firebase CLI / GitHub CLI / npm
```

- **`cli.js`**: Se usa directamente en terminal cuando no se tiene el Dashboard activo. Lanza un formulario interactivo con Inquirer y llama a `generator.js` directamente.
- **`server.js`**: Expone los mismos datos vía HTTP. El Dashboard Dev lo consume para aprovisionamiento visual con un clic.
- **`generator.js`**: No tiene UI. Solo recibe un objeto `answers` con los datos del briefing y ejecuta los 11 pasos de aprovisionamiento.

---

## 2. Cómo Levantar el Bridge API (server.js)

El Bridge API debe estar **corriendo en segundo plano** para que el Dashboard Dev pueda auto-detectar credenciales y crear proyectos:

```bash
# Desde la carpeta del CLI
cd D:\PROTOTIPE\Prototipe-CLI
node server.js
```

**Salida esperada al iniciar:**
```
🚀 [Prototipe CLI Bridge] Servidor local escuchando en: http://localhost:3001
Endpoints activos:
 - GET  http://localhost:3001/api/templates
 - GET  http://localhost:3001/api/firebase-config?projectId=[id]&projectName=[name]
 - POST http://localhost:3001/api/create-project
```

> [!IMPORTANT]
> Si el servidor NO está corriendo, el Dashboard Dev entra en modo de tolerancia a fallos: los datos del cliente se guardan en Firestore igualmente, pero **no se crea el proyecto físico en disco**. Aparecerá el banner rojo de reintento en el panel.

---

## 3. Endpoints del Bridge API

### `GET /api/templates`

Retorna la lista de plantillas disponibles en la carpeta `/templates/`.

**Request:** Sin parámetros.

**Response exitosa:**
```json
{
  "templates": ["template-ventas", "template-core-seed"]
}
```


**Errores posibles:**
| Código | Causa |
|--------|-------|
| `404` | La carpeta `/templates/` no existe |
| `500` | Error al leer el sistema de archivos |

---

### `GET /api/firebase-config`

**El endpoint más importante del flujo.** Usa la Firebase CLI instalada localmente para extraer automáticamente las 6 credenciales del SDK de un proyecto Firebase, sin necesidad de entrar a la consola web.

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectId` | string | ✅ Sí | ID del proyecto en Firebase (ej. `ventas-moni-app`) |
| `projectName` | string | ❌ No | Nombre visual del proyecto. Se usa solo si hay que crear la Web App automáticamente |

**Flujo interno:**
1. Ejecuta `firebase apps:sdkconfig web --project [projectId] --json`
2. Si el error indica que no existe Web App registrada → ejecuta `firebase apps:create web "[projectName]"` y reintenta automáticamente
3. Parsea el JSON de salida extrayendo las 6 variables del SDK
4. Retorna las credenciales al dashboard

**Response exitosa:**
```json
{
  "success": true,
  "config": {
    "apiKey": "AIzaSy...",
    "authDomain": "mi-proyecto.firebaseapp.com",
    "projectId": "mi-proyecto",
    "storageBucket": "mi-proyecto.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc123",
    "measurementId": "G-XXXXX"
  }
}
```

**Errores posibles:**
| Código | Mensaje | Causa |
|--------|---------|-------|
| `400` | `"El parámetro projectId es obligatorio."` | No se envió el query param |
| `500` | `"No estás autenticado en la Firebase CLI..."` | No has hecho `firebase login` |
| `500` | `"Error al consultar Firebase CLI: ..."` | Proyecto no existe, sin permisos, timeout |

> [!NOTE]
> La VAPID Key para notificaciones push **NO puede extraerse** con este endpoint — es una limitación de la API de Firebase. Debe obtenerse manualmente desde: Firebase Console → Configuración del Proyecto → Cloud Messaging → Certificados Push Web → Generar par de claves.

---

### `POST /api/create-project`

Dispara el aprovisionamiento físico completo del proyecto en disco. Llama internamente a `generator.js`.

**Body (JSON) — Campos requeridos:**
| Campo | Descripción |
|-------|-------------|
| `clientId` | Slug único del cliente (ej. `ventas-moni`) |
| `nombre` | Nombre legible del cliente |
| `comisionPorcentaje` | Tasa de comisión (ej. `1.5`) |
| `enableDianBilling` | `boolean` — Habilitar módulo de Facturación Electrónica DIAN |
| `costoPorFacturaDian` | Tarifa de amortización por factura emitida DIAN (ej. `150`) |
| `telemetryToken` | Token único generado por el dashboard |
| `targetPath` | Ruta absoluta en disco donde se crea el proyecto |
| `template` | Nombre de la plantilla (ej. `template-ventas`) |
| `enableGithub` | `boolean` — Crear repositorio en GitHub |
| `enableFirebaseDeploy` | `boolean` — Desplegar reglas e índices |
| `firebaseConfig.apiKey` | Credencial del cliente |
| `firebaseConfig.authDomain` | Credencial del cliente |
| `firebaseConfig.projectId` | Credencial del cliente |
| `firebaseConfig.storageBucket` | Credencial del cliente |
| `firebaseConfig.messagingSenderId` | Credencial del cliente |
| `firebaseConfig.appId` | Credencial del cliente |
| `firebaseConfig.vapidKey` | VAPID Key para notificaciones push |

**Response exitosa:**
```json
{
  "success": true,
  "message": "Proyecto creado físicamente con éxito.",
  "data": {
    "clientId": "ventas-moni",
    "uniqueToken": "ventas-moni-token-1748997600000",
    "targetDir": "D:\\PROTOTIPE\\App-ventas-moni",
    "themeName": "rosa-elegante",
    "primaryColor": "hsl(346, 84%, 61%)",
    "vapidPublicKey": "BNt5o...",
    "prompt": "# 🚀 Prompt de Arranque para Google Antigravity..."
  }
}
```

---

## 4. El Motor de Aprovisionamiento (`generator.js`)

Cuando recibe el objeto `answers`, ejecuta **11 pasos secuenciales**:

| Paso | Acción | Resultado |
|------|--------|-----------|
| **0** | Creación previa del proyecto en Firebase Console | Prerrequisito obligatorio antes de aprovisionar |
| **1** | Copia la plantilla base a `targetPath` | Copia `template-ventas` para vertical o `template-core-seed` para modo limpio desde cero |
| **2** | Configura paleta HSL (predefinida o custom) | Variables de color del tema definidas |
| **3** | Genera claves VAPID automáticamente con `web-push` | Clave pública lista para notificaciones push |
| **4** | Crea `.env.local` con todas las variables de entorno | Firebase del cliente + credenciales del Ecosistema central |
| **5** | Crea `.firebaserc` | Vincula el proyecto a Firebase CLI |
| **6** | Inyecta credenciales y llave VAPID en `public/firebase-messaging-sw.js` | Service Worker de notificaciones configurado con VAPID |
| **6.2** | Inyecta dinámicamente etiquetas meta SEO, título y descripción en `index.html` | SEO de index.html configurado según el briefing |
| **6.3** | Genera logo y favicon SVG de iniciales si no se proporciona uno | Favicon y logo de marca iniciales autogenerados con HSL primario |
| **7** | Crea `/scratch/generate_ia_map.js` | Script de indexación para la IA |
| **7.5** | Copia `GEMINI.md` desde la base de estándares global | Reglas e instrucciones para la IA garantizadas en el destino |
| **8** | Actualiza `package.json` con scripts `map` y `build` | Mapa auto-generado en cada build |
| **9** | Crea `antigravity_bootstrap_prompt.md` | Prompt de arranque listo para copiar al nuevo chat. Si es `template-core-seed`, inyecta directrices de desarrollo modular component-first y alerta de lienzo limpio. |
| **10** | Ejecuta `npm install` y `npm run map` | Dependencias instaladas + mapa inicial generado |
| **11** | (Opcional) Git init + Git Hook + `gh repo create` | Repositorio local inicializado, Git Hook pre-commit inyectado, y subido a GitHub |
| **12** | (Opcional) `firebase deploy --only firestore:rules,indexes` | Reglas e índices desplegados en Firebase del cliente |


### Paletas HSL disponibles

| Key | Nombre | Color primario | Uso sugerido |
|-----|--------|----------------|--------------|
| `emerald` | Verde Esmeralda | `hsl(142, 70%, 45%)` | Restaurantes, abarrotes |
| `ruby` | Rosa Elegante | `hsl(346, 84%, 61%)` | Ropa, accesorios |
| `violet` | Púrpura Mora | `hsl(262, 83%, 58%)` | Barberías, estéticas |
| `amber` | Dorado Premium | `hsl(38, 92%, 50%)` | Joyería, café bar |
| `custom` | Personalizada | HSL ingresado manualmente | Cualquier nicho |

---

## 5. Modo Terminal Interactivo (`cli.js`)

Alternativa al Dashboard cuando se trabaja directamente en terminal, sin el servidor Bridge activo.

```bash
cd D:\PROTOTIPE\Prototipe-CLI
node cli.js
```

Lanza un formulario interactivo de Inquirer con los siguientes campos en orden:

1. Plantilla base (lista de `/templates/`)
2. Nombre del proyecto
3. Ruta de destino (autogenerada como `D:\PROTOTIPE\App-[slug]`)
4. Paleta de color (emerald / ruby / violet / amber / custom)
5. 6 credenciales Firebase del cliente
6. 3 credenciales del Firebase Central (`prototipe-multi-instancia-control`) — con valores por defecto precargados

Al finalizar muestra el checklist de aprovisionamiento manual en consola.

---

## 6. Flujo Completo de Onboarding (De Principio a Fin)

```
1. Crear proyecto en Firebase Console (nuevo proyecto vacío)
2. En Dev Dashboard → Formulario de Registro:
   a. Nombre del cliente → Auto-genera Client ID y Token
   b. Firebase Project ID → Clic "Auto-detectar" → 5 credenciales se rellenan solas
   c. VAPID Key → Copiar manualmente desde Firebase Console → Cloud Messaging
   d. Seleccionar plantilla y ruta de destino
3. Clic "Registrar y Generar Onboarding"
   → Firestore Central: crea /clientes_control/{id} y /tokens/{token}
   → CLI Bridge: copia plantilla, inyecta credenciales, instala npm, crea repo GitHub
4. Modal de Onboarding muestra:
   → Token para copiar
   → Prompt de Antigravity para el nuevo chat
   → Checklist de 3 activaciones manuales en Firebase Console:
     ☐ Activar Authentication (Email/Password)
     ☐ Crear base de datos Firestore
     ☐ Habilitar Firebase Storage
5. Abrir la carpeta del nuevo proyecto en VS Code
6. Pegar el contenido de antigravity_bootstrap_prompt.md en un nuevo chat de Antigravity
7. npm run dev → Verificar que la app corre con los colores de marca del cliente
8. firebase deploy --only hosting → Publicar (solo cuando el cliente apruebe)
```

---

## 7. Sistema de Reintentos (Resiliencia ante Fallos)

Si el CLI Bridge falla durante el aprovisionamiento (internet caído, daemon apagado), el Dashboard Dev implementa tolerancia a fallos en dos niveles:

| Falla | Comportamiento |
|-------|----------------|
| **Firestore falla** | `catch` captura el error, toast de error, formulario **queda intacto**. Puedes reintentar presionando el botón de registro. |
| **CLI falla (Firestore OK)** | El payload completo se guarda en estado `pendingCliProvisioning`. Aparece un **banner rojo** en el panel con el botón **"Reintentar"** que re-ejecuta solo `POST /api/create-project` sin tocar Firestore. |

El banner rojo persiste hasta que el reintento sea exitoso o lo descartes manualmente.

---

## 8. Prerequisitos del Sistema

Para que todo funcione correctamente, el equipo de desarrollo debe tener instalado:

| Herramienta | Comando de verificación | Para qué se usa |
|-------------|------------------------|-----------------|
| Node.js 18+ | `node --version` | Correr el CLI y el servidor |
| Firebase CLI | `firebase --version` | Auto-detectar credenciales y desplegar |
| GitHub CLI (`gh`) | `gh --version` | Crear repositorio automáticamente (opcional) |
| Sesión Firebase | `firebase login` | Autenticación para todos los comandos Firebase |
| Sesión GitHub | `gh auth login` | Autenticación para crear repos (si `enableGithub = true`) |

---

## 9. Archivos Generados por el CLI en Cada Proyecto

Después de un aprovisionamiento exitoso, el proyecto destino tendrá:

App-[clientId]/
├── .env.local                          ← 17 variables de entorno inyectadas
├── .firebaserc                         ← Vinculación al proyecto Firebase del cliente
├── GEMINI.md                           ← Reglas y estándares del ecosistema para la IA (Copiado de backup)
├── antigravity_bootstrap_prompt.md     ← Prompt de arranque para Antigravity
├── mapa_arquitectura_ia.md             ← Mapa inicial de arquitectura (auto-generado)
├── public/
│   └── firebase-messaging-sw.js        ← Service Worker con credenciales del cliente
└── scratch/
    └── generate_ia_map.js              ← Script de re-indexación

### 🐙 9.2 - Integración de Git Hooks en el Scaffolding
Para garantizar que todos los nuevos desarrollos y marcas conserven la alineación semántica y las directivas de IA actualizadas, el generador copia automáticamente un script de hook pre-commit desde `D:\PROTOTIPE\Prototipe-CLI\hooks\pre-commit` hacia el directorio `.git/hooks/pre-commit` del nuevo proyecto.
*   **Comportamiento:** Cada vez que el desarrollador intente realizar un `git commit`, el hook ejecutará el script central de sincronización de reglas `sync_rules.js` para propagar el `GEMINI.md` maestro a todos los subproyectos y añadirá las modificaciones al stage antes de confirmar los cambios.
*   **Soporte Multiplataforma:** En sistemas UNIX/macOS, el generador otorga permisos de ejecución al hook de forma nativa utilizando `chmod +x` tras la copia física.

### [2026-06-08] - Refactorización de Robustez y Multiplataforma (Tarea 278)
* **`[BUG-021]`**: El comando de aprovisionamiento forzaba `cmd /c` en `npm install` e `npm run map`.
  - *Causa raíz*: Acoplamiento absoluto a la terminal Command Prompt de Windows, provocando colapsos sintácticos en macOS, Linux y Docker.
  - *Solución*: Remoción de `cmd /c` y delegación del proceso a la ejecución shell multiplataforma nativa de Node.js mediante el parámetro `{ shell: true }`.
* **`[BUG-022]`**: Falla silenciosa al inyectar credenciales Firebase en `firebase-messaging-sw.js`.
  - *Causa raíz*: El regex original `/apiKey:\s*"[^"]*"/` solo coincidía con comillas dobles, dejando placeholders intactos en plantillas formateadas con comillas simples o invertidas.
  - *Solución*: Implementada una función helper de reemplazo robusta `replaceFirebaseField` que maneja dinámicamente cualquier delimitador de comillas (`'`, `"`, `` ` ``).
* **`[BUG-023]`**: Tags SEO duplicados en el `index.html` de los shards del cliente.
  - *Causa raíz*: La expresión de limpieza de metatags exigía el cierre XHTML rígido (` \/>`), ignorando la sintaxis HTML5 limpia (`>`) lo que duplicaba las cabeceras.
  - *Solución*: Ajustados los patrones de las expresiones regulares a `/<?>` opcionales en toda la cabecera del documento.
* **`[BUG-024]`**: API keys de la Consola Central hardcodeadas en el CLI interactivo.
  - *Causa raíz*: Riesgo de desalineación o claves obsoletas ante rotación de credenciales del proyecto central.
  - *Solución*: Inyección de lectura nativa del archivo `.env` del CLI para poblar `process.env` y servir las credenciales de forma dinámica.

---

## 10. Historial de Errores y Bugs Corregidos (Junio 2026)

| ID de Bug | Descripción del Error | Ubicación / Archivos Afectados | Causa Raíz | Solución Implementada |
| :--- | :--- | :--- | :--- | :--- |
| **`[BUG-017]`** | La paleta de colores customizada no se aplicaba al generar el proyecto desde la UI del Dashboard. | `generator.js`, `dev-dashboard/src/App.jsx` | El payload enviado por el Dashboard no incluía `customPrimary` / `customAccent` en el payload CLI. | Modificación en `App.jsx` para inyectar `customPrimary` y `customAccent` en el `cliPayload`, y ajuste en `generator.js` para usarlos como fallbacks. |
| **`[BUG-018]`** | El script de siembra automática `seed_brand.js` fallaba en instancias aisladas de clientes. | `scratch/seed_brand.js` | Usaba `firebase-admin` requiriendo un service account JSON inexistente por seguridad en el template. | Migración completa a Firebase Client SDK + autenticación `signInWithEmailAndPassword`, resolviendo credenciales de `.env.local`. |
| **`[BUG-019]`** | Sintaxis corrupta en `cli.js` rompía el modo de terminal interactivo. | `cli.js` (Línea 164) | Residuo accidental de texto corrupto (`}ojectId}`) tras una edición de código anterior. | Eliminación física del residuo sintáctico corrupto. |
| **`[BUG-020]`** | La siembra no alteraba el logo, eslogan ni datos de contacto en la UI. | `scratch/seed_brand.js`, `scratch/seed_ropa_interior.js` | Los scripts escribían la configuración en `/config/appConfig`, pero la app lee desde `/config/settings`. | Ajuste de las referencias de base de datos en ambos archivos de siembra para escribir en `/config/settings`. |

---

## 🛑 Resolución de Problemas de Despliegue de Firebase

Si durante la ejecución de `POST /api/create-project` o desde el Dashboard Dev se visualiza la siguiente advertencia en consola:
`⚠️ Fallo al desplegar en Firebase: Command failed: firebase deploy --only firestore:rules,firestore:indexes -P [id-proyecto-firebase]. Asegúrate de tener firebase-cli logueado.`

### Pasos de Solución:
1. **Despliegue Local (Desarrollo):** Ejecuta de inmediato `firebase login --reauth` en tu terminal del sistema para restablecer las credenciales locales globales de Firebase.
2. **Entornos Autónomos (Servidores / CI):** Genera un token perpetuo de despliegue usando `firebase login:ci`, y asígnalo a la variable de entorno `FIREBASE_TOKEN` del backend. El API Bridge detectará este token y lo inyectará en cascada en todos los comandos de la CLI de Firebase agregando `--token "%FIREBASE_TOKEN%"`.

---

## 🚀 11. Pipeline de Promoción y Migración de Cores (Fase 6)

El daemon de `server.js` aloja y orquesta los endpoints del pipeline de promoción de cores e inmunidad ante drifts. Toda la documentación técnica de los contratos JSON, políticas de sanitización, locks concurrentes y máquina de estados transaccionales se encuentra centralizada en el [Manual de Promoción de Instancias Clientes a Plantillas Core](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_promocion_clientes_a_cores.md).


