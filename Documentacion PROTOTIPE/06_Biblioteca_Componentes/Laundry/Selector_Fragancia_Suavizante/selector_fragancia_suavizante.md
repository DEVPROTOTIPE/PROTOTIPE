<!--
{
  "resource": "SelectorFraganciaSuavizante",
  "technicalName": "SelectorFraganciaSuavizante",
  "targetPath": "src/components/common/SelectorFraganciaSuavizante.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Selector de Fragancia y Suavizante

## 1. Propósito y Casos de Uso
Personaliza el aroma del suavizante e indica si se requiere detergente hipoalergénico. Mejora la experiencia del cliente ofreciendo personalización sin contacto.

**Casos de uso:** Formulario de pedido, quiosco de autoservicio, panel de configuración del servicio de lavandería.

## 2. Especificación Visual
- Grid 3×2 de cards con color representativo y emoji de fragancia
- Toggle para detergente hipoalergénico (apto pieles sensibles)
- Badge de confirmación con el nombre de la fragancia seleccionada

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const FRAGANCIAS = [
  { id: 'lavanda', label: 'Lavanda', color: '#a78bfa', emoji: '💜' },
  { id: 'floral', label: 'Floral', color: '#f472b6', emoji: '🌸' },
  { id: 'citrico', label: 'Cítrico', color: '#fb923c', emoji: '🍋' },
  { id: 'marino', label: 'Marino', color: '#38bdf8', emoji: '🌊' },
  { id: 'neutro', label: 'Sin fragancia', color: '#94a3b8', emoji: '⚪' },
  { id: 'bebe', label: 'Bebé (suave)', color: '#86efac', emoji: '🍼' },
];

export default function SelectorFraganciaSuavizante({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [hipoalergenico, setHipoalergenico] = useState(false);

  const handle = (f) => {
    setSelected(f.id);
    onSelect?.({ ...f, hipoalergenico });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2.5">
        {FRAGANCIAS.map(f => (
          <button key={f.id} onClick={() => handle(f)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer"
            style={selected===f.id ? { borderColor: f.color, backgroundColor: f.color+'18', boxShadow: `0 0 16px ${f.color}30` } : {}}>
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-xs font-bold text-center leading-tight">{f.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <div>
          <p className="text-xs font-black">Detergente hipoalergénico</p>
          <p className="text-xs text-[var(--color-text-muted)]">Apto para pieles sensibles y bebés</p>
        </div>
        <button onClick={() => setHipoalergenico(h => !h)}
          className={`relative w-11 h-6 rounded-full border-2 cursor-pointer transition-all ${hipoalergenico ? 'bg-green-500 border-green-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${hipoalergenico ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
      {(selected || hipoalergenico) && (
        <div className="p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl text-xs font-semibold">
          {selected && <span>Fragancia: <b>{FRAGANCIAS.find(f=>f.id===selected)?.label}</b></span>}
          {selected && hipoalergenico && <span className="mx-2">·</span>}
          {hipoalergenico && <span className="text-green-400 font-black">✓ Hipoalergénico</span>}
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado
- `selected`: ID de fragancia activa
- `hipoalergenico`: boolean para tipo de detergente

## 5. Flujo Operativo
```
Seleccionar fragancia → Activar hipoalergénico (opcional) → Badge de confirmación visible
```
