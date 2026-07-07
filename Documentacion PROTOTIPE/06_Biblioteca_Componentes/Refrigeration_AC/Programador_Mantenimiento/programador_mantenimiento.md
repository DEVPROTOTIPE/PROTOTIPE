<!--
{
  "resource": "ProgramadorMantenimientoPreventivo",
  "technicalName": "ProgramadorMantenimientoPreventivo",
  "targetPath": "src/components/common/ProgramadorMantenimientoPreventivo.jsx",
  "dependencies": {
    "npm": {
      "lucide-react": "^0.300.0"
    },
    "internal": [
      {
        "name": "CustomSelect",
        "path": "src/components/ui/CustomSelect.jsx"
      }
    ]
  },
  "niches": ["refrigeration_ac"],
  "type": "component"
}
-->

# Programador de Mantenimiento Preventivo (`ProgramadorMantenimientoPreventivo`)

Este componente proporciona una interfaz premium para agendar visitas de mantenimiento preventivo de aires acondicionados, seleccionando la frecuencia de servicio, fecha y rango de hora.

## 1. Propósito y Casos de Uso
* **Fidelización de Clientes:** Para que los usuarios contraten pólizas anuales de limpieza de serpentines e inspección de amperaje.
* **Agendamiento Técnico:** Herramienta interna de call centers o apps de técnicos para agendar y planificar rutas de servicio de mantenimiento.

## 2. Especificación Visual y Estilos (Tailwind CSS)
* **Selectores Premium:** Consumo obligatorio de `CustomSelect` para elegir la frecuencia de las visitas y la franja horaria.
* **Sección de Alertas (useAlertConfirm):** Sistema de confirmación en la limpieza del formulario para mitigar errores accidentales.
* **HSL Adaptativo:** Integración fluida con el tema gráfico del dev-dashboard.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import DatePickerPremium from '../ui/DatePickerPremium';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function ProgramadorMantenimientoPreventivo({
  onSchedule = null,
  frequencyOptions = [
    { value: 'monthly', label: 'Mensual (Recomendado para locales comerciales)' },
    { value: 'quarterly', label: 'Trimestral (Uso comercial medio)' },
    { value: 'semiannual', label: 'Semestral (Residencial alto uso)' },
    { value: 'annual', label: 'Anual (Residencial bajo/medio uso)' }
  ],
  timeSlots = [
    { value: 'morning_1', label: 'Mañana (8:00 AM - 12:00 PM)' },
    { value: 'afternoon_1', label: 'Tarde Temprana (12:00 PM - 4:00 PM)' },
    { value: 'afternoon_2', label: 'Tarde Tardía (4:00 PM - 7:00 PM)' }
  ]
}) {
  const [frequency, setFrequency] = useState(frequencyOptions[2].value);
  const [date, setDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState(timeSlots[0].value);
  const [comments, setComments] = useState('');
  const [equipmentsCount, setEquipmentsCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const confirm = useAlertConfirm();

  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Limpiar Formulario',
      message: '¿Estás seguro de que deseas limpiar la información ingresada?',
      variant: 'warning',
      confirmText: 'Limpiar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setFrequency(frequencyOptions[2].value);
      setDate('');
      setTimeSlot(timeSlots[0].value);
      setComments('');
      setEquipmentsCount(1);
      setSubmitted(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSchedule) {
      onSchedule({
        frequency,
        date,
        timeSlot,
        comments,
        equipmentsCount
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-green-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
        <CheckCircle2 size={48} className="text-green-500 mb-3 animate-scaleIn" />
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Mantenimiento Programado</h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-6 max-w-xs">
          Hemos registrado la visita técnica. Recibirás una notificación con la confirmación de la ruta técnica.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 cursor-pointer"
        >
          Programar Otra Visita
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Calendar size={16} className="text-[var(--color-primary)]" />
        <span>Programador de Mantenimiento HVAC</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Reserva visitas preventivas periódicas para prolongar la vida útil de tus equipos de climatización.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Frecuencia y Cantidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Frecuencia de Servicio</label>
            <CustomSelect
              value={frequency}
              onChange={setFrequency}
              options={frequencyOptions}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Número de Equipos</label>
            <input
              type="number"
              value={equipmentsCount}
              onChange={(e) => setEquipmentsCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              min="1"
              required
            />
          </div>
        </div>

        {/* Fecha y Franja Horaria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Fecha de Primera Visita</label>
            <DatePickerPremium
              value={date}
              onChange={setDate}
              placeholder="Seleccionar fecha..."
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Franja Horaria Preferida</label>
            <CustomSelect
              value={timeSlot}
              onChange={setTimeSlot}
              options={timeSlots}
            />
          </div>
        </div>

        {/* Comentarios o Detalles Técnicos */}
        <div>
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Modelos / Ubicación / Novedades</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Ej: Aire acondicionado de 12k BTU ubicado en segundo piso de oficinas..."
            className="w-full h-20 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none resize-none"
          />
        </div>

        {/* Botones de Envío y Limpieza */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 h-10 border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Limpiar Datos
          </button>
          <button
            type="submit"
            className="flex-1 h-10 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={14} />
            <span>Programar Póliza</span>
          </button>
        </div>
      </form>
    </div>
  );
}
