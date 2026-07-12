import { useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as orderService from '../services/orderService'
import { saveClientProfile } from '../../../services/userService'

const KEYS = {
  orders: ['orders'],
  clientOrders: (celular) => ['order_tracking', 'client', celular],
}

// ─── ADMIN HOOKS ─────────────────────────────────────────────────────────────

export function useOrders(showArchived = false, filterDate = '') {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ['orders', showArchived, filterDate], [showArchived, filterDate])

  useEffect(() => {
    // Suscribir solo a pedidos activos (subscribeToOrders ya filtra por archivado === false)
    const unsubscribe = orderService.subscribeToOrders((activeList) => {
      queryClient.setQueryData(queryKey, (prev = []) => {
        const archivedList = prev.filter(o => o.archivado === true)
        return [...activeList, ...archivedList]
      })
    })
    return () => unsubscribe()
  }, [queryClient, queryKey])

  return useQuery({
    queryKey,
    queryFn: async () => {
      const activeList = await orderService.getOrders()
      if (showArchived || filterDate) {
        const archivedList = await orderService.getArchivedOrders(filterDate)
        return [...activeList, ...archivedList]
      }
      return activeList
    },
    staleTime: Infinity, // El caché de activos lo maneja onSnapshot
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus, currentOrder }) => 
      orderService.updateOrderStatus(id, newStatus, currentOrder),
    onSuccess: () => {
      // Al actualizar un estado (especialmente si es Completado o Crédito Aprobado),
      // invalidamos los pedidos, el inventario y los créditos.
      queryClient.invalidateQueries({ queryKey: KEYS.orders })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['credits'] })
    },
  })
}


// ─── CLIENT HOOKS ────────────────────────────────────────────────────────────

export function useClientOrders(celular) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!celular) return
    const unsubscribe = orderService.subscribeToClientOrders(celular, (orders) => {
      queryClient.setQueryData(KEYS.clientOrders(celular), orders)
    })
    return () => unsubscribe()
  }, [celular, queryClient])

  return useQuery({
    queryKey: KEYS.clientOrders(celular),
    queryFn: () => orderService.getClientOrders(celular),
    enabled: !!celular,
    staleTime: Infinity, // El caché lo maneja onSnapshot
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (_, variables) => {
      // Invalidar caché de pedidos
      if (variables.cliente?.celular) {
        queryClient.invalidateQueries({ queryKey: KEYS.clientOrders(variables.cliente.celular) })
      }
      queryClient.invalidateQueries({ queryKey: KEYS.orders })

      // — Fidelización automática del cliente —
      // Guardar/actualizar el perfil del cliente en Firestore usando el número limpio
      // como ID del documento. Si ya existía, el merge:true conserva sus datos previos.
      const rawPhone = variables.cliente?.celular || ''
      const cleanPhone = rawPhone.replace(/\D/g, '')
      const nombre = variables.cliente?.nombre || ''
      if (cleanPhone && nombre) {
        saveClientProfile(cleanPhone, nombre).catch(err =>
          console.error('[useCreateOrder] Error al registrar cliente:', err)
        )
      }
    },
  })
}


