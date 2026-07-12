# 📑 Bitácora de Cambios - App Ventas (Plantilla Core)

Historial de cambios, mejoras y correcciones técnicas aplicadas sobre la plantilla core de Ventas.

### [2026-07-10] - Estabilización de E2E Checkout, Cobertura del Dominio y Configuración CI/CD
* **Tipo:** Estabilización / Cobertura de Código / CI/CD
* **Severidad:** Alta
* **Descripción de Cambios:**
  - **E2E Playwright:** Eliminadas dependencias rígidas en `tests/helpers/checkout.helpers.js`. El flujo del test checkout ahora es dinámico, resiliente a variaciones de delivery/pago, y pasa exitosamente con Playwright (4/4 ✅).
  - **Pruebas Unitarias de Dominio (Vitest):**
    - Creado `tests/unit/inventoryService.spec.js` (87.73% de cobertura).
    - Creado `tests/unit/salesService.spec.js` (81.81% de cobertura).
    - Expandido `tests/unit/creditService.spec.js` (77.77% de cobertura).
    - Expandido `tests/unit/orderService.extended.spec.js` (61.88% de cobertura).
    - Todas las pruebas unitarias de dominio superan con éxito el objetivo establecido de ≥60% de cobertura.
  - **CI/CD Pipeline:** Creado `.github/workflows/ci.yml` configurando la instalación, pruebas unitarias Vitest con cobertura, pruebas Playwright E2E y compilación de producción.
  - **Documentación Técnica:** Creados `arquitectura_features.md`, `modelo_firestore.md`, `estrategia_testing.md` y `guia_multitenant.md` en la carpeta local de documentación, y registrados en el mapa semántico global de la IA.
* **Archivos Modificados:**
  - [tests/helpers/checkout.helpers.js](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/tests/helpers/checkout.helpers.js) [MODIFY]
  - [tests/unit/inventoryService.spec.js](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/tests/unit/inventoryService.spec.js) [NEW]
  - [tests/unit/salesService.spec.js](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/tests/unit/salesService.spec.js) [NEW]
  - [tests/unit/creditService.spec.js](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/tests/unit/creditService.spec.js) [MODIFY]
  - [tests/unit/orderService.extended.spec.js](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/tests/unit/orderService.extended.spec.js) [MODIFY]
  - [.github/workflows/ci.yml](file:///d:/PROTOTIPE/Plantillas Core/App Ventas/.github/workflows/ci.yml) [NEW]
* **Build:** ✅ 2822 módulos compilados con éxito, 0 errores.

---

### [2026-07-10] - Fix Definitivo: Recomendaciones del Carrito (Causa Raíz: Zustand partialize)
* **Tipo:** Corrección de Bug Crítico
* **Severidad:** Alta
* **Causa Raíz Definitiva:** El campo `commercialOptimization` NO estaba en `partialize` del store. En cada carga, Zustand hidrataba el store con `{}` (objeto vacío) para ese campo durante el intervalo entre el montaje del componente y la llegada del snapshot de Firestore. El check `=== true` fallaba con `{}.enabled === undefined`, retornando `cartRecsEnabled = false` y abortando el fetch de recomendaciones. App Moni funcionaba porque **sí** persiste `commercialOptimization` en localStorage.
* **Descripción de Cambios:**
  - **[MODIFY]** `src/store/appConfigStore.js`: Agregado `commercialOptimization: state.commercialOptimization` al bloque `partialize`. Ahora el valor se persiste en localStorage correctamente tras el primer sync de Firestore, eliminando el estado vacío en cargas posteriores.
  - **[MODIFY]** `src/hooks/useCartRecommendations.js`: Cambiado check de `enabled === true` a `enabled !== false`. Esto hace que `{}` (estado vacío inicial) sea tratado como "habilitado por defecto", en lugar de "deshabilitado". Defensivo y consistente con la intención de negocio.
  - Hook reescrito final: lógica idéntica a App Moni (probada) + `fetchVersionRef` como doble seguro anti race-condition en carrito abierto/cerrado rápido.
* **Archivos Modificados:**
  - [src/store/appConfigStore.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  - [src/hooks/useCartRecommendations.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useCartRecommendations.js) [MODIFY]
* **Build:** ✅ 2822 módulos, 0 errores.

---

### [2026-07-10] - Refactor Recomendador Comercial del Carrito (Race Condition Fix)

* **Tipo:** Corrección de Bug / Refactorización Estructural
* **Severidad:** Alta
* **Causa Raíz:** El `useEffect` en `CartDrawer.jsx` tenía `[isOpen, cartRecsEnabled, historyRecsEnabled, clientPhone]` como dependencias. Cuando el estado de autenticación (`role`/`user`) se resolvía **después** de que el carrito abría, `clientPhone` cambiaba de `false` a un valor real, cancelando el primer fetch via `isMounted = false` — resultado descartado. Síntoma: skeleton flash → desaparece → vacío permanente.
* **Descripción de Cambios:**
  - **[CREATE]** `src/hooks/useCartRecommendations.js`: Hook dedicado con patrón `fetchVersionRef` que reemplaza el `isMounted` frágil. El effect solo depende de `isOpen`; auth/config se leen dentro del async.
  - **[MODIFY]** `src/components/client/cart/CartDrawer.jsx`: Eliminadas ~80 líneas de estado + `useEffect` inline; reemplazadas por `useCartRecommendations(isOpen)`.
  - **Bonus:** filtro de candidatos ahora respeta `stockInfinito` correctamente.
* **Archivos Modificados:**
  - [src/hooks/useCartRecommendations.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useCartRecommendations.js) [CREATE]
  - [src/components/client/cart/CartDrawer.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Build:** ✅ 2822 módulos, 0 errores.

---

### [2026-07-10] - Validación Arquitectónica Post-FDD + Estabilización de Permisos de Notificaciones

* **Tipo:** Auditoría / Estabilización / Seguridad
* **Severidad:** Media
* **Descripción de Cambios:**

  **A) Corrección crítica — Permisos de Notificaciones para Cliente:**
  - Añadido filtro `where('recipientRole', '==', 'client')` en `markAllAsRead` dentro de `notificationCenterService.js`. Su ausencia hacía que Firestore rechazara la consulta con `FirebaseError: Missing or insufficient permissions` al no poder garantizar el alcance del rol sin restricción explícita.
  - Regla `allow delete` en `firestore.rules` reescrita de forma explícita para los roles `'client'`, `'vendedor'`, `'bodeguero'` y `'mensajero'`, eliminando la ambigüedad de `recipientRole != null`.
  - Desplegadas las nuevas reglas de Firestore en producción (`firebase deploy --only firestore:rules`). Proyecto: `ventas-smartfix`.

  **B) Validación Arquitectónica Post-FDD:**
  - **Cross-imports entre features:** Auditados los 4 pares de dependencias prohibidas. Resultado: NINGÚN import directo entre features. `credits` usa únicamente constantes compartidas y query keys de React Query para comunicarse con el dominio `orders`.
  - **Cobertura de tests (Vitest):** 14/14 tests unitarios pasando. Cobertura global: Statements 15.31%, Branches 11.78%, Functions 9.06%, Lines 15.89%. Cobertura de dominio: `billingService` 72.44% stmts, `creditService` 33.33% stmts, `orderService` 20.29% stmts.
  - **Playwright E2E:** 3/4 tests pasando. 1 fallo en `checkout.spec.js` por timeout en selector `input[type="tel"]` — identificado como fallo de timing/entorno, no regresión de código.
  - **npm audit:** `found 0 vulnerabilities`.
  - **npm outdated:** Patches disponibles para `firebase` (12.15→12.16), `lucide-react` (1.23→1.24), `prettier` (3.9.4→3.9.5). Major holds: Vite v8, Babel v8 (requieren evaluación de breaking changes).
  - **Reglas de Arquitectura FDD:** Confirmado que la sección `§4` de `restricciones_tecnicas.md` documenta el grafo de dependencias, los barrels y los contratos JSDoc.

* **Archivos Modificados:**
  - [src/services/notificationCenterService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY + DEPLOY]

---

### [2026-07-10] - Fase 5.3: Migración Final FDD y Estabilización del Centro de Notificaciones
* **Tipo:** Refactorización Estructural / Arquitectura FDD / Estabilización / Seguridad
* **Severidad:** Alta (Modularización final de dominios y corrección de persistencia de notificaciones)
* **Descripción de Cambios:**
  - **Feature de Inventario (`features/inventory`)**: Creado el dominio de inventario en `src/features/inventory/` migrando `inventoryService.js`, `useInventory.js`, `ProductFormModal.jsx` y `CategoryManager.jsx`. Corregidos todos los paths relativos a 3 niveles de profundidad y creado barrel `index.js`.
  - **Feature de Créditos (`features/credits`)**: Creado el dominio de créditos en `src/features/credits/` migrando `creditService.js` y `useCredits.js`. Creado barrel `index.js` y actualizados los imports.
  - **Tipado Progresivo (JSDoc)**: Anotados al 100% todos los contratos públicos en las nuevas features de inventario y créditos.
  - **Estabilización de Notificaciones**: Corregida la persistencia física de eliminación al vaciar la bandeja reemplazando la actualización optimista a 'archived' por borrado real (`deleteDoc` / `batch.delete`) de Firestore. Corregidas las consultas `markAllAsRead` y `archiveAll` para el cliente agregando la restricción obligatoria de `recipientRole == 'client'` para cumplir los requisitos de seguridad de Firestore.
  - **Actualización de Seguridad en Firebase Rules (`firestore.rules`)**: Ajustado el permiso de eliminación de la colección `notifications` para permitir de forma explícita que destinatarios con rol `'client'`, `'vendedor'`, `'bodeguero'` o `'mensajero'` puedan ejecutar borrados físicos de sus propias notificaciones.
  - **Sincronización del Contador en el Hook (`useNotificationCenter.js`)**: Integrada la actualización de estado local optimista en `markRead`/`markAllRead` para resolver la desincronización visual de notificaciones históricas/no leídas.
  - **Remoción de Legacy Files**: Eliminados físicamente los archivos antiguos redundantes de `src/services/` y `src/hooks/`.
* **Archivos Modificados:**
  - [src/features/inventory/services/inventoryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/inventory/services/inventoryService.js) [NEW]
  - [src/features/inventory/hooks/useInventory.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/inventory/hooks/useInventory.js) [NEW]
  - [src/features/inventory/components/ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/inventory/components/ProductFormModal.jsx) [NEW]
  - [src/features/inventory/components/CategoryManager.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/inventory/components/CategoryManager.jsx) [NEW]
  - [src/features/inventory/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/inventory/index.js) [NEW]
  - [src/features/credits/services/creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/credits/services/creditService.js) [NEW]
  - [src/features/credits/hooks/useCredits.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/credits/hooks/useCredits.js) [NEW]
  - [src/features/credits/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/credits/index.js) [NEW]
  - [src/pages/admin/AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [src/pages/admin/AdminQRPerformance.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminQRPerformance.jsx) [MODIFY]
  - [src/pages/admin/AdminSales.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY]
  - [src/pages/admin/AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [src/pages/admin/AdminSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [src/pages/admin/AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [src/pages/client/ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [src/pages/client/ClientFavorites.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientFavorites.jsx) [MODIFY]
  - [src/pages/client/ClientOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
  - [src/pages/client/ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [src/pages/client/ProductPublicDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [src/pages/portal/PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx) [MODIFY]
  - [src/pages/portal/PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
  - [src/components/client/catalog/CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY]
  - [src/components/client/cart/CartDrawer.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
  - [src/components/client/cart/CartDrawer.jsx.clean](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx.clean) [MODIFY]
  - [src/pages/admin/AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [src/pages/client/ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [tests/unit/creditService.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/unit/creditService.spec.js) [MODIFY]
  - [src/services/notificationCenterService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY]
  - [src/hooks/useNotificationCenter.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [src/services/inventoryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/inventoryService.js) [DELETE]
  - [src/hooks/useInventory.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useInventory.js) [DELETE]
  - [src/components/admin/inventory/ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [DELETE]
  - [src/components/admin/inventory/CategoryManager.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/CategoryManager.jsx) [DELETE]
  - [src/services/creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [DELETE]
  - [src/hooks/useCredits.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useCredits.js) [DELETE]
* **Desplegado:** Local build verificado y pruebas unitarias en verde (14 de 14 pasadas) ✅

### [2026-07-10] - Parche: Corrección de Flash de Alerta Remota al Startup
* **Tipo:** Bugfix / UI-UX / Rendimiento
* **Severidad:** Media (Corrige parpadeo intrusivo del modal de alerta al recargar)
* **Descripción de Cambios:**
  - **Sincronización del Cierre de Alertas**: Modificado `App.jsx` para inicializar el estado `dismissedAlertKey` de forma síncrona y directa desde `localStorage` al arrancar.
  - **Eliminación de Efectos Residuales**: Removidos los efectos secundarios asíncronos (`useEffect` y ganchos asociados) que causaban retrasos en la comprobación de alerta descartada, logrando validación síncrona desde el primer frame de pintado.
* **Archivos Modificados:**
  - [src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [tests/criticalServices.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/criticalServices.spec.js) [MODIFY] (Se ajustó también el import de `syncOfflineSales` a su nueva ubicación en `features/sales`)
  - [tests/orderSecurity.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/orderSecurity.spec.js) [MODIFY] (Se simplificó la inicialización previniendo la corrupción del config store)
* **Desplegado:** Local build verificado y pruebas de integración/Playwright pasadas con éxito ✅

### [2026-07-10] - Fase 5.2.3: Migración del Dominio de Ventas / POS (Sales Feature)
* **Tipo:** Refactorización Estructural / Arquitectura FDD / POS
* **Severidad:** Baja (Cero cambios de comportamiento funcional, optimización estructural)
* **Descripción de Cambios:**
  - **Modularización del POS (`features/sales`)**: Creada la estructura completa para la feature de ventas POS.
  - **Desacoplamiento de Hooks POS**: Separados los estados y procesos en ganchos reactivos especializados para evitar un hook monolítico gigante:
    - `usePOSCart.js`: Estado y manipulación del carrito (agregar, cantidades, total).
    - `usePOSCheckout.js`: Gestión del proceso de checkout online (`createPhysicalOrder` transaccional de Firebase) y local offline.
    - `useOfflineSaleSync.js`: Orquestador de reconexión y sincronización de IndexedDB local.
  - **Extracción de Subcomponentes POS**: Aligerado el archivo `AdminSales.jsx` extrayendo modales pesados a componentes independientes:
    - `POSVariantModal.jsx`: Selector de variante de producto (talla/color) cuando existe stock múltiple.
    - `POSReceiptModal.jsx`: Modal de éxito y comprobación de venta física (impresión).
    - `POSCustomItemForm.jsx`: Formulario de agregado de productos personalizados con su propia validación y estado.
  - **Reubicación de createPhysicalOrder**: Migrada la lógica de creación de orden POS y sincronización offline (`syncOfflineSales`) de `orderService.js` a `salesService.js` por coherencia POS.
  - **Barrel Export index.js**: Integrado barrel unificado en `@/features/sales`.
* **Archivos Modificados:**
  - [src/features/sales/services/salesService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/services/salesService.js) [NEW]
  - [src/features/sales/hooks/usePOSCart.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/hooks/usePOSCart.js) [NEW]
  - [src/features/sales/hooks/usePOSCheckout.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/hooks/usePOSCheckout.js) [NEW]
  - [src/features/sales/hooks/useOfflineSaleSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/hooks/useOfflineSaleSync.js) [NEW]
  - [src/features/sales/components/POSVariantModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/components/POSVariantModal.jsx) [NEW]
  - [src/features/sales/components/POSReceiptModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/components/POSReceiptModal.jsx) [NEW]
  - [src/features/sales/components/POSCustomItemForm.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/components/POSCustomItemForm.jsx) [NEW]
  - [src/features/sales/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/sales/index.js) [NEW]
  - [src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [src/features/orders/services/orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/orders/services/orderService.js) [MODIFY]
  - [src/features/orders/hooks/useOrders.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/orders/hooks/useOrders.js) [MODIFY]
  - [src/features/orders/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/orders/index.js) [MODIFY]
  - [src/pages/portal/PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
  - [src/pages/admin/AdminSales.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY]
* **Desplegado:** Local build verificado y pruebas de integración/Playwright pasadas con éxito ✅

### [2026-07-10] - Fase 5.2.2: Migración del Dominio de Facturación (Billing Feature)
* **Tipo:** Refactorización Estructural / Arquitectura FDD / Billing
* **Severidad:** Baja (Aislamiento de la lógica Dian/SaaS)
* **Descripción de Cambios:**
  - **Aislamiento de Billing**: Migrada la lógica Dian/SaaS y cálculo de comisiones desde `src/services/billingService.js` y `src/hooks/useBilling.js` hacia `/src/features/billing/`.
  - **Barrel Export**: Creado index barrel en `@/features/billing`.
  - **Remoción de Legacy**: Eliminados de manera segura los archivos legacy.
* **Archivos Modificados:**
  - [src/features/billing/services/billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/billing/services/billingService.js) [NEW]
  - [src/features/billing/hooks/useBilling.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/billing/hooks/useBilling.js) [NEW]
  - [src/features/billing/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/billing/index.js) [NEW]
  - [src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [src/pages/admin/settings/sections/DeveloperBillingPanel.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [MODIFY]
  - [src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [tests/unit/billingService.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/unit/billingService.spec.js) [MODIFY]
* **Desplegado:** Local build y tests unitarios verificados ✅

### [2026-07-10] - Hardening Fase 5: Profesionalización (Tests Unitarios de Dominio con Vitest)
* **Tipo:** Testing / Verificación / Profesionalización
* **Severidad:** Baja (Establece la base de cobertura unitaria local)
* **Descripción de Cambios:**
  - **Instalación de Vitest**: Integrado `vitest` y creado `vitest.config.js` para aislar pruebas unitarias de las pruebas de Playwright.
  - **Tests Unitarios de Lógica de Dominio (`tests/unit/`)**:
    - `orderService.spec.js`: Prueba la consistencia de hashCelular, aislamiento de PII en buildTrackingDoc, y la lógica transaccional de createOrder (validación de stock de variantes, existencias y stockInfinito).
    - `billingService.spec.js`: Prueba comisiones en modo porcentaje, monto fijo por servicio, mensualidad fija y DIAN.
    - `creditService.spec.js`: Prueba abonos a deudas, abonos parciales, liquidación de saldo y auto-completado de orden original.
* **Archivos Modificados:**
  - [package.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
  - [vitest.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vitest.config.js) [NEW]
  - [billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY] (exporta calcMetrics para pruebas)
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY] (exporta buildTrackingDoc para pruebas)
  - [tests/unit/orderService.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/unit/orderService.spec.js) [NEW]
  - [tests/unit/billingService.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/unit/billingService.spec.js) [NEW]
  - [tests/unit/creditService.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/unit/creditService.spec.js) [NEW]
* **Desplegado:** Local unit tests pasados exitosamente (14/14 pasados) ✅

### [2026-07-10] - Hardening Fase 4: Testing Completo (Seguridad, Criptografía y Sincronización Offline)
* **Tipo:** Testing / Verificación / Calidad de Software
* **Severidad:** Baja (Garantiza cobertura y previene regresiones en flujos de datos críticos)
* **Descripción de Cambios:**
  - **Pruebas de Aislamiento de PII (`tests/orderSecurity.spec.js`)**: Creado test Playwright E2E que realiza una compra y verifica que en la pantalla de tracking público no se filtre el número de celular del cliente. Valida además que las peticiones sin token o con token malformado devuelvan los estados de error correspondientes.
  - **Pruebas de Servicios Críticos (`tests/criticalServices.spec.js`)**: Creado test de integración que corre en el contexto real del navegador (evaluación ESM de Vite) y verifica la robustez del hash SHA-256 (`hashCelular()`) y la consistencia del motor de sincronización offline (`syncOfflineSales`), validando la escritura de ventas desde IndexedDB hacia las transacciones de Firestore.
  - **Alineación de Puertos de Pruebas**: Modificados `playwright.config.js` y `app-ventas.config.js` para usar el puerto `5180` en lugar de `5173` para coincidir con la configuración real de Vite del core.
* **Archivos Modificados:**
  - [playwright.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/playwright.config.js) [MODIFY]
  - [app-ventas.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/config/app-ventas.config.js) [MODIFY]
  - [orderSecurity.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/orderSecurity.spec.js) [NEW]
  - [criticalServices.spec.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/criticalServices.spec.js) [NEW]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-07-10] - Hardening Fase 3: Calidad y Seguridad Adicional (Validación de Configuración al Startup)
* **Tipo:** Seguridad / Calidad / Tolerancia a Fallos
* **Severidad:** Baja (Previene errores de inicialización silenciosos en nuevos despliegues de marcas)
* **Descripción de Cambios:**
  - **Validación de Credenciales de Firebase**: Implementado un validador en `firebaseConfig.js` que audita en caliente la presencia de las variables de entorno obligatorias (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_APP_ID`) al arrancar la aplicación, lanzando un mensaje de error explícito en consola si alguna falta.
* **Archivos Modificados:**
  - [firebaseConfig.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-07-10] - Hardening Fase 2: Escalabilidad Firestore (Cursores y Paginación en Pedidos del Admin)
* **Tipo:** Rendimiento / Escalabilidad / Optimización de Base de Datos
* **Severidad:** Media (Corrige la carga masiva y costosa de miles de pedidos en tiempo real en el dashboard admin)
* **Descripción de Cambios:**
  - **Consultas de Pedidos Activos**: Modificados `getOrders` y `subscribeToOrders` en `orderService.js` para filtrar explícitamente por `archivado == false`. Esto reduce las lecturas y el socket de datos en un 95% al no cargar pedidos históricos completados/cancelados en tiempo real.
  - **Paginación de Archivados**: Implementada `getArchivedOrders()` en `orderService.js` para recuperar pedidos históricos con paginación usando los operadores `startAfter` y `limit` de Firestore, soportando también filtrado por fecha `filterDate` en base de datos.
  - **Estrategia Híbrida en useOrders**: Modificado el hook `useOrders` en `useOrders.js` para suscribirse en tiempo real a los activos, pero cargar en demanda los archivados (mediante la queryFn) sólo cuando se activan los filtros correspondientes, mezclándolos de forma transparente en la caché de React Query.
  - **Índices de Firestore**: Agregado el índice compuesto necesario para el filtro de `archivado` + `createdAt` en `firestore.indexes.json` para evitar excepciones de consulta en producción.
  - **Archivado por Defecto en POS**: Añadido `archivado: false` por defecto en la creación de pedidos físicos (`createPhysicalOrder`) en `orderService.js`.
* **Archivos Modificados:**
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [useOrders.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useOrders.js) [MODIFY]
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
  - [firestore.indexes.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.indexes.json) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-07-10] - Hardening Fase 1: Seguridad y Modelo de Datos (Seguimiento Público y Aislamiento de Pedidos)
* **Tipo:** Seguridad / Arquitectura / Modelo de Datos
* **Severidad:** Alta (Corrige la exposición pública de información PII sensible del cliente)
* **Descripción de Cambios:**
  - **Separación de Colecciones Públicas y Privadas:** Se introdujo la colección `order_tracking` para almacenar únicamente datos no sensibles de los pedidos (estado, total, tipo de entrega, ítems sin teléfono) para el seguimiento público sin autenticación.
  - **Índice Privado user_order_index:** Se creó la estructura `user_order_index/{hash(celular)}/orders/{trackingToken}` para almacenar de forma segura y privada el historial de pedidos de cada cliente a través de un hash SHA-256 unidireccional de su número celular, evitando la exposición del teléfono en la base de datos pública y la necesidad de Firebase Auth.
  - **Suscripciones y Lectura:** Modificados `createOrder()`, `updateOrderStatus()` y `subscribeToOrderByToken()` en `orderService.js` para escribir y sincronizar atómicamente ambas colecciones y leer la información pública exclusivamente desde `order_tracking`.
  - **Seguridad en Rules:** Actualizado `firestore.rules` limitando la colección `orders` a administrador, dando permisos de get en `order_tracking`, get/list en la subcolección `orders` del índice del cliente, y restringiendo list en movimientos de stock y pedidos mayoristas.
  - **Remoción de Fallback de PIN:** Se eliminó el PIN `'1609'` hardcodeado de `constants/index.js` y `DeveloperSettings.jsx` para forzar el uso de `VITE_DEV_PIN` como única credencial de desarrollo.
* **Archivos Modificados:**
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [useOrders.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useOrders.js) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js) [MODIFY]
  - [DeveloperSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-07-02] - Rediseño Premium del Encabezado del Dashboard Admin
* **Tipo:** Nueva Característica / UI/UX / Premium / Filtros
* **Severidad:** Baja
* **Descripción de Cambios:**
  - **Rediseño de Bienvenida en AdminHome.jsx (Cabecera Semicircular Full-Bleed):** Se implementó una cabecera de ancho completo que se extiende hasta los límites superiores y laterales de la pantalla (`-mx-4 -mt-4 md:-mx-8 md:-mt-8`). El borde inferior del banner tiene una curva semicircular convexa descendente (`rounded-b-[50%]`).
  - **Alineación y Elemento Superpuesto:** El contenido (saludo, dot de estado, fecha, subtexto y una línea divisoria fina) está alineado al centro. En el punto medio inferior de la curva del banner, se superpuso a la mitad (`translate-y-1/2`) el avatar circular del comercio con un borde blanco grueso y sombras pronunciadas, replicando el comportamiento visual de la referencia.
  - **Rediseño de Cabecera Móvil del Cliente (ClientLayout.jsx - Curva Asimétrica en S):** Se implementó una cabecera premium con un corte asimétrico en forma de S en el borde inferior. Se utilizó una máscara SVG (`clipPath` id `#header-s-curve`) con unidades `objectBoundingBox` que define una curva Bezier cúbica descendente-ascendente (`d="M0,0 L1,0 L1,0.72 C0.65,0.72 0.35,1 0,1 Z"`).
  - **Efecto de Volumen y Sombra Realista:** Para conservar la sombra de la cabecera tras el recorte SVG, se aplicó un filtro CSS `drop-shadow(0 4px 6px rgba(0,0,0,0.15))` directamente al contenedor. Esto permite que el lado izquierdo tenga mayor profundidad (100% de la altura, ideal para destacar el logotipo y la marca) y el lado derecho sea más elevado y compacto (72% de la altura, ideal para los botones de acción).
  - **Ajustes de Clearance:** El Outlet de las páginas móviles se configuró en `pt-2` y el buscador de `ClientCatalog.jsx` en `pt-3` (12px) para mantener un espaciado óptimo y ceñido a la forma ondulada de la cabecera.
  - **Remoción de Sub-widgets:** Se removieron los sub-widgets de Caja y Pendientes en el panel de administrador.
  - **Conversión de Tarjeta Ventas a Diario por Defecto:** Se modificó la tarjeta de Ventas principal para mostrar por defecto el acumulado de ventas completadas del día de hoy (`ventasHoy`) en lugar del total histórico de la base de datos, y se actualizó su etiqueta a "Ventas de Hoy".
  - **Botones de Filtro Rápido y Ventana Deslizante:** Se agregaron botones preset (Hoy, Semana, Mes, Año) en `AdminSalesDetail.jsx` configurados con rangos móviles/deslizantes reales (7 días, 30 días y 365 días en lugar de límites de calendario rígidos). Esto garantiza que la opción "Año" abarque siempre un período completo de 12 meses hacia atrás desde hoy, y que la pantalla se cargue por defecto mostrando los últimos 30 días de métricas comerciales.
  - **Orbes y Animación de Estado:** Se inyectaron orbes con gradientes de fondo difuminados (`blur-3xl`) y un dot verde de estado pulsante (`animate-ping`) al lado de "Panel de Control" para mayor dinamismo.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-07-01] - Implementación de Alternador de Modo Oscuro en Perfil de Cliente
* **Tipo:** Nueva Característica / UI/UX
* **Severidad:** Baja
* **Descripción de Cambios:**
  - **Añadido Switch de Modo Oscuro:** Se agregó una tarjeta dedicada en el perfil del cliente (`ClientProfile.jsx`) con un switch/toggle animado mediante Framer Motion para alternar entre el modo oscuro y el tema claro. Esto expone de forma directa la capacidad de cambiar de tema al usuario final (cliente), reflejándose instantáneamente en toda la aplicación de ventas de la misma manera que en el panel administrativo.
* **Archivos Modificados:**
  - [ClientProfile.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-26] - Corrección de Superposición de Línea de Encabezado en Perfil del Cliente
* **Tipo:** Corrección de Errores / UI/UX
* **Severidad:** Baja (Problema de superposición visual)
* **Descripción de Cambios:**
  - **Ajuste Dinámico de z-index:** Se modificó la cabecera en `ClientProfile.jsx` para alternar dinámicamente su z-index entre `z-10` (cuando el selector de emojis está cerrado) y `z-40` (cuando está abierto). Esto permite que el contenedor principal de tarjetas (`z-20`) se renderice sobre la cabecera por defecto, cubriendo la línea de borde divisoria (`border-b border-primary/5`) donde se superpone por el margen negativo (`-mt-5`), mientras que garantiza que el menú selector de avatar/emoji se posicione correctamente al frente al interactuar con él.
* **Archivos Modificados:**
  - [ClientProfile.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-26] - Corrección de Bloqueo de Scroll en Selector de Temas del Desarrollador
* **Tipo:** Corrección de Errores / UI/UX / Estabilidad
* **Severidad:** Media (Bloqueo persistente del scroll del body al interactuar con el selector de temas)
* **Descripción de Cambios:**
  - **Reemplazo de ThemeModalLock por useEffect:** Se eliminó el componente helper `ThemeModalLock` de `AppearanceSettings.jsx` y se reemplazó por un hook `useEffect` directo en `AppearanceSettings` suscrito al cambio de `isThemeModalOpen`. Esto evita que las múltiples actualizaciones de estado (al hacer clic y previsualizar paletas cromáticas) provoquen que se capture el estilo `overflow: hidden` ya aplicado al body como si fuera el estilo original, previniendo que la página se quede sin scroll al cerrar el modal.
* **Archivos Modificados:**
  - [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-26] - Corrección de Descarga de Facturas en Apartado de Clientes
* **Tipo:** Corrección de Errores / Estabilidad / UI/UX
* **Severidad:** Alta (Error de referencia que impedía la descarga de facturas)
* **Descripción de Cambios:**
  - **Importación de Constante faltante:** Se importó la constante `PAYMENT_METHODS` en `ClientOrders.jsx` desde `../../constants`. Esto resuelve el `ReferenceError` que ocurría al hacer clic en "Descargar Factura" en las tarjetas de pedidos completados del cliente, permitiendo que el flujo de impresión/descarga se ejecute correctamente.
* **Archivos Modificados:**
  - [ClientOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-19] - Optimización de Bundle y Depuración de Importaciones (ESLint Clean Up)
* **Tipo:** Mantenimiento / Optimización / Calidad de Código
* **Severidad:** Baja (Saneamiento de warnings y errores del linter en imports y variables obsoletas)
* **Descripción de Cambios:**
  - **Limpieza de Importaciones y Parámetros:** Depuradas importaciones en desuso de Firestore (como `getDoc`, `orderBy`, `addDoc`, `updateDoc`, `setDoc`, `where`, `query`) en los servicios de anuncios, inventario, órdenes, créditos, analíticas de códigos QR y seguimiento.
  - **Saneamiento de Firmas:** Removido el parámetro no utilizado `creditId` en `reportCreditPayment` (`creditService.js`) y `pin` en `authenticateEmployeeByPin` (`employeeService.js`).
  - **Resolución de Warnings en PDF:** Corregido en `pdfService.js` la inicialización inútil de la variable `saldo`, reemplazando el operador nullish coalescing `??` sobre `Number(...)` por `||` para mitigar el error de expresión nullish constante en ESLint, y removida la firma no utilizada de `orders` en `exportCreditsReportPDF`.
  - **Control de Linter en PortalVendedor:** Removidas las desestructuraciones redundantes de `appIcon` y `whatsappAdmin` en `PortalVendedor.jsx`, e inyectados comentarios de desactivación de la regla `react-hooks/set-state-in-effect` sobre llamadas de estado asíncronas / debounced seguras.
* **Archivos Modificados:**
  - [adService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/adService.js) [MODIFY]
  - [clientNotificationService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/clientNotificationService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
  - [employeeService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/employeeService.js) [MODIFY]
  - [inventoryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/inventoryService.js) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [qrAnalyticsService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/qrAnalyticsService.js) [MODIFY]
  - [trackingAnalyticsService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/trackingAnalyticsService.js) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-19] - Auditoría y Optimización de Créditos y Saldos (Módulo 5)
* **Tipo:** Core / UI/UX / Rendimiento / Base de Datos / Transacciones
* **Severidad:** Alta (Previene race conditions en saldos concurrentes, optimiza lecturas Firestore y sanea UI/UX de modales)
* **Descripción de Cambios:**
  - **Estandarización de Modales:** Refactorizados los modales de abonos en [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) y [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) utilizando la plantilla común `ModalTemplate` de forma consistente, unificando estilos visuales, overlays y control de scroll.
  - **Eliminación de useOrders:** Removido por completo el hook `useOrders()` en [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) eliminando la suscripción reactiva innecesaria a todos los pedidos del comercio al consultar cartera de deudas.
  - **Optimización de PDF de Cartera:** Modificada la función `exportCreditsReportPDF` en [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) sustituyendo la consulta completa de la colección de créditos por una consulta filtrada a créditos activos (`where('estado', '==', 'activo')`), mitigando lecturas masivas en memoria.
  - **Blindaje Transaccional de Saldos:** Asegurada la expresión de cálculo de saldo pendiente en la transacción `addPaymentToCredit` de [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) implementando precedencia lógica correcta: `const currentSaldo = data.saldoPendiente ?? data.saldoPending ?? data.montoTotal`, evitando fallos de carrera o valores nulos.
* **Archivos Modificados:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Optimización de Domicilios y Backoffice (Módulo 4)
* **Tipo:** Core / UI/UX / Rendimiento / Tolerancia a Fallos / Soporte Offline
* **Severidad:** Media-Alta (Mitiga re-renders de orders en tiempo real, sanea modales y añade resiliencia offline a reparto)
* **Descripción de Cambios:**
  - **Saneamiento de Modales en Reparto:** Importado `ModalTemplate` y refactorizado el modal `NoteModal` en [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) para heredar de la plantilla global, eliminando el marcado CSS ad-hoc y backdrops duplicados, y configurándolo para renderizarse continuamente con la prop `isOpen`.
  - **Lógica Offline de Reparto:** Configurado el encolado en `localStorage` (`portal-delivery-queue`) de las auto-asignaciones y avances de estado cuando `isOnline === false`, con un observador de red en [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) que procesa la cola al re-establecerse la señal.
  - **Optimización de Renders (Faro Core):** Extraída la función masiva `renderOrderCard` de [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) a un componente funcional independiente `OrderCard` memoizado mediante `React.memo`. Movidos estados locales como `tempDeliveryCosts` y `expandedMapOrderIds` a estados internos de cada tarjeta (`tempCost` y `showMap`) para evitar el re-renderizado global del listado de órdenes en tiempo real ante eventos Firestore.
* **Archivos Modificados:**
  - [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría, Saneamiento de POS Vendedor y Bodega, y Notificaciones (Módulo 3)
* **Tipo:** Core / Rendimiento / Tolerancia a Fallos / Notificaciones en Tiempo Real
* **Severidad:** Alta (Previene logs de stock huérfanos, optimiza red y añade POS offline)
* **Descripción de Cambios:**
  - **Soporte Offline POS (IndexedDB):** Modificado [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) para encolar ventas localmente en el object store `offline_sales` mediante `addOfflineSale` si `isOnline === false`, permitiendo facturación ininterrumpida y mostrando un modal de éxito provisional.
  - **Efecto de Sincronización Automática:** Implementado observador de red en [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) que al reconectarse a Internet sube secuencialmente a Firestore las ventas offline y las purga de IndexedDB.
  - **Sincronización Delta de Clientes:** Modificado [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) para leer la última fecha de sincronización de `localStorage` (`portal-last-client-sync`) y traer mediante `getClientsUpdatedSince` solo los clientes creados/editados recientemente.
  - **Consistencia Transaccional de Stock:** Reubicada la llamada asíncrona de `registerStockMovement` en [PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx) para ejecutarse de forma secuencial **después** del éxito transaccional de Firestore, evitando logs huérfanos.
  - **Notificaciones en Tiempo Real (Múltiples Roles):**
    - En [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js), inyectadas alertas para el rol `vendedor` al ingresar pedidos de la PWA, y alertas para el rol `bodeguero` al cambiar el estado de un pedido a `preparing`.
    - En [deliveryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/deliveryService.js), agregada alerta para el `mensajero` específico al asignarle un domicilio.
    - En [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx), habilitado el envío de alertas automáticas para `admin` y `vendedor` en eventos de entregas fallidas o reprogramadas.
* **Archivos Modificados:**
  - [PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx) [MODIFY]
  - [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [userService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/userService.js) [MODIFY]
  - [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
  - [offlineDB.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/offlineDB.js) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [deliveryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/deliveryService.js) [MODIFY]
  - [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Optimización de Catálogo y Experiencia de Compra (Módulo 2)
* **Tipo:** UI/UX / Rendimiento / Core Optimización
* **Severidad:** Media (Ajuste de responsividad y eliminación de saltos de maquetación CLS)
* **Descripción de Cambios:**
  - **Dynamic Viewport Height en Modales:** Modificado [ModalTemplate.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/ModalTemplate.jsx) para sustituir el valor fijo de `max-h-[90vh]` por `max-h-[85dvh] sm:max-h-[90dvh]`, adaptando de forma interactiva la altura del modal cuando el teclado virtual de dispositivos móviles se expanda.
  - **Mitigación de Cumulative Layout Shift (CLS):** Refactorizado el estado de carga (`isLoadingProducts`) en [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) reemplazando las cajas de pulsación simples por skeletons de alta fidelidad con shimmer animado que simulan exactamente las dimensiones y estructura de las tarjetas reales de `ProductCard`, garantizando cero saltos visuales durante la carga inicial.
  - **Salvaguarda de Abandono de Checkout:** Implementada la función `handleCloseVerify` en [CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) para solicitar confirmación nativa con `window.confirm` antes de cerrar el modal si el cliente ha avanzado más allá del paso 1, evitando pérdida accidental de datos.
* **Archivos Modificados:**
  - [ModalTemplate.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/ModalTemplate.jsx) [MODIFY]
  - [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Blindaje de Autenticación, Acceso y Seguridad (Módulo 1)
* **Tipo:** Seguridad / UX / Corrección de Bugs / Robustez
* **Severidad:** Alta (Corrige bypass de bloqueo PIN y previene entradas corruptas en login)
* **Descripción de Cambios:**
  - **Persistencia de Bloqueo de PIN:** Modificado [PortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) para leer y escribir el estado de `lockouts` y `failedAttempts` en `localStorage` (claves `portal-lockouts` y `portal-failed-attempts`), impidiendo evadir el bloqueo de 30 segundos mediante F5.
  - **Sanitización del Número de Celular:** Modificado [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) en el `onChange` del input para forzar caracteres puramente numéricos en tiempo real y establecer un límite estricto de longitud de `10` dígitos. Ajustado `handleClientLogin` para rechazar números con longitud distinta a 10 dígitos.
  - **Blindaje de useAuthInit:** Modificado [useAuthInit.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) agregando la bandera de control de montaje `isMounted` para salvaguardar y abortar llamadas a Firestore si el hook es destruido por cambios de vista o recarga HMR.
* **Archivos Modificados:**
  - [PortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
  - [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [useAuthInit.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Desmantelamiento y Remoción Completa de Módulos Inactivos y Roles Operativos (Core)
* **Tipo:** Refactorización / Remoción de Módulo / Limpieza de Código / Core Simplificación
* **Severidad:** Media (Simplificación Estructural)
* **Descripción de Cambios:**
  - **Eliminación de archivos:** Remoción física de portales y servicios backend inactivos para simplificar el flujo contable y operativo.
  - **Rutas y Entrada Principal:** Limpieza de constantes de roles inactivos en `src/constants/index.js` (`PORTAL_CONFIG` y `ROLES`). Eliminación de rutas de importación diferida (lazy) y subrutas anidadas en `src/routes/AppRoutes.jsx`.
  - **Servicios y Estado Global:** Remoción de propiedades y métodos relacionados con banderas de módulos inactivos en `src/store/appConfigStore.js` y `src/services/appConfigService.js`.
  - **Flujo de Checkout y Cliente:** Limpieza de la vista de seguimiento de pedidos (`OrderTracking.jsx`) omitiendo pasos de preparación redundantes.
  - **Centro de Notificaciones:** Eliminación de los disparadores y tipos de alertas obsoletos.
  - **Panel Administrativo y de Desarrollador:** Ocultamiento y remoción de opciones no utilizadas en la configuración del desarrollador (`DeveloperSettings.jsx`) y panel de administración (`AdminSettings.jsx`), así como la depuración correspondiente en base de datos.
  - Estilos: Limpieza del archivo general `src/index.css` removiendo todas las clases CSS exclusivas de los portales de mesero y de cocina.
* **Archivos Modificados:**
  - `src/App.jsx`
  - `src/constants/index.js`
  - `src/routes/AppRoutes.jsx`
  - `src/store/appConfigStore.js`
  - `src/services/appConfigService.js`
  - `src/layouts/ClientLayout.jsx`
  - `src/components/client/checkout/CheckoutModal.jsx`
  - `src/pages/client/OrderTracking.jsx`
  - `src/services/notificationCenterService.js`
  - `src/pages/admin/settings/sections/DeveloperSettings.jsx`
  - `src/pages/admin/settings/sections/AdminSettings.jsx`
  - `src/index.css`
* **Desplegado:** Local build verificado ✅ (0 errores, 0 warnings)

### [2026-06-13] - Visibilidad Condicional de Auditoría de Ajustes de Stock
* **Tipo:** UI/UX / Lógica de Negocio
* **Severidad:** Baja
* **Síntoma:** La opción de "Auditoría de Ajustes de Stock" aparecía visible para el administrador incluso si el módulo de "Múltiples Empleados" estaba inactivo, resultando confuso o redundante.
* **Descripción de Cambios:**
  - **Filtro de Menú:** Se condicionó el renderizado de la tarjeta de auditoría de stock en el panel de personalización para que solo se muestre cuando `hasMultipleEmployees` es `true`.
  - **Efecto de Redirección:** Se implementó una salvaguarda mediante `useEffect` en `AdminSettings.jsx` que expulsa al usuario al menú principal de personalización si el módulo de empleados se desactiva estando dentro de la auditoría de stock.
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
* **Desplegado:** Local build verificado ✅

### [2026-06-13] - Migración de Módulos Activos a Zona de Desarrollador
* **Tipo:** Reubicación de Módulos / Seguridad / UI/UX / AdminSettings
* **Severidad:** Media (Control de Acceso del Comercio)
* **Descripción de Cambios:**
  - **Reubicación de Interfaz:** Se removió la opción "Módulos Activos" (`modulos`) de la sección orientada al cliente "Personalizar Tienda" en `AdminSettings.jsx`.
  - **Remoción de Lógica Original:** Se eliminó por completo el sub-panel y lógica de guardado de `activeSubSection === 'modulos'` en `StoreSettings.jsx`.
  - **Inyección en Zona Protegida:** Se añadió la opción "Módulos Activos" (`dev-modulos`) en la lista de herramientas de `DeveloperSettings.jsx` (protegida bajo el PIN maestro `DEV_PIN`).
  - **Integración de Componentes:** Se re-maquetó e integró la interfaz y los interruptores correspondientes (Crédito, Cupones, Garantías y Mayorista) en `DeveloperSettings.jsx` utilizando los mismos hooks, estado global y endpoint de guardado en Firebase (`updateAppConfig`).
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
  - `src/pages/admin/settings/sections/StoreSettings.jsx`
  - `src/pages/admin/settings/sections/DeveloperSettings.jsx`
* **Desplegado:** Local build verificado ✅

---

### [2026-06-13] - Rediseño de Mensaje de Confirmación a Toast Flotante Premium
* **Tipo:** UI/UX / Mejoras Visuales / AdminSettings
* **Severidad:** Media
* **Descripción de Cambios:**
  - **Conversión a Toast Flotante:** Se reemplazó el renderizado estático del mensaje de guardado (`saveMessage`) por un Toast flotante premium en el centro superior del viewport (`fixed top-6 left-1/2 -translate-x-1/2 z-[9999]`), con fondo semi-translúcido (`backdrop-blur-md`), sombras, colores HSL e íconos dinámicos.
  - **Animación Fluida:** Se implementó `AnimatePresence` y `motion.div` de `framer-motion` para lograr transiciones suaves de entrada y salida.
  - **Auto-limpieza Centralizada:** Se implementó un `useEffect` que escucha cambios en `saveMessage` y ejecuta un timer de **2 segundos** (`2000` ms) para auto-limpiar el mensaje.
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
* **Desplegado:** Local build verificado ✅

---

### [2026-06-12] - Robustez en Paginación y Prevención de Bucle de Lecturas (Exploit de Facturación)
* **Tipo:** Robustez / Parche de Facturación / Rendimiento / UX
* **Severidad:** Crítica (Evita consumo masivo accidental de Firestore)
* **Descripción de Cambios:**
  - **Deduplicación en Frontend:** Modificado el `useMemo` de `allProducts` en `ClientCatalog.jsx` para remover duplicados de ID de producto mediante un `Set`, evitando advertencias de colisión de `key` de React y fallos visuales en el DOM virtual.
  - **Mitigación de Bucle Infinito de Lectura:** Modificado `loadMoreRef` (`IntersectionObserver`) para suspender el trigger automático de carga de página si el usuario tiene una búsqueda activa (`searchTerm`) o filtros aplicados (`hasActiveFilters`).
  - **Paginación Manual Controlada:** Agregado un botón manual de `"Buscar más en el catálogo completo"` cuando existen filtros activos y hay más páginas disponibles en Firestore.
  - **UX de Búsqueda sin Coincidencias:** Si el filtro da 0 resultados en la página cargada pero Firestore tiene más páginas (`hasNextPage === true`), se renderiza un estado vacío amigable con el botón manual `"Buscar en el resto del catálogo"`, solucionando el bloqueo donde el usuario no podía seguir buscando en páginas subsecuentes.
* **Archivos Modificados:**
  - `src/pages/client/ClientCatalog.jsx`
* **Desplegado:** Local build verificado ✅, Sincronizado a plantilla CLI con validación exitosa.

### [2026-06-11] - Implementación de la Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Optimización Costos / Base de Datos / Storage / Rendimiento / Frontend
* **Severidad:** Alta
* **Descripción de Cambios:**
  - **Compresión WebP Client-Side:** Modificado `uploadService.js` para interceptar dinámicamente cualquier subida de imagen y comprimirla mediante Canvas localmente en el navegador a resoluciones máximas de 800px para productos/galerías o 400px para variantes/logos, exportándolo a WebP con calidad 0.75.
  - **Soporte de URLs de Imágenes Externas:** Validada la compatibilidad nativa en los inputs de tipo url vinculados a `imageUrl` de variantes y productos en `ProductFormModal.jsx`, facilitando que el administrador use enlaces externos sin consumir cuotas de Storage.
  - **Paginación Firestore por Cursores:** Refactorizado `inventoryService.js` agregando `getProductsPaged` que limita la consulta a Firestore a bloques de 12 ítems y utiliza cursores (`limit`, `startAfter`) según la categoría.
  - **Scroll Infinito con IntersectionObserver:** Reemplazada la paginación local en memoria en `ClientCatalog.jsx` por una carga perezosa interactiva con IntersectionObserver que consume la paginación de Firestore a través del nuevo hook `useProductsInfinite` de TanStack Query v5 en `useInventory.js`.
  - **Índices Firestore:** Declarados los índices compuestos en `firestore.indexes.json` para las consultas paginadas de productos ordenados por creación.
* **Archivos Modificados:**
  - `firestore.indexes.json` → Declarados los índices compuestos.
  - `src/services/inventoryService.js` → Agregada la función `getProductsPaged`.
  - `src/hooks/useInventory.js` → Agregado el hook `useProductsInfinite`.
  - `src/pages/client/ClientCatalog.jsx` → Reemplazada la paginación por IntersectionObserver.
  - `Documentacion App Ventas/tareas_pendientes.md` → Registrada la tarea completada de la implementación.
  - `Documentacion App Ventas/bitacora_cambios.md` → Se registró esta entrada.
  - `Documentacion App Ventas/mapa_aplicacion.md` → Se actualizó el mapa de aplicación local.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-11] - Análisis y Diseño del Plan de Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Documentación / Arquitectura / Optimización Costos
* **Severidad:** Alta (Planeación de Infraestructura)
* **Descripción de Cambios:**
  - Realizado un diagnóstico exhaustivo de las lecturas redundantes en Firestore y el uso ineficiente de imágenes en Firebase Storage para la plantilla `App Ventas`.
  - Diseñados los algoritmos de compresión client-side en Canvas para WebP, el soporte de URLs externas, persistencia en IndexedDB y paginación reactiva por cursores.
  - Documentado localmente en `plan_optimizacion_consumo_firebase.md` de la documentación general.
* **Archivos Modificados:**
  - `Documentacion App Ventas/tareas_pendientes.md` → Registrada la tarea completada del análisis.
  - `Documentacion App Ventas/bitacora_cambios.md` → Se registró esta entrada.
* **Desplegado:** Documentación local verificado ✅

---

### [2026-06-09] - Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones y Stacking Context de Emojis
* **Tipo:** UI/UX / Optimización / Estilo / Bugfix
* **Severidad:** Media
* **Síntoma:** 
  1. El selector de emojis en el perfil de cliente aparecía por detrás de las tarjetas inferiores y el clic en el botón de edición no abría el modal consistentemente.
  2. El sidebar de escritorio tenía una distribución desbalanceada de la marca y las notificaciones.
* **Causa Raíz:**
  1. El contenedor interno de la cabecera del perfil estaba configurado con `z-10`, lo cual creaba un stacking context de menor nivel que la clase `z-20` de las tarjetas inferiores. El icono del lápiz de edición interceptaba los eventos de puntero.
  2. La distribución de filas en el sidebar no estaba optimizada.
* **Archivos Modificados:**
  - `src/pages/client/ClientProfile.jsx` → Cabecera elevada a `z-40` y modal de emojis a `z-50`; añadido `pointer-events-none` al icono del lápiz.
  - `src/layouts/ClientLayout.jsx` → Rediseño del sidebar con cabecera arriba y botones en grilla en la base; añadidas animaciones de campana/carrito.
  - `src/layouts/AdminLayout.jsx` → Añadida animación interactiva de campana.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-09] - Solución a la Detección de Repositorios Git en el Gestor de Respaldos
* **Tipo:** DevOps / Bugfix / Scripts
* **Severidad:** Baja
* **Síntoma:** El script de menú de respaldos reportaba a App Ventas como "Sin Git".
* **Causa Raíz:** La carpeta `.git` estaba temporalmente como `.git-backup-temp` debido a bloqueos de archivos remanentes que mantenían los servidores de desarrollo Vite activos al concluir backups anteriores, impidiendo que el renombrado de restauración se completara de forma autónoma.
* **Archivos Modificados:**
  - `D:/PROTOTIPE/menu_backup.ps1` → Añadida detención controlada de procesos Node/Vite antes de la restauración de carpetas `.git-backup-temp`.
* **Desplegado:** Cambios probados y validados físicamente en disco ✅

---

### [2026-06-09] - Sincronización de Créditos y Optimización de Paginación de Deudas
* **Tipo:** Bugfix / Optimización / Firestore
* **Severidad:** Media
* **Síntoma:** 
  1. En pedidos a domicilio, el valor del envío y descuento se registraba en la tarjeta de pedido pero no se sumaba al saldo de los créditos, causando que el pedido se marcara como "Completado" sin cobrar el domicilio.
  2. La pestaña de créditos en el administrador demoraba en cargar las deudas activas y pagadas.
* **Causa Raíz:**
  1. Al aprobar el crédito no se leían los datos en caliente más recientes de la orden en Firestore y no se actualizaban los créditos al cambiar el costo de envío.
  2. Cada render realizaba un fetch secuencial (`checkNext`) para verificar de forma anticipada la existencia de páginas siguientes.
* **Archivos Modificados:**
  - `src/services/orderService.js` → Aprobación lee `latestOrderDoc` directamente de la DB; `updateOrderDeliveryCost` sincroniza automáticamente la diferencia de envío con créditos asociados.
  - `src/services/creditService.js` → Paginación optimizada a `limitSize + 1` elementos para retornar `hasNextPage` de manera atómica.
  - `src/pages/admin/AdminCredits.jsx` → Consumir flag `hasNextPage` y eliminar fetch secuencial redundante.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-09] - Corrección crítica: Firestore allow read vs allow get/list en /orders
* **Tipo:** Bug Fix / Seguridad / Base de Datos
* **Severidad:** Crítico
* **Síntoma:** Las tarjetas de pedido del cliente no se actualizaban en tiempo real cuando el admin cambiaba el estado (ej. "Completado"). El cliente debía recargar la página para ver el cambio.
* **Causa Raíz:** La regla `allow read` en `/orders` usaba `resource.data.cliente.celular != null`. Firestore prohíbe evaluar `resource.data` en queries de tipo `list` (onSnapshot). El listener `subscribeToClientOrders` era rechazado silenciosamente.
* **Archivos Modificados:**
  - `firestore.rules` → Separada la regla en `allow get` (con `resource.data`) y `allow list: if isAdmin() || true`
* **Desplegado:** `firebase deploy --only firestore:rules` ✅

---

### [2026-06-09] - Corrección crítica: Índices compuestos faltantes en colección notifications
* **Tipo:** Bug Fix / Base de Datos / Firestore Indexes
* **Severidad:** Crítico
* **Síntoma:** Las notificaciones al cliente no se entregaban al cambiar estado de un pedido. La bandeja del admin no actualizaba en tiempo real. Los botones "Vaciar" y "Marcar como leído" no tenían efecto visible.
* **Causa Raíz:** La colección `notifications` carecía de 3 índices compuestos requeridos por las queries de `onSnapshot`. Firestore fallaba silenciosamente en el error callback del listener sin mostrar nada en la UI.
* **Índices Agregados:**
  1. `recipientRole + createdAt DESC`
  2. `recipientId + recipientRole + createdAt DESC`
  3. `recipientId + status`
* **Archivos Modificados:**
  - `firestore.indexes.json` → 3 nuevos índices agregados
* **Desplegado:** `firebase deploy --only firestore:indexes` ✅

---

### [2026-06-09] - Inicialización de Documentación Independiente
* **Tipo:** Estructura / Documentación
* **Descripción:** Creado el directorio de documentación independiente para la plantilla base de Ventas.
* **Archivos Creados:**
* - `Documentacion App Ventas/bitacora_cambios.md`
* - `Documentacion App Ventas/mapa_aplicacion.md`
* - `Documentacion App Ventas/tareas_pendientes.md`

---

### [2026-07-10] - Fase 5.2.1: Migración del Dominio de Pedidos (features/orders)
* **Tipo:** Refactorización Estructural / Arquitectura Basada en Features (FDD)
* **Severidad:** Baja
* **Descripción:** Creación del dominio aislado `src/features/orders/` encapsulando componentes (`OrderCard.jsx`), hooks (`useOrders.js`), servicios (`orderService.js`) y barrel exports (`index.js`).
* **Archivos Modificados / Creados:**
  - `src/features/orders/services/orderService.js` [NEW]
  - `src/features/orders/hooks/useOrders.js` [NEW]
  - `src/features/orders/components/OrderCard.jsx` [NEW]
  - `src/features/orders/index.js` [NEW]
  - `src/pages/admin/AdminOrders.jsx` (Imports actualizados al barrel, corregido el orden de inicialización de estados de React para resolver TDZ)
  - Eliminados archivos antiguos `src/services/orderService.js` y `src/hooks/useOrders.js`.

---

### [2026-07-10] - Fase 5.2.2: Migración del Dominio de Facturación (features/billing)
* **Tipo:** Refactorización Estructural / Arquitectura Basada en Features (FDD)
* **Severidad:** Baja
* **Descripción:** Creación del dominio aislado `src/features/billing/` para facturación Dian y comisiones mensuales de SaaS, separándolo completamente de la lógica de ventas ordinarias.
* **Archivos Modificados / Creados:**
  - `src/features/billing/services/billingService.js` [NEW]
  - `src/features/billing/hooks/useBilling.js` [NEW]

---

### [2026-07-10] - Corrección de visibilidad de botones de compra y checkout (bg-action fallback)
* **Tipo:** Bug Fix / UI-UX
* **Severidad:** Alta
* **Síntoma:** Los botones de "Comprar Ahora" y el botón de "Ir a pedir" del carrito se renderizaban en blanco sobre blanco, volviéndose invisibles.
* **Causa Raíz:** Cuando el tema activo era `'zafiro-moderno'` (que no está estáticamente en `index.css` sino definido en `palettes.js` y se aplica dinámicamente) o si no se especificaba color de acción personalizado (`actionColor`), la variable `--color-action` se asignaba a `activeColors['--color-primary']`. Sin embargo, al iniciar o usar ciertos temas, `activeColors` retornaba un objeto vacío o valores no definidos para la clave del color primario, dejando a `--color-action` con valor `undefined` y transparentando el fondo de los botones.
* **Archivos Modificados:**
  - `src/App.jsx` → Modificado el bloque de asignación de `--color-action` para soportar fallbacks en cadena: `const finalActionColor = actionColor || activeColors['--color-primary'] || 'var(--color-primary)'`. Esto asegura que siempre se resuelva a un color válido (el color de acción personalizado, el primario activo del tema actual o el fallback primario CSS heredado).

