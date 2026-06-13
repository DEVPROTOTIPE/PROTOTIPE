import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
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
import { db } from '../config/firebaseConfig'
import { COLLECTIONS } from '../constants'
import { createCentralNotification, NC_TYPES } from './notificationCenterService'

const productsRef = collection(db, COLLECTIONS.PRODUCTS)
const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)

// ─── AUDITORÍA PROACTIVA DE INVENTARIO ─────────────────────────────────────────
async function auditProductStock(productId, productData) {
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

export async function getCategories() {
  const q = query(categoriesRef, orderBy('nombre', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function createCategory(categoryData) {
  const docRef = await addDoc(categoriesRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateCategory(id, categoryData) {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id)
  await updateDoc(docRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
}

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────

export async function getProducts(onlyActive = false) {
  let q = productsRef
  if (onlyActive) {
    q = query(productsRef, where('activo', '==', true))
  }
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

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
    // Fallback: si el índice compuesto no está listo o hay un error de query,
    // cargar todos y filtrar en memoria para no dejar el catálogo en blanco.
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

export async function getProductById(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
  if (!snap.exists()) throw new Error('Producto no encontrado')
  return { id: snap.id, ...snap.data() }
}

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

  // Auditar stock inmediatamente
  await auditProductStock(docRef.id, dataToSave)

  return docRef.id
}

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

  // Auditar stock inmediatamente al actualizar
  await auditProductStock(id, dataToSave)
}

export async function toggleProductStatus(id, currentStatus) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id)
  await updateDoc(docRef, {
    activo: !currentStatus,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id))
}
