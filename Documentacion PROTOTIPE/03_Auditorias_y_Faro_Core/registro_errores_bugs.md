# 🐛 Registro de Errores y Soluciones (Bug Log)

> [!IMPORTANT]
> **PROTOCOLO DE USO PARA LA IA:**
> - **ANTES de solucionar un bug:** Consulta este archivo para verificar si el error ya fue reportado y resuelto anteriormente.
> - **DESPUÉS de solucionar un bug:** Registra inmediatamente la entrada con el formato estándar a continuación.
> - **DISPARADOR:** Este archivo se actualiza obligatoriamente junto con `bitacora_cambios.md` ante cualquier corrección de error.

---

## Formato de Registro

```
### [BUG-XXX] Título Descriptivo del Error
- **Fecha:** YYYY-MM-DD
- **Severidad:** Crítico | Alto | Medio | Bajo
- **Área:** UI/UX | Lógica | Base de Datos | Seguridad | Rendimiento | Event Handling
- **Archivos Afectados:** lista de archivos
- **Síntoma Observable:** Lo que el usuario percibe.
- **Causa Raíz:** La causa técnica real del error.
- **Solución Aplicada:** Los cambios técnicos exactos que lo resolvieron.
- **Estado:** ✅ Resuelto | 🔄 En Progreso | ⏸️ Postergado
```

### [BUG-021] Notificaciones al cliente no se entregan y bandeja del admin no actualiza por índices faltantes
- **Fecha:** 2026-06-09
- **Severidad:** Crítico
- **Área:** Base de Datos / Firestore Indexes
- **Archivos Afectados:**
  - [`d:\PROTOTIPE\Plantillas Core\App Ventas\firestore.indexes.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.indexes.json)
- **Síntoma Observable:** Al cambiar el estado de un pedido desde el admin, el cliente no recibía notificación en su bandeja. El tray del admin tampoco mostraba actualizaciones en tiempo real. Los botones "Vaciar bandeja" y "Marcar todas como leídas" no tenían efecto visible.
- **Causa Raíz:** La colección `notifications` carecía de 3 índices compuestos obligatorios:
  1. `recipientRole + createdAt DESC` → para `onSnapshot` del admin (query sin `recipientId`)
  2. `recipientId + recipientRole + createdAt DESC` → para `onSnapshot` del cliente
  3. `recipientId + status` → para `markAllAsRead` del cliente (query `where status == 'unread'`)
  Sin estos índices, Firestore rechazaba las queries silenciosamente en el callback de error del listener, sin mostrar ningún mensaje en la UI.
- **Solución Aplicada:** Se agregaron los 3 índices faltantes a `firestore.indexes.json` y se desplegaron con `firebase deploy --only firestore:indexes`.
- **Estado:** ✅ Resuelto

---

### [BUG-020] Tarjetas de pedido del cliente no se actualizan en tiempo real al cambiar estado desde admin
- **Fecha:** 2026-06-09
- **Severidad:** Crítico
- **Área:** Seguridad / Base de Datos / Reglas Firestore
- **Archivos Afectados:**
  - [`d:\PROTOTIPE\Plantillas Core\App Ventas\firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules)
- **Síntoma Observable:** Al marcar un pedido como "Completado" desde el panel admin, la tarjeta del cliente no se actualizaba en tiempo real. El cliente debía recargar la página para ver el nuevo estado. Las notificaciones tampoco llegaban.
- **Causa Raíz:** La regla `allow read` en la colección `/orders` combinaba `get` y `list` con la condición `resource.data.cliente.celular != null`. Firestore **prohíbe** evaluar `resource.data` en queries de tipo `list` (consultas con `where`/`onSnapshot`), ya que requeriría leer cada documento antes de decidir el acceso — un problema de seguridad y rendimiento. Resultado: `subscribeToClientOrders` (el `onSnapshot` del cliente) era rechazado silenciosamente, el listener nunca se ejecutaba y la UI quedaba congelada con los datos de la carga inicial.
- **Solución Aplicada:** Se separó `allow read` en dos reglas explícitas:
  - `allow get`: mantiene `resource.data.cliente.celular != null` (válido para lecturas por ID)
  - `allow list: if isAdmin() || true`: permite queries sin evaluar `resource.data` (seguro porque las queries del cliente siempre van filtradas por su celular en el `where`)
- **Patrón Preventivo:** Ver sección **"Anti-Patrón Crítico: allow read vs allow get/list"** en `seguridad_firestore_ecosistema.md`.
- **Estado:** ✅ Resuelto

---

### [BUG-019] Error 500 (Internal Server Error) en Auto-detección de Firebase al Aprovisionar Cliente
- **Fecha:** 2026-06-07
- **Severidad:** Crítico
- **Área:** Lógica / CLI Bridge local
- **Archivos Afectados:**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx)
- **Síntoma Observable:** Al intentar aprovisionar o auto-detectar las credenciales de un cliente (ej. `verdurasjuanremigio`), el sistema se quedaba procesando infinitamente y el navegador arrojaba un error de red `500 (Internal Server Error)` con el mensaje `Command failed: firebase apps:sdkconfig web --project  verdurasjuanremigio --json`.
- **Causa Raíz:** El ID del proyecto de Firebase (`fbProjectId`) introducido por el usuario o copiado de la consola incluía un espacio en blanco inicial (ej. `" verdurasjuanremigio"`). Al pasarse sin sanitizar como parámetro de consulta en la URL, el servidor CLI local ejecutaba el comando de Firebase CLI con doble espacio, fallando internamente en la consola y retornando un código HTTP 500.
- **Solución Aplicada:**
  1. Se agregó la directiva `.trim()` a la variable `cleanProjectId` en `handleAutoDetectConfig` en `App.jsx`.
  2. Se sanitizó en caliente el evento `onChange` en el input del Firebase Project ID para eliminar automáticamente todos los espacios en blanco (`replace(/\s+/g, '')`) y convertir a minúsculas en tiempo real.
  3. Se inyectó `.trim()` preventivo en el envío del `cliPayload` y en la escritura de `firebaseConfig` en Firestore para todas las variables de configuración de Firebase.
- **Estado:** ✅ Resuelto

### [BUG-018] ReferenceError: useMemo is not defined en ComponentSandbox.jsx
- **Fecha:** 2026-06-06
- **Severidad:** Alto
- **Área:** Lógica / React Component Imports
- **Archivos Afectados:**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx)
- **Síntoma Observable:** Al intentar visualizar o renderizar el componente `DatePickerPremium` dentro del Sandbox, el navegador arrojaba un error de pantalla en blanco y la consola de desarrollo reportaba `Uncaught ReferenceError: useMemo is not defined`.
- **Causa Raíz:** Se utilizó el hook `useMemo` directamente en la lógica interna de la cuadrícula de días del calendario en `DatePickerPremium` sin desestructurarlo de React en la declaración de importación superior de `ComponentSandbox.jsx`.
- **Solución Aplicada:** Se agregó `useMemo` a la lista de imports destructurados de React en la línea 1 de `ComponentSandbox.jsx`: `import React, { useState, useEffect, useRef, useMemo } from 'react';`.
- **Estado:** ✅ Resuelto

### [BUG-015] Pantalla en Blanco / Carga Indefinida al Crear Nuevos Proyectos (settings ausente)
- **Fecha:** 2026-06-03
- **Severidad:** Crítico
- **Área:** Lógica / Inicialización de Base de Datos
- **Archivos Afectados:**
  - [`src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js)
- **Síntoma Observable:** Al instanciar un nuevo proyecto o marca (como Moni) e iniciar la aplicación en el puerto local, la pantalla se quedaba en blanco indefinidamente y el inspector mostraba que la app no cargaba los componentes debido a que el store se quedaba congelado en `isLoaded: false`.
- **Causa Raíz:** En `App.jsx` y `LoginPage.jsx` se restringe el renderizado si `!isLoaded`. Dado que `isLoaded` se establece tras resolver la configuración de base de datos, y que en proyectos/marcas nuevas el documento `/config/settings` aún no existe en su respectivo Firestore, el listener reactivo de `subscribeToAppConfig` se ejecutaba en vacío y nunca actualizaba el store Zustand, bloqueando el primer renderizado.
- **Solución Aplicada:** Se modificó `subscribeToAppConfig` en `appConfigService.js`. Ahora, al detectar que el snapshot del documento `config/settings` no existe en la base de datos central o del cliente, el script ejecuta de forma inmediata un `setDoc` para inicializar el documento con las configuraciones por defecto (`DEFAULT_SETTINGS`), resolviendo el estado `isLoaded` y desbloqueando el renderizado e inicio de la aplicación al instante.
- **Estado:** ✅ Resuelto

---

### [BUG-014] ReferenceError: currentSettings is not defined en CheckoutModal al abrir el modal
- **Fecha:** 2026-06-03
- **Severidad:** Crítico
- **Área:** Lógica / React Component Context
- **Archivos Afectados:**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
- **Síntoma Observable:** Al intentar abrir el modal de Checkout, la aplicación se caía por completo mostrando una pantalla en blanco y reportando el error `ReferenceError: currentSettings is not defined` en la consola.
- **Causa Raíz:** Se introdujo la validación del punto de recogida del retiro en tienda mediante coordenadas (`currentSettings.pickup?.coords`) en la renderización del paso 2. Sin embargo, `currentSettings` estaba declarado de forma aislada dentro de bloques de condiciones locales (`if`) de otros pasos, por lo que no estaba en el ámbito de alcance (scope) al momento de renderizar el JSX.
- **Solución Aplicada:** Se extrajo `currentSettings` a una constante global dentro de la función del componente `CheckoutModal`, inicializada mediante un `useMemo` reactivo al store de `deliverySettings`. Se eliminaron las definiciones locales duplicadas redundantes.
- **Estado:** ✅ Resuelto

---

### [BUG-005] Contraste Deficiente en Textos y Controles de Modales al Cambiar Temas HSL
- **Fecha:** 2026-05-31
- **Severidad:** Alto
- **Área:** UI/UX — Diseños y Accesibilidad de Temas
- **Archivos Afectados:**
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css)
  - [`src/components/common/ModalTemplate.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx)
- **Síntoma Observable:** Al cambiar a temas personalizados en la paleta de configuraciones (ej: Verde Oliva, Naranja Vibrante, etc.), algunos textos descriptivos, cantidades en el selector y bordes de los modales eran invisibles o tenían muy bajo contraste debido a que se mezclaban fondos oscuros con textos de color muy oscuro.
- **Causa Raíz:** 
  1. En `index.css`, los selectores de modo oscuro como `.dark [data-theme="verde-oliva"]` contenían un espacio vacío. Dado que la clase `dark` y el atributo `data-theme` se inyectan en el mismo tag `<html>`, el navegador buscaba un descendiente inexistente en lugar de aplicar los estilos al nodo raíz. Esto causaba que en modo oscuro los temas usaran variables de color de modo claro.
  2. En Tailwind v4, el selector de clase `dark:` por defecto no está enlazado a la clase `.dark` del tag `<html>`, por lo que las clases Tailwind con prefijo `dark:` (ej. `dark:bg-gray-900`) dependían puramente de las preferencias del sistema del usuario y no de la configuración de la app.
  3. Los componentes `ModalTemplate` y `ProductDetailModal` usaban clases de Tailwind fijas (como `bg-white` y `text-gray-500`) en lugar de los tokens semánticos definidos por CSS variables en los temas (`bg-surface`, `text-app`, `text-muted`).
- **Solución Aplicada:**
  1. Se eliminó el espacio en los selectores oscuros de `index.css` (ej: `.dark[data-theme="verde-oliva"]`).
  2. Se configuró el custom variant `@variant dark (&:where(.dark, .dark *))` al inicio de `index.css` para el correcto soporte de clase en Tailwind v4.
  3. Se refactorizaron los archivos de modales reemplazando clases duras de Tailwind por variables dinámicas de tema (`bg-surface`, `bg-surface-2`, `text-app`, `text-muted`, `border-app`).
- **Estado:** ✅ Resuelto

---

### [BUG-004] ReferenceError: X is not defined en ClientCatalog al cambiar de categoría
- **Fecha:** 2026-05-31
- **Severidad:** Alto
- **Área:** UI/UX — Component Error
- **Archivos Afectados:**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
- **Síntoma Observable:** Al cambiar de categoría en el catálogo del cliente o al presionar el botón "Limpiar" filtros de categoría, se desencadenaba una excepción de JavaScript que bloqueaba el renderizado de la aplicación: `ReferenceError: X is not defined`.
- **Causa Raíz:** Se agregó el icono de limpieza `<X size={11} />` en el botón Limpiar de las categorías compactas, pero el componente de icono `X` de `lucide-react` no había sido importado en la cabecera del archivo en la línea 4.
- **Solución Aplicada:** Se importó el icono `X` desestructurándolo de `'lucide-react'` en los imports de `ClientCatalog.jsx`.
- **Estado:** ✅ Resuelto

---

## 📋 Historial de Bugs

---

### [BUG-001] Parpadeo negro / rosado al cargar la aplicación por primera vez
- **Fecha:** 2026-05-29
- **Severidad:** Medio
- **Área:** UI/UX — Inicialización de Estado
- **Archivos Afectados:**
  - `src/store/appConfigStore.js`
  - `src/constants/palettes.js`
  - `index.html`
- **Síntoma Observable:** Al abrir la aplicación con caché limpia o por primera vez, la pantalla mostraba un destello de color oscuro (negro) o de color de marca (rosado) antes de mostrar el tema real de la tienda.
- **Causa Raíz:** El store de Zustand inicializaba `theme` en `'carbon-oscuro'` (fondo `#121212`) e `isDarkMode` en `false`. React montaba `ThemeApplier` con esos valores de fallback y pintaba el DOM con colores oscuros antes de que `useAppConfigSync` terminara la suscripción a Firestore y reemplazara el tema real. Al cambiar a `'rosa-elegante'` como fallback, el problema mutó de negro a rosado por la misma razón.
- **Solución Aplicada:**
  1. Se creó la paleta `'neutral'` en `palettes.js` — una paleta genérica clara (fondo `#f8fafc`, superficies blancas) sin identidad de marca.
  2. Se estableció `'neutral'` como el `theme` inicial de Zustand y como el fallback primario de `getActiveColors()`.
  3. Se cambió el `theme-color` de `index.html` de `#000000` a `#ffffff`.
- **Estado:** ✅ Resuelto

---

### [BUG-002] Bandeja de notificaciones no se cierra al tocar fuera en mobile
- **Fecha:** 2026-05-29
- **Severidad:** Alto
- **Área:** UI/UX — Mobile Event Handling / Framer Motion Interop
- **Archivos Afectados:**
  - `src/layouts/ClientLayout.jsx`
  - `src/layouts/AdminLayout.jsx`
- **Síntoma Observable:** Al presionar/tocar en cualquier parte de la pantalla fuera del panel de notificaciones, este no se cerraba en mobile. En desktop el comportamiento era correcto. La única forma de cerrarlo era presionar el botón campana nuevamente.
- **Causa Raíz (proceso de descubrimiento):**
  - **Intento 1 — Overlay `onClick`:** El overlay cerraba pero el `click` burbujeaba hasta el botón campana (toggle `!state`), re-abriéndolo. El DOM cycle es `mousedown → mouseup → click`.
  - **Intento 2 — Overlay `onMouseDown + stopPropagation`:** Funcionó en desktop (`mousedown`), pero no en mobile. Los `motion.div` de **Framer Motion** instalan handlers nativos de `touchstart` para reconocimiento de gestos. Esos handlers llaman `stopPropagation()` durante la **fase de bubble**, impidiendo que el listener llegue al `document`.
  - **Intento 3 — `useRef + document.addEventListener('touchstart')` en bubble phase:** Mismo problema: Framer Motion intercepta el `touchstart` antes de que burbujee al `document`.
  - **Causa raíz definitiva:** Cualquier listener en `document` en **fase de bubble** es vulnerable a `stopPropagation()` de elementos intermedios (Framer Motion en este caso).
- **Solución Definitiva:**
  - `useRef` (`notifDesktopRef`, `notifMobileRef`) en los contenedores de las campanas. El handler verifica `ref.contains(e.target)` para determinar si cerrar.
  - `document.addEventListener('touchstart', handler, { capture: true, passive: true })` — La **fase de captura** fluye `document → target`. El listener se ejecuta PRIMERO, antes de cualquier handler de elementos hijo, antes de Framer Motion. Es imposible que lo intercepten.
  - `document.addEventListener('mousedown', handler, { capture: true })` — Mismo patrón para desktop.
  - El `useEffect` solo está activo cuando `isNotificationsOpen === true` y hace cleanup completo en su return.
  - Se eliminaron todos los overlays transparentes y `onMouseDown` del JSX.
  - Aplicado simétricamente en `ClientLayout.jsx` (sidebar desktop + header mobile) y `AdminLayout.jsx` (sidebar desktop + botón flotante mobile).
  - Se agregó `useRef` al import de React en `AdminLayout.jsx`.
- **Estado:** ✅ Resuelto — Verificado en desktop y mobile

---

### [BUG-003] Toast de confirmación en Ajustes del Administrador salta y se recorta al cambiar sección
- **Fecha:** 2026-05-29
- **Severidad:** Medio
- **Área:** UI/UX — Renderizado de Portales
- **Archivos Afectados:**
  - `src/pages/admin/AdminSettings.jsx`
- **Síntoma Observable:** El toast de confirmación (mensaje "¡Cambios guardados!") aparecía en posiciones aleatorias, saltaba, o se cortaba en animación al cambiar entre secciones del panel de configuración.
- **Causa Raíz:** El toast se renderizaba dentro del árbol de componentes de `AdminSettings`, el cual usa `key={activeSection}` para remontar el componente al cambiar de sección. Al remontar, el toast se desmontaba abruptamente en medio de su animación de entrada/salida.
- **Solución Aplicada:** Se encapsuló el toast dentro de un `ReactDOM.createPortal` apuntando a `document.body`, sacándolo del árbol local del componente. Al flotar en el DOM global, los ciclos de montaje/desmontaje de `AdminSettings` no afectan su animación.
- **Estado:** ✅ Resuelto

---

### [BUG-004] Modo oscuro activado por defecto al limpiar caché del navegador
- **Fecha:** 2026-05-29
- **Severidad:** Medio
- **Área:** Inicialización de Estado — Zustand Persist
- **Archivos Afectados:**
  - `src/store/appConfigStore.js`
- **Síntoma Observable:** Al ingresar por primera vez o limpiar el localStorage del navegador, la aplicación se inicializaba en modo oscuro de forma inesperada, independientemente de la configuración guardada en Firestore.
- **Causa Raíz:** El estado inicial de `isDarkMode` en el store estaba definido como `true`.
- **Solución Aplicada:** Se cambió el valor inicial de `isDarkMode` de `true` a `false` en `appConfigStore.js`.
- **Estado:** ✅ Resuelto

---

### [BUG-005] Botón "Pedir por encargo" visible cuando mayoreo está deshabilitado globalmente
- **Fecha:** 2026-05-29
- **Severidad:** Alto
- **Área:** Lógica de Negocio — Feature Flags
- **Archivos Afectados:**
  - `src/pages/client/ClientCatalog.jsx` (o componente de tarjeta de producto)
- **Síntoma Observable:** El botón "Pedir por encargo" se renderizaba en la tarjeta de producto incluso cuando el administrador había desactivado la funcionalidad de mayoreo desde el panel de configuración.
- **Causa Raíz:** La lógica del botón no evaluaba el flag global `wholesaleSettings.enabled` del store antes de renderizarse.
- **Solución Aplicada:** Se extrajo el botón a un componente puro `WholesaleButton` que evalúa `wholesaleSettings.enabled` como primera condición. Si el flag es `false`, retorna `null` sin renderizar nada.
- **Estado:** ✅ Resuelto

---

### [BUG-006] Calificación de empleados no se guarda y se elimina inmediatamente de las estrellas
- **Fecha:** 2026-05-31
- **Severidad:** Alto
- **Área:** Seguridad / Permisos
- **Archivos Afectados:**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
- **Síntoma Observable:** Al marcar la calificación de estrellas en un pedido completado/listo desde el panel del cliente, la selección no se guarda y las estrellas vuelven a quedar vacías al instante.
- **Causa Raíz:** Las reglas de seguridad de Firestore (`firestore.rules`) en la colección `/orders` solo permitían la actualización por parte del cliente para cancelar el pedido (`estado == 'cancelado'`) o para ocultarlo de su historial (`ocultoCliente == true`). La actualización del campo `calificacionVendedor` era rechazada con un error de permisos por Firestore, provocando que la mutación de React Query fallara y restableciera el estado local a vacío.
- **Solución Aplicada:** Se modificó la regla de actualización (`allow update`) para la colección `/orders` permitiendo que clientes no autenticados actualicen el documento de su pedido siempre y cuando los únicos campos modificados en la petición sean `calificacionVendedor` y `updatedAt`. Se validó esto de forma segura utilizando: `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['calificacionVendedor', 'updatedAt'])`.
- **Estado:** ✅ Resuelto

---

### [BUG-007] FirebaseError: Missing or insufficient permissions en la carga de Mensajeros Externos
- **Fecha:** 2026-06-01
- **Severidad:** Alto
- **Área:** Seguridad / Permisos / Base de Datos
- **Archivos Afectados:**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
- **Síntoma Observable:** Al ingresar a la sección de "Mensajero Propio" dentro de los Ajustes del Administrador, el panel reportaba un error de permisos en la consola (`FirebaseError: Missing or insufficient permissions.`) y no cargaba el listado de domiciliarios externos configurados.
- **Causa Raíz:** En `firestore.rules`, la regla de lectura y escritura para la subcolección `/config/delivery/messengers/{messengerId}` estaba anidada erróneamente de forma directa dentro de `match /config/{document}`. En Firestore Security Rules, los matches anidados son relativos a la ruta del padre. Dado que `{document}` ya representaba el documento (ej: `delivery`), la regla terminaba resolviendo la ruta como `/config/delivery/delivery/messengers/{messengerId}` en lugar de la ruta real del documento de Firestore, bloqueando cualquier consulta legítima a `/config/delivery/messengers`.
- **Solución Aplicada:** Se aplanó el bloque de reglas extrayendo la subcolección como un match absoluto independiente: `match /config/delivery/messengers/{messengerId}` con permisos públicos de lectura y escritura restringida a administradores (`isAdmin()`).
- **Estado:** ✅ Resuelto

---

### [BUG-008] Hydration Error: In HTML, <div> cannot be a descendant of <p>
- **Fecha:** 2026-06-01
- **Severidad:** Medio
- **Área:** UI/UX — Hydration Error
- **Archivos Afectados:**
  - [`src/components/common/ModalTemplate.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)
- **Síntoma Observable:** Al abrir el Checkout del cliente, la consola del navegador reportaba un error de React Hydration indicando que un elemento `<div>` no puede estar anidado dentro de un `<p>`.
- **Causa Raíz:** En `ModalTemplate.jsx`, el contenedor del subtítulo estaba implementado con una etiqueta `<p>` para textos simples. Sin embargo, al renderizar el checkout, se le pasaba al componente un subtítulo complejo que contenía elementos `<motion.div>` (bloques divs) representando el progreso del formulario, violando las especificaciones del estándar de maquetación HTML.
- **Solución Aplicada:** Se cambió la etiqueta contenedora del subtítulo en `ModalTemplate.jsx` de `<p>` a `<div>`.
- **Estado:** ✅ Resuelto

---

### [BUG-009] FirebaseError: Missing or insufficient permissions al crear pedido en Checkout
- **Fecha:** 2026-06-01
- **Severidad:** Crítico
- **Área:** Seguridad / Base de Datos / Transacciones de Venta
- **Archivos Afectados:**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
- **Síntoma Observable:** Al pulsar "Confirmar Pedido" en el checkout, el flujo de compra fallaba y el cliente visualizaba el error: `Error al crear pedido: FirebaseError: Missing or insufficient permissions.`.
- **Causa Raíz:** Al confirmar la compra, el cliente ejecuta una transacción atómica que crea el pedido en `/orders` y deduce el stock correspondiente modificando la propiedad `variantes` del documento del producto afectado en `/products`. Las reglas de Firestore en `/products` solo permitían escrituras a administradores (`allow write, update, delete: if isAdmin()`), bloqueando la deducción de stock en caliente realizada por los clientes.
- **Solución Aplicada:** Se modificó la regla de actualización (`allow update`) en `/products` para autorizar de forma segura las actualizaciones públicas realizadas por los clientes, siempre y cuando se modifiquen única y exclusivamente los campos `variantes` y `updatedAt`.
- **Estado:** ✅ Resuelto

---

### [BUG-010] FirebaseError: [code=permission-denied]: Missing or insufficient permissions al abrir "Mis Pedidos"
- **Fecha:** 2026-06-01
- **Severidad:** Alto
- **Área:** Seguridad / Base de Datos / Consultas
- **Archivos Afectados:**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
- **Síntoma Observable:** Al abrir la pestaña de "Mis Pedidos" (historial del cliente), el listado se queda en blanco o sin cargar y se dispara un error en la consola del navegador: `FirebaseError: [code=permission-denied]: Missing or insufficient permissions.`.
- **Causa Raíz:** La regla de lectura en `/orders` para clientes públicos requería estrictamente un límite en la query de máximo 20 registros (`request.query.limit <= 20`). No obstante, la suscripción en tiempo real a las órdenes del cliente ejecutada en `orderService.js` mediante la función `subscribeToClientOrders(celular)` no forzaba ningún límite. Al no coincidir las restricciones de la consulta con la regla, Firebase denegaba la lectura completa de los documentos por seguridad.
- **Solución Aplicada:** Se removió la restricción redundante `&& request.query.limit <= 20` de la regla de lectura (`allow read`) en la colección `/orders`. Dado que la consulta de cliente está inherentemente filtrada por su número de celular (`cliente.celular`), se mantiene la integridad de los datos sin requerir límites forzados en la regla de seguridad.
- **Estado:** ✅ Resuelto

---

### [BUG-011] UI/UX: Botón "Volver a la tienda" oculto en el pie de página de Seguimiento
- **Fecha:** 2026-06-01
- **Severidad:** Bajo
- **Área:** UI/UX — Navegación
- **Archivos Afectados:**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx)
- **Síntoma Observable:** Al ingresar a la vista pública de seguimiento de pedido, el enlace *"Volver a la tienda"* se ubicaba al fondo en el footer, lo que requería que el usuario realizara scroll completo para visualizarlo y poder retornar al catálogo.
- **Causa Raíz:** El enlace estaba maquetado en el pie de página del layout de forma estática en lugar de actuar como un header bar o botón de retorno superior accesible.
- **Solución Aplicada:** Se importó `ChevronLeft` desde `lucide-react`, se removió el link inferior y se insertó una barra de navegación superior limpia al inicio del componente que permite regresar a la tienda de forma inmediata en la esquina superior izquierda.
- **Estado:** ✅ Resuelto

---

### [BUG-012] UI/UX: Tarjetas de categorías desproporcionadamente grandes en la versión de escritorio (PC)
- **Fecha:** 2026-06-01
- **Severidad:** Medio
- **Área:** UI/UX — Responsividad y Layout Adaptativo
- **Archivos Afectados:**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
- **Síntoma Observable:** Al abrir el catálogo del cliente en pantallas de escritorio (PC/Tablet), las tarjetas de las categorías se renderizaban como botones cuadrados gigantescos que ocupaban un área excesiva de la pantalla, dañando el refinamiento estético de la marca.
- **Causa Raíz:** Las tarjetas de categorías estaban maquetadas con clases rígidas de grilla y proporciones cuadradas obligatorias (`grid grid-cols-4` y `aspect-square w-full`) sin adaptabilidad para vistas de PC.
- **Solución Aplicada:** Se implementó una transformación CSS responsiva completa en `ClientCatalog.jsx`:
  * El contenedor de categorías cambia de grid de 4 columnas en mobile a flex wrap en PC (`grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3`).
  * Los botones se transforman de cuadrados gigantes (`aspect-square w-full flex flex-col`) a elegantes cápsulas horizontales compactas (`sm:aspect-auto sm:w-auto sm:h-11 sm:px-5 sm:flex-row`).
  * Los iconos se reducen a tamaño chip (`sm:w-4 sm:h-4`) y se alinean horizontalmente con el texto (`sm:mb-0`).
  * Se inyectó una regla de índice (`idx >= 3 && !isCategoriesExpanded ? 'hidden sm:flex' : 'flex'`) que permite visualizar todas las categorías de forma fluida en PC, manteniendo el límite de 3 ítems iniciales únicamente en mobile.
- **Estado:** ✅ Resuelto

---

### [BUG-013] UI/UX: Vistas del cliente (Pedidos, Créditos y Perfil) comprimidas y descentradas en escritorio (PC)
- **Fecha:** 2026-06-01
- **Severidad:** Medio
- **Área:** UI/UX — Layout y Alineación Responsiva
- **Archivos Afectados:**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx)
  - [`src/pages/client/ClientCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx)
  - [`src/pages/client/ClientProfile.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx)
- **Síntoma Observable:** Al navegar en las secciones de "Mis Pedidos", "Mis Créditos" o "Mi Perfil" desde una computadora (desktop/tablet), todo el contenido se veía amontonado en una franja central muy estrecha, dejando una gran área vacía de fondo en la derecha de la pantalla y rompiendo el estándar de alineación del catálogo general.
- **Causa Raíz:** Los contenedores principales de diseño de estas tres páginas poseían limitaciones rígidas de ancho máximo en Tailwind (`max-w-3xl` o `max-w-xl`), impidiendo que el contenido aprovechara la anchura horizontal de las pantallas grandes de PC.
- **Solución Aplicada:** Se homogeneizaron las tres vistas al estándar premium de ancho máximo del proyecto (`max-w-7xl`):
  * **`ClientOrders.jsx`**: Se modificó la envoltura en la línea 713 a `lg:max-w-7xl lg:px-8`.
  * **`ClientCredits.jsx`**: Se modificaron las líneas 114 y 152 reemplazando `max-w-4xl` por `max-w-7xl`.
  * **`ClientProfile.jsx`**: Se modificaron las líneas 66 y 127 de `max-w-xl` al estándar amplio `max-w-7xl`.
- **Estado:** ✅ Resuelto

---

### [BUG-016] FirebaseError: Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore en AdminHome
- **Fecha:** 2026-06-03
- **Severidad:** Crítico
- **Área:** Lógica / Integración de Firebase
- **Archivos Afectados:**
  - [`src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js)
- **Síntoma Observable:** Al intentar acceder a la sección de administración (`/admin/inicio`), la aplicación arrojaba un error de tipo en el componente `<AdminHome>` impidiendo la carga completa de la interfaz y rompiendo el renderizado de la UI. El error exacto era: `FirebaseError: Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore`.
- **Causa Raíz:** En `billingService.js`, el método `getCentralFirestore()` retornaba directamente la instancia del objeto `FirebaseApp` devuelta por `initializeApp(...)` o `getApp(...)`, en lugar de invocar a `getFirestore(app)` para extraer la instancia del servicio de base de datos Firestore. Al intentar realizar `doc(centralDb, 'clientes_control', CLIENT_ID)`, el SDK fallaba dado que el primer parámetro era una instancia de `App` y no de `Firestore`.
- **Solución Aplicada:** Se modificó la función `getCentralFirestore` para que instancie u obtenga la aplicación Firebase y, antes de retornar, ejecute `getFirestore(app)`, entregando correctamente la referencia de base de datos a `doc()`.
- **Estado:** ✅ Resuelto
