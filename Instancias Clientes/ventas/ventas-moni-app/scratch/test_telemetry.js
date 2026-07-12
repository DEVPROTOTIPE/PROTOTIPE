import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const config = {
  apiKey: "AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]",
  authDomain: "prototipe-ecosistema-control.firebaseapp.com",
  projectId: "prototipe-ecosistema-control",
  storageBucket: "prototipe-ecosistema-control.firebasestorage.app",
  messagingSenderId: "703542009613",
  appId: "1:703542009613:web:00f9363de11a908c991a44"
}

// Inicializar la conexión secundaria en el entorno del test
const app = initializeApp(config, "centralDevAppTest")
const db = getFirestore(app)

async function runTest() {
  console.log("🚀 Iniciando prueba de escritura en Firestore Central (Prototipe)...")
  try {
    const reportRef = doc(db, "reportesBilling", "proyecto-cliente-saas_2026-06")
    
    await setDoc(reportRef, {
      clientId: "proyecto-cliente-saas",
      token: "proyecto-cliente-saas-dev-token-998822", // Token autorizado en /tokens
      periodo: "2026-06",
      totalVentas: 7850000,
      comisionPorcentaje: 1.5,
      comisionValor: 117750,
      updatedAt: new Date()
    })
    
    console.log("✅ ¡Conexión Exitosa! El reporte se guardó correctamente en el Firestore de Prototipe.")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error de escritura (posible fallo de reglas o conexión):", error.message)
    process.exit(1)
  }
}

runTest()
