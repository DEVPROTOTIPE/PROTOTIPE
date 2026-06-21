# 📋 Tareas Pendientes - App Ventas (Plantilla Core)

Roadmap de desarrollo, mejoras y corrección de errores para la plantilla base de Ventas.


- [x] ~~Auditoría y Correcciones del Módulo 2 (Cliente E-Commerce PWA y Catálogo): Altura responsiva con dvh en ModalTemplate, skeletons de alta fidelidad que mitigan CLS en ClientCatalog y ventana de diálogo de confirmación para abandono de checkout en CheckoutModal~~
- [x] ~~Auditoría y Correcciones del Módulo 1 (Autenticación, Acceso y Seguridad): Persistencia de bloqueo de PIN en localStorage, sanitización de entrada de celular a 10 dígitos y blindaje del listener de estado de autenticación~~
- [x] ~~Análisis y diseño del Plan de Optimización de Consumo de Base de Datos y Storage (WebP canvas, cursores de Firestore, caching e IndexedDB)~~
- [x] ~~Implementación del Plan de Optimización de Consumo de Base de Datos y Storage (Compresión WebP transparent client-side Canvas, paginación Firestore por cursores, IntersectionObserver scroll infinito y caching)~~
- [x] ~~Visibilidad Condicional de Auditoría de Ajustes de Stock condicionada al módulo de Múltiples Empleados~~
- [x] ~~Parche de Robustez en Catálogo de Clientes: Deduplicación de ID de productos y mitigación de bucle infinito de lecturas en Firestore al filtrar/buscar~~
- [x] ~~Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones de Carrito/Notificaciones y Stacking Context de Emojis~~
- [x] ~~Solución a la Detección de Repositorios Git en el Gestor de Respaldos (menú de backups)~~
- [x] ~~Sincronización de créditos con domicilio/descuento y optimización de carga paginada~~
- [x] ~~Corrección de ráfagas de toasts al iniciar sesión y vaciado de notificaciones unificado~~
- [x] ~~Rediseño de Toast de Confirmación en Ajustes del Administrador (UI/UX)~~
- [x] ~~Migración de Módulos Activos a Zona de Desarrollador protegida por PIN (Control de Negocio)~~
- [x] ~~Auditoría y Corrección del Módulo 3 (POS Vendedor, Bodega y Notificaciones de Portales): Transacciones de stock en Bodega, sincronización delta de clientes, cola offline IndexedDB en POS, y notificaciones push/real-time contextuales para Vendedor, Bodeguero y Mensajero~~
- [x] ~~Auditoría y Corrección del Módulo 4 (Domicilios y Backoffice): Desacoplamiento estructural de modales en el mensajero utilizando ModalTemplate, soporte offline para asignación y transición de pedidos en PortalMensajero, y optimización de renderizado en AdminOrders mediante componente memoizado OrderCard~~
- [x] ~~Auditoría y Corrección del Módulo 5 (Créditos y Saldos): Estandarización de modales de abonos con ModalTemplate en AdminCredits y ClientCredits, optimización de consultas de PDF de cartera limitándolo a créditos activos, remoción de useOrders en la vista de créditos, y consistencia transaccional robusta en abonos concurrentes~~
- [x] ~~Optimizar bundle de producción reduciendo importaciones no utilizadas y limpiando variables sin uso según reporte de ESLint~~
- [ ] Mejorar cobertura de pruebas unitarias y E2E con Playwright
- [x] ~~Refactorizar el almacenamiento offline usando IndexedDB (Cola de facturación local en PortalVendedor y sincronización delta de clientes)~~
