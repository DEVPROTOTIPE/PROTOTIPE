<!--
{
  "resource": "FichaReporteManchas",
  "technicalName": "FichaReporteManchas",
  "targetPath": "src/components/common/FichaReporteManchas.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Ficha de Reporte de Manchas

## 1. Propósito y Casos de Uso
Formulario digital para marcar manchas sobre una silueta de prenda, indicando tipo y posición. Elimina ambigüedades en la recepción de prendas delicadas.

**Casos de uso:** Tintorería premium, lavandería con servicio especial, recepción de prendas.

## 2. Especificación Visual
- Toggle Frente/Espalda con chips de tipo de mancha activa
- Silueta posicionada con puntos clicables (8 zonas)
- Lista de manchas registradas con botón de eliminación

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const TIPOS_MANCHA = ['Aceite','Vino','Café','Sangre','Tinta','Barro','Grasa','Sudor'];
const ZONAS = [
  { id: 'hombro_izq', label: 'Hombro Izq', top: '10%', left: '20%' },
  { id: 'hombro_der', label: 'Hombro Der', top: '10%', left: '70%' },
  { id: 'pecho', label: 'Pecho', top: '22%', left: '45%' },
  { id: 'manga_izq', label: 'Manga Izq', top: '30%', left: '8%' },
  { id: 'manga_der', label: 'Manga Der', top: '30%', left: '82%' },
  { id: 'abdomen', label: 'Abdomen', top: '42%', left: '45%' },
  { id: 'falda_izq', label: 'Falda Izq', top: '62%', left: '30%' },
  { id: 'falda_der', label: 'Falda Der', top: '62%', left: '60%' },
];

export default function FichaReporteManchas({ onUpdate }) {
  const [manchas, setManchas] = useState([]);
  const [tipoActivo, setTipoActivo] = useState('Aceite');
  const [lado, setLado] = useState('frente');

  const addMancha = (zona) => {
    if (manchas.find(m => m.zona === zona.id && m.lado === lado)) return;
    const nueva = { zona: zona.id, label: zona.label, tipo: tipoActivo, lado };
    const next = [...manchas, nueva];
    setManchas(next);
    onUpdate?.(next);
  };
  const remove = (i) => {
    const next = manchas.filter((_, idx) => idx !== i);
    setManchas(next);
    onUpdate?.(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['frente','espalda'].map(l => (
          <button key={l} onClick={() => setLado(l)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border cursor-pointer capitalize transition-all ${lado===l ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TIPOS_MANCHA.map(t => (
          <button key={t} onClick={() => setTipoActivo(t)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer ${tipoActivo===t ? 'bg-orange-500/20 border-orange-500/60 text-orange-400' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="relative mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden" style={{ width: '180px', height: '260px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-20">{lado==='frente'?'👕':'🔄'}</span>
        </div>
        {ZONAS.map(z => {
          const marcada = manchas.find(m => m.zona===z.id && m.lado===lado);
          return (
            <button key={z.id} onClick={() => addMancha(z)}
              style={{ top: z.top, left: z.left, transform: 'translate(-50%,-50%)' }}
              className={`absolute w-7 h-7 rounded-full border-2 text-xs font-black cursor-pointer transition-all ${marcada ? 'bg-red-500 border-red-400 text-[var(--color-text)] scale-110' : 'bg-white/5 border-white/20 text-[var(--color-text)]/40 hover:border-orange-400'}`}>
              {marcada ? '!' : '+'}
            </button>
          );
        })}
      </div>
      {manchas.map((m, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl">
          <span className="text-xs text-red-400">{m.label} ({m.lado}) — {m.tipo}</span>
          <button onClick={() => remove(i)} className="text-red-400 font-black cursor-pointer text-sm">✕</button>
        </div>
      ))}
    </div>
  );
}
```

## 4. Lógica de Estado
- `manchas[]`: `{ zona, label, tipo, lado }` — una por zona/lado
- `tipoActivo`: tipo elegido antes de marcar
- `lado`: 'frente' | 'espalda'

## 5. Flujo Operativo
```
Seleccionar tipo → Clic en zona → Mancha registrada → Lista con opción de borrar
```
