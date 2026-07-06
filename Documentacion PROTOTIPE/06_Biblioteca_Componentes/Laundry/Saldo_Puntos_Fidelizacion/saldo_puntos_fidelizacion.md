<!--
{
  "resource": "SaldoPuntosFidelizacion",
  "technicalName": "SaldoPuntosFidelizacion",
  "targetPath": "src/components/common/SaldoPuntosFidelizacion.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Saldo de Puntos y Fidelización

## 1. Propósito y Casos de Uso
Tarjeta de fidelización digital para lavanderías. Muestra lavadas acumuladas, puntos canjeables y cupones activos con un anillo SVG de progreso hacia la próxima lavada gratuita.

**Casos de uso:** Dashboard del cliente en app, página de perfil, pantalla post-pago.

## 2. Especificación Visual
- Anillo SVG de progreso circular con lavadas/meta
- KPIs: puntos totales y cupones activos
- Lista de cupones con estado activo/bloqueado y fecha de vencimiento

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const META = 10;

export default function SaldoPuntosFidelizacion({ lavadas: initLavadas = 7 }) {
  const [lavadas, setLavadas] = useState(initLavadas);
  const puntos = lavadas * 150;
  const progreso = (lavadas % META) / META;
  const dash = 2 * Math.PI * 44;
  const dashOffset = dash * (1 - progreso);

  const cupones = [
    { id: 1, desc: '10% OFF próximo servicio', vence: '2026-07-31', activo: true },
    { id: 2, desc: 'Planchado gratis', vence: '2026-08-15', activo: lavadas >= 5 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-primary)" strokeWidth="8"
              strokeDasharray={dash} strokeDashoffset={dashOffset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-[var(--color-primary)]">{lavadas % META}</span>
            <span className="text-xs text-[var(--color-text-muted)]">/{META}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-black">Lavadas: {lavadas}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{META - (lavadas % META)} para la próxima <b>gratis</b></p>
          <p className="text-xs font-bold text-[var(--color-primary)] mt-1">⭐ {puntos.toLocaleString()} pts</p>
        </div>
      </div>
      {cupones.map(c => (
        <div key={c.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${c.activo ? 'border-green-500/40 bg-green-500/10' : 'border-[var(--color-border)] opacity-40'}`}>
          <div>
            <p className="text-xs font-bold">{c.desc}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Vence: {c.vence}</p>
          </div>
          {c.activo && <span className="text-xs font-black text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Activo</span>}
        </div>
      ))}
    </div>
  );
}
```

## 4. Lógica de Estado
- `lavadas`: contador (prop o local)
- `puntos`: lavadas × 150
- `progreso`: fracción del anillo = `(lavadas % 10) / 10`

## 5. Flujo Operativo
```
Lavada completada → Incremento → Anillo SVG actualizado → Cupón desbloqueado al cruzar umbral
```
