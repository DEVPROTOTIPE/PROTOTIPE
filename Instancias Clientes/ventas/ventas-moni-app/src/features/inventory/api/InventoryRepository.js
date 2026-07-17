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
import { deleteImage } from '../../../services/uploadService'

function productsCollection() {
  return collection(db, COLLECTIONS.PRODUCTS)
}

function categoriesCollection() {
  return collection(db, COLLECTIONS.CATEGORIES)
}

export class InventoryRepository {
  // ─── CATEGORÍAS ────────────────────────────────────────────────────────
  static async getCategories() {
    const q = query(categoriesCollection(), orderBy('nombre', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  static async createCategory(categoryData) {
    const docRef = await addDoc(categoriesCollection(), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  }

  static async updateCategory(id, categoryData) {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, id)
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    })
  }

  static async deleteCategory(id) {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
  }

  // ─── PRODUCTOS ─────────────────────────────────────────────────────────
  static async getAll(onlyActive = false) {
    let q = productsCollection()
    if (onlyActive) {
      q = query(productsCollection(), where('activo', '==', true))
    }
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  static async getPaged({ onlyActive = true, categoryId = 'all', lastVisibleDoc = null, pageSize = 12 } = {}) {
    try {
      let q = query(productsCollection(), where('activo', '==', onlyActive))

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
      console.warn('[InventoryRepository] getPaged fallback activado:', err.message)
      const snap = await getDocs(productsCollection())
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

  static async getById(id) {
    const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
    if (!snap.exists()) throw new Error('Producto no encontrado')
    return { id: snap.id, ...snap.data() }
  }

  static async create(dataToSave) {
    const docRef = await addDoc(productsCollection(), {
      ...dataToSave,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  }

  static async update(id, dataToSave) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id)
    await updateDoc(docRef, {
      ...dataToSave,
      updatedAt: serverTimestamp(),
    })
  }

  static async toggleStatus(id, currentStatus) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id)
    await updateDoc(docRef, {
      activo: !currentStatus,
      updatedAt: serverTimestamp(),
    })
  }

  /**
   * Elimina físicamente un producto de Firestore y destruye de forma limpia
   * sus imágenes en Storage (best-effort, no bloquea si falla la limpieza).
   */
  static async delete(id) {
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
          console.log(`[InventoryRepository] ${imageUrls.length} imagen(es) eliminadas de Storage para producto ${id}`)
        }
      }
    } catch (err) {
      console.warn(`[InventoryRepository] Limpieza de Storage parcial para producto ${id}:`, err.message)
    }

    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id))
  }
}
