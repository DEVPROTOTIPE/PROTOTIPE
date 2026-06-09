# Marquesina de Marcas Infinita (`InfiniteLogoMarquee`)

Componente de marquesina (ticker) infinita horizontal de alto rendimiento. Diseñado para mostrar logos de clientes, marcas aliadas o trust badges con una animación continua que desacelera suave y elásticamente al pasar el cursor (hover).

---

## 1. Propósito y Casos de Uso
- **Social Proof:** Ideal para secciones de "Clientes Satisfechos" o "Marcas que confían en nosotros".
- **Visual Candy:** Añade un elemento dinámico e interactivo de movimiento a páginas de inicio o landings comerciales.
- **Marca Blanca:** Los contenedores y bordes respetan los degradados y variables HSL configuradas para cada cliente.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Filtro de Desvanecimiento Lateral:** Bordes izquierdo y derecho del contenedor con gradiente de máscara lineal (`mask-image: linear-gradient()`) para lograr un efecto de entrada/salida difuminada ("fade edges").
- **Movimiento Continuo:** Animación por fotogramas clave en CSS (`@keyframes marquee`) que traslada el contenido de `0%` a `-50%` de su anchura.
- **Ralentización en Hover:** Al pasar el cursor, el contenedor añade una clase que transiciona la velocidad de la animación (`animation-duration` o `animation-play-state: paused` con transición elástica de escala local en el logo enfocado).

---

## 3. Código React Completo

```jsx
import React from 'react';

export default function InfiniteLogoMarquee({
  items = [], // Array de objetos { id, imageUrl, alt, name }
  speed = 'fast', // 'slow' | 'medium' | 'fast'
  pauseOnHover = true,
  className = ''
}) {
  // Configuración de velocidades (duración del ciclo en segundos)
  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  }[speed] || '25s';

  // Duplicamos los items para garantizar el bucle infinito sin saltos visuales
  const doubleItems = [...items, ...items, ...items];

  return (
    <div className={`relative w-full overflow-hidden py-4 ${className}`}>
      {/* Máscara degradada a los extremos izquierdo/derecho para el efecto fade */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />

      {/* Estilos CSS embebidos para keyframes específicos del marquee sin dependencias externas */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: customMarquee var(--marquee-speed) linear infinite;
        }
        .marquee-container:hover .animate-marquee-infinite {
          animation-play-state: var(--marquee-hover-state, running);
        }
      `}} />

      {/* Contenedor del Ticker */}
      <div 
        className="marquee-container w-full"
        style={{
          '--marquee-speed': speedDuration,
          '--marquee-hover-state': pauseOnHover ? 'paused' : 'running'
        }}
      >
        <div className="animate-marquee-infinite gap-6 flex items-center">
          {doubleItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 group relative flex items-center justify-center p-5 min-w-[120px] h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.alt || item.name} 
                  className="max-w-[80px] max-h-[32px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none filter grayscale group-hover:grayscale-0"
                />
              ) : (
                <span className="text-xs font-mono font-black text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```
