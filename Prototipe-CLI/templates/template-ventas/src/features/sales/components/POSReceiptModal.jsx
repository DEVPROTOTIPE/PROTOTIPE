import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Printer } from 'lucide-react'

/**
 * Modal de éxito de venta física (POS) con opción de imprimir recibo.
 */
export default function POSReceiptModal({
  orderDetails,
  onClose,
  onPrint
}) {
  if (!orderDetails) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-surface rounded-[2rem] border border-app shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center gap-4 pointer-events-auto"
        >
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
            <CheckCircle2 size={28} />
          </div>

          <div>
            <h3 className="text-base font-black text-app">Venta registrada correctamente.</h3>
            <p className="text-xs text-muted mt-1">El pedido ya aparece en el historial del cliente.</p>
            <p className="text-xs font-mono font-bold text-primary mt-2">Nro de Orden: {orderDetails.orderNumber}</p>
          </div>

          {/* Botón Imprimir */}
          <div className="w-full space-y-2 mt-4">
            <button
              onClick={onPrint}
              className="w-full h-11 rounded-xl bg-primary text-white text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer size={14} />
              Imprimir Comprobante
            </button>
            
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-surface-2 text-app text-xs font-bold transition-all active:scale-95 border border-app"
            >
              Continuar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
