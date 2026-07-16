import { useState, useMemo, useRef, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Clock, Package, CheckCircle, Search, ChevronDown, MapPin, FileText, XCircle, X, MessageCircle, DollarSign, Archive, CreditCard, Calendar, PackagePlus, Phone, ExternalLink, ShieldAlert, QrCode, Map, History } from 'lucide-react'
import { useOrders, useUpdateOrderStatus, OrderCard } from '../../features/orders'
import { useCredits } from '../../features/credits'
import { useWholesaleRequests, useUpdateWholesaleStatus } from '../../hooks/useWholesale'
import { ORDER_STATES, ORDER_STATE_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_METHODS, WHOLESALE_STATES } from '../../constants'
import { formatCurrency } from '../../utils/formatters'
import useAppConfigStore from '../../store/appConfigStore'
import usePortalStore from '../../store/portalStore'
import * as orderService from '../../features/orders'
import { DatePickerPortal as CustomDatePickerPortal } from '../../components/ui/DatePicker'
import * as wholesaleService from '../../services/wholesaleService'
import { fuzzyMatch } from '../../utils/search'
import { subscribeToClaims } from '../../services/claimsService'
import LeafletMapPicker from '../../components/ui/LeafletMapPicker'
import OrderShareModal from '../../components/admin/orders/OrderShareModal'
import OrderDeliveryPanel from '../../components/admin/orders/OrderDeliveryPanel'
import NumberInput from '../../components/ui/NumberInput'
import { useAlertConfirm } from '../../components/common/AlertConfirmContext'

function toLocalDate(ts) {
  if (!ts) return null
  if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate()
  if (ts instanceof Date) return ts
  if (typeof ts === 'object' && ts.seconds !== undefined) {
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000))
  }
  const parsed = new Date(ts)
  return isNaN(parsed.getTime()) ? null : parsed
}



export default function AdminOrders() {
  const [showArchived, setShowArchived] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0)
  const [selectedOrderForShare, setSelectedOrderForShare] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showWholesaleModal, setShowWholesaleModal] = useState(false)
  const [savedPriceModal, setSavedPriceModal] = useState({ isOpen: false, orderNumber: '', value: 0 })
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState(null)
  const triggerRef = useRef(null)

  const { data: orders = [], isLoading } = useOrders(showArchived, filterDate)
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const { appName, appIcon, whatsappAdmin, deliverySettings, claimsEnabled, creditsEnabled, couponsEnabled, onlineOrdersEnabled } = useAppConfigStore()
  const { data: credits = [] } = useCredits('activo')
  const { data: wholesaleRequests = [] } = useWholesaleRequests()
  const { mutate: updateWholesaleStatus } = useUpdateWholesaleStatus()
  const navigate = useNavigate()
  const { showAlert, showConfirm } = useAlertConfirm()

  // `navigate` excluido de las dependencias a propósito (ver fix de
  // WelcomePage.jsx/useAuthInit.js): su referencia puede cambiar entre
  // renders sin que eso deba re-disparar este efecto.
  useEffect(() => {
    if (!onlineOrdersEnabled) {
      navigate('/admin/home', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineOrdersEnabled])
  
  // Consumir el store del portal para validación de permisos por rol de empleado
  const { portalEmployee } = usePortalStore()

  useEffect(() => {
    const unsubscribe = subscribeToClaims((claimsList) => {
      const pendingCount = claimsList.filter(c => c.status === 'PENDING').length
      setPendingClaimsCount(pendingCount)
    })
    return () => unsubscribe()
  }, [])

  const pendingWholesaleCount = useMemo(() => {
    return wholesaleRequests.filter(r => r.estado === 'pendiente').length
  }, [wholesaleRequests])
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [currentArchivedPage, setCurrentArchivedPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // ─── Métricas Rápidas ──────────────────────────────────────────────────
  const metrics = useMemo(() => {
    let pendientes = 0
    let completados = 0
    const totalFiados = credits.reduce((sum, c) => sum + c.saldoPendiente, 0)

    orders.forEach(o => {
      if (!creditsEnabled && o.metodoPago === PAYMENT_METHODS.CREDIT) return
      if (o.estado === ORDER_STATES.PENDING) pendientes++
      if (o.estado === ORDER_STATES.COMPLETED) completados++
    })

    const items = [
      { label: 'Pendientes', value: pendientes, icon: Clock, color: 'text-warning' },
      { label: 'Completados', value: completados, icon: CheckCircle, color: 'text-success' },
    ]

    if (creditsEnabled) {
      items.push({ label: 'Créditos', value: formatCurrency(totalFiados), icon: CreditCard, color: 'text-primary', path: '/admin/credito' })
    }

    return items
  }, [orders, credits, creditsEnabled])

  // ─── Filtrado ──────────────────────────────────────────────────────────
  const filters = ['Todos', ORDER_STATES.PENDING, ORDER_STATES.COMPLETED, ORDER_STATES.CREDIT_APPROVED, ORDER_STATES.CANCELLED, ORDER_STATES.PENDING_CONCILIATION]

  const matchesSearchAndFilter = (order) => {
    if (!creditsEnabled && order.metodoPago === PAYMENT_METHODS.CREDIT) return false
    
    const matchesSearch = 
      fuzzyMatch(order.orderNumber, searchTerm) ||
      fuzzyMatch(order.cliente?.nombre, searchTerm) ||
      fuzzyMatch(order.cliente?.celular, searchTerm)
    
    let matchesFilter = false
    if (activeFilter === 'Todos') {
      matchesFilter = true
    } else {
      matchesFilter = order.estado === activeFilter
    }

    // Filtrar adicionalmente por fecha si se seleccionó una y estamos en Completado
    let matchesDate = true
    if (activeFilter === ORDER_STATES.COMPLETED && filterDate) {
      if (order.createdAt) {
        const dateObj = toLocalDate(order.createdAt)
        const orderDateStr = dateObj ? dateObj.toISOString().split('T')[0] : ''
        matchesDate = orderDateStr === filterDate
      } else {
        matchesDate = false
      }
    }

    return matchesSearch && matchesFilter && matchesDate
  }

  const { activeOrders, archivedOrders } = useMemo(() => {
    const active = []
    const archived = []
    orders.forEach(order => {
      if (matchesSearchAndFilter(order)) {
        if (order.archivado === true) {
          archived.push(order)
        } else {
          active.push(order)
        }
      }
    })
    return { activeOrders: active, archivedOrders: archived }
  }, [orders, searchTerm, activeFilter, filterDate])

  // Resetear páginas actuales si cambian los filtros o el término de búsqueda
  useMemo(() => {
    setCurrentPage(1)
    setCurrentArchivedPage(1)
  }, [searchTerm, activeFilter, filterDate])

  // Obtener pedidos para la página actual
  const paginatedActiveOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return activeOrders.slice(startIndex, endIndex)
  }, [activeOrders, currentPage])

  const totalPages = useMemo(() => {
    return Math.ceil(activeOrders.length / ITEMS_PER_PAGE)
  }, [activeOrders])

  // Obtener pedidos archivados para la página actual
  const paginatedArchivedOrders = useMemo(() => {
    const startIndex = (currentArchivedPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return archivedOrders.slice(startIndex, endIndex)
  }, [archivedOrders, currentArchivedPage])

  const totalArchivedPages = useMemo(() => {
    return Math.ceil(archivedOrders.length / ITEMS_PER_PAGE)
  }, [archivedOrders])

  const handleArchiveCompleteds = async () => {
    const toArchive = orders.filter(o =>
      (o.estado === ORDER_STATES.COMPLETED || o.estado === ORDER_STATES.CANCELLED) &&
      !o.archivado
    )

    if (toArchive.length === 0) {
      showAlert({ title: 'Sin pedidos', message: 'No hay pedidos completados o cancelados activos para archivar.', variant: 'info' })
      return
    }

    const ok = await showConfirm({
      title: 'Archivar pedidos',
      message: `¿Estás seguro de que deseas archivar ${toArchive.length} pedidos completados/cancelados?`,
      confirmLabel: 'Archivar',
      variant: 'warning',
    })
    if (ok) {
      try {
        setIsArchiving(true)
        await orderService.archiveOrders(toArchive)
        showAlert({ title: 'Hecho', message: 'Pedidos archivados correctamente.', variant: 'success' })
      } catch (err) {
        console.error(err)
        showAlert({ title: 'Error', message: 'Ocurrió un error al archivar los pedidos.', variant: 'error' })
      } finally {
        setIsArchiving(false)
      }
    }
  }

  // ─── Acciones ──────────────────────────────────────────────────────────
  const handleStatusChange = (order, newStatus, e) => {
    if (e) e.stopPropagation()
    
    if (newStatus === ORDER_STATES.COMPLETED) {
      const confirmMsg = `¿Estás seguro de marcar el pedido ${order.orderNumber} como Completado?\n\nEsta acción descontará definitivamente el stock del inventario.`
      setConfirmDialog({ 
        order, 
        newStatus, 
        message: confirmMsg, 
        title: 'Completar Pedido', 
        iconColor: 'text-green-500', 
        iconBg: 'bg-green-500/10',
        iconBorder: 'border-green-500/20',
        btnBg: 'bg-green-500'
      })
    } else if (newStatus === ORDER_STATES.CREDIT_APPROVED) {
      const confirmMsg = `¿Estás seguro de Aprobar el Crédito para el pedido ${order.orderNumber}?\n\nEsta acción descontará definitivamente el stock del inventario y generará la cuenta por cobrar en la pestaña de créditos.`
      setConfirmDialog({ 
        order, 
        newStatus, 
        message: confirmMsg, 
        title: 'Aprobar Crédito', 
        iconColor: 'text-blue-500', 
        iconBg: 'bg-blue-500/10',
        iconBorder: 'border-blue-500/20',
        btnBg: 'bg-blue-500'
      })
    } else if (newStatus === ORDER_STATES.CANCELLED) {
      setConfirmDialog({ 
        order, 
        newStatus, 
        message: `¿Seguro que quieres cancelar el pedido ${order.orderNumber}?`, 
        title: 'Cancelar Pedido', 
        iconColor: 'text-red-500', 
        iconBg: 'bg-red-500/10',
        iconBorder: 'border-red-500/20',
        btnBg: 'bg-red-500'
      })
    } else {
      updateStatus({ id: order.id, newStatus, currentOrder: order })
    }
  }

  const confirmStatusChange = () => {
    if (confirmDialog) {
      updateStatus({ id: confirmDialog.order.id, newStatus: confirmDialog.newStatus, currentOrder: confirmDialog.order })
      setConfirmDialog(null)
    }
  }

  const handlePrintReceipt = (order) => {
    // Usamos un iframe oculto para evitar el bloqueo de ventanas emergentes (pop-ups)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    
    const paymentLabel = order.metodoPago === PAYMENT_METHODS.CREDIT 
      ? 'Crédito (Fiado)' 
      : order.metodoPago === PAYMENT_METHODS.TRANSFER 
      ? 'Transferencia' 
      : 'Efectivo'

    const deliveryLabel = order.tipoEntrega === 'retiro'
      ? 'Retiro en Tienda'
      : order.tipoEntrega === 'digital'
      ? 'Digital'
      : 'Domicilio'

    const subtotal = order.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    const { bankInfo } = useAppConfigStore.getState()

    const bankDetailsHtml = (order.metodoPago === PAYMENT_METHODS.TRANSFER && bankInfo && bankInfo.numeroCuenta)
      ? `
        <div class="info-box" style="grid-column: 1 / -1; margin-top: 15px;">
          <h3>Datos para Transferencia Bancaria</h3>
          <p><strong>Banco:</strong> ${bankInfo.banco || ''} (${bankInfo.tipoCuenta === 'ahorros' ? 'Ahorros' : 'Corriente'})</p>
          <p><strong>Número de Cuenta:</strong> ${bankInfo.numeroCuenta || ''}</p>
          <p><strong>Titular:</strong> ${bankInfo.titular || ''}</p>
          ${bankInfo.cedulaNit ? `<p><strong>Cédula/NIT:</strong> ${bankInfo.cedulaNit}</p>` : ''}
        </div>
      `
      : ''

    const notesHtml = order.notas
      ? `
        <div style="margin-top: 15px; padding: 12px; background-color: #f9f9f9; border-left: 4px solid #ccc; font-size: 13px; font-style: italic; border-radius: 4px;">
          <strong>Notas del cliente:</strong> ${order.notas}
        </div>
      `
      : ''

    iframe.contentDocument.write(`
      <html>
        <head>
          <title>Factura Pedido ${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #000; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .header img.logo { max-width: 150px; max-height: 80px; margin-bottom: 15px; object-fit: contain; }
            .header h1 { margin: 0 0 5px 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 0 0 5px 0; font-size: 14px; color: #555; }
            .order-meta { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; }
            .info-box { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .info-box h3 { margin-top: 0; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #000; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .totals-table { width: 40%; margin-left: auto; border-collapse: collapse; font-size: 14px; margin-bottom: 30px; }
            .totals-table td { padding: 6px 10px; border: none; }
            .totals-table .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #000; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${appIcon ? `<img src="${appIcon}" alt="Logo" class="logo" />` : ''}
            <h1>${appName || 'Factura de Venta'}</h1>
            ${whatsappAdmin ? `<p>WhatsApp: ${whatsappAdmin}</p>` : ''}
            
            <div class="order-meta">
              <p>Comprobante de Pedido #${order.orderNumber}</p>
              <p>Fecha: ${toLocalDate(order.createdAt)?.toLocaleString() || 'Reciente'}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-box">
              <h3>Datos del Cliente</h3>
              <p><strong>Nombre:</strong> ${order.cliente?.nombre || 'N/A'}</p>
              <p><strong>Celular:</strong> ${order.cliente?.celular || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>Datos de Entrega / Pago</h3>
              <p><strong>Tipo Entrega:</strong> ${deliveryLabel}</p>
              ${order.tipoEntrega !== 'retiro'
                ? `<p><strong>Dirección:</strong> ${order.cliente?.direccion || 'N/A'}</p>
                   <p><strong>Ciudad/Barrio:</strong> ${order.cliente?.ciudad || ''} - ${order.cliente?.barrio || ''}</p>`
                : ''
              }
              <p><strong>Método de Pago:</strong> ${paymentLabel}</p>
            </div>
            ${bankDetailsHtml}
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.nombre}</strong><br/>
                    <small style="color: #666;">
                      ${item.atributos && Object.values(item.atributos).length > 0
                        ? Object.entries(item.atributos).map(([key, val]) => {
                            if (typeof val === 'string' && val.startsWith('#')) {
                              return `${key}: <span style="display:inline-block; width:12px; height:12px; border-radius:50%; border:1px solid #ccc; background-color:${val}; vertical-align:middle; margin-right:4px;"></span> ${val}`
                            }
                            return `${key}: ${val}`
                          }).join(' • ')
                        : (item.talla || item.color)
                          ? [
                              item.talla ? `Talla: ${item.talla}` : '',
                              item.color ? (item.color.startsWith('#') 
                                ? `Color: <span style="display:inline-block; width:12px; height:12px; border-radius:50%; border:1px solid #ccc; background-color:${item.color}; vertical-align:middle; margin-right:4px;"></span> ${item.color}`
                                : `Color: ${item.color}`) : ''
                            ].filter(Boolean).join(' • ')
                          : ''}
                    </small>
                  </td>
                  <td>${item.cantidad}</td>
                  <td class="text-right">${formatCurrency(item.precio)}</td>
                  <td class="text-right">${formatCurrency(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="totals-table">
            <tbody>
              <tr>
                <td class="text-right">Subtotal:</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
              </tr>
              ${order.costoEnvio > 0
                ? `<tr>
                    <td class="text-right">Costo de Envío:</td>
                    <td class="text-right">+${formatCurrency(order.costoEnvio)}</td>
                   </tr>`
                : ''
              }
              ${order.descuento > 0
                ? `<tr>
                    <td class="text-right">Descuento:</td>
                    <td class="text-right">-${formatCurrency(order.descuento)}</td>
                   </tr>`
                : ''
              }
              <tr class="total-row">
                <td class="text-right">TOTAL A PAGAR:</td>
                <td class="text-right">${formatCurrency(order.total)}</td>
              </tr>
            </tbody>
          </table>

          ${notesHtml}

          <div class="footer">
            <p>Gracias por tu compra.</p>
            <p>Este documento es un comprobante de tu pedido.</p>
          </div>
        </body>
      </html>
    `)
    iframe.contentDocument.close()

    // Esperar a que renderice y luego imprimir
    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      // Limpiar el iframe del documento después de imprimir
      setTimeout(() => document.body.removeChild(iframe), 2000)
    }, 500)
  }

  const handleContactClient = (phone, orderNumber) => {
    const cleanPhone = phone?.replace(/\D/g, '') || ''
    const message = encodeURIComponent(`Hola, te escribimos de la tienda sobre tu pedido ${orderNumber}`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }



  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 w-full pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-app truncate">Gestión de Pedidos</h1>
            <p className="text-sm text-muted leading-tight mt-1">Administra y controla los pedidos del negocio.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {claimsEnabled && (
            <button
              onClick={() => navigate('/admin/reclamos')}
              className="relative flex-1 sm:flex-initial flex items-center justify-center gap-2 h-[50px] px-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all font-bold text-xs sm:text-sm cursor-pointer select-none active:scale-95 min-w-0"
            >
              <ShieldAlert size={16} className="shrink-0" />
              <span className="truncate">Garantías y Reclamos</span>
              {pendingClaimsCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-orange-600 text-white text-[10px] font-black absolute -top-2 -right-2 ring-2 ring-surface animate-pulse">
                  {pendingClaimsCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowWholesaleModal(true)}
            className="relative flex-1 sm:flex-initial flex items-center justify-center gap-2 h-[50px] px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-bold text-xs sm:text-sm cursor-pointer select-none active:scale-95 min-w-0"
          >
            <PackagePlus size={16} className="shrink-0" />
            <span className="truncate">Solicitudes por Encargo</span>
            {pendingWholesaleCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-black absolute -top-2 -right-2 ring-2 ring-surface animate-pulse">
                {pendingWholesaleCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Métricas con Rediseño Simétrico */}
      <div className={`grid ${creditsEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-3 md:gap-6 mb-6`}>
        {metrics.map((m, i) => {
          const Icon = m.icon
          const isClickable = !!m.path
          let iconBg = 'bg-warning/10 text-warning border-warning/20'
          if (m.label === 'Completados') iconBg = 'bg-success/10 text-success border-success/20'

          if (m.label === 'Créditos') {
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    "0 0 6px rgba(124, 58, 237, 0.25)",
                    "0 0 18px rgba(124, 58, 237, 0.55)",
                    "0 0 6px rgba(124, 58, 237, 0.25)"
                  ]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={() => navigate(m.path)}
                className="bg-surface border border-primary/30 rounded-2xl p-4 flex flex-col justify-center items-center min-h-[100px] md:min-h-[120px] relative overflow-hidden group text-center w-full select-none cursor-pointer"
              >
                {/* Degradado suave de fondo en hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="text-[9px] md:text-xs font-bold text-primary uppercase tracking-wider mb-2 text-center leading-none">
                  {m.label}
                </span>
                
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={16} className="md:size-5" />
                  </div>
                  <span className="text-[9px] md:text-[11px] font-bold text-muted mt-1 leading-tight group-hover:text-primary transition-colors">
                    Ver Créditos
                  </span>
                </div>
              </motion.button>
            )
          }

          return (
            <div
              key={i}
              className={`bg-surface border border-app rounded-2xl p-4 flex flex-col justify-center items-center min-h-[100px] md:min-h-[120px] shadow-sm relative text-center w-full`}
            >
              <span className="text-[9px] md:text-xs font-bold text-muted uppercase tracking-wider mb-3.5 text-center leading-none">
                {m.label}
              </span>
              
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <span className={`text-xl md:text-3xl font-black tracking-tight leading-none ${m.color}`}>
                  {m.value}
                </span>
                <div className={`w-7 h-7 md:w-10 md:h-10 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className="md:size-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col gap-4 mb-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Escribe el pedido, nombre o celular para buscar"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex flex-row overflow-x-auto scrollbar-none gap-2 pb-2 md:pb-0 max-w-full -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => { 
                setActiveFilter(f); 
                setShowArchived(false);
                setCurrentPage(1);
                setCurrentArchivedPage(1);
                if (f !== ORDER_STATES.COMPLETED) setFilterDate('');
              }}
              className={`flex-shrink-0 px-4 py-2 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === f
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface border border-app text-muted hover:text-app'
              }`}
            >
              {f === 'Todos' ? 'Todos' : ORDER_STATE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-10 text-muted">Cargando pedidos...</div>
      ) : activeOrders.length === 0 && archivedOrders.length === 0 ? (
        <div className="text-center py-10 bg-surface rounded-3xl border border-app text-muted">No se encontraron pedidos.</div>
      ) : (
        <div className="space-y-6">
           {/* Lista de Pedidos Activos Paginados */}
          {paginatedActiveOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {paginatedActiveOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrderId === order.id}
                    onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    onShare={setSelectedOrderForShare}
                    onShowHistory={setSelectedOrderForHistory}
                    onStatusChange={handleStatusChange}
                    onPrintReceipt={handlePrintReceipt}
                    onDeliveryCostSaved={({ orderNumber, value }) => setSavedPriceModal({ isOpen: true, orderNumber, value })}
                    isPending={isPending}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-surface rounded-3xl border border-app text-muted">
              No hay pedidos activos en este estado.
            </div>
          )}

          {/* Componente de Paginación Premium */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-app p-4 rounded-2xl shadow-sm mt-4">
              <span className="text-xs font-bold text-muted">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, activeOrders.length)} de {activeOrders.length} pedidos
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 h-9 rounded-xl border border-app bg-surface hover:bg-surface-2 text-xs font-bold text-app transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => {
                  const pageNum = idx + 1
                  // Mostrar primera, última, y páginas adyacentes a la actual
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-app bg-surface hover:bg-surface-2 text-app'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                  
                  // Mostrar elipsis para indicar páginas intermedias omitidas
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-xs text-muted px-1">...</span>
                  }
                  
                  return null
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 h-9 rounded-xl border border-app bg-surface hover:bg-surface-2 text-xs font-bold text-app transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Contenedor de Botones de Archivados e Historial al final de la vista de listado - Exclusivo para COMPLETADOS */}
          {activeFilter === ORDER_STATES.COMPLETED && (
            <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-app w-full">
              <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full">
                {/* Botón de Archivar Completados activos */}
                <button
                  onClick={handleArchiveCompleteds}
                  disabled={isArchiving}
                  className="flex items-center justify-center gap-2 h-11 px-5 bg-surface border border-app hover:bg-surface-2 text-app rounded-xl text-xs font-bold shadow-sm hover:border-primary transition-all active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  <Archive size={14} className="text-muted" />
                  <span>{isArchiving ? 'Archivando...' : 'Archivar Historial'}</span>
                </button>

                {/* Botón "Ver archivados" con datepicker premium */}
                <button
                  ref={triggerRef}
                  onClick={() => setPickerOpen(v => !v)}
                  className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-xs font-bold shadow-sm border transition-all active:scale-95 cursor-pointer uppercase tracking-wider ${
                    filterDate 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-surface border border-app hover:bg-surface-2 text-app hover:border-primary'
                  }`}
                >
                  <Calendar size={14} />
                  <span>
                    {filterDate 
                      ? `Archivados: ${new Date(filterDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                      : 'Ver archivados'}
                  </span>
                </button>

                <CustomDatePickerPortal
                  open={pickerOpen}
                  setOpen={setPickerOpen}
                  value={filterDate}
                  onChange={(val) => {
                    setFilterDate(val)
                    if (val) setShowArchived(true)
                  }}
                  triggerRef={triggerRef}
                />

                {/* Botón para limpiar filtro de fecha si hay uno seleccionado */}
                {filterDate && (
                  <button
                    onClick={() => {
                      setFilterDate('')
                      setShowArchived(false)
                    }}
                    className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-xs font-bold border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Limpiar Fecha</span>
                  </button>
                )}
              </div>

              {/* Listado de Pedidos Archivados (anteriores) filtrados */}
              <AnimatePresence>
                {(showArchived || filterDate) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full space-y-4 overflow-hidden mt-4"
                  >
                    <div className="flex items-center gap-3 px-1 my-3">
                      <div className="h-[1px] bg-app flex-1 opacity-20"></div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                        {filterDate 
                          ? `Pedidos Archivados del ${new Date(filterDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : 'Todos los pedidos archivados'}
                      </span>
                      <div className="h-[1px] bg-app flex-1 opacity-20"></div>
                    </div>

                    {paginatedArchivedOrders.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          {paginatedArchivedOrders.map(order => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              isExpanded={expandedOrderId === order.id}
                              onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                              onShare={setSelectedOrderForShare}
                              onShowHistory={setSelectedOrderForHistory}
                              onStatusChange={handleStatusChange}
                              onPrintReceipt={handlePrintReceipt}
                              onDeliveryCostSaved={({ orderNumber, value }) => setSavedPriceModal({ isOpen: true, orderNumber, value })}
                              isPending={isPending}
                            />
                          ))}
                        </div>

                        {/* Paginador para Pedidos Archivados */}
                        {totalArchivedPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-app p-4 rounded-2xl shadow-sm mt-4">
                            <span className="text-xs font-bold text-muted">
                              Mostrando {((currentArchivedPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentArchivedPage * ITEMS_PER_PAGE, archivedOrders.length)} de {archivedOrders.length} archivados
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setCurrentArchivedPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentArchivedPage === 1}
                                className="px-3 h-9 rounded-xl border border-app bg-surface hover:bg-surface-2 text-xs font-bold text-app transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                              >
                                Anterior
                              </button>
                              
                              {Array.from({ length: totalArchivedPages }, (_, idx) => {
                                const pageNum = idx + 1
                                if (
                                  pageNum === 1 || 
                                  pageNum === totalArchivedPages || 
                                  Math.abs(pageNum - currentArchivedPage) <= 1
                                ) {
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentArchivedPage(pageNum)}
                                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                                        currentArchivedPage === pageNum
                                          ? 'bg-primary text-white shadow-sm'
                                          : 'border border-app bg-surface hover:bg-surface-2 text-app'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  )
                                }
                                
                                if (pageNum === 2 || pageNum === totalArchivedPages - 1) {
                                  return <span key={pageNum} className="text-xs text-muted px-1">...</span>
                                }
                                
                                return null
                              })}

                              <button
                                onClick={() => setCurrentArchivedPage(prev => Math.min(prev + 1, totalArchivedPages))}
                                disabled={currentArchivedPage === totalArchivedPages}
                                className="px-3 h-9 rounded-xl border border-app bg-surface hover:bg-surface-2 text-xs font-bold text-app transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                              >
                                Siguiente
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted">
                        No hay pedidos archivados para esta fecha.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación Moderno */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-app rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className={`w-16 h-16 rounded-2xl ${confirmDialog.iconBg} flex items-center justify-center mx-auto mb-4 border ${confirmDialog.iconBorder}`}>
                {confirmDialog.newStatus === ORDER_STATES.COMPLETED ? <CheckCircle size={32} className={confirmDialog.iconColor} /> : <XCircle size={32} className={confirmDialog.iconColor} />}
              </div>
              <h2 className="text-xl font-black text-app text-center mb-2">{confirmDialog.title}</h2>
              <p className="text-sm text-muted text-center mb-6 whitespace-pre-wrap">{confirmDialog.message}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="h-12 flex justify-center items-center rounded-xl font-bold text-app bg-surface-2 hover:bg-surface border border-app transition-colors"
                >
                  Regresar
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={isPending}
                  className={`h-12 flex justify-center items-center rounded-xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${confirmDialog.btnBg}`}
                >
                  {isPending ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Historial de Pedido */}
      <AnimatePresence>
        {selectedOrderForHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrderForHistory(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-app rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-app">Historial del Pedido</h2>
                    <p className="text-xs text-muted font-mono">{selectedOrderForHistory.orderNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderForHistory(null)}
                  className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-app flex items-center justify-center text-muted hover:text-app transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 my-6">
                <div className="bg-surface-2/40 border border-app rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Cliente:</span>
                    <span className="font-bold text-app">{selectedOrderForHistory.cliente?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Método de Pago:</span>
                    <span className="font-bold text-app uppercase">{PAYMENT_METHOD_LABELS[selectedOrderForHistory.metodoPago] || selectedOrderForHistory.metodoPago}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tipo de Entrega:</span>
                    <span className="font-bold text-app capitalize">{selectedOrderForHistory.tipoEntrega || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Creado el:</span>
                    <span className="font-medium text-app">
                      {toLocalDate(selectedOrderForHistory.createdAt)?.toLocaleString() || '—'}
                    </span>
                  </div>
                  {selectedOrderForHistory.updatedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Completado el:</span>
                      <span className="font-medium text-app">
                        {toLocalDate(selectedOrderForHistory.updatedAt)?.toLocaleString() || '—'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-app">
                    <span className="text-muted font-bold">Total Facturado:</span>
                    <span className="font-black text-primary text-base">{formatCurrency(selectedOrderForHistory.total)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedOrderForHistory(null)}
                  className="h-11 flex justify-center items-center rounded-xl font-bold text-app bg-surface-2 hover:bg-surface border border-app transition-colors text-sm"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const trackingUrl = `/pedido/status?t=${selectedOrderForHistory.trackingToken || ''}`
                    window.open(trackingUrl, '_blank')
                  }}
                  className="h-11 flex justify-center items-center rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors text-sm shadow-md shadow-primary/10 active:scale-95"
                >
                  Ver Detalle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Solicitudes al por Mayor */}
      <WholesaleRequestsModal
        isOpen={showWholesaleModal}
        onClose={() => setShowWholesaleModal(false)}
        onUpdateStatus={(id, status) => updateWholesaleStatus({ id, newStatus: status })}
      />

      {/* Banner deslizable: confirmación de precio de domicilio guardado */}
      <AnimatePresence>
        {savedPriceModal.isOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onAnimationComplete={() => {
              if (savedPriceModal.isOpen) {
                setTimeout(() => setSavedPriceModal(prev => ({ ...prev, isOpen: false })), 2800)
              }
            }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4"
          >
            <div className="flex items-center gap-3 bg-surface border border-app shadow-2xl rounded-2xl p-4">
              <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-app leading-tight">¡Domicilio guardado!</p>
                <p className="text-[10px] text-muted mt-0.5 truncate">
                  Pedido {savedPriceModal.orderNumber} · Costo: {formatCurrency(savedPriceModal.value)}
                </p>
              </div>
              <button
                onClick={() => setSavedPriceModal(prev => ({ ...prev, isOpen: false }))}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors text-muted shrink-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal especializado de Compartición de Seguimiento (QR / Enlace / WhatsApp) */}
      <OrderShareModal
        isOpen={!!selectedOrderForShare}
        onClose={() => setSelectedOrderForShare(null)}
        order={selectedOrderForShare}
      />

    </motion.div>
  )
}

function WholesaleRequestsModal({ isOpen, onClose, onUpdateStatus }) {
  const [filter, setFilter] = useState('Todos')
  const [typeFilter, setTypeFilter] = useState('mayorista') // 'mayorista' o 'encargo' (sin opción 'Todos')
  const [requests, setRequests] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Bloquear scroll de la página trasera cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Resetear filtro de estado cuando cambia el tipo de pestaña para evitar inconsistencias
  useEffect(() => {
    setFilter('Todos')
  }, [typeFilter])

  const fetchPage = async (reset = false) => {
    if (isLoading) return
    setIsLoading(true)
    const cursor = reset ? null : lastDoc
    try {
      const res = await wholesaleService.getWholesaleRequestsPaged(typeFilter, filter, 10, cursor)
      if (reset) {
        setRequests(res.requests)
      } else {
        setRequests(prev => [...prev, ...res.requests])
      }
      setLastDoc(res.lastDoc)
      setHasMore(res.hasMore)
    } catch (error) {
      console.error("Error fetching wholesale requests page:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carga inicial y cambio de filtros
  useEffect(() => {
    if (isOpen) {
      fetchPage(true)
    } else {
      setRequests([])
      setLastDoc(null)
      setHasMore(false)
    }
  }, [isOpen, typeFilter, filter])

  if (!isOpen) return null

  const getStatusBadge = (state) => {
    switch (state) {
      case 'pendiente':
        return 'text-warning bg-warning/10 border-warning/20'
      case 'revisando':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'aprobado':
        return 'text-success bg-success/10 border-success/20'
      case 'rechazado':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-muted bg-surface-2'
    }
  }

  const getStatusLabel = (state) => {
    switch (state) {
      case 'pendiente': return 'Pendiente'
      case 'revisando': return 'En Revisión'
      case 'aprobado': return 'Aprobado'
      case 'rechazado': return 'Rechazado'
      default: return state
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Panel deslizable lateral */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md h-full bg-surface border-l border-app shadow-2xl flex flex-col z-10"
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-app flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-app">Solicitudes Especiales</h2>
              <p className="text-xs text-muted">Pedidos especiales y ventas al por mayor.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-2 hover:bg-surface border border-app text-muted hover:text-app transition-all cursor-pointer active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Selección Exclusiva de Tipo (Paso 1) */}
        <div className="px-5 pt-5 pb-3 border-b border-app bg-surface-2/30 flex gap-2">
          <button
            onClick={() => setTypeFilter('mayorista')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              typeFilter === 'mayorista'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface border-app text-muted hover:text-app'
            }`}
          >
            <Package size={16} />
            Ventas al por Mayor
          </button>
          <button
            onClick={() => setTypeFilter('encargo')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              typeFilter === 'encargo'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface border-app text-muted hover:text-app'
            }`}
          >
            <PackagePlus size={16} />
            Pedidos por Encargo
          </button>
        </div>

        {/* Filtros de Estado para el Tipo Seleccionado (Paso 2) */}
        <div className="px-5 py-3 border-b border-app flex flex-col gap-2 bg-surface-2/10">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Filtrar por estado:</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {['Todos', 'pendiente', 'revisando', 'aprobado', 'rechazado'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  filter === f
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface border-app text-muted hover:text-app'
                }`}
              >
                {f === 'Todos' ? 'Todos los estados' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {requests.length === 0 && !isLoading ? (
            <div className="text-center py-12 text-muted bg-surface-2/30 rounded-2xl border border-dashed border-app">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-xs font-bold">No hay solicitudes en esta categoría.</p>
            </div>
          ) : (
            <>
              {requests.map(req => {
                const formattedDate = req.createdAt
                  ? (toLocalDate(req.createdAt)?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || '—')
                  : 'Reciente'

                const isEncargo = req.tipo === 'encargo'
                const concept = isEncargo ? 'por encargo' : 'al por mayor'
                const waMsg = encodeURIComponent(`Hola ${req.clienteNombre}, te escribo del soporte de la tienda sobre tu solicitud ${concept} del producto "${req.productoNombre}" (Cantidad: ${req.cantidad}).`)

                return (
                  <div key={req.id} className="bg-surface-2/40 border border-app rounded-2xl p-4 shadow-xs relative space-y-3">
                    
                    {/* Fila superior: Tipo + Estado */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${
                        isEncargo 
                          ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' 
                          : 'text-primary bg-primary/10 border-primary/20'
                      }`}>
                        {isEncargo ? 'Por Encargo' : 'Al Por Mayor'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(req.estado)}`}>
                        {getStatusLabel(req.estado)}
                      </span>
                    </div>

                    {/* Detalle Producto */}
                    <div>
                      <h3 className="font-bold text-app text-sm leading-tight">{req.productoNombre}</h3>
                      <p className="text-[10px] text-muted font-semibold mt-1">Solicitado: {formattedDate}</p>
                    </div>

                    {/* Cantidad y observaciones */}
                    <div className="bg-surface border border-app rounded-xl p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted font-medium">Cantidad requerida:</span>
                        <span className="font-black text-primary text-sm">{req.cantidad} unidades</span>
                      </div>
                      {req.observaciones && (
                        <div className="pt-2 border-t border-app">
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Notas del cliente:</p>
                          <p className="text-xs text-app leading-relaxed italic bg-surface-2 p-2 rounded-lg">"{req.observaciones}"</p>
                        </div>
                      )}
                    </div>

                    {/* Fila de cliente y contacto */}
                    <div className="flex items-center justify-between pt-2 border-t border-app">
                      <div>
                        <p className="text-xs font-bold text-app">{req.clienteNombre}</p>
                        <p className="text-[10px] text-muted font-medium">Cel: {req.clienteCelular}</p>
                      </div>
                      <a
                        href={`https://wa.me/${req.clienteCelular.replace(/\D/g, '')}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-bold text-xs shadow-xs"
                      >
                        <Phone size={12} />
                        Chat WhatsApp
                      </a>
                    </div>

                    {/* Selector de estados para el admin */}
                    <div className="flex items-center gap-2 pt-2 border-t border-app">
                      <span className="text-[10px] font-bold text-muted uppercase">Estado:</span>
                      <div className="flex-1 grid grid-cols-3 gap-1">
                        {['revisando', 'aprobado', 'rechazado'].map(st => {
                          const isFinalState = req.estado === 'aprobado' || req.estado === 'rechazado'
                          const handleStatusUpdate = async () => {
                            // Actualizar estado en DB
                            await onUpdateStatus(req.id, st)
                            // Actualizar localmente la solicitud en el estado
                            setRequests(prev => prev.map(item => item.id === req.id ? { ...item, estado: st } : item))

                            // Mensaje de notificación asistida
                            const cleanPhone = req.clienteCelular.replace(/\D/g, '')
                            const concept = req.tipo === 'encargo' ? 'por encargo' : 'al por mayor'
                            const stLabel = st === 'revisando' ? 'En Revisión 🔍' : st === 'aprobado' ? 'Aprobado ✅' : 'Rechazado ❌'
                            
                            let customMsg = `Hola ${req.clienteNombre}, te escribimos para informarte que tu solicitud ${concept} de "${req.productoNombre}" (Cantidad: ${req.cantidad}) ha sido cambiada al estado: *${stLabel}*.`
                            
                            if (st === 'aprobado') {
                              customMsg += ` ¡Ya puedes proceder con tu orden!`
                            } else if (st === 'revisando') {
                              customMsg += ` Estamos verificando la disponibilidad y cotización.`
                            }

                            const encoded = encodeURIComponent(customMsg)
                            window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
                          }

                          const isActive = req.estado === st
                          const isDisabled = isActive || isFinalState

                          return (
                            <button
                              key={st}
                              disabled={isDisabled}
                              onClick={handleStatusUpdate}
                              className={`h-7 rounded-lg text-[9px] font-extrabold transition-all border cursor-pointer uppercase ${
                                isActive
                                  ? 'bg-app border-app text-muted opacity-50 pointer-events-none'
                                  : isDisabled
                                  ? 'bg-surface border-app text-muted/40 opacity-40 pointer-events-none'
                                  : 'bg-surface border-app text-app hover:border-primary/50'
                              }`}
                            >
                              {st === 'revisando' ? 'Revisar' : st === 'aprobado' ? 'Aprobar' : 'Rechazar'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Botón de Paginación */}
              {hasMore && (
                <div className="pt-2 pb-6 flex justify-center">
                  <button
                    onClick={() => fetchPage(false)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Cargar más solicitudes
                  </button>
                </div>
              )}

              {isLoading && requests.length > 0 && (
                <div className="py-4 text-center text-xs text-muted font-bold">
                  Cargando más...
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
