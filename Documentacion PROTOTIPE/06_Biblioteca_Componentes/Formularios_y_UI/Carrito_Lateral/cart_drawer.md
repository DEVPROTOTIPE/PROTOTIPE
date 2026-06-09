# Carrito de Compras Lateral (CartDrawer)

## 1. Propósito y Casos de Uso
El componente `CartDrawer` es un contenedor lateral desplazable (drawer) responsivo y premium que gestiona visualmente el listado de productos seleccionados por el cliente, ajustando cantidades, removiendo ítems, mostrando el desglose financiero del pedido (total estimado) y ofreciendo pasarelas directas al checkout.
Para garantizar su **máxima portabilidad marca blanca**, se ha estructurado de forma stateless-controlada, proveyendo inyección completa para la lista de productos, callbacks de mutación (incremento/decremento/eliminación) y compatibilidad con enrutadores sin dependencias rígidas.

---

## 2. Especificación Visual y Estilos
* **Visual:** Layout de barra lateral móvil y desktop con fondo translúcido (backdrop) de desenfoque.
* **Layout:** Slide-in animado desde la derecha a la izquierda (`translateX`).
* **Estilos y Fallbacks:** Se apoya en variables CSS universales (`var(--color-bg)`, `var(--color-border)`, `var(--color-surface)`) para encajar instantáneamente en entornos claros y oscuros sin requerir configuraciones adicionales.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Condiciona el renderizado y visibilidad del drawer. |
| `onClose` | `function` | `() => {}` | Callback invocado al presionar el botón cerrar o backdrop. |
| `items` | `array` | `[]` | Listado de productos en el carrito (`[{ id, nombre, precio, cantidad, imageUrl, variante }]`). |
| `onIncrement` | `function` | `() => {}` | Callback para aumentar la cantidad de un artículo. |
| `onDecrement` | `function` | `() => {}` | Callback para disminuir la cantidad de un artículo. |
| `onRemove` | `function` | `() => {}` | Callback para eliminar todo el stack de una variante específica del carrito. |
| `onCheckout` | `function` | `() => {}` | Callback principal de redirección al formulario de checkout/pago. |
| `onContinue` | `function` | `() => {}` | Callback de retorno al catálogo. |
| `currencyFormatter` | `function` | `(val) => val` | Callback formateador del símbolo y estructura monetaria. |
| `className` | `string` | `""` | Clases de estilo de maquetado personalizadas. |
| `style` | `object` | `{}` | Estilos inline de fallback. |

---

## 4. Código React Completo y 100% Funcional
```jsx
import React from 'react';

/**
 * SVG vectoriales nativos para evitar dependencias duras de Lucide
 */
const DefaultTrashIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
);
const DefaultCloseIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const DefaultCartIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

export default function CartDrawer({
  isOpen = false,
  onClose = () => {},
  items = [],
  onIncrement = () => {},
  onDecrement = () => {},
  onRemove = () => {},
  onCheckout = () => {},
  onContinue = () => {},
  currencyFormatter = (val) => `$${val}`,
  className = "",
  style = {}
}) {
  
  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // Estilos de fallback inline
  const defaultContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end'
  };

  const defaultDrawerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '448px',
    height: '100%',
    backgroundColor: 'var(--color-surface, #ffffff)',
    boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.1), -8px 0 10px -6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  };

  return (
    <div style={className ? {} : defaultContainerStyle} className={className}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />

      {/* 1. Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          cursor: 'pointer'
        }}
      />

      {/* 2. Drawer */}
      <div style={className ? style : defaultDrawerStyle} className={className}>
        {/* A. Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--color-border, #e5e5e5)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.1))', color: 'var(--color-primary, #2563eb)', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
              <DefaultCartIcon />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--color-text, #171717)' }}>Tu Carrito</h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-surface-2, #f5f5f5)', color: 'var(--color-text-muted, #737373)', cursor: 'pointer', transition: 'all 0.2s' }}
            className="hover:opacity-80"
          >
            <DefaultCloseIcon />
          </button>
        </div>

        {/* B. Cuerpo Desplazable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'var(--color-bg, #fafafa)' }}>
          {items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ width: '96px', height: '96px', backgroundColor: 'var(--color-surface, #ffffff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid var(--color-border, #e5e5e5)' }}>
                <DefaultCartIcon size={36} style={{ opacity: 0.3 }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--color-text, #171717)' }}>Tu carrito está vacío</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted, #737373)', maxWidth: '260px' }}>Aún no has agregado productos a tu lista.</p>
              <button
                onClick={onContinue}
                style={{ marginTop: '32px', height: '44px', padding: '0 24px', border: '1px solid var(--color-border, #e5e5e5)', backgroundColor: 'var(--color-surface, #ffffff)', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text, #171717)', transition: 'all 0.2s' }}
                className="hover:bg-neutral-50 active:scale-95"
              >
                Seguir Comprando
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', borderRadius: '16px', backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e5e5e5)', position: 'relative', overflow: 'hidden' }}>
                  
                  {/* Imagen */}
                  <div style={{ width: '80px', height: '96px', borderRadius: '12px', backgroundColor: 'var(--color-surface-2, #f5f5f5)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <DefaultCartIcon size={20} style={{ opacity: 0.3 }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '96px', textAlign: 'left' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--color-text, #171717)', paddingRight: '24px' }}>{item.nombre}</h4>
                      {item.variante && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--color-text-muted, #737373)' }}>{item.variante}</p>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--color-primary, #2563eb)' }}>
                        {currencyFormatter(item.precio * item.cantidad)}
                      </span>

                      {/* Contador de Cantidad */}
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface-2, #f5f5f5)', borderRadius: '8px', padding: '2px', border: '1px solid var(--color-border, #e5e5e5)', height: '28px' }}>
                        <button
                          onClick={() => onDecrement(item.id)}
                          style={{ width: '24px', height: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--color-text-muted, #737373)' }}
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </button>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--color-text, #171717)' }}>{item.cantidad}</span>
                        <button
                          onClick={() => onIncrement(item.id)}
                          style={{ width: '24px', height: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--color-text-muted, #737373)' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Eliminar Ítem */}
                  <button
                    onClick={() => onRemove(item.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', border: 'none', borderRadius: '50%', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted, #737373)', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:text-red-500 hover:bg-red-50"
                  >
                    <DefaultTrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* C. Footer Fijo */}
        {items.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--color-border, #e5e5e5)', backgroundColor: 'var(--color-surface, #ffffff)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted, #737373)', fontWeight: '500' }}>Total Estimado</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-primary, #2563eb)' }}>{currencyFormatter(total)}</span>
            </div>

            <button
              onClick={onCheckout}
              style={{ width: '100%', height: '56px', backgroundColor: 'var(--color-primary, #2563eb)', color: '#ffffff', borderRadius: '16px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
              className="hover:opacity-90 active:scale-95 transition-transform"
            >
              Ir a Pagar
            </button>
            <button
              onClick={onContinue}
              style={{ width: '100%', height: '48px', marginTop: '12px', border: '1px solid var(--color-border, #e5e5e5)', backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text, #171717)', borderRadius: '16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              className="hover:bg-neutral-50 active:scale-95 transition-transform"
            >
              Seguir agregando productos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Ejemplo de Uso (Importación y Consumo)
```jsx
import React, { useState } from 'react';
import CartDrawer from './ui/CartDrawer';

export function Navigation() {
  const [cartOpen, setCartOpen] = useState(true);
  const [cartItems, setCartItems] = useState([
    { id: 1, nombre: 'Zapatos Deportivos Runner', precio: 89900, cantidad: 1, variante: 'Talla 40 · Negro' }
  ]);

  const handleIncrement = (id) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item));
  };

  return (
    <CartDrawer 
      isOpen={cartOpen} 
      onClose={() => setCartOpen(false)}
      items={cartItems}
      onIncrement={handleIncrement}
      onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))}
      currencyFormatter={(val) => `$${val.toLocaleString()}`}
    />
  );
}
```

---

## 6. Origen
* **Extraído de:** [CartDrawer.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/cart/CartDrawer.jsx)
* **Fecha de extracción:** 2026-05-29
* **Versión:** 1.0 (Desacoplado de `useCartStore` y dependencias de hooks del negocio).
