import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Users, Plus, Trash2, User, Save, Loader2, Paintbrush, QrCode, Download, Printer, Copy, CheckCircle2, ChevronDown, CalendarDays } from 'lucide-react'
import { PORTAL_CONFIG } from '../../../../constants'
import { updateAppConfig } from '../../../../services/appConfigService'
import { formatCurrency } from '../../../../utils/formatters'
import QRCode from 'qrcode'

// ─── CUSTOM DATE PICKER COMPONENT ────────────────────────────────────────
const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function CustomDatePicker({ value, onChange, placeholder = 'Seleccionar fecha' }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const today = new Date()
  const selected = value ? new Date(value + 'T12:00:00') : null

  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth())

  const display = selected
    ? `${String(selected.getDate()).padStart(2,'0')}/${String(selected.getMonth()+1).padStart(2,'0')}/${selected.getFullYear()}`
    : ''

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectDay = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onChange({ target: { value: `${viewYear}-${mm}-${dd}` } })
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isSelected = (d) => selected &&
    selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear
  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear

  const calendar = (
    open && (
      <>
        {/* Overlay oscuro */}
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 9998,
          }}
        />
        {/* Contenedor centrador */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              width: 'min(320px, calc(100vw - 32px))',
              background: 'var(--color-surface)',
              borderRadius: '1.25rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 80px -10px rgba(0,0,0,0.35)',
              padding: '1.25rem',
            }}
          >
            <div className="text-center mb-1">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Seleccionar fecha</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-all active:scale-90"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <ChevronDown size={18} className="rotate-90" />
              </button>
              <span className="text-base font-bold text-app">
                {MONTHS_ES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-all active:scale-90"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <ChevronDown size={18} className="-rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS_ES.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-muted py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => (
                <div key={i} className="flex items-center justify-center">
                  {d ? (
                    <button
                      type="button"
                      onClick={() => selectDay(d)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all active:scale-90
                        ${isSelected(d)
                          ? 'text-white shadow-md'
                          : isToday(d)
                          ? 'font-bold ring-2'
                          : 'text-app hover:opacity-80'
                        }
                      `}
                      style={
                        isSelected(d)
                          ? { background: 'var(--color-primary)' }
                          : isToday(d)
                          ? { ringColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }
                          : { background: 'transparent' }
                      }
                    >
                      {d}
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-app">
              <button
                type="button"
                onClick={() => { onChange({ target: { value: '' } }); setOpen(false) }}
                className="text-xs text-muted font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                style={{ background: 'var(--color-surface-2)' }}
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = new Date()
                  const mm = String(t.getMonth()+1).padStart(2,'0')
                  const dd = String(t.getDate()).padStart(2,'0')
                  onChange({ target: { value: `${t.getFullYear()}-${mm}-${dd}` } })
                  setOpen(false)
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all active:scale-95"
                style={{ background: 'var(--color-primary)' }}
              >
                Hoy
              </button>
            </div>
          </div>
        </div>
      </>
    )
  )

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-sm font-medium flex items-center transition-colors cursor-pointer relative"
        style={{
          color: display ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderColor: open ? 'var(--color-primary)' : undefined
        }}
      >
        {display || <span style={{ color: 'var(--color-text-muted)' }}>{placeholder}</span>}
        <span className={`absolute right-3 transition-colors ${open ? 'text-primary' : 'text-muted'}`}>
          <CalendarDays size={16} />
        </span>
      </button>
      {open && ReactDOM.createPortal(calendar, document.body)}
    </div>
  )
}

// ─── CUSTOM SELECT COMPONENT ──────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative w-full" style={{ zIndex: open ? 50 : 'auto' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer flex items-center justify-between"
        style={{ borderColor: open ? 'var(--color-primary)' : undefined }}
      >
        <span className={selected ? 'text-app' : 'text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`absolute right-3 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} />
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 48 }} onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 mt-1 rounded-xl border border-app overflow-hidden shadow-xl"
            style={{ zIndex: 49, background: 'var(--color-surface)' }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2
                  ${opt.value === value
                    ? 'bg-primary text-white font-bold'
                    : 'text-app hover:bg-surface-2'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── PORTAL QR CARD COMPONENT ─────────────────────────────────────────────
function PortalQRCard({ cfg, employeeCount, baseUrl }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const qrUrl = `${baseUrl}${cfg.authRoute}`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, qrUrl, {
      width: 140,
      margin: 2,
      color: { dark: '#0f0f1a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).catch(console.error)
  }, [qrUrl])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `QR-${cfg.labelCorto.toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }, [cfg.labelCorto])

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR ${cfg.label}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
                   align-items: center; justify-content: center; min-height: 100vh; margin: 0;
                   background: #fff; }
            .qr-print-container { text-align: center; padding: 2rem; }
            .qr-print-emoji { font-size: 3rem; margin-bottom: 0.5rem; }
            h1 { font-size: 1.5rem; font-weight: 900; margin: 0.5rem 0; color: #0f172a; }
            p { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 1.5rem; }
            img { display: block; margin: 0 auto; border: 3px solid #e2e8f0; border-radius: 1rem; padding: 0.5rem; }
            small { display: block; margin-top: 1.5rem; color: #94a3b8; font-size: 0.75rem; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          <div class="qr-print-container">
            <div class="qr-print-emoji">${cfg.emoji}</div>
            <h1>${cfg.label}</h1>
            <p>Escanea este código para ingresar al portal</p>
            <img src="${canvas.toDataURL()}" width="260" height="260" />
            <small>${qrUrl}</small>
          </div>
        </body>
      </html>
    `)
    win.document.close()
  }, [cfg, qrUrl])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback */ }
  }, [qrUrl])

  return (
    <div className="qr-card" style={{ borderColor: cfg.colorBorder, background: cfg.colorBg + '33', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 mb-2 w-full justify-start text-left">
        <span className="text-xl">{cfg.emoji}</span>
        <div>
          <h4 className="text-xs font-bold text-app" style={{ color: cfg.color }}>{cfg.label}</h4>
          <span className="text-[10px] text-muted flex items-center gap-1">
            <Users size={10} /> {employeeCount} {employeeCount === 1 ? 'activo' : 'activos'}
          </span>
        </div>
      </div>
      <div className="qr-canvas-wrapper p-1.5 bg-white border border-app rounded-lg mb-2 flex justify-center">
        <canvas ref={canvasRef} style={{ width: '100px', height: '100px' }} />
      </div>
      <div className="qr-card-actions grid grid-cols-3 gap-1 w-full">
        <button onClick={handleDownload} className="qr-action-btn flex items-center justify-center p-1 rounded-lg border text-[10px] gap-1 hover:bg-surface-2 transition-colors border-app bg-surface" title="Descargar PNG">
          <Download size={11} /> PNG
        </button>
        <button onClick={handlePrint} className="qr-action-btn flex items-center justify-center p-1 rounded-lg border text-[10px] gap-1 hover:bg-surface-2 transition-colors border-app bg-surface" title="Imprimir">
          <Printer size={11} /> Print
        </button>
        <button onClick={handleCopy} className="qr-action-btn flex items-center justify-center p-1 rounded-lg border text-[10px] gap-1 hover:bg-surface-2 transition-colors border-app bg-surface" title="Copiar URL">
          {copied ? <CheckCircle2 size={11} className="text-success" /> : <Copy size={11} />}
          {copied ? 'Listo' : 'Link'}
        </button>
      </div>
    </div>
  )
}

// ─── EMPLOYEE FORM CARD COMPONENT ─────────────────────────────────────────
function EmployeeFormCard({ editEmp, setEditEmployee, onSuccess, onError }) {
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('vendedor')
  const [pin, setPin] = useState('')
  const [telefono, setTelefono] = useState('')
  const [salario, setSalario] = useState(0)
  const [frecuenciaPago, setFrecuenciaPago] = useState('quincenal')
  const [fechaPago, setFechaPago] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editEmp) {
      setNombre(editEmp.nombre || '')
      setRol(editEmp.rol || 'vendedor')
      setPin(editEmp.pin || '')
      setTelefono(editEmp.telefono || '')
      setSalario(editEmp.salario || 0)
      setFrecuenciaPago(editEmp.frecuenciaPago || 'quincenal')
      setFechaPago(editEmp.fechaPago || '')
      setObservaciones(editEmp.observaciones || '')
      setActivo(editEmp.activo !== false)
    } else {
      setNombre('')
      setRol('vendedor')
      setPin('')
      setTelefono('')
      setSalario(0)
      setFrecuenciaPago('quincenal')
      setFechaPago('')
      setObservaciones('')
      setActivo(true)
    }
  }, [editEmp])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return onError('El nombre es obligatorio.')
    if (!pin.trim()) return onError('El código PIN es obligatorio.')
    if (pin.length !== 6 || isNaN(Number(pin))) {
      return onError('El PIN debe ser un número de exactamente 6 dígitos.')
    }

    setLoading(true)
    try {
      const { saveEmployee } = await import('../../../../services/employeeService')
      const payload = {
        id: editEmp?.id,
        nombre: nombre.trim(),
        rol,
        pin: pin.trim(),
        telefono: telefono.trim(),
        salario: Number(salario) || 0,
        frecuenciaPago,
        fechaPago,
        observaciones: observaciones.trim(),
        activo,
        createdAt: editEmp?.createdAt || null
      }
      await saveEmployee(payload)
      onSuccess(editEmp ? 'Empleado actualizado correctamente.' : 'Empleado creado correctamente.')
      setEditEmployee(null)
    } catch (err) {
      console.error(err)
      onError('Error al guardar el empleado.')
    } finally {
      setLoading(false)
    }
  }

  const rolOptions = Object.entries(PORTAL_CONFIG).map(([key, cfg]) => ({
    value: key,
    label: `${cfg.emoji} ${cfg.labelCorto} (${cfg.label})`
  }))

  const frecuenciaOptions = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'semanal', label: 'Semanal' }
  ]

  return (
    <form onSubmit={handleSave} className="p-5 rounded-2xl border border-app bg-surface-2 space-y-4 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-app pb-3">
        <p className="text-sm font-bold text-app flex items-center gap-1.5">
          <User size={16} className="text-primary" />
          {editEmp ? 'Editar Perfil de Empleado' : 'Registrar Nuevo Empleado'}
        </p>
        {editEmp && (
          <button
            type="button"
            onClick={() => setEditEmployee(null)}
            className="text-xs text-muted hover:text-app hover:underline font-medium"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Nombre Completo *</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Teléfono Móvil (WhatsApp)</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej. +573001234567"
            className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Rol Operativo (Portal) *</label>
          <CustomSelect
            value={rol}
            onChange={setRol}
            options={rolOptions}
            placeholder="Seleccionar rol"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Código PIN Táctil (6 dígitos) *</label>
          <input
            type="password"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Ej. 123456"
            className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors tracking-widest font-mono"
          />
        </div>

        <div className="p-3 bg-surface rounded-xl border border-app space-y-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Configuración de Nómina y Salario</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-muted mb-1">Salario Fijo</label>
              <input
                type="number"
                min="0"
                value={salario || ''}
                onChange={(e) => setSalario(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="Monto"
                className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-app text-xs text-app focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted mb-1">Frecuencia</label>
              <CustomSelect
                value={frecuenciaPago}
                onChange={setFrecuenciaPago}
                options={frecuenciaOptions}
                placeholder="Frecuencia"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted mb-1">Próxima Fecha de Pago</label>
            <CustomDatePicker
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              placeholder="Próximo día de pago"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Observaciones / Datos adicionales</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Detalles sobre el turno, horario, etc..."
            className="w-full min-h-[60px] p-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {editEmp ? 'Actualizar Datos de Empleado' : 'Registrar y Guardar Empleado'}
      </button>
    </form>
  )
}

// ─── MAIN EMPLOYEE SETTINGS COMPONENT ─────────────────────────────────────
export default function EmployeeSettings({ formData, setFormData, setSaveMessage, user, config }) {
  const [dbEmployees, setDbEmployees] = useState([])
  const [editEmployeeState, setEditEmployeeState] = useState(null)

  useEffect(() => {
    if (config.isLoaded && user) {
      let unsub = null
      let active = true
      import('../../../../services/employeeService').then(({ subscribeToEmployees }) => {
        if (active) {
          unsub = subscribeToEmployees(setDbEmployees)
        }
      }).catch(console.error)
      return () => {
        active = false
        if (unsub) unsub()
      }
    }
  }, [config.isLoaded, user])

  const handleToggleModule = async (e) => {
    const checked = e.target.checked
    setFormData({ ...formData, hasMultipleEmployees: checked })
    try {
      await updateAppConfig({ hasMultipleEmployees: checked })
      setSaveMessage({ type: 'success', text: checked ? 'Módulo de empleados activado.' : 'Módulo de empleados desactivado.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Error al cambiar estado del módulo.' })
    }
  }

  return (
    <div className="bg-surface rounded-3xl border border-app shadow-sm flex flex-col relative text-left">
      <div className="p-5 sm:p-6 space-y-6">
        {/* Interruptor Principal */}
        <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app shadow-sm">
          <div>
            <p className="text-sm font-bold text-app">Múltiples Empleados</p>
            <p className="text-xs text-muted mt-0.5">Activa esta opción si tu negocio cuenta con personal operativo o de ventas</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input type="checkbox" className="sr-only peer"
              checked={formData.hasMultipleEmployees}
              onChange={handleToggleModule} />
            <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>

        {formData.hasMultipleEmployees && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA IZQUIERDA: Listado de Empleados */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  Personal Registrado ({dbEmployees.length})
                </p>
                <button
                  onClick={() => {
                    document.getElementById('emp-form-card')?.scrollIntoView({ behavior: 'smooth' })
                    setEditEmployeeState(null)
                  }}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus size={12} /> Nuevo Empleado
                </button>
              </div>

              {dbEmployees.length === 0 ? (
                <div className="p-6 bg-surface-2/40 rounded-2xl border border-dashed border-app text-center">
                  <Users size={32} className="mx-auto text-muted/50 mb-2" />
                  <p className="text-sm font-semibold text-app">No hay empleados registrados</p>
                  <p className="text-xs text-muted mt-1">Usa el formulario lateral para agregar tu primer empleado.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {dbEmployees.map((emp) => {
                    const portal = PORTAL_CONFIG[emp.rol] || { emoji: '👤', labelCorto: emp.rol, color: 'var(--color-primary)' }
                    return (
                      <div
                        key={emp.id}
                        className={`p-4 bg-surface-2/70 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          editEmployeeState?.id === emp.id ? 'border-primary ring-1 ring-primary' : 'border-app hover:border-app-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg border border-app shrink-0 shadow-sm">
                            {portal.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-app">{emp.nombre}</p>
                              {!emp.activo && (
                                <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-1.5 py-0.5 rounded-full">Inactivo</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-xs text-muted">
                              <span className="font-medium" style={{ color: portal.color }}>
                                {portal.labelCorto}
                              </span>
                              <span>•</span>
                              <span>PIN: <strong className="text-app tracking-widest">{emp.pin}</strong></span>
                              <span>•</span>
                              <span>{formatCurrency(emp.salario)} ({emp.frecuenciaPago})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-app">
                          <button
                            onClick={async () => {
                              try {
                                const nextActive = !emp.activo
                                const { toggleEmployeeStatus } = await import('../../../../services/employeeService')
                                await toggleEmployeeStatus(emp.id, nextActive)
                                setSaveMessage({ type: 'success', text: `Empleado ${nextActive ? 'activado' : 'desactivado'} correctamente.` })
                                setTimeout(() => setSaveMessage(null), 2500)
                              } catch (err) {
                                setSaveMessage({ type: 'error', text: 'Error al cambiar estado.' })
                              }
                            }}
                            className={`h-7 px-2.5 rounded-lg font-bold text-[10px] border flex items-center justify-center gap-1 transition-all ${
                              emp.activo 
                                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' 
                                : 'bg-surface border-app text-muted hover:bg-surface-2'
                            }`}
                          >
                            {emp.activo ? 'Activo' : 'Inactivo'}
                          </button>

                          <button
                            onClick={() => {
                              setEditEmployeeState(emp)
                              document.getElementById('emp-form-card')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="w-8 h-8 rounded-lg bg-surface border border-app hover:border-app-hover flex items-center justify-center text-muted hover:text-app transition-colors shadow-sm"
                            title="Editar empleado"
                          >
                            <Paintbrush size={14} />
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm(`¿Estás seguro de eliminar a ${emp.nombre}? Esta acción no se puede deshacer.`)) {
                                try {
                                  const { deleteEmployee } = await import('../../../../services/employeeService')
                                  await deleteEmployee(emp.id)
                                  setSaveMessage({ type: 'success', text: 'Empleado eliminado correctamente.' })
                                  setTimeout(() => setSaveMessage(null), 2500)
                                  if (editEmployeeState?.id === emp.id) {
                                    setEditEmployeeState(null)
                                  }
                                } catch (err) {
                                  setSaveMessage({ type: 'error', text: 'Error al eliminar.' })
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors shadow-sm"
                            title="Eliminar empleado"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Formulario Crear / Editar */}
            <div id="emp-form-card" className="lg:col-span-5">
              <EmployeeFormCard
                editEmp={editEmployeeState}
                setEditEmployee={setEditEmployeeState}
                onSuccess={(msg) => {
                  setSaveMessage({ type: 'success', text: msg })
                  setTimeout(() => setSaveMessage(null), 3000)
                }}
                onError={(msg) => {
                  setSaveMessage({ type: 'error', text: msg })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {formData.hasMultipleEmployees && (
        <div className="p-5 border-t border-app bg-surface-2/30">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <QrCode size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-app">Códigos QR de Acceso Operativo</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Los empleados pueden escanear estos códigos QR para ser redirigidos directamente al lobby táctil de su respectivo rol sin navegar por la web pública.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {Object.entries(PORTAL_CONFIG).map(([rol, cfg]) => {
                const count = dbEmployees.filter(e => e.rol === rol && e.activo !== false).length
                return (
                  <PortalQRCard
                    key={rol}
                    cfg={cfg}
                    employeeCount={count}
                    baseUrl={window.location.origin}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
