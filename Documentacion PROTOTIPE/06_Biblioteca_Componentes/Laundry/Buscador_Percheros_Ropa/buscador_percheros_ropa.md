<!--
{
  "resource": "BuscadorPercherosRopa",
  "technicalName": "BuscadorPercherosRopa",
  "targetPath": "src/components/common/BuscadorPercherosRopa.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Buscador de Percheros de Ropa

## 1. Propósito y Casos de Uso
Ubica rápidamente el perchero físico donde está almacenada una prenda usando el número de ticket. Reduce el tiempo de entrega en mostrador.

**Casos de uso:** Mostrador de lavandería, app de cliente para autorecogida, kiosco de autoservicio.

## 2. Especificación Visual
- Input numérico + botón buscar (Enter compatible)
- Card de resultado con número, pasillo y color del marcador
- Mapa visual de grilla 8×3 (24 percheros) con el encontrado resaltado y escalado

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const PERCHEROS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  pasillo: i < 8 ? 'A' : i < 16 ? 'B' : 'C',
  color: ['azul','verde','rojo','amarillo'][i % 4],
}));

const COLOR_HEX = { azul: '#3b82f6', verde: '#22c55e', rojo: '#ef4444', amarillo: '#eab308' };

export default function BuscadorPercherosRopa() {
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(false);

  const buscar = () => {
    const n = parseInt(query, 10);
    const p = PERCHEROS.find(p => p.id === n);
    if (p) { setResultado(p); setError(false); }
    else { setResultado(null); setError(true); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input type="number" min={1} max={24} value={query}
          onChange={e => { setQuery(e.target.value); setError(false); setResultado(null); }}
          onKeyDown={e => e.key==='Enter' && buscar()}
          placeholder="N° ticket (1-24)"
          className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50" />
        <button onClick={buscar} className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-black rounded-xl cursor-pointer">Buscar</button>
      </div>
      {error && <p className="text-xs text-red-400 font-semibold">No encontrado: ticket #{query}</p>}
      {resultado && (
        <div className="flex items-center gap-3 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text)] font-black text-sm" style={{ backgroundColor: COLOR_HEX[resultado.color] }}>{resultado.id}</div>
          <div>
            <p className="text-xs font-black">Perchero #{resultado.id}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Pasillo {resultado.pasillo} · Marcador {resultado.color}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-8 gap-1.5">
        {PERCHEROS.map(p => (
          <div key={p.id}
            className={`h-7 rounded-lg flex items-center justify-center text-[var(--color-text)] text-xs font-black transition-all ${resultado?.id===p.id ? 'ring-2 ring-white scale-125 z-10' : 'opacity-60'}`}
            style={{ backgroundColor: COLOR_HEX[p.color] }}>
            {p.id}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Lógica de Estado
- `query`: número de ticket ingresado
- `resultado`: objeto perchero encontrado
- `error`: flag de ticket inexistente

## 5. Flujo Operativo
```
Ingresar ticket → Buscar → Resultado con pasillo/color → Mapa resalta perchero
```
