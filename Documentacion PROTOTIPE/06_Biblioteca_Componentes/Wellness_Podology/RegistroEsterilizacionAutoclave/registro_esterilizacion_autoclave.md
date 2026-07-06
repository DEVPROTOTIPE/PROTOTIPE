<!--
{
  "resource": "RegistroEsterilizacionAutoclave",
  "technicalName": "RegistroEsterilizacionAutoclave",
  "targetPath": "src/components/common/RegistroEsterilizacionAutoclave.jsx",
  "type": "component",
  "niches": ["wellness_podology"],
  "dependencies": {
    "npm": {
      "lucide-react": "^0.344.0"
    },
    "internal": []
  }
}
-->

# Registro de Esterilización en Autoclave (`RegistroEsterilizacionAutoclave`)

Módulo médico e higiénico interactivo diseñado para registrar y auditar los lotes de instrumental esterilizado en autoclave, graficando las curvas de temperatura, presión y tiempo del ciclo físico para garantizar la seguridad clínica del paciente.

## 1. Propósito y Casos de Uso
- **Cumplimiento Higiénico-Sanitario:** Registro obligatorio de trazabilidad del instrumental utilizado en quiropodia o tratamientos invasivos.
- **Auditoría de Infecciones:** Vincular el ID del lote esterilizado directamente al historial de citas del paciente para control de bioseguridad.

## 2. Especificación Visual y Estilos
- **Gráfico Paramétrico SVG:** Representación de curvas de temperatura (rojo) y presión (azul) con áreas sombreadas y marcadores interactivos.
- **Log Table:** Tabla de registros con badges dinámicos de estado (Aprobado, En Proceso, Fallido).
- **Legibilidad Light/Dark:** Variables HSL que garantizan legibilidad óptima y contraste en modo claro.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, RefreshCw, Thermometer, Activity, Trash2 } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

const LOTES_INICIALES = [
  { id: 'LOT-20260701-A', fecha: '2026-07-01', operadora: 'Dra. Gómez', autoclaveId: 'AUTO-01', temperatura: '134°C', presion: '2.1 bar', tiempo: '15 min', estado: 'aprobado' },
  { id: 'LOT-20260702-B', fecha: '2026-07-02', operadora: 'Dra. Ortiz', autoclaveId: 'AUTO-02', temperatura: '121°C', presion: '1.1 bar', tiempo: '30 min', estado: 'aprobado' },
  { id: 'LOT-20260702-C', fecha: '2026-07-02', operadora: 'Sr. Mendoza', autoclaveId: 'AUTO-01', temperatura: '115°C', presion: '0.9 bar', tiempo: '8 min', estado: 'fallido' }
];

export default function RegistroEsterilizacionAutoclave({ onAddLote, initialLotes }) {
  const { alertConfirm } = useAlertConfirm();
  const [lotes, setLotes] = useState(initialLotes || LOTES_INICIALES);
  
  // Estado para el formulario de nuevo lote
  const [nuevoLoteId, setNuevoLoteId] = useState(`LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
  const [temperatura, setTemperatura] = useState('134°C');
  const [presion, setPresion] = useState('2.1 bar');
  const [tiempo, setTiempo] = useState('15 min');
  const [autoclaveId, setAutoclaveId] = useState('AUTO-01');
  const [operadora, setOperadora] = useState('Dra. Gómez');
  
  // Gráfico de simulación del ciclo actual
  const curvePointsTemp = "10,90 40,90 80,30 150,30 190,90 230,90";
  const curvePointsPres = "10,90 40,90 80,45 150,45 190,90 230,90";

  const handleCreateLote = (e) => {
    e.preventDefault();
    
    // Validar aprobación basada en parámetros clínicos ideales:
    // Ideal 1: 134°C, 2.1 bar, >=15 min
    // Ideal 2: 121°C, 1.1 bar, >=30 min
    const tempNum = parseInt(temperatura);
    const presNum = parseFloat(presion);
    const timeNum = parseInt(tiempo);
    
    let estado = 'fallido';
    if ((tempNum >= 134 && presNum >= 2.0 && timeNum >= 15) || 
        (tempNum >= 121 && presNum >= 1.0 && timeNum >= 30)) {
      estado = 'aprobado';
    }

    const nuevoLote = {
      id: nuevoLoteId,
      fecha: new Date().toISOString().slice(0, 10),
      operadora,
      autoclaveId,
      temperatura,
      presion,
      tiempo: `${timeNum} min`,
      estado
    };

    const updated = [nuevoLote, ...lotes];
    setLotes(updated);
    if (onAddLote) onAddLote(nuevoLote);

    // Resetear ID del lote
    setNuevoLoteId(`LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
  };

  const handleDeleteLote = async (id) => {
    const confirm = await alertConfirm({
      title: '¿Eliminar Lote de Esterilización?',
      message: `Está por purgar el registro del lote ${id}. Esta acción no se puede revertir.`,
      variant: 'error'
    });

    if (confirm) {
      setLotes(lotes.filter(l => l.id !== id));
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
      
      {/* Sección Superior: Formulario y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Formulario de Registro */}
        <form onSubmit={handleCreateLote} className="lg:col-span-5 flex flex-col gap-3.5 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <div>
            <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Nuevo Registro de Ciclo</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Introduzca las lecturas físicas del autoclave</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">ID de Autoclave</label>
              <select
                value={autoclaveId}
                onChange={(e) => setAutoclaveId(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              >
                <option value="AUTO-01">Autoclave 01 (Premium)</option>
                <option value="AUTO-02">Autoclave 02 (Reserva)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Operadora</label>
              <select
                value={operadora}
                onChange={(e) => setOperadora(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              >
                <option value="Dra. Gómez">Dra. Gómez</option>
                <option value="Dra. Ortiz">Dra. Ortiz</option>
                <option value="Sr. Mendoza">Sr. Mendoza</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Temperatura</label>
              <select
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
                className="w-full px-1.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              >
                <option value="134°C">134°C</option>
                <option value="121°C">121°C</option>
                <option value="115°C">115°C</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Presión</label>
              <select
                value={presion}
                onChange={(e) => setPresion(e.target.value)}
                className="w-full px-1.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              >
                <option value="2.1 bar">2.1 bar</option>
                <option value="1.1 bar">1.1 bar</option>
                <option value="0.9 bar">0.9 bar</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Tiempo (min)</label>
              <input
                type="number"
                value={parseInt(tiempo)}
                onChange={(e) => setTiempo(`${e.target.value} min`)}
                min="1"
                max="60"
                className="w-full px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] !text-[var(--color-text)] text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Guardar Lote de Seguridad
          </button>
        </form>

        {/* Gráfico de Trazabilidad en Autoclave */}
        <div className="lg:col-span-7 flex flex-col gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Monitoreo de Fase Autoclave</h3>
              <p className="text-[9px] text-[var(--color-text-muted)]">Curvas de parámetros críticos (Fase meseta de esterilización)</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Temp (°C)
              </span>
              <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Presión (bar)
              </span>
            </div>
          </div>

          {/* Curva SVG */}
          <div className="w-full bg-[var(--color-bg)]/30 rounded-lg p-2 border border-[var(--color-border)] flex items-center justify-center">
            <svg className="w-full max-h-[140px]" viewBox="0 0 240 100">
              <grid className="stroke-[var(--color-border)]/40 stroke-dasharray-2" />
              {/* Eje de guías */}
              <line x1="10" y1="90" x2="230" y2="90" stroke="var(--color-border)" strokeWidth="1" />
              <line x1="10" y1="10" x2="10" y2="90" stroke="var(--color-border)" strokeWidth="1" />
              
              {/* Curva Temperatura (Red) */}
              <polyline fill="none" stroke="#ef4444" strokeWidth="2.5" points={curvePointsTemp} />
              
              {/* Curva Presión (Blue) */}
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3" points={curvePointsPres} />

              {/* Textos y Referencias */}
              <text x="75" y="20" fill="var(--color-text)" fontSize="8" fontWeight="bold">Fase Meseta (134°C / 2.1 bar)</text>
              <text x="15" y="98" fill="var(--color-text-muted)" fontSize="7">Prevacío</text>
              <text x="100" y="98" fill="var(--color-text-muted)" fontSize="7">Exposición</text>
              <text x="195" y="98" fill="var(--color-text-muted)" fontSize="7">Secado</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Listado / Tabla de Lotes */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Historial de Esterilización Semanal</span>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/20">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[10px] font-black uppercase text-[var(--color-text-muted)]">
                <th className="p-3">ID Lote</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Autoclave</th>
                <th className="p-3">Parámetros</th>
                <th className="p-3">Operadora</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {lotes.map(l => (
                <tr key={l.id} className="hover:bg-[var(--color-surface-2)]/30 transition-all">
                  <td className="p-3 font-mono font-bold text-[11px] text-[var(--color-primary)]">{l.id}</td>
                  <td className="p-3 text-[var(--color-text-muted)]">{l.fecha}</td>
                  <td className="p-3">{l.autoclaveId}</td>
                  <td className="p-3">
                    <span className="font-semibold">{l.temperatura}</span> • {l.presion} • {l.tiempo}
                  </td>
                  <td className="p-3 text-[var(--color-text-muted)]">{l.operadora}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        l.estado === 'aprobado'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {l.estado}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteLote(l.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                      title="Eliminar Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`lotes`:** Estado del array que mantiene el listado histórico de esterilizaciones.
- **`nuevoLoteId`:** Genera y regenera cadenas de códigos de barras / lotes únicos aleatorios basados en la fecha del sistema.
- **Validación Automática:** Compara lecturas ingresadas contra los estándares mínimos (134°C/2.1bar o 121°C/1.1bar) para aprobar/denegar automáticamente el lote.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Operadora as Asistente Podología
  participant Comp as Autoclave Register
  participant Conf as useAlertConfirm Modal

  Operadora->{bracket}Comp: Introduce lecturas del Autoclave (134°C, 2.1 bar, 15 min)
  Comp->{bracket}Comp: Evalúa las lecturas contra el perfil óptimo de temperatura y presión
  Comp->{bracket}Comp: Clasifica lote como "APROBADO" y lo inserta al historial
  Operadora->{bracket}Comp: Clic en borrar lote "LOT-20260701-A"
  Comp->{bracket}Conf: Solicita confirmación de eliminación permanente
  Conf--{bracket}Comp: Retorna respuesta afirmativa
  Comp->{bracket}Comp: Puga el lote de la tabla
```
