<!--
{
  "resource": "CalculadoraFleteMuebles",
  "technicalName": "CalculadoraFleteMuebles",
  "targetPath": "src/components/common/CalculadoraFleteMuebles.jsx",
  "type": "component",
  "niches": ["furniture_repair"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Calculadora de Flete de Muebles

## 1. Propósito y Casos de Uso
Calcula el costo de transporte de un mueble para restauración basándose en sus dimensiones, piso de entrega, disponibilidad de ascensor y si requiere armado en sitio. El precio es reactivo en tiempo real.

**Casos de uso:** Cotizador de servicio de tapicería, formulario de solicitud de recogida, app de presupuesto de restauración.

## 2. Especificación Visual
- Sliders para ancho, alto, profundidad (cm) y piso de entrega
- Toggles de ascensor disponible y armado en sitio
- Desglose de costos por ítem (volumen, operarios, piso, armado)
- Panel de total reactivo en tiempo real

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const TARIFA_OPERARIO = 40000;
const TARIFA_PISO = 15000;
const TARIFA_ARMADO = 60000;
const fmt = n => '$' + Math.round(n).toLocaleString('es-CO');

export default function CalculadoraFleteMuebles({ onSelect }) {
  const [ancho, setAncho] = useState(180);
  const [alto, setAlto] = useState(90);
  const [prof, setProf] = useState(80);
  const [piso, setPiso] = useState(1);
  const [ascensor, setAscensor] = useState(false);
  const [armado, setArmado] = useState(false);

  const volumen = (ancho * alto * prof) / 1000000;
  const operarios = volumen > 0.5 ? 2 : 1;
  const costoBase = 45000 + volumen * 30000;
  const pisoExtra = piso > 1 && !ascensor ? (piso - 1) * TARIFA_PISO : 0;
  const total = costoBase + operarios * TARIFA_OPERARIO + pisoExtra + (armado ? TARIFA_ARMADO : 0);

  const Slider = ({ label, value, min, max, unit, onChange }) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">{label}</label>
        <span className="text-xs font-bold text-[var(--color-primary)]">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)] h-1.5 rounded-full cursor-pointer" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Slider label="Ancho" value={ancho} min={40} max={300} unit="cm" onChange={setAncho} />
      <Slider label="Alto" value={alto} min={30} max={200} unit="cm" onChange={setAlto} />
      <Slider label="Profundidad" value={prof} min={30} max={150} unit="cm" onChange={setProf} />
      <Slider label="Piso" value={piso} min={1} max={10} unit="°" onChange={setPiso} />
      <div className="flex gap-2">
        {[['Ascensor', ascensor, setAscensor],['Armado en sitio', armado, setArmado]].map(([l, v, fn]) => (
          <button key={l} onClick={() => fn(x => !x)}
            className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${v ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            <span>{l}</span><span>{v ? '✓' : '○'}</span>
          </button>
        ))}
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">Desglose</p>
        {[
          [`Volumen: ${volumen.toFixed(2)} m³`, fmt(costoBase)],
          [`${operarios} operario${operarios>1?'s':''}`, fmt(operarios * TARIFA_OPERARIO)],
          pisoExtra > 0 && [`Piso ${piso} sin ascensor`, fmt(pisoExtra)],
          armado && ['Armado en sitio', fmt(TARIFA_ARMADO)],
        ].filter(Boolean).map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-[var(--color-text-muted)]">{k}</span>
            <span className="font-bold">{v}</span>
          </div>
        ))}
        <div className="w-full h-px bg-[var(--color-border)] mt-1" />
        <div className="flex justify-between items-center">
          <span className="text-xs font-black">Total estimado</span>
          <span className="text-lg font-black text-[var(--color-primary)]">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
```

## 4. Lógica de Estado
- `ancho / alto / prof / piso`: dimensiones en cm y número de piso
- `ascensor / armado`: booleans de servicios adicionales
- `total`: calculado reactivamente sin estado propio

## 5. Flujo Operativo
```
Ajustar sliders → Activar opciones → Desglose recalculado → Total reactivo en tiempo real
```
