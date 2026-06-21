const DB_NAME = 'AppVentasPOS_v2'
const DB_VERSION = 2

let isRecovering = false

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        const err = request.error
        console.error('[IndexedDB] Error al abrir base de datos local:', err)
        
        // Si hay corrupción o fallo de versión persistente, intentar purgar la base de datos
        if (!isRecovering) {
          isRecovering = true
          console.warn('[IndexedDB] Detectado posible estado corrupto. Intentando purgar y auto-recuperar DB...')
          
          try {
            const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
            deleteRequest.onsuccess = () => {
              console.log('[IndexedDB] Purgado de base de datos local exitoso. Re-inicializando...')
              isRecovering = false
              openDB().then(resolve).catch(reject)
            }
            deleteRequest.onerror = () => {
              console.error('[IndexedDB] No se pudo purgar la base de datos corrupta:', deleteRequest.error)
              isRecovering = false
              reject(err)
            }
          } catch (deleteErr) {
            console.error('[IndexedDB] Excepción al borrar DB:', deleteErr)
            isRecovering = false
            reject(err)
          }
        } else {
          reject(err)
        }
      }

      request.onsuccess = () => {
        isRecovering = false
        resolve(request.result)
      }

      request.onupgradeneeded = () => {
        const db = request.result
        
        // Store de productos
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' })
        }
        
        // Store de categorías
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' })
        }
        
        // Store de ventas offline
        if (!db.objectStoreNames.contains('offline_sales')) {
          db.createObjectStore('offline_sales', { keyPath: 'id' })
        }

        // Store de clientes offline
        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id' })
        }
      }
    } catch (e) {
      console.error('[IndexedDB] Excepción síncrona al abrir DB:', e)
      reject(e)
    }
  })
}

// Operaciones de clientes offline
export async function getOfflineClient(celular) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clients', 'readonly')
    const store = transaction.objectStore('clients')
    const request = store.get(celular)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineClient(client) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clients', 'readwrite')
    const store = transaction.objectStore('clients')
    const request = store.put(client)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineClients(clients, clearFirst = true) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clients', 'readwrite')
    const store = transaction.objectStore('clients')
    
    if (clearFirst) {
      store.clear()
    }
    
    clients.forEach(client => {
      // IndexedDB requiere keyPath 'id'
      const clientData = { ...client, id: client.id || client.celular }
      store.put(clientData)
    })
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Operaciones generales de lectura/escritura promesificadas
export async function getOfflineProducts() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readonly')
    const store = transaction.objectStore('products')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineProducts(products) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readwrite')
    const store = transaction.objectStore('products')
    
    // Limpiar previo
    store.clear()
    
    products.forEach(product => {
      store.put(product)
    })
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getOfflineCategories() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readonly')
    const store = transaction.objectStore('categories')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineCategories(categories) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readwrite')
    const store = transaction.objectStore('categories')
    
    store.clear()
    categories.forEach(category => {
      store.put(category)
    })
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function addOfflineSale(sale) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales', 'readwrite')
    const store = transaction.objectStore('offline_sales')
    const request = store.add(sale)
    request.onsuccess = () => resolve(sale.id)
    request.onerror = () => reject(request.error)
  })
}

export async function getOfflineSales() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales', 'readonly')
    const store = transaction.objectStore('offline_sales')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function removeOfflineSale(saleId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_sales', 'readwrite')
    const store = transaction.objectStore('offline_sales')
    const request = store.delete(saleId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineProductStock(productId, variantId, cantidadVendida) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('products', 'readwrite')
    const store = transaction.objectStore('products')
    
    const request = store.get(productId)
    request.onsuccess = () => {
      const product = request.result
      if (!product || !product.variantes) {
        resolve()
        return
      }
      
      const newVariantes = product.variantes.map(v => {
        if (v.id === variantId) {
          return { ...v, stock: Math.max(0, (v.stock || 0) - cantidadVendida) }
        }
        return v
      })
      
      product.variantes = newVariantes
      const updateRequest = store.put(product)
      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = () => reject(updateRequest.error)
    }
    request.onerror = () => reject(request.error)
  })
}
