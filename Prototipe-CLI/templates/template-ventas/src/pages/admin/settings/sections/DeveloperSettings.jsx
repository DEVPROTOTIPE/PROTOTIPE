import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  KeyRound, Lock, Filter, TrendingUp, Receipt, Trash2, Smartphone, AlertTriangle, 
  ChevronRight, Plus, X, ShoppingBag, Wallet, BarChart3, Sparkles, Tag, ChevronDown, 
  Save, Loader2, CheckCircle
} from 'lucide-react'
import { DEV_PIN, COLLECTIONS } from '../../../../constants'
import { updateAppConfig, updateCatalogFilters, resetAppData } from '../../../../services/appConfigService'
import { reportAppFailureToDeveloper } from '../../../../services/telemetryService'
import { exportDeveloperReceiptPDF } from '../../../../services/pdfService'
import { useBilling } from '../../../../hooks/useBilling'
import { useOrders } from '../../../../hooks/useOrders'
import { auth } from '../../../../config/firebaseConfig'
import { signOutAdmin } from '../../../../services/authService'
import useAuthStore from '../../../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function DeveloperSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage,
  isSaving,
  setIsSaving,
  activeSubSection,
  setActiveSubSection
}) {
  const navigate = useNavigate()
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false)
  const [devPinInput, setDevPinInput] = useState('')
  const [devPinError, setDevPinError] = useState(false)

  // Diagnostics y Restauración
  const [confirmRestoreText, setConfirmRestoreText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Facturación y Firmas
  const { metrics: billingMetrics, isLoading: billingLoading } = useBilling()
  const { data: orders = [] } = useOrders()
  const [commissionInput, setCommissionInput] = useState(null)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)

  const handleVersionClick = () => {
    // Si queremos bloquear o resetear el estado
  }

  // --- FIRMA DIGITAL ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000000'
    
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY)
    if (!clientX || !clientY) return

    const x = clientX - rect.left
    const y = clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY)
    if (!clientX || !clientY) return

    const x = clientX - rect.left
    const y = clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleExportDeveloperReceiptPDF = () => {
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        console.error("Canvas ref is null")
        return
      }
      const signatureDataUrl = canvas.toDataURL('image/png')
      exportDeveloperReceiptPDF({ signatureDataUrl, orders, config, billingMetrics })
      setIsSignatureModalOpen(false)
    } catch (error) {
      console.error("Error al exportar el recibo en PDF:", error)
      setSaveMessage({ type: 'error', text: 'Error al generar PDF: ' + error.message })
    }
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
                placeholder="••••"
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
              },
              {
                id: 'dev-reporte-error',
                label: 'Reportar Error de Prueba',
                description: 'Envía un error simulado para validar la llegada al panel central de fallas',
                icon: AlertTriangle,
                iconBg: 'bg-rose-500/10 hover:bg-rose-500/15',
                iconColor: 'text-rose-500'
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
                          <input type="text" placeholder="Nombre (Ej. Marca)" value={attr.name}
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
                            <input type="text" placeholder="Opciones (Ej: Nike, Adidas)"
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
      {activeSubSection === 'dev-facturacion' && (() => {
        const currentPercent = billingMetrics?.commissionPercent ?? 1
        const fmt = (v) => `$${Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

        return (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-surface to-teal-500/5 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 -translate-y-8 translate-x-8" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Receipt size={24} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-app mb-1">Módulo de Facturación</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Inicialmente ya hiciste tu pago para iniciar el proyecto. Gracias por contribuir a mejorar tu negocio.
                  </p>
                </div>
              </div>
            </div>

            {billingLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-surface-2 border border-app rounded-2xl p-4 animate-pulse">
                    <div className="h-3 bg-app/20 rounded-full w-16 mb-3" />
                    <div className="h-7 bg-app/20 rounded-full w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 border border-app rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <ShoppingBag size={14} className="text-blue-500" />
                    </div>
                    <p className="text-xs text-muted font-medium">Ventas del mes</p>
                  </div>
                  <p className="text-xl font-black text-app">{fmt(billingMetrics?.totalMes)}</p>
                </div>

                <div className="bg-surface-2 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Wallet size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-muted font-medium">Mi comisión del mes</p>
                  </div>
                  <p className="text-xl font-black text-emerald-500">{fmt(billingMetrics?.comisionMes)}</p>
                </div>

                <div className="bg-surface-2 border border-app rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp size={14} className="text-purple-500" />
                    </div>
                    <p className="text-xs text-muted font-medium">Pedidos completados</p>
                  </div>
                  <p className="text-xl font-black text-app">{billingMetrics?.pedidosMes ?? 0}</p>
                  <p className="text-xs text-muted mt-0.5">este mes</p>
                </div>

                <div className="bg-surface-2 border border-app rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <BarChart3 size={14} className="text-amber-500" />
                    </div>
                    <p className="text-xs text-muted font-medium">Comisión acumulada</p>
                  </div>
                  <p className="text-xl font-black text-app">{fmt(billingMetrics?.comisionHistorica)}</p>
                  <p className="text-xs text-muted mt-0.5">histórico total</p>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-2xl border border-app overflow-hidden">
              <div className="px-5 py-4">
                <p className="text-sm font-bold text-app mb-1">Modelo de Facturación de Instancia</p>
                <p className="text-xs text-muted mb-4">Configurado de manera centralizada desde el Dashboard del Desarrollador.</p>
                <div className="p-3.5 bg-surface-2 border border-app rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted">Método Activo:</span>
                    <span className="font-bold text-emerald-500 uppercase">
                      {billingMetrics?.billingMode === 'percentage' && 'Porcentaje por Venta'}
                      {billingMetrics?.billingMode === 'fixed_per_service' && 'Valor Fijo por Servicio'}
                      {billingMetrics?.billingMode === 'flat_monthly' && 'Pago Mensual Fijo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-app pt-2.5">
                    <span className="font-semibold text-muted">Tarifa Pactada:</span>
                    <span className="font-bold text-app">
                      {billingMetrics?.billingMode === 'percentage' && `${billingMetrics?.comisionPorcentaje}%`}
                      {billingMetrics?.billingMode === 'fixed_per_service' && `${fmt(billingMetrics?.montoFijoServicio)} por pedido`}
                      {billingMetrics?.billingMode === 'flat_monthly' && `${fmt(billingMetrics?.pagoMensualFijo)} al mes`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!billingLoading && billingMetrics && (
              <>
                <div className="bg-surface rounded-2xl border border-app overflow-hidden">
                  <div className="px-5 py-4 border-b border-app">
                    <p className="text-sm font-bold text-app">Resumen de comisiones</p>
                    <p className="text-xs text-muted">Totales calculados sobre pedidos completados</p>
                  </div>
                  <div className="divide-y divide-app">
                    {[
                      { label: 'Ventas del mes', value: fmt(billingMetrics.totalMes), sub: `${billingMetrics.pedidosMes} pedidos completados` },
                      { label: 'Comisión del mes', value: fmt(billingMetrics.comisionMes), highlight: true },
                      { label: 'Total ventas histórico', value: fmt(billingMetrics.totalHistorico), sub: 'Todos los tiempos' },
                      { label: 'Comisión histórica acumulada', value: fmt(billingMetrics.comisionHistorica), highlight: true },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <p className="text-xs font-semibold text-app">{row.label}</p>
                          {row.sub && <p className="text-[10px] text-muted mt-0.5">{row.sub}</p>}
                        </div>
                        <p className={`text-sm font-black ${row.highlight ? 'text-emerald-500' : 'text-app'}`}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl border border-app p-5 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-app mb-1">Generar Recibo y Firma de Conformidad</p>
                    <p className="text-xs text-muted leading-relaxed">
                      Genera el recibo detallado de comisiones mensuales para que el cliente lo firme y lo exporte en PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSignatureModalOpen(true)
                      setTimeout(() => clearCanvas(), 50)
                    }}
                    className="h-11 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-sm border-none"
                  >
                    <Receipt size={16} />
                    Firmar y Exportar Recibo del Mes
                  </button>
                </div>

                <AnimatePresence>
                  {isSignatureModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSignatureModalOpen(false)}
                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                      />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-surface rounded-3xl p-6 shadow-2xl relative max-w-sm w-full mx-4 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-app pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-app">Firma de Conformidad</h3>
                            <p className="text-[10px] text-muted">Dibuja la firma táctil del cliente en el recuadro</p>
                          </div>
                          <button
                            onClick={() => setIsSignatureModalOpen(false)}
                            className="w-8 h-8 rounded-xl bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-muted cursor-pointer border-none"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="bg-surface-2 rounded-2xl overflow-hidden flex flex-col items-center p-2 shadow-inner">
                          <canvas
                            ref={canvasRef}
                            width={300}
                            height={150}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="bg-white rounded-xl cursor-crosshair max-w-full"
                            style={{ display: 'block', touchAction: 'none' }}
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={clearCanvas}
                            className="flex-1 h-11 rounded-xl font-bold text-xs bg-surface-2 hover:bg-surface-3 text-app active:scale-95 transition-all cursor-pointer border-none"
                          >
                            Limpiar Firma
                          </button>
                          <button
                            onClick={handleExportDeveloperReceiptPDF}
                            className="flex-1 h-11 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all cursor-pointer border-none"
                          >
                            Generar PDF
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )
      })()}

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
                  placeholder="Escribe aquí..."
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
                placeholder="Ej. 573001234567"
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
                              placeholder="#EF4444"
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
                              placeholder="#FFFFFF"
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
                              placeholder="#F59E0B"
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
                              placeholder="#FFFFFF"
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
                              placeholder="#3B82F6"
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
                              placeholder="#FFFFFF"
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
                              placeholder="#10B981"
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
                              placeholder="#FFFFFF"
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

      {/* 6. Subsección: Telemetría de Errores */}
      {activeSubSection === 'dev-reporte-error' && (
        <div className="bg-surface rounded-3xl shadow-sm border border-app overflow-hidden">
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-app">Canal de Telemetría de Fallos</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                Esta herramienta permite gatillar de manera manual un error simulado en la aplicación de ventas actual y reportarlo en tiempo real a la consola de administración central.
              </p>
            </div>
            
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 text-left border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                {message.type === 'error' ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle size={18} className="shrink-0" />}
                <span className="text-xs font-bold leading-relaxed">{message.text}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  setMessage(null);
                  try {
                    const { reportAppFailureToDeveloper } = await import('../../../../services/telemetryService');
                    const testError = new Error('TestTelemetryError: Prueba manual desde Opciones de Desarrollo de Ventas.');
                    await reportAppFailureToDeveloper(testError.message, testError.stack);
                    setMessage({
                      type: 'success',
                      text: '¡Reporte de error de prueba enviado con éxito a Firestore Central! Verifica la consola del desarrollador.'
                    });
                  } catch (err) {
                    console.error(err);
                    setMessage({
                      type: 'error',
                      text: `Fallo al reportar: ${err.message || 'Error desconocido'}`
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full sm:w-auto px-6 h-11 bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 active:scale-95 disabled:opacity-50 transition-all cursor-pointer mx-auto shadow-sm border-none"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <AlertTriangle size={16} />
                )}
                Enviar Error de Prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
