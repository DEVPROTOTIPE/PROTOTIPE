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
- [x] ~~Mejorar cobertura de pruebas unitarias y E2E con Playwright~~
- [x] ~~🔐 Hardening Core Ventas (Evolución SaaS segura)~~
  - [x] **Fase 1: Seguridad y Modelo de Datos** — Separación de `orders/` (privada) y `order_tracking/` (pública, sin PII), indexación privada `user_order_index` por hash de celular, y notificaciones de tracking directo.
  - [x] **Fase 2: Escalabilidad Firestore** — limit(), startAfter() cursores, y filtro where('archivado', '==', false) en la consulta activa de pedidos para optimizar el consumo de base de datos de los administradores.
  - [x] **Fase 3: Calidad y Seguridad Adicional** — Validación de variables de entorno al startup (VITE_FIREBASE_*), eliminación definitiva de fallbacks de PIN.
  - [x] **Fase 4: Testing Completo** — Pruebas E2E e integración en Playwright para orderService (hashing de celular y motor de sincronización offline IndexedDB) y seguridad de tracking de pedidos.
  - [x] **Fase 5.1: Cobertura de Tests de Dominio** — Configuración de Vitest, mocks transaccionales y tests unitarios de createOrder, updateOrderStatus, syncOfflineSales, billingService y creditService.
  - [x] **Fase 5.2: Refactor Feature-Based** — Separación de store/hooks/components por dominios (orders, billing, sales).
  - [x] **Fase 5.3: Migración Final FDD** — Migración completa de los dominios `inventory` y `credits` a la carpeta `features/`, con JSDoc y barriles de exportación, eliminación de archivos legacy y validación de build.
  - [x] **Fase 6: Tipado Progresivo** — Anotaciones JSDoc y tipado de contratos públicos completados para todas las features migradas.
- [x] ~~Estabilización de Notificaciones: Corrección de error en vaciado de bandeja (eliminación física completa), sincronización del contador de no leídos con actualización optimista, agregación de restricciones de recipientRole en consultas de cliente, y actualización de permisos de borrado en firestore.rules~~
- [x] ~~Refactorizar el almacenamiento offline usando IndexedDB (Cola de facturación local en PortalVendedor y sincronización delta de clientes)~~
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
- [x] ~~Mejorar cobertura de pruebas unitarias y E2E con Playwright~~
- [x] ~~🔐 Hardening Core Ventas (Evolución SaaS segura)~~
  - [x] **Fase 1: Seguridad y Modelo de Datos** — Separación de `orders/` (privada) y `order_tracking/` (pública, sin PII), indexación privada `user_order_index` por hash de celular, y notificaciones de tracking directo.
  - [x] **Fase 2: Escalabilidad Firestore** — limit(), startAfter() cursores, y filtro where('archivado', '==', false) en la consulta activa de pedidos para optimizar el consumo de base de datos de los administradores.
  - [x] **Fase 3: Calidad y Seguridad Adicional** — Validación de variables de entorno al startup (VITE_FIREBASE_*), eliminación definitiva de fallbacks de PIN.
  - [x] **Fase 4: Testing Completo** — Pruebas E2E e integración en Playwright para orderService (hashing de celular y motor de sincronización offline IndexedDB) y seguridad de tracking de pedidos.
  - [x] **Fase 5.1: Cobertura de Tests de Dominio** — Configuración de Vitest, mocks transaccionales y tests unitarios de createOrder, updateOrderStatus, syncOfflineSales, billingService y creditService.
  - [x] **Fase 5.2: Refactor Feature-Based** — Separación de store/hooks/components por dominios (orders, billing, sales).
  - [x] **Fase 5.3: Migración Final FDD** — Migración completa de los dominios `inventory` y `credits` a la carpeta `features/`, con JSDoc y barriles de exportación, eliminación de archivos legacy y validación de build.
  - [x] **Fase 6: Tipado Progresivo** — Anotaciones JSDoc y tipado de contratos públicos completados para todas las features migradas.
- [x] ~~Estabilización de Notificaciones: Corrección de error en vaciado de bandeja (eliminación física completa), sincronización del contador de no leídos con actualización optimista, agregación de restricciones de recipientRole en consultas de cliente, y actualización de permisos de borrado en firestore.rules~~
- [x] ~~Refactorizar el almacenamiento offline usando IndexedDB (Cola de facturación local en PortalVendedor y sincronización delta de clientes)~~
- [x] ~~Corregir la descarga de facturas en el apartado del cliente importando la constante PAYMENT_METHODS para evitar un ReferenceError al generar el documento de impresión~~
- [x] ~~Corregir el bloqueo de scroll en el selector de temas del desarrollador reemplazando ThemeModalLock por un useEffect directo para prevenir la captura errónea de overflow: hidden durante re-renders~~
- [x] ~~Corregir la superposición de la línea de encabezado divisoria sobre las tarjetas principales en el perfil del cliente mediante la alternancia dinámica de z-index basada en el estado del selector de emojis~~
- [x] ~~Agregar el botón de alternar modo oscuro en el perfil del cliente de la App Ventas para que el usuario final pueda cambiar entre temas claro y oscuro instantáneamente~~
- [x] ~~Rediseñar el encabezado de bienvenida del dashboard administrativo (AdminHome.jsx) a un diseño asimétrico premium estilo SaaS con orbes de fondo, dot verde pulsante e indicadores interactivos de caja diaria y pedidos pendientes~~
- [x] ~~Validación Arquitectónica Post-FDD: Auditados cross-imports entre features (0 violaciones), reporte de cobertura Vitest (14/14 tests), npm audit (0 vulnerabilidades), npm outdated (patches identificados), y reglas FDD confirmadas en restricciones_tecnicas.md~~
- [x] ~~Fix E2E Playwright `checkout.spec.js`: Timeout en selector `input[type="tel"]` (paso 2 del CheckoutModal) - Resuelto haciendo el helper adaptativo a inputs visibles y pasos del checkout~~
- [x] ~~Actualizar patches de dependencias y configurar pipeline de CI/CD para automatizar compilación y pruebas~~
- [x] ~~Fix Recomendaciones del Carrito (`CartDrawer.jsx`): Recomendados no aparecían en producción.~~
  - [x] ~~Causa raíz: `commercialOptimization` ausente del `partialize` de Zustand → store hidrataba con `{}` → check `=== true` fallaba.~~
  - [x] ~~Solución: Agregar `commercialOptimization` a `partialize` en `appConfigStore.js` + cambiar check a `!== false` en `useCartRecommendations.js`.~~
  - [x] ~~Crear `src/hooks/useCartRecommendations.js` como hook dedicado con `isMounted` + `fetchVersionRef`.~~
  - [x] ~~Migrar lógica de recomendaciones de `CartDrawer.jsx` al hook dedicado.~~
  - [x] ~~Agregar `version: 2` + `migrate` al `persist` de Zustand para limpiar legacy localStorage.~~

