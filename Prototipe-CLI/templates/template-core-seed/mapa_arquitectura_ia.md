# 🗺️ Mapa de Arquitectura y Rutas Semánticas para Inteligencia Artificial

> [!IMPORTANT]
> **INSTRUCCIONES PARA LA IA:** Lee este archivo para comprender instantáneamente la estructura física, los roles de los módulos y las dependencias de este proyecto. Utiliza los enlaces directos en formato URL absoluta para abrir o editar archivos directamente sin realizar búsquedas recursivas (grep) innecesarias en el espacio de trabajo.

---

## 📂 Directorio de Archivos y Roles Técnicos

### ⚙️ Componente UI (Interfaz de usuario reusable)

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **DeveloperDiagnosticsModal.jsx** | Componente o módulo funcional de la aplicación. | `firebaseConfig`, `firestore` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) |
| **AppLoader.jsx** | Componente o módulo funcional de la aplicación. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/AppLoader.jsx) |

### ⚙️ Enrutador (Navegación de vistas)

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **AppRoutes.jsx** | Componente o módulo funcional de la aplicación. | `AppLoader` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/routes/AppRoutes.jsx) |

### ⚙️ Estado Global (Zustand Store de sincronización)

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **appConfigStore.js** | Store de configuración de la aplicación. Refleja en tiempo real los datos cargados desde Firestore /config/settings. Controla: nombre de la app, tema, modo oscuro, paleta de colores. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) |
| **authStore.js** | Store de autenticación global. Maneja el estado del usuario actual (admin o cliente). Persiste en localStorage para mantener sesión activa. | `constants` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/authStore.js) |

### ⚙️ Hook Custom (Lógica reactiva modular)

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **useAppConfigSync.js** | Variables de entorno del cliente | `firestore`, `appConfigService`, `billingService`, `telemetryService`, `centralFirebaseService`, `appConfigStore` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) |
| **useAuthInit.js** | Hook para inicializar la autenticación de la aplicación. Maneja la lógica híbrida: 1. Clientes: Viven en LocalStorage (hidratación de Zustand). 2. Administradores: Viven en Firebase Auth. | `firebaseConfig`, `firestore`, `authStore`, `appConfigStore`, `constants` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAuthInit.js) |
| **useBilling.js** | Componente o módulo funcional de la aplicación. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) |

### ⚙️ Servicio de Backend / API (Integración de persistencia)

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **appConfigService.js** | Ruta del documento de configuración global en Firestore | `firebaseConfig` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) |
| **authService.js** | Cierra la sesión del administrador en Firebase Auth. | `firebaseConfig` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/authService.js) |
| **billingService.js** | Variables de entorno para conectar al Firebase Central de Control (Spark mode) | `firebaseConfig`, `appConfigService`, `constants`, `centralFirebaseService` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) |
| **centralFirebaseService.js** | Componente o módulo funcional de la aplicación. | `firestore` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) |
| **telemetryService.js** | Variables de entorno para modo Blaze (HTTP) | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) |

### ⚙️ Utilidad/Helper

| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |
| :--- | :--- | :--- | :--- |
| **App.jsx** | ─── Cliente de TanStack Query (caché global, reintentos automáticos) ───────── | `react-query`, `AppRoutes`, `appConfigStore`, `useAppConfigSync`, `useAuthInit`, `palettes` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) |
| **firebaseConfig.js** | Configuración oficial de Firebase para la aplicación. Las credenciales se obtienen desde variables de entorno (.env.local) para no exponerlas en el código fuente. | `firestore` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/firebaseConfig.js) |
| **niche.json** | Componente o módulo funcional de la aplicación. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/niche.json) |
| **fonts.js** | ─── TIPOGRAFÍAS DE LA APLICACIÓN ─────────────────────────────────────────── 20 fuentes organizadas por categoría estética. Cada fuente se carga dinámicamente desde Google Fonts. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/fonts.js) |
| **index.js** | Constantes globales de infraestructura del Core Seed. Contiene únicamente los valores de soporte y roles genéricos. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) |
| **palettes.js** | Colores base para fondos y superficies si no se especifican en la paleta | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js) |
| **index.css** | ═══════════════════════════════════════════════════════════════════════════ SISTEMA DE PALETAS DE COLORES — App Ventas 8 temas: Femeninos | Masculinos | Neutros | Oscuros Aplicados via atributo data-theme en el elemento raíz <html> Modo oscuro: clase 'dark' en <html> ═══════════════════════════════════════════════════════════════════════════ | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/index.css) |
| **main.jsx** | Registrar Service Worker para PWA (auto-update instantáneo) | `App.jsx` | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/main.jsx) |
| **dynamicManifest.js** | Dibuja un rectángulo con esquinas redondeadas. | Ninguna | [Abrir Archivo](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/utils/dynamicManifest.js) |

---

## 📐 Prompt de Asimilación del Entorno (Para la IA)
Cuando te sea provisto este mapa:
1. **Asimila el Dominio:** Identifica qué páginas de negocio interactúan con qué servicios o almacenes de Zustand.
2. **Navegación Directa:** Cuando debas modificar código, utiliza estrictamente las rutas absolutas indicadas en la tabla anterior en tus herramientas de edición o lectura de archivos para ahorrar ciclos de búsqueda.
3. **Análisis de Impacto:** Antes de refactorizar un archivo, revisa la columna "Dependencias Críticas" para prevenir regresiones en componentes que lo consuman.
