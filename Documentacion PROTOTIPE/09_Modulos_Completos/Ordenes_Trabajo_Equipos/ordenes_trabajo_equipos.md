<!--
{
  "technicalName": "OT",
  "targetPath": "src/components/modules/OT.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Módulo de Órdenes de Trabajo (OT) y Equipos

## 1. Propósito y Casos de Uso
Permite a talleres mecánicos, contratistas, tornerías, y centros de mantenimiento registrar la recepción de maquinaria, vehículos o equipos electrónicos. Gestiona su ficha técnica, desglose de costos (mano de obra + repuestos), estados de avance en taller y firma de aprobación digital.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
El módulo ofrece un panel tipo stepper con:
- Columnas de desglose de costos.
- Un Canvas HTML5 interactivo y responsive para la firma física táctil o con ratón del cliente.
- Chip de estados con colores variables HSL.

---

## 3. Código React Completo y Funcional
A continuación, se detalla el componente principal `WorkOrderManager.jsx`:

```jsx
import React, { useState, useRef } from 'react';
import { PenTool, CheckCircle, AlertTriangle, FileText, Trash } from 'lucide-react';

export default function WorkOrderManager({ onSave }) {
  const [equipment, setEquipment] = useState({ brand: '', model: '', serial: '', description: '' });
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState(0);
  const [partInput, setPartInput] = useState({ name: '', price: '' });
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Funciones simples para dibujar la firma en Canvas HTML5
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addPart = () => {
    if (!partInput.name || !partInput.price) return;
    setParts(prev => [...prev, { name: partInput.name, price: parseFloat(partInput.price) }]);
    setPartInput({ name: '', price: '' });
  };

  const totalParts = parts.reduce((acc, p) => acc + p.price, 0);
  const grandTotal = totalParts + parseFloat(labor || 0);

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4 max-w-lg mx-auto text-slate-200">
      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Ficha de Recepción de Equipo</h3>

      {/* Datos del equipo */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <input
          type="text"
          placeholder="Marca..."
          value={equipment.brand}
          onChange={e => setEquipment(prev => ({ ...prev, brand: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Modelo..."
          value={equipment.model}
          onChange={e => setEquipment(prev => ({ ...prev, model: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Serial..."
          value={equipment.serial}
          onChange={e => setEquipment(prev => ({ ...prev, serial: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-slate-200 col-span-2 focus:outline-none"
        />
        <textarea
          placeholder="Descripción del fallo o servicio..."
          value={equipment.description}
          onChange={e => setEquipment(prev => ({ ...prev, description: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-slate-200 col-span-2 focus:outline-none h-16 resize-none"
        />
      </div>

      {/* Repuestos */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase text-indigo-400">Repuestos e Insumos</h4>
        <div className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Repuesto..."
            value={partInput.name}
            onChange={e => setPartInput(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Precio..."
            value={partInput.price}
            onChange={e => setPartInput(prev => ({ ...prev, price: e.target.value }))}
            className="w-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 focus:outline-none"
          />
          <button onClick={addPart} className="px-3 bg-indigo-600 rounded-xl font-bold cursor-pointer hover:bg-indigo-500">+</button>
        </div>

        {parts.length > 0 && (
          <div className="space-y-1 bg-[var(--color-surface)]/40 p-2 border border-[var(--color-border)] rounded-xl">
            {parts.map((part, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px]">
                <span>{part.name}</span>
                <span className="font-mono">${part.price.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mano de Obra */}
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-black uppercase text-indigo-400">Costo Mano de Obra:</label>
        <input
          type="number"
          placeholder="Mano de obra..."
          value={labor}
          onChange={e => setLabor(e.target.value)}
          className="w-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-right font-mono text-xs focus:outline-none"
        />
      </div>

      {/* Canvas para firma */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-indigo-400">Firma del Cliente (Conformidad)</span>
          <button onClick={clearCanvas} className="text-[8px] font-bold text-rose-400 cursor-pointer">Limpiar</button>
        </div>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl cursor-crosshair h-24"
        />
      </div>

      {/* Totales y Envío */}
      <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
        <div className="flex justify-between text-xs font-black">
          <span>Total Orden:</span>
          <span className="font-mono text-indigo-400">${grandTotal.toLocaleString('es-CO')}</span>
        </div>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            const signature = canvas ? canvas.toDataURL() : '';
            onSave?.({ equipment, parts, labor: parseFloat(labor || 0), signature, total: grandTotal });
            alert('Orden de Trabajo Guardada.');
          }}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md text-center"
        >
          Crear Orden de Trabajo
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Lógica de Estado
Gestiona el expediente técnico mediante inputs reactivos locales, la firma física en Canvas convertida a Base64 (`toDataURL`) y la suma aritmética de repuestos y mano de obra.
