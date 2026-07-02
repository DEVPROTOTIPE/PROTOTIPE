<!--
{
  "technicalName": "DatePickerPremium",
  "targetPath": "src/components/ui/DatePickerPremium.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": [
    "wellness_podology",
    "technical_services",
    "refrigeration_ac",
    "contractors",
    "machinery_rental",
    "carpentry",
    "laundry",
    "furniture_repair",
    "alimentos-artesanales"
  ]
}
-->

# Selector de Fecha y Rangos Premium (`DatePickerPremium`)

Componente de calendario y selector de fechas/rangos de nivel premium. Diseñado con una interfaz moderna y elástica, soporte de presets dinámicos, navegación fluida de meses y consumo nativo de variables HSL del sistema de diseño para marca blanca.

---

## 1. Propósito y Casos de Uso
- **Selección de Fecha Única:** Ideal para fechas de entrega, cumpleaños, o asignación de citas individuales.
- **Selección de Rango de Fechas:** Diseñado para filtrado de reportes de ventas, comisiones o históricos en CRM.
- **Presets Rápidos:** Selección en un clic para periodos comunes (Hoy, Ayer, Últimos 7 Días, Este Mes).
- **Agnóstico y Portable:** Construido usando la API nativa de JavaScript `Date` sin dependencias de `moment.js` o `date-fns`.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Grid de Días:** Cuadrícula de 7 columnas con transiciones elásticas en hover y selección.
- **Modo Oscuro/Claro:** Transición fluida utilizando variables de CSS adaptativas (`var(--color-surface)`, `var(--color-border)`, `var(--color-text)`).
- **Estado de Rango:** Estilizado especial para el primer día (círculo sólido), el último día (círculo sólido) y los días intermedios (fondo semi-transparente con bordes suavizados).
- **Indicadores de Inactividad:** Días fuera del mes actual o bloqueados se renderizan con opacidad reducida (`opacity-35`) y puntero bloqueado (`pointer-events-none`).

---

## 3. Código React Completo

```jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';

// Iconos SVG en línea para portabilidad autónoma
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Presets comunes para selección de rangos
const PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'thisMonth', label: 'Este mes' },
  { id: 'lastMonth', label: 'Mes anterior' },
];

export default function DatePickerPremium({
  mode = 'single', // 'single' | 'range'
  value, // Date (para single) o { start: Date, end: Date } (para range)
  onChange,
  disabledPast = false,
  minDate = null,
  maxDate = null,
  placeholder = 'Selecciona una fecha...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Mes y Año en visualización
  const [currentDate, setCurrentDate] = useState(() => {
    if (mode === 'single' && value instanceof Date) return new Date(value);
    if (mode === 'range' && value?.start instanceof Date) return new Date(value.start);
    return new Date();
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Nombre de los meses y días en español
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegación de meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generación de la matriz del calendario
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Días del mes anterior para rellenar
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, totalDaysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Días del mes siguiente para rellenar la última fila de la rejilla
    const totalSlots = 42; // Rejilla fija de 6 filas x 7 días
    const nextMonthSlots = totalSlots - days.length;
    for (let i = 1; i <= nextMonthSlots; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Validadores de fechas deshabilitadas
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (disabledPast && d < today) return true;
    if (minDate && d < new Date(minDate).setHours(0, 0, 0, 0)) return true;
    if (maxDate && d > new Date(maxDate).setHours(0, 0, 0, 0)) return true;

    return false;
  };

  // Formateador visual
  const formatDateString = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const displayValue = useMemo(() => {
    if (mode === 'single') {
      return value instanceof Date ? formatDateString(value) : '';
    } else {
      if (value?.start instanceof Date && value?.end instanceof Date) {
        return `${formatDateString(value.start)} - ${formatDateString(value.end)}`;
      }
      if (value?.start instanceof Date) {
        return `${formatDateString(value.start)} - ...`;
      }
      return '';
    }
  }, [value, mode]);

  // Selección de fecha
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      onChange(new Date(date));
      setIsOpen(false);
    } else {
      // Flujo de Rango
      if (!value?.start || (value.start && value.end)) {
        onChange({ start: new Date(date), end: null });
      } else {
        const start = new Date(value.start);
        const end = new Date(date);
        
        if (end < start) {
          onChange({ start: end, end: start });
        } else {
          onChange({ start, end });
        }
      }
    }
  };

  // Validaciones del estado de selección
  const isDateSelected = (date) => {
    const d = new Date(date).setHours(0,0,0,0);

    if (mode === 'single') {
      return value instanceof Date && new Date(value).setHours(0,0,0,0) === d;
    } else {
      const start = value?.start instanceof Date ? new Date(value.start).setHours(0,0,0,0) : null;
      const end = value?.end instanceof Date ? new Date(value.end).setHours(0,0,0,0) : null;
      return (start && start === d) || (end && end === d);
    }
  };

  const isDateInRange = (date) => {
    if (mode !== 'range' || !value?.start || !value?.end) return false;
    const d = new Date(date).setHours(0,0,0,0);
    const start = new Date(value.start).setHours(0,0,0,0);
    const end = new Date(value.end).setHours(0,0,0,0);
    return d > start && d < end;
  };

  // Selección de presets
  const applyPreset = (presetId) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let start, end;

    switch (presetId) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onChange({ start, end });
    setCurrentDate(new Date(start));
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-sm ${className}`}>
      {/* Input de Control */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] hover:border-indigo-500/50 outline-none transition-all cursor-pointer shadow-sm min-h-[36px]"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-[var(--color-text-muted)] shrink-0"><CalendarIcon /></span>
          <span className={displayValue ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}>
            {displayValue || placeholder}
          </span>
        </div>
        <span className="text-[var(--color-text-muted)] transition-transform duration-250 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Calendario Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-[500px]">
          
          {/* Panel de Presets (Solo en Rango) */}
          {mode === 'range' && (
            <div className="p-3 bg-[var(--color-surface-2)]/60 border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 md:w-32">
              <span className="hidden md:block text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">Atajos rápidos</span>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="px-2 py-1.5 text-left rounded-lg text-[9px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0 whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Cuerpo del Calendario */}
          <div className="p-4 flex-1">
            {/* Header de Navegación */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[var(--color-text)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            {/* Cabeceras de Día */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_LABELS.map(day => (
                <span key={day} className="text-[9px] font-black uppercase text-[var(--color-text-muted)] py-0.5">
                  {day}
                </span>
              ))}
            </div>

            {/* Rejilla de Días */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, idx) => {
                const isSelected = isDateSelected(item.date);
                const isInRange = isDateInRange(item.date);
                const isDisabled = isDateDisabled(item.date);
                const isCurrentMonth = item.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(item.date)}
                    className={`relative aspect-square flex items-center justify-center text-[10px] rounded-lg cursor-pointer select-none font-bold transition-all focus:outline-none ${
                      !isCurrentMonth ? 'text-[var(--color-text-muted)] opacity-35' : 'text-[var(--color-text)]'
                    } ${
                      isSelected
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-500 rounded-lg scale-105 z-10'
                        : isInRange
                          ? 'bg-indigo-600/12 text-indigo-400 rounded-none'
                          : 'hover:bg-[var(--color-surface-2)]'
                    } ${
                      isDisabled ? 'opacity-20 pointer-events-none cross-through' : ''
                    }`}
                  >
                    <span>{item.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Lógica de Rango y Estados de Borde
1. **Selección del Primer Día (`start`):** Al hacer clic por primera vez, se inicializa el objeto `{ start: Date, end: null }`. Este día se renderiza en estado activo (`isSelected`).
2. **Selección del Segundo Día (`end`):** Si ya existe un `start` seleccionado y se hace clic en otro día:
   - Si la fecha del clic es **anterior** a `start`, la nueva fecha se convierte en `start` y la anterior en `end`.
   - Si la fecha del clic es **posterior** a `start`, se establece como `end`.
3. **Cálculo de Rejilla de Relleno:** El cálculo utiliza la fecha de fin del mes anterior y la fecha de inicio del mes siguiente para que la visualización del calendario sea siempre un bloque cuadrado balanceado de `42` días, garantizando que el diseño no experimente saltos de altura al navegar entre meses con diferente distribución.
