<!--
{
  "technicalName": "EmptyState",
  "targetPath": "src/components/ui/EmptyState.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Empty State Premium Interactivo (EmptyState)

Componente de interfaz reutilizable diseñado para presentar estados vacíos elegantes (cuando no existen elementos en un listado, carrito vacío, búsquedas sin resultados o historiales limpios). Combina ilustraciones animadas o iconos HSL con textos descriptivos y un botón de llamada a la acción (CTA) elástico para reenganchar al usuario.

---

## 1. Propósito y Casos de Uso
* **Mejora de UX en Listas Vacías:** En lugar de dejar pantallas en blanco o con textos planos toscos, provee una guía visual con sugerencias concretas de acción.
* **Reducción de Fricción:** Dibuja un botón de acción rápida que redirige al usuario al catálogo principal o levanta un formulario para crear el primer registro.
* **Casos de Uso:**
  * Historial de pedidos vacío (ofrece botón "Ir al catálogo").
  * Carrito de compras desocupado (anima a buscar productos).
  * Resultados de búsqueda inexistentes.

---

## 2. Especificación Visual y Estilos
* **Ilustración Animada:** Un círculo contenedor central con fondo traslúcido `bg-primary/5` y color `text-primary` que aplica una animación spring elástica al cargarse.
* **Tipografía y Legibilidad:** Títulos en mayúscula sostenida `uppercase tracking-wider` y textos descriptivos suavizados y limitados en ancho `max-w-[280px]` para asegurar la legibilidad en pantallas móviles de cualquier tamaño.
* **Botón de Acción Premium:** Botón interactivo con sombra suave del color de la marca `shadow-primary/20` y animaciones reactivas al tacto (aumento de tamaño en hover y contracción del 5% al pulsarlo).

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | | Título destacado del estado vacío (se renderiza en mayúsculas). |
| `description` | `string` | | Mensaje o párrafo descriptivo/guía. |
| `icon` | `LucideIcon \| Component` | `null` | Componente de icono a renderizar (ej. de lucide-react). |
| `illustration` | `Component` | `null` | SVG o ilustración interactiva a renderizar en lugar del icono. |
| `actionLabel` | `string` | `null` | Texto del botón de acción. |
| `onAction` | `function` | `null` | Callback invocado al pulsar el botón de acción. |

---

## 4. Código React Fuente Completo (`EmptyState.jsx`)
```jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Empty State Premium.
 * Componente stateless para representar listas vacías con micro-animaciones.
 */
export default function EmptyState({ 
  title, 
  description, 
  icon: Icon = null, 
  actionLabel = null, 
  onAction = null,
  illustration: Illustration = null
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      {/* Ilustración o Icono animado con spring de Framer Motion */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="mb-6 relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 text-primary"
      >
        {Illustration ? (
          <Illustration />
        ) : Icon ? (
          <Icon size={40} className="stroke-[1.5]" />
        ) : (
          <span className="text-4xl" role="img" aria-label="paquete vacío">📦</span>
        )}
      </motion.div>

      {/* Título en mayúsculas */}
      <h3 className="text-base font-bold text-app mb-1.5 uppercase tracking-wider">
        {title}
      </h3>
      
      {/* Mensaje descriptivo */}
      <p className="text-xs text-muted mb-6 leading-relaxed max-w-[280px]">
        {description}
      </p>

      {/* Botón de acción elástico */}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-5 py-2.5 bg-primary text-[var(--color-text)] text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </motion.button>
      )}
    </div>
  );
}
```

---

## 5. Ejemplo de Uso (Importación y Consumo)
```jsx
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import EmptyState from './ui/EmptyState';

export default function CartDrawer({ items = [], navigateToCatalog }) {
  if (items.length === 0) {
    return (
      <div className="py-20">
        <EmptyState
          title="Tu carrito está vacío"
          description="Aún no has agregado productos a tu compra. Explora nuestro catálogo de productos."
          icon={ShoppingBag}
          actionLabel="Ver catálogo de productos"
          onAction={navigateToCatalog}
        />
      </div>
    );
  }

  return (
    <div>{/* Render del listado de items */}</div>
  );
}
```

---

## 6. Origen
* **Extraído de:** [EmptyState.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/EmptyState.jsx)
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Estados vacíos interactivos animados).
