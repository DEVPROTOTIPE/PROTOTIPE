<!--
{
  "technicalName": "RadialInteractiveMenu",
  "targetPath": "src/components/ui/RadialInteractiveMenu.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Menú de Acción Flotante Radial (`RadialInteractiveMenu`)

Componente de menú flotante radial (tipo abanico/telaraña). Agrupa múltiples acciones secundarias rápidas bajo un único disparador interactivo en una esquina de la pantalla. Cada sub-botón es desplegado mediante cálculo trigonométrico con un efecto elástico secuencial (staggered).

---

## 1. Propósito y Casos de Uso
- **Atajos en Mobile:** Ideal en PWAs móviles en la esquina inferior derecha para agrupar Contacto, WhatsApp, Mapa y Soporte.
- **Limpieza UX:** Reduce el ruido visual en pantalla al ocultar acciones secundarias hasta que el usuario decida interactuar.
- **Acceso Directo:** Puede flotar en cualquier lugar del layout mediante envoltura opcional de portal React.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Cálculo Trigonométrico:** Los sub-botones se posicionan dinámicamente mediante coordenadas cartesianas calculadas a partir del ángulo total de apertura y la distancia radial (`radius`).
- **Tap-Shield:** Un fondo oscuro translúcido con desenfoque de cristal (`backdrop-blur-sm bg-black/40`) cubre la interfaz para facilitar la concentración visual en el menú activo.
- **Bounce Effect:** Animación de apertura staggered mediante retrasos de transición dinámicos (`transition-delay`) y función de tiempo elástica (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

---

## 3. Código React Completo

```jsx
import React, { useState, useEffect, useRef } from 'react';

// Iconos SVG por defecto
const CallIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.638 1.97 14.162.946 11.53.946c-5.442 0-9.869 4.368-9.873 9.798-.001 1.97.518 3.896 1.503 5.626L2.146 21.9l5.501-1.446z" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function RadialInteractiveMenu({
  position = 'bottom-right', // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  radius = 90, // Radio de expansión en píxeles
  angleRange = 90, // Grados de arco del abanico (ej: 90° para esquinas, 180° para bordes)
  startAngle = 180, // Ángulo base de inicio de rotación (ej: 180 para abajo a la derecha)
  items = [], // Array de objetos { id, icon, label, onClick, className }
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Definición de layouts de posición absoluta
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }[position] || 'bottom-6 right-6';

  return (
    <>
      {/* Tap-shield modal transparente para cerrar el menú radial en mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[var(--color-bg)]/30 backdrop-blur-[2px] z-[990] transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Contenedor del Menú */}
      <div 
        ref={menuRef} 
        className={`fixed z-[995] w-12 h-12 ${positionClasses} ${className}`}
      >
        {/* Sub-botones Radiales */}
        {items.map((item, idx) => {
          // Distribución angular: calculamos el ángulo de cada botón individual
          const angleStep = items.length > 1 ? angleRange / (items.length - 1) : 0;
          const itemAngle = startAngle + (idx * angleStep);
          const angleInRadians = (itemAngle * Math.PI) / 180;

          // Transformadas de desplazamiento (Trigonometría cartesiana)
          const x = isOpen ? radius * Math.cos(angleInRadians) : 0;
          const y = isOpen ? radius * Math.sin(angleInRadians) : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isOpen ? 1 : 0})`,
                transitionDelay: `${isOpen ? idx * 45 : 0}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:text-indigo-400 hover:border-indigo-500/40 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group z-[991] ${item.className || ''}`}
              title={item.label}
            >
              {item.icon || <HelpIcon />}

              {/* Tooltip flotante */}
              <span className="absolute scale-0 group-hover:scale-100 transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] text-[8px] font-black uppercase text-slate-100 rounded-lg px-2 py-1 -top-8 whitespace-nowrap shadow z-20 pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Botón Disparador Principal (Trigger) */}
        <button
          type="button"
          onClick={toggleMenu}
          className={`absolute inset-0 flex items-center justify-center rounded-2xl shadow-xl hover:shadow-indigo-500/25 border border-[var(--color-border)] cursor-pointer text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95 z-[992] ${
            isOpen
              ? 'bg-red-500 hover:bg-red-400 border-red-500/30 rotate-45'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/30 rotate-0'
          }`}
        >
          {isOpen ? (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
```
