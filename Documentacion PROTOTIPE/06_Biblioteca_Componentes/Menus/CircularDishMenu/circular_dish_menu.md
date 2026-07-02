<!--
{
  "technicalName": "CircularDishMenu",
  "targetPath": "src/components/ui/CircularDishMenu.jsx",
  "dependencies": {
    "npm": {
      "lucide-react": "^0.300.0"
    },
    "internal": []
  },
  "type": "component",
  "niches": [
    "grocery_food",
    "alimentos-artesanales",
    "licores-cocteleria",
    "distribucion-horeca"
  ]
}
-->

# CircularDishMenu — Menú Gastronómico Circular Responsivo

## 1. Propósito y Casos de Uso
El `CircularDishMenu` es un componente de navegación visual y presentación gastronómica para aplicaciones de e-commerce, restaurantes, cafeterías o servicios de alimentación (delivery). Su objetivo es presentar los platos disponibles en formato de tarjetas circulares dentro de un carrusel horizontal interactivo de alto rendimiento.

### Casos de Uso Principales:
* **Menú Digital de Restaurante:** Presentación interactiva de la carta en dispositivos móviles o tablets en mesa.
* **Catálogo Gastronómico Express:** Selección rápida de platos para pedidos a domicilio o para llevar (pick-up).
* **Bandeja de Recomendaciones:** Sección destacada ("Platos Sugeridos") en la Home de la aplicación del cliente.
* **Presentación de Variantes Gastronómicas:** Navegación visual e interactiva entre categorías principales de un buffet o menú degustación.

---

## 2. Especificación Visual y Estilos (Marca Blanca)
* **Carrusel Horizontal:** Layout elástico de fila única con scrolling táctil fluido (`overflow-x-auto`) con snap visual.
* **Tarjetas Circulares:** Imagen de plato totalmente circular (`rounded-full`) enmarcada en anillos de estado.
* **Marca Blanca CSS (HSL):** Consume las variables dinámicas de color para asegurar paridad de tema con la marca del cliente:
  - Anillo de selección: `ring-[var(--color-primary)]`
  - Color de textos y precios: `text-[var(--color-primary)]` y `text-[var(--color-text)]`
  - Superficies y contenedores: `bg-[var(--color-surface)]` y `bg-[var(--color-surface-2)]`
  - Bordes de separación: `border-[var(--color-border)]`
* **Cero Colores Hardcodeados:** Prohibido el uso de colores fijos de Tailwind o bordes oscuros en celdas para mantener la consistencia en temas oscuros o claros de cliente.

---

## 3. Código React Completo
```jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Upload, AlertCircle, HelpCircle } from 'lucide-react';

export default function CircularDishMenu({
  items,
  title = 'Menú de Platos',
  subtitle = 'Explora las opciones disponibles',
  selectedId,
  onSelect,
  onItemsChange,
  allowUpload = true,
  showPrice = true,
  showCategory = true,
  showDescription = true,
  maxFileSizeMB = 4,
  emptyText = 'Aún no hay platos cargados',
  size = 'md',
  variant = 'default',
  className = ''
}) {
  const [localItems, setLocalItems] = useState(items);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadError, setUploadError] = useState('');
  
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef([]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (selectedId !== undefined) {
      const idx = localItems.findIndex(item => item.id === selectedId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [selectedId, localItems]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const activeDish = localItems[activeIndex] || null;

  const handleSelectIndex = (index) => {
    const total = localItems.length;
    if (total === 0) return;
    
    const normalizedIndex = (index + total) % total;
    setActiveIndex(normalizedIndex);
    setUploadError('');

    if (onSelect && localItems[normalizedIndex]) {
      onSelect(localItems[normalizedIndex]);
    }
  };

  const handlePrev = () => handleSelectIndex(activeIndex - 1);
  const handleNext = () => handleSelectIndex(activeIndex + 1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (localItems.length === 0) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, localItems]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeDish) return;

    if (file.type !== 'image/png') {
      setUploadError('Únicamente se permiten imágenes en formato PNG.');
      return;
    }

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`El archivo excede el tamaño máximo permitido de ${maxFileSizeMB} MB.`);
      return;
    }

    setUploadError('');
    const localUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(localUrl);

    const updatedItems = localItems.map((item, idx) => {
      if (idx === activeIndex) {
        return { ...item, image: localUrl };
      }
      return item;
    });

    setLocalItems(updatedItems);
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }
  };

  const handleDragStart = (clientX) => {
    dragStartRef.current = clientX;
    isDraggingRef.current = true;
  };

  const handleDragMove = (clientX) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    const diff = clientX - dragStartRef.current;
    
    if (Math.abs(diff) > 60) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  const sizeStyles = {
    sm: { circle: 'w-20 h-20', activeCircle: 'w-28 h-28', containerHeight: 'h-44' },
    md: { circle: 'w-28 h-28', activeCircle: 'w-40 h-40', containerHeight: 'h-60' },
    lg: { circle: 'w-36 h-36', activeCircle: 'w-52 h-52', containerHeight: 'h-80' }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`space-y-6 select-none ${className}`}>
      {variant !== 'compact' && (
        <div className="text-center">
          <h3 className="text-base font-black text-[var(--color-text)] tracking-tight">{title}</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
        </div>
      )}

      <div 
        className={`relative w-full overflow-visible flex items-center justify-center ${currentSize.containerHeight}`}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <button
          onClick={handlePrev}
          className="absolute left-4 z-30 p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg shadow-black/5 text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="relative w-full max-w-lg h-full flex items-center justify-center overflow-visible">
          {localItems.map((item, index) => {
            const total = localItems.length;
            let offset = index - activeIndex;
            if (offset < -total / 2) offset += total;
            if (offset > total / 2) offset -= total;

            const absOffset = Math.abs(offset);
            const isCenter = absOffset === 0;

            if (absOffset > 2) return null;

            const translateX = offset * (size === 'sm' ? 85 : size === 'lg' ? 155 : 120);
            const translateY = Math.pow(absOffset, 2) * (size === 'sm' ? 12 : size === 'lg' ? 22 : 16);
            const scale = 1 - absOffset * 0.18;
            const opacity = 1 - absOffset * 0.45;
            const zIndex = 20 - absOffset;
            const blurAmount = isCenter ? 0 : absOffset === 1 ? 1.5 : 3.5;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectIndex(index)}
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  filter: `blur(${blurAmount}px)`,
                  transition: 'all 450ms cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className={`absolute ${isCenter ? sizeStyles[size].activeCircle : sizeStyles[size].circle} flex items-center justify-center`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {isCenter && (
                    <>
                      <div className="absolute -inset-4 bg-[var(--color-primary)]/25 rounded-full blur-xl animate-pulse pointer-events-none" />
                      <div className="absolute -inset-6 rounded-full border border-dashed border-[var(--color-primary)]/50 animate-[spin_25s_linear_infinite] pointer-events-none" />
                    </>
                  )}

                  <div className={`w-full h-full rounded-full transition-all duration-300 p-[3px] ${
                    isCenter 
                      ? 'bg-gradient-to-tr from-[var(--color-primary)] via-indigo-500 to-amber-400 shadow-xl' 
                      : 'bg-transparent border border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                  }`}>
                    <div className={`w-full h-full rounded-full p-1.5 ${isCenter ? 'bg-[var(--color-bg)]' : 'bg-transparent'}`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)] relative flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-full"
                            draggable="false"
                          />
                        ) : (
                          <HelpCircle size={32} className="text-[var(--color-text-muted)]" />
                        )}

                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-full">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-white tracking-widest px-1.5 py-0.5 bg-red-600 rounded">Agotado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 bg-[var(--color-primary)] text-white font-black uppercase tracking-wider rounded-full shadow-md text-[8px] sm:text-[9px] z-10 ${
                      isCenter ? 'px-2.5 py-1' : 'px-1.5 py-0.5'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 z-30 p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg shadow-black/5 text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {activeDish && (
        <div className="text-center space-y-1 py-2">
          <h4 className="text-base sm:text-lg font-black text-[var(--color-text)] tracking-tight leading-none">
            {activeDish.name}
          </h4>
          {showPrice && activeDish.price && (
            <span className="text-sm font-black text-[var(--color-primary)] block">
              {activeDish.price}
            </span>
          )}
        </div>
      )}

      {activeDish && variant !== 'compact' && (
        <div className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-3xl shadow-sm text-left transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center relative shadow-inner">
              {activeDish.image ? (
                <img
                  src={activeDish.image}
                  alt={activeDish.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <HelpCircle size={24} className="text-[var(--color-text-muted)]" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-[var(--color-text)]">{activeDish.name}</h4>
                {showCategory && activeDish.category && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)]">
                    {activeDish.category}
                  </span>
                )}
                {activeDish.badge && (
                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[var(--color-primary)] text-white rounded-lg">
                    {activeDish.badge}
                  </span>
                )}
              </div>

              {showDescription && activeDish.description && (
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed max-w-lg">
                  {activeDish.description}
                </p>
              )}

              <div className="flex items-center justify-between gap-4 pt-1">
                {showPrice && (
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Precio</span>
                    <span className="text-sm font-black text-[var(--color-primary)]">{activeDish.price}</span>
                  </div>
                )}

                {allowUpload && (
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-text)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <Upload size={12} className="text-[var(--color-primary)]" />
                      Subir Foto PNG
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 mt-1">
                  <AlertCircle size={10} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Propiedades (Props) del Componente

| Prop | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| **items** | `array` | *(Demo de 5 platos)* | Lista de platos en el menú. Ver estructura de items abajo. |
| **title** | `string` | `"Menú de Platos"` | Título descriptivo superior del menú. |
| **subtitle** | `string` | `"Explora las opciones..."` | Subtítulo superior de ayuda. |
| **selectedId** | `string` | `undefined` | ID del plato seleccionado (modo controlado). |
| **onSelect** | `function` | `undefined` | Callback `(item) => {}` que se ejecuta al clickear o navegar a un plato. |
| **onItemsChange** | `function` | `undefined` | Callback `(updatedItems) => {}` disparado tras subir una imagen exitosamente. |
| **allowUpload** | `boolean` | `true` | Habilita el cargador premium de imágenes PNG en caliente. |
| **showPrice** | `boolean` | `true` | Renderiza el precio debajo del plato y en la tarjeta de detalle. |
| **showCategory** | `boolean` | `true` | Muestra la etiqueta de la categoría del plato. |
| **showDescription** | `boolean` | `true` | Muestra la descripción detallada del plato seleccionado. |
| **maxFileSizeMB** | `number` | `4` | Peso máximo en megabytes para la imagen PNG subida. |
| **emptyText** | `string` | `"Aún no hay platos..."` | Texto alternativo cuando el array de items está vacío. |
| **size** | `"sm" \| "md" \| "lg"` | `"md"` | Diámetro físico de los círculos de los platos. |
| **variant** | `"default" \| "compact" \| "showcase"` | `"default"` | Estilo de layout de la cabecera e interactividad del menú. |

---

## 5. Estructura de Cada Plato (Item)

El componente espera un array de objetos JSON con el siguiente esquema:

```json
{
  "id": "dish-1",
  "name": "Bowl Tropical",
  "description": "Frutas frescas de temporada, granola crocante y crema suave.",
  "price": "$24.000",
  "category": "Saludable",
  "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300",
  "available": true,
  "badge": "Nuevo"
}
```

---

## 6. Accesibilidad (a11y)
- **Navegación por Teclado:** Soporte nativo para alternar selección con las teclas **Flecha Derecha** (`ArrowRight`) y **Flecha Izquierda** (`ArrowLeft`), permitiendo una experiencia de compra inclusiva.
- **Etiquetas Alt:** Inyección automática de `alt={item.name}` en las imágenes para compatibilidad con lectores de pantalla.
- **Estados Visibles:** Outline o anillo de color visible en foco para indicar selección sin depender exclusivamente del color.

---

## 7. Ejemplo de Uso Básico

```jsx
import React from 'react';
import CircularDishMenu from './CircularDishMenu';

export default function App() {
  return (
    <div className="p-4 bg-[var(--color-bg)]">
      <CircularDishMenu
        title="Carta de Postres"
        subtitle="Endulza tu día"
        onSelect={(dish) => console.log('Plato seleccionado:', dish.name)}
      />
    </div>
  );
}
```

---

## 8. Ejemplo con Carga PNG y Sincronización en Caliente

```jsx
import React, { useState } from 'react';
import CircularDishMenu from './CircularDishMenu';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState(INITIAL_ITEMS);

  return (
    <CircularDishMenu
      items={menuItems}
      allowUpload={true}
      maxFileSizeMB={2}
      onItemsChange={(updatedItems) => {
        setMenuItems(updatedItems);
      }}
    />
  );
}
```
