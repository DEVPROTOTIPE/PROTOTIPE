<!--
{
  "resource": "CarrucelProductos",
  "technicalName": "CarrucelProductos",
  "targetPath": "src/components/ui/CarrucelProductos.jsx",
  "dependencies": {
    "npm": {
      "lucide-react": "^0.400.0",
      "framer-motion": "^11.0.0"
    },
    "internal": []
  },
  "type": "component",
  "niches": [
    "retail_clothing",
    "grocery_food",
    "alimentos-artesanales",
    "distribuidoras-beauty",
    "petshops-locales",
    "moda-local-calzado",
    "alimentacion-saludable",
    "home-office-ergonomia",
    "licores-cocteleria",
    "coleccionismo-geek"
  ]
}
-->

# Carrucel de Productos (`CarrucelProductos`)

## 1. Propósito y Casos de Uso
El componente `CarrucelProductos` es una cuadrícula deslizable y responsiva diseñada para mostrar colecciones de productos destacados, ofertas de temporada o recomendaciones en e-commerce y catálogos interactivos. 

### Casos de uso típicos:
- **Home de Tienda:** Sección de "Novedades" u "Ofertas del Día".
- **Recomendaciones Cruzadas:** Bloque "También te puede interesar" en el detalle de un producto.
- **Campañas Especiales:** Mostrar colecciones filtradas (ej. barbería, retail) con navegación fluida.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
El componente adopta la estética de marca blanca de la plataforma, respondiendo a las variables HSL de los temas:
- **Tarjetas de Producto:** Bordes muy sutiles (`border-[var(--color-border)]`) y fondos oscuros o claros adaptativos (`bg-[var(--color-surface)]`).
- **Navegación:** Botones laterales circulares translúcidos (`backdrop-blur-md`) que aparecen únicamente al pasar el cursor (hover) para no saturar la vista.
- **Responsividad:** 
  - Móvil: 1 tarjeta visible a la vez.
  - Tablet (sm/md): 2 tarjetas visibles.
  - Desktop (lg/xl): 3 a 4 tarjetas según la resolución.
- **Arrastre Fluido (Swipe/Drag):** Implementación nativa de gestos con mouse y tacto para una navegación rápida en dispositivos móviles.

---

## 3. Código React Completo
A continuación se presenta el código portable del componente. Es autocontenido y utiliza variables HSL.

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Star } from 'lucide-react';

export default function CarrucelProductos({
  products = [],
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  onAddToCart = () => {}
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [addedIds, setAddedIds] = useState({});
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Determinar cuántos productos se muestran por vista (simulado para el cálculo del índice máximo)
  const [visibleSlides, setVisibleSlides] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (!carouselRef.current) return;
      const width = carouselRef.current.offsetWidth;
      if (width < 640) {
        setVisibleSlides(1);
      } else if (width < 1024) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleSlides);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay Effect
  useEffect(() => {
    if (autoPlay && maxIndex > 0) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayInterval, nextSlide, maxIndex]);

  // Scroll manual sincronizado con el currentIndex
  useEffect(() => {
    if (carouselRef.current && !isDrag) {
      const slideWidth = carouselRef.current.scrollWidth / products.length;
      carouselRef.current.scrollTo({
        left: currentIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, products.length, isDrag]);

  // Gestores de arrastre (Swipe/Drag)
  const handleMouseDown = (e) => {
    setIsDrag(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDrag) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Factor de velocidad
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDrag) return;
    setIsDrag(false);
    
    // Ajustar al slide más cercano al soltar
    const slideWidth = carouselRef.current.scrollWidth / products.length;
    const rawIndex = carouselRef.current.scrollLeft / slideWidth;
    const nearestIndex = Math.min(maxIndex, Math.max(0, Math.round(rawIndex)));
    setCurrentIndex(nearestIndex);
  };

  const handleTouchStart = (e) => {
    setIsDrag(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDrag) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleAddToCartFeedback = (product) => {
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    onAddToCart(product);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full py-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] text-xs">
        No hay productos para mostrar en el carrusel.
      </div>
    );
  }

  return (
    <div className="relative w-full group/carrusel select-none">
      {/* Flechas de Navegación */}
      {showArrows && maxIndex > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--color-surface)]/85 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center cursor-pointer shadow-md hover:bg-[var(--color-primary)] hover:text-white transition-all duration-350 opacity-0 group-hover/carrusel:opacity-100 outline-none"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--color-surface)]/85 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center cursor-pointer shadow-md hover:bg-[var(--color-primary)] hover:text-white transition-all duration-350 opacity-0 group-hover/carrusel:opacity-100 outline-none"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Contenedor del Carrusel */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
                className="w-full flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing scrollbar-none py-2 select-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((prod) => {
          const isAdded = addedIds[prod.id];
          const hasImage = prod.image && (prod.image.startsWith('http') || prod.image.startsWith('/') || prod.image.startsWith('data:'));
          
          return (
            <div
              key={prod.id}
              className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] shrink-0 p-4 rounded-[24px] bg-[var(--color-surface)] border border-[var(--color-border)]/65 shadow-md hover:border-[var(--color-primary)]/45 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Imagen y Descuento */}
              <div className="relative aspect-square w-full rounded-[20px] overflow-hidden bg-[var(--color-surface)]/10 dark:bg-[var(--color-bg)]/20 border border-[var(--color-border)]/30 mb-3 flex items-center justify-center group/img">
                {hasImage ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-500 select-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 select-none">
                    <span className="text-4xl">{prod.image || '📦'}</span>
                  </div>
                )}
                {prod.discount && (
                  <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md z-10">
                    -{prod.discount}%
                  </div>
                )}
              </div>

              {/* Detalles */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      {prod.category}
                    </span>
                    {prod.rating && (
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star size={8} fill="currentColor" />
                        <span className="text-[8px] font-mono font-bold">{prod.rating}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[var(--color-text)] truncate mt-1">
                    {prod.name}
                  </h4>
                </div>

                <div className="pt-2 mt-2 border-t border-[var(--color-border)]/35 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    {prod.discount ? (
                      <>
                        <span className="text-[8px] line-through text-[var(--color-text-muted)] font-mono">
                          ${prod.price}
                        </span>
                        <span className="text-xs font-black text-[var(--color-primary)] font-mono">
                          ${Math.round(prod.price * (1 - prod.discount / 100))}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-black text-[var(--color-text)] font-mono">
                        ${prod.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Botón Añadir */}
                  <button
                    onClick={() => handleAddToCartFeedback(prod)}
                    className={`h-7 px-3.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-bold transition-all border cursor-pointer outline-none ${
                      isAdded
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white hover:scale-[1.03]'
                    }`}
                  >
                    {isAdded ? (
                      <span>¡Añadido!</span>
                    ) : (
                      <>
                        <ShoppingBag size={10} />
                        <span>Añadir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de Posición (Dots) */}
      {showDots && maxIndex > 0 && (
        <div className="flex justify-center gap-1.5 mt-3.5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-350 border-none ${
                currentIndex === idx ? 'w-5 bg-[var(--color-primary)]' : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]/50'
              }`}
              aria-label={`Ir al grupo de productos ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
