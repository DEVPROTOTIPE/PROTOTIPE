# Auditoría de Seguridad y Viabilidad: Archivos Lógicos Sincronizables del Core Ventas

Este reporte técnico audita la seguridad, el acoplamiento y la viabilidad de sincronizar los 17 archivos de código fuente (`src/`) listados por el Drift Detector de la instancia del cliente `ventas-moni-app` frente al Core `App Ventas`.

---

## 🛠️ Diagnóstico y Análisis de Viabilidad

| Archivo | Severidad de Riesgo | Naturaleza del Cambio | ¿Contiene Credenciales/Branding Hardcodeado? | ¿Es Seguro Sincronizar? | Causa Raíz / Justificación Técnica |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `src/App.jsx` | **Bajo** | Modificado | No | **Sí** | Es el punto de entrada de React. Las variaciones estéticas de branding e identificadores de Firebase se consultan de forma 100% dinámica mediante el Store de Zustand y el proveedor de contexto. No hay URLs de producción ni tokens. |
| `src/components/admin/inventory/ProductFormModal.jsx` | **Bajo** | Modificado | No | **Sí** | Formulario de inventario y variantes. Importa las dependencias lógicas del servicio de subidas y las referencias de base de datos. La inicialización de la conexión de subida de archivos se realiza a través de `firebaseConfig.js`, que lee localmente del `.env.local` del cliente. |
| `src/components/admin/settings/DeveloperDiagnosticsModal.jsx` | **Bajo** | Modificado | No | **Sí** | Diagnóstico operativo del desarrollador. Muestra variables en consola y en UI consumiendo dinámicamente el `import.meta.env` del cliente actual, sin exponer contraseñas del Core. |
| `src/components/client/SoftPushPrompt.jsx` | **Bajo** | [NUEVO] | No | **Sí** | Componente visual ausente en cliente. Ofrece un flujo amigable previo a la solicitud del permiso de notificaciones push del navegador. Código 100% reutilizable y genérico. |
| `src/hooks/useAppConfigSync.js` | **Bajo** | Modificado | No | **Sí** | Hook de sincronización en tiempo real. Sincroniza la colección de configuraciones con el store local. Las consultas a Firestore se ejecutan contra la base de datos parametrizada del cliente. |
| `src/hooks/useFCMPermission.js` | **Bajo** | [NUEVO] | No | **Sí** | Hook de Firebase Cloud Messaging ausente en cliente. Gestiona la obtención de tokens del navegador. Si el cliente no utiliza FCM, la API tiene un bloque de contingencia `isSupported()` que mitiga fallos en ejecución. |
| `src/layouts/AdminLayout.jsx` | **Bajo** | Modificado | No | **Sí** | Estructura responsiva de navegación del administrador. Obtiene nombre de tienda e ícono del store global. No tiene marcas fijas. |
| `src/layouts/ClientLayout.jsx` | **Bajo** | Modificado | No | **Sí** | Estructura del catálogo y carrito del cliente. La barra de navegación se personaliza dinámicamente con los colores HSL inyectados desde el theme provider. |
| `src/layouts/PortalLayout.jsx` | **Bajo** | Modificado | No | **Sí** | Estructura de navegación para el portal de usuarios. Estructural y seguro de sincronizar. |
| `src/pages/LoginPage.jsx` | **Bajo** | Modificado | No | **Sí** | Página de autenticación. Las credenciales de autenticación se gestionan dinámicamente mediante el servicio Firebase Auth de la instancia cliente. |
| `src/pages/admin/settings/sections/AppearanceSettings.jsx` | **Bajo** | Modificado | No | **Sí** | Panel de control de colores HSL, fuentes y redondeo. Permite la personalización visual de la marca guardando datos en la base de datos Firestore del cliente. Es vital propagarlo para dar soporte a las nuevas paletas avanzadas. |
| `src/pages/client/ClientOrders.jsx` | **Bajo** | Modificado | No | **Sí** | Lista de órdenes históricas y activas del usuario. Utiliza Firestore del cliente en base al usuario autenticado. |
| `src/pages/client/OrderTracking.jsx` | **Bajo** | Modificado | No | **Sí** | Seguimiento dinámico de estados del pedido en tiempo real para clientes. Sin acoplamientos rígidos. |
| `src/services/inventoryService.js` | **Bajo** | Modificado | No | **Sí** | Capa lógica de comunicación con las colecciones de Firestore del cliente. No contiene IDs del Core. |
| `src/services/uploadService.js` | **Bajo** | Modificado | No | **Sí** | Servicio que comprime las fotos localmente en el navegador a través de canvas y las sube al bucket de Firebase Storage correspondiente al cliente actual. |
| `src/store/appConfigStore.js` | **Bajo** | Modificado | No | **Sí** | Store de Zustand que centraliza el estado del frontend. La persistencia se realiza localmente en el LocalStorage de la instancia activa del cliente. |
| `src/utils/imageCompression.js` | **Bajo** | Modificado | No | **Sí** | Función matemática y de canvas pura para optimización y compresión de archivos de imagen antes del upload. 100% seguro. |

---

## 🛡️ Medidas de Blindaje Aplicadas
El sistema cuenta con un blindaje multicapa implementado en el backend del CLI (`Prototipe-CLI/server.js`) para garantizar que la paridad sea 100% robusta y no afecte la integridad de las marcas:
1. **Exclusión Física Activa:** Los archivos de credenciales y configuración locales (`.env`, `.env.local`, `.firebaserc`, `firebase.json`, `.gitignore`, `public/firebase-messaging-sw.js`, `.prototipe.json`) están 100% excluidos y bloqueados (`403 Forbidden` en endpoints de sincronización).
2. **Protección de Assets del Cliente:** Los logotipos (`logo.*`, `logo-*`) ubicados en `src/assets/` y los favicons/manifest en `public/` están totalmente excluidos para evitar sobrescribir la identidad visual del negocio.
3. **Preservación Inteligente de SEO (`index.html`):** Al sincronizar la estructura HTML del Core, el backend extrae el título, metatags SEO y los scripts de analíticas de terceros del cliente (ubicados en el bloque seguro `<!-- CLIENT_SCRIPTS_START -->` ... `<!-- CLIENT_SCRIPTS_END -->`) y los reinyecta intactos en el resultado final.
4. **Fusión Lógica de Dependencias (`package.json`):** Fusiona las dependencias comunes y conserva aditivamente las dependencias locales del cliente, sin alterar el nombre o la versión del proyecto de la instancia.

## 📢 Conclusión de Auditoría
Todos los archivos listados corresponden a **lógica pura de software, hooks de estado, utilidades y layouts reactivos**, los cuales no contienen datos harcodeados específicos de la marca ni credenciales de acceso. Su sincronización es **100% segura** y es sumamente recomendable para propagar las nuevas mejoras, resolución de bugs de carga de imágenes y el panel de configuración de apariencia al cliente actual.
