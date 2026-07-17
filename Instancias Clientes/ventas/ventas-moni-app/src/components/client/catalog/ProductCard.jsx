import { motion } from 'framer-motion'
import { Heart, Plus, Image as ImageIcon } from 'lucide-react'
import { formatCurrency, truncate } from '../../../utils/formatters'
import useFavoritesStore from '../../../store/favoritesStore'
import useAuthStore from '../../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import useAppConfigStore from '../../../store/appConfigStore'

import { getCssColor } from '../../../utils/colors'
import LazyImage from '../../ui/LazyImage'

export default function ProductCard({ product, onOpenDetail, layout = 'grid' }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { commercialOptimization } = useAppConfigStore()
  
  const userId = user?.celular || user?.uid
  const { favoriteIds, toggleFavorite } = useFavoritesStore()
  
  const isFav = favoriteIds.includes(product.id)

  // Verificar si el producto está completamente agotado (todas las variantes en 0)
  const isOutOfStock = product.stockInfinito
    ? false
    : ((product.variantes || []).length > 0
      ? (product.variantes || []).every(v => (v.stock || 0) <= 0)
      : (product.stock !== undefined ? product.stock <= 0 : true))

  // Optimización Comercial
  const optEnabled = commercialOptimization?.enabled === true
  const smartTagsEnabled = optEnabled && commercialOptimization?.tools?.smartTags?.enabled !== false
  const smartTags = commercialOptimization?.tools?.smartTags || {}
  
  // Calcular stock consolidado
  const stockConsolidado = product.stockInfinito
    ? 9999
    : ((product.variantes || []).length > 0
      ? (product.variantes || []).reduce((sum, v) => sum + (v.stock || 0), 0)
      : (product.stock || 0))
  
  // Obtener el precio activo (promocional o base)
  const actualPrice = product.tienePromocion && product.precioPromo < product.precioBase
    ? product.precioPromo
    : product.precioBase

  // Calcular si es nuevo (creado en los últimos N días)
  const isNewProduct = useMemo(() => {
    if (!product.createdAt) return false
    let createdDateMs = 0
    if (typeof product.createdAt.toMillis === 'function') {
      createdDateMs = product.createdAt.toMillis()
    } else if (product.createdAt && typeof product.createdAt.seconds === 'number') {
      createdDateMs = product.createdAt.seconds * 1000
    } else if (product.createdAt instanceof Date) {
      createdDateMs = product.createdAt.getTime()
    } else {
      createdDateMs = new Date(product.createdAt).getTime()
    }

    if (isNaN(createdDateMs)) return false

    const limitDays = smartTags.newProduct?.daysLimit || 7
    const diffTime = Math.abs(Date.now() - createdDateMs)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= limitDays
  }, [product.createdAt, smartTags.newProduct?.daysLimit])

  // Obtener etiqueta activa de mayor prioridad
  const activeSmartTag = useMemo(() => {
    if (!smartTagsEnabled) return null

    // 1. Última Unidad (Prioridad Alta)
    if (smartTags.lastUnit?.enabled !== false && stockConsolidado > 0 && stockConsolidado <= (smartTags.lastUnit?.threshold || 3)) {
      return {
        text: smartTags.lastUnit?.text || 'Última Unidad',
        bg: smartTags.lastUnit?.bg || '#3b82f6',
        textCol: smartTags.lastUnit?.textCol || '#ffffff'
      }
    }

    // 2. Oferta Imperdible (Si tiene descuento activo y el precio promo es menor que el base)
    const hasPromo = typeof product.precioPromo === 'number' && product.precioPromo > 0 && product.precioPromo < product.precioBase
    if (smartTags.unmissableOffer?.enabled !== false && hasPromo) {
      return {
        text: smartTags.unmissableOffer?.text || 'Oferta Imperdible',
        bg: smartTags.unmissableOffer?.bg || '#f59e0b',
        textCol: smartTags.unmissableOffer?.textCol || '#ffffff'
      }
    }

    // 3. Más Vendido (Basado en salesCount real)
    const salesVal = product.salesCount || 0
    if (smartTags.bestSeller?.enabled !== false && salesVal >= (smartTags.bestSeller?.minSales || 5)) {
      return {
        text: smartTags.bestSeller?.text || 'Más Vendido',
        bg: smartTags.bestSeller?.bg || '#ef4444',
        textCol: smartTags.bestSeller?.textCol || '#ffffff'
      }
    }

    // 4. Nuevo
    if (smartTags.newProduct?.enabled !== false && isNewProduct) {
      return {
        text: smartTags.newProduct?.text || 'Nuevo',
        bg: smartTags.newProduct?.bg || '#10b981',
        textCol: smartTags.newProduct?.textCol || '#ffffff'
      }
    }

    return null
  }, [smartTagsEnabled, smartTags, stockConsolidado, product.precioPromo, product.precioBase, product.salesCount, isNewProduct])

  // Indicador de variantes
  const variationIndicatorsEnabled = optEnabled && commercialOptimization?.tools?.variationIndicators?.enabled !== false
  const uniqueColors = useMemo(() => {
    if (!product.variantes) return []
    const colors = new Set(product.variantes.map(v => v.color).filter(Boolean))
    return Array.from(colors)
  }, [product.variantes])

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    
    if (!userId) {
      navigate('/login')
      return
    }

    toggleFavorite(userId, product.id)
  }

  // Estilos dinámicos para el efecto brillo (Glow) usando color-mix
  const glowStyle = product.tienePromocion && product.promocion?.glowEffect
    ? {
        boxShadow: '0 0 15px color-mix(in srgb, var(--color-primary) 35%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
      }
    : {}

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`bg-surface overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer group ${
        layout === 'list' ? 'flex flex-row h-32' : 'flex flex-col h-full'
      } ${isOutOfStock ? 'opacity-70' : ''}`}
      style={{
        ...glowStyle,
        borderRadius: '20px'
      }}
      onClick={() => {
        if (product.isTemporal) {
          onOpenDetail(product)
        } else {
          navigate('/tienda/producto/' + product.id)
        }
      }}
    >
      {/* Contenedor de Imagen */}
      <div className={`relative bg-surface-2 overflow-hidden shrink-0 ${
        layout === 'list' ? 'w-32 h-32 rounded-l-[20px]' : 'aspect-square w-full rounded-t-[20px]'
      }`}>
        {product.imageUrl ? (
          <LazyImage
            src={product.imageUrl}
            alt={product.nombre}
            className="group-hover:scale-103 transition-transform duration-700 ease-out"
            style={{ viewTransitionName: 'product-image' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted">
            <ImageIcon size={26} className="opacity-40 mb-1.5" />
            <span className="text-[9px] font-bold tracking-wider">SIN IMAGEN</span>
          </div>
        )}

        {/* Badges de Estado Premium (Glassmorphism) */}
        {isOutOfStock ? (
          <span
            className="absolute bottom-3 left-3 px-3 py-1 text-[9px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white shadow-md z-10 border border-white/10 rounded-full"
          >
            Agotado
          </span>
        ) : activeSmartTag ? (
          <span 
            className="absolute bottom-3 left-3 px-3 py-1 text-[9px] font-black uppercase tracking-wider shadow-md z-10 border border-white/20 text-center flex items-center justify-center shrink-0 backdrop-blur-md rounded-full"
            style={{ 
              backgroundColor: `${activeSmartTag.bg}c0`, // Opacidad del 75% para efecto glassmorphic
              color: activeSmartTag.textCol
            }}
          >
            {activeSmartTag.text}
          </span>
        ) : product.tienePromocion && product.isTemporal ? (
          <span 
            className="absolute bottom-3 left-3 px-3 py-1 text-[9px] font-black uppercase tracking-wider bg-primary/90 backdrop-blur-md text-white shadow-md z-10 border border-white/20 rounded-full"
          >
            Combo
          </span>
        ) : null}

        {/* Botón Favorito Flotante Premium */}
        <motion.button
          onClick={handleFavoriteClick}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          className={`absolute top-3 right-3 w-8.5 h-8.5 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 border ${
            isFav
              ? 'bg-white/95 text-red-500 border-white shadow-md'
              : 'bg-black/20 text-white border-white/10 hover:bg-white hover:text-red-500 hover:border-white shadow-sm'
          }`}
          aria-label={isFav ? `Quitar ${product.nombre} de favoritos` : `Agregar ${product.nombre} a favoritos`}
        >
          <motion.div
            initial={false}
            animate={{ scale: isFav ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart size={15} fill={isFav ? 'currentColor' : 'none'} className="stroke-[2.5]" />
          </motion.div>
        </motion.button>
      </div>

      {/* Bloque de Información */}
      <div className="p-4 flex-1 flex flex-col gap-2 min-w-0">
        <div>
          {/* Categoría Tipografía Premium */}
          <span className="text-[9px] font-black tracking-widest text-primary/75 uppercase block mb-1">
            {product.categoria || 'PRODUCTO'}
          </span>
          
          <h3 className="text-gray-900 dark:text-gray-100 font-semibold group-hover:text-primary transition-colors duration-300 text-sm leading-snug line-clamp-2" title={product.nombre}>
            {product.nombre}
          </h3>

          {/* Indicador de Variantes */}
          {variationIndicatorsEnabled && uniqueColors.length > 0 && (
            <div 
              className="flex items-center gap-1.5 mt-2 pb-0.5 overflow-x-auto scrollbar-none w-full shrink-0 snap-x"
              onClick={(e) => e.stopPropagation()}
            >
              {uniqueColors.map((color, idx) => {
                const hex = getCssColor(color)
                return (
                  <span 
                    key={idx}
                    title={color}
                    className="w-3 h-3 rounded-full border border-black/15 dark:border-white/15 shadow-inner shrink-0 snap-center hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: hex }}
                  />
                )
              })}
            </div>
          )}
          
          {layout === 'list' && (
            <p className="text-xs text-muted line-clamp-2 mt-1.5">
              {product.descripcion || 'Sin descripción'}
            </p>
          )}
        </div>
        
        {/* Pie de Tarjeta / Precios y CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 min-w-0">
          <div className="flex flex-col min-w-0 flex-1">
            {/* Precio tachado original */}
            {product.tienePromocion && product.precioPromo < product.precioBase && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-1 block font-medium">
                {formatCurrency(product.precioBase)}
              </span>
            )}
            
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className={`text-sm sm:text-base font-extrabold leading-none truncate ${isOutOfStock ? 'text-gray-400 line-through' : 'text-primary'}`} title={formatCurrency(actualPrice)}>
                {formatCurrency(actualPrice)}
              </span>
              
              {product.tienePromocion && product.precioPromo < product.precioBase && (
                <span className="text-[8px] font-black text-green-700 bg-green-600/10 dark:bg-green-500/15 dark:text-green-400 px-1.5 py-0.5 rounded-md shrink-0 border border-green-500/10">
                  {product.promocion?.discountType === 'percentage'
                    ? `${product.promocion.discountValue}%`
                    : 'OFERTA'}
                </span>
              )}
            </div>
          </div>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (product.isTemporal) {
                  onOpenDetail(product)
                } else {
                  navigate('/tienda/producto/' + product.id)
                }
              }}
              className="w-8.5 h-8.5 rounded-full bg-primary hover:bg-primary-soft text-white flex items-center justify-center shadow-md shadow-primary/20 hover:shadow-lg hover:rotate-90 active:scale-95 transition-all duration-300 shrink-0 cursor-pointer"
              aria-label={`Ver opciones de ${product.nombre}`}
            >
              <Plus size={15} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

