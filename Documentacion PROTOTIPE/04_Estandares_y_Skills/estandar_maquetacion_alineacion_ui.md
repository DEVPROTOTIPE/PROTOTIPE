# 📐 Estándar de Maquetación, Alineación y Control de Estilos Nativos (UI/UX)

**Propósito:** Definir de forma obligatoria las reglas de maquetación, simetría, alineación, espaciados y control sobre los estilos nativos de los navegadores para todos los componentes del ecosistema **PROTOTIPE**. Este estándar complementa las guías visuales premium previniendo regresiones de acoplamiento, campos desalineados, botones juntos o desbordamientos.

---

## 1. Alineación Vertical e Igualdad de Altura (Symmetry Parity)

El error más común en formularios complejos es la desalineación vertical provocada por textos de etiquetas de diferente longitud o controles con alturas inconsistentes en la misma fila.

### 1.1 Alturas Unificadas de Controles
* **Regla:** Todos los inputs, selectores (`CustomSelect`), textareas y botones que compartan una misma fila (`flex-row` o `grid` horizontal) **DEBEN** tener la misma clase de altura física (preferiblemente `h-10` o `h-11`).
* **Incorrecto:** Mezclar un input con padding `py-2` y un botón con `h-11` o padding `py-3` en la misma línea.
* **Directiva:** Utiliza clases de altura consistentes. Si un control usa `h-10`, todos los controles hermanos en la fila deben ajustarse a la misma altura.

### 1.2 Alineación en Grids con Textos de Cabecera Variables (Wrap Alignment)
Cuando un label de columna se envuelve en dos líneas (ej. *"Unidad de Medida"*) y el del lado en una sola (ej. *"Área"*), los controles de entrada correspondientes se desfasan.
* **Directiva:** Todos los `label` que encabecen columnas de un formulario o cuadrícula **DEBEN** tener una altura mínima unificada y alineación de contenido al extremo inferior.
* **Solución de Clase:**
  ```jsx
  <label className="flex items-end text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 h-8 leading-tight">
    Unidad de Medida
  </label>
  ```
  *Al usar `flex items-end h-8`, el texto se alinea abajo, garantizando que el borde superior de los inputs empiece exactamente en la misma línea horizontal, sin importar si el texto ocupa una o dos líneas.*

---

## 2. Separación y Espaciados Flexibles (No Collision Spacing)

### 2.1 Regla del mt-auto Colapsable (Margen Inteligente)
El uso de `mt-auto` (margen-top automático) en flexboxes verticales es vital para empujar los botones de acción al fondo de una tarjeta. Sin embargo, si la tarjeta se contrae en viewports estrechos, el margen automático se reduce a `0px`, provocando que los botones toquen el elemento superior.
* **Directiva:** Está prohibido usar `mt-auto` de forma aislada sin un espaciado de seguridad. El contenedor flex padre **SIEMPRE** debe declarar una separación base (`gap-3` o `gap-4`).
* **Incorrecto:** 
  ```jsx
  <div className="flex flex-col h-full">
    <p>Texto</p>
    <button className="mt-auto">Acción</button>
  </div>
  ```
* **Correcto:**
  ```jsx
  <div className="flex flex-col h-full gap-3">
    <p>Texto</p>
    <button className="mt-auto">Acción</button>
  </div>
  ```

### 2.2 Separación entre Botones Contiguos
Los botones nunca deben estar pegados lateralmente.
* **Directiva:** Al colocar dos o más botones juntos, agrúpalos dentro de un contenedor flex con separación explícita de al menos `gap-3` (12px).
* **Solución de Clase:**
  ```jsx
  <div className="flex gap-3">
    <button className="flex-1 ...">Cancelar</button>
    <button className="flex-1 ...">Confirmar</button>
  </div>
  ```

---

## 3. Control de Estilos Nativos del Navegador (Browser Reset)

Los navegadores inyectan estilos propios que rompen la estética premium HSL de la aplicación (menús desplegables grises, flechas numéricas invasivas, contornos de enfoque por defecto).

### 3.1 Prohibición de Selectores Nativos (`<select>`)
* **Regla:** Está terminantemente prohibido usar el elemento `<select>` nativo de HTML.
* **Directiva:** Usa en su lugar el componente `CustomSelect.jsx` provisto por el Core. Este componente se integra con la paleta de colores HSL, posee bordes redondeados congruentes y respeta las transiciones globales.

### 3.2 Ocultamiento de Spin Buttons en Inputs Numéricos
Los botones incrementales nativos (flechas arriba/abajo) de los inputs con `type="number"` deforman el diseño y la alineación horizontal de los campos en Chrome, Safari y Firefox.
* **Directiva:** Aplica siempre el reset de Tailwind para ocultar estas flechas en los campos numéricos donde se requiera simetría limpia:
* **Solución de Clase:**
  ```css
  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
  ```
* **Ejemplo:**
  ```jsx
  <input
    type="number"
    className="w-12 py-1 text-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  />
  ```

### 3.3 Anillo de Enfoque Uniforme (Outline Reset)
Los bordes de enfoque azules por defecto del navegador rompen la armonía visual de la marca.
* **Directiva:** Todo input, selector o botón interactivo debe resetear la línea de contorno nativa del explorador (`focus:outline-none`) y definir su contorno en base al HSL primario del tema o un borde suavizado:
* **Ejemplo:**
  ```jsx
  className="w-full focus:outline-none focus:border-[var(--color-primary)] transition-colors"
  ```

---

## 4. Prevención de Desbordamiento y Clipping (Overflow Shields)

Las interfaces deben funcionar al 100% en pantallas de laptops de baja resolución y teléfonos móviles sin recortar el contenido ni romper la simetría.

### 4.1 Envoltura de Tablas Obligatoria
Toda tabla tabular (`<table>`) que contenga datos dinámicos o columnas de acciones **DEBE** estar envuelta en un contenedor con desplazamiento horizontal suave para no romper el layout de la pantalla en móviles.
* **Solución de Clase:**
  ```jsx
  <div className="w-full overflow-x-auto scrollbar-thin border border-[var(--color-border)] rounded-xl">
    <table className="w-full border-collapse">
      ...
    </table>
  </div>
  ```

### 4.2 Celdas whitespace-nowrap de Seguridad
Evita que cantidades, precios, fechas y badges se dividan en dos líneas huérfanas en pantallas pequeñas.
* **Directiva:** Utiliza la clase `whitespace-nowrap` en celdas críticas (`th` y `td`) para congelar su línea de texto en una sola.
* **Ejemplo:**
  ```jsx
  <td className="p-3 text-right whitespace-nowrap font-bold">
    $ {precio.toLocaleString()}
  </td>
  ```

### 4.3 Protección contra Textos Largos (Fuga de Contenedor)
Nombres de productos o direcciones de correo electrónico muy largos empujan los elementos hermanos (como botones de acción o precios) fuera de la pantalla.
* **Directiva:** Aplica `min-w-0` en el contenedor flex hijo y las clases `truncate` o `break-words` para evitar la deformación del layout.
* **Ejemplo:**
  ```jsx
  <div className="min-w-0 flex-1">
    <p className="font-bold truncate">{nombreProductoLargo}</p>
  </div>
  ```

---

## 5. Prevención de "Acidez Visual" y Contraste de Color

La "acidez visual" se produce cuando se inyectan colores ultra-saturados (rojos, verdes, azules planos) directamente como fondos de grandes contenedores, fatigando la vista y degradando el aspecto de la aplicación.

* **Regla 60-30-10:** 
  - **60% Dominante:** Fondos limpios y neutros (`var(--color-bg)` y `var(--color-surface)`).
  - **30% Estructura:** Bordes y textos muted suaves (`var(--color-border)` y `var(--color-text-muted)`).
  - **10% Contraste:** Pinceladas cromáticas usando el color primario de marca (`var(--color-primary)`), solo en botones principales, íconos y estados activos.
* **Uso de Opacidad para Estados:** En lugar de usar alertas con fondos rojos intensos directos (`bg-red-500`), prefiere fondos con opacidad HSL que permitan ver el fondo original y resalten el texto:
  - **Recomendado:** `bg-red-500/10 text-red-500 border border-red-500/20`
  - **Evitar:** `bg-red-500 text-white font-bold` (a menos que sea un botón de eliminación destructivo de alta alerta).

---

## 6. Estándar de Botones y Estados Interactivos (Interactive Touchpoints)

Para cumplir con las pautas de accesibilidad WCAG 2.2 y evitar interfaces frustrantes en pantallas móviles, los botones deben ser consistentes tanto en dimensiones físicas como en sus estados visuales.

### 6.1 Tamaño del Objetivo Táctil (Touch Target Size)
* **Regla:** Todos los elementos interactivos (botones, enlaces, iconos de acción) **DEBEN** tener un tamaño de objetivo táctil mínimo de **44x44 CSS píxeles** (o 48x48px según Material Design).
* **Solución de Clase:** Si un botón iconográfico mide físicamente `w-8 h-8` (32px), se debe compensar el área con padding o usando un contenedor invisible de tamaño superior.
  ```jsx
  {/* Botón con área de clic extendida a 44px */}
  <button className="flex items-center justify-center w-11 h-11 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
    <Icono className="w-5 h-5" />
  </button>
  ```

### 6.2 Estados Visuales Completos y Semánticos
Todo botón o control interactivo debe declarar de manera explícita sus 5 estados de ciclo de vida visual en Tailwind:
1. **Normal (Resting):** Colores de fondo de marca estables.
2. **Hover:** Cambio de luminosidad o reducción controlada de opacidad (ej. `hover:opacity-90 transition-opacity`).
3. **Focus:** Anillo de enfoque visible con contraste >= 3:1 (ej. `focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]`).
4. **Active (Pressed):** Escala de compresión física para feedback táctil instantáneo (ej. `active:scale-[0.98] transition-all`).
5. **Loading (Cargando):** Debe bloquear clics duplicados (`disabled={loading}`), ocultar el texto original con un spinner de carga, y usar `aria-busy="true"` + `aria-live="polite"`.

### 6.3 Desactivación Semántica (Disabled State)
* **Prohibición:** Queda prohibido el uso de clases fijas como `bg-slate-200 text-slate-400` para estados deshabilitados (debido a la inversión de contraste en Modo Claro).
* **Solución de Clase:** Utilizar variables semánticas de tema que respeten la luminosidad correcta en ambos modos.
  ```jsx
  className="bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed"
  ```

---

## 7. Estándar de Elevación y Sombras Semánticas (Depth & Elevation)

La profundidad debe ser controlada de manera lógica para jerarquizar la interfaz, adaptándose perfectamente a los modos de luz.

### 7.1 Modo Claro (Sombras Suaves Multi-capa)
* **Directiva:** Evita sombras con alta opacidad de negro o sombras de color saturado. Utiliza sombras multi-capa sutiles para imitar la física de la luz natural.
* **Solución de Clase (Tailwind):**
  - Elevación Baja (Cards): `shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]`
  - Elevación Media (Dropdowns, Menús): `shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]`
  - Elevación Alta (Modales, Diálogos): `shadow-[0_12px_28px_rgba(0,0,0,0.12),0_8px_10px_rgba(0,0,0,0.08)]`

### 7.2 Modo Oscuro (Elevación Tonal de Material Design 3)
* **Regla:** En interfaces oscuras, las sombras negras son invisibles. La elevación **DEBE** expresarse aclarando progresivamente el color de fondo de las superficies (`surface tonal contrast`).
* **Directiva de Niveles:**
  - **Nivel 0 (Fondo base):** `bg-[var(--color-bg)]` (Negro o gris muy oscuro).
  - **Nivel 1 (Superficies de tarjetas):** `bg-[var(--color-surface)]` (Gris oscuro estándar).
  - **Nivel 2 (Popovers, Dropdowns, Menús flotantes):** `bg-[var(--color-surface-2)]` (Tono intermedio).
  - **Nivel 3 (Modales en primer plano):** `bg-[var(--color-surface-3)]` (Tono más claro para indicar proximidad).

---

## 8. Estándar de Listas y Botones Desplegables (Custom Dropdowns)

Al prescindir de los selectores nativos (`<select>`), los controles customizados deben asegurar total resiliencia técnica y accesibilidad.

### 8.1 Accesibilidad por Teclado y Atributos ARIA
* **Regla:** Todo dropdown personalizado debe poder operarse completamente con el teclado (`Tab` para enfocar, `ArrowDown`/`ArrowUp` para navegar, `Enter`/`Space` para seleccionar, `Esc` para cerrar).
* **Especificación ARIA:**
  - Botón desencadenante: `aria-haspopup="listbox"` y `aria-expanded={isOpen}`.
  - Lista de opciones: `role="listbox"`.
  - Opción individual: `role="option"` y `aria-selected={isSelected}`.

### 8.2 Prevención de Clipping (Corte de Layout)
* **Error Común:** El dropdown se corta visualmente o genera scrollbars no deseados cuando se abre dentro de contenedores que tienen `overflow-hidden` o `overflow-y-auto`.
* **Directiva:** Los desplegables que contengan más de 4 opciones deben renderizarse utilizando **React Portals** (`createPortal`) al final del `<body>` de la aplicación, o bien utilizar posicionamiento dinámico y absoluto (como `@floating-ui/react`) que recalcule su ubicación física en el viewport, invirtiendo su orientación hacia arriba (`placement: 'top'`) si colisiona con el borde inferior de la pantalla.

### 8.3 Adaptación Responsiva Móvil (Bottom Sheet)
* **Regla:** En dispositivos móviles (`sm` o inferiores), los desplegables con más de 6 opciones **DEBEN** dejar de renderizarse como menús flotantes pequeños para transformarse en un **Bottom Sheet** (cajón inferior) que se deslice desde la parte baja, maximizando el área útil táctil y la facilidad de lectura.

---

## 9. Estándar de Formulario Interactivos (Form Usability & Resets)

Los campos interactivos deben alinearse a las directivas de usabilidad del Nielsen Norman Group y accesibilidad W3C.

### 9.1 Relación de Label Obligatoria
* **Regla:** Todo campo de entrada debe contar con una etiqueta `label` visible. Queda prohibido delegar la función de etiqueta exclusivamente al atributo `placeholder` (ya que este desaparece al escribir y provoca desorientación cognitiva).
* **Asociación:** Asocia siempre explícitamente el label y el input utilizando `htmlFor` e `id` idénticos.
  ```jsx
  <label htmlFor="user-email">Correo Electrónico</label>
  <input id="user-email" type="email" ... />
  ```
  *(Si el diseño exige ocultar visualmente la etiqueta, utiliza la clase `sr-only` de Tailwind para mantener el soporte de lectores de pantalla).*

### 9.2 Teclados Móviles Semánticos en Inputs Numéricos (`inputmode`)
* **Regla:** Además de aplicar el reset CSS para ocultar las flechas de número, los inputs que capturen datos puramente numéricos (como códigos, teléfonos o importes) **DEBEN** declarar la propiedad `inputmode` para forzar al sistema operativo móvil (iOS/Android) a disparar el teclado numérico óptimo.
* **Directiva de Tipo:**
  - Para cantidades enteras (ej. PIN, Código): `inputmode="numeric" pattern="[0-9]*"`
  - Para importes o decimales (ej. Precios, Kilogramos): `inputmode="decimal"`

### 9.3 Control de Inputs de Fecha (`type="date"`)
* **Regla:** Para dispositivos móviles, se **DEBE** emplear la etiqueta nativa `<input type="date">` ya que aprovecha la ruleta nativa del sistema operativo (sumamente optimizada y accesible en pantallas táctiles). En entornos de escritorio, se prefiere envolver el control con librerías personalizadas para evitar discrepancias visuales drásticas entre navegadores.
* **Estilizado de Indicador Nativo (Safari/Chrome Reset):**
  ```css
  /* Estilizado del indicador del calendario nativo sin deformar el input */
  input[type="date"]::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,..."); /* Icono SVG limpio */
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
  ```
