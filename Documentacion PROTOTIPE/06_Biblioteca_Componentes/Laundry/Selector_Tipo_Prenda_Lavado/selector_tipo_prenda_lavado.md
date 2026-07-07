<!--
{
  "resource": "SelectorTipoPrendaLavado",
  "technicalName": "SelectorTipoPrendaLavado",
  "targetPath": "src/components/common/SelectorTipoPrendaLavado.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Selector de Tipo de Prenda para Lavado

## 1. Propósito y Casos de Uso
Permite al cliente o recepcionista categorizar las prendas por tipo antes de registrar el pedido de lavandería. Cada tipo tiene un precio unitario y una temperatura de lavado recomendada.

**Casos de uso:** Formulario de ingreso de pedido, registro de items en el POS de lavandería, app de solicitud a domicilio.

## 2. Especificación Visual
- Grid de cards 3×N con ícono representativo de cada prenda
- Badge de precio unitario en cada card
- Contador de unidades con `+`/`-` por tipo
- Resumen inferior con total de prendas y precio acumulado

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const PRENDAS = [
  { id: 'camisa', label: 'Camisa', icono: '👕', precio: 4500, temp: '30°C' },
  { id: 'pantalon', label: 'Pantalón', icono: '👖', precio: 5000, temp: '40°C' },
  { id: 'vestido', label: 'Vestido', icono: '👗', precio: 6500, temp: '30°C' },
  { id: 'chaqueta', label: 'Chaqueta', icono: '🧥', precio: 9000, temp: '30°C' },
  { id: 'ropa_interior', label: 'Ropa Interior', icono: '🩲', precio: 2000, temp: '60°C' },
  { id: 'toalla', label: 'Toalla', icono: '🏖️', precio: 4000, temp: '60°C' },
  { id: 'sabana', label: 'Sábana', icono: '🛏️', precio: 8000, temp: '60°C' },
  { id: 'cobija', label: 'Cobija', icono: '🧸', precio: 14000, temp: '40°C' },
];

const fmt = n => '$' + n.toLocaleString('es-CO');

export default function SelectorTipoPrendaLavado({ onUpdate }) {
  const [cantidades, setCantidades] = useState({});

  const set = (id, delta) => {
    setCantidades(c => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
      const total = Object.entries(next).reduce((acc, [k, v]) => {
        const p = PRENDAS.find(p => p.id === k);
        return acc + (p ? p.precio * v : 0);
      }, 0);
      onUpdate?.({ cantidades: next, total });
      return next;
    });
  };

  const total = Object.entries(cantidades).reduce((acc, [k, v]) => {
    const p = PRENDAS.find(p => p.id === k);
    return acc + (p ? p.precio * v : 0);
  }, 0);
  const totalUnidades = Object.values(cantidades).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRENDAS.map(p => (
          <div key={p.id} className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${cantidades[p.id] > 0 ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
            <span className="text-xl shrink-0">{p.icono}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate">{p.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{fmt(p.precio)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => set(p.id, -1)} className="w-6 h-6 rounded-lg border border-[var(--color-border)] text-xs font-black text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-primary)]/50">−</button>
              <span className={`w-5 text-center text-xs font-black ${cantidades[p.id] > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>{cantidades[p.id] || 0}</span>
              <button onClick={() => set(p.id, 1)} className="w-6 h-6 rounded-lg bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-black cursor-pointer">+</button>
            </div>
          </div>
        ))}
      </div>
      {totalUnidades > 0 && (
        <div className="flex items-center justify-between p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">{totalUnidades} prenda{totalUnidades !== 1 ? 's' : ''}</p>
            <p className="text-xs font-black">Total estimado</p>
          </div>
          <span className="text-xl font-black text-[var(--color-primary)]">{fmt(total)}</span>
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado
- `cantidades`: `{ [id]: number }` — contador por tipo de prenda
- `total`: suma de `precio × cantidad` por cada tipo

## 5. Flujo Operativo
```
Incrementar prenda → cantidades actualizado → total recalculado → panel de resumen visible
```
