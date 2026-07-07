<!--
{
  "technicalName": "ModuloAgendamientoBarberia",
  "targetPath": "src/components/modules/ModuloAgendamientoBarberia.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "module",
  "niches": [
    "wellness_podology"
  ]
}
-->

# Módulo de Agendamiento de Citas (Barbería)

## 1. Propósito y Casos de Uso
El módulo **`ModuloAgendamientoBarberia`** es una solución integral de marca blanca para la reserva y administración de citas en vivo en el ecosistema **PROTOTIPE**. 

Sirve como plantilla de agendamiento para cualquier negocio que base su actividad comercial en reservas horarias (peluquerías, barberías, salones estéticos, spas, clínicas y locales de tatuajes). Proporciona control de cuadrícula en vistas de Día, Semana y Mes, búsqueda inteligente de turnos, cálculo en caliente de slots de tiempo desocupados por profesional y un editor persistente de la jornada laboral y almuerzos.

## 2. Especificación Visual y Estilos (Tailwind CSS)
El módulo consume de forma dinámica los siguientes tokens HSL declarados en el `:root` de marca blanca:
- **Fondo General:** `bg-[var(--color-bg)]`
- **Fondo de Contenedores:** `bg-[var(--color-surface)]` y `bg-[var(--color-surface-2)]`
- **Bordes y Separadores:** `border-[var(--color-border)]`
- **Textos y Badges:** `text-[var(--color-text)]` y `text-[var(--color-text-muted)]`
- **Color Primario (Selección y Resaltado):** `bg-[var(--color-primary)]` y `text-[var(--color-primary)]`
- **Color Secundario (Estados intermedios):** `bg-[var(--color-secondary)]` y `text-[var(--color-secondary)]`

El componente está optimizado para GPU para una navegación móvil y de escritorio fluida, con animaciones de Framer Motion en modales de seguridad `<TapShield>`. Todos los elementos interactivos cuentan con la clase `cursor-pointer`.

## 3. Props y API del Componente
| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `initialView` | `string` | `'semana'` | Tipo de vista activa inicial (`'dia' \| 'semana' \| 'mes'`). |

## 4. Código React Completo y Funcional
```jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TapShield } from '../TapShield';

// ==========================================
// 1. UTILIDADES Y HELPERS DE FECHA/HORA
// ==========================================

const formatDate = (date, format = 'yyyy-MM-dd') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  if (format === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
  if (format === 'HH:mm') return `${hours}:${minutes}`;
  if (format === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
  if (format === 'human-date') {
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (format === 'human-short') {
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  if (format === 'month-year') {
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
  return d.toISOString();
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addMinutes = (timeString, minutes) => {
  const [h, m] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
};

const compareTimes = (time1, time2) => {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  if (h1 !== h2) return h1 - h2;
  return m1 - m2;
};

const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getDaysInMonth = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startDay = firstDay.getDay();
  const fillDays = startDay === 0 ? 6 : startDay - 1;

  for (let i = fillDays; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i);
    days.push({ date: prevDate, isCurrentMonth: false, isToday: isSameDay(prevDate, new Date()) });
  }
  const totalDays = lastDay.getDate();
  for (let i = 1; i <= totalDays; i++) {
    const currDate = new Date(year, month, i);
    days.push({ date: currDate, isCurrentMonth: true, isToday: isSameDay(currDate, new Date()) });
  }
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({ date: nextDate, isCurrentMonth: false, isToday: isSameDay(nextDate, new Date()) });
  }
  return days;
};

const getDaysInWeek = (date) => {
  const monday = startOfWeek(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(monday, i);
    days.push({ date: dayDate, isToday: isSameDay(dayDate, new Date()) });
  }
  return days;
};

const getHoursList = (start = '08:00', end = '20:00', intervalMinutes = 60) => {
  const hours = [];
  let [currH, currM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let currTotal = currH * 60 + currM;
  const endTotal = endH * 60 + endM;

  while (currTotal <= endTotal) {
    const hh = String(Math.floor(currTotal / 60)).padStart(2, '0');
    const mm = String(currTotal % 60).padStart(2, '0');
    hours.push(`${hh}:${mm}`);
    currTotal += intervalMinutes;
  }
  return hours;
};

const checkTimeCollision = (start1, duration1, start2, duration2) => {
  const end1 = addMinutes(start1, duration1);
  const end2 = addMinutes(start2, duration2);
  if (compareTimes(end1, start2) <= 0) return false;
  if (compareTimes(end2, start1) <= 0) return false;
  return true;
};

const calculateAvailableSlots = (date, professional, appointments, services, businessHours) => {
  if (!professional) return [];
  const dayName = new Date(date).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const hoursConfig = businessHours[dayName] || businessHours['lunes'];
  if (!hoursConfig || !hoursConfig.active) return [];

  const slots = [];
  const startStr = hoursConfig.start;
  const endStr = hoursConfig.end;
  let currentStr = startStr;
  const defaultDuration = 30;

  const dayApps = appointments.filter(
    (app) => isSameDay(app.date, date) && 
             app.professionalId === professional.id && 
             app.status !== 'Cancelada'
  );

  while (compareTimes(addMinutes(currentStr, defaultDuration), endStr) <= 0) {
    let isAvailable = true;
    let collisionReason = null;

    if (hoursConfig.breakActive) {
      if (checkTimeCollision(currentStr, defaultDuration, hoursConfig.breakStart, 60)) {
        isAvailable = false;
        collisionReason = 'Almuerzo / Descanso';
      }
    }

    if (isAvailable) {
      for (const app of dayApps) {
        const appDuration = app.service?.duration || 30;
        if (checkTimeCollision(currentStr, defaultDuration, app.time, appDuration)) {
          isAvailable = false;
          collisionReason = 'Turno Ocupado';
          break;
        }
      }
    }

    slots.push({ time: currentStr, isAvailable, reason: collisionReason });
    currentStr = addMinutes(currentStr, 30);
  }
  return slots;
};

// ==========================================
// 2. MOCKS DE MÓDULO POR DEFECTO
// ==========================================

const MOCK_SERVICES = [
  { id: 's1', name: 'Corte de Cabello Clásico', duration: 30, price: 15.00, color: '262', category: 'Cabello', description: 'Corte clásico con lavado y peinado.' },
  { id: 's2', name: 'Perfilado de Barba Premium', duration: 30, price: 12.00, color: '217', category: 'Barba', description: 'Afeitado y toalla caliente.' },
  { id: 's3', name: 'Corte + Barba Combo', duration: 60, price: 24.00, color: '330', category: 'Combos', description: 'Servicio completo de corte y perfilado.' },
  { id: 's4', name: 'Tinte & Camuflaje de Canas', duration: 45, price: 20.00, color: '150', category: 'Color', description: 'Tinte rápido para cabello y barba.' }
];

const MOCK_PROFESSIONALS = [
  { id: 'p1', name: 'Alexx Barber', specialty: 'Estilo Clásico & Degradados', avatar: 'AB', compatibleServices: ['s1', 's2', 's3', 's4'], status: 'active' },
  { id: 'p2', name: 'Mateo Barbero', specialty: 'Cortes Modernos & Diseños', avatar: 'MB', compatibleServices: ['s1', 's3'], status: 'active' },
  { id: 'p3', name: 'Carlos Stylist', specialty: 'Perfilado & Ritual de Toalla', avatar: 'CS', compatibleServices: ['s2', 's3', 's4'], status: 'active' }
];

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Juan Pérez', phone: '+54 9 11 2345-6789', email: 'juan.perez@example.com', notes: 'Prefiere cortes con navaja.' },
  { id: 'c2', name: 'Diego Maradona', phone: '+54 9 11 9876-5432', email: 'dieguito@example.com', notes: 'Cliente frecuente los sábados.' },
  { id: 'c3', name: 'Lionel Messi', phone: '+54 9 34 1010-1010', email: 'leo@example.com', notes: 'Prefiere toalla fría.' }
];

const DEFAULT_BUSINESS_HOURS = {
  lunes: { active: true, start: '09:00', end: '19:00', breakActive: true, breakStart: '13:00', breakEnd: '14:00' },
  martes: { active: true, start: '09:00', end: '19:00', breakActive: true, breakStart: '13:00', breakEnd: '14:00' },
  miercoles: { active: true, start: '09:00', end: '19:00', breakActive: true, breakStart: '13:00', breakEnd: '14:00' },
  jueves: { active: true, start: '09:00', end: '19:00', breakActive: true, breakStart: '13:00', breakEnd: '14:00' },
  viernes: { active: true, start: '09:00', end: '20:00', breakActive: true, breakStart: '13:00', breakEnd: '14:00' },
  sabado: { active: true, start: '09:00', end: '17:00', breakActive: false, breakStart: '13:00', breakEnd: '14:00' },
  domingo: { active: false, start: '09:00', end: '14:00', breakActive: false, breakStart: '12:00', breakEnd: '13:00' }
};

// ==========================================
// 3. HOOKS DE ESTADO Y NEGOCIO
// ==========================================

function useCalendarNavigation(initialDate = new Date(), initialView = 'semana') {
  const [currentDate, setCurrentDate] = useState(() => new Date(initialDate));
  const [currentView, setCurrentView] = useState(initialView);

  const navigate = useCallback((direction) => {
    setCurrentDate((prevDate) => {
      const step = direction === 'next' ? 1 : -1;
      if (currentView === 'dia') return addDays(prevDate, step);
      if (currentView === 'semana') return addDays(prevDate, step * 7);
      if (currentView === 'mes') {
        const nextMonth = new Date(prevDate);
        nextMonth.setMonth(prevDate.getMonth() + step);
        return nextMonth;
      }
      return prevDate;
    });
  }, [currentView]);

  return {
    currentDate,
    currentView,
    handleNext: () => navigate('next'),
    handlePrev: () => navigate('prev'),
    handleToday: () => setCurrentDate(new Date()),
    handleViewChange: setCurrentView,
    handleDateChange: (d) => setCurrentDate(new Date(d))
  };
}

function useBusinessHours() {
  const [businessHours, setBusinessHours] = useState(() => {
    try {
      const saved = localStorage.getItem('prototipe_barberia_business_hours');
      return saved ? JSON.parse(saved) : DEFAULT_BUSINESS_HOURS;
    } catch (e) {
      return DEFAULT_BUSINESS_HOURS;
    }
  });

  useEffect(() => {
    localStorage.setItem('prototipe_barberia_business_hours', JSON.stringify(businessHours));
  }, [businessHours]);

  const updateDayHours = useCallback((day, newConfig) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...newConfig }
    }));
  }, []);

  return { businessHours, updateDayHours };
}

function useAppointments() {
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('prototipe_barber_appointments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
    return [
      { id: 'a1', date: todayStr, time: '10:00', clientId: 'c1', professionalId: 'p1', serviceId: 's1', status: 'Confirmada', notes: 'Corte texturizado arriba.' },
      { id: 'a2', date: todayStr, time: '11:00', clientId: 'c2', professionalId: 'p2', serviceId: 's3', status: 'Pendiente', notes: 'Perfilado de barba con ritual de toalla.' },
      { id: 'a3', date: todayStr, time: '15:00', clientId: 'c3', professionalId: 'p1', serviceId: 's2', status: 'En proceso', notes: '' }
    ];
  });

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('prototipe_barber_clients');
      return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch (e) {
      return MOCK_CLIENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('prototipe_barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('prototipe_barber_clients', JSON.stringify(clients));
  }, [clients]);

  const addAppointment = useCallback((appData) => {
    const newApp = { id: `app_${Date.now()}`, status: 'Pendiente', notes: '', ...appData };
    setAppointments((prev) => [...prev, newApp]);
    return newApp;
  }, []);

  const updateAppointment = useCallback((id, updatedData) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedData } : app))
    );
  }, []);

  const deleteAppointment = useCallback((id) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id));
  }, []);

  const addClient = useCallback((clientData) => {
    const newClient = { id: `cli_${Date.now()}`, notes: '', ...clientData };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, []);

  const expandedAppointments = useMemo(() => {
    return appointments.map((app) => {
      const client = clients.find((c) => c.id === app.clientId);
      const professional = MOCK_PROFESSIONALS.find((p) => p.id === app.professionalId);
      const service = MOCK_SERVICES.find((s) => s.id === app.serviceId);
      return { ...app, client, professional, service };
    });
  }, [appointments, clients]);

  return {
    appointments: expandedAppointments,
    clients,
    professionals: MOCK_PROFESSIONALS,
    services: MOCK_SERVICES,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addClient
  };
}

// ==========================================
// 4. SUB-COMPONENTES DE INTERFAZ (UI)
// ==========================================

function AppointmentStatusBadge({ status = 'Pendiente' }) {
  const getStyles = () => {
    switch (status) {
      case 'Confirmada':
        return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20';
      case 'En proceso':
        return 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20';
      case 'Completada':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Cancelada':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Ausente':
        return 'bg-zinc-900/65 text-zinc-500 border-zinc-800';
      case 'Reprogramada':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold border leading-none shrink-0 ${getStyles()}`}>
      {status.toUpperCase()}
    </span>
  );
}

function AvailabilityIndicator({ percentage = 0, freeCount = 0 }) {
  return (
    <div className="flex items-center space-x-3 p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-zinc-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path
            className={percentage >= 80 ? 'text-rose-500' : percentage >= 50 ? 'text-amber-500' : 'text-emerald-500'}
            strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-100">
          {percentage}%
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold text-zinc-200">Ocupación Barbería</div>
        <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
          {freeCount > 0 ? `${freeCount} turnos libres` : 'Sin turnos disponibles'}
        </p>
      </div>
    </div>
  );
}

// Legend
function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
      {[
        { label: 'Pendiente', color: 'bg-amber-500' },
        { label: 'Confirmada', color: 'bg-[var(--color-primary)]' },
        { label: 'En proceso', color: 'bg-[var(--color-secondary)]' },
        { label: 'Completada', color: 'bg-emerald-500' },
        { label: 'Cancelada', color: 'bg-rose-500' },
        { label: 'Ausente', color: 'bg-zinc-600' }
      ].map((item, idx) => (
        <div key={idx} className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
          <span className="text-[9px] font-medium text-[var(--color-text-muted)]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyAppointments({ onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)]/10 text-center space-y-4 w-full">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
        </svg>
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold text-[var(--color-text)] uppercase tracking-wider">Sin turnos en agenda</h4>
        <p className="text-[9px] text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">No hay citas reservadas para el día y filtros actuales.</p>
      </div>
      {onAction && (
        <button onClick={onAction} className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-text)] text-[9px] font-semibold transition-all shadow cursor-pointer active:scale-95">
          Agendar Turno
        </button>
      )}
    </div>
  );
}

function ProfessionalSelector({ professionals, selectedId, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Selecciona Barbero</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {professionals.map((prof) => {
          const isSelected = prof.id === selectedId;
          return (
            <button
              key={prof.id}
              type="button"
              onClick={() => onChange(prof.id)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-2.5 w-full ${
                isSelected ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)]' : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-zinc-300 hover:bg-[var(--color-surface-2)]/70'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${isSelected ? 'bg-[var(--color-primary)] text-[var(--color-text)]' : 'bg-zinc-800 text-zinc-400'}`}>
                {prof.avatar}
              </div>
              <div className="truncate">
                <div className="text-[10px] font-bold truncate leading-none">{prof.name}</div>
                <div className="text-[7.5px] mt-0.5 truncate opacity-60">{prof.specialty}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServiceSelector({ services, selectedId, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Selecciona Servicio</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {services.map((service) => {
          const isSelected = service.id === selectedId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onChange(service.id)}
              className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between h-20 w-full relative overflow-hidden ${
                isSelected ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)]' : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-zinc-300 hover:bg-[var(--color-surface-2)]/70'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: `hsl(${service.color} 80% 50%)` }} />
              <div className="pl-1.5">
                <span className="text-[7.5px] font-mono uppercase font-bold text-zinc-500">{service.category}</span>
                <div className="text-[10px] font-bold truncate leading-none mt-0.5">{service.name}</div>
              </div>
              <div className="flex items-center justify-between w-full pl-1.5 mt-2 border-t border-[var(--color-border)]/50 pt-1.5">
                <span className="text-[8px] font-mono text-zinc-500">{service.duration} min</span>
                <span className="text-[10px] font-mono font-bold text-zinc-200">${service.price.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClientSelector({ clients, selectedId, onChange, onCreateClient }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const newClient = onCreateClient({ name, phone });
    if (newClient) {
      onChange(newClient.id);
      setIsAdding(false);
      setName('');
      setPhone('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Cliente del Turno</label>
        <button type="button" onClick={() => setIsAdding(!isAdding)} className="text-[9px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
          {isAdding ? 'Buscar en Lista' : '+ Registrar Rápido'}
        </button>
      </div>
      {isAdding ? (
        <div className="p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" placeholder="Nombre *" value={name} onChange={(e) => setName(e.target.value)} className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-500 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            <input type="tel" placeholder="Teléfono *" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-500 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
          </div>
          <button type="button" onClick={handleSave} className="w-full py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-[9px] font-semibold transition-all cursor-pointer">
            Registrar y Seleccionar
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] appearance-none cursor-pointer"
          >
            <option value="">-- Seleccionar un Cliente --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>
          <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-500">
            <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSlotPicker({ slots, selectedTime, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Selecciona Horario</label>
      {slots.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {slots.map((slot, idx) => {
            const isSelected = slot.time === selectedTime;
            return (
              <button
                key={idx}
                type="button"
                disabled={!slot.isAvailable}
                onClick={() => onChange(slot.time)}
                className={`py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all text-center flex flex-col justify-center items-center h-10 ${
                  isSelected ? 'bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-primary)]' : slot.isAvailable ? 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-zinc-300 hover:border-zinc-600 cursor-pointer' : 'bg-zinc-950/45 border-transparent text-zinc-700 cursor-not-allowed opacity-40'
                }`}
                title={slot.isAvailable ? 'Disponible' : slot.reason}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-[9px] text-zinc-600 py-3 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/10">No hay turnos libres para esta selección.</div>
      )}
    </div>
  );
}

// DatePickerInput
function DatePickerInput({ selectedDate, onChange }) {
  const handleStep = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
  };
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Fecha del Turno</label>
      <div className="flex items-center space-x-2">
        <button type="button" onClick={() => handleStep(-1)} className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-zinc-400 hover:text-zinc-200 cursor-pointer">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <input type="date" value={selectedDate} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 text-[11px] focus:outline-none cursor-pointer font-mono" />
        <button type="button" onClick={() => handleStep(1)} className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-zinc-400 hover:text-zinc-200 cursor-pointer">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

function CalendarToolbar({ currentDate, currentView, onNext, onPrev, onToday, onViewChange, onOpenSettings, onAddAppointment }) {
  const formattedTitle = formatDate(currentDate, 'month-year');
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 backdrop-blur-md">
      <div className="flex items-center space-x-2.5">
        <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-900">
          <button onClick={onPrev} className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={onToday} className="px-2.5 py-1 rounded text-[9px] font-semibold text-zinc-300 hover:text-[var(--color-text)] cursor-pointer">Hoy</button>
          <button onClick={onNext} className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <h3 className="text-[11px] font-bold text-zinc-100 uppercase tracking-wider capitalize font-mono leading-none">{formattedTitle}</h3>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-900">
          {['dia', 'semana', 'mes'].map((view) => (
            <button key={view} onClick={() => onViewChange(view)} className={`px-2.5 py-1 rounded text-[9px] font-semibold transition-all cursor-pointer capitalize ${currentView === view ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {view}
            </button>
          ))}
        </div>
        <button onClick={onOpenSettings} className="p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </button>
        <button onClick={onAddAppointment} className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-[9px] font-semibold transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-1">
          <span>+ Cita</span>
        </button>
      </div>
    </div>
  );
}

function AppointmentCardCompact({ appointment, onClick, onStatusChange }) {
  const { client = {}, professional = {}, service = {} } = appointment;
  const handleQuickComplete = (e) => {
    e.stopPropagation();
    onStatusChange(appointment.id, 'Completada');
  };
  return (
    <div onClick={onClick} className="group relative p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 hover:bg-[var(--color-surface-2)]/50 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 active:scale-[0.99] select-none text-left">
      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r" style={{ backgroundColor: `hsl(${service.color || '262'} 80% 50%)` }} />
      <div className="flex items-center justify-between pl-1">
        <span className="text-[10px] font-mono font-bold text-zinc-100">{appointment.time} <span className="text-[8px] text-zinc-500 font-normal">({service.duration}m)</span></span>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      <div className="pl-1">
        <div className="text-[10px] font-bold text-zinc-200 truncate">{client.name}</div>
        <div className="text-[8px] text-zinc-500 font-semibold truncate">Barbero: <span className="text-zinc-400">{professional.name}</span></div>
      </div>
      {appointment.status !== 'Completada' && appointment.status !== 'Cancelada' && (
        <button onClick={handleQuickComplete} className="opacity-0 group-hover:opacity-100 w-full py-1 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 hover:text-[var(--color-text)] hover:bg-emerald-600 text-[8px] font-bold transition-all text-center cursor-pointer">
          Marcar Completada
        </button>
      )}
    </div>
  );
}

function AppointmentDayView({ currentDate, appointments, businessHours, professionals, onCardClick, onStatusChange, onAddAppointmentAtTime }) {
  const dayName = currentDate.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const config = businessHours[dayName] || businessHours['lunes'];
  const isActive = config?.active ?? true;
  const start = config?.start || '09:00';
  const end = config?.end || '19:00';
  const hours = getHoursList(start, end, 60);

  const dayApps = appointments.filter((app) => isSameDay(app.date, currentDate));

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
        <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Barbería Cerrada</h4>
        <p className="text-[9px] text-zinc-500 max-w-xs capitalize">{dayName} no es día laboral.</p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)]/10 overflow-hidden w-full">
      <div className="divide-y divide-zinc-900/60 max-h-[480px] overflow-y-auto scrollbar-thin">
        {hours.map((hour) => {
          const hourApps = dayApps.filter((app) => app.time === hour);
          return (
            <div key={hour} className="flex min-h-[75px] group/row">
              <div className="w-14 flex-shrink-0 flex items-start justify-center pt-3 border-r border-zinc-900/50 bg-zinc-950/20">
                <span className="text-[10px] font-mono font-bold text-zinc-400">{hour}</span>
              </div>
              <div className="flex-1 p-2 space-y-1.5 text-left">
                {hourApps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hourApps.map((app) => (
                      <AppointmentCardCompact key={app.id} appointment={app} onClick={() => onCardClick(app)} onStatusChange={onStatusChange} />
                    ))}
                  </div>
                ) : (
                  <button onClick={() => onAddAppointmentAtTime(hour)} className="opacity-0 group-hover/row:opacity-100 px-2 py-1 rounded bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[8.5px] font-bold transition-all cursor-pointer">
                    + Agendar a las {hour}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentWeekView({ currentDate, appointments, onCardClick, onAddAppointmentAtDay }) {
  const weekDays = getDaysInWeek(currentDate);
  return (
    <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)]/10 overflow-hidden w-full">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-zinc-900/60 overflow-x-auto">
        {weekDays.map((day) => {
          const dayApps = appointments.filter((app) => isSameDay(app.date, day.date));
          const dayLabel = day.date.toLocaleDateString('es-ES', { weekday: 'short' });
          const dayNum = day.date.getDate();

          return (
            <div key={day.date.toISOString()} className="flex flex-col min-h-[320px] group/col">
              <div className={`p-2.5 border-b border-zinc-900/60 flex items-center justify-between ${day.isToday ? 'bg-[var(--color-primary)]/5' : 'bg-zinc-950/20'}`}>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] font-bold uppercase ${day.isToday ? 'text-[var(--color-primary)]' : 'text-zinc-500'}`}>{dayLabel}</span>
                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${day.isToday ? 'bg-[var(--color-primary)] text-[var(--color-text)]' : 'text-zinc-300'}`}>{dayNum}</span>
                </div>
                <button onClick={() => onAddAppointmentAtDay(day.date)} className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>
              <div className="flex-1 p-1.5 space-y-1.5 bg-zinc-950/5 overflow-y-auto max-h-[350px] scrollbar-thin">
                {dayApps.length > 0 ? (
                  dayApps.map((app) => (
                    <div key={app.id} onClick={() => onCardClick(app)} className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 hover:bg-[var(--color-surface-2)]/70 transition-all cursor-pointer flex flex-col space-y-1 select-none text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-zinc-100">{app.time}</span>
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: `hsl(${app.service?.color || '262'} 80% 50%)` }} />
                      </div>
                      <div className="text-[9px] font-bold text-zinc-200 truncate leading-none">{app.client?.name}</div>
                      <div className="text-[7.5px] text-zinc-500 truncate">{app.service?.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center py-8">
                    <span className="text-[8px] text-zinc-700 font-mono tracking-wider uppercase">Libre</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentMonthView({ currentDate, appointments, onDateClick }) {
  const monthDays = getDaysInMonth(currentDate);
  const weekLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return (
    <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)]/10 overflow-hidden w-full">
      <div className="grid grid-cols-7 border-b border-zinc-900/60 bg-zinc-950/20 text-center py-2">
        {weekLabels.map((lbl) => (
          <span key={lbl} className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-wider">{lbl}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-y divide-x divide-zinc-900/60 bg-zinc-950/5">
        {monthDays.map((day, idx) => {
          const dayApps = appointments.filter((app) => isSameDay(app.date, day.date));
          const appCount = dayApps.length;
          return (
            <button
              key={idx}
              onClick={() => onDateClick(day.date)}
              className={`min-h-[70px] p-1.5 flex flex-col justify-between text-left transition-all hover:bg-zinc-900/20 cursor-pointer ${day.isCurrentMonth ? '' : 'opacity-30'} ${day.isToday ? 'bg-[var(--color-primary)]/5' : ''}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[8px] font-bold ${day.isToday ? 'bg-[var(--color-primary)] text-[var(--color-text)]' : 'text-zinc-400'}`}>
                {day.date.getDate()}
              </span>
              <div className="w-full mt-1">
                {appCount > 0 ? (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold leading-none shrink-0 ${appCount >= 3 ? 'bg-rose-500/10 text-rose-400' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                    {appCount} {appCount === 1 ? 'cita' : 'citas'}
                  </span>
                ) : (
                  <span className="text-[7px] text-zinc-700 uppercase tracking-wider block text-center py-1">Libre</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentTimeline({ appointments, onCardClick, onStatusChange, onAddClick }) {
  const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Cronograma</h4>
        <span className="text-[9px] font-mono text-[var(--color-text-muted)]">{sorted.length} citas</span>
      </div>
      {sorted.length > 0 ? (
        <div className="relative border-l border-zinc-800 pl-3 ml-1.5 space-y-3.5 py-1">
          {sorted.map((app) => (
            <div key={app.id} className="relative">
              <span className="absolute -left-[16px] top-3.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] border border-zinc-950" />
              <AppointmentCardCompact appointment={app} onClick={() => onCardClick(app)} onStatusChange={onStatusChange} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyAppointments onAction={onAddClick} />
      )}
    </div>
  );
}

function BusinessHoursEditor({ initialHours, onSave, onClose }) {
  const [hours, setHours] = useState(initialHours);
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const handleChange = (day, key, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [key]: value }
    }));
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(hours); }} className="space-y-4 text-left">
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {days.map((day) => {
          const config = hours[day] || { active: false, start: '09:00', end: '18:00', breakActive: false, breakStart: '13:00', breakEnd: '14:00' };
          return (
            <div key={day} className="p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider capitalize font-mono">{day}</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={config.active} onChange={(e) => handleChange(day, 'active', e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                  <span className="ml-2 text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{config.active ? 'Abierto' : 'Cerrado'}</span>
                </label>
              </div>
              {config.active && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]/50">
                  <div>
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block">Apertura</span>
                    <input type="time" value={config.start} onChange={(e) => handleChange(day, 'start', e.target.value)} className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10px] font-mono" />
                  </div>
                  <div>
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block">Cierre</span>
                    <input type="time" value={config.end} onChange={(e) => handleChange(day, 'end', e.target.value)} className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10px] font-mono" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--color-border)]">
        <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-xs text-zinc-300 font-semibold border border-zinc-800 cursor-pointer">Cancelar</button>
        <button type="submit" className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-semibold shadow cursor-pointer">Guardar Horarios</button>
      </div>
    </form>
  );
}

function AppointmentForm({ initialData, clients, professionals, services, appointments, businessHours, onSave, onClose, onCreateClient }) {
  const isEdit = !!initialData?.id;
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [serviceId, setServiceId] = useState(initialData?.serviceId || '');
  const [professionalId, setProfessionalId] = useState(initialData?.professionalId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState(initialData?.status || 'Pendiente');

  const [availableSlots, setAvailableSlots] = useState([]);
  const selectedProfessional = professionals.find(p => p.id === professionalId);

  useEffect(() => {
    if (date && professionalId) {
      const otherApps = appointments.filter(app => app.id !== initialData?.id);
      const computed = calculateAvailableSlots(date, selectedProfessional, otherApps, services, businessHours);
      setAvailableSlots(computed);
      if (isEdit && initialData?.professionalId === professionalId && initialData?.date === date) {
        const hasCurrentSlot = computed.some(s => s.time === initialData.time);
        if (!hasCurrentSlot && initialData.time) {
          setAvailableSlots(prev => [{ time: initialData.time, isAvailable: true }, ...prev].sort((a, b) => a.time.localeCompare(b.time)));
        }
      }
    } else {
      setAvailableSlots([]);
    }
  }, [date, professionalId, appointments, services, businessHours, initialData, isEdit, selectedProfessional]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !serviceId || !professionalId || !date || !time) return;
    onSave({ id: initialData?.id, clientId, serviceId, professionalId, date, time, notes, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        <ClientSelector clients={clients} selectedId={clientId} onChange={setClientId} onCreateClient={onCreateClient} />
        <ProfessionalSelector professionals={professionals} selectedId={professionalId} onChange={(id) => { setProfessionalId(id); setTime(''); }} />
        <ServiceSelector services={services} selectedId={serviceId} onChange={setServiceId} />
        <DatePickerInput selectedDate={date} onChange={(d) => { setDate(d); setTime(''); }} />
        {date && professionalId && <TimeSlotPicker slots={availableSlots} selectedTime={time} onChange={setTime} />}
        {isEdit && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs cursor-pointer">
              {['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada', 'Ausente', 'Reprogramada'].map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Notas</span>
          <textarea placeholder="Ej: corte en degrade..." value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs resize-none" />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--color-border)]">
        <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-xs text-zinc-300 font-semibold border border-zinc-800 cursor-pointer">Cancelar</button>
        <button type="submit" disabled={!clientId || !serviceId || !professionalId || !date || !time} className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-semibold disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer">Confirmar</button>
      </div>
    </form>
  );
}

function AppointmentDetailsModal({ appointment, onClose, onEdit, onDelete, onStatusChange }) {
  const { client = {}, professional = {}, service = {} } = appointment;
  return (
    <div className="space-y-4 text-left">
      <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-zinc-950/40 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: `hsl(${service.color || '262'} 80% 50%)` }} />
        <div className="flex items-start justify-between pl-1.5">
          <div>
            <span className="text-[8px] font-mono uppercase font-bold text-zinc-500">{service.category}</span>
            <h4 className="text-xs font-bold text-zinc-100">{service.name}</h4>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pl-1.5 border-t border-zinc-900/60 pt-2.5">
          <div>
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block">Fecha y Hora</span>
            <span className="text-[10px] font-mono font-bold text-zinc-200 block mt-0.5">{appointment.date} @ {appointment.time}</span>
          </div>
          <div>
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block">Precio</span>
            <span className="text-[10px] font-mono font-bold text-zinc-200 block mt-0.5">${service.price?.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 space-y-2 text-[10px]">
        <h5 className="font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900/50 pb-1">Cliente</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div><span className="text-zinc-500 block text-[7.5px]">Nombre</span><span className="font-bold text-zinc-300">{client.name}</span></div>
          <div><span className="text-zinc-500 block text-[7.5px]">Teléfono</span><span className="font-mono text-zinc-300">{client.phone}</span></div>
        </div>
      </div>
      <div className="p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center justify-between text-[10px]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">{professional.avatar}</div>
          <div>
            <span className="text-zinc-500 block text-[7.5px]">Barbero</span>
            <span className="font-bold text-zinc-300">{professional.name}</span>
          </div>
        </div>
      </div>
      {appointment.notes && (
        <div className="p-2.5 rounded bg-zinc-950/20 border border-zinc-900 text-[9px] text-zinc-400 leading-relaxed font-medium">
          <strong className="text-zinc-300 block mb-0.5">Indicaciones:</strong>
          {appointment.notes}
        </div>
      )}
      <div className="pt-2 border-t border-[var(--color-border)] space-y-3">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {['Completada', 'Confirmada', 'Ausente', 'Cancelada'].filter(st => st !== appointment.status).map(st => (
            <button key={st} onClick={() => onStatusChange(appointment.id, st)} className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[8px] font-bold text-zinc-300 cursor-pointer">
              {st}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center pt-1.5">
          <button onClick={() => onDelete(appointment.id)} className="px-3 py-1.5 rounded-xl bg-rose-950/15 border border-rose-900/30 text-rose-500 hover:bg-rose-600 hover:text-[var(--color-text)] text-[9px] font-bold cursor-pointer">Eliminar Cita</button>
          <div className="flex space-x-1.5">
            <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-zinc-900 text-xs text-zinc-300 font-semibold border border-zinc-800 cursor-pointer">Cerrar</button>
            <button onClick={() => onEdit(appointment)} className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-xs font-semibold cursor-pointer">Editar / Reagendar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentConfirmationModal({ appointment, onClose }) {
  const { client = {}, professional = {}, service = {} } = appointment;
  return (
    <div className="flex flex-col items-center justify-center p-3 text-center space-y-3.5">
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">¡Reserva Exitosa!</h4>
        <p className="text-[9px] text-zinc-500">Cita guardada en la agenda del barbero.</p>
      </div>
      <div className="w-full p-3.5 rounded-xl border border-[var(--color-border)] bg-zinc-950/45 text-left text-[9px] space-y-1.5 font-mono">
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-500 uppercase">Cliente</span><span className="font-bold text-zinc-300">{client.name}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-500 uppercase">Servicio</span><span className="font-bold text-zinc-300">{service.name}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-500 uppercase">Barbero</span><span className="font-bold text-zinc-300">{professional.name}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-500 uppercase">Fecha y Hora</span><span className="font-bold text-zinc-300">{appointment.date} @ {appointment.time}</span></div>
        <div className="flex justify-between pt-1"><span className="text-zinc-500 uppercase">Total</span><span className="font-bold text-[var(--color-primary)]">${service.price?.toFixed(2)}</span></div>
      </div>
      <button onClick={onClose} className="w-full py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-text)] text-[10px] font-semibold cursor-pointer">Volver al Calendario</button>
    </div>
  );
}

function AppointmentDeleteModal({ appointment, onConfirm, onClose }) {
  const { client = {} } = appointment;
  return (
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <div>
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Confirmar Borrado</h4>
        <p className="text-[9.5px] text-zinc-500 mt-1">¿Estás seguro de que deseas eliminar la cita del cliente <strong className="text-zinc-300">{client.name}</strong>?</p>
      </div>
      <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--color-border)]">
        <button onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-xs text-zinc-300 font-semibold border border-zinc-800 cursor-pointer">Cancelar</button>
        <button onClick={() => onConfirm(appointment.id)} className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[var(--color-text)] text-xs font-semibold cursor-pointer">Eliminar Cita</button>
      </div>
    </div>
  );
}

// ==========================================
// 5. COMPONENTE MAESTRO INTEGRADO (DEFAULT)
// ==========================================

export default function ModuloAgendamientoBarberia({ initialView = 'semana' }) {
  const { currentDate, currentView, handleNext, handlePrev, handleToday, handleViewChange, handleDateChange } = useCalendarNavigation(new Date(), initialView);
  const { businessHours, updateDayHours } = useBusinessHours();
  const { appointments, clients, professionals, services, addAppointment, updateAppointment, deleteAppointment, addClient } = useAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'Todos', professionalId: 'Todos', serviceId: 'Todos' });

  const [activeModal, setActiveModal] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [formInitialData, setFormInitialData] = useState(null);

  const filteredApps = useMemo(() => {
    const queryLower = searchQuery.toLowerCase().trim();
    return appointments.filter((app) => {
      if (queryLower) {
        const clientMatch = app.client?.name?.toLowerCase().includes(queryLower) || app.client?.phone?.includes(queryLower);
        const notesMatch = app.notes?.toLowerCase().includes(queryLower);
        const serviceMatch = app.service?.name?.toLowerCase().includes(queryLower);
        if (!clientMatch && !notesMatch && !serviceMatch) return false;
      }
      if (filters.professionalId !== 'Todos' && app.professionalId !== filters.professionalId) return false;
      if (filters.serviceId !== 'Todos' && app.serviceId !== filters.serviceId) return false;
      if (filters.status !== 'Todos' && app.status !== filters.status) return false;

      return true;
    });
  }, [appointments, searchQuery, filters]);

  const dayApps = useMemo(() => {
    return appointments.filter((app) => isSameDay(app.date, currentDate));
  }, [appointments, currentDate]);

  const dailyOcupationPercentage = useMemo(() => {
    const activeProf = professionals[0];
    if (!activeProf) return 0;
    const slots = calculateAvailableSlots(currentDate, activeProf, appointments, services, businessHours);
    const total = slots.length;
    const busy = slots.filter(s => !s.isAvailable).length;
    return total > 0 ? Math.round((busy / total) * 100) : 0;
  }, [appointments, currentDate, businessHours, professionals, services]);

  const freeSlotsCount = useMemo(() => {
    const activeProf = professionals[0];
    if (!activeProf) return 0;
    const slots = calculateAvailableSlots(currentDate, activeProf, appointments, services, businessHours);
    return slots.filter(s => s.isAvailable).length;
  }, [appointments, currentDate, businessHours, professionals, services]);

  const handleCardClick = (app) => {
    setSelectedApp(app);
    setActiveModal('details');
  };

  const handleStatusChange = (id, newStatus) => {
    updateAppointment(id, { status: newStatus });
    setSelectedApp((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
  };

  const handleAddAppointment = () => {
    setFormInitialData({
      date: formatDate(currentDate, 'yyyy-MM-dd'),
      time: '09:00',
      clientId: '',
      professionalId: professionals[0]?.id || '',
      serviceId: services[0]?.id || '',
      notes: ''
    });
    setActiveModal('form');
  };

  const handleEditAppointment = (app) => {
    setFormInitialData({
      id: app.id,
      clientId: app.clientId,
      serviceId: app.serviceId,
      professionalId: app.professionalId,
      date: app.date,
      time: app.time,
      notes: app.notes,
      status: app.status
    });
    setActiveModal('form');
  };

  const handleFormSave = (formData) => {
    let savedApp;
    if (formData.id) {
      updateAppointment(formData.id, formData);
      const client = clients.find(c => c.id === formData.clientId);
      const professional = professionals.find(p => p.id === formData.professionalId);
      const service = services.find(s => s.id === formData.serviceId);
      savedApp = { ...formData, client, professional, service };
    } else {
      const added = addAppointment(formData);
      const client = clients.find(c => c.id === added.clientId);
      const professional = professionals.find(p => p.id === added.professionalId);
      const service = services.find(s => s.id === added.serviceId);
      savedApp = { ...added, client, professional, service };
    }
    setSelectedApp(savedApp);
    setActiveModal('confirmation');
  };

  return (
    <div className="space-y-5 w-full text-[var(--color-text)]">
      {/* Sección Filtros Rápidos */}
      <div className="grid grid-cols-1 gap-3.5">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar reservas por cliente, nota o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-500 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={filters.professionalId}
            onChange={(e) => setFilters(prev => ({ ...prev, professionalId: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Barberos</option>
            {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filters.serviceId}
            onChange={(e) => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Servicios</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Estados</option>
            {['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada', 'Ausente'].map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        currentView={currentView}
        onNext={handleNext}
        onPrev={handlePrev}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onOpenSettings={() => setActiveModal('hours')}
        onAddAppointment={handleAddAppointment}
      />

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        <div className="lg:col-span-3 space-y-4">
          {currentView === 'dia' && (
            <AppointmentDayView
              currentDate={currentDate}
              appointments={filteredApps}
              businessHours={businessHours}
              professionals={professionals}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
              onAddAppointmentAtTime={(hour) => {
                setFormInitialData({
                  date: formatDate(currentDate, 'yyyy-MM-dd'),
                  time: hour,
                  clientId: '',
                  professionalId: professionals[0]?.id || '',
                  serviceId: services[0]?.id || '',
                  notes: ''
                });
                setActiveModal('form');
              }}
            />
          )}

          {currentView === 'semana' && (
            <AppointmentWeekView
              currentDate={currentDate}
              appointments={filteredApps}
              onCardClick={handleCardClick}
              onAddAppointmentAtDay={(d) => {
                setFormInitialData({
                  date: formatDate(d, 'yyyy-MM-dd'),
                  time: '09:00',
                  clientId: '',
                  professionalId: professionals[0]?.id || '',
                  serviceId: services[0]?.id || '',
                  notes: ''
                });
                setActiveModal('form');
              }}
            />
          )}

          {currentView === 'mes' && (
            <AppointmentMonthView
              currentDate={currentDate}
              appointments={filteredApps}
              onDateClick={(d) => {
                handleDateChange(d);
                handleViewChange('dia');
              }}
            />
          )}

          <CalendarLegend />
        </div>

        {/* Lateral */}
        <div className="lg:col-span-1 space-y-4">
          <AvailabilityIndicator percentage={dailyOcupationPercentage} freeCount={freeSlotsCount} />
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
            <AppointmentTimeline
              appointments={dayApps}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
              onAddClick={handleAddAppointment}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <TapShield isOpen={activeModal === 'form'} onClose={() => setActiveModal(null)} title={formInitialData?.id ? 'Editar Turno' : 'Nueva Reserva'}>
        <AppointmentForm
          initialData={formInitialData}
          clients={clients}
          professionals={professionals}
          services={services}
          appointments={appointments}
          businessHours={businessHours}
          onSave={handleFormSave}
          onClose={() => setActiveModal(null)}
          onCreateClient={addClient}
        />
      </TapShield>

      <TapShield isOpen={activeModal === 'details'} onClose={() => setActiveModal(null)} title="Detalles del Turno">
        {selectedApp && (
          <AppointmentDetailsModal
            appointment={selectedApp}
            onClose={() => setActiveModal(null)}
            onEdit={handleEditAppointment}
            onDelete={() => setActiveModal('delete')}
            onStatusChange={handleStatusChange}
          />
        )}
      </TapShield>

      <TapShield isOpen={activeModal === 'confirmation'} onClose={() => setActiveModal(null)} title="Reserva Completada">
        {selectedApp && <AppointmentConfirmationModal appointment={selectedApp} onClose={() => setActiveModal(null)} />}
      </TapShield>

      <TapShield isOpen={activeModal === 'delete'} onClose={() => setActiveModal(null)} title="Eliminar Turno">
        {selectedApp && (
          <AppointmentDeleteModal
            appointment={selectedApp}
            onConfirm={(id) => { deleteAppointment(id); setActiveModal(null); setSelectedApp(null); }}
            onClose={() => setActiveModal('details')}
          />
        )}
      </TapShield>

      <TapShield isOpen={activeModal === 'hours'} onClose={() => setActiveModal(null)} title="Jornada Laboral">
        <BusinessHoursEditor
          initialHours={businessHours}
          onSave={(hours) => {
            Object.keys(hours).forEach(day => updateDayHours(day, hours[day]));
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      </TapShield>
    </div>
  );
}
```

## 5. Origen
Origen: Creado desde cero como módulo maestro de reservas en PROTOTIPE Dev Studio.
Fecha: 2026-07-02
Versión: 1.0.0
