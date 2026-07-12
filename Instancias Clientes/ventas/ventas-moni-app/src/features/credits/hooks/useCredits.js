import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as creditService from '../services/creditService'

const KEYS = {
  credits: (estado) => ['credits', { estado }],
  clientCredits: (celular) => ['credits', 'client', celular],
}

/**
 * Hook para obtener y suscribirse a los créditos en tiempo real según el estado (Admin).
 * @param {string} [estado='activo'] - Estado del crédito ('activo', 'pagado').
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>>} Query de créditos.
 */
export function useCredits(estado = 'activo') {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = creditService.subscribeToCredits(estado, (credits) => {
      queryClient.setQueryData(KEYS.credits(estado), credits)
    })
    return () => unsubscribe()
  }, [estado, queryClient])

  return useQuery({
    queryKey: KEYS.credits(estado),
    queryFn: () => creditService.getCredits(estado),
    staleTime: Infinity,
  })
}

/**
 * Hook de mutación para añadir un abono a un crédito existente.
 * Invalida queries de 'credits' y 'orders' al completarse.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string, paymentData: object }>} Mutation para abonos.
 */
export function useAddPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, paymentData }) => creditService.addPaymentToCredit(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

/**
 * Hook para obtener y suscribirse a los créditos de un cliente específico en tiempo real.
 * @param {string} celular - Celular del cliente.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>>} Query de créditos del cliente.
 */
export function useClientCredits(celular) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!celular) return
    const unsubscribe = creditService.subscribeToClientCredits(celular, (credits) => {
      queryClient.setQueryData(KEYS.clientCredits(celular), credits)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    })
    return () => unsubscribe()
  }, [celular, queryClient])

  return useQuery({
    queryKey: KEYS.clientCredits(celular),
    queryFn: () => creditService.getClientCredits(celular),
    enabled: !!celular,
    staleTime: Infinity,
  })
}
