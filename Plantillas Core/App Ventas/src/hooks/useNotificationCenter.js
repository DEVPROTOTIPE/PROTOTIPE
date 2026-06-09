/**
 * useNotificationCenter.js
 * ─────────────────────────────────────────────────────────────────
 * Hook unificado del Notification Center con paginación lazy.
 *
 * ESTRATEGIA:
 *  - 1 listener en tiempo real sobre las PAGE_SIZE notificaciones más recientes.
 *    Solo sirve para detectar notificaciones nuevas (badge + sonido) y poblar
 *    el lote inicial del tray.
 *  - onLoadMore() ejecuta getDocs (one-shot, sin listener) con startAfter cursor
 *    para cargar el siguiente lote solo cuando el usuario hace scroll.
 *
 * Uso:
 *   const { notifications, unreadCount, isRinging, hasMore, isLoadingMore,
 *           markRead, loadMore } = useNotificationCenter({ recipientId, recipientRole })
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  subscribeToCentralNotifications,
  fetchNotificationsPage,
  markAsRead,
  markAllAsRead,
  archiveAll,
  NC_TYPE_META,
} from '../services/notificationCenterService'
import { playSynthesizedSound } from '../utils/audio'

const PAGE_SIZE = 15

/**
 * @param {Object} params
 * @param {string} params.recipientId    - Celular, employeeId o 'admin'
 * @param {string} params.recipientRole  - 'admin' | 'client' | 'cocinero' | etc.
 * @param {boolean} [params.soundEnabled] - Si se reproducen sonidos (default: true)
 */
export default function useNotificationCenter({
  recipientId,
  recipientRole,
  soundEnabled = true,
} = {}) {
  // Lista acumulada visible en el tray (lote live + páginas cargadas)
  const [notifications, setNotifications] = useState([])
  const [isRinging, setIsRinging] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Cursor para paginación: el último DocumentSnapshot del lote histórico
  const lastDocRef = useRef(null)
  // IDs ya en la lista para evitar duplicados al fusionar live + histórico
  const idsInListRef = useRef(new Set())
  // IDs vistos en esta sesión para disparar sonido solo en nuevas
  const seenIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)

  // Ref para soundEnabled (evita stale closure en el listener)
  const soundEnabledRef = useRef(soundEnabled)
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  const triggerRing = useCallback(() => {
    setIsRinging(true)
    const t = setTimeout(() => setIsRinging(false), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    // Reset al cambiar de usuario o desloguearse (evita leak de datos al quedar nulo)
    isInitializedRef.current = false
    seenIdsRef.current = new Set()
    idsInListRef.current = new Set()
    lastDocRef.current = null
    setNotifications([])
    setHasMore(false)

    if (!recipientId || !recipientRole) return
    if (recipientRole === 'client' && (recipientId === 'client' || recipientId === 'anonimo')) return

    const sessionStartTime = Date.now() - 1000 // Margen de 1 segundo de seguridad

    const unsub = subscribeToCentralNotifications(
      recipientId,
      recipientRole,
      (liveItems) => {
        if (!isInitializedRef.current) {
          // Primera carga: poblar lista inicial y marcar como vistos
          liveItems.forEach(n => {
            seenIdsRef.current.add(n.id)
            idsInListRef.current.add(n.id)
          })
          isInitializedRef.current = true

          // El último doc del lote live es el cursor para la primera página histórica
          if (liveItems.length === PAGE_SIZE) {
            lastDocRef.current = liveItems[liveItems.length - 1]._doc
            setHasMore(true)
          } else {
            lastDocRef.current = null
            setHasMore(false)
          }

          setNotifications(liveItems)
          return
        }

        // Actualizaciones posteriores: detectar nuevas y mergear con la lista
        const newItems = liveItems.filter(n => !seenIdsRef.current.has(n.id))

        if (newItems.length > 0) {
          newItems.forEach(n => seenIdsRef.current.add(n.id))
          
          // Solo hacer sonar/animar si la notificación es realmente nueva en esta sesión
          const firstNew = newItems[0]
          const createdTime = firstNew.createdAt?.toDate ? firstNew.createdAt.toDate().getTime() : (firstNew.createdAt ? new Date(firstNew.createdAt).getTime() : sessionStartTime + 2000)
          
          if (createdTime > sessionStartTime) {
            const meta = NC_TYPE_META[firstNew.type] || {}
            const sound = firstNew.soundCategory || meta.sound || 'pedido'
            playSynthesizedSound(sound, soundEnabledRef.current)
            triggerRing()
          }
        }

        // Mergear: los items live van al principio; preservar páginas históricas al fondo
        setNotifications(prev => {
          const historicItems = prev.filter(n => !liveItems.some(l => l.id === n.id))
          const merged = [...liveItems, ...historicItems]
          // Actualizar idsInListRef
          merged.forEach(n => idsInListRef.current.add(n.id))
          return merged
        })
      },
      PAGE_SIZE
    )

    return () => {
      unsub()
      isInitializedRef.current = false
    }
  }, [recipientId, recipientRole, triggerRing])

  // ─── Cargar más (paginación bajo demanda) ─────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !isInitializedRef.current) return

    setIsLoadingMore(true)
    try {
      const { items, lastDoc, hasMore: more } = await fetchNotificationsPage(
        recipientId,
        recipientRole,
        PAGE_SIZE,
        lastDocRef.current
      )

      if (items.length > 0) {
        // Filtrar duplicados con los ya presentes en la lista
        const deduped = items.filter(n => !idsInListRef.current.has(n.id))
        deduped.forEach(n => idsInListRef.current.add(n.id))

        if (deduped.length > 0) {
          setNotifications(prev => [...prev, ...deduped])
        }
      }

      lastDocRef.current = lastDoc
      setHasMore(more)
    } catch (err) {
      console.error('[NC] loadMore error:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [recipientId, recipientRole, isLoadingMore, hasMore])

  // ─── Contadores ────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => n.status === 'unread').length

  // ─── Acciones ──────────────────────────────────────────────────────────────
  const markRead = useCallback((notificationId) => {
    markAsRead(notificationId)
  }, [])

  const markAllRead = useCallback(() => {
    // Limpieza optimista: marcar todos como leídos en estado local inmediatamente
    setNotifications(prev => prev.map(n => n.status === 'unread' ? { ...n, status: 'read' } : n))
    markAllAsRead(recipientId, recipientRole)
  }, [recipientId, recipientRole])

  const clearAll = useCallback(() => {
    // Limpieza optimista: vaciar lista local inmediatamente sin esperar al listener
    setNotifications([])
    idsInListRef.current = new Set()
    lastDocRef.current = null
    setHasMore(false)
    archiveAll(recipientId, recipientRole)
  }, [recipientId, recipientRole])

  return {
    notifications,
    unreadCount,
    isRinging,
    hasMore,
    isLoadingMore,
    markRead,
    markAllRead,
    clearAll,
    loadMore,
  }
}
