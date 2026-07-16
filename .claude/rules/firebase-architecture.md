# Arquitectura de Persistencia, Resiliencia y Seguridad Firebase

Este conjunto de reglas rige el diseño de arquitectura, la persistencia, la concurrencia, la resiliencia y las políticas de seguridad de Firebase en todo el monorepo.

## 1. ESTÁNDAR DE ARQUITECTURA DESACOPLADA Y RESILIENCIA FIREBASE (OBLIGATORIO)

Para garantizar la mantenibilidad y modularidad de las aplicaciones a largo plazo, se establece el siguiente estándar obligatorio de arquitectura desacoplada, gobernanza de concurrencia y resiliencia de datos:

### 1.1 Arquitectura de 3 Capas para Firebase (Feature-Sliced Design / Clean Architecture)
- **Repository:** Capa de infraestructura física. Contiene conectores exclusivos de Firebase SDK. Retorna promesas de JS o payloads planos. Queda estrictamente prohibido instanciar o invocar operaciones CRUD directas en componentes de React.
- **Service (UseCase):** Capa de dominio y lógica de negocio. Valida inputs con esquemas (Zod/JS), ejecuta orquestación y transformaciones.
- **Hook de Adaptación (UI State):** Capa reactiva que expone datos y acciones. Consume la capa de servicios e interactúa con el Registry de realtime.
- **Garantía de Contratos:** El dominio debe hablar en términos semánticos de entidades (ej: `Product`, `Order`, `BrandTheme`), no en términos de infraestructura Firebase (ej: no usar `DocumentSnapshot`, `QueryDocumentSnapshot`).

### 1.2 Gobernanza de Listeners en Tiempo Real (onSnapshot)
- **Evitación de Listeners Duplicados — `DEFERRED_UNTIL_MEASURED_NEED` (CORE-345, 2026-07-15):** el `RealtimeQueryRegistry` (queryHash, refCount y subscribers) descrito abajo **no existe en ningún código del monorepo** (verificado por búsqueda exhaustiva: 0 resultados en código, 16 solo en documentación). Se marca explícitamente diferido en vez de mantenerlo como exigencia sin evidencia: no hay medición de costo real por lecturas Firestore duplicadas en esta etapa (pre-clientes pagos, bajo tráfico). Criterio de reactivación: medir lecturas Firestore duplicadas por listeners concurrentes antes de construir el registry. Hasta entonces, cada Repository puede exponer `subscribeToX(...)` directo (ver `ADR-0001-arquitectura-canonica-por-capas.md` §13 y patrón real en `CustomerLoyaltyRepository.subscribeToAccount`), consumido por un único Hook por dato — sin registry compartido. Descripción original del requisito (no implementada, conservada como referencia de diseño si se reactiva): se prohíbe abrir `onSnapshot` directamente dentro de múltiples hooks o componentes concurrentes; se debe emplear un registry observable compartido (`RealtimeQueryRegistry` con queryHash, refCount y subscribers) para evitar cobros de lecturas Firestore redundantes.
- **Pre-requisito Auth con queryKey parametrizada:** Todo listener activo debe requerir de forma obligatoria sesión de Auth activa y su `queryKey`/`queryHash` debe parametrizarse obligatoriamente con el identificador del contexto (`uid`, `tenantId`, `brandId`, `role` y filtros de búsqueda) para mitigar fugas de datos y race conditions.
- **Idempotencia contra StrictMode:** Debido a los montajes dobles de React StrictMode en desarrollo, el desmonte del listener debe ser 100% idempotente basado en `refCount`, asegurando que no ocurra un `unsubscribe` prematuro si hay otros suscriptores activos.

### 1.3 Caché Local Offline, Zustand y TanStack Query
- **Activación de Persistencia Local:** Es obligatorio inicializar la persistencia offline en el cliente Firestore configurando `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` para permitir transiciones sin conexión elásticas.
- **Zustand vs TanStack Query:**
  - **Zustand:** Exclusivo para estados UI/Locales (drawer abierto, modal, filtros activos, sesión derivada).
  - **TanStack Query (Persistido con IndexedDB):** Fuente primaria para hidratación, caché de red y listados. Úsenlo para hidratar las pantallas antes de que se conecte el listener realtime, evaluando la metadata del snapshot (`fromCache` y `hasPendingWrites`) para control de sincronización.
  - **Prohibición de localStorage para Persistencia:** Queda estrictamente prohibido usar localStorage para almacenar colas offline de operaciones (outbox), datos de auditoría local, telemetría o tablas transaccionales. Se debe utilizar exclusivamente Dexie.js / IndexedDB para asegurar transacciones atómicas de almacenamiento, evitar race conditions y soportar grandes volúmenes de datos.

### 1.4 Concurrencia y Transacciones Firestore
- Inventarios, saldos de crédito, contadores y cambios de estado de orden son considerados **documentos calientes**. Queda prohibido actualizarlos usando escrituras directas desde el cliente. Deben realizarse exclusivamente a través de transacciones concurrentes robustas (`runTransaction`) para mitigar fallas por concurrencia optimista (`ABORTED`).

### 1.5 Carga Progresiva Resiliente (Skeletons contra Layout Shift)
- Ninguna vista dinámica debe cargar datos asíncronos mostrando únicamente pantallas en blanco o spinners toscos que alteren la geometría del diseño al renderizar.
- Se deben emplear obligatoriamente componentes de tipo *Skeleton* con animación de shimmer lineal (`ProductCardSkeleton`, `OrderTrackingSkeleton`) que respeten las dimensiones exactas del componente real final.

### 1.6 API Pública Modular (Feature Gatekeeper) y Restricciones ESLint
- Cada feature expone sus entrypoints en un archivo `index.js`.
- Se prohíben las importaciones profundas desde otros módulos (ej. prohibido: `import X from '@/features/Y/components/Z'`).
- **Restricciones de Pre-commit (AST y Linter):**
  - Prohibir `<select>` nativos de HTML en favor de `CustomSelect.jsx`.
  - Prohibir onSnapshot/getDocs/setDoc/etc. fuera de la carpeta `/repositories`.
  - Prohibir clases dinámicas construidas (`className={bg-${color}-...}`) ya que Tailwind exige clases estáticas completas legibles en código fuente para ser empaquetadas.
  - Exigir `useAlertConfirm` en acciones destructivas.
  - Exigir queryKeyFactory tipada por feature.

---

## 2. ESTÁNDAR DE SEGURIDAD Y GOBERNANZA DE FIREBASE (OBLIGATORIO)

Para garantizar la estabilidad presupuestaria (costo $0 USD) y la robustez transaccional de PROTOTIPE, todo agente IA debe obedecer estrictamente las siguientes directivas de seguridad, API y base de datos:

### 2.1 Prohibición Absoluta de Cloud Functions (DEC-006)
- **Directiva:** Queda estrictamente prohibido al agente proponer, codificar, inicializar o desplegar servicios basados en Firebase Cloud Functions en entornos de desarrollo, staging o producción.
- **Razón:** Toda lógica operativa debe resolverse del lado del cliente (React) o mediante el motor local del CLI Bridge. Los reportes de telemetría y cobros mensuales deben persistirse de forma directa a Firestore Central (`reportesBilling` y `app_failures`) a través de `centralFirebaseService.js`, apuntando localmente en modo desarrollo a `http://localhost:3001` únicamente para diagnósticos visuales.

### 2.2 Preflight Check y Control CORS en Storage (DEC-003 y DEC-005)
- **Storage Preflight Check:** Antes de inyectar o compilar componentes que requieran subida de imágenes o adjuntos (como selectores de productos, firmas digitales, mermas con fotos), la IA debe validar preventivamente la disponibilidad y permisos del bucket del cliente mediante peticiones HTTP HEAD silenciosas y seguras. Si el bucket no responde, se debe suspender la acción y notificar al usuario.
- **Configuración CORS Resiliente:** En scripts del CLI que configuren buckets, se debe automatizar la inyección CORS vía `gsutil` soportando tanto el bucket `.appspot.com` principal como el fallback `.firebasestorage.app`. El JSON exacto de la política CORS obligatoria que se debe inyectar es:
  ```json
  [
    {
      "origin": ["*"],
      "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "responseHeader": ["Content-Type", "Authorization", "x-goog-meta-filename", "x-goog-meta-uuid"],
      "maxAgeSeconds": 3600
    }
  ]
  ```

### 2.3 Restricción Estricta RBAC de Escrituras (Firestore y Storage)
- **Regla Firestore de Acceso Admin:** Todo flujo administrativo sensible (eliminar registros, purgar logs, modificar saldos base de clientes) debe exigir de forma mandatoria que el `uid` autenticado del usuario exista en el documento `/users/{uid}` con el atributo exacto `role: 'admin'`. No se permite confiar en parámetros o banderas booleanas del lado del cliente.
- **Regla Storage de Acceso Admin:** Se prohíbe el uso de políticas de Storage abiertas del tipo `allow write: if request.auth != null;` para directorios sensibles del sistema (ej: carpetas de configuración, logos de marca, recursos del core). La subida a estas ubicaciones requiere obligatoriamente verificar el rol admin mediante un cruce de reglas físicas Firestore (ej. `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`).

### 2.4 Privacidad y Aislamiento Multitenant (clientes_control)
- **Directiva:** Queda terminantemente prohibido configurar reglas de Firestore Central abiertas del tipo `allow read: if true;` sobre colecciones multitenant críticas como `/clientes_control/`.
- **Implementación Física:** El acceso a la telemetría, facturación y esquemas de HSL de cada cliente se debe restringir a nivel de base de datos obligando a que la consulta valide de forma atómica:
  1. El ID del cliente (`clientId`).
  2. El token secreto del desarrollador (`telemetryToken`).
  Ninguna aplicación cliente debe poder listar transversalmente registros de otros inquilinos.
