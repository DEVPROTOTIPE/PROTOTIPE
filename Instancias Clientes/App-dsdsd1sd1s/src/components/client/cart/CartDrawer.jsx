import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag, ArrowRight, Image as ImageIcon, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatters'
import useCartStore from '../../../store/cartStore'
import useGuidedStore from '../../../store/guidedStore'
import CheckoutModal from '../checkout/CheckoutModal'
import SmartHint from '../guided/SmartHint'
import ProductDetailModal from '../catalog/ProductDetailModal'
import QuantitySelector from '../../ui/QuantitySelector'
import SwipeableCardStack from '../../ui/SwipeableCardStack'
import LazyImage from '../../ui/LazyImage'
import { useCartRecommendations } from '../../../hooks/useCartRecommendations'



export default function CartDrawer() {
  const { isOpen, closeCart, items, addItem, removeItem, deleteItem, getTotal } = useCartStore()
  const { hasCompletedStep, markStepCompleted } = useGuidedStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const navigate = useNavigate()

  const [selectedProductDetail, setSelectedProductDetail] = useState(null)

  // Recomendador comercial — lógica extraída a hook dedicado
  const { recommendedProducts, loadingRecs, recsTitle, cartRecsEnabled } = useCartRecommendations(isOpen)

  const handleContinueShopping = () => {
    closeCart()
    navigate('/tienda/catalogo')
  }

  const handleViewDetail = (product) => {
    closeCart()
    navigate(`/tienda/producto/${product.id}`, { state: { fromCart: true } })
  }


  const handleCheckoutClick = () => {
    // Guided Mode
    markStepCompleted('view_cart')
    
    closeCart()
    setIsCheckoutOpen(true)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeCart}
              className="absolute inset-0 bg-black/50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
              className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col will-change-transform"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100 bg-surface z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
                </div>
                <button
                  onClick={closeCart}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 bg-app">
                {items.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-app shadow-sm">
                      <ShoppingBag size={40} className="text-muted opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-app mb-2">Tu carrito está vacío</h3>
                    <p className="text-muted max-w-xs">
                      Aún no has agregado productos. Explora nuestro catálogo y encuentra algo que te guste.
                    </p>

                    <div className="relative w-full max-w-[280px] mt-2">
                      <SmartHint 
                        stepId="cart_empty" 
                        message="Agrega productos para comenzar tu pedido." 
                        position="bottom" 
                        delay={500} 
                      />
                    </div>
                    <button
                      onClick={handleContinueShopping}
                      className="mt-8 bg-transparent border-none text-gray-400 font-bold text-sm tracking-wide uppercase transition-colors hover:text-gray-700 active:scale-95"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-2xl p-2 pr-3 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex gap-3 items-center relative">
                        {/* Img */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <LazyImage src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon size={18} /></div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs leading-tight pr-6 truncate">{item.nombre}</h4>
                            <p className="text-[10px] text-muted mt-0.5 font-medium">
                              {item.talla && `Talla ${item.talla}`} {item.talla && item.color && '·'} {item.color && item.color}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-primary font-black text-sm leading-none">
                              {formatCurrency(item.precio * item.cantidad)}
                            </p>
                            
                            {/* Contador de Cantidad Refinado */}
                            <QuantitySelector
                              value={item.cantidad}
                              onChange={(newQty) => {
                                const diff = newQty - item.cantidad
                                if (diff > 0) {
                                  addItem({ productId: item.productId, variantId: item.variantId }, diff)
                                } else if (diff < 0) {
                                  removeItem(item.productId, item.variantId, Math.abs(diff))
                                }
                              }}
                              min={1}
                              max={item.maxStock || 10}
                              size="sm"
                              className="scale-[0.85] origin-right shrink-0"
                            />
                          </div>
                        </div>

                        {/* Eliminar TODO el stack de esa variante */}
                        <button
                          onClick={() => deleteItem(item.productId, item.variantId)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-50 hover:opacity-100 absolute top-2.5 right-2.5"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                               {/* Recomendaciones en Carrito / Historial */}
                {cartRecsEnabled && (recommendedProducts.length > 0 || loadingRecs) && (
                  <div className="mt-6 border-t border-app pt-4 shrink-0">
                    <h3 className="text-sm font-extrabold text-app mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="relative flex">
                          <span className="w-2 h-2 rounded-full bg-primary animate-ping absolute" />
                          <span className="w-2 h-2 rounded-full bg-primary relative" />
                        </span>
                        {recsTitle}
                      </span>
                      <span className="text-[10px] bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                        Solo para ti
                      </span>
                    </h3>

                    {loadingRecs && recommendedProducts.length === 0 ? (
                      /* Skeleton Loader */
                      <div className="flex gap-3 pb-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-36 shrink-0 rounded-2xl overflow-hidden bg-surface animate-pulse">
                            <div className="w-full h-28 bg-gray-200 dark:bg-gray-700" />
                            <div className="p-2.5 space-y-2">
                              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5" />
                              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <SwipeableCardStack
                        items={recommendedProducts.map(p => {
                          const isPromo = p.tienePromocion && p.precioPromo < p.precioBase
                          const pPrice = isPromo ? p.precioPromo : p.precioBase
                          return {
                            id: p.id,
                            product: p,
                            render: () => (
                              <div className="w-full h-full flex flex-col">
                                {/* Imagen cuadrada — full width */}
                                <div className="relative w-full flex-1 overflow-hidden bg-gray-50 dark:bg-neutral-800 min-h-0">
                                  {p.imageUrl ? (
                                    <LazyImage src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted opacity-30">
                                      <ImageIcon size={36} />
                                    </div>
                                  )}
                                  {isPromo && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm leading-none">
                                      {p.promocion?.discountType === 'percentage' ? `${p.promocion.discountValue}% OFF` : 'OFERTA'}
                                    </span>
                                  )}
                                </div>

                                {/* Info + acciones */}
                                <div className="px-4 pt-3 pb-4 flex flex-col gap-2 shrink-0">
                                  <span className="text-[9px] text-primary font-black uppercase tracking-widest leading-none">
                                    {p.categoria || 'Sugerido'}
                                  </span>
                                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                                    {p.nombre}
                                  </p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black text-primary leading-none">{formatCurrency(pPrice)}</span>
                                    {isPromo && <span className="text-[10px] text-gray-400 line-through font-medium">{formatCurrency(p.precioBase)}</span>}
                                  </div>
                                  <div className="flex gap-2 pointer-events-auto">
                                    <button
                                      type="button"
                                      onClick={() => handleViewDetail(p)}
                                      className="flex-1 h-9 text-[10px] font-bold rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                                    >
                                      Ver más
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const vars = p.variantes?.filter(v => v.stock > 0) || []
                                        const variant = vars[0] || (p.variantes && p.variantes[0])
                                        const price = isPromo ? p.precioPromo : p.precioBase
                                        if (variant) {
                                          addItem({ productId: p.id, variantId: variant.id, nombre: p.nombre, precio: price, talla: variant.talla || null, color: variant.color || null, imageUrl: variant.imageUrl || p.imageUrl, maxStock: variant.stock }, 1)
                                        } else {
                                          addItem({ productId: p.id, variantId: 'default', nombre: p.nombre, precio: price, talla: null, color: null, imageUrl: p.imageUrl, maxStock: p.stock || 10 }, 1)
                                        }
                                      }}
                                      className="flex-1 h-9 text-[10px] font-bold rounded-xl bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                                    >
                                      <ShoppingCart size={12} className="stroke-[2.5]" />
                                      Agregar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        })}
                        onSwipe={(direction, item) => {
                          if (direction === 'right' && item?.product) {
                            const p = item.product
                            const isPromo = p.tienePromocion && p.precioPromo < p.precioBase
                            const price = isPromo ? p.precioPromo : p.precioBase
                            const vars = p.variantes?.filter(v => v.stock > 0) || []
                            const variant = vars[0] || (p.variantes && p.variantes[0])
                            if (variant) {
                              addItem({ productId: p.id, variantId: variant.id, nombre: p.nombre, precio: price, talla: variant.talla || null, color: variant.color || null, imageUrl: variant.imageUrl || p.imageUrl, maxStock: variant.stock }, 1)
                            } else {
                              addItem({ productId: p.id, variantId: 'default', nombre: p.nombre, precio: price, talla: null, color: null, imageUrl: p.imageUrl, maxStock: p.stock || 10 }, 1)
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Contenedor Translúcido Desenfocado de Checkout (Glassmorphism) */}
              {items.length > 0 && (
                <div className="absolute bottom-6 inset-x-6 h-20 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-3xl px-6 flex items-center justify-between z-30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                  {/* Total Estimado */}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted">Total</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none mt-1">
                      {formatCurrency(getTotal())}
                    </span>
                  </div>

                  {/* Botón de Pago con SmartHint */}
                  <div className="flex items-center">
                    <div className="relative">
                      <SmartHint 
                        stepId="cart_checkout" 
                        message="¡Todo listo! Pulsa aquí para finalizar tu pedido." 
                        position="left" 
                        delay={1000} 
                      />
                    </div>
                    
                    <button
                      onClick={handleCheckoutClick}
                      className="px-6 h-12 rounded-2xl bg-action text-white font-black uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_24px_color-mix(in_srgb,var(--color-action)_25%,transparent)] border-none cursor-pointer"
                    >
                      <span>Ir a pedir</span>
                      <ArrowRight size={16} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          isOpen={!!selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
        />
      )}
    </>
  )
}
