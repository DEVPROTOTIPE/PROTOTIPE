import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatters'
import { getCssColor } from '../../../utils/colors'

/**
 * Modal para seleccionar una variante específica (talla, color) de un producto.
 */
export default function POSVariantModal({
  product,
  onClose,
  onSelectVariant
}) {
  if (!product) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
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
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-md bg-surface rounded-t-[2rem] sm:rounded-[2rem] border border-app shadow-2xl p-6 overflow-hidden flex flex-col gap-5 pointer-events-auto"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-app line-clamp-1">{product.nombre}</h3>
              <p className="text-[10px] text-muted">Selecciona la variante de inventario</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-app"
            >
              <X size={16} />
            </button>
          </div>

          {/* Selector de variantes */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {product.variantes.map(variant => (
              <div
                key={variant.id}
                onClick={() => {
                  if (variant.stock > 0) {
                    onSelectVariant(variant)
                  }
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  variant.stock <= 0
                    ? 'opacity-40 border-app bg-surface-2 cursor-not-allowed'
                    : 'border-app hover:border-primary/50 hover:bg-primary-soft bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color swatch */}
                  {variant.color && (
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: getCssColor(variant.color) }}
                      title={variant.color}
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-app">
                      {[variant.talla ? `Talla: ${variant.talla}` : '', variant.color ? `Color: ${variant.color}` : ''].filter(Boolean).join(' • ') || 'Estándar'}
                    </p>
                    <p className="text-[10px] text-muted">
                      Stock: {variant.stock} unidades
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-primary">
                    {formatCurrency(product.precioBase)}
                  </span>
                  {variant.stock > 0 ? (
                    <ChevronRight size={14} className="text-muted" />
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 uppercase">Agotado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
