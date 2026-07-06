<!--
{
  "resource": "CuadriculaPrendasOlvidas",
  "technicalName": "CuadriculaPrendasOlvidas",
  "targetPath": "src/components/common/CuadriculaPrendasOlvidas.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Cuadrícula de Prendas Olvidadas

## 1. Propósito y Casos de Uso
Buscador y listado de prendas sin etiqueta identificadora que quedaron en la lavandería. El staff o el cliente puede filtrar por color, tipo o descripción libre para reclamar su prenda.

**Casos de uso:** Panel de administración de lavandería, app de cliente con sección de "lost & found", quiosco de autorecogida.

## 2. Especificación Visual
- Input de búsqueda textual por descripción, color y tipo
- Contador de resultados reactivo
- Cards de prenda con ícono, descripción, badges de color/talla y fecha de hallazgo
- Estado vacío ilustrado con emoji de lupa

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const PRENDAS = [
  { id: 1, desc: 'Camisa azul manga larga', talla: 'M', fecha: '2026-06-28', color: 'Azul', tipo: 'Camisa' },
  { id: 2, desc: 'Pantalón negro tipo sastre', talla: '32', fecha: '2026-06-25', color: 'Negro', tipo: 'Pantalón' },
  { id: 3, desc: 'Vestido floral rosado', talla: 'S', fecha: '2026-06-20', color: 'Rosado', tipo: 'Vestido' },
  { id: 4, desc: 'Chaqueta gris con capucha', talla: 'L', fecha: '2026-06-18', color: 'Gris', tipo: 'Chaqueta' },
  { id: 5, desc: 'Calcetines deportivos blancos', talla: 'Único', fecha: '2026-07-01', color: 'Blanco', tipo: 'Calcetines' },
  { id: 6, desc: 'Blusa beige con botones dorados', talla: 'M', fecha: '2026-07-01', color: 'Beige', tipo: 'Blusa' },
];

const ICONOS = { Camisa:'👕', Pantalón:'👖', Vestido:'👗', Chaqueta:'🧥', Calcetines:'🧦', Blusa:'👚' };

export default function CuadriculaPrendasOlvidas({ prendas = PRENDAS }) {
  const [q, setQ] = useState('');
  const filtradas = prendas.filter(p =>
    !q || p.desc.toLowerCase().includes(q.toLowerCase()) ||
    p.color.toLowerCase().includes(q.toLowerCase()) ||
    p.tipo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="Buscar por color, tipo o descripción…"
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50" />
      <p className="text-xs text-[var(--color-text-muted)]">{filtradas.length} prenda{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}</p>
      <div className="flex flex-col gap-2">
        {filtradas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl">🔍</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Sin resultados para "{q}"</p>
          </div>
        ) : filtradas.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/40 transition-colors">
            <span className="text-2xl">{ICONOS[p.tipo] || '🧺'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{p.desc}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{p.color}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">T. {p.talla}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-[var(--color-text-muted)]">Encontrada</p>
              <p className="text-xs font-semibold">{p.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Lógica de Estado
- `q`: término de búsqueda libre
- `filtradas`: subconjunto de `prendas` que coinciden con `q`

## 5. Flujo Operativo
```
Ingresar texto → filtradas actualizado → lista re-renderizada → estado vacío si sin coincidencias
```
