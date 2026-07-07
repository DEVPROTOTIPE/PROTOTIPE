# Catálogo de Estilos Visuales Estandarizados (UI/UX)

Este catálogo documenta las firmas visuales, estructuras responsivas y clases de referencia de los estilos de diseño aprobados en el ecosistema **PROTOTIPE**. Sirve como guía de contexto para replicar y adaptar layouts de forma consistente en cualquier módulo o vista de la aplicación.

---

## 🎨 Estilos Registrados

### 1. Estilo Financiero "Wallet" (FinTech Style)
* **Esencia:** Panel con cabecera curva elástica, solapamiento de contenedores de balance y carrusel elástico de tarjetas edge-to-edge.
* **Componentes Visuales:**
  * **Header Hero:** Banner superior con degradado elástico del tema (`bg-gradient-to-br from-primary to-primary-dark`) y círculos de luz transparentes (`bg-white/5 blur-3xl`). Curvatura inferior grande: `rounded-b-[40px] md:rounded-b-[50px]`.
  * **Solape Flotante:** Contenedor de balances principales con margen negativo (`-mt-12`) para solapar la cabecera.
  * **Carrusel Elástico Responsivo:** 
    * *Móviles:* Desplazamiento horizontal de borde a borde físico expandido (`-mx-4 px-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4`).
    * *Desktop:* Rejilla estática con desbordamiento libre (`md:grid md:overflow-visible md:mx-0 md:px-0`) para evitar cortes de sombras en hover.
  * **Tarjetas Wallet:**
    * *Tarjeta Principal:* Color de marca completo (`bg-gradient-to-br from-primary to-primary-dark text-white`).
    * *Tarjetas Secundarias:* Base neutra (`bg-surface border border-app text-app`) con badges e iconos en colores pastel translúcidos (`bg-color/10 text-color border-color/15`) acordes a su función.
* **Casos de Uso Ideales:** Inicio del Administrador, inicio de portales de empleados, resumen de cuenta del cliente y dashboards financieros.

### 2. Estilo Vidrio Esmerilado (Glassmorphism & Overlays)
* **Esencia:** Tarjetas y modales que flotan sobre el contenido utilizando opacidades bajas, bordes finos de alta fidelidad y desenfoque de fondo.
* **Componentes Visuales:**
  * **Contenedor:** Fondos con opacidad y desenfoque (`bg-surface/75 backdrop-blur-md` o `bg-white/10 dark:bg-black/20`).
  * **Bordes Premium:** Bordes de baja opacidad adaptativos (`border border-white/20` o `border-primary/10`).
  * **Sombras:** Sombras muy difusas y de gran radio (`shadow-2xl` o `shadow-primary/5`).
  * **Bloqueo de Scroll:** Integración del cleanup `document.body.style.overflow = ''` al desmontar para evitar que la página de fondo se congele.
* **Casos de Uso Ideales:** Modales de Checkout, selectores de fecha/mesas, vistas de filtros rápidos, toasts y diálogos de confirmación.

### 3. Estilo Comanda Asimétrica (Asymmetric Card Style)
* **Esencia:** Tarjetas planas horizontales optimizadas para lectura rápida de flujos de trabajo sin recuadros toscos.
* **Componentes Visuales:**
  * **Estructura:** Layout horizontal dividido en 3 secciones (Badge destacado a la izquierda, lista limpia en el centro con bullets pastel, acción compacta/botón a la derecha).
  * **Eliminación de Recuadros:** Ausencia de bordes internos oscuros en favor de fondos limpios (`bg-surface-2/30`) y espaciados amplios.
  * **Acciones:** Botones de acción contextuales que ocultan textos secundarios en dispositivos móviles para optimizar el área de contacto táctil.
* **Casos de Uso Ideales:** Panel de pedidos listos, comandas de cocina/bar, listados de envíos de mensajeros y terminales POS rápidos.

---

## ⚙️ Reglas de Replicación
* **Adaptación al Tema HSL:** Nunca uses colores de degradado estáticos (ej: `from-indigo-500 to-purple-600`) para elementos principales. Utiliza siempre variables dinámicas de Tailwind (`from-primary to-primary-dark`).
* **Control de Hover:** Los elementos interactivos en computadoras deben tener animaciones de escala controladas (`hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`).
* **Preservación:** Al rediseñar una vista a un estilo determinado, está prohibido suprimir inputs, botones o telemetría; todo elemento debe ser reubicado adaptativamente.
