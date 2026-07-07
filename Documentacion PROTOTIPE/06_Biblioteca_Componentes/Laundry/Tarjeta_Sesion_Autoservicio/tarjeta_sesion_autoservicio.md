<!--
{
  "resource": "TarjetaSesionAutoservicio",
  "technicalName": "TarjetaSesionAutoservicio",
  "targetPath": "src/components/common/TarjetaSesionAutoservicio.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Tarjeta de Sesión de Autoservicio

## 1. Propósito y Casos de Uso
Visualización en tiempo real del estado de máquinas de lavandería autoservicio (lavadoras y secadoras). Permite al cliente seleccionar una máquina, ver su disponibilidad e iniciar un ciclo.

**Casos de uso:** Quiosco de lavandería autoservicio, app móvil del establecimiento.

## 2. Especificación Visual
- Grid 3×2 de tarjetas máquina con badge verde/rojo (libre/ocupada)
- Panel de detalle con barra de progreso del ciclo activo
- Botón "Iniciar ciclo" solo en máquinas libres

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const MAQUINAS_INIT = [
  { id: 'L1', tipo: 'Lavadora', num: 1, estado: 'libre', minutos: 0 },
  { id: 'L2', tipo: 'Lavadora', num: 2, estado: 'ocupada', minutos: 24 },
  { id: 'L3', tipo: 'Lavadora', num: 3, estado: 'ocupada', minutos: 8 },
  { id: 'S1', tipo: 'Secadora', num: 1, estado: 'libre', minutos: 0 },
  { id: 'S2', tipo: 'Secadora', num: 2, estado: 'ocupada', minutos: 42 },
  { id: 'S3', tipo: 'Secadora', num: 3, estado: 'libre', minutos: 0 },
];

export default function TarjetaSesionAutoservicio({ onIniciar }) {
  const [maquinas, setMaquinas] = useState(MAQUINAS_INIT);
  const [selected, setSelected] = useState(null);
  const selMaq = maquinas.find(m => m.id === selected);

  const iniciar = (id) => {
    setMaquinas(ms => ms.map(m => m.id === id ? { ...m, estado: 'ocupada', minutos: 35 } : m));
    onIniciar?.(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {maquinas.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all ${selected===m.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
            <span className="text-xl">{m.tipo==='Lavadora'?'🫧':'🌀'}</span>
            <span className="text-xs font-black">{m.tipo} {m.num}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.estado==='libre'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>
              {m.estado==='libre'?'Libre':`${m.minutos} min`}
            </span>
          </button>
        ))}
      </div>
      {selMaq && (
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-3">
          <p className="text-sm font-black">{selMaq.tipo} #{selMaq.num} — <span className={selMaq.estado==='libre'?'text-green-400':'text-red-400'}>{selMaq.estado==='libre'?'✓ Disponible':`⏱ ${selMaq.minutos} min restantes`}</span></p>
          {selMaq.estado==='ocupada' && (
            <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] animate-pulse rounded-full" style={{ width:`${100-(selMaq.minutos/60)*100}%` }} />
            </div>
          )}
          {selMaq.estado==='libre' && (
            <button onClick={() => iniciar(selMaq.id)} className="w-full py-2 bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-black rounded-xl cursor-pointer hover:opacity-90">
              Iniciar ciclo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado
- `maquinas[]`: estado local mutable de cada máquina
- `selected`: ID de máquina activa en el panel de detalle

## 5. Flujo Operativo
```
Seleccionar máquina → Ver detalle → Iniciar ciclo (libre) → Estado cambia a ocupada + barra de progreso
```
