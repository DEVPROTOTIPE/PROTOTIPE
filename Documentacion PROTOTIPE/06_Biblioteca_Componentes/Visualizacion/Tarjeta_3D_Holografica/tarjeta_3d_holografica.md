# Tarjeta 3D Holográfica (`HolographicTiltCard`)

Componente de tarjeta interactiva con efecto de rotación 3D física y reflejo holográfico dinámico. Captura la posición relativa del cursor en caliente para inclinar la superficie en el espacio 3D y renderizar un destello de luz metalizado que sigue al puntero.

---

## 1. Propósito y Casos de Uso
- **Destacar Elementos Clave:** Ideal para tarjetas de productos destacados, llamadas a la acción (CTAs) de conversión, o planes de precios recomendados.
- **Aesthetic Premium:** Aporta una experiencia inmersiva e interactiva premium en el escritorio.
- **Marca Blanca Adaptable:** El brillo metálico y los degradados consumen variables HSL que se fusionan con el fondo oscuro de la aplicación.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Perspectiva 3D:** Aplica propiedades de estilo en línea utilizando `transform: perspective(1000px) rotateX() rotateY() scale3d()`.
- **Efecto Glare (Luz):** Contenedor absoluto superpuesto con opacidad variable, degradado radial y modo de mezcla de capas `mix-blend-mode: color-dodge` o `screen` para simular un reflejo de luz real sobre plástico o cristal.
- **Efecto de Retorno Amortiguado:** Al retirar el cursor (`onMouseLeave`), las transformaciones transicionan suavemente a cero utilizando `transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)` para un movimiento orgánico.

---

## 3. Código React Completo

```jsx
import React, { useState, useRef } from 'react';

export default function HolographicTiltCard({
  children,
  maxTilt = 15, // Grados máximos de inclinación
  perspective = 1000, // Intensidad de la perspectiva 3D (en px)
  scale = 1.02, // Factor de escala en hover
  className = ''
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    // Dimensiones y ubicación física de la tarjeta
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Posición relativa del puntero respecto a la tarjeta
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Posición porcentual respecto al centro (-0.5 a 0.5)
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    // Calcular ángulos de rotación en 3D
    const rotateX = (-yPct * maxTilt).toFixed(2);
    const rotateY = (xPct * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'none' // Desactivamos transiciones durante el movimiento para fluidez de fotogramas
    });

    // Calcular reflejo holográfico de luz dinámico (Glare overlay)
    const glareX = (mouseX / width * 100).toFixed(2);
    const glareY = (mouseY / height * 100).toFixed(2);

    setGlareStyle({
      opacity: 0.25,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%)`,
      mixBlendMode: 'screen',
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    // Al salir restauramos los valores de forma elástica
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    setGlareStyle({
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl transition-shadow shadow-md hover:shadow-indigo-500/10 cursor-pointer ${className}`}
    >
      {/* Glare reflectivo holográfico */}
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={glareStyle} 
      />

      {/* Contenido de la tarjeta */}
      <div className="relative z-2">
        {children}
      </div>
    </div>
  );
}
```
