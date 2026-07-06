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
