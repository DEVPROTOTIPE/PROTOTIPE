import { useMemo } from 'react'

export function useProductVariants(product, selectedTalla, selectedColor, options = {}) {
  const {
    showSizes = true,
    showColors = true,
    commercialOptimization = {}
  } = options

  const isNewProduct = useMemo(() => {
    if (!product?.createdAt) return false
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

    const limitDays = commercialOptimization?.tools?.smartTags?.newProduct?.daysLimit || 7
    const diffTime = Math.abs(Date.now() - createdDateMs)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= limitDays
  }, [product?.createdAt, commercialOptimization])

  const stockConsolidado = useMemo(() => {
    if (!product) return 0
    return (product.variantes || []).reduce((sum, v) => sum + (v.stock || 0), 0)
  }, [product])

  const activeSmartTag = useMemo(() => {
    const smartTags = commercialOptimization?.tools?.smartTags || {}
    if (!product || !smartTags.enabled) return null

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
  }, [product, commercialOptimization, stockConsolidado, isNewProduct])

  const availableVariants = useMemo(() => {
    if (!product) return []
    return (product.variantes || []).filter(v => (v.stock || 0) > 0)
  }, [product])

  const tallas = useMemo(() => {
    if (!showSizes) return []
    const t = new Set(availableVariants.map(v => v.talla).filter(Boolean))
    return Array.from(t)
  }, [availableVariants, showSizes])

  const colores = useMemo(() => {
    if (!showColors) return []
    let validVariants = availableVariants
    if (selectedTalla) {
      validVariants = validVariants.filter(v => v.talla === selectedTalla)
    }
    const c = new Set(validVariants.map(v => v.color).filter(Boolean))
    return Array.from(c)
  }, [availableVariants, selectedTalla, showColors])

  const currentVariant = useMemo(() => {
    if (!product) return null
    return availableVariants.find(v => 
      ((!showSizes || v.talla === selectedTalla) || (!v.talla && !selectedTalla)) &&
      ((!showColors || v.color === selectedColor) || (!v.color && !selectedColor))
    )
  }, [availableVariants, selectedTalla, selectedColor, showSizes, showColors, product])

  const actualPrice = useMemo(() => {
    if (!product) return 0
    if (currentVariant?.precio && Number(currentVariant.precio) > 0) {
      return Number(currentVariant.precio)
    }
    return (product.tienePromocion && product.precioPromo < product.precioBase)
      ? product.precioPromo
      : product.precioBase
  }, [currentVariant, product])

  return {
    isNewProduct,
    stockConsolidado,
    activeSmartTag,
    availableVariants,
    tallas,
    colores,
    currentVariant,
    actualPrice
  }
}
