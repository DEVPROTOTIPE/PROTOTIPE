# Biblioteca de Componentes y Estándares Técnicos de UI/UX

Este conjunto de reglas rige el desarrollo, documentación, importación e integridad de todos los componentes visuales del ecosistema PROTOTIPE.

## 1. ESTÁNDAR DE CONFIRMACIONES Y ACCIONES DE ELIMINACIÓN

- **Confirmación Obligatoria:** Ningún flujo que realice eliminación, limpieza o alteración irreversible de registros (como cancelar/eliminar citas, limpiar base de datos, purgar logs) puede ejecutarse de forma directa.
- **Uso obligatorio de useAlertConfirm:** Es obligatorio utilizar la ventana modal de confirmación promesificada de la plataforma mediante el hook `useAlertConfirm()` (de `src/components/common/AlertConfirmContext.jsx`) con `variant: 'error'` o `variant: 'warning'`, impidiendo la ejecución de la acción destructiva si el usuario no hace clic en el botón de confirmación correspondiente.

---

## 2. PROHIBICIÓN DE COMPONENTES INVENTADOS Y DEPENDENCIAS HUÉRFANAS

- **Importaciones Válidas:** Queda estrictamente prohibido importar y utilizar componentes o utilidades imaginarias que no existan en el sistema o no estén declarados en `package.json` (ej: no usar clases o componentes de soporte ficticios como `TapShield` o wrappers ad-hoc externos no pre-aprobados).
- **Consistencia en Manifiestos:** Si un nuevo componente depende de otros recursos lógicos de la biblioteca o de utilidades del sistema, estas deben registrarse obligatoriamente en el array `internal` de la sección `dependencies` del manifiesto JSON (Frontmatter de metadatos del markdown `.md`), garantizando la trazabilidad durante la inyección.

---

## 3. ESTÁNDAR DE targetPath EN MANIFIESTOS DE BIBLIOTECA

- **Prohibición de rutas Sandbox y Legacy:** Queda estrictamente prohibido que la propiedad `"targetPath"` del manifiesto JSON (comentario inicial `<!-- { ... } -->` en los markdown de la biblioteca) apunte a:
  - Directorios de Sandbox de Componentes o directorios de dev-dashboard (como `src/components/admin/sandboxes/...` o `dev-dashboard/...`).
  - Directorios legacy genéricos `src/hooks/*` o `src/services/*` para nueva lógica de negocio de features.
- **Rutas Canónicas por Tipo:** El `"targetPath"` debe definir la ubicación definitiva y limpia del componente en la base de código del cliente:
  - **Atom (`atom`):** Presentacionales puros -> `src/components/ui/[NombreTécnico].jsx`
  - **Component común (`component`):** Layouts o componentes reusables compartidos -> `src/components/common/[NombreTécnico].jsx`
  - **Feature UI (`feature`):** Acoplados a dominios de negocio -> `src/features/[featureName]/components/[NombreComponente].jsx`
  - **Repository Firebase (`repository`):** Lógica exclusiva de persistencia física -> `src/features/[featureName]/api/[featureName]Repository.js`
  - **Service / UseCase (`service`):** Lógica de negocio y validación -> `src/features/[featureName]/services/[featureName]Service.js`
  - **Hook UI State (`hook`):** Hooks que exponen estados reactivos de la feature -> `src/features/[featureName]/hooks/use[FeatureName].js`
  - **Entrypoint obligatorio:** Toda feature debe tener su API pública en `src/features/[featureName]/index.js`, desde donde se debe importar externamente de forma exclusiva.
- **Generación de Imports:** De esta ruta depende que la sentencia de "IMPORTACIÓN RECOMENDADA" en el Dashboard Central se indexe y muestre de manera limpia y correcta para el cliente final.

---

## 4. ESTÁNDAR DE PREVENCIÓN DE CONFLICTOS CSS Y CONTRASTE EN MODO CLARO (LIGHT MODE)

1. **Evitación de Conflictos de Fondo (Color Swatches):**
   - El stylesheet global del Dashboard Central (`index.css`) aplica una regla con `!important` a cualquier `div` que contenga tanto la clase `rounded-2xl` (o `rounded-3xl`) como una clase de borde (`border`). Esto sobrescribe cualquier estilo inline de `backgroundColor` con un fondo blanco/glassmorphic.
   - **Solución Obligatoria:** Cuando implementes selectores/muestrarios de colores interactivos con fondos dinámicos definidos en `style={{ backgroundColor: ... }}`, **nunca** combines `rounded-2xl`/`rounded-3xl` con clases de borde en el mismo elemento, o fuerza el inline style usando `!important` (ej. `style={{ backgroundColor: \`${color} !important\` }}`).

2. **Garantía de Contraste de Texto en Botones de Marca:**
   - La regla global del Dashboard Central sobrescribe la clase `.text-white` a negro (`!important`) cuando se encuentra dentro de contenedores oscuros si no se emplean clases nativas de fondo específicas de Tailwind.
   - **Solución Obligatoria:** Al renderizar textos blancos sobre botones que usen variables HSL cromáticas como fondo (ej. `bg-[var(--color-primary)]`), utiliza siempre de forma explícita la clase `!text-white` para garantizar la legibilidad y evitar que el texto cambie a negro en Light Mode.

3. **Z-Index y Superposición en Steppers / Líneas de Tiempo:**
   - La línea de progreso absoluta nunca debe superponerse visualmente por encima de los iconos o números de los hitos/círculos de estado.
   - **Solución Obligatoria:** Aplica `relative z-10` y un fondo sólido `bg-[var(--color-surface)]` en todos los círculos/hitos para que actúen como máscara, y asigna `z-[-1]` o `z-[-10]` absoluto al elemento que dibuja la línea de progreso para obligarlo a renderizarse por debajo.

---

## 5. ESTÁNDAR DE DISEÑO RESPONSIVO MÓVIL Y PREVENCIÓN DE DESBORDAMIENTOS

Para asegurar que todo componente sea perfectamente responsivo tanto en móvil (smartphones) como en PC, se deben seguir obligatoriamente estas reglas de maquetación:

1. **Apilamiento Vertical por Defecto (Mobile-First):**
   - Las filas de formularios, paneles de botones y barras de acciones deben estructurarse usando `flex flex-col` por defecto (móvil).
   - Solo se debe cambiar a diseño horizontal (`sm:flex-row` o `md:flex-row`) en pantallas medianas/grandes, y únicamente cuando los textos o inputs individuales no colisionen.

2. **Tabla Responsiva y Protección contra Saltos de Línea:**
   - Toda tabla (`<table>`) debe estar obligatoriamente envuelta en un contenedor con `w-full overflow-x-auto scrollbar-thin` para permitir el scroll horizontal en dispositivos móviles.
   - Aplica siempre la clase `whitespace-nowrap` en:
     - Cabeceras de tabla (`<th>`).
     - Fechas e identificadores (`L001`, `2026-07-02`).
     - Badges de estado (`span` de alertas, estados de pago).
     - Valores monetarios y cantidades (`45 und`, `$ 12.500`).

3. **Espaciados y Paddings Adaptativos:**
   - Evita el uso de paddings rígidos elevados en pantallas móviles. En su lugar, usa clases adaptativas (ej: `p-3 sm:p-5`, `gap-2 sm:gap-4`). Un padding estático de `p-6` en pantallas de 320px reduce a la mitad el área útil y causa desbordamiento de hijos.

4. **Tratamiento de Nombres y Textos Largos (Fuga de Caja):**
   - Cuando renderices nombres de productos, categorías u observaciones al lado de precios o botones en una misma fila, el texto debe estar envuelto en un contenedor con `min-w-0` y tener la clase `truncate` o `break-words` para evitar empujar los controles fuera de la pantalla.

5. **Prohibición de Anchos Rígidos en Píxeles:**
   - Queda estrictamente prohibido usar clases de ancho fijo en píxeles (como `w-[400px]` o `style={{ width: '400px' }}`) para tarjetas, formularios o modales. Usa siempre `w-full max-w-[ancho]` (ej: `w-full max-w-md`) para que se ajuste dinámicamente al viewport del móvil.

6. **Alineación Vertical de Labels en Grids:**
   - En grids horizontales con controles (`input` / `CustomSelect`), los `label` que los encabezan DEBEN tener una altura fija mínima unificada (`flex items-end h-8 mb-2 leading-tight`) para evitar desalineación cuando uno de los labels se envuelva en múltiples líneas.

7. **Espaciado Mínimo en Diseños con mt-auto:**
   - Si se usa `mt-auto` para empujar botones de acción al fondo de tarjetas flex, el contenedor padre DEBE declarar un `gap-3` o `gap-4` de seguridad para prevenir colapso de margen en pantallas pequeñas.

8. **Ocultamiento de Spinners en Campos Numéricos:**
   - En inputs de tipo `number`, se debe aplicar el reseteo `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none` para evitar las flechas nativas invasivas y desalineadas del navegador.

9. **Prohibición de Alturas Rígidas con Texto Variable (Clamping de Altura):**
   - Queda estrictamente prohibido usar clases de altura fija exclusiva (como `h-10` o `h-11`) en botones, inputs, alertas o tarjetas que contengan texto variable susceptible de envolverse a múltiples líneas en viewports pequeños o columnas estrechas.
   - En su lugar, usa paddings verticales explícitos combinados con una altura mínima (ej: `py-2.5 px-4 min-h-[44px] h-auto` en vez de `h-11`) para que el contenedor crezca de forma segura si el texto se envuelve, protegiendo los márgenes internos y evitando colisiones de texto.

10. **Prohibición de Slate Fijo para Estados Deshabilitados (Evitación de Inversión de Contraste):**
    - Debido a la inversión semántica de la escala `slate` en Modo Claro (donde `slate-200` se vuelve oscuro y `slate-400` se vuelve claro/medio), queda estrictamente prohibido usar clases fijas como `bg-slate-200 text-slate-400` para estados deshabilitados (disabled).
    - En su lugar, usa variables semánticas de tema que respeten la luminosidad correcta en ambos modos. La combinación estándar de referencia para elementos deshabilitados (como botones y inputs) es:
      `bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed`
      Esto garantiza una perfecta visualización y contraste tanto en Modo Oscuro como en Modo Claro sin colisión de tonos.

11. **Tamaño Mínimo de Botones y Estados Interactivos (Touch Target WCAG):**
    - Todos los elementos interactivos o botones de acción deben tener un tamaño táctil mínimo de **44x44 CSS px** (WCAG 2.2). Si un icono mide `w-8 h-8`, se debe envolver en un botón de tamaño superior o agregar padding.
    - Se deben declarar explícitamente en Tailwind los 5 estados interactivos: Normal, `hover:opacity-90 transition-opacity`, `focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] focus:outline-none`, `active:scale-[0.98] transition-all`, y Loading (deshabilitar clic + spinner con aria-live).

12. **Jerarquía de Sombras y Elevación Tonal Semántica:**
    - *Light Mode:* Utiliza sombras multi-capa sutiles translúcidas: `shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]` (dropdowns/menús) y `shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]` (tarjetas).
    - *Dark Mode:* Queda prohibido el uso de sombras negras. Se debe aplicar la elevación tonal de Material Design 3 aclarando progresivamente los fondos de superficie: base (`bg-[var(--color-bg)]`) -> tarjetas (`bg-[var(--color-surface)]`) -> popovers (`bg-[var(--color-surface-2)]`) -> modales en primer plano (`bg-[var(--color-surface-3)]`).

13. **Resiliencia en Dropdowns y Prevención de Clipping:**
    - Todo dropdown customizado debe ser accesible vía teclado (Tab, flechas, Esc, Enter) y declarar roles ARIA (`role="listbox"`, `aria-expanded`).
    - Para evitar que los desplegables se corten visualmente en contenedores con `overflow-hidden` o `overflow-y-auto`, se deben renderizar usando **React Portals** (`createPortal`) al final del body o utilizando posicionamiento dinámico absoluto con ajuste automático (`placement: 'top'` si hay colisión inferior).
    - En viewports móviles (`sm` o inferior), los desplegables de más de 6 opciones se deben renderizar obligatoriamente como un **Bottom Sheet** deslizable.

14. **Usabilidad en Formularios y Disparadores Móviles (inputmode):**
    - Todo input interactivo debe estar enlazado explícitamente a un `label` visible utilizando `htmlFor` e `id` coincidentes (para ocultar visualmente usar `sr-only`). Queda prohibido delegar la descripción únicamente al `placeholder`.
    - Los inputs numéricos deben declarar obligatoriamente la propiedad `inputmode` para forzar el teclado óptimo en móviles: cantidades enteras -> `inputmode="numeric" pattern="[0-9]*"`, decimales/precios -> `inputmode="decimal"`.
    - En viewports móviles, se prefiere `<input type="date">` nativo para aprovechar las ruletas de fecha optimizadas del SO móvil, estilizando el indicador de calendario vía `-webkit-calendar-picker-indicator` con opacidades suaves.

---

## 6. ESTÁNDAR DE IMPORTACIONES Y LINTER PREBUILD (React)

1. **Validación Prebuild:** Toda nueva pantalla, componente o playground inyectado debe validarse obligatoriamente ejecutando `npm run build` en el entorno local del proyecto.
2. **Auto-Corrección Inmediata:** Si el build devuelve un error de linter o compilación de React, la IA debe analizar las variables importadas, inyectar los hooks omitidos (`useState`, `useEffect`, `useMemo`, `useCallback`, etc.), y corregir los fallos proactivamente en ese mismo turno antes de reportar la tarea como finalizada.

---

## 7. ESTÁNDAR DE DESIGN INTEGRITY GUARD (OBLIGATORIO)

Toda nueva clase, componente o layout inyectado o modificado en el ecosistema debe pasar la verificación del Design Integrity Guard a través del script `validate-core-integrity.js`.

### Prohibiciones Críticas (Causan fallo de validación / exit 1):
1. **Anchos fijos en píxeles en layouts/cards/grids**: Queda prohibido usar clases de ancho fijo como `w-[300px]` hasta `w-[999px]`. Usa `w-full`, `max-w-*`, `minmax()`, `clamp()` o container queries.
2. **Colores Hexadecimales Hardcodeados**: Queda prohibido el uso de valores hexadecimales hardcodeados (como `bg-[#ef4444]`, `text-[#333]`) en clases de Tailwind. Todo el color debe consumirse de los tokens HSL del tema: `var(--color-*)`.
3. **Sombras sucias/negras planas**: Queda prohibido usar clases de sombra negra por defecto como `shadow-black`, `shadow-black/*` o sombras duras arbitrarias con opacidad negra. Usa los tokens de sombras HSL suaves: `shadow-soft-sm`, `shadow-soft-md` y `shadow-soft-lg`.

### Advertencias y Sugerencias de Diseño (Warnings no bloqueantes):
1. **Colores Tailwind Estáticos**: Se desaconseja el uso de colores Tailwind estáticos (como `bg-red-500`, `text-blue-600`) fuera de los componentes de feedback autorizados (alerta, toast, badges). Utiliza variables del tema `var(--color-surface)`, `var(--color-on-surface)`, etc.
2. **Grids móviles unsafe**: Queda prohibido declarar `grid-cols-2` de forma directa en móvil sin breakpoint responsivo. Utiliza la utilidad responsiva `.grid-responsive-2` (que aplica `minmax(min(100%, 150px), 1fr)`) para evitar desbordamientos.

### Tipografías y Carga de Fuentes:
1. Las fuentes *Outfit* (para títulos) e *Inter* (para cuerpo) se cargan en el HTML central mediante preconnect y `display=swap`.
2. Las variables de tipografía a usar en Tailwind v4 son `var(--font-sans)` y `var(--font-display)`. Se define la utilidad `.font-display` para títulos.
