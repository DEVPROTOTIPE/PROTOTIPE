<!--
{
  "technicalName": "InfiniteLogoMarquee",
  "targetPath": "src/components/ui/InfiniteLogoMarquee.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": [
    "retail_clothing",
    "moda-local-calzado",
    "distribuidoras-beauty",
    "coleccionismo-geek"
  ]
}
-->

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
- **Animación Click Pop:** Al hacer tap o click en un logo, se activa un efecto de rebote de escala elástica (`animate-click-pop`) con un destello de sombra resplandeciente.
- **Logos Grandes:** Tarjetas escaladas a `w-44 h-20` con un área de imagen optimizada de `max-w-[110px] max-h-[40px]`.

---

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

export default function InfiniteLogoMarquee({
  items = [], // Array de objetos { id, imageUrl, alt, name }
  speed = 'fast', // 'slow' | 'medium' | 'fast'
  pauseOnHover = true,
  className = ''
}) {
  const [activeClickId, setActiveClickId] = useState(null);

  // Configuración de velocidades (duración del ciclo en segundos)
  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  }[speed] || '25s';

  // Duplicamos los items para garantizar el bucle infinito sin saltos visuales
  const doubleItems = [...items, ...items, ...items];

  const handleItemClick = (id) => {
    setActiveClickId(id);
    setTimeout(() => {
      setActiveClickId(null);
    }, 300);
  };

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
        @keyframes clickPop {
          0% { transform: scale(1); }
          30% { transform: scale(0.85); }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: customMarquee var(--marquee-speed) linear infinite;
        }
        .marquee-container:hover .animate-marquee-infinite {
          animation-play-state: var(--marquee-hover-state, running);
        }
        .animate-click-pop {
          animation: clickPop 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
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
          {doubleItems.map((item, idx) => {
            const uniqueId = `${item.id}-${idx}`;
            const isClicked = activeClickId === uniqueId;

            return (
              <div
                key={uniqueId}
                onClick={() => handleItemClick(uniqueId)}
                className={`flex-shrink-0 group relative flex items-center justify-center px-6 py-4 w-44 h-20 rounded-[24px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 cursor-pointer overflow-hidden select-none ${
                  isClicked ? 'animate-click-pop border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)] z-20' : ''
                }`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.alt || item.name}
                    className="max-w-[110px] max-h-[40px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0 dark:brightness-0 dark:invert select-none pointer-events-none"
                  />
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors truncate">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```
