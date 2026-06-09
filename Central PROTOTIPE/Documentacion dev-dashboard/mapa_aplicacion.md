# Mapa de la Aplicación - dev-dashboard

Estructura física y lógica de los archivos del proyecto.

## Estructura de Archivos

- `index.html`: Punto de entrada HTML. Contiene los metadatos SEO de la consola central, tipografía Outfit de Google Fonts y favicon SVG animado de **PROTOTIPE**.
- `src/main.jsx`: Punto de entrada de React. Configura los proveedores globales.
- `src/App.jsx`: Componente principal del dashboard. Contiene:
  - Interfaz de comisiones, CRM de clientes con panel modal interactivo de gestión (edición de vertical/nicho y cobros en caliente), métricas superiores interactivas con efectos glow, consola de telemetría con LEDs y Consola de Errores e Incidentes en tiempo real con paginación premium fluida.
  - **Página de Onboarding Wizard a pantalla completa:** Wizard de 3 pestañas (Servidor con Firebase auto-detectar y VAPID Key; Branding con paletas recomendadas, círculos de colores rápidos y selector expandido de Google Fonts; Módulos con selector visual de nicho de mercado y feature flags) y visualizador mock interactivo de smartphone reactivo en tiempo real.
  - **Mecanismo de Reintentos Offline:** Sistema de recuperación con guardado de datos en `LocalStorage` (`pendingCliProvisioning`) y banner de alerta para re-aprovisionar entornos en la API local si el daemon de Node.js está apagado.
  - Integración asíncrona mediante peticiones HTTP `POST /api/create-project` y `GET /api/firebase-config` / `/api/templates`.
- `src/index.css`: Estilos globales y definición de variables de tema (Claro/Oscuro), tipografías (Outfit, Inter) y tokens HSL con **animaciones tecnológicas avanzadas (Gradient Shift, Radar Pulse y Hover Glow)**.
- `src/components/ui/DarkModeToggle.jsx`: Componente para alternar el modo claro y oscuro de la aplicación.
- `src/components/ui/GuidedToast.jsx`: Componente de notificación toast para feedback del usuario.
- `src/components/common/AlertConfirmContext.jsx`: Contexto para confirmación y alertas estilizadas en la interfaz.
- `src/hooks/useCopyToClipboard.js`: Hook para copiar textos al portapapeles.
- `src/hooks/useToast.js`: Hook para gestionar notificaciones toast.
- `src/services/pdfService.js`: Servicio de generación de recibos PDF comisionales.
- `src/services/uploadService.js`: Servicio de subida de imágenes a Firebase Storage.
- `src/components/admin/ComponentLibraryView.jsx`: Interfaz de explorador del catálogo de la biblioteca de componentes. Incluye buscador fuzzy, contador dinámico, botones segmentados de filtro (Todos, Sandbox, Solo Docs), drawer lateral, selector colapsable premium por categoría (acordeón) con animaciones spring de Framer Motion, e icono Ojo (`Eye`) para identificar simulaciones en caliente.
- `src/components/admin/ComponentSandbox.jsx`: Entorno Sandbox (playground interactivo) a doble columna de versión ultraliviana. Resuelve y orquesta la importación dinámica y carga perezosa (`React.lazy` + `Suspense` + `LoaderSpinner`) de los 40 sandboxes independientes para reducir el tamaño del build y mejorar la interacción.
- `src/components/admin/sandboxes/`: Carpeta plana de componentes de simulación independientes. Contiene los 40 archivos de sandbox individuales (como `RuletaSuerteSandbox.jsx`, `BentoGridSandbox.jsx`, etc.) y el componente común `SandboxLayout.jsx` que centraliza los controles de propiedades.
- `firestore.rules`: Reglas de seguridad de Firestore para el proyecto central.

