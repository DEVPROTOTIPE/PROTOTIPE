<!--
{
  "resource": "ProgramadorSesionesPaquete",
  "technicalName": "ProgramadorSesionesPaquete",
  "targetPath": "src/components/common/ProgramadorSesionesPaquete.jsx",
  "type": "component",
  "niches": ["wellness_podology"],
  "dependencies": {
    "npm": {
      "lucide-react": "^0.344.0"
    },
    "internal": [
      { "name": "DatePickerPremium", "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md" }
    ]
  }
}
-->

# Programador de Sesiones en Paquete (`ProgramadorSesionesPaquete`)

Componente interactivo diseñado para reservar en lote las múltiples citas/sesiones incluidas dentro de un paquete promocional o plan de tratamiento recurrente (ej: plan de 5 sesiones de podología/reflexología), evitando pickers nativos.

## 1. Propósito y Casos de Uso
- **Planes de Cuidado Continuo:** Pacientes con pie de atleta, pie diabético u hongos recurrentes que contratan tratamientos prolongados de varias semanas.
- **Venta de Paquetes Corporativos o Spas:** Reservar masajes corporativos programados de forma adelantada para optimizar la agenda del staff.

## 2. Especificación Visual y Estilos
- **Session Booking Timeline:** Línea temporal interactiva con hitos (`z-index` controlado) que asocian cada sesión a su fecha y estado de agendamiento.
- **Visual Queue:** Grid de tarjetas pequeñas que representan las sesiones pendientes, agendadas y completadas con colores HSL diferenciados.
- **Anti-Clipping:** Contenedor de scroll con `px-4` y `py-4` para que las escalas hover de las tarjetas no se corten.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Trash2, Plus, Sparkles } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import DatePickerPremium from '../../ui/DatePickerPremium';

const PAQUETE_DEFAULT = {
  nombre: 'Tratamiento Integral de Quiropodia',
  sesionesTotales: 5,
  especialista: 'Dra. Gómez',
  sesiones: [
    { num: 1, fecha: '2026-07-05', hora: '09:00', estado: 'agendada' },
    { num: 2, fecha: '2026-07-12', hora: '10:00', estado: 'agendada' },
    { num: 3, fecha: '', hora: '', estado: 'pendiente' },
    { num: 4, fecha: '', hora: '', estado: 'pendiente' },
    { num: 5, fecha: '', hora: '', estado: 'pendiente' }
  ]
};

const HORAS_DISPONIBLES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function ProgramadorSesionesPaquete({ onSave, initialPaquete }) {
  const { alertConfirm } = useAlertConfirm();
  const [paquete, setPaquete] = useState(initialPaquete || PAQUETE_DEFAULT);
  
  // Estado para la sesión actualmente en edición de agendamiento
  const [sesionIndexEdicion, setSesionIndexEdicion] = useState(null);
  
  // Controles de fecha y hora seleccionada en edición
  const [tempFecha, setTempFecha] = useState(new Date());
  const [tempHora, setTempHora] = useState('09:00');

  const handleEditSesion = (idx) => {
    setSesionIndexEdicion(idx);
    const sesion = paquete.sesiones[idx];
    if (sesion.fecha) {
      setTempFecha(new Date(sesion.fecha));
      setTempHora(sesion.hora);
    } else {
      setTempFecha(new Date());
      setTempHora('09:00');
    }
  };

  const handleConfirmDate = (e) => {
    e.preventDefault();
    if (sesionIndexEdicion === null) return;

    const formattedDate = tempFecha.toISOString().slice(0, 10);

    const updatedSesiones = paquete.sesiones.map((s, idx) => {
      if (idx === sesionIndexEdicion) {
        return {
          ...s,
          fecha: formattedDate,
          hora: tempHora,
          estado: 'agendada'
        };
      }
      return s;
    });

    setPaquete(prev => ({ ...prev, sesiones: updatedSesiones }));
    setSesionIndexEdicion(null);

    if (onSave) onSave(updatedSesiones);
  };

  const handleCancelSesion = async (idx) => {
    const confirm = await alertConfirm({
      title: '¿Cancelar Cita del Paquete?',
      message: '¿Está seguro de que desea liberar este horario reservado en el calendario?',
      variant: 'warning'
    });

    if (confirm) {
      const updatedSesiones = paquete.sesiones.map((s, i) => {
        if (i === idx) {
          return { ...s, fecha: '', hora: '', estado: 'pendiente' };
        }
        return s;
      });
      setPaquete(prev => ({ ...prev, sesiones: updatedSesiones }));
    }
  };

  const sesionesAgendadas = paquete.sesiones.filter(s => s.estado === 'agendada').length;
  const porcentajeProgreso = (sesionesAgendadas / paquete.sesionesTotales) * 100;

  return (
    <div className="w-full flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
      
      {/* Resumen del Paquete */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-[var(--color-border)] pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Plan de Tratamiento</span>
          <h3 className="text-sm font-black text-[var(--color-text)] mt-0.5">{paquete.nombre}</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Especialista: {paquete.especialista}</p>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-44 text-right">
          <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
            <span>Progreso</span>
            <span>{sesionesAgendadas} de {paquete.sesionesTotales} agendadas</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Sesiones y Cronograma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Timeline Listado de Citas */}
        <div className="lg:col-span-7 flex flex-col gap-3 py-2 px-1">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Cronograma de Sesiones</span>
          <div className="relative pl-6 flex flex-col gap-3.5">
            
            {/* Línea de Progreso Z-Index controlada */}
            <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-[var(--color-border)] z-0" />

            {paquete.sesiones.map((ses, idx) => {
              const isAgendada = ses.estado === 'agendada';
              return (
                <div key={idx} className="relative flex items-center justify-between gap-3 animate-fadeIn">
                  
                  {/* Círculo indicador - relative z-10 masking the progress line */}
                  <div className={`absolute -left-[23px] w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all duration-200 z-10 bg-[var(--color-surface)] ${
                    isAgendada 
                      ? 'border-emerald-500 text-emerald-500' 
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className={`flex-1 p-3 rounded-xl border flex justify-between items-center transition-all ${
                    isAgendada
                      ? 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30'
                      : 'border-dashed border-[var(--color-border)] bg-transparent'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-[var(--color-text)]">Sesión #{ses.num}</span>
                      {isAgendada ? (
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ses.fecha}</span>
                          <Clock className="w-3.5 h-3.5 ml-1" />
                          <span>{ses.hora}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 animate-pulse">
                          Cita pendiente por agendar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isAgendada ? (
                        <button
                          type="button"
                          onClick={() => handleCancelSesion(idx)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                          title="Cancelar Cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditSesion(idx)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] !text-[var(--color-text)] text-[10px] font-bold shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
                        >
                          Agendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Agendamiento Activo (DatePicker) */}
        <div className="lg:col-span-5">
          {sesionIndexEdicion !== null ? (
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-4 animate-fadeIn">
              <div>
                <h4 className="text-xs font-black text-[var(--color-text)] uppercase">Agendar Sesión #{sesionIndexEdicion + 1}</h4>
                <p className="text-[10px] text-[var(--color-text-muted)]">Selecciona la fecha y hora sugerida</p>
              </div>

              {/* Calendario Premium Integrado */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">1. Seleccionar Fecha</label>
                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden scale-95 origin-top">
                  <DatePickerPremium
                    selectedDate={tempFecha}
                    onChange={setTempFecha}
                  />
                </div>
              </div>

              {/* Lista Horarios */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">2. Seleccionar Horario</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {HORAS_DISPONIBLES.map(hr => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setTempHora(hr)}
                      className={`py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        tempHora === hr
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {hr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSesionIndexEdicion(null)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/30 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDate}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 !text-[var(--color-text)] text-xs font-black uppercase shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Confirmar Cita
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[220px]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center text-[var(--color-text-muted)]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">Listo para Agendar</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1 max-w-[170px]">
                  Haz clic en el botón "Agendar" de cualquier sesión pendiente para abrir el programador premium.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`paquete`:** Almacena la estructura del paquete de tratamiento, su nombre, sesiones totales y el estado calendarizado de cada una.
- **`sesionIndexEdicion`:** Indice de la sesión activa que está siendo configurada en el programador de fecha/hora.
- **Timeline Z-Index:** Círculos de estado marcados con `relative z-10 bg-[var(--color-surface)]` sirviendo de máscara para ocultar la línea temporal absoluta `z-0` de progreso vertical.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Cliente as Recepción / Paciente
  participant Comp as ProgramadorSesiones Paquete
  participant DatePicker as DatePickerPremium
  participant Conf as useAlertConfirm Modal

  Cliente->{bracket}Comp: Clic en "Agendar" en Sesión #3
  Comp->{bracket}Comp: Carga panel lateral e inicializa DatePicker
  Cliente->{bracket}DatePicker: Navega y selecciona "15 Julio 2026"
  Cliente->{bracket}Comp: Clic en horario "10:00" y presiona "Confirmar Cita"
  Comp->{bracket}Comp: Marca Sesión #3 como "agendada" con fecha/hora y recalcula barra de progreso
  Cliente->{bracket}Comp: Clic en icono de basurero en cita programada
  Comp->{bracket}Conf: Despliega confirmación de cancelación de cita
  Conf--{bracket}Comp: Responde afirmativamente
  Comp->{bracket}Comp: Libera el horario y marca sesión como "pendiente"
```
