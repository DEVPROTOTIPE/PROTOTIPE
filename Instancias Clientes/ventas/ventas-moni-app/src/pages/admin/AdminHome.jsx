import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, DollarSign, AlertTriangle,
  Package, ShoppingBag, CreditCard, Settings, ChevronRight,
  BarChart3, Banknote, ArrowRight, X, Wallet, Percent, QrCode, Megaphone, Loader2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrders } from '../../features/orders'
import { useCredits } from '../../features/credits'
import { useProducts } from '../../features/inventory'
import { useBilling } from '../../features/billing'
import { ORDER_STATES, PAYMENT_METHODS } from '../../constants'
import { formatCurrency } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'
import useAppConfigStore from '../../store/appConfigStore'
import { useEffect } from 'react'
import { getTrackingMetrics } from '../../services/trackingAnalyticsService'

export default function AdminHome() {
  const { user, isLoading: isAuthLoading } = useAuthStore()
  const { sellerName, appIcon, appName, creditsEnabled } = useAppConfigStore()
  const navigate = useNavigate()
  const { data: orders = [] } = useOrders()
  const { data: credits = [] } = useCredits('activo')
  const { data: products = [] } = useProducts()
  const { metrics: billingMetrics, isLoading: billingLoading } = useBilling()
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [isBursting, setIsBursting] = useState(false)
  const [showCommandCenter, setShowCommandCenter] = useState(false)

  // Estados para telemetría de conversión de seguimiento
  const [trackingMetrics, setTrackingMetrics] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(true)

  useEffect(() => {
    // Guard: solo consultar métricas de tracking cuando el usuario está autenticado
    // Y useAuthInit ya verificó el rol contra Firestore (isAuthLoading === false).
    // Sin este guard, las queries se disparan durante la ventana de ~200ms de validación
    // cuando un usuario no-autorizado logra autenticarse momentaneamente.
    if (!user || isAuthLoading) {
      setTrackingLoading(false)
      return
    }
    getTrackingMetrics().then(data => {
      setTrackingMetrics(data)
      setTrackingLoading(false)
    }).catch(err => {
      console.error('[getTrackingMetrics] Error:', err)
      setTrackingLoading(false)
    })
  }, [user, isAuthLoading])

  // ─── CÁLCULO DE MÉTRICAS GENERALES ────────────────────────────────────────
  const metricas = useMemo(() => {
    const completedOrders = orders.filter(o => {
      if (o.estado !== ORDER_STATES.COMPLETED) return false
      if (!creditsEnabled && o.metodoPago === PAYMENT_METHODS.CREDIT) return false
      return true
    })
    const totalVentas = completedOrders.reduce((sum, o) => sum + o.total, 0)
    const pendingOrders = orders.filter(o => {
      if (o.estado !== ORDER_STATES.PENDING) return false
      if (!creditsEnabled && o.metodoPago === PAYMENT_METHODS.CREDIT) return false
      return true
    }).length
    const totalFiado = credits.reduce((sum, c) => sum + c.saldoPendiente, 0)
    
    // Contar todas las variantes individuales bajo el umbral de alerta
    const alerts = []
    products.forEach(p => {
      if (p.stockInfinito === true) return
      (p.variantes || []).forEach(v => {
        if (v.stock <= p.umbralAlerta) {
          alerts.push({ productId: p.id, variantId: v.id })
        }
      })
    })

    // Función auxiliar para determinar si la fecha es hoy
    const isToday = (dateObj) => {
      if (!dateObj) return false
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj)
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
    }

    // Filtrar pedidos completados hoy
    const todayOrders = orders.filter(o => {
      if (o.estado !== ORDER_STATES.COMPLETED) return false
      if (!creditsEnabled && o.metodoPago === PAYMENT_METHODS.CREDIT) return false
      return isToday(o.createdAt)
    })
    
    let cashTotal = 0
    let transferTotal = 0
    let creditTotal = 0

    todayOrders.forEach(o => {
      if (o.metodoPago === PAYMENT_METHODS.CASH) {
        cashTotal += o.total
      } else if (o.metodoPago === PAYMENT_METHODS.TRANSFER) {
        transferTotal += o.total
      } else if (o.metodoPago === PAYMENT_METHODS.CREDIT) {
        creditTotal += o.total
      }
    })

    const cajaTotal = cashTotal + transferTotal + (creditsEnabled ? creditTotal : 0)
    
    return { 
      ventas: totalVentas, 
      ventasHoy: cajaTotal,
      pedidosPendientes: pendingOrders, 
      fiado: totalFiado, 
      stockBajo: alerts,
      cajaTotal,
      cashTotal,
      transferTotal,
      creditTotal
    }
  }, [orders, credits, products, creditsEnabled])

  // ─── CÁLCULO DE PRODUCTOS MÁS VENDIDOS (TENDENCIAS) ───────────────────────
  const topProducts = useMemo(() => {
    const completedOrders = orders.filter(o => o.estado === ORDER_STATES.COMPLETED)
    const productSales = {}

    completedOrders.forEach(order => {
      ;(order.items || []).forEach(item => {
        const id = item.productId || item.id || item.nombre
        if (!id) return
        if (!productSales[id]) {
          productSales[id] = {
            id,
            nombre: item.nombre,
            imagen: item.imagen || item.imageUrl || null,
            cantidadVendida: 0,
            ingresosGenerados: 0
          }
        }
        productSales[id].cantidadVendida += (item.cantidad || 1)
        productSales[id].ingresosGenerados += (item.precio || 0) * (item.cantidad || 1)
      })
    })

    return Object.values(productSales)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5)
  }, [orders])

  // ─── ANIMACIONES ──────────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  // Guard de seguridad: si useAuthInit aún está validando el rol en Firestore,
  // no renderizamos NADA. Esto evita que useOrders/useCredits/useProducts disparen
  // queries de Firestore contra una sesión no-autorizada durante la ventana de ~200ms
  // antes de que useAuthInit complete el signOut del usuario intruso.
  if (isAuthLoading) return null

  return (
    <>
      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 w-full"
    >
      {/* Estilos CSS para el resplandor premium en alertas */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-purple {
          0%, 100% { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-color: rgba(124, 58, 237, 0.1); transform: scale(1); }
          50% { box-shadow: 0 0 15px rgba(124, 58, 237, 0.35); border-color: rgba(124, 58, 237, 0.55); transform: scale(1.018); }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-color: rgba(239, 68, 68, 0.1); transform: scale(1); }
          50% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.35); border-color: rgba(239, 68, 68, 0.55); transform: scale(1.018); }
        }
        .pulse-purple-alert { animation: pulse-purple 2.2s infinite ease-in-out !important; }
        .pulse-red-alert { animation: pulse-red 2.2s infinite ease-in-out !important; }
      `}} />

      {/* Cabecera Semicircular Full-Bleed (Estilo Banner Curvo) */}
      <div className="relative -mx-4 -mt-4 mb-12 md:-mx-8 md:-mt-8 z-10">
        {/* Banner de Fondo con Degradado de Marca */}
        <div 
          className="relative text-white pt-8 pb-14 px-6 text-center shadow-lg rounded-b-[40%_25px] md:rounded-b-[50%_40px] flex flex-col items-center justify-center min-h-[180px] md:min-h-[220px] backdrop-blur-lg"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 90%, transparent), color-mix(in srgb, color-mix(in srgb, var(--color-primary) 55%, var(--color-accent)) 85%, transparent))'
          }}
        >
          {/* Orbes de luz decorativos GPU-accelerated dinámicos (adaptados a la paleta activa) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-b-[40%_25px] md:rounded-b-[50%_40px] pointer-events-none">
            {/* Orbe 1: Mezcla Luminosa con Luz Primaria */}
            <motion.div 
              className="absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-30"
              style={{
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary-light) 50%, white) 0%, transparent 70%)',
                willChange: 'transform'
              }}
              animate={{
                x: [0, 25, 0],
                y: [0, -15, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Orbe 2: Mezcla Viva con Acento del Tema */}
            <motion.div 
              className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-35"
              style={{
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 30%, var(--color-accent)) 0%, transparent 75%)',
                willChange: 'transform'
              }}
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-10 max-w-xl flex flex-col items-center gap-2">
            {/* Tag de Estado */}
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
              </span>
              Panel de Control
            </span>
 
            {/* Saludo Principal con color adaptativo de acento en el nombre del vendedor */}
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 leading-tight text-white">
              {(() => {
                const hour = new Date().getHours()
                if (hour < 12) return 'Buenos días'
                if (hour < 18) return 'Buenas tardes'
                return 'Buenas noches'
              })()}, <span className="text-[var(--color-primary-light)] font-black" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.35)' }}>{sellerName || 'Mónica Henao'}</span>
            </h1>
 
            {/* Línea divisoria fina */}
            <div className="w-24 h-[1px] bg-white/30 my-1" />
 
            {/* Fecha y Subtexto */}
            <p className="text-xs text-white/80 font-medium tracking-wide uppercase">
              {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </p>
            <p className="text-[10px] md:text-xs text-white/70 italic mt-0.5">
              "Resumen de operaciones y estado comercial del comercio"
            </p>
          </div>
 
          {/* Avatar / Inicial circular overlapping en el centro inferior con aura de resplandor adaptada al tema */}
          <div 
            className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15)) drop-shadow(0 0 10px var(--color-accent))'
            }}
          >
            {appIcon ? (
              <div 
                className="relative shrink-0 select-none pointer-events-auto cursor-pointer"
                onClick={() => {
                  setIsBursting(true)
                  setTimeout(() => setIsBursting(false), 600)
                  setShowCommandCenter(true)
                }}
              >
                {/* Expansive rings (Onda de choque/glow burst) */}
                {isBursting && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-4 border-[var(--color-accent)] pointer-events-none z-10"
                    style={{ boxShadow: '0 0 20px var(--color-accent), inset 0 0 20px var(--color-accent)' }}
                  />
                )}
                <img 
                  src={appIcon} 
                  alt={appName || 'Logo'} 
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full object-contain border-4 border-surface bg-white p-0.5 shadow-md hover:scale-105 transition-transform duration-300 relative z-20"
                />
              </div>
            ) : (
              <div 
                className="relative shrink-0 select-none pointer-events-auto cursor-pointer"
                onClick={() => {
                  setIsBursting(true)
                  setTimeout(() => setIsBursting(false), 600)
                  setShowCommandCenter(true)
                }}
              >
                {/* Expansive rings (Onda de choque/glow burst) */}
                {isBursting && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-4 border-[var(--color-accent)] pointer-events-none z-10"
                    style={{ boxShadow: '0 0 20px var(--color-accent), inset 0 0 20px var(--color-accent)' }}
                  />
                )}
                <div 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full text-white font-black text-3xl md:text-4xl flex items-center justify-center shadow-lg border-4 border-surface transform hover:scale-105 transition-transform duration-300 relative z-20"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, #000000))'
                  }}
                >
                  {(appName || 'V').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ─── TARJETAS DE MÉTRICAS ──────────────────────────────────────────── */}
      <div className={`grid grid-cols-2 ${creditsEnabled ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 md:gap-4 mb-8`}>

        {/* Ventas */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate('/admin/inicio/detalle-ventas')}
          className="bg-surface rounded-2xl md:rounded-3xl p-3.5 md:p-5 border border-app shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-[140px] cursor-pointer hover:border-success/50 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-success/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-bold text-app text-xs md:text-sm truncate">Ventas de Hoy</h3>
            </div>
            <p className="text-lg md:text-2xl font-black text-app mt-2">{formatCurrency(metricas.ventasHoy)}</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] md:text-xs text-muted">Ver análisis y filtrar por rango.</p>
            <ChevronRight size={14} className="text-muted shrink-0" />
          </div>
        </motion.div>

        {/* Por Cobrar (Solo si créditos están activos) */}
        {creditsEnabled && (
          <motion.div
            variants={itemVariants}
            onClick={() => navigate('/admin/credito')}
            className="bg-surface rounded-2xl md:rounded-3xl p-3.5 md:p-5 border border-app shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-[140px] cursor-pointer hover:border-warning/50 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-warning/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0">
                  <DollarSign size={16} />
                </div>
                <h3 className="font-bold text-app text-xs md:text-sm truncate">Por Cobrar</h3>
              </div>
              <p className="text-lg md:text-2xl font-black text-app mt-2">{formatCurrency(metricas.fiado)}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] md:text-xs text-muted">Saldo en créditos activos.</p>
              <ChevronRight size={14} className="text-muted shrink-0" />
            </div>
          </motion.div>
        )}

        {/* Nuevos Pedidos */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate('/admin/pedidos')}
          className={`bg-surface rounded-2xl md:rounded-3xl p-3.5 md:p-5 border border-app shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-[140px] cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] ${
            metricas.pedidosPendientes > 0 ? 'pulse-purple-alert' : ''
          }`}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
              <h3 className="font-bold text-app text-xs md:text-sm truncate">Nuevos Pedidos</h3>
            </div>
            <p className="text-lg md:text-2xl font-black text-app mt-2">
              {metricas.pedidosPendientes} <span className="text-xs text-muted font-normal">pend.</span>
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] md:text-xs text-muted">Pedidos por preparar.</p>
            <ChevronRight size={14} className="text-muted shrink-0" />
          </div>
        </motion.div>

        {/* Alertas de Inventario — Clickable a Reabastecer Inventario */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate('/admin/inicio/alertas-stock')}
          className={`bg-surface rounded-2xl md:rounded-3xl p-3.5 md:p-5 border border-app shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-[140px] cursor-pointer hover:border-red-500/50 hover:shadow-md transition-all duration-200 active:scale-[0.98] ${
            metricas.stockBajo.length > 0 ? 'pulse-red-alert' : ''
          }`}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
              <h3 className="font-bold text-app text-xs md:text-sm truncate">Alertas Stock</h3>
            </div>
            <p className="text-lg md:text-2xl font-black text-app mt-2">
              {metricas.stockBajo.length} <span className="text-xs text-muted font-normal">alerta(s)</span>
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] md:text-xs text-muted">Reabastecer inventario bajo.</p>
            <ChevronRight size={14} className="text-muted shrink-0" />
          </div>
        </motion.div>
      </div>

      {/* ─── ACCESOS RÁPIDOS COMPLETO (Symmetrical horizontal grid) ────────── */}
      <motion.div variants={itemVariants} className="mt-5">
        <h2 className="text-[11px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-80">
          🚀 Accesos Rápidos
        </h2>
        <div className={`grid grid-cols-2 ${creditsEnabled ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-2.5`}>
          <motion.div whileHover={{ scale: 1.025, y: -1.5 }} whileTap={{ scale: 0.975 }}>
            <Link to="/admin/inventario" className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-app hover:border-primary/50 transition-all hover:bg-surface-2 group h-full">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package size={16} />
              </div>
              <span className="font-bold text-app text-xs tracking-tight">Inventario</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.025, y: -1.5 }} whileTap={{ scale: 0.975 }}>
            <Link to="/admin/pedidos" className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-app hover:border-primary/50 transition-all hover:bg-surface-2 group h-full">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag size={16} />
              </div>
              <span className="font-bold text-app text-xs tracking-tight">Pedidos</span>
            </Link>
          </motion.div>
          {creditsEnabled && (
            <motion.div whileHover={{ scale: 1.025, y: -1.5 }} whileTap={{ scale: 0.975 }}>
              <Link to="/admin/credito" className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-app hover:border-primary/50 transition-all hover:bg-surface-2 group h-full">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard size={16} />
                </div>
                <span className="font-bold text-app text-xs tracking-tight">Créditos</span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ─── RESUMEN DE CAJA DE HOY ────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="bg-surface rounded-2xl border border-app shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header de la caja */}
          <div className="p-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-app flex items-center gap-2">
                  💵 Resumen de Caja (Hoy)
                </h2>
                <p className="text-xs text-muted mt-0.5">Distribución de ingresos según métodos de pago</p>
              </div>
              <div className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl text-base w-max self-start sm:self-auto shadow-sm border border-primary/10">
                Total: {formatCurrency(metricas.cajaTotal)}
              </div>
            </div>

             {/* Barra de distribución hoy */}
            {metricas.cajaTotal > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-3 rounded-full bg-surface-2 overflow-hidden flex">
                  {metricas.cashTotal > 0 && (
                    <div 
                      className="h-full bg-emerald-500 transition-all" 
                      style={{ width: `${(metricas.cashTotal / metricas.cajaTotal) * 100}%` }}
                      title={`Efectivo: ${((metricas.cashTotal / metricas.cajaTotal) * 100).toFixed(0)}%`}
                    />
                  )}
                  {metricas.transferTotal > 0 && (
                    <div 
                      className="h-full bg-blue-500 transition-all" 
                      style={{ width: `${(metricas.transferTotal / metricas.cajaTotal) * 100}%` }}
                      title={`Transferencia: ${((metricas.transferTotal / metricas.cajaTotal) * 100).toFixed(0)}%`}
                    />
                  )}
                  {creditsEnabled && metricas.creditTotal > 0 && (
                    <div 
                      className="h-full bg-violet-500 transition-all" 
                      style={{ width: `${(metricas.creditTotal / metricas.cajaTotal) * 100}%` }}
                      title={`Crédito: ${((metricas.creditTotal / metricas.cajaTotal) * 100).toFixed(0)}%`}
                    />
                  )}
                </div>

                <div className={`grid grid-cols-1 ${creditsEnabled ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-app">Efectivo</span>
                    </div>
                    <span className="font-extrabold text-xs text-app">{formatCurrency(metricas.cashTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-app">Transferencia</span>
                    </div>
                    <span className="font-extrabold text-xs text-app">{formatCurrency(metricas.transferTotal)}</span>
                  </div>
                  {creditsEnabled && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                        <span className="text-xs font-bold text-app">Crédito (Fiado)</span>
                      </div>
                      <span className="font-extrabold text-xs text-app">{formatCurrency(metricas.creditTotal)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center bg-surface-2 rounded-xl border border-dashed border-app">
                <p className="text-2xl mb-1.5">📭</p>
                <p className="text-xs text-muted font-medium">Aún no se registran ventas el día de hoy.</p>
              </div>
            )}
          </div>

          {/* ─── Métodos de pago históricos más usados ─── */}
          <div className="border-t border-app px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-primary" />
                <p className="text-xs font-black text-app uppercase tracking-wider">Histórico — Métodos Más Usados</p>
              </div>
            </div>

            {billingLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-surface-2 animate-pulse" />
                ))}
              </div>
            ) : billingMetrics?.pagoBreakdown && (() => {
              const bp = billingMetrics.pagoBreakdown
              const total = bp.efectivo + bp.transferencia + (creditsEnabled ? bp.credito : 0)
              if (total === 0) return (
                <p className="text-xs text-muted text-center py-2">Sin datos históricos aún.</p>
              )
              const methods = [
                { label: 'Efectivo', val: bp.efectivo, color: '#10b981', bg: 'bg-emerald-500', enabled: true },
                { label: 'Transferencia', val: bp.transferencia, color: '#3b82f6', bg: 'bg-blue-500', enabled: true },
                { label: 'Crédito', val: bp.credito, color: '#8b5cf6', bg: 'bg-violet-500', enabled: creditsEnabled },
              ].filter(m => m.enabled).sort((a, b) => b.val - a.val)

              return (
                <div className="space-y-2.5">
                  {methods.map((m, i) => {
                    const pct = total > 0 ? (m.val / total) * 100 : 0
                    const isBest = i === 0
                    return (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-app">{m.label}</span>
                            {isBest && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: m.color + '20', color: m.color }}>⭐ Más usado</span>
                            )}
                          </div>
                          <span className="text-xs font-black text-app">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                          <div
                              className={`h-full rounded-full transition-all duration-700 ${m.bg}`}
                              style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </motion.div>

      {/* ─── RENDIMIENTO GENERAL DE PRODUCTOS (DETALLADO) ───────────────── */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="bg-surface rounded-2xl border border-app shadow-sm p-5 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 border-b border-app pb-3">
            <BarChart3 size={18} className="text-primary" />
            <div>
              <h2 className="text-sm font-black text-app uppercase tracking-wider">
                Rendimiento General de Productos
              </h2>
              <p className="text-[10px] text-muted">Volumen de ventas, facturación y tasa de rotación relativa del catálogo</p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span className="text-2xl mb-2">📊</span>
              <p className="text-xs font-bold text-app">Sin rendimiento registrado aún</p>
              <p className="text-[10px] text-muted max-w-[280px] mt-1 leading-relaxed">
                Completa tus primeros pedidos para calcular dinámicamente el rendimiento y rotación relativa de tus productos aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, idx) => {
                const maxUnits = topProducts[0]?.cantidadVendida || 1
                const rendimientoRelativo = Math.round((item.cantidadVendida / maxUnits) * 100)
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'

                return (
                  <div key={item.id} className="p-4 bg-surface-2/60 rounded-2xl border border-app shadow-xs flex flex-col gap-2 relative overflow-hidden transition-all duration-300 hover:border-primary/20">
                    {/* Fila superior: Posición + Nombre, y Unidades */}
                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-app">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base select-none shrink-0">{medal}</span>
                        <span className="uppercase tracking-wide truncate">{item.nombre}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-app">{item.cantidadVendida}</span>
                        <span className="text-[10px] text-muted font-normal ml-1">unds</span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-app/50 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rendimientoRelativo}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-[var(--color-primary)] rounded-full"
                        style={{
                          boxShadow: '0 0 8px var(--color-primary-light)'
                        }}
                      />
                    </div>

                    {/* Fila inferior: Rendimiento relativo y total facturado */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted">
                        Rendimiento relativo: <span className="font-bold text-app">{rendimientoRelativo}%</span>
                      </span>
                      <span className="font-bold text-primary text-xs">
                        {formatCurrency(item.ingresosGenerados)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Centro de Mando Express (Glow Burst Menu) */}
    <AnimatePresence>
      {showCommandCenter && (
        <>
          {/* Fondo / Backdrop con hardware acceleration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            onClick={() => setShowCommandCenter(false)}
            className="fixed inset-0 bg-black/60 z-40 cursor-pointer will-change-opacity"
          />

          {/* Tarjeta de Atajos Rápidos con hardware acceleration */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 left-0 right-0 mx-auto z-50 w-[92%] max-w-sm bg-[var(--color-surface)]/95 border border-[var(--color-border)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-[var(--color-text)] will-change-transform"
          >
            {/* Cabecera */}
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text)]">Centro de Mando Express</h4>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Atajos de administración rápidos</p>
                </div>
              </div>
              <button
                onClick={() => setShowCommandCenter(false)}
                className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Grid de Atajos Dinámico */}
            {(() => {
              const activeAtajos = [
                {
                  label: 'Registrar Pedido',
                  desc: 'Admin Pedidos',
                  icon: ShoppingBag,
                  path: '/admin/pedidos',
                  color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                },
                creditsEnabled && {
                  label: 'Ver Cartera',
                  desc: 'Créditos y Fiados',
                  icon: CreditCard,
                  path: '/admin/credito',
                  color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                },
                {
                  label: 'Inventario / Stock',
                  desc: 'Control de Catálogo',
                  icon: Package,
                  path: '/admin/inventario',
                  color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                },
                {
                  label: 'Ajustes Negocio',
                  desc: 'Configuración',
                  icon: Settings,
                  path: '/admin/configuracion',
                  color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
                }
              ].filter(Boolean)

              return (
                <div className={`grid gap-3 ${activeAtajos.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {activeAtajos.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setShowCommandCenter(false)
                        navigate(item.path)
                      }}
                      className="bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all active:scale-95 hover:border-[var(--color-primary-light)]/40 group"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold leading-tight text-[var(--color-text)]">
                          {item.label}
                        </span>
                        <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* Estado del sistema (Footer) */}
            <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center text-[8px] text-[var(--color-text-muted)] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firestore Online</span>
              </div>
              <span>Sync PWA Activa</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
)
}
