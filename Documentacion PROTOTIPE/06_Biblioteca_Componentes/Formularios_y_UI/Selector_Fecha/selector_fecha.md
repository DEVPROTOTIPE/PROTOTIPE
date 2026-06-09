# 📅 Selector de Fecha Premium (DatePicker)

Componente atómico de selección de fecha personalizado y animado que sustituye al selector nativo del navegador (`<input type="date">`). Se integra de forma reactiva con el sistema de temas HSL de marca y proporciona navegación fluida por meses, borrado rápido e inserción de la fecha actual.

---

## 🧭 Propósito y Casos de Uso
- **Configuración de Nóminas:** Permite elegir de forma visual y accesible el próximo día de pago de los empleados.
- **Registro de Gastos/Egresos:** Permite establecer la fecha exacta de vencimiento de los Pagos Fijos.
- **Modo Claro/Oscuro:** Adapta automáticamente sus colores y sombras en base a las variables globales HSL (`--color-primary`, `--color-bg`, `--color-surface`, etc.).

---

## 🎨 Especificación Visual y Estilos
- **Input Gatillo:** Botón plano con fondo `bg-surface-2`, borde `border-app` y el icono de calendario inyectado a la derecha.
- **Cuadrícula de Días:** Grid de 7 columnas (`DO` a `SA`) con bordes suaves, hover elástico y escalado sutil.
- **Día Seleccionado:** Fondo de color primario de marca (`bg-primary`), texto blanco y sombra difuminada (`shadow-primary/20`).
- **Día de Hoy:** Borde de color primario (`border-primary`), fondo translúcido (`bg-primary/5`) e indicador circular inferior.

---

## 💻 Código React Completo (100% Funcional)

```jsx
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Icons to make the component highly portable and free from hard dependencies
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
  </svg>
)

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
)

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS_OF_WEEK = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']

export default function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha', className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Parse the current value (YYYY-MM-DD) or default to today's date
  const selectedDate = useMemo(() => {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [value])

  // Calendar navigation state (current visible month and year)
  const [navDate, setNavDate] = useState(() => {
    return selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  })

  // Sync navDate when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setNavDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  const navMonth = navDate.getMonth()
  const navYear = navDate.getFullYear()

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    const firstDayOfMonth = new Date(navYear, navMonth, 1)
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 6 = Saturday
    const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate()

    // Pad days from the previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(navYear, navMonth, day))
    }

    return days
  }, [navMonth, navYear])

  // Close calendar on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick, { capture: true })
    document.addEventListener('touchstart', handleOutsideClick, { capture: true })
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, { capture: true })
      document.removeEventListener('touchstart', handleOutsideClick, { capture: true })
    }
  }, [isOpen])

  // Format display text
  const displayText = useMemo(() => {
    if (!selectedDate) return placeholder
    const day = selectedDate.getDate()
    const month = MONTHS[selectedDate.getMonth()].toLowerCase()
    const year = selectedDate.getFullYear()
    return `${day} de ${month} de ${year}`
  }, [selectedDate, placeholder])

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setNavDate(new Date(navYear, navMonth - 1, 1))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setNavDate(new Date(navYear, navMonth + 1, 1))
  }

  const handleSelectDay = (date, e) => {
    e.stopPropagation()
    if (!date) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
  }

  const handleToday = (e) => {
    e.stopPropagation()
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-sm text-app flex items-center justify-between hover:bg-surface-2/70 transition-colors focus:outline-none focus:border-primary text-left cursor-pointer"
      >
        <span className={value ? 'text-app font-medium' : 'text-muted'}>
          {displayText}
        </span>
        <div className="text-muted shrink-0 ml-2">
          <CalendarIcon />
        </div>
      </button>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 sm:right-auto sm:w-[320px] mt-2 bg-surface border border-app rounded-2xl shadow-2xl z-50 p-4 space-y-4 overflow-hidden"
          >
            {/* Header: Month & Year Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-app">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-app text-muted hover:text-app hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <ChevronLeft />
              </button>
              <span className="text-xs font-black text-app uppercase tracking-wider">
                {MONTHS[navMonth]} de {navYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-app text-muted hover:text-app hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Grid: Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[10px] font-bold text-muted uppercase tracking-widest py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Grid: Days of Month */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />
                }
                const selected = isSelected(day)
                const today = isToday(day)

                return (
                  <button
                    key={`day-${day.getTime()}`}
                    type="button"
                    onClick={(e) => handleSelectDay(day, e)}
                    className={`aspect-square w-full rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                      selected
                        ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-105'
                        : today
                          ? 'border border-primary text-primary bg-primary/5 hover:bg-primary/10'
                          : 'text-app hover:bg-surface-2'
                    }`}
                  >
                    {day.getDate()}
                    {today && !selected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-app gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-app hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 text-muted transition-colors cursor-pointer"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary-soft text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                Hoy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## 🛠️ Lógica de Estado y Ciclo de Vida
- **Cierre por Clic Externo:** Registra listeners globales en `document` para `mousedown` y `touchstart` con `{ capture: true }` para interceptar eventos antes de que los detenga Framer Motion u otros controles interactivos del negocio.
- **Sincronización:** Cuando la propiedad `value` cambia externamente, el mes mostrado se actualiza automáticamente para reflejar el mes del valor recibido.
