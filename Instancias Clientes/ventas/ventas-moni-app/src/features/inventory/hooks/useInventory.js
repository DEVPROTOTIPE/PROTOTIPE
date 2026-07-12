import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import * as inventoryService from '../services/inventoryService'

const KEYS = {
  products: ['products'],
  product: (id) => ['product', id],
  categories: ['categories'],
}

// ─── HOOKS DE CATEGORÍAS ─────────────────────────────────────────────────────

/**
 * Hook para obtener todas las categorías de inventario.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>>} Query de categorías.
 */
export function useCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: inventoryService.getCategories,
  })
}

/**
 * Hook de mutación para crear una nueva categoría.
 * @returns {import('@tanstack/react-query').UseMutationResult<string, Error, object>} Mutación de creación.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories })
    },
  })
}

/**
 * Hook de mutación para actualizar una categoría.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string, data: object }>} Mutación de actualización.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories })
    },
  })
}

/**
 * Hook de mutación para eliminar una categoría.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string>} Mutación de eliminación.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories })
    },
  })
}

// ─── HOOKS DE PRODUCTOS ──────────────────────────────────────────────────────

/**
 * Hook para obtener listado de productos con promociones y pre-carga de imágenes en background.
 * @param {boolean} [onlyActive=false] - Filtrar productos inactivos.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>>} Query de productos.
 */
export function useProducts(onlyActive = false) {
  return useQuery({
    queryKey: [...KEYS.products, { onlyActive }],
    queryFn: async () => {
      const rawProducts = await inventoryService.getProducts(onlyActive)
      
      const products = rawProducts.map(p => {
        if (p.discountActive && (p.discountValue || 0) > 0) {
          const base = p.precioBase || 0
          const val = p.discountValue || 0
          const finalPrice = Math.max(0, p.discountType === 'percentage' ? base - (base * val) / 100 : base - val)
          
          return {
            ...p,
            tienePromocion: true,
            precioPromo: finalPrice,
            promocion: {
              discountType: p.discountType || 'percentage',
              discountValue: val,
              glowEffect: true
            }
          }
        }
        return p
      })

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          products.slice(0, 12).forEach(p => {
            if (p.imageUrl) {
              const img = new Image()
              img.src = p.imageUrl
            }
          })
        }, 500)
      }
      
      return products
    },
  })
}

/**
 * Hook para obtener productos de manera infinita/paginada.
 * @param {object} params - Parámetros del catálogo.
 * @param {boolean} [params.onlyActive=true] - Filtrar sólo productos activos.
 * @param {string} [params.categoryId='all'] - Categoría por la cual filtrar.
 * @param {number} [params.pageSize=12] - Productos por página.
 * @returns {import('@tanstack/react-query').UseInfiniteQueryResult<{ products: Array<object>, lastVisible: object|null, hasMore: boolean }>} Query infinita de productos.
 */
export function useProductsInfinite({ onlyActive = true, categoryId = 'all', pageSize = 12 } = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.products, { onlyActive, categoryId, pageSize, infinite: true }],
    queryFn: async ({ pageParam = null }) => {
      const result = await inventoryService.getProductsPaged({
        onlyActive,
        categoryId,
        lastVisibleDoc: pageParam,
        pageSize
      })

      const products = result.products.map(p => {
        if (p.discountActive && (p.discountValue || 0) > 0) {
          const base = p.precioBase || 0
          const val = p.discountValue || 0
          const finalPrice = Math.max(0, p.discountType === 'percentage' ? base - (base * val) / 100 : base - val)
          
          return {
            ...p,
            tienePromocion: true,
            precioPromo: finalPrice,
            promocion: {
              discountType: p.discountType || 'percentage',
              discountValue: val,
              glowEffect: true
            }
          }
        }
        return p
      })

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          products.forEach(p => {
            if (p.imageUrl) {
              const img = new Image()
              img.src = p.imageUrl
            }
          })
        }, 500)
      }

      return {
        ...result,
        products
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible || undefined
  })
}

/**
 * Hook para obtener un único producto por su ID.
 * @param {string} id - Identificador del producto.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>} Query del producto.
 */
export function useProduct(id) {
  return useQuery({
    queryKey: KEYS.product(id),
    queryFn: () => inventoryService.getProductById(id),
    enabled: !!id,
  })
}

/**
 * Hook de mutación para crear un producto.
 * @returns {import('@tanstack/react-query').UseMutationResult<string, Error, object>} Mutación de creación.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.products })
    },
  })
}

/**
 * Hook de mutación para actualizar un producto.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string, data: object }>} Mutación de actualización.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.products })
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) })
    },
  })
}

/**
 * Hook de mutación para alternar el estado de activación de un producto.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string, currentStatus: boolean }>} Mutación de alternancia de estado.
 */
export function useToggleProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentStatus }) => inventoryService.toggleProductStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.products })
    },
  })
}

/**
 * Hook de mutación para eliminar un producto físicamente.
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string>} Mutación de eliminación.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.products })
    },
  })
}
