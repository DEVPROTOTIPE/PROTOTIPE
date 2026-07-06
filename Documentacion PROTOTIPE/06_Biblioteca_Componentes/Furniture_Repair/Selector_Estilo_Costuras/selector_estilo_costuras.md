<!--
{
  "resource": "SelectorEstiloCosturas",
  "technicalName": "SelectorEstiloCosturas",
  "targetPath": "src/components/common/SelectorEstiloCosturas.jsx",
  "type": "component",
  "niches": ["furniture_repair"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Selector de Estilo de Costuras

## 1. Propósito y Casos de Uso
Permite al cliente elegir el tipo de costura decorativa del tapizado (recta, zigzag, capitoné diamante, etc.), con visualización del costo adicional por cada opción.

**Casos de uso:** Formulario de cotización de tapicería, módulo de configuración de mueble, panel de opciones en app de restauración.

## 2. Especificación Visual
- Grid 2×3 de cards con ícono, nombre y badge de precio adicional
- Card activa con borde primario y escala sutil
- Panel detalle inferior con descripción completa y costo o "Incluido en base"

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const ESTILOS = [
  { id: 'recta', label: 'Costura Recta', precio: 0, icono: '➖', desc: 'Clásica y limpia, sin decoración adicional.' },
  { id: 'zigzag', label: 'Costura Zigzag', precio: 35000, icono: '〰️', desc: 'Refuerzo y detalle decorativo en costuras.' },
  { id: 'capitone_diamante', label: 'Capitoné Diamante', precio: 120000, icono: '💎', desc: 'Acolchado clásico con botones en rombo.' },
  { id: 'capitone_cuadrado', label: 'Capitoné Cuadrado', precio: 100000, icono: '⬛', desc: 'Bloques cuadrados uniformes y modernos.' },
  { id: 'sin_costura', label: 'Sin costura', precio: 0, icono: '⬜', desc: 'Superficie limpia sin detalles de hilo.' },
  { id: 'ingles', label: 'Costura Inglesa', precio: 55000, icono: '🪡', desc: 'Doble pespunte visible en bordes.' },
];

const fmt = n => '$' + n.toLocaleString('es-CO');

export default function SelectorEstiloCosturas({ onSelect }) {
  const [selected, setSelected] = useState('recta');
  const est = ESTILOS.find(e => e.id === selected);

  const handle = (id) => { setSelected(id); onSelect?.(ESTILOS.find(e => e.id === id)); };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ESTILOS.map(e => (
          <button key={e.id} onClick={() => handle(e.id)}
            className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left cursor-pointer transition-all ${selected===e.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.02]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'}`}>
            <span className="text-xl">{e.icono}</span>
            <p className={`text-xs font-black leading-tight ${selected===e.id ? 'text-[var(--color-primary)]' : ''}`}>{e.label}</p>
            <p className={`text-xs font-bold ${e.precio > 0 ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}`}>
              {e.precio > 0 ? `+${fmt(e.precio)}` : 'Sin costo extra'}
            </p>
          </button>
        ))}
      </div>
      {est && (
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex gap-3 items-start">
          <span className="text-2xl shrink-0">{est.icono}</span>
          <div>
            <p className="text-xs font-black">{est.label}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{est.desc}</p>
            <p className={`text-xs font-black mt-1 ${est.precio > 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {est.precio > 0 ? `Costo adicional: ${fmt(est.precio)}` : '✓ Incluido en el servicio base'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado
- `selected`: ID del estilo elegido
- `est`: objeto estilo activo para el panel de detalle

## 5. Flujo Operativo
```
Seleccionar estilo → Card resaltada → Detalle con descripción y costo → onSelect emitido
```
