import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag, ShoppingCart, ArrowRight, Image as ImageIcon, Minus, Plus } from 'lucide-react'
import { formatCurrency, truncate } from '../../../utils/formatters'
import useCartStore from '../../../store/cartStore'
import useGuidedStore from '../../../store/guidedStore'
import CheckoutModal from '../checkout/CheckoutModal'
import SmartHint from '../guided/SmartHint'
import useAppConfigStore from '../../../store/appConfigStore'
import useAuthStore from '../../../store/authStore'
import ProductDetailModal from '../catalog/ProductDetailModal'
import QuantitySelector from '../../ui/QuantitySelector'

export default function CartDrawer() {
  const { isOpen, closeCart, items, addItem, removeItem, deleteItem, getTotal } = useCartStore()
  const { hasCompletedStep, markStepCompleted } = useGuidedStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const navigate = useNavigate()

  // Estados del recomendador comercial
  const { commercialOptimization } = useAppConfigStore()
  const { user, role } = useAuthStore()
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)

  const optEnabled = commercialOptimization?.enabled === true
  const cartRecsEnabled = optEnabled && commercialOptimization?.tools?.cartRecommendations?.enabled !== false
  const historyRecsEnabled = optEnabled && commercialOptimization?.tools?.historyRecommendations?.enabled !== false
  const recsTitle = commercialOptimization?.tools?.cartRecommendations?.title || 'Recomendado para ti'
  
  const isClient = role === 'client'
  const clientPhone = isClient && user?.celular

  useEffect(() => {
    if (!isOpen) {
      // Solo limpiar al CERRAR, no al inicio de un re-fetch
      setRecommendedProducts([])
      return
    }
    if (!cartRecsEnabled && !historyRecsEnabled) return

    let isMounted = true
    const fetchRecs = async () => {
      // NO se limpia recommendedProducts aquí para evitar el parpadeo/desaparición
      setLoadingRecs(true)
      try {
        const { getProducts } = await import('../../../services/inventoryService')
        const allProducts = await getProducts(true)

        if (!isMounted) return

        const currentItems = useCartStore.getState().items
        const cartProductIds = currentItems.map(item => item.productId)

        let historyCategories = []
        if (historyRecsEnabled && clientPhone) {
          const { getClientOrders } = await import('../../../services/orderService')
          const orders = await getClientOrders(clientPhone)
          const categories = new Set()
          orders.forEach(order => {
            order.items?.forEach(item => {
              const prod = allProducts.find(p => p.id === item.productId)
              if (prod?.categoria) categories.add(prod.categoria)
            })
          })
          historyCategories = Array.from(categories)
        }

        const candidates = allProducts.filter(p => {
          if (cartProductIds.includes(p.id)) return false
          const isOutOfStock = p.variantes?.length > 0 && p.variantes.every(v => v.stock <= 0)
          return !isOutOfStock
        })

        const cartCategories = Array.from(new Set(
          currentItems.map(item => {
            const prod = allProducts.find(p => p.id === item.productId)
            return prod?.categoria
          }).filter(Boolean)
        ))

        const scoredCandidates = candidates.map(p => {
          let score = 0
          if (cartCategories.includes(p.categoria)) score += 100
          if (historyCategories.includes(p.categoria)) score += 50
          if (p.salesCount && p.salesCount > 0) score += Math.min(p.salesCount, 30)
          if (p.tienePromocion && p.precioPromo < p.precioBase) score += 20
          if (p.destacado === true) score += 10
          return { product: p, score }
        })

        scoredCandidates.sort((a, b) => b.score - a.score)
        if (isMounted) setRecommendedProducts(scoredCandidates.slice(0, 6).map(sc => sc.product))
      } catch (err) {
        console.error('Error fetching recommendations:', err)
      } finally {
        if (isMounted) setLoadingRecs(false)
      }
    }

    fetchRecs()
    return () => { isMounted = false }
  }, [isOpen, cartRecsEnabled, historyRecsEnabled, clientPhone])

  const handleContinueShopping = () => {
    closeCart()
    navigate('/tienda/catalogo')
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
              <div className="flex-1 overflow-y-auto p-6 bg-app">
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
                      <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-2xl p-2 pr-4 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex gap-4 items-center relative">
                        {/* Img */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon size={20} /></div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div>
                            <h4 className="font-bold text-gray-900 text-[15px] leading-tight pr-6">{truncate(item.nombre, 35)}</h4>
                            <p className="text-[11px] text-muted mt-1 font-medium">
                              {item.talla && `Talla ${item.talla}`} {item.talla && item.color && '·'} {item.color && item.color}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-primary font-black text-base leading-none">
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
                              className="scale-[0.7] origin-right shrink-0"
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
                  <div className="mt-8 border-t border-app pt-6 shrink-0">
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
                      <div className="flex flex-col gap-2">
                        <SwipeableCardStack
                          items={recommendedProducts.map(p => {
                            const isPromo = p.tienePromocion && p.precioPromo < p.precioBase
                            const pPrice = isPromo ? p.precioPromo : p.precioBase

                            return {
                              id: p.id,
                              product: p,
                              render: () => (
                                <div className="flex gap-4 items-center h-full w-full">
                                  {/* Imagen del Producto */}
                                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 relative">
                                    {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-muted"><ImageIcon size={18} /></div>
                                    )}
                                    {isPromo && (
                                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                                        {p.promocion?.discountType === 'percentage' 
                                          ? `${p.promocion.discountValue}% OFF` 
                                          : 'OFERTA'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Detalles del Producto */}
                                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 text-left">
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] text-primary font-black uppercase tracking-widest">{p.categoria || 'Sugerido'}</span>
                                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{p.nombre}</h4>
                                    </div>
                                    <div className="flex items-end justify-between">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-primary">{formatCurrency(pPrice)}</span>
                                        {isPromo && <span className="text-[9px] text-gray-400 line-through">{formatCurrency(p.precioBase)}</span>}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedProductDetail(p)
                                        }}
                                        className="px-3 h-7 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-md shadow-primary/10 border-none cursor-pointer"
                                      >
                                        <Plus size={10} className="stroke-[3]" /> Detalles
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                          })}
                          onSwipe={(direction, product) => {
                            if (direction === 'right' && product) {
                              const isPromo = product.tienePromocion && product.precioPromo < product.precioBase
                              const price = isPromo ? product.precioPromo : product.precioBase
                              
                              // Buscar variante con stock o usar la primera
                              const vars = product.variantes?.filter(v => v.stock > 0) || []
                              const variant = vars[0] || (product.variantes && product.variantes[0])
                              
                              if (variant) {
                                addItem({
                                  productId: product.id,
                                  variantId: variant.id,
                                  nombre: product.nombre,
                                  precio: price,
                                  talla: variant.talla || null,
                                  color: variant.color || null,
                                  imageUrl: variant.imageUrl || product.imageUrl,
                                  maxStock: variant.stock,
                                }, 1)
                              } else {
                                // Fallback si no tiene variantes explícitas con stock
                                addItem({
                                  productId: product.id,
                                  variantId: 'default',
                                  nombre: product.nombre,
                                  precio: price,
                                  talla: null,
                                  color: null,
                                  imageUrl: product.imageUrl,
                                  maxStock: product.stock || 10,
                                }, 1)
                              }
                            }
                          }}
                          onSelectDetail={(product) => setSelectedProductDetail(product)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Fijo */}
              {items.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-white z-10 shrink-0 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted font-medium">Total Estimado</span>
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(getTotal())}</span>
                  </div>

                  <div className="relative">
                    <SmartHint 
                      stepId="cart_checkout" 
                      message="Verifica que toda la información esté correcta antes de realizar el pedido." 
                      position="top" 
                      delay={1000} 
                    />
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full h-[60px] rounded-full bg-action text-white font-black uppercase tracking-widest transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-xl"
                  >
                    Ir a Pagar <ArrowRight size={20} />
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="bg-transparent border-none text-gray-500 font-bold text-[13px] uppercase tracking-widest hover:text-gray-800 transition-colors mt-3 text-center block w-full mx-auto"
                  >
                    Seguir agregando productos
                  </button>
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

function SwipeableCardStack({
  items = [],
  onSwipe = () => {},
  onEmpty = () => {},
  onSelectDetail = () => {},
  threshold = 100
}) {
  const [localItems, setLocalItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoSwiping, setIsAutoSwiping] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const topCardRef = useRef(null)
  const autoPlayTimer = useRef(null)

  // Sincronizar items locales
  useEffect(() => {
    setLocalItems(items)
    setCurrentIndex(0)
  }, [items])

  const activeItem = localItems[currentIndex]

  // Reset y control de autoplay por inactividad (5 segundos)
  const resetAutoPlayTimer = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current)
    }
    if (localItems.length <= 1 || isDragging || isAutoSwiping) return

    autoPlayTimer.current = setInterval(() => {
      autoRotateCard()
    }, 5000)
  }

  useEffect(() => {
    resetAutoPlayTimer()
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    }
  }, [currentIndex, localItems, isDragging, isAutoSwiping])

  // Desliza la tarjeta automáticamente al fondo de la pila para que sigan variando
  const autoRotateCard = () => {
    if (isDragging || isAutoSwiping || localItems.length <= 1) return
    setIsAutoSwiping(true)

    // Animación de salida hacia la izquierda (descarte suave por inactividad)
    setDragOffset({ x: -150, y: -10 })

    setTimeout(() => {
      // Mandar el elemento actual al final del array para que siga rotando
      setLocalItems(prev => {
        const next = [...prev]
        const current = next.shift()
        if (current) next.push(current)
        return next
      })
      setDragOffset({ x: 0, y: 0 })
      setIsAutoSwiping(false)
    }, 450)
  }

  const handlePointerDown = (e) => {
    if (isAutoSwiping) return
    setIsDragging(true)
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    dragStart.current = { x: e.clientX, y: e.clientY }
    if (topCardRef.current) {
      topCardRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    if (topCardRef.current) {
      topCardRef.current.releasePointerCapture(e.pointerId)
    }

    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left'
      swipeCard(direction)
    } else {
      setDragOffset({ x: 0, y: 0 })
      resetAutoPlayTimer()
    }
  }

  const swipeCard = (direction) => {
    if (isAutoSwiping) return
    setIsAutoSwiping(true)
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)

    const exitX = direction === 'right' ? 400 : -400
    setDragOffset({ x: exitX, y: dragOffset.y })

    setTimeout(() => {
      onSwipe(direction, activeItem?.product)
      
      // Remover de la pila local permanentemente en swipe manual
      setLocalItems(prev => {
        const next = [...prev]
        next.shift()
        return next
      })

      setDragOffset({ x: 0, y: 0 })
      setIsAutoSwiping(false)

      if (localItems.length <= 1) {
        onEmpty()
      }
    }, 250)
  }

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-3xl h-32 text-center bg-white/50">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted">¡Viste todas las sugerencias!</span>
      </div>
    )
  }

  const swipeOpacityLeft = isDragging && dragOffset.x < 0 ? Math.min(Math.abs(dragOffset.x) / threshold, 1) : 0
  const swipeOpacityRight = isDragging && dragOffset.x > 0 ? Math.min(Math.abs(dragOffset.x) / threshold, 1) : 0

  return (
    <div className="flex flex-col items-center w-full">
      {/* Contenedor del Mazo */}
      <div className="relative w-full h-[145px] select-none touch-none">
        {/* Tarjeta de Respaldo Terciaria */}
        {localItems.length > 2 && (
          <div 
            style={{
              transform: 'scale(0.90) translate3d(0, 16px, 0)',
            }}
            className="absolute inset-x-4 top-0 h-[120px] rounded-3xl bg-slate-100 dark:bg-neutral-900 border border-gray-200/50 opacity-40 transition-all duration-300 shadow-sm z-0" 
          />
        )}

        {/* Tarjeta de Respaldo Secundaria */}
        {localItems.length > 1 && (
          <div 
            style={{
              transform: isDragging 
                ? `scale(${0.95 + Math.min(Math.abs(dragOffset.x), threshold) / threshold * 0.05}) translate3d(0, ${8 - Math.min(Math.abs(dragOffset.x), threshold) / threshold * 8}px, 0)` 
                : 'scale(0.95) translate3d(0, 8px, 0)'
            }}
            className="absolute inset-x-4 top-0 h-[120px] rounded-3xl bg-slate-50 dark:bg-neutral-800 border border-gray-200/85 opacity-90 z-10 transition-transform duration-300 pointer-events-none shadow-md"
          />
        )}

        {/* Tarjeta Superior Activa */}
        <div
          ref={topCardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.06}deg)`,
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
          }}
          onClick={() => onSelectDetail(activeItem?.product)}
          className="absolute inset-x-4 top-0 h-[120px] rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 shadow-[0_12px_32px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] z-20 cursor-grab active:cursor-grabbing overflow-hidden p-3.5 flex items-center justify-between"
        >
          {/* Overlay Badge LADO IZQUIERDO (Descartar/Ignorar) */}
          {isDragging && dragOffset.x < 0 && (
            <div 
              style={{ opacity: swipeOpacityLeft }}
              className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center pointer-events-none z-30 transition-opacity"
            >
              <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg tracking-widest uppercase flex items-center gap-1">
                <X size={10} className="stroke-[3]" /> Ignorar
              </span>
            </div>
          )}

          {/* Overlay Badge LADO DERECHO (Agregar/Comprar) */}
          {isDragging && dragOffset.x > 0 && (
            <div 
              style={{ opacity: swipeOpacityRight }}
              className="absolute inset-0 bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center pointer-events-none z-30 transition-opacity"
            >
              <span className="bg-green-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg tracking-widest uppercase flex items-center gap-1">
                <ShoppingCart size={10} className="stroke-[3]" /> Comprar
              </span>
            </div>
          )}

          <div className="pointer-events-none w-full h-full flex items-center justify-between">
            {activeItem?.render()}
          </div>
        </div>
      </div>

      {/* Controles de Acción (Tinder-Style) */}
      <div className="flex justify-center items-center gap-6 mt-1.5 shrink-0 select-none">
        <button
          type="button"
          onClick={() => swipeCard('left')}
          className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100/80 dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center shadow-xs border border-red-200 dark:border-red-900/50 transition-all active:scale-90 cursor-pointer"
          title="Ignorar sugerencia"
        >
          <X size={18} className="stroke-[3]" />
        </button>

        <span className="text-[9px] text-muted font-bold tracking-widest uppercase opacity-50 select-none">
          Desliza o Presiona
        </span>

        <motion.button
          type="button"
          onClick={() => swipeCard('right')}
          animate={{ 
            scale: [1, 1.12, 1],
            boxShadow: [
              "0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)",
              "0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -2px rgba(34, 197, 94, 0.15)",
              "0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 flex items-center justify-center border border-green-200 dark:border-green-900/50 transition-all cursor-pointer"
          title="Agregar al carrito"
        >
          <ShoppingCart size={16} className="stroke-[3]" />
        </motion.button>
      </div>
    </div>
  )
}

