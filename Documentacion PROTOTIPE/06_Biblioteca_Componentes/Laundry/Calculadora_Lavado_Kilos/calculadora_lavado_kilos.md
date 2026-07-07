<!--
{
  "resource": "CalculadoraLavadoKilos",
  "technicalName": "CalculadoraLavadoKilos",
  "targetPath": "src/components/common/CalculadoraLavadoKilos.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Calculadora de Lavado por Kilos

## 1. Propósito y Casos de Uso
Calcula el costo estimado de un servicio de lavandería basado en el peso de la ropa en kilogramos, usando rangos de precio predefinidos. Permite al cliente conocer el valor antes de entregar sus prendas.

**Casos de uso:** Formulario de cotización online, quiosco de autoservicio, app de pedidos a domicilio de lavandería.

## 2. Especificación Visual
- Slider range de 1 a 30 kg con valor numérico en tiempo real
- Lista de rangos de precio con fila activa resaltada con borde primario
- Panel de total estimado con tipografía grande

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const RANGOS = [
  { min: 1, max: 5, precio: 8000 },
  { min: 6, max: 10, precio: 14000 },
  { min: 11, max: 15, precio: 20000 },
  { min: 16, max: 20, precio: 26000 },
  { min: 21, max: 30, precio: 35000 },
];

const fmt = n => '$' + n.toLocaleString('es-CO');

export default function CalculadoraLavadoKilos({ onSelect }) {
  const [kg, setKg] = useState(5);
  const rango = RANGOS.find(r => kg >= r.min && kg <= r.max) || RANGOS[RANGOS.length - 1];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">Peso de la ropa</span>
          <span className="text-lg font-black text-[var(--color-primary)]">{kg} kg</span>
        </div>
        <input type="range" min={1} max={30} value={kg}
          onChange={e => { const v = Number(e.target.value); setKg(v); onSelect?.({ kg: v, precio: rango.precio }); }}
          className="w-full accent-[var(--color-primary)] h-2 rounded-full cursor-pointer" />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>1 kg</span><span>30 kg</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {RANGOS.map(r => (
          <div key={r.min} className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            rango === r ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)]'
          }`}>
            <span className="text-xs font-semibold">{r.min}–{r.max} kg</span>
            <span className="text-xs font-bold">{fmt(r.precio)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl p-4">
        <span className="text-xs font-black">Total estimado</span>
        <span className="text-xl font-black text-[var(--color-primary)]">{fmt(rango.precio)}</span>
      </div>
    </div>
  );
}
```

## 4. Lógica de Estado
- `kg`: peso actual del slider (1–30)
- `rango`: objeto de rango activo encontrado por `Array.find`

## 5. Flujo Operativo
```
Arrastrar slider → kg actualizado → rango activo recalculado → fila y total resaltados
```
