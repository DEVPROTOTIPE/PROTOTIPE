# OrderTracking (Seguimiento Público de Pedidos)

## 1. Propósito y Casos de Uso
El componente `OrderTracking` proporciona un portal de seguimiento de pedidos en tiempo real de acceso público. Permite a los clientes finales visualizar el estado detallado de sus compras (progreso del stepper, productos adquiridos, información limitada de entrega y resumen de costos) mediante un token de seguimiento o ID sin requerir autenticación ni inicio de sesión.

Ideal para e-commerce, sistemas de entrega locales y portales Ecosistema donde se desea optimizar la experiencia de usuario post-compra.

---

## 2. Especificación Visual y Estilos
El componente implementa una interfaz premium responsiva, con desenfoque de fondos (backdrop-blur) y animaciones micro-interactivas fluidas.
* **Fondo Principal**: `bg-[var(--bg-primary)]` y texto `text-[var(--text-primary)]`.
* **Timelines y Progreso**: Stepper horizontal que se adapta a formato vertical en dispositivos móviles de manera automática mediante breakpoints tailwind (`md:flex-row`).
* **Variables CSS Requeridas**:
  * `--color-primary`: Color de realce y progreso activo.
  * `--color-bg-primary`: Fondo general del contenedor.
  * `--color-text-primary`: Color del texto principal.

---

## 3. Props y API del Componente

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `order` | `Object` | `null` | Objeto con la información del pedido (id, status, productos, total, cliente). |
| `loading` | `Boolean` | `false` | Indica si se está consultando la información en el backend. |
| `error` | `String` | `null` | Mensaje de error si la búsqueda falla o el token es inválido. |
| `onSearch` | `Function` | `() => {}` | Callback disparado al realizar una búsqueda manual por ID/Token `(token) => {}`. |
| `onNavigateHome` | `Function` | `() => {}` | Callback disparado al hacer clic en "Volver a la tienda" o redirección. |
| `whatsappSupport` | `String` | `null` | Número de WhatsApp del soporte administrador (formato internacional). |
| `icons` | `Object` | `{}` | Mapeo inyectable opcional para sobreescribir los iconos por defecto. |

---

## 4. Código React Completo y 100% Funcional

```jsx
import React, { useState } from 'react';

// Iconos por defecto SVGs integrados e inyectables
const _DefaultIcons = {
  Package: () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
};

export default function OrderTracking({
  order,
  loading,
  error,
  onSearch,
  onNavigateHome,
  whatsappSupport,
  icons = {}
}) {
  const [searchToken, setSearchToken] = useState('');

  const I = { ..._DefaultIcons, ...icons };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente de Aprobación',
          color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50',
          icon: I.Clock,
          stepIndex: 0
        };
      case 'completado':
        return {
          label: 'Completado y Entregado',
          color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50',
          icon: I.Check,
          stepIndex: 2
        };
      case 'cancelado':
        return {
          label: 'Pedido Cancelado',
          color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20 border-rose-200/50',
          icon: I.Alert,
          stepIndex: -1
        };
      default:
        return {
          label: 'En Proceso',
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/50',
          icon: I.Clock,
          stepIndex: 1
        };
    }
  };

  const steps = [
    { label: 'Recibido', desc: 'Pedido registrado' },
    { label: 'Procesado', desc: 'Validación completada' },
    { label: 'Entregado', desc: 'Producto en destino' }
  ];

  const statusInfo = order ? getStatusDetails(order.status) : null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchToken.trim()) {
      onSearch(searchToken.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8 md:py-16 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header de Portal */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="p-3 text-primary animate-bounce">
            <I.Package />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Portal de Seguimiento Público</h1>
          <p className="text-xs text-[var(--text-secondary)]">Consulta el progreso de tu compra al instante</p>
        </div>

        {/* Buscador Manual si no hay pedido seleccionado */}
        {!order && (
          <div className="bg-[var(--card-bg)] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl text-center">
            <h3 className="text-sm font-bold mb-4">Ingresa tu código o ID de seguimiento</h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Código del Pedido (ej. SF-8374)"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <I.Search />
                Buscar
              </button>
            </form>
            {error && <p className="text-rose-500 text-xs mt-3">{error}</p>}
          </div>
        )}

        {/* Tarjeta de Detalles del Pedido */}
        {order && (
          <div className="bg-[var(--card-bg)] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-b-slate-800/40 pb-6">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">ID del Pedido</p>
                <h2 className="text-lg font-mono text-primary font-bold">#{order.id?.substring(0, 10).toUpperCase()}</h2>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${statusInfo?.color}`}>
                {statusInfo?.label}
              </div>
            </div>

            {/* Timelines del Stepper */}
            {statusInfo?.stepIndex !== -1 && (
              <div className="relative flex flex-col md:flex-row justify-between gap-8 py-4">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= statusInfo.stepIndex;
                  return (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:text-center w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                        isCompleted ? 'bg-primary border-primary text-white shadow-md' : 'border-slate-200 dark:border-slate-800 text-[var(--text-secondary)]'
                      }`}>
                        {isCompleted ? <I.Check /> : idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{step.label}</span>
                        <span className="text-xs text-[var(--text-secondary)] hidden md:block">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Listado de Productos */}
            <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Detalle de Compra</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/40 overflow-hidden bg-slate-50/10">
                {order.productos?.map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">{prod.nombre}</span>
                      <span className="text-xs text-[var(--text-secondary)]">Cant: {prod.cantidad} x {formatCurrency(prod.precio)}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(prod.precio * prod.cantidad)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="flex justify-between font-bold text-sm pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <span>Total del Pedido:</span>
              <span className="text-primary font-extrabold text-base">{formatCurrency(order.total || 0)}</span>
            </div>

            {/* Acciones del Pedido Activo */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => onNavigateHome()}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[var(--text-primary)] text-sm font-bold"
              >
                Volver a la Tienda
              </button>
              {whatsappSupport && (
                <a
                  href={`https://wa.me/${whatsappSupport.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm text-center"
                >
                  Contactar Soporte WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
```

---

## 5. Lógica de Estado y Ciclo de Vida
El componente es una **interfaz puramente declarativa**. El control de la llamada a base de datos y la resolución del token es responsabilidad del componente padre, lo que evita re-renders masivos del viewport y hace al componente 100% portable.
* **Control de Formulario local**: Maneja un estado local `searchToken` para capturar la entrada manual del cliente cuando no hay token en la barra de direcciones.

---

## 6. Ejemplo de Uso

```jsx
import React, { useState } from 'react';
import OrderTracking from './OrderTracking';

export default function MiApp() {
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);

  const consultarPedido = async (id) => {
    setCargando(true);
    // Lógica para traer datos de Firebase, API Rest, etc.
    const datos = await fetch(`/api/pedidos/${id}`).then(res => res.json());
    setPedido(datos);
    setCargando(false);
  };

  return (
    <OrderTracking
      order={pedido}
      loading={cargando}
      onSearch={consultarPedido}
      whatsappSupport="573000000000"
    />
  );
}
```
