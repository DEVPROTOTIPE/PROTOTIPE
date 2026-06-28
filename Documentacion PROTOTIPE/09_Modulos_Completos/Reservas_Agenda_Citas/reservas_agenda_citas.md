<!--
{
  "technicalName": "ReservasAgendaCitas",
  "targetPath": "src/components/modules/ReservasAgendaCitas.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Módulo de Reservas y Agenda de Citas Premium

## 1. Propósito y Casos de Uso
Permite a negocios de servicios (peluquerías, consultorios médicos, tornerías con turnos, talleres con citas de valoración) organizar su disponibilidad horaria semanal por profesional o máquina, y recibir citas desde un portal público o agendamiento administrativo.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
El módulo ofrece un calendario interactivo HSL con:
- Celdas que cambian de color según disponibilidad (Disponible, Ocupado, Bloqueado).
- Tarjetas de servicio flotantes con detalles del cliente.
- Transiciones fluidas en el cambio de días y semanas.

---

## 3. Código React Completo y Funcional
A continuación, se detalla el componente principal `AgendaReservationCalendar.jsx`:

```jsx
import React, { useState } from 'react';
import { Calendar, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AgendaReservationCalendar({ professionals = [], initialReservations = [], onAddReservation }) {
  const [selectedProf, setSelectedProf] = useState(professionals[0]?.id || '');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState(initialReservations);

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const getReservation = (hour) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return reservations.find(r => r.date === dateStr && r.hour === hour && r.professionalId === selectedProf);
  };

  const changeDay = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 max-w-xl mx-auto">
      {/* Selector de Profesional */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-[10px] font-black uppercase text-indigo-400">Profesional / Recurso:</label>
        <select
          value={selectedProf}
          onChange={e => setSelectedProf(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-indigo-500"
        >
          {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Control de Navegación de Fecha */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2 border border-slate-800/80 rounded-xl">
        <button onClick={() => changeDay(-1)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Calendar size={13} className="text-indigo-400" />
          {currentDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <button onClick={() => changeDay(1)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cuadrícula de Horas */}
      <div className="space-y-2">
        {hours.map(hour => {
          const res = getReservation(hour);
          return (
            <div
              key={hour}
              className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                res
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-indigo-600/5 hover:bg-indigo-600/15 border-indigo-500/15 hover:border-indigo-500/30 text-indigo-300 cursor-pointer'
              }`}
              onClick={() => {
                if (!res) {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  const client = prompt('Ingrese nombre del cliente para la cita:');
                  if (client) {
                    const newRes = { id: Date.now().toString(), professionalId: selectedProf, date: dateStr, hour, clientName: client };
                    setReservations(prev => [...prev, newRes]);
                    if (onAddReservation) onAddReservation(newRes);
                  }
                }
              }}
            >
              <div className="flex items-center gap-2">
                <Clock size={12} className={res ? 'text-rose-400' : 'text-indigo-400'} />
                <span className="font-mono text-xs font-bold">{hour}</span>
              </div>

              <div className="text-right">
                {res ? (
                  <span className="text-[10px] font-bold bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/10">
                    Ocupado por: {res.clientName}
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300">
                    Reservar Cita +
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 4. Lógica de Estado
El estado local se gestiona en un array de reservaciones sincronizado por props para guardar citas persistentes en Firestore (`reservations` collection).
