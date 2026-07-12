// Barrel export for the sales feature

export {
  createPhysicalOrder,
  syncOfflineSales
} from './services/salesService'

export { usePOSCart } from './hooks/usePOSCart'
export { useCreatePhysicalOrder, usePOSCheckout } from './hooks/usePOSCheckout'
export { useOfflineSaleSync } from './hooks/useOfflineSaleSync'

export { default as POSVariantModal } from './components/POSVariantModal'
export { default as POSReceiptModal } from './components/POSReceiptModal'
export { default as POSCustomItemForm } from './components/POSCustomItemForm'
