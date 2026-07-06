<!--
{
  "resource": "CalculadoraPesoMateriales",
  "technicalName": "CalculadoraPesoMateriales",
  "targetPath": "src/components/common/CalculadoraPesoMateriales.jsx",
  "dependencies": {
    "npm": {
      "lucide-react": "^0.300.0"
    },
    "internal": [
      {
        "name": "CustomSelect",
        "path": "src/components/ui/CustomSelect.jsx"
      }
    ]
  },
  "niches": ["technical_services"],
  "type": "component"
}
-->

# Calculadora de Peso de Materiales (`CalculadoraPesoMateriales`)

Este componente calcula el peso teórico estimado de piezas y barras metálicas en base a su geometría (barra redonda, chapa plana, tubo hueco) y densidad del material.

## 1. Propósito y Casos de Uso
* **Estimaciones de Despacho:** Permite calcular el peso físico de un pedido de metal para cotizar fletes o envíos.
* **Cálculo de Compra:** Estima cuántos kilogramos de acero o aluminio se deben comprar para fabricar el lote de planos.

## 2. Especificación Visual y Estilos (Tailwind CSS)
* **Toggles Geométricos:** Fila horizontal de botones de geometría con efectos hover y activos mediante color HSL (`border-[var(--color-primary)]`).
* **Campos HSL:** Inputs de dimensiones responsivos y formateados para evitar desajustes visuales.
* **Uso de CustomSelect:** Exclusión total de selectores nativos `<select>`.

## 3. Código React Completo

```jsx
import React, { useState, useMemo } from 'react';
import { Layers, CircleDot, Database, Calculator } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';

export default function CalculadoraPesoMateriales({
  onCalculate = null,
  materialOptions = [
    { value: 'steel', label: 'Acero al Carbono (7.85 g/cm³)', density: 7.85 },
    { value: 'stainless', label: 'Acero Inoxidable (7.93 g/cm³)', density: 7.93 },
    { value: 'aluminum', label: 'Aluminio (2.70 g/cm³)', density: 2.70 },
    { value: 'brass', label: 'Bronce / Latón (8.50 g/cm³)', density: 8.50 },
    { value: 'copper', label: 'Cobre (8.96 g/cm³)', density: 8.96 }
  ]
}) {
  const [profile, setProfile] = useState('round_bar'); // 'round_bar', 'sheet', 'tube'
  const [material, setMaterial] = useState(materialOptions[0].value);
  const [dim1, setDim1] = useState(50); // Diámetro o Ancho (mm)
  const [dim2, setDim2] = useState(1000); // Longitud (mm)
  const [dim3, setDim3] = useState(5); // Espesor o Alto (mm)

  const activeMaterial = useMemo(() => {
    return materialOptions.find(m => m.value === material) || materialOptions[0];
  }, [material, materialOptions]);

  const weightCalculation = useMemo(() => {
    let volumeCm3 = 0;
    
    const d1Cm = dim1 / 10;
    const d2Cm = dim2 / 10;
    const d3Cm = dim3 / 10;

    if (profile === 'round_bar') {
      const radiusCm = d1Cm / 2;
      volumeCm3 = Math.PI * Math.pow(radiusCm, 2) * d2Cm;
    } else if (profile === 'sheet') {
      volumeCm3 = d1Cm * d2Cm * d3Cm;
    } else if (profile === 'tube') {
      // d1 es diámetro exterior, d3 es espesor de pared
      const outerRadius = d1Cm / 2;
      const innerRadius = (dim1 - (dim3 * 2)) / 20;
      if (innerRadius > 0) {
        const outerVol = Math.PI * Math.pow(outerRadius, 2) * d2Cm;
        const innerVol = Math.PI * Math.pow(innerRadius, 2) * d2Cm;
        volumeCm3 = outerVol - innerVol;
      }
    }

    const totalWeightKg = (volumeCm3 * activeMaterial.density) / 1000;
    const finalWeight = totalWeightKg > 0 ? totalWeightKg : 0;

    return {
      weight: finalWeight.toFixed(3),
      volume: volumeCm3.toFixed(1)
    };
  }, [profile, material, dim1, dim2, dim3, activeMaterial]);

  const handleTriggerCalculate = () => {
    if (onCalculate) {
      onCalculate(parseFloat(weightCalculation.weight));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Calculator size={16} className="text-[var(--color-primary)]" />
        <span>Calculadora de Peso Teórico</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Estima el peso físico de perfiles y barras metálicas de acuerdo a su geometría.
      </p>

      <div className="space-y-4">
        {/* Toggles de Perfil */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Perfil Geométrico</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProfile('round_bar')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                profile === 'round_bar'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-black'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/50'
              }`}
            >
              <CircleDot size={14} />
              Barra Redonda
            </button>
            <button
              type="button"
              onClick={() => setProfile('sheet')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                profile === 'sheet'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-black'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/50'
              }`}
            >
              <Layers size={14} />
              Placa / Chapa
            </button>
            <button
              type="button"
              onClick={() => setProfile('tube')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                profile === 'tube'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-black'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/50'
              }`}
            >
              <CircleDot size={14} />
              Tubo Redondo
            </button>
          </div>
        </div>

        {/* Selector de Material */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Aleación / Metal</label>
          <CustomSelect
            value={material}
            onChange={setMaterial}
            options={materialOptions}
          />
        </div>

        {/* Inputs de Medidas */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">
              {profile === 'sheet' ? 'Ancho (mm)' : 'Diámetro Ext. (mm)'}
            </label>
            <input
              type="number"
              value={dim1}
              onChange={(e) => setDim1(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Longitud (mm)</label>
            <input
              type="number"
              value={dim2}
              onChange={(e) => setDim2(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          {profile !== 'round_bar' ? (
            <div>
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">
                {profile === 'sheet' ? 'Espesor (mm)' : 'Espesor Pared (mm)'}
              </label>
              <input
                type="number"
                value={dim3}
                onChange={(e) => setDim3(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              />
            </div>
          ) : (
            <div className="opacity-40 select-none">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Espesor (mm)</label>
              <div className="w-full h-9 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] rounded-xl flex items-center justify-center text-[10px] text-[var(--color-text-muted)] font-mono">
                N/A
              </div>
            </div>
          )}
        </div>

        {/* Desglose Final */}
        <div className="mt-4 p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[var(--color-text-muted)]">Volumen Teórico:</span>
            <span className="font-mono text-[var(--color-text)] font-semibold">{weightCalculation.volume} cm³</span>
          </div>
          <div className="flex justify-between items-center font-bold border-t border-[var(--color-border)] pt-2 text-xs">
            <span className="text-[var(--color-text)]">Peso Teórico Estimado:</span>
            <span className="font-mono text-[var(--color-primary)] text-sm">{weightCalculation.weight} kg</span>
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="button"
          onClick={handleTriggerCalculate}
          className="w-full h-11 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-[var(--color-text)] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Database size={14} />
          <span>Registrar Peso de Envío</span>
        </button>
      </div>
    </div>
  );
}
```',Description:
