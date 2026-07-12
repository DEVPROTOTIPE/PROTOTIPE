import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS } from '../../../constants'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'
import { deleteImage } from '../../../services/uploadService'

const productsRef = collection(db, COLLECTIONS.PRODUCTS)
const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)

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
  const q = query(categoriesRef, orderBy('nombre', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Crea una nueva categoría en la base de datos.
 * @param {object} categoryData - Datos de la categoría.
 * @returns {Promise<string>} Identificador de la categoría creada.
 */
export async function createCategory(categoryData) {
  const docRef = await addDoc(categoriesRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Actualiza los datos de una categoría existente.
 * @param {string} id - Identificador de la categoría.
 * @param {object} categoryData - Datos a actualizar.
 * @returns {Promise<void>}
 */
export async function updateCategory(id, categoryData) {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id)
  await updateDoc(docRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Elimina de manera lógica/física una categoría.
 * @param {string} id - Identificador de la categoría a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
}

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────

/**
 * Obtiene todos los productos de la base de datos (con opción de filtrar activos).
 * @param {boolean} [onlyActive=false] - Indica si se deben retornar sólo productos activos.
 * @returns {Promise<Array<object>>} Listado de productos.
 */
export async function getProducts(onlyActive = false) {
  let q = productsRef
  if (onlyActive) {
    q = query(productsRef, where('activo', '==', true))
  }
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Obtiene productos paginados mediante cursores de Firestore, con soporte para fallbacks.
 * @param {object} params - Parámetros de paginación.
 * @param {boolean} [params.onlyActive=true] - Si se deben filtrar por activos.
 * @param {string} [params.categoryId='all'] - ID de la categoría a filtrar o 'all'.
 * @param {object|null} [params.lastVisibleDoc=null] - Último documento visible del lote anterior.
 * @param {number} [params.pageSize=12] - Tamaño del lote de productos a retornar.
 * @returns {Promise<{ products: Array<object>, lastVisible: object|null, hasMore: boolean }>} Lote de productos paginados.
 */
export async function getProductsPaged({ onlyActive = true, categoryId = 'all', lastVisibleDoc = null, pageSize = 12 } = {}) {
  try {
    let q = query(productsRef, where('activo', '==', onlyActive))

    if (categoryId && categoryId !== 'all') {
      q = query(q, where('categoriaId', '==', categoryId))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc))
    }

    q = query(q, limit(pageSize))

    const snap = await getDocs(q)
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const lastDoc = snap.docs[snap.docs.length - 1] || null

    return {
      products,
      lastVisible: lastDoc,
      hasMore: products.length === pageSize
    }
  } catch (err) {
    console.warn('[inventoryService] getProductsPaged fallback activado:', err.message)
    const snap = await getDocs(productsRef)
    let products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (onlyActive) {
      products = products.filter(p => p.activo === true)
    }
    if (categoryId && categoryId !== 'all') {
      products = products.filter(p => p.categoriaId === categoryId)
    }
    products.sort((a, b) => {
      const ta = a.createdAt?.seconds ?? 0
      const tb = b.createdAt?.seconds ?? 0
      return tb - ta
    })

    const start = lastVisibleDoc ? products.findIndex(p => p.id === lastVisibleDoc.id) + 1 : 0
    const page = products.slice(start, start + pageSize)

    return {
      products: page,
      lastVisible: page[page.length - 1] || null,
      hasMore: page.length === pageSize
    }
  }
}

/**
 * Obtiene un producto individual por su identificador.
 * @param {string} id - Identificador del producto.
 * @returns {Promise<object>} Datos del producto.
 * @throws {Error} Si el producto no es encontrado.
 */
export async function getProductById(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
  if (!snap.exists()) throw new Error('Producto no encontrado')
  return { id: snap.id, ...snap.data() }
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

  const docRef = await addDoc(productsRef, {
    ...dataToSave,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await auditProductStock(docRef.id, dataToSave)

  return docRef.id
}

/**
 * Actualiza la información de un producto existente y re-audita su stock.
 * @param {string} id - Identificador del producto.
 * @param {object} productData - Nuevos datos del producto.
 * @returns {Promise<void>}
 */
export async function updateProduct(id, productData) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id)
  const dataToSave = { ...productData }
  delete dataToSave.id
  delete dataToSave.createdAt
  delete dataToSave.updatedAt

  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key]
    }
  })

  await updateDoc(docRef, {
    ...dataToSave,
    updatedAt: serverTimestamp(),
  })

  await auditProductStock(id, dataToSave)
}

/**
 * Alterna el estado de activación de un producto.
 * @param {string} id - Identificador del producto.
 * @param {boolean} currentStatus - Estado actual de activación.
 * @returns {Promise<void>}
 */
export async function toggleProductStatus(id, currentStatus) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id)
  await updateDoc(docRef, {
    activo: !currentStatus,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Elimina físicamente un producto de Firestore y destruye de forma limpia sus imágenes en Storage.
 * @param {string} id - Identificador del producto a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
    if (snap.exists()) {
      const data = snap.data()
      const imageUrls = []

      if (data.imageUrl) imageUrls.push(data.imageUrl)

      if (Array.isArray(data.galeria)) {
        data.galeria.forEach(url => { if (url) imageUrls.push(url) })
      }

      if (Array.isArray(data.variantes)) {
        data.variantes.forEach(v => { if (v?.imageUrl) imageUrls.push(v.imageUrl) })
      }

      if (imageUrls.length > 0) {
        await Promise.allSettled(imageUrls.map(url => deleteImage(url)))
        console.log(`[inventoryService] ${imageUrls.length} imagen(es) eliminadas de Storage para producto ${id}`)
      }
    }
  } catch (err) {
    console.warn(`[inventoryService] Limpieza de Storage parcial para producto ${id}:`, err.message)
  }

  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id))
}
