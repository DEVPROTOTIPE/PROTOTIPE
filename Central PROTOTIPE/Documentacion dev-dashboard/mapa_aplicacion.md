# Mapa de la Aplicación - dev-dashboard

Estructura física y lógica de los archivos del proyecto.

## Estructura de Archivos

- `index.html`: Punto de entrada HTML. Contiene los metadatos SEO de la consola central, tipografía Outfit de Google Fonts y favicon SVG animado de **PROTOTIPE**.
- `src/main.jsx`: Punto de entrada de React. Configura los proveedores globales.
- `src/App.jsx`: Componente principal del dashboard. Contiene:
  - Interfaz de comisiones, CRM de clientes con panel modal interactivo de gestión (edición de vertical/nicho, cobros en caliente y control local de servidores de desarrollo `npm run dev`), métricas superiores con efectos glow, consola de telemetría y diagnóstico con LEDs y Consola de Errores e Incidentes en tiempo real con paginación premium fluida.
  - **Página de Onboarding Wizard a pantalla completa:** Wizard de 3 pestañas: Servidor (con pre-flight checks de Firebase y VAPID Key); Branding (con Branding Studio HSL, validador matemático de contraste WCAG 2.1, selector de 100 paletas premium por nicho en acordeón y selector expandido de Google Fonts); Módulos (selector de nicho de mercado y feature flags).
  - **Smartphone Mockup Interactivo:** Simulador de smartphone en el panel derecho del wizard. Cuenta con cambio de pestañas interactivo (Inicio, Ventas/Servicios, Ajustes), creación de ventas simuladas, y un apartado interactivo de Catálogo/Servicios dinámico por nicho (`MOCK_CATALOG`) cuyos registros suman valores financieros al balance simulado en tiempo real.
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
- `src/components/admin/ComponentSandbox.jsx`: Entorno Sandbox (playground interactivo) a doble columna de versión ultraliviana. Resuelve y orquesta la importación dinámica y carga perezosa (`React.lazy` + `Suspense` + `LoaderSpinner`) de los 42 sandboxes independientes para reducir el tamaño del build y mejorar la interacción.
- `src/components/admin/CoreCard.jsx`: Componente modular para tarjetas de plantillas core. Permite gestionar variables de entorno, confirmar des-registro en dos pasos y optimizar el ciclo de renderizado de la consola de despliegues.
- `src/components/admin/CoreManagerPanel.jsx`: Panel de control para gestionar las plantillas base del ecosistema. Implementa consola de subida de logs y el panel de auto-resolución visual ante fallos del guardián de calidad en deploy.
- `src/components/admin/E2EPanel.jsx`: Panel de pruebas E2E automatizadas mediante Playwright con streaming SSE de logs del bridge server local.
- `src/components/admin/sandboxes/`: Carpeta plana de componentes de simulación independientes. Contiene los archivos de sandbox individuales (como `RuletaSuerteSandbox.jsx`, `BentoGridSandbox.jsx`, etc.) y el componente común `SandboxLayout.jsx` que centraliza los controles de propiedades.
- `firestore.rules`: Reglas de seguridad de Firestore para el proyecto central.

