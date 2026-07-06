<!--
{
  "resource": "ProgramadorRutasDomicilio",
  "technicalName": "ProgramadorRutasDomicilio",
  "targetPath": "src/components/common/ProgramadorRutasDomicilio.jsx",
  "type": "component",
  "niches": ["laundry"],
  "dependencies": { "npm": {}, "internal": [] }
}
-->

# Programador de Rutas a Domicilio

## 1. Propósito y Casos de Uso
Formulario para agendar la recolección y entrega de prendas a domicilio. El cliente selecciona el día de la semana y la franja horaria preferida, sin usar pickers nativos del navegador.

**Casos de uso:** App de lavandería con servicio a domicilio, formulario de pedido web, panel de administración de rutas.

## 2. Especificación Visual
- Inputs de texto para nombre, dirección y teléfono
- Chips de días de la semana (Lun–Dom) — selección única
- Cards de franjas horarias — selección única
- Botón de confirmación con validación de campos obligatorios
- Estado de éxito con resumen de la reserva

## 3. Código React Completo

```jsx
import React, { useState } from 'react';

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HORARIOS = ['7:00–9:00 AM','10:00–12:00 M','2:00–4:00 PM','5:00–7:00 PM'];

export default function ProgramadorRutasDomicilio({ onSubmit }) {
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', dia: '', horario: '' });
  const [enviado, setEnviado] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valido = form.nombre && form.direccion && form.dia && form.horario;

  const handleSubmit = () => {
    if (!valido) return;
    onSubmit?.(form);
    setEnviado(true);
  };

  if (enviado) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="text-4xl">✅</span>
      <p className="text-sm font-black">¡Ruta agendada!</p>
      <p className="text-xs text-[var(--color-text-muted)]">{form.nombre} · {form.dia} · {form.horario}</p>
      <button onClick={() => { setForm({ nombre:'',direccion:'',telefono:'',dia:'',horario:'' }); setEnviado(false); }}
        className="mt-2 text-xs font-bold text-[var(--color-primary)] cursor-pointer hover:underline">
        Nueva ruta
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {['nombre','direccion','telefono'].map(k => (
        <div key={k} className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] capitalize">{k}</label>
          <input value={form[k]} onChange={e => set(k, e.target.value)}
            placeholder={k === 'nombre' ? 'Tu nombre' : k === 'direccion' ? 'Dirección de recolección' : 'Teléfono'}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50" />
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">Día</label>
        <div className="flex flex-wrap gap-1.5">
          {DIAS.map(d => (
            <button key={d} onClick={() => set('dia', d)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${form.dia===d ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">Franja horaria</label>
        <div className="flex flex-col gap-1.5">
          {HORARIOS.map(h => (
            <button key={h} onClick={() => set('horario', h)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${form.horario===h ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
              {h}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!valido}
        className="w-full py-2.5 rounded-xl text-xs font-black bg-[var(--color-primary)] text-[var(--color-text)] disabled:opacity-40 cursor-pointer hover:opacity-90 transition-opacity">
        Confirmar ruta a domicilio
      </button>
    </div>
  );
}
```

## 4. Lógica de Estado
- `form`: objeto con todos los campos del formulario
- `enviado`: boolean para el estado de confirmación

## 5. Flujo Operativo
```
Completar datos → Seleccionar día → Seleccionar franja → Confirmar → Estado de éxito
```
