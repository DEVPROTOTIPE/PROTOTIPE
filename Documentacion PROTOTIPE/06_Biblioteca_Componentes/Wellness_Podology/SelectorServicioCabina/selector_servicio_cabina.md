<!--
{
  "resource": "SelectorServicioCabina",
  "technicalName": "SelectorServicioCabina",
  "targetPath": "src/components/common/SelectorServicioCabina.jsx",
  "type": "component",
  "niches": ["wellness_podology"],
  "dependencies": {
    "npm": {
      "lucide-react": "^0.344.0"
    },
    "internal": [
      { "name": "CustomSelect", "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Selector_Desplegable/custom_select.md" }
    ]
  }
}
-->

# Selector de Servicio y Cabina (`SelectorServicioCabina`)

Componente visual e interactivo diseñado para la gestión y asignación inteligente de cabinas de tratamiento en centros de estética, podología o spas, validando de forma reactiva el equipamiento disponible por cabina y el terapeuta a cargo.

## 1. Propósito y Casos de Uso
- **Recepción y Reservas:** Asignar cabinas adecuadas según los requerimientos del tratamiento (ej: cabinas con sillón podológico vs camilla de masajes).
- **Control de Estado:** Visualizar instantáneamente qué cabinas están ocupadas, disponibles o en desinfección/limpieza.

## 2. Especificación Visual y Estilos
- **Cabina Cards:** Contenedores HSL con bordes adaptativos y badges de estado brillantes.
- **Filtros de Equipamiento:** Iconos que representan el equipamiento (Autoclave, Camilla Ergonómica, Luz de Lupa, Tina de Hidromasaje).
- **Legibilidad:** Clase `!text-white` para textos blancos sobre fondos cromáticos primarios.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { Box, Home, ShieldAlert, Sparkles, User, Clock, ToggleLeft, Layers } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const CABINAS_PREDEFINIDAS = [
  { id: 'cab-1', nombre: 'Cabina Aura', estado: 'disponible', equipamiento: ['sillón podológico', 'luz lupa', 'autoclave'], color: 'border-emerald-500/30' },
  { id: 'cab-2', nombre: 'Cabina Zen', estado: 'disponible', equipamiento: ['camilla masajes', 'difusor aromas', 'cromoterapia'], color: 'border-emerald-500/30' },
  { id: 'cab-3', nombre: 'Cabina Vital', estado: 'ocupada', equipamiento: ['sillón podológico', 'luz lupa', 'tina hidromasaje'], color: 'border-red-500/30', ocupante: 'Juan Pérez', terapeuta: 'Dr. Cárdenas' },
  { id: 'cab-4', nombre: 'Cabina Manta', estado: 'mantenimiento', equipamiento: ['camilla masajes', 'termo piedras'], color: 'border-amber-500/30' }
];

const TRATAMIENTOS = [
  { id: 't-podologia', label: 'Podología Clínica (Quiropodia)', requiere: 'sillón podológico', duracion: '45 min', precio: '$65,000' },
  { id: 't-masaje', label: 'Masaje Relajante de Espalda', requiere: 'camilla masajes', duracion: '60 min', precio: '$80,000' },
  { id: 't-reflexologia', label: 'Reflexología Podal con Aromas', requiere: 'difusor aromas', duracion: '50 min', precio: '$55,000' }
];

const TERAPEUTAS = [
  { value: 'ter-1', label: 'Dra. Liliana Gómez (Podóloga)' },
  { value: 'ter-2', label: 'Sr. Andrés Mendoza (Masoterapeuta)' },
  { value: 'ter-3', label: 'Dra. Claudia Ortiz (Reflexóloga)' }
];

export default function SelectorServicioCabina({ onAssign, onStateChange }) {
  const [selectedTratamientoId, setSelectedTratamientoId] = useState('t-podologia');
  const [selectedCabinaId, setSelectedCabinaId] = useState(null);
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('ter-1');
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [cabinas, setCabinas] = useState(CABINAS_PREDEFINIDAS);
  const [mensajeExito, setMensajeExito] = useState('');

  const activeTratamiento = TRATAMIENTOS.find(t => t.id === selectedTratamientoId);
  const selectedCabina = cabinas.find(c => c.id === selectedCabinaId);

  // Verificar si la cabina tiene el equipamiento requerido
  const esCompatible = (cabina) => {
    if (!activeTratamiento) return true;
    return cabina.equipamiento.includes(activeTratamiento.requiere);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedCabinaId || !pacienteNombre || !selectedTerapeuta) {
      alert('Por favor complete todos los datos de asignación.');
      return;
    }

    if (selectedCabina.estado !== 'disponible') {
      alert('La cabina seleccionada no está disponible.');
      return;
    }

    const terapeutaLabel = TERAPEUTAS.find(t => t.value === selectedTerapeuta)?.label || '';

    // Asignar en caliente
    const updatedCabinas = cabinas.map(c => {
      if (c.id === selectedCabinaId) {
        return {
          ...c,
          estado: 'ocupada',
          ocupante: pacienteNombre,
          terapeuta: terapeutaLabel
        };
      }
      return c;
    });

    setCabinas(updatedCabinas);
    setMensajeExito(`¡Asignación exitosa! ${selectedCabina.nombre} ocupada por ${pacienteNombre}.`);
    
    if (onAssign) {
      onAssign({
        cabinaId: selectedCabinaId,
        tratamiento: activeTratamiento,
        terapeuta: terapeutaLabel,
        paciente: pacienteNombre
      });
    }

    // Resetear form
    setPacienteNombre('');
    setSelectedCabinaId(null);
    setTimeout(() => setMensajeExito(''), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
      
      {/* Sección 1: Selección de Tratamiento */}
      <div>
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block mb-2.5">1. Seleccionar Tratamiento</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRATAMIENTOS.map(tr => (
            <button
              key={tr.id}
              type="button"
              onClick={() => {
                setSelectedTratamientoId(tr.id);
                setSelectedCabinaId(null); // Reset cabina al cambiar tratamiento
              }}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                selectedTratamientoId === tr.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-[var(--color-text)]">{tr.label}</span>
              </div>
              <div className="flex gap-2 items-center text-[10px] text-[var(--color-text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{tr.duracion} • <strong className="text-[var(--color-primary)]">{tr.precio}</strong></span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)] self-start font-semibold">
                Requiere: {tr.requiere}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sección 2: Cabinas Disponibles y Validación */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
            2. Cabinas de Tratamiento (Filtro por requerimiento)
          </span>
          {activeTratamiento && (
            <span className="text-[10px] font-bold text-[var(--color-primary)]">
              Mostrando cabinas con: {activeTratamiento.requiere}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {cabinas.map(cab => {
            const compatible = esCompatible(cab);
            const isSelected = selectedCabinaId === cab.id;
            
            let badgeColor = 'bg-emerald-500/10 text-emerald-500';
            if (cab.estado === 'ocupada') badgeColor = 'bg-red-500/10 text-red-500';
            if (cab.estado === 'mantenimiento') badgeColor = 'bg-amber-500/10 text-amber-500';

            return (
              <button
                key={cab.id}
                type="button"
                onClick={() => compatible && cab.estado === 'disponible' && setSelectedCabinaId(cab.id)}
                disabled={!compatible || cab.estado !== 'disponible'}
                className={`p-4 rounded-xl border text-left flex flex-col gap-3 transition-all relative ${
                  isSelected 
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] ring-2 ring-[var(--color-primary-light)]' 
                    : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                } ${(!compatible || cab.estado !== 'disponible') ? 'opacity-40 cursor-not-allowed bg-[var(--color-surface-2)]/20' : 'cursor-pointer'}`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-xs font-bold text-[var(--color-text)]">{cab.nombre}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColor}`}>
                    {cab.estado}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cab.equipamiento.map((eq, i) => (
                    <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                      {eq}
                    </span>
                  ))}
                </div>

                {cab.estado === 'ocupada' && (
                  <div className="text-[9px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2 mt-1">
                    <p className="truncate">👤 {cab.ocupante}</p>
                    <p className="truncate">🩺 {cab.terapeuta}</p>
                  </div>
                )}

                {!compatible && (
                  <span className="text-[8px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded mt-2 self-start flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Incompatible
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección 3: Asignación y Formulario */}
      {selectedCabinaId && (
        <form onSubmit={handleAssign} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fadeIn">
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Nombre del Paciente</label>
            <input
              type="text"
              value={pacienteNombre}
              onChange={(e) => setPacienteNombre(e.target.value)}
              placeholder="Ej. Carlos Restrepo"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Profesional Asignado</label>
            <CustomSelect
              options={TERAPEUTAS}
              value={selectedTerapeuta}
              onChange={setSelectedTerapeuta}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] !text-[var(--color-text)] text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
          >
            Asignar Cabina
          </button>
        </form>
      )}

      {/* Mensajes de feedback */}
      {mensajeExito && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
          <span>{mensajeExito}</span>
        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`selectedTratamientoId`:** Determina qué tratamiento se desea asignar y cuáles son los requerimientos técnicos de equipamiento a validar.
- **`selectedCabinaId`:** La cabina disponible y compatible elegida por el operador.
- **`cabinas`:** Estado local que emula la persistencia física de la ocupación, reflejando en tiempo real las asignaciones recién creadas.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Operador as Operador de Recepción
  participant Selector as Selector Cabinas Component
  participant Validador as Lógica de Compatibilidad

  Operador->{bracket}Selector: Selecciona "Podología Clínica"
  Note over Selector: Requiere "sillón podológico"
  Selector->{bracket}Validador: Evalúa equipamiento de las 4 cabinas
  Validador--{bracket}Selector: Cabina Aura (Compatible), Cabina Zen (Incompatible - Deshabilitada)
  Operador->{bracket}Selector: Selecciona Cabina Aura (Disponible)
  Note over Selector: Abre formulario de asignación
  Operador->{bracket}Selector: Escribe nombre "Carlos" y selecciona terapeuta
  Operador->{bracket}Selector: Clic en "Asignar Cabina"
  Selector->{bracket}Selector: Marca Cabina Aura como Ocupada
  Selector--{bracket}Operador: Muestra Banner de Éxito
```
