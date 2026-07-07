<!--
{
  "resource": "DeslizadorCapacidadTonelaje",
  "technicalName": "DeslizadorCapacidadTonelaje",
  "type": "component",
  "niches": [
    "machinery_rental"
  ],
  "targetPath": "src/components/common/DeslizadorCapacidadTonelaje.jsx",
  "dependencies": {
    "npm": {},
    "internal": [
      {
        "name": "CustomSelect",
        "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Selector_Desplegable/custom_select.md"
      },
      {
        "name": "DatePickerPremium",
        "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md"
      }
    ]
  }
}
-->

# Deslizador de Capacidad y Tonelaje

Control de filtro de rango interactivo para acotar el catálogo de maquinaria por capacidad de carga (toneladas) y altura/alcance (metros).

## Especificaciones Visuales
- HSL variables y tema marca blanca.
- Sin selectores nativos.
- Calendario integrado HSL.

## 3. Código React
```jsx
import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

export default function DeslizadorCapacidadTonelaje() {
  const [tonelaje, setTonelaje] = useState(15);
  const [alcance, setAlcance] = useState(20);

  const maquinarias = [
    { name: 'Minicargadora Bobcat S450', toneladas: 1.5, alcance: 3 },
    { name: 'Montacargas Yale', toneladas: 5, alcance: 4.5 },
    { name: 'Excavadora CAT 320', toneladas: 20, alcance: 10 },
    { name: 'Grúa Telescópica Liebherr', toneladas: 50, alcance: 45 },
    { name: 'Manitou Telescópico 1740', toneladas: 4, alcance: 17 }
  ];

  const filtrados = maquinarias.filter(m => m.toneladas <= tonelaje && m.alcance <= alcance);

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Filtro Técnico de Capacidad</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Define las especificaciones de carga y alcance</p>
          </div>
          <Sliders className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Capacidad de Carga Máxima</span>
              <span className="text-indigo-400">{tonelaje} Toneladas</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={tonelaje}
              onChange={(e) => setTonelaje(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Alcance / Altura Máxima</span>
              <span className="text-indigo-400">{alcance} Metros</span>
            </div>
            <input
              type="range"
              min="2"
              max="80"
              value={alcance}
              onChange={(e) => setAlcance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Equipos que coinciden ({filtrados.length})</span>
          <div className="flex flex-col gap-1.5">
            {filtrados.length === 0 ? (
              <span className="text-xs text-[var(--color-text-muted)] italic py-4 text-center">Ningún equipo cumple con el filtro mínimo.</span>
            ) : (
              filtrados.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-xl flex justify-between items-center text-xs text-[var(--color-text)]">
                  <span className="font-bold">{m.name}</span>
                  <div className="flex gap-2 text-[9px] text-[var(--color-text-muted)] font-semibold shrink-0">
                    <span>{m.toneladas} Ton</span>
                    <span>•</span>
                    <span>{m.alcance} m alcance</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```
