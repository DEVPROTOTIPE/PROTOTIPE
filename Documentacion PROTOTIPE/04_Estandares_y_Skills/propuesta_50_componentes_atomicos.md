# 💎 Catálogo de 50 Componentes Atómicos Premium e Interactivos
## Biblioteca de Referencia Visual y UX — Ecosistema PROTOTIPE

Este documento sirve como biblioteca maestra de patrones interactivos premium inspirados en los repositorios de UI más relevantes de la actualidad (Aceternity UI, Magic UI, Hover.dev, Shadcn UI y UI Labs). Está diseñado bajo el estándar de **Átomo Puro**: componentes indivisibles, reutilizables en cascada, de comportamiento visual mínimo, y con lógica de estado local encapsulada.

### Estándares Técnicos Requeridos
1. **React**: Implementación funcional stateless o con estado local mínimo (`useState`, `useRef`).
2. **Tailwind CSS**: Uso de variables semánticas HSL (`var(--color-primary)`, `var(--color-surface)`, etc.) para modo claro/oscuro y bordes.
3. **Framer Motion**: Animaciones fluidas, físicas elásticas (spring) y control de eventos de cursor (`whileHover`, `whileTap`, `layout`).

---

## 📂 1. Inputs y Captura de Datos Premium

### 1. Entrada de Pin Código (PinCodeInput)
*   **Comportamiento e Interacción:** Entrada estructurada de 4 o 6 caracteres numéricos. Al enfocar, el cajón activo muestra un borde iluminado con un glow difuminado HSL. Al escribir, el dígito se desliza verticalmente con un efecto de rebote elástico.
*   **Física/Animación Framer Motion:**
    *   Entrada de dígito: `initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}`
*   **Tailwind CSS:** `flex gap-2 justify-center [&>input]:w-12 [&>input]:h-14 [&>input]:text-center [&>input]:text-lg [&>input]:font-bold [&>input]:rounded-xl [&>input]:border [&>input]:border-[var(--color-border)] [&>input]:bg-[var(--color-surface)] [&>input]:focus:border-[var(--color-primary)] [&>input]:focus:ring-4 [&>input]:focus:ring-[var(--color-primary)]/20 [&>input]:transition-all`
*   **Caso de Uso Real:** Confirmación de despacho por parte del repartidor o PIN de desbloqueo de caja diaria en el POS para la vertical de *Minimarkets y Alimentos (`grocery_food`)*.

### 2. Input con Foco Magnético y Glow HSL (MagneticGlowInput)
*   **Comportamiento e Interacción:** El input posee un sutil contorno degradado. Al mover el cursor cerca del input (dentro de un radio de 60px), el contorno y un degradado radial (glow) siguen la posición X del ratón. Al enfocar, el glow se expande uniformemente de fondo.
*   **Física/Animación Framer Motion:**
    *   Glow dinámico usando variables de movimiento vinculadas a eventos de puntero (`useMotionValue`, `useSpring`).
*   **Tailwind CSS:** `relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none [&_div]:absolute [&_div]:inset-[-1px] [&_div]:rounded-xl [&_div]:bg-gradient-to-r [&_div]:from-[var(--color-primary)]/50 [&_div]:to-[var(--color-secondary)]/50 [&_div]:opacity-0 [&_div]:hover:opacity-100 [&_div]:focus-within:opacity-100 [&_div]:transition-opacity [&_div]:z-[-1]`
*   **Caso de Uso Real:** Buscador rápido de refacciones pesadas o compatibilidad de roscas en la vertical de *Tornerías y Mecanizado de Precisión (`technical_services`)*.

### 3. Input de Desaparición de Marcador (PlaceholderVanishInput)
*   **Comportamiento e Interacción:** Inspirado en Aceternity. Al presionar enter o escribir, el texto del placeholder se desintegra en partículas que flotan hacia arriba y se desvanecen. Si se limpia el input, el placeholder reaparece de manera elástica cayendo desde la parte superior.
*   **Física/Animación Framer Motion:**
    *   Particulación simulada mediante Canvas o texto animado staggered: `animate={{ y: -10, opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}`
*   **Tailwind CSS:** `w-full bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all`
*   **Caso de Uso Real:** Input de búsqueda principal en catálogo móvil de la vertical de *Ropa y Retail Tradicional (`retail_clothing`)*.

### 4. Input con Borde de Haz Animado (BorderBeamInput)
*   **Comportamiento e Interacción:** El input cuenta con un haz de luz de alta intensidad (glow degradado) que viaja continuamente a lo largo de su perímetro exterior. Al hacer focus, el haz se detiene, cambia de color al primario de la marca y duplica su brillo.
*   **Física/Animación Framer Motion:**
    *   Rotación infinita del degradado de máscara: `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}`
*   **Tailwind CSS:** `relative overflow-hidden rounded-xl bg-[var(--color-surface)] p-[1px] [&_input]:w-full [&_input]:rounded-[11px] [&_input]:bg-[var(--color-surface)] [&_input]:px-4 [&_input]:py-3 [&_input]:text-[var(--color-text)] [&_input]:outline-none`
*   **Caso de Uso Real:** Input de código de cupón de descuento especial en checkout de la vertical de *Alimentos Artesanales y Repostería (`alimentos-artesanales`)*.

### 5. Input Numérico Deslizable (SliderNumericInput)
*   **Comportamiento e Interacción:** Campo de entrada numérico combinado con un dial táctil invisible. Al mantener presionado y arrastrar lateralmente sobre el campo, el valor aumenta o disminuye linealmente con respuesta inercial y cambio de color del texto.
*   **Física/Animación Framer Motion:**
    *   Arrastre de mouse/touch (`drag="x" dragConstraints={{ left: 0, right: 0 }}`) para rastrear deltas: `whileTap={{ scale: 0.98 }}`
*   **Tailwind CSS:** `relative select-none cursor-ew-resize border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] py-2.5 px-4 text-center font-semibold text-[var(--color-text)] focus-within:border-[var(--color-primary)]`
*   **Caso de Uso Real:** Selector de cantidad de metros o pulgadas de alambre en la vertical de *Ferretería y Construcción Rural (`ferreteria-rural`)*.

### 6. Campo OTP con Autotransición (SmartOtpInput)
*   **Comportamiento e Interacción:** Secuencia de inputs individuales para claves dinámicas. Si el usuario copia un código de 6 dígitos del portapapeles, el componente intercepta el pegado, distribuye las cifras automáticamente y realiza un destello verde de validación.
*   **Física/Animación Framer Motion:**
    *   Destello de validez: `animate={{ scale: [1, 1.05, 1], borderColor: ["var(--color-border)", "#22c55e", "var(--color-border)"] }} transition={{ duration: 0.5 }}`
*   **Tailwind CSS:** `flex gap-2 justify-center [&_input]:w-10 [&_input]:h-12 [&_input]:rounded-lg [&_input]:border [&_input]:border-[var(--color-border)] [&_input]:text-center [&_input]:bg-[var(--color-surface-2)] [&_input]:focus:border-[var(--color-primary)]`
*   **Caso de Uso Real:** Validación de retiro sin tarjeta o retiro de pedidos en tienda en la vertical de *Calzado y Confección Local (`moda-local-calzado`)*.

### 7. Input de Selección de Chip Integrado (InlineChipPickerInput)
*   **Comportamiento e Interacción:** Input de texto que autocompleta tags/chips. Al presionar coma o enter, la palabra escrita se encoge y se transforma en un chip interactivo con animación elástica hacia el inicio del input, recorriendo el cursor a la derecha.
*   **Física/Animación Framer Motion:**
    *   Inyección de chip: `initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} layout transition={{ type: "spring", stiffness: 400, damping: 20 }}`
*   **Tailwind CSS:** `flex flex-wrap gap-1.5 items-center border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] p-2 focus-within:border-[var(--color-primary)] [&_input]:flex-1 [&_input]:bg-transparent [&_input]:outline-none [&_input]:px-2 [&_input]:py-1`
*   **Caso de Uso Real:** Input para registrar alérgenos o ingredientes adicionales de un pastel en la vertical de *Alimentos Artesanales y Repostería (`alimentos-artesanales`)*.

---

## 📂 2. Botones, Switches y Triggers Interactivos

### 8. Botón Magnético de Paralaje (MagneticParallaxButton)
*   **Comportamiento e Interacción:** Al acercar el cursor a un radio de 45px, el botón se desplaza magnéticamente hacia el puntero. Además, el texto dentro del botón se mueve a la mitad de la velocidad del contenedor, creando un efecto de paralaje 3D de profundidad.
*   **Física/Animación Framer Motion:**
    *   Cálculo de vector de proximidad y spring dinámico: `transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.8 }}`
*   **Tailwind CSS:** `relative rounded-full bg-[var(--color-primary)] !text-white px-8 py-3.5 font-semibold shadow-lg shadow-[var(--color-primary)]/20 overflow-hidden`
*   **Caso de Uso Real:** Botón principal de "Agendar Cita" o "Reservar Turno" en la vertical de *Estética, Podología y Bienestar (`wellness_podology`)*.

### 9. Botón con Efecto de Brillo Líquido (LiquidGlowButton)
*   **Comportamiento e Interacción:** Botón con relleno oscuro. Al hacer hover, un gradiente líquido brillante emerge desde el centro y se expande de forma fluida hacia los bordes, adaptándose a las esquinas redondeadas con un efecto viscoso.
*   **Física/Animación Framer Motion:**
    *   Control de escala del gradiente de fondo: `whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}`
*   **Tailwind CSS:** `relative overflow-hidden rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] px-6 py-3 text-[var(--color-text)] hover:text-white transition-colors [&_.liquid]:absolute [&_.liquid]:inset-0 [&_.liquid]:bg-gradient-to-tr [&_.liquid]:from-[var(--color-primary)] [&_.liquid]:to-[var(--color-secondary)] [&_.liquid]:scale-0 [&_.liquid]:hover:scale-150 [&_.liquid]:transition-transform [&_.liquid]:duration-500 [&_.liquid]:z-[-1]`
*   **Caso de Uso Real:** Botón de "Pagar Factura" o "Confirmar Orden" en la vertical de *Insumos Horeca B2B (`distribucion-horeca`)*.

### 10. Botón con Efecto de Haz de Borde (BorderBeamButton)
*   **Comportamiento e Interacción:** Botón minimalista transparente. Al hacer hover, un rayo brillante de luz neón corre rápidamente alrededor del contorno del botón. Al hacer clic, el botón hace un destello radial y una micro-escala elástica.
*   **Física/Animación Framer Motion:**
    *   Haz de luz rotativo: `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}`
    *   Tap: `whileTap={{ scale: 0.96 }}`
*   **Tailwind CSS:** `relative p-[1px] overflow-hidden rounded-xl bg-transparent [&_span]:block [&_span]:rounded-[11px] [&_span]:bg-[var(--color-surface)] [&_span]:px-5 [&_span]:py-2.5 [&_span]:text-sm [&_span]:font-medium [&_span]:text-[var(--color-text)]`
*   **Caso de Uso Real:** Llamada a la acción secundaria para "Ver Detalles Técnicos" en la vertical de *Tornerías y Mecanizado de Precisión (`technical_services`)*.

### 11. Switch de Palanca Elástica (ElasticToggleSwitch)
*   **Comportamiento e Interacción:** Switch de estado lógico. La perilla interior no solo se desliza lateralmente, sino que se estira y deforma (squash and stretch) de forma elástica durante la transición antes de asentarse en la nueva posición.
*   **Física/Animación Framer Motion:**
    *   Estiramiento del slider: `animate={{ x: checked ? 20 : 0, scaleX: [1, 1.3, 1] }} transition={{ type: "spring", stiffness: 300, damping: 18 }}`
*   **Tailwind CSS:** `w-12 h-6 rounded-full bg-[var(--color-surface-3)] p-1 cursor-pointer transition-colors [&_.knob]:w-4 [&_.knob]:h-4 [&_.knob]:rounded-full [&_.knob]:bg-[var(--color-text)]`
*   **Caso de Uso Real:** Switch para alternar opciones de servicio a domicilio o retiro en local en la vertical de *Lavanderías y Tintorerías (`laundry`)*.

### 12. Trigger Magnético de Menú Flotante (FloatingMenuTrigger)
*   **Comportamiento e Interacción:** Botón flotante atómico. Al hacer hover, atrae magnéticamente al cursor. Al hacer clic, se abre y despliega un arco de 3 micro-botones con un retardo escalonado (staggered animation) y un fondo con difuminado acrílico.
*   **Física/Animación Framer Motion:**
    *   Menú desplegable: `initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}`
*   **Tailwind CSS:** `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] !text-white flex items-center justify-center shadow-xl cursor-pointer hover:bg-[var(--color-primary-hover)] z-50`
*   **Caso de Uso Real:** Botón flotante de asistencia u orden rápida de WhatsApp en la vertical de *Repuestos y Accesorios de Motos (`repuestos-motos`)*.

### 13. Botón con Revelación de Texto por Máscara (TextRevealButton)
*   **Comportamiento e Interacción:** Al hacer hover, el texto inicial se desplaza verticalmente hacia arriba saliendo del botón, mientras que un segundo texto explicativo (ej: precio o stock) sube desde la base ocupando su lugar con un recorte de máscara perfecto.
*   **Física/Animación Framer Motion:**
    *   Desplazamiento vertical de textos en contenedor con `overflow-hidden`: `transition={{ type: "spring", stiffness: 350, damping: 25 }}`
*   **Tailwind CSS:** `h-10 overflow-hidden relative border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] px-6 flex items-center justify-center font-medium`
*   **Caso de Uso Real:** Botón de añadir al carrito que revela el precio final del pedido en la vertical de *Alimentación Orgánica y Saludable (`alimentacion-saludable`)*.

### 14. Switch de Modo Oscuro con Animación Solar/Lunar (SolarDarkModeSwitch)
*   **Comportamiento e Interacción:** Botón de alternancia de modo oscuro. Al cambiar de estado, el icono de sol se transforma en luna mediante una animación de morphing de trazado SVG y una rotación elástica de 360 grados.
*   **Física/Animación Framer Motion:**
    *   Morphing/Rotación SVG: `animate={{ rotate: theme === 'dark' ? 360 : 0 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}`
*   **Tailwind CSS:** `w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer`
*   **Caso de Uso Real:** Interruptor de tema de interfaz en la cabecera del dashboard administrativo del ecosistema.

---

## 📂 3. Selectores, Dropdowns y Pickers Atómicos

### 15. Selector Desplegable Magnético (MagneticDropdownSelect)
*   **Comportamiento e Interacción:** Menú desplegable atómico. Al expandirse, las opciones emergen con un efecto de cascada (staggered cascade). Al pasar el cursor sobre las opciones, un fondo de color primario translúcido se desliza magnéticamente para resaltar el ítem enfocado.
*   **Física/Animación Framer Motion:**
    *   Contenedor: `animate={{ height: "auto", opacity: 1 }}`
    *   Fondo selector (LayoutId): `transition={{ type: "spring", stiffness: 350, damping: 25 }}`
*   **Tailwind CSS:** `relative [&_.menu]:absolute [&_.menu]:top-full [&_.menu]:mt-2 [&_.menu]:w-full [&_.menu]:bg-[var(--color-surface)] [&_.menu]:border [&_.menu]:border-[var(--color-border)] [&_.menu]:rounded-xl [&_.menu]:shadow-xl [&_.menu]:overflow-hidden`
*   **Caso de Uso Real:** Selector de tipo de lavado (Seco, Vapor, Delicado) en la vertical de *Lavanderías y Tintorerías (`laundry`)*.

### 16. Selector de Rango de Deslizamiento Doble (DualRangeSlider)
*   **Comportamiento e Interacción:** Dos tiradores redondos sobre una barra de progreso. Los tiradores repelen el cursor sutilmente al arrastrarlos. Al cruzarse o acercarse, cambian dinámicamente de tamaño y muestran tooltips flotantes con física spring.
*   **Física/Animación Framer Motion:**
    *   Arrastre de tirador: `drag="x" dragConstraints={{ left: 0, right: 200 }}`
    *   Tooltip: `animate={{ y: -30, opacity: 1 }} exit={{ y: 0, opacity: 0 }}`
*   **Tailwind CSS:** `relative w-full h-1 bg-[var(--color-surface-3)] rounded-full [&_.thumb]:absolute [&_.thumb]:w-4 [&_.thumb]:h-4 [&_.thumb]:rounded-full [&_.thumb]:bg-[var(--color-primary)] [&_.thumb]:top-[-6px] [&_.thumb]:cursor-grab [&_.thumb]:active:cursor-grabbing`
*   **Caso de Uso Real:** Selector de rango de precios en catálogo para la vertical de *Artículos Geek y Coleccionismo (`coleccionismo-geek`)*.

### 17. Selector Radial de Opciones (RadialOptionPicker)
*   **Comportamiento e Interacción:** Un círculo central. Al hacer clic, se expanden 5 opciones radiales dispuestas simétricamente. Al pasar el ratón por cada una, la opción se amplía magnéticamente y la línea de conexión con el centro se ilumina en HSL.
*   **Física/Animación Framer Motion:**
    *   Posicionamiento trigonométrico dinámico: `animate={{ x: r * cos(a), y: r * sin(a), scale: 1 }}`
*   **Tailwind CSS:** `relative w-12 h-12 rounded-full bg-[var(--color-primary)] !text-white flex items-center justify-center cursor-pointer`
*   **Caso de Uso Real:** Selector rápido de tipo de diagnóstico mecánico (Motor, Caja, Eléctrico, Suspensión) en la vertical de *Repuestos y Accesorios de Motos (`repuestos-motos`)*.

### 18. Selector de Fecha en Matriz Compacta (CompactMatrixDatePicker)
*   **Comportamiento e Interacción:** Calendario del mes condensado en formato de matriz de celdas cuadradas sin bordes negros. Al hacer hover, un selector de cápsula se desplaza fluidamente entre las celdas. Los días deshabilitados se atenúan con opacidad y filtro HSL.
*   **Física/Animación Framer Motion:**
    *   Indicador de selección compartida (LayoutId): `transition={{ type: "spring", stiffness: 380, damping: 28 }}`
*   **Tailwind CSS:** `grid grid-cols-7 gap-1 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-lg [&_button]:text-sm [&_button]:font-medium [&_button]:transition-all`
*   **Caso de Uso Real:** Selector de fecha de entrega de pedido en checkout para la vertical de *Alimentos Artesanales y Repostería (`alimentos-artesanales`)*.

### 19. Selector de Color Mixto HSL (MixColorPicker)
*   **Comportamiento e Interacción:** Muestrario de paletas cromáticas. En vez de inputs de color nativos, muestra círculos HSL mezclados. Al seleccionar un color, el círculo se desplaza hacia el centro del selector y expande un halo radial que tiñe los bordes del input.
*   **Física/Animación Framer Motion:**
    *   Halo radial: `animate={{ scale: [1, 1.4], opacity: [0.6, 0] }} transition={{ duration: 0.6 }}`
*   **Tailwind CSS:** `flex gap-2 [&_.swatch]:w-8 [&_.swatch]:h-8 [&_.swatch]:rounded-full [&_.swatch]:border [&_.swatch]:border-[var(--color-border)] [&_.swatch]:cursor-pointer [&_.active]:ring-2 [&_.active]:ring-[var(--color-primary)] [&_.active]:ring-offset-2`
*   **Caso de Uso Real:** Selector de tono de tapizado o madera en la vertical de *Restauración y Tapicería de Muebles (`furniture_repair`)*.

### 20. Selector de Moneda con Auto-Formato (DynamicCurrencySelector)
*   **Comportamiento e Interacción:** Input de montos que auto-formatea en tiempo real a pesos colombianos (`$ 12.500`). Al cambiar la denominación, el símbolo de la moneda flota y hace un micro-rebot elástico.
*   **Física/Animación Framer Motion:**
    *   Cambio de símbolo: `animate={{ scale: [0.8, 1.2, 1], y: [-5, 0] }} transition={{ duration: 0.3 }}`
*   **Tailwind CSS:** `relative flex items-center border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] px-3 [&_input]:w-full [&_input]:py-3 [&_input]:pl-6 [&_input]:bg-transparent [&_input]:outline-none [&_span]:absolute [&_span]:left-3 [&_span]:font-semibold [&_span]:text-[var(--color-text-muted)]`
*   **Caso de Uso Real:** Ingreso de abonos parciales de clientes en la vertical de *Contratistas y Construcción (`contractors`)*.

### 21. Selector de Filtro de Fichas Elásticas (ElasticChipSelector)
*   **Comportamiento e Interacción:** Grupo de pestañas tipo píldora horizontales. Al seleccionar una pestaña, un fondo redondeado sólido (cápsula) se desliza elásticamente por debajo del texto, deformando sus bordes durante el recorrido.
*   **Física/Animación Framer Motion:**
    *   Desplazamiento horizontal elástico: `transition={{ type: "spring", stiffness: 350, damping: 22 }}`
*   **Tailwind CSS:** `flex bg-[var(--color-surface-2)] p-1.5 rounded-xl border border-[var(--color-border)] overflow-x-auto [&_button]:px-4 [&_button]:py-1.5 [&_button]:rounded-lg [&_button]:text-sm [&_button]:font-medium [&_button]:text-[var(--color-text-muted)]`
*   **Caso de Uso Real:** Selector de categorías en catálogo móvil (Filtro rápido: Ropa, Zapatos, Accesorios) en la vertical de *Moda y Calzado Local (`moda-local-calzado`)*.

---

## 📂 4. Badges, Chips y Chips de Estado Premium

### 22. Badge con Borde de Brillo Rotativo (RotaryGlowBadge)
*   **Comportamiento e Interacción:** Badge o píldora indicadora. Posee un gradiente de borde continuo de alta definición que gira lentamente. Al pasar el cursor, el borde acelera su rotación y proyecta un brillo difuso hacia el texto.
*   **Física/Animación Framer Motion:**
    *   Giro infinito: `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}`
*   **Tailwind CSS:** `relative overflow-hidden p-[1px] rounded-full bg-[var(--color-border)] [&_span]:block [&_span]:bg-[var(--color-surface)] [&_span]:px-2.5 [&_span]:py-0.5 [&_span]:rounded-full [&_span]:text-xs [&_span]:font-semibold`
*   **Caso de Uso Real:** Indicador de producto "Destacado" o "Edición Especial" en la vertical de *Artículos Geek y Coleccionismo (`coleccionismo-geek`)*.

### 23. Badge de Estado de Latencia Pulsante (PulseHealthBadge)
*   **Comportamiento e Interacción:** Micro-indicador de estado de conexión o disponibilidad. Contiene un círculo verde o amarillo que emite ondas concéntricas traslúcidas (pulsos) de fondo que se atenúan con la distancia.
*   **Física/Animación Framer Motion:**
    *   Expansión y desvanecimiento de onda: `scale: [1, 2.5], opacity: [0.8, 0] transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}`
*   **Tailwind CSS:** `relative w-2.5 h-2.5 rounded-full bg-green-500 [&_span]:absolute [&_span]:inset-0 [&_span]:rounded-full [&_span]:bg-green-500`
*   **Caso de Uso Real:** Indicador de estado de cocina activa o repartidor en ruta para la vertical de *Minimarkets y Alimentos (`grocery_food`)*.

### 24. Chip con Efecto Hover Magnético (MagneticHoverChip)
*   **Comportamiento e Interacción:** Ficha de tag de producto. Al colocar el cursor sobre el chip, este se inclina levemente siguiendo la dirección del mouse (efecto Tilt atómico) y su sombra HSL se proyecta en sentido opuesto.
*   **Física/Animación Framer Motion:**
    *   Rotación leve en X e Y en base al puntero: `whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}`
*   **Tailwind CSS:** `px-3 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs font-medium cursor-pointer shadow-sm hover:border-[var(--color-primary)]/50 transition-all`
*   **Caso de Uso Real:** Tags de atributos de vehículos (ej: "4 Tiempos", "125cc") en la vertical de *Repuestos y Accesorios de Motos (`repuestos-motos`)*.

### 25. Badge con Gradiente Cromático Dinámico (ChromaticGradientBadge)
*   **Comportamiento e Interacción:** Píldora de estado premium. Muestra un fondo degradado que transiciona lentamente entre los tonos HSL de la identidad corporativa, reflejando dinamismo y calidad en estados especiales.
*   **Física/Animación Framer Motion:**
    *   Cambio de posición del background degradado: `animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}`
*   **Tailwind CSS:** `bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] bg-[length:200%_auto] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md`
*   **Caso de Uso Real:** Estado "Urgente" o "Prioritario" en órdenes de reparación para la vertical de *Refrigeración y Climatización (`refrigeration_ac`)*.

### 26. Chip de Descarte con Animación de Hélice (HelixDismissibleChip)
*   **Comportamiento e Interacción:** Chip para quitar filtros. Al hacer clic en la "X", el chip rota sobre su propio eje Y (como una hélice) al tiempo que se encoge hasta desaparecer del layout físico de manera fluida.
*   **Física/Animación Framer Motion:**
    *   Salida y descarte: `exit={{ scale: 0, rotateY: 90, opacity: 0 }} transition={{ duration: 0.25 }}`
*   **Tailwind CSS:** `flex items-center gap-1.5 bg-[var(--color-surface-3)] px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--color-text)] [&_svg]:cursor-pointer`
*   **Caso de Uso Real:** Filtros aplicados de repuestos (ej: "Marca: Honda") en la vertical de *Repuestos y Accesorios de Motos (`repuestos-motos`)*.

### 27. Badge de Nivel y Progreso Micro (MicroProgressBadge)
*   **Comportamiento e Interacción:** Badge que contiene un micro-anillo de progreso circular SVG a la izquierda del texto. El anillo se llena progresivamente del color HSL según avanza la etapa del pedido.
*   **Física/Animación Framer Motion:**
    *   Animación del trazo del círculo SVG (`strokeDasharray`): `animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeInOut" }}`
*   **Tailwind CSS:** `flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-1 rounded-full text-xs font-semibold [&_svg]:w-4 [&_svg]:h-4`
*   **Caso de Uso Real:** Progreso de finalización de una pieza maquinada en la vertical de *Tornerías y Mecanizado de Precisión (`technical_services`)*.

---

## 📂 5. Indicadores Visuales, Semáforos y Micro-Gráficos

### 28. Semáforo de Inventario en Píldora (PillStockHeatmap)
*   **Comportamiento e Interacción:** Barra indicadora de disponibilidad compacta. Muestra una sección degradada que transiciona entre verde (alto stock), amarillo (crítico) y rojo (agotado). Al hacer hover, revela de forma elástica la cantidad exacta en unidades.
*   **Física/Animación Framer Motion:**
    *   Expansión elástica: `whileHover={{ width: "auto" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}`
*   **Tailwind CSS:** `h-2 w-16 rounded-full overflow-hidden bg-[var(--color-surface-3)] [&_.bar]:h-full [&_.bar]:bg-gradient-to-r [&_.bar]:from-red-500 [&_.bar]:via-yellow-500 [&_.bar]:to-green-500`
*   **Caso de Uso Real:** Semáforo de inventario rápido en listado de productos en la vertical de *Minimarkets y Alimentos (`grocery_food`)*.

### 29. Micro-Gráfico de Línea de Tendencia (MicroSparkline)
*   **Comportamiento e Interacción:** Pequeño gráfico lineal SVG (sin librerías externas pesadas). Al renderizarse, la línea se dibuja de izquierda a derecha simulando la tendencia del indicador. Al hacer hover, un punto magnético sigue la trayectoria de la curva.
*   **Física/Animación Framer Motion:**
    *   Dibujado de línea SVG: `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}`
*   **Tailwind CSS:** `w-20 h-8 [&_path]:stroke-[var(--color-primary)] [&_path]:fill-none [&_path]:stroke-2`
*   **Caso de Uso Real:** Tendencia diaria de ventas o rotación en la vertical de *Lavanderías y Tintorerías (`laundry`)*.

### 30. Dot de Estado con Multi-Fase Glow (MultiPhaseStatusDot)
*   **Comportamiento e Interacción:** Punto LED indicador de estado físico de maquinaria. Puede alternar entre 4 colores (Glow verde, azul, naranja, rojo). El cambio de color se realiza mediante un fundido suave con variación de intensidad lumínica (respiración).
*   **Física/Animación Framer Motion:**
    *   Intensidad de respiración (pulse glow): `animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}`
*   **Tailwind CSS:** `w-3 h-3 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all duration-500`
*   **Caso de Uso Real:** Estado operativo de máquinas de refrigeración en la vertical de *Refrigeración y Climatización (`refrigeration_ac`)*.

### 31. Barra de Progreso Segmentada Reactiva (SegmentedProgressBar)
*   **Comportamiento e Interacción:** Barra de progreso dividida en segmentos discretos. Al avanzar, cada segmento se ilumina consecutivamente con una transición elástica e incremental. Al finalizar, todos los bloques hacen un destello simultáneo.
*   **Física/Animación Framer Motion:**
    *   Llenado segmentado: `animate={{ scaleX: 1 }} transition={{ delay: index * 0.1, type: "spring", stiffness: 150 }}`
*   **Tailwind CSS:** `flex gap-1 w-full [&_div]:h-1.5 [&_div]:flex-1 [&_div]:rounded-sm [&_div]:bg-[var(--color-surface-3)] [&_div.active]:bg-[var(--color-primary)]`
*   **Caso de Uso Real:** Progreso de fases de mantenimiento correctivo en la vertical de *Tornerías y Mecanizado de Precisión (`technical_services`)*.

### 32. Medidor de Resiliencia de Conexión (ConnectionResilienceIndicator)
*   **Comportamiento e Interacción:** Micro-icono atómico de barras de señal. Al detectar fluctuaciones en la red local o Firebase, las barras se tiñen y escalan reflejando la latencia en vivo con un efecto de resorte.
*   **Física/Animación Framer Motion:**
    *   Escalamiento de barras individuales: `animate={{ scaleY: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.25 }}`
*   **Tailwind CSS:** `flex items-end gap-0.5 w-6 h-5 [&_span]:w-1 [&_span]:bg-[var(--color-text-muted)] [&_span.active]:bg-green-500`
*   **Caso de Uso Real:** Monitoreo de conectividad a Firebase del POS en la vertical de *Minimarkets y Alimentos (`grocery_food`)*.

### 33. Micro-Termómetro de Nivel de Pedidos (KdsOrderThermometer)
*   **Comportamiento e Interacción:** Indicador en forma de barra vertical. Crece hacia arriba a medida que se acumulan pedidos pendientes en cola. Al alcanzar niveles críticos (más de 8 pedidos), la barra vibra levemente con un efecto "shake" físico.
*   **Física/Animación Framer Motion:**
    *   Vibración de alerta: `animate={critical ? { x: [-1, 1, -1, 1, 0] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}`
*   **Tailwind CSS:** `w-3 h-24 rounded-full bg-[var(--color-surface-3)] relative overflow-hidden [&_.fill]:absolute [&_.fill]:bottom-0 [&_.fill]:w-full [&_.fill]:bg-red-500 [&_.fill]:transition-all`
*   **Caso de Uso Real:** Monitor visual de carga de cocina (KDS) en la vertical de *Alimentos Artesanales y Repostería (`alimentos-artesanales`)*.

---

## 📂 6. Animaciones de Carga, Spinners y Skeletons Adaptativos

### 34. Shimmer Skeleton Autoadaptativo (SelfAdaptiveShimmerSkeleton)
*   **Comportamiento e Interacción:** Elemento skeleton agnóstico. El brillo oblicuo (shimmer) se desplaza infinitamente. Su ancho y alto se adaptan dinámicamente al tamaño del elemento que está sustituyendo, eliminando saltos de layout (CLS).
*   **Física/Animación Framer Motion:**
    *   Desplazamiento del shimmer (X): `animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}`
*   **Tailwind CSS:** `relative overflow-hidden rounded-xl bg-[var(--color-surface-3)]/60 [&_div]:absolute [&_div]:inset-0 [&_div]:bg-gradient-to-r [&_div]:from-transparent [&_div]:via-[var(--color-border)]/40 [&_div]:to-transparent`
*   **Caso de Uso Real:** Esqueleto de carga para tarjetas de catálogo en la vertical de *Ropa y Retail Tradicional (`retail_clothing`)*.

### 35. Spinner de Carga Orbital HSL (OrbitalHslSpinner)
*   **Comportamiento e Interacción:** Dos micro-esferas HSL que orbitan una alrededor de la otra en un trazado elíptico. A medida que rotan, la velocidad de rotación acelera y desacelera elásticamente simulando inercia gravitacional.
*   **Física/Animación Framer Motion:**
    *   Rotación elástica orbital: `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}`
*   **Tailwind CSS:** `relative w-10 h-10 [&_span]:absolute [&_span]:w-3 [&_span]:h-3 [&_span]:rounded-full [&_span]:bg-[var(--color-primary)] [&_span:nth-child(2)]:bg-[var(--color-secondary)] [&_span:nth-child(2)]:right-0`
*   **Caso de Uso Real:** Spinner de carga durante el procesamiento de pagos en la vertical de *Insumos Horeca B2B (`distribucion-horeca`)*.

### 36. Lector de Tarjetas con Efecto Escáner (ScannerLoadingIndicator)
*   **Comportamiento e Interacción:** Una línea horizontal de luz láser neón que baja y sube continuamente sobre un contenedor. La línea difumina la luz hacia arriba simulando el escaneo digital de un código de barras.
*   **Física/Animación Framer Motion:**
    *   Trayectoria del láser: `animate={{ y: [0, 80, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}`
*   **Tailwind CSS:** `relative w-full h-24 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden [&_div]:absolute [&_div]:w-full [&_div]:h-[2px] [&_div]:bg-gradient-to-r [&_div]:from-transparent [&_div]:via-[var(--color-primary)] [&_div]:to-transparent [&_div]:shadow-[0_0_8px_var(--color-primary)]`
*   **Caso de Uso Real:** Indicador visual para la lectura de códigos de barra en el POS para la vertical de *Repuestos y Accesorios de Motos (`repuestos-motos`)*.

### 37. Indicador de Carga por Pulso de Líneas (PulseLineLoader)
*   **Comportamiento e Interacción:** Línea horizontal delgada. Al procesar una carga, la línea no se llena linealmente, sino que emite ondas senoidales o pulsos de escala elásticos a lo largo de su trayectoria.
*   **Física/Animación Framer Motion:**
    *   Deformación de onda: `animate={{ scaleY: [1, 3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}`
*   **Tailwind CSS:** `h-1 w-full bg-[var(--color-surface-3)] overflow-hidden [&_div]:h-full [&_div]:w-1/3 [&_div]:bg-[var(--color-primary)] [&_div]:rounded-full`
*   **Caso de Uso Real:** Carga de carga diferida en tablas financieras en el POS central.

### 38. Skeleton de Tarjeta Grid con Carga Diferida (GridCardSkeleton)
*   **Comportamiento e Interacción:** Bloque de carga compuesto por un avatar circular, dos líneas de texto y un botón. Los elementos internos realizan un Shimmer en desfase temporal (staggered delay), mejorando la percepción de velocidad.
*   **Física/Animación Framer Motion:**
    *   Transición staggered para sub-skeletons: `transition={{ staggerChildren: 0.15 }}`
*   **Tailwind CSS:** `p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] flex flex-col gap-3 [&_div]:rounded-lg`
*   **Caso de Uso Real:** Esqueleto de carga inicial en la cuadrícula de productos para la vertical de *Alimentación Orgánica y Saludable (`alimentacion-saludable`)*.

### 39. Loader de Progreso Creciente Elástico (ElasticLinearLoader)
*   **Comportamiento e Interacción:** Barra de carga continua. La porción cargada se comporta como una banda elástica: se estira al avanzar rápido y se contrae de golpe al detenerse o ralentizarse, simulando resistencia física.
*   **Física/Animación Framer Motion:**
    *   Llenado y escala X reactivos: `animate={{ scaleX: progress / 100 }} transition={{ type: "spring", stiffness: 100, damping: 15 }}`
*   **Tailwind CSS:** `h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden [&_div]:h-full [&_div]:w-full [&_div]:bg-gradient-to-r [&_div]:from-[var(--color-primary)] [&_div]:to-[var(--color-secondary)] [&_div]:origin-left`
*   **Caso de Uso Real:** Progreso de subida de imágenes de productos al Storage desde el Admin.

---

## 📂 7. Tarjetas y Contenedores Interactivos Atómicos (Glow, Hover, Tilt)

### 40. Tarjeta con Efecto 3D Tilt Físico (Physical3dTiltCard)
*   **Comportamiento e Interacción:** Tarjeta de catálogo. Al deslizar el cursor sobre ella, la tarjeta se inclina tridimensionalmente en el eje X e Y en correspondencia exacta a la posición del cursor, reflejando luces HSL virtuales sobre los bordes.
*   **Física/Animación Framer Motion:**
    *   Cálculo angular tridimensional mediante spring: `transition={{ type: "spring", stiffness: 150, damping: 20 }}`
*   **Tailwind CSS:** `relative w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 [transform-style:preserve-3d] [&_*]:[transform-translateZ:20px]`
*   **Caso de Uso Real:** Tarjeta de visualización de maquinaria premium para alquiler en la vertical de *Alquiler de Maquinaria y Equipos (`machinery_rental`)*.

### 41. Contenedor con Glow de Foco Cursor (CursorFollowGlowContainer)
*   **Comportamiento e Interacción:** Contenedor de caja. Completamente oscuro o minimalista. Al aproximar el cursor, este genera un haz de luz radial (glow HSL) de fondo que sigue al puntero por detrás de la tarjeta, revelando los bordes con elegancia.
*   **Física/Animación Framer Motion:**
    *   Seguimiento de posición por spring: `style={{ x: mouseX, y: mouseY }}`
*   **Tailwind CSS:** `relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 [&_.glow]:absolute [&_.glow]:w-48 [&_.glow]:h-48 [&_.glow]:rounded-full [&_.glow]:bg-[var(--color-primary)]/10 [&_.glow]:blur-3xl [&_.glow]:pointer-events-none [&_.glow]:z-0`
*   **Caso de Uso Real:** Panel de visualización de KPI comercial clave en el panel administrativo.

### 42. Tarjeta con Revelación de Canvas de Fondo (CanvasRevealCard)
*   **Comportamiento e Interacción:** Inspirado en Aceternity. Al hacer hover sobre la tarjeta, el fondo de color plano se disuelve elásticamente y revela un lienzo interactivo con patrones geométricos en movimiento (ej: cuadrícula de puntos o constelación interactiva).
*   **Física/Animación Framer Motion:**
    *   Revelación de máscara: `whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}`
*   **Tailwind CSS:** `relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden [&_.canvas-container]:absolute [&_.canvas-container]:inset-0 [&_.canvas-container]:opacity-0 [&_.canvas-container]:hover:opacity-100 [&_.canvas-container]:transition-opacity [&_.canvas-container]:z-0`
*   **Caso de Uso Real:** Tarjetas de catálogo de colección premium en la vertical de *Ropa y Retail Tradicional (`retail_clothing`)*.

### 43. Contenedor de Vidrio Glaseado Dinámico (DynamicGlassmorphicContainer)
*   **Comportamiento e Interacción:** Tarjeta transparente que aplica un desenfoque de fondo acrílico extremo. Al pasar el cursor, el nivel de desenfoque de fondo se reduce levemente mientras que el brillo de los bordes se duplica, aumentando la legibilidad.
*   **Física/Animación Framer Motion:**
    *   Ajuste de desenfoque: `whileHover={{ backdropFilter: "blur(16px)" }} transition={{ duration: 0.455 }}`
*   **Tailwind CSS:** `bg-[var(--color-surface)]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl`
*   **Caso de Uso Real:** Caja de cotización rápida sobrepuesta en el visor público de la vertical de *Contratistas y Construcción (`contractors`)*.

### 44. Tarjeta de Producto con Zoom en Paralaje (ParallaxZoomCard)
*   **Comportamiento e Interacción:** Tarjeta de catálogo. Al hacer hover, la imagen del producto realiza un zoom suave hacia adelante mientras que la descripción se desliza en sentido opuesto en el eje Y, simulando paralaje.
*   **Física/Animación Framer Motion:**
    *   Zoom y desplazamiento vertical: `whileHover={{ scale: 1.06 }} transition={{ type: "spring", stiffness: 180, damping: 22 }}`
*   **Tailwind CSS:** `relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] [&_img]:w-full [&_img]:h-48 [&_img]:object-cover [&_img]:transition-transform`
*   **Caso de Uso Real:** Tarjetas de catálogo de postres finos en la vertical de *Alimentos Artesanales y Repostería (`alimentos-artesanales`)*.

### 45. Contenedor con Borde Magnético (MagneticBorderContainer)
*   **Comportamiento e Interacción:** El borde exterior se compone de un degradado sutil. Al colocar el puntero sobre cualquier área limítrofe del contenedor, la línea de borde se deforma y atrae el cursor magnéticamente a lo largo de su perímetro.
*   **Física/Animación Framer Motion:**
    *   Cálculo de vector límite y ajuste de borde elástico.
*   **Tailwind CSS:** `relative p-[1.5px] rounded-2xl bg-gradient-to-r from-[var(--color-border)] to-[var(--color-border)] hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)] transition-all [&_div]:bg-[var(--color-surface)] [&_div]:rounded-[14px] [&_div]:p-6`
*   **Caso de Uso Real:** Contenedor de planes de suscripción o módulos premium en landing page.

---

## 📂 8. Micro-efectos y Elementos de Transición Decorativos

### 46. Efecto de Confeti Dinámico de Canvas (DynamicConfettiTrigger)
*   **Comportamiento e Interacción:** Trigger invisible. Al activarse un estado exitoso (ej. pago aprobado), dispara ráfagas de confeti con física de gravedad e inercia desde las esquinas inferiores del viewport utilizando Canvas.
*   **Física/Animación Framer Motion:**
    *   Inyección dinámica de partículas con cálculo físico.
*   **Tailwind CSS:** `pointer-events-none fixed inset-0 z-[9999]`
*   **Caso de Uso Real:** Animación festiva tras concretar una venta POS o canjear un cupón en la vertical de *Minimarkets y Alimentos (`grocery_food`)*.

### 47. Texto Dinámico Flotante de Hover (FloatingHoverText)
*   **Comportamiento e Interacción:** Al pasar el ratón por encima de un enlace o botón de texto, cada letra individual se separa, flota verticalmente y vuelve a caer en una secuencia de onda de izquierda a derecha (staggered bounce).
*   **Física/Animación Framer Motion:**
    *   Rebote de caracteres: `animate={{ y: [-4, 0] }} transition={{ type: "spring", stiffness: 300, damping: 10, delay: index * 0.04 }}`
*   **Tailwind CSS:** `inline-flex [&_span]:inline-block [&_span]:cursor-default`
*   **Caso de Uso Real:** Micro-animación de interactividad en enlaces de navegación del footer.

### 48. Efecto Magnético de Icono SVG (MagneticSvgIcon)
*   **Comportamiento e Interacción:** Micro-interacción de iconos. Al pasar el cursor sobre el icono SVG, las líneas del trazo (paths) se mueven independientemente en dirección al ratón con una resistencia elástica diferenciada.
*   **Física/Animación Framer Motion:**
    *   Movimiento de paths: `whileHover={{ x: 3, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}`
*   **Tailwind CSS:** `w-6 h-6 [&_path]:transition-transform [&_path]:duration-300`
*   **Caso de Uso Real:** Icono de "Guardar" o "Añadir a favoritos" en la vertical de *Artículos Geek y Coleccionismo (`coleccionismo-geek`)*.

### 49. Divisor Cromático con Haz de Luz (LightBeamDivider)
*   **Comportamiento e Interacción:** Línea divisora horizontal de sección. Muestra un trazo degradado tenue. De forma intermitente, un haz de luz de alta intensidad corre de izquierda a derecha y se difumina al llegar al extremo.
*   **Física/Animación Framer Motion:**
    *   Desplazamiento del gradiente de luz: `animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}`
*   **Tailwind CSS:** `relative h-[1px] w-full bg-[var(--color-border)]/40 overflow-hidden [&_div]:absolute [&_div]:h-full [&_div]:w-24 [&_div]:bg-gradient-to-r [&_div]:from-transparent [&_div]:via-[var(--color-primary)] [&_div]:to-transparent`
*   **Caso de Uso Real:** Divisor estético entre módulos financieros en el reporte diario POS.

### 50. Efecto de Estrellas de Calificación Flotantes (FloatingRatingStars)
*   **Comportamiento e Interacción:** Calificación de 5 estrellas. Al pasar el cursor sobre una estrella, esta gira 15 grados y emite un pequeño destello de partículas amarillas concéntricas. Las estrellas anteriores se tiñen y escalan elásticamente.
*   **Física/Animación Framer Motion:**
    *   Escalamiento y rotación: `whileHover={{ scale: 1.2, rotate: 15 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}`
*   **Tailwind CSS:** `flex gap-1.5 [&_svg]:w-6 [&_svg]:h-6 [&_svg]:cursor-pointer [&_svg]:transition-colors [&_svg]:text-[var(--color-surface-3)] [&_svg.active]:text-yellow-400`
*   **Caso de Uso Real:** Captura de satisfacción del cliente post-servicio en la vertical de *Estética, Podología y Bienestar (`wellness_podology`)*.
