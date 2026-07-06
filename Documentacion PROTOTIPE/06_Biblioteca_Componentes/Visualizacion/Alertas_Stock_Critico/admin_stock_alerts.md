<!--
{
  "technicalName": "AdminStockAlerts",
  "targetPath": "src/components/ui/AdminStockAlerts.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": [
    "retail_clothing",
    "grocery_food",
    "distribuidoras-beauty",
    "petshops-locales",
    "moda-local-calzado",
    "repuestos-motos",
    "repuestos-lineablanca",
    "ferreteria-rural",
    "insumos-agricolas"
  ]
}
-->

# AdminStockAlerts (Widget de Reabastecimiento e Inventario Crítico)

## 1. Propósito y Casos de Uso
El componente `AdminStockAlerts` es una consola administrativa premium diseñada para el monitoreo y reabastecimiento en caliente de productos que se encuentran por debajo del umbral de alerta mínimo (stock crítico).

Permite a los administradores de la plataforma visualizar qué variantes de productos están próximas a agotarse, filtrar alertas mediante un buscador dinámico y abastecer directamente el inventario con feedbacks visuales inmediatos de éxito o carga.

---

## 2. Especificación Visual y Estilos
El componente implementa una interfaz premium responsiva que prioriza la legibilidad del stock crítico y la accesibilidad en pantallas táctiles móviles.
* **Layout Grid Adaptativo**: Se adapta perfectamente a layouts móviles y de escritorio mediante flexbox dinámico (`flex-col sm:flex-row`).
* **Indicadores de Alerta**: Badges estilizados en rojo semi-transparente `bg-red-500/10 text-red-500` con bordes finos.
* **Variables CSS Requeridas**:
  * `--color-primary`: Color de acción principal para el botón de abastecer.
  * `--color-bg-primary`: Fondo general.
  * `--color-surface`: Fondo de las tarjetas individuales de alerta.

---

## 3. Props y API del Componente

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `alerts` | `Array` | `[]` | Listado de alertas a mostrar (id, nombre, stock, umbral, imageUrl, variantId, variantName). |
| `loading` | `Boolean` | `false` | Indica si se están cargando los datos iniciales de las alertas de inventario. |
| `onLoadStock` | `Function` | `async () => {}` | Callback asíncrono para registrar el nuevo stock `async (alertItem, qty) => {}`. Debe retornar una promesa resuelta. |
| `onBack` | `Function` | `() => {}` | Callback disparado al presionar el botón de regreso. |
| `icons` | `Object` | `{}` | Mapeo inyectable opcional para sobreescribir los iconos por defecto. |

---

## 4. Código React Completo y 100% Funcional

```jsx
import React, { useState, useMemo } from 'react';

// Iconos SVGs nativos integrados e inyectables
const _DefaultIcons = {
  Package: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

export default function AdminStockAlerts({
  alerts = [],
  loading = false,
  onLoadStock,
  onBack,
  icons = {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockToLoad, setStockToLoad] = useState({});
  const [successStatus, setSuccessStatus] = useState({});
  const [pendingStatus, setPendingStatus] = useState({});

  const I = { ..._DefaultIcons, ...icons };

  // Filtrar alertas dinámicamente en memoria
  const filteredAlerts = useMemo(() => {
    if (!searchTerm.trim()) return alerts;
    return alerts.filter(a =>
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.variantName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alerts, searchTerm]);

  // Manejar el cambio en el selector de cantidad
  const handleQtyChange = (key, value) => {
    const qty = parseInt(value, 10);
    setStockToLoad(prev => ({
      ...prev,
      [key]: isNaN(qty) ? '' : Math.max(0, qty)
    }));
  };

  const handleAbastecer = async (alertItem) => {
    const key = `${alertItem.productId}-${alertItem.variantId}`;
    const qtyToAdd = parseInt(stockToLoad[key] || 0, 10);
    if (!qtyToAdd || qtyToAdd <= 0) return;

    setPendingStatus(prev => ({ ...prev, [key]: true }));

    try {
      // Dispara la mutación/callback asíncrona del padre
      await onLoadStock(alertItem, qtyToAdd);

      // Limpiar input y disparar feedback de éxito
      setStockToLoad(prev => ({ ...prev, [key]: '' }));
      setSuccessStatus(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setSuccessStatus(prev => ({ ...prev, [key]: false }));
      }, 2500);
    } catch (err) {
      console.error('Error al reabastecer stock:', err);
    } finally {
      setPendingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBack()}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-[var(--color-border)] text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-[var(--color-surface)] transition-all"
            aria-label="Volver"
          >
            <I.ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Reabastecer Inventario</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">Monitorea y carga inventario directamente a las variantes críticas.</p>
          </div>
        </div>

        <span className="px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-wider">
          {filteredAlerts.length} Alerta(s)
        </span>
      </div>

      {/* Buscador de Alertas */}
      <div className="bg-[var(--card-bg)] rounded-3xl p-4 border border-slate-100 dark:border-[var(--color-border)]/80 shadow-sm">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            <I.Search />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de producto, variante o color..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 dark:bg-[var(--color-surface)] border border-slate-200 dark:border-[var(--color-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Listado de Alertas */}
      {loading ? (
        <div className="bg-[var(--card-bg)] rounded-3xl p-12 border border-slate-100 dark:border-[var(--color-border)]/80 text-center">
          <I.Spinner />
          <p className="text-sm text-[var(--text-secondary)] mt-3">Consultando base de datos de inventario...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-3xl p-12 border border-slate-100 dark:border-[var(--color-border)]/80 text-center flex flex-col items-center justify-center">
          <div className="text-emerald-500 mb-3 animate-bounce">
            <I.Package />
          </div>
          <h3 className="font-bold text-lg">¡Inventario Completo!</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Ningún producto está por debajo de su umbral de alerta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.map(alertItem => {
            const key = `${alertItem.productId}-${alertItem.variantId}`;
            const loadVal = stockToLoad[key] || '';
            const hasSuccess = successStatus[key];
            const isPending = pendingStatus[key];

            return (
              <div
                key={key}
                className="bg-[var(--card-bg)] rounded-3xl p-4 md:p-5 border border-slate-100 dark:border-[var(--color-border)]/80 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Info del Producto */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[var(--color-surface)] border border-slate-200 dark:border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {alertItem.imageUrl ? (
                      <img src={alertItem.imageUrl} alt={alertItem.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[var(--text-secondary)]"><I.Package /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight truncate">{alertItem.productName}</h3>
                    <p className="text-xs font-semibold text-primary mt-1">{alertItem.variantName || 'Estándar'}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-red-500 font-bold uppercase bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                        Restantes: {alertItem.stock}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                        Umbral: {alertItem.umbral} unds
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formulario de Carga Directa */}
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={loadVal}
                    onChange={(e) => handleQtyChange(key, e.target.value)}
                    placeholder="Cantidad"
                    className="w-24 h-11 text-center rounded-2xl bg-slate-50 dark:bg-[var(--color-surface)] border border-slate-200 dark:border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-primary"
                  />

                  <button
                    onClick={() => handleAbastecer(alertItem)}
                    disabled={!loadVal || loadVal <= 0 || isPending}
                    className={`h-11 px-5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 w-[130px] shadow-sm ${
                      hasSuccess 
                        ? 'bg-green-500 text-[var(--color-text)]' 
                        : 'bg-primary text-[var(--color-text)] hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {isPending ? (
                      <I.Spinner />
                    ) : hasSuccess ? (
                      <>
                        <I.Check /> ¡Cargado!
                      </>
                    ) : (
                      'Cargar Stock'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Lógica de Estado y Ciclo de Vida
* **Manejo de Estados Atómicos de Reabastecimiento**: El componente gestiona internamente la cantidad inyectada en cada input de forma independiente mapeado mediante el hash `` `${alertItem.productId}-${alertItem.variantId}` ``.
* **Mapeo de Feedbacks Concurrentes**: Permite cargar inventario a múltiples variantes al mismo tiempo sin cruzar los estados visuales de "cargando..." o "éxito".

---

## 6. Ejemplo de Uso

```jsx
import React, { useState } from 'react';
import AdminStockAlerts from './AdminStockAlerts';

export default function MiConsolaInventario() {
  const [alertas, setAlertas] = useState([
    { productId: 'p1', productName: 'Camiseta de Algodón', variantId: 'v1', variantName: 'Azul / M', stock: 2, umbral: 5 }
  ]);

  const guardarStock = async (alertItem, qty) => {
    // API Call para guardar en la base de datos
    await fetch(`/api/inventario/${alertItem.productId}/variantes/${alertItem.variantId}`, {
      method: 'POST',
      body: JSON.stringify({ cantidad: qty })
    });
  };

  return (
    <AdminStockAlerts
      alerts={alertas}
      onLoadStock={guardarStock}
      onBack={() => console.log('Regresar')}
    />
  );
}
```
