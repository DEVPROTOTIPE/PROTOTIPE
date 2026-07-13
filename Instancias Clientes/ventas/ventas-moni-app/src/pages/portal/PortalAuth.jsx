/**
 * PortalAuth.jsx
 * Autenticación de empleados por PIN para el sistema de portales operativos.
 *
 * Flujo de 2 pasos:
 *   Paso 1 → Selector de empleados (filtrado por ?rol= si viene de un QR)
 *   Paso 2 → Teclado PIN del empleado seleccionado
 *
 * Soporta acceso genérico (sin QR) mostrando selector de roles primero.
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Loader2, AlertCircle, ChevronLeft, User, Users } from 'lucide-react'
import { authenticateEmployeeByIdAndPin, subscribeToEmployeesByRole, subscribeToEmployees } from '../../services/employeeService'
import { logLogin } from '../../services/accessLogService'
import usePortalStore from '../../store/portalStore'
import useAppConfigStore from '../../store/appConfigStore'
import { ROLES, PORTAL_CONFIG } from '../../constants'

const ROLE_ROUTES = Object.fromEntries(
  Object.entries(PORTAL_CONFIG).map(([rol, cfg]) => [rol, cfg.route])
)

export default function PortalAuth() {
  const [searchParams] = useSearchParams()
  const rolParam = searchParams.get('rol') // viene del QR: ?rol=vendedor
  const nav = useNavigate()

  // Step: 'role-select' | 'employee-select' | 'pin'
  const [step, setStep] = useState(rolParam ? 'employee-select' : 'role-select')
  const [selectedRol, setSelectedRol] = useState(rolParam || null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [allDbEmployees, setAllDbEmployees] = useState([])
  const [loadingEmps, setLoadingEmps] = useState(false)

  const [pin, setPin]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-failed-attempts')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [lockouts, setLockouts] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-lockouts')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [secondsLeft, setSecondsLeft] = useState(0)

  const { setPortalEmployee } = usePortalStore()
  const { appName, appIcon, hasMultipleEmployees, rolesOperativosEnabled } = useAppConfigStore()

  if (!rolesOperativosEnabled) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="relative bg-surface rounded-3xl shadow-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center border border-[var(--color-border)]/50">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
            <Users size={32} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-app">Portales Inactivos</h2>
          <p className="text-xs text-muted leading-relaxed">
            El ingreso a los portales de trabajo para empleados está deshabilitado temporalmente por el administrador.
          </p>
        </div>
      </div>
    )
  }

  // Suscribirse a todos los empleados de la base de datos para filtrado condicional en el step 0
  useEffect(() => {
    let unsub
    import('../../services/employeeService').then(({ subscribeToEmployees }) => {
      unsub = subscribeToEmployees(setAllDbEmployees)
    }).catch(console.error)
    return () => { if (unsub) unsub() }
  }, [])

  // Carga de empleados cuando se selecciona un rol
  useEffect(() => {
    if (!selectedRol) return
    setLoadingEmps(true)
    const unsub = subscribeToEmployeesByRole(selectedRol, (data) => {
      setEmployees(data)
      setLoadingEmps(false)
    })
    return () => unsub()
  }, [selectedRol])

  // Efecto para verificar bloqueo activo del empleado seleccionado
  useEffect(() => {
    if (step !== 'pin' || !selectedEmployee) return
    const checkLockout = () => {
      const lockUntil = lockouts[selectedEmployee.id] || 0
      const diff = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    checkLockout()
    const timer = setInterval(checkLockout, 1000)
    return () => clearInterval(timer)
  }, [step, selectedEmployee, lockouts])

  const handleSelectRole = (rol) => {
    setSelectedRol(rol)
    setStep('employee-select')
    setError('')
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp)
    setStep('pin')
    setPin('')
    setError('')
  }

  const handleBack = () => {
    if (step === 'pin') {
      setStep('employee-select')
      setPin('')
      setError('')
    } else if (step === 'employee-select') {
      if (!rolParam) {
        setStep('role-select')
        setSelectedRol(null)
        setEmployees([])
      }
    }
  }

  const handleKey = useCallback((digit) => {
    if (secondsLeft > 0) return
    setError('')
    if (pin.length < 6) setPin(p => p + digit)
  }, [pin, secondsLeft])

  const handleDelete = () => {
    if (secondsLeft > 0) return
    setError('')
    setPin(p => p.slice(0, -1))
  }

  const handleSubmit = async () => {
    if (secondsLeft > 0) return
    if (pin.length !== 6) { setError('El PIN debe tener exactamente 6 dígitos'); return }
    setLoading(true)
    try {
      const employee = await authenticateEmployeeByIdAndPin(selectedEmployee.id, pin)
      if (!employee) {
        const currentFailed = (failedAttempts[selectedEmployee.id] || 0) + 1
        const newFailedAttempts = { ...failedAttempts, [selectedEmployee.id]: currentFailed }
        
        setFailedAttempts(newFailedAttempts)
        localStorage.setItem('portal-failed-attempts', JSON.stringify(newFailedAttempts))
        
        if (currentFailed >= 3) {
          const lockoutUntil = Date.now() + 30000 // 30 segundos
          const newLockouts = { ...lockouts, [selectedEmployee.id]: lockoutUntil }
          setLockouts(newLockouts)
          localStorage.setItem('portal-lockouts', JSON.stringify(newLockouts))
          setError('Demasiados intentos fallidos. Bloqueado por 30 segundos.')
          
          const resetFailedAttempts = { ...newFailedAttempts, [selectedEmployee.id]: 0 }
          setFailedAttempts(resetFailedAttempts)
          localStorage.setItem('portal-failed-attempts', JSON.stringify(resetFailedAttempts))
        } else {
          setError(`PIN incorrecto. Intentos restantes: ${3 - currentFailed}`)
        }
        setPin('')
      } else {
        const newFailedAttempts = { ...failedAttempts, [selectedEmployee.id]: 0 }
        setFailedAttempts(newFailedAttempts)
        localStorage.setItem('portal-failed-attempts', JSON.stringify(newFailedAttempts))
        const logId = await logLogin(employee)
        setPortalEmployee(employee, logId)
        nav(ROLE_ROUTES[employee.rol] || '/portal/vendedor', { replace: true })
      }
    } catch (e) {
      console.error(e)
      setError('Error de conexión. Verifica tu red.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasMultipleEmployees) {
    return (
      <div className="portal-auth-page">
        <div className="portal-auth-card">
          <div className="portal-auth-brand">
            <div className="portal-auth-logo-placeholder">❌</div>
            <h2 className="portal-auth-title">Acceso Deshabilitado</h2>
            <p className="portal-auth-subtitle">El sistema de portales operativos no está activo</p>
          </div>
          <p className="text-center text-xs text-muted leading-relaxed max-w-[280px] text-white/50">
            Por favor, ponte en contacto con el administrador para habilitar este módulo en los ajustes de la tienda.
          </p>
          <button onClick={() => nav('/')} className="portal-success-btn h-11 text-xs" style={{ background: 'var(--color-primary)' }}>
            Volver a la Tienda
          </button>
        </div>
      </div>
    )
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']
  const portalCfg = selectedRol ? PORTAL_CONFIG[selectedRol] : null

  return (
    <div className="portal-auth-page">
      <div className="portal-auth-card">

        {/* ─── Cabecera de marca ──────────────────────────────────────── */}
        <div className="portal-auth-brand">
          {appIcon
            ? <img src={appIcon} alt="logo" className="portal-auth-logo" />
            : <div className="portal-auth-logo-placeholder">{appName?.charAt(0) || 'A'}</div>
          }
          <h1 className="portal-auth-title">{appName}</h1>
          <p className="portal-auth-subtitle">
            {step === 'role-select'  && 'Selecciona tu portal'}
            {step === 'employee-select' && (portalCfg ? `${portalCfg.emoji} ${portalCfg.label}` : 'Selecciona tu empleado')}
            {step === 'pin' && `Hola, ${selectedEmployee?.nombre?.split(' ')[0]} — ingresa tu PIN`}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── PASO 0: Selector de rol (acceso genérico sin QR) ──── */}
          {step === 'role-select' && (
            <motion.div key="role-select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="portal-auth-roles-grid">
              {allDbEmployees.length === 0 ? (
                <div className="portal-auth-loading">
                  <Loader2 size={24} className="animate-spin text-primary mr-2" />
                  <span>Cargando portales...</span>
                </div>
              ) : (
                Object.entries(PORTAL_CONFIG)
                  .filter(([rol]) => allDbEmployees.some(emp => emp.rol === rol && emp.activo !== false))
                  .map(([rol, cfg]) => (
                    <button key={rol} onClick={() => handleSelectRole(rol)} className="portal-auth-role-btn"
                      style={{ background: cfg.colorBg, borderColor: cfg.colorBorder }}>
                      <span className="portal-auth-role-emoji">{cfg.emoji}</span>
                      <span className="portal-auth-role-label">{cfg.labelCorto}</span>
                    </button>
                  ))
              )}
              {allDbEmployees.length > 0 && allDbEmployees.filter(emp => emp.activo !== false).length === 0 && (
                <div className="text-center p-6 text-xs text-muted w-full col-span-2">
                  <p className="font-semibold text-app mb-1">Sin personal registrado</p>
                  <p>Por favor, registra empleados en el panel de administración para habilitar portales.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PASO 1: Selector de empleado filtrado por rol ────────── */}
          {step === 'employee-select' && (
            <motion.div key="employee-select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="portal-auth-emp-list">
              {loadingEmps ? (
                <div className="portal-auth-loading"><Loader2 size={24} className="animate-spin" /><span>Cargando...</span></div>
              ) : employees.length === 0 ? (
                <div className="portal-auth-no-emps">
                  <Users size={36} />
                  <p>Sin empleados activos en este portal</p>
                  <small>El administrador debe agregarlos en Ajustes</small>
                </div>
              ) : employees.map(emp => (
                <button key={emp.id} onClick={() => handleSelectEmployee(emp)} className="portal-auth-emp-btn">
                  <div className="portal-auth-emp-avatar" style={{ background: portalCfg?.colorBg, borderColor: portalCfg?.colorBorder }}>
                    {emp.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="portal-auth-emp-info">
                    <span className="portal-auth-emp-name">{emp.nombre}</span>
                    {emp.telefono && <span className="portal-auth-emp-phone">{emp.telefono}</span>}
                  </div>
                  <User size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                </button>
              ))}
            </motion.div>
          )}

          {/* ── PASO 2: Teclado PIN ────────────────────────────────── */}
          {step === 'pin' && (
            <motion.div key="pin" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>

              {/* Indicador de dígitos */}
              <div className="portal-auth-dots" aria-label="PIN ingresado">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className={`portal-auth-dot ${i < pin.length ? 'portal-auth-dot--filled' : ''}`} />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="portal-auth-error">
                  <AlertCircle size={15} /><span>{error}</span>
                </div>
              )}

              {/* Teclado numérico */}
              {secondsLeft > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '1.25rem',
                  width: '100%',
                  textAlign: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={28} className="animate-bounce" />
                  <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Teclado Temporalmente Bloqueado</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Intenta de nuevo en <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{secondsLeft}s</span></p>
                </div>
              ) : (
                <div className="portal-auth-keypad">
                  {KEYS.map((key) => {
                    if (key === '⌫') return (
                      <button key={key} onClick={handleDelete} className="portal-key portal-key--action" aria-label="Borrar">
                        <Delete size={20} />
                      </button>
                    )
                    if (key === '✓') return (
                      <button key={key} onClick={handleSubmit} disabled={loading || pin.length !== 6}
                        className="portal-key portal-key--confirm" aria-label="Confirmar">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : '✓'}
                      </button>
                    )
                    return (
                      <button key={key} onClick={() => handleKey(key)} className="portal-key" aria-label={`Dígito ${key}`}>
                        {key}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* ─── Botón de Volver ──────────────────────────────────────── */}
        {(step === 'pin' || (step === 'employee-select' && !rolParam)) && (
          <button onClick={handleBack} className="portal-auth-back-btn">
            <ChevronLeft size={16} /> Volver
          </button>
        )}

      </div>
    </div>
  )
}
