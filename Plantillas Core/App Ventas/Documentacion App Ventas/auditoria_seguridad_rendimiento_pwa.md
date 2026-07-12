# Auditoría de Seguridad, Robustez, Rendimiento y UI/UX de la Aplicación Core (App Ventas)

**Documento Técnico de Auditoría Preventiva**  
**Fecha:** 2026-06-05  
**Responsable:** Auditor Técnico Senior  

---

## 1. Resumen Ejecutivo
Esta auditoría ha sido ejecutada de acuerdo con las directivas de calidad de software de PROTOTIPE para la aplicación base **App Ventas**. Se ha realizado un escaneo estático de código fuente centrado en la suscripción en tiempo real de Firebase Firestore (`onSnapshot`), el control de excepciones de operaciones asíncronas, y problemas de usabilidad/UI/UX (modales, cierres, scroll).

Se han identificado dos riesgos críticos de fugas de memoria por listeners huérfanos, fallos medianos de robustez ante llamadas asíncronas desprotegidas, y fallos menores en micro-interacciones de la interfaz de usuario. A continuación se detallan los hallazgos agrupados por severidad.

---

## 2. Hallazgos Críticos

### Hallazgo 2.1 — Fuga de Memoria por Suscripción de IA Huérfana en Carga de Imágenes
* **Severity:** Crítico
* **Finding Type:** Seguridad / Robustez
* **Location:** `d:\Aplicaciones\App Ventas\src\components\admin\inventory\ProductFormModal.jsx` (Líneas 281-297)
* **Root Cause:** Al cargar la imagen de un producto, la función `handleImageUpload` inicializa de manera imperativa y local un listener `onSnapshot` sobre el documento `"draft_products"` correspondiente al borrador del producto, con el fin de esperar la sugerencia generada por Vertex AI. El retorno `unsubscribe` queda encapsulado dentro del ámbito de la función asíncrona. Si el usuario cierra el modal o abandona el formulario antes de que la IA responda (de modo que `docSnap.data().suggestions` sea falso o nulo), el componente se desmonta pero la suscripción sigue activa indefinidamente. Esto produce fugas de memoria, fugas de descriptores de socket y lecturas adicionales no deseadas en Firestore.
* **Concrete Solution:**
  Almacenar la referencia del listener en un React `useRef` y asegurar su cancelación en el desmontaje del componente:
  ```diff
  // En las variables de estado al inicio de ProductFormModal:
+ const unsubscribeIARef = useRef(null)

  // En la función handleImageUpload:
-       const docRef = doc(db, "draft_products", draftId)
-       const unsubscribe = onSnapshot(docRef, (docSnap) => {
-         if (docSnap.exists() && docSnap.data().suggestions) {
-           const suggestions = docSnap.data().suggestions
-           setFormData(prev => ({
-             ...prev,
-             nombre: suggestions.nombre || prev.nombre,
-             descripcion: suggestions.descripcion || prev.descripcion,
-             precioBase: suggestions.precioBase?.toString() || prev.precioBase,
-             categoriaId: suggestions.categoriaId || prev.categoriaId,
-             seoTitle: suggestions.seoTitle || prev.seoTitle,
-             seoDescription: suggestions.seoDescription || prev.seoDescription,
-           }))
-           setLoadingIA(false)
-           unsubscribe()
-         }
-       })
+       const docRef = doc(db, "draft_products", draftId)
+       unsubscribeIARef.current = onSnapshot(docRef, (docSnap) => {
+         if (docSnap.exists() && docSnap.data().suggestions) {
+           const suggestions = docSnap.data().suggestions
+           setFormData(prev => ({
+             ...prev,
+             nombre: suggestions.nombre || prev.nombre,
+             descripcion: suggestions.descripcion || prev.descripcion,
+             precioBase: suggestions.precioBase?.toString() || prev.precioBase,
+             categoriaId: suggestions.categoriaId || prev.categoriaId,
+             seoTitle: suggestions.seoTitle || prev.seoTitle,
+             seoDescription: suggestions.seoDescription || prev.seoDescription,
+           }))
+           setLoadingIA(false)
+           if (unsubscribeIARef.current) {
+             unsubscribeIARef.current()
+             unsubscribeIARef.current = null
+           }
+         }
+       }, (error) => {
+         console.error("Error al escuchar sugerencias IA:", error)
+         setLoadingIA(false)
+       })

  // En un useEffect de limpieza al inicio del componente:
+ useEffect(() => {
+   return () => {
+     if (unsubscribeIARef.current) {
+       unsubscribeIARef.current()
+     }
+   }
+ }, [])
  ```

### Hallazgo 2.2 — Descarte de Listener Fallback e Inhabilidad de Limpieza
* **Severity:** Crítico
* **Finding Type:** Robustez / Rendimiento
* **Location:** `d:\Aplicaciones\App Ventas\src\services\billingService.js` (Líneas 270-291)
* **Root Cause:** En la función `subscribeToBillingData`, si la llamada inicial para recuperar los ajustes comisionales del cliente central falla (por ejemplo, debido a reglas de seguridad o a un documento inexistente), el callback de error captura la excepción y de manera proactiva monta un segundo listener `onSnapshot(SETTINGS_REF, ...)` para leer los ajustes locales. Sin embargo, la variable del primer listener `unsubSettings` no es reasignada con la función de cancelación de la suscripción local de reemplazo. La llamada al método cleanup devuelto por `subscribeToBillingData` no cancelará el listener de fallback, dejando una suscripción activa permanente en segundo plano.
* **Concrete Solution:**
  Modificar el callback de error para reasignar la variable mutable del listener de reemplazo antes de invocarlo:
  ```diff
-     unsubSettings = onSnapshot(centralClientRef, (snap) => {
-       ...
-     }, (err) => {
-       console.warn('[Billing] Central client config not accessible. Falling back to local settings.', err)
-       onSnapshot(SETTINGS_REF, (localSnap) => {
-         if (localSnap.exists()) {
-           onUpdate(computeLocalBilling(orders, localSnap.data()))
-         }
-       })
-     })
+     unsubSettings = onSnapshot(centralClientRef, (snap) => {
+       ...
+     }, (err) => {
+       console.warn('[Billing] Central client config not accessible. Falling back to local settings.', err)
+       unsubSettings = onSnapshot(SETTINGS_REF, (localSnap) => {
+         if (localSnap.exists()) {
+           onUpdate(computeLocalBilling(orders, localSnap.data()))
+         }
+       }, (localErr) => {
+         console.error('[Billing] Error in local fallback settings snapshot:', localErr)
+       })
+     })
  ```

---

## 3. Hallazgos Medios

### Hallazgo 3.1 — Ausencia Generalizada de Callbacks de Control de Errores en `onSnapshot`
* **Severity:** Medio
* **Finding Type:** Robustez / Seguridad
* **Location:** Colección de Archivos de Servicios del Negocio:
  * `d:\Aplicaciones\App Ventas\src\services\accessLogService.js` (Líneas 59, 73)
  * `d:\Aplicaciones\App Ventas\src\services\adService.js` (Línea 63)
  * `d:\Aplicaciones\App Ventas\src\services\appConfigService.js` (Líneas 120, 136)
  * `d:\Aplicaciones\App Ventas\src\services\claimsService.js` (Línea 24)
  * `d:\Aplicaciones\App Ventas\src\services\creditService.js` (Líneas 125, 141)
  * `d:\Aplicaciones\App Ventas\src\services\deliveryService.js` (Líneas 326, 339)
  * `d:\Aplicaciones\App Ventas\src\services\orderService.js` (Líneas 159, 184)
  * `d:\Aplicaciones\App Ventas\src\services\productionService.js` (Línea 64)
  * `d:\Aplicaciones\App Ventas\src\services\tableService.js` (Líneas 40, 90)
* **Root Cause:** En múltiples servicios operativos clave, la inicialización de listeners en tiempo real `onSnapshot` solo provee el callback de éxito `(snapshot) => {}`. Si Firestore deniega el acceso debido a reglas de seguridad no actualizadas, a una pérdida repentina de conexión a internet o a índices compuestos ausentes, el error no es capturado. Como resultado, la aplicación no registrará el error ni proporcionará fallbacks visuales al usuario (como estados vacíos o banners de reintento), y en ocasiones la ejecución del hilo principal del hook quedará bloqueada de forma silenciosa.
* **Concrete Solution:**
  Para cada declaración de `onSnapshot` sin callback de error, añadir una función controladora que limpie o notifique el fallo:
  *Ejemplo en `accessLogService.js`:*
  ```diff
-   return onSnapshot(q, snap => {
-     callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
-   })
+   return onSnapshot(q, snap => {
+     callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
+   }, error => {
+     console.error('[AccessLogService] Error al escuchar logs activos:', error)
+     callback([])
+   })
  ```

### Hallazgo 3.2 — Falta de try/catch en Llamadas Asíncronas del Checkout de Crédito WhatsApp
* **Severity:** Medio
* **Finding Type:** Robustez
* **Location:** `d:\Aplicaciones\App Ventas\src\pages\client\ClientCredits.jsx` (Líneas 61-74, 82-109)
* **Root Cause:** Las funciones asíncronas locales `handleSendPagoTotalWhatsApp` y `handleSendAbonoWhatsApp` invocan el servicio asíncrono `createCreditNotification(...)` mediante `await` sin un bloque `try/catch`. Si la escritura de la notificación de crédito a Firestore falla (por ejemplo, debido a políticas de seguridad locales o interrupción de red), el flujo de ejecución se detendrá de inmediato debido a una excepción uncaught, imposibilitando la apertura del enlace de redirección a WhatsApp para realizar la transacción y la confirmación final del cliente.
* **Concrete Solution:**
  Proteger las llamadas asíncronas con bloques `try/catch` y alertar en caso de fallo, pero permitir la redirección para no romper la experiencia del cliente final:
  ```diff
  const handleSendPagoTotalWhatsApp = async (credit) => {
-   await createCreditNotification({
-     recipientId: 'admin',
-     recipientRole: 'admin',
-     title: 'Notificación de Pago Total',
-     body: `El cliente ${credit.cliente.nombre} ha informado el pago total de su crédito de ${formatCurrency(credit.montoTotal)}.`,
-     type: NC_TYPES.PAGO_CREDITO,
-     extra: { creditId: credit.id }
-   })
-   const msg = `Hola, he realizado el pago total de mi crédito de ${formatCurrency(credit.montoTotal)}...`
-   window.open(`https://wa.me/${whatsappAdmin}?text=${encodeURIComponent(msg)}`, '_blank')
+   try {
+     await createCreditNotification({
+       recipientId: 'admin',
+       recipientRole: 'admin',
+       title: 'Notificación de Pago Total',
+       body: `El cliente ${credit.cliente.nombre} ha informado el pago total de su crédito de ${formatCurrency(credit.montoTotal)}.`,
+       type: NC_TYPES.PAGO_CREDITO,
+       extra: { creditId: credit.id }
+     })
+   } catch (error) {
+     console.error('[ClientCredits] Error al enviar notificación de pago total:', error)
+   }
+   const msg = `Hola, he realizado el pago total de mi crédito de ${formatCurrency(credit.montoTotal)}...`
+   window.open(`https://wa.me/${whatsappAdmin}?text=${encodeURIComponent(msg)}`, '_blank')
  }
  ```

---

## 4. Hallazgos Bajos y UI/UX

### Hallazgo 4.1 — Retornos Condicionales Prematuros que Rompen Transiciones de Framer Motion
* **Severity:** Bajo / Medio (UI-UX)
* **Finding Type:** UI-UX
* **Location:** Modales del Negocio:
  * `d:\Aplicaciones\App Ventas\src\components\admin\orders\OrderShareModal.jsx` (Línea 44, 250)
  * `d:\Aplicaciones\App Ventas\src\components\client\catalog\ClientFilterModal.jsx`
  * `d:\Aplicaciones\App Ventas\src\components\client\catalog\WholesaleRequestModal.jsx`
* **Root Cause:** Estos componentes modales comienzan su renderizado con la condición `if (!isOpen) return null`. Dado que el componente se elimina completamente del DOM por sí mismo en lugar de permitir que Framer Motion gestione su ciclo de salida a través de `<AnimatePresence>`, la transición de desvanecimiento o escalado de salida (`exit`) se interrumpe abruptamente. El modal desaparece de la pantalla de manera tosca sin completar las animaciones fluidas premium del estándar.
* **Concrete Solution:**
  Delegar el control de renderizado de montaje/desmontaje al componente padre envolviéndolo en `<AnimatePresence>` e inyectando las props correspondientes, o mantener el componente montado usando el prop visible de Framer Motion.
  *Ejemplo en el Componente Padre:*
  ```diff
- <OrderShareModal isOpen={isShareModalOpen} order={selectedOrder} onClose={() => setIsShareModalOpen(false)} />
+ <AnimatePresence>
+   {isShareModalOpen && (
+     <OrderShareModal order={selectedOrder} onClose={() => setIsShareModalOpen(false)} />
+   )}
+ </AnimatePresence>
  ```

### Hallazgo 4.2 — Falta de Bloqueo de Desplazamiento (Scroll Lock) en Panel de Filtros
* **Severity:** Bajo
* **Finding Type:** UI-UX
* **Location:** `d:\Aplicaciones\App Ventas\src\components\client\catalog\ClientFilterModal.jsx`
* **Root Cause:** A diferencia de los modales estructurados con `ModalTemplate` que aplican el bloqueo del scroll del fondo inyectando `overflow: hidden` en el body de la página, `ClientFilterModal` carece de esta lógica. Cuando un cliente despliega el panel de filtros y desliza el dedo en móvil, el fondo del catálogo continúa desplazándose detrás de la interfaz, lo cual deforma la posición de la vista y empeora la usabilidad.
* **Concrete Solution:**
  Inyectar bloqueo de overflow en el body de la página al abrir y liberarlo en el desensamble del componente:
  ```diff
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  ```
