import { Link, Save } from 'lucide-react'
import { updateAppConfig } from '../../../../services/appConfigService'
import MobilePreview from '../components/MobilePreview'

export default function BrandSettings({ formData, setFormData, config, setSaveMessage }) {
  const handleSave = async () => {
    try {
      await updateAppConfig({ 
        appIcon: formData.appIcon, 
        appName: formData.appName, 
        sellerName: formData.sellerName,
        whatsappAdmin: formData.whatsappAdmin || '',
        welcomeWavesEnabled: formData.welcomeWavesEnabled ?? true,
        loginTrustMessage: formData.loginTrustMessage || '',
        slogan: formData.slogan || '',
        pwaAppName: formData.pwaAppName || '',
        pwaAppIcon: formData.pwaAppIcon || '',
        pwaUseBrandIcon: formData.pwaUseBrandIcon || false
      })
      config.setConfig({
        appIcon: formData.appIcon, 
        appName: formData.appName, 
        sellerName: formData.sellerName,
        whatsappAdmin: formData.whatsappAdmin || '',
        welcomeWavesEnabled: formData.welcomeWavesEnabled ?? true,
        loginTrustMessage: formData.loginTrustMessage || '',
        slogan: formData.slogan || '',
        pwaAppName: formData.pwaAppName || '',
        pwaAppIcon: formData.pwaAppIcon || '',
        pwaUseBrandIcon: formData.pwaUseBrandIcon || false
      })
      setSaveMessage({ type: 'success', text: 'Identidad de marca y PWA guardados correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (e) {
      console.error(e)
      setSaveMessage({ type: 'error', text: 'Error al actualizar la identidad de marca.' })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="bg-surface rounded-3xl shadow-sm overflow-hidden lg:col-span-7 flex flex-col">
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-app mb-2">Nombre del Negocio</label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              placeholder="Ej. Mi Tienda Smart"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-app mb-2">Nombre del Vendedor</label>
            <input
              type="text"
              value={formData.sellerName}
              onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
              placeholder="Ej. Sergio"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-app mb-2 flex items-center gap-2">
              WhatsApp para Pedidos
              <span className="text-xs font-normal text-muted bg-surface-2 px-2 py-0.5 rounded-full border border-app">Sin el "+"</span>
            </label>
            <input
              type="tel"
              value={formData.whatsappAdmin}
              onChange={(e) => setFormData({ ...formData, whatsappAdmin: e.target.value })}
              placeholder="Ej. 573001234567"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-app mb-2">URL del Logo</label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Link size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={formData.appIcon}
                  onChange={(e) => setFormData({ ...formData, appIcon: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {formData.appIcon && (
                <div className="w-12 h-12 rounded-xl border border-app bg-surface overflow-hidden shrink-0">
                  <img src={formData.appIcon} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-app mb-2">Mensaje de confianza en el Login</label>
            <input
              type="text"
              value={formData.loginTrustMessage}
              onChange={(e) => setFormData({ ...formData, loginTrustMessage: e.target.value })}
              placeholder="Ej. Tu tienda de confianza"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-app mb-2">Eslogan de la tienda (Aparece bajo el logo en el Login)</label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              placeholder="Ej. Lencería y Accesorios para Ti"
              className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <p className="text-sm font-bold text-app">Ondas animadas en el Logotipo</p>
              <p className="text-xs text-muted mt-0.5">Efecto sonar animado detrás de tu logotipo en pantallas de bienvenida</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer"
                checked={formData.welcomeWavesEnabled}
                onChange={(e) => setFormData({ ...formData, welcomeWavesEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>

          {/* CONFIGURACIÓN DE APLICACIÓN MÓVIL (PWA) */}
          <div className="border-t border-app pt-5 space-y-4">
            <h3 className="text-sm font-black text-primary tracking-wider uppercase">
              Configuración de Aplicación Móvil (PWA)
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Define el nombre y el icono con el que se instalará la aplicación en la pantalla de inicio del celular de tus clientes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
                  <div>
                    <p className="text-sm font-bold text-app">Usar logo de la tienda como ícono de la app</p>
                    <p className="text-xs text-muted mt-0.5">Se colocará el logo de tu tienda centrado sobre un fondo con el color principal de la marca</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer"
                      checked={formData.pwaUseBrandIcon}
                      onChange={(e) => setFormData({ ...formData, pwaUseBrandIcon: e.target.checked })} />
                    <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-app mb-2 uppercase tracking-wider">Nombre de la App Móvil</label>
                <input
                  type="text"
                  value={formData.pwaAppName}
                  onChange={(e) => setFormData({ ...formData, pwaAppName: e.target.value })}
                  placeholder="Ej. Moni App"
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div>
                {!formData.pwaUseBrandIcon ? (
                  <>
                    <label className="block text-xs font-bold text-app mb-2 uppercase tracking-wider">URL del Icono de Instalación (PWA)</label>
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-1">
                        <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          value={formData.pwaAppIcon}
                          onChange={(e) => setFormData({ ...formData, pwaAppIcon: e.target.value })}
                          placeholder="https://ejemplo.com/icono.png"
                          className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                      </div>
                      {formData.pwaAppIcon && (
                        <div className="w-12 h-12 rounded-xl border border-app bg-surface overflow-hidden shrink-0">
                          <img src={formData.pwaAppIcon} alt="Preview PWA" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-app mb-2 uppercase tracking-wider">Vista Previa del Icono PWA</label>
                    <div className="flex gap-4 items-center p-3 bg-surface-2 rounded-xl border border-app">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center p-2.5 shadow-md shrink-0 transition-all duration-300"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        {formData.appIcon ? (
                          <img src={formData.appIcon} alt="Icono Tienda" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-white/20 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-app">{formData.pwaAppName || formData.appName || 'Mi Aplicación'}</p>
                        <p className="text-[10px] text-muted">Generado dinámicamente</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
        <div className="p-5 border-t border-app bg-surface-2/30">
          <button
            onClick={handleSave}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>
      <MobilePreview formData={formData} isDarkMode={config.isDarkMode} />
    </div>
  )
}
