import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, CheckCircle, XCircle, CreditCard, ShieldAlert, 
  QrCode, Map, ExternalLink, FileText, MessageCircle, 
  History, Package, MapPin, ChevronDown 
} from 'lucide-react'
import useAppConfigStore from '../../../store/appConfigStore'
import usePortalStore from '../../../store/portalStore'
import { useAlertConfirm } from '../../../components/common/AlertConfirmContext'
import NumberInput from '../../../components/ui/NumberInput'
import LeafletMapPicker from '../../../components/ui/LeafletMapPicker'
import OrderDeliveryPanel from '../../../components/admin/orders/OrderDeliveryPanel'
import { formatCurrency } from '../../../utils/formatters'
import { ORDER_STATES, ORDER_STATE_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from '../../../constants'
import * as orderService from '../services/orderService'

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

const STATE_ICONS = {
  [ORDER_STATES.PENDING]: Clock,
  [ORDER_STATES.COMPLETED]: CheckCircle,
  [ORDER_STATES.CANCELLED]: XCircle,
  [ORDER_STATES.CREDIT_APPROVED]: CreditCard,
  [ORDER_STATES.PENDING_CONCILIATION]: ShieldAlert,
}

const STATE_COLORS = {
  [ORDER_STATES.PENDING]: 'text-warning bg-warning/10 border-warning/20',
  [ORDER_STATES.COMPLETED]: 'text-success bg-success/10 border-success/20',
  [ORDER_STATES.CANCELLED]: 'text-red-500 bg-red-500/10 border-red-500/20',
  [ORDER_STATES.CREDIT_APPROVED]: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  [ORDER_STATES.PENDING_CONCILIATION]: 'text-rose-600 bg-rose-600/10 border-rose-600/20',
}

const NEXT_STATES = {
  [ORDER_STATES.PENDING]: ORDER_STATES.COMPLETED,
  [ORDER_STATES.COMPLETED]: null,
  [ORDER_STATES.CANCELLED]: null,
  [ORDER_STATES.CREDIT_APPROVED]: null,
  [ORDER_STATES.PENDING_CONCILIATION]: null,
}

const OrderCard = memo(function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onShare,
  onShowHistory,
  onStatusChange,
  onPrintReceipt,
  onDeliveryCostSaved,
  isPending
}) {
  const { deliverySettings, couponsEnabled, creditsEnabled } = useAppConfigStore()
  const { portalEmployee } = usePortalStore()
  const { showAlert } = useAlertConfirm()
  const [showMap, setShowMap] = useState(false)
  const [tempCost, setTempCost] = useState(order.costoEnvio || 0)

  useEffect(() => {
    setTempCost(order.costoEnvio || 0)
  }, [order.costoEnvio])

  const StateIcon = STATE_ICONS[order.estado] || Clock
  const stateColors = STATE_COLORS[order.estado] || STATE_COLORS[ORDER_STATES.PENDING]
  const nextStateName = order.estado === ORDER_STATES.PENDING
    ? (order.metodoPago === PAYMENT_METHODS.CREDIT ? ORDER_STATES.CREDIT_APPROVED : ORDER_STATES.COMPLETED)
    : null

  const handleContactClient = (phone, orderNumber) => {
    const cleanPhone = phone?.replace(/\D/g, '') || ''
    const message = encodeURIComponent(`Hola, te escribimos de la tienda sobre tu pedido ${orderNumber}`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-surface rounded-3xl border border-app shadow-sm overflow-hidden transition-opacity duration-300 ${
        order.archivado ? 'opacity-65 hover:opacity-100' : ''
      }`}
    >
      {/* Tarjeta Resumen */}
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between cursor-pointer hover:bg-surface-2/50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-xs uppercase tracking-wider w-fit ${stateColors}`}>
            <StateIcon size={14} />
            {ORDER_STATE_LABELS[order.estado] || order.estado}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-app text-base">{order.orderNumber}</span>
              <span className="text-muted text-xs px-2 py-0.5 bg-surface-2 rounded-full border border-app">
                {PAYMENT_METHOD_LABELS[order.metodoPago] || order.metodoPago}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                order.tipoEntrega === 'domicilio'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : order.tipoEntrega === 'digital'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {order.tipoEntrega === 'domicilio' ? '🛵 Domicilio' : order.tipoEntrega === 'digital' ? '📱 Digital' : '🏪 Retiro'}
              </span>
              {order.archivado && (
                <span className="text-[10px] font-bold text-muted bg-surface-2 border border-app px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Archivado
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-app mt-1">
              {order.cliente?.nombre} <span className="text-muted font-normal">• {order.cliente?.celular}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-app sm:border-0 pt-4 sm:pt-0 mt-4 sm:mt-0 w-full sm:w-auto">
          {/* Botón Compartir Seguimiento por QR (Excluye Bodeguero por seguridad/permisos si está logueado) */}
          {(!portalEmployee || portalEmployee.rol !== 'bodeguero') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare(order)
              }}
              title="Compartir Seguimiento en Vivo"
              className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-2 border border-app flex items-center justify-center text-muted hover:text-primary transition-all cursor-pointer shadow-xs shrink-0 active:scale-90"
            >
              <QrCode size={18} />
            </button>
          )}
          <div className="text-left sm:text-right flex-1 sm:flex-none">
            <p className="text-xs text-muted mb-0.5">{order.items?.length || 0} art(s).</p>
            <p className="font-black text-primary text-lg">{formatCurrency(order.total)}</p>
          </div>
          <ChevronDown size={20} className={`flex-shrink-0 text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Detalles Expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-app bg-surface-2/30"
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Columna Info Cliente & Acciones */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14}/> Envío y Fecha</h4>
                  <p className="text-sm text-app font-medium">
                    {order.tipoEntrega === 'domicilio'
                      ? order.cliente?.direccion || 'Domicilio'
                      : 'Recogida en tienda'}
                  </p>
                  {order.tipoEntrega === 'domicilio' && order.cliente?.barrio && <p className="text-sm text-muted">{order.cliente?.barrio}, {order.cliente?.ciudad}</p>}
                  
                  {/* Leaflet Map Visualizer for Admin */}
                  {order.tipoEntrega === 'domicilio' && order.cliente?.coords && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowMap(prev => !prev)}
                        className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-2/80 border border-app text-[11px] font-bold text-app transition-all active:scale-[0.98] select-none cursor-pointer mt-3"
                      >
                        <span className="flex items-center gap-1.5">
                          <Map size={13} className="text-primary" />
                          {showMap ? 'Ocultar Mapa' : 'Ver Mapa de Ubicación'}
                        </span>
                        <ChevronDown size={12} className={`text-muted transition-transform duration-300 ${showMap ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {showMap && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-2"
                          >
                            <div className="pt-2">
                              <LeafletMapPicker
                                address={order.cliente.direccion}
                                coords={order.cliente.coords}
                                readOnly={true}
                              />
                            </div>
                            <div className="pt-1.5">
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.cliente.coords.lat},${order.cliente.coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] hover:opacity-95 shadow-md shadow-primary/10 cursor-pointer text-center"
                              >
                                <ExternalLink size={14} />
                                Abrir Ruta en Google Maps
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Precio del Domicilio Editable si el método de entrega a domicilio está habilitado */}
                  {order.tipoEntrega === 'domicilio' && (deliverySettings?.shipping?.enabled ?? true) && (
                    <div className="mt-4 p-4 bg-surface rounded-2xl border border-app shadow-sm">
                      <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        ** Valor del Domicilio
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold">$</span>
                          <NumberInput
                            min={0}
                            value={tempCost !== undefined ? tempCost : (order.costoEnvio || undefined)}
                            onChange={(val) => setTempCost(val)}
                            className="w-full pl-7 pr-3 h-10 bg-surface-2 border border-app rounded-xl text-sm font-bold text-app focus:outline-none focus:border-primary transition-colors"
                            placeholder="Ingresa el valor numérico"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            const newCost = parseFloat(tempCost) || 0
                            try {
                              await orderService.updateOrderDeliveryCost(
                                order.id,
                                newCost,
                                order.total,
                                order.costoEnvio
                              )
                              onDeliveryCostSaved({
                                orderNumber: order.orderNumber,
                                value: newCost
                              })
                            } catch (error) {
                              console.error('Error al actualizar costo de envío:', error)
                              showAlert({ title: 'Error', message: 'No se pudo actualizar el costo de envío.', variant: 'error' })
                            }
                          }}
                          className="px-4 h-10 bg-primary text-white rounded-xl text-xs font-bold transition-all active:scale-95 hover:opacity-90 shrink-0 cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-app mt-3">
                    {toLocalDate(order.createdAt)?.toLocaleString() || 'Reciente'}
                  </p>

                  {/* Panel de Gestión de Entrega (Mensajero Propio) */}
                  {order.tipoEntrega === 'domicilio' && deliverySettings?.customDelivery?.enabled && (
                    <OrderDeliveryPanel order={order} />
                  )}

                </div>
                
                {order.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={14}/> Notas</h4>
                    <p className="text-sm text-app italic bg-surface-2/50 p-3 rounded-xl border border-app">{order.notas}</p>
                  </div>
                )}

                {/* Acciones del Administrador */}
                <div className="bg-surface p-5 rounded-3xl border-0 shadow-sm">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Acciones Rápidas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {order.metodoPago === 'credito' ? (
                      // ─── DISEÑO ESPECIAL PARA PEDIDOS A CRÉDITO ───
                      <>
                        <button
                          onClick={(e) => handleContactClient(order.cliente?.celular, order.orderNumber)}
                          className={`${order.estado === ORDER_STATES.COMPLETED ? 'col-span-1' : 'col-span-2'} flex items-center justify-center gap-2 h-11 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-colors`}
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </button>

                        {order.estado === ORDER_STATES.COMPLETED && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onShowHistory(order) }}
                            className="col-span-1 flex items-center justify-center gap-2 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors active:scale-95 transition-all cursor-pointer"
                          >
                            <History size={16} /> Historial
                          </button>
                        )}

                        {order.estado !== ORDER_STATES.COMPLETED && order.estado !== ORDER_STATES.CANCELLED && order.estado !== ORDER_STATES.CREDIT_APPROVED ? (
                          <>
                            <button
                              onClick={(e) => onStatusChange(order, ORDER_STATES.CANCELLED, e)}
                              disabled={isPending}
                              className="col-span-1 h-12 flex justify-center items-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[13px] font-bold hover:bg-red-500/20 active:scale-95 disabled:opacity-50 transition-all"
                            >
                              Rechazar Crédito
                            </button>
                            <button
                              onClick={(e) => onStatusChange(order, ORDER_STATES.CREDIT_APPROVED, e)}
                              disabled={isPending}
                              className="col-span-1 h-12 flex justify-center items-center bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
                            >
                              Aprobar Crédito
                            </button>
                          </>
                        ) : order.estado === ORDER_STATES.CREDIT_APPROVED && (
                          <div className="col-span-2 flex justify-center items-center h-11 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl text-sm font-bold">
                            ✓ Crédito Aprobado
                          </div>
                        )}
                      </>
                    ) : (
                      // ─── DISEÑO ESTÁNDAR PARA OTROS MÉTODOS DE PAGO ───
                      <>
                        <button
                          onClick={(e) => handleContactClient(order.cliente?.celular, order.orderNumber)}
                          className="col-span-1 flex items-center justify-center gap-2 h-11 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-colors"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </button>

                        {order.estado !== ORDER_STATES.COMPLETED && order.estado !== ORDER_STATES.CANCELLED ? (
                          <>
                            <button
                              onClick={(e) => onStatusChange(order, ORDER_STATES.CANCELLED, e)}
                              disabled={isPending}
                              className="col-span-1 h-11 flex justify-center items-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            {nextStateName && (
                              <button
                                onClick={(e) => onStatusChange(order, nextStateName, e)}
                                disabled={isPending}
                                className="col-span-2 h-12 mt-1 flex justify-center items-center rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-white bg-primary"
                              >
                                Mover a {ORDER_STATE_LABELS[nextStateName]}
                              </button>
                            )}
                          </>
                        ) : order.estado === ORDER_STATES.COMPLETED && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onShowHistory(order) }}
                            className="col-span-1 flex items-center justify-center gap-2 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors active:scale-95 transition-all cursor-pointer"
                          >
                            <History size={16} /> Historial
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); onPrintReceipt(order) }}
                      className="col-span-2 flex items-center justify-center gap-2 h-11 bg-surface border border-app rounded-xl text-sm font-bold hover:bg-surface-2 transition-colors mt-2"
                    >
                      <FileText size={16} /> Generar Factura PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Productos */}
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5"><Package size={14}/> Productos</h4>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-app hover:bg-surface-2/30 transition-colors shadow-sm">
                      <div className="w-12 h-12 bg-surface-2 rounded-xl flex-shrink-0 overflow-hidden border border-app relative">
                        {item.imagen || item.imageUrl ? (
                          <img src={item.imagen || item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-app leading-tight mb-0.5">{item.nombre}</p>
                        <p className="text-xs text-muted leading-tight">
                          {item.atributos && Object.keys(item.atributos).length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 flex-wrap">
                              {Object.entries(item.atributos).map(([key, val], idx) => {
                                const isHex = typeof val === 'string' && val.startsWith('#')
                                return (
                                  <span key={key} className="inline-flex items-center gap-1">
                                    {idx > 0 && <span className="text-muted mr-1.5">•</span>}
                                    <span className="capitalize">{key}:</span>
                                    {isHex ? (
                                      <span 
                                        className="w-3.5 h-3.5 rounded-full border border-app shadow-xs inline-block align-middle" 
                                        style={{ backgroundColor: val }} 
                                        title={val}
                                      />
                                    ) : (
                                      <span>{val}</span>
                                    )}
                                  </span>
                                )
                              })}
                            </span>
                          ) : (item.talla || item.color) ? (
                                <span className="inline-flex items-center gap-1.5 flex-wrap">
                                  {item.talla && <span>Talla: {item.talla}</span>}
                                  {item.talla && item.color && <span>•</span>}
                                  {item.color && (
                                    <span className="inline-flex items-center gap-1">
                                      Color: 
                                      {item.color.startsWith('#') ? (
                                        <span 
                                          className="w-3.5 h-3.5 rounded-full border border-app shadow-xs inline-block align-middle" 
                                          style={{ backgroundColor: item.color }} 
                                          title={item.color}
                                        />
                                      ) : (
                                        <span>{item.color}</span>
                                      )}
                                    </span>
                                  )}
                                </span>
                              ) : 'Única'}
                        </p>
                        {item.descripcion && (
                          <p className="text-[11px] text-muted italic mt-1 bg-surface-2/50 px-1.5 py-0.5 rounded border border-app w-fit">
                            Detalle: {item.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="text-right pr-2">
                        <p className="text-xs text-muted mb-0.5">x{item.cantidad}</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(item.precio)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desglose de Totales Financieros */}
                <div className="mt-4 pt-4 border-t border-app space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(order.subtotal || (order.total - (order.costoEnvio || 0)))}</span>
                  </div>
                  {order.tipoEntrega === 'domicilio' && (
                    <div className="flex justify-between text-muted">
                      <span>🛵 Domicilio:</span>
                      <span className="font-semibold text-primary">+{formatCurrency(order.costoEnvio || 0)}</span>
                    </div>
                  )}
                  {order.descuento > 0 && couponsEnabled && (
                    <div className="flex justify-between text-muted">
                      <span>🏷️ Descuento:</span>
                      <span className="font-semibold text-green-500">-{formatCurrency(order.descuento)}</span>
                    </div>
                  )}
                   <div className="flex justify-between text-app font-black text-base pt-1 border-t border-app">
                    <span>Total General:</span>
                    <span className="text-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default OrderCard
