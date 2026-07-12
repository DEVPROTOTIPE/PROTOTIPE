import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, Save, Shield, Loader2, Cpu, UploadCloud, Trash2
} from 'lucide-react'
import useAppConfigStore from '../../store/appConfigStore'
import { updateAppConfig } from '../../services/appConfigService'
import DeveloperSettings from './settings/sections/DeveloperSettings'
import DeveloperDiagnosticsModal from '../../components/admin/settings/DeveloperDiagnosticsModal'
import { uploadImage, deleteImage } from '../../services/uploadService'

/**
 * AdminSettings — Panel principal de administración para el Core Seed.
 * Incluye gestión de datos de marca y sección restringida del desarrollador.
 */
export default function AdminSettings() {
  const config = useAppConfigStore()
  const [activeSection, setActiveSection] = useState('brand')
  const [activeSubSection, setActiveSubSection] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El límite de tamaño es de 2 MB.')
      return
    }

    setIsUploadingLogo(true)
    setUploadProgress(0)

    try {
      if (formData.appIcon && formData.appIcon.includes('firebasestorage')) {
        await deleteImage(formData.appIcon).catch(err => console.warn('No se pudo borrar el logo anterior:', err))
      }

      const downloadURL = await uploadImage(file, 'branding', 'logo', (progress) => {
        setUploadProgress(progress)
      })

      setFormData(prev => ({ ...prev, appIcon: downloadURL }))
      setSaveMessage({ type: 'success', text: 'Logo subido con éxito.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Error al subir el logo.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!formData.appIcon) return
    setIsSaving(true)
    try {
      if (formData.appIcon.includes('firebasestorage')) {
        await deleteImage(formData.appIcon)
      }
      setFormData(prev => ({ ...prev, appIcon: '' }))
      setSaveMessage({ type: 'success', text: 'Logo removido.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Error al eliminar el logo.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const [formData, setFormData] = useState({
    appName: '',
    sellerName: '',
    slogan: '',
    appIcon: '',
    whatsappAdmin: '',
    developerPhone: '',
    theme: 'zafiro-moderno',
    appFont: 'inter',
    appRadius: 'rounded',
    animationsEnabled: true,
    developerBillingMode: 'percentage',
    developerCommissionPercent: 5,
    developerFixedServiceFee: 0,
    developerFlatMonthlyFee: 0,
  })

  useEffect(() => {
    if (config.isLoaded) {
      setFormData({
        appName: config.appName || '',
        sellerName: config.sellerName || '',
        slogan: config.slogan || '',
        appIcon: config.appIcon || '',
        whatsappAdmin: config.whatsappAdmin || '',
        developerPhone: config.developerPhone || '',
        theme: config.theme || 'zafiro-moderno',
        appFont: config.appFont || 'inter',
        appRadius: config.appRadius || 'rounded',
        animationsEnabled: config.animationsEnabled ?? true,
        developerBillingMode: config.developerBillingMode || 'percentage',
        developerCommissionPercent: config.developerCommissionPercent ?? 5,
        developerFixedServiceFee: config.developerFixedServiceFee ?? 0,
        developerFlatMonthlyFee: config.developerFlatMonthlyFee ?? 0,
      })
    }
  }, [config.isLoaded, config])

  const handleSaveGeneral = async (e) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    try {
      await updateAppConfig({
        appName: formData.appName,
        sellerName: formData.sellerName,
        slogan: formData.slogan,
        appIcon: formData.appIcon,
        whatsappAdmin: formData.whatsappAdmin,
      })
      config.setConfig(formData)
      setSaveMessage({ type: 'success', text: 'Configuraciones guardadas correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveThemeConfig = async () => {
    setIsSaving(true)
    try {
      await updateAppConfig({
        theme: formData.theme,
        appFont: formData.appFont,
        appRadius: formData.appRadius,
        animationsEnabled: formData.animationsEnabled
      })
      config.setConfig(formData)
      setSaveMessage({ type: 'success', text: 'Estilos guardados correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Error al guardar estilos.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-bold ${
              saveMessage.type === 'error' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}
          >
            <span>{saveMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-app">Configuración del Sistema</h2>
          <p className="text-xs text-muted mt-0.5">Administra la marca, estilos y módulos de tu aplicación.</p>
        </div>
        <button
          onClick={() => setIsDiagnosticsOpen(true)}
          className="h-10 px-4 rounded-xl bg-surface border border-app hover:bg-surface-2 text-app text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <Cpu size={16} />
          Diagnósticos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'brand', label: 'Datos de Marca', icon: Building2 },
            { id: 'developer', label: 'Desarrollador', icon: Shield }
          ].map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id)
                  setActiveSubSection(null)
                }}
                className={`w-full h-11 px-4 rounded-xl flex items-center justify-between font-bold text-xs transition-all active:scale-98 border-none cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/15'
                    : 'bg-surface text-muted hover:bg-surface-2 border border-app'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span>{section.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9">
          {activeSection === 'brand' && (
            <form onSubmit={handleSaveGeneral} className="bg-surface border border-app rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-app block">Nombre de la App</label>
                    <input
                      type="text"
                      value={formData.appName}
                      onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                      placeholder="Ej. Mi Negocio"
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm bg-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-app block">Eslogan / Subtítulo</label>
                    <input
                      type="text"
                      value={formData.slogan}
                      onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                      placeholder="Ej. El mejor servicio"
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm bg-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-app block">Nombre del Propietario</label>
                    <input
                      type="text"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm bg-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-app block">WhatsApp Administrador</label>
                    <input
                      type="tel"
                      value={formData.whatsappAdmin}
                      onChange={(e) => setFormData({ ...formData, whatsappAdmin: e.target.value })}
                      placeholder="Ej. 3001234567"
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-app block">Logotipo de la Marca</label>
                  
                  {formData.appIcon ? (
                    <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-2xl border border-app">
                      <img src={formData.appIcon} alt="Preview Logo" className="w-16 h-16 object-contain rounded-xl p-2 bg-surface border border-app shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-app truncate">Logotipo Cargado</p>
                        <p className="text-[10px] text-muted truncate">{formData.appIcon}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoDelete}
                        disabled={isSaving}
                        className="h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer active:scale-95 transition-all disabled:opacity-50 shrink-0"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-app hover:border-primary/50 rounded-2xl p-6 transition-all bg-surface-2 flex flex-col items-center justify-center gap-2.5 text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {isUploadingLogo ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={24} className="animate-spin text-primary" />
                          <p className="text-xs font-bold text-app">Subiendo logotipo... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <UploadCloud size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-app">Haz clic o arrastra un archivo para subir tu logo</p>
                            <p className="text-[10px] text-muted mt-0.5">Formatos recomendados: PNG, SVG o JPEG (Max. 2MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-app bg-surface-2/30">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-11 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/15 border-none"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Datos de Marca
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeSection === 'developer' && (
            <DeveloperSettings
              formData={formData}
              setFormData={setFormData}
              config={config}
              setSaveMessage={setSaveMessage}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              activeSubSection={activeSubSection}
              setActiveSubSection={setActiveSubSection}
              handleSaveConfig={handleSaveThemeConfig}
            />
          )}
        </div>
      </div>

      <DeveloperDiagnosticsModal 
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  )
}
