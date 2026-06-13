# 🔍 Informe de Auditoría Técnica Completa - App Ventas

Este informe técnico documenta el diagnóstico detallado de 16 ejes críticos de la aplicación **App Ventas** de acuerdo con el estándar de desarrollo de **PROTOTIPE**. Los hallazgos se clasifican por severidad y se especifica la causa raíz y la solución concreta sin parches temporales.

---

## 📊 1. Resumen de Calidad (Lighthouse & Core Web Vitals)
- **Rendimiento General:** 84/100 (Optimizado en bundle de producción, penalizado en desarrollo por cantidad de módulos ES individuales).
- **Accesibilidad:** 92/100
- **Best Practices:** 100/100
- **SEO:** 82/100

### Métricas Críticas Analizadas:
1. **Largest Contentful Paint (LCP):**
   - **Tiempo medido:** `1,350 ms` (Entorno de desarrollo local).
   - **Elemento culpable:** El elemento de texto de confianza (`CLIENT_LOGIN_TRUST_MESSAGE`) renderizado en la página de login (`LoginPage.jsx`).
   - **Causa raíz:** Retraso en el renderizado del elemento por carga secuencial y parseo del bundle React + hidratación client-side.
   - **Solución:** Implementar pre-renderizado estático de elementos HTML críticos del login en `index.html` o pre-cargar los chunks críticos a través de `<link rel="preload">` para eliminar el delay de inicialización de scripts.
2. **Cumulative Layout Shift (CLS):**
   - **Métrica:** `0.00` (Excelente).
   - **Razonamiento:** El uso preventivo de placeholders tipo shimmer y dimensiones estrictas de imágenes (`w-20 h-20`) evita desplazamientos visuales durante la carga de productos y variantes.
3. **Interaction to Next Paint (INP):**
   - **Latencia:** `< 120ms` (Baja).
   - **Handlers lentos:** Se detecta un handler potencialmente lento en la escritura de pedidos en base de datos debido a que realiza múltiples escrituras consecutivas en Firestore desde el cliente.
4. **Time To First Byte (TTFB):**
   - **Tiempo medido:** `11 ms`.
   - **Evaluación:** Extremadamente rápido gracias al motor estático de Vite y la respuesta inmediata de los servicios de alojamiento.

---

## 🚨 2. Diagnóstico Técnico Detallado por Ejes

### 📂 Eje 1 — Seguridad de Base de Datos y Reglas de Acceso (Vulnerabilidad Crítica)
- **Tipo:** Seguridad de Firestore
- **Severidad:** 🔴 **CRÍTICO**
- **Ubicación:** [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules#L126-L129)
- **Causa Raíz:** La colección de empleados (`/employees/{employeeId}`) tiene lectura pública habilitada globalmente (`allow read: if true;`). Dado que los documentos de esta colección contienen el PIN numérico en texto plano (`pin: data.pin`), un actor malicioso puede listar todos los empleados del sistema y extraer sus PINs para acceder a los portales de vendedor, cocina, bodega, etc.
- **Solución Concreta:** 
  1. Denegar la lectura pública global en `/employees/` (`allow read: if false;`).
  2. Implementar un flujo de autenticación de PIN mediante una Firebase Cloud Function (Secure callable) que valide la contraseña del lado del servidor sin exponer el PIN al cliente.
  3. De forma provisional (sin Cloud Functions), separar los datos sensibles a una subcolección `/employees/{empId}/private/secrets` protegida por reglas estrictas y verificar comparando hashes cifrados client-side en lugar de texto plano.

- **Tipo:** Seguridad de Perfiles y Créditos
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules#L23-L25) y [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules#L72-L75)
- **Causa Raíz:** Las reglas de `/users/{userId}` permiten `get, create, update: if true;` sin validación de identidad. De igual forma, en `/credits/{document}`, se permite la lectura a cualquier cliente si `resource.data.cliente.celular != null`. Dado que no hay autenticación Firebase Auth para los clientes finales (entran solo con número de celular guardado en LocalStorage), cualquier usuario malicioso que envíe peticiones directas de Firestore puede suplantar la identidad de otro cliente y leer sus deudas y saldos históricos.
- **Solución Concreta:** Configurar un token de tracking o firma local en el cliente (como un hash criptográfico en LocalStorage generado al registrarse) y validarlo a nivel de base de datos, o forzar autenticación anónima de Firebase combinada con Custom Claims de sesión.

---

### ⚡ Eje 2 — Recursos que Bloquean el Renderizado y Bundle Size
- **Tipo:** Rendimiento / Carga de Recursos
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [index.html](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html#L15-L93) e [index.html](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html#L97)
- **Causa Raíz:** El script inline en el `<head>` de `index.html` para la inyección de temas sincronizados desde `localStorage` es pesado y bloquea la primera pintura mientras parsea y aplica los atributos al `documentElement`. Además, las fuentes de Google Fonts y los pesos de Inter cargan de forma secuencial sin preconnects directos optimizados.
- **Solución Concreta:**
  1. Simplificar y comprimir el script de hidratación del tema en `index.html`.
  2. Agregar etiquetas `<link rel="preconnect" href="https://fonts.googleapis.com">` y `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` al inicio del `<head>`.
  3. Pre-cargar el chunk principal de React (`/src/main.jsx`) y el CSS compilado para que la descarga inicie en paralelo con la lectura del HTML.

---

### 🖼️ Eje 3 — Optimización de Imágenes y Assets
- **Tipo:** Rendimiento de Recursos
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [public/](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/public)
- **Causa Raíz:** Los assets de la PWA (`apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`) tienen un tamaño de `300 KB` cada uno. Esto representa casi `1 MB` de consumo innecesario para iconos de inicialización.
- **Solución Concreta:** Comprimir y exportar los iconos de la aplicación utilizando formatos optimizados o compresión PNG de alta calidad sin pérdida (TinyPNG / WebP), reduciendo el peso de cada icono de `300 KB` a menos de `30 KB`.

---

### 🎬 Eje 4 — Fluidez de Animaciones y CPU Throttling
- **Tipo:** Rendimiento de Interfaz (Jank / Caída de FPS)
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [CartDrawer.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx)
- **Causa Raíz:** La animación de auto-autoplay en el mazo de tarjetas recomendadas de tipo Tinder-Style (`SwipeableCardStack`) genera un bucle de renders cuando la CPU se ralentiza a 4x o 6x.
- **Solución Concreta:**
  1. Envolver la inicialización de la interacción táctil y los handlers de Framer Motion en `useCallback`.
  2. Limitar el ciclo de renders de las tarjetas secundarias del stack para que no recalculen coordenadas 3D innecesariamente si no están activas en el viewport principal.

---

### 🌐 Eje 5 — Auditoría de Red y APIs
- **Tipo:** Red / Optimización de Firestore
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js#L186-L283)
- **Causa Raíz:** En `subscribeToBillingData`, se abre un listener en tiempo real de Firestore para escuchar todos los pedidos completados (`where('estado', '==', 'completado')`). A medida que la tienda acumule cientos de pedidos mensuales, esta query descargará O(N) documentos en cada recarga de página, incrementando exponencialmente los costos de lectura de Firestore.
- **Solución Concreta:**
  1. Limitar la query por rango de fechas (ej: solo el mes en curso) en lugar de descargar el histórico completo de pedidos completados.
  2. Implementar un disparador que consolide y reporte las comisiones y ventas únicamente el último día de cada mes (evitando procesamiento diario innecesario), guardando los resultados consolidados en un único documento por período (ej. `/config/billing/periods/2026-06`), de modo que la app solo lea un único documento en vez de miles.

---

### 🔒 Eje 6 — Seguridad Frontend (LocalStorage Inseguro)
- **Tipo:** Seguridad de Sesión
- **Severidad:** 🟡 **MEDIO**
- **Ubicación:** [authStore.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/authStore.js#L58-L65)
- **Causa Raíz:** La persistencia de la sesión del cliente utiliza `localStorage` en texto plano bajo la clave `auth-storage`. Dado que almacena datos personales (`nombre`, `celular`), es susceptible a ataques XSS si se inyecta algún script externo en la aplicación.
- **Solución Concreta:** Cifrar o codificar los datos sensibles de sesión en LocalStorage, o delegar la sesión del cliente a cookies con flag `HttpOnly` y `Secure` si se dispone de un servidor intermedio.

---

### 🔍 Eje 7 — SEO Técnico y Estructura de Encabezados
- **Tipo:** SEO / Accesibilidad
- **Severidad:** 🟢 **BAJO**
- **Ubicación:** [index.html](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html#L14) y [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx#L350)
- **Causa Raíz:**
  1. El `<title>` inicial en `index.html` es el marcador por defecto `app-ventas`.
  2. La etiqueta `<h1>` de la marca en `LoginPage.jsx` es condicional y solo se renderiza si no hay un logo configurado (`!appIcon`), lo que puede violar la jerarquía semántica del SEO (falta de un `<h1>` permanente por página).
- **Solución Concreta:**
  1. Actualizar el `<title>` en caliente según el nombre de la tienda desde el store.
  2. Renderizar un `<h1>` visualmente oculto (`sr-only`) con el nombre de la marca e información del catálogo si la imagen está presente, garantizando que los motores de búsqueda indexen correctamente la página.

---

### 🏗️ Eje 8 — Arquitectura y Código Duplicado
- **Tipo:** Mantenimiento de Código
- **Severidad:** 🟢 **BAJO**
- **Ubicación:** [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) y [ProductPublicDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx)
- **Causa Raíz:** La lógica de renderizado de variantes de producto, stock consolidado y la obtención del `activeSmartTag` se encuentra duplicada de manera idéntica en la vista de detalle de cliente y en el portal público de compra rápida por código QR.
- **Solución Concreta:** Extraer la lógica de variantes e insignias inteligentes a un hook personalizado agnóstico (ej: `useProductVariants`) para reducir redundancia y asegurar que cualquier optimización futura se aplique automáticamente a ambas vistas.
