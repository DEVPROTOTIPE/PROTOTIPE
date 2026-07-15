import { InventoryRepository } from '../api/InventoryRepository'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'

/**
 * Realiza una auditoría proactiva sobre el stock de las variantes de un producto.
 * Lanza notificaciones si el stock se agota o cae por debajo del umbral crítico.
 * @param {string} productId - Identificador del producto.
 * @param {object} productData - Datos del producto y sus variantes.
 * @returns {Promise<void>}
 */
export async function auditProductStock(productId, productData) {
  if (!productData || !productData.variantes) return

  const stockBajoUmbral = 5
  const variantes = productData.variantes

  for (const variant of variantes) {
    const stock = Number(variant.stock) || 0
    const label = [variant.talla, variant.color].filter(Boolean).join(' / ')

    if (stock === 0) {
      await createCentralNotification({
        recipientId: 'admin',
        recipientRole: 'admin',
        title: 'Producto Agotado',
        body: `La variante "${label}" del producto "${productData.nombre}" se ha agotado por completo.`,
        type: NC_TYPES.PRODUCTO_AGOTADO,
        extra: { productId, variantId: variant.id }
      })
    } else if (stock <= stockBajoUmbral) {
      await createCentralNotification({
        recipientId: 'admin',
        recipientRole: 'admin',
        title: 'Alerta de Stock Bajo',
        body: `La variante "${label}" del producto "${productData.nombre}" tiene stock crítico de ${stock} unidades.`,
        type: NC_TYPES.STOCK_BAJO,
        extra: { productId, variantId: variant.id }
      })
    }
  }
}

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────

/**
 * Obtiene todas las categorías activas ordenadas alfabéticamente.
 * @returns {Promise<Array<object>>} Listado de categorías.
 */
export async function getCategories() {
  return InventoryRepository.getCategories()
}

/**
 * Crea una nueva categoría en la base de datos.
 * @param {object} categoryData - Datos de la categoría.
 * @returns {Promise<string>} Identificador de la categoría creada.
 */
export async function createCategory(categoryData) {
  return InventoryRepository.createCategory(categoryData)
}

/**
 * Actualiza los datos de una categoría existente.
 * @param {string} id - Identificador de la categoría.
 * @param {object} categoryData - Datos a actualizar.
 * @returns {Promise<void>}
 */
export async function updateCategory(id, categoryData) {
  await InventoryRepository.updateCategory(id, categoryData)
}

/**
 * Elimina de manera lógica/física una categoría.
 * @param {string} id - Identificador de la categoría a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  await InventoryRepository.deleteCategory(id)
}

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────

/**
 * Obtiene todos los productos de la base de datos (con opción de filtrar activos).
 * @param {boolean} [onlyActive=false] - Indica si se deben retornar sólo productos activos.
 * @returns {Promise<Array<object>>} Listado de productos.
 */
export async function getProducts(onlyActive = false) {
  return InventoryRepository.getAll(onlyActive)
}

/**
 * Obtiene productos paginados mediante cursores de Firestore, con soporte para fallbacks.
 * @param {object} params - Parámetros de paginación.
 * @returns {Promise<{ products: Array<object>, lastVisible: object|null, hasMore: boolean }>} Lote de productos paginados.
 */
export async function getProductsPaged(params = {}) {
  return InventoryRepository.getPaged(params)
}

/**
 * Obtiene un producto individual por su identificador.
 * @param {string} id - Identificador del producto.
 * @returns {Promise<object>} Datos del producto.
 * @throws {Error} Si el producto no es encontrado.
 */
export async function getProductById(id) {
  return InventoryRepository.getById(id)
}

/**
 * Registra un nuevo producto en Firestore y audita su stock.
 * @param {object} productData - Datos del producto a guardar.
 * @returns {Promise<string>} Identificador del producto creado.
 */
export async function createProduct(productData) {
  const dataToSave = { ...productData }
  delete dataToSave.id
  delete dataToSave.createdAt
  delete dataToSave.updatedAt

  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key]
    }
  })

  const id = await InventoryRepository.create(dataToSave)
  await auditProductStock(id, dataToSave)

  return id
}

/**
 * Actualiza la información de un producto existente y re-audita su stock.
 * @param {string} id - Identificador del producto.
 * @param {object} productData - Nuevos datos del producto.
 * @returns {Promise<void>}
 */
export async function updateProduct(id, productData) {
  const dataToSave = { ...productData }
  delete dataToSave.id
  delete dataToSave.createdAt
  delete dataToSave.updatedAt

  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key]
    }
  })

  await InventoryRepository.update(id, dataToSave)
  await auditProductStock(id, dataToSave)
}

/**
 * Alterna el estado de activación de un producto.
 * @param {string} id - Identificador del producto.
 * @param {boolean} currentStatus - Estado actual de activación.
 * @returns {Promise<void>}
 */
export async function toggleProductStatus(id, currentStatus) {
  await InventoryRepository.toggleStatus(id, currentStatus)
}

/**
 * Elimina físicamente un producto de Firestore y destruye de forma limpia sus imágenes en Storage.
 * @param {string} id - Identificador del producto a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  await InventoryRepository.delete(id)
}
