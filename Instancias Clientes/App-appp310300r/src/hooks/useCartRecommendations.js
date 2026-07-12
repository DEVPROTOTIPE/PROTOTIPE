import { useState, useEffect, useRef } from 'react'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { getClientOrders } from '../features/orders'
import { getProducts } from '../features/inventory/services/inventoryService'

/**
 * Hook que calcula las recomendaciones de productos para mostrar en el carrito.
 *
 * Usa la misma lógica probada de App Moni con dos mejoras:
 * - Check `!== false` en lugar de `=== true` para soportar el estado inicial vacío {}
 * - fetchVersionRef para prevenir race conditions en apertura/cierre rápido
 *
 * @param {boolean} isOpen
 * @returns {{ recommendedProducts: object[], loadingRecs: boolean, recsTitle: string, cartRecsEnabled: boolean }}
 */
export function useCartRecommendations(isOpen) {
  const { commercialOptimization } = useAppConfigStore()
  const { user, role } = useAuthStore()

  // !== false: si el campo está ausente ({} o undefined), se trata como habilitado por defecto.
  // Solo deshabilita si está explícitamente en false.
  const optEnabled = commercialOptimization?.enabled !== false
  const cartRecsEnabled = optEnabled && commercialOptimization?.tools?.cartRecommendations?.enabled !== false
  const historyRecsEnabled = optEnabled && commercialOptimization?.tools?.historyRecommendations?.enabled !== false
  const recsTitle = commercialOptimization?.tools?.cartRecommendations?.title || 'Recomendado para ti'

  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  const isClient = role === 'client'
  const clientPhone = isClient && user?.celular

  // fetchVersionRef previene que un cierre rápido del carrito aplique resultados viejos
  const fetchVersionRef = useRef(0)

  useEffect(() => {
    if (!isOpen) {
      setRecommendedProducts([])
      return
    }
    if (!cartRecsEnabled && !historyRecsEnabled) return

    const currentVersion = ++fetchVersionRef.current
    let isMounted = true

    const fetchRecs = async () => {
      setLoadingRecs(true)
      try {
        const allProducts = await getProducts(true)

        if (!isMounted || fetchVersionRef.current !== currentVersion) return

        const currentItems = useCartStore.getState().items
        const cartProductIds = currentItems.map(item => item.productId)

        let historyCategories = []
        if (historyRecsEnabled && clientPhone) {
          try {
            const orders = await getClientOrders(clientPhone)
            const categories = new Set()
            orders.forEach(order => {
              order.items?.forEach(item => {
                const prod = allProducts.find(p => p.id === item.productId)
                if (prod?.categoria) categories.add(prod.categoria)
              })
            })
            historyCategories = Array.from(categories)
          } catch {
            // historial falla silenciosamente
          }
        }

        const candidates = allProducts.filter(p => {
          if (cartProductIds.includes(p.id)) return false
          // Respeta stockInfinito igual que ProductCard
          if (p.stockInfinito) return true
          if ((p.variantes || []).length > 0) {
            return !p.variantes.every(v => (v.stock || 0) <= 0)
          }
          return p.stock !== undefined ? p.stock > 0 : false
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
        if (isMounted && fetchVersionRef.current === currentVersion) {
          setRecommendedProducts(scoredCandidates.slice(0, 6).map(sc => sc.product))
        }
      } catch (err) {
        console.error('[CartRecs] Error al obtener recomendaciones:', err)
      } finally {
        if (isMounted && fetchVersionRef.current === currentVersion) {
          setLoadingRecs(false)
        }
      }
    }

    fetchRecs()
    return () => { isMounted = false }
  }, [isOpen, cartRecsEnabled, historyRecsEnabled, clientPhone])

  return { recommendedProducts, loadingRecs, recsTitle, cartRecsEnabled }
}
