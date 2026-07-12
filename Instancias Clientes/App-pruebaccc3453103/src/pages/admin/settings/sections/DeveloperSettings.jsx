import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  KeyRound, Lock, Trash2, Smartphone, AlertTriangle, 
  ChevronRight, Save, Loader2, CheckCircle, Paintbrush, Receipt
} from 'lucide-react'
import { DEV_PIN, COLLECTIONS } from '../../../../constants'
import { updateAppConfig, resetAppData } from '../../../../services/appConfigService'
import { signOutAdmin } from '../../../../services/authService'
import useAuthStore from '../../../../store/authStore'
import { useNavigate } from 'react-router-dom'
import DeveloperBillingPanel from './DeveloperBillingPanel'
import AppearanceSettings from './AppearanceSettings'

/**
 * DeveloperSettings — Panel maestro para configuraciones avanzadas
 * y herramientas internas de mantenimiento protegidas por PIN.
 */
export default function DeveloperSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage,
  isSaving,
  setIsSaving,
  activeSubSection,
  setActiveSubSection,
  handleSaveConfig
}) {
  const navigate = useNavigate()
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false)
  const [devPinInput, setDevPinInput] = useState('')
  const [devPinError, setDevPinError] = useState(false)

  // Diagnostics y Restauración
  const [confirmRestoreText, setConfirmRestoreText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // --- RESTAURACIÓN ---
  const handleFullReset = async () => {
    if (confirmRestoreText !== 'RESTAURAR') return
    if (!window.confirm('¿Estás COMPLETAMENTE SEGURO de restaurar la aplicación? Se eliminarán de forma REAL y permanente todos los datos y la configuración del negocio. Serás redirigido al inicio. Esta acción no se puede deshacer.')) return

    setLoading(true)
    setMessage({ type: 'success', text: 'Restaurando base de datos a cero (borrado real)...' })

    try {
      const collectionsToClean = [
        'config',
        'notifications',
        'accessLogs',
        'users'
      ]

      const deletedCount = await resetAppData(collectionsToClean, 'admin@ejemplo.com')

      setConfirmRestoreText('')
      setMessage({ type: 'success', text: `¡Restauración exitosa! Se eliminaron un total de ${deletedCount} registros. Redirigiendo...` })
      
      setTimeout(async () => {
        try {
          useAuthStore.getState().logout()
          await signOutAdmin()
          navigate('/login', { replace: true })
        } catch (e) {
          window.location.href = '/'
        }
      }, 2000)

    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Error al restaurar la aplicación: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  // --- GUARDAR CONTACTO ---
  const handleSaveContact = async () => {
    setIsSaving(true)
    try {
      await updateAppConfig({
        developerPhone: formData.developerPhone || ''
      })
      config.setConfig(formData)
      setSaveMessage({ type: 'success', text: 'Contacto del desarrollador guardado correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error(error)
      setSaveMessage({ type: 'error', text: 'Ocurrió un error al guardar el contacto.' })
    } finally {
      setIsSaving(false)
    }
  }

  // PIN Gate
  if (!isDevAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-6 bg-surface rounded-3xl border border-app shadow-xl mt-8 text-center animate-all"
        style={{ color: 'var(--color-text)' }}
      >
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3.5 animate-all">
            <KeyRound size={24} />
          </div>
          <h3 className="text-base font-black text-app">Zona Protegida de Desarrollador</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Ingresa el PIN maestro del desarrollador para acceder a la facturación y herramientas internas.
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault()
          if (devPinInput === DEV_PIN) {
            setIsDevAuthenticated(true)
            setDevPinError(false)
          } else {
            setDevPinError(true)
          }
        }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-app mb-1.5 block">PIN de Seguridad (4 dígitos)</label>
            <div className="flex justify-center gap-2.5">
              <input
                type="password"
                maxLength={4}
                value={devPinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setDevPinInput(val)
                  if (devPinError) setDevPinError(false)
                }}
                placeholder="****"
                className={`w-28 h-12 text-center rounded-xl bg-surface-2 border text-xl tracking-[0.4em] font-black text-app focus:outline-none focus:border-primary transition-all bg-transparent ${
                  devPinError ? 'border-rose-500 focus:border-rose-500' : 'border-app'
                }`}
              />
            </div>
            {devPinError && (
              <p className="text-[11px] text-rose-500 font-semibold mt-2">El PIN ingresado es incorrecto.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-primary text-white font-bold text-sm rounded-xl transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 border-none cursor-pointer"
          >
            <KeyRound size={16} /> Desbloquear Sección
          </button>
        </form>
      </motion.div>
    )
  }

  return (
    <div className="text-left animate-all" style={{ color: 'var(--color-text)' }}>
      {/* SUBSECCIÓN MENU */}
      {activeSubSection === null && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between px-1 py-1 flex-wrap gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Módulos de desarrollo</p>
            <button
              onClick={() => {
                setIsDevAuthenticated(false)
                setDevPinInput('')
              }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border-none"
            >
              <Lock size={12} /> Bloquear Sección
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                id: 'dev-apariencia',
                label: 'Apariencia y Colores',
                description: 'Tema, paleta, fuentes y modo oscuro',
                icon: Paintbrush,
                iconBg: 'bg-purple-500/10 hover:bg-purple-500/15',
                iconColor: 'text-purple-500'
              },
              {
                id: 'dev-facturacion',
                label: 'Facturación del Desarrollador',
                description: 'Métricas, comisiones del desarrollador y reportes',
                icon: Receipt,
                iconBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
                iconColor: 'text-emerald-500'
              },
              {
                id: 'dev-restauracion',
                label: 'Restauración de la Aplicación',
                description: 'Limpia la base de datos a cero y valores por defecto (Borrado Real)',
                icon: Trash2,
                iconBg: 'bg-rose-500/10 hover:bg-rose-500/15',
                iconColor: 'text-rose-500'
              },
              {
                id: 'dev-contacto',
                label: 'Contacto del Desarrollador',
                description: 'Configura el WhatsApp del desarrollador para soporte o adquisición',
                icon: Smartphone,
                iconBg: 'bg-blue-500/10 hover:bg-blue-500/15',
                iconColor: 'text-blue-500'
              }
            ].map(tool => {
              const ToolIcon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveSubSection(tool.id)}
                  className="w-full flex items-center gap-4 p-5 bg-surface rounded-2xl transition-all text-left shadow-sm hover:shadow-md cursor-pointer group border border-app hover:border-primary/20"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${tool.iconBg}`}>
                    <ToolIcon size={22} className={tool.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-app group-hover:text-primary transition-colors">{tool.label}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 1. Subsección: Apariencia y Colores */}
      {activeSubSection === 'dev-apariencia' && (
        <AppearanceSettings 
          formData={formData}
          setFormData={setFormData}
          config={config}
          setSaveMessage={setSaveMessage}
          isSaving={isSaving}
          handleSaveConfig={handleSaveConfig}
        />
      )}

      {/* 2. Subsección: Facturación */}
      {activeSubSection === 'dev-facturacion' && (
        <DeveloperBillingPanel config={config} setSaveMessage={setSaveMessage} />
      )}

      {/* 3. Subsección: Restauración */}
      {activeSubSection === 'dev-restauracion' && (
        <div className="bg-surface rounded-3xl border border-rose-500/20 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <div className="p-5 sm:p-6 bg-rose-500/5">
            <p className="text-sm text-app/70">Restaura la aplicación a sus valores iniciales eliminando todos los datos de negocio de forma real.</p>
          </div>
          <div className="p-5 sm:p-6">
            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-green-500/10 border-green-500/20 text-emerald-500'}`}>
                {message.type === 'error' ? <AlertTriangle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                <p className="text-sm font-bold mt-0.5">{message.text}</p>
              </div>
            )}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-rose-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> ¡ADVERTENCIA DE ACCIÓN DESTRUCTIVA!
              </h3>
              <p className="text-sm text-app/80 mb-4">
                Esta acción eliminará de forma <strong>permanente y real</strong> todas las configuraciones, usuarios y logs. Esto dejará la base de datos totalmente vacía.
              </p>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-app/60 uppercase mb-2">
                  Escribe <span className="text-rose-500 font-extrabold">RESTAURAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  placeholder="Escribe el texto detallado aquí"
                  id="confirmRestoreInput"
                  value={confirmRestoreText}
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-rose-500/20 text-app focus:outline-none focus:border-rose-500 font-bold tracking-wider bg-transparent text-sm"
                  onChange={(e) => setConfirmRestoreText(e.target.value)}
                />
              </div>

              <button
                id="btnExecuteRestore"
                onClick={handleFullReset}
                disabled={confirmRestoreText !== 'RESTAURAR' || loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-12 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-30 disabled:hover:bg-rose-500 text-center border-none cursor-pointer"
              >
                <Trash2 size={16} className="shrink-0" /> <span>Restaurar Aplicación a Cero (Borrado Real)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Subsección: Contacto del Desarrollador */}
      {activeSubSection === 'dev-contacto' && (
        <div className="bg-surface rounded-3xl shadow-sm border border-app overflow-hidden max-w-3xl mx-auto">
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-app mb-2 flex items-center gap-2">
                WhatsApp del Desarrollador
                <span className="text-xs font-normal text-muted bg-surface-2 px-2 py-0.5 rounded-full border border-app">Sin el "+"</span>
              </label>
              <input
                type="tel"
                value={formData.developerPhone || ''}
                onChange={(e) => setFormData({ ...formData, developerPhone: e.target.value })}
                placeholder="Ingresa el número de celular (10 dígitos)"
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm"
              />
              <p className="text-xs text-muted mt-2">
                Este número se usará para que los clientes te contacten si están interesados en una aplicación para su propio negocio.
              </p>
            </div>
          </div>
          <div className="p-5 border-t border-app bg-surface-2/30">
            <button onClick={handleSaveContact} disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 border-none cursor-pointer">
              <Save size={18} /> Guardar Contacto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
