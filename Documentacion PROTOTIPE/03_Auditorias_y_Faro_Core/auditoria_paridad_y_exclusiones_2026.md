# Auditoría Técnica: Blindaje de Paridad, Exclusiones y Sincronización Multi-Core / Multi-Cliente

Esta auditoría analiza críticamente el comportamiento de la sincronización de Cores en el ecosistema **PROTOTIPE**, identifica vulnerabilidades operativas en el manejo de archivos de marcas y credenciales, y diseña la arquitectura definitiva para blindar el sistema en escenarios de múltiples Cores (Ventas, Servicios, Gastronomía) y múltiples instancias.

---

## 1. Diagnóstico de Riesgos e Inconsistencias Actuales

Tras analizar minuciosamente el código fuente de [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) y las carpetas de las plantillas y clientes, se detectaron los siguientes puntos críticos:

### A. Desacoplamiento entre Drift Detector y Sincronización Global
El Drift Detector utiliza la función `getFilesRecursively()`, que posee una lista de exclusión débil y cableada estáticamente (solo omite `.env.local` y carpetas de sistema como `node_modules` o `.git`).
Por el contrario, la sincronización en lote utiliza `getSyncFilesRecursiveAsync()`, que respeta la directiva `SYNC_EXCLUDED_PATHS`. Esto genera:
* **Falsos Positivos de Desviación:** Archivos como `.firebaserc`, `.env.example` o la documentación del cliente se marcan como "desviados" (bajando artificialmente el índice de paridad), aunque por diseño **deben ser diferentes**.
* **Vulnerabilidad de Sobrescritura:** Los endpoints de sincronización individual (`/api/project/sync-file`) no validan las exclusiones, permitiendo al desarrollador sobrescribir las API keys del cliente y desconectar su base de datos.

### B. El Dilema del `index.html` y Branding SEO
* **Riesgo del Bloqueo:** Si se excluye completamente el archivo `index.html` de la paridad, cualquier mejora realizada en el Core (por ejemplo, inyección de un script crítico de tracking, un viewport meta tag nuevo o una hoja de estilos CSS de inicialización) nunca llegará a los clientes.
* **Riesgo del Copiado Ciego:** Si se incluye sin control, al sincronizar se sobrescribirá el título, la descripción SEO y las etiquetas de Apple/PWA de la marca blanca del cliente con los del Core genérico.

### C. La Sincronización Rígida de Dependencias y Scripts (`package.json`)
* `package.json` contiene la identidad de la marca (ej: `"name": "ventas-moni-app"`). Si se sobrescribe el archivo plano, se rompe el aislamiento npm del cliente.
* Si se excluye de la sincronización de archivos planos, cualquier actualización de dependencias críticas o scripts de testing/construcción agregados en el Core de la plantilla no se propagará, dejando la instancia desactualizada y expuesta a fallos en compilaciones futuras.

---

## 2. Matriz de Exclusión y Sincronización de Máxima Robustez

Para garantizar la estabilidad multitenancy del ecosistema, se clasifica cada archivo en base a su rol y se define su comportamiento de sincronización:

| Archivo / Ruta Relativa | Comportamiento en Drift | Comportamiento en Sincronización | Justificación Técnica de Seguridad |
| :--- | :--- | :--- | :--- |
| **`.firebaserc`** | Excluido | **Bloqueado** | Almacena los Project IDs de Firebase específicos del cliente. Su alteración causa desvinculación total de la base de datos de producción. |
| **`firebase.json`** | Excluido | **Bloqueado** | Contiene configuraciones de hosting y emuladores del cliente. Su alteración puede inhabilitar las cabeceras personalizadas de PWA. |
| **`.env`, `.env.local`, `.env.*`** | Excluido | **Bloqueado** | Contienen variables y tokens de autenticación privados del entorno local de producción. |
| **`**/firebaseConfig.js`, `**/firebase.js`** | Excluido | **Bloqueado** | Inicialización del SDK cliente de Firebase (API keys, appId). Exclusivo de cada instancia de cliente. |
| **`**/niche.json`, `**/brand.json`** | Excluido | **Bloqueado** | Configuración de la vertical del cliente (tipos de pago, divisas, branding HSL). |
| **`public/favicon*`, `public/manifest.json`, `public/apple-touch*`, `public/android-chrome-*`, `public/mstile-*`, `public/safari-pinned-tab*`, `public/browserconfig.xml`** | Excluido | **Bloqueado** | Iconografías, colores de carga y metadatos PWA de la marca blanca del cliente. |
| **`src/assets/logo*`** | Excluido | **Bloqueado** | Logotipo corporativo específico de la marca blanca de la instancia cliente. |
| **`public/firebase-messaging-sw.js`** | Excluido | **Bloqueado** | Service worker que gestiona las notificaciones push inicializado con el App ID e identificador del cliente. |
| **`package-lock.json`** | Excluido | **Bloqueado** | Generado automáticamente. Comparar el archivo plano genera ruido irrelevante por variaciones en las sub-librerías locales del desarrollador. |
| **`node_modules/`, `.git/`, `dist/`, `.vite/`, `.firebase/`, `playwright-report/`, `test-results/`, `scratch/`, `scripts/`** | Excluido | **Bloqueado** | Carpetas temporales, cachés de compilación, logs, scripts auxiliares y reportes locales de pruebas Playwright. |
| **`index.html`** | Comparado (Filtrado) | **Fusión Inteligente** | SÍ se compara y se sincroniza, pero **mediante preservación de branding** (extracción e inyección de metatags y títulos del cliente). |
| **`package.json`** | Comparado (Filtrado) | **Fusión Inteligente** | SÍ se compara y sincroniza, pero **mediante fusión de propiedades JSON** (añade scripts y dependencias nuevas sin alterar la identidad del cliente). |
| **Archivos en `src/` (layouts, pages, components, hooks, services, stores, utils)** | Comparado | **Sincronización Plana** | Representan el core funcional y lógico del software de la app. Es obligatorio propagar cambios y mejoras. |

---

## 3. Arquitectura del Algoritmo de Blindaje

Para implementar la matriz de forma impecable en `server.js` sin cablear rutas fijas que inhabiliten otros Cores futuros, se diseñan tres helpers especializados:

### A. Validador Centralizado de Exclusiones (`isPathExcludedFromSync`)
Usa patrones y comodines insensibles a mayúsculas para abarcar todas las estructuras posibles de futuros Cores:
* Excluye archivos con patrón `/logo.*` o `/logo-.*` en cualquier carpeta de assets.
* Excluye archivos con patrón `*firebaseConfig*` o `*firebase.js` en cualquier carpeta de configuración.
* Excluye de forma flexible variables de entorno (`.env`, `.env.*`) y carpetas locales (`scratch/`, `scripts/`, `playwright-report/`, `test-results/`).

### B. Fusionador de Metatags en `index.html` (`preserveClientSeoOnIndex`)
Al copiar `index.html` desde el Core al Cliente:
1. Extrae el `<title>` y todos los metatags `<meta name="..." content="..." />` y `<meta property="..." content="..." />` del archivo destino (el cliente).
2. Si no se encuentran etiquetas (caso de archivo corrupto), utiliza los metadatos de `.prototipe.json` del cliente como plan de contingencia.
3. Copia el archivo del Core y sobrescribe su sección `<head>` re-inyectando las etiquetas del cliente respaldadas en memoria.

### C. Fusionador Lógico de Metadatos en `package.json` (`mergePackageJson`)
Al sincronizar cambios en `package.json`:
1. Lee los archivos JSON del Core y del Cliente.
2. Combina los objetos `dependencies` y `devDependencies` de forma aditiva (añadiendo nuevas librerías e igualando versiones).
3. Combina la sección `scripts` (añadiendo comandos de npm nuevos del Core).
4. **Preserva intactas** las propiedades de identidad del cliente: `"name"`, `"version"`, `"description"`, `"author"`, `"private"`.
5. Escribe el JSON final formateado en la instancia del cliente.
