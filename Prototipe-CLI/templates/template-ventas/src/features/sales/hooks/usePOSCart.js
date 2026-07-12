import { useState, useCallback } from 'react'

/**
 * Hook customizado para la gestión del carrito de compras en el POS.
 * Maneja el estado de los ítems, cantidades y cálculos del total.
 */
export function usePOSCart() {
  const [cart, setCart] = useState([])

  const addToCart = useCallback((product, variant, qty, setStockAlert) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      )
      if (existingIdx !== -1) {
        const newCart = [...prev]
        const newQty = newCart[existingIdx].cantidad + qty
        if (newQty > variant.stock) {
          if (setStockAlert) {
            setStockAlert({
              message: `Stock insuficiente. Máximo disponible: ${variant.stock} unidad(es).`,
            })
          }
          return prev
        }
        newCart[existingIdx].cantidad = newQty
        return newCart
      } else {
        if (qty > variant.stock) {
          if (setStockAlert) {
            setStockAlert({
              message: `Stock insuficiente. Disponible: ${variant.stock} unidad(es).`,
            })
          }
          return prev
        }
        return [
          ...prev,
          {
            productId: product.id,
            variantId: variant.id,
            nombre: product.nombre,
            precio: product.precioBase,
            talla: variant.talla || null,
            color: variant.color || null,
            cantidad: qty,
            maxStock: variant.stock,
            imageUrl: product.imageUrl || null,
          },
        ]
      }
    })
  }, [])

  const updateCartQty = useCallback((idx, delta, setStockAlert) => {
    setCart((prev) => {
      const item = prev[idx]
      const newQty = item.cantidad + delta
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx)
      }
      if (newQty > item.maxStock) {
        if (setStockAlert) {
          setStockAlert({
            message: `Stock insuficiente. Máximo disponible: ${item.maxStock} unidad(es).`,
          })
        }
        return prev
      }
      const newCart = [...prev]
      newCart[idx].cantidad = newQty
      return newCart
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  }, [cart])

  return {
    cart,
    setCart,
    addToCart,
    updateCartQty,
    clearCart,
    getCartTotal,
  }
}
