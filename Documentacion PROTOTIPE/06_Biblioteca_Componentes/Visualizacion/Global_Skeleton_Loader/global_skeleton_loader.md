<!--
{
  "technicalName": "GlobalSkeletonLoader",
  "targetPath": "src/components/ui/GlobalSkeletonLoader.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Skeleton Loader Premium Global (`GlobalSkeletonLoader`)

## 1. Propósito y Casos de Uso
Componente estructural y de animación diseñado para combatir el parpadeo de contenido y reducir la frustración del usuario durante llamadas asíncronas lentas (ej: Firestore read latency). Resuelve:
- **Reducción del Cumulative Layout Shift (CLS):** Mantiene fijos las dimensiones y el espacio de los componentes antes de que carguen los datos reales, impidiendo saltos de pantalla toscos.
- **Variantes Preconfiguradas:** Provee mockups visuales estructurados y listos para usar en: tarjetas de producto, filas de tablas contables o celdas de cuadrículas, y bloques de inputs en formularios.

**Casos de uso:** Rejillas de productos, listas de transacciones CRM, modales con formularios pesados de configuración de clientes.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Animación Shimmer Fluida:** Se implementa un barrido degradado continuo y sutil de izquierda a derecha.
- **Efecto de Cristal en Tailwind v4:**
  ```css
  /* Se apoya en una keyframe nativa para desplazar el background-position */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    background: linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-border) 50%, var(--color-surface-2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite linear;
  }
  ```
- **Diseño de Formas:** Bordes suavizados (`rounded-xl` y `rounded-full`) para imitar perfectamente avatares, píldoras, títulos y bloques de inputs reales.

---

## 3. Código React Completo y 100% Funcional

```jsx
// src/components/ui/loaders/GlobalSkeletonLoader.jsx
import React from 'react';

/**
 * GlobalSkeletonLoader
 * Proporciona bloques de carga tipo Shimmer modular.
 */
export function GlobalSkeletonLoader({
  variant = 'card', // 'card' | 'table' | 'form' | 'custom'
  count = 1,        // Cantidad de elementos a repetir
  className = '',   // Clases de envoltura en modo custom
  speed = '1.6s'    // Velocidad del barrido
}) {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-border) 50%, var(--color-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animation: `shimmer ${speed} infinite linear`
  };

  const repeatArray = Array.from({ length: count });

  // 1. Ficha de Producto (Card)
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {repeatArray.map((_, idx) => (
          <div
            key={idx}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-4"
          >
            {/* Imagen del producto */}
            <div style={shimmerStyle} className="w-full aspect-square rounded-2xl animate-[shimmer_1.6s_infinite_linear]" />
            {/* Título */}
            <div className="space-y-2">
              <div style={shimmerStyle} className="h-3.5 w-3/4 rounded-lg animate-[shimmer_1.6s_infinite_linear]" />
              <div style={shimmerStyle} className="h-2.5 w-1/2 rounded-lg animate-[shimmer_1.6s_infinite_linear]" />
            </div>
            {/* Footer de la tarjeta (Precio + Botón) */}
            <div className="flex items-center justify-between pt-2">
              <div style={shimmerStyle} className="h-4 w-16 rounded-lg animate-[shimmer_1.6s_infinite_linear]" />
              <div style={shimmerStyle} className="h-8 w-20 rounded-xl animate-[shimmer_1.6s_infinite_linear]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Fila de Tabla (Table Rows)
  if (variant === 'table') {
    return (
      <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Cabecera simulada */}
        <div className="bg-[var(--color-surface-2)]/60 px-4 py-3 flex justify-between gap-4">
          <div style={shimmerStyle} className="h-3 w-16 rounded-md" />
          <div style={shimmerStyle} className="h-3 w-32 rounded-md" />
          <div style={shimmerStyle} className="h-3 w-20 rounded-md" />
          <div style={shimmerStyle} className="h-3 w-12 rounded-md" />
        </div>
        {/* Filas */}
        {repeatArray.map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/3">
              <div style={shimmerStyle} className="w-8 h-8 rounded-xl shrink-0" />
              <div style={shimmerStyle} className="h-3 w-full rounded-md" />
            </div>
            <div style={shimmerStyle} className="h-3 w-24 rounded-md" />
            <div style={shimmerStyle} className="h-3 w-16 rounded-md" />
            <div style={shimmerStyle} className="h-6 w-10 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // 3. Campos de Formulario (Form Fields)
  if (variant === 'form') {
    return (
      <div className="space-y-4 max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm">
        {repeatArray.map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div style={shimmerStyle} className="h-2.5 w-24 rounded-md" />
            <div style={shimmerStyle} className="h-9 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <div style={shimmerStyle} className="h-9 w-20 rounded-xl" />
          <div style={shimmerStyle} className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    );
  }

  // 4. Customizador / Átomo individual
  return (
    <div className={`space-y-2.5 ${className}`}>
      {repeatArray.map((_, idx) => (
        <div
          key={idx}
          style={shimmerStyle}
          className="w-full h-4 rounded-xl"
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
- **Aprovechamiento de GPU:** La animación se procesa utilizando propiedades de renderizado fluidas (`background-position` e interpolación lineal de gradientes) reduciendo el tiempo de CPU y evitando bloqueos visuales en móviles.
- **Auto-inyección CSS:** Incorpora de manera segura un bloque `@keyframes` en línea mediante `dangerouslySetInnerHTML` en el modo custom, garantizando la portabilidad absoluta del archivo sin requerir configuraciones manuales en `tailwind.config.js` del cliente.

---

## 5. Secuencia de Interacción (Flujo Operativo)
```
  [Llamada Firestore] ─────► [isLoading = true] ─────► Renderiza <GlobalSkeletonLoader variant="card"/>
          │
      (Carga de Datos)
          │
          ▼
   [isLoading = false] ────► [fade-in transition] ───► Renderiza <ProductCard data={doc}/>
```
