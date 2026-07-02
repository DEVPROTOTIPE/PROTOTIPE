<!--
{
  "technicalName": "BentoGrid",
  "targetPath": "src/components/ui/BentoGrid.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Cuadrícula Bento Responsiva (BentoGrid)

## Propósito y Casos de Uso
El componente `BentoGrid` proporciona un layout responsivo basado en celdas de mosaico asimétricas (Bento Layout) ideal para tableros administrativos, CRM, portafolios y visualizaciones de analíticas en aplicaciones PWA. Permite distribuir tarjetas (`BentoCard`) con diferentes prioridades visuales mediante propiedades de expansión de columna (`colSpan`) y fila (`rowSpan`), integrando animaciones elásticas y efectos de borde translúcido con desenfoque de fondo.

## Especificación Visual y Estilos (Tailwind CSS)
* **Contenedor principal:** Rejilla flexible con `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[120px]`.
* **Tarjetas Bento (`BentoCard`):**
  * Fondo: `bg-[var(--color-surface)]` con transparencia sutil y desenfoque `backdrop-blur-md`.
  * Bordes: `border border-[var(--color-border)] hover:border-indigo-500/30` con transición suave.
  * Sombra: `hover:shadow-lg hover:shadow-indigo-950/10 hover:scale-[1.01]`.
  * Animación: Transición de 300ms sobre `transform`, `border-color`, y `box-shadow`.

---

## 3. Código React Completo

```jsx
import React from 'react';

/**
 * BentoGrid: Contenedor principal que define la rejilla base.
 */
export function BentoGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[140px] w-full ${className}`}>
      {children}
    </div>
  );
}

/**
 * BentoCard: Celda individual del mosaico.
 * @param {string} title - Título del widget o celda.
 * @param {string} description - Descripción opcional.
 * @param {React.ReactNode} icon - Ícono superior.
 * @param {string} colSpan - Clases de Tailwind para col-span en pantallas grandes (ej: 'md:col-span-2').
 * @param {string} rowSpan - Clases de Tailwind para row-span (ej: 'row-span-2').
 * @param {React.ReactNode} children - Contenido o slot para gráficos/números.
 * @param {string} className - Clases adicionales de estilo.
 * @param {React.ReactNode} cta - Elemento CTA inferior (ej: botón o enlace).
 */
export function BentoCard({
  title,
  description,
  icon,
  colSpan = 'md:col-span-1',
  rowSpan = 'row-span-1',
  children,
  className = '',
  cta,
  ...props
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-950/15 ${colSpan} ${rowSpan} ${className}`}
      {...props}
    >
      {/* Background Gradient Hover Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-indigo-400 border border-[var(--color-border)]/40 transition-colors group-hover:bg-indigo-600/10 group-hover:text-indigo-400">
              {icon}
            </div>
          )}
          <h3 className="text-xs font-black text-[var(--color-text)] tracking-tight pt-1.5">{title}</h3>
          {description && (
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed max-w-[220px]">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content Area / Custom Slot */}
      <div className="flex-1 flex items-center justify-center py-2">
        {children}
      </div>

      {/* Footer CTA */}
      {cta && (
        <div className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-indigo-400 transition-all duration-300 group-hover:translate-x-1">
          {cta}
        </div>
      )}
    </div>
  );
}
```

---

## Lógica de Estado y Ciclo de Vida
El componente es stateless y estructurado mediante composición de React. Las dimensiones se adaptan automáticamente a través de Grid Layout CSS del navegador. 

## Flujo Operativo y Secuencia de Interacción
1. El programador envuelve el tablero en `<BentoGrid>`.
2. Asigna las dimensiones espaciales a cada `<BentoCard>` mediante las props `colSpan` y `rowSpan`.
3. Al interactuar el cursor del usuario, se activa una transición animada del borde mediante variables HSL, desplegando un destello radial translúcido sobre el fondo.
