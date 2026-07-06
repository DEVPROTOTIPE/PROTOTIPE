<!--
{
  "resource": "GaleriaRendersMuebles",
  "technicalName": "GaleriaRendersMuebles",
  "type": "component",
  "niches": [
    "carpentry"
  ],
  "targetPath": "src/components/common/GaleriaRendersMuebles.jsx",
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

# Galería de Renders y Muebles

Visor interactivo comparativo tipo cortina deslizable (Before/After) para confrontar renders en 3D de diseño con fotos reales del mueble instalado.

## Especificaciones Visuales
- HSL variables y tema marca blanca.
- Sin selectores nativos.
- Calendario integrado HSL.

## 3. Código React
```jsx
import React, { useState } from 'react';
import { Layers } from 'lucide-react';

export default function GaleriaRendersMuebles() {
  const [sliderPos, setSliderPos] = useState(50); // 0 a 100%

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Comparador CAD vs Instalación</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Desliza la barra para contrastar el Render 3D con la foto real</p>
          </div>
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>

        {/* Visual comparison container */}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-3)] select-none">
          {/* Foto Real (Base / Fondo) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-center p-6 bg-[var(--color-surface-2)]">
            <div className="flex flex-col items-center gap-1.5 text-xs text-[var(--color-text)]">
              <span className="font-extrabold text-sm text-indigo-400 uppercase tracking-widest bg-[var(--color-surface-3)]/60 px-3 py-1 rounded-full border border-indigo-500/20">Foto Real</span>
              <span className="text-[var(--color-text-muted)]">Vista del Mueble Instalado y Terminado</span>
              <div className="w-32 h-20 bg-[var(--color-surface-3)]/40 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center text-[10px] italic text-[var(--color-text-muted)] mt-2">
                [Foto del Mueble Fisico]
              </div>
            </div>
          </div>

          {/* Render 3D (Capa recortada superior) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden bg-[var(--color-surface-2)]"
            style={{ width: sliderPos + '%' }}
          >
            <div className="absolute inset-0 w-full h-full flex items-center justify-center text-center p-6 bg-[var(--color-surface-3)]" style={{ width: '494px' }}>
              <div className="flex flex-col items-center gap-1.5 text-xs text-[var(--color-text)]">
                <span className="font-extrabold text-sm text-amber-400 uppercase tracking-widest bg-[var(--color-surface-2)]/60 px-3 py-1 rounded-full border border-amber-500/20">Render 3D</span>
                <span className="text-[var(--color-text-muted)]">Diseño Digital Fotorrealista CAD</span>
                <div className="w-32 h-20 bg-[var(--color-surface-2)]/40 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center text-[10px] italic text-[var(--color-text-muted)] mt-2">
                  [Render 3D Computarizado]
                </div>
              </div>
            </div>
          </div>

          {/* Separador físico deslizable */}
          <div
            className="absolute inset-y-0 w-0.5 bg-indigo-400 pointer-events-none"
            style={{ left: sliderPos + '%' }}
          />
        </div>

        {/* Input slider control */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
            <span>Diseño Render (Izquierda)</span>
            <span>Instalación Real (Derecha)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseInt(e.target.value))}
            className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </>
  );
}
```
