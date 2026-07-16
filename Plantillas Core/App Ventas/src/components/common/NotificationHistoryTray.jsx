import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  CheckCheck,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  PackageOpen,
  Store,
  Truck,
  XCircle,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Edit,
  Package,
  ShieldAlert,
  Star,
  SmartphoneNfc
} from 'lucide-react'
import { NC_TYPE_META, NC_TYPES } from '../../services/notificationCenterService'

const colorClasses = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  orange: 'text-orange-500 bg-orange-50 border-orange-100',
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  red: 'text-rose-600 bg-rose-50 border-rose-100',
  amber: 'text-amber-600 bg-amber-50 border-amber-100',
  purple: 'text-purple-600 bg-purple-50 border-purple-100',
}

const iconMap = {
  ShoppingBag,
  CheckCircle2,
  PackageOpen,
  Store,
  Truck,
  XCircle,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Edit,
  Package,
  ShieldAlert,
  Star,
  Bell,
  SmartphoneNfc
}

export default function NotificationHistoryTray({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onClose,
  soundEnabled = true,
  onToggleSound,
  onNavigate,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onMarkAllRead,
  onClearAll,
  onAuthorizeDevice,
}) {
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'order' | 'system'
  const [authorizingId, setAuthorizingId] = useState(null)
  const sentinelRef = useRef(null)

  const handleAuthorizeDevice = async (e, n) => {
    e.stopPropagation()
    if (!onAuthorizeDevice || !n.celular || authorizingId) return
    setAuthorizingId(n.id)
    try {
      await onAuthorizeDevice(n.celular)
      if (onMarkRead) onMarkRead(n.id)
    } finally {
      setAuthorizingId(null)
    }
  }

  // IntersectionObserver sobre el sentinel al fondo de la lista
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, onLoadMore])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread'
    if (filter === 'order') return n.type?.startsWith('pedido') || n.type?.startsWith('entrega')
    if (filter === 'system') return !n.type?.startsWith('pedido') && !n.type?.startsWith('entrega')
    return true
  })

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface text-app shadow-2xl relative">
      {/* Header */}
      <div className="px-5 py-4 border-b border-app flex flex-col gap-3 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-primary/10 rounded-xl text-primary">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
              <p className="text-xs text-muted">Historial en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle Sonido */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-muted-foreground hover:text-gray-900"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Cerrar */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Acciones Rápidas Unificadas */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-end gap-1.5 border-t border-gray-100 pt-2">
            <button
              onClick={onMarkAllRead}
              title="Marcar todas como leídas"
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all active:scale-90 border border-emerald-100 hover:border-emerald-200"
            >
              <CheckCheck size={15} />
            </button>
            <button
              onClick={onClearAll}
              title="Vaciar bandeja"
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all active:scale-90 border border-red-100 hover:border-red-200"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 border-b border-app flex flex-wrap gap-x-2 gap-y-2 justify-start bg-surface">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'unread', label: `No leídas (${unreadCount})` },
          { id: 'order', label: 'Pedidos' },
          { id: 'system', label: 'Sistema' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === btn.id
                ? 'bg-primary text-white shadow-md scale-[1.02]'
                : 'bg-surface-2 text-gray-600 hover:bg-surface-3 hover:text-gray-900'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <Inbox size={40} className="opacity-40 mb-3" />
              <p className="text-sm font-semibold">No tienes notificaciones</p>
              <p className="text-xs opacity-60 mt-1">Los avisos importantes aparecerán aquí</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const meta = NC_TYPE_META[n.type] || {}
              const isUnread = n.status === 'unread'

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex items-start gap-3.5 ${
                    isUnread
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'bg-surface-2 border-app hover:bg-surface-3'
                  }`}
                  onClick={() => {
                    if (isUnread && onMarkRead) onMarkRead(n.id)
                    if (onNavigate && n.clickAction) onNavigate(n.clickAction)
                  }}
                >
                  {/* Punto de No Leído */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                  )}

                  {/* Icono de Tipo */}
                  {(() => {
                    const IconComponent = iconMap[meta.icon] || Bell
                    const resolvedColorClass = colorClasses[meta.color] || colorClasses.primary
                    return (
                      <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-sm border shrink-0 ${resolvedColorClass}`}>
                        <IconComponent size={18} />
                      </div>
                    )
                  })()}

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-app truncate">
                        {n.title || meta.label || 'Notificación'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {n.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-muted">
                      <span className="flex items-center gap-0.5">
                        <Clock size={12} />
                        {formatTime(n.createdAt)}
                      </span>
                      {n.orderNumber && (
                        <span className="bg-surface-3 px-1.5 py-0.5 rounded font-mono font-semibold">
                          #{n.orderNumber}
                        </span>
                      )}
                    </div>

                    {/* Acción inline: autorizar dispositivo bloqueado (SEC-014) */}
                    {n.type === NC_TYPES.DISPOSITIVO_BLOQUEADO && n.celular && onAuthorizeDevice && (
                      <button
                        onClick={(e) => handleAuthorizeDevice(e, n)}
                        disabled={authorizingId === n.id}
                        className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold transition-all active:scale-95"
                      >
                        {authorizingId === n.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <SmartphoneNfc size={13} />
                        )}
                        {authorizingId === n.id ? 'Autorizando…' : 'Autorizar este dispositivo'}
                      </button>
                    )}
                  </div>

                  {/* Acción rápida de navegación */}
                  {n.clickAction && (
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-primary" />
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </AnimatePresence>

        {/* Sentinel de paginación + indicador de carga */}
        {filteredNotifications.length > 0 && (
          <div ref={sentinelRef} className="flex items-center justify-center py-3">
            {isLoadingMore && (
              <span className="flex items-center gap-2 text-xs text-muted">
                <Loader2 size={14} className="animate-spin" />
                Cargando más...
              </span>
            )}
            {!isLoadingMore && !hasMore && notifications.length > 0 && (
              <span className="text-[11px] text-muted opacity-50">
                — Fin del historial —
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
