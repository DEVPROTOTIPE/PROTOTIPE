import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  KeyRound, Lock, Filter, TrendingUp, Receipt, Trash2, Smartphone, AlertTriangle, 
  ChevronRight, Plus, X, ShoppingBag, Wallet, BarChart3, Sparkles, Tag, ChevronDown, 
  Save, Loader2, CheckCircle, Activity, Paintbrush, LayoutGrid, Truck
} from 'lucide-react'
import { DEV_PIN, COLLECTIONS } from '../../../../constants'
import { updateAppConfig, updateCatalogFilters, resetAppData } from '../../../../services/appConfigService'
import { auth } from '../../../../config/firebaseConfig'
import { signOutAdmin } from '../../../../services/authService'
import useAuthStore from '../../../../store/authStore'
import { useNavigate } from 'react-router-dom'
import DeveloperBillingPanel from './DeveloperBillingPanel'
import AppearanceSettings from './AppearanceSettings'
import LeafletMapPicker from '../../../../components/ui/LeafletMapPicker'
import DeliveryCustomMessengerPanel from '../../../../components/admin/settings/DeliveryCustomMessengerPanel'

export default function DeveloperSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage,
  isSaving,
  setIsSaving,
  activeSubSection,
  setActiveSubSection,
  setIsThemeModalOpen,
  handleSaveThemeConfig
}) {
  const navigate = useNavigate()
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false)
  const [devPinInput, setDevPinInput] = useState('')
  const [devPinError, setDevPinError] = useState(false)

  // Diagnostics y Restauración
  const [confirmRestoreText, setConfirmRestoreText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleVersionClick = () => {
    // Si queremos bloquear o resetear el estado
  }

  // --- RESTAURACIÓN ---
  const handleFullReset = async () => {
    if (confirmRestoreText !== 'RESTAURAR') return
    if (!window.confirm('¿Estás COMPLETAMENTE SEGURO de restaurar la aplicación? Se eliminarán de forma REAL y permanente absolutamente todos los productos, categorías, pedidos, créditos, cupones, anuncios, notificaciones, logs, mesas y la configuración del negocio. Serás redirigido a la pantalla de registro inicial. Esta acción no se puede deshacer.')) return

    setLoading(true)
    setMessage({ type: 'success', text: 'Restaurando base de datos a cero (borrado real)...' })

    try {
      const collectionsToClean = [
        COLLECTIONS.PRODUCTS,
        COLLECTIONS.CATEGORIES,
        COLLECTIONS.ORDERS,
        COLLECTIONS.CREDITS,
        'coupons',
        'ads',
        'notifications',
        'clientNotifications',
        'fcmTokens',
        'accessLogs',
        'qrAnalytics',
        'trackingAnalytics',
        'users',
        'wholesaleOrders',
        'deliveries',
        'employees',
        'production',
        'tableRequests',
        'tables',
        'config'
      ]

      const deletedCount = await resetAppData(collectionsToClean, 'sergioaagudeloh@gmail.com')

      setConfirmRestoreText('')
      setMessage({ type: 'success', text: `¡Restauración exitosa! Se eliminaron un total de ${deletedCount} registros. Redirigiendo al inicio de sesión...` })
      
      setTimeout(async () => {
        try {
          useAuthStore.getState().logout()
          await signOutAdmin()
          navigate('/', { replace: true })
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

  // --- FILTROS Y ATRIBUTOS ---
  const handleAddCustomAttribute = () => {
    const current = formData.catalogFilters.customAttributes || []
    setFormData({
      ...formData,
      catalogFilters: {
        ...formData.catalogFilters,
        customAttributes: [...current, { id: 'attr-' + Date.now(), name: '', type: 'text' }]
      }
    })
  }

  const handleCustomAttributeChange = (index, field, value) => {
    const updated = [...(formData.catalogFilters.customAttributes || [])]
    if (field === 'options') {
      updated[index].options = value.split(',').map(s => s.trimStart())
    } else {
      updated[index][field] = value
      if (field === 'type' && value === 'select') {
        updated[index].options = []
      }
    }
    setFormData({
      ...formData,
      catalogFilters: { ...formData.catalogFilters, customAttributes: updated }
    })
  }

  const handleRemoveCustomAttribute = (index) => {
    const updated = [...(formData.catalogFilters.customAttributes || [])]
    updated.splice(index, 1)
    setFormData({
      ...formData,
      catalogFilters: { ...formData.catalogFilters, customAttributes: updated }
    })
  }

  // --- CONFIGURACIÓN GENERAL ---
  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      await updateAppConfig({
        developerPhone: formData.developerPhone || '',
        commercialOptimization: formData.commercialOptimization
      })
      if (formData.catalogFilters) {
        await updateCatalogFilters(formData.catalogFilters)
      }
      config.setConfig(formData)
      setSaveMessage({ type: 'success', text: 'Configuraciones de desarrollo guardadas correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error(error)
      setSaveMessage({ type: 'error', text: 'Ocurrió un error al guardar las configuraciones.' })
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
        className="w-full max-w-md mx-auto p-6 bg-surface rounded-3xl border border-app shadow-xl mt-8 text-center"
      >
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3.5">
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
                  devPinError ? 'border-red-500 focus:border-red-500' : 'border-app'
                }`}
              />
            </div>
            {devPinError && (
              <p className="text-[11px] text-red-500 font-semibold mt-2">El PIN ingresado es incorrecto.</p>
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
    <div className="text-left">
      {/* SUBSECCIÓN MENU */}
      {activeSubSection === null && (
        <div className="space-y-4">
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
                description: 'Tema, paleta y modo oscuro de la tienda',
                icon: Paintbrush,
                iconBg: 'bg-purple-500/10 hover:bg-purple-500/15',
                iconColor: 'text-purple-500'
              },
              {
                id: 'dev-modulos',
                label: 'Módulos Activos',
                description: 'Habilita o deshabilita los módulos globales del negocio (Crédito, Cupones, Garantías, Mayorista)',
                icon: LayoutGrid,
                iconBg: 'bg-purple-500/10 hover:bg-purple-500/15',
                iconColor: 'text-purple-500'
              },
              {
                id: 'dev-entregas',
                label: 'Métodos de Entrega',
                description: 'Configura envíos, retiros interactivos en mapa y mensajeros de entrega',
                icon: Truck,
                iconBg: 'bg-blue-500/10 hover:bg-blue-500/15',
                iconColor: 'text-blue-500'
              },
              {
                id: 'dev-dian',
                label: 'Facturación DIAN',
                description: 'Introduce los datos fiscales y el IVA por defecto (Colombia)',
                icon: Receipt,
                iconBg: 'bg-orange-500/10 hover:bg-orange-500/15',
                iconColor: 'text-orange-500'
              },
              {
                id: 'dev-filtros',
                label: 'Filtros del Catálogo',
                description: 'Filtros y atributos personalizados de productos',
                icon: Filter,
                iconBg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
                iconColor: 'text-indigo-500'
              },
              {
                id: 'dev-opt-comercial',
                label: 'Optimización Comercial',
                description: 'Aumenta la conversión, valor promedio y deseo de compra con herramientas inteligentes',
                icon: TrendingUp,
                iconBg: 'bg-amber-500/10 hover:bg-amber-500/15',
                iconColor: 'text-amber-500'
              },
              {
                id: 'dev-facturacion',
                label: 'Facturación',
                description: 'Comisiones y métricas de ventas en tiempo real',
                icon: Receipt,
                iconBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
                iconColor: 'text-emerald-500'
              },
              {
                id: 'dev-restauracion',
                label: 'Restauración de la aplicación',
                description: 'Limpia la base de datos a cero y valores por defecto (Borrado Real)',
                icon: Trash2,
                iconBg: 'bg-red-500/10 hover:bg-red-500/15',
                iconColor: 'text-red-500'
              },
              {
                id: 'dev-contacto',
                label: 'Contacto del Desarrollador',
                description: 'Configura el WhatsApp del desarrollador para la publicidad del cliente',
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

      {/* 1. Subsección: Filtros del Catálogo */}
      {activeSubSection === 'dev-filtros' && (
        <div className="bg-surface rounded-3xl shadow-sm border border-app overflow-hidden">
          <div className="p-5 sm:p-6">
            {formData.catalogFilters && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'categories', label: 'Categorías', desc: 'Permite filtrar por categorías en el inicio.' },
                    { key: 'sizes', label: 'Tallas', desc: 'Se asignan por cada variante de producto.' },
                    { key: 'colors', label: 'Colores', desc: 'Selector de color por variante.' }
                  ].map(filterObj => (
                    <div key={filterObj.key} className="flex items-start gap-3 p-4 rounded-xl border border-app bg-surface-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-app">{filterObj.label}</h3>
                        <p className="text-xs text-muted mt-1">{filterObj.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer"
                          checked={formData.catalogFilters[filterObj.key]}
                          onChange={(e) => setFormData({ ...formData, catalogFilters: { ...formData.catalogFilters, [filterObj.key]: e.target.checked } })} />
                        <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-app pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-app">Atributos Personalizados</h3>
                      <p className="text-xs text-muted">Crea campos extra para tus productos (Ej: Sabor, Marca).</p>
                    </div>
                    <button type="button" onClick={handleAddCustomAttribute}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors border-none cursor-pointer">
                      <Plus size={16} /> Añadir
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.catalogFilters.customAttributes?.map((attr, index) => (
                      <div key={attr.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-surface-2 border border-app rounded-xl">
                        <div className="flex-1 w-full">
                          <input type="text" placeholder="Ingresa el nombre del nuevo atributo" value={attr.name}
                            onChange={(e) => handleCustomAttributeChange(index, 'name', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-app bg-surface text-app focus:border-primary outline-none text-sm bg-transparent" />
                        </div>
                        <div className="w-full sm:w-auto flex bg-surface border border-app rounded-lg overflow-hidden h-10 shrink-0">
                          <button type="button" onClick={() => handleCustomAttributeChange(index, 'type', 'text')}
                            className={`flex-1 px-3 text-xs font-bold transition-colors border-none cursor-pointer ${attr.type === 'text' ? 'bg-primary text-white font-bold' : 'text-muted hover:bg-surface-2 bg-transparent'}`}>Texto</button>
                          <div className="w-px bg-app opacity-20"></div>
                          <button type="button" onClick={() => handleCustomAttributeChange(index, 'type', 'select')}
                            className={`flex-1 px-3 text-xs font-bold transition-colors border-none cursor-pointer ${attr.type === 'select' ? 'bg-primary text-white font-bold' : 'text-muted hover:bg-surface-2 bg-transparent'}`}>Opciones</button>
                        </div>
                        {attr.type === 'select' && (
                          <div className="flex-[1.5] w-full">
                            <input type="text" placeholder="Ingresa las opciones separadas por comas"
                              value={attr.options ? attr.options.join(', ') : ''}
                              onChange={(e) => handleCustomAttributeChange(index, 'options', e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-app bg-surface text-app focus:border-primary outline-none text-sm bg-transparent" />
                            <p className="text-[10px] text-muted mt-1 px-1">Separa las opciones con comas.</p>
                          </div>
                        )}
                        <button onClick={() => handleRemoveCustomAttribute(index)}
                          className="w-full sm:w-10 h-10 flex items-center justify-center shrink-0 rounded-lg text-muted hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer bg-transparent">
                          <Trash2 size={16} /> <span className="sm:hidden text-sm ml-2">Eliminar</span>
                        </button>
                      </div>
                    ))}
                    {(!formData.catalogFilters.customAttributes || formData.catalogFilters.customAttributes.length === 0) && (
                      <div className="text-center py-6 text-muted text-sm border border-dashed border-app rounded-xl">
                        No has creado ningún atributo personalizado aún.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="p-5 border-t border-app bg-surface-2/30">
            <button onClick={handleSaveConfig} disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 border-none cursor-pointer">
              <Save size={18} /> Guardar Filtros
            </button>
          </div>
        </div>
      )}

      {/* 2. Subsección: Facturación */}
      {activeSubSection === 'dev-facturacion' && (
        <DeveloperBillingPanel config={config} setSaveMessage={setSaveMessage} />
      )}

      {/* 3. Subsección: Restauración */}
      {activeSubSection === 'dev-restauracion' && (
        <div className="bg-surface rounded-3xl border border-red-500/20 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 bg-red-500/5">
            <p className="text-sm text-app/70">Restaura la aplicación a sus valores iniciales eliminando todos los datos de negocio de forma real.</p>
          </div>
          <div className="p-5 sm:p-6">
            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-success'}`}>
                {message.type === 'error' ? <AlertTriangle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                <p className="text-sm font-bold mt-0.5">{message.text}</p>
              </div>
            )}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> ¡ADVERTENCIA DE ACCIÓN DESTRUCTIVA!
              </h3>
              <p className="text-sm text-app/80 mb-4">
                Esta acción eliminará de forma <strong>permanente y real</strong> todos los productos, categorías, cupones, anuncios, pedidos, créditos y usuarios (excepto tu cuenta de administrador actual). Esto dejará la base de datos totalmente vacía para poder entregar o replicar la aplicación en otro cliente.
              </p>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-app/60 uppercase mb-2">
                  Escribe <span className="text-red-500 font-extrabold">RESTAURAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  placeholder="Escribe el texto detallado aquí"
                  id="confirmRestoreInput"
                  value={confirmRestoreText}
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-red-500/20 text-app focus:outline-none focus:border-red-500 font-bold tracking-wider bg-transparent text-sm"
                  onChange={(e) => setConfirmRestoreText(e.target.value)}
                />
              </div>

              <button
                id="btnExecuteRestore"
                onClick={handleFullReset}
                disabled={confirmRestoreText !== 'RESTAURAR' || loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-12 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-30 disabled:hover:bg-red-500 text-center border-none cursor-pointer"
              >
                <Trash2 size={16} className="shrink-0" /> <span>Restaurar Aplicación a Cero (Borrado Real)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Subsección: Contacto del Desarrollador */}
      {activeSubSection === 'dev-contacto' && (
        <div className="bg-surface rounded-3xl shadow-sm border border-app overflow-hidden">
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
            <button onClick={handleSaveConfig} disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 border-none cursor-pointer">
              <Save size={18} /> Guardar Contacto
            </button>
          </div>
        </div>
      )}

      {/* 5. Subsección: Optimización Comercial */}
      {activeSubSection === 'dev-opt-comercial' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl shadow-sm border border-app overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-app bg-surface-2/30">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Optimización Comercial y Conversión
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Activa y personaliza las herramientas inteligentes para potenciar las ventas y conversión de tu catálogo.
              </p>
            </div>

            <div className="divide-y divide-app">
              {/* Etiquetas Inteligentes */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <span className="font-bold text-app text-sm flex items-center gap-1.5">
                      <Tag size={15} className="text-primary" />
                      1. Etiquetas Inteligentes de Conversión
                    </span>
                    <span className="text-xs text-muted mt-0.5 block leading-relaxed">
                      Indicadores visuales en las tarjetas (Más Vendido, Oferta Imperdible, etc.) para generar urgencia de compra.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.commercialOptimization.tools?.smartTags?.enabled ?? true}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          commercialOptimization: {
                            ...formData.commercialOptimization,
                            tools: {
                              ...formData.commercialOptimization.tools,
                              smartTags: {
                                ...formData.commercialOptimization.tools.smartTags,
                                enabled: e.target.checked
                              }
                            }
                          }
                        })
                      }}
                    />
                    <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>

                {formData.commercialOptimization.tools?.smartTags?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-app border-dashed animate-in fade-in">
                    {/* Más Vendido */}
                    <div className="bg-surface-2 p-4 rounded-2xl border border-app space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-app">Etiqueta: Más Vendido</span>
                        <input
                          type="checkbox"
                          checked={formData.commercialOptimization.tools.smartTags.bestSeller?.enabled ?? true}
                          onChange={(e) => {
                            const tags = { ...formData.commercialOptimization.tools.smartTags }
                            tags.bestSeller.enabled = e.target.checked
                            setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Texto</label>
                          <input
                            type="text"
                            value={formData.commercialOptimization.tools.smartTags.bestSeller?.text || ''}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.bestSeller.text = e.target.value
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Ventas Mínimas</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.commercialOptimization.tools.smartTags.bestSeller?.minSales ?? 5}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.bestSeller.minSales = Number(e.target.value)
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Fondo</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.bestSeller?.bg || '#ef4444'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.bestSeller.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.bestSeller?.bg || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.bestSeller.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Texto</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.bestSeller?.textCol || '#ffffff'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.bestSeller.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.bestSeller?.textCol || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.bestSeller.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Oferta Imperdible */}
                    <div className="bg-surface-2 p-4 rounded-2xl border border-app space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-app">Etiqueta: Oferta Imperdible</span>
                        <input
                          type="checkbox"
                          checked={formData.commercialOptimization.tools.smartTags.unmissableOffer?.enabled ?? true}
                          onChange={(e) => {
                            const tags = { ...formData.commercialOptimization.tools.smartTags }
                            tags.unmissableOffer.enabled = e.target.checked
                            setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                          <label className="text-[10px] text-muted block mb-1">Texto</label>
                          <input
                            type="text"
                            value={formData.commercialOptimization.tools.smartTags.unmissableOffer?.text || ''}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.unmissableOffer.text = e.target.value
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Fondo</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.unmissableOffer?.bg || '#f59e0b'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.unmissableOffer.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.unmissableOffer?.bg || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.unmissableOffer.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Texto</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.unmissableOffer?.textCol || '#ffffff'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.unmissableOffer.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.unmissableOffer?.textCol || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.unmissableOffer.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Última Unidad */}
                    <div className="bg-surface-2 p-4 rounded-2xl border border-app space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-app">Etiqueta: Última Unidad</span>
                        <input
                          type="checkbox"
                          checked={formData.commercialOptimization.tools.smartTags.lastUnit?.enabled ?? true}
                          onChange={(e) => {
                            const tags = { ...formData.commercialOptimization.tools.smartTags }
                            tags.lastUnit.enabled = e.target.checked
                            setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Texto</label>
                          <input
                            type="text"
                            value={formData.commercialOptimization.tools.smartTags.lastUnit?.text || ''}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.lastUnit.text = e.target.value
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Umbral Stock</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.commercialOptimization.tools.smartTags.lastUnit?.threshold ?? 3}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.lastUnit.threshold = Number(e.target.value)
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Fondo</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.lastUnit?.bg || '#3b82f6'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.lastUnit.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.lastUnit?.bg || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.lastUnit.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Texto</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.lastUnit?.textCol || '#ffffff'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.lastUnit.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.lastUnit?.textCol || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.lastUnit.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nuevo */}
                    <div className="bg-surface-2 p-4 rounded-2xl border border-app space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-app">Etiqueta: Nuevo</span>
                        <input
                          type="checkbox"
                          checked={formData.commercialOptimization.tools.smartTags.newProduct?.enabled ?? true}
                          onChange={(e) => {
                            const tags = { ...formData.commercialOptimization.tools.smartTags }
                            tags.newProduct.enabled = e.target.checked
                            setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Texto</label>
                          <input
                            type="text"
                            value={formData.commercialOptimization.tools.smartTags.newProduct?.text || ''}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.newProduct.text = e.target.value
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Límite Días</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.commercialOptimization.tools.smartTags.newProduct?.daysLimit ?? 7}
                            onChange={(e) => {
                              const tags = { ...formData.commercialOptimization.tools.smartTags }
                              tags.newProduct.daysLimit = Number(e.target.value)
                              setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-surface border border-app text-app focus:outline-none text-xs bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Fondo</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.newProduct?.bg || '#10b981'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.newProduct.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.newProduct?.bg || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.newProduct.bg = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Color Texto</label>
                          <div className="flex items-center gap-1 h-9 bg-surface border border-app rounded-lg px-1">
                            <input
                              type="color"
                              value={formData.commercialOptimization.tools.smartTags.newProduct?.textCol || '#ffffff'}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.newProduct.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-5 h-5 rounded border border-app cursor-pointer shrink-0 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Ingresa el color hexadecimal (ej: #000000)"
                              value={formData.commercialOptimization.tools.smartTags.newProduct?.textCol || ''}
                              onChange={(e) => {
                                const tags = { ...formData.commercialOptimization.tools.smartTags }
                                tags.newProduct.textCol = e.target.value
                                setFormData({ ...formData, commercialOptimization: { ...formData.commercialOptimization, tools: { ...formData.commercialOptimization.tools, smartTags: tags } } })
                              }}
                              className="w-full bg-transparent text-app focus:outline-none text-[10px] font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recomendados en el Carrito */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <span className="font-bold text-app text-sm flex items-center gap-1.5">
                      <ShoppingBag size={15} className="text-primary" />
                      2. Recomendados en el Carrito (Cross-selling)
                    </span>
                    <span className="text-xs text-muted mt-0.5 block leading-relaxed">
                      Muestra sugerencias de productos complementarios dentro de la bolsa antes de procesar el pedido.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.commercialOptimization.tools?.cartRecommendations?.enabled ?? true}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          commercialOptimization: {
                            ...formData.commercialOptimization,
                            tools: {
                              ...formData.commercialOptimization.tools,
                              cartRecommendations: {
                                ...formData.commercialOptimization.tools.cartRecommendations,
                                enabled: e.target.checked
                              }
                            }
                          }
                        })
                      }}
                    />
                    <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>

                {formData.commercialOptimization.tools?.cartRecommendations?.enabled && (
                  <div className="pt-3 border-t border-app border-dashed animate-in fade-in">
                    <label className="text-xs font-bold text-muted block mb-1">Título de la sección de recomendados</label>
                    <input
                      type="text"
                      value={formData.commercialOptimization.tools.cartRecommendations.title || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          commercialOptimization: {
                            ...formData.commercialOptimization,
                            tools: {
                              ...formData.commercialOptimization.tools,
                              cartRecommendations: {
                                ...formData.commercialOptimization.tools.cartRecommendations,
                                title: e.target.value
                              }
                            }
                          }
                        })
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-app text-app focus:outline-none text-xs bg-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-app bg-surface-2/30">
            <button onClick={handleSaveConfig} disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 border-none cursor-pointer">
              <Save size={18} /> Guardar Optimización Comercial
            </button>
          </div>
        </div>
      )}
      
      {/* 6. Subsección: Apariencia y Colores */}
      {activeSubSection === 'dev-apariencia' && (
        <AppearanceSettings 
          formData={formData} 
          setFormData={setFormData} 
          config={config} 
          setSaveMessage={setSaveMessage} 
          setIsThemeModalOpen={setIsThemeModalOpen}
          isSaving={isSaving}
          handleSaveConfig={handleSaveThemeConfig}
        />
      )}

      {/* 7. Subsección: Módulos Activos */}
      {activeSubSection === 'dev-modulos' && (
        <div className="bg-surface rounded-3xl border border-app overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-app bg-surface-2/30">
            <h3 className="text-sm font-black text-app">Módulos Activos</h3>
            <p className="text-[10px] text-muted mt-1">Habilita o deshabilita los módulos globales del negocio. Los cambios se aplicarán en tiempo real para clientes y administradores.</p>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Switch Crédito */}
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Módulo de Crédito y Cuentas por Cobrar</p>
                <p className="text-xs text-muted mt-0.5">Permite a los clientes seleccionar "Crédito" como forma de pago y habilita el control de fiados.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.creditsEnabled || false}
                  onChange={(e) => setFormData({ ...formData, creditsEnabled: e.target.checked })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {/* Switch Cupones */}
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Módulo de Cupones y Ofertas Flash</p>
                <p className="text-xs text-muted mt-0.5">Habilita cupones promocionales y barra de inserción de códigos de descuento en checkout.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.couponsEnabled || false}
                  onChange={(e) => setFormData({ ...formData, couponsEnabled: e.target.checked })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {/* Switch Reclamaciones */}
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Módulo de Garantías y Reclamos</p>
                <p className="text-xs text-muted mt-0.5">Permite a los clientes iniciar solicitudes de cambio o reclamo de garantía para pedidos completados.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.claimsEnabled || false}
                  onChange={(e) => setFormData({ ...formData, claimsEnabled: e.target.checked })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {/* Switch Mayoreo */}
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Módulo de Ventas al por Mayor</p>
                <p className="text-xs text-muted mt-0.5">Permite aplicar descuentos automáticos por volumen de compra mayorista configurado.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.wholesaleSettings?.enabled || false}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    wholesaleSettings: { ...formData.wholesaleSettings, enabled: e.target.checked } 
                  })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                setIsSaving(true)
                try {
                  const payload = {
                    creditsEnabled: formData.creditsEnabled ?? true,
                    couponsEnabled: formData.couponsEnabled ?? true,
                    claimsEnabled: formData.claimsEnabled ?? false,
                    tablesEnabled: formData.tablesEnabled ?? false,
                    wholesaleSettings: formData.wholesaleSettings
                  }
                  await updateAppConfig(payload)
                  config.setConfig(payload)
                  setSaveMessage({ type: 'success', text: 'Módulos actualizados correctamente.' })
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar configuración de módulos.' })
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
            >
              <Save size={18} /> Guardar Configuración de Módulos
            </button>
          </div>
        </div>
      )}

      {/* 8. Subsección: Facturación DIAN */}
      {activeSubSection === 'dev-dian' && (
        <div className="bg-surface rounded-3xl border border-app overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-app bg-surface-2/30">
            <h3 className="text-sm font-black text-app">Facturación DIAN</h3>
            <p className="text-[10px] text-muted mt-1">Introduce los datos fiscales y el IVA por defecto (Colombia)</p>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app shadow-sm">
              <div>
                <p className="text-sm font-bold text-app">Habilitar Facturación Electrónica (Colombia)</p>
                <p className="text-xs text-muted mt-0.5">Activa la recopilación de datos fiscales de la DIAN en el checkout</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.dianSettings?.enabled ?? false}
                  onChange={async (e) => {
                    const checked = e.target.checked
                    const newDian = { ...(formData.dianSettings || {}), enabled: checked }
                    setFormData({ ...formData, dianSettings: newDian })
                    try {
                      await updateAppConfig({ dianSettings: newDian })
                      setSaveMessage({ type: 'success', text: checked ? 'Facturación electrónica activada.' : 'Facturación electrónica desactivada.' })
                      setTimeout(() => setSaveMessage(null), 3000)
                    } catch (err) {
                      console.error(err)
                    }
                  }} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {formData.dianSettings?.enabled && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-app border-b border-app pb-2">Información Fiscal del Negocio</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">Razón Social</label>
                    <input
                      type="text"
                      value={formData.dianSettings?.razonSocial || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dianSettings: { ...formData.dianSettings, razonSocial: e.target.value }
                      })}
                      placeholder="Ingresa la razón social o nombre registrado"
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-9">
                      <label className="block text-xs font-bold text-muted mb-1.5">NIT</label>
                      <input
                        type="text"
                        value={formData.dianSettings?.nit || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dianSettings: { ...formData.dianSettings, nit: e.target.value }
                        })}
                        placeholder="Ingresa el número de identificación tributaria (NIT/RUT)"
                        className="w-full h-11 px-3.5 rounded-xl bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-bold text-muted mb-1.5">DV</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={formData.dianSettings?.digitoVerificacion || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dianSettings: { ...formData.dianSettings, digitoVerificacion: e.target.value }
                        })}
                        placeholder="Ingresa la cantidad"
                        className="w-full h-11 text-center rounded-xl bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">Correo Electrónico Fiscal</label>
                    <input
                      type="email"
                      value={formData.dianSettings?.emailFiscal || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dianSettings: { ...formData.dianSettings, emailFiscal: e.target.value }
                      })}
                      placeholder="Ingresa el correo para recepción de facturas"
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">IVA por defecto (%)</label>
                    <input
                      type="number"
                      value={formData.dianSettings?.ivaPorDefecto ?? 19}
                      onChange={(e) => setFormData({
                        ...formData,
                        dianSettings: { ...formData.dianSettings, ivaPorDefecto: Number(e.target.value) }
                      })}
                      placeholder="Ingresa el porcentaje de impuesto (IVA)"
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-app">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateAppConfig({ dianSettings: formData.dianSettings })
                        setSaveMessage({ type: 'success', text: 'Datos fiscales de la DIAN guardados correctamente.' })
                        setTimeout(() => setSaveMessage(null), 3000)
                      } catch (err) {
                        console.error(err)
                        setSaveMessage({ type: 'error', text: 'Error al guardar datos fiscales.' })
                        setTimeout(() => setSaveMessage(null), 3000)
                      }
                    }}
                    className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border-none"
                  >
                    <Save size={16} /> Guardar Ajustes Fiscales
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Subsección: Métodos de Entrega */}
      {activeSubSection === 'dev-entregas' && (
        <div className="bg-surface rounded-3xl border border-app overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-app bg-surface-2/30">
            <h3 className="text-sm font-black text-app">Métodos de Entrega</h3>
            <p className="text-[10px] text-muted mt-1">Configura envíos, retiros interactivos en mapa y mensajeros de entrega</p>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Retiro en Local */}
            <div className="p-4 bg-surface-2/60 rounded-2xl border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-app">Retiro en Tienda / Local</p>
                  <p className="text-xs text-muted">Permite al cliente retirar el pedido físicamente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer"
                    checked={formData.deliverySettings?.pickup?.enabled ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: {
                        ...formData.deliverySettings,
                        pickup: { ...(formData.deliverySettings?.pickup || {}), enabled: e.target.checked }
                      }
                    })} />
                  <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              {(formData.deliverySettings?.pickup?.enabled ?? true) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-2">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-muted mb-2">Ubicación del Local en el Mapa</label>
                    <LeafletMapPicker
                      address={formData.deliverySettings?.pickup?.address || ''}
                      coords={formData.deliverySettings?.pickup?.coords || null}
                      onChange={({ address, coords }) => {
                        setFormData(prev => ({
                          ...prev,
                          deliverySettings: {
                            ...prev.deliverySettings,
                            pickup: {
                              ...(prev.deliverySettings?.pickup || {}),
                              address: address || (prev.deliverySettings?.pickup?.address || ''),
                              coords
                            }
                          }
                        }))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Dirección de Retiro (Manual)</label>
                    <input
                      type="text"
                      value={formData.deliverySettings?.pickup?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliverySettings: {
                          ...formData.deliverySettings,
                          pickup: { ...(formData.deliverySettings?.pickup || {}), address: e.target.value }
                        }
                      })}
                      placeholder="Ingresa la dirección exacta del local físico"
                      className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Instrucciones de recogida</label>
                    <input
                      type="text"
                      value={formData.deliverySettings?.pickup?.instructions || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliverySettings: {
                          ...formData.deliverySettings,
                          pickup: { ...(formData.deliverySettings?.pickup || {}), instructions: e.target.value }
                        }
                      })}
                      placeholder="Ingresa indicaciones claras para el retiro físico"
                      className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Domicilio / Envío */}
            <div className="p-4 bg-surface-2/60 rounded-2xl border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-app">Envío a Domicilio</p>
                  <p className="text-xs text-muted">Permite despachar pedidos a la dirección del cliente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer"
                    checked={formData.deliverySettings?.shipping?.enabled ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: {
                        ...formData.deliverySettings,
                        shipping: { ...(formData.deliverySettings?.shipping || {}), enabled: e.target.checked }
                      }
                    })} />
                  <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Entrega Digital */}
            <div className="p-4 bg-surface-2/60 rounded-2xl border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-app">Servicios / Entrega Digital</p>
                  <p className="text-xs text-muted">Adecuado para servicios presenciales o productos virtuales</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer"
                    checked={formData.deliverySettings?.digital?.enabled ?? false}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: {
                        ...formData.deliverySettings,
                        digital: { ...(formData.deliverySettings?.digital || {}), enabled: e.target.checked }
                      }
                    })} />
                  <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>

              {(formData.deliverySettings?.digital?.enabled ?? false) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Instrucciones</label>
                    <input
                      type="text"
                      value={formData.deliverySettings?.digital?.instructions || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliverySettings: {
                          ...formData.deliverySettings,
                          digital: { ...(formData.deliverySettings?.digital || {}), instructions: e.target.value }
                        }
                      })}
                      placeholder="Ingresa indicaciones para la entrega digital"
                      className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mensajero Propio */}
            <DeliveryCustomMessengerPanel formData={formData} setFormData={setFormData} />

          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                try {
                  const pEnabled = formData.deliverySettings?.pickup?.enabled ?? true;
                  const sEnabled = formData.deliverySettings?.shipping?.enabled ?? true;
                  const dEnabled = formData.deliverySettings?.digital?.enabled ?? false;
                  if (!pEnabled && !sEnabled && !dEnabled) {
                    setSaveMessage({ type: 'error', text: 'Debes habilitar al menos un método de entrega.' })
                    return;
                  }

                  await updateAppConfig({ 
                    deliverySettings: formData.deliverySettings || null
                  })
                  setSaveMessage({ type: 'success', text: 'Métodos de entrega guardados correctamente.' })
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar.' })
                }
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
            >
              <Save size={18} /> Guardar Métodos de Entrega
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
