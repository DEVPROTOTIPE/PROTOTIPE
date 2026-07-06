<!--
{
  "resource": "SelectorVelocidadServicio",
  "technicalName": "SelectorVelocidadServicio",
  "targetPath": "src/components/common/SelectorVelocidadServicio.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Selector de Velocidad de Servicio

## 1. Propósito y Casos de Uso
Permite elegir la velocidad de entrega del servicio de lavandería (Normal, Mismo día, Express) con cálculo reactivo del precio total incluido el recargo porcentual.

**Casos de uso:** Checkout de pedido en app, formulario de solicitud, quiosco de lavandería.

## 2. Especificación Visual
- 3 cards verticales con icono, nombre, descripción y badge de recargo
- Card activa con borde de color tintado y fondo suave
- Panel de total con precio base + recargo visible

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const OPCIONES = [
  { id: 'normal', label: 'Normal', desc: '3 a 5 días hábiles', recargo: 0, icono: '📦' },
  { id: 'mismo_dia', label: 'Mismo día', desc: 'Entrega antes de las 8 PM', recargo: 50, icono: '🚀' },
  { id: 'express', label: 'Express', desc: 'Entrega en 4 horas', recargo: 100, icono: '⚡' },
];

const fmt = n => '$' + n.toLocaleString('es-CO');

export default function SelectorVelocidadServicio({ basePrice = 15000, onSelect }) {
  const [selected, setSelected] = useState('normal');
  const opcion = OPCIONES.find(o => o.id === selected);
  const total = basePrice + basePrice * opcion.recargo / 100;

  const handle = (id) => { setSelected(id); onSelect?.({ id, total }); };

  return (
    <div className="flex flex-col gap-3">
      {OPCIONES.map(o => (
        <button key={o.id} onClick={() => handle(o.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer text-left transition-all ${selected===o.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
          <span className="text-2xl">{o.icono}</span>
          <div className="flex-1">
            <p className="text-sm font-black">{o.label}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{o.desc}</p>
          </div>
          <span className={`text-xs font-black ${o.recargo > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            {o.recargo > 0 ? `+${o.recargo}%` : 'Sin recargo'}
          </span>
        </button>
      ))}
      <div className="flex items-center justify-between p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Base {fmt(basePrice)}{opcion.recargo>0 ? ` + ${opcion.recargo}% recargo` : ''}</p>
          <p className="text-xs font-black">Total estimado</p>
        </div>
        <span className="text-xl font-black text-[var(--color-primary)]">{fmt(total)}</span>
      </div>
    </div>
  );
}
```

## 4. Lógica de Estado
- `selected`: ID de la velocidad elegida
- `total`: `basePrice + basePrice × recargo / 100`

## 5. Flujo Operativo
```
Seleccionar velocidad → Recargo aplicado → Total actualizado en tiempo real → onSelect emitido
```
