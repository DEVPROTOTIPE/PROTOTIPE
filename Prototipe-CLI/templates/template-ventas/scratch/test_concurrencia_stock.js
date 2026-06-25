/**
 * Script de Pruebas de Concurrencia de Stock en Local (Firestore runTransaction)
 * Ejecutar con: node scratch/test_concurrencia_stock.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, runTransaction, doc, getDoc, setDoc } from 'firebase/firestore'
import dotenv from 'dotenv'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// En lugar de escribir en 'products' que requiere autenticación admin,
// escribiremos y probaremos las transacciones en la colección 'users' o 'orders'
// la cual permite lecturas y escrituras públicas (allow read, write: if true).
const TEST_REF_ID = 'concurrency-test-doc'
const testDocRef = doc(db, 'users', TEST_REF_ID)

async function setupTestData() {
  console.log('Sembrando documento de prueba en Firestore (Colección publica "users")...')
  await setDoc(testDocRef, {
    nombre: 'Producto de Concurrencia Test',
    variantes: [
      { id: 'var-1', talla: 'M', color: 'Negro', stock: 10 }
    ],
    updatedAt: new Date()
  })
  console.log('Documento sembrado con stock inicial = 10 para variante "var-1"')
}

async function simulatePurchase(userId, purchaseQty) {
  try {
    console.log(`[User ${userId}] Iniciando transacción de compra (Cantidad a comprar: ${purchaseQty})...`)
    const result = await runTransaction(db, async (transaction) => {
      const pDoc = await transaction.get(testDocRef)
      if (!pDoc.exists()) {
        throw new Error('El documento no existe')
      }
      
      const data = pDoc.data()
      const variantes = [...data.variantes]
      const vIdx = variantes.findIndex(v => v.id === 'var-1')
      
      if (vIdx === -1) throw new Error('Variante no encontrada')
      
      const stockActual = variantes[vIdx].stock
      console.log(`[User ${userId}] Leyó stock actual = ${stockActual}`)
      
      if (stockActual < purchaseQty) {
        throw new Error(`Stock insuficiente. Intentó comprar ${purchaseQty}, pero solo quedan ${stockActual}`)
      }
      
      variantes[vIdx].stock = stockActual - purchaseQty
      transaction.update(testDocRef, {
        variantes,
        updatedAt: new Date()
      })
      
      return { success: true, stockRestante: variantes[vIdx].stock }
    })
    console.log(`[User ${userId}] Compra EXITOSA. Stock restante: ${result.stockRestante}`)
    return { userId, status: 'success', stockRestante: result.stockRestante }
  } catch (error) {
    console.error(`[User ${userId}] Compra RECHAZADA/ERROR: ${error.message}`)
    return { userId, status: 'failed', error: error.message }
  }
}

async function runTest() {
  await setupTestData()
  
  console.log('\n--- Iniciando solicitudes concurrentes simultáneas ---')
  
  // Ejecutamos 3 compras de forma paralela (simulando race condition en el backend)
  // El stock inicial es 10.
  // User 1 intenta comprar 4
  // User 2 intenta comprar 4
  // User 3 intenta comprar 4
  // Uno de los 3 debería fallar debido al límite de stock (4+4+4 = 12 > 10)
  const results = await Promise.all([
    simulatePurchase('1', 4),
    simulatePurchase('2', 4),
    simulatePurchase('3', 4)
  ])
  
  console.log('\n--- Resumen de Resultados ---')
  console.log(results)
  
  // Verificar stock final real en la base de datos
  const finalDoc = await getDoc(testDocRef)
  console.log('\nStock final en base de datos:', finalDoc.data().variantes[0].stock)
}

runTest().catch(console.error)
