<!--
{
  "technicalName": "AgendaReservationCalendar",
  "targetPath": "src/components/common/AgendaReservationCalendar.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Selector de Reservas de Citas tipo Agenda (`AgendaReservationCalendar`)

Componente premium de marca blanca en formato agenda para la reserva de citas y gestión de turnos comerciales. Permite al cliente elegir una fecha mediante un selector semanal responsivo y agendar una hora disponible a partir de una rejilla dinámica parametrizada con control de horas ocupadas y formulario con selector desplegable custom animado con Framer Motion.

---

## 1. Propósito y Casos de Uso
- **Servicios Técnicos y Talleres:** Permite agendar turnos de mantenimiento mecánico, tornerías o reparaciones de dispositivos.
- **Barberías y Spas:** Facilita la asignación horaria por profesional o tipo de corte de cabello.
- **Reservas de Restaurantes:** Gestión de franjas de almuerzo o cena.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Barra Semanal Deslizable:** Fila horizontal interactiva que autogenera los próximos 7 días a partir de hoy y resalta el día activo usando gradientes HSL.
- **Rejilla de Horarios:** Cuadrícula de 3 columnas de horas que cambia dinámicamente de estilos según el estado de la celda.
- **Formulario Integrado con CustomSelect:** Captura el nombre del cliente y posee un selector desplegable premium animado en Framer Motion con tap-shield, Chevron rotatorio y checkmarks de selección activa.

---

## 3. Código React Completo

```jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaReservationCalendar({
  startHour = '08:00',
  endHour = '18:00',
  slotDuration = '45', // En minutos
  initialOccupiedRate = '40', // % de slots ocupados simulados
  onConfirmBooking = () => {}
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState({}); // dateString -> [slots]
  const [clientName, setClientName] = useState('');
  const [clientService, setClientService] = useState('Corte de Cabello 💈');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const daysList = useMemo(() => {
    const list = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dateString: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        dayNumber: d.getDate().toString().padStart(2, '0'),
        monthName: months[d.getMonth()]
      });
    }
    return list;
  }, []);

  useEffect(() => {
    if (daysList.length > 0 && !selectedDate) {
      setSelectedDate(daysList[0].dateString);
    }
  }, [daysList, selectedDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = endHour.split(':').map(Number);
    const duration = Number(slotDuration);

    let current = new Date();
    current.setHours(sh, sm, 0, 0);

    const end = new Date();
    end.setHours(eh, em, 0, 0);

    while (current < end) {
      const timeString = current.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  }, [startHour, endHour, slotDuration]);

  const getOccupiedForDate = (dateStr) => {
    if (occupiedSlots[dateStr]) return occupiedSlots[dateStr];
    const rate = Number(initialOccupiedRate) / 100;
    const occupied = timeSlots.filter(() => Math.random() < rate);
    
    setOccupiedSlots(prev => ({
      ...prev,
      [dateStr]: occupied
    }));
    return occupied;
  };

  const currentOccupied = selectedDate ? getOccupiedForDate(selectedDate) : [];

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) return;
    if (!clientName.trim()) {
      alert("Por favor ingresa tu nombre");
      return;
    }
    
    onConfirmBooking({
      date: selectedDate,
      time: selectedSlot,
      name: clientName,
      service: clientService
    });

    setOccupiedSlots(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), selectedSlot]
    }));

    setSelectedSlot(null);
    setClientName('');
  };

  return (
    <div className="w-full space-y-4 text-white">
      {/* Carrusel de Días */}
      <div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Selecciona un día:</span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {daysList.map((day) => {
            const isActive = selectedDate === day.dateString;
            return (
              <button
                key={day.dateString}
                onClick={() => {
                  setSelectedDate(day.dateString);
                  setSelectedSlot(null);
                }}
                className={`flex flex-col items-center justify-center min-w-[54px] p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                }`}
              >
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">{day.dayName}</span>
                <span className="text-sm font-black mt-1">{day.dayNumber}</span>
                <span className="text-[8px] mt-0.5 opacity-60 font-mono">{day.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Horas */}
      <div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Horas disponibles:</span>
        <div className="grid grid-cols-3 gap-1.5">
          {timeSlots.map((slot) => {
            const isOccupied = currentOccupied.includes(slot);
            const isSelected = selectedSlot === slot;
            
            let btnClass = "";
            if (isOccupied) {
              btnClass = "bg-slate-800/40 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed";
            } else if (isSelected) {
              btnClass = "bg-purple-500/20 border-purple-500/60 text-purple-400 font-black scale-105 shadow-md shadow-purple-500/5";
            } else {
              btnClass = "bg-slate-950/50 border-white/5 text-slate-300 hover:border-white/20 hover:scale-[1.02] cursor-pointer";
            }

            return (
              <button
                key={slot}
                disabled={isOccupied}
                onClick={() => setSelectedSlot(slot)}
                className={`px-2 py-2.5 text-[10px] text-center font-bold rounded-xl border transition-all duration-200 ${btnClass}`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulario e Info de Reserva */}
      {selectedSlot && (
        <div className="p-3 bg-slate-950/60 border border-white/10 rounded-2xl space-y-3 animate-fade-in">
          <div>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Resumen de Cita:</span>
            <p className="text-xs font-bold text-indigo-400 mt-1 uppercase">
              📅 {selectedDate} a las ⏰ {selectedSlot}
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tu Nombre"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder-slate-600"
            />

            {/* Custom Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between transition cursor-pointer hover:border-indigo-500/50"
              >
                <span>{clientService}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isSelectOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSelectOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-white/5"
                    >
                      {[
                        "Corte de Cabello 💈",
                        "Mantenimiento de Barba 🪒",
                        "Servicio Técnico Premium 🛠️",
                        "Lavado & Peinado 🧼"
                      ].map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setClientService(service);
                            setIsSelectOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-xs text-left transition-colors flex items-center justify-between hover:bg-slate-900 cursor-pointer ${
                            clientService === service ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-white'
                          }`}
                        >
                          <span>{service}</span>
                          {clientService === service && <span className="text-indigo-400 font-bold">✓</span>}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleBooking}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold uppercase rounded-xl tracking-wider transition-all duration-300 shadow-lg shadow-indigo-500/15 cursor-pointer text-center"
          >
            Confirmar Reserva
          </button>
        </div>
      )}
    </div>
  );
}
```
