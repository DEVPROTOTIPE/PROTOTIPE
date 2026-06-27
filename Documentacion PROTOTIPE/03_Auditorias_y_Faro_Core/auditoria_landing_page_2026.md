# 🔍 Auditoría Técnica, SEO, CRO y Accesibilidad de Landing Page - PROTOTIPE

**Propósito:** Evaluar de forma exhaustiva la landing page de PROTOTIPE ([Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html)) para diagnosticar problemas de diseño visual (UI/UX), conversión (CRO), posicionamiento SEO, optimización de velocidad de carga (Core Web Vitals) y calidad de código, recomendando acciones de nivel Senior.

---

## 1. Resumen Ejecutivo del Estado Actual

La landing page actual de PROTOTIPE presenta una estética moderna basada en variables CSS, temas claro/oscuro (sin negros absolutos), y elementos dinámicos que causan un gran impacto visual inicial (efectos elásticos, flip 3D en testimonios y visualizadores interactivos en SVG). Asimismo, incluye herramientas avanzadas de conversión como la *Calculadora de Diagnóstico Express* y un capturador de leads intermedio para WhatsApp.

Sin embargo, desde el punto de vista de la ingeniería de software y las directrices técnicas del W3C/Google Lighthouse, el sitio sufre de **cuellos de botella críticos en rendimiento y accesibilidad**. La estructura monolítica (archivo HTML de 293 KB con más de 3,300 líneas de CSS y 1,000 de JS embebidos) bloquea la caché modular del navegador. Además, la accesibilidad (a11y) está gravemente comprometida al bloquear la selección de texto en toda la página y deshabilitar los anillos de foco visibles en la navegación por teclado. Finalmente, la experiencia del usuario se ve interrumpida por un modal agresivo al intentar iniciar conversaciones de WhatsApp.

---

## 2. Diagnóstico de Problemas por Prioridad

### 🔴 Prioridad Alta

#### 2.1. Arquitectura Monolítica y Falta de Caché Modular
* **Ubicación:** [Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) (Bloque CSS `<style>` L79-L3370 y Bloques JS L5800-L7014).
* **Causa Raíz:** Todo el código CSS y JS de interacción y animaciones está embebido directamente dentro del archivo HTML principal.
* **Impacto en Rendimiento/SEO:** 
  * Afecta negativamente al *First Contentful Paint* (FCP) y *Largest Contentful Paint* (LCP). El navegador debe parsear un HTML gigante (293 KB) antes de renderizar la primera vista de la pantalla.
  * Impide el almacenamiento en caché independiente. Cualquier cambio mínimo en un estilo CSS o en un string JS obliga a los usuarios a volver a descargar todo el código base de la landing page.
  * Incrementa la dificultad de mantenimiento técnico y el control de versiones.
* **Recomendación:** Desacoplar el código en archivos independientes:
  1. Extraer los estilos a `/styles.css` (cargándolos de manera asíncrona excepto el CSS crítico para el Hero).
  2. Extraer el JavaScript interactivo a `/app.js` (cargándolo con el atributo `defer` al final de la página).

#### 2.2. Destrucción de la Navegación Accesible (Foco Invisible)
* **Ubicación:** [Index.html: L129](file:///d:/PROTOTIPE/LandingPage/Index.html#L129), [L191-L195](file:///d:/PROTOTIPE/LandingPage/Index.html#L191-L195)
* **Causa Raíz:** Uso generalizado de `outline: none !important` y `box-shadow: none !important` en los selectores globales y en los estados `:focus` y `:focus-visible` de botones, enlaces y menús interactivos.
* **Impacto en Accesibilidad/SEO:** 
  * Violación crítica del criterio WCAG 2.4.7 (Foco Visible). Los usuarios con discapacidades motoras o visuales que navegan la web mediante el teclado (tecla `Tab`) no pueden ver en qué elemento activo (botón, enlace, menú) están situados.
  * Afecta negativamente la puntuación de Accesibilidad de Google Lighthouse y puede penalizar el posicionamiento orgánico en buscadores.
* **Recomendación:** Eliminar la anulación de foco global e implementar un anillo de enfoque accesible, limpio y consistente con la identidad de marca:
  ```css
  *:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  ```

#### 2.3. Secuestro e Inhabilitación de Selección de Texto
* **Ubicación:** [Index.html: L162-L167](file:///d:/PROTOTIPE/LandingPage/Index.html#L162-L167)
* **Causa Raíz:** Declaración de la regla global `user-select: none !important` a todos los elementos del DOM (excepto inputs y textareas).
* **Impacto en UX/Accesibilidad:**
  * Frustra al usuario promedio al impedir copiar datos útiles (como correos, teléfonos de contacto o el nombre del servicio).
  * Inutiliza las extensiones de traducción del navegador y rompe la compatibilidad con ciertas tecnologías asistenciales y lectores de pantalla.
* **Recomendación:** Eliminar por completo esta regla CSS. No existe justificación técnica para secuestrar el cursor y la selección de texto en un sitio web de información comercial.

#### 2.4. Fricción y Bloqueo de Conversión (Modal de Leads Agresivo)
* **Ubicación:** [Index.html: L6832-L6846](file:///d:/PROTOTIPE/LandingPage/Index.html#L6832-L6846)
* **Causa Raíz:** Un script intercepta todos los clics dirigidos a WhatsApp (`api.whatsapp.com` o `wa.me`) para desplegar obligatoriamente un modal de captura de leads antes de permitir la redirección.
* **Impacto en Conversión (CRO):**
  * Alta tasa de abandono. El usuario pulsa un botón esperando una comunicación rápida y directa y se encuentra con una barrera inesperada pidiendo datos personales (nombre, teléfono y correo).
  * Reduce la confianza al forzar la entrega de datos de contacto bajo una promesa de comunicación por chat que ya incluye el número de teléfono implícitamente.
* **Recomendación:** 
  * Cambiar a un modelo transparente: Informar en el botón del CTA que se solicitará información básica (ej. "Agenda tu asesoría completando tus datos").
  * Opcionalmente, agregar un botón de "Saltar registro y chatear directo" en el modal para no bloquear al usuario decidido a conversar.

---

## 3. Diagnóstico de Problemas por Prioridad

### 🟡 Prioridad Media

#### 2.5. Desalineación e Ineficiencia del Service Worker (Pre-cache Erróneo)
* **Ubicación:** [sw.js: L5](file:///d:/PROTOTIPE/LandingPage/sw.js#L5) vs [Index.html: L64](file:///d:/PROTOTIPE/LandingPage/Index.html#L64)
* **Causa Raíz:** El Service Worker intenta precargar y cachear en el cliente una URL de Google Fonts con las fuentes `Outfit` y `Plus Jakarta Sans`. Sin embargo, el HTML real de la landing page carga e implementa `Outfit` e `Inter`.
* **Impacto en Rendimiento/Datos:**
  * Desperdicio de ancho de banda del usuario al descargar y almacenar fuentes que el sitio web jamás renderizará.
  * La tipografía de cuerpo real (`Inter`) no se cachea en el Service Worker, perdiendo los beneficios de la optimización offline de la PWA.
* **Recomendación:** Sincronizar la URL de fuentes en `sw.js` para que coincida exactamente con la URL cargada en el `<head>` del HTML:
  ```javascript
  // En sw.js
  const ASSETS = [
    '/',
    '/Index.html',
    '/css/styles.css',
    '/js/app.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap'
  ];
  ```

#### 2.6. Saturación del Main Thread por Canvas Particle Loop
* **Ubicación:** [Index.html: L5829-L5921](file:///d:/PROTOTIPE/LandingPage/Index.html#L5829-L5921)
* **Causa Raíz:** Ejecución continua de la animación de partículas mediante un bucle de Canvas que corre a 60fps en el hilo de renderizado principal, evaluando distancias de partículas con algoritmos cuadráticos $O(N^2)$.
* **Impacto en Rendimiento/Core Web Vitals:**
  * Afecta a la métrica *Interaction to Next Paint* (INP) debido al consumo constante de CPU en el hilo principal mientras el usuario está en el Hero.
  * Causa micro-stuttering (lag visual) y jank de scroll en dispositivos móviles de gama media o baja.
* **Recomendación:** 
  * Disminuir el conteo de partículas en pantallas móviles mediante condicionales de ancho de ventana (`window.innerWidth < 768`).
  * Simplificar o apagar el renderizado interactivo del Canvas en dispositivos móviles, donde el renderizado de GPU consume batería excesiva y no aporta valor real al no haber interacción con el cursor táctil (mousemove no aplica a pantallas táctiles).

#### 2.7. Jerarquía Semántica y Densidad de Palabras Clave SEO
* **Ubicación:** [Index.html: L3435](file:///d:/PROTOTIPE/LandingPage/Index.html#L3435)
* **Causa Raíz:** El encabezado principal H1 es `"Organiza tu negocio con herramientas diseñadas para la forma en que realmente trabajas."`. No contiene palabras clave estratégicas de alta intención de búsqueda en la parte inicial.
* **Impacto en SEO Orgánico:**
  * Reducción de la relevancia en el rastreo web de buscadores para búsquedas como "software para negocios", "aplicaciones personalizadas" o "desarrollo de sistemas a medida".
* **Recomendación:** Reestructurar el encabezado H1 para inyectar semántica directa:
  ```html
  <h1>Software a la medida y aplicaciones personalizadas para organizar tu negocio</h1>
  ```
  O inyectar el copy comercial como H1 secundario/subtítulo, optimizando la jerarquía SEO de etiquetas h2 y h3.

---

### 🟢 Prioridad Baja

#### 2.8. Ausencia de Imágenes Reales en Formatos Modernos (Next-Gen)
* **Ubicación:** General.
* **Causa Raíz:** La página no cuenta con etiquetas `<img>` de capturas o dashboards reales. Depende en un 100% de ilustraciones vectoriales en formato SVG y de caracteres de emojis.
* **Impacto en SEO/Confianza:**
  * Impide el posicionamiento del sitio en el buscador de imágenes (Google Images).
  * Reduce la prueba social al no mostrar imágenes tangibles de cómo se ven y funcionan las aplicaciones reales de PROTOTIPE en un dispositivo móvil.
* **Recomendación:** Guardar capturas de dashboards premium del sistema (comprimidas en WebP/AVIF) y añadirlas en la sección de "Así se ve un negocio organizado", implementando atributos `alt` descriptivos de alta calidad.

#### 2.9. Mezcla Lingüística de Textos en Código
* **Ubicación:** Tooltips y Badges ([Index.html: L3475](file:///d:/PROTOTIPE/LandingPage/Index.html#L3475), [L3503](file:///d:/PROTOTIPE/LandingPage/Index.html#L3503)).
* **Causa Raíz:** Uso de términos como `"LIVE"` en las píldoras del dashboard SVG y placeholder de `"value"` en los tooltips interactivos dentro de los scripts.
* **Impacto en UX:**
  * Aunque es un detalle menor, rompe la consistencia lingüística en una landing dirigida 100% a pequeños negocios en Latinoamérica.
* **Recomendación:** Traducir las cadenas internas: cambiar `"LIVE"` por `"EN VIVO"` y `"value"` por el formateo de moneda correspondiente de forma dinámica en JS.

---

## 3. Propuesta de Optimización y Refactorización

Para llevar la landing page a un estándar Senior premium y eliminar los cuellos de botella de rendimiento, se propone estructurar la carpeta `/LandingPage` con la siguiente arquitectura distribuida y limpia:

```
LandingPage/
├── index.html          # Marcado HTML5 semántico puro (sin scripts pesados ni CSS inline)
├── sw.js               # Service Worker corregido con caché de fuentes reales
├── css/
│   └── styles.css      # Hoja de estilos global modular y optimizada (con estilos a11y)
└── js/
    └── app.js          # Scripts lógicos de las 10 animaciones y calculadora express
```

### Plan de Desacoplamiento de Código

1. **index.html:**
   * Limpiar la cabecera `<head>` removiendo el bloque de estilos de 3200 líneas y referenciando a `css/styles.css` mediante `<link rel="stylesheet" href="css/styles.css">`.
   * Mover las fuentes e inicialización del tema a un script síncrono mínimo inline para evitar flashes visuales de cambio de tema (FOUC).
   * Al final del `<body>`, añadir `<script src="js/app.js" defer></script>`.

2. **styles.css:**
   * Almacenar todas las variables, estilos del modo claro/oscuro y de componentes.
   * Eliminar la regla global de secuestro de selección (`user-select: none`).
   * Añadir estilos semánticos y visibles de foco para navegación de teclado.

3. **app.js:**
   * Consolidar el inicializador de partículas del Canvas y limitar el loop en dispositivos móviles con anchos menores a 768px.
   * Centralizar los IntersectionObservers de animaciones (`reveal`, `typewriter`, `stagger-in`) para reutilizar recursos.
   * Actualizar la lógica del modal de leads para incluir un botón que permita saltar el formulario de captura e ir directo a WhatsApp.

---

## 4. Lista Final de Acciones de Implementación Ordenadas por Prioridad

| # | Acción de Optimización | Categoría | Prioridad | Criterio de Verificación |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Retirar `user-select: none !important` de las hojas de estilo globales para devolver el control al navegador. | Accesibilidad / UX | **Alta** | Verificación manual de que el texto de soporte e información comercial pueda seleccionarse y copiarse. |
| **2** | Eliminar la anulación global de foco (`outline: none`) y habilitar el estilo `:focus-visible` responsivo y visual. | Accesibilidad (a11y) | **Alta** | Probar la navegación de toda la landing con la tecla `Tab` verificando el halo de foco de color azul/marca. |
| **3** | Modificar la intercepción del formulario de leads en WhatsApp para incluir un botón secundario que permita omitir el registro. | CRO / UX | **Alta** | Presionar un enlace de WhatsApp y verificar que el modal muestre la opción "Saltar e ir directo". |
| **4** | Desacoplar el archivo `Index.html` moviendo los bloques CSS y JS a archivos independientes (`css/styles.css` y `js/app.js`). | Rendimiento / Clean Code | **Alta** | Comprobar que no haya código de diseño o de interacción incrustado en el HTML. Probar compilación. |
| **5** | Sincronizar las URLs de Google Fonts de `Index.html` con las declaradas en el Service Worker (`sw.js`). | Rendimiento / PWA | **Media** | Inspeccionar en la consola de Network que el Service Worker cachee la tipografía `Inter` y no intente cargar `Plus Jakarta Sans`. |
| **6** | Reducir el conteo de partículas del Canvas en móviles de 40 a 0 (desactivar loop) para evitar estrangular la CPU en smartphones. | Rendimiento / CPU | **Media** | Probar el rendimiento en móviles monitoreando que la GPU/CPU no se sature al cargar la cabecera. |
| **7** | Optimizar los encabezados principales (H1) en base a keywords de búsqueda para potenciar la indexación orgánica. | SEO Técnico | **Media** | Validar la estructura del árbol de encabezados con extensiones de SEO (Screaming Frog o Lighthouse). |
| **8** | Traducir las fugas del idioma inglés en los badges ("LIVE") y placeholders internos ("value" en tooltip) al español. | UI/UX / Calidad | **Baja** | Inspección visual en el hero del badge interactivo del mini-dashboard. |
