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
