# 🎨 Estándar de Diseño Premium y Visual de Vanguardia (Para la IA)

**Propósito:** Definir los lineamientos estéticos y visuales obligatorios que toda IA o desarrollador debe aplicar al crear componentes o interfaces en el ecosistema **Prototipe**. El fin es lograr que las aplicaciones se sientan modernas, fluidas, premium, táctiles y visualmente cohesivas, adaptándose al branding del cliente de forma natural.

---

## 1. Reglas de Color HSL y Tailwind CSS v4

### 1.1 Cero Hardcoding de Colores Planos
Queda **estrictamente prohibido** utilizar nombres de colores estáticos o códigos hexadecimales fijos para elementos de la interfaz en los componentes (ej: `text-red-500`, `bg-[#ef4444]`), a menos que representen estados universales (como alertas críticas o de éxito).
* **Directiva:** Todo el color del tema debe consumirse de las variables CSS de marca inyectadas en el `@theme` de Tailwind CSS v4:
  * `var(--color-primary)` → Color de marca primario para botones, enlaces y llamadas a la acción principales.
  * `var(--color-secondary)` → Color secundario de contraste.
  * `var(--color-surface)` / `var(--color-surface-2)` → Colores para contenedores y tarjetas.

### 1.2 Regla de "Cero Bordes Negros"
Los bordes de alto contraste o colores negros planos hacen que la interfaz se vea tosca y desactualizada.
* **Directiva:** Usa siempre contornos sutiles utilizando clases que reduzcan el contraste mezclando la base HSL:
  * `border-app` o `border-slate-200/40` en lugar de `border-black` o `border-slate-300`.

---

## 2. Elevación Visual y Glassmorphism

Para dar profundidad tridimensional a la interfaz, se deben utilizar efectos de cristalización modernos:

* **Backdrop Blur:** Úsalo en cabeceras fijas (`sticky`), barras de navegación inferiores y overlays de modales para lograr un acabado elegante:
  ```css
  bg-white/70 backdrop-blur-xl border-b border-gray-100/50
  ```
* **Sombras Suaves Orgánicas (HSL):** Evita el uso de sombras duras o negras por defecto (`shadow-black`). En su lugar, emplea las sombras HSL dinámicas integradas en Tailwind v4 que heredan el tono cromático del cliente (`var(--color-primary)`):
  * `shadow-soft-sm` → Para botones interactivos, campos de formulario y pequeños chips flotantes.
  * `shadow-soft-md` → Para tarjetas de producto, menús desplegables y paneles de control laterales.
  * `shadow-soft-lg` → Para diálogos, modales emergentes y carritos de compra flotantes.

---

## 3. Micro-interacciones y Feedback Táctil

Una interfaz "viva" reacciona a cada toque y movimiento del usuario.

### 3.1 Transición por Defecto (Cohesión de Animación)
Todo elemento interactivo (botones, chips de filtro, inputs, filas de tabla clickables) debe tener una transición de estado suave:
```css
transition-all duration-200 ease-in-out
```

### 3.2 Feedback Táctil en Clics (Active Scale)
Para simular el comportamiento de una app móvil nativa, los botones deben reducir sutilmente su escala al presionarse:
```css
active:scale-95
```

### 3.3 Hover Reactivos (Escritorio)
Para usuarios en desktop, los elementos clickables deben reaccionar con un cambio suave de fondo o brillo:
```css
hover:bg-slate-50 hover:shadow-sm cursor-pointer
```

---

## 4. Tipografía y Jerarquía Visual

* **Tipografía de Títulos (Outfit / font-display):** Debe ser de peso fuerte, espaciado compacto y tamaño responsivo. Usa la utilidad `.font-display` para títulos destacados de marca:
  ```css
  font-display text-xl md:text-2xl font-black text-slate-800 tracking-tight
  ```
* **Tipografía de Contenido (Inter / font-sans):** Debe ser altamente legible, de peso regular y un color suave para evitar la fatiga visual. Es la tipografía por defecto del cuerpo del documento (`font-sans`):
  ```css
  font-sans text-sm font-medium leading-relaxed text-slate-500
  ```


---

## 5. Ejemplos de Implementación Premium

### Botón de Acción Principal (Premium Button)
```jsx
<button
  type="button"
  onClick={onClick}
  className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
>
  <Icon size={14} />
  <span>{label}</span>
</button>
```

### Contenedor de Tarjeta (Premium Card)
```jsx
<div className="bg-surface border border-app rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform duration-300" />
  {children}
</div>
```

---

## 6. Gobernanza de Fondos y Contraste en Modo Oscuro (Semántica Tonal)

Para evitar la "planitud visual" y garantizar la legibilidad en interfaces oscuras, los fondos deben estructurarse de manera semántica e incremental (elevación tonal).

### 6.1 Estructura Semántica de Fondos
*   **Fondo Base (`bg-[var(--color-bg)]`):** Se utiliza exclusivamente para el fondo general del viewport de la pantalla (body). Es el nivel más oscuro de la interfaz.
*   **Superficie Principal (`bg-[var(--color-surface)]`):** Reservado para tarjetas de contenido, paneles principales, feeds de datos y secciones secundarias. Proporciona el contraste base sobre el fondo.
*   **Superficie Destacada (`bg-[var(--color-surface-2)]`):** Utilizado para sub-secciones dentro de una tarjeta (como el resumen de totales en un checkout), popovers, selectores desplegables y barras de búsqueda.
*   **Superficie Flotante (`bg-[var(--color-surface-3)]`):** Reservado para modales interactivos que aparecen en primer plano, bottom sheets y toasts flotantes. Al ser el elemento físicamente más cercano al usuario, posee el tono más claro en modo oscuro.

### 6.2 Evitación de Colisiones de Fondo (Color Swatches)
*   **Advertencia:** En el stylesheet global del Dashboard Central, cualquier contenedor `div` con las clases `rounded-2xl` (o `rounded-3xl`) y una clase de borde (`border`) se sobrescribe a fondo blanco/glassmorphic en Modo Claro.
*   **Regla:** Cuando implementes selectores cromáticos interactivos con fondos dinámicos definidos en `style={{ backgroundColor: ... }}`, **nunca** combines `rounded-2xl`/`rounded-3xl` con clases de borde en el mismo elemento, o fuerza el inline style con `!important` para evitar la pérdida del swatch.

---

## 7. Estándar de Animaciones Fluidas y Rendimiento (Aceleración por Hardware)

Las animaciones mal optimizadas provocan parpadeos y caídas drásticas de FPS en smartphones de gama media-baja.

### 7.1 Propiedades Animables Permitidas
*   **Regla:** Queda prohibido animar propiedades de maquetación que fuercen al navegador a recalcular el layout físico de la página (tales como `height`, `width`, `margin`, `padding`, `top`, `left`).
*   **Directiva:** Utiliza exclusivamente propiedades de composición aceleradas por la GPU: **`transform`** (para mover y escalar) y **`opacity`** (para desvanecer).
*   **Ejemplo (Incorrecto):**
    ```css
    transition-all duration-300 hover:h-12 hover:mt-2
    ```
*   **Ejemplo (Correcto - GPU):**
    ```css
    transition-all duration-300 hover:translate-y-[-4px] hover:scale-105
    ```

### 7.2 Aceleración por Hardware (`will-change`)
*   Para elementos con micro-animaciones continuas o pesadas (como la aguja en medidores, ruletas de la suerte o widgets flotantes con efectos 3D), aplica la propiedad `will-change-transform` para indicarle al navegador que reserve memoria de video en la GPU, eliminando el lag en móviles.

### 7.3 Respeto a la Accesibilidad (`reduced-motion`)
*   Toda transición compleja con Framer Motion o CSS debe envolverse o desactivarse ante usuarios que tengan activada la preferencia de reducción de movimiento en el sistema operativo:
    ```css
    @media (prefers-reduced-motion: reduce) {
      .animated-element {
        animation: none !important;
        transition: none !important;
      }
    }
    ```

---

## 8. Interactividad y Hovers Pegajosos en Dispositivos Táctiles

Un error común de interactividad es la aplicación directa de clases de hover en móviles. En iOS y Android, el estado `:hover` se activa en el primer tap y se queda "pegado" hasta que el usuario hace clic en otra parte de la pantalla, dando un aspecto roto y sucio.

### 8.1 Condicionamiento de Hover para Punteros de Precisión
*   **Regla:** Las clases de cambio de color o brillo por hover **DEBEN** limitarse a pantallas que dispongan de cursor físico de precisión utilizando media queries o selectores responsivos específicos.
*   **Solución en Tailwind:**
    ```jsx
    {/* bg-primary/10 se activa en hover únicamente en pantallas con soporte de cursor */}
    <button className="h-10 px-4 bg-surface border border-app rounded-xl [@media(hover:hover)]:hover:bg-[var(--color-primary)]/10 transition-colors">
      Click
    </button>
    ```

### 8.2 Feedback de Compresión (Active State)
*   En pantallas móviles, el hover se sustituye por el estado de compresión activa (`active:scale-[0.98]`). Para evitar que el efecto se extienda indefinidamente al arrastrar el dedo (scrolling), agrega la propiedad `select-none` en el botón, impidiendo la selección accidental de texto.

---

## 9. Efectos de Brillo (Glow), Shimmer y Degradados Animados

Los efectos de brillo y degradados añaden la firma estética "premium" característica de PROTOTIPE.

### 9.1 Glow Dinámico Basado en HSL (Aura de Botón)
Para botones principales de marca, utiliza sombras de brillo basadas en la opacidad del color primario HSL para lograr un efecto de relieve luminoso.
*   **Solución de Clase:**
    ```jsx
    <button className="h-11 px-6 bg-[var(--color-primary)] !text-white rounded-xl shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.5)] transition-all">
      Destacado
    </button>
    ```

### 9.2 Shimmer Skeleton (Efecto de Barrido Lumínico)
Para estados de carga, utiliza degradados lineales animados que se desplacen horizontalmente mediante aceleración gráfica.
*   **Solución CSS inline o Clase:**
    ```css
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
      animation: shimmer 1.5s infinite;
    }
    ```
