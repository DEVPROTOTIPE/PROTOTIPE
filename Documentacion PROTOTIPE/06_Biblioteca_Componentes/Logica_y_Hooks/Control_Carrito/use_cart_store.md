<!--
{
  "technicalName": "useCartStore",
  "targetPath": "src/hooks/useCartStore.js",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "hook",
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
    "coleccionismo-geek",
    "distribucion-horeca"
  ]
}
-->

# Hook de Carrito de Compras (useCartStore)

Store global de Zustand diseñado para orquestar la lógica transaccional de un carrito de compras digital de marca blanca. Ofrece soporte nativo para persistencia local automática, control estricto de topes de stock máximos por variante, y cómputos reactivos de totales y recuentos de unidades.

---

## 1. Propósito y Casos de Uso
* **Consistencia del Carrito:** Almacena los productos, cantidades y variantes seleccionadas por el cliente, asegurando que los datos persistan a través de recargas del navegador mediante el middleware `persist` de Zustand.
* **Control de Stock en Caliente:** Valida los topes de inventario configurados por variante al agregar elementos o incrementar la cantidad, bloqueando el incremento en el DOM si el cliente alcanza el stock disponible.
* **Casos de Uso:**
  * Catálogos públicos de comercio electrónico y PWA.
  * Punto de venta (POS) del vendedor para registrar artículos.

---

## 2. Props y API del Estado (Zustand Store)
### Estado (`State`)
* `items`: Array de objetos de producto en el carrito: `[{ productId, variantId, nombre, precio, talla, color, imageUrl, cantidad, maxStock }]`.
* `isOpen`: Boolean que controla el estado visual (abierto/cerrado) de la barra lateral (Drawer) o modal del carrito.

### Acciones (`Actions`)
* `addItem(item, qtyToAdd)`: Agrega un item al carrito. Si la combinación `productId-variantId` ya existe, incrementa su cantidad validando no superar `maxStock`.
* `removeItem(productId, variantId)`: Reduce la cantidad del item en `1`. Si la cantidad llega a `0`, remueve el item físicamente de la lista.
* `deleteItem(productId, variantId)`: Elimina el producto del carrito sin importar su cantidad actual.
* `clearCart()`: Remueve todos los productos y vacía el carrito.
* `openCart()` / `closeCart()`: Abre y cierra la interfaz visual del carrito.
* `getTotal()`: Función de descarte que retorna el costo acumulado de los artículos (`precio * cantidad`).
* `getCount()`: Función de descarte que retorna la sumatoria de unidades en el carrito.

---

## 3. Código React Fuente Completo (`cartStore.js`)
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store del carrito de compras.
 * Persiste en localStorage para que el carrito no se pierda al navegar.
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      // ─── Estado ───
      items: [],          // [{ productId, variantId, nombre, precio, talla, color, imageUrl, cantidad, maxStock }]
      isOpen: false,      // Modal/drawer del carrito abierto

      // ─── Acciones ───
      /**
       * Agrega un producto al carrito o incrementa su cantidad si ya existe.
       * @param {object} item - Producto con variante seleccionada
       * @param {number} qtyToAdd - Cantidad a agregar (por defecto 1)
       */
      addItem: (item, qtyToAdd = 1) => set((state) => {
        const key = `${item.productId}-${item.variantId}`;
        const existing = state.items.find(
          (i) => `${i.productId}-${i.variantId}` === key
        );
        
        const limit = item.maxStock ?? existing?.maxStock;
        
        if (existing) {
          const newQty = limit !== undefined ? Math.min(existing.cantidad + qtyToAdd, limit) : existing.cantidad + qtyToAdd;
          if (newQty === existing.cantidad) return state; // Límite de stock alcanzado
          
          return {
            items: state.items.map((i) =>
              `${i.productId}-${i.variantId}` === key
                ? { ...i, cantidad: newQty, maxStock: limit }
                : i
            ),
          };
        }
        
        const newQty = limit !== undefined ? Math.min(qtyToAdd, limit) : qtyToAdd;
        return { items: [...state.items, { ...item, cantidad: newQty }] };
      }),

      /**
       * Decrementa la cantidad de un producto. Si llega a 0, lo elimina.
       * @param {string} productId
       * @param {string} variantId
       */
      removeItem: (productId, variantId) => set((state) => {
        const key = `${productId}-${variantId}`;
        const existing = state.items.find(
          (i) => `${i.productId}-${i.variantId}` === key
        );
        if (!existing) return state;
        if (existing.cantidad === 1) {
          return { items: state.items.filter((i) => `${i.productId}-${i.variantId}` !== key) };
        }
        return {
          items: state.items.map((i) =>
            `${i.productId}-${i.variantId}` === key
              ? { ...i, cantidad: i.cantidad - 1 }
              : i
          ),
        };
      }),

      deleteItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        ),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      /**
       * @returns {number} Total acumulado
       */
      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
      },

      /**
       * @returns {number} Total de unidades
       */
      getCount: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.cantidad, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

export default useCartStore;
```

---

## 4. Ejemplo de Uso (Consumo en Componente React)
```jsx
import React from 'react';
import useCartStore from '../store/cartStore';

export default function CartBadge() {
  const count = useCartStore(state => state.getCount());
  const openCart = useCartStore(state => state.openCart());

  return (
    <button onClick={openCart} className="relative p-2 bg-[var(--color-surface)] rounded-full">
      🛒 Carrito
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </button>
  );
}
```

---

## 5. Origen
* **Extraído de:** [cartStore.js](file:///d:/Aplicaciones/App%20Ventas/src/store/cartStore.js)
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Store global persistente para gestión de carrito con Zustand).
