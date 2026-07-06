<!--
{
  "resource": "ToggleImpermeabilizacion",
  "technicalName": "ToggleImpermeabilizacion",
  "targetPath": "src/components/common/ToggleImpermeabilizacion.jsx",
  "type": "component",
  "niches": ["furniture_repair"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Toggle de Impermeabilización (Teflonado)

## 1. Propósito y Casos de Uso
Servicio adicional de teflonado nano-repelente para tapicería post-restauración. Se activa con un toggle de diseño premium con animación de ondas y muestra el costo y garantía de forma reactiva.

**Casos de uso:** Pantalla de opciones adicionales en el flujo de cotización de tapicería, checkout de servicios complementarios.

## 2. Especificación Visual
- Card glassmorphism con animación de ondas cuando está activo (efecto agua/protección)
- Toggle grande con transición suave
- Badges de "Garantía 6 meses" y "+1 día extra" al activar
- Lista de ítems incluidos en el servicio

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const PRECIO = 45000;
const GARANTIA_MESES = 6;
const fmt = n => '$' + n.toLocaleString('es-CO');

export default function ToggleImpermeabilizacion({ onToggle }) {
  const [activo, setActivo] = useState(false);

  const handle = () => {
    const next = !activo;
    setActivo(next);
    onToggle?.({ activo: next, precio: next ? PRECIO : 0 });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`relative p-5 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${activo
        ? 'border-blue-500/60 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
        {activo && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-blue-400/10 animate-ping"
                style={{ width: 20+i*24, height: 20+i*24, top: `${20+i*15}%`, left: `${15+i*18}%`, animationDelay: `${i*0.4}s`, animationDuration: '3s' }} />
            ))}
          </div>
        )}
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <p className="text-sm font-black">Teflonado Impermeabilizante</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Tratamiento nano-repelente. Protege tela de líquidos, manchas y polvo.
            </p>
            {activo && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs font-black text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">✓ Garantía {GARANTIA_MESES} meses</span>
                <span className="text-xs font-black text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">+1 día de secado</span>
              </div>
            )}
          </div>
          <button onClick={handle}
            className={`relative w-14 h-7 rounded-full border-2 cursor-pointer shrink-0 transition-all duration-300 ${activo ? 'bg-blue-500 border-blue-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${activo ? 'left-[30px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activo ? 'border-blue-500/40 bg-blue-500/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
        <p className="text-xs font-black">Teflonado {activo ? 'incluido' : 'no incluido'}</p>
        <p className={`text-xl font-black transition-colors ${activo ? 'text-blue-400' : 'text-[var(--color-text-muted)]'}`}>
          {activo ? `+${fmt(PRECIO)}` : '$0'}
        </p>
      </div>
      {activo && (
        <div className="flex flex-col gap-1.5">
          {['Aplicación de nano-repelente profesional','Secado UV controlado (1 hora adicional)','Certificado de garantía de 6 meses','Prueba de goteo incluida'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-blue-400 text-xs">✓</span>
              <span className="text-xs">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado
- `activo`: boolean del servicio de teflonado
- Precio fijo de `$45,000` solo se muestra cuando activo = true

## 5. Flujo Operativo
```
Toggle OFF → sin costo → Toggle ON → animación de ondas activa → precio y garantía visibles → onToggle emitido
```
