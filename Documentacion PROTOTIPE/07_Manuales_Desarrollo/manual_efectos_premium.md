# Manual de Efectos Visuales e Interactividad Premium (Design Studio Ecosistema)

Este manual técnico detalla la física de rotación 3D, el enmascaramiento compuesto XOR para contornos láser (Border Beam) y las técnicas de aceleración por hardware (GPU) para inyectar efectos visuales premium en las aplicaciones del ecosistema, complementado con las últimas tendencias de la web (Aurora, Sparkles y Proximity Glow).

---

## 1. Inclinación 3D Física e Iluminación Reflectiva (Holographic Glare)

Para lograr una rotación tridimensional en tiempo real sobre el cursor sin sobrecargar el hilo de renderizado (eliminando el lag sintético), calculamos dinámicamente los ángulos de inclinación y el brillo reflectivo basándonos en la GPU.

### Ecuación de Rotación Física
Dado un contenedor con dimensiones físicas $W$ (ancho) y $H$ (alto) obtenidas mediante `getBoundingClientRect()`, y las coordenadas del cursor $(clientX, clientY)$ relativas a la pantalla:

1. **Coordenadas locales de impacto:**
   $$x = clientX - left$$
   $$y = clientY - top$$

2. **Normalización respecto al centro de la tarjeta (Rango $[-0.5, 0.5]$):**
   $$x_{pct} = \frac{x}{W} - 0.5$$
   $$y_{pct} = \frac{y}{H} - 0.5$$

3. **Ángulos de Rotación 3D en Grados ($rotateX$, $rotateY$):**
   $$rotateX = -y_{pct} \times maxTilt$$
   $$rotateY = x_{pct} \times maxTilt$$

> [!NOTE]
> Para lograr que la tarjeta se incline **hacia** el cursor, $rotateX$ debe tener signo negativo respecto al eje vertical y $rotateY$ signo positivo respecto al eje horizontal.

### Capa de Reflejo Glare (Brillo Holográfico)
El destello de brillo sigue de manera idéntica el foco del mouse utilizando la posición porcentual normalizada (de $0\%$ a $100\%$):
$$glareX = \frac{x}{W} \times 100$$
$$glareY = \frac{y}{H} \times 100$$

El fondo se calcula dinámicamente como un gradiente radial y se aplica con `mix-blend-mode: color-dodge` o `screen` para fundir el destello en las capas inferiores:
```javascript
background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, color-mix(in srgb, var(--color-primary) 18%, transparent) 45%, transparent 75%)`
```

---

## 2. Haz de Luz Láser Compuesto (Border Beam)

Para evitar que el haz perimetral se filtre en tarjetas con fondo translúcido, implementamos un **enmascaramiento compuesto XOR**. Esto recorta la zona interior (content-box) de la exterior (border-box), logrando que el centro de la tarjeta sea 100% translúcido sin requerir divs de relleno.

### Código CSS y Keyframes de Alto Rendimiento

```css
@theme {
  --animate-border-beam: border-beam-spin 4s linear infinite;
  
  @keyframes border-beam-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

@utility border-beam-container {
  position: relative;
  border-radius: var(--radius-card, 12px);
}

@utility border-beam {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  padding: var(--border-beam-width, 1.5px);
  
  /* Máscara de recorte compuesto para dejar transparente el interior */
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@utility border-beam::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: conic-gradient(
    from 0deg,
    transparent 60%,
    var(--color-primary) 85%,
    var(--color-secondary) 95%,
    transparent 100%
  );
  animation: var(--animate-border-beam);
  will-change: transform;
}
```

---

## 3. Efectos de Fondo Acelerados por Hardware (Dynamic Canvas)

### A) Malla Fluida (Mesh Gradient)
Creamos "orbs" (esferas de color) físicas que se trasladan con `translate3d(x,y,0)` y rotan en su propia capa de composición. La mezcla y desenfoque se aplican mediante un contenedor estático superior con blur pre-calculado por la GPU.

```css
@theme {
  --animate-mesh-1: mesh-float-1 25s infinite alternate ease-in-out;
  --animate-mesh-2: mesh-float-2 20s infinite alternate ease-in-out;

  @keyframes mesh-float-1 {
    0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
    50% { transform: translate3d(20%, 15%, 0) rotate(180deg) scale(1.25); }
    100% { transform: translate3d(-10%, 30%, 0) rotate(360deg) scale(0.9); }
  }
  @keyframes mesh-float-2 {
    0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1.1); }
    50% { transform: translate3d(-25%, -20%, 0) rotate(-180deg) scale(0.8); }
    100% { transform: translate3d(15%, -10%, 0) rotate(-360deg) scale(1.05); }
  }
}
```

### B) Aurora Background (Efecto Northern Lights)
Un efecto de aurora líquida cromática suave que transiciona y cambia su forma orgánica de manera infinita sobre el fondo.

```css
@theme {
  --animate-aurora: aurora-shift 60s linear infinite;

  @keyframes aurora-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
}

@utility aurora-canvas {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary) 12%, transparent),
    color-mix(in srgb, var(--color-accent) 15%, transparent),
    color-mix(in srgb, var(--color-primary-dark) 8%, transparent)
  );
  background-size: 400% 400%;
  animation: var(--animate-aurora);
  filter: blur(60px);
  will-change: background-position;
  z-index: -15;
}
```

---

## 4. Efectos de Borde Interactivos de Internet (Card Proximity Glow)

En lugar de sombras de caja fijas, se proyecta un brillo cromático interactivo (glow) que persigue la proximidad del cursor para crear un efecto dinámico de profundidad en tarjetas.

```javascript
// React handler para proximidad del cursor
const handleMouseMove = (e, cardRef) => {
  if (!cardRef.current) return;
  const rect = cardRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  cardRef.current.style.setProperty('--mouse-x', `${x}px`);
  cardRef.current.style.setProperty('--mouse-y', `${y}px`);
};
```

```css
@utility proximity-glow-card {
  position: relative;
}

@utility proximity-glow-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(
    800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
    color-mix(in srgb, var(--color-primary) 18%, transparent),
    transparent 40%
  );
  z-index: -1;
  pointer-events: none;
}
```
