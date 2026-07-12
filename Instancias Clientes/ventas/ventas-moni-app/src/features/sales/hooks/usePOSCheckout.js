import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPhysicalOrder } from '../services/salesService'
import { ORDER_STATES, PAYMENT_METHODS } from '../../../constants'
import { 
  addOfflineSale, 
  updateOfflineProductStock, 
  getOfflineProducts 
} from '../../../services/offlineDB'

/**
 * Hook de mutación para finalizar una venta física en el mostrador/POS.
 * Registra la orden e invalida las queries de pedidos, productos y créditos.
 */
export function useCreatePhysicalOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderData, adminId }) => createPhysicalOrder(orderData, adminId),
    onSuccess: (_, variables) => {
      if (variables.orderData.cliente?.celular) {
        queryClient.invalidateQueries({
          queryKey: ['order_tracking', 'client', variables.orderData.cliente.celular],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['credits'] })
    },
  })
}

/**
 * Hook para gestionar el flujo de checkout en el POS (finalizar venta, online/offline, e impresión).
 */
export function usePOSCheckout({
  cart,
  getCartTotal,
  foundClient,
  paymentMethod,
  notes,
  currentAdmin,
  isOnline,
  showAlert,
  setStockAlert,
  onSaleSuccess,
  onOfflineProductsUpdate
}) {
  const { mutateAsync: createPhysicalOrderMutation, isPending: isSubmitting } = useCreatePhysicalOrder()
  const [lastOrderDetails, setLastOrderDetails] = useState(null)

  const finalizeSale = useCallback(async () => {
    if (cart.length === 0) return
    if (!foundClient) {
      if (showAlert) {
        showAlert({ 
          title: 'Cliente requerido', 
          message: 'Por favor selecciona o registra un cliente primero.', 
          variant: 'warning' 
        })
      }
      return
    }

    try {
      const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return "Mobile";
        return "Desktop";
      }

      const orderData = {
        cliente: {
          nombre: foundClient.nombre,
          celular: foundClient.celular,
        },
        metodoPago: paymentMethod,
        notas: notes,
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          nombre: item.nombre,
          descripcion: item.descripcion || '',
          precio: item.precio,
          talla: item.talla,
          color: item.color,
          cantidad: item.cantidad,
          imageUrl: item.imageUrl
        })),
        total: getCartTotal(),
        dispositivo: getDeviceType()
      }

      const adminId = currentAdmin?.uid || currentAdmin?.email || 'admin'

      if (!isOnline) {
        // MODO OFFLINE: Guardar localmente
        const tempOrderId = `offline-sale-${Date.now()}`
        const orderNumber = `OR-POS-OFFLINE-${Math.floor(100000 + Math.random() * 900000)}`

        const resolvedStatus = (paymentMethod === PAYMENT_METHODS.CASH || paymentMethod === PAYMENT_METHODS.TRANSFER)
          ? ORDER_STATES.COMPLETED
          : (paymentMethod === PAYMENT_METHODS.CREDIT ? ORDER_STATES.CREDIT_APPROVED : ORDER_STATES.PENDING)

        const saleData = {
          id: tempOrderId,
          adminId,
          orderData: {
            ...orderData,
            orderNumber,
            estado: resolvedStatus,
            stockDescontado: true,
            offline: true
          }
        }

        // Guardar venta offline en la cola IndexedDB
        await addOfflineSale(saleData)

        // Descontar stock localmente en IndexedDB
        for (const item of cart) {
          if (!item.productId?.startsWith('custom-')) {
            await updateOfflineProductStock(item.productId, item.variantId, item.cantidad)
          }
        }

        // Recargar productos locales para actualizar la interfaz
        const updatedOfflineProducts = await getOfflineProducts()
        if (onOfflineProductsUpdate) {
          onOfflineProductsUpdate(updatedOfflineProducts)
        }

        setLastOrderDetails({
          ...orderData,
          orderNumber,
          offline: true,
          createdAt: new Date()
        })
      } else {
        // MODO ONLINE: Crear en Firebase a través de transacción
        const result = await createPhysicalOrderMutation({ orderData, adminId })

        setLastOrderDetails({
          ...orderData,
          orderNumber: result.orderNumber,
          createdAt: new Date()
        })
      }

      // Limpieza de campos al completar con éxito la venta
      if (onSaleSuccess) {
        onSaleSuccess()
      }
    } catch (e) {
      console.error('[usePOSCheckout] Error al procesar la venta:', e)
      if (showAlert) {
        showAlert({ 
          title: 'Error al procesar', 
          message: `Error al procesar la venta: ${e.message}`, 
          variant: 'error' 
        })
      }
    }
  }, [
    cart, 
    getCartTotal, 
    foundClient, 
    paymentMethod, 
    notes, 
    currentAdmin, 
    isOnline, 
    showAlert, 
    createPhysicalOrderMutation, 
    onOfflineProductsUpdate, 
    onSaleSuccess
  ])

  return {
    isSubmitting,
    finalizeSale,
    lastOrderDetails,
    setLastOrderDetails
  }
}
